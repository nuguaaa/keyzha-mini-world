# Diorama Kenangan (HD-2D Diorama Web Game)

Game web interaktif bertema **HD-2D Diorama** yang memadukan dunia 3D dengan pencahayaan dinamis, bayangan lembut, efek blur depth-of-field (tilt-shift) atas-bawah, serta karakter dan objek 2D pixel art yang tajam.

Dibuat dengan **HTML, CSS, JavaScript murni, dan Three.js** dengan **100% Zero External Assets** (tanpa file gambar eksternal dan tanpa file audio eksternal).

---

## ✨ Fitur Utama

1. **Zero External Assets (100% Prosedural & Mandiri)**:
   - **Grafis Pixel Art**: Semua tekstur tanah berstrata diorama, jalan setapak batu, rumput berbunga, pohon rindang, semak, pagar, rumah kayu, lampu jalan, mesin arcade, photobooth, karakter pemain 4 arah, NPC, dan hewan dibuat secara langsung menggunakan HTML5 Canvas dengan `THREE.NearestFilter` (tajam dan anti-blur).
   - **Synthesizer Suara Web Audio API**: Menghasilkan suara langkah kaki halus (rumput & batu), klik tombol UI, arpeggio pengambilan item, fanfare misi selesai, dengkuran/meow kucing, patukan ayam, efek kamera, dan musik santai (BGM lofi chord progression).

2. **Dunia Diorama 3D yang Hidup & Berdetail**:
   - Platform pulau diorama bertingkat dengan potongan lapisan tanah (*cutaway soil strata*) di sisi-sisinya.
   - Halaman depan berteras batu, pondok kayu hangat dengan cerobong asap, jendela berpendar, kolam air berkilau, dan pepohonan rindang yang menghasilkan bayangan dinamis.
   - **3 Suasana Waktu Dinamis**: Siang Cerah (Bright Day), Sore Hangat (Golden Dusk), dan Malam Lampu Menyala (Deep Night dengan lentera menyala dan kunang-kunang).
   - **Hewan Bergerak Bebas**: Dua kucing menggemaskan (Miko si oranye dan Belang) serta ayam kebun yang berjalan, mematuk, dan bisa diajak berinteraksi.

3. **3 Tokoh NPC Santai & Ramah**:
   - **Kak Arga**: Barista & perawat teras yang ramah dengan sweater dan cangkir kopi.
   - **Bibi Rina**: Penyayang tanaman dengan topi jerami dan penyiram bunga.
   - **Dito**: Sahabat santai penggemar game retro di dekat mesin arcade.

4. **Sistem Quest & Alur Misi Lengkap**:
   - **Quest 1 - Surat Pembuka**: Membaca surat sambutan di kotak pos depan rumah.
   - **Quest 2 - Berburu 4 Kenangan**: Menemukan 4 benda kenangan yang tersebar (Tiket Jalan Sore, Polaroid Tawa Lepas, Kaset Lagu Favorit, Bunga Mekar Abadi) yang tersimpan di Inventory.
   - **Quest 3 - Mini-Game Arcade "Bintang Kenangan"**: Memainkan mini-game tangkap bintang & hati dengan layar CRT untuk membuka kupon rahasia dan membuka gerbang taman belakang.
   - **Quest 4 - Photobooth Kenangan**: Mengambil potret instan bergaya polaroid retro dengan stiker dan catatan kenangan.
   - **Quest 5 - Gazebo Taman Rahasia & Surat Penutup**: Membuka Peti Hadiah Utama di gazebo berlampu hangat untuk membaca surat penutup tulus beserta daftar kupon kenangan.
   - **Penyimpanan Progres Otomatis**: Progres tersimpan di `localStorage` dan dapat direset kapan saja melalui menu Pengaturan.

5. **Kontrol Responsif (Mobile-First & Desktop)**:
   - **Layar Sentuh / HP**: Virtual Joystick di kiri bawah dan tombol aksi "A" di kanan bawah.
   - **Desktop / Laptop**: Tombol `WASD` / Panah untuk bergerak, serta `E` / `Spasi` / `Enter` untuk berinteraksi.
   - Indikator prompt kontekstual mengambang otomatis muncul saat berada dalam jarak interaksi.

---

## 🛠️ Cara Kustomisasi Konten & Nama

Buka file `js/config.js` di editor teks. Di bagian paling atas terdapat konfigurasi yang sangat mudah diganti:

```javascript
window.GAME_CONFIG = {
  recipientName: "Keyzha",      // Ganti dengan nama orang tersayang
  senderName: "Dimas",          // Ganti dengan namamu
  occasionTitle: "Catatan Perjalanan & Sudut Kenangan",
  
  // Ubah isi surat pembuka di sini
  openingLetter: { ... },

  // Ubah daftar 4 item kenangan di sini
  questItems: [ ... ],

  // Ubah dialog NPC di sini
  npcs: { ... },

  // Ubah surat penutup & daftar kupon di sini
  closingLetter: { ... }
};
```

---

## 🚀 Cara Menjalankan

Game ini dapat dijalankan langsung tanpa proses *build* atau instalasi apapun:

1. **Cara Langsung (Browser)**:
   - Cukup buka file `index.html` dengan *double-click* atau drag ke browser pilihanmu (Chrome, Safari, Edge, Firefox).

2. **Cara Menggunakan Local Server (Direkomendasikan)**:
   - Menggunakan Python:
     ```bash
     python3 -m http.server 8000
     ```
     Lalu buka `http://localhost:8000` di browsermu.
   - Atau menggunakan Node.js / npx:
     ```bash
     npx serve .
     ```
