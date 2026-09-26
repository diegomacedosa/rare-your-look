/**
 * LevelScene — a fase de plataforma (SPEC §6–§20). As três fases usam esta
 * mesma cena; o que muda é o layout desenhado à mão em src/game/levels/.
 *
 * Correções do feedback da professora:
 *  - item 4: 3 corações, mensagem de dano longa e tela de "game over" antes do retorno;
 *  - item 5: vitória só acontece no portal, em tela separada (LevelCompleteScene);
 *  - item 6: cair ou perder corações NUNCA apaga o que foi coletado;
 *  - item 7: fase 2 construída e testada com o mesmo motor da fase 1.
 */
import Phaser from 'phaser';
import { getLevel, type LevelMeta } from '../../data/levels';
import { PRODUCTS_BY_ID, SECRETS_BY_ID, productsForStage } from '../../data/products';
import { DAMAGE_LINES, RARE_TIPS } from '../../data/dialogue';
import { GROUND_Y, KILL_Y, WORLD_HEIGHT, BOX_SIZE, type LevelLayout } from '../levels/types';
import { GAME_WIDTH, GAME_HEIGHT, THEMES, FONT_BODY, HEX } from '../theme';
import { platformKey } from '../art/textures';
import { Player } from '../entities/Player';
import { RareBox } from '../entities/RareBox';
import { Pickup, type PickupKind } from '../entities/Product';
import { Checkpoint } from '../entities/Checkpoint';
import { MovingPlatform, CrumblePlatform, PLATFORM_H, oneWay } from '../entities/Platforms';
import { Brush, Dripper, createBottle, type Hazard } from '../entities/Obstacle';
import { Controls } from '../systems/Controls';
import { hudBus } from '../systems/hudBus';
import progress, { MAX_LIVES } from '../systems/ProgressSystem';
import Inventory from '../systems/InventorySystem';
import audio from '../systems/AudioSystem';
import { POINTS, levelBonus } from '../systems/ScoreSystem';
import { fadeIn } from '../ui/helpers';

type Body = Phaser.Types.Physics.Arcade.GameObjectWithBody;

interface SignRuntime {
  x: number;
  y: number;
  tip: string;
  bubble: Phaser.GameObjects.Container;
}

export class LevelScene extends Phaser.Scene {
  protected readonly levelId: number;
  protected meta!: LevelMeta;
  protected layout!: LevelLayout;

  private player!: Player;
  private controls!: Controls;
  private solids!: Phaser.Physics.Arcade.StaticGroup;
  private boxes!: Phaser.GameObjects.Group;
  private pickups!: Phaser.GameObjects.Group;
  private hazards!: Phaser.GameObjects.Group;
  private checkpoints: Checkpoint[] = [];
  private movers: MovingPlatform[] = [];
  private crumbles: CrumblePlatform[] = [];
  private brushes: Brush[] = [];
  private drippers: Dripper[] = [];
  private signs: SignRuntime[] = [];
  private nearSign: SignRuntime | null = null;
  private tipOpen = false;
  private portal!: Phaser.GameObjects.Image;
  private portalZone!: Phaser.GameObjects.Zone;
  private portalGlow!: Phaser.GameObjects.Image;
  private far!: Phaser.GameObjects.TileSprite;
  private mid!: Phaser.GameObjects.TileSprite;
  private sparks!: Phaser.GameObjects.Particles.ParticleEmitter;
  private dust!: Phaser.GameObjects.Particles.ParticleEmitter;

  private lives = MAX_LIVES;
  private respawnPoint = { x: 0, y: GROUND_Y };
  private tutorialsShown = new Set<number>();
  private lookAhead = 0;
  private portalCooldown = 0;
  private finished = false;
  private busy = false;
  private saveClock = 0;
  private runTime = 0;

  constructor(key: string, levelId: number) {
    super(key);
    this.levelId = levelId;
  }

