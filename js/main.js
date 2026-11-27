/**
 * ============================================================================
 * LOGIKA UTAMA GAME, SISTEM QUEST & STATE MANAGEMENT
 * ============================================================================
 * Mengatur alur misi berurutan (Quest 1 - 6), penguncian input saat modal aktif,
 * loop game 60 FPS dengan Isometric Medium-Wide Follow Camera, dan auto-save.
 */

class GameApp {
  constructor() {
    this.container = document.getElementById("canvas-container");
    this.world = null;
    this.player = null;
    this.interactionManager = null;
    this.ui = null;
    this.photobooth = null;
    this.arcadeGame = null;

    // State Input & Penguncian Modal
    this.input = {
      left: false,
      right: false,
      up: false,
      down: false,
      interact: false
    };
    this.isInputLocked = true; // Terkunci di awal hingga tombol Mulai ditekan

    // State Progres Misi
    this.currentQuestIndex = 1;
    this.inventorySlots = [null, null, null, null]; // Maksimal 4 Slot Inventori
    this.collectedItems = [];
    this.arcadeCompleted = false;
    this.photoTaken = false;
    this.closingLetterOpened = false;
    this.hasHouseKey = false;
    this.houseUnlocked = false;
    this.isTransitioning = false;

    // Checkpoint Verifikasi Quest Alur Berurutan (Mencegah Skip & Memastikan Kakek Bijak Beri Kunci)
    this.visitedWelcomeBox = false;
    this.visitedPaman = false;
    this.visitedDito = false;
    this.visitedPakRt = false;
    this.kakekSpawned = false;
    this.kakekEntity = null;

    // Entitas di Dunia
    this.npcs = [];
    this.animals = [];
    this.collectibles = [];

    this.lastTime = 0;
    this.init();
  }

  setKakekVisible(visible) {
    this.kakekSpawned = !!visible;
    if (this.kakekEntity) {
      if (typeof this.kakekEntity.setVisible === "function") {
        this.kakekEntity.setVisible(visible);
      } else {
        this.kakekEntity.isActive = !!visible;
        if (this.kakekEntity.mesh) this.kakekEntity.mesh.visible = !!visible;
        if (this.kakekEntity.shadow) this.kakekEntity.shadow.visible = !!visible;
      }
    }
  }

  init() {
    // 1. Inisialisasi Dunia 3D Diorama
    this.world = new DioramaWorld(this.container);

    // 2. Inisialisasi Pemain di Halaman Depan Terbuka (Spawn di Area Lapang Menghadap ke Utara)
    this.player = new Player(this.world, 0, 6.5);

    // 3. Inisialisasi Pengelola Interaksi Tunggal
    this.interactionManager = new InteractionManager(this.world, this.player);

    // 4. Inisialisasi Photobooth System
    this.photobooth = new PhotoboothSystem();

    // 5. Inisialisasi UI & HUD
    this.ui = new UIManager(this);

    // 6. Spawn Entitas (NPC, Hewan, Item & Props)
    this.spawnEntities();

    // 7. Muat Progres Tersimpan dari localStorage
    this.loadProgress();

    // 8. Daftarkan Event Listener Keyboard & Tap
    this.setupDesktopControls();

    // 9. Mulai Loop Game Utama
    this.lastTime = performance.now();
    this.gameLoop = this.gameLoop.bind(this);
    requestAnimationFrame(this.gameLoop);
  }

  hasKeyInInventory() {
    return !!(this.hasHouseKey && Array.isArray(this.inventorySlots) && this.inventorySlots.some(s => s && s.id === "item_house_key"));
  }

