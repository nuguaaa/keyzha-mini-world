/**
 * ============================================================================
 * MINI-GAME ARCADE & PHOTOBOOTH RETRO
 * ============================================================================
 * Mengatur mini-game arcade "Tangkap Bintang Kenangan" berbasis Canvas 2D
 * dan Photobooth vintage pembuat foto polaroid retro dengan stiker kenangan.
 */

class ArcadeGame {
  constructor(canvasElement, onWinCallback) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.onWin = onWinCallback;

    this.isRunning = false;
    this.score = 0;
    this.targetScore = window.GAME_CONFIG.arcadeConfig.targetScore || 10;

    // Basket / Player
    this.playerX = 140;
    this.playerWidth = 44;
    this.playerHeight = 16;
    this.speed = 280;

    // Falling Objects
    this.items = [];
    this.spawnTimer = 0;

    // Input
    this.moveLeft = false;
    this.moveRight = false;

    this.lastTime = 0;
    this.hasWon = false;
  }

  start() {
    this.score = 0;
    this.hasWon = false;
    this.items = [];
    this.isRunning = true;
    this.playerX = (this.canvas.width - this.playerWidth) / 2;
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
  }

  loop(currentTime) {
    if (!this.isRunning) return;

    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(delta);
    this.render();

    if (this.isRunning) {
      requestAnimationFrame(this.loop);
    }
  }

  update(delta) {
    if (this.hasWon) return;

    // Gerak pemain
    if (this.moveLeft) {
      this.playerX -= this.speed * delta;
    }
    if (this.moveRight) {
      this.playerX += this.speed * delta;
    }

    // Batas layar
    if (this.playerX < 10) this.playerX = 10;
    if (this.playerX > this.canvas.width - this.playerWidth - 10) {
      this.playerX = this.canvas.width - this.playerWidth - 10;
    }

    // Spawn barang jatuh
    this.spawnTimer += delta;
    if (this.spawnTimer > 0.65) {
      this.spawnTimer = 0;
      const rand = Math.random();
      let type = "star";
      if (rand > 0.7) type = "heart";
      else if (rand < 0.25) type = "cloud";

      this.items.push({
        x: 20 + Math.random() * (this.canvas.width - 40),
        y: -10,
        speed: 120 + Math.random() * 60,
        type: type,
        size: type === "cloud" ? 22 : 16
      });
    }

    // Update item jatuh & deteksi tangkapan
    const basketY = this.canvas.height - 35;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.y += it.speed * delta;

      // Cek overlap dengan keranjang
      if (
        it.y + it.size >= basketY &&
        it.y <= basketY + this.playerHeight &&
        it.x + it.size >= this.playerX &&
        it.x <= this.playerX + this.playerWidth
      ) {
        // Tertangkap
        if (it.type === "star") {
          this.score += 1;
          if (window.soundSystem) window.soundSystem.playArcadeScore();
        } else if (it.type === "heart") {
          this.score += 2;
          if (window.soundSystem) window.soundSystem.playArcadeScore();
        } else if (it.type === "cloud") {
          this.score = Math.max(0, this.score - 1);
          if (window.soundSystem) window.soundSystem.playArcadeMiss();
        }

        this.items.splice(i, 1);

        // Cek Skor Menang
        if (this.score >= this.targetScore && !this.hasWon) {
          this.hasWon = true;
          if (window.soundSystem) window.soundSystem.playArcadeWin();
          setTimeout(() => {
            if (this.onWin) this.onWin();
          }, 1000);
        }
        continue;
      }

      // Hapus jika keluar layar
      if (it.y > this.canvas.height + 20) {
        this.items.splice(i, 1);
      }
    }
  }

  render() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    // Latar Belakang CRT Biru Gelap
    ctx.fillStyle = "#0c1021";
    ctx.fillRect(0, 0, w, h);

    // Garis Kisi Retro (Grid)
    ctx.strokeStyle = "rgba(42, 60, 110, 0.4)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Render Barang Jatuh
    this.items.forEach(it => {
      if (it.type === "star") {
        ctx.fillStyle = "#ffd166";
        // Bintang pixel
        ctx.fillRect(it.x - 2, it.y - 6, 4, 12);
        ctx.fillRect(it.x - 6, it.y - 2, 12, 4);
        ctx.fillRect(it.x - 4, it.y - 4, 8, 8);
      } else if (it.type === "heart") {
        ctx.fillStyle = "#ff4d6d";
        // Hati pixel
        ctx.fillRect(it.x - 5, it.y - 4, 4, 4);
        ctx.fillRect(it.x + 1, it.y - 4, 4, 4);
        ctx.fillRect(it.x - 6, it.y - 2, 12, 4);
        ctx.fillRect(it.x - 4, it.y + 2, 8, 3);
        ctx.fillRect(it.x - 2, it.y + 5, 4, 2);
      } else {
        // Awan mendung pixel
        ctx.fillStyle = "#6c757d";
        ctx.fillRect(it.x - 8, it.y - 2, 16, 8);
        ctx.fillRect(it.x - 5, it.y - 6, 10, 4);
        ctx.fillStyle = "#adb5bd";
        ctx.fillRect(it.x - 6, it.y - 4, 6, 4);
      }
    });

    // Render Keranjang Pemain
    const basketY = h - 35;
    ctx.fillStyle = "#06d6a0";
    ctx.fillRect(this.playerX, basketY, this.playerWidth, this.playerHeight);
    ctx.fillStyle = "#049669";
    ctx.fillRect(this.playerX + 2, basketY + 2, this.playerWidth - 4, this.playerHeight - 4);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(this.playerX + 4, basketY + 4, 4, 2);

    // Skor & Target HUD
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`SKOR: ${this.score} / ${this.targetScore}`, 16, 26);

    // Garis Scanline CRT
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }

    // Banner Menang
    if (this.hasWon) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(0, h / 2 - 40, w, 80);

      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 20px monospace";
      ctx.textAlign = "center";
      ctx.fillText("HEBAT! MISI SELESAI!", w / 2, h / 2 - 6);

      ctx.fillStyle = "#ffffff";
      ctx.font = "12px monospace";
      ctx.fillText("Kupon Spesial & Kunci Hadiah Terbuka!", w / 2, h / 2 + 18);
      ctx.textAlign = "left";
    }
  }
}

