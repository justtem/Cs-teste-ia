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
} from 'lucide-react';
import { TacticalAudioEngine, MusicTrackId } from './soundEngine';
import {
  WEAPON_CATALOG,
  WeaponSpec,
  STANDALONE_HTML_SOURCE,
} from './standaloneHtmlGenerator';
import { MenuBackground } from './components/MenuBackground';

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

interface AABBCollider {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
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
  muzzleFlash: THREE.Mesh;
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

// Waypoints táticos da Arena Dust II (Corredor Esquerdo, Meio, Portão Norte, Corredor Direito)
const ARENA_WAYPOINTS: [number, number][] = [
  [0.5, -18.5], // Entrada Norte do Portão
  [0.5, -10.5], // Saída Sul do Portão do Meio
  [-15.5, -15.0], // Flanco Noroeste (Longo Esquerdo)
  [-15.5, 0.0], // Corredor Longo Esquerdo Central
  [-14.5, 13.5], // Saída Sudoeste (Base CT)
  [15.5, -15.0], // Flanco Nordeste (Corredor Direito)
  [15.5, 0.0], // Corredor Direito Central
  [14.5, 13.5], // Saída Sudeste (Base CT)
  [-4.5, 4.5], // Praça Central Oeste
  [4.5, -4.5], // Praça Central Leste
  [0.0, 11.0], // Rampa Sul CT
];

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
  'SEAL_ Maverick',
  'GSG9_Jager',
  'SAS_Soap',
  'GIGN_Montagne',
  'CT_Guardian',
];

