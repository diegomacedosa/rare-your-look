/** Utilidades de cena: transições, fundo de marca e controles de som. */
import Phaser from 'phaser';
import { COLORS, HEX, GAME_WIDTH, GAME_HEIGHT, labelText } from '../theme';
import audio from '../systems/AudioSystem';
import { Button } from './Button';

/** Fade para preto (ou rosé) e troca de cena. */
export function goTo(scene: Phaser.Scene, key: string, data?: object, duration = 380, color = 0x2b1b22): void {
  if (scene.data.get('leaving')) return;
  scene.data.set('leaving', true);
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  scene.cameras.main.fadeOut(duration, r, g, b);
  scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
    scene.data.set('leaving', false);
    scene.scene.start(key, data);
  });
}

export function fadeIn(scene: Phaser.Scene, duration = 380): void {
  scene.data.set('leaving', false);
  scene.cameras.main.fadeIn(duration, 43, 27, 34);
}

/** Fundo nude com brilho e formas orgânicas (menus e telas de resultado). */
export function brandBackdrop(scene: Phaser.Scene, dark = false): void {
  const g = scene.add.graphics();
  const top = dark ? 0x3e2436 : 0xfbeee8;
  const bottom = dark ? 0x8a5a62 : 0xf0d5d8;
  g.fillGradientStyle(top, top, bottom, bottom, 1);
  g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  const blobs = [
    { x: 120, y: 620, r: 220, c: dark ? 0x5e3550 : 0xf3c9c6 },
    { x: 1180, y: 110, r: 180, c: dark ? 0x7a4262 : 0xf7ddd6 },
    { x: 1100, y: 700, r: 140, c: dark ? 0x6e2f4a : 0xe8c3cc },
  ];
  for (const b of blobs) {
    g.fillStyle(b.c, 0.6);
    g.fillCircle(b.x, b.y, b.r);
  }
  // brilhos
  for (let i = 0; i < 18; i++) {
    const star = scene.add
      .image(Phaser.Math.Between(40, GAME_WIDTH - 40), Phaser.Math.Between(40, GAME_HEIGHT - 40), 'star')
      .setAlpha(0)
      .setScale(Phaser.Math.FloatBetween(0.4, 1))
      .setTint(dark ? 0xf4ddb8 : 0xffffff);
    scene.tweens.add({ targets: star, alpha: 0.8, duration: 1200, yoyo: true, repeat: -1, delay: i * 180, ease: 'Sine.easeInOut' });
  }
}

/** Wordmark "RARE BEAUTY" em caixa-alta espaçada. */
export function brandMark(scene: Phaser.Scene, x: number, y: number, color: string = COLORS.mauve, size = 16): Phaser.GameObjects.Text {
  return scene.add.text(x, y, 'RARE BEAUTY', labelText(size, color)).setOrigin(0.5).setLetterSpacing(size * 0.5);
}

/** Par de botões Som / Música (SPEC §35). */
export function soundToggles(scene: Phaser.Scene, x: number, y: number, variant: 'secondary' | 'light' = 'secondary'): Phaser.GameObjects.Container {
  const c = scene.add.container(x, y);
  const music = new Button(scene, -95, 0, '', () => audio.toggleMusic(), { width: 180, height: 44, fontSize: 14, variant });
  const sfx = new Button(scene, 95, 0, '', () => audio.toggleSfx(), { width: 180, height: 44, fontSize: 14, variant });
  const refresh = (): void => {
    music.setText(`MÚSICA: ${audio.musicOn ? 'ON' : 'OFF'}`);
    sfx.setText(`SOM: ${audio.sfxOn ? 'ON' : 'OFF'}`);
  };
  refresh();
  const off = audio.onChange(refresh);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, off);
  c.add([music, sfx]);
  return c;
}

/** Escurece o jogo por trás de um overlay (pausa, game over). */
export function dim(scene: Phaser.Scene, alpha = 0.55): Phaser.GameObjects.Rectangle {
  return scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, HEX.night, alpha).setInteractive();
}

/** Liga Enter/Espaço a uma ação (acessibilidade no teclado). */
export function onConfirm(scene: Phaser.Scene, action: () => void, delay = 250): void {
  const kb = scene.input.keyboard;
  if (!kb) return;
  scene.time.delayedCall(delay, () => {
    kb.on('keydown-ENTER', action);
    kb.on('keydown-SPACE', action);
  });
}

/**
 * "Close" de cutscene sem zoom de câmera: escurece a cena e abre um foco
 * suave num ponto (mantém os botões fixos sempre visíveis). É uma textura
 * de canvas comum — sem RenderTexture, que deixava o WebGL com a projeção
 * errada quando a cena terminava com ela ainda viva.
 */
export function spotlight(scene: Phaser.Scene, x: number, y: number, radius = 260): Phaser.GameObjects.Image {
  const key = `spot-${x}-${y}-${radius}`;
  if (!scene.textures.exists(key)) {
    const canvas = document.createElement('canvas');
    canvas.width = GAME_WIDTH;
    canvas.height = GAME_HEIGHT;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createRadialGradient(x, y, radius * 0.45, x, y, radius * 1.6);
    g.addColorStop(0, 'rgba(43, 27, 34, 0)');
    g.addColorStop(1, 'rgba(43, 27, 34, 0.68)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    scene.textures.addCanvas(key, canvas);
  }
  const img = scene.add.image(0, 0, key).setOrigin(0).setDepth(15).setAlpha(0);
  scene.tweens.add({ targets: img, alpha: 1, duration: 700 });
  return img;
}
