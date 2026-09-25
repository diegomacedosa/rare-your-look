/**
 * Definição dos desafios (SPEC §5.1 e GDD §2.6).
 *
 * Tipos: mood · color · limited · time · surprise
 * Dificuldades: 1 Explore · 2 Express · 3 Rare Mode (SPEC §5.4)
 *   1 → sem tempo, catálogo inteiro, 1 regra
 *   2 → sem tempo, produtos limitados, 2 regras
 *   3 → 90–120s, produtos limitados, 2+ regras e chance de regra surpresa
 */

export const DIFFICULTIES = {
  1: { id: 1, name: 'Explore', summary: 'Sem tempo · catálogo completo · 1 regra' },
  2: { id: 2, name: 'Express', summary: 'Sem tempo · produtos limitados · 2 regras' },
  3: { id: 3, name: 'Rare Mode', summary: 'Contra o relógio · 2+ regras · regra surpresa' },
};

export const CHALLENGE_TYPES = {
  mood: { label: 'Mood', hint: 'Um look para um humor, um estilo, uma ocasião.' },
  color: { label: 'Color', hint: 'A cor manda no look.' },
  limited: { label: 'Limited', hint: 'Só com o que está na bancada.' },
  time: { label: 'Time', hint: 'Relógio correndo: capriche rápido.' },
  surprise: { label: 'Surprise', hint: 'Uma regra nova aparece no meio da criação.' },
};

/** Bônus padrão de desafios cronometrados (SPEC §5.2). */
const TIME_BONUSES = [
  { condition: 'within_time', bonus: 25 },
  { condition: 'time_remaining_50pct', bonus: 25 },
];
const SURPRISE_BONUS = { condition: 'surprise_met', bonus: 75 };

