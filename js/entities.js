/**
 * ============================================================================
 * ENTITAS KARAKTER, NPC, HEWAN & SISTEM PROKSIMITAS TUNGGAL
 * ============================================================================
 * Mengatur pergerakan pemain dengan sliding collision multi-substep (anti tembus),
 * interpolasi ramp tangga halus, arah hadap presisi (WASD / D-Pad), integrasi
 * custom asset loader dengan auto-fallback aman, dan deteksi interaksi 3D.
 */

class Player {
  constructor(world, startX = 0, startZ = 6.5) {
    this.world = world;
    this.x = startX;
    this.y = 0;
    this.z = startZ;
    this.vx = 0;
    this.vz = 0;
    this.speed = 6.2;
    this.radius = 0.36; // Radius tabrakan pemain

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

    // Default sprite sheet bergaya video referensi (hijab sage green & gaun krem)
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

    // Mesh Karakter 3D HD-2D (Ukuran seimbang proporsional)
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.3), this.spriteMat);
    this.mesh.position.set(this.x, 1.15, this.z);
    this.mesh.castShadow = true;

    // Bayangan Oval di Bawah Kaki
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.28
    });
    this.shadowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.75), shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.set(this.x, 0.03, this.z);

    this.world.scene.add(this.mesh);
    this.world.scene.add(this.shadowMesh);
  }

  updateSpriteFrame(frame, dir) {
    if (!this.spriteMat || !this.spriteMat.map) return;

    // Spritesheet 3x4:
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

      if (Math.abs(moveX) > Math.abs(moveZ) * 0.8) {
        this.direction = moveX > 0 ? "right" : "left";
      } else {
        this.direction = moveZ > 0 ? "down" : "up";
      }
    } else {
      this.isMoving = false;
    }

    // Akselerasi & Perlambatan Halus (Frame-rate independent)
    const targetVx = moveX * this.speed;
    const targetVz = moveZ * this.speed;
    const accelT = 1 - Math.exp(-18 * delta);
    this.vx += (targetVx - this.vx) * accelT;
    this.vz += (targetVz - this.vz) * accelT;

    // --- SLIDING COLLISION MULTI-SUBSTEP (ANTI TEMBUS SECARA TOTAL) ---
    const subSteps = 2;
    const subDelta = delta / subSteps;
    for (let s = 0; s < subSteps; s++) {
      // Cek sumbu X secara independen
      const nextX = this.x + this.vx * subDelta;
      if (!this.checkCollisionAt(nextX, this.z)) {
        this.x = nextX;
      } else {
        this.vx = 0;
      }

      // Cek sumbu Z secara independen
      const nextZ = this.z + this.vz * subDelta;
      if (!this.checkCollisionAt(this.x, nextZ)) {
        this.z = nextZ;
      } else {
        this.vz = 0;
      }
    }

    // --- KETINGGIAN & RAMP TANGGA TERAS ---
    const isInterior = (this.world.currentZone === "interior");
    let targetY = 0;

    if (isInterior) {
      targetY = 0;
    } else {
      const onStairs = (this.x >= -3.35 && this.x <= 3.35 && this.z <= -3.9 && this.z >= -8.1);
      const onTerrace = (this.x >= -9.0 && this.x <= 9.0 && this.z <= -8.0 && this.z >= -18.5);

      if (onTerrace) {
        targetY = 1.2;
      } else if (onStairs) {
        // Interpolasi ramp tangga batu dari Z = -3.9 (Y=0) ke Z = -8.0 (Y=1.2)
        const progress = ((-3.9) - this.z) / ((-3.9) - (-8.0));
        targetY = Math.max(0, Math.min(1.2, progress * 1.2));
      }
    }

    const yT = 1 - Math.exp(-14 * delta);
    this.y += (targetY - this.y) * yT;

    // Update Animasi Sprite
    if (this.isMoving) {
      this.animTimer += delta * 9.0;
      this.animFrame = Math.floor(this.animTimer) % 3;
      this.updateSpriteFrame(this.animFrame, this.direction);

      // Suara Langkah Kaki
      this.stepTimer += delta;
      if (this.stepTimer > 0.32) {
        this.stepTimer = 0;
        if (window.soundSystem) {
          const onWood = (this.x >= 7.5 && this.x <= 17.5 && this.z >= -3.5 && this.z <= 4.5) ||
                         (this.x >= -14.6 && this.x <= -8.8 && this.z >= -0.5 && this.z <= 3.5);
          const onStone = (this.y > 0.2 || (this.x >= -4.5 && this.x <= 4.5 && this.z >= -4.0 && this.z <= 7.5));
          const stepType = isInterior ? "stone" : (onWood ? "wood" : (onStone ? "stone" : "grass"));
          window.soundSystem.playFootstep(stepType);
        }
      }
    } else {
      this.animFrame = 0;
      this.updateSpriteFrame(0, this.direction);
      this.stepTimer = 0.25;
    }

    const bob = this.isMoving ? Math.sin(this.animTimer * Math.PI) * 0.06 : 0;
    this.mesh.position.set(this.x, 1.15 + this.y + bob, this.z);
    this.shadowMesh.position.set(this.x, 0.03 + this.y, this.z);

    // Update Kamera Isometric Medium-Wide (Butter-Smooth Follow)
    this.world.updateCamera(this.x, this.y, this.z, delta);
  }

  checkCollisionAt(tx, tz) {
    const r = this.radius;
    for (let c of this.world.colliders) {
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

// --- NPC RAMAH (PAMAN JEMBATAN, KAKEK BIJAK, DITO) ---
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
    if (this.id === "paman") defaultTex = tg.getNpcPamanSprite();
    else if (this.id === "kakek") defaultTex = tg.getNpcKakekSprite();
    else if (this.id === "rina") defaultTex = tg.getNpcRinaSprite();
    else if (this.id === "dito") defaultTex = tg.getNpcDitoSprite();
    else if (this.id === "bu_rt") defaultTex = tg.getNpcBuRtSprite();
    else if (this.id === "pak_rt") defaultTex = tg.getNpcPakRtSprite();
    else if (this.id === "mbak_tari") defaultTex = tg.getNpcMbakTariSprite();
    else if (this.id === "nenek_minah") defaultTex = tg.getNpcNenekSprite();
    else if (this.id === "mas_bayu") defaultTex = tg.getNpcBayuSprite();
    else if (this.id === "mang_ujang") defaultTex = tg.getNpcMangUjangSprite();
    else if (this.id === "teh_sarah") defaultTex = tg.getNpcTehSarahSprite();
    else if (this.id === "adit") defaultTex = tg.getNpcAditSprite();
    else defaultTex = tg.getNpcPamanSprite();

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

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.3), mat);
    this.mesh.position.set(this.x, 1.15 + this.y, this.z);
    this.mesh.castShadow = true;
    this.world.exteriorGroup.add(this.mesh);

    // Bayangan Kaki
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.7), shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.set(this.x, 0.03 + this.y, this.z);
    this.world.exteriorGroup.add(this.shadow);

    // Collider NPC
    this.collider = {
      minX: this.x - 0.65,
      maxX: this.x + 0.65,
      minZ: this.z - 0.65,
      maxZ: this.z + 0.65
    };
    this.world.exteriorColliders.push(this.collider);
  }

  setVisible(visible) {
    this.isActive = !!visible;
    if (this.mesh) this.mesh.visible = !!visible;
    if (this.shadow) this.shadow.visible = !!visible;
    if (this.world && this.world.exteriorColliders && this.collider) {
      const idx = this.world.exteriorColliders.indexOf(this.collider);
      if (visible && idx === -1) {
        this.world.exteriorColliders.push(this.collider);
      } else if (!visible && idx !== -1) {
        this.world.exteriorColliders.splice(idx, 1);
      }
    }
  }

  getNextDialogue() {
    const text = this.config.dialogues[this.dialogueIndex];
    this.dialogueIndex = (this.dialogueIndex + 1) % this.config.dialogues.length;
    return text;
  }

  update(time) {
    const idleBob = Math.sin(time * 2.2 + this.x) * 0.03;
    this.mesh.position.y = 1.15 + this.y + idleBob;
  }
}

