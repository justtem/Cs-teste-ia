import * as THREE from 'three';
import { AABBCollider, MapId, ElevationZone } from './mapModels';

export type TeamSide = 'CT' | 'TR';

/* ============================================================================
   1. TIPOS E CONFIGURAÇÕES DE DIFICULDADE, PAPÉIS E PERSONALIDADES
   ============================================================================ */

export type BotDifficulty = 'easy' | 'normal' | 'hard';

export type BotRole = 'entry' | 'support' | 'flanker' | 'defender' | 'sniper';

export type BotPersonality =
  | 'Agressivo'
  | 'Tático'
  | 'Flanqueador'
  | 'Defensivo'
  | 'Atirador';

export type BotTacticalState =
  | 'PATROL'
  | 'TACTICAL_ADVANCE'
  | 'ENGAGE'
  | 'SEEK_COVER'
  | 'PEEK_FIRE'
  | 'FLANK'
  | 'SUPPORT_ALLY'
  | 'INVESTIGATE_SOUND'
  | 'RETREAT';

export type TacticalZoneType =
  | 'CT_BASE'
  | 'TR_BASE'
  | 'BOMBSITE_A'
  | 'BOMBSITE_B'
  | 'MID'
  | 'FLANK';

export type TacticalSector = 'A' | 'MID' | 'B';

export interface DifficultyProfile {
  id: BotDifficulty;
  label: string;
  description: string;
  reactionDelayMin: number;
  reactionDelayMax: number;
  baseHitChance: number;
  headshotChance: number;
  aimTurnSpeed: number;
  burstCooldownMultiplier: number;
  coverUsageWeight: number;
  peekFrequencyWeight: number;
  memoryDurationSec: number;
  soundHearingRange: number;
  soundNoiseRadius: number;
  fovCosine: number; // cos(halfAngle)
}

export const BOT_DIFFICULTY_PROFILES: Record<BotDifficulty, DifficultyProfile> = {
  easy: {
    id: 'easy',
    label: 'Fácil',
    description: 'Reação mais lenta, menor precisão e uso básico de cobertura.',
    reactionDelayMin: 0.36,
    reactionDelayMax: 0.56,
    baseHitChance: 0.33,
    headshotChance: 0.08,
    aimTurnSpeed: 5.5,
    burstCooldownMultiplier: 1.38,
    coverUsageWeight: 0.55,
    peekFrequencyWeight: 0.45,
    memoryDurationSec: 6.5,
    soundHearingRange: 34,
    soundNoiseRadius: 3.4,
    fovCosine: Math.cos((62 * Math.PI) / 180), // 124 graus
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    description: 'Combate tático equilibrado, uso de cobertura, flancos e suporte.',
    reactionDelayMin: 0.19,
    reactionDelayMax: 0.33,
    baseHitChance: 0.53,
    headshotChance: 0.16,
    aimTurnSpeed: 8.8,
    burstCooldownMultiplier: 1.0,
    coverUsageWeight: 1.0,
    peekFrequencyWeight: 1.0,
    memoryDurationSec: 9.5,
    soundHearingRange: 46,
    soundNoiseRadius: 2.0,
    fovCosine: Math.cos((72 * Math.PI) / 180), // 144 graus
  },
  hard: {
    id: 'hard',
    label: 'Difícil',
    description: 'Reflexos competitivos, peeking tático, coordenação de equipe e leitura de mapa.',
    reactionDelayMin: 0.1,
    reactionDelayMax: 0.2,
    baseHitChance: 0.71,
    headshotChance: 0.25,
    aimTurnSpeed: 12.5,
    burstCooldownMultiplier: 0.78,
    coverUsageWeight: 1.35,
    peekFrequencyWeight: 1.35,
    memoryDurationSec: 12.5,
    soundHearingRange: 58,
    soundNoiseRadius: 1.0,
    fovCosine: Math.cos((82 * Math.PI) / 180), // 164 graus
  },
};

export interface BotWeaponProfile {
  weaponId: string;
  weaponLabel: string;
  category: 'smg' | 'rifle' | 'sniper' | 'heavy';
  optimalRange: number;
  maxEffectiveRange: number;
  minComfortRange: number;
  shotInterval: number;
  burstMin: number;
  burstMax: number;
  burstPauseMin: number;
  burstPauseMax: number;
  baseDamage: number;
  damageVariance: number;
  accuracyBonus: number;
  headshotMultiplier: number;
  moveSpeedMultiplier: number;
  soundLoudness: number;
}

