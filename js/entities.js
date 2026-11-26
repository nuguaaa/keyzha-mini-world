/**
 * ============================================================================
 * ENTITAS KARAKTER, NPC, HEWAN & SISTEM PROKSIMITAS TUNGGAL
 * ============================================================================
 * Mengatur pergerakan pemain dengan sliding collision halus (tanpa nyangkut),
 * arah hadap presisi (WASD / Joystick), integrasi custom asset loader dengan
 * auto-fallback aman, NPC hidup, dan deteksi interaksi target terdekat tunggal.
 */

class Player {
  constructor(world, startX = -6, startZ = 6) {
    this.world = world;
    this.x = startX;
    this.y = 0;
    this.z = startZ;
    this.vx = 0;
    this.vz = 0;
    this.speed = 6.8;
    this.radius = 0.42; // Radius collider pemain untuk sliding halus

    this.direction = "down"; // "down", "up", "left", "right"
    this.isMoving = false;
    this.animTimer = 0;
    this.animFrame = 0;
    this.stepTimer = 0;

    this.initMesh();
  }

  initMesh() {
    const tg = window.textureGen;
    const cfg = window.ASSET_CONFIG ? window.ASSET_CONFIG.player : null;

    // Muat custom asset dari assets/player/ jika ada, atau gunakan generator detail bawaan
    const defaultTex = tg.getPlayerSpriteSheet();

    this.spriteMat = new THREE.MeshLambertMaterial({
      map: defaultTex.clone(),
      transparent: true,
      alphaTest: 0.1
    });
    this.spriteMat.map.repeat.set(1 / 3, 1 / 4);
    this.updateSpriteFrame(0, "down");

    if (cfg && cfg.useCustom && cfg.spritesheet) {
      tg.loadCustomSprite(cfg.spritesheet, () => defaultTex, (loadedTex) => {
        if (loadedTex && loadedTex !== defaultTex) {
          this.spriteMat.map = loadedTex;
          this.spriteMat.map.repeat.set(1 / (cfg.cols || 3), 1 / (cfg.rows || 4));
          this.spriteMat.needsUpdate = true;
          this.updateSpriteFrame(0, this.direction);
        }
      });
    }

    // Mesh Karakter 3D HD-2D (Ukuran seimbang di depan kamera close-up)
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.5), this.spriteMat);
    this.mesh.position.set(this.x, 1.25, this.z);
    this.mesh.castShadow = true;

    // Bayangan Oval Lembut di Bawah Kaki
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.28
    });
    this.shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.85), shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.set(this.x, 0.04, this.z);

    this.world.scene.add(this.mesh);
    this.world.scene.add(this.shadowMesh);
  }

  updateSpriteFrame(frame, dir) {
    if (!this.spriteMat || !this.spriteMat.map) return;

    // Mapping Baris Spritesheet 3x4:
    // Baris 3: Down  (offset.y = 0.75)
    // Baris 2: Up    (offset.y = 0.50)
    // Baris 1: Left  (offset.y = 0.25)
    // Baris 0: Right (offset.y = 0.00)
    let row = 3;
    if (dir === "down") row = 3;
    else if (dir === "up") row = 2;
    else if (dir === "left") row = 1;
    else if (dir === "right") row = 0;

    const offsetX = frame * (1 / 3);
    const offsetY = row * (1 / 4);

    this.spriteMat.map.offset.set(offsetX, offsetY);
  }

  update(delta, input, isInputLocked = false) {
    let moveX = 0;
    let moveZ = 0;

    // Jika input dikunci (misalnya sedang membuka surat atau bermain arcade), hentikan gerak
    if (!isInputLocked) {
      if (input.left) moveX -= 1;
      if (input.right) moveX += 1;
      if (input.up) moveZ -= 1;
      if (input.down) moveZ += 1;
    }

    const len = Math.hypot(moveX, moveZ);
    if (len > 0.001) {
      moveX /= len;
      moveZ /= len;
      this.isMoving = true;

      // Penentuan Arah Hadap yang Akurat
      if (Math.abs(moveX) > Math.abs(moveZ) * 0.8) {
        this.direction = moveX > 0 ? "right" : "left";
      } else {
        this.direction = moveZ > 0 ? "down" : "up";
      }
    } else {
      this.isMoving = false;
    }

    // Akselerasi & Perlambatan Halus
    const targetVx = moveX * this.speed;
    const targetVz = moveZ * this.speed;
    this.vx += (targetVx - this.vx) * 15 * delta;
    this.vz += (targetVz - this.vz) * 15 * delta;

    // --- SLIDING COLLISION SYSTEM (TIDAK NYANGKUT) ---
    // Cek sumbu X secara independen
    const nextX = this.x + this.vx * delta;
    if (!this.checkCollisionAt(nextX, this.z)) {
      this.x = nextX;
    } else {
      this.vx = 0; // Hentikan hanya dorongan sumbu X
    }

    // Cek sumbu Z secara independen (memungkinkan sliding saat menabrak miring)
    const nextZ = this.z + this.vz * delta;
    if (!this.checkCollisionAt(this.x, nextZ)) {
      this.z = nextZ;
    } else {
      this.vz = 0; // Hentikan hanya dorongan sumbu Z
    }

    // --- KETINGGIAN & RAMP TANGGA TERAS ---
    const isInterior = (this.world.currentZone === "interior");
    const onTerrace = !isInterior && (this.x >= -14.2 && this.x <= 0.2 && this.z >= -15.2 && this.z <= -4.5);
    const onStairs = !isInterior && (this.x >= -9.5 && this.x <= -4.5 && this.z >= -4.5 && this.z <= -0.8);

    let targetY = 0;
    if (isInterior) {
      targetY = 0;
    } else if (onTerrace) {
      targetY = 1.2;
    } else if (onStairs) {
      // Interpolasi ramp halus saat menaiki tangga
      const progress = 1 - (this.z - (-4.5)) / ((-0.8) - (-4.5));
      targetY = Math.max(0, Math.min(1.2, progress * 1.2));
    }

    this.y += (targetY - this.y) * 12 * delta;

    // Update Animasi Sprite
    if (this.isMoving) {
      this.animTimer += delta * 9.5;
      this.animFrame = Math.floor(this.animTimer) % 3;
      this.updateSpriteFrame(this.animFrame, this.direction);

      // Suara Langkah Kaki
      this.stepTimer += delta;
      if (this.stepTimer > 0.3) {
        this.stepTimer = 0;
        if (window.soundSystem) {
          const stepType = isInterior ? "stone" : ((onTerrace || onStairs) ? "stone" : "grass");
          window.soundSystem.playFootstep(stepType);
        }
      }
    } else {
      this.animFrame = 0;
      this.updateSpriteFrame(0, this.direction);
      this.stepTimer = 0.25;
    }

    // Pantulan Langkah (Bobbing)
    const bob = this.isMoving ? Math.sin(this.animTimer * Math.PI) * 0.08 : 0;

    // Update Posisi Mesh
    this.mesh.position.set(this.x, 1.25 + this.y + bob, this.z);
    this.shadowMesh.position.set(this.x, 0.04 + this.y, this.z);

    // Update Kamera Third-Person Follow
    this.world.updateThirdPersonCamera(this.x, this.y, this.z);
  }

  // Cek Collision Lingkaran Pemain vs Kotak AABB
  checkCollisionAt(tx, tz) {
    const r = this.radius;
    const isInterior = (this.world.currentZone === "interior");

    for (let c of this.world.colliders) {
      // Jika berada di eksterior dan di tangga, abaikan collider depan teras agar bisa naik
      if (!isInterior && c.isTerraceFront && tx >= -9.5 && tx <= -4.5) {
        continue;
      }

      if (
        tx + r > c.minX &&
        tx - r < c.maxX &&
        tz + r > c.minZ &&
        tz - r < c.maxZ
      ) {
        return true;
      }
    }
    return false;
  }
}

