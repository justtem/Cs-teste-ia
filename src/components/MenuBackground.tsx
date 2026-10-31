/**
 * Arte Panorâmica e Atmosfera de Fundo da Dust II para o Menu de Iniciar
 * Renderiza iluminação cinematográfica do deserto, poeira suspensa em suspensão,
 * silhuetas táticas de operadores CT e TR, caixas militares e arcos da Dust II.
 */

import React from 'react';

interface MenuBackgroundProps {
  styleMode?: 'dust2' | 'sandstorm' | 'tactical_night';
}

export const MenuBackground: React.FC<MenuBackgroundProps> = ({ styleMode = 'dust2' }) => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Céu Desértico com Gradiente Atmosférico */}
      <div
        className={`absolute inset-0 w-full h-full transition-all duration-700 ${
          styleMode === 'tactical_night'
            ? 'bg-gradient-to-b from-[#0b1016] via-[#111923] to-[#1c2732]'
            : styleMode === 'sandstorm'
            ? 'bg-gradient-to-b from-[#78350f] via-[#b45309] to-[#d97706]'
            : 'bg-gradient-to-b from-[#1c1917] via-[#451a03] to-[#78350f]'
        }`}
      />

      {/* 2. Sol da Dust II e Brilho Radiante */}
      <div
        className="absolute top-[-10%] right-[18%] w-[620px] h-[620px] rounded-full blur-3xl opacity-60"
        style={{
          background:
            styleMode === 'tactical_night'
              ? 'radial-gradient(circle, rgba(56,189,248,0.4) 0%, rgba(30,58,138,0.1) 70%, transparent 100%)'
              : 'radial-gradient(circle, rgba(251,191,36,0.65) 0%, rgba(217,119,6,0.3) 55%, transparent 100%)',
        }}
      />

      {/* 3. Feixes de Luz e Névoa de Poeira Militar (Sun Rays) */}
      <div
        className="absolute inset-0 opacity-25 mix-blend-screen"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(254, 240, 138, 0.08) 40px, rgba(254, 240, 138, 0.08) 80px)',
        }}
      />

      {/* 4. Arte Vetorial Panorâmica da Dust II (Arcos, Minaretes, Caixas e Operadores) */}
      <svg
        className="absolute bottom-0 left-0 w-full h-[85%] object-cover opacity-90"
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax slice"
      >
        <defs>
          <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#291e13" />
            <stop offset="100%" stopColor="#0d0905" />
          </linearGradient>
          <linearGradient id="gateGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3d2c1c" />
            <stop offset="60%" stopColor="#1f150c" />
            <stop offset="100%" stopColor="#080503" />
          </linearGradient>
          <linearGradient id="crateGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#573e26" />
            <stop offset="100%" stopColor="#1a120a" />
          </linearGradient>
          <linearGradient id="ctGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#09101d" />
          </linearGradient>
          <linearGradient id="trGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7f1d1d" />
            <stop offset="100%" stopColor="#1a0606" />
          </linearGradient>
        </defs>

        {/* Camada Distante: Montanhas de Areia e Minaretes */}
        <path
          d="M0 640 Q 320 560 680 620 T 1320 600 T 1920 630 L 1920 1080 L 0 1080 Z"
          fill="#17120c"
          opacity="0.85"
        />
        {/* Minarete ao longe */}
        <path
          d="M1420 480 L 1432 410 L 1444 480 L 1440 620 L 1424 620 Z"
          fill="#1f1810"
        />
        <circle cx="1432" cy="405" r="5" fill="#f59e0b" opacity="0.8" />

        {/* Muralhas e Torres Fortificadas de Dust II */}
        <path
          d="M-40 520 L 480 500 L 510 590 L 1100 580 L 1120 460 L 1380 460 L 1400 590 L 1960 550 L 1960 1080 L -40 1080 Z"
          fill="url(#wallGrad)"
        />

        {/* Famoso Portão Duplo de Arco de Pedra da Dust II (Meio / Middle Gate) */}
        <g transform="translate(680, 360)">
          {/* Pilar Esquerdo */}
          <rect x="0" y="80" width="110" height="520" fill="url(#gateGrad)" />
          {/* Pilar Direito */}
          <rect x="360" y="80" width="110" height="520" fill="url(#gateGrad)" />
          {/* Arco Superior */}
          <path
            d="M 0 80 Q 235 -60 470 80 L 470 170 Q 235 30 0 170 Z"
            fill="url(#gateGrad)"
          />
          {/* Abertura do Portão (Luz vinda do outro lado da arena) */}
          <path
            d="M 110 150 Q 235 50 360 150 L 360 600 L 110 600 Z"
            fill="#d97706"
            opacity="0.35"
          />
          {/* Portas de Madeira Reforçadas Entreabertas */}
          <polygon points="110,150 200,180 200,600 110,600" fill="#291a0c" />
          <polygon points="360,150 270,180 270,600 360,600" fill="#1f140a" />
        </g>

        {/* Pilha de Caixas Táticas Militares (Dust II Wooden Crates) */}
        <g transform="translate(320, 680)">
          <rect x="0" y="60" width="170" height="170" fill="url(#crateGrad)" stroke="#78350f" strokeWidth="3" />
          <line x1="0" y1="60" x2="170" y2="230" stroke="#78350f" strokeWidth="2" opacity="0.6" />
          <line x1="170" y1="60" x2="0" y2="230" stroke="#78350f" strokeWidth="2" opacity="0.6" />

          <rect x="150" y="100" width="140" height="130" fill="url(#crateGrad)" stroke="#78350f" strokeWidth="3" />
          <line x1="150" y1="100" x2="290" y2="230" stroke="#78350f" strokeWidth="2" opacity="0.6" />

          <rect x="60" y="-50" width="140" height="110" fill="url(#crateGrad)" stroke="#92400e" strokeWidth="3" />
          <line x1="60" y1="-50" x2="200" y2="60" stroke="#92400e" strokeWidth="2" opacity="0.6" />
        </g>

        <g transform="translate(1320, 640)">
          <rect x="40" y="40" width="190" height="190" fill="url(#crateGrad)" stroke="#78350f" strokeWidth="3" />
          <line x1="40" y1="40" x2="230" y2="230" stroke="#78350f" strokeWidth="2" opacity="0.6" />
          <rect x="-70" y="90" width="140" height="140" fill="url(#crateGrad)" stroke="#78350f" strokeWidth="3" />
        </g>

        {/* Silhueta Operador CT (Contra-Terrorista) com Fuzil M4A1 em Posição Tática */}
        <g transform="translate(1480, 520)">
          {/* Halo Rim-Light Azul do CT */}
          <ellipse cx="90" cy="120" rx="65" ry="140" fill="#3b82f6" opacity="0.25" filter="blur(18px)" />
          {/* Cabeça e Capacete com Óculos Balísticos */}
          <circle cx="85" cy="55" r="28" fill="#1e3a8a" />
          <rect x="70" y="52" width="34" height="10" rx="3" fill="#60a5fa" opacity="0.9" />
          {/* Colete Balístico e Ombros */}
          <path d="M 45 85 L 125 85 L 140 220 L 30 220 Z" fill="url(#ctGrad)" />
          {/* Braço e Fuzil M4A1 erguido */}
          <path d="M 80 110 L 210 95 L 210 115 L 110 145 Z" fill="#0f172a" />
          <rect x="180" y="88" width="130" height="14" fill="#1e293b" />
          <rect x="230" y="78" width="40" height="10" fill="#334155" /> {/* Luneta */}
          {/* Pernas e Botas Táticas */}
          <rect x="45" y="220" width="35" height="230" fill="#09101d" />
          <rect x="95" y="220" width="35" height="230" fill="#09101d" />
        </g>

        {/* Silhueta Operador TR (Terrorista) com AK-47 do Lado Esquerdo */}
        <g transform="translate(190, 550)">
          {/* Halo Rim-Light Vermelho do TR */}
          <ellipse cx="80" cy="120" rx="60" ry="130" fill="#ef4444" opacity="0.22" filter="blur(16px)" />
          {/* Cabeça com Balaclava Típica Terrorista */}
          <circle cx="75" cy="55" r="26" fill="#7f1d1d" />
          <rect x="68" y="52" width="22" height="8" rx="2" fill="#111" />
          {/* Torso e Bandoleira */}
          <path d="M 40 85 L 115 85 L 125 210 L 35 210 Z" fill="url(#trGrad)" />
          <line x1="45" y1="88" x2="115" y2="195" stroke="#fbbf24" strokeWidth="6" opacity="0.6" />
          {/* AK-47 apontada */}
          <path d="M 70 110 L -40 100 L -40 115 L 60 140 Z" fill="#1c1917" />
          <rect x="-90" y="96" width="110" height="13" fill="#292524" />
          <path d="M -30 110 Q -50 145 -35 170 L -25 168 Q -40 140 -20 110 Z" fill="#d97706" /> {/* Pente Banana */}
          {/* Pernas */}
          <rect x="42" y="210" width="34" height="210" fill="#140606" />
          <rect x="85" y="210" width="34" height="210" fill="#140606" />
        </g>

        {/* Chão Desértico Foreground */}
        <rect x="0" y="940" width="1920" height="140" fill="#090704" />
      </svg>

      {/* 5. Partículas Animadas de Poeira Flutuante (Efeito de Tempestade de Areia Viva) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(24)].map((_, i) => {
          const size = 3 + (i % 4) * 2;
          const left = (i * 4.3 + 2) % 100;
          const animDelay = (i * 0.4) % 6;
          const duration = 6 + (i % 5) * 1.8;
          return (
            <div
              key={i}
              className="absolute rounded-full bg-[#fbbf24] opacity-30 animate-pulse"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${left}%`,
                top: `${(i * 7) % 95}%`,
                filter: 'blur(1px)',
                animation: `floatDust ${duration}s ease-in-out infinite`,
                animationDelay: `${animDelay}s`,
              }}
            />
          );
        })}
      </div>

      {/* 6. Vinheta Cinematográfica Suave nas Bordas (Garante Legibilidade Máxima das Opções) */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(10, 14, 10, 0.25) 0%, rgba(5, 7, 5, 0.75) 70%, rgba(3, 4, 3, 0.95) 100%)',
        }}
      />

      {/* Degradê Lateral Esquerdo para destacar a Coluna do Menu */}
      <div className="absolute inset-y-0 left-0 w-[580px] bg-gradient-to-r from-[#070b07fa] via-[#090d09e0] to-transparent" />

      {/* Estilos CSS Inline para Animação de Poeira */}
      <style>{`
        @keyframes floatDust {
          0% { transform: translateY(0px) translateX(0px); opacity: 0.15; }
          50% { transform: translateY(-35px) translateX(25px); opacity: 0.45; }
          100% { transform: translateY(-70px) translateX(50px); opacity: 0.05; }
        }
      `}</style>
    </div>
  );
};
