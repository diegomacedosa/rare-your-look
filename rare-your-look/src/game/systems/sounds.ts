/**
 * Receitas de áudio (SPEC §35).
 *
 * Tudo é sintetizado ao vivo pela Web Audio API — zero download, zero 404 e
 * nenhuma música comercial. Cada efeito tem um `src` reservado: quando os
 * arquivos finais existirem em /public/audio, basta ligar ASSETS_AVAILABLE.
 */

export const ASSETS_AVAILABLE = false;

export type Wave = OscillatorType;

/** Uma nota/voz de um efeito. `at` é o atraso em segundos desde o disparo. */
export interface Voice {
  at?: number;
  freq: number;
  to?: number;
  dur: number;
  wave?: Wave;
  gain?: number;
}

export interface NoiseVoice {
  at?: number;
  dur: number;
  gain?: number;
  /** Filtro passa-banda: frequência inicial → final. */
  from: number;
  to?: number;
}

export interface SfxRecipe {
  src: string;
  voices?: Voice[];
  noise?: NoiseVoice[];
}

const arp = (notes: number[], step: number, dur: number, gain: number, wave: Wave = 'triangle'): Voice[] =>
  notes.map((freq, i) => ({ at: i * step, freq, dur, wave, gain: gain * (1 - i * 0.06) }));

export const SFX = {
  // ---------------------------------------------------------------- interface
  ui_select: { src: 'audio/sfx/select.mp3', voices: [{ freq: 740, dur: 0.1, wave: 'sine', gain: 0.4 }] },
  ui_back: { src: 'audio/sfx/back.mp3', voices: [{ freq: 520, to: 380, dur: 0.12, wave: 'sine', gain: 0.35 }] },
  pause: { src: 'audio/sfx/pause.mp3', voices: arp([660, 440], 0.07, 0.14, 0.3, 'sine') },
  unpause: { src: 'audio/sfx/unpause.mp3', voices: arp([440, 660], 0.07, 0.14, 0.3, 'sine') },

  // ---------------------------------------------------------------- gameplay
  jump: {
    src: 'audio/sfx/jump.mp3',
    voices: [
      { freq: 330, to: 700, dur: 0.16, wave: 'triangle', gain: 0.26 },
      { freq: 660, to: 1400, dur: 0.1, wave: 'sine', gain: 0.08 },
    ],
  },
  land: { src: 'audio/sfx/land.mp3', noise: [{ dur: 0.07, from: 500, to: 180, gain: 0.18 }] },
  palette: { src: 'audio/sfx/palette.mp3', voices: arp([1318.5, 1760], 0.055, 0.14, 0.28, 'sine') },
  rarebox: {
    src: 'audio/sfx/rarebox.mp3',
    voices: [
      { freq: 196, dur: 0.09, wave: 'square', gain: 0.12 },
      ...arp([587.3, 784, 1174.7], 0.05, 0.22, 0.3),
    ],
  },
  box_bump: { src: 'audio/sfx/bump.mp3', voices: [{ freq: 160, to: 120, dur: 0.1, wave: 'triangle', gain: 0.3 }] },
  item_appear: { src: 'audio/sfx/appear.mp3', voices: [{ freq: 400, to: 1200, dur: 0.3, wave: 'sine', gain: 0.25 }] },
  product_found: {
    src: 'audio/sfx/product.mp3',
    voices: [...arp([523.25, 659.25, 783.99, 1046.5, 1318.5], 0.07, 0.4, 0.4), { at: 0.35, freq: 2093, dur: 0.5, wave: 'sine', gain: 0.08 }],
  },
  secret_found: {
    src: 'audio/sfx/secret.mp3',
    voices: arp([880, 1174.66, 987.77, 1318.51, 1760], 0.07, 0.5, 0.4, 'sine'),
  },
  heart: { src: 'audio/sfx/heart.mp3', voices: arp([784, 1046.5, 1568], 0.06, 0.2, 0.3, 'sine') },
  checkpoint: {
    src: 'audio/sfx/checkpoint.mp3',
    voices: [...arp([659.25, 880, 1108.7, 1318.5], 0.09, 0.6, 0.36, 'sine'), { freq: 220, dur: 0.6, wave: 'triangle', gain: 0.1 }],
  },
  damage: {
    src: 'audio/sfx/damage.mp3',
    voices: [{ freq: 520, to: 190, dur: 0.28, wave: 'triangle', gain: 0.34 }],
    noise: [{ dur: 0.14, from: 1800, to: 400, gain: 0.12 }],
  },
  fall: { src: 'audio/sfx/fall.mp3', voices: [{ freq: 700, to: 140, dur: 0.55, wave: 'sine', gain: 0.3 }] },
  game_over: {
    src: 'audio/sfx/gameover.mp3',
    voices: arp([523.25, 440, 349.23, 261.63], 0.18, 0.7, 0.32, 'sine'),
  },
  crumble: { src: 'audio/sfx/crumble.mp3', noise: [{ dur: 0.35, from: 900, to: 160, gain: 0.16 }] },
  portal_locked: {
    src: 'audio/sfx/locked.mp3',
    voices: arp([392, 311.1], 0.1, 0.2, 0.28, 'triangle'),
  },
  portal: {
    src: 'audio/sfx/portal.mp3',
    voices: [
      { freq: 220, to: 1760, dur: 0.9, wave: 'sine', gain: 0.25 },
      { at: 0.05, freq: 330, to: 2640, dur: 0.85, wave: 'triangle', gain: 0.1 },
    ],
    noise: [{ dur: 0.9, from: 400, to: 5000, gain: 0.06 }],
  },
  level_complete: {
    src: 'audio/sfx/complete.mp3',
    voices: [
      ...arp([523.25, 659.25, 783.99, 1046.5], 0.11, 0.35, 0.4),
      ...arp([783.99, 1046.5, 1318.5], 0.11, 0.9, 0.35).map((v) => ({ ...v, at: (v.at ?? 0) + 0.5 })),
    ],
  },
  sign: { src: 'audio/sfx/sign.mp3', voices: arp([880, 1318.5], 0.06, 0.16, 0.22, 'sine') },
  whoosh: { src: 'audio/sfx/whoosh.mp3', noise: [{ dur: 0.45, from: 300, to: 2400, gain: 0.12 }] },
  sparkle: { src: 'audio/sfx/sparkle.mp3', voices: arp([1568, 2093, 2637, 3136], 0.045, 0.25, 0.16, 'sine') },

  // ------------------------------------------------------------- Rare Studio
  product_pick: { src: 'audio/sfx/pick.mp3', voices: [{ freq: 620, to: 880, dur: 0.12, wave: 'sine', gain: 0.32 }] },
  makeup_apply: {
    src: 'audio/sfx/apply.mp3',
    voices: [{ freq: 320, to: 820, dur: 0.24, wave: 'triangle', gain: 0.3 }],
    noise: [{ dur: 0.22, from: 2400, to: 5200, gain: 0.05 }],
  },
  makeup_remove: { src: 'audio/sfx/remove.mp3', voices: [{ freq: 700, to: 300, dur: 0.18, wave: 'sine', gain: 0.25 }] },
  reveal: {
    src: 'audio/sfx/reveal.mp3',
    voices: [
      ...arp([392, 523.25, 659.25, 783.99, 1046.5, 1318.5, 1568], 0.09, 0.9, 0.36, 'sine'),
      { at: 0.1, freq: 196, dur: 1.6, wave: 'triangle', gain: 0.12 },
    ],
  },
} satisfies Record<string, SfxRecipe>;

