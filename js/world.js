/**
 * ============================================================================
 * 3D DIORAMA WORLD, VOLUMETRIC PROPS & THIRD-PERSON CAMERA ENGINE
 * ============================================================================
 * Mengatur lingkungan 3D luas tanpa batas void biru, kabut atmosfer alami,
 * kamera Third-Person Close-Up Follow Camera yang halus (24 derajat),
 * pohon 3D bervolume dengan goyangan angin, rumah 3D, kolam beranimasi,
 * kupu-kupu, kunang-kunang, dan pencahayaan dinamis 3 waktu.
 */

class DioramaWorld {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.colliders = [];
    this.lamps = [];
    this.animatedMeshes = [];
    this.particles = [];
    this.timeOfDay = "day"; // "day", "dusk", "night"

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Pencahayaan
    this.dirLight = null;
    this.ambientLight = null;
    this.hemiLight = null;

    // Elemen Props 3D
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

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene & Kabut Atmosfer Alami (Menyatu Sempurna dengan Horizon)
    this.scene = new THREE.Scene();
    const fogColor = new THREE.Color("#c8ebd4"); // Hijau-krem lembut menyatu dengan pepohonan jauh
    this.scene.background = fogColor;
    this.scene.fog = new THREE.Fog(fogColor, 20, 68);

