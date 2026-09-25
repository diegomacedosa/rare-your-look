# Decisões técnicas e desvios da SPEC

Documento de apoio ao prompt 002 (SPEC §14). Tudo aqui é decisão de
implementação — a SPEC e o GDD continuam sendo a fonte de verdade do escopo.

## 1. Arquitetura

| Decisão | Por quê |
|---|---|
| `GameState` valida transições numa tabela | Erro de fluxo vira aviso no console em vez de tela quebrada |
| Cenas carregadas com `import()` dinâmico | O Vite gera um chunk por cena: a tela inicial baixa ~11 KB gzip |
| Cenas são classes com `mount/unmount/shortcuts` | Contrato único; o `SceneManager` cuida de foco, transição e teclado |
| `EventBus` só para o que cruza módulos | Estado de cena fica na cena; nada de "estado global de tudo" |
| Pastas extras: `src/utils/`, `ui/icons.js`, `systems/avatar/`, `systems/RankingSystem.js` | A SPEC §3 não previa, mas evitam arquivos de 800 linhas |

## 2. Avatar em Canvas (SPEC §7)

- As 12 camadas existem com os nomes do SPEC (`LAYER_ORDER` em `AvatarSystem.js`).
- `hair_base` é composta com `destination-over`: assim o volume de trás do cabelo
  fica atrás de pele, roupa e corpo sem precisar inverter a ordem do SPEC.
- `clothes_top` e `hair_overlay` são pintadas em canvas isolado porque usam
  `destination-out` (decotes, mangas, abertura do hijab).
- **Cache por grupo**: `base` (pele/corpo/roupa/rosto), `makeup` (4 camadas) e
  `top` (cabelo da frente + acessórios). Trocar um batom repinta só o grupo
  `makeup` — é o que segura os 60fps na StudioScene e nos tutoriais.
- Resolução do canvas segue o tamanho em tela × DPR (teto de 2×), com
  `ResizeObserver` para redesenhar quando o layout muda.
- Sprites PNG podem substituir os painters depois sem mexer no compositor.

## 3. Regras e pontuação

- Pontuação segue a tabela do SPEC §5.2. `maxScore()` já inclui o bônus de
  surpresa quando o desafio pode sorteá-la (Rare Mode chega a ~325).
- **Regra principal é obrigatória para pontuar**: sem ela o desafio não conclui e
  o look vale 0. A StudioScene avisa antes de confirmar, então nunca é surpresa.
- **Tempo esgotado não invalida a partida**: o look é confirmado como está e só os
  bônus de tempo são perdidos — coerente com "Concluído dentro do tempo: +25" do
  SPEC §5.2 e mais gentil para um casual game.
- Regras de cor (`required_color`) comparam em **CIE Lab (ΔE76)** com tolerância
  por desafio. As tolerâncias foram calibradas olhando a distância real entre os
  tons do catálogo (`npm run check:data` imprime as soluções encontradas).
- `findSolution()` é um solver por força bruta sobre os encaixes. Ele serve a
  três coisas: QA ("este desafio é possível?"), filtro das regras surpresa
  (nunca sorteia algo impossível) e o botão de dica.

## 4. Progressão

- Desafios abrem por quantidade de desafios concluídos (`unlock.completed`), não
  por pontos — a dificuldade cresce junto com a prática, como pede o GDD §2.9.
- Recompensas entram numa fila (`pendingRewards`) e só viram acervo no
  "Adicionar à Coleção". Se a jogadora sair antes, o aviso continua na tela
  inicial — ninguém perde item.
- Rejogar desafio dá pontos de novo (alimenta o ranking semanal), mas a
  recompensa do desafio só sai na primeira conclusão.
- **Nada de representação é recompensa.** Tom de pele, corpo, cabelo, hijab,
  vitiligo, cicatriz, cadeira de rodas e prótese nascem liberados; só roupas,
  acessórios, cores extras, cenários e novos tons de produto são desbloqueáveis.

## 5. Áudio

- Sem arquivos de áudio no protótipo: efeitos e trilha são **sintetizados** na
  Web Audio API (`sounds.js` guarda a receita de cada efeito e a progressão de
  quatro acordes da trilha).
- `SFX_MAP` já tem o caminho do `.mp3` de cada efeito; basta virar
  `ASSETS_AVAILABLE = true` quando os arquivos existirem.
- O contexto de áudio só é criado no primeiro gesto da usuária (política de
  autoplay) e o volume de trilha/efeitos fica salvo nas configurações.

## 6. Robustez encontrada em teste

- **Transição de cena com a aba escondida**: `element.animate().finished` nunca
  resolve quando o navegador para de desenhar, e o jogo travava na troca de tela.
  Agora a transição tem tempo-limite e, com a aba oculta, aplica o estado final
  direto.
- **Contadores animados** (pontuação) caem para o valor final quando
  `document.hidden` — sem isso o número ficava congelado em 0.
- **Cronômetro**: além de pausar em `visibilitychange`, ele desconta buracos
  maiores que 0,9s entre quadros. Janela minimizada ou encoberta não come tempo
  de jogo.

## 7. O que ainda falta para virar produção

1. Assets oficiais (sprites do avatar, embalagens, trilha e efeitos) e validação
   dos nomes de linha/tom com a marca.
2. Backend opcional para ranking real e persistência entre dispositivos.
3. Testes automatizados de UI (hoje só `npm run check:data` cobre a camada de
   dados/regras) e passagem de QA cross-browser real (Safari iOS incluso).
4. Conteúdo: mais desafios por tipo (Color Explorer e Mood Master pedem 5
   conclusões cada, hoje alcançadas rejogando).
5. Revisão de copy e de acessibilidade com pessoas com deficiência — a
   representação foi desenhada com cuidado, mas precisa de validação com quem vive.
