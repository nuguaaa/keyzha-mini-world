/**
 * ============================================================================
 * PROCEDURAL PIXEL-ART TEXTURE GENERATOR (HTML5 Canvas -> Three.js)
 * ============================================================================
 * 100% tanpa file gambar eksternal. Semua tekstur dan sprite dibuat secara
 * prosedural menggunakan Canvas 2D dengan filtering Nearest (tajam pixel art).
 */

class TextureGenerator {
  constructor() {
    this.cache = {};
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

  // --- TEKSTUR PERMUKAAN TANAH & DIORAMA ---

  // 1. Rumput Atas (Grass Top)
  getGrassTexture() {
    if (this.cache.grass) return this.cache.grass;
    this.cache.grass = this.createCanvasTexture(32, 32, (ctx, w, h) => {
      ctx.fillStyle = "#639744";
      ctx.fillRect(0, 0, w, h);

      const colors = ["#56833b", "#70ab4c", "#7ebd56", "#4d7535"];
      for (let i = 0; i < 90; i++) {
        const x = Math.floor(Math.random() * w);
        const y = Math.floor(Math.random() * h);
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(x, y, 1, 1);
        if (Math.random() > 0.6) ctx.fillRect(x, y + 1, 1, 1);
      }

      for (let i = 0; i < 4; i++) {
        const x = 3 + Math.floor(Math.random() * (w - 6));
        const y = 3 + Math.floor(Math.random() * (h - 6));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y - 1, 1, 1);
        ctx.fillRect(x, y + 1, 1, 1);
        ctx.fillRect(x - 1, y, 1, 1);
        ctx.fillRect(x + 1, y, 1, 1);
        ctx.fillStyle = "#facc15";
        ctx.fillRect(x, y, 1, 1);
      }
    });
    this.cache.grass.wrapS = THREE.RepeatWrapping;
    this.cache.grass.wrapT = THREE.RepeatWrapping;
    return this.cache.grass;
  }

  // 2. Lapisan Tanah Samping Diorama (Cutaway Soil Strata)
  getSoilSideTexture() {
    if (this.cache.soilSide) return this.cache.soilSide;
    this.cache.soilSide = this.createCanvasTexture(32, 48, (ctx, w, h) => {
      ctx.fillStyle = "#56833b";
      ctx.fillRect(0, 0, w, 4);
      for (let x = 0; x < w; x += 2) {
        if (Math.random() > 0.4) ctx.fillRect(x, 4, 1, 2 + Math.floor(Math.random() * 2));
      }

      ctx.fillStyle = "#5c3d2e";
      ctx.fillRect(0, 6, w, 14);

      ctx.fillStyle = "#462e23";
      ctx.fillRect(0, 20, w, 16);

      ctx.fillStyle = "#2b1c15";
      ctx.fillRect(0, 36, w, 12);

      const rockColors = ["#8a705f", "#6f5a4c", "#3d2b23", "#a89080"];
      for (let i = 0; i < 40; i++) {
        const rx = Math.floor(Math.random() * (w - 2));
        const ry = 8 + Math.floor(Math.random() * (h - 12));
        ctx.fillStyle = rockColors[Math.floor(Math.random() * rockColors.length)];
        const size = Math.random() > 0.7 ? 2 : 1;
        ctx.fillRect(rx, ry, size, size);
      }

      ctx.fillStyle = "#8a6642";
      for (let i = 0; i < 4; i++) {
        let ax = 4 + Math.floor(Math.random() * (w - 8));
        let ay = 6;
        for (let step = 0; step < 7; step++) {
          ctx.fillRect(ax, ay + step, 1, 1);
          if (Math.random() > 0.5) ax += (Math.random() > 0.5 ? 1 : -1);
        }
      }
    });
    this.cache.soilSide.wrapS = THREE.RepeatWrapping;
    this.cache.soilSide.wrapT = THREE.ClampToEdgeWrapping;
    return this.cache.soilSide;
  }

