/**
 * ScoreSystem — pontuação por gameplay, nunca por aparência (SPEC §27).
 * O Rare Studio não dá nem tira pontos: o look é expressão, não avaliação.
 */

export const POINTS = {
  requiredProduct: 100,
  secretItem: 150,
  rareBox: 25,
  palette: 10,
  levelComplete: 500,
  /** Bônus por coletar todas as paletas de uma fase. */
  allPalettes: 200,
  /** Pontos por segundo abaixo do tempo de referência da fase. */
  timePerSecond: 3,
  timeBonusCap: 450,
} as const;

export interface LevelBonus {
  time: number;
  exploration: number;
  completion: number;
}

export function levelBonus(elapsed: number, targetTime: number, allPalettes: boolean): LevelBonus {
  const time = Math.min(POINTS.timeBonusCap, Math.max(0, Math.round((targetTime - elapsed) * POINTS.timePerSecond)));
  return { time, exploration: allPalettes ? POINTS.allPalettes : 0, completion: POINTS.levelComplete };
}

export function formatTime(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
