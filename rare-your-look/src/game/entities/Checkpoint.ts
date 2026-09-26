/** Checkpoint — espelho Rare que acende ao ser tocado (SPEC §18). */
import Phaser from 'phaser';
import type { CheckpointDef } from '../levels/types';

export class Checkpoint extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;
  readonly def: CheckpointDef;
  lit = false;

  constructor(scene: Phaser.Scene, def: CheckpointDef, lit: boolean) {
    super(scene, def.x, def.y, lit ? 'mirror-on' : 'mirror-off');
    this.def = def;
    this.lit = lit;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.setDepth(6);
    this.body.setAllowGravity(false);
    this.body.moves = false;
  }

  /** Acende o espelho. Retorna true na primeira vez. */
  light(): boolean {
    if (this.lit) return false;
    this.lit = true;
    this.setTexture('mirror-on');
    this.scene.tweens.add({ targets: this, scaleX: 1.15, scaleY: 1.08, duration: 140, yoyo: true, ease: 'Quad.easeOut' });
    return true;
  }
}
