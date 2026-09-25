import '../styles/scenes/challenge.css';
import gameState, { STATES } from '../core/GameState.js';
import storage from '../core/StorageManager.js';
import audio from '../audio/AudioManager.js';
import { onAction, esc } from '../utils/dom.js';
import { toast } from '../ui/components/Toast.js';
import { Button } from '../ui/components/Button.js';
import { icon, TYPE_ICONS } from '../ui/icons.js';
import { CHALLENGES, CHALLENGE_TYPES, DIFFICULTIES, getChallenge } from '../data/challenges.js';
import { challengeStatus, missingToUnlock } from '../systems/ChallengeSystem.js';
import { maxScore } from '../systems/ScoringSystem.js';
import { getReward } from '../data/rewards.js';
import { formatTime, plural } from '../utils/format.js';
import { stagger } from '../ui/transitions.js';

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: '1', label: 'Explore' },
  { id: '2', label: 'Express' },
  { id: '3', label: 'Rare Mode' },
];

/** CENA 3 — ChallengeSelectScene (SPEC §4.2). */
export default class ChallengeSelectScene {
  static title = 'Desafios';

  async mount(root) {
    this.root = root;
    this.filter = 'all';
    const player = storage.player;
    const done = player.completedChallenges.length;

    root.innerHTML = `
      <div class="scene__head">
        <div>
          <p class="eyebrow">Challenge Room</p>
          <h1 data-autofocus>Desafios</h1>
          <p class="lead">${done
            ? `${plural(done, 'desafio concluído', 'desafios concluídos')} de ${CHALLENGES.length}. A dificuldade abre conforme você avança.`
            : 'Comece pelos desafios Explore. Os modos Express e Rare Mode abrem conforme você conclui os primeiros.'}</p>
        </div>
        ${Button({ label: 'Voltar', action: 'menu', variant: 'ghost', icon: 'back', size: 'sm' })}
      </div>

      <div class="tabs" role="tablist" aria-label="Filtrar por dificuldade">
        ${FILTERS.map((filter) => `
          <button type="button" class="tab" role="tab" data-action="filter" data-filter="${filter.id}"
            aria-selected="${filter.id === this.filter}">${filter.label}</button>`).join('')}
      </div>

      <div class="challenge-grid anim-stagger" data-grid></div>`;

    this.grid = root.querySelector('[data-grid]');
    this.#renderGrid();
    this.offAction = onAction(root, (action, target) => this.#handle(action, target));
  }

  #renderGrid() {
    const player = storage.player;
    const list = CHALLENGES.filter((challenge) => this.filter === 'all' || String(challenge.difficulty) === this.filter);

    this.grid.innerHTML = list.map((challenge) => this.#card(challenge, player)).join('');
    stagger(this.grid);
  }

  #card(challenge, player) {
    const status = challengeStatus(challenge, player);
    const stats = player.challengeStats[challenge.id];
    const type = CHALLENGE_TYPES[challenge.type];
    const reward = getReward(challenge.rewardId);
    const locked = status === 'locked';

    return `
      <article class="challenge-card" data-status="${status}">
        <button type="button" class="challenge-card__button" data-action="open" data-challenge="${esc(challenge.id)}"
          ${locked ? 'aria-disabled="true"' : ''}
          aria-label="${esc(challenge.name)} — ${type.label}, ${DIFFICULTIES[challenge.difficulty].name}${locked ? ', bloqueado' : ''}">
          <header class="challenge-card__head">
            <span class="challenge-card__type">${icon(TYPE_ICONS[challenge.type])}${type.label}</span>
            <span class="diff-badge" data-level="${challenge.difficulty}">${DIFFICULTIES[challenge.difficulty].name}</span>
          </header>

          <h2 class="challenge-card__name">${esc(challenge.name)}</h2>
          <p class="challenge-card__brief">${esc(challenge.brief)}</p>

          <ul class="challenge-card__meta" role="list">
            <li class="chip">${plural(challenge.rules.length, 'regra', 'regras')}</li>
            ${challenge.timeLimit ? `<li class="chip chip--warning">${formatTime(challenge.timeLimit)}</li>` : ''}
            ${challenge.surprise ? '<li class="chip chip--warning">Surpresa</li>' : ''}
            <li class="chip">até ${maxScore(challenge)} pts</li>
          </ul>

          <footer class="challenge-card__foot">
            ${locked
              ? `<span class="challenge-card__state">${icon('lock')} Conclua mais ${missingToUnlock(challenge, player)}</span>`
              : status === 'completed'
                ? `<span class="challenge-card__state challenge-card__state--done">${icon('check')} Concluído · recorde ${stats?.best ?? 0} pts</span>`
                : `<span class="challenge-card__state">${icon('play')} Jogar</span>`}
            ${reward && !locked ? `<span class="tiny">Recompensa: ${esc(reward.name)}</span>` : ''}
          </footer>
        </button>
      </article>`;
  }

  #handle(action, target) {
    if (action === 'menu') {
      audio.playSFX('menu_open');
      gameState.go(STATES.WELCOME);
      return;
    }
    if (action === 'filter') {
      this.filter = target.dataset.filter;
      this.root.querySelectorAll('[data-action="filter"]').forEach((tab) => {
        tab.setAttribute('aria-selected', String(tab.dataset.filter === this.filter));
      });
      this.#renderGrid();
      audio.playSFX('menu_open');
      return;
    }
    if (action === 'open') {
      const challenge = getChallenge(target.dataset.challenge);
      const status = challengeStatus(challenge, storage.player);
      if (status === 'locked') {
        audio.playSFX('error');
        toast(`Conclua mais ${missingToUnlock(challenge, storage.player)} desafio(s) para abrir este.`, { iconName: 'lock' });
        return;
      }
      audio.playSFX('product_select');
      gameState.go(STATES.CHALLENGE_INFO, { challengeId: challenge.id });
    }
  }

  shortcuts = {
    Escape: () => gameState.go(STATES.WELCOME),
  };

  unmount() {
    this.offAction?.();
  }
}