  spawnEntities() {
    const cfg = window.GAME_CONFIG;

    // A. Warga Desa Ramah Sesuai Cerita & Dialog Dinamis (Total 12 Karakter)
    // 1. Paman Berkumis di Atas Jembatan Kayu (Frame 00:20 - Penghubung Quest 2)
    const paman = new NPC(this.world, "paman", cfg.npcs.paman, -11.75, 1.5, 0.22);
    paman.promptText = "[A] Bicara dengan Paman";
    paman.onInteract = () => {
      this.openNPCDialog("paman");
    };
    this.npcs.push(paman);
    this.interactionManager.register(paman);

    // 2. Kakek Bijak di Kebun Barat Dekat Gubuk & Pohon Rindang (Pemegang Kunci Rumah Titipan Nugua)
    const kakek = new NPC(this.world, "kakek", cfg.npcs.kakek, -16.5, -7.0, 0);
    this.kakekEntity = kakek;
    // Kakek Bijak TIDAK MUNCUL di awal! Hanya muncul setelah Pak RT Broto di api unggun diinteraksi
    this.setKakekVisible(this.kakekSpawned);
    kakek.promptText = "[A] Bicara dengan Kakek";
    kakek.onInteract = () => {
      if (!this.kakekSpawned || !kakek.isActive) return;
      this.openNPCDialog("kakek");
    };
    this.npcs.push(kakek);
    this.interactionManager.register(kakek);

    // 3. Nenek Minah di Sumur Tua Kebun Barat (Membasuh Sayur & Timba Air)
    const nenekMinah = new NPC(this.world, "nenek_minah", cfg.npcs.nenek_minah, -14.8, -3.2, 0);
    nenekMinah.promptText = "[A] Bicara dengan Nenek Minah";
    nenekMinah.onInteract = () => {
      this.openNPCDialog("nenek_minah");
    };
    this.npcs.push(nenekMinah);
    this.interactionManager.register(nenekMinah);

    // 4. Mas Bayu si Pemancing di Pinggir Sungai Dekat Jembatan
    const masBayu = new NPC(this.world, "mas_bayu", cfg.npcs.mas_bayu, -9.5, 0.5, 0.22);
    masBayu.promptText = "[A] Bicara dengan Mas Bayu";
    masBayu.onInteract = () => {
      this.openNPCDialog("mas_bayu");
    };
    this.npcs.push(masBayu);
    this.interactionManager.register(masBayu);

    // 5. Dito di Pelataran Main & Foto (Penghubung Quest 3)
    const dito = new NPC(this.world, "dito", cfg.npcs.dito, 8.2, -0.5, 0.06);
    dito.promptText = "[A] Bicara dengan Dito";
    dito.onInteract = () => {
      this.openNPCDialog("dito");
    };
    this.npcs.push(dito);
    this.interactionManager.register(dito);

    // 6. Adit (Bocah Cilik di Samping Mesin Arcade)
    const adit = new NPC(this.world, "adit", cfg.npcs.adit, 11.2, -0.5, 0.06);
    adit.promptText = "[A] Bicara dengan Adit";
    adit.onInteract = () => {
      this.openNPCDialog("adit");
    };
    this.npcs.push(adit);
    this.interactionManager.register(adit);

    // 7. Teh Sarah di Kebun Bunga Depan Tangga Teras
    const tehSarah = new NPC(this.world, "teh_sarah", cfg.npcs.teh_sarah, 3.5, -3.2, 0);
    tehSarah.promptText = "[A] Bicara dengan Teh Sarah";
    tehSarah.onInteract = () => {
      this.openNPCDialog("teh_sarah");
    };
    this.npcs.push(tehSarah);
    this.interactionManager.register(tehSarah);

    // 8. Bibi Rina di Teras Rumah (Perawat Bunga & Penjaga Rumah)
    const rina = new NPC(this.world, "rina", cfg.npcs.rina, 4.2, -8.8, 1.2);
    rina.promptText = "[A] Bicara dengan Bibi Rina";
    rina.onInteract = () => {
      this.openNPCDialog("rina");
    };
    this.npcs.push(rina);
    this.interactionManager.register(rina);

    // 9. Kumpul Warga di Area Api Unggun Timur Laut
    // Bu RT di dekat bangku selatan api unggun
    const buRt = new NPC(this.world, "bu_rt", cfg.npcs.bu_rt, 13.2, -9.2, 0);
    buRt.promptText = "[A] Bicara dengan Bu RT";
    buRt.onInteract = () => {
      this.openNPCDialog("bu_rt");
    };
    this.npcs.push(buRt);
    this.interactionManager.register(buRt);

    // 10. Pak RT Broto di dekat bangku timur api unggun (Penghubung Quest 4 -> Memicu Munculnya Kakek)
    const pakRt = new NPC(this.world, "pak_rt", cfg.npcs.pak_rt, 16.5, -11.5, 0);
    pakRt.promptText = "[A] Bicara dengan Pak RT Broto";
    pakRt.onInteract = () => {
      this.openNPCDialog("pak_rt");
    };
    this.npcs.push(pakRt);
    this.interactionManager.register(pakRt);

    // 11. Mbak Tari di dekat bangku barat laut api unggun
    const mbakTari = new NPC(this.world, "mbak_tari", cfg.npcs.mbak_tari, 12.5, -13.2, 0);
    mbakTari.promptText = "[A] Bicara dengan Mbak Tari";
    mbakTari.onInteract = () => {
      this.openNPCDialog("mbak_tari");
    };
    this.npcs.push(mbakTari);
    this.interactionManager.register(mbakTari);

    // 12. Mang Ujang di sisi utara api unggun (Menjaga Bara Api & Membakar Jagung)
    const mangUjang = new NPC(this.world, "mang_ujang", cfg.npcs.mang_ujang, 15.0, -13.5, 0);
    mangUjang.promptText = "[A] Bicara dengan Mang Ujang";
    mangUjang.onInteract = () => {
      this.openNPCDialog("mang_ujang");
    };
    this.npcs.push(mangUjang);
    this.interactionManager.register(mangUjang);

    // B. Hewan Peliharaan Berkeliaran Bebas di Halaman (Ayam & Kucing Oranye)
    const chicken1 = new RoamingAnimal(this.world, "chicken", "chicken1", cfg.animals.chicken1, 1.5, 4.5);
    chicken1.promptText = "[A] Elus Ayam";
    chicken1.onInteract = () => {
      window.soundSystem.playChicken();
      this.ui.openDialog(cfg.animals.chicken1.name, "Hewan Peliharaan Halaman", "🌾", `Petok petok! ${cfg.animals.chicken1.petMessage}`);
    };
    this.animals.push(chicken1);
    this.interactionManager.register(chicken1);

    const chicken2 = new RoamingAnimal(this.world, "chicken", "chicken2", cfg.animals.chicken2, -4.5, 2.5);
    chicken2.promptText = "[A] Elus Ayam";
    chicken2.onInteract = () => {
      window.soundSystem.playChicken();
      this.ui.openDialog(cfg.animals.chicken2.name, "Hewan Peliharaan Halaman", "🌾", `Kukuruyuk! ${cfg.animals.chicken2.petMessage}`);
    };
    this.animals.push(chicken2);
    this.interactionManager.register(chicken2);

    // Miko si Kucing Oranye
    const cat = new RoamingAnimal(this.world, "cat", "catOrange", cfg.animals.catOrange, -7.0, 2.5);
    cat.promptText = "[A] Elus Miko si Kucing";
    cat.onInteract = () => {
      window.soundSystem.playCatMeow();
      this.ui.openDialog(cfg.animals.catOrange.name, "Sahabat Berbulu Manja", "🐱", `Miko mendengkur hangat (purrr...) sambil menggosokkan kepalanya yang berbulu lembut ke tanganmu.\n\nMatanya terpejam nyaman saat dielus, seolah berkata bahwa Keyzha adalah orang favoritnya di desa ini!`);
    };
    this.animals.push(cat);
    this.interactionManager.register(cat);

    // C. Objek Interaktif Khusus
    // 1. Peti Kayu Pelataran dengan Surat Sambutan (Box Sambutan di Taman Depan Bawah: X = 0.5, Z = 5.2)
    const crateWithLetter = {
      x: 0.5,
      z: 5.2,
      y: 0.45,
      zone: "exterior",
      badgeHeight: 1.4,
      promptText: "[A] Baca Surat Sambutan",
      onInteract: () => {
        window.soundSystem.playClick();
        this.visitedWelcomeBox = true;
        this.ui.openLetter(cfg.openingLetter);
        if (this.currentQuestIndex === 1) {
          this.advanceQuest(2);
        }
      }
    };
    this.interactionManager.register(crateWithLetter);

    // 2. Mesin Arcade HEYTML PLAY (Quest 4 - Sisi Kiri Pelataran Deck: X = 9.5, Z = -1.5)
    const arcade = {
      x: 9.5,
      z: -0.5,
      y: 0.06,
      zone: "exterior",
      badgeHeight: 2.5,
      promptText: "[A] Main Arcade",
      onInteract: () => {
        window.soundSystem.playClick();
        this.ui.openArcade();
      }
    };
    this.interactionManager.register(arcade);

    // 3. Bilik Photobooth Studio (Quest 5 - Sisi Kanan Pelataran Deck: X = 14.5, Z = 0.2)
    const photobooth = {
      x: 14.5,
      z: 0.2,
      y: 0.06,
      zone: "exterior",
      badgeHeight: 2.6,
      promptText: "[A] Ambil Foto",
      onInteract: () => {
        window.soundSystem.playClick();
        this.ui.openPhotobooth();
      }
    };
    this.interactionManager.register(photobooth);

    // 3.5. Api Unggun Hangat Warga (Campfire di Halaman Timur Laut: X = 14.5, Z = -11.5)
    const campfire = {
      x: 14.5,
      z: -11.5,
      y: 0.2,
      zone: "exterior",
      badgeHeight: 1.8,
      promptText: "[A] Duduk & Hangatkan Diri di Api Unggun",
      onInteract: () => {
        window.soundSystem.playFireCrackle();
        this.ui.openDialog(
          "Api Unggun Hangat Warga",
          "Kumpul Warga Desa",
          "🔥",
          "Kamu duduk santai di dekat api unggun hangat bersama para warga desa.\n\nGemeretak kayu bakar dan aroma jagung bakar manis menyelimuti udara senja. Di sini, kebersamaan warga terasa begitu dekat dan menentramkan hati."
        );
      }
    };
    this.interactionManager.register(campfire);

    // 3.6. Kotak Surat Kayu (Letterbox di Sisi Barat Jalan Depan: X = -3.5, Z = 5.0)
    const letterbox = {
      x: -3.5,
      z: 5.0,
      y: 0.04,
      zone: "exterior",
      badgeHeight: 1.5,
      promptText: "[A] Periksa Kotak Surat",
      onInteract: () => {
        window.soundSystem.playClick();
        this.ui.openDialog(
          "Kotak Surat Kayu",
          "Secarik Kartu Pos Manis",
          "#b08968",
          "Ada secarik kartu pos bertuliskan tulisan tangan yang rapi:\n\n'Untuk Keyzha... Setiap sudut kecil di taman ini dibangun dengan penuh kehangatan. Semoga tempat ini selalu membuatmu tersenyum kapan pun kamu datang.'\n\n- Nugua"
        );
      }
    };
    this.interactionManager.register(letterbox);

    // 3.7. Papan Mading Informasi Desa (X = 5.5, Z = 6.2)
    const noticeBoard = {
      x: 5.5,
      z: 6.2,
      y: 0.04,
      zone: "exterior",
      badgeHeight: 2.2,
      promptText: "[A] Baca Mading Desa",
      onInteract: () => {
        window.soundSystem.playClick();
        if (this.hasKeyInInventory()) {
          this.ui.openDialog(
            "Mading Informasi Desa",
            "Catatan Hangat Warga",
            "#4a6b82",
            "📌 CATATAN HANGAT WARGA DESA:\n\n• Selamat untuk Keyzha! Seluruh warga desa ikut bahagia menyambut kejutan manis dari Nugua di dalam rumah kayu teras atas! ✨"
          );
        } else {
          this.ui.openDialog(
            "Mading Informasi Desa",
            "Pengumuman Warga",
            "#4a6b82",
            "📌 PENGUMUMAN WARGA TAMAN KECIL:\n\n• Suasana desa hari ini sangat tenang dan bersahabat.\n• Para warga sedang berkumpul santai di area api unggun timur laut.\n• Nikmati gemericik air sungai, udara sejuk kebun barat, dan keramahan warga desa!"
          );
        }
      }
    };
    this.interactionManager.register(noticeBoard);

    // 3.8. Sumur Tua Batu Air Segar di Kebun Barat (X = -16.5, Z = -3.0)
    const villageWell = {
      x: -16.5,
      z: -3.0,
      y: 0.4,
      zone: "exterior",
      badgeHeight: 1.8,
      promptText: "[A] Timba Air Sumur yang Segar",
      onInteract: () => {
        window.soundSystem.playWaterSplash();
        this.ui.openDialog(
          "Sumur Tua Kebun Barat",
          "Mata Air Alami Desa",
          "💧",
          "Kamu menarik timba kayu dari dalam sumur tua, lalu membasuh tangan dan wajahmu dengan air tanah yang begitu jernih dan dingin.\n\nKesegaran air alami ini seketika menyapu rasa lelahmu, meninggalkan rasa sejuk yang menyenangkan!"
        );
      }
    };
    this.interactionManager.register(villageWell);

    // 3.9. Keranjang Piknik Buah di Bangku Taman Depan (X = -4.8, Z = 4.5)
    const picnicBasket = {
      x: -4.8,
      z: 4.5,
      y: 0.5,
      zone: "exterior",
      badgeHeight: 1.4,
      promptText: "[A] Cicipi Apel Segar dari Keranjang",
      onInteract: () => {
        window.soundSystem.playCrunch();
        this.ui.openDialog(
          "Keranjang Piknik Buah",
          "Camilan Segar di Taman",
          "🍎",
          "Kamu membuka keranjang piknik dan mengambil sepotong apel merah segar.\n\nKriuk! Rasanya manis, renyah, dan berair. Apel ini tampak sengaja disiapkan dengan penuh perhatian untuk menemani jalan-jalanmu."
        );
      }
    };
    this.interactionManager.register(picnicBasket);

    // 3.10. Kotak Bunga Parapet Teras (X = -4.0, Z = -8.0, Y = 1.2)
    const terraceFlowers = {
      x: -4.0,
      z: -8.0,
      y: 1.2,
      zone: "exterior",
      badgeHeight: 2.2,
      promptText: "[A] Hirup Harum Bunga Aster & Mawar",
      onInteract: () => {
        window.soundSystem.playRustle();
        this.ui.openDialog(
          "Bunga Parapet Teras",
          "Taman Bunga Rumahan",
          "🌸",
          "Aroma manis bunga aster dan kelopak mawar teras tercium lembut di udara sore.\n\nKelopaknya bermekaran dengan anggun di sepanjang pagar teras, menyambut langkahmu dengan keindahan yang menenangkan."
        );
      }
    };
    this.interactionManager.register(terraceFlowers);

    // 3.11. Tepian Dermaga & Melempar Kerikil Sungai (X = -9.2, Z = 1.5, Y = 0.2)
    const riverOverlook = {
      x: -9.2,
      z: 1.5,
      y: 0.22,
      zone: "exterior",
      badgeHeight: 1.4,
      promptText: "[A] Lempar Kerikil & Nikmati Sungai",
      onInteract: () => {
        window.soundSystem.playWaterSplash();
        this.ui.openDialog(
          "Tepian Sungai Jembatan",
          "Suasana Alam yang Damai",
          "🌊",
          "Kamu mengambil kerikil kecil lalu melemparkannya ke aliran sungai yang jernih di bawah jembatan kayu.\n\nRiak airnya berputar lembut, memantulkan kilau cahaya senja yang tenang. Suara gemericik air membuat hatimu terasa begitu sejuk dan damai."
        );
      }
    };
    this.interactionManager.register(riverOverlook);

    // 3.12. Bangku Kayu Santai Taman Depan (X = -4.8, Z = 3.8, Y = 0.1)
    const parkBench = {
      x: -4.8,
      z: 3.8,
      y: 0.1,
      zone: "exterior",
      badgeHeight: 1.4,
      promptText: "[A] Duduk Santai di Bangku Taman",
      onInteract: () => {
        window.soundSystem.playClick();
        this.ui.openDialog(
          "Bangku Kayu Santai",
          "Sudut Beristirahat Taman",
          "🪑",
          "Kamu duduk sejenak di atas bangku kayu taman, menyandarkan punggung sambil menghela napas lega.\n\nDari sini, seluruh sudut diorama kecil ini tampak begitu cantik, asri, dan dipenuhi kehangatan."
        );
      }
    };
    this.interactionManager.register(parkBench);

    // 4. Pintu Depan Rumah Kayu di Atas Teras (Z = -10.4, Y = 1.2)
    const frontDoor = {
      x: 0,
      z: -10.4,
      y: 1.2,
      zone: "exterior",
      badgeHeight: 2.4,
      promptText: "[A] Periksa Pintu Rumah",
      onInteract: () => {
        if (this.hasKeyInInventory()) {
          this.enterHouse();
        } else {
          window.soundSystem.playDoorLocked();
          this.ui.openDialog(cfg.lockedDoorMessage.title, "Pondok Kayu", "#b08968", cfg.lockedDoorMessage.text);
        }
      }
    };
    this.frontDoorEntity = frontDoor;
    this.interactionManager.register(frontDoor);

    // 5. Keset Pintu Keluar Interior Rumah
    const interiorExitDoor = {
      x: 100.0,
      z: 104.2,
      y: 0,
      zone: "interior",
      badgeHeight: 1.4,
      promptText: "[A] Keluar ke Halaman",
      onInteract: () => {
        this.exitHouse();
      }
    };
    this.interiorExitDoorEntity = interiorExitDoor;
    this.interactionManager.register(interiorExitDoor);

    // 6. Meja Belajar & Kado Spesial di Dalam Rumah
    const studyTable = {
      x: 104.2,
      z: 98.0,
      y: 0.8,
      zone: "interior",
      badgeHeight: 2.0,
      promptText: "[A] Buka Kado Spesial",
      onInteract: () => {
        window.soundSystem.playChestOpen();
        this.ui.openLetter(cfg.closingLetter, true);
        this.closingLetterOpened = true;
        this.saveProgress();
        this.updateQuestUI();
      }
    };
    this.studyTableEntity = studyTable;
    this.interactionManager.register(studyTable);

    // 7. Kunci Rumah Kuningan dipegang oleh Kakek Bijak di gubuk kebun barat (Quest 5 - tidak ada kunci tercecer di tanah)

    // 8. Benda Kenangan Tambahan di Sekitar Taman
    const itemPositions = [
      { id: "item_ticket", x: -4.8, z: 4.5, y: 0.5 },
      { id: "item_polaroid", x: 15.5, z: 2.2, y: 0.5 },
      { id: "item_flower", x: 3.5, z: -4.5, y: 0.5 }
    ];

    itemPositions.forEach(pos => {
      const itemData = cfg.questItems.find(it => it.id === pos.id);
      if (itemData) {
        const itemObj = new CollectibleItem(this.world, itemData, pos.x, pos.z, pos.y);
        itemObj.zone = "exterior";
        itemObj.badgeHeight = 1.6;
        itemObj.promptText = `[A] Ambil ${itemData.name}`;
        itemObj.onInteract = () => {
          this.collectItem(itemObj);
        };
        this.collectibles.push(itemObj);
        this.interactionManager.register(itemObj);
      }
    });

    // 9. Foto Galeri Kenangan di Dinding Rumah Dalam (Nugua & Keyzha)
    if (cfg.wallPhotos && Array.isArray(cfg.wallPhotos)) {
      cfg.wallPhotos.forEach(p => {
        const photoItem = {
          id: p.id,
          x: p.interactX,
          z: p.interactZ,
          y: 0.8,
          zone: "interior",
          badgeHeight: 1.8,
          promptText: `[A] Lihat ${p.title}`,
          onInteract: () => {
            window.soundSystem.playClick();
            this.ui.openPhotoViewer(p);
          }
        };
        this.interactionManager.register(photoItem);
      });
    }
  }

