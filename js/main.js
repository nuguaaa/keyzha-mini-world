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

  spawnEntities() {
    const cfg = window.GAME_CONFIG;

    // A. NPC Ramah Sesuai Video Referensi & Karakter Baru
    // 1. Paman Berkumis di Atas Jembatan Kayu (Frame 00:20 - Berdiri di Jembatan Lebar)
    const paman = new NPC(this.world, "paman", cfg.npcs.paman, -11.75, 1.5, 0.22);
    paman.promptText = "[A] Bicara";
    paman.onInteract = () => {
      window.soundSystem.playClick();
      this.ui.openDialog(cfg.npcs.paman.name, cfg.npcs.paman.role, cfg.npcs.paman.avatarColor, paman.getNextDialogue());
      if (this.currentQuestIndex === 3) {
        this.advanceQuest(4);
      }
    };
    this.npcs.push(paman);
    this.interactionManager.register(paman);

    // 2. Kakek Bijak di Kebun Barat Dekat Pohon Rindang (Frame 00:26)
    const kakek = new NPC(this.world, "kakek", cfg.npcs.kakek, -16.5, -7.0, 0);
    kakek.promptText = "[A] Bicara";
    kakek.onInteract = () => {
      window.soundSystem.playClick();
      this.ui.openDialog(cfg.npcs.kakek.name, cfg.npcs.kakek.role, cfg.npcs.kakek.avatarColor, kakek.getNextDialogue());
    };
    this.npcs.push(kakek);
    this.interactionManager.register(kakek);

    // 3. Dito di Pelataran Main & Foto (Dekat Mesin Arcade)
    const dito = new NPC(this.world, "dito", cfg.npcs.dito, 8.2, -0.5, 0.06);
    dito.promptText = "[A] Bicara";
    dito.onInteract = () => {
      window.soundSystem.playClick();
      this.ui.openDialog(cfg.npcs.dito.name, cfg.npcs.dito.role, cfg.npcs.dito.avatarColor, dito.getNextDialogue());
    };
    this.npcs.push(dito);
    this.interactionManager.register(dito);

    // 4. Bibi Rina di Teras Rumah (Perawat Bunga & Penjaga Rumah)
    const rina = new NPC(this.world, "rina", cfg.npcs.rina, 4.2, -8.8, 1.2);
    rina.promptText = "[A] Bicara";
    rina.onInteract = () => {
      window.soundSystem.playClick();
      this.ui.openDialog(cfg.npcs.rina.name, cfg.npcs.rina.role, cfg.npcs.rina.avatarColor, rina.getNextDialogue());
    };
    this.npcs.push(rina);
    this.interactionManager.register(rina);

    // B. Ayam Putih Riang Berkeliaran Bebas di Halaman (Sesuai Video)
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

    // 4. Pintu Depan Rumah Kayu di Atas Teras (Z = -10.4, Y = 1.2)
    const frontDoor = {
      x: 0,
      z: -10.4,
      y: 1.2,
      zone: "exterior",
      badgeHeight: 2.4,
      promptText: this.hasHouseKey ? "[A] Masuk ke Dalam Rumah" : "[A] Pintu Depan Terkunci",
      onInteract: () => {
        if (this.hasHouseKey || this.houseUnlocked) {
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

    // 7. Kunci Rumah Kuningan Tersembunyi di Kebun Barat Dekat Aliran Sungai (Quest 2)
    const keyData = cfg.houseKeyItem;
    const houseKeyObj = new CollectibleItem(this.world, keyData, -16.0, -10.5, 0.4);
    houseKeyObj.zone = "exterior";
    houseKeyObj.badgeHeight = 1.6;
    houseKeyObj.promptText = `[A] Ambil ${keyData.name}`;
    houseKeyObj.onInteract = () => {
      this.collectHouseKey(houseKeyObj);
    };
    this.houseKeyEntity = houseKeyObj;
    this.collectibles.push(houseKeyObj);
    this.interactionManager.register(houseKeyObj);

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

  // --- SISTEM QUEST BERURUTAN (PERSIS VIDEO REFERENSI) ---

  updateQuestUI() {
    const qIndex = this.currentQuestIndex;
    let questInfo = {};

    if (qIndex === 1) {
      questInfo = {
        chapter: "BAB 1 : PAKET 1",
        progress: "16%",
        step: "0 / 6",
        title: "Sebuah Undangan",
        subTitle: "01 · SEBUAH UNDANGAN",
        desc: "Baca surat di atas peti pelataran."
      };
    } else if (qIndex === 2) {
      questInfo = {
        chapter: "BAB 1 : PAKET 1",
        progress: "33%",
        step: "1 / 6",
        title: "Kunci Rumah Rahasia",
        subTitle: "02 · KUNCI RUMAH",
        desc: "Cari kunci kuningan tersembunyi dekat aliran air sungai."
      };
    } else if (qIndex === 3) {
      questInfo = {
        chapter: "BAB 1 : PAKET 1",
        progress: "50%",
        step: "2 / 6",
        title: "Sapa Sahabat Jembatan",
        subTitle: "03 · SAPA SAHABAT",
        desc: "Bicara dengan Paman di atas jembatan kayu."
      };
    } else if (qIndex === 4) {
      questInfo = {
        chapter: "BAB 1 : PAKET 1",
        progress: "66%",
        step: "3 / 6",
        title: "Tantangan Tetris Retro",
        subTitle: "04 · MAIN ARCADE",
        desc: "Mainkan mesin Tetris di pelataran Main & Foto."
      };
    } else if (qIndex === 5) {
      questInfo = {
        chapter: "BAB 1 : PAKET 1",
        progress: "83%",
        step: "4 / 6",
        title: "Potret di Photobooth",
        subTitle: "05 · ABADIKAN KENANGAN",
        desc: "Abadikan momen diorama di bilik Photobooth studio."
      };
    } else if (qIndex === 6) {
      questInfo = {
        chapter: "BAB 1 : TAMAN KECIL",
        progress: "100%",
        step: "Selesai",
        title: "Masuk ke Dalam Rumah",
        subTitle: "06 · KADO SPESIAL",
        desc: "Buka pintu rumah dan temukan kado spesial di ruang tamu."
      };
    }

    this.ui.updateQuestTracker(questInfo);
    this.ui.updateInventoryBadge(this.collectedItems.length);
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

  collectItem(itemObj) {
    if (itemObj.collected) return;
    itemObj.collect();

    this.collectedItems.push(itemObj.data);
    window.soundSystem.playItemCollect();
    this.ui.showToast(`Ditemukan: "${itemObj.data.name}" ✨`);
    this.updateQuestUI();
    this.saveProgress();
  }

  // Mengambil Kunci Rumah Kuningan
  collectHouseKey(itemObj) {
    if (itemObj.collected) return;
    itemObj.collect();

    this.hasHouseKey = true;
    this.houseUnlocked = true;
    if (this.frontDoorEntity) {
      this.frontDoorEntity.promptText = "[A] Masuk ke Dalam Rumah";
    }

    this.collectedItems.push(itemObj.data);
    window.soundSystem.playItemCollect();
    this.ui.showToast(`🗝️ Ditemukan: "${itemObj.data.name}"! Pintu rumah kini bisa dibuka.`);
    this.ui.updateInventoryBadge(this.collectedItems.length);

    if (this.currentQuestIndex === 2) {
      this.advanceQuest(3);
    }
    this.saveProgress();
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
      summary: "Kupon hadiah spesial dari mesin arcade retro.",
      story: window.GAME_CONFIG.arcadeConfig.rewardDesc
    };
    this.collectedItems.push(rewardItem);
    this.saveProgress();

    setTimeout(() => {
      this.ui.arcadeModal.classList.remove("active");
      this.ui.updateModalState();
      this.advanceQuest(5);
    }, 1200);
  }

  onPhotoboothPhotoTaken() {
    if (!this.photoTaken) {
      this.photoTaken = true;
      const photoItem = {
        id: "photo_polaroid",
        name: "Foto Polaroid Kenangan",
        summary: "Potret diorama hangat bersama stiker pilihan.",
        story: "Foto ini diabadikan di Photobooth taman sebagai penanda momen yang damai."
      };
      this.collectedItems.push(photoItem);
      this.saveProgress();

      setTimeout(() => {
        this.advanceQuest(6);
      }, 1000);
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
      items: this.collectedItems.map(i => i.id),
      hasHouseKey: this.hasHouseKey,
      houseUnlocked: this.houseUnlocked,
      arcadeCompleted: this.arcadeCompleted,
      photoTaken: this.photoTaken,
      closingLetterOpened: this.closingLetterOpened,
      timeOfDay: this.world.timeOfDay
    };
    try {
      localStorage.setItem("taman_kecil_progress", JSON.stringify(data));
    } catch (e) {
      console.warn("Gagal menyimpan ke localStorage", e);
    }
  }

  loadProgress() {
    try {
      const raw = localStorage.getItem("taman_kecil_progress");
      if (raw) {
        const data = JSON.parse(raw);
        this.currentQuestIndex = data.quest || 1;
        this.arcadeCompleted = !!data.arcadeCompleted;
        this.photoTaken = !!data.photoTaken;
        this.closingLetterOpened = !!data.closingLetterOpened;
        this.hasHouseKey = !!data.hasHouseKey;
        this.houseUnlocked = !!data.houseUnlocked;

        if (this.hasHouseKey && this.frontDoorEntity) {
          this.frontDoorEntity.promptText = "[A] Masuk ke Dalam Rumah";
        }

        if (Array.isArray(data.items)) {
          data.items.forEach(itemId => {
            const cObj = this.collectibles.find(c => c.data && c.data.id === itemId);
            if (itemId === "item_house_key") {
              this.hasHouseKey = true;
              this.houseUnlocked = true;
              if (this.houseKeyEntity) this.houseKeyEntity.collect();
              if (this.frontDoorEntity) this.frontDoorEntity.promptText = "[A] Masuk ke Dalam Rumah";
              if (!this.collectedItems.some(it => it.id === itemId)) {
                this.collectedItems.push(window.GAME_CONFIG.houseKeyItem);
              }
            } else if (cObj) {
              cObj.collect();
              if (!this.collectedItems.some(it => it.id === itemId)) {
                this.collectedItems.push(cObj.data);
              }
            } else if (itemId === "coupon_arcade") {
              this.collectedItems.push({
                id: "coupon_arcade",
                name: window.GAME_CONFIG.arcadeConfig.rewardName,
                summary: "Kupon hadiah spesial dari mesin arcade retro.",
                story: window.GAME_CONFIG.arcadeConfig.rewardDesc
              });
            } else if (itemId === "photo_polaroid") {
              this.collectedItems.push({
                id: "photo_polaroid",
                name: "Foto Polaroid Kenangan",
                summary: "Potret diorama hangat bersama stiker pilihan.",
                story: "Foto ini diabadikan di Photobooth taman sebagai penanda momen yang damai."
              });
            }
          });
        }

        if (data.timeOfDay) {
          this.world.setTimeOfDay(data.timeOfDay);
        }
      }
    } catch (e) {
      console.warn("Gagal membaca localStorage", e);
    }

    this.updateQuestUI();
  }

  resetProgress() {
    localStorage.removeItem("taman_kecil_progress");
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
