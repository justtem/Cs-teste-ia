# Plano de Implementação — Otimização Completa de Performance do FPS 3D

## 1. Diagnóstico dos Gargalos Identificados na Auditoria

1. **Alocações por Frame e Instanciação Repetida no Game Loop (`src/App.tsx` e `src/standaloneHtmlGenerator.ts`)**:
   - `new THREE.Raycaster()` é instanciado a cada frame dentro de `update(dt)` para a linha de visão dos bots e novamente em cada disparo do jogador ou dos bots.
   - Dezenas de instâncias temporárias de `THREE.Vector3`, `THREE.Vector2` e `THREE.Euler` são criadas a cada frame nos cálculos de movimentação, recuo, mira dos bots e física.
   - Em cada impacto de bala (`spawnImpactSparks`, `spawnBulletTracer` e criação de decals), novas geometrias (`BoxGeometry`, `PlaneGeometry`), materiais (`MeshBasicMaterial`) e `Mesh` são alocados dinamicamente e adicionados/removidos da cena (`scene.add` / `scene.remove`), causando pressão no Garbage Collector (GC) e vazamento de geometrias/materiais das faíscas (`sparks`), que eram removidas da cena sem `dispose()`.

2. **Raycasting Excessivo na Percepção dos Bots (`O(N × M)` contra `shootableMeshes`)**:
   - Todos os 9 bots executam `losRay.intersectObjects(shootableMeshes, false)` contra todos os inimigos vivos a cada frame (até 45 raycasts triangulares completos por frame contra centenas de malhas do mapa).
   - Não há pré-filtragem rápida por distância/ângulo antes da alocação nem escalonamento entre frames para bots em patrulha, nem pré-verificação rápida contra as AABBs dos colisores (`colliders`).

3. **Recriação de Materiais de Mãos/Braços a Cada Troca de Arma (`src/weaponModels.ts`)**:
   - `buildCalibratedHandsAndArmsRig` cria 4 novos `THREE.MeshStandardMaterial` (`sleeveMat`, `gloveMat`, `knuckleMat`, `skinMat`) toda vez que o jogador troca de arma (`[1]`, `[2]`, `[3]`, `[Q]`), em vez de reutilizar materiais cacheados por equipe (`CT` / `TR`).

4. **Loop Desnecessário em Pausa / Aba Oculta / Menus (`src/App.tsx`)**:
   - Quando a aba do navegador está oculta (`document.hidden`) ou o jogo está pausado/em menu secundário, o loop continua processando deltas sem clamp seguro (`Math.min(rawDt, 0.05)`) e renderizando sem necessidade.

5. **Ausência de Controle Adaptativo de Resolução (`PixelRatio`)**:
   - O `renderer.setPixelRatio` é fixado na inicialização sem ajuste dinâmico durante picos de combate intenso (múltiplos tiros, granadas/efeitos e 10 personagens em tela).

---

## 2. Arquitetura das Otimizações Propostas

### A. Qualidade Gráfica Adaptativa Silenciosa (Alvo 60 FPS com Histerese)
- **Monitoramento Contínuo em Segundo Plano**:
  - Amostragem de tempo de frame (`frameTimeMs`) em janela móvel de 45 frames (~0.75s), operando 100% em segundo plano sem poluir o HUD.
  - **Histerese e Cooldown Estáveis (2.0s entre ajustes)**:
    - **Queda (< 50 FPS / `avgFrameTime > 20.0ms`)**: reduz gradualmente o `pixelRatio` efetivo em passos suaves (ex.: de `min(devicePixelRatio, 1.75)` para `1.25` e até `1.0` em momentos críticos) e reduz a densidade de partículas secundárias por impacto (de 5 para 3 faíscas).
    - **Recuperação (> 57 FPS / `avgFrameTime < 17.5ms` sustentado)**: restaura progressivamente o `pixelRatio` e a contagem total de faíscas até o patamar nativo configurado.

### B. Object Pooling Completo para Efeitos de Combate (`src/App.tsx` e `src/standaloneHtmlGenerator.ts`)
- **Pool de Faíscas de Impacto (`SparkPool`)**:
  - Pré-alocação de um pool fixo de 60 malhas de faíscas compartilhando uma única `THREE.BoxGeometry(0.055, 0.055, 0.055)` e um conjunto enxuto de materiais por cor (`0xffdd77`, `0xff8811`, `0x8b0000`, `0xcc0000`).
  - Ativação/desativação via `mesh.visible = true/false` sem chamadas a `scene.add` / `scene.remove` ou `dispose()` durante a partida.
- **Pool de Traçantes de Bala (`TracerPool`)**:
  - Pré-alocação de 24 traçantes reutilizáveis com geometria unitária escalada no eixo Z (`mesh.scale.set(1, 1, distance)`) e orientada via `lookAt`, eliminando `new THREE.BoxGeometry` a cada disparo.
