/**
 * DressingRoomScene — RARE STUDIO (SPEC §23–25).
 *
 * Só aparecem os produtos que a jogadora encontrou no platformer. Ela escolhe
 * produto → tom, e a camada correspondente do avatar é repintada (compositor
 * em camadas reaproveitado da v1). Nada aqui é avaliado: não há "certo" nem
 * "errado", e o Rare Studio não mexe na pontuação.
 */
import Phaser from 'phaser';
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  PRODUCTS,
  SECRETS_BY_ID,
  availableShades,
  type Product,
  type ProductCategory,
} from '../../data/products';
import { FINISHES } from '../../data/catalog.js';
import { COLORS, HEX, GAME_HEIGHT, displayText, bodyText, labelText, FONT_BODY } from '../theme';
import { Button, panel } from '../ui/Button';
import { brandBackdrop, brandMark, fadeIn, goTo } from '../ui/helpers';
import { Portrait } from '../avatar/portrait';
import progress from '../systems/ProgressSystem';
import audio from '../systems/AudioSystem';

const MIRROR = { x: 340, y: 380 };
const PANEL = { x: 905, w: 690 };

export class DressingRoomScene extends Phaser.Scene {
  private portrait!: Portrait;
  private portraitImage!: Phaser.GameObjects.Image;
  private miniMaya!: Phaser.GameObjects.Sprite;
  private category: ProductCategory = 'cheeks';
  private product: Product | null = null;
  private dynamic!: Phaser.GameObjects.Container;
  private tabs: Phaser.GameObjects.Container[] = [];

  constructor() {
    super('DressingRoomScene');
  }

