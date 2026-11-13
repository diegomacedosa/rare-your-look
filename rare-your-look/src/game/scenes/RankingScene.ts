/**
 * RankingScene — classificações (tempo, pontos, paletas, exploração).
 * Mostra o ranking online quando o banco está conectado; senão, o ranking
 * local deste navegador, com um aviso discreto.
 */
import Phaser from 'phaser';
import { COLORS, HEX, GAME_WIDTH, displayText, bodyText, labelText } from '../theme';
import { Button, panel } from '../ui/Button';
import { brandBackdrop, brandMark, fadeIn, goTo } from '../ui/helpers';
import { formatTime } from '../systems/ScoreSystem';
import ranking, { BOARDS, type BoardId, type RankingData } from '../systems/RankingSystem';
import audio from '../systems/AudioSystem';

const LIST_TOP = 276;
const ROW_H = 34;

export function formatBoardValue(board: BoardId, value: number): string {
  if (board === 'time') return formatTime(value);
  if (board === 'exploration') return `${value}%`;
  return String(value);
}

export class RankingScene extends Phaser.Scene {
  private from = 'MenuScene';
  private board: BoardId = 'time';
  private data_: RankingData | null = null;
  private tabs: Button[] = [];
  private list!: Phaser.GameObjects.Container;
  private status!: Phaser.GameObjects.Text;

  constructor() {
    super('RankingScene');
  }

  init(data: { from?: string; board?: BoardId; preload?: RankingData }): void {
    this.from = data.from ?? 'MenuScene';
    this.board = data.board ?? 'time';
    this.data_ = data.preload ?? null;
    this.tabs = [];
  }

  create(): void {
    fadeIn(this);
    brandBackdrop(this);
    const cx = GAME_WIDTH / 2;

    brandMark(this, cx, 36, COLORS.rose, 13);
    this.add.text(cx, 82, 'Ranking', displayText(44, COLORS.ink)).setOrigin(0.5);
    this.status = this.add.text(cx, 124, '', bodyText(14, COLORS.mauve)).setOrigin(0.5);

    BOARDS.forEach((b, i) => {
      const tab = new Button(this, cx - 300 + i * 200, 176, b.tab, () => this.show(b.id), { width: 184, height: 46, fontSize: 14, variant: 'secondary' });
      this.tabs.push(tab);
    });

    panel(this, cx, 446, 760, 420, { alpha: 0.96 });
    this.list = this.add.container(0, 0);

    new Button(this, cx, 690, 'VOLTAR', () => goTo(this, this.from), { width: 260, height: 48, fontSize: 15, variant: 'ghost', sound: 'ui_back' });
    this.input.keyboard?.on('keydown-ESC', () => goTo(this, this.from));
    this.input.keyboard?.on('keydown-LEFT', () => this.step(-1));
    this.input.keyboard?.on('keydown-RIGHT', () => this.step(1));

    this.show(this.board);
    if (!this.data_) {
      this.status.setText('Carregando classificações…');
      void ranking.load().then((data) => {
        if (!this.sys.isActive()) return;
        this.data_ = data;
        this.show(this.board);
      });
    }
  }

  private step(dir: number): void {
    const i = BOARDS.findIndex((b) => b.id === this.board);
    const next = BOARDS[(i + dir + BOARDS.length) % BOARDS.length]!;
    audio.play('ui_select');
    this.show(next.id);
  }

  private show(id: BoardId): void {
    this.board = id;
    BOARDS.forEach((b, i) => this.tabs[i]?.setVariant(b.id === id ? 'primary' : 'secondary'));
    this.list.removeAll(true);
    const cx = GAME_WIDTH / 2;
    const info = BOARDS.find((b) => b.id === id)!;
    this.list.add(this.add.text(cx, 262, info.label.toUpperCase(), labelText(13, COLORS.rose)).setOrigin(0.5).setLetterSpacing(4));

    const data = this.data_;
    if (!data) return;
    this.status.setText(
      data.mode === 'online'
        ? 'Ranking online · todo mundo que joga aparece aqui'
        : 'Ranking local · só as partidas deste navegador (o online ainda não está conectado)',
    );

    const rows = data.boards[id] ?? [];
    if (!rows.length) {
      this.list.add(
        this.add
          .text(cx, 420, 'Ninguém entrou nesta classificação ainda.\nTermine o jogo com seu nome para ser a primeira pessoa!', bodyText(18, COLORS.muted, { align: 'center', lineSpacing: 6 }))
          .setOrigin(0.5),
      );
      return;
    }

    rows.forEach((row, i) => {
      const y = LIST_TOP + 30 + i * ROW_H;
      if (row.me) {
        const g = this.add.graphics();
        g.fillStyle(HEX.blush, 1);
        g.fillRoundedRect(cx - 340, y - ROW_H / 2 + 2, 680, ROW_H - 4, 12);
        this.list.add(g);
      }
      const medal = ['#D6AE62', '#A9A9B3', '#B9845A'][i];
      if (medal) {
        const c = this.add.circle(cx - 300, y, 14, Phaser.Display.Color.HexStringToColor(medal).color);
        this.list.add(c);
      }
      this.list.add([
        this.add.text(cx - 300, y, String(i + 1), labelText(14, medal ? COLORS.white : COLORS.mauve)).setOrigin(0.5),
        this.add.text(cx - 260, y, row.name + (row.me ? '  (você)' : ''), bodyText(18, COLORS.ink, { fontStyle: row.me ? '700' : 'normal' })).setOrigin(0, 0.5),
        this.add.text(cx + 320, y, formatBoardValue(id, row.value), displayText(22, COLORS.mauve)).setOrigin(1, 0.5),
      ]);
    });

    const pos = data.me[id];
    if (pos && pos > rows.length) {
      this.list.add(this.add.text(cx, LIST_TOP + 30 + rows.length * ROW_H + 4, `Sua posição: #${pos}`, labelText(13, COLORS.mauve)).setOrigin(0.5).setLetterSpacing(2));
    }
  }
}
