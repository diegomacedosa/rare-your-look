/**
 * Geometria do avatar — todas as camadas desenham no mesmo sistema de
 * coordenadas lógico (400 × 560). O AvatarSystem escala para a resolução
 * real do canvas, então os desenhos ficam nítidos em qualquer DPI.
 *
 * Enquadramento: retrato até a cintura — rosto grande o suficiente para
 * a maquiagem aparecer, corpo suficiente para mostrar roupa, prótese e
 * cadeira de rodas.
 */

export const W = 400;
export const H = 560;

export const FACE = { cx: 200, cy: 205, top: 107, chin: 303, halfW: 78 };
export const EAR = { y: 216, rx: 12, ry: 21, left: 124, right: 276 };
export const NECK = { top: 258, bottom: 352, halfW: 26 };
export const EYE = { y: 212, dx: 34, w: 19, h: 9.5 };
export const BROW = { y: 184 };
export const NOSE = { y: 250 };
export const MOUTH = { cx: 200, y: 274, halfW: 25 };
export const CHEEK = { dx: 46, y: 248 };
export const WAIST_Y = 505;
export const SLEEVE_SHORT = 434;
export const SLEEVE_LONG = 528;

/** Medidas derivadas da largura dos ombros do avatar. */
export function bodyMetrics(shoulders = 248) {
  const L = 200 - shoulders / 2;
  const R = 200 + shoulders / 2;
  return {
    shoulders,
    L,
    R,
    armOuterL: L - 16,
    armInnerL: L + 36,
    armInnerR: R - 36,
    armOuterR: R + 16,
    torsoL: L + 34,
    torsoR: R - 34,
  };
}

// --------------------------------------------------------------- utilidades
export function roundedRect(ctx, x, y, w, h, r = 8) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Mancha orgânica (vitiligo, sardas grandes, sombras suaves). */
export function blob(ctx, cx, cy, radius, rng, wobble = 0.38, points = 9) {
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2;
    const r = radius * (1 - wobble / 2 + rng() * wobble);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r * 0.85;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** Gradiente radial suave — base de blush, iluminador e contorno. */
export function softRadial(ctx, x, y, radius, color, innerAlpha = 0.55) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  const [r, g, b] = colorParts(color);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${innerAlpha})`);
  gradient.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, ${innerAlpha * 0.5})`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  return gradient;
}

function colorParts(hex) {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  const int = Number.parseInt(full, 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

// ------------------------------------------------------------------ contornos
export function facePath(ctx) {
  ctx.beginPath();
  ctx.moveTo(200, 107);
  ctx.bezierCurveTo(248, 107, 278, 146, 278, 200);
  ctx.bezierCurveTo(278, 252, 246, 303, 200, 303);
  ctx.bezierCurveTo(154, 303, 122, 252, 122, 200);
  ctx.bezierCurveTo(122, 146, 152, 107, 200, 107);
  ctx.closePath();
}

export function neckPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(174, 256);
  ctx.lineTo(174, 312);
  ctx.bezierCurveTo(174, 334, 166, 344, 156, 352);
  ctx.lineTo(244, 352);
  ctx.bezierCurveTo(234, 344, 226, 334, 226, 312);
  ctx.lineTo(226, 256);
  ctx.closePath();
}

/** Silhueta do tronco + braços (base para pele, roupa e sombras). */
export function bodyPath(ctx, metrics) {
  const { L, R } = metrics;
  ctx.beginPath();
  ctx.moveTo(158, 346);
  ctx.bezierCurveTo(140, 356, L + 26, 356, L + 8, 378);
  ctx.bezierCurveTo(L - 4, 392, L - 10, 412, L - 12, 438);
  ctx.lineTo(L - 16, H);
  ctx.lineTo(R + 16, H);
  ctx.lineTo(R + 12, 438);
  ctx.bezierCurveTo(R + 10, 412, R + 4, 392, R - 8, 378);
  ctx.bezierCurveTo(R - 26, 356, 260, 356, 242, 346);
  ctx.closePath();
}

export function eyePath(ctx, cx, cy = EYE.y, w = EYE.w, h = EYE.h) {
  ctx.beginPath();
  ctx.moveTo(cx - w, cy);
  ctx.bezierCurveTo(cx - w * 0.52, cy - h * 1.7, cx + w * 0.55, cy - h * 1.6, cx + w, cy - 1);
  ctx.bezierCurveTo(cx + w * 0.55, cy + h * 1.2, cx - w * 0.5, cy + h * 1.25, cx - w, cy);
  ctx.closePath();
}

export function lipsPath(ctx, scale = 1) {
  const { cx, y, halfW } = MOUTH;
  const w = halfW * scale;
  ctx.beginPath();
  ctx.moveTo(cx - w, y);
  ctx.bezierCurveTo(cx - w * 0.62, y - 9, cx - w * 0.3, y - 10, cx - w * 0.12, y - 5);
  ctx.bezierCurveTo(cx - w * 0.05, y - 7.5, cx + w * 0.05, y - 7.5, cx + w * 0.12, y - 5);
  ctx.bezierCurveTo(cx + w * 0.3, y - 10, cx + w * 0.62, y - 9, cx + w, y);
  ctx.bezierCurveTo(cx + w * 0.76, y + 14, cx + w * 0.32, y + 18, cx, y + 18);
  ctx.bezierCurveTo(cx - w * 0.32, y + 18, cx - w * 0.76, y + 14, cx - w, y);
  ctx.closePath();
}

/** Linha da boca (abertura entre os lábios). */
export function mouthLinePath(ctx) {
  const { cx, y, halfW } = MOUTH;
  ctx.beginPath();
  ctx.moveTo(cx - halfW * 0.96, y);
  ctx.bezierCurveTo(cx - halfW * 0.4, y + 3.4, cx + halfW * 0.4, y + 3.4, cx + halfW * 0.96, y);
}

/** Região da pálpebra usada pela sombra (do cílio até a bacia do olho). */
export function lidPath(ctx, cx, spread = 1) {
  const y = EYE.y;
  const w = EYE.w * (1 + 0.18 * spread);
  ctx.beginPath();
  ctx.moveTo(cx - w, y + 1);
  ctx.bezierCurveTo(cx - w * 0.6, y - 12 * spread - 6, cx + w * 0.6, y - 12 * spread - 7, cx + w + 2, y - 3);
  ctx.bezierCurveTo(cx + w * 0.6, y + 6, cx - w * 0.5, y + 7, cx - w, y + 1);
  ctx.closePath();
}
