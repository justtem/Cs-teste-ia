# Plano de Implementação — Fase 2: Nova Anatomia 3D Low-Poly (CS 1.6) & 12 Variações (6 PM vs. 6 Bandidos)

## 1. Reforma Anatômica 3D (Fim do Tronco Cilíndrico)
Substituiremos completamente os cilindros (`CylinderGeometry`) e formas redondas por uma **anatomia low-poly angulada e facetada inspirada em Counter-Strike 1.6**:
- **Tronco Esculpido em Blocos Anatômicos**:
  - **Peitoral Trapezoidal Superior**: Mais largo nos ombros e angulado no tórax (`BoxGeometry` composto por caixa torácica superior + placas peitorais chanfradas).
  - **Abdômen / Cintura Definida**: Seção intermediária levemente mais estreita para criar silhueta atlética em V.
  - **Pelve / Quadril Tático**: Base de ligação entre o abdômen e as coxas.
  - **Pescoço Anatômico**: Coluna cervical prismática conectando o tórax ao crânio/mandíbula.
- **Cabeça Facetada com Mandíbula e Orelhas**:
  - Crânio superior + bloco de mandíbula/queixo angulado, nariz low-poly em cunha, sobrancelhas marcadas e orelhas laterais.
- **Membros Articulados (Braços e Pernas)**:
  - **Braços**: Deltoides/ombros estruturados, bíceps, antebraços angulados e mãos/luvas com empunhadura definida.
  - **Pernas**: Coxas robustas, articulação de joelho destacada, panturrilhas/canelas afiladas e calçados esculpidos (coturnos táticos com solado tratorado na PM; tênis esportivo ou chinelo de tira nos Bandidos).
- **Preservação de Hitboxes e Animações**:
  - `torsoMesh` e `headMesh` continuarão sendo as raízes de colisão para raycast de tiros (corpo vs. headshot) e os pivôs `leftLeg`, `rightLeg`, `leftArm`, `rightArm` e `chestRig` manterão o ciclo de caminhada (`walkCycle`) intacto.

---

## 2. Os 12 Modelos Completos (6 Polícia Militar + 6 Bandidos)

Cada bot do esquadrão receberá um modelo fixo e exclusivo (`variantIndex` de `0` a `5`), garantindo que os 5 integrantes da equipe exibam variações visuais distintas em todos os rounds.

### Equipe 1 — Polícia Militar (PM) (6 Variações)
1. **Variante 0 — `PM_Capitao` (Operador Padrão)**:
   - Uniforme preto completo, colete balístico pesado com sigla `PM`, capacete balístico preto, balaclava preta, óculos de proteção espelhados e rádio no ombro.
2. **Variante 1 — `BOPE_ZeroUm` (Incursão Tática Pesada)**:
   - Uniforme preto carbono, colete pesado com ombreiras táticas reforçadas, balaclava caveira/preta, óculos de visão tática com lente âmbar, mochila de assalto compacta e rifle com ponteira tática.
3. **Variante 2 — `CHOQUE_Tatico` (Controle e Escudo Balístico)**:
   - Uniforme preto, capacete tático com **viseira balística translúcida abaixada**, protetores de canela/joelheiras pesadas, colete reforçado e coturnos altos.
4. **Variante 3 — `GATE_Operador` (Especialista / Sniper Urbano)**:
   - Uniforme preto fosco, **boina/boné tático preto para trás**, headset de comunicação com abafador nos ouvidos, óculos escuros táticos, rosto à mostra com barba curta e colete modular.
5. **Variante 4 — `PM_Patrulha` (Patrulhamento Tático)**:
   - Uniforme preto, **boné tático preto com brasão PM** virado para a frente, rosto sem balaclava, rádio comunicador no peito, cinto de guarnição completo e luvas meio-dedo.
6. **Variante 5 — `PM_Incursao` (Breacher / Assalto)**:
   - Uniforme preto com mangas táticas dobradas até o cotovelo (luvas pretas + relógio tático), balaclava preta, capacete FAST com trilhos laterais e bolsa de munição cruzada.

---

### Equipe 2 — Bandidos Brasileiros (6 Variações)
1. **Variante 0 — `RubroNegro_RJ` (Camisa Flamengo Listrada + Boné + Bermuda)**:
   - Camisa clássica do Flamengo (listras horizontais vermelhas e pretas + `CRF`), corrente dourada grossa, bermuda jeans azul com canelas à mostra, tênis branco, máscara preta no queixo/boca e boné rubro-negro.
2. **Variante 1 — `Falcao_Morro` (Camisa Flamengo + Calça Jeans + Balaclava)**:
   - Camisa rubro-negra do Flamengo, calça jeans escura comprida com dobras na barra, balaclava preta fechada de assalto, mochila preta nas costas e tênis preto/vermelho.
3. **Variante 2 — `Sombra_Vila` (Regata Branca + Bermuda + Chinelo + Corrente)**:
   - Regata cavada branca deixando ombros e braços inteiros de pele à mostra, corrente dupla dourada no peito, bermuda tactel preta/vermelha, **chinelos nos pés** e boné preto virado para trás (sem máscara).
4. **Variante 3 — `Relampago_ZS` (Camisa 2 Branca Rubro-Negra + Calça Esportiva + Bandana)**:
   - Camisa de futebol branca com faixa rubro-negra no peito, calça esportiva de abrigo preta com listras laterais brancas, bandana vermelha cobrindo o rosto e relógio dourado.
5. **Variante 4 — `Barao_Beco` (Regata Preta/Vermelha + Jeans + Balaclava + Corrente)**:
   - Regata esportiva rubro-negra cavada, braços fortes à mostra com pulseira dourada, corrente de ouro com pingente, calça jeans surrada, balaclava preta e bolsa transversal.
6. **Variante 5 — `Trovoada_Sul` (Camisa Esportiva Amarela/Verde Seleção + Bermuda + Boné)**:
   - Camisa de futebol amarela com gola e mangas verdes, bermuda jeans clara, óculos juliet/esportivo espelhado na testa/olhos, boné escuro e mochila urbana.

---

## 3. Arquivos que Serão Modificados
- **`src/characterModels.ts`**:
  - Substituição da geometria cilíndrica por blocos anatômicos low-poly angulados (tórax trapezoidal, abdômen, pelve, pescoço, mandíbula, ombros, braços e pernas articuladas).
  - Adição das texturas procedurais extras (camisa Flamengo listrada, camisa Flamengo branca com faixa rubro-negra, camisa amarela/verde, regatas e variações de colete PM).
  - Implementação das 6 variações de PM e 6 variações de Bandidos selecionadas por `variantIndex`.
- **`src/standaloneHtmlGenerator.ts`**:
  - Atualização do construtor de bots em `spawn5v5Round()` para usar o novo tronco anatômico em blocos (sem cilindros) e aplicar as variações visuais de PM e Bandidos.
