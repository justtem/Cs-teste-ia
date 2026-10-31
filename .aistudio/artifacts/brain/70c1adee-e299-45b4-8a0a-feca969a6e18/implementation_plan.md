# Redesign Minimalista do HUD e Menus Táticos (Estilo CS2 / Valorant)

Reformulação visual completa do HUD de combate, contagem regressiva de início de round (Freeze Time) e menus (Pausa, Loja e Menu Inicial) para um design translúcido moderno (`backdrop-blur`), eliminando caixas pesadas, textos redundantes e botões extras durante a partida.

## User Review & Critical Decisions

> [!IMPORTANT]
> As escolhas abaixo refletem suas respostas e o diagnóstico direto das 4 capturas de tela enviadas:

- **Estilo Visual Confirmado**: HUD translúcido moderno e minimalista inspirado em CS2 / Valorant (`bg-black/45 backdrop-blur-md border border-white/10`), substituindo as caixas verdes/pretas pesadas de borda grossa.
- **Topo Limpo em Combate**: Todos os botões utilitários extras (`[Q] Arma`, `Música: OFF`, seletor de faixa, `Mudo` e `</> index.html`) serão removidos da barra superior durante a partida. Controles de som ficarão acessíveis de forma limpa dentro do menu `ESC` e na tela inicial.
- **Contagem de 10s (Freeze Time) Desobstruída**: A caixa preta central será removida. A contagem regressiva aparecerá apenas como um número grande e elegante flutuando logo abaixo do placar superior, deixando a mira e o centro da tela 100% livres.

---

## 1. Overview & Core Concept

- **O Que Muda**:
  1. **Placar Superior Compacto**: Apenas uma cápsula translúcida fina no topo com placar `CT vs TR`, relógio do round e indicadores de jogadores vivos.
  2. **Contagem de 10s Flutuante**: Número grande com brilho sutil abaixo do placar superior durante o preparo, sem fundo preto ou textos longos bloqueando a visão.
  3. **HUD Inferior Unificado (Vida, Colete, Saldo e Munição)**: Substituição dos múltiplos blocos separados e faixas de dicas (`ESQUADRÃO TR · [Q] Alternar Arma...`) por dois painéis de vidro fosco compactos nos cantos inferiores.
  4. **Menu de Pausa (`ESC`) e Loja (`B`) Modernizados**: Painéis em vidro escuro (`backdrop-blur-xl`), botões bem espaçados, tipografia limpa e hierarquia visual direta.
- **Valor Principal**: Máxima visibilidade da arena 3D (baixa oclusão de tela) e acabamento visual digno de jogos competitivos modernos.

---

## 2. User Experience & Visual Design

- **Fluxo Visual em Jogo (HUD de Combate)**:
  - **Topo Central**: Placar compacto dividido em 3 zonas: `CT (Vivos + Pontos)` | `Relógio 05:00` | `TR (Pontos + Vivos)`.
  - **Abaixo do Placar (Durante os 10s de Preparo)**: Apenas o dígito grande flutuante (`10` até `1`) em âmbar/branco (ficando vermelho nos últimos 3 segundos com pulso suave).
  - **Canto Inferior Esquerdo**: Uma única barra translúcida horizontal contendo `HP` (ícone + número grande `100`), `Colete` (ícone + número `100`) e `Saldo` (`$16000` em destaque dourado/esmeralda). A faixa de texto longo com instruções de teclas acima do HP será removida.
  - **Canto Inferior Direito**: Contador de munição grande e limpo (`30 / 90`) acompanhado apenas dos 3 slots compactos (`1 Faca`, `2 Arma`, `3 Arma`) e um indicador discreto de abates (`Kills`), sem textos repetitivos como `[Q] TROCAR` ou `$ SALDO · [B] LOJA`.
- **Identidade Visual & Tema**:
  - *Superfícies*: Vidro escuro fosco (`bg-zinc-950/55 backdrop-blur-md`) com bordas finas translúcidas (`border-white/10`).
  - *Cores de Facção e Acento*: Azul tático (`#3b82f6` / `#60a5fa`) para CT, vermelho carmesim (`#ef4444` / `#f87171`) para TR, âmbar competitivo (`#fbbf24`) para destaques e branco puro (`#ffffff`) para leitura instantânea de números.
  - *Tipografia*: Números tabulares (`tabular-nums`) de alto contraste com peso `font-bold` / `font-black` para leitura periférica rápida sem precisar de rótulos extensos.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Remoção de Dicas Estáticas de Teclas no HUD**
  - *Abordagem Escolhida*: Retirar avisos permanentes como `[Q] Alternar Arma · [E] Assumir Bot se Morrer` e `[B] LOJA DE ARMAS LIBERADA | MIRA LIVRE` da tela de jogo.
  - *Por quê*: Jogadores em partida precisam de visão limpa; dicas de teclas já existem na aba Controles do menu inicial e o aviso de assumir bot (`[E]`) só aparece quando o jogador realmente morre.
- **Decisão 2: Centralização de Áudio no Menu de Pausa (`ESC`)**
  - *Abordagem Escolhida*: Mover os botões de Música e Mudo para uma linha discreta dentro do modal de Pausa (`ESC`) e manter o exportador `index.html` apenas no cabeçalho da tela inicial.
  - *Por quê*: Elimina toda a segunda linha de botões do placar superior que poluía o topo da tela durante o tiroteio.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        VIEWPORT 3D (Three.js)                           │
├─────────────────────────────────────────────────────────────────────────┤
│  [Topo Central] Placar Compacto Glass:  CT (5)  0  [05:00]  5  (5) TR   │
│  [Flutuante 10s] Dígito Grande sem Caixa:            10                 │
│                                                                         │
│                                  +                                      │
│                            (Mira Limpa)                                 │
│                                                                         │
│  [Inf. Esquerdo: Barra Única]         [Inf. Direito: Munição & Slots]   │
│  ♥ 85   🛡 83   $16000                [1] [2 AK-47] [3]    30 / 90      │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Mapeamento de Componentes e Estados**:
  - **Placar Superior**: Consome `hud.ctScore`, `hud.trScore`, `hud.ctAlive`, `hud.trAlive` e `hud.roundTimeSec` sem renderizar controles de música/download.
  - **Contador Flutuante de Preparo**: Renderizado apenas quando `hud.isFreezeActive && !hud.isPlayerDead`, exibindo `Math.ceil(hud.freezeTimeSec)` com `drop-shadow` forte para contraste direto sobre o céu/cenário da Dust II.
  - **Menu de Pausa (`gameMode === 'paused'`)**: Modal central em `backdrop-blur-xl` com botões diretos (`Continuar`, `Loja [B]`, `Reiniciar`, `Menu Inicial`), seletor rápido `CT / TR` e controles compactos de som (`Mudo [M]`, `Música [N]`).
  - **Sincronização Standalone**: Atualização espelhada no gerador de arquivo único para que a versão baixável também apresente o novo HUD translúcido e a contagem flutuante.
