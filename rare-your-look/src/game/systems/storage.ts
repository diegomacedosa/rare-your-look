/**
 * localStorage com rede de segurança (herdado do StorageManager da v1):
 * se o navegador bloquear o storage (aba privada, cookies desligados),
 * o jogo segue com um armazenamento em memória.
 */

interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

class MemoryStore implements KeyValueStore {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

function pickStore(): KeyValueStore {
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

const store = pickStore();

export function readJSON<T>(key: string): T | null {
  try {
    const raw = store.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn('[Storage] não foi possível salvar', key, error);
  }
}

export function removeKey(key: string): void {
  try {
    store.removeItem(key);
  } catch {
    /* nada a fazer */
  }
}

// ------------------------------------------------------------ configurações
export interface Settings {
  music: boolean;
  sfx: boolean;
}

const SETTINGS_KEY = 'rare_platform_settings';

let settings: Settings = { music: true, sfx: true, ...(readJSON<Partial<Settings>>(SETTINGS_KEY) ?? {}) };

export function getSettings(): Readonly<Settings> {
  return settings;
}

export function saveSettings(patch: Partial<Settings>): Readonly<Settings> {
  settings = { ...settings, ...patch };
  writeJSON(SETTINGS_KEY, settings);
  return settings;
}
