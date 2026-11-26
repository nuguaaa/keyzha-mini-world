/**
 * ============================================================================
 * 3D DIORAMA WORLD, VOLUMETRIC PROPS & HOUSE INTERIOR ENGINE
 * ============================================================================
 * Mengatur lingkungan 3D luas dengan pohon-pohon tinggi menjulang (9-13 unit),
 * tekstur kulit kayu alami, UV mapping presisi tanpa peregangan atau garis hitam,
 * interior rumah lengkap yang dapat dijelajahi, dan Third-Person Follow Camera.
 */

class DioramaWorld {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.exteriorColliders = [];
    this.interiorColliders = [];
    this.colliders = this.exteriorColliders; // Pointer collider aktif

    this.lamps = [];
    this.animatedMeshes = [];
    this.particles = [];
    this.timeOfDay = "day"; // "day", "dusk", "night"
    this.currentZone = "exterior"; // "exterior" atau "interior"

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Pencahayaan
    this.dirLight = null;
    this.ambientLight = null;
    this.hemiLight = null;

    // Groups
    this.exteriorGroup = new THREE.Group();
    this.interiorGroup = new THREE.Group();

    // Elemen Props
    this.mailboxMesh = null;
    this.arcadeMesh = null;
    this.arcadeScreenCanvas = null;
    this.arcadeScreenTexture = null;
    this.photoboothMesh = null;
    this.archGateGroup = null;
    this.archGateRibbon = null;
    this.archGateOpen = false;
    this.giftChestMesh = null;
    this.houseWindows = [];
    this.waterMesh = null;
    this.interiorLetterMesh = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene & Kabut Atmosfer Alami (Menyatu Sempurna dengan Horizon)
    this.scene = new THREE.Scene();
    const fogColor = new THREE.Color("#c8ebd4");
    this.scene.background = fogColor;
    this.scene.fog = new THREE.Fog(fogColor, 22, 75);

    this.scene.add(this.exteriorGroup);
    this.scene.add(this.interiorGroup);

    // 2. Kamera Third-Person Close-Up Follow Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 350);
    this.camera.position.set(-6, 4.0, 15.5);
    this.camera.lookAt(-6, 1.2, 6);

    // 3. WebGL Renderer dengan Soft Shadows
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

    // 4. Bangun Pencahayaan & Lingkungan
    this.setupLighting();
    this.buildExpansiveTerrain();
    this.buildPerimeterForest();
    this.buildVolumetricHouse();
    this.buildScenicStreamAndGarden();
    this.buildInteractiveProps();
    this.buildSecretGarden();
    this.setupAtmosphericParticles();

    // 5. Bangun Ruang Interior Rumah yang Hangat
    this.buildInteriorRoom();