  // --- KONTROL DESKTOP (KEYBOARD & KLIK TAP) ---
  setupDesktopControls() {
    window.addEventListener("keydown", (e) => {
      window.soundSystem.ensureContext();

      if (!this.isInputLocked) {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") this.input.left = true;
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") this.input.right = true;
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") this.input.up = true;
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") this.input.down = true;
      }

      // Tombol Interaksi (E, Enter, Spasi)
      if (e.key === "e" || e.key === "E" || e.key === "Enter" || e.key === " ") {
        if (this.ui.dialogModal.classList.contains("active")) {
          this.ui.advanceOrSkipDialog();
          return;
        }

        if (this.ui.letterModal.classList.contains("active")) {
          this.ui.closeLetter();
          return;
        }

        if (this.ui.photoModal && this.ui.photoModal.classList.contains("active")) {
          this.ui.closePhotoViewer();
          return;
        }

        if (this.isInputLocked) return;
        this.triggerInteraction();
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") this.input.left = false;
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") this.input.right = false;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") this.input.up = false;
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") this.input.down = false;
    });

    this.container.addEventListener("pointerdown", () => {
      window.soundSystem.ensureContext();
    });
  }

  triggerInteraction() {
    if (this.isInputLocked) return;
    this.interactionManager.trigger();
  }

