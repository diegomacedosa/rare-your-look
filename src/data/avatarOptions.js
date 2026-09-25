/**
 * Opções de customização do avatar.
 * Itens com `reward` só ficam disponíveis após o desbloqueio correspondente (rewards.js).
 */
export const SKIN_TONES = [
  { id: 'porcelain', label: 'Porcelana', hex: '#F6E0D2' },
  { id: 'fair', label: 'Clara', hex: '#EECBB5' },
  { id: 'light', label: 'Clara média', hex: '#E3B598' },
  { id: 'light_medium', label: 'Média clara', hex: '#D39E7B' },
  { id: 'medium', label: 'Média', hex: '#C48860' },
  { id: 'tan', label: 'Bronzeada', hex: '#AD734D' },
  { id: 'medium_deep', label: 'Média escura', hex: '#925E3D' },
  { id: 'deep', label: 'Escura', hex: '#78492E' },
  { id: 'rich', label: 'Retinta', hex: '#5C3522' },
  { id: 'deepest', label: 'Retinta profunda', hex: '#432619' },
];

export const SKIN_FEATURES = [
  { id: 'freckles', label: 'Sardas' },
  { id: 'vitiligo', label: 'Vitiligo' },
  { id: 'scar', label: 'Cicatriz' },
  { id: 'birthmark', label: 'Marca de nascença' },
  { id: 'acne', label: 'Pele com acne' },
];

export const HAIR_STYLES = [
  { id: 'long_wavy', label: 'Longo ondulado' },
  { id: 'bob', label: 'Chanel' },
  { id: 'pixie', label: 'Pixie' },
  { id: 'afro', label: 'Black power' },
  { id: 'braids', label: 'Box braids' },
  { id: 'curly', label: 'Cacheado' },
  { id: 'bun', label: 'Coque' },
  { id: 'buzz', label: 'Raspado' },
  { id: 'hijab', label: 'Hijab' },
];

export const HAIR_COLORS = [
  { id: 'black', label: 'Preto', hex: '#1C1512' },
  { id: 'espresso', label: 'Café', hex: '#3B2419' },
  { id: 'brown', label: 'Castanho', hex: '#6B4430' },
  { id: 'auburn', label: 'Ruivo acobreado', hex: '#8E3B26' },
  { id: 'honey', label: 'Mel', hex: '#B7844E' },
  { id: 'blonde', label: 'Loiro', hex: '#D9B77A' },
  { id: 'silver', label: 'Grisalho', hex: '#B4B0AC' },
  { id: 'rose', label: 'Rosa', hex: '#D48A9A', reward: 'hair_rose' },
  { id: 'lilac', label: 'Lilás', hex: '#A58BC0', reward: 'hair_lilac' },
];

export const HIJAB_COLORS = [
  { id: 'mauve', label: 'Malva', hex: '#A8737C' },
  { id: 'sand', label: 'Areia', hex: '#D8C3A8' },
  { id: 'ink', label: 'Preto', hex: '#2A2426' },
  { id: 'sage', label: 'Sálvia', hex: '#8FA88F' },
  { id: 'blush', label: 'Blush', hex: '#E8B9BF' },
  { id: 'navy', label: 'Marinho', hex: '#34405E' },
];

export const EYE_COLORS = [
  { id: 'dark_brown', label: 'Castanho escuro', hex: '#3A2418' },
  { id: 'brown', label: 'Castanho', hex: '#6A4128' },
  { id: 'hazel', label: 'Mel', hex: '#8C6A34' },
  { id: 'green', label: 'Verde', hex: '#5C7A4A' },
  { id: 'blue', label: 'Azul', hex: '#4F7196' },
  { id: 'gray', label: 'Cinza', hex: '#7D8790' },
];

export const BODY_SHAPES = [
  { id: 'slim', label: 'Esguio', width: 0.9 },
  { id: 'medium', label: 'Médio', width: 1 },
  { id: 'curvy', label: 'Curvilíneo', width: 1.14 },
  { id: 'plus', label: 'Plus', width: 1.28 },
];

export const MOBILITY = [
  { id: 'none', label: 'Nenhum' },
  { id: 'wheelchair', label: 'Cadeira de rodas' },
  { id: 'prosthetic_arm', label: 'Prótese de braço' },
];

