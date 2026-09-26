/**
 * Produtos do jogo (SPEC §16).
 *
 * ⚠️ PLACEHOLDER DE MARCA: as linhas abaixo reaproveitam o catálogo da v1
 * (`catalog.js`), inspirado no portfólio Rare Beauty. Nomes, tons e imagens
 * devem ser validados com os assets oficiais antes de uso público. Tudo o que
 * é "de marca" mora só neste arquivo — trocar um nome ou imagem aqui não
 * mexe em nenhuma mecânica.
 *
 * - Um `Product` é o item coletado na fase (ex.: o blush).
 * - Cada produto traz os seus `shades` — tons que o jogador escolhe no Rare Studio.
 * - Um `SecretItem` é o colecionável secreto (SPEC §28): libera tons extras.
 */
import { PRODUCTS as CATALOG, type CatalogShade, type SlotId, type PackageKind } from './catalog.js';

export type ProductCategory = 'lips' | 'cheeks' | 'eyes' | 'face' | 'highlighter';

export interface Shade {
  id: string;
  name: string;
  color: string;
  finish: CatalogShade['finish'];
  description: string;
  /** Item secreto que libera este tom (ausente = liberado ao coletar o produto). */
  unlockedBy?: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  /** Chave da textura grande (card do Rare Studio / popup de item encontrado). */
  image: string;
  /** Chave da textura pequena (HUD, Rare Bag). */
  icon: string;
  color?: string;
  stage: number;
  required: boolean;
  /** Rótulo curto exibido em caixa-alta na coleta ("BLUSH"). */
  label: string;
  /** Linha de produto (nome comercial placeholder). */
  line: string;
  /** Camada de maquiagem pintada no avatar. */
  slot: SlotId;
  kind: PackageKind;
  shades: Shade[];
}

export interface SecretItem {
  id: string;
  name: string;
  description: string;
  stage: number;
  icon: string;
  color: string;
  /** Produto que ganha os tons extras. */
  productId: string;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  face: 'Rosto',
  cheeks: 'Bochechas',
  eyes: 'Olhos',
  lips: 'Lábios',
  highlighter: 'Iluminação',
};

/** Ordem das abas do Rare Studio (SPEC §23). */
export const CATEGORY_ORDER: ProductCategory[] = ['face', 'cheeks', 'eyes', 'lips', 'highlighter'];

// ---------------------------------------------------------------- secretos
export const SECRET_ITEMS: SecretItem[] = [
  {
    id: 'secret_blush_tones',
    name: 'Tons Rare · Blush',
    description: 'Dois tons extras de blush: Believe e Lucky.',
    stage: 1,
    icon: 'secret',
    color: '#EF6F8C',
    productId: 'blush',
  },
  {
    id: 'secret_shadow_tones',
    name: 'Tons Rare · Sombra',
    description: 'Duas sombras extras: Dreamy e Golden Hour.',
    stage: 2,
    icon: 'secret',
    color: '#A99BCB',
    productId: 'eyeshadow',
  },
  {
    id: 'secret_glow_tone',
    name: 'Tom Rare · Iluminador',
    description: 'Iluminador extra: Exhilarate, bronze luminoso.',
    stage: 2,
    icon: 'secret',
    color: '#D9A36F',
    productId: 'highlight',
  },
  {
    id: 'secret_lip_tones',
    name: 'Tons Rare · Batom',
    description: 'Dois batons extras: Wise e Devoted.',
    stage: 3,
    icon: 'secret',
    color: '#7A3550',
    productId: 'lipstick',
  },
  {
    id: 'secret_oil_tone',
    name: 'Tom Rare · Lip Oil',
    description: 'Lip oil extra: Happy, pink glossy.',
    stage: 3,
    icon: 'secret',
    color: '#EC7C98',
    productId: 'lipoil',
  },
  {
    id: 'secret_bronzer_tone',
    name: 'Tom Rare · Bronzer',
    description: 'Bronzer extra: Always Sunny, bronze profundo.',
    stage: 3,
    icon: 'secret',
    color: '#8F5B3E',
    productId: 'bronzer',
  },
];

