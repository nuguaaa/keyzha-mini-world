/**
 * ============================================================================
 * PROCEDURAL PIXEL-ART TEXTURE GENERATOR & CUSTOM ASSET LOADER
 * ============================================================================
 * Menghasilkan tekstur procedural berkualitas tinggi bergaya HD-2D diorama
 * (NearestFilter, tajam, tanpa stretching, bebas celah hitam, dan zero missing asset).
 * Mendukung pemuatan custom asset dari folder assets/ dengan auto-fallback aman.
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

  // --- 1. TEKSTUR DIORAMA & LINGKUNGAN ALAMI ---

  // Batang Kayu Pohon Alami (Bark Texture)
  getBarkTexture() {
    if (this.cache.bark) return this.cache.bark;
    this.cache.bark = this.createCanvasTexture(32, 64, (ctx, w, h) => {
      ctx.fillStyle = "#3e2312";
      ctx.fillRect(0, 0, w, h);

      const barkTones = ["#4a2c17", "#321b0d", "#5a361c", "#28150a"];
      for (let x = 0; x < w; x += 3) {
        ctx.fillStyle = barkTones[(x * 7) % barkTones.length];
        ctx.fillRect(x, 0, 2, h);
      }

      for (let i = 0; i < 40; i++) {
        const bx = Math.floor(Math.random() * (w - 2));
        const by = Math.floor(Math.random() * (h - 8));
        ctx.fillStyle = Math.random() > 0.5 ? "#5a361c" : "#241308";
        ctx.fillRect(bx, by, 2, 6 + Math.floor(Math.random() * 8));
      }

      // Lumut kehijauan di bawah
      ctx.fillStyle = "#3a5a24";
      for (let i = 0; i < 24; i++) {
        ctx.fillRect(Math.floor(Math.random() * w), h - 14 + Math.floor(Math.random() * 14), 2, 2);
      }
    });
    this.cache.bark.wrapS = THREE.RepeatWrapping;
    this.cache.bark.wrapT = THREE.RepeatWrapping;
    return this.cache.bark;
  }

  // Rumput Subur HD-2D dengan Taburan Bunga Daisy Putih
  getGrassTexture() {
    if (this.cache.grass) return this.cache.grass;
    this.cache.grass = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#528a38";
      ctx.fillRect(0, 0, w, h);

      const tones = ["#477a30", "#5e9b42", "#6baa4c", "#3e6c2a", "#78b857"];
      for (let i = 0; i < 360; i++) {
        const x = Math.floor(Math.random() * w);
        const y = Math.floor(Math.random() * h);
        ctx.fillStyle = tones[Math.floor(Math.random() * tones.length)];
        ctx.fillRect(x, y, 1, 2);
      }

      // Rumpun rumput kecil
      for (let i = 0; i < 8; i++) {
        const cx = 6 + Math.floor(Math.random() * (w - 12));
        const cy = 6 + Math.floor(Math.random() * (h - 12));
        ctx.fillStyle = "#345c22";
        ctx.fillRect(cx - 1, cy - 2, 3, 1);
        ctx.fillRect(cx - 2, cy - 1, 5, 3);
        ctx.fillRect(cx, cy + 2, 1, 2);
      }

      // Bunga daisy putih & kuning (seperti di video)
      for (let i = 0; i < 8; i++) {
        const x = 4 + Math.floor(Math.random() * (w - 8));
        const y = 4 + Math.floor(Math.random() * (h - 8));
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, y - 1, 1, 3);
        ctx.fillRect(x - 1, y, 3, 1);
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(x, y, 1, 1);
      }
    });
    this.cache.grass.wrapS = THREE.RepeatWrapping;
    this.cache.grass.wrapT = THREE.RepeatWrapping;
    return this.cache.grass;
  }

  // Potongan Samping Diorama (Earth & Soil Strata Cross-Section)
  getSoilCutawayTexture() {
    if (this.cache.soilCutaway) return this.cache.soilCutaway;
    this.cache.soilCutaway = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      // 1. Lapisan rumput hijau subur atas (0-8px)
      ctx.fillStyle = "#4a8533";
      ctx.fillRect(0, 0, w, 6);
      ctx.fillStyle = "#386524";
      for (let x = 0; x < w; x += 2) {
        ctx.fillRect(x, 4, 1, 3 + (x % 3));
      }

      // 2. Lapisan tanah humus subur gelap (8-26px)
      ctx.fillStyle = "#483023";
      ctx.fillRect(0, 7, w, 20);
      ctx.fillStyle = "#3a2419";
      for (let i = 0; i < 40; i++) {
        ctx.fillRect(Math.floor(Math.random() * w), 8 + Math.floor(Math.random() * 18), 2, 2);
      }

      // 3. Lapisan tanah liat merah bata / ochre (27-46px)
      ctx.fillStyle = "#633f2b";
      ctx.fillRect(0, 27, w, 20);
      ctx.fillStyle = "#7d5037";
      for (let i = 0; i < 50; i++) {
        ctx.fillRect(Math.floor(Math.random() * w), 27 + Math.floor(Math.random() * 19), 2, 2);
      }

      // Kerikil & batu sungai tertanam
      const stones = ["#9c8979", "#78675a", "#b5a392", "#50443c"];
      for (let i = 0; i < 16; i++) {
        const sx = Math.floor(Math.random() * (w - 4));
        const sy = 12 + Math.floor(Math.random() * 32);
        const sz = 2 + Math.floor(Math.random() * 3);
        ctx.fillStyle = stones[Math.floor(Math.random() * stones.length)];
        ctx.fillRect(sx, sy, sz, sz - 1);
      }

      // 4. Lapisan batuan dasar bawah (47-64px)
      ctx.fillStyle = "#352820";
      ctx.fillRect(0, 47, w, 17);
      ctx.fillStyle = "#261c16";
      for (let x = 0; x < w; x += 4) {
        ctx.fillRect(x, 50 + (x % 5), 3, 14);
      }
    });
    this.cache.soilCutaway.wrapS = THREE.RepeatWrapping;
    this.cache.soilCutaway.wrapT = THREE.ClampToEdgeWrapping;
    return this.cache.soilCutaway;
  }

  // Paving Batu Pelataran & Undakan Tangga
  getStonePathTexture() {
    if (this.cache.stonePath) return this.cache.stonePath;
    this.cache.stonePath = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#453f38";
      ctx.fillRect(0, 0, w, h);

      const stones = [
        { x: 2, y: 2, w: 18, h: 12, c: "#989085" },
        { x: 23, y: 2, w: 22, h: 14, c: "#a69e93" },
        { x: 48, y: 2, w: 14, h: 12, c: "#8b8378" },
        { x: 2, y: 16, w: 24, h: 14, c: "#b0a89d" },
        { x: 28, y: 18, w: 18, h: 12, c: "#938b80" },
        { x: 48, y: 16, w: 14, h: 14, c: "#a29a8f" },
        { x: 2, y: 32, w: 16, h: 14, c: "#8f877c" },
        { x: 20, y: 32, w: 26, h: 13, c: "#aba398" },
        { x: 48, y: 32, w: 14, h: 14, c: "#9c9489" },
        { x: 2, y: 48, w: 22, h: 14, c: "#a49c91" },
        { x: 26, y: 47, w: 20, h: 15, c: "#90887d" },
        { x: 48, y: 48, w: 14, h: 14, c: "#ada59a" }
      ];

      stones.forEach(s => {
        ctx.fillStyle = s.c;
        ctx.fillRect(s.x, s.y, s.w, s.h);

        // Highlight atas
        ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
        ctx.fillRect(s.x, s.y, s.w, 2);
        ctx.fillRect(s.x, s.y, 2, s.h);

        // Bayangan bawah
        ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
        ctx.fillRect(s.x, s.y + s.h - 2, s.w, 2);
        ctx.fillRect(s.x + s.w - 2, s.y, 2, s.h);
      });
    });
    this.cache.stonePath.wrapS = THREE.RepeatWrapping;
    this.cache.stonePath.wrapT = THREE.RepeatWrapping;
    return this.cache.stonePath;
  }

  // Dinding Tembok Batu Penahan Teras (Ashlar Stone Wall)
  getStoneWallTexture() {
    if (this.cache.stoneWall) return this.cache.stoneWall;
    this.cache.stoneWall = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#3e3731";
      ctx.fillRect(0, 0, w, h);

      // Balok-balok batu tersusun rapi berselang-seling
      const blockH = 16;
      const blockW = 32;
      const colors = ["#827b72", "#918980", "#736b63", "#9b9389"];

      for (let row = 0; row < 4; row++) {
        const y = row * blockH;
        const offset = (row % 2 === 0) ? 0 : blockW / 2;
        for (let col = -1; col < 3; col++) {
          const x = col * blockW + offset;
          const c = colors[(row * 2 + col + 4) % colors.length];
          ctx.fillStyle = c;
          ctx.fillRect(x + 1, y + 1, blockW - 2, blockH - 2);

          // Highlight tepi atas & kiri balok batu
          ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
          ctx.fillRect(x + 1, y + 1, blockW - 2, 2);
          ctx.fillRect(x + 1, y + 1, 2, blockH - 2);

          // Bayangan tepi bawah & sambungan adukan semen
          ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
          ctx.fillRect(x + 1, y + blockH - 3, blockW - 2, 2);
          ctx.fillRect(x + blockW - 3, y + 1, 2, blockH - 2);
        }
      }
    });
    this.cache.stoneWall.wrapS = THREE.RepeatWrapping;
    this.cache.stoneWall.wrapT = THREE.RepeatWrapping;
    return this.cache.stoneWall;
  }

  // Genteng Atap Rumah Tradisional (Dark Slate Roof Tiles)
  getRoofTileTexture() {
    if (this.cache.roofTile) return this.cache.roofTile;
    this.cache.roofTile = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#1e2226";
      ctx.fillRect(0, 0, w, h);

      const tileH = 16;
      const tileW = 16;
      for (let row = 0; row < 4; row++) {
        const y = row * tileH;
        const offset = (row % 2 === 0) ? 0 : 8;
        for (let col = -1; col < 5; col++) {
          const x = col * tileW + offset;
          ctx.fillStyle = (col + row) % 2 === 0 ? "#2f353b" : "#384048";
          ctx.beginPath();
          ctx.rect(x + 1, y + 1, tileW - 2, tileH - 2);
          ctx.fill();

          // Bevel highlight genteng
          ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
          ctx.fillRect(x + 1, y + 1, tileW - 2, 2);

          // Bayangan tumpang tindih genteng
          ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
          ctx.fillRect(x + 1, y + tileH - 3, tileW - 2, 2);
        }
      }
    });
    this.cache.roofTile.wrapS = THREE.RepeatWrapping;
    this.cache.roofTile.wrapT = THREE.RepeatWrapping;
    return this.cache.roofTile;
  }

  // Papan Kayu Pelataran Main & Foto (Deck)
  getWoodDeckTexture() {
    if (this.cache.woodDeck) return this.cache.woodDeck;
    this.cache.woodDeck = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#8d6346";
      ctx.fillRect(0, 0, w, h);

      // Papan kayu berderet horizontal
      const plankHeight = 16;
      for (let y = 0; y < h; y += plankHeight) {
        ctx.fillStyle = (y / plankHeight) % 2 === 0 ? "#9a6d4e" : "#885f42";
        ctx.fillRect(0, y, w, plankHeight - 2);

        // Garis batas antar papan
        ctx.fillStyle = "#5c3d28";
        ctx.fillRect(0, y + plankHeight - 2, w, 2);

        // Serat kayu
        ctx.fillStyle = "rgba(0,0,0,0.08)";
        ctx.fillRect(4, y + 4, w - 8, 1);
        ctx.fillRect(12, y + 9, w - 24, 1);

        // Paku paku kayu di ujung papan
        ctx.fillStyle = "#3e2516";
        ctx.fillRect(4, y + 7, 2, 2);
        ctx.fillRect(w - 6, y + 7, 2, 2);
      }
    });
    this.cache.woodDeck.wrapS = THREE.RepeatWrapping;
    this.cache.woodDeck.wrapT = THREE.RepeatWrapping;
    return this.cache.woodDeck;
  }

  // Papan Jembatan Kayu (Bridge Planks)
  getBridgeWoodTexture() {
    if (this.cache.bridgeWood) return this.cache.bridgeWood;
    this.cache.bridgeWood = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#7b5438";
      ctx.fillRect(0, 0, w, h);

      for (let x = 0; x < w; x += 16) {
        ctx.fillStyle = (x / 16) % 2 === 0 ? "#8c6040" : "#724d32";
        ctx.fillRect(x, 0, 14, h);

        ctx.fillStyle = "#4a2f1c";
        ctx.fillRect(x + 14, 0, 2, h);

        // Serat & paku
        ctx.fillStyle = "#3d2414";
        ctx.fillRect(x + 6, 6, 2, 2);
        ctx.fillRect(x + 6, h - 8, 2, 2);
      }
    });
    this.cache.bridgeWood.wrapS = THREE.RepeatWrapping;
    this.cache.bridgeWood.wrapT = THREE.RepeatWrapping;
    return this.cache.bridgeWood;
  }

  // Air Sungai Mengalir HD-2D (Biru Jernih Berkilau dengan Gelombang & Busa Putih)
  getRiverWaterTexture() {
    if (this.cache.riverWater) return this.cache.riverWater;
    this.cache.riverWater = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      // Dasar biru jernih cerah
      ctx.fillStyle = "#1e88e5";
      ctx.fillRect(0, 0, w, h);

      const waterColors = ["#29b6f6", "#4fc3f7", "#0288d1", "#81d4fa"];
      for (let y = 0; y < h; y += 8) {
        for (let x = 0; x < w; x += 16) {
          const c = waterColors[((x / 16) + (y / 8)) % waterColors.length];
          ctx.fillStyle = c;
          ctx.fillRect(x + (y % 16 === 0 ? 0 : 8), y, 14, 5);

          // Riak buih gelombang putih berkilau
          ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
          ctx.fillRect(x + (y % 16 === 0 ? 2 : 10), y + 1, 8, 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillRect(x + (y % 16 === 0 ? 4 : 12), y + 2, 4, 1);
        }
      }
    });
    this.cache.riverWater.wrapS = THREE.RepeatWrapping;
    this.cache.riverWater.wrapT = THREE.RepeatWrapping;
    return this.cache.riverWater;
  }

  // Dedaunan Cemara (Pine Needles)
  getPineNeedlesTexture() {
    if (this.cache.pineNeedles) return this.cache.pineNeedles;
    this.cache.pineNeedles = this.createCanvasTexture(32, 32, (ctx, w, h) => {
      ctx.fillStyle = "#244428";
      ctx.fillRect(0, 0, w, h);

      const tones = ["#2f5533", "#1e3a21", "#3b683f", "#18301b"];
      for (let i = 0; i < 90; i++) {
        const x = Math.floor(Math.random() * w);
        const y = Math.floor(Math.random() * h);
        ctx.fillStyle = tones[Math.floor(Math.random() * tones.length)];
        ctx.fillRect(x, y, 2, 4);
      }
    });
    this.cache.pineNeedles.wrapS = THREE.RepeatWrapping;
    this.cache.pineNeedles.wrapT = THREE.RepeatWrapping;
    return this.cache.pineNeedles;
  }

  // --- 2. TEKSTUR PROPS & BENDA INTERAKTIF ---

  // Peti Kayu Pelataran dengan Surat di Atasnya (Crate with Letter)
  getCrateLetterTexture() {
    if (this.cache.crateLetter) return this.cache.crateLetter;
    this.cache.crateLetter = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      // Papan kayu peti
      ctx.fillStyle = "#8a5d3b";
      ctx.fillRect(0, 0, w, h);

      // Bingkai tepi peti
      ctx.fillStyle = "#5c3a21";
      ctx.fillRect(0, 0, w, 4);
      ctx.fillRect(0, h - 4, w, 4);
      ctx.fillRect(0, 0, 4, h);
      ctx.fillRect(w - 4, 0, 4, h);

      // Palang silang diagonal peti
      ctx.strokeStyle = "#5c3a21";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(w, h);
      ctx.moveTo(w, 0); ctx.lineTo(0, h);
      ctx.stroke();

      // Amplop surat putih di atas peti dengan cap lilin merah
      ctx.fillStyle = "#fcfaf2";
      ctx.fillRect(16, 18, 32, 24);
      ctx.strokeStyle = "#d8cfbc";
      ctx.lineWidth = 1;
      ctx.strokeRect(16, 18, 32, 24);

      // Lipatan amplop
      ctx.strokeStyle = "#b8ab94";
      ctx.beginPath();
      ctx.moveTo(16, 18); ctx.lineTo(32, 30); ctx.lineTo(48, 18);
      ctx.stroke();

      // Cap stempel lilin merah di tengah
      ctx.fillStyle = "#d62828";
      ctx.beginPath();
      ctx.arc(32, 30, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    return this.cache.crateLetter;
  }

  // Papan Nama Kayu ("MAIN & FOTO" & "PETUNJUK")
  getSignboardTexture(text = "MAIN & FOTO") {
    const key = `sign_${text}`;
    if (this.cache[key]) return this.cache[key];
    this.cache[key] = this.createCanvasTexture(128, 48, (ctx, w, h) => {
      // Papan kayu cokelat tua
      ctx.fillStyle = "#3d2314";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#5c3822";
      ctx.fillRect(3, 3, w - 6, h - 6);

      // Garis tepi emas krem
      ctx.strokeStyle = "#ffd166";
      ctx.lineWidth = 2;
      ctx.strokeRect(5, 5, w - 10, h - 10);

      // Paku sudut
      ctx.fillStyle = "#22130b";
      ctx.fillRect(7, 7, 3, 3);
      ctx.fillRect(w - 10, 7, 3, 3);
      ctx.fillRect(7, h - 10, 3, 3);
      ctx.fillRect(w - 10, h - 10, 3, 3);

      // Teks pixel retro
      ctx.fillStyle = "#fcfaf2";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, w / 2, h / 2);
    });
    return this.cache[key];
  }

  // Tenda Kanopi Belang Hijau-Putih Arcade (Awning)
  getAwningTexture() {
    if (this.cache.awning) return this.cache.awning;
    this.cache.awning = this.createCanvasTexture(32, 32, (ctx, w, h) => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);

      // Garis hijau lumut tebal
      ctx.fillStyle = "#2d5a27";
      ctx.fillRect(0, 0, 16, h);
    });
    this.cache.awning.wrapS = THREE.RepeatWrapping;
    this.cache.awning.wrapT = THREE.RepeatWrapping;
    return this.cache.awning;
  }

  // Marquee Mesin Arcade "HEYTML PLAY"
  getArcadeMarqueeTexture() {
    if (this.cache.arcadeMarquee) return this.cache.arcadeMarquee;
    this.cache.arcadeMarquee = this.createCanvasTexture(128, 36, (ctx, w, h) => {
      ctx.fillStyle = "#1e1428";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#e63946";
      ctx.fillRect(2, 2, w - 4, h - 4);

      ctx.fillStyle = "#1a0f24";
      ctx.fillRect(4, 4, w - 8, h - 8);

      ctx.fillStyle = "#ffd166";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("HEYTML PLAY", w / 2, h / 2);
    });
    return this.cache.arcadeMarquee;
  }

  // Layar Tetris Mini Arcade Screen
  getArcadeScreenTexture() {
    if (this.cache.arcadeScreen) return this.cache.arcadeScreen;
    this.cache.arcadeScreen = this.createCanvasTexture(96, 96, (ctx, w, h) => {
      ctx.fillStyle = "#0d1b2a";
      ctx.fillRect(0, 0, w, h);

      // Frame grid tetris mini
      ctx.strokeStyle = "#415a77";
      ctx.lineWidth = 1;
      for (let x = 8; x < w; x += 8) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 8; y < h; y += 8) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // Balok-balok warna-warni tetris tersusun di bawah
      const colors = ["#00f0f0", "#f0a000", "#0000f0", "#f0f000", "#00f000", "#a000f0", "#f00000"];
      for (let r = 8; r < 12; r++) {
        for (let c = 1; c < 11; c++) {
          if (Math.random() > 0.3) {
            ctx.fillStyle = colors[(r + c) % colors.length];
            ctx.fillRect(c * 8 + 1, r * 8 + 1, 6, 6);
          }
        }
      }
    });
    return this.cache.arcadeScreen;
  }

  // --- 3. SPRITE KARAKTER & NPC SESUAI VIDEO REFERENSI ---

  // Sprite Pemain: Gadis Berjilbab Sage/Olive Green & Gaun Krem (Sesuai Video)
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

          const step = frame === 1 ? -3 : (frame === 2 ? 3 : 0);
          const bounce = (frame === 1 || frame === 2) ? -1 : 0;

          // 1. Kaki & Sepatu Cokelat
          ctx.fillStyle = "#4a3525";
          if (dir === "down" || dir === "up") {
            ctx.fillRect(cx - 8, cy + 18 + (frame === 1 ? -2 : 0) + bounce, 6, 7);
            ctx.fillRect(cx + 2, cy + 18 + (frame === 2 ? -2 : 0) + bounce, 6, 7);
          } else {
            ctx.fillRect(cx - 4 + step, cy + 18 + bounce, 8, 7);
          }

          // 2. Rok Panjang Krem / Tan Lembut
          ctx.fillStyle = "#d6c7b2";
          ctx.beginPath();
          ctx.moveTo(cx - 11, cy + 20 + bounce);
          ctx.lineTo(cx + 11, cy + 20 + bounce);
          ctx.lineTo(cx + 8, cy + 4 + bounce);
          ctx.lineTo(cx - 8, cy + 4 + bounce);
          ctx.closePath();
          ctx.fill();

          // 3. Atasan Blus Krem Muda
          ctx.fillStyle = "#f5eee4";
          ctx.fillRect(cx - 8, cy - 2 + bounce, 16, 8);

          // 4. Jilbab / Hijab Hijau Sage/Olive (Warna di video: #8a9a7b)
          ctx.fillStyle = "#879879";

          if (dir === "down") {
            // Wajah & Mata
            ctx.fillStyle = "#ffdfba";
            ctx.fillRect(cx - 7, cy - 14 + bounce, 14, 12);

            // Jilbab membungkus kepala
            ctx.fillStyle = "#879879";
            ctx.fillRect(cx - 9, cy - 20 + bounce, 18, 7); // Atas kepala
            ctx.fillRect(cx - 10, cy - 17 + bounce, 4, 15); // Kiri wajah
            ctx.fillRect(cx + 6, cy - 17 + bounce, 4, 15);  // Kanan wajah

            // Ujung kain jilbab menjuntai di bahu
            ctx.fillRect(cx - 9, cy - 2 + bounce, 18, 7);
            ctx.fillStyle = "#758668";
            ctx.fillRect(cx - 8, cy + 4 + bounce, 16, 2);

            // Mata Anime / Pixel Ekspresif
            ctx.fillStyle = "#2c1c0e";
            ctx.fillRect(cx - 5, cy - 11 + bounce, 3, 4);
            ctx.fillRect(cx + 2, cy - 11 + bounce, 3, 4);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(cx - 5, cy - 11 + bounce, 1, 1);
            ctx.fillRect(cx + 2, cy - 11 + bounce, 1, 1);

            // Rona Pipi Merona Halus
            ctx.fillStyle = "#f4a261";
            ctx.fillRect(cx - 6, cy - 6 + bounce, 2, 2);
            ctx.fillRect(cx + 4, cy - 6 + bounce, 2, 2);

            // Senyum Manis
            ctx.fillStyle = "#b05d5d";
            ctx.fillRect(cx - 1, cy - 5 + bounce, 2, 1);

          } else if (dir === "up") {
            // Belakang jilbab menutup penuh
            ctx.fillStyle = "#879879";
            ctx.fillRect(cx - 9, cy - 20 + bounce, 18, 22);
            ctx.fillStyle = "#758668";
            ctx.fillRect(cx - 7, cy + 1 + bounce, 14, 5);

          } else {
            // Tampak Samping (Left / Right)
            const isLeft = dir === "left";
            const faceX = isLeft ? cx - 7 : cx + 2;
            const eyeX = isLeft ? cx - 5 : cx + 3;

            // Wajah samping
            ctx.fillStyle = "#ffdfba";
            ctx.fillRect(faceX, cy - 14 + bounce, 6, 11);

            // Mata
            ctx.fillStyle = "#2c1c0e";
            ctx.fillRect(eyeX, cy - 11 + bounce, 2, 4);

            // Jilbab samping
            ctx.fillStyle = "#879879";
            ctx.fillRect(cx - 8, cy - 20 + bounce, 16, 7);
            ctx.fillRect(isLeft ? cx - 2 : cx - 8, cy - 18 + bounce, 10, 22);
            ctx.fillStyle = "#758668";
            ctx.fillRect(cx - 6, cy + 2 + bounce, 12, 4);
          }
        }
      });
    });
    return this.cache.playerSheet;
  }

  // Sprite NPC Paman Jembatan (Pria Berkumis, Rompi Cokelat - Frame 00:20)
  getNpcPamanSprite() {
    if (this.cache.npcPaman) return this.cache.npcPaman;
    this.cache.npcPaman = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      const cx = 32, cy = 32;

      // Celana abu-abu & sepatu
      ctx.fillStyle = "#333333";
      ctx.fillRect(cx - 6, cy + 22, 5, 5);
      ctx.fillRect(cx + 1, cy + 22, 5, 5);
      ctx.fillStyle = "#5c677d";
      ctx.fillRect(cx - 7, cy + 10, 6, 13);
      ctx.fillRect(cx + 1, cy + 10, 6, 13);

      // Kemeja putih & Rompi cokelat
      ctx.fillStyle = "#f0ebd8";
      ctx.fillRect(cx - 8, cy - 2, 16, 13);
      ctx.fillStyle = "#6f4e37";
      ctx.fillRect(cx - 9, cy - 2, 5, 13);
      ctx.fillRect(cx + 4, cy - 2, 5, 13);

      // Wajah
      ctx.fillStyle = "#e0a96d";
      ctx.fillRect(cx - 6, cy - 14, 12, 12);

      // Kumis Cokelat Khas Paman
      ctx.fillStyle = "#3e2723";
      ctx.fillRect(cx - 5, cy - 4, 10, 3);

      // Mata & Alis
      ctx.fillStyle = "#212529";
      ctx.fillRect(cx - 4, cy - 9, 2, 3);
      ctx.fillRect(cx + 2, cy - 9, 2, 3);

      // Rambut pendek cokelat
      ctx.fillStyle = "#3e2723";
      ctx.fillRect(cx - 7, cy - 18, 14, 5);
      ctx.fillRect(cx - 8, cy - 16, 2, 8);
      ctx.fillRect(cx + 6, cy - 16, 2, 8);
    });
    return this.cache.npcPaman;
  }

  // Sprite NPC Kakek Bijak (Jubah Hijau & Jenggot Putih Panjang - Frame 00:26)
  getNpcKakekSprite() {
    if (this.cache.npcKakek) return this.cache.npcKakek;
    this.cache.npcKakek = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      const cx = 32, cy = 32;

      // Jubah Hijau Panjang
      ctx.fillStyle = "#3a5a2a";
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy + 26);
      ctx.lineTo(cx + 12, cy + 26);
      ctx.lineTo(cx + 8, cy - 4);
      ctx.lineTo(cx - 8, cy - 4);
      ctx.closePath();
      ctx.fill();

      // Ikat pinggang tali cokelat
      ctx.fillStyle = "#7f5539";
      ctx.fillRect(cx - 9, cy + 6, 18, 3);

      // Wajah
      ctx.fillStyle = "#f5d0b0";
      ctx.fillRect(cx - 6, cy - 14, 12, 10);

      // Jenggot Putih Lebat & Panjang (Khas Kakek)
      ctx.fillStyle = "#f8f9fa";
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 5);
      ctx.lineTo(cx + 6, cy - 5);
      ctx.lineTo(cx + 4, cy + 9);
      ctx.lineTo(cx, cy + 13);
      ctx.lineTo(cx - 4, cy + 9);
      ctx.closePath();
      ctx.fill();

      // Mata tersenyum sipit ramah
      ctx.fillStyle = "#333333";
      ctx.fillRect(cx - 4, cy - 9, 2, 2);
      ctx.fillRect(cx + 2, cy - 9, 2, 2);

      // Rambut putih
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(cx - 8, cy - 18, 16, 6);
      ctx.fillRect(cx - 9, cy - 15, 2, 8);
      ctx.fillRect(cx + 7, cy - 15, 2, 8);

      // Tongkat kayu di tangan kanan
      ctx.fillStyle = "#9c6644";
      ctx.fillRect(cx + 10, cy - 12, 2, 38);
      ctx.fillRect(cx + 8, cy - 14, 4, 3);
    });
    return this.cache.npcKakek;
  }

  // Sprite NPC Bibi Rina (Perawat Bunga & Rumah di Teras)
  getNpcRinaSprite() {
    if (this.cache.npcRina) return this.cache.npcRina;
    this.cache.npcRina = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      const cx = 32, cy = 32;

      // Sepatu cokelat
      ctx.fillStyle = "#4a3525";
      ctx.fillRect(cx - 6, cy + 24, 5, 4);
      ctx.fillRect(cx + 1, cy + 24, 5, 4);

      // Rok gaun krem panjang
      ctx.fillStyle = "#e9d8a6";
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + 24);
      ctx.lineTo(cx + 10, cy + 24);
      ctx.lineTo(cx + 7, cy + 4);
      ctx.lineTo(cx - 7, cy + 4);
      ctx.closePath();
      ctx.fill();

      // Apron / Celemek Bunga Warna Terakota Lembut
      ctx.fillStyle = "#e07a5f";
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy + 22);
      ctx.lineTo(cx + 8, cy + 22);
      ctx.lineTo(cx + 6, cy - 1);
      ctx.lineTo(cx - 6, cy - 1);
      ctx.closePath();
      ctx.fill();

      // Tali apron silang
      ctx.fillStyle = "#f4f1de";
      ctx.fillRect(cx - 5, cy - 3, 2, 8);
      ctx.fillRect(cx + 3, cy - 3, 2, 8);

      // Kantong apron dengan bunga kecil
      ctx.fillStyle = "#f4f1de";
      ctx.fillRect(cx - 4, cy + 10, 8, 7);
      ctx.fillStyle = "#f2cc8f";
      ctx.fillRect(cx - 2, cy + 12, 4, 3);
      ctx.fillStyle = "#81b29a";
      ctx.fillRect(cx, cy + 8, 2, 4);

      // Lengan baju hijau sage
      ctx.fillStyle = "#81b29a";
      ctx.fillRect(cx - 9, cy - 2, 3, 11);
      ctx.fillRect(cx + 6, cy - 2, 3, 11);

      // Tangan
      ctx.fillStyle = "#f5d0b0";
      ctx.fillRect(cx - 9, cy + 9, 3, 3);
      ctx.fillRect(cx + 6, cy + 9, 3, 3);

      // Keranjang bunga kecil di tangan kiri
      ctx.fillStyle = "#9c6644";
      ctx.fillRect(cx + 8, cy + 8, 5, 6);
      ctx.fillStyle = "#e76f51";
      ctx.fillRect(cx + 9, cy + 6, 2, 2);
      ctx.fillStyle = "#f4a261";
      ctx.fillRect(cx + 11, cy + 6, 2, 2);

      // Wajah
      ctx.fillStyle = "#f5d0b0";
      ctx.fillRect(cx - 6, cy - 14, 12, 11);

      // Mata ramah & rona pipi (blush)
      ctx.fillStyle = "#264653";
      ctx.fillRect(cx - 4, cy - 9, 2, 2);
      ctx.fillRect(cx + 2, cy - 9, 2, 2);
      ctx.fillStyle = "#e07a5f";
      ctx.fillRect(cx - 6, cy - 6, 2, 2);
      ctx.fillRect(cx + 4, cy - 6, 2, 2);

      // Senyum
      ctx.fillStyle = "#a34343";
      ctx.fillRect(cx - 2, cy - 5, 4, 1);

      // Bandana / Scarf Kepala Warna Terakota
      ctx.fillStyle = "#e07a5f";
      ctx.fillRect(cx - 7, cy - 16, 14, 4);
      ctx.fillRect(cx - 8, cy - 14, 2, 6);
      ctx.fillRect(cx + 6, cy - 14, 2, 6);

      // Sanggul Rambut Cokelat di Atas
      ctx.fillStyle = "#5c4033";
      ctx.beginPath();
      ctx.arc(cx, cy - 17, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    return this.cache.npcRina;
  }

  // Sprite NPC Dito (Jaket Biru, Celana Jeans, Topi Santai di Pelataran Arcade)
  getNpcDitoSprite() {
    if (this.cache.npcDito) return this.cache.npcDito;
    this.cache.npcDito = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      const cx = 32, cy = 32;

      // Sepatu sneakers putih
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - 6, cy + 24, 5, 4);
      ctx.fillRect(cx + 1, cy + 24, 5, 4);

      // Celana jeans biru gelap
      ctx.fillStyle = "#1d3557";
      ctx.fillRect(cx - 7, cy + 10, 6, 15);
      ctx.fillRect(cx + 1, cy + 10, 6, 15);

      // Kaos putih & Jaket kasual teal/biru
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - 4, cy - 2, 8, 12);
      ctx.fillStyle = "#457b9d";
      ctx.fillRect(cx - 9, cy - 3, 5, 14);
      ctx.fillRect(cx + 4, cy - 3, 5, 14);

      // Wajah
      ctx.fillStyle = "#f5d0b0";
      ctx.fillRect(cx - 6, cy - 13, 12, 11);

      // Mata & Senyum ramah
      ctx.fillStyle = "#1d3557";
      ctx.fillRect(cx - 4, cy - 9, 2, 2);
      ctx.fillRect(cx + 2, cy - 9, 2, 2);
      ctx.fillStyle = "#e63946";
      ctx.fillRect(cx - 2, cy - 5, 4, 1);

      // Topi pet kasual terbalik / ke samping
      ctx.fillStyle = "#e63946";
      ctx.fillRect(cx - 7, cy - 17, 14, 5);
      ctx.fillRect(cx - 9, cy - 15, 3, 3);
    });
    return this.cache.npcDito;
  }

  // Sprite NPC Bu RT (Ibu Warga Desa Berbaju Batik & Kacamata Ramah)
  getNpcBuRtSprite() {
    if (this.cache.npcBuRt) return this.cache.npcBuRt;
    this.cache.npcBuRt = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      const cx = 32, cy = 32;

      // Sandal selop hitam
      ctx.fillStyle = "#2b2b2b";
      ctx.fillRect(cx - 6, cy + 24, 5, 4);
      ctx.fillRect(cx + 1, cy + 24, 5, 4);

      // Kain jarik / rok panjang batik cokelat tanah
      ctx.fillStyle = "#7f4f24";
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + 24);
      ctx.lineTo(cx + 10, cy + 24);
      ctx.lineTo(cx + 7, cy + 8);
      ctx.lineTo(cx - 7, cy + 8);
      ctx.closePath();
      ctx.fill();

      // Baju atasan kebaya terakota hangat
      ctx.fillStyle = "#c97b63";
      ctx.fillRect(cx - 8, cy - 3, 16, 12);
      ctx.fillStyle = "#ddbea9";
      ctx.fillRect(cx - 2, cy - 3, 4, 12);

      // Selendang batik melintang di bahu
      ctx.fillStyle = "#936639";
      ctx.fillRect(cx - 8, cy - 3, 4, 14);

      // Lengan baju & tangan
      ctx.fillStyle = "#c97b63";
      ctx.fillRect(cx - 10, cy - 2, 3, 11);
      ctx.fillRect(cx + 7, cy - 2, 3, 11);
      ctx.fillStyle = "#f5d0b0";
      ctx.fillRect(cx - 10, cy + 9, 3, 3);
      ctx.fillRect(cx + 7, cy + 9, 3, 3);

      // Wajah
      ctx.fillStyle = "#f5d0b0";
      ctx.fillRect(cx - 6, cy - 14, 12, 11);

      // Kacamata bulat khas Bu RT
      ctx.strokeStyle = "#582f0e";
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 5, cy - 10, 4, 4);
      ctx.strokeRect(cx + 1, cy - 10, 4, 4);
      ctx.fillStyle = "#2b2b2b";
      ctx.fillRect(cx - 4, cy - 9, 2, 2);
      ctx.fillRect(cx + 2, cy - 9, 2, 2);

      // Rona pipi & senyum ibu yang hangat
      ctx.fillStyle = "#e07a5f";
      ctx.fillRect(cx - 6, cy - 6, 2, 2);
      ctx.fillRect(cx + 4, cy - 6, 2, 2);
      ctx.fillStyle = "#b02a37";
      ctx.fillRect(cx - 2, cy - 5, 4, 1);

      // Rambut hitam bersanggul rapi di belakang
      ctx.fillStyle = "#2b2b2b";
      ctx.fillRect(cx - 7, cy - 17, 14, 5);
      ctx.fillRect(cx - 8, cy - 15, 2, 7);
      ctx.fillRect(cx + 6, cy - 15, 2, 7);
      ctx.beginPath();
      ctx.arc(cx + 6, cy - 16, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    return this.cache.npcBuRt;
  }

  // Sprite NPC Pak RT Broto (Ketua RT Berpeci Hitam & Kemeja Batik Kasual)
  getNpcPakRtSprite() {
    if (this.cache.npcPakRt) return this.cache.npcPakRt;
    this.cache.npcPakRt = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      const cx = 32, cy = 32;

      // Sepatu pantofel hitam
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(cx - 6, cy + 24, 5, 4);
      ctx.fillRect(cx + 1, cy + 24, 5, 4);

      // Celana bahan abu-abu gelap
      ctx.fillStyle = "#343a40";
      ctx.fillRect(cx - 7, cy + 10, 6, 15);
      ctx.fillRect(cx + 1, cy + 10, 6, 15);

      // Kemeja batik biru tua / lurik
      ctx.fillStyle = "#3d5a80";
      ctx.fillRect(cx - 8, cy - 3, 16, 14);
      ctx.fillStyle = "#98c1d9";
      for (let y = cy - 2; y < cy + 10; y += 4) {
        ctx.fillRect(cx - 6, y, 12, 1);
      }

      // Lengan baju
      ctx.fillStyle = "#3d5a80";
      ctx.fillRect(cx - 10, cy - 2, 3, 11);
      ctx.fillRect(cx + 7, cy - 2, 3, 11);
      ctx.fillStyle = "#e0a96d";
      ctx.fillRect(cx - 10, cy + 9, 3, 3);
      ctx.fillRect(cx + 7, cy + 9, 3, 3);

      // Wajah berwibawa tapi ramah
      ctx.fillStyle = "#e0a96d";
      ctx.fillRect(cx - 6, cy - 13, 12, 11);

      // Mata & Kumis tipis Pak RT
      ctx.fillStyle = "#212529";
      ctx.fillRect(cx - 4, cy - 9, 2, 2);
      ctx.fillRect(cx + 2, cy - 9, 2, 2);
      ctx.fillStyle = "#343a40";
      ctx.fillRect(cx - 4, cy - 5, 8, 2);

      // Peci hitam di kepala
      ctx.fillStyle = "#111111";
      ctx.fillRect(cx - 7, cy - 19, 14, 7);
      ctx.fillStyle = "#222222";
      ctx.fillRect(cx - 6, cy - 20, 12, 2);
    });
    return this.cache.npcPakRt;
  }

  // Sprite NPC Mbak Tari (Pemudi Desa Bergaun Lilac Ceria)
  getNpcMbakTariSprite() {
    if (this.cache.npcMbakTari) return this.cache.npcMbakTari;
    this.cache.npcMbakTari = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      const cx = 32, cy = 32;

      // Sepatu flat putih
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - 6, cy + 24, 5, 4);
      ctx.fillRect(cx + 1, cy + 24, 5, 4);

      // Rok gaun ungu lilac manis
      ctx.fillStyle = "#c77dff";
      ctx.beginPath();
      ctx.moveTo(cx - 9, cy + 24);
      ctx.lineTo(cx + 9, cy + 24);
      ctx.lineTo(cx + 6, cy + 6);
      ctx.lineTo(cx - 6, cy + 6);
      ctx.closePath();
      ctx.fill();

      // Atasan cardigan pastel krem
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(cx - 7, cy - 3, 14, 10);
      ctx.fillStyle = "#e0aaff";
      ctx.fillRect(cx - 2, cy - 3, 4, 10);

      // Lengan & tangan
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(cx - 9, cy - 2, 3, 10);
      ctx.fillRect(cx + 6, cy - 2, 3, 10);
      ctx.fillStyle = "#f5d0b0";
      ctx.fillRect(cx - 9, cy + 8, 3, 3);
      ctx.fillRect(cx + 6, cy + 8, 3, 3);

      // Wajah manis & mata binar
      ctx.fillStyle = "#f5d0b0";
      ctx.fillRect(cx - 6, cy - 14, 12, 11);
      ctx.fillStyle = "#240046";
      ctx.fillRect(cx - 4, cy - 9, 2, 2);
      ctx.fillRect(cx + 2, cy - 9, 2, 2);

      // Senyum ramah & blush
      ctx.fillStyle = "#ff70a6";
      ctx.fillRect(cx - 6, cy - 6, 2, 2);
      ctx.fillRect(cx + 4, cy - 6, 2, 2);
      ctx.fillStyle = "#d90429";
      ctx.fillRect(cx - 2, cy - 5, 4, 1);

      // Rambut cokelat kuncir samping (ponytail)
      ctx.fillStyle = "#6f4e37";
      ctx.fillRect(cx - 7, cy - 17, 14, 5);
      ctx.fillRect(cx - 8, cy - 14, 2, 7);
      ctx.fillRect(cx + 6, cy - 14, 2, 7);
      // Kuncir ekor kuda samping
      ctx.fillRect(cx + 7, cy - 16, 4, 9);
      ctx.fillStyle = "#ff70a6";
      ctx.fillRect(cx + 6, cy - 17, 3, 3); // pita kuncir pink
    });
    return this.cache.npcMbakTari;
  }

  // 1. Sprite Nenek Minah di Sumur Tua (Kebaya Hijau Lumut, Jarik Batik & Sanggul Uban)
  getNpcNenekSprite() {
    if (this.cache.npcNenek) return this.cache.npcNenek;
    this.cache.npcNenek = this.createCanvasTexture(32, 38, (ctx, w, h) => {
      const cx = 16;
      const cy = 20;

      // Selop kayu tradisional
      ctx.fillStyle = "#4a3525";
      ctx.fillRect(cx - 5, cy + 14, 4, 3);
      ctx.fillRect(cx + 1, cy + 14, 4, 3);

      // Kain jarik batik cokelat tanah
      ctx.fillStyle = "#6c584c";
      ctx.fillRect(cx - 7, cy + 7, 14, 8);
      // Motif batik titik emas
      ctx.fillStyle = "#dda15e";
      for (let bx = cx - 6; bx <= cx + 4; bx += 3) {
        ctx.fillRect(bx, cy + 8, 1, 1);
        ctx.fillRect(bx + 1, cy + 11, 1, 1);
      }

      // Kebaya panjang hijau lumut tua
      ctx.fillStyle = "#556b2f";
      ctx.fillRect(cx - 7, cy - 2, 14, 10);
      // Stagen / selendang krem di pinggang
      ctx.fillStyle = "#faedcd";
      ctx.fillRect(cx - 7, cy + 4, 14, 3);

      // Kerah kebaya krem
      ctx.fillStyle = "#fefae0";
      ctx.fillRect(cx - 2, cy - 2, 4, 7);

      // Lengan kebaya
      ctx.fillStyle = "#556b2f";
      ctx.fillRect(cx - 9, cy - 1, 3, 9);
      ctx.fillRect(cx + 6, cy - 1, 3, 9);
      // Tangan sepuh
      ctx.fillStyle = "#e2b896";
      ctx.fillRect(cx - 9, cy + 8, 3, 3);
      ctx.fillRect(cx + 6, cy + 8, 3, 3);

      // Wajah nenek ramah
      ctx.fillStyle = "#e2b896";
      ctx.fillRect(cx - 6, cy - 13, 12, 11);

      // Kacamata bulat vintage
      ctx.strokeStyle = "#495057";
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 5, cy - 8, 3, 3);
      ctx.strokeRect(cx + 2, cy - 8, 3, 3);
      ctx.fillStyle = "#495057";
      ctx.fillRect(cx - 2, cy - 7, 4, 1); // gagang kacamata

      // Mata tersenyum hangat
      ctx.fillStyle = "#2b2d42";
      ctx.fillRect(cx - 4, cy - 7, 1, 1);
      ctx.fillRect(cx + 3, cy - 7, 1, 1);

      // Kerutan senyum & bibir ramah
      ctx.fillStyle = "#bc6c25";
      ctx.fillRect(cx - 2, cy - 4, 4, 1);

      // Rambut abu-abu uban & sanggul tradisional
      ctx.fillStyle = "#adb5bd";
      ctx.fillRect(cx - 7, cy - 16, 14, 5);
      ctx.fillRect(cx - 8, cy - 13, 2, 7);
      ctx.fillRect(cx + 6, cy - 13, 2, 7);
      // Sanggul atas berhias tusuk konde emas
      ctx.fillRect(cx - 4, cy - 18, 8, 3);
      ctx.fillStyle = "#d4af37";
      ctx.fillRect(cx - 1, cy - 19, 2, 4);
    });
    return this.cache.npcNenek;
  }

  // 2. Sprite Mas Bayu si Pemancing (Caping Jerami, Rompi Indigo & Celana Santai)
  getNpcBayuSprite() {
    if (this.cache.npcBayu) return this.cache.npcBayu;
    this.cache.npcBayu = this.createCanvasTexture(32, 38, (ctx, w, h) => {
      const cx = 16;
      const cy = 20;

      // Sandal jepit kulit
      ctx.fillStyle = "#5c4033";
      ctx.fillRect(cx - 5, cy + 14, 4, 3);
      ctx.fillRect(cx + 1, cy + 14, 4, 3);

      // Celana pendek santai cokelat pasir
      ctx.fillStyle = "#8d7b68";
      ctx.fillRect(cx - 6, cy + 6, 12, 8);
      ctx.fillStyle = "#2b2b2b";
      ctx.fillRect(cx - 1, cy + 9, 2, 5); // belahan celana

      // Rompi indigo biru di atas kaos putih
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(cx - 6, cy - 2, 12, 9);
      ctx.fillStyle = "#1d3557";
      ctx.fillRect(cx - 7, cy - 2, 3, 9);
      ctx.fillRect(cx + 4, cy - 2, 3, 9);

      // Lengan kulit cokelat sehat
      ctx.fillStyle = "#d4a373";
      ctx.fillRect(cx - 9, cy - 1, 3, 8);
      ctx.fillRect(cx + 6, cy - 1, 3, 8);
      ctx.fillRect(cx - 9, cy + 7, 3, 3);
      ctx.fillRect(cx + 6, cy + 7, 3, 3);

      // Tongkat pancing bambu di tangan kanan
      ctx.fillStyle = "#6b705c";
      ctx.fillRect(cx + 8, cy - 14, 2, 28);
      ctx.fillStyle = "#e9d8a6";
      ctx.fillRect(cx + 8, cy - 16, 2, 2); // pucuk pancing

      // Wajah pemuda ramah
      ctx.fillStyle = "#d4a373";
      ctx.fillRect(cx - 5, cy - 12, 10, 10);
      ctx.fillStyle = "#1b263b";
      ctx.fillRect(cx - 3, cy - 8, 2, 2);
      ctx.fillRect(cx + 2, cy - 8, 2, 2);
      ctx.fillStyle = "#bc6c25";
      ctx.fillRect(cx - 1, cy - 5, 3, 1);

      // Topi Caping Jerami Tradisional Segitiga Lebar
      ctx.fillStyle = "#e9c46a";
      ctx.beginPath();
      ctx.moveTo(cx, cy - 18);
      ctx.lineTo(cx - 11, cy - 11);
      ctx.lineTo(cx + 11, cy - 11);
      ctx.closePath();
      ctx.fill();

      // Tekstur anyaman caping
      ctx.fillStyle = "#d4a373";
      ctx.fillRect(cx - 6, cy - 13, 12, 1);
      ctx.fillRect(cx - 3, cy - 15, 6, 1);
    });
    return this.cache.npcBayu;
  }

  // 3. Sprite Mang Ujang di Api Unggun (Ikat Kepala Sunda, Pangsi Cokelat & Jagung Bakar)
  getNpcMangUjangSprite() {
    if (this.cache.npcMangUjang) return this.cache.npcMangUjang;
    this.cache.npcMangUjang = this.createCanvasTexture(32, 38, (ctx, w, h) => {
      const cx = 16;
      const cy = 20;

      // Sandal selop hitam
      ctx.fillStyle = "#212529";
      ctx.fillRect(cx - 5, cy + 14, 4, 3);
      ctx.fillRect(cx + 1, cy + 14, 4, 3);

      // Celana pangsi longgar hitam
      ctx.fillStyle = "#2b2d42";
      ctx.fillRect(cx - 7, cy + 6, 14, 8);
      ctx.fillStyle = "#161a1d";
      ctx.fillRect(cx - 1, cy + 8, 2, 6);

      // Baju pangsi cokelat tua & sabuk merah
      ctx.fillStyle = "#4a3525";
      ctx.fillRect(cx - 7, cy - 3, 14, 10);
      ctx.fillStyle = "#ba181b";
      ctx.fillRect(cx - 7, cy + 4, 14, 2); // sabuk ikat merah

      // Lengan baju pangsi
      ctx.fillStyle = "#4a3525";
      ctx.fillRect(cx - 9, cy - 2, 3, 8);
      ctx.fillRect(cx + 6, cy - 2, 3, 8);
      ctx.fillStyle = "#cb997e";
      ctx.fillRect(cx - 9, cy + 6, 3, 3);
      ctx.fillRect(cx + 6, cy + 6, 3, 3);

      // Jagung bakar di tangan kiri
      ctx.fillStyle = "#ffb703";
      ctx.fillRect(cx - 11, cy + 1, 3, 6);
      ctx.fillStyle = "#603813";
      ctx.fillRect(cx - 10, cy + 7, 1, 4); // tusukan kayu

      // Wajah Mang Ujang tersenyum lebar & kumis tebal
      ctx.fillStyle = "#cb997e";
      ctx.fillRect(cx - 5, cy - 13, 10, 10);
      ctx.fillStyle = "#1b1b1b";
      ctx.fillRect(cx - 3, cy - 9, 2, 2);
      ctx.fillRect(cx + 2, cy - 9, 2, 2);
      // Kumis khas
      ctx.fillStyle = "#161a1d";
      ctx.fillRect(cx - 4, cy - 6, 9, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - 1, cy - 4, 3, 1); // gigi ramah

      // Ikat kepala / Udeng Sunda merah batik
      ctx.fillStyle = "#a4161a";
      ctx.fillRect(cx - 7, cy - 16, 14, 5);
      ctx.fillStyle = "#e5383b";
      ctx.fillRect(cx + 4, cy - 18, 4, 4); // simpul udeng atas
    });
    return this.cache.npcMangUjang;
  }

  // 4. Sprite Teh Sarah di Kebun Bunga (Bandana Kuning, Celemek Hijau & Bunga Daisy)
  getNpcTehSarahSprite() {
    if (this.cache.npcTehSarah) return this.cache.npcTehSarah;
    this.cache.npcTehSarah = this.createCanvasTexture(32, 38, (ctx, w, h) => {
      const cx = 16;
      const cy = 20;

      // Sepatu bot kebun cokelat
      ctx.fillStyle = "#6f4e37";
      ctx.fillRect(cx - 5, cy + 14, 4, 3);
      ctx.fillRect(cx + 1, cy + 14, 4, 3);

      // Rok terakota santai
      ctx.fillStyle = "#e07a5f";
      ctx.fillRect(cx - 6, cy + 6, 12, 8);

      // Baju putih & celemek berkebun hijau muda
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(cx - 6, cy - 3, 12, 10);
      ctx.fillStyle = "#81b29a";
      ctx.fillRect(cx - 5, cy - 1, 10, 8);
      // Kantong celemek berhias bunga aster kecil
      ctx.fillStyle = "#3d405b";
      ctx.fillRect(cx - 3, cy + 2, 6, 4);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - 1, cy + 1, 2, 2);
      ctx.fillStyle = "#f4a261";
      ctx.fillRect(cx, cy + 2, 1, 1); // putik bunga

      // Lengan baju
      ctx.fillStyle = "#f8f9fa";
      ctx.fillRect(cx - 8, cy - 2, 3, 8);
      ctx.fillRect(cx + 5, cy - 2, 3, 8);
      ctx.fillStyle = "#f5d0b0";
      ctx.fillRect(cx - 8, cy + 6, 3, 3);
      ctx.fillRect(cx + 5, cy + 6, 3, 3);

      // Wajah ceria & pipi merah
      ctx.fillStyle = "#f5d0b0";
      ctx.fillRect(cx - 5, cy - 13, 10, 10);
      ctx.fillStyle = "#3d405b";
      ctx.fillRect(cx - 3, cy - 9, 2, 2);
      ctx.fillRect(cx + 2, cy - 9, 2, 2);
      ctx.fillStyle = "#ff758f";
      ctx.fillRect(cx - 5, cy - 6, 2, 2);
      ctx.fillRect(cx + 3, cy - 6, 2, 2);
      ctx.fillStyle = "#e63946";
      ctx.fillRect(cx - 1, cy - 5, 3, 1);

      // Rambut bergelombang & bandana kuning cerah
      ctx.fillStyle = "#4a2810";
      ctx.fillRect(cx - 6, cy - 16, 12, 5);
      ctx.fillRect(cx - 7, cy - 13, 2, 8);
      ctx.fillRect(cx + 5, cy - 13, 2, 8);
      // Bandana kuning
      ctx.fillStyle = "#f9c74f";
      ctx.fillRect(cx - 6, cy - 15, 12, 2);
    });
    return this.cache.npcTehSarah;
  }

  // 5. Sprite Adit di Pelataran Arcade (Topi Baseball Terbalik, Kaos Strip Merah & Celana Pendek)
  getNpcAditSprite() {
    if (this.cache.npcAdit) return this.cache.npcAdit;
    this.cache.npcAdit = this.createCanvasTexture(32, 38, (ctx, w, h) => {
      const cx = 16;
      const cy = 20;

      // Sneaker merah
      ctx.fillStyle = "#d90429";
      ctx.fillRect(cx - 5, cy + 14, 4, 3);
      ctx.fillRect(cx + 1, cy + 14, 4, 3);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - 5, cy + 15, 4, 1);
      ctx.fillRect(cx + 1, cy + 15, 4, 1);

      // Celana pendek denim biru
      ctx.fillStyle = "#2b6cb0";
      ctx.fillRect(cx - 5, cy + 7, 10, 7);
      ctx.fillStyle = "#1a365d";
      ctx.fillRect(cx - 1, cy + 9, 2, 5);

      // Kaos bergaris merah-putih
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - 6, cy - 2, 12, 9);
      ctx.fillStyle = "#d90429";
      ctx.fillRect(cx - 6, cy - 1, 12, 2);
      ctx.fillRect(cx - 6, cy + 3, 12, 2);

      // Lengan anak-anak
      ctx.fillStyle = "#f5d0b0";
      ctx.fillRect(cx - 8, cy - 1, 3, 7);
      ctx.fillRect(cx + 5, cy - 1, 3, 7);

      // Wajah bocah bersemangat
      ctx.fillStyle = "#f5d0b0";
      ctx.fillRect(cx - 5, cy - 12, 10, 10);
      ctx.fillStyle = "#1b263b";
      ctx.fillRect(cx - 3, cy - 8, 2, 2);
      ctx.fillRect(cx + 2, cy - 8, 2, 2);
      ctx.fillStyle = "#e63946";
      ctx.fillRect(cx - 1, cy - 4, 3, 2); // senyum lebar

      // Topi baseball merah dipakai terbalik (lidah topi di belakang)
      ctx.fillStyle = "#d90429";
      ctx.fillRect(cx - 6, cy - 15, 12, 4);
      ctx.fillStyle = "#023e8a";
      ctx.fillRect(cx - 2, cy - 16, 4, 2); // kancing topi
      ctx.fillStyle = "#d90429";
      ctx.fillRect(cx - 4, cy - 12, 8, 2); // lidah topi di tengkuk
      // Poni rambut cokelat
      ctx.fillStyle = "#3e2723";
      ctx.fillRect(cx - 4, cy - 12, 8, 2);
    });
    return this.cache.npcAdit;
  }

  // Sprite Kucing Oranye Lucu (Miko si Kucing Desa)
  getCatSprite() {
    if (this.cache.catOrange) return this.cache.catOrange;
    this.cache.catOrange = this.createCanvasTexture(48, 48, (ctx, w, h) => {
      // Kaki & cakar putih
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(18, 38, 4, 6);
      ctx.fillRect(26, 38, 4, 6);

      // Tubuh oranye belang lembut
      ctx.fillStyle = "#f77f00";
      ctx.beginPath();
      ctx.arc(24, 29, 11, 0, Math.PI * 2);
      ctx.fill();

      // Garis loreng punggung
      ctx.fillStyle = "#d62828";
      ctx.fillRect(20, 22, 2, 5);
      ctx.fillRect(24, 21, 2, 6);
      ctx.fillRect(28, 22, 2, 5);

      // Dada putih lembut
      ctx.fillStyle = "#fff3b0";
      ctx.beginPath();
      ctx.arc(24, 31, 6, 0, Math.PI * 2);
      ctx.fill();

      // Ekor melengkung lucu
      ctx.fillStyle = "#f77f00";
      ctx.beginPath();
      ctx.moveTo(13, 32);
      ctx.quadraticCurveTo(8, 24, 12, 16);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#f77f00";
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(10, 15, 3, 3); // ujung ekor putih

      // Kepala bulat
      ctx.fillStyle = "#f77f00";
      ctx.beginPath();
      ctx.arc(31, 22, 8, 0, Math.PI * 2);
      ctx.fill();

      // Telinga segitiga dengan dalam pink
      ctx.fillStyle = "#f77f00";
      ctx.beginPath();
      ctx.moveTo(25, 17); ctx.lineTo(27, 9); ctx.lineTo(31, 16);
      ctx.closePath(); ctx.fill();
      ctx.beginPath();
      ctx.moveTo(33, 16); ctx.lineTo(37, 9); ctx.lineTo(39, 17);
      ctx.closePath(); ctx.fill();

      ctx.fillStyle = "#ffb4a2";
      ctx.fillRect(27, 12, 2, 3);
      ctx.fillRect(35, 12, 2, 3);

      // Mata hijau kucing yang menggemaskan
      ctx.fillStyle = "#55a630";
      ctx.fillRect(29, 20, 2, 3);
      ctx.fillRect(35, 20, 2, 3);
      ctx.fillStyle = "#000000";
      ctx.fillRect(30, 21, 1, 2);
      ctx.fillRect(36, 21, 1, 2);

      // Hidung pink & kumis
      ctx.fillStyle = "#ffb4a2";
      ctx.fillRect(33, 24, 2, 2);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(26, 23, 2, 1);
      ctx.fillRect(26, 25, 2, 1);
      ctx.fillRect(37, 23, 2, 1);
      ctx.fillRect(37, 25, 2, 1);
    });
    return this.cache.catOrange;
  }

  // Papan Pengumuman Warga (Mading Desa)
  getNoticeBoardTexture() {
    if (this.cache.noticeBoard) return this.cache.noticeBoard;
    this.cache.noticeBoard = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      // Papan kayu gabus krem
      ctx.fillStyle = "#b08968";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d4a373";
      ctx.fillRect(3, 3, w - 6, h - 6);

      // Kertas memo / pengumuman ditempel dengan pin
      // Memo 1: Putih (Info Desa)
      ctx.fillStyle = "#fefae0";
      ctx.fillRect(6, 6, 24, 26);
      ctx.fillStyle = "#e63946";
      ctx.fillRect(17, 4, 3, 3); // pin merah
      ctx.fillStyle = "#4a4e69";
      ctx.fillRect(9, 10, 18, 2);
      ctx.fillRect(9, 14, 15, 2);
      ctx.fillRect(9, 18, 17, 2);
      ctx.fillRect(9, 22, 12, 2);

      // Memo 2: Kuning (Agenda Api Unggun)
      ctx.fillStyle = "#ffdda1";
      ctx.fillRect(33, 8, 24, 22);
      ctx.fillStyle = "#2a9d8f";
      ctx.fillRect(44, 6, 3, 3); // pin hijau
      ctx.fillStyle = "#333333";
      ctx.fillRect(36, 12, 18, 2);
      ctx.fillRect(36, 16, 14, 2);
      ctx.fillRect(36, 20, 16, 2);

      // Memo 3: Biru Pastel (Foto / Sketsa Bunga)
      ctx.fillStyle = "#e0f2fe";
      ctx.fillRect(10, 36, 44, 22);
      ctx.fillStyle = "#f59e0b";
      ctx.fillRect(31, 34, 3, 3);
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(14, 40, 26, 2);
      ctx.fillRect(14, 44, 36, 2);
      ctx.fillRect(14, 48, 20, 2);
    });
    return this.cache.noticeBoard;
  }

  // Sprite Ayam Putih Riang (Sesuai Video)
  getChickenSprite() {
    if (this.cache.chicken) return this.cache.chicken;
    this.cache.chicken = this.createCanvasTexture(48, 48, (ctx, w, h) => {
      // Kaki kuning
      ctx.fillStyle = "#ffb703";
      ctx.fillRect(20, 38, 2, 8);
      ctx.fillRect(26, 38, 2, 8);
      ctx.fillRect(18, 45, 5, 2);
      ctx.fillRect(25, 45, 5, 2);

      // Badan putih bulat
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(24, 28, 12, 0, Math.PI * 2);
      ctx.fill();

      // Sayap dengan bayangan lembut
      ctx.fillStyle = "#f0ede6";
      ctx.beginPath();
      ctx.arc(21, 29, 7, 0, Math.PI * 2);
      ctx.fill();

      // Ekor tegak
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(11, 20, 4, 9);
      ctx.fillRect(13, 17, 3, 6);

      // Kepala
      ctx.beginPath();
      ctx.arc(31, 20, 7, 0, Math.PI * 2);
      ctx.fill();

      // Jengger merah terang
      ctx.fillStyle = "#d62828";
      ctx.fillRect(29, 9, 4, 6);
      ctx.fillRect(32, 11, 3, 4);

      // Gelambir merah
      ctx.fillRect(35, 23, 3, 4);

      // Paruh kuning runcing
      ctx.fillStyle = "#ffb703";
      ctx.beginPath();
      ctx.moveTo(37, 19); ctx.lineTo(44, 22); ctx.lineTo(37, 24);
      ctx.closePath();
      ctx.fill();

      // Mata hitam kecil
      ctx.fillStyle = "#1e1e24";
      ctx.fillRect(33, 17, 2, 2);
    });
    return this.cache.chicken;
  }

  // --- 4. TEKSTUR INTERIOR RUMAH 3D ---

  // Lantai Parquet Kayu Hangat
  getWoodFloorTexture() {
    if (this.cache.woodFloor) return this.cache.woodFloor;
    this.cache.woodFloor = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#8a5836";
      ctx.fillRect(0, 0, w, h);

      for (let y = 0; y < h; y += 16) {
        for (let x = 0; x < w; x += 32) {
          const shift = (y / 16) % 2 === 0 ? 0 : 16;
          const px = (x + shift) % w;

          ctx.fillStyle = (x + y) % 32 === 0 ? "#96623d" : "#7d4e2f";
          ctx.fillRect(px, y, 30, 14);

          ctx.fillStyle = "#4a2c16";
          ctx.fillRect(px, y + 14, 30, 2);
          ctx.fillRect(px + 30, y, 2, 16);
        }
      }
    });
    this.cache.woodFloor.wrapS = THREE.RepeatWrapping;
    this.cache.woodFloor.wrapT = THREE.RepeatWrapping;
    return this.cache.woodFloor;
  }

  // Karpet Ruang Tamu Retro
  getInteriorRugTexture() {
    if (this.cache.rug) return this.cache.rug;
    this.cache.rug = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#8b2635";
      ctx.fillRect(0, 0, w, h);

      // Rumbai rumbai krem di tepi
      ctx.fillStyle = "#f4f1de";
      ctx.fillRect(0, 0, w, 3);
      ctx.fillRect(0, h - 3, w, 3);

      // Border ornamen emas
      ctx.strokeStyle = "#e0a96d";
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 6, w - 12, h - 12);

      // Motif intan retro di tengah
      ctx.fillStyle = "#f4f1de";
      ctx.beginPath();
      ctx.moveTo(32, 16); ctx.lineTo(48, 32); ctx.lineTo(32, 48); ctx.lineTo(16, 32);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#e0a96d";
      ctx.beginPath();
      ctx.moveTo(32, 22); ctx.lineTo(42, 32); ctx.lineTo(32, 42); ctx.lineTo(22, 32);
      ctx.closePath();
      ctx.fill();
    });
    return this.cache.rug;
  }

  // Dinding Kayu Plafon Interior
  getInteriorWallTexture() {
    if (this.cache.interiorWall) return this.cache.interiorWall;
    this.cache.interiorWall = this.createCanvasTexture(32, 32, (ctx, w, h) => {
      ctx.fillStyle = "#ece4d0";
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = "#d5cabb";
      ctx.fillRect(0, 0, w, 2);
      ctx.fillRect(0, h - 4, w, 4);

      // Papan bawah kayu (baseboard)
      ctx.fillStyle = "#70482c";
      ctx.fillRect(0, h - 6, w, 6);
    });
    this.cache.interiorWall.wrapS = THREE.RepeatWrapping;
    this.cache.interiorWall.wrapT = THREE.RepeatWrapping;
    return this.cache.interiorWall;
  }

  // Ikon Koleksi & Kunci Rumah
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
        ctx.beginPath();
        ctx.arc(18, 18, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#1a1005";
        ctx.beginPath();
        ctx.arc(18, 18, 4, 0, Math.PI * 2);
        ctx.fill();

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
