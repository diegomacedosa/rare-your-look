/**
 * AvatarSystem — composição do avatar em Canvas (SPEC §7).
 *
 * As 12 camadas do SPEC são pintadas em canvases offscreen e agrupadas em
 * três "grupos" de cache:
 *   base   → pele, corpo, roupas, cabelo de trás, traços do rosto
 *   makeup → as quatro camadas de maquiagem (mudam a cada produto)
 *   top    → cabelo da frente e acessórios
 * Trocar um batom repinta só o grupo `makeup`; trocar o avatar repinta
 * `base` + `top`. É o que mantém a StudioScene fluida a 60fps.
 */
import { W, H, bodyMetrics } from './painters/geometry.js';
import { paintBaseSkin, paintBodyShape, paintClothesBottom, paintClothesTop } from './painters/paintBody.js';
import { paintHairBase, paintHairOverlay } from './painters/paintHair.js';
import {
  paintFaceFeatures, paintMakeupBase, paintMakeupEyes, paintMakeupCheeks, paintMakeupLips,
} from './painters/paintFace.js';
import { paintAccessories } from './painters/paintAccessories.js';
import { getProduct, SLOTS, productName } from '../../data/catalog.js';
import {
  normalizeAvatar, SKIN_TONES_BY_ID, BODY_SHAPES_BY_ID, HAIR_COLORS_BY_ID, HAIR_STYLES_BY_ID,
  EYE_COLORS_BY_ID, TOP_COLORS_BY_ID, TOPS_BY_ID, BOTTOMS_BY_ID, SCENARIOS_BY_ID, ACCESSORY_GROUPS,
} from '../../data/avatarOptions.js';
import { mix, darken } from '../../shared/color.js';

/** Ordem de renderização do SPEC §7 (de baixo para cima). */
export const LAYERS = [
  { id: 'base_skin', group: 'base', paint: paintBaseSkin },
  { id: 'body_shape', group: 'base', paint: paintBodyShape },
  { id: 'clothes_bottom', group: 'base', paint: paintClothesBottom },
  { id: 'clothes_top', group: 'base', paint: paintClothesTop, isolated: true },
  // o "volume de trás" do cabelo entra atrás de tudo que já foi pintado
  { id: 'hair_base', group: 'base', paint: paintHairBase, composite: 'destination-over' },
  { id: 'face_features', group: 'base', paint: paintFaceFeatures },
  { id: 'makeup_base', group: 'makeup', paint: paintMakeupBase },
  { id: 'makeup_eyes', group: 'makeup', paint: paintMakeupEyes },
  { id: 'makeup_cheeks', group: 'makeup', paint: paintMakeupCheeks },
  { id: 'makeup_lips', group: 'makeup', paint: paintMakeupLips },
  { id: 'hair_overlay', group: 'top', paint: paintHairOverlay, isolated: true },
  { id: 'accessories', group: 'top', paint: paintAccessories },
];

export const LAYER_ORDER = LAYERS.map((layer) => layer.id);
const GROUPS = ['base', 'makeup', 'top'];

function createSurface(width, height) {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(width, height);
    return { canvas, ctx: canvas.getContext('2d') };
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return { canvas, ctx: canvas.getContext('2d') };
}

/** Cor de sobrancelha coerente com o cabelo (loiro/colorido não vira sobrancelha rosa). */
function browColorFor(hairHex) {
  return mix(darken(hairHex, 0.2), '#4A3328', 0.42);
}

/** Converte as escolhas do avatar + look em tudo que as camadas precisam. */
export function buildModel(avatarInput, look = {}, options = {}) {
  const avatar = normalizeAvatar(avatarInput);
  const skin = SKIN_TONES_BY_ID[avatar.skinTone] ?? SKIN_TONES_BY_ID.tone3;
  const hairColor = (HAIR_COLORS_BY_ID[avatar.hairColor] ?? HAIR_COLORS_BY_ID.dark_brown).color;
  const makeup = {};
  for (const slot of Object.keys(SLOTS)) makeup[slot] = getProduct(look?.[slot]) ?? null;

  return {
    avatar,
    skin,
    hair: { style: avatar.hairStyle, color: hairColor },
    brow: browColorFor(hairColor),
    eye: (EYE_COLORS_BY_ID[avatar.eyeColor] ?? EYE_COLORS_BY_ID.brown).color,
    metrics: bodyMetrics((BODY_SHAPES_BY_ID[avatar.bodyShape] ?? BODY_SHAPES_BY_ID.medium).shoulders),
    top: { style: avatar.top, color: (TOP_COLORS_BY_ID[avatar.topColor] ?? TOP_COLORS_BY_ID.rose).color },
    bottom: { style: avatar.bottom, color: (BOTTOMS_BY_ID[avatar.bottom] ?? BOTTOMS_BY_ID.jeans).color },
    accessories: avatar.accessories,
    features: avatar.features,
    mobility: avatar.mobility,
    prosthetic: avatar.prosthetic,
    makeup,
    intensity: options.intensity ?? {},
    seed: avatar.seed ?? 7,
  };
}

