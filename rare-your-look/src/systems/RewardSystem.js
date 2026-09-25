/**
 * RewardSystem — pontos, desbloqueios, distintivos e níveis (SPEC §5.3).
 *
 * Fluxo: ao confirmar um look, `commitResult()` grava tudo no save e
 * coloca as novidades numa fila (`pendingRewards`). A RewardScene abre
 * essa fila; "Adicionar à Coleção" chama `claim()`. Assim, se a jogadora
 * sair antes de abrir a recompensa, ela não perde nada — o aviso
 * continua na tela inicial.
 */
import storage from '../core/StorageManager.js';
import bus, { EVENTS } from '../core/EventBus.js';
import { BADGES, REWARDS, getReward, levelFor } from '../data/rewards.js';

export const unlockedRewardIds = (player = storage.player) => player.unlockedItems.map((item) => item.id);

const isUnlocked = (player, id) => player.unlockedItems.some((item) => item.id === id);
const isPending = (player, id) => player.pendingRewards.some((item) => item.id === id);

function queueReward(player, id, source) {
  if (!id || isUnlocked(player, id) || isPending(player, id)) return false;
  player.pendingRewards.push({ id, kind: 'item', source, at: new Date().toISOString() });
  return true;
}

function queueBadge(player, id) {
  if (player.badges.some((badge) => badge.id === id)) return false;
  player.badges.push({ id, unlockedAt: new Date().toISOString() });
  player.pendingRewards.push({ id, kind: 'badge', source: 'badge', at: new Date().toISOString() });
  return true;
}

/** Verifica todos os distintivos e enfileira os novos. */
function evaluateBadges(player) {
  const unlocked = [];
  for (const badge of BADGES) {
    if (player.badges.some((b) => b.id === badge.id)) continue;
    if (badge.progress(player) >= badge.goal && queueBadge(player, badge.id)) unlocked.push(badge.id);
  }
  return unlocked;
}

/** Recompensas por marco de pontuação já atingidas. */
function queuePointMilestones(player) {
  const unlocked = [];
  for (const reward of REWARDS) {
    if (reward.unlock?.points == null) continue;
    if (player.totalPoints >= reward.unlock.points && queueReward(player, reward.id, 'points')) {
      unlocked.push(reward.id);
    }
  }
  return unlocked;
}

/**
 * Grava o resultado de uma partida.
 * @returns {{ pointsEarned:number, firstTime:boolean, newItems:string[], newBadges:string[], levelUp:object|null }}
 */
export function commitResult({ challenge, result }) {
  const levelBefore = levelFor(storage.player.totalPoints).level;
  const summary = { pointsEarned: result.total, firstTime: false, newItems: [], newBadges: [], levelUp: null };

  storage.update((player) => {
    player.stats.looksCreated += 1;

    const stat = player.challengeStats[challenge.id] ?? { plays: 0, best: 0, lastPlayedAt: null };
    stat.plays += 1;
    stat.lastPlayedAt = new Date().toISOString();
    stat.best = Math.max(stat.best, result.total);
    player.challengeStats[challenge.id] = stat;

    if (!result.passed) return;

    player.totalPoints += result.total;
    player.weeklyScore += result.total;

    summary.firstTime = !player.completedChallenges.includes(challenge.id);
    if (summary.firstTime) player.completedChallenges.push(challenge.id);

    if (challenge.type === 'mood') player.stats.moodCompleted += 1;
    if (challenge.type === 'color') player.stats.colorCompleted += 1;
    if (challenge.type === 'limited') player.stats.limitedCompleted += 1;
    if (challenge.timeLimit && result.withinTime) player.stats.timedCompleted += 1;
    if (result.surpriseRule && result.surpriseMet) player.stats.specialCompleted += 1;

    if (summary.firstTime && challenge.rewardId && queueReward(player, challenge.rewardId, 'challenge')) {
      summary.newItems.push(challenge.rewardId);
    }
    summary.newItems.push(...queuePointMilestones(player));
    summary.newBadges.push(...evaluateBadges(player));
  });

  const levelAfter = levelFor(storage.player.totalPoints);
  if (levelAfter.level > levelBefore) {
    summary.levelUp = levelAfter;
    bus.emit(EVENTS.LEVEL_UP, levelAfter);
  }
  if (result.total > 0) bus.emit(EVENTS.POINTS_EARNED, { points: result.total });
  if (summary.newItems.length || summary.newBadges.length) {
    bus.emit(EVENTS.REWARD_GRANTED, summary);
  }
  return summary;
}

/** Fila de recompensas ainda não abertas. */
export const pendingRewards = (player = storage.player) => player.pendingRewards ?? [];

/** "Adicionar à Coleção": tira da fila e registra no acervo. */
export function claim(entryId) {
  let claimed = null;
  storage.update((player) => {
    const index = player.pendingRewards.findIndex((entry) => entry.id === entryId);
    if (index === -1) return;
    const [entry] = player.pendingRewards.splice(index, 1);
    claimed = entry;
    if (entry.kind === 'item' && !isUnlocked(player, entry.id)) {
      player.unlockedItems.push({ id: entry.id, unlockedAt: new Date().toISOString() });
      // o Rare Collector conta itens — pode destravar agora
      evaluateBadges(player);
    }
  });
  if (claimed) bus.emit(EVENTS.REWARD_CLAIMED, claimed);
  return claimed;
}

/** Progresso de todos os distintivos (ProfileScene / CollectionScene). */
export function badgeProgress(player = storage.player) {
  return BADGES.map((badge) => {
    const owned = player.badges.find((b) => b.id === badge.id);
    const current = Math.min(badge.goal, badge.progress(player));
    return {
      ...badge,
      unlocked: Boolean(owned),
      unlockedAt: owned?.unlockedAt ?? null,
      current,
      ratio: badge.goal ? current / badge.goal : 0,
    };
  });
}

/** Catálogo completo com estado — usado na CollectionScene. */
export function collectionEntries(player = storage.player) {
  return REWARDS.map((reward) => {
    const owned = player.unlockedItems.find((item) => item.id === reward.id);
    const pending = player.pendingRewards.find((item) => item.id === reward.id);
    return {
      ...reward,
      unlocked: Boolean(owned),
      pending: Boolean(pending),
      unlockedAt: owned?.unlockedAt ?? null,
    };
  });
}

/** Texto curto explicando como desbloquear um item ainda fechado. */
export function unlockHint(reward, challengesById) {
  if (reward.unlock?.points != null) return `Desbloqueia com ${reward.unlock.points} pontos`;
  if (reward.unlock?.challenge) {
    const name = challengesById?.[reward.unlock.challenge]?.name ?? reward.unlock.challenge;
    return `Desbloqueia ao concluir “${name}”`;
  }
  return 'Continue jogando para desbloquear';
}
