/**
 * ============================================================================
 * KONFIGURASI ASET & KONTEN GAME - TAMAN KECIL (HD-2D DIORAMA)
 * ============================================================================
 * Mengatur konfigurasi custom assets/ dengan auto-fallback aman,
 * alur quest bergaya video referensi, surat parchment, dan dialog NPC.
 */

// --- 1. KONFIGURASI CUSTOM ASET (assets/) DENGAN AUTO-FALLBACK AMAN ---
window.ASSET_CONFIG = {
  player: {
    useCustom: true,
    spritesheet: "assets/player/character.png",
    cols: 3,
    rows: 4,
    down: "assets/player/walk_down.png",
    up: "assets/player/walk_up.png",
    left: "assets/player/walk_left.png",
    right: "assets/player/walk_right.png",
    singleImage: "assets/player/idle.png"
  },
  npcs: {
    paman: { path: "assets/npcs/paman.png", cols: 1, rows: 1 },
    kakek: { path: "assets/npcs/kakek.png", cols: 1, rows: 1 },
    dito: { path: "assets/npcs/dito.png", cols: 1, rows: 1 },
    rina: { path: "assets/npcs/rina.png", cols: 1, rows: 1 }
  },
  pets: {
    chicken: { path: "assets/pets/chicken.png", cols: 1, rows: 1 },
    catOrange: { path: "assets/pets/cat.png", cols: 1, rows: 1 }
  }
};

