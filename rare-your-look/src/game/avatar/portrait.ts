/**
 * Ponte entre o compositor de avatar em camadas da v1 (AvatarSystem.js,
 * Canvas 2D) e o Phaser: o retrato é pintado num canvas e registrado como
 * textura. Trocar um tom repinta só o grupo "makeup" do compositor.
 *
 * Camadas (SPEC §24): base → face → cheeks → eyes → lips → highlight →
 * hair → accessories — mapeadas nas 12 camadas do AvatarSystem.
 */
import type Phaser from 'phaser';
import { AvatarRenderer, type AvatarConfig, type Look } from './AvatarSystem.js';

/** Maya no Rare Studio — mesma paleta do sprite do platformer. */
export const MAYA_AVATAR: AvatarConfig = {
  skinTone: 'tone4',
  bodyShape: 'medium',
  hairStyle: 'wavy',
  hairColor: 'dark_brown',
  eyeColor: 'brown',
  top: 'vneck',
  topColor: 'rose',
  bottom: 'jeans',
  accessories: { earrings: 'hoops', eyewear: 'none', hearing: 'none', neck: 'none', hairAcc: 'none' },
  features: { freckles: true, vitiligo: false, scar: false, mole: false },
  mobility: 'none',
  prosthetic: 'none',
  makeup: 'none',
  scenario: 'bg_studio',
  seed: 11,
};

export class Portrait {
  readonly renderer: AvatarRenderer;
  readonly key: string;
  private texture: Phaser.Textures.CanvasTexture | null;

  constructor(scene: Phaser.Scene, key: string, width = 480, background: string | null = null) {
    const canvas = document.createElement('canvas');
    this.renderer = new AvatarRenderer(canvas, { fixedWidth: width, maxScale: 3, background });
    this.renderer.render(MAYA_AVATAR, {}, { describe: false });
    this.key = key;
    if (scene.textures.exists(key)) scene.textures.remove(key);
    this.texture = scene.textures.addCanvas(key, canvas);
  }

  render(look: Look): void {
    this.renderer.render(MAYA_AVATAR, look, { describe: false });
    this.texture?.refresh();
  }

  /** A textura fica registrada (a próxima cena com a mesma chave a substitui). */
  destroy(): void {
    this.renderer.destroy();
    this.texture = null;
  }
}
