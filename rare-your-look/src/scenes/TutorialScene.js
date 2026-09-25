import '../styles/scenes/tutorial.css';
import gameState, { STATES } from '../core/GameState.js';
import audio from '../audio/AudioManager.js';
import bus, { EVENTS } from '../core/EventBus.js';
import { onAction, esc, qsa } from '../utils/dom.js';
import { Button, IconButton } from '../ui/components/Button.js';
import { AvatarRenderer } from '../systems/AvatarSystem.js';
import { CHARACTERS, getCharacter } from '../data/characters.js';
import { getProduct, productName } from '../data/products.js';
import { normalizeAvatar, SCENARIOS_BY_ID } from '../data/avatarOptions.js';
import { productArt } from '../ui/components/ProductCard.js';
import { prefersReducedMotion } from '../ui/transitions.js';

const STEP_DURATION = 5200;

/**
 * CENA 9 — TutorialScene (SPEC §4.2).
 * Cada personagem demonstra uma técnica: os passos aplicam produtos no
 * Canvas em tempo real, como uma "animação" de tutorial.
 */
export default class TutorialScene {
  static title = 'Tutoriais';

  #raf = 0;
  #timer = 0;

  async mount(root, params = {}) {
    this.root = root;
    this.character = getCharacter(params.characterId) ?? CHARACTERS[0];
    this.step = 0;
    this.playing = false;

    root.innerHTML = `
      <div class="scene__head">
        <div>
          <p class="eyebrow">Tutorial Room</p>
          <h1 data-autofocus>Tutoriais</h1>
          <p class="lead">Quatro pessoas, quatro jeitos de usar os mesmos produtos.</p>
        </div>
        ${Button({ label: 'Voltar', action: 'menu', variant: 'ghost', icon: 'back', size: 'sm' })}
      </div>

      <div class="tutorial">
        <aside class="tutorial__list" aria-label="Personagens">
          ${CHARACTERS.map((character) => `
            <button type="button" class="tutor-card" data-action="pick" data-character="${character.id}"
              aria-pressed="${character.id === this.character.id}">
              <span class="tutor-card__face stage ${SCENARIOS_BY_ID[character.avatar.scenario]?.css ?? 'bg-studio'}">
                <canvas data-thumb="${character.id}"></canvas>
              </span>
              <span class="tutor-card__info">
                <strong>${esc(character.name)}</strong>
                <span class="tiny">${esc(character.pronouns)}</span>
                <span class="tutor-card__tags">${character.tags.map((tag) => `<span class="chip">${esc(tag)}</span>`).join('')}</span>
                <span class="tiny">${esc(character.tutorial.title)}</span>
              </span>
            </button>`).join('')}
        </aside>

        <section class="tutorial__detail" data-detail></section>
      </div>`;

    this.detail = root.querySelector('[data-detail]');
    this.thumbs = CHARACTERS.map((character) => {
      const canvas = root.querySelector(`[data-thumb="${character.id}"]`);
      const renderer = new AvatarRenderer(canvas, { fixedWidth: 150 });
      renderer.render(normalizeAvatar(character.avatar), {}, { describe: true });
      return renderer;
    });

    this.#renderDetail();
    this.offAction = onAction(root, (action, target) => this.#handle(action, target));
  }

  #renderDetail() {
    const character = this.character;
    const tutorial = character.tutorial;

    this.detail.innerHTML = `
      <div class="tutorial__stage stage ${SCENARIOS_BY_ID[character.avatar.scenario]?.css ?? 'bg-studio'}">
        <canvas data-avatar></canvas>
      </div>

      <div class="tutorial__body">
        <p class="eyebrow">${esc(character.name)} · ${esc(character.pronouns)}</p>
        <h2>${esc(tutorial.title)}</h2>
        <p class="lead">${esc(tutorial.summary)}</p>
        <p class="tiny">${esc(character.bio)}</p>

        <ol class="tutorial__steps" data-steps>
          ${tutorial.steps.map((step, index) => `
            <li class="tutorial__step" data-step="${index}" aria-current="${index === this.step}">
              <span class="tutorial__step-num">${index + 1}</span>
              <span>${esc(step.text)}</span>
            </li>`).join('')}
        </ol>

        <div class="tutorial__controls cluster">
          ${IconButton({ icon: 'back', ariaLabel: 'Passo anterior', action: 'prev' })}
          ${Button({ label: this.playing ? 'Pausar' : 'Reproduzir', action: 'play', variant: 'primary', icon: this.playing ? 'close' : 'play' })}
          ${IconButton({ icon: 'arrow_right', ariaLabel: 'Próximo passo', action: 'next' })}
          ${IconButton({ icon: 'replay', ariaLabel: 'Recomeçar', action: 'restart' })}
        </div>

        <h3 class="tutorial__products-title">Produtos usados</h3>
        <ul class="tutorial__products" role="list">
          ${tutorial.products.map((id) => {
            const product = getProduct(id);
            return product ? `<li class="tutorial__product">
              ${productArt(product, 34)}
              <span><strong>${esc(product.shade)}</strong><span class="tiny"> ${esc(product.line)}</span></span>
            </li>` : '';
          }).join('')}
        </ul>
      </div>`;

    this.renderer?.destroy();
    this.renderer = new AvatarRenderer(this.detail.querySelector('[data-avatar]'));
    this.#applyStep(0, false);
  }

