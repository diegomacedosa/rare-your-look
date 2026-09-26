/**
 * PreloadScene — carregamento inicial (RNF-05).
 * Carrega os assets finais listados em ASSET_OVERRIDES (se houver) e gera os
 * placeholders que faltarem, depois registra as animações da Maya.
 */
import Phaser from 'phaser';
import { ASSET_OVERRIDES } from '../../data/assets';
import { generateTextures } from '../art/textures';
import { registerMayaAnimations } from '../entities/Player';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, displayText, labelText, HEX } from '../theme';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    this.add.text(cx, cy - 70, 'RARE BEAUTY', labelText(18, COLORS.rose)).setOrigin(0.5).setLetterSpacing(9);
    this.add.text(cx, cy - 26, 'Rare Your Look', displayText(44, COLORS.white)).setOrigin(0.5);
    const barW = 360;
    this.add.rectangle(cx, cy + 40, barW, 6, 0xffffff, 0.15).setOrigin(0.5);
    const bar = this.add.rectangle(cx - barW / 2, cy + 40, 0, 6, HEX.rose).setOrigin(0, 0.5);
    const hint = this.add.text(cx, cy + 74, 'Preparando a penteadeira…', labelText(13, COLORS.rose)).setOrigin(0.5).setLetterSpacing(2);
    this.load.on('progress', (value: number) => (bar.width = barW * value * 0.6));
    this.load.on('loaderror', (file: Phaser.Loader.File) => console.warn('[Preload] asset final ausente, usando placeholder:', file.key));
    this.data.set('bar', bar);
    this.data.set('hint', hint);

    for (const asset of ASSET_OVERRIDES) {
      if (asset.frame) this.load.spritesheet(asset.key, asset.url, asset.frame);
      else this.load.image(asset.key, asset.url);
    }
  }

  create(): void {
    const bar = this.data.get('bar') as Phaser.GameObjects.Rectangle;
    const hint = this.data.get('hint') as Phaser.GameObjects.Text;
    hint.setText('Desenhando o universo Rare…');
    // um quadro para a barra aparecer antes do trabalho pesado
    this.time.delayedCall(30, () => {
      generateTextures(this);
      registerMayaAnimations(this.anims);
      this.tweens.add({
        targets: bar,
        width: 360,
        duration: 250,
        onComplete: () => {
          this.cameras.main.fadeOut(300, 43, 27, 34);
          this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('MenuScene'));
        },
      });
    });
  }
}
