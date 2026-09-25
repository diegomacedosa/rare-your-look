/**
 * Personagens tutores (SPEC CENA 9) — diversidade física e de deficiência representada.
 * Cada tutorial é uma sequência de passos animada no Canvas (AvatarSystem).
 */
export const CHARACTERS = [
  {
    id: 'maya',
    name: 'Maya',
    role: 'Artista de blush',
    bio: 'Cadeirante, criadora de conteúdo e fã de bochechas coradas. Acredita que menos é mais.',
    representation: 'Usuária de cadeira de rodas',
    technique: 'Blush "dab, dab, blend"',
    avatar: {
      skin: 'deep', skinFeatures: [], hairStyle: 'afro', hairColor: 'black', hijabColor: 'mauve',
      eyeColor: 'dark_brown', bodyShape: 'curvy', mobility: 'wheelchair', top: 'tee', topColor: 'butter',
      bottomColor: 'ink', accessories: ['earrings_hoop'], background: 'sunset', makeup: {},
    },
    steps: [
      { text: 'Comece com a pele limpa e hidratada. O tinted moisturizer dá um glow leve.', apply: { base: 'base_01' } },
      { text: 'Uma gota de Soft Pinch basta! Dê batidinhas no alto das maçãs do rosto.', apply: { blush: 'blush_05' } },
      { text: 'Espalhe com os dedos em direção às têmporas — "dab, dab, blend".', apply: { highlight: 'highlight_03' } },
      { text: 'Finalize com um lip oil do mesmo tom para um look coeso.', apply: { lips: 'lip_05' } },
    ],
  },
  {
    id: 'aiko',
    name: 'Aiko',
    role: 'Especialista em luminosidade',
    bio: 'Surda, usa aparelho auditivo e ensina em Libras nas redes. Ama um glow de dia.',
    representation: 'Pessoa surda · aparelho auditivo',
    technique: 'Iluminador em 3 pontos',
    avatar: {
      skin: 'light', skinFeatures: ['freckles'], hairStyle: 'bob', hairColor: 'black', hijabColor: 'mauve',
      eyeColor: 'dark_brown', bodyShape: 'slim', mobility: 'none', top: 'turtleneck', topColor: 'cream',
      bottomColor: 'sage', accessories: ['hearing_aid'], background: 'nude', makeup: {},
    },
    steps: [
      { text: 'Sardas são lindas — não precisamos escondê-las. Só um pouco de brilho.', apply: { brows: 'brows_01' } },
      { text: 'Ponto 1: alto das maçãs do rosto, onde a luz bate naturalmente.', apply: { highlight: 'highlight_02' } },
      { text: 'Um blush suave logo abaixo do iluminador cria dimensão.', apply: { blush: 'blush_01' } },
      { text: 'Máscara para abrir o olhar e um balm glossy para fechar.', apply: { mascara: 'mascara_01', lips: 'lip_04' } },
    ],
  },
  {
    id: 'luna',
    name: 'Luna',
    role: 'Mestre dos lábios',
    bio: 'Tem vitiligo e transformou a relação com a própria pele em arte. Especialista em lábios.',
    representation: 'Vitiligo',
    technique: 'Lábios em camadas',
    avatar: {
      skin: 'rich', skinFeatures: ['vitiligo'], hairStyle: 'braids', hairColor: 'espresso', hijabColor: 'mauve',
      eyeColor: 'brown', bodyShape: 'medium', mobility: 'none', top: 'offshoulder', topColor: 'mauve',
      bottomColor: 'cream', accessories: ['earrings_pearl', 'necklace'], background: 'blush', makeup: {},
    },
    steps: [
      { text: 'Defina o olhar com uma sombra cremosa em tom malva.', apply: { eyeshadow: 'shadow_03' } },
      { text: 'Camada 1: Lip Soufflé matte para cor intensa e duradoura.', apply: { lips: 'lip_07' } },
      { text: 'Camada 2: um toque de gloss no centro dá volume.', apply: { lips: 'lip_08' } },
      { text: 'Blush no mesmo tom para amarrar tudo. Sua pele, sua regra!', apply: { blush: 'blush_03' } },
    ],
  },
  {
    id: 'bea',
    name: 'Bea',
    role: 'Delineado sem medo',
    bio: 'Usa prótese de braço e prova que delineado gatinho é questão de prática, não de perfeição.',
    representation: 'Prótese de braço',
    technique: 'Delineado com uma mão',
    avatar: {
      skin: 'light_medium', skinFeatures: ['scar'], hairStyle: 'hijab', hairColor: 'brown', hijabColor: 'blush',
      eyeColor: 'hazel', bodyShape: 'plus', mobility: 'prosthetic_arm', top: 'blazer', topColor: 'ink',
      bottomColor: 'ink', accessories: [], background: 'sage', makeup: {},
    },
    steps: [
      { text: 'Apoie o cotovelo na mesa: estabilidade primeiro, velocidade depois.', apply: { brows: 'brows_02' } },
      { text: 'Pontilhe a linha rente aos cílios e depois una os pontos.', apply: { liner: 'liner_01' } },
      { text: 'Para o gatinho, siga a direção do final da sobrancelha.', apply: { mascara: 'mascara_01' } },
      { text: 'Equilibre com lábios nude e pronto: olhar poderoso!', apply: { lips: 'lip_02', blush: 'blush_07' } },
    ],
  },
];

export const CHARACTER_BY_ID = Object.fromEntries(CHARACTERS.map((c) => [c.id, c]));
