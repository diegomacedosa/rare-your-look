/**
 * TransitionScene — cutscene curta entre fases (SPEC §21, ~8 s).
 * Maya abre a Rare Bag, os produtos aparecem, ela percebe o que ainda falta.
 */
import Phaser from 'phaser';
import { TRANSITIONS } from '../../data/dialogue';
import { PRODUCTS } from '../../data/products';
import { getLevel } from '../../data/levels';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, displayText, labelText, bodyText } from '../theme';
import { Button } from '../ui/Button';
import { speech } from '../ui/bubble';
import { brandBackdrop, fadeIn, goTo, onConfirm } from '../ui/helpers';
import progress from '../systems/ProgressSystem';
import audio from '../systems/AudioSystem';

export class TransitionScene extends Phaser.Scene {
  private from = 1;

  constructor() {
    super('TransitionScene');
  }

  init(data: { from: number }): void {
    this.from = data.from;
  }

  create(): void {
    fadeIn(this, 500);
    brandBackdrop(this, this.from >= 2);
    audio.playMusic('studio');

    const next = getLevel(this.from + 1);
    const copy = TRANSITIONS[this.from]!;
    const cx = GAME_WIDTH / 2;
    const dark = this.from >= 2;
    const ink = dark ? COLORS.white : COLORS.ink;

    const maya = this.add.sprite(cx - 330, 600, 'maya', 'idle0').setOrigin(0.5, 1).setScale(2.4);
    maya.play('interact');
    const bag = this.add.image(cx - 250, 470, 'rarebag').setScale(0).setAngle(-10);
    this.tweens.add({ targets: bag, scale: 2.2, angle: 0, duration: 500, delay: 400, ease: 'Back.easeOut', onStart: () => audio.play('whoosh') });

    // produtos saem da bolsa: conquistados em cor, próximos em silhueta
    const shown = PRODUCTS.filter((p) => p.stage <= this.from + 1);
    shown.forEach((p, i) => {
      const has = progress.hasProduct(p.id);
      const x = cx - 80 + i * 92 - Math.max(0, shown.length - 6) * 46;
      const icon = this.add.image(bag.x, bag.y, p.icon).setScale(0);
      if (!has) icon.setTint(dark ? 0x7a4262 : 0xc9b3ad).setAlpha(0.6);
      this.tweens.add({
        targets: icon,
        x,
        y: 420,
        scale: 0.95,
        duration: 520,
        delay: 1000 + i * 160,
        ease: 'Back.easeOut',
        onStart: () => audio.play(has ? 'palette' : 'box_bump'),
      });
      const tag = this.add
        .text(x, 470, has ? p.label.toUpperCase() : '?', labelText(11, has ? (dark ? COLORS.blush : COLORS.mauve) : dark ? '#C9A6B8' : COLORS.muted))
        .setOrigin(0.5)
        .setLetterSpacing(1)
        .setAlpha(0);
      this.tweens.add({ targets: tag, alpha: 1, delay: 1300 + i * 160, duration: 300 });
    });

    this.time.delayedCall(2600, () => {
      maya.play('idle');
      speech(this, cx - 230, 250, copy.line, 0);
    });

    const title = this.add.text(cx, 590, copy.next, displayText(40, ink)).setOrigin(0.5).setAlpha(0);
    const sub = this.add.text(cx, 634, next.subtitle.toUpperCase(), labelText(13, dark ? COLORS.blush : COLORS.rose)).setOrigin(0.5).setLetterSpacing(5).setAlpha(0);
    this.tweens.add({ targets: [title, sub], alpha: 1, delay: 4200, duration: 600 });
    this.add.text(cx, 120, `LOOK ${this.from}/3 COMPLETO`, bodyText(15, dark ? COLORS.blush : COLORS.mauve, { fontStyle: '700' })).setOrigin(0.5).setLetterSpacing(4);

    const go = (): void => goTo(this, next.sceneKey);
    const skip = new Button(this, GAME_WIDTH - 110, 44, 'PULAR ▸▸', go, { width: 170, height: 44, fontSize: 14, variant: dark ? 'light' : 'secondary' });
    skip.setDepth(10);
    this.time.delayedCall(5000, () => {
      const start = new Button(this, cx, GAME_HEIGHT - 36, `COMEÇAR FASE ${next.id}`, go, { width: 300, height: 50 });
      start.setAlpha(0);
      this.tweens.add({ targets: start, alpha: 1, duration: 300 });
    });
    onConfirm(this, go, 1500);
  }
}
