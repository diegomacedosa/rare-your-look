/**
 * InventorySystem — a Rare Bag (SPEC §11).
 * Consultas sobre o que a Maya já tem, derivadas do ProgressSystem.
 */
import { PRODUCTS, SECRET_ITEMS, productsForStage, secretsForStage, type Product, type SecretItem } from '../../data/products';
import { LEVELS } from '../../data/levels';
import progress from './ProgressSystem';

export interface BagSlot {
  product: Product;
  found: boolean;
}

export const Inventory = {
  /** Produtos obrigatórios da fase, com o estado de cada um (●/○ na HUD). */
  levelBag(level: number): BagSlot[] {
    return productsForStage(level).map((product) => ({ product, found: progress.hasProduct(product.id) }));
  },

  missingForLevel(level: number): Product[] {
    return productsForStage(level).filter((p) => !progress.hasProduct(p.id));
  },

  secretsForLevel(level: number): { item: SecretItem; found: boolean }[] {
    return secretsForStage(level).map((item) => ({ item, found: progress.hasSecret(item.id) }));
  },

  collected(): Product[] {
    return PRODUCTS.filter((p) => progress.hasProduct(p.id));
  },

  secrets(): SecretItem[] {
    return SECRET_ITEMS.filter((s) => progress.hasSecret(s.id));
  },

  /** Percentual de exploração: produtos + secretos + paletas + Rare Boxes. */
  exploration(): number {
    let found = 0;
    let total = 0;
    for (const level of LEVELS) {
      total += level.counts.palettes + level.counts.boxes;
      found += (progress.state.palettes[level.id] ?? []).length + (progress.state.openedBoxes[level.id] ?? []).length;
    }
    total += PRODUCTS.length + SECRET_ITEMS.length;
    found += progress.state.collectedProducts.length + progress.state.secretItems.length;
    return total ? Math.round((found / total) * 100) : 0;
  },
};

export default Inventory;
