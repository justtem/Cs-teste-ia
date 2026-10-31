# Plano de Implementação — Fase 4: Mapa 4 `Complexo` (Conjunto Habitacional & Passarelas — 110m × 110m)

## 1. Visão Geral & Direção de Arte (Fase 4)
Seguindo o padrão estabelecido nas Fases 1 (`Vielas`), 2 (`Orla`) e 3 (`Centro`), o mapa **Complexo** será expandido de `76m × 76m` para **`110m × 110m`** (`x: -55m..+55m`, `z: -55m..+55m`) com volumetria **3D Low-Poly Estilizada** (inspirada na riqueza arquitetônica da **Imagem 1**) e **clareza competitiva 5v5** com demarcação visual dos **Bombsites A e B** (inspirada na **Imagem 2**):

- **Blocos Habitacionais Populares 3D (`addHousingBlock3D`)**:
  - Edifícios residenciais estilo conjunto habitacional carioca (COHAB / Zona Norte) em ocre, terracota, azul-acinzentado e verde-musgo desbotado, equipados com **vigas aparentes de concreto em relevo 3D**, **sacadas populares gradeadas**, **aparelhos de ar-condicionado de janela**, **telhados de telha de fibrocimento com caibros aparentes**, **caixas d'água comunitárias azuis elevadas em castelos d'água** e **antenas parabólicas/tubulações**.
- **Anel Perimetral Urbano 360° (Skyline do Conjunto)**:
  - Fechamento visual em `±55m` com 14 blocos habitacionais e muros de tijolo aparente emoldurando toda a arena na câmera panorâmica do menu e no horizonte em 1ª pessoa.

---

## 2. Arquitetura Tática 5v5 (110m × 110m) e Bombsites A & B

### Rota 1 (Oeste, `x = -54m..-15m`) — Beco Tático Oeste, Rua do Mercadinho & Lan House
- **Beco Tático Extremo Oeste (`x = -46m..-36m`)**: Corredor rápido de flanco entre os blocos perimetrais e os **Blocos A-01 (Noroeste)** e **C-03 (Sudoeste)**, com caçambas de entulho, muretas de tijolo e pallets de madeira.
- **Rua do Comércio Comunitário (`x = -23m..-15m`)**: Fachadas térreas vivas com portas de aço de enrolar, marquises de concreto e toldos para o **Mercadinho & Padaria do Complexo**, **Lan House & Bar do Pátio** e **Barbearia & Lanchonete**, além de passagem sob a ponte de ligação entre os Blocos A-01 e C-03.

### Rota 2 (Meio, `x = -15m..+15m`) — **BOMBSITE A (Quadra Poliesportiva Central & Passarela Aérea com Mirante Coberto `+2.6m`)**
- **Demarcação de Bombsite A**: Piso demarcado com faixa zebrada amarela/preta (`13m × 13m`) no centro da **Quadra Poliesportiva Comunitária** (`x = 0m, z = -4.0m`), acompanhada de traves de futsal 3D, tabelas de basquete, refletores e sinalização vertical **"→ BOMBSITE A · QUADRA & PASSARELA"**.
- **Rede de Varandas e Passarela Aérea Central (`+2.6m`) com Mirante Coberto**:
  - **2 Varandas Laterais Elevadas (`+2.6m`)** em `x = -12.5m` (Oeste) e `x = +12.5m` (Leste), acessíveis por **4 escadarias de concreto com guarda-corpos escalonados** (`ramp_south` e `ramp_north`).
  - **Passarela Aérea Central (`+2.6m`)** interligando as duas varandas sobre a Quadra Poliesportiva, agora equipada com um **Mirante Central Coberto** (telhado metálico estruturado sobre pilares, guarda-corpos de aço intercalados para troca de tiro upper-vs-lower e placas táticas do **Bombsite A**).

### Rota 3 (Leste, `x = +15m..+54m`) — **BOMBSITE B (Pátio das Garagens Coletivas em Pilotis & Oficina Mecânica)**
- **Blocos Residenciais Suspensos em Pilotis (`Bloco B-02` e `Bloco D-04`)**:
  - Térreo aberto sustentado por **colunas de concreto armado (`y = 0..3.8m`)** permitindo combate interno sob os prédios e transição direta para o pátio leste.
- **Demarcação de Bombsite B**:
  - Localizado no **Pátio Central das Garagens em Pilotis & Oficina Coletiva** (`x = +27.5m, z = -4.0m`), com demarcação `12m × 12m` no piso + sinalização vertical **"← BOMBSITE B · GARAGENS EM PILOTIS"**.
  - Cobertura tática composta por **furgão branco de entregas**, **carros estacionados**, **bancadas da Oficina Mecânica**, **pilhas de pneus**, **caixas de ferramentas** e **guarita da garagem**.

### Bases e Spawns Protegidos (`z = ±46.5m`)
- **Base CT / Polícia Militar (`z = +46.5m`, Sul)** e **Base TR / Bandidos (`z = -46.5m`, Norte)** protegidas por terminais comunitários de alvenaria e guaritas para impedir linha de visão imediata no segundo zero do round.
- **Malha de 38 Waypoints 3D**: Cobrindo o Beco Oeste, Rua do Mercadinho, Quadra Central (**Bombsite A**), as 4 escadarias e o Mirante da Passarela Aérea (`+2.6m`), além das Garagens em Pilotis e Oficina (**Bombsite B**).

---

## 3. Arquivos que Serão Modificados
1. **`/src/mapModels.ts`**:
   - Atualizar metadados de `MAP_CATALOG.complexo` com a nova descrição `110m × 110m` e destaques táticos dos Bombsites A e B.
   - Substituir `buildComplexoArena` pela versão expandida `110m × 110m` com `addHousingBlock3D` (sacadas 3D, vigas aparentes, caixas d'água e telhados estruturados), Quadra Poliesportiva completa (**Bombsite A**), Passarela Aérea com Mirante Coberto (`+2.6m`), Garagens em Pilotis & Oficina (**Bombsite B**) e 38 waypoints.
2. **`/src/App.tsx`**:
   - Definir `activeMapId: 'complexo'` e `player.mapId: 'complexo'` como mapa inicial padrão para inspeção imediata da Fase 4.

---

## 4. Status do Roteiro Geral de 5 Fases
1. **FASE 1 & 1.5 — MAPA 1: VIELAS (110m × 110m)** [CONCLUÍDO]
2. **FASE 2 — MAPA 2: ORLA (110m × 110m)** [CONCLUÍDO]
3. **FASE 3 — MAPA 3: CENTRO (110m × 110m)** [CONCLUÍDO]
4. **FASE 4 — MAPA 4: COMPLEXO (110m × 110m)** [CONCLUÍDO]
5. **FASE 5 — MAPA 5: DUST II (110m × 110m)**
