import { SFX_MAP, BGM, ASSETS_AVAILABLE } from './sounds.js';
import storage from '../core/StorageManager.js';
import bus, { EVENTS } from '../core/EventBus.js';

/**
 * AudioManager — trilha e efeitos via Web Audio API (SPEC §8).
 *
 * O contexto só é criado depois de um gesto da usuária (política de
 * autoplay dos navegadores). Enquanto não há arquivos de áudio, tudo é
 * sintetizado — inclusive a trilha, que é gerada em loop com quatro acordes.
 */
class AudioManager {
  #ctx = null;
  #master = null;
  #bgmGain = null;
  #sfxGain = null;
  #buffers = new Map();
  #bgm = { playing: false, timer: 0, step: 0, nextTime: 0, delay: null };

  get settings() {
    return storage.settings;
  }

  get ready() {
    return Boolean(this.#ctx);
  }

  /** Cria (ou retoma) o contexto — chamar a partir de um gesto do usuário. */
  unlock() {
    if (!this.#ctx) {
      const Ctx = window.AudioContext ?? window.webkitAudioContext;
      if (!Ctx) return false;
      this.#ctx = new Ctx();
      this.#master = this.#ctx.createGain();
      this.#master.gain.value = this.settings.muted ? 0 : 1;
      this.#master.connect(this.#ctx.destination);

      this.#bgmGain = this.#ctx.createGain();
      this.#bgmGain.gain.value = this.settings.bgmVolume;
      this.#bgmGain.connect(this.#master);

      this.#sfxGain = this.#ctx.createGain();
      this.#sfxGain.gain.value = this.settings.sfxVolume;
      this.#sfxGain.connect(this.#master);

      if (ASSETS_AVAILABLE) this.#preloadFiles();
    }
    if (this.#ctx.state === 'suspended') this.#ctx.resume();
    return true;
  }

  async #preloadFiles() {
    await Promise.all(
      Object.entries(SFX_MAP).map(async ([name, entry]) => {
        if (!entry.src) return;
        try {
          const response = await fetch(entry.src);
          if (!response.ok) return;
          const buffer = await this.#ctx.decodeAudioData(await response.arrayBuffer());
          this.#buffers.set(name, buffer);
        } catch {
          /* segue com o som sintetizado */
        }
      }),
    );
  }

  // ------------------------------------------------------------------ SFX
  playSFX(name) {
    if (!this.#ctx || this.settings.muted) return;
    const entry = SFX_MAP[name];
    if (!entry) return;

    const buffer = this.#buffers.get(name);
    if (buffer) {
      const source = this.#ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.#sfxGain);
      source.start();
      return;
    }
    this.#playSynth(entry.synth);
  }

  #playSynth(recipe) {
    if (!recipe) return;
    const now = this.#ctx.currentTime;
    const { voice, gain = 0.4 } = recipe;

    if (voice === 'blip') {
      this.#tone({ freq: recipe.freq, wave: recipe.wave, start: now, dur: recipe.dur, gain });
    } else if (voice === 'sweep') {
      this.#tone({ freq: recipe.from, to: recipe.to, wave: recipe.wave, start: now, dur: recipe.dur, gain });
    } else if (voice === 'arp') {
      recipe.notes.forEach((freq, index) => {
        this.#tone({
          freq,
          wave: 'triangle',
          start: now + index * recipe.step,
          dur: recipe.dur,
          gain: gain * (1 - index * 0.08),
        });
      });
    }
  }

  /** Voz básica: oscilador + envelope suave (evita clique). */
  #tone({ freq, to = null, wave = 'sine', start, dur = 0.2, gain = 0.4, destination = this.#sfxGain }) {
    const osc = this.#ctx.createOscillator();
    const env = this.#ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, start);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, start + dur);

    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);

    osc.connect(env).connect(destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  // ------------------------------------------------------------------ BGM
  playBGM() {
    if (!this.#ctx || this.#bgm.playing) return;
    this.#bgm.playing = true;
    this.#bgm.step = 0;
    this.#bgm.nextTime = this.#ctx.currentTime + 0.12;

    // um delay curto dá profundidade ao arpejo sem carregar reverb
    const delay = this.#ctx.createDelay(0.6);
    delay.delayTime.value = 0.32;
    const feedback = this.#ctx.createGain();
    feedback.gain.value = 0.26;
    const wet = this.#ctx.createGain();
    wet.gain.value = 0.35;
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(this.#bgmGain);
    this.#bgm.delay = delay;

    this.#bgm.timer = setInterval(() => this.#scheduleBGM(), 90);
    this.#scheduleBGM();
    bus.emit(EVENTS.AUDIO_CHANGED, { bgm: true });
  }

  pauseBGM() {
    clearInterval(this.#bgm.timer);
    this.#bgm.playing = false;
    this.#bgm.delay?.disconnect();
    this.#bgm.delay = null;
    bus.emit(EVENTS.AUDIO_CHANGED, { bgm: false });
  }

  #scheduleBGM() {
    if (!this.#bgm.playing) return;
    const stepDur = 60 / BGM.bpm / 2; // colcheia
    const lookahead = 0.5;

    while (this.#bgm.nextTime < this.#ctx.currentTime + lookahead) {
      const step = this.#bgm.step;
      const bar = Math.floor(step / BGM.stepsPerBar) % BGM.chords.length;
      const chord = BGM.chords[bar];
      const inBar = step % BGM.stepsPerBar;
      const time = this.#bgm.nextTime;

      if (inBar === 0) this.#pad(chord, time, stepDur * BGM.stepsPerBar);
      if (BGM.arpSteps.includes(inBar)) {
        const note = chord[(inBar + bar) % chord.length] * 2;
        this.#tone({ freq: note, wave: 'triangle', start: time, dur: 0.45, gain: 0.1, destination: this.#bgm.delay });
        this.#tone({ freq: note, wave: 'sine', start: time, dur: 0.3, gain: 0.07, destination: this.#bgmGain });
      }

      this.#bgm.nextTime += stepDur;
      this.#bgm.step += 1;
    }
  }

  /** Acorde em colchão, com ataque lento e filtro suave. */
  #pad(chord, start, duration) {
    const filter = this.#ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;
    const env = this.#ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(0.09, start + 0.9);
    env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    filter.connect(env).connect(this.#bgmGain);

    for (const freq of chord) {
      for (const detune of [-4, 4]) {
        const osc = this.#ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.detune.value = detune;
        osc.connect(filter);
        osc.start(start);
        osc.stop(start + duration + 0.2);
      }
    }
  }

  // ------------------------------------------------------------- controles
  setVolume(type, value) {
    const volume = Math.max(0, Math.min(1, value));
    if (type === 'bgm') {
      storage.saveSettings({ bgmVolume: volume });
      if (this.#bgmGain) this.#bgmGain.gain.value = volume;
    } else {
      storage.saveSettings({ sfxVolume: volume });
      if (this.#sfxGain) this.#sfxGain.gain.value = volume;
    }
    bus.emit(EVENTS.AUDIO_CHANGED, { [type]: volume });
  }

  mute(value = true) {
    storage.saveSettings({ muted: value });
    if (this.#master) this.#master.gain.value = value ? 0 : 1;
    if (value) this.pauseBGM();
    else if (this.#ctx) this.playBGM();
    bus.emit(EVENTS.AUDIO_CHANGED, { muted: value });
    return value;
  }

  toggleMute() {
    return this.mute(!this.settings.muted);
  }

  get muted() {
    return this.settings.muted;
  }
}

export const audio = new AudioManager();
export default audio;
