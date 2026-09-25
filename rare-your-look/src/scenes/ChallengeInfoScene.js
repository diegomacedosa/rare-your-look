import '../styles/scenes/challenge.css';
import gameState, { STATES } from '../core/GameState.js';
import storage from '../core/StorageManager.js';
import audio from '../audio/AudioManager.js';
import { onAction, esc } from '../utils/dom.js';
import { Button } from '../ui/components/Button.js';
import { RuleList } from '../ui/components/RuleItem.js';
import { icon, TYPE_ICONS } from '../ui/icons.js';
import { AvatarRenderer } from '../systems/AvatarSystem.js';
import { getChallenge, CHALLENGE_TYPES, DIFFICULTIES } from '../data/challenges.js';
import { availableProductsFor, ruleLabel, rollSurprise, nextChallengeFor } from '../systems/ChallengeSystem.js';
import { unlockedRewardIds } from '../systems/RewardSystem.js';
import { maxScore } from '../systems/ScoringSystem.js';
import { normalizeAvatar, signatureLook, SCENARIOS_BY_ID } from '../data/avatarOptions.js';
import { formatTime, plural, spokenTime } from '../utils/format.js';
import { getReward } from '../data/rewards.js';

/** CENA 4 — ChallengeInfoScene (SPEC §4.2): as regras em linguagem clara. */
export default class ChallengeInfoScene {
  static title = 'Regras do desafio';

  async mount(root, params = {}) {
    this.root = root;
    const player = storage.player;
    this.challenge = getChallenge(params.challengeId) ?? nextChallengeFor(player);

    const challenge = this.challenge;
    const type = CHALLENGE_TYPES[challenge.type];
    const difficulty = DIFFICULTIES[challenge.difficulty];
    const products = availableProductsFor(challenge, unlockedRewardIds(player));
    const avatar = normalizeAvatar(player.avatar);
    const reward = getReward(challenge.rewardId);
    const alreadyDone = player.completedChallenges.includes(challenge.id);

    const entries = challenge.rules.map((rule, index) => ({
      rule,
      label: ruleLabel(rule),
      isMain: index === 0,
      met: false,
    }));

    root.innerHTML = `
      <div class="challenge-info">
        <section class="challenge-info__main card">
          <header class="challenge-info__head">
            <span class="challenge-card__type">${icon(TYPE_ICONS[challenge.type])}${type.label} Challenge</span>
            <span class="diff-badge" data-level="${challenge.difficulty}">${difficulty.name}</span>
          </header>

          <h1 data-autofocus>${esc(challenge.name)}</h1>
          <p class="lead">${esc(challenge.brief)}</p>

          <h2 class="challenge-info__subtitle">Como pontuar</h2>
          ${RuleList(entries, { basePoints: challenge.pointsBase, showState: false })}

          <ul class="challenge-info__facts" role="list">
            <li>${icon('grid')} ${plural(products.length, 'produto disponível', 'produtos disponíveis')}</li>
            <li>${icon('clock')} ${challenge.timeLimit ? `Tempo: ${formatTime(challenge.timeLimit)}` : 'Sem limite de tempo'}</li>
            <li>${icon('star')} Até ${maxScore(challenge)} pontos</li>
            ${challenge.surprise ? `<li>${icon('sparkle')} Pode surgir uma regra surpresa no meio (+75 pts)</li>` : ''}
            ${reward ? `<li>${icon('medal')} ${alreadyDone ? 'Recompensa já desbloqueada' : `Recompensa: ${esc(reward.name)}`}</li>` : ''}
          </ul>

          ${challenge.timeLimit ? `<p class="tiny">Se o tempo acabar, o look é confirmado como está — você só perde os bônus de tempo. O relógio pausa se você trocar de aba ou abrir um aviso.</p>` : ''}

          <div class="cluster challenge-info__actions">
            ${Button({ label: 'Começar', action: 'start', variant: 'primary', size: 'lg', icon: 'play', shortcut: 'Enter' })}
            ${Button({ label: 'Escolher outro', action: 'back', variant: 'ghost' })}
          </div>
        </section>

        <section class="challenge-info__stage stage ${SCENARIOS_BY_ID[avatar.scenario]?.css ?? 'bg-studio'}">
          <canvas data-avatar></canvas>
          <p class="tiny challenge-info__stage-note">Seu avatar entra no estúdio com o rosto limpo.</p>
        </section>
      </div>`;

    this.renderer = new AvatarRenderer(root.querySelector('[data-avatar]'));
    this.renderer.render(avatar, signatureLook(avatar));

    this.offAction = onAction(root, (action) => this.#handle(action));
  }

  #handle(action) {
    if (action === 'start') {
      audio.playSFX('challenge_complete');
      gameState.startChallenge(this.challenge.id);
      // sorteia agora SE a partida terá regra surpresa; qual regra será,
      // o estúdio decide na hora, olhando o look em construção
      gameState.session.surprisePending = rollSurprise(this.challenge);
      gameState.go(STATES.STUDIO, { challengeId: this.challenge.id });
      return;
    }
    if (action === 'back') {
      audio.playSFX('menu_open');
      gameState.go(STATES.CHALLENGE_SELECT);
    }
  }

  shortcuts = {
    Enter: () => this.#handle('start'),
    Escape: () => this.#handle('back'),
  };

  unmount() {
    this.offAction?.();
    this.renderer?.destroy();
  }
}
