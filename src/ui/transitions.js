/**
 * Transições entre cenas via Web Animations API.
 * Respeita prefers-reduced-motion.
 */
export const reducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const PRESETS = {
  fade: {
    out: [{ opacity: 1 }, { opacity: 0 }],
    in: [{ opacity: 0 }, { opacity: 1 }],
  },
  slide: {
    out: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-12px)' },
    ],
    in: [
      { opacity: 0, transform: 'translateY(18px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ],
  },
  bloom: {
    out: [
      { opacity: 1, transform: 'scale(1)', filter: 'blur(0)' },
      { opacity: 0, transform: 'scale(1.03)', filter: 'blur(6px)' },
    ],
    in: [
      { opacity: 0, transform: 'scale(0.97)', filter: 'blur(6px)' },
      { opacity: 1, transform: 'scale(1)', filter: 'blur(0)' },
    ],
  },
};

export async function swapScenes(root, oldEl, newEl, type = 'slide') {
  const preset = PRESETS[type] || PRESETS.slide;
  const quick = reducedMotion();
  const duration = quick ? 1 : 260;

  if (oldEl) {
    try {
      await oldEl.animate(quick ? PRESETS.fade.out : preset.out, {
        duration,
        easing: 'ease-in',
        fill: 'forwards',
      }).finished;
    } catch {
      /* animação cancelada: segue o fluxo */
    }
    oldEl.remove();
  }

  root.appendChild(newEl);
  root.scrollTop = 0;
  window.scrollTo({ top: 0 });

  newEl.animate(quick ? PRESETS.fade.in : preset.in, {
    duration: quick ? 1 : 380,
    easing: 'cubic-bezier(.2,.8,.2,1)',
  });
}

/** Anima a entrada escalonada dos filhos que tiverem [data-stagger]. */
export function staggerIn(container, selector = '[data-stagger]') {
  if (reducedMotion()) return;
  container.querySelectorAll(selector).forEach((el, i) => {
    el.animate(
      [
        { opacity: 0, transform: 'translateY(14px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      { duration: 420, delay: 60 + i * 55, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' },
    );
  });
}
