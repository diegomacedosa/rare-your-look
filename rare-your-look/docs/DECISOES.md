# Decisões técnicas — v2 (Platform Edition)

A SPEC v2 (`docs/SPEC.md`) é a fonte de verdade do escopo. Este documento
registra como ela foi implementada e o que foi reaproveitado da v1.

## 1. O que veio da v1

A v1 era um jogo de "vestir o avatar" em DOM + Canvas. A regra da SPEC §46 era
não apagar nada antes de verificar o que servia. Resultado:

| Da v1 | Na v2 | Como |
|---|---|---|
| Compositor de avatar em 12 camadas (`AvatarSystem.js` + `painters/`) | **Rare Studio, Reveal e Coleção** | Reaproveitado sem mudanças de lógica. `game/avatar/portrait.ts` pinta num canvas e registra como textura do Phaser; trocar um tom repinta só o grupo `makeup`. |
| Catálogo de tons (`data/products.js`) | `data/catalog.js` | Mesmos tons, cores e acabamentos. `data/products.ts` agrupa em **produtos** no formato da SPEC §16 e liga os tons bloqueados aos itens secretos. |
| Opções de avatar (`avatarOptions.js`) | Maya no Rare Studio | A Maya é um avatar fixo (tom 4, cabelo ondulado, argolas, sardas). |
| `AudioManager.js` (Web Audio sintetizado) | `game/systems/AudioSystem.ts` | Porte para TypeScript com o mesmo envelope sem clique e o mesmo "delay" da trilha. Ganhou ruído filtrado, 25 efeitos e 5 trilhas. |
| Arte SVG das embalagens (`ProductCard.js`) | `art/textures.ts` → `drawProduct` | Portada para Canvas 2D. |
| `StorageManager.js` | `game/systems/storage.ts` | Mesmo fallback para memória quando o localStorage é bloqueado. |
| Tokens de cor (`tokens.css`) | `game/theme.ts` + `styles/game.css` | Mesma paleta nude/rosé/mauve. |
| `utils/color.js`, `utils/random.js` | `shared/` | Sem mudanças. |

O que não servia mais (cenas DOM, desafios, ranking, recompensas) foi movido
para `legacy/` — fora do bundle, preservado para consulta.

## 2. Arquitetura

- **Phaser 3 + TypeScript estrito + Vite** (SPEC §36). O HTML só hospeda o canvas
  e o aviso de orientação.
- **Uma cena de fase para as três fases.** `LevelScene` recebe o layout; `Level1Scene`
  … `Level3Scene` só dizem qual. Foi o que resolveu o "a fase 2 não funcionou":
  não existe código específico de fase para quebrar.
- **Fases desenhadas à mão** com um construtor fluente (`levels/types.ts`):
  uma linha por elemento, ids estáveis para salvar o que já foi coletado.
- **HUD em cena paralela** (`HUDScene`), conversando com a fase por um canal
  tipado (`hudBus`). A fase anuncia o que aconteceu; a HUD decide como mostrar.
- **Estado único** em `ProgressSystem` (SPEC §38) + coleção que sobrevive entre
  partidas. Tudo salvo em localStorage.
- **Arte separada da lógica** (SPEC §41): todas as texturas são geradas em
  `art/` com chaves estáveis. Para usar arte final, adicione o arquivo em
  `src/data/assets.ts` com a mesma chave — o gerador pula chaves já carregadas.

## 3. Física e level design

- Números medidos no jogo: pulo de **~202 px** de altura e **~314 px** de alcance
  em velocidade máxima. Regras de design: vãos ≤ 200 px, degraus ≤ 160 px,
  Rare Box a 130 px do chão (dá para passar por baixo e subir em cima).
- Coyote time (110 ms), buffer de pulo (130 ms) e pulo variável: controle antes
  de realismo (SPEC §8).
- Plataformas flutuantes são "macias" (atravessa pulando por baixo). Móveis andam
  por velocidade para o Arcade Physics carregar a Maya.
- Produto que sai de uma Rare Box fica suspenso e depois **desce ao lado da
  caixa, na altura da Maya** — pegar um item acima da caixa exigia um pulo
  lateral preciso demais para iniciantes.
- Ajustes encontrados em teste: mover do caminho de baixo da Fase 3 era mais
  rápido que a Maya; plataforma frágil antes de um mover dependia de sorte;
  pincéis horizontais passavam de 450 px/s. Todos corrigidos.

## 4. Pontuação (SPEC §27)

Produto 100 · secreto 150 · Rare Box 25 · paleta 10 · fase 500 · todas as
paletas +200 · tempo abaixo da referência +3/s (até 450). O Rare Studio não mexe
em pontos: o look é expressão, não avaliação (SPEC §25).

## 5. Áudio (SPEC §35)

Tudo sintetizado ao vivo (Web Audio), sem arquivos e sem música comercial.
Efeitos: interface, pulo, aterrissagem, paleta, Rare Box, batida em caixa vazia,
item surgindo, produto, secreto, coração, checkpoint, dano, queda, "respire
fundo", plataforma frágil, portal fechado/aberto, fase concluída, placa, whoosh,
brilho, escolher produto, aplicar/remover maquiagem, reveal. Trilhas: menu,
uma por fase e Rare Studio/cutscenes. **Música ON/OFF** e **Som ON/OFF**
separados, salvos no localStorage. Para usar arquivos finais, ligar
`ASSETS_AVAILABLE` em `systems/sounds.ts`.

## 6. Robustez

- O primeiro gesto libera o áudio; uma trilha pedida antes disso começa no
  desbloqueio.
- Aba escondida suspende o áudio; o tempo de fase só corre com a cena ativa
  (pausa não conta).
- As cutscenes não usam zoom de câmera (os botões fixos saíam da tela) nem
  `RenderTexture` para o foco de luz: é uma textura de canvas comum.
- Celular em pé mostra "Gire seu dispositivo para jogar"; em pé ou deitado o
  canvas escala proporcionalmente (1280×720 lógico).
