/**
 * Transições de cena e micro-animações (Web Animations API).
 * Tudo respeita `prefers-reduced-motion` e o toggle manual do jogo.
 */

export function prefersReducedMotion() {
  const manual = document.documentElement.classList.contains('reduce-motion');
  const system = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  return manual || system;
}

function play(el, keyframes, options) {
  if (!el?.animate) return Promise.resolve();
  // Aba escondida: animações não avançam e `finished` nunca resolveria —
  // o jogo ficaria travado na troca de cena. Aplica o estado final direto.
  if (prefersReducedMotion() || document.hidden) {
    const last = keyframes[keyframes.length - 1];
    Object.assign(el.style, { opacity: last.opacity ?? '', transform: '' });
    return Promise.resolve();
  }

  const animation = el.animate(keyframes, { easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both', ...options });
  const duration = options?.duration ?? 250;
  // Rede de segurança: se a animação parar no meio (aba oculta, janela
  // minimizada), seguimos em frente depois do tempo previsto.
  return Promise.race([
    animation.finished.catch(() => {}),
    new Promise((resolve) => {
      setTimeout(() => {
        try {
          animation.finish();
        } catch {
          /* já terminou */
        }
        resolve();
      }, duration + 150);
    }),
  ]);
}

/** Saída da cena atual. */
export function sceneOut(el) {
  return play(el, [
    { opacity: 1, transform: 'translateY(0) scale(1)' },
    { opacity: 0, transform: 'translateY(-10px) scale(0.99)' },
  ], { duration: 180 });
}

/** Entrada da nova cena. */
export function sceneIn(el) {
  return play(el, [
    { opacity: 0, transform: 'translateY(14px)' },
    { opacity: 1, transform: 'translateY(0)' },
  ], { duration: 280 });
}

/** Pulinho de confirmação (botões, cards, pontuação). */
export function pop(el) {
  return play(el, [
    { transform: 'scale(1)' },
    { transform: 'scale(1.08)' },
    { transform: 'scale(1)' },
  ], { duration: 320, easing: 'cubic-bezier(.34,1.56,.64,1)' });
}

/** Chacoalhada curta para feedback de erro/regra não cumprida. */
export function shake(el) {
  return play(el, [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(0)' },
  ], { duration: 280 });
}

/**
 * Conta pontos de forma animada (usada no ResultScene).
 * @param {HTMLElement} el
 * @param {{ from?: number, to: number, duration?: number, format?: (n:number)=>string, onDone?: ()=>void }} opts
 */
export function countUp(el, { from = 0, to, duration = 900, format = (n) => String(Math.round(n)), onDone } = {}) {
  if (!el) return;
  // Aba escondida: rAF não roda, então o número ficaria congelado.
  if (prefersReducedMotion() || duration <= 0 || document.hidden) {
    el.textContent = format(to);
    onDone?.();
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    el.textContent = format(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
    else onDone?.();
  };
  requestAnimationFrame(step);
}

/** Define o índice usado pelo CSS `.anim-stagger` para escalonar a entrada. */
export function stagger(container, selector = ':scope > *') {
  container?.querySelectorAll(selector).forEach((el, i) => {
    el.style.setProperty('--i', String(i));
  });
}
