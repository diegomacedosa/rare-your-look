import bus, { EVENTS } from './EventBus.js';

/**
 * StorageManager — abstração sobre o localStorage (SPEC §9).
 * Se o navegador bloquear o storage (aba privada, cookies desligados),
 * cai para um armazenamento em memória e o jogo continua funcionando.
 */

const PLAYER_KEY = 'rare_player';
const SETTINGS_KEY = 'rare_settings';
const VERSION = '1.0';

/** Data (YYYY-MM-DD local) da próxima segunda-feira — reset do ranking semanal. */
export function nextMonday(from = new Date()) {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const daysUntilMonday = (8 - d.getDay()) % 7 || 7; // domingo=0 … segunda=1
  d.setDate(d.getDate() + daysUntilMonday);
  return toISODate(d);
}

export function toISODate(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function defaultPlayer() {
  return {
    version: VERSION,
    nickname: 'Rare Player',
    avatar: null, // preenchido na AvatarScene
    totalPoints: 0,
    completedChallenges: [],
    challengeStats: {}, // id → { plays, best, lastPlayedAt }
    unlockedItems: [], // [{ id, unlockedAt }]
    badges: [], // [{ id, unlockedAt }]
    pendingRewards: [], // recompensas ainda não abertas na RewardScene
    stats: {
      looksCreated: 0,
      moodCompleted: 0,
      colorCompleted: 0,
      limitedCompleted: 0,
      timedCompleted: 0,
      specialCompleted: 0,
    },
    weeklyScore: 0,
    weeklyReset: nextMonday(),
    createdAt: new Date().toISOString(),
  };
}

export function defaultSettings() {
  return { bgmVolume: 0.4, sfxVolume: 0.8, muted: false, reducedMotion: false };
}

class MemoryStore {
  #map = new Map();
  getItem(k) {
    return this.#map.has(k) ? this.#map.get(k) : null;
  }
  setItem(k, v) {
    this.#map.set(k, String(v));
  }
  removeItem(k) {
    this.#map.delete(k);
  }
}

function pickStore() {
  try {
    const probe = '__rare_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    console.warn('[Storage] localStorage indisponível — progresso só nesta sessão.');
    return new MemoryStore();
  }
}

class StorageManager {
  #store = pickStore();
  #player = null;
  #settings = null;

  /** Player atual (carrega na primeira chamada). */
  get player() {
    if (!this.#player) this.#player = this.#read();
    return this.#player;
  }

  #read() {
    let data = null;
    try {
      const raw = this.#store.getItem(PLAYER_KEY);
      if (raw) data = JSON.parse(raw);
    } catch (error) {
      console.warn('[Storage] save corrompido, recomeçando', error);
    }
    const player = { ...defaultPlayer(), ...(data ?? {}) };
    player.stats = { ...defaultPlayer().stats, ...(data?.stats ?? {}) };
    return this.#applyWeeklyReset(player);
  }

  /** Zera a pontuação semanal quando a semana vira (SPEC §9). */
  #applyWeeklyReset(player) {
    const today = toISODate(new Date());
    if (!player.weeklyReset || today >= player.weeklyReset) {
      player.weeklyScore = 0;
      player.weeklyReset = nextMonday();
    }
    return player;
  }

  save(player = this.#player) {
    this.#player = player;
    try {
      this.#store.setItem(PLAYER_KEY, JSON.stringify(player));
    } catch (error) {
      console.warn('[Storage] não foi possível salvar', error);
    }
    bus.emit(EVENTS.PLAYER_UPDATED, player);
    return player;
  }

  /**
   * Atualiza o player com uma função mutadora e salva.
   * @param {(player: object) => void} mutate
   */
  update(mutate) {
    const player = this.player;
    mutate(player);
    return this.save(player);
  }

  // ------------------------------------------------------------ settings
  get settings() {
    if (!this.#settings) {
      let data = null;
      try {
        const raw = this.#store.getItem(SETTINGS_KEY);
        if (raw) data = JSON.parse(raw);
      } catch {
        /* usa o padrão */
      }
      this.#settings = { ...defaultSettings(), ...(data ?? {}) };
    }
    return this.#settings;
  }

  saveSettings(patch = {}) {
    this.#settings = { ...this.settings, ...patch };
    try {
      this.#store.setItem(SETTINGS_KEY, JSON.stringify(this.#settings));
    } catch {
      /* segue com o valor em memória */
    }
    return this.#settings;
  }

  /** Apaga o progresso (usado no perfil, com confirmação). */
  reset() {
    this.#store.removeItem(PLAYER_KEY);
    this.#player = defaultPlayer();
    return this.save(this.#player);
  }

  // --------------------------------------------------------- consultas
  hasItem(id) {
    return this.player.unlockedItems.some((item) => item.id === id);
  }

  hasBadge(id) {
    return this.player.badges.some((badge) => badge.id === id);
  }

  hasCompleted(challengeId) {
    return this.player.completedChallenges.includes(challengeId);
  }
}

export const storage = new StorageManager();
export default storage;
