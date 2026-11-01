/**
 * Sintetizador de Áudio e Música Procedural via Web Audio API (100% Sem API Key e Sem .mp3 externos)
 * Gera:
 * - Disparos por categoria de arma
 * - Corte rápido e estocada pesada da Faca Tática
 * - Clique óptico da Luneta AWP (Zoom 2x / 4x)
 * - Recarga, Headshot ding, compra e vitória de ronda
 * - Sequenciador Musical Multi-Faixa em tempo real (3 trilhas táticas estilo CS 1.6)
 */

export type MusicTrackId = 'cs_tactical' | 'dust_breakbeat' | 'stealth_pulse';

export class TacticalAudioEngine {
  private ctx: AudioContext | null = null;
  public muted = false;
  public musicPlaying = false;
  public currentTrack: MusicTrackId = 'cs_tactical';
  private musicIntervalId: number | null = null;
  private stepIndex = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * 1. Disparo de arma de fogo (Ruído branco filtrado + pulso grave de coice)
   */
  public playGunshot(weaponId: string): void {
    if (weaponId === 'knife') {
      this.playKnifeSwing(false);
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const pitchMap: Record<string, number> = {
      usp: 1.35,
      glock17: 1.42,
      glock19: 1.48,
      pt92: 1.28,
      th9: 1.32,
      deagle: 0.78,
      revolver_38: 0.94,
      revolver_357: 0.82,
      revolver_44: 0.72,
      sawed_off: 0.58,
      shotgun_short: 0.62,
      m3: 0.64,
      cbc_pump: 0.68,
      mp5: 1.25,
      smg_tactical: 1.18,
      ak47: 0.9,
      g3: 0.76,
      parafal: 0.74,
      ia2: 1.04,
      m4a1: 1.08,
      bullpup_aug: 1.02,
      sniper_scout: 0.72,
      sniper_dmr: 0.68,
      awp: 0.56,
      sniper_barrett: 0.46,
    };
    const pitch = pitchMap[weaponId] ?? 1.0;
    const isShotgun =
      weaponId === 'm3' ||
      weaponId === 'cbc_pump' ||
      weaponId === 'sawed_off' ||
      weaponId === 'shotgun_short';
    const isHeavyBattleRifle =
      weaponId === 'parafal' ||
      weaponId === 'g3' ||
      weaponId === 'revolver_44' ||
      weaponId === 'sniper_dmr';
    const isHeavySniper =
      weaponId === 'awp' || weaponId === 'sniper_barrett' || weaponId === 'sniper_scout';
    const duration = isHeavySniper
      ? 0.36
      : isShotgun
      ? 0.29
      : isHeavyBattleRifle
      ? 0.21
      : 0.16;

    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1150 * pitch, now);
    filter.Q.setValueAtTime(0.85, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(
      isShotgun || isHeavySniper ? 0.5 : isHeavyBattleRifle ? 0.43 : 0.38,
      now
    );
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noiseSource.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(now);

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(165 * pitch, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.12);
    oscGain.gain.setValueAtTime(
      isShotgun || isHeavySniper ? 0.4 : isHeavyBattleRifle ? 0.35 : 0.3,
      now
    );
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);

    // Som mecânico da telha Pump-Action ("chk-chk") após disparo da Shotgun M3, Cruiser 12G ou CBC Pump Military
    if (weaponId === 'm3' || weaponId === 'cbc_pump' || weaponId === 'shotgun_short') {
      [0.24, 0.36].forEach((offset, idx) => {
        const rackOsc = ctx.createOscillator();
        const rackGain = ctx.createGain();
        rackOsc.type = 'triangle';
        rackOsc.frequency.setValueAtTime(idx === 0 ? 520 : 690, now + offset);
        rackOsc.frequency.exponentialRampToValueAtTime(190, now + offset + 0.06);
        rackGain.gain.setValueAtTime(0.16, now + offset);
        rackGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);
        rackOsc.connect(rackGain);
        rackGain.connect(ctx.destination);
        rackOsc.start(now + offset);
        rackOsc.stop(now + offset + 0.06);
      });
    }
  }

  /**
   * 1B. Disparo espacializado de Bot (AK-47 / M4A1 atenuado pela distância em metros)
   */
  public playBotGunshot(distanceMeters: number, isCT: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const attenuation = Math.max(0.03, Math.min(0.24, 3.2 / (distanceMeters + 8)));
    const now = ctx.currentTime;
    const pitch = isCT ? 1.12 : 0.88;
    const dur = 0.11;

    const bufferSize = Math.floor(ctx.sampleRate * dur);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1050 * pitch, now);
    filter.Q.setValueAtTime(1.1, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(attenuation, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noiseSource.start(now);
  }

  /**
   * 2. Golpe de Faca Tática (Corte Rápido ou Estocada Pesada)
   */
  public playKnifeSwing(isHeavyStab: boolean, hitTarget = false): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = isHeavyStab ? 0.18 : 0.11;

    // Ruído de vento (Whoosh)
    const bufLen = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.sin((i / bufLen) * Math.PI);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(isHeavyStab ? 680 : 1200, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);

    // Ressonância metálica da lâmina caso atinja superfície ou inimigo
    if (hitTarget) {
      const ring = ctx.createOscillator();
      const ringGain = ctx.createGain();
      ring.type = 'triangle';
      ring.frequency.setValueAtTime(isHeavyStab ? 920 : 1480, now);
      ring.frequency.exponentialRampToValueAtTime(240, now + 0.12);
      ringGain.gain.setValueAtTime(0.24, now);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      ring.connect(ringGain);
      ringGain.connect(ctx.destination);
      ring.start(now);
      ring.stop(now + 0.12);
    }
  }

  /**
   * 3. Som mecânico da Luneta AWP (Zoom In / Zoom Out)
   */
  public playScopeZoom(zoomLevel: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const baseFreq = zoomLevel === 0 ? 420 : zoomLevel === 1 ? 680 : 920;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, now + 0.055);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.055);
  }

  /**
   * 4. Recarga da arma (Bipes curtos mecânicos)
   */
  public playReload(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const steps = [
      { delay: 0.0, freq: 380, dur: 0.055 },
      { delay: 0.24, freq: 510, dur: 0.06 },
      { delay: 0.62, freq: 690, dur: 0.075 },
    ];

    steps.forEach(({ delay, freq, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + delay);
      gain.gain.setValueAtTime(0.11, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + delay);
      osc.stop(now + delay + dur);
    });
  }

  /**
   * 5. Som de dano / morte do inimigo (com sino agudo em caso de Headshot)
   */
  public playEnemyHit(isHeadshot: boolean, isFatal: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isHeadshot ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isHeadshot ? 1420 : 310, now);
    osc.frequency.exponentialRampToValueAtTime(isFatal ? 88 : 195, now + 0.16);
    gain.gain.setValueAtTime(isHeadshot ? 0.28 : 0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.16);

    if (isHeadshot) {
      const ding = ctx.createOscillator();
      const dingGain = ctx.createGain();
      ding.type = 'sine';
      ding.frequency.setValueAtTime(2150, now + 0.02);
      dingGain.gain.setValueAtTime(0.18, now + 0.02);
      dingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      ding.connect(dingGain);
      dingGain.connect(ctx.destination);
      ding.start(now + 0.02);
      ding.stop(now + 0.22);
    }
  }

  /**
   * 6. Som de dano sofrido pelo jogador
   */
  public playPlayerDamage(): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.exponentialRampToValueAtTime(52, now + 0.14);
    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  /**
   * 7. Som de compra na loja (Tecla B) ou vitória de ronda
   */
  public playBuyOrRoundChime(isVictory = false): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = isVictory ? [523.25, 659.25, 783.99, 1046.5] : [587.33, 880];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.14, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.16);
    });
  }

  /**
   * 8. Bipe Tático de Contagem Regressiva (Pre-Round Freeze Time)
   * isFinal = false: Bipe curto e agudo nos últimos 3, 2, 1 segundos (880 Hz)
   * isFinal = true: Sinal triunfante de liberação de combate ("VÁ! VÁ! VÁ!") em acorde duplo (1174Hz / 1760Hz)
   */
  public playCountdownBeep(isFinal: boolean): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (!isFinal) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.085);
    } else {
      [1174.66, 1760].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.26, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.24);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.24);
      });
    }
  }

  /* ==========================================================================
     SEQUENCIADOR MUSICAL TÁTICO PROCEDURAL (WEB AUDIO API)
     ========================================================================== */
  public startMusic(track?: MusicTrackId): void {
    if (track) this.currentTrack = track;
    this.stopMusic();
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.musicPlaying = true;
    this.stepIndex = 0;

    const stepMs = this.currentTrack === 'dust_breakbeat' ? 115 : 140;
    this.musicIntervalId = window.setInterval(() => {
      if (this.muted || !this.musicPlaying) return;
      this.playMusicStep(this.stepIndex);
      this.stepIndex = (this.stepIndex + 1) % 16;
    }, stepMs);
  }

  public stopMusic(): void {
    this.musicPlaying = false;
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  public toggleMusic(): boolean {
    if (this.musicPlaying) {
      this.stopMusic();
      return false;
    } else {
      this.startMusic();
      return true;
    }
  }

  private playMusicStep(step: number): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Padrões musicais em Ré Menor / Frígio Dominante (Estilo Deserto / CS 1.6)
    const bassPatterns: Record<MusicTrackId, number[]> = {
      cs_tactical: [
        73.42, 73.42, 0, 73.42, 87.31, 0, 82.41, 73.42,
        73.42, 0, 110.0, 73.42, 98.0, 87.31, 82.41, 0,
      ],
      dust_breakbeat: [
        73.42, 146.83, 73.42, 0, 77.78, 155.56, 73.42, 0,
        92.5, 73.42, 110.0, 0, 87.31, 82.41, 77.78, 73.42,
      ],
      stealth_pulse: [
        55.0, 0, 55.0, 0, 65.41, 0, 61.74, 0,
        55.0, 0, 73.42, 0, 65.41, 0, 58.27, 0,
      ],
    };

    const leadPatterns: Record<MusicTrackId, number[]> = {
      cs_tactical: [
        293.66, 0, 349.23, 0, 440.0, 0, 392.0, 349.23,
        329.63, 0, 293.66, 0, 349.23, 329.63, 293.66, 0,
      ],
      dust_breakbeat: [
        293.66, 311.13, 370.0, 440.0, 0, 370.0, 311.13, 293.66,
        440.0, 0, 466.16, 440.0, 370.0, 311.13, 293.66, 0,
      ],
      stealth_pulse: [
        220.0, 0, 0, 261.63, 0, 0, 246.94, 0,
        220.0, 0, 0, 293.66, 0, 0, 261.63, 0,
      ],
    };

    // 1. Bumbo Tático (Kick nos tempos fortes)
    const isKick =
      this.currentTrack === 'dust_breakbeat'
        ? step === 0 || step === 3 || step === 6 || step === 10 || step === 12
        : step % 4 === 0;

    if (isKick) {
      const kickOsc = ctx.createOscillator();
      const kickGain = ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(115, now);
      kickOsc.frequency.exponentialRampToValueAtTime(32, now + 0.11);
      kickGain.gain.setValueAtTime(0.13, now);
      kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      kickOsc.connect(kickGain);
      kickGain.connect(ctx.destination);
      kickOsc.start(now);
      kickOsc.stop(now + 0.11);
    }

    // 2. Chimbal / Caixa Sintética discreta
    if (step % 2 === 1 || step === 4 || step === 12) {
      const isSnare = step === 4 || step === 12;
      const dur = isSnare ? 0.08 : 0.03;
      const bufSize = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const ch = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.4));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buf;

      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(isSnare ? 1400 : 5200, now);

      const g = ctx.createGain();
      g.gain.setValueAtTime(isSnare ? 0.065 : 0.025, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);

      noise.connect(hp);
      hp.connect(g);
      g.connect(ctx.destination);
      noise.start(now);
    }

    // 3. Linha de Baixo Sintético
    const bassFreq = bassPatterns[this.currentTrack][step];
    if (bassFreq > 0) {
      const bassOsc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const bassGain = ctx.createGain();

      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);
      filter.frequency.exponentialRampToValueAtTime(140, now + 0.11);

      bassGain.gain.setValueAtTime(0.075, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      bassOsc.connect(filter);
      filter.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.12);
    }

    // 4. Arpejo / Lead Tático
    const leadFreq = leadPatterns[this.currentTrack][step];
    if (leadFreq > 0) {
      const leadOsc = ctx.createOscillator();
      const leadGain = ctx.createGain();
      leadOsc.type = 'triangle';
      leadOsc.frequency.setValueAtTime(leadFreq, now);
      leadGain.gain.setValueAtTime(0.045, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      leadOsc.connect(leadGain);
      leadGain.connect(ctx.destination);
      leadOsc.start(now);
      leadOsc.stop(now + 0.14);
    }
  }
}
