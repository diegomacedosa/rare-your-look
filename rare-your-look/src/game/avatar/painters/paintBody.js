/**
 * Camadas 1–4 do avatar (SPEC §7): base_skin, body_shape,
 * clothes_bottom e clothes_top.
 */
import {
  W, H, FACE, EAR, NECK, WAIST_Y, SLEEVE_SHORT, SLEEVE_LONG,
  facePath, neckPath, bodyPath, blob, roundedRect, softRadial,
} from './geometry.js';
import { alpha, darken, lighten, mix } from '../../../shared/color.js';
import { createRng } from '../../../shared/random.js';

const VITILIGO_TINT = '#F7E9E0';

/** Manchas de vitiligo — desenho estável por semente. */
function paintVitiligo(ctx, model, spots, seed) {
  const rng = createRng(model.seed * 31 + seed);
  ctx.fillStyle = mix(model.skin.base, VITILIGO_TINT, 0.82);
  for (const [x, y, r] of spots) {
    blob(ctx, x, y, r, rng, 0.5, 11);
    ctx.fill();
  }
}

// ------------------------------------------------------------ 1. base_skin
export function paintBaseSkin(ctx, model) {
  const { skin } = model;

  // orelhas
  for (const x of [EAR.left, EAR.right]) {
    ctx.fillStyle = skin.base;
    ctx.beginPath();
    ctx.ellipse(x, EAR.y, EAR.rx, EAR.ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = alpha(skin.shadow, 0.55);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(x, EAR.y + 1, EAR.rx * 0.45, EAR.ry * 0.5, 0, -0.6, 2.4);
    ctx.stroke();
  }

  // pescoço + sombra do queixo
  ctx.fillStyle = skin.base;
  neckPath(ctx);
  ctx.fill();
  ctx.save();
  neckPath(ctx);
  ctx.clip();
  ctx.fillStyle = softRadial(ctx, 200, 268, 62, skin.shadow, 0.55);
  ctx.fillRect(130, 240, 140, 90);
  ctx.restore();

  // rosto
  ctx.fillStyle = skin.base;
  facePath(ctx);
  ctx.fill();

  // volume: têmporas e mandíbula
  ctx.save();
  facePath(ctx);
  ctx.clip();
  ctx.fillStyle = softRadial(ctx, 126, 176, 56, skin.shadow, 0.3);
  ctx.fillRect(100, 120, 90, 130);
  ctx.fillStyle = softRadial(ctx, 274, 176, 56, skin.shadow, 0.3);
  ctx.fillRect(210, 120, 90, 130);
  ctx.fillStyle = softRadial(ctx, 200, 312, 70, skin.shadow, 0.22);
  ctx.fillRect(120, 270, 160, 50);

  if (model.features.vitiligo) {
    paintVitiligo(ctx, model, [
      [247, 194, 21], [259, 231, 12], [163, 288, 13], [145, 213, 11], [205, 149, 13],
    ], 1);
  }
  ctx.restore();

  if (model.features.vitiligo) {
    ctx.save();
    neckPath(ctx);
    ctx.clip();
    paintVitiligo(ctx, model, [[188, 330, 20], [220, 300, 13]], 2);
    ctx.restore();
  }
}

// ----------------------------------------------------------- 2. body_shape
export function paintBodyShape(ctx, model) {
  const { skin, metrics } = model;

  if (model.mobility === 'wheelchair') paintWheelchairBack(ctx, metrics);

  ctx.fillStyle = skin.base;
  bodyPath(ctx, metrics);
  ctx.fill();

  ctx.save();
  bodyPath(ctx, metrics);
  ctx.clip();

  // sombra do pescoço sobre o peito + clavículas
  ctx.fillStyle = softRadial(ctx, 200, 350, 78, skin.shadow, 0.42);
  ctx.fillRect(120, 320, 160, 90);
  ctx.strokeStyle = alpha(skin.shadow, 0.5);
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(176, 382);
  ctx.quadraticCurveTo(152, 392, metrics.L + 18, 386);
  ctx.moveTo(224, 382);
  ctx.quadraticCurveTo(248, 392, metrics.R - 18, 386);
  ctx.stroke();

  // separação braço/tronco
  ctx.strokeStyle = alpha(skin.shadow, 0.35);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(metrics.armInnerL, 404);
  ctx.quadraticCurveTo(metrics.armInnerL - 4, 470, metrics.armInnerL + 2, H);
  ctx.moveTo(metrics.armInnerR, 404);
  ctx.quadraticCurveTo(metrics.armInnerR + 4, 470, metrics.armInnerR - 2, H);
  ctx.stroke();

  if (model.features.vitiligo) {
    paintVitiligo(ctx, model, [
      [metrics.armOuterL + 26, 500, 26], [200, 430, 22], [metrics.armInnerR - 10, 470, 18],
    ], 3);
  }

  if (model.prosthetic !== 'none') paintProsthetic(ctx, model);
  ctx.restore();

  // volume geral do corpo
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  const shade = ctx.createLinearGradient(0, 340, 0, H);
  shade.addColorStop(0, 'rgba(255,255,255,0.06)');
  shade.addColorStop(1, 'rgba(0,0,0,0.10)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 300, W, H);
  ctx.restore();
}

/** Encosto e manoplas da cadeira de rodas (ficam atrás do corpo). */
function paintWheelchairBack(ctx, metrics) {
  const xs = [metrics.L + 24, metrics.R - 24];
  for (const x of xs) {
    ctx.fillStyle = '#42424C';
    roundedRect(ctx, x - 6, 316, 12, H - 316, 6);
    ctx.fill();
    ctx.fillStyle = '#2A2A33';
    roundedRect(ctx, x - 8, 300, 16, 30, 8);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    roundedRect(ctx, x - 3, 320, 3, H - 330, 2);
    ctx.fill();
  }
  // encosto
  ctx.fillStyle = '#4A4A55';
  roundedRect(ctx, metrics.L + 18, 392, metrics.R - metrics.L - 36, 120, 10);
  ctx.fill();
}

/** Prótese de braço — carbono claro com detalhe rosé da marca. */
function paintProsthetic(ctx, model) {
  const m = model.metrics;
  // 'left' = braço esquerdo do avatar = lado direito da tela
  const onScreenLeft = model.prosthetic === 'right';
  const x0 = onScreenLeft ? m.armOuterL - 10 : m.armInnerR;
  const x1 = onScreenLeft ? m.armInnerL : m.armOuterR + 10;
  const top = 448;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, top, x1 - x0, H - top);
  ctx.clip();

  const metal = ctx.createLinearGradient(x0, 0, x1, 0);
  metal.addColorStop(0, '#8E94A0');
  metal.addColorStop(0.42, '#D9DDE2');
  metal.addColorStop(1, '#878D9A');
  ctx.fillStyle = metal;
  ctx.fillRect(x0, top, x1 - x0, H - top);

  // encaixe + anel rosé
  ctx.fillStyle = '#5E6470';
  ctx.fillRect(x0, top, x1 - x0, 16);
  ctx.fillStyle = '#C4929A';
  ctx.fillRect(x0, top + 16, x1 - x0, 7);

  // articulação e linhas da mão mecânica
  ctx.strokeStyle = 'rgba(40,44,52,0.55)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x0, 516);
  ctx.lineTo(x1, 516);
  for (let i = 1; i <= 3; i++) {
    const x = x0 + ((x1 - x0) * i) / 4;
    ctx.moveTo(x, 524);
    ctx.lineTo(x, H);
  }
  ctx.stroke();
  ctx.restore();
}

// ------------------------------------------------------- 3. clothes_bottom
export function paintClothesBottom(ctx, model) {
  const { metrics, bottom } = model;
  const x = metrics.torsoL - 4;
  const width = metrics.torsoR - metrics.torsoL + 8;

  ctx.fillStyle = bottom.color;
  roundedRect(ctx, x, WAIST_Y - 12, width, H - WAIST_Y + 14, 14);
  ctx.fill();

  // cós
  ctx.fillStyle = darken(bottom.color, 0.12);
  roundedRect(ctx, x, WAIST_Y - 12, width, 16, 8);
  ctx.fill();

  // vinco central
  ctx.strokeStyle = alpha(darken(bottom.color, 0.35), 0.5);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(200, WAIST_Y + 8);
  ctx.lineTo(200, H);
  ctx.stroke();

  // volume: luz no centro, sombra nas laterais
  const volume = ctx.createLinearGradient(x, 0, x + width, 0);
  volume.addColorStop(0, 'rgba(0,0,0,0.18)');
  volume.addColorStop(0.45, 'rgba(255,255,255,0.10)');
  volume.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = volume;
  ctx.fillRect(x, WAIST_Y - 10, width, H - WAIST_Y + 10);

  if (bottom.style === 'jeans') {
    ctx.fillStyle = lighten(bottom.color, 0.35);
    ctx.beginPath();
    ctx.arc(200, WAIST_Y + 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = alpha('#FAF7F5', 0.4);
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(x + 8, WAIST_Y + 8);
    ctx.lineTo(x + width - 8, WAIST_Y + 8);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

// ---------------------------------------------------------- 4. clothes_top
export function paintClothesTop(ctx, model) {
  const { metrics, top } = model;
  const style = top.style;
  const longSleeve = style === 'turtleneck' || style === 'hoodie' || style === 'blazer';
  const hem = longSleeve ? SLEEVE_LONG : SLEEVE_SHORT;

  // corpo da peça (um pouco maior que a silhueta, como tecido)
  ctx.save();
  ctx.fillStyle = top.color;
  ctx.strokeStyle = top.color;
  ctx.lineWidth = 7;
  ctx.lineJoin = 'round';
  bodyPath(ctx, metrics);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  if (style === 'hoodie') {
    ctx.strokeStyle = darken(top.color, 0.14);
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.ellipse(200, 350, 66, 30, 0, Math.PI * 0.92, Math.PI * 2.08);
    ctx.stroke();
  }

  // ---- recortes (destination-out): decote, mangas e barra
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';

  if (style === 'offshoulder') {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, 368);
    ctx.bezierCurveTo(300, 366, 260, 398, 200, 398);
    ctx.bezierCurveTo(140, 398, 100, 366, 0, 368);
    ctx.closePath();
    ctx.fill();
  } else if (style === 'vneck' || style === 'blazer') {
    const depth = style === 'blazer' ? 452 : 404;
    ctx.beginPath();
    ctx.moveTo(166, 330);
    ctx.lineTo(200, depth);
    ctx.lineTo(234, 330);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(200, 338, 34, 18, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (style !== 'turtleneck') {
    ctx.beginPath();
    ctx.ellipse(200, 340, 36, 21, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // mangas
  ctx.fillRect(metrics.armOuterL - 10, hem, metrics.armInnerL - metrics.armOuterL + 10, H - hem);
  ctx.fillRect(metrics.armInnerR, hem, metrics.armOuterR - metrics.armInnerR + 10, H - hem);
  // barra da blusa (aparece a roupa de baixo)
  ctx.fillRect(metrics.armInnerL - 2, WAIST_Y, metrics.armInnerR - metrics.armInnerL + 4, H - WAIST_Y);
  ctx.restore();

  // ---- detalhes por estilo
  if (style === 'turtleneck') {
    ctx.fillStyle = top.color;
    roundedRect(ctx, 170, 286, 60, 70, 18);
    ctx.fill();
    ctx.strokeStyle = alpha(darken(top.color, 0.25), 0.7);
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(176 + i * 14, 290);
      ctx.lineTo(176 + i * 14, 352);
      ctx.stroke();
    }
  }

  if (style === 'blazer') {
    // regata por baixo
    ctx.fillStyle = '#FAF7F5';
    ctx.beginPath();
    ctx.moveTo(172, 332);
    ctx.lineTo(200, 452);
    ctx.lineTo(228, 332);
    ctx.closePath();
    ctx.fill();
    // lapelas
    ctx.fillStyle = lighten(top.color, 0.08);
    ctx.beginPath();
    ctx.moveTo(166, 330);
    ctx.lineTo(200, 456);
    ctx.lineTo(150, 420);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(234, 330);
    ctx.lineTo(200, 456);
    ctx.lineTo(250, 420);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = darken(top.color, 0.3);
    ctx.beginPath();
    ctx.arc(200, 478, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (style === 'hoodie') {
    ctx.strokeStyle = '#FAF7F5';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(186, 356);
    ctx.quadraticCurveTo(182, 400, 184, 432);
    ctx.moveTo(214, 356);
    ctx.quadraticCurveTo(218, 400, 216, 432);
    ctx.stroke();
    ctx.fillStyle = darken(top.color, 0.18);
    roundedRect(ctx, 168, 452, 64, 36, 16);
    ctx.fill();
  }

  if (style === 'offshoulder') {
    ctx.strokeStyle = lighten(top.color, 0.25);
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(metrics.armOuterL, 372);
    ctx.bezierCurveTo(120, 372, 150, 400, 200, 400);
    ctx.bezierCurveTo(250, 400, 280, 372, metrics.armOuterR, 372);
    ctx.stroke();
  }

  // barras e costuras
  ctx.strokeStyle = alpha(darken(top.color, 0.3), 0.5);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(metrics.armOuterL - 6, hem - 2);
  ctx.lineTo(metrics.armInnerL, hem - 2);
  ctx.moveTo(metrics.armInnerR, hem - 2);
  ctx.lineTo(metrics.armOuterR + 6, hem - 2);
  ctx.moveTo(metrics.armInnerL, WAIST_Y - 2);
  ctx.lineTo(metrics.armInnerR, WAIST_Y - 2);
  ctx.stroke();

  // volume do tecido
  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  const shade = ctx.createLinearGradient(0, 330, 0, H);
  shade.addColorStop(0, 'rgba(255,255,255,0.12)');
  shade.addColorStop(0.55, 'rgba(255,255,255,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.14)');
  ctx.fillStyle = shade;
  ctx.fillRect(0, 300, W, H);
  ctx.restore();
}