/** Qual item secreto libera cada tom bloqueado do catálogo (unlockId da v1 → secreto). */
const SHADE_UNLOCKS: Record<string, string> = {
  blush_believe: 'secret_blush_tones',
  blush_lucky: 'secret_blush_tones',
  shadow_dreamy: 'secret_shadow_tones',
  shadow_gold: 'secret_shadow_tones',
  high_exhilarate: 'secret_glow_tone',
  lip_wise: 'secret_lip_tones',
  lip_devoted: 'secret_lip_tones',
  oil_happy: 'secret_oil_tone',
  bronzer_always_sunny: 'secret_bronzer_tone',
};

function shadesFor(slot: SlotId): Shade[] {
  return CATALOG.filter((item) => item.slot === slot).map((item) => ({
    id: item.id,
    name: item.shade,
    color: item.color,
    finish: item.finish,
    description: item.description,
    unlockedBy: SHADE_UNLOCKS[item.id],
  }));
}

function lineFor(slot: SlotId): string {
  return CATALOG.find((item) => item.slot === slot)?.line ?? '';
}

function kindFor(slot: SlotId): PackageKind {
  return CATALOG.find((item) => item.slot === slot)?.kind ?? 'bottle';
}

interface ProductSeed {
  id: SlotId;
  label: string;
  category: ProductCategory;
  stage: number;
  description: string;
}

/** Produtos obrigatórios, na ordem em que aparecem nas fases (SPEC §13–15). */
const SEEDS: ProductSeed[] = [
  // Fase 1 — Find Your Color: cor para bochechas e lábios
  { id: 'blush', label: 'Blush', category: 'cheeks', stage: 1, description: 'Blush líquido: uma gota já colore as bochechas.' },
  { id: 'lipstick', label: 'Batom', category: 'lips', stage: 1, description: 'Batom matte de acabamento aveludado.' },
  { id: 'lipoil', label: 'Lip Oil', category: 'lips', stage: 1, description: 'Óleo labial com cor e brilho espelhado.' },
  // Fase 2 — Build Your Look: olhos e iluminação
  { id: 'eyeshadow', label: 'Sombra', category: 'eyes', stage: 2, description: 'Sombra líquida que desliza e fixa.' },
  { id: 'liner', label: 'Delineador', category: 'eyes', stage: 2, description: 'Delineador líquido de traço fino.' },
  { id: 'highlight', label: 'Iluminador', category: 'highlighter', stage: 2, description: 'Iluminador líquido para os pontos altos.' },
  // Fase 3 — Be Rare: acabamento
  { id: 'bronzer', label: 'Bronzer', category: 'face', stage: 3, description: 'Bronzer em bastão: calor e contorno.' },
  { id: 'mascara', label: 'Máscara', category: 'eyes', stage: 3, description: 'Máscara de cílios para volume e curvatura.' },
];

export const PRODUCTS: Product[] = SEEDS.map((seed) => {
  const shades = shadesFor(seed.id);
  return {
    id: seed.id,
    name: lineFor(seed.id),
    line: lineFor(seed.id),
    label: seed.label,
    category: seed.category,
    description: seed.description,
    image: `product-${seed.id}`,
    icon: `product-${seed.id}`,
    color: shades[0]?.color,
    stage: seed.stage,
    required: true,
    slot: seed.id,
    kind: kindFor(seed.id),
    shades,
  };
});

export const PRODUCTS_BY_ID: Record<string, Product> = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
export const SECRETS_BY_ID: Record<string, SecretItem> = Object.fromEntries(SECRET_ITEMS.map((s) => [s.id, s]));

export const productsForStage = (stage: number): Product[] => PRODUCTS.filter((p) => p.stage === stage);
export const secretsForStage = (stage: number): SecretItem[] => SECRET_ITEMS.filter((s) => s.stage === stage);

/** Tons disponíveis de um produto, dado o que o jogador já encontrou. */
export function availableShades(product: Product, secretIds: readonly string[]): Shade[] {
  return product.shades.filter((shade) => !shade.unlockedBy || secretIds.includes(shade.unlockedBy));
}

/** Busca um tom em qualquer produto. */
export function findShade(shadeId: string): { product: Product; shade: Shade } | null {
  for (const product of PRODUCTS) {
    const shade = product.shades.find((s) => s.id === shadeId);
    if (shade) return { product, shade };
  }
  return null;
}