/** Fundo do cenário (usado na exportação da imagem e nas miniaturas). */
export function paintScenario(ctx, scenarioId, width, height) {
  const scenario = SCENARIOS_BY_ID[scenarioId] ?? SCENARIOS_BY_ID.bg_studio;
  const [a, b] = scenario.colors;
  const gradient = ctx.createLinearGradient(0, 0, width * 0.3, height);
  gradient.addColorStop(0, a);
  gradient.addColorStop(1, b);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width / 2, height * 0.16, 0, width / 2, height * 0.16, width * 0.7);
  glow.addColorStop(0, 'rgba(255,255,255,0.45)');
  glow.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

export class AvatarRenderer {
  #groups = {};
  #scratch = null;
  #keys = { avatar: null, makeup: null };
  #last = null;
  #observer = null;
  #backing = 0;

  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{ maxScale?: number, fixedWidth?: number, background?: string|null }} [options]
   */
  constructor(canvas, { maxScale = 2, fixedWidth = null, background = null } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.maxScale = maxScale;
    this.fixedWidth = fixedWidth;
    this.background = background;
    this.scale = 1;
    this.canvas.setAttribute('role', 'img');
    this.resize();

    if (!fixedWidth && typeof ResizeObserver !== 'undefined') {
      this.#observer = new ResizeObserver(() => this.resize(true));
      this.#observer.observe(canvas);
    }
  }

  /** Ajusta a resolução de todos os canvases ao tamanho real em tela. */
  resize(rerender = false) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssWidth = this.fixedWidth ?? this.canvas.clientWidth ?? 0;
    const target = this.fixedWidth ?? Math.max(160, cssWidth * dpr);
    const scale = Math.min(this.maxScale * (this.fixedWidth ? 1 : 1), target / W);
    const backing = Math.round(W * Math.min(scale, this.maxScale));
    if (backing === this.#backing) return;

    this.#backing = backing;
    this.scale = backing / W;
    const height = Math.round(H * this.scale);

    this.canvas.width = backing;
    this.canvas.height = height;
    for (const group of GROUPS) this.#groups[group] = createSurface(backing, height);
    this.#scratch = createSurface(backing, height);
    this.#keys = { avatar: null, makeup: null };

    if (rerender && this.#last) this.render(this.#last.avatar, this.#last.look, this.#last.options);
  }

  /**
   * Desenha o avatar.
   * @param {object} avatar opções do avatar
   * @param {object} look { slot: productId }
   * @param {{ intensity?: object, background?: string|null, describe?: boolean }} [options]
   */
  render(avatar, look = {}, options = {}) {
    this.#last = { avatar, look, options };
    const model = buildModel(avatar, look, options);
    this.model = model;

    const avatarKey = JSON.stringify(model.avatar);
    const makeupKey = JSON.stringify([look, options.intensity ?? null]);

    if (avatarKey !== this.#keys.avatar) {
      this.#paintGroup('base', model);
      this.#paintGroup('top', model);
      this.#keys.avatar = avatarKey;
    }
    if (makeupKey !== this.#keys.makeup) {
      this.#paintGroup('makeup', model);
      this.#keys.makeup = makeupKey;
    }

    this.#compose(options.background ?? this.background);
    if (options.describe !== false) {
      this.canvas.setAttribute('aria-label', describeAvatar(avatar, look));
    }
    return this;
  }

  #paintGroup(group, model) {
    const { canvas, ctx } = this.#groups[group];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);

    for (const layer of LAYERS) {
      if (layer.group !== group) continue;
      if (layer.isolated || layer.composite) {
        const scratch = this.#scratch;
        scratch.ctx.setTransform(1, 0, 0, 1, 0, 0);
        scratch.ctx.clearRect(0, 0, scratch.canvas.width, scratch.canvas.height);
        scratch.ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
        scratch.ctx.save();
        layer.paint(scratch.ctx, model);
        scratch.ctx.restore();

        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = layer.composite ?? 'source-over';
        ctx.drawImage(scratch.canvas, 0, 0);
        ctx.restore();
      } else {
        ctx.save();
        layer.paint(ctx, model);
        ctx.restore();
      }
    }
  }

  #compose(background) {
    const { ctx, canvas } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const group of GROUPS) ctx.drawImage(this.#groups[group].canvas, 0, 0);
    if (background) {
      ctx.globalCompositeOperation = 'destination-over';
      paintScenario(ctx, background, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
    }
  }

  toDataURL(type = 'image/png') {
    return this.canvas.toDataURL(type);
  }

  destroy() {
    this.#observer?.disconnect();
    this.#observer = null;
    this.#groups = {};
    this.#scratch = null;
  }
}

