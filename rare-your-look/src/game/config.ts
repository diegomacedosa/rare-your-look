/** Configuração do Phaser (SPEC §36, §39): 1280×720 lógico, escala proporcional. */
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS } from './theme';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MenuScene } from './scenes/MenuScene';
import { IntroScene } from './scenes/IntroScene';
import { Level1Scene } from './scenes/Level1Scene';
import { Level2Scene } from './scenes/Level2Scene';
import { Level3Scene } from './scenes/Level3Scene';
import { HUDScene } from './scenes/HUDScene';
import { PauseScene } from './scenes/PauseScene';
import { GameOverScene } from './scenes/GameOverScene';
import { LevelCompleteScene } from './scenes/LevelCompleteScene';
import { TransitionScene } from './scenes/TransitionScene';
import { OutroScene } from './scenes/OutroScene';
import { DressingRoomScene } from './scenes/DressingRoomScene';
import { RevealScene } from './scenes/RevealScene';
import { CollectionScene } from './scenes/CollectionScene';

export const GRAVITY = 1900;

export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: COLORS.night,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: { antialias: true, roundPixels: false },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: GRAVITY }, debug: false, tileBias: 32 },
    },
    input: { activePointers: 4 },
    fps: { target: 60 },
    scene: [
      BootScene,
      PreloadScene,
      MenuScene,
      IntroScene,
      Level1Scene,
      Level2Scene,
      Level3Scene,
      HUDScene,
      PauseScene,
      GameOverScene,
      LevelCompleteScene,
      TransitionScene,
      OutroScene,
      DressingRoomScene,
      RevealScene,
      CollectionScene,
    ],
  };
}
