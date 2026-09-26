/** MenuScene — tela inicial (RF-01). */
import Phaser from 'phaser';
import { COLORS, GAME_HEIGHT, displayText, bodyText, labelText } from '../theme';
import { Button } from '../ui/Button';
import { brandBackdrop, brandMark, fadeIn, goTo, soundToggles } from '../ui/helpers';
import { PRODUCTS } from '../../data/products';
import { SLOGAN } from '../../data/dialogue';
import { getLevel } from '../../data/levels';
import progress from '../systems/ProgressSystem';
import audio from '../systems/AudioSystem';
import { isTouchDevice } from '../systems/Controls';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    fadeIn(this);
    brandBackdrop(this);
    audio.playMusic('menu');

    const cx = 760;
    brandMark(this, cx, 150, COLORS.mauve, 18);
    this.add.text(cx, 222, 'Rare Your Look', displayText(76, COLORS.ink)).setOrigin(0.5);
    this.add.text(cx, 290, SLOGAN, displayText(24, COLORS.mauve, { fontStyle: 'italic' })).setOrigin(0.5);
    this.add
      .text(cx, 338, 'Atravesse três fases, encontre os produtos da Maya e crie seu look no Rare Studio.', bodyText(17, COLORS.muted))
      .setOrigin(0.5);

    const canContinue = progress.canContinue;
    let y = 420;
    if (canContinue) {
      const lvl = progress.state.currentLevel;
      const where = lvl <= 3 ? `FASE ${lvl} — ${getLevel(lvl).name}` : 'RARE STUDIO';
      new Button(this, cx, y, 'CONTINUAR', () => this.continueGame(), { width: 320 });
      this.add.text(cx, y + 40, where, labelText(12, COLORS.rose)).setOrigin(0.5).setLetterSpacing(2);
      y += 86;
      new Button(this, cx, y, 'NOVO JOGO', () => this.newGame(), { width: 320, variant: 'secondary' });
    } else {
      new Button(this, cx, y, 'JOGAR', () => this.newGame(), { width: 320 });
    }
    y += 70;
    new Button(this, cx, y, 'MINHA COLEÇÃO', () => goTo(this, 'CollectionScene', { from: 'MenuScene' }), { width: 320, variant: 'ghost' });

    soundToggles(this, cx, GAME_HEIGHT - 60);

    const controls = isTouchDevice()
      ? 'Toque nos botões da tela para mover e pular'
      : '← → mover   ·   ESPAÇO pular   ·   E interagir   ·   ESC pausa';
    this.add.text(cx, GAME_HEIGHT - 112, controls, labelText(12, COLORS.mauve)).setOrigin(0.5).setLetterSpacing(1.5).setAlpha(0.8);

    this.showcase();

    // o primeiro gesto libera o áudio (política de autoplay)
    this.input.once('pointerdown', () => audio.unlock());
    this.input.keyboard?.once('keydown', () => audio.unlock());
    this.input.keyboard?.on('keydown-ENTER', () => (canContinue ? this.continueGame() : this.newGame()));
  }

  /** Maya + produtos flutuando: a promessa do jogo em uma imagem. */
  private showcase(): void {
    const x = 250;
    const floor = 560;
    const g = this.add.graphics();
    g.fillStyle(0xd99aa0, 1);
    g.fillRoundedRect(x - 150, floor, 300, 34, 17);
    g.fillStyle(0xf7d9d3, 1);
    g.fillRoundedRect(x - 150, floor, 300, 14, 7);

    const maya = this.add.sprite(x, floor, 'maya', 'idle0').setOrigin(0.5, 1).setScale(2.2);
    maya.play('idle');
    this.time.addEvent({
      delay: 4200,
      loop: true,
      callback: () => {
        maya.play('celebrate');
        this.time.delayedCall(1300, () => maya.play('idle'));
      },
    });

    PRODUCTS.slice(0, 6).forEach((product, i) => {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const px = x + Math.cos(angle) * 170;
      const py = 330 + Math.sin(angle) * 150;
      const icon = this.add.image(px, py, product.icon).setScale(0.9).setAngle(Phaser.Math.Between(-12, 12));
      this.tweens.add({ targets: icon, y: py - 12, duration: 1400 + i * 120, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    });
    const box = this.add.image(x + 150, 520, 'rarebox').setScale(1.1);
    this.tweens.add({ targets: box, y: 510, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private newGame(): void {
    audio.unlock();
    progress.newGame();
    goTo(this, 'IntroScene');
  }

  private continueGame(): void {
    audio.unlock();
    const level = progress.state.currentLevel;
    if (level <= 3) goTo(this, getLevel(level).sceneKey);
    else goTo(this, 'DressingRoomScene');
  }
}

