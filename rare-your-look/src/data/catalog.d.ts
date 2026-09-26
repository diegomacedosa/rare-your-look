/** Tipos do catálogo de tons herdado da v1 (catalog.js). */
export type SlotId =
  | 'bronzer'
  | 'eyeshadow'
  | 'liner'
  | 'mascara'
  | 'blush'
  | 'highlight'
  | 'lipstick'
  | 'lipoil';

export type PackageKind = 'bottle' | 'dropper' | 'stick' | 'pot' | 'bullet' | 'tube' | 'pen';

export interface CatalogShade {
  id: string;
  line: string;
  shade: string;
  slot: SlotId;
  kind: PackageKind;
  color: string;
  family: string;
  finish: 'matte' | 'dewy' | 'shimmer' | 'gloss';
  moods: string[];
  description: string;
  unlockId?: string;
}

export const PRODUCTS: CatalogShade[];
export const SLOTS: Record<SlotId, { label: string; category: string; layer: string }>;
export const FINISHES: Record<string, string>;
export const FAMILIES: Record<string, string>;
export function getProduct(id: string | null | undefined): CatalogShade | null;
export function productName(product: CatalogShade): string;