export const TOP_STYLES = [
  { id: 'tee', label: 'Camiseta' },
  { id: 'vneck', label: 'Decote V' },
  { id: 'turtleneck', label: 'Gola alta' },
  { id: 'offshoulder', label: 'Ombro a ombro' },
  { id: 'blazer', label: 'Blazer' },
  { id: 'hoodie', label: 'Moletom' },
  { id: 'rare_dress', label: 'Vestido Rare', reward: 'top_rare_dress' },
];

export const CLOTH_COLORS = [
  { id: 'mauve', label: 'Malva', hex: '#A8737C' },
  { id: 'blush', label: 'Blush', hex: '#E8B9BF' },
  { id: 'cream', label: 'Creme', hex: '#F2E6D8' },
  { id: 'ink', label: 'Preto', hex: '#26221F' },
  { id: 'sage', label: 'Sálvia', hex: '#8FA88F' },
  { id: 'lavender', label: 'Lavanda', hex: '#B6A6D1' },
  { id: 'cobalt', label: 'Cobalto', hex: '#3D5BA9' },
  { id: 'terracotta', label: 'Terracota', hex: '#C0674A' },
  { id: 'butter', label: 'Manteiga', hex: '#F1D98A' },
  { id: 'rare_gold', label: 'Dourado Rare', hex: '#C9A15E', reward: 'color_rare_gold' },
];

export const ACCESSORIES = [
  { id: 'earrings_hoop', label: 'Argolas', group: 'ears' },
  { id: 'earrings_pearl', label: 'Pérolas', group: 'ears' },
  { id: 'hearing_aid', label: 'Aparelho auditivo', group: 'inclusive' },
  { id: 'glasses_round', label: 'Óculos redondos', group: 'eyes' },
  { id: 'glasses_dark', label: 'Óculos escuros', group: 'eyes' },
  { id: 'eyepatch', label: 'Tapa-olho', group: 'inclusive' },
  { id: 'necklace', label: 'Colar delicado', group: 'neck' },
  { id: 'headband', label: 'Tiara', group: 'head' },
  { id: 'flower', label: 'Flor no cabelo', group: 'head', reward: 'acc_flower' },
  { id: 'rare_pendant', label: 'Pingente Rare', group: 'neck', reward: 'acc_rare_pendant' },
];

export const BACKGROUNDS = [
  { id: 'blush', label: 'Blush', colors: ['#F7E3E4', '#EBC6CB'] },
  { id: 'nude', label: 'Nude', colors: ['#F8F0E8', '#E9D6C5'] },
  { id: 'sage', label: 'Sálvia', colors: ['#EEF2EA', '#CCD9C8'] },
  { id: 'sunset', label: 'Pôr do sol', colors: ['#FCE3CF', '#E9A2A6'], reward: 'bg_sunset' },
  { id: 'lavender', label: 'Lavanda', colors: ['#F0EAF8', '#C9B8E2'], reward: 'bg_lavender' },
  { id: 'night', label: 'Noite Rare', colors: ['#4A3440', '#231A20'], reward: 'bg_night' },
];

export const DEFAULT_AVATAR = {
  skin: 'medium',
  skinFeatures: [],
  hairStyle: 'long_wavy',
  hairColor: 'espresso',
  hijabColor: 'mauve',
  eyeColor: 'brown',
  bodyShape: 'medium',
  mobility: 'none',
  top: 'vneck',
  topColor: 'mauve',
  bottomColor: 'ink',
  accessories: ['earrings_pearl'],
  background: 'blush',
  makeup: {},
};

/** Helpers de lookup */
const index = (list) => Object.fromEntries(list.map((o) => [o.id, o]));
export const BY_ID = {
  skin: index(SKIN_TONES),
  hairColor: index(HAIR_COLORS),
  hijabColor: index(HIJAB_COLORS),
  eyeColor: index(EYE_COLORS),
  bodyShape: index(BODY_SHAPES),
  topColor: index(CLOTH_COLORS),
  bottomColor: index(CLOTH_COLORS),
  background: index(BACKGROUNDS),
};

export const isOptionUnlocked = (option, unlockedItems = []) =>
  !option.reward || unlockedItems.includes(option.reward);
