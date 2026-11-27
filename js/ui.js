/**
 * ============================================================================
 * PENGELOLA TAMPILAN PENGGUNA (HUD, MODAL, DIALOG, D-PAD & START SCREEN)
 * ============================================================================
 * Menyediakan antarmuka retro cream & dark brown persis video referensi:
 * - Start Screen Card pembuka dengan judul "Taman Kecil." dan tombol Mulai
 * - Top-Left Quest Tracker Box dengan progress bar & star badge
 * - Top-Right retro square buttons (Buku/Inventory, Suara, Pengaturan)
 * - Virtual Compass D-Pad & Tombol Aksi "A" di mobile
 * - 3D Projected Floating Contextual Badge mengambang tepat di atas objek
 * - Modal dialog typewriter, surat parchment, dan kontrol arcade Tetris
 */

class UIManager {
  constructor(game) {
    this.game = game;

    // Start Screen
    this.startScreenEl = document.getElementById("start-screen");

    // Elemen DOM HUD
    this.hudLayerEl = document.getElementById("hud-layer");
    this.questChapterEl = document.getElementById("quest-chapter");
    this.questProgressFillEl = document.getElementById("quest-progress-fill");
    this.questStepEl = document.getElementById("quest-step");
    this.questTitleEl = document.getElementById("quest-title");
    this.questSubTitleEl = document.getElementById("quest-sub-title");
    this.questDescEl = document.getElementById("quest-desc");

    this.promptBtnEl = document.getElementById("context-prompt");
    this.actionBtnEl = document.getElementById("btn-action");
    this.invBadgeEl = document.getElementById("inv-badge");
    this.toastEl = document.getElementById("toast");
    this.floatingPromptEl = document.getElementById("floating-prompt-3d");
    this.screenFadeEl = document.getElementById("screen-fade");

    // Modal DOM
    this.dialogModal = document.getElementById("modal-dialog");
    this.dialogAvatar = document.getElementById("dialog-avatar");
    this.dialogSpeaker = document.getElementById("dialog-speaker");
    this.dialogRole = document.getElementById("dialog-role");
    this.dialogText = document.getElementById("dialog-text");

    this.letterModal = document.getElementById("modal-letter");
    this.letterSealText = document.getElementById("letter-seal-text");
    this.letterTitle = document.getElementById("letter-title");
    this.letterDate = document.getElementById("letter-date");
    this.letterGreeting = document.getElementById("letter-greeting");
    this.letterContent = document.getElementById("letter-content");
    this.letterCoupons = document.getElementById("letter-coupons");
    this.letterSignature = document.getElementById("letter-signature");

    this.inventoryModal = document.getElementById("modal-inventory");
    this.invListEl = document.getElementById("inventory-slots-grid") || document.getElementById("inventory-list");
    this.invDetailTitle = document.getElementById("inv-detail-title");
    this.invDetailSummary = document.getElementById("inv-detail-summary");
    this.invDetailStory = document.getElementById("inv-detail-story");
    this.hudInventoryBox = document.getElementById("hud-inventory-box");

    this.arcadeModal = document.getElementById("modal-arcade");
    this.photoboothModal = document.getElementById("modal-photobooth");
    this.settingsModal = document.getElementById("modal-settings");
    this.photoModal = document.getElementById("modal-photo");
    this.photoViewerTitle = document.getElementById("photo-viewer-title");
    this.photoViewerSubtitle = document.getElementById("photo-viewer-subtitle");
    this.photoViewerImg = document.getElementById("photo-viewer-img");
    this.photoViewerCaption = document.getElementById("photo-viewer-caption");

    // State Dialog Typewriter
    this.typewriterTimer = null;
    this.isTyping = false;
    this.fullDialogText = "";

    this.setupEventListeners();
    this.setupVirtualJoystick();
  }

  // Penguncian Input Karakter saat Modal Terbuka
  updateModalState() {
    const isAnyModalActive = !!document.querySelector(".modal-overlay.active");
    const isStartActive = this.startScreenEl && !this.startScreenEl.classList.contains("hidden");
    this.game.isInputLocked = isAnyModalActive || isStartActive;

    if (this.game.isInputLocked) {
      this.game.input.left = false;
      this.game.input.right = false;
      this.game.input.up = false;
      this.game.input.down = false;
      if (this.floatingPromptEl) {
        this.floatingPromptEl.classList.remove("visible");
      }
    }
  }

