/**
 * EventBus — pub/sub minimalista para comunicação entre módulos.
 * Mantém as cenas desacopladas dos sistemas (timer, pontuação, áudio, storage).
 */
class EventBus {
  #handlers = new Map();

  /**
   * Inscreve um handler. Devolve uma função de cancelamento — prática
   * para as cenas guardarem no unmount().
   * @param {string} event
   * @param {(payload: any) => void} handler
   * @returns {() => void}
   */
  on(event, handler) {
    if (!this.#handlers.has(event)) this.#handlers.set(event, new Set());
    this.#handlers.get(event).add(handler);
    return () => this.off(event, handler);
  }

  once(event, handler) {
    const off = this.on(event, (payload) => {
      off();
      handler(payload);
    });
    return off;
  }

  off(event, handler) {
    this.#handlers.get(event)?.delete(handler);
  }

  emit(event, payload) {
    const set = this.#handlers.get(event);
    if (!set) return;
    // cópia: um handler pode se desinscrever durante o emit
    for (const handler of [...set]) {
      try {
        handler(payload);
      } catch (error) {
        console.error(`[EventBus] erro no handler de "${event}"`, error);
      }
    }
  }

  clear(event) {
    if (event) this.#handlers.delete(event);
    else this.#handlers.clear();
  }
}

export const bus = new EventBus();
export default bus;

/** Eventos usados no jogo (documentação viva). */
export const EVENTS = Object.freeze({
  STATE_CHANGE: 'state:change',
  SCENE_MOUNTED: 'scene:mounted',
  ANNOUNCE: 'announce', // texto para o aria-live
  TOAST: 'toast',
  PLAYER_UPDATED: 'player:updated',
  LOOK_CHANGED: 'look:changed',
  RULE_MET: 'rule:met',
  SURPRISE: 'challenge:surprise',
  TIMER_TICK: 'timer:tick',
  TIMER_WARNING: 'timer:warning',
  TIMER_END: 'timer:end',
  POINTS_EARNED: 'points:earned',
  LEVEL_UP: 'level:up',
  REWARD_GRANTED: 'reward:granted',
  REWARD_CLAIMED: 'reward:claimed',
  BADGE_UNLOCKED: 'badge:unlocked',
  AUDIO_CHANGED: 'audio:changed',
});
