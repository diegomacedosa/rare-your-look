import '../styles/scenes/avatar.css';
import gameState, { STATES } from '../core/GameState.js';
import storage from '../core/StorageManager.js';
import audio from '../audio/AudioManager.js';
import bus, { EVENTS } from '../core/EventBus.js';
import { onAction, esc } from '../utils/dom.js';
import { Button } from '../ui/components/Button.js';
import { toast } from '../ui/components/Toast.js';
import { icon } from '../ui/icons.js';
import { AvatarRenderer } from '../systems/AvatarSystem.js';
import { unlockedRewardIds } from '../systems/RewardSystem.js';
import { nextChallengeFor } from '../systems/ChallengeSystem.js';
import { getReward } from '../data/rewards.js';
import {
  SKIN_TONES, BODY_SHAPES, HAIR_STYLES, HAIR_COLORS, EYE_COLORS, TOPS, TOP_COLORS, BOTTOMS,
  ACCESSORY_GROUPS, FEATURES, MOBILITY_OPTIONS, PROSTHETIC_OPTIONS, MAKEUP_PRESETS, SCENARIOS,
  SCENARIOS_BY_ID, normalizeAvatar, signatureLook,
} from '../data/avatarOptions.js';
import { createRng } from '../utils/random.js';

const TABS = [
  { id: 'skin', label: 'Pele' },
  { id: 'face', label: 'Rosto' },
  { id: 'hair', label: 'Cabelo' },
  { id: 'style', label: 'Penteado' },
  { id: 'makeup', label: 'Maquiagem' },
  { id: 'clothes', label: 'Roupas' },
  { id: 'accessories', label: 'Acessórios' },
  { id: 'body', label: 'Corpo' },
  { id: 'scenario', label: 'Cenário' },
];

/**
 * CENA 2 — AvatarScene (SPEC §4.2).
 * Todas as opções de representação (pele, corpo, cadeira de rodas,
 * próteses, vitiligo…) são livres desde o começo; só itens cosméticos
 * extras vêm do sistema de recompensas.
 */
export default class AvatarScene {
  static title = 'Meu avatar';

  async mount(root, params = {}) {
    this.root = root;
    this.params = params;
    this.avatar = normalizeAvatar(storage.player.avatar);
    this.unlocked = unlockedRewardIds();
    this.tab = 'skin';

    root.innerHTML = `
      <div class="scene__head">
        <div>
          <p class="eyebrow">Passo 1</p>
          <h1 data-autofocus>Crie seu avatar</h1>
          <p class="lead">Não existe um jeito certo de ser Rare — escolha o que parece com você.</p>
        </div>
        ${Button({ label: 'Surpreenda-me', action: 'random', variant: 'ghost', icon: 'sparkle', size: 'sm' })}
      </div>

      <div class="avatar-layout">
        <section class="avatar-stage stage ${SCENARIOS_BY_ID[this.avatar.scenario]?.css ?? 'bg-studio'}" data-stage>
          <canvas data-avatar></canvas>
        </section>

        <section class="avatar-panel panel">
          <div class="tabs" role="tablist" aria-label="Categorias de customização" data-tabs>
            ${TABS.map((tab) => `
              <button type="button" class="tab" role="tab" data-action="tab" data-tab="${tab.id}"
                aria-selected="${tab.id === this.tab}">${tab.label}</button>`).join('')}
          </div>
          <div class="avatar-options" role="tabpanel" data-options></div>
        </section>
      </div>

      <div class="avatar-actions cluster">
        ${Button({ label: 'Salvar e continuar', action: 'save', variant: 'primary', icon: 'check', shortcut: 'S' })}
        ${Button({ label: 'Voltar ao menu', action: 'menu', variant: 'ghost' })}
      </div>`;

    this.canvas = root.querySelector('[data-avatar]');
    this.stage = root.querySelector('[data-stage]');
    this.optionsEl = root.querySelector('[data-options]');
    this.renderer = new AvatarRenderer(this.canvas);

    this.#renderOptions();
    this.#renderAvatar();
    this.offAction = onAction(root, (action, target) => this.#handle(action, target));
  }

  #renderAvatar() {
    this.renderer.render(this.avatar, signatureLook(this.avatar));
    this.stage.className = `avatar-stage stage ${SCENARIOS_BY_ID[this.avatar.scenario]?.css ?? 'bg-studio'}`;
  }

