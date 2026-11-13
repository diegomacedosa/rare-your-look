/**
 * NameScene — antes de começar, o jogador diz como quer aparecer no ranking.
 * O campo de texto é um <input> HTML de verdade, posicionado sobre o canvas
 * (assim funciona o teclado do celular, acentos e colar texto).
 */
import Phaser from 'phaser';
import { COLORS, GAME_WIDTH, GAME_HEIGHT, displayText, bodyText, labelText } from '../theme';
import { Button, panel } from '../ui/Button';
import { brandBackdrop, brandMark, fadeIn, goTo } from '../ui/helpers';
import progress from '../systems/ProgressSystem';
import ranking, { cleanName } from '../systems/RankingSystem';
import audio from '../systems/AudioSystem';

const FIELD = { x: GAME_WIDTH / 2, y: 352, w: 440, h: 60 };

export class NameScene extends Phaser.Scene {
  private field: HTMLInputElement | null = null;
  private error!: Phaser.GameObjects.Text;

  constructor() {
    super('NameScene');
  }

  create(): void {
    fadeIn(this);
    brandBackdrop(this);
    const cx = GAME_WIDTH / 2;

    panel(this, cx, 360, 640, 400, { alpha: 0.96 });
    brandMark(this, cx, 196, COLORS.mauve, 14);
    this.add.text(cx, 246, 'Como você quer aparecer no ranking?', displayText(32, COLORS.ink)).setOrigin(0.5);
    this.add.text(cx, 288, 'Seu nome ou apelido entra na classificação ao terminar o jogo.', bodyText(16, COLORS.muted)).setOrigin(0.5);
    this.error = this.add.text(cx, 404, '', bodyText(14, '#C4475E')).setOrigin(0.5);

    new Button(this, cx, 462, 'COMEÇAR', () => this.confirm(), { width: 320 });
    new Button(this, cx, 528, 'JOGAR SEM RANKING', () => this.start(null), { width: 320, height: 44, fontSize: 13, variant: 'ghost' });
    this.add.text(cx, GAME_HEIGHT - 40, 'Use 2 a 16 letras ou números. Nada de dados pessoais, só um apelido já basta.', labelText(12, COLORS.mauve)).setOrigin(0.5).setAlpha(0.8);

    this.createField();
    // as teclas que o jogo "segura" (espaço, setas) precisam chegar ao campo
    this.input.keyboard?.disableGlobalCapture();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.field?.remove();
      this.field = null;
      this.scale.off(Phaser.Scale.Events.RESIZE, this.placeField, this);
      window.removeEventListener('resize', this.placeField);
      this.input.keyboard?.enableGlobalCapture();
    });
  }

  private createField(): void {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'name-field';
    input.maxLength = 16;
    input.placeholder = 'Seu nome';
    input.setAttribute('autocomplete', 'nickname');
    input.setAttribute('aria-label', 'Seu nome para o ranking');
    input.value = ranking.name ?? '';
    input.addEventListener('keydown', (event) => {
      event.stopPropagation();
      if (event.key === 'Enter') this.confirm();
    });
    input.addEventListener('input', () => this.error.setText(''));
    document.body.appendChild(input);
    this.field = input;
    this.placeField();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.placeField, this);
    window.addEventListener('resize', this.placeField);
    // foco depois do fade (no celular, abrir o teclado de cara cobre a tela)
    this.time.delayedCall(400, () => {
      if (!this.sys.game.device.input.touch) input.focus();
    });
  }

  /** Mantém o campo alinhado ao canvas em qualquer tamanho de tela. */
  private placeField = (): void => {
    if (!this.field) return;
    const rect = this.game.canvas.getBoundingClientRect();
    const k = rect.width / GAME_WIDTH;
    Object.assign(this.field.style, {
      left: `${rect.left + (FIELD.x - FIELD.w / 2) * k}px`,
      top: `${rect.top + (FIELD.y - FIELD.h / 2) * k}px`,
      width: `${FIELD.w * k}px`,
      height: `${FIELD.h * k}px`,
      fontSize: `${24 * k}px`,
    });
  };

  private confirm(): void {
    const name = cleanName(this.field?.value ?? '');
    if (!name) {
      this.error.setText('Digite um nome com 2 a 16 letras ou números (pode ter espaço, ponto, - ou _).');
      audio.play('box_bump');
      this.field?.focus();
      return;
    }
    this.start(name);
  }

  private start(name: string | null): void {
    audio.unlock();
    ranking.setName(name);
    this.field?.blur();
    progress.newGame();
    goTo(this, 'IntroScene');
  }
}
