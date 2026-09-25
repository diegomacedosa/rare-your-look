/**
 * Rare Beauty: Rare Your Look — inicialização do jogo.
 *
 * Liga as três peças do núcleo:
 *   GameState (máquina de estados) → EventBus → SceneManager (carrega a cena)
 * e cuida do que é global: cabeçalho, áudio, configurações e aria-live.
 */
import './styles/tokens.css';
import './styles/reset.css';
import './styles/base.css';
import './styles/animations.css';
import './styles/components.css';

import bus, { EVENTS } from './core/EventBus.js';
import gameState, { STATES } from './core/GameState.js';
import { SceneManager } from './core/SceneManager.js';
import storage from './core/StorageManager.js';
import audio from './audio/AudioManager.js';
import { openModal } from './ui/components/Modal.js';
import { toast } from './ui/components/Toast.js';
import { ICONS } from './ui/icons.js';
import { formatPoints } from './utils/format.js';

/* ------------------------------------------------------------------ cenas */
const loaders = {
  [STATES.WELCOME]: () => import('./scenes/WelcomeScene.js'),
  [STATES.AVATAR]: () => import('./scenes/AvatarScene.js'),
  [STATES.CHALLENGE_SELECT]: () => import('./scenes/ChallengeSelectScene.js'),
  [STATES.CHALLENGE_INFO]: () => import('./scenes/ChallengeInfoScene.js'),
  [STATES.STUDIO]: () => import('./scenes/StudioScene.js'),
  [STATES.RESULT]: () => import('./scenes/ResultScene.js'),
  [STATES.REWARD]: () => import('./scenes/RewardScene.js'),
  [STATES.COLLECTION]: () => import('./scenes/CollectionScene.js'),
  [STATES.TUTORIAL]: () => import('./scenes/TutorialScene.js'),
  [STATES.PROFILE]: () => import('./scenes/ProfileScene.js'),
};

const sceneRoot = document.getElementById('scene-root');
const liveRegion = document.getElementById('live-region');
const scenes = new SceneManager(sceneRoot, loaders);

/* ------------------------------------------------------- eventos globais */
bus.on(EVENTS.STATE_CHANGE, ({ to, params }) => scenes.show(to, params));
bus.on('modal:open', () => {
  scenes.modalOpen = true;
});
bus.on('modal:close', () => {
  scenes.modalOpen = false;
});
bus.on(EVENTS.ANNOUNCE, (message) => announce(message));
bus.on(EVENTS.TOAST, ({ message, ...options }) => toast(message, options));
bus.on(EVENTS.PLAYER_UPDATED, updateHeader);
bus.on(EVENTS.LEVEL_UP, (level) => {
  audio.playSFX('level_up');
  toast(`Nível ${level.level} — ${level.title}!`, { variant: 'reward', iconName: 'star', duration: 3200 });
});

/** Fala com o leitor de tela sem mexer no layout. */
function announce(message) {
  if (!liveRegion || !message) return;
  liveRegion.textContent = '';
  window.setTimeout(() => {
    liveRegion.textContent = message;
  }, 60);
}

/* ----------------------------------------------------------- cabeçalho */
const headerPoints = document.querySelector('#header-points [data-points]');
const soundButton = document.getElementById('btn-sound');

function updateHeader() {
  if (headerPoints) headerPoints.textContent = formatPoints(storage.player.totalPoints);
}

function updateSoundButton() {
  const muted = storage.settings.muted;
  soundButton.innerHTML = muted ? ICONS.mute : ICONS.sound;
  soundButton.setAttribute('aria-pressed', String(muted));
  soundButton.setAttribute('aria-label', muted ? 'Ativar som' : 'Desativar som');
}

document.querySelector('[data-nav="welcome"]').addEventListener('click', () => {
  if (gameState.current === STATES.WELCOME) return;
  audio.playSFX('menu_open');
  gameState.go(STATES.WELCOME);
});

soundButton.addEventListener('click', () => {
  audio.unlock();
  audio.toggleMute();
  updateSoundButton();
  announce(storage.settings.muted ? 'Som desativado' : 'Som ativado');
});

const settingsButton = document.getElementById('btn-settings');
settingsButton.innerHTML = ICONS.settings;
settingsButton.addEventListener('click', openSettings);

/* --------------------------------------------------------- configurações */
function applySettings() {
  document.documentElement.classList.toggle('reduce-motion', storage.settings.reducedMotion);
}

function openSettings() {
  audio.playSFX('menu_open');
  const settings = storage.settings;
  openModal({
    title: 'Configurações',
    body: `
      <div class="stack">
        <div class="field">
          <label for="set-bgm">Volume da trilha</label>
          <input type="range" id="set-bgm" min="0" max="1" step="0.05" value="${settings.bgmVolume}" />
        </div>
        <div class="field">
          <label for="set-sfx">Volume dos efeitos</label>
          <input type="range" id="set-sfx" min="0" max="1" step="0.05" value="${settings.sfxVolume}" />
        </div>
        <label class="cluster" style="gap:12px">
          <input type="checkbox" id="set-motion" ${settings.reducedMotion ? 'checked' : ''} />
          <span>Reduzir animações</span>
        </label>
        <p class="tiny">Atalhos: use Tab para navegar e Enter para ativar. Cada tela mostra suas teclas.</p>
      </div>`,
    actions: [{ label: 'Fechar', value: 'close', variant: 'primary' }],
    onMount(modal) {
      modal.querySelector('#set-bgm').addEventListener('input', (event) => {
        audio.unlock();
        audio.setVolume('bgm', Number(event.target.value));
      });
      modal.querySelector('#set-sfx').addEventListener('change', (event) => {
        audio.unlock();
        audio.setVolume('sfx', Number(event.target.value));
        audio.playSFX('product_select');
      });
      modal.querySelector('#set-motion').addEventListener('change', (event) => {
        storage.saveSettings({ reducedMotion: event.target.checked });
        applySettings();
      });
    },
  });
}

/* --------------------------------------------------- áudio (autoplay) */
function unlockAudio() {
  audio.unlock();
  if (!storage.settings.muted) audio.playBGM();
  window.removeEventListener('pointerdown', unlockAudio);
  window.removeEventListener('keydown', unlockAudio);
}
window.addEventListener('pointerdown', unlockAudio);
window.addEventListener('keydown', unlockAudio);

/* ------------------------------------------------------------- boot */
applySettings();
updateHeader();
updateSoundButton();
gameState.go(STATES.WELCOME);
scenes.preload([STATES.CHALLENGE_SELECT, STATES.AVATAR]);

// útil para inspecionar o estado no console durante o desenvolvimento
if (import.meta.env?.DEV) {
  window.rare = { gameState, storage, audio, scenes, bus };
}
