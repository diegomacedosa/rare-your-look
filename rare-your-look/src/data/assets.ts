/**
 * Assets finais (SPEC §41).
 *
 * Os produtos já usam fotos reais (public/assets/sprites/products/); o resto
 * da arte ainda é gerado por código em src/game/art/. Para trocar um placeholder por uma ilustração final,
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

/** Fotos reais dos produtos (PNG sem fundo, 112×144 = 2× o placeholder de 56×72). */
const PRODUCT_PHOTOS = ['blush', 'lipstick', 'lipoil', 'eyeshadow', 'liner', 'highlight', 'bronzer', 'mascara'];

export const ASSET_OVERRIDES: AssetOverride[] = [
  ...PRODUCT_PHOTOS.map((id) => ({ key: `product-${id}`, url: `assets/sprites/products/${id}.png` })),
];

/**
 * Logotipo oficial (carregado já na BootScene, para aparecer na tela de
 * carregamento). A versão branca serve para fundos escuros e aceita tint.
 */
export const BRAND_ASSETS: AssetOverride[] = [
  { key: 'logo-rare-beauty', url: 'assets/ui/logo-rare-beauty.png' },
  { key: 'logo-rare-beauty-white', url: 'assets/ui/logo-rare-beauty-white.png' },
  { key: 'logo-r', url: 'assets/ui/logo-r.png' },
  { key: 'logo-r-white', url: 'assets/ui/logo-r-white.png' },
];
