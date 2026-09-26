/**
 * HUDScene — só o essencial durante o gameplay (SPEC §19):
 * Rare Bag à esquerda, fase ao centro, corações à direita.
 * Também mostra mensagens, itens encontrados, dicas e os controles touch.
 */
import Phaser from 'phaser';
import { getLevel } from '../../data/levels';
import { COLORS, HEX, GAME_WIDTH, GAME_HEIGHT, FONT_BODY, displayText, bodyText, labelText } from '../theme';
import { hudBus, type ItemFoundEvent } from '../systems/hudBus';
import progress, { MAX_LIVES } from '../systems/ProgressSystem';
import Inventory from '../systems/InventorySystem';
import { touch, isTouchDevice } from '../systems/Controls';
import { formatTime } from '../systems/ScoreSystem';
import { iconButton, panel } from '../ui/Button';
import type { LevelScene } from './LevelScene';

interface TouchButton {
  key: keyof typeof touch;
  x: number;
  y: number;
  r: number;
  gfx: Phaser.GameObjects.Container;
}

const BAG = { x: 52, y: 48 };

export class HUDScene extends Phaser.Scene {
  private levelId = 1;
  private levelKey = 'Level1Scene';
  private bagDots: Phaser.GameObjects.Image[] = [];
  private bagText!: Phaser.GameObjects.Text;
  private paletteText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private hearts: Phaser.GameObjects.Image[] = [];
  private bagIcon!: Phaser.GameObjects.Image;
  private tutorial!: Phaser.GameObjects.Container;
  private message!: Phaser.GameObjects.Container;
  private tip!: Phaser.GameObjects.Container;
  private itemQueue: ItemFoundEvent[] = [];
  private showingItem = false;
  private touchButtons: TouchButton[] = [];
  private interactButton: TouchButton | null = null;
  private shownLives = MAX_LIVES;

  constructor() {
    super('HUDScene');
  }

  init(data: { levelId: number; levelKey: string }): void {
    this.levelId = data.levelId;
    this.levelKey = data.levelKey;
    this.bagDots = [];
    this.hearts = [];
    this.itemQueue = [];
    this.showingItem = false;
    this.touchButtons = [];
    this.interactButton = null;
    this.shownLives = MAX_LIVES;
  }

  private get level(): LevelScene {
    return this.scene.get(this.levelKey) as LevelScene;
  }

  create(): void {
    const meta = getLevel(this.levelId);

    // ---------------- Rare Bag (topo esquerdo)
    panel(this, 190, 48, 330, 72, { alpha: 0.9, radius: 36, shadow: false });
    this.bagIcon = this.add.image(BAG.x, BAG.y, 'rarebag').setScale(1.05);
    this.add.text(88, 22, 'RARE BAG', labelText(11, COLORS.mauve)).setLetterSpacing(3);
    const bag = Inventory.levelBag(this.levelId);
    bag.forEach((slot, i) => {
      const dot = this.add.image(100 + i * 40, 58, slot.product.icon).setScale(0.42);
      this.bagDots.push(dot);
    });
    this.bagText = this.add.text(100 + bag.length * 40 - 4, 58, '', displayText(22, COLORS.ink)).setOrigin(0, 0.5);
    this.paletteText = this.add.text(30, 96, '', labelText(13, COLORS.white, { stroke: '#8A5A62', strokeThickness: 4 })).setLetterSpacing(1);
    this.scoreText = this.add.text(190, 96, '', labelText(13, COLORS.white, { stroke: '#8A5A62', strokeThickness: 4 })).setLetterSpacing(1);

    // ---------------- fase (topo central) com a marca
    panel(this, GAME_WIDTH / 2, 44, 330, 64, { alpha: 0.9, radius: 32, shadow: false });
    this.add.text(GAME_WIDTH / 2, 28, `RARE BEAUTY · FASE ${this.levelId}`, labelText(11, COLORS.rose)).setOrigin(0.5).setLetterSpacing(4);
    this.add.text(GAME_WIDTH / 2, 54, meta.name, displayText(22, COLORS.ink)).setOrigin(0.5);
    this.timeText = this.add.text(GAME_WIDTH / 2, 92, '', labelText(12, COLORS.white, { stroke: '#8A5A62', strokeThickness: 4 })).setOrigin(0.5).setLetterSpacing(2);

    // ---------------- corações (topo direito) + pausa + início
    for (let i = 0; i < MAX_LIVES; i++) this.hearts.push(this.add.image(GAME_WIDTH - 250 + i * 38, 46, 'heart').setScale(1.1));
    iconButton(this, GAME_WIDTH - 110, 46, 'II', () => this.level.openPause('pause'), { size: 50 });
    // feedback item 3: botão de voltar para a tela inicial sempre à mão
    iconButton(this, GAME_WIDTH - 50, 46, '⌂', () => this.level.openPause('home'), { size: 50 });

    // ---------------- faixas de mensagem
    this.tutorial = this.add.container(GAME_WIDTH / 2, 160).setAlpha(0).setDepth(10);
    this.message = this.add.container(GAME_WIDTH / 2, 218).setAlpha(0).setDepth(10);
    this.tip = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 110).setAlpha(0).setDepth(12);

