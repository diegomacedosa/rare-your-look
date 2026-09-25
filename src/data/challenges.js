/**
 * Definições dos desafios (SPEC §5.1 / §5.4).
 *
 * Tipos de regra suportados (ver ChallengeSystem.evaluateRule):
 *  required_color {value: family}        — ao menos 1 produto da família
 *  color_in_slot  {value: family, slot}  — produto daquela família naquele slot
 *  min_products / max_products {value}
 *  required_slot  {value: slot}          — usar um produto no slot
 *  forbidden_slot {value: slot}
 *  required_finish {value: finish}
 *  mood_tag       {value: tag, count}    — N produtos com a tag
 *  monochrome     {value: family}        — todos os produtos coloridos na família
 */
export const TYPES = {
  mood: { label: 'Mood', icon: 'heart' },
  color: { label: 'Color', icon: 'palette' },
  limited: { label: 'Limited', icon: 'minus' },
  time: { label: 'Time', icon: 'clock' },
  surprise: { label: 'Surprise', icon: 'gift' },
};

export const DIFFICULTIES = {
  1: { label: 'Explore', timeLimit: null, surprise: false },
  2: { label: 'Express', timeLimit: null, surprise: false },
  3: { label: 'Rare Mode', timeLimit: [90, 120], surprise: true },
};

/** Bônus padrão por dificuldade, alinhados à tabela de pontuação (SPEC §5.2). */
const BONUS = {
  1: [{ condition: 'harmony', bonus: 25 }],
  2: [{ condition: 'harmony', bonus: 25 }],
  3: [
    { condition: 'within_time', bonus: 25 },
    { condition: 'time_remaining_50pct', bonus: 25 },
    { condition: 'surprise_met', bonus: 75 },
  ],
};

const LIMITED_WARM = ['lip_02', 'lip_05', 'lip_10', 'blush_02', 'blush_05', 'blush_07', 'highlight_01', 'highlight_03', 'shadow_05', 'shadow_06', 'shadow_01', 'base_01', 'base_02', 'mascara_01', 'brows_01'];
const LIMITED_COOL = ['lip_06', 'lip_07', 'lip_08', 'lip_09', 'blush_03', 'blush_04', 'blush_06', 'shadow_03', 'shadow_04', 'highlight_02', 'highlight_04', 'liner_01', 'mascara_01', 'brows_02'];

