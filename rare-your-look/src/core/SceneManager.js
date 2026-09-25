import bus, { EVENTS } from './EventBus.js';
import { sceneIn, sceneOut } from '../ui/transitions.js';

/**
 * SceneManager — monta/desmonta cenas dentro do #scene-root.
 * As cenas são carregadas sob demanda (`import()` dinâmico), então o Vite
 * gera um chunk por cena: só baixa o que o jogador realmente abre (SPEC §11).
 *
 * Contrato de uma cena:
 *   export default class Scene {
 *     static title = 'Título da aba';
 *     async mount(el, params) {}
 *     unmount() {}
 *     shortcuts = { j: () => {} }   // opcional
 *   }
 */
export class SceneManager {
  #queue = Promise.resolve();

  constructor(root, loaders) {
    this.root = root;
    this.loaders = loaders;
    this.current = null;
    this.currentEl = null;
    this.currentName = null;
    this.modalOpen = false;

    document.addEventListener('keydown', this.#onKeyDown);
  }

  /** Troca de cena. Chamadas em sequência são serializadas. */
  show(name, params = {}) {
    this.#queue = this.#queue.then(() => this.#swap(name, params)).catch((error) => {
      console.error(`[SceneManager] falha ao abrir a cena "${name}"`, error);
      this.root.innerHTML = `<section class="scene"><div class="card center stack">
        <h1>Ops, algo saiu do lugar</h1>
        <p class="muted">Não conseguimos abrir esta tela. Recarregue a página para continuar.</p>
      </div></section>`;
    });
    return this.#queue;
  }

  async #swap(name, params) {
    const loader = this.loaders[name];
    if (!loader) throw new Error(`Cena não registrada: ${name}`);

    // Começa a baixar o chunk enquanto a cena atual sai de tela.
    const modulePromise = loader();

    if (this.current) {
      await sceneOut(this.currentEl);
      try {
        this.current.unmount?.();
      } catch (error) {
        console.error(`[SceneManager] erro no unmount de "${this.currentName}"`, error);
      }
      this.currentEl.remove();
      this.current = null;
    }

    const module = await modulePromise;
    const SceneClass = module.default;

    const el = document.createElement('section');
    el.className = `scene scene--${name}`;
    this.root.appendChild(el);

    const scene = new SceneClass();
    await scene.mount(el, params);

    this.current = scene;
    this.currentEl = el;
    this.currentName = name;
    document.title = SceneClass.title
      ? `${SceneClass.title} · Rare Your Look`
      : 'Rare Beauty: Rare Your Look';

    sceneIn(el);
    this.#focusHeading(el);
    bus.emit(EVENTS.SCENE_MOUNTED, { name, params });
  }

  /** Leva o foco ao título da cena — leitores de tela anunciam a nova tela. */
  #focusHeading(el) {
    const target = el.querySelector('[data-autofocus]') ?? el.querySelector('h1');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }

  /** Pré-carrega chunks de cenas prováveis (ocioso, sem bloquear). */
  preload(names = []) {
    const run = () => names.forEach((name) => this.loaders[name]?.());
    if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 2500 });
    else setTimeout(run, 1200);
  }

  #onKeyDown = (event) => {
    if (this.modalOpen) return;
    const tag = event.target?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || event.target?.isContentEditable) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const shortcuts = this.current?.shortcuts;
    if (!shortcuts) return;
    const handler = shortcuts[event.key] ?? shortcuts[event.key.toLowerCase()];
    if (typeof handler === 'function') {
      event.preventDefault();
      handler(event);
    }
  };
}

export default SceneManager;
