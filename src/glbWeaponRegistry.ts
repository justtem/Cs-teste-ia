import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type GlbAccessoryFile =
  | 'Scope.glb'
  | 'Bipod.glb'
  | 'Tripod.glb'
  | 'Bayonet.glb';

export type GlbWeaponFile =
  | 'Assault Rifle-Bgvuu4CUMV.glb'
  | 'Assault Rifle-fpLucho45C.glb'
  | 'Assault Rifle.glb'
  | 'Bayonet.glb'
  | 'Bipod.glb'
  | 'Bullpup.glb'
  | 'Pistol-52kQzphmeF.glb'
  | 'Pistol-J3i9KDQ3kt.glb'
  | 'Pistol-Z7aOjJu583.glb'
  | 'Pistol.glb'
  | 'Revolver-9C26wSpMS0.glb'
  | 'Revolver-XrnLUz6kQj.glb'
  | 'Revolver.glb'
  | 'Scope.glb'
  | 'Shotgun Sawed Off.glb'
  | 'Shotgun Short Stock.glb'
  | 'Shotgun-ZmPTnh7njL.glb'
  | 'Shotgun.glb'
  | 'Sniper Rifle-ASOMZIErq3.glb'
  | 'Sniper Rifle-TKaBjAEofL.glb'
  | 'Sniper Rifle-i65hEldsw6.glb'
  | 'Sniper Rifle.glb'
  | 'Submachine Gun-nsP3JukU73.glb'
  | 'Submachine Gun.glb'
  | 'Tripod.glb';

export type FirstPersonGripStyle =
  | 'melee_knife'
  | 'pistol_two_hand'
  | 'revolver_two_hand'
  | 'smg_foregrip'
  | 'shotgun_pump'
  | 'rifle_handguard'
  | 'bullpup_grip'
  | 'sniper_precision';

export interface GlbAccessoryAttachmentConfig {
  file: GlbAccessoryFile;
  /** Escala relativa ao comprimento normalizado da arma (fração de 0.08 a 0.25) */
  relativeScale: number;
  /** Offset normalizado [x: ao longo do cano (-0.5..+0.5), y: altura, z: lateral] */
  normalizedOffset: [number, number, number];
  /** Rotação adicional em radianos [rx, ry, rz] */
  rotation?: [number, number, number];
}

export interface WeaponGlbVisualConfig {
  weaponId: string;
  glbFile: GlbWeaponFile;
  /** Categoria de empunhadura para posicionamento anatômico das mãos e braços */
  gripStyle: FirstPersonGripStyle;
  /** Comprimento alvo em metros na câmera de 1ª pessoa (enquadramento competitivo estilo CS) */
  fpTargetLength: number;
  /** Posição do centro geométrico do modelo GLB no weaponGroup de 1ª pessoa [x, y, z] */
  fpPosition: [number, number, number];
  /** Rotação em radianos no weaponGroup de 1ª pessoa [rx, ry, rz] */
  fpRotation: [number, number, number];
  /**
   * Coordenada normalizada [nx, ny] (em unidades de fpTargetLength a partir do centro do GLB)
   * onde a mão principal (direita) envolve o punho traseiro (pistol grip / cabo).
   */
  fpRightGripNorm: [number, number];
  /**
   * Coordenada normalizada [nx, ny] onde a mão secundária (esquerda) apoia o guarda-mão,
   * telha pump-action ou envolve o punho nas pistolas/revólveres (null para faca).
   */
  fpLeftGripNorm: [number, number] | null;
  /** Posição exata do clarão de disparo (muzzleFlashMesh) em 1ª pessoa [x, y, z] */
  fpMuzzlePos: [number, number, number];
  /** Comprimento alvo em metros nas mãos dos bots em 3ª pessoa */
  tpTargetLength: number;
  /** Posição local nas mãos do bot em 3ª pessoa [x, y, z] */
  tpOffset: [number, number, number];
  /** Tint opcional para diferenciar variantes que compartilham geometria base */
  metalTintHex?: number;
  /** Acessórios 3D do pacote acoplados modularmente à arma (sem Bayonet em fuzis) */
  attachments?: GlbAccessoryAttachmentConfig[];
}

export interface GlbModelMetadata {
  file: GlbWeaponFile;
  category:
    | 'Pistolas'
    | 'Revólveres'
    | 'Submetralhadoras'
    | 'Fuzis de Assalto'
    | 'Escopetas'
    | 'Rifles de Precisão'
    | 'Acessórios & Equipamentos';
  dimensionsMeters: [number, number, number];
  vertices: number;
  triangles: number;
  materials: string[];
  usedByWeapons: string[];
}

/**
 * Manifesto técnico completo dos 25 modelos 3D GLB do Ultimate Guns Pack (Quaternius)
 */
