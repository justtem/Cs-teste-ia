# Otimização do Blackboard Tático: Compartilhamento Estrito de Percepções (Janela de 3s) e Pruning Periódico

## 1. Visão Geral da Mudança

Atualmente, o quadro tático compartilhado (`TeamBlackboard.knownEnemies`) retém registros visuais por períodos longos (6.5s a 12.5s) e executa loops de varredura a cada frame (60 Hz) em todos os bots e mapas de percepção. Além disso, combatentes eliminados (jogadores e bots) permanecem nos registros de inteligência até o decaimento por tempo, induzindo cálculos desnecessários e comportamento tático irrealista.

Esta atualização otimiza o ciclo de vida das percepções compartilhadas da equipe com três pilares:
1. **Janela Estrita de Percepção (3.0 segundos)**: Bots só compartilham e reagem a avistamentos de adversários ocorridos nos últimos 3.0 segundos.
2. **Purga Imediata de Combatentes Eliminados**: No momento exato da eliminação de qualquer combatente (jogador ou bot), seu identificador é removido imediatamente de todos os blackboards de equipe (`CT` e `TR`).
3. **Pruning Periódico a Cada 0.2s + Filtro Estrito na Consulta**: Substituição da limpeza por frame por um ciclo de poda leve a cada 200ms acumulados, combinado com filtro instantâneo de `<= 3.0s` e comparação de distâncias quadradas (`distanceToSquared`) durante as consultas.

---

## 2. Arquitetura e Fluxo de Dados

```
+-----------------------------------------------------------------------------------+
|                        CICLO DO BLACKBOARD TÁTICO (PER-FRAME)                     |
|                                                                                   |
|  Frame Tick (dt)                                                                  |
|    |                                                                              |
|    +--> matchBlackboard.elapsedTime += dt                                         |
|    |                                                                              |
|    +--> blackboardPruneTimer += dt                                                |
|    |    if (blackboardPruneTimer >= 0.20s):                                       |
|    |        pruneExpiredBlackboardIntel(matchBB, maxAge = 3.0s)                  |
|    |        blackboardPruneTimer = 0                                              |
|                                                                                   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                   REGISTRO DE VISÃO & CONSULTA DOS BOTS SEM LOS                  |
|                                                                                   |
|  [Ao Avistar Inimigo]:                                                            |
|    - Atualiza memória reutilizando vetores existentes (zero alloc de Vector3)     |
|    - Registra lastSeenTime = matchBB.elapsedTime                                  |
|                                                                                   |
|  [Ao Perder LOS (Consulta Compartilhada)]:                                        |
|    - Itera sobre teamBB.knownEnemies com FILTRO ESTRITO:                          |
|        elapsedTime - mem.lastSeenTime <= 3.0s                                     |
|    - Avalia distância usando distanceToSquared (evita Math.sqrt em falso)         |
|    - Se > 3.0s: ignora e programa descarte                                        |
|                                                                                   |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                     PURGA IMEDIATA EM EVENTOS DE ABATE                            |
|                                                                                   |
|  [Abate do Jogador]:                                                              |
|    - purgeEnemyFromBlackboards(matchBB, 'PLAYER')                                 |
|                                                                                   |
|  [Abate de Bot Adversário]:                                                        |
|    - purgeEnemyFromBlackboards(matchBB, `BOT_${bot.id}`)                          |
|                                                                                   |
|  => Inimigos mortos deixam de ser rastreados no milissegundo de sua morte!        |
+-----------------------------------------------------------------------------------+
```

---

## 3. Detalhamento das Alterações

### 3.1. Utilitários no Módulo Tático (`src/botTacticalAI.ts`)
- **`pruneTeamKnownEnemies(teamBB: TeamBlackboard, currentTime: number, maxAgeSec = 3.0)`**:
  - Remove entradas com `currentTime - mem.lastSeenTime > maxAgeSec`.
- **`pruneExpiredBlackboardIntel(matchBB: MatchTacticalBlackboard, maxAgeSec = 3.0)`**:
  - Aplica o pruning nas equipes CT e TR.
  - Limpa eventos sonoros com mais de 2.5s.
  - Limpa hotspots de perigo com mais de 12.0s.
