import bus, { EVENTS } from '../core/EventBus.js';

/**
 * TimerSystem — contagem regressiva dos Time Challenges.
 *
 * Detalhes que importam no protótipo:
 * - usa requestAnimationFrame + performance.now() (SPEC §11);
 * - pausa sozinho quando a aba sai de foco e quando um modal abre
 *   (a regra surpresa não pode consumir o tempo de leitura da jogadora).
 */
export class TimerSystem {
  #raf = 0;
  #startedAt = 0;
  #pausedAt = 0;
  #pausedTotal = 0;
  #lastFrame = 0;
  #lastWholeSecond = -1;
  #running = false;
  #finished = false;

  /**
   * @param {object} options
   * @param {number} options.duration segundos
   * @param {number} [options.warningAt] segundos restantes para alertar
   * @param {(state: {timeLeft:number, progress:number}) => void} [options.onTick]
   * @param {() => void} [options.onEnd]
   */
  constructor({ duration, warningAt = 15, onTick, onWarning, onEnd }) {
    this.duration = duration;
    this.warningAt = warningAt;
    this.onTick = onTick;
    this.onWarning = onWarning;
    this.onEnd = onEnd;
    this.warned = false;
    document.addEventListener('visibilitychange', this.#onVisibility);
  }

  get elapsed() {
    if (!this.#startedAt) return 0;
    const end = this.#running ? performance.now() : this.#pausedAt || performance.now();
    return (end - this.#startedAt - this.#pausedTotal) / 1000;
  }

  get timeLeft() {
    return Math.max(0, this.duration - this.elapsed);
  }

  get progress() {
    return Math.min(1, this.elapsed / this.duration);
  }

  get running() {
    return this.#running;
  }

  start() {
    if (this.#running || this.#finished) return;
    this.#startedAt = performance.now();
    this.#pausedTotal = 0;
    this.#running = true;
    this.#loop();
  }

  pause() {
    if (!this.#running) return;
    this.#running = false;
    this.#pausedAt = performance.now();
    cancelAnimationFrame(this.#raf);
  }

  resume() {
    if (this.#running || this.#finished || !this.#startedAt) return;
    this.#pausedTotal += performance.now() - this.#pausedAt;
    this.#lastFrame = 0; // a pausa já foi contabilizada; não descontar de novo
    this.#running = true;
    this.#loop();
  }

  stop() {
    this.#running = false;
    cancelAnimationFrame(this.#raf);
    document.removeEventListener('visibilitychange', this.#onVisibility);
  }

  #loop = () => {
    if (!this.#running) return;

    // Se o navegador parou de desenhar (janela minimizada/encoberta, aba em
    // segundo plano), o rAF fica sem rodar. O buraco entre dois quadros não
    // pode custar tempo de jogo — então ele entra como pausa.
    const now = performance.now();
    if (this.#lastFrame && now - this.#lastFrame > 900) {
      this.#pausedTotal += now - this.#lastFrame;
    }
    this.#lastFrame = now;

    const timeLeft = this.timeLeft;
    this.onTick?.({ timeLeft, progress: this.progress });

    const whole = Math.ceil(timeLeft);
    if (whole !== this.#lastWholeSecond) {
      this.#lastWholeSecond = whole;
      bus.emit(EVENTS.TIMER_TICK, { timeLeft, progress: this.progress });
    }

    if (!this.warned && timeLeft <= this.warningAt) {
      this.warned = true;
      this.onWarning?.(timeLeft);
      bus.emit(EVENTS.TIMER_WARNING, { timeLeft });
    }

    if (timeLeft <= 0) {
      this.#finished = true;
      this.#running = false;
      bus.emit(EVENTS.TIMER_END, {});
      this.onEnd?.();
      return;
    }
    this.#raf = requestAnimationFrame(this.#loop);
  };

  #onVisibility = () => {
    if (document.hidden) this.pause();
    else this.resume();
  };
}

export default TimerSystem;
