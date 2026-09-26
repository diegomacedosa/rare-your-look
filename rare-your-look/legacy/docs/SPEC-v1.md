# SPEC.md — Rare Beauty: Rare Your Look
**Advergame — Game Design Document v1.0**
**Status:** Planejamento / Pré-produção
**Data:** Setembro 2026

---

## 1. Visão Geral do Produto

| Campo | Detalhe |
|---|---|
| **Nome do jogo** | Rare Beauty: Rare Your Look |
| **Slogan** | *There's no one way to be Rare.* |
| **Tipo** | Casual advergame de personalização e criação de looks |
| **Plataforma** | Web (browser-first) — desktop e mobile responsivo |
| **Runtime alvo** | Navegadores modernos (Chrome, Safari, Firefox, Edge) sem instalação |
| **Tecnologia** | HTML5 + CSS3 + JavaScript (SPA — Single Page Application) |
| **Objetivo de negócio** | Aumentar engajamento com a Rare Beauty via ponto de contato digital gamificado |
| **Objetivo de comunicação** | Reforçar individualidade, autoaceitação, autenticidade e inclusão por experiência participativa |

---

## 2. Stack Tecnológica Recomendada

### 2.1 Decisão de Stack

O projeto é um **advergame web leve**, sem backend proprietário, que precisa:
- Rodar em qualquer dispositivo sem instalação
- Ser de fácil prototipação e iteração rápida
- Ter visual fiel à identidade Rare Beauty
- Suportar animações e interatividade fluidas
- Ser entregável como arquivo único ou hospedado em CDN simples

