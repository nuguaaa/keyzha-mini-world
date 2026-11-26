/**
 * ============================================================================
 * KONFIGURASI ASET & KONTEN PERSONALISASI (ASSET_CONFIG & GAME_CONFIG)
 * ============================================================================
 * Anda dapat dengan mudah menambahkan gambar custom di folder assets/,
 * mengubah nama panggilan, isi surat, dialog NPC, dan kupon di bawah ini.
 */

// --- 1. KONFIGURASI CUSTOM ASET (assets/) DENGAN AUTO-FALLBACK ---
window.ASSET_CONFIG = {
  // Pengaturan Karakter Pemain
  player: {
    useCustom: true, // Jika true, mencoba load file di bawah ini terlebih dahulu
    spritesheet: "assets/player/character.png",
    cols: 3,
    rows: 4,
    // File per-arah alternatif (opsional jika tidak menggunakan 1 spritesheet penuh)
    down: "assets/player/walk_down.png",
    up: "assets/player/walk_up.png",
    left: "assets/player/walk_left.png",
    right: "assets/player/walk_right.png",
    singleImage: "assets/player/idle.png"
  },

  // Pengaturan NPC
  npcs: {
    arga: { path: "assets/npcs/npc_1.png", cols: 1, rows: 1 },
    rina: { path: "assets/npcs/npc_2.png", cols: 1, rows: 1 },
    dito: { path: "assets/npcs/npc_3.png", cols: 1, rows: 1 }
  },

  // Pengaturan Hewan Peliharaan
  pets: {
    catOrange: { path: "assets/pets/cat.png", cols: 1, rows: 1 },
    catCalico: { path: "assets/pets/cat.png", cols: 1, rows: 1 },
    chicken: { path: "assets/pets/chicken.png", cols: 1, rows: 1 }
  }
};