export const ULTIMATE_GUNS_GLB_MANIFEST: GlbModelMetadata[] = [
  {
    file: 'Pistol.glb',
    category: 'Pistolas',
    dimensionsMeters: [1.819, 1.162, 0.323],
    vertices: 2000,
    triangles: 1040,
    materials: ['DarkWood', 'Metal', 'Black', 'DarkMetal', 'Black2'],
    usedByWeapons: ['glock17'],
  },
  {
    file: 'Pistol-52kQzphmeF.glb',
    category: 'Pistolas',
    dimensionsMeters: [2.447, 1.162, 0.309],
    vertices: 3372,
    triangles: 1878,
    materials: ['Metal', 'Black', 'LightMetal'],
    usedByWeapons: ['usp', 'th9'],
  },
  {
    file: 'Pistol-J3i9KDQ3kt.glb',
    category: 'Pistolas',
    dimensionsMeters: [1.819, 1.199, 0.274],
    vertices: 1840,
    triangles: 968,
    materials: ['Metal', 'Black', 'LightMetal'],
    usedByWeapons: ['glock19', 'pt92'],
  },
  {
    file: 'Pistol-Z7aOjJu583.glb',
    category: 'Pistolas',
    dimensionsMeters: [1.845, 1.293, 0.329],
    vertices: 2756,
    triangles: 1442,
    materials: ['Wood', 'Metal', 'Black', 'LightMetal'],
    usedByWeapons: ['deagle'],
  },
  {
    file: 'Revolver.glb',
    category: 'Revólveres',
    dimensionsMeters: [1.982, 0.89, 0.294],
    vertices: 2005,
    triangles: 1046,
    materials: ['Metal', 'Wood', 'LightMetal'],
    usedByWeapons: ['revolver_38'],
  },
  {
    file: 'Revolver-9C26wSpMS0.glb',
    category: 'Revólveres',
    dimensionsMeters: [1.985, 0.982, 0.294],
    vertices: 2771,
    triangles: 1434,
    materials: ['DarkWood', 'Metal', 'Grey', 'LightMetal'],
    usedByWeapons: ['revolver_357'],
  },
  {
    file: 'Revolver-XrnLUz6kQj.glb',
    category: 'Revólveres',
    dimensionsMeters: [1.901, 0.963, 0.294],
    vertices: 2583,
    triangles: 1334,
    materials: ['Grey', 'LightMetal', 'Metal'],
    usedByWeapons: ['revolver_44'],
  },
  {
    file: 'Submachine Gun.glb',
    category: 'Submetralhadoras',
    dimensionsMeters: [4.044, 1.847, 0.319],
    vertices: 2411,
    triangles: 1374,
    materials: ['DarkMetal', 'Metal', 'Black', 'Grey'],
    usedByWeapons: ['mp5'],
  },
  {
    file: 'Submachine Gun-nsP3JukU73.glb',
    category: 'Submetralhadoras',
    dimensionsMeters: [3.998, 1.523, 0.319],
    vertices: 2870,
    triangles: 1566,
    materials: ['DarkMetal', 'Metal', 'Black', 'Grey'],
    usedByWeapons: ['smg_tactical'],
  },
  {
    file: 'Assault Rifle.glb',
    category: 'Fuzis de Assalto',
    dimensionsMeters: [5.422, 1.601, 0.196],
    vertices: 2512,
    triangles: 1304,
    materials: ['Wood', 'Black', 'DarkMetal', 'Metal', 'DarkWood'],
    usedByWeapons: ['ak47'],
  },
  {
    file: 'Assault Rifle-Bgvuu4CUMV.glb',
    category: 'Fuzis de Assalto',
    dimensionsMeters: [5.169, 1.79, 0.346],
    vertices: 3688,
    triangles: 1930,
    materials: ['Main', 'MainDark', 'MainLight'],
    usedByWeapons: ['m4a1', 'ia2'],
  },
  {
    file: 'Assault Rifle-fpLucho45C.glb',
    category: 'Fuzis de Assalto',
    dimensionsMeters: [5.494, 1.601, 0.196],
    vertices: 2682,
    triangles: 1388,
    materials: ['DarkMetal', 'Metal', 'Wood', 'Black', 'DarkWood'],
    usedByWeapons: ['g3', 'parafal'],
  },
  {
    file: 'Bullpup.glb',
    category: 'Fuzis de Assalto',
    dimensionsMeters: [5.248, 1.541, 0.31],
    vertices: 5032,
    triangles: 2778,
    materials: ['MainDark', 'MainLight', 'Main'],
    usedByWeapons: ['bullpup_aug'],
  },
  {
    file: 'Shotgun Sawed Off.glb',
    category: 'Escopetas',
    dimensionsMeters: [3.688, 1.02, 0.422],
    vertices: 1842,
    triangles: 956,
    materials: ['DarkMetal', 'Wood', 'DarkWood', 'Metal', 'Black'],
    usedByWeapons: ['sawed_off'],
  },
  {
    file: 'Shotgun Short Stock.glb',
    category: 'Escopetas',
    dimensionsMeters: [4.471, 0.967, 0.247],
    vertices: 2992,
    triangles: 1612,
    materials: ['Metal', 'Black', 'Wood', 'DarkMetal'],
    usedByWeapons: ['shotgun_short'],
  },
  {
    file: 'Shotgun.glb',
    category: 'Escopetas',
    dimensionsMeters: [5.785, 0.949, 0.247],
    vertices: 1388,
    triangles: 746,
    materials: ['Black', 'DarkMetal', 'Wood', 'Metal', 'DarkWood'],
    usedByWeapons: ['m3'],
  },
  {
    file: 'Shotgun-ZmPTnh7njL.glb',
    category: 'Escopetas',
    dimensionsMeters: [5.785, 0.943, 0.247],
    vertices: 1860,
    triangles: 978,
    materials: ['Wood', 'Metal', 'DarkMetal', 'Black'],
    usedByWeapons: ['cbc_pump'],
  },
  {
    file: 'Sniper Rifle.glb',
    category: 'Rifles de Precisão',
    dimensionsMeters: [6.336, 1.348, 0.459],
    vertices: 2530,
    triangles: 1344,
    materials: ['Metal', 'Black', 'DarkMetal', 'Glass', 'Grey'],
    usedByWeapons: ['awp'],
  },
  {
    file: 'Sniper Rifle-ASOMZIErq3.glb',
    category: 'Rifles de Precisão',
    dimensionsMeters: [7.295, 1.484, 0.459],
    vertices: 2602,
    triangles: 1382,
    materials: ['Black', 'Green', 'DarkMetal', 'Glass', 'Grey'],
    usedByWeapons: ['sniper_dmr'],
  },
  {
    file: 'Sniper Rifle-TKaBjAEofL.glb',
    category: 'Rifles de Precisão',
    dimensionsMeters: [7.245, 1.201, 0.446],
    vertices: 3296,
    triangles: 1722,
    materials: ['Black', 'DarkMetal', 'Glass', 'Green', 'Grey'],
    usedByWeapons: ['sniper_scout'],
  },
  {
    file: 'Sniper Rifle-i65hEldsw6.glb',
    category: 'Rifles de Precisão',
    dimensionsMeters: [6.336, 1.899, 1.248],
    vertices: 3254,
    triangles: 1688,
    materials: ['LightMetal', 'Metal', 'DarkMetal', 'Black', 'Grey', 'Glass'],
    usedByWeapons: ['sniper_barrett'],
  },
  {
    file: 'Bayonet.glb',
    category: 'Acessórios & Equipamentos',
    dimensionsMeters: [1.167, 0.234, 0.132],
    vertices: 465,
    triangles: 240,
    materials: ['DarkMetal', 'Black', 'LightMetal', 'LightMetal2'],
    usedByWeapons: ['knife'],
  },
  {
    file: 'Scope.glb',
    category: 'Acessórios & Equipamentos',
    dimensionsMeters: [2.079, 0.398, 0.361],
    vertices: 912,
    triangles: 468,
    materials: ['Black', 'DarkMetal', 'Glass'],
    usedByWeapons: ['ia2', 'bullpup_aug', 'smg_tactical'],
  },
  {
    file: 'Bipod.glb',
    category: 'Acessórios & Equipamentos',
    dimensionsMeters: [0.145, 1.331, 1.216],
    vertices: 904,
    triangles: 476,
    materials: ['DarkMetal', 'Black'],
    usedByWeapons: ['awp', 'sniper_scout', 'sniper_dmr', 'g3'],
  },
  {
    file: 'Tripod.glb',
    category: 'Acessórios & Equipamentos',
    dimensionsMeters: [1.311, 1.181, 1.216],
    vertices: 1240,
    triangles: 648,
    materials: ['DarkMetal', 'Black'],
    usedByWeapons: ['sniper_barrett'],
  },
];

