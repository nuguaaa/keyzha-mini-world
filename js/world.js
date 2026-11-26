/**
 * ============================================================================
 * 3D DIORAMA WORLD & LIGHTING ENGINE (Three.js HD-2D)
 * ============================================================================
 * Membangun pulau diorama 3D bertingkat lengkap dengan potongan tanah samping,
 * rumah bertingkat, teras batu, kolam air kecil, pepohonan, lampu taman fungsional,
 * sistem partikel (asap, kunang-kunang, kelopak bunga), dan 3 suasana waktu.
 */

class DioramaWorld {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.colliders = [];
    this.lamps = [];
    this.particles = [];
    this.timeOfDay = "day"; // "day", "dusk", "night"

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Pencahayaan
    this.dirLight = null;
    this.hemiLight = null;
    this.ambientLight = null;

    // Elemen Interaktif di Scene
    this.mailboxMesh = null;
    this.arcadeMesh = null;
    this.photoboothMesh = null;
    this.archGateGroup = null;
    this.archGateRibbon = null;
    this.archGateOpen = false;
    this.giftChestMesh = null;
    this.houseWindows = [];

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene & Kabut Lembut (Fog)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#9ed7fa");
    this.scene.fog = new THREE.FogExp2("#9ed7fa", 0.012);

    // 2. Kamera HD-2D Isometrik Lembut (Low FOV Perspective)
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    this.camera.position.set(22, 28, 36);
    this.camera.lookAt(0, 2, 0);

    // 3. Renderer dengan Soft Shadow Map
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    // 4. Bangun Pencahayaan & Elemen Diorama
    this.setupLighting();
    this.buildTerrain();
    this.buildHouse();
    this.buildFoliageAndProps();
    this.buildSecretGarden();
    this.setupParticles();

