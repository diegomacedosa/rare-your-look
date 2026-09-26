/**
 * Textos do jogo (SPEC §4, §5, §21, §22, §26).
 * Separados da lógica para facilitar revisão de copy e tradução.
 */

export const SLOGAN = 'There’s no one way to be Rare.';

export const MISSION_TEXT = 'Seu look está esperando por você. Encontre seus produtos e crie sua própria forma de ser Rare.';

export const INTRO = {
  clock: '19:00 · O evento começa às 21h!',
  thought1: 'Hora de começar a me arrumar…',
  thought2: 'Ué… cadê meus produtos?!',
  thought3: 'O espelho… está brilhando?',
  missionTitle: 'MISSÃO',
  mission: 'Encontre os produtos necessários para completar o look de Maya.',
  howTo: 'Colete as PALETAS DE CORES pelo caminho e abra as RARE BOXES: elas guardam os produtos do look.',
};

/** Frases da cutscene entre fases (SPEC §21). */
export const TRANSITIONS: Record<number, { line: string; next: string }> = {
  1: { line: 'As cores estão prontas. Agora precisamos completar o look.', next: 'FASE 2 — BUILD YOUR LOOK' },
  2: { line: 'Olhos e brilho garantidos. Falta o toque final — o mais Rare de todos.', next: 'FASE 3 — BE RARE' },
};

export const OUTRO = {
  back: 'De volta ao quarto…',
  bag: 'A Rare Bag está cheia.',
  mirror: 'Now make it yours.',
};

/** Mensagens de vitória de cada fase (tela separada — feedback da professora, item 5). */
export const LEVEL_WIN: Record<number, { title: string; message: string }> = {
  1: { title: 'Você encontrou suas cores!', message: 'Blush, batom e lip oil já estão na Rare Bag. O look começou a ganhar vida.' },
  2: { title: 'O look está tomando forma!', message: 'Sombra, delineador e iluminador conquistados. Seus olhos vão brilhar.' },
  3: { title: 'Você é Rare!', message: 'Bronzer e máscara na bolsa. Todos os produtos estão prontos para a penteadeira.' },
};

/** Feedback de dano e de "sem corações" (feedback da professora, item 4). */
export const DAMAGE_LINES = ['Ops! Respire e siga em frente.', 'Tudo bem! Respire e tente de novo.', 'Ops! Sem pressa, você consegue.'];

export const GAME_OVER = {
  title: 'Respire fundo.',
  message: 'Seus corações acabaram, mas nada foi perdido: a Rare Bag continua com você.',
  hint: 'Você volta ao último espelho com 3 corações.',
  button: 'TENTAR DE NOVO',
};

/**
 * Dicas das placas "Rare Tip" (tecla E). Presença de marca com conteúdo
 * — mais conversa, menos anúncio (feedback da professora, item 8).
 * ⚠️ Placeholder: revisar com a comunicação oficial da marca.
 */
export const RARE_TIPS: Record<string, { title: string; text: string }> = {
  welcome: {
    title: 'Bem-vinda ao universo Rare',
    text: 'A Rare Beauty celebra a individualidade: maquiagem é um jeito de se expressar, não de se esconder.',
  },
  blush: {
    title: 'Rare Tip · Blush líquido',
    text: 'Com blush líquido, menos é mais: comece com uma gotinha e vá construindo a cor.',
  },
  lips: {
    title: 'Rare Tip · Lábios',
    text: 'Batom matte e lip oil também combinam: o óleo por cima dá brilho sem perder a cor.',
  },
  eyes: {
    title: 'Rare Tip · Olhos',
    text: 'Sombra líquida seca rápido: espalhe com a ponta do dedo antes de fixar.',
  },
  glow: {
    title: 'Rare Tip · Iluminador',
    text: 'Aplique iluminador nos pontos onde a luz bate: maçãs do rosto, nariz e arco do cupido.',
  },
  bronzer: {
    title: 'Rare Tip · Bronzer',
    text: 'Bronzer em bastão aquece o rosto: aplique onde o sol tocaria naturalmente.',
  },
  kind: {
    title: 'Seja gentil com você',
    text: 'Não existe look certo ou errado. Existe o seu — e ele muda quando você quiser.',
  },
  rare: {
    title: 'There’s no one way to be Rare',
    text: 'Cada escolha que você fizer no Rare Studio vai ser só sua. É isso que torna o look Rare.',
  },
};
