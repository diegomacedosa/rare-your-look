/**
 * Recompensas, distintivos e níveis (SPEC §5.3).
 *
 * Itens desbloqueáveis são sempre cosméticos: produtos, cores, roupas,
 * acessórios e cenários. Representação (tom de pele, cabelo, corpo,
 * cadeira de rodas, próteses) nunca é recompensa — já vem liberada.
 *
 * `ref` aponta para o que o item libera:
 *   product → id em data/products.js
 *   demais  → "grupo:opção" em data/avatarOptions.js
 */

export const REWARD_TYPES = {
  product: { label: 'Produto', plural: 'Produtos' },
  color: { label: 'Cor', plural: 'Cores' },
  clothes: { label: 'Roupa', plural: 'Roupas' },
  accessory: { label: 'Acessório', plural: 'Acessórios' },
  scenario: { label: 'Cenário', plural: 'Cenários' },
};

export const REWARDS = [
  // ---------------------------------------- recompensas de desafio (1ª vez)
  { id: 'rw_blush_lucky', type: 'product', ref: 'blush_lucky', name: 'Blush Lucky',
    description: 'Pink vibrante dewy — liberado no Rose Mood.', unlock: { challenge: 'challenge_001' } },
  { id: 'rw_high_exhilarate', type: 'product', ref: 'high_exhilarate', name: 'Luminizer Exhilarate',
    description: 'Glow bronze para todos os tons de pele.', unlock: { challenge: 'challenge_002' } },
  { id: 'rw_lip_devoted', type: 'product', ref: 'lip_devoted', name: 'Batom Devoted',
    description: 'Coral vibrante que acende o rosto.', unlock: { challenge: 'challenge_003' } },
  { id: 'rw_earrings_pearls', type: 'accessory', ref: 'earrings:pearls', name: 'Brincos de pérola',
    description: 'Clássico que fecha qualquer look.', unlock: { challenge: 'challenge_004' } },
  { id: 'rw_lip_wise', type: 'product', ref: 'lip_wise', name: 'Batom Wise',
    description: 'Berry escuro de alto impacto.', unlock: { challenge: 'challenge_005' } },
  { id: 'rw_top_offshoulder', type: 'clothes', ref: 'top:offshoulder', name: 'Blusa ombro a ombro',
    description: 'Decote amplo para dias de sol.', unlock: { challenge: 'challenge_006' } },
  { id: 'rw_bronzer_sunny', type: 'product', ref: 'bronzer_always_sunny', name: 'Bronzer Always Sunny',
    description: 'Bronze profundo para esculpir o rosto.', unlock: { challenge: 'challenge_007' } },
  { id: 'rw_top_blazer', type: 'clothes', ref: 'top:blazer', name: 'Blazer alfaiataria',
    description: 'Estrutura para os looks de noite.', unlock: { challenge: 'challenge_008' } },
  { id: 'rw_shadow_dreamy', type: 'product', ref: 'shadow_dreamy', name: 'Sombra Dreamy',
    description: 'Lilás perolado — ousadia leve.', unlock: { challenge: 'challenge_009' } },
  { id: 'rw_bg_night', type: 'scenario', ref: 'scenario:bg_night', name: 'Cenário Night Out',
    description: 'O estúdio depois que as luzes baixam.', unlock: { challenge: 'challenge_010' } },

  // --------------------------------------------- recompensas por pontuação
  { id: 'rw_color_top_lilac', type: 'color', ref: 'topColor:lilac', name: 'Lilás para roupas',
    description: 'Nova cor no guarda-roupa.', unlock: { points: 150 } },
  { id: 'rw_bg_sunset', type: 'scenario', ref: 'scenario:bg_sunset', name: 'Cenário Golden Hour',
    description: 'Aquela luz de 17h que favorece todo mundo.', unlock: { points: 300 } },
  { id: 'rw_oil_happy', type: 'product', ref: 'oil_happy', name: 'Lip Oil Happy',
    description: 'Pink glossy de alta luz.', unlock: { points: 450 } },
  { id: 'rw_color_hair_pink', type: 'color', ref: 'hairColor:pink', name: 'Cabelo rosa',
    description: 'Porque sim.', unlock: { points: 600 } },
  { id: 'rw_necklace_gold', type: 'accessory', ref: 'neck:gold', name: 'Corrente dourada',
    description: 'Um fio fino no colo.', unlock: { points: 800 } },
  { id: 'rw_blush_believe', type: 'product', ref: 'blush_believe', name: 'Blush Believe',
    description: 'Mauve profundo para looks de noite.', unlock: { points: 1000 } },
  { id: 'rw_color_top_sage', type: 'color', ref: 'topColor:sage', name: 'Verde sálvia',
    description: 'Nova cor no guarda-roupa.', unlock: { points: 1200 } },
  { id: 'rw_bg_garden', type: 'scenario', ref: 'scenario:bg_garden', name: 'Cenário Garden',
    description: 'Estúdio ao ar livre.', unlock: { points: 1400 } },
  { id: 'rw_shadow_gold', type: 'product', ref: 'shadow_gold', name: 'Sombra Golden Hour',
    description: 'Dourado quente de fim de tarde.', unlock: { points: 1650 } },
  { id: 'rw_color_hair_lilac', type: 'color', ref: 'hairColor:lilac', name: 'Cabelo lilás',
    description: 'Pastel que combina com tudo.', unlock: { points: 1900 } },
  { id: 'rw_hair_clips', type: 'accessory', ref: 'hairAcc:clips', name: 'Presilhas',
    description: 'Detalhe que muda o penteado.', unlock: { points: 2200 } },
  { id: 'rw_color_top_terracotta', type: 'color', ref: 'topColor:terracotta', name: 'Terracota',
    description: 'Nova cor no guarda-roupa.', unlock: { points: 2500 } },
];

