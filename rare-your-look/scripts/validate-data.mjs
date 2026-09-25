/**
 * QA dos dados do jogo — `npm run check:data`.
 *
 * Garante que todo desafio é vencível com os produtos que o jogador
 * realmente tem, que as regras surpresa possíveis existem e que todas as
 * referências (recompensas, presets, tutoriais) apontam para algo real.
 */
import { CHALLENGES, SURPRISE_POOL } from '../src/data/challenges.js';
import { PRODUCTS, getProduct, SLOTS } from '../src/data/products.js';
import { REWARDS, BADGES } from '../src/data/rewards.js';
import { CHARACTERS } from '../src/data/characters.js';
import {
  MAKEUP_PRESETS, HAIR_COLORS, TOP_COLORS, TOPS, SCENARIOS, ACCESSORY_GROUPS,
} from '../src/data/avatarOptions.js';
import {
  availableProductsFor, findSolution, checkRule, ruleLabel, pickSurpriseRule, challengeStatus, nextChallengeFor,
} from '../src/systems/ChallengeSystem.js';
import { scoreLook, maxScore } from '../src/systems/ScoringSystem.js';

const errors = [];
const warnings = [];
const log = (...args) => console.log(...args);

const lookText = (look) =>
  Object.entries(look).map(([slot, id]) => `${SLOTS[slot].label}: ${getProduct(id).shade}`).join(' · ') || '(vazio)';

log('\n🧪 Rare Your Look — validação de dados\n');

/* ------------------------------------------------ 1. desafios vencíveis */
for (const challenge of CHALLENGES) {
  const products = availableProductsFor(challenge, []); // jogadora sem recompensas
  if (!products.length) {
    errors.push(`${challenge.id}: nenhum produto disponível`);
    continue;
  }

  const solution = findSolution(challenge.rules, products);
  if (!solution) {
    errors.push(`${challenge.id} (${challenge.name}): não existe look que cumpra todas as regras com ${products.length} produtos`);
    continue;
  }

  const result = scoreLook({
    challenge,
    look: solution,
    surpriseRule: null,
    timeLeft: challenge.timeLimit,
    timedOut: false,
  });

  log(`✅ ${challenge.id} · ${challenge.name} (${products.length} produtos)`);
  log(`   solução: ${lookText(solution)}`);
  log(`   pontos: ${result.total} de ${maxScore(challenge)} (com bônus de tempo cheio, sem surpresa)`);

  // regra principal sozinha também precisa ser alcançável
  if (!findSolution([challenge.rules[0]], products)) {
    errors.push(`${challenge.id}: a regra principal isolada é impossível`);
  }

  // surpresa: pelo menos uma regra do pool precisa caber
  if (challenge.surprise) {
    const feasible = SURPRISE_POOL.filter((extra) => findSolution([...challenge.rules, extra], products));
    if (!feasible.length) {
      errors.push(`${challenge.id}: nenhuma regra surpresa é possível`);
    } else {
      log(`   surpresas possíveis: ${feasible.map((rule) => rule.id).join(', ')}`);
    }
  }

  // produtos listados devem existir e estar liberados desde o início
  if (Array.isArray(challenge.availableProducts)) {
    for (const id of challenge.availableProducts) {
      const product = getProduct(id);
      if (!product) errors.push(`${challenge.id}: produto inexistente "${id}"`);
      else if (product.unlockId) warnings.push(`${challenge.id}: "${id}" depende da recompensa ${product.unlockId}`);
    }
  }
}

/* ---------------------------------------------- 2. regras sempre legíveis */
for (const challenge of CHALLENGES) {
  for (const rule of [...challenge.rules, ...SURPRISE_POOL]) {
    if (!ruleLabel(rule) || ruleLabel(rule) === 'Regra do desafio') {
      errors.push(`${challenge.id}: regra sem texto claro (${rule.type})`);
    }
    if (checkRule(rule, {}) && rule.type !== 'max_products' && rule.type !== 'forbidden_slot' && rule.type !== 'forbidden_category') {
      warnings.push(`${challenge.id}: regra "${ruleLabel(rule)}" já nasce cumprida com o rosto limpo`);
    }
  }
}