  // 3. Jalan Setapak Batu (Cobblestone Path)
  getStonePathTexture() {
    if (this.cache.stonePath) return this.cache.stonePath;
    this.cache.stonePath = this.createCanvasTexture(32, 32, (ctx, w, h) => {
      ctx.fillStyle = "#5a5349";
      ctx.fillRect(0, 0, w, h);

      const stones = [
        { x: 1, y: 1, w: 9, h: 6, c: "#989087" },
        { x: 12, y: 1, w: 10, h: 7, c: "#a8a198" },
        { x: 24, y: 1, w: 7, h: 6, c: "#898177" },
        { x: 1, y: 9, w: 11, h: 7, c: "#b2aba2" },
        { x: 14, y: 10, w: 8, h: 6, c: "#9c948b" },
        { x: 24, y: 9, w: 7, h: 7, c: "#a39c93" },
        { x: 1, y: 18, w: 8, h: 6, c: "#8e867d" },
        { x: 11, y: 18, w: 11, h: 6, c: "#aba39a" },
        { x: 24, y: 18, w: 7, h: 6, c: "#958d84" },
        { x: 1, y: 26, w: 10, h: 5, c: "#a69f96" },
        { x: 13, y: 26, w: 9, h: 5, c: "#8b837a" },
        { x: 24, y: 26, w: 7, h: 5, c: "#a19a91" }
      ];

      stones.forEach(s => {
        ctx.fillStyle = s.c;
        ctx.fillRect(s.x, s.y, s.w, s.h);

        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillRect(s.x, s.y, s.w, 1);
        ctx.fillRect(s.x, s.y, 1, s.h);

        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.fillRect(s.x, s.y + s.h - 1, s.w, 1);
        ctx.fillRect(s.x + s.w - 1, s.y, 1, s.h);
      });

      ctx.fillStyle = "#638a42";
      ctx.fillRect(10, 8, 2, 1);
      ctx.fillRect(22, 16, 2, 1);
      ctx.fillRect(11, 24, 2, 1);
    });
    this.cache.stonePath.wrapS = THREE.RepeatWrapping;
    this.cache.stonePath.wrapT = THREE.RepeatWrapping;
    return this.cache.stonePath;
  }

  // 4. Dek Kayu Teras (Wood Planks)
  getWoodDeckTexture() {
    if (this.cache.woodDeck) return this.cache.woodDeck;
    this.cache.woodDeck = this.createCanvasTexture(32, 32, (ctx, w, h) => {
      ctx.fillStyle = "#8a5833";
      ctx.fillRect(0, 0, w, h);

      const plankHeight = 8;
      for (let y = 0; y < h; y += plankHeight) {
        ctx.fillStyle = "#4a2a16";
        ctx.fillRect(0, y, w, 1);

        ctx.fillStyle = "#9a653c";
        ctx.fillRect(0, y + 1, w, 1);

        ctx.fillStyle = "#7b4e2c";
        ctx.fillRect(2, y + 3, 12, 1);
        ctx.fillRect(18, y + 5, 10, 1);

        ctx.fillStyle = "#331c0e";
        ctx.fillRect(3, y + 3, 1, 2);
        ctx.fillRect(w - 4, y + 3, 1, 2);
      }
    });
    this.cache.woodDeck.wrapS = THREE.RepeatWrapping;
    this.cache.woodDeck.wrapT = THREE.RepeatWrapping;
    return this.cache.woodDeck;
  }

