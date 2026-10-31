import * as THREE from 'three';

export interface BuiltCharacterModel {
  group: THREE.Group;
  headMesh: THREE.Mesh;
  torsoMesh: THREE.Mesh;
  chestRig: THREE.Mesh;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  muzzleFlash: THREE.Mesh;
  bodyMat: THREE.MeshStandardMaterial;
  headMat: THREE.MeshStandardMaterial;
  baseBodyColor: number;
  baseHeadColor: number;
}

// Cache global de texturas e geometrias prismáticas para performance máxima
const textureCache: Record<string, THREE.CanvasTexture> = {};
const prismGeoCache: Record<string, THREE.BufferGeometry> = {};

/**
 * Construtor de Prisma Trapezoidal Low-Poly (Estilo Geométrico CS 1.6)
 * Gera um tronco de pirâmide / prisma angulado de 6 faces (12 triângulos não-indexados
 * para iluminação facetada nítida) com larguras/profundidades independentes no topo e na base,
 * deslocamento vertical de pivô (`pivotY`) para articulações de ombro/quadril/cotovelo/joelho,
 * e inclinação frontal (`topForwardShiftZ`) para postura anatômica.
 */
function createAngledPrismGeometry(
  topW: number,
  topD: number,
  bottomW: number,
  bottomD: number,
  height: number,
  pivotY: number = 0,
  topForwardShiftZ: number = 0
): THREE.BufferGeometry {
  const cacheKey = `${topW}_${topD}_${bottomW}_${bottomD}_${height}_${pivotY}_${topForwardShiftZ}`;
  if (prismGeoCache[cacheKey]) return prismGeoCache[cacheKey];

  const yTop = height / 2 + pivotY;
  const yBot = -height / 2 + pivotY;

  const tw = topW / 2;
  const td = topD / 2;
  const bw = bottomW / 2;
  const bd = bottomD / 2;
  const sz = topForwardShiftZ;

  // 8 vértices do prisma trapezoidal angulado
  const v = [
    [-tw, yTop, td + sz], // 0: Topo Frente Esq
    [tw, yTop, td + sz], // 1: Topo Frente Dir
    [tw, yTop, -td + sz], // 2: Topo Trás Dir
    [-tw, yTop, -td + sz], // 3: Topo Trás Esq
    [-bw, yBot, bd], // 4: Base Frente Esq
    [bw, yBot, bd], // 5: Base Frente Dir
    [bw, yBot, -bd], // 6: Base Trás Dir
    [-bw, yBot, -bd], // 7: Base Trás Esq
  ];

  const positions: number[] = [];
  const uvs: number[] = [];

  const pushQuad = (a: number[], b: number[], c: number[], d: number[]) => {
    // Triângulo 1 (a, b, c)
    positions.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    uvs.push(0, 1, 1, 1, 1, 0);
    // Triângulo 2 (a, c, d)
    positions.push(a[0], a[1], a[2], c[0], c[1], c[2], d[0], d[1], d[2]);
    uvs.push(0, 1, 1, 0, 0, 0);
  };

  // Frente, Trás, Direita, Esquerda, Topo e Base
  pushQuad(v[0], v[1], v[5], v[4]); // Frente (+Z)
  pushQuad(v[2], v[3], v[7], v[6]); // Costas (-Z)
  pushQuad(v[1], v[2], v[6], v[5]); // Direita (+X)
  pushQuad(v[3], v[0], v[4], v[7]); // Esquerda (-X)
  pushQuad(v[3], v[2], v[1], v[0]); // Topo (+Y)
  pushQuad(v[4], v[5], v[6], v[7]); // Base (-Y)

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  geo.computeBoundingBox();

  prismGeoCache[cacheKey] = geo;
  return geo;
}

/**
 * 1. Textura Procedural: Camisa Rubro-Negra Principal (Listras horizontais vermelhas e pretas + CRF)
 */
function getFlamengoHomeTexture(): THREE.CanvasTexture {
  if (textureCache.flamengoHome) return textureCache.flamengoHome;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const stripeCount = 8;
  const stripeH = canvas.height / stripeCount;
  for (let i = 0; i < stripeCount; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#d91c24' : '#121215';
    ctx.fillRect(0, i * stripeH, canvas.width, stripeH);
  }

  // Gola V preta esportiva angulada
  ctx.fillStyle = '#09090b';
  ctx.beginPath();
  ctx.moveTo(80, 0);
  ctx.lineTo(176, 0);
  ctx.lineTo(128, 36);
  ctx.closePath();
  ctx.fill();

  // Monograma CRF branco e estrela dourada
  ctx.fillStyle = '#f8fafc';
  ctx.font = '900 20px sans-serif';
  ctx.fillText('CRF', 64, 68);
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(72, 42, 12, 6);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(168, 54, 18, 8);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  textureCache.flamengoHome = tex;
  return tex;
}

/**
 * 2. Textura Procedural: Camisa 2 Branca com Faixa Rubro-Negra no Peito
 */
function getFlamengoAwayTexture(): THREE.CanvasTexture {
  if (textureCache.flamengoAway) return textureCache.flamengoAway;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f4f4f6';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#121215';
  ctx.fillRect(0, 0, canvas.width, 18);

  ctx.fillStyle = '#d91c24';
  ctx.fillRect(0, 56, canvas.width, 32);
  ctx.fillStyle = '#121215';
  ctx.fillRect(0, 88, canvas.width, 32);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 19px sans-serif';
  ctx.fillText('CRF', 68, 80);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  textureCache.flamengoAway = tex;
  return tex;
}

/**
 * 3. Textura Procedural: Camisa de Futebol Amarela e Verde (Estilo Seleção)
 */
function getBrazilJerseyTexture(): THREE.CanvasTexture {
  if (textureCache.brazilJersey) return textureCache.brazilJersey;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#facc15';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#15803d';
  ctx.fillRect(0, 0, canvas.width, 22);
  ctx.fillRect(0, 234, canvas.width, 22);

  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(164, 52, 22, 26);
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 3;
  ctx.strokeRect(164, 52, 22, 26);

  ctx.fillStyle = '#15803d';
  ctx.font = '900 34px sans-serif';
  ctx.fillText('10', 106, 135);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  textureCache.brazilJersey = tex;
  return tex;
}

/**
 * 4. Textura Procedural: Regata Urbana Branca Canelada
 */
