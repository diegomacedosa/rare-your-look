import '../styles/scenes/reward.css';
import gameState, { STATES } from '../core/GameState.js';
import storage from '../core/StorageManager.js';
import audio from '../audio/AudioManager.js';
import bus, { EVENTS } from '../core/EventBus.js';
import { onAction, esc } from '../utils/dom.js';
import { Button } from '../ui/components/Button.js';
import { rewardArt } from '../ui/components/RewardArt.js';
import { icon } from '../ui/icons.js';
import { claim, pendingRewards } from '../systems/RewardSystem.js';
import { getReward, REWARD_TYPES, BADGES_BY_ID } from '../data/rewards.js';
import { CHALLENGES_BY_ID } from '../data/challenges.js';
import { prefersReducedMotion, pop } from '../ui/transitions.js';
import { createRng } from '../utils/random.js';

/** CENA 7 — RewardScene (SPEC §4.2): revelação com partículas suaves. */
export default class RewardScene {
  static title = 'Recompensa';

  #raf = 0;

  async mount(root) {
    this.root = root;
    this.queue = [...pendingRewards()];

    root.innerHTML = `
      <div class="reward" data-reward>
        <canvas class="reward__particles" data-particles aria-hidden="true"></canvas>
        <div class="reward__content" data-content></div>
      </div>`;

    this.content = root.querySelector('[data-content]');
    this.particles = root.querySelector('[data-particles]');
    this.offAction = onAction(root, (action) => this.#handle(action));

    this.#renderCurrent();
  }

  #renderCurrent() {
    const entry = this.queue[0];
    if (!entry) {
      this.#renderEmpty();
      return;
    }

    const isBadge = entry.kind === 'badge';
    const data = isBadge ? BADGES_BY_ID[entry.id] : getReward(entry.id);
    if (!data) {
      this.queue.shift();
      this.#renderCurrent();
      return;
    }

    const fromChallenge = Object.values(CHALLENGES_BY_ID).find((challenge) => challenge.rewardId === entry.id);
    const source = entry.source === 'points'
      ? 'Desbloqueado por pontuação'
      : entry.source === 'challenge'
        ? `Desbloqueado em “${fromChallenge?.name ?? 'um desafio'}”`
        : 'Nova conquista';

    this.content.innerHTML = `
      <p class="eyebrow">${this.queue.length > 1 ? `Recompensa 1 de ${this.queue.length}` : 'Recompensa'}</p>
      <h1 data-autofocus>${isBadge ? 'Novo distintivo!' : 'Item desbloqueado!'}</h1>

      <article class="reward__card anim-pop" data-card>
        <div class="reward__art">
          ${isBadge ? `<span class="reward__badge">${icon('medal', { className: 'reward__badge-icon' })}</span>` : rewardArt(data, 110)}
        </div>
        <h2 class="reward__name">${esc(data.name)}</h2>
        <p class="reward__desc">${esc(data.description)}</p>
        <p class="chip">${isBadge ? 'Distintivo' : REWARD_TYPES[data.type]?.label ?? 'Item'}</p>
        <p class="tiny">${esc(source)}</p>
      </article>

      <div class="cluster reward__actions">
        ${Button({ label: isBadge ? 'Guardar conquista' : 'Adicionar à Coleção', action: 'claim', variant: 'primary', size: 'lg', icon: 'plus', shortcut: 'Enter' })}
        ${Button({ label: 'Depois', action: 'later', variant: 'ghost' })}
      </div>`;

    audio.playSFX('reward_unlock');
    bus.emit(EVENTS.ANNOUNCE, `${isBadge ? 'Novo distintivo' : 'Item desbloqueado'}: ${data.name}.`);
    this.#burst();
  }

  #renderEmpty() {
    const player = storage.player;
    this.content.innerHTML = `
      <div class="empty-state">
        <span class="reward__badge">${icon('medal', { className: 'reward__badge-icon' })}</span>
        <h1 data-autofocus>Nada para abrir por aqui</h1>
        <p>Complete desafios para desbloquear produtos, cores, roupas e cenários.
           Você já tem ${player.unlockedItems.length} ${player.unlockedItems.length === 1 ? 'item' : 'itens'} na coleção.</p>
        <div class="cluster">
          ${Button({ label: 'Ver coleção', action: 'collection', variant: 'primary', icon: 'medal' })}
          ${Button({ label: 'Jogar desafios', action: 'challenges', variant: 'secondary', icon: 'play' })}
          ${Button({ label: 'Menu', action: 'menu', variant: 'ghost', icon: 'home' })}
        </div>
      </div>`;
  }

  /** Partículas suaves de revelação (rAF, respeitando redução de movimento). */
  #burst() {
    const canvas = this.particles;
    const rect = this.root.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(320, rect.width * dpr);
    canvas.height = Math.max(320, rect.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const rng = createRng(Date.now() % 9999);
    const colors = ['#C4929A', '#F0D5D8', '#D9B25E', '#FAF7F5'];
    const particles = Array.from({ length: prefersReducedMotion() ? 18 : 46 }, () => ({
      x: width / 2 + (rng() - 0.5) * width * 0.6,
      y: height * 0.55 + (rng() - 0.5) * 80,
      r: 2 + rng() * 6,
      vx: (rng() - 0.5) * 0.8,
      vy: -0.5 - rng() * 1.4,
      life: 1,
      decay: 0.004 + rng() * 0.006,
      color: colors[Math.floor(rng() * colors.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = false;
      for (const particle of particles) {
        if (particle.life <= 0) continue;
        alive = true;
        ctx.globalAlpha = Math.max(0, particle.life);
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fill();
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= particle.decay;
      }
      ctx.globalAlpha = 1;
      if (alive) this.#raf = requestAnimationFrame(draw);
    };

    cancelAnimationFrame(this.#raf);
    if (prefersReducedMotion()) {
      draw();
      cancelAnimationFrame(this.#raf);
      return;
    }
    this.#raf = requestAnimationFrame(draw);
  }

  #handle(action) {
    switch (action) {
      case 'claim': {
        const entry = this.queue.shift();
        if (entry) {
          claim(entry.id);
          audio.playSFX('points_earned');
          const card = this.content.querySelector('[data-card]');
          if (card) pop(card);
        }
        this.#renderCurrent();
        return;
      }
      case 'later':
        audio.playSFX('menu_open');
        gameState.go(STATES.WELCOME);
        return;
      case 'collection':
        gameState.go(STATES.COLLECTION);
        return;
      case 'challenges':
        gameState.go(STATES.CHALLENGE_SELECT);
        return;
      case 'menu':
        gameState.go(STATES.WELCOME);
        return;
      default:
    }
  }

  shortcuts = {
    Enter: () => this.#handle(this.queue.length ? 'claim' : 'collection'),
    Escape: () => gameState.go(STATES.WELCOME),
  };

  unmount() {
    cancelAnimationFrame(this.#raf);
    this.offAction?.();
  }
}