/** Texto alternativo do canvas (SPEC §10: role="img" + descrição). */
export function describeAvatar(avatarInput, look = {}) {
  const avatar = normalizeAvatar(avatarInput);
  const parts = [];
  parts.push(`Avatar com pele ${(SKIN_TONES_BY_ID[avatar.skinTone]?.label ?? '').toLowerCase()}`);
  parts.push(`cabelo ${(HAIR_STYLES_BY_ID[avatar.hairStyle]?.label ?? '').toLowerCase()} ${(HAIR_COLORS_BY_ID[avatar.hairColor]?.label ?? '').toLowerCase()}`);
  parts.push(`${(TOPS_BY_ID[avatar.top]?.label ?? 'blusa').toLowerCase()} ${(TOP_COLORS_BY_ID[avatar.topColor]?.label ?? '').toLowerCase()}`);

  const features = [];
  if (avatar.features.freckles) features.push('sardas');
  if (avatar.features.vitiligo) features.push('vitiligo');
  if (avatar.features.scar) features.push('cicatriz');
  if (features.length) parts.push(features.join(' e '));

  if (avatar.mobility === 'wheelchair') parts.push('usando cadeira de rodas');
  if (avatar.prosthetic !== 'none') parts.push('com prótese de braço');

  for (const group of ACCESSORY_GROUPS) {
    const value = avatar.accessories[group.id];
    if (!value || value === 'none') continue;
    const label = group.options.find((option) => option.id === value)?.label;
    if (label) parts.push(label.toLowerCase());
  }

  const makeup = Object.entries(look)
    .map(([slot, id]) => {
      const product = getProduct(id);
      return product ? `${SLOTS[slot]?.label ?? slot} ${product.shade}` : null;
    })
    .filter(Boolean);

  const description = `${parts.join(', ')}.`;
  return makeup.length ? `${description} Maquiagem: ${makeup.join(', ')}.` : `${description} Sem maquiagem aplicada.`;
}

/**
 * Cartão compartilhável do look (SPEC §7 — exportação).
 * @returns {Promise<string>} dataURL PNG
 */
export async function createShareCard({ avatar, look = {}, title = 'Meu look Rare', subtitle = '' }) {
  const width = 900;
  const height = 1200;
  const card = document.createElement('canvas');
  card.width = width;
  card.height = height;
  const ctx = card.getContext('2d');

  const scenario = normalizeAvatar(avatar).scenario;
  paintScenario(ctx, scenario, width, height);

  const avatarCanvas = document.createElement('canvas');
  const renderer = new AvatarRenderer(avatarCanvas, { fixedWidth: 700, maxScale: 2 });
  renderer.render(avatar, look, { describe: false });
  ctx.drawImage(avatarCanvas, (width - avatarCanvas.width) / 2, 150, avatarCanvas.width, avatarCanvas.height);
  renderer.destroy();

  try {
    await document.fonts?.ready;
  } catch {
    /* fontes do sistema servem */
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#8A5A62';
  ctx.font = '600 28px "DM Sans", system-ui, sans-serif';
  ctx.letterSpacing = '8px';
  ctx.fillText('RARE BEAUTY', width / 2, 92);
  ctx.letterSpacing = '0px';

  ctx.fillStyle = '#1A1A1A';
  ctx.font = '600 62px "Playfair Display", Georgia, serif';
  ctx.fillText(title, width / 2, 1050);

  if (subtitle) {
    ctx.fillStyle = '#5A5A5A';
    ctx.font = '400 30px "DM Sans", system-ui, sans-serif';
    ctx.fillText(subtitle, width / 2, 1098);
  }

  ctx.fillStyle = '#8A5A62';
  ctx.font = 'italic 400 30px "Playfair Display", Georgia, serif';
  ctx.fillText('There’s no one way to be Rare.', width / 2, 1152);

  return card.toDataURL('image/png');
}

/** Compartilha (mobile) ou baixa (desktop) a imagem do look. */
export async function shareLook(dataUrl, filename = 'rare-your-look.png') {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], filename, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Rare Your Look', text: 'Meu look no Rare Beauty Studio ✨' });
      return 'shared';
    }
  } catch (error) {
    if (error?.name === 'AbortError') return 'cancelled';
    console.warn('[Share] fallback para download', error);
  }
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
  return 'downloaded';
}

export { productName };
