/**
 * Canal entre a fase e a HUD. A fase só anuncia o que aconteceu; a HUD
 * decide como mostrar. Mantém as duas cenas desacopladas.
 */
import Phaser from 'phaser';

export interface ItemFoundEvent {
  kicker: string;
  title: string;
  subtitle: string;
  texture: string;
  /** Posição na tela de onde o ícone voa até a Rare Bag. */
  screenX: number;
  screenY: number;
  secret?: boolean;
}

export interface HudEvents {
  refresh: [];
  message: [text: string, duration?: number, tone?: 'info' | 'warn' | 'good'];
  tutorial: [text: string];
  item: [event: ItemFoundEvent];
  palette: [screenX: number, screenY: number];
  interact: [visible: boolean];
  tip: [tip: { title: string; text: string } | null];
  title: [kicker: string, title: string, objective: string];
}

class HudBus extends Phaser.Events.EventEmitter {
  send<K extends keyof HudEvents>(event: K, ...args: HudEvents[K]): void {
    this.emit(event, ...args);
  }

  listen<K extends keyof HudEvents>(event: K, fn: (...args: HudEvents[K]) => void, context?: unknown): void {
    this.on(event, fn as (...args: unknown[]) => void, context);
  }
}

export const hudBus = new HudBus();