  create(): void {
    this.meta = getLevel(this.levelId);
    this.layout = this.meta.layout;
    this.resetRuntime();
    fadeIn(this, 500);

    progress.startLevel(this.levelId);
    this.lives = MAX_LIVES;
    this.physics.world.setBounds(0, -600, this.layout.width, WORLD_HEIGHT + 1200);
    this.physics.world.setBoundsCollision(true, true, false, false);
    this.cameras.main.setBounds(0, 0, this.layout.width, WORLD_HEIGHT);
    this.cameras.main.setBackgroundColor(THEMES[this.meta.theme].skyBottom);

    this.buildBackground();
    this.buildWorld();
    this.buildEntities();
    this.buildPlayer();
    this.buildParticles();
    this.buildColliders();

    this.controls = new Controls(this);
    this.input.keyboard?.on('keydown-ESC', () => this.openPause('pause'));
    this.input.keyboard?.on('keydown-P', () => this.openPause('pause'));

    this.scene.launch('HUDScene', { levelId: this.levelId, levelKey: this.scene.key });
    this.scene.bringToTop('HUDScene');
    audio.playMusic(this.meta.music);

    this.events.on(Phaser.Scenes.Events.RESUME, () => this.controls.reset());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      progress.save();
      this.scene.stop('HUDScene');
    });

    // cartão de abertura da fase + objetivo (feedback item 2: fala de paletas E produtos)
    const names = productsForStage(this.levelId).map((p) => p.label).join(', ');
    this.time.delayedCall(300, () => {
      hudBus.send('title', `FASE ${this.levelId}`, this.meta.name, `Colete as paletas de cores e encontre: ${names}.`);
    });
  }

  private resetRuntime(): void {
    this.checkpoints = [];
    this.movers = [];
    this.crumbles = [];
    this.brushes = [];
    this.drippers = [];
    this.signs = [];
    this.nearSign = null;
    this.tipOpen = false;
    this.tutorialsShown = new Set();
    this.lookAhead = 0;
    this.portalCooldown = 0;
    this.finished = false;
    this.busy = false;
    this.saveClock = 0;
    this.runTime = 0;
  }

  // ------------------------------------------------------------ construção
  private buildBackground(): void {
    const id = this.meta.theme;
    this.add.image(0, 0, `sky-${id}`).setOrigin(0).setScrollFactor(0).setDepth(-30);
    this.far = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, `far-${id}`).setOrigin(0).setScrollFactor(0).setDepth(-20);
    this.mid = this.add.tileSprite(0, 0, GAME_WIDTH, GAME_HEIGHT, `mid-${id}`).setOrigin(0).setScrollFactor(0).setDepth(-10);

    for (const d of this.layout.decor) {
      if (d.type === 'banner') this.banner(d.x, d.y, d.text ?? '');
    }
  }

  /** Faixa de marca pendurada no cenário (presença de marca, feedback item 8). */
  private banner(x: number, y: number, text: string): void {
    const theme = THEMES[this.meta.theme];
    const g = this.add.graphics().setDepth(-2);
    g.fillStyle(0xb08d57, 1);
    g.fillRect(x - 170, y - 10, 6, GROUND_Y - y + 10);
    g.fillRect(x + 164, y - 10, 6, GROUND_Y - y + 10);
    g.fillStyle(0xfaf7f5, 0.95);
    g.fillRoundedRect(x - 160, y, 320, 70, 12);
    g.lineStyle(3, Phaser.Display.Color.HexStringToColor(theme.accent).color, 1);
    g.strokeRoundedRect(x - 160, y, 320, 70, 12);
    this.add.text(x, y + 22, 'RARE BEAUTY', { fontFamily: FONT_BODY, fontSize: '12px', fontStyle: '700', color: theme.hudTint }).setOrigin(0.5).setLetterSpacing(6).setDepth(-1);
    this.add.text(x, y + 46, text, { fontFamily: '"Playfair Display", Georgia, serif', fontSize: '24px', fontStyle: '600', color: '#1A1A1A' }).setOrigin(0.5).setDepth(-1);
  }

  private buildWorld(): void {
    const theme = this.meta.theme;
    this.solids = this.physics.add.staticGroup();

    for (const [from, to] of this.layout.ground) {
      const w = to - from;
      const key = platformKey(this, theme, w, WORLD_HEIGHT - GROUND_Y + 40, 'ground');
      const img = this.solids.create(from + w / 2, GROUND_Y + (WORLD_HEIGHT - GROUND_Y + 40) / 2, key) as Phaser.Physics.Arcade.Image;
      img.setDepth(4);
      img.refreshBody();
    }

    for (const p of this.layout.platforms) {
      const key = platformKey(this, theme, p.w, PLATFORM_H, p.kind);
      if (p.kind === 'crumble') {
        this.crumbles.push(new CrumblePlatform(this, p, key));
        continue;
      }
      const img = this.solids.create(p.x + p.w / 2, p.y + PLATFORM_H / 2, key) as Phaser.Physics.Arcade.Image;
      img.setDepth(8);
      img.refreshBody();
      if (p.kind === 'soft') oneWay(img.body as Phaser.Physics.Arcade.StaticBody);
    }

    for (const m of this.layout.moving) {
      this.movers.push(new MovingPlatform(this, m, platformKey(this, theme, m.w, PLATFORM_H, 'solid')));
    }
  }

  private buildEntities(): void {
    const level = this.levelId;
    this.boxes = this.add.group();
    this.pickups = this.add.group();
    this.hazards = this.add.group();

    for (const def of this.layout.boxes) this.boxes.add(new RareBox(this, def, progress.isBoxOpen(level, def.id)));

    for (const item of this.layout.products) {
      if (!progress.hasProduct(item.id)) this.addPickup(item.x, item.y, 'product', item.id);
    }
    for (const item of this.layout.secrets) {
      if (!progress.hasSecret(item.id)) this.addPickup(item.x, item.y, 'secret', item.id);
    }
    for (const item of this.layout.palettes) {
      if (!progress.hasPalette(level, item.id)) this.addPickup(item.x, item.y, 'palette', item.id);
    }
    // produtos de caixas já abertas que ainda não foram pegos voltam a flutuar
    for (const def of this.layout.boxes) {
      if (!progress.isBoxOpen(level, def.id)) continue;
      const c = def.content;
      const spot = this.landingSpot(def);
      if (c.type === 'product' && !progress.hasProduct(c.id)) this.addPickup(spot.x, spot.y, 'product', c.id);
      if (c.type === 'secret' && !progress.hasSecret(c.id)) this.addPickup(spot.x, spot.y, 'secret', c.id);
    }

    for (const h of this.layout.hazards) {
      if (h.type === 'bottle') this.hazards.add(createBottle(this, h));
      else if (h.type === 'brush') {
        const brush = new Brush(this, h);
        this.brushes.push(brush);
        this.hazards.add(brush);
      } else {
        const floor = this.floorAt(h.x);
        this.drippers.push(new Dripper(this, h, floor, (drop) => this.hazards.add(drop)));
      }
    }

    const saved = progress.state.checkpoints[level];
    const savedIndex = this.layout.checkpoints.findIndex((c) => c.id === saved);
    this.layout.checkpoints.forEach((def, i) => {
      this.checkpoints.push(new Checkpoint(this, def, i <= savedIndex));
    });

    for (const s of this.layout.signs) {
      this.add.image(s.x, s.y, 'sign').setOrigin(0.5, 1).setDepth(5);
      const bubble = this.add.container(s.x, s.y - 120).setDepth(30).setAlpha(0);
      const bg = this.add.graphics();
      bg.fillStyle(HEX.white, 1);
      bg.fillRoundedRect(-22, -18, 44, 36, 12);
      bg.lineStyle(2, HEX.mauve, 1);
      bg.strokeRoundedRect(-22, -18, 44, 36, 12);
      bubble.add([bg, this.add.text(0, 0, 'E', { fontFamily: FONT_BODY, fontSize: '20px', fontStyle: '700', color: '#8A5A62' }).setOrigin(0.5)]);
      this.signs.push({ x: s.x, y: s.y, tip: s.tip, bubble });
    }

    // portal (espelho final)
    const px = this.layout.portalX;
    this.portalGlow = this.add.image(px, GROUND_Y - 140, 'spark').setScale(22).setAlpha(0.35).setDepth(2).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: this.portalGlow, alpha: 0.6, scale: 25, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.portal = this.add.image(px, GROUND_Y, 'portal').setOrigin(0.5, 1).setDepth(3);
    this.portalZone = this.add.zone(px, GROUND_Y - 120, 80, 220);
    this.physics.add.existing(this.portalZone, true);
    this.refreshPortal();
  }

  private addPickup(x: number, y: number, kind: PickupKind, id: string): Pickup {
    const texture =
      kind === 'product' ? PRODUCTS_BY_ID[id]?.icon ?? 'secret' : kind === 'secret' ? 'secret' : kind === 'palette' ? 'palette' : kind === 'heart' ? 'heart' : 'bonus';
    const pickup = new Pickup(this, x, y, kind, id, texture);
    this.pickups.add(pickup);
    return pickup;
  }

  /** Altura do primeiro chão sob x (onde a gota vai se espatifar). */
  private floorAt(x: number): number {
    const onGround = this.layout.ground.some(([a, b]) => x >= a && x <= b);
    return onGround ? GROUND_Y : KILL_Y;
  }

  private buildPlayer(): void {
    const saved = progress.state.checkpoints[this.levelId];
    const cp = this.layout.checkpoints.find((c) => c.id === saved);
    this.respawnPoint = cp ? { x: cp.x, y: cp.y } : { x: this.layout.spawnX, y: GROUND_Y };
    this.player = new Player(this, this.respawnPoint.x, this.respawnPoint.y - 2);
    this.player.on('land', (x: number, y: number) => this.dust.explode(6, x, y));
    this.cameras.main.startFollow(this.player, true, 0.09, 0.2, 0, 0);
  }

  private buildParticles(): void {
    this.sparks = this.add.particles(0, 0, 'star', {
      speed: { min: 80, max: 260 },
      lifespan: 650,
      scale: { start: 0.9, end: 0 },
      alpha: { start: 1, end: 0 },
      rotate: { min: 0, max: 180 },
      tint: [0xffffff, 0xf4ddb8, 0xf0d5d8, 0xd6ae62],
      emitting: false,
    });
    this.sparks.setDepth(40);
    this.dust = this.add.particles(0, 0, 'spark', {
      speedX: { min: -90, max: 90 },
      speedY: { min: -60, max: -10 },
      lifespan: 380,
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.7, end: 0 },
      tint: 0xffffff,
      emitting: false,
    });
    this.dust.setDepth(19);
  }

  private buildColliders(): void {
    const p = this.player;
    this.physics.add.collider(p, this.solids);
    this.physics.add.collider(p, this.movers);
    this.physics.add.collider(p, this.crumbles, (_a, b) => {
      const crumble = b as CrumblePlatform;
      if (p.body.touching.down) crumble.trigger();
    });
    this.physics.add.collider(p, this.boxes, (_a, b) => {
      const box = b as RareBox;
      if (p.body.touching.up && box.body.touching.down) this.onBoxHit(box);
    });
    this.physics.add.overlap(p, this.pickups, (_a, b) => this.onPickup(b as Pickup));
    this.physics.add.overlap(p, this.hazards, (_a, b) => this.damage((b as Body).body.center.x));
    this.physics.add.overlap(p, this.checkpoints, (_a, b) => this.onCheckpoint(b as Checkpoint));
    this.physics.add.overlap(p, this.portalZone, () => this.onPortal());
  }

  // ---------------------------------------------------------------- loop
  override update(_time: number, delta: number): void {
    const dt = Math.min(delta, 50);
    this.controls.update();

    for (const m of this.movers) m.step(dt);
    for (const b of this.brushes) b.step(dt);
    for (const d of this.drippers) d.step(dt);
    this.hazards.getChildren().forEach((child) => (child as Hazard).step?.(dt));

    this.player.update(this.controls, dt);

    if (!this.finished && !this.busy) {
      this.runTime += dt / 1000;
      progress.addTime(this.levelId, dt / 1000);
      this.saveClock += dt;
      if (this.saveClock > 4000) {
        this.saveClock = 0;
        progress.save();
      }
      if (this.player.y > KILL_Y) this.fall();
      this.checkTutorials();
      this.checkSigns();
    }

    this.portalCooldown = Math.max(0, this.portalCooldown - dt);
    this.updateCamera(dt);
  }

  private updateCamera(dt: number): void {
    // look-ahead: mostra mais espaço à frente da Maya (SPEC §31)
    const vx = this.player.body.velocity.x;
    const target = Math.abs(vx) > 40 ? (vx > 0 ? -150 : 150) : this.lookAhead * 0.98;
    this.lookAhead += (target - this.lookAhead) * Math.min(1, dt / 450);
    this.cameras.main.setFollowOffset(this.lookAhead, 0);

    const scroll = this.cameras.main.scrollX;
    this.far.tilePositionX = scroll * 0.2;
    this.mid.tilePositionX = scroll * 0.45;
  }

  private checkTutorials(): void {
    if (this.runTime < 3.4) return;
    this.layout.tutorials.forEach((t, i) => {
      if (this.tutorialsShown.has(i) || this.player.x < t.x) return;
      this.tutorialsShown.add(i);
      const touch = this.sys.game.device.input.touch && t.touchText;
      hudBus.send('tutorial', touch ? t.touchText! : t.text);
    });
  }

  private checkSigns(): void {
    const near = this.signs.find((s) => Math.abs(s.x - this.player.x) < 70 && Math.abs(s.y - this.player.y) < 60) ?? null;
    if (near !== this.nearSign) {
      if (this.nearSign) this.tweens.add({ targets: this.nearSign.bubble, alpha: 0, duration: 150 });
      if (near) this.tweens.add({ targets: near.bubble, alpha: 1, y: near.y - 126, duration: 180 });
      if (!near && this.tipOpen) {
        this.tipOpen = false;
        hudBus.send('tip', null);
      }
      this.nearSign = near;
      hudBus.send('interact', Boolean(near));
    }
    if (near && this.controls.interactPressed) {
      this.tipOpen = !this.tipOpen;
      hudBus.send('tip', this.tipOpen ? RARE_TIPS[near.tip] ?? null : null);
      if (this.tipOpen) audio.play('sign');
    }
  }

  // ------------------------------------------------------------ eventos
  private toScreen(x: number, y: number): { x: number; y: number } {
    const cam = this.cameras.main;
    return { x: x - cam.scrollX, y: y - cam.scrollY };
  }

  private onBoxHit(box: RareBox): void {
    this.player.bumpHead();
    const opened = box.hit();
    if (!opened) {
      audio.play('box_bump');
      return;
    }
    audio.play('rarebox');
    progress.openBox(this.levelId, box.def.id);
    progress.addScore(this.levelId, POINTS.rareBox);
    this.sparks.explode(10, box.x, box.y - BOX_SIZE / 2);

    const topY = box.y - BOX_SIZE / 2;
    const content = box.content;
    switch (content.type) {
      case 'product':
      case 'secret': {
        audio.play('item_appear');
        const pickup = this.addPickup(box.x, topY, content.type, content.id);
        pickup.emerge(topY, box.y - 76, this.landingSpot(box));
        break;
      }
      case 'heart': {
        audio.play('item_appear');
        const pickup = this.addPickup(box.x, topY, 'heart', `${box.def.id}-heart`);
        pickup.emerge(topY, box.y - 70, this.landingSpot(box));
        break;
      }
      case 'palette': {
        // a paleta salta e entra direto na bolsa, como uma moeda
        const pal = this.add.image(box.x, topY, 'palette').setDepth(30);
        this.tweens.add({ targets: pal, y: topY - 80, duration: 260, ease: 'Quad.easeOut', yoyo: true, onComplete: () => pal.destroy() });
        this.collectPalette(box.def.id, box.x, topY - 60);
        break;
      }
      case 'bonus': {
        const star = this.add.image(box.x, topY, 'bonus').setDepth(30);
        this.tweens.add({ targets: star, y: topY - 90, angle: 180, alpha: 0, duration: 600, onComplete: () => star.destroy() });
        audio.play('sparkle');
        progress.addScore(this.levelId, 50);
        this.floatText(box.x, topY - 40, '+50');
        break;
      }
    }
    hudBus.send('refresh');
  }

  /** Lugar livre ao lado da caixa, na altura do corpo da Maya. */
  private landingSpot(box: { x: number; y: number }): { x: number; y: number } {
    let x = box.x + 90;
    const blocked = (cx: number): boolean => this.layout.boxes.some((b) => Math.abs(b.x - cx) < 60 && Math.abs(b.y - box.y) < 10);
    while (blocked(x)) x += BOX_SIZE;
    return { x, y: box.y + 52 };
  }

  private collectPalette(id: string, x: number, y: number): void {
    if (!progress.addPalette(this.levelId, id)) return;
    progress.addScore(this.levelId, POINTS.palette);
    audio.play('palette');
    this.sparks.explode(5, x, y);
    const s = this.toScreen(x, y);
    hudBus.send('palette', s.x, s.y);
    hudBus.send('refresh');
  }

  private onPickup(pickup: Pickup): void {
    if (pickup.collected || !pickup.ready) return;
    const s = this.toScreen(pickup.x, pickup.y);

    switch (pickup.kind) {
      case 'palette':
        pickup.collect();
        this.collectPalette(pickup.refId, pickup.x, pickup.y);
        return;
      case 'heart':
        pickup.collect();
        audio.play('heart');
        this.lives = Math.min(MAX_LIVES, this.lives + 1);
        progress.setLives(this.lives);
        progress.addScore(this.levelId, 50);
        hudBus.send('message', this.lives === MAX_LIVES ? 'Corações cheios!' : '+1 coração', 1600, 'good');
        break;
      case 'product': {
        const product = PRODUCTS_BY_ID[pickup.refId];
        pickup.collect();
        if (!product || !progress.addProduct(product.id)) return;
        progress.addScore(this.levelId, POINTS.requiredProduct);
        audio.play('product_found');
        this.sparks.explode(22, pickup.x, pickup.y);
        hudBus.send('item', {
          kicker: 'ITEM ENCONTRADO',
          title: product.label.toUpperCase(),
          subtitle: `${product.line}\nAdicionado à sua Rare Bag.`,
          texture: product.icon,
          screenX: s.x,
          screenY: s.y,
        });
        this.refreshPortal();
        break;
      }
      case 'secret': {
        const secret = SECRETS_BY_ID[pickup.refId];
        pickup.collect();
        if (!secret || !progress.addSecret(secret.id)) return;
        progress.addScore(this.levelId, POINTS.secretItem);
        audio.play('secret_found');
        this.sparks.explode(30, pickup.x, pickup.y);
        hudBus.send('item', {
          kicker: 'ITEM SECRETO!',
          title: secret.name.toUpperCase(),
          subtitle: `${secret.description}\nNovos tons liberados no Rare Studio.`,
          texture: 'secret',
          screenX: s.x,
          screenY: s.y,
          secret: true,
        });
        break;
      }
      default:
        pickup.collect();
    }
    hudBus.send('refresh');
  }

  private onCheckpoint(cp: Checkpoint): void {
    // o espelho mais à frente vira o ponto de retorno
    if (cp.def.x > this.respawnPoint.x || !cp.lit) this.respawnPoint = { x: cp.def.x, y: cp.def.y };
    if (!cp.light()) return;
    progress.setCheckpoint(this.levelId, cp.def.id);
    audio.play('checkpoint');
    this.sparks.explode(18, cp.x, cp.y - 90);
    hudBus.send('message', 'CHECKPOINT · o espelho guardou seu progresso', 2200, 'good');
  }

  private refreshPortal(): void {
    const missing = Inventory.missingForLevel(this.levelId).length;
    this.portal.setAlpha(missing ? 0.55 : 1);
    this.portalGlow.setVisible(missing === 0);
  }

  private onPortal(): void {
    if (this.finished || this.portalCooldown > 0) return;
    const missing = Inventory.missingForLevel(this.levelId);
    if (missing.length) {
      this.portalCooldown = 3000;
      audio.play('portal_locked');
      const names = missing.map((p) => p.label).join(', ');
      hudBus.send('message', `O espelho ainda está fechado. Falta encontrar: ${names}.`, 3200, 'warn');
      return;
    }
    this.finishLevel();
  }

  // ------------------------------------------------------ dano e retorno
  private damage(fromX: number): void {
    if (this.player.invulnerable || this.player.frozen || this.finished || this.busy) return;
    this.lives -= 1;
    progress.setLives(this.lives);
    audio.play('damage');
    this.cameras.main.shake(180, 0.006);
    this.player.hurt(fromX);
    hudBus.send('refresh');
    if (this.lives <= 0) {
      this.time.delayedCall(450, () => this.gameOver());
      return;
    }
    // feedback item 4: mensagem visível por mais tempo
    hudBus.send('message', Phaser.Utils.Array.GetRandom(DAMAGE_LINES), 2800, 'warn');
  }

  private fall(): void {
    if (this.busy) return;
    this.busy = true;
    this.lives -= 1;
    progress.setLives(this.lives);
    audio.play('fall');
    hudBus.send('refresh');
    if (this.lives <= 0) {
      this.player.frozen = true;
      this.player.body.setVelocity(0, 0);
      this.player.body.setAllowGravity(false);
      this.gameOver();
      return;
    }
    hudBus.send('message', 'Ops! Respire e siga em frente. Seus produtos continuam na Rare Bag.', 3000, 'warn');
    this.cameras.main.fadeOut(260, 43, 27, 34);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.player.respawn(this.respawnPoint.x, this.respawnPoint.y - 2);
      this.cameras.main.fadeIn(320, 43, 27, 34);
      this.busy = false;
    });
  }

  /** Corações acabaram: tela de feedback antes de voltar (feedback item 4). */
  private gameOver(): void {
    this.busy = true;
    audio.play('game_over');
    this.controls.reset();
    this.scene.pause();
    this.scene.launch('GameOverScene', { levelKey: this.scene.key });
  }

  /** Chamado pela GameOverScene: volta ao último espelho com 3 corações. */
  retry(): void {
    progress.registerRetry();
    this.lives = MAX_LIVES;
    this.player.body.setAllowGravity(true);
    this.player.respawn(this.respawnPoint.x, this.respawnPoint.y - 2);
    this.cameras.main.fadeIn(400, 43, 27, 34);
    this.busy = false;
    hudBus.send('refresh');
    hudBus.send('message', 'Você voltou ao último espelho. Vamos lá!', 2400, 'good');
  }

  /** Pedido pela pausa ("voltar ao espelho"): sem custo de coração. */
  returnToCheckpoint(): void {
    this.player.respawn(this.respawnPoint.x, this.respawnPoint.y - 2);
    this.cameras.main.flash(300, 250, 247, 245);
  }

  // --------------------------------------------------------- conclusão
  private finishLevel(): void {
    this.finished = true;
    this.player.celebrate();
    audio.play('portal');
    this.sparks.explode(40, this.portal.x, this.portal.y - 150);
    hudBus.send('interact', false);

    this.time.delayedCall(900, () => {
      audio.play('level_complete');
      this.tweens.add({
        targets: this.player,
        x: this.portal.x,
        y: GROUND_Y - 60,
        scale: 0.2,
        alpha: 0,
        duration: 700,
        ease: 'Quad.easeIn',
      });
    });

    const level = this.levelId;
    const palettesFound = (progress.state.palettes[level] ?? []).length;
    const allPalettes = palettesFound >= this.meta.counts.palettes;
    const elapsed = progress.state.levelTime[level] ?? this.runTime;
    const bonus = levelBonus(elapsed, this.meta.targetTime, allPalettes);
    progress.addScore(level, bonus.completion + bonus.time + bonus.exploration);
    progress.completeLevel(level);

    this.time.delayedCall(2000, () => {
      this.cameras.main.fadeOut(500, 250, 247, 245);
      this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
        this.scene.start('LevelCompleteScene', { levelId: level, bonus });
      });
    });
  }

  // -------------------------------------------------------------- pausa
  openPause(mode: 'pause' | 'home'): void {
    if (this.finished || this.busy || !this.scene.isActive()) return;
    audio.play('pause');
    this.controls.reset();
    this.scene.pause();
    this.scene.launch('PauseScene', { levelKey: this.scene.key, levelId: this.levelId, mode });
  }

  private floatText(x: number, y: number, text: string): void {
    const t = this.add
      .text(x, y, text, { fontFamily: FONT_BODY, fontSize: '22px', fontStyle: '700', color: '#FFFFFF', stroke: '#8A5A62', strokeThickness: 4 })
      .setOrigin(0.5)
      .setDepth(40);
    this.tweens.add({ targets: t, y: y - 50, alpha: 0, duration: 900, ease: 'Quad.easeOut', onComplete: () => t.destroy() });
  }
}
