/**
 * Gerador do arquivo único index.html autônomo (CS 1.6 Tactical Arena - Dust II)
 * Inclui:
 * - Modo Competitivo 5v5 (Escolha entre CT Azul e Terrorista Vermelho: Jogador + 4 Bots Aliados vs 5 Bots Inimigos)
 * - Bot Takeover na Tecla [E] (Assumir o controle de um bot aliado vivo se você morrer no round)
 * - Cronômetro de 5 Minutos (05:00) por round
 * - Faca Tática inicial na mão + Troca de arma no inventário na Tecla [Q] (1 arma na mão por vez)
 * - Mira Telescópica da AWP (Clique Direito 2x/4x) e Música Tática via Web Audio API
 */

export type WeaponShopTab = 'pistols' | 'shotguns' | 'rifles' | 'tactical';
export type WeaponFactionTag = 'PM' | 'BANDIDOS' | 'AMBOS';

export interface WeaponSpec {
  id: string;
  name: string;
  shortName: string;
  category: string;
  shopTab?: WeaponShopTab;
  factionTag?: WeaponFactionTag;
  description?: string;
  price: number;
  damage: number;
  secondaryDamage?: number;
  headshotMult: number;
  fireRateMs: number;
  clipSize: number;
  reserveMax: number;
  reloadTimeMs: number;
  recoilKick: number;
  spread: number;
  auto: boolean;
  killReward: number;
  bodyColor: number;
  accentColor: number;
  lengthScale: number;
  hasScope?: boolean;
  isMelee?: boolean;
  maxRange?: number;
  pellets?: number;
  glbModel?: string;
  accessories?: string[];
}