**Stack escolhida: Vanilla JS + Vite + Canvas API / CSS Animations**

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Build tool** | [Vite](https://vitejs.dev/) | HMR instantâneo, build otimizado, zero config |
| **Linguagem** | JavaScript (ES2022+) | Sem overhead de compilação; acesso direto ao DOM e Canvas |
| **Estilização** | CSS Custom Properties + CSS Animations | Controle total, performance nativa, zero dependência |
| **Renderização de avatares** | HTML5 Canvas API | Layering de sprites, exportação de imagem, performance |
| **Animações de UI** | Web Animations API + CSS transitions | Smooth, performático, sem biblioteca pesada |
| **Estado do jogo** | Padrão State Machine customizado (JS puro) | Previsível, sem dependência de framework |
| **Persistência local** | localStorage | Progresso, pontuação, coleção do jogador |
| **Áudio** | Web Audio API | Efeitos sonoros e trilha; controle granular |
| **Assets (sprites)** | SVG + PNG spritesheet | Escalável, leve, qualidade em todos os DPIs |
| **Hospedagem** | GitHub Pages / Netlify / Vercel (estático) | Gratuito, CDN global, deploy simples |

> **Por que não React/Vue/Angular?**
> Para um advergame com escopo definido, frameworks SPA adicionam complexidade e bundle desnecessários. Vite + Vanilla JS entrega performance superior, bundle menor e prototipação mais rápida para jogos com lógica de estado previsível.

> **Por que não Phaser.js ou PixiJS?**
> O jogo não tem física, colisões ou tilemap. A mecânica principal é seleção e composição visual — resolvível com Canvas + DOM. Game engines pesadas adicionariam ~500KB desnecessários.

---

## 3. Arquitetura de Pastas

```
rare-your-look/
├── index.html                  # Entry point
├── vite.config.js
├── package.json
│
├── src/
│   ├── main.js                 # Inicialização do jogo + roteamento de telas
│   │
│   ├── core/
│   │   ├── GameState.js        # State machine central
│   │   ├── EventBus.js         # Pub/sub para comunicação entre módulos
│   │   ├── SceneManager.js     # Gerencia troca de telas/cenas
│   │   └── StorageManager.js   # Abstração sobre localStorage
│   │
│   ├── scenes/
│   │   ├── WelcomeScene.js     # Tela inicial
│   │   ├── AvatarScene.js      # Criação/edição do avatar
│   │   ├── ChallengeSelectScene.js  # Seleção de desafio
│   │   ├── ChallengeInfoScene.js    # Regras do desafio
│   │   ├── StudioScene.js      # Montagem do look (core gameplay)
│   │   ├── ResultScene.js      # Resultado e pontuação
│   │   ├── RewardScene.js      # Desbloqueio de recompensa
│   │   ├── CollectionScene.js  # Coleção do jogador
│   │   ├── TutorialScene.js    # Tutoriais dos personagens
│   │   └── ProfileScene.js     # Perfil e ranking
│   │
│   ├── systems/
│   │   ├── ChallengeSystem.js  # Lógica e validação de desafios
│   │   ├── ScoringSystem.js    # Cálculo de pontuação
│   │   ├── RewardSystem.js     # Desbloqueio e gerência de recompensas
│   │   ├── TimerSystem.js      # Controle de tempo nos desafios
│   │   └── AvatarSystem.js     # Renderização em Canvas do avatar
│   │
│   ├── data/
│   │   ├── challenges.js       # Definições de todos os desafios
│   │   ├── products.js         # Catálogo de produtos/itens
│   │   ├── characters.js       # Dados dos personagens de tutorial
│   │   ├── rewards.js          # Definição de recompensas e distintivos
│   │   └── avatarOptions.js    # Opções de customização do avatar
│   │
│   ├── ui/
│   │   ├── components/
│   │   │   ├── Button.js
│   │   │   ├── Timer.js
│   │   │   ├── ScoreBar.js
│   │   │   ├── ProductCard.js
│   │   │   ├── BadgeCard.js
│   │   │   └── Modal.js
│   │   └── transitions.js      # Transições entre cenas
│   │
│   ├── audio/
│   │   ├── AudioManager.js     # Gerencia trilha + efeitos
│   │   └── sounds.js           # Mapa de arquivos de áudio
│   │
│   └── styles/
│       ├── tokens.css          # Design tokens (cores, tipografia, espaçamento)
│       ├── reset.css
│       ├── base.css
│       ├── animations.css      # Keyframes globais
│       └── scenes/             # CSS por cena
│
├── public/
│   ├── assets/
│   │   ├── sprites/
│   │   │   ├── avatar/         # Layers do avatar (pele, cabelo, roupas etc.)
│   │   │   ├── products/       # Ícones dos produtos Rare Beauty
│   │   │   ├── badges/         # Distintivos de conquista
│   │   │   └── characters/     # Personagens de tutorial
│   │   ├── backgrounds/        # Fundos das cenas
│   │   └── ui/                 # Ícones e elementos de interface
│   │
│   └── audio/
│       ├── bgm/                # Trilha instrumental
│       └── sfx/                # Efeitos sonoros
│
└── docs/
    ├── GDD.pdf                 # Game Design Document original
    └── SPEC.md                 # Este arquivo
```

---

## 4. Telas e Fluxo do Jogo

### 4.1 Fluxo Principal

```
[WelcomeScene]
      │
      ├─► [AvatarScene] ─────────────────────────────────────────► (avatar salvo)
      │
      ├─► [ChallengeSelectScene] → [ChallengeInfoScene] → [StudioScene]
      │                                                         │
      │                                                    [ResultScene]
      │                                                         │
      │                                                   [RewardScene] ─► (item desbloqueado)
      │
      ├─► [CollectionScene]
      ├─► [TutorialScene]
      └─► [ProfileScene / Ranking]
```

### 4.2 Telas — Especificação por Cena

#### CENA 1 — WelcomeScene
- Logo Rare Beauty: Rare Your Look
- Preview do avatar do jogador (ou avatar padrão se novo)
- Botões: Jogar · Desafios · Tutoriais · Meu Perfil · Coleção · Ranking
- Animação de entrada suave (fade-in do logo)

#### CENA 2 — AvatarScene
- Canvas central com avatar renderizado em camadas
- Painéis laterais de customização: tom de pele · cabelo · penteado · maquiagem · roupas · acessórios
- Opções inclusivas obrigatórias (deficiência visual representada, cadeira de rodas, próteses etc.)
- Botão: Salvar e Continuar

#### CENA 3 — ChallengeSelectScene
- Grid de cards de desafios disponíveis
- Badge de dificuldade (Explore / Express / Rare Mode)
- Ícone do tipo de desafio (Mood · Color · Limited · Time · Surprise)
- Estado: disponível · bloqueado · concluído

#### CENA 4 — ChallengeInfoScene
- Nome e tipo do desafio
- Regras em linguagem clara
- Timer visível se for Time Challenge
- Botão: Começar

#### CENA 5 — StudioScene *(core gameplay)*
- Avatar em destaque (Canvas, atualizado em tempo real)
- Grid de produtos disponíveis para o desafio
- HUD: nome do desafio · regras ativas · timer (se aplicável) · pontuação parcial
- Lógica: clicar num produto → aplica no avatar → atualiza canvas
- Botão: Confirmar Look
- Validação em tempo real de regras cumpridas (check visual)

#### CENA 6 — ResultScene
- Avatar com look finalizado em destaque
- Pontuação final com breakdown (regras cumpridas, bônus de tempo, extras)
- Comparação com ranking semanal
- Botões: Ver Recompensa · Jogar Novamente · Voltar ao Menu

#### CENA 7 — RewardScene
- Animação de desbloqueio (reveal com partículas suaves)
- Item desbloqueado em destaque (produto · cor · roupa · distintivo)
- Botão: Adicionar à Coleção

#### CENA 8 — CollectionScene
- Galeria de todos os itens desbloqueados
- Filtros: categoria · data de desbloqueio
- Distintivos de conquista com progresso

#### CENA 9 — TutorialScene
- Cards dos personagens tutores
- Ao selecionar: vídeo ou animação demonstrando técnica
- Personagens com diversidade física e de deficiência representada
- Destaque para produtos Rare Beauty utilizados

#### CENA 10 — ProfileScene
- Avatar do jogador
- Estatísticas: desafios concluídos · distintivos · nível atual
- Ranking semanal (top players + posição do jogador)
- Botão: Editar Avatar

---

## 5. Sistemas de Jogo

### 5.1 Sistema de Desafios

```js
// Estrutura de um desafio
{
  id: "challenge_001",
  name: "Rose Mood",
  type: "mood",           // mood | color | limited | time | surprise
  difficulty: 1,          // 1=Explore | 2=Express | 3=Rare Mode
  rules: [
    { type: "required_color", value: "#E8A0A8" },
    { type: "min_products", value: 3 }
  ],
  surpriseRule: null,     // ativado aleatoriamente no Surprise Challenge
  timeLimit: null,        // segundos; null = sem limite
  availableProducts: ["blush_01", "lip_02", "highlight_03", ...],
  pointsBase: 100,
  bonusConditions: [
    { condition: "all_rules_met", bonus: 50 },
    { condition: "time_remaining_50pct", bonus: 25 }
  ]
}
```

### 5.2 Sistema de Pontuação

| Critério | Pontos |
|---|---|
| Regra principal cumprida | 100 pts |
| Regras extras cumpridas | +50 pts cada |
| Concluído dentro do tempo | +25 pts |
| Concluído com 50%+ do tempo restante | +25 pts adicionais |
| Condição surpresa cumprida | +75 pts |
| **Máximo por desafio (Rare Mode)** | **~325 pts** |

### 5.3 Sistema de Recompensas e Distintivos

| Distintivo | Condição de desbloqueio |
|---|---|
| Rare Starter | Primeiro desafio concluído |
| Color Explorer | 5 desafios de cor concluídos |
| Bold Choice | Desafio com regra especial concluído |
| Rare Collector | 20 itens desbloqueados |
| Mood Master | 5 desafios de humor concluídos |
| Time Queen | 3 desafios cronometrados concluídos |
| Rare Legend | Todos os desafios concluídos |

### 5.4 Níveis de Dificuldade

| Nível | Nome | Tempo | Produtos | Regras | Surpresa |
|---|---|---|---|---|---|
| 1 | Explore | Sem limite | Máximo disponível | 1 regra | Não |
| 2 | Express | Sem limite | Limitado | 2 regras | Não |
| 3 | Rare Mode | 90–120s | Limitado | 2+ regras | Sim |

---

## 6. Identidade Visual e Design System

### 6.1 Tokens de Cor

```css
:root {
  /* Base Rare Beauty */
  --color-nude-beige:     #F5EDE4;   /* fundo principal */
  --color-rose-mauve:     #C4929A;   /* accent primário */
  --color-deep-mauve:     #8A5A62;   /* accent secundário / hover */
  --color-soft-blush:     #F0D5D8;   /* superfícies cards */
  --color-warm-white:     #FAF7F5;   /* texto sobre fundo escuro */
  --color-ink:            #1A1A1A;   /* texto principal */
  --color-muted:          #6B6B6B;   /* texto secundário */
  --color-success:        #7BAE8A;   /* regra cumprida */
  --color-warning:        #E8B85A;   /* timer warning */
  --color-error:          #D95B5B;   /* regra não cumprida */
}
```

### 6.2 Tipografia

```css
/* Principal: DM Sans (Google Fonts) — moderno, clean, legível em mobile */
/* Display: Playfair Display — personalidade, elegância editorial */

--font-display:  'Playfair Display', Georgia, serif;
--font-body:     'DM Sans', system-ui, sans-serif;

--text-xs:    0.75rem;
--text-sm:    0.875rem;
--text-base:  1rem;
--text-lg:    1.25rem;
--text-xl:    1.5rem;
--text-2xl:   2rem;
--text-3xl:   2.75rem;
```

### 6.3 Espaçamento e Bordas

```css
--radius-sm:  8px;
--radius-md:  16px;
--radius-lg:  24px;
--radius-pill: 999px;   /* botões e badges */

--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
```

---

## 7. Avatar — Sistema de Camadas (Canvas)

O avatar é renderizado em Canvas via composição de layers PNG com transparência.

### Ordem de renderização (de baixo para cima):
```
1. base_skin        — tom de pele
2. body_shape       — silhueta do corpo
3. clothes_bottom   — roupas (inferior)
4. clothes_top      — roupas (superior)
5. hair_base        — cabelo base
6. face_features    — sobrancelhas, olhos, nariz
7. makeup_base      — base/contorno
8. makeup_eyes      — olhos (sombra, delineador, cílios)
9. makeup_cheeks    — blush/iluminador
10. makeup_lips     — batom
11. hair_overlay    — fios soltos sobre a maquiagem
12. accessories     — brincos, óculos, acessórios
```

### Exportação de Look
- `canvas.toDataURL('image/png')` → gera imagem compartilhável
- Botão de compartilhamento dispara Web Share API (mobile) ou download (desktop)

---

## 8. Sistema de Áudio

```js
// AudioManager.js — resumo das responsabilidades
AudioManager {
  loadTrack(src)           // carrega trilha BGM
  playBGM()                // inicia trilha em loop
  pauseBGM()
  playSFX(name)            // toca efeito sonoro pontual
  setVolume(type, value)   // controle separado BGM / SFX
  mute()
}

// Mapa de efeitos (sounds.js)
SFX_MAP = {
  product_select:    'sfx/select.mp3',
  makeup_apply:      'sfx/apply.mp3',
  challenge_complete:'sfx/complete.mp3',
  points_earned:     'sfx/points.mp3',
  reward_unlock:     'sfx/unlock.mp3',
  level_up:          'sfx/levelup.mp3',
  menu_open:         'sfx/menu.mp3',
  look_share:        'sfx/share.mp3'
}
```

---

## 9. Persistência de Dados (localStorage)

```js
// Estrutura do save local
{
  "rare_player": {
    "version": "1.0",
    "avatar": { /* opções selecionadas */ },
    "totalPoints": 0,
    "completedChallenges": [],
    "unlockedItems": [],
    "badges": [],
    "weeklyScore": 0,
    "weeklyReset": "2026-09-21"
  }
}
```

---

## 10. Acessibilidade

| Requisito | Implementação |
|---|---|
| Navegação por teclado | `tabindex`, `focus-visible`, atalhos de teclado nas telas principais |
| Screen readers | `aria-label` em todos os elementos interativos; `role="img"` no canvas com descrição |
| Contraste mínimo | WCAG AA (4.5:1 para texto normal, 3:1 para elementos UI) |
| Tamanho de toque | Mínimo 44×44px em todos os botões (mobile) |
| Redução de movimento | `@media (prefers-reduced-motion)` — animações simplificadas |
| Representação no avatar | Opções inclusivas: próteses, cadeira de rodas, eye patch, vitiligo, cicatrizes |

---

## 11. Performance

| Métrica | Meta |
|---|---|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Bundle size (JS) | < 200KB gzip |
| Assets totais | < 5MB |
| FPS mínimo no Canvas | 60fps (desktop) / 30fps (mobile) |

### Otimizações obrigatórias:
- Sprites em formato WebP com fallback PNG
- Lazy loading de cenas não ativas
- Canvas offscreen para composição do avatar
- Audio sprites para agrupar SFX curtos
- `requestAnimationFrame` em todos os loops de animação

---

## 12. Roadmap de Desenvolvimento (Protótipo)

### Fase 0 — Setup (Semana 1)
- [ ] Configurar Vite + estrutura de pastas
- [ ] Implementar SceneManager e EventBus
- [ ] Criar GameState machine base
- [ ] Configurar tokens CSS

### Fase 1 — Core Gameplay (Semanas 2–3)
- [ ] WelcomeScene (estática)
- [ ] StudioScene com Canvas funcional
- [ ] 3 produtos funcionais no avatar (1 camada teste)
- [ ] ChallengeSystem básico (1 desafio completo)
- [ ] ScoringSystem
- [ ] ResultScene

### Fase 2 — Conteúdo (Semanas 4–5)
- [ ] AvatarScene com customização completa
- [ ] ChallengeSelectScene com 10 desafios
- [ ] TimerSystem (Time Challenge)
- [ ] RewardScene + RewardSystem
- [ ] CollectionScene

### Fase 3 — Polimento (Semanas 6–7)
- [ ] TutorialScene com 3 personagens
- [ ] ProfileScene + ranking local
- [ ] AudioManager + SFX
- [ ] Animações e transições entre cenas
- [ ] Compartilhamento de look (Web Share API)

### Fase 4 — QA e Entrega (Semana 8)
- [ ] Testes cross-browser (Chrome, Safari, Firefox, Edge)
- [ ] Testes mobile (iOS Safari, Android Chrome)
- [ ] Revisão de acessibilidade
- [ ] Otimização de performance
- [ ] Build de produção + deploy

---

## 13. Dependências e Ferramentas

### Desenvolvimento
```json
{
  "devDependencies": {
    "vite": "^5.x"
  }
}
```
> **Zero dependências de runtime.** Todo o jogo roda em JS puro + APIs nativas do browser.

### Fontes (CDN)
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@400;600&display=swap" rel="stylesheet">
```

### Ferramentas de apoio à produção
| Ferramenta | Uso |
|---|---|
| [Piskel](https://www.piskelapp.com/) | Criação de sprites pixel art |
| [Figma](https://figma.com) | Design das telas e assets |
| [Suno AI / Udio](https://suno.ai) | Geração de trilha livre de direitos |
| [ElevenLabs SFX](https://elevenlabs.io/sound-effects) | Efeitos sonoros gerados por IA |
| [Squoosh](https://squoosh.app/) | Otimização de imagens → WebP |
| [Claude](https://claude.ai) | Geração de código, lógica de sistemas |

---

## 14. Prompts de Desenvolvimento (Registro Obrigatório conforme GDD §5)

> Registrar aqui todos os prompts utilizados junto à IA durante o desenvolvimento.

| # | Ferramenta | Finalidade | Prompt resumido |
|---|---|---|---|
| 001 | Claude | SPEC.md e definição de stack | "Você é um publicitário com especialidade em programação advergamer... montar a SPEC.md e escolher a Stack do projeto" |
| 002 | Claude (Claude Code) | Protótipo jogável completo | "Você é um desenvolvedor frontend especialista em advergaming. Vamos construir o protótipo jogável do Rare Beauty: Rare Your Look seguindo a SPEC e o GDD — Vite + Vanilla JS, Canvas para o avatar, state machine, localStorage, Web Audio, estrutura de pastas do §3" |

> Registro da entrega do prompt 002: 10 cenas, 10 desafios, 26 produtos, 22 itens
> de coleção, 7 distintivos, 4 personagens de tutorial e as 12 camadas de Canvas
> do §7 implementadas. Decisões técnicas e desvios em `docs/DECISOES.md`.

---

*Documento vivo — atualizar a cada sprint com novos prompts, decisões técnicas e mudanças de escopo.*
