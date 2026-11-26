/**
 * ============================================================================
 * PENGELOLA TAMPILAN PENGGUNA (HUD, MODAL, DIALOG & VIRTUAL JOYSTICK)
 * ============================================================================
 * Menyediakan antarmuka yang bersih, responsif untuk HP (mobile-first) dan
 * Desktop/PC, dengan penguncian input otomatis saat modal terbuka (agar karakter
 * tidak jalan sendiri di belakang layar), dan prompt interaksi tunggal.
 */

class UIManager {
  constructor(game) {
    this.game = game;

    // Elemen DOM HUD
    this.questTitleEl = document.getElementById("quest-title");
    this.questDescEl = document.getElementById("quest-desc");
    this.questStepEl = document.getElementById("quest-step");
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
    this.letterTitle = document.getElementById("letter-title");
    this.letterDate = document.getElementById("letter-date");
    this.letterGreeting = document.getElementById("letter-greeting");
    this.letterContent = document.getElementById("letter-content");
    this.letterCoupons = document.getElementById("letter-coupons");
    this.letterSignature = document.getElementById("letter-signature");

    this.inventoryModal = document.getElementById("modal-inventory");
    this.invListEl = document.getElementById("inventory-list");
    this.invDetailTitle = document.getElementById("inv-detail-title");
    this.invDetailSummary = document.getElementById("inv-detail-summary");
    this.invDetailStory = document.getElementById("inv-detail-story");

    this.arcadeModal = document.getElementById("modal-arcade");
    this.photoboothModal = document.getElementById("modal-photobooth");
    this.settingsModal = document.getElementById("modal-settings");

    // State Dialog Typewriter
    this.typewriterTimer = null;
    this.isTyping = false;
    this.fullDialogText = "";

    this.setupEventListeners();
    this.setupVirtualJoystick();
  }

