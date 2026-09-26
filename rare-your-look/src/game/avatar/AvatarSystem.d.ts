/** Tipos do compositor de avatar em camadas herdado da v1 (AvatarSystem.js). */
export type Look = Partial<Record<string, string>>;

export interface AvatarConfig {
  skinTone?: string;
  bodyShape?: string;
  hairStyle?: string;
  hairColor?: string;
  eyeColor?: string;
  top?: string;
  topColor?: string;
  bottom?: string;
  accessories?: Partial<Record<'earrings' | 'eyewear' | 'hearing' | 'neck' | 'hairAcc', string>>;
  features?: Partial<Record<'freckles' | 'vitiligo' | 'scar' | 'mole', boolean>>;
  mobility?: string;
  prosthetic?: string;
  makeup?: string;
  scenario?: string;
  seed?: number;
}

export const LAYER_ORDER: string[];

export class AvatarRenderer {
  constructor(
    canvas: HTMLCanvasElement,
    options?: { maxScale?: number; fixedWidth?: number | null; background?: string | null },
  );
  canvas: HTMLCanvasElement;
  scale: number;
  render(
    avatar: AvatarConfig,
    look?: Look,
    options?: { intensity?: Partial<Record<string, number>>; background?: string | null; describe?: boolean },
  ): this;
  toDataURL(type?: string): string;
  destroy(): void;
}

export function paintScenario(ctx: CanvasRenderingContext2D, scenarioId: string, width: number, height: number): void;
export function describeAvatar(avatar: AvatarConfig, look?: Look): string;
export function createShareCard(options: {
  avatar: AvatarConfig;
  look?: Look;
  title?: string;
  subtitle?: string;
}): Promise<string>;
export function shareLook(dataUrl: string, filename?: string): Promise<'shared' | 'cancelled' | 'downloaded'>;