export const REWARDS_BY_ID = Object.fromEntries(REWARDS.map((reward) => [reward.id, reward]));
export const getReward = (id) => REWARDS_BY_ID[id] ?? null;

/** Distintivos de conquista (SPEC §5.3). `progress` recebe o player salvo. */
export const BADGES = [
  { id: 'rare_starter', name: 'Rare Starter', description: 'Primeiro desafio concluído.', goal: 1,
    progress: (p) => p.completedChallenges.length },
  { id: 'color_explorer', name: 'Color Explorer', description: '5 desafios de cor concluídos.', goal: 5,
    progress: (p) => p.stats.colorCompleted },
  { id: 'mood_master', name: 'Mood Master', description: '5 desafios de humor concluídos.', goal: 5,
    progress: (p) => p.stats.moodCompleted },
  { id: 'bold_choice', name: 'Bold Choice', description: 'Desafio com regra surpresa cumprida.', goal: 1,
    progress: (p) => p.stats.specialCompleted },
  { id: 'time_queen', name: 'Time Queen', description: '3 desafios cronometrados concluídos no tempo.', goal: 3,
    progress: (p) => p.stats.timedCompleted },
  { id: 'rare_collector', name: 'Rare Collector', description: '20 itens desbloqueados.', goal: 20,
    progress: (p) => p.unlockedItems.length },
  { id: 'rare_legend', name: 'Rare Legend', description: 'Todos os desafios concluídos.', goal: 10,
    progress: (p) => p.completedChallenges.length },
];

export const BADGES_BY_ID = Object.fromEntries(BADGES.map((badge) => [badge.id, badge]));

/** Níveis por pontuação acumulada. */
export const LEVELS = [
  { level: 1, min: 0, title: 'Descobrindo' },
  { level: 2, min: 200, title: 'Explorando' },
  { level: 3, min: 500, title: 'Criando' },
  { level: 4, min: 900, title: 'Brilhando' },
  { level: 5, min: 1400, title: 'Autoral' },
  { level: 6, min: 2000, title: 'Referência' },
  { level: 7, min: 2700, title: 'Ícone' },
  { level: 8, min: 3500, title: 'Rare Legend' },
];

/** Nível atual + progresso até o próximo. */
export function levelFor(points = 0) {
  let current = LEVELS[0];
  for (const level of LEVELS) if (points >= level.min) current = level;
  const next = LEVELS.find((level) => level.min > points) ?? null;
  const span = next ? next.min - current.min : 1;
  const progress = next ? Math.min(1, (points - current.min) / span) : 1;
  return { ...current, next, progress, toNext: next ? next.min - points : 0 };
}
