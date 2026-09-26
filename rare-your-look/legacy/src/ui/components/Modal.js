import { esc, qsa } from '../../utils/dom.js';
import { Button } from './Button.js';
import bus from '../../core/EventBus.js';
import { prefersReducedMotion } from '../transitions.js';

/**
 * Modal acessível: role="dialog", foco preso dentro, Esc fecha,
 * devolve o valor da ação escolhida (ou null se dispensado).
 *
 * @returns {Promise<string|null>}
 */
export function openModal({
  title,
  body = '',
  actions = [{ label: 'Entendi', value: 'ok', variant: 'primary' }],
  dismissible = true,
  size = 'md',
  onMount = null,
} = {}) {
  return new Promise((resolve) => {
    const root = document.getElementById('modal-root');
    const previousFocus = document.activeElement;
    const titleId = `modal-title-${Math.random().toString(36).slice(2, 8)}`;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal modal--${size}" role="dialog" aria-modal="true" aria-labelledby="${titleId}">
        <h2 class="modal__title" id="${titleId}">${esc(title)}</h2>
        <div class="modal__body">${body}</div>
        <div class="modal__actions">
          ${actions.map((action) => Button({ ...action, action: `modal:${action.value}` })).join('')}
        </div>
      </div>`;

    const close = (value) => {
      document.removeEventListener('keydown', onKeyDown, true);
      backdrop.remove();
      bus.emit('modal:close', { value });
      previousFocus?.focus?.();
      resolve(value);
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && dismissible) {
        event.preventDefault();
        close(null);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusables = qsa(backdrop, 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    backdrop.addEventListener('click', (event) => {
      const target = event.target.closest('[data-action^="modal:"]');
      if (target) {
        close(target.dataset.action.slice(6));
        return;
      }
      if (event.target === backdrop && dismissible) close(null);
    });

    document.addEventListener('keydown', onKeyDown, true);
    root.appendChild(backdrop);
    bus.emit('modal:open', { title });
    // permite conteúdo interativo dentro do modal (sliders, toggles…)
    onMount?.(backdrop.querySelector('.modal'), close);

    if (!prefersReducedMotion()) {
      backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, easing: 'ease-out' });
      backdrop.firstElementChild.animate(
        [{ opacity: 0, transform: 'translateY(16px) scale(0.97)' }, { opacity: 1, transform: 'none' }],
        { duration: 240, easing: 'cubic-bezier(.34,1.56,.64,1)' },
      );
    }

    (backdrop.querySelector('.modal__actions button') ?? backdrop.querySelector('.modal')).focus?.();
  });
}

/** Atalho para confirmações simples. */
export function confirmModal({ title, body, confirmLabel = 'Confirmar', cancelLabel = 'Voltar', danger = false }) {
  return openModal({
    title,
    body,
    actions: [
      { label: cancelLabel, value: 'cancel', variant: 'ghost' },
      { label: confirmLabel, value: 'confirm', variant: danger ? 'secondary' : 'primary' },
    ],
  }).then((value) => value === 'confirm');
}

export default openModal;
