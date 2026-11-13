/**
 * RankingSystem — nome do jogador e classificações.
 *
 * Tenta o ranking ONLINE (função /api/ranking na Vercel + Upstash Redis).
 * Se ela não existir (rodando com `npm run dev`) ou o banco ainda não estiver
 * conectado, usa um ranking LOCAL salvo neste navegador — o jogo nunca trava
 * por causa do ranking.
 *
 * Cada jogador = aparelho + nome: num mesmo computador, pessoas diferentes
 * (nomes diferentes) aparecem separadas; cada uma guarda só o seu melhor
 * resultado em cada classificação.
 */
import { readJSON, writeJSON } from './storage';

export type BoardId = 'time' | 'score' | 'palettes' | 'exploration';

export interface BoardInfo {
  id: BoardId;
  label: string;
  /** Título curto da aba. */
  tab: string;
  field: keyof RunResult;
  lowerIsBetter: boolean;
}

export const BOARDS: BoardInfo[] = [
  { id: 'time', tab: 'TEMPO', label: 'Menor tempo total', field: 'timeSec', lowerIsBetter: true },
  { id: 'score', tab: 'PONTOS', label: 'Mais pontos', field: 'score', lowerIsBetter: false },
  { id: 'palettes', tab: 'PALETAS', label: 'Mais paletas de cores', field: 'palettes', lowerIsBetter: false },
  { id: 'exploration', tab: 'EXPLORAÇÃO', label: 'Maior exploração', field: 'exploration', lowerIsBetter: false },
];

export interface RunResult {
  timeSec: number;
  score: number;
  palettes: number;
  exploration: number;
}

export interface BoardRow {
  name: string;
  value: number;
  me: boolean;
}

export interface RankingData {
  mode: 'online' | 'local';
  boards: Record<BoardId, BoardRow[]>;
  /** Posição do jogador atual em cada classificação (null = ainda não entrou). */
  me: Partial<Record<BoardId, number | null>>;
}

interface Player {
  deviceId: string;
  name: string | null;
}

interface LocalEntry extends RunResult {
  playerId: string;
  name: string;
}

const PLAYER_KEY = 'rare_platform_player';
const LOCAL_KEY = 'rare_platform_ranking_local';
const SENT_KEY = 'rare_platform_ranking_sent';
const API = 'api/ranking';
const TOP = 10;

/** Mesma regra do servidor: 2–16 letras, números, espaço, ponto, hífen ou sublinhado. */
export function cleanName(raw: string): string | null {
  const name = raw.normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, 16);
  return /^[\p{L}\p{N} ._-]{2,16}$/u.test(name) ? name : null;
}

function randomId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function slug(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  if (base) return base.slice(0, 40);
  // nomes sem letras latinas: um hash curto e estável
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.codePointAt(0)!) >>> 0;
  return h.toString(16);
}

class RankingSystem {
  private player: Player;

  constructor() {
    const saved = readJSON<Player>(PLAYER_KEY);
    this.player = { deviceId: saved?.deviceId ?? randomId(), name: saved?.name ?? null };
    writeJSON(PLAYER_KEY, this.player);
  }

  get name(): string | null {
    return this.player.name;
  }

  /** null = joga sem aparecer no ranking. */
  setName(name: string | null): void {
    this.player.name = name;
    writeJSON(PLAYER_KEY, this.player);
  }

  get playerId(): string | null {
    return this.player.name ? `${this.player.deviceId}-${slug(this.player.name)}` : null;
  }

  /** Já enviou o resultado desta partida? (identificada pelo início dela) */
  wasSent(runId: string): boolean {
    return readJSON<string>(SENT_KEY) === runId;
  }

  /**
   * Registra o resultado (uma vez por partida). Sempre guarda no ranking local
   * e tenta o online; devolve as classificações atualizadas.
   */
  async submit(runId: string, result: RunResult): Promise<RankingData | null> {
    const playerId = this.playerId;
    const name = this.player.name;
    if (!playerId || !name || this.wasSent(runId)) return null;
    writeJSON(SENT_KEY, runId);

    const clean: RunResult = {
      timeSec: Math.round(result.timeSec),
      score: Math.round(result.score),
      palettes: Math.round(result.palettes),
      exploration: Math.round(result.exploration),
    };
    this.saveLocal({ playerId, name, ...clean });

    const online = await this.request('POST', { playerId, name, ...clean });
    return online ?? this.localData();
  }

  /** Classificações atuais (online se disponível, senão locais). */
  async load(): Promise<RankingData> {
    const query = this.playerId ? `?player=${encodeURIComponent(this.playerId)}` : '';
    return (await this.request('GET', undefined, query)) ?? this.localData();
  }

  // ------------------------------------------------------------- online
  private async request(method: 'GET' | 'POST', body?: object, query = ''): Promise<RankingData | null> {
    try {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 6000);
      const res = await fetch(API + query, {
        method,
        headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      window.clearTimeout(timer);
      // em `npm run dev` não existe a função: o Vite devolve 404 ou HTML
      if (!res.ok || !(res.headers.get('content-type') ?? '').includes('application/json')) return null;
      const data = (await res.json()) as Omit<RankingData, 'mode'>;
      if (!data.boards) return null;
      return { mode: 'online', boards: data.boards, me: data.me ?? {} };
    } catch {
      return null;
    }
  }

  // -------------------------------------------------------------- local
  private saveLocal(entry: LocalEntry): void {
    const list = readJSON<LocalEntry[]>(LOCAL_KEY) ?? [];
    list.push(entry);
    writeJSON(LOCAL_KEY, list.slice(-300));
  }

  private localData(): RankingData {
    const list = readJSON<LocalEntry[]>(LOCAL_KEY) ?? [];
    const me = this.playerId;
    const boards = {} as Record<BoardId, BoardRow[]>;
    const ranks: RankingData['me'] = {};
    for (const board of BOARDS) {
      // melhor resultado de cada jogador nesta classificação
      const best = new Map<string, LocalEntry>();
      for (const e of list) {
        const prev = best.get(e.playerId);
        const better = !prev || (board.lowerIsBetter ? e[board.field] < prev[board.field] : e[board.field] > prev[board.field]);
        if (better) best.set(e.playerId, e);
      }
      const sorted = [...best.values()].sort((a, b) => (board.lowerIsBetter ? a[board.field] - b[board.field] : b[board.field] - a[board.field]));
      boards[board.id] = sorted.slice(0, TOP).map((e) => ({ name: e.name, value: e[board.field], me: e.playerId === me }));
      const pos = sorted.findIndex((e) => e.playerId === me);
      ranks[board.id] = me && pos >= 0 ? pos + 1 : null;
    }
    return { mode: 'local', boards, me: ranks };
  }
}

export const ranking = new RankingSystem();
export default ranking;
