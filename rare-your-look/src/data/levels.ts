/**
 * Metadados das fases (SPEC §12–15). A geometria de cada fase mora em
 * src/game/levels/levelN.ts; aqui ficam nome, tema, trilha e contagens.
 */
import { level1 } from '../game/levels/level1';
import { level2 } from '../game/levels/level2';
import { level3 } from '../game/levels/level3';
import type { LevelLayout } from '../game/levels/types';
import type { MusicName } from '../game/systems/sounds';
import type { THEMES } from '../game/theme';

export interface LevelMeta {
  id: number;
  sceneKey: 'Level1Scene' | 'Level2Scene' | 'Level3Scene';
  name: string;
  subtitle: string;
  theme: keyof typeof THEMES;
  music: MusicName;
  /** Tempo de referência (s) para o bônus de tempo. */
  targetTime: number;
  layout: LevelLayout;
  counts: { palettes: number; boxes: number; secrets: number };
}

function counts(layout: LevelLayout): LevelMeta['counts'] {
  const secretsInBoxes = layout.boxes.filter((b) => b.content.type === 'secret').length;
  return {
    palettes: layout.palettes.length + layout.boxes.filter((b) => b.content.type === 'palette').length,
    boxes: layout.boxes.length,
    secrets: layout.secrets.length + secretsInBoxes,
  };
}

const make = (meta: Omit<LevelMeta, 'counts'>): LevelMeta => ({ ...meta, counts: counts(meta.layout) });

export const LEVELS: LevelMeta[] = [
  make({
    id: 1,
    sceneKey: 'Level1Scene',
    name: 'FIND YOUR COLOR',
    subtitle: 'Cores e descoberta',
    theme: 'color',
    music: 'level1',
    targetTime: 150,
    layout: level1,
  }),
  make({
    id: 2,
    sceneKey: 'Level2Scene',
    name: 'BUILD YOUR LOOK',
    subtitle: 'Construção do look',
    theme: 'build',
    music: 'level2',
    targetTime: 210,
    layout: level2,
  }),
  make({
    id: 3,
    sceneKey: 'Level3Scene',
    name: 'BE RARE',
    subtitle: 'Expressão e escolha',
    theme: 'rare',
    music: 'level3',
    targetTime: 240,
    layout: level3,
  }),
];

export const getLevel = (id: number): LevelMeta => LEVELS[Math.max(0, Math.min(LEVELS.length - 1, id - 1))]!;
