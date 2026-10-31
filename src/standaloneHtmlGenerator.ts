/**
 * Gerador do arquivo único index.html autônomo (CS 1.6 Tactical Arena - Dust II)
 * Inclui:
 * - Modo Competitivo 5v5 (Escolha entre CT Azul e Terrorista Vermelho: Jogador + 4 Bots Aliados vs 5 Bots Inimigos)
 * - Bot Takeover na Tecla [E] (Assumir o controle de um bot aliado vivo se você morrer no round)
 * - Cronômetro de 5 Minutos (05:00) por round
 * - Faca Tática inicial na mão + Troca de arma no inventário na Tecla [Q] (1 arma na mão por vez)
 * - Mira Telescópica da AWP (Clique Direito 2x/4x) e Música Tática via Web Audio API
 */

export interface WeaponSpec {
  id: string;
  name: string;
  shortName: string;
  category: string;
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
}

export const WEAPON_CATALOG: Record<string, WeaponSpec> = {
  knife: {
    id: 'knife',
    name: 'Faca Tática Combat Knife',
    shortName: 'Faca Tática',
    category: 'Corpo a Corpo (Inicial)',
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
  },
  usp: {
    id: 'usp',
    name: 'USP .45 Tactical',
    shortName: 'USP .45',
    category: 'Pistola Tática',
    price: 0,
    damage: 28,
    headshotMult: 2.5,
    fireRateMs: 190,
    clipSize: 12,
    reserveMax: 48,
    reloadTimeMs: 1400,
    recoilKick: 0.055,
    spread: 0.008,
    auto: false,
    killReward: 300,
    bodyColor: 0x2b3036,
    accentColor: 0x18181b,
    lengthScale: 0.72,
  },
  deagle: {
    id: 'deagle',
    name: 'Night Hawk .50C (Deagle)',
    shortName: 'Desert Eagle',
    category: 'Pistola Pesada (.50 AE)',
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
    bodyColor: 0xe2e8f0, // Ferrolho Cromado Prateado
    accentColor: 0x18181b, // Punho Anatômico Preto
    lengthScale: 0.85,
  },
  m3: {
    id: 'm3',
    name: 'Leone 12 Gauge Super (Shotgun)',
    shortName: 'Shotgun M3',
    category: 'Escopeta Pump-Action (8 Balins)',
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
  },
  mp5: {
    id: 'mp5',
    name: 'KM Sub-Machine Gun (MP5)',
    shortName: 'MP5 Navy',
    category: 'Submetralhadora',
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
  },
  ak47: {
    id: 'ak47',
    name: 'CV-47 (AK-47)',
    shortName: 'AK-47',
    category: 'Rifle de Assalto',
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
    bodyColor: 0x33373b,
    accentColor: 0x8b4a24,
    lengthScale: 1.15,
  },
  m4a1: {
    id: 'm4a1',
    name: 'Maverick M4A1 Carbine',
    shortName: 'M4A1 Carbine',
    category: 'Rifle Tático',
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
  },
  awp: {
    id: 'awp',
    name: 'Magnum Sniper Rifle (AWP)',
    shortName: 'AWP Sniper',
    category: 'Rifle de Precisão',
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
      <span id="hud-score">CT 0 · 0 TR</span>
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
        <button class="menu-btn primary" id="start-game-btn">▶ JOGAR 5v5 COMPETITIVO (INICIAR)</button>
        <button class="menu-btn" id="open-team-btn">🛡 ESCOLHER TIME (CONTRA-TERRORISTAS vs TERRORISTAS)</button>
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
            <h3>CONTRA-TERRORISTAS (CT)</h3>
            <p style="font-size: 11px;">Defesa Azul · M4A1, USP e Kits Táticos</p>
          </div>
          <div class="team-card tr" id="join-tr-btn">
            <h3>TERRORISTAS (TR)</h3>
            <p style="font-size: 11px;">Assalto Vermelho · AK-47, Deagle e Flanqueamento</p>
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

    const WEAPONS = {
      knife:  { name: 'Faca Tática',  price: 0,    damage: 45, clip: 1,  reserve: 1,   rate: 0.35, recoil: 0.08, isMelee: true },
      usp:    { name: 'USP .45',      price: 0,    damage: 28, clip: 12, reserve: 48,  rate: 0.19, recoil: 0.05 },
      deagle: { name: 'Desert Eagle', price: 650,  damage: 54, clip: 7,  reserve: 35,  rate: 0.30, recoil: 0.10 },
      m3:     { name: 'Shotgun M3',   price: 1700, damage: 22, clip: 8,  reserve: 32,  rate: 0.88, recoil: 0.14, pellets: 8, spread: 0.068 },
      mp5:    { name: 'MP5 Navy',     price: 1500, damage: 26, clip: 30, reserve: 120, rate: 0.09, recoil: 0.04 },
      ak47:   { name: 'AK-47',        price: 2500, damage: 36, clip: 30, reserve: 90,  rate: 0.10, recoil: 0.07 },
      m4a1:   { name: 'M4A1 Carbine', price: 3100, damage: 33, clip: 30, reserve: 90,  rate: 0.09, recoil: 0.05 },
      awp:    { name: 'AWP Sniper',   price: 4750, damage: 115, clip: 10, reserve: 30, rate: 0.95, recoil: 0.16, hasScope: true }
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

    function buildViewmodel() {
      if (weaponGroup) camera.remove(weaponGroup);
      weaponGroup = new THREE.Group();
      const wKey = getActiveWeaponKey();
      const sleeveMat = new THREE.MeshStandardMaterial({ color: player.team === 'CT' ? 0x1e3a8a : 0x7f1d1d });
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.42), sleeveMat);
      arm.position.set(0.24, -0.25, -0.32);
      weaponGroup.add(arm);

      if (wKey === 'deagle' || wKey === 'usp') {
        // Modelo 3D Autêntico de Pistola (Ferrolho Cromado Prateado na Deagle + Punho Anatômico Preto)
        const slideMat = new THREE.MeshStandardMaterial({
          color: wKey === 'deagle' ? 0xe2e8f0 : 0x2b3036,
          metalness: wKey === 'deagle' ? 0.92 : 0.7,
          roughness: wKey === 'deagle' ? 0.16 : 0.35
        });
        const gripMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.78 });
        const slide = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.072, wKey === 'deagle' ? 0.32 : 0.24), slideMat);
        slide.position.set(0.21, -0.135, -0.53);
        const grip = new THREE.Mesh(new THREE.BoxGeometry(0.048, 0.15, 0.076), gripMat);
        grip.position.set(0.21, -0.22, -0.43);
        grip.rotation.x = -0.26;
        weaponGroup.add(slide, grip);
      } else if (wKey === 'm3') {
        // Modelo 3D da Shotgun M3 (Cano 12G + Tubo Inferior + Telha Pump-Action)
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.75, roughness: 0.32 });
        const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.72 });
        const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.095, 0.36), bodyMat);
        receiver.position.set(0.21, -0.16, -0.46);
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.62, 12), bodyMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0.21, -0.135, -0.82);
        const tubeMag = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.56, 12), bodyMat);
        tubeMag.rotation.x = Math.PI / 2;
        tubeMag.position.set(0.21, -0.168, -0.79);
        const pump = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.24, 12), woodMat);
        pump.rotation.x = Math.PI / 2;
        pump.position.set(0.21, -0.168, -0.74);
        weaponGroup.add(receiver, barrel, tubeMag, pump);
      } else {
        const metalMat = new THREE.MeshStandardMaterial({ color: wKey === 'knife' ? 0xd1d5db : 0x262a2e, metalness: 0.75, roughness: 0.35 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(wKey === 'knife' ? 0.02 : 0.07, 0.08, wKey === 'knife' ? 0.34 : 0.48), metalMat);
        body.position.set(0.22, -0.17, -0.58);
        weaponGroup.add(body);
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
          const group = new THREE.Group();
          const isCT = teamName === 'CT';
          const bodyMat = new THREE.MeshStandardMaterial({ color: isCT ? 0x1d4ed8 : 0xb91c1c });
          const headMat = new THREE.MeshStandardMaterial({ color: isCT ? 0x3b82f6 : 0xef4444 });
          const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.45, 1.25, 12), bodyMat);
          torso.position.y = 0.625;
          const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.46, 0.46), headMat);
          head.position.y = 1.52;
          group.add(torso, head);
          const sp = spawnList[i % spawnList.length];
          group.position.set(sp[0], 0, sp[1]);
          scene.add(group);
          const wp = ARENA_WAYPOINTS[i % ARENA_WAYPOINTS.length];
          const botObj = {
            team: teamName, name: \`\${teamName}_Bot_\${i + 1}\`,
            group, torso, head, bodyMat, headMat, hp: 100,
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
        banner.textContent = \`EQUIPE \${winner} VENCEU O ROUND!\`;
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
        bot.bodyMat.color.setHex(bot.team === 'CT' ? 0x1d4ed8 : 0xb91c1c);

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
      document.getElementById('hud-score').textContent = \`CT \${player.ctScore} · \${player.trScore} TR\`;

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
        player.yaw -= e.movementX * 0.0022;
        player.pitch = Math.max(-1.4, Math.min(1.4, player.pitch - e.movementY * 0.0022));
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