const BOT_WEAPON_PROFILES: Record<string, BotWeaponProfile> = {
  mp5: {
    weaponId: 'mp5',
    weaponLabel: 'MP5 Navy',
    category: 'smg',
    optimalRange: 14,
    maxEffectiveRange: 28,
    minComfortRange: 2.5,
    shotInterval: 0.095,
    burstMin: 3,
    burstMax: 5,
    burstPauseMin: 0.34,
    burstPauseMax: 0.56,
    baseDamage: 12,
    damageVariance: 5,
    accuracyBonus: 0.04,
    headshotMultiplier: 1.75,
    moveSpeedMultiplier: 1.08,
    soundLoudness: 38,
  },
  p90: {
    weaponId: 'p90',
    weaponLabel: 'FN P90',
    category: 'smg',
    optimalRange: 15,
    maxEffectiveRange: 29,
    minComfortRange: 2.5,
    shotInterval: 0.088,
    burstMin: 4,
    burstMax: 6,
    burstPauseMin: 0.32,
    burstPauseMax: 0.52,
    baseDamage: 11,
    damageVariance: 5,
    accuracyBonus: 0.03,
    headshotMultiplier: 1.7,
    moveSpeedMultiplier: 1.07,
    soundLoudness: 40,
  },
  m4a1: {
    weaponId: 'm4a1',
    weaponLabel: 'IMBEL IA2 5.56',
    category: 'rifle',
    optimalRange: 24,
    maxEffectiveRange: 46,
    minComfortRange: 4.5,
    shotInterval: 0.11,
    burstMin: 2,
    burstMax: 4,
    burstPauseMin: 0.38,
    burstPauseMax: 0.62,
    baseDamage: 15,
    damageVariance: 6,
    accuracyBonus: 0.08,
    headshotMultiplier: 1.9,
    moveSpeedMultiplier: 1.0,
    soundLoudness: 43,
  },
  ak47: {
    weaponId: 'ak47',
    weaponLabel: 'AK-47',
    category: 'rifle',
    optimalRange: 24,
    maxEffectiveRange: 46,
    minComfortRange: 4.5,
    shotInterval: 0.12,
    burstMin: 2,
    burstMax: 4,
    burstPauseMin: 0.4,
    burstPauseMax: 0.65,
    baseDamage: 17,
    damageVariance: 7,
    accuracyBonus: 0.06,
    headshotMultiplier: 2.0,
    moveSpeedMultiplier: 0.99,
    soundLoudness: 50,
  },
  famas: {
    weaponId: 'famas',
    weaponLabel: 'ParaFAL 7.62',
    category: 'rifle',
    optimalRange: 22,
    maxEffectiveRange: 42,
    minComfortRange: 4.0,
    shotInterval: 0.11,
    burstMin: 3,
    burstMax: 3,
    burstPauseMin: 0.36,
    burstPauseMax: 0.58,
    baseDamage: 15,
    damageVariance: 5,
    accuracyBonus: 0.07,
    headshotMultiplier: 1.85,
    moveSpeedMultiplier: 1.01,
    soundLoudness: 46,
  },
  galil: {
    weaponId: 'galil',
    weaponLabel: 'HK G3 7.62',
    category: 'rifle',
    optimalRange: 22,
    maxEffectiveRange: 42,
    minComfortRange: 4.0,
    shotInterval: 0.115,
    burstMin: 3,
    burstMax: 4,
    burstPauseMin: 0.38,
    burstPauseMax: 0.6,
    baseDamage: 16,
    damageVariance: 6,
    accuracyBonus: 0.06,
    headshotMultiplier: 1.85,
    moveSpeedMultiplier: 1.0,
    soundLoudness: 48,
  },
  awp: {
    weaponId: 'awp',
    weaponLabel: 'AWP Sniper',
    category: 'sniper',
    optimalRange: 38,
    maxEffectiveRange: 75,
    minComfortRange: 10.5,
    shotInterval: 0.92,
    burstMin: 1,
    burstMax: 1,
    burstPauseMin: 0.92,
    burstPauseMax: 1.32,
    baseDamage: 46,
    damageVariance: 14,
    accuracyBonus: 0.15,
    headshotMultiplier: 1.85,
    moveSpeedMultiplier: 0.92,
    soundLoudness: 62,
  },
  smg_tactical: {
    weaponId: 'smg_tactical',
    weaponLabel: 'UMP-45 Tactical',
    category: 'smg',
    optimalRange: 15,
    maxEffectiveRange: 30,
    minComfortRange: 2.5,
    shotInterval: 0.098,
    burstMin: 3,
    burstMax: 5,
    burstPauseMin: 0.33,
    burstPauseMax: 0.54,
    baseDamage: 13,
    damageVariance: 5,
    accuracyBonus: 0.05,
    headshotMultiplier: 1.78,
    moveSpeedMultiplier: 1.06,
    soundLoudness: 40,
  },
  bullpup_aug: {
    weaponId: 'bullpup_aug',
    weaponLabel: 'AUG Bullpup',
    category: 'rifle',
    optimalRange: 26,
    maxEffectiveRange: 48,
    minComfortRange: 5.0,
    shotInterval: 0.105,
    burstMin: 2,
    burstMax: 4,
    burstPauseMin: 0.36,
    burstPauseMax: 0.58,
    baseDamage: 16,
    damageVariance: 6,
    accuracyBonus: 0.1,
    headshotMultiplier: 1.95,
    moveSpeedMultiplier: 1.0,
    soundLoudness: 44,
  },
  sniper_scout: {
    weaponId: 'sniper_scout',
    weaponLabel: 'Scout .308',
    category: 'sniper',
    optimalRange: 34,
    maxEffectiveRange: 70,
    minComfortRange: 8.5,
    shotInterval: 0.75,
    burstMin: 1,
    burstMax: 1,
    burstPauseMin: 0.78,
    burstPauseMax: 1.15,
    baseDamage: 38,
    damageVariance: 10,
    accuracyBonus: 0.14,
    headshotMultiplier: 2.0,
    moveSpeedMultiplier: 1.02,
    soundLoudness: 56,
  },
  sniper_dmr: {
    weaponId: 'sniper_dmr',
    weaponLabel: 'PSG-1 DMR',
    category: 'sniper',
    optimalRange: 32,
    maxEffectiveRange: 68,
    minComfortRange: 8.0,
    shotInterval: 0.34,
    burstMin: 1,
    burstMax: 2,
    burstPauseMin: 0.55,
    burstPauseMax: 0.85,
    baseDamage: 32,
    damageVariance: 9,
    accuracyBonus: 0.12,
    headshotMultiplier: 1.9,
    moveSpeedMultiplier: 0.95,
    soundLoudness: 58,
  },
  sniper_barrett: {
    weaponId: 'sniper_barrett',
    weaponLabel: 'Barrett .50 BMG',
    category: 'sniper',
    optimalRange: 40,
    maxEffectiveRange: 80,
    minComfortRange: 11.5,
    shotInterval: 1.08,
    burstMin: 1,
    burstMax: 1,
    burstPauseMin: 1.05,
    burstPauseMax: 1.45,
    baseDamage: 52,
    damageVariance: 16,
    accuracyBonus: 0.16,
    headshotMultiplier: 2.1,
    moveSpeedMultiplier: 0.89,
    soundLoudness: 68,
  },
};

export interface RoleArchetype {
  role: BotRole;
  personality: BotPersonality;
  aggressiveness: number; // 0.2 - 1.0
  caution: number; // 0.2 - 1.0
  retreatHpThreshold: number;
  preferredEngagementDist: number;
}

