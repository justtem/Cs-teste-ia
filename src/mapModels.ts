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
    subtitle: 'Comunidade Carioca 3D (110m × 110m) — Bombsites A & B',
    location: 'Morro Carioca, Rio de Janeiro — RJ',
    environment: 'Comunidade Urbana Expandida · Fim de Tarde Dourado',
    description:
      'Arena 3D low-poly estilizada expandida (110m × 110m) inspirada na volumetria de morro carioca: 3 rotas táticas (Beco Oeste, Largo Central e Viela Leste), 2 conectores transversais, lajes elevadas (+2.6m) com passarela e sinalização completa para futuros Bombsites A e B.',
    recommendedPlayers: '5v5 Competitivo (10 Jogadores)',
    tacticalFeatures: [
      '3 Rotas Principais (Beco do Bar, Meio e Oficina)',
      'Bombsites A e B com Marcação Tática Completa',
      'Lajes Elevadas (+2.6m), Passarela & 4 Escadarias',
    ],
    accentColor: '#38bdf8',
  },
  orla: {
    id: 'orla',
    name: 'Orla',
    subtitle: 'Praia, Calçadão & Avenida 3D (110m × 110m) — Bombsites A & B',
    location: 'Zona Sul, Rio de Janeiro — RJ',
    environment: 'Dia Litorâneo Expandido · Céu Azul & Brisa Marítima',
    description:
      'Arena litorânea 3D low-poly expandida (110m × 110m) na Orla do Rio: 3 rotas estratégicas (Avenida Atlântica com galerias e edifícios de varandas 3D, Calçadão de Pedra Portuguesa com Praça dos Quiosques no Bombsite A, e Faixa de Areia com o Posto 4 de Salva-Vidas subível +2.4m no Bombsite B).',
    recommendedPlayers: '5v5 Competitivo (10 Jogadores)',
    tacticalFeatures: [
      'Bombsite A na Praça dos Quiosques do Calçadão',
      'Bombsite B no Posto 4 Salva-Vidas Elevado (+2.4m)',
      'Avenida Litorânea, Ciclovia & Galerias de Edifícios',
    ],
    accentColor: '#06b6d4',
  },
  centro: {
    id: 'centro',
    name: 'Centro',
    subtitle: 'Largo da Carioca, VLT & Galeria Saara 3D (110m × 110m) — Bombsites A & B',
    location: 'Centro Histórico, Rio de Janeiro — RJ',
    environment: 'Urbano Comercial Expandido · Sobrados Históricos & Torres Corporativas',
    description:
      'Arena urbana 3D low-poly expandida (110m × 110m) no Centro do Rio: 3 rotas táticas (Galeria Saara & Sobrados Históricos com Pátio Comercial no Bombsite B, Largo da Carioca com Terminal de VLT e Plataforma Comercial Elevada +2.5m no Bombsite A, e Avenida Rio Branco com Ônibus BRS, Táxis Cariocas e Torres Corporativas).',
    recommendedPlayers: '5v5 Competitivo (10 Jogadores)',
    tacticalFeatures: [
      'Bombsite A no Largo Central: Terminal VLT & Plataforma (+2.5m)',
      'Bombsite B no Pátio da Galeria Saara & Padaria Carioca',
      'Av. Rio Branco com Ônibus BRS, Táxis & Torres Corporativas',
    ],
    accentColor: '#eab308',
  },
  complexo: {
    id: 'complexo',
    name: 'Complexo',
    subtitle: 'Conjunto Habitacional & Passarelas — Rio de Janeiro',
    location: 'Zona Norte, Rio de Janeiro — RJ',
    environment: 'Grande Conjunto Urbano · 5 Rotas & 2 Bombsites (110m × 110m)',
    description:
      'Conjunto habitacional 3D low-poly expandido (110m × 110m) na Zona Norte do Rio: blocos residenciais com sacadas 3D e castelos d’água, Quadra Poliesportiva Central no Bombsite A sob a Passarela Aérea (+2.6m) com Mirante Coberto, Rua do Mercadinho a oeste e Garagens Coletivas em Pilotis & Oficina no Bombsite B a leste.',
    recommendedPlayers: '5v5 Competitivo (10 Jogadores)',
    tacticalFeatures: [
      'Bombsite A na Quadra Central & Passarela com Mirante (+2.6m)',
      'Bombsite B nas Garagens Coletivas em Pilotis & Oficina',
      'Blocos com Sacadas 3D, Rua do Mercadinho & 5 Rotas de Flanco',
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

  // 1. Texturas Procedurais Brasileiras de Alta Definição (110m x 110m)
  const cobblestoneTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#67635c';
      ctx.fillRect(0, 0, 256, 256);
      const rows = 8;
      const cols = 8;
      const cw = 256 / cols;
      const ch = 256 / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const ox = (r % 2) * (cw * 0.5);
          const x = (c * cw + ox) % 256;
          const y = r * ch;
          const shade = 88 + Math.floor(Math.random() * 42);
          ctx.fillStyle = `rgb(${shade},${shade - 3},${shade - 8})`;
          ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);
          ctx.strokeStyle = 'rgba(25,23,20,0.55)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 2, y + 2, cw - 4, ch - 4);
        }
      }
    },
    maxAniso,
    256,
    256,
    34,
    34
  );

  const asphaltTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#2d2f33';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 1800; i++) {
        const v = 38 + ((i * 31) % 32);
        ctx.fillStyle = `rgb(${v},${v},${v + 2})`;
        ctx.fillRect((i * 47) % 256, (i * 73) % 256, 2, 2);
      }
      ctx.fillStyle = '#eab308';
      for (let y = 16; y < 256; y += 64) {
        ctx.fillRect(124, y, 8, 36);
      }
    },
    maxAniso,
    256,
    256,
    2,
    14
  );

  const tijoloBaianoTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#ba542b';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#6e2a10';
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
          ctx.strokeStyle = 'rgba(50, 18, 8, 0.45)';
          ctx.beginPath();
          ctx.moveTo(x + 6, y + 10);
          ctx.lineTo(x + 58, y + 10);
          ctx.moveTo(x + 6, y + 22);
          ctx.lineTo(x + 58, y + 22);
          ctx.stroke();
          ctx.strokeStyle = '#6e2a10';
        }
      }
    },
    maxAniso,
    256,
    256,
    4,
    3
  );

  const createPlasterWallTex = (baseHex: string, stainHex: string, rx = 4, ry = 3) => {
    const tex = createMapCanvasTexture(
      (ctx) => {
        ctx.fillStyle = baseHex;
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 1100; i++) {
          ctx.fillStyle = stainHex;
          ctx.globalAlpha = Math.random() * 0.18;
          ctx.fillRect(Math.random() * 256, Math.random() * 256, 6, 5);
        }
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = '#27272a';
        ctx.fillRect(0, 218, 256, 38);
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
      ctx.fillStyle = '#8f9298';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 1200; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#727479' : '#a8abb0';
        ctx.globalAlpha = Math.random() * 0.24;
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 4, 4);
      }
    },
    maxAniso,
    256,
    256,
    6,
    6
  );

  const woodBeamTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#633d1f';
      ctx.fillRect(0, 0, 256, 256);
      ctx.strokeStyle = '#432612';
      ctx.lineWidth = 2;
      for (let y = 0; y < 256; y += 12) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(256, y);
        ctx.stroke();
      }
    },
    maxAniso,
    256,
    256,
    1,
    4
  );

  const createStripedAwningTex = (color1: string, color2: string) => {
    const tex = createMapCanvasTexture(
      (ctx) => {
        const stripeW = 32;
        for (let x = 0; x < 256; x += stripeW) {
          ctx.fillStyle = (x / stripeW) % 2 === 0 ? color1 : color2;
          ctx.fillRect(x, 0, stripeW, 256);
        }
      },
      maxAniso,
      256,
      256,
      2,
      1
    );
    disposableTextures.push(tex);
    return tex;
  };

  const createBombsiteZoneTex = (letter: 'A' | 'B', mainColor: string, accentColor: string) => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#3a3d42';
    ctx.fillRect(0, 0, 512, 512);

    ctx.lineWidth = 26;
    ctx.strokeStyle = '#eab308';
    ctx.strokeRect(13, 13, 486, 486);
    for (let i = 0; i < 512; i += 32) {
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 16, 0);
      ctx.lineTo(i - 8, 26);
      ctx.lineTo(i - 24, 26);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(i, 486);
      ctx.lineTo(i + 16, 486);
      ctx.lineTo(i - 8, 512);
      ctx.lineTo(i - 24, 512);
      ctx.fill();
    }

    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.arc(256, 256, 172, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 220px Impact, Arial Black, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 256, 254);

    ctx.font = 'bold 36px Impact, Arial Black, sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText(`BOMBSITE [${letter}]`, 256, 452);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAniso;
    disposableTextures.push(tex);
    return tex;
  };

  const bombsiteATex = createBombsiteZoneTex('A', '#dc2626', '#fef08a');
  const bombsiteBTex = createBombsiteZoneTex('B', '#2563eb', '#93c5fd');

  const muralGraffitiTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#d6c7b2';
      ctx.fillRect(0, 0, 256, 256);
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
    asphaltTex,
    tijoloBaianoTex,
    concreteTex,
    woodBeamTex,
    muralGraffitiTex,
    signBarZeTex,
    signOficinaTex,
    signBecoPazTex
  );

  // 2. Materiais PBR
  const floorCobbleMat = new THREE.MeshStandardMaterial({ map: cobblestoneTex, roughness: 0.9 });
  const floorAsphaltMat = new THREE.MeshStandardMaterial({ map: asphaltTex, roughness: 0.88 });
  const tijoloMat = new THREE.MeshStandardMaterial({ map: tijoloBaianoTex, roughness: 0.85 });
  const plasterOchreMat = new THREE.MeshStandardMaterial({ map: createPlasterWallTex('#d99b4e', '#a16623'), roughness: 0.84 });
  const plasterTerracottaMat = new THREE.MeshStandardMaterial({ map: createPlasterWallTex('#c7634c', '#8f3c29'), roughness: 0.85 });
  const plasterGreenMat = new THREE.MeshStandardMaterial({ map: createPlasterWallTex('#5fa883', '#3b7357'), roughness: 0.84 });
  const plasterBlueMat = new THREE.MeshStandardMaterial({ map: createPlasterWallTex('#5288b5', '#325a7d'), roughness: 0.84 });
  const plasterWhiteMat = new THREE.MeshStandardMaterial({ map: createPlasterWallTex('#dfd9ce', '#a8a196'), roughness: 0.86 });
  const concreteMat = new THREE.MeshStandardMaterial({ map: concreteTex, roughness: 0.82 });
  const woodBeamMat = new THREE.MeshStandardMaterial({ map: woodBeamTex, roughness: 0.78 });
  const muralMat = new THREE.MeshStandardMaterial({ map: muralGraffitiTex, roughness: 0.8 });
  const waterTankBlueMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.42, metalness: 0.1 });
  const zincRoofMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.52, metalness: 0.55 });
  const darkIronMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.45, metalness: 0.72 });
  const awningRedWhiteMat = new THREE.MeshStandardMaterial({ map: createStripedAwningTex('#dc2626', '#f8fafc'), roughness: 0.65 });
  const awningBlueWhiteMat = new THREE.MeshStandardMaterial({ map: createStripedAwningTex('#2563eb', '#f8fafc'), roughness: 0.65 });
  const bombsiteAMat = new THREE.MeshStandardMaterial({ map: bombsiteATex, roughness: 0.85 });
  const bombsiteBMat = new THREE.MeshStandardMaterial({ map: bombsiteBTex, roughness: 0.85 });
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x2e6f40, roughness: 0.75 });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x18181b });
  const woodPoleMat = woodBeamMat;

  disposableMaterials.push(
    floorCobbleMat,
    floorAsphaltMat,
    tijoloMat,
    plasterOchreMat,
    plasterTerracottaMat,
    plasterGreenMat,
    plasterBlueMat,
    plasterWhiteMat,
    concreteMat,
    woodBeamMat,
    muralMat,
    waterTankBlueMat,
    zincRoofMat,
    darkIronMat,
    awningRedWhiteMat,
    awningBlueWhiteMat,
    bombsiteAMat,
    bombsiteBMat,
    foliageMat,
    wireMat
  );

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

  // ============================================================================
  // 1. PISO EXPANDIDO 110x110m (Superfície 118x118m) E VIAS DE ACESSO
  // ============================================================================
  const mainFloor = new THREE.Mesh(new THREE.PlaneGeometry(118, 118), floorCobbleMat);
  mainFloor.rotation.x = -Math.PI / 2;
  registerMesh(mainFloor, true);
  mapGroup.add(mainFloor);

  // Faixa de asfalto na entrada Sul (Base PM / CT)
  const southAsphalt = new THREE.Mesh(new THREE.PlaneGeometry(86, 16), floorAsphaltMat);
  southAsphalt.rotation.x = -Math.PI / 2;
  southAsphalt.position.set(0, 0.015, 45);
  registerMesh(southAsphalt, true);
  mapGroup.add(southAsphalt);

  // Faixa de asfalto/concreto na entrada Norte (Base TR)
  const northAsphalt = new THREE.Mesh(new THREE.PlaneGeometry(86, 16), floorAsphaltMat);
  northAsphalt.rotation.x = -Math.PI / 2;
  northAsphalt.position.set(0, 0.015, -45);
  registerMesh(northAsphalt, true);
  mapGroup.add(northAsphalt);

  // ============================================================================
  // 2. MUROS DE PERÍMETRO DO MORRO (110m x 110m, H=9.5m com parapeitos escalonados)
  // ============================================================================
  addBlock(0, 4.75, -54, 112, 9.5, 2.4, tijoloMat);
  addBlock(0, 4.75, 54, 112, 9.5, 2.4, plasterOchreMat);
  addBlock(-54, 4.75, 0, 2.4, 9.5, 112, plasterTerracottaMat);
  addBlock(54, 4.75, 0, 2.4, 9.5, 112, plasterGreenMat);

  // ============================================================================
  // 3. AUXILIAR DE ARQUITETURA LOW-POLY ESTILIZADA 2.0 (Inspirada na Imagem 1)
  // Casas volumétricas com recuos, portas 3D, janelas c/ peitoril e toldos,
  // sacadas em balanço, vigas de madeira projetadas, tábuas de laje e caixas d'água
  // ============================================================================
  interface StylizedHouseOpts {
    floors?: 1 | 2 | 3;
    roofStyle?: 'laje' | 'zinc' | 'terracotta';
    hasWaterTank?: boolean;
    hasAwning?: 'red' | 'blue' | 'none';
    hasBalcony?: boolean;
    hasShopGate?: boolean;
    frontDir?: 'north' | 'south' | 'east' | 'west';
    addCollider?: boolean;
  }

  const addStylizedHouse = (
    x: number,
    z: number,
    w: number,
    totalH: number,
    d: number,
    wallMat: THREE.Material,
    opts: StylizedHouseOpts = {}
  ) => {
    const floors = opts.floors || (totalH > 6.5 ? 2 : 1);
    const roofStyle = opts.roofStyle || 'laje';
    const hasWaterTank = opts.hasWaterTank ?? true;
    const hasAwning = opts.hasAwning ?? 'none';
    const hasBalcony = opts.hasBalcony ?? (floors >= 2);
    const shouldCollide = opts.addCollider ?? true;

    // Volume do Térreo + Rodapé de concreto (plinth)
    const baseH = floors === 1 ? totalH : totalH * 0.52;
    addBlock(x, baseH / 2, z, w, baseH, d, wallMat, shouldCollide);

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.14, 0.32, d + 0.14), concreteMat);
    plinth.position.set(x, 0.16, z);
    registerMesh(plinth, false);
    mapGroup.add(plinth);

    // Porta 3D com batente e soleira na fachada frontal (+Z ou -Z)
    const faceZSign = z > 0 ? -1 : 1;
    const doorZ = z + faceZSign * (d / 2 + 0.04);
    if (!opts.hasShopGate) {
      const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.18, 2.15, 0.14), darkIronMat);
      doorFrame.position.set(x - w * 0.18, 1.08, doorZ);
      const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(0.96, 2.0, 0.18), woodBeamMat);
      doorLeaf.position.set(x - w * 0.18, 1.02, doorZ);
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 0.24), concreteMat);
      lintel.position.set(x - w * 0.18, 2.22, doorZ);
      registerMesh(doorFrame, false);
      registerMesh(doorLeaf, false);
      registerMesh(lintel, false);
      mapGroup.add(doorFrame, doorLeaf, lintel);
    } else {
      // Portão de aço comercial de enrolar com moldura
      const gateW = Math.min(w * 0.58, 3.4);
      const gateFrame = new THREE.Mesh(new THREE.BoxGeometry(gateW + 0.24, 2.35, 0.14), concreteMat);
      gateFrame.position.set(x, 1.18, doorZ);
      const gate = new THREE.Mesh(new THREE.BoxGeometry(gateW, 2.2, 0.18), darkIronMat);
      gate.position.set(x, 1.1, doorZ);
      registerMesh(gateFrame, false);
      registerMesh(gate, false);
      mapGroup.add(gateFrame, gate);
    }

    // Janelas 3D no térreo com moldura e peitoril de concreto
    const baseWin = new THREE.Mesh(new THREE.BoxGeometry(w + 0.18, 0.92, 1.15), darkIronMat);
    baseWin.position.set(x, Math.min(baseH - 0.85, 1.75), z + w * 0.12 * (z > 0 ? -1 : 1));
    const baseSill = new THREE.Mesh(new THREE.BoxGeometry(w + 0.28, 0.12, 1.3), concreteMat);
    baseSill.position.set(x, Math.min(baseH - 1.32, 1.28), z + w * 0.12 * (z > 0 ? -1 : 1));
    registerMesh(baseWin, false);
    registerMesh(baseSill, false);
    mapGroup.add(baseWin, baseSill);

    // Viga/lintel de concreto entre pavimentos e 2º/3º andar
    if (floors >= 2) {
      const belt = new THREE.Mesh(new THREE.BoxGeometry(w + 0.28, 0.34, d + 0.28), concreteMat);
      belt.position.set(x, baseH, z);
      registerMesh(belt, false);
      mapGroup.add(belt);

      const upperH = totalH - baseH;
      const upperW = w - 0.45;
      const upperD = d - 0.45;
      addBlock(x, baseH + upperH / 2, z, upperW, upperH, upperD, wallMat, shouldCollide);

      // Par de Janelas 3D no pavimento superior com peitoris e mini-toldos (Estilo Imagem 1)
      const upWinY = baseH + upperH * 0.52;
      const winOffsets = [-upperD * 0.24, upperD * 0.24];
      winOffsets.forEach((wzOff, idx) => {
        const upWin = new THREE.Mesh(new THREE.BoxGeometry(upperW + 0.18, 0.95, 1.05), darkIronMat);
        upWin.position.set(x, upWinY, z + wzOff);
        const upSill = new THREE.Mesh(new THREE.BoxGeometry(upperW + 0.3, 0.12, 1.2), concreteMat);
        upSill.position.set(x, upWinY - 0.5, z + wzOff);
        registerMesh(upWin, false);
        registerMesh(upSill, false);
        mapGroup.add(upWin, upSill);

        // Mini-toldo listrado sobre janela superior (Ref. Imagem 1)
        const miniAwnMat = idx % 2 === 0 ? awningRedWhiteMat : awningBlueWhiteMat;
        const miniAwn = new THREE.Mesh(new THREE.BoxGeometry(upperW + 0.65, 0.12, 1.15), miniAwnMat);
        miniAwn.position.set(x, upWinY + 0.52, z + wzOff);
        registerMesh(miniAwn, false);
        mapGroup.add(miniAwn);
      });

      // Sacada em balanço no 2º pavimento com guarda-corpo
      if (hasBalcony) {
        const balcZ = z + faceZSign * (upperD / 2 + 0.48);
        const balcSlab = new THREE.Mesh(new THREE.BoxGeometry(upperW * 0.68, 0.2, 0.96), concreteMat);
        balcSlab.position.set(x, baseH + 0.08, balcZ);
        const balcRail = new THREE.Mesh(new THREE.BoxGeometry(upperW * 0.68, 0.82, 0.14), tijoloMat);
        balcRail.position.set(x, baseH + 0.55, balcZ + faceZSign * 0.41);
        registerMesh(balcSlab, false);
        registerMesh(balcRail, false);
        mapGroup.add(balcSlab, balcRail);
      }
    }

    // Toldo grande de comércio no térreo
    if (hasAwning !== 'none') {
      const awnMat = hasAwning === 'red' ? awningRedWhiteMat : awningBlueWhiteMat;
      const awn = new THREE.Mesh(new THREE.BoxGeometry(Math.min(w * 0.82, 4.0), 0.18, 1.45), awnMat);
      awn.position.set(x, 2.45, z + faceZSign * (d / 2 + 0.72));
      awn.rotation.x = faceZSign * 0.18;
      registerMesh(awn, false);
      mapGroup.add(awn);
    }

    // Detalhe de Vigas de Madeira Projetadas (Rafters estilizados sob beiral, Imagem 1)
    const beamCount = Math.max(3, Math.floor(w / 1.4));
    const stepX = (w - 0.5) / (beamCount - 1);
    for (let bi = 0; bi < beamCount; bi++) {
      const bx = x - w / 2 + 0.25 + bi * stepX;
      const beam = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, d + 0.95), woodBeamMat);
      beam.position.set(bx, totalH - 0.12, z);
      registerMesh(beam, false);
      mapGroup.add(beam);
    }

    // Acabamento de Cobertura (Telhado de Zinco ou Laje com Parapeito + Tábuas de Madeira tipo Imagem 1)
    if (roofStyle === 'zinc') {
      const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.65, 0.16, d + 0.65), zincRoofMat);
      roof.position.set(x, totalH + 0.1, z);
      roof.rotation.z = 0.035;
      registerMesh(roof, false);
      mapGroup.add(roof);
    } else {
      // Parapeito perimetral de alvenaria + capim de concreto criando a laje carioca
      const parapetH = 0.78;
      const pThick = 0.24;
      addBlock(x, totalH + parapetH / 2, z + d / 2 - pThick / 2, w, parapetH, pThick, tijoloMat, false);
      addBlock(x, totalH + parapetH / 2, z - d / 2 + pThick / 2, w, parapetH, pThick, tijoloMat, false);
      addBlock(x + w / 2 - pThick / 2, totalH + parapetH / 2, z, pThick, parapetH, d - pThick * 2, tijoloMat, false);
      addBlock(x - w / 2 + pThick / 2, totalH + parapetH / 2, z, pThick, parapetH, d - pThick * 2, tijoloMat, false);

      // Tábuas de madeira estruturais cruzadas no piso da laje (Ref. vista aérea da Imagem 1)
      for (let pi = -1; pi <= 1; pi++) {
        const plank = new THREE.Mesh(
          new THREE.BoxGeometry(w * 0.72, 0.06, 0.34),
          woodBeamMat
        );
        plank.position.set(x, totalH + 0.04, z + pi * (d * 0.24));
        plank.rotation.y = pi * 0.08;
        registerMesh(plank, false);
        mapGroup.add(plank);
      }
    }

    // Caixa d'Água Azul Cilíndrica + Antena de TV metálica no topo
    if (hasWaterTank) {
      const tankGroup = new THREE.Group();
      tankGroup.position.set(x + w * 0.22, totalH, z - d * 0.2);
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.45, 1.45), concreteMat);
      base.position.y = 0.22;
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.72, 1.08, 12), waterTankBlueMat);
      body.position.y = 0.98;
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.84, 0.16, 12), waterTankBlueMat);
      lid.position.y = 1.56;
      // Antena de TV no telhado
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.1, 6), darkIronMat);
      mast.position.set(-w * 0.42, 1.05, d * 0.35);
      const crossDipole = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.04, 0.04), darkIronMat);
      crossDipole.position.set(-w * 0.42, 1.9, d * 0.35);
      registerMesh(base, false);
      registerMesh(body, true);
      registerMesh(lid, false);
      registerMesh(mast, false);
      registerMesh(crossDipole, false);
      tankGroup.add(base, body, lid, mast, crossDipole);
      mapGroup.add(tankGroup);
    }
  };

  // ============================================================================
  // 3B. ANEL PERIMETRAL DE SOBRADOS DO MORRO (20 Edificações Escalonadas)
  // Substitui a aparência de muro simples por uma silhueta de favela 3D completa
  // ============================================================================
  // Borda Norte (atrás da Base TR, z = -51.5)
  addStylizedHouse(-40, -51.2, 14, 9.2, 4.2, plasterOchreMat, { floors: 3, roofStyle: 'laje', addCollider: false });
  addStylizedHouse(-24, -51.2, 13, 8.0, 4.0, tijoloMat, { floors: 2, roofStyle: 'zinc', addCollider: false });
  addStylizedHouse(-8, -51.2, 12, 10.2, 4.2, plasterBlueMat, { floors: 3, roofStyle: 'laje', addCollider: false });
  addStylizedHouse(8, -51.2, 12, 8.6, 4.0, plasterTerracottaMat, { floors: 2, roofStyle: 'laje', addCollider: false });
  addStylizedHouse(24, -51.2, 13, 9.8, 4.2, plasterGreenMat, { floors: 3, roofStyle: 'zinc', addCollider: false });
  addStylizedHouse(40, -51.2, 14, 8.4, 4.0, plasterWhiteMat, { floors: 2, roofStyle: 'laje', addCollider: false });

  // Borda Sul (atrás da Base CT / PM, z = +51.2)
  addStylizedHouse(-40, 51.2, 14, 8.5, 4.2, tijoloMat, { floors: 2, roofStyle: 'laje', addCollider: false });
  addStylizedHouse(-24, 51.2, 13, 9.6, 4.2, plasterBlueMat, { floors: 3, roofStyle: 'zinc', addCollider: false });
  addStylizedHouse(-8, 51.2, 12, 7.8, 4.0, plasterOchreMat, { floors: 2, roofStyle: 'laje', addCollider: false });
  addStylizedHouse(8, 51.2, 12, 9.4, 4.2, plasterWhiteMat, { floors: 3, roofStyle: 'laje', addCollider: false });
  addStylizedHouse(24, 51.2, 13, 8.2, 4.0, plasterTerracottaMat, { floors: 2, roofStyle: 'zinc', addCollider: false });
  addStylizedHouse(40, 51.2, 14, 9.0, 4.2, plasterGreenMat, { floors: 3, roofStyle: 'laje', addCollider: false });

  // Borda Oeste (x = -51.2)
  addStylizedHouse(-51.2, -32, 4.2, 9.2, 14, plasterTerracottaMat, { floors: 3, roofStyle: 'laje', addCollider: false });
  addStylizedHouse(-51.2, -10, 4.2, 8.0, 14, tijoloMat, { floors: 2, roofStyle: 'zinc', addCollider: false });
  addStylizedHouse(-51.2, 12, 4.2, 9.6, 14, plasterOchreMat, { floors: 3, roofStyle: 'laje', addCollider: false });
  addStylizedHouse(-51.2, 34, 4.2, 8.4, 14, plasterBlueMat, { floors: 2, roofStyle: 'laje', addCollider: false });

  // Borda Leste (x = +51.2)
  addStylizedHouse(51.2, -32, 4.2, 8.8, 14, plasterGreenMat, { floors: 2, roofStyle: 'laje', addCollider: false });
  addStylizedHouse(51.2, -10, 4.2, 10.0, 14, plasterOchreMat, { floors: 3, roofStyle: 'laje', addCollider: false });
  addStylizedHouse(51.2, 12, 4.2, 8.2, 14, tijoloMat, { floors: 2, roofStyle: 'zinc', addCollider: false });
  addStylizedHouse(51.2, 34, 4.2, 9.4, 14, plasterWhiteMat, { floors: 3, roofStyle: 'laje', addCollider: false });

  // ============================================================================
  // 4. AUXILIAR DE ESCADARIA SUBÍVEL COM GUARDA-CORPO ESCALONADO (Ref. Imagem 1)
  // ============================================================================
  const addWalkableStaircase = (
    x: number,
    minZ: number,
    maxZ: number,
    width: number,
    topHeight: number,
    direction: 'ramp_north' | 'ramp_south'
  ) => {
    const length = maxZ - minZ;
    const steps = 12;
    const stepD = length / steps;
    const stepH = topHeight / steps;
    const railX = x < 0 ? x - width / 2 - 0.14 : x + width / 2 + 0.14;

    for (let s = 0; s < steps; s++) {
      const h = (s + 1) * stepH;
      const sz = direction === 'ramp_north' ? maxZ - (s + 0.5) * stepD : minZ + (s + 0.5) * stepD;
      const stepMesh = new THREE.Mesh(new THREE.BoxGeometry(width, h, stepD + 0.04), concreteMat);
      stepMesh.position.set(x, h / 2, sz);
      registerMesh(stepMesh, true);
      mapGroup.add(stepMesh);

      // Mureta lateral escalonada acompanhando cada degrau (Stepped Parapet — Imagem 1)
      const parapetH = h + 0.68;
      const railStep = new THREE.Mesh(new THREE.BoxGeometry(0.24, parapetH, stepD + 0.02), tijoloMat);
      railStep.position.set(railX, parapetH / 2, sz);
      const railCap = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, stepD + 0.06), concreteMat);
      railCap.position.set(railX, parapetH + 0.04, sz);
      registerMesh(railStep, true);
      registerMesh(railCap, false);
      mapGroup.add(railStep, railCap);
    }

    colliders.push({
      minX: railX - 0.14,
      maxX: railX + 0.14,
      minY: 0,
      maxY: topHeight + 0.8,
      minZ,
      maxZ,
    });

    // Zona de elevação para subida fluida de jogador e bots
    elevationZones.push({
      minX: x - width / 2 - 0.2,
      maxX: x + width / 2 + 0.2,
      minZ: minZ - 0.25,
      maxZ: maxZ + 0.25,
      minHeight: 0,
      maxHeight: topHeight,
      type: direction,
    });
  };

  // Auxiliar para Caixas Táticas de Madeira com Molduras 3D (Empilháveis sobre lajes e pátios)
  const addTacticalCrate = (cx: number, cy: number, cz: number, size = 1.35) => {
    const crate = addBlock(cx, cy + size / 2, cz, size, size, size, woodBeamMat, true);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(size + 0.06, 0.14, size + 0.06), darkIronMat);
    frame.position.set(cx, cy + size - 0.12, cz);
    registerMesh(frame, false);
    mapGroup.add(frame);
    return crate;
  };

  // ============================================================================
  // 5. ROTA 2 (CENTRAL): LARGO DAS LAJES ELEVADAS (+2.6m) E PASSARELA AÉREA
  // ============================================================================
  const LAJE_HEIGHT = 2.6;

  // Laje Oeste Central (x = -13m, z = -2m, w = 8m, d = 11m)
  addBlock(-13.0, LAJE_HEIGHT / 2, -2.0, 8.0, LAJE_HEIGHT, 11.0, plasterOchreMat, true);
  elevationZones.push({
    minX: -17.2,
    maxX: -8.8,
    minZ: -7.7,
    maxZ: 3.7,
    minHeight: LAJE_HEIGHT,
    maxHeight: LAJE_HEIGHT,
    type: 'platform',
  });

  // Parapeitos, churrasqueira de tijolo e caixas táticas na Laje Oeste Central
  addBlock(-13.0, LAJE_HEIGHT + 0.55, 3.4, 4.8, 1.1, 0.35, tijoloMat, true);
  addBlock(-13.0, LAJE_HEIGHT + 0.55, -7.4, 4.8, 1.1, 0.35, tijoloMat, true);
  addBlock(-16.85, LAJE_HEIGHT + 0.55, -2.0, 0.35, 1.1, 6.2, tijoloMat, true);
  addTacticalCrate(-11.2, LAJE_HEIGHT, 0.8, 1.25);
  // Torre de Caixa d'Água sobre a Laje Oeste servindo de cover vertical
  addBlock(-10.8, LAJE_HEIGHT + 0.95, -5.2, 1.6, 1.9, 1.6, tijoloMat, true);
  const westLajeTank = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.72, 1.05, 12), waterTankBlueMat);
  westLajeTank.position.set(-10.8, LAJE_HEIGHT + 2.4, -5.2);
  registerMesh(westLajeTank, true);
  mapGroup.add(westLajeTank);

  // Escadaria Sul subindo para Laje Oeste
  addWalkableStaircase(-15.0, 3.5, 12.5, 2.6, LAJE_HEIGHT, 'ramp_north');
  // Escadaria Norte subindo para Laje Oeste
  addWalkableStaircase(-15.0, -16.5, -7.5, 2.6, LAJE_HEIGHT, 'ramp_south');

  // Laje Leste Central (x = +13m, z = -2m, w = 8m, d = 11m)
  addBlock(13.0, LAJE_HEIGHT / 2, -2.0, 8.0, LAJE_HEIGHT, 11.0, plasterBlueMat, true);
  elevationZones.push({
    minX: 8.8,
    maxX: 17.2,
    minZ: -7.7,
    maxZ: 3.7,
    minHeight: LAJE_HEIGHT,
    maxHeight: LAJE_HEIGHT,
    type: 'platform',
  });

  // Parapeitos e coberturas na Laje Leste Central
  addBlock(13.0, LAJE_HEIGHT + 0.55, 3.4, 4.8, 1.1, 0.35, tijoloMat, true);
  addBlock(13.0, LAJE_HEIGHT + 0.55, -7.4, 4.8, 1.1, 0.35, tijoloMat, true);
  addBlock(16.85, LAJE_HEIGHT + 0.55, -2.0, 0.35, 1.1, 6.2, tijoloMat, true);
  addTacticalCrate(11.2, LAJE_HEIGHT, -4.8, 1.25);
  // Torre de Caixa d'Água sobre a Laje Leste
  addBlock(10.8, LAJE_HEIGHT + 0.95, 1.2, 1.6, 1.9, 1.6, tijoloMat, true);
  const eastLajeTank = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.72, 1.05, 12), waterTankBlueMat);
  eastLajeTank.position.set(10.8, LAJE_HEIGHT + 2.4, 1.2);
  registerMesh(eastLajeTank, true);
  mapGroup.add(eastLajeTank);

  // Escadaria Sul subindo para Laje Leste
  addWalkableStaircase(15.0, 3.5, 12.5, 2.6, LAJE_HEIGHT, 'ramp_north');
  // Escadaria Norte subindo para Laje Leste
  addWalkableStaircase(15.0, -16.5, -7.5, 2.6, LAJE_HEIGHT, 'ramp_south');

  // PASSARELA CENTRAL AÉREA conectando as duas lajes + Pilares de Sustentação
  const bridgeSlab = new THREE.Mesh(new THREE.BoxGeometry(18.0, 0.28, 3.4), concreteMat);
  bridgeSlab.position.set(0, LAJE_HEIGHT - 0.14, -2.0);
  registerMesh(bridgeSlab, true);
  mapGroup.add(bridgeSlab);

  // Pilares de concreto nas extremidades da passarela (sem bloquear o vão central)
  addBlock(-8.2, (LAJE_HEIGHT - 0.2) / 2, -0.55, 0.45, LAJE_HEIGHT - 0.2, 0.45, concreteMat, true);
  addBlock(-8.2, (LAJE_HEIGHT - 0.2) / 2, -3.45, 0.45, LAJE_HEIGHT - 0.2, 0.45, concreteMat, true);
  addBlock(8.2, (LAJE_HEIGHT - 0.2) / 2, -0.55, 0.45, LAJE_HEIGHT - 0.2, 0.45, concreteMat, true);
  addBlock(8.2, (LAJE_HEIGHT - 0.2) / 2, -3.45, 0.45, LAJE_HEIGHT - 0.2, 0.45, concreteMat, true);

  elevationZones.push({
    minX: -9.0,
    maxX: 9.0,
    minZ: -3.7,
    maxZ: -0.3,
    minHeight: LAJE_HEIGHT,
    maxHeight: LAJE_HEIGHT,
    type: 'platform',
  });

  // Guarda-corpos da passarela
  addBlock(-3.8, LAJE_HEIGHT + 0.5, -0.38, 3.4, 1.0, 0.18, darkIronMat, true);
  addBlock(3.8, LAJE_HEIGHT + 0.5, -3.62, 3.4, 1.0, 0.18, darkIronMat, true);

  // Placa "LARGO DAS LAJES" na viga da passarela
  const largoSignMat = new THREE.MeshStandardMaterial({ map: signBecoPazTex, roughness: 0.5 });
  disposableMaterials.push(largoSignMat);
  const largoSign = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.1), largoSignMat);
  largoSign.position.set(0, LAJE_HEIGHT + 0.35, -0.22);
  registerMesh(largoSign, false);
  mapGroup.add(largoSign);

  // Auxiliares de Mobiliário Urbano e Cobertura Tática (Inspirados nas Imagens 1 e 2)
  // Barraca de Feira / Mercado Comunitário (Ref. tendas do flanco esquerdo da Imagem 1)
  const addMarketStall = (sx: number, sz: number, rotY: number, isRed: boolean) => {
    const stallGroup = new THREE.Group();
    stallGroup.position.set(sx, 0, sz);
    stallGroup.rotation.y = rotY;

    // Bancada de madeira + base sólida
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.05, 1.5), woodBeamMat);
    counter.position.y = 0.525;
    registerMesh(counter, true);
    stallGroup.add(counter);

    // 4 Esteios verticais sustentando a lona
    const postOffsets: [number, number][] = [
      [-1.18, -0.64],
      [1.18, -0.64],
      [-1.18, 0.64],
      [1.18, 0.64],
    ];
    postOffsets.forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 2.3, 0.1), woodBeamMat);
      post.position.set(px, 1.15, pz);
      registerMesh(post, false);
      stallGroup.add(post);
    });

    // Cobertura de lona inclinada
    const canopyMat = isRed ? awningRedWhiteMat : awningBlueWhiteMat;
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.14, 1.85), canopyMat);
    canopy.position.set(0, 2.32, 0);
    canopy.rotation.x = 0.12;
    registerMesh(canopy, false);
    stallGroup.add(canopy);

    mapGroup.add(stallGroup);
    colliders.push({
      minX: sx - 1.35,
      maxX: sx + 1.35,
      minY: 0,
      maxY: 1.9,
      minZ: sz - 0.9,
      maxZ: sz + 0.9,
    });
  };

  // Caçamba Estacionária de Entulho (Cover angulado clássico de rua brasileira)
  const addDumpster = (dx: number, dz: number, rotY: number, colorHex: number) => {
    const dumpGroup = new THREE.Group();
    dumpGroup.position.set(dx, 0, dz);
    dumpGroup.rotation.y = rotY;

    const dumpMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.55,
      metalness: 0.35,
    });
    disposableMaterials.push(dumpMat);

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.35, 1.65), dumpMat);
    body.position.y = 0.68;
    const rim = new THREE.Mesh(new THREE.BoxGeometry(2.68, 0.14, 1.78), darkIronMat);
    rim.position.y = 1.38;
    registerMesh(body, true);
    registerMesh(rim, true);
    dumpGroup.add(body, rim);
    mapGroup.add(dumpGroup);

    colliders.push({
      minX: dx - 1.35,
      maxX: dx + 1.35,
      minY: 0,
      maxY: 1.48,
      minZ: dz - 0.95,
      maxZ: dz + 0.95,
    });
  };

  // Pilha de Pneus 3D para Oficina
  const addTireStack = (tx: number, tz: number, count = 4) => {
    for (let i = 0; i < count; i++) {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.28, 12), darkIronMat);
      tire.position.set(
        tx + (i % 2) * 0.04,
        0.14 + i * 0.28,
        tz - (i % 2) * 0.03
      );
      registerMesh(tire, true);
      mapGroup.add(tire);
    }
    colliders.push({
      minX: tx - 0.5,
      maxX: tx + 0.5,
      minY: 0,
      maxY: count * 0.28,
      minZ: tz - 0.5,
      maxZ: tz + 0.5,
    });
  };

  // ============================================================================
  // 6. ROTA 1 (OESTE): BECO DO BAR DO ZÉ E BOMBSITE B (x ~ -28m, z ~ -6m)
  // ============================================================================
  // Marcação tática do Bombsite B no piso (12m x 12m)
  const siteBPlane = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), bombsiteBMat);
  siteBPlane.rotation.x = -Math.PI / 2;
  siteBPlane.position.set(-28.0, 0.02, -6.0);
  registerMesh(siteBPlane, false);
  mapGroup.add(siteBPlane);

  // Marcação Vertical "B" na parede do Bar do Zé para leitura à distância
  const wallBMarker = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), bombsiteBMat);
  wallBMarker.position.set(-32.54, 3.8, -6.0);
  wallBMarker.rotation.y = Math.PI / 2;
  registerMesh(wallBMarker, false);
  mapGroup.add(wallBMarker);

  // Complexo do Bar do Zé (Fachada Oeste do Bombsite B)
  addStylizedHouse(-36.5, -6.0, 7.8, 7.2, 12.6, plasterOchreMat, {
    floors: 2,
    roofStyle: 'laje',
    hasWaterTank: true,
    hasAwning: 'red',
    hasShopGate: true,
    hasBalcony: true,
  });

  // Placa "BAR & MERCEARIA DO ZÉ"
  const barSignMat = new THREE.MeshStandardMaterial({ map: signBarZeTex, roughness: 0.5 });
  disposableMaterials.push(barSignMat);
  const barSign = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.2), barSignMat);
  barSign.position.set(-32.54, 2.25, -6.0);
  barSign.rotation.y = Math.PI / 2;
  registerMesh(barSign, false);
  mapGroup.add(barSign);

  // Barraquinhas de Feira e Caixas Táticas no Pátio do Bombsite B (Inspiradas na Imagem 1)
  addMarketStall(-25.8, -10.6, 0.08, true);
  addMarketStall(-30.4, -1.2, -0.1, false);
  addTacticalCrate(-24.5, 0, -3.2, 1.4);
  addTacticalCrate(-24.5, 1.4, -3.2, 1.15);
  addDumpster(-31.2, 10.5, 0.25, 0xeab308);

  // Casas definindo o Corredor Oeste (Viela Sul e Viela Norte do B)
  addStylizedHouse(-36.0, 18.0, 8.4, 8.2, 10.0, tijoloMat, { floors: 2, roofStyle: 'zinc', hasWaterTank: true, hasBalcony: true });
  addStylizedHouse(-25.0, 24.5, 8.2, 6.8, 8.4, plasterTerracottaMat, { floors: 2, roofStyle: 'laje', hasAwning: 'blue', hasBalcony: true });
  addStylizedHouse(-36.0, -28.0, 8.4, 8.6, 10.0, plasterBlueMat, { floors: 2, roofStyle: 'laje', hasWaterTank: true, hasBalcony: true });
  addStylizedHouse(-25.0, -28.0, 8.2, 6.8, 8.4, plasterGreenMat, { floors: 2, roofStyle: 'zinc', hasBalcony: false });

  // Conector Transversal: Choke Point entre Rota 1 (Oeste) e Rota 2 (Meio)
  addBlock(-20.5, 1.6, 6.0, 1.8, 3.2, 4.8, tijoloMat, true);
  addBlock(-20.5, 1.6, -16.0, 1.8, 3.2, 4.8, muralMat, true);

  // ============================================================================
  // 7. ROTA 3 (LESTE): BECO DA OFICINA E BOMBSITE A (x ~ +28m, z ~ -6m)
  // ============================================================================
  // Marcação tática do Bombsite A no piso (12m x 12m)
  const siteAPlane = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), bombsiteAMat);
  siteAPlane.rotation.x = -Math.PI / 2;
  siteAPlane.position.set(28.0, 0.02, -6.0);
  registerMesh(siteAPlane, false);
  mapGroup.add(siteAPlane);

  // Marcação Vertical "A" na parede da Oficina do Morro
  const wallAMarker = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), bombsiteAMat);
  wallAMarker.position.set(32.54, 3.8, -6.0);
  wallAMarker.rotation.y = -Math.PI / 2;
  registerMesh(wallAMarker, false);
  mapGroup.add(wallAMarker);

  // Edifício da Oficina do Morro (Fachada Leste do Bombsite A)
  addStylizedHouse(36.5, -6.0, 7.8, 7.6, 12.6, plasterBlueMat, {
    floors: 2,
    roofStyle: 'zinc',
    hasWaterTank: true,
    hasAwning: 'blue',
    hasShopGate: true,
    hasBalcony: true,
  });

  // Placa "OFICINA DO MORRO"
  const oficinaSignMat = new THREE.MeshStandardMaterial({ map: signOficinaTex, roughness: 0.5 });
  disposableMaterials.push(oficinaSignMat);
  const oficinaSign = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.2), oficinaSignMat);
  oficinaSign.position.set(32.54, 2.25, -6.0);
  oficinaSign.rotation.y = -Math.PI / 2;
  registerMesh(oficinaSign, false);
  mapGroup.add(oficinaSign);

  // Telheiro Metálico Industrial Sustentado por Pilares no Bombsite A (Inspirado na Imagem 2)
  const shedRoof = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.22, 8.6), zincRoofMat);
  shedRoof.position.set(28.5, 4.3, -6.0);
  shedRoof.rotation.z = -0.05;
  registerMesh(shedRoof, false);
  mapGroup.add(shedRoof);
  addBlock(25.2, 2.1, -9.8, 0.28, 4.2, 0.28, darkIronMat, true);
  addBlock(25.2, 2.1, -2.2, 0.28, 4.2, 0.28, darkIronMat, true);

  // Coberturas táticas de concreto, pilhas de pneus, caçamba e bancadas no Bombsite A
  addBlock(26.0, 1.0, -10.5, 3.2, 2.0, 1.6, concreteMat, true);
  addBlock(30.5, 0.9, -1.5, 2.4, 1.8, 2.4, muralMat, true);
  addTacticalCrate(24.5, 0, -3.0, 1.45);
  addTireStack(31.2, -9.8, 5);
  addTireStack(30.2, -10.2, 3);
  addDumpster(31.2, 10.5, -0.22, 0x0284c7);

  // Casas definindo o Corredor Leste (Viela Sul e Viela Norte do A)
  addStylizedHouse(36.0, 18.0, 8.4, 8.0, 10.0, plasterTerracottaMat, { floors: 2, roofStyle: 'laje', hasWaterTank: true, hasBalcony: true });
  addStylizedHouse(25.0, 24.5, 8.2, 6.8, 8.4, tijoloMat, { floors: 2, roofStyle: 'zinc', hasAwning: 'red', hasBalcony: true });
  addStylizedHouse(36.0, -28.0, 8.4, 8.4, 10.0, plasterWhiteMat, { floors: 2, roofStyle: 'laje', hasWaterTank: true, hasBalcony: true });
  addStylizedHouse(25.0, -28.0, 8.2, 6.8, 8.4, plasterOchreMat, { floors: 2, roofStyle: 'zinc', hasBalcony: false });

  // Conector Transversal: Choke Point entre Rota 3 (Leste) e Rota 2 (Meio)
  addBlock(20.5, 1.6, 6.0, 1.8, 3.2, 4.8, plasterGreenMat, true);
  addBlock(20.5, 1.6, -16.0, 1.8, 3.2, 4.8, muralMat, true);

  // ============================================================================
  // 8. BLOQUEIOS VISUAIS DE SPAWN E COBERTURAS CENTRAIS
  // ============================================================================
  // Bloqueio frontal na Base CT (Sul, z = 33m) — impede linha de visão direta norte-sul
  addStylizedHouse(0, 33.0, 12.6, 6.4, 4.6, muralMat, { floors: 2, roofStyle: 'laje', hasWaterTank: true, hasBalcony: true });
  // Bloqueio frontal na Base TR (Norte, z = -33m) — impede linha de visão direta
  addStylizedHouse(0, -33.0, 12.6, 6.4, 4.6, plasterGreenMat, { floors: 2, roofStyle: 'zinc', hasWaterTank: true, hasBalcony: true });

  // Coberturas intermediárias no pátio térreo sob as lajes + Caixas Táticas
  addBlock(-4.8, 1.1, 14.0, 3.2, 2.2, 1.4, tijoloMat, true);
  addBlock(4.8, 1.1, 14.0, 1.4, 2.2, 3.2, plasterTerracottaMat, true);
  addBlock(-4.8, 1.1, -18.0, 1.4, 2.2, 3.2, muralMat, true);
  addBlock(4.8, 1.1, -18.0, 3.2, 2.2, 1.4, tijoloMat, true);
  addTacticalCrate(-2.2, 0, 5.2, 1.3);
  addTacticalCrate(2.2, 0, -9.2, 1.3);

  // ============================================================================
  // 9. VEÍCULOS URBANOS COMPACTOS ESTACIONADOS
  // ============================================================================
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

  // Carros na Base PM e nos acessos
  addParkedCompactCar(-14.0, 42.0, 0.15, 0xe2e8f0);
  addParkedCompactCar(14.0, 41.5, -0.2, 0x1d4ed8);
  addParkedCompactCar(-12.0, -42.0, 3.1, 0xb91c1c);
  addParkedCompactCar(12.0, -41.5, 2.9, 0x475569);

  // ============================================================================
  // 10. POSTES DE LUZ, FIAÇÃO ELÉTRICA EM CATENÁRIA E ÁRVORES TROPICAIS
  // ============================================================================
  const polePositions: [number, number][] = [
    [-18.0, 26.0],
    [18.0, 26.0],
    [-18.0, -26.0],
    [18.0, -26.0],
    [-8.5, 0.0],
    [8.5, 0.0],
  ];

  polePositions.forEach(([px, pz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 7.2, 8), woodPoleMat);
    pole.position.set(px, 3.6, pz);
    const crossArm = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.12), darkIronMat);
    crossArm.position.set(px, 6.8, pz);
    registerMesh(pole, true);
    registerMesh(crossArm, false);
    mapGroup.add(pole, crossArm);
    colliders.push({
      minX: px - 0.25,
      maxX: px + 0.25,
      minY: 0,
      maxY: 7.2,
      minZ: pz - 0.25,
      maxZ: pz + 0.25,
    });
  });

  // Fiação elétrica em catenária (2 segmentos com caimento central realista)
  const addOverheadWire = (p1: [number, number, number], p2: [number, number, number]) => {
    const start = new THREE.Vector3(...p1);
    const end = new THREE.Vector3(...p2);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.y -= 0.55; // Caimento natural do cabo

    const addSeg = (a: THREE.Vector3, b: THREE.Vector3) => {
      const dist = a.distanceTo(b);
      const wireGeo = new THREE.CylinderGeometry(0.018, 0.018, dist, 5);
      wireGeo.rotateX(Math.PI / 2);
      const wire = new THREE.Mesh(wireGeo, wireMat);
      wire.position.copy(a).add(b).multiplyScalar(0.5);
      wire.lookAt(b);
      disposableGeometries.push(wireGeo);
      mapGroup.add(wire);
    };
    addSeg(start, mid);
    addSeg(mid, end);
  };

  addOverheadWire([-18.0, 6.8, 26.0], [-8.5, 6.8, 0.0]);
  addOverheadWire([18.0, 6.8, 26.0], [8.5, 6.8, 0.0]);
  addOverheadWire([-8.5, 6.8, 0.0], [-18.0, 6.8, -26.0]);
  addOverheadWire([8.5, 6.8, 0.0], [18.0, 6.8, -26.0]);
  addOverheadWire([-18.0, 6.8, 26.0], [18.0, 6.8, 26.0]);
  addOverheadWire([-18.0, 6.8, -26.0], [18.0, 6.8, -26.0]);

  // Árvores tropicais e vegetação de morro
  const addTropicalTree = (tx: number, tz: number) => {
    const treeGroup = new THREE.Group();
    treeGroup.position.set(tx, 0, tz);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 3.6, 7), woodPoleMat);
    trunk.position.y = 1.8;
    const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.5, 0), foliageMat);
    crown1.position.set(0, 3.8, 0);
    const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.05, 0), foliageMat);
    crown2.position.set(0.6, 4.3, 0.4);
    registerMesh(trunk, true);
    registerMesh(crown1, false);
    registerMesh(crown2, false);
    treeGroup.add(trunk, crown1, crown2);
    mapGroup.add(treeGroup);
    colliders.push({
      minX: tx - 0.35,
      maxX: tx + 0.35,
      minY: 0,
      maxY: 3.8,
      minZ: tz - 0.35,
      maxZ: tz + 0.35,
    });
  };

  addTropicalTree(-44.0, 42.0);
  addTropicalTree(44.0, 42.0);
  addTropicalTree(-44.0, -42.0);
  addTropicalTree(44.0, -42.0);
  addTropicalTree(-46.0, 0.0);
  addTropicalTree(46.0, 0.0);
  addTropicalTree(-18.5, 36.0);
  addTropicalTree(18.5, -36.0);

  // ============================================================================
  // 11. RETORNO DE CONFIGURAÇÃO DO MAPA (Spawns, Waypoints 3D e Iluminação)
  // ============================================================================
  return {
    id: 'vielas',
    mapGroup,
    shootableMeshes,
    colliders,
    elevationZones,
    ctSpawns: [
      [-16, 0, 46.5],
      [-8, 0, 46.5],
      [0, 0, 44.5],
      [8, 0, 46.5],
      [16, 0, 46.5],
    ],
    trSpawns: [
      [-16, 0, -46.5],
      [-8, 0, -46.5],
      [0, 0, -44.5],
      [8, 0, -46.5],
      [16, 0, -46.5],
    ],
    playerCtSpawn: { pos: [0, 1.72, 47.0], yaw: 0 },
    playerTrSpawn: { pos: [0, 1.72, -47.0], yaw: Math.PI },
    // 38 Waypoints 3D cobrindo 3 Rotas Estratégicas, Bombsites A e B, Lajes (+2.6m) e Escadarias
    waypoints: [
      // Base CT (Sul)
      [-16.0, 0, 42.0],
      [0.0, 0, 40.0],
      [16.0, 0, 42.0],

      // Entrada Rota 1 (Oeste / Beco do Zé em direção ao Bombsite B)
      [-28.0, 0, 32.0],
      [-28.0, 0, 16.0],
      [-28.0, 0, 4.0],
      // Bombsite B
      [-28.0, 0, -6.0],
      [-32.0, 0, -6.0],
      [-24.0, 0, -6.0],
      [-28.0, 0, -18.0],
      [-28.0, 0, -32.0],

      // Entrada Rota 3 (Leste / Beco da Oficina em direção ao Bombsite A)
      [28.0, 0, 32.0],
      [28.0, 0, 16.0],
      [28.0, 0, 4.0],
      // Bombsite A
      [28.0, 0, -6.0],
      [32.0, 0, -6.0],
      [24.0, 0, -6.0],
      [28.0, 0, -18.0],
      [28.0, 0, -32.0],

      // Conectores transversais (Flanco Bombsites <-> Meio)
      [-18.0, 0, 6.0],
      [-18.0, 0, -16.0],
      [18.0, 0, 6.0],
      [18.0, 0, -16.0],

      // Rota 2 (Meio térreo sob a passarela)
      [0.0, 0, 24.0],
      [0.0, 0, 10.0],
      [0.0, 0, -2.0],
      [0.0, 0, -14.0],
      [0.0, 0, -24.0],

      // Subidas e Topo das Lajes Elevadas (+2.6m)
      // Laje Oeste
      [-15.0, 1.3, 8.0],
      [-13.0, 2.6, -2.0],
      [-15.0, 1.3, -12.0],
      // Laje Leste
      [15.0, 1.3, 8.0],
      [13.0, 2.6, -2.0],
      [15.0, 1.3, -12.0],
      // Passarela Central
      [0.0, 2.6, -2.0],

      // Base TR (Norte)
      [-16.0, 0, -42.0],
      [0.0, 0, -40.0],
      [16.0, 0, -42.0],
    ],
    skyColor: 0x60a5fa,
    fogColor: 0xfef08a,
    fogDensity: 0.007,
    hemiSkyColor: 0xe0f2fe,
    hemiGroundColor: 0x92400e,
    hemiIntensity: 0.95,
    sunColor: 0xffedd5,
    sunIntensity: 1.6,
    sunPosition: [52, 68, 42],
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

  // 1. Texturas Procedurais da Orla Carioca Expandida (110m x 110m)
  const beachSandTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#f3d9a4';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 2400; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#e6c587' : '#fae6be';
        ctx.globalAlpha = Math.random() * 0.28;
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
      }
    },
    maxAniso,
    256,
    256,
    32,
    32
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
    6,
    36
  );

  const avenueAsphaltTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#2d3138';
      ctx.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 1400; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#23262c' : '#3a3f47';
        ctx.globalAlpha = Math.random() * 0.22;
        ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
      }
      // Faixa tracejada amarela dupla de trânsito no centro da pista
      ctx.globalAlpha = 0.88;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(122, 20, 12, 95);
      ctx.fillRect(122, 145, 12, 95);
    },
    maxAniso,
    256,
    256,
    2,
    22
  );

  const buildingFacadeTex = createMapCanvasTexture(
    (ctx) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, 0, 256, 256);
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
      ctx.strokeStyle = 'rgba(186, 230, 253, 0.42)';
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
    10,
    28
  );

  // Textura de Marcação Tática dos Futuros Bombsites A e B na Orla
  const createOrlaBombsiteTex = (letter: 'A' | 'B', accentHex: string) =>
    createMapCanvasTexture(
      (ctx) => {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 0, 256, 256);
        // Borda zebrada tática
        ctx.fillStyle = accentHex;
        for (let i = -256; i < 512; i += 32) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + 16, 0);
          ctx.lineTo(i - 240, 256);
          ctx.lineTo(i - 256, 256);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(22, 22, 212, 212);
        ctx.strokeStyle = accentHex;
        ctx.lineWidth = 6;
        ctx.strokeRect(28, 28, 200, 200);
        // Círculo de alvo e letra
        ctx.beginPath();
        ctx.arc(128, 128, 68, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = accentHex;
        ctx.font = 'bold 96px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter, 128, 126);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 20px Arial, sans-serif';
        ctx.fillText(`BOMBSITE ${letter}`, 128, 212);
      },
      maxAniso,
      256,
      256,
      1,
      1
    );

  const bombsiteATex = createOrlaBombsiteTex('A', '#f97316');
  const bombsiteBTex = createOrlaBombsiteTex('B', '#ef4444');

  const createStripedCanopyTex = (c1: string, c2: string) =>
    createMapCanvasTexture(
      (ctx) => {
        for (let x = 0; x < 256; x += 32) {
          ctx.fillStyle = (x / 32) % 2 === 0 ? c1 : c2;
          ctx.fillRect(x, 0, 32, 256);
        }
      },
      maxAniso,
      256,
      256,
      2,
      1
    );

  const redCanopyTex = createStripedCanopyTex('#dc2626', '#f8fafc');
  const blueCanopyTex = createStripedCanopyTex('#0284c7', '#f8fafc');
  const greenCanopyTex = createStripedCanopyTex('#059669', '#fef08a');

  const signPostoTex = createBrazilianSignTexture(
    '#0369a1',
    '#ffffff',
    'POSTO 4 — SALVA-VIDAS',
    'CORPO DE BOMBEIROS · BOMBSITE B',
    '#ffffff',
    '#fde047',
    maxAniso
  );
  const signQuiosqueTex = createBrazilianSignTexture(
    '#065f46',
    '#34d399',
    'QUIOSQUE BRISA DO MAR',
    'PRAÇA DO CALÇADÃO · BOMBSITE A',
    '#ffffff',
    '#fde047',
    maxAniso
  );
  const signHotelTex = createBrazilianSignTexture(
    '#1e293b',
    '#38bdf8',
    'HOTEL ATLÂNTICO PALACE',
    'GALERIA COMERCIAL & AVENIDA',
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
    bombsiteATex,
    bombsiteBTex,
    redCanopyTex,
    blueCanopyTex,
    greenCanopyTex,
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
  const creamFacadeMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.75,
  });
  const terracottaFacadeMat = new THREE.MeshStandardMaterial({
    color: 0xd97757,
    roughness: 0.78,
  });
  const coastalBlueFacadeMat = new THREE.MeshStandardMaterial({
    color: 0xbae6fd,
    roughness: 0.74,
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
  const glassBalconyMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.2,
    metalness: 0.6,
  });
  const redCanopyMat = new THREE.MeshStandardMaterial({ map: redCanopyTex, roughness: 0.65 });
  const blueCanopyMat = new THREE.MeshStandardMaterial({ map: blueCanopyTex, roughness: 0.65 });
  const greenCanopyMat = new THREE.MeshStandardMaterial({ map: greenCanopyTex, roughness: 0.65 });
  const bombsiteAMat = new THREE.MeshStandardMaterial({ map: bombsiteATex, roughness: 0.82 });
  const bombsiteBMat = new THREE.MeshStandardMaterial({ map: bombsiteBTex, roughness: 0.82 });
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
  const lifeguardBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.5,
  });
  const lifeguardRedMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.5,
  });

  disposableMaterials.push(
    sandMat,
    boardwalkMat,
    bikeLaneRedMat,
    avenueMat,
    buildingMat,
    creamFacadeMat,
    terracottaFacadeMat,
    coastalBlueFacadeMat,
    whiteConcreteMat,
    stoneWallMat,
    kioskWoodMat,
    kioskRoofGreenMat,
    glassBalconyMat,
    redCanopyMat,
    blueCanopyMat,
    greenCanopyMat,
    bombsiteAMat,
    bombsiteBMat,
    oceanMat,
    seaFoamMat,
    palmTrunkMat,
    palmLeafMat,
    darkMetalMat,
    lifeguardBlueMat,
    lifeguardRedMat
  );

  // ============================================================================
  // 3. PISOS EXPANDIDOS (110m x 110m): AVENIDA (OESTE) · CALÇADÃO (MEIO) · AREIA & MAR (LESTE)
  // ============================================================================
  // Base geral de areia litorânea cobrindo a praia (118m x 118m)
  const beachFloor = new THREE.Mesh(new THREE.PlaneGeometry(118, 118), sandMat);
  beachFloor.rotation.x = -Math.PI / 2;
  registerMesh(beachFloor, true);
  mapGroup.add(beachFloor);

  // Avenida Atlântica asfaltada a Oeste (x = -54 até -13, largura = 41m, compr = 112m)
  const avenueFloor = new THREE.Mesh(new THREE.PlaneGeometry(41, 112), avenueMat);
  avenueFloor.rotation.x = -Math.PI / 2;
  avenueFloor.position.set(-33.5, 0.02, 0);
  registerMesh(avenueFloor, true);
  mapGroup.add(avenueFloor);

  // Ciclovia Vermelha Carioca (x = -13 até -9.2, largura = 3.8m, compr = 112m)
  const bikeLaneFloor = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 112), bikeLaneRedMat);
  bikeLaneFloor.rotation.x = -Math.PI / 2;
  bikeLaneFloor.position.set(-11.1, 0.03, 0);
  registerMesh(bikeLaneFloor, true);
  mapGroup.add(bikeLaneFloor);

  // Calçadão de Pedra Portuguesa em Ondas (x = -9.2 até +8.8, largura = 18m, compr = 112m)
  const boardwalkFloor = new THREE.Mesh(new THREE.PlaneGeometry(18.0, 112), boardwalkMat);
  boardwalkFloor.rotation.x = -Math.PI / 2;
  boardwalkFloor.position.set(-0.2, 0.03, 0);
  registerMesh(boardwalkFloor, true);
  mapGroup.add(boardwalkFloor);

  // Oceano Atlântico além da linha da praia a Leste (x = +48 até +112)
  const oceanPlane = new THREE.Mesh(new THREE.PlaneGeometry(66, 156), oceanMat);
  oceanPlane.rotation.x = -Math.PI / 2;
  oceanPlane.position.set(80, -0.05, 0);
  registerMesh(oceanPlane, false);
  mapGroup.add(oceanPlane);

  // Faixa de espuma das ondas na beira da areia (x = +46.8)
  const foamStrip = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 150), seaFoamMat);
  foamStrip.rotation.x = -Math.PI / 2;
  foamStrip.position.set(46.8, 0.015, 0);
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

  // ============================================================================
  // 4. CONTENÇÃO PERIMETRAL (110m x 110m) E SKYLINE DE EDIFÍCIOS DA ORLA
  // ============================================================================
  // Barreira invisível na beira do mar a Leste (x = +46.8m) mantendo horizonte oceânico aberto
  colliders.push({
    minX: 46.2,
    maxX: 49.0,
    minY: 0,
    maxY: 12,
    minZ: -55,
    maxZ: 55,
  });

  // Muros perimetrais Norte, Sul e Oeste
  addBlock(-4, 5.0, -54, 102, 10, 2.4, buildingMat, true);
  addBlock(-4, 5.0, 54, 102, 10, 2.4, buildingMat, true);
  addBlock(-54, 5.5, 0, 2.4, 11, 110, buildingMat, true);

  // Auxiliar para Edifícios Residenciais/Hoteleiros da Orla Carioca (Inspirados na Imagem 1)
  // Com varandas 3D em balanço, guarda-corpo de vidro, marquise térrea, toldos e pérgola no topo
  const addCoastalBuilding = (
    bx: number,
    bz: number,
    bw: number,
    bh: number,
    bd: number,
    wallMaterial: THREE.Material,
    hasCollider = true,
    canopyType: 'red' | 'blue' | 'green' = 'blue'
  ) => {
    // Corpo principal do edifício
    addBlock(bx, bh / 2, bz, bw, bh, bd, wallMaterial, hasCollider);

    // Embasamento térreo em granito/pedra
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.24, 0.45, bd + 0.24), stoneWallMat);
    plinth.position.set(bx, 0.225, bz);
    registerMesh(plinth, false);
    mapGroup.add(plinth);

    // Marquise comercial no térreo (y = 3.1m) + Toldo listrado
    const marquee = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.9, 0.26, bd + 0.9), whiteConcreteMat);
    marquee.position.set(bx, 3.1, bz);
    registerMesh(marquee, false);
    mapGroup.add(marquee);

    const canopyMat =
      canopyType === 'red' ? redCanopyMat : canopyType === 'green' ? greenCanopyMat : blueCanopyMat;
    const faceSign = bx < 0 ? 1 : -1;
    const storeAwning = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.16, Math.min(bd * 0.72, 6.8)),
      canopyMat
    );
    storeAwning.position.set(bx + faceSign * (bw / 2 + 0.65), 2.65, bz);
    storeAwning.rotation.z = -faceSign * 0.16;
    registerMesh(storeAwning, false);
    mapGroup.add(storeAwning);

    // Varandas 3D em balanço nos pavimentos superiores (2º e 3º andares)
    const floors = Math.max(2, Math.floor(bh / 3.4));
    for (let f = 1; f < floors; f++) {
      const fy = f * 3.3 + 0.2;
      if (fy + 1.8 > bh) break;

      const balcX = bx + faceSign * (bw / 2 + 0.55);
      const balcSlab = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.2, bd * 0.76),
        whiteConcreteMat
      );
      balcSlab.position.set(balcX, fy, bz);
      const glassRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.88, bd * 0.76),
        glassBalconyMat
      );
      glassRail.position.set(balcX + faceSign * 0.48, fy + 0.54, bz);
      // Esquadrias de porta-janela escuras atrás da varanda
      const winDoor = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 2.0, bd * 0.62),
        darkMetalMat
      );
      winDoor.position.set(bx + faceSign * (bw / 2 + 0.04), fy + 1.1, bz);

      registerMesh(balcSlab, false);
      registerMesh(glassRail, false);
      registerMesh(winDoor, false);
      mapGroup.add(balcSlab, glassRail, winDoor);
    }

    // Platibanda superior de concreto + Pérgola de madeira no terraço (Ref. Imagem 1)
    const roofRim = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.4, 0.45, bd + 0.4), whiteConcreteMat);
    roofRim.position.set(bx, bh + 0.22, bz);
    registerMesh(roofRim, false);
    mapGroup.add(roofRim);

    const beamCount = Math.max(3, Math.floor(bd / 2.2));
    for (let bi = 0; bi < beamCount; bi++) {
      const bzBeam = bz - bd * 0.38 + (bi / (beamCount - 1)) * (bd * 0.76);
      const pergolaBeam = new THREE.Mesh(
        new THREE.BoxGeometry(bw * 0.75, 0.14, 0.18),
        kioskWoodMat
      );
      pergolaBeam.position.set(bx, bh + 0.48, bzBeam);
      registerMesh(pergolaBeam, false);
      mapGroup.add(pergolaBeam);
    }
  };

  // Skyline Perimetral Oeste (Orla da Av. Atlântica, x = -50.5)
  addCoastalBuilding(-50.5, -36, 5.2, 12.5, 16, creamFacadeMat, false, 'blue');
  addCoastalBuilding(-50.5, -18, 5.2, 14.0, 15, buildingMat, false, 'red');
  addCoastalBuilding(-50.5, 0, 5.2, 11.8, 16, coastalBlueFacadeMat, false, 'green');
  addCoastalBuilding(-50.5, 18, 5.2, 13.5, 15, terracottaFacadeMat, false, 'blue');
  addCoastalBuilding(-50.5, 36, 5.2, 12.2, 16, creamFacadeMat, false, 'red');

  // Skyline Perimetral Norte (z = -51.2) e Sul (z = +51.2)
  addCoastalBuilding(-32, -51.2, 16, 11.5, 4.8, buildingMat, false, 'blue');
  addCoastalBuilding(-12, -51.2, 15, 13.0, 4.8, creamFacadeMat, false, 'green');
  addCoastalBuilding(10, -51.2, 16, 10.5, 4.8, terracottaFacadeMat, false, 'red');
  addCoastalBuilding(-32, 51.2, 16, 12.0, 4.8, coastalBlueFacadeMat, false, 'red');
  addCoastalBuilding(-12, 51.2, 15, 11.2, 4.8, buildingMat, false, 'blue');
  addCoastalBuilding(10, 51.2, 16, 10.8, 4.8, creamFacadeMat, false, 'green');

  // Auxiliar para Caixas Táticas de Suprimentos na Orla
  const addOrlaCrate = (cx: number, cy: number, cz: number, size = 1.35) => {
    addBlock(cx, cy + size / 2, cz, size, size, size, kioskWoodMat, true);
    const rim = new THREE.Mesh(new THREE.BoxGeometry(size + 0.06, 0.14, size + 0.06), darkMetalMat);
    rim.position.set(cx, cy + size - 0.12, cz);
    registerMesh(rim, false);
    mapGroup.add(rim);
  };

  // ============================================================================
  // 5. ROTA 2 (MEIO / CALÇADÃO) & BOMBSITE A (PRAÇA DOS QUIOSQUES, x = -1m, z = -4m)
  // ============================================================================
  // Marcação tática de piso 12m x 12m do Bombsite A na Praça dos Quiosques
  const siteAPlane = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), bombsiteAMat);
  siteAPlane.rotation.x = -Math.PI / 2;
  siteAPlane.position.set(-1.0, 0.04, -4.0);
  registerMesh(siteAPlane, false);
  mapGroup.add(siteAPlane);

  const kioskSignMat = new THREE.MeshStandardMaterial({ map: signQuiosqueTex, roughness: 0.45 });
  disposableMaterials.push(kioskSignMat);

  // Construtor de Quiosque Carioca Estilizado 3D (com balcão, pilares, telhado duplo e placa)
  const addStylizedBeachKiosk = (kx: number, kz: number, showSiteASign = false) => {
    // Base de pedra + Núcleo de madeira do quiosque
    addBlock(kx, 0.25, kz, 6.2, 0.5, 5.2, stoneWallMat, false);
    addBlock(kx, 1.45, kz, 5.4, 2.5, 4.4, kioskWoodMat, true);

    // Balcão de atendimento em concreto branco ao redor
    const counter = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.18, 5.0), whiteConcreteMat);
    counter.position.set(kx, 1.15, kz);
    registerMesh(counter, false);
    mapGroup.add(counter);

    // Telhado piramidal octogonal em 2 níveis (típico da Orla do Rio)
    const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(4.8, 1.4, 8), kioskRoofGreenMat);
    lowerRoof.position.set(kx, 3.3, kz);
    const upperRoof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.1, 8), kioskRoofGreenMat);
    upperRoof.position.set(kx, 4.2, kz);
    registerMesh(lowerRoof, true);
    registerMesh(upperRoof, false);
    mapGroup.add(lowerRoof, upperRoof);

    // Placa "QUIOSQUE BRISA DO MAR"
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 0.95), kioskSignMat);
    sign.position.set(kx, 2.25, kz + (kz >= 0 ? -2.24 : 2.24));
    if (kz >= 0) sign.rotation.y = Math.PI;
    registerMesh(sign, false);
    mapGroup.add(sign);

    // Se for o quiosque principal do Bombsite A, adiciona painel vertical "A"
    if (showSiteASign) {
      const siteASign = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), bombsiteAMat);
      siteASign.position.set(kx + 2.74, 1.6, kz);
      siteASign.rotation.y = Math.PI / 2;
      registerMesh(siteASign, false);
      mapGroup.add(siteASign);
    }
  };

  // Quiosque Central ancorando o Bombsite A (x = -6.8, z = -4.0)
  addStylizedBeachKiosk(-6.8, -4.0, true);
  // Quiosque Sul (x = -0.5, z = +20.0) e Quiosque Norte (x = -0.5, z = -26.0)
  addStylizedBeachKiosk(-0.5, 20.0, false);
  addStylizedBeachKiosk(-0.5, -26.0, false);

  // Coberturas Táticas no Bombsite A (Muretas de pedra portuguesa, caixas e bancadas)
  addBlock(3.8, 1.0, -4.0, 1.4, 2.0, 4.2, stoneWallMat, true);
  addBlock(-1.0, 0.95, -9.2, 3.8, 1.9, 1.3, stoneWallMat, true);
  addOrlaCrate(1.2, 0, -1.2, 1.35);
  addOrlaCrate(1.2, 1.35, -1.2, 1.1);
  addOrlaCrate(-2.8, 0, 1.5, 1.35);

  // Muretas divisórias entre o Calçadão e a Areia (x = +8.6) com aberturas táticas
  addBlock(8.6, 0.95, 12.0, 0.9, 1.9, 9.0, stoneWallMat, true);
  addBlock(8.6, 0.95, -18.0, 0.9, 1.9, 9.0, stoneWallMat, true);
  addBlock(8.6, 0.95, 28.0, 0.9, 1.9, 7.5, stoneWallMat, true);
  addBlock(8.6, 0.95, -32.0, 0.9, 1.9, 7.5, stoneWallMat, true);

  // ============================================================================
  // 6. ROTA 3 (LESTE / AREIA DA PRAIA) & BOMBSITE B (POSTO 4 SALVA-VIDAS +2.4m)
  // ============================================================================
  const POSTO_H = 2.4;
  const POSTO_X = 28.0;
  const POSTO_Z = -4.0;

  // Marcação tática de piso 12m x 12m do Bombsite B na Areia ao redor do Posto 4
  const siteBPlane = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), bombsiteBMat);
  siteBPlane.rotation.x = -Math.PI / 2;
  siteBPlane.position.set(22.0, 0.03, POSTO_Z);
  registerMesh(siteBPlane, false);
  mapGroup.add(siteBPlane);

  // Base de concreto branco do Posto 4 de Salva-Vidas (subível até +2.4m)
  addBlock(POSTO_X, POSTO_H / 2, POSTO_Z, 7.2, POSTO_H, 9.2, whiteConcreteMat, true);
  elevationZones.push({
    minX: POSTO_X - 3.7,
    maxX: POSTO_X + 3.7,
    minZ: POSTO_Z - 4.7,
    maxZ: POSTO_Z + 4.7,
    minHeight: POSTO_H,
    maxHeight: POSTO_H,
    type: 'platform',
  });

  // Frisos azuis e vermelhos do Corpo de Bombeiros + Janelas 3D no Posto 4
  const blueStripe = new THREE.Mesh(new THREE.BoxGeometry(7.35, 0.35, 9.35), lifeguardBlueMat);
  blueStripe.position.set(POSTO_X, 2.05, POSTO_Z);
  const redStripe = new THREE.Mesh(new THREE.BoxGeometry(7.35, 0.22, 9.35), lifeguardRedMat);
  redStripe.position.set(POSTO_X, 0.35, POSTO_Z);
  registerMesh(blueStripe, false);
  registerMesh(redStripe, false);
  mapGroup.add(blueStripe, redStripe);

  // Marcação Vertical "B" na fachada Oeste do Posto 4 (voltada para o Calçadão)
  const wallBMarker = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), bombsiteBMat);
  wallBMarker.position.set(POSTO_X - 3.64, 1.35, POSTO_Z - 2.2);
  wallBMarker.rotation.y = -Math.PI / 2;
  registerMesh(wallBMarker, false);
  mapGroup.add(wallBMarker);

  // Placa oficial "POSTO 4 — SALVA-VIDAS"
  const postoSignMat = new THREE.MeshStandardMaterial({ map: signPostoTex, roughness: 0.4 });
  disposableMaterials.push(postoSignMat);
  const postoSign = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.2), postoSignMat);
  postoSign.position.set(POSTO_X - 3.64, 1.5, POSTO_Z + 1.4);
  postoSign.rotation.y = -Math.PI / 2;
  registerMesh(postoSign, false);
  mapGroup.add(postoSign);

  // Guarda-corpos táticos no mirante superior (+2.4m) + Cobertura superior sustentada por 4 colunas
  addBlock(POSTO_X - 3.4, POSTO_H + 0.55, POSTO_Z, 0.32, 1.1, 5.4, whiteConcreteMat, true);
  addBlock(POSTO_X + 3.4, POSTO_H + 0.55, POSTO_Z, 0.32, 1.1, 5.4, whiteConcreteMat, true);
  addOrlaCrate(POSTO_X, POSTO_H, POSTO_Z, 1.25);

  const postoRoof = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.26, 9.8), whiteConcreteMat);
  postoRoof.position.set(POSTO_X, POSTO_H + 2.8, POSTO_Z);
  registerMesh(postoRoof, true);
  mapGroup.add(postoRoof);

  // 4 Colunas sustentando o teto do mirante do Posto 4
  const postCols: [number, number][] = [
    [POSTO_X - 3.1, POSTO_Z - 4.1],
    [POSTO_X + 3.1, POSTO_Z - 4.1],
    [POSTO_X - 3.1, POSTO_Z + 4.1],
    [POSTO_X + 3.1, POSTO_Z + 4.1],
  ];
  postCols.forEach(([cx, cz]) => {
    addBlock(cx, POSTO_H + 1.4, cz, 0.26, 2.8, 0.26, darkMetalMat, false);
  });

  // Duas escadarias subíveis para o Posto 4 (Sul e Norte) com guarda-corpo escalonado
  const addLifeguardRamp = (minZ: number, maxZ: number, dir: 'ramp_north' | 'ramp_south') => {
    const steps = 11;
    const len = maxZ - minZ;
    const stepD = len / steps;
    const stepH = POSTO_H / steps;
    for (let s = 0; s < steps; s++) {
      const h = (s + 1) * stepH;
      const sz = dir === 'ramp_north' ? maxZ - (s + 0.5) * stepD : minZ + (s + 0.5) * stepD;
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, h, stepD + 0.04),
        whiteConcreteMat
      );
      stepMesh.position.set(POSTO_X, h / 2, sz);
      registerMesh(stepMesh, true);
      mapGroup.add(stepMesh);

      // Mureta lateral escalonada azul/branca
      const railStep = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, h + 0.6, stepD + 0.02),
        lifeguardBlueMat
      );
      railStep.position.set(POSTO_X + 1.5, (h + 0.6) / 2, sz);
      registerMesh(railStep, true);
      mapGroup.add(railStep);
    }
    elevationZones.push({
      minX: POSTO_X - 1.5,
      maxX: POSTO_X + 1.5,
      minZ: minZ - 0.2,
      maxZ: maxZ + 0.2,
      minHeight: 0,
      maxHeight: POSTO_H,
      type: dir,
    });
  };

  addLifeguardRamp(POSTO_Z + 4.6, POSTO_Z + 12.6, 'ramp_north');
  addLifeguardRamp(POSTO_Z - 12.6, POSTO_Z - 4.6, 'ramp_south');

  // Tendas de Praia Estruturadas e Barracas de Guarda-Sol na Areia (Ref. Imagem 1)
  const addBeachTent = (tx: number, tz: number, rotY: number, mat: THREE.Material) => {
    const tentGroup = new THREE.Group();
    tentGroup.position.set(tx, 0, tz);
    tentGroup.rotation.y = rotY;

    // Balcão / Caixa térmica de apoio (cover sólido)
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.15, 1.7), whiteConcreteMat);
    counter.position.y = 0.575;
    registerMesh(counter, true);
    tentGroup.add(counter);

    // 4 Hastes metálicas + Teto piramidal de lona listrada
    const posts: [number, number][] = [
      [-1.25, -0.75],
      [1.25, -0.75],
      [-1.25, 0.75],
      [1.25, 0.75],
    ];
    posts.forEach(([px, pz]) => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.4, 6), darkMetalMat);
      p.position.set(px, 1.2, pz);
      registerMesh(p, false);
      tentGroup.add(p);
    });

    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.16, 2.1), mat);
    roof.position.y = 2.42;
    roof.rotation.x = 0.08;
    registerMesh(roof, false);
    tentGroup.add(roof);

    mapGroup.add(tentGroup);
    colliders.push({
      minX: tx - 1.45,
      maxX: tx + 1.45,
      minY: 0,
      maxY: 1.9,
      minZ: tz - 0.95,
      maxZ: tz + 0.95,
    });
  };

  // Tendas e coberturas ao redor do Bombsite B e ao longo da Faixa de Areia
  addBeachTent(19.5, -8.5, 0.15, redCanopyMat);
  addBeachTent(19.5, 1.5, -0.12, blueCanopyMat);
  addBeachTent(36.5, -4.0, 0.0, greenCanopyMat);
  addOrlaCrate(22.5, 0, -3.8, 1.4);
  addOrlaCrate(22.5, 1.4, -3.8, 1.15);

  const umbrellaColors = [0xef4444, 0xfacc15, 0x0284c7, 0x10b981];
  const addBeachUmbrellaSpot = (ux: number, uz: number, colorIdx: number) => {
    const uGroup = new THREE.Group();
    uGroup.position.set(ux, 0, uz);

    addBlock(ux, 0.9, uz, 1.8, 1.8, 1.8, whiteConcreteMat, true);

    const uMat = new THREE.MeshStandardMaterial({
      color: umbrellaColors[colorIdx % umbrellaColors.length],
      roughness: 0.6,
    });
    disposableMaterials.push(uMat);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.9, 8), darkMetalMat);
    pole.position.y = 1.45;
    const canopy = new THREE.Mesh(new THREE.ConeGeometry(2.3, 0.8, 8), uMat);
    canopy.position.y = 2.95;
    registerMesh(pole, false);
    registerMesh(canopy, false);
    uGroup.add(pole, canopy);
    mapGroup.add(uGroup);
  };

  addBeachUmbrellaSpot(17.5, 22.0, 0);
  addBeachUmbrellaSpot(31.0, 24.0, 1);
  addBeachUmbrellaSpot(17.5, -26.0, 2);
  addBeachUmbrellaSpot(31.0, -28.0, 3);
  addBeachUmbrellaSpot(38.0, 12.0, 0);
  addBeachUmbrellaSpot(38.0, -18.0, 2);

  // ============================================================================
  // 7. ROTA 1 (OESTE / AVENIDA ATLÂNTICA): QUARTEIRÕES DE EDIFÍCIOS E GALERIAS
  // ============================================================================
  // 4 Quarteirões principais na Avenida criando o Corredor Oeste (x ~ -36m) e Conectores para o Calçadão
  addCoastalBuilding(-24.0, 21.0, 9.5, 11.0, 14.0, buildingMat, true, 'blue');
  addCoastalBuilding(-24.0, -2.0, 9.5, 12.4, 12.0, creamFacadeMat, true, 'red');
  addCoastalBuilding(-24.0, -25.0, 9.5, 11.2, 14.0, terracottaFacadeMat, true, 'green');

  // Placa "HOTEL ATLÂNTICO PALACE" no bloco central da Avenida
  const hotelSignMat = new THREE.MeshStandardMaterial({ map: signHotelTex, roughness: 0.45 });
  disposableMaterials.push(hotelSignMat);
  const hotelSign = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.35), hotelSignMat);
  hotelSign.position.set(-19.2, 3.6, -2.0);
  hotelSign.rotation.y = Math.PI / 2;
  registerMesh(hotelSign, false);
  mapGroup.add(hotelSign);

  // Bancas de Jornal e Guaritas ao longo da Avenida e Conector Central
  addBlock(-15.0, 1.4, 9.5, 2.8, 2.8, 4.2, kioskWoodMat, true);
  addBlock(-15.0, 1.4, -13.5, 2.8, 2.8, 4.2, kioskWoodMat, true);
  addOrlaCrate(-34.5, 0, 8.0, 1.45);
  addOrlaCrate(-34.5, 0, -14.0, 1.45);

  // ============================================================================
  // 8. BLOQUEIOS VISUAIS DE SPAWN (SUL E NORTE)
  // ============================================================================
  // Pavilhão de Bloqueio Sul (Base CT, z = +35m) — impede visão direta CT <-> TR
  addCoastalBuilding(-6.0, 35.5, 13.0, 6.8, 4.8, coastalBlueFacadeMat, true, 'blue');
  addBlock(16.0, 1.6, 35.0, 8.5, 3.2, 2.4, stoneWallMat, true);

  // Pavilhão de Bloqueio Norte (Base TR, z = -35.5m) — impede visão direta TR <-> CT
  addCoastalBuilding(-6.0, -35.5, 13.0, 6.8, 4.8, creamFacadeMat, true, 'red');
  addBlock(16.0, 1.6, -35.0, 8.5, 3.2, 2.4, stoneWallMat, true);

  // ============================================================================
  // 9. COQUEIROS DA ORLA E VEÍCULOS DETALHADOS EM 7 PARTES
  // ============================================================================
  const addCoconutPalm = (px: number, pz: number) => {
    const palmGroup = new THREE.Group();
    palmGroup.position.set(px, 0, pz);

    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 5.8, 8), palmTrunkMat);
    trunk.position.y = 2.9;
    registerMesh(trunk, true);
    palmGroup.add(trunk);

    for (let f = 0; f < 6; f++) {
      const angle = (f / 6) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 2.4), palmLeafMat);
      frond.position.set(Math.sin(angle) * 1.05, 5.7, Math.cos(angle) * 1.05);
      frond.rotation.y = angle;
      frond.rotation.x = 0.32;
      registerMesh(frond, false);
      palmGroup.add(frond);
    }

    mapGroup.add(palmGroup);
    colliders.push({
      minX: px - 0.32,
      maxX: px + 0.32,
      minY: 0,
      maxY: 5.8,
      minZ: pz - 0.32,
      maxZ: pz + 0.32,
    });
  };

  // Fileira de Coqueiros ao longo do Calçadão e Ciclovia
  const palmCoords: [number, number][] = [
    [7.2, 36.0],
    [7.2, 20.0],
    [7.2, 3.5],
    [7.2, -11.0],
    [7.2, -26.0],
    [7.2, -40.0],
    [-12.8, 28.0],
    [-12.8, 0.0],
    [-12.8, -28.0],
  ];
  palmCoords.forEach(([px, pz]) => addCoconutPalm(px, pz));

  // Veículos Urbanos Detalhados na Avenida Atlântica
  const addParkedAvenueCar = (cx: number, cz: number, rotY: number, bodyHex: number) => {
    const carGroup = new THREE.Group();
    carGroup.position.set(cx, 0, cz);
    carGroup.rotation.y = rotY;

    const paintMat = new THREE.MeshStandardMaterial({
      color: bodyHex,
      roughness: 0.32,
      metalness: 0.48,
    });
    disposableMaterials.push(paintMat);

    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.72, 4.0), paintMat);
    chassis.position.y = 0.58;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.62, 2.15), paintMat);
    cabin.position.set(0, 1.2, -0.15);
    const glass = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.5, 2.0), glassBalconyMat);
    glass.position.set(0, 1.22, -0.15);

    registerMesh(chassis, true);
    registerMesh(cabin, true);
    registerMesh(glass, false);
    carGroup.add(chassis, cabin, glass);

    const wheelGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.24, 10);
    wheelGeo.rotateZ(Math.PI / 2);
    [
      [-0.95, 1.25],
      [0.95, 1.25],
      [-0.95, -1.25],
      [0.95, -1.25],
    ].forEach(([wx, wz]) => {
      const wMesh = new THREE.Mesh(wheelGeo, darkMetalMat);
      wMesh.position.set(wx, 0.32, wz);
      registerMesh(wMesh, false);
      carGroup.add(wMesh);
    });

    mapGroup.add(carGroup);
    colliders.push({
      minX: cx - 1.3,
      maxX: cx + 1.3,
      minY: 0,
      maxY: 1.68,
      minZ: cz - 2.05,
      maxZ: cz + 2.05,
    });
  };

  addParkedAvenueCar(-36.5, 32.0, 0.08, 0xf8fafc);
  addParkedAvenueCar(-36.5, -1.5, -0.05, 0xfacc15); // Táxi Amarelo Carioca
  addParkedAvenueCar(-36.5, -32.0, 0.12, 0x0284c7);
  addParkedAvenueCar(-15.5, 28.5, -0.1, 0xef4444);
  addParkedAvenueCar(-15.5, -28.5, 0.1, 0x1e293b);

  return {
    id: 'orla',
    mapGroup,
    shootableMeshes,
    colliders,
    elevationZones,
    ctSpawns: [
      [-24, 0, 46.5],
      [-12, 0, 46.5],
      [0, 0, 44.5],
      [12, 0, 46.5],
      [24, 0, 46.5],
    ],
    trSpawns: [
      [-24, 0, -46.5],
      [-12, 0, -46.5],
      [0, 0, -44.5],
      [12, 0, -46.5],
      [24, 0, -46.5],
    ],
    playerCtSpawn: { pos: [0, 1.72, 47.0], yaw: 0 },
    playerTrSpawn: { pos: [0, 1.72, -47.0], yaw: Math.PI },
    // 38 Waypoints 3D cobrindo Avenida (Oeste), Calçadão & Bombsite A (Meio), Areia & Bombsite B + Posto 4 (+2.4m)
    waypoints: [
      // Base CT (Sul)
      [-20.0, 0, 41.0],
      [0.0, 0, 41.0],
      [22.0, 0, 41.0],

      // Rota 1: Corredor da Avenida Atlântica (Oeste)
      [-36.0, 0, 26.0],
      [-36.0, 0, 10.0],
      [-36.0, 0, -2.0],
      [-36.0, 0, -14.0],
      [-36.0, 0, -28.0],

      // Conectores Transversais (Passagens entre Prédios da Avenida <-> Calçadão)
      [-24.0, 0, 9.5],
      [-15.0, 0, 9.5],
      [-24.0, 0, -13.5],
      [-15.0, 0, -13.5],

      // Rota 2: Calçadão de Pedra Portuguesa & BOMBSITE A (Praça dos Quiosques)
      [-2.0, 0, 28.0],
      [3.5, 0, 15.0],
      [-1.0, 0, 5.0],
      // Bombsite A
      [-1.0, 0, -4.0],
      [-4.5, 0, -4.0],
      [2.5, 0, -4.0],
      [-1.0, 0, -14.0],
      [3.5, 0, -22.0],
      [-2.0, 0, -30.0],

      // Conectores Calçadão <-> Areia da Praia
      [9.0, 0, 3.5],
      [9.0, 0, -8.5],
      [9.0, 0, 20.0],
      [9.0, 0, -25.0],

      // Rota 3: Faixa de Areia da Praia & BOMBSITE B (Posto 4 Salva-Vidas)
      [22.0, 0, 28.0],
      [22.0, 0, 15.0],
      // Bombsite B (entorno do Posto 4)
      [21.0, 0, -4.0],
      [21.0, 0, 3.0],
      [21.0, 0, -11.0],
      [35.0, 0, -4.0],
      [22.0, 0, -20.0],
      [22.0, 0, -30.0],

      // Subida e Topo do Mirante do Posto 4 de Salva-Vidas (+2.4m)
      [28.0, 1.2, 4.5],
      [28.0, 2.4, -4.0],
      [28.0, 1.2, -12.5],

      // Base TR (Norte)
      [-20.0, 0, -41.0],
      [0.0, 0, -41.0],
      [22.0, 0, -41.0],
    ],
    skyColor: 0x38bdf8,
    fogColor: 0xe0f2fe,
    fogDensity: 0.0065,
    hemiSkyColor: 0xf0f9ff,
    hemiGroundColor: 0xd6c198,
    hemiIntensity: 0.98,
    sunColor: 0xfffbeb,
    sunIntensity: 1.65,
    sunPosition: [54, 72, 34],
    dispose: () => {
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
    },
  };
}

