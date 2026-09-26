# Assets

As pastas aqui estão **vazias de propósito**: o protótipo gera toda a arte e todo
o áudio por código. Elas existem para receber os arquivos finais.

| Pasta | O que vai aqui | Hoje o jogo usa |
|---|---|---|
| `assets/sprites/characters/` | Spritesheet da Maya (96×128 por quadro) | Desenho vetorial em Canvas (`src/game/art/maya.ts`) |
| `assets/sprites/products/` | Ícones dos produtos | Embalagem desenhada pela cor (`src/game/art/textures.ts` → `drawProduct`) |
| `assets/sprites/avatar/` | Camadas do retrato do Rare Studio | Compositor em camadas (`src/game/avatar/`) |
| `assets/backgrounds/` | Céu e camadas de parallax das fases, quarto | Gradientes e silhuetas em Canvas (`textures.ts`) |
| `assets/ui/` | Rare Box, espelhos, placas, ícones | Canvas (`textures.ts`) |
| `audio/bgm/` | Trilhas | Sequenciador Web Audio (`src/game/systems/sounds.ts` → `MUSIC`) |
| `audio/sfx/` | Efeitos sonoros | Síntese Web Audio (`sounds.ts` → `SFX`) |

## Quando os assets reais chegarem

**Imagens:** coloque o arquivo em `public/assets/...` e adicione uma linha em
`src/data/assets.ts` com a mesma chave usada pelo jogo, por exemplo:

```ts
{ key: 'product-blush', url: 'assets/sprites/products/blush.png' },
{ key: 'maya', url: 'assets/sprites/characters/maya.png', frame: { frameWidth: 96, frameHeight: 128 } },
```

O gerador de placeholders pula qualquer chave que já tenha sido carregada.

**Sons:** use os nomes de `SFX[...].src` em `src/game/systems/sounds.ts` e troque
`ASSETS_AVAILABLE` para `true`. Efeitos que faltarem continuam sintetizados.
