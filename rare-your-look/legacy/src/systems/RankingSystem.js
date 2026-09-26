/**
 * RankingSystem — ranking semanal simulado (GDD §2.10).
 *
 * O protótipo não tem backend: as jogadoras "rivais" são geradas de forma
 * determinística a partir do número da semana, então a tabela é estável
 * durante a semana e muda na virada — o mesmo comportamento que um
 * ranking real teria, sem inventar dados de pessoas reais.
 */
import { createRng, weekSeed } from '../utils/random.js';
import storage from '../core/StorageManager.js';

const RIVALS = [
  'Maya', 'Alice', 'Nina', 'Juh', 'Val', 'Sol', 'Bel', 'Duda',
  'Tami', 'Rai', 'Lena', 'Cacá', 'Mari', 'Pri', 'Kim',
];

/**
 * @returns {{ position:number, rows:Array<{name:string,score:number,isPlayer:boolean,position:number}> }}
 */
export function weeklyRanking(player = storage.player) {
  const seed = weekSeed();
  const rng = createRng(seed);
  // Progresso da semana: segunda começa baixo, domingo já está cheio.
  const dayIndex = (new Date().getDay() + 6) % 7;
  const weekProgress = (dayIndex + 1) / 7;

  // Faixa ampla de perfis: de quem jogou uma partida a quem jogou a semana toda.
  // Assim a jogadora nova não cai automaticamente em último lugar.
  const rows = RIVALS.map((name) => {
    const ceiling = 150 + Math.floor(rng() * 950);
    const score = Math.round(ceiling * weekProgress * (0.55 + rng() * 0.45));
    return { name, score, isPlayer: false };
  });

  rows.push({ name: player.nickname || 'Você', score: player.weeklyScore ?? 0, isPlayer: true });
  rows.sort((a, b) => b.score - a.score || (a.isPlayer ? 1 : -1));
  rows.forEach((row, index) => {
    row.position = index + 1;
  });

  return { position: rows.find((row) => row.isPlayer).position, rows, total: rows.length };
}

/** Recorte do ranking em volta da jogadora (ResultScene). */
export function rankingNeighborhood(player = storage.player, radius = 1) {
  const { rows, position, total } = weeklyRanking(player);
  const start = Math.max(0, position - 1 - radius);
  const end = Math.min(rows.length, position + radius);
  return { position, total, rows: rows.slice(start, end) };
}
