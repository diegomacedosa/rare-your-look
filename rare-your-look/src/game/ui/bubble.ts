/** Balão de fala/pensamento das cutscenes. */
import Phaser from 'phaser';
import { COLORS, HEX, bodyText } from '../theme';

export function speech(scene: Phaser.Scene, x: number, y: number, text: string, duration = 2800): Phaser.GameObjects.Container {
  const label = scene.add.text(0, 0, text, bodyText(20, COLORS.ink, { fontStyle: '600', align: 'center', wordWrap: { width: 360 } })).setOrigin(0.5);
  const w = label.width + 44;
  const h = label.height + 30;
  const g = scene.add.graphics();
  g.fillStyle(HEX.white, 0.97);
  g.fillRoundedRect(-w / 2, -h / 2, w, h, 20);
  g.lineStyle(2, HEX.rose, 0.8);
  g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20);
  // bolinhas de pensamento
  g.fillStyle(HEX.white, 0.97);
  g.fillCircle(-w / 4, h / 2 + 12, 8);
  g.fillCircle(-w / 4 - 12, h / 2 + 28, 5);
  const c = scene.add.container(x, y, [g, label]).setDepth(50).setAlpha(0).setScale(0.8);
  scene.tweens.add({ targets: c, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' });
  if (duration > 0) {
    scene.tweens.add({ targets: c, alpha: 0, delay: duration, duration: 260, onComplete: () => c.destroy() });
  }
  return c;
}
