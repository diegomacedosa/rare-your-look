/**
 * Coletáveis: produtos, itens secretos, paletas de cores, corações e brilhos
 * (SPEC §10). Todos flutuam e são coletados ao encostar.
 */
import Phaser from 'phaser';

export type PickupKind = 'product' | 'secret' | 'palette' | 'heart' | 'bonus';

export class Pickup extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;
  readonly kind: PickupKind;
  /** id do produto/secreto/paleta. */
  readonly refId: string;
  collected = false;
  /** Enquanto sai da Rare Box, ainda não pode ser coletado. */
  ready = true;
  private glow: Phaser.GameObjects.Image | null = null;
  private readonly baseScale: number;

  constructor(scene: Phaser.Scene, x: number, y: number, kind: PickupKind, refId: string, texture: string) {
    super(scene, x, y, texture);
    this.kind = kind;
    this.refId = refId;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.body.moves = false;
    this.setDepth(12);

    this.baseScale = kind === 'product' ? 0.8 : 1;
    this.setScale(this.baseScale);
    if (kind === 'palette') this.body.setSize(40, 36);

    if (kind === 'product' || kind === 'secret') {
      // halo que destaca os itens importantes
      this.glow = scene.add
        .image(x, y, 'spark')
        .setScale(kind === 'product' ? 5.5 : 4.5)
        .setAlpha(0.6)
        .setDepth(11)
        .setBlendMode(Phaser.BlendModes.ADD);
      scene.tweens.add({ targets: this.glow, scale: this.glow.scale * 1.2, alpha: 0.3, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    }
    if (this.glow) scene.events.on(Phaser.Scenes.Events.UPDATE, this.syncGlow, this);
    this.startFloat();
  }

  private startFloat(): void {
    const amp = this.kind === 'palette' ? 4 : 7;
    this.scene.tweens.add({ targets: this, y: this.y - amp, duration: 850 + Math.random() * 300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  private syncGlow(): void {
    this.glow?.setPosition(this.x, this.y);
  }

  /** Saída da Rare Box: sobe, fica suspenso e só então pode ser pego (SPEC §9). */
  emerge(fromY: number, toY: number, land?: { x: number; y: number }): void {
    this.ready = false;
    this.scene.tweens.killTweensOf(this);
    this.y = fromY;
    this.setScale(this.baseScale * 0.4);
    this.scene.tweens.add({
      targets: this,
      y: toY,
      scale: this.baseScale,
      duration: 420,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.ready = true;
        if (!land) {
          this.startFloat();
          return;
        }
        // depois de um instante suspenso, desce flutuando ao lado da caixa,
        // na altura da Maya — fácil de alcançar para quem está começando
        this.scene.tweens.add({
          targets: this,
          x: land.x,
          y: land.y,
          delay: 450,
          duration: 700,
          ease: 'Sine.easeInOut',
          onComplete: () => this.startFloat(),
        });
      },
    });
  }

  collect(): void {
    this.collected = true;
    this.body.enable = false;
    this.scene.tweens.killTweensOf(this);
    this.glow?.destroy();
    this.glow = null;
    this.scene.tweens.add({
      targets: this,
      scale: this.baseScale * 1.6,
      alpha: 0,
      y: this.y - 30,
      duration: 260,
      ease: 'Quad.easeOut',
      onComplete: () => this.destroy(),
    });
  }

  override destroy(fromScene?: boolean): void {
    this.scene?.events.off(Phaser.Scenes.Events.UPDATE, this.syncGlow, this);
    this.glow?.destroy();
    this.glow = null;
    super.destroy(fromScene);
  }
}
