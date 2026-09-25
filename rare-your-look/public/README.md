# Assets

As pastas aqui seguem a estrutura da SPEC (§3) e estão **vazias de propósito** no
protótipo:

| Pasta | O que vai aqui | Hoje o protótipo usa |
|---|---|---|
| `assets/sprites/avatar/` | Camadas PNG/WebP do avatar | Desenho vetorial em Canvas (`src/systems/avatar/`) |
| `assets/sprites/products/` | Ícones dos produtos | SVG gerado a partir da cor do produto (`ui/components/ProductCard.js`) |
| `assets/sprites/badges/` | Distintivos | Ícone SVG inline (`ui/icons.js`) |
| `assets/sprites/characters/` | Personagens dos tutoriais | Mesmo renderer do avatar |
| `assets/backgrounds/` | Fundos das cenas | Gradientes CSS/Canvas (`data/avatarOptions.js` → `SCENARIOS`) |
| `assets/ui/` | Ícones de interface | SVG inline |
| `audio/bgm/` | Trilha instrumental | Trilha gerada ao vivo pela Web Audio API |
| `audio/sfx/` | Efeitos sonoros | Efeitos sintetizados (`src/audio/sounds.js`) |

## Quando os assets reais chegarem

1. Coloque os arquivos nas pastas acima com os nomes usados em `src/audio/sounds.js`
   (`SFX_MAP[...].src`).
2. Troque `ASSETS_AVAILABLE` para `true` em `src/audio/sounds.js` — o AudioManager
   passa a carregar os arquivos e cai no som sintetizado só se algum faltar.
3. Para sprites do avatar, os "painters" em `src/systems/avatar/` podem ser
   substituídos por `ctx.drawImage()` mantendo a mesma ordem de camadas do SPEC §7.