  // --------------------------------------------------------------- opções
  #isUnlocked(option) {
    return !option.unlockId || this.unlocked.includes(option.unlockId);
  }

  #tile(option, { group, value, selected, swatchColor = null }) {
    const locked = !this.#isUnlocked(option);
    const common = `data-action="set" data-group="${esc(group)}" data-value="${esc(value)}"
      aria-pressed="${selected}" ${locked ? 'data-locked="true" aria-disabled="true"' : ''}`;

    if (swatchColor) {
      return `<button type="button" class="swatch-btn" style="--sw:${swatchColor}" ${common}
        aria-label="${esc(option.label)}${locked ? ' (bloqueado)' : ''}" title="${esc(option.label)}">
        ${locked ? `<span class="swatch-btn__lock">${icon('lock', { className: '' })}</span>` : ''}
      </button>`;
    }

    return `<button type="button" class="option-tile" ${common}>
      ${esc(option.label)}
      ${locked ? `<span class="option-tile__lock">${icon('lock', { className: '' })}</span>` : ''}
    </button>`;
  }

  #group(title, content, hint = '') {
    return `<div class="avatar-group">
      <h2 class="avatar-group__title">${esc(title)}</h2>
      ${hint ? `<p class="tiny">${esc(hint)}</p>` : ''}
      ${content}
    </div>`;
  }

  #renderOptions() {
    const a = this.avatar;
    const swatches = (list, group, current) =>
      `<div class="swatch-grid">${list.map((option) => this.#tile(option, {
        group, value: option.id, selected: current === option.id, swatchColor: option.color ?? option.base,
      })).join('')}</div>`;
    const tiles = (list, group, current) =>
      `<div class="option-grid">${list.map((option) => this.#tile(option, {
        group, value: option.id, selected: current === option.id,
      })).join('')}</div>`;

    const panels = {
      skin: () => this.#group('Tom de pele', swatches(SKIN_TONES, 'skinTone', a.skinTone))
        + this.#group('Características', `<div class="option-grid">${FEATURES.map((feature) => `
            <button type="button" class="option-tile" data-action="toggle-feature" data-value="${feature.id}"
              aria-pressed="${Boolean(a.features[feature.id])}">${esc(feature.label)}</button>`).join('')}</div>`,
          'Sardas, vitiligo, cicatrizes e pintas fazem parte do rosto — não são “defeitos” a corrigir.'),

      face: () => this.#group('Cor dos olhos', swatches(EYE_COLORS, 'eyeColor', a.eyeColor)),

      hair: () => this.#group('Cor do cabelo', swatches(HAIR_COLORS, 'hairColor', a.hairColor),
        a.hairStyle === 'hijab' ? 'Com hijab, esta cor define o tecido.' : ''),

      style: () => this.#group('Penteado', tiles(HAIR_STYLES, 'hairStyle', a.hairStyle)),

      makeup: () => this.#group('Maquiagem do dia a dia', tiles(MAKEUP_PRESETS, 'makeup', a.makeup),
        'Nos desafios você começa com o rosto limpo — aqui é o look que fica no seu perfil.'),

      clothes: () => this.#group('Parte de cima', tiles(TOPS, 'top', a.top))
        + this.#group('Cor', swatches(TOP_COLORS, 'topColor', a.topColor))
        + this.#group('Parte de baixo', tiles(BOTTOMS, 'bottom', a.bottom)),

      accessories: () => ACCESSORY_GROUPS.map((group) =>
        this.#group(group.label, tiles(group.options, `accessories.${group.id}`, a.accessories[group.id]))).join(''),

      body: () => this.#group('Corpo', tiles(BODY_SHAPES, 'bodyShape', a.bodyShape))
        + this.#group('Mobilidade', tiles(MOBILITY_OPTIONS, 'mobility', a.mobility))
        + this.#group('Prótese', tiles(PROSTHETIC_OPTIONS, 'prosthetic', a.prosthetic)),

      scenario: () => this.#group('Cenário do estúdio', tiles(SCENARIOS, 'scenario', a.scenario)),
    };

    this.optionsEl.innerHTML = panels[this.tab]();
  }

  // --------------------------------------------------------------- ações
  #handle(action, target) {
    switch (action) {
      case 'tab': {
        this.tab = target.dataset.tab;
        this.root.querySelectorAll('[data-action="tab"]').forEach((tab) => {
          tab.setAttribute('aria-selected', String(tab.dataset.tab === this.tab));
        });
        this.#renderOptions();
        audio.playSFX('menu_open');
        return;
      }
      case 'set': {
        if (target.dataset.locked) {
          this.#explainLock(target);
          return;
        }
        const { group, value } = target.dataset;
        if (group.startsWith('accessories.')) {
          this.avatar.accessories = { ...this.avatar.accessories, [group.split('.')[1]]: value };
        } else {
          this.avatar[group] = value;
        }
        audio.playSFX('product_select');
        this.#renderOptions();
        this.#renderAvatar();
        return;
      }
      case 'toggle-feature': {
        const id = target.dataset.value;
        this.avatar.features = { ...this.avatar.features, [id]: !this.avatar.features[id] };
        audio.playSFX('product_select');
        this.#renderOptions();
        this.#renderAvatar();
        return;
      }
      case 'random':
        this.#randomize();
        return;
      case 'save':
        this.#save();
        return;
      case 'menu':
        gameState.go(STATES.WELCOME);
        return;
      default:
    }
  }

  #explainLock(target) {
    const option = [...HAIR_COLORS, ...TOPS, ...TOP_COLORS, ...SCENARIOS, ...ACCESSORY_GROUPS.flatMap((g) => g.options)]
      .find((item) => item.id === target.dataset.value && item.unlockId);
    const reward = option ? getReward(option.unlockId) : null;
    const hint = reward?.unlock?.points != null
      ? `Desbloqueia com ${reward.unlock.points} pontos.`
      : 'Desbloqueia concluindo desafios.';
    audio.playSFX('error');
    toast(`Item bloqueado — ${hint}`, { iconName: 'lock' });
  }

  #randomize() {
    const rng = createRng(Date.now() % 100000);
    const pickFrom = (list) => {
      const open = list.filter((option) => this.#isUnlocked(option));
      return open[Math.floor(rng() * open.length)].id;
    };
    this.avatar = {
      ...this.avatar,
      skinTone: pickFrom(SKIN_TONES),
      bodyShape: pickFrom(BODY_SHAPES),
      hairStyle: pickFrom(HAIR_STYLES),
      hairColor: pickFrom(HAIR_COLORS),
      eyeColor: pickFrom(EYE_COLORS),
      top: pickFrom(TOPS),
      topColor: pickFrom(TOP_COLORS),
      bottom: pickFrom(BOTTOMS),
      makeup: pickFrom(MAKEUP_PRESETS),
      accessories: Object.fromEntries(ACCESSORY_GROUPS.map((group) => [group.id, pickFrom(group.options)])),
      seed: Math.floor(rng() * 999),
    };
    audio.playSFX('makeup_apply');
    this.#renderOptions();
    this.#renderAvatar();
    bus.emit(EVENTS.ANNOUNCE, 'Avatar sorteado.');
  }

  #save() {
    storage.update((player) => {
      player.avatar = this.avatar;
    });
    audio.playSFX('challenge_complete');
    toast('Avatar salvo!', { variant: 'success', iconName: 'check' });
    bus.emit(EVENTS.ANNOUNCE, 'Avatar salvo.');

    if (this.params.next === 'play') {
      const challenge = nextChallengeFor(storage.player);
      gameState.go(STATES.CHALLENGE_INFO, { challengeId: challenge.id });
      return;
    }
    gameState.go(this.params.from === 'profile' ? STATES.PROFILE : STATES.WELCOME);
  }

  shortcuts = {
    s: () => this.#handle('save'),
    Escape: () => gameState.go(STATES.WELCOME),
  };

  unmount() {
    this.offAction?.();
    this.renderer?.destroy();
  }
}
