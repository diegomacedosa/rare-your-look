/**
 * Recompensas (itens colecionáveis) e distintivos de conquista (SPEC §5.3).
 */
export const ITEM_CATEGORIES = {
  product: 'Produtos',
  hair: 'Cabelo',
  outfit: 'Roupas',
  accessory: 'Acessórios',
  background: 'Cenários',
  affirmation: 'Cartas Rare',
};

const item = (id, category, name, description, extra = {}) => ({ id, category, name, description, ...extra });

export const ITEMS = [
  // Produtos (desbloqueiam tons novos no Studio)
  item('prod_fearless', 'product', 'Kind Words — Fearless', 'Batom matte pink vibrante.', { productId: 'lip_09', hex: '#D9486C' }),
  item('prod_serenity', 'product', 'Soft Pinch Lip Oil — Serenity', 'Óleo labial vermelho com brilho.', { productId: 'lip_10', hex: '#C4574E' }),
  item('prod_lucky', 'product', 'Soft Pinch Blush — Lucky', 'Blush berry intenso.', { productId: 'blush_06', hex: '#A8435E' }),
  item('prod_transform', 'product', 'Positive Light — Transform', 'Iluminador perolado.', { productId: 'highlight_04', hex: '#F4E6DE' }),
  item('prod_bronze_eye', 'product', 'Stay Vulnerable — Nearly Bronze', 'Sombra cremosa bronze cintilante.', { productId: 'shadow_06', hex: '#9C6A45' }),

  // Avatar
  item('hair_rose', 'hair', 'Cabelo Rosa', 'Nova cor de cabelo para o avatar.', { hex: '#D48A9A' }),
  item('hair_lilac', 'hair', 'Cabelo Lilás', 'Nova cor de cabelo para o avatar.', { hex: '#A58BC0' }),
  item('top_rare_dress', 'outfit', 'Vestido Rare', 'Modelo exclusivo com decote coração.', { hex: '#A8737C' }),
  item('color_rare_gold', 'outfit', 'Dourado Rare', 'Nova cor para as roupas.', { hex: '#C9A15E' }),
  item('acc_flower', 'accessory', 'Flor no cabelo', 'Um toque romântico.', { hex: '#E8B9BF' }),
  item('acc_rare_pendant', 'accessory', 'Pingente Rare', 'Pingente dourado exclusivo.', { hex: '#C9A15E' }),
  item('bg_sunset', 'background', 'Cenário Pôr do sol', 'Fundo quente para o avatar.', { hex: '#E9A2A6' }),
  item('bg_lavender', 'background', 'Cenário Lavanda', 'Fundo lavanda para o avatar.', { hex: '#C9B8E2' }),
  item('bg_night', 'background', 'Cenário Noite Rare', 'Fundo exclusivo para lendas.', { hex: '#4A3440' }),

  // Cartas Rare — afirmações (missão de saúde mental da marca)
  item('aff_01', 'affirmation', 'Você é Rare', 'Não existe um jeito único de ser Rare.', { hex: '#F0D5D8' }),
  item('aff_02', 'affirmation', 'Brilhe do seu jeito', 'Sua luz não precisa de filtro.', { hex: '#F2D8B0' }),
  item('aff_03', 'affirmation', 'Gentileza primeiro', 'Seja gentil com você também.', { hex: '#FCE3CF' }),
  item('aff_04', 'affirmation', 'Coragem é cor', 'Ousar também é autocuidado.', { hex: '#E4B3C2' }),
  item('aff_05', 'affirmation', 'Menos é Rare', 'Você já é suficiente.', { hex: '#EEE3DA' }),
  item('aff_06', 'affirmation', 'Sinta tudo', 'Todas as emoções são válidas.', { hex: '#D9CDE8' }),
  item('aff_07', 'affirmation', 'No seu tempo', 'Tudo bem pedir uma pausa.', { hex: '#DCE8DA' }),
  item('aff_08', 'affirmation', 'Conte com alguém', 'Falar sobre saúde mental importa.', { hex: '#F7E3E4' }),
];

export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

/**
 * Distintivos. `progress(stats)` retorna { current, target }.
 * stats é gerado por RewardSystem.computeStats().
 */
export const BADGES = [
  {
    id: 'rare_starter',
    name: 'Rare Starter',
    description: 'Conclua seu primeiro desafio.',
    icon: 'sparkle',
    progress: (s) => ({ current: Math.min(s.totalCompletions, 1), target: 1 }),
  },
  {
    id: 'color_explorer',
    name: 'Color Explorer',
    description: 'Conclua 5 desafios de cor.',
    icon: 'palette',
    progress: (s) => ({ current: Math.min(s.byType.color || 0, 5), target: 5 }),
  },
  {
    id: 'bold_choice',
    name: 'Bold Choice',
    description: 'Conclua um desafio com regra especial.',
    icon: 'bolt',
    progress: (s) => ({ current: Math.min(s.specialCompletions, 1), target: 1 }),
  },
  {
    id: 'rare_collector',
    name: 'Rare Collector',
    description: 'Desbloqueie 20 itens.',
    icon: 'gem',
    progress: (s) => ({ current: Math.min(s.itemsUnlocked, 20), target: 20 }),
  },
  {
    id: 'mood_master',
    name: 'Mood Master',
    description: 'Conclua 5 desafios de humor.',
    icon: 'heart',
    progress: (s) => ({ current: Math.min(s.byType.mood || 0, 5), target: 5 }),
  },
  {
    id: 'time_queen',
    name: 'Time Queen',
    description: 'Conclua 3 desafios cronometrados.',
    icon: 'clock',
    progress: (s) => ({ current: Math.min(s.timedCompletions, 3), target: 3 }),
    grants: 'acc_rare_pendant',
  },
  {
    id: 'rare_legend',
    name: 'Rare Legend',
    description: 'Conclua todos os desafios.',
    icon: 'crown',
    progress: (s) => ({ current: s.distinctCompleted, target: s.totalChallenges }),
    grants: 'bg_night',
  },
];

export const BADGE_BY_ID = Object.fromEntries(BADGES.map((b) => [b.id, b]));

/** Níveis do jogador por pontos totais. */
export const LEVELS = [
  { level: 1, name: 'Rare Rookie', min: 0 },
  { level: 2, name: 'Blush Beginner', min: 250 },
  { level: 3, name: 'Glow Getter', min: 600 },
  { level: 4, name: 'Color Curator', min: 1100 },
  { level: 5, name: 'Look Artist', min: 1800 },
  { level: 6, name: 'Rare Icon', min: 2700 },
];
