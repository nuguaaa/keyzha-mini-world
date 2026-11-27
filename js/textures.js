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

  // Air Sungai Mengalir HD-2D (Cyan Jernih dengan Gelombang)
  getRiverWaterTexture() {
    if (this.cache.riverWater) return this.cache.riverWater;
    this.cache.riverWater = this.createCanvasTexture(64, 64, (ctx, w, h) => {
      ctx.fillStyle = "#3d8ba6";
      ctx.fillRect(0, 0, w, h);

      const waterColors = ["#4ea3c2", "#5fb8d9", "#35778f", "#78cce6"];
      for (let y = 0; y < h; y += 8) {
        for (let x = 0; x < w; x += 16) {
          const c = waterColors[((x / 16) + (y / 8)) % waterColors.length];
          ctx.fillStyle = c;
          ctx.fillRect(x + (y % 16 === 0 ? 0 : 8), y, 12, 4);
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.fillRect(x + (y % 16 === 0 ? 2 : 10), y + 1, 6, 1);
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
    this.cache.npcKpcKakek = this.createCanvasTexture(64, 64, (ctx, w, h) => {
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
    return this.cache.npcKpcKakek;
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
