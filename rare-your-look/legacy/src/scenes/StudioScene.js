import '../styles/scenes/studio.css';
import gameState, { STATES } from '../core/GameState.js';
import storage from '../core/StorageManager.js';
import audio from '../audio/AudioManager.js';
import bus, { EVENTS } from '../core/EventBus.js';
import { onAction, esc, qsa } from '../utils/dom.js';
import { Button } from '../ui/components/Button.js';
import { ProductCard } from '../ui/components/ProductCard.js';
import { RuleList } from '../ui/components/RuleItem.js';
import { ScoreBar, updateScoreBar } from '../ui/components/ScoreBar.js';
import { TimerView } from '../ui/components/Timer.js';
import { openModal, confirmModal } from '../ui/components/Modal.js';
import { toast } from '../ui/components/Toast.js';
import { icon, TYPE_ICONS } from '../ui/icons.js';
import { AvatarRenderer } from '../systems/AvatarSystem.js';
import { TimerSystem } from '../systems/TimerSystem.js';
import {
  availableProductsFor, evaluate, hintFor, pickSurpriseRule,
} from '../systems/ChallengeSystem.js';
import { scoreLook, maxScore } from '../systems/ScoringSystem.js';
import { commitResult, unlockedRewardIds } from '../systems/RewardSystem.js';
import { getChallenge, CHALLENGE_TYPES, DIFFICULTIES } from '../data/challenges.js';
import { CATEGORIES, SLOTS, getProduct, productName } from '../data/products.js';
import { normalizeAvatar, SCENARIOS_BY_ID } from '../data/avatarOptions.js';
import { prefersReducedMotion } from '../ui/transitions.js';
import { formatPoints } from '../utils/format.js';

/**
 * CENA 5 — StudioScene: o gameplay principal (SPEC §4.2).
 * Clicar num produto aplica no avatar, atualiza o Canvas, revalida as
 * regras ao vivo e recalcula a pontuação parcial.
 */
export default class StudioScene {
  static title = 'Estúdio';

  #raf = 0;

  async mount(root, params = {}) {
    this.root = root;
    const player = storage.player;
    this.challenge = getChallenge(params.challengeId ?? gameState.session.challengeId);
    if (!this.challenge) {
      gameState.go(STATES.CHALLENGE_SELECT);
      return;
    }

    this.avatar = normalizeAvatar(player.avatar);
    this.look = {};
    this.intensity = {};
    this.surpriseRule = null;
    this.finished = false;
    this.filter = 'all';
    this.products = availableProductsFor(this.challenge, unlockedRewardIds(player));

    const challenge = this.challenge;
    const type = CHALLENGE_TYPES[challenge.type];

    root.innerHTML = `
      <div class="studio">
        <section class="studio__stage stage ${SCENARIOS_BY_ID[this.avatar.scenario]?.css ?? 'bg-studio'}">
          <canvas data-avatar></canvas>
        </section>

        <section class="studio__hud">
          <header class="studio__head">
            <div>
              <span class="challenge-card__type">${icon(TYPE_ICONS[challenge.type])}${type.label}</span>
              <h1 class="studio__title" data-autofocus>${esc(challenge.name)}</h1>
            </div>
            <div class="studio__head-right">
              <span class="diff-badge" data-level="${challenge.difficulty}">${DIFFICULTIES[challenge.difficulty].name}</span>
              <div data-timer-slot></div>
            </div>
          </header>

          <div class="studio__rules" data-rules></div>
          <div class="studio__score" data-score>
            ${ScoreBar({ current: 0, max: maxScore(challenge), label: 'Pontuação parcial' })}
          </div>

          <div class="studio__products">
            <div class="tabs" role="tablist" aria-label="Filtrar produtos">
              ${this.#filters().map((filter) => `
                <button type="button" class="tab" role="tab" data-action="filter" data-filter="${filter.id}"
                  aria-selected="${filter.id === this.filter}">${filter.label}</button>`).join('')}
            </div>
            <div class="product-grid" data-grid></div>
          </div>

          <footer class="studio__actions">
            ${Button({ label: 'Confirmar look', action: 'confirm', variant: 'primary', size: 'lg', icon: 'check', shortcut: 'Enter' })}
            ${Button({ label: 'Dica', action: 'hint', variant: 'secondary', icon: 'hint', shortcut: 'H' })}
            ${Button({ label: 'Limpar', action: 'clear', variant: 'ghost', icon: 'replay' })}
            ${Button({ label: 'Sair', action: 'exit', variant: 'ghost', shortcut: 'Esc' })}
          </footer>
        </section>
      </div>`;

    this.canvas = root.querySelector('[data-avatar]');
    this.rulesEl = root.querySelector('[data-rules]');
    this.scoreEl = root.querySelector('[data-score]');
    this.gridEl = root.querySelector('[data-grid]');

    this.renderer = new AvatarRenderer(this.canvas);
    this.#renderAvatar();
    this.#renderGrid();
    this.#renderRules();

    if (challenge.timeLimit) this.#startTimer();
    this.offAction = onAction(root, (action, target) => this.#handle(action, target));
    bus.emit(EVENTS.ANNOUNCE, `Estúdio aberto. ${challenge.name}. ${challenge.rules.length} regras.`);
  }

  #filters() {
    const present = new Set(this.products.map((product) => SLOTS[product.slot].category));
    return [{ id: 'all', label: 'Todos' }, ...CATEGORIES.filter((category) => present.has(category.id))];
  }

