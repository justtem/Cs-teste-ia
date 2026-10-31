import * as THREE from 'three';
import { WeaponSpec } from './standaloneHtmlGenerator';

// Cache global de materiais de armamento para evitar realocação de shaders
interface WeaponMaterialPalette {
  steelBlack: THREE.MeshStandardMaterial;
  steelGraphite: THREE.MeshStandardMaterial;
  chromeInox: THREE.MeshStandardMaterial;
  polymerBlack: THREE.MeshStandardMaterial;
  polymerOlive: THREE.MeshStandardMaterial;
  woodWalnut: THREE.MeshStandardMaterial;
  woodReddish: THREE.MeshStandardMaterial;
  bakeliteOrange: THREE.MeshStandardMaterial;
  rubberPad: THREE.MeshStandardMaterial;
  darkBore: THREE.MeshStandardMaterial;
  tritiumSight: THREE.MeshBasicMaterial;
  amberSight: THREE.MeshBasicMaterial;
  pmBadgeYellow: THREE.MeshBasicMaterial;
}

let cachedPalette: WeaponMaterialPalette | null = null;

function getWeaponPalette(): WeaponMaterialPalette {
  if (cachedPalette) return cachedPalette;

  cachedPalette = {
    steelBlack: new THREE.MeshStandardMaterial({
      color: 0x1c1f24,
      roughness: 0.34,
      metalness: 0.84,
    }),
    steelGraphite: new THREE.MeshStandardMaterial({
      color: 0x2d333b,
      roughness: 0.38,
      metalness: 0.78,
    }),
    chromeInox: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.15,
      metalness: 0.94,
    }),
    polymerBlack: new THREE.MeshStandardMaterial({
      color: 0x131519,
      roughness: 0.76,
      metalness: 0.16,
    }),
    polymerOlive: new THREE.MeshStandardMaterial({
      color: 0x2e3d2c,
      roughness: 0.72,
      metalness: 0.18,
    }),
    woodWalnut: new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.68,
      metalness: 0.12,
    }),
    woodReddish: new THREE.MeshStandardMaterial({
      color: 0x7c3818,
      roughness: 0.62,
      metalness: 0.14,
    }),
    bakeliteOrange: new THREE.MeshStandardMaterial({
      color: 0x9a3412,
      roughness: 0.52,
      metalness: 0.18,
    }),
    rubberPad: new THREE.MeshStandardMaterial({
      color: 0x090a0c,
      roughness: 0.92,
      metalness: 0.05,
    }),
    darkBore: new THREE.MeshStandardMaterial({
      color: 0x050608,
      roughness: 0.5,
      metalness: 0.85,
    }),
    tritiumSight: new THREE.MeshBasicMaterial({ color: 0x4ade80 }),
    amberSight: new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
    pmBadgeYellow: new THREE.MeshBasicMaterial({ color: 0xfacc15 }),
  };

  return cachedPalette;
}

/**
 * Constrói o Modelo 3D em 1ª Pessoa (Viewmodel) de qualquer uma das 17 armas do Arsenal
 * mantendo o padrão de qualidade visual da Desert Eagle e da Shotgun M3.
 */
