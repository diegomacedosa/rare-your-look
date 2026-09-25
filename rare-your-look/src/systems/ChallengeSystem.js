/**
 * ChallengeSystem — regras, validação e regra surpresa.
 *
 * Um "look" é um objeto { slot: productId }. Toda validação acontece
 * em cima dessa estrutura, o que permite checar as regras em tempo real
 * na StudioScene e também simular soluções (solver) para garantir que
 * todo desafio é possível de cumprir.
 */
import { SLOTS, getProduct, lookProducts, PRODUCTS, isProductUnlocked, DEFAULT_PRODUCT_IDS } from '../data/products.js';
import { CHALLENGES, SURPRISE_POOL } from '../data/challenges.js';
import { colorMatches } from '../utils/color.js';
import { createRng, shuffle } from '../utils/random.js';

const categoryOf = (product) => SLOTS[product.slot]?.category ?? 'face';

/** Texto padrão de uma regra, caso o desafio não traga um `label`. */
export function ruleLabel(rule) {
  if (rule.label) return rule.label;
  switch (rule.type) {
    case 'min_products': return `Use pelo menos ${rule.value} produtos`;
    case 'max_products': return `Use no máximo ${rule.value} produtos`;
    case 'required_color': return `Use ${rule.count ?? 1} produto(s) na cor indicada`;
    case 'color_family': return `Use ${rule.count ?? 1} produto(s) da família ${rule.value}`;
    case 'mood': return `Use ${rule.count ?? 1} produto(s) com clima ${rule.value}`;
    case 'finish': return `Use ${rule.count ?? 1} produto(s) com acabamento ${rule.value}`;
    case 'required_slot': return `Inclua ${SLOTS[rule.value]?.label ?? rule.value}`;
    case 'forbidden_slot': return `Não use ${SLOTS[rule.value]?.label ?? rule.value}`;
    case 'required_category': return `Inclua um produto de ${rule.value}`;
    case 'required_categories': return `Inclua um produto de cada: ${rule.value.join(', ')}`;
    case 'forbidden_category': return `Não use produtos de ${rule.value}`;
    default: return 'Regra do desafio';
  }
}

/** Valida uma regra contra um look. */
export function checkRule(rule, look = {}) {
  const products = lookProducts(look);
  const count = rule.count ?? 1;

  switch (rule.type) {
    case 'min_products':
      return products.length >= rule.value;
    case 'max_products':
      return products.length <= rule.value;
    case 'required_color':
      return products.filter((p) => colorMatches(p.color, rule.value, rule.tolerance ?? 22)).length >= count;
    case 'color_family':
      return products.filter((p) => p.family === rule.value).length >= count;
    case 'mood':
      return products.filter((p) => p.moods.includes(rule.value)).length >= count;
    case 'finish':
      return products.filter((p) => p.finish === rule.value).length >= count;
    case 'required_slot':
      return Boolean(look[rule.value]);
    case 'forbidden_slot':
      return !look[rule.value];
    case 'required_category':
      return products.filter((p) => categoryOf(p) === rule.value).length >= count;
    case 'required_categories':
      return rule.value.every((category) => products.some((p) => categoryOf(p) === category));
    case 'forbidden_category':
      return !products.some((p) => categoryOf(p) === rule.value);
    default:
      console.warn(`[ChallengeSystem] regra desconhecida: ${rule.type}`);
      return false;
  }
}

/**
 * Avalia todas as regras de uma partida.
 * A primeira regra do desafio é a "principal" (100 pts no SPEC §5.2);
 * as demais são extras (+50 cada). A regra surpresa entra separada.
 */
export function evaluate(challenge, look = {}, surpriseRule = null) {
  const rules = (challenge?.rules ?? []).map((rule, index) => ({
    rule,
    label: ruleLabel(rule),
    isMain: index === 0,
    met: checkRule(rule, look),
  }));

  const surprise = surpriseRule
    ? { rule: surpriseRule, label: ruleLabel(surpriseRule), isSurprise: true, met: checkRule(surpriseRule, look) }
    : null;

  const all = surprise ? [...rules, surprise] : rules;
  return {
    rules,
    surprise,
    all,
    mainMet: rules[0]?.met ?? true,
    extrasMet: rules.slice(1).filter((r) => r.met).length,
    extrasTotal: Math.max(0, rules.length - 1),
    allMet: all.every((r) => r.met),
    metCount: all.filter((r) => r.met).length,
    total: all.length,
  };
}

/** Produtos disponíveis num desafio, considerando o que o jogador já desbloqueou. */
export function availableProductsFor(challenge, unlockedRewardIds = []) {
  if (!challenge) return [];
  if (challenge.availableProducts === 'all') {
    return PRODUCTS.filter((product) => isProductUnlocked(product, unlockedRewardIds));
  }
  return challenge.availableProducts
    .map((id) => getProduct(id))
    .filter(Boolean)
    .filter((product) => isProductUnlocked(product, unlockedRewardIds));
}