  // ------------------------------------------------------------- render
  #renderAvatar() {
    this.renderer.render(this.avatar, this.look, { intensity: this.intensity });
  }

  #renderGrid() {
    const list = this.products.filter(
      (product) => this.filter === 'all' || SLOTS[product.slot].category === this.filter,
    );
    this.gridEl.innerHTML = list
      .map((product) => ProductCard(product, { applied: this.look[product.slot] === product.id }))
      .join('');
  }

  #syncCards() {
    qsa(this.gridEl, '[data-product]').forEach((card) => {
      const applied = this.look[card.dataset.slot] === card.dataset.product;
      card.setAttribute('aria-pressed', String(applied));
      card.classList.remove('product-card--hint', 'anim-pulse');
      card.querySelector('.product-card__state').innerHTML = applied ? icon('check') : '';
    });
  }

  #renderRules() {
    const evaluation = evaluate(this.challenge, this.look, this.surpriseRule);
    this.evaluation = evaluation;
    this.rulesEl.innerHTML = RuleList(evaluation.all, { basePoints: this.challenge.pointsBase });
    return evaluation;
  }

  #updateScore() {
    const result = scoreLook({
      challenge: this.challenge,
      look: this.look,
      surpriseRule: this.surpriseRule,
      timeLeft: this.timer?.timeLeft ?? null,
      timedOut: false,
    });
    updateScoreBar(this.scoreEl, result.total, maxScore(this.challenge));
    return result;
  }

  // -------------------------------------------------------------- timer
  #startTimer() {
    const slot = this.root.querySelector('[data-timer-slot]');
    this.timerView = new TimerView(slot, this.challenge.timeLimit);
    this.timer = new TimerSystem({
      duration: this.challenge.timeLimit,
      warningAt: 15,
      onTick: ({ timeLeft }) => {
        this.timerView.update(timeLeft);
        this.#maybeSurprise();
      },
      onWarning: () => {
        audio.playSFX('timer_warning');
        bus.emit(EVENTS.ANNOUNCE, 'Faltam 15 segundos.');
      },
      onEnd: () => this.#confirm({ timedOut: true }),
    });
    this.timer.start();
  }

  /** Executa algo com o cronômetro pausado (modais não podem custar tempo). */
  async #paused(action) {
    this.timer?.pause();
    const result = await action();
    if (!this.finished) this.timer?.resume();
    return result;
  }

  #maybeSurprise() {
    if (!gameState.session.surprisePending || this.surpriseRule || this.finished) return;
    const at = this.challenge.surprise?.at ?? 0.4;
    const ready = this.challenge.timeLimit
      ? this.timer && this.timer.elapsed >= this.challenge.timeLimit * at
      : Object.keys(this.look).length >= 2;
    if (ready) this.#triggerSurprise();
  }

  async #triggerSurprise() {
    gameState.session.surprisePending = false;
    const rule = pickSurpriseRule(this.challenge, this.products, this.look, Date.now());
    if (!rule) return;

    this.surpriseRule = rule;
    gameState.session.surprise = rule;
    audio.playSFX('surprise');
    this.#renderRules();
    this.#updateScore();
    bus.emit(EVENTS.ANNOUNCE, `Regra surpresa: ${rule.label}`);

    await this.#paused(() =>
      openModal({
        title: 'Regra surpresa!',
        body: `<p class="lead">${esc(rule.label)}</p>
               <p class="tiny">Cumprir esta regra vale +75 pontos. O cronômetro está pausado enquanto você lê.</p>`,
        actions: [{ label: 'Bora', value: 'ok', variant: 'primary' }],
        dismissible: false,
      }));
  }

  // -------------------------------------------------------------- ações
  #handle(action, target) {
    switch (action) {
      case 'toggle-product':
        this.#toggleProduct(target.dataset.product);
        return;
      case 'filter':
        this.filter = target.dataset.filter;
        qsa(this.root, '[data-action="filter"]').forEach((tab) => {
          tab.setAttribute('aria-selected', String(tab.dataset.filter === this.filter));
        });
        this.#renderGrid();
        return;
      case 'clear':
        this.look = {};
        audio.playSFX('menu_open');
        this.#afterLookChange('Look limpo.');
        return;
      case 'hint':
        this.#hint();
        return;
      case 'confirm':
        this.#confirm();
        return;
      case 'exit':
        this.#exit();
        return;
      default:
    }
  }

  #toggleProduct(productId) {
    const product = getProduct(productId);
    if (!product || this.finished) return;
    const slot = product.slot;

    if (this.look[slot] === productId) {
      delete this.look[slot];
      audio.playSFX('product_select');
      this.#afterLookChange(`${productName(product)} removido.`);
      return;
    }

    this.look = { ...this.look, [slot]: productId };
    audio.playSFX('makeup_apply');
    this.#animateSlot(slot);
    this.#afterLookChange(`${productName(product)} aplicado.`);
  }

  /** Anima o produto "entrando" no rosto (intensidade 0 → 1). */
  #animateSlot(slot) {
    if (prefersReducedMotion()) return;
    cancelAnimationFrame(this.#raf);
    this.intensity = {};
    const start = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - start) / 340);
      this.intensity = { [slot]: t };
      this.#renderAvatar();
      if (t < 1) this.#raf = requestAnimationFrame(step);
      else this.intensity = {};
    };
    this.#raf = requestAnimationFrame(step);
  }

  #afterLookChange(message) {
    const before = this.evaluation;
    this.#renderAvatar();
    this.#syncCards();
    const after = this.#renderRules();
    this.#updateScore();
    gameState.session.look = this.look;
    this.#maybeSurprise();

    // anuncia regras que acabaram de ser cumpridas
    const newlyMet = after.all.filter((entry, index) => entry.met && !before?.all?.[index]?.met);
    const suffix = newlyMet.length ? ` Regra cumprida: ${newlyMet.map((entry) => entry.label).join('; ')}.` : '';
    if (newlyMet.length) {
      audio.playSFX('points_earned');
      bus.emit(EVENTS.RULE_MET, { rules: newlyMet });
    }
    bus.emit(EVENTS.ANNOUNCE, `${message}${suffix}`);
  }

  #hint() {
    const hint = hintFor(this.challenge, this.look, this.products, this.surpriseRule);
    if (!hint) {
      toast('Seu look já cumpre todas as regras. Confirme!', { variant: 'success', iconName: 'check' });
      return;
    }
    audio.playSFX('menu_open');

    if (hint.action === 'remove') {
      const product = getProduct(hint.productId);
      toast(`Tente tirar ${product.shade} para caber nas regras.`, { iconName: 'hint' });
      return;
    }

    const product = getProduct(hint.productId);
    this.filter = 'all';
    qsa(this.root, '[data-action="filter"]').forEach((tab) => {
      tab.setAttribute('aria-selected', String(tab.dataset.filter === 'all'));
    });
    this.#renderGrid();
    const card = this.gridEl.querySelector(`[data-product="${hint.productId}"]`);
    if (card) {
      card.classList.add('product-card--hint', 'anim-pulse');
      card.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
    toast(`Que tal ${product.shade}, da linha ${product.line}?`, { iconName: 'hint' });
  }

  async #confirm({ timedOut = false } = {}) {
    if (this.finished) return;
    const evaluation = evaluate(this.challenge, this.look, this.surpriseRule);

    if (!evaluation.mainMet && !timedOut) {
      const proceed = await this.#paused(() =>
        confirmModal({
          title: 'A regra principal ainda não foi cumprida',
          body: `<p>${esc(evaluation.rules[0]?.label ?? '')}</p>
                 <p class="tiny">Sem ela o desafio não conclui e o look não pontua. Quer voltar e ajustar?</p>`,
          confirmLabel: 'Confirmar assim mesmo',
          cancelLabel: 'Voltar ao look',
        }));
      if (!proceed) return;
    }

    this.finished = true;
    this.timer?.stop();

    const result = scoreLook({
      challenge: this.challenge,
      look: this.look,
      surpriseRule: this.surpriseRule,
      timeLeft: this.timer?.timeLeft ?? null,
      timedOut,
    });

    gameState.setLook(this.look);
    gameState.setResult(result);
    const summary = commitResult({ challenge: this.challenge, result });
    gameState.session.summary = summary;

    audio.playSFX(result.passed ? 'challenge_complete' : 'error');
    bus.emit(EVENTS.ANNOUNCE, result.passed
      ? `Desafio concluído com ${formatPoints(result.total)} pontos.`
      : 'Desafio não concluído desta vez.');

    gameState.go(STATES.RESULT, { challengeId: this.challenge.id });
  }

  async #exit() {
    const leave = await this.#paused(() =>
      confirmModal({
        title: 'Sair do desafio?',
        body: '<p class="tiny">O look atual será perdido e nada será pontuado.</p>',
        confirmLabel: 'Sair',
        cancelLabel: 'Continuar',
        danger: true,
      }));
    if (!leave) return;
    this.finished = true;
    this.timer?.stop();
    gameState.resetSession();
    gameState.go(STATES.CHALLENGE_SELECT);
  }

  shortcuts = {
    Enter: () => this.#confirm(),
    h: () => this.#hint(),
    Escape: () => this.#exit(),
  };

  unmount() {
    cancelAnimationFrame(this.#raf);
    this.offAction?.();
    this.timer?.stop();
    this.renderer?.destroy();
  }
}
