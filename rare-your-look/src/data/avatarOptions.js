/**
 * Opções de customização do avatar (SPEC §4.2 — CENA 2).
 *
 * Princípio de design do projeto: nada que represente identidade
 * (tom de pele, textura de cabelo, corpo, deficiência) fica bloqueado.
 * Só itens cosméticos extras — roupas, acessórios, cores divertidas e
 * cenários — entram no sistema de recompensas.
 */

export const SKIN_TONES = [
  { id: 'tone1', label: 'Tom 1 · muito claro', base: '#F6DED2', shadow: '#E6C2B2', lip: '#DFA096' },
  { id: 'tone2', label: 'Tom 2 · claro', base: '#F0CFB5', shadow: '#DCB193', lip: '#D49287' },
  { id: 'tone3', label: 'Tom 3 · claro quente', base: '#E3B792', shadow: '#CB9971', lip: '#C5827A' },
  { id: 'tone4', label: 'Tom 4 · médio', base: '#CE9A6E', shadow: '#B37E54', lip: '#B57067' },
  { id: 'tone5', label: 'Tom 5 · médio quente', base: '#B27A51', shadow: '#95623C', lip: '#9C5D54' },
  { id: 'tone6', label: 'Tom 6 · profundo', base: '#8C5A3B', shadow: '#72462C', lip: '#7C4A42' },
  { id: 'tone7', label: 'Tom 7 · muito profundo', base: '#6A4029', shadow: '#54311E', lip: '#623A32' },
  { id: 'tone8', label: 'Tom 8 · ébano', base: '#492B1D', shadow: '#392115', lip: '#4D2E29' },
];

export const BODY_SHAPES = [
  { id: 'slim', label: 'Corpo 1', shoulders: 214 },
  { id: 'medium', label: 'Corpo 2', shoulders: 248 },
  { id: 'curvy', label: 'Corpo 3', shoulders: 280 },
  { id: 'plus', label: 'Corpo 4', shoulders: 312 },
];

export const HAIR_STYLES = [
  { id: 'wavy', label: 'Ondulado' },
  { id: 'long_straight', label: 'Longo liso' },
  { id: 'curly_afro', label: 'Crespo volumoso' },
  { id: 'braids', label: 'Tranças' },
  { id: 'short_bob', label: 'Chanel' },
  { id: 'bun', label: 'Coque alto' },
  { id: 'buzz', label: 'Raspado' },
  { id: 'hijab', label: 'Hijab' },
];

export const HAIR_COLORS = [
  { id: 'black', label: 'Preto', color: '#221A18' },
  { id: 'dark_brown', label: 'Castanho escuro', color: '#3C2419' },
  { id: 'brown', label: 'Castanho', color: '#6B4227' },
  { id: 'auburn', label: 'Ruivo', color: '#8E3B22' },
  { id: 'blonde', label: 'Loiro', color: '#D7B06A' },
  { id: 'silver', label: 'Grisalho', color: '#B9B6B2' },
  { id: 'pink', label: 'Rosa', color: '#E7A1B4', unlockId: 'rw_color_hair_pink' },
  { id: 'lilac', label: 'Lilás', color: '#B7A1D9', unlockId: 'rw_color_hair_lilac' },
];

export const EYE_COLORS = [
  { id: 'dark_brown', label: 'Castanho escuro', color: '#3B2418' },
  { id: 'brown', label: 'Castanho', color: '#6B4226' },
  { id: 'honey', label: 'Mel', color: '#9A6B32' },
  { id: 'green', label: 'Verde', color: '#5A7F53' },
  { id: 'blue', label: 'Azul', color: '#5A7FA6' },
  { id: 'gray', label: 'Cinza', color: '#8A949C' },
];

