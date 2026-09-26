/**
 * Rare Box (SPEC §9): embalagem que reage a uma batida por baixo.
 * Caixas escondidas só existem para quem bate nelas por baixo — as laterais
 * e o topo não colidem até a caixa ser revelada.
 */
import Phaser from 'phaser';
import type { BoxDef, BoxContent } from '../levels/types';

export class RareBox extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;
  readonly def: BoxDef;
  opened: boolean;
  revealed: boolean;
  private readonly baseY: number;

  constructor(scene: Phaser.Scene, def: BoxDef, opened: boolean) {
    const texture = opened ? 'rarebox-used' : def.hidden ? 'rarebox-hidden' : 'rarebox';
    super(scene, def.x, def.y, texture);
    this.def = def;
    this.opened = opened;
    this.revealed = !def.hidden || opened;
    this.baseY = def.y;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(10);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.moves = false;
    if (!this.revealed) {
      this.setAlpha(0.3);
      this.body.checkCollision.up = false;
      this.body.checkCollision.left = false;
      this.body.checkCollision.right = false;
      // brilho sutil: a dica de que "tem algo aqui"
      scene.tweens.add({ targets: this, alpha: 0.12, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
  }

  get content(): BoxContent {
    return this.def.content;
  }

  /** Batida por baixo. Retorna true se a caixa abriu agora. */
  hit(): boolean {
    this.scene.tweens.add({ targets: this, y: this.baseY - 12, duration: 80, yoyo: true, ease: 'Quad.easeOut' });
    if (this.opened) return false;
    this.opened = true;
    if (!this.revealed) {
      this.revealed = true;
      this.scene.tweens.killTweensOf(this);
      this.setAlpha(1);
      this.body.checkCollision.up = true;
      this.body.checkCollision.left = true;
      this.body.checkCollision.right = true;
    }
    this.setTexture('rarebox-used');
    return true;
  }
}