  // 5. Air Kolam Berkilau (Stylized Diorama Water)
  getWaterTexture() {
    if (this.cache.water) return this.cache.water;
    this.cache.water = this.createCanvasTexture(32, 32, (ctx, w, h) => {
      ctx.fillStyle = "#3a8bb8";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#55a7d6";
      for (let y = 3; y < h; y += 6) {
        for (let x = 0; x < w; x += 8) {
          ctx.fillRect(x + (y % 4), y, 4, 1);
        }
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      ctx.fillRect(6, 6, 3, 1);
      ctx.fillRect(18, 14, 4, 1);
      ctx.fillRect(10, 22, 3, 1);
      ctx.fillRect(24, 26, 2, 1);
    });
    this.cache.water.wrapS = THREE.RepeatWrapping;
    this.cache.water.wrapT = THREE.RepeatWrapping;
    return this.cache.water;
  }

  // --- BANGUNAN RUMAH ---

  getRoofTexture() {
    if (this.cache.roof) return this.cache.roof;
    this.cache.roof = this.createCanvasTexture(32, 32, (ctx, w, h) => {
      ctx.fillStyle = "#b85135";
      ctx.fillRect(0, 0, w, h);

      const tileH = 6;
      for (let y = 0; y < h; y += tileH) {
        ctx.fillStyle = "#7d2e1b";
        ctx.fillRect(0, y + tileH - 1, w, 1);

        ctx.fillStyle = "#d46b4e";
        ctx.fillRect(0, y, w, 1);

        const offset = (y / tileH) % 2 === 0 ? 0 : 4;
        for (let x = offset; x < w; x += 8) {
          ctx.fillStyle = "#7d2e1b";
          ctx.fillRect(x, y, 1, tileH);
        }
      }
    });
    this.cache.roof.wrapS = THREE.RepeatWrapping;
    this.cache.roof.wrapT = THREE.RepeatWrapping;
    return this.cache.roof;
  }

  getHouseWallTexture() {
    if (this.cache.houseWall) return this.cache.houseWall;
    this.cache.houseWall = this.createCanvasTexture(32, 32, (ctx, w, h) => {
      ctx.fillStyle = "#f4ebd9";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#e5dac4";
      for (let i = 0; i < 30; i++) {
        ctx.fillRect(Math.floor(Math.random() * w), Math.floor(Math.random() * h), 1, 1);
      }

      ctx.fillStyle = "#633c24";
      ctx.fillRect(0, 0, 3, h);
      ctx.fillRect(w - 3, 0, 3, h);
      ctx.fillRect(0, 0, w, 3);
      ctx.fillRect(0, h - 3, w, 3);
    });
    return this.cache.houseWall;
  }

  getWindowTexture() {
    if (this.cache.window) return this.cache.window;
    this.cache.window = this.createCanvasTexture(32, 32, (ctx, w, h) => {
      ctx.fillStyle = "#52321e";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#ffd166";
      ctx.fillRect(3, 3, w - 6, h - 6);

      ctx.fillStyle = "#52321e";
      ctx.fillRect(w / 2 - 1, 3, 2, h - 6);
      ctx.fillRect(3, h / 2 - 1, w - 6, 2);

      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.fillRect(5, 5, 8, 8);
      ctx.fillRect(19, 5, 8, 8);
    });
    return this.cache.window;
  }

  getDoorTexture() {
    if (this.cache.door) return this.cache.door;
    this.cache.door = this.createCanvasTexture(24, 36, (ctx, w, h) => {
      ctx.fillStyle = "#462917";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#7a4926";
      ctx.fillRect(2, 4, w - 4, h - 4);

      ctx.fillStyle = "#3a2010";
      ctx.fillRect(7, 4, 1, h - 4);
      ctx.fillRect(12, 4, 1, h - 4);
      ctx.fillRect(17, 4, 1, h - 4);

      ctx.fillStyle = "#1e1e1e";
      ctx.fillRect(1, 8, 4, 3);
      ctx.fillRect(1, 24, 4, 3);

      ctx.fillStyle = "#f4d06f";
      ctx.fillRect(18, 19, 3, 3);
    });
    return this.cache.door;
  }

  // --- OBJEK DAN PROPS DIORAMA ---

  getTreeOakTexture() {
    if (this.cache.treeOak) return this.cache.treeOak;
    this.cache.treeOak = this.createCanvasTexture(64, 72, (ctx, w, h) => {
      ctx.fillStyle = "#633c24";
      ctx.fillRect(28, 50, 8, 22);
      ctx.fillStyle = "#4a2c1a";
      ctx.fillRect(33, 50, 3, 22);

      const clusters = [
        { cx: 32, cy: 30, r: 24, dark: "#3a6927", mid: "#528e36", light: "#72b64d", hl: "#94d66b" },
        { cx: 20, cy: 35, r: 16, dark: "#315921", mid: "#477c30", light: "#62a142", hl: "#80be5d" },
        { cx: 44, cy: 34, r: 17, dark: "#2f551f", mid: "#45792e", light: "#5f9e3f", hl: "#7ebb5b" },
        { cx: 32, cy: 18, r: 16, dark: "#3a6927", mid: "#559439", light: "#77bc52", hl: "#9ae070" }
      ];

      clusters.forEach(c => {
        ctx.fillStyle = c.dark;
        ctx.beginPath();
        ctx.arc(c.cx, c.cy + 3, c.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = c.mid;
        ctx.beginPath();
        ctx.arc(c.cx, c.cy, c.r - 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = c.light;
        ctx.beginPath();
        ctx.arc(c.cx - 2, c.cy - 3, c.r - 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = c.hl;
        ctx.beginPath();
        ctx.arc(c.cx - 4, c.cy - 6, c.r - 9, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.fillStyle = "#ffb5c5";
      const blossoms = [
        [22, 24], [25, 23], [36, 15], [39, 16], [42, 28], [18, 38], [30, 36], [45, 40]
      ];
      blossoms.forEach(([bx, by]) => {
        ctx.fillRect(bx, by, 2, 2);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(bx, by, 1, 1);
        ctx.fillStyle = "#ffb5c5";
      });
    });
    return this.cache.treeOak;
  }

  getBushTexture() {
    if (this.cache.bush) return this.cache.bush;
    this.cache.bush = this.createCanvasTexture(36, 28, (ctx, w, h) => {
      ctx.fillStyle = "#2d521d";
      ctx.beginPath();
      ctx.ellipse(18, 16, 16, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#4a852f";
      ctx.beginPath();
      ctx.ellipse(18, 13, 14, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#70b848";
      ctx.beginPath();
      ctx.ellipse(16, 10, 11, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      const flowers = [[10, 10, "#ff4d6d"], [22, 9, "#ffb703"], [16, 14, "#ff4d6d"], [26, 15, "#ffffff"]];
      flowers.forEach(([fx, fy, col]) => {
        ctx.fillStyle = col;
        ctx.fillRect(fx, fy, 3, 3);
        ctx.fillStyle = "#ffff99";
        ctx.fillRect(fx + 1, fy + 1, 1, 1);
      });
    });
    return this.cache.bush;
  }

  getLampTexture() {
    if (this.cache.lamp) return this.cache.lamp;
    this.cache.lamp = this.createCanvasTexture(20, 48, (ctx, w, h) => {
      ctx.fillStyle = "#22222b";
      ctx.fillRect(9, 14, 2, 32);
      ctx.fillRect(6, 44, 8, 4);
      ctx.fillRect(5, 5, 10, 2);
      ctx.fillRect(4, 7, 12, 1);
      ctx.fillRect(5, 13, 10, 2);

      ctx.fillStyle = "#ffe066";
      ctx.fillRect(6, 8, 8, 5);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(8, 9, 4, 3);
    });
    return this.cache.lamp;
  }

  getMailboxTexture() {
    if (this.cache.mailbox) return this.cache.mailbox;
    this.cache.mailbox = this.createCanvasTexture(28, 42, (ctx, w, h) => {
      ctx.fillStyle = "#663e26";
      ctx.fillRect(12, 22, 4, 20);

      ctx.fillStyle = "#d90429";
      ctx.fillRect(6, 7, 16, 16);
      ctx.fillRect(8, 5, 12, 2);

      ctx.fillStyle = "#ef233c";
      ctx.fillRect(7, 7, 14, 2);

      ctx.fillStyle = "#2b030b";
      ctx.fillRect(8, 12, 12, 2);

      ctx.fillStyle = "#ffb703";
      ctx.fillRect(4, 9, 3, 6);
      ctx.fillRect(2, 9, 3, 3);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(10, 16, 8, 5);
      ctx.fillStyle = "#d90429";
      ctx.fillRect(11, 17, 6, 1);
    });
    return this.cache.mailbox;
  }

  getBenchTexture() {
    if (this.cache.bench) return this.cache.bench;
    this.cache.bench = this.createCanvasTexture(36, 24, (ctx, w, h) => {
      ctx.fillStyle = "#1e1e24";
      ctx.fillRect(4, 12, 2, 12);
      ctx.fillRect(30, 12, 2, 12);

      ctx.fillStyle = "#8a5833";
      ctx.fillRect(2, 4, 32, 3);
      ctx.fillRect(2, 8, 32, 3);

      ctx.fillStyle = "#9a653c";
      ctx.fillRect(1, 12, 34, 4);

      ctx.fillStyle = "#b57b4f";
      ctx.fillRect(1, 12, 34, 1);
      ctx.fillRect(2, 4, 32, 1);
    });
    return this.cache.bench;
  }

  getFenceTexture() {
    if (this.cache.fence) return this.cache.fence;
    this.cache.fence = this.createCanvasTexture(32, 24, (ctx, w, h) => {
      ctx.fillStyle = "#e0d6c3";
      ctx.fillRect(0, 8, w, 2);
      ctx.fillRect(0, 16, w, 2);

      const pickets = [2, 10, 18, 26];
      pickets.forEach(px => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(px + 1, 2, 2, 1);
        ctx.fillRect(px, 3, 4, 2);
        ctx.fillRect(px, 5, 4, 18);
        ctx.fillStyle = "#cfc5b0";
        ctx.fillRect(px + 3, 5, 1, 18);
      });
    });
    this.cache.fence.wrapS = THREE.RepeatWrapping;
    this.cache.fence.wrapT = THREE.ClampToEdgeWrapping;
    return this.cache.fence;
  }

  getArcadeTexture() {
    if (this.cache.arcade) return this.cache.arcade;
    this.cache.arcade = this.createCanvasTexture(32, 54, (ctx, w, h) => {
      ctx.fillStyle = "#2b1b4d";
      ctx.fillRect(3, 4, 26, 48);

      ctx.fillStyle = "#ff007f";
      ctx.fillRect(4, 6, 24, 8);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 5px sans-serif";
      ctx.fillText("ARCADE", 6, 12);

      ctx.fillStyle = "#0d1b2a";
      ctx.fillRect(5, 16, 22, 16);

      ctx.fillStyle = "#ffd166";
      ctx.fillRect(14, 18, 4, 4);
      ctx.fillStyle = "#06d6a0";
      ctx.fillRect(12, 28, 8, 3);

      ctx.fillStyle = "rgba(0, 255, 255, 0.15)";
      for (let y = 17; y < 32; y += 2) {
        ctx.fillRect(5, y, 22, 1);
      }

      ctx.fillStyle = "#1e1338";
      ctx.fillRect(4, 33, 24, 7);

      ctx.fillStyle = "#ef233c";
      ctx.fillRect(8, 34, 3, 3);
      ctx.fillStyle = "#8d99ae";
      ctx.fillRect(9, 37, 1, 2);

      ctx.fillStyle = "#ffbe0b";
      ctx.fillRect(16, 35, 2, 2);
      ctx.fillStyle = "#3a86ff";
      ctx.fillRect(20, 35, 2, 2);

      ctx.fillStyle = "#150c26";
      ctx.fillRect(10, 43, 12, 6);
      ctx.fillStyle = "#ffb703";
      ctx.fillRect(15, 45, 2, 3);
    });
    return this.cache.arcade;
  }

  getPhotoboothTexture() {
    if (this.cache.photobooth) return this.cache.photobooth;
    this.cache.photobooth = this.createCanvasTexture(44, 58, (ctx, w, h) => {
      ctx.fillStyle = "#5c6b73";
      ctx.fillRect(3, 4, 38, 52);

      for (let x = 3; x < 41; x += 6) {
        ctx.fillStyle = (x % 12 === 3) ? "#e63946" : "#f1faee";
        ctx.fillRect(x, 4, 6, 8);
      }

      ctx.fillStyle = "#1d3557";
      ctx.fillRect(8, 13, 28, 7);
      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 5px sans-serif";
      ctx.fillText("PHOTOBOOTH", 9, 18);

      ctx.fillStyle = "#9d0208";
      ctx.fillRect(22, 21, 16, 32);
      ctx.fillStyle = "#6a040f";
      ctx.fillRect(27, 21, 2, 32);
      ctx.fillRect(33, 21, 2, 32);

      ctx.fillStyle = "#141414";
      ctx.fillRect(6, 21, 16, 32);

      ctx.fillStyle = "#ffea00";
      ctx.fillRect(12, 23, 4, 4);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(13, 24, 2, 2);
    });
    return this.cache.photobooth;
  }

  getArchGateTexture() {
    if (this.cache.archGate) return this.cache.archGate;
    this.cache.archGate = this.createCanvasTexture(48, 60, (ctx, w, h) => {
      ctx.fillStyle = "#58311b";
      ctx.fillRect(4, 14, 5, 46);
      ctx.fillRect(39, 14, 5, 46);
      ctx.fillRect(2, 6, 44, 6);
      ctx.fillRect(6, 3, 36, 4);

      ctx.fillStyle = "#40792b";
      for (let y = 14; y < 58; y += 4) {
        ctx.fillRect(2 + Math.floor(Math.random() * 3), y, 4, 3);
        ctx.fillRect(38 + Math.floor(Math.random() * 3), y, 4, 3);
      }
      ctx.fillRect(3, 4, 42, 6);

      const colors = ["#ff758f", "#c77dff", "#ffffff", "#ffb3c6"];
      for (let i = 0; i < 24; i++) {
        const fx = 4 + Math.floor(Math.random() * 40);
        const fy = 4 + Math.floor(Math.random() * 18);
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillRect(fx, fy, 2, 2);
      }

      ctx.fillStyle = "#222222";
      ctx.fillRect(23, 10, 2, 5);
      ctx.fillStyle = "#ffd166";
      ctx.fillRect(22, 15, 4, 5);
    });
    return this.cache.archGate;
  }

  getGiftChestTexture() {
    if (this.cache.giftChest) return this.cache.giftChest;
    this.cache.giftChest = this.createCanvasTexture(32, 32, (ctx, w, h) => {
      ctx.fillStyle = "#6b2d18";
      ctx.fillRect(3, 8, 26, 20);

      ctx.fillStyle = "#8a3c20";
      ctx.fillRect(2, 4, 28, 8);

      ctx.fillStyle = "#ffb703";
      ctx.fillRect(3, 11, 26, 3);
      ctx.fillRect(14, 4, 4, 24);

      ctx.fillStyle = "#ff0054";
      ctx.fillRect(12, 1, 8, 4);
      ctx.fillRect(10, 2, 4, 2);
      ctx.fillRect(18, 2, 4, 2);

      ctx.fillStyle = "#ffe066";
      ctx.fillRect(14, 14, 4, 5);
      ctx.fillStyle = "#222222";
      ctx.fillRect(15, 16, 2, 2);
    });
    return this.cache.giftChest;
  }

  // --- SPRITE KARAKTER & ANIMASI (4 Arah, 3 Frame) ---

  getPlayerSpriteSheet() {
    if (this.cache.playerSheet) return this.cache.playerSheet;
    this.cache.playerSheet = this.createCanvasTexture(72, 128, (ctx, w, h) => {
      const fw = 24;
      const fh = 32;

      const directions = ["down", "up", "left", "right"];
      directions.forEach((dir, row) => {
        for (let frame = 0; frame < 3; frame++) {
          const ox = frame * fw;
          const oy = row * fh;

          ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
          ctx.beginPath();
          ctx.ellipse(ox + 12, oy + 30, 6, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();

          const stepOffset = frame === 1 ? -2 : (frame === 2 ? 2 : 0);

          ctx.fillStyle = "#33415c";
          if (dir === "down" || dir === "up") {
            ctx.fillRect(ox + 8, oy + 23 + (frame === 1 ? -1 : 0), 3, 6);
            ctx.fillRect(ox + 13, oy + 23 + (frame === 2 ? -1 : 0), 3, 6);
            ctx.fillStyle = "#5c3d2e";
            ctx.fillRect(ox + 8, oy + 28 + (frame === 1 ? -1 : 0), 3, 2);
            ctx.fillRect(ox + 13, oy + 28 + (frame === 2 ? -1 : 0), 3, 2);
          } else {
            ctx.fillRect(ox + 10 + stepOffset, oy + 23, 4, 6);
            ctx.fillStyle = "#5c3d2e";
            ctx.fillRect(ox + 10 + stepOffset, oy + 28, 5, 2);
          }

          ctx.fillStyle = "#d47a32";
          ctx.fillRect(ox + 7, oy + 15, 10, 9);

          ctx.fillStyle = "#9d0208";
          ctx.fillRect(ox + 8, oy + 14, 8, 3);
          if (dir === "down") {
            ctx.fillRect(ox + 11, oy + 17, 2, 4);
          }

          if (dir === "up") {
            ctx.fillStyle = "#606c38";
            ctx.fillRect(ox + 8, oy + 16, 8, 7);
            ctx.fillStyle = "#dda15e";
            ctx.fillRect(ox + 10, oy + 18, 4, 3);
          } else if (dir === "left") {
            ctx.fillStyle = "#606c38";
            ctx.fillRect(ox + 14, oy + 16, 4, 6);
          } else if (dir === "right") {
            ctx.fillStyle = "#606c38";
            ctx.fillRect(ox + 6, oy + 16, 4, 6);
          }

          ctx.fillStyle = "#fed0bb";
          ctx.fillRect(ox + 8, oy + 8, 8, 7);

          if (dir === "down") {
            ctx.fillStyle = "#1e1e1e";
            ctx.fillRect(ox + 9, oy + 11, 2, 2);
            ctx.fillRect(ox + 13, oy + 11, 2, 2);
            ctx.fillStyle = "#ff99a8";
            ctx.fillRect(ox + 8, oy + 13, 2, 1);
            ctx.fillRect(ox + 14, oy + 13, 2, 1);
          } else if (dir === "left") {
            ctx.fillStyle = "#1e1e1e";
            ctx.fillRect(ox + 8, oy + 11, 2, 2);
            ctx.fillStyle = "#ff99a8";
            ctx.fillRect(ox + 8, oy + 13, 2, 1);
          } else if (dir === "right") {
            ctx.fillStyle = "#1e1e1e";
            ctx.fillRect(ox + 14, oy + 11, 2, 2);
            ctx.fillStyle = "#ff99a8";
            ctx.fillRect(ox + 14, oy + 13, 2, 1);
          }

          ctx.fillStyle = "#4a2810";
          ctx.fillRect(ox + 7, oy + 6, 10, 4);
          if (dir === "up") {
            ctx.fillRect(ox + 7, oy + 8, 10, 6);
          }

          ctx.fillStyle = "#283618";
          ctx.fillRect(ox + 6, oy + 4, 12, 4);
          ctx.fillRect(ox + 11, oy + 2, 2, 2);
        }
      });
    });
    return this.cache.playerSheet;
  }

  getNpcArgaSprite() {
    if (this.cache.npcArga) return this.cache.npcArga;
    this.cache.npcArga = this.createCanvasTexture(24, 32, (ctx, w, h) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.beginPath();
      ctx.ellipse(12, 30, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#6f4e37";
      ctx.fillRect(8, 22, 3, 7);
      ctx.fillRect(13, 22, 3, 7);

      ctx.fillStyle = "#2b1810";
      ctx.fillRect(8, 28, 3, 2);
      ctx.fillRect(13, 28, 3, 2);

      ctx.fillStyle = "#457b9d";
      ctx.fillRect(7, 14, 10, 9);

      ctx.fillStyle = "#a8dadc";
      ctx.fillRect(8, 16, 8, 6);

      ctx.fillStyle = "#f1faee";
      ctx.fillRect(14, 18, 4, 3);
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillRect(15, 15, 1, 2);

      ctx.fillStyle = "#f5cac3";
      ctx.fillRect(8, 7, 8, 7);

      ctx.fillStyle = "#1d3557";
      ctx.fillRect(9, 9, 2, 2);
      ctx.fillRect(13, 9, 2, 2);
      ctx.fillRect(11, 9, 2, 1);

      ctx.fillStyle = "#b07d62";
      ctx.fillRect(11, 12, 2, 1);

      ctx.fillStyle = "#1b1b1e";
      ctx.fillRect(7, 5, 10, 4);
    });
    return this.cache.npcArga;
  }

  getNpcRinaSprite() {
    if (this.cache.npcRina) return this.cache.npcRina;
    this.cache.npcRina = this.createCanvasTexture(24, 32, (ctx, w, h) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.beginPath();
      ctx.ellipse(12, 30, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#7f5539";
      ctx.fillRect(7, 21, 10, 8);

      ctx.fillStyle = "#84a98c";
      ctx.fillRect(7, 14, 10, 10);
      ctx.fillStyle = "#52796f";
      ctx.fillRect(9, 18, 6, 4);

      ctx.fillStyle = "#90a4ae";
      ctx.fillRect(15, 18, 5, 4);
      ctx.fillRect(19, 16, 2, 2);

      ctx.fillStyle = "#fed0bb";
      ctx.fillRect(8, 7, 8, 7);

      ctx.fillStyle = "#333333";
      ctx.fillRect(9, 10, 2, 1);
      ctx.fillRect(13, 10, 2, 1);
      ctx.fillStyle = "#e07a5f";
      ctx.fillRect(11, 12, 2, 1);

      ctx.fillStyle = "#ddb892";
      ctx.fillRect(4, 5, 16, 3);
      ctx.fillRect(7, 2, 10, 4);
      ctx.fillStyle = "#e63946";
      ctx.fillRect(7, 5, 10, 1);
    });
    return this.cache.npcRina;
  }

  getNpcDitoSprite() {
    if (this.cache.npcDito) return this.cache.npcDito;
    this.cache.npcDito = this.createCanvasTexture(24, 32, (ctx, w, h) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
      ctx.beginPath();
      ctx.ellipse(12, 30, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#4a4e69";
      ctx.fillRect(8, 22, 3, 7);
      ctx.fillRect(13, 22, 3, 7);
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(8, 28, 3, 2);
      ctx.fillRect(13, 28, 3, 2);

      ctx.fillStyle = "#2a9d8f";
      ctx.fillRect(7, 14, 10, 9);

      ctx.fillStyle = "#e76f51";
      ctx.fillRect(6, 13, 3, 3);
      ctx.fillRect(15, 13, 3, 3);
      ctx.fillStyle = "#264653";
      ctx.fillRect(8, 14, 8, 1);

      ctx.fillStyle = "#f5cac3";
      ctx.fillRect(8, 7, 8, 7);

      ctx.fillStyle = "#222222";
      ctx.fillRect(9, 10, 2, 1);
      ctx.fillRect(13, 10, 2, 1);

      ctx.fillStyle = "#22223b";
      ctx.fillRect(7, 4, 10, 4);
      ctx.fillRect(6, 6, 3, 2);
    });
    return this.cache.npcDito;
  }

  // --- HEWAN PELIHARAAN ---

  getCatSprite(colorType = "orange") {
    const key = `cat_${colorType}`;
    if (this.cache[key]) return this.cache[key];

    this.cache[key] = this.createCanvasTexture(32, 20, (ctx, w, h) => {
      const baseCol = colorType === "orange" ? "#f4a261" : "#f1faee";
      const stripCol = colorType === "orange" ? "#e76f51" : "#264653";

      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.beginPath();
      ctx.ellipse(14, 18, 8, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = baseCol;
      ctx.fillRect(8, 14, 2, 4);
      ctx.fillRect(12, 14, 2, 4);
      ctx.fillRect(17, 14, 2, 4);

      ctx.fillRect(7, 8, 13, 7);

      ctx.fillStyle = stripCol;
      ctx.fillRect(10, 8, 2, 4);
      ctx.fillRect(14, 8, 2, 4);

      ctx.fillStyle = baseCol;
      ctx.fillRect(6, 7, 2, 4);
      ctx.fillRect(5, 5, 2, 3);
      ctx.fillRect(4, 4, 2, 2);

      ctx.fillRect(18, 6, 7, 7);
      ctx.fillRect(19, 3, 2, 3);
      ctx.fillRect(23, 3, 2, 3);
      ctx.fillStyle = "#ffb5c5";
      ctx.fillRect(20, 4, 1, 2);
      ctx.fillRect(23, 4, 1, 2);

      ctx.fillStyle = "#2a9d8f";
      ctx.fillRect(22, 8, 2, 2);

      ctx.fillStyle = "#e63946";
      ctx.fillRect(24, 10, 1, 1);
    });
    return this.cache[key];
  }

  getChickenSprite() {
    if (this.cache.chicken) return this.cache.chicken;
    this.cache.chicken = this.createCanvasTexture(20, 20, (ctx, w, h) => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.beginPath();
      ctx.ellipse(10, 18, 5, 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#f4a261";
      ctx.fillRect(8, 14, 1, 4);
      ctx.fillRect(11, 14, 1, 4);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(5, 7, 9, 8);

      ctx.fillStyle = "#e9ecef";
      ctx.fillRect(6, 9, 6, 4);

      ctx.fillStyle = "#dee2e6";
      ctx.fillRect(3, 6, 3, 4);

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(12, 5, 5, 6);

      ctx.fillStyle = "#d90429";
      ctx.fillRect(13, 3, 3, 2);
      ctx.fillRect(14, 11, 2, 2);

      ctx.fillStyle = "#ffb703";
      ctx.fillRect(16, 8, 3, 2);

      ctx.fillStyle = "#1e1e1e";
      ctx.fillRect(14, 7, 1, 1);
    });
    return this.cache.chicken;
  }

  // --- ITEM KENANGAN & IKON BERKILAU ---

  getCollectItemTexture(type) {
    const key = `item_${type}`;
    if (this.cache[key]) return this.cache[key];

    this.cache[key] = this.createCanvasTexture(32, 32, (ctx, w, h) => {
      const grad = ctx.createRadialGradient(16, 16, 2, 16, 16, 15);
      grad.addColorStop(0, "rgba(255, 255, 255, 0.9)");
      grad.addColorStop(0.4, "rgba(255, 230, 109, 0.6)");
      grad.addColorStop(1, "rgba(255, 230, 109, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      if (type === "ticket") {
        ctx.fillStyle = "#f6c445";
        ctx.fillRect(7, 11, 18, 10);
        ctx.fillStyle = "#d4971c";
        ctx.fillRect(7, 11, 18, 1);
        ctx.fillRect(7, 20, 18, 1);
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.clearRect(6, 14, 2, 4);
        ctx.clearRect(24, 14, 2, 4);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(15, 14, 2, 4);
        ctx.fillRect(14, 15, 4, 2);
      } else if (type === "polaroid") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(8, 8, 16, 18);
        ctx.fillStyle = "#3a86ff";
        ctx.fillRect(10, 10, 12, 11);
        ctx.fillStyle = "#ffbe0b";
        ctx.fillRect(17, 12, 3, 3);
        ctx.fillStyle = "#06d6a0";
        ctx.fillRect(10, 18, 12, 3);
      } else if (type === "cassette") {
        ctx.fillStyle = "#ff70a6";
        ctx.fillRect(7, 10, 18, 12);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(9, 13, 14, 6);
        ctx.fillStyle = "#333333";
        ctx.fillRect(11, 15, 2, 2);
        ctx.fillRect(19, 15, 2, 2);
      } else if (type === "flower") {
        ctx.fillStyle = "#a0e426";
        ctx.fillRect(15, 18, 2, 8);
        ctx.fillRect(13, 20, 2, 2);
        ctx.fillStyle = "#ff758f";
        ctx.fillRect(13, 12, 6, 6);
        ctx.fillRect(11, 14, 10, 2);
        ctx.fillRect(15, 10, 2, 10);
        ctx.fillStyle = "#ffe066";
        ctx.fillRect(15, 14, 2, 2);
      }
    });
    return this.cache[key];
  }

  getHeartTexture() {
    if (this.cache.heart) return this.cache.heart;
    this.cache.heart = this.createCanvasTexture(16, 16, (ctx, w, h) => {
      ctx.fillStyle = "#ff4d6d";
      ctx.fillRect(3, 4, 4, 4);
      ctx.fillRect(9, 4, 4, 4);
      ctx.fillRect(2, 6, 12, 4);
      ctx.fillRect(4, 10, 8, 2);
      ctx.fillRect(6, 12, 4, 2);
      ctx.fillRect(7, 14, 2, 1);
    });
    return this.cache.heart;
  }
}

window.textureGen = new TextureGenerator();