  // --- SISTEM QUEST BERURUTAN (ALUR DESA & KEJUTAN NUGUA) ---

  updateQuestUI() {
    const qIndex = this.currentQuestIndex;
    let questInfo = {};

    if (qIndex === 1) {
      questInfo = {
        chapter: "BAB 1 : TAMAN KECIL",
        progress: "16%",
        step: "0 / 6",
        title: "Sebuah Undangan",
        subTitle: "01 · SEBUAH UNDANGAN",
        desc: "Buka dan baca surat sambutan di peti taman depan."
      };
    } else if (qIndex === 2) {
      questInfo = {
        chapter: "BAB 1 : TAMAN KECIL",
        progress: "33%",
        step: "1 / 6",
        title: "Tanyakan Paman",
        subTitle: "02 · TANYAKAN PAMAN",
        desc: "Sapa Paman di jembatan kayu barat untuk mencari petunjuk kunci."
      };
    } else if (qIndex === 3) {
      questInfo = {
        chapter: "BAB 1 : TAMAN KECIL",
        progress: "50%",
        step: "2 / 6",
        title: "Temui Dito di Arcade",
        subTitle: "03 · TEMUI DITO",
        desc: "Bicara dengan Dito di pelataran Main & Foto sebelah timur."
      };
    } else if (qIndex === 4) {
      questInfo = {
        chapter: "BAB 1 : TAMAN KECIL",
        progress: "66%",
        step: "3 / 6",
        title: "Arahan Pak RT",
        subTitle: "04 · ARAHAN PAK RT",
        desc: "Bicara dengan Pak RT Broto di area api unggun timur laut."
      };
    } else if (qIndex === 5) {
      questInfo = {
        chapter: "BAB 1 : TAMAN KECIL",
        progress: "83%",
        step: "4 / 6",
        title: "Kunci dari Kakek",
        subTitle: "05 · KUNCI DARI KAKEK",
        desc: "Temui Kakek Bijak di gubuk kebun barat untuk menerima kunci rumah."
      };
    } else if (qIndex >= 6) {
      questInfo = {
        chapter: "BAB 1 : TAMAN KECIL",
        progress: this.closingLetterOpened ? "100%" : "95%",
        step: this.closingLetterOpened ? "Selesai" : "5 / 6",
        title: "Kado Spesial Nugua",
        subTitle: "06 · BUKA PINTU RUMAH",
        desc: this.closingLetterOpened
          ? "Semua pesan cinta dari Nugua telah terbuka dengan penuh kehangatan."
          : "Naik ke teras rumah kayu, buka pintunya dengan kunci kuningan, dan periksa kado di meja belajar."
      };
    }

    this.ui.updateQuestTracker(questInfo);
    this.ui.updateInventoryBadge(this.collectedItems.length);
    this.ui.updateInventoryHUD(this.inventorySlots);
  }