// --- NPC RAMAH (ARGA, BIBI RINA, DITO) ---
class NPC {
  constructor(world, id, config, x, z, y = 0) {
    this.world = world;
    this.id = id;
    this.config = config;
    this.x = x;
    this.y = y;
    this.z = z;
    this.dialogueIndex = 0;
    this.badgeHeight = 2.4;

    this.initMesh();
  }

  initMesh() {
    const tg = window.textureGen;
    const cfg = window.ASSET_CONFIG && window.ASSET_CONFIG.npcs ? window.ASSET_CONFIG.npcs[this.id] : null;

    let defaultTex;
    if (this.id === "arga") defaultTex = tg.getNpcArgaSprite();
    else if (this.id === "rina") defaultTex = tg.getNpcRinaSprite();
    else defaultTex = tg.getNpcDitoSprite();

    const mat = new THREE.MeshLambertMaterial({
      map: defaultTex.clone(),
      transparent: true,
      alphaTest: 0.1
    });

    if (cfg && cfg.path) {
      tg.loadCustomSprite(cfg.path, () => defaultTex, (loadedTex) => {
        if (loadedTex && loadedTex !== defaultTex) {
          mat.map = loadedTex;
          mat.needsUpdate = true;
        }
      });
    }

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.5), mat);
    this.mesh.position.set(this.x, 1.25 + this.y, this.z);
    this.mesh.castShadow = true;
    this.world.scene.add(this.mesh);

    // Bayangan Kaki
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.set(this.x, 0.04 + this.y, this.z);
    this.world.scene.add(this.shadow);

    // Collider NPC
    this.world.colliders.push({
      minX: this.x - 0.7,
      maxX: this.x + 0.7,
      minZ: this.z - 0.7,
      maxZ: this.z + 0.7
    });
  }

  getNextDialogue() {
    const text = this.config.dialogues[this.dialogueIndex];
    this.dialogueIndex = (this.dialogueIndex + 1) % this.config.dialogues.length;
    return text;
  }

  update(time) {
    // Nafas halus / idle bobbing
    const idleBob = Math.sin(time * 2.5 + this.x) * 0.035;
    this.mesh.position.y = 1.25 + this.y + idleBob;
  }
}

