/**
 * ============================================================================
 * PROCEDURAL PIXEL-ART TEXTURE GENERATOR & CUSTOM ASSET LOADER
 * ============================================================================
 * Menyediakan fungsi pemuatan custom asset dari assets/ dengan auto-fallback
 * yang sepenuhnya aman jika file belum diisi, serta generator procedural
 * pixel-art beresolusi tinggi (64x64 / 128x128) dengan Three.js NearestFilter.
 */

class TextureGenerator {
  constructor() {
    this.cache = {};
    this.loader = new THREE.TextureLoader();
  }

  // --- LOADER CUSTOM ASET DENGAN AUTO-FALLBACK AMAN ---
  loadCustomSprite(path, fallbackFn, onLoaded) {
    if (!path) {
      const tex = fallbackFn();
      if (onLoaded) onLoaded(tex);
      return tex;
    }

    const initialTex = fallbackFn();

    this.loader.load(
      path,
      (customTexture) => {
        customTexture.magFilter = THREE.NearestFilter;
        customTexture.minFilter = THREE.NearestFilter;
        customTexture.generateMipmaps = false;
        if (onLoaded) onLoaded(customTexture);
      },
      undefined,
      () => {
        if (onLoaded) onLoaded(initialTex);
      }
    );

    return initialTex;
  }

