/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Crosshair,
  Shield,
  Heart,
  DollarSign,
  Skull,
  Volume2,
  VolumeX,
  ShoppingBag,
  Code2,
  Copy,
  Download,
  Check,
  Play,
  RotateCcw,
  Music,
  Disc,
  Swords,
  Eye,
  Users,
  Clock,
  UserCheck,
  Sparkles,
  HelpCircle,
  Keyboard,
  ChevronRight,
  ArrowLeft,
  Flame,
  Hourglass,
  MapPin,
} from 'lucide-react';
import { TacticalAudioEngine, MusicTrackId } from './soundEngine';
import {
  WEAPON_CATALOG,
  WeaponSpec,
  WeaponShopTab,
  STANDALONE_HTML_SOURCE,
} from './standaloneHtmlGenerator';
import { MenuBackground } from './components/MenuBackground';
import { createTeamCharacterModel } from './characterModels';
import { buildFirstPersonWeaponViewmodel } from './weaponModels';
import {
  MapId,
  MAP_CATALOG,
  AABBCollider,
  ElevationZone,
  BuiltArenaMap,
  buildArenaMapById,
  getGroundElevationAt,
} from './mapModels';

type TeamSide = 'CT' | 'TR';

interface KillfeedEntry {
  id: number;
  killer: string;
  killerTeam: TeamSide;
  victim: string;
  victimTeam: TeamSide;
  weaponName: string;
  isHeadshot: boolean;
}

interface WeaponAmmoState {
  clip: number;
  reserve: number;
}

interface HudState {
  activeMapId: MapId;
  playerTeam: TeamSide;
  isPlayerDead: boolean;
  spectatingAllyName: string | null;
  spectatingAllyHp: number;
  hp: number;
  armor: number;
  money: number;
  kills: number;
  headshots: number;
  round: number;
  roundTimeSec: number; // 300s = 05:00
  freezeTimeSec: number; // 10s contagem regressiva de preparo (Freeze Time)
  isFreezeActive: boolean;
  ctScore: number;
  trScore: number;
  ctAlive: number;
  trAlive: number;
  loadout: string[]; // ['knife', slotArma1, slotArma2]
  activeSlotIndex: number;
  activeWeaponId: string;
  activeAmmo: WeaponAmmoState;
  zoomLevel: number; // 0 = Desligado, 1 = 2x (28°), 2 = 4x (11°)
  isReloading: boolean;
  wheelFlashVisible: boolean;
  bannerText: string;
}

interface BotEntity {
  id: number;
  name: string;
  team: TeamSide;
  group: THREE.Group;
  headMesh: THREE.Mesh;
  torsoMesh: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  allyMarker: THREE.Mesh | null;
  bodyMat: THREE.MeshStandardMaterial;
  headMat: THREE.MeshStandardMaterial;
  baseBodyColor: number;
  baseHeadColor: number;
  muzzleFlash: THREE.Mesh;
  weaponLabel: string;
  hp: number;
  maxHp: number;
  speed: number;
  attackCooldown: number;
  burstShotsLeft: number;
  burstShotTimer: number;
  hitFlashTimer: number;
  strafeDir: number;
  strafeTimer: number;
  walkCycle: number;
  waypointIndex: number;
  waypointTimer: number;
  patrolGoal: THREE.Vector3;
}

interface SparkParticle {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
}

interface BulletTracer {
  mesh: THREE.Mesh;
  life: number;
  maxLife: number;
}


// Ângulos dos sensores de desvio (Whiskers) para contornar paredes e caixas suavemente
const STEER_ANGLES = [0, 0.42, -0.42, 0.85, -0.85, 1.3, -1.3, 1.75, -1.75];

// Vetores reutilizáveis fora do loop de renderização (Zero GC no Game Loop)
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const _moveDir = new THREE.Vector3();
const _toTarget = new THREE.Vector3();
const _eyeOrigin = new THREE.Vector3();
const _rayDir = new THREE.Vector3();
const _ndcCenter = new THREE.Vector2(0, 0);

const CT_BOT_NAMES = [
  'PM_Capitao',
  'BOPE_ZeroUm',
  'CHOQUE_Tatico',
  'GATE_Operador',
  'PM_Patrulha',
  'PM_Incursao',
];

const TR_BOT_NAMES = [
  'RubroNegro_RJ',
  'Falcao_Morro',
  'Sombra_Vila',
  'Relampago_ZS',
  'Barao_Beco',
  'Trovoada_Sul',
];

const MUSIC_TRACK_LABELS: Record<MusicTrackId, string> = {
  cs_tactical: 'CS 1.6 Tactical Theme',
  dust_breakbeat: 'Dust II Breakbeat',
  stealth_pulse: 'Spec-Ops Stealth',
};