// --- HEWAN PELIHARAAN BERGERAK BEBAS (AYAM & KUCING) ---
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
    this.state = "idle";
    this.stateTimer = 1.5 + Math.random() * 2.5;
    this.animTimer = 0;
    this.badgeHeight = 1.2;

    this.initMesh();
  }

  initMesh() {
    const tg = window.textureGen;
    const defaultTex = (this.type === "cat") ? tg.getCatSprite() : tg.getChickenSprite();

    const mat = new THREE.MeshLambertMaterial({
      map: defaultTex.clone(),
      transparent: true,
      alphaTest: 0.1
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), mat);
    this.mesh.position.set(this.x, 0.65, this.z);
    this.mesh.castShadow = true;
    this.world.exteriorGroup.add(this.mesh);

    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 });
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.5), shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.set(this.x, 0.03, this.z);
    this.world.exteriorGroup.add(this.shadow);
  }

  update(delta) {
    this.stateTimer -= delta;

    if (this.stateTimer <= 0) {
      if (this.state === "idle") {
        this.state = "walk";
        this.stateTimer = 1.5 + Math.random() * 2.5;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.1;
        this.vx = Math.cos(angle) * speed;
        this.vz = Math.sin(angle) * speed;
        this.mesh.scale.x = this.vx < 0 ? -1 : 1;
      } else {
        this.state = "idle";
        this.stateTimer = 2.0 + Math.random() * 3.0;
        this.vx = 0;
        this.vz = 0;
      }
    }

    const nx = this.x + this.vx * delta;
    const nz = this.z + this.vz * delta;

    // Batasan agar ayam tetap di dalam area halaman dan tidak masuk ke dalam sungai
    const inRiver = (nx < -9.2 && nx > -14.2);
    if (!inRiver && nx > -20 && nx < 20 && nz > -18 && nz < 12.5) {
      this.x = nx;
      this.z = nz;
    } else {
      this.stateTimer = 0;
    }

    if (this.state === "walk") {
      this.animTimer += delta * 8;
      const hop = Math.abs(Math.sin(this.animTimer)) * 0.1;
      this.mesh.position.set(this.x, 0.65 + hop, this.z);
    } else {
      this.mesh.position.set(this.x, 0.65, this.z);
    }
    this.shadow.position.set(this.x, 0.03, this.z);
  }
}

