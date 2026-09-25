/**
 * Personagens dos tutoriais (GDD §2.8).
 *
 * A deficiência aparece como parte da diversidade dos personagens —
 * nunca como obstáculo ou "superação". Cada tutorial é uma sequência de
 * passos que o AvatarSystem aplica ao vivo no Canvas.
 *
 * `look` em cada passo é cumulativo (estado completo do rosto naquele passo);
 * `intensity` permite mostrar o produto sendo construído em camadas.
 */

export const CHARACTERS = [
  {
    id: 'lu',
    name: 'Lu',
    pronouns: 'ela/dela',
    tags: ['Usuária de cadeira de rodas'],
    tagline: 'Blush é intenção, não regra.',
    bio: 'Maquiadora e criadora de conteúdo. Começou a se maquiar no espelho do quarto, hoje ensina de frente pra câmera.',
    avatar: {
      skinTone: 'tone7', bodyShape: 'medium', hairStyle: 'curly_afro', hairColor: 'black',
      eyeColor: 'dark_brown', top: 'turtleneck', topColor: 'deep', bottom: 'black_pants',
      accessories: { earrings: 'hoops', eyewear: 'none', hearing: 'none', neck: 'none', hairAcc: 'none' },
      features: { freckles: false, vitiligo: false, scar: false, mole: true },
      mobility: 'wheelchair', prosthetic: 'none', makeup: 'none', scenario: 'bg_blush', seed: 12,
    },
    tutorial: {
      title: 'Blush em 3 toques',
      summary: 'Como usar um blush líquido bem pigmentado sem exagerar na mão.',
      products: ['blush_grace', 'high_mesmerize', 'oil_hope'],
      steps: [
        { text: 'Um ponto só, no alto da maçã. A fórmula é concentrada: comece com menos do que você acha que precisa.',
          look: { blush: 'blush_grace' }, intensity: { blush: 0.35 } },
        { text: 'Espalhe com batidinhas dos dedos, subindo em direção à têmpora. Sem esfregar.',
          look: { blush: 'blush_grace' } },
        { text: 'Iluminador só onde a luz bateria: topo da maçã e ponte do nariz.',
          look: { blush: 'blush_grace', highlight: 'high_mesmerize' } },
        { text: 'Fecha com lip oil no mesmo tom. Look monocromático com três produtos.',
          look: { blush: 'blush_grace', highlight: 'high_mesmerize', lipoil: 'oil_hope' } },
      ],
    },
  },
  {
    id: 'kai',
    name: 'Kai',
    pronouns: 'elu/delu',
    tags: ['Vitiligo'],
    tagline: 'Glow é luz, não cobertura.',
    bio: 'Artista visual. Passou anos tentando cobrir as manchas até perceber que elas eram o desenho mais interessante do rosto.',
    avatar: {
      skinTone: 'tone4', bodyShape: 'slim', hairStyle: 'buzz', hairColor: 'black',
      eyeColor: 'honey', top: 'tee', topColor: 'warm_white', bottom: 'cream',
      accessories: { earrings: 'studs', eyewear: 'none', hearing: 'none', neck: 'none', hairAcc: 'none' },
      features: { freckles: false, vitiligo: true, scar: false, mole: false },
      mobility: 'none', prosthetic: 'none', makeup: 'none', scenario: 'bg_studio', seed: 3,
    },
    tutorial: {
      title: 'Glow sem esconder',
      summary: 'Pele iluminada mantendo as manchas visíveis — realce em vez de cobertura.',
      products: ['bronzer_happy_sol', 'high_enlighten', 'blush_joy', 'oil_joy'],
      steps: [
        { text: 'Bronzer só onde o sol bateria: têmporas, maçãs e queixo. Camada fina.',
          look: { bronzer: 'bronzer_happy_sol' }, intensity: { bronzer: 0.6 } },
        { text: 'Luminizer nos pontos altos. O brilho acompanha o relevo do rosto, não a mancha.',
          look: { bronzer: 'bronzer_happy_sol', highlight: 'high_enlighten' } },
        { text: 'Blush em camada translúcida, deixando a pele aparecer por baixo.',
          look: { bronzer: 'bronzer_happy_sol', highlight: 'high_enlighten', blush: 'blush_joy' } },
        { text: 'Boca glossy do mesmo time de cor. Pronto: cinco minutos.',
          look: { bronzer: 'bronzer_happy_sol', highlight: 'high_enlighten', blush: 'blush_joy', lipoil: 'oil_joy' } },
      ],
    },
  },
  {
    id: 'bia',
    name: 'Bia',
    pronouns: 'ela/dela',
    tags: ['Pessoa cega'],
    tagline: 'Maquiagem também se faz pelo tato.',
    bio: 'Professora e podcaster. Aprendeu a se maquiar sentindo o rosto — e ensina técnicas que funcionam sem espelho nenhum.',
    avatar: {
      skinTone: 'tone5', bodyShape: 'curvy', hairStyle: 'long_straight', hairColor: 'brown',
      eyeColor: 'brown', top: 'vneck', topColor: 'rose', bottom: 'jeans',
      accessories: { earrings: 'studs', eyewear: 'sunglasses', hearing: 'none', neck: 'none', hairAcc: 'none' },
      features: { freckles: true, vitiligo: false, scar: false, mole: false },
      mobility: 'none', prosthetic: 'none', makeup: 'none', scenario: 'bg_sunset', seed: 21,
    },
    tutorial: {
      title: 'Batom sem espelho',
      summary: 'Referências táteis para aplicar cor na boca com precisão.',
      products: ['lip_talented', 'blush_hope', 'oil_hope'],
      steps: [
        { text: 'Primeiro, encontre o arco do cupido com a ponta do dedo. Ele é o seu ponto zero.',
          look: {} },
        { text: 'Aplique do centro para os cantos, apoiando o bastão na borda do lábio.',
          look: { lipstick: 'lip_talented' }, intensity: { lipstick: 0.55 } },
        { text: 'Passe o dedo pelo contorno para sentir excessos e corrigir na hora.',
          look: { lipstick: 'lip_talented' } },
        { text: 'Blush: dois toques leves onde o rosto esquenta quando você sorri.',
          look: { lipstick: 'lip_talented', blush: 'blush_hope' } },
      ],
    },
  },
  {
    id: 'rafa',
    name: 'Rafa',
    pronouns: 'ele/dele',
    tags: ['Usa prótese de braço'],
    tagline: 'Delineado é técnica, não firmeza de pulso.',
    bio: 'Barista e maquiador nas horas vagas. Desenvolveu um método de traços curtos depois de perder o antebraço num acidente.',
    avatar: {
      skinTone: 'tone6', bodyShape: 'medium', hairStyle: 'bun', hairColor: 'dark_brown',
      eyeColor: 'dark_brown', top: 'hoodie', topColor: 'ink', bottom: 'jeans',
      accessories: { earrings: 'none', eyewear: 'none', hearing: 'hearing_aid', neck: 'none', hairAcc: 'none' },
      features: { freckles: false, vitiligo: false, scar: true, mole: false },
      mobility: 'none', prosthetic: 'right', makeup: 'none', scenario: 'bg_night', seed: 9,
    },
    tutorial: {
      title: 'Delineado com uma mão só',
      summary: 'Traços curtos e apoio firme para um gatinho simétrico.',
      products: ['liner_black', 'mascara_black', 'bronzer_happy_sol'],
      steps: [
        { text: 'Apoie o cotovelo na bancada. Estabilidade vem do apoio, não da força.',
          look: {} },
        { text: 'Três traços curtos rente ao cílio em vez de um traço longo.',
          look: { liner: 'liner_black' }, intensity: { liner: 0.5 } },
        { text: 'Una os traços e puxe o rabinho seguindo a linha do cílio inferior.',
          look: { liner: 'liner_black' } },
        { text: 'Máscara nos cílios e bronzer para fechar. Olhar definido em um minuto.',
          look: { liner: 'liner_black', mascara: 'mascara_black', bronzer: 'bronzer_happy_sol' } },
      ],
    },
  },
];

export const CHARACTERS_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));
export const getCharacter = (id) => CHARACTERS_BY_ID[id] ?? null;