  create(): void {
    fadeIn(this, 500);
    brandBackdrop(this);
    audio.playMusic('studio');
    if (!progress.isLevelComplete(3)) progress.completeLevel(3);
    this.tabs = [];

    this.buildMirror();
    this.buildPanel();

    const firstWithProducts = CATEGORY_ORDER.find((c) => this.productsIn(c).length) ?? 'cheeks';
    this.selectCategory(firstWithProducts, false);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.portrait.destroy());
  }

  private buildMirror(): void {
    const g = this.add.graphics();
    // moldura em arco dourado
    const w = 400;
    const h = 600;
    const left = MIRROR.x - w / 2;
    const top = MIRROR.y - h / 2;
    g.fillStyle(0x8a5a62, 0.16);
    g.fillRoundedRect(left + 6, top + 14, w, h, { tl: w / 2, tr: w / 2, bl: 24, br: 24 });
    g.fillStyle(0xd6ae62, 1);
    g.fillRoundedRect(left, top, w, h, { tl: w / 2, tr: w / 2, bl: 24, br: 24 });
    g.fillGradientStyle(0xfff6f2, 0xfff6f2, 0xf0d5d8, 0xe8c3cc, 1);
    g.fillRoundedRect(left + 16, top + 16, w - 32, h - 32, { tl: w / 2 - 16, tr: w / 2 - 16, bl: 14, br: 14 });

    this.portrait = new Portrait(this, 'studio-portrait', 480);
    this.portrait.render(progress.state.selectedMakeup);
    this.portraitImage = this.add.image(MIRROR.x, MIRROR.y + 32, 'studio-portrait').setScale(0.74);
    // reflexo do vidro
    const shine = this.add.graphics();
    shine.fillStyle(0xffffff, 0.22);
    shine.fillEllipse(left + 90, top + 170, 36, 180);

    this.add.text(MIRROR.x, top + h + 2, 'RARE STUDIO', labelText(12, COLORS.mauve)).setOrigin(0.5, 1).setLetterSpacing(6).setAlpha(0);

    // mini Maya sentada na penteadeira (SPEC §33: sit / pick-product / apply-makeup)
    this.miniMaya = this.add.sprite(80, GAME_HEIGHT - 6, 'maya', 'sit').setOrigin(0.5, 1).setScale(1.35);
    this.miniMaya.play('sit');
  }

  private buildPanel(): void {
    const cx = PANEL.x;
    brandMark(this, cx, 36, COLORS.rose, 13);
    this.add.text(cx, 72, 'Rare Studio', displayText(38, COLORS.ink)).setOrigin(0.5);
    panel(this, cx, 370, PANEL.w, 480, { alpha: 0.92 });

    CATEGORY_ORDER.forEach((cat, i) => {
      const x = cx - 2 * 132 + i * 132;
      const c = this.add.container(x, 158);
      const bg = this.add.graphics();
      const label = this.add.text(0, 0, CATEGORY_LABELS[cat].toUpperCase(), labelText(12, COLORS.mauve)).setOrigin(0.5).setLetterSpacing(1.5);
      c.add([bg, label]);
      c.setSize(124, 40);
      c.setData('cat', cat);
      c.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        audio.play('ui_select');
        this.selectCategory(cat);
      });
      this.tabs.push(c);
    });

    this.dynamic = this.add.container(0, 0);

    this.add
      .text(cx, 578, 'Não existe look certo ou errado. Escolha o que é a sua cara.', bodyText(15, COLORS.mauve, { fontStyle: 'italic' }))
      .setOrigin(0.5);

    new Button(this, cx - 170, GAME_HEIGHT - 58, 'LIMPAR TUDO', () => this.clearAll(), { width: 220, variant: 'secondary', fontSize: 14, sound: 'ui_back' });
    new Button(this, cx + 130, GAME_HEIGHT - 58, 'FINALIZAR LOOK', () => this.finish(), { width: 320 });
  }

  private productsIn(category: ProductCategory): Product[] {
    return PRODUCTS.filter((p) => p.category === category && progress.hasProduct(p.id));
  }

  private selectCategory(category: ProductCategory, playAnim = true): void {
    this.category = category;
    this.tabs.forEach((tab) => {
      const active = tab.getData('cat') === category;
      const bg = tab.list[0] as Phaser.GameObjects.Graphics;
      const label = tab.list[1] as Phaser.GameObjects.Text;
      bg.clear();
      bg.fillStyle(active ? HEX.mauve : HEX.blush, active ? 1 : 0.7);
      bg.fillRoundedRect(-62, -20, 124, 40, 20);
      label.setColor(active ? COLORS.white : COLORS.mauve);
    });
    const products = this.productsIn(category);
    this.product = products[0] ?? null;
    if (playAnim && this.product) this.mayaAnim('pick-product', 900);
    this.redraw();
  }

  private selectProduct(product: Product): void {
    this.product = product;
    audio.play('product_pick');
    this.mayaAnim('pick-product', 900);
    this.redraw();
  }

  private applyShade(shadeId: string | null): void {
    if (!this.product) return;
    progress.setMakeup(this.product.slot, shadeId);
    this.portrait.render(progress.state.selectedMakeup);
    audio.play(shadeId ? 'makeup_apply' : 'makeup_remove');
    if (shadeId) {
      this.mayaAnim('apply-makeup', 1100);
      this.sparkleFace();
    }
    this.redraw();
  }

  private clearAll(): void {
    for (const slot of Object.keys(progress.state.selectedMakeup)) progress.setMakeup(slot, null);
    this.portrait.render({});
    this.redraw();
  }

  private mayaAnim(key: string, duration: number): void {
    this.miniMaya.play(key);
    this.time.delayedCall(duration, () => this.miniMaya.play('look-at-mirror'));
  }

  private sparkleFace(): void {
    for (let i = 0; i < 6; i++) {
      const s = this.add.image(MIRROR.x + Phaser.Math.Between(-70, 70), MIRROR.y - 110 + Phaser.Math.Between(-50, 60), 'star').setScale(0).setDepth(5);
      this.tweens.add({ targets: s, scale: Phaser.Math.FloatBetween(0.5, 1), alpha: 0, angle: 90, duration: 600, delay: i * 50, onComplete: () => s.destroy() });
    }
    this.tweens.add({ targets: this.portraitImage, scale: 0.755, duration: 120, yoyo: true });
  }

  /** Reconstrói a parte que muda: produtos da categoria, tons, descrição. */
  private redraw(): void {
    this.dynamic.removeAll(true);
    const cx = PANEL.x;
    const products = this.productsIn(this.category);
    const d = this.dynamic;

    if (!products.length) {
      d.add(this.add.text(cx, 330, 'Nenhum produto desta categoria na sua Rare Bag.', bodyText(17, COLORS.muted)).setOrigin(0.5));
      return;
    }

    // cards de produto
    products.forEach((p, i) => {
      const x = cx + (i - (products.length - 1) / 2) * 170;
      const active = p.id === this.product?.id;
      const applied = Boolean(progress.state.selectedMakeup[p.slot]);
      const card = this.add.container(x, 250);
      const bg = this.add.graphics();
      bg.fillStyle(active ? HEX.blush : 0xffffff, 1);
      bg.fillRoundedRect(-75, -52, 150, 104, 18);
      bg.lineStyle(active ? 3 : 1.5, active ? HEX.mauve : HEX.rose, active ? 1 : 0.5);
      bg.strokeRoundedRect(-75, -52, 150, 104, 18);
      const icon = this.add.image(-38, -2, p.icon).setScale(0.78);
      // bolinha com o tom aplicado
      const dot = this.add.circle(10, 30, 8, Phaser.Display.Color.HexStringToColor(this.shadeColor(p) ?? '#FFFFFF').color).setVisible(applied);
      card.add([
        bg,
        icon,
        dot,
        this.add.text(4, -22, p.label.toUpperCase(), labelText(13, COLORS.ink)).setLetterSpacing(1),
        this.add.text(24, 24, applied ? 'aplicado' : 'toque para usar', bodyText(11, applied ? COLORS.mauve : COLORS.muted)),
      ]);
      card.setSize(150, 104);
      card.setInteractive({ useHandCursor: true }).on('pointerup', () => this.selectProduct(p));
      d.add(card);
    });

    const product = this.product;
    if (!product) return;

    d.add(this.add.text(cx, 326, product.line, displayText(20, COLORS.ink)).setOrigin(0.5));
    d.add(this.add.text(cx, 354, product.description, bodyText(14, COLORS.muted)).setOrigin(0.5));

    // tons: "sem" + tons disponíveis + tons secretos bloqueados
    const selected = progress.state.selectedMakeup[product.slot] ?? null;
    const available = availableShades(product, progress.state.secretItems);
    const locked = product.shades.filter((s) => !available.includes(s));
    const entries: { id: string | null; name: string; color: string | null; locked?: string }[] = [
      { id: null, name: 'Sem', color: null },
      ...available.map((s) => ({ id: s.id, name: s.name, color: s.color })),
      ...locked.map((s) => ({ id: s.id, name: s.name, color: s.color, locked: s.unlockedBy })),
    ];
    const gap = Math.min(92, 600 / entries.length);
    entries.forEach((entry, i) => {
      const x = cx + (i - (entries.length - 1) / 2) * gap;
      const y = 420;
      const isSel = entry.id === selected;
      const g = this.add.graphics();
      if (isSel) {
        g.lineStyle(3, HEX.mauve, 1);
        g.strokeCircle(x, y, 31);
      }
      if (entry.color) {
        g.fillStyle(Phaser.Display.Color.HexStringToColor(entry.color).color, entry.locked ? 0.25 : 1);
        g.fillCircle(x, y, 25);
        g.fillStyle(0xffffff, entry.locked ? 0.2 : 0.35);
        g.fillCircle(x - 8, y - 8, 7);
      } else {
        g.lineStyle(2, HEX.rose, 1);
        g.strokeCircle(x, y, 24);
        g.lineBetween(x - 16, y + 16, x + 16, y - 16);
      }
      d.add(g);
      const label = this.add
        .text(x, y + 44, entry.locked ? '🔒' : entry.name, bodyText(12, isSel ? COLORS.mauve : COLORS.muted, { fontStyle: isSel ? '700' : '400', align: 'center', wordWrap: { width: gap - 4 } }))
        .setOrigin(0.5, 0);
      d.add(label);
      const hit = this.add.zone(x, y, 60, 60).setInteractive({ useHandCursor: !entry.locked });
      hit.on('pointerup', () => {
        if (entry.locked) {
          audio.play('portal_locked');
          const secret = entry.locked ? SECRETS_BY_ID[entry.locked] : null;
          this.toast(`Tom secreto: encontre "${secret?.name ?? 'um item secreto'}" nas fases para liberar.`);
          return;
        }
        this.applyShade(entry.id);
      });
      d.add(hit);
    });

    const shade = product.shades.find((s) => s.id === selected);
    d.add(
      this.add
        .text(cx, 520, shade ? `${shade.name} · ${FINISHES[shade.finish] ?? shade.finish} — ${shade.description}` : 'Escolha um tom (ou deixe sem).', bodyText(15, COLORS.ink))
        .setOrigin(0.5),
    );
  }

  private shadeColor(p: Product): string | undefined {
    const id = progress.state.selectedMakeup[p.slot];
    return p.shades.find((s) => s.id === id)?.color;
  }

  private toast(text: string): void {
    const t = this.add
      .text(PANEL.x, 548, text, { fontFamily: FONT_BODY, fontSize: '14px', fontStyle: '700', color: COLORS.white, backgroundColor: COLORS.mauve, padding: { x: 14, y: 8 } })
      .setOrigin(0.5)
      .setDepth(20);
    this.tweens.add({ targets: t, alpha: 0, delay: 2600, duration: 400, onComplete: () => t.destroy() });
  }

  private finish(): void {
    audio.play('reveal');
    this.input.enabled = false;
    // a interface some, Maya se levanta (SPEC §26)
    this.miniMaya.play('final-pose');
    this.cameras.main.flash(400, 255, 246, 238);
    goTo(this, 'RevealScene', undefined, 700, 0xfaf7f5);
    this.time.delayedCall(900, () => (this.input.enabled = true));
  }
}