/* -------------------------------------------------- 3. referências gerais */
const optionIds = new Map([
  ['hairColor', HAIR_COLORS.map((o) => o.id)],
  ['topColor', TOP_COLORS.map((o) => o.id)],
  ['top', TOPS.map((o) => o.id)],
  ['scenario', SCENARIOS.map((o) => o.id)],
  ...ACCESSORY_GROUPS.map((group) => [group.id, group.options.map((o) => o.id)]),
]);

for (const reward of REWARDS) {
  if (reward.ref.includes(':')) {
    const [group, value] = reward.ref.split(':');
    const ids = optionIds.get(group);
    if (!ids) errors.push(`${reward.id}: grupo de opção desconhecido "${group}"`);
    else if (!ids.includes(value)) errors.push(`${reward.id}: opção inexistente "${reward.ref}"`);
  } else if (!getProduct(reward.ref)) {
    errors.push(`${reward.id}: produto inexistente "${reward.ref}"`);
  }
  if (reward.unlock?.challenge && !CHALLENGES.some((c) => c.id === reward.unlock.challenge)) {
    errors.push(`${reward.id}: desafio inexistente em unlock`);
  }
}

// toda recompensa citada por um produto/opção precisa existir
const rewardIds = new Set(REWARDS.map((reward) => reward.id));
for (const product of PRODUCTS) {
  if (product.unlockId && !rewardIds.has(product.unlockId)) {
    errors.push(`produto ${product.id}: recompensa inexistente ${product.unlockId}`);
  }
}
for (const [group, ids] of optionIds) {
  void ids;
  void group;
}
for (const list of [HAIR_COLORS, TOP_COLORS, TOPS, SCENARIOS, ...ACCESSORY_GROUPS.map((g) => g.options)]) {
  for (const option of list) {
    if (option.unlockId && !rewardIds.has(option.unlockId)) {
      errors.push(`opção ${option.id}: recompensa inexistente ${option.unlockId}`);
    }
  }
}

for (const challenge of CHALLENGES) {
  if (challenge.rewardId && !rewardIds.has(challenge.rewardId)) {
    errors.push(`${challenge.id}: recompensa inexistente ${challenge.rewardId}`);
  }
}

const legend = BADGES.find((badge) => badge.id === 'rare_legend');
if (legend && legend.goal !== CHALLENGES.length) {
  errors.push(`badge rare_legend: goal ${legend.goal} ≠ ${CHALLENGES.length} desafios`);
}

/* --------------------------------------- 4. presets e tutoriais coerentes */
for (const preset of MAKEUP_PRESETS) {
  for (const [slot, id] of Object.entries(preset.look)) {
    const product = getProduct(id);
    if (!product) errors.push(`preset ${preset.id}: produto inexistente ${id}`);
    else if (product.slot !== slot) errors.push(`preset ${preset.id}: ${id} não pertence ao slot ${slot}`);
    else if (product.unlockId) errors.push(`preset ${preset.id}: ${id} está bloqueado no início`);
  }
}

for (const character of CHARACTERS) {
  for (const id of character.tutorial.products) {
    if (!getProduct(id)) errors.push(`tutorial ${character.id}: produto inexistente ${id}`);
  }
  for (const [index, step] of character.tutorial.steps.entries()) {
    for (const [slot, id] of Object.entries(step.look)) {
      const product = getProduct(id);
      if (!product) errors.push(`tutorial ${character.id} passo ${index + 1}: produto inexistente ${id}`);
      else if (product.slot !== slot) errors.push(`tutorial ${character.id} passo ${index + 1}: slot errado para ${id}`);
    }
  }
}

