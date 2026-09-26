/**
 * Identidade visual compartilhada por todas as cenas.
 * Paleta herdada dos tokens da v1 (Rare Beauty: nude, rosé, mauve).
 */
import type Phaser from 'phaser';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const COLORS = {
  nude: '#F5EDE4',
  blush: '#F0D5D8',
  rose: '#C4929A',
  mauve: '#8A5A62',
  mauveDark: '#6E454C',
  night: '#2B1B22',
  white: '#FAF7F5',
  ink: '#1A1A1A',
  muted: '#6B6B6B',
  gold: '#D6AE62',
  success: '#7BAE8A',
  error: '#D95B5B',
} as const;

/** Mesmas cores como número (Phaser Graphics). */
export const HEX = Object.fromEntries(
  Object.entries(COLORS).map(([key, value]) => [key, Number.parseInt(value.slice(1), 16)]),
) as Record<keyof typeof COLORS, number>;

export const FONT_DISPLAY = '"Playfair Display", Georgia, serif';
export const FONT_BODY = '"DM Sans", system-ui, sans-serif';

type TextStyle = Phaser.Types.GameObjects.Text.TextStyle;

export function displayText(size: number, color: string = COLORS.ink, extra: TextStyle = {}): TextStyle {
  return { fontFamily: FONT_DISPLAY, fontSize: `${size}px`, color, fontStyle: '600', ...extra };
}

export function bodyText(size: number, color: string = COLORS.ink, extra: TextStyle = {}): TextStyle {
  return { fontFamily: FONT_BODY, fontSize: `${size}px`, color, ...extra };
}

/** Rótulo em caixa-alta com espaçamento, estilo de embalagem. */
export function labelText(size: number, color: string = COLORS.mauve, extra: TextStyle = {}): TextStyle {
  return { fontFamily: FONT_BODY, fontSize: `${size}px`, color, fontStyle: '700', ...extra };
}

/** Temas visuais das fases. */
export interface LevelTheme {
  skyTop: string;
  skyBottom: string;
  glow: string;
  far: string;
  mid: string;
  platformTop: string;
  platformBody: string;
  platformEdge: string;
  accent: string;
  hudTint: string;
}

export const THEMES: Record<'color' | 'build' | 'rare', LevelTheme> = {
  // Fase 1 — tons suaves, pêssego e rosé
  color: {
    skyTop: '#FBE9E1',
    skyBottom: '#F3C9C6',
    glow: '#FFF6EE',
    far: '#EFC2BF',
    mid: '#E3A9AE',
    platformTop: '#F7D9D3',
    platformBody: '#D99AA0',
    platformEdge: '#B56F79',
    accent: '#D98E95',
    hudTint: '#8A5A62',
  },
  // Fase 2 — lilás e dourado, entardecer
  build: {
    skyTop: '#E9E0F4',
    skyBottom: '#D9B7C9',
    glow: '#FFF1DC',
    far: '#C9B3D9',
    mid: '#B998BF',
    platformTop: '#EFE3F4',
    platformBody: '#A98BB8',
    platformEdge: '#7E6390',
    accent: '#A99BCB',
    hudTint: '#6A4E7A',
  },
  // Fase 3 — noite berry com brilho dourado
  rare: {
    skyTop: '#3E2436',
    skyBottom: '#8A5A62',
    glow: '#F4C9A8',
    far: '#5E3550',
    mid: '#7A4262',
    platformTop: '#F2C8B8',
    platformBody: '#9E4F6A',
    platformEdge: '#6E2F4A',
    accent: '#EF6F8C',
    hudTint: '#3E2436',
  },
};