  createCanvasTexture(width, height, drawFn) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    drawFn(ctx, width, height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  // --- TEKSTUR POHON MENJULANG TINGGI (KULIT KAYU BERTEKSTUR) ---

  // Kulit Kayu Batang Pohon Alami (Bark Texture)
  getBarkTexture() {
    if (this.cache.bark) return this.cache.bark;
    this.cache.bark = this.createCanvasTexture(32, 64, (ctx, w, h) => {
      // Dasar cokelat kayu tua
      ctx.fillStyle = "#3e2312";
      ctx.fillRect(0, 0, w, h);

      // Guratan alur kulit kayu vertikal
      const barkTones = ["#4a2c17", "#321b0d", "#5a361c", "#28150a"];
      for (let x = 0; x < w; x += 3) {
        ctx.fillStyle = barkTones[(x * 7) % barkTones.length];
        ctx.fillRect(x, 0, 2, h);
      }

      // Garis serat kayu bergelombang
      for (let i = 0; i < 40; i++) {
        const bx = Math.floor(Math.random() * (w - 2));
        const by = Math.floor(Math.random() * (h - 8));
        ctx.fillStyle = Math.random() > 0.5 ? "#5a361c" : "#241308";
        ctx.fillRect(bx, by, 2, 6 + Math.floor(Math.random() * 8));
      }

      // Sentuhan lumut kehijauan di bagian bawah batang
      ctx.fillStyle = "#3a5a24";
      for (let i = 0; i < 20; i++) {
        ctx.fillRect(Math.floor(Math.random() * w), h - 14 + Math.floor(Math.random() * 14), 2, 2);
      }
    });
    this.cache.bark.wrapS = THREE.RepeatWrapping;
    this.cache.bark.wrapT = THREE.RepeatWrapping;
    return this.cache.bark;
  }

  // --- TEKSTUR PERMUKAAN TANAH & ALAM ---

  // Rumput Subur HD-2D
  getGrassTexture() {
    if (this.cache.grass) return this.cache.grass;
    this.cache.grass = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#5c9442";
      ctx.fillRect(0, 0, w, h);

      const colors = ["#4e8235", "#68a649", "#78bc53", "#43732c", "#89cb62"];
      for (let i = 0; i < 320; i++) {
        const x = Math.floor(Math.random() * w);
        const y = Math.floor(Math.random() * h);
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(x, y, 1, 2);
      }

      for (let i = 0; i < 6; i++) {
        const cx = 6 + Math.floor(Math.random() * (w - 12));
        const cy = 6 + Math.floor(Math.random() * (h - 12));
        ctx.fillStyle = "#386623";
        ctx.fillRect(cx - 1, cy - 2, 3, 1);
        ctx.fillRect(cx - 2, cy - 1, 5, 3);
        ctx.fillRect(cx, cy + 2, 1, 2);
      }

      for (let i = 0; i < 7; i++) {
        const x = 4 + Math.floor(Math.random() * (w - 8));
        const y = 4 + Math.floor(Math.random() * (h - 8));
        const isYellow = Math.random() > 0.5;

        ctx.fillStyle = isYellow ? "#ffd166" : "#ffffff";
        ctx.fillRect(x, y - 1, 1, 3);
        ctx.fillRect(x - 1, y, 3, 1);

        ctx.fillStyle = isYellow ? "#e09f3e" : "#f4a261";
        ctx.fillRect(x, y, 1, 1);
      }
    });
    this.cache.grass.wrapS = THREE.RepeatWrapping;
    this.cache.grass.wrapT = THREE.RepeatWrapping;
    return this.cache.grass;
  }

  // Sisi Teras & Lapisan Tanah (Tanpa Peregangan)
  getSoilSideTexture() {
    if (this.cache.soilSide) return this.cache.soilSide;
    this.cache.soilSide = this.createCanvasTexture(32, 32, (ctx, w, h) => {
      // Rumput atas 4px
      ctx.fillStyle = "#4e8235";
      ctx.fillRect(0, 0, w, 4);

      // Tanah humus subur
      ctx.fillStyle = "#5c3d2e";
      ctx.fillRect(0, 4, w, 14);

      // Tanah lempung batu
      ctx.fillStyle = "#442b1f";
      ctx.fillRect(0, 18, w, 14);

      // Kerikil batu
      const rockColors = ["#8a705f", "#6f5a4c", "#3d2b23", "#b09a88"];
      for (let i = 0; i < 18; i++) {
        const rx = Math.floor(Math.random() * (w - 2));
        const ry = 6 + Math.floor(Math.random() * (h - 8));
        ctx.fillStyle = rockColors[Math.floor(Math.random() * rockColors.length)];
        ctx.fillRect(rx, ry, 2, 2);
      }
    });
    this.cache.soilSide.wrapS = THREE.RepeatWrapping;
    this.cache.soilSide.wrapT = THREE.RepeatWrapping;
    return this.cache.soilSide;
  }

  // Jalan Paving Batu
  getStonePathTexture() {
    if (this.cache.stonePath) return this.cache.stonePath;
    this.cache.stonePath = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#4a443b";
      ctx.fillRect(0, 0, w, h);

      const stoneGrid = [
        { x: 2, y: 2, w: 18, h: 12, c: "#9c9489" },
        { x: 23, y: 2, w: 22, h: 14, c: "#aba398" },
        { x: 48, y: 2, w: 14, h: 12, c: "#8e867b" },
        { x: 2, y: 16, w: 24, h: 14, c: "#b5ada2" },
        { x: 29, y: 18, w: 16, h: 12, c: "#958d82" },
        { x: 48, y: 16, w: 14, h: 15, c: "#a39c91" },
        { x: 2, y: 32, w: 17, h: 13, c: "#8b8378" },
        { x: 22, y: 32, w: 22, h: 14, c: "#aba398" },
        { x: 47, y: 33, w: 15, h: 13, c: "#999186" },
        { x: 2, y: 47, w: 20, h: 15, c: "#a8a095" },
        { x: 25, y: 48, w: 19, h: 14, c: "#8e867b" },
        { x: 47, y: 48, w: 15, h: 14, c: "#b2aaa0" }
      ];

      stoneGrid.forEach(s => {
        ctx.fillStyle = s.c;
        ctx.fillRect(s.x, s.y, s.w, s.h);

        ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
        ctx.fillRect(s.x, s.y, s.w, 2);
        ctx.fillRect(s.x, s.y, 2, s.h);

        ctx.fillStyle = "rgba(0, 0, 0, 0.32)";
        ctx.fillRect(s.x, s.y + s.h - 2, s.w, 2);
        ctx.fillRect(s.x + s.w - 2, s.y, 2, s.h);
      });

      ctx.fillStyle = "#5c8c38";
      ctx.fillRect(20, 14, 4, 3);
      ctx.fillRect(45, 28, 4, 4);
      ctx.fillRect(21, 46, 5, 2);
    });
    this.cache.stonePath.wrapS = THREE.RepeatWrapping;
    this.cache.stonePath.wrapT = THREE.RepeatWrapping;
    return this.cache.stonePath;
  }

  // Papan Kayu Teras
  getWoodDeckTexture() {
    if (this.cache.woodDeck) return this.cache.woodDeck;
    this.cache.woodDeck = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#8a5833";
      ctx.fillRect(0, 0, w, h);

      const plankHeight = 16;
      for (let y = 0; y < h; y += plankHeight) {
        ctx.fillStyle = "#3d2212";
        ctx.fillRect(0, y, w, 2);

        ctx.fillStyle = "#9c653d";
        ctx.fillRect(0, y + 2, w, 2);
        ctx.fillStyle = "#784b2a";
        ctx.fillRect(6, y + 6, 26, 2);
        ctx.fillRect(36, y + 10, 22, 2);

        ctx.fillStyle = "#2d180c";
        ctx.fillRect(4, y + 7, 2, 3);
        ctx.fillRect(w - 6, y + 7, 2, 3);
      }
    });
    this.cache.woodDeck.wrapS = THREE.RepeatWrapping;
    this.cache.woodDeck.wrapT = THREE.RepeatWrapping;
    return this.cache.woodDeck;
  }

  // Air Kolam
  getWaterTexture() {
    if (this.cache.water) return this.cache.water;
    this.cache.water = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#2b7ba8";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#4fa8db";
      for (let y = 4; y < h; y += 8) {
        for (let x = 0; x < w; x += 16) {
          ctx.fillRect(x + (y % 6), y, 8, 2);
        }
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.fillRect(8, 8, 5, 2);
      ctx.fillRect(36, 20, 6, 2);
      ctx.fillRect(18, 40, 5, 2);
    });
    this.cache.water.wrapS = THREE.RepeatWrapping;
    this.cache.water.wrapT = THREE.RepeatWrapping;
    return this.cache.water;
  }

  // --- TEKSTUR INTERIOR RUMAH ---

  // Lantai Kayu Parket Ruang Tamu (Interior Wood Flooring)
  getWoodFloorTexture() {
    if (this.cache.woodFloor) return this.cache.woodFloor;
    this.cache.woodFloor = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#a26a42";
      ctx.fillRect(0, 0, w, h);

      // Pola parket kayu hangat
      const rowH = 16;
      for (let y = 0; y < h; y += rowH) {
        ctx.fillStyle = "#633c24";
        ctx.fillRect(0, y, w, 2);

        const colW = 32;
        const offset = (y / rowH) % 2 === 0 ? 0 : 16;
        for (let x = offset; x < w; x += colW) {
          ctx.fillStyle = "#633c24";
          ctx.fillRect(x, y, 2, rowH);
        }

        ctx.fillStyle = "#b87b50";
        ctx.fillRect(0, y + 2, w, 1);
      }
    });
    this.cache.woodFloor.wrapS = THREE.RepeatWrapping;
    this.cache.woodFloor.wrapT = THREE.RepeatWrapping;
    return this.cache.woodFloor;
  }

  // Karpet Hangat Ruang Tamu (Cozy Living Room Rug)
  getInteriorRugTexture() {
    if (this.cache.rug) return this.cache.rug;
    this.cache.rug = this.createCanvasTexture(64, 48, (ctx, w, h) => {
      // Dasar merah marun hangat
      ctx.fillStyle = "#8b1e2f";
      ctx.fillRect(0, 0, w, h);

      // Border ornamen krem emas
      ctx.strokeStyle = "#e8c37d";
      ctx.lineWidth = 3;
      ctx.strokeRect(3, 3, w - 6, h - 6);

      // Motif berlian tengah
      ctx.fillStyle = "#c0392b";
      ctx.fillRect(16, 12, 32, 24);

      ctx.fillStyle = "#e8c37d";
      ctx.fillRect(28, 20, 8, 8);
      ctx.fillRect(30, 16, 4, 16);
      ctx.fillRect(24, 22, 16, 4);

      // Rumbai-rumbai putih di ujung kiri dan kanan
      ctx.fillStyle = "#f5f5f5";
      for (let y = 2; y < h; y += 4) {
        ctx.fillRect(0, y, 2, 2);
        ctx.fillRect(w - 2, y, 2, 2);
      }
    });
    return this.cache.rug;
  }

  // Dinding Interior Rumah
  getInteriorWallTexture() {
    if (this.cache.intWall) return this.cache.intWall;
    this.cache.intWall = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#fbf5eb"; // Wallpaper krem hangat
      ctx.fillRect(0, 0, w, h);

      // Motif garis vertikal pastel lembut
      ctx.fillStyle = "#f0e4d2";
      for (let x = 0; x < w; x += 8) {
        ctx.fillRect(x, 0, 3, h);
      }

      // Baseboard kayu cokelat di bawah
      ctx.fillStyle = "#5c371f";
      ctx.fillRect(0, h - 8, w, 8);
      ctx.fillStyle = "#3e2312";
      ctx.fillRect(0, h - 8, w, 2);
    });
    this.cache.intWall.wrapS = THREE.RepeatWrapping;
    this.cache.intWall.wrapT = THREE.RepeatWrapping;
    return this.cache.intWall;
  }

  // --- BANGUNAN & PROPS EKSTERIOR ---

  getHouseWallTexture() {
    if (this.cache.houseWall) return this.cache.houseWall;
    this.cache.houseWall = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#f3ead9";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#e2d7c2";
      for (let i = 0; i < 70; i++) {
        ctx.fillRect(Math.floor(Math.random() * w), Math.floor(Math.random() * h), 2, 2);
      }

      ctx.fillStyle = "#5c371f";
      ctx.fillRect(0, 0, 5, h);
      ctx.fillRect(w - 5, 0, 5, h);
      ctx.fillRect(0, 0, w, 5);
      ctx.fillRect(0, h - 5, w, 5);
    });
    this.cache.houseWall.wrapS = THREE.RepeatWrapping;
    this.cache.houseWall.wrapT = THREE.RepeatWrapping;
    return this.cache.houseWall;
  }

  getRoofTexture() {
    if (this.cache.roof) return this.cache.roof;
    this.cache.roof = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#b5482e";
      ctx.fillRect(0, 0, w, h);

      const tileH = 12;
      for (let y = 0; y < h; y += tileH) {
        ctx.fillStyle = "#6e2513";
        ctx.fillRect(0, y + tileH - 2, w, 2);

        ctx.fillStyle = "#d66245";
        ctx.fillRect(0, y, w, 2);

        const offset = (y / tileH) % 2 === 0 ? 0 : 8;
        for (let x = offset; x < w; x += 16) {
          ctx.fillStyle = "#6e2513";
          ctx.fillRect(x, y, 2, tileH);
        }
      }
    });
    this.cache.roof.wrapS = THREE.RepeatWrapping;
    this.cache.roof.wrapT = THREE.RepeatWrapping;
    return this.cache.roof;
  }

  // --- KARAKTER DETAIL TINGGI (192 x 256 px) ---
  getPlayerSpriteSheet() {
    if (this.cache.playerSheet) return this.cache.playerSheet;

    this.cache.playerSheet = this.createCanvasTexture(192, 256, (ctx, w, h) => {
      const fw = 64;
      const fh = 64;
      const directions = ["down", "up", "left", "right"];

      directions.forEach((dir, row) => {
        for (let frame = 0; frame < 3; frame++) {
          const ox = frame * fw;
          const oy = row * fh;

          const cx = ox + 32;
          const cy = oy + 32;
          const stepOffset = frame === 1 ? -3 : (frame === 2 ? 3 : 0);
          const bounce = (frame === 1 || frame === 2) ? -1 : 0;

          // 1. Kaki & Sepatu
          ctx.fillStyle = "#2c3e50";
          if (dir === "down" || dir === "up") {
            ctx.fillRect(cx - 9, cy + 12 + (frame === 1 ? -2 : 0) + bounce, 7, 12);
            ctx.fillRect(cx + 2, cy + 12 + (frame === 2 ? -2 : 0) + bounce, 7, 12);

            ctx.fillStyle = "#4a2e1b";
            ctx.fillRect(cx - 10, cy + 22 + (frame === 1 ? -2 : 0) + bounce, 9, 5);
            ctx.fillRect(cx + 2, cy + 22 + (frame === 2 ? -2 : 0) + bounce, 9, 5);
          } else {
            ctx.fillRect(cx - 4 + stepOffset, cy + 12 + bounce, 8, 12);
            ctx.fillStyle = "#4a2e1b";
            ctx.fillRect(cx - 6 + stepOffset, cy + 22 + bounce, 12, 5);
          }

          // 2. Jaket Hangat Mustard
          ctx.fillStyle = "#d47a28";
          ctx.fillRect(cx - 12, cy - 4 + bounce, 24, 18);
          ctx.fillStyle = "#b8631b";
          ctx.fillRect(cx - 12, cy + 10 + bounce, 24, 4);

          // Syal Marun Hangat
          ctx.fillStyle = "#9d0208";
          ctx.fillRect(cx - 11, cy - 6 + bounce, 22, 6);
          if (dir === "down") {
            ctx.fillRect(cx - 2, cy + bounce, 5, 10);
            ctx.fillStyle = "#ba181b";
            ctx.fillRect(cx - 1, cy + 1 + bounce, 3, 8);
          }

          // Tas Ransel
          if (dir === "up") {
            ctx.fillStyle = "#556b2f";
            ctx.fillRect(cx - 10, cy - 2 + bounce, 20, 16);
            ctx.fillStyle = "#6b8e23";
            ctx.fillRect(cx - 8, cy + 2 + bounce, 16, 8);
          } else if (dir === "left") {
            ctx.fillStyle = "#556b2f";
            ctx.fillRect(cx + 5, cy - 2 + bounce, 7, 14);
          } else if (dir === "right") {
            ctx.fillStyle = "#556b2f";
            ctx.fillRect(cx - 12, cy - 2 + bounce, 7, 14);
          }

          // 3. Kepala & Wajah
          ctx.fillStyle = "#fed0bb";
          ctx.fillRect(cx - 10, cy - 22 + bounce, 20, 18);

          if (dir === "down") {
            ctx.fillStyle = "#1e1e24";
            ctx.fillRect(cx - 7, cy - 15 + bounce, 4, 5);
            ctx.fillRect(cx + 3, cy - 15 + bounce, 4, 5);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(cx - 6, cy - 16 + bounce, 2, 2);
            ctx.fillRect(cx + 4, cy - 16 + bounce, 2, 2);

            ctx.fillStyle = "rgba(255, 130, 150, 0.6)";
            ctx.fillRect(cx - 8, cy - 10 + bounce, 4, 2);
            ctx.fillRect(cx + 4, cy - 10 + bounce, 4, 2);
          } else if (dir === "left") {
            ctx.fillStyle = "#1e1e24";
            ctx.fillRect(cx - 8, cy - 15 + bounce, 4, 5);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(cx - 7, cy - 16 + bounce, 2, 2);
            ctx.fillStyle = "rgba(255, 130, 150, 0.6)";
            ctx.fillRect(cx - 8, cy - 10 + bounce, 3, 2);
          } else if (dir === "right") {
            ctx.fillStyle = "#1e1e24";
            ctx.fillRect(cx + 4, cy - 15 + bounce, 4, 5);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(cx + 5, cy - 16 + bounce, 2, 2);
            ctx.fillStyle = "rgba(255, 130, 150, 0.6)";
            ctx.fillRect(cx + 5, cy - 10 + bounce, 3, 2);
          }

          ctx.fillStyle = "#4a2810";
          ctx.fillRect(cx - 12, cy - 25 + bounce, 24, 8);
          if (dir === "up") {
            ctx.fillRect(cx - 11, cy - 22 + bounce, 22, 14);
          }

          ctx.fillStyle = "#283618";
          ctx.fillRect(cx - 13, cy - 29 + bounce, 26, 8);
          ctx.fillRect(cx - 1, cy - 32 + bounce, 3, 4);
        }
      });
    });
    return this.cache.playerSheet;
  }

  // --- NPC DETAIL ---

  getNpcArgaSprite() {
    if (this.cache.npcArga) return this.cache.npcArga;
    this.cache.npcArga = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      const cx = 32, cy = 32;

      ctx.fillStyle = "#5c4033";
      ctx.fillRect(cx - 8, cy + 12, 6, 12);
      ctx.fillRect(cx + 2, cy + 12, 6, 12);
      ctx.fillStyle = "#2a1810";
      ctx.fillRect(cx - 9, cy + 22, 8, 4);
      ctx.fillRect(cx + 2, cy + 22, 8, 4);

      ctx.fillStyle = "#3a6b88";
      ctx.fillRect(cx - 11, cy - 4, 22, 18);

      ctx.fillStyle = "#a8dadc";
      ctx.fillRect(cx - 8, cy, 16, 13);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx + 7, cy + 2, 7, 7);
      ctx.fillStyle = "#6f4e37";
      ctx.fillRect(cx + 8, cy + 3, 5, 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillRect(cx + 9, cy - 3, 2, 4);

      ctx.fillStyle = "#fed0bb";
      ctx.fillRect(cx - 9, cy - 20, 18, 16);

      ctx.fillStyle = "#1d3557";
      ctx.fillRect(cx - 7, cy - 14, 5, 4);
      ctx.fillRect(cx + 2, cy - 14, 5, 4);
      ctx.fillRect(cx - 2, cy - 13, 4, 2);

      ctx.fillStyle = "#9c6644";
      ctx.fillRect(cx - 2, cy - 7, 4, 2);

      ctx.fillStyle = "#1e1e24";
      ctx.fillRect(cx - 10, cy - 25, 20, 8);
    });
    return this.cache.npcArga;
  }

  getNpcRinaSprite() {
    if (this.cache.npcRina) return this.cache.npcRina;
    this.cache.npcRina = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      const cx = 32, cy = 32;

      ctx.fillStyle = "#7f5539";
      ctx.fillRect(cx - 10, cy + 10, 20, 14);

      ctx.fillStyle = "#84a98c";
      ctx.fillRect(cx - 11, cy - 4, 22, 16);
      ctx.fillStyle = "#52796f";
      ctx.fillRect(cx - 6, cy + 4, 12, 7);

      ctx.fillStyle = "#78909c";
      ctx.fillRect(cx + 9, cy + 2, 8, 8);
      ctx.fillRect(cx + 15, cy - 1, 4, 4);

      ctx.fillStyle = "#fed0bb";
      ctx.fillRect(cx - 9, cy - 20, 18, 16);

      ctx.fillStyle = "#e07a5f";
      ctx.fillRect(cx - 2, cy - 8, 4, 2);

      ctx.fillStyle = "#ddb892";
      ctx.fillRect(cx - 16, cy - 24, 32, 6);
      ctx.fillRect(cx - 10, cy - 30, 20, 8);
      ctx.fillStyle = "#e63946";
      ctx.fillRect(cx - 10, cy - 24, 20, 3);
    });
    return this.cache.npcRina;
  }

  getNpcDitoSprite() {
    if (this.cache.npcDito) return this.cache.npcDito;
    this.cache.npcDito = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      const cx = 32, cy = 32;

      ctx.fillStyle = "#4a4e69";
      ctx.fillRect(cx - 8, cy + 12, 6, 12);
      ctx.fillRect(cx + 2, cy + 12, 6, 12);
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(cx - 9, cy + 22, 8, 4);
      ctx.fillRect(cx + 2, cy + 22, 8, 4);

      ctx.fillStyle = "#2a9d8f";
      ctx.fillRect(cx - 11, cy - 4, 22, 18);

      ctx.fillStyle = "#e76f51";
      ctx.fillRect(cx - 12, cy - 6, 5, 5);
      ctx.fillRect(cx + 7, cy - 6, 5, 5);
      ctx.fillStyle = "#264653";
      ctx.fillRect(cx - 8, cy - 5, 16, 2);

      ctx.fillStyle = "#fed0bb";
      ctx.fillRect(cx - 9, cy - 20, 18, 16);

      ctx.fillStyle = "#22223b";
      ctx.fillRect(cx - 10, cy - 26, 20, 8);
      ctx.fillRect(cx - 13, cy - 22, 5, 3);
    });
    return this.cache.npcDito;
  }

  // --- HEWAN DETAIL ---

  getCatSprite(colorType = "orange") {
    const key = `cat_${colorType}`;
    if (this.cache[key]) return this.cache[key];

    this.cache[key] = this.createCanvasTexture(64, 48, (ctx, w, h) => {
      const baseCol = colorType === "orange" ? "#f4a261" : "#f1faee";
      const stripCol = colorType === "orange" ? "#e76f51" : "#3d5a80";

      ctx.fillStyle = baseCol;
      ctx.fillRect(16, 32, 4, 8);
      ctx.fillRect(24, 32, 4, 8);
      ctx.fillRect(34, 32, 4, 8);

      ctx.fillRect(14, 20, 26, 14);

      ctx.fillStyle = stripCol;
      ctx.fillRect(20, 20, 4, 8);
      ctx.fillRect(28, 20, 4, 8);

      ctx.fillStyle = baseCol;
      ctx.fillRect(10, 18, 4, 8);
      ctx.fillRect(8, 12, 4, 8);

      ctx.fillRect(36, 16, 16, 14);
      ctx.fillRect(38, 10, 4, 6);
      ctx.fillRect(46, 10, 4, 6);
      ctx.fillStyle = "#ffb5c5";
      ctx.fillRect(39, 12, 2, 4);
      ctx.fillRect(47, 12, 2, 4);

      ctx.fillStyle = "#2a9d8f";
      ctx.fillRect(45, 20, 4, 4);
      ctx.fillStyle = "#e63946";
      ctx.fillRect(49, 24, 2, 2);
    });
    return this.cache[key];
  }

  getChickenSprite() {
    if (this.cache.chicken) return this.cache.chicken;
    this.cache.chicken = this.createCanvasTexture(48, 48, (ctx, w, h) => {
      ctx.fillStyle = "#f4a261";
      ctx.fillRect(20, 32, 2, 8);
      ctx.fillRect(26, 32, 2, 8);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(12, 18, 20, 16);

      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(15, 22, 12, 8);

      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(8, 16, 6, 8);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(28, 12, 12, 14);

      ctx.fillStyle = "#e63946";
      ctx.fillRect(30, 8, 6, 4);
      ctx.fillRect(34, 22, 4, 4);

      ctx.fillStyle = "#ffb703";
      ctx.fillRect(38, 18, 6, 4);
      ctx.fillStyle = "#1e1e24";
      ctx.fillRect(34, 16, 2, 2);
    });
    return this.cache.chicken;
  }

  // --- ITEM KENANGAN & KUNCI RUMAH ---

  getCollectItemTexture(type) {
    const key = `item_${type}`;
    if (this.cache[key]) return this.cache[key];

    this.cache[key] = this.createCanvasTexture(48, 48, (ctx, w, h) => {
      const grad = ctx.createRadialGradient(24, 24, 2, 24, 24, 22);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
      grad.addColorStop(0.4, "rgba(255, 230, 109, 0.7)");
      grad.addColorStop(1, "rgba(255, 230, 109, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      if (type === "key") {
        // Kunci Kuningan Berkilau
        ctx.fillStyle = "#ffb703";
        // Kepala kunci berukir bundar
        ctx.beginPath();
        ctx.arc(18, 18, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a1005";
        ctx.beginPath();
        ctx.arc(18, 18, 4, 0, Math.PI * 2);
        ctx.fill();

        // Batang kunci miring ke kanan bawah
        ctx.fillStyle = "#f6c445";
        ctx.fillRect(23, 22, 14, 4);
        ctx.fillRect(33, 26, 4, 5);
        ctx.fillRect(29, 26, 3, 3);
      } else if (type === "ticket") {
        ctx.fillStyle = "#f6c445";
        ctx.fillRect(10, 16, 28, 16);
        ctx.fillStyle = "#d4971c";
        ctx.fillRect(10, 16, 28, 2);
        ctx.fillRect(10, 30, 28, 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(22, 20, 4, 8);
        ctx.fillRect(20, 22, 8, 4);
      } else if (type === "polaroid") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(12, 12, 24, 26);
        ctx.fillStyle = "#3a86ff";
        ctx.fillRect(15, 15, 18, 16);
        ctx.fillStyle = "#ffbe0b";
        ctx.fillRect(25, 17, 5, 5);
        ctx.fillStyle = "#06d6a0";
        ctx.fillRect(15, 26, 18, 5);
      } else if (type === "cassette") {
        ctx.fillStyle = "#ff70a6";
        ctx.fillRect(10, 14, 28, 20);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(14, 18, 20, 10);
        ctx.fillStyle = "#333333";
        ctx.fillRect(16, 21, 4, 4);
        ctx.fillRect(28, 21, 4, 4);
      } else if (type === "flower") {
        ctx.fillStyle = "#a0e426";
        ctx.fillRect(23, 26, 3, 14);
        ctx.fillStyle = "#ff758f";
        ctx.fillRect(19, 16, 11, 11);
        ctx.fillStyle = "#ffe066";
        ctx.fillRect(22, 19, 5, 5);
      }
    });
    return this.cache[key];
  }
}

window.textureGen = new TextureGenerator();
