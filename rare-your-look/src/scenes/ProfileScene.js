import '../styles/scenes/profile.css';
import gameState, { STATES } from '../core/GameState.js';
import storage from '../core/StorageManager.js';
import audio from '../audio/AudioManager.js';
import bus, { EVENTS } from '../core/EventBus.js';
import { onAction, esc } from '../utils/dom.js';
import { Button } from '../ui/components/Button.js';
import { BadgeCard } from '../ui/components/BadgeCard.js';
import { confirmModal } from '../ui/components/Modal.js';
import { toast } from '../ui/components/Toast.js';
import { AvatarRenderer } from '../systems/AvatarSystem.js';
import { badgeProgress } from '../systems/RewardSystem.js';
import { weeklyRanking } from '../systems/RankingSystem.js';
import { levelFor } from '../data/rewards.js';
import { CHALLENGES } from '../data/challenges.js';
import { normalizeAvatar, signatureLook, SCENARIOS_BY_ID } from '../data/avatarOptions.js';
import { formatPoints } from '../utils/format.js';

/** CENA 10 — ProfileScene (SPEC §4.2): estatísticas, nível e ranking semanal. */
export default class ProfileScene {
  static title = 'Perfil';

  async mount(root, params = {}) {
    this.root = root;
    const player = storage.player;
    const avatar = normalizeAvatar(player.avatar);
    const level = levelFor(player.totalPoints);
    const ranking = weeklyRanking(player);
    const badges = badgeProgress(player);

    root.innerHTML = `
      <div class="scene__head">
        <div>
          <p class="eyebrow">Meu perfil</p>
          <h1 data-autofocus>${esc(player.nickname)}</h1>
          <p class="lead">Nível ${level.level} · ${esc(level.title)}${level.next
            ? ` · faltam ${formatPoints(level.toNext)} pontos para o nível ${level.next.level}`
            : ' · nível máximo'}</p>
        </div>
        ${Button({ label: 'Voltar', action: 'menu', variant: 'ghost', icon: 'back', size: 'sm' })}
      </div>

      <div class="profile">
        <section class="profile__card card">
          <div class="profile__stage stage ${SCENARIOS_BY_ID[avatar.scenario]?.css ?? 'bg-studio'}">
            <canvas data-avatar></canvas>
          </div>
          <div class="field">
            <label for="nickname">Como quer ser chamada no ranking?</label>
            <input class="input" id="nickname" maxlength="18" value="${esc(player.nickname)}" data-nickname />
          </div>
          <div class="cluster">
            ${Button({ label: 'Salvar nome', action: 'save-name', variant: 'secondary', icon: 'check', size: 'sm' })}
            ${Button({ label: 'Editar avatar', action: 'edit-avatar', variant: 'primary', icon: 'edit', size: 'sm' })}
          </div>

          <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100"
               aria-valuenow="${Math.round(level.progress * 100)}" aria-label="Progresso até o próximo nível">
            <div class="progress__fill" style="width:${(level.progress * 100).toFixed(1)}%"></div>
          </div>
        </section>

        <section class="profile__stats">
          <div class="stat-grid">
            <div class="stat"><span class="stat__value">${player.completedChallenges.length}/${CHALLENGES.length}</span><span class="stat__label">Desafios concluídos</span></div>
            <div class="stat"><span class="stat__value">${player.badges.length}</span><span class="stat__label">Distintivos</span></div>
            <div class="stat"><span class="stat__value">${player.unlockedItems.length}</span><span class="stat__label">Itens na coleção</span></div>
            <div class="stat"><span class="stat__value">${formatPoints(player.totalPoints)}</span><span class="stat__label">Pontos totais</span></div>
            <div class="stat"><span class="stat__value">${formatPoints(player.weeklyScore)}</span><span class="stat__label">Pontos desta semana</span></div>
            <div class="stat"><span class="stat__value">${player.stats.looksCreated}</span><span class="stat__label">Looks criados</span></div>
          </div>

          <section class="profile__ranking" id="ranking" tabindex="-1">
            <h2>Ranking semanal</h2>
            <p class="tiny">Você está em ${ranking.position}º lugar. O ranking zera toda segunda-feira
              (jogadoras simuladas — o protótipo não tem servidor).</p>
            <div class="leaderboard" role="list">
              ${ranking.rows.slice(0, 10).map((row) => this.#row(row, player)).join('')}
              ${ranking.position > 10 ? `<div class="leaderboard__row" role="listitem" data-me="true">
                  <span class="leaderboard__pos">${ranking.position}º</span>
                  <span>${esc(player.nickname)} (você)</span>
                  <span class="leaderboard__score">${formatPoints(player.weeklyScore)} pts</span>
                </div>` : ''}
            </div>
          </section>
        </section>
      </div>

      <section class="profile__badges">
        <h2>Distintivos</h2>
        <div class="badge-grid">${badges.map((badge) => BadgeCard(badge)).join('')}</div>
      </section>

      <div class="profile__danger">
        ${Button({ label: 'Ver coleção', action: 'collection', variant: 'ghost', icon: 'medal', size: 'sm' })}
        ${Button({ label: 'Apagar progresso', action: 'reset', variant: 'ghost', size: 'sm' })}
      </div>`;

    this.renderer = new AvatarRenderer(root.querySelector('[data-avatar]'));
    this.renderer.render(avatar, signatureLook(avatar));

    this.offAction = onAction(root, (action) => this.#handle(action));

    if (params.section === 'ranking') {
      root.querySelector('#ranking')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  #row(row, player) {
    return `
      <div class="leaderboard__row" role="listitem" data-me="${row.isPlayer}">
        <span class="leaderboard__pos">${row.position}º</span>
        <span>${esc(row.isPlayer ? `${player.nickname} (você)` : row.name)}</span>
        <span class="leaderboard__score">${formatPoints(row.score)} pts</span>
      </div>`;
  }

  async #handle(action) {
    switch (action) {
      case 'menu':
        audio.playSFX('menu_open');
        gameState.go(STATES.WELCOME);
        return;
      case 'edit-avatar':
        gameState.go(STATES.AVATAR, { from: 'profile' });
        return;
      case 'collection':
        gameState.go(STATES.COLLECTION);
        return;
      case 'save-name': {
        const value = this.root.querySelector('[data-nickname]').value.trim().slice(0, 18);
        storage.update((player) => {
          player.nickname = value || 'Rare Player';
        });
        audio.playSFX('product_select');
        toast('Nome atualizado!', { variant: 'success', iconName: 'check' });
        bus.emit(EVENTS.ANNOUNCE, 'Nome atualizado.');
        return;
      }
      case 'reset': {
        const confirmed = await confirmModal({
          title: 'Apagar todo o progresso?',
          body: '<p class="tiny">Pontos, desafios concluídos, coleção e avatar voltam ao início. Não dá para desfazer.</p>',
          confirmLabel: 'Apagar tudo',
          cancelLabel: 'Manter',
          danger: true,
        });
        if (!confirmed) return;
        storage.reset();
        toast('Progresso apagado.', { iconName: 'replay' });
        gameState.go(STATES.WELCOME);
        return;
      }
      default:
    }
  }

  shortcuts = {
    Escape: () => gameState.go(STATES.WELCOME),
  };

  unmount() {
    this.offAction?.();
    this.renderer?.destroy();
  }
}
