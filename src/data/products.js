/**
 * Catálogo de produtos Rare Beauty (cores aproximadas para o protótipo).
 * slot = camada/área do rosto onde o produto é aplicado (1 produto por slot).
 * family = família de cor usada pelas regras dos desafios.
 * reward = id da recompensa que desbloqueia o produto (sem reward = inicial).
 */
export const SLOTS = {
  base: { label: 'Pele', layer: 'makeup_base' },
  brows: { label: 'Sobrancelhas', layer: 'makeup_eyes' },
  eyeshadow: { label: 'Sombra', layer: 'makeup_eyes' },
  liner: { label: 'Delineador', layer: 'makeup_eyes' },
  mascara: { label: 'Máscara', layer: 'makeup_eyes' },
  blush: { label: 'Blush', layer: 'makeup_cheeks' },
  highlight: { label: 'Iluminador', layer: 'makeup_cheeks' },
  lips: { label: 'Lábios', layer: 'makeup_lips' },
};

export const FAMILIES = {
  rose: { label: 'Rose', hex: '#D98C98' },
  mauve: { label: 'Malva', hex: '#A8737C' },
  berry: { label: 'Berry', hex: '#8C3552' },
  coral: { label: 'Coral', hex: '#E8795F' },
  peach: { label: 'Pêssego', hex: '#EFA17F' },
  nude: { label: 'Nude', hex: '#C99A84' },
  red: { label: 'Vermelho', hex: '#B82832' },
  pink: { label: 'Pink', hex: '#E6648C' },
  bronze: { label: 'Bronze', hex: '#A8683D' },
  gold: { label: 'Dourado', hex: '#D9B06A' },
  neutral: { label: 'Neutro', hex: '#3A2A22' },
};

export const FINISHES = {
  matte: 'Matte',
  satin: 'Acetinado',
  dewy: 'Glow',
  gloss: 'Gloss',
  shimmer: 'Cintilante',
};

const p = (id, line, shade, slot, hex, family, finish, tags = [], reward = null) => ({
  id, line, shade, slot, hex, family, finish, tags, reward,
});