    // Resize Listener
    window.addEventListener("resize", () => this.onResize());
  }

  // --- SISTEM PENCAHAYAAN (LIGHTING & SHADOWS) ---
  setupLighting() {
    this.ambientLight = new THREE.AmbientLight("#a0c4e8", 0.7);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight("#fff5e6", 1.25);
    this.dirLight.position.set(24, 40, 20);
    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 10;
    this.dirLight.shadow.camera.far = 100;
    const d = 26;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;

    this.scene.add(this.dirLight);
  }

  // Ganti Suasana Waktu: Siang, Sore (Golden Dusk), Malam (Night Lights)
  setTimeOfDay(time) {
    this.timeOfDay = time;

    if (time === "day") {
      this.scene.background.set("#9ed7fa");
      this.scene.fog.color.set("#9ed7fa");
      this.dirLight.color.set("#fff5e6");
      this.dirLight.intensity = 1.3;
      this.dirLight.position.set(24, 40, 20);
      this.ambientLight.color.set("#a0c4e8");
      this.ambientLight.intensity = 0.75;

      this.lamps.forEach(l => {
        l.light.intensity = 0.05;
        l.halo.visible = false;
      });
      this.houseWindows.forEach(m => {
        m.emissive.setHex(0x000000);
      });
    } else if (time === "dusk") {
      this.scene.background.set("#fca36e");
      this.scene.fog.color.set("#fca36e");
      this.dirLight.color.set("#ff8838");
      this.dirLight.intensity = 1.05;
      this.dirLight.position.set(36, 22, 24);
      this.ambientLight.color.set("#e07a5f");
      this.ambientLight.intensity = 0.65;

      this.lamps.forEach(l => {
        l.light.intensity = 1.2;
        l.halo.visible = true;
      });
      this.houseWindows.forEach(m => {
        m.emissive.setHex(0xffaa33);
        m.emissiveIntensity = 0.4;
      });
    } else if (time === "night") {
      this.scene.background.set("#0d1322");
      this.scene.fog.color.set("#0d1322");
      this.dirLight.color.set("#4361ee");
      this.dirLight.intensity = 0.35;
      this.dirLight.position.set(-18, 32, -15);
      this.ambientLight.color.set("#1f2940");
      this.ambientLight.intensity = 0.4;

      this.lamps.forEach(l => {
        l.light.intensity = 2.4;
        l.halo.visible = true;
      });
      this.houseWindows.forEach(m => {
        m.emissive.setHex(0xffbe0b);
        m.emissiveIntensity = 0.9;
      });
    }
  }

  // --- PEMBUATAN PULAU DIORAMA & PERMUKAAN TANAH ---
  buildTerrain() {
    const tg = window.textureGen;

    const grassMat = new THREE.MeshLambertMaterial({ map: tg.getGrassTexture() });
    grassMat.map.repeat.set(16, 16);

    const soilMat = new THREE.MeshLambertMaterial({ map: tg.getSoilSideTexture() });
    soilMat.map.repeat.set(12, 1);

    const bottomMat = new THREE.MeshLambertMaterial({ color: "#1a110b" });

    const dioramaSlabMat = [
      soilMat,
      soilMat,
      grassMat,
      bottomMat,
      soilMat,
      soilMat
    ];

    // 1. Platform Utama (Main Island Diorama Block)
    const mainGeo = new THREE.BoxGeometry(34, 4, 36);
    const mainIsland = new THREE.Mesh(mainGeo, dioramaSlabMat);
    mainIsland.position.set(0, -2, 0);
    mainIsland.receiveShadow = true;
    this.scene.add(mainIsland);

    // 2. Teras Batu Depan Rumah
    const stonePathMat = new THREE.MeshLambertMaterial({ map: tg.getStonePathTexture() });
    stonePathMat.map.repeat.set(6, 5);

    const terraceGeo = new THREE.BoxGeometry(16, 1.2, 14);
    const terraceSoilMat = [soilMat, soilMat, stonePathMat, bottomMat, soilMat, soilMat];
    const terrace = new THREE.Mesh(terraceGeo, terraceSoilMat);
    terrace.position.set(-7, 0.6, -9);
    terrace.receiveShadow = true;
    terrace.castShadow = true;
    this.scene.add(terrace);

    // Tangga Batu Teras
    const stepGeo = new THREE.BoxGeometry(4.5, 0.6, 2.2);
    const stepMesh = new THREE.Mesh(stepGeo, stonePathMat);
    stepMesh.position.set(-7, 0.3, -1.2);
    stepMesh.receiveShadow = true;
    this.scene.add(stepMesh);

    // 3. Jalan Setapak Batu
    this.createPathSegment(2.5, 18, -7, 0.02, 6);
    this.createPathSegment(16, 2.5, 0, 0.02, 6);
    this.createPathSegment(2.5, 12, 7, 0.02, 0);
    this.createPathSegment(2.5, 10, 0, 0.02, -10);

    // 4. Kolam Air Kecil
    const pondGeo = new THREE.BoxGeometry(8, 0.4, 7);
    const pondSoilMat = [soilMat, soilMat, bottomMat, bottomMat, soilMat, soilMat];
    const pondBase = new THREE.Mesh(pondGeo, pondSoilMat);
    pondBase.position.set(11, -0.2, 11);
    this.scene.add(pondBase);

    const waterMat = new THREE.MeshLambertMaterial({
      map: tg.getWaterTexture(),
      transparent: true,
      opacity: 0.82
    });
    const waterPlane = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 6.6), waterMat);
    waterPlane.rotation.x = -Math.PI / 2;
    waterPlane.position.set(11, 0.05, 11);
    this.scene.add(waterPlane);

    // Batu hias kolam
    const rockMat = new THREE.MeshLambertMaterial({ color: "#8a8175" });
    const rockPositions = [
      [7.2, 8.5], [9, 7.4], [11.5, 7.3], [14, 8],
      [14.8, 10], [14.9, 13.5], [13.5, 14.5], [9.5, 14.6], [7.2, 13]
    ];
    rockPositions.forEach(([rx, rz]) => {
      const rMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55 + Math.random() * 0.35), rockMat);
      rMesh.position.set(rx, 0.25, rz);
      rMesh.scale.set(1, 0.6, 1);
      rMesh.castShadow = true;
      this.scene.add(rMesh);
      this.colliders.push({ minX: rx - 0.5, maxX: rx + 0.5, minZ: rz - 0.5, maxZ: rz + 0.5 });
    });

    // Batas tepi pulau diorama
    this.colliders.push({ minX: -16.5, maxX: -15.5, minZ: -17.5, maxZ: 17.5 });
    this.colliders.push({ minX: 15.5, maxX: 16.5, minZ: -17.5, maxZ: 17.5 });
    this.colliders.push({ minX: -16.5, maxX: 16.5, minZ: 16.5, maxZ: 17.5 });
    this.colliders.push({ minX: -16.5, maxX: 16.5, minZ: -17.5, maxZ: -16.5 });
  }

  createPathSegment(w, d, x, y, z) {
    const tg = window.textureGen;
    const pathMat = new THREE.MeshLambertMaterial({ map: tg.getStonePathTexture() });
    pathMat.map.repeat.set(w / 2, d / 2);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), pathMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    this.scene.add(mesh);
  }

  // --- BANGUNAN RUMAH DIORAMA ---
  buildHouse() {
    const tg = window.textureGen;
    const houseGroup = new THREE.Group();

    const wallMat = new THREE.MeshLambertMaterial({ map: tg.getHouseWallTexture() });
    const houseBody = new THREE.Mesh(new THREE.BoxGeometry(9.5, 5.5, 8.5), wallMat);
    houseBody.position.set(-8, 3.9, -10.5);
    houseBody.castShadow = true;
    houseBody.receiveShadow = true;
    houseGroup.add(houseBody);

    this.colliders.push({ minX: -13.5, maxX: -2.5, minZ: -15.5, maxZ: -5.5 });

    const roofMat = new THREE.MeshLambertMaterial({ map: tg.getRoofTexture() });
    roofMat.map.repeat.set(3, 2);

    const roofFront = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.4, 5.5), roofMat);
    roofFront.position.set(-8, 7.5, -8.6);
    roofFront.rotation.x = Math.PI / 5;
    roofFront.castShadow = true;
    houseGroup.add(roofFront);

    const roofBack = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.4, 5.5), roofMat);
    roofBack.position.set(-8, 7.5, -12.4);
    roofBack.rotation.x = -Math.PI / 5;
    roofBack.castShadow = true;
    houseGroup.add(roofBack);

    const roofRidge = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.5, 0.6), roofMat);
    roofRidge.position.set(-8, 9.1, -10.5);
    houseGroup.add(roofRidge);

    const chimneyMat = new THREE.MeshLambertMaterial({ color: "#7a3e2e" });
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.5, 1.4), chimneyMat);
    chimney.position.set(-4.5, 8.6, -12);
    chimney.castShadow = true;
    houseGroup.add(chimney);

    const doorMat = new THREE.MeshLambertMaterial({ map: tg.getDoorTexture(), transparent: true });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 3.2), doorMat);
    door.position.set(-7, 2.8, -6.22);
    houseGroup.add(door);

    const winMat = new THREE.MeshLambertMaterial({
      map: tg.getWindowTexture(),
      emissive: new THREE.Color(0x000000)
    });
    this.houseWindows.push(winMat);

    const win1 = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), winMat);
    win1.position.set(-4.5, 3.6, -6.22);
    houseGroup.add(win1);

    const win2 = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), winMat);
    win2.position.set(-10, 3.6, -6.22);
    houseGroup.add(win2);

    const win3 = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), winMat);
    win3.rotation.y = Math.PI / 2;
    win3.position.set(-3.22, 3.6, -10.5);
    houseGroup.add(win3);

    const deckMat = new THREE.MeshLambertMaterial({ map: tg.getWoodDeckTexture() });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 2.5), deckMat);
    deck.position.set(-7, 1.35, -5.0);
    deck.receiveShadow = true;
    houseGroup.add(deck);

    this.scene.add(houseGroup);
  }

  // --- TUMBUHAN, PAGAR, LAMPU & INTERAKTIF ---
  buildFoliageAndProps() {
    const treePositions = [
      { x: -13, z: 2, scale: 1.2 },
      { x: -12.5, z: 9, scale: 1.1 },
      { x: -4, z: 12, scale: 1.0 },
      { x: 12.5, z: -2, scale: 1.3 },
      { x: 13, z: -11, scale: 1.15 }
    ];

    treePositions.forEach(tp => {
      this.createTree(tp.x, tp.z, tp.scale);
    });

    const bushPositions = [
      [-13, -2], [-10.5, 4], [-2, 13], [3, 13.5], [6, 12],
      [14, 4], [8, -6], [-1, -4], [-13, -7]
    ];
    bushPositions.forEach(([bx, bz]) => {
      this.createBush(bx, bz);
    });

    this.createFenceLine(-15, 15, 14, 0);
    this.createFenceLine(3, 15, 14, 0);
    this.createFenceLine(-15, -15, 14, 0);

    this.createBench(-10.5, 1.5, 0);
    this.createBench(9, 7.5, -Math.PI / 4);

    this.createStreetLamp(-6, 12);
    this.createStreetLamp(4, 8);
    this.createStreetLamp(8, -4);
    this.createStreetLamp(-2, -7);

    this.createMailbox(-5.5, 2.8);
    this.createArcade(5, 5);
    this.createPhotobooth(9.5, 1.5);
  }

  createTree(x, z, scale = 1.0) {
    const tg = window.textureGen;
    const treeGroup = new THREE.Group();

    const trunkMat = new THREE.MeshLambertMaterial({ color: "#54331e" });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4 * scale, 0.6 * scale, 3 * scale, 6), trunkMat);
    trunk.position.set(0, 1.5 * scale, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    const leafMat = new THREE.MeshLambertMaterial({
      map: tg.getTreeOakTexture(),
      transparent: true,
      alphaTest: 0.2
    });
    const leafPlane = new THREE.Mesh(new THREE.PlaneGeometry(6 * scale, 6.8 * scale), leafMat);
    leafPlane.position.set(0, 4.2 * scale, 0);
    leafPlane.rotation.x = -Math.PI / 10;
    leafPlane.castShadow = true;
    treeGroup.add(leafPlane);

    const leafPlane2 = leafPlane.clone();
    leafPlane2.rotation.y = Math.PI / 2;
    treeGroup.add(leafPlane2);

    treeGroup.position.set(x, 0, z);
    this.scene.add(treeGroup);

    this.colliders.push({ minX: x - 0.7, maxX: x + 0.7, minZ: z - 0.7, maxZ: z + 0.7 });
  }

  createBush(x, z) {
    const tg = window.textureGen;
    const bushMat = new THREE.MeshLambertMaterial({
      map: tg.getBushTexture(),
      transparent: true,
      alphaTest: 0.1
    });
    const bush = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.9), bushMat);
    bush.position.set(x, 0.9, z);
    bush.castShadow = true;
    this.scene.add(bush);

    const bush2 = bush.clone();
    bush2.rotation.y = Math.PI / 2;
    this.scene.add(bush2);

    this.colliders.push({ minX: x - 0.8, maxX: x + 0.8, minZ: z - 0.8, maxZ: z + 0.8 });
  }

  createFenceLine(startX, z, count, angle = 0) {
    const tg = window.textureGen;
    const fenceMat = new THREE.MeshLambertMaterial({
      map: tg.getFenceTexture(),
      transparent: true,
      alphaTest: 0.2
    });
    fenceMat.map.repeat.set(count / 2, 1);

    const fence = new THREE.Mesh(new THREE.PlaneGeometry(count, 1.4), fenceMat);
    fence.position.set(startX + count / 2, 0.7, z);
    fence.rotation.y = angle;
    fence.castShadow = true;
    this.scene.add(fence);

    this.colliders.push({
      minX: startX,
      maxX: startX + count,
      minZ: z - 0.3,
      maxZ: z + 0.3
    });
  }

  createBench(x, z, rotY = 0) {
    const tg = window.textureGen;
    const benchMat = new THREE.MeshLambertMaterial({
      map: tg.getBenchTexture(),
      transparent: true,
      alphaTest: 0.2
    });
    const bench = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), benchMat);
    bench.position.set(x, 0.8, z);
    bench.rotation.y = rotY;
    bench.castShadow = true;
    this.scene.add(bench);

    this.colliders.push({ minX: x - 1.1, maxX: x + 1.1, minZ: z - 0.6, maxZ: z + 0.6 });
  }

  createStreetLamp(x, z) {
    const tg = window.textureGen;
    const lampGroup = new THREE.Group();

    const lampMat = new THREE.MeshLambertMaterial({
      map: tg.getLampTexture(),
      transparent: true,
      alphaTest: 0.1
    });
    const lampMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3.8), lampMat);
    lampMesh.position.set(0, 1.9, 0);
    lampMesh.castShadow = true;
    lampGroup.add(lampMesh);

    const pointLight = new THREE.PointLight("#ffb703", 0.05, 11, 1.8);
    pointLight.position.set(0, 3.2, 0);
    pointLight.castShadow = false;
    lampGroup.add(pointLight);

    const haloMat = new THREE.SpriteMaterial({
      map: this.createHaloTexture(),
      color: "#ffc857",
      transparent: true,
      opacity: 0.55,
      blending: THREE.AdditiveBlending
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(3.5, 3.5, 1);
    halo.position.set(0, 3.2, 0);
    halo.visible = false;
    lampGroup.add(halo);

    lampGroup.position.set(x, 0, z);
    this.scene.add(lampGroup);

    this.lamps.push({ light: pointLight, halo: halo });
    this.colliders.push({ minX: x - 0.4, maxX: x + 0.4, minZ: z - 0.4, maxZ: z + 0.4 });
  }

  createHaloTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
    grad.addColorStop(0, "rgba(255, 230, 140, 1)");
    grad.addColorStop(0.3, "rgba(255, 180, 50, 0.5)");
    grad.addColorStop(1, "rgba(255, 150, 20, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  createMailbox(x, z) {
    const tg = window.textureGen;
    const mat = new THREE.MeshLambertMaterial({
      map: tg.getMailboxTexture(),
      transparent: true,
      alphaTest: 0.1
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.4), mat);
    mesh.position.set(x, 1.2, z);
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.mailboxMesh = mesh;
    this.colliders.push({ minX: x - 0.6, maxX: x + 0.6, minZ: z - 0.6, maxZ: z + 0.6 });
  }

  createArcade(x, z) {
    const tg = window.textureGen;
    const mat = new THREE.MeshLambertMaterial({
      map: tg.getArcadeTexture(),
      transparent: true,
      alphaTest: 0.1
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 3.6), mat);
    mesh.position.set(x, 1.8, z);
    mesh.castShadow = true;
    this.scene.add(mesh);

    const neonLight = new THREE.PointLight("#ff007f", 0.9, 5, 2);
    neonLight.position.set(x, 2.2, z + 0.5);
    this.scene.add(neonLight);

    this.arcadeMesh = mesh;
    this.colliders.push({ minX: x - 1.0, maxX: x + 1.0, minZ: z - 0.8, maxZ: z + 0.8 });
  }

  createPhotobooth(x, z) {
    const tg = window.textureGen;
    const mat = new THREE.MeshLambertMaterial({
      map: tg.getPhotoboothTexture(),
      transparent: true,
      alphaTest: 0.1
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 4.0), mat);
    mesh.position.set(x, 2.0, z);
    mesh.castShadow = true;
    this.scene.add(mesh);

    this.photoboothMesh = mesh;
    this.colliders.push({ minX: x - 1.4, maxX: x + 1.4, minZ: z - 1.0, maxZ: z + 1.0 });
  }

  // --- AREA RAHASIA: TAMAN BELAKANG & GAZEBO HADIAH UTAMA ---
  buildSecretGarden() {
    const tg = window.textureGen;
    const archGroup = new THREE.Group();

    const archMat = new THREE.MeshLambertMaterial({
      map: tg.getArchGateTexture(),
      transparent: true,
      alphaTest: 0.1
    });
    const archMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 4.5), archMat);
    archMesh.position.set(0, 2.25, 0);
    archMesh.castShadow = true;
    archGroup.add(archMesh);

    const ribbonCanvas = document.createElement("canvas");
    ribbonCanvas.width = 64;
    ribbonCanvas.height = 16;
    const rCtx = ribbonCanvas.getContext("2d");
    rCtx.fillStyle = "#e63946";
    rCtx.fillRect(0, 2, 64, 12);
    rCtx.fillStyle = "#ffffff";
    rCtx.font = "bold 9px sans-serif";
    rCtx.fillText("TERKUNCI", 10, 11);
    const ribbonTex = new THREE.CanvasTexture(ribbonCanvas);
    ribbonTex.magFilter = THREE.NearestFilter;

    const ribbonMat = new THREE.MeshBasicMaterial({ map: ribbonTex, transparent: true });
    this.archGateRibbon = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), ribbonMat);
    this.archGateRibbon.position.set(0, 1.4, 0.05);
    archGroup.add(this.archGateRibbon);

    archGroup.position.set(0, 0, -11.5);
    this.scene.add(archGroup);
    this.archGateGroup = archGroup;

    this.gateCollider = { minX: -1.6, maxX: 1.6, minZ: -12.0, maxZ: -11.0 };
    this.colliders.push(this.gateCollider);

    const gazeboFloorMat = new THREE.MeshLambertMaterial({ map: tg.getWoodDeckTexture() });
    gazeboFloorMat.map.repeat.set(3, 3);
    const gazeboFloor = new THREE.Mesh(new THREE.BoxGeometry(6, 0.4, 6), gazeboFloorMat);
    gazeboFloor.position.set(0, 0.2, -16.5);
    gazeboFloor.receiveShadow = true;
    this.scene.add(gazeboFloor);

    const chestMat = new THREE.MeshLambertMaterial({
      map: tg.getGiftChestTexture(),
      transparent: true,
      alphaTest: 0.1
    });
    this.giftChestMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), chestMat);
    this.giftChestMesh.position.set(0, 1.2, -16.5);
    this.giftChestMesh.castShadow = true;
    this.scene.add(this.giftChestMesh);

    const chestLight = new THREE.PointLight("#ffea00", 1.2, 6, 2);
    chestLight.position.set(0, 2.5, -16.5);
    this.scene.add(chestLight);

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const gx = Math.cos(angle) * 3.4;
      const gz = -16.5 + Math.sin(angle) * 3.4;
      this.createBush(gx, gz);
    }
  }

  openSecretGarden() {
    if (this.archGateOpen) return;
    this.archGateOpen = true;

    if (this.archGateRibbon) {
      this.archGateRibbon.visible = false;
    }

    const idx = this.colliders.indexOf(this.gateCollider);
    if (idx !== -1) {
      this.colliders.splice(idx, 1);
    }
  }

  // --- SISTEM PARTIKEL ---
  setupParticles() {
    const fireflyCount = 45;
    const fireflyGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(fireflyCount * 3);
    const speeds = [];

    for (let i = 0; i < fireflyCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 28;
      positions[i * 3 + 1] = 0.5 + Math.random() * 3.0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 28;

      speeds.push({
        vx: (Math.random() - 0.5) * 0.015,
        vy: (Math.random() - 0.5) * 0.01,
        vz: (Math.random() - 0.5) * 0.015,
        phase: Math.random() * Math.PI * 2
      });
    }

    fireflyGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const fireflyMat = new THREE.PointsMaterial({
      color: "#d4ff32",
      size: 0.35,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.fireflyPoints = new THREE.Points(fireflyGeo, fireflyMat);
    this.fireflySpeeds = speeds;
    this.scene.add(this.fireflyPoints);
  }

  updateParticles(delta, time) {
    if (this.fireflyPoints) {
      const isNight = this.timeOfDay === "night" || this.timeOfDay === "dusk";
      this.fireflyPoints.visible = isNight;

      if (isNight) {
        const pos = this.fireflyPoints.geometry.attributes.position.array;
        for (let i = 0; i < this.fireflySpeeds.length; i++) {
          const sp = this.fireflySpeeds[i];
          pos[i * 3] += sp.vx + Math.sin(time + sp.phase) * 0.008;
          pos[i * 3 + 1] += sp.vy + Math.cos(time * 0.8 + sp.phase) * 0.005;
          pos[i * 3 + 2] += sp.vz + Math.sin(time * 0.5 + sp.phase) * 0.008;

          if (pos[i * 3 + 1] < 0.3) pos[i * 3 + 1] = 0.3;
          if (pos[i * 3 + 1] > 4.5) pos[i * 3 + 1] = 4.5;
        }
        this.fireflyPoints.geometry.attributes.position.needsUpdate = true;
      }
    }
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.DioramaWorld = DioramaWorld;
