/**
 * ============================================================================
 * MINI-GAME ARCADE TETRIS (HEYTML PLAY) & RETRO PHOTOBOOTH
 * ============================================================================
 * Mengatur mini-game retro arcade Tetris kasual dengan grid 10x20, balok warna-warni,
 * kontrol sentuh & keyboard responsif, suara retro, serta photobooth pembuat
 * cetakan foto polaroid kenangan lengkap dengan stiker dan catatan personal.
 */

class ArcadeGame {
  constructor(canvasElement, onWinCallback) {
    this.canvas = canvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.onWin = onWinCallback;

    this.cols = 10;
    this.rows = 20;
    this.cellSize = 12; // Ukuran sel di layar canvas
    this.boardX = 130;  // Posisi X grid di canvas
    this.boardY = 10;   // Posisi Y grid di canvas

    this.grid = [];
    this.currentPiece = null;
    this.nextPiece = null;
    this.dropTimer = 0;
    this.dropInterval = 0.65; // Kecepatan turun santai & ramah pemain

    this.score = 0;
    this.linesCleared = 0;
    this.targetLines = window.GAME_CONFIG.arcadeConfig.targetLines || 2;
    this.isRunning = false;
    this.hasWon = false;
    this.lastTime = 0;

    // Tetromino Shapes
    this.shapes = {
      I: { matrix: [[1, 1, 1, 1]], color: "#00f0f0" },
      O: { matrix: [[1, 1], [1, 1]], color: "#ffd166" },
      T: { matrix: [[0, 1, 0], [1, 1, 1]], color: "#a000f0" },
      S: { matrix: [[0, 1, 1], [1, 1, 0]], color: "#06d6a0" },
      Z: { matrix: [[1, 1, 0], [0, 1, 1]], color: "#ef476f" },
      J: { matrix: [[1, 0, 0], [1, 1, 1]], color: "#118ab2" },
      L: { matrix: [[0, 0, 1], [1, 1, 1]], color: "#f77f00" }
    };
    this.shapeKeys = ["I", "O", "T", "S", "Z", "J", "L"];
  }

  start() {
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    this.score = 0;
    this.linesCleared = 0;
    this.hasWon = false;
    this.isRunning = true;
    this.dropTimer = 0;

    this.nextPiece = this.generatePiece();
    this.spawnPiece();

    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
  }

  generatePiece() {
    const key = this.shapeKeys[Math.floor(Math.random() * this.shapeKeys.length)];
    const def = this.shapes[key];
    return {
      type: key,
      matrix: def.matrix.map(row => [...row]),
      color: def.color,
      x: 3,
      y: 0
    };
  }

