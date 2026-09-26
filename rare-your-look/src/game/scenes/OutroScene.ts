/**
 * OutroScene — cutscene final (SPEC §22): de volta ao quarto, a Rare Bag
 * na penteadeira, os produtos na mesa e "Now make it yours."
 */
import Phaser from 'phaser';
import { OUTRO } from '../../data/dialogue';
import { PRODUCTS } from '../../data/products';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, displayText } from '../theme';
import { Button } from '../ui/Button';
import { speech } from '../ui/bubble';
import { fadeIn, goTo, onConfirm, spotlight } from '../ui/helpers';
import progress from '../systems/ProgressSystem';
import audio from '../systems/AudioSystem';

const FLOOR = 562;
const VANITY_X = 820;
const TABLE_Y = FLOOR - 150;

export class OutroScene extends Phaser.Scene {
  constructor() {
    super('OutroScene');
  }

  create(): void {
    fadeIn(this, 900);
    audio.playMusic('studio');
    this.add.image(0, 0, 'bedroom').setOrigin(0);

    // Maya sai do espelho
    const glow = this.add.image(VANITY_X, 232, 'spark').setScale(20).setAlpha(0.9).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: glow, alpha: 0, scale: 6, duration: 1600, delay: 300 });
    const maya = this.add.sprite(VANITY_X, 330, 'maya', 'fall').setOrigin(0.5, 1).setScale(0.6).setAlpha(0).setDepth(10);
    this.time.delayedCall(200, () => audio.play('portal'));
    this.tweens.add({
      targets: maya,
      alpha: 1,
      scale: 2.4,
      y: FLOOR,
      x: VANITY_X - 260,
      duration: 1100,
      delay: 300,
      ease: 'Quad.easeIn',
      onComplete: () => {
        maya.play('land');
        audio.play('land');
        this.time.delayedCall(200, () => maya.play('idle'));
      },
    });
    this.time.delayedCall(1700, () => speech(this, VANITY_X - 260, 280, OUTRO.back, 1800));

    // anda até o banquinho e coloca a bolsa na mesa
    this.time.delayedCall(3400, () => {
      maya.play('run');
      this.tweens.add({
        targets: maya,
        x: VANITY_X - 10,
        duration: 1000,
        onComplete: () => {
          maya.play('pick-product');
          maya.setY(FLOOR - 8);
        },
      });
    });
    const bag = this.add.image(VANITY_X + 150, TABLE_Y - 200, 'rarebag').setScale(1.4).setAlpha(0).setDepth(8);
    this.time.delayedCall(4500, () => {
      this.tweens.add({
        targets: bag,
        alpha: 1,
        y: TABLE_Y - 22,
        duration: 500,
        ease: 'Bounce.easeOut',
        onComplete: () => {
          audio.play('land');
          speech(this, VANITY_X - 60, 250, OUTRO.bag, 1800);
        },
      });
    });

    // produtos saltam da bolsa para a mesa
    const collected = PRODUCTS.filter((p) => progress.hasProduct(p.id));
    collected.forEach((p, i) => {
      const x = VANITY_X - 175 + i * 44;
      const icon = this.add.image(bag.x, TABLE_Y - 22, p.icon).setScale(0).setDepth(9);
      this.tweens.add({
        targets: icon,
        x,
        y: TABLE_Y - 24,
        scale: 0.55,
        duration: 480,
        delay: 5400 + i * 130,
        ease: 'Back.easeOut',
        onStart: () => audio.play('palette'),
      });
    });

    // olha no espelho: "Now make it yours."
    this.time.delayedCall(7200, () => {
      maya.play('look-at-mirror');
      audio.play('sparkle');
      spotlight(this, VANITY_X, 330, 320);
    });
    const line = this.add
      .text(VANITY_X, 225, OUTRO.mirror, displayText(34, COLORS.mauve, { fontStyle: 'italic' }))
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(20);
    this.tweens.add({ targets: line, alpha: 1, delay: 8200, duration: 800 });

    const go = (): void => goTo(this, 'DressingRoomScene', undefined, 500, 0xfaf7f5);
    const skip = new Button(this, GAME_WIDTH - 110, 44, 'PULAR ▸▸', go, { width: 170, height: 44, fontSize: 14, variant: 'secondary' });
    skip.setDepth(30);
    this.time.delayedCall(9000, () => {
      const open = new Button(this, GAME_WIDTH / 2, GAME_HEIGHT - 60, 'ABRIR O RARE STUDIO', go, { width: 340 });
      open.setDepth(30).setAlpha(0);
      this.tweens.add({ targets: open, alpha: 1, duration: 300 });
    });
    onConfirm(this, go, 2000);
  }
}
