export function hexToRgb(hex: string): { r: number; g: number; b: number };
export function rgbToHex(rgb: { r: number; g: number; b: number }): string;
export function mix(a: string, b: string, t?: number): string;
export function lighten(hex: string, amount?: number): string;
export function darken(hex: string, amount?: number): string;
export function alpha(hex: string, a?: number): string;
export function luminance(hex: string): number;
export function readableInk(hex: string): string;
export function deltaE(a: string, b: string): number;
