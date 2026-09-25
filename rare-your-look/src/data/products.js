/**
 * Catálogo de produtos do estúdio.
 *
 * ⚠️ Protótipo: linhas e nomes de tons são PLACEHOLDERS inspirados no
 * portfólio da Rare Beauty. Antes de qualquer uso público, validar nomes,
 * tons e códigos de cor com os assets oficiais da marca.
 *
 * Cada produto ocupa um "slot" (um por vez) e pinta uma camada do Canvas
 * do avatar (SPEC §7).
 */

export const CATEGORIES = [
  { id: 'face', label: 'Pele' },
  { id: 'eyes', label: 'Olhos' },
  { id: 'cheeks', label: 'Bochechas' },
  { id: 'lips', label: 'Lábios' },
];

export const SLOTS = {
  bronzer: { label: 'Bronzer', category: 'face', layer: 'makeup_base' },
  eyeshadow: { label: 'Sombra', category: 'eyes', layer: 'makeup_eyes' },
  liner: { label: 'Delineador', category: 'eyes', layer: 'makeup_eyes' },
  mascara: { label: 'Máscara de cílios', category: 'eyes', layer: 'makeup_eyes' },
  blush: { label: 'Blush', category: 'cheeks', layer: 'makeup_cheeks' },
  highlight: { label: 'Iluminador', category: 'cheeks', layer: 'makeup_cheeks' },
  lipstick: { label: 'Batom', category: 'lips', layer: 'makeup_lips' },
  lipoil: { label: 'Lip oil', category: 'lips', layer: 'makeup_lips' },
};

export const MOODS = {
  natural: 'Natural',
  soft: 'Suave',
  fresh: 'Fresh',
  glow: 'Glow',
  bold: 'Bold',
  night: 'Night',
  romantic: 'Romântico',
};

export const FAMILIES = {
  nude: 'Nude',
  rose: 'Rosé',
  pink: 'Pink',
  coral: 'Coral',
  berry: 'Berry',
  mauve: 'Mauve',
  red: 'Vermelho',
  gold: 'Dourado',
  bronze: 'Bronze',
  lilac: 'Lilás',
  brown: 'Marrom',
  black: 'Preto',
};

export const FINISHES = {
  matte: 'Matte',
  dewy: 'Dewy',
  shimmer: 'Cintilante',
  gloss: 'Glossy',
};

