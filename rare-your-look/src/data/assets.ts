/**
 * Assets finais (SPEC §41).
 *
 * Hoje a lista está vazia: toda a arte é gerada por código em
 * src/game/art/. Para trocar um placeholder por uma ilustração final,
 * coloque o arquivo em /public/assets/... e adicione uma linha aqui com a
 * MESMA chave usada pelo jogo — o gerador de placeholders pula chaves que
 * já existem, então nenhuma lógica precisa mudar.
 *
 * Chaves disponíveis: maya (spritesheet 96×128 numa única linha, quadros na ordem de
 * MAYA_FRAME_NAMES), rarebox, rarebox-used, palette, secret, bonus, heart,
 * mirror-off, mirror-on, portal, bottle, brush-h, brush-v, drop, dripper,
 * sign, rarebag, product-<id> (blush, lipstick, lipoil, eyeshadow, liner,
 * highlight, bronzer, mascara), sky-<tema>, far-<tema>, mid-<tema>, bedroom.
 */
export interface AssetOverride {
  key: string;
  url: string;
  /** Para spritesheets. */
  frame?: { frameWidth: number; frameHeight: number };
}

export const ASSET_OVERRIDES: AssetOverride[] = [
  // { key: 'product-blush', url: 'assets/products/blush.png' },
];
