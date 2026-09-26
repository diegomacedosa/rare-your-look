/**
 * ScoringSystem — cálculo de pontuação (SPEC §5.2).
 *
 *   Regra principal cumprida ................. 100 pts (challenge.pointsBase)
 *   Cada regra extra cumprida ................. +50 pts
 *   Concluído dentro do tempo ................. +25 pts
 *   Concluído com 50%+ do tempo restante ...... +25 pts
 *   Regra surpresa cumprida ................... +75 pts
 *   Máximo em Rare Mode ....................... ~325 pts
 *
 * Sem a regra principal o look não conclui o desafio e não pontua —
 * a StudioScene avisa antes de confirmar, então nunca é surpresa ruim.
 */
import { evaluate } from './ChallengeSystem.js';

export const EXTRA_RULE_POINTS = 50;

export function scoreLook({ challenge, look = {}, surpriseRule = null, timeLeft = null, timedOut = false }) {
  const evaluation = evaluate(challenge, look, surpriseRule);
  const base = challenge?.pointsBase ?? 100;
  const hasTime = Boolean(challenge?.timeLimit);
  const withinTime = hasTime ? !timedOut : true;
  const passed = evaluation.mainMet;

  const breakdown = [];
  let total = 0;

  const add = (label, points, met, detail) => {
    const awarded = met && passed ? points : 0;
    breakdown.push({ label, detail, points: awarded, met });
    total += awarded;
  };

  if (evaluation.rules.length) {
    add(evaluation.rules[0].label, base, evaluation.mainMet, 'Regra principal');
  }
  for (const entry of evaluation.rules.slice(1)) {
    add(entry.label, EXTRA_RULE_POINTS, entry.met, 'Regra extra');
  }

  for (const bonus of challenge?.bonusConditions ?? []) {
    switch (bonus.condition) {
      case 'within_time':
        if (hasTime) add('Concluído dentro do tempo', bonus.bonus, withinTime, 'Bônus');
        break;
      case 'time_remaining_50pct':
        if (hasTime) {
          const halfLeft = withinTime && (timeLeft ?? 0) >= challenge.timeLimit / 2;
          add('Sobrou metade do tempo', bonus.bonus, halfLeft, 'Bônus');
        }
        break;
      case 'surprise_met':
        if (surpriseRule) add('Regra surpresa cumprida', bonus.bonus, Boolean(evaluation.surprise?.met), 'Bônus');
        break;
      default:
        break;
    }
  }

  return {
    challengeId: challenge?.id ?? null,
    total,
    passed,
    withinTime,
    timedOut,
    timeLeft,
    breakdown,
    evaluation,
    look: { ...look },
    surpriseRule,
    surpriseMet: Boolean(evaluation.surprise?.met),
  };
}

/** Pontuação máxima possível — mostrada na tela de regras e no resultado. */
export function maxScore(challenge) {
  if (!challenge) return 0;
  const base = challenge.pointsBase ?? 100;
  const extras = Math.max(0, (challenge.rules?.length ?? 1) - 1) * EXTRA_RULE_POINTS;
  const bonuses = (challenge.bonusConditions ?? []).reduce((sum, bonus) => {
    if (bonus.condition === 'surprise_met' && !challenge.surprise) return sum;
    if ((bonus.condition === 'within_time' || bonus.condition === 'time_remaining_50pct') && !challenge.timeLimit) return sum;
    return sum + bonus.bonus;
  }, 0);
  return base + extras + bonuses;
}

/** Mensagem do resultado, de acordo com o desempenho. */
export function resultMessage(result, challenge) {
  if (!result.passed) {
    return {
      title: 'Quase lá!',
      text: 'A regra principal ficou faltando. Bora tentar de novo — o estúdio é seu.',
    };
  }
  const ratio = result.total / Math.max(1, maxScore(challenge));
  if (ratio >= 0.95) return { title: 'Perfeito!', text: 'Todas as regras cumpridas e bônus no bolso. Isso é Rare.' };
  if (ratio >= 0.7) return { title: 'Muito bom!', text: 'Look aprovado com folga. Dá pra arrancar ainda mais pontos.' };
  return { title: 'Look confirmado!', text: 'Desafio cumprido. Tente de novo mirando os bônus.' };
}
