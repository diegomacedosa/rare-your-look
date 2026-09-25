/**
 * Camadas 5 e 11 (SPEC §7): hair_base (volume atrás da cabeça/ombros) e
 * hair_overlay (o que cai sobre o rosto, depois da maquiagem).
 *
 * O hair_base é composto com `destination-over` pelo AvatarSystem, então
 * o mesmo desenho fica naturalmente atrás de pele, roupa e corpo.
 */
import { H, roundedRect } from './geometry.js';
import { alpha, darken, lighten } from '../../utils/color.js';
import { createRng } from '../../utils/random.js';

/** Calota do cabelo: do alto da cabeça até a linha do cabelo. */
function capPath(ctx, { top = 90, sideL = 116, sideR = 284, hairline = 152, temple = 198 } = {}) {
  ctx.beginPath();
  ctx.moveTo(sideL, temple);
  ctx.bezierCurveTo(sideL - 6, 132, 150, top, 200, top);
  ctx.bezierCurveTo(250, top, sideR + 6, 132, sideR, temple);
  ctx.bezierCurveTo(270, hairline + 18, 246, hairline, 200, hairline);
  ctx.bezierCurveTo(154, hairline, 130, hairline + 18, sideL, temple);
  ctx.closePath();
}

/**
 * Reflexo do cabelo — sempre recortado na própria calota, senão vira
 * um arco flutuando acima da cabeça.
 */
function shine(ctx, color, capOptions = {}, { cx = 196, cy = 140, r = 58 } = {}) {
  ctx.save();
  capPath(ctx, capOptions);
  ctx.clip();
  ctx.strokeStyle = alpha(lighten(color, 0.38), 0.28);
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, r, Math.PI * 1.2, Math.PI * 1.6);
  ctx.stroke();
  ctx.restore();
}

function strands(ctx, color, lines) {
  ctx.strokeStyle = alpha(darken(color, 0.35), 0.45);
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (const [x1, y1, cx, cy, x2, y2] of lines) {
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx, cy, x2, y2);
  }
  ctx.stroke();
}

function curlyCloud(ctx, cx, cy, rx, ry, color, rng, count = 30) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx * 0.86, ry * 0.86, 0, 0, Math.PI * 2);
  ctx.fill();
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 0.84 + rng() * 0.22;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(angle) * rx * radius, cy + Math.sin(angle) * ry * radius, 15 + rng() * 11, 0, Math.PI * 2);
    ctx.fill();
  }
}