function getWhiteTankTopTexture(): THREE.CanvasTexture {
  if (textureCache.whiteTank) return textureCache.whiteTank;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#e2e8f0';
  for (let x = 0; x < canvas.width; x += 8) {
    ctx.fillRect(x, 0, 3, canvas.height);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  textureCache.whiteTank = tex;
  return tex;
}

/**
 * 5. Textura Procedural: Colete Balístico da Polícia Militar (PM / BOPE / CHOQUE / GATE)
 */
function getPMVestTexture(badgeLabel: string = 'PM'): THREE.CanvasTexture {
  const key = `pmVest_${badgeLabel}`;
  if (textureCache[key]) return textureCache[key];

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#101216';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#181c22';
  for (let y = 96; y < 220; y += 26) {
    ctx.fillRect(20, y, canvas.width - 40, 12);
  }
  ctx.fillStyle = '#0b0d10';
  for (let x = 52; x <= 204; x += 38) {
    ctx.fillRect(x, 130, 6, 78);
  }

  ctx.fillStyle = '#08090c';
  ctx.fillRect(54, 34, 148, 46);
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 2;
  ctx.strokeRect(54, 34, 148, 46);

  ctx.fillStyle = '#16a34a';
  ctx.fillRect(62, 44, 18, 13);
  ctx.fillStyle = '#facc15';
  ctx.fillRect(62, 57, 18, 13);

  ctx.fillStyle = '#f8fafc';
  ctx.font = badgeLabel.length > 3 ? '900 22px sans-serif' : '900 30px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(badgeLabel, 138, 66);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  textureCache[key] = tex;
  return tex;
}

/**
 * Constrói o Tronco Geométrico Articulado Estilo CS 1.6 (Prismas Trapezoidais Conectados):
 * - Tórax superior em V (largo nos ombros, afunilando até a cintura)
 * - Placas peitorais anguladas + Trapézio superior
 * - Abdômen prismático articulado à cintura
 * - Pelve / Quadril chanfrado com encaixe para as coxas
 * - Pescoço prismático hexagonal/trapezoidal articulado ao crânio
 */
function createArticulatedCS16Torso(
  bodyMat: THREE.Material,
  hipMat: THREE.Material,
  neckMat: THREE.Material,
  isSoftwareGl: boolean
): THREE.Mesh {
  // Raiz do tronco (prisma trapezoidal em V que também atua como hitbox central)
  const torsoGeo = createAngledPrismGeometry(0.62, 0.34, 0.44, 0.26, 0.84, 0, 0.01);
  const torsoRoot = new THREE.Mesh(torsoGeo, bodyMat);
  torsoRoot.position.set(0, 1.09, 0);
  torsoRoot.castShadow = !isSoftwareGl;

  // Placas Peitorais Chanfradas (Esquerda e Direita) formando o relevo peitoral do CS 1.6
  const pecGeo = createAngledPrismGeometry(0.27, 0.08, 0.23, 0.05, 0.28, 0, 0.015);
  const leftPec = new THREE.Mesh(pecGeo, bodyMat);
  leftPec.position.set(-0.14, 0.19, 0.16);
  leftPec.rotation.y = 0.10;
  const rightPec = new THREE.Mesh(pecGeo, bodyMat);
  rightPec.position.set(0.14, 0.19, 0.16);
  rightPec.rotation.y = -0.10;
  torsoRoot.add(leftPec, rightPec);

  // Trapézio / Ombros Superiores Inclinados conectando o tórax ao pescoço
  const trapGeo = createAngledPrismGeometry(0.32, 0.22, 0.58, 0.32, 0.10, 0, 0);
  const trapezius = new THREE.Mesh(trapGeo, bodyMat);
  trapezius.position.set(0, 0.44, -0.01);
  torsoRoot.add(trapezius);

  // Abdômen / Cintura Articulada (prisma afilado conectando tórax e pelve)
  const abdomenGeo = createAngledPrismGeometry(0.45, 0.27, 0.47, 0.29, 0.22, 0, 0);
  const abdomen = new THREE.Mesh(abdomenGeo, bodyMat);
  abdomen.position.set(0, -0.22, 0.01);
  torsoRoot.add(abdomen);

  // Pelve / Quadril Anatômico Chanfrado (base onde as pernas articulam)
  const pelvisGeo = createAngledPrismGeometry(0.48, 0.29, 0.52, 0.31, 0.20, 0, 0);
  const pelvis = new THREE.Mesh(pelvisGeo, hipMat);
  pelvis.position.set(0, -0.39, 0);
  const groinWedge = new THREE.Mesh(
    createAngledPrismGeometry(0.18, 0.30, 0.12, 0.22, 0.12, 0, 0),
    hipMat
  );
  groinWedge.position.set(0, -0.46, 0);
  torsoRoot.add(pelvis, groinWedge);

  // Pescoço Articulado (Coluna cervical prismática inclinada levemente à frente)
  const neckGeo = createAngledPrismGeometry(0.18, 0.18, 0.23, 0.21, 0.17, 0, 0.015);
  const neckJoint = new THREE.Mesh(neckGeo, neckMat);
  neckJoint.position.set(0, 0.52, 0.01);
  torsoRoot.add(neckJoint);

  return torsoRoot;
}

/**
 * Constrói a Cabeça Facetada Low-Poly Estilo CS 1.6:
 * Crânio prismático + Mandíbula/Queixo chanfrado em V + Arcada supraorbital (testa/sobrancelha)
 * + Nariz piramidal + Orelhas anguladas.
 */
function createArticulatedCS16Head(
  headMat: THREE.Material,
  skinMat: THREE.Material,
  hasExposedFace: boolean,
  isSoftwareGl: boolean
): THREE.Mesh {
  // Crânio principal prismático (levemente mais largo nas têmporas do que na base)
  const craniumGeo = createAngledPrismGeometry(0.37, 0.40, 0.39, 0.38, 0.32, 0, 0.01);
  const headRoot = new THREE.Mesh(craniumGeo, headMat);
  headRoot.position.set(0, 1.77, 0.01);
  headRoot.castShadow = !isSoftwareGl;

  // Mandíbula / Queixo afunilado estilo CS 1.6 (largo nos maxilares, estreito no queixo)
  const jawGeo = createAngledPrismGeometry(0.38, 0.37, 0.25, 0.28, 0.16, 0, 0.025);
  const jawPrism = new THREE.Mesh(jawGeo, headMat);
  jawPrism.position.set(0, -0.18, 0.02);
  headRoot.add(jawPrism);

  // Arcada da testa / Sobrancelha chanfrada
  const browGeo = createAngledPrismGeometry(0.37, 0.06, 0.35, 0.04, 0.06, 0, 0.01);
  const browRidge = new THREE.Mesh(browGeo, headMat);
  browRidge.position.set(0, 0.07, 0.19);
  headRoot.add(browRidge);

  if (hasExposedFace) {
    // Nariz em cunha prismática
    const noseGeo = createAngledPrismGeometry(0.04, 0.04, 0.075, 0.085, 0.11, 0, 0.02);
    const nosePrism = new THREE.Mesh(noseGeo, skinMat);
    nosePrism.position.set(0, -0.02, 0.21);
    headRoot.add(nosePrism);

    // Orelhas laterais chanfradas
    const earGeo = createAngledPrismGeometry(0.04, 0.08, 0.03, 0.06, 0.11, 0, 0);
    const leftEar = new THREE.Mesh(earGeo, skinMat);
    leftEar.position.set(-0.20, -0.02, -0.01);
    const rightEar = new THREE.Mesh(earGeo, skinMat);
    rightEar.position.set(0.20, -0.02, -0.01);
    headRoot.add(leftEar, rightEar);
  }

  return headRoot;
}

// ============================================================================
// EQUIPE 1: POLÍCIA MILITAR BRASILEIRA (PM) — 6 VARIAÇÕES TÁTICAS LOW-POLY
// ============================================================================
function buildPMVariantModel(variantIndex: number, isSoftwareGl: boolean): BuiltCharacterModel {
  const v = ((variantIndex % 6) + 6) % 6;
  const group = new THREE.Group();

  const uniformColors = [0x14171d, 0x0f1115, 0x161920, 0x12151a, 0x151921, 0x111318];
  const skinTones = [0xc68c5a, 0xb87d4b, 0xd19a6a, 0x9f683d, 0xc98e5e, 0xad7344];

  const baseBodyColor = uniformColors[v];
  const hasBalaclava = v !== 3 && v !== 4;
  const baseHeadColor = hasBalaclava ? 0x14161b : skinTones[v];

  const bodyMat = new THREE.MeshStandardMaterial({
    color: baseBodyColor,
    roughness: 0.78,
    metalness: 0.12,
  });
  const headMat = new THREE.MeshStandardMaterial({
    color: baseHeadColor,
    roughness: 0.68,
    metalness: 0.08,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: skinTones[v],
    roughness: 0.65,
  });
  const gearBlackMat = new THREE.MeshStandardMaterial({
    color: 0x0a0c0f,
    roughness: 0.42,
    metalness: 0.32,
  });
  const darkGreyMat = new THREE.MeshStandardMaterial({
    color: 0x262930,
    roughness: 0.55,
    metalness: 0.25,
  });

  const badgeLabels = ['PM', 'BOPE', 'CHOQUE', 'GATE', 'PM', 'PM'];
  const vestMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: getPMVestTexture(badgeLabels[v]),
    roughness: 0.6,
    metalness: 0.2,
  });

  // 1. PERNAS ARTICULADAS NO QUADRIL E JOELHO (Prismas de Coxa + Joelho + Panturrilha + Coturno)
  const thighGeo = createAngledPrismGeometry(0.24, 0.26, 0.19, 0.21, 0.34, -0.17, 0);
  const calfGeo = createAngledPrismGeometry(0.19, 0.21, 0.16, 0.18, 0.30, -0.15, 0);
  const bootShaftGeo = createAngledPrismGeometry(0.18, 0.20, 0.20, 0.23, 0.18, 0, 0);
  const bootFootGeo = createAngledPrismGeometry(0.20, 0.24, 0.22, 0.31, 0.11, 0, 0.03);

  const createPMLeg = (offsetX: number) => {
    // Raiz posicionada na articulação do quadril (y = 0.66) para balanço natural na caminhada
    const legRoot = new THREE.Mesh(thighGeo, bodyMat);
    legRoot.position.set(offsetX, 0.66, 0);

    // Bolso tático lateral na coxa
    const cargoPocket = new THREE.Mesh(
      createAngledPrismGeometry(0.04, 0.15, 0.03, 0.13, 0.17, 0, 0),
      darkGreyMat
    );
    cargoPocket.position.set(offsetX < 0 ? -0.12 : 0.12, -0.16, 0);
    legRoot.add(cargoPocket);

    // Articulação do Joelho + Panturrilha prismática (levemente flexionada em postura tática)
    const kneeJoint = new THREE.Mesh(calfGeo, bodyMat);
    kneeJoint.position.set(0, -0.33, 0.01);
    kneeJoint.rotation.x = 0.06;
    legRoot.add(kneeJoint);

    // Joelheira tática chanfrada (ou caneleira inteiriça na tropa de Choque v=2)
    const kneePad = new THREE.Mesh(
      createAngledPrismGeometry(0.21, 0.07, 0.18, 0.06, v === 2 ? 0.28 : 0.13, 0, 0.01),
      gearBlackMat
    );
    kneePad.position.set(0, v === 2 ? -0.10 : 0.0, 0.11);
    kneeJoint.add(kneePad);

    // Coturno militar preto angulado na extremidade da canela
    const bootShaft = new THREE.Mesh(bootShaftGeo, gearBlackMat);
    bootShaft.position.set(0, -0.22, 0);
    const bootFoot = new THREE.Mesh(bootFootGeo, gearBlackMat);
    bootFoot.position.set(0, -0.28, 0.04);
    kneeJoint.add(bootShaft, bootFoot);

    return legRoot;
  };

  const leftLeg = createPMLeg(-0.155);
  const rightLeg = createPMLeg(0.155);

  // 2. TRONCO GEOMÉTRICO ARTICULADO + COLETE BALÍSTICO PRISMÁTICO
  const torsoMesh = createArticulatedCS16Torso(
    bodyMat,
    gearBlackMat,
    hasBalaclava ? headMat : skinMat,
    isSoftwareGl
  );

  // Colete Balístico Modular com Placa Peitoral Trapezoidal
  const vestGeo = createAngledPrismGeometry(0.64, 0.42, 0.54, 0.36, 0.48, 0, 0.01);
  const chestRig = new THREE.Mesh(vestGeo, vestMat);
  chestRig.position.set(0, 1.15, 0.01);

  // Alças trapezoidais nos ombros do colete
  const strapGeo = createAngledPrismGeometry(0.13, 0.38, 0.15, 0.40, 0.10, 0, 0);
  const leftStrap = new THREE.Mesh(strapGeo, gearBlackMat);
  leftStrap.position.set(-0.21, 0.26, 0);
  const rightStrap = new THREE.Mesh(strapGeo, gearBlackMat);
  rightStrap.position.set(0.21, 0.26, 0);
  chestRig.add(leftStrap, rightStrap);

  // Porta-carregadores prismáticos 3D no abdômen
  const pouchGeo = createAngledPrismGeometry(0.10, 0.06, 0.09, 0.05, 0.17, 0, 0);
  for (let m = -1; m <= 1; m++) {
    const magPouch = new THREE.Mesh(pouchGeo, gearBlackMat);
    magPouch.position.set(m * 0.13, -0.08, 0.21);
    chestRig.add(magPouch);
  }

  // Rádio comunicador + antena prismática no ombro esquerdo
  const radioBody = new THREE.Mesh(
    createAngledPrismGeometry(0.08, 0.06, 0.08, 0.06, 0.14, 0, 0),
    gearBlackMat
  );
  radioBody.position.set(-0.21, 0.16, 0.21);
  const radioAntenna = new THREE.Mesh(
    createAngledPrismGeometry(0.012, 0.012, 0.018, 0.018, 0.22, 0, 0),
    gearBlackMat
  );
  radioAntenna.position.set(-0.23, 0.32, 0.21);
  chestRig.add(radioBody, radioAntenna);

  // Cinto tático de guarnição + coldre na coxa direita
  const dutyBelt = new THREE.Mesh(
    createAngledPrismGeometry(0.54, 0.34, 0.56, 0.36, 0.09, 0, 0),
    gearBlackMat
  );
  dutyBelt.position.set(0, -0.29, 0);
  const holster = new THREE.Mesh(
    createAngledPrismGeometry(0.09, 0.16, 0.07, 0.13, 0.21, 0, 0),
    gearBlackMat
  );
  holster.position.set(0.29, -0.36, 0.03);
  chestRig.add(dutyBelt, holster);

  if (v === 1 || v === 5) {
    const assaultPack = new THREE.Mesh(
      createAngledPrismGeometry(0.36, 0.16, 0.40, 0.19, 0.42, 0, 0),
      gearBlackMat
    );
    assaultPack.position.set(0, 0.02, -0.26);
    chestRig.add(assaultPack);
  }

  // 3. CABEÇA FACETADA CS 1.6 E CAPACETES/BONÉS POR VARIAÇÃO
  const headMesh = createArticulatedCS16Head(headMat, skinMat, !hasBalaclava, isSoftwareGl);

  if (hasBalaclava) {
    const eyeCutout = new THREE.Mesh(
      createAngledPrismGeometry(0.32, 0.04, 0.30, 0.04, 0.08, 0, 0),
      skinMat
    );
    eyeCutout.position.set(0, 0.03, 0.195);
    const pupils = new THREE.Mesh(
      createAngledPrismGeometry(0.22, 0.045, 0.22, 0.045, 0.035, 0, 0),
      gearBlackMat
    );
    pupils.position.set(0, 0.03, 0.198);
    headMesh.add(eyeCutout, pupils);
  } else {
    const eyes = new THREE.Mesh(
      createAngledPrismGeometry(0.26, 0.03, 0.26, 0.03, 0.035, 0, 0),
      gearBlackMat
    );
    eyes.position.set(0, 0.04, 0.195);
    headMesh.add(eyes);

    if (v === 3) {
      const beard = new THREE.Mesh(
        createAngledPrismGeometry(0.36, 0.36, 0.26, 0.29, 0.14, 0, 0.02),
        gearBlackMat
      );
      beard.position.set(0, -0.17, 0.025);
      headMesh.add(beard);
    }
  }

  if (v === 0 || v === 1 || v === 2 || v === 5) {
    // Capacete Balístico Facetado (Domo Octogonal/Trapezoidal + Aba Angulada)
    const helmetDome = new THREE.Mesh(
      createAngledPrismGeometry(0.36, 0.40, 0.44, 0.46, 0.19, 0, 0),
      gearBlackMat
    );
    helmetDome.position.set(0, 0.16, -0.01);
    const helmetRim = new THREE.Mesh(
      createAngledPrismGeometry(0.45, 0.47, 0.46, 0.48, 0.06, 0, 0.01),
      darkGreyMat
    );
    helmetRim.position.set(0, 0.08, 0);
    headMesh.add(helmetDome, helmetRim);

    if (v === 2) {
      // CHOQUE: Viseira balística acrílica chanfrada
      const riotVisor = new THREE.Mesh(
        createAngledPrismGeometry(0.44, 0.06, 0.38, 0.08, 0.26, 0, 0.02),
        new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.1,
          metalness: 0.9,
          transparent: true,
          opacity: 0.55,
        })
      );
      riotVisor.position.set(0, -0.03, 0.23);
      headMesh.add(riotVisor);
    } else {
      const lensColor = v === 1 ? 0xf59e0b : v === 5 ? 0x94a3b8 : 0x090d16;
      const gogglesFrame = new THREE.Mesh(
        createAngledPrismGeometry(0.41, 0.42, 0.41, 0.42, 0.11, 0, 0),
        gearBlackMat
      );
      gogglesFrame.position.set(0, 0.03, 0.01);
      const gogglesLens = new THREE.Mesh(
        createAngledPrismGeometry(0.35, 0.04, 0.33, 0.04, 0.08, 0, 0),
        new THREE.MeshStandardMaterial({ color: lensColor, roughness: 0.15, metalness: 0.85 })
      );
      gogglesLens.position.set(0, 0.03, 0.21);
      headMesh.add(gogglesFrame, gogglesLens);
    }
  } else if (v === 3) {
    // GATE: Boné tático chanfrado para trás + Óculos escuros + Headset
    const capCrown = new THREE.Mesh(
      createAngledPrismGeometry(0.36, 0.38, 0.40, 0.42, 0.15, 0, 0),
      gearBlackMat
    );
    capCrown.position.set(0, 0.15, 0);
    const backVisor = new THREE.Mesh(
      createAngledPrismGeometry(0.34, 0.18, 0.28, 0.20, 0.035, 0, 0),
      gearBlackMat
    );
    backVisor.position.set(0, 0.09, -0.26);
    const sunglasses = new THREE.Mesh(
      createAngledPrismGeometry(0.36, 0.05, 0.34, 0.05, 0.075, 0, 0),
      gearBlackMat
    );
    sunglasses.position.set(0, 0.04, 0.20);
    const earCupGeo = createAngledPrismGeometry(0.06, 0.11, 0.06, 0.10, 0.13, 0, 0);
    const earCupL = new THREE.Mesh(earCupGeo, darkGreyMat);
    earCupL.position.set(-0.21, 0.0, 0);
    const earCupR = new THREE.Mesh(earCupGeo, darkGreyMat);
    earCupR.position.set(0.21, 0.0, 0);
    headMesh.add(capCrown, backVisor, sunglasses, earCupL, earCupR);
  } else if (v === 4) {
    // PATRULHA: Boné tático para a frente com insígnia dourada
    const capCrown = new THREE.Mesh(
      createAngledPrismGeometry(0.36, 0.38, 0.40, 0.42, 0.15, 0, 0),
      gearBlackMat
    );
    capCrown.position.set(0, 0.15, 0);
    const frontVisor = new THREE.Mesh(
      createAngledPrismGeometry(0.36, 0.20, 0.30, 0.22, 0.035, 0, 0),
      gearBlackMat
    );
    frontVisor.position.set(0, 0.09, 0.26);
    const capBadge = new THREE.Mesh(
      createAngledPrismGeometry(0.08, 0.02, 0.10, 0.02, 0.07, 0, 0),
      new THREE.MeshBasicMaterial({ color: 0xfacc15 })
    );
    capBadge.position.set(0, 0.15, 0.20);
    headMesh.add(capCrown, frontVisor, capBadge);
  }

  // 4. BRAÇOS ARTICULADOS NO OMBRO E COTOVELO (Deltoide + Bíceps + Cotovelo + Antebraço + Luva)
  const patchMat = new THREE.MeshBasicMaterial({
    color: v === 1 ? 0xef4444 : 0xfacc15,
  });
  const hasRolledSleeves = v === 5;
  const upperArmGeo = createAngledPrismGeometry(0.21, 0.21, 0.16, 0.16, 0.31, -0.15, 0);
  const forearmGeo = createAngledPrismGeometry(0.16, 0.16, 0.13, 0.13, 0.28, -0.14, 0);
  const gloveGeo = createAngledPrismGeometry(0.14, 0.15, 0.15, 0.18, 0.14, -0.07, 0);

  const createPMArm = (isLeft: boolean, rotX: number) => {
    const offsetX = isLeft ? -0.39 : 0.39;
    // Raiz posicionada no encaixe do ombro (y = 1.40)
    const armRoot = new THREE.Mesh(upperArmGeo, bodyMat);
    armRoot.position.set(offsetX, 1.40, 0.04);
    armRoot.rotation.x = rotX;

    // Patch tático no deltoide lateral
    const patch = new THREE.Mesh(
      createAngledPrismGeometry(0.02, 0.09, 0.02, 0.08, 0.09, 0, 0),
      patchMat
    );
    patch.position.set(isLeft ? -0.105 : 0.105, -0.11, 0);
    armRoot.add(patch);

    // Articulação do Cotovelo + Antebraço prismático angulado em direção à arma
    const elbowJoint = new THREE.Mesh(
      forearmGeo,
      hasRolledSleeves ? skinMat : bodyMat
    );
    elbowJoint.position.set(0, -0.29, 0);
    elbowJoint.rotation.x = -0.36;
    elbowJoint.rotation.y = isLeft ? -0.22 : 0.12;
    armRoot.add(elbowJoint);

    if (!hasRolledSleeves) {
      const elbowPad = new THREE.Mesh(
        createAngledPrismGeometry(0.17, 0.06, 0.15, 0.05, 0.11, 0, 0),
        gearBlackMat
      );
      elbowPad.position.set(0, -0.02, -0.08);
      elbowJoint.add(elbowPad);
    }

    // Luva tática preta articulada no pulso
    const glove = new THREE.Mesh(gloveGeo, gearBlackMat);
    glove.position.set(0, -0.26, 0.01);
    elbowJoint.add(glove);

    return armRoot;
  };

  const leftArm = createPMArm(true, -0.55);
  const rightArm = createPMArm(false, -0.75);

  // 5. ARMAMENTO POLICIAL BRASILEIRO EM 3ª PESSOA POR VARIAÇÃO:
  // v=0,3: IMBEL IA2 5.56mm (Trilho + Mira Red-Dot + Guarda-mão ventilado)
  // v=1,4: FN FAL / ParaFAL 7.62mm (Cano longo + Quebra-chamas + Carregador reto 7.62 + Alça)
  // v=2,5: CBC Pump Military 12G (Escopeta tática com tubo inferior e escudo térmico)
  const botGun = new THREE.Mesh(
    createAngledPrismGeometry(
      0.075,
      v === 1 || v === 4 ? 0.88 : 0.76,
      0.085,
      v === 1 || v === 4 ? 0.86 : 0.74,
      0.11,
      0,
      0
    ),
    gearBlackMat
  );
  botGun.position.set(0.32, 1.08, 0.50);

  if (v === 2 || v === 5) {
    // CBC Pump Military 12G nas mãos do Choque e Incursão
    const tubeMag3P = new THREE.Mesh(
      createAngledPrismGeometry(0.045, 0.58, 0.045, 0.58, 0.045, 0, 0),
      darkGreyMat
    );
    tubeMag3P.position.set(0, -0.055, 0.10);
    const pumpForend3P = new THREE.Mesh(
      createAngledPrismGeometry(0.085, 0.24, 0.085, 0.24, 0.07, 0, 0),
      gearBlackMat
    );
    pumpForend3P.position.set(0, -0.055, 0.08);
    botGun.add(tubeMag3P, pumpForend3P);
  } else if (v === 1 || v === 4) {
    // IMBEL ParaFAL 7.62mm (Carregador reto + Quebra-chamas longo)
    const falMag3P = new THREE.Mesh(
      createAngledPrismGeometry(0.055, 0.11, 0.055, 0.10, 0.22, 0, 0.01),
      darkGreyMat
    );
    falMag3P.position.set(0, -0.15, 0.04);
    const flashHider3P = new THREE.Mesh(
      createAngledPrismGeometry(0.04, 0.16, 0.04, 0.16, 0.04, 0, 0),
      darkGreyMat
    );
    flashHider3P.position.set(0, 0.02, 0.46);
    botGun.add(falMag3P, flashHider3P);
  } else {
    // IMBEL IA2 5.56mm (Mira Óptica Red-Dot + Guarda-mão + Carregador STANAG)
    const ia2Optic3P = new THREE.Mesh(
      createAngledPrismGeometry(0.06, 0.11, 0.065, 0.12, 0.065, 0, 0),
      darkGreyMat
    );
    ia2Optic3P.position.set(0, 0.08, -0.02);
    const gunMag = new THREE.Mesh(
      createAngledPrismGeometry(0.055, 0.09, 0.055, 0.08, 0.21, 0, 0.04),
      darkGreyMat
    );
    gunMag.position.set(0, -0.14, 0.05);
    botGun.add(ia2Optic3P, gunMag);
  }

  const muzzleFlash = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.13, 0),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
  );
  muzzleFlash.position.set(0.32, 1.08, 0.96);
  muzzleFlash.visible = false;

  group.add(
    leftLeg,
    rightLeg,
    torsoMesh,
    chestRig,
    headMesh,
    leftArm,
    rightArm,
    botGun,
    muzzleFlash
  );

  return {
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
  };
}

