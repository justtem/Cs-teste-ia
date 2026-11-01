import * as THREE from 'three';
import { WeaponSpec } from './standaloneHtmlGenerator';
import {
  attachFirstPersonGlbToViewmodel,
  computeFirstPersonGripAnchor,
  WEAPON_GLB_VISUAL_CONFIGS,
  WeaponGlbVisualConfig,
} from './glbWeaponRegistry';

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

const _upAxis = new THREE.Vector3(0, 1, 0);

/**
 * Cria um segmento cilíndrico/chanfrado de antebraço conectado perfeitamente
 * entre a articulação do pulso (`wristPos`) e a origem do ombro fora da tela (`shoulderPos`).
 */
function createConnectedForearmSegment(
  wristPos: THREE.Vector3,
  shoulderPos: THREE.Vector3,
  sleeveMat: THREE.Material,
  cuffMat: THREE.Material,
  skinMat: THREE.Material,
  isPM: boolean
): THREE.Group {
  const armGroup = new THREE.Group();
  const delta = new THREE.Vector3().subVectors(shoulderPos, wristPos);
  const fullLen = Math.max(0.12, delta.length());
  const dir = delta.clone().normalize();
  const mid = new THREE.Vector3().addVectors(wristPos, shoulderPos).multiplyScalar(0.5);

  // Manga / Antebraço afunilado (proporção anatômica natural: 2.9cm no pulso até 4.0cm no cotovelo)
  const forearmGeo = new THREE.CylinderGeometry(0.039, 0.029, fullLen, 10);
  const forearmMesh = new THREE.Mesh(forearmGeo, isPM ? sleeveMat : skinMat);
  forearmMesh.position.copy(mid);
  forearmMesh.quaternion.setFromUnitVectors(_upAxis, dir);
  armGroup.add(forearmMesh);

  // Nos Bandidos (TR), adiciona dobra de manga curta na metade superior do antebraço
  if (!isPM) {
    const upperLen = fullLen * 0.46;
    const upperPos = new THREE.Vector3().lerpVectors(wristPos, shoulderPos, 0.77);
    const upperSleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.043, 0.038, upperLen, 10),
      sleeveMat
    );
    upperSleeve.position.copy(upperPos);
    upperSleeve.quaternion.setFromUnitVectors(_upAxis, dir);
    armGroup.add(upperSleeve);
  }

  // Punho tático / munhequeira exatamente na transição com a luva
  const cuffPos = new THREE.Vector3().lerpVectors(wristPos, shoulderPos, 0.08);
  const wristCuff = new THREE.Mesh(
    new THREE.CylinderGeometry(0.032, 0.031, 0.036, 10),
    cuffMat
  );
  wristCuff.position.copy(cuffPos);
  wristCuff.quaternion.setFromUnitVectors(_upAxis, dir);
  armGroup.add(wristCuff);

  return armGroup;
}

/**
 * Constrói o Rig Anatômico de Mão Direita (Empunhadura Principal no Punho / Cabo)
 * e Mão Esquerda (Apoio Duplo em Pistolas/Revólveres ou Guarda-Mão em Armas Longas),
 * alinhado diretamente às coordenadas normalizadas da arma ativa.
 */