// Ângulo base em Y para alinhar +X do GLB com -Z da câmera + leve convergência competitiva CS
const FP_YAW_COMPETITIVE = Math.PI / 2 + 0.04;

/**
 * Calibração individual de posicionamento, escala, rotação, pontos de empunhadura (mão direita/esquerda),
 * muzzle flash e acessórios para cada uma das 26 armas do catálogo.
 * Coordenadas derivadas diretamente da geometria normalizada de cada arquivo GLB.
 */
export const WEAPON_GLB_VISUAL_CONFIGS: Record<string, WeaponGlbVisualConfig> = {
  // ==========================================================================
  // 1. CORPO A CORPO (BAIONETA TÁTICA M9 — EXCLUSIVA DO SLOT 1)
  // ==========================================================================
  knife: {
    weaponId: 'knife',
    glbFile: 'Bayonet.glb',
    gripStyle: 'melee_knife',
    fpTargetLength: 0.35,
    fpPosition: [0.175, -0.145, -0.46],
    fpRotation: [0.18, Math.PI / 2 + 0.14, 0.08],
    fpRightGripNorm: [-0.15, -0.02],
    fpLeftGripNorm: null,
    fpMuzzlePos: [0.15, -0.11, -0.64],
    tpTargetLength: 0.36,
    tpOffset: [0, 0.02, -0.14],
  },

  // ==========================================================================
  // 2. PISTOLAS SEMIAUTOMÁTICAS (EMPUNHADURA DUPLA TÁTICA)
  // ==========================================================================
  usp: {
    weaponId: 'usp',
    glbFile: 'Pistol-52kQzphmeF.glb',
    gripStyle: 'pistol_two_hand',
    fpTargetLength: 0.285,
    fpPosition: [0.165, -0.138, -0.46],
    fpRotation: [0.015, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.34, -0.12],
    fpLeftGripNorm: [-0.27, -0.13],
    fpMuzzlePos: [0.16, -0.092, -0.61],
    tpTargetLength: 0.32,
    tpOffset: [0, 0.02, -0.10],
  },
  glock17: {
    weaponId: 'glock17',
    glbFile: 'Pistol.glb',
    gripStyle: 'pistol_two_hand',
    fpTargetLength: 0.255,
    fpPosition: [0.165, -0.142, -0.45],
    fpRotation: [0.015, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.31, -0.15],
    fpLeftGripNorm: [-0.24, -0.16],
    fpMuzzlePos: [0.16, -0.086, -0.58],
    tpTargetLength: 0.30,
    tpOffset: [0, 0.02, -0.10],
  },
  glock19: {
    weaponId: 'glock19',
    glbFile: 'Pistol-J3i9KDQ3kt.glb',
    gripStyle: 'pistol_two_hand',
    fpTargetLength: 0.24,
    fpPosition: [0.165, -0.144, -0.44],
    fpRotation: [0.015, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.28, -0.16],
    fpLeftGripNorm: [-0.21, -0.17],
    fpMuzzlePos: [0.16, -0.088, -0.56],
    tpTargetLength: 0.28,
    tpOffset: [0, 0.02, -0.12],
    metalTintHex: 0x3b424d,
  },
  pt92: {
    weaponId: 'pt92',
    glbFile: 'Pistol-J3i9KDQ3kt.glb',
    gripStyle: 'pistol_two_hand',
    fpTargetLength: 0.27,
    fpPosition: [0.165, -0.142, -0.455],
    fpRotation: [0.015, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.28, -0.16],
    fpLeftGripNorm: [-0.21, -0.17],
    fpMuzzlePos: [0.16, -0.082, -0.595],
    tpTargetLength: 0.32,
    tpOffset: [0, 0.02, -0.10],
    metalTintHex: 0xe2e8f0,
  },
  th9: {
    weaponId: 'th9',
    glbFile: 'Pistol-52kQzphmeF.glb',
    gripStyle: 'pistol_two_hand',
    fpTargetLength: 0.28,
    fpPosition: [0.165, -0.14, -0.455],
    fpRotation: [0.015, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.34, -0.12],
    fpLeftGripNorm: [-0.27, -0.13],
    fpMuzzlePos: [0.16, -0.094, -0.60],
    tpTargetLength: 0.31,
    tpOffset: [0, 0.02, -0.10],
    metalTintHex: 0x2d3748,
  },
  deagle: {
    weaponId: 'deagle',
    glbFile: 'Pistol-Z7aOjJu583.glb',
    gripStyle: 'pistol_two_hand',
    fpTargetLength: 0.305,
    fpPosition: [0.17, -0.138, -0.47],
    fpRotation: [0.015, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.30, -0.17],
    fpLeftGripNorm: [-0.22, -0.18],
    fpMuzzlePos: [0.162, -0.072, -0.63],
    tpTargetLength: 0.36,
    tpOffset: [0, 0.02, -0.08],
    metalTintHex: 0xf1f5f9,
  },

  // ==========================================================================
  // 3. REVÓLVERES (EMPUNHADURA DUPLA NO TAMBOR/PUNHO)
  // ==========================================================================
  revolver_38: {
    weaponId: 'revolver_38',
    glbFile: 'Revolver.glb',
    gripStyle: 'revolver_two_hand',
    fpTargetLength: 0.285,
    fpPosition: [0.168, -0.142, -0.46],
    fpRotation: [0.015, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.36, -0.12],
    fpLeftGripNorm: [-0.28, -0.13],
    fpMuzzlePos: [0.16, -0.092, -0.61],
    tpTargetLength: 0.33,
    tpOffset: [0, 0.02, -0.08],
  },
  revolver_357: {
    weaponId: 'revolver_357',
    glbFile: 'Revolver-9C26wSpMS0.glb',
    gripStyle: 'revolver_two_hand',
    fpTargetLength: 0.315,
    fpPosition: [0.17, -0.14, -0.475],
    fpRotation: [0.015, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.36, -0.13],
    fpLeftGripNorm: [-0.28, -0.14],
    fpMuzzlePos: [0.162, -0.094, -0.64],
    tpTargetLength: 0.36,
    tpOffset: [0, 0.02, -0.07],
    metalTintHex: 0xe2e8f0,
  },
  revolver_44: {
    weaponId: 'revolver_44',
    glbFile: 'Revolver-XrnLUz6kQj.glb',
    gripStyle: 'revolver_two_hand',
    fpTargetLength: 0.335,
    fpPosition: [0.172, -0.138, -0.485],
    fpRotation: [0.015, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.36, -0.13],
    fpLeftGripNorm: [-0.28, -0.14],
    fpMuzzlePos: [0.162, -0.072, -0.66],
    tpTargetLength: 0.38,
    tpOffset: [0, 0.02, -0.07],
  },

  // ==========================================================================
  // 4. ESCOPETAS CALIBRE 12 (MÃO DIREITA NO PUNHO + MÃO ESQUERDA NA TELHA FRONTAL)
  // ==========================================================================
  sawed_off: {
    weaponId: 'sawed_off',
    glbFile: 'Shotgun Sawed Off.glb',
    gripStyle: 'shotgun_pump',
    fpTargetLength: 0.56,
    fpPosition: [0.18, -0.155, -0.51],
    fpRotation: [0.012, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.36, -0.05],
    fpLeftGripNorm: [0.06, 0.01],
    fpMuzzlePos: [0.168, -0.102, -0.80],
    tpTargetLength: 0.58,
    tpOffset: [0, 0.02, 0.02],
  },
  shotgun_short: {
    weaponId: 'shotgun_short',
    glbFile: 'Shotgun Short Stock.glb',
    gripStyle: 'shotgun_pump',
    fpTargetLength: 0.65,
    fpPosition: [0.18, -0.152, -0.53],
    fpRotation: [0.012, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.26, -0.02],
    fpLeftGripNorm: [0.18, 0.00],
    fpMuzzlePos: [0.166, -0.106, -0.86],
    tpTargetLength: 0.68,
    tpOffset: [0, 0.02, 0.04],
  },
  m3: {
    weaponId: 'm3',
    glbFile: 'Shotgun.glb',
    gripStyle: 'shotgun_pump',
    fpTargetLength: 0.76,
    fpPosition: [0.182, -0.15, -0.55],
    fpRotation: [0.012, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.24, -0.02],
    fpLeftGripNorm: [0.14, 0.00],
    fpMuzzlePos: [0.165, -0.108, -0.94],
    tpTargetLength: 0.80,
    tpOffset: [0, 0.02, 0.05],
  },
  cbc_pump: {
    weaponId: 'cbc_pump',
    glbFile: 'Shotgun-ZmPTnh7njL.glb',
    gripStyle: 'shotgun_pump',
    fpTargetLength: 0.77,
    fpPosition: [0.182, -0.15, -0.55],
    fpRotation: [0.012, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.24, -0.02],
    fpLeftGripNorm: [0.14, 0.00],
    fpMuzzlePos: [0.165, -0.108, -0.95],
    tpTargetLength: 0.82,
    tpOffset: [0, 0.02, 0.05],
    metalTintHex: 0x1e242d,
  },

  // ==========================================================================
  // 5. FUZIS DE ASSALTO, BATALHA & BULLPUP (SEM BAIONETA ACOPLADA EM FUZIS)
  // ==========================================================================
  ak47: {
    weaponId: 'ak47',
    glbFile: 'Assault Rifle.glb',
    gripStyle: 'rifle_handguard',
    fpTargetLength: 0.72,
    fpPosition: [0.18, -0.175, -0.52],
    fpRotation: [0.012, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.18, -0.02],
    fpLeftGripNorm: [0.20, 0.06],
    fpMuzzlePos: [0.165, -0.095, -0.89],
    tpTargetLength: 0.78,
    tpOffset: [0, 0.02, 0.04],
  },
  g3: {
    weaponId: 'g3',
    glbFile: 'Assault Rifle-fpLucho45C.glb',
    gripStyle: 'rifle_handguard',
    fpTargetLength: 0.76,
    fpPosition: [0.18, -0.176, -0.54],
    fpRotation: [0.012, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.18, -0.02],
    fpLeftGripNorm: [0.20, 0.06],
    fpMuzzlePos: [0.165, -0.092, -0.93],
    tpTargetLength: 0.82,
    tpOffset: [0, 0.02, 0.05],
    metalTintHex: 0x3b4d38,
    attachments: [
      {
        file: 'Bipod.glb',
        relativeScale: 0.11,
        normalizedOffset: [0.28, 0.02, 0],
      },
    ],
  },
  parafal: {
    weaponId: 'parafal',
    glbFile: 'Assault Rifle-fpLucho45C.glb',
    gripStyle: 'rifle_handguard',
    fpTargetLength: 0.76,
    fpPosition: [0.18, -0.176, -0.54],
    fpRotation: [0.012, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.18, -0.02],
    fpLeftGripNorm: [0.20, 0.06],
    fpMuzzlePos: [0.165, -0.092, -0.93],
    tpTargetLength: 0.82,
    tpOffset: [0, 0.02, 0.05],
    metalTintHex: 0x222730,
  },
  ia2: {
    weaponId: 'ia2',
    glbFile: 'Assault Rifle-Bgvuu4CUMV.glb',
    gripStyle: 'rifle_handguard',
    fpTargetLength: 0.70,
    fpPosition: [0.18, -0.178, -0.51],
    fpRotation: [0.012, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.20, -0.04],
    fpLeftGripNorm: [0.20, 0.06],
    fpMuzzlePos: [0.165, -0.114, -0.87],
    tpTargetLength: 0.76,
    tpOffset: [0, 0.02, 0.04],
    metalTintHex: 0x2f3e32,
    attachments: [
      {
        file: 'Scope.glb',
        relativeScale: 0.16,
        normalizedOffset: [-0.08, 0.132, 0],
      },
    ],
  },
  m4a1: {
    weaponId: 'm4a1',
    glbFile: 'Assault Rifle-Bgvuu4CUMV.glb',
    gripStyle: 'rifle_handguard',
    fpTargetLength: 0.70,
    fpPosition: [0.18, -0.176, -0.51],
    fpRotation: [0.012, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.20, -0.04],
    fpLeftGripNorm: [0.20, 0.06],
    fpMuzzlePos: [0.165, -0.112, -0.87],
    tpTargetLength: 0.76,
    tpOffset: [0, 0.02, 0.04],
  },
  bullpup_aug: {
    weaponId: 'bullpup_aug',
    glbFile: 'Bullpup.glb',
    gripStyle: 'bullpup_grip',
    fpTargetLength: 0.66,
    fpPosition: [0.178, -0.168, -0.49],
    fpRotation: [0.012, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.04, -0.08],
    fpLeftGripNorm: [0.20, -0.01],
    fpMuzzlePos: [0.165, -0.11, -0.83],
    tpTargetLength: 0.72,
    tpOffset: [0, 0.02, 0.02],
    attachments: [
      {
        file: 'Scope.glb',
        relativeScale: 0.17,
        normalizedOffset: [0.02, 0.162, 0],
      },
    ],
  },

  // ==========================================================================
  // 6. SUBMETRALHADORAS E RIFLES DE PRECISÃO (TÁTICOS & SNIPER)
  // ==========================================================================
  mp5: {
    weaponId: 'mp5',
    glbFile: 'Submachine Gun.glb',
    gripStyle: 'smg_foregrip',
    fpTargetLength: 0.52,
    fpPosition: [0.175, -0.172, -0.48],
    fpRotation: [0.012, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.10, -0.06],
    fpLeftGripNorm: [0.22, 0.02],
    fpMuzzlePos: [0.162, -0.106, -0.75],
    tpTargetLength: 0.58,
    tpOffset: [0, 0.02, 0.0],
  },
  smg_tactical: {
    weaponId: 'smg_tactical',
    glbFile: 'Submachine Gun-nsP3JukU73.glb',
    gripStyle: 'smg_foregrip',
    fpTargetLength: 0.54,
    fpPosition: [0.175, -0.17, -0.49],
    fpRotation: [0.012, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.05, -0.06],
    fpLeftGripNorm: [0.25, 0.01],
    fpMuzzlePos: [0.162, -0.106, -0.77],
    tpTargetLength: 0.60,
    tpOffset: [0, 0.02, 0.0],
    attachments: [
      {
        file: 'Scope.glb',
        relativeScale: 0.15,
        normalizedOffset: [0.08, 0.104, 0],
      },
    ],
  },
  awp: {
    weaponId: 'awp',
    glbFile: 'Sniper Rifle.glb',
    gripStyle: 'sniper_precision',
    fpTargetLength: 0.86,
    fpPosition: [0.182, -0.152, -0.57],
    fpRotation: [0.01, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.22, -0.02],
    fpLeftGripNorm: [0.05, 0.00],
    fpMuzzlePos: [0.164, -0.118, -1.01],
    tpTargetLength: 0.94,
    tpOffset: [0, 0.02, 0.07],
    attachments: [
      {
        file: 'Bipod.glb',
        relativeScale: 0.11,
        normalizedOffset: [0.14, -0.05, 0],
      },
    ],
  },
  sniper_scout: {
    weaponId: 'sniper_scout',
    glbFile: 'Sniper Rifle-TKaBjAEofL.glb',
    gripStyle: 'sniper_precision',
    fpTargetLength: 0.82,
    fpPosition: [0.18, -0.148, -0.55],
    fpRotation: [0.01, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.24, -0.03],
    fpLeftGripNorm: [0.04, -0.01],
    fpMuzzlePos: [0.164, -0.125, -0.97],
    tpTargetLength: 0.90,
    tpOffset: [0, 0.02, 0.06],
    attachments: [
      {
        file: 'Bipod.glb',
        relativeScale: 0.11,
        normalizedOffset: [0.14, -0.058, 0],
      },
    ],
  },
  sniper_dmr: {
    weaponId: 'sniper_dmr',
    glbFile: 'Sniper Rifle-ASOMZIErq3.glb',
    gripStyle: 'sniper_precision',
    fpTargetLength: 0.85,
    fpPosition: [0.182, -0.152, -0.56],
    fpRotation: [0.01, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.22, -0.03],
    fpLeftGripNorm: [0.05, 0.00],
    fpMuzzlePos: [0.164, -0.11, -0.99],
    tpTargetLength: 0.92,
    tpOffset: [0, 0.02, 0.06],
    attachments: [
      {
        file: 'Bipod.glb',
        relativeScale: 0.11,
        normalizedOffset: [0.14, -0.048, 0],
      },
    ],
  },
  sniper_barrett: {
    weaponId: 'sniper_barrett',
    glbFile: 'Sniper Rifle-i65hEldsw6.glb',
    gripStyle: 'sniper_precision',
    fpTargetLength: 0.90,
    fpPosition: [0.184, -0.16, -0.58],
    fpRotation: [0.01, FP_YAW_COMPETITIVE, 0],
    fpRightGripNorm: [-0.24, -0.02],
    fpLeftGripNorm: [0.04, 0.03],
    fpMuzzlePos: [0.164, -0.088, -1.04],
    tpTargetLength: 0.98,
    tpOffset: [0, 0.02, 0.07],
    attachments: [
      {
        file: 'Tripod.glb',
        relativeScale: 0.11,
        normalizedOffset: [0.06, -0.02, 0],
      },
    ],
  },
};