  advanceQuest(toIndex) {
    if (toIndex > this.currentQuestIndex) {
      this.currentQuestIndex = toIndex;
      window.soundSystem.playQuestComplete();
      this.ui.showToast(`✨ Misi Diperbarui: ${this.currentQuestIndex}/6`);
      this.updateQuestUI();
      this.saveProgress();
    }
  }

  // --- SISTEM DIALOG PERCAKAPAN BERCABANG RPG & PENGULANGAN PETUNJUK (LOOPING CLUE) ---

  openNPCDialog(npcKey) {
    window.soundSystem.playClick();
    const cfg = window.GAME_CONFIG;
    const npc = cfg.npcs[npcKey];
    if (!npc) return;

    const options = [
      {
        icon: "💬",
        label: "Basa-basi & Cerita tentang Nugua",
        onSelect: () => this.showNPCOptionResponse(npcKey, "casual")
      },
      {
        icon: "🗝️",
        label: "Aku mau tanya, kunci rumah di mana ya?",
        isQuest: true,
        onSelect: () => this.showNPCOptionResponse(npcKey, "clue")
      },
      {
        icon: npc.avatarIcon || "✨",
        label: npc.topicOptionLabel || "Cerita topik menarik",
        onSelect: () => this.showNPCOptionResponse(npcKey, "topic")
      },
      {
        icon: "✕",
        label: "Pamit dulu ya, sampai jumpa!",
        className: "opt-close",
        onSelect: () => this.ui.closeDialog()
      }
    ];

    const greeting = npc.greeting || `Halo neng Keyzha! Senang sekali bertemu denganmu di sini. Ada yang ingin kamu tanyakan atau mau ngobrol santai?`;
    this.ui.openDialog(npc.name, npc.role, npc.avatarIcon || npc.avatarColor, greeting, options);
  }

