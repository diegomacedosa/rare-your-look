/**
 * ProgressSystem — estado da partida + persistência em localStorage (SPEC §38).
 *
 * Regra de ouro (feedback da professora, item 6): o que foi coletado NUNCA
 * se perde. Dano, queda ou "game over" só mudam a posição da Maya — a Rare
 * Bag, as paletas e as Rare Boxes abertas continuam como estavam.
 */
import { readJSON, writeJSON, removeKey } from './storage';

export interface GameState {
  version: 2;
  currentLevel: number;
  lives: number;
  score: number;
  collectedProducts: string[];
  secretItems: string[];
  /** Último checkpoint ativado em cada fase. */
  checkpoints: Record<number, string>;
  completedLevels: number[];
  /** slot do avatar → id do tom aplicado no Rare Studio. */
  selectedMakeup: Record<string, string>;
  /** Paletas de cores coletadas por fase. */
  palettes: Record<number, string[]>;
  /** Rare Boxes já abertas por fase. */
  openedBoxes: Record<number, string[]>;
  /** Segundos jogados em cada fase (sem contar pausa). */
  levelTime: Record<number, number>;
  /** Pontos conquistados em cada fase. */
  levelScore: Record<number, number>;
  /** Quantas vezes a Maya ficou sem corações (só estatística, nunca penaliza). */
  retries: number;
  finished: boolean;
  startedAt: string;
}

/** Coleção que sobrevive entre partidas ("VER MINHA COLEÇÃO"). */
export interface Collection {
  products: string[];
  secrets: string[];
  bestScore: number;
  bestExploration: number;
  looks: { makeup: Record<string, string>; date: string; score: number }[];
  playthroughs: number;
}

const STATE_KEY = 'rare_platform_state';
const COLLECTION_KEY = 'rare_platform_collection';

export const MAX_LIVES = 3;

function freshState(): GameState {
  return {
    version: 2,
    currentLevel: 1,
    lives: MAX_LIVES,
    score: 0,
    collectedProducts: [],
    secretItems: [],
    checkpoints: {},
    completedLevels: [],
    selectedMakeup: {},
    palettes: {},
    openedBoxes: {},
    levelTime: {},
    levelScore: {},
    retries: 0,
    finished: false,
    startedAt: new Date().toISOString(),
  };
}

function freshCollection(): Collection {
  return { products: [], secrets: [], bestScore: 0, bestExploration: 0, looks: [], playthroughs: 0 };
}

const pushUnique = (list: string[], id: string): boolean => {
  if (list.includes(id)) return false;
  list.push(id);
  return true;
};

class ProgressSystem {
  private _state: GameState;
  private _collection: Collection;

  constructor() {
    const saved = readJSON<GameState>(STATE_KEY);
    this._state = saved?.version === 2 ? { ...freshState(), ...saved } : freshState();
    this._collection = { ...freshCollection(), ...(readJSON<Collection>(COLLECTION_KEY) ?? {}) };
  }

  get state(): Readonly<GameState> {
    return this._state;
  }

  get collection(): Readonly<Collection> {
    return this._collection;
  }

  /** Existe partida em andamento para "Continuar"? */
  get canContinue(): boolean {
    const s = this._state;
    return !s.finished && (s.collectedProducts.length > 0 || s.completedLevels.length > 0 || Object.keys(s.checkpoints).length > 0);
  }

  save(): void {
    writeJSON(STATE_KEY, this._state);
  }

  private saveCollection(): void {
    writeJSON(COLLECTION_KEY, this._collection);
  }

  newGame(): void {
    removeKey(STATE_KEY);
    this._state = freshState();
    this.save();
  }

  // ------------------------------------------------------------- coleta
  addProduct(id: string): boolean {
    const added = pushUnique(this._state.collectedProducts, id);
    if (added) {
      pushUnique(this._collection.products, id);
      this.saveCollection();
      this.save();
    }
    return added;
  }

  addSecret(id: string): boolean {
    const added = pushUnique(this._state.secretItems, id);
    if (added) {
      pushUnique(this._collection.secrets, id);
      this.saveCollection();
      this.save();
    }
    return added;
  }

  addPalette(level: number, id: string): boolean {
    const list = (this._state.palettes[level] ??= []);
    const added = pushUnique(list, id);
    if (added) this.save();
    return added;
  }

  openBox(level: number, id: string): boolean {
    const list = (this._state.openedBoxes[level] ??= []);
    const added = pushUnique(list, id);
    if (added) this.save();
    return added;
  }

  hasProduct = (id: string): boolean => this._state.collectedProducts.includes(id);
  hasSecret = (id: string): boolean => this._state.secretItems.includes(id);
  hasPalette = (level: number, id: string): boolean => (this._state.palettes[level] ?? []).includes(id);
  isBoxOpen = (level: number, id: string): boolean => (this._state.openedBoxes[level] ?? []).includes(id);

  // ------------------------------------------------------------ pontuação
  addScore(level: number, points: number): void {
    this._state.score += points;
    this._state.levelScore[level] = (this._state.levelScore[level] ?? 0) + points;
    this.save();
  }

  addTime(level: number, seconds: number): void {
    this._state.levelTime[level] = (this._state.levelTime[level] ?? 0) + seconds;
  }

  // ------------------------------------------------------------- vidas
  setLives(lives: number): void {
    this._state.lives = Math.max(0, Math.min(MAX_LIVES, lives));
  }

  registerRetry(): void {
    this._state.retries += 1;
    this._state.lives = MAX_LIVES;
    this.save();
  }

  // ------------------------------------------------------------ progressão
  setCheckpoint(level: number, id: string): void {
    this._state.checkpoints[level] = id;
    this._state.currentLevel = level;
    this.save();
  }

  startLevel(level: number): void {
    this._state.currentLevel = level;
    this._state.lives = MAX_LIVES;
    this.save();
  }

  completeLevel(level: number): void {
    if (!this._state.completedLevels.includes(level)) this._state.completedLevels.push(level);
    this._state.currentLevel = Math.min(4, level + 1);
    this.save();
  }

  isLevelComplete = (level: number): boolean => this._state.completedLevels.includes(level);

  // ---------------------------------------------------------- Rare Studio
  setMakeup(slot: string, shadeId: string | null): void {
    if (shadeId) this._state.selectedMakeup[slot] = shadeId;
    else delete this._state.selectedMakeup[slot];
    this.save();
  }

  finishGame(exploration: number): void {
    this._state.finished = true;
    this.save();
    const c = this._collection;
    c.bestScore = Math.max(c.bestScore, this._state.score);
    c.bestExploration = Math.max(c.bestExploration, exploration);
    c.playthroughs += 1;
    c.looks.unshift({ makeup: { ...this._state.selectedMakeup }, date: new Date().toISOString(), score: this._state.score });
    c.looks = c.looks.slice(0, 6);
    this.saveCollection();
  }

  totalTime(): number {
    return Object.values(this._state.levelTime).reduce((sum, t) => sum + t, 0);
  }
}

export const progress = new ProgressSystem();
export default progress;
