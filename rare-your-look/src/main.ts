/**
 * Rare Beauty: Rare Your Look — Platform Edition (SPEC v2).
 * O gameplay inteiro roda no Phaser; o HTML só hospeda o canvas e o aviso
 * de orientação para celulares em pé.
 */
import Phaser from 'phaser';
import './styles/game.css';
import { createGameConfig } from './game/config';
import audio from './game/systems/AudioSystem';
import progress from './game/systems/ProgressSystem';

const game = new Phaser.Game(createGameConfig('game'));

// o primeiro toque/tecla em qualquer lugar libera o áudio (política de autoplay)
const unlock = (): void => audio.unlock();
window.addEventListener('pointerdown', unlock, { once: true });
window.addEventListener('keydown', unlock, { once: true });

// acesso para depuração no console (não expõe nada sensível)
if (import.meta.env.DEV) Object.assign(window as object, { game, progress });
