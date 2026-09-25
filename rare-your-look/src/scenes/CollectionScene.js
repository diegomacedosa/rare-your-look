import '../styles/scenes/collection.css';
import gameState, { STATES } from '../core/GameState.js';
import storage from '../core/StorageManager.js';
import audio from '../audio/AudioManager.js';
import { onAction, esc, qsa } from '../utils/dom.js';
import { Button } from '../ui/components/Button.js';
import { BadgeCard } from '../ui/components/BadgeCard.js';
import { rewardArt } from '../ui/components/RewardArt.js';
import { icon } from '../ui/icons.js';
import { collectionEntries, badgeProgress, unlockHint } from '../systems/RewardSystem.js';
import { REWARD_TYPES } from '../data/rewards.js';
import { CHALLENGES_BY_ID } from '../data/challenges.js';
import { formatDate } from '../utils/format.js';
import { stagger } from '../ui/transitions.js';

const FILTERS = [
  { id: 'all', label: 'Tudo' },
  { id: 'product', label: 'Produtos' },
  { id: 'color', label: 'Cores' },
  { id: 'clothes', label: 'Roupas' },
  { id: 'accessory', label: 'Acessórios' },
  { id: 'scenario', label: 'Cenários' },
];

/** CENA 8 — CollectionScene (SPEC §4.2): acervo + distintivos. */
export default class CollectionScene {
  static title = 'Coleção';

  async mount(root) {
    this.root = root;
    this.filter = 'all';
    this.sort = 'recent';
    this.entries = collectionEntries();

    const unlocked = this.entries.filter((entry) => entry.unlocked).length;

    root.innerHTML = `
      <div class="scene__head">
        <div>
          <p class="eyebrow">Sua coleção</p>
          <h1 data-autofocus>Coleção</h1>
          <p class="lead">${unlocked} de ${this.entries.length} itens desbloqueados.</p>
        </div>
        ${Button({ label: 'Voltar', action: 'menu', variant: 'ghost', icon: 'back', size: 'sm' })}
      </div>

      <div class="collection__controls">
        <div class="tabs" role="tablist" aria-label="Filtrar por categoria">
          ${FILTERS.map((filter) => `
            <button type="button" class="tab" role="tab" data-action="filter" data-filter="${filter.id}"
              aria-selected="${filter.id === this.filter}">${filter.label}</button>`).join('')}
        </div>
        <label class="collection__sort">
          <span class="tiny">Ordenar</span>
          <select class="input" data-sort>
            <option value="recent">Desbloqueio mais recente</option>
            <option value="oldest">Mais antigo</option>
            <option value="name">Nome (A–Z)</option>
          </select>
        </label>
      </div>

      <div class="item-grid anim-stagger" data-grid></div>

      <section class="collection__badges">
        <h2>Distintivos</h2>
        <div class="badge-grid">
          ${badgeProgress().map((badge) => BadgeCard(badge)).join('')}
        </div>
      </section>`;

    this.grid = root.querySelector('[data-grid]');
    this.#renderGrid();

    this.offAction = onAction(root, (action, target) => this.#handle(action, target));
    this.sortEl = root.querySelector('[data-sort]');
    this.sortEl.addEventListener('change', () => {
      this.sort = this.sortEl.value;
      this.#renderGrid();
    });
  }

  #renderGrid() {
    let list = this.entries.filter((entry) => this.filter === 'all' || entry.type === this.filter);

    list = [...list].sort((a, b) => {
      if (this.sort === 'name') return a.name.localeCompare(b.name, 'pt-BR');
      const aTime = a.unlockedAt ? Date.parse(a.unlockedAt) : 0;
      const bTime = b.unlockedAt ? Date.parse(b.unlockedAt) : 0;
      if (this.sort === 'oldest') return (aTime || Infinity) - (bTime || Infinity);
      return bTime - aTime;
    });

    this.grid.innerHTML = list.length
      ? list.map((entry) => this.#card(entry)).join('')
      : '<p class="empty-state">Nada por aqui ainda nesta categoria.</p>';
    stagger(this.grid);
  }

  #card(entry) {
    return `
      <article class="item-card" data-unlocked="${entry.unlocked}">
        <div class="item-card__art">${rewardArt(entry, 76)}</div>
        <h3 class="item-card__name">${esc(entry.name)}</h3>
        <p class="tiny">${esc(REWARD_TYPES[entry.type]?.label ?? '')}</p>
        ${entry.unlocked
          ? `<p class="tiny">Desbloqueado em ${formatDate(entry.unlockedAt)}</p>`
          : entry.pending
            ? `<p class="chip chip--warning">${icon('sparkle')} Esperando você abrir</p>`
            : `<p class="tiny">${icon('lock')} ${esc(unlockHint(entry, CHALLENGES_BY_ID))}</p>`}
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
      qsa(this.root, '[data-action="filter"]').forEach((tab) => {
        tab.setAttribute('aria-selected', String(tab.dataset.filter === this.filter));
      });
      audio.playSFX('menu_open');
      this.#renderGrid();
    }
  }

  shortcuts = {
    Escape: () => gameState.go(STATES.WELCOME),
  };

  unmount() {
    this.offAction?.();
  }
}