  spawnPiece() {
    this.currentPiece = this.nextPiece || this.generatePiece();
    this.nextPiece = this.generatePiece();
    this.currentPiece.x = Math.floor((this.cols - this.currentPiece.matrix[0].length) / 2);
    this.currentPiece.y = 0;

    // Cek jika saat spawn sudah tabrakan (papan penuh)
    if (this.checkCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.matrix)) {
      // Reset papan santai tanpa game over kejam
      this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(0));
    }
  }

  checkCollision(px, py, matrix) {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c]) {
          const newX = px + c;
          const newY = py + r;

          // Batas dinding & dasar
          if (newX < 0 || newX >= this.cols || newY >= this.rows) {
            return true;
          }
          // Cek isi grid jika newY >= 0
          if (newY >= 0 && this.grid[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  rotate() {
    if (!this.isRunning || this.hasWon || !this.currentPiece) return;
    const m = this.currentPiece.matrix;
    // Transpose + Reverse baris (90 derajat clockwise)
    const rotated = m[0].map((_, i) => m.map(row => row[i]).reverse());

    // Wall kick sederhana
    let offset = 0;
    if (this.checkCollision(this.currentPiece.x, this.currentPiece.y, rotated)) {
      offset = this.currentPiece.x > this.cols / 2 ? -1 : 1;
      if (this.checkCollision(this.currentPiece.x + offset, this.currentPiece.y, rotated)) {
        return; // Gagal putar jika terhimpit
      }
    }

    this.currentPiece.x += offset;
    this.currentPiece.matrix = rotated;
    if (window.soundSystem) window.soundSystem.playClick();
  }

  moveLeft() {
    if (!this.isRunning || this.hasWon || !this.currentPiece) return;
    if (!this.checkCollision(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.matrix)) {
      this.currentPiece.x -= 1;
      if (window.soundSystem) window.soundSystem.playClick();
    }
  }

  moveRight() {
    if (!this.isRunning || this.hasWon || !this.currentPiece) return;
    if (!this.checkCollision(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.matrix)) {
      this.currentPiece.x += 1;
      if (window.soundSystem) window.soundSystem.playClick();
    }
  }

  drop() {
    if (!this.isRunning || this.hasWon || !this.currentPiece) return;
    if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.matrix)) {
      this.currentPiece.y += 1;
      this.score += 2;
    } else {
      this.lockPiece();
    }
  }

  hardDrop() {
    if (!this.isRunning || this.hasWon || !this.currentPiece) return;
    while (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.matrix)) {
      this.currentPiece.y += 1;
      this.score += 4;
    }
    this.lockPiece();
    if (window.soundSystem) window.soundSystem.playClick();
  }

  lockPiece() {
    const p = this.currentPiece;
    for (let r = 0; r < p.matrix.length; r++) {
      for (let c = 0; c < p.matrix[r].length; c++) {
        if (p.matrix[r][c] && p.y + r >= 0) {
          this.grid[p.y + r][p.x + c] = p.color;
        }
      }
    }

    this.clearLines();
    this.spawnPiece();
  }

  clearLines() {
    let cleared = 0;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.grid[r].every(cell => cell !== 0)) {
        this.grid.splice(r, 1);
        this.grid.unshift(Array(this.cols).fill(0));
        cleared++;
        r++; // Periksa kembali baris yang sama setelah bergeser
      }
    }

    if (cleared > 0) {
      this.linesCleared += cleared;
      this.score += cleared * 100;
      if (window.soundSystem) window.soundSystem.playArcadeScore();

      if (this.linesCleared >= this.targetLines && !this.hasWon) {
        this.hasWon = true;
        if (window.soundSystem) window.soundSystem.playArcadeWin();
        setTimeout(() => {
          if (this.onWin) this.onWin();
        }, 1200);
      }
    }
  }

  loop(currentTime) {
    if (!this.isRunning) return;
    const delta = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    if (!this.hasWon) {
      this.dropTimer += delta;
      if (this.dropTimer >= this.dropInterval) {
        this.dropTimer = 0;
        this.drop();
      }
    }

    this.render();
    if (this.isRunning) {
      requestAnimationFrame(this.loop);
    }
  }

  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Background Arcade Retro Frame
    ctx.fillStyle = "#1b1424";
    ctx.fillRect(0, 0, w, h);

    // Header Marquee
    ctx.fillStyle = "#d62828";
    ctx.fillRect(10, 8, w - 20, 24);
    ctx.fillStyle = "#ffd166";
    ctx.font = "bold 11px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("★ HEYTML PLAY · TETRIS ★", w / 2, 20);

    // Kotak Grid Permainan (120 x 240 piksel)
    const gx = this.boardX;
    const gy = this.boardY + 28;
    const gw = this.cols * this.cellSize;
    const gh = this.rows * this.cellSize;

    ctx.fillStyle = "#0d1117";
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = "#2b3545";
    ctx.lineWidth = 2;
    ctx.strokeRect(gx, gy, gw, gh);

    // Garis Kisi Halus
    ctx.strokeStyle = "#161b22";
    ctx.lineWidth = 1;
    for (let c = 1; c < this.cols; c++) {
      ctx.beginPath();
      ctx.moveTo(gx + c * this.cellSize, gy);
      ctx.lineTo(gx + c * this.cellSize, gy + gh);
      ctx.stroke();
    }
    for (let r = 1; r < this.rows; r++) {
      ctx.beginPath();
      ctx.moveTo(gx, gy + r * this.cellSize);
      ctx.lineTo(gx + gw, gy + r * this.cellSize);
      ctx.stroke();
    }

    // Gambar Balok yang Sudah Terkunci di Grid
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c]) {
          this.drawCell(ctx, gx + c * this.cellSize, gy + r * this.cellSize, this.grid[r][c]);
        }
      }
    }

    // Gambar Balok Aktif yang Sedang Jatuh
    if (this.currentPiece) {
      const p = this.currentPiece;
      for (let r = 0; r < p.matrix.length; r++) {
        for (let c = 0; c < p.matrix[r].length; c++) {
          if (p.matrix[r][c] && p.y + r >= 0) {
            this.drawCell(ctx, gx + (p.x + c) * this.cellSize, gy + (p.y + r) * this.cellSize, p.color);
          }
        }
      }
    }

    // Panel Informasi Kiri
    ctx.textAlign = "left";
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px monospace";
    ctx.fillText("SKOR", 14, 48);
    ctx.fillStyle = "#ffd166";
    ctx.font = "bold 14px monospace";
    ctx.fillText(String(this.score), 14, 66);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px monospace";
    ctx.fillText("BARIS", 14, 94);
    ctx.fillStyle = "#06d6a0";
    ctx.font = "bold 14px monospace";
    ctx.fillText(`${this.linesCleared} / ${this.targetLines}`, 14, 112);

    // Panel Informasi Kanan: Balok Berikutnya (Next Piece)
    const nx = gx + gw + 14;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px monospace";
    ctx.fillText("NEXT", nx, 48);

    ctx.fillStyle = "#0d1117";
    ctx.fillRect(nx, 54, 56, 56);
    ctx.strokeStyle = "#2b3545";
    ctx.strokeRect(nx, 54, 56, 56);

    if (this.nextPiece) {
      const np = this.nextPiece;
      const offX = nx + (56 - np.matrix[0].length * 10) / 2;
      const offY = 54 + (56 - np.matrix.length * 10) / 2;
      for (let r = 0; r < np.matrix.length; r++) {
        for (let c = 0; c < np.matrix[r].length; c++) {
          if (np.matrix[r][c]) {
            ctx.fillStyle = np.color;
            ctx.fillRect(offX + c * 10, offY + r * 10, 9, 9);
          }
        }
      }
    }

    // Banner Kemenangan
    if (this.hasWon) {
      ctx.fillStyle = "rgba(13, 17, 23, 0.88)";
      ctx.fillRect(gx, gy + 80, gw, 60);
      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillText("HEBAT!", gx + gw / 2, gy + 104);
      ctx.fillStyle = "#ffffff";
      ctx.font = "9px monospace";
      ctx.fillText("Pesan Manis Terbuka!", gx + gw / 2, gy + 122);
    }
  }

  drawCell(ctx, x, y, color) {
    const s = this.cellSize;
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, s - 2, s - 2);

    // Bevel 3D Pixel Balok
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillRect(x + 1, y + 1, s - 2, 2);
    ctx.fillRect(x + 1, y + 1, 2, s - 2);

    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(x + 1, y + s - 3, s - 2, 2);
    ctx.fillRect(x + s - 3, y + 1, 2, s - 2);
  }
}