/* -------------------------------- 5. simulação de partidas (Rare Mode) */
const rareMode = CHALLENGES.find((challenge) => challenge.difficulty === 3 && challenge.surprise?.chance === 1);
if (rareMode) {
  const products = availableProductsFor(rareMode, []);
  const surprise = pickSurpriseRule(rareMode, products, {}, 42);
  if (!surprise) {
    errors.push(`${rareMode.id}: pickSurpriseRule não devolveu regra`);
  } else {
    const solution = findSolution([...rareMode.rules, surprise], products);
    if (!solution) {
      errors.push(`${rareMode.id}: a surpresa sorteada (${surprise.id}) deixa o desafio sem solução`);
    } else {
      const perfect = scoreLook({ challenge: rareMode, look: solution, surpriseRule: surprise, timeLeft: rareMode.timeLimit, timedOut: false });
      const expected = maxScore(rareMode); // já inclui o bônus de surpresa
      log(`\n🎬 Simulação Rare Mode — ${rareMode.name}`);
      log(`   surpresa: ${surprise.label}`);
      log(`   look: ${lookText(solution)}`);
      log(`   pontos com tudo cumprido: ${perfect.total} de ${expected}`);
      if (perfect.total !== expected) {
        errors.push(`${rareMode.id}: pontuação perfeita ${perfect.total} ≠ ${expected}`);
      }

      // tempo esgotado: sem bônus de tempo, mas o desafio ainda conclui
      const timedOut = scoreLook({ challenge: rareMode, look: solution, surpriseRule: surprise, timeLeft: 0, timedOut: true });
      log(`   pontos com o tempo esgotado: ${timedOut.total}`);
      if (!timedOut.passed) errors.push(`${rareMode.id}: tempo esgotado não deveria invalidar a regra principal`);
      if (timedOut.total !== expected - 50) {
        errors.push(`${rareMode.id}: esperado ${expected - 50} sem bônus de tempo, veio ${timedOut.total}`);
      }

      // look vazio: regra principal não cumprida → zero ponto
      const empty = scoreLook({ challenge: rareMode, look: {}, surpriseRule: surprise, timeLeft: 10, timedOut: false });
      if (empty.passed || empty.total !== 0) errors.push(`${rareMode.id}: look vazio deveria valer 0`);
    }
  }
}

/* --------------------------------------------- 6. progressão destravável */
const fakePlayer = { completedChallenges: [], unlockedItems: [], badges: [], stats: {} };
const order = [];
for (let i = 0; i < CHALLENGES.length + 2; i++) {
  const next = nextChallengeFor(fakePlayer);
  if (!next) break;
  if (challengeStatus(next, fakePlayer) === 'locked') {
    errors.push(`progressão travada em ${next.id} com ${fakePlayer.completedChallenges.length} concluídos`);
    break;
  }
  if (fakePlayer.completedChallenges.includes(next.id)) break;
  fakePlayer.completedChallenges.push(next.id);
  order.push(next.id);
}
if (order.length !== CHALLENGES.length) {
  errors.push(`progressão: só ${order.length} de ${CHALLENGES.length} desafios são alcançáveis em sequência`);
} else {
  log(`\n🔓 Progressão: os ${CHALLENGES.length} desafios abrem em sequência jogando sempre o sugerido.`);
}

/* ------------------------------------------------------------- relatório */
log('');
if (warnings.length) {
  log('⚠️  Avisos:');
  warnings.forEach((warning) => log(`   - ${warning}`));
  log('');
}
if (errors.length) {
  log('❌ Erros:');
  errors.forEach((error) => log(`   - ${error}`));
  log(`\n${errors.length} problema(s) encontrado(s).\n`);
  process.exit(1);
}
log(`✨ Tudo certo: ${CHALLENGES.length} desafios, ${PRODUCTS.length} produtos, ${REWARDS.length} recompensas, ${BADGES.length} distintivos.\n`);
