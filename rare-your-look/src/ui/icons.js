/**
 * Ícones SVG inline (traço, 24×24, herdam currentColor).
 * Inline evita requisição extra e permite animar com CSS.
 */
const svg = (paths, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ${extra}>${paths}</svg>`;

export const ICONS = {
  sound: svg('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 9.5a3.5 3.5 0 0 1 0 5"/><path d="M19 6.5a7 7 0 0 1 0 11"/>'),
  mute: svg('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M17 10l4 4M21 10l-4 4"/>'),
  settings: svg('<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.1 5.1l1.9 1.9M17 17l1.9 1.9M18.9 5.1L17 7M7 17l-1.9 1.9"/>'),
  back: svg('<path d="M15 5l-7 7 7 7"/>'),
  home: svg('<path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/>'),
  play: svg('<path d="M7 4.5l12 7.5-12 7.5z" fill="currentColor" stroke-linejoin="round"/>'),
  replay: svg('<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/>'),
  share: svg('<circle cx="17" cy="6" r="2.6"/><circle cx="6" cy="12" r="2.6"/><circle cx="17" cy="18" r="2.6"/><path d="M8.4 10.8l6.2-3.4M8.4 13.2l6.2 3.4"/>'),
  lock: svg('<rect x="4.5" y="10" width="15" height="10" rx="3"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>'),
  check: svg('<path d="M4.5 12.5l5 5 10-11"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  star: svg('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z"/>'),
  sparkle: svg('<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>'),
  clock: svg('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  color: svg('<path d="M12 3.5s6 6.4 6 10.1A6 6 0 0 1 6 13.6C6 9.9 12 3.5 12 3.5z"/>'),
  mood: svg('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14c.9 1.4 2.1 2.1 3.5 2.1s2.6-.7 3.5-2.1"/><path d="M9 9.5h.01M15 9.5h.01"/>'),
  grid: svg('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'),
  medal: svg('<circle cx="12" cy="14" r="6"/><path d="M9 8.5L7 3h10l-2 5.5"/><path d="M12 11.5l1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2L8.8 13.8l2.2-.3z"/>'),
  user: svg('<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4"/>'),
  trophy: svg('<path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M7 5.5H4.5V7a3 3 0 0 0 3 3M17 5.5h2.5V7a3 3 0 0 1-3 3"/><path d="M10 14h4l.7 5.5H9.3z"/>'),
  edit: svg('<path d="M4 20h4l10-10-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
  hint: svg('<path d="M9 17h6"/><path d="M10 20.5h4"/><path d="M12 3.5a6 6 0 0 1 3.6 10.8c-.6.5-.9 1.1-1 1.7H9.4c-.1-.6-.4-1.2-1-1.7A6 6 0 0 1 12 3.5z"/>'),
  arrow_right: svg('<path d="M5 12h13M13 6l6 6-6 6"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  eye: svg('<path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
  palette: svg('<path d="M12 3.5c-4.7 0-8.5 3.6-8.5 8s3.8 8 8.5 8c1.4 0 2.2-.9 2.2-1.9 0-1.6-1.4-1.7-1.4-3 0-1 .8-1.8 1.9-1.8h1.5c2.4 0 4.3-1.9 4.3-4.3 0-3.1-3.6-5-8.5-5z"/><circle cx="8" cy="11" r="1.1" fill="currentColor"/><circle cx="12" cy="8.2" r="1.1" fill="currentColor"/><circle cx="16" cy="10.5" r="1.1" fill="currentColor"/>'),
  heart: svg('<path d="M12 19.5S4 14.8 4 9.8A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 8 2.4c0 5-8 9.7-8 9.7z"/>'),
};

/** Ícone pronto para colar num botão. */
export function icon(name, { className = 'btn__icon' } = {}) {
  return `<span class="${className}" aria-hidden="true">${ICONS[name] ?? ''}</span>`;
}

/** Ícone do tipo de desafio. */
export const TYPE_ICONS = {
  mood: 'mood',
  color: 'color',
  limited: 'grid',
  time: 'clock',
  surprise: 'sparkle',
};