export const ROLE_ARCHETYPES: Record<BotRole, RoleArchetype> = {
  entry: {
    role: 'entry',
    personality: 'Agressivo',
    aggressiveness: 0.92,
    caution: 0.35,
    retreatHpThreshold: 22,
    preferredEngagementDist: 13,
  },
  support: {
    role: 'support',
    personality: 'Tático',
    aggressiveness: 0.62,
    caution: 0.68,
    retreatHpThreshold: 32,
    preferredEngagementDist: 20,
  },
  flanker: {
    role: 'flanker',
    personality: 'Flanqueador',
    aggressiveness: 0.78,
    caution: 0.55,
    retreatHpThreshold: 28,
    preferredEngagementDist: 15,
  },
  defender: {
    role: 'defender',
    personality: 'Defensivo',
    aggressiveness: 0.42,
    caution: 0.85,
    retreatHpThreshold: 38,
    preferredEngagementDist: 23,
  },
  sniper: {
    role: 'sniper',
    personality: 'Atirador',
    aggressiveness: 0.38,
    caution: 0.88,
    retreatHpThreshold: 40,
    preferredEngagementDist: 32,
  },
};

/**
 * Seleciona papel tático, personalidade e perfil de arma conforme índice no esquadrão e round
 */
export function createBotLoadoutForSlot(
  team: TeamSide,
  slotIndex: number,
  roundNumber: number
): {
  role: BotRole;
  personality: BotPersonality;
  weaponProfile: BotWeaponProfile;
  archetype: RoleArchetype;
} {
  const rolesOrder: BotRole[] = ['entry', 'support', 'flanker', 'defender', 'sniper'];
  const role = rolesOrder[slotIndex % rolesOrder.length];
  const archetype = ROLE_ARCHETYPES[role];

  let weaponKey = 'm4a1';
  if (role === 'entry') {
    weaponKey = roundNumber === 1 ? 'mp5' : team === 'CT' ? 'm4a1' : 'ak47';
  } else if (role === 'flanker') {
    weaponKey = roundNumber % 2 === 0 ? 'p90' : 'mp5';
  } else if (role === 'support') {
    weaponKey = roundNumber === 1 ? (team === 'CT' ? 'famas' : 'galil') : team === 'CT' ? 'm4a1' : 'ak47';
  } else if (role === 'defender') {
    weaponKey = team === 'CT' ? 'famas' : 'galil';
  } else if (role === 'sniper') {
    weaponKey = roundNumber === 1 ? (team === 'CT' ? 'm4a1' : 'ak47') : 'awp';
  }

  return {
    role,
    personality: archetype.personality,
    weaponProfile: BOT_WEAPON_PROFILES[weaponKey] || BOT_WEAPON_PROFILES.m4a1,
    archetype,
  };
}

/* ============================================================================
   2. TOPOLOGIA TÁTICA DO MAPA (GRAFO DE WAYPOINTS, ZONAS E COBERTURAS 3D)
   ============================================================================ */

export interface TacticalWaypointNode {
  index: number;
  position: THREE.Vector3;
  zone: TacticalZoneType;
  sector: TacticalSector;
  neighbors: { index: number; distance: number }[];
  isElevated: boolean;
}

export interface TacticalCoverNode {
  id: number;
  position: THREE.Vector3;
  peekLeftPos: THREE.Vector3;
  peekRightPos: THREE.Vector3;
  colliderCenter: THREE.Vector3;
  colliderHalfSize: THREE.Vector3;
  sector: TacticalSector;
}

export interface MapTacticalTopology {
  mapId: MapId;
  nodes: TacticalWaypointNode[];
  coverNodes: TacticalCoverNode[];
  zoneNodes: Record<TacticalZoneType, number[]>;
  sectorNodes: Record<TacticalSector, number[]>;
}

export function classifySector(x: number, z: number): TacticalSector {
  if (z < -6.5) return 'A';
  if (z > 6.5) return 'B';
  return 'MID';
}

export function classifyZone(x: number, z: number): TacticalZoneType {
  if (x < -17) return 'CT_BASE';
  if (x > 17) return 'TR_BASE';
  if (z < -9) return 'BOMBSITE_A';
  if (z > 9) return 'BOMBSITE_B';
  if (Math.abs(z) > 5.5) return 'FLANK';
  return 'MID';
}

/**
 * Constrói o grafo de navegação tático conectado e extrai nós de cobertura 3D
 * ao redor de caixas, pilares, muretas e veículos do mapa.
 */
