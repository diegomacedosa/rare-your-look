/**
 * AudioSystem — efeitos e trilhas via Web Audio API (SPEC §35).
 *
 * Porte em TypeScript do AudioManager da v1: mesmo envelope sem clique,
 * mesmo "delay" de profundidade na trilha e o mesmo cuidado com a política
 * de autoplay (o contexto só nasce no primeiro gesto do jogador).
 * Novidades: várias trilhas (menu, fases, studio), ruído filtrado para
 * impactos e controles separados de Som e Música.
 */
import { SFX, MUSIC, ASSETS_AVAILABLE, type SfxName, type MusicName, type MusicTrack, type Voice, type NoiseVoice } from './sounds';
import { getSettings, saveSettings } from './storage';

type Listener = () => void;

class AudioSystem {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private noiseBuffer: AudioBuffer | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private listeners = new Set<Listener>();

  private track: MusicName | null = null;
  private seq = { timer: 0, step: 0, nextTime: 0, delay: null as DelayNode | null, out: null as GainNode | null };
  /** Últimos disparos — evita empilhar o mesmo efeito no mesmo quadro. */
  private lastPlayed = new Map<SfxName, number>();

  get musicOn(): boolean {
    return getSettings().music;
  }

  get sfxOn(): boolean {
    return getSettings().sfx;
  }

  /** Cria (ou retoma) o contexto — chamar a partir de um gesto do usuário. */
  unlock(): void {
    if (!this.ctx) {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.9;
      this.master.connect(this.ctx.destination);

      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.musicOn ? 0.55 : 0;
      this.musicBus.connect(this.master);

      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.85;
      this.sfxBus.connect(this.master);

      this.noiseBuffer = this.makeNoise();
      if (ASSETS_AVAILABLE) void this.preloadFiles();

      document.addEventListener('visibilitychange', () => {
        if (!this.ctx) return;
        if (document.hidden) void this.ctx.suspend();
        else void this.ctx.resume();
      });

      // se uma trilha foi pedida antes do primeiro gesto, ela começa agora
      if (this.track) {
        const pending = this.track;
        this.track = null;
        this.playMusic(pending);
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  private makeNoise(): AudioBuffer {
    const ctx = this.ctx!;
    const buffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private async preloadFiles(): Promise<void> {
    const ctx = this.ctx!;
    await Promise.all(
      Object.entries(SFX).map(async ([name, recipe]) => {
        try {
          const response = await fetch(recipe.src);
          if (!response.ok) return;
          this.buffers.set(name, await ctx.decodeAudioData(await response.arrayBuffer()));
        } catch {
          /* segue com o som sintetizado */
        }
      }),
    );
  }

  // ------------------------------------------------------------------ SFX
  play(name: SfxName): void {
    if (!this.ctx || !this.sfxOn) return;
    const now = this.ctx.currentTime;
    if (now - (this.lastPlayed.get(name) ?? -1) < 0.03) return;
    this.lastPlayed.set(name, now);

    const buffer = this.buffers.get(name);
    if (buffer) {
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.sfxBus);
      source.start();
      return;
    }

    const recipe: { voices?: Voice[]; noise?: NoiseVoice[] } = SFX[name];
    for (const voice of recipe.voices ?? []) {
      this.tone(voice.freq, now + (voice.at ?? 0), voice.dur, voice.gain ?? 0.3, voice.wave ?? 'sine', this.sfxBus, voice.to);
    }
    for (const noise of recipe.noise ?? []) this.noise(noise, now + (noise.at ?? 0));
  }

  /** Voz básica: oscilador + envelope suave (evita clique). */
  private tone(freq: number, start: number, dur: number, gain: number, wave: OscillatorType, out: AudioNode, to?: number): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, start);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, start + dur);
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(env).connect(out);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  private noise(voice: NoiseVoice, start: number, out: AudioNode = this.sfxBus): void {
    const ctx = this.ctx!;
    if (!this.noiseBuffer) return;
    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.2;
    filter.frequency.setValueAtTime(voice.from, start);
    if (voice.to) filter.frequency.exponentialRampToValueAtTime(voice.to, start + voice.dur);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(voice.gain ?? 0.15, start + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, start + voice.dur);
    source.connect(filter).connect(env).connect(out);
    source.start(start);
    source.stop(start + voice.dur + 0.05);
  }

  // ---------------------------------------------------------------- música
  playMusic(name: MusicName): void {
    if (this.track === name && this.seq.timer) return;
    this.stopMusic();
    this.track = name;
    if (!this.ctx) return; // começa no unlock()

    const ctx = this.ctx;
    const out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, ctx.currentTime);
    out.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 0.8);
    out.connect(this.musicBus);

