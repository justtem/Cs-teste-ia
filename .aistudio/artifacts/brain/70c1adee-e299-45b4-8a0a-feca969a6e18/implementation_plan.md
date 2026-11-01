# Refinamento Visual do Sistema de Armas em Primeira Pessoa (Viewmodels 3D & Empunhadura)

Este plano detalha a correção e o refinamento visual dos modelos de armas em primeira pessoa (`Ultimate Guns Pack` GLB), remodelando a anatomia e os pontos de empunhadura das mãos e braços para cada arma, calibrando individualmente escala e enquadramento competitivo na câmera, e eliminando definitivamente qualquer aparição indevida de facas/baionetas na frente de outras armas.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> As decisões abaixo foram confirmadas no alinhamento inicial e guiam toda a calibração de viewmodels sem alterar nenhuma regra de jogabilidade, dano, economia ou IA Tática dos bots.

- **Empunhadura Dupla em Pistolas e Revólveres**: Todas as pistolas e revólveres utilizarão empunhadura tática de duas mãos perfeitamente encaixadas no punho da arma (mão direita principal envolvendo o punho e o guarda-mato, e mão esquerda de apoio envolvendo a lateral/base do punho sem vãos visíveis).
- **Isolamento Estrito da Baioneta (`Bayonet.glb`) no Slot 1**: O modelo `Bayonet.glb` será utilizado exclusivamente como a **Faca Tática / Baioneta independente (Slot 1)**. Ele não será acoplado na ponta de fuzis (como o ParaFAL), e haverá limpeza estrita de grupos anexados à câmera para garantir que jamais apareça uma faca na frente de outra arma ativa.
- **Enquadramento Competitivo Estilo CS Clássico**: As 26 armas terão escala, altura, distância focal (`Z`) e leve angulação (`pitch`/`yaw`/`roll`) calibradas individualmente para proporcionar presença visual sólida à direita da tela, mantendo o centro da mira limpo e sem cortes de geometria (`near plane clipping`).

---

## 1. Overview & Core Concept

- **O Que Faz**: Transforma a apresentação em primeira pessoa do arsenal de 26 armas em uma experiência de FPS competitivo polida, onde mãos e antebraços articulados seguram de forma convincente o punho e o guarda-mão real de cada modelo GLB, com proporções coerentes e transições limpas de troca, recarga, inspeção e disparo.
- **Público-Alvo / Contexto**: Jogadores de FPS tático em partidas 5v5 (Polícia Militar vs. Bandidos) que buscam leitura visual limpa, fidelidade anatômica na empunhadura das armas e feedback mecânico natural.
- **Valor Principal**: Elimina mãos quadradas desconectadas, corrige escalas desproporcionais entre categorias de armas e garante visibilidade 100% exclusiva da arma ativa.

---

## 2. User Experience & Visual Design

- **Fluxo Visual em Primeira Pessoa**:
  1. **Seleção da Faca (Slot 1)**: Exibe exclusivamente a Baioneta M9 (`Bayonet.glb`) empunhada de forma firme pela mão direita em postura de combate corpo a corpo, com o braço esquerdo recolhido fora do quadro.
  2. **Pistolas e Revólveres (Slot Secundário / Compra)**: Exibe a arma curta em enquadramento competitivo equilibrado, com as duas mãos acopladas diretamente ao punho (`grip`) do modelo GLB — sem espaços vazios entre os dedos e o chassi.
  3. **Fuzis, Submetralhadoras, Escopetas e Snipers (Slot Primário)**: Exibe a mão direita encaixada no punho traseiro (`pistol grip`) perto do gatilho e a mão esquerda sustentando a parte inferior do guarda-mão frontal (`handguard` / `pump forend`), respeitando a altura e o comprimento específicos de cada modelo (ex.: Bullpup compacta vs. Sniper longa vs. Escopeta de cano serrado).
  4. **Troca Rápida (`[1]`, `[2]`, `[3]`, `[Q]`)**: Remove instantaneamente qualquer grupo anterior da câmera e invalida carregamentos assíncronos antigos por token de geração, impedindo sobreposição de modelos.
- **Identidade Visual das Mãos e Braços (PM vs. Bandidos)**:
  - **Polícia Militar (CT)**: Mangas táticas azul-noturno escuro (`#14171d`), punho tático reforçado, luvas de assalto pretas (`#0b0d10`) com placa dorsal nos nós dos dedos e dedos articulados envolvendo o punho e o guarda-mão.
  - **Bandidos (TR)**: Antebraços em tom de pele natural com munhequeira/faixa tática no pulso, luvas de couro urbano sem dedos (`#8c5832` / `#1c1917`) e dedos flexionados ao redor da empunhadura real da arma.
