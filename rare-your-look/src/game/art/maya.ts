/**
 * Maya — sprite vetorial desenhado em Canvas (SPEC §33).
 *
 * PLACEHOLDER: cada quadro é gerado por código a partir de uma "pose"
 * (ângulos de braços e pernas). Quando a ilustração final existir, basta
 * carregar uma spritesheet com a chave `maya` e os mesmos nomes de quadro
 * (ver ASSET_OVERRIDES em src/data/assets.ts) — as animações continuam iguais.
 *
 * Paleta coerente com o retrato do Rare Studio (AvatarSystem, tom 4).
 */

export const MAYA_FRAME_W = 96;
export const MAYA_FRAME_H = 128;

const SKIN = '#CE9A6E';
const SKIN_SHADE = '#B37E54';
const HAIR = '#3C2419';
const HAIR_LIGHT = '#5A3726';
const TOP = '#C4929A';
const TOP_SHADE = '#A5747D';
const JEANS = '#5B7BA3';
const JEANS_SHADE = '#48648A';
const SHOE = '#FAF7F5';
const GOLD = '#D6AE62';

interface Limb {
  /** Ângulo da coxa/braço a partir da vertical (rad, + = para frente). */
  a: number;
  /** Dobra do joelho/cotovelo (rad, + = dobra para trás no joelho / para frente no cotovelo). */
  b: number;
}

export interface Pose {
  legFront: Limb;
  legBack: Limb;
  armFront: Limb;
  armBack: Limb;
  bob: number;
  lean: number;
  squash: number;
  eyes: 'open' | 'closed' | 'happy' | 'wide';
  mouth: 'smile' | 'open' | 'o' | 'flat';
  hairLift: number;
  /** Segurando o celular (cutscene). */
  phone?: boolean;
  /** Sentada (penteadeira). */
  sit?: boolean;
}

const base: Pose = {
  legFront: { a: 0.05, b: 0.05 },
  legBack: { a: -0.05, b: 0.05 },
  armFront: { a: 0.12, b: 0.2 },
  armBack: { a: -0.12, b: 0.2 },
  bob: 0,
  lean: 0,
  squash: 1,
  eyes: 'open',
  mouth: 'smile',
  hairLift: 0,
};

const pose = (patch: Partial<Pose>): Pose => ({ ...base, ...patch });

/** Ciclo de corrida em 6 quadros. */
const RUN: Pose[] = [
  pose({ legFront: { a: 0.75, b: 0.35 }, legBack: { a: -0.6, b: 0.9 }, armFront: { a: -0.8, b: 1.1 }, armBack: { a: 0.8, b: 1.2 }, bob: 2, lean: 0.12, hairLift: 4 }),
  pose({ legFront: { a: 0.35, b: 0.2 }, legBack: { a: -0.3, b: 1.3 }, armFront: { a: -0.4, b: 1.1 }, armBack: { a: 0.4, b: 1.1 }, bob: -1, lean: 0.12, hairLift: 6 }),
  pose({ legFront: { a: -0.1, b: 0.5 }, legBack: { a: 0.2, b: 1.2 }, armFront: { a: 0.1, b: 1 }, armBack: { a: -0.1, b: 1 }, bob: -3, lean: 0.12, hairLift: 7 }),
  pose({ legFront: { a: -0.6, b: 0.9 }, legBack: { a: 0.75, b: 0.35 }, armFront: { a: 0.8, b: 1.2 }, armBack: { a: -0.8, b: 1.1 }, bob: 2, lean: 0.12, hairLift: 4 }),
  pose({ legFront: { a: -0.3, b: 1.3 }, legBack: { a: 0.35, b: 0.2 }, armFront: { a: 0.4, b: 1.1 }, armBack: { a: -0.4, b: 1.1 }, bob: -1, lean: 0.12, hairLift: 6 }),
  pose({ legFront: { a: 0.2, b: 1.2 }, legBack: { a: -0.1, b: 0.5 }, armFront: { a: -0.1, b: 1 }, armBack: { a: 0.1, b: 1 }, bob: -3, lean: 0.12, hairLift: 7 }),
];

