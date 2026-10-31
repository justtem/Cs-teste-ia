import * as THREE from 'three';

export type MapId = 'dust2' | 'vielas' | 'orla' | 'centro' | 'complexo';

export interface AABBCollider {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface ElevationZone {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minHeight: number;
  maxHeight: number;
  type: 'platform' | 'ramp_north' | 'ramp_south' | 'ramp_east' | 'ramp_west';
}

export interface MapMetadata {
  id: MapId;
  name: string;
  subtitle: string;
  location: string;
  environment: string;
  description: string;
  recommendedPlayers: string;
  tacticalFeatures: string[];
  accentColor: string;
}

export interface BuiltArenaMap {
  id: MapId;
  mapGroup: THREE.Group;
  shootableMeshes: THREE.Mesh[];
  colliders: AABBCollider[];
  elevationZones: ElevationZone[];
  ctSpawns: [number, number, number][];
  trSpawns: [number, number, number][];
  playerCtSpawn: { pos: [number, number, number]; yaw: number };
  playerTrSpawn: { pos: [number, number, number]; yaw: number };
  waypoints: [number, number, number][];
  skyColor: number;
  fogColor: number;
  fogDensity: number;
  hemiSkyColor: number;
  hemiGroundColor: number;
  hemiIntensity: number;
  sunColor: number;
  sunIntensity: number;
  sunPosition: [number, number, number];
  dispose: () => void;
}

export const MAP_CATALOG: Record<MapId, MapMetadata> = {
  dust2: {
    id: 'dust2',
    name: 'Dust II',
    subtitle: 'Clássico Competitivo — Arena Desértica',
    location: 'Zona Árida Clássica',
    environment: 'Dia Ensolarado · Visibilidade Longa',
    description:
      'O mapa clássico do CS 1.6 com corredores laterais, Portão Norte de tijolos, caixas táticas empilhadas e confrontos equilibrados de média e longa distância.',
    recommendedPlayers: '5v5 Competitivo (10 Jogadores)',
    tacticalFeatures: [
      'Portão Norte & Meio Clássico',
      'Corredores Laterais de Flanco',
      'Caixas Duplas de Cobertura',
    ],
    accentColor: '#f59e0b',
  },
  vielas: {
    id: 'vielas',
    name: 'Vielas',
    subtitle: 'Morro Carioca — Rio de Janeiro',
    location: 'Rio de Janeiro, RJ — Brasil',
    environment: 'Comunidade Urbana · Fim de Tarde Dourado',
    description:
      'Becos estreitos interligados, casas de alvenaria e tijolo baiano, escadarias de concreto subíveis até duas lajes táticas (+2.6m) conectadas por passarela, pequenos comércios, caixas d’água azuis e fiação aérea.',
    recommendedPlayers: '5v5 Competitivo (10 Jogadores)',
    tacticalFeatures: [
      '2 Lajes Táticas Elevadas (+2.6m) & Passarela',
      '4 Escadarias Subíveis (Jogador e Bots)',
      'Becos do Bar, Largo Central e Oficina',
    ],
    accentColor: '#38bdf8',
  },
  orla: {
    id: 'orla',
    name: 'Orla',
    subtitle: 'Praia & Calçadão — Rio de Janeiro',
    location: 'Zona Sul, Rio de Janeiro — RJ',
    environment: 'Dia Litorâneo · Céu Azul & Brisa Marítima',
    description:
      'Calçadão de pedra portuguesa em ondas pretas e brancas, ciclovia vermelha, quiosques de água de coco, faixa de areia com barracas, Posto de Salva-Vidas subível (+2.4m) e prédios residenciais/comerciais na avenida.',
    recommendedPlayers: '5v5 Competitivo (10 Jogadores)',
    tacticalFeatures: [
      'Posto de Salva-Vidas Elevado (+2.4m) na Areia',
      'Calçadão de Pedra Portuguesa & 2 Quiosques',
      'Avenida Litorânea & Corredor entre Edifícios',
    ],
    accentColor: '#06b6d4',
  },
  centro: {
    id: 'centro',
    name: 'Centro',
    subtitle: 'Centro Comercial & Largo — Rio de Janeiro',
    location: 'Centro, Rio de Janeiro — RJ',
    environment: 'Urbano Comercial · Sombras de Edifícios',
    description:
      'Avenida asfaltada com faixas de pedestres, calçadas largas de pedra portuguesa, prédios comerciais altos, Galeria Saara coberta, padaria, boteco, bancas de jornal, pontos de ônibus, táxi carioca e terraço central elevado (+2.4m).',
    recommendedPlayers: '5v5 Competitivo (10 Jogadores)',
    tacticalFeatures: [
      'Terraço do Largo Central (+2.4m) com 2 Escadarias',
      'Galeria Comercial Coberta & Bancas de Jornal',
      'Avenida com Ônibus Urbano, Táxi e Abrigos',
    ],
    accentColor: '#eab308',
  },
  complexo: {
    id: 'complexo',
    name: 'Complexo',
    subtitle: 'Conjunto Habitacional & Passarelas — Rio de Janeiro',
    location: 'Zona Norte, Rio de Janeiro — RJ',
    environment: 'Grande Conjunto Urbano · Operação Tática (Maior Mapa)',
    description:
      'O maior cenário do jogo (76m × 76m): blocos residenciais populares com garagens em pilotis atravessáveis, pátio comunitário com quadra, mercadinho, oficina, vans estacionadas e rede de passarelas táticas (+2.6m) com 4 escadarias.',
    recommendedPlayers: '5v5 Competitivo (10 Jogadores)',
    tacticalFeatures: [
      'Passarela Aérea Central & 2 Varandas (+2.6m)',
      'Garagens Cobertas em Pilotis sob os Prédios',
      'Pátio da Quadra, Mercadinho e 5 Rotas de Flanco',
    ],
    accentColor: '#f97316',
  },
};

/**
 * Calcula a altura do piso (chão, escadaria ou laje elevada) nas coordenadas (px, pz)
 * respeitando a altura atual dos pés (currentFootY) para evitar teletransporte através de lajes altas.
 */
export function getGroundElevationAt(
  px: number,
  pz: number,
  currentFootY: number,
  zones: ElevationZone[]
): number {
  let bestHeight = 0;

  for (let i = 0; i < zones.length; i++) {
    const z = zones[i];
    if (px < z.minX || px > z.maxX || pz < z.minZ || pz > z.maxZ) continue;

    let zoneH = z.maxHeight;
    if (z.type === 'ramp_north') {
      // Sobe conforme avança para o Norte (de maxZ para minZ)
      const t = Math.max(0, Math.min(1, (z.maxZ - pz) / Math.max(0.01, z.maxZ - z.minZ)));
      zoneH = z.minHeight + t * (z.maxHeight - z.minHeight);
    } else if (z.type === 'ramp_south') {
      // Sobe conforme avança para o Sul (de minZ para maxZ)
      const t = Math.max(0, Math.min(1, (pz - z.minZ) / Math.max(0.01, z.maxZ - z.minZ)));
      zoneH = z.minHeight + t * (z.maxHeight - z.minHeight);
    } else if (z.type === 'ramp_east') {
      const t = Math.max(0, Math.min(1, (px - z.minX) / Math.max(0.01, z.maxX - z.minX)));
      zoneH = z.minHeight + t * (z.maxHeight - z.minHeight);
    } else if (z.type === 'ramp_west') {
      const t = Math.max(0, Math.min(1, (z.maxX - px) / Math.max(0.01, z.maxX - z.minX)));
      zoneH = z.minHeight + t * (z.maxHeight - z.minHeight);
    }

    // Permite subir rampas gradualmente ou permanecer sobre lajes já alcançadas
    const stepTolerance = z.type === 'platform' ? 0.85 : 1.15;
    if (currentFootY + stepTolerance >= zoneH && zoneH > bestHeight) {
      bestHeight = zoneH;
    }
  }

  return bestHeight;
}

/**
 * Gerador de texturas procedurais em Canvas 2D para os mapas (Dust II + Vielas RJ)
 */
function createMapCanvasTexture(
  drawFn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
  maxAniso: number,
  width = 256,
  height = 256,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  drawFn(ctx, width, height);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  return tex;
}

/**
 * Cria placa comercial ou de rua em Português Brasileiro
 */
function createBrazilianSignTexture(
  bgHex: string,
  borderHex: string,
  title: string,
  subtitle: string,
  titleColor = '#ffffff',
  subColor = '#fde047',
  maxAniso = 4
): THREE.CanvasTexture {
  return createMapCanvasTexture(
    (ctx, w, h) => {
      ctx.fillStyle = bgHex;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = borderHex;
      ctx.lineWidth = 10;
      ctx.strokeRect(8, 8, w - 16, h - 16);

      ctx.fillStyle = titleColor;
      ctx.font = 'bold 34px Inter, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(title, w / 2, h * 0.38);

      ctx.fillStyle = subColor;
      ctx.font = 'bold 20px Inter, Arial, sans-serif';
      ctx.fillText(subtitle, w / 2, h * 0.72);
    },
    maxAniso,
    512,
    160,
    1,
    1
  );
}

/* ============================================================================
   CONSTRUTOR DO MAPA ORIGINAL PRESERVADO: DUST II
   ============================================================================ */
function buildDust2Arena(maxAniso: number, isSoftwareGl: boolean): BuiltArenaMap {
  const mapGroup = new THREE.Group();
  mapGroup.name = 'Map_Dust2';
  const shootableMeshes: THREE.Mesh[] = [];
  const colliders: AABBCollider[] = [];
  const elevationZones: ElevationZone[] = [];
  const disposableTextures: THREE.Texture[] = [];
  const disposableMaterials: THREE.Material[] = [];
  const disposableGeometries: THREE.BufferGeometry[] = [];

  const registerMesh = (mesh: THREE.Mesh, isShootable = true) => {
    mesh.castShadow = !isSoftwareGl;
    mesh.receiveShadow = !isSoftwareGl;
    disposableGeometries.push(mesh.geometry);
    if ( isShootable ) shootableMeshes.push(mesh);
  };

  const sandTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#e3c18f';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 1800; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#d2ad79' : '#eed0a1';
        ctx.globalAlpha = Math.random() * 0.28;
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
      }
    },
    maxAniso,
    256,
    256,
    22,
    22
  );
  disposableTextures.push(sandTex);

  const createMasonryTex = (isBrick: boolean, rx: number, ry: number) => {
    const t = createMapCanvasTexture(
      (ctx) => {
        ctx.fillStyle = isBrick ? '#965238' : '#cfa977';
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 1200; i++) {
          ctx.fillStyle = isBrick ? '#6e3722' : '#a67f4e';
          ctx.globalAlpha = Math.random() * 0.25;
          ctx.fillRect(Math.random() * 256, Math.random() * 256, 4, 4);
        }
        ctx.globalAlpha = 0.42;
        ctx.strokeStyle = '#4a3520';
        ctx.lineWidth = 3;
        const rowH = 32;
        for (let y = 0; y < 256; y += rowH) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(256, y);
          ctx.stroke();
          const offset = (y / rowH) % 2 === 0 ? 0 : 32;
          for (let x = offset; x < 256; x += 64) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + rowH);
            ctx.stroke();
          }
        }
      },
      maxAniso,
      256,
      256,
      rx,
      ry
    );
    disposableTextures.push(t);
    return t;
  };

  const crateTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#a46b39';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#5c3818';
      ctx.lineWidth = 4;
      for (let y = 32; y < 256; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
      }
      ctx.lineWidth = 14;
      ctx.strokeRect(7, 7, 242, 242);
      ctx.beginPath();
      ctx.moveTo(12, 12);
      ctx.lineTo(244, 244);
      ctx.stroke();
    },
    maxAniso
  );
  disposableTextures.push(crateTex);

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xe3c18f,
    map: sandTex,
    roughness: 0.92,
    metalness: 0.02,
  });
  const wallMat = new THREE.MeshStandardMaterial({
    map: createMasonryTex(false, 8, 2),
    roughness: 0.86,
  });
  const brickMat = new THREE.MeshStandardMaterial({
    map: createMasonryTex(true, 4, 2),
    roughness: 0.82,
  });
  const crateMat = new THREE.MeshStandardMaterial({
    map: crateTex,
    roughness: 0.76,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x3b2818,
    roughness: 0.6,
    metalness: 0.3,
  });
  disposableMaterials.push(floorMat, wallMat, brickMat, crateMat, trimMat);

  const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(72, 72), floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  registerMesh(floorMesh, true);
  mapGroup.add(floorMesh);

  const addArenaBlock = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    registerMesh(mesh, true);
    mapGroup.add(mesh);
    colliders.push({
      minX: x - w / 2,
      maxX: x + w / 2,
      minY: y - h / 2,
      maxY: y + h / 2,
      minZ: z - d / 2,
      maxZ: z + d / 2,
    });
  };

  const addCompositeCrate = (x: number, z: number, size: number, stackY = 0) => {
    const group = new THREE.Group();
    const yCenter = stackY + size / 2;
    group.position.set(x, stackY, z);

    const core = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), crateMat);
    core.position.y = size / 2;
    registerMesh(core, true);
    group.add(core);

    const beamTop = new THREE.Mesh(
      new THREE.BoxGeometry(size * 1.03, size * 0.1, size * 1.03),
      trimMat
    );
    beamTop.position.y = size - size * 0.05;
    registerMesh(beamTop, false);

    const beamBot = new THREE.Mesh(
      new THREE.BoxGeometry(size * 1.03, size * 0.1, size * 1.03),
      trimMat
    );
    beamBot.position.y = size * 0.05;
    registerMesh(beamBot, false);

    group.add(beamTop, beamBot);
    mapGroup.add(group);

    colliders.push({
      minX: x - size / 2,
      maxX: x + size / 2,
      minY: yCenter - size / 2,
      maxY: yCenter + size / 2,
      minZ: z - size / 2,
      maxZ: z + size / 2,
    });
  };

  // Paredes Perimetrais da Arena Fechada (60x60m)
  addArenaBlock(0, 4.5, -30, 60, 9, 2, wallMat);
  addArenaBlock(0, 4.5, 30, 60, 9, 2, wallMat);
  addArenaBlock(-30, 4.5, 0, 2, 9, 60, wallMat);
  addArenaBlock(30, 4.5, 0, 2, 9, 60, wallMat);

  // Estruturas Táticas Estilo "Dust II"
  addArenaBlock(-11, 3.2, -5, 2.2, 6.4, 18, wallMat);
  addArenaBlock(11, 3.2, 5, 2.2, 6.4, 18, wallMat);
  addArenaBlock(-5.5, 3.2, -15, 9, 6.4, 2.2, brickMat);
  addArenaBlock(6.5, 3.2, -15, 9, 6.4, 2.2, brickMat);
  addArenaBlock(0.5, 5.4, -15, 4, 2.0, 2.4, brickMat);

  addArenaBlock(-19, 3.2, 13, 3.2, 6.4, 3.2, brickMat);
  addArenaBlock(19, 3.2, -13, 3.2, 6.4, 3.2, brickMat);

  const cratePlacements: [number, number, number, number][] = [
    [-4.5, 11, 2.4, 0],
    [5.5, 13, 2.4, 0],
    [5.5, 13, 1.8, 2.4],
    [-17, 6, 2.6, 0],
    [-19, -12, 2.5, 0],
    [17, -9, 2.6, 0],
    [17, -9, 1.9, 2.6],
    [0, 0, 2.5, 0],
    [18, 17, 2.4, 0],
    [-7, -22, 2.4, 0],
    [8, -22, 2.4, 0],
    [-22, 20, 2.5, 0],
  ];
  cratePlacements.forEach(([cx, cz, sz, sy]) => addCompositeCrate(cx, cz, sz, sy));

  return {
    id: 'dust2',
    mapGroup,
    shootableMeshes,
    colliders,
    elevationZones,
    ctSpawns: [
      [-10, 0, 23],
      [-5, 0, 23],
      [5, 0, 23],
      [10, 0, 23],
      [0, 0, 20],
    ],
    trSpawns: [
      [-10, 0, -23],
      [-5, 0, -23],
      [5, 0, -23],
      [10, 0, -23],
      [0, 0, -20],
    ],
    playerCtSpawn: { pos: [0, 1.72, 23], yaw: 0 },
    playerTrSpawn: { pos: [0, 1.72, -23], yaw: Math.PI },
    waypoints: [
      [0.5, 0, -18.5],
      [0.5, 0, -11.0],
      [-4.5, 0, -4.0],
      [4.5, 0, 2.0],
      [0.0, 0, 8.5],
      [-18.0, 0, -18.0],
      [-18.0, 0, 0.0],
      [-16.0, 0, 16.0],
      [18.0, 0, -17.0],
      [18.0, 0, 0.0],
      [16.0, 0, 16.0],
      [-7.0, 0, 17.5],
      [7.0, 0, 17.5],
      [0.0, 0, -22.0],
    ],
    skyColor: 0xd9b98b,
    fogColor: 0xd9b98b,
    fogDensity: 0.014,
    hemiSkyColor: 0xfff5db,
    hemiGroundColor: 0x9c7a54,
    hemiIntensity: 0.85,
    sunColor: 0xfff1d0,
    sunIntensity: 1.45,
    sunPosition: [28, 46, 24],
    dispose: () => {
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
    },
  };
}