  showNPCOptionResponse(npcKey, branch) {
    const cfg = window.GAME_CONFIG;
    const npc = cfg.npcs[npcKey];
    if (!npc) return;

    let responseText = "";

    if (branch === "casual") {
      responseText = npc.casualDialogue;
    } else if (branch === "topic") {
      responseText = npc.topicDialogue || npc.casualDialogue;
    } else if (branch === "clue") {
      // 1. Cek jika Keyzha sudah berhasil mengantongi Kunci Rumah Kuningan
      if (this.hasKeyInInventory()) {
        responseText = npc.postKeyDialogue || `Kunci rumah kuningan kan sudah berhasil kamu dapatkan dari Kakek Bijak, neng Keyzha! Lekaslah naik tangga ke teras rumah, mas Nugua sudah menyiapkan ruangan hangat dan hadiah spesial menunggumu di dalam!`;
      } else if (npcKey === "paman") {
        if (!this.visitedWelcomeBox) {
          responseText = `Paman senang sekali neng Keyzha sudah tiba di desa ini! Tapi sebelum mencari kunci rumah, coba periksa kotak surat kayu sambutan di pelataran depan dulu ya! Ada sepucuk pesan pembuka dari Nugua di sana.`;
        } else {
          // Petunjuk Paman (Bisa diulang-ulang kapan saja jika ditanya lagi)
          this.visitedPaman = true;
          if (this.currentQuestIndex === 2) {
            this.advanceQuest(3);
            responseText = npc.questDialogue;
          } else {
            responseText = npc.clueReminder || npc.questDialogue;
          }
        }
      } else if (npcKey === "dito") {
        if (!this.visitedPaman) {
          responseText = `Eh Keyzha manis, aslinya kamu lebih cantik daripada yang diceritain Nugua! Tapi kamu sudah sempat sapa Paman di jembatan seberang barat belum? Coba ngobrol sama Paman dulu di jembatan ya, biar alur ceritamu berurutan!`;
        } else {
          // Petunjuk Dito (Bisa diulang-ulang kapan saja jika ditanya lagi)
          this.visitedDito = true;
          if (this.currentQuestIndex === 3) {
            this.advanceQuest(4);
            responseText = npc.questDialogue;
          } else {
            responseText = npc.clueReminder || npc.questDialogue;
          }
        }
      } else if (npcKey === "pak_rt") {
        if (!this.visitedDito) {
          responseText = `Selamat sore neng Keyzha yang ayu. Pak RT senang sekali neng singgah ke sini. Tapi sebelum kita bahas rahasia desa, coba main ke pelataran arcade timur dulu dan sapa anak muda bernama Dito ya!`;
        } else {
          // Petunjuk Pak RT & memunculkan Kakek Bijak di gubuk kebun barat (Bisa diulang-ulang)
          this.visitedPakRt = true;
          this.setKakekVisible(true);
          if (this.currentQuestIndex === 4) {
            this.advanceQuest(5);
            responseText = npc.questDialogue;
          } else {
            responseText = npc.clueReminder || npc.questDialogue;
          }
        }
      } else if (npcKey === "kakek") {
        const allChecked = this.visitedWelcomeBox && this.visitedPaman && this.visitedDito && this.visitedPakRt;
        if (allChecked) {
          if (!this.hasHouseKey) {
            this.receiveHouseKeyFromKakek();
            if (this.currentQuestIndex === 5) {
              this.advanceQuest(6);
            }
            responseText = npc.questDialogue;
          } else {
            responseText = npc.clueReminder || npc.postKeyDialogue;
          }
        } else {
          // Checklist belum lengkap: tunjukkan secara ramah hal apa saja yang belum dikunjungi
          const missing = [];
          if (!this.visitedWelcomeBox) missing.push("membaca surat di kotak sambutan pelataran depan");
          if (!this.visitedPaman) missing.push("menyapa Paman di jembatan sungai barat");
          if (!this.visitedDito) missing.push("mengobrol dengan Dito di pelataran arcade timur");
          if (!this.visitedPakRt) missing.push("meminta arahan dari Pak RT Broto di api unggun timur laut");

          responseText = `Kakek tersenyum hangat... 'Taman ini luas dan penuh kehangatan nak Keyzha. Kakek memang memegang amanah kunci rumah dari mas Nugua, tapi sebelum Kakek serahkan, pastikan kamu sudah:\n\n• ${missing.join("\n• ")}\n\nSelesaikan langkah-langkah itu dulu ya cucuku manis, agar kejutan Nugua terasa berurutan dan berkesan!'`;
        }
      } else if (npcKey === "rina") {
        responseText = npc.clueReminder || `Pintu rumah kayu ini masih terkunci dengan gembok kuningan, Keyzha sayang. Nugua menitipkan kuncinya ke Kakek Bijak di gubuk kebun barat. Coba telusuri alur petunjuk dari Paman, Dito, dan Pak RT ya!`;
      } else {
        // Warga lainnya (bu_rt, mbak_tari, mang_ujang, nenek_minah, mas_bayu, teh_sarah, adit)
        responseText = npc.clueReminder || `Kunci rumah kuningan dititipkan mas Nugua ke sesepuh desa, Kakek Bijak di gubuk kebun barat! Telusuri langkahnya lewat Paman di jembatan, Dito di arcade, dan Pak RT di api unggun ya!`;
      }
    }

    // Sub-opsi setelah jawaban selesai:
    // Pemain bisa kembali memilih topik lain dari karakter ini (Looping!), atau selesai bicara
    const returnOptions = [
      {
        icon: "↩",
        label: `Tanya hal lain pada ${npc.name}`,
        className: "opt-return",
        onSelect: () => this.openNPCDialog(npcKey)
      },
      {
        icon: "✕",
        label: "Selesai bicara",
        className: "opt-close",
        onSelect: () => this.ui.closeDialog()
      }
    ];

    this.ui.openDialog(npc.name, npc.role, npc.avatarIcon || npc.avatarColor, responseText, returnOptions);
  }