// --- PHOTOBOOTH KENANGAN RETRO (POLAROID MAKER) ---
class PhotoboothSystem {
  constructor() {
    this.savedPhotos = [];
    this.selectedSticker = "✨ Momen Indah";
  }

  createPolaroid(rendererCanvas, customNote = "") {
    const pCanvas = document.createElement("canvas");
    pCanvas.width = 400;
    pCanvas.height = 490;
    const ctx = pCanvas.getContext("2d");

    // 1. Kertas Foto Polaroid Putih Hangat
    ctx.fillStyle = "#fcfbfa";
    ctx.fillRect(0, 0, 400, 490);

    // Bayangan tepi tipis polaroid
    ctx.strokeStyle = "#e8e4df";
    ctx.lineWidth = 3;
    ctx.strokeRect(1, 1, 398, 488);

    // 2. Area Gambar Tangkapan 3D (Square Frame)
    const imgX = 25;
    const imgY = 25;
    const imgW = 350;
    const imgH = 350;

    // Ambil crop tengah dari WebGL render canvas
    if (rendererCanvas) {
      const srcW = rendererCanvas.width;
      const srcH = rendererCanvas.height;
      const cropSize = Math.min(srcW, srcH);
      const cropX = (srcW - cropSize) / 2;
      const cropY = (srcH - cropSize) / 2;

      ctx.drawImage(rendererCanvas, cropX, cropY, cropSize, cropSize, imgX, imgY, imgW, imgH);

      // Filter retro hangat lembut di atas foto
      ctx.fillStyle = "rgba(255, 235, 205, 0.15)";
      ctx.fillRect(imgX, imgY, imgW, imgH);

      // Vignette lembut di tepian foto
      const vGrad = ctx.createRadialGradient(
        imgX + imgW / 2,
        imgY + imgH / 2,
        imgW * 0.4,
        imgX + imgW / 2,
        imgY + imgH / 2,
        imgW * 0.72
      );
      vGrad.addColorStop(0, "rgba(0,0,0,0)");
      vGrad.addColorStop(1, "rgba(0,0,0,0.35)");
      ctx.fillStyle = vGrad;
      ctx.fillRect(imgX, imgY, imgW, imgH);
    }

    // 3. Stiker Kenangan di Sudut Foto
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.fillRect(imgX + 10, imgY + 12, 130, 26);
    ctx.strokeStyle = "#ffb703";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(imgX + 10, imgY + 12, 130, 26);

    ctx.fillStyle = "#264653";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText(this.selectedSticker, imgX + 18, imgY + 29);

    // 4. Catatan Kaki Polaroid (Teks Hangat & Tanggal)
    const note = customNote || window.GAME_CONFIG.photoboothConfig.defaultNote;
    const nameTag = `${window.GAME_CONFIG.recipientName} & ${window.GAME_CONFIG.senderName} • Taman Kenangan`;

    ctx.fillStyle = "#2b2d42";
    ctx.font = "italic 13px serif";
    ctx.fillText(`"${note}"`, 30, 410);

    ctx.fillStyle = "#8d99ae";
    ctx.font = "11px monospace";
    ctx.fillText(nameTag, 30, 440);

    const dateStr = new Date().toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    ctx.fillText(`📅 ${dateStr}`, 30, 460);

    const dataUrl = pCanvas.toDataURL("image/png");
    this.savedPhotos.push({
      dataUrl: dataUrl,
      date: dateStr,
      note: note
    });

    return dataUrl;
  }
}

window.ArcadeGame = ArcadeGame;
window.PhotoboothSystem = PhotoboothSystem;