/* ============================================================================
   CONSTRUTOR DO MAPA 1 — VIELAS (MORRO CARIOCA · RIO DE JANEIRO)
   ============================================================================ */
function buildVielasArena(maxAniso: number, isSoftwareGl: boolean): BuiltArenaMap {
  const mapGroup = new THREE.Group();
  mapGroup.name = 'Map_Vielas';
  const shootableMeshes: THREE.Mesh[] = [];
  const colliders: AABBCollider[] = [];
  const elevationZones: ElevationZone[] = [];
  const disposableTextures: THREE.Texture[] = [];
  const disposableMaterials: THREE.Material[] = [];
  const disposableGeometries: THREE.BufferGeometry[] = [];

  const registerMesh = (mesh: THREE.Mesh, isShootable = true) => {
    mesh.castShadow = !isSoftwareGl;
    mesh.receiveShadow = !isSoftwareGl;
    disposableGeometries.push(mesh.geometry);
    if (isShootable) shootableMeshes.push(mesh);
  };

  // 1. Texturas Procedurais Brasileiras (Paralelepípedo, Tijolo Baiano, Reboco Colorido, Concreto, Asfalto)
  const cobblestoneTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#736f68';
      ctx.fillRect(0, 0, 256, 256);
      const rows = 8;
      const cols = 8;
      const cw = 256 / cols;
      const ch = 256 / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = (r % 2) * (cw * 0.5);
          const x = ((c * cw + ox) % 256);
          const y = r * ch;
          const shade = 95 + Math.floor(Math.random() * 38);
          ctx.fillStyle = `rgb(${shade},${shade - 3},${shade - 7})`;
          ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);
        }
      }
    },
    maxAniso,
    256,
    256,
    24,
    24
  );

  const tijoloBaianoTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#b4532a';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#783519';
      ctx.lineWidth = 3;
      for (let y = 0; y < 256; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
        const off = (y / 32) % 2 === 0 ? 0 : 32;
        for (let x = off; x < 256; x += 64) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + 32);
          ctx.stroke();
          // Frisos característicos de tijolo furado baiano
          ctx.strokeStyle = 'rgba(70, 25, 10, 0.35)';
          ctx.beginPath();
          ctx.moveTo(x + 6, y + 10);
          ctx.lineTo(x + 58, y + 10);
          ctx.moveTo(x + 6, y + 22);
          ctx.lineTo(x + 58, y + 22);
          ctx.stroke();
          ctx.strokeStyle = '#783519';
        }
      }
    },
    maxAniso,
    256,
    256,
    4,
    2
  );

  const createPlasterWallTex = (baseHex: string, stainHex: string, rx = 3, ry = 2) => {
    const tex = createMapCanvasTexture(
      (ctx) => {
        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 950; i++) {
          ctx.fillStyle = stainHex;
          ctx.globalAlpha = Math.random() * 0.18;
          ctx.fillRect(Math.random() * 256, Math.random() * 256, 6, 5);
        }
        // Rodapé de cimento desgastado
        ctx.globalAlpha = 0.25;
        ctx.fillStyle = '#3f3f46';
        ctx.fillRect(0, 215, 256, 41);
      },
      maxAniso,
      256,
      256,
      rx,
      ry
    );
    disposableTextures.push(tex);
    return tex;
  };

  const concreteTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#8b8d91';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 1100; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#717378' : '#a1a3a8';
        ctx.globalAlpha = Math.random() * 0.22;
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 4, 4);
      }
    },
    maxAniso,
    256,
    256,
    6,
    6
  );

  const muralGraffitiTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#d6c7b2';
      ctx.fillRect(0, 0, 256, 256);
      // Grafite urbano geométrico estilo Rio (azul, amarelo-sol, verde-bandeira e coral)
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(20, 190);
      ctx.lineTo(95, 70);
      ctx.lineTo(155, 190);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(165, 125, 48, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#16a34a';
      ctx.fillRect(40, 145, 180, 38);

      ctx.strokeStyle = '#18181b';
      ctx.lineWidth = 6;
      ctx.strokeRect(38, 68, 184, 120);
    },
    maxAniso,
    256,
    256,
    2,
    1
  );

  const signBarZeTex = createBrazilianSignTexture(
    '#991b1b',
    '#facc15',
    'BAR & MERCEARIA DO ZÉ',
    'SALGADOS · REFRIGERANTES · GELO',
    '#ffffff',
    '#fde047',
    maxAniso
  );
  const signOficinaTex = createBrazilianSignTexture(
    '#1e3a8a',
    '#38bdf8',
    'OFICINA DO MORRO',
    'LANTERNAGEM · BORRACHARIA · PEÇAS',
    '#ffffff',
    '#bae6fd',
    maxAniso
  );
  const signBecoPazTex = createBrazilianSignTexture(
    '#14532d',
    '#ffffff',
    'LARGO DAS LAJES',
    'VIELA PRINCIPAL — RIO DE JANEIRO',
    '#ffffff',
    '#86efac',
    maxAniso
  );

  disposableTextures.push(
    cobblestoneTex,
    tijoloBaianoTex,
    concreteTex,
    muralGraffitiTex,
    signBarZeTex,
    signOficinaTex,
    signBecoPazTex
  );

  // 2. Materiais PBR compartilhados do Mapa Vielas
  const floorMat = new THREE.MeshStandardMaterial({
    map: cobblestoneTex,
    roughness: 0.9,
    metalness: 0.04,
  });
  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x33363b,
    roughness: 0.88,
    metalness: 0.05,
  });
  const tijoloMat = new THREE.MeshStandardMaterial({
    map: tijoloBaianoTex,
    roughness: 0.85,
  });
  const plasterOchreMat = new THREE.MeshStandardMaterial({
    map: createPlasterWallTex('#d99b4e', '#a16623'),
    roughness: 0.84,
  });
  const plasterGreenMat = new THREE.MeshStandardMaterial({
    map: createPlasterWallTex('#5fa883', '#3b7357'),
    roughness: 0.84,
  });
  const plasterBlueMat = new THREE.MeshStandardMaterial({
    map: createPlasterWallTex('#5288b5', '#325a7d'),
    roughness: 0.84,
  });
  const plasterTerracottaMat = new THREE.MeshStandardMaterial({
    map: createPlasterWallTex('#c7634c', '#8f3c29'),
    roughness: 0.85,
  });
  const plasterWhiteMat = new THREE.MeshStandardMaterial({
    map: createPlasterWallTex('#dfd9ce', '#a8a196'),
    roughness: 0.86,
  });
  const concreteMat = new THREE.MeshStandardMaterial({
    map: concreteTex,
    roughness: 0.82,
  });
  const muralMat = new THREE.MeshStandardMaterial({
    map: muralGraffitiTex,
    roughness: 0.8,
  });
  const waterTankBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.38,
    metalness: 0.12,
  });
  const zincRoofMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.52,
    metalness: 0.55,
  });
  const darkIronMat = new THREE.MeshStandardMaterial({
    color: 0x27272a,
    roughness: 0.45,
    metalness: 0.72,
  });
  const woodPoleMat = new THREE.MeshStandardMaterial({
    color: 0x5c4028,
    roughness: 0.82,
  });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x2e6f40,
    roughness: 0.75,
  });

  disposableMaterials.push(
    floorMat,
    asphaltMat,
    tijoloMat,
    plasterOchreMat,
    plasterGreenMat,
    plasterBlueMat,
    plasterTerracottaMat,
    plasterWhiteMat,
    concreteMat,
    muralMat,
    waterTankBlueMat,
    zincRoofMat,
    darkIronMat,
    woodPoleMat,
    wireMat,
    foliageMat
  );

  // Piso Geral de Paralelepípedo (64x64m) + Faixa de Asfalto na Entrada Sul (Base PM)
  const mainFloor = new THREE.Mesh(new THREE.PlaneGeometry(72, 72), floorMat);
  mainFloor.rotation.x = -Math.PI / 2;
  registerMesh(mainFloor, true);
  mapGroup.add(mainFloor);

  const southAsphalt = new THREE.Mesh(new THREE.PlaneGeometry(58, 12), asphaltMat);
  southAsphalt.rotation.x = -Math.PI / 2;
  southAsphalt.position.set(0, 0.015, 23);
  registerMesh(southAsphalt, true);
  mapGroup.add(southAsphalt);

  // Auxiliar para adicionar blocos sólidos com colisão AABB
  const addBlock = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    addCollider = true
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    registerMesh(mesh, true);
    mapGroup.add(mesh);
    if (addCollider) {
      colliders.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minY: y - h / 2,
        maxY: y + h / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2,
      });
    }
    return mesh;
  };

  // Auxiliar para criar casa brasileira com janelas, telha ou laje e caixa d'água
  const addFavelaHouse = (
    x: number,
    z: number,
    w: number,
    h: number,
    d: number,
    wallMat: THREE.Material,
    hasWaterTank = false,
    hasZincRoof = true
  ) => {
    addBlock(x, h / 2, z, w, h, d, wallMat, true);

    // Molduras de janelas/venezianas nas fachadas
    const winGeo = new THREE.BoxGeometry(w + 0.12, 0.9, 1.1);
    const winMesh = new THREE.Mesh(winGeo, darkIronMat);
    winMesh.position.set(x, Math.min(h - 1.1, 2.2), z);
    registerMesh(winMesh, false);
    mapGroup.add(winMesh);

    if (hasZincRoof) {
      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.5, 0.18, d + 0.5),
        zincRoofMat
      );
      roof.position.set(x, h + 0.09, z);
      roof.rotation.z = 0.04;
      registerMesh(roof, false);
      mapGroup.add(roof);
    }

    if (hasWaterTank) {
      const tankGroup = new THREE.Group();
      tankGroup.position.set(x + (w * 0.2), h + (hasZincRoof ? 0.18 : 0), z - (d * 0.15));
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.45, 1.3), concreteMat);
      base.position.y = 0.225;
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.78, 0.68, 1.05, 12),
        waterTankBlueMat
      );
      body.position.y = 0.95;
      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.84, 0.82, 0.14, 12),
        waterTankBlueMat
      );
      lid.position.y = 1.52;
      registerMesh(base, false);
      registerMesh(body, true);
      registerMesh(lid, false);
      tankGroup.add(base, body, lid);
      mapGroup.add(tankGroup);
    }
  };

  // Auxiliar para criar Escadaria de Concreto Subível (com degraus 3D visuais + rampa física suave)
  const addWalkableStaircase = (
    x: number,
    minZ: number,
    maxZ: number,
    width: number,
    topHeight: number,
    direction: 'ramp_north' | 'ramp_south'
  ) => {
    const length = maxZ - minZ;
    const steps = 11;
    const stepD = length / steps;
    const stepH = topHeight / steps;

    for (let s = 0; s < steps; s++) {
      const h = (s + 1) * stepH;
      const sz =
        direction === 'ramp_north'
          ? maxZ - (s + 0.5) * stepD
          : minZ + (s + 0.5) * stepD;
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, h, stepD + 0.04),
        concreteMat
      );
      stepMesh.position.set(x, h / 2, sz);
      registerMesh(stepMesh, true);
      mapGroup.add(stepMesh);
    }

    // Corrimão / Mureta fina lateral externa da escadaria
    const railX = x < 0 ? x - width / 2 - 0.12 : x + width / 2 + 0.12;
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, topHeight + 0.65, length),
      tijoloMat
    );
    rail.position.set(railX, (topHeight + 0.65) / 2, (minZ + maxZ) / 2);
    registerMesh(rail, true);
    mapGroup.add(rail);
    colliders.push({
      minX: railX - 0.12,
      maxX: railX + 0.12,
      minY: 0,
      maxY: topHeight + 0.8,
      minZ,
      maxZ,
    });

    // Registra a zona de elevação suave para jogador e bots subirem sem travar
    elevationZones.push({
      minX: x - width / 2 - 0.15,
      maxX: x + width / 2 + 0.15,
      minZ: minZ - 0.2,
      maxZ: maxZ + 0.2,
      minHeight: 0,
      maxHeight: topHeight,
      type: direction,
    });
  };

  // ============================================================================
  // 3. PERÍMETRO URBANO DO MORRO (Sem caixa vazia: Fachadas de Casas em 2 e 3 Andares)
  // ============================================================================
  addBlock(0, 5.0, -30, 60, 10, 2, tijoloMat);
  addBlock(0, 5.0, 30, 60, 10, 2, plasterOchreMat);
  addBlock(-30, 5.0, 0, 2, 10, 60, plasterTerracottaMat);
  addBlock(30, 5.0, 0, 2, 10, 60, plasterGreenMat);

  // Fachadas perimetrais com caixas d'água azuis no topo para horizonte autêntico carioca
  addFavelaHouse(-21, -28.2, 11, 7.5, 2.4, plasterOchreMat, true, true);
  addFavelaHouse(21, -28.2, 11, 8.2, 2.4, plasterBlueMat, true, true);
  addFavelaHouse(-28.2, -14, 2.4, 7.8, 12, tijoloMat, true, true);
  addFavelaHouse(-28.2, 12, 2.4, 7.2, 12, plasterGreenMat, false, true);
  addFavelaHouse(28.2, -12, 2.4, 8.0, 12, plasterOchreMat, true, true);
  addFavelaHouse(28.2, 14, 2.4, 7.4, 12, tijoloMat, true, true);

  // ============================================================================
  // 4. DUAS LAJES TÁTICAS JOGÁVEIS (+2.6m) + ESCADARIAS SUBÍVEIS + PASSARELA CENTRAL
  // ============================================================================
  const LAJE_HEIGHT = 2.6;

  // --- LAJE OESTE ("Bar & Mercearia do Zé" no térreo + Laje Tática no topo) ---
  // Bloco estrutural térreo (bloqueia no nível 0..2.6m, mas permite pisar em y = 2.6m)
  addBlock(-12.5, LAJE_HEIGHT / 2, -2.0, 7.2, LAJE_HEIGHT, 8.4, plasterOchreMat, true);
  elevationZones.push({
    minX: -16.1,
    maxX: -8.9,
    minZ: -6.2,
    maxZ: 2.2,
    minHeight: LAJE_HEIGHT,
    maxHeight: LAJE_HEIGHT,
    type: 'platform',
  });

  // Muretas de proteção (parapeito) na Laje Oeste (altura de cobertura tática)
  addBlock(-12.5, LAJE_HEIGHT + 0.55, 2.05, 4.2, 1.1, 0.3, tijoloMat, true);
  addBlock(-12.5, LAJE_HEIGHT + 0.55, -6.05, 4.2, 1.1, 0.3, tijoloMat, true);
  addBlock(-15.95, LAJE_HEIGHT + 0.55, -2.0, 0.3, 1.1, 4.5, tijoloMat, true);

  // Caixa d'água azul sobre torre na quina da Laje Oeste (serve como cover na laje!)
  const westTankTower = addBlock(-10.2, LAJE_HEIGHT + 0.9, -4.4, 1.5, 1.8, 1.5, tijoloMat, true);
  westTankTower.castShadow = !isSoftwareGl;
  const westTank = new THREE.Mesh(
    new THREE.CylinderGeometry(0.82, 0.72, 1.0, 12),
    waterTankBlueMat
  );
  westTank.position.set(-10.2, LAJE_HEIGHT + 2.3, -4.4);
  registerMesh(westTank, true);
  mapGroup.add(westTank);

  // Placa "BAR & MERCEARIA DO ZÉ" na fachada térrea da Laje Oeste
  const barSignMat = new THREE.MeshStandardMaterial({ map: signBarZeTex, roughness: 0.5 });
  disposableMaterials.push(barSignMat);
  const barSign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.3), barSignMat);
  barSign.position.set(-16.16, 1.85, -2.0);
  barSign.rotation.y = -Math.PI / 2;
  registerMesh(barSign, false);
  mapGroup.add(barSign);

  // Escadaria Sul -> Sobe para a Laje Oeste (x = -14.2, z = 9.8 até 2.2)
  addWalkableStaircase(-14.2, 2.2, 9.8, 2.8, LAJE_HEIGHT, 'ramp_north');
  // Escadaria Norte -> Sobe para a Laje Oeste (x = -14.2, z = -13.8 até -6.2)
  addWalkableStaircase(-14.2, -13.8, -6.2, 2.8, LAJE_HEIGHT, 'ramp_south');

  // --- LAJE LESTE ("Oficina do Morro" no térreo + Laje Tática no topo) ---
  addBlock(12.5, LAJE_HEIGHT / 2, -2.0, 7.2, LAJE_HEIGHT, 8.4, plasterBlueMat, true);
  elevationZones.push({
    minX: 8.9,
    maxX: 16.1,
    minZ: -6.2,
    maxZ: 2.2,
    minHeight: LAJE_HEIGHT,
    maxHeight: LAJE_HEIGHT,
    type: 'platform',
  });

  // Parapeitos táticos na Laje Leste
  addBlock(12.5, LAJE_HEIGHT + 0.55, 2.05, 4.2, 1.1, 0.3, tijoloMat, true);
  addBlock(12.5, LAJE_HEIGHT + 0.55, -6.05, 4.2, 1.1, 0.3, tijoloMat, true);
  addBlock(15.95, LAJE_HEIGHT + 0.55, -2.0, 0.3, 1.1, 4.5, tijoloMat, true);

  // Caixa d'água azul na quina da Laje Leste
  addBlock(10.2, LAJE_HEIGHT + 0.9, 0.4, 1.5, 1.8, 1.5, tijoloMat, true);
  const eastTank = new THREE.Mesh(
    new THREE.CylinderGeometry(0.82, 0.72, 1.0, 12),
    waterTankBlueMat
  );
  eastTank.position.set(10.2, LAJE_HEIGHT + 2.3, 0.4);
  registerMesh(eastTank, true);
  mapGroup.add(eastTank);

  // Placa "OFICINA DO MORRO" na fachada leste
  const oficinaSignMat = new THREE.MeshStandardMaterial({ map: signOficinaTex, roughness: 0.5 });
  disposableMaterials.push(oficinaSignMat);
  const oficinaSign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.3), oficinaSignMat);
  oficinaSign.position.set(16.16, 1.85, -2.0);
  oficinaSign.rotation.y = Math.PI / 2;
  registerMesh(oficinaSign, false);
  mapGroup.add(oficinaSign);

  // Escadaria Sul -> Sobe para a Laje Leste (x = +14.2, z = 9.8 até 2.2)
  addWalkableStaircase(14.2, 2.2, 9.8, 2.8, LAJE_HEIGHT, 'ramp_north');
  // Escadaria Norte -> Sobe para a Laje Leste (x = +14.2, z = -13.8 até -6.2)
  addWalkableStaircase(14.2, -13.8, -6.2, 2.8, LAJE_HEIGHT, 'ramp_south');

  // --- PASSARELA ELEVADA CENTRAL (Conecta Laje Oeste <-> Laje Leste sobre o Beco Central) ---
  // Altura livre de 2.4m por baixo para passagem térrea normal, piso em y = 2.6m!
  const bridgeSlab = new THREE.Mesh(new THREE.BoxGeometry(17.8, 0.26, 2.8), concreteMat);
  bridgeSlab.position.set(0, LAJE_HEIGHT - 0.13, -2.0);
  registerMesh(bridgeSlab, true);
  mapGroup.add(bridgeSlab);

  elevationZones.push({
    minX: -9.0,
    maxX: 9.0,
    minZ: -3.4,
    maxZ: -0.6,
    minHeight: LAJE_HEIGHT,
    maxHeight: LAJE_HEIGHT,
    type: 'platform',
  });

  // Guarda-corpo metálico vazado e placas de cobertura na passarela
  addBlock(-3.5, LAJE_HEIGHT + 0.5, -0.65, 3.2, 1.0, 0.16, darkIronMat, true);
  addBlock(3.5, LAJE_HEIGHT + 0.5, -3.35, 3.2, 1.0, 0.16, darkIronMat, true);

  // Placa "LARGO DAS LAJES" na viga da passarela central
  const largoSignMat = new THREE.MeshStandardMaterial({ map: signBecoPazTex, roughness: 0.5 });
  disposableMaterials.push(largoSignMat);
  const largoSign = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.05), largoSignMat);
  largoSign.position.set(0, LAJE_HEIGHT + 0.35, -0.52);
  registerMesh(largoSign, false);
  mapGroup.add(largoSign);

  // ============================================================================
  // 5. CASAS DE ALVENARIA, MUROS DE BLOQUEIO DE SPAWN E COBERTURAS URBANAS
  // ============================================================================
  // Bloqueio visual e tático diante da Base CT (Sul, z = +16.5) — impede visão direta CT <-> TR
  addFavelaHouse(0, 16.2, 8.4, 4.6, 3.2, muralMat, true, true);
  // Casas laterais no setor Sul (criando o Beco Oeste e o Beco Leste)
  addFavelaHouse(-21.5, 9.0, 6.2, 5.4, 9.0, tijoloMat, true, true);
  addFavelaHouse(21.5, 9.0, 6.2, 5.4, 9.0, plasterTerracottaMat, true, true);

  // Bloqueio visual e tático diante da Base TR (Norte, z = -16.5) — impede visão direta TR <-> CT
  addFavelaHouse(0, -16.2, 8.4, 4.8, 3.2, plasterGreenMat, true, true);
  // Casas laterais no setor Norte
  addFavelaHouse(-21.5, -11.0, 6.2, 5.6, 9.0, plasterWhiteMat, true, true);
  addFavelaHouse(21.5, -11.0, 6.2, 5.6, 9.0, tijoloMat, false, true);

  // Coberturas Táticas no Largo Central e nos Becos (Muretas de tijolo, caixas e veículos)
  addBlock(-4.8, 1.05, 7.5, 2.8, 2.1, 1.2, tijoloMat, true);
  addBlock(4.8, 1.05, 6.0, 1.2, 2.1, 2.8, muralMat, true);
  addBlock(-4.8, 1.05, -9.5, 1.2, 2.1, 2.8, muralMat, true);
  addBlock(4.8, 1.05, -10.5, 2.8, 2.1, 1.2, tijoloMat, true);

  // Veículo Urbano Estacionado na Rua Sul (Base PM) — Modelo composto de 7 partes
  const addParkedCompactCar = (cx: number, cz: number, rotY: number, bodyHex: number) => {
    const carGroup = new THREE.Group();
    carGroup.position.set(cx, 0, cz);
    carGroup.rotation.y = rotY;

    const carPaintMat = new THREE.MeshStandardMaterial({
      color: bodyHex,
      roughness: 0.35,
      metalness: 0.45,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.15,
      metalness: 0.8,
    });
    disposableMaterials.push(carPaintMat, glassMat);

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.72, 3.9), carPaintMat);
    chassis.position.y = 0.58;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.62, 2.1), carPaintMat);
    cabin.position.set(0, 1.2, -0.15);
    const windows = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.5, 1.95), glassMat);
    windows.position.set(0, 1.22, -0.15);

    registerMesh(chassis, true);
    registerMesh(cabin, true);
    registerMesh(windows, false);
    carGroup.add(chassis, cabin, windows);

    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.24, 10);
    wheelGeo.rotateZ(Math.PI / 2);
    const wheelCoords: [number, number][] = [
      [-0.92, 1.22],
      [0.92, 1.22],
      [-0.92, -1.22],
      [0.92, -1.22],
    ];
    wheelCoords.forEach(([wx, wz]) => {
      const wMesh = new THREE.Mesh(wheelGeo, darkIronMat);
      wMesh.position.set(wx, 0.32, wz);
      registerMesh(wMesh, false);
      carGroup.add(wMesh);
    });

    mapGroup.add(carGroup);
    colliders.push({
      minX: cx - 1.3,
      maxX: cx + 1.3,
      minY: 0,
      maxY: 1.65,
      minZ: cz - 2.0,
      maxZ: cz + 2.0,
    });
  };

  addParkedCompactCar(-9.2, 19.5, 0.18, 0xe2e8f0);
  addParkedCompactCar(9.5, 19.2, -0.15, 0x1d4ed8);

  // ============================================================================
  // 6. POSTES DE LUZ, FIAÇÃO ELÉTRICA AÉREA E ÁRVORES TROPICAIS
  // ============================================================================
  const polePositions: [number, number][] = [
    [-8.2, 12.5],
    [8.2, 12.5],
    [-8.2, -12.5],
    [8.2, -12.5],
  ];

  polePositions.forEach(([px, pz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 6.8, 8), woodPoleMat);
    pole.position.set(px, 3.4, pz);
    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.12, 0.12), darkIronMat);
    crossArm.position.set(px, 6.4, pz);
    registerMesh(pole, true);
    registerMesh(crossArm, false);
    mapGroup.add(pole, crossArm);
    colliders.push({
      minX: px - 0.22,
      maxX: px + 0.22,
      minY: 0,
      maxY: 6.8,
      minZ: pz - 0.22,
      maxZ: pz + 0.22,
    });
  });

  // Fios aéreos cruzando o céu entre os postes (estética característica de comunidade carioca)
  const addOverheadWire = (p1: [number, number, number], p2: [number, number, number]) => {
    const start = new THREE.Vector3(...p1);
    const end = new THREE.Vector3(...p2);
    const dist = start.distanceTo(end);
    const wireGeo = new THREE.CylinderGeometry(0.018, 0.018, dist, 5);
    wireGeo.rotateX(Math.PI / 2);
    const wire = new THREE.Mesh(wireGeo, wireMat);
    wire.position.copy(start).add(end).multiplyScalar(0.5);
    wire.lookAt(end);
    disposableGeometries.push(wireGeo);
    mapGroup.add(wire);
  };

  addOverheadWire([-8.2, 6.4, 12.5], [8.2, 6.4, 12.5]);
  addOverheadWire([-8.2, 6.2, 12.5], [-8.2, 6.2, -12.5]);
  addOverheadWire([8.2, 6.2, 12.5], [8.2, 6.2, -12.5]);
  addOverheadWire([-8.2, 6.4, -12.5], [8.2, 6.4, -12.5]);
  addOverheadWire([-8.2, 6.3, 12.5], [8.2, 6.3, -12.5]);

  // Árvores tropicais / bananeiras nos cantos das vielas
  const addTropicalTree = (tx: number, tz: number) => {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(tx, 0, tz);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 3.2, 7), woodPoleMat);
    trunk.position.y = 1.6;
    const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.35, 0), foliageMat);
    crown1.position.set(0, 3.4, 0);
    const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.95, 0), foliageMat);
    crown2.position.set(0.55, 3.8, 0.35);
    registerMesh(trunk, true);
    registerMesh(crown1, false);
    registerMesh(crown2, false);
    treeGroup.add(trunk, crown1, crown2);
    mapGroup.add(treeGroup);
    colliders.push({
      minX: tx - 0.3,
      maxX: tx + 0.3,
      minY: 0,
      maxY: 3.5,
      minZ: tz - 0.3,
      maxZ: tz + 0.3,
    });
  };

  addTropicalTree(-24.5, 21.0);
  addTropicalTree(24.5, 21.0);
  addTropicalTree(-24.5, -21.0);
  addTropicalTree(24.5, -21.0);

  return {
    id: 'vielas',
    mapGroup,
    shootableMeshes,
    colliders,
    elevationZones,
    ctSpawns: [
      [-11, 0, 24],
      [-5, 0, 24],
      [5, 0, 24],
      [11, 0, 24],
      [0, 0, 22],
    ],
    trSpawns: [
      [-11, 0, -24],
      [-5, 0, -24],
      [5, 0, -24],
      [11, 0, -24],
      [0, 0, -22],
    ],
    playerCtSpawn: { pos: [0, 1.72, 24.5], yaw: 0 },
    playerTrSpawn: { pos: [0, 1.72, -24.5], yaw: Math.PI },
    // 18 Waypoints 3D cobrindo Becos Térreos, Largo Central, Escadarias e Lajes Superiores (+2.6m)
    waypoints: [
      // Rotas térreas Sul (Entrada PM)
      [-10.0, 0, 15.0],
      [10.0, 0, 15.0],
      [0.0, 0, 11.0],
      // Largo Central (sob e ao redor da passarela)
      [-3.5, 0, 3.5],
      [3.5, 0, 3.5],
      [0.0, 0, -2.0],
      [-3.5, 0, -7.5],
      [3.5, 0, -7.5],
      // Rotas térreas Norte (Entrada Bandidos)
      [-10.0, 0, -15.5],
      [10.0, 0, -15.5],
      [0.0, 0, -11.5],
      // Corredores externos Oeste (Bar do Zé) e Leste (Oficina)
      [-18.5, 0, 0.0],
      [18.5, 0, 0.0],
      // Waypoints de Subida e Topo das Lajes (+2.6m) + Passarela Central
      [-14.2, 1.3, 6.0],
      [-12.0, 2.6, -2.0],
      [0.0, 2.6, -2.0],
      [12.0, 2.6, -2.0],
      [14.2, 1.3, -10.0],
    ],
    skyColor: 0x7dd3fc,
    fogColor: 0xfde68a,
    fogDensity: 0.011,
    hemiSkyColor: 0xe0f2fe,
    hemiGroundColor: 0x9a6b43,
    hemiIntensity: 0.92,
    sunColor: 0xffedd5,
    sunIntensity: 1.55,
    sunPosition: [32, 42, 26],
    dispose: () => {
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
    },
  };
}