export function buildMapTacticalTopology(
  mapId: MapId,
  rawWaypoints: [number, number, number][],
  colliders: AABBCollider[],
  elevationZones: ElevationZone[],
  collidesWithWorld: (x: number, z: number, radius: number, feetY?: number) => boolean,
  getGroundHeightAt: (x: number, z: number, currentY?: number) => number,
  checkLineOfSight: (
    ax: number,
    ay: number,
    az: number,
    bx: number,
    by: number,
    bz: number
  ) => boolean
): MapTacticalTopology {
  const nodes: TacticalWaypointNode[] = [];
  const zoneNodes: Record<TacticalZoneType, number[]> = {
    CT_BASE: [],
    TR_BASE: [],
    BOMBSITE_A: [],
    BOMBSITE_B: [],
    MID: [],
    FLANK: [],
  };
  const sectorNodes: Record<TacticalSector, number[]> = {
    A: [],
    MID: [],
    B: [],
  };

  for (let i = 0; i < rawWaypoints.length; i++) {
    const [wx, wy, wz] = rawWaypoints[i];
    const groundY = Math.max(wy, getGroundHeightAt(wx, wz, wy));
    const zone = classifyZone(wx, wz);
    const sector = classifySector(wx, wz);
    const node: TacticalWaypointNode = {
      index: i,
      position: new THREE.Vector3(wx, groundY, wz),
      zone,
      sector,
      neighbors: [],
      isElevated: groundY > 0.45,
    };
    nodes.push(node);
    zoneNodes[zone].push(i);
    sectorNodes[sector].push(i);
  }

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i].position;
      const b = nodes[j].position;
      const dist2D = Math.hypot(a.x - b.x, a.z - b.z);
      const heightDiff = Math.abs(a.y - b.y);

      if (dist2D > 22 || heightDiff > 3.2) continue;

      const canConnect = checkLineOfSight(
        a.x,
        a.y + 1.1,
        a.z,
        b.x,
        b.y + 1.1,
        b.z
      );

      let walkableMid = true;
      if (!canConnect && dist2D < 13) {
        const midX = (a.x + b.x) * 0.5;
        const midZ = (a.z + b.z) * 0.5;
        const midY = getGroundHeightAt(midX, midZ, Math.max(a.y, b.y));
        walkableMid = !collidesWithWorld(midX, midZ, 0.5, midY + 1.72);
      } else if (!canConnect) {
        walkableMid = false;
      }

      if (canConnect || walkableMid) {
        const dist3D = a.distanceTo(b);
        nodes[i].neighbors.push({ index: j, distance: dist3D });
        nodes[j].neighbors.push({ index: i, distance: dist3D });
      }
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].neighbors.length === 0) {
      const sorted = nodes
        .map((other, idx) => ({
          idx,
          dist: nodes[i].position.distanceTo(other.position),
        }))
        .filter((item) => item.idx !== i)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 2);
      for (const s of sorted) {
        nodes[i].neighbors.push({ index: s.idx, distance: s.dist });
        nodes[s.idx].neighbors.push({ index: i, distance: s.dist });
      }
    }
  }

  const coverNodes: TacticalCoverNode[] = [];
  let coverIdCounter = 0;

  for (let cIdx = 0; cIdx < colliders.length; cIdx++) {
    const col = colliders[cIdx];
    const width = col.maxX - col.minX;
    const depth = col.maxZ - col.minZ;
    const height = col.maxY - col.minY;

    if (height < 1.15 || width > 24 || depth > 24) continue;
    if (width < 0.55 && depth < 0.55) continue;

    const cx = (col.minX + col.maxX) * 0.5;
    const cz = (col.minZ + col.maxZ) * 0.5;
    const cy = col.minY;

    const groundAtCenter = getGroundHeightAt(cx, cz, cy);
    if (col.minY > groundAtCenter + 1.2) continue;

    const halfW = width * 0.5;
    const halfD = depth * 0.5;
    const standOffset = 0.88;
    const peekDist = Math.min(1.35, Math.max(0.85, Math.min(halfW, halfD) + 0.55));

    const sides = [
      {
        pos: new THREE.Vector3(col.minX - standOffset, groundAtCenter, cz),
        peekL: new THREE.Vector3(col.minX - standOffset + 0.25, groundAtCenter, col.minZ - 0.55),
        peekR: new THREE.Vector3(col.minX - standOffset + 0.25, groundAtCenter, col.maxZ + 0.55),
      },
      {
        pos: new THREE.Vector3(col.maxX + standOffset, groundAtCenter, cz),
        peekL: new THREE.Vector3(col.maxX + standOffset - 0.25, groundAtCenter, col.maxZ + 0.55),
        peekR: new THREE.Vector3(col.maxX + standOffset - 0.25, groundAtCenter, col.minZ - 0.55),
      },
      {
        pos: new THREE.Vector3(cx, groundAtCenter, col.minZ - standOffset),
        peekL: new THREE.Vector3(col.maxX + 0.55, groundAtCenter, col.minZ - standOffset + 0.25),
        peekR: new THREE.Vector3(col.minX - 0.55, groundAtCenter, col.minZ - standOffset + 0.25),
      },
      {
        pos: new THREE.Vector3(cx, groundAtCenter, col.maxZ + standOffset),
        peekL: new THREE.Vector3(col.minX - 0.55, groundAtCenter, col.maxZ + standOffset - 0.25),
        peekR: new THREE.Vector3(col.maxX + 0.55, groundAtCenter, col.maxZ + standOffset - 0.25),
      },
    ];

    for (const side of sides) {
      const sy = getGroundHeightAt(side.pos.x, side.pos.z, groundAtCenter);
      if (Math.abs(sy - groundAtCenter) > 0.9) continue;
      if (collidesWithWorld(side.pos.x, side.pos.z, 0.54, sy + 1.72)) continue;

      side.pos.y = sy;
      side.peekL.y = getGroundHeightAt(side.peekL.x, side.peekL.z, sy);
      side.peekR.y = getGroundHeightAt(side.peekR.x, side.peekR.z, sy);

      if (collidesWithWorld(side.peekL.x, side.peekL.z, 0.48, side.peekL.y + 1.72)) {
        side.peekL.copy(side.pos).add(new THREE.Vector3(0, 0, peekDist * 0.4));
      }
      if (collidesWithWorld(side.peekR.x, side.peekR.z, 0.48, side.peekR.y + 1.72)) {
        side.peekR.copy(side.pos).add(new THREE.Vector3(0, 0, -peekDist * 0.4));
      }

      coverNodes.push({
        id: coverIdCounter++,
        position: side.pos,
        peekLeftPos: side.peekL,
        peekRightPos: side.peekR,
        colliderCenter: new THREE.Vector3(cx, col.minY + height * 0.5, cz),
        colliderHalfSize: new THREE.Vector3(halfW, height * 0.5, halfD),
        sector: classifySector(side.pos.x, side.pos.z),
      });
    }
  }

  return {
    mapId,
    nodes,
    coverNodes,
    zoneNodes,
    sectorNodes,
  };
}

/**
 * Busca caminho tático ponderado (A*) entre dois waypoints, penalizando zonas de alto risco
 * quando o bot deseja flanquear ou recuar.
 */