export type SfxName = keyof typeof SFX;

/** Trilhas instrumentais: acordes em loop tocados pelo sequenciador. */
export interface MusicTrack {
  bpm: number;
  /** Acordes (Hz). Cada acorde dura um compasso de 8 colcheias. */
  chords: number[][];
  /** Colcheias do compasso em que o arpejo toca. */
  arp: number[];
  arpWave: Wave;
  arpGain: number;
  padGain: number;
  bass: boolean;
  hats: boolean;
  /** Multiplicador de oitava do arpejo. */
  octave: number;
}

const Am7 = [220.0, 261.63, 329.63, 392.0];
const Fmaj7 = [174.61, 261.63, 329.63, 440.0];
const Cmaj7 = [196.0, 261.63, 329.63, 493.88];
const G = [196.0, 246.94, 293.66, 392.0];
const Dm7 = [146.83, 220.0, 261.63, 349.23];
const Em7 = [164.81, 246.94, 293.66, 392.0];
const Bb = [233.08, 293.66, 349.23, 466.16];
const Ebmaj7 = [155.56, 233.08, 293.66, 392.0];

export const MUSIC = {
  // Menu: a trilha original da v1 (Am7 → Fmaj7 → Cmaj7 → G)
  menu: { bpm: 84, chords: [Am7, Fmaj7, Cmaj7, G], arp: [0, 2, 3, 5, 6], arpWave: 'triangle', arpGain: 0.1, padGain: 0.09, bass: false, hats: false, octave: 2 },
  // Fase 1: luminosa e leve
  level1: { bpm: 112, chords: [Fmaj7, G, Em7, Am7], arp: [0, 1, 2, 4, 5, 6], arpWave: 'triangle', arpGain: 0.08, padGain: 0.06, bass: true, hats: true, octave: 2 },
  // Fase 2: mais movimento
  level2: { bpm: 120, chords: [Dm7, Bb, Fmaj7, Cmaj7], arp: [0, 1, 2, 3, 4, 5, 6, 7], arpWave: 'square', arpGain: 0.035, padGain: 0.06, bass: true, hats: true, octave: 2 },
  // Fase 3: noite, intensa
  level3: { bpm: 128, chords: [Am7, Ebmaj7, Fmaj7, G], arp: [0, 2, 3, 4, 6, 7], arpWave: 'sawtooth', arpGain: 0.03, padGain: 0.07, bass: true, hats: true, octave: 2 },
  // Cutscenes / Rare Studio: sonhadora e lenta
  studio: { bpm: 76, chords: [Fmaj7, Em7, Dm7, Cmaj7], arp: [0, 3, 5, 6], arpWave: 'sine', arpGain: 0.12, padGain: 0.1, bass: false, hats: false, octave: 2 },
} satisfies Record<string, MusicTrack>;

export type MusicName = keyof typeof MUSIC;
