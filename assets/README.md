# Panduan Custom Aset Gambar (Assets Guide)

Game ini mendukung pemuatan file gambar kustom (.png) langsung dari folder `assets/`.
Jika file gambar kustom belum diisi atau tidak ditemukan (404 / gagal load), **game akan otomatis menggunakan generator pixel art prosedural bawaan yang detail dan tidak akan crash**.

---

## 📁 Struktur Folder & Nama File

### 1. Karakter Pemain (`assets/player/`)
Anda dapat menggunakan **Spritesheet** atau **Gambar Tunggal**:
- **Opsi A - Spritesheet Lengkap**:
  - Nama file: `character.png`
  - Format: PNG dengan latar belakang transparan.
  - Ukuran yang disarankan: **192 x 256 px** (grid 3 kolom x 4 baris) atau **384 x 512 px**.
  - Susunan baris:
    - Baris 1: Hadap Bawah (Depan) - 3 frame jalan (Idle, Langkah 1, Langkah 2)
    - Baris 2: Hadap Atas (Belakang) - 3 frame jalan
    - Baris 3: Hadap Kiri - 3 frame jalan
    - Baris 4: Hadap Kanan - 3 frame jalan
- **Opsi B - Gambar Per-Arah / Gambar Tunggal**:
  - `walk_down.png` (Hadap Depan)
  - `walk_up.png` (Hadap Belakang)
  - `walk_left.png` (Hadap Kiri)
  - `walk_right.png` (Hadap Kanan)
  - `idle.png` (Pose diam standar)
  - Ukuran yang disarankan: **64 x 96 px** atau **128 x 128 px**.

### 2. Tokoh NPC (`assets/npcs/`)
- `npc_1.png` — Kak Arga (Penikmat kopi teras).
- `npc_2.png` — Bibi Rina (Penyayang tanaman & bunga).
- `npc_3.png` — Dito (Sahabat santai di dekat arcade).
- Format: PNG transparan.
- Ukuran yang disarankan: **64 x 96 px** atau **128 x 128 px**.

### 3. Hewan Peliharaan (`assets/pets/`)
- `cat.png` — Kucing (Miko & Belang). Ukuran disarankan: **64 x 48 px** atau **96 x 64 px**.
- `chicken.png` — Ayam kebun. Ukuran disarankan: **48 x 48 px** atau **64 x 64 px**.
- Format: PNG transparan.

---

## ⚙️ Cara Mengatur di Kode

Buka file `js/config.js`, Anda dapat mengubah konfigurasi pada objek `ASSET_CONFIG`:

```javascript
window.ASSET_CONFIG = {
  player: {
    useCustom: true, // Ubah false jika ingin selalu menggunakan generator bawaan
    spritesheet: "assets/player/character.png",
    cols: 3,
    rows: 4
  },
  npcs: {
    arga: "assets/npcs/npc_1.png",
    rina: "assets/npcs/npc_2.png",
    dito: "assets/npcs/npc_3.png"
  },
  pets: {
    cat: "assets/pets/cat.png",
    chicken: "assets/pets/chicken.png"
  }
};
```
Game akan otomatis memeriksa file tersebut, dan jika tidak tersedia akan langsung menggunakan sprite pixel art prosedural berkualitas tinggi.