  // Helper Penguncian Input Karakter saat Modal Terbuka
  updateModalState() {
    const isAnyModalActive = !!document.querySelector(".modal-overlay.active");
    this.game.isInputLocked = isAnyModalActive;

    // Reset input agar karakter berhenti bergerak
    if (isAnyModalActive) {
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
    // Tombol Waktu (Siang / Sore / Malam)
    const timeBtn = document.getElementById("btn-time");
    if (timeBtn) {
      timeBtn.addEventListener("click", () => {
        window.soundSystem.playClick();
        const nextTime = this.game.world.timeOfDay === "day" ? "dusk" : (this.game.world.timeOfDay === "dusk" ? "night" : "day");
        this.game.setTimeOfDay(nextTime);
        this.updateTimeButtonIcon(nextTime);
      });
    }

    // Tombol Audio / Mute
    const audioBtn = document.getElementById("btn-audio");
    if (audioBtn) {
      audioBtn.addEventListener("click", () => {
        const isMuted = window.soundSystem.toggleMute();
        audioBtn.innerHTML = isMuted ? "🔇" : "🔊";
        this.showToast(isMuted ? "Suara dimatikan" : "Suara aktif");
      });
    }

    // Tombol Musik BGM
    const bgmBtn = document.getElementById("btn-bgm");
    if (bgmBtn) {
      bgmBtn.addEventListener("click", () => {
        const playing = window.soundSystem.toggleBGM();
        bgmBtn.classList.toggle("active", playing);
        this.showToast(playing ? "Musik latar diputar 🎵" : "Musik latar dijeda");
      });
    }

    // Tombol Buka Inventory
    const invBtn = document.getElementById("btn-inventory");
    if (invBtn) {
      invBtn.addEventListener("click", () => {
        window.soundSystem.playClick();
        this.openInventory();
      });
    }

    // Tombol Pengaturan
    const settingsBtn = document.getElementById("btn-settings");
    if (settingsBtn) {
      settingsBtn.addEventListener("click", () => {
        window.soundSystem.playClick();
        this.openSettings();
      });
    }

    // Tombol Aksi Mobile "A" & Prompt Kontekstual
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

    // Tombol Lanjut Dialog
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

    // Tutup Modal via Tombol X
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

    // Reset Progress Game di Pengaturan
    const resetBtn = document.getElementById("btn-reset-progress");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        if (confirm("Apakah kamu yakin ingin mereset seluruh progres petualangan ini dari awal?")) {
          this.game.resetProgress();
        }
      });
    }
  }

  // --- VIRTUAL JOYSTICK MOBILE ---
  setupVirtualJoystick() {
    const zone = document.getElementById("joystick-zone");
    const knob = document.getElementById("joystick-knob");
    if (!zone || !knob) return;

    let touchId = null;
    let startX = 0;
    let startY = 0;
    const maxRadius = 38;

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

      const threshold = 10;
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
    if (this.questStepEl) this.questStepEl.innerText = questInfo.step;
    if (this.questTitleEl) this.questTitleEl.innerText = questInfo.title;
    if (this.questDescEl) this.questDescEl.innerText = questInfo.desc;
  }

  updateInventoryBadge(count) {
    if (this.invBadgeEl) {
      this.invBadgeEl.innerText = count;
      this.invBadgeEl.style.display = count > 0 ? "inline-block" : "none";
    }
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

  updateTimeButtonIcon(time) {
    const btn = document.getElementById("btn-time");
    if (!btn) return;
    if (time === "day") btn.innerHTML = "☀️";
    else if (time === "dusk") btn.innerHTML = "🌅";
    else btn.innerHTML = "🌙";
  }

  showToast(message) {
    if (!this.toastEl) return;
    this.toastEl.innerText = message;
    this.toastEl.classList.add("show");
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastEl.classList.remove("show");
    }, 2800);
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
    }, 28);
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

  // --- MODAL SURAT (SURAT PEMBUKA & SURAT PENUTUP PARCHMENT) ---

  openLetter(data, isClosing = false) {
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

  // --- MODAL INVENTORY ---

  openInventory() {
    this.invListEl.innerHTML = "";
    const items = this.game.collectedItems;

    if (items.length === 0) {
      this.invListEl.innerHTML = `<div class="empty-inv">Belum ada item kenangan yang terkumpul. Jelajahi taman untuk menemukannya!</div>`;
      this.invDetailTitle.innerText = "Pilih Item";
      this.invDetailSummary.innerText = "";
      this.invDetailStory.innerText = "Klik salah satu item kenangan untuk membaca catatan di baliknya.";
    } else {
      items.forEach((item, idx) => {
        const btn = document.createElement("button");
        btn.className = `inv-item-btn ${idx === 0 ? "active" : ""}`;
        btn.innerHTML = `<span class="inv-item-icon">⭐</span> ${item.name}`;
        btn.addEventListener("click", () => {
          document.querySelectorAll(".inv-item-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          this.showItemDetail(item);
        });
        this.invListEl.appendChild(btn);
      });
      this.showItemDetail(items[0]);
    }

    this.inventoryModal.classList.add("active");
    this.updateModalState();
  }

  showItemDetail(item) {
    this.invDetailTitle.innerText = item.name;
    this.invDetailSummary.innerText = item.summary || "";
    this.invDetailStory.innerText = item.story || item.desc || "";
  }

  // --- MODAL ARCADE ---

  openArcade() {
    this.arcadeModal.classList.add("active");
    this.updateModalState();

    const canvas = document.getElementById("arcade-canvas");
    if (!this.game.arcadeGame) {
      this.game.arcadeGame = new ArcadeGame(canvas, () => {
        this.game.onArcadeWin();
      });

      const leftBtn = document.getElementById("arcade-btn-left");
      const rightBtn = document.getElementById("arcade-btn-right");
      if (leftBtn && rightBtn) {
        leftBtn.addEventListener("touchstart", (e) => { e.preventDefault(); this.game.arcadeGame.moveLeft = true; });
        leftBtn.addEventListener("touchend", () => { this.game.arcadeGame.moveLeft = false; });
        rightBtn.addEventListener("touchstart", (e) => { e.preventDefault(); this.game.arcadeGame.moveRight = true; });
        rightBtn.addEventListener("touchend", () => { this.game.arcadeGame.moveRight = false; });
      }

      window.addEventListener("keydown", (e) => {
        if (!this.arcadeModal.classList.contains("active")) return;
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") this.game.arcadeGame.moveLeft = true;
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") this.game.arcadeGame.moveRight = true;
      });
      window.addEventListener("keyup", (e) => {
        if (!this.arcadeModal.classList.contains("active")) return;
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") this.game.arcadeGame.moveLeft = false;
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") this.game.arcadeGame.moveRight = false;
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
      a.download = `Kenangan-Diorama-${window.GAME_CONFIG.recipientName}.png`;
      a.click();
      this.showToast("Foto Polaroid berhasil disimpan ke perangkatmu! 📸");
    };
  }

  // --- MODAL SETTINGS ---

  openSettings() {
    this.settingsModal.classList.add("active");
    this.updateModalState();
  }
}

window.UIManager = UIManager;
