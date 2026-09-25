/**
 * Mapa de efeitos sonoros (SPEC §8).
 *
 * Cada efeito tem um `src` (arquivo final, quando a trilha de áudio for
 * produzida) e uma `synth` — receita tocada pela Web Audio API. Enquanto
 * os assets não existem, o protótipo sintetiza tudo: zero download, zero 404.
 * Basta virar ASSETS_AVAILABLE para true quando os .mp3 entrarem em /public/audio.
 */
export const ASSETS_AVAILABLE = false;

export const SFX_MAP = {
  product_select: {
    src: 'audio/sfx/select.mp3',
    synth: { voice: 'blip', freq: 740, dur: 0.11, wave: 'sine', gain: 0.5 },
  },
  makeup_apply: {
    src: 'audio/sfx/apply.mp3',
    synth: { voice: 'sweep', from: 320, to: 820, dur: 0.24, wave: 'triangle', gain: 0.4 },
  },
  challenge_complete: {
    src: 'audio/sfx/complete.mp3',
    synth: { voice: 'arp', notes: [523.25, 659.25, 783.99, 1046.5], step: 0.08, dur: 0.5, gain: 0.45 },
  },
  points_earned: {
    src: 'audio/sfx/points.mp3',
    synth: { voice: 'arp', notes: [659.25, 783.99, 987.77], step: 0.06, dur: 0.24, gain: 0.35 },
  },
  reward_unlock: {
    src: 'audio/sfx/unlock.mp3',
    synth: { voice: 'arp', notes: [523.25, 659.25, 880, 1174.66], step: 0.09, dur: 0.7, gain: 0.5 },
  },
  level_up: {
    src: 'audio/sfx/levelup.mp3',
    synth: { voice: 'arp', notes: [440, 554.37, 659.25, 880], step: 0.1, dur: 0.8, gain: 0.5 },
  },
  menu_open: {
    src: 'audio/sfx/menu.mp3',
    synth: { voice: 'blip', freq: 480, dur: 0.09, wave: 'sine', gain: 0.32 },
  },
  look_share: {
    src: 'audio/sfx/share.mp3',
    synth: { voice: 'sweep', from: 520, to: 1040, dur: 0.3, wave: 'sine', gain: 0.4 },
  },
  surprise: {
    src: 'audio/sfx/surprise.mp3',
    synth: { voice: 'arp', notes: [880, 1174.66, 987.77, 1318.51], step: 0.07, dur: 0.45, gain: 0.45 },
  },
  timer_warning: {
    src: 'audio/sfx/warning.mp3',
    synth: { voice: 'blip', freq: 330, dur: 0.16, wave: 'triangle', gain: 0.35 },
  },
  error: {
    src: 'audio/sfx/error.mp3',
    synth: { voice: 'blip', freq: 220, dur: 0.18, wave: 'triangle', gain: 0.3 },
  },
};

/**
 * Trilha instrumental (SPEC §8): quatro acordes em loop, tocados ao vivo
 * pela Web Audio API — leve, moderna e sem arquivo para baixar.
 * Am7 → Fmaj7 → Cmaj7 → G
 */
export const BGM = {
  bpm: 84,
  stepsPerBar: 8,
  chords: [
    [220.0, 261.63, 329.63, 392.0],
    [174.61, 261.63, 329.63, 440.0],
    [196.0, 261.63, 329.63, 493.88],
    [196.0, 246.94, 293.66, 392.0],
  ],
  /** Passos (colcheias) em que o arpejo toca. */
  arpSteps: [0, 2, 3, 5, 6],
};
