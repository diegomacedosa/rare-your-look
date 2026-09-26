/**
 * GameOverScene — feedback antes de voltar ao checkpoint (feedback da
 * professora, item 4). Sem "Game Over" definitivo (SPEC §17): é uma pausa
 * para respirar, e a Rare Bag continua cheia.
 */
import Phaser from 'phaser';
import { GAME_OVER } from '../../data/dialogue';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, displayText, bodyText, labelText } from '../theme';
import { Button, panel } from '../ui/Button';
import { dim, onConfirm } from '../ui/helpers';
import Inventory from '../systems/InventorySystem';
import progress from '../systems/ProgressSystem';
import type { LevelScene } from './LevelScene';

export class GameOverScene extends Phaser.Scene {
  private levelKey = '';
  private done = false;

  constructor() {
    super('GameOverScene');
  }

  init(data: { levelKey: string }): void {
    this.levelKey = data.levelKey;
    this.done = false;
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const shade = dim(this, 0).setAlpha(0);
    this.tweens.add({ targets: shade, fillAlpha: 0.7, alpha: 1, duration: 400 });

    const card = this.add.container(cx, cy + 30).setAlpha(0);
    const maya = this.add.sprite(-190, 70, 'maya', 'hit').setOrigin(0.5, 1).setScale(1.6);
    card.add([
      panel(this, 0, 0, 700, 360),
      maya,
      this.add.text(70, -120, 'SEM CORAÇÕES', labelText(13, COLORS.rose)).setOrigin(0.5).setLetterSpacing(6),
      this.add.text(70, -80, GAME_OVER.title, displayText(40, COLORS.ink)).setOrigin(0.5),
      this.add.text(70, -14, GAME_OVER.message, bodyText(17, COLORS.muted, { align: 'center', wordWrap: { width: 400 }, lineSpacing: 4 })).setOrigin(0.5),
      this.add
        .text(70, 44, `${GAME_OVER.hint}\nNa Rare Bag: ${Inventory.collected().length} produto(s) · ${progress.state.score} pontos`, bodyText(14, COLORS.mauve, { align: 'center', lineSpacing: 4 }))
        .setOrigin(0.5),
    ]);
    this.tweens.add({ targets: card, alpha: 1, y: cy, duration: 450, ease: 'Quad.easeOut', delay: 150 });
    this.time.delayedCall(900, () => maya.play('idle'));

    // botões aparecem depois de um respiro: dá tempo de ler a mensagem
    this.time.delayedCall(900, () => {
      const retry = new Button(this, cx + 70 - 115, cy + 125, GAME_OVER.button, () => this.retry(), { width: 220, fontSize: 15 });
      const home = new Button(this, cx + 70 + 115, cy + 125, 'TELA INICIAL', () => this.home(), { width: 200, variant: 'secondary', fontSize: 15 });
      for (const b of [retry, home]) {
        b.setAlpha(0);
        this.tweens.add({ targets: b, alpha: 1, duration: 250 });
      }
      onConfirm(this, () => this.retry(), 0);
    });
    this.scene.bringToTop();
  }

  private retry(): void {
    if (this.done) return;
    this.done = true;
    this.scene.stop();
    this.scene.resume(this.levelKey);
    (this.scene.get(this.levelKey) as LevelScene).retry();
  }

  private home(): void {
    progress.registerRetry();
    this.scene.stop('HUDScene');
    this.scene.stop(this.levelKey);
    this.scene.start('MenuScene');
  }
}