    // 2. Kamera Third-Person Close-Up Follow Camera (Sudut ~24 Derajat)
    // FOV 40 agar proporsi karakter dan latar belakang terasa sinematik & intim
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 300);
    this.camera.position.set(-6, 4.2, 16);
    this.camera.lookAt(-6, 1.2, 6);

    // 3. WebGL Renderer dengan PCFSoftShadowMap
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

    // 4. Bangun Dunia & Lingkungan Luas
    this.setupLighting();
    this.buildExpansiveTerrain();
    this.buildPerimeterForest();
    this.buildVolumetricHouse();
    this.buildScenicStreamAndGarden();
    this.buildInteractiveProps();
    this.buildSecretGarden();
    this.setupAtmosphericParticles();

    window.addEventListener("resize", () => this.onResize());
  }

  // --- SISTEM PENCAHAYAAN (LIGHTING & SHADOWS) ---
  setupLighting() {
    this.ambientLight = new THREE.AmbientLight("#d8f3dc", 0.72);
    this.scene.add(this.ambientLight);

    // Hemisphere Light lembut untuk langit & tanah
    this.hemiLight = new THREE.HemisphereLight("#e2f7eb", "#4a6b36", 0.35);
    this.scene.add(this.hemiLight);

    // Matahari dengan Bayangan Lembut
    this.dirLight = new THREE.DirectionalLight("#fff9ed", 1.2);
    this.dirLight.position.set(22, 34, 18);
    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 5;
    this.dirLight.shadow.camera.far = 80;
    const d = 28;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0006;

    this.scene.add(this.dirLight);
  }

  // Ganti Suasana Waktu (Siang, Sore, Malam)
  setTimeOfDay(time) {
    this.timeOfDay = time;

    if (time === "day") {
      const dayFog = new THREE.Color("#c8ebd4");
      this.scene.background = dayFog;
      this.scene.fog.color = dayFog;
      this.scene.fog.near = 20;
      this.scene.fog.far = 68;

      this.dirLight.color.set("#fff9ed");
      this.dirLight.intensity = 1.25;
      this.dirLight.position.set(22, 34, 18);
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
      this.scene.fog.near = 16;
      this.scene.fog.far = 60;

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
      this.scene.fog.near = 14;
      this.scene.fog.far = 52;

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

  // --- PERMUKAAN TANAH LUAS (MENGHILANGKAN VOID BIRU) ---
  buildExpansiveTerrain() {
    const tg = window.textureGen;

    // 1. Tanah Lapangan Rumput Luas Tak Terputus (180 x 180 unit)
    const grassMat = new THREE.MeshLambertMaterial({ map: tg.getGrassTexture() });
    grassMat.map.repeat.set(45, 45);

    const outerTerrain = new THREE.Mesh(new THREE.PlaneGeometry(180, 180), grassMat);
    outerTerrain.rotation.x = -Math.PI / 2;
    outerTerrain.position.set(0, -0.05, 0);
    outerTerrain.receiveShadow = true;
    this.scene.add(outerTerrain);

    // 2. Teras Batu Halaman Rumah (Elevated Terrace)
    const stonePathMat = new THREE.MeshLambertMaterial({ map: tg.getStonePathTexture() });
    stonePathMat.map.repeat.set(6, 5);

    const soilMat = new THREE.MeshLambertMaterial({ map: tg.getSoilSideTexture() });
    soilMat.map.repeat.set(8, 1);
    const bottomMat = new THREE.MeshLambertMaterial({ color: "#1a110b" });

    const terraceMat = [soilMat, soilMat, stonePathMat, bottomMat, soilMat, soilMat];
    const terraceGeo = new THREE.BoxGeometry(16, 1.2, 14);
    const terrace = new THREE.Mesh(terraceGeo, terraceMat);
    terrace.position.set(-7, 0.6, -9);
    terrace.receiveShadow = true;
    terrace.castShadow = true;
    this.scene.add(terrace);

    // Tangga Batu Teras dengan Ramp Halus
    const stepGeo = new THREE.BoxGeometry(4.6, 0.6, 2.4);
    const stepMesh = new THREE.Mesh(stepGeo, stonePathMat);
    stepMesh.position.set(-7, 0.3, -1.2);
    stepMesh.receiveShadow = true;
    this.scene.add(stepMesh);

    // 3. Jaringan Jalan Setapak Batu Menghubungkan Spot
    this.createPathSegment(2.6, 18, -7, 0.02, 6);   // Dari teras ke depan
    this.createPathSegment(16, 2.6, 0, 0.02, 6);    // Melintang ke arcade
    this.createPathSegment(2.6, 12, 7, 0.02, 0);    // Ke photobooth
    this.createPathSegment(2.6, 11, 0, 0.02, -10);  // Menuju gerbang rahasia
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

  // --- HUTAN DINDING KELILING & BUKIT (PERIMETER FOREST WALL) ---
  buildPerimeterForest() {
    // Membangun bukit dan jajaran pohon berlapis di seluruh perimeter
    // agar ke mana pun kamera memandang, terlihat pepohonan rimbun alami
    const forestDensity = [
      // Sisi Utara (Belakang)
      [-24, -26], [-18, -27], [-12, -28], [-6, -26], [0, -29], [6, -27], [12, -28], [18, -26], [24, -27],
      [-22, -22], [22, -22],
      // Sisi Selatan (Depan)
      [-24, 25], [-18, 26], [-12, 25], [-5, 27], [2, 26], [8, 25], [15, 26], [22, 25],
      [-20, 21], [20, 21],
      // Sisi Barat (Kiri)
      [-25, -16], [-26, -10], [-25, -4], [-26, 2], [-25, 8], [-26, 14],
      // Sisi Timur (Kanan)
      [25, -16], [26, -10], [25, -4], [26, 2], [25, 8], [26, 14]
    ];

    forestDensity.forEach(([fx, fz]) => {
      const scale = 1.2 + Math.random() * 0.45;
      this.createVolumetricTree(fx, fz, scale, true);
    });

    // Bukit Pembatas Alami di Sekeliling
    const hillMat = new THREE.MeshLambertMaterial({ color: "#477a33" });
    const hillPositions = [
      [-28, -24, 16], [0, -32, 20], [28, -24, 16],
      [-28, 24, 16], [0, 30, 20], [28, 24, 16]
    ];

    hillPositions.forEach(([hx, hz, rad]) => {
      const hill = new THREE.Mesh(new THREE.ConeGeometry(rad, 7, 8), hillMat);
      hill.position.set(hx, 1.5, hz);
      this.scene.add(hill);
    });

    // Batas Halus (Soft Barrier) agar pemain tetap di dalam area taman yang indah
    this.colliders.push({ minX: -19, maxX: -17.5, minZ: -20, maxZ: 20 }); // Kiri
    this.colliders.push({ minX: 17.5, maxX: 19, minZ: -20, maxZ: 20 });   // Kanan
    this.colliders.push({ minX: -20, maxX: 20, minZ: 17.5, maxZ: 19 });   // Depan
    this.colliders.push({ minX: -20, maxX: 20, minZ: -19, maxZ: -17.5 }); // Belakang
  }

  // --- POHON 3D BERVOLUME DENGAN GOYANGAN ANGIN (VOLUMETRIC TREES) ---
  createVolumetricTree(x, z, scale = 1.0, isPerimeter = false) {
    const treeGroup = new THREE.Group();

    // 1. Batang Kayu 3D Silinder dengan Pangkal Akar
    const trunkMat = new THREE.MeshLambertMaterial({ color: "#4a2c17" });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.38 * scale, 0.65 * scale, 3.2 * scale, 7), trunkMat);
    trunk.position.set(0, 1.6 * scale, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // 2. Mahkota Daun Berlapis-Lapis (Organic Shaded Clouds)
    const canopyGroup = new THREE.Group();

    const darkGreenMat = new THREE.MeshLambertMaterial({ color: "#2d5a27", flatShading: true });
    const midGreenMat = new THREE.MeshLambertMaterial({ color: "#488531", flatShading: true });
    const lightGreenMat = new THREE.MeshLambertMaterial({ color: "#68ab43", flatShading: true });

    // Lapisan bawah (Dark)
    const baseSphere = new THREE.Mesh(new THREE.DodecahedronGeometry(2.5 * scale, 1), darkGreenMat);
    baseSphere.position.set(0, 3.6 * scale, 0);
    baseSphere.scale.set(1.2, 0.85, 1.2);
    baseSphere.castShadow = true;
    canopyGroup.add(baseSphere);

    // Gumpalan tengah (Mid Green)
    const midSphere1 = new THREE.Mesh(new THREE.DodecahedronGeometry(2.0 * scale, 1), midGreenMat);
    midSphere1.position.set(-0.7 * scale, 4.4 * scale, 0.4 * scale);
    midSphere1.castShadow = true;
    canopyGroup.add(midSphere1);

    const midSphere2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.9 * scale, 1), midGreenMat);
    midSphere2.position.set(0.8 * scale, 4.3 * scale, -0.4 * scale);
    midSphere2.castShadow = true;
    canopyGroup.add(midSphere2);

    // Puncak rimbun (Light Green terkena matahari)
    const topSphere = new THREE.Mesh(new THREE.DodecahedronGeometry(1.8 * scale, 1), lightGreenMat);
    topSphere.position.set(0, 5.2 * scale, 0);
    topSphere.castShadow = true;
    canopyGroup.add(topSphere);

    treeGroup.add(canopyGroup);
    treeGroup.position.set(x, 0, z);
    this.scene.add(treeGroup);

    // Daftarkan untuk animasi goyangan angin lembut
    this.animatedMeshes.push({
      type: "tree",
      canopy: canopyGroup,
      phase: x * 0.4 + z * 0.3
    });

    // Tambahkan collider hanya jika bukan sekadar pohon perimeter
    if (!isPerimeter) {
      this.colliders.push({
        minX: x - 0.75 * scale,
        maxX: x + 0.75 * scale,
        minZ: z - 0.75 * scale,
        maxZ: z + 0.75 * scale
      });
    }
  }

  // --- BANGUNAN PONDOK RUMAH 3D (VOLUMETRIC COTTAGE) ---
  buildVolumetricHouse() {
    const tg = window.textureGen;
    const houseGroup = new THREE.Group();

    // 1. Dinding Utama 3D (Textured Plaster & Timber)
    const wallMat = new THREE.MeshLambertMaterial({ map: tg.getHouseWallTexture() });
    const houseBody = new THREE.Mesh(new THREE.BoxGeometry(10.2, 5.8, 8.8), wallMat);
    houseBody.position.set(-8, 4.1, -10.5);
    houseBody.castShadow = true;
    houseBody.receiveShadow = true;
    houseGroup.add(houseBody);

    this.colliders.push({ minX: -13.5, maxX: -2.5, minZ: -15.5, maxZ: -5.8 });

    // 2. Atap Miring Pelana Berlapis (Sloped Roof)
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

    // 3. Cerobong Asap Bata dengan Asap Mengepul
    const chimneyMat = new THREE.MeshLambertMaterial({ color: "#733324" });
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.5, 4.0, 1.5), chimneyMat);
    chimney.position.set(-4.5, 8.8, -12);
    chimney.castShadow = true;
    houseGroup.add(chimney);

    // 4. Jendela Menyala
    const winMat = new THREE.MeshLambertMaterial({
      map: tg.createCanvasTexture(32, 32, (ctx) => {
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(0, 0, 32, 32);
        ctx.fillStyle = "#4a2c17";
        ctx.fillRect(0, 0, 32, 3);
        ctx.fillRect(0, 29, 32, 3);
        ctx.fillRect(0, 0, 3, 32);
        ctx.fillRect(29, 0, 3, 32);
        ctx.fillRect(14, 0, 4, 32);
        ctx.fillRect(0, 14, 32, 4);
      }),
      emissive: new THREE.Color(0x000000)
    });
    this.houseWindows.push(winMat);

    const win1 = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), winMat);
    win1.position.set(-4.5, 3.8, -6.08);
    houseGroup.add(win1);

    const win2 = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), winMat);
    win2.position.set(-10.2, 3.8, -6.08);
    houseGroup.add(win2);

    // 5. Dek Serambi Depan
    const deckMat = new THREE.MeshLambertMaterial({ map: tg.getWoodDeckTexture() });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(8.2, 0.35, 2.6), deckMat);
    deck.position.set(-7, 1.35, -5.0);
    deck.receiveShadow = true;
    houseGroup.add(deck);

    this.scene.add(houseGroup);
  }

  // --- ALIRAN SUNGAI, KOLAM BERKILAU & TAMAN ALAM ---
  buildScenicStreamAndGarden() {
    const tg = window.textureGen;

    // 1. Kolam Air Berkilau dengan Animasi Riak Gelombang
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
    this.scene.add(waterPlane);
    this.waterMesh = waterPlane;

    // Collider Kolam (Mencegah pemain berjalan menembus air)
    this.colliders.push({ minX: 6.8, maxX: 15.5, minZ: 7.2, maxZ: 15.0 });

    // Daun Teratai (Lily Pads) & Bunga Teratai Mengapung
    const lilyMat = new THREE.MeshLambertMaterial({ color: "#2d6a4f" });
    const lotusMat = new THREE.MeshLambertMaterial({ color: "#ff758f" });
    const lilyPads = [
      [9.5, 9.8], [12.2, 10.5], [10.8, 12.8], [13.2, 12.2]
    ];
    lilyPads.forEach(([lx, lz]) => {
      const pad = new THREE.Mesh(new THREE.CircleGeometry(0.55, 7), lilyMat);
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(lx, 0.06, lz);
      this.scene.add(pad);

      // Bunga teratai merah muda di atasnya
      const lotus = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), lotusMat);
      lotus.position.set(lx, 0.16, lz);
      this.scene.add(lotus);
    });

    // Bebatuan Alami Mengelilingi Kolam
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
      this.scene.add(rock);
    });

    // 2. Pohon Rindang Utama di Tengah Taman
    this.createVolumetricTree(-13, 2, 1.25);
    this.createVolumetricTree(-12, 10, 1.15);
    this.createVolumetricTree(-3.5, 12.5, 1.1);
    this.createVolumetricTree(12.5, -2, 1.35);
    this.createVolumetricTree(13, -11, 1.2);

    // 3. Semak Berbunga & Kumpulan Bunga Liar (Wildflowers)
    const flowerColors = ["#ff4d6d", "#ffbe0b", "#c77dff", "#ffffff"];
    for (let i = 0; i < 40; i++) {
      const fx = -14 + Math.random() * 28;
      const fz = -14 + Math.random() * 28;
      // Jangan taruh di kolam atau teras
      if (fx > 6 && fz > 6) continue;
      if (fx < -2 && fz < -3) continue;

      const fMat = new THREE.MeshLambertMaterial({
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)]
      });
      const flower = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), fMat);
      flower.position.set(fx, 0.2, fz);
      this.scene.add(flower);
    }
  }

  // --- OBJEK INTERAKTIF (KOTAK SURAT, ARCADE 3D, PHOTOBOOTH 3D) ---
  buildInteractiveProps() {
    const tg = window.textureGen;

    // 1. Bangku Taman Kayu (Park Bench)
    this.createBench(-10.5, 1.5, 0);
    this.createBench(9, 7.5, -Math.PI / 4);

    // 2. Lampu Taman Fungsional
    this.createStreetLamp(-6, 12);
    this.createStreetLamp(4, 8);
    this.createStreetLamp(8, -4);
    this.createStreetLamp(-2, -7);

    // 3. Kotak Pos Merah Klasik (Mailbox - Quest 1)
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

    // Bendera kuning kecil
    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.35, 0.2),
      new THREE.MeshLambertMaterial({ color: "#ffb703" })
    );
    flag.position.set(0.44, 1.5, 0.2);
    mailGroup.add(flag);

    mailGroup.position.set(-5.5, 0, 2.8);
    this.scene.add(mailGroup);
    this.mailboxMesh = mailGroup;
    this.colliders.push({ minX: -6.0, maxX: -5.0, minZ: 2.3, maxZ: 3.3 });

    // 4. Mesin Arcade 3D Sungguhan (3D Arcade Cabinet - Quest 3)
    this.build3DArcadeCabinet(5, 5);

    // 5. Photobooth 3D Vintage (3D Photobooth Kiosk - Quest 4)
    this.build3DPhotobooth(9.5, 1.5);
  }

  // Mesin Arcade Berbentuk 3D Kabinet Lengkap
  build3DArcadeCabinet(x, z) {
    const cabinetGroup = new THREE.Group();

    // Bodi Kabinet Arcade Ungu Retro
    const bodyMat = new THREE.MeshLambertMaterial({ color: "#241442" });
    const mainBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.8, 1.8), bodyMat);
    mainBody.position.set(0, 1.9, 0);
    mainBody.castShadow = true;
    cabinetGroup.add(mainBody);

    // Marquee Neon Atas
    const marqueeMat = new THREE.MeshLambertMaterial({
      color: "#ff007f",
      emissive: new THREE.Color("#ff007f"),
      emissiveIntensity: 0.6
    });
    const marquee = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.5, 0.2), marqueeMat);
    marquee.position.set(0, 3.5, 0.85);
    cabinetGroup.add(marquee);

    // Layar Monitor CRT Bercahaya
    this.arcadeScreenCanvas = document.createElement("canvas");
    this.arcadeScreenCanvas.width = 64;
    this.arcadeScreenCanvas.height = 48;
    this.arcadeScreenTexture = new THREE.CanvasTexture(this.arcadeScreenCanvas);
    this.arcadeScreenTexture.magFilter = THREE.NearestFilter;

    const screenMat = new THREE.MeshBasicMaterial({ map: this.arcadeScreenTexture });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), screenMat);
    screen.position.set(0, 2.5, 0.91);
    screen.rotation.x = -Math.PI / 18; // Miring sedikit ke atas
    cabinetGroup.add(screen);

    // Panel Kontrol & Tombol
    const panelMat = new THREE.MeshLambertMaterial({ color: "#160b29" });
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.3, 0.8), panelMat);
    deck.position.set(0, 1.7, 0.7);
    deck.rotation.x = Math.PI / 12;
    cabinetGroup.add(deck);

    // Joystick Merah
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6),
      new THREE.MeshLambertMaterial({ color: "#e63946" })
    );
    stick.position.set(-0.4, 1.95, 0.7);
    cabinetGroup.add(stick);

    // Lampu Neon Pendar Arcade
    const neonLight = new THREE.PointLight("#ff007f", 0.9, 6, 2);
    neonLight.position.set(0, 2.6, 1.2);
    cabinetGroup.add(neonLight);

    cabinetGroup.position.set(x, 0, z);
    this.scene.add(cabinetGroup);
    this.arcadeMesh = cabinetGroup;
    this.colliders.push({ minX: x - 1.1, maxX: x + 1.1, minZ: z - 1.0, maxZ: z + 1.0 });
  }

  // Photobooth Berbentuk Bilik Foto 3D
  build3DPhotobooth(x, z) {
    const boothGroup = new THREE.Group();

    // Dinding Bilik Kayu
    const woodMat = new THREE.MeshLambertMaterial({ color: "#4f5d75" });
    const boothBody = new THREE.Mesh(new THREE.BoxGeometry(2.8, 4.2, 2.4), woodMat);
    boothBody.position.set(0, 2.1, 0);
    boothBody.castShadow = true;
    boothGroup.add(boothBody);

    // Kanopi Garis-Garis Merah Putih
    const canopyMat = new THREE.MeshLambertMaterial({ color: "#d90429" });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.4, 2.6), canopyMat);
    canopy.position.set(0, 4.25, 0);
    canopy.castShadow = true;
    boothGroup.add(canopy);

    // Tirai Beludru Merah Menutup Sebelah Pintu
    const curtainMat = new THREE.MeshLambertMaterial({ color: "#9d0208" });
    const curtain = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3.2, 0.2), curtainMat);
    curtain.position.set(0.65, 1.8, 1.15);
    boothGroup.add(curtain);

    // Pintu Masuk Bilik Gelap
    const insideMat = new THREE.MeshBasicMaterial({ color: "#0d1117" });
    const entrance = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3.2), insideMat);
    entrance.position.set(-0.65, 1.8, 1.21);
    boothGroup.add(entrance);

    // Lampu Kilat Flash di Atas Bilik
    const flashBulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshBasicMaterial({ color: "#ffffff" })
    );
    flashBulb.position.set(0, 3.6, 1.25);
    boothGroup.add(flashBulb);

    boothGroup.position.set(x, 0, z);
    this.scene.add(boothGroup);
    this.photoboothMesh = boothGroup;
    this.colliders.push({ minX: x - 1.5, maxX: x + 1.5, minZ: z - 1.3, maxZ: z + 1.3 });
  }

  createBench(x, z, rotY = 0) {
    const tg = window.textureGen;
    const benchMat = new THREE.MeshLambertMaterial({
      map: tg.createCanvasTexture(36, 24, (ctx) => {
        ctx.fillStyle = "#8a5833";
        ctx.fillRect(0, 0, 36, 24);
        ctx.fillStyle = "#5c371f";
        ctx.fillRect(0, 4, 36, 2);
        ctx.fillRect(0, 10, 36, 2);
        ctx.fillRect(0, 16, 36, 2);
      })
    });
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 0.9), benchMat);
    bench.position.set(x, 0.7, z);
    bench.rotation.y = rotY;
    bench.castShadow = true;
    this.scene.add(bench);

    this.colliders.push({ minX: x - 1.1, maxX: x + 1.1, minZ: z - 0.6, maxZ: z + 0.6 });
  }

  createStreetLamp(x, z) {
    const lampGroup = new THREE.Group();

    // Tiang Besi Hitam
    const poleMat = new THREE.MeshLambertMaterial({ color: "#1f2421" });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 3.6, 6), poleMat);
    pole.position.set(0, 1.8, 0);
    pole.castShadow = true;
    lampGroup.add(pole);

    // Lentera Kaca Emas
    const lanternMat = new THREE.MeshLambertMaterial({
      color: "#ffd166",
      emissive: new THREE.Color("#ffd166"),
      emissiveIntensity: 0.5
    });
    const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.8, 0.65), lanternMat);
    lantern.position.set(0, 3.4, 0);
    lampGroup.add(lantern);

    // PointLight Menyinari Area Sekitar
    const pointLight = new THREE.PointLight("#ffb703", 0.05, 12, 1.8);
    pointLight.position.set(0, 3.4, 0);
    lampGroup.add(pointLight);

    // Pendaran Lembut (Halo)
    const haloMat = new THREE.SpriteMaterial({
      map: this.createHaloTexture(),
      color: "#ffc857",
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(3.8, 3.8, 1);
    halo.position.set(0, 3.4, 0);
    halo.visible = false;
    lampGroup.add(halo);

    lampGroup.position.set(x, 0, z);
    this.scene.add(lampGroup);

    this.lamps.push({ light: pointLight, halo: halo });
    this.colliders.push({ minX: x - 0.45, maxX: x + 0.45, minZ: z - 0.45, maxZ: z + 0.45 });
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

  // --- AREA RAHASIA: GAZEBO & PETI HADIAH (QUEST 5) ---
  buildSecretGarden() {
    const tg = window.textureGen;
    const archGroup = new THREE.Group();

    // Gerbang Kayu Melengkung Berbunga
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

    // Daun & Mawar Merambat
    const vineMat = new THREE.MeshLambertMaterial({ color: "#386623" });
    const vine = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 1), vineMat);
    vine.position.set(0, 4.4, 0);
    vine.scale.set(2.4, 0.6, 0.8);
    archGroup.add(vine);

    // Pita Penghalang "Terkunci"
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
    this.archGateRibbon = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), ribbonMat);
    this.archGateRibbon.position.set(0, 1.4, 0.05);
    archGroup.add(this.archGateRibbon);

    archGroup.position.set(0, 0, -11.5);
    this.scene.add(archGroup);
    this.archGateGroup = archGroup;

    this.gateCollider = { minX: -1.8, maxX: 1.8, minZ: -12.0, maxZ: -11.0 };
    this.colliders.push(this.gateCollider);

    // Lantai Kayu Gazebo Belakang
    const gazeboFloorMat = new THREE.MeshLambertMaterial({ map: tg.getWoodDeckTexture() });
    gazeboFloorMat.map.repeat.set(3, 3);
    const gazeboFloor = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.4, 6.5), gazeboFloorMat);
    gazeboFloor.position.set(0, 0.2, -16.5);
    gazeboFloor.receiveShadow = true;
    this.scene.add(gazeboFloor);

    // Peti Hadiah Emas Berkilau (Gift Chest)
    const chestGroup = new THREE.Group();
    const chestBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.0, 1.2),
      new THREE.MeshLambertMaterial({ color: "#8b2612" })
    );
    chestBody.position.set(0, 0.5, 0);
    chestBody.castShadow = true;
    chestGroup.add(chestBody);

    const chestLid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.6, 1.6, 8, 1, false, 0, Math.PI),
      new THREE.MeshLambertMaterial({ color: "#a83218" })
    );
    chestLid.rotation.z = Math.PI / 2;
    chestLid.position.set(0, 1.0, 0);
    chestGroup.add(chestLid);

    // Sabuk & Kunci Emas
    const goldTrim = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 1.1, 1.25),
      new THREE.MeshLambertMaterial({ color: "#ffd166" })
    );
    goldTrim.position.set(0, 0.55, 0);
    chestGroup.add(goldTrim);

    chestGroup.position.set(0, 0.4, -16.5);
    this.scene.add(chestGroup);
    this.giftChestMesh = chestGroup;

    // Lentera temaram di atas peti
    const chestLight = new THREE.PointLight("#ffea00", 1.4, 7, 2);
    chestLight.position.set(0, 2.5, -16.5);
    this.scene.add(chestLight);
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

  // --- PARTIKEL ATMOSFER (KUPU-KUPU, KUNANG-KUNANG, ASAP CEROBONG) ---
  setupAtmosphericParticles() {
    // 1. Kupu-kupu beterbangan di atas bunga
    this.butterflies = [];
    const bColors = ["#ff70a6", "#ffd166", "#68d8d6"];
    for (let i = 0; i < 6; i++) {
      const bMat = new THREE.MeshBasicMaterial({
        color: bColors[i % bColors.length],
        side: THREE.DoubleSide
      });
      const wing = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), bMat);
      const bx = -8 + Math.random() * 16;
      const bz = -2 + Math.random() * 14;
      wing.position.set(bx, 0.8 + Math.random() * 0.6, bz);
      this.scene.add(wing);

      this.butterflies.push({
        mesh: wing,
        baseX: bx,
        baseZ: bz,
        phase: Math.random() * Math.PI * 2,
        speed: 1.2 + Math.random() * 0.8
      });
    }

    // 2. Kunang-kunang Malam (Fireflies)
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
    const fireflyMat = new THREE.PointsMaterial({
      color: "#d4ff32",
      size: 0.38,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.fireflyPoints = new THREE.Points(fireflyGeo, fireflyMat);
    this.fireflySpeeds = speeds;
    this.scene.add(this.fireflyPoints);
  }

  // Update Animasi Dunia (Wind Sway, Water Ripple, Butterflies, Fireflies)
  updateEnvironment(delta, time) {
    // 1. Goyangan Angin pada Daun Pohon 3D
    this.animatedMeshes.forEach(item => {
      if (item.type === "tree") {
        item.canopy.rotation.z = Math.sin(time * 1.6 + item.phase) * 0.035;
        item.canopy.rotation.x = Math.cos(time * 1.2 + item.phase) * 0.02;
      }
    });

    // 2. Riak Aliran Air Kolam
    if (this.waterMesh && this.waterMesh.material.map) {
      this.waterMesh.material.map.offset.x += delta * 0.035;
      this.waterMesh.material.map.offset.y += delta * 0.015;
    }

    // 3. Animasi Layar Arcade Mini
    if (this.arcadeScreenCanvas) {
      const aCtx = this.arcadeScreenCanvas.getContext("2d");
      aCtx.fillStyle = "#0c1021";
      aCtx.fillRect(0, 0, 64, 48);

      // Bintang berkedip
      const starY = (time * 20) % 48;
      aCtx.fillStyle = "#ffd166";
      aCtx.fillRect(28, starY, 6, 6);
      aCtx.fillStyle = "#06d6a0";
      aCtx.fillRect(22, 38, 18, 4);

      if (this.arcadeScreenTexture) {
        this.arcadeScreenTexture.needsUpdate = true;
      }
    }

    // 4. Kupu-kupu (Hanya Aktif Siang & Sore)
    const showButterflies = this.timeOfDay === "day" || this.timeOfDay === "dusk";
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

    // 5. Kunang-kunang Malam
    if (this.fireflyPoints) {
      const isNight = this.timeOfDay === "night" || this.timeOfDay === "dusk";
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

  // --- KAMERA THIRD-PERSON CLOSE-UP FOLLOW CAMERA (24 DERAJAT) ---
  updateThirdPersonCamera(playerX, playerY, playerZ) {
    // Sudut 24 derajat ke belakang & atas pemain:
    // Offset Z = +9.2 unit, Offset Y = +4.0 unit
    // (tan(24 deg) = 4.0 / 9.2 = 0.435 -> sudut sangat pas & dekat)
    const targetCamX = playerX;
    const targetCamY = playerY + 3.8;
    const targetCamZ = playerZ + 9.2;

    // Smooth Lerp mengikuti pergerakan pemain
    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.09;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.09;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.09;

    // Kamera selalu fokus memandang ke arah dada/kepala karakter
    const lookTargetX = playerX;
    const lookTargetY = playerY + 1.25;
    const lookTargetZ = playerZ - 0.5;

    this.camera.lookAt(lookTargetX, lookTargetY, lookTargetZ);
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
