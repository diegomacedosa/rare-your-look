/**
 * StorageManager — abstração sobre localStorage com fallback em memória
 * (modo privado, storage bloqueado etc.).
 */
const KEY = 'rare_player';
const VERSION = '1.0';

const memory = new Map();

function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memory.set(key, value);
  }
}

function safeRemove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    memory.delete(key);
  }
}

/** Próximo domingo (reset semanal do ranking), formato YYYY-MM-DD. */
export function nextWeeklyReset(from = new Date()) {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7));
  return d.toISOString().slice(0, 10);
}

export function createDefaultSave() {
  return {
    version: VERSION,
    playerName: '',
    avatar: null,
    totalPoints: 0,
    completedChallenges: [],
    bestScores: {},
    unlockedItems: [],
    badges: [],
    history: [],
    weeklyScore: 0,
    weeklyReset: nextWeeklyReset(),
    settings: { muted: false, bgmVolume: 0.35, sfxVolume: 0.7 },
  };
}

export const StorageManager = {
  load() {
    const raw = safeGet(KEY);
    if (!raw) return createDefaultSave();
    try {
      const data = JSON.parse(raw);
      const merged = { ...createDefaultSave(), ...data };
      merged.settings = { ...createDefaultSave().settings, ...(data.settings || {}) };
      // reset semanal do ranking
      if (new Date() >= new Date(merged.weeklyReset)) {
        merged.weeklyScore = 0;
        merged.weeklyReset = nextWeeklyReset();
      }
      return merged;
    } catch (err) {
      console.warn('[StorageManager] save corrompido, recriando.', err);
      return createDefaultSave();
    }
  },

  save(data) {
    safeSet(KEY, JSON.stringify(data));
  },

  clear() {
    safeRemove(KEY);
  },
};