/**
 * Calcula a posição 3D exata (em coordenadas do `weaponGroup`) de um ponto normalizado [nx, ny]
 * sobre o modelo GLB considerando `fpPosition`, `fpTargetLength` e a rotação `fpRotation`.
 */
export function computeFirstPersonGripAnchor(
  config: WeaponGlbVisualConfig,
  normXY: [number, number]
): THREE.Vector3 {
  const L = config.fpTargetLength;
  const [wx, wy, wz] = config.fpPosition;
  const [rx, ry, rz] = config.fpRotation;

  const localVec = new THREE.Vector3(normXY[0] * L, normXY[1] * L, 0);
  const euler = new THREE.Euler(rx, ry, rz, 'XYZ');
  localVec.applyEuler(euler);

  return new THREE.Vector3(wx + localVec.x, wy + localVec.y, wz + localVec.z);
}

interface NormalizedGlbTemplate {
  file: GlbWeaponFile;
  /** Grupo com origem exatamente no centro da caixa delimitadora (0,0,0) */
  centeredGroup: THREE.Group;
  /** Dimensões brutas da caixa delimitadora [lenX, heightY, widthZ] */
  rawSize: THREE.Vector3;
}

const gltfLoader = new GLTFLoader();
const templateCache = new Map<GlbWeaponFile, NormalizedGlbTemplate>();
const loadingPromises = new Map<GlbWeaponFile, Promise<NormalizedGlbTemplate>>();