export const PRODUCTS = [
  // ---------- Lábios ----------
  p('lip_01', 'Lip Soufflé Matte Lip Cream', 'Inspire', 'lips', '#C7727D', 'rose', 'matte', ['soft', 'romantic']),
  p('lip_02', 'Lip Soufflé Matte Lip Cream', 'Bliss', 'lips', '#B9837A', 'nude', 'matte', ['soft', 'fresh']),
  p('lip_03', 'Kind Words Matte Lipstick', 'Brave', 'lips', '#A8323D', 'red', 'matte', ['bold']),
  p('lip_04', 'Soft Pinch Tinted Lip Oil', 'Hope', 'lips', '#D88E8E', 'rose', 'gloss', ['soft', 'glow', 'fresh']),
  p('lip_05', 'Soft Pinch Tinted Lip Oil', 'Joy', 'lips', '#EA8B6E', 'coral', 'gloss', ['warm', 'fresh', 'glow']),
  p('lip_06', 'Kind Words Matte Lipstick', 'Talented', 'lips', '#7E2F48', 'berry', 'matte', ['bold', 'cool']),
  p('lip_07', 'Lip Soufflé Matte Lip Cream', 'Courage', 'lips', '#9E6573', 'mauve', 'matte', ['soft', 'cool']),
  p('lip_08', 'Stay Vulnerable Glossy Lip Balm', 'Nearly Mauve', 'lips', '#B07A86', 'mauve', 'gloss', ['soft', 'glow']),
  p('lip_09', 'Kind Words Matte Lipstick', 'Fearless', 'lips', '#D9486C', 'pink', 'matte', ['bold', 'cool'], 'prod_fearless'),
  p('lip_10', 'Soft Pinch Tinted Lip Oil', 'Serenity', 'lips', '#C4574E', 'red', 'gloss', ['bold', 'warm', 'glow'], 'prod_serenity'),

  // ---------- Blush ----------
  p('blush_01', 'Soft Pinch Liquid Blush', 'Hope', 'blush', '#D28A86', 'rose', 'dewy', ['soft', 'romantic']),
  p('blush_02', 'Soft Pinch Liquid Blush', 'Joy', 'blush', '#EC8E74', 'peach', 'dewy', ['warm', 'fresh']),
  p('blush_03', 'Soft Pinch Liquid Blush', 'Grace', 'blush', '#C4697A', 'mauve', 'dewy', ['soft', 'cool']),
  p('blush_04', 'Soft Pinch Liquid Blush', 'Believe', 'blush', '#E4577F', 'pink', 'dewy', ['bold', 'cool']),
  p('blush_05', 'Soft Pinch Liquid Blush', 'Virtue', 'blush', '#D9664E', 'coral', 'dewy', ['warm', 'bold']),
  p('blush_06', 'Soft Pinch Liquid Blush', 'Lucky', 'blush', '#A8435E', 'berry', 'dewy', ['bold', 'cool'], 'prod_lucky'),
  p('blush_07', 'Soft Pinch Liquid Blush', 'Encourage', 'blush', '#D69A8C', 'nude', 'dewy', ['soft', 'fresh']),

  // ---------- Iluminador ----------
  p('highlight_01', 'Positive Light Liquid Luminizer', 'Enlighten', 'highlight', '#F2D8B0', 'gold', 'shimmer', ['glow', 'warm']),
  p('highlight_02', 'Positive Light Liquid Luminizer', 'Mesmerize', 'highlight', '#EDB9A6', 'rose', 'shimmer', ['glow', 'romantic']),
  p('highlight_03', 'Positive Light Liquid Luminizer', 'Exhilarate', 'highlight', '#D9A066', 'bronze', 'shimmer', ['glow', 'warm']),
  p('highlight_04', 'Positive Light Liquid Luminizer', 'Transform', 'highlight', '#F4E6DE', 'nude', 'shimmer', ['glow', 'cool'], 'prod_transform'),

  // ---------- Olhos ----------
  p('shadow_01', 'Stay Vulnerable Melting Cream Eyeshadow', 'Nearly Neutral', 'eyeshadow', '#B48E78', 'nude', 'satin', ['soft', 'fresh']),
  p('shadow_02', 'Stay Vulnerable Melting Cream Eyeshadow', 'Nearly Rose', 'eyeshadow', '#C98F8F', 'rose', 'satin', ['soft', 'romantic']),
  p('shadow_03', 'Stay Vulnerable Melting Cream Eyeshadow', 'Nearly Mauve', 'eyeshadow', '#9E7482', 'mauve', 'satin', ['soft', 'cool']),
  p('shadow_04', 'Stay Vulnerable Melting Cream Eyeshadow', 'Nearly Berry', 'eyeshadow', '#8A4A5E', 'berry', 'satin', ['bold', 'cool']),
  p('shadow_05', 'Stay Vulnerable Melting Cream Eyeshadow', 'Nearly Apricot', 'eyeshadow', '#D69A73', 'peach', 'satin', ['warm', 'fresh']),
  p('shadow_06', 'Stay Vulnerable Melting Cream Eyeshadow', 'Nearly Bronze', 'eyeshadow', '#9C6A45', 'bronze', 'shimmer', ['warm', 'glow'], 'prod_bronze_eye'),
  p('liner_01', 'Perfect Strokes Matte Liquid Liner', 'Deep Black', 'liner', '#161213', 'neutral', 'matte', ['bold']),
  p('liner_02', 'Perfect Strokes Matte Liquid Liner', 'Deep Brown', 'liner', '#3E261B', 'neutral', 'matte', ['soft']),
  p('mascara_01', 'Perfect Strokes Universal Volumizing Mascara', 'Black', 'mascara', '#141112', 'neutral', 'matte', ['fresh']),
  p('brows_01', 'Brow Harmony Pencil & Gel', 'Soft Brown', 'brows', '#6A4A38', 'neutral', 'matte', ['fresh']),
  p('brows_02', 'Brow Harmony Pencil & Gel', 'Rich Taupe', 'brows', '#3A2A24', 'neutral', 'matte', ['bold']),

  // ---------- Pele ----------
  p('base_01', 'Positive Light Tinted Moisturizer', 'Glow', 'base', '#F4DCC8', 'nude', 'dewy', ['glow', 'fresh']),
  p('base_02', 'Warm Wishes Effortless Bronzer Stick', 'Happy Sol', 'base', '#A8683D', 'bronze', 'satin', ['warm']),
  p('base_03', 'Liquid Touch Weightless Foundation', 'Soft Matte', 'base', '#E6CBB8', 'nude', 'matte', ['soft']),
];

export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((pr) => [pr.id, pr]));

export const isProductUnlocked = (product, unlockedItems = []) =>
  !product.reward || unlockedItems.includes(product.reward);

export const productLabel = (pr) => `${pr.line} — ${pr.shade}`;
