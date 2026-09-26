import '../styles/scenes/result.css';
import gameState, { STATES } from '../core/GameState.js';
import storage from '../core/StorageManager.js';
import audio from '../audio/AudioManager.js';
import bus, { EVENTS } from '../core/EventBus.js';
import { onAction, esc } from '../utils/dom.js';
import { Button } from '../ui/components/Button.js';
import { RuleList } from '../ui/components/RuleItem.js';
import { toast } from '../ui/components/Toast.js';
import { icon } from '../ui/icons.js';
import { AvatarRenderer, createShareCard, shareLook } from '../systems/AvatarSystem.js';
import { resultMessage, maxScore } from '../systems/ScoringSystem.js';
import { rankingNeighborhood } from '../systems/RankingSystem.js';
import { getChallenge } from '../data/challenges.js';
import { normalizeAvatar, SCENARIOS_BY_ID } from '../data/avatarOptions.js';
import { levelFor } from '../data/rewards.js';
import { countUp } from '../ui/transitions.js';
import { formatPoints, plural } from '../utils/format.js';

/** CENA 6 — ResultScene (SPEC §4.2): pontuação, breakdown e ranking. */
export default class ResultScene {
  static title = 'Resultado';

  async mount(root, params = {}) {
    this.root = root;
    const session = gameState.session;
    this.result = session.result;
    this.challenge = getChallenge(params.challengeId ?? session.challengeId);

    if (!this.result || !this.challenge) {
      gameState.go(STATES.CHALLENGE_SELECT);
      return;
    }

    const player = storage.player;
    this.avatar = normalizeAvatar(player.avatar);
    this.look = session.look ?? {};
    const summary = session.summary ?? { newItems: [], newBadges: [], levelUp: null };
    const message = resultMessage(this.result, this.challenge);
    const ranking = rankingNeighborhood(player);
    const level = levelFor(player.totalPoints);
    const pending = player.pendingRewards.length;

    root.innerHTML = `
      <div class="result">
        <section class="result__stage stage ${SCENARIOS_BY_ID[this.avatar.scenario]?.css ?? 'bg-studio'}">
          <canvas data-avatar></canvas>
        </section>

        <section class="result__panel">
          <p class="eyebrow">${esc(this.challenge.name)}</p>
          <h1 data-autofocus>${esc(message.title)}</h1>
          <p class="lead">${esc(message.text)}</p>

          <div class="result__score card card--blush">
            <span class="result__score-value" data-score>0</span>
            <span class="result__score-label">pontos de ${maxScore(this.challenge)} possíveis</span>
          </div>

          <h2 class="result__subtitle">Como você pontuou</h2>
          <ul class="result__breakdown" role="list">
            ${this.result.breakdown.map((line) => `
              <li class="result__line" data-met="${line.met}">
                <span class="result__line-mark" aria-hidden="true">${icon(line.met ? 'check' : 'close')}</span>
                <span class="result__line-text">
                  ${esc(line.label)}
                  ${line.detail ? `<span class="tiny"> · ${esc(line.detail)}</span>` : ''}
                </span>
                <span class="result__line-points">${line.points ? `+${line.points}` : '—'}</span>
              </li>`).join('')}
          </ul>

          ${this.result.passed ? `
            <div class="result__extras">
              <p class="tiny">${summary.firstTime ? 'Primeira vez neste desafio — recompensa liberada!' : 'Rejogada: os pontos entram no total e no ranking da semana.'}</p>
              ${summary.levelUp ? `<p class="chip chip--success">Subiu para o nível ${summary.levelUp.level} · ${esc(summary.levelUp.title)}</p>` : ''}
              ${summary.newBadges.length ? `<p class="chip chip--success">${plural(summary.newBadges.length, 'novo distintivo', 'novos distintivos')}</p>` : ''}
            </div>` : ''}

          <h2 class="result__subtitle">Ranking da semana</h2>
          <div class="leaderboard" role="list">
            ${ranking.rows.map((row) => `
              <div class="leaderboard__row" role="listitem" data-me="${row.isPlayer}">
                <span class="leaderboard__pos">${row.position}º</span>
                <span>${esc(row.isPlayer ? `${player.nickname} (você)` : row.name)}</span>
                <span class="leaderboard__score">${formatPoints(row.score)} pts</span>
              </div>`).join('')}
          </div>
          <p class="tiny">Você está em ${ranking.position}º de ${ranking.total} nesta semana · nível ${level.level} (${esc(level.title)}).</p>

          <div class="result__actions cluster">
            ${pending ? Button({ label: 'Ver recompensa', action: 'reward', variant: 'primary', size: 'lg', icon: 'sparkle', shortcut: 'R' }) : ''}
            ${Button({ label: 'Jogar novamente', action: 'replay', variant: pending ? 'secondary' : 'primary', icon: 'replay', shortcut: 'J' })}
            ${Button({ label: 'Compartilhar look', action: 'share', variant: 'ghost', icon: 'share', shortcut: 'S' })}
            ${Button({ label: 'Menu', action: 'menu', variant: 'ghost', icon: 'home', shortcut: 'Esc' })}
          </div>
        </section>
      </div>`;

    this.renderer = new AvatarRenderer(root.querySelector('[data-avatar]'));
    this.renderer.render(this.avatar, this.look);

    countUp(root.querySelector('[data-score]'), {
      to: this.result.total,
      duration: 1000,
      format: (value) => formatPoints(value),
      onDone: () => {
        if (this.result.total > 0) audio.playSFX('points_earned');
      },
    });

    // as regras cumpridas, para fechar o ciclo de feedback
    const rulesHost = document.createElement('div');
    rulesHost.className = 'result__rules';
    rulesHost.innerHTML = `<h2 class="result__subtitle">Regras do desafio</h2>${RuleList(this.result.evaluation.all, { basePoints: this.challenge.pointsBase })}`;
    root.querySelector('.result__panel').insertBefore(rulesHost, root.querySelector('.result__actions'));

    this.offAction = onAction(root, (action, target) => this.#handle(action, target));
    bus.emit(EVENTS.ANNOUNCE, `${message.title} ${formatPoints(this.result.total)} pontos.`);
  }

  async #handle(action, target) {
    switch (action) {
      case 'reward':
        audio.playSFX('menu_open');
        gameState.go(STATES.REWARD);
        return;
      case 'replay':
        audio.playSFX('menu_open');
        gameState.go(STATES.CHALLENGE_INFO, { challengeId: this.challenge.id });
        return;
      case 'menu':
        gameState.go(STATES.WELCOME);
        return;
      case 'share':
        await this.#share(target);
        return;
      default:
    }
  }

  async #share(button) {
    button.disabled = true;
    try {
      const dataUrl = await createShareCard({
        avatar: this.avatar,
        look: this.look,
        title: this.challenge.name,
        subtitle: `${formatPoints(this.result.total)} pontos · Rare Your Look`,
      });
      const outcome = await shareLook(dataUrl, `rare-your-look-${this.challenge.id}.png`);
      audio.playSFX('look_share');
      if (outcome === 'downloaded') toast('Imagem salva nos downloads!', { variant: 'success', iconName: 'check' });
    } catch (error) {
      console.error('[Result] falha ao compartilhar', error);
      toast('Não consegui gerar a imagem agora.', { iconName: 'close' });
    } finally {
      button.disabled = false;
    }
  }

  shortcuts = {
    r: () => this.#handle('reward', null),
    j: () => this.#handle('replay', null),
    s: () => this.root.querySelector('[data-action="share"]')?.click(),
    Escape: () => gameState.go(STATES.WELCOME),
  };

  unmount() {
    this.offAction?.();
    this.renderer?.destroy();
  }
}
