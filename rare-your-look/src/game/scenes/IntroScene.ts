/**
 * IntroScene — cutscene de abertura (SPEC §5), ~18 s, feita com sprites,
 * câmera e tweens (nada de vídeo). Pode ser pulada a qualquer momento.
 *
 * Cena 01 — Maya entra no quarto e olha o celular.
 * Cena 02 — senta na penteadeira; faltam produtos.
 * Cena 03 — o espelho brilha e o quarto vira o universo Rare Your Look.
 * Cena 04 — cartão de missão + COMEÇAR.
 */
import Phaser from 'phaser';
import { INTRO, MISSION_TEXT } from '../../data/dialogue';
import { PRODUCTS } from '../../data/products';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, displayText, bodyText, labelText, HEX } from '../theme';
import { Button, panel } from '../ui/Button';
import { speech } from '../ui/bubble';
import { fadeIn, goTo, onConfirm, brandMark, spotlight } from '../ui/helpers';
import audio from '../systems/AudioSystem';

const FLOOR = 562;
const VANITY_X = 820;

export class IntroScene extends Phaser.Scene {
  private maya!: Phaser.GameObjects.Sprite;
  private skipped = false;
  private skipButton!: Button;

  constructor() {
    super('IntroScene');
  }

  create(): void {
    this.skipped = false;
    this.data.remove('spot');
    fadeIn(this, 700);
    audio.playMusic('studio');
    this.add.image(0, 0, 'bedroom').setOrigin(0);
    this.maya = this.add.sprite(-80, FLOOR, 'maya', 'idle0').setOrigin(0.5, 1).setScale(2.4).setDepth(10);

    this.skipButton = new Button(this, GAME_WIDTH - 110, 44, 'PULAR ▸▸', () => this.showMission(), { width: 170, height: 44, fontSize: 14, variant: 'secondary' });
    this.skipButton.setDepth(100);
    this.input.keyboard?.on('keydown-ESC', () => this.showMission());

    this.timeline();
  }

  private at(seconds: number, fn: () => void): void {
    this.time.delayedCall(seconds * 1000, () => {
      if (!this.skipped) fn();
    });
  }