// --------------------------------------------------------------------- solver
/**
 * Procura um look que cumpra todas as regras.
 * Usado para (a) garantir que o desafio é possível — `npm run check:data`,
 * (b) filtrar regras surpresa impossíveis e (c) alimentar o botão de dica.
 *
 * @param {object[]} rules
 * @param {object[]} products lista disponível
 * @param {object} base look atual (as escolhas do jogador entram primeiro na busca)
 */
export function findSolution(rules, products, base = {}) {
  const bySlot = new Map();
  for (const product of products) {
    if (!bySlot.has(product.slot)) bySlot.set(product.slot, []);
    bySlot.get(product.slot).push(product);
  }
  const slots = [...bySlot.keys()];
  const maxRule = rules.find((rule) => rule.type === 'max_products');
  const limit = maxRule ? maxRule.value : slots.length;

  let solution = null;

  const search = (index, look, used) => {
    if (solution) return;
    if (used > limit) return;
    if (index === slots.length) {
      if (rules.every((rule) => checkRule(rule, look))) solution = { ...look };
      return;
    }
    const slot = slots[index];
    // Ordem de tentativa: o que o jogador já escolheu, depois o resto, depois "vazio".
    const options = [...bySlot.get(slot)].sort((a, b) => {
      const score = (p) => (base[slot] === p.id ? -1 : 0);
      return score(a) - score(b);
    });
    const tryEmptyFirst = !base[slot];
    const branches = tryEmptyFirst ? [null, ...options] : [...options, null];
    for (const product of branches) {
      if (solution) return;
      if (product) search(index + 1, { ...look, [slot]: product.id }, used + 1);
      else search(index + 1, look, used);
    }
  };

  search(0, {}, 0);
  return solution;
}

/**
 * Dica: o próximo passo que aproxima o look de uma solução válida.
 * @returns {{ action: 'apply'|'remove', slot: string, productId?: string }|null}
 */
export function hintFor(challenge, look, products, surpriseRule = null) {
  const rules = [...(challenge?.rules ?? [])];
  if (surpriseRule) rules.push(surpriseRule);
  const solution = findSolution(rules, products, look);
  if (!solution) return null;

  for (const [slot, productId] of Object.entries(solution)) {
    if (look[slot] !== productId) return { action: 'apply', slot, productId };
  }
  for (const slot of Object.keys(look)) {
    if (!solution[slot]) return { action: 'remove', slot, productId: look[slot] };
  }
  return null; // o look já cumpre tudo
}

// ------------------------------------------------------------------ surpresa
/** Sorteia se esta partida terá regra surpresa (Rare Mode). */
export function rollSurprise(challenge, rng = Math.random) {
  if (!challenge?.surprise) return false;
  return rng() < (challenge.surprise.chance ?? 0);
}

/**
 * Escolhe uma regra surpresa possível de cumprir com os produtos do desafio,
 * dando preferência às que ainda não estão cumpridas (aí é realmente um twist).
 */
export function pickSurpriseRule(challenge, products, look = {}, seed = Date.now()) {
  const rng = createRng(seed);
  const feasible = SURPRISE_POOL.filter((extra) => {
    const rules = [...(challenge.rules ?? []), extra];
    return findSolution(rules, products, look) !== null;
  });
  if (!feasible.length) return null;

  const fresh = feasible.filter((extra) => !checkRule(extra, look));
  const pool = fresh.length ? fresh : feasible;
  return shuffle(rng, pool)[0];
}

// ---------------------------------------------------------------- progressão
/**
 * Estado de um desafio para o jogador: 'available' | 'locked' | 'completed'.
 * Desafios concluídos continuam jogáveis (rejogar vale pontos).
 */
export function challengeStatus(challenge, player) {
  if (player.completedChallenges.includes(challenge.id)) return 'completed';
  const required = challenge.unlock?.completed ?? 0;
  return player.completedChallenges.length >= required ? 'available' : 'locked';
}

export const isPlayable = (challenge, player) => challengeStatus(challenge, player) !== 'locked';

/** Quantos desafios ainda faltam para destravar este. */
export function missingToUnlock(challenge, player) {
  return Math.max(0, (challenge.unlock?.completed ?? 0) - player.completedChallenges.length);
}

/** Próximo desafio sugerido no botão "Jogar". */
export function nextChallengeFor(player) {
  const pending = CHALLENGES.find((challenge) => challengeStatus(challenge, player) === 'available');
  if (pending) return pending;
  const playable = CHALLENGES.filter((challenge) => isPlayable(challenge, player));
  return playable[playable.length - 1] ?? CHALLENGES[0];
}

/** Lista de ids de produto padrão (sem recompensa) — atalho para a UI. */
export { DEFAULT_PRODUCT_IDS };
