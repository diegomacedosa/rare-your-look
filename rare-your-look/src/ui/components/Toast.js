import { esc } from '../../utils/dom.js';
import { icon } from '../icons.js';
import { prefersReducedMotion } from '../transitions.js';

/**
 * Aviso curto e não bloqueante (pontos ganhos, item desbloqueado, dica).
 * O container tem aria-live="polite", então leitores de tela anunciam.
 */
export function toast(message, { variant = 'default', iconName = '', duration = 2600 } = {}) {
  const root = document.getElementById('toast-root');
  if (!root) return;

  const element = document.createElement('div');
  element.className = `toast toast--${variant}`;
  element.innerHTML = `${iconName ? icon(iconName) : ''}<span>${esc(message)}</span>`;
  root.appendChild(element);

  const reduced = prefersReducedMotion();
  if (!reduced) {
    element.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], {
      duration: 220,
      easing: 'cubic-bezier(.22,.61,.36,1)',
    });
  }

  setTimeout(() => {
    if (reduced) {
      element.remove();
      return;
    }
    element
      .animate([{ opacity: 1 }, { opacity: 0, transform: 'translateY(-8px)' }], { duration: 220, fill: 'forwards' })
      .finished.finally(() => element.remove());
  }, duration);
}

export default toast;
