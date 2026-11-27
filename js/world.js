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

    // 3. WebGL Renderer (Optimasi Smooth 60 FPS)
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      alpha: false
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.container.appendChild(this.renderer.domElement);

    // 4. Bangun Dunia & Lingkungan
    this.setupLighting();
    this.buildDioramaPlatform();
    this.buildHouseAndStairs();
    this.buildRiverAndBridge();
    this.buildArcadeAndPhotoboothDeck();
    this.buildCampfireZone();
    this.buildCourtyardAndProps();
    this.buildVillageInteractiveProps();
    this.buildGardenGazebo();
    this.buildTreesAndFoliage();
    this.buildInteriorRoom();

    window.addEventListener("resize", () => this.onResize());
  }

  // --- SISTEM PENCAHAYAAN (LIGHTING & SHADOWS EFISIEN) ---
  setupLighting() {
    this.ambientLight = new THREE.AmbientLight("#eaf4ec", 0.75);
    this.scene.add(this.ambientLight);

    this.hemiLight = new THREE.HemisphereLight("#f0fbf4", "#4a6338", 0.35);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight("#fff7ea", 1.28);
    this.dirLight.position.set(18, 32, 16);
    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
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
      this.lamps.forEach(l => {
        if (l.light) l.light.intensity = 0.05;
        if (l.mesh && l.mesh.material) l.mesh.material.emissiveIntensity = 0.3;
      });
      this.houseWindows.forEach(m => m.emissive.setHex(0x000000));
    } else if (time === "dusk") {
      const duskFog = new THREE.Color("#f6a066");
      this.scene.background = duskFog;
      this.scene.fog.color = duskFog;
      this.dirLight.color.set("#ff833b");
      this.dirLight.intensity = 1.1;
      this.ambientLight.color.set("#e57757");
      this.ambientLight.intensity = 0.65;
      this.lamps.forEach(l => {
        if (l.light) l.light.intensity = 1.6;
        if (l.mesh && l.mesh.material) l.mesh.material.emissiveIntensity = 1.0;
      });
      this.houseWindows.forEach(m => { m.emissive.setHex(0xffaa33); m.emissiveIntensity = 0.6; });
    } else if (time === "night") {
      const nightFog = new THREE.Color("#0d1525");
      this.scene.background = nightFog;
      this.scene.fog.color = nightFog;
      this.dirLight.color.set("#3c5a8c");
      this.dirLight.intensity = 0.42;
      this.ambientLight.color.set("#18233a");
      this.ambientLight.intensity = 0.48;
      this.lamps.forEach(l => {
        if (l.light) l.light.intensity = 2.4;
        if (l.mesh && l.mesh.material) l.mesh.material.emissiveIntensity = 1.2;
      });
      this.houseWindows.forEach(m => { m.emissive.setHex(0xffbe0b); m.emissiveIntensity = 0.95; });
    }
  }

  // --- 1. PLATFORM DIORAMA DENGAN ALUR SUNGAI TERBELAH (SOIL STRATA & RIVER TRENCH) ---
  buildDioramaPlatform() {
    const tg = window.textureGen;

    // A. Permukaan Rumput Terbelah Alur Sungai (TIDAK MENUTUPI SUNGAI)
    // 1. Halaman Rumput Sisi Barat (X: -22.0 ke -13.5, Z: -20.0 ke 14.0, Lebar: 8.5, Panjang: 34.0)
    const grassMatWest = new THREE.MeshLambertMaterial({ map: tg.getGrassTexture() });
    grassMatWest.map.repeat.set(5, 17);

    const groundWest = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 34), grassMatWest);
    groundWest.rotation.x = -Math.PI / 2;
    groundWest.position.set(-17.75, 0, -3.0);
    groundWest.receiveShadow = true;
    this.exteriorGroup.add(groundWest);

    // 2. Halaman Rumput Sisi Timur/Tengah (X: -9.5 ke 22.0, Z: -20.0 ke 14.0, Lebar: 31.5, Panjang: 34.0)
    const grassMatEast = new THREE.MeshLambertMaterial({ map: tg.getGrassTexture() });
    grassMatEast.map.repeat.set(16, 17);

    const groundEast = new THREE.Mesh(new THREE.PlaneGeometry(31.5, 34), grassMatEast);
    groundEast.rotation.x = -Math.PI / 2;
    groundEast.position.set(6.25, 0, -3.0);
    groundEast.receiveShadow = true;
    this.exteriorGroup.add(groundEast);

    // B. Tebing Potongan Tanah Diorama (Cross-Section Soil Strata)
    const cutawayMat = new THREE.MeshLambertMaterial({ map: tg.getSoilCutawayTexture() });
    cutawayMat.map.repeat.set(12, 1);

    // Tepi Depan Sisi Barat (South West Cliff: X = -22.0 ke -13.5)
    const cliffFrontWest = new THREE.Mesh(new THREE.PlaneGeometry(8.5, 5.5), cutawayMat);
    cliffFrontWest.position.set(-17.75, -2.75, 14.0);
    cliffFrontWest.receiveShadow = true;
    this.exteriorGroup.add(cliffFrontWest);

    // Tepi Depan Sisi Timur (South East Cliff: X = -9.5 ke 22.0)
    const cliffFrontEast = new THREE.Mesh(new THREE.PlaneGeometry(31.5, 5.5), cutawayMat);
    cliffFrontEast.position.set(6.25, -2.75, 14.0);
    cliffFrontEast.receiveShadow = true;
    this.exteriorGroup.add(cliffFrontEast);

    // Tepi Potongan Muara Sungai (South River Outlet Cliff: X = -13.5 ke -9.5, Y: -0.65 ke -5.5)
    const cliffRiverOutlet = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 4.85), cutawayMat);
    cliffRiverOutlet.position.set(-11.5, -3.075, 14.0);
    this.exteriorGroup.add(cliffRiverOutlet);

    // Tepi Kiri (West Cliff at X = -22.0)
    const cliffLeft = new THREE.Mesh(new THREE.PlaneGeometry(34, 5.5), cutawayMat);
    cliffLeft.rotation.y = Math.PI / 2;
    cliffLeft.position.set(-22.0, -2.75, -3.0);
    this.exteriorGroup.add(cliffLeft);

    // Tepi Kanan (East Cliff at X = 22.0)
    const cliffRight = new THREE.Mesh(new THREE.PlaneGeometry(34, 5.5), cutawayMat);
    cliffRight.rotation.y = -Math.PI / 2;
    cliffRight.position.set(22.0, -2.75, -3.0);
    this.exteriorGroup.add(cliffRight);

    // Collider Batas Dunia Diorama (Agar tidak jatuh keluar tebing)
    this.exteriorColliders.push({ minX: -22.5, maxX: -21.2, minZ: -21.0, maxZ: 14.5 }); // Barat
    this.exteriorColliders.push({ minX: 21.2, maxX: 22.5, minZ: -21.0, maxZ: 14.5 });  // Timur
    this.exteriorColliders.push({ minX: -22.5, maxX: 22.5, minZ: 13.5, maxZ: 15.0 });  // Selatan (Depan)
    this.exteriorColliders.push({ minX: -22.5, maxX: 22.5, minZ: -21.5, maxZ: -19.5 }); // Utara (Belakang)
  }

  // --- 2. RUMAH, TERAS & UNDAKAN TANGGA BATU SOLID (BEBAS CELAH & ATAP PELANA RAPI) ---
  buildHouseAndStairs() {
    const tg = window.textureGen;
    const terraceGroup = new THREE.Group();

    // A. Fondasi Balok Batu Solid Seluruh Teras (X: -9.0 ke 9.0, Z: -18.5 ke -8.0, Y: 0 ke 1.2)
    // Menggunakan balok 3D pejal batu ashlar rapat dari lantai teras sampai menembus tanah (TIDAK ADA CELAH BOLONG)
    const stoneWallMat = new THREE.MeshLambertMaterial({ map: tg.getStoneWallTexture() });
    stoneWallMat.map.repeat.set(6, 1);

    const foundationCore = new THREE.Mesh(new THREE.BoxGeometry(18.0, 1.25, 10.5), stoneWallMat);
    foundationCore.position.set(0, 0.6, -13.25);
    foundationCore.receiveShadow = true;
    foundationCore.castShadow = true;
    terraceGroup.add(foundationCore);

    // Lantai Paving Teras Batu di Atas Fondasi (Y = 1.23)
    const stonePathMat = new THREE.MeshLambertMaterial({ map: tg.getStonePathTexture() });
    stonePathMat.map.repeat.set(6, 4);
    const terraceFloor = new THREE.Mesh(new THREE.PlaneGeometry(18.0, 10.5), stonePathMat);
    terraceFloor.rotation.x = -Math.PI / 2;
    terraceFloor.position.set(0, 1.23, -13.25);
    terraceFloor.receiveShadow = true;
    terraceGroup.add(terraceFloor);

    // Dinding Pembatas / Parapet Teras Depan (Kiri & Kanan Tangga, Solid Tebal 0.5 unit)
    const parapetMat = new THREE.MeshLambertMaterial({ map: tg.getStoneWallTexture() });
    parapetMat.map.repeat.set(2, 1);
    const copingMat = new THREE.MeshLambertMaterial({ color: "#6c757d" });

    [-6.0, 6.0].forEach(px => {
      // Dinding parapet
      const parapet = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.45, 0.5), parapetMat);
      parapet.position.set(px, 1.45, -8.0);
      parapet.castShadow = true;
      terraceGroup.add(parapet);

      // Lisplang batu coping atas
      const coping = new THREE.Mesh(new THREE.BoxGeometry(6.3, 0.1, 0.6), copingMat);
      coping.position.set(px, 1.7, -8.0);
      coping.castShadow = true;
      terraceGroup.add(coping);

      // Kotak pot bunga kayu di atas pembatas teras
      const planter = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.35, 0.45), new THREE.MeshLambertMaterial({ color: "#543724" }));
      planter.position.set(px, 1.9, -8.0);
      planter.castShadow = true;
      terraceGroup.add(planter);

      // Bunga mekar warna-warni di atas pot
      const fColors = ["#e63946", "#ffb703", "#ffffff", "#f72585", "#70e000", "#4cc9f0"];
      for (let i = 0; i < 7; i++) {
        const fl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), new THREE.MeshLambertMaterial({ color: fColors[i % fColors.length] }));
        fl.position.set(px - 2.2 + i * 0.72, 2.15, -8.0);
        fl.castShadow = true;
        terraceGroup.add(fl);
      }
    });

    // Dinding Pembatas Samping Teras (Kiri X = -9.0 & Kanan X = 9.0)
    [-9.0, 9.0].forEach(sx => {
      const sideParapet = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 10.5), parapetMat);
      sideParapet.position.set(sx, 1.45, -13.25);
      sideParapet.castShadow = true;
      terraceGroup.add(sideParapet);

      const sideCoping = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 10.6), copingMat);
      sideCoping.position.set(sx, 1.7, -13.25);
      sideCoping.castShadow = true;
      terraceGroup.add(sideCoping);

      // Pagar kayu pendek di atas lis pembatas samping
      const fenceRail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 10.2), new THREE.MeshLambertMaterial({ color: "#4a3525" }));
      fenceRail.position.set(sx, 2.0, -13.25);
      terraceGroup.add(fenceRail);
    });

    // B. Semak Rimbun & Rumput Hias di Sepanjang Kaki Teras Menghadap Tanah Taman
    const foliageMat = new THREE.MeshLambertMaterial({ color: "#2d6a4f" });
    const flowerMat = new THREE.MeshLambertMaterial({ color: "#ffffff" });

    // Semak di kaki teras depan kiri & kanan
    for (let x = -8.5; x <= -3.5; x += 1.4) {
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.42, 6, 6), foliageMat);
      bush.scale.set(1.2, 0.7, 1.0);
      bush.position.set(x, 0.3, -7.5);
      bush.castShadow = true;
      terraceGroup.add(bush);
    }
    for (let x = 3.5; x <= 8.5; x += 1.4) {
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.42, 6, 6), foliageMat);
      bush.scale.set(1.2, 0.7, 1.0);
      bush.position.set(x, 0.3, -7.5);
      bush.castShadow = true;
      terraceGroup.add(bush);
    }

    // Semak di kaki teras samping kiri & kanan
    for (let z = -9.0; z >= -18.0; z -= 1.8) {
      [-9.4, 9.4].forEach(bx => {
        const bush = new THREE.Mesh(new THREE.SphereGeometry(0.45, 6, 6), foliageMat);
        bush.scale.set(0.9, 0.7, 1.2);
        bush.position.set(bx, 0.3, z);
        bush.castShadow = true;
        terraceGroup.add(bush);
      });
    }

    // C. 6 Anak Tangga Batu Berundak Rapi (Lebar 6.0 Unit, Z: -4.0 ke -8.0)
    const numSteps = 6;
    const stepDepth = (8.0 - 4.0) / numSteps; // ~0.667
    const stepHeight = 1.2 / numSteps; // 0.20

    for (let i = 0; i < numSteps; i++) {
      const sy = (i + 1) * stepHeight;
      const sz = -4.0 - (i * stepDepth) - (stepDepth / 2);
      const stepMesh = new THREE.Mesh(
        new THREE.BoxGeometry(6.0, sy, stepDepth),
        stonePathMat
      );
      stepMesh.position.set(0, sy / 2, sz);
      stepMesh.receiveShadow = true;
      stepMesh.castShadow = true;
      terraceGroup.add(stepMesh);
    }

    // Pipi Tangga Batu Solid (Solid Stair Stringers & Cheeks Menutup Samping Tangga)
    [-3.25, 3.25].forEach(cx => {
      // Balok miring stringer samping tangga menempel rapat ke dinding teras
      for (let i = 0; i < numSteps; i++) {
        const sy = (i + 1) * stepHeight + 0.35;
        const sz = -4.0 - (i * stepDepth) - (stepDepth / 2);
        const cheek = new THREE.Mesh(new THREE.BoxGeometry(0.5, sy, stepDepth), stoneWallMat);
        cheek.position.set(cx, sy / 2, sz);
        cheek.castShadow = true;
        cheek.receiveShadow = true;
        terraceGroup.add(cheek);

        // Coping batu di atas pipi tangga
        const cheekCap = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, stepDepth), copingMat);
        cheekCap.position.set(cx, sy + 0.05, sz);
        cheekCap.castShadow = true;
        terraceGroup.add(cheekCap);
      }
    });

    this.exteriorGroup.add(terraceGroup);

    // D. Bangunan Rumah Kayu Putih Pedesaan dengan Atap Pelana Solid
    const houseGroup = new THREE.Group();
    houseGroup.position.set(0, 1.23, -14.0);

    // Dinding Rumah Putih Stucco Solid (Lebar 11.8, Tinggi 4.6, Tebal 6.8)
    const wallWhiteMat = new THREE.MeshLambertMaterial({ color: "#f7f4ed" });
    const houseBody = new THREE.Mesh(new THREE.BoxGeometry(11.8, 4.6, 6.8), wallWhiteMat);
    houseBody.position.set(0, 2.3, 0);
    houseBody.castShadow = true;
    houseBody.receiveShadow = true;
    houseGroup.add(houseBody);

    // Tiang Sudut Kayu & Lisplang Bawah
    const timberMat = new THREE.MeshLambertMaterial({ color: "#4a3525" });
    [[-5.8, -3.3], [-5.8, 3.3], [5.8, -3.3], [5.8, 3.3]].forEach(([px, pz]) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.42, 4.6, 0.42), timberMat);
      post.position.set(px, 2.3, pz);
      post.castShadow = true;
      houseGroup.add(post);
    });

    // Pintu Utama Kayu dengan Kusen Solid
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.0, 3.0, 0.2), timberMat);
    doorFrame.position.set(0, 1.5, 3.42);
    doorFrame.castShadow = true;
    houseGroup.add(doorFrame);

    const doorMat = new THREE.MeshLambertMaterial({ color: "#6a452d" });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.7), doorMat);
    door.position.set(0, 1.45, 3.53);
    houseGroup.add(door);
    this.doorMesh = door;

    // Handle Kunci Kuningan
    const knobMat = new THREE.MeshLambertMaterial({ color: "#f6c445" });
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), knobMat);
    knob.position.set(0.65, 1.4, 3.56);
    houseGroup.add(knob);

    // Jendela Kiri & Kanan dengan Kaca Hangat Bercahaya
    const winMat = new THREE.MeshLambertMaterial({
      color: "#ffeaa7",
      emissive: 0xffb703,
      emissiveIntensity: 0.75
    });
    this.houseWindows.push(winMat);

    [-3.8, 3.8].forEach(wx => {
      // Kusen jendela
      const wFrame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.9, 0.16), timberMat);
      wFrame.position.set(wx, 2.4, 3.42);
      wFrame.castShadow = true;
      houseGroup.add(wFrame);

      // Kaca jendela bercahaya
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.6), winMat);
      win.position.set(wx, 2.4, 3.52);
      houseGroup.add(win);

      // Kotak bunga jendela (Window Flower Box)
      const wBox = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.35, 0.4), new THREE.MeshLambertMaterial({ color: "#543724" }));
      wBox.position.set(wx, 1.4, 3.6);
      wBox.castShadow = true;
      houseGroup.add(wBox);

      // Bunga mini di jendela
      for (let fi = -0.8; fi <= 0.8; fi += 0.4) {
        const f = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), new THREE.MeshLambertMaterial({ color: (fi < 0 ? "#e63946" : "#ffb703") }));
        f.position.set(wx + fi, 1.65, 3.6);
        houseGroup.add(f);
      }
    });

    // Jendela Samping Kiri & Kanan
    [-5.92, 5.92].forEach((sx, idx) => {
      const sideWin = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), winMat);
      sideWin.rotation.y = idx === 0 ? -Math.PI / 2 : Math.PI / 2;
      sideWin.position.set(sx, 2.4, 0);
      houseGroup.add(sideWin);
    });

    // E. Atap Pelana Solid Presisi & Lisplang Eaves Bersih (Gabled Roof)
    const roofTileMat = new THREE.MeshLambertMaterial({ map: tg.getRoofTileTexture() });
    roofTileMat.map.repeat.set(8, 2);

    // 1. Lereng Atap Depan (Pitch ~32 Derajat Menutup Sisi Depan: Z = 0 ke Z = 4.0, Y = 6.75 ke 4.25)
    const roofFront = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.18, 4.75), roofTileMat);
    roofFront.rotation.x = 0.56;
    roofFront.position.set(0, 5.50, 2.00);
    roofFront.castShadow = true;
    roofFront.receiveShadow = true;
    houseGroup.add(roofFront);

    // 2. Lereng Atap Belakang (Pitch ~32 Derajat Menutup Sisi Belakang: Z = 0 ke Z = -4.0, Y = 6.75 ke 4.25)
    const roofBack = new THREE.Mesh(new THREE.BoxGeometry(13.2, 0.18, 4.75), roofTileMat);
    roofBack.rotation.x = -0.56;
    roofBack.position.set(0, 5.50, -2.00);
    roofBack.castShadow = true;
    roofBack.receiveShadow = true;
    houseGroup.add(roofBack);

    // 3. Lisplang Bubungan Atap (Ridge Cap di Puncak Y = 6.75, Z = 0)
    const ridgeCap = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.24, 0.36), timberMat);
    ridgeCap.position.set(0, 6.75, 0);
    ridgeCap.castShadow = true;
    houseGroup.add(ridgeCap);

    // 4. Lisplang Eaves Tepi Depan & Belakang
    const eaveFront = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.22, 0.16), timberMat);
    eaveFront.position.set(0, 4.25, 3.98);
    eaveFront.castShadow = true;
    houseGroup.add(eaveFront);

    const eaveBack = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.22, 0.16), timberMat);
    eaveBack.position.set(0, 4.25, -3.98);
    eaveBack.castShadow = true;
    houseGroup.add(eaveBack);

    // 5. Dinding Segitiga Gable Samping (West & East Gable Walls Tertutup Rapat)
    const gableShape = new THREE.Shape();
    gableShape.moveTo(-3.4, 0);
    gableShape.lineTo(3.4, 0);
    gableShape.lineTo(0, 2.15);
    gableShape.closePath();

    const gableGeom = new THREE.ExtrudeGeometry(gableShape, { depth: 0.25, bevelEnabled: false });

    // Gable Barat
    const gableWest = new THREE.Mesh(gableGeom, wallWhiteMat);
    gableWest.rotation.y = Math.PI / 2;
    gableWest.position.set(-5.88, 4.6, 0);
    gableWest.castShadow = true;
    houseGroup.add(gableWest);

    // Gable Timur
    const gableEast = new THREE.Mesh(gableGeom, wallWhiteMat);
    gableEast.rotation.y = -Math.PI / 2;
    gableEast.position.set(5.88, 4.6, 0);
    gableEast.castShadow = true;
    houseGroup.add(gableEast);

    // 6. Cerobong Asap Batu
    const chimney = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.6, 1.0), new THREE.MeshLambertMaterial({ map: tg.getStoneWallTexture() }));
    chimney.position.set(3.8, 6.5, 0.8);
    chimney.castShadow = true;
    houseGroup.add(chimney);

    // Pot cerobong asap tanah liat di atasnya
    const fluePot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.4), new THREE.MeshLambertMaterial({ color: "#7a3e26" }));
    fluePot.position.set(3.8, 7.9, 0.8);
    houseGroup.add(fluePot);

    // Lampu Teras di Samping Pintu
    this.createLampPost(-1.6, -10.35, 1.23, true);
    this.createLampPost(1.6, -10.35, 1.23, true);

    this.exteriorGroup.add(houseGroup);

    // Collider Rumah & Dinding Teras (Solid & Akurat)
    // Tembok Rumah Utama
    this.exteriorColliders.push({ minX: -6.5, maxX: 6.5, minZ: -18.0, maxZ: -10.2 });

    // Dinding Samping Teras
    this.exteriorColliders.push({ minX: -9.5, maxX: -8.6, minZ: -18.5, maxZ: -8.0 });
    this.exteriorColliders.push({ minX: 8.6, maxX: 9.5, minZ: -18.5, maxZ: -8.0 });

    // Dinding Depan Teras (Kiri & Kanan Tangga - Bukaan Lapang Sejajar Rel Pipi Tangga)
    this.exteriorColliders.push({ minX: -9.5, maxX: -3.35, minZ: -8.5, maxZ: -7.5 });
    this.exteriorColliders.push({ minX: 3.35, maxX: 9.5, minZ: -8.5, maxZ: -7.5 });

    // Pipi Tangga (Stair Stringers - Kiri & Kanan Tangga agar Pemain Meluncur Halus Tanpa Mentok Sudut)
    this.exteriorColliders.push({ minX: -3.9, maxX: -3.35, minZ: -8.0, maxZ: -4.0 });
    this.exteriorColliders.push({ minX: 3.35, maxX: 3.9, minZ: -8.0, maxZ: -4.0 });
  }

  // --- 3. ALIRAN SUNGAI NYATA & JEMBATAN KAYU (ALUR JELAS DENGAN AIR BIRU JELAS DI BAWAH JEMBATAN) ---
  buildRiverAndBridge() {
    const tg = window.textureGen;
    const riverGroup = new THREE.Group();

    // Palung Sungai Nyata Terbuka dari Depan hingga Belakang (X: -13.5 ke -9.5, Lebar: 4.0 Unit, Z: -20.0 ke 14.0)
    const riverCenterX = -11.5;

    // A. Dasar Palung Sungai di Bawah Permukaan Tanah (Y = -0.65)
    const bedMat = new THREE.MeshLambertMaterial({ color: "#22292f" });
    const riverBed = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 34), bedMat);
    riverBed.rotation.x = -Math.PI / 2;
    riverBed.position.set(riverCenterX, -0.65, -3.0);
    riverBed.receiveShadow = true;
    riverGroup.add(riverBed);

    // B. Dinding Tanggul Batu Sungai Vertikal Menutup Tepi Tanah (Kiri X = -13.5 & Kanan X = -9.5)
    const embMat = new THREE.MeshLambertMaterial({ map: tg.getStoneWallTexture() });
    embMat.map.repeat.set(12, 1);

    // Tanggul Kiri (X = -13.5, dari Y = -0.65 sampai Y = 0)
    const embLeft = new THREE.Mesh(new THREE.PlaneGeometry(34, 0.65), embMat);
    embLeft.rotation.y = Math.PI / 2;
    embLeft.position.set(-13.5, -0.325, -3.0);
    riverGroup.add(embLeft);

    // Tanggul Kanan (X = -9.5, dari Y = -0.65 sampai Y = 0)
    const embRight = new THREE.Mesh(new THREE.PlaneGeometry(34, 0.65), embMat);
    embRight.rotation.y = -Math.PI / 2;
    embRight.position.set(-9.5, -0.325, -3.0);
    riverGroup.add(embRight);

    // C. Mesh Air Sungai Biru Jernih Berkilau (Y = -0.16)
    // Terisi penuh di palung sungai dengan kedalaman 0.49 unit di atas dasar sungai dan jelas mengalir di bawah jembatan
    const waterMat = new THREE.MeshLambertMaterial({
      map: tg.getRiverWaterTexture(),
      transparent: true,
      opacity: 0.92
    });
    waterMat.map.repeat.set(1, 8);

    const water = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 34), waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(riverCenterX, -0.16, -3.0);
    water.receiveShadow = true;
    riverGroup.add(water);
    this.waterMesh = water;

    // D. Tepian Batu Sungai yang Tertata Rapi di Kiri-Kanan Aliran Air
    const rockMat = new THREE.MeshLambertMaterial({ color: "#78716c" });
    const mossRockMat = new THREE.MeshLambertMaterial({ color: "#576046" });

    for (let z = -19; z <= 13; z += 1.8) {
      [-13.55, -9.45].forEach((rx, idx) => {
        const mat = (Math.abs(z) % 2 === 0) ? rockMat : mossRockMat;
        const rk = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28 + (Math.abs(z) % 3) * 0.08, 0), mat);
        rk.position.set(rx, -0.05, z + (idx * 0.3));
        rk.rotation.set(Math.sin(z), Math.cos(z), 0);
        rk.castShadow = true;
        riverGroup.add(rk);
      });
    }

    // E. Jembatan Kayu Melintang di Atas Sungai (Menghubungkan Halaman Barat & Timur)
    // Span dari X: -14.2 ke -8.8 (Panjang: 5.4 Unit), Lebar Z: -0.5 ke 3.5 (4.0 Unit), Ketinggian Dek: Y = 0.22
    // Celah udara nyata 0.38 unit di atas permukaan air sehingga air biru mengalir jelas di bawahnya
    const bridgeGroup = new THREE.Group();

    // Lantai Papan Jembatan Kayu
    const bridgeWoodMat = new THREE.MeshLambertMaterial({ map: tg.getBridgeWoodTexture() });
    bridgeWoodMat.map.repeat.set(4, 2);
    const bridgeFloor = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 4.0), bridgeWoodMat);
    bridgeFloor.rotation.x = -Math.PI / 2;
    bridgeFloor.position.set(riverCenterX, 0.22, 1.5);
    bridgeFloor.receiveShadow = true;
    bridgeFloor.castShadow = true;
    bridgeGroup.add(bridgeFloor);

    // Balok Penyangga Kayu di Bawah Dek Jembatan (Membentang di Sisi Utara & Selatan)
    const beamMat = new THREE.MeshLambertMaterial({ color: "#4a2e1b" });
    [-0.4, 3.4].forEach(bz => {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.24, 0.2), beamMat);
      beam.position.set(riverCenterX, 0.06, bz);
      beam.castShadow = true;
      bridgeGroup.add(beam);
    });

    // Tiang Pancang Penyangga Jembatan yang Menancap ke Dasar Sungai (Pylons)
    [-13.0, -10.0].forEach(px => {
      [-0.4, 3.4].forEach(pz => {
        const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.9, 6), beamMat);
        pylon.position.set(px, -0.22, pz);
        pylon.castShadow = true;
        bridgeGroup.add(pylon);
      });
    });

    // Pagar Pembatas Kayu Jembatan (Railing di Sisi Utara Z = -0.5 & Selatan Z = 3.5)
    [-0.5, 3.5].forEach(rz => {
      // 4 Tiang pagar tegak
      [-14.0, -12.3, -10.7, -9.0].forEach(px => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.0, 0.18), beamMat);
        post.position.set(px, 0.72, rz);
        post.castShadow = true;
        bridgeGroup.add(post);
      });

      // Palang horizontal atas & tengah
      const railTop = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.12, 0.1), beamMat);
      railTop.position.set(riverCenterX, 1.05, rz);
      bridgeGroup.add(railTop);

      const railMid = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.08, 0.08), beamMat);
      railMid.position.set(riverCenterX, 0.65, rz);
      bridgeGroup.add(railMid);
    });

    riverGroup.add(bridgeGroup);
    this.exteriorGroup.add(riverGroup);

    // COLLIDER SUNGAI & PAGAR JEMBATAN (Player HANYA Bisa Menyeberang Lewat Jembatan Kayu)
    // 1. Sungai Bagian Utara (Z: -20.5 ke -0.5) - Impassable Water
    this.exteriorColliders.push({ minX: -13.6, maxX: -9.4, minZ: -20.5, maxZ: -0.5 });

    // 2. Sungai Bagian Selatan (Z: 3.5 ke 14.5) - Impassable Water
    this.exteriorColliders.push({ minX: -13.6, maxX: -9.4, minZ: 3.5, maxZ: 14.5 });

    // 3. Pagar Sisi Utara Jembatan (Z: -0.7 ke -0.3, X: -14.2 ke -8.8)
    this.exteriorColliders.push({ minX: -14.2, maxX: -8.8, minZ: -0.7, maxZ: -0.3 });

    // 4. Pagar Sisi Selatan Jembatan (Z: 3.3 ke 3.7, X: -14.2 ke -8.8)
    this.exteriorColliders.push({ minX: -14.2, maxX: -8.8, minZ: 3.3, maxZ: 3.7 });
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

  // --- 4.5. ZONA API UNGGUN (CAMPFIRE DI HALAMAN TIMUR LAUT) ---
  buildCampfireZone() {
    const campfireGroup = new THREE.Group();
    const cx = 14.5, cz = -11.5;

    // 1. Pijakan Lingkaran Tanah & Kerikil Hangat (Clearing)
    const clearingMat = new THREE.MeshLambertMaterial({ color: "#615343" });
    const clearing = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.4, 0.04, 18), clearingMat);
    clearing.position.set(cx, 0.02, cz);
    clearing.receiveShadow = true;
    campfireGroup.add(clearing);

    // 2. Lingkaran Batu Sungai Pelindung Api (12 Batu Dodecahedron)
    const rockMat = new THREE.MeshLambertMaterial({ color: "#6b7280" });
    const mossRockMat = new THREE.MeshLambertMaterial({ color: "#4d5b43" });
    const numRocks = 12;
    const ringRadius = 1.15;
    for (let i = 0; i < numRocks; i++) {
      const angle = (i / numRocks) * Math.PI * 2;
      const rx = cx + Math.cos(angle) * ringRadius;
      const rz = cz + Math.sin(angle) * ringRadius;
      const mat = (i % 2 === 0) ? rockMat : mossRockMat;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24 + (i % 3) * 0.04, 0), mat);
      rock.position.set(rx, 0.12, rz);
      rock.rotation.set(angle, angle * 0.5, 0);
      rock.castShadow = true;
      campfireGroup.add(rock);
    }

    // 3. Abu dan Bara Arang di Tengah Api
    const ashMat = new THREE.MeshLambertMaterial({ color: "#2b2621", emissive: 0x4a1805, emissiveIntensity: 0.6 });
    const ashBed = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.08, 12), ashMat);
    ashBed.position.set(cx, 0.05, cz);
    campfireGroup.add(ashBed);

    // 4. Susunan Kayu Bakar Menyilang (Criss-Cross Logs)
    const woodMat = new THREE.MeshLambertMaterial({ color: "#3d2211" });
    const logAngles = [0.2, 1.25, 2.3, 3.4, 4.4, 5.5];
    logAngles.forEach((ang, idx) => {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 1.3, 6), woodMat);
      log.position.set(cx + Math.cos(ang) * 0.25, 0.22 + (idx % 2) * 0.08, cz + Math.sin(ang) * 0.25);
      log.rotation.z = Math.PI / 2.7;
      log.rotation.y = ang;
      log.castShadow = true;
      campfireGroup.add(log);
    });

    // 5. Api 3D Low-Poly Berpijar (Outer Orange Flame & Inner Golden Yellow Flame)
    const outerFlameMat = new THREE.MeshLambertMaterial({
      color: "#ff5400",
      emissive: 0xff4500,
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.9
    });
    const innerFlameMat = new THREE.MeshLambertMaterial({
      color: "#ffbe0b",
      emissive: 0xffd166,
      emissiveIntensity: 1.2
    });

    const outerFlame = new THREE.Mesh(new THREE.ConeGeometry(0.48, 1.1, 5), outerFlameMat);
    outerFlame.position.set(cx, 0.72, cz);
    campfireGroup.add(outerFlame);

    const innerFlame = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.75, 5), innerFlameMat);
    innerFlame.position.set(cx, 0.65, cz);
    campfireGroup.add(innerFlame);

    this.campfireFlames = { outer: outerFlame, inner: innerFlame };

    // 6. Cahaya Api Unggun Berpendar Hangat (Flickering PointLight)
    this.campfireLight = new THREE.PointLight("#ff7b00", 2.2, 9.5, 2);
    this.campfireLight.position.set(cx, 0.9, cz);
    campfireGroup.add(this.campfireLight);

    // 7. Bangku Santai Batang Kayu Melengkung (Log Benches) Mengitari Api Unggun
    const benchWoodMat = new THREE.MeshLambertMaterial({ color: "#543724" });
    const benchTopMat = new THREE.MeshLambertMaterial({ color: "#825a36" });

    const createLogBench = (bx, bz, rotY, len = 2.4) => {
      const bGroup = new THREE.Group();
      // Batang kayu utama
      const bench = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, len, 8), benchWoodMat);
      bench.rotation.z = Math.PI / 2;
      bench.position.set(0, 0.22, 0);
      bench.castShadow = true;
      bGroup.add(bench);

      // Potongan permukaan atas rata yang nyaman
      const benchPlank = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, 0.44), benchTopMat);
      benchPlank.position.set(0, 0.35, 0);
      benchPlank.castShadow = true;
      bGroup.add(benchPlank);

      // Kaki penyangga kayu kecil di kedua ujung
      [-len * 0.4, len * 0.4].forEach(px => {
        const support = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.26, 6), benchWoodMat);
        support.position.set(px, 0.13, 0);
        bGroup.add(support);
      });

      bGroup.rotation.y = rotY;
      bGroup.position.set(bx, 0, bz);
      return bGroup;
    };

    // Bangku Selatan (menghadap ke utara ke api)
    campfireGroup.add(createLogBench(cx, cz + 2.2, 0, 2.4));
    // Bangku Timur (menghadap ke barat ke api)
    campfireGroup.add(createLogBench(cx + 2.2, cz, Math.PI / 2, 2.2));
    // Bangku Barat Laut (menghadap ke tenggara ke api)
    campfireGroup.add(createLogBench(cx - 1.8, cz - 1.5, Math.PI / 4, 2.0));

    // 8. Batu Pijakan Taman (Stepping Stones) dari Pelataran Arcade (Z = -3.5) ke Api Unggun (Z = -9.2)
    const stoneMat = new THREE.MeshLambertMaterial({ color: "#8d99ae" });
    const steppingPath = [
      [13.5, -4.5], [13.8, -5.8], [14.0, -7.0], [14.2, -8.2]
    ];
    steppingPath.forEach(([sx, sz]) => {
      const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.06, 7), stoneMat);
      stone.position.set(sx, 0.04, sz);
      stone.receiveShadow = true;
      campfireGroup.add(stone);
    });

    // 9. Lentera Kayu Kecil di Atas Tunggul Kayu Dekat Bangku
    const stumpMat = new THREE.MeshLambertMaterial({ color: "#402613" });
    const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.55, 7), stumpMat);
    stump.position.set(cx + 1.8, 0.275, cz + 1.8);
    stump.castShadow = true;
    campfireGroup.add(stump);

    const smallLanternMat = new THREE.MeshLambertMaterial({ color: "#ffe6a7", emissive: 0xffb703, emissiveIntensity: 0.6 });
    const smallLantern = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.25, 0.2), smallLanternMat);
    smallLantern.position.set(cx + 1.8, 0.68, cz + 1.8);
    smallLantern.castShadow = true;
    campfireGroup.add(smallLantern);

    this.exteriorGroup.add(campfireGroup);

    // COLLIDER AREA API UNGGUN & BANGKU
    // 1. Api Unggun (Pusat Api Tidak Bisa Dilalui)
    this.exteriorColliders.push({ minX: cx - 1.1, maxX: cx + 1.1, minZ: cz - 1.1, maxZ: cz + 1.1 });
    // 2. Bangku Selatan
    this.exteriorColliders.push({ minX: cx - 1.3, maxX: cx + 1.3, minZ: cz + 1.9, maxZ: cz + 2.5 });
    // 3. Bangku Timur
    this.exteriorColliders.push({ minX: cx + 1.9, maxX: cx + 2.5, minZ: cz - 1.2, maxZ: cz + 1.2 });
    // 4. Bangku Barat Laut
    this.exteriorColliders.push({ minX: cx - 2.5, maxX: cx - 1.1, minZ: cz - 2.2, maxZ: cz - 0.8 });
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

    // E. Tata Letak Lampu Taman Berdiri yang Rapi, Lapang & Estetik (Bebas Halangan)
    // 1. Sudut Barat Taman Depan (Sisi Kotak Surat & Bangku)
    this.createLampPost(-6.0, 5.8, 0);
    // 2. Sudut Timur Taman Depan (Sisi Mading Desa)
    this.createLampPost(6.0, 5.8, 0);
    // 3. Ujung Timur Jembatan Kayu Sungai (Lampu Hub dengan PointLight)
    this.createLampPost(-8.2, 1.5, 0, false, true);
    // 4. Ujung Barat Jembatan Kayu Sungai (Sisi Mas Bayu & Kebun)
    this.createLampPost(-15.2, 1.5, 0);
    // 5. Kebun Barat Sisi Selatan (Dekat Kakek Bijak)
    this.createLampPost(-16.8, -6.5, 0);
    // 6. Pintu Masuk Pelataran Arcade & Photobooth
    this.createLampPost(7.2, 2.0, 0);
    // 7. Area Api Unggun Warga (Sisi Luar Bangku Timur)
    this.createLampPost(17.8, -11.5, 0);

    this.exteriorGroup.add(courtGroup);

    // Collider Peti Sambutan & Papan Petunjuk
    this.exteriorColliders.push({ minX: -0.2, maxX: 1.2, minZ: 4.6, maxZ: 5.8 });  // Peti Sambutan
    this.exteriorColliders.push({ minX: 1.3, maxX: 2.0, minZ: 4.8, maxZ: 5.6 });   // Papan Petunjuk
  }

  // --- 5.5. OBJEK INTERAKTIF DESA TAMBAHAN (KOTAK SURAT, SUMUR TUA, MADING DESA, DLL) ---
  buildVillageInteractiveProps() {
    const tg = window.textureGen;
    const villagePropsGroup = new THREE.Group();
    const woodMat = new THREE.MeshLambertMaterial({ color: "#543724" });
    const darkTimberMat = new THREE.MeshLambertMaterial({ color: "#3d2211" });

    // 1. Kotak Surat Kayu Pedesaan (Letterbox) di Sisi Barat Jalan Depan (X = -3.5, Z = 5.0)
    const mailboxGroup = new THREE.Group();
    mailboxGroup.position.set(-3.5, 0, 5.0);

    // Tiang penyangga kayu
    const mbPost = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.15), woodMat);
    mbPost.position.set(0, 0.575, 0);
    mbPost.castShadow = true;
    mailboxGroup.add(mbPost);

    // Bodi kotak surat kayu beratap lengkung
    const mbBody = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.35, 0.55), woodMat);
    mbBody.position.set(0, 1.25, 0);
    mbBody.castShadow = true;
    mailboxGroup.add(mbBody);

    // Atap lengkung kotak surat
    const mbRoof = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.55, 12, 1, false, 0, Math.PI), darkTimberMat);
    mbRoof.rotation.z = Math.PI / 2;
    mbRoof.rotation.y = Math.PI / 2;
    mbRoof.position.set(0, 1.42, 0);
    mbRoof.castShadow = true;
    mailboxGroup.add(mbRoof);

    // Bendera merah penanda surat
    const mbFlagMat = new THREE.MeshLambertMaterial({ color: "#e63946" });
    const mbFlag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.1), mbFlagMat);
    mbFlag.position.set(0.21, 1.35, 0.12);
    mailboxGroup.add(mbFlag);

    villagePropsGroup.add(mailboxGroup);
    this.exteriorColliders.push({ minX: -3.8, maxX: -3.2, minZ: 4.7, maxZ: 5.3 });

    // 2. Papan Informasi Warga (Mading Desa) di Sisi Timur Jalan Depan (X = 5.5, Z = 6.2)
    const madingGroup = new THREE.Group();
    madingGroup.position.set(5.5, 0, 6.2);

    // Dua tiang kayu
    [-0.8, 0.8].forEach(px => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.9), darkTimberMat);
      p.position.set(px, 0.95, 0);
      p.castShadow = true;
      madingGroup.add(p);
    });

    // Papan mading dengan tekstur gabus & memo kertas warna-warni
    const madingBoardMat = new THREE.MeshLambertMaterial({ map: tg.getNoticeBoardTexture() });
    const madingBoard = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.15), madingBoardMat);
    madingBoard.position.set(0, 1.35, 0.06);
    madingBoard.castShadow = true;
    madingGroup.add(madingBoard);

    // Belakang papan mading kayu
    const madingBack = new THREE.Mesh(new THREE.BoxGeometry(1.86, 1.2, 0.1), darkTimberMat);
    madingBack.position.set(0, 1.35, 0);
    madingBack.castShadow = true;
    madingGroup.add(madingBack);

    // Kanopi atap kecil mading penahan hujan
    const madingCanopyMat = new THREE.MeshLambertMaterial({ color: "#2b2d42" });
    const madingCanopy = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.08, 0.45), madingCanopyMat);
    madingCanopy.position.set(0, 2.0, 0.1);
    madingCanopy.rotation.x = 0.25;
    madingCanopy.castShadow = true;
    madingGroup.add(madingCanopy);

    villagePropsGroup.add(madingGroup);
    this.exteriorColliders.push({ minX: 4.6, maxX: 6.4, minZ: 5.9, maxZ: 6.5 });

    // 3. Sumur Tua Batu Air Segar (Village Well) di Kebun Barat (X = -16.5, Z = -3.0)
    const wellGroup = new THREE.Group();
    const wx = -16.5, wz = -3.0;
    wellGroup.position.set(wx, 0, wz);

    // Dinding lingkaran batu sumur
    const wellStoneMat = new THREE.MeshLambertMaterial({ map: tg.getStoneWallTexture() });
    wellStoneMat.map.repeat.set(4, 1);
    const wellWall = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 0.85, 14, 1, false), wellStoneMat);
    wellWall.position.set(0, 0.425, 0);
    wellWall.castShadow = true;
    wellWall.receiveShadow = true;
    wellGroup.add(wellWall);

    // Bibir sumur batu (coping)
    const wellCopingMat = new THREE.MeshLambertMaterial({ color: "#6c757d" });
    const wellLip = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.12, 6, 14), wellCopingMat);
    wellLip.rotation.x = Math.PI / 2;
    wellLip.position.set(0, 0.85, 0);
    wellLip.castShadow = true;
    wellGroup.add(wellLip);

    // Permukaan air sumur jernih berkilau di dalam
    const wellWaterMat = new THREE.MeshLambertMaterial({
      color: "#29b6f6",
      emissive: 0x0288d1,
      emissiveIntensity: 0.35,
      transparent: true,
      opacity: 0.88
    });
    const wellWater = new THREE.Mesh(new THREE.CircleGeometry(1.05, 14), wellWaterMat);
    wellWater.rotation.x = -Math.PI / 2;
    wellWater.position.set(0, 0.38, 0);
    wellGroup.add(wellWater);

    // Dua tiang kayu penyangga atap sumur
    [-0.85, 0.85].forEach(pz => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 2.3), darkTimberMat);
      p.position.set(0, 1.15, pz);
      p.castShadow = true;
      wellGroup.add(p);
    });

    // Poros katrol kayu melintang
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.8), darkTimberMat);
    axle.position.set(0, 1.75, 0);
    axle.rotation.x = Math.PI / 2;
    wellGroup.add(axle);

    // Gulungan tali tambang
    const ropeMat = new THREE.MeshLambertMaterial({ color: "#d4a373" });
    const ropeCoil = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.35, 8), ropeMat);
    ropeCoil.position.set(0, 1.75, 0);
    ropeCoil.rotation.x = Math.PI / 2;
    wellGroup.add(ropeCoil);

    // Tali menggantung & ember kayu
    const ropeHang = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.65), ropeMat);
    ropeHang.position.set(0, 1.35, 0);
    wellGroup.add(ropeHang);

    const bucketMat = new THREE.MeshLambertMaterial({ color: "#6a452d" });
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 0.3, 8), bucketMat);
    bucket.position.set(0, 0.95, 0);
    bucket.castShadow = true;
    wellGroup.add(bucket);

    // Atap pelana kayu kecil pelindung sumur
    const wellRoofTileMat = new THREE.MeshLambertMaterial({ map: tg.getRoofTileTexture() });
    wellRoofTileMat.map.repeat.set(2, 2);
    const roofLeft = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.2), wellRoofTileMat);
    roofLeft.rotation.z = 0.45;
    roofLeft.position.set(-0.45, 2.35, 0);
    roofLeft.castShadow = true;
    wellGroup.add(roofLeft);

    const roofRight = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.2), wellRoofTileMat);
    roofRight.rotation.z = -0.45;
    roofRight.position.set(0.45, 2.35, 0);
    roofRight.castShadow = true;
    wellGroup.add(roofRight);

    villagePropsGroup.add(wellGroup);
    this.exteriorColliders.push({ minX: wx - 1.3, maxX: wx + 1.3, minZ: wz - 1.3, maxZ: wz + 1.3 });

    // 4. Keranjang Piknik Buah di Bangku Taman Depan (X = -4.8, Z = 4.5, Y = 0.5)
    const basketGroup = new THREE.Group();
    basketGroup.position.set(-4.8, 0.5, 4.5);

    const basketMat = new THREE.MeshLambertMaterial({ color: "#9c6644" });
    const basketBody = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.28, 0.34), basketMat);
    basketBody.position.set(0, 0.14, 0);
    basketBody.castShadow = true;
    basketGroup.add(basketBody);

    // Kain serbet putih berenda
    const napkinMat = new THREE.MeshLambertMaterial({ color: "#f8f9fa" });
    const napkin = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.28), napkinMat);
    napkin.rotation.x = -Math.PI / 2;
    napkin.position.set(0, 0.29, 0);
    basketGroup.add(napkin);

    // Apel merah segar di dalam keranjang
    const appleMat = new THREE.MeshLambertMaterial({ color: "#d90429" });
    const apple1 = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), appleMat);
    apple1.position.set(-0.08, 0.35, -0.04);
    apple1.castShadow = true;
    basketGroup.add(apple1);

    const apple2 = new THREE.Mesh(new THREE.SphereGeometry(0.065, 6, 6), appleMat);
    apple2.position.set(0.08, 0.34, 0.03);
    apple2.castShadow = true;
    basketGroup.add(apple2);

    villagePropsGroup.add(basketGroup);

    this.exteriorGroup.add(villagePropsGroup);
  }

  // --- 5.8. GUBUK & GAZEBO KEBUN KAYU DI BELAKANG KAKEK BIJAK (X: -16.5, Z: -10.5) ---
  buildGardenGazebo() {
    const tg = window.textureGen;
    const gazeboGroup = new THREE.Group();

    const darkTimberMat = new THREE.MeshLambertMaterial({ color: "#3d2211" });
    const woodPlankMat = new THREE.MeshLambertMaterial({
      map: tg.getWoodDeckTexture(),
      roughness: 0.8
    });
    const roofShingleMat = new THREE.MeshLambertMaterial({
      map: tg.getRoofTileTexture(),
      roughness: 0.7
    });

    const gx = -16.5;
    const gz = -10.5;

    // 1. Lantai Panggung Kayu Gazebo (Elevasi Y: 0.15)
    const deck = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.28, 3.6), woodPlankMat);
    deck.position.set(0, 0.14, 0);
    deck.receiveShadow = true;
    gazeboGroup.add(deck);

    // Undakan anak tangga kayu depan
    const step = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 0.5), darkTimberMat);
    step.position.set(0, 0.06, 2.0);
    gazeboGroup.add(step);

    // 2. 4 Tiang Balok Kayu Solid (Pillars)
    const corners = [
      [-1.85, -1.55],
      [1.85, -1.55],
      [-1.85, 1.55],
      [1.85, 1.55]
    ];
    corners.forEach(([px, pz]) => {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 2.6, 6), darkTimberMat);
      pillar.position.set(px, 1.45, pz);
      gazeboGroup.add(pillar);
    });

    // Balok penyangga atap horizontal (Perimeter Beams)
    const beamF = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.16, 0.16), darkTimberMat);
    beamF.position.set(0, 2.7, 1.55);
    gazeboGroup.add(beamF);
    const beamB = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.16, 0.16), darkTimberMat);
    beamB.position.set(0, 2.7, -1.55);
    gazeboGroup.add(beamB);
    const beamL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 3.2), darkTimberMat);
    beamL.position.set(-1.85, 2.7, 0);
    gazeboGroup.add(beamL);
    const beamR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 3.2), darkTimberMat);
    beamR.position.set(1.85, 2.7, 0);
    gazeboGroup.add(beamR);

    // 3. Atap Pelana / Limasan Kayu Rapi (Hipped / Gabled Roof)
    const roofFront = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.1, 2.4), roofShingleMat);
    roofFront.position.set(0, 3.4, 0.85);
    roofFront.rotation.x = 0.52;
    roofFront.castShadow = true;
    gazeboGroup.add(roofFront);

    const roofBack = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.1, 2.4), roofShingleMat);
    roofBack.position.set(0, 3.4, -0.85);
    roofBack.rotation.x = -0.52;
    roofBack.castShadow = true;
    gazeboGroup.add(roofBack);

    // Bubungan Atap (Ridge Cap)
    const ridgeCap = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.16, 0.28), darkTimberMat);
    ridgeCap.position.set(0, 3.98, 0);
    gazeboGroup.add(ridgeCap);

    // Lisplang eave kayu depan & belakang
    const eaveF = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.14, 0.08), darkTimberMat);
    eaveF.position.set(0, 2.85, 1.95);
    gazeboGroup.add(eaveF);
    const eaveB = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.14, 0.08), darkTimberMat);
    eaveB.position.set(0, 2.85, -1.95);
    gazeboGroup.add(eaveB);

    // Dinding sopi-sopi segitiga kayu (Gable Infill)
    [-1.9, 1.9].forEach(sideX => {
      const gable = new THREE.Mesh(new THREE.BufferGeometry(), darkTimberMat);
      const vertices = new Float32Array([
        sideX, 2.75, -1.6,
        sideX, 2.75, 1.6,
        sideX, 3.92, 0.0
      ]);
      gable.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
      gable.computeVertexNormals();
      const gableMesh = new THREE.Mesh(gable, darkTimberMat);
      gazeboGroup.add(gableMesh);
    });

    // 4. Dinding Belakang Kisi-kisi Kayu (Lattice Trellis & Tanaman Rambat)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.8, 0.08), darkTimberMat);
    backWall.position.set(0, 1.6, -1.55);
    gazeboGroup.add(backWall);

    // Daun rambat hijau di kisi-kisi belakang
    const vineMat = new THREE.MeshLambertMaterial({ color: "#2d6a4f" });
    for (let i = 0; i < 9; i++) {
      const vine = new THREE.Mesh(new THREE.SphereGeometry(0.22, 5, 5), vineMat);
      vine.scale.set(1.1, 0.8, 0.6);
      vine.position.set(-1.4 + i * 0.35, 1.2 + (i % 3) * 0.45, -1.48);
      gazeboGroup.add(vine);
    }

    // Pagar pembatas separuh di sisi kiri & kanan (Half Railings)
    [-1.85, 1.85].forEach(rx => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 1.6), darkTimberMat);
      rail.position.set(rx, 1.1, -0.6);
      gazeboGroup.add(rail);
      const railBaluster = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.7, 1.5), darkTimberMat);
      railBaluster.position.set(rx, 0.65, -0.6);
      gazeboGroup.add(railBaluster);
    });

    // 5. Bangku Panjang Santai & Teko Teh Tanah Liat di Dalam Gazebo
    const benchMat = new THREE.MeshLambertMaterial({ color: "#6b4423" });
    const bench = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.32, 0.55), benchMat);
    bench.position.set(0, 0.44, -1.1);
    gazeboGroup.add(bench);

    // Teko teh tanah liat merah bata di atas bangku
    const teapotMat = new THREE.MeshLambertMaterial({ color: "#c1440e" });
    const teapot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.18, 6), teapotMat);
    teapot.position.set(-0.7, 0.7, -1.1);
    gazeboGroup.add(teapot);

    const cangkir = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 6), new THREE.MeshLambertMaterial({ color: "#fefae0" }));
    cangkir.position.set(-0.48, 0.64, -1.1);
    gazeboGroup.add(cangkir);

    // Lampion kertas gantung di langit-langit tengah atap
    const lanternMat = new THREE.MeshLambertMaterial({
      color: "#ffd166",
      emissive: 0xffb703,
      emissiveIntensity: 0.85
    });
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), lanternMat);
    lantern.scale.set(1.0, 1.3, 1.0);
    lantern.position.set(0, 2.45, 0);
    gazeboGroup.add(lantern);

    // Set posisi keseluruhan gazebo di belakang Kakek
    gazeboGroup.position.set(gx, 0, gz);
    this.exteriorGroup.add(gazeboGroup);

    // Collider Gazebo: membatasi dinding belakang dan samping agar tidak tembus
    this.exteriorColliders.push({
      minX: gx - 2.1,
      maxX: gx + 2.1,
      minZ: gz - 1.8,
      maxZ: gz - 0.5
    });
    this.exteriorColliders.push({ minX: gx - 2.1, maxX: gx - 1.6, minZ: gz - 0.5, maxZ: gz + 1.6 });
    this.exteriorColliders.push({ minX: gx + 1.6, maxX: gx + 2.1, minZ: gz - 0.5, maxZ: gz + 1.6 });
  }

  // Tiang Lampu Taman Klasik (Optimasi High Performance & Bebas Lag)
  createLampPost(x, z, y = 0, isWallLamp = false, addPointLight = false) {
    const lampGroup = new THREE.Group();
    const ironMat = new THREE.MeshLambertMaterial({ color: "#1a1a1e" });

    if (!isWallLamp) {
      // Tiang Besi Hitam Berdiri
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 2.5), ironMat);
      post.position.set(0, 1.25, 0);
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

      // Kaca Kuning Menyala Berpendar Hangat (Emissive Shader)
      const glassMat = new THREE.MeshLambertMaterial({
        color: "#ffd166",
        emissive: 0xffb703,
        emissiveIntensity: 0.95
      });
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.35, 6), glassMat);
      glass.position.set(0, 2.45, 0);
      lampGroup.add(glass);

      // PointLight hanya diaktifkan pada titik-titik lampu utama untuk menjaga FPS tetap 60
      let light = null;
      if (addPointLight) {
        light = new THREE.PointLight("#ffbe0b", 1.1, 7.0, 2);
        light.position.set(0, 2.45, 0);
        lampGroup.add(light);
      }

      lampGroup.position.set(x, y, z);
      this.exteriorGroup.add(lampGroup);

      this.lamps.push({ light: light, mesh: glass });
      this.exteriorColliders.push({ minX: x - 0.25, maxX: x + 0.25, minZ: z - 0.25, maxZ: z + 0.25 });
    } else {
      // Lampu Dinding Teras Rumah
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.4), ironMat);
      arm.position.set(0, 0, 0.2);
      lampGroup.add(arm);

      const glassMat = new THREE.MeshLambertMaterial({ color: "#ffd166", emissive: 0xffb703, emissiveIntensity: 0.95 });
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.25), glassMat);
      glass.position.set(0, -0.1, 0.38);
      lampGroup.add(glass);

      const light = new THREE.PointLight("#ffbe0b", 1.2, 5.5, 2);
      light.position.set(0, -0.1, 0.42);
      lampGroup.add(light);

      lampGroup.position.set(x, y + 2.0, z);
      this.exteriorGroup.add(lampGroup);
      this.lamps.push({ light: light, mesh: glass });
    }
  }

  // --- 6. PEPONAN TINGGI, CEMARA & SEMAK BUNGA ---
  buildTreesAndFoliage() {
    // A. Calon Pepohonan Menjulang Tinggi (Volumetrik & Cemara)
    // Diposisikan rapi HANYA di batas perimeter terluar dengan jarak lega (tidak padat & tidak menutupi sumur/jalan)
    const candidateTrees = [
      // Sisi Barat Terluar (Memberi ruang lapang di sekitar sumur & kebun barat)
      { x: -20.5, z: 9.0, type: "pine", scale: 1.15 },
      { x: -20.5, z: -8.5, type: "volumetric", scale: 1.15 },
      { x: -20.5, z: -16.5, type: "pine", scale: 1.25 },

      // Sisi Belakang / Utara (Membingkai Belakang Teras Rumah)
      { x: -8.5, z: -18.5, type: "volumetric", scale: 1.25 },
      { x: 8.5, z: -18.5, type: "volumetric", scale: 1.25 },

      // Sisi Timur Terluar (Di balik pelataran arcade & api unggun)
      { x: 20.5, z: -16.0, type: "pine", scale: 1.25 },
      { x: 20.5, z: -4.0, type: "volumetric", scale: 1.15 },
      { x: 20.5, z: 8.5, type: "pine", scale: 1.15 }
    ];

    // Penanaman pohon dengan validasi jarak minimum (minimal 5.5 unit antar pohon)
    // Menjamin pohon tertata rapi, lapang, dan sama sekali tidak ada kanopi yang memotong sumur atau bangunan
    const placedTrees = [];
    const MIN_TREE_DIST = 5.5;

    candidateTrees.forEach(t => {
      const hasConflict = placedTrees.some(p => Math.hypot(p.x - t.x, p.z - t.z) < MIN_TREE_DIST);
      if (!hasConflict) {
        placedTrees.push(t);
        if (t.type === "volumetric") {
          this.createVolumetricTree(t.x, t.z, t.scale);
        } else {
          this.createPineTree(t.x, t.z, t.scale);
        }
      }
    });

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
      [6.8, -1.5], [6.8, 2.0], [8.0, 5.0], [10.5, 5.0], [14.0, 5.0], [17.0, 5.0],
      // Sekitar area api unggun (Campfire clearing)
      [11.5, -9.0], [17.5, -9.0], [12.0, -14.0], [17.0, -14.0],
      // Sisi utara pelataran kayu
      [10.0, -4.5], [16.0, -4.5]
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

    // 4. Api Unggun Exterior (Flicker Cahaya & Skala Lidah Api)
    if (this.campfireLight && this.currentZone === "exterior") {
      this.campfireLight.intensity = 2.0 + Math.sin(time * 14) * 0.4 + (Math.random() - 0.5) * 0.2;
    }
    if (this.campfireFlames && this.currentZone === "exterior") {
      const flScale = 1.0 + Math.sin(time * 10) * 0.08;
      this.campfireFlames.outer.scale.set(flScale, flScale * 1.05, flScale);
      this.campfireFlames.inner.scale.set(1.0 + Math.sin(time * 12) * 0.06, 1.0 + Math.cos(time * 12) * 0.08, 1.0);
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