function buildCalibratedHandsAndArmsRig(
  config: WeaponGlbVisualConfig,
  playerTeam: 'CT' | 'TR'
): {
  rightArmRig: THREE.Group;
  leftArmRig: THREE.Group | null;
} {
  const isPM = playerTeam === 'CT';

  const sleeveMat = new THREE.MeshStandardMaterial({
    color: isPM ? 0x131822 : 0x991b1b,
    roughness: 0.78,
    metalness: 0.08,
  });
  const gloveMat = new THREE.MeshStandardMaterial({
    color: isPM ? 0x0b0d11 : 0x3f2718,
    roughness: 0.64,
    metalness: 0.14,
  });
  const knuckleMat = new THREE.MeshStandardMaterial({
    color: isPM ? 0x1e242d : 0x1c1917,
    roughness: 0.42,
    metalness: 0.35,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xd49b6a,
    roughness: 0.62,
    metalness: 0.04,
  });

  const fingerTipMat = isPM ? gloveMat : skinMat;

  // ==========================================================================
  // 1. MÃO DIREITA + ANTEBRAÇO DIREITO (PUNHO PRINCIPAL / GATILHO / CABO DA FACA)
  // ==========================================================================
  const rightArmRig = new THREE.Group();
  rightArmRig.name = 'RightArmRig';

  const rightGripPos = computeFirstPersonGripAnchor(config, config.fpRightGripNorm);
  const isKnife = config.gripStyle === 'melee_knife';

  const rightHandGroup = new THREE.Group();
  rightHandGroup.position.copy(rightGripPos);

  if (isKnife) {
    // Postura de combate corpo a corpo segurando o cabo da Baioneta M9
    rightHandGroup.rotation.set(0.16, 0.12, 0.08);
  } else {
    // Postura anatômica envolvendo o pistol grip e alcançando o gatilho
    rightHandGroup.rotation.set(-0.24, 0.05, -0.06);
  }

  // Palma direita encostada na lateral direita/traseira do punho da arma
  const rightPalm = new THREE.Mesh(
    new THREE.BoxGeometry(0.032, 0.062, 0.058),
    gloveMat
  );
  rightPalm.position.set(0.015, -0.004, 0.008);

  // Placa protetora dorsal (knuckle guard)
  const rightKnuckle = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, 0.018, 0.048),
    knuckleMat
  );
  rightKnuckle.position.set(0.017, 0.018, 0.004);

  // Dedo indicador estendido até o guarda-mato / gatilho (nas armas de fogo) ou envolvendo o cabo (na faca)
  const indexFinger = new THREE.Mesh(
    new THREE.BoxGeometry(0.014, 0.014, isKnife ? 0.042 : 0.052),
    fingerTipMat
  );
  if (isKnife) {
    indexFinger.position.set(0.0, 0.018, -0.022);
    indexFinger.rotation.y = 0.25;
  } else {
    indexFinger.position.set(0.004, 0.022, -0.036);
    indexFinger.rotation.x = 0.12;
    indexFinger.rotation.y = 0.18;
  }

  // 3 dedos inferiores (médio, anelar e mínimo) curvados envolvendo a frente do punho
  for (let f = 0; f < 3; f++) {
    const yOff = 0.002 - f * 0.015;
    const fingerFront = new THREE.Mesh(
      new THREE.BoxGeometry(0.034, 0.013, 0.022),
      fingerTipMat
    );
    fingerFront.position.set(-0.002, yOff, -0.024);

    const fingerWrap = new THREE.Mesh(
      new THREE.BoxGeometry(0.014, 0.012, 0.028),
      fingerTipMat
    );
    fingerWrap.position.set(-0.014, yOff, -0.012);
    rightHandGroup.add(fingerFront, fingerWrap);
  }

  // Polegar direito envolvendo a parte superior esquerda do punho (backstrap)
  const rightThumb = new THREE.Mesh(
    new THREE.BoxGeometry(0.032, 0.015, 0.024),
    fingerTipMat
  );
  rightThumb.position.set(-0.004, 0.026, 0.012);
  rightThumb.rotation.z = 0.28;

  rightHandGroup.add(rightPalm, rightKnuckle, indexFinger, rightThumb);
  rightArmRig.add(rightHandGroup);

  // Ponto de conexão do pulso direito e antebraço até o ombro direito
  const rightWristPos = rightGripPos.clone().add(new THREE.Vector3(0.022, -0.018, 0.042));
  const rightShoulderPos = new THREE.Vector3(0.32, -0.32, -0.04);
  const rightForearm = createConnectedForearmSegment(
    rightWristPos,
    rightShoulderPos,
    sleeveMat,
    knuckleMat,
    skinMat,
    isPM
  );
  rightArmRig.add(rightForearm);

  // ==========================================================================
  // 2. MÃO ESQUERDA + ANTEBRAÇO ESQUERDO (OCULTO NA FACA; ATIVO NAS ARMAS DE FOGO)
  // ==========================================================================
  if (!config.fpLeftGripNorm) {
    return { rightArmRig, leftArmRig: null };
  }

  const leftArmRig = new THREE.Group();
  leftArmRig.name = 'LeftArmRig';

  const leftGripPos = computeFirstPersonGripAnchor(config, config.fpLeftGripNorm);
  const isPistolTwoHand =
    config.gripStyle === 'pistol_two_hand' || config.gripStyle === 'revolver_two_hand';

  const leftHandGroup = new THREE.Group();
  leftHandGroup.position.copy(leftGripPos);

  let leftWristPos: THREE.Vector3;
  const leftShoulderPos = new THREE.Vector3(-0.14, -0.33, -0.06);

  if (isPistolTwoHand) {
    // EMPUNHADURA DUPLA DE PISTOLA / REVÓLVER:
    // Mão esquerda envolve a lateral esquerda e a frente dos dedos da mão direita (postura thumbs-forward)
    leftHandGroup.rotation.set(-0.22, -0.18, 0.08);

    const leftPalm = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.058, 0.054),
      gloveMat
    );
    leftPalm.position.set(-0.018, -0.004, 0.006);

    const leftKnuckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.031, 0.016, 0.044),
      knuckleMat
    );
    leftKnuckle.position.set(-0.020, 0.016, 0.002);

    // 4 dedos da mão esquerda sobrepostos na frente do punho sem deixar vãos
    for (let f = 0; f < 4; f++) {
      const yOff = 0.014 - f * 0.0135;
      const supportFinger = new THREE.Mesh(
        new THREE.BoxGeometry(0.036, 0.012, 0.022),
        fingerTipMat
      );
      supportFinger.position.set(-0.002, yOff, -0.024);
      leftHandGroup.add(supportFinger);
    }

    // Polegar esquerdo apontado à frente ao longo do chassi (frame) da pistola
    const leftThumb = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.015, 0.046),
      fingerTipMat
    );
    leftThumb.position.set(-0.016, 0.026, -0.018);
    leftThumb.rotation.x = 0.14;

    leftHandGroup.add(leftPalm, leftKnuckle, leftThumb);
    leftWristPos = leftGripPos.clone().add(new THREE.Vector3(-0.024, -0.020, 0.036));
  } else {
    // EMPUNHADURA FRONTAL EM C-CLAMP / BERÇO (FUZIS, ESCOPETAS, SMGS, BULLPUP E SNIPERS):
    // Palma esquerda sustenta a face inferior do guarda-mão / telha pump, com dedos curvados nas laterais
    leftHandGroup.rotation.set(0.06, -0.14, 0.12);

    // Palma inferior encaixada sob o guarda-mão (handguard / forend)
    const underPalm = new THREE.Mesh(
      new THREE.BoxGeometry(0.044, 0.020, 0.068),
      gloveMat
    );
    underPalm.position.set(0.0, -0.018, 0.0);

    const underKnuckle = new THREE.Mesh(
      new THREE.BoxGeometry(0.042, 0.014, 0.056),
      knuckleMat
    );
    underKnuckle.position.set(-0.006, -0.024, 0.004);

    // 4 dedos curvados subindo pela lateral direita do guarda-mão
    for (let f = 0; f < 4; f++) {
      const zOff = -0.022 + f * 0.015;
      const sideFinger = new THREE.Mesh(
        new THREE.BoxGeometry(0.014, 0.034, 0.013),
        fingerTipMat
      );
      sideFinger.position.set(0.020, -0.002, zOff);
      sideFinger.rotation.z = 0.18;
      leftHandGroup.add(sideFinger);
    }

    // Polegar esquerdo envolvendo a lateral esquerda/superior do guarda-mão
    const cClampThumb = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.036, 0.022),
      fingerTipMat
    );
    cClampThumb.position.set(-0.020, 0.002, -0.006);
    cClampThumb.rotation.z = -0.24;

    leftHandGroup.add(underPalm, underKnuckle, cClampThumb);
    leftWristPos = leftGripPos.clone().add(new THREE.Vector3(-0.018, -0.026, 0.034));
  }

  leftArmRig.add(leftHandGroup);

  const leftForearm = createConnectedForearmSegment(
    leftWristPos,
    leftShoulderPos,
    sleeveMat,
    knuckleMat,
    skinMat,
    isPM
  );
  leftArmRig.add(leftForearm);

  return { rightArmRig, leftArmRig };
}

