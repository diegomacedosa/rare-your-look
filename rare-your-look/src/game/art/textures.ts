/**
 * Texturas PLACEHOLDER geradas por código (SPEC §41).
 *
 * Nenhuma imagem é baixada: tudo é desenhado em Canvas 2D no boot e
 * registrado no gerenciador de texturas do Phaser com uma chave estável.
 * Se um arquivo final for carregado com a mesma chave (src/data/assets.ts),
 * o gerador pula aquela chave — gameplay e arte ficam separados.
 */
import type Phaser from 'phaser';
import { PRODUCTS, type Product } from '../../data/products';
import { THEMES, type LevelTheme } from '../theme';
import { lighten, darken, alpha } from '../../shared/color.js';
import { buildMayaSheet, MAYA_FRAME_NAMES, MAYA_FRAME_W, MAYA_FRAME_H } from './maya';

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

function makeCanvas(w: number, h: number, draw: Draw): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(w);
  canvas.height = Math.ceil(h);
  const ctx = canvas.getContext('2d')!;
  draw(ctx, w, h);
  return canvas;
}

function register(scene: Phaser.Scene, key: string, w: number, h: number, draw: Draw): void {
  if (scene.textures.exists(key)) return;
  scene.textures.addCanvas(key, makeCanvas(w, h, draw));
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function wordmark(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, color: string, spacing = 0.3): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px "DM Sans", system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${size * spacing}px`;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string): void {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

// ------------------------------------------------------------------ produtos
/** Porte para Canvas do `productArt` (SVG) da v1 — embalagem a partir da cor. */
export function drawProduct(ctx: CanvasRenderingContext2D, kind: Product['kind'], color: string, w = 56, h = 72): void {
  ctx.save();
  ctx.scale(w / 56, h / 72);
  const cap = '#F3E7E1';
  const capEdge = darken(cap, 0.14);
  ctx.fillStyle = 'rgba(138,90,98,.22)';
  ctx.beginPath();
  ctx.ellipse(28, 68, 15, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  const shine = (): void => {
    ctx.fillStyle = 'rgba(255,255,255,.45)';
    rr(ctx, 20, 30, 4, 22, 2);
    ctx.fill();
  };

  switch (kind) {
    case 'bottle': // blush líquido: tampa redonda clarinha
      ctx.fillStyle = cap;
      ctx.strokeStyle = capEdge;
      ctx.beginPath();
      ctx.arc(28, 14, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = color;
      rr(ctx, 14, 20, 28, 44, 13);
      ctx.fill();
      shine();
      break;
    case 'dropper':
      ctx.fillStyle = cap;
      rr(ctx, 22, 6, 12, 16, 4);
      ctx.fill();
      ctx.fillStyle = color;
      rr(ctx, 16, 22, 24, 42, 11);
      ctx.fill();
      shine();
      break;
    case 'stick':
      ctx.fillStyle = cap;
      rr(ctx, 18, 16, 20, 48, 9);
      ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(18, 30);
      ctx.lineTo(38, 22);
      ctx.lineTo(38, 16);
      ctx.quadraticCurveTo(38, 12, 33, 12);
      ctx.lineTo(23, 12);
      ctx.quadraticCurveTo(18, 12, 18, 16);
      ctx.closePath();
      ctx.fill();
      break;
    case 'pot':
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(13, 26);
      ctx.lineTo(13, 52);
      ctx.quadraticCurveTo(13, 62, 28, 62);
      ctx.quadraticCurveTo(43, 62, 43, 52);
      ctx.lineTo(43, 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = lighten(color, 0.25);
      ctx.beginPath();
      ctx.ellipse(28, 26, 15, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = alpha(cap, 0.85);
      ctx.beginPath();
      ctx.ellipse(28, 24, 15, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'bullet':
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(21, 30);
      ctx.lineTo(35, 30);
      ctx.lineTo(35, 14);
      ctx.lineTo(28, 8);
      ctx.lineTo(21, 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = cap;
      ctx.strokeStyle = capEdge;
      rr(ctx, 19, 30, 18, 34, 4);
      ctx.fill();
      ctx.stroke();
      break;
    case 'tube':
      ctx.fillStyle = cap;
      rr(ctx, 22, 6, 12, 16, 4);
      ctx.fill();
      ctx.fillStyle = color;
      rr(ctx, 20, 22, 16, 42, 8);
      ctx.fill();
      shine();
      break;
    case 'pen':
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(28, 4);
      ctx.lineTo(33, 16);
      ctx.lineTo(23, 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = darken(color, 0.25);
      rr(ctx, 23, 16, 10, 48, 5);
      ctx.fill();
      ctx.fillStyle = '#E9D9D2';
      rr(ctx, 23, 16, 10, 6, 2);
      ctx.fill();
      break;
    default:
      ctx.fillStyle = color;
      rr(ctx, 16, 18, 24, 46, 10);
      ctx.fill();
  }
  ctx.restore();
}

// --------------------------------------------------------------- cenários
function drawSky(theme: LevelTheme): Draw {
  return (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, theme.skyTop);
    g.addColorStop(1, theme.skyBottom);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const glow = ctx.createRadialGradient(w * 0.72, h * 0.22, 0, w * 0.72, h * 0.22, w * 0.5);
    glow.addColorStop(0, alpha(theme.glow, 0.85));
    glow.addColorStop(1, alpha(theme.glow, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  };
}

/** Camada distante: colinas orgânicas + bolhas. Repetível na horizontal. */
function drawFar(theme: LevelTheme, seed: number): Draw {
  return (ctx, w, h) => {
    ctx.fillStyle = alpha(theme.far, 0.9);
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 8) {
      const y = h * 0.62 + Math.sin((x / w) * Math.PI * 4 + seed) * 38 + Math.sin((x / w) * Math.PI * 10) * 12;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    for (let i = 0; i < 9; i++) {
      const x = ((i * 157 + seed * 90) % w) + 20;
      const y = 80 + ((i * 97) % 260);
      const r = 14 + ((i * 31) % 40);
      ctx.fillStyle = alpha('#FFFFFF', 0.18);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  };
}

/**
 * Camada do meio: silhuetas gigantes de produtos e o wordmark da marca —
 * presença de marca no cenário (feedback da professora, item 8).
 */
function drawMid(theme: LevelTheme, kinds: Product['kind'][]): Draw {
  return (ctx, w, h) => {
    const tone = alpha(theme.mid, 0.75);
    kinds.forEach((kind, i) => {
      const x = 90 + i * (w / kinds.length);
      const scale = 2.6 + (i % 2) * 0.8;
      ctx.save();
      ctx.translate(x, h - 90 - 72 * scale);
      drawProduct(ctx, kind, theme.mid, 56 * scale, 72 * scale);
      ctx.restore();
    });
    ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = tone;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
    wordmark(ctx, 'RARE BEAUTY', w * 0.52, h * 0.3, 30, alpha('#FFFFFF', 0.4), 0.45);
  };
}

function drawBedroom(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  // parede
  const wall = ctx.createLinearGradient(0, 0, 0, h);
  wall.addColorStop(0, '#F8EDE6');
  wall.addColorStop(1, '#F0D5D8');
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, w, h);
  // listras suaves
  ctx.fillStyle = 'rgba(196,146,154,.08)';
  for (let x = 0; x < w; x += 64) ctx.fillRect(x, 0, 28, h * 0.78);
  // janela ao entardecer
  const wx = 110;
  const wy = 110;
  const sky = ctx.createLinearGradient(0, wy, 0, wy + 260);
  sky.addColorStop(0, '#F4B8A8');
  sky.addColorStop(1, '#C98FA8');
  ctx.fillStyle = '#FAF7F5';
  rr(ctx, wx - 14, wy - 14, 268, 318, 20);
  ctx.fill();
  ctx.fillStyle = sky;
  rr(ctx, wx, wy, 240, 290, 12);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,240,220,.8)';
  ctx.beginPath();
  ctx.arc(wx + 160, wy + 200, 36, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FAF7F5';
  ctx.fillRect(wx + 116, wy, 8, 290);
  ctx.fillRect(wx, wy + 140, 240, 8);
  // relógio
  ctx.fillStyle = '#FAF7F5';
  ctx.beginPath();
  ctx.arc(520, 150, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8A5A62';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(520, 150);
  ctx.lineTo(520, 118);
  ctx.moveTo(520, 150);
  ctx.lineTo(498, 150);
  ctx.stroke();
  // piso
  ctx.fillStyle = '#E4C9BD';
  ctx.fillRect(0, h * 0.78, w, h * 0.22);
  ctx.fillStyle = 'rgba(138,90,98,.1)';
  for (let x = 0; x < w; x += 120) ctx.fillRect(x, h * 0.78, 2, h * 0.22);
  // tapete
  ctx.fillStyle = '#D9A9AE';
  ctx.beginPath();
  ctx.ellipse(430, h * 0.9, 220, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  // penteadeira
  const vx = 820;
  const vy = h * 0.78;
  ctx.fillStyle = '#FAF7F5';
  rr(ctx, vx - 190, vy - 150, 380, 26, 10);
  ctx.fill();
  ctx.fillStyle = '#EADBD3';
  rr(ctx, vx - 178, vy - 126, 356, 60, 8);
  ctx.fill();
  ctx.fillStyle = '#D9C4BA';
  ctx.fillRect(vx - 170, vy - 66, 16, 66);
  ctx.fillRect(vx + 154, vy - 66, 16, 66);
  ctx.fillStyle = '#C4929A';
  ctx.beginPath();
  ctx.arc(vx - 80, vy - 96, 5, 0, Math.PI * 2);
  ctx.arc(vx + 80, vy - 96, 5, 0, Math.PI * 2);
  ctx.fill();
  // espelho oval com moldura dourada
  ctx.fillStyle = '#D6AE62';
  ctx.beginPath();
  ctx.ellipse(vx, vy - 330, 128, 170, 0, 0, Math.PI * 2);
  ctx.fill();
  const glass = ctx.createLinearGradient(vx - 110, vy - 480, vx + 110, vy - 170);
  glass.addColorStop(0, '#FBF3EE');
  glass.addColorStop(1, '#E7D1D6');
  ctx.fillStyle = glass;
  ctx.beginPath();
  ctx.ellipse(vx, vy - 330, 114, 156, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.55)';
  ctx.beginPath();
  ctx.ellipse(vx - 48, vy - 390, 16, 60, -0.35, 0, Math.PI * 2);
  ctx.fill();
  // banquinho
  ctx.fillStyle = '#C4929A';
  rr(ctx, vx - 70, vy - 58, 140, 22, 11);
  ctx.fill();
  ctx.fillStyle = '#B0808A';
  ctx.fillRect(vx - 56, vy - 36, 10, 36);
  ctx.fillRect(vx + 46, vy - 36, 10, 36);
  // quadro com o slogan
  ctx.fillStyle = '#FAF7F5';
  rr(ctx, 1080, 120, 150, 110, 8);
  ctx.fill();
  ctx.fillStyle = '#8A5A62';
  ctx.font = 'italic 400 17px "Playfair Display", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('There’s no', 1155, 162);
  ctx.fillText('one way to', 1155, 184);
  ctx.fillText('be Rare.', 1155, 206);
}

// ------------------------------------------------------------ plataformas
export function platformKey(scene: Phaser.Scene, themeId: keyof typeof THEMES, w: number, h: number, kind: 'ground' | 'soft' | 'solid' | 'crumble'): string {
  const key = `plat-${themeId}-${kind}-${Math.round(w)}x${Math.round(h)}`;
  if (scene.textures.exists(key)) return key;
  const t = THEMES[themeId];
  register(scene, key, w, h, (ctx) => {
    const r = kind === 'ground' ? 0 : Math.min(14, h / 2);
    const body = ctx.createLinearGradient(0, 0, 0, h);
    const bodyColor = kind === 'crumble' ? lighten(t.platformBody, 0.2) : t.platformBody;
    body.addColorStop(0, bodyColor);
    body.addColorStop(1, darken(bodyColor, 0.18));
    ctx.fillStyle = body;
    rr(ctx, 0, 0, w, h, r);
    ctx.fill();
    // cobertura "cremosa" com ondinha — textura de produto, não de grama
    ctx.fillStyle = t.platformTop;
    ctx.beginPath();
    ctx.moveTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.lineTo(w - r, 0);
    ctx.quadraticCurveTo(w, 0, w, r);
    for (let x = w; x >= 0; x -= 16) ctx.quadraticCurveTo(x - 4, 16, x - 8, 11);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    rr(ctx, 8, 3, Math.max(0, w - 16), 3, 2);
    ctx.fill();
    if (kind === 'crumble') {
      ctx.strokeStyle = alpha(t.platformEdge, 0.8);
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 5]);
      rr(ctx, 2, 2, w - 4, h - 4, r);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(w * 0.3, 14);
      ctx.lineTo(w * 0.38, h - 4);
      ctx.moveTo(w * 0.7, 14);
      ctx.lineTo(w * 0.62, h - 6);
      ctx.stroke();
    } else if (kind === 'ground') {
      ctx.fillStyle = alpha(t.platformEdge, 0.25);
      for (let x = 30; x < w; x += 90) {
        ctx.beginPath();
        ctx.arc(x, 44 + ((x / 90) % 2) * 18, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.strokeStyle = alpha(t.platformEdge, 0.5);
      ctx.lineWidth = 2;
      rr(ctx, 1, 1, w - 2, h - 2, r);
      ctx.stroke();
    }
  });
  return key;
}

// ------------------------------------------------------------ registro geral
export function generateTextures(scene: Phaser.Scene): void {
  // Maya: uma textura com quadros nomeados
  if (!scene.textures.exists('maya')) {
    const texture = scene.textures.addCanvas('maya', buildMayaSheet());
    MAYA_FRAME_NAMES.forEach((name, i) => texture?.add(name, 0, i * MAYA_FRAME_W, 0, MAYA_FRAME_W, MAYA_FRAME_H));
  } else {
    // arte final carregada como spritesheet (uma linha, mesma ordem de quadros):
    // cria os nomes que as animações usam
    const texture = scene.textures.get('maya');
    if (!texture.has('idle0')) {
      MAYA_FRAME_NAMES.forEach((name, i) => texture.add(name, 0, i * MAYA_FRAME_W, 0, MAYA_FRAME_W, MAYA_FRAME_H));
    }
  }

  // Rare Box: embalagem sofisticada com monograma "R" e fita
  const drawBox = (used: boolean): Draw => (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, used ? '#E4D5CF' : '#F7E3DF');
    g.addColorStop(1, used ? '#C9B3AD' : '#D99AA0');
    ctx.fillStyle = g;
    rr(ctx, 1, 1, w - 2, h - 2, 10);
    ctx.fill();
    ctx.strokeStyle = used ? '#B39C96' : '#8A5A62';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (!used) {
      ctx.fillStyle = 'rgba(214,174,98,.9)';
      ctx.fillRect(w / 2 - 3, 2, 6, h - 4);
      ctx.fillRect(2, h / 2 - 3, w - 4, 6);
      ctx.fillStyle = '#FAF7F5';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#8A5A62';
      ctx.font = '700 17px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('R', w / 2, h / 2 + 1);
      sparkle(ctx, w - 11, 11, 6, '#FFFFFF');
    } else {
      ctx.fillStyle = 'rgba(138,90,98,.25)';
      ctx.font = '700 17px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('R', w / 2, h / 2 + 1);
    }
  };
  register(scene, 'rarebox', 56, 56, drawBox(false));
  register(scene, 'rarebox-used', 56, 56, drawBox(true));
  register(scene, 'rarebox-hidden', 56, 56, (ctx, w, h) => {
    ctx.strokeStyle = 'rgba(255,255,255,.35)';
    ctx.setLineDash([4, 6]);
    ctx.lineWidth = 2;
    rr(ctx, 3, 3, w - 6, h - 6, 10);
    ctx.stroke();
    sparkle(ctx, w / 2, h / 2, 8, 'rgba(255,255,255,.6)');
  });

  // Paleta de cores: estojo com 4 godês
  register(scene, 'palette', 44, 34, (ctx) => {
    ctx.fillStyle = '#FAF7F5';
    rr(ctx, 1, 3, 42, 30, 8);
    ctx.fill();
    ctx.strokeStyle = '#C4929A';
    ctx.lineWidth = 2;
    ctx.stroke();
    const pans = ['#D98E95', '#EC9275', '#A99BCB', '#D6AE62'];
    pans.forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(10 + (i % 2) * 24, 12 + Math.floor(i / 2) * 12, 5.2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = 'rgba(255,255,255,.7)';
    ctx.fillRect(6, 5, 14, 2);
  });

  // Produtos: ícone de cada linha na cor do primeiro tom
  for (const product of PRODUCTS) {
    register(scene, product.icon, 56, 72, (ctx) => drawProduct(ctx, product.kind, product.color ?? '#C4929A'));
  }

  // Item secreto: estojo dourado com brilho
  register(scene, 'secret', 52, 52, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2);
    g.addColorStop(0, 'rgba(255,240,200,.95)');
    g.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#D6AE62';
    ctx.beginPath();
    ctx.moveTo(w / 2, 6);
    ctx.lineTo(w - 10, h / 2);
    ctx.lineTo(w / 2, h - 6);
    ctx.lineTo(10, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#F4DDB8';
    ctx.beginPath();
    ctx.moveTo(w / 2, 12);
    ctx.lineTo(w - 18, h / 2);
    ctx.lineTo(w / 2, h / 2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8A5A62';
    ctx.font = '700 15px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('R', w / 2, h / 2 + 2);
  });

  // Brilho bônus
  register(scene, 'bonus', 36, 36, (ctx, w, h) => {
    sparkle(ctx, w / 2, h / 2, 16, '#FFF4D8');
    sparkle(ctx, w / 2, h / 2, 10, '#D6AE62');
  });

  // Corações
  const heart = (fill: string, stroke: string): Draw => (ctx) => {
    ctx.fillStyle = fill;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(15, 26);
    ctx.bezierCurveTo(-4, 14, 2, -1, 15, 8);
    ctx.bezierCurveTo(28, -1, 34, 14, 15, 26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  register(scene, 'heart', 30, 28, heart('#E0707F', '#FAF7F5'));
  register(scene, 'heart-empty', 30, 28, heart('rgba(255,255,255,.25)', 'rgba(255,255,255,.7)'));

  // Checkpoint: espelho Rare de pé
  const mirror = (on: boolean): Draw => (ctx, w, h) => {
    if (on) {
      const g = ctx.createRadialGradient(w / 2, 50, 4, w / 2, 50, 60);
      g.addColorStop(0, 'rgba(255,236,200,.9)');
      g.addColorStop(1, 'rgba(255,236,200,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, 110);
    }
    ctx.fillStyle = '#B08D57';
    ctx.fillRect(w / 2 - 3, 90, 6, h - 96);
    rr(ctx, w / 2 - 20, h - 8, 40, 8, 4);
    ctx.fill();
    ctx.fillStyle = on ? '#D6AE62' : '#B8A9A3';
    ctx.beginPath();
    ctx.ellipse(w / 2, 52, 28, 42, 0, 0, Math.PI * 2);
    ctx.fill();
    const glass = ctx.createLinearGradient(0, 14, 0, 92);
    glass.addColorStop(0, on ? '#FFF6EA' : '#D9D2D4');
    glass.addColorStop(1, on ? '#F4C9C4' : '#B9AFB3');
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.ellipse(w / 2, 52, 22, 35, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.6)';
    ctx.beginPath();
    ctx.ellipse(w / 2 - 8, 40, 4, 14, -0.3, 0, Math.PI * 2);
    ctx.fill();
    if (on) sparkle(ctx, w / 2 + 12, 24, 7, '#FFFFFF');
  };
  register(scene, 'mirror-off', 70, 136, mirror(false));
  register(scene, 'mirror-on', 70, 136, mirror(true));

  // Portal: grande espelho em arco
  register(scene, 'portal', 190, 300, (ctx, w, h) => {
    const frame = ctx.createLinearGradient(0, 0, w, h);
    frame.addColorStop(0, '#F4DDB8');
    frame.addColorStop(1, '#B08D57');
    ctx.fillStyle = frame;
    ctx.beginPath();
    ctx.moveTo(8, h);
    ctx.lineTo(8, w / 2);
    ctx.arc(w / 2, w / 2, w / 2 - 8, Math.PI, 0);
    ctx.lineTo(w - 8, h);
    ctx.closePath();
    ctx.fill();
    const glass = ctx.createLinearGradient(0, 20, 0, h);
    glass.addColorStop(0, '#FFF1F4');
    glass.addColorStop(0.5, '#E8C3D9');
    glass.addColorStop(1, '#C9A6E0');
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.moveTo(24, h);
    ctx.lineTo(24, w / 2);
    ctx.arc(w / 2, w / 2, w / 2 - 24, Math.PI, 0);
    ctx.lineTo(w - 24, h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8A5A62';
    ctx.font = '700 22px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('R', w / 2, 34);
  });

  // Obstáculos (nada violento: frascos, pincéis, gotas)
  register(scene, 'bottle', 40, 66, (ctx) => {
    ctx.fillStyle = '#2A262C';
    rr(ctx, 13, 2, 14, 16, 3);
    ctx.fill();
    const g = ctx.createLinearGradient(4, 0, 36, 0);
    g.addColorStop(0, '#B55A76');
    g.addColorStop(1, '#7A3550');
    ctx.fillStyle = g;
    rr(ctx, 4, 16, 32, 48, 10);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    rr(ctx, 9, 22, 5, 30, 3);
    ctx.fill();
    ctx.fillStyle = '#FAF7F5';
    ctx.font = '700 9px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', 24, 46);
  });
  register(scene, 'brush-h', 150, 46, (ctx) => {
    ctx.fillStyle = '#2A262C';
    rr(ctx, 0, 17, 78, 12, 6);
    ctx.fill();
    ctx.fillStyle = '#D6AE62';
    rr(ctx, 70, 12, 22, 22, 4);
    ctx.fill();
    const g = ctx.createLinearGradient(92, 0, 150, 0);
    g.addColorStop(0, '#F3E2D8');
    g.addColorStop(1, '#D98E95');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(90, 10);
    ctx.quadraticCurveTo(150, -6, 148, 23);
    ctx.quadraticCurveTo(150, 52, 90, 36);
    ctx.closePath();
    ctx.fill();
  });
  register(scene, 'brush-v', 46, 150, (ctx) => {
    ctx.fillStyle = '#2A262C';
    rr(ctx, 17, 0, 12, 78, 6);
    ctx.fill();
    ctx.fillStyle = '#D6AE62';
    rr(ctx, 12, 70, 22, 22, 4);
    ctx.fill();
    const g = ctx.createLinearGradient(0, 92, 0, 150);
    g.addColorStop(0, '#F3E2D8');
    g.addColorStop(1, '#A99BCB');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(10, 90);
    ctx.quadraticCurveTo(-6, 150, 23, 148);
    ctx.quadraticCurveTo(52, 150, 36, 90);
    ctx.closePath();
    ctx.fill();
  });
  register(scene, 'drop', 22, 30, (ctx) => {
    ctx.fillStyle = '#C45E72';
    ctx.beginPath();
    ctx.moveTo(11, 1);
    ctx.bezierCurveTo(14, 10, 21, 15, 21, 20);
    ctx.arc(11, 20, 10, 0, Math.PI);
    ctx.bezierCurveTo(1, 15, 8, 10, 11, 1);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.55)';
    ctx.beginPath();
    ctx.arc(7, 19, 3, 0, Math.PI * 2);
    ctx.fill();
  });
  register(scene, 'dripper', 64, 90, (ctx) => {
    ctx.fillStyle = '#F3E7E1';
    rr(ctx, 20, 0, 24, 40, 10);
    ctx.fill();
    ctx.fillStyle = '#2A262C';
    rr(ctx, 16, 36, 32, 12, 4);
    ctx.fill();
    ctx.fillStyle = '#F2E6E8';
    ctx.beginPath();
    ctx.moveTo(26, 48);
    ctx.lineTo(38, 48);
    ctx.lineTo(34, 88);
    ctx.lineTo(30, 88);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#C45E72';
    ctx.fillRect(29, 70, 6, 16);
  });

  // Placa "Rare Tip"
  register(scene, 'sign', 76, 96, (ctx) => {
    ctx.fillStyle = '#B08D57';
    ctx.fillRect(34, 50, 8, 46);
    ctx.fillStyle = '#FAF7F5';
    rr(ctx, 2, 4, 72, 52, 12);
    ctx.fill();
    ctx.strokeStyle = '#C4929A';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#8A5A62';
    ctx.font = '700 22px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('R', 38, 24);
    ctx.font = '700 10px "DM Sans", sans-serif';
    ctx.fillText('RARE TIP', 38, 44);
  });

  // Rare Bag (HUD)
  register(scene, 'rarebag', 48, 48, (ctx) => {
    ctx.strokeStyle = '#8A5A62';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(24, 16, 10, Math.PI, 0);
    ctx.stroke();
    const g = ctx.createLinearGradient(0, 14, 0, 46);
    g.addColorStop(0, '#F0D5D8');
    g.addColorStop(1, '#C4929A');
    ctx.fillStyle = g;
    rr(ctx, 5, 15, 38, 31, 9);
    ctx.fill();
    ctx.fillStyle = '#8A5A62';
    ctx.font = '700 15px "Playfair Display", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('R', 24, 31);
  });

  // Partículas
  register(scene, 'spark', 16, 16, (ctx) => {
    const g = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 16, 16);
  });
  register(scene, 'star', 20, 20, (ctx) => sparkle(ctx, 10, 10, 9, '#FFFFFF'));
  register(scene, 'petal', 14, 14, (ctx) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(7, 7, 6, 3.5, 0.6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Cenários das fases
  const kinds: Product['kind'][] = ['bottle', 'bullet', 'dropper', 'tube', 'stick', 'pot'];
  (Object.keys(THEMES) as (keyof typeof THEMES)[]).forEach((id, i) => {
    const theme = THEMES[id];
    register(scene, `sky-${id}`, 1280, 720, drawSky(theme));
    register(scene, `far-${id}`, 1280, 720, drawFar(theme, i + 1));
    register(scene, `mid-${id}`, 1280, 720, drawMid(theme, kinds.slice(i, i + 4)));
  });

  register(scene, 'bedroom', 1280, 720, drawBedroom);
}