/* ============================================================================
   CONSTRUTOR DO MAPA 2 — ORLA (PRAIA, CALÇADÃO & AVENIDA · RIO DE JANEIRO)
   ============================================================================ */
function buildOrlaArena(maxAniso: number, isSoftwareGl: boolean): BuiltArenaMap {
  const mapGroup = new THREE.Group();
  mapGroup.name = 'Map_Orla';
  const shootableMeshes: THREE.Mesh[] = [];
  const colliders: AABBCollider[] = [];
  const elevationZones: ElevationZone[] = [];
  const disposableTextures: THREE.Texture[] = [];
  const disposableMaterials: THREE.Material[] = [];
  const disposableGeometries: THREE.BufferGeometry[] = [];

  const registerMesh = (mesh: THREE.Mesh, isShootable = true) => {
    mesh.castShadow = !isSoftwareGl;
    mesh.receiveShadow = !isSoftwareGl;
    disposableGeometries.push(mesh.geometry);
    if (isShootable) shootableMeshes.push(mesh);
  };

  // 1. Texturas Procedurais da Orla Carioca (Pedra Portuguesa em Ondas, Areia de Praia, Asfalto, Prédios)
  const beachSandTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#f3d9a4';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 2000; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#e6c587' : '#fae6be';
        ctx.globalAlpha = Math.random() * 0.28;
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
      }
    },
    maxAniso,
    256,
    256,
    18,
    18
  );

  // Calçadão Icônico de Copacabana em Pedra Portuguesa Preta e Branca
  const portugueseWaveTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#f4f4f0';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#1e1e22';
      for (let band = -64; band < 320; band += 64) {
        ctx.beginPath();
        for (let x = 0; x <= 256; x += 4) {
          const y = band + Math.sin((x / 256) * Math.PI * 2) * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let x = 256; x >= 0; x -= 4) {
          const y = band + 28 + Math.sin((x / 256) * Math.PI * 2) * 20;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }
      // Textura de mosaico de pedrinhas portuguesas
      ctx.strokeStyle = 'rgba(120,120,120,0.22)';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < 256; gx += 8) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, 256);
        ctx.stroke();
      }
      for (let gy = 0; gy < 256; gy += 8) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(256, gy);
        ctx.stroke();
      }
    },
    maxAniso,
    256,
    256,
    4,
    20
  );

  const avenueAsphaltTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#2d3138';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 1200; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#23262c' : '#3a3f47';
        ctx.globalAlpha = Math.random() * 0.2;
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
      }
      // Faixa tracejada amarela de trânsito no centro da pista
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(122, 20, 12, 95);
      ctx.fillRect(122, 145, 12, 95);
    },
    maxAniso,
    256,
    256,
    1,
    12
  );

  const buildingFacadeTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, 256, 256);
      // Varandas e janelas de apartamentos da orla
      for (let row = 18; row < 240; row += 54) {
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(0, row + 36, 256, 6);
        for (let col = 16; col < 240; col += 58) {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(col, row, 42, 34);
          ctx.fillStyle = '#38bdf8';
          ctx.globalAlpha = 0.35;
          ctx.fillRect(col + 3, row + 3, 17, 28);
          ctx.fillRect(col + 22, row + 3, 17, 28);
          ctx.globalAlpha = 1.0;
        }
      }
    },
    maxAniso,
    256,
    256,
    3,
    2
  );

  const oceanWaterTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.38)';
      ctx.lineWidth = 4;
      for (let y = 16; y < 256; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.quadraticCurveTo(64, y - 8, 128, y);
        ctx.quadraticCurveTo(192, y + 8, 256, y);
        ctx.stroke();
      }
    },
    maxAniso,
    256,
    256,
    6,
    16
  );

  const signPostoTex = createBrazilianSignTexture(
    '#0369a1',
    '#ffffff',
    'POSTO 4 — SALVA-VIDAS',
    'CORPO DE BOMBEIROS · ORLA DO RIO',
    '#ffffff',
    '#fde047',
    maxAniso
  );
  const signQuiosqueTex = createBrazilianSignTexture(
    '#065f46',
    '#34d399',
    'QUIOSQUE BRISA DO MAR',
    'ÁGUA DE COCO GELADA · AÇAÍ · PETISCOS',
    '#ffffff',
    '#fde047',
    maxAniso
  );
  const signHotelTex = createBrazilianSignTexture(
    '#1e293b',
    '#38bdf8',
    'HOTEL ATLÂNTICO PALACE',
    'GALERIA COMERCIAL & ESTACIONAMENTO',
    '#ffffff',
    '#7dd3fc',
    maxAniso
  );

  disposableTextures.push(
    beachSandTex,
    portugueseWaveTex,
    avenueAsphaltTex,
    buildingFacadeTex,
    oceanWaterTex,
    signPostoTex,
    signQuiosqueTex,
    signHotelTex
  );

  // 2. Materiais PBR da Orla
  const sandMat = new THREE.MeshStandardMaterial({
    map: beachSandTex,
    roughness: 0.9,
    metalness: 0.02,
  });
  const boardwalkMat = new THREE.MeshStandardMaterial({
    map: portugueseWaveTex,
    roughness: 0.82,
    metalness: 0.05,
  });
  const bikeLaneRedMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    roughness: 0.78,
  });
  const avenueMat = new THREE.MeshStandardMaterial({
    map: avenueAsphaltTex,
    roughness: 0.86,
  });
  const buildingMat = new THREE.MeshStandardMaterial({
    map: buildingFacadeTex,
    roughness: 0.65,
    metalness: 0.15,
  });
  const whiteConcreteMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.72,
  });
  const stoneWallMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.84,
  });
  const kioskWoodMat = new THREE.MeshStandardMaterial({
    color: 0x78350f,
    roughness: 0.76,
  });
  const kioskRoofGreenMat = new THREE.MeshStandardMaterial({
    color: 0x047857,
    roughness: 0.55,
  });
  const oceanMat = new THREE.MeshStandardMaterial({
    map: oceanWaterTex,
    roughness: 0.22,
    metalness: 0.15,
  });
  const seaFoamMat = new THREE.MeshStandardMaterial({
    color: 0xe0f2fe,
    roughness: 0.4,
  });
  const palmTrunkMat = new THREE.MeshStandardMaterial({
    color: 0x6b4f35,
    roughness: 0.85,
  });
  const palmLeafMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.68,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.75,
  });

  disposableMaterials.push(
    sandMat,
    boardwalkMat,
    bikeLaneRedMat,
    avenueMat,
    buildingMat,
    whiteConcreteMat,
    stoneWallMat,
    kioskWoodMat,
    kioskRoofGreenMat,
    oceanMat,
    seaFoamMat,
    palmTrunkMat,
    palmLeafMat,
    darkMetalMat
  );

  // ============================================================================
  // 3. PISOS DISTINTOS POR ZONA: AVENIDA (OESTE) · CALÇADÃO (CENTRO) · AREIA & MAR (LESTE)
  // ============================================================================
  // Base de areia litorânea cobrindo a praia
  const beachFloor = new THREE.Mesh(new THREE.PlaneGeometry(72, 72), sandMat);
  beachFloor.rotation.x = -Math.PI / 2;
  registerMesh(beachFloor, true);
  mapGroup.add(beachFloor);

  // Avenida Litorânea asfaltada a Oeste (x = -29 até -6.5)
  const avenueFloor = new THREE.Mesh(new THREE.PlaneGeometry(22.5, 62), avenueMat);
  avenueFloor.rotation.x = -Math.PI / 2;
  avenueFloor.position.set(-17.75, 0.02, 0);
  registerMesh(avenueFloor, true);
  mapGroup.add(avenueFloor);

  // Ciclovia Vermelha Carioca (x = -6.5 até -4.2)
  const bikeLaneFloor = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 62), bikeLaneRedMat);
  bikeLaneFloor.rotation.x = -Math.PI / 2;
  bikeLaneFloor.position.set(-5.35, 0.03, 0);
  registerMesh(bikeLaneFloor, true);
  mapGroup.add(bikeLaneFloor);

  // Calçadão de Pedra Portuguesa em Ondas (x = -4.2 até +6.5)
  const boardwalkFloor = new THREE.Mesh(new THREE.PlaneGeometry(10.7, 62), boardwalkMat);
  boardwalkFloor.rotation.x = -Math.PI / 2;
  boardwalkFloor.position.set(1.15, 0.03, 0);
  registerMesh(boardwalkFloor, true);
  mapGroup.add(boardwalkFloor);

  // Oceano Atlântico além da linha da praia a Leste (x = +29 até +68)
  const oceanPlane = new THREE.Mesh(new THREE.PlaneGeometry(42, 90), oceanMat);
  oceanPlane.rotation.x = -Math.PI / 2;
  oceanPlane.position.set(49, -0.05, 0);
  registerMesh(oceanPlane, false);
  mapGroup.add(oceanPlane);

  // Faixa de espuma das ondas na beira da areia (x = +28.2)
  const foamStrip = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 86), seaFoamMat);
  foamStrip.rotation.x = -Math.PI / 2;
  foamStrip.position.set(28.3, 0.01, 0);
  registerMesh(foamStrip, false);
  mapGroup.add(foamStrip);

  const addBlock = (
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    mat: THREE.Material,
    addCollider = true
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, y, z);
    registerMesh(mesh, true);
    mapGroup.add(mesh);
    if (addCollider) {
      colliders.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minY: y - h / 2,
        maxY: y + h / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2,
      });
    }
    return mesh;
  };

  // Contenção Perimetral Invisível na Beira da Água (Leste x = 29.5) + Prédios/Muros Norte, Sul e Oeste
  colliders.push({
    minX: 28.6,
    maxX: 31.0,
    minY: 0,
    maxY: 10,
    minZ: -31,
    maxZ: 31,
  });
  addBlock(0, 4.5, -30, 60, 9, 2, buildingMat, true);
  addBlock(0, 4.5, 30, 60, 9, 2, buildingMat, true);
  addBlock(-30, 6.0, 0, 2, 12, 60, buildingMat, true);

  // ============================================================================
  // 4. POSTO DE SALVA-VIDAS SUBÍVEL (+2.4m) NA PRAIA (LESTE, x = +18.0, z = 0)
  // ============================================================================
  const POSTO_H = 2.4;
  // Base circular/retangular de concreto branco do Posto 4
  addBlock(18.0, POSTO_H / 2, 0, 6.4, POSTO_H, 7.6, whiteConcreteMat, true);
  elevationZones.push({
    minX: 14.7,
    maxX: 21.3,
    minZ: -3.9,
    maxZ: 3.9,
    minHeight: POSTO_H,
    maxHeight: POSTO_H,
    type: 'platform',
  });

  // Guarda-corpo de proteção tática no mirante superior do Posto de Salva-Vidas
  addBlock(14.95, POSTO_H + 0.55, 0, 0.3, 1.1, 4.6, whiteConcreteMat, true);
  addBlock(21.05, POSTO_H + 0.55, 0, 0.3, 1.1, 4.6, whiteConcreteMat, true);
  // Cobertura em laje fina sustentada por colunas finas no topo do Posto
  const postoRoof = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.22, 7.8), whiteConcreteMat);
  postoRoof.position.set(18.0, POSTO_H + 2.65, 0);
  registerMesh(postoRoof, true);
  mapGroup.add(postoRoof);

  const postoSignMat = new THREE.MeshStandardMaterial({ map: signPostoTex, roughness: 0.4 });
  disposableMaterials.push(postoSignMat);
  const postoSign = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 1.25), postoSignMat);
  postoSign.position.set(14.75, 1.65, 0);
  postoSign.rotation.y = -Math.PI / 2;
  registerMesh(postoSign, false);
  mapGroup.add(postoSign);

  // Duas escadarias/rampas de concreto subíveis para o Posto de Salva-Vidas (Sul e Norte)
  const addLifeguardRamp = (minZ: number, maxZ: number, dir: 'ramp_north' | 'ramp_south') => {
    const steps = 10;
    const len = maxZ - minZ;
    const stepD = len / steps;
    const stepH = POSTO_H / steps;
    for (let s = 0; s < steps; s++) {
      const h = (s + 1) * stepH;
      const sz = dir === 'ramp_north' ? maxZ - (s + 0.5) * stepD : minZ + (s + 0.5) * stepD;
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, h, stepD + 0.04),
        whiteConcreteMat
      );
      stepMesh.position.set(18.0, h / 2, sz);
      registerMesh(stepMesh, true);
      mapGroup.add(stepMesh);
    }
    elevationZones.push({
      minX: 16.5,
      maxX: 19.5,
      minZ: minZ - 0.15,
      maxZ: maxZ + 0.15,
      minHeight: 0,
      maxHeight: POSTO_H,
      type: dir,
    });
  };

  addLifeguardRamp(3.8, 10.6, 'ramp_north');
  addLifeguardRamp(-10.6, -3.8, 'ramp_south');

  // ============================================================================
  // 5. DOIS QUIOSQUES NO CALÇADÃO CENTRAL + MURETAS DE CONTENÇÃO DA PRAIA
  // ============================================================================
  const kioskSignMat = new THREE.MeshStandardMaterial({ map: signQuiosqueTex, roughness: 0.45 });
  disposableMaterials.push(kioskSignMat);

  const addBeachKiosk = (kx: number, kz: number) => {
    // Balcão / Núcleo do Quiosque (protege os spawns Sul e Norte contra tiro direto)
    addBlock(kx, 1.35, kz, 5.4, 2.7, 4.4, kioskWoodMat, true);
    // Cobertura piramidal/octogonal verde-mar típica dos quiosques do Rio
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.4, 1.8, 8), kioskRoofGreenMat);
    roof.position.set(kx, 3.6, kz);
    registerMesh(roof, true);
    mapGroup.add(roof);

    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 0.95), kioskSignMat);
    sign.position.set(kx, 2.15, kz + (kz > 0 ? -2.23 : 2.23));
    if (kz > 0) sign.rotation.y = Math.PI;
    registerMesh(sign, false);
    mapGroup.add(sign);
  };

  // Quiosque Sul (protege Base CT) e Quiosque Norte (protege Base TR)
  addBeachKiosk(1.2, 14.5);
  addBeachKiosk(1.2, -14.5);

  // Muretas de pedra do calçadão dividindo o calçadão e a areia (cover tático no meio)
  addBlock(6.4, 0.95, 5.5, 0.85, 1.9, 6.2, stoneWallMat, true);
  addBlock(6.4, 0.95, -5.5, 0.85, 1.9, 6.2, stoneWallMat, true);
  addBlock(0.5, 1.05, 0, 3.6, 2.1, 1.4, stoneWallMat, true);

  // ============================================================================
  // 6. PRÉDIOS RESIDENCIAIS E COMERCIAIS NA AVENIDA (OESTE) + CARROS E BARRACAS
  // ============================================================================
  // Edifícios criando corredores urbanos laterais na Avenida Atlântica
  addBlock(-17.5, 4.8, 9.5, 6.4, 9.6, 10.5, buildingMat, true);
  addBlock(-17.5, 4.8, -9.5, 6.4, 9.6, 10.5, buildingMat, true);

  const hotelSignMat = new THREE.MeshStandardMaterial({ map: signHotelTex, roughness: 0.45 });
  disposableMaterials.push(hotelSignMat);
  const hotelSign = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.3), hotelSignMat);
  hotelSign.position.set(-14.25, 2.6, 9.5);
  hotelSign.rotation.y = Math.PI / 2;
  registerMesh(hotelSign, false);
  mapGroup.add(hotelSign);

  // Guarita / Banca de Jornal no centro da Avenida (x = -10.2, z = 0)
  addBlock(-10.2, 1.35, 0, 2.8, 2.7, 4.2, kioskWoodMat, true);

  // Barracas de Praia Coloridas na Areia (Guarda-sóis + Caixas Térmicas de Cobertura)
  const umbrellaColors = [0xef4444, 0xfacc15, 0x0284c7, 0x10b981];
  const addBeachUmbrellaSpot = (ux: number, uz: number, colorIdx: number) => {
    const uGroup = new THREE.Group();
    uGroup.position.set(ux, 0, uz);

    // Caixa térmica grande / bancada de praia (fornece cobertura de tiro na areia)
    addBlock(ux, 0.85, uz, 1.7, 1.7, 1.7, whiteConcreteMat, true);

    const uMat = new THREE.MeshStandardMaterial({
      color: umbrellaColors[colorIdx % umbrellaColors.length],
      roughness: 0.6,
    });
    disposableMaterials.push(uMat);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.8, 8), darkMetalMat);
    pole.position.y = 1.4;
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(2.1, 0.75, 8), uMat);
    canopy.position.y = 2.85;
    registerMesh(pole, false);
    registerMesh(canopy, false);
    uGroup.add(pole, canopy);
    mapGroup.add(uGroup);
  };

  addBeachUmbrellaSpot(12.2, 13.5, 0);
  addBeachUmbrellaSpot(23.2, 9.0, 1);
  addBeachUmbrellaSpot(12.2, -13.5, 2);
  addBeachUmbrellaSpot(23.2, -9.0, 3);

  // Coqueiros da Orla Carioca (Palmeiras altas ao longo do calçadão)
  const addCoconutPalm = (px: number, pz: number) => {
    const palmGroup = new THREE.Group();
    palmGroup.position.set(px, 0, pz);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 5.4, 8), palmTrunkMat);
    trunk.position.y = 2.7;
    registerMesh(trunk, true);
    palmGroup.add(trunk);

    for (let f = 0; f < 6; f++) {
      const angle = (f / 6) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.12, 2.2), palmLeafMat);
      frond.position.set(Math.sin(angle) * 0.95, 5.3, Math.cos(angle) * 0.95);
      frond.rotation.y = angle;
      frond.rotation.x = 0.32;
      registerMesh(frond, false);
      palmGroup.add(frond);
    }

    mapGroup.add(palmGroup);
    colliders.push({
      minX: px - 0.3,
      maxX: px + 0.3,
      minY: 0,
      maxY: 5.4,
      minZ: pz - 0.3,
      maxZ: pz + 0.3,
    });
  };

  addCoconutPalm(5.8, 19.5);
  addCoconutPalm(5.8, 0.0);
  addCoconutPalm(5.8, -19.5);
  addCoconutPalm(-6.2, 16.0);
  addCoconutPalm(-6.2, -16.0);

  // Veículos Estacionados na Avenida Litorânea
  const addParkedCar = (cx: number, cz: number, bodyHex: number) => {
    const carMat = new THREE.MeshStandardMaterial({
      color: bodyHex,
      roughness: 0.35,
      metalness: 0.5,
    });
    disposableMaterials.push(carMat);
    addBlock(cx, 0.85, cz, 2.0, 1.7, 4.0, carMat, true);
  };

  addParkedCar(-9.5, 19.0, 0xf8fafc);
  addParkedCar(-9.5, -19.0, 0x0284c7);

  return {
    id: 'orla',
    mapGroup,
    shootableMeshes,
    colliders,
    elevationZones,
    ctSpawns: [
      [-10, 0, 24],
      [-4, 0, 24],
      [4, 0, 24],
      [11, 0, 24],
      [0, 0, 22],
    ],
    trSpawns: [
      [-10, 0, -24],
      [-4, 0, -24],
      [4, 0, -24],
      [11, 0, -24],
      [0, 0, -22],
    ],
    playerCtSpawn: { pos: [0, 1.72, 24.5], yaw: 0 },
    playerTrSpawn: { pos: [0, 1.72, -24.5], yaw: Math.PI },
    // 18 Waypoints 3D cobrindo Corredor Oeste, Avenida, Calçadão, Areia e Posto de Salva-Vidas (+2.4m)
    waypoints: [
      // Corredor entre os Prédios e Avenida (Oeste)
      [-23.5, 0, 14.0],
      [-23.5, 0, 0.0],
      [-23.5, 0, -14.0],
      [-10.5, 0, 11.0],
      [-10.5, 0, -11.0],
      // Calçadão de Pedra Portuguesa & Quiosques (Centro)
      [-2.0, 0, 17.5],
      [2.5, 0, 7.5],
      [-2.5, 0, 0.0],
      [2.5, 0, -7.5],
      [-2.0, 0, -17.5],
      // Faixa de Areia e Barracas (Leste)
      [11.5, 0, 17.5],
      [11.5, 0, 6.0],
      [11.5, 0, -6.0],
      [11.5, 0, -17.5],
      [23.5, 0, 0.0],
      // Subida e Mirante do Posto de Salva-Vidas (+2.4m)
      [18.0, 1.2, 7.2],
      [18.0, 2.4, 0.0],
      [18.0, 1.2, -7.2],
    ],
    skyColor: 0x38bdf8,
    fogColor: 0xe0f2fe,
    fogDensity: 0.009,
    hemiSkyColor: 0xf0f9ff,
    hemiGroundColor: 0xd6c198,
    hemiIntensity: 0.98,
    sunColor: 0xfffbeb,
    sunIntensity: 1.65,
    sunPosition: [38, 52, 20],
    dispose: () => {
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
    },
  };
}