export function findTacticalPath(
  topology: MapTacticalTopology,
  startIdx: number,
  goalIdx: number,
  dangerCheck?: (pos: THREE.Vector3) => number
): number[] {
  if (
    startIdx < 0 ||
    goalIdx < 0 ||
    startIdx >= topology.nodes.length ||
    goalIdx >= topology.nodes.length
  ) {
    return [Math.max(0, goalIdx)];
  }
  if (startIdx === goalIdx) return [goalIdx];

  const n = topology.nodes.length;
  const gScore = new Float32Array(n).fill(Infinity);
  const fScore = new Float32Array(n).fill(Infinity);
  const cameFrom = new Int16Array(n).fill(-1);
  const visited = new Uint8Array(n);
  const openSet: number[] = [startIdx];

  const goalPos = topology.nodes[goalIdx].position;
  gScore[startIdx] = 0;
  fScore[startIdx] = topology.nodes[startIdx].position.distanceTo(goalPos);

  while (openSet.length > 0) {
    let bestOpenIdx = 0;
    let current = openSet[0];
    for (let i = 1; i < openSet.length; i++) {
      const nodeIdx = openSet[i];
      if (fScore[nodeIdx] < fScore[current]) {
        current = nodeIdx;
        bestOpenIdx = i;
      }
    }

    if (current === goalIdx) {
      const path: number[] = [];
      let curr: number = current;
      while (curr !== -1 && curr !== startIdx) {
        path.push(curr);
        curr = cameFrom[curr];
      }
      path.reverse();
      return path.length > 0 ? path : [goalIdx];
    }

    openSet.splice(bestOpenIdx, 1);
    visited[current] = 1;

    const currentNode = topology.nodes[current];
    for (let i = 0; i < currentNode.neighbors.length; i++) {
      const edge = currentNode.neighbors[i];
      const neighbor = edge.index;
      if (visited[neighbor]) continue;

      const neighborNode = topology.nodes[neighbor];
      const dangerPenalty = dangerCheck ? dangerCheck(neighborNode.position) : 0;
      const tentativeG = gScore[current] + edge.distance + dangerPenalty;

      if (tentativeG < gScore[neighbor]) {
        cameFrom[neighbor] = current;
        gScore[neighbor] = tentativeG;
        fScore[neighbor] = tentativeG + neighborNode.position.distanceTo(goalPos);
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return [goalIdx];
}

/* ============================================================================
   3. BLACKBOARD TÁTICO DE EQUIPE, MEMÓRIA DE COMBATE E ADAPTAÇÃO DE 7 ROUNDS
   ============================================================================ */

export interface KnownEnemyMemory {
  targetId: string; // 'PLAYER' ou 'BOT_<id>'
  lastKnownPos: THREE.Vector3;
  estimatedVelocity: THREE.Vector3;
  lastSeenTime: number;
  isVisualConfirmation: boolean;
  reportedByBotId: number;
}

export interface SoundEventRecord {
  position: THREE.Vector3;
  team: TeamSide;
  loudness: number;
  timestamp: number;
}

export interface DangerHotspot {
  position: THREE.Vector3;
  sector: TacticalSector;
  intensity: number;
  timestamp: number;
}

export interface TeamBlackboard {
  team: TeamSide;
  knownEnemies: Map<string, KnownEnemyMemory>;
  dangerHotspots: DangerHotspot[];
  allyUnderFireId: number | null;
  allyUnderFirePos: THREE.Vector3 | null;
  allyUnderFireTime: number;
  preferredSectorFocus: TacticalSector;
  reservedCoverNodes: Map<number, number>; // coverId -> botId
  assignedWaypointGoals: Map<number, number>; // botId -> waypointIdx
}

export interface CrossRoundMemory {
  enemySectorActivity: Record<TeamSide, Record<TacticalSector, number>>;
  roundsWonByTeam: Record<TeamSide, number>;
  consecutiveLosses: Record<TeamSide, number>;
}

export interface MatchTacticalBlackboard {
  elapsedTime: number;
  teams: Record<TeamSide, TeamBlackboard>;
  soundEvents: SoundEventRecord[];
  crossRound: CrossRoundMemory;
}

export function createMatchTacticalBlackboard(): MatchTacticalBlackboard {
  return {
    elapsedTime: 0,
    teams: {
      CT: {
        team: 'CT',
        knownEnemies: new Map(),
        dangerHotspots: [],
        allyUnderFireId: null,
        allyUnderFirePos: null,
        allyUnderFireTime: -99,
        preferredSectorFocus: 'MID',
        reservedCoverNodes: new Map(),
        assignedWaypointGoals: new Map(),
      },
      TR: {
        team: 'TR',
        knownEnemies: new Map(),
        dangerHotspots: [],
        allyUnderFireId: null,
        allyUnderFirePos: null,
        allyUnderFireTime: -99,
        preferredSectorFocus: 'A',
        reservedCoverNodes: new Map(),
        assignedWaypointGoals: new Map(),
      },
    },
    soundEvents: [],
    crossRound: {
      enemySectorActivity: {
        CT: { A: 1, MID: 1, B: 1 },
        TR: { A: 1, MID: 1, B: 1 },
      },
      roundsWonByTeam: { CT: 0, TR: 0 },
      consecutiveLosses: { CT: 0, TR: 0 },
    },
  };
}

/**
 * Limpa a memória de curto prazo no início de cada round, mas preserva e adapta
 * o aprendizado estratégico acumulado nos rounds anteriores da partida de 7 rounds.
 */
export function prepareBlackboardForNewRound(
  blackboard: MatchTacticalBlackboard,
  roundNumber: number
): void {
  blackboard.soundEvents.length = 0;

  (['CT', 'TR'] as TeamSide[]).forEach((side) => {
    const tb = blackboard.teams[side];
    tb.knownEnemies.clear();
    tb.dangerHotspots.length = 0;
    tb.allyUnderFireId = null;
    tb.allyUnderFirePos = null;
    tb.allyUnderFireTime = -99;
    tb.reservedCoverNodes.clear();
    tb.assignedWaypointGoals.clear();

    const enemySide: TeamSide = side === 'CT' ? 'TR' : 'CT';
    const enemyAct = blackboard.crossRound.enemySectorActivity[enemySide];

    if (roundNumber <= 1) {
      tb.preferredSectorFocus = side === 'CT' ? 'MID' : Math.random() > 0.5 ? 'A' : 'B';
    } else {
      const sortedSectors = (['A', 'MID', 'B'] as TacticalSector[]).sort(
        (s1, s2) => enemyAct[s2] - enemyAct[s1]
      );
      if (side === 'CT') {
        tb.preferredSectorFocus = sortedSectors[0];
      } else {
        const lostPrevious = blackboard.crossRound.consecutiveLosses.TR > 0;
        tb.preferredSectorFocus = lostPrevious ? sortedSectors[2] : sortedSectors[0];
      }
    }
  });
}

/**
 * Registra resultado do round para adaptação tática da equipe nos próximos rounds.
 */
export function recordRoundOutcomeInBlackboard(
  blackboard: MatchTacticalBlackboard,
  winningTeam: TeamSide
): void {
  const losingTeam: TeamSide = winningTeam === 'CT' ? 'TR' : 'CT';
  blackboard.crossRound.roundsWonByTeam[winningTeam]++;
  blackboard.crossRound.consecutiveLosses[winningTeam] = 0;
  blackboard.crossRound.consecutiveLosses[losingTeam]++;
}

/**
 * Registra disparo de arma (do jogador ou de um bot) para percepção sonora realista.
 */
export function registerTacticalSoundEvent(
  blackboard: MatchTacticalBlackboard,
  position: THREE.Vector3,
  shooterTeam: TeamSide,
  loudness = 46
): void {
  const sector = classifySector(position.x, position.z);
  blackboard.crossRound.enemySectorActivity[shooterTeam][sector] += 0.35;

  blackboard.soundEvents.push({
    position: position.clone(),
    team: shooterTeam,
    loudness,
    timestamp: blackboard.elapsedTime,
  });

  if (blackboard.soundEvents.length > 24) {
    blackboard.soundEvents.shift();
  }
}

/**
 * Registra morte de um combatente para criar zona de perigo temporária (hotspot) no mapa
 * e alimentar a memória tática da equipe.
 */
export function registerTacticalDeathEvent(
  blackboard: MatchTacticalBlackboard,
  victimTeam: TeamSide,
  victimPosition: THREE.Vector3,
  killerPosition?: THREE.Vector3,
  killerId?: string
): void {
  const tb = blackboard.teams[victimTeam];
  const sector = classifySector(victimPosition.x, victimPosition.z);

  tb.dangerHotspots.push({
    position: victimPosition.clone(),
    sector,
    intensity: 6.5,
    timestamp: blackboard.elapsedTime,
  });

  if (killerPosition && killerId) {
    tb.knownEnemies.set(killerId, {
      targetId: killerId,
      lastKnownPos: killerPosition.clone(),
      estimatedVelocity: new THREE.Vector3(),
      lastSeenTime: blackboard.elapsedTime,
      isVisualConfirmation: false,
      reportedByBotId: -1,
    });
  }
}

/**
 * Registra ou atualiza a percepção de um inimigo no blackboard da equipe.
 * Reutiliza os vetores Vector3 existentes para evitar alocações de memória por frame.
 */
export function recordKnownEnemyInBlackboard(
  teamBB: TeamBlackboard,
  spottedId: string,
  pos: THREE.Vector3,
  vel: THREE.Vector3,
  currentTime: number,
  botId: number,
  isVisual = true
): void {
  const existing = teamBB.knownEnemies.get(spottedId);
  if (existing) {
    existing.lastKnownPos.copy(pos);
    existing.estimatedVelocity.copy(vel);
    existing.lastSeenTime = currentTime;
    existing.isVisualConfirmation = isVisual;
    existing.reportedByBotId = botId;
  } else {
    teamBB.knownEnemies.set(spottedId, {
      targetId: spottedId,
      lastKnownPos: pos.clone(),
      estimatedVelocity: vel.clone(),
      lastSeenTime: currentTime,
      isVisualConfirmation: isVisual,
      reportedByBotId: botId,
    });
  }
}

/**
 * Remove percepções de inimigos que não foram avistados nos últimos maxAgeSec segundos (padrão 3.0s).
 */
export function pruneTeamKnownEnemies(
  teamBB: TeamBlackboard,
  currentTime: number,
  maxAgeSec = 3.0
): void {
  for (const [targetId, mem] of teamBB.knownEnemies.entries()) {
    if (currentTime - mem.lastSeenTime > maxAgeSec) {
      teamBB.knownEnemies.delete(targetId);
    }
  }
}

/**
 * Limpeza periódica do Blackboard (executada a cada 0.2s):
 * - Purga alvos vistos há mais de maxAgeSec (3.0s) de ambas as equipes.
 * - Limpa sons antigos (> 2.5s).
 * - Remove hotspots de perigo com tempo esgotado (> 12.0s).
 */
export function pruneExpiredBlackboardIntel(
  matchBB: MatchTacticalBlackboard,
  maxAgeSec = 3.0
): void {
  const now = matchBB.elapsedTime;
  pruneTeamKnownEnemies(matchBB.teams.CT, now, maxAgeSec);
  pruneTeamKnownEnemies(matchBB.teams.TR, now, maxAgeSec);

  // Limpeza de eventos sonoros antigos
  if (matchBB.soundEvents.length > 0) {
    let writeIdx = 0;
    for (let i = 0; i < matchBB.soundEvents.length; i++) {
      if (now - matchBB.soundEvents[i].timestamp <= 2.5) {
        if (writeIdx !== i) {
          matchBB.soundEvents[writeIdx] = matchBB.soundEvents[i];
        }
        writeIdx++;
      }
    }
    matchBB.soundEvents.length = writeIdx;
  }

  // Limpeza de hotspots de perigo
  (['CT', 'TR'] as TeamSide[]).forEach((side) => {
    const tb = matchBB.teams[side];
    if (tb.dangerHotspots.length > 0) {
      let writeIdx = 0;
      for (let i = 0; i < tb.dangerHotspots.length; i++) {
        if (now - tb.dangerHotspots[i].timestamp <= 12.0) {
          if (writeIdx !== i) {
            tb.dangerHotspots[writeIdx] = tb.dangerHotspots[i];
          }
          writeIdx++;
        }
      }
      tb.dangerHotspots.length = writeIdx;
    }
  });
}

/**
 * Remove imediatamente um combatente eliminado da lista de conhecidos de ambas as equipes.
 * Garante que bots não continuem perseguindo ou atirando na posição de combatentes mortos.
 */
export function purgeEnemyFromBlackboards(
  matchBB: MatchTacticalBlackboard,
  targetId: string
): void {
  matchBB.teams.CT.knownEnemies.delete(targetId);
  matchBB.teams.TR.knownEnemies.delete(targetId);

  // Se o alvo eliminado era um bot aliado sob fogo, limpa o status
  if (targetId.startsWith('BOT_')) {
    const botNum = parseInt(targetId.substring(4), 10);
    if (!isNaN(botNum)) {
      if (matchBB.teams.CT.allyUnderFireId === botNum) {
        matchBB.teams.CT.allyUnderFireId = null;
        matchBB.teams.CT.allyUnderFirePos = null;
      }
      if (matchBB.teams.TR.allyUnderFireId === botNum) {
        matchBB.teams.TR.allyUnderFireId = null;
        matchBB.teams.TR.allyUnderFirePos = null;
      }
    }
  }
}


/* ============================================================================
   4. ESTADO INDIVIDUAL DE IA POR BOT (COMPOSIÇÃO COM BotEntity)
   ============================================================================ */

export interface BotTacticalBrain {
  role: BotRole;
  personality: BotPersonality;
  weaponProfile: BotWeaponProfile;
  archetype: RoleArchetype;
  state: BotTacticalState;
  stateTimer: number;
  decisionTickTimer: number;

  // Navegação em grafo
  pathQueue: number[];
  assignedSector: TacticalSector;
  lastPosition: THREE.Vector3;
  stuckTimer: number;
  unstuckDir: number;

  // Percepção e Mira humana (sem aimbot/wallhack)
  currentTargetId: string | null;
  targetAcquisitionTimer: number; // Tempo de reação humana ao ver um novo alvo
  lastTargetPos: THREE.Vector3;
  hasLastTargetPos: boolean;
  lastSeenTimestamp: number;
  aimYaw: number;

  // Sistema de Cobertura 3D e Peeking
  activeCoverNodeId: number | null;
  isPeekingOut: boolean;
  peekPhaseTimer: number;
  peekSide: 'left' | 'right';
  recentlyDamagedTimer: number;
}

export function createBotTacticalBrain(
  team: TeamSide,
  slotIndex: number,
  roundNumber: number,
  initialPos: THREE.Vector3,
  initialYaw: number,
  preferredTeamSector: TacticalSector
): BotTacticalBrain {
  const loadout = createBotLoadoutForSlot(team, slotIndex, roundNumber);

  const sectorDistribution: TacticalSector[] =
    preferredTeamSector === 'A'
      ? ['A', 'A', 'MID', 'B', 'A']
      : preferredTeamSector === 'B'
      ? ['B', 'B', 'MID', 'A', 'B']
      : ['MID', 'A', 'B', 'MID', 'A'];

  return {
    role: loadout.role,
    personality: loadout.personality,
    weaponProfile: loadout.weaponProfile,
    archetype: loadout.archetype,
    state: 'TACTICAL_ADVANCE',
    stateTimer: 2.0 + Math.random() * 1.5,
    decisionTickTimer: (slotIndex * 0.03) % 0.15,
    pathQueue: [],
    assignedSector: sectorDistribution[slotIndex % sectorDistribution.length],
    lastPosition: initialPos.clone(),
    stuckTimer: 0,
    unstuckDir: slotIndex % 2 === 0 ? 1 : -1,
    currentTargetId: null,
    targetAcquisitionTimer: 0,
    lastTargetPos: new THREE.Vector3(),
    hasLastTargetPos: false,
    lastSeenTimestamp: -99,
    aimYaw: initialYaw,
    activeCoverNodeId: null,
    isPeekingOut: false,
    peekPhaseTimer: 0,
    peekSide: slotIndex % 2 === 0 ? 'left' : 'right',
    recentlyDamagedTimer: 0,
  };
}

/* ============================================================================
   5. FUNÇÕES DE COBERTURA INTELIGENTE, PERCEPÇÃO E AVALIAÇÃO DE UTILIDADE
   ============================================================================ */

const _tmpVecA = new THREE.Vector3();
const _tmpVecB = new THREE.Vector3();

/**
 * Verifica se um ponto está dentro do cone de visão (FOV) do bot, ou muito próximo (percepção periférica curta).
 */
export function isTargetWithinBotVisionCone(
  botPos: THREE.Vector3,
  botYaw: number,
  targetPos: THREE.Vector3,
  fovCosine: number
): boolean {
  const dx = targetPos.x - botPos.x;
  const dz = targetPos.z - botPos.z;
  const distSq = dx * dx + dz * dz;
  if (distSq < 18.0) return true; // Dentro de ~4.2m o bot percebe presença imediata
  const dist = Math.sqrt(distSq);
  // Em Three.js, quando group.lookAt(target) é usado, o eixo +Z local aponta para o alvo:
  const lookDirX = Math.sin(botYaw);
  const lookDirZ = Math.cos(botYaw);
  const dot = (dx / dist) * lookDirX + (dz / dist) * lookDirZ;
  return dot >= fovCosine;
}

/**
 * Interpola suavemente o ângulo de rotação horizontal do bot (evita giros instantâneos robóticos).
 */
export function smoothBotYawTowards(
  currentYaw: number,
  targetX: number,
  targetZ: number,
  botX: number,
  botZ: number,
  turnSpeed: number,
  dt: number
): number {
  const desiredYaw = Math.atan2(targetX - botX, targetZ - botZ);
  let diff = desiredYaw - currentYaw;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  const maxStep = turnSpeed * dt;
  if (Math.abs(diff) <= maxStep) return desiredYaw;
  return currentYaw + Math.sign(diff) * maxStep;
}

/**
 * Encontra o melhor nó de cobertura 3D próximo ao bot que bloqueie a linha de visão
 * contra a ameaça principal e não esteja ocupado por outro aliado.
 */
export function selectBestCoverNode(
  botId: number,
  botPos: THREE.Vector3,
  threatPos: THREE.Vector3,
  topology: MapTacticalTopology,
  teamBlackboard: TeamBlackboard,
  checkLineOfSight: (
    ax: number,
    ay: number,
    az: number,
    bx: number,
    by: number,
    bz: number
  ) => boolean,
  preferRetreat: boolean
): TacticalCoverNode | null {
  let bestNode: TacticalCoverNode | null = null;
  let bestScore = -Infinity;

  const botDistToThreat = botPos.distanceTo(threatPos);

  for (let i = 0; i < topology.coverNodes.length; i++) {
    const cNode = topology.coverNodes[i];

    const reservedBy = teamBlackboard.reservedCoverNodes.get(cNode.id);
    if (reservedBy !== undefined && reservedBy !== botId) continue;

    const distFromBot = botPos.distanceTo(cNode.position);
    if (distFromBot > 16.5) continue;

    const distToThreat = cNode.position.distanceTo(threatPos);
    if (distToThreat < 3.2) continue;

    _tmpVecA.subVectors(threatPos, cNode.position).normalize();
    _tmpVecB.subVectors(cNode.colliderCenter, cNode.position).normalize();
    const dotObstacleBetween = _tmpVecA.x * _tmpVecB.x + _tmpVecA.z * _tmpVecB.z;

    if (dotObstacleBetween < 0.25) continue;

    const blocksSight = !checkLineOfSight(
      cNode.position.x,
      cNode.position.y + 1.35,
      cNode.position.z,
      threatPos.x,
      threatPos.y + 1.35,
      threatPos.z
    );

    let score = -distFromBot * 1.45;
    if (blocksSight) score += 22.0;
    score += dotObstacleBetween * 8.0;

    if (preferRetreat && distToThreat > botDistToThreat) {
      score += 7.5;
    } else if (!preferRetreat && Math.abs(distToThreat - 16) < 8) {
      score += 4.0;
    }

    if (score > bestScore) {
      bestScore = score;
      bestNode = cNode;
    }
  }

  return bestNode;
}

/**
 * Seleciona o próximo waypoint estratégico para o bot com base em seu papel,
 * setor atribuído, posição de aliados e informações do Blackboard.
 */
export function selectStrategicGoalWaypoint(
  botId: number,
  botTeam: TeamSide,
  botPos: THREE.Vector3,
  brain: BotTacticalBrain,
  topology: MapTacticalTopology,
  teamBlackboard: TeamBlackboard,
  targetHintPos: THREE.Vector3 | null
): number {
  const nodes = topology.nodes;
  if (nodes.length === 0) return 0;

  let bestIdx = 0;
  let bestScore = -Infinity;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const distFromBot = botPos.distanceTo(node.position);
    if (distFromBot < 2.2) continue;

    let score = 0;

    for (const [allyId, goalIdx] of teamBlackboard.assignedWaypointGoals.entries()) {
      if (allyId !== botId && goalIdx === i) {
        score -= 18;
      }
    }

    for (let h = 0; h < teamBlackboard.dangerHotspots.length; h++) {
      const spot = teamBlackboard.dangerHotspots[h];
      const dSpot = node.position.distanceTo(spot.position);
      if (dSpot < 8.5) {
        score -= (8.5 - dSpot) * brain.archetype.caution * 1.6;
      }
    }

    if (targetHintPos) {
      const distToTarget = node.position.distanceTo(targetHintPos);
      if (brain.role === 'flanker') {
        if (
          node.zone === 'FLANK' ||
          node.sector !== classifySector(targetHintPos.x, targetHintPos.z)
        ) {
          score += 10;
        }
        score -= Math.abs(distToTarget - 11) * 1.15;
      } else if (brain.role === 'sniper' || brain.role === 'defender') {
        score -= Math.abs(distToTarget - brain.archetype.preferredEngagementDist) * 1.1;
        if (node.isElevated) score += 9;
      } else {
        score -= distToTarget * 1.25;
      }
    } else {
      if (node.sector === brain.assignedSector) {
        score += 14;
      }
      if (brain.role === 'sniper' && node.isElevated) {
        score += 12;
      }
      if (brain.role === 'defender') {
        if (
          node.zone === 'BOMBSITE_A' ||
          node.zone === 'BOMBSITE_B' ||
          node.zone === 'MID'
        ) {
          score += 10;
        }
        if (node.isElevated) score += 6;
      }
      if (brain.role === 'flanker' && (node.zone === 'FLANK' || node.sector !== 'MID')) {
        score += 11;
      }
      if (brain.role === 'entry') {
        const enemySideX = botTeam === 'CT' ? 14 : -14;
        score -= Math.abs(node.position.x - enemySideX) * 0.45;
      }
      score -= distFromBot * 0.25;
    }

    score += (Math.random() - 0.5) * 3.5;

    if (score > bestScore) {
      bestScore = score;
      bestIdx = i;
    }
  }

  teamBlackboard.assignedWaypointGoals.set(botId, bestIdx);
  return bestIdx;
}

/**
 * Encontra o índice do waypoint mais próximo de uma posição 3D.
 */
export function findNearestWaypointIndex(
  topology: MapTacticalTopology,
  pos: THREE.Vector3
): number {
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < topology.nodes.length; i++) {
    const d = topology.nodes[i].position.distanceToSquared(pos);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return bestIdx;
}