    window.addEventListener("resize", () => this.onResize());
  }

  // --- SISTEM PENCAHAYAAN (LIGHTING & SHADOWS) ---
  setupLighting() {
    this.ambientLight = new THREE.AmbientLight("#d8f3dc", 0.72);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight("#e2f7eb", "#4a6b36", 0.35);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight("#fff9ed", 1.25);
    this.dirLight.position.set(24, 38, 20);
    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 5;
    this.dirLight.shadow.camera.far = 85;
    const d = 30;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0006;

    this.scene.add(this.dirLight);
  }

  setTimeOfDay(time) {
    this.timeOfDay = time;

    if (this.currentZone === "interior") {
      // Di dalam rumah pencahayaan tetap hangat
      return;
    }

    if (time === "day") {
      const dayFog = new THREE.Color("#c8ebd4");
      this.scene.background = dayFog;
      this.scene.fog.color = dayFog;
      this.scene.fog.near = 22;
      this.scene.fog.far = 75;

      this.dirLight.color.set("#fff9ed");
      this.dirLight.intensity = 1.25;
      this.dirLight.position.set(24, 38, 20);
      this.ambientLight.color.set("#d8f3dc");
      this.ambientLight.intensity = 0.72;

      this.lamps.forEach(l => {
        l.light.intensity = 0.05;
        l.halo.visible = false;
      });
      this.houseWindows.forEach(m => {
        m.emissive.setHex(0x000000);
      });
    } else if (time === "dusk") {
      const duskFog = new THREE.Color("#f4a261");
      this.scene.background = duskFog;
      this.scene.fog.color = duskFog;
      this.scene.fog.near = 18;
      this.scene.fog.far = 65;

      this.dirLight.color.set("#ff8838");
      this.dirLight.intensity = 1.05;
      this.dirLight.position.set(34, 18, 20);
      this.ambientLight.color.set("#e76f51");
      this.ambientLight.intensity = 0.65;

      this.lamps.forEach(l => {
        l.light.intensity = 1.3;
        l.halo.visible = true;
      });
      this.houseWindows.forEach(m => {
        m.emissive.setHex(0xffaa33);
        m.emissiveIntensity = 0.5;
      });
    } else if (time === "night") {
      const nightFog = new THREE.Color("#0c1220");
      this.scene.background = nightFog;
      this.scene.fog.color = nightFog;
      this.scene.fog.near = 15;
      this.scene.fog.far = 55;

      this.dirLight.color.set("#3a5a8c");
      this.dirLight.intensity = 0.4;
      this.dirLight.position.set(-16, 28, -14);
      this.ambientLight.color.set("#1a263d");
      this.ambientLight.intensity = 0.45;

      this.lamps.forEach(l => {
        l.light.intensity = 2.4;
        l.halo.visible = true;
      });
      this.houseWindows.forEach(m => {
        m.emissive.setHex(0xffbe0b);
        m.emissiveIntensity = 0.95;
      });
    }
  }

  // --- PERMUKAAN TANAH LUAS & BEBAS CELAH HITAM ---
  buildExpansiveTerrain() {
    const tg = window.textureGen;

    // 1. Lapangan Rumput Luas Tak Terputus (200 x 200 unit)
    const grassMat = new THREE.MeshLambertMaterial({ map: tg.getGrassTexture() });
    grassMat.map.repeat.set(50, 50);

    const outerTerrain = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), grassMat);
    outerTerrain.rotation.x = -Math.PI / 2;
    outerTerrain.position.set(0, 0, 0); // Tepat pada Y = 0
    outerTerrain.receiveShadow = true;
    this.exteriorGroup.add(outerTerrain);

    // 2. Teras Batu Halaman Rumah (Presisi UV Tanpa Garis Celah)
    // Dimensi teras: 16 lebar (X), 14 panjang (Z), 1.2 tinggi (Y)
    const terraceGroup = new THREE.Group();

    // Permukaan Atas Teras Batu: UV pas 4 x 3.5 tile
    const stoneTopMat = new THREE.MeshLambertMaterial({ map: tg.getStonePathTexture() });
    stoneTopMat.map.repeat.set(4, 3.5);
    const terraceTop = new THREE.Mesh(new THREE.PlaneGeometry(16, 14), stoneTopMat);
    terraceTop.rotation.x = -Math.PI / 2;
    terraceTop.position.set(-7, 1.2, -9);
    terraceTop.receiveShadow = true;
    terraceGroup.add(terraceTop);

    // Dinding Samping Teras (Retaining Wall) Tanpa Peregangan
    const wallSideMat = new THREE.MeshLambertMaterial({ map: tg.getSoilSideTexture() });
    wallSideMat.map.repeat.set(4, 1);

    // Dinding samping kiri
    const wallLeft = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.3), wallSideMat);
    wallLeft.rotation.y = Math.PI / 2;
    wallLeft.position.set(-15, 0.58, -9);
    terraceGroup.add(wallLeft);

    // Dinding samping kanan
    const wallRight = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.3), wallSideMat);
    wallRight.rotation.y = -Math.PI / 2;
    wallRight.position.set(1, 0.58, -9);
    terraceGroup.add(wallRight);

    // Dinding depan teras (kiri dan kanan tangga)
    const wallFrontL = new THREE.Mesh(new THREE.PlaneGeometry(5.75, 1.3), wallSideMat);
    wallFrontL.position.set(-12.125, 0.58, -2);
    terraceGroup.add(wallFrontL);

    const wallFrontR = new THREE.Mesh(new THREE.PlaneGeometry(5.75, 1.3), wallSideMat);
    wallFrontR.position.set(-1.875, 0.58, -2);
    terraceGroup.add(wallFrontR);

    // Tangga Batu Teras di Tengah (Lebar 4.5 unit)
    const stepTop = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2.2), stoneTopMat);
    stepTop.rotation.x = -Math.PI / 2;
    stepTop.position.set(-7, 0.6, -0.9);
    stepTop.receiveShadow = true;
    terraceGroup.add(stepTop);

    this.exteriorGroup.add(terraceGroup);

    // 3. Jaringan Jalan Setapak Batu
    this.createPathSegment(2.6, 18, -7, 0.015, 6);
    this.createPathSegment(16, 2.6, 0, 0.015, 6);
    this.createPathSegment(2.6, 12, 7, 0.015, 0);
    this.createPathSegment(2.6, 11, 0, 0.015, -10);
  }

  createPathSegment(w, d, x, y, z) {
    const tg = window.textureGen;
    const pathMat = new THREE.MeshLambertMaterial({ map: tg.getStonePathTexture() });
    pathMat.map.repeat.set(w / 2, d / 2);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, d), pathMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    this.exteriorGroup.add(mesh);
  }

  // --- HUTAN DINDING KELILING (PERIMETER FOREST) ---
  buildPerimeterForest() {
    const forestDensity = [
      // Sisi Utara (Belakang)
      [-26, -26], [-20, -27], [-14, -28], [-7, -27], [0, -29], [7, -27], [14, -28], [20, -26], [26, -27],
      [-22, -22], [22, -22],
      // Sisi Selatan (Depan)
      [-26, 26], [-19, 27], [-12, 26], [-5, 28], [3, 27], [10, 26], [17, 27], [24, 26],
      [-21, 22], [21, 22],
      // Sisi Barat & Timur
      [-27, -16], [-28, -9], [-27, -2], [-28, 5], [-27, 12],
      [27, -16], [28, -9], [27, -2], [28, 5], [27, 12]
    ];

    forestDensity.forEach(([fx, fz]) => {
      const scale = 1.15 + Math.random() * 0.35;
      this.createVolumetricTree(fx, fz, scale, true);
    });

    // Bukit Pembatas Alami
    const hillMat = new THREE.MeshLambertMaterial({ color: "#477a33" });
    const hillPositions = [
      [-30, -25, 18], [0, -34, 22], [30, -25, 18],
      [-30, 25, 18], [0, 32, 22], [30, 25, 18]
    ];
    hillPositions.forEach(([hx, hz, rad]) => {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(rad, 8, 8), hillMat);
      hill.position.set(hx, 1.5, hz);
      this.exteriorGroup.add(hill);
    });

    // Batas Halus Lingkungan Luar
    this.exteriorColliders.push({ minX: -20, maxX: -18, minZ: -21, maxZ: 21 });
    this.exteriorColliders.push({ minX: 18, maxX: 20, minZ: -21, maxZ: 21 });
    this.exteriorColliders.push({ minX: -21, maxX: 21, minZ: 18.5, maxZ: 20 });
    this.exteriorColliders.push({ minX: -21, maxX: 21, minZ: -20, maxZ: -18.5 });
  }

  // --- POHON MENJULANG TINGGI (9 - 13.5 UNIT) DENGAN KULIT KAYU ALAMI ---
  createVolumetricTree(x, z, scale = 1.0, isPerimeter = false) {
    const tg = window.textureGen;
    const treeGroup = new THREE.Group();

    // 1. Batang Kayu Tinggi Menjulang (Tinggi 6.5 - 8.5 unit)
    const trunkHeight = 7.0 * scale;
    const trunkMat = new THREE.MeshLambertMaterial({ map: tg.getBarkTexture() });
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55 * scale, 1.0 * scale, trunkHeight, 8),
      trunkMat
    );
    trunk.position.set(0, trunkHeight / 2, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // Akar pohon mencengkeram tanah
    const rootMat = new THREE.MeshLambertMaterial({ color: "#321b0d" });
    for (let i = 0; i < 4; i++) {
      const rAngle = (i / 4) * Math.PI * 2;
      const root = new THREE.Mesh(new THREE.ConeGeometry(0.4 * scale, 1.2 * scale, 5), rootMat);
      root.position.set(Math.cos(rAngle) * 0.75 * scale, 0.4 * scale, Math.sin(rAngle) * 0.75 * scale);
      root.rotation.x = Math.PI / 6;
      treeGroup.add(root);
    }

    // 2. Mahkota Daun Rimbun Berlapis-Lapis (Total Tinggi Pohon: 11 - 13.5 unit!)
    const canopyGroup = new THREE.Group();

    // Palet Hijau Alami
    const deepForestGreen = new THREE.MeshLambertMaterial({ color: "#1e4719", flatShading: true });
    const midLushGreen = new THREE.MeshLambertMaterial({ color: "#3a7526", flatShading: true });
    const leafGreen = new THREE.MeshLambertMaterial({ color: "#4e9432", flatShading: true });
    const sunlitLime = new THREE.MeshLambertMaterial({ color: "#74ba41", flatShading: true });

    // Lapisan kanopi paling bawah (lebar dan rindang)
    const baseCanopy = new THREE.Mesh(new THREE.DodecahedronGeometry(4.2 * scale, 1), deepForestGreen);
    baseCanopy.position.set(0, trunkHeight * 0.85, 0);
    baseCanopy.scale.set(1.3, 0.85, 1.3);
    baseCanopy.castShadow = true;
    canopyGroup.add(baseCanopy);

    // Gumpalan dedaunan tengah kiri & kanan
    const midCanopy1 = new THREE.Mesh(new THREE.DodecahedronGeometry(3.5 * scale, 1), midLushGreen);
    midCanopy1.position.set(-1.4 * scale, trunkHeight * 1.05, 0.6 * scale);
    midCanopy1.castShadow = true;
    canopyGroup.add(midCanopy1);

    const midCanopy2 = new THREE.Mesh(new THREE.DodecahedronGeometry(3.3 * scale, 1), leafGreen);
    midCanopy2.position.set(1.5 * scale, trunkHeight * 1.02, -0.6 * scale);
    midCanopy2.castShadow = true;
    canopyGroup.add(midCanopy2);

    // Puncak kanopi tinggi terkena cahaya matahari
    const topCanopy = new THREE.Mesh(new THREE.DodecahedronGeometry(2.8 * scale, 1), sunlitLime);
    topCanopy.position.set(0, trunkHeight * 1.3, 0);
    topCanopy.castShadow = true;
    canopyGroup.add(topCanopy);

    treeGroup.add(canopyGroup);
    treeGroup.position.set(x, 0, z);
    this.exteriorGroup.add(treeGroup);

    // Animasi goyangan angin halus
    this.animatedMeshes.push({
      type: "tree",
      canopy: canopyGroup,
      phase: x * 0.35 + z * 0.25
    });

    if (!isPerimeter) {
      this.exteriorColliders.push({
        minX: x - 1.0 * scale,
        maxX: x + 1.0 * scale,
        minZ: z - 1.0 * scale,
        maxZ: z + 1.0 * scale
      });
    }
  }

  // --- BANGUNAN PONDOK RUMAH 3D ---
  buildVolumetricHouse() {
    const tg = window.textureGen;
    const houseGroup = new THREE.Group();

    // Dinding Rumah
    const wallMat = new THREE.MeshLambertMaterial({ map: tg.getHouseWallTexture() });
    const houseBody = new THREE.Mesh(new THREE.BoxGeometry(10.2, 5.8, 8.8), wallMat);
    houseBody.position.set(-8, 4.1, -10.5);
    houseBody.castShadow = true;
    houseBody.receiveShadow = true;
    houseGroup.add(houseBody);

    this.exteriorColliders.push({ minX: -13.5, maxX: -2.5, minZ: -15.5, maxZ: -5.8 });

    // Atap Pelana
    const roofMat = new THREE.MeshLambertMaterial({ map: tg.getRoofTexture() });
    roofMat.map.repeat.set(3, 2);

    const roofFront = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.45, 5.8), roofMat);
    roofFront.position.set(-8, 7.8, -8.6);
    roofFront.rotation.x = Math.PI / 5;
    roofFront.castShadow = true;
    houseGroup.add(roofFront);

    const roofBack = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.45, 5.8), roofMat);
    roofBack.position.set(-8, 7.8, -12.4);
    roofBack.rotation.x = -Math.PI / 5;
    roofBack.castShadow = true;
    houseGroup.add(roofBack);

    const ridge = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.6, 0.7), roofMat);
    ridge.position.set(-8, 9.4, -10.5);
    houseGroup.add(ridge);

    // Cerobong Asap Bata
    const chimneyMat = new THREE.MeshLambertMaterial({ color: "#733324" });
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4.0, 1.5), chimneyMat);
    chimney.position.set(-4.5, 8.8, -12);
    chimney.castShadow = true;
    houseGroup.add(chimney);

    // Pintu Kayu Depan Rumah (Titik Masuk)
    const doorMat = new THREE.MeshLambertMaterial({ color: "#61381e" });
    const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.2, 0.25), doorMat);
    doorMesh.position.set(-7, 2.8, -6.0);
    houseGroup.add(doorMesh);

    // Gagang Pintu Kuningan
    const knob = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 6, 6),
      new THREE.MeshLambertMaterial({ color: "#ffb703" })
    );
    knob.position.set(-6.3, 2.7, -5.85);
    houseGroup.add(knob);

    // Jendela Menyala
    const winMat = new THREE.MeshLambertMaterial({
      color: "#ffd166",
      emissive: new THREE.Color(0x000000)
    });
    this.houseWindows.push(winMat);

    const win1 = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), winMat);
    win1.position.set(-4.5, 3.8, -6.08);
    houseGroup.add(win1);

    const win2 = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), winMat);
    win2.position.set(-10.2, 3.8, -6.08);
    houseGroup.add(win2);

    // Dek Serambi Depan
    const deckMat = new THREE.MeshLambertMaterial({ map: tg.getWoodDeckTexture() });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.35, 2.6), deckMat);
    deck.position.set(-7, 1.35, -5.0);
    deck.receiveShadow = true;
    houseGroup.add(deck);

    this.exteriorGroup.add(houseGroup);
  }

  // --- KOLAM AIR & POHON-POHON UTAMA DI TAMAN ---
  buildScenicStreamAndGarden() {
    const tg = window.textureGen;

    // Kolam Air Berkilau
    const waterGeo = new THREE.PlaneGeometry(9.0, 7.5);
    const waterTexture = tg.getWaterTexture();
    const waterMat = new THREE.MeshLambertMaterial({
      map: waterTexture,
      transparent: true,
      opacity: 0.84
    });
    const waterPlane = new THREE.Mesh(waterGeo, waterMat);
    waterPlane.rotation.x = -Math.PI / 2;
    waterPlane.position.set(11, 0.04, 11);
    this.exteriorGroup.add(waterPlane);
    this.waterMesh = waterPlane;

    this.exteriorColliders.push({ minX: 6.8, maxX: 15.5, minZ: 7.2, maxZ: 15.0 });

    // Teratai & Lotus
    const lilyMat = new THREE.MeshLambertMaterial({ color: "#2d6a4f" });
    const lotusMat = new THREE.MeshLambertMaterial({ color: "#ff758f" });
    const lilyPads = [[9.5, 9.8], [12.2, 10.5], [10.8, 12.8], [13.2, 12.2]];
    lilyPads.forEach(([lx, lz]) => {
      const pad = new THREE.Mesh(new THREE.CircleGeometry(0.55, 7), lilyMat);
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(lx, 0.06, lz);
      this.exteriorGroup.add(pad);

      const lotus = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), lotusMat);
      lotus.position.set(lx, 0.16, lz);
      this.exteriorGroup.add(lotus);
    });

    // Bebatuan Kali
    const rockMat = new THREE.MeshLambertMaterial({ color: "#8a8175" });
    const rocks = [
      [6.8, 8.2], [8.8, 7.3], [11.2, 7.2], [13.8, 7.8],
      [15.2, 9.8], [15.3, 13.0], [13.8, 14.8], [10.2, 14.9], [7.2, 13.4]
    ];
    rocks.forEach(([rx, rz]) => {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.65 + Math.random() * 0.25), rockMat);
      rock.position.set(rx, 0.3, rz);
      rock.scale.set(1.2, 0.7, 1.1);
      rock.castShadow = true;
      this.exteriorGroup.add(rock);
    });

    // Pohon Rindang Menjulang Tinggi di Sekitar Halaman (9 - 13.5 unit)
    this.createVolumetricTree(-13, 2, 1.25);   // Pohon besar dekat area bunga
    this.createVolumetricTree(-12, 10, 1.15);  // Pohon depan kiri
    this.createVolumetricTree(-3.5, 12.5, 1.1); // Pohon jalan masuk
    this.createVolumetricTree(12.5, -2, 1.35); // Pohon besar samping gazebo
    this.createVolumetricTree(13, -11, 1.2);   // Pohon sudut belakang kanan
  }

  // --- OBJEK INTERAKTIF ---
  buildInteractiveProps() {
    this.createBench(-10.5, 1.5, 0);
    this.createBench(9, 7.5, -Math.PI / 4);

    this.createStreetLamp(-6, 12);
    this.createStreetLamp(4, 8);
    this.createStreetLamp(8, -4);
    this.createStreetLamp(-2, -7);

    // Kotak Pos Merah (Quest 1)
    const mailGroup = new THREE.Group();
    const mailPost = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 1.4, 6),
      new THREE.MeshLambertMaterial({ color: "#54331e" })
    );
    mailPost.position.set(0, 0.7, 0);
    mailGroup.add(mailPost);

    const mailBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.7, 1.1),
      new THREE.MeshLambertMaterial({ color: "#d90429" })
    );
    mailBox.position.set(0, 1.4, 0);
    mailBox.castShadow = true;
    mailGroup.add(mailBox);

    mailGroup.position.set(-5.5, 0, 2.8);
    this.exteriorGroup.add(mailGroup);
    this.mailboxMesh = mailGroup;
    this.exteriorColliders.push({ minX: -6.0, maxX: -5.0, minZ: 2.3, maxZ: 3.3 });

    // Mesin Arcade 3D (Quest 3)
    this.build3DArcadeCabinet(5, 5);

    // Photobooth 3D Vintage (Quest 4)
    this.build3DPhotobooth(9.5, 1.5);
  }

  build3DArcadeCabinet(x, z) {
    const cabinetGroup = new THREE.Group();

    const bodyMat = new THREE.MeshLambertMaterial({ color: "#241442" });
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.8, 1.8), bodyMat);
    mainBody.position.set(0, 1.9, 0);
    mainBody.castShadow = true;
    cabinetGroup.add(mainBody);

    const marqueeMat = new THREE.MeshLambertMaterial({
      color: "#ff007f",
      emissive: new THREE.Color("#ff007f"),
      emissiveIntensity: 0.6
    });
    const marquee = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 0.2), marqueeMat);
    marquee.position.set(0, 3.5, 0.85);
    cabinetGroup.add(marquee);

    this.arcadeScreenCanvas = document.createElement("canvas");
    this.arcadeScreenCanvas.width = 64;
    this.arcadeScreenCanvas.height = 48;
    this.arcadeScreenTexture = new THREE.CanvasTexture(this.arcadeScreenCanvas);
    this.arcadeScreenTexture.magFilter = THREE.NearestFilter;

    const screenMat = new THREE.MeshBasicMaterial({ map: this.arcadeScreenTexture });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), screenMat);
    screen.position.set(0, 2.5, 0.91);
    screen.rotation.x = -Math.PI / 18;
    cabinetGroup.add(screen);

    const panelMat = new THREE.MeshLambertMaterial({ color: "#160b29" });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.3, 0.8), panelMat);
    deck.position.set(0, 1.7, 0.7);
    deck.rotation.x = Math.PI / 12;
    cabinetGroup.add(deck);

    const neonLight = new THREE.PointLight("#ff007f", 0.9, 6, 2);
    neonLight.position.set(0, 2.6, 1.2);
    cabinetGroup.add(neonLight);

    cabinetGroup.position.set(x, 0, z);
    this.exteriorGroup.add(cabinetGroup);
    this.arcadeMesh = cabinetGroup;
    this.exteriorColliders.push({ minX: x - 1.1, maxX: x + 1.1, minZ: z - 1.0, maxZ: z + 1.0 });
  }

  build3DPhotobooth(x, z) {
    const boothGroup = new THREE.Group();

    const woodMat = new THREE.MeshLambertMaterial({ color: "#4f5d75" });
    const boothBody = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4.2, 2.4), woodMat);
    boothBody.position.set(0, 2.1, 0);
    boothBody.castShadow = true;
    boothGroup.add(boothBody);

    const canopyMat = new THREE.MeshLambertMaterial({ color: "#d90429" });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.4, 2.6), canopyMat);
    canopy.position.set(0, 4.25, 0);
    canopy.castShadow = true;
    boothGroup.add(canopy);

    const curtainMat = new THREE.MeshLambertMaterial({ color: "#9d0208" });
    const curtain = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.2, 0.2), curtainMat);
    curtain.position.set(0.65, 1.8, 1.15);
    boothGroup.add(curtain);

    const entrance = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3.2), new THREE.MeshBasicMaterial({ color: "#0d1117" }));
    entrance.position.set(-0.65, 1.8, 1.21);
    boothGroup.add(entrance);

    const flashBulb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: "#ffffff" }));
    flashBulb.position.set(0, 3.6, 1.25);
    boothGroup.add(flashBulb);

    boothGroup.position.set(x, 0, z);
    this.exteriorGroup.add(boothGroup);
    this.photoboothMesh = boothGroup;
    this.exteriorColliders.push({ minX: x - 1.5, maxX: x + 1.5, minZ: z - 1.3, maxZ: z + 1.3 });
  }

  createBench(x, z, rotY = 0) {
    const bench = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.4, 0.9),
      new THREE.MeshLambertMaterial({ color: "#8a5833" })
    );
    bench.position.set(x, 0.7, z);
    bench.rotation.y = rotY;
    bench.castShadow = true;
    this.exteriorGroup.add(bench);
    this.exteriorColliders.push({ minX: x - 1.1, maxX: x + 1.1, minZ: z - 0.6, maxZ: z + 0.6 });
  }

  createStreetLamp(x, z) {
    const lampGroup = new THREE.Group();

    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.15, 3.6, 6),
      new THREE.MeshLambertMaterial({ color: "#1f2421" })
    );
    pole.position.set(0, 1.8, 0);
    pole.castShadow = true;
    lampGroup.add(pole);

    const lantern = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.8, 0.65),
      new THREE.MeshLambertMaterial({ color: "#ffd166", emissive: new THREE.Color("#ffd166"), emissiveIntensity: 0.5 })
    );
    lantern.position.set(0, 3.4, 0);
    lampGroup.add(lantern);

    const pointLight = new THREE.PointLight("#ffb703", 0.05, 12, 1.8);
    pointLight.position.set(0, 3.4, 0);
    lampGroup.add(pointLight);

    const halo = new THREE.Sprite(new THREE.SpriteMaterial({
      map: this.createHaloTexture(),
      color: "#ffc857",
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    }));
    halo.scale.set(3.8, 3.8, 1);
    halo.position.set(0, 3.4, 0);
    halo.visible = false;
    lampGroup.add(halo);

    lampGroup.position.set(x, 0, z);
    this.exteriorGroup.add(lampGroup);
    this.lamps.push({ light: pointLight, halo: halo });
    this.exteriorColliders.push({ minX: x - 0.45, maxX: x + 0.45, minZ: z - 0.45, maxZ: z + 0.45 });
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

  // --- GAZEBO TAMAN RAHASIA ---
  buildSecretGarden() {
    const tg = window.textureGen;
    const archGroup = new THREE.Group();

    const woodMat = new THREE.MeshLambertMaterial({ color: "#54331e" });
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 4.4, 6), woodMat);
    postL.position.set(-1.6, 2.2, 0);
    archGroup.add(postL);

    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 4.4, 6), woodMat);
    postR.position.set(1.6, 2.2, 0);
    archGroup.add(postR);

    const beam = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 0.5), woodMat);
    beam.position.set(0, 4.2, 0);
    archGroup.add(beam);

    const vine = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), new THREE.MeshLambertMaterial({ color: "#386623" }));
    vine.position.set(0, 4.4, 0);
    vine.scale.set(2.4, 0.6, 0.8);
    archGroup.add(vine);

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
    this.archGateRibbon = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshBasicMaterial({ map: ribbonTex, transparent: true }));
    this.archGateRibbon.position.set(0, 1.4, 0.05);
    archGroup.add(this.archGateRibbon);

    archGroup.position.set(0, 0, -11.5);
    this.exteriorGroup.add(archGroup);
    this.archGateGroup = archGroup;

    this.gateCollider = { minX: -1.8, maxX: 1.8, minZ: -12.0, maxZ: -11.0 };
    this.exteriorColliders.push(this.gateCollider);

    const gazeboFloorMat = new THREE.MeshLambertMaterial({ map: tg.getWoodDeckTexture() });
    gazeboFloorMat.map.repeat.set(3, 3);
    const gazeboFloor = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.4, 6.5), gazeboFloorMat);
    gazeboFloor.position.set(0, 0.2, -16.5);
    gazeboFloor.receiveShadow = true;
    this.exteriorGroup.add(gazeboFloor);

    // Peti Hadiah
    const chestGroup = new THREE.Group();
    const chestBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.2), new THREE.MeshLambertMaterial({ color: "#8b2612" }));
    chestBody.position.set(0, 0.5, 0);
    chestBody.castShadow = true;
    chestGroup.add(chestBody);

    const chestLid = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.6, 8, 1, false, 0, Math.PI), new THREE.MeshLambertMaterial({ color: "#a83218" }));
    chestLid.rotation.z = Math.PI / 2;
    chestLid.position.set(0, 1.0, 0);
    chestGroup.add(chestLid);

    chestGroup.position.set(0, 0.4, -16.5);
    this.exteriorGroup.add(chestGroup);
    this.giftChestMesh = chestGroup;

    const chestLight = new THREE.PointLight("#ffea00", 1.4, 7, 2);
    chestLight.position.set(0, 2.5, -16.5);
    this.exteriorGroup.add(chestLight);
  }

  openSecretGarden() {
    if (this.archGateOpen) return;
    this.archGateOpen = true;

    if (this.archGateRibbon) {
      this.archGateRibbon.visible = false;
    }

    const idx = this.exteriorColliders.indexOf(this.gateCollider);
    if (idx !== -1) {
      this.exteriorColliders.splice(idx, 1);
    }
  }

  // ==========================================================================
  // --- INTERIOR RUMAH 3D (RUANG TAMU HANGAT & SURAT SPESIAL KEYZHA) ---
  // ==========================================================================
  buildInteriorRoom() {
    const tg = window.textureGen;
    const room = this.interiorGroup;
    room.position.set(100, 0, 100); // Terletak di zona terisolasi rapi

    // 1. Lantai Kayu Hangat (14 x 10 unit)
    const floorMat = new THREE.MeshLambertMaterial({ map: tg.getWoodFloorTexture() });
    floorMat.map.repeat.set(7, 5);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 0);
    floor.receiveShadow = true;
    room.add(floor);

    // 2. Karpet Hangat Ruang Tamu
    const rugMat = new THREE.MeshLambertMaterial({ map: tg.getInteriorRugTexture() });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 4.8), rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(0, 0.02, 0);
    rug.receiveShadow = true;
    room.add(rug);

    // 3. Dinding Ruangan (Utara, Barat, Timur, Selatan)
    const wallMat = new THREE.MeshLambertMaterial({ map: tg.getInteriorWallTexture() });
    wallMat.map.repeat.set(4, 1);

    // Dinding Belakang (Utara)
    const wallNorth = new THREE.Mesh(new THREE.PlaneGeometry(14, 5.5), wallMat);
    wallNorth.position.set(0, 2.75, -5);
    room.add(wallNorth);

    // Dinding Kiri (Barat)
    const wallWest = new THREE.Mesh(new THREE.PlaneGeometry(10, 5.5), wallMat);
    wallWest.rotation.y = Math.PI / 2;
    wallWest.position.set(-7, 2.75, 0);
    room.add(wallWest);

    // Dinding Kanan (Timur)
    const wallEast = new THREE.Mesh(new THREE.PlaneGeometry(10, 5.5), wallMat);
    wallEast.rotation.y = -Math.PI / 2;
    wallEast.position.set(7, 2.75, 0);
    room.add(wallEast);

    // Dinding Depan (Selatan - Tempat Pintu Keluar)
    const wallSouthL = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 5.5), wallMat);
    wallSouthL.rotation.y = Math.PI;
    wallSouthL.position.set(-4.25, 2.75, 5);
    room.add(wallSouthL);

    const wallSouthR = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 5.5), wallMat);
    wallSouthR.rotation.y = Math.PI;
    wallSouthR.position.set(4.25, 2.75, 5);
    room.add(wallSouthR);

    // Pintu Keluar ke Halaman
    const exitDoorMat = new THREE.MeshLambertMaterial({ color: "#61381e" });
    const exitDoor = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 3.4), exitDoorMat);
    exitDoor.rotation.y = Math.PI;
    exitDoor.position.set(0, 1.7, 4.95);
    room.add(exitDoor);

    // Keset Pintu Masuk
    const matMat = new THREE.MeshLambertMaterial({ color: "#8a6642" });
    const doormat = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.4), matMat);
    doormat.rotation.x = -Math.PI / 2;
    doormat.position.set(0, 0.02, 3.8);
    room.add(doormat);

    // 4. Perapian Batu (Stone Fireplace)
    const hearthGroup = new THREE.Group();
    const hearthBase = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 3.2, 1.2),
      new THREE.MeshLambertMaterial({ color: "#544e47" })
    );
    hearthBase.position.set(0, 1.6, -4.4);
    hearthGroup.add(hearthBase);

    // Lubang Api Berpendar Hangat
    const fireOpening = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.8, 0.8),
      new THREE.MeshBasicMaterial({ color: "#ff6b35" })
    );
    fireOpening.position.set(0, 1.0, -4.2);
    hearthGroup.add(fireOpening);

    // Cahaya Api Perapian (Flickering PointLight)
    this.fireplaceLight = new THREE.PointLight("#ff8838", 1.8, 10, 1.8);
    this.fireplaceLight.position.set(0, 1.4, -3.6);
    hearthGroup.add(this.fireplaceLight);

    room.add(hearthGroup);

    // 5. Sofa Nyaman (Cozy Sofa)
    const sofaGroup = new THREE.Group();
    const sofaSeat = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 0.7, 1.4),
      new THREE.MeshLambertMaterial({ color: "#457b9d" })
    );
    sofaSeat.position.set(0, 0.35, 0);
    sofaGroup.add(sofaSeat);

    const sofaBack = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 1.2, 0.4),
      new THREE.MeshLambertMaterial({ color: "#1d3557" })
    );
    sofaBack.position.set(0, 0.8, -0.6);
    sofaGroup.add(sofaBack);

    sofaGroup.position.set(-4.5, 0, 0);
    sofaGroup.rotation.y = Math.PI / 2;
    room.add(sofaGroup);

    // 6. Rak Buku Kayu Penuh Buku
    const shelfGroup = new THREE.Group();
    const shelfBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 4.0, 0.8),
      new THREE.MeshLambertMaterial({ color: "#5c371f" })
    );
    shelfBody.position.set(0, 2.0, 0);
    shelfGroup.add(shelfBody);

    shelfGroup.position.set(-5.5, 0, -4.5);
    room.add(shelfGroup);

    // 7. Meja Kayu & Tempat Surat Utama (Letter Table)
    const tableGroup = new THREE.Group();
    const tableTop = new THREE.Mesh(
      new THREE.BoxGeometry(2.8, 0.15, 1.8),
      new THREE.MeshLambertMaterial({ color: "#8a5833" })
    );
    tableTop.position.set(0, 1.0, 0);
    tableGroup.add(tableTop);

    // Kaki meja
    for (let lx of [-1.2, 1.2]) {
      for (let lz of [-0.7, 0.7]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.0, 6), new THREE.MeshLambertMaterial({ color: "#54331e" }));
        leg.position.set(lx, 0.5, lz);
        tableGroup.add(leg);
      }
    }

    // Kotak Surat Spesial / Hadiah Utama di Atas Meja
    const specialBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.45, 0.7),
      new THREE.MeshLambertMaterial({ color: "#e63946" })
    );
    specialBox.position.set(0, 1.3, 0);
    tableGroup.add(specialBox);

    // Lampu Meja Emas
    const deskLamp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.35, 0.5, 6),
      new THREE.MeshLambertMaterial({ color: "#ffd166", emissive: new THREE.Color("#ffd166"), emissiveIntensity: 0.8 })
    );
    deskLamp.position.set(0.9, 1.35, -0.4);
    tableGroup.add(deskLamp);

    const deskLight = new THREE.PointLight("#ffd166", 1.5, 8, 1.8);
    deskLight.position.set(0.9, 1.6, -0.4);
    tableGroup.add(deskLight);

    tableGroup.position.set(4.5, 0, -2.5);
    room.add(tableGroup);
    this.interiorLetterMesh = tableGroup;

    // 8. Pencahayaan Hangat Plafon Ruangan
    const chandelierLight = new THREE.PointLight("#ffecd1", 1.4, 15, 1.5);
    chandelierLight.position.set(0, 4.5, 0);
    room.add(chandelierLight);

    // Colliders Interior Rumah (Relatif terhadap posisi pusat 100, 0, 100)
    const ox = 100, oz = 100;
    this.interiorColliders.push({ minX: ox - 7, maxX: ox + 7, minZ: oz - 5.5, maxZ: oz - 4.8 }); // Tembok Utara
    this.interiorColliders.push({ minX: ox - 7.5, maxX: ox - 6.8, minZ: oz - 5, maxZ: oz + 5 });  // Tembok Barat
    this.interiorColliders.push({ minX: ox + 6.8, maxX: ox + 7.5, minZ: oz - 5, maxZ: oz + 5 });  // Tembok Timur
    this.interiorColliders.push({ minX: ox - 7, maxX: ox - 1.2, minZ: oz + 4.8, maxZ: oz + 5.5 }); // Tembok Selatan Kiri
    this.interiorColliders.push({ minX: ox + 1.2, maxX: ox + 7, minZ: oz + 4.8, maxZ: oz + 5.5 }); // Tembok Selatan Kanan
    this.interiorColliders.push({ minX: ox - 2.0, maxX: ox + 2.0, minZ: oz - 5.0, maxZ: oz - 3.8 }); // Perapian
    this.interiorColliders.push({ minX: ox - 5.5, maxX: ox - 3.5, minZ: oz - 1.0, maxZ: oz + 1.0 }); // Sofa
    this.interiorColliders.push({ minX: ox + 3.0, maxX: ox + 6.0, minZ: oz - 3.5, maxZ: oz - 1.5 }); // Meja Surat
  }

  // --- TRANSISI MASUK & KELUAR RUMAH ---
  enterHouse(player) {
    this.currentZone = "interior";
    this.colliders = this.interiorColliders;

    // Pindahkan pemain ke dekat pintu masuk interior
    player.x = 100;
    player.y = 0;
    player.z = 100 + 3.2;
    player.direction = "up";

    // Set kabut & background untuk interior yang hangat & cozy
    const warmBg = new THREE.Color("#16101e");
    this.scene.background = warmBg;
    this.scene.fog.color = warmBg;
    this.scene.fog.near = 12;
    this.scene.fog.far = 40;
  }

  exitHouse(player) {
    this.currentZone = "exterior";
    this.colliders = this.exteriorColliders;

    // Kembalikan pemain ke serambi teras depan rumah
    player.x = -7;
    player.y = 1.2;
    player.z = -4.8;
    player.direction = "down";

    // Kembalikan pencahayaan waktu eksterior saat ini
    this.setTimeOfDay(this.timeOfDay);
  }

  // --- PARTIKEL ATMOSFER ---
  setupAtmosphericParticles() {
    this.butterflies = [];
    const bColors = ["#ff70a6", "#ffd166", "#68d8d6"];
    for (let i = 0; i < 6; i++) {
      const bMat = new THREE.MeshBasicMaterial({ color: bColors[i % bColors.length], side: THREE.DoubleSide });
      const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), bMat);
      const bx = -8 + Math.random() * 16;
      const bz = -2 + Math.random() * 14;
      wing.position.set(bx, 0.8 + Math.random() * 0.6, bz);
      this.exteriorGroup.add(wing);

      this.butterflies.push({
        mesh: wing,
        baseX: bx,
        baseZ: bz,
        phase: Math.random() * Math.PI * 2,
        speed: 1.2 + Math.random() * 0.8
      });
    }

    const fireflyCount = 50;
    const fireflyGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(fireflyCount * 3);
    const speeds = [];

    for (let i = 0; i < fireflyCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 1] = 0.5 + Math.random() * 3.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 32;

      speeds.push({
        vx: (Math.random() - 0.5) * 0.015,
        vy: (Math.random() - 0.5) * 0.01,
        vz: (Math.random() - 0.5) * 0.015,
        phase: Math.random() * Math.PI * 2
      });
    }

    fireflyGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.fireflyPoints = new THREE.Points(fireflyGeo, new THREE.PointsMaterial({
      color: "#d4ff32",
      size: 0.38,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    }));
    this.fireflySpeeds = speeds;
    this.exteriorGroup.add(this.fireflyPoints);
  }

  updateEnvironment(delta, time) {
    // Goyangan Angin Daun Pohon 3D
    this.animatedMeshes.forEach(item => {
      if (item.type === "tree") {
        item.canopy.rotation.z = Math.sin(time * 1.5 + item.phase) * 0.035;
        item.canopy.rotation.x = Math.cos(time * 1.1 + item.phase) * 0.02;
      }
    });

    // Riak Air Kolam
    if (this.waterMesh && this.waterMesh.material.map) {
      this.waterMesh.material.map.offset.x += delta * 0.035;
      this.waterMesh.material.map.offset.y += delta * 0.015;
    }

    // Animasi Layar Arcade
    if (this.arcadeScreenCanvas) {
      const aCtx = this.arcadeScreenCanvas.getContext("2d");
      aCtx.fillStyle = "#0c1021";
      aCtx.fillRect(0, 0, 64, 48);

      const starY = (time * 20) % 48;
      aCtx.fillStyle = "#ffd166";
      aCtx.fillRect(28, starY, 6, 6);
      aCtx.fillStyle = "#06d6a0";
      aCtx.fillRect(22, 38, 18, 4);

      if (this.arcadeScreenTexture) {
        this.arcadeScreenTexture.needsUpdate = true;
      }
    }

    // Kedipan Lembut Api Perapian di Interior
    if (this.fireplaceLight) {
      this.fireplaceLight.intensity = 1.6 + Math.sin(time * 8) * 0.35 + Math.cos(time * 13) * 0.2;
    }

    // Kupu-kupu
    const showButterflies = (this.timeOfDay === "day" || this.timeOfDay === "dusk") && this.currentZone === "exterior";
    this.butterflies.forEach(b => {
      b.mesh.visible = showButterflies;
      if (showButterflies) {
        const t = time * b.speed + b.phase;
        b.mesh.position.x = b.baseX + Math.sin(t * 0.8) * 1.5;
        b.mesh.position.z = b.baseZ + Math.cos(t * 0.6) * 1.5;
        b.mesh.position.y = 0.8 + Math.abs(Math.sin(t * 2.5)) * 0.6;
        b.mesh.rotation.y = t * 1.2;
      }
    });

    // Kunang-kunang
    if (this.fireflyPoints) {
      const isNight = (this.timeOfDay === "night" || this.timeOfDay === "dusk") && this.currentZone === "exterior";
      this.fireflyPoints.visible = isNight;

      if (isNight) {
        const pos = this.fireflyPoints.geometry.attributes.position.array;
        for (let i = 0; i < this.fireflySpeeds.length; i++) {
          const sp = this.fireflySpeeds[i];
          pos[i * 3] += sp.vx + Math.sin(time + sp.phase) * 0.008;
          pos[i * 3 + 1] += sp.vy + Math.cos(time * 0.8 + sp.phase) * 0.006;
          pos[i * 3 + 2] += sp.vz + Math.sin(time * 0.5 + sp.phase) * 0.008;

          if (pos[i * 3 + 1] < 0.3) pos[i * 3 + 1] = 0.3;
          if (pos[i * 3 + 1] > 4.5) pos[i * 3 + 1] = 4.5;
        }
        this.fireflyPoints.geometry.attributes.position.needsUpdate = true;
      }
    }
  }

  // --- THIRD-PERSON FOLLOW CAMERA ---
  updateThirdPersonCamera(playerX, playerY, playerZ) {
    if (this.currentZone === "interior") {
      // Framing kamera nyaman di dalam ruang tamu
      const targetCamX = playerX * 0.5 + 50;
      const targetCamY = playerY + 5.2;
      const targetCamZ = playerZ + 7.8;

      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.09;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 0.09;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.09;

      this.camera.lookAt(playerX, playerY + 1.2, playerZ - 0.8);
    } else {
      // Kamera Eksterior Follow (24 Derajat)
      const targetCamX = playerX;
      const targetCamY = playerY + 3.8;
      const targetCamZ = playerZ + 9.2;

      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.09;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 0.09;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.09;

      this.camera.lookAt(playerX, playerY + 1.25, playerZ - 0.5);
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