  // Menambahkan item ke dalam 4 slot inventori
  addItemToInventory(item) {
    if (!item) return false;
    // Cek apakah item sudah ada di dalam salah satu slot
    const existingIndex = this.inventorySlots.findIndex(slot => slot && slot.id === item.id);
    if (existingIndex !== -1) {
      return true;
    }
    // Cari slot kosong pertama (maksimal 4 slot)
    const emptyIndex = this.inventorySlots.findIndex(slot => slot === null);
    if (emptyIndex !== -1) {
      this.inventorySlots[emptyIndex] = item;
      this.collectedItems = this.inventorySlots.filter(Boolean);
      this.ui.updateInventoryHUD(this.inventorySlots);
      this.ui.updateInventoryBadge(this.collectedItems.length);
      this.saveProgress();
      return true;
    } else {
      this.ui.showToast("⚠️ Kotak inventori penuh (maks 4 slot)!");
      return false;
    }
  }

  // Menerima Kunci Rumah dari Kakek Bijak di Gubuk Kebun Barat (Quest 5)
  receiveHouseKeyFromKakek() {
    if (this.hasHouseKey) return;
    this.hasHouseKey = true;
    this.houseUnlocked = true;
    if (this.frontDoorEntity) {
      this.frontDoorEntity.promptText = "[A] Masuk ke Dalam Rumah";
    }

    const keyData = window.GAME_CONFIG.houseKeyItem;
    this.addItemToInventory(keyData);
    window.soundSystem.playItemCollect();
    this.ui.showToast(`🗝️ Kakek Bijak memberikan "${keyData.name}"! Pintu rumah kini bisa dibuka.`);
    this.saveProgress();
  }

  // Kompatibilitas alias jika dipanggil dari tempat lain
  receiveHouseKeyFromPakRt() {
    this.receiveHouseKeyFromKakek();
  }

  collectItem(itemObj) {
    if (itemObj.collected) return;
    const added = this.addItemToInventory(itemObj.data);
    if (added) {
      itemObj.collect();
      window.soundSystem.playItemCollect();
      this.ui.showToast(`Ditemukan: "${itemObj.data.name}" ✨`);
      this.updateQuestUI();
    }
  }

  // Masuk ke dalam rumah dengan fade transisi halus
  enterHouse() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.isInputLocked = true;
    window.soundSystem.playDoorOpen();