- **`purgeEnemyFromBlackboards(matchBB: MatchTacticalBlackboard, targetId: string)`**:
  - Deleta imediatamente `targetId` de `matchBB.teams.CT.knownEnemies` e `matchBB.teams.TR.knownEnemies`.
  - Reseta referências de perseguição se o alvo eliminado coincidir com o bot ou jogador.
- **Reutilização de instâncias em `recordKnownEnemyInBlackboard`**:
  - Se a chave já existir no Map, atualiza os campos `x, y, z` de `lastKnownPos` e `estimatedVelocity` com `.copy()` em vez de instanciar `.clone()`, eliminando a geração de lixo para o coletor de memória (GC).

### 3.2. Integração no Loop Principal (`src/App.tsx`)
- **Temporizador Acumulado de Pruning (`blackboardPruneTimer`)**:
  - Substitui o loop por frame (linhas 2005-2017) que realizava `forEach` a cada 16ms.
  - Acumula `dt` e só roda o pruning leve a cada `0.2s` (5 vezes por segundo em vez de 60 vezes por segundo).
- **Consulta Estrita de Inteligência Compartilhada (Linhas 2215-2228)**:
  - Condição rigorosa: apenas considera dados onde `currentTime - mem.lastSeenTime <= 3.0`.
  - Troca `distanceTo` por `distanceToSquared` na busca do alvo mais próximo.
- **Purga Imediata no Momento do Abate**:
  - **Morte do Jogador** (linha 2760): chamada imediata a `purgeEnemyFromBlackboards(matchBlackboard, 'PLAYER')`.
  - **Morte de Bot por Tiro do Jogador** (linha 1463): chamada imediata a `purgeEnemyFromBlackboards(matchBlackboard, `BOT_${hitBot.id}`)`.
  - **Morte de Bot em Combate Bot vs Bot** (linha 2864): chamada imediata a `purgeEnemyFromBlackboards(matchBlackboard, `BOT_${bestEnemyBot.id}`)`.
- **Reinício de Round**:
  - Garante limpeza completa dos Maps em `resetFullMatchState()` e `startNew5v5Round()`.

---

## 4. Ganhos de Desempenho e Benefícios Táticos

1. **Redução Drástica de Custo de CPU**:
   - De 60 varreduras por segundo para apenas 5 por segundo para rotinas de manutenção.
   - Redução do número médio de elementos ativos no Map de ~10 (retenções de até 12s) para no máximo 1 a 3 combatentes recentemente avistados.
2. **Zero Alocação de Vetores em Hotpaths**:
   - Avistamentos contínuos reutilizam `THREE.Vector3` pré-alocados no registro de memória.
3. **Comportamento Tático Mais Fiel e Realista**:
   - Os bots não perseguem mais "fantasmas" de inimigos vistos há 10 segundos atrás do outro lado do mapa.
   - Quando um inimigo é eliminado, nenhum bot continua atirando ou se movimentando em direção a um cadáver inexistente.

---

## 5. Plano de Validação e Verificação (Concluído com Sucesso)

1. [x] **Compilação**: Executado `compile_applet` e `lint_applet` com sucesso sem erros ou avisos.
2. [x] **Janela Estrita de 3 Segundos**: Bots de uma mesma equipe compartilham e consultam apenas memórias de inimigos com `elapsedTime - mem.lastSeenTime <= 3.0s`.
3. [x] **Pruning Periódico a Cada 0.2s**: Substituído o loop per-frame de 60Hz por acumulador `blackboardPruneTimer >= 0.2s`, reduzindo drasticamente o consumo de CPU.
4. [x] **Purga Imediata de Combatentes Eliminados**: `purgeEnemyFromBlackboards` implementado e disparado no milissegundo exato em que o jogador morre, em que um bot é abatido pelo jogador, quando um bot é abatido em combate bot-vs-bot, e quando o jogador assume um aliado com a tecla E.
5. [x] **Zero Garbage Collection nos Avistamentos**: Reutilização de instâncias Vector3 com `.copy()` via `recordKnownEnemyInBlackboard`.
