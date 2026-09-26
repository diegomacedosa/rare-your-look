# Rare Beauty: Rare Your Look — Platform Edition

Advergame 2D de plataforma + maquiagem, feito a partir da [SPEC v2](docs/SPEC.md).
A Maya atravessa três fases para recuperar os produtos do seu look e depois
monta a maquiagem no **Rare Studio**.

> *There's no one way to be Rare.*

**Stack:** Phaser 3 · TypeScript estrito · Vite. Sem backend, sem login, progresso
em localStorage. Toda a arte e todo o áudio são gerados por código (placeholders
substituíveis).

## Como rodar

```bash
npm install
npm run dev
```

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento em http://localhost:5173 |
| `npm run build` | Checa os tipos e gera o build de produção em `dist/` (caminhos relativos) |
| `npm run preview` | Serve o build para conferência |
| `npm run typecheck` | Só a checagem de tipos |

## Como jogar

| Ação | Teclado | Toque (celular deitado) |
|---|---|---|
| Andar | ← → ou A D | ◀ ▶ |
| Pular (segure para pular mais alto) | Espaço, ↑ ou W | ▲ |
| Ler uma placa *Rare Tip* | E | botão E (aparece perto da placa) |
| Pausar / Rare Bag | ESC ou P | botão II |
| Tela inicial | — | botão ⌂ |

- **Paletas de cores** dão pontos. **Rare Boxes** (bata por baixo) guardam os
  **produtos do look**. O espelho no fim da fase só abre com todos os produtos.
- 3 corações. Sem corações, a Maya volta ao último espelho aceso — **nada do que
  foi coletado se perde**.
- Cada fase tem itens secretos que liberam tons extras no Rare Studio.

## Fluxo completo

```
Menu → Cutscene de abertura → Fase 1 → Resultado → Transição → Fase 2 → Resultado
     → Transição → Fase 3 → Resultado → Cutscene final → Rare Studio → Reveal → Coleção
```

| Fase | Tema | Produtos | Novidades |
|---|---|---|---|
| 1 · Find Your Color | cores, pêssego e rosé | Blush, Batom, Lip Oil | tutorial, Rare Boxes, frascos, gotas |
| 2 · Build Your Look | lilás, entardecer | Sombra, Delineador, Iluminador | plataformas móveis e frágeis, pincéis, caixas escondidas, rotas alternativas |
| 3 · Be Rare | noite berry | Bronzer, Máscara | tudo combinado, saltos maiores, 3 segredos |

## Estrutura

```
src/
├── main.ts                 cria o jogo
├── styles/game.css         shell HTML + aviso de orientação
├── data/                   tudo que é "conteúdo" (trocável sem mexer em mecânica)
│   ├── products.ts         produtos no formato da SPEC §16 + itens secretos
│   ├── catalog.js          tons de cada produto (herdado da v1)
│   ├── levels.ts           nome, tema, trilha e contagens das fases
│   ├── dialogue.ts         textos, dicas Rare Tip, mensagens
│   ├── assets.ts           arte final opcional (substitui placeholders pela chave)
│   └── avatarOptions.js    opções do compositor de avatar (v1)
├── shared/                 cor e RNG (v1)
└── game/
    ├── config.ts           Phaser 1280×720, Arcade Physics
    ├── theme.ts            paleta, fontes, temas das fases
    ├── scenes/             Boot · Preload · Menu · Intro · Level1-3 · HUD · Pause ·
    │                       GameOver · LevelComplete · Transition · Outro ·
    │                       DressingRoom (Rare Studio) · Reveal · Collection
    ├── entities/           Player · RareBox · Product · Obstacle · Checkpoint · Platforms
    ├── systems/            Progress · Inventory · Score · Audio (+ sounds) · Controls · hudBus
    ├── levels/             level1-3 desenhadas à mão + construtor
    ├── art/                Maya e demais texturas geradas em Canvas
    ├── avatar/             compositor de avatar em camadas (v1) + ponte para o Phaser
    └── ui/                 botões, painéis, balões, transições
legacy/                     v1 (jogo de looks por desafios), fora do bundle
docs/                       SPEC v2 · feedback da professora · decisões técnicas
```

## Documentos

- [docs/SPEC.md](docs/SPEC.md) — escopo da v2.
- [docs/FEEDBACK-PROFESSORA.md](docs/FEEDBACK-PROFESSORA.md) — cada item do
  feedback parcial e onde foi resolvido.
- [docs/DECISOES.md](docs/DECISOES.md) — reaproveitamento da v1, arquitetura,
  física, áudio.

## Notas de produção

- Nomes das linhas e tons dos produtos e o texto das Rare Tips são
  **placeholders** inspirados no portfólio da Rare Beauty — validar com a
  comunicação oficial antes de qualquer uso público.
- A Maya é uma personagem fictícia; não representa nenhuma pessoa real.
- Arte e áudio finais entram sem mexer na lógica: veja
  [public/README.md](public/README.md).