    this.ui.triggerFadeTransition(() => {
      this.world.enterHouse(this.player);
      this.isInputLocked = false;
      this.isTransitioning = false;
      this.ui.showToast("Memasuki ruang tamu pondok yang hangat 🏡");
      if (this.currentQuestIndex >= 5) {
        this.advanceQuest(6);
      }
    });
  }

  // Keluar dari dalam rumah kembali ke halaman
  exitHouse() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.isInputLocked = true;
    window.soundSystem.playDoorOpen();

    this.ui.triggerFadeTransition(() => {
      this.world.exitHouse(this.player);
      this.isInputLocked = false;
      this.isTransitioning = false;
      this.ui.showToast("Kembali ke halaman taman yang asri 🌿");
    });
  }

  onArcadeWin() {
    if (this.arcadeCompleted) return;
    this.arcadeCompleted = true;

    const rewardItem = {
      id: "coupon_arcade",
      name: window.GAME_CONFIG.arcadeConfig.rewardName,
      iconType: "coupon",
      summary: "Kupon hadiah spesial dari mesin arcade retro.",
      story: window.GAME_CONFIG.arcadeConfig.rewardDesc,
      color: "#e76f51"
    };
    this.addItemToInventory(rewardItem);
    this.saveProgress();

    setTimeout(() => {
      this.ui.arcadeModal.classList.remove("active");
      this.ui.updateModalState();
    }, 1200);
  }

  onPhotoboothPhotoTaken() {
    if (!this.photoTaken) {
      this.photoTaken = true;
      const photoItem = {
        id: "photo_polaroid",
        name: "Foto Polaroid Kenangan",
        iconType: "polaroid",
        summary: "Potret diorama hangat bersama stiker pilihan.",
        story: "Foto ini diabadikan di Photobooth taman sebagai penanda momen yang damai.",
        color: "#68d8d6"
      };
      this.addItemToInventory(photoItem);
      this.saveProgress();
    }
  }

  setTimeOfDay(time) {
    this.world.setTimeOfDay(time);
    this.saveProgress();
  }

  // --- LOCALSTORAGE PERSISTENCE & RESET PROGRESS ---

  saveProgress() {
    const data = {
      quest: this.currentQuestIndex,
      inventorySlots: this.inventorySlots ? this.inventorySlots.map(s => s ? s.id : null) : [],
      items: this.collectedItems.map(i => i.id),
      hasHouseKey: this.hasKeyInInventory(),
      houseUnlocked: this.houseUnlocked,
      arcadeCompleted: this.arcadeCompleted,
      photoTaken: this.photoTaken,
      closingLetterOpened: this.closingLetterOpened,
      timeOfDay: this.world ? this.world.timeOfDay : "afternoon",
      visitedWelcomeBox: !!this.visitedWelcomeBox,
      visitedPaman: !!this.visitedPaman,
      visitedDito: !!this.visitedDito,
      visitedPakRt: !!this.visitedPakRt,
      kakekSpawned: !!this.kakekSpawned
    };
    try {
      localStorage.setItem("taman_kecil_progress_v5", JSON.stringify(data));
    } catch (e) {
      console.warn("Gagal menyimpan ke localStorage", e);
    }
  }

  loadProgress() {
    // Hapus data simpanan lama agar tidak ada residu kunci lama
    try {
      localStorage.removeItem("taman_kecil_progress");
      localStorage.removeItem("taman_kecil_save_v2");
      localStorage.removeItem("taman_kecil_save_v3");
      localStorage.removeItem("taman_kecil_progress_v4");
    } catch (e) {}

    try {
      const raw = localStorage.getItem("taman_kecil_progress_v5");
      if (raw) {
        const data = JSON.parse(raw);
        this.currentQuestIndex = data.quest || 1;
        this.arcadeCompleted = !!data.arcadeCompleted;
        this.photoTaken = !!data.photoTaken;
        this.closingLetterOpened = !!data.closingLetterOpened;
        this.visitedWelcomeBox = !!data.visitedWelcomeBox;
        this.visitedPaman = !!data.visitedPaman;
        this.visitedDito = !!data.visitedDito;
        this.visitedPakRt = !!data.visitedPakRt;
        this.setKakekVisible(!!data.kakekSpawned);

        const cfg = window.GAME_CONFIG;
        const findItemDef = (id) => {
          if (id === "item_house_key") return cfg.houseKeyItem;
          const qItem = cfg.questItems.find(it => it.id === id);
          if (qItem) return qItem;
          if (id === "coupon_arcade") {
            return {
              id: "coupon_arcade",
              name: cfg.arcadeConfig.rewardName,
              iconType: "coupon",
              summary: "Kupon hadiah spesial dari mesin arcade retro.",
              story: cfg.arcadeConfig.rewardDesc,
              color: "#e76f51"
            };
          }
          if (id === "photo_polaroid") {
            return {
              id: "photo_polaroid",
              name: "Foto Polaroid Kenangan",
              iconType: "polaroid",
              summary: "Potret diorama hangat bersama stiker pilihan.",
              story: "Foto ini diabadikan di Photobooth taman sebagai penanda momen yang damai.",
              color: "#68d8d6"
            };
          }
          return null;
        };

        // Restore inventorySlots (4 slots)
        if (Array.isArray(data.inventorySlots)) {
          this.inventorySlots = [null, null, null, null];
          data.inventorySlots.slice(0, 4).forEach((itemId, idx) => {
            if (itemId) {
              const def = findItemDef(itemId);
              if (def) this.inventorySlots[idx] = def;
            }
          });
        }

        // SANITASI KETAT: Kunci kuningan HANYA boleh ada jika alur sudah mencapai Quest 6 (setelah diberikan Kakek)
        // dan SEMUA checkpoint berurutan terpenuhi:
        const allChecked = this.visitedWelcomeBox && this.visitedPaman && this.visitedDito && this.visitedPakRt;
        if (this.currentQuestIndex < 6 || !allChecked || !this.inventorySlots.some(s => s && s.id === "item_house_key")) {
          this.hasHouseKey = false;
          this.houseUnlocked = false;
          this.inventorySlots = this.inventorySlots.map(s => (s && s.id === "item_house_key" ? null : s));
        } else {
          this.hasHouseKey = true;
          this.houseUnlocked = true;
        }

        this.collectedItems = this.inventorySlots.filter(Boolean);

        if (this.frontDoorEntity) {
          this.frontDoorEntity.promptText = this.hasKeyInInventory() ? "[A] Masuk ke Dalam Rumah" : "[A] Periksa Pintu Rumah";
        }

        // Mark world collectibles as collected if held
        this.collectibles.forEach(c => {
          if (c.data && this.collectedItems.some(it => it.id === c.data.id)) {
            c.collect();
          }
        });

        if (data.timeOfDay && this.world) {
          this.world.setTimeOfDay(data.timeOfDay);
        }
      }
    } catch (e) {
      console.warn("Gagal membaca localStorage", e);
    }

    this.updateQuestUI();
  }

  resetProgress() {
    try {
      localStorage.removeItem("taman_kecil_progress");
      localStorage.removeItem("taman_kecil_save_v2");
      localStorage.removeItem("taman_kecil_save_v3");
      localStorage.removeItem("taman_kecil_progress_v4");
      localStorage.removeItem("taman_kecil_progress_v5");
    } catch (e) {}
    window.location.reload();
  }

  // --- GAME LOOP 60 FPS ---
  gameLoop(currentTime) {
    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;
    const time = currentTime * 0.001;

    // 1. Update Pemain (Sliding Collision & Follow Camera)
    this.player.update(delta, this.input, this.isInputLocked);

    // 2. Update NPC & Hewan
    this.npcs.forEach(npc => npc.update(time));
    this.animals.forEach(an => an.update(delta));

    // 3. Update Item Berkilau
    this.collectibles.forEach(col => col.update(time));

    // 4. Update Lingkungan (Goyangan pohon, air mengalir, perapian)
    this.world.updateEnvironment(delta, time);

    // 5. Cek Objek Terdekat untuk Prompt Kontekstual Tunggal & Badge 3D Mengambang
    if (!this.isInputLocked) {
      const nearest = this.interactionManager.update();
      if (nearest) {
        let promptText = nearest.promptText;
        if (!promptText) {
          if (nearest.config && nearest.config.name) {
            promptText = nearest.type === "chicken"
              ? `[A] Elus ${nearest.config.name}`
              : `[A] Bicara dengan ${nearest.config.name}`;
          } else {
            promptText = "[A] Interaksi";
          }
        }
        this.ui.updateContextPrompt(promptText);
        const screenPos = this.interactionManager.getScreenPosition(this.world.camera);
        this.ui.update3DPrompt(screenPos, promptText);
      } else {
        this.ui.updateContextPrompt(null);
        this.ui.update3DPrompt(null, null);
      }
    } else {
      this.ui.updateContextPrompt(null);
      this.ui.update3DPrompt(null, null);
    }

    // 6. Render Scene 3D
    this.world.render();

    requestAnimationFrame(this.gameLoop);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.gameApp = new GameApp();
});
