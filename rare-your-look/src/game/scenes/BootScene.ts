/**
 * BootScene — espera as fontes da marca (Playfair Display + DM Sans).
 * Os placeholders são desenhados com texto; gerar antes da fonte chegar
 * deixaria "R" e "RARE TIP" em Georgia para sempre.
 */
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    const fonts = [
      '600 32px "Playfair Display"',
      '700 32px "Playfair Display"',
      'italic 400 32px "Playfair Display"',
      '400 16px "DM Sans"',
      '700 16px "DM Sans"',
    ];
    const load = Promise.all(fonts.map((font) => document.fonts?.load(font) ?? Promise.resolve([])));
    // sem internet as fontes nunca chegam: segue com as de sistema após 2,5 s
    const timeout = new Promise((resolve) => window.setTimeout(resolve, 2500));
    void Promise.race([load, timeout]).finally(() => this.scene.start('PreloadScene'));
  }
}
