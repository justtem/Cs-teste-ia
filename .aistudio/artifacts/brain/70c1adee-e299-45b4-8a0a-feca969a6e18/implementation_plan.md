# Expansão de Mapas Brasileiros — Fase 1: Sistema de Mapas & Mapa 1 (VIELAS)

Expansão do **CS 1.6 Tactical Arena** com uma arquitetura modular de mapas tridimensionais sob demanda (com limpeza de memória GPU ao trocar de cenário), Tela de Seleção de Mapas no menu principal e no menu de pausa, preservação integral do **Dust II** original e implementação completa do **Mapa 1 — VIELAS** (inspirado em comunidades e áreas residenciais de morros do Rio de Janeiro, com becos interligados, escadarias subíveis, lajes táticas, comércios, caixas d'água Azuis, antenas e fiação elétrica aérea).

## User Review & Critical Decisions

> [!IMPORTANT]
> **Implementação Gradual (Um Mapa por Vez) e Decisões Confirmadas:**
> Seguindo rigorosamente a regra de implementar, validar e testar **um mapa por vez**, esta **Fase 1** entrega a arquitetura modular de mapas, o **Dust II** preservado e o **Mapa 1 — VIELAS** 100% jogável e testado. Os mapas seguintes (*Orla*, *Centro*, *Distrito Industrial* e *Complexo*) serão construídos individualmente nas fases subsequentes após a validação de *Vielas*.

- **Decisão Confirmada 1 — Seletor de Mapas Focado nos Mapas Concluídos**: A Tela de Seleção de Mapas exibirá apenas os mapas já implementados e validados nesta etapa (**Dust II** e **Vielas**), cada um com pré-visualização visual, descrição tática, ambientação e recomendação 5v5, sem criar mapas provisórios ou placeholders incompletos.
- **Decisão Confirmada 2 — Verticalidade Real em Vielas (Escadarias e Lajes Jogáveis)**: O sistema de física e navegação suportará elevação contínua (`getGroundHeightAt(x, z, footY)`), permitindo que tanto o jogador quanto os bots subam pelas escadarias de concreto até as **lajes táticas elevadas (`+2.6m`)**, utilizem muretas como cobertura e combatam entre o nível térreo dos becos e o nível superior das lajes.

---

## 1. Visão Geral & Conceito do Mapa 1 — VIELAS

- **O Que Faz**:
  - Transforma o sistema de arena fixa em um motor de mapas dinâmico onde apenas o mapa ativo permanece na memória WebGL (descartando geometrias, materiais e texturas do mapa anterior ao alternar).
  - Introduz o **Mapa 1 — VIELAS**, projetado especificamente para partidas competitivas **5v5 (Polícia Militar vs. Bandidos)** sem linha de visão direta entre os pontos de nascimento (CT Spawn e TR Spawn).
- **Layout Competitivo 3-Rotas + Verticalidade (Estilo CS 1.6)**:
  - **Base CT (Asfalto / Pé do Morro — Sul)**: Ponto de entrada da Polícia Militar em uma rua asfaltada na base da encosta, protegida por muros grafitados, viatura/obstáculos urbanos e guarita comercial.
  - **Base TR (Largo do Topo / Caixa d'Água — Norte)**: Ponto de reunião dos Bandidos no patamar superior norte, cercado por casas de alvenaria de tijolo aparente, caixas d'água azuis e antenas.
  - **Rota Oeste — Beco da Escadaria & Bar do Morro**: Corredor estreito entre fachadas de alvenaria e o *"Bar & Mercearia São Jorge"* (com toldo, balcão e engradados), conectado a uma escadaria de concreto que sobe para a **Laje Oeste**.
  - **Rota Central — Largo da Caixa d'Água & Passarela**: Pátio aberto intermediário com muretas de concreto, escadaria central de ligação, postes de madeira com fiação aérea cruzando o céu e linhas de tiro cruzadas entre as lajes.
  - **Rota Leste — Viela das Lajes & Oficina**: Corredor sinuoso com muros caiados, portões metálicos, lixeiras, pallets e rampa/escadaria lateral que dá acesso à **Laje Leste**, permitindo flanquear o meio ou a base adversária.

---

## 2. Experiência do Usuário & Identidade Visual

- **Fluxo de Seleção de Mapas**:
  - No **Menu Principal**, uma nova aba e seletor rápido permitem escolher entre **Dust II (Clássico Árido)** e **Vielas (Rio de Janeiro)** antes de clicar em *Iniciar Partida* ou escolher a equipe (*PM* / *Bandidos*).
  - Cada cartão de mapa apresenta:
    - **Arte de Pré-visualização Vetorial/Canvas** representando a arquitetura e a atmosfera do mapa.
    - **Nome, Localização e Clima** (ex.: *Vielas — Morro Carioca · Fim de Tarde Quente*).
    - **Descrição Tática e Rotas** + **Recomendação: 5v5 Competitivo**.
  - No **Menu de Pausa (`ESC`)** e no rodapé da tela inicial, o jogador vê o mapa ativo e pode alternar de mapa a qualquer momento, reiniciando a partida 5v5 no novo cenário.
- **Identidade Visual e Atmosfera de VIELAS**:
  - **Iluminação e Céu**: Luz solar dourada de fim de tarde carioca (`HemisphereLight` azul-celeste/ocre + `DirectionalLight` quente com sombras suaves PCF), contrastando o tijolo cerâmico das construções com o azul das caixas d'água de fibra e o cinza das lajes de concreto.
  - **Texturas Procedurais Brasileiras (`HTMLCanvasElement` sem dependências externas)**:
    - Tijolo baiano / alvenaria aparente e reboco caiado (amarelo-ocre, verde-água, terracota e branco desgastado).
    - Calçamento de paralelepípedo/concreto nas vielas e degraus demarcados nas escadarias.
    - Placas comerciais em português (*"BAR DO ZÉ"*, *"MERCEARIA REAL"*, *"OFICINA IRMÃOS"*, *"PROIBIDO ESTACIONAR"*) e grafites urbanos geométricos nos muros.
    - Detalhes tridimensionais compostos: caixas d'água cilíndricas azuis nos telhados, antenas parabólicas/TV, postes de concreto com emaranhado de fios pretos aéreos (`catenárias`), telhas onduladas de fibrocimento, portões de ferro e botijões/caixas.

---

## 3. Decisões Técnicas & Equilíbrio Competitivo

- **Decisão 1: Elevação Contínua para Escadarias e Lajes (`getGroundHeightAt`)**
  - *Abordagem Escolhida*: Cada definição de mapa fornece zonas de piso elevado e rampas/escadarias (`ElevationZone[]`). A cada frame, a altura do chão sob o jogador e sob cada bot é calculada suavemente pelas rampas e lajes, enquanto o sistema `collidesWithWorld(x, z, radius, y)` respeita a altura atual (`y`) para permitir caminhar sobre lajes e bloquear passagem sob paredes sólidas.
  - *Por quê*: Garante que o combate vertical nas escadarias e lajes de *Vielas* funcione com fluidez instantânea, sem travar o jogador nos degraus e permitindo que os bots também subam às lajes via waypoints 3D.
- **Decisão 2: Gerenciamento de Ciclo de Vida da Cena (`MapSceneManager`)**
  - *Abordagem Escolhida*: Todos os objetos 3D, luzes de ambiente específicas, colisores `AABBCollider[]`, zonas de elevação e waypoints de IA de um mapa são encapsulados em uma estrutura modular (`MapDefinition`). Ao trocar de mapa, o grupo do mapa anterior é removido da cena e suas geometrias/materiais específicos são liberados antes de construir o novo mapa.
  - *Por quê*: Mantém uso enxuto de VRAM e 60 FPS estáveis mesmo em vídeos integrados.

---

## 4. Arquitetura Técnica & Diagrama do Sistema

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Menu Principal / Menu Pausa                         │
│   ┌───────────────────────────┐          ┌─────────────────────────────┐   │
│   │  Seletor de Mapas (UI)    │          │ Card de Mapa:               │   │
│   │  • Dust II (Clássico 5v5) │─────────▶│ • Preview Visual + Ambiente │   │
│   │  • Vielas (Rio de Janeiro)│          │ • Rotas, Descrição & 5v5    │   │
│   └─────────────┬─────────────┘          └─────────────────────────────┘   │
└─────────────────┼──────────────────────────────────────────────────────────┘
                  │ seleciona activeMapId ('dust2' | 'vielas')
                  ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     Gerenciador Modular de Mapas 3D                        │
│                 (src/mapModels.ts + src/App.tsx Game Loop)                 │
├─────────────────────────────────────┬──────────────────────────────────────┤
│        MAPA: DUST II (Preservado)   │       MAPA 1: VIELAS (Novo)          │
│ • Texturas de arenito, tijolo e     │ • Casas de alvenaria, reboco colorido│
│   caixas de madeira                 │   e tijolo baiano em 2 pavimentos    │
│ • Portão Norte, Corredores e Meio   │ • 3 Escadarias subíveis + 2 Lajes    │
│ • 14 Waypoints táticos no plano     │   táticas elevadas (+2.6m)           │
│ • Spawns CT (Sul) / TR (Norte)      │ • Bar/Mercearia, placas em PT-BR,    │
│                                     │   caixas d'água azuis, postes e fios │
│                                     │ • 18 Waypoints 3D (becos + lajes)    │
└─────────────────┬───────────────────┴──────────────────┬───────────────────┘
                  │                                      │
                  ▼                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                Sistemas Integrados de Jogo (Preservados)                   │
│ • Colisão 3D (AABB + Zonas de Rampa/Laje getGroundElevationAt)             │
│ • IA 5v5 (Waypoints 3D, Whiskers de Desvio, LOS Real em 3D e Rajadas)      │
│ • Arsenal Brasileiro (17 Armas, Loja [B], Inspeção [F] e Bot Takeover [E]) │
└────────────────────────────────────────────────────────────────────────────┘
```

### Modelo de Dados de Mapa (`MapDefinition`)
- `id`: `'dust2' | 'vielas'`
- `name`, `subtitle`, `environment`, `description`, `recommendedPlayers` (`'5v5 Competitivo (10 Jogadores)'`)
- `skyColor`, `fogColor`, `fogDensity`, `sunColor`, `sunPosition`, `hemiSkyColor`, `hemiGroundColor`
- `ctSpawns`: Array de coordenadas `[x, y, z]` protegidas na base da PM.
- `trSpawns`: Array de coordenadas `[x, y, z]` protegidas na base dos Bandidos.
- `waypoints`: Array de coordenadas `[x, y, z]` cobrindo becos térreos, largo central e lajes superiores para navegação dos bots.
- `buildMap(scene, maxAniso, isSoftwareGl)`: Constrói a geometria 3D dentro de um `THREE.Group` dedicado e retorna `{ mapGroup, shootableMeshes, colliders, elevationZones, dispose }`.
