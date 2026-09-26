/**
 * Camada 12 (SPEC §7): acessórios — brincos, óculos, tapa-olho, aparelho
 * auditivo, colar, presilhas — e as rodas da cadeira, que ficam à frente
 * do corpo no enquadramento.
 */
import { EAR, EYE, roundedRect } from './geometry.js';
import { coversEars } from './paintHair.js';
import { alpha, lighten } from '../../../shared/color.js';

const GOLD = '#D9B25E';
const GOLD_DARK = '#A8823A';

const eyeX = (dir) => 200 + dir * EYE.dx;

export function paintAccessories(ctx, model) {
  const { accessories } = model;
  const earsVisible = !coversEars(model.hair.style);

  if (earsVisible) {
    paintEarrings(ctx, accessories.earrings);
    paintHearing(ctx, accessories.hearing);
  }
  paintEyewear(ctx, accessories.eyewear, model);
  paintNeck(ctx, accessories.neck, model);
  if (accessories.hairAcc === 'clips' && model.hair.style !== 'hijab') paintClips(ctx);
  if (model.mobility === 'wheelchair') paintWheels(ctx, model.metrics);
}

function paintEarrings(ctx, type) {
  if (!type || type === 'none') return;
  for (const x of [EAR.left - 1, EAR.right + 1]) {
    if (type === 'studs') {
      ctx.fillStyle = GOLD;
      ctx.beginPath();
      ctx.arc(x, EAR.y + 16, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.beginPath();
      ctx.arc(x - 1, EAR.y + 15, 1.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === 'hoops') {
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, EAR.y + 28, 13, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = alpha(lighten(GOLD, 0.5), 0.8);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, EAR.y + 28, 13, Math.PI * 0.85, Math.PI * 1.35);
      ctx.stroke();
    } else if (type === 'pearls') {
      ctx.fillStyle = GOLD;
      ctx.beginPath();
      ctx.arc(x, EAR.y + 15, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = GOLD_DARK;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x, EAR.y + 17);
      ctx.lineTo(x, EAR.y + 24);
      ctx.stroke();
      const pearl = ctx.createRadialGradient(x - 2, EAR.y + 28, 1, x, EAR.y + 30, 7);
      pearl.addColorStop(0, '#FFFFFF');
      pearl.addColorStop(1, '#E7D8D6');
      ctx.fillStyle = pearl;
      ctx.beginPath();
      ctx.arc(x, EAR.y + 30, 6.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function paintEyewear(ctx, type, model) {
  if (!type || type === 'none') return;

  if (type === 'eye_patch') {
    // tapa-olho no olho esquerdo da tela + tiras passando acima do outro olho
    ctx.strokeStyle = '#2A2529';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(146, 202);
    ctx.lineTo(118, 190);
    ctx.moveTo(186, 200);
    ctx.lineTo(278, 176);
    ctx.stroke();
    ctx.fillStyle = '#25212A';
    ctx.beginPath();
    ctx.ellipse(eyeX(-1), EYE.y - 1, 27, 24, -0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(eyeX(-1) - 6, EYE.y - 8, 12, Math.PI * 0.9, Math.PI * 1.5);
    ctx.stroke();
    return;
  }

  const dark = type === 'sunglasses';
  const frame = dark ? '#221F22' : '#3A2F2C';

  // hastes até as orelhas
  ctx.strokeStyle = frame;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(eyeX(-1) - 26, EYE.y - 4);
  ctx.lineTo(EAR.left - 2, EAR.y - 2);
  ctx.moveTo(eyeX(1) + 26, EYE.y - 4);
  ctx.lineTo(EAR.right + 2, EAR.y - 2);
  ctx.stroke();

  for (const dir of [-1, 1]) {
    const cx = eyeX(dir);
    if (dark) {
      ctx.fillStyle = 'rgba(32,26,32,0.84)';
      ctx.beginPath();
      ctx.ellipse(cx, EYE.y - 2, 27, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 16, EYE.y + 8);
      ctx.lineTo(cx + 2, EYE.y - 12);
      ctx.stroke();
    }
    ctx.strokeStyle = frame;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.ellipse(cx, EYE.y - 2, 27, 22, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // ponte
  ctx.strokeStyle = frame;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(eyeX(-1) + 27, EYE.y - 6);
  ctx.quadraticCurveTo(200, EYE.y - 12, eyeX(1) - 27, EYE.y - 6);
  ctx.stroke();
  void model;
}

function paintHearing(ctx, type) {
  if (!type || type === 'none') return;
  const x = EAR.right + 4;

  ctx.fillStyle = '#C4929A';
  roundedRect(ctx, x, EAR.y - 16, 11, 30, 5.5);
  ctx.fill();
  ctx.fillStyle = alpha('#8A5A62', 0.8);
  roundedRect(ctx, x + 2, EAR.y - 12, 3, 20, 1.5);
  ctx.fill();

  ctx.strokeStyle = '#E8D6D2';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(x + 2, EAR.y - 14);
  ctx.quadraticCurveTo(x - 10, EAR.y - 18, EAR.right - 2, EAR.y + 2);
  ctx.stroke();

  if (type === 'cochlear') {
    ctx.strokeStyle = '#C4929A';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(x + 6, EAR.y - 16);
    ctx.quadraticCurveTo(x + 22, EAR.y - 40, 292, 168);
    ctx.stroke();
    ctx.fillStyle = '#C4929A';
    ctx.beginPath();
    ctx.arc(292, 166, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = alpha('#FAF7F5', 0.55);
    ctx.beginPath();
    ctx.arc(292, 166, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function paintNeck(ctx, type, model) {
  if (type !== 'gold') return;
  const drop = model.top.style === 'turtleneck' ? 22 : 0;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2.6;
  ctx.beginPath();
  ctx.moveTo(172, 352 + drop);
  ctx.quadraticCurveTo(200, 384 + drop, 228, 352 + drop);
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(200, 380 + drop, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = alpha('#FFFFFF', 0.6);
  ctx.beginPath();
  ctx.arc(198.5, 378.5 + drop, 1.6, 0, Math.PI * 2);
  ctx.fill();
}

function paintClips(ctx) {
  ctx.save();
  ctx.translate(146, 150);
  ctx.rotate(-0.5);
  ctx.fillStyle = GOLD;
  roundedRect(ctx, 0, 0, 22, 7, 3.5);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.translate(152, 166);
  ctx.rotate(-0.35);
  ctx.fillStyle = '#F5E9E6';
  roundedRect(ctx, 0, 0, 20, 6.5, 3);
  ctx.fill();
  ctx.strokeStyle = GOLD_DARK;
  ctx.lineWidth = 1.2;
  roundedRect(ctx, 0, 0, 20, 6.5, 3);
  ctx.stroke();
  ctx.restore();
}

/** Rodas da cadeira — vista levemente em perspectiva, à frente dos braços. */
function paintWheels(ctx, metrics) {
  for (const dir of [-1, 1]) {
    const cx = 200 + dir * (metrics.shoulders / 2 + 24);
    const cy = 600;
    const rx = 36;
    const ry = 118;

    ctx.strokeStyle = '#2B2B33';
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#AEB4BD';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx - 11, ry - 13, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(190,196,204,0.8)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * (rx - 8), cy + Math.sin(angle) * (ry - 10));
      ctx.stroke();
    }

    ctx.fillStyle = '#6E7480';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