  private timeline(): void {
    const maya = this.maya;

    // Cena 01 — entrada
    maya.play('run');
    this.tweens.add({ targets: maya, x: 430, duration: 2200, ease: 'Sine.easeOut' });
    this.at(2.2, () => maya.play('idle'));
    this.at(2.6, () => {
      maya.play('interact');
      speech(this, 470, 300, INTRO.clock, 2400);
      audio.play('sign');
    });
    this.at(5.2, () => speech(this, 470, 300, INTRO.thought1, 2000));

    // Cena 02 — penteadeira vazia
    this.at(7.4, () => {
      maya.play('run');
      this.tweens.add({ targets: maya, x: VANITY_X - 10, duration: 1300, ease: 'Sine.easeInOut' });
    });
    this.at(8.8, () => {
      maya.play('sit');
      maya.setY(FLOOR - 8);
      this.data.set('spot', spotlight(this, VANITY_X, 330, 300));
    });
    this.at(9.8, () => {
      // contornos vazios onde os produtos deveriam estar
      [-120, -60, 60, 120].forEach((dx, i) => {
        const ghost = this.add.image(VANITY_X + dx, FLOOR - 160, PRODUCTS[i]!.icon).setScale(0.55).setTint(0xc9b3ad).setAlpha(0);
        this.tweens.add({ targets: ghost, alpha: 0.5, duration: 300, delay: i * 120 });
        this.add.text(VANITY_X + dx, FLOOR - 196, '?', displayText(18, COLORS.mauve)).setOrigin(0.5);
      });
      speech(this, VANITY_X - 150, 250, INTRO.thought2, 2600);
    });

    // Cena 03 — o espelho brilha
    this.at(12.8, () => {
      audio.play('sparkle');
      maya.play('look-at-mirror');
      const glow = this.add.image(VANITY_X, 232, 'spark').setScale(4).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD).setDepth(5);
      this.tweens.add({ targets: glow, alpha: 1, scale: 22, duration: 2400, ease: 'Sine.easeIn' });
      speech(this, VANITY_X - 170, 230, INTRO.thought3, 2200);
      PRODUCTS.forEach((p, i) => {
        const icon = this.add.image(VANITY_X, 232, p.icon).setScale(0.2).setDepth(6);
        const angle = (i / PRODUCTS.length) * Math.PI * 2;
        this.tweens.add({
          targets: icon,
          x: VANITY_X + Math.cos(angle) * 420,
          y: 232 + Math.sin(angle) * 260,
          scale: 0.9,
          angle: 360,
          duration: 1800,
          delay: 400 + i * 90,
          ease: 'Cubic.easeOut',
        });
      });
    });
    this.at(15.4, () => {
      audio.play('portal');
      this.cameras.main.flash(700, 255, 246, 238);
      (this.data.get('spot') as Phaser.GameObjects.Image | undefined)?.destroy();
      // o quarto vira o universo da fase 1
      for (const [key, depth] of [['sky-color', 20], ['far-color', 21], ['mid-color', 22]] as const) {
        const layer = this.add.image(0, 0, key).setOrigin(0).setDepth(depth).setAlpha(0);
        this.tweens.add({ targets: layer, alpha: 1, duration: 900 });
      }
    });
    this.at(16.6, () => this.showMission());
  }

  /** Cena 04 — missão. Também é o destino do botão PULAR. */
  private showMission(): void {
    if (this.skipped) return;
    this.skipped = true;
    this.skipButton.destroy();
    this.tweens.killAll();
    this.cameras.main.resetFX();
    (this.data.get('spot') as Phaser.GameObjects.Image | undefined)?.destroy();
    this.maya.setVisible(false);
    this.children.list
      .filter((obj) => obj instanceof Phaser.GameObjects.Container)
      .forEach((obj) => obj.destroy());

    this.add.image(0, 0, 'sky-color').setOrigin(0).setDepth(20);
    this.add.image(0, 0, 'far-color').setOrigin(0).setDepth(21);
    this.add.image(0, 0, 'mid-color').setOrigin(0).setDepth(22);

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const card = this.add.container(cx, cy + 20).setDepth(30).setAlpha(0);
    card.add([
      panel(this, 0, 0, 780, 500),
      brandMark(this, 0, -210, COLORS.rose, 13),
      this.add.text(0, -172, INTRO.missionTitle, labelText(16, COLORS.mauve)).setOrigin(0.5).setLetterSpacing(10),
      this.add.text(0, -118, INTRO.mission, displayText(28, COLORS.ink, { align: 'center', wordWrap: { width: 660 } })).setOrigin(0.5),
      this.add.text(0, -44, MISSION_TEXT, bodyText(17, COLORS.muted, { align: 'center', wordWrap: { width: 640 }, fontStyle: 'italic' })).setOrigin(0.5),
      this.add.text(0, 30, INTRO.howTo, bodyText(17, COLORS.mauve, { align: 'center', wordWrap: { width: 640 } })).setOrigin(0.5),
    ]);
    // mini-legenda: paleta vs. produto (feedback item 2 — sem confusão entre os coletáveis)
    const legend = this.add.container(0, 104);
    legend.add([
      this.add.image(-200, 0, 'palette'),
      this.add.text(-172, 0, 'Paleta de cores = pontos', bodyText(14, COLORS.ink)).setOrigin(0, 0.5),
      this.add.image(40, 0, 'rarebox').setScale(0.7),
      this.add.text(66, 0, 'Rare Box = produto do look', bodyText(14, COLORS.ink)).setOrigin(0, 0.5),
    ]);
    card.add(legend);
    const line = this.add.graphics();
    line.lineStyle(1, HEX.rose, 0.4);
    line.lineBetween(-300, 140, 300, 140);
    card.add(line);
    card.add(this.add.text(0, 170, 'FASE 1 — FIND YOUR COLOR', displayText(24, COLORS.mauve)).setOrigin(0.5));
    this.tweens.add({ targets: card, alpha: 1, y: cy, duration: 450, ease: 'Quad.easeOut' });

    const start = (): void => goTo(this, 'Level1Scene');
    const button = new Button(this, cx, cy + 290, 'COMEÇAR', start, { width: 280 });
    button.setDepth(40);
    onConfirm(this, start, 600);
  }
}
