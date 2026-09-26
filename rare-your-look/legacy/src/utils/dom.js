/** Helpers de DOM: as cenas montam HTML por template string + delegação de eventos. */

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapa texto vindo do jogador (apelido, por exemplo) antes de injetar no HTML. */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPE_MAP[char]);
}

export const qs = (root, selector) => root.querySelector(selector);
export const qsa = (root, selector) => [...root.querySelectorAll(selector)];

/**
 * Delegação de clique em elementos com `data-action`.
 * @returns {() => void} função para remover o listener no unmount
 */
export function onAction(root, handler) {
  const listener = (event) => {
    const target = event.target.closest('[data-action]');
    if (!target || !root.contains(target)) return;
    handler(target.dataset.action, target, event);
  };
  root.addEventListener('click', listener);
  return () => root.removeEventListener('click', listener);
}

/** Delegação genérica (change, input, etc.). */
export function delegate(root, type, selector, handler) {
  const listener = (event) => {
    const target = event.target.closest(selector);
    if (target && root.contains(target)) handler(event, target);
  };
  root.addEventListener(type, listener);
  return () => root.removeEventListener(type, listener);
}

/** Cria um elemento a partir de HTML. */
export function fromHTML(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}