/**
 * Constrói uma malha procedural enxuta de fallback imediato (exibida apenas nos primeiros
 * milissegundos caso o GLB ainda não esteja no cache em memória).
 */
function buildLightweightProceduralFallback(
  spec: WeaponSpec,
  config: WeaponGlbVisualConfig,
  pal: WeaponMaterialPalette
): THREE.Group {
  const fallback = new THREE.Group();
  fallback.name = `ProceduralFallback_${spec.id}`;

  const [wx, wy, wz] = config.fpPosition;
  const L = config.fpTargetLength;

  if (spec.isMelee) {
    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.018, L * 0.36, 8),
      pal.polymerBlack
    );
    handle.rotation.x = Math.PI / 2;
    handle.position.set(wx, wy, wz + L * 0.18);

    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.008, 0.032, L * 0.64),
      pal.chromeInox
    );
    blade.position.set(wx, wy + 0.005, wz - L * 0.16);
    fallback.add(handle, blade);
  } else {
    const isPistol =
      config.gripStyle === 'pistol_two_hand' || config.gripStyle === 'revolver_two_hand';
    const bodyH = isPistol ? 0.042 : 0.064;
    const bodyW = isPistol ? 0.034 : 0.046;

    const receiver = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW, bodyH, L * 0.85),
      pal.steelGraphite
    );
    receiver.position.set(wx, wy + 0.02, wz);

    const gripPos = computeFirstPersonGripAnchor(config, config.fpRightGripNorm);
    const grip = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW * 0.82, 0.095, 0.048),
      pal.polymerBlack
    );
    grip.position.copy(gripPos);
    grip.rotation.x = -0.26;

    fallback.add(receiver, grip);
  }

  return fallback;
}