export const WEAPON_CATALOG: Record<string, WeaponSpec> = {
  knife: {
    id: 'knife',
    name: 'Faca Tática Combat Knife (Baioneta M9)',
    shortName: 'Faca / Baioneta',
    category: 'Corpo a Corpo (Inicial)',
    factionTag: 'AMBOS',
    description: 'Lâmina tática militar M9 em aço temperado com sulco central e estocada letal.',
    price: 0,
    damage: 45,
    secondaryDamage: 88,
    headshotMult: 2.4,
    fireRateMs: 360,
    clipSize: 1,
    reserveMax: 1,
    reloadTimeMs: 0,
    recoilKick: 0.08,
    spread: 0,
    auto: true,
    killReward: 1500,
    bodyColor: 0xd1d5db,
    accentColor: 0x1f2937,
    lengthScale: 0.65,
    isMelee: true,
    maxRange: 3.4,
    glbModel: 'Bayonet.glb',
  },
  // ==========================================================================
  // PISTOLAS (6 MODELOS: USP, GLOCK 17, GLOCK 19, TAURUS PT92, TAURUS TH9, DEAGLE)
  // ==========================================================================
  usp: {
    id: 'usp',
    name: 'USP .45 Tactical',
    shortName: 'USP .45',
    category: 'Pistola Tática (.45 ACP)',
    shopTab: 'pistols',
    factionTag: 'PM',
    description: 'Pistola semiautomática precisa de chassi em polímero e ferrolho grafite.',
    price: 300,
    damage: 28,
    headshotMult: 2.5,
    fireRateMs: 185,
    clipSize: 12,
    reserveMax: 48,
    reloadTimeMs: 1400,
    recoilKick: 0.052,
    spread: 0.008,
    auto: false,
    killReward: 300,
    bodyColor: 0x2b3036,
    accentColor: 0x18181b,
    lengthScale: 0.72,
    glbModel: 'Pistol-52kQzphmeF.glb',
  },
  glock17: {
    id: 'glock17',
    name: 'Glock 17 Gen4 (9x19mm)',
    shortName: 'Glock 17',
    category: 'Pistola Semiautomática (9mm)',
    shopTab: 'pistols',
    factionTag: 'BANDIDOS',
    description: 'Ferrolho retangular clássico em aço carbono fosco e carregador de 17 tiros.',
    price: 400,
    damage: 26,
    headshotMult: 2.5,
    fireRateMs: 155,
    clipSize: 17,
    reserveMax: 68,
    reloadTimeMs: 1350,
    recoilKick: 0.044,
    spread: 0.009,
    auto: false,
    killReward: 300,
    bodyColor: 0x1f2328,
    accentColor: 0x121316,
    lengthScale: 0.74,
    glbModel: 'Pistol.glb',
  },
  glock19: {
    id: 'glock19',
    name: 'Glock 19 Compact (9x19mm)',
    shortName: 'Glock 19',
    category: 'Pistola Compacta (9mm)',
    shopTab: 'pistols',
    factionTag: 'AMBOS',
    description: 'Versão compacta de saque rápido, ferrolho grafite curto e baixo recuo.',
    price: 500,
    damage: 27,
    headshotMult: 2.5,
    fireRateMs: 140,
    clipSize: 15,
    reserveMax: 60,
    reloadTimeMs: 1300,
    recoilKick: 0.04,
    spread: 0.0085,
    auto: false,
    killReward: 300,
    bodyColor: 0x333942,
    accentColor: 0x141518,
    lengthScale: 0.68,
    glbModel: 'Pistol-J3i9KDQ3kt.glb',
  },
  pt92: {
    id: 'pt92',
    name: 'Taurus PT92 AF Inox (9mm)',
    shortName: 'Taurus PT92',
    category: 'Pistola Policial Brasileira',
    shopTab: 'pistols',
    factionTag: 'PM',
    description: 'Clássica pistola da PM com ferrolho aberto, cano inox exposto e cão externo.',
    price: 550,
    damage: 31,
    headshotMult: 2.6,
    fireRateMs: 175,
    clipSize: 15,
    reserveMax: 60,
    reloadTimeMs: 1450,
    recoilKick: 0.05,
    spread: 0.0075,
    auto: false,
    killReward: 300,
    bodyColor: 0xcbd5e1,
    accentColor: 0x18181b,
    lengthScale: 0.78,
    glbModel: 'Pistol-J3i9KDQ3kt.glb',
  },
  th9: {
    id: 'th9',
    name: 'Taurus TH9 Tactical (9mm)',
    shortName: 'Taurus TH9',
    category: 'Pistola Tática Moderna',
    shopTab: 'pistols',
    factionTag: 'PM',
    description: 'Pistola moderna de serviço policial com trilho Picatinny e miras de trítio.',
    price: 600,
    damage: 32,
    headshotMult: 2.6,
    fireRateMs: 165,
    clipSize: 17,
    reserveMax: 68,
    reloadTimeMs: 1400,
    recoilKick: 0.048,
    spread: 0.007,
    auto: false,
    killReward: 300,
    bodyColor: 0x262b33,
    accentColor: 0x111317,
    lengthScale: 0.75,
    glbModel: 'Pistol-52kQzphmeF.glb',
  },
  deagle: {
    id: 'deagle',
    name: 'Night Hawk .50C (Deagle)',
    shortName: 'Desert Eagle',
    category: 'Pistola Pesada (.50 AE)',
    shopTab: 'pistols',
    factionTag: 'AMBOS',
    description: 'Ferrolho cromado espelhado de calibre .50 AE com poder de parada devastador.',
    price: 650,
    damage: 54,
    headshotMult: 2.8,
    fireRateMs: 310,
    clipSize: 7,
    reserveMax: 35,
    reloadTimeMs: 1650,
    recoilKick: 0.11,
    spread: 0.01,
    auto: false,
    killReward: 300,
    bodyColor: 0xe2e8f0,
    accentColor: 0x18181b,
    lengthScale: 0.85,
    glbModel: 'Pistol-Z7aOjJu583.glb',
  },
  revolver_38: {
    id: 'revolver_38',
    name: 'Taurus RT 889 (.38 Special)',
    shortName: 'Taurus .38',
    category: 'Revólver Clássico (.38 SPL)',
    shopTab: 'pistols',
    factionTag: 'AMBOS',
    description: 'Revólver de tambor de 6 tiros com empunhadura em madeira e alta precisão inicial.',
    price: 600,
    damage: 44,
    headshotMult: 2.75,
    fireRateMs: 260,
    clipSize: 6,
    reserveMax: 36,
    reloadTimeMs: 1850,
    recoilKick: 0.082,
    spread: 0.0065,
    auto: false,
    killReward: 350,
    bodyColor: 0x3f3f46,
    accentColor: 0x7c3f1c,
    lengthScale: 0.76,
    glbModel: 'Revolver.glb',
  },
  revolver_357: {
    id: 'revolver_357',
    name: 'Colt Python (.357 Magnum)',
    shortName: 'Python .357',
    category: 'Revólver Pesado (.357 Mag)',
    shopTab: 'pistols',
    factionTag: 'PM',
    description: 'Cano ventilado reforçado em aço inoxidável com alto impacto balístico a média distância.',
    price: 750,
    damage: 58,
    headshotMult: 2.85,
    fireRateMs: 340,
    clipSize: 6,
    reserveMax: 36,
    reloadTimeMs: 1950,
    recoilKick: 0.115,
    spread: 0.0055,
    auto: false,
    killReward: 350,
    bodyColor: 0xcbd5e1,
    accentColor: 0x5c3a21,
    lengthScale: 0.82,
    glbModel: 'Revolver-9C26wSpMS0.glb',
  },
  revolver_44: {
    id: 'revolver_44',
    name: 'Taurus Raging Bull (.44 Magnum)',
    shortName: 'Raging Bull .44',
    category: 'Revólver Caçador (.44 Mag)',
    shopTab: 'pistols',
    factionTag: 'BANDIDOS',
    description: 'Canhão de mão brasileiro de cano longo com compensador de recuo e letalidade extrema.',
    price: 850,
    damage: 66,
    headshotMult: 2.95,
    fireRateMs: 410,
    clipSize: 6,
    reserveMax: 30,
    reloadTimeMs: 2100,
    recoilKick: 0.135,
    spread: 0.005,
    auto: false,
    killReward: 400,
    bodyColor: 0x27272a,
    accentColor: 0xb91c1c,
    lengthScale: 0.88,
    glbModel: 'Revolver-XrnLUz6kQj.glb',
  },
  // ==========================================================================
  // ESCOPETAS (3 MODELOS: CANO CURTO 12G, LEONE M3, CBC PUMP MILITARY)
  // ==========================================================================
  sawed_off: {
    id: 'sawed_off',
    name: 'Escopeta Calibre 12 Cano Curto',
    shortName: 'Doze Cano Curto',
    category: 'Escopeta Urbana (9 Balins)',
    shopTab: 'shotguns',
    factionTag: 'BANDIDOS',
    description: 'Cano duplo serrado e empunhadura em madeira envernizada para impacto brutal de perto.',
    price: 1400,
    damage: 24, // 24 x 9 balins = 216 de dano máximo a queima-roupa
    headshotMult: 2.1,
    pellets: 9,
    fireRateMs: 760,
    clipSize: 5,
    reserveMax: 25,
    reloadTimeMs: 2050,
    recoilKick: 0.165,
    spread: 0.086,
    auto: false,
    killReward: 900,
    bodyColor: 0x333840,
    accentColor: 0x6b3818,
    lengthScale: 0.86,
    glbModel: 'Shotgun Sawed Off.glb',
  },
  shotgun_short: {
    id: 'shotgun_short',
    name: 'Mossberg 590 Cruiser Breacher 12G',
    shortName: 'Cruiser 12G',
    category: 'Escopeta Tática Curta (8 Balins)',
    shopTab: 'shotguns',
    factionTag: 'AMBOS',
    description: 'Escopeta pump-action de coronha reduzida para invasão rápida de recintos fechados.',
    price: 1600,
    damage: 23,
    headshotMult: 2.15,
    pellets: 8,
    fireRateMs: 800,
    clipSize: 6,
    reserveMax: 30,
    reloadTimeMs: 2100,
    recoilKick: 0.15,
    spread: 0.074,
    auto: false,
    killReward: 900,
    bodyColor: 0x262930,
    accentColor: 0x5c3a21,
    lengthScale: 0.96,
    glbModel: 'Shotgun Short Stock.glb',
  },
  m3: {
    id: 'm3',
    name: 'Leone 12 Gauge Super (Shotgun)',
    shortName: 'Shotgun M3',
    category: 'Escopeta Pump-Action (8 Balins)',
    shopTab: 'shotguns',
    factionTag: 'AMBOS',
    description: 'Clássica escopeta calibre 12 com coronha e telha pump-action em madeira nobre.',
    price: 1700,
    damage: 22, // 22 x 8 balins = 176 de dano total a queima-roupa
    headshotMult: 2.2,
    pellets: 8,
    fireRateMs: 880,
    clipSize: 8,
    reserveMax: 32,
    reloadTimeMs: 2200,
    recoilKick: 0.145,
    spread: 0.068,
    auto: false,
    killReward: 900,
    bodyColor: 0x27272a,
    accentColor: 0x5c3a21,
    lengthScale: 1.12,
    glbModel: 'Shotgun.glb',
  },
  cbc_pump: {
    id: 'cbc_pump',
    name: 'CBC 586.2 Pump Military 12G',
    shortName: 'CBC Pump 12G',
    category: 'Escopeta Tática PM (9 Balins)',
    shopTab: 'shotguns',
    factionTag: 'PM',
    description: 'Escopeta policial brasileira com escudo térmico perfurado e polímero preto.',
    price: 1850,
    damage: 21, // 21 x 9 balins = 189 de dano total com feixe mais fechado
    headshotMult: 2.3,
    pellets: 9,
    fireRateMs: 810,
    clipSize: 8,
    reserveMax: 32,
    reloadTimeMs: 2100,
    recoilKick: 0.135,
    spread: 0.058,
    auto: false,
    killReward: 900,
    bodyColor: 0x181b20,
    accentColor: 0x0f1115,
    lengthScale: 1.14,
    glbModel: 'Shotgun-ZmPTnh7njL.glb',
  },
  // ==========================================================================
  // FUZIS DE ASSALTO E BATALHA (6 MODELOS: AK-47, HK G3, PARAFAL, IMBEL IA2, M4A1, BULLPUP AUG)
  // ==========================================================================
  ak47: {
    id: 'ak47',
    name: 'CV-47 (AK-47 Clássica)',
    shortName: 'AK-47',
    category: 'Fuzil de Assalto (7.62x39mm)',
    shopTab: 'rifles',
    factionTag: 'BANDIDOS',
    description: 'Guarda-mão e coronha em madeira maciça, carregador banana curvo e alto dano.',
    price: 2500,
    damage: 36,
    headshotMult: 2.7,
    fireRateMs: 105,
    clipSize: 30,
    reserveMax: 90,
    reloadTimeMs: 1950,
    recoilKick: 0.068,
    spread: 0.014,
    auto: true,
    killReward: 300,
    bodyColor: 0x2c3035,
    accentColor: 0x8b4519,
    lengthScale: 1.15,
    glbModel: 'Assault Rifle.glb',
  },
  g3: {
    id: 'g3',
    name: 'Heckler & Koch G3A3 (7.62mm)',
    shortName: 'HK G3 7.62',
    category: 'Fuzil de Batalha (7.62x51mm)',
    shopTab: 'rifles',
    factionTag: 'BANDIDOS',
    description: 'Fuzil pesado com guarda-mão verde-oliva, bipé tático acoplado e tiro potente.',
    price: 2800,
    damage: 43,
    headshotMult: 2.8,
    fireRateMs: 130,
    clipSize: 20,
    reserveMax: 80,
    reloadTimeMs: 2100,
    recoilKick: 0.078,
    spread: 0.011,
    auto: true,
    killReward: 300,
    bodyColor: 0x25282c,
    accentColor: 0x2f3e2e,
    lengthScale: 1.24,
    glbModel: 'Assault Rifle-fpLucho45C.glb',
    accessories: ['Bipod.glb'],
  },
  parafal: {
    id: 'parafal',
    name: 'IMBEL ParaFAL M964A1 (7.62mm)',
    shortName: 'FN FAL / ParaFAL',
    category: 'Fuzil Pesado Brasileiro (7.62mm)',
    shopTab: 'rifles',
    factionTag: 'PM',
    description: 'Ícone das forças brasileiras: cano longo, guarda-mão ventilado e calibre pesado 7.62x51mm.',
    price: 2900,
    damage: 44,
    headshotMult: 2.8,
    fireRateMs: 126,
    clipSize: 20,
    reserveMax: 80,
    reloadTimeMs: 2050,
    recoilKick: 0.08,
    spread: 0.01,
    auto: true,
    killReward: 300,
    bodyColor: 0x1b1e23,
    accentColor: 0x111317,
    lengthScale: 1.25,
    glbModel: 'Assault Rifle-fpLucho45C.glb',
  },
  ia2: {
    id: 'ia2',
    name: 'IMBEL IA2 5.56mm Tático',
    shortName: 'IMBEL IA2',
    category: 'Fuzil Policial Nacional (5.56mm)',
    shopTab: 'rifles',
    factionTag: 'PM',
    description: 'Fuzil brasileiro moderno com trilho Picatinny, guarda-mão ventilado e mira óptica 3D.',
    price: 3000,
    damage: 34,
    headshotMult: 2.6,
    fireRateMs: 94,
    clipSize: 30,
    reserveMax: 90,
    reloadTimeMs: 1800,
    recoilKick: 0.049,
    spread: 0.009,
    auto: true,
    killReward: 300,
    bodyColor: 0x22272e,
    accentColor: 0x29382b,
    lengthScale: 1.12,
    glbModel: 'Assault Rifle-Bgvuu4CUMV.glb',
    accessories: ['Scope.glb'],
  },
  m4a1: {
    id: 'm4a1',
    name: 'Maverick M4A1 Carbine',
    shortName: 'M4A1 Carbine',
    category: 'Carabina Tática (5.56mm)',
    shopTab: 'rifles',
    factionTag: 'PM',
    description: 'Carabina de alta cadência com alça de transporte tática e coronha retrátil.',
    price: 3100,
    damage: 33,
    headshotMult: 2.5,
    fireRateMs: 92,
    clipSize: 30,
    reserveMax: 90,
    reloadTimeMs: 1850,
    recoilKick: 0.052,
    spread: 0.01,
    auto: true,
    killReward: 300,
    bodyColor: 0x23292e,
    accentColor: 0x49535c,
    lengthScale: 1.12,
    glbModel: 'Assault Rifle-Bgvuu4CUMV.glb',
  },
  bullpup_aug: {
    id: 'bullpup_aug',
    name: 'Steyr AUG A3 / Tavor Bullpup (5.56mm)',
    shortName: 'AUG Bullpup',
    category: 'Fuzil Bullpup com Luneta (5.56mm)',
    shopTab: 'rifles',
    factionTag: 'AMBOS',
    description: 'Design bullpup compacto com carregador traseiro e luneta tática de Zoom (Clique Direito).',
    price: 3300,
    damage: 35,
    headshotMult: 2.65,
    fireRateMs: 96,
    clipSize: 30,
    reserveMax: 90,
    reloadTimeMs: 1950,
    recoilKick: 0.046,
    spread: 0.0075,
    auto: true,
    killReward: 300,
    bodyColor: 0x2f3e2e,
    accentColor: 0x18181b,
    lengthScale: 1.04,
    hasScope: true,
    glbModel: 'Bullpup.glb',
    accessories: ['Scope.glb'],
  },
  // ==========================================================================
  // TÁTICOS: SUBMETRALHADORAS & SNIPERS (6 MODELOS)
  // ==========================================================================
  mp5: {
    id: 'mp5',
    name: 'KM Sub-Machine Gun (MP5)',
    shortName: 'MP5 Navy',
    category: 'Submetralhadora (9mm)',
    shopTab: 'tactical',
    factionTag: 'AMBOS',
    description: 'Submetralhadora tática compacta de altíssima mobilidade e recuo reduzido.',
    price: 1500,
    damage: 26,
    headshotMult: 2.2,
    fireRateMs: 95,
    clipSize: 30,
    reserveMax: 120,
    reloadTimeMs: 1750,
    recoilKick: 0.042,
    spread: 0.016,
    auto: true,
    killReward: 600,
    bodyColor: 0x1f2428,
    accentColor: 0x3d444d,
    lengthScale: 0.95,
    glbModel: 'Submachine Gun.glb',
  },
  smg_tactical: {
    id: 'smg_tactical',
    name: 'HK UMP-45 / P90 Tactical Optics',
    shortName: 'UMP-45 Tactical',
    category: 'Submetralhadora Pesada (.45 ACP)',
    shopTab: 'tactical',
    factionTag: 'AMBOS',
    description: 'Submetralhadora tática de calibre .45 ACP equipada com mira óptica 3D e alto poder de parada.',
    price: 1700,
    damage: 30,
    headshotMult: 2.35,
    fireRateMs: 102,
    clipSize: 30,
    reserveMax: 120,
    reloadTimeMs: 1800,
    recoilKick: 0.045,
    spread: 0.013,
    auto: true,
    killReward: 600,
    bodyColor: 0x27272a,
    accentColor: 0x18181b,
    lengthScale: 0.96,
    glbModel: 'Submachine Gun-nsP3JukU73.glb',
    accessories: ['Scope.glb'],
  },
  sniper_scout: {
    id: 'sniper_scout',
    name: 'Steyr Scout Tactical (.308 Win)',
    shortName: 'Scout .308',
    category: 'Rifle de Precisão Leve (.308)',
    shopTab: 'tactical',
    factionTag: 'AMBOS',
    description: 'Sniper leve de ferrolho rápido com luneta 2x/4x e bipé tático para mobilidade elevada.',
    price: 2750,
    damage: 78,
    headshotMult: 3.2,
    fireRateMs: 740,
    clipSize: 10,
    reserveMax: 40,
    reloadTimeMs: 2050,
    recoilKick: 0.11,
    spread: 0.0015,
    auto: false,
    killReward: 300,
    bodyColor: 0x334155,
    accentColor: 0x1e293b,
    lengthScale: 1.24,
    hasScope: true,
    glbModel: 'Sniper Rifle-TKaBjAEofL.glb',
    accessories: ['Bipod.glb'],
  },
  sniper_dmr: {
    id: 'sniper_dmr',
    name: 'HK PSG-1 / MSG90 Semiauto (7.62mm)',
    shortName: 'PSG-1 DMR',
    category: 'Sniper Semiautomático (7.62mm)',
    shopTab: 'tactical',
    factionTag: 'PM',
    description: 'Rifle sniper semiautomático de tiro contínuo com luneta 2x/4x e bipé de precisão.',
    price: 4200,
    damage: 68,
    headshotMult: 2.9,
    fireRateMs: 280,
    clipSize: 20,
    reserveMax: 60,
    reloadTimeMs: 2250,
    recoilKick: 0.095,
    spread: 0.002,
    auto: false,
    killReward: 200,
    bodyColor: 0x1e293b,
    accentColor: 0x0f172a,
    lengthScale: 1.32,
    hasScope: true,
    glbModel: 'Sniper Rifle-ASOMZIErq3.glb',
    accessories: ['Bipod.glb'],
  },
  awp: {
    id: 'awp',
    name: 'Magnum Sniper Rifle (AWP)',
    shortName: 'AWP Sniper',
    category: 'Rifle de Precisão (.338)',
    shopTab: 'tactical',
    factionTag: 'AMBOS',
    description: 'Rifle de ferrolho com luneta de Zoom 2x/4x e bipé acoplado capaz de eliminar com um disparo.',
    price: 4750,
    damage: 115,
    headshotMult: 3.0,
    fireRateMs: 950,
    clipSize: 10,
    reserveMax: 30,
    reloadTimeMs: 2400,
    recoilKick: 0.16,
    spread: 0.001,
    auto: false,
    killReward: 100,
    bodyColor: 0x2d4c2b,
    accentColor: 0x181c1a,
    lengthScale: 1.38,
    hasScope: true,
    glbModel: 'Sniper Rifle.glb',
    accessories: ['Bipod.glb'],
  },
  sniper_barrett: {
    id: 'sniper_barrett',
    name: 'Barrett M82A1 Antimaterial (.50 BMG)',
    shortName: 'Barrett .50 BMG',
    category: 'Sniper Antimaterial (.50 BMG)',
    shopTab: 'tactical',
    factionTag: 'BANDIDOS',
    description: 'Rifle pesado calibre .50 BMG montado com tripé balístico e luneta de longo alcance.',
    price: 5500,
    damage: 145,
    headshotMult: 3.5,
    fireRateMs: 1120,
    clipSize: 10,
    reserveMax: 30,
    reloadTimeMs: 2650,
    recoilKick: 0.21,
    spread: 0.0008,
    auto: false,
    killReward: 100,
    bodyColor: 0x18181b,
    accentColor: 0x27272a,
    lengthScale: 1.46,
    hasScope: true,
    glbModel: 'Sniper Rifle-i65hEldsw6.glb',
    accessories: ['Tripod.glb'],
  },
};