// --- 2. KONFIGURASI GAME & CERITA ---
window.GAME_CONFIG = {
  // Identitas & Tema
  recipientName: "Keyzha",
  senderName: "Dimas",
  occasionTitle: "Catatan Perjalanan & Sudut Kenangan",
  gameTitle: "Diorama Kenangan",

  // Quest 1: Surat Pembuka (Di Kotak Pos Depan Rumah)
  openingLetter: {
    title: "Surat di Kotak Pos",
    date: "Sebuah Hari yang Tenang",
    greeting: "Halo Keyzha,",
    paragraphs: [
      "Kalau kamu membaca surat ini, berarti kamu sudah sampai di halaman depan. Tempat kecil ini sengaja dibuat seperti sebuah diorama hangat—sebuah sudut santai untuk rehat sejenak dari hiruk-pikuk hari-hari yang sibuk.",
      "Waktu sering kali berjalan terlalu cepat tanpa sempat kita sadari. Tapi kalau kita menengok ke belakang, ada banyak sekali momen-momen sederhana yang ternyata sangat berarti dan berkesan.",
      "Sebelum menuju ke taman belakang, cobalah berjalan-jalan keliling halaman ini. Ada beberapa benda kenangan kecil yang tersebar di sudut-sudut taman, teman-teman yang ramah, dan mesin arcade tua yang masih menyala."
    ],
    hint: "Petunjuk: Mulailah dengan menyapa orang-orang di sekitar taman dan periksa sudut-sudut bunga atau bangku santai.",
    closing: "Selamat menikmati harimu di sini ya."
  },

  // Quest 2: 4 Item Kenangan Tersembunyi
  questItems: [
    {
      id: "item_ticket",
      name: "Tiket Jalan Sore",
      iconType: "ticket",
      locationHint: "Di dekat bangku kayu di bawah pohon rindang",
      summary: "Sebuah tiket kecil untuk jalan santai tanpa terburu-buru.",
      story: "Tiket ini melambangkan salah satu hal favorit kita: berjalan santai di sore hari sambil bertukar cerita tentang hal-hal kecil tanpa perlu memikirkan waktu. Menyenangkan rasanya bisa menikmati langkah pelan bersamamu.",
      color: "#f6c445"
    },
    {
      id: "item_polaroid",
      name: "Polaroid Tawa Lepas",
      iconType: "polaroid",
      locationHint: "Di antara semak bunga lavender dekat gazebo",
      summary: "Foto polaroid kecil yang menangkap tawa spontan.",
      story: "Foto ini diambil saat kita tertawa lepas gara-gara lelucon konyol yang sebenarnya tidak lucu sama sekali. Momen-momen tanpa rencana seperti inilah yang selalu hangat dan berharga untuk diingat kembali.",
      color: "#68d8d6"
    },
    {
      id: "item_cassette",
      name: "Kaset Lagu Favorit",
      iconType: "cassette",
      locationHint: "Di tepi teras rumah berlantai batu",
      summary: "Kumpulan nada dan melodi yang menenangkan.",
      story: "Daftar lagu yang sering menemani perjalanan kita di jalan raya saat malam mulai turun. Musik yang selalu punya cara ajaib untuk membuat suasana tenang dan obrolan mengalir begitu alami.",
      color: "#ff70a6"
    },
    {
      id: "item_flower",
      name: "Bunga Mekar Abadi",
      iconType: "flower",
      locationHint: "Di sudut taman dekat aliran air kecil",
      summary: "Bunga segar yang dirawat dengan penuh kesabaran.",
      story: "Bunga ini mekar dengan indah di sudut paling teduh. Merawat hal-hal baik membutuhkan perhatian, kesabaran, dan ketulusan setiap harinya—sama seperti doa-doa baik yang selalu ada untukmu.",
      color: "#a0e426"
    }
  ],

  // Dialog 3 NPC Ramah
  npcs: {
    arga: {
      name: "Kak Arga",
      role: "Pecinta Kopi & Perawat Teras",
      avatarColor: "#e07a5f",
      dialogues: [
        "Hai! Udara hari ini sejuk sekali ya. Sangat pas untuk jalan-jalan santai tanpa perlu buru-buru.",
        "Kopi hangat di teras depan sambil mendengar gemerisik daun itu salah satu nikmat sederhana terbaik.",
        "Oh iya, tadi aku melihat sesuatu yang berkilau di dekat bangku kayu bawah pohon besar. Coba kamu tengok ke sana!"
      ]
    },
    rina: {
      name: "Bibi Rina",
      role: "Penyayang Tanaman & Penjual Bunga",
      avatarColor: "#81b29a",
      dialogues: [
        "Halo nak! Senang melihatmu mampir ke taman ini. Bunga-bunga hari ini sedang mekar dengan sangat harum.",
        "Merawat tanaman itu mengajari kita tentang kesabaran. Hal yang indah tidak tumbuh dalam semalam, tapi selalu mekar tepat pada waktunya.",
        "Kalau kamu mencari hal istimewa, coba perhatikan sudut-sudut bunga di dekat aliran air batu."
      ]
    },
    dito: {
      name: "Dito",
      role: "Sahabat Santai & Gamer Retro",
      avatarColor: "#3d5a80",
      dialogues: [
        "Woi! Lagi santai keliling ya? Kalau butuh hiburan seru, mesin arcade di sebelahku masih menyala dengan baik lho.",
        "Tadi aku sempat memasukkan koin baru. Kalau kamu berhasil dapat skor 10 di mini-game Bintang Kenangan, ada kupon spesial yang bakal terbuka!",
        "Santai saja mainnya, jangan terlalu tegang. Yang penting seru dan menyenangkan!"
      ]
    }
  },

  // Hewan Peliharaan & Interaksi
  animals: {
    catOrange: {
      name: "Miko si Kucing Oranye",
      petMessage: "Miko mendengkur hangat (purrr...) dan menggosokkan kepalanya dengan manja ke tanganmu.",
      sound: "meow"
    },
    catCalico: {
      name: "Belang si Kucing Belang",
      petMessage: "Belang menguap pelan, mengibaskan ekornya yang berbulu lebat, lalu meringkuk nyaman di dekatmu.",
      sound: "meow"
    },
    chicken: {
      name: "Ayam Kebun",
      petMessage: "Petok! Ayam ini melompat kecil lalu kembali mematuk rumput dengan riang mencari biji-bijian.",
      sound: "cluck"
    }
  },

  // Quest 3: Mini-Game Arcade
  arcadeConfig: {
    title: "Bintang Kenangan Retro",
    subtitle: "Tangkap bintang & hati yang berjatuhan, hindari awan mendung!",
    targetScore: 10,
    rewardName: "Kupon Hadiah Spesial & Kunci Gerbang Rahasia",
    rewardDesc: "Berhasil meraih skor di mesin arcade! Gerbang menuju taman belakang kini dapat terbuka."
  },

  // Quest 4: Photobooth
  photoboothConfig: {
    title: "Photobooth Kenangan",
    subtitle: "Ambil potret diorama bergaya retro sebagai kenang-kenangan",
    stickers: [
      "✨ Momen Indah",
      "☕ Hari yang Tenang",
      "🌿 Sudut Favorit",
      "💛 Terima Kasih"
    ],
    defaultNote: "Diambil di sudut taman diorama yang damai."
  },

  // Quest 5: Surat Penutup & Hadiah Utama (Di Gazebo)
  closingLetter: {
    title: "Surat di Bawah Lampu Gazebo",
    date: "Hari yang Istimewa",
    greeting: "Untuk Keyzha tersayang,",
    paragraphs: [
      "Terima kasih banyak sudah meluangkan waktu untuk berjalan keliling, mengumpulkan setiap kenangan kecil, dan sampai di sudut taman rahasia ini.",
      "Diorama kecil ini mungkin hanya sebuah dunia piksel sederhana, tapi setiap detail di dalamnya dibuat dengan tulus untuk menggambarkan betapa berharganya setiap obrolan, tawa, dan waktu yang kita lalui bersama.",
      "Hidup mungkin sering kali penuh dengan dinamika, tapi kuharap kamu selalu ingat bahwa kamu selalu punya ruang aman untuk beristirahat, menjadi dirimu sendiri apa adanya, dan merasa dihargai.",
      "Semoga hari-harimu ke depan selalu dinaungi ketenangan, langkahmu dimudahkan, dan hal-hal baik selalu menemukan jalannya kepadamu."
    ],
    couponsTitle: "Daftar Kupon Kenangan Spesial Untukmu:",
    coupons: [
      {
        code: "KUPON-NGOPI-01",
        title: "Kupon Ngopi & Obrolan Santai",
        desc: "Berlaku kapan saja untuk satu sesi ngopi hangat dan mendengarkan semua ceritamu tanpa batasan waktu."
      },
      {
        code: "KUPON-JALAN-02",
        title: "Kupon Rute Jalan Bebas Pilihanmu",
        desc: "Pilih destinasi jalan sore atau tempat makan mana pun yang sedang ingin kamu kunjungi minggu ini."
      },
      {
        code: "KUPON-REHAT-03",
        title: "Kupon Hari Bebas Penat",
        desc: "Satu hari tenang dengan camilan favorit, playlist santai, dan tanpa obrolan yang membebani pikiran."
      }
    ],
    signature: "Dengan tulus dan penuh terima kasih,",
    closingSender: "Dimas"
  }
};
