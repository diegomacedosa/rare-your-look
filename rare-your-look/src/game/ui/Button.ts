/**
 * Botões e painéis desenhados no canvas (a interface inteira vive no Phaser,
 * então escala junto com o jogo em qualquer tela).
 */
import Phaser from 'phaser';
import { COLORS, HEX, FONT_BODY } from '../theme';
import audio from '../systems/AudioSystem';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'light';

export interface ButtonOptions {
  width?: number;
  height?: number;
  variant?: ButtonVariant;
  fontSize?: number;
  sound?: 'ui_select' | 'ui_back' | 'none';
}

const PALETTE: Record<ButtonVariant, { fill: number; hover: number; text: string; stroke: number; strokeAlpha: number }> = {
  primary: { fill: HEX.mauve, hover: HEX.mauveDark, text: COLORS.white, stroke: HEX.mauveDark, strokeAlpha: 0 },
  secondary: { fill: HEX.white, hover: HEX.blush, text: COLORS.mauve, stroke: HEX.mauve, strokeAlpha: 1 },
  ghost: { fill: 0xffffff, hover: 0xffffff, text: COLORS.mauve, stroke: HEX.rose, strokeAlpha: 0.9 },
  light: { fill: 0xffffff, hover: 0xffffff, text: COLORS.white, stroke: 0xffffff, strokeAlpha: 0.8 },
};

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  readonly label: Phaser.GameObjects.Text;
  private readonly bw: number;
  private readonly bh: number;
  private variant: ButtonVariant;
  private hovered = false;
  enabled = true;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, onClick: () => void, options: ButtonOptions = {}) {
    super(scene, x, y);
    this.bw = options.width ?? Math.max(200, text.length * 12 + 64);
    this.bh = options.height ?? 56;
    this.variant = options.variant ?? 'primary';
    this.bg = scene.add.graphics();
    this.label = scene.add
      .text(0, 1, text, {
        fontFamily: FONT_BODY,
        fontSize: `${options.fontSize ?? 18}px`,
        fontStyle: '700',
        color: PALETTE[this.variant].text,
        align: 'center',
      })
      .setOrigin(0.5)
      .setLetterSpacing(2);
    this.add([this.bg, this.label]);
    this.setSize(this.bw, this.bh);
    this.draw();

    this.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        this.hovered = true;
        this.draw();
      })
      .on('pointerout', () => {
        this.hovered = false;
        this.draw();
        this.setScale(1);
      })
      .on('pointerdown', () => this.setScale(0.96))
      .on('pointerup', () => {
        this.setScale(1);
        if (!this.enabled) return;
        const sound = options.sound ?? 'ui_select';
        audio.unlock();
        if (sound !== 'none') audio.play(sound);
        onClick();
      });
    scene.add.existing(this);
  }

  setVariant(variant: ButtonVariant): this {
    this.variant = variant;
    this.label.setColor(PALETTE[variant].text);
    this.draw();
    return this;
  }

  setText(text: string): this {
    this.label.setText(text);
    return this;
  }

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    this.setAlpha(enabled ? 1 : 0.45);
    return this;
  }

  private draw(): void {
    const p = PALETTE[this.variant];
    const g = this.bg;
    g.clear();
    const fillAlpha = this.variant === 'ghost' || this.variant === 'light' ? (this.hovered ? 0.22 : 0) : 1;
    g.fillStyle(this.hovered ? p.hover : p.fill, fillAlpha);
    g.fillRoundedRect(-this.bw / 2, -this.bh / 2, this.bw, this.bh, this.bh / 2);
    if (p.strokeAlpha > 0) {
      g.lineStyle(2, p.stroke, p.strokeAlpha);
      g.strokeRoundedRect(-this.bw / 2, -this.bh / 2, this.bw, this.bh, this.bh / 2);
    }
  }
}

/** Painel arredondado com sombra quente. */
export function panel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  options: { fill?: number; alpha?: number; radius?: number; stroke?: number; shadow?: boolean } = {},
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics({ x, y });
  const r = options.radius ?? 24;
  if (options.shadow !== false) {
    g.fillStyle(0x8a5a62, 0.18);
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 10, w, h, r);
  }
  g.fillStyle(options.fill ?? HEX.white, options.alpha ?? 1);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, r);
  if (options.stroke !== undefined) {
    g.lineStyle(2, options.stroke, 0.6);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
  }
  return g;
}

/** Botão redondo com ícone de texto (pausa, casa, som). */
export function iconButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  glyph: string,
  onClick: () => void,
  options: { size?: number; fill?: number; color?: string; alpha?: number; label?: string } = {},
): Phaser.GameObjects.Container {
  const size = options.size ?? 48;
  const c = scene.add.container(x, y);
  const bg = scene.add.graphics();
  const draw = (hover: boolean): void => {
    bg.clear();
    bg.fillStyle(options.fill ?? HEX.white, (options.alpha ?? 0.9) * (hover ? 1 : 0.92));
    bg.fillCircle(0, 0, size / 2);
    bg.lineStyle(2, HEX.rose, hover ? 1 : 0.6);
    bg.strokeCircle(0, 0, size / 2);
  };
  draw(false);
  const text = scene.add
    .text(0, 0, glyph, { fontFamily: FONT_BODY, fontSize: `${Math.round(size * 0.42)}px`, fontStyle: '700', color: options.color ?? COLORS.mauve })
    .setOrigin(0.5);
  c.add([bg, text]);
  c.setSize(size, size);
  c.setInteractive({ useHandCursor: true })
    .on('pointerover', () => draw(true))
    .on('pointerout', () => draw(false))
    .on('pointerup', () => {
      audio.unlock();
      audio.play('ui_select');
      onClick();
    });
  c.setData('text', text);
  return c;
}
