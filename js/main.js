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

    // Entitas di Dunia
    this.npcs = [];
    this.animals = [];
    this.collectibles = [];

    this.lastTime = 0;
    this.init();
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
      window.soundSystem.playClick();
      if (this.hasKeyInInventory()) {
        this.ui.openDialog(cfg.npcs.paman.name, cfg.npcs.paman.role, cfg.npcs.paman.avatarColor, cfg.npcs.paman.postKeyDialogue);
      } else if (this.currentQuestIndex === 2) {
        this.ui.openDialog(cfg.npcs.paman.name, cfg.npcs.paman.role, cfg.npcs.paman.avatarColor, cfg.npcs.paman.questDialogue);
        this.advanceQuest(3);
      } else {
        // Jika belum membaca surat pembuka atau melompat langkah: murni ngobrol santai biasa
        this.ui.openDialog(cfg.npcs.paman.name, cfg.npcs.paman.role, cfg.npcs.paman.avatarColor, cfg.npcs.paman.casualDialogue);
      }
    };
    this.npcs.push(paman);
    this.interactionManager.register(paman);

    // 2. Kakek Bijak di Kebun Barat Dekat Pohon Rindang
    const kakek = new NPC(this.world, "kakek", cfg.npcs.kakek, -16.5, -7.0, 0);
    kakek.promptText = "[A] Bicara dengan Kakek";
    kakek.onInteract = () => {
      window.soundSystem.playClick();
      const text = this.hasKeyInInventory() ? cfg.npcs.kakek.postKeyDialogue : cfg.npcs.kakek.casualDialogue;
      this.ui.openDialog(cfg.npcs.kakek.name, cfg.npcs.kakek.role, cfg.npcs.kakek.avatarColor, text);
    };
    this.npcs.push(kakek);
    this.interactionManager.register(kakek);

    // 3. Nenek Minah di Sumur Tua Kebun Barat (Membasuh Sayur & Timba Air)
    const nenekMinah = new NPC(this.world, "nenek_minah", cfg.npcs.nenek_minah, -14.8, -3.2, 0);
    nenekMinah.promptText = "[A] Bicara dengan Nenek Minah";
    nenekMinah.onInteract = () => {
      window.soundSystem.playClick();
      const text = this.hasKeyInInventory() ? cfg.npcs.nenek_minah.postKeyDialogue : cfg.npcs.nenek_minah.casualDialogue;
      this.ui.openDialog(cfg.npcs.nenek_minah.name, cfg.npcs.nenek_minah.role, cfg.npcs.nenek_minah.avatarColor, text);
    };
    this.npcs.push(nenekMinah);
    this.interactionManager.register(nenekMinah);

    // 4. Mas Bayu si Pemancing di Pinggir Sungai Dekat Jembatan
    const masBayu = new NPC(this.world, "mas_bayu", cfg.npcs.mas_bayu, -9.5, 0.5, 0.22);
    masBayu.promptText = "[A] Bicara dengan Mas Bayu";
    masBayu.onInteract = () => {
      window.soundSystem.playClick();
      const text = this.hasKeyInInventory() ? cfg.npcs.mas_bayu.postKeyDialogue : cfg.npcs.mas_bayu.casualDialogue;
      this.ui.openDialog(cfg.npcs.mas_bayu.name, cfg.npcs.mas_bayu.role, cfg.npcs.mas_bayu.avatarColor, text);
    };
    this.npcs.push(masBayu);
    this.interactionManager.register(masBayu);

    // 5. Dito di Pelataran Main & Foto (Penghubung Quest 3)
    const dito = new NPC(this.world, "dito", cfg.npcs.dito, 8.2, -0.5, 0.06);
    dito.promptText = "[A] Bicara dengan Dito";
    dito.onInteract = () => {
      window.soundSystem.playClick();
      if (this.hasKeyInInventory()) {
        this.ui.openDialog(cfg.npcs.dito.name, cfg.npcs.dito.role, cfg.npcs.dito.avatarColor, cfg.npcs.dito.postKeyDialogue);
      } else if (this.currentQuestIndex === 3) {
        this.ui.openDialog(cfg.npcs.dito.name, cfg.npcs.dito.role, cfg.npcs.dito.avatarColor, cfg.npcs.dito.questDialogue);
        this.advanceQuest(4);
      } else {
        // Jika dilewati (belum Quest 3): murni ngobrol santai seputar Tetris tanpa bocorkan alur
        this.ui.openDialog(cfg.npcs.dito.name, cfg.npcs.dito.role, cfg.npcs.dito.avatarColor, cfg.npcs.dito.casualDialogue);
      }
    };
    this.npcs.push(dito);
    this.interactionManager.register(dito);

    // 6. Adit (Bocah Cilik di Samping Mesin Arcade)
    const adit = new NPC(this.world, "adit", cfg.npcs.adit, 11.2, -0.5, 0.06);
    adit.promptText = "[A] Bicara dengan Adit";
    adit.onInteract = () => {
      window.soundSystem.playClick();
      const text = this.hasKeyInInventory() ? cfg.npcs.adit.postKeyDialogue : cfg.npcs.adit.casualDialogue;
      this.ui.openDialog(cfg.npcs.adit.name, cfg.npcs.adit.role, cfg.npcs.adit.avatarColor, text);
    };
    this.npcs.push(adit);
    this.interactionManager.register(adit);

    // 7. Teh Sarah di Kebun Bunga Depan Tangga Teras
    const tehSarah = new NPC(this.world, "teh_sarah", cfg.npcs.teh_sarah, 3.5, -3.2, 0);
    tehSarah.promptText = "[A] Bicara dengan Teh Sarah";
    tehSarah.onInteract = () => {
      window.soundSystem.playClick();
      const text = this.hasKeyInInventory() ? cfg.npcs.teh_sarah.postKeyDialogue : cfg.npcs.teh_sarah.casualDialogue;
      this.ui.openDialog(cfg.npcs.teh_sarah.name, cfg.npcs.teh_sarah.role, cfg.npcs.teh_sarah.avatarColor, text);
    };
    this.npcs.push(tehSarah);
    this.interactionManager.register(tehSarah);

    // 8. Bibi Rina di Teras Rumah (Perawat Bunga & Penjaga Rumah)
    const rina = new NPC(this.world, "rina", cfg.npcs.rina, 4.2, -8.8, 1.2);
    rina.promptText = "[A] Bicara dengan Bibi Rina";
    rina.onInteract = () => {
      window.soundSystem.playClick();
      if (this.hasKeyInInventory()) {
        this.ui.openDialog(cfg.npcs.rina.name, cfg.npcs.rina.role, cfg.npcs.rina.avatarColor, cfg.npcs.rina.questDialogue);
      } else {
        this.ui.openDialog(cfg.npcs.rina.name, cfg.npcs.rina.role, cfg.npcs.rina.avatarColor, cfg.npcs.rina.casualDialogue);
      }
    };
    this.npcs.push(rina);
    this.interactionManager.register(rina);

    // 9. Kumpul Warga di Area Api Unggun Timur Laut
    // Bu RT di dekat bangku selatan api unggun
    const buRt = new NPC(this.world, "bu_rt", cfg.npcs.bu_rt, 13.2, -9.2, 0);
    buRt.promptText = "[A] Bicara dengan Bu RT";
    buRt.onInteract = () => {
      window.soundSystem.playClick();
      const text = this.hasKeyInInventory() ? cfg.npcs.bu_rt.postKeyDialogue : cfg.npcs.bu_rt.casualDialogue;
      this.ui.openDialog(cfg.npcs.bu_rt.name, cfg.npcs.bu_rt.role, cfg.npcs.bu_rt.avatarColor, text);
    };
    this.npcs.push(buRt);
    this.interactionManager.register(buRt);

    // 10. Pak RT Broto di dekat bangku timur api unggun (Pemegang Kunci Titipan Nugua)
    const pakRt = new NPC(this.world, "pak_rt", cfg.npcs.pak_rt, 16.5, -11.5, 0);
    pakRt.promptText = "[A] Bicara dengan Pak RT Broto";
    pakRt.onInteract = () => {
      window.soundSystem.playClick();
      if (this.hasKeyInInventory()) {
        this.ui.openDialog(cfg.npcs.pak_rt.name, cfg.npcs.pak_rt.role, cfg.npcs.pak_rt.avatarColor, cfg.npcs.pak_rt.postKeyDialogue);
      } else if (this.currentQuestIndex === 4) {
        this.ui.openDialog(cfg.npcs.pak_rt.name, cfg.npcs.pak_rt.role, cfg.npcs.pak_rt.avatarColor, cfg.npcs.pak_rt.questDialogue);
        this.receiveHouseKeyFromPakRt();
        this.advanceQuest(5);
      } else {
        // Jika dilewati (belum Quest 4): pura-pura tidak tahu dan murni percakapan santai biasa
        this.ui.openDialog(cfg.npcs.pak_rt.name, cfg.npcs.pak_rt.role, cfg.npcs.pak_rt.avatarColor, cfg.npcs.pak_rt.casualDialogue);
      }
    };
    this.npcs.push(pakRt);
    this.interactionManager.register(pakRt);

    // 11. Mbak Tari di dekat bangku barat laut api unggun
    const mbakTari = new NPC(this.world, "mbak_tari", cfg.npcs.mbak_tari, 12.5, -13.2, 0);
    mbakTari.promptText = "[A] Bicara dengan Mbak Tari";
    mbakTari.onInteract = () => {
      window.soundSystem.playClick();
      const text = this.hasKeyInInventory() ? cfg.npcs.mbak_tari.postKeyDialogue : cfg.npcs.mbak_tari.casualDialogue;
      this.ui.openDialog(cfg.npcs.mbak_tari.name, cfg.npcs.mbak_tari.role, cfg.npcs.mbak_tari.avatarColor, text);
    };
    this.npcs.push(mbakTari);
    this.interactionManager.register(mbakTari);

    // 12. Mang Ujang di sisi utara api unggun (Menjaga Bara Api & Membakar Jagung)
    const mangUjang = new NPC(this.world, "mang_ujang", cfg.npcs.mang_ujang, 15.0, -13.5, 0);
    mangUjang.promptText = "[A] Bicara dengan Mang Ujang";
    mangUjang.onInteract = () => {
      window.soundSystem.playClick();
      const text = this.hasKeyInInventory() ? cfg.npcs.mang_ujang.postKeyDialogue : cfg.npcs.mang_ujang.casualDialogue;
      this.ui.openDialog(cfg.npcs.mang_ujang.name, cfg.npcs.mang_ujang.role, cfg.npcs.mang_ujang.avatarColor, text);
    };
    this.npcs.push(mangUjang);
    this.interactionManager.register(mangUjang);

    // B. Hewan Peliharaan Berkeliaran Bebas di Halaman (Ayam & Kucing Oranye)
    const chicken1 = new RoamingAnimal(this.world, "chicken", "chicken1", cfg.animals.chicken1, 1.5, 4.5);
    chicken1.promptText = "[A] Elus Ayam";
    chicken1.onInteract = () => {
      window.soundSystem.playChicken();
      this.ui.showToast(`🌾 ${cfg.animals.chicken1.petMessage}`);
    };
    this.animals.push(chicken1);
    this.interactionManager.register(chicken1);

    const chicken2 = new RoamingAnimal(this.world, "chicken", "chicken2", cfg.animals.chicken2, -4.5, 2.5);
    chicken2.promptText = "[A] Elus Ayam";
    chicken2.onInteract = () => {
      window.soundSystem.playChicken();
      this.ui.showToast(`🌾 ${cfg.animals.chicken2.petMessage}`);
    };
    this.animals.push(chicken2);
    this.interactionManager.register(chicken2);

    // Miko si Kucing Oranye
    const cat = new RoamingAnimal(this.world, "cat", "catOrange", cfg.animals.catOrange, -7.0, 2.5);
    cat.promptText = "[A] Elus Miko si Kucing";
    cat.onInteract = () => {
      window.soundSystem.playCatMeow();
      this.ui.showToast(`🐱 ${cfg.animals.catOrange.petMessage}`);
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
        this.ui.showToast("🔥 Kamu duduk santai di dekat api unggun hangat bersama para warga desa. Gemeretak kayu bakar dan aroma jagung manis membawa ketenangan mendalam.");
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
        this.ui.showToast("💧 Timba kayu ditarik ke atas sumur, membasuh tangan dan wajahmu dengan air tanah yang begitu jernih dan dingin. Badanmu terasa segar kembali!");
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
        this.ui.showToast("🍎 Kamu mencicipi sepotong apel merah yang manis dan renyah dari keranjang piknik. Rasanya begitu menyegarkan!");
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
        this.ui.showToast("🌸 Aroma manis bunga aster dan kelopak mawar teras tercium lembut di hidungmu, menenangkan hati.");
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
        this.ui.showToast("🌊 Kamu melempar kerikil kecil ke aliran sungai yang jernih di bawah jembatan. Riak-riak air beriak indah memantulkan cahaya senja yang damai.");
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
        this.ui.showToast("🪑 Kamu duduk sejenak di bangku kayu taman, memandangi panorama diorama kecil yang asri dan tenang.");
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
      }
    };
    this.studyTableEntity = studyTable;
    this.interactionManager.register(studyTable);

    // 7. Kunci Rumah Kuningan dipegang oleh Pak RT Broto (Quest 4 - tidak ada kunci tercecer di tanah)

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
          if (this.ui.isTyping) this.ui.skipTypewriter();
          else this.ui.closeDialog();
          return;
        }

        if (this.ui.letterModal.classList.contains("active")) {
          this.ui.closeLetter();
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
        title: "Kunci dari Pak RT",
        subTitle: "04 · KUNCI DARI PAK RT",
        desc: "Bicara dengan Pak RT Broto di area Api Unggun timur laut."
      };
    } else if (qIndex === 5) {
      questInfo = {
        chapter: "BAB 1 : TAMAN KECIL",
        progress: "83%",
        step: "4 / 6",
        title: "Buka Pintu Rumah",
        subTitle: "05 · BUKA PINTU RUMAH",
        desc: "Naik ke teras rumah kayu dan buka pintunya dengan kunci kuningan."
      };
    } else if (qIndex === 6) {
      questInfo = {
        chapter: "BAB 1 : TAMAN KECIL",
        progress: "100%",
        step: "Selesai",
        title: "Kado Spesial Nugua",
        subTitle: "06 · KADO DARI NUGUA",
        desc: "Buka kado dan surat penutup di meja belajar dalam rumah."
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

  // Menerima Kunci Rumah dari Pak RT (Quest 4)
  receiveHouseKeyFromPakRt() {
    if (this.hasHouseKey) return;
    this.hasHouseKey = true;
    this.houseUnlocked = true;
    if (this.frontDoorEntity) {
      this.frontDoorEntity.promptText = "[A] Masuk ke Dalam Rumah";
    }

    const keyData = window.GAME_CONFIG.houseKeyItem;
    this.addItemToInventory(keyData);
    window.soundSystem.playItemCollect();
    this.ui.showToast(`🗝️ Pak RT memberikan "${keyData.name}"! Pintu rumah kini bisa dibuka.`);
    this.saveProgress();
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
      timeOfDay: this.world ? this.world.timeOfDay : "afternoon"
    };
    try {
      localStorage.setItem("taman_kecil_progress_v4", JSON.stringify(data));
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
    } catch (e) {}

    try {
      const raw = localStorage.getItem("taman_kecil_progress_v4");
      if (raw) {
        const data = JSON.parse(raw);
        this.currentQuestIndex = data.quest || 1;
        this.arcadeCompleted = !!data.arcadeCompleted;
        this.photoTaken = !!data.photoTaken;
        this.closingLetterOpened = !!data.closingLetterOpened;

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

        // SANITASI KETAT: Kunci kuningan HANYA boleh ada jika alur sudah mencapai Quest 5 (setelah diberikan Pak RT)
        if (this.currentQuestIndex < 5 || !this.inventorySlots.some(s => s && s.id === "item_house_key")) {
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