export const TOPS = [
  { id: 'tee', label: 'Camiseta' },
  { id: 'vneck', label: 'Decote V' },
  { id: 'turtleneck', label: 'Gola alta' },
  { id: 'hoodie', label: 'Moletom' },
  { id: 'blazer', label: 'Blazer', unlockId: 'rw_top_blazer' },
  { id: 'offshoulder', label: 'Ombro a ombro', unlockId: 'rw_top_offshoulder' },
];

export const TOP_COLORS = [
  { id: 'warm_white', label: 'Off-white', color: '#FAF7F5' },
  { id: 'rose', label: 'Rosé', color: '#C4929A' },
  { id: 'deep', label: 'Mauve', color: '#8A5A62' },
  { id: 'ink', label: 'Preto', color: '#2A262C' },
  { id: 'camel', label: 'Camel', color: '#C29A6B' },
  { id: 'denim', label: 'Jeans', color: '#7591B5' },
  { id: 'lilac', label: 'Lilás', color: '#B8A6D9', unlockId: 'rw_color_top_lilac' },
  { id: 'sage', label: 'Sálvia', color: '#9DB59A', unlockId: 'rw_color_top_sage' },
  { id: 'terracotta', label: 'Terracota', color: '#C2694F', unlockId: 'rw_color_top_terracotta' },
];

export const BOTTOMS = [
  { id: 'jeans', label: 'Jeans', color: '#5B7BA3' },
  { id: 'black_pants', label: 'Calça preta', color: '#2A2A2E' },
  { id: 'skirt', label: 'Saia rosé', color: '#C4929A' },
  { id: 'cream', label: 'Alfaiataria creme', color: '#E4D5BE' },
];

/** Acessórios são agrupados por "encaixe": um item por grupo. */
export const ACCESSORY_GROUPS = [
  {
    id: 'earrings',
    label: 'Brincos',
    options: [
      { id: 'none', label: 'Nenhum' },
      { id: 'studs', label: 'Ponto de luz' },
      { id: 'hoops', label: 'Argolas' },
      { id: 'pearls', label: 'Pérolas', unlockId: 'rw_earrings_pearls' },
    ],
  },
  {
    id: 'eyewear',
    label: 'Olhos',
    options: [
      { id: 'none', label: 'Nenhum' },
      { id: 'glasses', label: 'Óculos de grau' },
      { id: 'sunglasses', label: 'Óculos escuros' },
      { id: 'eye_patch', label: 'Tapa-olho' },
    ],
  },
  {
    id: 'hearing',
    label: 'Aparelho auditivo',
    options: [
      { id: 'none', label: 'Nenhum' },
      { id: 'hearing_aid', label: 'Aparelho auditivo' },
      { id: 'cochlear', label: 'Implante coclear' },
    ],
  },
  {
    id: 'neck',
    label: 'Colar',
    options: [
      { id: 'none', label: 'Nenhum' },
      { id: 'gold', label: 'Corrente dourada', unlockId: 'rw_necklace_gold' },
    ],
  },
  {
    id: 'hairAcc',
    label: 'Cabelo',
    options: [
      { id: 'none', label: 'Nenhum' },
      { id: 'clips', label: 'Presilhas', unlockId: 'rw_hair_clips' },
    ],
  },
];

/** Características de pele/rosto — livres, nunca bloqueadas. */
export const FEATURES = [
  { id: 'freckles', label: 'Sardas' },
  { id: 'vitiligo', label: 'Vitiligo' },
  { id: 'scar', label: 'Cicatriz' },
  { id: 'mole', label: 'Pinta' },
];

/** Corpo e mobilidade — representação, nunca obstáculo (GDD §2.8). */
export const MOBILITY_OPTIONS = [
  { id: 'none', label: 'Nenhum' },
  { id: 'wheelchair', label: 'Cadeira de rodas' },
];

export const PROSTHETIC_OPTIONS = [
  { id: 'none', label: 'Nenhuma' },
  { id: 'left', label: 'Prótese de braço (esquerdo)' },
  { id: 'right', label: 'Prótese de braço (direito)' },
];