const TR_BOT_NAMES = [
  'Phoenix_T1',
  'Leet_Krew',
  'Arctic_Avenger',
  'Guerilla_Wolf',
  'Dust_Raider',
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
  const [menuTab, setMenuTab] = useState<'main' | 'team' | 'arsenal' | 'controls'>('main');
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
    let weaponGroup: THREE.Group;
    let muzzleFlashMesh: THREE.Mesh | null = null;
    let frameId = 0;

    const colliders: AABBCollider[] = [];
    const shootableMeshes: THREE.Mesh[] = [];
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
      team: 'CT' as TeamSide,
      isDead: false,
      pos: new THREE.Vector3(0, 1.72, 22),
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
      ammoMap: {
        knife: { clip: 1, reserve: 1 },
        usp: { clip: 12, reserve: 48 },
        deagle: { clip: 7, reserve: 35 },
        m3: { clip: 8, reserve: 32 },
        mp5: { clip: 30, reserve: 120 },
        ak47: { clip: 30, reserve: 90 },
        m4a1: { clip: 30, reserve: 90 },
        awp: { clip: 10, reserve: 30 },
      } as Record<string, WeaponAmmoState>,
      zoomLevel: 0,
      targetFov: 75,
      isReloading: false,
      reloadTimer: 0,
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

    const createProceduralTexture = (
      type: 'sand' | 'sandstone' | 'crate' | 'brick',
      maxAniso: number
    ): THREE.CanvasTexture => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      if (type === 'sand') {
        ctx.fillStyle = '#e3c18f';
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 1800; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#d2ad79' : '#eed0a1';
          ctx.globalAlpha = Math.random() * 0.28;
          ctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
        }
      } else if (type === 'sandstone' || type === 'brick') {
        ctx.fillStyle = type === 'sandstone' ? '#cfa977' : '#965238';
        ctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 1200; i++) {
          ctx.fillStyle = type === 'sandstone' ? '#a67f4e' : '#6e3722';
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
      } else if (type === 'crate') {
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
      }

      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = maxAniso;
      return tex;
    };

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
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
      scene.add(mesh);
      shootableMeshes.push(mesh);
      colliders.push({
        minX: x - w / 2,
        maxX: x + w / 2,
        minY: y - h / 2,
        maxY: y + h / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2,
      });
    };

    const addCompositeCrate = (
      x: number,
      z: number,
      size: number,
      crateMat: THREE.Material,
      trimMat: THREE.Material,
      stackY = 0
    ) => {
      const group = new THREE.Group();
      const yCenter = stackY + size / 2;
      group.position.set(x, stackY, z);

      const core = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), crateMat);
      core.position.y = size / 2;
      core.castShadow = !isSoftwareGl;
      core.receiveShadow = !isSoftwareGl;
      group.add(core);
      shootableMeshes.push(core);

      const beamTop = new THREE.Mesh(
        new THREE.BoxGeometry(size * 1.03, size * 0.1, size * 1.03),
        trimMat
      );
      beamTop.position.y = size - size * 0.05;
      const beamBot = new THREE.Mesh(
        new THREE.BoxGeometry(size * 1.03, size * 0.1, size * 1.03),
        trimMat
      );
      beamBot.position.y = size * 0.05;
      group.add(beamTop, beamBot);

      scene.add(group);
      colliders.push({
        minX: x - size / 2,
        maxX: x + size / 2,
        minY: yCenter - size / 2,
        maxY: yCenter + size / 2,
        minZ: z - size / 2,
        maxZ: z + size / 2,
      });
    };

    // Constrói APENAS UMA arma na mão com a cor da manga da facção do jogador (CT Azul ou TR Vermelho)
    const buildSingleWeaponViewmodel = (spec: WeaponSpec) => {
      if (weaponGroup) {
        camera.remove(weaponGroup);
      }
      weaponGroup = new THREE.Group();
      muzzleFlashMesh = null;

      const sleeveMat = new THREE.MeshStandardMaterial({
        color: player.team === 'CT' ? 0x1e3a8a : 0x7f1d1d,
        roughness: 0.82,
      });
      const gloveMat = new THREE.MeshStandardMaterial({
        color: 0x1c1f22,
        roughness: 0.7,
      });
      const skinMat = new THREE.MeshStandardMaterial({
        color: 0xd8a07a,
        roughness: 0.65,
      });

      const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.42), sleeveMat);
      rightArm.position.set(0.24, -0.25, -0.28);
      rightArm.rotation.y = 0.08;

      const rightGlove = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.088, 0.13), gloveMat);
      rightGlove.position.set(0.21, -0.22, -0.48);

      const rightFingers = new THREE.Mesh(new THREE.BoxGeometry(0.076, 0.072, 0.07), skinMat);
      rightFingers.position.set(0.21, -0.21, -0.54);

      weaponGroup.add(rightArm, rightGlove, rightFingers);

      if (spec.isMelee) {
        const bladeSteelMat = new THREE.MeshStandardMaterial({
          color: 0xe5e7eb,
          roughness: 0.18,
          metalness: 0.92,
        });
        const handleMat = new THREE.MeshStandardMaterial({
          color: 0x1f2937,
          roughness: 0.75,
          metalness: 0.2,
        });
        const fullerMat = new THREE.MeshStandardMaterial({
          color: 0x374151,
          roughness: 0.4,
          metalness: 0.8,
        });

        const grip = new THREE.Mesh(
          new THREE.CylinderGeometry(0.022, 0.026, 0.16, 10),
          handleMat
        );
        grip.rotation.x = Math.PI / 2.3;
        grip.position.set(0.21, -0.17, -0.51);

        const pommel = new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.007, 8, 16), fullerMat);
        pommel.position.set(0.21, -0.22, -0.44);

        const crossGuard = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.025, 0.028),
          fullerMat
        );
        crossGuard.position.set(0.21, -0.13, -0.57);

        const bladeMain = new THREE.Mesh(
          new THREE.BoxGeometry(0.012, 0.048, 0.28),
          bladeSteelMat
        );
        bladeMain.position.set(0.21, -0.105, -0.71);
        bladeMain.rotation.x = -0.12;

        const bladeTip = new THREE.Mesh(
          new THREE.ConeGeometry(0.026, 0.11, 4),
          bladeSteelMat
        );
        bladeTip.rotation.x = -Math.PI / 2 - 0.12;
        bladeTip.scale.set(0.35, 1, 1);
        bladeTip.position.set(0.21, -0.09, -0.89);

        const bloodGroove = new THREE.Mesh(
          new THREE.BoxGeometry(0.015, 0.012, 0.2),
          fullerMat
        );
        bloodGroove.position.set(0.21, -0.1, -0.69);
        bloodGroove.rotation.x = -0.12;

        weaponGroup.add(grip, pommel, crossGuard, bladeMain, bladeTip, bloodGroove);
      } else if (spec.id === 'deagle' || spec.id === 'usp') {
        // ====================================================================
        // MODELO 3D REALISTA DE PISTOLA (DESERT EAGLE .50 CROMADA / USP .45)
        // Sem coronha de rifle e sem pente externo longo: empunhadura real!
        // ====================================================================
        const isDeagle = spec.id === 'deagle';

        // Braço e mão esquerda apoiando o punho da pistola (empunhadura dupla de pistola)
        const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.42), sleeveMat);
        leftArm.position.set(0.07, -0.26, -0.34);
        leftArm.rotation.y = -0.38;

        const leftGlove = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.082, 0.11), gloveMat);
        leftGlove.position.set(0.185, -0.225, -0.49);

        const leftFingers = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.068, 0.065), skinMat);
        leftFingers.position.set(0.195, -0.215, -0.535);

        // Material do Ferrolho (Cromado Prateado Espelhado na Desert Eagle .50)
        const slideMat = new THREE.MeshStandardMaterial({
          color: isDeagle ? 0xe2e8f0 : 0x2b3036,
          roughness: isDeagle ? 0.15 : 0.38,
          metalness: isDeagle ? 0.94 : 0.72,
        });

        // Material do Chassi/Punho Anatômico Preto
        const gripMat = new THREE.MeshStandardMaterial({
          color: 0x141417,
          roughness: 0.78,
          metalness: 0.18,
        });

        const darkMetalMat = new THREE.MeshStandardMaterial({
          color: 0x090b0e,
          roughness: 0.4,
          metalness: 0.85,
        });

        const slideLen = isDeagle ? 0.34 : 0.25;
        const slideHeight = isDeagle ? 0.068 : 0.052;
        const slideWidth = isDeagle ? 0.054 : 0.044;

        // Punho Anatômico Inclinado (onde o pente fica embutido)
        const pistolGrip = new THREE.Mesh(
          new THREE.BoxGeometry(slideWidth * 0.86, 0.165, 0.078),
          gripMat
        );
        pistolGrip.position.set(0.21, -0.215, -0.47);
        pistolGrip.rotation.x = -0.28;

        // Placas laterais texturizadas do punho
        const gripPanel = new THREE.Mesh(
          new THREE.BoxGeometry(slideWidth * 0.92, 0.125, 0.056),
          darkMetalMat
        );
        gripPanel.position.set(0.21, -0.215, -0.47);
        gripPanel.rotation.x = -0.28;

        // Base do carregador embutido no fundo do punho (Floorplate)
        const magBase = new THREE.Mesh(
          new THREE.BoxGeometry(slideWidth * 0.9, 0.018, 0.086),
          slideMat
        );
        magBase.position.set(0.21, -0.295, -0.448);
        magBase.rotation.x = -0.28;

        // Chassi inferior (Frame) e Trilho Tático
        const lowerFrame = new THREE.Mesh(
          new THREE.BoxGeometry(slideWidth * 0.92, 0.032, slideLen * 0.88),
          isDeagle ? slideMat : gripMat
        );
        lowerFrame.position.set(0.21, -0.138, -0.46 - slideLen * 0.38);

        // Guarda-Mato (Trigger Guard) e Gatilho
        const triggerGuardBottom = new THREE.Mesh(
          new THREE.BoxGeometry(0.018, 0.01, 0.068),
          gripMat
        );
        triggerGuardBottom.position.set(0.21, -0.178, -0.535);

        const triggerGuardFront = new THREE.Mesh(
          new THREE.BoxGeometry(0.018, 0.036, 0.012),
          gripMat
        );
        triggerGuardFront.position.set(0.21, -0.16, -0.565);

        const trigger = new THREE.Mesh(
          new THREE.BoxGeometry(0.012, 0.028, 0.014),
          darkMetalMat
        );
        trigger.position.set(0.21, -0.156, -0.53);
        trigger.rotation.x = 0.35;

        // Ferrolho Principal (Slide)
        const slideBody = new THREE.Mesh(
          new THREE.BoxGeometry(slideWidth, slideHeight, slideLen),
          slideMat
        );
        slideBody.position.set(0.21, -0.1, -0.45 - slideLen * 0.42);

        // Topo Chanfrado Triangular Característico da Desert Eagle .50
        const slideTopRidge = new THREE.Mesh(
          new THREE.BoxGeometry(slideWidth * 0.68, 0.018, slideLen * 0.96),
          slideMat
        );
        slideTopRidge.position.set(0.21, -0.1 + slideHeight * 0.52, -0.45 - slideLen * 0.42);

        // Janela de Ejeção Lateral Escura
        const ejectionPort = new THREE.Mesh(
          new THREE.BoxGeometry(slideWidth + 0.003, slideHeight * 0.48, 0.068),
          darkMetalMat
        );
        ejectionPort.position.set(0.21, -0.092, -0.53);

        // Boca do Cano Calibre .50 AE (Furo Escuro Realista na Frente)
        const muzzleBore = new THREE.Mesh(
          new THREE.CylinderGeometry(isDeagle ? 0.016 : 0.011, isDeagle ? 0.016 : 0.011, 0.02, 12),
          darkMetalMat
        );
        muzzleBore.rotation.x = Math.PI / 2;
        muzzleBore.position.set(0.21, -0.098, -0.45 - slideLen * 0.92);

        // Cão Traseiro (Hammer)
        const hammer = new THREE.Mesh(
          new THREE.BoxGeometry(0.014, 0.032, 0.024),
          darkMetalMat
        );
        hammer.position.set(0.21, -0.082, -0.435);
        hammer.rotation.x = -0.45;

        // Alça de Mira Traseira e Massa de Mira Frontal
        const rearSight = new THREE.Mesh(
          new THREE.BoxGeometry(slideWidth * 0.85, 0.018, 0.018),
          darkMetalMat
        );
        rearSight.position.set(0.21, -0.1 + slideHeight * 0.68, -0.46);

        const frontSight = new THREE.Mesh(
          new THREE.BoxGeometry(0.012, 0.022, 0.018),
          darkMetalMat
        );
        frontSight.position.set(0.21, -0.1 + slideHeight * 0.68, -0.45 - slideLen * 0.86);

        weaponGroup.add(
          leftArm,
          leftGlove,
          leftFingers,
          pistolGrip,
          gripPanel,
          magBase,
          lowerFrame,
          triggerGuardBottom,
          triggerGuardFront,
          trigger,
          slideBody,
          slideTopRidge,
          ejectionPort,
          muzzleBore,
          hammer,
          rearSight,
          frontSight
        );

        muzzleFlashMesh = new THREE.Mesh(
          new THREE.ConeGeometry(isDeagle ? 0.11 : 0.075, isDeagle ? 0.26 : 0.18, 6),
          new THREE.MeshBasicMaterial({ color: 0xfde047 })
        );
        muzzleFlashMesh.rotation.x = -Math.PI / 2;
        muzzleFlashMesh.position.set(0.21, -0.098, -0.48 - slideLen);
        muzzleFlashMesh.visible = false;
        weaponGroup.add(muzzleFlashMesh);
      } else if (spec.id === 'm3') {
        // ====================================================================
        // MODELO 3D DA SHOTGUN LEONE 12G SUPER (M3 PUMP-ACTION)
        // Cano Calibre 12 + Tubo Carregador Inferior + Telha Pump Frisada
        // ====================================================================
        const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.095, 0.5), sleeveMat);
        leftArm.position.set(0.04, -0.26, -0.48);
        leftArm.rotation.y = -0.32;

        const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.084, 0.082, 0.13), skinMat);
        leftHand.position.set(0.18, -0.195, -0.78);

        const metalMat = new THREE.MeshStandardMaterial({
          color: 0x27272a,
          roughness: 0.3,
          metalness: 0.85,
        });
        const pumpWoodMat = new THREE.MeshStandardMaterial({
          color: 0x5c3a21,
          roughness: 0.68,
          metalness: 0.15,
        });
        const darkBoreMat = new THREE.MeshStandardMaterial({
          color: 0x090b0e,
          roughness: 0.5,
        });

        // Caixa da Culatra (Receiver da Escopeta)
        const receiver = new THREE.Mesh(
          new THREE.BoxGeometry(0.074, 0.105, 0.38),
          metalMat
        );
        receiver.position.set(0.21, -0.155, -0.48);

        // Janela de ejeção de cartuchos 12G
        const shellPort = new THREE.Mesh(
          new THREE.BoxGeometry(0.077, 0.036, 0.095),
          darkBoreMat
        );
        shellPort.position.set(0.21, -0.145, -0.52);

        // Coronha Tática Traseira
        const stock = new THREE.Mesh(
          new THREE.BoxGeometry(0.062, 0.115, 0.28),
          pumpWoodMat
        );
        stock.position.set(0.21, -0.19, -0.22);
        stock.rotation.x = 0.12;

        // Cano Principal Calibre 12 (Superior)
        const barrel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.019, 0.021, 0.68, 14),
          metalMat
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0.21, -0.122, -0.96);

        // Tubo Carregador de Cartuchos (Inferior)
        const tubeMag = new THREE.Mesh(
          new THREE.CylinderGeometry(0.017, 0.017, 0.62, 12),
          metalMat
        );
        tubeMag.rotation.x = Math.PI / 2;
        tubeMag.position.set(0.21, -0.162, -0.93);

        // Telha Corrediça Pump-Action Frisada (Segurada pela mão esquerda)
        const pumpForend = new THREE.Mesh(
          new THREE.CylinderGeometry(0.032, 0.032, 0.26, 14),
          pumpWoodMat
        );
        pumpForend.rotation.x = Math.PI / 2;
        pumpForend.position.set(0.21, -0.165, -0.82);

        // Massa de mira frontal da Shotgun
        const frontBead = new THREE.Mesh(
          new THREE.SphereGeometry(0.008, 8, 8),
          new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
        );
        frontBead.position.set(0.21, -0.098, -1.27);

        weaponGroup.add(
          leftArm,
          leftHand,
          receiver,
          shellPort,
          stock,
          barrel,
          tubeMag,
          pumpForend,
          frontBead
        );

        muzzleFlashMesh = new THREE.Mesh(
          new THREE.ConeGeometry(0.14, 0.32, 7),
          new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
        );
        muzzleFlashMesh.rotation.x = -Math.PI / 2;
        muzzleFlashMesh.position.set(0.21, -0.122, -1.36);
        muzzleFlashMesh.visible = false;
        weaponGroup.add(muzzleFlashMesh);
      } else {
        const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.095, 0.48), sleeveMat);
        leftArm.position.set(0.05, -0.27, -0.45);
        leftArm.rotation.y = -0.34;

        const len = spec.lengthScale;
        const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.12), skinMat);
        leftHand.position.set(0.18, -0.21, -0.68 * len);

        const bodyMat = new THREE.MeshStandardMaterial({
          color: spec.bodyColor,
          roughness: 0.35,
          metalness: 0.78,
        });
        const accentMat = new THREE.MeshStandardMaterial({
          color: spec.accentColor,
          roughness: 0.68,
          metalness: 0.25,
        });

        const receiver = new THREE.Mesh(
          new THREE.BoxGeometry(0.072, 0.11, 0.44 * len),
          bodyMat
        );
        receiver.position.set(0.21, -0.165, -0.52);

        const handguard = new THREE.Mesh(
          new THREE.BoxGeometry(0.064, 0.085, 0.28 * len),
          accentMat
        );
        handguard.position.set(0.21, -0.165, -0.52 - 0.32 * len);

        const stock = new THREE.Mesh(
          new THREE.BoxGeometry(0.06, 0.105, 0.24 * len),
          accentMat
        );
        stock.position.set(0.21, -0.19, -0.24);

        const barrel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.017, 0.48 * len, 12),
          bodyMat
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0.21, -0.145, -0.52 - 0.48 * len);

        const frontSight = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.045, 0.02), bodyMat);
        frontSight.position.set(0.21, -0.115, -0.52 - 0.66 * len);

        const magazine = new THREE.Mesh(
          new THREE.BoxGeometry(0.046, 0.21, 0.085),
          accentMat
        );
        magazine.position.set(0.21, -0.285, -0.58);
        magazine.rotation.x = 0.24;

        weaponGroup.add(
          leftArm,
          leftHand,
          receiver,
          handguard,
          stock,
          barrel,
          frontSight,
          magazine
        );

        if (spec.hasScope) {
          const scopeMount = new THREE.Mesh(
            new THREE.BoxGeometry(0.032, 0.04, 0.16),
            accentMat
          );
          scopeMount.position.set(0.21, -0.095, -0.52);
          const scopeTube = new THREE.Mesh(
            new THREE.CylinderGeometry(0.026, 0.028, 0.36, 14),
            bodyMat
          );
          scopeTube.rotation.x = Math.PI / 2;
          scopeTube.position.set(0.21, -0.075, -0.54);
          weaponGroup.add(scopeMount, scopeTube);
        }

        muzzleFlashMesh = new THREE.Mesh(
          new THREE.ConeGeometry(0.095, 0.24, 6),
          new THREE.MeshBasicMaterial({ color: 0xfde047 })
        );
        muzzleFlashMesh.rotation.x = -Math.PI / 2;
        muzzleFlashMesh.position.set(0.21, -0.145, -0.58 - 0.72 * len);
        muzzleFlashMesh.visible = false;
        weaponGroup.add(muzzleFlashMesh);
      }

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

      // Reabastece pentes no início do round
      Object.keys(WEAPON_CATALOG).forEach((k) => {
        player.ammoMap[k] = {
          clip: WEAPON_CATALOG[k].clipSize,
          reserve: WEAPON_CATALOG[k].reserveMax,
        };
      });

      // Posiciona o jogador na base do seu time (CT = Sul +22, TR = Norte -22)
      if (player.team === 'CT') {
        player.pos.set(0, 1.72, 23);
        player.yaw = 0;
      } else {
        player.pos.set(0, 1.72, -23);
        player.yaw = Math.PI;
      }
      player.pitch = 0;

      const ctSpawnCoords: [number, number][] = [
        [-10, 23],
        [-5, 23],
        [5, 23],
        [10, 23],
        [0, 20],
      ];
      const trSpawnCoords: [number, number][] = [
        [-10, -23],
        [-5, -23],
        [5, -23],
        [10, -23],
        [0, -20],
      ];

      const spawnSquad = (
        teamSide: TeamSide,
        botCount: number,
        coords: [number, number][],
        names: string[]
      ) => {
        const isCT = teamSide === 'CT';
        const isAllyToPlayer = teamSide === player.team;

        for (let i = 0; i < botCount; i++) {
          const group = new THREE.Group();

          const bodyMat = new THREE.MeshStandardMaterial({
            color: isCT ? 0x1d4ed8 : 0xb91c1c,
            roughness: 0.58,
            metalness: 0.15,
          });
          const headMat = new THREE.MeshStandardMaterial({
            color: isCT ? 0x3b82f6 : 0xef4444,
            roughness: 0.42,
            metalness: 0.1,
          });
          const darkMat = new THREE.MeshStandardMaterial({
            color: 0x1f2421,
            roughness: 0.8,
          });

          const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.65, 0.24), darkMat);
          leftLeg.position.set(-0.15, 0.325, 0);
          const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.65, 0.24), darkMat);
          rightLeg.position.set(0.15, 0.325, 0);

          const torsoMesh = new THREE.Mesh(
            new THREE.CylinderGeometry(0.38, 0.42, 0.92, 12),
            bodyMat
          );
          torsoMesh.position.set(0, 1.05, 0);
          torsoMesh.castShadow = !isSoftwareGl;

          const chestRig = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.48, 0.52), darkMat);
          chestRig.position.set(0, 1.12, 0);

          const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.44, 0.44), headMat);
          headMesh.position.set(0, 1.76, 0);
          headMesh.castShadow = !isSoftwareGl;

          const visor = new THREE.Mesh(
            new THREE.BoxGeometry(0.46, 0.12, 0.46),
            new THREE.MeshBasicMaterial({ color: 0x111111 })
          );
          visor.position.set(0, 1.8, 0.02);

          const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.18), bodyMat);
          leftArm.position.set(-0.48, 1.12, 0.15);
          leftArm.rotation.x = -0.55;

          const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.62, 0.18), bodyMat);
          rightArm.position.set(0.48, 1.12, 0.22);
          rightArm.rotation.x = -0.75;

          const botGun = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.14, 0.75), darkMat);
          botGun.position.set(0.38, 1.08, 0.52);

          const muzzleFlash = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 6, 6),
            new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
          );
          muzzleFlash.position.set(0.38, 1.08, 0.95);
          muzzleFlash.visible = false;

          group.add(
            leftLeg,
            rightLeg,
            torsoMesh,
            chestRig,
            headMesh,
            visor,
            leftArm,
            rightArm,
            botGun,
            muzzleFlash
          );

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
            sp[0] + (Math.random() - 0.5) * 1.6,
            0,
            sp[1] + (Math.random() - 0.5) * 1.6
          );
          scene.add(group);

          const initialWpIdx = Math.floor(Math.random() * ARENA_WAYPOINTS.length);
          const wp = ARENA_WAYPOINTS[initialWpIdx];

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
            muzzleFlash,
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
            patrolGoal: new THREE.Vector3(wp[0], 0, wp[1]),
          };

          headMesh.userData = { bot: botEntity, isHead: true };
          torsoMesh.userData = { bot: botEntity, isHead: false };
          chestRig.userData = { bot: botEntity, isHead: false };

          bots.push(botEntity);
        }
      };

      // Cria 4 bots na equipe do jogador (5 no total com o jogador) e 5 bots na equipe adversária
      spawnSquad('CT', player.team === 'CT' ? 4 : 5, ctSpawnCoords, CT_BOT_NAMES);
      spawnSquad('TR', player.team === 'TR' ? 4 : 5, trSpawnCoords, TR_BOT_NAMES);

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
        winReason = 'ESQUADRÃO CONTRA-TERRORISTA ELIMINADO';
      } else if (tr === 0) {
        winningTeam = 'CT';
        winReason = 'ESQUADRÃO TERRORISTA ELIMINADO';
      } else if (timeExpired) {
        // Se o relógio de 5 minutos zerar: vence quem tiver mais vivos (ou CT no empate por defesa)
        if (ct >= tr) {
          winningTeam = 'CT';
          winReason = 'TEMPO ESGOTADO (00:00) — DEFESA CT VENCEU!';
        } else {
          winningTeam = 'TR';
          winReason = 'TEMPO ESGOTADO (00:00) — MAIORIA TR VENCEU!';
        }
      }

      if (winningTeam) {
        player.isRoundEnding = true;
        if (winningTeam === 'CT') player.ctScore++;
        else player.trScore++;

        const playerWon = winningTeam === player.team;
        const roundBonus = playerWon ? 2400 : 1400;
        player.money = Math.min(16000, player.money + roundBonus);

        audioRef.current.playBuyOrRoundChime(playerWon);
        showBanner(
          `EQUIPE ${winningTeam} VENCEU O ROUND ${player.round}! (${winReason}) +$${roundBonus}`,
          3.0
        );

        setTimeout(() => {
          player.round++;
          startNew5v5Round();
          showBanner(`ROUND ${player.round} INICIADO — 5v5 (05:00)`, 2.2);
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
      player.pos.set(ally.group.position.x, player.eyeHeight, ally.group.position.z);
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
                showBanner(`CUIDADO! ${hitBot.name} É SEU ALIADO (${player.team})!`, 1.2);
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
                `Você (${player.team})`,
                player.team,
                hitBot.name,
                hitBot.team,
                killLabel,
                isHeadshot
              );

              if (spec.isMelee) {
                showBanner(`ABATE NA FACA! +$${bonus}`, 1.6);
              } else if (spec.id === 'm3') {
                showBanner(`ABATE DE SHOTGUN 12G! +$${bonus}`, 1.6);
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

    /* ==========================================================================
       1. ARQUITETURA init() — Inicialização da Arena "Dust II"
       ========================================================================== */
    const init = () => {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xd9b98b);
      scene.fog = new THREE.FogExp2(0xd9b98b, 0.014);

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

      const hemiLight = new THREE.HemisphereLight(0xfff5db, 0x9c7a54, 0.85);
      scene.add(hemiLight);

      const sunLight = new THREE.DirectionalLight(0xfff1d0, 1.45);
      sunLight.position.set(28, 46, 24);
      sunLight.castShadow = !isSoftwareGl;
      sunLight.shadow.mapSize.set(1024, 1024);
      sunLight.shadow.camera.left = -38;
      sunLight.shadow.camera.right = 38;
      sunLight.shadow.camera.top = 38;
      sunLight.shadow.camera.bottom = -38;
      sunLight.shadow.bias = -0.0005;
      scene.add(sunLight);

      const maxAniso = renderer.capabilities.getMaxAnisotropy();

      const sandTex = createProceduralTexture('sand', maxAniso);
      sandTex.repeat.set(22, 22);
      const floorMat = new THREE.MeshStandardMaterial({
        color: 0xe3c18f,
        map: sandTex,
        roughness: 0.92,
        metalness: 0.02,
      });
      const floorMesh = new THREE.Mesh(new THREE.PlaneGeometry(72, 72), floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.receiveShadow = !isSoftwareGl;
      scene.add(floorMesh);
      shootableMeshes.push(floorMesh);

      const wallTex = createProceduralTexture('sandstone', maxAniso);
      wallTex.repeat.set(8, 2);
      const wallMat = new THREE.MeshStandardMaterial({
        map: wallTex,
        roughness: 0.86,
      });

      const brickTex = createProceduralTexture('brick', maxAniso);
      brickTex.repeat.set(4, 2);
      const brickMat = new THREE.MeshStandardMaterial({
        map: brickTex,
        roughness: 0.82,
      });

      const crateTex = createProceduralTexture('crate', maxAniso);
      const crateMat = new THREE.MeshStandardMaterial({
        map: crateTex,
        roughness: 0.76,
      });
      const trimMat = new THREE.MeshStandardMaterial({
        color: 0x3b2818,
        roughness: 0.6,
        metalness: 0.3,
      });

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
      cratePlacements.forEach(([cx, cz, sz, sy]) =>
        addCompositeCrate(cx, cz, sz, crateMat, trimMat, sy)
      );

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

          const nextX = player.pos.x + _moveDir.x * moveSpeed * dt;
          const nextZ = player.pos.z + _moveDir.z * moveSpeed * dt;

          if (!collidesWithWorld(nextX, player.pos.z, player.radius, player.pos.y)) {
            player.pos.x = nextX;
          }
          if (!collidesWithWorld(player.pos.x, nextZ, player.radius, player.pos.y)) {
            player.pos.z = nextZ;
          }

          if (keys['Space'] && player.onGround) {
            player.vel.y = 7.9;
            player.onGround = false;
          }
        }
        player.vel.y -= 20.0 * dt;
        player.pos.y += player.vel.y * dt;

        if (player.pos.y <= player.eyeHeight) {
          player.pos.y = player.eyeHeight;
          player.vel.y = 0;
          player.onGround = true;
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

        if (weaponGroup) {
          const reloadDip = player.isReloading
            ? Math.sin(player.reloadTimer * Math.PI * 1.5) * -0.18 - 0.12
            : 0;
          weaponGroup.position.x = Math.cos(player.bobPhase * 0.5) * 0.014;
          weaponGroup.position.y =
            Math.abs(Math.sin(player.bobPhase)) * 0.018 +
            reloadDip +
            player.equipAnimOffset;
          weaponGroup.position.z =
            player.recoilOffset * 1.45 - player.knifeSwingOffset * 0.28;
          weaponGroup.rotation.x =
            player.recoilOffset * 1.9 -
            player.knifeSwingOffset * 0.75 +
            (player.isReloading ? -0.35 : 0);
          weaponGroup.rotation.y = -player.knifeSwingOffset * 0.45;
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

      // Auxiliar para verificar se o Bot tem Linha de Visão (LOS) limpa até um ponto
      const checkBotLineOfSight = (
        botPos: THREE.Vector3,
        targetEyePos: THREE.Vector3
      ): boolean => {
        _eyeOrigin.set(botPos.x, 1.52, botPos.z);
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
            const isCT = bot.team === 'CT';
            bot.bodyMat.color.setHex(isCT ? 0x1d4ed8 : 0xb91c1c);
            bot.headMat.color.setHex(isCT ? 0x3b82f6 : 0xef4444);
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
              1.48,
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
          // Escolhe um waypoint que aproxime o bot da posição do inimigo mais próximo
          let bestWpIdx = (bot.waypointIndex + 1) % ARENA_WAYPOINTS.length;
          let bestScore = Infinity;
          for (let w = 0; w < ARENA_WAYPOINTS.length; w++) {
            const wp = ARENA_WAYPOINTS[w];
            const dFromBot = Math.hypot(
              wp[0] - bot.group.position.x,
              wp[1] - bot.group.position.z
            );
            if (dFromBot < 2.2) continue;
            const dToEnemy = Math.hypot(
              wp[0] - combatTargetPos.x,
              wp[1] - combatTargetPos.z
            );
            const score = dToEnemy * 0.75 + dFromBot * 0.45 + Math.random() * 4.5;
            if (score < bestScore) {
              bestScore = score;
              bestWpIdx = w;
            }
          }
          bot.waypointIndex = bestWpIdx;
          bot.patrolGoal.set(
            ARENA_WAYPOINTS[bestWpIdx][0] + (Math.random() - 0.5) * 2.2,
            0,
            ARENA_WAYPOINTS[bestWpIdx][1] + (Math.random() - 0.5) * 2.2
          );
          bot.waypointTimer = 3.2 + Math.random() * 2.4;
        }

        // Se tem LOS, olha e se move em relação ao inimigo visível; se não tem LOS, navega pelo Waypoint
        const moveGoalPos = hasLOS ? combatTargetPos : bot.patrolGoal;
        const lookGoalPos = hasLOS ? combatTargetPos : bot.patrolGoal;

        bot.group.lookAt(lookGoalPos.x, 0, lookGoalPos.z);

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

          if (
            !collidesWithWorld(candidateX, candidateZ, 0.56) &&
            !collidesWithWorld(probeX, probeZ, 0.56)
          ) {
            bot.group.position.x = candidateX;
            bot.group.position.z = candidateZ;
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
          if (!collidesWithWorld(tryX, bot.group.position.z, 0.55)) {
            bot.group.position.x = tryX;
            movedBot = true;
          } else if (!collidesWithWorld(bot.group.position.x, tryZ, 0.55)) {
            bot.group.position.z = tryZ;
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
                      `Você (${player.team})`,
                      player.team,
                      bot.team === 'CT' ? 'M4A1' : 'AK-47',
                      false
                    );

                    const livingAlly = getFirstLivingAllyBot();
                    if (livingAlly) {
                      showBanner(
                        `VOCÊ FOI ABATIDO! APERTE [E] PARA ASSUMIR O BOT ALIADO (${livingAlly.name})!`,
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
                // Combate Tático Bot vs Bot com Tracer 3D
                const botTargetCenter = new THREE.Vector3(
                  bestEnemyBot.group.position.x + (Math.random() - 0.5) * 0.45,
                  1.25 + (Math.random() - 0.5) * 0.35,
                  bestEnemyBot.group.position.z + (Math.random() - 0.5) * 0.45
                );
                spawnBulletTracer(muzzleWorld, botTargetCenter, tracerColor);

                if (Math.random() < 0.62) {
                  const botDmg = 14 + Math.floor(Math.random() * 10);
                  const isBotHS = Math.random() < 0.2;
                  bestEnemyBot.hp -= isBotHS ? botDmg * 2 : botDmg;
                  bestEnemyBot.hitFlashTimer = 0.11;
                  bestEnemyBot.bodyMat.color.setHex(0xffffff);
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
                      bot.team === 'CT' ? 'M4A1' : 'AK-47',
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
        {/* Topo Central: Placar Compacto em Vidro Fosco (Sem botões extras) */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-950/55 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-2 shadow-xl">
          {/* Lado CT (Azul) */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-medium text-sky-300/80">
              {hud.ctAlive} vivos
            </span>
            <span className="text-xs font-bold tracking-wider text-sky-400">CT</span>
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

          {/* Lado TR (Vermelho) */}
          <div className="flex items-center gap-2.5">
            <span className="bg-rose-500/20 border border-rose-400/30 rounded-lg px-2.5 py-0.5 text-sm font-black text-white">
              {hud.trScore}
            </span>
            <span className="text-xs font-bold tracking-wider text-rose-400">TR</span>
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
                <div className="mb-7">
                  <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-1">
                    Arena Tática 5v5 · Dust II
                  </div>
                  <h1 className="text-4xl font-black tracking-tight text-white">
                    COUNTER-STRIKE
                  </h1>
                  <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
                    Combate competitivo 5v5 em primeira pessoa com 10s de preparo, loja de armas e
                    troca rápida de equipamento.
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
                          Esquadrão {hud.playerTeam === 'CT' ? 'Contra-Terrorista' : 'Terrorista'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => setMenuTab('team')}
                    className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>Escolher Time</span>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        hud.playerTeam === 'CT' ? 'text-sky-400' : 'text-rose-400'
                      }`}
                    >
                      {hud.playerTeam === 'CT' ? 'CT (Azul)' : 'TR (Vermelho)'}
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
                    <span className="text-xs text-zinc-400">8 Armas</span>
                  </button>

                  <button
                    onClick={() => setMenuTab('controls')}
                    className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-100 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Keyboard className="w-4 h-4 text-amber-400" />
                      <span>Controles</span>
                    </div>
                    <span className="text-xs text-zinc-400">WASD, B, Q, E</span>
                  </button>
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
                    <h2 className="text-lg font-bold text-white">Escolha seu Time</h2>
                  </div>
                  <span className="text-xs text-zinc-400">5 vs 5</span>
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
                    <div className="text-xs font-semibold text-sky-400 mb-1">Defesa Tática</div>
                    <div className="text-lg font-bold text-white mb-2">
                      Contra-Terroristas
                    </div>
                    <p className="text-xs text-zinc-300 mb-4">
                      Unidade de resposta rápida com M4A1, USP .45 e defesa coordenada.
                    </p>
                    <button className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 font-bold text-xs cursor-pointer">
                      Entrar como CT
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
                    <div className="text-xs font-semibold text-rose-400 mb-1">Força de Assalto</div>
                    <div className="text-lg font-bold text-white mb-2">Terroristas</div>
                    <p className="text-xs text-zinc-300 mb-4">
                      Unidade de impacto equipada com AK-47, Desert Eagle e avanço rápido.
                    </p>
                    <button className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs cursor-pointer">
                      Entrar como TR
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ABA ARSENAL DE ARMAS */}
            {menuTab === 'arsenal' && (
              <div className="max-w-2xl w-full bg-zinc-950/80 backdrop-blur-xl border border-white/15 rounded-3xl p-7 shadow-2xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setMenuTab('main')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-300 cursor-pointer"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-lg font-bold text-white">Arsenal Disponível</h2>
                  </div>
                  <span className="text-xs text-zinc-400">Tecla [B] durante a partida</span>
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 pr-1">
                  {Object.values(WEAPON_CATALOG).map((spec) => (
                    <div
                      key={spec.id}
                      className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-[11px] text-zinc-400">{spec.category}</div>
                          <div className="text-sm font-bold text-white">{spec.name}</div>
                        </div>
                        <span className="text-sm font-bold text-amber-400">
                          {spec.isMelee ? 'Grátis' : `$${spec.price}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-zinc-300 border-t border-white/10 pt-2">
                        <span>
                          Dano:{' '}
                          <strong className="text-white">
                            {spec.pellets
                              ? `${spec.damage}x${spec.pellets}`
                              : spec.damage}
                          </strong>
                        </span>
                        <span>·</span>
                        <span>
                          Pente:{' '}
                          <strong className="text-white">
                            {spec.isMelee ? '∞' : `${spec.clipSize}/${spec.reserveMax}`}
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
                    <div><strong className="text-amber-400">B</strong> · Abrir Loja</div>
                    <div><strong className="text-amber-400">Q / 1, 2, 3</strong> · Trocar Arma</div>
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
            <span>Dust II 5v5</span>
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
              Partida 5v5
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Jogo Pausado</h2>
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-1 text-xs text-zinc-300 mb-6">
              <span className="font-bold text-sky-400">CT {hud.ctScore}</span>
              <span>·</span>
              <span className="font-mono text-white">{formatRoundClock(hud.roundTimeSec)}</span>
              <span>·</span>
              <span className="font-bold text-rose-400">{hud.trScore} TR</span>
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

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => gameRef.current.selectTeamAndStart('CT')}
                  className="py-2 px-3 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Time CT (Azul)
                </button>
                <button
                  onClick={() => gameRef.current.selectTeamAndStart('TR')}
                  className="py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-rose-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Time TR (Vermelho)
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
          LOJA DE ARMAS TRANSLÚCIDA (TECLA B)
          ======================================================================== */}
      {isBuyOpen && !isCodeModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="max-w-2xl w-full bg-zinc-950/85 backdrop-blur-xl border border-white/15 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">Loja de Equipamentos</h2>
                <p className="text-xs text-zinc-400">
                  Selecione a arma para equipar no Slot 2 ou Slot 3
                </p>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-zinc-400">Saldo</div>
                <div className="text-xl font-black text-amber-400">${hud.money}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
              {[
                { key: 'usp', num: '0', spec: WEAPON_CATALOG.usp },
                { key: 'deagle', num: '1', spec: WEAPON_CATALOG.deagle },
                { key: 'm3', num: '2', spec: WEAPON_CATALOG.m3 },
                { key: 'mp5', num: '3', spec: WEAPON_CATALOG.mp5 },
                { key: 'ak47', num: '4', spec: WEAPON_CATALOG.ak47 },
                { key: 'm4a1', num: '5', spec: WEAPON_CATALOG.m4a1 },
                { key: 'awp', num: '6', spec: WEAPON_CATALOG.awp },
              ].map(({ key, num, spec }) => {
                const canAfford = hud.money >= spec.price;
                const inSlot1 = hud.loadout[1] === spec.id;
                const inSlot2 = hud.loadout[2] === spec.id;
                return (
                  <div
                    key={key}
                    className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-colors ${
                      inSlot1 || inSlot2
                        ? 'bg-amber-400/10 border-amber-400/50'
                        : canAfford
                        ? 'bg-white/5 border-white/10'
                        : 'bg-white/[0.02] border-white/5 opacity-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2.5">
                      <div>
                        <div className="text-[11px] text-zinc-400">
                          [{num}] {spec.category}
                        </div>
                        <div className="text-sm font-bold text-white">{spec.shortName}</div>
                      </div>
                      <span className="text-sm font-bold text-amber-400">${spec.price}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => gameRef.current.buyItem(key, 1)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          inSlot1
                            ? 'bg-amber-400 text-zinc-950 border-amber-400'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10'
                        }`}
                      >
                        Slot 2
                      </button>
                      <button
                        onClick={() => gameRef.current.buyItem(key, 2)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          inSlot2
                            ? 'bg-amber-400 text-zinc-950 border-amber-400'
                            : 'bg-white/5 hover:bg-white/10 text-zinc-200 border-white/10'
                        }`}
                      >
                        Slot 3
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={() => gameRef.current.buyItem('kevlar_kit')}
                className="p-3.5 rounded-2xl border bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-400/30 text-left flex items-center justify-between transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-[11px] text-emerald-300">[7] Suprimento</div>
                  <div className="text-sm font-bold text-white">Colete 100 + Kit (+50 HP)</div>
                </div>
                <div className="text-sm font-bold text-amber-400">$650</div>
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => gameRef.current.requestLock()}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Voltar ao Jogo [B]
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
