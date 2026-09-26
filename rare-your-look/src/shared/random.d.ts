export function hashString(text: string): number;
export function createRng(seed?: number | string): () => number;
export function pick<T>(rng: () => number, list: T[]): T;
export function shuffle<T>(rng: () => number, list: T[]): T[];
