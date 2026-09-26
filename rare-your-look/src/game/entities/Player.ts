/**
 * Maya no platformer (SPEC §8).
 * Controle antes de realismo: aceleração rápida, coyote time, buffer de pulo
 * e pulo variável (soltar o botão cedo = pulo mais baixo).
 */
import Phaser from 'phaser';
import type { Controls } from '../systems/Controls';
import audio from '../systems/AudioSystem';

const RUN_SPEED = 330;
const ACCEL_GROUND = 2800;
const DECEL_GROUND = 3200;
const ACCEL_AIR = 1800;
const DECEL_AIR = 900;
const JUMP_VELOCITY = -900;
const JUMP_CUT = -320;
const MAX_FALL = 1000;
const COYOTE_MS = 110;
const BUFFER_MS = 130;
export const INVULNERABLE_MS = 1600;

const approach = (value: number, target: number, delta: number): number =>
  value < target ? Math.min(value + delta, target) : Math.max(value - delta, target);

export class Player extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;

  /** Congelada: cutscene, portal, game over. */
  frozen = false;
  private coyote = 0;
  private buffer = 0;
  private hurtUntil = 0;
  private invulnerableUntil = 0;
  private landUntil = 0;
  private wasOnFloor = false;
  private fallSpeed = 0;
  private celebrating = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'maya', 'idle0');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 1);
    this.setDepth(20);
    // hitbox menor que o desenho: perdoa encostos de raspão
    this.body.setSize(30, 92);
    this.body.setOffset(32, 32);
    this.body.setMaxVelocityY(MAX_FALL);
    // só as laterais do mundo seguram a Maya (a cena abre o teto e o chão)
    this.body.setCollideWorldBounds(true);
    this.play('idle');
  }

  get invulnerable(): boolean {
    return this.scene.time.now < this.invulnerableUntil;
  }

  get onFloor(): boolean {
    return this.body.blocked.down || this.body.touching.down;
  }

  override update(controls: Controls, delta: number): void {
    const dt = delta / 1000;
    const now = this.scene.time.now;
    const body = this.body;

    if (this.frozen) {
      body.setVelocityX(approach(body.velocity.x, 0, DECEL_GROUND * dt));
      this.pickAnimation(now);
      return;
    }

    const hurt = now < this.hurtUntil;
    const onFloor = this.onFloor;

    // coyote time e buffer de pulo
    this.coyote = onFloor ? COYOTE_MS : Math.max(0, this.coyote - delta);
    this.buffer = controls.jumpPressed ? BUFFER_MS : Math.max(0, this.buffer - delta);

    // movimento horizontal
    let dir = 0;
    if (!hurt) {
      if (controls.left) dir -= 1;
      if (controls.right) dir += 1;
    }
    const target = dir * RUN_SPEED;
    const accel = dir !== 0 ? (onFloor ? ACCEL_GROUND : ACCEL_AIR) : onFloor ? DECEL_GROUND : DECEL_AIR;
    body.setVelocityX(approach(body.velocity.x, target, accel * dt));
    if (dir !== 0) this.setFlipX(dir < 0);

    // pulo
    if (!hurt && this.buffer > 0 && this.coyote > 0) {
      body.setVelocityY(JUMP_VELOCITY);
      this.buffer = 0;
      this.coyote = 0;
      audio.play('jump');
    }
    // pulo variável
    if (!controls.jumpHeld && body.velocity.y < JUMP_CUT) body.setVelocityY(JUMP_CUT);

    // aterrissagem
    if (!this.wasOnFloor && onFloor && this.fallSpeed > 380) {
      this.landUntil = now + 110;
      audio.play('land');
      this.emit('land', this.x, this.y);
    }
    this.fallSpeed = onFloor ? 0 : Math.max(this.fallSpeed, body.velocity.y);
    this.wasOnFloor = onFloor;

    this.pickAnimation(now);
  }

  private pickAnimation(now: number): void {
    const body = this.body;
    let key: string;
    if (this.celebrating) key = 'celebrate';
    else if (now < this.hurtUntil) key = 'hit';
    else if (!this.onFloor) key = body.velocity.y < 0 ? 'jump' : 'fall';
    else if (now < this.landUntil) key = 'land';
    else if (Math.abs(body.velocity.x) > 30) key = 'run';
    else key = 'idle';

    if (this.anims.currentAnim?.key !== key) this.play(key, true);
    if (key === 'run') this.anims.timeScale = Phaser.Math.Clamp(Math.abs(body.velocity.x) / RUN_SPEED, 0.5, 1.2);
    else this.anims.timeScale = 1;

    // piscar enquanto invulnerável
    this.setAlpha(this.invulnerable && Math.floor(now / 90) % 2 === 0 ? 0.35 : 1);
  }

  /** Leva dano: empurrão para trás + invulnerabilidade curta. */
  hurt(fromX: number): void {
    const now = this.scene.time.now;
    this.hurtUntil = now + 420;
    this.invulnerableUntil = now + INVULNERABLE_MS;
    const dir = this.x < fromX ? -1 : 1;
    this.body.setVelocity(dir * 260, -420);
    this.setFlipX(dir > 0);
  }

  /** Volta a Maya para um ponto seguro (checkpoint). */
  respawn(x: number, y: number): void {
    this.body.reset(x, y);
    this.body.setVelocity(0, 0);
    this.invulnerableUntil = this.scene.time.now + INVULNERABLE_MS;
    this.hurtUntil = 0;
    this.fallSpeed = 0;
    this.celebrating = false;
    this.frozen = false;
    this.setAlpha(1);
  }

  celebrate(): void {
    this.celebrating = true;
    this.frozen = true;
    this.body.setVelocityX(0);
  }

  /** Quique ao pisar/bater em algo (ex.: bater a cabeça na Rare Box). */
  bumpHead(): void {
    if (this.body.velocity.y < 0) this.body.setVelocityY(60);
  }
}

/** Animações da Maya (SPEC §33). Registradas uma vez no boot. */
export function registerMayaAnimations(anims: Phaser.Animations.AnimationManager): void {
  const frames = (...names: string[]) => names.map((frame) => ({ key: 'maya', frame }));
  const add = (key: string, names: string[], frameRate: number, repeat = -1): void => {
    if (!anims.exists(key)) anims.create({ key, frames: frames(...names), frameRate, repeat });
  };
  add('idle', ['idle0', 'idle1'], 2.5);
  add('run', ['run0', 'run1', 'run2', 'run3', 'run4', 'run5'], 13);
  add('jump', ['jump'], 1, 0);
  add('fall', ['fall'], 1, 0);
  add('land', ['land'], 1, 0);
  add('hit', ['hit'], 1, 0);
  add('celebrate', ['celebrate0', 'celebrate1'], 5);
  add('interact', ['interact0', 'interact1'], 2);
  add('sit', ['sit'], 1, 0);
  add('pick-product', ['sit', 'pick'], 3);
  add('apply-makeup', ['apply0', 'apply1'], 3);
  add('look-at-mirror', ['look'], 1, 0);
  add('final-pose', ['pose', 'celebrate1'], 1.5);
}
