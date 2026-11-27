/**
 * ============================================================================
 * 3D DIORAMA WORLD ENGINE - PERSIS VIDEO REFERENSI
 * ============================================================================
 * Mengatur lingkungan 3D HD-2D diorama:
 * - Halaman rumah pedesaan hangat dengan undakan tangga batu
 * - Tebing potongan tanah diorama (soil strata cross-section) di tepi depan & samping
 * - Aliran sungai dengan jembatan kayu berpagar kokoh di sebelah kiri
 * - Pelataran kayu "Main & Foto" dengan mesin Arcade (awning belang) & Photobooth di kanan
 * - Peti kayu pelataran dengan surat di atasnya & papan petunjuk
 * - Lampu taman tiang besi hitam klasik dengan lampion kuning hangat
 * - Pohon-pohon tinggi rimbun & pohon cemara menjulang
 * - Interior rumah 3D cozy lengkap dengan perapian menyala & kado meja belajar
 * - Kamera Medium-Wide Isometric Follow Camera (persis video, tidak menghalangi karakter)
 * - Sistem tabrakan solid (anti tembus air, anti tembus dinding, sliding collision halus)
 */

class DioramaWorld {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.exteriorColliders = [];
    this.interiorColliders = [];
    this.colliders = this.exteriorColliders;

    this.lamps = [];
    this.animatedMeshes = [];
    this.timeOfDay = "day";
    this.currentZone = "exterior"; // "exterior" atau "interior"

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Groups
    this.exteriorGroup = new THREE.Group();
    this.interiorGroup = new THREE.Group();

    // Elemen Props
    this.crateMesh = null;
    this.arcadeMesh = null;
    this.photoboothMesh = null;
    this.waterMesh = null;
    this.houseWindows = [];
    this.doorMesh = null;
    this.interiorFireLight = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene & Kabut Hangat
    this.scene = new THREE.Scene();
    const fogColor = new THREE.Color("#d2ebd7");
    this.scene.background = fogColor;
    this.scene.fog = new THREE.Fog(fogColor, 24, 78);

    this.scene.add(this.exteriorGroup);
    this.scene.add(this.interiorGroup);

