/**
 * Ranking online do Rare Your Look — função serverless da Vercel.
 *
 *   GET  /api/ranking[?player=<id>]  → top 10 de cada classificação (+ posição do jogador)
 *   POST /api/ranking                → registra o resultado de uma partida
 *
 * Banco: Upstash Redis, acessado pela API REST (sem dependências extras).
 * As chaves chegam sozinhas quando o banco é conectado ao projeto na Vercel
 * (Storage → Upstash for Redis). Sem elas, a função responde 503 e o jogo
 * usa o ranking local do navegador.
 *
 * Cada jogador guarda só o MELHOR resultado em cada classificação
 * (ZADD com LT/GT), então o ranking não enche de partidas repetidas.
 */

const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const PREFIX = 'rare:';
const TOP = 10;

/** Classificações: campo do resultado, ordem e limites aceitos. */
const BOARDS = {
  time: { field: 'timeSec', lowerIsBetter: true, min: 45, max: 6 * 3600 },
  score: { field: 'score', lowerIsBetter: false, min: 0, max: 200000 },
  palettes: { field: 'palettes', lowerIsBetter: false, min: 0, max: 500 },
  exploration: { field: 'exploration', lowerIsBetter: false, min: 0, max: 100 },
};

/** Máximo de envios por IP por minuto. */
const RATE_LIMIT = 8;

async function redis(commands) {
  const res = await fetch(`${URL}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  const out = await res.json();
  return out.map((r) => {
    if (r.error) throw new Error(r.error);
    return r.result;
  });
}

/** Nome visível: 2–16 letras, números, espaço, ponto, hífen ou sublinhado. */
export function cleanName(raw) {
  const name = String(raw ?? '')
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 16);
  return /^[\p{L}\p{N} ._-]{2,16}$/u.test(name) ? name : null;
}

const cleanId = (raw) => (/^[a-z0-9-]{8,64}$/i.test(String(raw ?? '')) ? String(raw) : null);

function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try {
    return JSON.parse(req.body || '{}');
  } catch {
    return {};
  }
}

/** Valida o resultado enviado pelo jogo; devolve null se algo estiver fora do plausível. */
export function cleanResult(body) {
  const playerId = cleanId(body.playerId);
  const name = cleanName(body.name);
  if (!playerId || !name) return null;
  const result = { playerId, name };
  for (const board of Object.values(BOARDS)) {
    const value = Number(body[board.field]);
    if (!Number.isFinite(value) || value < board.min || value > board.max) return null;
    result[board.field] = Math.round(value);
  }
  return result;
}

async function topBoards(playerId) {
  const names = Object.keys(BOARDS);
  const commands = names.map((id) => [
    'ZRANGE',
    `${PREFIX}board:${id}`,
    '0',
    String(TOP - 1),
    ...(BOARDS[id].lowerIsBetter ? [] : ['REV']),
    'WITHSCORES',
  ]);
  if (playerId) {
    for (const id of names) {
      commands.push([BOARDS[id].lowerIsBetter ? 'ZRANK' : 'ZREVRANK', `${PREFIX}board:${id}`, playerId]);
    }
  }
  const results = await redis(commands);

  // nomes de todos os jogadores que aparecem nos tops
  const ids = new Set();
  names.forEach((_, i) => {
    const flat = results[i] ?? [];
    for (let j = 0; j < flat.length; j += 2) ids.add(flat[j]);
  });
  const idList = [...ids];
  const nameList = idList.length ? (await redis([['HMGET', `${PREFIX}names`, ...idList]]))[0] : [];
  const nameOf = Object.fromEntries(idList.map((id, i) => [id, nameList[i] ?? '???']));

  const boards = {};
  const me = {};
  names.forEach((id, i) => {
    const flat = results[i] ?? [];
    boards[id] = [];
    for (let j = 0; j < flat.length; j += 2) {
      boards[id].push({ name: nameOf[flat[j]], value: Number(flat[j + 1]), me: flat[j] === playerId });
    }
    if (playerId) {
      const rank = results[names.length + i];
      me[id] = rank === null || rank === undefined ? null : Number(rank) + 1;
    }
  });
  return { boards, me };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!URL || !TOKEN) return res.status(503).json({ error: 'not_configured' });

  try {
    if (req.method === 'GET') {
      const playerId = cleanId(req.query?.player);
      return res.status(200).json(await topBoards(playerId));
    }

    if (req.method === 'POST') {
      const result = cleanResult(readBody(req));
      if (!result) return res.status(400).json({ error: 'invalid' });

      const ip = String(req.headers['x-forwarded-for'] ?? 'local').split(',')[0].trim();
      const rateKey = `${PREFIX}rate:${ip}`;
      const [count] = await redis([['INCR', rateKey], ['EXPIRE', rateKey, '60', 'NX']]);
      if (Number(count) > RATE_LIMIT) return res.status(429).json({ error: 'rate_limited' });

      const commands = [['HSET', `${PREFIX}names`, result.playerId, result.name]];
      for (const [id, board] of Object.entries(BOARDS)) {
        // guarda só o melhor resultado do jogador em cada classificação
        commands.push(['ZADD', `${PREFIX}board:${id}`, board.lowerIsBetter ? 'LT' : 'GT', String(result[board.field]), result.playerId]);
      }
      await redis(commands);
      return res.status(200).json(await topBoards(result.playerId));
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  } catch (error) {
    console.error('[ranking]', error);
    return res.status(502).json({ error: 'database_error' });
  }
}
