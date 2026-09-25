# Rare Beauty: Rare Your Look — protótipo jogável

Advergame casual de criação de looks, feito a partir do GDD e da
[SPEC](docs/SPEC.md). Vite + JavaScript puro, avatar em Canvas, zero
dependências de runtime.

> *There's no one way to be Rare.*

## Como rodar

```bash
npm install
npm run dev
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (HMR) em http://localhost:5173 |
| `npm run build` | Build de produção em `dist/` (caminhos relativos, pronto para GitHub Pages/Netlify/Vercel) |
| `npm run preview` | Serve o build para conferência |
| `npm run check:data` | QA dos dados: prova que todo desafio tem solução, simula uma partida Rare Mode e checa todas as referências |

## O que já está jogável

Todas as 10 telas da SPEC, do início ao fim:

```
Início → Criar avatar → Desafios → Regras → Estúdio → Resultado → Recompensa → Coleção
                                                   ↘ Tutoriais · Perfil e ranking ↙
```

- **10 desafios** nas três dificuldades (Explore · Express · Rare Mode), com os
  cinco tipos do GDD: mood, color, limited, time e surprise.
- **26 produtos** em 8 encaixes (bronzer, sombra, delineador, máscara, blush,
  iluminador, batom, lip oil), aplicados ao vivo no Canvas.
- **Validação de regras em tempo real**, pontuação parcial e pontuação final com
  breakdown (SPEC §5.2 — até ~325 pts em Rare Mode).
- **Regra surpresa** que aparece no meio da partida, sempre sorteada entre as que
  ainda são possíveis de cumprir com os produtos daquele desafio.
- **22 itens de coleção + 7 distintivos + níveis**, com ranking semanal simulado.
- **4 personagens de tutorial** com técnicas passo a passo animadas no Canvas.
- **Compartilhar look**: gera um cartão PNG (Web Share API no celular, download no
  desktop).

## Estrutura

```
src/
├── core/        GameState (state machine) · EventBus · SceneManager · StorageManager
├── scenes/      uma classe por tela, carregada sob demanda (code splitting)
├── systems/     ChallengeSystem · ScoringSystem · RewardSystem · TimerSystem
│   ├── AvatarSystem.js      compositor das 12 camadas do SPEC §7
│   ├── avatar/              os "painters" de cada camada (corpo, cabelo, rosto, acessórios)
│   └── RankingSystem.js     ranking semanal simulado (sem backend)
├── data/        challenges · products · rewards · characters · avatarOptions
├── ui/          componentes (Button, Modal, Timer, ScoreBar, ProductCard…) e transições
├── audio/       AudioManager (Web Audio) + mapa de efeitos
├── styles/      tokens · reset · base · components · animations · scenes/
└── utils/       cor (ΔE em Lab), DOM, formatação, RNG determinístico
```

## Acessibilidade

- Canvas do avatar com `role="img"` e descrição gerada a partir das escolhas.
- Região `aria-live` anunciando produto aplicado, regra cumprida, surpresa e tempo.
- Atalhos por cena — **J** jogar, **D** desafios, **T** tutoriais, **C** coleção,
  **P** perfil, **H** dica, **Enter** confirmar, **Esc** voltar.
- Alvos de toque ≥ 44px, contraste AA, `prefers-reduced-motion` + toggle manual
  em Configurações.
- O cronômetro pausa quando a aba sai de foco ou quando um aviso abre.
- Botão de **dica** em todo desafio: sugere o próximo produto a partir de uma
  solução válida calculada na hora.

## Representação

Tom de pele, corpo, textura de cabelo, hijab, vitiligo, sardas, cicatrizes,
cadeira de rodas e prótese de braço estão **livres desde o primeiro minuto** —
nada que represente identidade entra no sistema de recompensas. Só itens
cosméticos extras (roupas, acessórios, cores divertidas, cenários) se desbloqueiam.

## Notas de produção

- Nomes de linhas e tons dos produtos são **placeholders** inspirados no portfólio
  da Rare Beauty — validar com os assets oficiais antes de qualquer uso público.
- Áudio e sprites são sintetizados/desenhados em código enquanto os assets reais
  não existem (veja [public/README.md](public/README.md)).
- Ranking semanal é simulado localmente; o protótipo não tem backend.
- Decisões técnicas e desvios da SPEC estão em [docs/DECISOES.md](docs/DECISOES.md).