// --- HEWAN PELIHARAAN BERGERAK BEBAS (KUCING & AYAM) ---
class RoamingAnimal {
  constructor(world, type, id, config, startX, startZ) {
    this.world = world;
    this.type = type;
    this.id = id;
    this.config = config;
    this.x = startX;
    this.z = startZ;
    this.vx = 0;
    this.vz = 0;
    this.badgeHeight = 1.3;

    this.state = "idle";
    this.stateTimer = 1.5 + Math.random() * 2.5;
    this.animTimer = 0;

    this.initMesh();
  }

  initMesh() {
    const tg = window.textureGen;
    const cfg = window.ASSET_CONFIG && window.ASSET_CONFIG.pets ? window.ASSET_CONFIG.pets[this.id] : null;

    let defaultTex;
    let w = 1.8, h = 1.35;

    if (this.type === "cat") {
      defaultTex = tg.getCatSprite(this.id === "catOrange" ? "orange" : "calico");
      w = 1.8;
      h = 1.35;
    } else {
      defaultTex = tg.getChickenSprite();
      w = 1.3;
      h = 1.3;
    }

    const mat = new THREE.MeshLambertMaterial({
      map: defaultTex.clone(),
      transparent: true,
      alphaTest: 0.1
    });

    if (cfg && cfg.path) {
      tg.loadCustomSprite(cfg.path, () => defaultTex, (loadedTex) => {
        if (loadedTex && loadedTex !== defaultTex) {
          mat.map = loadedTex;
          mat.needsUpdate = true;
        }
      });
    }

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    this.mesh.position.set(this.x, h / 2, this.z);
    this.mesh.castShadow = true;
    this.world.scene.add(this.mesh);

    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 });
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.set(this.x, 0.03, this.z);
    this.world.scene.add(this.shadow);
  }

  update(delta) {
    this.stateTimer -= delta;

    if (this.stateTimer <= 0) {
      if (this.state === "idle") {
        this.state = "walk";
        this.stateTimer = 1.8 + Math.random() * 2.8;
        const angle = Math.random() * Math.PI * 2;
        const speed = this.type === "cat" ? 1.4 : 1.1;
        this.vx = Math.cos(angle) * speed;
        this.vz = Math.sin(angle) * speed;

        // Balik arah hadap sprite (flip horizontal)
        this.mesh.scale.x = this.vx < 0 ? -1 : 1;
      } else {
        this.state = "idle";
        this.stateTimer = 2.0 + Math.random() * 3.5;
        this.vx = 0;
        this.vz = 0;
      }
    }

    const nx = this.x + this.vx * delta;
    const nz = this.z + this.vz * delta;

    // Batasan agar hewan tetap di dalam area taman yang hidup
    if (nx > -14 && nx < 14 && nz > -14 && nz < 15) {
      this.x = nx;
      this.z = nz;
    } else {
      this.stateTimer = 0;
    }

    if (this.state === "walk") {
      this.animTimer += delta * 8;
      const hop = Math.abs(Math.sin(this.animTimer)) * (this.type === "chicken" ? 0.12 : 0.06);
      this.mesh.position.set(this.x, (this.mesh.geometry.parameters.height / 2) + hop, this.z);
    } else {
      this.mesh.position.set(this.x, this.mesh.geometry.parameters.height / 2, this.z);
    }
    this.shadow.position.set(this.x, 0.03, this.z);
  }
}