    // delay curto dá profundidade ao arpejo sem carregar reverb
    const delay = ctx.createDelay(0.8);
    delay.delayTime.value = (60 / MUSIC[name].bpm) * 0.75;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.26;
    const wet = ctx.createGain();
    wet.gain.value = 0.3;
    delay.connect(feedback).connect(delay);
    delay.connect(wet).connect(out);

    this.seq = { timer: 0, step: 0, nextTime: ctx.currentTime + 0.1, delay, out };
    this.seq.timer = window.setInterval(() => this.schedule(), 80);
    this.schedule();
  }

  stopMusic(): void {
    window.clearInterval(this.seq.timer);
    this.seq.timer = 0;
    const { out, delay } = this.seq;
    if (this.ctx && out) {
      const now = this.ctx.currentTime;
      out.gain.cancelScheduledValues(now);
      out.gain.setValueAtTime(Math.max(0.0001, out.gain.value), now);
      out.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      window.setTimeout(() => {
        out.disconnect();
        delay?.disconnect();
      }, 700);
    }
    this.seq.out = null;
    this.seq.delay = null;
  }

  private schedule(): void {
    const ctx = this.ctx;
    const name = this.track;
    const { out, delay } = this.seq;
    if (!ctx || !name || !out || !delay) return;
    const track: MusicTrack = MUSIC[name];
    const stepDur = 60 / track.bpm / 2; // colcheia

    while (this.seq.nextTime < ctx.currentTime + 0.4) {
      const step = this.seq.step;
      const bar = Math.floor(step / 8) % track.chords.length;
      const chord = track.chords[bar]!;
      const inBar = step % 8;
      const time = this.seq.nextTime;

      if (inBar === 0) this.pad(chord, time, stepDur * 8, track.padGain, out);
      if (track.arp.includes(inBar)) {
        const note = chord[(inBar + bar) % chord.length]! * track.octave;
        this.tone(note, time, 0.32, track.arpGain, track.arpWave, delay);
        this.tone(note, time, 0.22, track.arpGain * 0.8, track.arpWave, out);
      }
      if (track.bass && (inBar === 0 || inBar === 3 || inBar === 6)) {
        this.tone(chord[0]! / 2, time, stepDur * 1.6, 0.16, 'triangle', out);
      }
      if (track.hats && inBar % 2 === 1) {
        this.noise({ dur: 0.05, from: 7000, to: 9000, gain: 0.035 }, time, out);
      }

      this.seq.nextTime += stepDur;
      this.seq.step += 1;
    }
  }

  /** Acorde em colchão, com ataque lento e filtro suave. */
  private pad(chord: number[], start: number, duration: number, gain: number, out: AudioNode): void {
    const ctx = this.ctx!;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.9, duration * 0.3));
    env.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    filter.connect(env).connect(out);
    for (const freq of chord) {
      for (const detune of [-4, 4]) {
        const osc = ctx.createOscillator();
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
  setMusic(on: boolean): void {
    saveSettings({ music: on });
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.musicBus.gain.cancelScheduledValues(now);
      this.musicBus.gain.setTargetAtTime(on ? 0.55 : 0, now, 0.08);
    }
    this.emit();
  }

  setSfx(on: boolean): void {
    saveSettings({ sfx: on });
    this.emit();
  }

  toggleMusic(): boolean {
    this.setMusic(!this.musicOn);
    return this.musicOn;
  }

  toggleSfx(): boolean {
    this.setSfx(!this.sfxOn);
    return this.sfxOn;
  }

  onChange(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

export const audio = new AudioSystem();
export default audio;
