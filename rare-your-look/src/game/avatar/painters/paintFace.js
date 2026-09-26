/**
 * Camadas 6–10 (SPEC §7): face_features + as quatro camadas de maquiagem.
 *
 * Cada camada de maquiagem lê `model.makeup[slot]` (produto resolvido) e
 * `model.intensity[slot]` (0–1) — é a intensidade que anima o produto
 * "sendo aplicado" na StudioScene e nos tutoriais.
 */
import {
  EYE, BROW, NOSE, MOUTH, CHEEK,
  facePath, eyePath, lipsPath, mouthLinePath, lidPath, softRadial,
} from './geometry.js';
import { alpha, darken, lighten, mix } from '../../../shared/color.js';
import { createRng } from '../../../shared/random.js';

const eyeX = (dir) => 200 + dir * EYE.dx; // dir -1 = lado esquerdo da tela

/** Mancha suave em forma de elipse inclinada (blush, bronzer, iluminador). */
function softEllipse(ctx, x, y, rx, ry, angleRad, color, intensity) {
  if (intensity <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);
  ctx.scale(1, ry / rx);
  ctx.fillStyle = softRadial(ctx, 0, 0, rx, color, intensity);
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function sparkles(ctx, cx, cy, spread, color, count, seed, size = 1.5) {
  const rng = createRng(seed);
  ctx.fillStyle = alpha(lighten(color, 0.6), 0.85);
  for (let i = 0; i < count; i++) {
    const x = cx + (rng() - 0.5) * spread;
    const y = cy + (rng() - 0.5) * spread * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, size * (0.6 + rng() * 0.8), 0, Math.PI * 2);
    ctx.fill();
  }
}

