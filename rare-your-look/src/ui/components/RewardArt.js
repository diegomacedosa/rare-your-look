import { productArt } from './ProductCard.js';
import { getProduct } from '../../data/products.js';
import { TOP_COLORS_BY_ID, HAIR_COLORS_BY_ID, SCENARIOS_BY_ID } from '../../data/avatarOptions.js';
import { darken } from '../../utils/color.js';

/**
 * Arte de um item da coleção/recompensa, gerada em SVG a partir dos
 * dados — cada tipo tem seu desenho (frasco, cor, roupa, acessório, cenário).
 */
export function rewardArt(reward, size = 72) {
  const [group, value] = reward.ref.includes(':') ? reward.ref.split(':') : ['product', reward.ref];
  const box = (content, viewBox = '0 0 72 72') =>
    `<svg viewBox="${viewBox}" width="${size}" height="${size}" aria-hidden="true">${content}</svg>`;

  switch (reward.type) {
    case 'product': {
      const product = getProduct(reward.ref);
      return product ? productArt(product, size * 0.8) : box('');
    }
    case 'color': {
      const color = group === 'hairColor'
        ? HAIR_COLORS_BY_ID[value]?.color ?? '#C4929A'
        : TOP_COLORS_BY_ID[value]?.color ?? '#C4929A';
      return box(`<circle cx="36" cy="36" r="24" fill="${color}" stroke="${darken(color, 0.2)}" stroke-width="2"/>
        <circle cx="28" cy="28" r="7" fill="rgba(255,255,255,.45)"/>`);
    }
    case 'clothes':
      return box(`<path d="M22 20 L30 16 Q36 22 42 16 L50 20 L56 30 L48 34 L48 56 Q36 60 24 56 L24 34 L16 30 Z"
        fill="#C4929A" stroke="#8A5A62" stroke-width="2" stroke-linejoin="round"/>`);
    case 'accessory': {
      if (group === 'neck') {
        return box(`<path d="M20 22 Q36 52 52 22" fill="none" stroke="#D9B25E" stroke-width="3"/>
          <circle cx="36" cy="46" r="6" fill="#D9B25E"/>`);
      }
      if (group === 'hairAcc') {
        return box(`<rect x="16" y="30" width="40" height="10" rx="5" fill="#D9B25E"/>
          <rect x="22" y="42" width="30" height="8" rx="4" fill="#F5E9E6" stroke="#D9B25E" stroke-width="1.5"/>`);
      }
      return box(`<circle cx="26" cy="22" r="4" fill="#D9B25E"/><circle cx="46" cy="22" r="4" fill="#D9B25E"/>
        <circle cx="26" cy="42" r="10" fill="#FFFFFF" stroke="#E7D8D6" stroke-width="2"/>
        <circle cx="46" cy="42" r="10" fill="#FFFFFF" stroke="#E7D8D6" stroke-width="2"/>`);
    }
    case 'scenario': {
      const scenario = SCENARIOS_BY_ID[value] ?? SCENARIOS_BY_ID.bg_studio;
      const id = `grad-${value}`;
      return box(`<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${scenario.colors[0]}"/>
          <stop offset="100%" stop-color="${scenario.colors[1]}"/>
        </linearGradient></defs>
        <rect x="10" y="14" width="52" height="44" rx="10" fill="url(#${id})" stroke="#8A5A62" stroke-width="1.5"/>
        <circle cx="26" cy="30" r="6" fill="rgba(255,255,255,.6)"/>`);
    }
    default:
      return box('<circle cx="36" cy="36" r="22" fill="#C4929A"/>');
  }
}

export default rewardArt;