// --- ITEM KENANGAN BERKILAU (QUEST 2) ---
class CollectibleItem {
  constructor(world, data, x, z, y = 0.6) {
    this.world = world;
    this.data = data;
    this.x = x;
    this.y = y;
    this.z = z;
    this.collected = false;
    this.badgeHeight = 1.6;

    this.initMesh();
  }

  initMesh() {
    const tg = window.textureGen;
    const tex = tg.getCollectItemTexture(this.data.iconType);

    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.1
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), mat);
    this.mesh.position.set(this.x, this.y, this.z);
    this.world.scene.add(this.mesh);

    this.light = new THREE.PointLight(this.data.color, 1.3, 3.8, 2);
    this.light.position.set(this.x, this.y + 0.3, this.z);
    this.world.scene.add(this.light);
  }

  update(time) {
    if (this.collected) return;
    const floatY = this.y + Math.sin(time * 3 + this.x) * 0.18;
    this.mesh.position.y = floatY;
    this.light.position.y = floatY + 0.2;
    this.mesh.rotation.y = time * 1.5;
  }

  collect() {
    this.collected = true;
    this.mesh.visible = false;
    this.light.visible = false;
  }
}

// --- PENGELOLA INTERAKSI & PROMPT TUNGGAL TERDEKAT ---
class InteractionManager {
  constructor(world, player) {
    this.world = world;
    this.player = player;
    this.interactables = [];
    this.currentNearest = null;
    this.interactionRange = 2.5;
  }

  register(entity) {
    this.interactables.push(entity);
  }

  update() {
    let nearest = null;
    let minDst = this.interactionRange;
    const currentZone = this.world.currentZone || "exterior";

    for (let item of this.interactables) {
      if (item.collected) continue;

      // Filter berdasarkan zona (eksterior vs interior rumah)
      const itemZone = item.zone || (item.x > 50 ? "interior" : "exterior");
      if (itemZone !== currentZone) continue;

      const dst = Math.hypot(this.player.x - item.x, this.player.z - item.z);
      if (dst < minDst) {
        minDst = dst;
        nearest = item;
      }
    }

    this.currentNearest = nearest;
    return nearest;
  }

  // Hitung proyeksi koordinat 3D ke posisi layar (piksel) untuk badge interaksi yang tajam
  getScreenPosition(camera) {
    if (!this.currentNearest || !camera) return null;
    const target = this.currentNearest;
    const posX = target.mesh ? target.mesh.position.x : target.x;
    const posY = target.mesh ? target.mesh.position.y : (target.y || 0);
    const posZ = target.mesh ? target.mesh.position.z : target.z;
    const badgeOffset = target.badgeHeight !== undefined ? target.badgeHeight : (target.type === "cat" || target.type === "chicken" ? 1.3 : 2.5);

    const vec = new THREE.Vector3(posX, posY + badgeOffset, posZ);
    vec.project(camera);

    // Hanya tampilkan jika berada di depan frustum kamera (vec.z < 1.0)
    if (vec.z < 1.0) {
      const screenX = (vec.x * 0.5 + 0.5) * window.innerWidth;
      const screenY = (-(vec.y * 0.5) + 0.5) * window.innerHeight;
      return { x: screenX, y: screenY, visible: true };
    }
    return { x: 0, y: 0, visible: false };
  }

  trigger() {
    // Pastikan HANYA memicu 1 objek terdekat yang sedang aktif
    if (!this.currentNearest) return false;
    if (this.currentNearest.onInteract) {
      this.currentNearest.onInteract();
      return true;
    }
    return false;
  }
}

window.Player = Player;
window.NPC = NPC;
window.RoamingAnimal = RoamingAnimal;
window.CollectibleItem = CollectibleItem;
window.InteractionManager = InteractionManager;
