import bus, { EVENTS } from './EventBus.js';

/**
 * GameState — state machine central do jogo (SPEC §2.1).
 * Cada estado corresponde a uma cena; a máquina valida as transições
 * possíveis e publica `state:change`, que o SceneManager escuta.
 */

export const STATES = Object.freeze({
  BOOT: 'boot',
  WELCOME: 'welcome',
  AVATAR: 'avatar',
  CHALLENGE_SELECT: 'challengeSelect',
  CHALLENGE_INFO: 'challengeInfo',
  STUDIO: 'studio',
  RESULT: 'result',
  REWARD: 'reward',
  COLLECTION: 'collection',
  TUTORIAL: 'tutorial',
  PROFILE: 'profile',
});

/** Fluxo principal do SPEC §4.1 traduzido em transições permitidas. */
const TRANSITIONS = Object.freeze({
  boot: ['welcome'],
  welcome: ['avatar', 'challengeSelect', 'challengeInfo', 'collection', 'tutorial', 'profile', 'reward'],
  avatar: ['welcome', 'challengeSelect', 'challengeInfo', 'profile'],
  challengeSelect: ['welcome', 'challengeInfo', 'avatar'],
  challengeInfo: ['welcome', 'challengeSelect', 'studio'],
  studio: ['welcome', 'result', 'challengeInfo', 'challengeSelect'],
  result: ['welcome', 'reward', 'challengeInfo', 'challengeSelect', 'collection'],
  reward: ['welcome', 'collection', 'challengeSelect', 'result'],
  collection: ['welcome', 'profile', 'reward'],
  tutorial: ['welcome'],
  profile: ['welcome', 'avatar', 'collection'],
});

function emptySession() {
  return {
    challengeId: null,
    /** look em construção: { slot: productId } */
    look: {},
    /** regra surpresa sorteada para esta partida (ou null) */
    surprise: null,
    surpriseRevealed: false,
    startedAt: 0,
    finishedAt: 0,
    timeLeft: null,
    result: null,
  };
}

class GameStateMachine {
  current = STATES.BOOT;
  history = [];
  session = emptySession();

  /** @param {string} to */
  can(to) {
    return (TRANSITIONS[this.current] ?? []).includes(to);
  }

  /**
   * Muda de estado. Retorna false (e avisa no console) se a transição
   * não existir no fluxo — evita cenas "soltas" no protótipo.
   */
  go(to, params = {}) {
    if (!Object.values(STATES).includes(to)) {
      console.warn(`[GameState] estado desconhecido: ${to}`);
      return false;
    }
    if (!this.can(to)) {
      console.warn(`[GameState] transição inválida: ${this.current} → ${to}`);
      return false;
    }
    const from = this.current;
    this.history.push(from);
    if (this.history.length > 20) this.history.shift();
    this.current = to;
    bus.emit(EVENTS.STATE_CHANGE, { from, to, params });
    return true;
  }

  /** Volta ao estado anterior (ou ao fallback, se não for permitido). */
  back(fallback = STATES.WELCOME) {
    const previous = this.history.pop();
    const target = previous && this.can(previous) ? previous : fallback;
    return this.go(target);
  }

  // ---------------------------------------------------------------- sessão
  /** Inicia uma partida: zera o look, timer e resultado. */
  startChallenge(challengeId, surprise = null) {
    this.session = { ...emptySession(), challengeId, surprise, startedAt: Date.now() };
    return this.session;
  }

  setLook(look) {
    this.session.look = look;
    bus.emit(EVENTS.LOOK_CHANGED, { look });
  }

  setResult(result) {
    this.session.result = result;
    this.session.finishedAt = Date.now();
  }

  resetSession() {
    this.session = emptySession();
  }
}

export const gameState = new GameStateMachine();
export default gameState;