/**
 * ============================================================================
 * MAPA 3 — CENTRO (Centro Urbano & Comercial — Rio de Janeiro)
 * ============================================================================
 * Características arquitetônicas e táticas:
 * - Avenida asfaltada (Leste) com faixas de pedestres, ônibus urbano carioca, táxi amarelo com faixa azul e abrigos de ponto de ônibus.
 * - Largo da Carioca (Centro) em pedra portuguesa e granito com Terraço Central Elevado (+2.4m) acessível por 2 escadarias subíveis (ramp_west e ramp_east), bancas de jornal metálicas e canteiros arborizados.
 * - Galeria Comercial do Saara & Calçadão da Padaria (Oeste) com marquise coberta sustentada por pilares, fachadas históricas/comerciais, Padaria Carioca, Boteco do Centro e passagem interna coberta.
 * - Spawns protegidos para PM (Sul) e Bandidos (Norte) bloqueados por pavilhões comerciais.
 */
export function buildCentroArena(
  maxAniso: number,
  isSoftwareGl: boolean
): BuiltArenaMap {
  const mapGroup = new THREE.Group();
  const shootableMeshes: THREE.Mesh[] = [];
  const colliders: AABBCollider[] = [];
  const elevationZones: ElevationZone[] = [];

  const disposableGeometries: THREE.BufferGeometry[] = [];
  const disposableMaterials: THREE.Material[] = [];
  const disposableTextures: THREE.Texture[] = [];

  const registerTex = (canvas: HTMLCanvasElement, repeatX: number, repeatY: number) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    disposableTextures.push(tex);
    return tex;
  };

  // 1. Textura de Calçada de Pedra Portuguesa / Granito do Centro do Rio
  const graniteSidewalkTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 256, 256);

    // Mosaico quadriculado e bordas de pedra portuguesa preta/branca
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    for (let y = 0; y < 256; y += 32) {
      for (let x = 0; x < 256; x += 32) {
        ctx.fillStyle = (x / 32 + y / 32) % 2 === 0 ? '#d8e0e8' : '#c2ccd6';
        ctx.fillRect(x, y, 32, 32);
        ctx.strokeRect(x, y, 32, 32);
      }
    }
    // Friso geométrico escuro típico das calçadas da Rio Branco
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 256, 8);
    ctx.fillRect(0, 124, 256, 8);

    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)';
      ctx.fillRect((i * 53) % 256, (i * 89) % 256, 2, 2);
    }
    return registerTex(c, 14, 14);
  })();

  // 2. Textura de Asfalto Urbano com Faixas Amarelas
  const asphaltTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#27272a';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2000; i++) {
      const v = 32 + ((i * 29) % 26);
      ctx.fillStyle = `rgb(${v},${v},${v + 3})`;
      ctx.fillRect((i * 41) % 256, (i * 67) % 256, 2, 2);
    }
    // Faixa tracejada amarela central da avenida
    ctx.fillStyle = '#eab308';
    for (let y = 14; y < 256; y += 64) {
      ctx.fillRect(124, y, 8, 36);
    }
    // Guias laterais brancas
    ctx.fillStyle = 'rgba(248,250,252,0.5)';
    ctx.fillRect(8, 0, 4, 256);
    ctx.fillRect(244, 0, 4, 256);
    return registerTex(c, 1, 8);
  })();

  // 3. Textura de Faixa de Pedestres (Zebra Branca no Asfalto)
  const crosswalkTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#27272a';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#f8fafc';
    for (let x = 12; x < 244; x += 32) {
      ctx.fillRect(x, 12, 18, 104);
    }
    return registerTex(c, 1, 1);
  })();

  // 4. Textura de Fachada de Edifício Comercial Corporativo (Vidro & Concreto — Av. Rio Branco)
  const corporateFacadeTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(0, 0, 256, 256);

    for (let row = 0; row < 4; row++) {
      const y = row * 64;
      // Viga horizontal de concreto aparente
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, y, 256, 12);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, y + 10, 256, 3);

      // Janelas de vidro espelhado azul-petróleo escuro
      for (let col = 0; col < 4; col++) {
        const x = col * 64 + 6;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, y + 15, 52, 44);
        ctx.fillStyle = (row + col) % 2 === 0 ? '#1e3a5f' : '#172554';
        ctx.fillRect(x + 3, y + 18, 46, 38);
        // Reflexo diagonal no vidro
        ctx.fillStyle = 'rgba(186,230,253,0.16)';
        ctx.fillRect(x + 6, y + 20, 14, 34);
      }
    }
    return registerTex(c, 2, 3);
  })();

  // 5. Textura de Prédio Histórico / Galeria Comercial (Saara / Cinelândia)
  const galleryFacadeTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#e5cca0';
    ctx.fillRect(0, 0, 256, 256);

    for (let row = 0; row < 3; row++) {
      const y = row * 85;
      // Cornija clássica
      ctx.fillStyle = '#f5ebe0';
      ctx.fillRect(0, y, 256, 10);
      ctx.fillStyle = '#b08968';
      ctx.fillRect(0, y + 10, 256, 3);

      for (let col = 0; col < 3; col++) {
        const x = col * 85 + 14;
        // Moldura da janela clássica com veneziana
        ctx.fillStyle = '#7f5539';
        ctx.fillRect(x - 3, y + 18, 62, 56);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y + 21, 56, 50);
        // Divisórias douradas/madeira
        ctx.strokeStyle = '#d4a373';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, y + 25, 48, 42);
      }
    }
    return registerTex(c, 2, 2);
  })();

  // 6. Textura de Porta de Aço Enrolar de Comércio Urbano
  const steelShutterTex = (() => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 8) {
      ctx.fillStyle = y % 16 === 0 ? '#334155' : '#64748b';
      ctx.fillRect(0, y, 128, 4);
    }
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 124, 124);
    return registerTex(c, 1, 1);
  })();

  // 7. Gerador de Placas Comerciais do Centro do Rio
  const makeSignTex = (title: string, sub: string, bg: string, fg: string, border: string) => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = border;
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.fillStyle = fg;
    ctx.font = '900 32px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 256, 56);
    ctx.font = 'bold 20px Inter, Arial, sans-serif';
    ctx.fillText(sub, 256, 94);
    return registerTex(c, 1, 1);
  };

  const signPadariaMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('PADARIA & CONFEITARIA CARIOCA', 'PÃO QUENTE · CAFÉ EXPRESSO · LANCHES', '#7f1d1d', '#fef08a', '#f59e0b'),
    roughness: 0.5,
  });
  const signBotecoMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('BOTECO DO CENTRO', 'CHOPP GELADO · PETISCOS · REFEIÇÕES', '#1e293b', '#facc15', '#38bdf8'),
    roughness: 0.5,
  });
  const signSaaraMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('GALERIA SAARA RIO', 'COMÉRCIO POPULAR · ELETRÔNICOS · ROUPAS', '#0369a1', '#ffffff', '#facc15'),
    roughness: 0.5,
  });
  const signBancaMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('BANCA CARIOCA', 'JORNAIS · REVISTAS · RECARGA · CAFÉ', '#065f46', '#ecfdf5', '#10b981'),
    roughness: 0.5,
  });
  const signBusMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('BRS RIO BRANCO · CENTRO', 'LINHAS ZONA SUL · LAPA · CENTRAL', '#1d4ed8', '#ffffff', '#60a5fa'),
    roughness: 0.4,
  });

  // Materiais principais
  const graniteSidewalkMat = new THREE.MeshStandardMaterial({
    map: graniteSidewalkTex,
    roughness: 0.86,
  });
  const asphaltMat = new THREE.MeshStandardMaterial({
    map: asphaltTex,
    roughness: 0.9,
  });
  const crosswalkMat = new THREE.MeshStandardMaterial({
    map: crosswalkTex,
    roughness: 0.88,
  });
  const corporateFacadeMat = new THREE.MeshStandardMaterial({
    map: corporateFacadeTex,
    roughness: 0.45,
    metalness: 0.25,
  });
  const galleryFacadeMat = new THREE.MeshStandardMaterial({
    map: galleryFacadeTex,
    roughness: 0.8,
  });
  const steelShutterMat = new THREE.MeshStandardMaterial({
    map: steelShutterTex,
    roughness: 0.55,
    metalness: 0.5,
  });
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.85,
  });
  const darkGraniteMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.78,
  });
  const marqueeMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.7,
    metalness: 0.2,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.45,
    metalness: 0.65,
  });
  const bancaGreenMat = new THREE.MeshStandardMaterial({
    color: 0x047857,
    roughness: 0.5,
    metalness: 0.35,
  });
  const busBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.42,
    metalness: 0.3,
  });
  const busBodyMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.48,
    metalness: 0.2,
  });
  const taxiYellowMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.4,
    metalness: 0.3,
  });
  const glassDarkMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.2,
    metalness: 0.8,
  });
  const treeBarkMat = new THREE.MeshStandardMaterial({
    color: 0x5c4033,
    roughness: 0.9,
  });
  const foliageGreenMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.82,
  });
  const woodCrateMat = new THREE.MeshStandardMaterial({
    color: 0x92400e,
    roughness: 0.85,
  });

  disposableMaterials.push(
    signPadariaMat,
    signBotecoMat,
    signSaaraMat,
    signBancaMat,
    signBusMat,
    graniteSidewalkMat,
    asphaltMat,
    crosswalkMat,
    corporateFacadeMat,
    galleryFacadeMat,
    steelShutterMat,
    concreteMat,
    darkGraniteMat,
    marqueeMat,
    darkMetalMat,
    bancaGreenMat,
    busBlueMat,
    busBodyMat,
    taxiYellowMat,
    glassDarkMat,
    treeBarkMat,
    foliageGreenMat,
    woodCrateMat
  );

  const addBlock = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material,
    collidable = true
  ) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    disposableGeometries.push(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + h / 2, z);
    mesh.castShadow = !isSoftwareGl;
    mesh.receiveShadow = !isSoftwareGl;
    mapGroup.add(mesh);
    shootableMeshes.push(mesh);

    if (collidable) {
      colliders.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minY: y,
        maxY: y + h,
        minZ: z - d / 2,
        maxZ: z + d / 2,
      });
    }
    return mesh;
  };

  // ============================================================================
  // 1. PISO DO CENTRO: LARGO DE PEDRA PORTUGUESA, GALERIA E AVENIDA ASFALTADA
  // ============================================================================
  // Calçadão e Largo Central em Pedra Portuguesa / Granito (x = -32..10.5)
  const plazaFloorGeo = new THREE.PlaneGeometry(42.5, 64);
  disposableGeometries.push(plazaFloorGeo);
  const plazaFloor = new THREE.Mesh(plazaFloorGeo, graniteSidewalkMat);
  plazaFloor.rotation.x = -Math.PI / 2;
  plazaFloor.position.set(-10.75, 0, 0);
  plazaFloor.receiveShadow = !isSoftwareGl;
  mapGroup.add(plazaFloor);
  shootableMeshes.push(plazaFloor);

  // Avenida Rio Branco Asfaltada (x = 10.5..22.5)
  const avenueFloorGeo = new THREE.PlaneGeometry(12.0, 64);
  disposableGeometries.push(avenueFloorGeo);
  const avenueFloor = new THREE.Mesh(avenueFloorGeo, asphaltMat);
  avenueFloor.rotation.x = -Math.PI / 2;
  avenueFloor.position.set(16.5, 0.01, 0);
  avenueFloor.receiveShadow = !isSoftwareGl;
  mapGroup.add(avenueFloor);
  shootableMeshes.push(avenueFloor);

  // 3 Faixas de Pedestres Brancas cruzando a Avenida (Norte, Centro e Sul)
  [-15.5, 0.0, 15.5].forEach((cz) => {
    const cwGeo = new THREE.PlaneGeometry(11.6, 4.2);
    disposableGeometries.push(cwGeo);
    const cwMesh = new THREE.Mesh(cwGeo, crosswalkMat);
    cwMesh.rotation.x = -Math.PI / 2;
    cwMesh.position.set(16.5, 0.02, cz);
    mapGroup.add(cwMesh);
  });

  // Calçada Corporativa Leste (x = 22.5..32)
  const eastSidewalkGeo = new THREE.PlaneGeometry(9.5, 64);
  disposableGeometries.push(eastSidewalkGeo);
  const eastSidewalk = new THREE.Mesh(eastSidewalkGeo, graniteSidewalkMat);
  eastSidewalk.rotation.x = -Math.PI / 2;
  eastSidewalk.position.set(27.25, 0, 0);
  eastSidewalk.receiveShadow = !isSoftwareGl;
  mapGroup.add(eastSidewalk);
  shootableMeshes.push(eastSidewalk);

  // ============================================================================
  // 2. MUROS DE CONTENÇÃO E SKYLINE URBANO DO CENTRO DO RIO
  // ============================================================================
  addBlock(64, 8.5, 1.5, 0, 0, -31.25, corporateFacadeMat, true); // Limite Norte
  addBlock(64, 8.5, 1.5, 0, 0, 31.25, corporateFacadeMat, true);  // Limite Sul
  addBlock(1.5, 10.0, 64, -31.25, 0, 0, galleryFacadeMat, true);  // Limite Oeste
  addBlock(1.5, 12.0, 64, 31.25, 0, 0, corporateFacadeMat, true); // Limite Leste

  // Torres Corporativas na Calçada Leste (Avenida Rio Branco)
  addBlock(4.5, 17.5, 22.0, 28.5, 0, -16.0, corporateFacadeMat, true);
  addBlock(4.5, 19.0, 22.0, 28.5, 0, 16.0, corporateFacadeMat, true);
  // Marquises de concreto dos edifícios corporativos a Leste
  addBlock(2.2, 0.45, 22.0, 25.2, 4.2, -16.0, concreteMat, false);
  addBlock(2.2, 0.45, 22.0, 25.2, 4.2, 16.0, concreteMat, false);

  // ============================================================================
  // 3. SETOR OESTE: GALERIA SAARA, PADARIA CARIOCA E BOTECO DO CENTRO
  // ============================================================================
  // Bloco Comercial Noroeste — Galeria Saara (x = -29..-21.5, z = -22..-4.5)
  addBlock(7.5, 13.5, 17.5, -25.25, 0, -13.25, galleryFacadeMat, true);
  // Portas de aço de lojas no térreo
  addBlock(0.25, 3.2, 3.8, -21.4, 0, -17.5, steelShutterMat, false);
  addBlock(0.25, 3.2, 3.8, -21.4, 0, -9.5, steelShutterMat, false);
  // Placa da Galeria Saara
  addBlock(0.2, 1.25, 6.2, -16.4, 3.8, -13.25, signSaaraMat, false);

  // Bloco Comercial Sudoeste — Padaria Carioca & Boteco do Centro (x = -29..-21.5, z = 4.5..22)
  addBlock(7.5, 13.5, 17.5, -25.25, 0, 13.25, galleryFacadeMat, true);
  addBlock(0.25, 3.2, 3.8, -21.4, 0, 9.5, steelShutterMat, false);
  addBlock(0.25, 3.2, 3.8, -21.4, 0, 17.5, steelShutterMat, false);
  // Placas da Padaria e do Boteco
  addBlock(0.2, 1.2, 5.5, -16.4, 3.8, 9.2, signBotecoMat, false);
  addBlock(0.2, 1.2, 5.5, -16.4, 3.8, 17.2, signPadariaMat, false);

  // Marquise Coberta Contínua da Galeria Comercial (teto em y = 3.6m cobrindo o passeio x = -21.5..-16.2)
  addBlock(5.5, 0.4, 46.0, -18.8, 3.6, 0, marqueeMat, false);

  // Colunata de Pilares de Granito sustentando a Galeria (x = -16.6)
  [-20.5, -13.5, -6.5, 6.5, 13.5, 20.5].forEach((pz) => {
    addBlock(0.85, 3.6, 0.85, -16.6, 0, pz, darkGraniteMat, true);
  });

  // Balcões e Caixas de Mercadorias na Galeria Comercial para Cobertura Tática
  addBlock(1.4, 1.15, 2.8, -19.2, 0, -13.2, woodCrateMat, true);
  addBlock(1.4, 1.15, 2.8, -19.2, 0, 13.2, woodCrateMat, true);
  // Quiosque Central da Galeria (entre os blocos Norte e Sul em z = 0)
  addBlock(2.4, 2.6, 3.6, -24.5, 0, 0, steelShutterMat, true);

  // ============================================================================
  // 4. LARGO CENTRAL: TERRAÇO ELEVADO (+2.4m), 2 ESCADARIAS E BANCAS DE JORNAL
  // ============================================================================
  // Base Maciça do Terraço Central do Largo da Carioca (x = -4.2..4.2, z = -4.5..4.5, h = 2.4m)
  addBlock(8.4, 2.4, 9.0, 0, 0, 0, darkGraniteMat, true);
  // Piso superior claro do terraço
  addBlock(8.2, 0.08, 8.8, 0, 2.38, 0, graniteSidewalkMat, false);

  // Zona de Plataforma Elevada (+2.4m)
  elevationZones.push({
    minX: -4.2,
    maxX: 4.2,
    minZ: -4.5,
    maxZ: 4.5,
    minHeight: 2.4,
    maxHeight: 2.4,
    type: 'platform',
  });

  // Parapeitos Táticos no Topo do Terraço (+2.4m) voltados para Norte e Sul
  addBlock(7.6, 1.05, 0.45, 0, 2.4, -4.25, concreteMat, true);
  addBlock(7.6, 1.05, 0.45, 0, 2.4, 4.25, concreteMat, true);
  // Totem / Relógio Digital Central no Topo do Terraço para quebrar linha de visão direta
  addBlock(1.4, 2.1, 0.8, 0, 2.4, 0, darkMetalMat, true);

  // Escadaria Oeste (Sobe de x = -8.2 no chão até x = -4.2 em y = 2.4m -> ramp_east)
  const stepsCount = 8;
  for (let i = 0; i < stepsCount; i++) {
    const stepH = ((i + 1) / stepsCount) * 2.4;
    const stepX = -8.2 + (i + 0.5) * (4.0 / stepsCount);
    addBlock(4.0 / stepsCount, stepH, 3.2, stepX, 0, 0, concreteMat, false);
  }
  elevationZones.push({
    minX: -8.3,
    maxX: -4.1,
    minZ: -1.6,
    maxZ: 1.6,
    minHeight: 0,
    maxHeight: 2.4,
    type: 'ramp_east',
  });

  // Escadaria Leste (Sobe de x = +8.2 no chão até x = +4.2 em y = 2.4m -> ramp_west)
  for (let i = 0; i < stepsCount; i++) {
    const stepH = ((i + 1) / stepsCount) * 2.4;
    const stepX = 8.2 - (i + 0.5) * (4.0 / stepsCount);
    addBlock(4.0 / stepsCount, stepH, 3.2, stepX, 0, 0, concreteMat, false);
  }
  elevationZones.push({
    minX: 4.1,
    maxX: 8.3,
    minZ: -1.6,
    maxZ: 1.6,
    minHeight: 0,
    maxHeight: 2.4,
    type: 'ramp_west',
  });

  // 2 Bancas de Jornal Metálicas Verdes no Largo Central (Norte e Sul)
  const buildNewspaperStand = (bx: number, bz: number) => {
    // Corpo metálico verde da banca
    addBlock(3.4, 2.4, 2.2, bx, 0, bz, bancaGreenMat, true);
    // Teto projetado
    addBlock(4.0, 0.25, 2.8, bx, 2.4, bz, darkMetalMat, false);
    // Letreiro "BANCA CARIOCA"
    addBlock(3.2, 0.55, 0.15, bx, 2.65, bz + (bz > 0 ? -1.25 : 1.25), signBancaMat, false);
  };
  buildNewspaperStand(-9.8, -11.5);
  buildNewspaperStand(-9.8, 11.5);

  // 4 Canteiros de Concreto com Árvores Urbanas (Oitis / Ipês do Centro)
  const buildUrbanTreePlanter = (tx: number, tz: number) => {
    // Mureta de granito do canteiro (serve como cobertura baixa)
    addBlock(2.4, 0.85, 2.4, tx, 0, tz, concreteMat, true);
    // Tronco
    addBlock(0.55, 3.2, 0.55, tx, 0.85, tz, treeBarkMat, true);
    // Copa frondosa em camadas low-poly (não bloqueia tiros baixos, mas cria sombra urbana)
    addBlock(3.4, 1.6, 3.4, tx, 3.8, tz, foliageGreenMat, false);
    addBlock(2.4, 1.2, 2.4, tx, 5.2, tz, foliageGreenMat, false);
  };
  buildUrbanTreePlanter(-8.5, -4.8);
  buildUrbanTreePlanter(-8.5, 4.8);
  buildUrbanTreePlanter(6.8, -9.5);
  buildUrbanTreePlanter(6.8, 9.5);

  // ============================================================================
  // 5. SETOR LESTE: AVENIDA RIO BRANCO, ÔNIBUS URBANO, TÁXI E PONTOS DE ÔNIBUS
  // ============================================================================
  // Ônibus Urbano Municipal estacionado na faixa central da Avenida (x = 15.6, z = 0)
  addBlock(2.8, 3.1, 9.6, 15.6, 0.35, 0, busBodyMat, true);
  // Faixa azul municipal e janelas escuras do ônibus
  addBlock(2.86, 0.75, 9.64, 15.6, 1.1, 0, busBlueMat, false);
  addBlock(2.88, 0.95, 8.8, 15.6, 1.95, 0, glassDarkMat, false);
  // Rodas do ônibus
  addBlock(2.95, 0.7, 1.2, 15.6, 0, -3.0, darkMetalMat, false);
  addBlock(2.95, 0.7, 1.2, 15.6, 0, 3.0, darkMetalMat, false);

  // 2 Táxis Amarelos Cariocas (com faixa azul) na Avenida (Norte e Sul) para cobertura média
  const buildCariocaTaxi = (cx: number, cz: number) => {
    // Chassi inferior amarelo
    addBlock(2.1, 0.85, 4.4, cx, 0.2, cz, taxiYellowMat, true);
    // Faixa lateral azul típica dos táxis do Rio
    addBlock(2.16, 0.22, 4.42, cx, 0.65, cz, busBlueMat, false);
    // Cabine envidraçada
    addBlock(1.85, 0.72, 2.3, cx, 1.05, cz, glassDarkMat, true);
    // Rodas
    addBlock(2.2, 0.5, 0.8, cx, 0, cz - 1.35, darkMetalMat, false);
    addBlock(2.2, 0.5, 0.8, cx, 0, cz + 1.35, darkMetalMat, false);
  };
  buildCariocaTaxi(18.2, -13.5);
  buildCariocaTaxi(13.4, 13.5);

  // 2 Pontos de Ônibus Cobertos (BRS Rio Branco) na Calçada Leste (x = 23.2)
  const buildBusStopShelter = (sx: number, sz: number) => {
    // Painel traseiro e banco de concreto
    addBlock(0.35, 2.5, 4.8, sx + 0.9, 0, sz, darkMetalMat, true);
    addBlock(0.8, 0.55, 3.2, sx + 0.2, 0, sz, concreteMat, true);
    // Teto curvo/inclinado azul
    addBlock(2.2, 0.25, 5.2, sx + 0.1, 2.5, sz, busBlueMat, false);
    // Placa identificadora das linhas
    addBlock(0.15, 0.65, 3.6, sx - 0.9, 2.55, sz, signBusMat, false);
  };
  buildBusStopShelter(23.2, -9.5);
  buildBusStopShelter(23.2, 9.5);

  // ============================================================================
  // 6. PROTEÇÃO DE SPAWNS (SUL = PM / CT | NORTE = BANDIDOS / TR)
  // ============================================================================
  // Pavilhão Comercial Sul (protege o spawn da PM em z = 24.5)
  addBlock(9.2, 3.2, 2.6, 0, 0, 18.2, galleryFacadeMat, true);
  addBlock(9.8, 0.3, 3.2, 0, 3.2, 18.2, marqueeMat, false);

  // Pavilhão Comercial Norte (protege o spawn dos Bandidos em z = -24.5)
  addBlock(9.2, 3.2, 2.6, 0, 0, -18.2, galleryFacadeMat, true);
  addBlock(9.8, 0.3, 3.2, 0, 3.2, -18.2, marqueeMat, false);

  return {
    id: 'centro',
    mapGroup,
    shootableMeshes,
    colliders,
    elevationZones,
    ctSpawns: [
      [-10, 0, 24.5],
      [-4, 0, 24.5],
      [4, 0, 24.5],
      [11, 0, 24.5],
      [0, 0, 22.5],
    ],
    trSpawns: [
      [-10, 0, -24.5],
      [-4, 0, -24.5],
      [4, 0, -24.5],
      [11, 0, -24.5],
      [0, 0, -22.5],
    ],
    playerCtSpawn: { pos: [0, 1.72, 25.0], yaw: 0 },
    playerTrSpawn: { pos: [0, 1.72, -25.0], yaw: Math.PI },
    // 18 Waypoints 3D cobrindo Galeria Saara (Oeste), Largo Central, Terraço (+2.4m) e Avenida Rio Branco (Leste)
    waypoints: [
      // Galeria Comercial Coberta & Calçadão (Oeste)
      [-18.5, 0, 17.0],
      [-18.5, 0, 6.5],
      [-18.5, 0, 0.0],
      [-18.5, 0, -6.5],
      [-18.5, 0, -17.0],
      // Largo da Carioca & Bancas de Jornal (Centro Térreo)
      [-11.5, 0, 15.0],
      [-11.5, 0, 0.0],
      [-11.5, 0, -15.0],
      [0.0, 0, 11.5],
      [0.0, 0, -11.5],
      // Escadarias e Topo do Terraço Central (+2.4m)
      [-6.2, 1.2, 0.0],
      [0.0, 2.4, 0.0],
      [6.2, 1.2, 0.0],
      // Avenida Rio Branco, Ônibus e Pontos de Ônibus (Leste)
      [11.5, 0, 16.5],
      [11.5, 0, 5.5],
      [11.5, 0, -5.5],
      [11.5, 0, -16.5],
      [21.0, 0, 0.0],
    ],
    skyColor: 0x7dd3fc,
    fogColor: 0xe2e8f0,
    fogDensity: 0.011,
    hemiSkyColor: 0xf1f5f9,
    hemiGroundColor: 0x94a3b8,
    hemiIntensity: 0.92,
    sunColor: 0xfff7ed,
    sunIntensity: 1.48,
    sunPosition: [28, 48, 24],
    dispose: () => {
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
    },
  };
}