export const PRODUCTS = [
  // ---------------------------------------------------------------- blush
  { id: 'blush_hope', line: 'Soft Pinch Liquid Blush', shade: 'Hope', slot: 'blush', kind: 'bottle',
    color: '#D98E95', family: 'rose', finish: 'matte', moods: ['soft', 'natural'],
    description: 'Blush líquido rosé — o clássico de todo dia.' },
  { id: 'blush_joy', line: 'Soft Pinch Liquid Blush', shade: 'Joy', slot: 'blush', kind: 'bottle',
    color: '#EC9275', family: 'coral', finish: 'matte', moods: ['fresh', 'natural'],
    description: 'Coral aquecido, cara de sol na bochecha.' },
  { id: 'blush_grace', line: 'Soft Pinch Liquid Blush', shade: 'Grace', slot: 'blush', kind: 'bottle',
    color: '#C45E72', family: 'berry', finish: 'matte', moods: ['bold', 'romantic'],
    description: 'Berry intenso: uma gota já entrega o look.' },
  { id: 'blush_believe', line: 'Soft Pinch Liquid Blush', shade: 'Believe', slot: 'blush', kind: 'bottle',
    color: '#A8657C', family: 'mauve', finish: 'matte', moods: ['night', 'romantic'],
    description: 'Mauve profundo para looks de noite.', unlockId: 'rw_blush_believe' },
  { id: 'blush_lucky', line: 'Soft Pinch Liquid Blush', shade: 'Lucky', slot: 'blush', kind: 'bottle',
    color: '#EF6F8C', family: 'pink', finish: 'dewy', moods: ['fresh', 'bold'],
    description: 'Pink vibrante com acabamento dewy.', unlockId: 'rw_blush_lucky' },

  // ----------------------------------------------------------- iluminador
  { id: 'high_enlighten', line: 'Positive Light Liquid Luminizer', shade: 'Enlighten', slot: 'highlight', kind: 'dropper',
    color: '#F4DDB8', family: 'gold', finish: 'shimmer', moods: ['glow'],
    description: 'Glow dourado leve nos pontos altos.' },
  { id: 'high_mesmerize', line: 'Positive Light Liquid Luminizer', shade: 'Mesmerize', slot: 'highlight', kind: 'dropper',
    color: '#F2C4BE', family: 'rose', finish: 'shimmer', moods: ['glow', 'romantic'],
    description: 'Reflexo rosado, pele de porcelana molhada.' },
  { id: 'high_exhilarate', line: 'Positive Light Liquid Luminizer', shade: 'Exhilarate', slot: 'highlight', kind: 'dropper',
    color: '#D9A36F', family: 'bronze', finish: 'shimmer', moods: ['glow', 'night'],
    description: 'Bronze luminoso para peles médias e profundas.', unlockId: 'rw_high_exhilarate' },

  // -------------------------------------------------------------- bronzer
  { id: 'bronzer_happy_sol', line: 'Warm Wishes Bronzer Stick', shade: 'Happy Sol', slot: 'bronzer', kind: 'stick',
    color: '#B98060', family: 'bronze', finish: 'matte', moods: ['natural', 'glow'],
    description: 'Bronzer em bastão, calor imediato no rosto.' },
  { id: 'bronzer_always_sunny', line: 'Warm Wishes Bronzer Stick', shade: 'Always Sunny', slot: 'bronzer', kind: 'stick',
    color: '#8F5B3E', family: 'bronze', finish: 'matte', moods: ['glow', 'bold'],
    description: 'Bronze profundo, contorno esculpido.', unlockId: 'rw_bronzer_sunny' },

  // --------------------------------------------------------------- sombra
  { id: 'shadow_calm', line: 'Liquid Eyeshadow', shade: 'Calm', slot: 'eyeshadow', kind: 'pot',
    color: '#C9A28A', family: 'nude', finish: 'shimmer', moods: ['natural', 'soft'],
    description: 'Nude acetinado que serve em tudo.' },
  { id: 'shadow_kind', line: 'Liquid Eyeshadow', shade: 'Kind', slot: 'eyeshadow', kind: 'pot',
    color: '#C98E98', family: 'rose', finish: 'shimmer', moods: ['soft', 'romantic'],
    description: 'Rosé cintilante nas pálpebras.' },
  { id: 'shadow_brave', line: 'Liquid Eyeshadow', shade: 'Brave Night', slot: 'eyeshadow', kind: 'pot',
    color: '#6E3B55', family: 'berry', finish: 'matte', moods: ['night', 'bold'],
    description: 'Ameixa fechada para um olho marcante.' },
  { id: 'shadow_dreamy', line: 'Liquid Eyeshadow', shade: 'Dreamy', slot: 'eyeshadow', kind: 'pot',
    color: '#A99BCB', family: 'lilac', finish: 'shimmer', moods: ['fresh', 'bold'],
    description: 'Lilás perolado — ousadia leve.', unlockId: 'rw_shadow_dreamy' },
  { id: 'shadow_gold', line: 'Liquid Eyeshadow', shade: 'Golden Hour', slot: 'eyeshadow', kind: 'pot',
    color: '#D6AE62', family: 'gold', finish: 'shimmer', moods: ['glow', 'night'],
    description: 'Dourado quente de fim de tarde.', unlockId: 'rw_shadow_gold' },

  // ---------------------------------------------------------- delineador
  { id: 'liner_black', line: 'Perfect Strokes Matte Liquid Liner', shade: 'Deepest Black', slot: 'liner', kind: 'pen',
    color: '#17151A', family: 'black', finish: 'matte', moods: ['bold', 'night'],
    description: 'Traço preto matte com ponta fina.' },
  { id: 'liner_brown', line: 'Perfect Strokes Matte Liquid Liner', shade: 'Espresso', slot: 'liner', kind: 'pen',
    color: '#4B2F25', family: 'brown', finish: 'matte', moods: ['natural', 'soft'],
    description: 'Marrom suave, definição sem peso.' },

  // ------------------------------------------------------------- máscara
  { id: 'mascara_black', line: 'Perfect Strokes Volumizing Mascara', shade: 'Universal Black', slot: 'mascara', kind: 'tube',
    color: '#121114', family: 'black', finish: 'matte', moods: ['natural'],
    description: 'Volume e curvatura nos cílios.' },

  // --------------------------------------------------------------- batom
  { id: 'lip_talented', line: 'Kind Words Matte Lipstick', shade: 'Talented', slot: 'lipstick', kind: 'bullet',
    color: '#B8747A', family: 'rose', finish: 'matte', moods: ['natural', 'soft'],
    description: 'Rosé amarronzado, o "meu lábio, melhor".' },
  { id: 'lip_humble', line: 'Kind Words Matte Lipstick', shade: 'Humble', slot: 'lipstick', kind: 'bullet',
    color: '#C69283', family: 'nude', finish: 'matte', moods: ['natural'],
    description: 'Nude quente de acabamento aveludado.' },
  { id: 'lip_brave', line: 'Kind Words Matte Lipstick', shade: 'Brave', slot: 'lipstick', kind: 'bullet',
    color: '#B02A3C', family: 'red', finish: 'matte', moods: ['bold', 'night'],
    description: 'Vermelho clássico, coragem em bastão.' },
  { id: 'lip_wise', line: 'Kind Words Matte Lipstick', shade: 'Wise', slot: 'lipstick', kind: 'bullet',
    color: '#7A3550', family: 'berry', finish: 'matte', moods: ['bold', 'night'],
    description: 'Berry escuro de alto impacto.', unlockId: 'rw_lip_wise' },
  { id: 'lip_devoted', line: 'Kind Words Matte Lipstick', shade: 'Devoted', slot: 'lipstick', kind: 'bullet',
    color: '#D8674F', family: 'coral', finish: 'matte', moods: ['fresh', 'bold'],
    description: 'Coral vibrante que acende o rosto.', unlockId: 'rw_lip_devoted' },

  // ------------------------------------------------------------- lip oil
  { id: 'oil_hope', line: 'Soft Pinch Tinted Lip Oil', shade: 'Hope', slot: 'lipoil', kind: 'tube',
    color: '#E6A1A8', family: 'rose', finish: 'gloss', moods: ['soft', 'glow', 'fresh'],
    description: 'Óleo labial rosé com brilho espelhado.' },
  { id: 'oil_joy', line: 'Soft Pinch Tinted Lip Oil', shade: 'Joy', slot: 'lipoil', kind: 'tube',
    color: '#F29A83', family: 'coral', finish: 'gloss', moods: ['fresh', 'glow'],
    description: 'Pêssego translúcido, hidratação com cor.' },
  { id: 'oil_happy', line: 'Soft Pinch Tinted Lip Oil', shade: 'Happy', slot: 'lipoil', kind: 'tube',
    color: '#EC7C98', family: 'pink', finish: 'gloss', moods: ['fresh', 'romantic'],
    description: 'Pink glossy de alta luz.', unlockId: 'rw_oil_happy' },
];

export const PRODUCTS_BY_ID = Object.fromEntries(PRODUCTS.map((product) => [product.id, product]));

export const getProduct = (id) => PRODUCTS_BY_ID[id] ?? null;

/** Nome completo para leitura (leitor de tela, coleção, recompensa). */
export const productName = (product) => `${product.line} — ${product.shade}`;

/** Produtos disponíveis desde o início (sem recompensa atrelada). */
export const DEFAULT_PRODUCT_IDS = PRODUCTS.filter((p) => !p.unlockId).map((p) => p.id);

/** O jogador já desbloqueou este produto? */
export function isProductUnlocked(product, unlockedIds = []) {
  if (!product?.unlockId) return true;
  return unlockedIds.includes(product.unlockId);
}

/** Converte um look ({slot: productId}) na lista de produtos aplicados. */
export function lookProducts(look = {}) {
  return Object.values(look)
    .map((id) => getProduct(id))
    .filter(Boolean);
}

/** Quantos produtos o look usa. */
export const lookSize = (look = {}) => lookProducts(look).length;