// --- 2. KONFIGURASI GAME & CERITA ---
window.GAME_CONFIG = {
  recipientName: "Keyzha",
  senderName: "Nugua",
  gameTitle: "Taman Kecil.",
  gameSubtitle: "HADIAH UNTUK KEYZHA",
  welcomeMessage: "Hai Keyzha, ada taman kecil yang aku siapin buat kamu. Jalan pelan-pelan aja, nggak usah buru-buru. Beberapa hal baik lagi nungguin kamu.",

  // Pesan Pintu Terkunci
  lockedDoorMessage: {
    title: "Pintu Depan Terkunci",
    text: "Pintu rumah kayu ini terkunci rapat. Kunci kuningan dipegang oleh salah satu warga desa... Coba mulai perjalananmu dengan membaca Surat Sambutan di peti taman depan, lalu ikuti petunjuk warga!"
  },

  // Item Kunci Rumah Kuningan
  houseKeyItem: {
    id: "item_house_key",
    name: "Kunci Rumah Kuningan",
    iconType: "key",
    summary: "Kunci kuningan berukir halus titipan Nugua melalui Pak RT.",
    story: "Kunci kuningan yang dititipkan Nugua kepada Pak RT Broto untuk diserahkan langsung kepadamu. Dengan kunci ini, pintu rumah hangat di atas tangga kini bisa dibuka.",
    color: "#f6c445"
  },

  // Quest 1: Surat di Peti Pelataran (Opening Letter)
  openingLetter: {
    badge: "SEPUCUK SURAT UNTUKMU",
    title: "Selamat datang di Taman Kecil, Keyzha.",
    date: "Sebuah Hari yang Damai",
    greeting: "Untuk Keyzha tersayang,",
    paragraphs: [
      "Selamat datang di Taman Kecil! Aku sengaja membuat sudut diorama ini spesial untukmu—sebuah ruang yang tenang untuk rehat sejenak dari lelah dan padatnya hari-harimu.",
      "Aku sudah menyiapkan sebuah kejutan manis untukmu di dalam rumah kayu di atas teras tangga. Tapi pintunya sengaja dikunci rapat agar menjadi rahasia.",
      "Kuncinya tidak tergeletak di tanah, melainkan kutitipkan pada salah satu warga desa yang bisa kamu percaya. Untuk mencarinya, coba seberangi jalan dan sapa Paman Jembatan di sebelah barat—beliau punya petunjuk pertama untukmu!"
    ],
    hint: "Petunjuk: Sapa Paman di jembatan kayu di sebelah barat untuk mencari tahu petunjuk kunci rumah.",
    signature: "Dengan tulus dan penuh cinta,",
    closing: "- Nugua"
  },

  // Item Kenangan Tambahan di Taman
  questItems: [
    {
      id: "item_ticket",
      name: "Tiket Jalan Santai",
      iconType: "ticket",
      locationHint: "Di keranjang piknik bangku taman depan",
      summary: "Tiket simbolis untuk jalan santai tanpa perlu terburu-buru.",
      story: "Mengingatkan kita bahwa tidak semua hal harus dikejar dengan tergesa-gesa. Terkadang, momen terbaik tercipta saat kita melangkah pelan sambil menikmati percakapan sederhana bersama Nugua.",
      color: "#f6c445"
    },
    {
      id: "item_polaroid",
      name: "Foto Kenangan Hangat",
      iconType: "polaroid",
      locationHint: "Di pelataran kayu samping Photobooth",
      summary: "Potret kecil yang mengabadikan tawa tulus.",
      story: "Foto sederhana yang merekam tawa lepas di sore hari. Kenangan-kenangan kecil seperti inilah yang selalu menghangatkan hati kapan pun kita mengingatnya kembali.",
      color: "#68d8d6"
    },
    {
      id: "item_flower",
      name: "Bunga Daisy Mekar",
      iconType: "flower",
      locationHint: "Di antara semak bunga putih dekat tangga teras",
      summary: "Bunga segar yang mekar dengan anggun di tepi jalan batu.",
      story: "Bunga putih yang tumbuh tenang di tepi undakan batu. Sama seperti hal-hal baik dalam hidup, ia mekar dengan indah pada waktunya.",
      color: "#a0e426"
    }
  ],

  // Dialog NPC Ramah dengan Respon Dinamis (Quest Terstruktur & Obrolan Santai)
  npcs: {
    paman: {
      name: "Paman Jembatan",
      role: "Penjaga Aliran Sungai",
      avatarColor: "#b07d62",
      casualDialogue: "Halo neng manis! Udara di atas jembatan kayu ini sejuk sekali ya. Suara gemericik air sungai di bawah selalu bikin hati tenang. Selamat jalan-jalan santai di desa ini ya!",
      questDialogue: "Halo nak Keyzha! Nugua tadi sempat pesan ke paman... katanya dia lagi menyiapkan kejutan manis buat kamu di dalam rumah kayu. Tapi sebelum ke sana, coba seberangi jembatan dan temui anak muda bernama Dito di pelataran arcade timur. Dito punya petunjuk berikutnya!"
    },
    kakek: {
      name: "Kakek Bijak",
      role: "Tetua Taman",
      avatarColor: "#588157",
      dialogues: [
        "Selamat pagi, nak Keyzha. Senyumanmu mengingatkan kakek pada indahnya masa muda.",
        "Nugua anak yang sangat baik dan tulus. Dia menaruh banyak harapan dan kasih sayang di setiap jengkal taman kecil ini untukmu.",
        "Semoga langkahmu selalu dinaungi kedamaian dan kebahagiaan sejati."
      ]
    },
    dito: {
      name: "Dito",
      role: "Pemain Arcade Santai",
      avatarColor: "#457b9d",
      casualDialogue: "Halo! Selamat datang di pelataran bermain. Mesin Tetris di sebelahku ini klasik banget lho, asyik dimainkan kalau lagi senggang. Jangan lupa foto-foto juga di photobooth sebelah ya!",
      questDialogue: "Aha, kamu Keyzha ya! Nugua sudah wanti-wanti ke aku dari tadi pagi. Dia cerita banyak banget tentang kamu dan bilang kalau hari ini satu desa mau bikin kamu bahagia. Nah, orang yang memegang kunci rumah itu adalah Pak RT Broto yang lagi kumpul santai di dekat api unggun timur laut! Temui beliau ya, kuncinya ada di sana!"
    },
    rina: {
      name: "Bibi Rina",
      role: "Perawat Bunga & Rumah",
      avatarColor: "#e07a5f",
      casualDialogue: "Halo Keyzha! Senang sekali kamu berkunjung ke teras rumah. Aku baru saja menyiram mawar dan bunga aster di sini. Rumah kayu ini terkunci rapat atas pesan Nugua. Coba ikuti petunjuk yang ada di taman ya!",
      questDialogue: "Wah, kuncinya sudah ada di tanganmu ya nak Keyzha? Pintu rumahnya sudah bisa dibuka sekarang. Masuklah, Nugua sudah menyiapkan kado dan surat istimewa di atas meja belajar!"
    },
    bu_rt: {
      name: "Bu RT",
      role: "Warga Desa yang Ramah",
      avatarColor: "#c97b63",
      casualDialogue: "Sore yang hangat ya neng manis. Api unggun ini enak sekali buat kumpul-kumpul santai sore begini.",
      questDialogue: "Loh, neng Keyzha! Dari tadi kami para warga di sini lagi senyum-senyum nungguin kamu. Mas Nugua itu kemarin sibuk sekali menata rumah kayu di atas khusus buat kamu lho. Coba bicara dengan Pak RT di sebelahku, beliau pegang titipan penting dari Nugua!",
      postKeyDialogue: "Aduh senangnya... kuncinya sudah kamu terima dari Pak RT ya nak? Mas Nugua itu kemarin sibuk sekali menata ruangan di atas. Lekas masuk ke rumah ya, perapiannya sudah menyala hangat."
    },
    pak_rt: {
      name: "Pak RT Broto",
      role: "Ketua RT Desa",
      avatarColor: "#4a6b82",
      casualDialogue: "Selamat sore nak. Senang rasanya melihat suasana desa kita selalu rukun dan damai. Silakan duduk-duduk di dekat api unggun ini kalau mau menghangatkan badan.",
      questDialogue: "Haha! Akhirnya nak Keyzha sampai di sini! Sebenarnya satu warga desa ini sudah tahu rencana rahasia Nugua kalau dia mau kasih kejutan manis buat kamu di dalam rumah teras. Nugua menitipkan kunci rumah kuningan ini langsung ke tangan bapak untuk diserahkan kepadamu. Ini kuncinya nak... bawalah, dan bukalah rumah kayu itu. Nugua sudah menyiapkan segalanya dengan penuh cinta di dalam sana!",
      postKeyDialogue: "Kuncinya sudah bapak serahkan ya nak Keyzha. Sekarang lekaslah naik ke teras dan buka pintu rumah kayu itu. Nugua sudah menyiapkan ruangan hangat khusus untukmu."
    },
    mbak_tari: {
      name: "Mbak Tari",
      role: "Sahabat Warga",
      avatarColor: "#9b5de5",
      casualDialogue: "Halo! Bunga-bunga di taman ini lagi mekar wangi banget ya hari ini. Senang melihat pemandangan sejuk begini.",
      questDialogue: "Hai Keyzha! Akhirnya kita ketemu langsung! Dari kemarin Nugua sering banget cerita soal kamu ke kami waktu lagi ngerawat taman ini. Satu desa kompak menjaga rahasia ini buat kamu lho! Bicara dengan Pak RT ya, kuncinya ada di beliau!",
      postKeyDialogue: "Wah Keyzha! Nugua romantis banget ya, sampai-sampai satu warga desa diajak kompak merahasiakan ini buat kamu! Cepat buka pintunya, ada kado manis yang menunggumu di dalam!"
    }
  },

  // Hewan Peliharaan
  animals: {
    chicken1: {
      name: "Ayam Putih",
      petMessage: "Petok! Ayam putih ini melompat kecil lalu mematuk rumput dengan riang di dekat kakimu.",
      sound: "cluck"
    },
    chicken2: {
      name: "Ayam Jago Kecil",
      petMessage: "Ayam ini mengepakkan sayapnya pelan dan berkokok riang menyambut kedatanganmu.",
      sound: "cluck"
    },
    catOrange: {
      name: "Miko si Kucing Oranye",
      petMessage: "Miko mendengkur hangat (purrr...) sambil menggosokkan kepalanya dengan manja ke tanganmu.",
      sound: "meow"
    }
  },

  // Mini-Game Arcade (Tetris HEYTML PLAY)
  arcadeConfig: {
    title: "HEYTML PLAY · TETRIS",
    subtitle: "Susun balok, penuhi baris, kejar rekor. Kalau papannya penuh, ada pesan manis yang menunggumu.",
    targetLines: 2, // 2 baris untuk memicu kemenangan santai
    targetScore: 200,
    rewardName: "Kupon Arcade & Pesan Manis Nugua",
    rewardDesc: "Berhasil menyelesaikan permainan Tetris! Pesan kenangan terbuka untukmu."
  },

  // Photobooth Studio
  photoboothConfig: {
    title: "Photobooth Kenangan",
    subtitle: "Abadikan sudut diorama saat ini menjadi cetakan foto polaroid retro.",
    stickers: [
      "✨ Momen Indah",
      "☕ Hari yang Tenang",
      "🌿 Sudut Favorit",
      "💛 Terima Kasih"
    ],
    defaultNote: "Diambil di sudut taman diorama yang damai."
  },

  // Quest 6: Surat Penutup & Hadiah Utama (Di Meja Belajar Dalam Rumah)
  closingLetter: {
    badge: "KADO & SURAT UTAMA",
    title: "Surat di Bawah Lampu Meja Belajar",
    date: "Hari yang Istimewa",
    greeting: "Untuk Keyzha tersayang,",
    paragraphs: [
      "Terima kasih banyak sudah meluangkan waktu untuk berjalan keliling, menemukan kunci kuningan dari Pak RT, dan sampai di ruangan hangat ini.",
      "Diorama kecil ini mungkin hanya sebuah dunia piksel sederhana, tapi setiap sudut, tanaman, dan detail di dalamnya dibuat dengan tulus untuk menggambarkan betapa berharganya setiap obrolan, tawa, dan waktu yang kita lalui bersama.",
      "Hidup mungkin sering kali penuh dengan dinamika dan kesibukan, tapi kuharap kamu selalu ingat bahwa kamu selalu punya ruang aman untuk beristirahat, menjadi dirimu sendiri apa adanya, dan merasa dihargai.",
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
    signature: "Dengan tulus dan penuh kasih,",
    closingSender: "Nugua"
  }
};