/**
 * ============================================================================
 * MAPA 4 — COMPLEXO (Grande Conjunto Urbano & Habitacional — Rio de Janeiro)
 * ============================================================================
 * O maior mapa do jogo (76m × 76m, x = -38..38, z = -38..38):
 * - 4 Grandes Blocos Habitacionais Populares (Blocos A, B, C, D) em concreto aparente, reboco ocre/terracota/azul desbotado, janelas gradeadas e caixas d'água comunitárias nos topos.
 * - Garagens Coletivas Cobertas em Pilotis sob os Blocos Leste (conectando áreas internas escuras com os pátios externos).
 * - Rede de Passarelas Elevadas (+2.6m): 2 Varandas Táticas (Oeste e Leste) acessíveis por 4 escadarias subíveis (ramp_north e ramp_south) e interligadas por uma longa Passarela Aérea Central sobre o Pátio da Quadra.
 * - Comércios comunitários ("MERCADINHO & PADARIA DO COMPLEXO", "LAN HOUSE & BAR DO PÁTIO", "OFICINA & GARAGEM COLETIVA"), caçambas metálicas, furgões, carros estacionados e fiação aérea.
 * - 5 rotas de progressão tática (Beco Oeste, Rua do Mercadinho, Pátio Central da Quadra, Passarela Aérea +2.6m e Garagens em Pilotis a Leste).
 */