- **Pool Circular de Decals de Impacto (`DecalPool`)**:
  - Reutilização circular das 40 malhas de decal pré-alocadas (com geometria `PlaneGeometry(0.14, 0.14)` compartilhada), apenas reposicionando e alternando `visible = true` ao atingir o limite.

### C. Otimização da IA Tática e Percepção Escalonada (`src/botTacticalAI.ts` e `src/App.tsx`)
- **Percepção Híbrida Escalonada (2 Frames em Patrulha / Instantânea em Combate ou Dano)**:
  - Bots em estados de combate ativo (`ENGAGE`, `PEEK_FIRE`, `HOLD_COVER`) ou que sofreram dano recente (`recentlyDamagedTimer > 0`) ou estão próximos do alvo (`distSq < 18 * 18`) executam verificação de linha de visão **instantaneamente em todo frame**.
  - Bots em deslocamento/patrulha (`ADVANCE`, `FLANK`, `INVESTIGATE`, `SEARCH`, `RETREAT`) escalonam a varredura completa de raycast em **2 frames alternados** (`(frameCount + botIndex) % 2 === 0`), reutilizando o resultado cacheado de visibilidade no frame intermediário.
- **Pré-Filtro Rápido de Oclusão por AABB (`rayIntersectsAABB`)**:
  - Antes de invocar `losRay.intersectObjects(shootableMeshes, false)`, testa a interseção do segmento `eye -> target` contra as caixas colidentes (`colliders` AABB) do mapa, descartando visadas bloqueadas por paredes em microssegundos e evitando testes caros de malha.
- **Reuso de Objetos Matemáticos**:
  - Instâncias estáticas/reutilizáveis de `THREE.Raycaster`, `THREE.Vector3`, `THREE.Vector2` e `THREE.Box3` no loop de atualização e no módulo `src/botTacticalAI.ts`, eliminando alocações temporárias por frame.

### D. Cache de Materiais, Ciclo de Vida e Sincronização React
- **`src/weaponModels.ts`**:
  - Cache de materiais de braços/luvas/pele (`CT` e `TR`) para evitar recriação de shaders/materiais ao alternar armas em 1ª pessoa ou instanciar modelos.
  - Descarte limpo na troca de mapas (`disposeSceneResources`) preservando geometrias/materiais cacheados dos modelos GLB e dos pools reutilizáveis.
- **Controle de Pausa, Aba Oculta e Delta Time (`src/App.tsx`)**:
  - Clamp estrito de `dt = Math.min(clock.getDelta(), 0.05)` para evitar saltos físicos após troca de aba.
  - Pausa imediata do processamento pesado de IA/física quando `document.hidden === true`.
  - Sincronização da HUD React com verificação de igualdade rasa para evitar re-renders desnecessários a 10Hz quando munição, HP e placar não mudaram.

---

## 3. Arquivos que Serão Modificados

1. **`src/weaponModels.ts`**:
   - Cache reutilizável de materiais de mãos/braços (`CT` e `TR`) e geometrias compartilhadas de efeitos.
2. **`src/botTacticalAI.ts`**:
   - Pré-alocação de vetores temporários (`_tmpVecA`, `_tmpVecB`, `_tmpVecC`) para cálculos de utilidade, flanqueamento, cobertura e A*, além de cache de percepção por inimigo para suportar o escalonamento de 2 frames em patrulha sem perda de precisão.
3. **`src/App.tsx`**:
   - Implementação do controlador silencioso de Qualidade Gráfica Adaptativa (alvo 60 FPS, ajuste < 50 FPS, recuperação > 57 FPS).
   - Implementação dos pools de objetos (`SparkPool`, `TracerPool`, `DecalPool`) e reuso global de `Raycaster`/`Vector3`/`Vector2`.
   - Percepção escalonada de 2 frames em patrulha + instantânea em combate/dano com pré-filtro rápido de oclusão AABB.
   - Proteção de `document.hidden`, clamp de `dt` e limpeza segura de memória entre partidas/mapas.
4. **`src/standaloneHtmlGenerator.ts`**:
   - Espelhamento das otimizações de Object Pooling, reuso de `Raycaster`/`Vector3`, escalonamento de percepção da IA e qualidade adaptativa no código HTML exportável.

---

## 4. Plano de Verificação e Testes
- Compilação e validação estática com `lint_applet` e `compile_applet` (zero erros de TypeScript/build).
- Verificação funcional completa:
  - Todos os 5 mapas, 26 armas GLB, empunhaduras calibradas em 1ª pessoa e preview 3D na loja.
  - Partidas 5v5 de 7 rounds, economia, HUD, áudio e exportação HTML standalone.
  - Comportamento tático completo dos bots (Blackboard 3s, A*, cobertura, peek, flanqueamento e reação imediata a tiros/dano).
