import { esc } from '../../utils/dom.js';
import { icon } from '../icons.js';
import { FAMILIES, FINISHES, SLOTS, productName } from '../../data/products.js';
import { lighten, darken, readableInk } from '../../utils/color.js';

/**
 * Arte da embalagem desenhada em SVG a partir da cor do produto —
 * substitui o sprite PNG enquanto os assets oficiais não existem.
 */
export function productArt(product, size = 56) {
  const c = product.color;
  const cap = '#F3E7E1';
  const shadow = `<ellipse cx="28" cy="68" rx="15" ry="3" fill="rgba(138,90,98,.18)"/>`;
  const shine = `<rect x="20" y="30" width="4" height="22" rx="2" fill="rgba(255,255,255,.45)"/>`;

  const art = {
    bottle: `<circle cx="28" cy="14" r="9" fill="${cap}" stroke="${darken(cap, 0.12)}"/>
      <rect x="14" y="20" width="28" height="44" rx="13" fill="${c}"/>${shine}`,
    dropper: `<rect x="22" y="6" width="12" height="16" rx="4" fill="${cap}"/>
      <rect x="16" y="22" width="24" height="42" rx="11" fill="${c}"/>${shine}`,
    stick: `<rect x="18" y="16" width="20" height="48" rx="9" fill="${cap}"/>
      <path d="M18 30 L38 22 L38 16 Q38 12 33 12 L23 12 Q18 12 18 16 Z" fill="${c}"/>`,
    pot: `<ellipse cx="28" cy="26" rx="15" ry="5" fill="${lighten(c, 0.25)}"/>
      <path d="M13 26 v26 q0 10 15 10 t15 -10 v-26" fill="${c}"/>
      <ellipse cx="28" cy="24" rx="15" ry="5" fill="${cap}" opacity=".85"/>`,
    bullet: `<path d="M21 30 L35 30 L35 14 L28 8 L21 16 Z" fill="${c}"/>
      <rect x="19" y="30" width="18" height="34" rx="4" fill="${cap}" stroke="${darken(cap, 0.14)}"/>`,
    tube: `<rect x="22" y="6" width="12" height="16" rx="4" fill="${cap}"/>
      <rect x="20" y="22" width="16" height="42" rx="8" fill="${c}"/>${shine}`,
    pen: `<path d="M28 4 L33 16 L23 16 Z" fill="${c}"/>
      <rect x="23" y="16" width="10" height="48" rx="5" fill="${darken(c, 0.25)}"/>`,
  }[product.kind] ?? `<rect x="16" y="18" width="24" height="46" rx="10" fill="${c}"/>`;

  return `<svg viewBox="0 0 56 72" width="${size}" height="${(size * 72) / 56}" aria-hidden="true">${shadow}${art}</svg>`;
}

/** Amostra redonda de cor (usada nas regras e nos filtros). */
export function Swatch(color, label = '') {
  return `<span class="swatch-dot" style="--sw:${color}; --ink:${readableInk(color)}"
    ${label ? `title="${esc(label)}"` : ''}></span>`;
}

/**
 * Card de produto do estúdio.
 * @param {object} product
 * @param {{applied?:boolean, locked?:boolean, disabled?:boolean, hint?:boolean}} state
 */
export function ProductCard(product, { applied = false, locked = false, hint = false } = {}) {
  const slot = SLOTS[product.slot];
  const name = productName(product);
  const ariaLabel = locked
    ? `${name}. Bloqueado.`
    : `${name}. ${slot?.label ?? ''}. ${applied ? 'Aplicado — toque para remover.' : 'Toque para aplicar.'}`;

  return `
    <button type="button"
      class="product-card${hint ? ' product-card--hint anim-pulse' : ''}"
      data-action="${locked ? 'locked-product' : 'toggle-product'}"
      data-product="${esc(product.id)}"
      data-slot="${esc(product.slot)}"
      aria-pressed="${applied}"
      aria-label="${esc(ariaLabel)}"
      ${locked ? 'data-locked="true"' : ''}>
      <span class="product-card__art">${productArt(product)}</span>
      <span class="product-card__info">
        <strong class="product-card__shade">${esc(product.shade)}</strong>
        <span class="product-card__line">${esc(product.line)}</span>
        <span class="product-card__tags">
          <span class="chip chip--swatch" style="--sw:${product.color}">${esc(FAMILIES[product.family] ?? product.family)}</span>
          <span class="chip">${esc(FINISHES[product.finish] ?? product.finish)}</span>
        </span>
      </span>
      <span class="product-card__state" aria-hidden="true">
        ${locked ? icon('lock') : applied ? icon('check') : ''}
      </span>
    </button>`;
}

export default ProductCard;
