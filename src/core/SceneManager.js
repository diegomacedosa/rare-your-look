/**
 * SceneManager — troca de cenas com lazy loading (import dinâmico),
 * validação pela state machine e transições animadas.
 */
import { GameState } from './GameState.js';
import { swapScenes } from '../ui/transitions.js';

/** Classe base das cenas. */
export class Scene {
  constructor(ctx) {
    this.ctx = ctx; // { go, state, audio, bus }
    this.cleanups = [];
  }

  /** Deve retornar um HTMLElement. */
  render() {
    throw new Error('render() não implementado');
  }

  /** Chamado após a cena entrar no DOM. */
  onEnter() {}

  /** Registra função de limpeza (listeners, timers, rAF). */
  track(cleanup) {
    this.cleanups.push(cleanup);
    return cleanup;
  }

  destroy() {
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];
  }
}

const LOADERS = {
  welcome: () => import('../scenes/WelcomeScene.js'),
  avatar: () => import('../scenes/AvatarScene.js'),
  challengeSelect: () => import('../scenes/ChallengeSelectScene.js'),
  challengeInfo: () => import('../scenes/ChallengeInfoScene.js'),
  studio: () => import('../scenes/StudioScene.js'),
  result: () => import('../scenes/ResultScene.js'),
  reward: () => import('../scenes/RewardScene.js'),
  collection: () => import('../scenes/CollectionScene.js'),
  tutorial: () => import('../scenes/TutorialScene.js'),
  profile: () => import('../scenes/ProfileScene.js'),
};

const TRANSITION_BY_SCENE = {
  studio: 'bloom',
  reward: 'bloom',
  result: 'bloom',
};

export class SceneManager {
  constructor(root, ctx) {
    this.root = root;
    this.ctx = { ...ctx, go: (name, params) => this.go(name, params) };
    this.current = null;
    this.currentEl = null;
    this.busy = false;
    this.listeners = new Set();
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  async go(name, params = {}) {
    if (this.busy) return false;
    if (!LOADERS[name]) {
      console.error(`[SceneManager] cena desconhecida: ${name}`);
      return false;
    }
    if (!GameState.transition(name)) return false;

    this.busy = true;
    try {
      const mod = await LOADERS[name]();
      const SceneClass = mod.default;
      const scene = new SceneClass(this.ctx);
      const el = await scene.render(params);
      el.classList.add('scene', `scene--${name}`);
      el.dataset.scene = name;

      const prev = this.current;
      const prevEl = this.currentEl;
      this.current = scene;
      this.currentEl = el;

      prev?.destroy();
      await swapScenes(this.root, prevEl, el, TRANSITION_BY_SCENE[name]);
      scene.onEnter(params);

      // foco para leitores de tela
      const heading = el.querySelector('h1, h2');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
      this.listeners.forEach((fn) => fn(name));
      return true;
    } catch (err) {
      console.error(`[SceneManager] falha ao carregar "${name}"`, err);
      return false;
    } finally {
      this.busy = false;
    }
  }
}
