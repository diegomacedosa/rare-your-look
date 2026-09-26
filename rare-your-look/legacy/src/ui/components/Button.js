import { esc } from '../../utils/dom.js';
import { icon } from '../icons.js';

/**
 * Botão do design system — devolve HTML (as cenas montam por template
 * string e tratam o clique por delegação via `data-action`).
 *
 * @param {object} options
 * @param {string} options.label texto visível
 * @param {string} [options.action] valor de data-action
 * @param {'primary'|'secondary'|'ghost'|'icon'} [options.variant]
 * @param {'sm'|'md'|'lg'} [options.size]
 * @param {string} [options.icon] nome do ícone
 * @param {string} [options.shortcut] tecla de atalho (mostra o kbd e o aria)
 */
export function Button({
  label,
  action = '',
  variant = 'primary',
  size = 'md',
  icon: iconName = '',
  iconAfter = '',
  shortcut = '',
  disabled = false,
  block = false,
  ariaLabel = '',
  dataset = {},
  className = '',
} = {}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    block ? 'btn--block' : '',
    className,
  ].filter(Boolean).join(' ');

  const data = Object.entries(dataset)
    .map(([key, value]) => `data-${key}="${esc(value)}"`)
    .join(' ');

  return `<button type="button" class="${classes}"
    ${action ? `data-action="${esc(action)}"` : ''} ${data}
    ${disabled ? 'disabled' : ''}
    ${ariaLabel ? `aria-label="${esc(ariaLabel)}"` : ''}
    ${shortcut ? `aria-keyshortcuts="${esc(shortcut)}"` : ''}>
    ${iconName ? icon(iconName) : ''}
    <span>${esc(label)}</span>
    ${iconAfter ? icon(iconAfter) : ''}
    ${shortcut ? `<kbd class="btn__kbd">${esc(shortcut)}</kbd>` : ''}
  </button>`;
}

/** Botão só de ícone (sempre com aria-label). */
export function IconButton({ icon: iconName, ariaLabel, action, variant = 'icon', dataset = {}, className = '' }) {
  const data = Object.entries(dataset)
    .map(([key, value]) => `data-${key}="${esc(value)}"`)
    .join(' ');
  return `<button type="button" class="btn btn--${variant} ${className}" data-action="${esc(action)}" ${data}
    aria-label="${esc(ariaLabel)}">${icon(iconName)}</button>`;
}

export default Button;