function formatRoundClock(seconds: number): string {
  const clamped = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<TacticalAudioEngine>(new TacticalAudioEngine());

  const [gameMode, setGameMode] = useState<'title' | 'playing' | 'paused'>('title');
  const [menuTab, setMenuTab] = useState<'main' | 'maps' | 'team' | 'arsenal' | 'controls'>('main');
  const [shopTab, setShopTab] = useState<WeaponShopTab>('rifles');
  const [bgStyle, setBgStyle] = useState<'dust2' | 'sandstorm' | 'tactical_night'>('dust2');
  const [isBuyOpen, setIsBuyOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicTrack, setMusicTrack] = useState<MusicTrackId>('cs_tactical');
  const [damageFlash, setDamageFlash] = useState(false);
  const [headshotFlash, setHeadshotFlash] = useState(false);
  const [killfeed, setKillfeed] = useState<KillfeedEntry[]>([]);

  const [hud, setHud] = useState<HudState>({
    activeMapId: 'complexo',
    playerTeam: 'CT',
    isPlayerDead: false,
    spectatingAllyName: null,
    spectatingAllyHp: 0,
    hp: 100,
    armor: 100,
    money: 1200,
    kills: 0,
    headshots: 0,
    round: 1,
    roundTimeSec: 300, // 5 minutos (05:00)
    freezeTimeSec: 10, // 10 segundos de preparo
    isFreezeActive: true,
    ctScore: 0,
    trScore: 0,
    ctAlive: 5,
    trAlive: 5,
    loadout: ['knife', 'ak47', 'awp'],
    activeSlotIndex: 0,
    activeWeaponId: 'knife',
    activeAmmo: { clip: 1, reserve: 1 },
    zoomLevel: 0,
    isReloading: false,
    wheelFlashVisible: false,
    bannerText: '',
  });

  // Referências mutáveis para sincronizar o Game Loop Three.js sem recriar o canvas
  const gameRef = useRef<{
    isLocked: boolean;
    isBuyOpen: boolean;
    isCodeOpen: boolean;
    gameMode: 'title' | 'playing' | 'paused';
    requestLock: () => void;
    selectMap: (mapId: MapId, startImmediately?: boolean) => void;
    selectTeamAndStart: (team: TeamSide) => void;
    takeoverAlliedBot: () => void;
    buyItem: (itemKey: string, targetSlot?: 1 | 2) => void;
    switchToSlot: (slotIndex: number) => void;
    cycleNextWeaponQ: () => void;
    restartMatch: () => void;
    returnToMenu: () => void;
  }>({
    isLocked: false,
    isBuyOpen: false,
    isCodeOpen: false,
    gameMode: 'title',
    requestLock: () => {},
    selectMap: () => {},
    selectTeamAndStart: () => {},
    takeoverAlliedBot: () => {},
    buyItem: () => {},
    switchToSlot: () => {},
    cycleNextWeaponQ: () => {},
    restartMatch: () => {},
    returnToMenu: () => {},
  });

  useEffect(() => {
    gameRef.current.isBuyOpen = isBuyOpen;
    gameRef.current.isCodeOpen = isCodeModalOpen;
    gameRef.current.gameMode = gameMode;
  }, [isBuyOpen, isCodeModalOpen, gameMode]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      audioRef.current.muted = next;
      if (next) {
        audioRef.current.stopMusic();
        setIsMusicPlaying(false);
      }
      return next;
    });
  }, []);

  const toggleMusic = useCallback(() => {
    const active = audioRef.current.toggleMusic();
    setIsMusicPlaying(active);
  }, []);

  const cycleMusicTrack = useCallback(() => {
    const order: MusicTrackId[] = ['cs_tactical', 'dust_breakbeat', 'stealth_pulse'];
    const nextTrack = order[(order.indexOf(musicTrack) + 1) % order.length];
    setMusicTrack(nextTrack);
    audioRef.current.startMusic(nextTrack);
    setIsMusicPlaying(true);
  }, [musicTrack]);

  const handleCopyStandaloneHtml = useCallback(() => {
    navigator.clipboard.writeText(STANDALONE_HTML_SOURCE).then(() => {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2200);
    });
  }, []);

  const handleDownloadStandaloneHtml = useCallback(() => {
    const blob = new Blob([STANDALONE_HTML_SOURCE], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let clock: THREE.Clock;
    let hemiLight: THREE.HemisphereLight;
    let sunLight: THREE.DirectionalLight;
    let currentBuiltMap: BuiltArenaMap | null = null;
    let weaponGroup: THREE.Group;
    let muzzleFlashMesh: THREE.Mesh | null = null;
    let frameId = 0;

    const colliders: AABBCollider[] = [];
    const elevationZones: ElevationZone[] = [];
    const shootableMeshes: THREE.Mesh[] = [];
    let activeWaypoints: [number, number, number][] = [];
    const bots: BotEntity[] = [];
    const decals: THREE.Mesh[] = [];
    const sparks: SparkParticle[] = [];
    const tracers: BulletTracer[] = [];

    const keys: Record<string, boolean> = {};
    let isMouseDown = false;
    let hitstopTimer = 0;
    let titleOrbitAngle = 0;
    let lastHudTimerInt = 300;
    let lastFreezeSecondInt = 10;

    // Estado interno do jogador e da partida 5v5 (5 minutos = 300 segundos por round)
    const player = {
      mapId: 'complexo' as MapId,
      team: 'CT' as TeamSide,
      isDead: false,
      pos: new THREE.Vector3(0, 1.72, 24.5),
      vel: new THREE.Vector3(0, 0, 0),
      yaw: 0,
      pitch: 0,
      radius: 0.58,
      eyeHeight: 1.72,
      onGround: true,
      hp: 100,
      armor: 100,
      money: 1200,
      kills: 0,
      headshots: 0,
      round: 1,
      roundTimeSec: 300, // 05:00 por round
      freezeTimeSec: 10.0, // 10s contagem regressiva de preparo (Freeze Time)
      isFreezeActive: true,
      isRoundEnding: false,
      ctScore: 0,
      trScore: 0,
      loadout: ['knife', 'ak47', 'awp'] as string[],
      activeSlotIndex: 0, // Começa com a Faca Tática na mão
      ammoMap: Object.keys(WEAPON_CATALOG).reduce((acc, k) => {
        acc[k] = {
          clip: WEAPON_CATALOG[k].clipSize,
          reserve: WEAPON_CATALOG[k].reserveMax,
        };
        return acc;
      }, {} as Record<string, WeaponAmmoState>),
      zoomLevel: 0,
      targetFov: 75,
      isReloading: false,
      reloadTimer: 0,
      inspectTimer: 0,
      lastShotTime: 0,
      bobPhase: 0,
      recoilOffset: 0,
      knifeSwingOffset: 0,
      equipAnimOffset: 0,
      cameraShake: 0,
      wheelFlashTimer: 0,
      bannerText: 'PARTIDA 5v5 INICIADA — 05:00 NO RELÓGIO!',
      bannerTimer: 3.0,
    };

    const getActiveWeaponId = (): string => {
      return player.loadout[player.activeSlotIndex] || 'knife';
    };

    const getTeamAliveCounts = () => {
      let ct = !player.isDead && player.team === 'CT' ? 1 : 0;
      let tr = !player.isDead && player.team === 'TR' ? 1 : 0;
      for (let i = 0; i < bots.length; i++) {
        if (bots[i].team === 'CT') ct++;
        else tr++;
      }
      return { ct, tr };
    };

    const getFirstLivingAllyBot = (): BotEntity | null => {
      for (let i = 0; i < bots.length; i++) {
        if (bots[i].team === player.team) return bots[i];
      }
      return null;
    };

    const syncHud = () => {
      const wId = getActiveWeaponId();
      const { ct, tr } = getTeamAliveCounts();
      const ally = player.isDead ? getFirstLivingAllyBot() : null;
      setHud({
        activeMapId: player.mapId,
        playerTeam: player.team,
        isPlayerDead: player.isDead,
        spectatingAllyName: ally ? ally.name : null,
        spectatingAllyHp: ally ? ally.hp : 0,
        hp: player.hp,
        armor: player.armor,
        money: player.money,
        kills: player.kills,
        headshots: player.headshots,
        round: player.round,
        roundTimeSec: player.roundTimeSec,
        freezeTimeSec: player.freezeTimeSec,
        isFreezeActive: player.isFreezeActive,
        ctScore: player.ctScore,
        trScore: player.trScore,
        ctAlive: ct,
        trAlive: tr,
        loadout: [...player.loadout],
        activeSlotIndex: player.activeSlotIndex,
        activeWeaponId: wId,
        activeAmmo: { ...(player.ammoMap[wId] || { clip: 0, reserve: 0 }) },
        zoomLevel: player.zoomLevel,
        isReloading: player.isReloading,
        wheelFlashVisible: player.wheelFlashTimer > 0,
        bannerText: player.bannerTimer > 0 ? player.bannerText : '',
      });
    };

    const showBanner = (msg: string, duration = 2.2) => {
      player.bannerText = msg;
      player.bannerTimer = duration;
      syncHud();
    };

    const pushKillfeed = (
      killerName: string,
      killerTeam: TeamSide,
      victimName: string,
      victimTeam: TeamSide,
      weaponName: string,
      isHeadshot: boolean
    ) => {
      const entry: KillfeedEntry = {
        id: Date.now() + Math.random(),
        killer: killerName,
        killerTeam,
        victim: victimName,
        victimTeam,
        weaponName,
        isHeadshot,
      };
      setKillfeed((prev) => [entry, ...prev.slice(0, 5)]);
    };

    // Carrega ou troca o mapa 3D ativo sob demanda, liberando VRAM do mapa anterior
    const loadArenaMap = (mapId: MapId) => {
      for (let i = decals.length - 1; i >= 0; i--) {
        scene.remove(decals[i]);
        decals[i].geometry.dispose();
      }
      decals.length = 0;

      if (currentBuiltMap) {
        scene.remove(currentBuiltMap.mapGroup);
        currentBuiltMap.dispose();
        currentBuiltMap = null;
      }

      colliders.length = 0;
      elevationZones.length = 0;
      shootableMeshes.length = 0;

      const maxAniso = renderer ? renderer.capabilities.getMaxAnisotropy() : 4;
      const built = buildArenaMapById(mapId, maxAniso, isSoftwareGl);
      currentBuiltMap = built;
      player.mapId = mapId;

      scene.add(built.mapGroup);
      colliders.push(...built.colliders);
      elevationZones.push(...built.elevationZones);
      shootableMeshes.push(...built.shootableMeshes);
      activeWaypoints = built.waypoints;

      scene.background = new THREE.Color(built.skyColor);
      scene.fog = new THREE.FogExp2(built.fogColor, built.fogDensity);

      if (hemiLight) {
        hemiLight.color.setHex(built.hemiSkyColor);
        hemiLight.groundColor.setHex(built.hemiGroundColor);
        hemiLight.intensity = built.hemiIntensity;
      }
      if (sunLight) {
        sunLight.color.setHex(built.sunColor);
        sunLight.intensity = built.sunIntensity;
        sunLight.position.set(...built.sunPosition);
      }
    };

    // Constrói APENAS UMA arma na mão usando o construtor 3D de alta definição (src/weaponModels.ts)
    const buildSingleWeaponViewmodel = (spec: WeaponSpec) => {
      if (weaponGroup) {
        camera.remove(weaponGroup);
      }
      const built = buildFirstPersonWeaponViewmodel(spec, player.team);
      weaponGroup = built.weaponGroup;
      muzzleFlashMesh = built.muzzleFlashMesh;
      weaponGroup.visible = !player.isDead && player.zoomLevel === 0;
      camera.add(weaponGroup);
    };

    const switchToInventorySlot = (slotIdx: number) => {
      if (player.isDead) return;
      const normalized =
        ((slotIdx % player.loadout.length) + player.loadout.length) %
        player.loadout.length;
      player.activeSlotIndex = normalized;
      player.isReloading = false;
      player.inspectTimer = 0;
      player.zoomLevel = 0;
      player.targetFov = 75;
      player.equipAnimOffset = -0.22;
      player.wheelFlashTimer = 1.65;

      const wId = getActiveWeaponId();
      const spec = WEAPON_CATALOG[wId] || WEAPON_CATALOG.knife;
      buildSingleWeaponViewmodel(spec);
      audioRef.current.playBuyOrRoundChime(false);
      syncHud();
    };

    // Spawner de Round 5v5 (5 CT Azul vs 5 TR Vermelho) + Reset do Relógio de 5 Minutos (300s)
    const startNew5v5Round = () => {
      bots.forEach((b) => scene.remove(b.group));
      bots.length = 0;

      if (!currentBuiltMap) {
        loadArenaMap(player.mapId);
      }
      const mapData = currentBuiltMap!;

      player.isDead = false;
      player.hp = 100;
      player.armor = 100;
      player.freezeTimeSec = 10.0; // 10 segundos de preparo tático
      player.isFreezeActive = true;
      lastFreezeSecondInt = 10;
      player.roundTimeSec = 300; // 05:00 exatos por round
      lastHudTimerInt = 300;
      player.isRoundEnding = false;
      player.zoomLevel = 0;
      player.targetFov = 75;
      player.isReloading = false;
      player.vel.set(0, 0, 0);
      player.onGround = true;

      // Reabastece pentes no início do round
      Object.keys(WEAPON_CATALOG).forEach((k) => {
        player.ammoMap[k] = {
          clip: WEAPON_CATALOG[k].clipSize,
          reserve: WEAPON_CATALOG[k].reserveMax,
        };
      });

      // Posiciona o jogador no ponto de spawn configurado do mapa ativo
      if (player.team === 'CT') {
        player.pos.set(...mapData.playerCtSpawn.pos);
        player.yaw = mapData.playerCtSpawn.yaw;
      } else {
        player.pos.set(...mapData.playerTrSpawn.pos);
        player.yaw = mapData.playerTrSpawn.yaw;
      }
      player.pitch = 0;

      const spawnSquad = (
        teamSide: TeamSide,
        botCount: number,
        coords: [number, number, number][],
        names: string[]
      ) => {
        const isAllyToPlayer = teamSide === player.team;

        for (let i = 0; i < botCount; i++) {
          const built = createTeamCharacterModel(teamSide, i, isSoftwareGl);
          const {
            group,
            headMesh,
            torsoMesh,
            chestRig,
            leftLeg,
            rightLeg,
            leftArm,
            rightArm,
            muzzleFlash,
            bodyMat,
            headMat,
            baseBodyColor,
            baseHeadColor,
          } = built;

          // Marcador Verde sobre a cabeça dos 4 Bots Aliados para identificação imediata
          let allyMarker: THREE.Mesh | null = null;
          if (isAllyToPlayer) {
            allyMarker = new THREE.Mesh(
              new THREE.OctahedronGeometry(0.16, 0),
              new THREE.MeshBasicMaterial({ color: 0x4ade80 })
            );
            allyMarker.position.set(0, 2.32, 0);
            group.add(allyMarker);
          }

          const sp = coords[i % coords.length];
          group.position.set(
            sp[0] + (Math.random() - 0.5) * 1.4,
            sp[1],
            sp[2] + (Math.random() - 0.5) * 1.4
          );
          scene.add(group);

          const initialWpIdx = Math.floor(Math.random() * activeWaypoints.length);
          const wp = activeWaypoints[initialWpIdx] || [0, 0, 0];

          const pmWeapons = ['IMBEL IA2', 'ParaFAL 7.62', 'IMBEL IA2', 'CBC Pump 12G', 'IMBEL IA2', 'ParaFAL 7.62'];
          const trWeapons = ['AK-47', 'HK G3 7.62', 'Doze Cano Curto', 'ParaFAL 7.62', 'AK-47', 'HK G3 7.62'];
          const botWeaponLabel =
            teamSide === 'CT'
              ? pmWeapons[i % pmWeapons.length]
              : trWeapons[i % trWeapons.length];

          const botEntity: BotEntity = {
            id: bots.length + 1,
            name: names[i % names.length],
            team: teamSide,
            group,
            headMesh,
            torsoMesh,
            leftLeg,
            rightLeg,
            leftArm,
            rightArm,
            allyMarker,
            bodyMat,
            headMat,
            baseBodyColor,
            baseHeadColor,
            muzzleFlash,
            weaponLabel: botWeaponLabel,
            hp: 100,
            maxHp: 100,
            speed: 4.6 + Math.random() * 0.85,
            attackCooldown: 0.35 + Math.random() * 0.45,
            burstShotsLeft: 3,
            burstShotTimer: 0,
            hitFlashTimer: 0,
            strafeDir: Math.random() > 0.5 ? 1 : -1,
            strafeTimer: 0.85 + Math.random() * 0.9,
            walkCycle: Math.random() * Math.PI * 2,
            waypointIndex: initialWpIdx,
            waypointTimer: 3.5 + Math.random() * 2.5,
            patrolGoal: new THREE.Vector3(wp[0], wp[1], wp[2]),
          };

          headMesh.userData = { bot: botEntity, isHead: true };
          torsoMesh.userData = { bot: botEntity, isHead: false };
          chestRig.userData = { bot: botEntity, isHead: false };

          bots.push(botEntity);
        }
      };

      // Cria 4 bots na equipe do jogador (5 no total com o jogador) e 5 bots na equipe adversária
      spawnSquad('CT', player.team === 'CT' ? 4 : 5, mapData.ctSpawns, CT_BOT_NAMES);
      spawnSquad('TR', player.team === 'TR' ? 4 : 5, mapData.trSpawns, TR_BOT_NAMES);

      buildSingleWeaponViewmodel(WEAPON_CATALOG[getActiveWeaponId()]);
      syncHud();
    };

    // Verifica se o round 5v5 terminou (por eliminação de todos os 5 de um time ou tempo 05:00 esgotado)
    const evaluateRoundOutcome = (timeExpired = false) => {
      if (player.isRoundEnding) return;
      const { ct, tr } = getTeamAliveCounts();

      let winningTeam: TeamSide | null = null;
      let winReason = '';

      if (ct === 0) {
        winningTeam = 'TR';
        winReason = 'ESQUADRÃO DA PM ELIMINADO';
      } else if (tr === 0) {
        winningTeam = 'CT';
        winReason = 'BANDIDOS NEUTRALIZADOS';
      } else if (timeExpired) {
        // Se o relógio de 5 minutos zerar: vence quem tiver mais vivos (ou PM no empate por defesa)
        if (ct >= tr) {
          winningTeam = 'CT';
          winReason = 'TEMPO ESGOTADO (00:00) — DEFESA PM VENCEU!';
        } else {
          winningTeam = 'TR';
          winReason = 'TEMPO ESGOTADO (00:00) — BANDIDOS VENCERAM!';
        }
      }

      if (winningTeam) {
        player.isRoundEnding = true;
        if (winningTeam === 'CT') player.ctScore++;
        else player.trScore++;

        const playerWon = winningTeam === player.team;
        const roundBonus = playerWon ? 2400 : 1400;
        player.money = Math.min(16000, player.money + roundBonus);

        const teamLabel = winningTeam === 'CT' ? 'POLÍCIA MILITAR (PM)' : 'BANDIDOS';
        audioRef.current.playBuyOrRoundChime(playerWon);
        showBanner(
          `${teamLabel} VENCEU O ROUND ${player.round}! (${winReason}) +$${roundBonus}`,
          3.0
        );

        setTimeout(() => {
          player.round++;
          startNew5v5Round();
          showBanner(`ROUND ${player.round} INICIADO — PM vs BANDIDOS`, 2.2);
        }, 2800);
      }

      syncHud();
    };

    // Bot Takeover (Tecla E): Se o jogador morreu no round, assume um Bot Aliado Vivo!
    const takeoverAlliedBot = () => {
      if (!player.isDead || player.isRoundEnding) return;
      const ally = getFirstLivingAllyBot();
      if (!ally) {
        showBanner('NENHUM BOT ALIADO VIVO RESTANTE NESTE ROUND!', 1.5);
        return;
      }

      player.isDead = false;
      player.hp = ally.hp;
      player.armor = Math.max(50, player.armor);
      player.pos.set(
        ally.group.position.x,
        ally.group.position.y + player.eyeHeight,
        ally.group.position.z
      );
      player.yaw = ally.group.rotation.y;
      player.pitch = 0;

      scene.remove(ally.group);
      const idx = bots.indexOf(ally);
      if (idx !== -1) bots.splice(idx, 1);

      buildSingleWeaponViewmodel(WEAPON_CATALOG[getActiveWeaponId()]);
      audioRef.current.playBuyOrRoundChime(true);
      showBanner(`VOCÊ ASSUMIU O CONTROLE DO ALIADO ${ally.name}!`, 2.0);
      syncHud();
    };

    const collidesWithWorld = (px: number, pz: number, radius: number, py = 1.72): boolean => {
      for (let i = 0; i < colliders.length; i++) {
        const c = colliders[i];
        if (py - 1.5 > c.maxY || py + 0.2 < c.minY) continue;
        const closestX = Math.max(c.minX, Math.min(px, c.maxX));
        const closestZ = Math.max(c.minZ, Math.min(pz, c.maxZ));
        const dx = px - closestX;
        const dz = pz - closestZ;
        if (dx * dx + dz * dz < radius * radius) {
          return true;
        }
      }
      return false;
    };

    const spawnImpactSparks = (point: THREE.Vector3, normal: THREE.Vector3, colorHex: number) => {
      const geo = new THREE.BoxGeometry(0.05, 0.05, 0.05);
      const mat = new THREE.MeshBasicMaterial({ color: colorHex });
      for (let i = 0; i < 6; i++) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(point);
        const vel = normal
          .clone()
          .multiplyScalar(2.5 + Math.random() * 3)
          .add(
            new THREE.Vector3(
              (Math.random() - 0.5) * 3,
              Math.random() * 2.5,
              (Math.random() - 0.5) * 3
            )
          );
        scene.add(mesh);
        sparks.push({ mesh, vel, life: 0.28 + Math.random() * 0.15 });
      }
    };

    // Desenha um Rastro de Bala 3D (Bullet Tracer) visível entre a arma e o ponto de impacto
    const spawnBulletTracer = (
      startPos: THREE.Vector3,
      endPos: THREE.Vector3,
      colorHex: number
    ) => {
      const dist = startPos.distanceTo(endPos);
      if (dist < 0.4) return;
      const geo = new THREE.BoxGeometry(0.028, 0.028, dist);
      const mat = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.88,
      });
      const tracerMesh = new THREE.Mesh(geo, mat);
      tracerMesh.position.copy(startPos).lerp(endPos, 0.5);
      tracerMesh.lookAt(endPos);
      scene.add(tracerMesh);
      tracers.push({ mesh: tracerMesh, life: 0.085, maxLife: 0.085 });
    };

    const startReload = () => {
      if (player.isDead || player.isReloading) return;
      const wId = getActiveWeaponId();
      const spec = WEAPON_CATALOG[wId];
      if (!spec || spec.isMelee) return;

      const st = player.ammoMap[wId];
      if (!st || st.clip >= spec.clipSize || st.reserve <= 0) return;

      player.isReloading = true;
      player.inspectTimer = 0;
      player.reloadTimer = spec.reloadTimeMs / 1000;

      if (player.zoomLevel !== 0) {
        player.zoomLevel = 0;
        player.targetFov = 75;
        if (weaponGroup) weaponGroup.visible = true;
      }

      audioRef.current.playReload();
      syncHud();
    };

    // Dispara a arma única na mão do jogador
    const fireActiveWeapon = (isHeavyKnifeStab = false) => {
      if (player.isDead || player.isReloading || player.isFreezeActive) return;
      const wId = getActiveWeaponId();
      const spec = WEAPON_CATALOG[wId];
      if (!spec) return;

      const nowSec = performance.now() / 1000;
      const requiredCooldown =
        spec.isMelee && isHeavyKnifeStab ? 0.55 : spec.fireRateMs / 1000;
      if (nowSec - player.lastShotTime < requiredCooldown) return;

      const ammoState = player.ammoMap[wId];
      if (!spec.isMelee) {
        if (ammoState.clip <= 0) {
          startReload();
          return;
        }
        ammoState.clip--;
      }

      player.lastShotTime = nowSec;
      player.inspectTimer = 0;
      player.recoilOffset = spec.recoilKick;
      if (spec.isMelee) {
        player.knifeSwingOffset = isHeavyKnifeStab ? 1.35 : 0.9;
      }

      player.cameraShake = spec.recoilKick * 0.45;
      const effectiveSpread = player.zoomLevel > 0 ? spec.spread * 0.12 : spec.spread;
      player.pitch = Math.min(Math.PI / 2.15, player.pitch + spec.recoilKick * 0.3);
      player.yaw += (Math.random() - 0.5) * effectiveSpread;

      if (muzzleFlashMesh && player.zoomLevel === 0) {
        muzzleFlashMesh.visible = true;
        muzzleFlashMesh.rotation.z = Math.random() * Math.PI * 2;
        setTimeout(() => {
          if (muzzleFlashMesh) muzzleFlashMesh.visible = false;
        }, 45);
      }

      const raycaster = new THREE.Raycaster();
      const botHitboxes: THREE.Object3D[] = [];
      for (let i = 0; i < bots.length; i++) {
        botHitboxes.push(bots[i].headMesh, bots[i].torsoMesh);
      }
      const targets = [...botHitboxes, ...shootableMeshes];

      const pelletCount = spec.pellets || 1;
      let hitAnythingOverall = false;
      let hitEnemySoundPlayed = false;
      let hitFriendlyWarningShown = false;

      // Posição de origem do cano para desenhar os Tracers dos balins da Shotgun / Armas
      const muzzleWorldOrigin = new THREE.Vector3();
      if (muzzleFlashMesh) {
        muzzleFlashMesh.getWorldPosition(muzzleWorldOrigin);
      } else {
        muzzleWorldOrigin.copy(camera.position);
      }

      for (let p = 0; p < pelletCount; p++) {
        const pelletNdc =
          pelletCount > 1
            ? new THREE.Vector2(
                (Math.random() - 0.5) * spec.spread * 1.45,
                (Math.random() - 0.5) * spec.spread * 1.45
              )
            : _ndcCenter;

        raycaster.setFromCamera(pelletNdc, camera);
        if (spec.isMelee) {
          raycaster.far = spec.maxRange || 3.4;
        }

        const intersects = raycaster.intersectObjects(targets, false);
        if (intersects.length > 0) {
          hitAnythingOverall = true;
          const hit = intersects[0];
          const hitBot = hit.object.userData?.bot as BotEntity | undefined;

          if (!spec.isMelee && pelletCount > 1) {
            spawnBulletTracer(muzzleWorldOrigin, hit.point, 0xfbbf24);
          }

          if (hitBot) {
            if (hitBot.hp <= 0) continue;

            // Proteção contra fogo amigo (não causa dano aos seus 4 bots aliados)
            if (hitBot.team === player.team) {
              if (!hitFriendlyWarningShown) {
                hitFriendlyWarningShown = true;
                showBanner(
                  `CUIDADO! ${hitBot.name} É SEU ALIADO (${
                    player.team === 'CT' ? 'PM' : 'BANDIDOS'
                  })!`,
                  1.2
                );
              }
              continue;
            }

            const isHeadshot = Boolean(hit.object.userData?.isHead);
            const baseDmg =
              spec.isMelee && isHeavyKnifeStab && spec.secondaryDamage
                ? spec.secondaryDamage
                : spec.damage;
            const dmg = Math.round(baseDmg * (isHeadshot ? spec.headshotMult : 1));

            hitBot.hp -= dmg;
            hitBot.hitFlashTimer = 0.14;
            hitBot.bodyMat.color.setHex(0xffffff);
            hitBot.bodyMat.emissive.setHex(0x552222);
            hitBot.headMat.color.setHex(0xfde047);

            spawnImpactSparks(
              hit.point,
              hit.face ? hit.face.normal : new THREE.Vector3(0, 1, 0),
              isHeadshot ? 0xfbbf24 : 0xef4444
            );

            if (isHeadshot) {
              setHeadshotFlash(true);
              setTimeout(() => setHeadshotFlash(false), 260);
            }

            if (hitBot.hp <= 0) {
              audioRef.current.playEnemyHit(isHeadshot, true);
              hitEnemySoundPlayed = true;
              hitstopTimer = isHeadshot ? 0.045 : 0.025;
              scene.remove(hitBot.group);
              const idx = bots.indexOf(hitBot);
              if (idx !== -1) bots.splice(idx, 1);

              player.kills++;
              if (isHeadshot) player.headshots++;
              const bonus = spec.killReward + (isHeadshot ? 150 : 0);
              player.money = Math.min(16000, player.money + bonus);

              const killLabel =
                spec.isMelee && isHeavyKnifeStab ? `${spec.shortName} (Estocada)` : spec.shortName;
              pushKillfeed(
                `Você (${player.team === 'CT' ? 'PM' : 'Bandidos'})`,
                player.team,
                hitBot.name,
                hitBot.team,
                killLabel,
                isHeadshot
              );

              if (spec.isMelee) {
                showBanner(`ABATE NA FACA! +$${bonus}`, 1.6);
              } else if (spec.pellets) {
                showBanner(`ABATE DE ESCOPETA 12G! +$${bonus}`, 1.6);
              } else if (isHeadshot) {
                showBanner(`HEADSHOT! +$${bonus}`, 1.4);
              }

              evaluateRoundOutcome(false);
            } else if (!hitEnemySoundPlayed) {
              hitEnemySoundPlayed = true;
              audioRef.current.playEnemyHit(isHeadshot, false);
            }
          } else if (hit.face) {
            const decalSize = spec.isMelee ? 0.24 : pelletCount > 1 ? 0.1 : 0.17;
            const decalGeo = new THREE.PlaneGeometry(decalSize, spec.isMelee ? 0.04 : decalSize);
            const decalMat = new THREE.MeshBasicMaterial({
              color: spec.isMelee ? 0x262626 : 0x141414,
              polygonOffset: true,
              polygonOffsetFactor: -2,
              polygonOffsetUnits: -2,
            });
            const decal = new THREE.Mesh(decalGeo, decalMat);
            decal.position.copy(hit.point).addScaledVector(hit.face.normal, 0.015);
            decal.lookAt(hit.point.clone().add(hit.face.normal));
            scene.add(decal);
            decals.push(decal);
            if (decals.length > 55) {
              const old = decals.shift();
              if (old) {
                scene.remove(old);
                old.geometry.dispose();
              }
            }
            if (p === 0 || pelletCount <= 3 || p % 2 === 0) {
              spawnImpactSparks(hit.point, hit.face.normal, spec.isMelee ? 0xe5e7eb : 0xf59e0b);
            }
          }
        }
      }

      if (spec.isMelee) {
        audioRef.current.playKnifeSwing(isHeavyKnifeStab, hitAnythingOverall);
      } else {
        audioRef.current.playGunshot(spec.id);
      }

      syncHud();
    };

    const handleSecondaryAction = () => {
      if (player.isDead || player.isReloading) return;
      const wId = getActiveWeaponId();

      if (wId === 'awp') {
        player.zoomLevel = (player.zoomLevel + 1) % 3;
        player.targetFov =
          player.zoomLevel === 0 ? 75 : player.zoomLevel === 1 ? 28 : 11;
        if (weaponGroup) {
          weaponGroup.visible = player.zoomLevel === 0;
        }
        audioRef.current.playScopeZoom(player.zoomLevel);
        syncHud();
      } else if (wId === 'knife') {
        fireActiveWeapon(true);
      }
    };

    const buyEquipment = (itemKey: string, targetSlot?: 1 | 2) => {
      if (itemKey === 'kevlar_kit') {
        const price = 650;
        if (player.money >= price && (player.armor < 100 || player.hp < 100)) {
          player.money -= price;
          player.armor = 100;
          player.hp = Math.min(100, player.hp + 50);
          audioRef.current.playBuyOrRoundChime(false);
          showBanner('COLETE KEVLAR + KIT MÉDICO EQUIPADO!', 1.6);
          syncHud();
        } else if (player.money < price) {
          showBanner('SALDO INSUFICIENTE ($650 NECESSÁRIOS)', 1.5);
        }
        return;
      }

      const spec = WEAPON_CATALOG[itemKey];
      if (!spec) return;
      if (player.money >= spec.price) {
        player.money -= spec.price;
        player.ammoMap[spec.id] = {
          clip: spec.clipSize,
          reserve: spec.reserveMax,
        };
        const slotToUse =
          targetSlot || (player.activeSlotIndex === 2 ? 2 : 1);
        player.loadout[slotToUse] = spec.id;
        switchToInventorySlot(slotToUse);
        showBanner(`${spec.name} EQUIPADA NO SLOT [${slotToUse + 1}]!`, 1.6);
      } else {
        showBanner(`SALDO INSUFICIENTE ($${spec.price} NECESSÁRIOS)`, 1.5);
      }
    };

    const selectTeamAndStartMatch = (chosenTeam: TeamSide) => {
      player.team = chosenTeam;
      player.money = 1200;
      player.kills = 0;
      player.headshots = 0;
      player.round = 1;
      player.ctScore = 0;
      player.trScore = 0;
      player.loadout = ['knife', 'ak47', 'awp'];
      player.activeSlotIndex = 0;

      if (!audioRef.current.musicPlaying && !audioRef.current.muted) {
        audioRef.current.startMusic();
        setIsMusicPlaying(true);
      }

      startNew5v5Round();
      showBanner(
        `VOCÊ ENTROU NO ESQUADRÃO ${chosenTeam === 'CT' ? 'CONTRA-TERRORISTA (AZUL)' : 'TERRORISTA (VERMELHO)'} — 5v5!`,
        2.5
      );
      setIsBuyOpen(false);
      setIsCodeModalOpen(false);
      setGameMode('playing');
      renderer.domElement.requestPointerLock?.();
    };

    const restartFullMatch = () => {
      selectTeamAndStartMatch(player.team);
    };

    const selectMapAndSetup = (chosenMapId: MapId, startImmediately = false) => {
      loadArenaMap(chosenMapId);
      player.round = 1;
      player.ctScore = 0;
      player.trScore = 0;
      player.money = 1200;
      startNew5v5Round();
      const mapMeta = MAP_CATALOG[chosenMapId];
      showBanner(`MAPA CARREGADO: ${mapMeta.name.toUpperCase()} (${mapMeta.subtitle})`, 2.5);
      if (startImmediately) {
        setIsBuyOpen(false);
        setIsCodeModalOpen(false);
        setGameMode('playing');
        renderer.domElement.requestPointerLock?.();
      } else {
        syncHud();
      }
    };

    /* ==========================================================================
       1. ARQUITETURA init() — Inicialização da Cena e do Mapa Selecionado
       ========================================================================== */
    const init = () => {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x7dd3fc);
      scene.fog = new THREE.FogExp2(0xfde68a, 0.011);

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        180
      );
      camera.rotation.order = 'YXZ';
      scene.add(camera);

      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = !isSoftwareGl;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();

      hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x9a6b43, 0.92);
      scene.add(hemiLight);

      sunLight = new THREE.DirectionalLight(0xffedd5, 1.55);
      sunLight.position.set(32, 42, 26);
      sunLight.castShadow = !isSoftwareGl;
      sunLight.shadow.mapSize.set(1024, 1024);
      sunLight.shadow.camera.left = -38;
      sunLight.shadow.camera.right = 38;
      sunLight.shadow.camera.top = 38;
      sunLight.shadow.camera.bottom = -38;
      sunLight.shadow.bias = -0.0005;
      scene.add(sunLight);

      loadArenaMap(player.mapId);
      startNew5v5Round();

      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }

      clock = new THREE.Clock();
      syncHud();
    };

    /* ==========================================================================
       2. ARQUITETURA update(dt) — Cronômetro 05:00, Física e Combate 5v5 entre Bots
       ========================================================================== */
    const update = (dt: number) => {
      if (player.bannerTimer > 0) {
        player.bannerTimer -= dt;
        if (player.bannerTimer <= 0) syncHud();
      }

      if (player.wheelFlashTimer > 0) {
        player.wheelFlashTimer -= dt;
        if (player.wheelFlashTimer <= 0) syncHud();
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const sp = sparks[i];
        sp.life -= dt;
        sp.vel.y -= 9.8 * dt;
        sp.mesh.position.addScaledVector(sp.vel, dt);
        if (sp.life <= 0) {
          scene.remove(sp.mesh);
          sparks.splice(i, 1);
        }
      }

      for (let i = tracers.length - 1; i >= 0; i--) {
        const tr = tracers[i];
        tr.life -= dt;
        const mat = tr.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, (tr.life / tr.maxLife) * 0.88);
        if (tr.life <= 0) {
          scene.remove(tr.mesh);
          tr.mesh.geometry.dispose();
          mat.dispose();
          tracers.splice(i, 1);
        }
      }

      if (gameRef.current.gameMode === 'title') {
        titleOrbitAngle += dt * 0.22;
        camera.position.set(
          Math.sin(titleOrbitAngle) * 22,
          9.5 + Math.sin(titleOrbitAngle * 2) * 1.2,
          Math.cos(titleOrbitAngle) * 22
        );
        camera.lookAt(0, 1.5, -4);
        if (weaponGroup) weaponGroup.visible = false;
        return;
      }

      if (weaponGroup) {
        weaponGroup.visible = !player.isDead && player.zoomLevel === 0;
      }

      if (Math.abs(camera.fov - player.targetFov) > 0.05) {
        camera.fov = THREE.MathUtils.damp(camera.fov, player.targetFov, 18, dt);
        camera.updateProjectionMatrix();
      }

      if (
        !gameRef.current.isLocked ||
        gameRef.current.isBuyOpen ||
        gameRef.current.isCodeOpen ||
        gameRef.current.gameMode !== 'playing'
      ) {
        return;
      }

      // Cronômetro Regressivo: 10s de Preparo (Freeze Time) seguidos de 5 Minutos (300s) de Combate
      if (player.isFreezeActive) {
        player.freezeTimeSec = Math.max(0, player.freezeTimeSec - dt);
        const currentFreezeSec = Math.ceil(player.freezeTimeSec);
        if (currentFreezeSec !== lastFreezeSecondInt) {
          lastFreezeSecondInt = currentFreezeSec;
          if (currentFreezeSec === 3 || currentFreezeSec === 2 || currentFreezeSec === 1) {
            audioRef.current.playCountdownBeep(false);
          }
          syncHud();
        }
        if (player.freezeTimeSec <= 0) {
          player.isFreezeActive = false;
          player.freezeTimeSec = 0;
          audioRef.current.playCountdownBeep(true);
          showBanner('COMBATE LIBERADO! VÁ, VÁ, VÁ!', 2.2);
          syncHud();
        }
      } else if (!player.isRoundEnding) {
        player.roundTimeSec = Math.max(0, player.roundTimeSec - dt);
        const currentSecInt = Math.ceil(player.roundTimeSec);
        if (currentSecInt !== lastHudTimerInt) {
          lastHudTimerInt = currentSecInt;
          syncHud();
        }
        if (player.roundTimeSec <= 0) {
          evaluateRoundOutcome(true);
        }
      }

      if (hitstopTimer > 0) {
        hitstopTimer -= dt;
        return;
      }

      // Se o jogador estiver VIVO: processa tiro, recarga e movimentação WASD
      if (!player.isDead) {
        const activeWId = getActiveWeaponId();
        const activeSpec = WEAPON_CATALOG[activeWId];
        const isKnifeEquipped = activeWId === 'knife';
        if (isMouseDown && activeSpec.auto) {
          fireActiveWeapon(false);
        }

        if (player.isReloading) {
          player.reloadTimer -= dt;
          if (player.reloadTimer <= 0) {
            if (!activeSpec.isMelee) {
              const st = player.ammoMap[activeWId];
              const needed = activeSpec.clipSize - st.clip;
              const transfer = Math.min(needed, st.reserve);
              st.clip += transfer;
              st.reserve -= transfer;
            }
            player.isReloading = false;
            syncHud();
          }
        }

        _forward.set(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
        _right.set(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
        _moveDir.set(0, 0, 0);

        if (!player.isFreezeActive) {
          if (keys['KeyW'] || keys['ArrowUp']) _moveDir.add(_forward);
          if (keys['KeyS'] || keys['ArrowDown']) _moveDir.sub(_forward);
          if (keys['KeyD'] || keys['ArrowRight']) _moveDir.add(_right);
          if (keys['KeyA'] || keys['ArrowLeft']) _moveDir.sub(_right);

          if (_moveDir.lengthSq() > 0) {
            _moveDir.normalize();
          }

          const moveSpeed =
            player.zoomLevel > 0 ? 4.8 : isKnifeEquipped ? 10.4 : activeWId === 'awp' ? 7.3 : 8.5;

          const currentFootY = player.pos.y - player.eyeHeight;
          const nextX = player.pos.x + _moveDir.x * moveSpeed * dt;
          const nextZ = player.pos.z + _moveDir.z * moveSpeed * dt;

          const nextGroundX = getGroundElevationAt(nextX, player.pos.z, currentFootY, elevationZones);
          const testEyeYX = Math.max(player.pos.y, nextGroundX + player.eyeHeight);
          if (!collidesWithWorld(nextX, player.pos.z, player.radius, testEyeYX)) {
            player.pos.x = nextX;
          }

          const nextGroundZ = getGroundElevationAt(player.pos.x, nextZ, currentFootY, elevationZones);
          const testEyeYZ = Math.max(player.pos.y, nextGroundZ + player.eyeHeight);
          if (!collidesWithWorld(player.pos.x, nextZ, player.radius, testEyeYZ)) {
            player.pos.z = nextZ;
          }

          if (keys['Space'] && player.onGround) {
            player.vel.y = 7.9;
            player.onGround = false;
          }
        }

        const groundFloorY = getGroundElevationAt(
          player.pos.x,
          player.pos.z,
          player.pos.y - player.eyeHeight,
          elevationZones
        );
        const minEyeY = groundFloorY + player.eyeHeight;

        if (player.onGround && player.vel.y <= 0 && Math.abs(player.pos.y - minEyeY) <= 0.48) {
          // Acompanha suavemente a subida e descida dos degraus das escadarias e lajes
          player.pos.y = minEyeY;
          player.vel.y = 0;
        } else {
          player.vel.y -= 20.0 * dt;
          player.pos.y += player.vel.y * dt;
          if (player.pos.y <= minEyeY) {
            player.pos.y = minEyeY;
            player.vel.y = 0;
            player.onGround = true;
          } else {
            player.onGround = false;
          }
        }

        player.cameraShake = THREE.MathUtils.damp(player.cameraShake, 0, 16, dt);
        player.recoilOffset = THREE.MathUtils.damp(player.recoilOffset, 0, 14, dt);
        player.knifeSwingOffset = THREE.MathUtils.damp(player.knifeSwingOffset, 0, 14, dt);
        player.equipAnimOffset = THREE.MathUtils.damp(player.equipAnimOffset, 0, 14, dt);

        camera.position.copy(player.pos);
        camera.rotation.y = player.yaw;
        camera.rotation.x =
          player.pitch + (Math.random() - 0.5) * player.cameraShake * 0.25;

        if (_moveDir.lengthSq() > 0 && player.onGround) {
          player.bobPhase += dt * (isKnifeEquipped ? 14 : 11.5);
        } else {
          player.bobPhase += dt * 1.8;
        }

        if (player.inspectTimer > 0) {
          player.inspectTimer = Math.max(0, player.inspectTimer - dt);
        }

        if (weaponGroup) {
          const reloadDip = player.isReloading
            ? Math.sin(player.reloadTimer * Math.PI * 1.5) * -0.18 - 0.12
            : 0;
          // Animação suave de inspeção de arma em 1ª pessoa (Tecla [F] — 1.85s)
          const inspectProgress =
            player.inspectTimer > 0 ? 1 - player.inspectTimer / 1.85 : 0;
          const inspectWave =
            player.inspectTimer > 0 ? Math.sin(inspectProgress * Math.PI) : 0;
          const inspectTiltSide =
            player.inspectTimer > 0 ? Math.sin(inspectProgress * Math.PI * 2) : 0;

          weaponGroup.position.x =
            Math.cos(player.bobPhase * 0.5) * 0.014 - inspectWave * 0.09;
          weaponGroup.position.y =
            Math.abs(Math.sin(player.bobPhase)) * 0.018 +
            reloadDip +
            player.equipAnimOffset +
            inspectWave * 0.055;
          weaponGroup.position.z =
            player.recoilOffset * 1.45 -
            player.knifeSwingOffset * 0.28 +
            inspectWave * 0.05;
          weaponGroup.rotation.x =
            player.recoilOffset * 1.9 -
            player.knifeSwingOffset * 0.75 +
            (player.isReloading ? -0.35 : 0) +
            inspectWave * 0.16;
          weaponGroup.rotation.y =
            -player.knifeSwingOffset * 0.45 +
            inspectWave * 0.52 +
            inspectTiltSide * 0.24;
          weaponGroup.rotation.z = inspectWave * 0.34 - inspectTiltSide * 0.18;
        }
      } else {
        // MODO ESPECTADOR ALIADO (Quando o jogador morreu mas ainda há bots aliados vivos no round)
        const ally = getFirstLivingAllyBot();
        if (ally) {
          const targetCamPos = new THREE.Vector3(
            ally.group.position.x - Math.sin(ally.group.rotation.y) * 3.8,
            2.6,
            ally.group.position.z - Math.cos(ally.group.rotation.y) * 3.8
          );
          camera.position.lerp(targetCamPos, Math.min(1, dt * 8));
          camera.lookAt(
            ally.group.position.x,
            1.4,
            ally.group.position.z
          );
        }
      }

      // Durante os 10 segundos de preparo tático (Freeze Time), todos os bots aguardam imóveis em suas bases
      if (player.isFreezeActive) {
        for (let i = 0; i < bots.length; i++) {
          if (bots[i].allyMarker) {
            bots[i].allyMarker!.rotation.y += dt * 3.0;
          }
        }
        return;
      }

      // ========================================================================
      // IA TÁTICA AVANÇADA 5v5: Priorização LOS Real, Waypoints, Strafe e Rajadas
      // ========================================================================
      const losRay = new THREE.Raycaster();

      // Auxiliar para verificar se o Bot tem Linha de Visão (LOS) limpa até um ponto (suporta altura 3D das lajes)
      const checkBotLineOfSight = (
        botPos: THREE.Vector3,
        targetEyePos: THREE.Vector3
      ): boolean => {
        _eyeOrigin.set(botPos.x, botPos.y + 1.52, botPos.z);
        _rayDir.copy(targetEyePos).sub(_eyeOrigin);
        const fullDist = _rayDir.length();
        if (fullDist < 0.2) return true;
        _rayDir.divideScalar(fullDist);
        losRay.set(_eyeOrigin, _rayDir);
        losRay.far = fullDist;
        const wallHits = losRay.intersectObjects(shootableMeshes, false);
        return wallHits.length === 0 || wallHits[0].distance >= fullDist - 0.35;
      };

      for (let i = bots.length - 1; i >= 0; i--) {
        const bot = bots[i];
        if (!bot) continue;

        if (bot.allyMarker) {
          bot.allyMarker.rotation.y += dt * 3.0;
        }

        if (bot.hitFlashTimer > 0) {
          bot.hitFlashTimer -= dt;
          if (bot.hitFlashTimer <= 0) {
            bot.bodyMat.color.setHex(bot.baseBodyColor);
            bot.bodyMat.emissive.setHex(0x000000);
            bot.headMat.color.setHex(bot.baseHeadColor);
          }
        }

        // 1. AVALIAÇÃO DE ALVOS: Inimigos VISÍVEIS (hasLOS = true) têm prioridade absoluta
        // Jogador e Bots inimigos têm igual prioridade quando visíveis!
        let bestEnemyBot: BotEntity | null = null;
        let targetIsPlayer = false;
        let bestVisibleDist = Infinity;
        let bestHiddenEnemyBot: BotEntity | null = null;
        let hiddenTargetIsPlayer = false;
        let bestHiddenDist = Infinity;

        // Testa todos os bots adversários vivos
        for (let j = 0; j < bots.length; j++) {
          const other = bots[j];
          if (other.team !== bot.team) {
            const d = bot.group.position.distanceTo(other.group.position);
            const otherEye = new THREE.Vector3(
              other.group.position.x,
              other.group.position.y + 1.48,
              other.group.position.z
            );
            const visible = d < 52 && checkBotLineOfSight(bot.group.position, otherEye);
            if (visible) {
              if (d < bestVisibleDist) {
                bestVisibleDist = d;
                bestEnemyBot = other;
                targetIsPlayer = false;
              }
            } else if (d < bestHiddenDist) {
              bestHiddenDist = d;
              bestHiddenEnemyBot = other;
              hiddenTargetIsPlayer = false;
            }
          }
        }

        // Testa o jogador vivo (se for da equipe adversária) com igual prioridade
        if (!player.isDead && player.team !== bot.team) {
          const distToPlayer = bot.group.position.distanceTo(player.pos);
          const playerVisible =
            distToPlayer < 52 && checkBotLineOfSight(bot.group.position, player.pos);
          if (playerVisible) {
            if (distToPlayer < bestVisibleDist) {
              bestVisibleDist = distToPlayer;
              bestEnemyBot = null;
              targetIsPlayer = true;
            }
          } else if (distToPlayer < bestHiddenDist) {
            bestHiddenDist = distToPlayer;
            bestHiddenEnemyBot = null;
            hiddenTargetIsPlayer = true;
          }
        }

        const hasLOS = bestVisibleDist < Infinity;
        if (!hasLOS) {
          bestEnemyBot = bestHiddenEnemyBot;
          targetIsPlayer = hiddenTargetIsPlayer;
        }

        const combatTargetPos = targetIsPlayer
          ? player.pos
          : bestEnemyBot
          ? bestEnemyBot.group.position
          : bot.patrolGoal;

        // 2. NAVEGAÇÃO TÁTICA POR WAYPOINTS QUANDO SEM LINHA DE VISÃO (LOS)
        bot.waypointTimer -= dt;
        const distToGoal = Math.hypot(
          bot.patrolGoal.x - bot.group.position.x,
          bot.patrolGoal.z - bot.group.position.z
        );

        if (!hasLOS && (distToGoal < 2.4 || bot.waypointTimer <= 0)) {
          // Escolhe um waypoint 3D que aproxime o bot da posição do inimigo mais próximo (incluindo escadarias e lajes)
          let bestWpIdx = (bot.waypointIndex + 1) % activeWaypoints.length;
          let bestScore = Infinity;
          for (let w = 0; w < activeWaypoints.length; w++) {
            const wp = activeWaypoints[w];
            const dFromBot = Math.hypot(
              wp[0] - bot.group.position.x,
              wp[2] - bot.group.position.z
            );
            if (dFromBot < 2.2) continue;
            const dToEnemy = Math.hypot(
              wp[0] - combatTargetPos.x,
              wp[2] - combatTargetPos.z
            );
            const score = dToEnemy * 0.75 + dFromBot * 0.45 + Math.random() * 4.5;
            if (score < bestScore) {
              bestScore = score;
              bestWpIdx = w;
            }
          }
          bot.waypointIndex = bestWpIdx;
          const chosenWp = activeWaypoints[bestWpIdx] || [0, 0, 0];
          bot.patrolGoal.set(
            chosenWp[0] + (Math.random() - 0.5) * 1.8,
            chosenWp[1],
            chosenWp[2] + (Math.random() - 0.5) * 1.8
          );
          bot.waypointTimer = 3.2 + Math.random() * 2.4;
        }

        // Se tem LOS, olha e se move em relação ao inimigo visível; se não tem LOS, navega pelo Waypoint
        const moveGoalPos = hasLOS ? combatTargetPos : bot.patrolGoal;
        const lookGoalPos = hasLOS ? combatTargetPos : bot.patrolGoal;

        bot.group.lookAt(lookGoalPos.x, bot.group.position.y, lookGoalPos.z);

        const combatDist = Math.hypot(
          combatTargetPos.x - bot.group.position.x,
          combatTargetPos.z - bot.group.position.z
        );

        bot.strafeTimer -= dt;
        if (bot.strafeTimer <= 0) {
          bot.strafeDir *= -1;
          bot.strafeTimer = 0.75 + Math.random() * 1.1;
        }

        // 3. MOVIMENTAÇÃO CONTÍNUA COM STRAFE EM COMBATE E SENSORES DE DESVIO DE PAREDES
        _toTarget.set(
          moveGoalPos.x - bot.group.position.x,
          0,
          moveGoalPos.z - bot.group.position.z
        );
        const moveDist = _toTarget.length();
        if (moveDist > 0.001) _toTarget.divideScalar(moveDist);

        // Em combate com LOS: avança se longe (>13m), recua se muito perto (<5.5m) e faz strafe lateral constante!
        let forwardWeight = 1.0;
        let strafeWeight = 0.35;
        if (hasLOS) {
          if (combatDist > 13.5) {
            forwardWeight = 0.85;
            strafeWeight = 0.65;
          } else if (combatDist < 5.5) {
            forwardWeight = -0.65;
            strafeWeight = 0.95;
          } else {
            forwardWeight = 0.18;
            strafeWeight = 0.98;
          }
        }

        const strafeVecX = -_toTarget.z * bot.strafeDir;
        const strafeVecZ = _toTarget.x * bot.strafeDir;

        let desiredDirX = _toTarget.x * forwardWeight + strafeVecX * strafeWeight;
        let desiredDirZ = _toTarget.z * forwardWeight + strafeVecZ * strafeWeight;

        // Repulsão suave entre bots para nunca empilharem no mesmo ponto
        for (let k = 0; k < bots.length; k++) {
          if (k === i) continue;
          const otherBot = bots[k];
          const sepX = bot.group.position.x - otherBot.group.position.x;
          const sepZ = bot.group.position.z - otherBot.group.position.z;
          const sepDistSq = sepX * sepX + sepZ * sepZ;
          if (sepDistSq > 0.0001 && sepDistSq < 1.8) {
            const sepDist = Math.sqrt(sepDistSq);
            desiredDirX += (sepX / sepDist) * 0.85;
            desiredDirZ += (sepZ / sepDist) * 0.85;
          }
        }

        const desiredLen = Math.hypot(desiredDirX, desiredDirZ);
        if (desiredLen > 0.001) {
          desiredDirX /= desiredLen;
          desiredDirZ /= desiredLen;
        }

        // Testa sensores angulares (Whiskers) para desviar de paredes e caixas sem travar
        const baseAngle = Math.atan2(desiredDirX, desiredDirZ);
        const stepDist = bot.speed * dt;
        let movedBot = false;

        for (let a = 0; a < STEER_ANGLES.length; a++) {
          const testAngle = baseAngle + STEER_ANGLES[a] * bot.strafeDir;
          const dirX = Math.sin(testAngle);
          const dirZ = Math.cos(testAngle);
          const candidateX = bot.group.position.x + dirX * stepDist;
          const candidateZ = bot.group.position.z + dirZ * stepDist;
          const probeX = bot.group.position.x + dirX * 0.95;
          const probeZ = bot.group.position.z + dirZ * 0.95;

          const candGroundY = getGroundElevationAt(
            candidateX,
            candidateZ,
            bot.group.position.y,
            elevationZones
          );
          const probeGroundY = getGroundElevationAt(
            probeX,
            probeZ,
            bot.group.position.y,
            elevationZones
          );

          if (
            !collidesWithWorld(candidateX, candidateZ, 0.56, candGroundY + 1.72) &&
            !collidesWithWorld(probeX, probeZ, 0.56, probeGroundY + 1.72)
          ) {
            bot.group.position.x = candidateX;
            bot.group.position.z = candidateZ;
            bot.group.position.y = THREE.MathUtils.damp(
              bot.group.position.y,
              candGroundY,
              18,
              dt
            );
            movedBot = true;
            if (a > 2 && !hasLOS) {
              bot.waypointTimer = Math.min(bot.waypointTimer, 0.6);
            }
            break;
          }
        }

        // Fallback deslizante nos eixos X/Z caso o bot esteja num canto apertado
        if (!movedBot) {
          const tryX = bot.group.position.x + desiredDirX * stepDist;
          const tryZ = bot.group.position.z + desiredDirZ * stepDist;
          const gx = getGroundElevationAt(tryX, bot.group.position.z, bot.group.position.y, elevationZones);
          const gz = getGroundElevationAt(bot.group.position.x, tryZ, bot.group.position.y, elevationZones);
          if (!collidesWithWorld(tryX, bot.group.position.z, 0.55, gx + 1.72)) {
            bot.group.position.x = tryX;
            bot.group.position.y = gx;
            movedBot = true;
          } else if (!collidesWithWorld(bot.group.position.x, tryZ, 0.55, gz + 1.72)) {
            bot.group.position.z = tryZ;
            bot.group.position.y = gz;
            movedBot = true;
          } else {
            bot.strafeDir *= -1;
            bot.waypointTimer = 0;
          }
        }

        if (movedBot) {
          bot.walkCycle += dt * 10.5;
          const legSwing = Math.sin(bot.walkCycle) * 0.42;
          bot.leftLeg.rotation.x = legSwing;
          bot.rightLeg.rotation.x = -legSwing;
          bot.leftArm.rotation.x = -0.55 + Math.sin(bot.walkCycle) * 0.18;
          bot.rightArm.rotation.x = -0.75 - Math.sin(bot.walkCycle) * 0.18;
        }

        // 4. SISTEMA DE RAJADAS TÁTICAS (BURST FIRE) + RASTROS DE BALA 3D (TRACERS)
        if ((targetIsPlayer || bestEnemyBot) && hasLOS && combatDist < 50) {
          if (bot.burstShotsLeft > 0) {
            bot.burstShotTimer -= dt;
            if (bot.burstShotTimer <= 0) {
              bot.burstShotsLeft--;
              bot.burstShotTimer = 0.13 + Math.random() * 0.05;
              if (bot.burstShotsLeft <= 0) {
                bot.attackCooldown = 0.62 + Math.random() * 0.55;
              }

              bot.muzzleFlash.visible = true;
              setTimeout(() => {
                bot.muzzleFlash.visible = false;
              }, 50);

              const muzzleWorld = new THREE.Vector3();
              bot.muzzleFlash.getWorldPosition(muzzleWorld);
              const distFromPlayerCam = muzzleWorld.distanceTo(camera.position);
              audioRef.current.playBotGunshot(distFromPlayerCam, bot.team === 'CT');

              const tracerColor = bot.team === 'CT' ? 0x60a5fa : 0xfbbf24;

              if (targetIsPlayer) {
                // Probabilidade de acerto tática equilibrada (recompensa strafe e distância)
                const isPlayerMoving = _moveDir.lengthSq() > 0.1;
                const distFactor = Math.max(0.28, 1 - combatDist / 62);
                const hitChance = distFactor * (isPlayerMoving ? 0.52 : 0.72);
                const didHitPlayer = Math.random() < hitChance;

                if (didHitPlayer) {
                  const hitEnd = new THREE.Vector3(
                    player.pos.x + (Math.random() - 0.5) * 0.25,
                    player.pos.y - 0.25,
                    player.pos.z + (Math.random() - 0.5) * 0.25
                  );
                  spawnBulletTracer(muzzleWorld, hitEnd, tracerColor);

                  audioRef.current.playPlayerDamage();
                  const rawDamage = 8 + Math.floor(Math.random() * 6);
                  if (player.armor > 0) {
                    const absorbed = Math.min(player.armor, Math.ceil(rawDamage * 0.5));
                    player.armor -= absorbed;
                    player.hp = Math.max(0, player.hp - (rawDamage - absorbed));
                  } else {
                    player.hp = Math.max(0, player.hp - rawDamage);
                  }

                  setDamageFlash(true);
                  setTimeout(() => setDamageFlash(false), 140);

                  if (player.hp <= 0) {
                    player.isDead = true;
                    player.zoomLevel = 0;
                    player.targetFov = 75;
                    if (weaponGroup) weaponGroup.visible = false;

                    pushKillfeed(
                      bot.name,
                      bot.team,
                      `Você (${player.team === 'CT' ? 'PM' : 'Bandidos'})`,
                      player.team,
                      bot.weaponLabel,
                      false
                    );

                    const livingAlly = getFirstLivingAllyBot();
                    if (livingAlly) {
                      showBanner(
                        `VOCÊ FOI ABATIDO! APERTE [E] PARA ASSUMIR O ALIADO (${livingAlly.name})!`,
                        4.0
                      );
                    }
                    evaluateRoundOutcome(false);
                  }
                  syncHud();
                } else {
                  // Tiro passou raspando pelo jogador (Tracer visível + faísca no cenário)
                  const missEnd = new THREE.Vector3(
                    player.pos.x + (Math.random() - 0.5) * 1.6,
                    player.pos.y - 0.3 + (Math.random() - 0.5) * 0.8,
                    player.pos.z + (Math.random() - 0.5) * 1.6
                  );
                  spawnBulletTracer(muzzleWorld, missEnd, tracerColor);
                  spawnImpactSparks(missEnd, new THREE.Vector3(0, 1, 0), tracerColor);
                }
              } else if (bestEnemyBot) {
                // Combate Tático Bot vs Bot com Tracer 3D (respeitando altura das lajes)
                const botTargetCenter = new THREE.Vector3(
                  bestEnemyBot.group.position.x + (Math.random() - 0.5) * 0.45,
                  bestEnemyBot.group.position.y + 1.25 + (Math.random() - 0.5) * 0.35,
                  bestEnemyBot.group.position.z + (Math.random() - 0.5) * 0.45
                );
                spawnBulletTracer(muzzleWorld, botTargetCenter, tracerColor);

                if (Math.random() < 0.62) {
                  const botDmg = 14 + Math.floor(Math.random() * 10);
                  const isBotHS = Math.random() < 0.2;
                  bestEnemyBot.hp -= isBotHS ? botDmg * 2 : botDmg;
                  bestEnemyBot.hitFlashTimer = 0.11;
                  bestEnemyBot.bodyMat.color.setHex(0xffffff);
                  bestEnemyBot.bodyMat.emissive.setHex(0x552222);
                  spawnImpactSparks(botTargetCenter, new THREE.Vector3(0, 1, 0), 0xef4444);

                  if (bestEnemyBot.hp <= 0) {
                    scene.remove(bestEnemyBot.group);
                    const deadIdx = bots.indexOf(bestEnemyBot);
                    if (deadIdx !== -1) bots.splice(deadIdx, 1);

                    pushKillfeed(
                      bot.name,
                      bot.team,
                      bestEnemyBot.name,
                      bestEnemyBot.team,
                      bot.weaponLabel,
                      isBotHS
                    );
                    evaluateRoundOutcome(false);
                  }
                  syncHud();
                }
              }
            }
          } else {
            bot.attackCooldown -= dt;
            if (bot.attackCooldown <= 0) {
              bot.burstShotsLeft = 2 + (Math.random() > 0.45 ? 1 : 0);
              bot.burstShotTimer = 0;
            }
          }
        }
      }
    };

    /* ==========================================================================
       3. ARQUITETURA animate() — Loop de Renderização
       ========================================================================== */
    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    };

    const animate = () => {
      const rawDt = clock.getDelta();
      const dt = Math.min(rawDt, 0.05);
      update(dt);
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(animate);
      } else {
        frameId = requestAnimationFrame(animate);
      }
    };

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === renderer.domElement;
      gameRef.current.isLocked = locked;
      if (locked) {
        setIsBuyOpen(false);
        setIsCodeModalOpen(false);
        setGameMode('playing');
      } else {
        isMouseDown = false;
        if (
          !gameRef.current.isBuyOpen &&
          !gameRef.current.isCodeOpen &&
          gameRef.current.gameMode === 'playing'
        ) {
          setGameMode('paused');
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!gameRef.current.isLocked || player.isDead) return;
      const zoomFactor =
        player.zoomLevel === 2 ? 0.22 : player.zoomLevel === 1 ? 0.45 : 1.0;
      const sensitivity = 0.0022 * zoomFactor;
      player.yaw -= e.movementX * sensitivity;
      player.pitch = Math.max(
        -Math.PI / 2.25,
        Math.min(Math.PI / 2.25, player.pitch - e.movementY * sensitivity)
      );
    };

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!gameRef.current.isLocked) return;
      if (e.button === 0) {
        isMouseDown = true;
        fireActiveWeapon(false);
      } else if (e.button === 2) {
        e.preventDefault();
        handleSecondaryAction();
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 0) isMouseDown = false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;

      // Tecla E: Assumir controle de um bot aliado vivo se o jogador tiver morrido no round!
      if (e.code === 'KeyE' && player.isDead && gameRef.current.gameMode === 'playing') {
        e.preventDefault();
        takeoverAlliedBot();
        return;
      }

      if (e.code === 'KeyR' && gameRef.current.isLocked) {
        startReload();
      } else if (e.code === 'KeyF' && gameRef.current.isLocked && !player.isDead && !player.isReloading) {
        player.inspectTimer = 1.85;
      } else if (e.code === 'KeyZ' && gameRef.current.isLocked) {
        handleSecondaryAction();
      } else if (e.code === 'KeyQ' && gameRef.current.gameMode === 'playing') {
        e.preventDefault();
        switchToInventorySlot(player.activeSlotIndex + 1);
      } else if (e.code === 'KeyB' && gameRef.current.gameMode !== 'title') {
        const nextBuy = !gameRef.current.isBuyOpen;
        setIsBuyOpen(nextBuy);
        if (nextBuy) {
          document.exitPointerLock?.();
        } else {
          renderer.domElement.requestPointerLock?.();
        }
      } else if (e.code === 'KeyM') {
        toggleMute();
      } else if (e.code === 'KeyN') {
        toggleMusic();
      } else if (
        (e.code === 'Enter' || e.code === 'Space') &&
        gameRef.current.gameMode === 'title' &&
        !gameRef.current.isCodeOpen
      ) {
        e.preventDefault();
        gameRef.current.requestLock();
      }

      if (gameRef.current.isBuyOpen) {
        const buyShortcuts: Record<string, string> = {
          Digit1: 'deagle',
          Digit2: 'm3',
          Digit3: 'mp5',
          Digit4: 'ak47',
          Digit5: 'm4a1',
          Digit6: 'awp',
          Digit7: 'kevlar_kit',
        };
        if (buyShortcuts[e.code]) {
          buyEquipment(buyShortcuts[e.code]);
        }
      } else if (gameRef.current.isLocked) {
        if (e.code === 'Digit1') {
          switchToInventorySlot(0);
        } else if (e.code === 'Digit2') {
          switchToInventorySlot(1);
        } else if (e.code === 'Digit3') {
          switchToInventorySlot(2);
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };

    const onWindowBlur = () => {
      Object.keys(keys).forEach((k) => {
        keys[k] = false;
      });
      isMouseDown = false;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    gameRef.current.requestLock = () => {
      if (!audioRef.current.musicPlaying && !audioRef.current.muted) {
        audioRef.current.startMusic();
        setIsMusicPlaying(true);
      }
      audioRef.current.playBuyOrRoundChime(false);
      setIsBuyOpen(false);
      setIsCodeModalOpen(false);
      setGameMode('playing');
      renderer.domElement.requestPointerLock?.();
    };
    gameRef.current.selectMap = selectMapAndSetup;
    gameRef.current.selectTeamAndStart = selectTeamAndStartMatch;
    gameRef.current.takeoverAlliedBot = takeoverAlliedBot;
    gameRef.current.buyItem = buyEquipment;
    gameRef.current.switchToSlot = switchToInventorySlot;
    gameRef.current.cycleNextWeaponQ = () =>
      switchToInventorySlot(player.activeSlotIndex + 1);
    gameRef.current.restartMatch = restartFullMatch;
    gameRef.current.returnToMenu = () => {
      document.exitPointerLock?.();
      setGameMode('title');
      setMenuTab('main');
      setIsBuyOpen(false);
      setIsCodeModalOpen(false);
    };

    init();
    animate();

    document.addEventListener('pointerlockchange', onPointerLockChange);
    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      audioRef.current.stopMusic();
      if (currentBuiltMap) {
        currentBuiltMap.dispose();
      }
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [toggleMute, toggleMusic]);

  const activeSpec = WEAPON_CATALOG[hud.activeWeaponId] || WEAPON_CATALOG.knife;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 font-sans select-none text-zinc-100">
      {/* Mount Isolado do Canvas Three.js WebGL */}
      <div ref={canvasMountRef} className="fixed inset-0 w-full h-full" />

      {/* ========================================================================
          SOBREPOSIÇÃO DA MIRA TELESCÓPICA DA AWP (ZOOM 2X E 4X NO CLIQUE DIREITO)
          ======================================================================== */}
      {hud.zoomLevel > 0 && gameMode === 'playing' && !hud.isPlayerDead && (
        <div
          className="fixed inset-0 pointer-events-none z-10 flex items-center justify-center"
          style={{
            background:
              'radial-gradient(circle, transparent 33%, rgba(4, 7, 10, 0.96) 35.5%)',
          }}
        >
          <div className="relative w-[68vmin] h-[68vmin] rounded-full border border-white/25">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/80" />
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black/80" />
            <div className="absolute top-1/2 left-0 w-[26%] h-[3px] -translate-y-1/2 bg-black" />
            <div className="absolute top-1/2 right-0 w-[26%] h-[3px] -translate-y-1/2 bg-black" />
            <div className="absolute left-1/2 top-0 h-[26%] w-[3px] -translate-x-1/2 bg-black" />
            <div className="absolute left-1/2 bottom-0 h-[26%] w-[3px] -translate-x-1/2 bg-black" />

            {[-18, -12, -6, 6, 12, 18].map((offset) => (
              <React.Fragment key={offset}>
                <div
                  className="absolute top-1/2 w-[1px] h-2 -translate-y-1/2 bg-white/50"
                  style={{ left: `${50 + offset}%` }}
                />
                <div
                  className="absolute left-1/2 h-[1px] w-2 -translate-x-1/2 bg-white/50"
                  style={{ top: `${50 + offset}%` }}
                />
              </React.Fragment>
            ))}

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />

            <div className="absolute bottom-[16%] left-1/2 -translate-x-1/2 bg-zinc-950/75 backdrop-blur-sm border border-white/10 rounded-full px-3 py-0.5 text-[11px] text-amber-400 font-semibold">
              Zoom {hud.zoomLevel === 1 ? '2.0x' : '4.0x'}
            </div>
          </div>
        </div>
      )}

      {/* Vinheta Vermelha de Dano Recebido */}
      <div
        className={`fixed inset-0 pointer-events-none transition-opacity duration-150 ${
          damageFlash ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background:
            'radial-gradient(circle, transparent 55%, rgba(220, 38, 38, 0.55) 100%)',
        }}
      />

      {/* ========================================================================
          HUD TRANSLÚCIDO MINIMALISTA (ESTILO CS2 / VALORANT)
          ======================================================================== */}
      <div className="fixed inset-0 pointer-events-none z-10 tabular-nums">
        {/* Topo Central: Placar Compacto em Vidro Fosco (PM vs Bandidos) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-950/55 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-2 shadow-xl">
          {/* Lado PM (Polícia Militar) */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-medium text-sky-300/80">
              {hud.ctAlive} vivos
            </span>
            <span className="text-xs font-bold tracking-wider text-sky-400">PM</span>
            <span className="bg-sky-500/20 border border-sky-400/30 rounded-lg px-2.5 py-0.5 text-sm font-black text-white">
              {hud.ctScore}
            </span>
          </div>

          {/* Cronômetro do Round */}
          <div className="flex flex-col items-center px-3 border-x border-white/10 min-w-[76px]">
            <span
              className={`text-sm font-black tracking-wider ${
                hud.isFreezeActive ? 'text-amber-400' : 'text-white'
              }`}
            >
              {formatRoundClock(hud.roundTimeSec)}
            </span>
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
              Round {hud.round}
            </span>
          </div>

          {/* Lado Bandidos */}
          <div className="flex items-center gap-2.5">
            <span className="bg-rose-500/20 border border-rose-400/30 rounded-lg px-2.5 py-0.5 text-sm font-black text-white">
              {hud.trScore}
            </span>
            <span className="text-xs font-bold tracking-wider text-rose-400">BANDIDOS</span>
            <span className="text-[11px] font-medium text-rose-300/80">
              {hud.trAlive} vivos
            </span>
          </div>
        </div>

        {/* Contagem Regressiva de 10s Flutuante no Topo (Sem caixa preta central) */}
        {gameMode === 'playing' && hud.isFreezeActive && !hud.isPlayerDead && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none select-none z-20">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              Preparo
            </span>
            <div
              className={`text-6xl font-black tracking-tighter leading-none transition-transform duration-150 ${
                Math.ceil(hud.freezeTimeSec) <= 3
                  ? 'text-rose-500 scale-110 drop-shadow-[0_4px_20px_rgba(244,63,94,0.75)]'
                  : 'text-amber-400 drop-shadow-[0_4px_20px_rgba(0,0,0,0.85)]'
              }`}
            >
              {Math.max(1, Math.ceil(hud.freezeTimeSec))}
            </div>
          </div>
        )}

        {/* Indicador Rápido ao Trocar de Arma com [Q] */}
        {hud.wheelFlashVisible && !hud.isPlayerDead && !hud.isFreezeActive && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-zinc-950/60 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 shadow-lg">
            {hud.loadout.map((wId, idx) => {
              const sp = WEAPON_CATALOG[wId] || WEAPON_CATALOG.knife;
              const isSelected = idx === hud.activeSlotIndex;
              return (
                <div
                  key={`${wId}-${idx}`}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                    isSelected
                      ? 'bg-white/15 text-amber-400 font-bold'
                      : 'text-zinc-400'
                  }`}
                >
                  {idx + 1}. {sp.shortName}
                </div>
              );
            })}
          </div>
        )}

        {/* Painel de Bot Takeover (Tecla E) quando o jogador morre mas há bots aliados vivos */}
        {hud.isPlayerDead && hud.spectatingAllyName && (
          <div className="absolute top-[28%] left-1/2 -translate-x-1/2 bg-zinc-950/75 backdrop-blur-xl border border-white/15 rounded-2xl px-6 py-4 text-center pointer-events-auto shadow-2xl">
            <div className="text-[11px] text-zinc-400 uppercase tracking-wider mb-0.5">
              Modo Espectador
            </div>
            <div className="text-base font-bold text-white mb-3">
              {hud.spectatingAllyName}{' '}
              <span className="text-emerald-400 font-semibold">
                ({hud.spectatingAllyHp} HP)
              </span>
            </div>
            <button
              onClick={() => gameRef.current.takeoverAlliedBot()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 mx-auto transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <UserCheck className="w-4 h-4" />
              <span>Assumir Bot [E]</span>
            </button>
          </div>
        )}

        {/* Killfeed Minimalista no Canto Superior Direito */}
        <div className="absolute top-4 right-5 flex flex-col items-end gap-1.5">
          {killfeed.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-950/55 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1 text-xs flex items-center gap-2 shadow-md"
            >
              <span
                className={`font-semibold ${
                  item.killerTeam === 'CT' ? 'text-sky-400' : 'text-rose-400'
                }`}
              >
                {item.killer}
              </span>
              <span className="text-zinc-400 text-[11px]">{item.weaponName}</span>
              {item.isHeadshot && (
                <span className="text-amber-400 font-bold flex items-center gap-0.5 text-[11px]">
                  <Skull className="w-3 h-3" /> HS
                </span>
              )}
              <span
                className={`font-semibold ${
                  item.victimTeam === 'CT' ? 'text-sky-400' : 'text-rose-400'
                }`}
              >
                {item.victim}
              </span>
            </div>
          ))}
        </div>

        {/* Notificação Discreta de Eventos */}
        {hud.bannerText && (
          <div className="absolute top-36 left-1/2 -translate-x-1/2 bg-zinc-950/60 backdrop-blur-md border border-white/10 rounded-full px-5 py-1.5 text-xs font-semibold tracking-wider text-amber-300 shadow-lg text-center whitespace-nowrap">
            {hud.bannerText}
          </div>
        )}

        {/* Mira Central Padrão */}
        {gameMode === 'playing' &&
          !hud.isPlayerDead &&
          hud.zoomLevel === 0 &&
          !isBuyOpen &&
          !isCodeModalOpen && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-emerald-400 shadow-[0_0_2px_#000]" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-emerald-400 shadow-[0_0_2px_#000]" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-emerald-400 shadow-[0_0_2px_#000]" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-emerald-400 shadow-[0_0_2px_#000]" />
              <div
                className={`w-1 h-1 rounded-full ${
                  headshotFlash ? 'bg-rose-500 scale-150' : 'bg-white/90'
                } transition-transform`}
              />
            </div>
          )}

        {/* Canto Inferior Esquerdo: Painel Único Translúcido (Vida, Colete e Saldo) */}
        <div className="absolute bottom-5 left-6 flex items-center gap-5 bg-zinc-950/55 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 shadow-xl">
          {/* Vida (HP) */}
          <div className="flex flex-col gap-1 min-w-[68px]">
            <div className="flex items-center gap-2">
              <Heart
                className={`w-4 h-4 ${
                  hud.hp <= 30 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'
                }`}
              />
              <span
                className={`text-2xl font-black tracking-tight leading-none ${
                  hud.hp <= 30 ? 'text-rose-400' : 'text-white'
                }`}
              >
                {hud.hp}
              </span>
            </div>
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  hud.hp <= 30 ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, hud.hp))}%` }}
              />
            </div>
          </div>

          {/* Colete (Armor) */}
          <div className="flex flex-col gap-1 min-w-[68px]">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400" />
              <span className="text-2xl font-black tracking-tight leading-none text-white">
                {hud.armor}
              </span>
            </div>
            <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-400 transition-all duration-150"
                style={{ width: `${Math.min(100, Math.max(0, hud.armor))}%` }}
              />
            </div>
          </div>

          <div className="h-7 w-[1px] bg-white/10" />

          {/* Saldo ($ Money) */}
          <div className="flex items-center gap-1 text-amber-400 font-bold text-lg">
            <span>${hud.money}</span>
          </div>
        </div>

        {/* Canto Inferior Direito: Slots Minimalistas + Munição Unificada */}
        <div className="absolute bottom-5 right-6 flex flex-col items-end gap-2">
          {/* Slots 1, 2, 3 Compactos */}
          <div className="flex items-center gap-1.5">
            {hud.loadout.map((wId, idx) => {
              const sp = WEAPON_CATALOG[wId] || WEAPON_CATALOG.knife;
              const isCurrent = idx === hud.activeSlotIndex;
              return (
                <div
                  key={`${wId}-${idx}`}
                  className={`px-2.5 py-1 rounded-lg text-xs backdrop-blur-md transition-all ${
                    isCurrent
                      ? 'bg-white/15 border border-amber-400/60 text-white font-semibold shadow-sm'
                      : 'bg-zinc-950/40 border border-white/5 text-zinc-400'
                  }`}
                >
                  <span className="text-zinc-500 mr-1">{idx + 1}</span>
                  {sp.shortName}
                </div>
              );
            })}
          </div>

          {/* Barra Unificada de Arma Ativa, Munição e Kills */}
          <div className="flex items-center gap-5 bg-zinc-950/55 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 shadow-xl">
            <div className="flex flex-col items-start pr-4 border-r border-white/10">
              <span className="text-[11px] font-medium text-zinc-400">
                {hud.isReloading ? (
                  <span className="text-amber-400 font-semibold animate-pulse">
                    Recarregando...
                  </span>
                ) : (
                  activeSpec.shortName
                )}
              </span>
              <span className="text-xs font-semibold text-zinc-300">
                {hud.kills} Kills{' '}
                {hud.headshots > 0 && (
                  <span className="text-amber-400">· {hud.headshots} HS</span>
                )}
              </span>
            </div>

            <div className="text-right min-w-[84px]">
              {activeSpec.isMelee ? (
                <span className="text-lg font-bold tracking-wider text-amber-400 uppercase">
                  Lâmina
                </span>
              ) : (
                <div className="flex items-baseline justify-end gap-1">
                  <span className="text-2xl font-black text-white leading-none">
                    {hud.activeAmmo.clip}
                  </span>
                  <span className="text-sm font-medium text-zinc-400">
                    / {hud.activeAmmo.reserve}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================
          MENU DE INICIAR TÁTICO MODERNIZADO COM FUNDO DUST II
          ======================================================================== */}
      {gameMode === 'title' && !isCodeModalOpen && (
        <div className="fixed inset-0 z-20 flex flex-col justify-between overflow-hidden">
          {/* Tela de Fundo Panorâmica da Dust II */}
          <MenuBackground styleMode={bgStyle} />

          {/* Top Bar Limpo (3 Zonas) */}
          <header className="relative z-10 w-full px-8 py-4 flex items-center justify-between gap-8 border-b border-white/10 bg-zinc-950/60 backdrop-blur-md">
            <div className="text-sm font-bold tracking-wider text-white whitespace-nowrap shrink-0">
              COUNTER-STRIKE 1.6
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1 text-xs">
              <button
                onClick={() => setBgStyle('dust2')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  bgStyle === 'dust2'
                    ? 'bg-amber-400 text-zinc-950 font-semibold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                Dust II
              </button>
              <button
                onClick={() => setBgStyle('sandstorm')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  bgStyle === 'sandstorm'
                    ? 'bg-amber-400 text-zinc-950 font-semibold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                Tempestade
              </button>
              <button
                onClick={() => setBgStyle('tactical_night')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  bgStyle === 'tactical_night'
                    ? 'bg-sky-400 text-zinc-950 font-semibold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                Noturno
              </button>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={toggleMusic}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-200 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span>{isMusicPlaying ? 'Música: ON' : 'Música: OFF'}</span>
              </button>

              <button
                onClick={() => setIsCodeModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-amber-400 font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Baixar HTML</span>
              </button>
            </div>
          </header>

          {/* Área Central do Menu de Início */}
          <div className="relative z-10 flex-1 px-10 py-6 flex items-center">
            {/* 1. ABA PRINCIPAL */}
            {menuTab === 'main' && (
              <div className="max-w-lg w-full bg-zinc-950/65 backdrop-blur-xl border border-white/15 rounded-3xl p-8 shadow-2xl">
                <div className="mb-6">
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
                    Arena Tática 5v5 · Mapa: {MAP_CATALOG[hud.activeMapId].name}
                  </div>
                  <h1 className="text-4xl font-black tracking-tight text-white">
                    COUNTER-STRIKE
                  </h1>
                  <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                    Combate competitivo 5v5 em primeira pessoa com cenários brasileiros do Rio de Janeiro,
                    loja tática de armas e troca rápida de equipamento.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => gameRef.current.requestLock()}
                    className="group px-5 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-sm uppercase tracking-wider flex items-center justify-between shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Play className="w-5 h-5 fill-current" />
                      <div className="text-left">
                        <div>Jogar 5v5 Agora</div>
                        <div className="text-[11px] font-semibold text-zinc-800 normal-case">
                          {MAP_CATALOG[hud.activeMapId].name} · Equipe:{' '}
                          {hud.playerTeam === 'CT' ? 'Polícia Militar (PM)' : 'Bandidos'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setMenuTab('maps')}
                    className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-sky-400" />
                      <span>Selecionar Mapa</span>
                    </div>
                    <span className="text-xs font-bold text-amber-400">
                      {MAP_CATALOG[hud.activeMapId].name} ({MAP_CATALOG[hud.activeMapId].location})
                    </span>
                  </button>

                  <button
                    onClick={() => setMenuTab('team')}
                    className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Escolher Equipe</span>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        hud.playerTeam === 'CT' ? 'text-sky-400' : 'text-rose-400'
                      }`}
                    >
                      {hud.playerTeam === 'CT' ? 'Polícia Militar (PM)' : 'Bandidos'}
                    </span>
                  </button>

                  <button
                    onClick={() => setMenuTab('arsenal')}
                    className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Swords className="w-4 h-4 text-amber-400" />
                      <span>Arsenal de Armas</span>
                    </div>
                    <span className="text-xs text-zinc-400">17 Armas</span>
                  </button>

                  <button
                    onClick={() => setMenuTab('controls')}
                    className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Keyboard className="w-4 h-4 text-amber-400" />
                      <span>Controles</span>
                    </div>
                    <span className="text-xs text-zinc-400">WASD, B, Q, F, E</span>
                  </button>
                </div>
              </div>
            )}

            {/* 1.5. ABA DE SELEÇÃO DE MAPAS (DUST II + VIELAS RJ) */}
            {menuTab === 'maps' && (
              <div className="max-w-3xl w-full bg-zinc-950/85 backdrop-blur-xl border border-white/15 rounded-3xl p-7 shadow-2xl max-h-[84vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setMenuTab('main')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-lg font-bold text-white">Seleção de Mapas 3D</h2>
                      <p className="text-xs text-zinc-400">
                        Escolha o cenário para a partida 5v5 (apenas o mapa ativo é mantido na GPU)
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-amber-400">
                    Ativo: {MAP_CATALOG[hud.activeMapId].name}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pr-1">
                  {Object.values(MAP_CATALOG).map((mapMeta) => {
                    const isSelected = hud.activeMapId === mapMeta.id;
                    return (
                      <div
                        key={mapMeta.id}
                        className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'bg-amber-400/10 border-amber-400 shadow-lg'
                            : 'bg-white/5 hover:bg-white/10 border-white/10'
                        }`}
                      >
                        <div>
                          {/* Ilustração Vetorial de Pré-Visualização do Mapa */}
                          <div className="relative h-36 w-full rounded-xl overflow-hidden mb-3.5 border border-white/10 bg-zinc-900">
                            {mapMeta.id === 'vielas' ? (
                              <svg viewBox="0 0 320 140" className="w-full h-full" aria-label="Preview Vielas">
                                <defs>
                                  <linearGradient id="skyVielas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0284c7" />
                                    <stop offset="65%" stopColor="#38bdf8" />
                                    <stop offset="100%" stopColor="#fde68a" />
                                  </linearGradient>
                                </defs>
                                <rect width="320" height="140" fill="url(#skyVielas)" />
                                {/* Casas em camadas no morro com tijolo baiano e caixas d'água azuis */}
                                <rect x="18" y="48" width="68" height="72" fill="#b4532a" stroke="#783519" strokeWidth="2" />
                                <rect x="14" y="43" width="76" height="6" fill="#64748b" />
                                {/* Caixa d'água azul */}
                                <rect x="52" y="28" width="22" height="15" rx="2" fill="#0284c7" stroke="#bae6fd" strokeWidth="1.5" />
                                {/* Passarela elevada central */}
                                <rect x="86" y="64" width="148" height="9" fill="#9ca3af" stroke="#4b5563" strokeWidth="1.5" />
                                {/* Casa Leste e Oficina */}
                                <rect x="234" y="45" width="68" height="75" fill="#d99b4e" stroke="#92400e" strokeWidth="2" />
                                <rect x="246" y="27" width="22" height="16" rx="2" fill="#0284c7" stroke="#bae6fd" strokeWidth="1.5" />
                                {/* Escadarias brancas subindo para as lajes */}
                                <path d="M88,120 L115,73 L132,73 L106,120 Z" fill="#d4d4d8" />
                                <path d="M232,120 L205,73 L188,73 L214,120 Z" fill="#d4d4d8" />
                                {/* Fiação aérea */}
                                <path d="M10,22 Q160,44 310,18" stroke="#18181b" strokeWidth="1.8" fill="none" />
                                <path d="M10,28 Q160,52 310,25" stroke="#18181b" strokeWidth="1.4" fill="none" />
                                {/* Piso de paralelepípedo */}
                                <rect x="0" y="118" width="320" height="22" fill="#52525b" />
                              </svg>
                            ) : mapMeta.id === 'orla' ? (
                              <svg viewBox="0 0 320 140" className="w-full h-full" aria-label="Preview Orla">
                                <defs>
                                  <linearGradient id="skyOrla" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0284c7" />
                                    <stop offset="100%" stopColor="#bae6fd" />
                                  </linearGradient>
                                </defs>
                                <rect width="320" height="140" fill="url(#skyOrla)" />
                                {/* Prédios da Avenida Atlântica a Oeste */}
                                <rect x="14" y="26" width="54" height="84" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.5" />
                                <rect x="22" y="34" width="38" height="10" fill="#0f172a" />
                                <rect x="22" y="52" width="38" height="10" fill="#0f172a" />
                                <rect x="22" y="70" width="38" height="10" fill="#0f172a" />
                                {/* Quiosque do Calçadão */}
                                <polygon points="92,72 120,54 148,72" fill="#047857" />
                                <rect x="102" y="72" width="36" height="36" fill="#78350f" />
                                {/* Posto de Salva-Vidas Branco na Areia */}
                                <rect x="178" y="62" width="52" height="44" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.5" />
                                <rect x="172" y="56" width="64" height="6" fill="#0284c7" />
                                {/* Guarda-sol colorido e Mar Azul a Leste */}
                                <polygon points="244,78 264,65 284,78" fill="#ef4444" />
                                <rect x="263" y="78" width="2" height="28" fill="#1e293b" />
                                {/* Faixas de Calçadão, Areia e Mar */}
                                <rect x="0" y="108" width="135" height="32" fill="#1e293b" />
                                <path d="M5,122 Q35,112 65,122 T125,122" stroke="#f8fafc" strokeWidth="4" fill="none" />
                                <rect x="135" y="108" width="125" height="32" fill="#f3d9a4" />
                                <rect x="260" y="104" width="60" height="36" fill="#0284c7" />
                              </svg>
                            ) : mapMeta.id === 'centro' ? (
                              <svg viewBox="0 0 320 140" className="w-full h-full" aria-label="Preview Centro">
                                <defs>
                                  <linearGradient id="skyCentro" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#38bdf8" />
                                    <stop offset="100%" stopColor="#e2e8f0" />
                                  </linearGradient>
                                </defs>
                                <rect width="320" height="140" fill="url(#skyCentro)" />
                                {/* Galeria Histórica Saara e Marquise a Oeste */}
                                <rect x="12" y="34" width="66" height="76" fill="#e5cca0" stroke="#7f5539" strokeWidth="1.5" />
                                <rect x="18" y="44" width="22" height="24" fill="#1e293b" />
                                <rect x="48" y="44" width="22" height="24" fill="#1e293b" />
                                <rect x="10" y="74" width="76" height="6" fill="#334155" />
                                {/* Banca de Jornal Verde no Largo Central */}
                                <rect x="92" y="82" width="32" height="28" fill="#047857" stroke="#064e3b" strokeWidth="1.5" />
                                <rect x="89" y="78" width="38" height="5" fill="#1e293b" />
                                {/* Terraço Elevado do Largo da Carioca (+2.4m) com Escadarias */}
                                <polygon points="132,110 146,84 198,84 212,110" fill="#64748b" />
                                <rect x="146" y="78" width="52" height="7" fill="#cbd5e1" />
                                <rect x="168" y="62" width="8" height="16" fill="#1e293b" />
                                {/* Edifícios Corporativos da Av. Rio Branco a Leste */}
                                <rect x="246" y="16" width="62" height="94" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
                                <rect x="254" y="24" width="46" height="14" fill="#1e3a5f" />
                                <rect x="254" y="44" width="46" height="14" fill="#172554" />
                                <rect x="254" y="64" width="46" height="14" fill="#1e3a5f" />
                                {/* Táxi Carioca Amarelo com Faixa Azul na Avenida */}
                                <rect x="214" y="94" width="28" height="14" rx="2" fill="#facc15" />
                                <rect x="214" y="99" width="28" height="3" fill="#0284c7" />
                                {/* Calçada de Pedra Portuguesa e Avenida Asfaltada com Faixa de Pedestres */}
                                <rect x="0" y="110" width="205" height="30" fill="#cbd5e1" />
                                <rect x="205" y="110" width="115" height="30" fill="#27272a" />
                                <rect x="214" y="116" width="14" height="4" fill="#f8fafc" />
                                <rect x="234" y="116" width="14" height="4" fill="#f8fafc" />
                                <rect x="254" y="116" width="14" height="4" fill="#f8fafc" />
                                <rect x="274" y="116" width="14" height="4" fill="#f8fafc" />
                              </svg>
                            ) : mapMeta.id === 'complexo' ? (
                              <svg viewBox="0 0 320 140" className="w-full h-full" aria-label="Preview Complexo">
                                <defs>
                                  <linearGradient id="skyComplexo" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#2563eb" />
                                    <stop offset="100%" stopColor="#dbeafe" />
                                  </linearGradient>
                                </defs>
                                <rect width="320" height="140" fill="url(#skyComplexo)" />
                                {/* Bloco Habitacional Oeste (A-01) com Caixa d'Água */}
                                <rect x="12" y="26" width="66" height="86" fill="#d6a868" stroke="#78350f" strokeWidth="1.5" />
                                <rect x="28" y="14" width="28" height="12" rx="1.5" fill="#0284c7" />
                                <rect x="20" y="36" width="18" height="14" fill="#1e293b" />
                                <rect x="46" y="36" width="18" height="14" fill="#1e293b" />
                                <rect x="20" y="58" width="18" height="14" fill="#1e293b" />
                                <rect x="46" y="58" width="18" height="14" fill="#1e293b" />
                                {/* Bloco Habitacional Leste em Pilotis (B-02) com Garagem Coberta */}
                                <rect x="242" y="24" width="66" height="62" fill="#7ba3be" stroke="#1e3a8a" strokeWidth="1.5" />
                                <rect x="260" y="12" width="28" height="12" rx="1.5" fill="#0284c7" />
                                <rect x="246" y="86" width="8" height="26" fill="#475569" />
                                <rect x="296" y="86" width="8" height="26" fill="#475569" />
                                {/* Varandas (+2.6m), Escadarias e Passarela Aérea Central */}
                                <rect x="78" y="68" width="164" height="8" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
                                <rect x="155" y="76" width="10" height="36" fill="#64748b" />
                                <polygon points="78,112 96,76 112,76 94,112" fill="#cbd5e1" />
                                <polygon points="242,112 224,76 208,76 226,112" fill="#cbd5e1" />
                                {/* Pátio Comunitário e Quadra Verde no Centro */}
                                <rect x="0" y="112" width="320" height="28" fill="#475569" />
                                <rect x="96" y="116" width="128" height="20" fill="#0f766e" stroke="#f8fafc" strokeWidth="1.5" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 320 140" className="w-full h-full" aria-label="Preview Dust II">
                                <defs>
                                  <linearGradient id="skyDust" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#d97706" />
                                    <stop offset="100%" stopColor="#fde68a" />
                                  </linearGradient>
                                </defs>
                                <rect width="320" height="140" fill="url(#skyDust)" />
                                {/* Muralhas e Portão Norte de Arenito */}
                                <rect x="20" y="42" width="95" height="76" fill="#cfa977" stroke="#92400e" strokeWidth="2" />
                                <rect x="205" y="42" width="95" height="76" fill="#cfa977" stroke="#92400e" strokeWidth="2" />
                                <rect x="108" y="34" width="104" height="26" fill="#965238" />
                                {/* Caixas empilhadas */}
                                <rect x="65" y="88" width="30" height="30" fill="#a46b39" stroke="#5c3818" strokeWidth="2" />
                                <rect x="225" y="88" width="30" height="30" fill="#a46b39" stroke="#5c3818" strokeWidth="2" />
                                <rect x="0" y="118" width="320" height="22" fill="#e3c18f" />
                              </svg>
                            )}

                            <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-zinc-950/80 backdrop-blur-md border border-white/15 text-[10px] font-bold text-amber-400">
                              {mapMeta.location}
                            </div>
                            {isSelected && (
                              <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-black uppercase">
                                Selecionado
                              </div>
                            )}
                          </div>

                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <h3 className="text-base font-black text-white">{mapMeta.name}</h3>
                              <div className="text-xs font-semibold text-amber-400">
                                {mapMeta.subtitle}
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-zinc-300 leading-relaxed my-2">
                            {mapMeta.description}
                          </p>

                          <div className="space-y-1 text-[11px] text-zinc-400 border-t border-white/10 pt-2.5 mb-3">
                            <div>
                              Ambiente: <strong className="text-zinc-200">{mapMeta.environment}</strong>
                            </div>
                            <div>
                              Recomendado:{' '}
                              <strong className="text-emerald-400">{mapMeta.recommendedPlayers}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => gameRef.current.selectMap(mapMeta.id, false)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-white/15 text-white border-amber-400/50'
                                : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10'
                            }`}
                          >
                            {isSelected ? 'Mapa Ativo' : 'Selecionar'}
                          </button>
                          <button
                            onClick={() => gameRef.current.selectMap(mapMeta.id, true)}
                            className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Jogar neste Mapa
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. ABA ESCOLHA DE TIME */}
            {menuTab === 'team' && (
              <div className="max-w-xl w-full bg-zinc-950/80 backdrop-blur-xl border border-white/15 rounded-3xl p-7 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setMenuTab('main')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-white">Escolha sua Equipe</h2>
                  </div>
                  <span className="text-xs text-zinc-400">PM vs Bandidos (5v5)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => gameRef.current.selectTeamAndStart('CT')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      hud.playerTeam === 'CT'
                        ? 'bg-sky-950/60 border-sky-400'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <div className="text-xs font-semibold text-sky-400 mb-1">Força Policial Tática</div>
                    <div className="text-lg font-bold text-white mb-2">
                      Polícia Militar (PM)
                    </div>
                    <p className="text-xs text-zinc-300 mb-4">
                      Uniforme tático preto, colete balístico PM, capacete, óculos de proteção e coturnos.
                    </p>
                    <button className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs cursor-pointer">
                      Jogar como PM
                    </button>
                  </div>

                  <div
                    onClick={() => gameRef.current.selectTeamAndStart('TR')}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      hud.playerTeam === 'TR'
                        ? 'bg-rose-950/60 border-rose-400'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <div className="text-xs font-semibold text-rose-400 mb-1">Grupo Urbano</div>
                    <div className="text-lg font-bold text-white mb-2">Bandidos</div>
                    <p className="text-xs text-zinc-300 mb-4">
                      Camisa rubro-negra listrada do Flamengo, corrente dourada, bermuda jeans e boné.
                    </p>
                    <button className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs cursor-pointer">
                      Jogar como Bandido
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ABA ARSENAL DE ARMAS */}
            {menuTab === 'arsenal' && (
              <div className="max-w-3xl w-full bg-zinc-950/85 backdrop-blur-xl border border-white/15 rounded-3xl p-7 shadow-2xl max-h-[82vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setMenuTab('main')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-lg font-bold text-white">Arsenal Tático Brasileiro (17 Armas)</h2>
                      <p className="text-xs text-zinc-400">
                        Armamentos da Polícia Militar (PM) e Facções Criminosas · Tecla [B] na partida
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-amber-400 font-semibold">Tecla [F] Inspeciona 3D</span>
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1">
                  {Object.values(WEAPON_CATALOG).map((spec) => (
                    <div
                      key={spec.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[11px] text-zinc-400">{spec.category}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                spec.factionTag === 'PM'
                                  ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                                  : spec.factionTag === 'BANDIDOS'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                                  : 'bg-zinc-500/20 text-zinc-300 border border-zinc-400/30'
                              }`}
                            >
                              {spec.factionTag}
                            </span>
                          </div>
                          <div className="text-sm font-bold text-white">{spec.name}</div>
                        </div>
                        <span className="text-sm font-bold text-amber-400 shrink-0">
                          {spec.isMelee ? 'Grátis' : `$${spec.price}`}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-snug">{spec.description}</p>

                      <div className="flex items-center justify-between text-xs text-zinc-300 border-t border-white/10 pt-2">
                        <span>
                          Dano:{' '}
                          <strong className="text-white">
                            {spec.pellets ? `${spec.damage}x${spec.pellets}` : spec.damage}
                          </strong>
                        </span>
                        <span>·</span>
                        <span>
                          Munição:{' '}
                          <strong className="text-white">
                            {spec.isMelee ? '∞' : `${spec.clipSize}/${spec.reserveMax}`}
                          </strong>
                        </span>
                        <span>·</span>
                        <span>
                          Cadência:{' '}
                          <strong className="text-white">
                            {spec.auto ? 'Auto' : 'Semi'}
                          </strong>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. ABA CONTROLES */}
            {menuTab === 'controls' && (
              <div className="max-w-xl w-full bg-zinc-950/80 backdrop-blur-xl border border-white/15 rounded-3xl p-7 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setMenuTab('main')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-white">Controles</h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-zinc-300">
                    <div className="font-bold text-white mb-1">Movimentação</div>
                    <div><strong className="text-amber-400">W, A, S, D</strong> · Andar</div>
                    <div><strong className="text-amber-400">Espaço</strong> · Pular</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-zinc-300">
                    <div className="font-bold text-white mb-1">Combate</div>
                    <div><strong className="text-amber-400">Mouse 1</strong> · Atirar</div>
                    <div><strong className="text-amber-400">Mouse 2</strong> · Zoom AWP / Estocada</div>
                    <div><strong className="text-amber-400">R</strong> · Recarregar</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-zinc-300">
                    <div className="font-bold text-white mb-1">Equipamento</div>
                    <div><strong className="text-amber-400">B</strong> · Abrir Loja Tática</div>
                    <div><strong className="text-amber-400">Q / 1, 2, 3</strong> · Trocar Arma</div>
                    <div><strong className="text-amber-400">F</strong> · Inspecionar Arma 3D</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5 text-zinc-300">
                    <div className="font-bold text-white mb-1">Partida</div>
                    <div><strong className="text-amber-400">E</strong> · Assumir Bot Aliado</div>
                    <div><strong className="text-amber-400">ESC</strong> · Menu de Pausa</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rodapé Discreto */}
          <footer className="relative z-10 px-8 py-3 bg-zinc-950/60 backdrop-blur-md border-t border-white/10 text-xs text-zinc-400 flex items-center justify-between">
            <span>
              Mapa Ativo: <strong className="text-white">{MAP_CATALOG[hud.activeMapId].name}</strong> · 5v5 Arsenal Brasileiro
            </span>
            <button
              onClick={() => gameRef.current.requestLock()}
              className="text-amber-400 font-semibold hover:underline cursor-pointer"
            >
              Pressione Enter ou Espaço para Jogar
            </button>
          </footer>
        </div>
      )}

      {/* ========================================================================
          MODAL DE PAUSA MINIMALISTA (TECLA ESC)
          ======================================================================== */}
      {gameMode === 'paused' && !isBuyOpen && !isCodeModalOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="max-w-md w-full bg-zinc-950/85 backdrop-blur-xl border border-white/15 rounded-3xl p-7 shadow-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
              Partida 5v5 · Mapa: {MAP_CATALOG[hud.activeMapId].name}
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Jogo Pausado</h2>
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-1 text-xs text-zinc-300 mb-5">
              <span className="font-bold text-sky-400">PM {hud.ctScore}</span>
              <span>·</span>
              <span className="font-mono text-white">{formatRoundClock(hud.roundTimeSec)}</span>
              <span>·</span>
              <span className="font-bold text-rose-400">{hud.trScore} BANDIDOS</span>
            </div>

            <div className="flex flex-col gap-2.5 mb-5">
              <button
                onClick={() => gameRef.current.requestLock()}
                className="w-full py-3 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Continuar Combate</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setIsBuyOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-amber-400" />
                  <span>Loja [B]</span>
                </button>

                <button
                  onClick={() => gameRef.current.restartMatch()}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-zinc-300" />
                  <span>Reiniciar</span>
                </button>
              </div>

              {/* Troca Rápida de Mapa no Menu de Pausa */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.values(MAP_CATALOG).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => gameRef.current.selectMap(m.id, true)}
                    className={`py-2 px-2.5 rounded-xl border font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                      hud.activeMapId === m.id
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{m.name}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => gameRef.current.selectTeamAndStart('CT')}
                  className="py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Jogar como PM
                </button>
                <button
                  onClick={() => gameRef.current.selectTeamAndStart('TR')}
                  className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-rose-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Jogar como Bandido
                </button>
              </div>
            </div>

            {/* Controles discretos de áudio + saída para o Menu Inicial */}
            <div className="border-t border-white/10 pt-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleMute}
                  title="Mudo Geral (Tecla M)"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={toggleMusic}
                  title="Alternar Música (Tecla N)"
                  className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Music className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isMusicPlaying ? 'Música ON' : 'Música OFF'}</span>
                </button>
                <button
                  onClick={cycleMusicTrack}
                  title="Trocar Faixa"
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 cursor-pointer"
                >
                  <Disc className="w-4 h-4 text-amber-400" />
                </button>
              </div>

              <button
                onClick={() => gameRef.current.returnToMenu()}
                className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-rose-400 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Menu Inicial</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          LOJA DE ARMAS CATEGORIZADA (TECLA B) — ARSENAL BRASILEIRO (16 ARMAS)
          ======================================================================== */}
      {isBuyOpen && !isCodeModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 sm:p-6">
          <div className="max-w-3xl w-full bg-zinc-950/90 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Cabeçalho da Loja */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3.5 mb-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">Arsenal Tático · Loja [B]</h2>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      hud.playerTeam === 'CT'
                        ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                    }`}
                  >
                    {hud.playerTeam === 'CT' ? 'Polícia Militar (PM)' : 'Bandidos (TR)'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Escolha a categoria abaixo e equipe no Slot 2 ou Slot 3 · Pressione [F] em jogo para inspecionar
                </p>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-zinc-400">Saldo Disponível</div>
                <div className="text-xl font-black text-amber-400">${hud.money}</div>
              </div>
            </div>

            {/* Abas de Categoria da Loja */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              {(
                [
                  { id: 'pistols', label: 'Pistolas', count: 6 },
                  { id: 'shotguns', label: 'Escopetas', count: 3 },
                  { id: 'rifles', label: 'Fuzis', count: 5 },
                  { id: 'tactical', label: 'Táticos & Sniper', count: 2 },
                ] as { id: WeaponShopTab; label: string; count: number }[]
              ).map((tab) => {
                const isActive = shopTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setShopTab(tab.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md'
                        : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-zinc-950/20 text-zinc-950' : 'bg-white/10 text-zinc-400'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grade de Armas da Aba Selecionada */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 pr-1 mb-4">
              {Object.values(WEAPON_CATALOG)
                .filter((spec) => !spec.isMelee && spec.shopTab === shopTab)
                .map((spec) => {
                  const canAfford = hud.money >= spec.price;
                  const inSlot1 = hud.loadout[1] === spec.id;
                  const inSlot2 = hud.loadout[2] === spec.id;

                  return (
                    <div
                      key={spec.id}
                      className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-colors ${
                        inSlot1 || inSlot2
                          ? 'bg-amber-400/10 border-amber-400/50'
                          : canAfford
                          ? 'bg-white/5 border-white/10 hover:border-white/20'
                          : 'bg-white/[0.02] border-white/5 opacity-55'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                                {spec.category}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  spec.factionTag === 'PM'
                                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                                    : spec.factionTag === 'BANDIDOS'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                                    : 'bg-zinc-500/20 text-zinc-300 border border-zinc-400/30'
                                }`}
                              >
                                {spec.factionTag}
                              </span>
                            </div>
                            <div className="text-sm font-bold text-white">{spec.name}</div>
                          </div>
                          <span className="text-sm font-black text-amber-400 shrink-0">
                            ${spec.price}
                          </span>
                        </div>

                        {/* Silhueta Visual Vetorial da Arma */}
                        <div className="h-9 my-1.5 px-3 rounded-xl bg-zinc-900/80 border border-white/5 flex items-center justify-between">
                          <svg
                            viewBox="0 0 120 32"
                            className="w-28 h-7 text-zinc-200 fill-current"
                            aria-hidden="true"
                          >
                            {spec.shopTab === 'pistols' && (
                              <g>
                                <rect x="24" y="6" width="52" height="8" rx="1.5" />
                                <rect x="74" y="8" width="8" height="4" rx="1" className="text-zinc-400" />
                                <path d="M26,14 L42,14 L36,28 L22,28 Z" />
                                <rect x="42" y="14" width="11" height="5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.8" />
                              </g>
                            )}
                            {spec.shopTab === 'shotguns' && (
                              <g>
                                <path d="M6,18 L28,12 L28,20 L8,25 Z" />
                                <rect x="28" y="10" width="32" height="7" rx="1" />
                                <rect x="60" y="10" width={spec.id === 'sawed_off' ? '34' : '52'} height="3.5" />
                                <rect x="60" y="14.5" width={spec.id === 'sawed_off' ? '26' : '44'} height="3" className="text-amber-400/80" />
                                <rect x="64" y="14" width="18" height="4.5" rx="1" />
                              </g>
                            )}
                            {spec.shopTab === 'rifles' && (
                              <g>
                                <path d="M4,18 L24,11 L24,20 L6,24 Z" />
                                <rect x="24" y="9" width="36" height="8" rx="1" />
                                <path d="M28,17 L35,17 L31,27 L24,27 Z" />
                                {spec.id === 'ak47' ? (
                                  <path d="M46,17 L54,17 L59,29 L50,29 Z" className="text-amber-400/90" />
                                ) : (
                                  <rect x="45" y="17" width="8" height="11" rx="1" className="text-zinc-400" />
                                )}
                                <rect x="60" y="10" width="26" height="6" rx="1" />
                                <rect x="86" y="11.5" width="28" height="2.8" />
                                <rect x="106" y="8" width="3" height="4" />
                              </g>
                            )}
                            {spec.shopTab === 'tactical' && (
                              <g>
                                <path d="M4,17 L24,11 L24,20 L6,23 Z" />
                                <rect x="24" y="10" width="38" height="7" rx="1" />
                                {spec.id === 'awp' && (
                                  <rect x="30" y="4" width="28" height="4" rx="1" className="text-emerald-400" />
                                )}
                                <rect x="44" y="17" width="7" height="10" rx="1" />
                                <rect x="62" y="11.5" width={spec.id === 'awp' ? '52' : '30'} height="3" />
                              </g>
                            )}
                          </svg>

                          <div className="text-right text-[10px] text-zinc-400 leading-tight">
                            <div>
                              Dano:{' '}
                              <strong className="text-zinc-200">
                                {spec.pellets ? `${spec.damage}x${spec.pellets}` : spec.damage}
                              </strong>
                            </div>
                            <div>
                              Pente:{' '}
                              <strong className="text-zinc-200">
                                {spec.clipSize}/{spec.reserveMax}
                              </strong>
                            </div>
                          </div>
                        </div>

                        <p className="text-[11px] text-zinc-400 line-clamp-1 mb-2.5">
                          {spec.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => gameRef.current.buyItem(spec.id, 1)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            inSlot1
                              ? 'bg-amber-400 text-zinc-950 border-amber-400'
                              : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10'
                          }`}
                        >
                          {inSlot1 ? 'Equipada Slot 2' : 'Equipar Slot 2'}
                        </button>
                        <button
                          onClick={() => gameRef.current.buyItem(spec.id, 2)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            inSlot2
                              ? 'bg-amber-400 text-zinc-950 border-amber-400'
                              : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10'
                          }`}
                        >
                          {inSlot2 ? 'Equipada Slot 3' : 'Equipar Slot 3'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Barra Inferior de Suprimento Tático + Fechar */}
            <div className="border-t border-white/10 pt-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                onClick={() => gameRef.current.buyItem('kevlar_kit')}
                className="flex-1 py-2.5 px-4 rounded-xl border bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-400/30 text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Suprimento Tático [Tecla 7]
                  </div>
                  <div className="text-xs font-bold text-white">
                    Colete Balístico 100 + Kit Médico (+50 HP)
                  </div>
                </div>
                <div className="text-sm font-black text-amber-400">$650</div>
              </button>

              <button
                onClick={() => gameRef.current.requestLock()}
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer shrink-0"
              >
                Voltar ao Combate [B]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================
          MODAL EXPORTADOR DO ARQUIVO ÚNICO index.html (COPIAR / BAIXAR)
          ======================================================================== */}
      {isCodeModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-md p-6">
          <div className="max-w-4xl w-full bg-zinc-950 border border-white/15 rounded-3xl p-6 flex flex-col max-h-[90vh] shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Arquivo Único Autônomo (index.html)
                </h2>
                <p className="text-xs text-zinc-400">
                  Versão completa para abrir direto no navegador sem servidor.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyStandaloneHtml}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadStandaloneHtml}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar index.html</span>
                </button>

                <button
                  onClick={() => setIsCodeModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>

            <pre className="flex-1 overflow-auto bg-black/60 border border-white/10 rounded-2xl p-4 text-xs text-zinc-300 font-mono leading-relaxed select-all">
              <code>{STANDALONE_HTML_SOURCE}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
