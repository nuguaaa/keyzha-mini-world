/**
 * ============================================================================
 * LOGIKA UTAMA GAME, SISTEM QUEST & STATE MANAGEMENT
 * ============================================================================
 * Mengatur alur misi berurutan (Quest 1 - 5), penguncian input saat modal aktif,
 * loop game 60 FPS dengan Third-Person Follow Camera, dan auto-save localStorage.
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
    this.isInputLocked = false; // Mengunci pergerakan saat modal terbuka

    // State Progres Misi
    this.currentQuestIndex = 1;
    this.collectedItems = [];
    this.arcadeCompleted = false;
    this.photoTaken = false;
    this.closingLetterOpened = false;

    // Entitas di Dunia
    this.npcs = [];
    this.animals = [];
    this.collectibles = [];

    this.lastTime = 0;
    this.init();
  }

  init() {
    // 1. Inisialisasi Dunia 3D Diorama Luas
    this.world = new DioramaWorld(this.container);

    // 2. Inisialisasi Pemain di Halaman Depan
    this.player = new Player(this.world, -6, 6);

    // 3. Inisialisasi Pengelola Interaksi Tunggal
    this.interactionManager = new InteractionManager(this.world, this.player);

    // 4. Inisialisasi Photobooth
    this.photobooth = new PhotoboothSystem();

    // 5. Inisialisasi UI & HUD
    this.ui = new UIManager(this);

    // 6. Spawn Entitas (NPC, Hewan, Item)
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

    // 1. Tiga NPC Ramah
    const arga = new NPC(this.world, "arga", cfg.npcs.arga, -8.5, -4.5, 1.2);
    arga.onInteract = () => {
      this.ui.openDialog(cfg.npcs.arga.name, cfg.npcs.arga.role, cfg.npcs.arga.avatarColor, arga.getNextDialogue());
    };
    this.npcs.push(arga);
    this.interactionManager.register(arga);

    const rina = new NPC(this.world, "rina", cfg.npcs.rina, 6.5, 8.5, 0);
    rina.onInteract = () => {
      this.ui.openDialog(cfg.npcs.rina.name, cfg.npcs.rina.role, cfg.npcs.rina.avatarColor, rina.getNextDialogue());
    };
    this.npcs.push(rina);
    this.interactionManager.register(rina);

    const dito = new NPC(this.world, "dito", cfg.npcs.dito, 3.2, 5.0, 0);
    dito.onInteract = () => {
      this.ui.openDialog(cfg.npcs.dito.name, cfg.npcs.dito.role, cfg.npcs.dito.avatarColor, dito.getNextDialogue());
    };
    this.npcs.push(dito);
    this.interactionManager.register(dito);

    // 2. Hewan Peliharaan Bebas (Kucing & Ayam)
    const catOrange = new RoamingAnimal(this.world, "cat", "catOrange", cfg.animals.catOrange, -2, 3);
    catOrange.onInteract = () => {
      window.soundSystem.playMeow();
      this.ui.showToast(`🐾 ${cfg.animals.catOrange.petMessage}`);
    };
    this.animals.push(catOrange);
    this.interactionManager.register(catOrange);

    const catCalico = new RoamingAnimal(this.world, "cat", "catCalico", cfg.animals.catCalico, 2, 9);
    catCalico.onInteract = () => {
      window.soundSystem.playMeow();
      this.ui.showToast(`🐾 ${cfg.animals.catCalico.petMessage}`);
    };
    this.animals.push(catCalico);
    this.interactionManager.register(catCalico);

    const chicken1 = new RoamingAnimal(this.world, "chicken", "chicken", cfg.animals.chicken, -10, 8);
    chicken1.onInteract = () => {
      window.soundSystem.playChicken();
      this.ui.showToast(`🌾 ${cfg.animals.chicken.petMessage}`);
    };
    this.animals.push(chicken1);
    this.interactionManager.register(chicken1);

    // 3. Objek Interaktif Khusus
    // Kotak Pos (Quest 1)
    const mailbox = {
      x: -5.5,
      z: 2.8,
      promptText: "[A] Baca Surat di Kotak Pos",
      onInteract: () => {
        window.soundSystem.playClick();
        this.ui.openLetter(cfg.openingLetter);
        if (this.currentQuestIndex === 1) {
          this.advanceQuest(2);
        }
      }
    };
    this.interactionManager.register(mailbox);

    // Mesin Arcade (Quest 3)
    const arcade = {
      x: 5,
      z: 5,
      promptText: "[A] Mainkan Mesin Arcade",
      onInteract: () => {
        window.soundSystem.playClick();
        this.ui.openArcade();
      }
    };
    this.interactionManager.register(arcade);

    // Photobooth (Quest 4)
    const photobooth = {
      x: 9.5,
      z: 1.5,
      promptText: "[A] Masuk ke Photobooth",
      onInteract: () => {
        window.soundSystem.playClick();
        this.ui.openPhotobooth();
      }
    };
    this.interactionManager.register(photobooth);

    // Peti Hadiah Utama (Quest 5)
    const giftChest = {
      x: 0,
      z: -16.5,
      promptText: "[A] Buka Peti Hadiah Utama",
      onInteract: () => {
        window.soundSystem.playChestOpen();
        this.ui.openLetter(cfg.closingLetter, true);
        this.closingLetterOpened = true;
        this.saveProgress();
      }
    };
    this.interactionManager.register(giftChest);

    // 4. 4 Item Kenangan (Quest 2)
    const itemPositions = [
      { id: "item_ticket", x: -10.5, z: 2.5, y: 0.6 },
      { id: "item_polaroid", x: 10.5, z: 6.0, y: 0.6 },
      { id: "item_cassette", x: -3.2, z: -7.5, y: 1.4 },
      { id: "item_flower", x: 6.0, z: 12.0, y: 0.6 }
    ];

    itemPositions.forEach(pos => {
      const itemData = cfg.questItems.find(it => it.id === pos.id);
      if (itemData) {
        const itemObj = new CollectibleItem(this.world, itemData, pos.x, pos.z, pos.y);
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
        // Jika dialog sedang aktif, gunakan tombol untuk lanjut/tutup dialog
        if (this.ui.dialogModal.classList.contains("active")) {
          if (this.ui.isTyping) this.ui.skipTypewriter();
          else this.ui.closeDialog();
          return;
        }

        // Jangan picu objek dunia jika modal lain sedang terbuka
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

  // --- SISTEM QUEST BERURUTAN & PROGRES ---

  updateQuestUI() {
    const qIndex = this.currentQuestIndex;
    let questInfo = {};

    if (qIndex === 1) {
      questInfo = {
        step: "Misi 1 / 5",
        title: "Surat di Kotak Pos",
        desc: "Dekati kotak pos merah di dekat jalan masuk teras dan baca surat pembuka."
      };
    } else if (qIndex === 2) {
      const count = this.collectedItems.filter(i => i.id && i.id.startsWith("item_")).length;
      questInfo = {
        step: `Misi 2 / 5 (${count}/4)`,
        title: "Berburu Kenangan",
        desc: `Cari 4 benda kenangan yang tersebar di halaman taman (${count}/4 ditemukan).`
      };
    } else if (qIndex === 3) {
      questInfo = {
        step: "Misi 3 / 5",
        title: "Tantangan Arcade Retro",
        desc: "Mainkan mesin arcade tua dan capai skor 10 untuk membuka kupon rahasia."
      };
    } else if (qIndex === 4) {
      questInfo = {
        step: "Misi 4 / 5",
        title: "Potret di Photobooth",
        desc: "Abadikan kenangan diorama di bilik Photobooth sebelum menuju taman belakang."
      };
    } else if (qIndex === 5) {
      questInfo = {
        step: "Misi Utama Selesai",
        title: "Gazebo Taman Rahasia",
        desc: "Lewati gerbang bunga menuju gazebo belakang dan buka Peti Hadiah Utama!"
      };
    }

    this.ui.updateQuestTracker(questInfo);
    this.ui.updateInventoryBadge(this.collectedItems.length);
  }

  advanceQuest(toIndex) {
    if (toIndex > this.currentQuestIndex) {
      this.currentQuestIndex = toIndex;
      window.soundSystem.playQuestComplete();
      this.ui.showToast(`✨ Misi Diperbarui: ${this.currentQuestIndex}/5`);
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

    const memoryCount = this.collectedItems.filter(i => i.id && i.id.startsWith("item_")).length;
    if (memoryCount >= 4 && this.currentQuestIndex === 2) {
      setTimeout(() => {
        this.advanceQuest(3);
      }, 800);
    }
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

    this.world.openSecretGarden();

    setTimeout(() => {
      this.ui.arcadeModal.classList.remove("active");
      this.ui.updateModalState();
      this.advanceQuest(4);
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

      this.world.openSecretGarden();

      setTimeout(() => {
        this.advanceQuest(5);
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
      arcadeCompleted: this.arcadeCompleted,
      photoTaken: this.photoTaken,
      closingLetterOpened: this.closingLetterOpened,
      timeOfDay: this.world.timeOfDay
    };
    try {
      localStorage.setItem("diorama_progress", JSON.stringify(data));
    } catch (e) {
      console.warn("Gagal menyimpan ke localStorage", e);
    }
  }

  loadProgress() {
    try {
      const raw = localStorage.getItem("diorama_progress");
      if (raw) {
        const data = JSON.parse(raw);
        this.currentQuestIndex = data.quest || 1;
        this.arcadeCompleted = !!data.arcadeCompleted;
        this.photoTaken = !!data.photoTaken;
        this.closingLetterOpened = !!data.closingLetterOpened;

        if (Array.isArray(data.items)) {
          data.items.forEach(itemId => {
            const cObj = this.collectibles.find(c => c.data.id === itemId);
            if (cObj) {
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

        if (this.currentQuestIndex >= 4 || this.arcadeCompleted) {
          this.world.openSecretGarden();
        }

        if (data.timeOfDay) {
          this.world.setTimeOfDay(data.timeOfDay);
          this.ui.updateTimeButtonIcon(data.timeOfDay);
        }
      }
    } catch (e) {
      console.warn("Gagal membaca localStorage", e);
    }

    this.updateQuestUI();
  }

  resetProgress() {
    localStorage.removeItem("diorama_progress");
    window.location.reload();
  }

  // --- GAME LOOP 60 FPS ---
  gameLoop(currentTime) {
    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;
    const time = currentTime * 0.001;

    // 1. Update Pemain (dengan Third-Person Follow Camera & Input Lock)
    this.player.update(delta, this.input, this.isInputLocked);

    // 2. Update NPC & Hewan
    this.npcs.forEach(npc => npc.update(time));
    this.animals.forEach(an => an.update(delta));

    // 3. Update Item Berkilau
    this.collectibles.forEach(col => col.update(time));

    // 4. Update Lingkungan (Pohon goyang angin, air kolam, kupu-kupu, kunang-kunang)
    this.world.updateEnvironment(delta, time);

    // 5. Cek Objek Terdekat untuk Prompt Kontekstual Tunggal
    if (!this.isInputLocked) {
      const nearest = this.interactionManager.update();
      if (nearest) {
        let promptText = nearest.promptText;
        if (!promptText) {
          if (nearest.config && nearest.config.name) {
            promptText = nearest.type === "cat" || nearest.type === "chicken"
              ? `[A] Elus ${nearest.config.name}`
              : `[A] Bicara dengan ${nearest.config.name}`;
          } else {
            promptText = "[A] Interaksi";
          }
        }
        this.ui.updateContextPrompt(promptText);
      } else {
        this.ui.updateContextPrompt(null);
      }
    } else {
      this.ui.updateContextPrompt(null);
    }

    // 6. Render Scene 3D
    this.world.render();

    requestAnimationFrame(this.gameLoop);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  window.gameApp = new GameApp();
});
