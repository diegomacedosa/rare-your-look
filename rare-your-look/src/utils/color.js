/**
 * Utilidades de cor — usadas no Canvas do avatar e na validação
 * das regras de cor dos desafios (comparação perceptual em Lab).
 */

export function hexToRgb(hex) {
  const value = String(hex).replace('#', '').trim();
  const full = value.length === 3 ? value.split('').map((c) => c + c).join('') : value;
  const int = Number.parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

export function rgbToHex({ r, g, b }) {
  const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));
  return `#${[r, g, b].map((n) => clamp(n).toString(16).padStart(2, '0')).join('')}`;
}

/** Mistura duas cores; t=0 devolve `a`, t=1 devolve `b`. */
export function mix(a, b, t = 0.5) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * t,
    g: ca.g + (cb.g - ca.g) * t,
    b: ca.b + (cb.b - ca.b) * t,
  });
}

export const lighten = (hex, amount = 0.15) => mix(hex, '#ffffff', amount);
export const darken = (hex, amount = 0.15) => mix(hex, '#000000', amount);

/** `rgba()` a partir de um hex — evita concatenar strings no meio do desenho. */
export function alpha(hex, a = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

// ------------------------------------------------------------------ Lab / ΔE
function pivotRgb(n) {
  const c = n / 255;
  return c > 0.04045 ? ((c + 0.055) / 1.055) ** 2.4 : c / 12.92;
}

function pivotXyz(n) {
  return n > 0.008856 ? Math.cbrt(n) : 7.787 * n + 16 / 116;
}

/** Converte hex → CIE L*a*b* (iluminante D65). */
export function hexToLab(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rr, gg, bb] = [pivotRgb(r), pivotRgb(g), pivotRgb(b)];
  const x = (rr * 0.4124 + gg * 0.3576 + bb * 0.1805) / 0.95047;
  const y = (rr * 0.2126 + gg * 0.7152 + bb * 0.0722) / 1.0;
  const z = (rr * 0.0193 + gg * 0.1192 + bb * 0.9505) / 1.08883;
  const [fx, fy, fz] = [pivotXyz(x), pivotXyz(y), pivotXyz(z)];
  return { L: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/**
 * Distância perceptual entre duas cores (ΔE CIE76).
 * Referência prática: < 10 ≈ "mesma cor"; < 25 ≈ "mesma família de cor".
 */
export function deltaE(hexA, hexB) {
  const a = hexToLab(hexA);
  const b = hexToLab(hexB);
  return Math.hypot(a.L - b.L, a.a - b.a, a.b - b.b);
}

/** A cor está dentro da tolerância do alvo? (regra `required_color`) */
export function colorMatches(hex, target, tolerance = 22) {
  return deltaE(hex, target) <= tolerance;
}

/** Luminância relativa (WCAG) — usada para escolher texto claro/escuro. */
export function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * pivotRgb(r) + 0.7152 * pivotRgb(g) + 0.0722 * pivotRgb(b);
}

/** Texto legível sobre um fundo colorido (contraste AA). */
export function readableInk(hex) {
  return luminance(hex) > 0.42 ? '#1A1A1A' : '#FAF7F5';
}