// Contador monotônico para invalidar carregamentos assíncronos antigos na troca rápida de armas
let activeFirstPersonGenerationToken = 0;

export function bumpFirstPersonViewmodelToken(): number {
  activeFirstPersonGenerationToken += 1;
  return activeFirstPersonGenerationToken;
}

export function getGlbAssetUrl(file: GlbWeaponFile): string {
  return `/models/weapons/${encodeURIComponent(file)}`;
}

/**
 * Refina os materiais PBR originais do pacote Quaternius para garantir contraste nítido
 * entre aço oxidado, metal cromado, polímero fosco, madeira envernizada e lentes ópticas.
 */
function enhanceQuaterniusMaterial(stdMat: THREE.MeshStandardMaterial): void {
  const matName = stdMat.name || '';
  stdMat.envMapIntensity = 1.35;

  if (matName === 'LightMetal' || matName === 'LightMetal2' || matName === 'MainLight') {
    stdMat.color.setRGB(
      Math.max(stdMat.color.r * 2.4, 0.42),
      Math.max(stdMat.color.g * 2.4, 0.44),
      Math.max(stdMat.color.b * 2.4, 0.48)
    );
    stdMat.metalness = 0.82;
    stdMat.roughness = 0.24;
  } else if (matName === 'Metal' || matName === 'Grey') {
    stdMat.color.setRGB(
      Math.max(stdMat.color.r * 2.6, 0.24),
      Math.max(stdMat.color.g * 2.6, 0.26),
      Math.max(stdMat.color.b * 2.6, 0.29)
    );
    stdMat.metalness = 0.74;
    stdMat.roughness = 0.32;
  } else if (matName === 'DarkMetal' || matName === 'Main') {
    stdMat.color.setRGB(
      Math.max(stdMat.color.r * 2.5, 0.15),
      Math.max(stdMat.color.g * 2.5, 0.17),
      Math.max(stdMat.color.b * 2.5, 0.20)
    );
    stdMat.metalness = 0.65;
    stdMat.roughness = 0.38;
  } else if (matName === 'Black' || matName === 'Black2' || matName === 'MainDark') {
    stdMat.color.setRGB(0.08, 0.085, 0.095);
    stdMat.metalness = 0.22;
    stdMat.roughness = 0.68;
  } else if (matName === 'Wood' || matName === 'DarkWood') {
    const isDark = matName === 'DarkWood';
    stdMat.color.setRGB(
      isDark ? 0.28 : 0.42,
      isDark ? 0.15 : 0.22,
      isDark ? 0.08 : 0.11
    );
    stdMat.metalness = 0.08;
    stdMat.roughness = 0.56;
  } else if (matName === 'Green') {
    stdMat.color.setRGB(0.16, 0.24, 0.15);
    stdMat.metalness = 0.18;
    stdMat.roughness = 0.58;
  } else if (matName === 'Glass') {
    stdMat.color.setHex(0x38bdf8);
    stdMat.emissive.setHex(0x072f49);
    stdMat.emissiveIntensity = 0.6;
    stdMat.metalness = 0.9;
    stdMat.roughness = 0.12;
  }
  stdMat.needsUpdate = true;
}