/**
 * Constrói o Modelo 3D em 1ª Pessoa (Viewmodel) de qualquer uma das 26 armas do Arsenal,
 * organizando em subgrupos separados:
 * 1. RightArmRig (Mão principal + Antebraço direito)
 * 2. LeftArmRig (Mão secundária + Antebraço esquerdo)
 * 3. WeaponAssembly (Modelo GLB principal + Acessórios calibrados)
 * 4. MuzzleFlashMesh (Clarão do cano sincronizado com fpMuzzlePos)
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
  weaponGroup.name = `FirstPersonViewmodel_${spec.id}`;
  weaponGroup.userData.isFirstPersonViewmodel = true;
  weaponGroup.userData.weaponId = spec.id;

  const glbCfg =
    WEAPON_GLB_VISUAL_CONFIGS[spec.id] || WEAPON_GLB_VISUAL_CONFIGS.ak47;

  // 1. Constrói mãos e braços calibrados para os pontos de empunhadura exatos desta arma
  const { rightArmRig, leftArmRig } = buildCalibratedHandsAndArmsRig(
    glbCfg,
    playerTeam
  );
  weaponGroup.add(rightArmRig);
  if (leftArmRig) {
    weaponGroup.add(leftArmRig);
  }
  weaponGroup.userData.rightArmRig = rightArmRig;
  weaponGroup.userData.leftArmRig = leftArmRig;

  // 2. Fallback procedural leve (removido automaticamente assim que o GLB resolve do cache)
  const proceduralFallbackGroup = buildLightweightProceduralFallback(
    spec,
    glbCfg,
    pal
  );
  weaponGroup.add(proceduralFallbackGroup);

  // 3. Clarão de disparo (Muzzle Flash) posicionado na ponta exata do cano (fpMuzzlePos)
  let muzzleFlashMesh: THREE.Mesh | null = null;
  if (!spec.isMelee) {
    const isHeavyFlash =
      spec.pellets !== undefined ||
      spec.id === 'deagle' ||
      spec.id.startsWith('revolver_') ||
      spec.id === 'awp' ||
      spec.id.startsWith('sniper_');
    muzzleFlashMesh = new THREE.Mesh(
      new THREE.ConeGeometry(isHeavyFlash ? 0.095 : 0.068, isHeavyFlash ? 0.22 : 0.16, 6),
      new THREE.MeshBasicMaterial({ color: 0xfde047 })
    );
    muzzleFlashMesh.rotation.x = -Math.PI / 2;
    muzzleFlashMesh.position.set(...glbCfg.fpMuzzlePos);
    muzzleFlashMesh.visible = false;
    weaponGroup.add(muzzleFlashMesh);
  }

  // 4. Acopla o modelo 3D GLB + acessórios calibrados (garantindo que a faca só apareça no Slot 1)
  attachFirstPersonGlbToViewmodel(spec.id, weaponGroup, proceduralFallbackGroup);

  return { weaponGroup, muzzleFlashMesh };
}