    // 2. Kamera Medium-Wide Isometric (Sudut Pandang Lebih Rendah / POV Nyaman)
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 300);
    this.camera.position.set(0, 12.7, 14.7);
    this.camera.lookAt(0, 1.2, 5.0);

    // 3. WebGL Renderer
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

    // 4. Bangun Dunia & Lingkungan
    this.setupLighting();
    this.buildDioramaPlatform();
    this.buildHouseAndStairs();
    this.buildRiverAndBridge();
    this.buildArcadeAndPhotoboothDeck();
    this.buildCourtyardAndProps();
    this.buildTreesAndFoliage();
    this.buildInteriorRoom();

    window.addEventListener("resize", () => this.onResize());
  }

  // --- SISTEM PENCAHAYAAN (LIGHTING & SHADOWS) ---
  setupLighting() {
    this.ambientLight = new THREE.AmbientLight("#eaf4ec", 0.75);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight("#f0fbf4", "#4a6338", 0.35);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight("#fff7ea", 1.28);
    this.dirLight.position.set(18, 32, 16);
    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 5;
    this.dirLight.shadow.camera.far = 70;
    const d = 26;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;
    this.dirLight.shadow.bias = -0.0005;

    this.scene.add(this.dirLight);
  }

  setTimeOfDay(time) {
    this.timeOfDay = time;
    if (this.currentZone === "interior") return;

    if (time === "day") {
      const dayFog = new THREE.Color("#d2ebd7");
      this.scene.background = dayFog;
      this.scene.fog.color = dayFog;
      this.dirLight.color.set("#fff7ea");
      this.dirLight.intensity = 1.28;
      this.ambientLight.color.set("#eaf4ec");
      this.ambientLight.intensity = 0.75;
      this.lamps.forEach(l => { l.light.intensity = 0.05; l.mesh.material.emissiveIntensity = 0.2; });
      this.houseWindows.forEach(m => m.emissive.setHex(0x000000));
    } else if (time === "dusk") {
      const duskFog = new THREE.Color("#f6a066");
      this.scene.background = duskFog;
      this.scene.fog.color = duskFog;
      this.dirLight.color.set("#ff833b");
      this.dirLight.intensity = 1.1;
      this.ambientLight.color.set("#e57757");
      this.ambientLight.intensity = 0.65;
      this.lamps.forEach(l => { l.light.intensity = 1.6; l.mesh.material.emissiveIntensity = 1.0; });
      this.houseWindows.forEach(m => { m.emissive.setHex(0xffaa33); m.emissiveIntensity = 0.6; });
    } else if (time === "night") {
      const nightFog = new THREE.Color("#0d1525");
      this.scene.background = nightFog;
      this.scene.fog.color = nightFog;
      this.dirLight.color.set("#3c5a8c");
      this.dirLight.intensity = 0.42;
      this.ambientLight.color.set("#18233a");
      this.ambientLight.intensity = 0.48;
      this.lamps.forEach(l => { l.light.intensity = 2.6; l.mesh.material.emissiveIntensity = 1.2; });
      this.houseWindows.forEach(m => { m.emissive.setHex(0xffbe0b); m.emissiveIntensity = 0.95; });
    }
  }

  // --- 1. PLATFORM DIORAMA DENGAN TEBING POTONGAN TANAH (SOIL STRATA) ---
  buildDioramaPlatform() {
    const tg = window.textureGen;

    // A. Permukaan Rumput Utama Taman (X: -22 to 22, Z: -20 to 14, Y = 0)
    const grassMat = new THREE.MeshLambertMaterial({ map: tg.getGrassTexture() });
    grassMat.map.repeat.set(22, 17);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(44, 34), grassMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, -3.0);
    ground.receiveShadow = true;
    this.exteriorGroup.add(ground);

    // B. Tebing Potongan Tanah Diorama (Cross-Section Soil Strata)
    // Tepi Depan (South Cliff at Z = 14.0)
    const cutawayMat = new THREE.MeshLambertMaterial({ map: tg.getSoilCutawayTexture() });
    cutawayMat.map.repeat.set(16, 1);

    const cliffFront = new THREE.Mesh(new THREE.PlaneGeometry(44, 5.5), cutawayMat);
    cliffFront.position.set(0, -2.75, 14.0);
    cliffFront.receiveShadow = true;
    this.exteriorGroup.add(cliffFront);

    // Tepi Kiri (West Cliff at X = -22)
    const cutawaySideMat = new THREE.MeshLambertMaterial({ map: tg.getSoilCutawayTexture() });
    cutawaySideMat.map.repeat.set(12, 1);
    const cliffLeft = new THREE.Mesh(new THREE.PlaneGeometry(34, 5.5), cutawaySideMat);
    cliffLeft.rotation.y = Math.PI / 2;
    cliffLeft.position.set(-22.0, -2.75, -3.0);
    this.exteriorGroup.add(cliffLeft);

    // Tepi Kanan (East Cliff at X = 22)
    const cliffRight = new THREE.Mesh(new THREE.PlaneGeometry(34, 5.5), cutawaySideMat);
    cliffRight.rotation.y = -Math.PI / 2;
    cliffRight.position.set(22.0, -2.75, -3.0);
    this.exteriorGroup.add(cliffRight);

    // Collider Batas Dunia Diorama (Agar tidak jatuh keluar tebing)
    this.exteriorColliders.push({ minX: -22.5, maxX: -21.2, minZ: -21.0, maxZ: 14.5 }); // Barat
    this.exteriorColliders.push({ minX: 21.2, maxX: 22.5, minZ: -21.0, maxZ: 14.5 });  // Timur
    this.exteriorColliders.push({ minX: -22.5, maxX: 22.5, minZ: 13.5, maxZ: 15.0 });  // Selatan (Depan)
    this.exteriorColliders.push({ minX: -22.5, maxX: 22.5, minZ: -21.5, maxZ: -19.5 }); // Utara (Belakang)
  }

  // --- 2. RUMAH, TERAS & UNDAKAN TANGGA BATU (PERSIS VIDEO REFERENSI) ---
  buildHouseAndStairs() {
    const tg = window.textureGen;

    // A. Teras Depan Rumah (Terangkat Y = 1.2, X: -9 to 9, Z: -18.5 to -8.0)
    const terraceGroup = new THREE.Group();

    // Lantai Teras Batu
    const stoneMat = new THREE.MeshLambertMaterial({ map: tg.getStonePathTexture() });
    stoneMat.map.repeat.set(6, 4);
    const terraceFloor = new THREE.Mesh(new THREE.PlaneGeometry(18.0, 10.5), stoneMat);
    terraceFloor.rotation.x = -Math.PI / 2;
    terraceFloor.position.set(0, 1.2, -13.25);
    terraceFloor.receiveShadow = true;
    terraceGroup.add(terraceFloor);

    // Dinding Penahan Teras (Retaining Wall Batu & Tanah)
    const wallMat = new THREE.MeshLambertMaterial({ map: tg.getSoilCutawayTexture() });
    wallMat.map.repeat.set(5, 1);

    // Dinding depan teras (kiri & kanan tangga)
    // Tangga berada di X: [-3.0, 3.0] pada Z = -8.0
    const wallFrontLeft = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 1.25), wallMat);
    wallFrontLeft.position.set(-6.0, 0.6, -8.0);
    terraceGroup.add(wallFrontLeft);

    const wallFrontRight = new THREE.Mesh(new THREE.PlaneGeometry(6.0, 1.25), wallMat);
    wallFrontRight.position.set(6.0, 0.6, -8.0);
    terraceGroup.add(wallFrontRight);

    // Dinding samping teras
    const wallSideL = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 1.25), wallMat);
    wallSideL.rotation.y = Math.PI / 2;
    wallSideL.position.set(-9.0, 0.6, -13.25);
    terraceGroup.add(wallSideL);

    const wallSideR = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 1.25), wallMat);
    wallSideR.rotation.y = -Math.PI / 2;
    wallSideR.position.set(9.0, 0.6, -13.25);
    terraceGroup.add(wallSideR);

    // B. Kotak Bunga & Semak Rimbun di Tepi Teras & Tangga (Menghilangkan Tanah Kosong)
    const planterMat = new THREE.MeshLambertMaterial({ color: "#543724" });
    const foliageMat = new THREE.MeshLambertMaterial({ color: "#2d6a4f" });
    const flowerColors = ["#e63946", "#ffb703", "#ffffff", "#f72585", "#70e000"];

    // Planters di bibir teras atas kiri & kanan
    [-6.0, 6.0].forEach(px => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.45, 0.65), planterMat);
      box.position.set(px, 1.4, -8.1);
      box.castShadow = true;
      terraceGroup.add(box);

      // Bunga-bunga berwarna-warni di dalam kotak
      for (let i = 0; i < 7; i++) {
        const c = flowerColors[i % flowerColors.length];
        const fl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22, 0), new THREE.MeshLambertMaterial({ color: c }));
        fl.position.set(px - 2.2 + i * 0.72, 1.7, -8.1);
        fl.castShadow = true;
        terraceGroup.add(fl);
      }
    });

    // Semak bunga di samping tangga bagian bawah (Y = 0)
    [-3.8, 3.8].forEach(bx => {
      for (let s = 0; s < 3; s++) {
        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.45, 6, 6), foliageMat);
        bush.scale.set(1.1, 0.8, 1.1);
        bush.position.set(bx, 0.35, -4.5 - s * 1.3);
        bush.castShadow = true;
        terraceGroup.add(bush);

        const fl = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), new THREE.MeshLambertMaterial({ color: "#ffffff" }));
        fl.position.set(bx + (Math.random() - 0.5) * 0.3, 0.65, -4.5 - s * 1.3);
        terraceGroup.add(fl);
      }
    });

    // C. Undakan Tangga Batu (Dari Y=0 di Z = -4.0 ke Y=1.2 di Z = -8.0, Lebar X = 6.0)
    const stepMat = new THREE.MeshLambertMaterial({ map: tg.getStonePathTexture() });
    const numSteps = 6;
    const stepDepth = (8.0 - 4.0) / numSteps; // ~0.667
    const stepHeight = 1.2 / numSteps; // 0.20

    for (let i = 0; i < numSteps; i++) {
      const sy = (i + 1) * stepHeight;
      const sz = -4.0 - (i * stepDepth) - (stepDepth / 2);
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(6.0, sy, stepDepth),
        stepMat
      );
      stepMesh.position.set(0, sy / 2, sz);
      stepMesh.receiveShadow = true;
      stepMesh.castShadow = true;
      terraceGroup.add(stepMesh);
    }

    // Pagar Pembatas Batu Samping Tangga (Balustrades)
    const curbMat = new THREE.MeshLambertMaterial({ color: "#6c757d" });
    [-3.15, 3.15].forEach(cx => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.55, 4.3), curbMat);
      curb.position.set(cx, 0.7, -6.0);
      curb.castShadow = true;
      terraceGroup.add(curb);
    });

    this.exteriorGroup.add(terraceGroup);

    // D. Bangunan Rumah Kayu Putih Pedesaan (Sesuai Video)
    const houseGroup = new THREE.Group();
    houseGroup.position.set(0, 1.2, -14.0);

    // Dinding Rumah Putih Stucco
    const wallWhiteMat = new THREE.MeshLambertMaterial({ color: "#f7f4ed" });
    const houseBody = new THREE.Mesh(new THREE.BoxGeometry(12.0, 5.0, 7.0), wallWhiteMat);
    houseBody.position.set(0, 2.5, 0);
    houseBody.castShadow = true;
    houseBody.receiveShadow = true;
    houseGroup.add(houseBody);

    // Tiang Penyangga Sudut & Balok Kayu Cokelat
    const timberMat = new THREE.MeshLambertMaterial({ color: "#543724" });
    [-5.9, 5.9].forEach(tx => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.38, 5.0, 0.38), timberMat);
      post.position.set(tx, 2.5, 3.45);
      houseGroup.add(post);
    });

    // Pintu Utama Kayu (Terkunci Awalnya)
    const doorMat = new THREE.MeshLambertMaterial({ color: "#6e472a" });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.8), doorMat);
    door.position.set(0, 1.4, 3.53);
    houseGroup.add(door);
    this.doorMesh = door;

    // Handle Kunci Kuningan di Pintu
    const knobMat = new THREE.MeshLambertMaterial({ color: "#f6c445" });
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), knobMat);
    knob.position.set(0.65, 1.35, 3.57);
    houseGroup.add(knob);

    // Jendela Kiri & Kanan dengan Kaca Hangat
    const winMat = new THREE.MeshLambertMaterial({ color: "#ffeaa7" });
    this.houseWindows.push(winMat);
    [-3.8, 3.8].forEach(wx => {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.6), winMat);
      win.position.set(wx, 2.4, 3.53);
      houseGroup.add(win);

      // Bingkai jendela
      const fH = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.1, 0.08), timberMat);
      fH.position.set(wx, 2.4, 3.56);
      houseGroup.add(fH);
      const fV = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.7, 0.08), timberMat);
      fV.position.set(wx, 2.4, 3.56);
      houseGroup.add(fV);
    });

    // Atap Pelana Tradisional dengan Overhanging Eaves (Genteng Gelap)
    const roofMat = new THREE.MeshLambertMaterial({ color: "#2d3436" });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(9.6, 3.6, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.22, 1, 0.88);
    roof.position.set(0, 6.2, 0);
    roof.castShadow = true;
    houseGroup.add(roof);

    // Cerobong Asap Batu
    const chimneyMat = new THREE.MeshLambertMaterial({ color: "#5c5042" });
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.4, 0.9), chimneyMat);
    chimney.position.set(4.5, 6.6, -1.0);
    chimney.castShadow = true;
    houseGroup.add(chimney);

    // Lampu Teras di Samping Kiri & Kanan Pintu
    this.createLampPost(-1.6, -10.35, 1.2, true);
    this.createLampPost(1.6, -10.35, 1.2, true);

    this.exteriorGroup.add(houseGroup);

    // Collider Rumah & Dinding Teras (Hanya tangga yang bisa dilewati)
    // Tembok Rumah Utama
    this.exteriorColliders.push({ minX: -6.5, maxX: 6.5, minZ: -18.0, maxZ: -10.2 });

    // Dinding Samping Teras
    this.exteriorColliders.push({ minX: -9.5, maxX: -8.7, minZ: -18.5, maxZ: -8.0 });
    this.exteriorColliders.push({ minX: 8.7, maxX: 9.5, minZ: -18.5, maxZ: -8.0 });

    // Dinding Depan Teras (Kiri & Kanan Tangga)
    this.exteriorColliders.push({ minX: -9.2, maxX: -3.0, minZ: -8.4, maxZ: -7.6 });
    this.exteriorColliders.push({ minX: 3.0, maxX: 9.2, minZ: -8.4, maxZ: -7.6 });
  }

  // --- 3. ALIRAN SUNGAI & JEMBATAN KAYU (SEBELAH KIRI - PERSIS VIDEO) ---
  buildRiverAndBridge() {
    const tg = window.textureGen;
    const riverGroup = new THREE.Group();

    // A. Badan Air Sungai Mengalir Jernih (X: -14.0 ke -9.5, Z: -20 ke 14, Y = -0.42)
    // Permukaan air diturunkan agar terdapat celah udara nyata (0.64 unit) di bawah jembatan
    const waterMat = new THREE.MeshLambertMaterial({
      map: tg.getRiverWaterTexture(),
      transparent: true,
      opacity: 0.88
    });
    waterMat.map.repeat.set(1, 8);

    const water = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 34), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(-11.75, -0.42, -3.0);
    water.receiveShadow = true;
    riverGroup.add(water);
    this.waterMesh = water;

    // Dasar Palung Sungai (Riverbed)
    const bedMat = new THREE.MeshLambertMaterial({ color: "#2b261f" });
    const riverBed = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 34), bedMat);
    riverBed.rotation.x = -Math.PI / 2;
    riverBed.position.set(-11.75, -0.85, -3.0);
    riverBed.receiveShadow = true;
    riverGroup.add(riverBed);

    // Dinding Tanggul Tanah & Bebatuan di Sepanjang Tepi Sungai
    const embankmentMat = new THREE.MeshLambertMaterial({ map: tg.getSoilCutawayTexture() });
    embankmentMat.map.repeat.set(12, 1);

    // Tanggul Kiri (X = -14.0)
    const embLeft = new THREE.Mesh(new THREE.PlaneGeometry(34, 0.85), embankmentMat);
    embLeft.rotation.y = Math.PI / 2;
    embLeft.position.set(-14.0, -0.42, -3.0);
    riverGroup.add(embLeft);

    // Tanggul Kanan (X = -9.5)
    const embRight = new THREE.Mesh(new THREE.PlaneGeometry(34, 0.85), embankmentMat);
    embRight.rotation.y = -Math.PI / 2;
    embRight.position.set(-9.5, -0.42, -3.0);
    riverGroup.add(embRight);

    // Bebatuan Alami yang Rapi di Tepi Sungai
    const rockMat = new THREE.MeshLambertMaterial({ color: "#7a7265" });
    for (let z = -18; z <= 12; z += 2.5) {
      [-14.2, -9.3].forEach((rx, idx) => {
        const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32 + (Math.abs(z) % 3) * 0.08, 0), rockMat);
        rk.position.set(rx, -0.1, z + (idx * 0.4));
        rk.castShadow = true;
        riverGroup.add(rk);
      });
    }

    // B. Jembatan Kayu Kokoh & Lebih Lebar (Z: -0.5 ke 3.5, Lebar = 4.0 Unit, Y = 0.22)
    const bridgeGroup = new THREE.Group();

    // Lantai Papan Jembatan Kayu (X: -14.6 ke -8.8, Lebar Z = 4.0)
    const bridgeWoodMat = new THREE.MeshLambertMaterial({ map: tg.getBridgeWoodTexture() });
    bridgeWoodMat.map.repeat.set(4, 2);
    const bridgeFloor = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 4.0), bridgeWoodMat);
    bridgeFloor.rotation.x = -Math.PI / 2;
    bridgeFloor.position.set(-11.7, 0.22, 1.5);
    bridgeFloor.receiveShadow = true;
    bridgeFloor.castShadow = true;
    bridgeGroup.add(bridgeFloor);

    // Balok Penyangga Kayu Kokoh di Bawah Jembatan (Air gap terlihat jelas di atas air)
    const beamMat = new THREE.MeshLambertMaterial({ color: "#4a2e1b" });
    [-0.4, 3.4].forEach(bz => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.28, 0.22), beamMat);
      beam.position.set(-11.7, 0.05, bz);
      beam.castShadow = true;
      bridgeGroup.add(beam);
    });

    // Tiang Pancang Penyangga ke Dasar Sungai
    [-13.5, -9.9].forEach(px => {
      [-0.4, 3.4].forEach(pz => {
        const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.0), beamMat);
        pylon.position.set(px, -0.35, pz);
        bridgeGroup.add(pylon);
      });
    });

    // Pagar Pembatas Kayu Jembatan (Railing di Sisi Utara Z = -0.5 & Selatan Z = 3.5)
    [-0.5, 3.5].forEach(rz => {
      // 4 Tiang pagar tegak
      [-14.5, -12.6, -10.8, -8.9].forEach(px => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.0, 0.18), beamMat);
        post.position.set(px, 0.72, rz);
        post.castShadow = true;
        bridgeGroup.add(post);
      });

      // Palang horizontal atas & tengah
      const railTop = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.12, 0.1), beamMat);
      railTop.position.set(-11.7, 1.05, rz);
      bridgeGroup.add(railTop);

      const railMid = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.08, 0.08), beamMat);
      railMid.position.set(-11.7, 0.65, rz);
      bridgeGroup.add(railMid);
    });

    riverGroup.add(bridgeGroup);
    this.exteriorGroup.add(riverGroup);

    // COLLIDER SUNGAI & PAGAR JEMBATAN (Anti Tembus Air & Anti Jatuh)
    // 1. Sungai Bagian Utara (Z: -20.5 ke -0.5) - Impassable
    this.exteriorColliders.push({ minX: -14.2, maxX: -9.3, minZ: -20.5, maxZ: -0.5 });

    // 2. Sungai Bagian Selatan (Z: 3.5 ke 14.5) - Impassable
    this.exteriorColliders.push({ minX: -14.2, maxX: -9.3, minZ: 3.5, maxZ: 14.5 });

    // 3. Pagar Sisi Utara Jembatan (Z: -0.7 ke -0.3, X: -14.6 ke -8.8)
    this.exteriorColliders.push({ minX: -14.6, maxX: -8.8, minZ: -0.7, maxZ: -0.3 });

    // 4. Pagar Sisi Selatan Jembatan (Z: 3.3 ke 3.7, X: -14.6 ke -8.8)
    this.exteriorColliders.push({ minX: -14.6, maxX: -8.8, minZ: 3.3, maxZ: 3.7 });
  }

  // --- 4. PELATARAN KAYU MAIN & FOTO (ARCADE & PHOTOBOOTH - SEBELAH KANAN) ---
  buildArcadeAndPhotoboothDeck() {
    const tg = window.textureGen;
    const deckGroup = new THREE.Group();

    // A. Lantai Papan Kayu Deck Lebih Luas (X: 7.5 ke 17.5, Z: -3.5 ke 4.5, Y = 0.06)
    const deckMat = new THREE.MeshLambertMaterial({ map: tg.getWoodDeckTexture() });
    deckMat.map.repeat.set(3, 2);

    const deckFloor = new THREE.Mesh(new THREE.PlaneGeometry(10.0, 8.0), deckMat);
    deckFloor.rotation.x = -Math.PI / 2;
    deckFloor.position.set(12.5, 0.06, 0.5);
    deckFloor.receiveShadow = true;
    deckGroup.add(deckFloor);

    // List Pinggir Kayu Deck
    const trimMat = new THREE.MeshLambertMaterial({ color: "#543724" });
    const trimFront = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.15, 0.15), trimMat);
    trimFront.position.set(12.5, 0.08, 4.5);
    deckGroup.add(trimFront);

    // B. Papan Petunjuk Kayu "MAIN & FOTO" di Depan Pintu Masuk Pelataran
    const signGroup = new THREE.Group();
    const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4), trimMat);
    signPost.position.set(7.8, 0.7, 3.8);
    signPost.castShadow = true;
    signGroup.add(signPost);

    const signBoardMat = new THREE.MeshLambertMaterial({ map: tg.getSignboardTexture("MAIN & FOTO") });
    const signBoard = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.6), signBoardMat);
    signBoard.position.set(7.8, 1.15, 3.8);
    signBoard.castShadow = true;
    signGroup.add(signBoard);
    deckGroup.add(signGroup);

    // C. Mesin Arcade Retro dengan Tenda Kanopi Belang Hijau-Putih (Di Sisi Kiri Deck: X = 9.5, Z = -1.5)
    const arcadeGroup = new THREE.Group();
    arcadeGroup.position.set(9.5, 0, -1.5);

    // Kabinet Mesin Warna Maroon Tua
    const cabMat = new THREE.MeshLambertMaterial({ color: "#6b2d35" });
    const cabBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.5, 1.2), cabMat);
    cabBase.position.set(0, 1.25, 0);
    cabBase.castShadow = true;
    arcadeGroup.add(cabBase);

    // Marquee HEYTML PLAY
    const marqMat = new THREE.MeshLambertMaterial({ map: tg.getArcadeMarqueeTexture() });
    const marquee = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.4), marqMat);
    marquee.position.set(0, 2.2, 0.61);
    arcadeGroup.add(marquee);

    // Layar Tetris
    const scrMat = new THREE.MeshLambertMaterial({ map: tg.getArcadeScreenTexture() });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.95), scrMat);
    screen.position.set(0, 1.45, 0.61);
    arcadeGroup.add(screen);

    // Meja Tombol Joystick
    const ctrlMat = new THREE.MeshLambertMaterial({ color: "#222222" });
    const ctrlPanel = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.15, 0.45), ctrlMat);
    ctrlPanel.position.set(0, 0.85, 0.7);
    arcadeGroup.add(ctrlPanel);

    // Tenda Kanopi Belang Hijau-Putih di Atas Arcade
    const awningMat = new THREE.MeshLambertMaterial({ map: tg.getAwningTexture() });
    awningMat.map.repeat.set(4, 1);
    const awning = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.2), awningMat);
    awning.rotation.x = Math.PI / 3;
    awning.position.set(0, 2.8, 0.4);
    awning.castShadow = true;
    arcadeGroup.add(awning);

    // Tiang Penyangga Kanopi
    const poleMat = new THREE.MeshLambertMaterial({ color: "#ffffff" });
    [-0.95, 0.95].forEach(px => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.9), poleMat);
      pole.position.set(px, 1.45, 0.85);
      arcadeGroup.add(pole);
    });

    deckGroup.add(arcadeGroup);
    this.arcadeMesh = arcadeGroup;

    // D. Bilik Photobooth Studio Terpisah Rapi (Di Sisi Kanan Deck: X = 14.5, Z = -1.2)
    const photoGroup = new THREE.Group();
    photoGroup.position.set(14.5, 0, -1.2);

    // Backdrop Kanvas Putih Studio
    const bdMat = new THREE.MeshLambertMaterial({ color: "#f8f9fa" });
    const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.6), bdMat);
    backdrop.position.set(0, 1.35, -0.4);
    backdrop.castShadow = true;
    photoGroup.add(backdrop);

    // Frame Tiang Metal Backdrop
    const metalMat = new THREE.MeshLambertMaterial({ color: "#1a1a1a" });
    [-1.6, 1.6].forEach(bx => {
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.8), metalMat);
      stand.position.set(bx, 1.4, -0.4);
      photoGroup.add(stand);
    });
    const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.3), metalMat);
    topBar.rotation.z = Math.PI / 2;
    topBar.position.set(0, 2.7, -0.4);
    photoGroup.add(topBar);

    // Lampu Softbox Studio di Samping (Tidak menghalangi pandangan)
    [-1.8, 1.8].forEach(lx => {
      const lampStand = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.0), metalMat);
      lampStand.position.set(lx, 1.0, 0.4);
      photoGroup.add(lampStand);

      const softbox = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.25), metalMat);
      softbox.position.set(lx, 1.9, 0.4);
      photoGroup.add(softbox);

      const lightFace = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.56), new THREE.MeshBasicMaterial({ color: "#fffbe6" }));
      lightFace.rotation.y = lx > 0 ? -Math.PI / 4 : Math.PI / 4;
      lightFace.position.set(lx > 0 ? lx - 0.1 : lx + 0.1, 1.9, 0.5);
      photoGroup.add(lightFace);
    });

    // Kamera Vintage di Atas Tripod di Depan Backdrop (X = 14.5, Z = 1.8)
    const tripod = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.1, 3), metalMat);
    tripod.position.set(0, 0.55, 3.0);
    photoGroup.add(tripod);

    const cameraBody = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.3), metalMat);
    cameraBody.position.set(0, 1.15, 3.0);
    photoGroup.add(cameraBody);

    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.15), metalMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, 1.15, 2.8);
    photoGroup.add(lens);

    deckGroup.add(photoGroup);
    this.photoboothMesh = photoGroup;

    this.exteriorGroup.add(deckGroup);

    // Collider Pelataran Main & Foto (Clearance luas untuk jalan dan foto)
    // Arcade Machine Box Collider
    this.exteriorColliders.push({ minX: 8.6, maxX: 10.4, minZ: -2.2, maxZ: -0.8 });

    // Photobooth Backdrop & Lights Collider
    this.exteriorColliders.push({ minX: 12.4, maxX: 16.6, minZ: -1.8, maxZ: -0.5 });
    this.exteriorColliders.push({ minX: 14.1, maxX: 14.9, minZ: 1.5, maxZ: 2.1 }); // Tripod Kamera
    this.exteriorColliders.push({ minX: 7.5, maxX: 8.2, minZ: 3.5, maxZ: 4.1 });   // Papan Nama
  }

  // --- 5. PELATARAN DEPAN, PETI SURAT & LAMPU JALAN (PERSIS VIDEO) ---
  buildCourtyardAndProps() {
    const tg = window.textureGen;
    const courtGroup = new THREE.Group();

    // A. Pelataran & Jalur Setapak Paving Batu (Membentang dari Tangga ke Taman Depan & Cabang)
    const stoneMat = new THREE.MeshLambertMaterial({ map: tg.getStonePathTexture() });
    stoneMat.map.repeat.set(3, 4);

    // 1. Jalur Utama Tengah (Z: -4.0 ke 7.5, Lebar X: 7.0)
    const courtPaving = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 11.5), stoneMat);
    courtPaving.rotation.x = -Math.PI / 2;
    courtPaving.position.set(0, 0.04, 1.75);
    courtPaving.receiveShadow = true;
    courtGroup.add(courtPaving);

    // 2. Jalur Cabang ke Arah Jembatan Kayu di Sebelah Barat (X: -8.8 ke -3.5, Z: 0.0 ke 3.0)
    const bridgePathMat = new THREE.MeshLambertMaterial({ map: tg.getStonePathTexture() });
    bridgePathMat.map.repeat.set(2, 1);
    const bridgePath = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 3.0), bridgePathMat);
    bridgePath.rotation.x = -Math.PI / 2;
    bridgePath.position.set(-6.25, 0.04, 1.5);
    bridgePath.receiveShadow = true;
    courtGroup.add(bridgePath);

    // 3. Jalur Cabang ke Arah Pelataran Kayu Deck di Sebelah Timur (X: 3.5 ke 7.5, Z: 0.0 ke 3.0)
    const deckPath = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 3.0), bridgePathMat);
    deckPath.rotation.x = -Math.PI / 2;
    deckPath.position.set(5.5, 0.04, 1.5);
    deckPath.receiveShadow = true;
    courtGroup.add(deckPath);

    // B. Peti Kayu Pelataran dengan Surat Sambutan (Box Sambutan di Taman Depan Bawah: X = 0.5, Z = 5.2)
    const crateMat = new THREE.MeshLambertMaterial({ map: tg.getCrateLetterTexture() });
    const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 1.0), crateMat);
    crate.position.set(0.5, 0.45, 5.2);
    crate.castShadow = true;
    crate.receiveShadow = true;
    courtGroup.add(crate);
    this.crateMesh = crate;

    // C. Papan Kayu Petunjuk di Samping Peti Sambutan
    const postMat = new THREE.MeshLambertMaterial({ color: "#4a2e1b" });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2), postMat);
    post.position.set(1.6, 0.6, 5.2);
    post.castShadow = true;
    courtGroup.add(post);

    const signMat = new THREE.MeshLambertMaterial({ map: tg.getSignboardTexture("PETUNJUK") });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.5), signMat);
    board.position.set(1.6, 1.0, 5.2);
    board.castShadow = true;
    courtGroup.add(board);

    // D. Bangku Kayu Taman Santai (Di Sudut Barat Daya Lapang)
    const benchGroup = new THREE.Group();
    benchGroup.position.set(-4.8, 0, 4.5);

    const benchMat = new THREE.MeshLambertMaterial({ color: "#543724" });
    const benchSeat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.1, 0.5), benchMat);
    benchSeat.position.set(0, 0.45, 0);
    benchSeat.castShadow = true;
    benchGroup.add(benchSeat);

    const benchBack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.08), benchMat);
    benchBack.position.set(0, 0.75, -0.22);
    benchBack.castShadow = true;
    benchGroup.add(benchBack);

    [-0.75, 0.75].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.45), benchMat);
      leg.position.set(lx, 0.22, 0);
      leg.castShadow = true;
      benchGroup.add(leg);
    });
    courtGroup.add(benchGroup);
    this.exteriorColliders.push({ minX: -5.8, maxX: -3.8, minZ: 4.1, maxZ: 4.9 });

    // E. Lampu Taman Besi Hitam Klasik Berdiri (Sesuai Posisi di Video)
    this.createLampPost(-3.6, 5.5, 0);   // Kiri taman depan
    this.createLampPost(3.6, 5.5, 0);    // Kanan taman depan
    this.createLampPost(-3.6, -3.5, 0);  // Bawah tangga kiri
    this.createLampPost(3.6, -3.5, 0);   // Bawah tangga kanan
    this.createLampPost(-8.5, 1.5, 0);   // Ujung jembatan timur
    this.createLampPost(-14.8, 1.5, 0);  // Ujung jembatan barat
    this.createLampPost(-16.0, -6.5, 0); // Kebun barat dekat kakek
    this.createLampPost(7.2, 4.2, 0);    // Pintu masuk pelataran arcade
    this.createLampPost(17.8, 4.2, 0);   // Sudut tenggara pelataran foto

    this.exteriorGroup.add(courtGroup);

    // Collider Peti Sambutan & Papan Petunjuk
    this.exteriorColliders.push({ minX: -0.2, maxX: 1.2, minZ: 4.6, maxZ: 5.8 });  // Peti Sambutan
    this.exteriorColliders.push({ minX: 1.3, maxX: 2.0, minZ: 4.8, maxZ: 5.6 });   // Papan Petunjuk
  }

  // Tiang Lampu Taman Klasik
  createLampPost(x, z, y = 0, isWallLamp = false) {
    const lampGroup = new THREE.Group();
    const ironMat = new THREE.MeshLambertMaterial({ color: "#1a1a1e" });

    if (!isWallLamp) {
      // Tiang Besi Hitam Berdiri
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.5), ironMat);
      post.position.set(0, 1.25, 0);
      post.castShadow = true;
      lampGroup.add(post);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.3), ironMat);
      base.position.set(0, 0.15, 0);
      lampGroup.add(base);

      // Rumah Lentera Kaca Segi Enam
      const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.15, 0.45, 6), ironMat);
      lantern.position.set(0, 2.45, 0);
      lampGroup.add(lantern);

      // Topi Lentera
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.22, 6), ironMat);
      cap.position.set(0, 2.75, 0);
      lampGroup.add(cap);

      // Kaca Kuning Menyala
      const glassMat = new THREE.MeshLambertMaterial({
        color: "#ffd166",
        emissive: 0xffb703,
        emissiveIntensity: 0.7
      });
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.35, 6), glassMat);
      glass.position.set(0, 2.45, 0);
      lampGroup.add(glass);

      // Cahaya PointLight Hangat
      const light = new THREE.PointLight("#ffbe0b", 1.2, 7.5, 2);
      light.position.set(0, 2.45, 0);
      lampGroup.add(light);

      lampGroup.position.set(x, y, z);
      this.exteriorGroup.add(lampGroup);

      this.lamps.push({ light: light, mesh: glass });
      this.exteriorColliders.push({ minX: x - 0.35, maxX: x + 0.35, minZ: z - 0.35, maxZ: z + 0.35 });
    } else {
      // Lampu Dinding
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.4), ironMat);
      arm.position.set(0, 0, 0.2);
      lampGroup.add(arm);

      const glassMat = new THREE.MeshLambertMaterial({ color: "#ffd166", emissive: 0xffb703, emissiveIntensity: 0.8 });
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.25), glassMat);
      glass.position.set(0, -0.1, 0.38);
      lampGroup.add(glass);

      const light = new THREE.PointLight("#ffbe0b", 1.4, 6.0, 2);
      light.position.set(0, -0.1, 0.42);
      lampGroup.add(light);

      lampGroup.position.set(x, y + 2.0, z);
      this.exteriorGroup.add(lampGroup);
      this.lamps.push({ light: light, mesh: glass });
    }
  }

  // --- 6. PEPONAN TINGGI, CEMARA & SEMAK BUNGA ---
  buildTreesAndFoliage() {
    // A. Pohon Daun Rimbun Menjulang Tinggi (9-12 Unit)
    // Diposisikan rapi di tepi perimeter dan luar pelataran agar tidak menghalangi photobooth & arcade
    const treePositions = [
      [-17.5, 6.0, 1.25],   // Kiri depan kebun barat
      [-18.0, -13.0, 1.3],  // Kiri belakang kebun barat
      [-15.5, -3.0, 1.15],  // Kiri sungai barat
      [-5.5, -16.5, 1.35],  // Belakang rumah kiri
      [5.5, -16.5, 1.35],   // Belakang rumah kanan
      [19.5, -8.0, 1.25],   // Kanan belakang luar deck
      [19.5, 6.0, 1.2],     // Kanan depan luar deck
      [19.5, -0.5, 1.2]     // Sebelah timur di luar pelataran deck (tidak menutupi photobooth)
    ];

    treePositions.forEach(([tx, tz, sc]) => {
      this.createVolumetricTree(tx, tz, sc);
    });

    // B. Pohon Cemara Menjulang di Area Alami Sekitar Halaman (Persis Video)
    this.createPineTree(6.0, -5.0, 1.25);   // Utara pelataran arcade
    this.createPineTree(18.5, -3.5, 1.25);  // Di luar sisi timur pelataran
    this.createPineTree(-17.0, 1.0, 1.15);  // Kebun barat dekat jembatan

    // C. Batu Pijakan Taman (Stepping Stones) di Halaman Rumput
    const stoneMat = new THREE.MeshLambertMaterial({ color: "#8d99ae" });
    const steppingStones = [
      [-1.8, 6.2], [-2.6, 7.5], [-3.8, 8.2],
      [1.8, 6.2], [2.6, 7.5], [3.8, 8.2],
      [-5.5, 3.2], [-6.2, 4.0], [-7.0, 4.8],
      [4.8, 3.2], [5.8, 4.0], [6.5, 5.0]
    ];
    steppingStones.forEach(([sx, sz]) => {
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 0.08, 7), stoneMat);
      stone.position.set(sx, 0.04, sz);
      stone.receiveShadow = true;
      this.exteriorGroup.add(stone);
    });

    // D. Rumpun Semak & Bunga Warna-Warni (Daisies & Lavender) Mengisi Area Lapang
    const bushMat = new THREE.MeshLambertMaterial({ color: "#3a6829" });
    const flowerMatWhite = new THREE.MeshLambertMaterial({ color: "#ffffff" });
    const flowerMatYellow = new THREE.MeshLambertMaterial({ color: "#ffb703" });
    const flowerMatPurple = new THREE.MeshLambertMaterial({ color: "#b5179e" });

    const flowerSpots = [
      // Sepanjang jalan tangga teras
      [-3.2, -2.5], [-3.2, 0.5], [-3.2, 3.5],
      [3.2, -2.5], [3.2, 0.5], [3.2, 3.5],
      // Sekitar peti sambutan dan taman depan
      [-1.5, 5.0], [2.4, 5.0], [-0.5, 6.8], [1.2, 6.8],
      // Menuju jembatan
      [-5.2, 0.2], [-6.8, 0.2], [-5.2, 2.8], [-7.5, 2.8],
      // Tepi kebun barat
      [-15.0, 4.0], [-17.0, 4.0], [-15.0, -1.0], [-17.0, -8.0],
      // Tepi pelataran arcade & photobooth
      [6.8, -1.5], [6.8, 2.0], [8.0, 5.0], [10.5, 5.0], [14.0, 5.0], [17.0, 5.0]
    ];

    flowerSpots.forEach(([bx, bz], idx) => {
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.35, 6, 6), bushMat);
      bush.scale.set(1.2, 0.65, 1.0);
      bush.position.set(bx, 0.2, bz);
      bush.castShadow = true;
      this.exteriorGroup.add(bush);

      const fMat = (idx % 3 === 0) ? flowerMatWhite : ((idx % 3 === 1) ? flowerMatYellow : flowerMatPurple);
      for (let i = 0; i < 4; i++) {
        const fl = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), fMat);
        fl.position.set(bx + (Math.random() - 0.5) * 0.45, 0.42, bz + (Math.random() - 0.5) * 0.45);
        this.exteriorGroup.add(fl);
      }
    });
  }

  // Pohon Daun Rimbun Menjulang Tinggi
  createVolumetricTree(x, z, scale = 1.0) {
    const tg = window.textureGen;
    const treeGroup = new THREE.Group();

    // Batang Kayu Tinggi (Tinggi 6.5 x scale)
    const trunkHeight = 6.8 * scale;
    const trunkMat = new THREE.MeshLambertMaterial({ map: tg.getBarkTexture() });
    trunkMat.map.repeat.set(1, 2);

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42 * scale, 0.58 * scale, trunkHeight, 10),
      trunkMat
    );
    trunk.position.set(0, trunkHeight / 2, 0);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    treeGroup.add(trunk);

    // 4 Lapisan Kanopi Dedaunan Hijau Rimbun Bertingkat
    const foliageGroup = new THREE.Group();
    const leafColors = ["#386524", "#4a8533", "#2d541c", "#5a963e"];
    const canopyLayers = [
      { y: trunkHeight * 0.72, r: 2.8 * scale, c: leafColors[0] },
      { y: trunkHeight * 0.95, r: 2.4 * scale, c: leafColors[1] },
      { y: trunkHeight * 1.15, r: 1.8 * scale, c: leafColors[2] },
      { y: trunkHeight * 1.32, r: 1.1 * scale, c: leafColors[3] }
    ];

    canopyLayers.forEach(layer => {
      const mat = new THREE.MeshLambertMaterial({ color: layer.c });
      const sphere = new THREE.Mesh(new THREE.DodecahedronGeometry(layer.r, 1), mat);
      sphere.scale.set(1.1, 0.82, 1.05);
      sphere.position.set(0, layer.y, 0);
      sphere.castShadow = true;
      foliageGroup.add(sphere);
    });

    treeGroup.add(foliageGroup);
    treeGroup.position.set(x, 0, z);
    this.exteriorGroup.add(treeGroup);

    // Animasi Goyangan Angin Lembut
    this.animatedMeshes.push({
      mesh: foliageGroup,
      phase: Math.random() * Math.PI * 2,
      speed: 1.5
    });

    // Collider Batang Pohon
    this.exteriorColliders.push({
      minX: x - 0.65 * scale,
      maxX: x + 0.65 * scale,
      minZ: z - 0.65 * scale,
      maxZ: z + 0.65 * scale
    });
  }

  // Pohon Cemara (Pine Tree)
  createPineTree(x, z, scale = 1.0) {
    const tg = window.textureGen;
    const pineGroup = new THREE.Group();

    // Batang
    const trunkHeight = 4.5 * scale;
    const trunkMat = new THREE.MeshLambertMaterial({ map: tg.getBarkTexture() });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * scale, 0.4 * scale, trunkHeight, 8), trunkMat);
    trunk.position.set(0, trunkHeight / 2, 0);
    trunk.castShadow = true;
    pineGroup.add(trunk);

    // 4 Kerucut Daun Jarum Bertingkat
    const pineMat = new THREE.MeshLambertMaterial({ map: tg.getPineNeedlesTexture() });
    const tiers = [
      { y: trunkHeight * 0.55, r: 2.2 * scale, h: 2.4 * scale },
      { y: trunkHeight * 0.85, r: 1.7 * scale, h: 2.2 * scale },
      { y: trunkHeight * 1.15, r: 1.2 * scale, h: 1.9 * scale },
      { y: trunkHeight * 1.45, r: 0.65 * scale, h: 1.5 * scale }
    ];

    tiers.forEach(tier => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(tier.r, tier.h, 7), pineMat);
      cone.position.set(0, tier.y, 0);
      cone.castShadow = true;
      pineGroup.add(cone);
    });

    pineGroup.position.set(x, 0, z);
    this.exteriorGroup.add(pineGroup);

    this.exteriorColliders.push({
      minX: x - 0.5 * scale,
      maxX: x + 0.5 * scale,
      minZ: z - 0.5 * scale,
      maxZ: z + 0.5 * scale
    });
  }

  // --- 7. RUANG INTERIOR RUMAH 3D COZY (LENGKAP DENGAN PERAPIAN & KADO) ---
  buildInteriorRoom() {
    const tg = window.textureGen;
    const room = this.interiorGroup;
    const ox = 100, oz = 100;

    // A. Lantai Parquet Kayu Hangat (14 x 10 unit)
    const floorMat = new THREE.MeshLambertMaterial({ map: tg.getWoodFloorTexture() });
    floorMat.map.repeat.set(4, 3);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(ox, 0, oz);
    floor.receiveShadow = true;
    room.add(floor);

    // B. Karpet Ruang Tamu Retro di Tengah
    const rugMat = new THREE.MeshLambertMaterial({ map: tg.getInteriorRugTexture() });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(6.5, 4.5), rugMat);
    rug.rotation.x = -Math.PI / 2;
    rug.position.set(ox, 0.02, oz - 0.2);
    rug.receiveShadow = true;
    room.add(rug);

    // C. Dinding Interior Krem Hangat
    const wallMat = new THREE.MeshLambertMaterial({ map: tg.getInteriorWallTexture() });
    wallMat.map.repeat.set(4, 1);

    // Dinding Utara (Belakang)
    const wallN = new THREE.Mesh(new THREE.PlaneGeometry(14, 4.5), wallMat);
    wallN.position.set(ox, 2.25, oz - 5.0);
    room.add(wallN);

    // Dinding Barat (Kiri)
    const wallW = new THREE.Mesh(new THREE.PlaneGeometry(10, 4.5), wallMat);
    wallW.rotation.y = Math.PI / 2;
    wallW.position.set(ox - 7.0, 2.25, oz);
    room.add(wallW);

    // Dinding Timur (Kanan)
    const wallE = new THREE.Mesh(new THREE.PlaneGeometry(10, 4.5), wallMat);
    wallE.rotation.y = -Math.PI / 2;
    wallE.position.set(ox + 7.0, 2.25, oz);
    room.add(wallE);

    // Dinding Selatan (Depan) dengan Celah Pintu Keluar
    const wallSLeft = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 4.5), wallMat);
    wallSLeft.position.set(ox - 4.1, 2.25, oz + 5.0);
    room.add(wallSLeft);

    const wallSRight = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 4.5), wallMat);
    wallSRight.position.set(ox + 4.1, 2.25, oz + 5.0);
    room.add(wallSRight);

    // D. Keset Pintu Keluar Interior (Doormat)
    const matMat = new THREE.MeshLambertMaterial({ color: "#543724" });
    const doormat = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.2), matMat);
    doormat.rotation.x = -Math.PI / 2;
    doormat.position.set(ox, 0.03, oz + 4.2);
    room.add(doormat);

    // E. Perapian Batu Alam dengan Api Menyala & Cahaya Berkedip
    const fireplace = new THREE.Group();
    fireplace.position.set(ox, 0, oz - 4.6);

    const stoneChimney = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.6, 0.9), new THREE.MeshLambertMaterial({ color: "#6c757d" }));
    stoneChimney.position.set(0, 1.8, 0);
    fireplace.add(stoneChimney);

    const fireHole = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.2, 0.6), new THREE.MeshBasicMaterial({ color: "#111111" }));
    fireHole.position.set(0, 0.8, 0.2);
    fireplace.add(fireHole);

    // Bara api kuning-oranye
    const fireFlames = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.7, 5), new THREE.MeshBasicMaterial({ color: "#ff6b35" }));
    fireFlames.position.set(0, 0.65, 0.2);
    fireplace.add(fireFlames);

    // Cahaya Hangat Berkedip (Fireplace PointLight)
    this.interiorFireLight = new THREE.PointLight("#ff9233", 2.2, 10, 2);
    this.interiorFireLight.position.set(0, 0.9, 0.5);
    fireplace.add(this.interiorFireLight);
    room.add(fireplace);

    // F. Sofa Santai Ruang Tamu
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(ox - 4.2, 0, oz);
    sofaGroup.rotation.y = Math.PI / 2;

    const sofaMat = new THREE.MeshLambertMaterial({ color: "#2b4c3f" });
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.5, 1.2), sofaMat);
    sofaBase.position.set(0, 0.35, 0);
    sofaGroup.add(sofaBase);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.9, 0.4), sofaMat);
    sofaBack.position.set(0, 0.8, -0.4);
    sofaGroup.add(sofaBack);
    room.add(sofaGroup);

    // G. Meja Belajar dengan Kado & Surat Spesial untuk Keyzha
    const deskGroup = new THREE.Group();
    deskGroup.position.set(ox + 4.2, 0, oz - 2.0);

    const deskMat = new THREE.MeshLambertMaterial({ color: "#543724" });
    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 1.3), deskMat);
    deskTop.position.set(0, 0.95, 0);
    deskGroup.add(deskTop);

    [-1.0, 1.0].forEach(lx => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.95, 1.1), deskMat);
      leg.position.set(lx, 0.48, 0);
      deskGroup.add(leg);
    });

    // Kotak Kado Spesial Cantik dengan Pita Emas
    const giftBoxMat = new THREE.MeshLambertMaterial({ color: "#d62828" });
    const giftBox = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.45), giftBoxMat);
    giftBox.position.set(-0.4, 1.22, 0);
    deskGroup.add(giftBox);

    const ribbonMat = new THREE.MeshLambertMaterial({ color: "#ffd166" });
    const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.42, 0.12), ribbonMat);
    ribbon.position.set(-0.4, 1.22, 0);
    deskGroup.add(ribbon);

    // Lampu Meja Belajar
    const lampDesk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 0.3, 8), new THREE.MeshLambertMaterial({ color: "#ffd166" }));
    lampDesk.position.set(0.6, 1.25, 0);
    deskGroup.add(lampDesk);

    const deskLight = new THREE.PointLight("#ffd166", 1.4, 5.0, 2);
    deskLight.position.set(0.6, 1.35, 0);
    deskGroup.add(deskLight);

    room.add(deskGroup);

    // H. Rak Buku Kayu di Dinding Timur
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(ox + 6.4, 0, oz + 1.5);
    shelfGroup.rotation.y = -Math.PI / 2;

    const shelfBody = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.2, 0.6), deskMat);
    shelfBody.position.set(0, 1.6, 0);
    shelfGroup.add(shelfBody);
    room.add(shelfGroup);

    // Collider Interior
    this.interiorColliders.push({ minX: ox - 7.5, maxX: ox + 7.5, minZ: oz - 5.5, maxZ: oz - 4.8 }); // Utara
    this.interiorColliders.push({ minX: ox - 7.5, maxX: ox - 6.7, minZ: oz - 5.0, maxZ: oz + 5.0 }); // Barat
    this.interiorColliders.push({ minX: ox + 6.7, maxX: ox + 7.5, minZ: oz - 5.0, maxZ: oz + 5.0 }); // Timur
    this.interiorColliders.push({ minX: ox - 7.5, maxX: ox - 1.2, minZ: oz + 4.8, maxZ: oz + 5.5 }); // Selatan Kiri
    this.interiorColliders.push({ minX: ox + 1.2, maxX: ox + 7.5, minZ: oz + 4.8, maxZ: oz + 5.5 }); // Selatan Kanan
    this.interiorColliders.push({ minX: ox - 2.0, maxX: ox + 2.0, minZ: oz - 5.0, maxZ: oz - 3.8 }); // Perapian
    this.interiorColliders.push({ minX: ox - 5.2, maxX: ox - 3.0, minZ: oz - 1.2, maxZ: oz + 1.2 }); // Sofa
    this.interiorColliders.push({ minX: ox + 2.8, maxX: ox + 5.6, minZ: oz - 2.8, maxZ: oz - 1.2 }); // Meja Belajar
  }

  // --- TRANSISI MASUK & KELUAR RUMAH ---
  enterHouse(player) {
    this.currentZone = "interior";
    this.colliders = this.interiorColliders;

    // Posisi pemain tepat di depan keset pintu interior
    player.x = 100;
    player.y = 0;
    player.z = 103.5;
    player.direction = "up";

    const warmBg = new THREE.Color("#16101c");
    this.scene.background = warmBg;
    this.scene.fog.color = warmBg;
    this.scene.fog.near = 10;
    this.scene.fog.far = 35;
  }

  exitHouse(player) {
    this.currentZone = "exterior";
    this.colliders = this.exteriorColliders;

    // Posisi pemain di depan pintu rumah luar di atas teras
    player.x = 0;
    player.y = 1.2;
    player.z = -9.2;
    player.direction = "down";

    this.setTimeOfDay(this.timeOfDay);
  }

  // --- UPDATE ANIMASI & KAMERA LINGKUNGAN ---
  updateEnvironment(delta, time) {
    // 1. Goyangan Angin Pohon
    this.animatedMeshes.forEach(item => {
      item.mesh.rotation.z = Math.sin(time * item.speed + item.phase) * 0.035;
    });

    // 2. Aliran Air Sungai
    if (this.waterMesh && this.waterMesh.material.map) {
      this.waterMesh.material.map.offset.y = (time * 0.22) % 1;
    }

    // 3. Kelap-kelip Perapian Interior
    if (this.interiorFireLight && this.currentZone === "interior") {
      this.interiorFireLight.intensity = 2.0 + Math.sin(time * 12) * 0.4 + (Math.random() - 0.5) * 0.2;
    }
  }

  // --- FOLLOW CAMERA HD-2D DIORAMA (POV AGAK RENDAH / MENDATAR - PERSIS VIDEO) ---
  updateCamera(playerX, playerY, playerZ) {
    if (this.currentZone === "interior") {
      // Sudut pandang nyaman di dalam ruang tamu
      const targetCamX = playerX * 0.5 + 50;
      const targetCamY = playerY + 6.8;
      const targetCamZ = playerZ + 6.5;

      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.08;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 0.08;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.08;

      this.camera.lookAt(playerX, playerY + 1.1, playerZ - 0.6);
    } else {
      // Sudut pandang Follow Camera HD-2D Diorama (POV agak lebih rendah / lebih mendatar ke depan-bawah)
      // Jarak dan elevasi seimbang, pitch ~37 derajat, lerp halus 0.07, tanpa menampakkan void/layar biru
      const targetCamX = playerX;
      const targetCamY = playerY + 6.2;
      const targetCamZ = playerZ + 8.2;

      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.07;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 0.07;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.07;

      this.camera.lookAt(playerX, playerY + 1.2, playerZ - 1.5);
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
}

window.DioramaWorld = DioramaWorld;