// --- PHOTOBOOTH VINTAGE POLAROID SYSTEM ---
class PhotoboothSystem {
  constructor() {
    this.selectedSticker = "✨ Momen Indah";
  }

  createPolaroid(webglCanvas, customNote = "") {
    const outCanvas = document.createElement("canvas");
    outCanvas.width = 440;
    outCanvas.height = 540;
    const ctx = outCanvas.getContext("2d");

    // 1. Kertas Foto Polaroid Krem Tua
    ctx.fillStyle = "#fcf9f2";
    ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);

    // Border lembut
    ctx.strokeStyle = "#e5ded0";
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, outCanvas.width - 3, outCanvas.height - 3);

    // 2. Foto 3D Tengah
    const photoX = 28;
    const photoY = 28;
    const photoW = 384;
    const photoH = 384;

    ctx.drawImage(webglCanvas, photoX, photoY, photoW, photoH);

    // Bingkai dalam foto
    ctx.strokeStyle = "#d4cbba";
    ctx.lineWidth = 1;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    // 3. Stiker Pilihan di Sudut Foto
    if (this.selectedSticker) {
      ctx.save();
      ctx.translate(photoX + photoW - 20, photoY + 28);
      ctx.rotate(0.08);

      ctx.fillStyle = "#ffd166";
      ctx.fillRect(-70, -14, 85, 26);
      ctx.strokeStyle = "#b88a14";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-70, -14, 85, 26);

      ctx.fillStyle = "#2c1c0e";
      ctx.font = "bold 11px -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.selectedSticker, -27, 0);
      ctx.restore();
    }

    // 4. Catatan Kaki Polaroid
    const noteText = customNote || "Di sudut taman diorama yang damai.";
    ctx.fillStyle = "#3e2716";
    ctx.font = "italic 15px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText(`"${noteText}"`, outCanvas.width / 2, 448);

    // Tanggal & Watermark
    ctx.fillStyle = "#8a7566";
    ctx.font = "11px -apple-system, sans-serif";
    ctx.fillText(`Taman Kecil · Untuk Keyzha dari Dimas`, outCanvas.width / 2, 492);

    return outCanvas.toDataURL("image/png");
  }
}

window.ArcadeGame = ArcadeGame;
window.PhotoboothSystem = PhotoboothSystem;