export function buildComplexoArena(
  maxAniso: number,
  isSoftwareGl: boolean
): BuiltArenaMap {
  const mapGroup = new THREE.Group();
  const shootableMeshes: THREE.Mesh[] = [];
  const colliders: AABBCollider[] = [];
  const elevationZones: ElevationZone[] = [];

  const disposableGeometries: THREE.BufferGeometry[] = [];
  const disposableMaterials: THREE.Material[] = [];
  const disposableTextures: THREE.Texture[] = [];

  const registerTex = (canvas: HTMLCanvasElement, repeatX: number, repeatY: number) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    disposableTextures.push(tex);
    return tex;
  };

  // 1. Piso de Concreto & Asfalto Urbano do Conjunto Habitacional
  const complexGroundTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(0, 0, 256, 256);

    // Placas de concreto e juntas de dilatação
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    for (let y = 0; y < 256; y += 64) {
      for (let x = 0; x < 256; x += 64) {
        ctx.fillStyle = (x / 64 + y / 64) % 2 === 0 ? '#52525b' : '#475569';
        ctx.fillRect(x, y, 64, 64);
        ctx.strokeRect(x, y, 64, 64);
      }
    }
    for (let i = 0; i < 1800; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.12)';
      ctx.fillRect((i * 47) % 256, (i * 83) % 256, 2, 2);
    }
    return registerTex(c, 16, 16);
  })();

  // 2. Textura da Quadra Poliesportiva Comunitária (Pátio Central)
  const courtFloorTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 512;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 256, 512);
    // Área pintada da quadra comunitária (verde/azul desgastado com linhas brancas)
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(18, 24, 220, 464);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 5;
    ctx.strokeRect(24, 30, 208, 452);
    // Linha de meio de quadra e círculo central
    ctx.beginPath();
    ctx.moveTo(24, 256);
    ctx.lineTo(232, 256);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(128, 256, 44, 0, Math.PI * 2);
    ctx.stroke();
    // Garrafões Norte e Sul
    ctx.strokeRect(78, 30, 100, 74);
    ctx.strokeRect(78, 408, 100, 74);
    return registerTex(c, 1, 1);
  })();

  // 3. Gerador de Fachada de Bloco Habitacional Popular (COHAB / Conjunto Carioca)
  const makeHousingFacadeTex = (baseWallHex: string, beamHex: string, accentHex: string) => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = baseWallHex;
    ctx.fillRect(0, 0, 256, 256);

    for (let row = 0; row < 4; row++) {
      const y = row * 64;
      // Viga estrutural de concreto aparente entre andares
      ctx.fillStyle = beamHex;
      ctx.fillRect(0, y, 256, 10);
      ctx.fillStyle = accentHex;
      ctx.fillRect(0, y + 10, 256, 3);

      for (let col = 0; col < 4; col++) {
        const x = col * 64 + 8;
        // Janela quadrada de esquadria metálica com grade e caixa de ar-condicionado
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y + 18, 46, 34);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y + 18, 46, 34);
        // Divisória central da janela de correr
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 22, y + 18, 2, 34);
        // Caixa de ar-condicionado sob algumas janelas
        if ((row + col) % 2 === 0) {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(x + 6, y + 53, 18, 8);
        }
      }
    }
    // Desgaste urbano sutil
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect((i * 59) % 256, (i * 97) % 256, 3, 3);
    }
    return registerTex(c, 2, 2);
  };

  const housingOchreTex = makeHousingFacadeTex('#d6a868', '#94a3b8', '#b45309');
  const housingTerracottaTex = makeHousingFacadeTex('#c26d53', '#9ca3af', '#7c2d12');
  const housingBlueTex = makeHousingFacadeTex('#7ba3be', '#94a3b8', '#0369a1');

  // 4. Textura de Parede de Tijolo Aparente / Muro Comunitário
  const brickWallTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#9a4627';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = '#6b2f1a';
    ctx.lineWidth = 2;
    for (let y = 0; y < 256; y += 16) {
      const offset = (y / 16) % 2 === 0 ? 0 : 16;
      for (let x = -16; x < 256; x += 32) {
        ctx.fillStyle = (x + y) % 48 === 0 ? '#a85131' : '#8c3d20';
        ctx.fillRect(x + offset, y, 30, 14);
        ctx.strokeRect(x + offset, y, 30, 14);
      }
    }
    return registerTex(c, 3, 2);
  })();

  // 5. Gerador de Placas de Blocos e Comércios do Complexo
  const makeSignTex = (title: string, sub: string, bg: string, fg: string, border: string) => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = border;
    ctx.lineWidth = 8;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.fillStyle = fg;
    ctx.font = '900 32px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 256, 56);
    ctx.font = 'bold 20px Inter, Arial, sans-serif';
    ctx.fillText(sub, 256, 94);
    return registerTex(c, 1, 1);
  };

  const signMercadoMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('MERCADINHO & PADARIA DO COMPLEXO', 'PÃO QUENTE · MERCEARIA · BEBIDAS', '#b91c1c', '#fef08a', '#f59e0b'),
    roughness: 0.5,
  });
  const signLanHouseMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('LAN HOUSE & BAR DO PÁTIO', 'GAMES · AÇAÍ · SINUCA · LANCHES', '#1e1b4b', '#38bdf8', '#a855f7'),
    roughness: 0.5,
  });
  const signGaragemMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('GARAGEM COLETIVA & OFICINA', 'BLOCOS B-02 / D-04 · ESTACIONAMENTO', '#334155', '#facc15', '#94a3b8'),
    roughness: 0.5,
  });
  const signBlocoAMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('CONJUNTO HABITACIONAL · BLOCO A-01', 'SETOR NOROESTE · QUADRA CENTRAL', '#0f172a', '#f8fafc', '#f97316'),
    roughness: 0.5,
  });
  const signBlocoBMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('CONJUNTO HABITACIONAL · BLOCO B-02', 'SETOR LESTE · PILOTIS & PASSARELA', '#0f172a', '#f8fafc', '#38bdf8'),
    roughness: 0.5,
  });

  // Materiais principais
  const complexGroundMat = new THREE.MeshStandardMaterial({
    map: complexGroundTex,
    roughness: 0.9,
  });
  const courtFloorMat = new THREE.MeshStandardMaterial({
    map: courtFloorTex,
    roughness: 0.85,
  });
  const housingOchreMat = new THREE.MeshStandardMaterial({
    map: housingOchreTex,
    roughness: 0.85,
  });
  const housingTerracottaMat = new THREE.MeshStandardMaterial({
    map: housingTerracottaTex,
    roughness: 0.85,
  });
  const housingBlueMat = new THREE.MeshStandardMaterial({
    map: housingBlueTex,
    roughness: 0.85,
  });
  const brickWallMat = new THREE.MeshStandardMaterial({
    map: brickWallTex,
    roughness: 0.88,
  });
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.85,
  });
  const darkConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.88,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.45,
    metalness: 0.65,
  });
  const waterTankBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.45,
  });
  const dumpsterAmberMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.6,
    metalness: 0.35,
  });
  const vanWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.48,
    metalness: 0.2,
  });
  const carRedMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    roughness: 0.42,
    metalness: 0.35,
  });
  const carSilverMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.4,
    metalness: 0.45,
  });
  const glassDarkMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.25,
    metalness: 0.75,
  });
  const woodCrateMat = new THREE.MeshStandardMaterial({
    color: 0x92400e,
    roughness: 0.86,
  });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x18181b });

  disposableMaterials.push(
    signMercadoMat,
    signLanHouseMat,
    signGaragemMat,
    signBlocoAMat,
    signBlocoBMat,
    complexGroundMat,
    courtFloorMat,
    housingOchreMat,
    housingTerracottaMat,
    housingBlueMat,
    brickWallMat,
    concreteMat,
    darkConcreteMat,
    darkMetalMat,
    waterTankBlueMat,
    dumpsterAmberMat,
    vanWhiteMat,
    carRedMat,
    carSilverMat,
    glassDarkMat,
    woodCrateMat,
    wireMat
  );

  const addBlock = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material,
    collidable = true
  ) => {
    const geo = new THREE.BoxGeometry(w, h, d);
    disposableGeometries.push(geo);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + h / 2, z);
    mesh.castShadow = !isSoftwareGl;
    mesh.receiveShadow = !isSoftwareGl;
    mapGroup.add(mesh);
    shootableMeshes.push(mesh);

    if (collidable) {
      colliders.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minY: y,
        maxY: y + h,
        minZ: z - d / 2,
        maxZ: z + d / 2,
      });
    }
    return mesh;
  };

  // ============================================================================
  // 1. PISO DO COMPLEXO (76m × 76m) & QUADRA POLIESPORTIVA CENTRAL
  // ============================================================================
  const mainFloorGeo = new THREE.PlaneGeometry(76, 76);
  disposableGeometries.push(mainFloorGeo);
  const mainFloor = new THREE.Mesh(mainFloorGeo, complexGroundMat);
  mainFloor.rotation.x = -Math.PI / 2;
  mainFloor.receiveShadow = !isSoftwareGl;
  mapGroup.add(mainFloor);
  shootableMeshes.push(mainFloor);

  // Quadra Comunitária no Pátio Central (x = -7.5..7.5, z = -15..15)
  const courtGeo = new THREE.PlaneGeometry(15, 30);
  disposableGeometries.push(courtGeo);
  const courtMesh = new THREE.Mesh(courtGeo, courtFloorMat);
  courtMesh.rotation.x = -Math.PI / 2;
  courtMesh.position.set(0, 0.02, 0);
  courtMesh.receiveShadow = !isSoftwareGl;
  mapGroup.add(courtMesh);

  // ============================================================================
  // 2. MUROS PERIMETRAIS DO COMPLEXO (76m × 76m)
  // ============================================================================
  addBlock(76, 8.5, 1.5, 0, 0, -37.25, brickWallMat, true); // Norte
  addBlock(76, 8.5, 1.5, 0, 0, 37.25, brickWallMat, true);  // Sul
  addBlock(1.5, 8.5, 76, -37.25, 0, 0, brickWallMat, true); // Oeste
  addBlock(1.5, 8.5, 76, 37.25, 0, 0, brickWallMat, true);  // Leste

  // ============================================================================
  // 3. SETOR OESTE: BLOCOS HABITACIONAIS A-01 & C-03, BECO OESTE E COMÉRCIOS
  // ============================================================================
  // Bloco A-01 (Noroeste: x = -30.5..-20.5, z = -25..-6.5) — deixa um Beco Tático a Oeste (x = -36.5..-30.5)
  addBlock(10.0, 14.0, 18.5, -25.5, 0, -15.75, housingOchreMat, true);
  // Caixa d'água comunitária azul no topo do Bloco A-01
  addBlock(4.2, 3.2, 4.2, -25.5, 14.0, -15.75, waterTankBlueMat, false);
  // Placas do Bloco A-01 e do Mercadinho
  addBlock(0.2, 1.25, 6.2, -20.35, 3.6, -15.75, signMercadoMat, false);
  addBlock(6.2, 1.2, 0.2, -25.5, 10.5, -6.35, signBlocoAMat, false);
  // Marquise do Mercadinho
  addBlock(2.6, 0.35, 16.0, -19.2, 3.3, -15.75, darkConcreteMat, false);

  // Bloco C-03 (Sudoeste: x = -30.5..-20.5, z = 6.5..25)
  addBlock(10.0, 14.0, 18.5, -25.5, 0, 15.75, housingTerracottaMat, true);
  addBlock(4.2, 3.2, 4.2, -25.5, 14.0, 15.75, waterTankBlueMat, false);
  // Placa da Lan House & Bar do Pátio
  addBlock(0.2, 1.25, 6.2, -20.35, 3.6, 15.75, signLanHouseMat, false);
  addBlock(2.6, 0.35, 16.0, -19.2, 3.3, 15.75, darkConcreteMat, false);

  // Passagem Coberta Entre os Blocos A-01 e C-03 (Ponte de Ligação Superior em z = -6.5..6.5, y = 4.2..14.0)
  addBlock(9.2, 9.8, 13.0, -25.5, 4.2, 0, housingOchreMat, false);
  // Muretas e Caixas no Beco Oeste (x = -33.5) e na Passagem Oeste (z = 0)
  addBlock(1.8, 1.25, 2.6, -33.5, 0, -9.5, woodCrateMat, true);
  addBlock(1.8, 1.25, 2.6, -33.5, 0, 9.5, woodCrateMat, true);
  addBlock(2.2, 1.35, 2.2, -25.5, 0, 0, brickWallMat, true);

  // ============================================================================
  // 4. SETOR LESTE: BLOCOS EM PILOTIS COM GARAGENS COBERTAS ATRAVESSÁVEIS
  // ============================================================================
  // Os Blocos B-02 (Nordeste) e D-04 (Sudeste) possuem o térreo vazado em PILOTIS (y = 0..3.6m livre)
  // e os andares residenciais superiores suspensos (y = 3.6..14.5m), permitindo combate interno na garagem!
  // Corpo Superior Suspenso do Bloco B-02 (Nordeste: x = 20.5..31.5, z = -25..-6.5, y = 3.6..14.5)
  addBlock(11.0, 10.9, 18.5, 26.0, 3.6, -15.75, housingBlueMat, false);
  addBlock(4.4, 3.2, 4.4, 26.0, 14.5, -15.75, waterTankBlueMat, false);
  addBlock(0.2, 1.2, 6.2, 20.35, 4.2, -15.75, signGaragemMat, false);
  addBlock(6.2, 1.2, 0.2, 26.0, 10.5, -6.35, signBlocoBMat, false);

  // Corpo Superior Suspenso do Bloco D-04 (Sudeste: x = 20.5..31.5, z = 6.5..25, y = 3.6..14.5)
  addBlock(11.0, 10.9, 18.5, 26.0, 3.6, 15.75, housingOchreMat, false);
  addBlock(4.4, 3.2, 4.4, 26.0, 14.5, 15.75, waterTankBlueMat, false);
  addBlock(0.2, 1.2, 6.2, 20.35, 4.2, 15.75, signGaragemMat, false);

  // Pilares de Concreto e Muretas das Garagens Coletivas em Pilotis (x = 21.2 e x = 30.8)
  [-23.5, -15.75, -8.0, 8.0, 15.75, 23.5].forEach((pz) => {
    addBlock(1.1, 3.6, 1.1, 21.2, 0, pz, darkConcreteMat, true);
    addBlock(1.1, 3.6, 1.1, 30.8, 0, pz, darkConcreteMat, true);
  });
  // Paredes divisórias parciais dentro das garagens para cobertura tática interna
  addBlock(4.8, 2.2, 0.6, 26.0, 0, -19.5, brickWallMat, true);
  addBlock(4.8, 2.2, 0.6, 26.0, 0, 19.5, brickWallMat, true);

  // Veículos Estacionados nas Garagens Cobertas e nas Ruas Internas
  const buildParkedVehicle = (vx: number, vz: number, bodyMat: THREE.Material, isVan: boolean) => {
    if (isVan) {
      addBlock(2.2, 1.95, 4.8, vx, 0.25, vz, bodyMat, true);
      addBlock(2.24, 0.65, 1.6, vx, 1.35, vz + 1.4, glassDarkMat, false);
    } else {
      addBlock(2.0, 0.85, 4.2, vx, 0.22, vz, bodyMat, true);
      addBlock(1.8, 0.68, 2.2, vx, 1.05, vz, glassDarkMat, true);
    }
    addBlock(2.15, 0.5, 0.8, vx, 0, vz - 1.35, darkMetalMat, false);
    addBlock(2.15, 0.5, 0.8, vx, 0, vz + 1.35, darkMetalMat, false);
  };
  // Furgão branco no pátio da Oficina Leste e carros nas garagens
  buildParkedVehicle(26.0, -12.2, vanWhiteMat, true);
  buildParkedVehicle(26.0, 12.2, carSilverMat, false);
  buildParkedVehicle(-17.2, 0.0, carRedMat, false);

  // ============================================================================
  // 5. REDE DE VARANDAS ELEVADAS (+2.6m), 4 ESCADARIAS E PASSARELA CENTRAL
  // ============================================================================
  // A. Varanda Tática Oeste (x = -14.5..-9.5, z = -7.0..7.0, h = 2.6m)
  addBlock(5.0, 2.6, 14.0, -12.0, 0, 0, darkConcreteMat, true);
  addBlock(4.8, 0.08, 13.8, -12.0, 2.58, 0, concreteMat, false);
  elevationZones.push({
    minX: -14.5,
    maxX: -9.5,
    minZ: -7.0,
    maxZ: 7.0,
    minHeight: 2.6,
    maxHeight: 2.6,
    type: 'platform',
  });
  // Parapeito Oeste e abrigos na Varanda Oeste (+2.6m)
  addBlock(0.4, 1.05, 13.6, -14.3, 2.6, 0, brickWallMat, true);
  addBlock(0.4, 1.05, 4.2, -9.7, 2.6, -4.6, brickWallMat, true);
  addBlock(0.4, 1.05, 4.2, -9.7, 2.6, 4.6, brickWallMat, true);

  // Escadaria Noroeste (z = -12.0 no chão até z = -7.0 em y = 2.6m -> ramp_south)
  const stairSteps = 8;
  for (let i = 0; i < stairSteps; i++) {
    const sh = ((i + 1) / stairSteps) * 2.6;
    const sz = -12.0 + (i + 0.5) * (5.0 / stairSteps);
    addBlock(3.2, sh, 5.0 / stairSteps, -12.0, 0, sz, concreteMat, false);
  }
  elevationZones.push({
    minX: -13.6,
    maxX: -10.4,
    minZ: -12.1,
    maxZ: -6.9,
    minHeight: 0,
    maxHeight: 2.6,
    type: 'ramp_south',
  });

  // Escadaria Sudoeste (z = +12.0 no chão até z = +7.0 em y = 2.6m -> ramp_north)
  for (let i = 0; i < stairSteps; i++) {
    const sh = ((i + 1) / stairSteps) * 2.6;
    const sz = 12.0 - (i + 0.5) * (5.0 / stairSteps);
    addBlock(3.2, sh, 5.0 / stairSteps, -12.0, 0, sz, concreteMat, false);
  }
  elevationZones.push({
    minX: -13.6,
    maxX: -10.4,
    minZ: 6.9,
    maxZ: 12.1,
    minHeight: 0,
    maxHeight: 2.6,
    type: 'ramp_north',
  });

  // B. Varanda Tática Leste (x = 9.5..14.5, z = -7.0..7.0, h = 2.6m)
  addBlock(5.0, 2.6, 14.0, 12.0, 0, 0, darkConcreteMat, true);
  addBlock(4.8, 0.08, 13.8, 12.0, 2.58, 0, concreteMat, false);
  elevationZones.push({
    minX: 9.5,
    maxX: 14.5,
    minZ: -7.0,
    maxZ: 7.0,
    minHeight: 2.6,
    maxHeight: 2.6,
    type: 'platform',
  });
  // Parapeito Leste e abrigos na Varanda Leste (+2.6m)
  addBlock(0.4, 1.05, 13.6, 14.3, 2.6, 0, brickWallMat, true);
  addBlock(0.4, 1.05, 4.2, 9.7, 2.6, -4.6, brickWallMat, true);
  addBlock(0.4, 1.05, 4.2, 9.7, 2.6, 4.6, brickWallMat, true);

  // Escadaria Nordeste (z = -12.0 no chão até z = -7.0 em y = 2.6m -> ramp_south)
  for (let i = 0; i < stairSteps; i++) {
    const sh = ((i + 1) / stairSteps) * 2.6;
    const sz = -12.0 + (i + 0.5) * (5.0 / stairSteps);
    addBlock(3.2, sh, 5.0 / stairSteps, 12.0, 0, sz, concreteMat, false);
  }
  elevationZones.push({
    minX: 10.4,
    maxX: 13.6,
    minZ: -12.1,
    maxZ: -6.9,
    minHeight: 0,
    maxHeight: 2.6,
    type: 'ramp_south',
  });

  // Escadaria Sudeste (z = +12.0 no chão até z = +7.0 em y = 2.6m -> ramp_north)
  for (let i = 0; i < stairSteps; i++) {
    const sh = ((i + 1) / stairSteps) * 2.6;
    const sz = 12.0 - (i + 0.5) * (5.0 / stairSteps);
    addBlock(3.2, sh, 5.0 / stairSteps, 12.0, 0, sz, concreteMat, false);
  }
  elevationZones.push({
    minX: 10.4,
    maxX: 13.6,
    minZ: 6.9,
    maxZ: 12.1,
    minHeight: 0,
    maxHeight: 2.6,
    type: 'ramp_north',
  });

  // C. Longa Passarela Aérea Central do Complexo (x = -9.5..9.5, z = -2.1..2.1, y = 2.6m)
  // Passagem livre por baixo no Pátio da Quadra!
  addBlock(19.0, 0.32, 4.2, 0, 2.3, 0, concreteMat, false);
  // Guarda-corpos táticos da passarela aérea
  addBlock(7.5, 1.05, 0.3, -4.8, 2.6, -1.95, darkMetalMat, true);
  addBlock(7.5, 1.05, 0.3, 4.8, 2.6, 1.95, darkMetalMat, true);
  // Pilar central sob a passarela no meio da quadra
  addBlock(1.4, 2.3, 1.4, 0, 0, 0, darkConcreteMat, true);

  elevationZones.push({
    minX: -9.6,
    maxX: 9.6,
    minZ: -2.1,
    maxZ: 2.1,
    minHeight: 2.6,
    maxHeight: 2.6,
    type: 'platform',
  });

  // ============================================================================
  // 6. COBERTURAS DO PÁTIO CENTRAL, CAÇAMBAS E GUARITAS DE SPAWN
  // ============================================================================
  // Caçambas metálicas de entulho e muretas na Quadra/Pátio Central
  addBlock(2.8, 1.25, 1.8, -4.5, 0, -9.5, dumpsterAmberMat, true);
  addBlock(2.8, 1.25, 1.8, 4.5, 0, 9.5, dumpsterAmberMat, true);
  addBlock(2.2, 1.15, 2.2, 4.5, 0, -9.5, woodCrateMat, true);
  addBlock(2.2, 1.15, 2.2, -4.5, 0, 9.5, woodCrateMat, true);

  // Guarita & Terminal Comunitário Sul (protege o spawn da PM em z = 30.5)
  addBlock(10.5, 3.2, 2.8, 0, 0, 22.5, brickWallMat, true);
  addBlock(11.2, 0.35, 3.6, 0, 3.2, 22.5, darkConcreteMat, false);

  // Guarita & Terminal Comunitário Norte (protege o spawn dos Bandidos em z = -30.5)
  addBlock(10.5, 3.2, 2.8, 0, 0, -22.5, brickWallMat, true);
  addBlock(11.2, 0.35, 3.6, 0, 3.2, -22.5, darkConcreteMat, false);

  // Postes de concreto e fiação elétrica aérea cruzando o Complexo
  const addOverheadWire = (p1: [number, number, number], p2: [number, number, number]) => {
    const start = new THREE.Vector3(...p1);
    const end = new THREE.Vector3(...p2);
    const mid = start.clone().lerp(end, 0.5);
    mid.y -= 0.75;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(12);
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    disposableGeometries.push(geo);
    const line = new THREE.Line(geo, wireMat);
    mapGroup.add(line);
  };
  addOverheadWire([-20.5, 8.2, -16], [20.5, 8.2, -16]);
  addOverheadWire([-20.5, 8.2, 16], [20.5, 8.2, 16]);
  addOverheadWire([-20.5, 8.6, 0], [20.5, 8.6, 0]);

  return {
    id: 'complexo',
    mapGroup,
    shootableMeshes,
    colliders,
    elevationZones,
    ctSpawns: [
      [-12, 0, 30.5],
      [-5, 0, 30.5],
      [5, 0, 30.5],
      [12, 0, 30.5],
      [0, 0, 28.0],
    ],
    trSpawns: [
      [-12, 0, -30.5],
      [-5, 0, -30.5],
      [5, 0, -30.5],
      [12, 0, -30.5],
      [0, 0, -28.0],
    ],
    playerCtSpawn: { pos: [0, 1.72, 31.0], yaw: 0 },
    playerTrSpawn: { pos: [0, 1.72, -31.0], yaw: Math.PI },
    // 22 Waypoints 3D cobrindo as 5 rotas do Complexo (Beco Oeste, Rua do Mercadinho, Pátio da Quadra, Passarela +2.6m e Garagens em Pilotis a Leste)
    waypoints: [
      // Rota 1: Beco Tático Extremo Oeste
      [-33.5, 0, 19.0],
      [-33.5, 0, 0.0],
      [-33.5, 0, -19.0],
      // Rota 2: Rua do Mercadinho & Lan House (Oeste)
      [-17.2, 0, 19.5],
      [-17.2, 0, 9.0],
      [-17.2, 0, -9.0],
      [-17.2, 0, -19.5],
      // Rota 3: Pátio Comunitário Central & Quadra
      [0.0, 0, 16.5],
      [-4.5, 0, 4.5],
      [4.5, 0, -4.5],
      [0.0, 0, -16.5],
      // Rota 4: Rede de Escadarias, Varandas e Passarela Aérea Central (+2.6m)
      [-12.0, 1.3, 9.5],
      [-12.0, 2.6, 0.0],
      [-12.0, 1.3, -9.5],
      [0.0, 2.6, 0.0],
      [12.0, 1.3, 9.5],
      [12.0, 2.6, 0.0],
      [12.0, 1.3, -9.5],
      // Rota 5: Garagens Coletivas Cobertas em Pilotis & Oficina (Leste)
      [17.5, 0, 19.5],
      [25.5, 0, 5.5],
      [25.5, 0, -5.5],
      [17.5, 0, -19.5],
    ],
    skyColor: 0x60a5fa,
    fogColor: 0xdbeafe,
    fogDensity: 0.0085,
    hemiSkyColor: 0xf8fafc,
    hemiGroundColor: 0x94a3b8,
    hemiIntensity: 0.94,
    sunColor: 0xffedd5,
    sunIntensity: 1.55,
    sunPosition: [36, 54, -22],
    dispose: () => {
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
    },
  };
}

/**
 * Constrói o mapa 3D selecionado sob demanda
 */
export function buildArenaMapById(
  mapId: MapId,
  maxAniso: number,
  isSoftwareGl: boolean
): BuiltArenaMap {
  if (mapId === 'vielas') {
    return buildVielasArena(maxAniso, isSoftwareGl);
  }
  if (mapId === 'orla') {
    return buildOrlaArena(maxAniso, isSoftwareGl);
  }
  if (mapId === 'centro') {
    return buildCentroArena(maxAniso, isSoftwareGl);
  }
  if (mapId === 'complexo') {
    return buildComplexoArena(maxAniso, isSoftwareGl);
  }
  return buildDust2Arena(maxAniso, isSoftwareGl);
}
