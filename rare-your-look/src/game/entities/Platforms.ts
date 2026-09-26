/**
 * Plataformas móveis e frágeis (SPEC §14).
 * As móveis andam por velocidade (não por tween) para o Arcade Physics
 * carregar a Maya junto — o atrito de corpos imóveis faz o resto.
 */
import Phaser from 'phaser';
import type { MovingDef, PlatformDef } from '../levels/types';
import audio from '../systems/AudioSystem';

export const PLATFORM_H = 26;

/** Plataforma "macia": só colide por cima — dá pra atravessar pulando. */
export function oneWay(body: Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody): void {
  body.checkCollision.down = false;
  body.checkCollision.left = false;
  body.checkCollision.right = false;
}

export class MovingPlatform extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;
  private readonly def: MovingDef;
  private clock: number;

  constructor(scene: Phaser.Scene, def: MovingDef, texture: string) {
    super(scene, def.x + def.w / 2, def.y + PLATFORM_H / 2, texture);
    this.def = def;
    this.clock = def.phase;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(8);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.setFriction(1, 1);
    oneWay(this.body);
    const start = this.targetAt(this.clock);
    this.body.reset(start.x, start.y);
  }

  private targetAt(t: number): { x: number; y: number } {
    const k = 0.5 - 0.5 * Math.cos((t / this.def.period) * Math.PI * 2);
    return { x: this.def.x + this.def.w / 2 + this.def.dx * k, y: this.def.y + PLATFORM_H / 2 + this.def.dy * k };
  }

  step(delta: number): void {
    const dt = delta / 1000;
    if (dt <= 0) return;
    this.clock += dt;
    const next = this.targetAt(this.clock);
    this.body.setVelocity((next.x - this.body.center.x) / dt, (next.y - this.body.center.y) / dt);
  }
}

export class CrumblePlatform extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;
  private phase: 'idle' | 'shaking' | 'gone' = 'idle';
  private readonly home: { x: number; y: number };

  constructor(scene: Phaser.Scene, def: PlatformDef, texture: string) {
    super(scene, def.x + def.w / 2, def.y + PLATFORM_H / 2, texture);
    this.home = { x: this.x, y: this.y };
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(8);
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.moves = false;
    oneWay(this.body);
  }

  /** A Maya pisou: treme, some e volta depois de um tempo. */
  trigger(): void {
    if (this.phase !== 'idle') return;
    this.phase = 'shaking';
    this.scene.tweens.add({ targets: this, x: this.home.x + 3, duration: 45, yoyo: true, repeat: 5 });
    this.scene.time.delayedCall(560, () => {
      audio.play('crumble');
      this.phase = 'gone';
      this.body.enable = false;
      this.scene.tweens.add({ targets: this, alpha: 0, y: this.home.y + 40, duration: 260 });
      this.scene.time.delayedCall(2600, () => this.restore());
    });
  }

  private restore(): void {
    this.scene.tweens.killTweensOf(this);
    this.setPosition(this.home.x, this.home.y);
    this.body.enable = true;
    this.body.reset(this.home.x, this.home.y);
    this.phase = 'idle';
    this.setAlpha(0);
    this.scene.tweens.add({ targets: this, alpha: 1, duration: 300 });
  }
}