/**
 * ============================================================================
 * MAPA 3 — CENTRO (Largo da Carioca, VLT, Galeria Saara & Av. Rio Branco — 110m × 110m)
 * ============================================================================
 * Reformulação 3D Low-Poly Estilizada (Fase 3):
 * - Arena expandida para 110m × 110m com skyline perimetral completo combinando Sobrados Históricos do Rio Antigo e Torres Corporativas Modernistas.
 * - Rota 1 (Oeste): Galeria Saara, Rua do Ouvidor, Padaria Carioca, Boteco do Centro, Livraria, colunatas cobertas e BOMBSITE B no Pátio Comercial da Galeria (x = -26m, z = -4m).
 * - Rota 2 (Meio): Largo da Carioca em pedra portuguesa com BOMBSITE A (x = -1.5m, z = -4m), Plataforma Comercial Elevada (+2.5m) subível por 2 escadarias com guarda-corpos escalonados e Terminal de VLT Carioca com trilhos e composição VLT estacionada.
 * - Rota 3 (Leste): Avenida Rio Branco com corredor BRS, 3 faixas de pedestres, 2 ônibus urbanos municipais, 3 táxis amarelos cariocas, abrigos de ônibus e Torres Corporativas com brises-soleil 3D.
 * - Spawns protegidos para PM (Sul, z = +46.5m) e Bandidos (Norte, z = -46.5m) + 38 Waypoints 3D.
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

  // 1. Textura de Calçada de Pedra Portuguesa / Granito do Largo da Carioca
  const graniteSidewalkTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    for (let y = 0; y < 256; y += 32) {
      for (let x = 0; x < 256; x += 32) {
        ctx.fillStyle = (x / 32 + y / 32) % 2 === 0 ? '#dde4ec' : '#c4ced9';
        ctx.fillRect(x, y, 32, 32);
        ctx.strokeRect(x, y, 32, 32);
      }
    }
    // Frisos geométricos de pedra portuguesa preta típicos da Av. Rio Branco
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 256, 8);
    ctx.fillRect(0, 124, 256, 8);

    for (let i = 0; i < 1200; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.1)';
      ctx.fillRect((i * 53) % 256, (i * 89) % 256, 2, 2);
    }
    return registerTex(c, 22, 22);
  })();

  // 2. Textura de Asfalto da Avenida Rio Branco (3 faixas + corredor BRS Azul)
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
    // Faixa exclusiva BRS azul à direita
    ctx.fillStyle = 'rgba(2, 132, 199, 0.22)';
    ctx.fillRect(172, 0, 74, 256);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(170, 0, 4, 256);

    // Faixa dupla amarela central
    ctx.fillStyle = '#eab308';
    ctx.fillRect(86, 0, 4, 256);
    for (let y = 14; y < 256; y += 64) {
      ctx.fillRect(128, y, 5, 36);
    }
    // Guias laterais brancas
    ctx.fillStyle = 'rgba(248,250,252,0.55)';
    ctx.fillRect(8, 0, 4, 256);
    ctx.fillRect(244, 0, 4, 256);
    return registerTex(c, 1, 14);
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
    for (let x = 12; x < 244; x += 28) {
      ctx.fillRect(x, 10, 16, 108);
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
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, y, 256, 12);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, y + 10, 256, 3);

      for (let col = 0; col < 4; col++) {
        const x = col * 64 + 6;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x, y + 15, 52, 44);
        ctx.fillStyle = (row + col) % 2 === 0 ? '#1e3a5f' : '#172554';
        ctx.fillRect(x + 3, y + 18, 46, 38);
        ctx.fillStyle = 'rgba(186,230,253,0.18)';
        ctx.fillRect(x + 6, y + 20, 14, 34);
      }
    }
    return registerTex(c, 2, 3);
  })();

  // 5. Textura de Prédio Histórico / Sobrado Comercial (Saara / Rua do Ouvidor)
  const makeHistoricFacadeTex = (baseHex: string, trimHex: string) => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = baseHex;
    ctx.fillRect(0, 0, 256, 256);

    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      ctx.fillRect((i * 47) % 256, (i * 83) % 256, 3, 3);
    }

    for (let row = 0; row < 3; row++) {
      const y = row * 85;
      ctx.fillStyle = trimHex;
      ctx.fillRect(0, y, 256, 10);
      ctx.fillStyle = 'rgba(0,0,0,0.22)';
      ctx.fillRect(0, y + 10, 256, 3);

      for (let col = 0; col < 3; col++) {
        const x = col * 85 + 14;
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(x - 3, y + 18, 62, 56);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y + 21, 56, 50);
        ctx.strokeStyle = trimHex;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, y + 25, 48, 42);
      }
    }
    return registerTex(c, 2, 2);
  };

  // 6. Textura de Porta de Aço de Enrolar de Comércio Urbano
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

  // 7. Textura de Demarcação Tática de Bombsite no Piso (A / B)
  const makeBombsiteFloorTex = (siteLetter: 'A' | 'B', accentHex: string) => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 512, 512);

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 512, 512);
    ctx.rect(34, 34, 444, 444);
    ctx.clip('evenodd');
    ctx.fillStyle = '#facc15';
    ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#18181b';
    for (let i = -512; i < 1024; i += 44) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 22, 0);
      ctx.lineTo(i - 512 + 22, 512);
      ctx.lineTo(i - 512, 512);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = accentHex;
    ctx.lineWidth = 8;
    ctx.strokeRect(42, 42, 428, 428);

    ctx.strokeStyle = 'rgba(248, 250, 252, 0.25)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(256, 256, 150, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = accentHex;
    ctx.font = '900 210px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(siteLetter, 256, 245);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 30px Inter, Arial, sans-serif';
    ctx.fillText(`BOMBSITE ${siteLetter}`, 256, 420);

    return registerTex(c, 1, 1);
  };

  // 8. Gerador de Placas Comerciais e Sinalização do Centro do Rio
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
  const signLivrariaMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('LIVRARIA & PAPELARIA OUVIDOR', 'LIVROS · DISCOS · CAFÉ CULTURAL', '#14532d', '#fef9c3', '#eab308'),
    roughness: 0.5,
  });
  const signVltMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('PARADA VLT · LARGO DA CARIOCA', 'LINHA 1 · SANTOS DUMONT ↔ RODOVIÁRIA', '#0f172a', '#38bdf8', '#facc15'),
    roughness: 0.4,
  });
  const signBancaMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('BANCA CARIOCA', 'JORNAIS · REVISTAS · RECARGA · CAFÉ', '#065f46', '#ecfdf5', '#10b981'),
    roughness: 0.5,
  });
  const signBusMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('BRS RIO BRANCO · CENTRO', 'LINHAS ZONA SUL · LAPA · CENTRAL', '#1d4ed8', '#ffffff', '#60a5fa'),
    roughness: 0.4,
  });
  const signSiteAMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('→ BOMBSITE A · LARGO & VLT', 'PLATAFORMA COMERCIAL CENTRAL (+2.5m)', '#7f1d1d', '#fef08a', '#ef4444'),
    roughness: 0.45,
  });
  const signSiteBMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('← BOMBSITE B · GALERIA SAARA', 'PÁTIO DO COMÉRCIO & PADARIA CARIOCA', '#78350f', '#fde68a', '#f59e0b'),
    roughness: 0.45,
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
  const historicOchreMat = new THREE.MeshStandardMaterial({
    map: makeHistoricFacadeTex('#e5cca0', '#f5ebe0'),
    roughness: 0.8,
  });
  const historicTerracottaMat = new THREE.MeshStandardMaterial({
    map: makeHistoricFacadeTex('#d98a6c', '#fae1dd'),
    roughness: 0.8,
  });
  const historicBlueMat = new THREE.MeshStandardMaterial({
    map: makeHistoricFacadeTex('#89b0ae', '#f8fafc'),
    roughness: 0.8,
  });
  const historicCreamMat = new THREE.MeshStandardMaterial({
    map: makeHistoricFacadeTex('#ede0d4', '#b08968'),
    roughness: 0.8,
  });
  const steelShutterMat = new THREE.MeshStandardMaterial({
    map: steelShutterTex,
    roughness: 0.55,
    metalness: 0.5,
  });
  const bombsiteAFloorMat = new THREE.MeshStandardMaterial({
    map: makeBombsiteFloorTex('A', '#ef4444'),
    roughness: 0.8,
  });
  const bombsiteBFloorMat = new THREE.MeshStandardMaterial({
    map: makeBombsiteFloorTex('B', '#f59e0b'),
    roughness: 0.8,
  });
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.85,
  });
  const lightTrimMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.72,
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
  const railSteelMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.35,
    metalness: 0.8,
  });
  const vltBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.32,
    metalness: 0.45,
  });
  const vltSilverMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.38,
    metalness: 0.5,
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
  const glassCyanMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.2,
    metalness: 0.5,
    transparent: true,
    opacity: 0.78,
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
  const woodBeamMat = new THREE.MeshStandardMaterial({
    color: 0x5c3a21,
    roughness: 0.86,
  });
  const roofTerracottaMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.78,
  });
  const awningRedMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.65,
  });
  const awningBlueMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.65,
  });
  const awningGreenMat = new THREE.MeshStandardMaterial({
    color: 0x16a34a,
    roughness: 0.65,
  });
  const canvasSandMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.75,
  });

  disposableMaterials.push(
    signPadariaMat,
    signBotecoMat,
    signSaaraMat,
    signLivrariaMat,
    signVltMat,
    signBancaMat,
    signBusMat,
    signSiteAMat,
    signSiteBMat,
    graniteSidewalkMat,
    asphaltMat,
    crosswalkMat,
    corporateFacadeMat,
    historicOchreMat,
    historicTerracottaMat,
    historicBlueMat,
    historicCreamMat,
    steelShutterMat,
    bombsiteAFloorMat,
    bombsiteBFloorMat,
    concreteMat,
    lightTrimMat,
    darkGraniteMat,
    marqueeMat,
    darkMetalMat,
    railSteelMat,
    vltBlueMat,
    vltSilverMat,
    bancaGreenMat,
    busBlueMat,
    busBodyMat,
    taxiYellowMat,
    glassDarkMat,
    glassCyanMat,
    treeBarkMat,
    foliageGreenMat,
    woodCrateMat,
    woodBeamMat,
    roofTerracottaMat,
    awningRedMat,
    awningBlueMat,
    awningGreenMat,
    canvasSandMat
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
  // HELPERS ARQUITETÔNICOS 3D ESTILIZADOS DO CENTRO DO RIO (FASE 3)
  // ============================================================================

  // 1. Sobrado Histórico / Galeria Comercial do Saara & Rua do Ouvidor (Inspirado na volumetria da Imagem 1)
  const addHistoricBuilding = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    wallMat: THREE.Material,
    options?: {
      collidable?: boolean;
      facing?: 'east' | 'west' | 'north' | 'south';
      hasShutters?: boolean;
      awningMat?: THREE.Material;
      hasBalconies?: boolean;
      hasColonialRoof?: boolean;
    }
  ) => {
    const isCollidable = options?.collidable ?? true;
    const facing = options?.facing ?? 'east';

    // Corpo principal do sobrado
    addBlock(w, h, d, x, y, z, wallMat, isCollidable);

    // Cornija superior e frisos intermediários em relevo 3D
    addBlock(w + 0.5, 0.45, d + 0.5, x, y + h - 0.35, z, lightTrimMat, false);
    const floors = Math.max(2, Math.floor(h / 4.2));
    for (let f = 1; f < floors; f++) {
      addBlock(w + 0.28, 0.24, d + 0.28, x, y + f * 4.2, z, lightTrimMat, false);
    }

    // Telhado colonial com madeiramento aparente no topo (estilo diorama Imagem 1)
    if (options?.hasColonialRoof !== false) {
      addBlock(w - 0.6, 0.45, d - 0.6, x, y + h + 0.1, z, roofTerracottaMat, false);
      const rafters = Math.max(3, Math.floor(d / 3.2));
      for (let r = 0; r < rafters; r++) {
        const rz = z - d / 2 + 1.4 + r * ((d - 2.8) / Math.max(1, rafters - 1));
        addBlock(w + 0.7, 0.14, 0.22, x, y + h + 0.05, rz, woodBeamMat, false);
      }
    }

    // Detalhamento de fachada na direção principal
    const isEW = facing === 'east' || facing === 'west';
    const dirSign = facing === 'east' || facing === 'south' ? 1 : -1;
    const span = isEW ? d : w;
    const bays = Math.max(2, Math.floor(span / 5.2));

    for (let b = 0; b < bays; b++) {
      const offset = -span / 2 + (span / (bays * 2)) * (2 * b + 1);
      const bx = isEW ? x + dirSign * (w / 2 + 0.12) : x + offset;
      const bz = isEW ? z + offset : z + dirSign * (d / 2 + 0.12);

      // Portas de aço de enrolar no térreo + toldos listrados
      if (options?.hasShutters !== false) {
        const sw = isEW ? 0.22 : 3.2;
        const sd = isEW ? 3.2 : 0.22;
        addBlock(sw, 3.1, sd, bx, y, bz, steelShutterMat, false);

        if (options?.awningMat) {
          const aw = isEW ? 1.35 : 3.5;
          const ad = isEW ? 3.5 : 1.35;
          const ax = isEW ? x + dirSign * (w / 2 + 0.68) : bx;
          const az = isEW ? bz : z + dirSign * (d / 2 + 0.68);
          addBlock(aw, 0.22, ad, ax, y + 3.25, az, options.awningMat, false);
        }
      }

      // Sacadas coloniais de ferro forjado e janelas com venezianas nos andares superiores
      if (options?.hasBalconies !== false && floors >= 2) {
        for (let f = 1; f < floors; f++) {
          const fy = y + f * 4.2 + 0.35;
          const balW = isEW ? 0.95 : 2.8;
          const balD = isEW ? 2.8 : 0.95;
          const balX = isEW ? x + dirSign * (w / 2 + 0.45) : bx;
          const balZ = isEW ? bz : z + dirSign * (d / 2 + 0.45);
          addBlock(balW, 0.18, balD, balX, fy, balZ, lightTrimMat, false);
          addBlock(balW + 0.06, 0.78, balD + 0.06, balX, fy + 0.18, balZ, darkMetalMat, false);
        }
      }
    }
  };

  // 2. Torre Corporativa Modernista da Av. Rio Branco (Vidro, Brises 3D & Marquise)
  const addCorporateTower = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    facing: 'west' | 'east' | 'north' | 'south' = 'west',
    collidable = true
  ) => {
    addBlock(w, h, d, x, y, z, corporateFacadeMat, collidable);
    // Coroamento de concreto e casa de máquinas/heliporto no topo
    addBlock(w + 0.6, 0.65, d + 0.6, x, y + h - 0.65, z, lightTrimMat, false);
    addBlock(w * 0.55, 2.2, d * 0.55, x, y + h, z, darkGraniteMat, false);

    // Brises horizontais 3D a cada 4.5m
    const levels = Math.floor(h / 4.5);
    for (let l = 1; l < levels; l++) {
      addBlock(w + 0.36, 0.25, d + 0.36, x, y + l * 4.5, z, concreteMat, false);
    }

    // Marquise térrea em balanço
    const isEW = facing === 'west' || facing === 'east';
    const sign = facing === 'east' || facing === 'south' ? 1 : -1;
    const mqW = isEW ? 2.4 : w * 0.88;
    const mqD = isEW ? d * 0.88 : 2.4;
    const mqX = isEW ? x + sign * (w / 2 + 1.1) : x;
    const mqZ = isEW ? z : z + sign * (d / 2 + 1.1);
    addBlock(mqW, 0.42, mqD, mqX, y + 4.2, mqZ, concreteMat, false);
  };

  // 3. Barraca de Camelô / Feira do Saara com Toldo de Lona e Caibros (Inspirado na Imagem 1)
  const addMarketStall3D = (sx: number, sz: number, canopyMat: THREE.Material, rot90 = false) => {
    const w = rot90 ? 2.2 : 3.2;
    const d = rot90 ? 3.2 : 2.2;
    // Balcão de madeira com mercadorias
    addBlock(w, 1.05, d, sx, 0, sz, woodCrateMat, true);
    addBlock(w * 0.8, 0.38, d * 0.75, sx, 1.05, sz, canvasSandMat, false);
    // 4 estacas de madeira nos cantos
    const px = w / 2 - 0.12;
    const pz = d / 2 - 0.12;
    [
      [-px, -pz],
      [px, -pz],
      [-px, pz],
      [px, pz],
    ].forEach(([dx, dz]) => {
      addBlock(0.14, 2.35, 0.14, sx + dx, 0, sz + dz, woodBeamMat, false);
    });
    // Toldo superior em duas camadas
    addBlock(w + 0.45, 0.22, d + 0.45, sx, 2.3, sz, canopyMat, false);
    addBlock(w * 0.65, 0.2, d * 0.65, sx, 2.52, sz, canvasSandMat, false);
  };

  // ============================================================================
  // 1. PISO EXPANDIDO (110m × 110m): GALERIA SAARA, LARGO DA CARIOCA & AV. RIO BRANCO
  // ============================================================================
  // Calçadão da Galeria Saara & Largo da Carioca em Pedra Portuguesa (x = -56..+13.5, z = -56..+56)
  const plazaFloorGeo = new THREE.PlaneGeometry(69.5, 114);
  disposableGeometries.push(plazaFloorGeo);
  const plazaFloor = new THREE.Mesh(plazaFloorGeo, graniteSidewalkMat);
  plazaFloor.rotation.x = -Math.PI / 2;
  plazaFloor.position.set(-21.25, 0, 0);
  plazaFloor.receiveShadow = !isSoftwareGl;
  mapGroup.add(plazaFloor);
  shootableMeshes.push(plazaFloor);

  // Avenida Rio Branco Asfaltada (x = +13.5..+31.5, largura = 18m, comprimento = 114m)
  const avenueFloorGeo = new THREE.PlaneGeometry(18.0, 114);
  disposableGeometries.push(avenueFloorGeo);
  const avenueFloor = new THREE.Mesh(avenueFloorGeo, asphaltMat);
  avenueFloor.rotation.x = -Math.PI / 2;
  avenueFloor.position.set(22.5, 0.01, 0);
  avenueFloor.receiveShadow = !isSoftwareGl;
  mapGroup.add(avenueFloor);
  shootableMeshes.push(avenueFloor);

  // 4 Faixas de Pedestres Brancas cruzando a Avenida Rio Branco
  [-32.0, -11.0, 11.0, 32.0].forEach((cz) => {
    const cwGeo = new THREE.PlaneGeometry(17.4, 4.6);
    disposableGeometries.push(cwGeo);
    const cwMesh = new THREE.Mesh(cwGeo, crosswalkMat);
    cwMesh.rotation.x = -Math.PI / 2;
    cwMesh.position.set(22.5, 0.02, cz);
    mapGroup.add(cwMesh);
  });

  // Calçada Corporativa Leste da Av. Rio Branco (x = +31.5..+56, largura = 24.5m)
  const eastSidewalkGeo = new THREE.PlaneGeometry(24.5, 114);
  disposableGeometries.push(eastSidewalkGeo);
  const eastSidewalk = new THREE.Mesh(eastSidewalkGeo, graniteSidewalkMat);
  eastSidewalk.rotation.x = -Math.PI / 2;
  eastSidewalk.position.set(43.75, 0, 0);
  eastSidewalk.receiveShadow = !isSoftwareGl;
  mapGroup.add(eastSidewalk);
  shootableMeshes.push(eastSidewalk);

  // Trilhos Metálicos Embutidos do VLT Carioca cortando o Largo de Norte a Sul (x = 9.5m)
  addBlock(2.4, 0.03, 110, 9.5, 0.01, 0, darkGraniteMat, false);
  addBlock(0.14, 0.06, 110, 8.75, 0.02, 0, railSteelMat, false);
  addBlock(0.14, 0.06, 110, 10.25, 0.02, 0, railSteelMat, false);

  // ============================================================================
  // 2. MUROS DE CONTENÇÃO INVISÍVEIS & SKYLINE URBANO 360° (110m × 110m)
  // ============================================================================
  addBlock(112, 14.0, 2.0, 0, 0, -55.0, corporateFacadeMat, true); // Norte
  addBlock(112, 14.0, 2.0, 0, 0, 55.0, corporateFacadeMat, true);  // Sul
  addBlock(2.0, 14.0, 112, -55.0, 0, 0, historicOchreMat, true);   // Oeste
  addBlock(2.0, 16.0, 112, 55.0, 0, 0, corporateFacadeMat, true);  // Leste

  // Skyline Oeste (Sobrados Históricos do Saara em x = -49.5)
  addHistoricBuilding(8.5, 16.5, 22.0, -49.5, 0, -36.0, historicOchreMat, {
    collidable: true,
    facing: 'east',
    awningMat: awningRedMat,
  });
  addHistoricBuilding(8.5, 18.0, 22.0, -49.5, 0, -11.0, historicTerracottaMat, {
    collidable: true,
    facing: 'east',
    awningMat: awningBlueMat,
  });
  addHistoricBuilding(8.5, 16.5, 22.0, -49.5, 0, 14.0, historicBlueMat, {
    collidable: true,
    facing: 'east',
    awningMat: awningGreenMat,
  });
  addHistoricBuilding(8.5, 17.5, 20.0, -49.5, 0, 38.0, historicCreamMat, {
    collidable: true,
    facing: 'east',
    awningMat: awningRedMat,
  });

  // Skyline Leste (Torres Corporativas da Av. Rio Branco em x = +44.5)
  addCorporateTower(11.0, 26.0, 24.0, 44.5, 0, -35.0, 'west', true);
  addCorporateTower(11.0, 30.0, 24.0, 44.5, 0, -6.0, 'west', true);
  addCorporateTower(11.0, 28.0, 24.0, 44.5, 0, 23.0, 'west', true);
  addCorporateTower(11.0, 24.0, 16.0, 44.5, 0, 45.0, 'west', true);

  // Skyline Norte e Sul (Fechamento visual dos extremos z = ±52.5)
  addHistoricBuilding(22.0, 18.5, 6.0, -24.0, 0, -52.5, historicCreamMat, {
    collidable: false,
    facing: 'south',
  });
  addCorporateTower(24.0, 25.0, 6.0, 6.0, 0, -52.5, 'south', false);
  addHistoricBuilding(22.0, 18.5, 6.0, -24.0, 0, 52.5, historicOchreMat, {
    collidable: false,
    facing: 'north',
  });
  addCorporateTower(24.0, 25.0, 6.0, 6.0, 0, 52.5, 'north', false);

  // ============================================================================
  // 3. ROTA 1 (OESTE) & BOMBSITE B: PÁTIO DA GALERIA SAARA & PADARIA CARIOCA
  // ============================================================================
  // Demarcação Tática do BOMBSITE B no Pátio da Galeria Saara (x = -26.0, z = -4.0, 12m × 12m)
  const siteBFloorGeo = new THREE.PlaneGeometry(12.0, 12.0);
  disposableGeometries.push(siteBFloorGeo);
  const siteBFloor = new THREE.Mesh(siteBFloorGeo, bombsiteBFloorMat);
  siteBFloor.rotation.x = -Math.PI / 2;
  siteBFloor.position.set(-26.0, 0.025, -4.0);
  siteBFloor.receiveShadow = !isSoftwareGl;
  mapGroup.add(siteBFloor);

  // Bloco Comercial Noroeste — Galeria Saara Rio (x = -38..-28, z = -34..-13)
  addHistoricBuilding(10.0, 14.5, 21.0, -33.0, 0, -23.5, historicOchreMat, {
    collidable: true,
    facing: 'east',
    awningMat: awningBlueMat,
  });
  addBlock(0.25, 1.3, 6.8, -27.8, 3.9, -23.5, signSaaraMat, false);

  // Bloco Comercial Sudoeste — Padaria Carioca & Boteco do Centro (x = -38..-28, z = 5..26)
  addHistoricBuilding(10.0, 14.5, 21.0, -33.0, 0, 15.5, historicTerracottaMat, {
    collidable: true,
    facing: 'east',
    awningMat: awningRedMat,
  });
  addBlock(0.25, 1.25, 6.2, -27.8, 3.9, 10.5, signBotecoMat, false);
  addBlock(0.25, 1.25, 6.2, -27.8, 3.9, 20.5, signPadariaMat, false);

  // Bloco Comercial Divisor Leste do Pátio B — Livraria Ouvidor (separa o Bombsite B do Largo Central)
  addHistoricBuilding(6.2, 12.5, 15.0, -16.5, 0, -22.0, historicBlueMat, {
    collidable: true,
    facing: 'west',
    awningMat: awningGreenMat,
  });
  addBlock(0.25, 1.2, 5.8, -19.7, 3.8, -22.0, signLivrariaMat, false);

  addHistoricBuilding(6.2, 12.5, 15.0, -16.5, 0, 14.0, historicCreamMat, {
    collidable: true,
    facing: 'west',
    awningMat: awningRedMat,
  });

  // Placa Vertical de Sinalização Tática do BOMBSITE B no Pátio da Galeria
  addBlock(5.2, 1.15, 0.22, -26.0, 3.7, -12.8, signSiteBMat, false);

  // Marquise Coberta e Colunata de Granito do Passeio do Saara (x = -23.5)
  addBlock(4.8, 0.38, 66.0, -25.6, 3.65, -4.0, marqueeMat, false);
  [-32.0, -24.0, -16.0, 8.0, 16.0, 24.0].forEach((pz) => {
    addBlock(0.85, 3.65, 0.85, -23.4, 0, pz, darkGraniteMat, true);
  });

  // Coberturas Táticas dentro e ao redor do Bombsite B (Bancas do Saara + Pallets de Mercadorias)
  addMarketStall3D(-29.2, -4.0, awningRedMat, true);
  addMarketStall3D(-22.5, -7.2, awningBlueMat, false);
  addMarketStall3D(-22.5, -0.5, awningGreenMat, false);
  // Caixas táticas para plant/defuse e bang no Bombsite B
  addBlock(1.8, 1.25, 1.8, -26.0, 0, -4.0, woodCrateMat, true);
  addBlock(1.4, 1.1, 2.2, -39.5, 0, -4.0, woodCrateMat, true);
  addBlock(1.5, 1.15, 2.0, -41.5, 0, -18.0, woodCrateMat, true);
  addBlock(1.5, 1.15, 2.0, -41.5, 0, 14.0, woodCrateMat, true);

  // ============================================================================
  // 4. ROTA 2 (MEIO) & BOMBSITE A: LARGO DA CARIOCA, TERMINAL VLT & PLATAFORMA (+2.5m)
  // ============================================================================
  // Demarcação Tática do BOMBSITE A no Largo da Carioca (x = -1.5, z = -4.0, 13m × 13m)
  const siteAFloorGeo = new THREE.PlaneGeometry(13.0, 13.0);
  disposableGeometries.push(siteAFloorGeo);
  const siteAFloor = new THREE.Mesh(siteAFloorGeo, bombsiteAFloorMat);
  siteAFloor.rotation.x = -Math.PI / 2;
  siteAFloor.position.set(-1.5, 0.025, -4.0);
  siteAFloor.receiveShadow = !isSoftwareGl;
  mapGroup.add(siteAFloor);

  // Plataforma Comercial Elevada (+2.5m) no Coração do Bombsite A (x = -5.5..+2.5, z = -9.0..+1.0)
  const platH = 2.5;
  addBlock(8.0, platH, 10.0, -1.5, 0, -4.0, darkGraniteMat, true);
  addBlock(7.8, 0.08, 9.8, -1.5, platH - 0.02, -4.0, graniteSidewalkMat, false);

  elevationZones.push({
    minX: -5.5,
    maxX: 2.5,
    minZ: -9.0,
    maxZ: 1.0,
    minHeight: platH,
    maxHeight: platH,
    type: 'platform',
  });

  // Parapeitos Táticos no Topo da Plataforma (+2.5m) voltados para Norte e Sul
  addBlock(7.4, 1.05, 0.45, -1.5, platH, -8.75, concreteMat, true);
  addBlock(7.4, 1.05, 0.45, -1.5, platH, 0.75, concreteMat, true);

  // Cobertura Metálica do Quiosque/Mirante Superior + Relógio Digital & Placa BOMBSITE A
  addBlock(1.6, 2.2, 1.1, -1.5, platH, -4.0, darkMetalMat, true);
  addBlock(6.2, 0.32, 6.8, -1.5, platH + 2.85, -4.0, marqueeMat, false);
  [
    [-4.1, -6.9],
    [1.1, -6.9],
    [-4.1, -1.1],
    [1.1, -1.1],
  ].forEach(([px, pz]) => {
    addBlock(0.28, 2.85, 0.28, px, platH, pz, darkMetalMat, false);
  });
  addBlock(5.4, 1.1, 0.22, -1.5, platH + 3.2, 0.85, signSiteAMat, false);
  addBlock(5.4, 1.1, 0.22, -1.5, platH + 3.2, -8.85, signSiteAMat, false);

  // Escadaria Oeste da Plataforma (Sobe de x = -9.9 no chão até x = -5.5 em y = 2.5m -> ramp_east)
  const stepsCount = 9;
  for (let i = 0; i < stepsCount; i++) {
    const stepH = ((i + 1) / stepsCount) * platH;
    const stepX = -9.9 + (i + 0.5) * (4.4 / stepsCount);
    addBlock(4.4 / stepsCount, stepH, 3.4, stepX, 0, -4.0, concreteMat, false);
    // Guarda-corpo escalonado acompanhando cada degrau
    addBlock(4.4 / stepsCount, stepH + 0.65, 0.22, stepX, 0, -5.8, darkGraniteMat, false);
    addBlock(4.4 / stepsCount, stepH + 0.65, 0.22, stepX, 0, -2.2, darkGraniteMat, false);
  }
  elevationZones.push({
    minX: -10.0,
    maxX: -5.4,
    minZ: -5.7,
    maxZ: -2.3,
    minHeight: 0,
    maxHeight: platH,
    type: 'ramp_east',
  });

  // Escadaria Leste da Plataforma (Sobe de x = +6.9 no chão até x = +2.5 em y = 2.5m -> ramp_west)
  for (let i = 0; i < stepsCount; i++) {
    const stepH = ((i + 1) / stepsCount) * platH;
    const stepX = 6.9 - (i + 0.5) * (4.4 / stepsCount);
    addBlock(4.4 / stepsCount, stepH, 3.4, stepX, 0, -4.0, concreteMat, false);
    addBlock(4.4 / stepsCount, stepH + 0.65, 0.22, stepX, 0, -5.8, darkGraniteMat, false);
    addBlock(4.4 / stepsCount, stepH + 0.65, 0.22, stepX, 0, -2.2, darkGraniteMat, false);
  }
  elevationZones.push({
    minX: 2.4,
    maxX: 7.0,
    minZ: -5.7,
    maxZ: -2.3,
    minHeight: 0,
    maxHeight: platH,
    type: 'ramp_west',
  });

  // ============================================================================
  // TERMINAL DE VLT CARIOCA & COMPOSIÇÃO VLT 3D (LADO LESTE DO BOMBSITE A)
  // ============================================================================
  // Estação Coberta Parada VLT Largo da Carioca (x = 6.2, z = -16.5)
  addBlock(2.4, 0.28, 11.0, 6.0, 3.3, -16.5, darkMetalMat, false);
  addBlock(0.22, 2.7, 9.2, 5.2, 0.3, -16.5, glassCyanMat, true);
  addBlock(0.5, 3.3, 0.5, 5.2, 0, -21.2, darkMetalMat, true);
  addBlock(0.5, 3.3, 0.5, 5.2, 0, -11.8, darkMetalMat, true);
  addBlock(0.2, 0.9, 5.4, 6.9, 3.55, -16.5, signVltMat, false);

  // Composição do VLT Carioca Azul/Prata estacionada nos trilhos (x = 9.5, z = 6.5)
  const buildVltTram = (tx: number, tz: number) => {
    // Chassi inferior escuro
    addBlock(2.55, 0.45, 13.6, tx, 0.05, tz, darkMetalMat, true);
    // Carroceria principal azul VLT Rio
    addBlock(2.65, 1.35, 13.2, tx, 0.5, tz, vltBlueMat, true);
    // Faixa superior prateada + janelas panorâmicas
    addBlock(2.7, 0.95, 12.4, tx, 1.85, tz, glassDarkMat, true);
    addBlock(2.62, 0.38, 13.0, tx, 2.8, tz, vltSilverMat, false);
    // Pantógrafo articulado no teto
    addBlock(1.2, 0.45, 1.8, tx, 3.18, tz, darkMetalMat, false);
  };
  buildVltTram(9.5, 8.5);

  // Bancas de Jornal Metálicas Verdes no Largo da Carioca
  const buildNewspaperStand = (bx: number, bz: number) => {
    addBlock(3.6, 2.45, 2.4, bx, 0, bz, bancaGreenMat, true);
    addBlock(4.2, 0.26, 3.0, bx, 2.45, bz, darkMetalMat, false);
    addBlock(3.4, 0.58, 0.16, bx, 2.7, bz + (bz > 0 ? -1.35 : 1.35), signBancaMat, false);
  };
  buildNewspaperStand(-8.5, -24.0);
  buildNewspaperStand(-8.5, 18.0);
  buildNewspaperStand(2.5, 25.0);

  // 8 Canteiros de Concreto com Árvores Urbanas (Oitis do Largo da Carioca)
  const buildUrbanTreePlanter = (tx: number, tz: number) => {
    addBlock(2.5, 0.9, 2.5, tx, 0, tz, concreteMat, true);
    addBlock(0.55, 3.4, 0.55, tx, 0.9, tz, treeBarkMat, true);
    addBlock(3.8, 1.7, 3.8, tx, 4.0, tz, foliageGreenMat, false);
    addBlock(2.6, 1.3, 2.6, tx, 5.5, tz, foliageGreenMat, false);
  };
  buildUrbanTreePlanter(-8.8, -12.5);
  buildUrbanTreePlanter(-8.8, 6.5);
  buildUrbanTreePlanter(4.5, -28.0);
  buildUrbanTreePlanter(4.5, 16.5);
  buildUrbanTreePlanter(-18.5, -34.0);
  buildUrbanTreePlanter(-18.5, 30.0);
  buildUrbanTreePlanter(34.0, -20.0);
  buildUrbanTreePlanter(34.0, 20.0);

  // ============================================================================
  // 5. ROTA 3 (LESTE): AVENIDA RIO BRANCO, ÔNIBUS BRS, TÁXIS & PONTOS DE ÔNIBUS
  // ============================================================================
  const buildUrbanBus = (bx: number, bz: number) => {
    addBlock(2.9, 3.15, 10.4, bx, 0.35, bz, busBodyMat, true);
    addBlock(2.96, 0.78, 10.44, bx, 1.1, bz, busBlueMat, false);
    addBlock(2.98, 0.95, 9.6, bx, 1.95, bz, glassDarkMat, false);
    addBlock(3.05, 0.72, 1.25, bx, 0, bz - 3.2, darkMetalMat, false);
    addBlock(3.05, 0.72, 1.25, bx, 0, bz + 3.2, darkMetalMat, false);
  };
  buildUrbanBus(26.5, -18.0);
  buildUrbanBus(18.5, 16.0);

  const buildCariocaTaxi = (cx: number, cz: number) => {
    addBlock(2.15, 0.85, 4.5, cx, 0.2, cz, taxiYellowMat, true);
    addBlock(2.2, 0.22, 4.52, cx, 0.65, cz, busBlueMat, false);
    addBlock(1.88, 0.72, 2.35, cx, 1.05, cz, glassDarkMat, true);
    addBlock(2.25, 0.5, 0.82, cx, 0, cz - 1.4, darkMetalMat, false);
    addBlock(2.25, 0.5, 0.82, cx, 0, cz + 1.4, darkMetalMat, false);
  };
  buildCariocaTaxi(21.5, -2.5);
  buildCariocaTaxi(17.5, -30.0);
  buildCariocaTaxi(26.2, 30.0);

  const buildBusStopShelter = (sx: number, sz: number) => {
    addBlock(0.35, 2.6, 5.2, sx + 0.95, 0, sz, darkMetalMat, true);
    addBlock(0.85, 0.55, 3.6, sx + 0.2, 0, sz, concreteMat, true);
    addBlock(2.4, 0.26, 5.6, sx + 0.1, 2.6, sz, busBlueMat, false);
    addBlock(0.16, 0.68, 3.8, sx - 0.95, 2.65, sz, signBusMat, false);
  };
  buildBusStopShelter(33.2, -16.0);
  buildBusStopShelter(33.2, 14.0);

  // ============================================================================
  // 6. PROTEÇÃO DE SPAWNS (SUL = PM / CT em z = +46.5 | NORTE = BANDIDOS / TR em z = -46.5)
  // ============================================================================
  // Pavilhão Comercial Sul (protege o spawn da PM em z = +46.5)
  addHistoricBuilding(14.0, 5.2, 3.4, -2.0, 0, 38.5, historicOchreMat, {
    collidable: true,
    facing: 'north',
    hasBalconies: false,
    awningMat: awningBlueMat,
  });

  // Pavilhão Comercial Norte (protege o spawn dos Bandidos em z = -46.5)
  addHistoricBuilding(14.0, 5.2, 3.4, -2.0, 0, -38.5, historicCreamMat, {
    collidable: true,
    facing: 'south',
    hasBalconies: false,
    awningMat: awningRedMat,
  });

  return {
    id: 'centro',
    mapGroup,
    shootableMeshes,
    colliders,
    elevationZones,
    ctSpawns: [
      [-24, 0, 46.5],
      [-12, 0, 46.5],
      [0, 0, 44.5],
      [12, 0, 46.5],
      [24, 0, 46.5],
    ],
    trSpawns: [
      [-24, 0, -46.5],
      [-12, 0, -46.5],
      [0, 0, -44.5],
      [12, 0, -46.5],
      [24, 0, -46.5],
    ],
    playerCtSpawn: { pos: [0, 1.72, 47.0], yaw: 0 },
    playerTrSpawn: { pos: [0, 1.72, -47.0], yaw: Math.PI },
    // 38 Waypoints 3D cobrindo Galeria Saara & Bombsite B (Oeste), Largo da Carioca & Bombsite A + Plataforma (+2.5m), VLT e Av. Rio Branco (Leste)
    waypoints: [
      // Base CT (Sul)
      [-22.0, 0, 42.0],
      [-2.0, 0, 42.0],
      [20.0, 0, 42.0],

      // Rota 1 (Oeste): Corredor do Saara & Pátio do BOMBSITE B
      [-41.0, 0, 28.0],
      [-41.0, 0, 10.0],
      [-41.0, 0, -4.0],
      [-41.0, 0, -18.0],
      [-41.0, 0, -32.0],

      // Interior do Bombsite B (Pátio da Galeria Saara & Padaria Carioca)
      [-26.0, 0, 3.0],
      [-26.0, 0, -4.0],
      [-31.0, 0, -4.0],
      [-21.0, 0, -4.0],
      [-26.0, 0, -11.0],

      // Conectores Oeste <-> Largo Central (Becos do Comércio)
      [-16.5, 0, -4.0],
      [-16.5, 0, 24.0],
      [-16.5, 0, -32.0],

      // Rota 2 (Meio): Largo da Carioca & Entorno do BOMBSITE A
      [-11.0, 0, 28.0],
      [-11.0, 0, 12.0],
      [-11.0, 0, -4.0],
      [-11.0, 0, -20.0],
      [-11.0, 0, -32.0],
      [-1.5, 0, 6.0],
      [-1.5, 0, -14.0],

      // Escadarias e Topo da Plataforma Comercial Elevada (+2.5m) no Bombsite A
      [-7.7, 1.25, -4.0],
      [-1.5, 2.5, -4.0],
      [4.7, 1.25, -4.0],

      // Corredor dos Trilhos do VLT Carioca
      [6.5, 0, 24.0],
      [6.5, 0, -4.0],
      [6.5, 0, -26.0],

      // Rota 3 (Leste): Avenida Rio Branco, Ônibus BRS e Calçada Corporativa
      [22.0, 0, 32.0],
      [22.0, 0, 6.0],
      [22.0, 0, -6.0],
      [22.0, 0, -30.0],
      [34.5, 0, 26.0],
      [34.5, 0, 0.0],
      [34.5, 0, -26.0],

      // Base TR (Norte)
      [-22.0, 0, -42.0],
      [-2.0, 0, -42.0],
      [20.0, 0, -42.0],
    ],
    skyColor: 0x7dd3fc,
    fogColor: 0xe2e8f0,
    fogDensity: 0.0068,
    hemiSkyColor: 0xf1f5f9,
    hemiGroundColor: 0x94a3b8,
    hemiIntensity: 0.95,
    sunColor: 0xfff7ed,
    sunIntensity: 1.58,
    sunPosition: [52, 74, 36],
    dispose: () => {
      disposableGeometries.forEach((g) => g.dispose());
      disposableMaterials.forEach((m) => m.dispose());
      disposableTextures.forEach((t) => t.dispose());
    },
  };
}

/**
 * ============================================================================
 * MAPA 4 — COMPLEXO (Grande Conjunto Urbano & Habitacional — 110m × 110m)
 * ============================================================================
 * Conjunto Habitacional 3D Low-Poly Estilizado expandido (110m × 110m, x = -55..55, z = -55..55):
 * - Anel Perimetral 360° de Blocos Habitacionais Populares (COHAB / Zona Norte) e muros de tijolo aparente.
 * - Blocos Habitacionais 3D (addHousingBlock3D) em ocre, terracota, azul-acinzentado e verde-musgo com:
 *   vigas estruturais de concreto em relevo 3D, sacadas gradeadas 3D, aparelhos de ar-condicionado,
 *   telhados de fibrocimento com caibros aparentes e caixas d'água comunitárias azuis sobre castelos d'água.
 * - Rota 1 (Oeste, x = -54..-15): Beco Tático Extremo Oeste (x = -42m) + Rua do Mercadinho & Lan House (x = -19m),
 *   com portas de aço de enrolar, marquises, toldos e ponte residencial suspensa entre os Blocos A-01 e C-03.
 * - Rota 2 (Meio, x = -15..+15) — BOMBSITE A (Quadra Poliesportiva Central & Passarela com Mirante Coberto +2.6m):
 *   Quadra comunitária completa (22m × 44m) com traves de futsal 3D, tabelas de basquete, refletores,
 *   demarcação tática de Bombsite A (x = 0, z = -4.0) e Rede de Varandas + Passarela Aérea Central (+2.6m)
 *   equipada com 4 escadarias com guarda-corpos escalonados e Mirante Central Coberto.
 * - Rota 3 (Leste, x = +15..+54) — BOMBSITE B (Pátio das Garagens Coletivas em Pilotis & Oficina Mecânica):
 *   Blocos B-02 e D-04 suspensos em pilotis (térreo aberto y = 0..3.8m com colunas de concreto),
 *   pátio central do Bombsite B (x = +27.5, z = -4.0), Oficina Coletiva, furgões, carros estacionados e pilhas de pneus.
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

  // 1. Piso de Concreto & Asfalto Urbano do Conjunto Habitacional (110m × 110m)
  const complexGroundTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(0, 0, 256, 256);

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
    return registerTex(c, 24, 24);
  })();

  // 2. Textura da Quadra Poliesportiva Comunitária (Pátio Central)
  const courtFloorTex = (() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 1024;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 512, 1024);
    // Piso esportivo verde-petróleo/azul com borda laranja comunitária
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(20, 24, 472, 976);
    ctx.fillStyle = '#0f766e';
    ctx.fillRect(38, 44, 436, 936);
    // Linhas brancas de demarcação oficial
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 8;
    ctx.strokeRect(48, 56, 416, 912);
    // Linha de meio de quadra e círculo central
    ctx.beginPath();
    ctx.moveTo(48, 512);
    ctx.lineTo(464, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(256, 512, 86, 0, Math.PI * 2);
    ctx.stroke();
    // Áreas de garrafão/goleiro Norte e Sul
    ctx.strokeRect(146, 56, 220, 148);
    ctx.strokeRect(146, 820, 220, 148);
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
        // Janela quadrada de esquadria metálica com grade e veneziana
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y + 18, 46, 34);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y + 18, 46, 34);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x + 22, y + 18, 2, 34);
        if ((row + col) % 2 === 0) {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(x + 6, y + 53, 18, 8);
        }
      }
    }
    for (let i = 0; i < 900; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect((i * 59) % 256, (i * 97) % 256, 3, 3);
    }
    return registerTex(c, 2, 2);
  };

  const housingOchreTex = makeHousingFacadeTex('#d6a868', '#94a3b8', '#b45309');
  const housingTerracottaTex = makeHousingFacadeTex('#c26d53', '#9ca3af', '#7c2d12');
  const housingBlueTex = makeHousingFacadeTex('#7ba3be', '#94a3b8', '#0369a1');
  const housingSageTex = makeHousingFacadeTex('#84a98c', '#94a3b8', '#15803d');

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

  // 5. Textura de Porta de Aço de Enrolar (Comércios Comunitários e Oficina)
  const steelShutterTex = (() => {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 128; y += 8) {
      ctx.fillStyle = y % 16 === 0 ? '#475569' : '#1e293b';
      ctx.fillRect(0, y, 128, 4);
    }
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, 124, 124);
    return registerTex(c, 1, 1);
  })();

  // 6. Gerador de Marcação de Piso Tático para Bombsites A e B (Estilo CS Competitivo)
  const makeBombsiteFloorTex = (siteLetter: 'A' | 'B', subLabel: string, primaryHex: string) => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
    ctx.fillRect(0, 0, 512, 512);

    // Moldura zebrada de alerta tático
    const stripeW = 32;
    ctx.save();
    for (let i = -512; i < 1024; i += stripeW * 2) {
      ctx.fillStyle = primaryHex;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + stripeW, 0);
      ctx.lineTo(i + stripeW - 64, 64);
      ctx.lineTo(i - 64, 64);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(i, 448);
      ctx.lineTo(i + stripeW, 448);
      ctx.lineTo(i + stripeW - 64, 512);
      ctx.lineTo(i - 64, 512);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    ctx.strokeStyle = primaryHex;
    ctx.lineWidth = 10;
    ctx.strokeRect(24, 24, 464, 464);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 4;
    ctx.strokeRect(42, 42, 428, 428);

    // Círculo central de alvo e letra A / B
    ctx.beginPath();
    ctx.arc(256, 236, 118, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220, 38, 38, 0.24)';
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = primaryHex;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 165px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(siteLetter, 256, 242);

    ctx.fillStyle = '#fef08a';
    ctx.font = '900 28px Inter, Arial, sans-serif';
    ctx.fillText(`BOMBSITE ${siteLetter} · ${subLabel}`, 256, 412);

    return registerTex(c, 1, 1);
  };

  // 7. Gerador de Placas de Blocos, Comércios e Direcionais Táticos
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
    ctx.font = '900 30px Inter, Arial, sans-serif';
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
  const signBarbeariaMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('BARBEARIA & LANCHONETE DO BLOCO', 'CORTE DISFARÇADO · SALGADOS · REFRI', '#064e3b', '#fde047', '#10b981'),
    roughness: 0.5,
  });
  const signGaragemMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('GARAGEM COLETIVA & OFICINA', 'BLOCOS B-02 / D-04 · PILOTIS LESTE', '#334155', '#facc15', '#94a3b8'),
    roughness: 0.5,
  });
  const signBlocoAMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('CONJUNTO HABITACIONAL · BLOCO A-01', 'SETOR NOROESTE · RUA DO MERCADINHO', '#0f172a', '#f8fafc', '#f97316'),
    roughness: 0.5,
  });
  const signBlocoBMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('CONJUNTO HABITACIONAL · BLOCO B-02', 'SETOR NORDESTE · GARAGENS EM PILOTIS', '#0f172a', '#f8fafc', '#38bdf8'),
    roughness: 0.5,
  });
  const signBlocoCMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('CONJUNTO HABITACIONAL · BLOCO C-03', 'SETOR SUDOESTE · LAN HOUSE & PÁTIO', '#0f172a', '#f8fafc', '#fb923c'),
    roughness: 0.5,
  });
  const signBlocoDMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('CONJUNTO HABITACIONAL · BLOCO D-04', 'SETOR SUDESTE · OFICINA COLETIVA', '#0f172a', '#f8fafc', '#facc15'),
    roughness: 0.5,
  });
  const signBombsiteAMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('→ BOMBSITE A · QUADRA CENTRAL', 'PÁTIO POLIESPORTIVO & MIRANTE (+2.6M)', '#991b1b', '#fef08a', '#f97316'),
    roughness: 0.45,
  });
  const signBombsiteBMat = new THREE.MeshStandardMaterial({
    map: makeSignTex('← BOMBSITE B · GARAGENS PILOTIS', 'PÁTIO DA OFICINA & BLOCOS B-02 / D-04', '#1e3a8a', '#fef08a', '#38bdf8'),
    roughness: 0.45,
  });

  const bombsiteAFloorMat = new THREE.MeshStandardMaterial({
    map: makeBombsiteFloorTex('A', 'QUADRA & PASSARELA', '#f97316'),
    roughness: 0.8,
  });
  const bombsiteBFloorMat = new THREE.MeshStandardMaterial({
    map: makeBombsiteFloorTex('B', 'GARAGENS EM PILOTIS', '#38bdf8'),
    roughness: 0.8,
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
  const housingSageMat = new THREE.MeshStandardMaterial({
    map: housingSageTex,
    roughness: 0.85,
  });
  const brickWallMat = new THREE.MeshStandardMaterial({
    map: brickWallTex,
    roughness: 0.88,
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
  const darkConcreteMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.88,
  });
  const darkMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.45,
    metalness: 0.65,
  });
  const galvanizedRoofMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    roughness: 0.5,
    metalness: 0.55,
  });
  const terracottaRoofMat = new THREE.MeshStandardMaterial({
    color: 0x9a3412,
    roughness: 0.78,
  });
  const woodRafterMat = new THREE.MeshStandardMaterial({
    color: 0x5c3a21,
    roughness: 0.85,
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
  const awningOrangeMat = new THREE.MeshStandardMaterial({
    color: 0xea580c,
    roughness: 0.65,
  });
  const awningBlueMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.65,
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
  const carYellowMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.4,
    metalness: 0.35,
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
  const goalPostWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.3,
  });
  const tireRubberMat = new THREE.MeshStandardMaterial({
    color: 0x171717,
    roughness: 0.92,
  });
  const foliageMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.85,
  });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x18181b });

  disposableMaterials.push(
    signMercadoMat,
    signLanHouseMat,
    signBarbeariaMat,
    signGaragemMat,
    signBlocoAMat,
    signBlocoBMat,
    signBlocoCMat,
    signBlocoDMat,
    signBombsiteAMat,
    signBombsiteBMat,
    bombsiteAFloorMat,
    bombsiteBFloorMat,
    complexGroundMat,
    courtFloorMat,
    housingOchreMat,
    housingTerracottaMat,
    housingBlueMat,
    housingSageMat,
    brickWallMat,
    steelShutterMat,
    concreteMat,
    darkConcreteMat,
    darkMetalMat,
    galvanizedRoofMat,
    terracottaRoofMat,
    woodRafterMat,
    waterTankBlueMat,
    dumpsterAmberMat,
    awningOrangeMat,
    awningBlueMat,
    vanWhiteMat,
    carRedMat,
    carSilverMat,
    carYellowMat,
    glassDarkMat,
    woodCrateMat,
    goalPostWhiteMat,
    tireRubberMat,
    foliageMat,
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
  // HELPER ARQUITETÔNICO 3D: BLOCO HABITACIONAL POPULAR COM SACADAS 3D & PILOTIS
  // ============================================================================
  const addHousingBlock3D = (opts: {
    w: number;
    h: number;
    d: number;
    x: number;
    yBase?: number;
    z: number;
    wallMat: THREE.Material;
    collidable?: boolean;
    balconySide?: 'east' | 'west' | 'north' | 'south' | 'both_ew';
    hasWaterTower?: boolean;
    hasStructuredRoof?: boolean;
  }) => {
    const {
      w,
      h,
      d,
      x,
      yBase = 0,
      z,
      wallMat,
      collidable = true,
      balconySide,
      hasWaterTower = true,
      hasStructuredRoof = true,
    } = opts;

    // Corpo principal do bloco habitacional
    addBlock(w, h, d, x, yBase, z, wallMat, collidable);

    // Vigas horizontais de concreto aparente em relevo 3D a cada 3.4m de altura
    const floors = Math.max(2, Math.floor(h / 3.4));
    for (let f = 1; f <= floors; f++) {
      const beamY = yBase + Math.min(h - 0.25, f * (h / floors));
      addBlock(w + 0.36, 0.26, d + 0.36, x, beamY, z, concreteMat, false);
    }

    // Pilastras verticais de concreto nos 4 cantos do edifício
    const cOffX = w / 2 - 0.18;
    const cOffZ = d / 2 - 0.18;
    [
      [-cOffX, -cOffZ],
      [cOffX, -cOffZ],
      [-cOffX, cOffZ],
      [cOffX, cOffZ],
    ].forEach(([dx, dz]) => {
      addBlock(0.55, h, 0.55, x + dx, yBase, z + dz, darkConcreteMat, false);
    });

    // Sacadas Populares 3D com laje, parapeito de alvenaria, grade metálica e aparelhos de ar-condicionado
    const buildBalconiesOnFace = (side: 'east' | 'west' | 'north' | 'south') => {
      const startFloorY = yBase > 0 ? yBase + 0.6 : 3.4;
      for (let by = startFloorY; by < yBase + h - 2.2; by += 3.4) {
        if (side === 'east' || side === 'west') {
          const dirX = side === 'east' ? 1 : -1;
          const bx = x + dirX * (w / 2 + 0.58);
          const numBalc = Math.max(2, Math.floor(d / 6.2));
          const stepZ = d / numBalc;
          for (let b = 0; b < numBalc; b++) {
            const bz = z - d / 2 + stepZ * (b + 0.5);
            const bw = Math.min(3.8, stepZ * 0.68);
            // Laje da sacada 3D
            addBlock(1.2, 0.2, bw, bx, by, bz, concreteMat, false);
            // Mureta/grade frontal e barras verticais
            addBlock(0.14, 0.95, bw, bx + dirX * 0.52, by + 0.2, bz, darkMetalMat, false);
            addBlock(1.1, 0.95, 0.12, bx, by + 0.2, bz - bw / 2 + 0.06, darkMetalMat, false);
            addBlock(1.1, 0.95, 0.12, bx, by + 0.2, bz + bw / 2 - 0.06, darkMetalMat, false);
            // Caixa de ar-condicionado 3D ao lado da sacada
            if (b % 2 === 0) {
              addBlock(0.55, 0.45, 0.72, x + dirX * (w / 2 + 0.25), by + 1.45, bz + bw * 0.35, darkConcreteMat, false);
            }
          }
        } else {
          const dirZ = side === 'south' ? 1 : -1;
          const bz = z + dirZ * (d / 2 + 0.58);
          const numBalc = Math.max(2, Math.floor(w / 6.2));
          const stepX = w / numBalc;
          for (let b = 0; b < numBalc; b++) {
            const bx = x - w / 2 + stepX * (b + 0.5);
            const bw = Math.min(3.8, stepX * 0.68);
            addBlock(bw, 0.2, 1.2, bx, by, bz, concreteMat, false);
            addBlock(bw, 0.95, 0.14, bx, by + 0.2, bz + dirZ * 0.52, darkMetalMat, false);
            addBlock(0.12, 0.95, 1.1, bx - bw / 2 + 0.06, by + 0.2, bz, darkMetalMat, false);
            addBlock(0.12, 0.95, 1.1, bx + bw / 2 - 0.06, by + 0.2, bz, darkMetalMat, false);
          }
        }
      }
    };

    if (balconySide === 'both_ew') {
      buildBalconiesOnFace('east');
      buildBalconiesOnFace('west');
    } else if (balconySide) {
      buildBalconiesOnFace(balconySide);
    }

    const roofTopY = yBase + h;

    // Telhado estruturado low-poly com platibanda, caibros de madeira e telha de fibrocimento/barro
    if (hasStructuredRoof) {
      addBlock(w + 0.6, 0.45, d + 0.6, x, roofTopY, z, darkConcreteMat, false);
      // Caibros aparentes sob o beiral
      const numRafters = Math.min(6, Math.max(3, Math.floor(d / 4.5)));
      for (let r = 0; r < numRafters; r++) {
        const rz = z - d * 0.38 + (r / Math.max(1, numRafters - 1)) * (d * 0.76);
        addBlock(w + 1.1, 0.16, 0.22, x, roofTopY + 0.45, rz, woodRafterMat, false);
      }
      addBlock(w * 0.92, 0.55, d * 0.92, x, roofTopY + 0.55, z, terracottaRoofMat, false);
      addBlock(w * 0.58, 0.48, d * 0.58, x, roofTopY + 1.1, z, galvanizedRoofMat, false);
    }

    // Castelo d'água de concreto + Caixa d'água comunitária azul no topo
    if (hasWaterTower) {
      const towerBaseY = roofTopY + (hasStructuredRoof ? 1.35 : 0.2);
      addBlock(3.4, 1.4, 3.4, x, towerBaseY, z, darkConcreteMat, false);
      addBlock(4.2, 3.1, 4.2, x, towerBaseY + 1.4, z, waterTankBlueMat, false);
      addBlock(4.5, 0.28, 4.5, x, towerBaseY + 4.5, z, concreteMat, false);
    }
  };

  // ============================================================================
  // 1. PISO DO COMPLEXO (110m × 110m) & QUADRA POLIESPORTIVA CENTRAL (BOMBSITE A)
  // ============================================================================
  const mainFloorGeo = new THREE.PlaneGeometry(110, 110);
  disposableGeometries.push(mainFloorGeo);
  const mainFloor = new THREE.Mesh(mainFloorGeo, complexGroundMat);
  mainFloor.rotation.x = -Math.PI / 2;
  mainFloor.receiveShadow = !isSoftwareGl;
  mapGroup.add(mainFloor);
  shootableMeshes.push(mainFloor);

  // Quadra Poliesportiva Comunitária no Pátio Central (22m × 44m, x = -11..+11, z = -22..+22)
  const courtGeo = new THREE.PlaneGeometry(22, 44);
  disposableGeometries.push(courtGeo);
  const courtMesh = new THREE.Mesh(courtGeo, courtFloorMat);
  courtMesh.rotation.x = -Math.PI / 2;
  courtMesh.position.set(0, 0.02, 0);
  courtMesh.receiveShadow = !isSoftwareGl;
  mapGroup.add(courtMesh);

  // Traves de Futsal 3D e Tabelas de Basquete nas extremidades Norte (z = -20.2) e Sul (z = +20.2) da Quadra
  const buildCourtGoalAndHoop = (gz: number, dirZ: number) => {
    // Postes e travessão do gol de futsal
    addBlock(0.18, 2.1, 0.18, -1.8, 0, gz, goalPostWhiteMat, true);
    addBlock(0.18, 2.1, 0.18, 1.8, 0, gz, goalPostWhiteMat, true);
    addBlock(3.78, 0.18, 0.18, 0, 2.0, gz, goalPostWhiteMat, false);
    // Suporte traseiro da rede
    addBlock(0.12, 2.0, 0.9, -1.8, 0, gz + dirZ * 0.45, darkMetalMat, false);
    addBlock(0.12, 2.0, 0.9, 1.8, 0, gz + dirZ * 0.45, darkMetalMat, false);
    addBlock(3.7, 0.12, 0.12, 0, 0.1, gz + dirZ * 0.9, darkMetalMat, false);
    // Haste e tabela de basquete 3D
    addBlock(0.26, 3.8, 0.26, 0, 0, gz + dirZ * 1.15, darkMetalMat, true);
    addBlock(0.22, 0.22, 1.1, 0, 3.55, gz + dirZ * 0.65, darkMetalMat, false);
    addBlock(1.85, 1.15, 0.12, 0, 3.15, gz + dirZ * 0.12, goalPostWhiteMat, false);
    addBlock(0.55, 0.1, 0.55, 0, 3.25, gz - dirZ * 0.2, awningOrangeMat, false);
  };
  buildCourtGoalAndHoop(-20.2, -1);
  buildCourtGoalAndHoop(20.2, 1);

  // ============================================================================
  // 2. ANEL PERIMETRAL URBANO 360° DO CONJUNTO HABITACIONAL (±55m)
  // ============================================================================
  // Muros perimetrais de fechamento físico em ±54.25m
  addBlock(110, 9.5, 1.5, 0, 0, -54.25, brickWallMat, true); // Norte
  addBlock(110, 9.5, 1.5, 0, 0, 54.25, brickWallMat, true);  // Sul
  addBlock(1.5, 9.5, 110, -54.25, 0, 0, brickWallMat, true); // Oeste
  addBlock(1.5, 9.5, 110, 54.25, 0, 0, brickWallMat, true);  // Leste

  // Blocos Residenciais Perimetrais formando o Skyline 360° da Zona Norte
  // Setor Norte (atrás da Base TR, z = -51.5)
  addHousingBlock3D({ w: 22, h: 16.5, d: 6.5, x: -34, z: -51.2, wallMat: housingOchreMat, balconySide: 'south' });
  addHousingBlock3D({ w: 24, h: 18.0, d: 6.5, x: 0, z: -51.2, wallMat: housingTerracottaMat, balconySide: 'south' });
  addHousingBlock3D({ w: 22, h: 16.5, d: 6.5, x: 34, z: -51.2, wallMat: housingBlueMat, balconySide: 'south' });

  // Setor Sul (atrás da Base CT, z = +51.5)
  addHousingBlock3D({ w: 22, h: 16.5, d: 6.5, x: -34, z: 51.2, wallMat: housingSageMat, balconySide: 'north' });
  addHousingBlock3D({ w: 24, h: 18.0, d: 6.5, x: 0, z: 51.2, wallMat: housingOchreMat, balconySide: 'north' });
  addHousingBlock3D({ w: 22, h: 16.5, d: 6.5, x: 34, z: 51.2, wallMat: housingTerracottaMat, balconySide: 'north' });

  // Setor Extremo Oeste (ao longo do Beco Tático Oeste, x = -50.8)
  addHousingBlock3D({ w: 6.5, h: 15.5, d: 22, x: -50.8, z: -27, wallMat: housingTerracottaMat, balconySide: 'east' });
  addHousingBlock3D({ w: 6.5, h: 17.0, d: 18, x: -50.8, z: 0, wallMat: housingBlueMat, balconySide: 'east' });
  addHousingBlock3D({ w: 6.5, h: 15.5, d: 22, x: -50.8, z: 27, wallMat: housingOchreMat, balconySide: 'east' });

  // Setor Extremo Leste (ao longo do Pátio das Garagens Leste, x = +50.8)
  addHousingBlock3D({ w: 6.5, h: 15.5, d: 22, x: 50.8, z: -27, wallMat: housingSageMat, balconySide: 'west' });
  addHousingBlock3D({ w: 6.5, h: 17.5, d: 18, x: 50.8, z: 0, wallMat: housingOchreMat, balconySide: 'west' });
  addHousingBlock3D({ w: 6.5, h: 15.5, d: 22, x: 50.8, z: 27, wallMat: housingBlueMat, balconySide: 'west' });

  // ============================================================================
  // 3. ROTA 1 (OESTE): BLOCOS A-01 & C-03, BECO OESTE E RUA DO MERCADINHO
  // ============================================================================
  // Bloco A-01 (Noroeste: x = -35.5..-23.5, z = -34.0..-8.0)
  // Deixa o Beco Tático Extremo Oeste em x = -47.0..-36.0 e a Rua do Mercadinho em x = -23.0..-15.0
  addHousingBlock3D({
    w: 12.0,
    h: 15.5,
    d: 26.0,
    x: -29.5,
    z: -21.0,
    wallMat: housingOchreMat,
    balconySide: 'both_ew',
    hasWaterTower: true,
    hasStructuredRoof: true,
  });
  // Comércio térreo no Bloco A-01: Mercadinho & Padaria do Complexo + Barbearia
  addBlock(0.25, 1.35, 8.2, -23.3, 3.8, -24.5, signMercadoMat, false);
  addBlock(0.25, 1.35, 7.2, -23.3, 3.8, -13.5, signBarbeariaMat, false);
  addBlock(7.5, 1.3, 0.25, -29.5, 11.2, -7.85, signBlocoAMat, false);
  // Portas de aço de enrolar e marquise com toldo laranja na Rua do Mercadinho
  addBlock(0.18, 2.9, 5.5, -23.4, 0, -24.5, steelShutterMat, false);
  addBlock(0.18, 2.9, 5.0, -23.4, 0, -13.5, steelShutterMat, false);
  addBlock(2.8, 0.35, 24.0, -22.1, 3.35, -21.0, darkConcreteMat, false);
  addBlock(2.2, 0.22, 8.6, -21.8, 3.15, -24.5, awningOrangeMat, false);

  // Bloco C-03 (Sudoeste: x = -35.5..-23.5, z = +8.0..+34.0)
  addHousingBlock3D({
    w: 12.0,
    h: 15.5,
    d: 26.0,
    x: -29.5,
    z: 21.0,
    wallMat: housingTerracottaMat,
    balconySide: 'both_ew',
    hasWaterTower: true,
    hasStructuredRoof: true,
  });
  // Comércio térreo no Bloco C-03: Lan House & Bar do Pátio
  addBlock(0.25, 1.35, 8.6, -23.3, 3.8, 21.0, signLanHouseMat, false);
  addBlock(7.5, 1.3, 0.25, -29.5, 11.2, 7.85, signBlocoCMat, false);
  addBlock(0.18, 2.9, 6.2, -23.4, 0, 21.0, steelShutterMat, false);
  addBlock(2.8, 0.35, 24.0, -22.1, 3.35, 21.0, darkConcreteMat, false);
  addBlock(2.2, 0.22, 8.8, -21.8, 3.15, 21.0, awningBlueMat, false);

  // Ponte Residencial Suspensa conectando Bloco A-01 e Bloco C-03 (z = -8.0..+8.0, y = 4.4..14.2m — passagem livre por baixo!)
  addBlock(10.5, 9.8, 16.0, -29.5, 4.4, 0, housingOchreMat, false);
  addBlock(11.0, 0.35, 16.2, -29.5, 4.2, 0, darkConcreteMat, false);

  // Coberturas Táticas no Beco Extremo Oeste (x = -42.0) e na Passagem Sob a Ponte (x = -29.5, z = 0)
  addBlock(2.4, 1.3, 3.2, -42.0, 0, -26.0, dumpsterAmberMat, true);
  addBlock(2.2, 1.35, 2.4, -41.5, 0, -11.5, woodCrateMat, true);
  addBlock(2.6, 1.4, 2.6, -29.5, 0, 0, brickWallMat, true);
  addBlock(2.2, 1.35, 2.4, -41.5, 0, 11.5, woodCrateMat, true);
  addBlock(2.4, 1.3, 3.2, -42.0, 0, 26.0, dumpsterAmberMat, true);

  // Coberturas Táticas na Rua do Mercadinho (x = -19.0)
  addBlock(2.2, 1.25, 2.2, -19.2, 0, -28.0, woodCrateMat, true);
  addBlock(2.6, 1.3, 1.8, -18.8, 0, -13.0, dumpsterAmberMat, true);
  addBlock(2.6, 1.3, 1.8, -18.8, 0, 13.0, dumpsterAmberMat, true);
  addBlock(2.2, 1.25, 2.2, -19.2, 0, 28.0, woodCrateMat, true);

  // ============================================================================
  // 4. ROTA 3 (LESTE) & BOMBSITE B: BLOCOS EM PILOTIS & OFICINA COLETIVA
  // ============================================================================
  // Bloco B-02 (Nordeste: x = +22.5..+34.5, z = -34.0..-9.5) — SUSPENSO EM PILOTIS (térreo aberto y = 0..3.8m)
  addHousingBlock3D({
    w: 12.0,
    h: 11.8,
    d: 24.5,
    x: 28.5,
    yBase: 3.8,
    z: -21.75,
    wallMat: housingBlueMat,
    collidable: false,
    balconySide: 'both_ew',
    hasWaterTower: true,
    hasStructuredRoof: true,
  });
  // Laje inferior estrutural do pilotis do Bloco B-02
  addBlock(12.4, 0.35, 24.9, 28.5, 3.55, -21.75, darkConcreteMat, false);
  addBlock(0.25, 1.3, 7.6, 22.3, 4.4, -21.75, signGaragemMat, false);
  addBlock(7.5, 1.3, 0.25, 28.5, 11.5, -9.35, signBlocoBMat, false);

  // Bloco D-04 (Sudeste: x = +22.5..+34.5, z = +9.5..+34.0) — SUSPENSO EM PILOTIS (térreo aberto y = 0..3.8m)
  addHousingBlock3D({
    w: 12.0,
    h: 11.8,
    d: 24.5,
    x: 28.5,
    yBase: 3.8,
    z: 21.75,
    wallMat: housingSageMat,
    collidable: false,
    balconySide: 'both_ew',
    hasWaterTower: true,
    hasStructuredRoof: true,
  });
  addBlock(12.4, 0.35, 24.9, 28.5, 3.55, 21.75, darkConcreteMat, false);
  addBlock(0.25, 1.3, 7.6, 22.3, 4.4, 21.75, signGaragemMat, false);
  addBlock(7.5, 1.3, 0.25, 28.5, 11.5, 9.35, signBlocoDMat, false);

  // Colunas de Concreto Armado (Pilotis) sustentando os Blocos B-02 e D-04 (x = 23.4 e x = 33.6)
  [-32.5, -25.5, -18.0, -10.8, 10.8, 18.0, 25.5, 32.5].forEach((pz) => {
    addBlock(1.15, 3.8, 1.15, 23.4, 0, pz, darkConcreteMat, true);
    addBlock(1.15, 3.8, 1.15, 33.6, 0, pz, darkConcreteMat, true);
  });

  // Muretas divisórias internas nas garagens cobertas para tiroteio tático entre colunas
  addBlock(5.2, 1.45, 0.55, 28.5, 0, -28.8, brickWallMat, true);
  addBlock(4.8, 2.2, 0.55, 28.5, 0, -14.5, brickWallMat, true);
  addBlock(4.8, 2.2, 0.55, 28.5, 0, 14.5, brickWallMat, true);
  addBlock(5.2, 1.45, 0.55, 28.5, 0, 28.8, brickWallMat, true);

  // Pavilhão da Oficina Mecânica Coletiva a Leste do Pátio das Garagens (x = 42.5, z = -4.0)
  addBlock(7.2, 4.8, 16.5, 42.5, 0, -4.0, brickWallMat, true);
  addBlock(7.8, 0.45, 17.2, 42.5, 4.8, -4.0, galvanizedRoofMat, false);
  addBlock(0.2, 3.1, 6.2, 38.82, 0, -4.0, steelShutterMat, false);
  addBlock(0.25, 1.3, 7.8, 38.8, 3.5, -4.0, signGaragemMat, false);

  // DEMARCAÇÃO TÁTICA DO BOMBSITE B — PÁTIO DAS GARAGENS EM PILOTIS & OFICINA (x = +28.5, z = -1.5, 12m × 12m)
  const siteBFloorGeo = new THREE.PlaneGeometry(12.0, 12.0);
  disposableGeometries.push(siteBFloorGeo);
  const siteBFloor = new THREE.Mesh(siteBFloorGeo, bombsiteBFloorMat);
  siteBFloor.rotation.x = -Math.PI / 2;
  siteBFloor.position.set(28.5, 0.03, 0);
  siteBFloor.receiveShadow = !isSoftwareGl;
  mapGroup.add(siteBFloor);

  // Totem e Placa Vertical Indicativa do BOMBSITE B
  addBlock(0.35, 3.8, 0.35, 21.8, 0, -5.2, darkMetalMat, true);
  addBlock(4.6, 1.25, 0.24, 21.8, 2.8, -5.2, signBombsiteBMat, false);
  // Coberturas de plant/defuse no Bombsite B (Bancada de oficina, pilhas de pneus e caixas)
  addBlock(2.6, 1.35, 1.8, 28.5, 0, -1.2, woodCrateMat, true);
  addBlock(1.4, 1.4, 1.4, 32.2, 0, 2.8, tireRubberMat, true);
  addBlock(1.4, 1.1, 1.4, 24.8, 0, -3.2, tireRubberMat, true);

  // Veículos Estacionados nas Garagens em Pilotis e nas Ruas Internas
  const buildParkedVehicle = (vx: number, vz: number, bodyMat: THREE.Material, isVan: boolean) => {
    if (isVan) {
      addBlock(2.25, 2.0, 5.0, vx, 0.25, vz, bodyMat, true);
      addBlock(2.28, 0.68, 1.65, vx, 1.38, vz + 1.45, glassDarkMat, false);
    } else {
      addBlock(2.05, 0.88, 4.4, vx, 0.22, vz, bodyMat, true);
      addBlock(1.85, 0.68, 2.3, vx, 1.08, vz, glassDarkMat, true);
    }
    addBlock(2.2, 0.52, 0.82, vx, 0, vz - 1.42, darkMetalMat, false);
    addBlock(2.2, 0.52, 0.82, vx, 0, vz + 1.42, darkMetalMat, false);
  };
  // Furgão branco no pátio do Bombsite B, carros sob os pilotis e táxi na Rua do Mercadinho
  buildParkedVehicle(35.8, 5.5, vanWhiteMat, true);
  buildParkedVehicle(28.5, -21.5, carSilverMat, false);
  buildParkedVehicle(28.5, 21.5, carRedMat, false);
  buildParkedVehicle(-18.5, 0.0, carYellowMat, false);

  // ============================================================================
  // 5. ROTA 2 (MEIO): BOMBSITE A NA QUADRA CENTRAL & PASSARELA COM MIRANTE COBERTO (+2.6m)
  // ============================================================================
  // DEMARCAÇÃO TÁTICA DO BOMBSITE A — QUADRA POLIESPORTIVA CENTRAL (x = 0, z = -5.5, 13m × 13m)
  const siteAFloorGeo = new THREE.PlaneGeometry(13.0, 13.0);
  disposableGeometries.push(siteAFloorGeo);
  const siteAFloor = new THREE.Mesh(siteAFloorGeo, bombsiteAFloorMat);
  siteAFloor.rotation.x = -Math.PI / 2;
  siteAFloor.position.set(0, 0.035, -5.8);
  siteAFloor.receiveShadow = !isSoftwareGl;
  mapGroup.add(siteAFloor);

  // Totens e Placas Verticais Indicativas do BOMBSITE A na Quadra e na Passarela
  addBlock(0.35, 3.8, 0.35, -7.8, 0, -11.5, darkMetalMat, true);
  addBlock(4.8, 1.25, 0.24, -7.8, 2.8, -11.5, signBombsiteAMat, false);

  // Coberturas Táticas de Plant/Defuse dentro da Quadra Central (Bombsite A)
  addBlock(2.8, 1.35, 1.9, -3.6, 0, -6.2, woodCrateMat, true);
  addBlock(2.8, 1.35, 1.9, 3.8, 0, -5.2, dumpsterAmberMat, true);
  addBlock(2.4, 1.25, 2.2, -4.2, 0, 7.5, dumpsterAmberMat, true);
  addBlock(2.4, 1.25, 2.2, 4.2, 0, 7.5, woodCrateMat, true);

  // A. Varanda Tática Oeste (x = -15.0..-10.0, z = -8.0..+8.0, h = 2.6m)
  addBlock(5.0, 2.6, 16.0, -12.5, 0, 0, darkConcreteMat, true);
  addBlock(4.8, 0.08, 15.8, -12.5, 2.58, 0, concreteMat, false);
  elevationZones.push({
    minX: -15.0,
    maxX: -10.0,
    minZ: -8.0,
    maxZ: 8.0,
    minHeight: 2.6,
    maxHeight: 2.6,
    type: 'platform',
  });
  // Parapeitos e abrigos na Varanda Oeste (+2.6m)
  addBlock(0.4, 1.1, 15.6, -14.8, 2.6, 0, brickWallMat, true);
  addBlock(0.4, 1.1, 4.8, -10.2, 2.6, -5.2, brickWallMat, true);
  addBlock(0.4, 1.1, 4.8, -10.2, 2.6, 5.2, brickWallMat, true);

  // Escadaria Noroeste (z = -14.0 no chão até z = -8.0 em y = 2.6m -> ramp_south)
  const stairSteps = 10;
  for (let i = 0; i < stairSteps; i++) {
    const sh = ((i + 1) / stairSteps) * 2.6;
    const sz = -14.0 + (i + 0.5) * (6.0 / stairSteps);
    addBlock(3.4, sh, 6.0 / stairSteps, -12.5, 0, sz, concreteMat, false);
    // Guarda-corpo escalonado lateral
    addBlock(0.14, sh + 0.75, (6.0 / stairSteps) * 0.9, -14.1, 0, sz, darkMetalMat, false);
  }
  elevationZones.push({
    minX: -14.2,
    maxX: -10.8,
    minZ: -14.1,
    maxZ: -7.9,
    minHeight: 0,
    maxHeight: 2.6,
    type: 'ramp_south',
  });

  // Escadaria Sudoeste (z = +14.0 no chão até z = +8.0 em y = 2.6m -> ramp_north)
  for (let i = 0; i < stairSteps; i++) {
    const sh = ((i + 1) / stairSteps) * 2.6;
    const sz = 14.0 - (i + 0.5) * (6.0 / stairSteps);
    addBlock(3.4, sh, 6.0 / stairSteps, -12.5, 0, sz, concreteMat, false);
    addBlock(0.14, sh + 0.75, (6.0 / stairSteps) * 0.9, -14.1, 0, sz, darkMetalMat, false);
  }
  elevationZones.push({
    minX: -14.2,
    maxX: -10.8,
    minZ: 7.9,
    maxZ: 14.1,
    minHeight: 0,
    maxHeight: 2.6,
    type: 'ramp_north',
  });

  // B. Varanda Tática Leste (x = +10.0..+15.0, z = -8.0..+8.0, h = 2.6m)
  addBlock(5.0, 2.6, 16.0, 12.5, 0, 0, darkConcreteMat, true);
  addBlock(4.8, 0.08, 15.8, 12.5, 2.58, 0, concreteMat, false);
  elevationZones.push({
    minX: 10.0,
    maxX: 15.0,
    minZ: -8.0,
    maxZ: 8.0,
    minHeight: 2.6,
    maxHeight: 2.6,
    type: 'platform',
  });
  // Parapeitos e abrigos na Varanda Leste (+2.6m)
  addBlock(0.4, 1.1, 15.6, 14.8, 2.6, 0, brickWallMat, true);
  addBlock(0.4, 1.1, 4.8, 10.2, 2.6, -5.2, brickWallMat, true);
  addBlock(0.4, 1.1, 4.8, 10.2, 2.6, 5.2, brickWallMat, true);

  // Escadaria Nordeste (z = -14.0 no chão até z = -8.0 em y = 2.6m -> ramp_south)
  for (let i = 0; i < stairSteps; i++) {
    const sh = ((i + 1) / stairSteps) * 2.6;
    const sz = -14.0 + (i + 0.5) * (6.0 / stairSteps);
    addBlock(3.4, sh, 6.0 / stairSteps, 12.5, 0, sz, concreteMat, false);
    addBlock(0.14, sh + 0.75, (6.0 / stairSteps) * 0.9, 14.1, 0, sz, darkMetalMat, false);
  }
  elevationZones.push({
    minX: 10.8,
    maxX: 14.2,
    minZ: -14.1,
    maxZ: -7.9,
    minHeight: 0,
    maxHeight: 2.6,
    type: 'ramp_south',
  });

  // Escadaria Sudeste (z = +14.0 no chão até z = +8.0 em y = 2.6m -> ramp_north)
  for (let i = 0; i < stairSteps; i++) {
    const sh = ((i + 1) / stairSteps) * 2.6;
    const sz = 14.0 - (i + 0.5) * (6.0 / stairSteps);
    addBlock(3.4, sh, 6.0 / stairSteps, 12.5, 0, sz, concreteMat, false);
    addBlock(0.14, sh + 0.75, (6.0 / stairSteps) * 0.9, 14.1, 0, sz, darkMetalMat, false);
  }
  elevationZones.push({
    minX: 10.8,
    maxX: 14.2,
    minZ: 7.9,
    maxZ: 14.1,
    minHeight: 0,
    maxHeight: 2.6,
    type: 'ramp_north',
  });

  // C. Passarela Aérea Central (+2.6m) com MIRANTE CENTRAL COBERTO (x = -10.0..+10.0, z = -2.4..+2.4)
  // Passagem livre por baixo na Quadra Poliesportiva!
  addBlock(20.0, 0.32, 4.8, 0, 2.28, 0, concreteMat, false);
  // Pilares estruturais sob a passarela
  addBlock(1.2, 2.28, 1.2, -4.8, 0, 0, darkConcreteMat, true);
  addBlock(1.2, 2.28, 1.2, 4.8, 0, 0, darkConcreteMat, true);

  // Guarda-corpos táticos intercalados na passarela (permitem cover agachado e visão para o Bombsite A)
  addBlock(6.2, 1.08, 0.28, -5.8, 2.6, -2.22, darkMetalMat, true);
  addBlock(6.2, 1.08, 0.28, 5.8, 2.6, -2.22, darkMetalMat, true);
  addBlock(6.2, 1.08, 0.28, -5.8, 2.6, 2.22, darkMetalMat, true);
  addBlock(6.2, 1.08, 0.28, 5.8, 2.6, 2.22, darkMetalMat, true);

  // MIRANTE CENTRAL COBERTO no meio da Passarela Aérea (x = -3.8..+3.8, z = -2.5..+2.5, teto em y = 5.45m)
  [
    [-3.5, -2.15],
    [3.5, -2.15],
    [-3.5, 2.15],
    [3.5, 2.15],
  ].forEach(([px, pz]) => {
    addBlock(0.24, 2.85, 0.24, px, 2.6, pz, darkMetalMat, true);
  });
  // Muretas táticas baixas no Mirante Central (+2.6m)
  addBlock(3.2, 1.05, 0.32, 0, 2.6, -2.22, brickWallMat, true);
  addBlock(3.2, 1.05, 0.32, 0, 2.6, 2.22, brickWallMat, true);
  // Cobertura metálica em duas águas do Mirante Central + Placa suspensa do Bombsite A
  addBlock(8.2, 0.28, 5.4, 0, 5.45, 0, galvanizedRoofMat, false);
  addBlock(6.4, 0.32, 3.8, 0, 5.73, 0, terracottaRoofMat, false);
  addBlock(5.2, 0.95, 0.22, 0, 4.5, -2.55, signBombsiteAMat, false);

  elevationZones.push({
    minX: -10.1,
    maxX: 10.1,
    minZ: -2.4,
    maxZ: 2.4,
    minHeight: 2.6,
    maxHeight: 2.6,
    type: 'platform',
  });

  // ============================================================================
  // 6. BASES DE SPAWN PROTEGIDAS (NORTE / SUL), CANTEIROS & FIAÇÃO AÉREA
  // ============================================================================
  // Terminal Comunitário & Guarita Sul (protege o spawn da PM em z = +46.5m)
  addBlock(14.5, 3.5, 3.2, 0, 0, 36.5, brickWallMat, true);
  addBlock(15.4, 0.4, 4.2, 0, 3.5, 36.5, darkConcreteMat, false);
  addBlock(3.2, 1.3, 2.2, -11.5, 0, 41.0, woodCrateMat, true);
  addBlock(3.2, 1.3, 2.2, 11.5, 0, 41.0, dumpsterAmberMat, true);

  // Terminal Comunitário & Guarita Norte (protege o spawn dos Bandidos em z = -46.5m)
  addBlock(14.5, 3.5, 3.2, 0, 0, -36.5, brickWallMat, true);
  addBlock(15.4, 0.4, 4.2, 0, 3.5, -36.5, darkConcreteMat, false);
  addBlock(3.2, 1.3, 2.2, -11.5, 0, -41.0, dumpsterAmberMat, true);
  addBlock(3.2, 1.3, 2.2, 11.5, 0, -41.0, woodCrateMat, true);

  // Canteiros arborizados do Conjunto Habitacional nos 4 cantos do Pátio Central
  [
    [-16.0, -37.5],
    [16.0, -37.5],
    [-16.0, 37.5],
    [16.0, 37.5],
  ].forEach(([tx, tz]) => {
    addBlock(2.8, 0.65, 2.8, tx, 0, tz, brickWallMat, true);
    addBlock(0.55, 3.2, 0.55, tx, 0.65, tz, woodRafterMat, true);
    addBlock(3.4, 2.4, 3.4, tx, 3.4, tz, foliageMat, false);
    addBlock(2.2, 1.5, 2.2, tx, 5.4, tz, foliageMat, false);
  });

  // Fiação elétrica aérea cruzando os blocos do Complexo
  const addOverheadWire = (p1: [number, number, number], p2: [number, number, number]) => {
    const start = new THREE.Vector3(...p1);
    const end = new THREE.Vector3(...p2);
    const mid = start.clone().lerp(end, 0.5);
    mid.y -= 0.9;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(12);
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    disposableGeometries.push(geo);
    const line = new THREE.Line(geo, wireMat);
    mapGroup.add(line);
  };
  addOverheadWire([-23.5, 9.2, -22], [22.5, 9.2, -22]);
  addOverheadWire([-23.5, 9.2, 22], [22.5, 9.2, 22]);
  addOverheadWire([-23.5, 9.6, 0], [22.5, 9.6, 0]);
  addOverheadWire([-47.5, 8.8, -18], [-35.5, 8.8, -18]);
  addOverheadWire([34.5, 8.8, 18], [47.5, 8.8, 18]);

  return {
    id: 'complexo',
    mapGroup,
    shootableMeshes,
    colliders,
    elevationZones,
    ctSpawns: [
      [-14, 0, 46.5],
      [-6, 0, 46.5],
      [6, 0, 46.5],
      [14, 0, 46.5],
      [0, 0, 44.0],
    ],
    trSpawns: [
      [-14, 0, -46.5],
      [-6, 0, -46.5],
      [6, 0, -46.5],
      [14, 0, -46.5],
      [0, 0, -44.0],
    ],
    playerCtSpawn: { pos: [0, 1.72, 47.0], yaw: 0 },
    playerTrSpawn: { pos: [0, 1.72, -47.0], yaw: Math.PI },
    // 38 Waypoints 3D cobrindo as 5 rotas do Complexo (110m × 110m), Bombsites A/B e Passarela (+2.6m)
    waypoints: [
      // Rota 1A: Beco Tático Extremo Oeste (x = -41.5m)
      [-41.5, 0, 38.0],
      [-41.5, 0, 20.0],
      [-41.5, 0, 0.0],
      [-41.5, 0, -20.0],
      [-41.5, 0, -38.0],
      // Passagem sob a ponte entre Bloco A-01 e C-03
      [-33.0, 0, 0.0],
      [-25.0, 0, 0.0],
      // Rota 1B: Rua do Mercadinho & Lan House (x = -18.5m)
      [-18.5, 0, 38.0],
      [-18.5, 0, 22.0],
      [-18.5, 0, 8.0],
      [-18.5, 0, -8.0],
      [-18.5, 0, -22.0],
      [-18.5, 0, -38.0],
      // Rota 2: Pátio Central & Quadra Poliesportiva (BOMBSITE A)
      [-6.5, 0, 30.0],
      [6.5, 0, 30.0],
      [0.0, 0, 16.0],
      [-5.5, 0, 4.5],
      [5.5, 0, 4.5],
      [0.0, 0, -5.8], // Centro do Bombsite A
      [-6.0, 0, -14.0],
      [6.0, 0, -14.0],
      [0.0, 0, -28.0],
      // Rota 2 Superior: Escadarias, Varandas e Mirante Coberto da Passarela Aérea (+2.6m)
      [-12.5, 1.3, 11.0],
      [-12.5, 2.6, 0.0],
      [-12.5, 1.3, -11.0],
      [-4.5, 2.6, 0.0],
      [0.0, 2.6, 0.0], // Mirante Central Coberto (+2.6m)
      [4.5, 2.6, 0.0],
      [12.5, 1.3, 11.0],
      [12.5, 2.6, 0.0],
      [12.5, 1.3, -11.0],
      // Rota 3: Garagens Coletivas em Pilotis & Oficina Mecânica (BOMBSITE B)
      [18.5, 0, 36.0],
      [28.5, 0, 25.0],
      [18.5, 0, 12.0],
      [28.5, 0, 5.5],
      [28.5, 0, 0.0], // Centro do Bombsite B (Pátio das Garagens em Pilotis)
      [28.5, 0, -6.5],
      [18.5, 0, -12.0],
      [28.5, 0, -25.0],
      [18.5, 0, -36.0],
    ],
    skyColor: 0x60a5fa,
    fogColor: 0xdbeafe,
    fogDensity: 0.0052,
    hemiSkyColor: 0xf8fafc,
    hemiGroundColor: 0x94a3b8,
    hemiIntensity: 0.95,
    sunColor: 0xffedd5,
    sunIntensity: 1.55,
    sunPosition: [46, 68, -32],
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