// ------------------------------------------------------- 6. face_features
export function paintFaceFeatures(ctx, model) {
  const { skin, eye, brow } = model;

  ctx.save();
  facePath(ctx);
  ctx.clip();

  if (model.features.freckles) paintFreckles(ctx, model);

  // sobrancelhas
  ctx.fillStyle = brow;
  paintBrow(ctx, -1);
  paintBrow(ctx, 1);

  // olhos
  paintEye(ctx, -1, eye, skin);
  paintEye(ctx, 1, eye, skin);

  // nariz
  ctx.strokeStyle = alpha(skin.shadow, 0.8);
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(190, NOSE.y - 16);
  ctx.quadraticCurveTo(187, NOSE.y, 196, NOSE.y + 3);
  ctx.stroke();
  ctx.fillStyle = alpha(skin.shadow, 0.55);
  for (const x of [190, 210]) {
    ctx.beginPath();
    ctx.ellipse(x, NOSE.y + 4, 3.4, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // lábios naturais
  ctx.fillStyle = skin.lip;
  lipsPath(ctx);
  ctx.fill();
  ctx.strokeStyle = alpha(darken(skin.lip, 0.4), 0.7);
  ctx.lineWidth = 1.8;
  mouthLinePath(ctx);
  ctx.stroke();

  if (model.features.scar) paintScar(ctx, model);
  if (model.features.mole) {
    ctx.fillStyle = alpha(darken(skin.shadow, 0.4), 0.85);
    ctx.beginPath();
    ctx.arc(233, 292, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function paintBrow(ctx, dir) {
  const cx = eyeX(dir);
  const inner = cx - dir * 24;
  const outer = cx + dir * 23;
  ctx.beginPath();
  ctx.moveTo(inner, BROW.y + 5);
  ctx.bezierCurveTo(cx - dir * 10, BROW.y - 6, cx + dir * 8, BROW.y - 8, outer, BROW.y + 2);
  ctx.bezierCurveTo(cx + dir * 8, BROW.y - 1, cx - dir * 10, BROW.y + 1, inner, BROW.y + 9);
  ctx.closePath();
  ctx.fill();
}

function paintEye(ctx, dir, eyeColor, skin) {
  const cx = eyeX(dir);
  ctx.save();
  eyePath(ctx, cx);
  ctx.clip();

  ctx.fillStyle = '#FBF5F3';
  ctx.fillRect(cx - 24, EYE.y - 20, 48, 40);

  ctx.fillStyle = eyeColor;
  ctx.beginPath();
  ctx.arc(cx, EYE.y - 0.5, 9.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = alpha(darken(eyeColor, 0.45), 0.8);
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.fillStyle = '#17151A';
  ctx.beginPath();
  ctx.arc(cx, EYE.y - 0.5, 4.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath();
  ctx.arc(cx - 3.4, EYE.y - 4.2, 2.3, 0, Math.PI * 2);
  ctx.fill();

  // sombra da pálpebra
  ctx.fillStyle = alpha(skin.shadow, 0.3);
  ctx.fillRect(cx - 24, EYE.y - 22, 48, 16);
  ctx.restore();

  // linha dos cílios
  ctx.strokeStyle = alpha('#2A1E1B', 0.85);
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - EYE.w, EYE.y);
  ctx.bezierCurveTo(cx - EYE.w * 0.52, EYE.y - EYE.h * 1.7, cx + EYE.w * 0.55, EYE.y - EYE.h * 1.6, cx + EYE.w, EYE.y - 1);
  ctx.stroke();
  ctx.strokeStyle = alpha('#2A1E1B', 0.3);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx - EYE.w * 0.8, EYE.y + 4);
  ctx.quadraticCurveTo(cx, EYE.y + EYE.h * 1.25, cx + EYE.w * 0.85, EYE.y + 2);
  ctx.stroke();
}

function paintFreckles(ctx, model) {
  const rng = createRng(model.seed * 17 + 4);
  ctx.fillStyle = alpha(darken(model.skin.shadow, 0.25), 0.5);
  for (let i = 0; i < 54; i++) {
    const side = rng() < 0.5 ? -1 : 1;
    const spread = rng();
    const x = 200 + side * (8 + spread * 58) + (rng() - 0.5) * 10;
    const y = 228 + (rng() - 0.5) * 42 + spread * 8;
    ctx.beginPath();
    ctx.arc(x, y, 1 + rng() * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintScar(ctx, model) {
  const { skin } = model;
  // falha na sobrancelha + marca clara na têmpora
  ctx.strokeStyle = skin.base;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(150, 176);
  ctx.lineTo(157, 194);
  ctx.stroke();

  ctx.strokeStyle = alpha(mix(skin.base, '#E9AFA8', 0.55), 0.9);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(147, 168);
  ctx.lineTo(160, 202);
  ctx.stroke();
  ctx.strokeStyle = alpha(lighten(skin.base, 0.3), 0.8);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(148, 170);
  ctx.lineTo(159, 199);
  ctx.stroke();
}

// --------------------------------------------------------- 7. makeup_base
export function paintMakeupBase(ctx, model) {
  const product = model.makeup.bronzer;
  if (!product) return;
  const strength = 0.34 * (model.intensity.bronzer ?? 1);

  ctx.save();
  facePath(ctx);
  ctx.clip();
  // têmporas
  softEllipse(ctx, 134, 170, 40, 30, -0.4, product.color, strength);
  softEllipse(ctx, 266, 170, 40, 30, 0.4, product.color, strength);
  // abaixo das maçãs
  softEllipse(ctx, 146, 258, 46, 16, 0.38, product.color, strength);
  softEllipse(ctx, 254, 258, 46, 16, -0.38, product.color, strength);
  // mandíbula e nariz
  softEllipse(ctx, 200, 300, 54, 14, 0, product.color, strength * 0.7);
  softEllipse(ctx, 200, 228, 9, 34, 0, product.color, strength * 0.5);
  ctx.restore();
}

// --------------------------------------------------------- 8. makeup_eyes
export function paintMakeupEyes(ctx, model) {
  const { eyeshadow, liner, mascara } = model.makeup;

  if (eyeshadow) {
    const intensity = model.intensity.eyeshadow ?? 1;
    ctx.save();
    facePath(ctx);
    ctx.clip();
    for (const dir of [-1, 1]) {
      const cx = eyeX(dir);
      ctx.save();
      lidPath(ctx, cx, 1);
      ctx.clip();
      const gradient = ctx.createLinearGradient(0, EYE.y + 4, 0, EYE.y - 26);
      gradient.addColorStop(0, alpha(eyeshadow.color, 0.9 * intensity));
      gradient.addColorStop(0.6, alpha(eyeshadow.color, 0.55 * intensity));
      gradient.addColorStop(1, alpha(eyeshadow.color, 0.05 * intensity));
      ctx.fillStyle = gradient;
      ctx.fillRect(cx - 34, EYE.y - 32, 68, 44);
      ctx.restore();
      if (eyeshadow.finish === 'shimmer') {
        sparkles(ctx, cx, EYE.y - 8, 30, eyeshadow.color, 9, model.seed + dir * 3, 1.2);
      }
    }
    ctx.restore();
  }

  if (liner) {
    const intensity = model.intensity.liner ?? 1;
    ctx.save();
    ctx.globalAlpha = intensity;
    ctx.fillStyle = liner.color;
    for (const dir of [-1, 1]) {
      const cx = eyeX(dir);
      const w = EYE.w;
      const h = EYE.h;
      ctx.beginPath();
      ctx.moveTo(cx - dir * w, EYE.y + 1.5);
      ctx.bezierCurveTo(cx - dir * w * 0.5, EYE.y - h * 1.95, cx + dir * w * 0.58, EYE.y - h * 1.9, cx + dir * (w + 2), EYE.y - 4);
      ctx.lineTo(cx + dir * (w + 17), EYE.y - 15);
      ctx.lineTo(cx + dir * (w + 3), EYE.y + 1);
      ctx.bezierCurveTo(cx + dir * w * 0.55, EYE.y - h * 0.95, cx - dir * w * 0.5, EYE.y - h * 0.85, cx - dir * w, EYE.y + 1.5);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  if (mascara) {
    const intensity = model.intensity.mascara ?? 1;
    ctx.save();
    ctx.globalAlpha = intensity;
    ctx.strokeStyle = mascara.color;
    ctx.lineCap = 'round';
    for (const dir of [-1, 1]) {
      const cx = eyeX(dir);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - EYE.w, EYE.y);
      ctx.bezierCurveTo(cx - EYE.w * 0.52, EYE.y - EYE.h * 1.75, cx + EYE.w * 0.55, EYE.y - EYE.h * 1.65, cx + EYE.w, EYE.y - 1);
      ctx.stroke();
      ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) {
        const t = 0.1 + (i / 5) * 0.85;
        const x = cx - EYE.w + t * EYE.w * 2;
        const lift = Math.sin(t * Math.PI) * EYE.h * 1.6;
        const y = EYE.y - lift;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.quadraticCurveTo(x + dir * 3, y - 6, x + dir * 7, y - 9);
        ctx.stroke();
      }
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) {
        const x = cx - 8 + i * 8;
        ctx.beginPath();
        ctx.moveTo(x, EYE.y + EYE.h * 0.9);
        ctx.lineTo(x + dir * 1.5, EYE.y + EYE.h * 1.6);
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}

// ------------------------------------------------------- 9. makeup_cheeks
export function paintMakeupCheeks(ctx, model) {
  const { blush, highlight } = model.makeup;

  ctx.save();
  facePath(ctx);
  ctx.clip();

  if (blush) {
    const intensity = (model.intensity.blush ?? 1) * (blush.finish === 'dewy' ? 0.56 : 0.5);
    softEllipse(ctx, 200 - CHEEK.dx, CHEEK.y, 42, 30, -0.3, blush.color, intensity);
    softEllipse(ctx, 200 + CHEEK.dx, CHEEK.y, 42, 30, 0.3, blush.color, intensity);
    if (blush.finish === 'dewy') {
      sparkles(ctx, 200 - CHEEK.dx, CHEEK.y - 4, 34, blush.color, 6, model.seed + 41, 1);
      sparkles(ctx, 200 + CHEEK.dx, CHEEK.y - 4, 34, blush.color, 6, model.seed + 42, 1);
    }
  }

  if (highlight) {
    const intensity = 0.5 * (model.intensity.highlight ?? 1);
    softEllipse(ctx, 158, 230, 28, 12, -0.28, highlight.color, intensity);
    softEllipse(ctx, 242, 230, 28, 12, 0.28, highlight.color, intensity);
    softEllipse(ctx, 200, 226, 8, 26, 0, highlight.color, intensity * 0.85);
    softEllipse(ctx, 200, MOUTH.y - 11, 12, 5, 0, highlight.color, intensity * 0.9);
    softEllipse(ctx, 200, 140, 34, 12, 0, highlight.color, intensity * 0.5);
    sparkles(ctx, 158, 230, 30, highlight.color, 7, model.seed + 51, 1.1);
    sparkles(ctx, 242, 230, 30, highlight.color, 7, model.seed + 52, 1.1);
  }

  ctx.restore();
}

// -------------------------------------------------------- 10. makeup_lips
export function paintMakeupLips(ctx, model) {
  const { lipstick, lipoil } = model.makeup;
  if (!lipstick && !lipoil) return;

  if (lipstick) {
    const intensity = model.intensity.lipstick ?? 1;
    ctx.save();
    ctx.globalAlpha = 0.94 * intensity;
    ctx.fillStyle = lipstick.color;
    lipsPath(ctx);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = alpha(darken(lipstick.color, 0.35), 0.75 * intensity);
    ctx.lineWidth = 1.8;
    mouthLinePath(ctx);
    ctx.stroke();
    // volume do lábio inferior
    ctx.save();
    lipsPath(ctx);
    ctx.clip();
    ctx.fillStyle = softRadial(ctx, 200, MOUTH.y + 11, 20, lighten(lipstick.color, 0.35), 0.28 * intensity);
    ctx.fillRect(170, MOUTH.y, 60, 24);
    ctx.restore();
    ctx.restore();
  }

  if (lipoil) {
    const intensity = model.intensity.lipoil ?? 1;
    ctx.save();
    ctx.globalAlpha = (lipstick ? 0.34 : 0.62) * intensity;
    ctx.fillStyle = lipoil.color;
    lipsPath(ctx);
    ctx.fill();
    ctx.restore();

    // brilho glossy
    ctx.save();
    lipsPath(ctx);
    ctx.clip();
    ctx.globalAlpha = intensity;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath();
    ctx.ellipse(196, MOUTH.y + 10, 11, 4, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(211, MOUTH.y - 3, 6, 2.4, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