export const STANDALONE_HTML_SOURCE = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Counter-Strike 1.6 WebGL — Dust II 5v5 (Round 05:00, Faca, Inventário Q & AWP)</title>
  <style>
    /* ==========================================================================
       ESTILOS GERAIS E HUD TRANSLÚCIDO MINIMALISTA (ESTILO CS2 / VALORANT)
       ========================================================================== */
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    html, body {
      width: 100%; height: 100%; overflow: hidden;
      background-color: #09090b;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #f4f4f5;
    }
    #game-container { position: fixed; inset: 0; width: 100vw; height: 100vh; }
    #hud {
      position: fixed; inset: 0; pointer-events: none; z-index: 10;
      font-variant-numeric: tabular-nums;
    }
    .top-bar {
      position: absolute; top: 16px; left: 50%; transform: translateX(-50%);
      display: flex; gap: 16px; align-items: center;
      background: rgba(9, 9, 11, 0.55);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 8px 20px; font-size: 13px; font-weight: 700;
      color: #f4f4f5;
      box-shadow: 0 10px 25px rgba(0,0,0,0.45);
    }
    .ct-badge { color: #38bdf8; }
    .tr-badge { color: #fb7185; }
    .timer-badge {
      padding: 2px 10px; color: #ffffff; font-size: 15px; font-weight: 900;
      border-left: 1px solid rgba(255, 255, 255, 0.1);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
    }
    #killfeed {
      position: absolute; top: 16px; right: 20px;
      display: flex; flex-direction: column; align-items: flex-end; gap: 6px;
    }
    .kill-item {
      background: rgba(9, 9, 11, 0.55);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 4px 12px; font-size: 12px; color: #f4f4f5;
      display: flex; align-items: center; gap: 8px;
    }

    /* Mira Padrão (Crosshair) */
    #crosshair {
      position: absolute; top: 50%; left: 50%;
      width: 28px; height: 28px; transform: translate(-50%, -50%);
    }
    .ch-line { position: absolute; background: #34d399; box-shadow: 0 0 2px #000; }
    .ch-top { width: 2px; height: 8px; left: 13px; top: 0; }
    .ch-bottom { width: 2px; height: 8px; left: 13px; bottom: 0; }
    .ch-left { width: 8px; height: 2px; left: 0; top: 13px; }
    .ch-right { width: 8px; height: 2px; right: 0; top: 13px; }
    .ch-dot { width: 2px; height: 2px; left: 13px; top: 13px; background: #ffffff; border-radius: 50%; }

    /* Mira Telescópica da AWP (Clique Direito) */
    #awp-scope {
      position: fixed; inset: 0; pointer-events: none; z-index: 9;
      display: none;
      background: radial-gradient(circle, transparent 34%, rgba(0, 0, 0, 0.96) 36%);
    }
    .scope-h { position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #111; }
    .scope-v { position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: #111; }
    .scope-dot {
      position: absolute; top: 50%; left: 50%; width: 6px; height: 6px;
      border-radius: 50%; background: #ef4444; transform: translate(-50%, -50%);
    }
    #scope-label {
      position: absolute; top: 53%; left: 53%;
      color: #fbbf24; font-size: 12px; font-weight: 700;
    }

    #damage-flash {
      position: fixed; inset: 0; pointer-events: none;
      background: radial-gradient(circle, transparent 55%, rgba(220, 38, 38, 0.55) 100%);
      opacity: 0; transition: opacity 0.12s ease-out;
    }
    #center-banner {
      position: absolute; top: 136px; left: 50%; transform: translateX(-50%);
      font-size: 13px; font-weight: 700; color: #fcd34d;
      background: rgba(9, 9, 11, 0.6); backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 999px;
      padding: 6px 18px; opacity: 0; transition: opacity 0.2s; text-align: center;
    }
    .bottom-left {
      position: absolute; bottom: 20px; left: 24px;
      display: flex; align-items: center; gap: 20px;
      background: rgba(9, 9, 11, 0.55); backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;
      padding: 12px 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.45);
    }
    .bottom-right {
      position: absolute; bottom: 20px; right: 24px;
      display: flex; flex-direction: column; align-items: flex-end; gap: 8px;
    }
    .hud-box {
      background: rgba(9, 9, 11, 0.55); backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;
      padding: 12px 20px; display: flex; align-items: center; gap: 18px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.45);
    }
    .hud-stat { display: flex; flex-direction: column; gap: 2px; }
    .hud-label { font-size: 10px; color: #a1a1aa; letter-spacing: 0.8px; text-transform: uppercase; font-weight: 600; }
    .hud-value { font-size: 24px; font-weight: 900; color: #ffffff; line-height: 1; }
    .hud-value.amber { color: #fbbf24; font-size: 18px; }

    #inv-slots { display: flex; gap: 6px; }
    .inv-chip {
      background: rgba(9, 9, 11, 0.45); backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px;
      padding: 4px 10px; font-size: 12px; color: #a1a1aa;
    }
    .inv-chip.active {
      border-color: rgba(251, 191, 36, 0.6); color: #ffffff; font-weight: 600;
      background: rgba(255, 255, 255, 0.14);
    }

    #overlay-screen, #buy-modal {
      position: fixed; inset: 0;
      background: radial-gradient(circle at 65% 25%, #451a03 0%, #1c1917 55%, #090b09 100%);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      z-index: 30; pointer-events: auto;
    }
    #buy-modal { display: none; background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(8px); }
    .menu-wrap {
      max-width: 680px; width: 92%; background: rgba(9, 9, 11, 0.82);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.75);
      padding: 28px 32px; position: relative;
    }
    .menu-header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 14px; margin-bottom: 18px; }
    .menu-title { font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; }
    .menu-sub { font-size: 11px; color: #fbbf24; letter-spacing: 1px; font-weight: 600; }
    .menu-btn {
      display: block; width: 100%; background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: #f4f4f5;
      font-family: inherit; font-size: 13px; font-weight: 600;
      padding: 13px 18px; margin-bottom: 10px; cursor: pointer;
      text-align: left; transition: all 0.15s;
    }
    .menu-btn:hover {
      background: rgba(255, 255, 255, 0.12);
    }
    .menu-btn.primary {
      background: #fbbf24; color: #09090b;
      border: none; font-size: 14px; font-weight: 800;
    }
    .menu-btn.primary:hover {
      background: #fcd34d;
    }
    .team-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
    .team-card {
      padding: 16px; border-radius: 16px; border: 1px solid transparent; cursor: pointer; text-align: left;
    }
    .team-card.ct { background: rgba(14, 165, 233, 0.15); border-color: rgba(56, 189, 248, 0.4); color: #bae6fd; }
    .team-card.tr { background: rgba(244, 63, 94, 0.15); border-color: rgba(251, 113, 133, 0.4); color: #fecdd3; }
    .team-card h3 { font-size: 16px; font-weight: bold; color: #fff; margin-bottom: 4px; }
    .panel {
      background: rgba(9, 9, 11, 0.88); backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 24px; padding: 24px 30px;
      max-width: 680px; width: 92%;
    }
    .panel h1 { color: #ffffff; font-size: 20px; margin-bottom: 8px; }
    .panel p { color: #a1a1aa; font-size: 13px; line-height: 1.5; margin-bottom: 14px; }
    .btn {
      background: #fbbf24; color: #09090b; font-family: inherit;
      font-size: 12px; font-weight: 700; padding: 10px 18px; border-radius: 10px;
      border: none; cursor: pointer; text-transform: uppercase; margin-right: 8px;
    }
    .btn-ct { background: #38bdf8; color: #09090b; }
    .btn-tr { background: #fb7185; color: #09090b; }
    .buy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 14px 0; }
    .buy-item {
      background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px; padding: 12px 14px;
      color: #f4f4f5; font-family: inherit; cursor: pointer;
      display: flex; justify-content: space-between; align-items: center;
    }
  </style>
</head>
<body>
  <div id="game-container"></div>
  <div id="damage-flash"></div>

  <!-- Mira Telescópica da AWP -->
  <div id="awp-scope">
    <div class="scope-h"></div>
    <div class="scope-v"></div>
    <div class="scope-dot"></div>
    <div id="scope-label">Zoom 2.0x</div>
  </div>

  <!-- HUD Translúcido Minimalista -->
  <div id="hud">
    <div class="top-bar">
      <span class="ct-badge" id="hud-ct-alive">5 vivos</span>
      <span id="hud-score">PM 0 · 0 Bandidos</span>
      <span class="timer-badge" id="hud-timer">05:00</span>
      <span class="tr-badge" id="hud-tr-alive">5 vivos</span>
    </div>

    <div id="killfeed"></div>
    <div id="center-banner"></div>

    <!-- Contagem de 10 Segundos Flutuante no Topo (Sem Caixa Preta Central) -->
    <div id="freeze-overlay" style="display: none; position: fixed; top: 76px; left: 50%; transform: translateX(-50%); text-align: center; z-index: 100; pointer-events: none;">
      <div style="font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 3px; text-shadow: 0 2px 4px rgba(0,0,0,0.9);">
        Preparo
      </div>
      <div id="freeze-count" style="font-size: 56px; font-weight: 900; line-height: 1; color: #fbbf24; text-shadow: 0 4px 20px rgba(0,0,0,0.85);">10</div>
    </div>

    <div id="crosshair">
      <div class="ch-line ch-top"></div>
      <div class="ch-line ch-bottom"></div>
      <div class="ch-line ch-left"></div>
      <div class="ch-line ch-right"></div>
      <div class="ch-dot"></div>
    </div>

    <div class="bottom-left">
      <div class="hud-stat">
        <div class="hud-label">Vida</div>
        <div class="hud-value" id="hud-hp">100</div>
      </div>
      <div class="hud-stat">
        <div class="hud-label">Colete</div>
        <div class="hud-value" id="hud-armor">100</div>
      </div>
      <div class="hud-stat">
        <div class="hud-label">Saldo</div>
        <div class="hud-value amber" id="hud-money">$800</div>
      </div>
    </div>

    <div class="bottom-right">
      <div id="inv-slots"></div>
      <div class="hud-box">
        <div class="hud-stat" style="text-align: right;">
          <div class="hud-label">Munição</div>
          <div class="hud-value" id="hud-ammo">Lâmina</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Menu de Iniciar Tático com Imagem/Cenário de Fundo da Dust II -->
  <div id="overlay-screen">
    <div class="menu-wrap">
      <div class="menu-header">
        <div>
          <div class="menu-sub">EDICAO TATICA WEBGL // ARENA DUST II 5v5</div>
          <div class="menu-title">COUNTER-STRIKE 1.6</div>
        </div>
        <div style="text-align: right; font-size: 11px; color: #fbbf24;">
          ROUND: 05:00 EXATOS<br>100% SEM API KEY
        </div>
      </div>

      <div id="menu-view-main">
        <button class="menu-btn primary" id="start-game-btn">▶ JOGAR 5v5 COMPETITIVO (INICIAR / CONTINUAR)</button>
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 16px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 12px; font-weight: 700; color: #ffffff;">Sensibilidade do Mouse</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span id="sens-val-main" style="font-family: monospace; font-size: 13px; font-weight: 800; color: #fbbf24; background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.35); padding: 2px 8px; border-radius: 6px;">2.0</span>
              <button type="button" id="sens-reset-main" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #e4e4e7; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 6px; cursor: pointer;">Padrão (2.0)</button>
            </div>
          </div>
          <input id="sens-slider-main" type="range" min="0.1" max="10.0" step="0.1" value="2.0" style="width: 100%; accent-color: #fbbf24; cursor: pointer;" />
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #a1a1aa; font-family: monospace; margin-top: 2px;">
            <span>0.1</span>
            <span>2.0</span>
            <span>10.0</span>
          </div>
        </div>
        <button class="menu-btn" id="open-team-btn">🛡 ESCOLHER TIME (POLÍCIA MILITAR vs BANDIDOS)</button>
        <button class="menu-btn" id="open-arsenal-btn">⚔ ARSENAL DE ARMAS & ESPECIFICAÇÕES</button>
        <button class="menu-btn" id="open-controls-btn">⌨ GUIA DE CONTROLES & TECLAS</button>
      </div>

      <!-- Aba Escolha de Time -->
      <div id="menu-view-team" style="display: none;">
        <div style="font-size: 13px; color: #bbf7d0; margin-bottom: 10px;">
          Selecione sua facção para a partida 5v5 (Você + 4 Bots Aliados vs 5 Inimigos):
        </div>
        <div class="team-grid">
          <div class="team-card ct" id="join-ct-btn">
            <h3>POLÍCIA MILITAR (PM)</h3>
            <p style="font-size: 11px;">Força Tática Preta · Colete Balístico PM, Capacete e M4A1</p>
          </div>
          <div class="team-card tr" id="join-tr-btn">
            <h3>BANDIDOS</h3>
            <p style="font-size: 11px;">Assalto Urbano · Camisa Rubro-Negra, Corrente, Bermuda e AK-47</p>
          </div>
        </div>
        <button class="btn" id="back-to-menu-btn1" style="margin-top: 14px;">VOLTAR AO MENU</button>
      </div>

      <!-- Aba Arsenal -->
      <div id="menu-view-arsenal" style="display: none; max-height: 380px; overflow-y: auto;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 12px;">
          <div style="background: #101610; border: 1px solid #4ade8055; padding: 8px;">
            <strong style="color: #4ade80;">Faca Tática</strong> · Dano: 45 / 88 (Estocada) · Grátis
          </div>
          <div style="background: #101610; border: 1px solid #4ade8055; padding: 8px;">
            <strong style="color: #4ade80;">USP .45</strong> · Dano: 28 · Pente: 12/48 · $500
          </div>
          <div style="background: #101610; border: 1px solid #4ade8055; padding: 8px;">
            <strong style="color: #4ade80;">Desert Eagle .50</strong> · Ferrolho Cromado · Dano: 54 · $650
          </div>
          <div style="background: #101610; border: 1px solid #4ade8055; padding: 8px;">
            <strong style="color: #fbbf24;">Leone M3 Shotgun</strong> · 8 Balins (22x8=176) · Pente: 8/32 · $1700
          </div>
          <div style="background: #101610; border: 1px solid #4ade8055; padding: 8px;">
            <strong style="color: #4ade80;">MP5 Navy</strong> · Dano: 26 · Pente: 30/120 · $1500
          </div>
          <div style="background: #101610; border: 1px solid #4ade8055; padding: 8px;">
            <strong style="color: #4ade80;">AK-47</strong> · Dano: 36 · Pente: 30/90 · $2500
          </div>
          <div style="background: #101610; border: 1px solid #4ade8055; padding: 8px;">
            <strong style="color: #4ade80;">M4A1 Carbine</strong> · Dano: 33 · Pente: 30/90 · $3100
          </div>
          <div style="background: #101610; border: 1px solid #4ade8055; padding: 8px;">
            <strong style="color: #fbbf24;">Magnum AWP (Luneta 2x / 4x)</strong> · Dano: 115 (One-shot) · $4750
          </div>
        </div>
        <button class="btn" id="back-to-menu-btn2">VOLTAR AO MENU</button>
      </div>

      <!-- Aba Controles -->
      <div id="menu-view-controls" style="display: none;">
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 12px 16px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 12px; font-weight: 700; color: #ffffff;">Sensibilidade do Mouse</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <span id="sens-val-controls" style="font-family: monospace; font-size: 13px; font-weight: 800; color: #fbbf24; background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.35); padding: 2px 8px; border-radius: 6px;">2.0</span>
              <button type="button" id="sens-reset-controls" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #e4e4e7; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 6px; cursor: pointer;">Padrão (2.0)</button>
            </div>
          </div>
          <input id="sens-slider-controls" type="range" min="0.1" max="10.0" step="0.1" value="2.0" style="width: 100%; accent-color: #fbbf24; cursor: pointer;" />
          <div style="display: flex; justify-content: space-between; font-size: 10px; color: #a1a1aa; font-family: monospace; margin-top: 2px;">
            <span>Mín: 0.1</span>
            <span>Padrão: 2.0</span>
            <span>Máx: 10.0</span>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 12px; color: #bbf7d0;">
          <div style="background: #101610; padding: 8px; border: 1px solid #4ade8044;">
            <strong style="color: #fbbf24;">WASD</strong>: Mover e strafe
          </div>
          <div style="background: #101610; padding: 8px; border: 1px solid #4ade8044;">
            <strong style="color: #fbbf24;">Mouse 1 / 2</strong>: Atirar / Mira AWP
          </div>
          <div style="background: #101610; padding: 8px; border: 1px solid #4ade8044;">
            <strong style="color: #fbbf24;">Q</strong>: Alternar arma na mão
          </div>
          <div style="background: #101610; padding: 8px; border: 1px solid #4ade8044;">
            <strong style="color: #fbbf24;">E</strong>: Assumir bot aliado vivo
          </div>
          <div style="background: #101610; padding: 8px; border: 1px solid #4ade8044;">
            <strong style="color: #fbbf24;">R / B</strong>: Recarregar / Loja
          </div>
          <div style="background: #101610; padding: 8px; border: 1px solid #4ade8044;">
            <strong style="color: #fbbf24;">Espaço</strong>: Pular
          </div>
        </div>
        <button class="btn" id="back-to-menu-btn3">VOLTAR AO MENU</button>
      </div>

      <div style="margin-top: 14px; font-size: 11px; color: #a3e635; border-top: 1px solid rgba(74,222,128,0.2); pt: 8px;">
        Pressione ESPAÇO ou ENTER para iniciar a partida imediatamente.
      </div>
    </div>
  </div>

  <!-- Loja de Armas (Tecla B) -->
  <div id="buy-modal">
    <div class="panel">
      <h1>LOJA E INVENTÁRIO DE ARMAS [TECLA B]</h1>
      <div class="buy-grid">
        <button class="buy-item" data-buy="deagle"><span>[1] Desert Eagle .50 (Pistola)</span><span>$650</span></button>
        <button class="buy-item" data-buy="m3"><span>[2] Leone M3 Shotgun (8 Balins)</span><span>$1700</span></button>
        <button class="buy-item" data-buy="mp5"><span>[3] KM MP5 Navy</span><span>$1500</span></button>
        <button class="buy-item" data-buy="ak47"><span>[4] CV-47 (AK-47)</span><span>$2500</span></button>
        <button class="buy-item" data-buy="m4a1"><span>[5] Maverick M4A1</span><span>$3100</span></button>
        <button class="buy-item" data-buy="awp"><span>[6] Magnum AWP (Com Mira)</span><span>$4750</span></button>
        <button class="buy-item" data-buy="kevlar" style="grid-column: span 2;"><span>[7] Colete + Kit Médico (+50 HP)</span><span>$650</span></button>
      </div>
      <button class="btn" id="close-buy-btn">VOLTAR AO COMBATE [B]</button>
    </div>
  </div>

  <script type="module">
    import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
    import { GLTFLoader } from 'https://unpkg.com/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

    const gltfLoader = new GLTFLoader();
    const glbCache = new Map();

    const WEAPONS = {
      knife:          { name: 'Faca / Baioneta', price: 0,    damage: 45,  clip: 1,  reserve: 1,   rate: 0.35, recoil: 0.08, isMelee: true, glb: 'Bayonet.glb', len: 0.35 },
      usp:            { name: 'USP .45',         price: 300,  damage: 28,  clip: 12, reserve: 48,  rate: 0.18, recoil: 0.05, glb: 'Pistol-52kQzphmeF.glb', len: 0.285 },
      glock17:        { name: 'Glock 17',        price: 400,  damage: 26,  clip: 17, reserve: 68,  rate: 0.15, recoil: 0.04, glb: 'Pistol.glb', len: 0.255 },
      glock19:        { name: 'Glock 19',        price: 500,  damage: 27,  clip: 15, reserve: 60,  rate: 0.14, recoil: 0.04, glb: 'Pistol-J3i9KDQ3kt.glb', len: 0.24 },
      pt92:           { name: 'Taurus PT92',     price: 550,  damage: 31,  clip: 15, reserve: 60,  rate: 0.17, recoil: 0.05, glb: 'Pistol-J3i9KDQ3kt.glb', len: 0.27 },
      th9:            { name: 'Taurus TH9',      price: 600,  damage: 32,  clip: 17, reserve: 68,  rate: 0.16, recoil: 0.05, glb: 'Pistol-52kQzphmeF.glb', len: 0.28 },
      deagle:         { name: 'Desert Eagle',    price: 650,  damage: 54,  clip: 7,  reserve: 35,  rate: 0.30, recoil: 0.10, glb: 'Pistol-Z7aOjJu583.glb', len: 0.305 },
      revolver_38:    { name: 'Taurus .38',      price: 600,  damage: 44,  clip: 6,  reserve: 36,  rate: 0.26, recoil: 0.08, glb: 'Revolver.glb', len: 0.285 },
      revolver_357:   { name: 'Python .357',     price: 750,  damage: 58,  clip: 6,  reserve: 36,  rate: 0.34, recoil: 0.11, glb: 'Revolver-9C26wSpMS0.glb', len: 0.315 },
      revolver_44:    { name: 'Raging Bull .44', price: 850,  damage: 66,  clip: 6,  reserve: 30,  rate: 0.41, recoil: 0.13, glb: 'Revolver-XrnLUz6kQj.glb', len: 0.335 },
      sawed_off:      { name: 'Doze Curta',      price: 1400, damage: 24,  clip: 5,  reserve: 25,  rate: 0.76, recoil: 0.16, pellets: 9, spread: 0.086, glb: 'Shotgun Sawed Off.glb', len: 0.56 },
      shotgun_short:  { name: 'Cruiser 12G',     price: 1600, damage: 23,  clip: 6,  reserve: 30,  rate: 0.80, recoil: 0.15, pellets: 8, spread: 0.074, glb: 'Shotgun Short Stock.glb', len: 0.65 },
      m3:             { name: 'Shotgun M3',      price: 1700, damage: 22,  clip: 8,  reserve: 32,  rate: 0.88, recoil: 0.14, pellets: 8, spread: 0.068, glb: 'Shotgun.glb', len: 0.76 },
      cbc_pump:       { name: 'CBC Pump 12G',    price: 1850, damage: 21,  clip: 8,  reserve: 32,  rate: 0.81, recoil: 0.13, pellets: 9, spread: 0.058, glb: 'Shotgun-ZmPTnh7njL.glb', len: 0.77 },
      mp5:            { name: 'MP5 Navy',        price: 1500, damage: 26,  clip: 30, reserve: 120, rate: 0.09, recoil: 0.04, glb: 'Submachine Gun.glb', len: 0.52 },
      smg_tactical:   { name: 'UMP-45 Tactical', price: 1700, damage: 30,  clip: 30, reserve: 120, rate: 0.10, recoil: 0.045, glb: 'Submachine Gun-nsP3JukU73.glb', len: 0.54 },
      ak47:           { name: 'AK-47',           price: 2500, damage: 36,  clip: 30, reserve: 90,  rate: 0.10, recoil: 0.07, glb: 'Assault Rifle.glb', len: 0.72 },
      g3:             { name: 'HK G3 7.62',      price: 2800, damage: 43,  clip: 20, reserve: 80,  rate: 0.13, recoil: 0.08, glb: 'Assault Rifle-fpLucho45C.glb', len: 0.76 },
      parafal:        { name: 'ParaFAL 7.62',    price: 2900, damage: 44,  clip: 20, reserve: 80,  rate: 0.12, recoil: 0.08, glb: 'Assault Rifle-fpLucho45C.glb', len: 0.76 },
      ia2:            { name: 'IMBEL IA2',       price: 3000, damage: 34,  clip: 30, reserve: 90,  rate: 0.09, recoil: 0.05, glb: 'Assault Rifle-Bgvuu4CUMV.glb', len: 0.70 },
      m4a1:           { name: 'M4A1 Carbine',    price: 3100, damage: 33,  clip: 30, reserve: 90,  rate: 0.09, recoil: 0.05, glb: 'Assault Rifle-Bgvuu4CUMV.glb', len: 0.70 },
      bullpup_aug:    { name: 'AUG Bullpup',     price: 3300, damage: 35,  clip: 30, reserve: 90,  rate: 0.096, recoil: 0.046, hasScope: true, glb: 'Bullpup.glb', len: 0.66 },
      sniper_scout:   { name: 'Scout .308',      price: 2750, damage: 78,  clip: 10, reserve: 40,  rate: 0.74, recoil: 0.11, hasScope: true, glb: 'Sniper Rifle-TKaBjAEofL.glb', len: 0.82 },
      sniper_dmr:     { name: 'PSG-1 DMR',       price: 4200, damage: 68,  clip: 20, reserve: 60,  rate: 0.28, recoil: 0.095, hasScope: true, glb: 'Sniper Rifle-ASOMZIErq3.glb', len: 0.85 },
      awp:            { name: 'AWP Sniper',      price: 4750, damage: 115, clip: 10, reserve: 30,  rate: 0.95, recoil: 0.16, hasScope: true, glb: 'Sniper Rifle.glb', len: 0.86 },
      sniper_barrett: { name: 'Barrett .50 BMG', price: 5500, damage: 145, clip: 10, reserve: 30,  rate: 1.12, recoil: 0.21, hasScope: true, glb: 'Sniper Rifle-i65hEldsw6.glb', len: 0.90 }
    };

    let scene, camera, renderer, clock, weaponGroup, audioCtx = null;
    const colliders = [], shootableMeshes = [], bots = [];

    function playBeep(isFinal) {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const now = audioCtx.currentTime;
        if (!isFinal) {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.08);
        } else {
          [1174, 1760].forEach((f, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + i * 0.06);
            gain.gain.setValueAtTime(0.24, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.22);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.22);
          });
        }
      } catch (e) {}
    }

    const player = {
      team: 'CT',
      isDead: false,
      pos: new THREE.Vector3(0, 1.7, 20),
      vel: new THREE.Vector3(),
      yaw: 0, pitch: 0, radius: 0.55, eyeHeight: 1.7, onGround: true,
      hp: 100, armor: 100, money: 800, kills: 0,
      ctScore: 0, trScore: 0, roundTime: 300,
      freezeTime: 10.0, isFreezeActive: true, lastFreezeSec: 10,
      isRoundEnding: false,
      loadout: ['knife', 'ak47', 'awp'],
      activeIndex: 0,
      ammo: {
        knife: { clip: 1, reserve: 1 }, usp: { clip: 12, reserve: 48 },
        deagle: { clip: 7, reserve: 35 }, m3: { clip: 8, reserve: 32 },
        mp5: { clip: 30, reserve: 120 }, ak47: { clip: 30, reserve: 90 },
        m4a1: { clip: 30, reserve: 90 }, awp: { clip: 10, reserve: 30 }
      },
      zoomLevel: 0, lastShot: 0, recoilOffset: 0
    };

    const keys = {};
    let isPointerLocked = false, isBuyMenuOpen = false, isMouseDown = false;

    function getActiveWeaponKey() { return player.loadout[player.activeIndex] || 'knife'; }

    function addBlock(x, y, z, w, h, d, material) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      shootableMeshes.push(mesh);
      colliders.push({ minX: x - w/2, maxX: x + w/2, minY: y - h/2, maxY: y + h/2, minZ: z - d/2, maxZ: z + d/2 });
    }

    let vmToken = 0;
    function buildViewmodel() {
      for (let i = camera.children.length - 1; i >= 0; i--) {
        if (camera.children[i].userData && camera.children[i].userData.isFirstPersonViewmodel) {
          camera.remove(camera.children[i]);
        }
      }
      weaponGroup = new THREE.Group();
      weaponGroup.userData.isFirstPersonViewmodel = true;
      const myToken = ++vmToken;
      const wKey = getActiveWeaponKey();
      const wDef = WEAPONS[wKey] || WEAPONS.knife;
      const isPistol = wKey === 'usp' || wKey === 'glock17' || wKey === 'glock19' || wKey === 'pt92' || wKey === 'th9' || wKey === 'deagle' || wKey.startsWith('revolver_');
      const sleeveMat = new THREE.MeshStandardMaterial({ color: player.team === 'CT' ? 0x131822 : 0x991b1b, roughness: 0.78 });
      const gloveMat = new THREE.MeshStandardMaterial({ color: player.team === 'CT' ? 0x0b0d11 : 0x3f2718, roughness: 0.65 });

      const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.062, 0.058), gloveMat);
      rightHand.position.set(0.18, -0.175, isPistol ? -0.37 : -0.40);
      rightHand.rotation.x = -0.24;
      const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.028, 0.34, 10), sleeveMat);
      rightForearm.position.set(0.25, -0.25, -0.21);
      rightForearm.rotation.set(1.22, 0, 0.36);
      weaponGroup.add(rightHand, rightForearm);

      if (!wDef.isMelee) {
        const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.045, 0.062), gloveMat);
        leftHand.position.set(isPistol ? 0.16 : 0.17, isPistol ? -0.18 : -0.155, isPistol ? -0.39 : -0.62);
        const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.027, 0.42, 10), sleeveMat);
        leftForearm.position.set(0.01, -0.25, isPistol ? -0.23 : -0.35);
        leftForearm.rotation.set(1.25, 0, -0.52);
        weaponGroup.add(leftHand, leftForearm);
      }

      const fallbackGroup = new THREE.Group();
      const metalMat = new THREE.MeshStandardMaterial({ color: wKey === 'knife' ? 0xd1d5db : 0x262a2e, metalness: 0.75, roughness: 0.35 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(wKey === 'knife' ? 0.018 : 0.048, 0.056, wKey === 'knife' ? 0.28 : 0.42), metalMat);
      body.position.set(0.18, -0.155, -0.50);
      fallbackGroup.add(body);
      weaponGroup.add(fallbackGroup);

      if (wDef && wDef.glb) {
        const currentGroup = weaponGroup;
        const mountGlb = (rootScene) => {
          if (weaponGroup !== currentGroup || vmToken !== myToken) return;
          const clone = rootScene.clone(true);
          const box = new THREE.Box3().setFromObject(clone);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);
          const s = (wDef.len || 0.68) / Math.max(0.001, size.x);
          const holder = new THREE.Group();
          clone.position.set(-center.x * s, -center.y * s, -center.z * s);
          clone.scale.setScalar(s);
          holder.add(clone);
          holder.position.set(0.18, isPistol ? -0.14 : -0.165, isPistol ? -0.46 : -0.52);
          holder.rotation.set(wDef.isMelee ? 0.18 : 0.012, Math.PI / 2 + 0.04, wDef.isMelee ? 0.08 : 0);
          fallbackGroup.visible = false;
          currentGroup.add(holder);
        };
        if (glbCache.has(wDef.glb)) {
          mountGlb(glbCache.get(wDef.glb));
        } else {
          gltfLoader.load('/models/weapons/' + encodeURIComponent(wDef.glb), (gltf) => {
            glbCache.set(wDef.glb, gltf.scene);
            mountGlb(gltf.scene);
          }, undefined, () => {});
        }
      }

      camera.add(weaponGroup);
    }

    const tracers = [];
    const ARENA_WAYPOINTS = [
      [0, -16], [0, -8], [-15, -14], [-15, 0], [-14, 13],
      [15, -14], [15, 0], [14, 13], [-4, 4], [4, -4], [0, 11]
    ];
    const STEER_ANGLES = [0, 0.42, -0.42, 0.85, -0.85, 1.3, -1.3, 1.75, -1.75];

    function spawnBulletTracer(startPos, endPos, colorHex) {
      const dist = startPos.distanceTo(endPos);
      if (dist < 0.4) return;
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.03, dist),
        new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.88 })
      );
      mesh.position.copy(startPos).lerp(endPos, 0.5);
      mesh.lookAt(endPos);
      scene.add(mesh);
      tracers.push({ mesh, life: 0.085, maxLife: 0.085 });
    }

    let cachedFlamengoTex = null;
    let cachedPMVestTex = null;

    function getFlamengoTex() {
      if (cachedFlamengoTex) return cachedFlamengoTex;
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const ctx = c.getContext('2d');
      const stripes = 8, sh = 256 / stripes;
      for (let i = 0; i < stripes; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#d91c24' : '#121214';
        ctx.fillRect(0, i * sh, 256, sh);
      }
      ctx.fillStyle = '#09090b';
      ctx.fillRect(92, 0, 72, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('CRF', 74, 52);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      cachedFlamengoTex = tex;
      return tex;
    }

    function getPMVestTex() {
      if (cachedPMVestTex) return cachedPMVestTex;
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#111318';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = '#1c2026';
      for (let y = 96; y <= 190; y += 22) ctx.fillRect(28, y, 200, 10);
      ctx.fillStyle = '#090a0d';
      ctx.fillRect(72, 26, 112, 42);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.strokeRect(72, 26, 112, 42);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('PM', 128, 56);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      cachedPMVestTex = tex;
      return tex;
    }

    const PM_NAMES = ['PM_Capitao', 'BOPE_ZeroUm', 'CHOQUE_Tatico', 'GATE_Operador', 'PM_Patrulha', 'PM_Incursao'];
    const BANDIDO_NAMES = ['RubroNegro_RJ', 'Falcao_Morro', 'Sombra_Vila', 'Relampago_ZS', 'Barao_Beco', 'Trovoada_Sul'];

    function spawn5v5Round() {
      bots.forEach((b) => scene.remove(b.group));
      bots.length = 0;
      player.isDead = false;
      player.hp = 100;
      player.armor = 100;
      player.roundTime = 300;
      player.freezeTime = 10.0;
      player.isFreezeActive = true;
      player.lastFreezeSec = 10;
      player.isRoundEnding = false;
      player.pos.set(0, 1.7, player.team === 'CT' ? 22 : -22);
      player.yaw = player.team === 'CT' ? 0 : Math.PI;
      buildViewmodel();

      const ctSpawns = [[-8, 22], [-4, 22], [4, 22], [8, 22], [0, 20]];
      const trSpawns = [[-8, -22], [-4, -22], [4, -22], [8, -22], [0, -20]];

      const createTeamBots = (teamName, count, spawnList) => {
        for (let i = 0; i < count; i++) {
          const v = i % 6;
          const group = new THREE.Group();
          const isCT = teamName === 'CT';
          const skinColors = [0xc68652, 0x9c6438, 0xd4996a, 0x825029, 0xba7a48, 0xa86b3c];
          const skinMat = new THREE.MeshStandardMaterial({ color: skinColors[v], roughness: 0.65 });
          const darkGearMat = new THREE.MeshStandardMaterial({ color: 0x0b0d10, roughness: 0.45 });

          const baseBodyColor = isCT ? 0x14171d : (v === 2 ? 0xf1f5f9 : v === 5 ? 0xfacc15 : 0xffffff);
          const hasBalaclava = isCT ? (v !== 3 && v !== 4) : (v === 1 || v === 4);
          const baseHeadColor = hasBalaclava ? 0x14161b : skinColors[v];

          const bodyMat = new THREE.MeshStandardMaterial({
            color: baseBodyColor,
            map: (!isCT && (v === 0 || v === 1 || v === 3 || v === 4)) ? getFlamengoTex() : null,
            roughness: 0.75
          });
          const headMat = new THREE.MeshStandardMaterial({ color: baseHeadColor, roughness: 0.68 });

          // Pernas articuladas (sem cilindros)
          const wearsShorts = !isCT && (v === 0 || v === 2 || v === 5);
          const pantsMat = isCT ? bodyMat : new THREE.MeshStandardMaterial({ color: v === 2 ? 0x18181b : 0x1e3a5f, roughness: 0.85 });
          [-0.15, 0.15].forEach((ox) => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.64, 0.21), wearsShorts ? skinMat : pantsMat);
            leg.position.set(ox, 0.32, 0);
            if (wearsShorts) {
              const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.34, 0.25), pantsMat);
              shorts.position.set(0, 0.15, 0);
              leg.add(shorts);
            }
            const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.29), isCT ? darkGearMat : new THREE.MeshStandardMaterial({ color: 0xf4f4f5 }));
            shoe.position.set(0, -0.26, 0.04);
            leg.add(shoe);
            group.add(leg);
          });

          // Tronco anatômico low-poly angulado (Peitoral trapezoidal + Cintura + Quadril + Pescoço)
          const torso = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.88, 0.31), bodyMat);
          torso.position.y = 1.07;
          const upperChest = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.35), bodyMat);
          upperChest.position.set(0, 0.19, 0.01);
          const waist = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.24, 0.29), bodyMat);
          waist.position.set(0, -0.12, 0);
          const neck = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.16, 0.19), hasBalaclava ? headMat : skinMat);
          neck.position.set(0, 0.48, 0);
          torso.add(upperChest, waist, neck);

          // Braços articulados
          [-0.45, 0.45].forEach((ax, idx) => {
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.60, 0.17), isCT ? bodyMat : skinMat);
            arm.position.set(ax, 1.14, idx === 0 ? 0.14 : 0.22);
            arm.rotation.x = idx === 0 ? -0.55 : -0.75;
            if (!isCT && v !== 2 && v !== 4) {
              const sleeve = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.24, 0.22), bodyMat);
              sleeve.position.set(0, 0.17, 0);
              arm.add(sleeve);
            }
            group.add(arm);
          });

          // Cabeça facetada com mandíbula
          const head = new THREE.Mesh(new THREE.BoxGeometry(0.39, 0.41, 0.41), headMat);
          head.position.y = 1.76;
          const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.13, 0.35), headMat);
          jaw.position.set(0, -0.17, 0.02);
          head.add(jaw);
          group.add(torso, head);

          if (isCT) {
            const vest = new THREE.Mesh(
              new THREE.BoxGeometry(0.64, 0.50, 0.44),
              new THREE.MeshStandardMaterial({ color: 0xffffff, map: getPMVestTex(), roughness: 0.7 })
            );
            vest.position.y = 1.15;
            const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.21, 0.47), darkGearMat);
            helmet.position.set(0, 0.16, 0);
            head.add(helmet);
            group.add(vest);
          } else {
            const chain = new THREE.Mesh(
              new THREE.BoxGeometry(0.28, 0.04, 0.36),
              new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.2 })
            );
            chain.position.y = 1.44;
            if (v === 0 || v === 2 || v === 5) {
              const cap = new THREE.Mesh(
                new THREE.BoxGeometry(0.42, 0.15, 0.43),
                new THREE.MeshStandardMaterial({ color: v === 0 ? 0xd91c24 : 0x141418, roughness: 0.75 })
              );
              cap.position.set(0, 0.16, 0);
              const visor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.04, 0.22), darkGearMat);
              visor.position.set(0, 0.10, v === 2 ? -0.28 : 0.28);
              head.add(cap, visor);
            }
            group.add(chain);
          }

          const sp = spawnList[i % spawnList.length];
          group.position.set(sp[0], 0, sp[1]);
          scene.add(group);
          const wp = ARENA_WAYPOINTS[i % ARENA_WAYPOINTS.length];
          const namePool = isCT ? PM_NAMES : BANDIDO_NAMES;
          const botObj = {
            team: teamName, name: namePool[i % namePool.length],
            group, torso, head, bodyMat, headMat, baseBodyColor, baseHeadColor, hp: 100,
            speed: 4.6 + Math.random() * 0.7,
            attackCooldown: 0.4 + Math.random() * 0.4,
            burstShotsLeft: 3, burstShotTimer: 0,
            strafeDir: Math.random() > 0.5 ? 1 : -1, strafeTimer: 0.9,
            waypointTimer: 3.0,
            patrolGoal: new THREE.Vector3(wp[0], 0, wp[1])
          };
          torso.userData = { bot: botObj, isHead: false };
          head.userData = { bot: botObj, isHead: true };
          bots.push(botObj);
        }
      };

      // 5v5: 4 aliados no time do jogador + 5 inimigos no time oposto
      createTeamBots('CT', player.team === 'CT' ? 4 : 5, ctSpawns);
      createTeamBots('TR', player.team === 'TR' ? 4 : 5, trSpawns);
      updateHUD();
    }

    function takeoverAlliedBot() {
      if (!player.isDead) return;
      const ally = bots.find((b) => b.team === player.team);
      if (!ally) return;
      player.isDead = false;
      player.hp = ally.hp;
      player.pos.set(ally.group.position.x, 1.7, ally.group.position.z);
      scene.remove(ally.group);
      bots.splice(bots.indexOf(ally), 1);
      document.getElementById('center-banner').style.opacity = '0';
      updateHUD();
    }

    function checkRoundVictory(fromTimeout = false) {
      if (player.isRoundEnding) return;
      const ctBots = bots.filter((b) => b.team === 'CT').length + (!player.isDead && player.team === 'CT' ? 1 : 0);
      const trBots = bots.filter((b) => b.team === 'TR').length + (!player.isDead && player.team === 'TR' ? 1 : 0);

      let winner = null;
      if (ctBots === 0) winner = 'TR';
      else if (trBots === 0) winner = 'CT';
      else if (fromTimeout) winner = ctBots >= trBots ? 'CT' : 'TR';

      if (winner) {
        player.isRoundEnding = true;
        if (winner === 'CT') player.ctScore++;
        else player.trScore++;
        player.money = Math.min(16000, player.money + (winner === player.team ? 2400 : 1400));
        const banner = document.getElementById('center-banner');
        banner.textContent = \`\${winner === 'CT' ? 'POLÍCIA MILITAR (PM)' : 'BANDIDOS'} VENCEU O ROUND!\`;
        banner.style.opacity = '1';
        setTimeout(() => { banner.style.opacity = '0'; spawn5v5Round(); }, 2500);
      }
      updateHUD();
    }

    function fireActiveWeapon() {
      if (player.isDead || player.isFreezeActive) return;
      const now = performance.now() / 1000;
      const wKey = getActiveWeaponKey();
      const spec = WEAPONS[wKey];
      if (now - player.lastShot < spec.rate) return;
      player.lastShot = now;

      const raycaster = new THREE.Raycaster();
      const enemyMeshes = [];
      bots.forEach((b) => { if (b.team !== player.team) enemyMeshes.push(b.head, b.torso); });
      const targets = [...enemyMeshes, ...shootableMeshes];

      const pellets = spec.pellets || 1;
      const spread = spec.spread || 0;

      for (let p = 0; p < pellets; p++) {
        const ndcX = pellets > 1 ? (Math.random() - 0.5) * spread * 1.4 : 0;
        const ndcY = pellets > 1 ? (Math.random() - 0.5) * spread * 1.4 : 0;
        raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera);
        if (spec.isMelee) raycaster.far = 3.5;

        const hits = raycaster.intersectObjects(targets, false);
        if (hits.length > 0 && hits[0].object.userData?.bot) {
          const bot = hits[0].object.userData.bot;
          if (bot.hp <= 0) continue;
          const isHead = hits[0].object.userData.isHead;
          bot.hp -= spec.damage * (isHead ? 2.2 : 1);
          bot.bodyMat.color.setHex(0xffffff);
          if (bot.hp <= 0) {
            scene.remove(bot.group);
            const idx = bots.indexOf(bot);
            if (idx !== -1) bots.splice(idx, 1);
            player.kills++;
            player.money += wKey === 'm3' ? 900 : 300;
            checkRoundVictory(false);
          }
        }
      }
      updateHUD();
    }

    function checkWallCollision(px, pz, radius) {
      for (const c of colliders) {
        const cx = Math.max(c.minX, Math.min(px, c.maxX));
        const cz = Math.max(c.minZ, Math.min(pz, c.maxZ));
        if ((px - cx) ** 2 + (pz - cz) ** 2 < radius * radius) return true;
      }
      return false;
    }

    function update(dt) {
      for (let i = tracers.length - 1; i >= 0; i--) {
        const tr = tracers[i];
        tr.life -= dt;
        tr.mesh.material.opacity = Math.max(0, (tr.life / tr.maxLife) * 0.88);
        if (tr.life <= 0) {
          scene.remove(tr.mesh);
          tracers.splice(i, 1);
        }
      }

      if (!isPointerLocked || isBuyMenuOpen) return;

      // Cronômetro Regressivo: 10s de Preparo (Freeze Time) seguidos de 5 Minutos (300s)
      if (player.isFreezeActive) {
        player.freezeTime = Math.max(0, player.freezeTime - dt);
        const fSec = Math.ceil(player.freezeTime);
        if (fSec !== player.lastFreezeSec) {
          player.lastFreezeSec = fSec;
          if (fSec === 3 || fSec === 2 || fSec === 1) playBeep(false);
          updateHUD();
        }
        if (player.freezeTime <= 0) {
          player.isFreezeActive = false;
          player.freezeTime = 0;
          playBeep(true);
          const banner = document.getElementById('center-banner');
          if (banner) {
            banner.textContent = 'COMBATE LIBERADO! VÁ, VÁ, VÁ!';
            banner.style.opacity = '1';
            setTimeout(() => { if (banner.textContent.includes('COMBATE LIBERADO')) banner.style.opacity = '0'; }, 2200);
          }
          updateHUD();
        }
      } else if (!player.isRoundEnding) {
        player.roundTime = Math.max(0, player.roundTime - dt);
        if (player.roundTime <= 0) checkRoundVictory(true);
      }

      if (!player.isDead) {
        if (isMouseDown && !player.isFreezeActive) fireActiveWeapon();
        if (!player.isFreezeActive) {
          const forward = new THREE.Vector3(-Math.sin(player.yaw), 0, -Math.cos(player.yaw));
          const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
          const moveDir = new THREE.Vector3();
          if (keys['KeyW']) moveDir.add(forward);
          if (keys['KeyS']) moveDir.sub(forward);
          if (keys['KeyD']) moveDir.add(right);
          if (keys['KeyA']) moveDir.sub(right);
          if (moveDir.lengthSq() > 0) moveDir.normalize();

          const speed = getActiveWeaponKey() === 'knife' ? 10.2 : 8.2;
          const nx = player.pos.x + moveDir.x * speed * dt;
          const nz = player.pos.z + moveDir.z * speed * dt;
          if (!checkWallCollision(nx, player.pos.z, player.radius)) player.pos.x = nx;
          if (!checkWallCollision(player.pos.x, nz, player.radius)) player.pos.z = nz;
        }

        camera.position.copy(player.pos);
        camera.rotation.y = player.yaw;
        camera.rotation.x = player.pitch;
      } else {
        // Espectando aliado vivo caso o jogador tenha morrido
        const ally = bots.find((b) => b.team === player.team);
        if (ally) {
          camera.position.set(ally.group.position.x, 2.4, ally.group.position.z + 3.5);
          camera.lookAt(ally.group.position.x, 1.2, ally.group.position.z);
        }
      }

      // Durante o tempo de preparo (Freeze Time), os bots aguardam imóveis em suas bases
      if (player.isFreezeActive) {
        updateHUD();
        return;
      }

      // IA TÁTICA 5v5: Prioriza Inimigos Visíveis (LOS), Waypoints, Strafe e Rajadas com Tracers 3D
      const losRay = new THREE.Raycaster();
      const checkLOS = (botPos, targetEye) => {
        const origin = new THREE.Vector3(botPos.x, 1.5, botPos.z);
        const dir = targetEye.clone().sub(origin);
        const dist = dir.length();
        if (dist < 0.2) return true;
        dir.divideScalar(dist);
        losRay.set(origin, dir);
        losRay.far = dist;
        const hits = losRay.intersectObjects(shootableMeshes, false);
        return hits.length === 0 || hits[0].distance >= dist - 0.35;
      };

      for (let i = bots.length - 1; i >= 0; i--) {
        const bot = bots[i];
        if (!bot) continue;
        bot.bodyMat.color.setHex(bot.baseBodyColor);

        let visibleTarget = null, visibleDist = Infinity;
        let hiddenTarget = null, hiddenDist = Infinity;

        bots.forEach((other) => {
          if (other.team !== bot.team) {
            const d = bot.group.position.distanceTo(other.group.position);
            const eye = new THREE.Vector3(other.group.position.x, 1.45, other.group.position.z);
            if (d < 52 && checkLOS(bot.group.position, eye)) {
              if (d < visibleDist) { visibleDist = d; visibleTarget = { isPlayer: false, ref: other, pos: other.group.position }; }
            } else if (d < hiddenDist) {
              hiddenDist = d; hiddenTarget = { isPlayer: false, ref: other, pos: other.group.position };
            }
          }
        });

        if (!player.isDead && player.team !== bot.team) {
          const d = bot.group.position.distanceTo(player.pos);
          if (d < 52 && checkLOS(bot.group.position, player.pos)) {
            if (d < visibleDist) { visibleDist = d; visibleTarget = { isPlayer: true, pos: player.pos }; }
          } else if (d < hiddenDist) {
            hiddenDist = d; hiddenTarget = { isPlayer: true, pos: player.pos };
          }
        }

        const hasLOS = Boolean(visibleTarget);
        const activeTarget = visibleTarget || hiddenTarget;

        bot.waypointTimer -= dt;
        if (!hasLOS && (bot.group.position.distanceTo(bot.patrolGoal) < 2.4 || bot.waypointTimer <= 0)) {
          const wp = ARENA_WAYPOINTS[Math.floor(Math.random() * ARENA_WAYPOINTS.length)];
          bot.patrolGoal.set(wp[0], 0, wp[1]);
          bot.waypointTimer = 3.0 + Math.random() * 2.0;
        }

        const goalPos = hasLOS && activeTarget ? activeTarget.pos : bot.patrolGoal;
        bot.group.lookAt(goalPos.x, 0, goalPos.z);

        bot.strafeTimer -= dt;
        if (bot.strafeTimer <= 0) {
          bot.strafeDir *= -1;
          bot.strafeTimer = 0.8 + Math.random();
        }

        const toT = new THREE.Vector3(goalPos.x - bot.group.position.x, 0, goalPos.z - bot.group.position.z);
        const distToGoal = toT.length();
        if (distToGoal > 0.001) toT.divideScalar(distToGoal);

        const fwdW = hasLOS ? (visibleDist > 13 ? 0.85 : visibleDist < 5.5 ? -0.6 : 0.2) : 1.0;
        const strW = hasLOS ? 0.92 : 0.35;
        let dirX = toT.x * fwdW + (-toT.z * bot.strafeDir) * strW;
        let dirZ = toT.z * fwdW + (toT.x * bot.strafeDir) * strW;
        const len = Math.hypot(dirX, dirZ) || 1;
        dirX /= len; dirZ /= len;

        const baseAngle = Math.atan2(dirX, dirZ);
        const step = bot.speed * dt;
        for (let a = 0; a < STEER_ANGLES.length; a++) {
          const ang = baseAngle + STEER_ANGLES[a] * bot.strafeDir;
          const cx = bot.group.position.x + Math.sin(ang) * step;
          const cz = bot.group.position.z + Math.cos(ang) * step;
          if (!checkWallCollision(cx, cz, 0.55)) {
            bot.group.position.x = cx;
            bot.group.position.z = cz;
            break;
          }
        }

        if (hasLOS && activeTarget && visibleDist < 50) {
          if (bot.burstShotsLeft > 0) {
            bot.burstShotTimer -= dt;
            if (bot.burstShotTimer <= 0) {
              bot.burstShotsLeft--;
              bot.burstShotTimer = 0.14;
              if (bot.burstShotsLeft <= 0) bot.attackCooldown = 0.65 + Math.random() * 0.5;

              const muzzlePos = new THREE.Vector3(bot.group.position.x, 1.35, bot.group.position.z);
              const tracerColor = bot.team === 'CT' ? 0x60a5fa : 0xfbbf24;

              if (activeTarget.isPlayer) {
                const hitPlayer = Math.random() < 0.58;
                const endPos = new THREE.Vector3(
                  player.pos.x + (Math.random() - 0.5) * (hitPlayer ? 0.2 : 1.5),
                  player.pos.y - 0.25,
                  player.pos.z + (Math.random() - 0.5) * (hitPlayer ? 0.2 : 1.5)
                );
                spawnBulletTracer(muzzlePos, endPos, tracerColor);

                if (hitPlayer) {
                  player.hp = Math.max(0, player.hp - 9);
                  if (player.hp <= 0) {
                    player.isDead = true;
                    const banner = document.getElementById('center-banner');
                    banner.textContent = 'VOCÊ CAIU! APERTE [E] PARA ASSUMIR UM BOT ALIADO VIVO!';
                    banner.style.opacity = '1';
                    checkRoundVictory(false);
                  }
                }
              } else if (activeTarget.ref) {
                const endPos = new THREE.Vector3(activeTarget.ref.group.position.x, 1.25, activeTarget.ref.group.position.z);
                spawnBulletTracer(muzzlePos, endPos, tracerColor);
                if (Math.random() < 0.6) {
                  activeTarget.ref.hp -= 18;
                  if (activeTarget.ref.hp <= 0) {
                    scene.remove(activeTarget.ref.group);
                    const idx = bots.indexOf(activeTarget.ref);
                    if (idx !== -1) bots.splice(idx, 1);
                    checkRoundVictory(false);
                  }
                }
              }
            }
          } else {
            bot.attackCooldown -= dt;
            if (bot.attackCooldown <= 0) {
              bot.burstShotsLeft = 3;
              bot.burstShotTimer = 0;
            }
          }
        }
      }
      updateHUD();
    }

    function animate() {
      requestAnimationFrame(animate);
      update(Math.min(clock.getDelta(), 0.05));
      renderer.render(scene, camera);
    }

    function updateHUD() {
      const ctCount = bots.filter((b) => b.team === 'CT').length + (!player.isDead && player.team === 'CT' ? 1 : 0);
      const trCount = bots.filter((b) => b.team === 'TR').length + (!player.isDead && player.team === 'TR' ? 1 : 0);
      document.getElementById('hud-ct-alive').textContent = \`\${ctCount} vivos\`;
      document.getElementById('hud-tr-alive').textContent = \`\${trCount} vivos\`;
      document.getElementById('hud-score').textContent = \`PM \${player.ctScore} · \${player.trScore} Bandidos\`;

      const timerEl = document.getElementById('hud-timer');
      const freezeOverlay = document.getElementById('freeze-overlay');
      const mins = String(Math.floor(player.roundTime / 60)).padStart(2, '0');
      const secs = String(Math.floor(player.roundTime % 60)).padStart(2, '0');
      if (timerEl) {
        timerEl.textContent = \`\${mins}:\${secs}\`;
        timerEl.style.color = player.isFreezeActive ? '#fbbf24' : '#ffffff';
      }

      if (player.isFreezeActive) {
        if (freezeOverlay) {
          freezeOverlay.style.display = 'block';
          const countEl = document.getElementById('freeze-count');
          if (countEl) {
            countEl.textContent = Math.max(1, Math.ceil(player.freezeTime));
            countEl.style.color = Math.ceil(player.freezeTime) <= 3 ? '#f43f5e' : '#fbbf24';
          }
        }
      } else {
        if (freezeOverlay) {
          freezeOverlay.style.display = 'none';
        }
      }

      document.getElementById('hud-hp').textContent = player.hp;
      document.getElementById('hud-money').textContent = \`$\${player.money}\`;
    }

    function init() {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xd8b888);
      scene.fog = new THREE.FogExp2(0xd8b888, 0.015);
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 160);
      camera.rotation.order = 'YXZ';
      scene.add(camera);

      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      document.getElementById('game-container').appendChild(renderer.domElement);

      scene.add(new THREE.HemisphereLight(0xfff3d6, 0x9c7a54, 0.9));
      const sun = new THREE.DirectionalLight(0xfff0cc, 1.3);
      sun.position.set(25, 42, 20);
      scene.add(sun);

      const floor = new THREE.Mesh(new THREE.PlaneGeometry(64, 64), new THREE.MeshStandardMaterial({ color: 0xe3c18f, roughness: 0.9 }));
      floor.rotation.x = -Math.PI / 2;
      scene.add(floor);
      shootableMeshes.push(floor);

      const wallMat = new THREE.MeshStandardMaterial({ color: 0xc9a675, roughness: 0.85 });
      const crateMat = new THREE.MeshStandardMaterial({ color: 0x9c6635, roughness: 0.78 });

      addBlock(0, 4, -28, 56, 8, 2, wallMat);
      addBlock(0, 4,  28, 56, 8, 2, wallMat);
      addBlock(-28, 4, 0, 2, 8, 56, wallMat);
      addBlock( 28, 4, 0, 2, 8, 56, wallMat);
      addBlock(-10, 3, -4, 2, 6, 18, wallMat);
      addBlock( 10, 3,  4, 2, 6, 18, wallMat);
      [[-4, 1.2, 10], [5, 1.2, 12], [-16, 1.2, 8], [16, 1.2, -10], [0, 1.2, 0]].forEach(([x, y, z]) =>
        addBlock(x, y, z, 2.4, 2.4, 2.4, crateMat)
      );

      spawn5v5Round();

      const showMenuView = (viewId) => {
        ['menu-view-main', 'menu-view-team', 'menu-view-arsenal', 'menu-view-controls'].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.style.display = id === viewId ? 'block' : 'none';
        });
      };

      document.getElementById('start-game-btn')?.addEventListener('click', () => {
        renderer.domElement.requestPointerLock();
      });
      document.getElementById('open-team-btn')?.addEventListener('click', () => showMenuView('menu-view-team'));
      document.getElementById('open-arsenal-btn')?.addEventListener('click', () => showMenuView('menu-view-arsenal'));
      document.getElementById('open-controls-btn')?.addEventListener('click', () => showMenuView('menu-view-controls'));
      document.getElementById('back-to-menu-btn1')?.addEventListener('click', () => showMenuView('menu-view-main'));
      document.getElementById('back-to-menu-btn2')?.addEventListener('click', () => showMenuView('menu-view-main'));
      document.getElementById('back-to-menu-btn3')?.addEventListener('click', () => showMenuView('menu-view-main'));

      const SENS_STORAGE_KEY = 'cs16_mouse_sensitivity';
      const sanitizeSensitivity = (raw) => {
        const parsed = parseFloat(String(raw ?? ''));
        if (!Number.isFinite(parsed)) return 2.0;
        const clamped = Math.max(0.1, Math.min(10.0, parsed));
        return Math.round(clamped * 10) / 10;
      };
      let mouseSensitivity = (() => {
        try {
          const saved = window.localStorage.getItem(SENS_STORAGE_KEY);
          return saved !== null ? sanitizeSensitivity(saved) : 2.0;
        } catch {
          return 2.0;
        }
      })();

      const syncSensitivityUI = (nextVal) => {
        mouseSensitivity = sanitizeSensitivity(nextVal);
        try {
          window.localStorage.setItem(SENS_STORAGE_KEY, mouseSensitivity.toFixed(1));
        } catch {}
        const formatted = mouseSensitivity.toFixed(1);
        const sMain = document.getElementById('sens-slider-main');
        const sCtrl = document.getElementById('sens-slider-controls');
        const vMain = document.getElementById('sens-val-main');
        const vCtrl = document.getElementById('sens-val-controls');
        if (sMain) sMain.value = String(mouseSensitivity);
        if (sCtrl) sCtrl.value = String(mouseSensitivity);
        if (vMain) vMain.textContent = formatted;
        if (vCtrl) vCtrl.textContent = formatted;
      };

      syncSensitivityUI(mouseSensitivity);
      document.getElementById('sens-slider-main')?.addEventListener('input', (e) => syncSensitivityUI(e.target.value));
      document.getElementById('sens-slider-controls')?.addEventListener('input', (e) => syncSensitivityUI(e.target.value));
      document.getElementById('sens-reset-main')?.addEventListener('click', () => syncSensitivityUI(2.0));
      document.getElementById('sens-reset-controls')?.addEventListener('click', () => syncSensitivityUI(2.0));

      document.getElementById('join-ct-btn')?.addEventListener('click', () => {
        player.team = 'CT'; spawn5v5Round(); renderer.domElement.requestPointerLock();
      });
      document.getElementById('join-tr-btn')?.addEventListener('click', () => {
        player.team = 'TR'; spawn5v5Round(); renderer.domElement.requestPointerLock();
      });
      document.addEventListener('pointerlockchange', () => {
        isPointerLocked = document.pointerLockElement === renderer.domElement;
        const ov = document.getElementById('overlay-screen');
        if (ov) {
          ov.style.display = isPointerLocked ? 'none' : 'flex';
          if (!isPointerLocked) showMenuView('menu-view-main');
        }
      });
      window.addEventListener('mousedown', (e) => { if (isPointerLocked && e.button === 0) isMouseDown = true; });
      window.addEventListener('mouseup', (e) => { if (e.button === 0) isMouseDown = false; });
      window.addEventListener('mousemove', (e) => {
        if (!isPointerLocked) return;
        const sens = 0.0011 * mouseSensitivity;
        player.yaw -= e.movementX * sens;
        player.pitch = Math.max(-1.4, Math.min(1.4, player.pitch - e.movementY * sens));
      });
      window.addEventListener('keydown', (e) => {
        keys[e.code] = true;
        if ((e.code === 'Enter' || e.code === 'Space') && !isPointerLocked) {
          renderer.domElement.requestPointerLock();
        }
        if (e.code === 'KeyE' && player.isDead) takeoverAlliedBot();
        if (e.code === 'KeyQ' && !player.isDead) {
          player.activeIndex = (player.activeIndex + 1) % player.loadout.length;
          buildViewmodel();
        }
      });
      window.addEventListener('keyup', (e) => { keys[e.code] = false; });

      clock = new THREE.Clock();
      animate();
    }
    init();
  </script>
</body>
</html>`;