export const CHALLENGES = [
  {
    id: 'challenge_001',
    name: 'Rose Mood',
    type: 'mood',
    difficulty: 1,
    brief: 'Domingo de manhã, luz suave na janela. O look pede rosé — do seu jeito.',
    rules: [
      { type: 'required_color', value: '#E8A0A8', tolerance: 18, count: 1, label: 'Use pelo menos 1 produto no tom rosé' },
    ],
    surprise: null,
    timeLimit: null,
    availableProducts: 'all',
    pointsBase: 100,
    bonusConditions: [],
    rewardId: 'rw_blush_lucky',
    unlock: { completed: 0 },
  },
  {
    id: 'challenge_002',
    name: 'Glow Natural',
    type: 'mood',
    difficulty: 1,
    brief: 'Pele iluminada sem parecer maquiagem. Glow é sobre luz, não sobre cobertura.',
    rules: [
      { type: 'mood', value: 'glow', count: 2, label: 'Use 2 produtos com efeito glow' },
    ],
    surprise: null,
    timeLimit: null,
    availableProducts: 'all',
    pointsBase: 100,
    bonusConditions: [],
    rewardId: 'rw_high_exhilarate',
    unlock: { completed: 0 },
  },
  {
    id: 'challenge_003',
    name: 'Coral Crush',
    type: 'color',
    difficulty: 1,
    brief: 'Aquele coral de fim de tarde que combina com qualquer tom de pele.',
    rules: [
      { type: 'required_color', value: '#EE9478', tolerance: 18, count: 2, label: 'Use 2 produtos em tons de coral' },
    ],
    surprise: null,
    timeLimit: null,
    availableProducts: 'all',
    pointsBase: 100,
    bonusConditions: [],
    rewardId: 'rw_lip_devoted',
    unlock: { completed: 0 },
  },
  {
    id: 'challenge_004',
    name: 'Menos é Mais',
    type: 'limited',
    difficulty: 2,
    brief: 'Só o que está na bancada. Três produtos bem escolhidos resolvem o dia.',
    rules: [
      { type: 'required_categories', value: ['eyes', 'cheeks', 'lips'], label: 'Um produto de olhos, um de bochechas e um de lábios' },
      { type: 'max_products', value: 3, label: 'No máximo 3 produtos no total' },
    ],
    surprise: null,
    timeLimit: null,
    availableProducts: ['blush_hope', 'high_enlighten', 'shadow_calm', 'mascara_black', 'lip_humble', 'oil_hope'],
    pointsBase: 100,
    bonusConditions: [],
    rewardId: 'rw_earrings_pearls',
    unlock: { completed: 2 },
  },
  {
    id: 'challenge_005',
    name: 'Berry Night',
    type: 'color',
    difficulty: 2,
    brief: 'A noite pede berry: profundo, vinho, com um traço bem marcado.',
    rules: [
      { type: 'color_family', value: 'berry', count: 2, label: 'Use 2 produtos da família berry' },
      { type: 'required_slot', value: 'liner', label: 'Finalize com delineador' },
    ],
    surprise: null,
    timeLimit: null,
    availableProducts: ['blush_grace', 'shadow_brave', 'liner_black', 'mascara_black', 'lip_brave', 'oil_hope', 'high_enlighten', 'blush_hope'],
    pointsBase: 100,
    bonusConditions: [],
    rewardId: 'rw_lip_wise',
    unlock: { completed: 2 },
  },
  {
    id: 'challenge_006',
    name: 'Brunch de Domingo',
    type: 'mood',
    difficulty: 2,
    brief: 'Mesa na calçada, café gelado, foto no sol. Leve, fresh, sem exagero.',
    rules: [
      { type: 'mood', value: 'fresh', count: 2, label: 'Use 2 produtos com clima fresh' },
      { type: 'max_products', value: 4, label: 'No máximo 4 produtos' },
    ],
    surprise: null,
    timeLimit: null,
    availableProducts: ['blush_joy', 'blush_hope', 'high_mesmerize', 'bronzer_happy_sol', 'shadow_kind', 'mascara_black', 'liner_black', 'lip_brave', 'oil_joy'],
    pointsBase: 100,
    bonusConditions: [],
    rewardId: 'rw_top_offshoulder',
    unlock: { completed: 3 },
  },
  {
    id: 'challenge_007',
    name: 'Glow Express',
    type: 'time',
    difficulty: 3,
    brief: 'Noventa segundos até a chamada de vídeo. Luz no rosto, já.',
    rules: [
      { type: 'mood', value: 'glow', count: 3, label: 'Use 3 produtos com efeito glow' },
      { type: 'required_category', value: 'lips', label: 'Inclua um produto de lábios' },
      { type: 'min_products', value: 4, label: 'Use pelo menos 4 produtos' },
    ],
    surprise: { chance: 0.4, at: 0.4 },
    timeLimit: 90,
    availableProducts: ['high_enlighten', 'high_mesmerize', 'bronzer_happy_sol', 'blush_hope', 'oil_hope', 'lip_talented', 'mascara_black', 'shadow_calm'],
    pointsBase: 100,
    bonusConditions: [...TIME_BONUSES, SURPRISE_BONUS],
    rewardId: 'rw_bronzer_sunny',
    unlock: { completed: 5 },
  },
  {
    id: 'challenge_008',
    name: 'Red Carpet em 2 Minutos',
    type: 'time',
    difficulty: 3,
    brief: 'O carro já está lá embaixo. Boca vermelha e um traço impecável.',
    rules: [
      { type: 'required_color', value: '#B02A3C', tolerance: 18, count: 1, label: 'Use um produto vermelho' },
      { type: 'required_slot', value: 'liner', label: 'Delineado marcado' },
      { type: 'mood', value: 'glow', count: 1, label: 'Um toque de glow' },
    ],
    surprise: { chance: 0.4, at: 0.4 },
    timeLimit: 120,
    availableProducts: ['lip_brave', 'lip_talented', 'liner_black', 'liner_brown', 'mascara_black', 'high_enlighten', 'high_mesmerize', 'blush_grace', 'bronzer_happy_sol', 'shadow_calm'],
    pointsBase: 100,
    bonusConditions: [...TIME_BONUSES, SURPRISE_BONUS],
    rewardId: 'rw_top_blazer',
    unlock: { completed: 5 },
  },
  {
    id: 'challenge_009',
    name: 'Plot Twist',
    type: 'surprise',
    difficulty: 3,
    brief: 'Comece do seu jeito. No meio do caminho o estúdio muda a regra.',
    rules: [
      { type: 'min_products', value: 3, label: 'Use pelo menos 3 produtos' },
      { type: 'required_color', value: '#D98E95', tolerance: 16, count: 1, label: 'Inclua um tom rosé' },
    ],
    surprise: { chance: 1, at: 0.35 },
    timeLimit: 110,
    availableProducts: ['blush_hope', 'blush_grace', 'shadow_kind', 'shadow_brave', 'liner_black', 'mascara_black', 'lip_talented', 'lip_brave', 'oil_hope', 'high_mesmerize', 'bronzer_happy_sol'],
    pointsBase: 100,
    bonusConditions: [...TIME_BONUSES, SURPRISE_BONUS],
    rewardId: 'rw_shadow_dreamy',
    unlock: { completed: 6 },
  },
  {
    id: 'challenge_010',
    name: 'Rare do Seu Jeito',
    type: 'surprise',
    difficulty: 3,
    brief: 'O desafio final: três áreas do rosto, atitude bold e nenhuma regra sobre como você deve ser.',
    rules: [
      { type: 'required_categories', value: ['eyes', 'cheeks', 'lips'], label: 'Um produto de cada área: olhos, bochechas e lábios' },
      { type: 'mood', value: 'bold', count: 2, label: 'Use 2 produtos com atitude bold' },
      { type: 'max_products', value: 5, label: 'No máximo 5 produtos' },
    ],
    surprise: { chance: 1, at: 0.35 },
    timeLimit: 120,
    availableProducts: ['blush_grace', 'blush_hope', 'high_mesmerize', 'bronzer_happy_sol', 'shadow_brave', 'shadow_kind', 'liner_black', 'mascara_black', 'lip_brave', 'lip_talented', 'oil_hope', 'oil_joy'],
    pointsBase: 100,
    bonusConditions: [...TIME_BONUSES, SURPRISE_BONUS],
    rewardId: 'rw_bg_night',
    unlock: { completed: 8 },
  },
];

