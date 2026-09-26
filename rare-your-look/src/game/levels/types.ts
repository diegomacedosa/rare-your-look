/**
 * Formato das fases desenhadas à mão (SPEC §30 — nada procedural).
 *
 * Coordenadas em pixels do mundo. O chão tem o topo em GROUND_Y; tudo que
 * cai abaixo de KILL_Y volta para o último checkpoint.
 */

export const GROUND_Y = 640;
export const WORLD_HEIGHT = 720;
export const KILL_Y = 820;
/** Centro vertical de uma Rare Box "no térreo": dá pra passar por baixo e bater pulando. */
export const BOX_Y = 482;
export const BOX_SIZE = 56;

export type BoxContent =
  | { type: 'product'; id: string }
  | { type: 'secret'; id: string }
  | { type: 'palette' }
  | { type: 'heart' }
  | { type: 'bonus' };

export interface PlatformDef {
  x: number;
  y: number;
  w: number;
  /** solid = colide por todos os lados; soft = só por cima (atravessa pulando). */
  kind: 'soft' | 'solid' | 'crumble';
}

export interface MovingDef {
  x: number;
  y: number;
  w: number;
  dx: number;
  dy: number;
  period: number;
  phase: number;
}

export interface BoxDef {
  id: string;
  x: number;
  y: number;
  content: BoxContent;
  hidden: boolean;
}

export interface ItemDef {
  id: string;
  x: number;
  y: number;
}

export type HazardDef =
  | { type: 'bottle'; x: number; y: number }
  | { type: 'brush'; x: number; y: number; dx: number; dy: number; period: number; phase: number; vertical: boolean }
  | { type: 'drip'; x: number; y: number; period: number; phase: number };

export interface CheckpointDef {
  id: string;
  x: number;
  y: number;
}

export interface SignDef {
  x: number;
  y: number;
  tip: string;
}

export interface TutorialDef {
  x: number;
  text: string;
  touchText?: string;
}

export interface DecorDef {
  type: 'banner' | 'flower' | 'bubble';
  x: number;
  y: number;
  text?: string;
}

export interface LevelLayout {
  width: number;
  spawnX: number;
  ground: [number, number][];
  platforms: PlatformDef[];
  moving: MovingDef[];
  boxes: BoxDef[];
  products: ItemDef[];
  secrets: ItemDef[];
  palettes: ItemDef[];
  hazards: HazardDef[];
  checkpoints: CheckpointDef[];
  signs: SignDef[];
  tutorials: TutorialDef[];
  decor: DecorDef[];
  portalX: number;
}

/**
 * Construtor fluente: deixa o level design legível ("uma linha = um elemento")
 * e gera ids estáveis para salvar o que já foi coletado.
 */
export class LevelBuilder {
  private layout: LevelLayout;
  private counters = { box: 0, palette: 0, checkpoint: 0 };

  constructor(private readonly level: number, width: number, spawnX = 140) {
    this.layout = {
      width,
      spawnX,
      ground: [],
      platforms: [],
      moving: [],
      boxes: [],
      products: [],
      secrets: [],
      palettes: [],
      hazards: [],
      checkpoints: [],
      signs: [],
      tutorials: [],
      decor: [],
      portalX: width - 300,
    };
  }

  ground(from: number, to: number): this {
    this.layout.ground.push([from, to]);
    return this;
  }

  /** Plataforma flutuante (x = borda esquerda, y = topo). */
  plat(x: number, y: number, w: number, kind: PlatformDef['kind'] = 'soft'): this {
    this.layout.platforms.push({ x, y, w, kind });
    return this;
  }

  crumble(x: number, y: number, w = 110): this {
    return this.plat(x, y, w, 'crumble');
  }

  /** Plataforma móvel: vai e volta entre (x, y) e (x+dx, y+dy). */
  mover(x: number, y: number, w: number, dx: number, dy: number, period = 3, phase = 0): this {
    this.layout.moving.push({ x, y, w, dx, dy, period, phase });
    return this;
  }

  box(x: number, content: BoxContent, y = BOX_Y, hidden = false): this {
    this.counters.box += 1;
    this.layout.boxes.push({ id: `b${this.level}-${this.counters.box}`, x, y, content, hidden });
    return this;
  }

  hiddenBox(x: number, content: BoxContent, y = BOX_Y): this {
    return this.box(x, content, y, true);
  }

  product(id: string, x: number, y: number): this {
    this.layout.products.push({ id, x, y });
    return this;
  }

  secret(id: string, x: number, y: number): this {
    this.layout.secrets.push({ id, x, y });
    return this;
  }

  palette(x: number, y: number): this {
    this.counters.palette += 1;
    this.layout.palettes.push({ id: `p${this.level}-${this.counters.palette}`, x, y });
    return this;
  }

  /** Fileira de paletas. */
  palettes(x: number, y: number, count: number, gap = 56): this {
    for (let i = 0; i < count; i++) this.palette(x + i * gap, y);
    return this;
  }

  /** Arco de paletas sobre um buraco (sugere o pulo). */
  arc(x: number, y: number, count: number, gap = 50, height = 60): this {
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0.5 : i / (count - 1);
      this.palette(x + i * gap, y - Math.sin(t * Math.PI) * height);
    }
    return this;
  }

  bottle(x: number, y = GROUND_Y): this {
    this.layout.hazards.push({ type: 'bottle', x, y });
    return this;
  }

  /** Pincel gigante que patrulha na horizontal, rente ao chão. */
  brush(x: number, dx: number, period = 3, phase = 0, y = GROUND_Y - 30): this {
    this.layout.hazards.push({ type: 'brush', x, y, dx, dy: 0, period, phase, vertical: false });
    return this;
  }

  /** Pincel que sobe e desce (passe por baixo quando ele subir). */
  vbrush(x: number, top = 330, bottom = 570, period = 2.6, phase = 0): this {
    this.layout.hazards.push({ type: 'brush', x, y: top, dx: 0, dy: bottom - top, period, phase, vertical: true });
    return this;
  }

  /** Conta-gotas que pinga gotas de maquiagem em intervalos. */
  drip(x: number, period = 1.8, phase = 0, y = 170): this {
    this.layout.hazards.push({ type: 'drip', x, y, period, phase });
    return this;
  }

  checkpoint(x: number, y = GROUND_Y): this {
    this.counters.checkpoint += 1;
    this.layout.checkpoints.push({ id: `c${this.level}-${this.counters.checkpoint}`, x, y });
    return this;
  }

  sign(x: number, tip: string, y = GROUND_Y): this {
    this.layout.signs.push({ x, y, tip });
    return this;
  }

  tutorial(x: number, text: string, touchText?: string): this {
    this.layout.tutorials.push({ x, text, touchText });
    return this;
  }

  decor(type: DecorDef['type'], x: number, y: number, text?: string): this {
    this.layout.decor.push({ type, x, y, text });
    return this;
  }

  portal(x: number): this {
    this.layout.portalX = x;
    return this;
  }

  build(): LevelLayout {
    return this.layout;
  }
}
