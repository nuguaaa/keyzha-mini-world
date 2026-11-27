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
  senderName: "Dimas",
  gameTitle: "Taman Kecil.",
  gameSubtitle: "HADIAH UNTUK KEYZHA",
  welcomeMessage: "Hai Keyzha, ada taman kecil yang aku siapin buat kamu. Jalan pelan-pelan aja, nggak usah buru-buru. Beberapa hal baik lagi nungguin kamu.",

  // Pesan Pintu Terkunci
  lockedDoorMessage: {
    title: "Pintu Depan Terkunci",
    text: "Pintu rumah kayu ini terkunci rapat. Sepertinya kunci kuningan disimpan di sudut taman dekat aliran sungai... Coba tanyakan pada Paman di jembatan atau periksa tepian sungai!"
  },

  // Item Kunci Rumah Kuningan
  houseKeyItem: {
    id: "item_house_key",
    name: "Kunci Rumah Kuningan",
    iconType: "key",
    summary: "Kunci kuningan berukir halus untuk membuka pintu rumah pondok.",
    story: "Kunci kuningan yang tersimpan tenang di dekat aliran air sungai. Dengan kunci ini, pintu rumah hangat di atas tangga bisa dibuka.",
    color: "#f6c445"
  },

  // Quest 1: Surat di Peti Pelataran (Opening Letter)
  openingLetter: {
    badge: "SEPUCUK SURAT UNTUKMU",
    title: "Selamat datang di Taman Kecil, Keyzha.",
    date: "Sebuah Hari yang Damai",
    greeting: "Untuk Keyzha,",
    paragraphs: [
      "Selamat datang! Aku sengaja membuat sudut kecil ini seperti diorama yang hangat dan tenang—sebuah tempat rehat sejenak untukmu dari padatnya hari-hari yang sibuk.",
      "Aku sudah menitipkan sesuatu yang spesial untukmu di dalam rumah kayu di atas tangga. Tapi pintunya terkunci rapat agar tidak sembarang dibuka.",
      "Kunci kuningannya disimpan di tempat teduh dekat pepohonan di tepi aliran sungai. Sambil mencari kuncinya, jalan-jalanlah santai keliling taman ini: sapa Bibi Rina di teras, Paman di jembatan, mainkan game Tetris di arcade, dan abadikan foto di photobooth."
    ],
    hint: "Petunjuk: Periksa peti sambutan di depanmu, lalu jelajahi taman ke arah teras rumah atau jembatan kayu di sebelah barat.",
    signature: "Selamat menikmati harimu ya,",
    closing: "- Dimas"
  },

  // Item Kenangan Tambahan di Taman
  questItems: [
    {
      id: "item_ticket",
      name: "Tiket Jalan Santai",
      iconType: "ticket",
      locationHint: "Di dekat bangku kayu bawah pohon rindang",
      summary: "Tiket simbolis untuk jalan santai tanpa perlu terburu-buru.",
      story: "Mengingatkan kita bahwa tidak semua hal harus dikejar dengan tergesa-gesa. Terkadang, momen terbaik tercipta saat kita melangkah pelan sambil menikmati percakapan sederhana.",
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

  // Dialog NPC Ramah Sesuai Video Referensi
  npcs: {
    paman: {
      name: "Paman Jembatan",
      role: "Penjaga Aliran Sungai",
      avatarColor: "#b07d62",
      dialogues: [
        "Halo anak muda! Senang melihatmu berkunjung ke jembatan ini. Suara gemericik air di bawah sini sangat menenangkan ya.",
        "Oh, kamu mencari kunci pintu rumah kayu di atas tangga? Tadi aku melihat kilauan kuning di balik pohon rindang dekat tepian sungai sebelah barat!",
        "Hati-hati saat melangkah di tepi air ya. Nikmatilah suasana sejuk di taman ini!"
      ]
    },
    kakek: {
      name: "Kakek Bijak",
      role: "Tetua Taman",
      avatarColor: "#588157",
      dialogues: [
        "Selamat pagi, nak. Setiap langkah yang kita ambil hari ini selalu membawa cerita baru yang berharga.",
        "Rumah kayu di atas tangga itu punya perapian hangat dan teh yang harum. Begitu kamu menemukan kuncinya, beristirahatlah di sana.",
        "Semoga harimu selalu dipenuhi ketenangan dan senyuman tulus."
      ]
    },
    dito: {
      name: "Dito",
      role: "Pemain Arcade Santai",
      avatarColor: "#457b9d",
      dialogues: [
        "Halo Keyzha! Lagi keliling taman ya? Kalau ingin tantangan seru, coba mainkan mesin Tetris di sebelahku!",
        "Mesin Tetris ini klasik banget. Susun balok-baloknya, penuhi baris, dan ada pesan manis rahasia kalau kamu berhasil menyelesaikan tantangannya!",
        "Jangan lupa juga berpose di Photobooth sebelah ya, pencahayaan fotonya bagus banget hari ini!"
      ]
    },
    rina: {
      name: "Bibi Rina",
      role: "Perawat Bunga & Rumah",
      avatarColor: "#e07a5f",
      dialogues: [
        "Halo Keyzha! Senang sekali kamu berkunjung ke teras rumah. Aku baru saja menyiram mawar dan bunga aster di sini.",
        "Rumah kayu di belakangku ini sudah disiapkan dengan sangat hangat oleh Dimas. Perapiannya sudah menyala dan suasananya damai sekali.",
        "Kalau kamu mencari kunci kuningan untuk membukanya, sepertinya tersimpan di sudut teduh dekat tepian sungai sebelah barat. Coba periksa di balik pepohonan ya!"
      ]
    },
    bu_rt: {
      name: "Bu RT",
      role: "Warga Desa yang Ramah",
      avatarColor: "#c97b63",
      dialogues: [
        "Loh, neng manis... kamu Keyzha ya? Dari tadi kelihatan mondar-mandir keliling taman, lagi nyariin seseorang ya?",
        "Tadi kami para warga di sini lagi ngobrolin kamu sama Dimas. Mas Dimas itu kemarin sempat nungguin lama sekali di sudut taman ini...",
        "Tapi kata Pak RT, Mas Dimas sudah tidak tinggal di desa ini lagi. Dia pamit pergi demi masa depan... tapi sebelum berangkat, dia sibuk sekali menata taman indah ini khusus untuk kamu.",
        "Coba tanyakan ke Pak RT di sebelahku, beliau sempat bicara panjang lebar dengan Dimas sebelum dia berangkat."
      ]
    },
    pak_rt: {
      name: "Pak RT Broto",
      role: "Ketua RT Desa",
      avatarColor: "#4a6b82",
      dialogues: [
        "Betul nak Keyzha, Dimas memang sudah tidak tinggal di sini lagi. Waktu kemarin pamit ke bapak, wajahnya kelihatan berat sekali harus meninggalkan tempat ini.",
        "Dia berpesan pada bapak: 'Pak RT, kalau nanti Keyzha datang ke taman mencari saya, tolong sampaikan kalau semua sudut taman ini sengaja saya buat agar dia bisa tersenyum dan rehat sejenak.'",
        "Dia juga menitipkan kunci kuningan dan kado kenangan di dalam rumah kayu teras atas. Coba cari kuncinya di tepian sungai dekat pohon barat, lalu buka rumah itu ya nak.",
        "Semoga kamu menyukai suasana damai di taman kecil ini ya nak Keyzha."
      ]
    },
    mbak_tari: {
      name: "Mbak Tari",
      role: "Sahabat Warga",
      avatarColor: "#9b5de5",
      dialogues: [
        "Hai Keyzha! Akhirnya kita ketemu langsung! Dari kemarin Dimas sering banget cerita soal kamu ke kami waktu lagi ngerawat taman ini.",
        "Iya... Mas Dimas sudah pindah dan tidak tinggal di sini lagi. Tapi kamu jangan sedih ya, rasa sayangnya ke kamu masih terasa begitu hangat di setiap sudut tempat ini.",
        "Dia ninggalin surat penuh cinta di meja belajar di dalam rumah teras. Masuklah ke sana, perapiannya hangat banget!",
        "Kamu perempuan yang sangat beruntung dicintai setulus itu oleh Dimas."
      ]
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
    rewardName: "Kupon Arcade & Pesan Manis Dimas",
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
      "Terima kasih banyak sudah meluangkan waktu untuk berjalan keliling, menemukan kunci kuningan, dan sampai di ruangan hangat ini.",
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
    closingSender: "Dimas"
  }
};