// --- ITEM KENANGAN & KUNCI BERKILAU ---
class CollectibleItem {
  constructor(world, data, x, z, y = 0.5) {
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

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), mat);
    this.mesh.position.set(this.x, this.y, this.z);
    this.world.exteriorGroup.add(this.mesh);

    this.light = new THREE.PointLight(this.data.color, 1.2, 3.5, 2);
    this.light.position.set(this.x, this.y + 0.3, this.z);
    this.world.exteriorGroup.add(this.light);
  }

  update(time) {
    if (this.collected) return;
    const floatY = this.y + Math.sin(time * 3 + this.x) * 0.15;
    this.mesh.position.y = floatY;
    this.light.position.y = floatY + 0.2;
    this.mesh.rotation.y = time * 1.4;
  }

  collect() {
    this.collected = true;
    this.mesh.visible = false;
    this.light.visible = false;
  }
}

// --- PENGELOLA INTERAKSI & PROMPT 3D TUNGGAL TERDEKAT ---
class InteractionManager {
  constructor(world, player) {
    this.world = world;
    this.player = player;
    this.interactables = [];
    this.currentNearest = null;
    this.interactionRange = 2.4;
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
      if (item.isActive === false) continue;

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

  // Hitung proyeksi koordinat 3D ke posisi layar (piksel) untuk badge interaksi mengambang
  getScreenPosition(camera) {
    if (!this.currentNearest || !camera) return null;
    const target = this.currentNearest;
    const posX = target.mesh ? target.mesh.position.x : target.x;
    const posY = target.mesh ? target.mesh.position.y : (target.y || 0);
    const posZ = target.mesh ? target.mesh.position.z : target.z;
    const badgeOffset = target.badgeHeight !== undefined ? target.badgeHeight : 2.2;

    const vec = new THREE.Vector3(posX, posY + badgeOffset, posZ);
    vec.project(camera);

    if (vec.z < 1.0) {
      const screenX = (vec.x * 0.5 + 0.5) * window.innerWidth;
      const screenY = (-(vec.y * 0.5) + 0.5) * window.innerHeight;
      return { x: screenX, y: screenY, visible: true };
    }
    return { x: 0, y: 0, visible: false };
  }

  trigger() {
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