/**
 * Carrega e normaliza um arquivo GLB uma única vez, mantendo-o em cache na memória
 * para clonagem leve sem duplicar chamadas de rede nem geometrias na GPU.
 */
export function loadNormalizedGlbTemplate(
  file: GlbWeaponFile
): Promise<NormalizedGlbTemplate> {
  const cached = templateCache.get(file);
  if (cached) {
    return Promise.resolve(cached);
  }

  const existingPromise = loadingPromises.get(file);
  if (existingPromise) {
    return existingPromise;
  }

  const url = getGlbAssetUrl(file);
  const promise = new Promise<NormalizedGlbTemplate>((resolve, reject) => {
    gltfLoader.load(
      url,
      (gltf) => {
        const sceneRoot = gltf.scene;
        sceneRoot.updateMatrixWorld(true);

        const box = new THREE.Box3().setFromObject(sceneRoot);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Centraliza o modelo no grupo wrapper para que (0,0,0) seja o centro geométrico exato
        sceneRoot.position.sub(center);
        sceneRoot.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            const mats = Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material];
            for (const m of mats) {
              if (m && (m as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                enhanceQuaterniusMaterial(m as THREE.MeshStandardMaterial);
              }
            }
          }
        });

        const centeredGroup = new THREE.Group();
        centeredGroup.name = `GLB_Template_${file}`;
        centeredGroup.add(sceneRoot);

        const template: NormalizedGlbTemplate = {
          file,
          centeredGroup,
          rawSize: new THREE.Vector3(
            Math.max(0.01, size.x),
            Math.max(0.01, size.y),
            Math.max(0.01, size.z)
          ),
        };

        templateCache.set(file, template);
        loadingPromises.delete(file);
        resolve(template);
      },
      undefined,
      (err) => {
        loadingPromises.delete(file);
        console.warn(`[GLBWeaponLoader] Falha ao carregar ${file}:`, err);
        reject(err);
      }
    );
  });

  loadingPromises.set(file, promise);
  return promise;
}

