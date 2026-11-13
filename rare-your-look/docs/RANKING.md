# Ranking online

O jogo pede o nome ao clicar em **JOGAR** e, ao terminar, envia o resultado
para o ranking. Há quatro classificações: **menor tempo total**, **mais pontos**,
**mais paletas de cores** e **maior exploração**. Cada jogador guarda só o seu
melhor resultado em cada uma.

## Como funciona

```
navegador (jogo)  ──►  /api/ranking  (função da Vercel)  ──►  Upstash Redis
```

- `api/ranking.js` (na raiz do repositório) é a única peça que fala com o banco.
  A chave do banco fica nas variáveis de ambiente da Vercel, nunca no navegador.
- `src/game/systems/RankingSystem.ts` tenta o ranking online. Se a função não
  existir (`npm run dev`) ou o banco não estiver conectado, usa um **ranking
  local**, salvo no navegador. A tela de Ranking mostra qual dos dois está ativo.

## Ligar o banco (uma vez, uns 2 minutos)

1. Entre em <https://vercel.com>, abra o projeto do jogo.
2. Aba **Storage** → **Create Database** → escolha **Upstash for Redis**
   (plano gratuito) → **Continue**.
3. Dê um nome (ex.: `rare-ranking`), escolha a região mais próxima
   (ex.: São Paulo) e **Create**.
4. Na tela seguinte, conecte o banco ao projeto do jogo (todos os ambientes)
   e confirme. A Vercel cria sozinha as variáveis `KV_REST_API_URL` e
   `KV_REST_API_TOKEN`.
5. Aba **Deployments** → no último deploy, **⋯ → Redeploy** (as variáveis só
   valem para deploys novos).

Pronto: abra o jogo, vá em **RANKING**. A linha de cima deve dizer
"Ranking online".

## Regras e proteções

- Nome: 2 a 16 caracteres (letras, números, espaço, `.`, `-`, `_`).
- Tempo total mínimo de 45 s para valer; valores fora do plausível são recusados.
- No máximo 8 envios por minuto por IP.
- É um jogo de navegador: alguém com conhecimento técnico ainda consegue
  forjar um resultado. Para zerar o ranking, apague as chaves que começam com
  `rare:` no painel do Upstash (Data Browser).

## Testar a função localmente (opcional)

Com o [Vercel CLI](https://vercel.com/docs/cli) logado e o projeto ligado
(`vercel link`), `vercel env pull` traz as chaves e `vercel dev` roda o jogo
com a função `/api/ranking` de verdade.