/**
 * Regras que podem aparecer no meio do desafio (Surprise Challenge).
 * O ChallengeSystem só sorteia as que ainda são possíveis de cumprir
 * com os produtos daquele desafio.
 */
export const SURPRISE_POOL = [
  { id: 'sp_mascara', type: 'required_slot', value: 'mascara', label: 'Inclua máscara de cílios' },
  { id: 'sp_glow', type: 'mood', value: 'glow', count: 1, label: 'Inclua um produto com efeito glow' },
  { id: 'sp_shimmer', type: 'finish', value: 'shimmer', count: 1, label: 'Use um produto cintilante' },
  { id: 'sp_no_lipstick', type: 'forbidden_slot', value: 'lipstick', label: 'Sem batom: resolva a boca de outro jeito' },
  { id: 'sp_eyes', type: 'required_category', value: 'eyes', label: 'Os olhos precisam de destaque' },
  { id: 'sp_cheeks', type: 'required_category', value: 'cheeks', label: 'Dê cor às bochechas' },
  { id: 'sp_max4', type: 'max_products', value: 4, label: 'Simplifique: no máximo 4 produtos' },
];

export const CHALLENGES_BY_ID = Object.fromEntries(CHALLENGES.map((c) => [c.id, c]));
export const getChallenge = (id) => CHALLENGES_BY_ID[id] ?? null;
