# SPEC.md — Rare Beauty: Rare Your Look | Platform Edition

- **Versão:** 2.0
- **Tipo:** Advergame 2D de plataforma + customização/maquiagem
- **Plataforma:** Navegador desktop e mobile
- **Idioma:** Português brasileiro
- **Marca:** Rare Beauty
- **Contexto:** Projeto acadêmico
- **Status:** MVP jogável

> A SPEC da v1 (jogo de looks por desafios) está em `legacy/docs/SPEC-v1.md`.
> O feedback da professora e o que mudou por causa dele estão em
> `docs/FEEDBACK-PROFESSORA.md`.

## 1. Visão do projeto

**Rare Beauty: Rare Your Look** — *"There's no one way to be Rare."*

Advergame de plataforma 2D que combina mecânicas clássicas de plataforma com o
universo de maquiagem e autoexpressão da Rare Beauty. A jogadora controla uma
personagem fictícia que precisa se preparar para um evento especial, mas antes
precisa recuperar os produtos necessários atravessando fases, superando
obstáculos, descobrindo itens escondidos e coletando produtos. Cada fase é uma
etapa da construção do look. No fim, os produtos coletados são usados diante de
uma penteadeira para montar o look da personagem.

Loop principal: **Cutscene → Fase de plataforma → Coleta → Progressão → Nova fase
→ Coleta → Penteadeira → Montagem do look → Reveal final.**

O contato com os produtos é parte ativa da jogabilidade, não um catálogo.

## 2. Objetivo publicitário

Manter os princípios do GDD original: individualidade, autoexpressão,
experimentação, diversidade, descoberta de produtos e interação ativa com a
marca. Os produtos fazem parte das mecânicas: a jogadora **encontra → coleta →
conhece → desbloqueia → utiliza**.

## 3–4. História e premissa

Personagem fictícia **Maya** (persona do GDD), com identidade visual própria —
não representa Selena Gomez nem qualquer pessoa real. Maya vai a um evento,
encontra a penteadeira vazia e precisa recuperar os produtos espalhados pelo
universo de Rare Your Look.

> "Seu look está esperando por você. Encontre seus produtos e crie sua própria
> forma de ser Rare."

## 5. Cutscene de abertura (15–25 s, dentro do jogo, com PULAR)

1. **Preparação:** Maya entra no quarto e olha o relógio/celular.
2. **Penteadeira:** senta diante do espelho e percebe que faltam produtos.
3. **Descoberta:** elementos coloridos surgem no espelho; o quarto vira o universo Rare Your Look.
4. **Missão:** "Encontre os produtos necessários para completar o look de Maya." → FASE 1 — FIND YOUR COLOR → COMEÇAR.

## 6–8. Gameplay, controles e física

Plataforma lateral 2D: deslocamento horizontal, plataformas, saltos, blocos
interativos, obstáculos, plataformas móveis, itens escondidos, coleta,
checkpoints e chegada. Sem copiar assets, personagens, sons ou level design de
Mario Bros.

- **Desktop:** A/← esquerda · D/→ direita · W/↑/Espaço pular · E interagir · ESC pausa.
- **Mobile:** direcional esquerdo/direito, pulo e interação quando necessário; os
  controles mudam conforme o dispositivo.
- **Física:** gravidade, aceleração, desaceleração, velocidade máxima, salto,
  colisões (chão, plataformas, laterais, obstáculos), detecção de itens e
  respawn. Controle responsivo acima de realismo.

## 9. Rare Boxes

Embalagens sofisticadas inspiradas na identidade Rare Beauty (sem o bloco "?").
Batida por baixo → animação vertical → som → produto surge → fica suspenso →
jogadora encosta → coleta → HUD atualiza. Podem conter produto, pontos, bônus,
checkpoint especial ou item cosmético.

## 10–11. Coleta e Rare Bag

Produtos são o principal colecionável: surgem, são tocados, animam, mostram
nome/categoria ("ITEM ENCONTRADO · BLUSH · Adicionado ao seu Rare Bag") e entram
no inventário **Rare Bag**, visível na HUD (`● ● ○` ou `2/4`) e na pausa.

## 12–15. Fases

3 fases completas, 2–4 min cada para iniciantes (8–15 min no total).

- **Fase 1 — Find Your Color:** tutorial implícito (← → mover, ESPAÇO pular, bater
  nas Rare Boxes), plataformas simples, buracos pequenos, primeiros obstáculos,
  produtos visíveis e escondidos. Bochechas, lábios e pigmentos de cor.
- **Fase 2 — Build Your Look:** plataformas móveis e que desaparecem, obstáculos
  móveis, caminhos alternativos, Rare Boxes escondidas, áreas superiores,
  checkpoints. Olhos, iluminação e acabamento; alguns produtos fora da rota.
- **Fase 3 — Be Rare:** combina tudo, saltos maiores, mais intensa — desafio sem
  dificuldade punitiva.

Conclusão: todos os produtos obrigatórios + chegar ao portal/espelho.

## 16. Produtos

Não inventar nomes oficiais. Dados separados da lógica (`src/data/products.ts`):

```ts
interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  image: string;
  icon: string;
  color?: string;
  stage: number;
  required: boolean;
}

type ProductCategory = 'lips' | 'cheeks' | 'eyes' | 'face' | 'highlighter';
```

## 17–18. Obstáculos e checkpoints

