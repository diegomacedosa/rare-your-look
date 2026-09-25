import '../styles/scenes/welcome.css';
import gameState, { STATES } from '../core/GameState.js';
import storage from '../core/StorageManager.js';
import audio from '../audio/AudioManager.js';
import bus, { EVENTS } from '../core/EventBus.js';
import { onAction } from '../utils/dom.js';
import { Button } from '../ui/components/Button.js';
import { AvatarRenderer } from '../systems/AvatarSystem.js';
import { normalizeAvatar, signatureLook, SCENARIOS_BY_ID } from '../data/avatarOptions.js';
import { nextChallengeFor } from '../systems/ChallengeSystem.js';
import { levelFor } from '../data/rewards.js';
import { formatPoints, plural } from '../utils/format.js';
import { stagger } from '../ui/transitions.js';

/**
 * CENA 1 — WelcomeScene (SPEC §4.2).
 * Logo, preview do avatar e o menu principal do jogo.
 */
export default class WelcomeScene {
  static title = 'Início';

  async mount(root) {
    this.root = root;
    const player = storage.player;
    const avatar = normalizeAvatar(player.avatar);
    const level = levelFor(player.totalPoints);
    const pending = player.pendingRewards.length;
    const isNew = !player.avatar;

    root.innerHTML = `
      <div class="welcome">
        <section class="welcome__hero anim-stagger">
          <p class="eyebrow">Rare Beauty</p>
          <h1 class="welcome__title" data-autofocus>Rare Your Look</h1>
          <p class="welcome__slogan">There’s no one way to be Rare.</p>
          <p class="lead">${isNew
            ? 'Crie seu avatar, receba desafios de maquiagem e monte looks do seu jeito.'
            : `Bem-vinda de volta. Nível ${level.level} · ${level.title} · ${formatPoints(player.totalPoints)} pontos.`}</p>

          ${pending ? `<div class="welcome__pending card card--blush">
            <p><strong>${plural(pending, 'recompensa', 'recompensas')}</strong> esperando para ser aberta.</p>
            ${Button({ label: 'Abrir agora', action: 'rewards', variant: 'primary', icon: 'sparkle', size: 'sm' })}
          </div>` : ''}

          <nav class="welcome__menu" aria-label="Menu principal">
            ${Button({ label: isNew ? 'Começar' : 'Jogar', action: 'play', variant: 'primary', size: 'lg', icon: 'play', shortcut: 'J' })}
            ${Button({ label: 'Desafios', action: 'challenges', variant: 'secondary', icon: 'grid', shortcut: 'D' })}
            ${Button({ label: 'Tutoriais', action: 'tutorials', variant: 'secondary', icon: 'hint', shortcut: 'T' })}
            ${Button({ label: 'Meu avatar', action: 'avatar', variant: 'ghost', icon: 'user', shortcut: 'A' })}
            ${Button({ label: 'Coleção', action: 'collection', variant: 'ghost', icon: 'medal', shortcut: 'C' })}
            ${Button({ label: 'Perfil e ranking', action: 'profile', variant: 'ghost', icon: 'trophy', shortcut: 'P' })}
          </nav>

          <p class="tiny welcome__hint">Protótipo acadêmico — progresso salvo neste navegador.</p>
        </section>

        <section class="welcome__stage stage ${SCENARIOS_BY_ID[avatar.scenario]?.css ?? 'bg-studio'}">
          <canvas data-avatar class="anim-float"></canvas>
        </section>
      </div>`;

    stagger(root.querySelector('.welcome__hero'));

    this.renderer = new AvatarRenderer(root.querySelector('[data-avatar]'));
    this.renderer.render(avatar, signatureLook(avatar));

    this.offAction = onAction(root, (action) => this.#handle(action));
  }

  #handle(action) {
    audio.playSFX('menu_open');
    const player = storage.player;

    switch (action) {
      case 'play': {
        if (!player.avatar) {
          bus.emit(EVENTS.ANNOUNCE, 'Vamos criar seu avatar primeiro.');
          gameState.go(STATES.AVATAR, { next: 'play' });
          return;
        }
        const challenge = nextChallengeFor(player);
        gameState.go(STATES.CHALLENGE_INFO, { challengeId: challenge.id });
        return;
      }
      case 'challenges':
        gameState.go(STATES.CHALLENGE_SELECT);
        return;
      case 'tutorials':
        gameState.go(STATES.TUTORIAL);
        return;
      case 'avatar':
        gameState.go(STATES.AVATAR);
        return;
      case 'collection':
        gameState.go(STATES.COLLECTION);
        return;
      case 'profile':
        gameState.go(STATES.PROFILE);
        return;
      case 'rewards':
        gameState.go(STATES.REWARD);
        return;
      default:
    }
  }

  shortcuts = {
    j: () => this.#handle('play'),
    d: () => this.#handle('challenges'),
    t: () => this.#handle('tutorials'),
    a: () => this.#handle('avatar'),
    c: () => this.#handle('collection'),
    p: () => this.#handle('profile'),
  };

  unmount() {
    this.offAction?.();
    this.renderer?.destroy();
  }
}
