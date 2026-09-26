/**
 * PauseScene — pausa com a Rare Bag aberta (SPEC §11) e o atalho para a
 * tela inicial (feedback da professora, item 3).
 */
import Phaser from 'phaser';
import { PRODUCTS, SECRET_ITEMS } from '../../data/products';
import { getLevel } from '../../data/levels';
import { COLORS, HEX, GAME_WIDTH, GAME_HEIGHT, displayText, bodyText, labelText } from '../theme';
import { Button, panel } from '../ui/Button';
import { dim, soundToggles } from '../ui/helpers';
import progress from '../systems/ProgressSystem';
import audio from '../systems/AudioSystem';
import type { LevelScene } from './LevelScene';

export class PauseScene extends Phaser.Scene {
  private levelKey = '';
  private levelId = 1;
  private mode: 'pause' | 'home' = 'pause';

  constructor() {
    super('PauseScene');
  }

  init(data: { levelKey: string; levelId: number; mode: 'pause' | 'home' }): void {
    this.levelKey = data.levelKey;
    this.levelId = data.levelId;
    this.mode = data.mode;
  }

  create(): void {
    dim(this, 0.6);
    if (this.mode === 'home') this.buildHome();
    else this.buildPause();
    this.input.keyboard?.on('keydown-ESC', () => this.resume());
    this.scene.bringToTop();
  }

  private buildPause(): void {
    const cx = GAME_WIDTH / 2;
    panel(this, cx, GAME_HEIGHT / 2, 1000, 600);
    this.add.text(cx, 88, 'PAUSA', labelText(14, COLORS.rose)).setOrigin(0.5).setLetterSpacing(8);
    this.add.text(cx, 124, 'Sua Rare Bag', displayText(34, COLORS.ink)).setOrigin(0.5);

    // produtos: coletados coloridos, faltantes em silhueta
    const cols = PRODUCTS.length;
    const startX = cx - ((cols - 1) * 104) / 2;
    PRODUCTS.forEach((product, i) => {
      const x = startX + i * 104;
      const has = progress.hasProduct(product.id);
      const card = this.add.graphics();
      card.fillStyle(has ? HEX.blush : 0xf3eeec, 1);
      card.fillRoundedRect(x - 46, 160, 92, 132, 16);
      const icon = this.add.image(x, 212, product.icon).setScale(0.85);
      if (!has) icon.setTint(0xb8a9a3).setAlpha(0.45);
      this.add.text(x, 262, has ? product.label : '?', labelText(12, has ? COLORS.mauve : COLORS.muted)).setOrigin(0.5).setLetterSpacing(1);
      this.add.text(x, 280, `Fase ${product.stage}`, bodyText(11, COLORS.muted)).setOrigin(0.5);
    });

    const secrets = SECRET_ITEMS.filter((s) => progress.hasSecret(s.id)).length;
    const meta = getLevel(this.levelId);
    const palettes = (progress.state.palettes[this.levelId] ?? []).length;
    this.add
      .text(cx, 322, `Itens secretos: ${secrets}/${SECRET_ITEMS.length}   ·   Paletas desta fase: ${palettes}/${meta.counts.palettes}   ·   Pontos: ${progress.state.score}`, bodyText(15, COLORS.mauve))
      .setOrigin(0.5);

    new Button(this, cx, 392, 'CONTINUAR', () => this.resume(), { width: 300 });
    new Button(this, cx - 160, 462, 'VOLTAR AO ESPELHO', () => this.toCheckpoint(), { width: 300, variant: 'secondary', fontSize: 15 });
    new Button(this, cx + 160, 462, 'TELA INICIAL', () => this.goHome(), { width: 300, variant: 'secondary', fontSize: 15 });
    soundToggles(this, cx, 534);
    this.add.text(cx, 588, 'ESC para continuar  ·  seu progresso fica salvo automaticamente', labelText(11, COLORS.muted)).setOrigin(0.5).setLetterSpacing(1);
  }

  private buildHome(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    panel(this, cx, cy, 620, 300);
    this.add.text(cx, cy - 96, 'Voltar para a tela inicial?', displayText(30, COLORS.ink)).setOrigin(0.5);
    this.add
      .text(cx, cy - 44, 'Tudo o que você coletou fica salvo.\nVocê pode continuar depois do último espelho.', bodyText(17, COLORS.muted, { align: 'center', lineSpacing: 4 }))
      .setOrigin(0.5);
    new Button(this, cx - 140, cy + 60, 'CONTINUAR JOGANDO', () => this.resume(), { width: 250, fontSize: 15 });
    new Button(this, cx + 140, cy + 60, 'TELA INICIAL', () => this.goHome(), { width: 250, variant: 'secondary', fontSize: 15 });
  }

  private resume(): void {
    audio.play('unpause');
    this.scene.stop();
    this.scene.resume(this.levelKey);
  }

  private toCheckpoint(): void {
    this.scene.stop();
    this.scene.resume(this.levelKey);
    (this.scene.get(this.levelKey) as LevelScene).returnToCheckpoint();
  }

  private goHome(): void {
    progress.save();
    this.scene.stop('HUDScene');
    this.scene.stop(this.levelKey);
    this.scene.start('MenuScene');
  }
}