function braid(ctx, x, yStart, yEnd, color, width = 13) {
  const segments = Math.max(1, Math.floor((yEnd - yStart) / 15));
  for (let i = 0; i < segments; i++) {
    const y = yStart + i * 15;
    ctx.fillStyle = i % 2 ? color : darken(color, 0.16);
    ctx.beginPath();
    ctx.ellipse(x + (i % 2 ? 2 : -2), y + 8, width / 2, 9.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ------------------------------------------------------------ hair_base
const BACK = {
  long_straight(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(200, 84);
    ctx.bezierCurveTo(290, 84, 310, 170, 306, 260);
    ctx.bezierCurveTo(302, 340, 312, 420, 314, 476);
    ctx.quadraticCurveTo(200, 500, 86, 476);
    ctx.bezierCurveTo(88, 420, 98, 340, 94, 260);
    ctx.bezierCurveTo(90, 170, 110, 84, 200, 84);
    ctx.closePath();
    ctx.fill();
  },
  wavy(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(200, 84);
    ctx.bezierCurveTo(288, 84, 306, 168, 300, 250);
    ctx.bezierCurveTo(296, 310, 312, 350, 300, 404);
    ctx.quadraticCurveTo(252, 424, 200, 418);
    ctx.quadraticCurveTo(148, 424, 100, 404);
    ctx.bezierCurveTo(88, 350, 104, 310, 100, 250);
    ctx.bezierCurveTo(94, 168, 112, 84, 200, 84);
    ctx.closePath();
    ctx.fill();
  },
  curly_afro(ctx, color, model) {
    curlyCloud(ctx, 200, 176, 126, 118, color, createRng(model.seed + 5), 32);
  },
  braids(ctx, color, model) {
    const rng = createRng(model.seed + 11);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(200, 170, 108, 106, 0, 0, Math.PI * 2);
    ctx.fill();
    for (let x = 104; x <= 296; x += 17) {
      braid(ctx, x, 200, 470 - rng() * 60, color);
    }
  },
  short_bob(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(200, 84);
    ctx.bezierCurveTo(284, 84, 300, 160, 296, 236);
    ctx.quadraticCurveTo(292, 300, 282, 322);
    ctx.quadraticCurveTo(200, 340, 118, 322);
    ctx.quadraticCurveTo(108, 300, 104, 236);
    ctx.bezierCurveTo(100, 160, 116, 84, 200, 84);
    ctx.closePath();
    ctx.fill();
  },
  bun(ctx, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(200, 72, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = darken(color, 0.1);
    ctx.beginPath();
    ctx.ellipse(200, 104, 48, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(200, 180, 100, 100, 0, 0, Math.PI * 2);
    ctx.fill();
  },
  buzz() {},
  hijab() {},
};

// --------------------------------------------------------- hair_overlay
const FRONT = {
  long_straight(ctx, color) {
    ctx.fillStyle = color;
    capPath(ctx, { hairline: 148 });
    ctx.fill();
    // mechas que caem na frente dos ombros
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(200 + dir * 84, 172);
      ctx.bezierCurveTo(200 + dir * 96, 250, 200 + dir * 92, 330, 200 + dir * 100, 452);
      ctx.lineTo(200 + dir * 66, 452);
      ctx.bezierCurveTo(200 + dir * 62, 330, 200 + dir * 70, 250, 200 + dir * 62, 186);
      ctx.closePath();
      ctx.fill();
    }
    strands(ctx, color, [
      [200, 96, 150, 120, 126, 190],
      [200, 96, 250, 120, 274, 190],
      [140, 210, 132, 320, 146, 440],
      [260, 210, 268, 320, 254, 440],
    ]);
    shine(ctx, color, { hairline: 148 });
  },
  wavy(ctx, color) {
    const cap = { hairline: 150, sideL: 114, sideR: 286 };
    ctx.fillStyle = color;
    capPath(ctx, cap);
    ctx.fill();
    // franja lateral, puxada a partir da risca
    ctx.beginPath();
    ctx.moveTo(174, 114);
    ctx.bezierCurveTo(228, 108, 278, 134, 290, 190);
    ctx.bezierCurveTo(276, 166, 240, 146, 198, 150);
    ctx.bezierCurveTo(186, 151, 179, 142, 174, 114);
    ctx.closePath();
    ctx.fill();
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(200 + dir * 86, 176);
      ctx.bezierCurveTo(200 + dir * 104, 240, 200 + dir * 84, 300, 200 + dir * 96, 392);
      ctx.lineTo(200 + dir * 62, 392);
      ctx.bezierCurveTo(200 + dir * 54, 300, 200 + dir * 74, 240, 200 + dir * 62, 190);
      ctx.closePath();
      ctx.fill();
    }
    strands(ctx, color, [
      [178, 124, 226, 126, 272, 172],
      [134, 220, 150, 300, 132, 380],
      [266, 220, 250, 300, 268, 380],
    ]);
    shine(ctx, color, cap, { cx: 182, cy: 136, r: 54 });
  },
  curly_afro(ctx, color, model) {
    const rng = createRng(model.seed + 6);
    const cap = { top: 104, hairline: 158, sideL: 124, sideR: 276 };
    ctx.fillStyle = color;
    capPath(ctx, cap);
    ctx.fill();
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const x = 128 + t * 144;
      const y = 158 + Math.sin(t * Math.PI) * -26 + rng() * 6;
      ctx.beginPath();
      ctx.arc(x, y, 13 + rng() * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    shine(ctx, color, cap, { cx: 196, cy: 140, r: 52 });
  },
  braids(ctx, color, model) {
    const rng = createRng(model.seed + 12);
    ctx.fillStyle = color;
    capPath(ctx, { hairline: 150 });
    ctx.fill();
    // risco no meio
    ctx.strokeStyle = alpha(darken(color, 0.5), 0.6);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(200, 92);
    ctx.lineTo(200, 150);
    ctx.stroke();
    for (const dir of [-1, 1]) {
      braid(ctx, 200 + dir * 84, 186, 430 - rng() * 40, color);
      braid(ctx, 200 + dir * 104, 200, 400 - rng() * 40, color);
    }
  },
  short_bob(ctx, color) {
    const cap = { hairline: 146 };
    ctx.fillStyle = color;
    capPath(ctx, cap);
    ctx.fill();
    // franja lateral marcada + laterais até o queixo
    ctx.beginPath();
    ctx.moveTo(166, 112);
    ctx.bezierCurveTo(226, 106, 274, 132, 286, 186);
    ctx.bezierCurveTo(270, 160, 232, 142, 190, 148);
    ctx.bezierCurveTo(180, 149, 172, 140, 166, 112);
    ctx.closePath();
    ctx.fill();
    for (const dir of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(200 + dir * 84, 170);
      ctx.bezierCurveTo(200 + dir * 96, 230, 200 + dir * 92, 280, 200 + dir * 78, 318);
      ctx.lineTo(200 + dir * 52, 300);
      ctx.bezierCurveTo(200 + dir * 66, 260, 200 + dir * 66, 216, 200 + dir * 60, 184);
      ctx.closePath();
      ctx.fill();
    }
    shine(ctx, color, cap, { cx: 184, cy: 136, r: 52 });
  },
  bun(ctx, color) {
    const cap = { top: 96, hairline: 144 };
    ctx.fillStyle = color;
    capPath(ctx, cap);
    ctx.fill();
    strands(ctx, color, [
      [126, 186, 160, 120, 200, 100],
      [274, 186, 240, 120, 200, 100],
      [150, 160, 180, 122, 206, 104],
    ]);
    shine(ctx, color, cap, { cx: 200, cy: 136, r: 54 });
  },
  buzz(ctx, color, model) {
    const rng = createRng(model.seed + 8);
    ctx.save();
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = color;
    capPath(ctx, { top: 102, hairline: 162, sideL: 122, sideR: 278, temple: 200 });
    ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = lighten(color, 0.45);
    for (let i = 0; i < 90; i++) {
      const x = 126 + rng() * 148;
      const y = 104 + rng() * 76;
      ctx.beginPath();
      ctx.arc(x, y, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },
  hijab(ctx, color, model) {
    // tecido: cabeça + drapeado sobre os ombros
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(200, 196, 106, 126, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(110, 262);
    ctx.bezierCurveTo(92, 330, 80, 400, 74, 472);
    ctx.lineTo(326, 472);
    ctx.bezierCurveTo(320, 400, 308, 330, 290, 262);
    ctx.closePath();
    ctx.fill();

    // abertura do rosto
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.ellipse(200, 214, 63, 85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // dobras
    ctx.strokeStyle = alpha(darken(color, 0.35), 0.4);
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(140, 300);
    ctx.quadraticCurveTo(122, 380, 112, 462);
    ctx.moveTo(262, 300);
    ctx.quadraticCurveTo(280, 380, 290, 462);
    ctx.moveTo(150, 150);
    ctx.quadraticCurveTo(200, 120, 252, 152);
    ctx.stroke();

    ctx.fillStyle = alpha(lighten(color, 0.4), 0.35);
    roundedRect(ctx, 150, 128, 100, 16, 8);
    ctx.fill();
  },
};

export function paintHairBase(ctx, model) {
  BACK[model.hair.style]?.(ctx, model.hair.color, model);
}

export function paintHairOverlay(ctx, model) {
  FRONT[model.hair.style]?.(ctx, model.hair.color, model);
}

/** O penteado esconde as orelhas? (brincos e aparelho auditivo) */
export function coversEars(style) {
  return style === 'hijab';
}

export { H };
