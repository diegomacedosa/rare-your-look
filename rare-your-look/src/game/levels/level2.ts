/**
 * FASE 2 — BUILD YOUR LOOK (SPEC §14)
 * Novidades: plataformas móveis, plataformas que desaparecem, pincéis em
 * movimento, caminhos alternativos, Rare Boxes escondidas, áreas superiores.
 * O delineador e o iluminador ficam FORA da rota principal: é preciso explorar.
 */
import { LevelBuilder, GROUND_Y } from './types';

const G = GROUND_Y;

export const level2 = new LevelBuilder(2, 10000)
  // ------------------------------------------------ 0 · recompensa rápida
  .ground(0, 1400)
  .decor('banner', 260, 300, 'BUILD YOUR LOOK')
  .palettes(300, G - 40, 3)
  .box(600, { type: 'palette' })
  .box(656, { type: 'product', id: 'eyeshadow' })
  .sign(860, 'eyes')
  .palettes(1000, G - 40, 3)
  .tutorial(1180, 'PLATAFORMAS MÓVEIS: ESPERE ELA CHEGAR E PULE!')
  .mover(1440, 560, 150, 210, 0, 3.4)
  .arc(1480, 500, 3, 70, 30)

  // ------------------------------------------------ 1 · pincéis + bifurcação
  .ground(1800, 2900)
  .checkpoint(1880)
  .tutorial(1860, 'PINCÉIS EM MOVIMENTO: OBSERVE O RITMO E PULE NA HORA CERTA')
  .brush(2050, 300, 3.2)
  .box(2480, { type: 'palette' })
  .box(2536, { type: 'bonus' })
  // rota de cima (opcional): escada → plataformas frágeis → mirante secreto
  .plat(2600, 520, 140)
  .plat(2760, 400, 140)
  .plat(2900, 290, 150)
  .tutorial(2950, 'PLATAFORMAS FRÁGEIS SOMEM: NÃO FIQUE PARADA!')
  .crumble(3110, 300, 110)
  .crumble(3300, 300, 110)
  .plat(3480, 260, 320, 'solid')
  .secret('secret_shadow_tones', 3740, 205)
  .palettes(3520, 220, 4, 50)
  // rota de baixo
  .plat(2990, 560, 110)
  .ground(3160, 4250)
  .checkpoint(3300)
  .box(3600, { type: 'palette' })
  .box(3656, { type: 'bonus' })

  // ------------------------------------------------ 2 · elevador para o delineador
  .sign(3900, 'kind')
  .mover(3960, 560, 130, 0, -270, 3.6)
  .plat(4110, 290, 190)
  .product('liner', 4205, 240)
  .palettes(4130, 250, 1)
  .palettes(4270, 250, 1)

  // ------------------------------------------------ 3 · vão com plataformas frágeis
  .crumble(4320, 540, 110)
  .crumble(4490, 500, 110)
  .arc(4330, 480, 4, 60, 40)
  .ground(4640, 5800)
  .vbrush(4900, 330, 572, 2.6, 0)
  .vbrush(5140, 330, 572, 2.6, 1.3)
  .hiddenBox(5350, { type: 'secret', id: 'secret_glow_tone' })
  .drip(5520, 1.7)
  .checkpoint(5680)

  // ------------------------------------------------ 4 · iluminador no alto
  .mover(5840, 540, 140, 250, 0, 3.4)
  .crumble(6040, 400, 110)
  .plat(6200, 290, 170)
  .product('highlight', 6285, 240)
  .sign(6440, 'glow')
  .arc(5880, 480, 4, 70, 40)
  .ground(6320, 7600)
  .box(6600, { type: 'palette' })
  .box(6656, { type: 'heart' })
  .box(6712, { type: 'palette' })
  .brush(6850, 380, 3.6, 0.7)
  .palettes(6900, 460, 5, 60)
  .checkpoint(7460)

  // ------------------------------------------------ 5 · travessia final
  .mover(7640, 550, 140, 200, 0, 3)
  .mover(8000, 560, 130, 0, -200, 3, 1.5)
  .arc(7700, 480, 3, 70, 30)
  .ground(8200, 10000)
  .palettes(8400, G - 40, 6, 60)
  .decor('banner', 9000, 290, 'RARE BEAUTY')
  .sign(9300, 'rare')
  .portal(9700)
  .build();