// ============================================================================
// EQUIPE 2: BANDIDOS BRASILEIROS — 6 VARIAÇÕES URBANAS LOW-POLY
// ============================================================================
function buildBandidoVariantModel(
  variantIndex: number,
  isSoftwareGl: boolean
): BuiltCharacterModel {
  const v = ((variantIndex % 6) + 6) % 6;
  const group = new THREE.Group();

  const skinTones = [0xc68652, 0x9c6438, 0xd4996a, 0x825029, 0xba7a48, 0xa86b3c];
  const skinColor = skinTones[v];

  const hasFullBalaclava = v === 1 || v === 4;
  const baseBodyColor = 0xffffff;
  const baseHeadColor = hasFullBalaclava ? 0x151519 : skinColor;

  let shirtTexture = getFlamengoHomeTexture();
  if (v === 2) shirtTexture = getWhiteTankTopTexture();
  else if (v === 3) shirtTexture = getFlamengoAwayTexture();
  else if (v === 5) shirtTexture = getBrazilJerseyTexture();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: baseBodyColor,
    map: shirtTexture,
    roughness: 0.72,
    metalness: 0.05,
  });
  const headMat = new THREE.MeshStandardMaterial({
    color: baseHeadColor,
    roughness: 0.64,
    metalness: 0.05,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: skinColor,
    roughness: 0.64,
  });
  const darkFabricMat = new THREE.MeshStandardMaterial({
    color: 0x141418,
    roughness: 0.82,
  });
  const redFabricMat = new THREE.MeshStandardMaterial({
    color: 0xd91c24,
    roughness: 0.65,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.22,
    metalness: 0.88,
  });
  const shoeWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xf4f4f5,
    roughness: 0.5,
  });

  // 1. PERNAS ARTICULADAS NO QUADRIL E JOELHO (Bermuda Folgada + Canela ou Calça + Chinelo/Tênis)
  const wearsShorts = v === 0 || v === 2 || v === 5;
  const wearsFlipFlops = v === 2 || v === 4;

  const pantsColor =
    v === 0
      ? 0x1e3a5f
      : v === 1
      ? 0x172554
      : v === 2
      ? 0x18181b
      : v === 3
      ? 0x111827
      : v === 4
      ? 0x263c5c
      : 0x3b82f6;

  const pantsMat = new THREE.MeshStandardMaterial({
    color: pantsColor,
    roughness: 0.85,
  });

  // Bermuda tem boca inferior mais larga (silhueta urbana solta); calça comprida acompanha a coxa
  const thighGeo = wearsShorts
    ? createAngledPrismGeometry(0.23, 0.25, 0.26, 0.27, 0.35, -0.17, 0)
    : createAngledPrismGeometry(0.23, 0.25, 0.20, 0.22, 0.34, -0.17, 0);

  const calfGeo = wearsShorts
    ? createAngledPrismGeometry(0.17, 0.18, 0.13, 0.15, 0.30, -0.15, 0)
    : createAngledPrismGeometry(0.20, 0.22, 0.18, 0.20, 0.30, -0.15, 0);

  const createBandidoLeg = (offsetX: number) => {
    const legRoot = new THREE.Mesh(thighGeo, pantsMat);
    legRoot.position.set(offsetX, 0.66, 0);

    if (wearsShorts && v === 2) {
      const sideStripe = new THREE.Mesh(
        createAngledPrismGeometry(0.02, 0.07, 0.02, 0.08, 0.34, -0.17, 0),
        redFabricMat
      );
      sideStripe.position.set(offsetX < 0 ? -0.13 : 0.13, 0, 0);
      legRoot.add(sideStripe);
    }

    // Articulação do Joelho + Canela (pele exposta na bermuda ou tecido na calça)
    const kneeJoint = new THREE.Mesh(calfGeo, wearsShorts ? skinMat : pantsMat);
    kneeJoint.position.set(0, -0.33, 0.01);
    kneeJoint.rotation.x = 0.05;
    legRoot.add(kneeJoint);

    if (!wearsShorts && v === 3) {
      const trackStripe = new THREE.Mesh(
        createAngledPrismGeometry(0.02, 0.05, 0.02, 0.05, 0.28, -0.14, 0),
        shoeWhiteMat
      );
      trackStripe.position.set(offsetX < 0 ? -0.10 : 0.10, 0, 0);
      kneeJoint.add(trackStripe);
    }

    if (wearsFlipFlops) {
      // Chinelo brasileiro: solado prismático + pé em cunha + tiras em V
      const sole = new THREE.Mesh(
        createAngledPrismGeometry(0.18, 0.27, 0.19, 0.28, 0.035, 0, 0),
        shoeWhiteMat
      );
      sole.position.set(0, -0.29, 0.04);
      const bareFoot = new THREE.Mesh(
        createAngledPrismGeometry(0.15, 0.18, 0.17, 0.23, 0.07, 0, 0.02),
        skinMat
      );
      bareFoot.position.set(0, -0.25, 0.03);
      const strap = new THREE.Mesh(
        createAngledPrismGeometry(0.18, 0.08, 0.18, 0.08, 0.025, 0, 0),
        darkFabricMat
      );
      strap.position.set(0, -0.21, 0.02);
      kneeJoint.add(sole, bareFoot, strap);
    } else {
      // Tênis urbano em cunha angulada
      const sneakerBody = new THREE.Mesh(
        createAngledPrismGeometry(0.18, 0.22, 0.21, 0.29, 0.11, 0, 0.03),
        v === 1 ? darkFabricMat : shoeWhiteMat
      );
      sneakerBody.position.set(0, -0.26, 0.04);
      const sneakerAccent = new THREE.Mesh(
        createAngledPrismGeometry(0.215, 0.12, 0.215, 0.14, 0.04, 0, 0),
        redFabricMat
      );
      sneakerAccent.position.set(0, -0.25, 0.02);
      kneeJoint.add(sneakerBody, sneakerAccent);
    }

    return legRoot;
  };

  const leftLeg = createBandidoLeg(-0.15);
  const rightLeg = createBandidoLeg(0.15);

  // 2. TRONCO GEOMÉTRICO ARTICULADO CS 1.6 + CORRENTE DOURADA EM V + BOLSA/MOCHILA
  const torsoMesh = createArticulatedCS16Torso(bodyMat, pantsMat, skinMat, isSoftwareGl);

  const chestRigGeo = createAngledPrismGeometry(0.54, 0.34, 0.46, 0.28, 0.42, 0, 0.01);
  const chestRig = new THREE.Mesh(chestRigGeo, bodyMat);
  chestRig.position.set(0, 1.13, 0);

  // Corrente dourada esculpida em prismas conectados em V no peito
  if (v === 0 || v === 2 || v === 4 || v === 5) {
    const chainSegGeo = createAngledPrismGeometry(0.03, 0.035, 0.03, 0.035, 0.19, 0, 0);
    const chainLeft = new THREE.Mesh(chainSegGeo, goldMat);
    chainLeft.position.set(-0.075, 0.23, 0.18);
    chainLeft.rotation.z = -0.32;
    const chainRight = new THREE.Mesh(chainSegGeo, goldMat);
    chainRight.position.set(0.075, 0.23, 0.18);
    chainRight.rotation.z = 0.32;
    const chainPendant = new THREE.Mesh(
      createAngledPrismGeometry(0.065, 0.035, 0.045, 0.035, 0.07, 0, 0),
      goldMat
    );
    chainPendant.position.set(0, 0.13, 0.19);
    chestRig.add(chainLeft, chainRight, chainPendant);
  }

  if (v === 0 || v === 1 || v === 4 || v === 5) {
    const strap = new THREE.Mesh(
      createAngledPrismGeometry(0.085, 0.37, 0.085, 0.33, 0.54, 0, 0),
      darkFabricMat
    );
    strap.rotation.z = 0.46;
    strap.position.set(0.04, 0.04, 0);
    chestRig.add(strap);
  }
  if (v === 1 || v === 5) {
    const backpack = new THREE.Mesh(
      createAngledPrismGeometry(0.32, 0.15, 0.38, 0.18, 0.41, 0, 0),
      darkFabricMat
    );
    backpack.position.set(0, 0.04, -0.23);
    chestRig.add(backpack);
  }

  // 3. CABEÇA FACETADA CS 1.6 E ACESSÓRIOS URBANOS
  const headMesh = createArticulatedCS16Head(headMat, skinMat, !hasFullBalaclava, isSoftwareGl);

  if (hasFullBalaclava) {
    const eyeOpening = new THREE.Mesh(
      createAngledPrismGeometry(0.31, 0.04, 0.29, 0.04, 0.075, 0, 0),
      skinMat
    );
    eyeOpening.position.set(0, 0.03, 0.195);
    const darkEyes = new THREE.Mesh(
      createAngledPrismGeometry(0.23, 0.045, 0.23, 0.045, 0.035, 0, 0),
      darkFabricMat
    );
    darkEyes.position.set(0, 0.03, 0.198);
    headMesh.add(eyeOpening, darkEyes);
  } else {
    const eyes = new THREE.Mesh(
      createAngledPrismGeometry(0.26, 0.03, 0.26, 0.03, 0.035, 0, 0),
      darkFabricMat
    );
    eyes.position.set(0, 0.04, 0.195);
    headMesh.add(eyes);

    if (v === 0 || v === 3) {
      // Bandana triangular / máscara chanfrada cobrindo nariz e queixo
      const maskMat = v === 3 ? redFabricMat : darkFabricMat;
      const lowerMask = new THREE.Mesh(
        createAngledPrismGeometry(0.39, 0.39, 0.26, 0.29, 0.21, 0, 0.025),
        maskMat
      );
      lowerMask.position.set(0, -0.12, 0.02);
      headMesh.add(lowerMask);
    } else if (v === 2) {
      const goatee = new THREE.Mesh(
        createAngledPrismGeometry(0.13, 0.05, 0.09, 0.04, 0.09, 0, 0),
        darkFabricMat
      );
      goatee.position.set(0, -0.18, 0.18);
      headMesh.add(goatee);
    }
  }

  if (v === 0 || v === 5) {
    const capMat = v === 0 ? redFabricMat : darkFabricMat;
    const capCrown = new THREE.Mesh(
      createAngledPrismGeometry(0.35, 0.38, 0.39, 0.41, 0.15, 0, 0),
      capMat
    );
    capCrown.position.set(0, 0.15, 0);
    const capVisor = new THREE.Mesh(
      createAngledPrismGeometry(0.36, 0.20, 0.30, 0.22, 0.035, 0, 0),
      darkFabricMat
    );
    capVisor.position.set(0, 0.09, 0.26);
    headMesh.add(capCrown, capVisor);

    if (v === 5) {
      const julietFrame = new THREE.Mesh(
        createAngledPrismGeometry(0.39, 0.05, 0.37, 0.05, 0.075, 0, 0),
        goldMat
      );
      julietFrame.position.set(0, 0.04, 0.20);
      const julietLens = new THREE.Mesh(
        createAngledPrismGeometry(0.34, 0.06, 0.32, 0.06, 0.055, 0, 0),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9 })
      );
      julietLens.position.set(0, 0.04, 0.20);
      headMesh.add(julietFrame, julietLens);
    }
  } else if (v === 2) {
    const capCrown = new THREE.Mesh(
      createAngledPrismGeometry(0.35, 0.38, 0.39, 0.41, 0.15, 0, 0),
      darkFabricMat
    );
    capCrown.position.set(0, 0.15, 0);
    const backVisor = new THREE.Mesh(
      createAngledPrismGeometry(0.34, 0.19, 0.28, 0.21, 0.035, 0, 0),
      redFabricMat
    );
    backVisor.position.set(0, 0.09, -0.26);
    headMesh.add(capCrown, backVisor);
  } else if (v === 3) {
    const hairTop = new THREE.Mesh(
      createAngledPrismGeometry(0.36, 0.39, 0.39, 0.41, 0.11, 0, 0),
      darkFabricMat
    );
    hairTop.position.set(0, 0.17, -0.01);
    headMesh.add(hairTop);
  }

  // 4. BRAÇOS ARTICULADOS NO OMBRO E COTOVELO (Manga Curta Folgada ou Regata + Antebraço + Mão)
  const isTankTop = v === 2 || v === 4;
  const upperArmSkinGeo = createAngledPrismGeometry(0.19, 0.19, 0.15, 0.15, 0.30, -0.15, 0);
  const shortSleeveGeo = createAngledPrismGeometry(0.21, 0.21, 0.23, 0.23, 0.24, -0.12, 0);
  const forearmGeo = createAngledPrismGeometry(0.15, 0.15, 0.12, 0.12, 0.28, -0.14, 0);
  const handGeo = createAngledPrismGeometry(0.13, 0.14, 0.14, 0.17, 0.13, -0.06, 0);

  const createBandidoArm = (isLeft: boolean, rotX: number) => {
    const offsetX = isLeft ? -0.37 : 0.37;
    const armRoot = new THREE.Mesh(
      isTankTop ? upperArmSkinGeo : shortSleeveGeo,
      isTankTop ? skinMat : bodyMat
    );
    armRoot.position.set(offsetX, 1.40, 0.04);
    armRoot.rotation.x = rotX;

    // Articulação do Cotovelo + Antebraço de pele afunilado até o pulso
    const elbowJoint = new THREE.Mesh(forearmGeo, skinMat);
    elbowJoint.position.set(0, -0.28, 0);
    elbowJoint.rotation.x = -0.36;
    elbowJoint.rotation.y = isLeft ? -0.22 : 0.12;
    armRoot.add(elbowJoint);

    // Relógio dourado ou munhequeira no pulso
    const wristAccessory = new THREE.Mesh(
      createAngledPrismGeometry(0.14, 0.14, 0.135, 0.135, 0.045, 0, 0),
      v % 2 === 0 ? goldMat : darkFabricMat
    );
    wristAccessory.position.set(0, -0.21, 0);
    elbowJoint.add(wristAccessory);

    // Mão prismática em tom de pele
    const handPrism = new THREE.Mesh(handGeo, skinMat);
    handPrism.position.set(0, -0.26, 0.01);
    elbowJoint.add(handPrism);

    return armRoot;
  };

  const leftArm = createBandidoArm(true, -0.55);
  const rightArm = createBandidoArm(false, -0.75);

  // 5. ARSENAL DOS BANDIDOS EM 3ª PESSOA POR VARIAÇÃO:
  // v=0,3: AK-47 Clássica (Madeira avermelhada + Pente banana curvo)
  // v=1,5: Heckler & Koch G3 7.62mm (Guarda-mão e coronha verde-oliva + Pente reto)
  // v=2: Escopeta Calibre 12 Cano Curto (Cano duplo serrado + Punho de madeira)
  // v=4: ParaFAL 7.62mm (Cano longo e carregador reto pesado)
  const gunWoodMat = new THREE.MeshStandardMaterial({
    color: 0x7c3f1c,
    roughness: 0.68,
  });
  const gunOliveMat = new THREE.MeshStandardMaterial({
    color: 0x2e3d2c,
    roughness: 0.72,
  });

  const isSawedOff3P = v === 2;
  const isG33P = v === 1 || v === 5;
  const isParaFal3P = v === 4;

  const botGun = new THREE.Mesh(
    createAngledPrismGeometry(
      isSawedOff3P ? 0.10 : 0.08,
      isSawedOff3P ? 0.56 : isG33P || isParaFal3P ? 0.86 : 0.78,
      isSawedOff3P ? 0.10 : 0.09,
      isSawedOff3P ? 0.54 : isG33P || isParaFal3P ? 0.84 : 0.76,
      0.12,
      0,
      0
    ),
    darkFabricMat
  );
  botGun.position.set(0.32, 1.08, isSawedOff3P ? 0.42 : 0.50);

  if (isSawedOff3P) {
    // Escopeta Calibre 12 Cano Curto nas mãos do Sombra_Vila
    const woodForend3P = new THREE.Mesh(
      createAngledPrismGeometry(0.105, 0.24, 0.105, 0.22, 0.08, 0, 0),
      gunWoodMat
    );
    woodForend3P.position.set(0, -0.02, 0.08);
    const woodGrip3P = new THREE.Mesh(
      createAngledPrismGeometry(0.07, 0.14, 0.07, 0.12, 0.14, 0, -0.04),
      gunWoodMat
    );
    woodGrip3P.position.set(0, -0.09, -0.22);
    botGun.add(woodForend3P, woodGrip3P);
  } else if (isG33P) {
    // HK G3A3 7.62mm (Guarda-mão e coronha verde-oliva + Pente reto)
    const g3Forend3P = new THREE.Mesh(
      createAngledPrismGeometry(0.09, 0.36, 0.095, 0.34, 0.09, 0, 0),
      gunOliveMat
    );
    g3Forend3P.position.set(0, 0.0, 0.15);
    const g3Stock3P = new THREE.Mesh(
      createAngledPrismGeometry(0.075, 0.24, 0.08, 0.24, 0.11, 0, 0),
      gunOliveMat
    );
    g3Stock3P.position.set(0, -0.02, -0.32);
    const g3Mag3P = new THREE.Mesh(
      createAngledPrismGeometry(0.055, 0.10, 0.055, 0.10, 0.21, 0, 0.01),
      darkFabricMat
    );
    g3Mag3P.position.set(0, -0.15, 0.04);
    botGun.add(g3Forend3P, g3Stock3P, g3Mag3P);
  } else if (isParaFal3P) {
    // ParaFAL 7.62mm
    const falMag3P = new THREE.Mesh(
      createAngledPrismGeometry(0.055, 0.10, 0.055, 0.10, 0.22, 0, 0.01),
      darkFabricMat
    );
    falMag3P.position.set(0, -0.15, 0.04);
    botGun.add(falMag3P);
  } else {
    // AK-47 Clássica (Guarda-mão e coronha em madeira + Carregador banana curvo)
    const woodHandguard = new THREE.Mesh(
      createAngledPrismGeometry(0.095, 0.32, 0.10, 0.30, 0.095, 0, 0),
      gunWoodMat
    );
    woodHandguard.position.set(0, 0.01, 0.12);
    const woodStock3P = new THREE.Mesh(
      createAngledPrismGeometry(0.075, 0.22, 0.08, 0.22, 0.11, 0, 0),
      gunWoodMat
    );
    woodStock3P.position.set(0, -0.03, -0.30);
    const akMag = new THREE.Mesh(
      createAngledPrismGeometry(0.055, 0.09, 0.055, 0.08, 0.22, 0, 0.07),
      gunWoodMat
    );
    akMag.position.set(0, -0.15, 0.06);
    botGun.add(woodHandguard, woodStock3P, akMag);
  }

  const muzzleFlash = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.13, 0),
    new THREE.MeshBasicMaterial({ color: 0xfbbf24 })
  );
  muzzleFlash.position.set(0.32, 1.08, 0.95);
  muzzleFlash.visible = false;

  group.add(
    leftLeg,
    rightLeg,
    torsoMesh,
    chestRig,
    headMesh,
    leftArm,
    rightArm,
    botGun,
    muzzleFlash
  );

  return {
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
  };
}

/**
 * Ponto de entrada principal: constrói qualquer uma das 12 variações (6 PM e 6 Bandidos)
 * usando geometria low-poly prismática estilo CS 1.6.
 */
export function createTeamCharacterModel(
  team: 'CT' | 'TR',
  variantIndex: number,
  isSoftwareGl: boolean
): BuiltCharacterModel {
  if (team === 'CT') {
    return buildPMVariantModel(variantIndex, isSoftwareGl);
  }
  return buildBandidoVariantModel(variantIndex, isSoftwareGl);
}