    if (isTouchDevice()) this.buildTouchControls();

    hudBus.listen('refresh', this.refresh, this);
    hudBus.listen('message', this.showMessage, this);
    hudBus.listen('tutorial', this.showTutorial, this);
    hudBus.listen('item', this.queueItem, this);
    hudBus.listen('palette', this.flyPalette, this);
    hudBus.listen('interact', this.showInteract, this);
    hudBus.listen('tip', this.showTip, this);
    hudBus.listen('title', this.showTitle, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      hudBus.removeAllListeners();
      touch.left = touch.right = touch.jump = touch.interact = false;
    });
    this.refresh();
  }

  override update(): void {
    this.timeText.setText(formatTime(progress.state.levelTime[this.levelId] ?? 0));
    if (this.touchButtons.length) this.pollTouch();
  }

  private refresh(): void {
    const bag = Inventory.levelBag(this.levelId);
    bag.forEach((slot, i) => {
      const dot = this.bagDots[i];
      if (!dot) return;
      dot.setAlpha(slot.found ? 1 : 0.28);
      if (slot.found) dot.clearTint();
      else dot.setTint(0x8a5a62);
    });
    const found = bag.filter((s) => s.found).length;
    this.bagText.setText(`${found}/${bag.length}`);
    const meta = getLevel(this.levelId);
    const palettes = (progress.state.palettes[this.levelId] ?? []).length;
    this.paletteText.setText(`PALETAS ${palettes}/${meta.counts.palettes}`);
    this.scoreText.setText(`PONTOS ${progress.state.score}`);

    const lives = progress.state.lives;
    this.hearts.forEach((h, i) => h.setTexture(i < lives ? 'heart' : 'heart-empty'));
    if (lives < this.shownLives) {
      const lost = this.hearts[lives];
      if (lost) this.tweens.add({ targets: lost, scale: 1.6, duration: 120, yoyo: true });
    }
    this.shownLives = lives;
  }

  // ------------------------------------------------------------ mensagens
  private pill(container: Phaser.GameObjects.Container, text: string, tone: 'info' | 'warn' | 'good' | 'tutorial'): void {
    container.removeAll(true);
    const fill = tone === 'warn' ? 0xe0707f : tone === 'good' ? 0x7bae8a : tone === 'tutorial' ? HEX.night : HEX.mauve;
    const label = this.add
      .text(0, 0, text, { fontFamily: FONT_BODY, fontSize: tone === 'tutorial' ? '20px' : '18px', fontStyle: '700', color: COLORS.white, align: 'center', wordWrap: { width: 820 } })
      .setOrigin(0.5)
      .setLetterSpacing(tone === 'tutorial' ? 2 : 0.5);
    const w = Math.min(900, label.width + 56);
    const h = label.height + 26;
    const bg = this.add.graphics();
    bg.fillStyle(fill, tone === 'tutorial' ? 0.82 : 0.94);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    container.add([bg, label]);
  }

  private showMessage(text: string, duration = 2200, tone: 'info' | 'warn' | 'good' = 'info'): void {
    this.tweens.killTweensOf(this.message);
    this.pill(this.message, text, tone);
    this.message.setAlpha(0).setScale(0.9);
    this.tweens.add({ targets: this.message, alpha: 1, scale: 1, duration: 180, ease: 'Back.easeOut' });
    this.tweens.add({ targets: this.message, alpha: 0, delay: duration, duration: 400 });
  }

  private showTutorial(text: string): void {
    this.tweens.killTweensOf(this.tutorial);
    this.pill(this.tutorial, text, 'tutorial');
    this.tutorial.setAlpha(0).setY(140);
    this.tweens.add({ targets: this.tutorial, alpha: 1, y: 160, duration: 260, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: this.tutorial, alpha: 0, delay: 4600, duration: 500 });
  }

  /** Cartão de abertura: nome da fase + objetivo. */
  private showTitle(kicker: string, title: string, objective: string): void {
    const c = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40).setDepth(20).setAlpha(0);
    const bg = panel(this, 0, 0, 720, 190, { alpha: 0.95 });
    c.add([
      bg,
      this.add.text(0, -58, kicker, labelText(14, COLORS.rose)).setOrigin(0.5).setLetterSpacing(6),
      this.add.text(0, -14, title, displayText(46, COLORS.ink)).setOrigin(0.5),
      this.add.text(0, 44, objective, bodyText(17, COLORS.mauve, { align: 'center', wordWrap: { width: 640 } })).setOrigin(0.5),
    ]);
    this.tweens.add({ targets: c, alpha: 1, y: GAME_HEIGHT / 2 - 60, duration: 350, ease: 'Quad.easeOut' });
    this.tweens.add({ targets: c, alpha: 0, delay: 3000, duration: 450, onComplete: () => c.destroy() });
  }

  // ------------------------------------------------------ item encontrado
  private queueItem(event: ItemFoundEvent): void {
    this.itemQueue.push(event);
    if (!this.showingItem) this.nextItem();
  }

  private nextItem(): void {
    const event = this.itemQueue.shift();
    if (!event) {
      this.showingItem = false;
      return;
    }
    this.showingItem = true;

    const c = this.add.container(GAME_WIDTH / 2, 330).setDepth(15).setAlpha(0).setScale(0.85);
    const bg = panel(this, 0, 0, 560, 170, { alpha: 0.97, stroke: event.secret ? 0xd6ae62 : HEX.rose });
    const icon = this.add.image(-200, 0, event.texture).setScale(event.secret ? 1.5 : 1.3);
    c.add([
      bg,
      icon,
      this.add.text(-130, -52, event.kicker, labelText(13, event.secret ? '#B08D57' : COLORS.rose)).setLetterSpacing(4),
      this.add.text(-130, -30, event.title, displayText(30, COLORS.ink)),
      this.add.text(-130, 14, event.subtitle, bodyText(15, COLORS.muted, { wordWrap: { width: 380 }, lineSpacing: 4 })),
    ]);
    this.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' });

    // o ícone voa do mundo até a Rare Bag (SPEC §34)
    const flyer = this.add.image(event.screenX, event.screenY, event.texture).setScale(0.8).setDepth(16);
    this.tweens.add({
      targets: flyer,
      x: BAG.x,
      y: BAG.y,
      scale: 0.35,
      duration: 900,
      delay: 250,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        flyer.destroy();
        this.tweens.add({ targets: this.bagIcon, scale: 1.35, duration: 110, yoyo: true });
        this.refresh();
      },
    });

    this.time.delayedCall(3400, () => {
      this.tweens.add({ targets: c, alpha: 0, y: 300, duration: 320, onComplete: () => c.destroy() });
      this.time.delayedCall(360, () => this.nextItem());
    });
  }

  private flyPalette(x: number, y: number): void {
    const p = this.add.image(x, y, 'palette').setScale(0.8);
    this.tweens.add({
      targets: p,
      x: 40,
      y: 104,
      scale: 0.3,
      alpha: 0.6,
      duration: 520,
      ease: 'Cubic.easeIn',
      onComplete: () => p.destroy(),
    });
  }

  // ---------------------------------------------------------- dica Rare
  private showTip(tip: { title: string; text: string } | null): void {
    this.tweens.killTweensOf(this.tip);
    if (!tip) {
      this.tweens.add({ targets: this.tip, alpha: 0, duration: 200 });
      return;
    }
    this.tip.removeAll(true);
    const bg = panel(this, 0, 0, 680, 130, { alpha: 0.97, stroke: HEX.rose });
    this.tip.add([
      bg,
      this.add.image(-300, 0, 'sign').setScale(0.7),
      this.add.text(-250, -40, tip.title, displayText(22, COLORS.mauve)),
      this.add.text(-250, -6, tip.text, bodyText(16, COLORS.ink, { wordWrap: { width: 540 }, lineSpacing: 3 })),
    ]);
    this.tip.setAlpha(0).setY(GAME_HEIGHT - 90);
    this.tweens.add({ targets: this.tip, alpha: 1, y: GAME_HEIGHT - 110, duration: 220 });
  }

  // ------------------------------------------------------ controles touch
  private buildTouchControls(): void {
    this.input.addPointer(3);
    const make = (key: keyof typeof touch, x: number, y: number, r: number, glyph: string): TouchButton => {
      const c = this.add.container(x, y).setDepth(30);
      const g = this.add.graphics();
      g.fillStyle(HEX.white, 0.28);
      g.fillCircle(0, 0, r);
      g.lineStyle(3, HEX.white, 0.75);
      g.strokeCircle(0, 0, r);
      c.add([g, this.add.text(0, 0, glyph, { fontFamily: FONT_BODY, fontSize: `${Math.round(r * 0.7)}px`, fontStyle: '700', color: COLORS.white }).setOrigin(0.5)]);
      const button = { key, x, y, r, gfx: c };
      this.touchButtons.push(button);
      return button;
    };
    make('left', 110, GAME_HEIGHT - 100, 62, '◀');
    make('right', 260, GAME_HEIGHT - 100, 62, '▶');
    make('jump', GAME_WIDTH - 120, GAME_HEIGHT - 110, 74, '▲');
    this.interactButton = make('interact', GAME_WIDTH - 280, GAME_HEIGHT - 90, 50, 'E');
    this.interactButton.gfx.setVisible(false);
  }

  /** Lê todos os dedos na tela a cada quadro: permite andar e pular ao mesmo tempo. */
  private pollTouch(): void {
    const state = { left: false, right: false, jump: false, interact: false };
    for (const pointer of this.input.manager.pointers) {
      if (!pointer.isDown) continue;
      for (const b of this.touchButtons) {
        if (!b.gfx.visible) continue;
        if (Phaser.Math.Distance.Between(pointer.x, pointer.y, b.x, b.y) <= b.r * 1.25) state[b.key] = true;
      }
    }
    for (const b of this.touchButtons) {
      touch[b.key] = state[b.key];
      b.gfx.setScale(state[b.key] ? 0.92 : 1).setAlpha(state[b.key] ? 1 : 0.85);
    }
  }

  private showInteract(visible: boolean): void {
    this.interactButton?.gfx.setVisible(visible);
  }
}
