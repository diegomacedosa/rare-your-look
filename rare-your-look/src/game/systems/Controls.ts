/**
 * Controls — junta teclado e toque num único estado lido pela Maya (SPEC §7).
 *
 * Desktop: A/← · D/→ · W/↑/Espaço · E · ESC.
 * Mobile: os botões da HUD escrevem em `touch` (ver HUDScene).
 */
import Phaser from 'phaser';

export interface TouchState {
  left: boolean;
  right: boolean;
  jump: boolean;
  interact: boolean;
}

export const touch: TouchState = { left: false, right: false, jump: false, interact: false };

/** O dispositivo tem toque? (decide se os botões na tela aparecem) */
export function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.matchMedia('(pointer: coarse)').matches;
}

export class Controls {
  private keys: Record<'left' | 'right' | 'a' | 'd' | 'up' | 'w' | 'space' | 'e', Phaser.Input.Keyboard.Key>;
  private prevJump = false;
  private prevInteract = false;
  jumpPressed = false;
  interactPressed = false;

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard!;
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      left: kb.addKey(K.LEFT),
      right: kb.addKey(K.RIGHT),
      a: kb.addKey(K.A),
      d: kb.addKey(K.D),
      up: kb.addKey(K.UP),
      w: kb.addKey(K.W),
      space: kb.addKey(K.SPACE),
      e: kb.addKey(K.E),
    };
    kb.addCapture([K.SPACE, K.UP, K.DOWN, K.LEFT, K.RIGHT]);
  }

  get left(): boolean {
    return this.keys.left.isDown || this.keys.a.isDown || touch.left;
  }

  get right(): boolean {
    return this.keys.right.isDown || this.keys.d.isDown || touch.right;
  }

  get jumpHeld(): boolean {
    return this.keys.up.isDown || this.keys.w.isDown || this.keys.space.isDown || touch.jump;
  }

  get interactHeld(): boolean {
    return this.keys.e.isDown || touch.interact;
  }

  /** Chamar uma vez por quadro, antes de ler jumpPressed/interactPressed. */
  update(): void {
    const jump = this.jumpHeld;
    const interact = this.interactHeld;
    this.jumpPressed = jump && !this.prevJump;
    this.interactPressed = interact && !this.prevInteract;
    this.prevJump = jump;
    this.prevInteract = interact;
  }

  /** Solta tudo (ex.: ao pausar) para a Maya não "grudar" andando. */
  reset(): void {
    touch.left = touch.right = touch.jump = touch.interact = false;
    this.prevJump = true;
    this.prevInteract = true;
  }
}
