/**
 * RevealScene — THIS IS YOUR RARE LOOK (SPEC §26).
 * Mostra a Maya com o look escolhido, os produtos usados, o que foi
 * encontrado, a exploração e o tempo — nunca uma nota de beleza.
 */
import Phaser from 'phaser';
import { findShade, PRODUCTS, SECRET_ITEMS } from '../../data/products';
import { SLOGAN } from '../../data/dialogue';
import { COLORS, HEX, displayText, bodyText, labelText } from '../theme';
import { Button, panel } from '../ui/Button';
import { brandBackdrop, brandMark, fadeIn, goTo } from '../ui/helpers';
import { Portrait, MAYA_AVATAR } from '../avatar/portrait';
import { createShareCard, shareLook } from '../avatar/AvatarSystem.js';
import progress from '../systems/ProgressSystem';
import Inventory from '../systems/InventorySystem';
import audio from '../systems/AudioSystem';
import { formatTime } from '../systems/ScoreSystem';

export class RevealScene extends Phaser.Scene {
  private portrait!: Portrait;

  constructor() {
    super('RevealScene');
  }

  create(): void {
    fadeIn(this, 700);
    brandBackdrop(this, true);
    audio.playMusic('studio');

    const exploration = Inventory.exploration();
    if (!progress.state.finished) progress.finishGame(exploration);
    const look = progress.state.selectedMakeup;

    // retrato com cenário, entrando com "zoom" (SPEC §26: câmera aproxima)
    this.portrait = new Portrait(this, 'reveal-portrait', 520, 'bg_studio');
    this.portrait.render(look);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.portrait.destroy());

    const frame = this.add.graphics();
    frame.fillStyle(0xd6ae62, 1);
    frame.fillRoundedRect(92, 60, 416, 590, 28);
    const img = this.add.image(300, 355, 'reveal-portrait').setScale(0.4).setAlpha(0);
    this.tweens.add({ targets: img, scale: 0.75, alpha: 1, duration: 1400, ease: 'Cubic.easeOut' });
    const maya = this.add.sprite(462, 690, 'maya', 'pose').setOrigin(0.5, 1).setScale(1.5);
    maya.play('final-pose');

    // brilhos
    this.add.particles(300, 360, 'star', {
      speed: { min: 60, max: 220 },
      lifespan: 1400,
      scale: { start: 1, end: 0 },
      quantity: 2,
      frequency: 90,
      duration: 1800,
      tint: [0xffffff, 0xf4ddb8, 0xf0d5d8],
    });

    const cx = 900;
    brandMark(this, cx, 58, COLORS.blush, 14);
    const title = this.add.text(cx, 108, 'THIS IS YOUR RARE LOOK', displayText(40, COLORS.white)).setOrigin(0.5).setAlpha(0);
    const sub = this.add.text(cx, 152, SLOGAN, displayText(22, COLORS.blush, { fontStyle: 'italic' })).setOrigin(0.5).setAlpha(0);
    this.tweens.add({ targets: [title, sub], alpha: 1, duration: 900, delay: 700 });

    // produtos usados
    panel(this, cx, 330, 660, 250, { alpha: 0.95 });
    this.add.text(cx - 300, 222, 'PRODUTOS NO SEU LOOK', labelText(12, COLORS.rose)).setLetterSpacing(4);
    const used = Object.values(look)
      .map((id) => (id ? findShade(id) : null))
      .filter((x): x is NonNullable<ReturnType<typeof findShade>> => Boolean(x));
    if (!used.length) {
      this.add.text(cx, 330, 'Pele livre, sem maquiagem — também é um look Rare.', bodyText(17, COLORS.mauve, { fontStyle: 'italic' })).setOrigin(0.5);
    }
    used.slice(0, 8).forEach(({ product, shade }, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = cx - 240 + col * 160;
      const y = 285 + row * 96;
      this.add.image(x - 40, y, product.icon).setScale(0.55);
      this.add.circle(x - 22, y + 22, 7, Phaser.Display.Color.HexStringToColor(shade.color).color).setStrokeStyle(2, 0xffffff);
      this.add.text(x - 10, y - 16, product.label.toUpperCase(), labelText(11, COLORS.ink)).setLetterSpacing(1);
      this.add.text(x - 10, y + 2, shade.name, bodyText(13, COLORS.mauve));
    });

    // números da jornada
    const stats: [string, string][] = [
      ['Produtos', `${progress.state.collectedProducts.length}/${PRODUCTS.length}`],
      ['Itens secretos', `${progress.state.secretItems.length}/${SECRET_ITEMS.length}`],
      ['Exploração', `${exploration}%`],
      ['Tempo total', formatTime(progress.totalTime())],
      ['Pontos', String(progress.state.score)],
    ];
    stats.forEach(([label, value], i) => {
      const x = cx - 264 + i * 132;
      const g = this.add.graphics();
      g.fillStyle(HEX.white, 0.12);
      g.fillRoundedRect(x - 60, 482, 120, 78, 16);
      this.add.text(x, 506, value, displayText(24, COLORS.white)).setOrigin(0.5);
      this.add.text(x, 538, label.toUpperCase(), labelText(10, COLORS.blush)).setOrigin(0.5).setLetterSpacing(1);
    });

    new Button(this, cx - 170, 610, 'JOGAR NOVAMENTE', () => this.playAgain(), { width: 300 });
    new Button(this, cx + 170, 610, 'VER MINHA COLEÇÃO', () => goTo(this, 'CollectionScene', { from: 'RevealScene' }), { width: 300, variant: 'light' });
    const save = new Button(this, cx - 170, 672, 'SALVAR IMAGEM DO LOOK', () => void this.saveImage(save), { width: 300, height: 44, fontSize: 13, variant: 'light' });
    new Button(this, cx + 170, 672, 'TELA INICIAL', () => goTo(this, 'MenuScene'), { width: 300, height: 44, fontSize: 13, variant: 'light', sound: 'ui_back' });
  }

  private async saveImage(button: Button): Promise<void> {
    button.setEnabled(false).setText('GERANDO…');
    try {
      const url = await createShareCard({ avatar: MAYA_AVATAR, look: progress.state.selectedMakeup, title: 'Meu look Rare', subtitle: 'Rare Your Look · Maya' });
      const result = await shareLook(url, 'meu-look-rare.png');
      button.setText(result === 'downloaded' ? 'IMAGEM SALVA ✓' : result === 'shared' ? 'COMPARTILHADO ✓' : 'SALVAR IMAGEM DO LOOK');
    } catch (error) {
      console.warn('[Reveal] não foi possível gerar a imagem', error);
      button.setText('TENTE DE NOVO');
    }
    button.setEnabled(true);
  }

  private playAgain(): void {
    progress.newGame();
    goTo(this, 'IntroScene');
  }
}