/** Quadros nomeados — a ordem define o índice na textura. */
export const MAYA_FRAMES: Record<string, Pose> = {
  idle0: pose({}),
  idle1: pose({ bob: 1, squash: 0.985, armFront: { a: 0.14, b: 0.25 }, armBack: { a: -0.14, b: 0.25 } }),
  run0: RUN[0]!,
  run1: RUN[1]!,
  run2: RUN[2]!,
  run3: RUN[3]!,
  run4: RUN[4]!,
  run5: RUN[5]!,
  jump: pose({ legFront: { a: 0.9, b: 1.4 }, legBack: { a: -0.2, b: 1.2 }, armFront: { a: 2.6, b: -0.3 }, armBack: { a: -2.4, b: 0.4 }, lean: 0.05, mouth: 'open', hairLift: 10 }),
  fall: pose({ legFront: { a: 0.3, b: 0.5 }, legBack: { a: -0.3, b: 0.6 }, armFront: { a: 1.9, b: -0.4 }, armBack: { a: -1.9, b: 0.4 }, eyes: 'wide', mouth: 'o', hairLift: -6 }),
  land: pose({ legFront: { a: 0.5, b: 1.1 }, legBack: { a: -0.3, b: 1.0 }, bob: 8, squash: 0.9, armFront: { a: -0.6, b: 0.5 }, armBack: { a: 0.6, b: 0.5 }, hairLift: -4 }),
  hit: pose({ legFront: { a: 0.4, b: 0.4 }, legBack: { a: -0.4, b: 0.5 }, armFront: { a: -1.2, b: 0.8 }, armBack: { a: -1.4, b: 0.8 }, lean: -0.25, eyes: 'closed', mouth: 'o', hairLift: 6 }),
  celebrate0: pose({ armFront: { a: 2.6, b: -0.2 }, armBack: { a: -2.6, b: 0.2 }, eyes: 'happy', mouth: 'open', bob: -4, hairLift: 6 }),
  celebrate1: pose({ armFront: { a: 2.3, b: -0.5 }, armBack: { a: -2.3, b: 0.5 }, eyes: 'happy', mouth: 'smile', bob: 0, legFront: { a: 0.3, b: 0.6 }, hairLift: 2 }),
  interact0: pose({ armFront: { a: -0.9, b: 1.6 }, phone: true, eyes: 'open', mouth: 'flat' }),
  interact1: pose({ armFront: { a: -0.95, b: 1.7 }, phone: true, eyes: 'wide', mouth: 'o', bob: 1 }),
  sit: pose({ sit: true, legFront: { a: 1.5, b: 1.5 }, legBack: { a: 1.45, b: 1.5 }, armFront: { a: -0.9, b: 0.6 }, armBack: { a: 0.6, b: 0.6 }, bob: 20 }),
  pick: pose({ sit: true, legFront: { a: 1.5, b: 1.5 }, legBack: { a: 1.45, b: 1.5 }, armFront: { a: -1.5, b: 0.2 }, armBack: { a: 0.6, b: 0.6 }, bob: 20, eyes: 'open' }),
  apply0: pose({ sit: true, legFront: { a: 1.5, b: 1.5 }, legBack: { a: 1.45, b: 1.5 }, armFront: { a: -1.1, b: 2.3 }, armBack: { a: 0.6, b: 0.6 }, bob: 20, eyes: 'closed' }),
  apply1: pose({ sit: true, legFront: { a: 1.5, b: 1.5 }, legBack: { a: 1.45, b: 1.5 }, armFront: { a: -1.2, b: 2.4 }, armBack: { a: 0.6, b: 0.6 }, bob: 20, eyes: 'happy' }),
  look: pose({ sit: true, legFront: { a: 1.5, b: 1.5 }, legBack: { a: 1.45, b: 1.5 }, armFront: { a: 0.3, b: 0.9 }, armBack: { a: 0.6, b: 0.6 }, bob: 20, eyes: 'wide', mouth: 'smile' }),
  pose: pose({ armFront: { a: 2.7, b: -0.3 }, armBack: { a: 0.6, b: -1.9 }, legFront: { a: 0.25, b: 0.1 }, legBack: { a: -0.2, b: 0.1 }, eyes: 'happy', mouth: 'smile', lean: -0.04 }),
};

export const MAYA_FRAME_NAMES = Object.keys(MAYA_FRAMES);

// ------------------------------------------------------------------ desenho
function limb(ctx: CanvasRenderingContext2D, x: number, y: number, l: Limb, len1: number, len2: number, width: number, color: string, knee: boolean): [number, number] {
  const x1 = x + Math.sin(l.a) * len1;
  const y1 = y + Math.cos(l.a) * len1;
  // joelho dobra para trás (ângulo diminui), cotovelo dobra para frente
  const a2 = knee ? l.a - l.b : l.a + l.b;
  const x2 = x1 + Math.sin(a2) * len2;
  const y2 = y1 + Math.cos(a2) * len2;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  return [x2, y2];
}