/** Maquiagem "assinatura" do avatar fora dos desafios. */
export const MAKEUP_PRESETS = [
  { id: 'none', label: 'Sem maquiagem', look: {} },
  { id: 'natural', label: 'Natural', look: { blush: 'blush_hope', lipoil: 'oil_hope' } },
  { id: 'glow', label: 'Glow', look: { bronzer: 'bronzer_happy_sol', highlight: 'high_enlighten', lipoil: 'oil_joy' } },
  { id: 'soft_glam', label: 'Soft glam', look: { eyeshadow: 'shadow_kind', mascara: 'mascara_black', blush: 'blush_hope', lipstick: 'lip_talented' } },
  { id: 'bold', label: 'Bold', look: { liner: 'liner_black', mascara: 'mascara_black', blush: 'blush_grace', lipstick: 'lip_brave' } },
];

/** Cenários do estúdio (fundo do palco e da imagem compartilhável). */
export const SCENARIOS = [
  { id: 'bg_studio', label: 'Rare Studio', css: 'bg-studio', colors: ['#F8EFE8', '#F0D5D8'] },
  { id: 'bg_blush', label: 'Blush Room', css: 'bg-blush', colors: ['#F9E6E9', '#E5BCC4'] },
  { id: 'bg_sunset', label: 'Golden Hour', css: 'bg-sunset', colors: ['#F9DCC4', '#C98FA8'], unlockId: 'rw_bg_sunset' },
  { id: 'bg_garden', label: 'Garden', css: 'bg-garden', colors: ['#EAF1E6', '#C3D7C0'], unlockId: 'rw_bg_garden' },
  { id: 'bg_night', label: 'Night Out', css: 'bg-night', colors: ['#4A3A55', '#8A5A62'], unlockId: 'rw_bg_night' },
];

export const DEFAULT_AVATAR = Object.freeze({
  skinTone: 'tone3',
  bodyShape: 'medium',
  hairStyle: 'wavy',
  hairColor: 'dark_brown',
  eyeColor: 'brown',
  top: 'tee',
  topColor: 'rose',
  bottom: 'jeans',
  accessories: { earrings: 'studs', eyewear: 'none', hearing: 'none', neck: 'none', hairAcc: 'none' },
  features: { freckles: false, vitiligo: false, scar: false, mole: false },
  mobility: 'none',
  prosthetic: 'none',
  makeup: 'natural',
  scenario: 'bg_studio',
  seed: 7,
});

/** Avatar completo, com defaults preenchidos (tolera saves antigos). */
export function normalizeAvatar(avatar) {
  return {
    ...DEFAULT_AVATAR,
    ...(avatar ?? {}),
    accessories: { ...DEFAULT_AVATAR.accessories, ...(avatar?.accessories ?? {}) },
    features: { ...DEFAULT_AVATAR.features, ...(avatar?.features ?? {}) },
  };
}

/** Maquiagem "de casa" do avatar — usada fora dos desafios. */
export function signatureLook(avatar) {
  const id = normalizeAvatar(avatar).makeup;
  return MAKEUP_PRESETS.find((preset) => preset.id === id)?.look ?? {};
}

const byId = (list) => Object.fromEntries(list.map((item) => [item.id, item]));

export const SKIN_TONES_BY_ID = byId(SKIN_TONES);
export const BODY_SHAPES_BY_ID = byId(BODY_SHAPES);
export const HAIR_COLORS_BY_ID = byId(HAIR_COLORS);
export const EYE_COLORS_BY_ID = byId(EYE_COLORS);
export const TOP_COLORS_BY_ID = byId(TOP_COLORS);
export const BOTTOMS_BY_ID = byId(BOTTOMS);
export const SCENARIOS_BY_ID = byId(SCENARIOS);
export const HAIR_STYLES_BY_ID = byId(HAIR_STYLES);
export const TOPS_BY_ID = byId(TOPS);
export const MAKEUP_PRESETS_BY_ID = byId(MAKEUP_PRESETS);
