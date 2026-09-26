/**
 * FASE 1 — FIND YOUR COLOR (SPEC §13)
 * Tutorial implícito: mover → paletas → pular → Rare Box → frasco → gota.
 * Sem plataformas móveis. Buracos pequenos (≤ 180 px).
 *
 * Feedback da professora (itens 1 e 2): a PRIMEIRA coisa que a jogadora
 * coleta é uma paleta de cores, e a instrução fala de paletas E produtos.
 */
import { LevelBuilder, GROUND_Y } from './types';

const G = GROUND_Y;

export const level1 = new LevelBuilder(1, 8200)
  // ------------------------------------------------ 0 · início seguro
  .ground(0, 1500)
  .tutorial(0, '← → PARA SE MOVER', 'USE ◀ ▶ PARA SE MOVER')
  .decor('banner', 250, 300, 'FIND YOUR COLOR')
  .palettes(380, G - 40, 3)
  .tutorial(560, 'ESPAÇO PARA PULAR', 'TOQUE EM ▲ PARA PULAR')
  .plat(700, 540, 180)
  .palettes(750, 500, 2, 60)
  .plat(960, 440, 180)
  .palettes(1010, 400, 2, 60)
  .tutorial(1120, 'BATA NAS RARE BOXES POR BAIXO: ELAS GUARDAM OS PRODUTOS')
  .box(1260, { type: 'palette' })
  .box(1316, { type: 'product', id: 'blush' })
  .sign(1440, 'welcome')
  .arc(1535, 520, 3, 45, 40)

  // ------------------------------------------------ 1 · primeiros obstáculos
  .ground(1660, 2700)
  .tutorial(1720, 'CUIDADO COM OS FRASCOS: PULE POR CIMA!')
  .bottle(1900)
  .hiddenBox(2040, { type: 'secret', id: 'secret_blush_tones' })
  .box(2200, { type: 'palette' })
  .box(2256, { type: 'bonus' })
  .box(2312, { type: 'palette' })
  .plat(2390, 520, 150)
  .plat(2560, 410, 150)
  .palettes(2590, 370, 2, 60)
  .checkpoint(2640)
  .arc(2720, 540, 3, 55, 50)

  // ------------------------------------------------ 2 · produto visível + gota
  .ground(2880, 3700)
  .sign(2950, 'blush')
  .plat(3020, 520, 160)
  .plat(3240, 410, 210)
  .product('lipstick', 3345, 360)
  .palettes(3470, G - 40, 3, 50)
  .drip(3540, 2, 0)
  .arc(3720, 540, 2, 90, 40)

  .ground(3860, 5200)
  .bottle(4040)
  .box(4200, { type: 'palette' })
  .box(4256, { type: 'product', id: 'lipoil' })
  .box(4312, { type: 'palette' })
  .bottle(4480)
  .palettes(4560, G - 40, 3)
  .checkpoint(4720)
  .sign(4860, 'lips')
  .plat(4960, 520, 150)
  .plat(5120, 410, 150)
  .palettes(5150, 370, 2, 60)

  // ------------------------------------------------ 3 · ponte sobre o vão
  .plat(5330, 500, 140)
  .palettes(5360, 460, 2, 50)
  .ground(5560, 6500)
  .bottle(5800)
  .drip(6050, 1.6, 0.4)
  .drip(6180, 1.6, 1.2)
  .box(6300, { type: 'bonus' })
  .box(6356, { type: 'palette' })
  .arc(6530, 540, 3, 60, 50)

  // ------------------------------------------------ 4 · chegada
  .ground(6680, 8200)
  .palettes(6850, G - 40, 6, 60)
  .decor('banner', 7400, 290, 'RARE BEAUTY')
  .sign(7600, 'kind')
  .portal(7900)
  .build();