Sem violência: gotas de maquiagem, formas abstratas, pincéis gigantes, plataformas
instáveis, frascos, superfícies móveis. Tocar = feedback visual + perder energia.
MVP: **3 corações**; sem corações → respawn no último checkpoint; sem Game Over
definitivo. Checkpoint = **espelho Rare** que acende, anima, toca som e mostra
"CHECKPOINT".

## 19–21. HUD, conclusão e transições

HUD mínima: Rare Bag (topo esquerdo), nome da fase (centro), corações (direita),
tempo opcional. Conclusão: atravessar o espelho, bloquear gameplay, animar e
mostrar **LOOK COMPLETE — 1/3**, produtos, pontuação, tempo, secretos e
**PRÓXIMA FASE**. Entre fases, cutscene de 5–10 s (Maya abre a Rare Bag: "As
cores estão prontas. Agora precisamos completar o look.").

## 22–26. Cutscene final, Rare Studio e Reveal

Volta ao quarto, Rare Bag na mesa, produtos aparecem, "Now make it yours." →
**RARE STUDIO**: personagem no espelho, produtos coletados por categoria (rosto,
bochechas, olhos, lábios, iluminação), escolher produto → tom → aplicar por
**camadas** (Base, Face, Cheeks, Eyes, Lips, Highlight, Hair, Accessories), sem
pintura livre. **Escolha, não avaliação**: nada de "look perfeito/errado".
**FINALIZAR LOOK** → Reveal: *THIS IS YOUR RARE LOOK* / *There's no one way to be
Rare.* com personagem, produtos usados, itens encontrados, % de exploração,
tempo total, **JOGAR NOVAMENTE** e **VER MINHA COLEÇÃO**.

## 27–28. Pontuação e secretos

Pontua gameplay, nunca aparência: obrigatório 100, secreto 150, Rare Box 25, fase
500, bônus de exploração e de tempo. Pelo menos 1 Rare Item secreto por fase
(sugestão 1/2/3), opcionais, incentivando replay.

## 29–31. Progressão, level design e câmera

CUTSCENE → FASE 1 → RESULTADO → FASE 2 → RESULTADO → FASE 3 → CUTSCENE → RARE
STUDIO → MONTAGEM → REVEAL. Fases feitas à mão (sem procedural): início seguro,
tutorial implícito, primeira recompensa rápida, dificuldade gradual, checkpoint,
pico de desafio, recompensa, chegada. Câmera lateral com suavização, limites e
look-ahead na direção do movimento.

## 32–35. Arte, animação, feedback e áudio

Minimalista, contemporânea, sofisticada, formas orgânicas, 2D vetorial/cartoon
(sem pixel art) — "Rare Beauty transformada em universo de plataforma", não
"Mario com logo". Animações: idle, run, jump, fall, land, hit, celebrate,
interact; no Studio: sit, pick-product, apply-makeup, look-at-mirror,
final-pose. Feedback de coleta, Rare Box, checkpoint e conclusão. Áudio: músicas
de menu/gameplay/Studio e efeitos de salto, coleta, Rare Box, checkpoint, dano,
produto, fase concluída, maquiagem e reveal, com **Som ON/OFF** e **Música
ON/OFF**. Sem músicas comerciais.

## 36–41. Stack, estrutura, estado, responsividade, performance e assets

Phaser 3 + TypeScript + Vite, interface externa em HTML/CSS, sem backend, sem
banco, persistência em localStorage. Estrutura `src/game/{scenes,entities,
systems,levels}`, `src/data/{products,levels,dialogue}`, `src/styles/game.css`.

```ts
interface GameState {
  currentLevel: number;
  lives: number;
  score: number;
  collectedProducts: string[];
  secretItems: string[];
  checkpoints: Record<number, string>;
  completedLevels: number[];
  selectedMakeup: Record<string, string>;
}
```

Resolução lógica 1280×720 escalando proporcionalmente; mobile em paisagem
("Gire seu dispositivo para jogar." em retrato). Meta de 60 FPS. Placeholders
claramente identificados e substituíveis sem mexer na lógica.

## 42–43. Requisitos

RF-01…RF-30 (nova partida, cutscene pulável, controle da Maya, corrida, pulo,
colisão, obstáculos, vidas, checkpoints, Rare Boxes, coleta, Rare Bag, HUD,
obrigatórios e opcionais por fase, dificuldade progressiva, desbloqueio de fases,
transições, cutscene final, Rare Studio com produtos coletados, alteração visual,
finalizar, Reveal, pontuação por gameplay, reiniciar, persistência local, som
desligável). RNF-01…RNF-12 (navegador, sem backend, sem login, ~60 FPS,
carregamento inicial, teclado, touch, sem APIs externas no gameplay, dados e
assets separados da lógica, TypeScript estrito, nenhuma credencial no frontend).

## 44–48. MVP, ordem de implementação e definição de pronto

Fluxo de ponta a ponta obrigatório: abrir → introdução → fase 1 → coletar →
completar → fase 2 → fase 3 → penteadeira → selecionar produtos → aplicar →
look final. Ordem: core → vertical slice da fase 1 → Rare Bag → progressão →
fase 2 → fase 3 → Rare Studio → cutscenes → polish. Gameplay antes de polish.

Pronto quando: 3 fases distintas com dificuldade crescente, Rare Boxes, coleta,
inventário, checkpoints, animações, cutscenes, Rare Studio alterando a Maya,
Reveal, jogo completo do início ao fim, build de produção sem erros, sem erros
críticos no console, sem backend e com o conceito Rare Beauty perceptível em toda
a experiência.