function shoe(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = SHOE;
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 2, 8, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#E5CFC9';
  ctx.fillRect(x - 3, y + 4, 15, 2);
}

export function drawMaya(ctx: CanvasRenderingContext2D, p: Pose): void {
  const cx = 46;
  const hipY = (p.sit ? 88 : 84) + p.bob;
  ctx.save();
  // squash & stretch a partir do pé
  ctx.translate(cx, 124);
  ctx.scale(1 / Math.sqrt(p.squash), p.squash);
  ctx.translate(-cx, -124);

  // ---------------- pernas (a de trás primeiro)
  const [bx, by] = limb(ctx, cx - 3, hipY, p.legBack, 19, 19, 11, JEANS_SHADE, true);
  shoe(ctx, bx, by);
  // ---------------- braço de trás
  ctx.save();
  ctx.translate(cx, hipY - 27);
  ctx.rotate(p.lean);
  ctx.translate(-cx, -(hipY - 27));
  limb(ctx, cx - 4, hipY - 24, p.armBack, 14, 14, 7, SKIN_SHADE, false);
  ctx.restore();

  // ---------------- cabelo de trás (volume ondulado)
  const headX = cx + 3 + Math.sin(p.lean) * 30;
  const headY = hipY - 50 + Math.abs(p.lean) * 4;
  ctx.fillStyle = HAIR;
  ctx.beginPath();
  ctx.moveTo(headX + 10, headY - 18);
  ctx.bezierCurveTo(headX - 18, headY - 30, headX - 30, headY - 6, headX - 26, headY + 12 - p.hairLift * 0.2);
  ctx.bezierCurveTo(headX - 32 - p.hairLift * 0.5, headY + 26 - p.hairLift, headX - 20, headY + 38 - p.hairLift, headX - 10, headY + 30 - p.hairLift * 0.4);
  ctx.bezierCurveTo(headX - 4, headY + 36 - p.hairLift * 0.3, headX + 4, headY + 26, headX + 6, headY + 18);
  ctx.closePath();
  ctx.fill();

  // ---------------- perna da frente
  const [fx, fy] = limb(ctx, cx + 3, hipY, p.legFront, 19, 19, 11, JEANS, true);
  shoe(ctx, fx, fy);

  // ---------------- tronco
  ctx.save();
  ctx.translate(cx, hipY);
  ctx.rotate(p.lean);
  ctx.fillStyle = JEANS;
  ctx.beginPath();
  ctx.roundRect(-11, -8, 22, 12, 5);
  ctx.fill();
  ctx.fillStyle = TOP;
  ctx.beginPath();
  ctx.moveTo(-10, -2);
  ctx.bezierCurveTo(-13, -14, -12, -26, -8, -31);
  ctx.lineTo(8, -31);
  ctx.bezierCurveTo(12, -26, 13, -14, 10, -2);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = TOP_SHADE;
  ctx.fillRect(-10, -6, 20, 3);
  // pescoço
  ctx.fillStyle = SKIN;
  ctx.fillRect(-3, -36, 7, 7);
  // decote em V
  ctx.beginPath();
  ctx.moveTo(-4, -31);
  ctx.lineTo(0, -25);
  ctx.lineTo(5, -31);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // ---------------- cabeça
  ctx.fillStyle = SKIN;
  ctx.beginPath();
  ctx.ellipse(headX, headY, 15, 16.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // orelha + argola dourada
  ctx.fillStyle = SKIN_SHADE;
  ctx.beginPath();
  ctx.ellipse(headX - 4, headY + 2, 3.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(headX - 4, headY + 9, 3, 0, Math.PI * 2);
  ctx.stroke();

  // franja / topo do cabelo
  ctx.fillStyle = HAIR;
  ctx.beginPath();
  ctx.moveTo(headX - 16, headY + 4);
  ctx.bezierCurveTo(headX - 18, headY - 16, headX - 4, headY - 22, headX + 8, headY - 18);
  ctx.bezierCurveTo(headX + 16, headY - 15, headX + 18, headY - 6, headX + 15, headY - 3);
  ctx.bezierCurveTo(headX + 8, headY - 10, headX + 2, headY - 9, headX - 6, headY - 6);
  ctx.bezierCurveTo(headX - 8, headY - 2, headX - 10, headY + 2, headX - 16, headY + 4);
  ctx.fill();
  ctx.strokeStyle = HAIR_LIGHT;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(headX - 8, headY - 16);
  ctx.quadraticCurveTo(headX + 2, headY - 19, headX + 9, headY - 14);
  ctx.stroke();

  // olho
  const eyeX = headX + 7;
  const eyeY = headY + 1;
  ctx.fillStyle = '#2A1A14';
  ctx.strokeStyle = '#2A1A14';
  ctx.lineWidth = 1.8;
  if (p.eyes === 'closed') {
    ctx.beginPath();
    ctx.moveTo(eyeX - 3, eyeY);
    ctx.quadraticCurveTo(eyeX, eyeY + 2, eyeX + 3, eyeY);
    ctx.stroke();
  } else if (p.eyes === 'happy') {
    ctx.beginPath();
    ctx.moveTo(eyeX - 3, eyeY + 1);
    ctx.quadraticCurveTo(eyeX, eyeY - 3, eyeX + 3, eyeY + 1);
    ctx.stroke();
  } else {
    const r = p.eyes === 'wide' ? 3.1 : 2.6;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, r * 0.85, r, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(eyeX + 0.9, eyeY - 1, 0.9, 0, Math.PI * 2);
    ctx.fill();
    // cílios
    ctx.beginPath();
    ctx.moveTo(eyeX + 1.5, eyeY - r);
    ctx.lineTo(eyeX + 4, eyeY - r - 1.5);
    ctx.stroke();
  }
  // sobrancelha
  ctx.strokeStyle = HAIR;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(eyeX - 3, eyeY - 6 - (p.eyes === 'wide' ? 1.5 : 0));
  ctx.quadraticCurveTo(eyeX + 1, eyeY - 8, eyeX + 5, eyeY - 6);
  ctx.stroke();

  // blush (a marca, sempre presente)
  ctx.fillStyle = 'rgba(217, 142, 149, 0.55)';
  ctx.beginPath();
  ctx.ellipse(headX + 6, headY + 7, 4, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // nariz
  ctx.strokeStyle = SKIN_SHADE;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(headX + 14, headY + 2);
  ctx.quadraticCurveTo(headX + 16.5, headY + 6, headX + 13.5, headY + 7);
  ctx.stroke();
  // boca
  const mx = headX + 10;
  const my = headY + 11;
  ctx.fillStyle = '#B5605F';
  ctx.strokeStyle = '#9A4A4B';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (p.mouth === 'open') {
    ctx.ellipse(mx, my, 3, 2.4, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.mouth === 'o') {
    ctx.ellipse(mx, my, 1.8, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.mouth === 'flat') {
    ctx.moveTo(mx - 3, my);
    ctx.lineTo(mx + 2.5, my);
    ctx.stroke();
  } else {
    ctx.moveTo(mx - 3.5, my - 0.5);
    ctx.quadraticCurveTo(mx, my + 2.6, mx + 3, my - 1);
    ctx.stroke();
  }

  // ---------------- braço da frente (por cima de tudo)
  ctx.save();
  ctx.translate(cx, hipY - 27);
  ctx.rotate(p.lean);
  ctx.translate(-cx, -(hipY - 27));
  // manguinha
  ctx.fillStyle = TOP;
  ctx.beginPath();
  ctx.arc(cx + 3, hipY - 26, 5.5, 0, Math.PI * 2);
  ctx.fill();
  const [hx, hy] = limb(ctx, cx + 3, hipY - 24, p.armFront, 14, 14, 7, SKIN, false);
  if (p.phone) {
    ctx.fillStyle = '#2A262C';
    ctx.beginPath();
    ctx.roundRect(hx - 3, hy - 9, 7, 12, 2);
    ctx.fill();
    ctx.fillStyle = '#F0D5D8';
    ctx.fillRect(hx - 2, hy - 8, 5, 9);
  }
  ctx.restore();

  ctx.restore();
}

/** Gera a folha de quadros da Maya num canvas (um quadro ao lado do outro). */
export function buildMayaSheet(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = MAYA_FRAME_W * MAYA_FRAME_NAMES.length;
  canvas.height = MAYA_FRAME_H;
  const ctx = canvas.getContext('2d')!;
  MAYA_FRAME_NAMES.forEach((name, index) => {
    ctx.save();
    ctx.translate(index * MAYA_FRAME_W, 0);
    ctx.beginPath();
    ctx.rect(0, 0, MAYA_FRAME_W, MAYA_FRAME_H);
    ctx.clip();
    drawMaya(ctx, MAYA_FRAMES[name]!);
    ctx.restore();
  });
  return canvas;
}