/**
 * Clona a hierarquia do modelo GLB compartilhando BufferGeometry e aplicando
 * tint sutil apenas quando a variante exigir diferenciação metálica.
 */
function instantiateScaledModelFromTemplate(
  template: NormalizedGlbTemplate,
  targetLengthMeters: number,
  useHeightAsDominant = false,
  metalTintHex?: number
): THREE.Group {
  const clone = template.centeredGroup.clone(true);
  const dominantRaw = useHeightAsDominant
    ? Math.max(template.rawSize.y, template.rawSize.z)
    : template.rawSize.x;
  const uniformScale = targetLengthMeters / Math.max(0.01, dominantRaw);
  clone.scale.setScalar(uniformScale);

  if (metalTintHex !== undefined) {
    const tintColor = new THREE.Color(metalTintHex);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (
          mesh.material &&
          !Array.isArray(mesh.material) &&
          (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial
        ) {
          const orig = mesh.material as THREE.MeshStandardMaterial;
          if (
            orig.name === 'Metal' ||
            orig.name === 'Main' ||
            orig.name === 'DarkMetal' ||
            orig.name === 'LightMetal'
          ) {
            const tinted = orig.clone();
            tinted.color.lerp(tintColor, 0.52);
            mesh.material = tinted;
          }
        }
      }
    });
  }

  return clone;
}

/**
 * Monta uma arma completa com seu modelo GLB principal + acessórios 3D acoplados (Scope, Bipod, Tripod).
 * Garante estritamente que Bayonet.glb NUNCA seja acoplada como acessório secundário de outra arma.
 */