export const CHALLENGES = [
  {
    id: 'challenge_001',
    name: 'Rose Mood',
    type: 'mood',
    difficulty: 1,
    tagline: 'Romântico, suave e totalmente você.',
    description: 'Crie um look com um toque rosado. Onde ele aparece é escolha sua: lábios, bochechas ou olhos.',
    rules: [{ type: 'required_color', value: 'rose' }],
    surpriseRule: null,
    timeLimit: null,
    availableProducts: 'all',
    pointsBase: 100,
    bonusConditions: BONUS[1],
    reward: 'acc_flower',
    perfectReward: 'aff_01',
    unlockAfter: 0,
    accent: '#D98C98',
  },
  {
    id: 'challenge_002',
    name: 'Glow From Within',
    type: 'mood',
    difficulty: 1,
    tagline: 'Luz de dentro pra fora.',
    description: 'Use um produto cintilante para criar um brilho natural.',
    rules: [{ type: 'required_finish', value: 'shimmer' }],
    surpriseRule: null,
    timeLimit: null,
    availableProducts: 'all',
    pointsBase: 100,
    bonusConditions: BONUS[1],
    reward: 'prod_transform',
    perfectReward: 'aff_02',
    unlockAfter: 0,
    accent: '#E8C9A0',
  },
  {
    id: 'challenge_003',
    name: 'Peach Please',
    type: 'color',
    difficulty: 1,
    tagline: 'Fresco como uma manhã de verão.',
    description: 'Inclua pelo menos um produto na família pêssego.',
    rules: [{ type: 'required_color', value: 'peach' }],
    surpriseRule: null,
    timeLimit: null,
    availableProducts: 'all',
    pointsBase: 100,
    bonusConditions: BONUS[1],
    reward: 'bg_sunset',
    perfectReward: 'aff_03',
    unlockAfter: 1,
    accent: '#EFA17F',
  },
  {
    id: 'challenge_004',
    name: 'Berry Bold',
    type: 'color',
    difficulty: 2,
    tagline: 'Intensidade na medida certa.',
    description: 'Monte um look com tom berry e pelo menos 3 produtos.',
    rules: [
      { type: 'required_color', value: 'berry' },
      { type: 'min_products', value: 3 },
    ],
    surpriseRule: null,
    timeLimit: null,
    availableProducts: LIMITED_COOL,
    pointsBase: 100,
    bonusConditions: BONUS[2],
    reward: 'prod_lucky',
    perfectReward: 'aff_04',
    unlockAfter: 2,
    accent: '#8C3552',
  },
  {
    id: 'challenge_005',
    name: 'Menos é Rare',
    type: 'limited',
    difficulty: 2,
    tagline: 'Três produtos. Infinitas possibilidades.',
    description: 'Use no máximo 3 produtos — e não esqueça dos lábios.',
    rules: [
      { type: 'max_products', value: 3 },
      { type: 'required_slot', value: 'lips' },
    ],
    surpriseRule: null,
    timeLimit: null,
    availableProducts: [...new Set([...LIMITED_WARM.slice(0, 8), ...LIMITED_COOL.slice(0, 6)])],
    pointsBase: 100,
    bonusConditions: BONUS[2],
    reward: 'hair_rose',
    perfectReward: 'aff_05',
    unlockAfter: 2,
    special: true,
    accent: '#C99A84',
  },
  {
    id: 'challenge_006',
    name: 'Monocromático Malva',
    type: 'color',
    difficulty: 2,
    tagline: 'Um tom, muitas camadas.',
    description: 'Todos os produtos coloridos devem ser da família malva. Use pelo menos 3 produtos.',
    rules: [
      { type: 'monochrome', value: 'mauve' },
      { type: 'min_products', value: 3 },
    ],
    surpriseRule: null,
    timeLimit: null,
    availableProducts: [...LIMITED_COOL, 'shadow_02', 'blush_01'],
    pointsBase: 100,
    bonusConditions: BONUS[2],
    reward: 'bg_lavender',
    perfectReward: 'aff_06',
    unlockAfter: 3,
    accent: '#A8737C',
  },
  {
    id: 'challenge_007',
    name: 'Sunset Glow',
    type: 'mood',
    difficulty: 2,
    tagline: 'A hora dourada no seu rosto.',
    description: 'Use 3 produtos de tom quente e finalize com iluminador.',
    rules: [
      { type: 'mood_tag', value: 'warm', count: 3 },
      { type: 'required_slot', value: 'highlight' },
    ],
    surpriseRule: null,
    timeLimit: null,
    availableProducts: LIMITED_WARM,
    pointsBase: 100,
    bonusConditions: BONUS[2],
    reward: 'prod_bronze_eye',
    perfectReward: 'hair_lilac',
    unlockAfter: 4,
    accent: '#E9A2A6',
  },
  {
    id: 'challenge_008',
    name: 'Pronta em 90s',
    type: 'time',
    difficulty: 3,
    tagline: 'Rápida, fresca e sem pressão.',
    description: 'Você tem 90 segundos: 4 produtos, máscara nos cílios e um toque coral.',
    rules: [
      { type: 'min_products', value: 4 },
      { type: 'required_slot', value: 'mascara' },
      { type: 'required_color', value: 'coral' },
    ],
    surpriseRule: 'random',
    timeLimit: 90,
    availableProducts: [...LIMITED_WARM, 'lip_04', 'blush_01'],
    pointsBase: 100,
    bonusConditions: BONUS[3],
    reward: 'prod_fearless',
    perfectReward: 'aff_07',
    unlockAfter: 5,
    accent: '#E8795F',
  },
  {
    id: 'challenge_009',
    name: 'Red Carpet Rare',
    type: 'time',
    difficulty: 3,
    tagline: 'Holofotes em você.',
    description: 'Batom vermelho, delineado marcante e no máximo 5 produtos em 120 segundos.',
    rules: [
      { type: 'color_in_slot', value: 'red', slot: 'lips' },
      { type: 'required_slot', value: 'liner' },
      { type: 'max_products', value: 5 },
    ],
    surpriseRule: 'random',
    timeLimit: 120,
    availableProducts: ['lip_03', 'lip_10', 'lip_01', 'lip_07', 'liner_01', 'liner_02', 'mascara_01', 'brows_02', 'blush_03', 'blush_07', 'highlight_01', 'highlight_04', 'shadow_01', 'shadow_04', 'base_03'],
    pointsBase: 100,
    bonusConditions: BONUS[3],
    reward: 'prod_serenity',
    perfectReward: 'top_rare_dress',
    unlockAfter: 6,
    accent: '#B82832',
  },
  {
    id: 'challenge_010',
    name: 'Rare Surprise',
    type: 'surprise',
    difficulty: 3,
    tagline: 'Espere o inesperado.',
    description: 'A cor principal é sorteada na hora — e uma regra surpresa aparece no meio do caminho.',
    rules: [
      { type: 'required_color', value: 'random' },
      { type: 'min_products', value: 3 },
    ],
    randomColorPool: ['rose', 'coral', 'berry', 'pink', 'peach', 'mauve', 'bronze'],
    surpriseRule: 'random',
    timeLimit: 120,
    availableProducts: 'all',
    pointsBase: 100,
    bonusConditions: BONUS[3],
    reward: 'color_rare_gold',
    perfectReward: 'aff_08',
    unlockAfter: 7,
    special: true,
    accent: '#C9A15E',
  },
];

/** Regras que podem ser sorteadas como surpresa no Rare Mode. */
export const SURPRISE_POOL = [
  { type: 'required_finish', value: 'gloss' },
  { type: 'required_slot', value: 'highlight' },
  { type: 'required_slot', value: 'brows' },
  { type: 'forbidden_slot', value: 'liner' },
  { type: 'mood_tag', value: 'glow', count: 2 },
  { type: 'max_products', value: 6 },
];

export const CHALLENGE_BY_ID = Object.fromEntries(CHALLENGES.map((c) => [c.id, c]));
