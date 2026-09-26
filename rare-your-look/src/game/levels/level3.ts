/**
 * FASE 3 — BE RARE (SPEC §15)
 * Combina tudo: sequências de plataformas móveis e frágeis, pincéis mais
 * rápidos, saltos maiores e três segredos. Desafiadora, nunca punitiva:
 * checkpoints frequentes e nada do que foi coletado se perde.
 */
import { LevelBuilder, GROUND_Y } from './types';

const G = GROUND_Y;

export const level3 = new LevelBuilder(3, 11000)
  // ------------------------------------------------ 0 · começo
  .ground(0, 1200)
  .tutorial(0, 'ÚLTIMA FASE: COMBINE TUDO O QUE VOCÊ APRENDEU')
  .decor('banner', 260, 300, 'BE RARE')
  .palettes(320, G - 40, 3)
  .box(560, { type: 'palette' })
  .box(616, { type: 'product', id: 'bronzer' })
  .box(672, { type: 'palette' })
  .sign(900, 'bronzer')
  .crumble(1290, 540, 110)
  .arc(1250, 480, 3, 60, 30)

  // ------------------------------------------------ 1 · pincel rápido + bifurcação
  .ground(1500, 2400)
  .checkpoint(1540)
  .brush(1680, 330, 3)
  .drip(2180, 1.5)
  .plat(2330, 520, 120)
  .crumble(2500, 410, 110)
  .plat(2670, 300, 140)
  // rota de cima: mover até o mirante do segredo
  .mover(2860, 300, 120, 210, 0, 3.2)
  .plat(3240, 280, 260, 'solid')
  .secret('secret_lip_tones', 3440, 225)
  .palettes(3270, 240, 3, 50)
  // rota de baixo: mover rente ao vão
  .mover(2440, 570, 140, 480, 0, 6.4, 0)
  .ground(3100, 4200)
  .checkpoint(3180)

  // ------------------------------------------------ 2 · frascos + pincéis verticais
  .bottle(3450)
  .box(3575, { type: 'heart' })
  .box(3631, { type: 'palette' })
  .bottle(3760)
  .vbrush(3930, 330, 572, 2.2, 0)
  .vbrush(4080, 330, 572, 2.2, 1.1)
  // vão longo: elevador → degrau → mover (degrau firme: aqui é preciso esperar o mover)
  .mover(4250, 570, 130, 0, -200, 3, 0)
  .plat(4460, 380, 110)
  .mover(4620, 460, 130, 130, 0, 2.6)
  .arc(4300, 420, 4, 110, 30)
  .ground(4900, 6000)

  // ------------------------------------------------ 3 · máscara no alto
  .plat(5080, 520, 120)
  .plat(5240, 410, 120)
  .plat(5400, 300, 170)
  .product('mascara', 5485, 250)
  .sign(5250, 'kind')
  .hiddenBox(5640, { type: 'secret', id: 'secret_oil_tone' })
  .drip(5760, 1.5, 0.5)
  .checkpoint(5900)

  // ------------------------------------------------ 4 · o grande desafio
  .crumble(6080, 560, 100)
  .crumble(6260, 500, 100)
  .crumble(6450, 540, 100)
  .arc(6090, 480, 5, 110, 40)
  .ground(6680, 7820)
  .brush(6860, 380, 3.4, 0)
  .brush(7260, 380, 3.4, 1.7)
  // caminho alto (segredo) por cima dos pincéis
  .plat(6960, 480, 120)
  .plat(7140, 360, 120)
  .plat(7340, 250, 150)
  .secret('secret_bronzer_tone', 7415, 195)
  .checkpoint(7720)

  // ------------------------------------------------ 5 · travessia de movers
  .mover(7860, 550, 130, 200, 0, 3)
  .mover(8210, 560, 130, 0, -210, 3, 1.5)
  .mover(8370, 380, 130, 120, 0, 2.6, 0.8)
  .arc(7900, 480, 3, 90, 30)
  .ground(8640, 11000)
  .box(8900, { type: 'palette' })
  .box(8956, { type: 'bonus' })
  .box(9012, { type: 'palette' })
  .palettes(9200, G - 40, 8, 60)
  .decor('banner', 9900, 290, 'RARE BEAUTY')
  .sign(10150, 'rare')
  .portal(10700)
  .build();
