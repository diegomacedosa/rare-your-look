/**
 * EventBus — pub/sub simples para comunicação desacoplada entre módulos.
 */
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(handler);
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
    this.listeners.get(event)?.delete(handler);
  }

  emit(event, payload) {
    this.listeners.get(event)?.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[EventBus] erro no handler de "${event}"`, err);
      }
    });
  }
}

export const bus = new EventBus();

export const EVENTS = {
  SCENE_CHANGE: 'scene:change',
  AVATAR_CHANGE: 'avatar:change',
  PRODUCT_APPLIED: 'studio:product-applied',
  CHALLENGE_START: 'challenge:start',
  CHALLENGE_COMPLETE: 'challenge:complete',
  TIMER_TICK: 'timer:tick',
  TIMER_END: 'timer:end',
  REWARD_UNLOCKED: 'reward:unlocked',
  BADGE_UNLOCKED: 'badge:unlocked',
  STATE_SAVED: 'state:saved',
  AUDIO_TOGGLE: 'audio:toggle',
};
