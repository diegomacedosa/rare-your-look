import { formatPoints } from '../../utils/format.js';
import { countUp } from '../transitions.js';

/**
 * Barra de pontuação parcial (HUD do estúdio) e de progresso de nível.
 */
export function ScoreBar({ current = 0, max = 100, label = 'Pontuação parcial', id = 'score-bar' } = {}) {
  const ratio = max ? Math.min(1, current / max) : 0;
  return `
    <div class="score-bar" data-score-bar="${id}">
      <div class="score-bar__head">
        <span class="score-bar__label">${label}</span>
        <span class="score-bar__value">
          <strong data-score-value>${formatPoints(current)}</strong>
          <span class="tiny">/ ${formatPoints(max)}</span>
        </span>
      </div>
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${max}"
           aria-valuenow="${current}" aria-label="${label}">
        <div class="progress__fill" data-score-fill style="width:${(ratio * 100).toFixed(1)}%"></div>
      </div>
    </div>`;
}

export function updateScoreBar(root, current, max, { animate = true } = {}) {
  const wrapper = root.querySelector('[data-score-bar]');
  if (!wrapper) return;
  const valueEl = wrapper.querySelector('[data-score-value]');
  const fill = wrapper.querySelector('[data-score-fill]');
  const bar = wrapper.querySelector('.progress');
  const previous = Number.parseInt(valueEl.dataset.value ?? valueEl.textContent.replace(/\D/g, ''), 10) || 0;

  valueEl.dataset.value = String(current);
  if (animate && previous !== current) {
    countUp(valueEl, { from: previous, to: current, duration: 420, format: (n) => formatPoints(n) });
  } else {
    valueEl.textContent = formatPoints(current);
  }
  fill.style.width = `${(max ? Math.min(1, current / max) : 0) * 100}%`;
  bar.setAttribute('aria-valuenow', String(current));
}

export default ScoreBar;