  /** Aplica o look do passo, animando a entrada do produto novo. */
  #applyStep(index, animate = true) {
    const steps = this.character.tutorial.steps;
    this.step = Math.max(0, Math.min(steps.length - 1, index));
    const step = steps[this.step];
    const avatar = normalizeAvatar(this.character.avatar);

    qsa(this.detail, '[data-step]').forEach((element) => {
      element.setAttribute('aria-current', String(Number(element.dataset.step) === this.step));
    });

    const target = { ...(step.intensity ?? {}) };
    const previous = this.step > 0 ? steps[this.step - 1].look : {};
    const newSlots = Object.keys(step.look).filter((slot) => previous[slot] !== step.look[slot]);

    cancelAnimationFrame(this.#raf);
    if (!animate || prefersReducedMotion() || !newSlots.length) {
      this.renderer.render(avatar, step.look, { intensity: target });
      return;
    }

    const start = performance.now();
    const draw = (now) => {
      const t = Math.min(1, (now - start) / 620);
      const intensity = { ...target };
      for (const slot of newSlots) intensity[slot] = (target[slot] ?? 1) * t;
      this.renderer.render(avatar, step.look, { intensity });
      if (t < 1) this.#raf = requestAnimationFrame(draw);
    };
    this.#raf = requestAnimationFrame(draw);
  }

  #setPlaying(playing) {
    this.playing = playing;
    clearTimeout(this.#timer);
    const button = this.detail.querySelector('[data-action="play"]');
    if (button) button.querySelector('span').textContent = playing ? 'Pausar' : 'Reproduzir';
    if (!playing) return;

    const advance = () => {
      if (!this.playing) return;
      const steps = this.character.tutorial.steps;
      if (this.step >= steps.length - 1) {
        this.#setPlaying(false);
        return;
      }
      this.#applyStep(this.step + 1);
      audio.playSFX('makeup_apply');
      this.#timer = setTimeout(advance, STEP_DURATION);
    };
    this.#timer = setTimeout(advance, STEP_DURATION);
  }

  #handle(action, target) {
    switch (action) {
      case 'menu':
        gameState.go(STATES.WELCOME);
        return;
      case 'pick': {
        this.#setPlaying(false);
        this.character = getCharacter(target.dataset.character);
        qsa(this.root, '[data-action="pick"]').forEach((card) => {
          card.setAttribute('aria-pressed', String(card.dataset.character === this.character.id));
        });
        audio.playSFX('menu_open');
        this.#renderDetail();
        bus.emit(EVENTS.ANNOUNCE, `Tutorial de ${this.character.name}: ${this.character.tutorial.title}.`);
        return;
      }
      case 'play':
        this.#setPlaying(!this.playing);
        audio.playSFX('menu_open');
        return;
      case 'next':
        this.#setPlaying(false);
        this.#applyStep(this.step + 1);
        audio.playSFX('makeup_apply');
        return;
      case 'prev':
        this.#setPlaying(false);
        this.#applyStep(this.step - 1);
        return;
      case 'restart':
        this.#setPlaying(false);
        this.#applyStep(0, false);
        return;
      default:
    }
  }

  shortcuts = {
    Escape: () => gameState.go(STATES.WELCOME),
    ArrowRight: () => this.#handle('next'),
    ArrowLeft: () => this.#handle('prev'),
  };

  unmount() {
    clearTimeout(this.#timer);
    cancelAnimationFrame(this.#raf);
    this.offAction?.();
    this.renderer?.destroy();
    this.thumbs?.forEach((renderer) => renderer.destroy());
  }
}