- **Feedback Interativo e Animações**:
  - As mãos, braços, arma principal e acessórios pertencem a uma hierarquia unificada com subgrupos dedicados (`RightHandRig`, `LeftHandRig`, `WeaponMeshRig`), permitindo que o recuo do disparo, o movimento de caminhada (`bobbing`), o golpe de faca e a inclinação de recarga movam o conjunto em sincronia sem que as mãos desgarrem da arma.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisão 1: Sistema de Rigging de Mãos e Braços Articulados com Âncoras por Arma (`fpRightHandPos`, `fpLeftHandPos`)**
  - *Abordagem Escolhida*: Substituir os três cubos estáticos desalinhados por um rig anatômico composto por antebraço chanfrado, pulso/munhequeira, palma angulada, polegar opositor e conjunto de dedos curvados, posicionados dinamicamente através de coordenadas de empunhadura calibradas individualmente para cada uma das 26 armas.
  - *Por Quê*: Cada modelo GLB do pacote Quaternius possui o punho traseiro e o guarda-mão em posições relativas distintas em relação ao centro da sua caixa delimitadora (`Box3`). Âncoras individuais garantem contato visual real entre a palma/dedos e a arma, eliminando espaços vazios ou intersecções grosseiras.
  - *Alternativas Consideradas*: Usar uma única posição fixa de mão para todas as armas — descartado porque fuzis Bullpup, pistolas compactas, revólveres e rifles sniper possuem geometrias e distâncias de empunhadura completamente diferentes.
- **Decisão 2: Isolamento da Faca (`Bayonet.glb`) e Controle de Instância Única na Câmera**
  - *Abordagem Escolhida*: Remover `Bayonet.glb` da lista de acessórios acoplados em fuzis (`parafal`), calibrar os acessórios restantes (`Scope.glb`, `Bipod.glb`, `Tripod.glb`) com escalas e offsets justos ao corpo da arma, e implementar limpeza determinística (`clearCameraViewmodels`) + contador de geração (`viewmodelGenerationId`) na câmera.
  - *Por Quê*: Evita que a baioneta apareça na frente do cano de fuzis e impede que promessas assíncronas do `GLTFLoader` anexem modelos atrasados quando o jogador alterna rapidamente entre a faca e outra arma.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Diagrama de Hierarquia do Viewmodel na Câmera (`THREE.PerspectiveCamera`)**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       THREE.PerspectiveCamera                           │
│  (Apenas 1 instância ativa de ViewmodelRoot permitida por vez;          │
│   limpeza automática de grupos órfãos + token de geração assíncrono)    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    weaponGroup (ViewmodelRootGroup)                     │
│  Controla animações globais: Walk Bobbing, Recoil, Equip, Inspect [F]   │
├───────────────────────┬───────────────────────────┬─────────────────────┤
│                       │                           │                     │
▼                       ▼                           ▼                     ▼
┌─────────────────┐ ┌─────────────────────────┐ ┌───────────────────┐ ┌────────────────┐
│  RightArmRig    │ │   LeftArmRig (2 Mãos)   │ │ ActiveWeaponRig   │ │ MuzzleFlashRig │
│ - Antebraço     │ │ - Oculto apenas na Faca │ │ - GLB Principal   │ │ - Cone + Luz   │
│ - Pulso/Luva    │ │ - Pistolas: Apoio Punho │ │ - Acessórios GLB  │ │   na ponta     │
│ - Palma & Dedos │ │ - Armas Longas: Guarda  │ │ - Fallback Oculto │ │   exata do     │
│ - Polegar       │ │   frontal sob o cano    │ │   após load GLB   │ │   cano (Z)     │
└─────────────────┘ └─────────────────────────┘ └───────────────────┘ └────────────────┘
```

- **Modelo de Configuração Centralizada por Arma (`WeaponGlbVisualConfig`)**:
  Cada uma das 26 armas no registro central conterá parâmetros explícitos e calibrados para:
  - `fpTargetLength`: Comprimento real e proporcional da arma na câmera em 1ª pessoa (Facas `~0.34m`, Pistolas `0.24m–0.31m`, Revólveres `0.29m–0.34m`, SMGs `0.50m–0.54m`, Escopetas `0.58m–0.78m`, Fuzis `0.68m–0.78m`, Snipers `0.84m–0.92m`).
  - `fpPosition` & `fpRotation`: Enquadramento competitivo estilo CS clássico (`x: 0.16..0.20`, `y: -0.13..-0.16`, `z: -0.44..-0.62`), com leve convergência horizontal para o centro da mira (`rotation.y = Math.PI / 2 + 0.035`).
  - `fpRightGripPos` & `fpRightGripRot`: Coordenada exata do punho traseiro (`pistol grip`) onde a mão direita envolve a empunhadura.
  - `fpLeftGripPos` & `fpLeftGripRot`: Coordenada exata do apoio frontal (`handguard` / `pump` em armas longas, ou lateral/base do punho em pistolas e revólveres).
  - `fpMuzzlePos`: Coordenada exata da boca do cano para o clarão de disparo (`muzzleFlashMesh`) e origem dos traçantes (`Bullet Tracers`).

- **Mapeamento de Estados e Transições Visuais**:
  - **Troca de Armas (`switchToInventorySlot` / `buildSingleWeaponViewmodel`)**: Incrementa `viewmodelGenerationToken`, remove da `camera` todos os objetos filhos marcados com `userData.isFirstPersonViewmodel = true`, instancia o novo `weaponGroup` com mãos posicionadas nas âncoras da arma selecionada e anexa o `WeaponAssembly` GLB somente se o token de geração permanecer válido.
  - **Animação de Recarga (`isReloading`)**: Inclina suavemente a arma e desloca temporariamente o subgrupo `LeftArmRig` em direção ao carregador/punho e de volta ao ponto de apoio (`fpLeftGripPos`), evitando que os braços atravessem o corpo da arma.
  - **Combate Corpo a Corpo (`knife`)**: Oculta `LeftArmRig`, posiciona `RightArmRig` firmemente no cabo da `Bayonet.glb` e executa os arcos de corte rápido (botão esquerdo) e estocada pesada (botão direito).
