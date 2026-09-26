/**
 * CollectionScene — "VER MINHA COLEÇÃO" (SPEC §26): tudo o que já foi
 * encontrado em qualquer partida, mais os últimos looks criados.
 */
import Phaser from 'phaser';
import { PRODUCTS, SECRET_ITEMS } from '../../data/products';
import { COLORS, HEX, GAME_WIDTH, displayText, bodyText, labelText } from '../theme';
import { Button } from '../ui/Button';
import { brandBackdrop, brandMark, fadeIn, goTo } from '../ui/helpers';
import { Portrait } from '../avatar/portrait';
import progress from '../systems/ProgressSystem';

export class CollectionScene extends Phaser.Scene {
  private from = 'MenuScene';
  private portraits: Portrait[] = [];

  constructor() {
    super('CollectionScene');
  }

  init(data: { from?: string }): void {
    this.from = data.from ?? 'MenuScene';
  }

  create(): void {
    fadeIn(this);
    brandBackdrop(this);
    const c = progress.collection;
    const cx = GAME_WIDTH / 2;

    brandMark(this, cx, 36, COLORS.rose, 13);
    this.add.text(cx, 76, 'Minha Coleção', displayText(40, COLORS.ink)).setOrigin(0.5);
    this.add
      .text(cx, 116, `Melhor pontuação: ${c.bestScore}   ·   Melhor exploração: ${c.bestExploration}%   ·   Looks criados: ${c.playthroughs}`, bodyText(15, COLORS.mauve))
      .setOrigin(0.5);

    // produtos
    this.add.text(80, 150, 'PRODUTOS', labelText(12, COLORS.rose)).setLetterSpacing(4);
    PRODUCTS.forEach((p, i) => {
      const x = 130 + i * 140;
      const has = c.products.includes(p.id);
      const g = this.add.graphics();
      g.fillStyle(has ? HEX.white : 0xf3eeec, has ? 0.95 : 0.7);
      g.fillRoundedRect(x - 60, 172, 120, 150, 18);
      const icon = this.add.image(x, 228, p.icon).setScale(0.9);
      if (!has) icon.setTint(0xb8a9a3).setAlpha(0.4);
      this.add.text(x, 282, has ? p.label.toUpperCase() : '???', labelText(12, has ? COLORS.ink : COLORS.muted)).setOrigin(0.5).setLetterSpacing(1);
      this.add.text(x, 302, has ? `${p.shades.length} tons` : `Fase ${p.stage}`, bodyText(11, COLORS.muted)).setOrigin(0.5);
    });

    // secretos
    this.add.text(80, 342, 'ITENS SECRETOS', labelText(12, COLORS.rose)).setLetterSpacing(4);
    SECRET_ITEMS.forEach((s, i) => {
      const x = 150 + i * 180;
      const has = c.secrets.includes(s.id);
      const g = this.add.graphics();
      g.fillStyle(has ? 0xfff4e0 : 0xf3eeec, has ? 1 : 0.7);
      g.fillRoundedRect(x - 80, 362, 160, 96, 16);
      const icon = this.add.image(x, 392, 'secret').setScale(0.8);
      if (!has) icon.setTint(0xb8a9a3).setAlpha(0.4);
      this.add.text(x, 428, has ? s.name : `Fase ${s.stage} · ???`, bodyText(12, has ? COLORS.ink : COLORS.muted, { align: 'center', wordWrap: { width: 150 } })).setOrigin(0.5, 0);
    });

    // últimos looks (retratos pintados pelo compositor de avatar)
    this.add.text(80, 476, 'SEUS ÚLTIMOS LOOKS', labelText(12, COLORS.rose)).setLetterSpacing(4);
    this.portraits = [];
    if (!c.looks.length) {
      this.add.text(cx, 570, 'Termine a jornada para guardar seu primeiro look aqui.', bodyText(16, COLORS.muted, { fontStyle: 'italic' })).setOrigin(0.5);
    }
    c.looks.slice(0, 6).forEach((look, i) => {
      const portrait = new Portrait(this, `collection-look-${i}`, 160, 'bg_blush');
      portrait.render(look.makeup);
      this.portraits.push(portrait);
      const x = 150 + i * 180;
      this.add.image(x, 580, `collection-look-${i}`).setScale(0.62);
      const date = new Date(look.date);
      this.add.text(x, 660, `${date.toLocaleDateString('pt-BR')} · ${look.score} pts`, bodyText(11, COLORS.mauve)).setOrigin(0.5);
    });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.portraits.forEach((p) => p.destroy()));

    new Button(this, GAME_WIDTH - 130, 44, 'VOLTAR', () => goTo(this, this.from), { width: 180, height: 44, fontSize: 14, variant: 'secondary', sound: 'ui_back' });
    this.input.keyboard?.on('keydown-ESC', () => goTo(this, this.from));
  }
}