  setupEventListeners() {
    // 1. Start Screen Buttons
    const startPlayBtn = document.getElementById("btn-start-play");
    if (startPlayBtn) {
      startPlayBtn.addEventListener("click", () => {
        window.soundSystem.ensureContext();
        window.soundSystem.playClick();
        if (this.startScreenEl) {
          this.startScreenEl.classList.add("hidden");
        }
        this.game.isInputLocked = false;
        if (!window.soundSystem.bgmPlaying) {
          window.soundSystem.toggleBGM();
        }
        this.showToast("Selamat datang di Taman Kecil! 🌿");
      });
    }

    const startSettingsBtn = document.getElementById("btn-start-settings");
    if (startSettingsBtn) {
      startSettingsBtn.addEventListener("click", () => {
        window.soundSystem.ensureContext();
        window.soundSystem.playClick();
        this.openSettings();
      });
    }

    const startMusicBtn = document.getElementById("btn-start-music");
    if (startMusicBtn) {
      startMusicBtn.addEventListener("click", () => {
        window.soundSystem.ensureContext();
        const playing = window.soundSystem.toggleBGM();
        startMusicBtn.innerHTML = playing ? "🎵 Musik: Nyala" : "🎵 Musik: Mati";
        this.showToast(playing ? "Musik latar diputar 🎵" : "Musik latar dijeda");
      });
    }

    // 2. Top Controls
    const invBtn = document.getElementById("btn-inventory");
    if (invBtn) {
      invBtn.addEventListener("click", () => {
        window.soundSystem.playClick();
        this.openInventory();
      });
    }

    if (this.hudInventoryBox) {
      this.hudInventoryBox.addEventListener("click", () => {
        window.soundSystem.playClick();
        this.openInventory();
      });
    }

    const audioBtn = document.getElementById("btn-audio");
    if (audioBtn) {
      audioBtn.addEventListener("click", () => {
        const isMuted = window.soundSystem.toggleMute();
        audioBtn.innerHTML = isMuted ? "🔇" : "🔊";
        this.showToast(isMuted ? "Suara dimatikan" : "Suara aktif 🔊");
      });
    }

    const settingsBtn = document.getElementById("btn-settings");
    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => {
        window.soundSystem.playClick();
        this.openSettings();
      });
    }

    // Pilihan Waktu di Pengaturan (Siang / Sore Senja / Malam)
    document.querySelectorAll(".btn-time-opt").forEach(btn => {
      btn.addEventListener("click", () => {
        window.soundSystem.playClick();
        const time = btn.getAttribute("data-time");
        this.game.setTimeOfDay(time);
        this.showToast(`Suasana diubah ke: ${btn.innerText}`);
      });
    });

    // 3. Tombol Aksi Mobile "A" & Prompt Kontekstual
    if (this.actionBtnEl) {
      this.actionBtnEl.addEventListener("touchstart", (e) => {
        e.preventDefault();
        window.soundSystem.ensureContext();
        this.game.triggerInteraction();
      });
      this.actionBtnEl.addEventListener("click", () => {
        window.soundSystem.ensureContext();
        this.game.triggerInteraction();
      });
    }

    if (this.promptBtnEl) {
      this.promptBtnEl.addEventListener("click", () => {
        window.soundSystem.ensureContext();
        this.game.triggerInteraction();
      });
    }

    // 4. Tombol Lanjut Dialog
    const dialogNextBtn = document.getElementById("dialog-next");
    if (dialogNextBtn) {
      dialogNextBtn.addEventListener("click", () => {
        if (this.isTyping) {
          this.skipTypewriter();
        } else {
          this.closeDialog();
        }
      });
    }

    // 5. Tombol Simpan Petunjuk di Surat
    const saveHintBtn = document.getElementById("btn-save-hint");
    if (saveHintBtn) {
      saveHintBtn.addEventListener("click", () => {
        window.soundSystem.playClick();
        this.closeLetter();
      });
    }

    // 6. Tutup Modal via Tombol X
    document.querySelectorAll(".modal-close").forEach(btn => {
      btn.addEventListener("click", (e) => {
        window.soundSystem.playClick();
        const modal = e.target.closest(".modal-overlay");
        if (modal) {
          modal.classList.remove("active");
          if (modal === this.arcadeModal && this.game.arcadeGame) {
            this.game.arcadeGame.stop();
          }
          this.updateModalState();
        }
      });
    });

    // 7. Reset Progres di Pengaturan
    const resetBtn = document.getElementById("btn-reset-progress");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Apakah kamu yakin ingin mengulang petualangan ini dari awal?")) {
          this.game.resetProgress();
        }
      });
    }
  }

  // --- VIRTUAL COMPASS D-PAD MOBILE ---
  setupVirtualJoystick() {
    const zone = document.getElementById("joystick-zone");
    const knob = document.getElementById("joystick-knob");
    if (!zone || !knob) return;

    let touchId = null;
    let startX = 0;
    let startY = 0;
    const maxRadius = 35;

    const handleStart = (clientX, clientY, id) => {
      if (this.game.isInputLocked) return;
      touchId = id;
      const rect = zone.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
      handleMove(clientX, clientY);
      window.soundSystem.ensureContext();
    };

    const handleMove = (clientX, clientY) => {
      if (this.game.isInputLocked) {
        handleEnd();
        return;
      }

      const dx = clientX - startX;
      const dy = clientY - startY;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);

      const clampedDist = Math.min(dist, maxRadius);
      const knobX = Math.cos(angle) * clampedDist;
      const knobY = Math.sin(angle) * clampedDist;

      knob.style.transform = `translate(${knobX}px, ${knobY}px)`;

      const threshold = 8;
      this.game.input.left = dx < -threshold;
      this.game.input.right = dx > threshold;
      this.game.input.up = dy < -threshold;
      this.game.input.down = dy > threshold;
    };

    const handleEnd = () => {
      touchId = null;
      knob.style.transform = `translate(0px, 0px)`;
      this.game.input.left = false;
      this.game.input.right = false;
      this.game.input.up = false;
      this.game.input.down = false;
    };

    zone.addEventListener("touchstart", (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      handleStart(t.clientX, t.clientY, t.identifier);
    }, { passive: false });

    window.addEventListener("touchmove", (e) => {
      if (touchId === null) return;
      for (let t of e.changedTouches) {
        if (t.identifier === touchId) {
          handleMove(t.clientX, t.clientY);
          break;
        }
      }
    }, { passive: true });

    window.addEventListener("touchend", (e) => {
      if (touchId === null) return;
      for (let t of e.changedTouches) {
        if (t.identifier === touchId) {
          handleEnd();
          break;
        }
      }
    });

    window.addEventListener("touchcancel", handleEnd);
  }

  // --- UPDATE TAMPILAN HUD ---

  updateQuestTracker(questInfo) {
    if (this.questChapterEl) this.questChapterEl.innerText = questInfo.chapter || "BAB 1 : TAMAN KECIL";
    if (this.questProgressFillEl) this.questProgressFillEl.style.width = questInfo.progress || "20%";
    if (this.questStepEl) this.questStepEl.innerText = questInfo.step;
    if (this.questTitleEl) this.questTitleEl.innerText = questInfo.title;
    if (this.questSubTitleEl) this.questSubTitleEl.innerText = questInfo.subTitle || "MISI AKTIF";
    if (this.questDescEl) this.questDescEl.innerText = questInfo.desc;
  }

  updateInventoryBadge(count) {
    if (this.invBadgeEl) {
      this.invBadgeEl.innerText = count;
      this.invBadgeEl.style.display = count > 0 ? "inline-flex" : "none";
    }
  }

  // Update Tampilan 4 Kotak HUD Inventori di Layar
  updateInventoryHUD(slots) {
    for (let i = 0; i < 4; i++) {
      const slotEl = document.getElementById(`hud-slot-${i}`);
      if (slotEl) {
        const item = slots && slots[i];
        const iconSpan = slotEl.querySelector(".slot-icon");
        if (item) {
          const icon = item.icon || (item.id === "item_house_key" ? "🗝️" : item.id === "item_ticket" ? "🎟️" : item.id === "item_polaroid" ? "📸" : (item.id === "coupon_arcade" ? "🕹️" : "🌸"));
          if (iconSpan) iconSpan.innerHTML = icon;
          slotEl.classList.add("filled");
        } else {
          if (iconSpan) iconSpan.innerHTML = "";
          slotEl.classList.remove("filled");
        }
      }
    }
    const count = slots ? slots.filter(Boolean).length : 0;
    this.updateInventoryBadge(count);
  }

  updateContextPrompt(promptText) {
    if (promptText && !this.game.isInputLocked) {
      this.promptBtnEl.innerText = promptText;
      this.promptBtnEl.classList.add("visible");
      this.actionBtnEl.classList.add("highlight");
    } else {
      this.promptBtnEl.classList.remove("visible");
      this.actionBtnEl.classList.remove("highlight");
    }
  }

  // Tampilkan badge interaksi 3D mengambang tajam di atas target
  update3DPrompt(screenPos, promptText) {
    if (!this.floatingPromptEl) return;
    if (promptText && screenPos && screenPos.visible && !this.game.isInputLocked) {
      this.floatingPromptEl.innerText = promptText;
      this.floatingPromptEl.style.left = `${Math.round(screenPos.x)}px`;
      this.floatingPromptEl.style.top = `${Math.round(screenPos.y)}px`;
      this.floatingPromptEl.classList.add("visible");
    } else {
      this.floatingPromptEl.classList.remove("visible");
    }
  }

  // Efek transisi fade hitam halus saat masuk / keluar rumah
  triggerFadeTransition(onMidpoint, onComplete) {
    const fadeEl = this.screenFadeEl || document.getElementById("screen-fade");
    if (!fadeEl) {
      if (onMidpoint) onMidpoint();
      if (onComplete) onComplete();
      return;
    }

    fadeEl.classList.add("active");
    setTimeout(() => {
      if (onMidpoint) onMidpoint();
      setTimeout(() => {
        fadeEl.classList.remove("active");
        if (onComplete) onComplete();
      }, 250);
    }, 450);
  }

  showToast(message) {
    if (!this.toastEl) return;
    this.toastEl.innerText = message;
    this.toastEl.classList.remove("show");
    void this.toastEl.offsetWidth; // Reflow untuk animasi spring halus
    this.toastEl.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.remove("show");
    }, 3200);
  }

  // --- MODAL DIALOG BERKARAKTER ---

  openDialog(speakerName, role, color, text) {
    this.dialogSpeaker.innerText = speakerName;
    this.dialogRole.innerText = role;
    this.dialogAvatar.style.backgroundColor = color;
    this.fullDialogText = text;
    this.dialogText.innerHTML = "";
    this.dialogModal.classList.add("active");
    this.updateModalState();

    this.isTyping = true;
    let idx = 0;
    clearInterval(this.typewriterTimer);
    this.typewriterTimer = setInterval(() => {
      if (idx < this.fullDialogText.length) {
        this.dialogText.innerHTML += this.fullDialogText[idx];
        if (idx % 2 === 0) window.soundSystem.playDialogueBlip(1.0);
        idx++;
      } else {
        this.isTyping = false;
        clearInterval(this.typewriterTimer);
      }
    }, 25);
  }

  skipTypewriter() {
    clearInterval(this.typewriterTimer);
    this.dialogText.innerHTML = this.fullDialogText;
    this.isTyping = false;
  }

  closeDialog() {
    clearInterval(this.typewriterTimer);
    this.dialogModal.classList.remove("active");
    this.updateModalState();
  }

  // --- MODAL SURAT (PARCHMENT WAX SEAL) ---

  openLetter(data, isClosing = false) {
    if (this.letterSealText) {
      this.letterSealText.innerText = data.badge || (isClosing ? "KADO & SURAT UTAMA" : "SEPUCUK SURAT UNTUKMU");
    }
    this.letterTitle.innerText = data.title;
    this.letterDate.innerText = data.date;
    this.letterGreeting.innerText = data.greeting;

    this.letterContent.innerHTML = "";
    data.paragraphs.forEach(p => {
      const pEl = document.createElement("p");
      pEl.innerText = p;
      this.letterContent.appendChild(pEl);
    });

    if (data.hint) {
      const hintEl = document.createElement("div");
      hintEl.className = "letter-hint";
      hintEl.style.cssText = "font-style: italic; color: #8c735d; margin-top: 8px; font-size: 12px;";
      hintEl.innerText = data.hint;
      this.letterContent.appendChild(hintEl);
    }

    this.letterCoupons.innerHTML = "";
    if (isClosing && data.coupons) {
      const cTitle = document.createElement("h4");
      cTitle.className = "coupons-heading";
      cTitle.innerText = data.couponsTitle;
      this.letterCoupons.appendChild(cTitle);

      data.coupons.forEach(c => {
        const item = document.createElement("div");
        item.className = "coupon-card";
        item.innerHTML = `
          <div class="coupon-code">${c.code}</div>
          <div class="coupon-title">${c.title}</div>
          <div class="coupon-desc">${c.desc}</div>
        `;
        this.letterCoupons.appendChild(item);
      });
    }

    this.letterSignature.innerText = `${data.signature || ""} \n${data.closingSender || data.closing || ""}`;
    this.letterModal.classList.add("active");
    this.updateModalState();
  }

  closeLetter() {
    this.letterModal.classList.remove("active");
    this.updateModalState();
  }

  // --- MODAL INVENTORY (KOTAK INVENTORI 4 SLOT) ---

  openInventory() {
    const slotsGrid = document.getElementById("inventory-slots-grid") || this.invListEl;
    slotsGrid.innerHTML = "";
    const slots = this.game.inventorySlots || [null, null, null, null];

    let firstFilledItem = null;

    for (let i = 0; i < 4; i++) {
      const item = slots[i];
      const slotCard = document.createElement("div");
      slotCard.className = `inv-slot-card ${item ? "filled" : "empty"}`;

      if (item) {
        if (!firstFilledItem) firstFilledItem = item;
        const icon = item.icon || (item.id === "item_house_key" ? "🗝️" : item.id === "item_ticket" ? "🎟️" : item.id === "item_polaroid" ? "📸" : (item.id === "coupon_arcade" ? "🕹️" : "🌸"));
        slotCard.innerHTML = `
          <div class="slot-badge-num">SLOT ${i + 1}</div>
          <div class="slot-card-icon">${icon}</div>
          <div class="slot-card-name">${item.name}</div>
        `;
        slotCard.addEventListener("click", () => {
          document.querySelectorAll(".inv-slot-card").forEach(c => c.classList.remove("active"));
          slotCard.classList.add("active");
          this.showItemDetail(item);
        });
      } else {
        slotCard.innerHTML = `
          <div class="slot-badge-num">SLOT ${i + 1}</div>
          <div class="slot-card-icon slot-card-empty-icon">◻</div>
          <div class="slot-card-name slot-card-empty-name">(Slot Kosong)</div>
        `;
        slotCard.addEventListener("click", () => {
          document.querySelectorAll(".inv-slot-card").forEach(c => c.classList.remove("active"));
          slotCard.classList.add("active");
          this.invDetailTitle.innerText = `Slot ${i + 1} (Kosong)`;
          this.invDetailSummary.innerText = "Slot ini masih kosong.";
          this.invDetailStory.innerText = "Jelajahi taman desa untuk mengumpulkan kenangan manis atau petunjuk dari Nugua dan warga desa.";
        });
      }
      slotsGrid.appendChild(slotCard);
    }

    if (firstFilledItem) {
      const firstCard = slotsGrid.querySelector(".inv-slot-card.filled");
      if (firstCard) firstCard.classList.add("active");
      this.showItemDetail(firstFilledItem);
    } else {
      this.invDetailTitle.innerText = "Kotak Inventori (4 Slot)";
      this.invDetailSummary.innerText = "Semua 4 slot saat ini masih kosong.";
      this.invDetailStory.innerText = "Buka surat sambutan di peti depan untuk memulai petualangan mencari kejutan dari Nugua!";
    }

    this.inventoryModal.classList.add("active");
    this.updateModalState();
  }

  showItemDetail(item) {
    this.invDetailTitle.innerText = item.name;
    this.invDetailSummary.innerText = item.summary || "";
    this.invDetailStory.innerText = item.story || item.desc || "";
  }

  // --- MODAL ARCADE TETRIS ---

  openArcade() {
    this.arcadeModal.classList.add("active");
    this.updateModalState();

    const canvas = document.getElementById("arcade-canvas");
    if (!this.game.arcadeGame) {
      this.game.arcadeGame = new ArcadeGame(canvas, () => {
        this.game.onArcadeWin();
      });

      // Kontrol Sentuh di Bawah Papan Layar (Sesuai Video Frame 00:40)
      const leftBtn = document.getElementById("arcade-btn-left");
      const rightBtn = document.getElementById("arcade-btn-right");
      const rotateBtn = document.getElementById("arcade-btn-rotate");
      const dropBtn = document.getElementById("arcade-btn-drop");

      if (leftBtn) {
        leftBtn.addEventListener("touchstart", (e) => { e.preventDefault(); this.game.arcadeGame.moveLeft(); });
        leftBtn.addEventListener("click", () => this.game.arcadeGame.moveLeft());
      }
      if (rightBtn) {
        rightBtn.addEventListener("touchstart", (e) => { e.preventDefault(); this.game.arcadeGame.moveRight(); });
        rightBtn.addEventListener("click", () => this.game.arcadeGame.moveRight());
      }
      if (rotateBtn) {
        rotateBtn.addEventListener("touchstart", (e) => { e.preventDefault(); this.game.arcadeGame.rotate(); });
        rotateBtn.addEventListener("click", () => this.game.arcadeGame.rotate());
      }
      if (dropBtn) {
        dropBtn.addEventListener("touchstart", (e) => { e.preventDefault(); this.game.arcadeGame.hardDrop(); });
        dropBtn.addEventListener("click", () => this.game.arcadeGame.hardDrop());
      }

      window.addEventListener("keydown", (e) => {
        if (!this.arcadeModal.classList.contains("active")) return;
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") this.game.arcadeGame.moveLeft();
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") this.game.arcadeGame.moveRight();
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") this.game.arcadeGame.rotate();
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") this.game.arcadeGame.drop();
        if (e.key === " ") this.game.arcadeGame.hardDrop();
      });
    }

    this.game.arcadeGame.start();
  }

  // --- MODAL PHOTOBOOTH ---

  openPhotobooth() {
    this.photoboothModal.classList.add("active");
    this.updateModalState();

    const previewEl = document.getElementById("photo-preview");
    const snapBtn = document.getElementById("btn-snap-photo");
    const saveBtn = document.getElementById("btn-save-photo");
    const noteInput = document.getElementById("photo-note-input");

    const stickerContainer = document.getElementById("photo-stickers");
    stickerContainer.innerHTML = "";
    window.GAME_CONFIG.photoboothConfig.stickers.forEach((stk, idx) => {
      const sBtn = document.createElement("button");
      sBtn.className = `sticker-tag ${idx === 0 ? "active" : ""}`;
      sBtn.innerText = stk;
      sBtn.addEventListener("click", () => {
        document.querySelectorAll(".sticker-tag").forEach(b => b.classList.remove("active"));
        sBtn.classList.add("active");
        this.game.photobooth.selectedSticker = stk;
      });
      stickerContainer.appendChild(sBtn);
    });

    let currentPhotoData = null;

    snapBtn.onclick = () => {
      window.soundSystem.playCameraFlash();
      const customNote = noteInput.value.trim();
      currentPhotoData = this.game.photobooth.createPolaroid(this.game.world.renderer.domElement, customNote);
      previewEl.src = currentPhotoData;
      previewEl.style.display = "block";
      saveBtn.style.display = "inline-block";

      this.game.onPhotoboothPhotoTaken();
    };

    saveBtn.onclick = () => {
      if (!currentPhotoData) return;
      window.soundSystem.playClick();
      const a = document.createElement("a");
      a.href = currentPhotoData;
      a.download = `Kenangan-Taman-Kecil-${window.GAME_CONFIG.recipientName}.png`;
      a.click();
      this.showToast("Foto Polaroid berhasil diunduh ke perangkatmu! 📸");
    };
  }

  // --- MODAL SETTINGS ---

  openSettings() {
    this.settingsModal.classList.add("active");
    this.updateModalState();
  }

  // --- MODAL VIEWER FOTO DINDING KENANGAN ---

  openPhotoViewer(photoData) {
    if (!this.photoModal || !photoData) return;
    if (this.photoViewerImg) this.photoViewerImg.src = photoData.image;
    if (this.photoViewerTitle) this.photoViewerTitle.innerText = photoData.title;
    if (this.photoViewerSubtitle) this.photoViewerSubtitle.innerText = photoData.subtitle || "Nugua & Keyzha";
    if (this.photoViewerCaption) this.photoViewerCaption.innerText = photoData.caption || "";
    this.photoModal.classList.add("active");
    this.updateModalState();
  }

  closePhotoViewer() {
    if (!this.photoModal) return;
    this.photoModal.classList.remove("active");
    this.updateModalState();
  }
}

window.UIManager = UIManager;
