/**
 * Obstáculos (SPEC §17) — nada de violência: frascos, pincéis gigantes e
 * gotas de maquiagem. Encostar tira um coração (ou manda para o checkpoint
 * quando os corações acabam).
 */
import Phaser from 'phaser';
import type { HazardDef } from '../levels/types';

export interface Hazard extends Phaser.Physics.Arcade.Image {
  body: Phaser.Physics.Arcade.Body;
  step?(delta: number): void;
}

function prepare(obj: Phaser.Physics.Arcade.Image, bodyW: number, bodyH: number): Hazard {
  const hazard = obj as Hazard;
  hazard.body.setAllowGravity(false);
  hazard.body.moves = false;
  hazard.body.setSize(bodyW, bodyH);
  return hazard;
}

/** Frasco parado no caminho. */
export function createBottle(scene: Phaser.Scene, def: Extract<HazardDef, { type: 'bottle' }>): Hazard {
  const bottle = scene.physics.add.image(def.x, def.y, 'bottle').setOrigin(0.5, 1).setDepth(9);
  return prepare(bottle, 28, 52);
}

/** Pincel gigante em movimento de vai-e-vem. */
export class Brush extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;
  private clock: number;
  private readonly def: Extract<HazardDef, { type: 'brush' }>;

  constructor(scene: Phaser.Scene, def: Extract<HazardDef, { type: 'brush' }>) {
    super(scene, def.x, def.y, def.vertical ? 'brush-v' : 'brush-h');
    this.def = def;
    this.clock = def.phase;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(9);
    prepare(this, def.vertical ? 34 : 130, def.vertical ? 130 : 34);
    this.step(0);
  }

  step(delta: number): void {
    this.clock += delta / 1000;
    const k = 0.5 - 0.5 * Math.cos((this.clock / this.def.period) * Math.PI * 2);
    const x = this.def.x + this.def.dx * k;
    const y = this.def.y + this.def.dy * k;
    // o pincel horizontal "olha" para onde está indo
    if (!this.def.vertical) {
      const dir = Math.sin((this.clock / this.def.period) * Math.PI * 2);
      this.setFlipX(dir < 0);
    }
    this.setPosition(x, y);
  }
}

/** Conta-gotas: pinga gotas de maquiagem em ritmo fixo. */
export class Dripper {
  readonly nozzle: Phaser.GameObjects.Image;
  private clock: number;
  private readonly def: Extract<HazardDef, { type: 'drip' }>;

  constructor(
    private readonly scene: Phaser.Scene,
    def: Extract<HazardDef, { type: 'drip' }>,
    private readonly floorY: number,
    private readonly spawn: (drop: Hazard) => void,
  ) {
    this.def = def;
    this.clock = def.phase;
    // o conta-gotas fica pendurado num fio dourado vindo do alto
    scene.add.rectangle(def.x, (def.y - 90) / 2, 3, Math.max(0, def.y - 90), 0xb08d57).setDepth(9);
    this.nozzle = scene.add.image(def.x, def.y, 'dripper').setOrigin(0.5, 1).setDepth(9);
    // sombra no chão: mostra onde a gota vai cair
    scene.add.ellipse(def.x, floorY - 2, 36, 8, 0x8a5a62, 0.25).setDepth(5);
  }

  step(delta: number): void {
    this.clock += delta / 1000;
    if (this.clock < this.def.period) return;
    this.clock -= this.def.period;
    const drop = this.scene.physics.add.image(this.def.x, this.def.y, 'drop').setDepth(9) as Hazard;
    this.spawn(drop);
    drop.body.setSize(14, 20);
    drop.body.setAllowGravity(true);
    drop.body.moves = true;
    drop.body.setGravityY(-900);
    drop.step = () => {
      if (drop.y >= this.floorY - 12) this.splash(drop);
    };
  }

  private splash(drop: Hazard): void {
    const { x } = drop;
    drop.destroy();
    for (let i = 0; i < 5; i++) {
      const bit = this.scene.add.image(x, this.floorY - 6, 'drop').setScale(0.3).setDepth(9);
      this.scene.tweens.add({
        targets: bit,
        x: x + Phaser.Math.Between(-26, 26),
        y: this.floorY - Phaser.Math.Between(10, 30),
        alpha: 0,
        duration: 320,
        ease: 'Quad.easeOut',
        onComplete: () => bit.destroy(),
      });
    }
  }
}
