/**
 * ============================================================================
 * ENTITAS KARAKTER, NPC, HEWAN & SISTEM INTERAKSI PROKSIMITAS
 * ============================================================================
 * Mengatur pemain (pergerakan, animasi spritesheet, collision), NPC ramah,
 * hewan peliharaan bergerak bebas (kucing & ayam), item kenangan berkilau,
 * dan deteksi interaksi proksimitas dengan prompt kontekstual.
 */

class Player {
  constructor(world, startX = -6, startZ = 6) {
    this.world = world;
    this.x = startX;
    this.y = 0;
    this.z = startZ;
    this.vx = 0;
    this.vz = 0;
    this.speed = 7.0;

    this.direction = "down"; // "down", "up", "left", "right"
    this.isMoving = false;
    this.animTimer = 0;
    this.animFrame = 0;
    this.stepTimer = 0;

    this.initMesh();
  }

  initMesh() {
    const tg = window.textureGen;
    const sheetTexture = tg.getPlayerSpriteSheet();

    this.spriteMat = new THREE.MeshLambertMaterial({
      map: sheetTexture.clone(),
      transparent: true,
      alphaTest: 0.1
    });

    this.spriteMat.map.repeat.set(1 / 3, 1 / 4);
    this.updateSpriteFrame(0, "down");

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.4), this.spriteMat);
    this.mesh.position.set(this.x, 1.2, this.z);
    this.mesh.castShadow = true;

    const shadowGeo = new THREE.PlaneGeometry(1.4, 0.8);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.28
    });
    this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowMesh.rotation.x = -Math.PI / 2;
    this.shadowMesh.position.set(this.x, 0.04, this.z);

    this.world.scene.add(this.mesh);
    this.world.scene.add(this.shadowMesh);
  }

  updateSpriteFrame(frame, dir) {
    let row = 0;
    if (dir === "down") row = 3;
    else if (dir === "up") row = 2;
    else if (dir === "left") row = 1;
    else if (dir === "right") row = 0;

    const offsetX = frame * (1 / 3);
    const offsetY = row * (1 / 4);

    this.spriteMat.map.offset.set(offsetX, offsetY);
  }

  update(delta, input) {
    let moveX = 0;
    let moveZ = 0;

    if (input.left) moveX -= 1;
    if (input.right) moveX += 1;
    if (input.up) moveZ -= 1;
    if (input.down) moveZ += 1;

    const len = Math.hypot(moveX, moveZ);
    if (len > 0.001) {
      moveX /= len;
      moveZ /= len;
      this.isMoving = true;

      if (Math.abs(moveX) > Math.abs(moveZ)) {
        this.direction = moveX > 0 ? "right" : "left";
      } else {
        this.direction = moveZ > 0 ? "down" : "up";
      }
    } else {
      this.isMoving = false;
    }

    const targetVx = moveX * this.speed;
    const targetVz = moveZ * this.speed;
    this.vx += (targetVx - this.vx) * 14 * delta;
    this.vz += (targetVz - this.vz) * 14 * delta;

    const newX = this.x + this.vx * delta;
    const newZ = this.z + this.vz * delta;

    if (!this.checkCollision(newX, this.z)) {
      this.x = newX;
    } else {
      this.vx = 0;
    }

    if (!this.checkCollision(this.x, newZ)) {
      this.z = newZ;
    } else {
      this.vz = 0;
    }

    const onTerrace = (this.x >= -14 && this.x <= 0 && this.z >= -15 && this.z <= -4);
    const targetY = onTerrace ? 1.2 : 0;
    this.y += (targetY - this.y) * 10 * delta;

    if (this.isMoving) {
      this.animTimer += delta * 9;
      this.animFrame = Math.floor(this.animTimer) % 3;
      this.updateSpriteFrame(this.animFrame, this.direction);

      this.stepTimer += delta;
      if (this.stepTimer > 0.32) {
        this.stepTimer = 0;
        if (window.soundSystem) {
          window.soundSystem.playFootstep(onTerrace ? "stone" : "grass");
        }
      }
    } else {
      this.animFrame = 0;
      this.updateSpriteFrame(0, this.direction);
      this.stepTimer = 0.28;
    }

    const bob = this.isMoving ? Math.sin(this.animTimer * Math.PI) * 0.08 : 0;

    this.mesh.position.set(this.x, 1.2 + this.y + bob, this.z);
    this.shadowMesh.position.set(this.x, 0.04 + this.y, this.z);

    this.updateCamera();
  }

  checkCollision(tx, tz) {
    const r = 0.5;
    for (let c of this.world.colliders) {
      if (tx + r > c.minX && tx - r < c.maxX && tz + r > c.minZ && tz - r < c.maxZ) {
        return true;
      }
    }
    return false;
  }

  updateCamera() {
    const camTargetX = this.x * 0.45;
    const camTargetZ = this.z * 0.45;

    this.world.camera.position.x += (camTargetX + 20 - this.world.camera.position.x) * 0.06;
    this.world.camera.position.z += (camTargetZ + 32 - this.world.camera.position.z) * 0.06;
    this.world.camera.lookAt(camTargetX, 2 + this.y * 0.5, camTargetZ);
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

    this.initMesh();
  }

  initMesh() {
    const tg = window.textureGen;
    let spriteTex;

    if (this.id === "arga") spriteTex = tg.getNpcArgaSprite();
    else if (this.id === "rina") spriteTex = tg.getNpcRinaSprite();
    else spriteTex = tg.getNpcDitoSprite();

    const mat = new THREE.MeshLambertMaterial({
      map: spriteTex,
      transparent: true,
      alphaTest: 0.1
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.4), mat);
    this.mesh.position.set(this.x, 1.2 + this.y, this.z);
    this.mesh.castShadow = true;
    this.world.scene.add(this.mesh);

    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 });
    this.shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.8), shadowMat);
    this.shadow.rotation.x = -Math.PI / 2;
    this.shadow.position.set(this.x, 0.04 + this.y, this.z);
    this.world.scene.add(this.shadow);

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
    const idleBob = Math.sin(time * 2.5 + this.x) * 0.03;
    this.mesh.position.y = 1.2 + this.y + idleBob;
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

    this.state = "idle";
    this.stateTimer = 1.5 + Math.random() * 2;
    this.animTimer = 0;

    this.initMesh();
  }

  initMesh() {
    const tg = window.textureGen;
    let tex;
    let w = 1.6, h = 1.2;

    if (this.type === "cat") {
      tex = tg.getCatSprite(this.id === "catOrange" ? "orange" : "calico");
      w = 1.8;
      h = 1.2;
    } else {
      tex = tg.getChickenSprite();
      w = 1.2;
      h = 1.2;
    }

    const mat = new THREE.MeshLambertMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.1
    });

    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    this.mesh.position.set(this.x, h / 2, this.z);
    this.mesh.castShadow = true;
    this.world.scene.add(this.mesh);

    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.2 });
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
        this.stateTimer = 1.8 + Math.random() * 2.5;
        const angle = Math.random() * Math.PI * 2;
        const speed = this.type === "cat" ? 1.4 : 1.1;
        this.vx = Math.cos(angle) * speed;
        this.vz = Math.sin(angle) * speed;

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

    if (nx > -13 && nx < 13 && nz > -13 && nz < 14) {
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
  constructor(world, data, x, z, y = 0.5) {
    this.world = world;
    this.data = data;
    this.x = x;
    this.y = y;
    this.z = z;
    this.collected = false;

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

    this.light = new THREE.PointLight(this.data.color, 1.2, 3.5, 2);
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

// --- PENGELOLA INTERAKSI & PROMPT KONTEKSTUAL ---
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

    for (let item of this.interactables) {
      if (item.collected) continue;

      const dst = Math.hypot(this.player.x - item.x, this.player.z - item.z);
      if (dst < minDst) {
        minDst = dst;
        nearest = item;
      }
    }

    this.currentNearest = nearest;
    return nearest;
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
