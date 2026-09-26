/**
 * LevelCompleteScene — tela própria de vitória (SPEC §20 + feedback da
 * professora, item 5): fica na tela até a jogadora decidir seguir.
 */
import Phaser from 'phaser';
import { getLevel } from '../../data/levels';
import { productsForStage, secretsForStage } from '../../data/products';
import { LEVEL_WIN } from '../../data/dialogue';
import { COLORS, HEX, GAME_HEIGHT, displayText, bodyText, labelText } from '../theme';
import { Button, panel } from '../ui/Button';
import { brandBackdrop, brandMark, fadeIn, goTo, onConfirm } from '../ui/helpers';
import progress from '../systems/ProgressSystem';
import audio from '../systems/AudioSystem';
import { formatTime, type LevelBonus } from '../systems/ScoreSystem';

export class LevelCompleteScene extends Phaser.Scene {
  private levelId = 1;
  private bonus: LevelBonus = { time: 0, exploration: 0, completion: 0 };

  constructor() {
    super('LevelCompleteScene');
  }

  init(data: { levelId: number; bonus: LevelBonus }): void {
    this.levelId = data.levelId;
    this.bonus = data.bonus;
  }

  create(): void {
    fadeIn(this, 500);
    brandBackdrop(this);
    audio.playMusic('studio');

    const level = this.levelId;
    const meta = getLevel(level);
    const win = LEVEL_WIN[level]!;
    const state = progress.state;

    // Maya comemorando + confete
    const maya = this.add.sprite(230, 560, 'maya', 'celebrate0').setOrigin(0.5, 1).setScale(2.6);
    maya.play('celebrate');
    this.add
      .particles(230, 260, 'petal', {
        speed: { min: 120, max: 320 },
        angle: { min: 200, max: 340 },
        gravityY: 300,
        lifespan: 2400,
        rotate: { min: 0, max: 360 },
        tint: [0xd98e95, 0xf4ddb8, 0xa99bcb, 0xec9275, 0xffffff],
        quantity: 3,
        frequency: 60,
        duration: 1600,
      })
      .setDepth(5);

    const cx = 800;
    brandMark(this, cx, 70, COLORS.rose, 14);
    this.add.text(cx, 116, `LOOK COMPLETE — ${level}/3`, displayText(44, COLORS.ink)).setOrigin(0.5);
    this.add.text(cx, 164, win.title, displayText(24, COLORS.mauve, { fontStyle: 'italic' })).setOrigin(0.5);
    this.add.text(cx, 200, win.message, bodyText(16, COLORS.muted, { align: 'center', wordWrap: { width: 620 } })).setOrigin(0.5);

    // produtos conquistados na fase
    const products = productsForStage(level);
    products.forEach((p, i) => {
      const x = cx + (i - (products.length - 1) / 2) * 110;
      const icon = this.add.image(x, 272, p.icon).setScale(0);
      this.tweens.add({ targets: icon, scale: 0.9, duration: 350, delay: 300 + i * 150, ease: 'Back.easeOut', onStart: () => audio.play('palette') });
      this.add.text(x, 322, p.label.toUpperCase(), labelText(11, COLORS.mauve)).setOrigin(0.5).setLetterSpacing(2);
    });

    // estatísticas
    panel(this, cx, 470, 620, 220, { alpha: 0.92 });
    const secrets = secretsForStage(level);
    const rows: [string, string][] = [
      ['Produtos encontrados', `${products.filter((p) => progress.hasProduct(p.id)).length}/${products.length}`],
      ['Paletas de cores', `${(state.palettes[level] ?? []).length}/${meta.counts.palettes}`],
      ['Itens secretos', `${secrets.filter((s) => progress.hasSecret(s.id)).length}/${secrets.length}`],
      ['Rare Boxes abertas', `${(state.openedBoxes[level] ?? []).length}/${meta.counts.boxes}`],
      ['Tempo', formatTime(state.levelTime[level] ?? 0)],
      ['Bônus (fase + tempo + exploração)', `+${this.bonus.completion + this.bonus.time + this.bonus.exploration}`],
    ];
    rows.forEach(([label, value], i) => {
      const y = 380 + i * 30;
      this.add.text(cx - 280, y, label, bodyText(16, COLORS.muted)).setOrigin(0, 0.5);
      this.add.text(cx + 280, y, value, labelText(17, COLORS.ink)).setOrigin(1, 0.5);
    });
    const line = this.add.graphics();
    line.lineStyle(1, HEX.rose, 0.4);
    line.lineBetween(cx - 280, 558, cx + 280, 558);

    // pontuação da fase com contador animado
    const scoreText = this.add.text(cx, 596, '0', displayText(34, COLORS.mauve)).setOrigin(0.5);
    this.add.text(cx - 280, 596, 'PONTOS DA FASE', labelText(12, COLORS.rose)).setOrigin(0, 0.5).setLetterSpacing(3);
    const target = state.levelScore[level] ?? 0;
    const counter = { v: 0 };
    this.tweens.add({
      targets: counter,
      v: target,
      duration: document.hidden ? 0 : 1200,
      delay: 500,
      ease: 'Cubic.easeOut',
      onUpdate: () => scoreText.setText(String(Math.round(counter.v))),
      onComplete: () => scoreText.setText(String(target)),
    });

    const last = level >= 3;
    const next = (): void => {
      if (last) goTo(this, 'OutroScene');
      else goTo(this, 'TransitionScene', { from: level });
    };
    new Button(this, cx + 130, GAME_HEIGHT - 50, last ? 'IR PARA A PENTEADEIRA' : 'PRÓXIMA FASE', next, { width: 300 });
    new Button(this, cx - 180, GAME_HEIGHT - 50, 'TELA INICIAL', () => goTo(this, 'MenuScene'), { width: 220, variant: 'secondary', fontSize: 15 });
    onConfirm(this, next, 1200);
  }
}