export function buildFirstPersonWeaponViewmodel(
  spec: WeaponSpec,
  playerTeam: 'CT' | 'TR'
): {
  weaponGroup: THREE.Group;
  muzzleFlashMesh: THREE.Mesh | null;
} {
  const pal = getWeaponPalette();
  const weaponGroup = new THREE.Group();
  let muzzleFlashMesh: THREE.Mesh | null = null;

  const isPM = playerTeam === 'CT';
  const sleeveMat = new THREE.MeshStandardMaterial({
    color: isPM ? 0x14171d : 0xb91c1c,
    roughness: 0.78,
  });
  const gloveMat = new THREE.MeshStandardMaterial({
    color: isPM ? 0x0b0d10 : 0xc68652,
    roughness: 0.68,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xd49b6a,
    roughness: 0.62,
  });

  // Braço direito e mão direita empunhando a arma principal
  const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.105, 0.105, 0.45), sleeveMat);
  rightArm.position.set(0.26, -0.28, -0.31);
  rightArm.rotation.y = 0.08;

  const rightGlove = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.095, 0.13), gloveMat);
  rightGlove.position.set(0.24, -0.23, -0.49);

  const rightFingers = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.075, 0.08), skinMat);
  rightFingers.position.set(0.22, -0.21, -0.54);

  weaponGroup.add(rightArm, rightGlove, rightFingers);

  // ==========================================================================
  // 1. FACA TÁTICA COMBAT KNIFE
  // ==========================================================================
  if (spec.isMelee) {
    const grip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.026, 0.16, 10),
      pal.polymerBlack
    );
    grip.rotation.x = Math.PI / 2.3;
    grip.position.set(0.21, -0.17, -0.51);

    const pommel = new THREE.Mesh(
      new THREE.TorusGeometry(0.024, 0.007, 8, 16),
      pal.steelGraphite
    );
    pommel.position.set(0.21, -0.22, -0.44);

    const crossGuard = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.025, 0.028),
      pal.steelGraphite
    );
    crossGuard.position.set(0.21, -0.13, -0.57);

    const bladeMain = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.048, 0.28),
      pal.chromeInox
    );
    bladeMain.position.set(0.21, -0.105, -0.71);
    bladeMain.rotation.x = -0.12;

    const bladeTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.026, 0.11, 4),
      pal.chromeInox
    );
    bladeTip.rotation.x = -Math.PI / 2 - 0.12;
    bladeTip.scale.set(0.35, 1, 1);
    bladeTip.position.set(0.21, -0.09, -0.89);

    const bloodGroove = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.012, 0.2),
      pal.steelGraphite
    );
    bloodGroove.position.set(0.21, -0.1, -0.69);
    bloodGroove.rotation.x = -0.12;

    weaponGroup.add(grip, pommel, crossGuard, bladeMain, bladeTip, bloodGroove);
  }
  // ==========================================================================
  // 2. PISTOLAS: DESERT EAGLE, USP, GLOCK 17, GLOCK 19, TAURUS PT92, TAURUS TH9
  // ==========================================================================
  else if (
    spec.id === 'deagle' ||
    spec.id === 'usp' ||
    spec.id === 'glock17' ||
    spec.id === 'glock19' ||
    spec.id === 'pt92' ||
    spec.id === 'th9'
  ) {
    const isDeagle = spec.id === 'deagle';
    const isGlock17 = spec.id === 'glock17';
    const isGlock19 = spec.id === 'glock19';
    const isGlock = isGlock17 || isGlock19;
    const isPT92 = spec.id === 'pt92';
    const isTH9 = spec.id === 'th9';

    // Braço e mão esquerda apoiando o punho da pistola (empunhadura dupla tática)
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.42), sleeveMat);
    leftArm.position.set(0.07, -0.26, -0.34);
    leftArm.rotation.y = -0.38;

    const leftGlove = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.082, 0.11), gloveMat);
    leftGlove.position.set(0.185, -0.225, -0.49);

    const leftFingers = new THREE.Mesh(new THREE.BoxGeometry(0.072, 0.068, 0.065), skinMat);
    leftFingers.position.set(0.195, -0.215, -0.535);

    // Dimensões específicas por modelo de pistola
    const slideLen = isDeagle
      ? 0.34
      : isPT92
      ? 0.28
      : isGlock17 || isTH9
      ? 0.26
      : isGlock19
      ? 0.225
      : 0.25;
    const slideHeight = isDeagle ? 0.068 : isGlock ? 0.048 : 0.052;
    const slideWidth = isDeagle ? 0.054 : isGlock ? 0.043 : 0.045;

    const slideMat = isDeagle
      ? pal.chromeInox
      : isPT92
      ? pal.steelBlack
      : isGlock19 || isTH9
      ? pal.steelGraphite
      : pal.steelBlack;

    // Punho Anatômico Inclinado com carregador embutido
    const pistolGrip = new THREE.Mesh(
      new THREE.BoxGeometry(slideWidth * 0.86, isGlock19 ? 0.148 : 0.165, 0.078),
      pal.polymerBlack
    );
    pistolGrip.position.set(0.21, -0.215, -0.47);
    pistolGrip.rotation.x = isGlock ? -0.32 : -0.28;

    // Placas laterais texturizadas do punho (com insígnia discreta nas Taurus PT92/TH9)
    const gripPanel = new THREE.Mesh(
      new THREE.BoxGeometry(slideWidth * 0.92, 0.12, 0.056),
      isPT92 ? pal.steelGraphite : pal.darkBore
    );
    gripPanel.position.set(0.21, -0.215, -0.47);
    gripPanel.rotation.x = isGlock ? -0.32 : -0.28;

    // Base do carregador (Floorplate)
    const magBase = new THREE.Mesh(
      new THREE.BoxGeometry(slideWidth * 0.9, 0.018, 0.086),
      isDeagle || isPT92 ? pal.chromeInox : pal.polymerBlack
    );
    magBase.position.set(0.21, -0.295, -0.448);
    magBase.rotation.x = isGlock ? -0.32 : -0.28;

    // Chassi inferior (Frame) e Trilho Tático Picatinny
    const lowerFrame = new THREE.Mesh(
      new THREE.BoxGeometry(slideWidth * 0.92, 0.032, slideLen * 0.9),
      isDeagle ? pal.chromeInox : isPT92 ? pal.steelBlack : pal.polymerBlack
    );
    lowerFrame.position.set(0.21, -0.138, -0.46 - slideLen * 0.38);

    // Guarda-Mato (Trigger Guard) e Gatilho
    const triggerGuardBottom = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.01, 0.068),
      pal.polymerBlack
    );
    triggerGuardBottom.position.set(0.21, -0.178, -0.535);

    const triggerGuardFront = new THREE.Mesh(
      new THREE.BoxGeometry(0.018, 0.036, 0.012),
      pal.polymerBlack
    );
    triggerGuardFront.position.set(0.21, -0.16, -0.565);

    const trigger = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, 0.028, 0.014),
      pal.darkBore
    );
    trigger.position.set(0.21, -0.156, -0.53);
    trigger.rotation.x = 0.35;

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
      trigger
    );

    if (isPT92) {
      // TAURUS PT92 AF: Ferrolho aberto superior característico exibindo o cano longo em Aço Inox
      const rearSlide = new THREE.Mesh(
        new THREE.BoxGeometry(slideWidth, slideHeight, slideLen * 0.46),
        pal.steelBlack
      );
      rearSlide.position.set(0.21, -0.1, -0.45 - slideLen * 0.16);

      const frontSlideRing = new THREE.Mesh(
        new THREE.BoxGeometry(slideWidth, slideHeight, 0.045),
        pal.steelBlack
      );
      frontSlideRing.position.set(0.21, -0.1, -0.45 - slideLen * 0.82);

      // Cano Inox Prateado Exposto no corte superior da PT92
      const exposedInoxBarrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, slideLen * 0.96, 12),
        pal.chromeInox
      );
      exposedInoxBarrel.rotation.x = Math.PI / 2;
      exposedInoxBarrel.position.set(0.21, -0.095, -0.45 - slideLen * 0.45);

      const ptHammer = new THREE.Mesh(
        new THREE.BoxGeometry(0.014, 0.032, 0.022),
        pal.chromeInox
      );
      ptHammer.position.set(0.21, -0.082, -0.435);
      ptHammer.rotation.x = -0.45;

      weaponGroup.add(rearSlide, frontSlideRing, exposedInoxBarrel, ptHammer);
    } else {
      // Ferrolho Principal (Slide) para Deagle, Glock 17, Glock 19, TH9 e USP
      const slideBody = new THREE.Mesh(
        new THREE.BoxGeometry(slideWidth, slideHeight, slideLen),
        slideMat
      );
      slideBody.position.set(0.21, -0.1, -0.45 - slideLen * 0.42);
      weaponGroup.add(slideBody);

      // Crista superior chanfrada na Deagle / TH9; topo plano quadrado nas Glocks
      if (!isGlock) {
        const slideTopRidge = new THREE.Mesh(
          new THREE.BoxGeometry(slideWidth * 0.68, 0.016, slideLen * 0.96),
          slideMat
        );
        slideTopRidge.position.set(
          0.21,
          -0.1 + slideHeight * 0.52,
          -0.45 - slideLen * 0.42
        );
        weaponGroup.add(slideTopRidge);
      } else {
        // Serrilhados traseiros de aderência característicos da Glock 17 / Glock 19
        for (let s = 0; s < 4; s++) {
          const serration = new THREE.Mesh(
            new THREE.BoxGeometry(slideWidth + 0.002, slideHeight * 0.72, 0.005),
            pal.darkBore
          );
          serration.position.set(0.21, -0.1, -0.46 - s * 0.012);
          weaponGroup.add(serration);
        }
      }

      // Janela de Ejeção Lateral Escura
      const ejectionPort = new THREE.Mesh(
        new THREE.BoxGeometry(slideWidth + 0.003, slideHeight * 0.48, 0.062),
        isTH9 ? pal.chromeInox : pal.darkBore
      );
      ejectionPort.position.set(0.21, -0.092, -0.53);
      weaponGroup.add(ejectionPort);

      // Cão Traseiro (Hammer) — Glocks são striker-fired (sem cão externo)
      if (!isGlock) {
        const hammer = new THREE.Mesh(
          new THREE.BoxGeometry(0.014, 0.03, 0.022),
          pal.darkBore
        );
        hammer.position.set(0.21, -0.082, -0.435);
        hammer.rotation.x = -0.45;
        weaponGroup.add(hammer);
      }
    }

    // Boca do Cano (Furo Escuro Realista na Frente)
    const muzzleBore = new THREE.Mesh(
      new THREE.CylinderGeometry(
        isDeagle ? 0.016 : 0.011,
        isDeagle ? 0.016 : 0.011,
        0.02,
        12
      ),
      pal.darkBore
    );
    muzzleBore.rotation.x = Math.PI / 2;
    muzzleBore.position.set(0.21, -0.098, -0.45 - slideLen * 0.92);

    // Alça de Mira Traseira e Massa de Mira Frontal (com trítio verde na TH9)
    const sightMat = isTH9 ? pal.tritiumSight : pal.darkBore;
    const rearSight = new THREE.Mesh(
      new THREE.BoxGeometry(slideWidth * 0.85, 0.016, 0.016),
      sightMat
    );
    rearSight.position.set(0.21, -0.1 + slideHeight * 0.66, -0.46);

    const frontSight = new THREE.Mesh(
      new THREE.BoxGeometry(0.011, 0.02, 0.016),
      sightMat
    );
    frontSight.position.set(0.21, -0.1 + slideHeight * 0.66, -0.45 - slideLen * 0.86);

    weaponGroup.add(muzzleBore, rearSight, frontSight);

    muzzleFlashMesh = new THREE.Mesh(
      new THREE.ConeGeometry(isDeagle ? 0.11 : 0.075, isDeagle ? 0.26 : 0.18, 6),
      new THREE.MeshBasicMaterial({ color: 0xfde047 })
    );
    muzzleFlashMesh.rotation.x = -Math.PI / 2;
    muzzleFlashMesh.position.set(0.21, -0.098, -0.48 - slideLen);
    muzzleFlashMesh.visible = false;
    weaponGroup.add(muzzleFlashMesh);
  }
  // ==========================================================================
  // 3. ESCOPETA CALIBRE 12 DE CANO CURTO (SAWED-OFF URBANA)
  // ==========================================================================
  else if (spec.id === 'sawed_off') {
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.095, 0.44), sleeveMat);
    leftArm.position.set(0.05, -0.26, -0.42);
    leftArm.rotation.y = -0.34;

    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.084, 0.082, 0.12), skinMat);
    leftHand.position.set(0.18, -0.195, -0.68);

    // Culatra basculante metálica
    const receiver = new THREE.Mesh(
      new THREE.BoxGeometry(0.082, 0.095, 0.24),
      pal.steelGraphite
    );
    receiver.position.set(0.21, -0.16, -0.46);

    // Chave de abertura superior (Top Lever)
    const topLever = new THREE.Mesh(
      new THREE.BoxGeometry(0.022, 0.016, 0.07),
      pal.steelBlack
    );
    topLever.position.set(0.21, -0.105, -0.42);

    // Empunhadura curta recurvada em madeira envernizada (sem coronha longa)
    const woodGrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.064, 0.15, 0.18),
      pal.woodReddish
    );
    woodGrip.position.set(0.21, -0.22, -0.33);
    woodGrip.rotation.x = 0.42;

    // Guarda-mão inferior curto arredondado em madeira maciça
    const woodForend = new THREE.Mesh(
      new THREE.BoxGeometry(0.086, 0.068, 0.26),
      pal.woodReddish
    );
    woodForend.position.set(0.21, -0.175, -0.69);

    // Canos Duplos Paralelos Calibre 12 Serrados
    const leftBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.019, 0.02, 0.46, 12),
      pal.steelBlack
    );
    leftBarrel.rotation.x = Math.PI / 2;
    leftBarrel.position.set(0.19, -0.132, -0.77);

    const rightBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.019, 0.02, 0.46, 12),
      pal.steelBlack
    );
    rightBarrel.rotation.x = Math.PI / 2;
    rightBarrel.position.set(0.23, -0.132, -0.77);

    // Furos duplos escuros na boca dos canos serrados
    const boreL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.02, 10),
      pal.darkBore
    );
    boreL.rotation.x = Math.PI / 2;
    boreL.position.set(0.19, -0.132, -0.995);

    const boreR = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.02, 10),
      pal.darkBore
    );
    boreR.rotation.x = Math.PI / 2;
    boreR.position.set(0.23, -0.132, -0.995);

    const frontBead = new THREE.Mesh(
      new THREE.SphereGeometry(0.008, 8, 8),
      pal.amberSight
    );
    frontBead.position.set(0.21, -0.108, -0.97);

    weaponGroup.add(
      leftArm,
      leftHand,
      receiver,
      topLever,
      woodGrip,
      woodForend,
      leftBarrel,
      rightBarrel,
      boreL,
      boreR,
      frontBead
    );

    muzzleFlashMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.16, 0.34, 7),
      new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
    );
    muzzleFlashMesh.rotation.x = -Math.PI / 2;
    muzzleFlashMesh.position.set(0.21, -0.132, -1.08);
    muzzleFlashMesh.visible = false;
    weaponGroup.add(muzzleFlashMesh);
  }
  // ==========================================================================
  // 4. ESCOPETAS PUMP-ACTION: LEONE M3 (MADEIRA) & CBC PUMP MILITARY (TÁTICA PM)
  // ==========================================================================
  else if (spec.id === 'm3' || spec.id === 'cbc_pump') {
    const isCBC = spec.id === 'cbc_pump';

    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.095, 0.5), sleeveMat);
    leftArm.position.set(0.04, -0.26, -0.48);
    leftArm.rotation.y = -0.32;

    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.084, 0.082, 0.13), skinMat);
    leftHand.position.set(0.18, -0.195, -0.78);

    const furnitureMat = isCBC ? pal.polymerBlack : pal.woodWalnut;
    const metalMat = isCBC ? pal.steelBlack : pal.steelGraphite;

    // Caixa da Culatra (Receiver da Escopeta)
    const receiver = new THREE.Mesh(
      new THREE.BoxGeometry(0.074, 0.105, 0.38),
      metalMat
    );
    receiver.position.set(0.21, -0.155, -0.48);

    // Janela de ejeção de cartuchos 12G
    const shellPort = new THREE.Mesh(
      new THREE.BoxGeometry(0.077, 0.036, 0.095),
      pal.darkBore
    );
    shellPort.position.set(0.21, -0.145, -0.52);

    // Coronha Traseira + Soleira de borracha
    const stock = new THREE.Mesh(
      new THREE.BoxGeometry(0.062, 0.115, 0.28),
      furnitureMat
    );
    stock.position.set(0.21, -0.19, -0.22);
    stock.rotation.x = 0.12;

    const buttPad = new THREE.Mesh(
      new THREE.BoxGeometry(0.064, 0.12, 0.03),
      pal.rubberPad
    );
    buttPad.position.set(0.21, -0.205, -0.08);

    // Cano Principal Calibre 12 (Superior)
    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.019, 0.021, 0.68, 14),
      metalMat
    );
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.21, -0.122, -0.96);

    // Tubo Carregador de Cartuchos (Inferior)
    const tubeMag = new THREE.Mesh(
      new THREE.CylinderGeometry(0.017, 0.017, 0.64, 12),
      metalMat
    );
    tubeMag.rotation.x = Math.PI / 2;
    tubeMag.position.set(0.21, -0.162, -0.94);

    // Telha Corrediça Pump-Action Frisada
    const pumpForend = new THREE.Mesh(
      new THREE.CylinderGeometry(0.033, 0.033, 0.27, 14),
      furnitureMat
    );
    pumpForend.rotation.x = Math.PI / 2;
    pumpForend.position.set(0.21, -0.165, -0.82);

    // Na CBC Pump Military da PM: adiciona Escudo Térmico Perfurado (Heatshield) e Mira Ghost-Ring
    if (isCBC) {
      const heatShield = new THREE.Mesh(
        new THREE.BoxGeometry(0.046, 0.028, 0.42),
        pal.polymerBlack
      );
      heatShield.position.set(0.21, -0.11, -0.86);

      const ghostRingRear = new THREE.Mesh(
        new THREE.TorusGeometry(0.014, 0.004, 6, 12),
        pal.steelBlack
      );
      ghostRingRear.position.set(0.21, -0.09, -0.38);

      const pmTag = new THREE.Mesh(
        new THREE.BoxGeometry(0.078, 0.018, 0.045),
        pal.pmBadgeYellow
      );
      pmTag.position.set(0.21, -0.13, -0.36);

      weaponGroup.add(heatShield, ghostRingRear, pmTag);
    }

    const frontBead = new THREE.Mesh(
      new THREE.SphereGeometry(0.008, 8, 8),
      isCBC ? pal.tritiumSight : pal.amberSight
    );
    frontBead.position.set(0.21, -0.098, -1.27);

    weaponGroup.add(
      leftArm,
      leftHand,
      receiver,
      shellPort,
      stock,
      buttPad,
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
  }
  // ==========================================================================
  // 5. FUZIS BRASILEIROS, CLÁSSICOS, SUBMETRALHADORA E SNIPER
  //    (FN FAL / ParaFAL, HK G3, IMBEL IA2, AK-47, M4A1, MP5, AWP)
  // ==========================================================================
  else {
    const id = spec.id;
    const len = spec.lengthScale;

    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.095, 0.48), sleeveMat);
    leftArm.position.set(0.05, -0.27, -0.45);
    leftArm.rotation.y = -0.34;

    const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.082, 0.082, 0.12), skinMat);
    leftHand.position.set(0.18, -0.205, -0.72);
    weaponGroup.add(leftArm, leftHand);

    if (id === 'ak47') {
      // ======================================================================
      // AK-47 CLÁSSICA: Madeira maciça avermelhada, tubo de gases e pente banana
      // ======================================================================
      const receiver = new THREE.Mesh(
        new THREE.BoxGeometry(0.068, 0.098, 0.42),
        pal.steelGraphite
      );
      receiver.position.set(0.21, -0.16, -0.48);

      const dustCover = new THREE.Mesh(
        new THREE.BoxGeometry(0.064, 0.032, 0.36),
        pal.steelBlack
      );
      dustCover.position.set(0.21, -0.105, -0.46);

      const pistolGrip = new THREE.Mesh(
        new THREE.BoxGeometry(0.048, 0.14, 0.072),
        pal.bakeliteOrange
      );
      pistolGrip.position.set(0.21, -0.25, -0.38);
      pistolGrip.rotation.x = -0.32;

      // Coronha inclinada de madeira com soleira de aço
      const woodStock = new THREE.Mesh(
        new THREE.BoxGeometry(0.058, 0.11, 0.28),
        pal.woodReddish
      );
      woodStock.position.set(0.21, -0.195, -0.18);
      woodStock.rotation.x = 0.15;

      // Guarda-mão duplo em madeira envernizada (inferior e superior)
      const lowerHandguard = new THREE.Mesh(
        new THREE.BoxGeometry(0.066, 0.062, 0.28),
        pal.woodReddish
      );
      lowerHandguard.position.set(0.21, -0.168, -0.82);

      const upperHandguard = new THREE.Mesh(
        new THREE.BoxGeometry(0.058, 0.04, 0.24),
        pal.woodReddish
      );
      upperHandguard.position.set(0.21, -0.118, -0.81);

      // Cano de aço e tubo de gases superior
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.016, 0.52, 12),
        pal.steelBlack
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0.21, -0.148, -1.04);

      const gasTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.011, 0.011, 0.34, 10),
        pal.steelGraphite
      );
      gasTube.rotation.x = Math.PI / 2;
      gasTube.position.set(0.21, -0.116, -0.92);

      // Massa de mira frontal triangular característica da AK-47
      const frontSightTower = new THREE.Mesh(
        new THREE.BoxGeometry(0.018, 0.065, 0.032),
        pal.steelBlack
      );
      frontSightTower.position.set(0.21, -0.115, -1.24);

      // Carregador Banana Curvo em 2 segmentos angulados (30 tiros 7.62x39mm)
      const magUpper = new THREE.Mesh(
        new THREE.BoxGeometry(0.048, 0.14, 0.088),
        pal.bakeliteOrange
      );
      magUpper.position.set(0.21, -0.255, -0.58);
      magUpper.rotation.x = 0.22;

      const magLower = new THREE.Mesh(
        new THREE.BoxGeometry(0.046, 0.15, 0.086),
        pal.bakeliteOrange
      );
      magLower.position.set(0.21, -0.365, -0.63);
      magLower.rotation.x = 0.48;

      weaponGroup.add(
        receiver,
        dustCover,
        pistolGrip,
        woodStock,
        lowerHandguard,
        upperHandguard,
        barrel,
        gasTube,
        frontSightTower,
        magUpper,
        magLower
      );
    } else if (id === 'parafal') {
      // ======================================================================
      // FN FAL / IMBEL PARAFAL 7.62mm: Cano longo, guarda-mão ventilado e coronha esqueleto
      // ======================================================================
      const receiver = new THREE.Mesh(
        new THREE.BoxGeometry(0.068, 0.105, 0.46),
        pal.steelBlack
      );
      receiver.position.set(0.21, -0.158, -0.48);

      // Alça de transporte clássica do FAL e alavanca de manejo lateral
      const carryHandle = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.032, 0.14),
        pal.polymerBlack
      );
      carryHandle.position.set(0.21, -0.092, -0.56);

      // Coronha rebatível esqueleto de tubos duplos da versão ParaFAL
      const paraStockTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.28, 8),
        pal.steelBlack
      );
      paraStockTop.rotation.x = Math.PI / 2;
      paraStockTop.position.set(0.21, -0.14, -0.14);

      const paraStockBot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, 0.28, 8),
        pal.steelBlack
      );
      paraStockBot.rotation.x = Math.PI / 2 - 0.14;
      paraStockBot.position.set(0.21, -0.19, -0.14);

      const buttPlate = new THREE.Mesh(
        new THREE.BoxGeometry(0.056, 0.115, 0.028),
        pal.rubberPad
      );
      buttPlate.position.set(0.21, -0.17, -0.01);

      // Guarda-mão longo em polímero preto com 3 furos de ventilação laterais
      const handguard = new THREE.Mesh(
        new THREE.BoxGeometry(0.064, 0.088, 0.42),
        pal.polymerBlack
      );
      handguard.position.set(0.21, -0.158, -0.90);

      for (let v = 0; v < 3; v++) {
        const ventHole = new THREE.Mesh(
          new THREE.BoxGeometry(0.068, 0.018, 0.055),
          pal.darkBore
        );
        ventHole.position.set(0.21, -0.15, -0.78 - v * 0.10);
        weaponGroup.add(ventHole);
      }

      // Cano longo 7.62mm + quebra-chamas tubular longo do FAL
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.016, 0.56, 12),
        pal.steelBlack
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0.21, -0.145, -1.16);

      const flashHider = new THREE.Mesh(
        new THREE.CylinderGeometry(0.019, 0.019, 0.12, 12),
        pal.steelGraphite
      );
      flashHider.rotation.x = Math.PI / 2;
      flashHider.position.set(0.21, -0.145, -1.42);

      const frontSight = new THREE.Mesh(
        new THREE.BoxGeometry(0.02, 0.055, 0.028),
        pal.steelBlack
      );
      frontSight.position.set(0.21, -0.112, -1.14);

      // Carregador reto pesado de 20 tiros 7.62x51mm NATO
      const falMag = new THREE.Mesh(
        new THREE.BoxGeometry(0.048, 0.22, 0.105),
        pal.steelGraphite
      );
      falMag.position.set(0.21, -0.275, -0.58);
      falMag.rotation.x = 0.06;

      weaponGroup.add(
        receiver,
        carryHandle,
        paraStockTop,
        paraStockBot,
        buttPlate,
        handguard,
        barrel,
        flashHider,
        frontSight,
        falMag
      );
    } else if (id === 'g3') {
      // ======================================================================
      // HECKLER & KOCH G3A3 (7.62mm): Guarda-mão e coronha verde-oliva + tambor HK
      // ======================================================================
      const receiver = new THREE.Mesh(
        new THREE.BoxGeometry(0.068, 0.102, 0.44),
        pal.steelGraphite
      );
      receiver.position.set(0.21, -0.158, -0.48);

      // Tubo superior de manejo (Cocking tube) característico do HK G3
      const cockingTube = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.78, 12),
        pal.steelBlack
      );
      cockingTube.rotation.x = Math.PI / 2;
      cockingTube.position.set(0.21, -0.108, -0.78);

      // Tambor giratório de alça de mira traseira HK (Diopter Drum Sight)
      const rearDrumSight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.032, 10),
        pal.steelBlack
      );
      rearDrumSight.rotation.x = 0.4;
      rearDrumSight.position.set(0.21, -0.09, -0.34);

      // Coronha fixa e Guarda-mão longo em polímero Verde-Oliva escuro
      const oliveStock = new THREE.Mesh(
        new THREE.BoxGeometry(0.058, 0.112, 0.30),
        pal.polymerOlive
      );
      oliveStock.position.set(0.21, -0.185, -0.15);
      oliveStock.rotation.x = 0.08;

      const oliveHandguard = new THREE.Mesh(
        new THREE.BoxGeometry(0.062, 0.076, 0.44),
        pal.polymerOlive
      );
      oliveHandguard.position.set(0.21, -0.162, -0.91);

      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.016, 0.52, 12),
        pal.steelBlack
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0.21, -0.152, -1.16);

      const frontHoodSight = new THREE.Mesh(
        new THREE.TorusGeometry(0.018, 0.004, 8, 14),
        pal.steelBlack
      );
      frontHoodSight.position.set(0.21, -0.108, -1.16);

      // Carregador reto frisado 7.62mm (Waffle Magazine)
      const g3Mag = new THREE.Mesh(
        new THREE.BoxGeometry(0.048, 0.21, 0.10),
        pal.steelGraphite
      );
      g3Mag.position.set(0.21, -0.275, -0.57);
      g3Mag.rotation.x = 0.05;

      weaponGroup.add(
        receiver,
        cockingTube,
        rearDrumSight,
        oliveStock,
        oliveHandguard,
        barrel,
        frontHoodSight,
        g3Mag
      );
    } else if (id === 'ia2') {
      // ======================================================================
      // IMBEL IA2 5.56mm (FUZIL POLICIAL NACIONAL): Trilho Picatinny, Guarda-mão ventilado e Mira Óptica
      // ======================================================================
      const receiver = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.108, 0.42),
        pal.steelBlack
      );
      receiver.position.set(0.21, -0.16, -0.48);

      // Trilho Picatinny superior inteiriço com dentes
      const topRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.042, 0.018, 0.68),
        pal.steelGraphite
      );
      topRail.position.set(0.21, -0.098, -0.62);

      // Mira Óptica Red-Dot / Holográfica Policial acoplada ao trilho do IA2
      const opticHousing = new THREE.Mesh(
        new THREE.BoxGeometry(0.048, 0.048, 0.095),
        pal.polymerBlack
      );
      opticHousing.position.set(0.21, -0.068, -0.48);

      const opticLens = new THREE.Mesh(
        new THREE.BoxGeometry(0.036, 0.032, 0.01),
        pal.tritiumSight
      );
      opticLens.position.set(0.21, -0.066, -0.525);

      // Guarda-mão ergonômico brasileiro (polímero verde-oliva/preto com nervuras)
      const ia2Handguard = new THREE.Mesh(
        new THREE.BoxGeometry(0.068, 0.088, 0.34),
        isPM ? pal.polymerBlack : pal.polymerOlive
      );
      ia2Handguard.position.set(0.21, -0.16, -0.84);

      const sideRailL = new THREE.Mesh(
        new THREE.BoxGeometry(0.076, 0.018, 0.24),
        pal.steelGraphite
      );
      sideRailL.position.set(0.21, -0.155, -0.84);

      // Coronha rebatível moderna do IA2
      const ia2Stock = new THREE.Mesh(
        new THREE.BoxGeometry(0.056, 0.108, 0.26),
        pal.polymerBlack
      );
      ia2Stock.position.set(0.21, -0.18, -0.18);

      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.015, 0.44, 12),
        pal.steelBlack
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0.21, -0.148, -1.08);

      // Carregador STANAG 30 tiros 5.56mm
      const stanagMag = new THREE.Mesh(
        new THREE.BoxGeometry(0.046, 0.22, 0.088),
        pal.steelGraphite
      );
      stanagMag.position.set(0.21, -0.28, -0.58);
      stanagMag.rotation.x = 0.22;

      weaponGroup.add(
        receiver,
        topRail,
        opticHousing,
        opticLens,
        ia2Handguard,
        sideRailL,
        ia2Stock,
        barrel,
        stanagMag
      );
    } else {
      // ======================================================================
      // M4A1 CARBINE, MP5 NAVY & MAGNUM AWP SNIPER
      // ======================================================================
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

      // Alça de transporte superior (Carry Handle) exclusiva da M4A1
      if (id === 'm4a1') {
        const carryHandle = new THREE.Mesh(
          new THREE.BoxGeometry(0.036, 0.042, 0.22),
          bodyMat
        );
        carryHandle.position.set(0.21, -0.09, -0.48);
        weaponGroup.add(carryHandle);
      }

      const handguard = new THREE.Mesh(
        new THREE.BoxGeometry(0.066, 0.085, 0.28 * len),
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

      const frontSight = new THREE.Mesh(
        new THREE.BoxGeometry(0.014, 0.045, 0.02),
        bodyMat
      );
      frontSight.position.set(0.21, -0.115, -0.52 - 0.66 * len);

      const magazine = new THREE.Mesh(
        new THREE.BoxGeometry(id === 'mp5' ? 0.034 : 0.046, 0.21, id === 'mp5' ? 0.055 : 0.085),
        accentMat
      );
      magazine.position.set(0.21, -0.285, -0.58);
      magazine.rotation.x = 0.24;

      weaponGroup.add(receiver, handguard, stock, barrel, frontSight, magazine);

      if (spec.hasScope) {
        const scopeMount = new THREE.Mesh(
          new THREE.BoxGeometry(0.032, 0.04, 0.16),
          accentMat
        );
        scopeMount.position.set(0.21, -0.095, -0.52);
        const scopeTube = new THREE.Mesh(
          new THREE.CylinderGeometry(0.026, 0.028, 0.38, 14),
          bodyMat
        );
        scopeTube.rotation.x = Math.PI / 2;
        scopeTube.position.set(0.21, -0.075, -0.54);
        weaponGroup.add(scopeMount, scopeTube);
      }
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

  return { weaponGroup, muzzleFlashMesh };
}
