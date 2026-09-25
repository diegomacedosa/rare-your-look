/**
 * GameState — state machine central + store do jogador.
 *
 * - `phase`: estado atual da máquina (uma cena por estado).
 * - `player`: dados persistidos (StorageManager).
 * - `session`: dados voláteis da partida em andamento (desafio, look, resultado).
 */
import { bus, EVENTS } from './EventBus.js';
import { StorageManager, createDefaultSave } from './StorageManager.js';

export const PHASES = {
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
};

const MENU = [
  PHASES.WELCOME,
  PHASES.AVATAR,
  PHASES.CHALLENGE_SELECT,
  PHASES.COLLECTION,
  PHASES.TUTORIAL,
  PHASES.PROFILE,
];

/** Transições válidas: de → [para]. Cenas de menu são sempre alcançáveis fora do gameplay. */
const TRANSITIONS = {
  boot: [PHASES.WELCOME],
  [PHASES.WELCOME]: MENU,
  [PHASES.AVATAR]: MENU,
  [PHASES.CHALLENGE_SELECT]: [...MENU, PHASES.CHALLENGE_INFO],
  [PHASES.CHALLENGE_INFO]: [PHASES.CHALLENGE_SELECT, PHASES.STUDIO, PHASES.WELCOME],
  [PHASES.STUDIO]: [PHASES.RESULT, PHASES.CHALLENGE_SELECT, PHASES.WELCOME],
  [PHASES.RESULT]: [...MENU, PHASES.REWARD, PHASES.CHALLENGE_INFO],
  [PHASES.REWARD]: MENU,
  [PHASES.COLLECTION]: MENU,
  [PHASES.TUTORIAL]: MENU,
  [PHASES.PROFILE]: MENU,
};

class GameStateMachine {
  constructor() {
    this.phase = 'boot';
    this.player = StorageManager.load();
    this.session = null;
  }

  can(to) {
    return (TRANSITIONS[this.phase] || []).includes(to);
  }

  transition(to) {
    if (to === this.phase) return true;
    if (!this.can(to)) {
      console.warn(`[GameState] transição inválida: ${this.phase} → ${to}`);
      return false;
    }
    const from = this.phase;
    this.phase = to;
    bus.emit(EVENTS.SCENE_CHANGE, { from, to });
    return true;
  }

  // ---------- player ----------
  update(mutator) {
    mutator(this.player);
    this.persist();
  }

  persist() {
    StorageManager.save(this.player);
    bus.emit(EVENTS.STATE_SAVED, this.player);
  }

  reset() {
    StorageManager.clear();
    this.player = createDefaultSave();
    this.session = null;
  }

  // ---------- session ----------
  startSession(challenge, extras = {}) {
    this.session = {
      challengeId: challenge.id,
      look: {},
      appliedOrder: [],
      startedAt: Date.now(),
      surpriseRule: null,
      result: null,
      pendingRewards: [],
      ...extras,
    };
    return this.session;
  }

  endSession() {
    this.session = null;
  }
}

export const GameState = new GameStateMachine();
