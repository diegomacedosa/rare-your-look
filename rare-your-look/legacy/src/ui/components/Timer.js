import { formatTime, spokenTime } from '../../utils/format.js';

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Timer circular do HUD (SPEC §4.2 — CENA 5).
 * Anuncia o tempo em marcos (60s, 30s, 10s) em vez de a cada segundo,
 * para não inundar o leitor de tela.
 */
export class TimerView {
  #announced = new Set();

  constructor(container, duration) {
    this.duration = duration;
    container.innerHTML = `
      <div class="timer" data-timer>
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle class="timer__track" cx="32" cy="32" r="${RADIUS}" />
          <circle class="timer__fill" cx="32" cy="32" r="${RADIUS}"
            stroke-dasharray="${CIRCUMFERENCE.toFixed(1)}" stroke-dashoffset="0" />
        </svg>
        <span class="timer__value" data-timer-value>${formatTime(duration)}</span>
        <span class="sr-only" role="timer" data-timer-sr>Tempo restante: ${spokenTime(duration)}</span>
      </div>`;

    this.element = container.querySelector('[data-timer]');
    this.value = container.querySelector('[data-timer-value]');
    this.fill = container.querySelector('.timer__fill');
    this.sr = container.querySelector('[data-timer-sr]');
  }

  update(timeLeft) {
    const ratio = Math.max(0, Math.min(1, timeLeft / this.duration));
    this.value.textContent = formatTime(timeLeft);
    this.fill.setAttribute('stroke-dashoffset', (CIRCUMFERENCE * (1 - ratio)).toFixed(1));
    this.element.classList.toggle('timer--warning', timeLeft <= 15);
    this.element.classList.toggle('timer--critical', timeLeft <= 5);

    for (const mark of [60, 30, 10]) {
      if (timeLeft <= mark && !this.#announced.has(mark) && this.duration > mark) {
        this.#announced.add(mark);
        this.sr.textContent = `Tempo restante: ${spokenTime(mark)}`;
      }
    }
  }
}

export default TimerView;