export async function buildCalibratedWeaponAssembly(
  weaponId: string,
  targetLength: number
): Promise<THREE.Group> {
  const config = WEAPON_GLB_VISUAL_CONFIGS[weaponId] || WEAPON_GLB_VISUAL_CONFIGS.ak47;
  const mainTemplate = await loadNormalizedGlbTemplate(config.glbFile);

  const assembly = new THREE.Group();
  assembly.name = `WeaponAssembly_${weaponId}`;
  assembly.userData.weaponId = weaponId;

  const mainInstance = instantiateScaledModelFromTemplate(
    mainTemplate,
    targetLength,
    false,
    config.metalTintHex
  );
  assembly.add(mainInstance);

  if (weaponId !== 'knife' && config.attachments && config.attachments.length > 0) {
    await Promise.all(
      config.attachments
        .filter((att) => att.file !== 'Bayonet.glb')
        .map(async (att) => {
          try {
            const attTemplate = await loadNormalizedGlbTemplate(att.file);
            const isSupportGear = att.file === 'Bipod.glb' || att.file === 'Tripod.glb';
            const attInstance = instantiateScaledModelFromTemplate(
              attTemplate,
              targetLength * att.relativeScale,
              isSupportGear
            );
            attInstance.name = `WeaponAttachment_${att.file}`;
            attInstance.position.set(
              att.normalizedOffset[0] * targetLength,
              att.normalizedOffset[1] * targetLength,
              att.normalizedOffset[2] * targetLength
            );
            if (att.rotation) {
              attInstance.rotation.set(
                att.rotation[0],
                att.rotation[1],
                att.rotation[2]
              );
            }
            assembly.add(attInstance);
          } catch {
            // Mantém a arma principal funcionando caso um acessório opcional falhe
          }
        })
    );
  }

  return assembly;
}

/**
 * Pré-carrega sob demanda um conjunto de armas (ex.: loadout inicial do jogador)
 */
export function preloadWeaponGlbModels(weaponIds: string[]): void {
  for (const id of weaponIds) {
    const cfg = WEAPON_GLB_VISUAL_CONFIGS[id];
    if (!cfg) continue;
    loadNormalizedGlbTemplate(cfg.glbFile).catch(() => {});
    if (cfg.attachments) {
      for (const att of cfg.attachments) {
        if (att.file !== 'Bayonet.glb') {
          loadNormalizedGlbTemplate(att.file).catch(() => {});
        }
      }
    }
  }
}

/**
 * Acopla o modelo GLB calibrado ao grupo de 1ª pessoa (`weaponGroup`),
 * removendo qualquer instância anterior e substituindo suavemente a malha procedural de fallback.
 */
export function attachFirstPersonGlbToViewmodel(
  weaponId: string,
  targetWeaponGroup: THREE.Group,
  proceduralFallbackGroup: THREE.Group
): void {
  const config = WEAPON_GLB_VISUAL_CONFIGS[weaponId];
  if (!config) return;

  const token = bumpFirstPersonViewmodelToken();
  targetWeaponGroup.userData.activeWeaponId = weaponId;
  targetWeaponGroup.userData.viewmodelToken = token;

  buildCalibratedWeaponAssembly(weaponId, config.fpTargetLength)
    .then((assembly) => {
      if (
        targetWeaponGroup.userData.activeWeaponId !== weaponId ||
        targetWeaponGroup.userData.viewmodelToken !== token
      ) {
        return;
      }

      // Garante que nenhuma montagem GLB anterior permaneça duplicada dentro do weaponGroup
      for (let i = targetWeaponGroup.children.length - 1; i >= 0; i--) {
        const child = targetWeaponGroup.children[i];
        if (child.name.startsWith('WeaponAssembly_')) {
          targetWeaponGroup.remove(child);
        }
      }

      assembly.position.set(...config.fpPosition);
      assembly.rotation.set(...config.fpRotation);

      // Remove o fallback procedural apenas quando o modelo GLB 3D real está anexado
      if (proceduralFallbackGroup.parent === targetWeaponGroup) {
        targetWeaponGroup.remove(proceduralFallbackGroup);
      }

      targetWeaponGroup.add(assembly);
    })
    .catch(() => {
      // Se ocorrer erro de rede, preserva o fallback procedural visível
    });
}

/**
 * Acopla o modelo GLB em 3ª pessoa na mão direita dos bots (`botGun` em characterModels.ts).
 */
export function attachThirdPersonGlbToBotHand(
  weaponId: string,
  botGunContainer: THREE.Object3D
): void {
  const resolvedId = WEAPON_GLB_VISUAL_CONFIGS[weaponId] ? weaponId : 'ak47';
  const config = WEAPON_GLB_VISUAL_CONFIGS[resolvedId];
  if (!config) return;

  const botToken = (botGunContainer.userData.botWeaponToken || 0) + 1;
  botGunContainer.userData.botWeaponId = resolvedId;
  botGunContainer.userData.botWeaponToken = botToken;

  buildCalibratedWeaponAssembly(resolvedId, config.tpTargetLength)
    .then((assembly) => {
      if (
        botGunContainer.userData.botWeaponId !== resolvedId ||
        botGunContainer.userData.botWeaponToken !== botToken
      ) {
        return;
      }

      // No espaço do Bot, +Z aponta para a frente do personagem.
      // Como o modelo GLB aponta o cano para +X, rotacionamos -90 graus em Y (-Math.PI / 2).
      assembly.rotation.set(0, -Math.PI / 2, 0);
      assembly.position.set(...config.tpOffset);

      // Remove montagens GLB antigas e oculta a geometria prismática de fallback
      for (let i = botGunContainer.children.length - 1; i >= 0; i--) {
        const child = botGunContainer.children[i];
        if (child.name.startsWith('WeaponAssembly_')) {
          botGunContainer.remove(child);
        } else {
          child.visible = false;
        }
      }

      if ((botGunContainer as THREE.Mesh).isMesh) {
        (botGunContainer as THREE.Mesh).material = new THREE.MeshBasicMaterial({
          visible: false,
        });
      }

      botGunContainer.add(assembly);
    })
    .catch(() => {});
}
