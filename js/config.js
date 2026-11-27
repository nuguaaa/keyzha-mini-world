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
    summary: "Kunci kuningan berukir halus titipan Nugua melalui Kakek Bijak.",
    story: "Kunci kuningan yang dititipkan Nugua kepada Kakek Bijak di gubuk kebun barat untuk diserahkan langsung kepadamu setelah kamu menyapa para warga desa. Dengan kunci ini, pintu rumah hangat di atas tangga kini bisa dibuka.",
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
      "Kuncinya tidak tergeletak di tanah, melainkan kutitipkan pada warga desa yang bisa kamu percaya. Untuk mencarinya, coba seberangi jalan dan sapa Paman Jembatan di sebelah barat—beliau punya petunjuk pertama untukmu!"
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

  // Dialog NPC Ramah, Manis & Menghibur (Penuh Pujian & Cerita Manis tentang Nugua)
  npcs: {
    paman: {
      name: "Paman Jembatan",
      role: "Penjaga Aliran Sungai",
      avatarColor: "#b07d62",
      casualDialogue: "Halo neng Keyzha manis! Senyum kamu itu lho, cerah banget sampai suara gemericik air sungai aja kalah merdu. Tahu nggak, kemarin mas Nugua berdiri lama di jembatan ini, senyum-senyum sendiri sambil ngebayangin kamu lewat sini. Katanya, 'Keyzha pasti suka banget pemandangan sungai ini, Paman.' Manis banget ya dia!",
      questDialogue: "Halo nak Keyzha yang baik! Nugua dari kemarin wanti-wanti ke paman... katanya dia lagi menyiapkan kejutan manis buat kamu di dalam rumah kayu teras atas. Tapi sebelum ke sana, coba seberangi jembatan dan temui anak muda bernama Dito di pelataran arcade timur. Dito punya petunjuk berikutnya buatmu!",
      postKeyDialogue: "Wah nak Keyzha, kuncinya sudah berhasil kamu dapatkan dari Kakek Bijak ya! Lekaslah naik tangga ke teras rumah, mas Nugua sudah menyiapkan ruangan hangat dan hadiah spesial khusus untukmu!"
    },
    dito: {
      name: "Dito",
      role: "Pemain Arcade Santai",
      avatarColor: "#457b9d",
      casualDialogue: "Hai Keyzha! Aslinya kamu lebih manis ya daripada yang diceritain Nugua! Kemarin dia pasang mesin Tetris ini sambil curhat, katanya kamu itu orang paling berharga buat dia dan dia pengen banget bikin kamu ketawa lepas hari ini. Gimana, seru kan jalan-jalan di sini?",
      questDialogue: "Aha, kamu Keyzha ya! Nugua sudah wanti-wanti ke aku dari tadi pagi. Dia cerita banyak banget tentang kamu dan bilang kalau hari ini satu desa mau bikin kamu bahagia. Nah, orang yang tahu rahasia kunci rumah itu adalah Pak RT Broto yang lagi kumpul santai di dekat api unggun timur laut! Temui Pak RT ya, beliau punya arahan penting buatmu!",
      postKeyDialogue: "Keren banget Keyzha! Kunci kuningan dari Kakek Bijak sudah kamu pegang. Cepat susul ke rumah kayu atas ya, Nugua pasti sudah nggak sabar menyambutmu!"
    },
    pak_rt: {
      name: "Pak RT Broto",
      role: "Ketua RT Desa",
      avatarColor: "#4a6b82",
      casualDialogue: "Selamat sore neng Keyzha yang ayu. Jarang-jarang desa kita kedatangan gadis semanis dan sehangat neng. Mas Nugua itu kemarin heboh banget lapor ke Pak RT, katanya 'Pak RT, tolong bantu jaga desa ya, hari ini orang paling spesial di hidup saya mau datang.' Warga desa sampai ikut senyum-senyum lihat dia salting!",
      questDialogue: "Haha! Akhirnya nak Keyzha sampai di sini! Sebenarnya satu warga desa ini sudah tahu rencana rahasia Nugua kalau dia mau kasih kejutan terindah buat kamu di dalam rumah teras. Mas Nugua menitipkan kunci rumah kuningan itu ke sesepuh desa kita, yaitu Kakek Bijak di kebun barat. Beliau baru saja kembali ke gubuk kebunnya setelah menyiram bunga. Temui Kakek Bijak di gubuk kebun barat ya nak, kuncinya ada di tangan beliau!",
      postKeyDialogue: "Kakek Bijak sudah menyerahkan kuncinya ke tanganmu ya nak Keyzha. Sekarang lekaslah naik ke teras dan buka pintu rumah kayu itu. Nugua sudah menyiapkan ruangan hangat khusus untukmu!"
    },
    kakek: {
      name: "Kakek Bijak",
      role: "Tetua Taman di Gubuk Kebun",
      avatarColor: "#588157",
      casualDialogue: "Selamat sore, cucuku nak Keyzha. Senyumanmu yang tulus ini mengingatkan kakek pada embun pagi yang menyejukkan jiwa. Nugua anak yang langka nak... Ketulusannya menata setiap batu dan daun di taman ini membuktikan betapa dalamnya rasa sayangnya padamu. Kakek doakan kalian berdua selalu dinaungi kebahagiaan yang abadi ya.",
      questDialogue: "Halo nak Keyzha yang manis... Kakek sudah mendengar kabar dari Paman, Dito, dan Pak RT bahwa kamu sudah menyapa mereka semua dengan hangat. Kakek senang sekali melihat ketulusan hatimu. Ini dia nak... Kunci Rumah Kuningan yang dititipkan Nugua dengan penuh rasa cinta untukmu. Bawalah, naiklah ke teras atas, dan bukalah pintu rumah itu. Nugua sudah menyiapkan ruangan hangat dan hadiah terindah khusus untukmu!",
      postKeyDialogue: "Kuncinya sudah Kakek serahkan ya nak Keyzha. Sekarang lekaslah naik ke teras rumah kayu, buka pintunya. Nugua sudah menunggumu di dalam dengan senyuman terbaiknya!"
    },
    rina: {
      name: "Bibi Rina",
      role: "Perawat Bunga & Rumah",
      avatarColor: "#e07a5f",
      casualDialogue: "Halo Keyzha sayang! Senang sekali melihat langkah manismu menaiki tangga teras ini. Nugua kemarin sempat latihan berkali-kali nulis surat buat kamu di teras ini, kalau salah sedikit dia ganti kertas baru biar tulisannya rapi dan sampai ke hatimu. Rumah kayu ini sudah dia tata dengan wangi vanila dan kayu hangat khusus untuk menyambutmu!",
      questDialogue: "Wah, kuncinya sudah ada di tanganmu ya nak Keyzha? Pintu rumahnya sudah bisa dibuka sekarang. Masuklah sayang, Nugua sudah menyiapkan kado dan surat istimewa di atas meja belajar!"
    },
    bu_rt: {
      name: "Bu RT",
      role: "Warga Desa yang Ramah",
      avatarColor: "#c97b63",
      casualDialogue: "Aduh neng Keyzha... cantiknya neng! Pantesan mas Nugua itu kalau nyebut nama 'Keyzha' matanya langsung berbinar-binar kayak lampu hias. Kemarin dia bolak-balik nanya ke ibu, 'Bu RT, bunga di pot teras itu udah wangi dan cukup cantik belum ya buat Keyzha?' Romantis banget anak itu, bikin ibu baper sendiri!",
      postKeyDialogue: "Aduh senangnya... kuncinya sudah kamu terima dari Kakek ya nak? Mas Nugua itu kemarin sibuk sekali menata ruangan di atas khusus buat kamu. Lekas masuk ke rumah ya, perapiannya sudah menyala hangat."
    },
    mbak_tari: {
      name: "Mbak Tari",
      role: "Sahabat Warga",
      avatarColor: "#9b5de5",
      casualDialogue: "Hai Keyzha! Duh gayamu manis banget deh hari ini! Bunga-bunga di taman ini sampai insecure lihat senyuman kamu tahu! Nugua tuh sering banget cerita ke aku, katanya kamu itu orangnya pekerja keras dan penyayang banget. Makanya dia niat banget bikin taman kecil ini biar kamu bisa istirahat dan senyum bahagia hari ini!",
      postKeyDialogue: "Wah Keyzha! Nugua romantis banget ya, sampai-sampai satu warga desa diajak kompak merahasiakan ini buat kamu! Cepat buka pintunya, ada kado manis yang menunggumu di dalam!"
    },
    mang_ujang: {
      name: "Mang Ujang",
      role: "Penjaga Api & Jagung Bakar",
      avatarColor: "#d97706",
      casualDialogue: "Sampurasun neng Keyzha geulis! Senyumnya manis pisan euy! Tadi mas Nugua bisik-bisik ke mang Ujang, katanya kalau neng Keyzha kedinginan suruh diangetin di dekat api unggun ini. Jagung bakarnya juga mang Ujang pilihkan yang paling manis, tapi kayaknya masih kalah manis sama senyuman neng Keyzha!",
      postKeyDialogue: "Wah neng Keyzha sudah bawa kunci emasnya ya! Jagung bakarnya nanti dulu deh, buruan naik ke teras rumah, mas Nugua sudah nungguin dengan senyum lebar di dalam!"
    },
    nenek_minah: {
      name: "Nenek Minah",
      role: "Sesepuh Kebun Barat",
      avatarColor: "#6b705c",
      casualDialogue: "Aduh cucu nenek yang ayu... Mendekat sini nak, sejuk sekali wajahmu. Nugua kemarin seharian bantu nenek timba air di sumur ini sambil cerita terus soal kamu. Dia bilang, senyuman kamu itu obat capek paling ampuh sedunia. Nenek ikut bahagia lihat anak muda saling menyayangi dengan begitu tulus seperti kalian.",
      postKeyDialogue: "Alhamdulillah nak Keyzha... kuncinya sudah kamu pegang dari Kakek! Dari kemarin mas Nugua cerita terus soal kamu sambil bantu nenek timba air. Sekarang lekas naik ke rumah kayu ya sayang!"
    },
    mas_bayu: {
      name: "Mas Bayu",
      role: "Pemancing Santai Pinggir Sungai",
      avatarColor: "#2a9d8f",
      casualDialogue: "Sore Keyzha! Pantesan air sungai sore ini tenang dan sejuk banget, ternyata ada bidadari lagi jalan-jalan di tepi sungai! Nugua kemarin waktu nemenin aku mancing di sini bilang, 'Mas Bayu, Keyzha itu orangnya istimewa banget, aku mau bikin hari ini jadi hari yang paling bikin dia tersenyum.' Beruntung banget kalian berdua ya!",
      postKeyDialogue: "Keren euy kuncinya sudah dapet! Selamat ya Keyzha, mas Nugua kemarin seharian ngecek dekorasi di dalam rumah biar pas kamu datang semuanya sempurna!"
    },
    teh_sarah: {
      name: "Teh Sarah",
      role: "Pecinta Bunga Taman",
      avatarColor: "#e76f51",
      casualDialogue: "Halo Keyzha sayang! Ya ampun, aslinya imut dan anggun banget! Tadi aku lagi petik bunga mawar dan daisy putih, tapi pas kamu lewat langsung kebanting deh bunganya! Nugua tuh kemarin cerewet banget milih warna kelopak bunga, maunya yang warnanya lembut kayak warna kesukaan kamu. Dia perhatian banget kan?",
      postKeyDialogue: "Aaa Keyzha kuncinya sudah ada di tanganmu! Mas Nugua tuh niat banget ya nyiapin kejutan ini. Sana cepat naik tangga teras, buka kadonya!"
    },
    adit: {
      name: "Adit",
      role: "Bocah Penggemar Game",
      avatarColor: "#e63946",
      casualDialogue: "Kak Keyzha! Kakak tuh cantik banget deh kayak putri di game! Tahu nggak, kemarin Kak Nugua pamer ke aku, katanya 'Nanti ada cewek paling hebat dan paling manis di dunia yang main ke sini!' Aku kirain siapa, ternyata Kak Keyzha beneran! Kak Nugua sayang banget lho sama Kakak!",
      postKeyDialogue: "Horeee Kak Keyzha berhasil dapetin kuncinya! Tadi Kak Nugua pesen, kalau Kak Keyzha lewat suruh cepet-cepet masuk rumah, ada kado besar di dalem!"
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
      "Terima kasih banyak sudah meluangkan waktu untuk berjalan keliling, menemukan kunci kuningan dari Kakek Bijak, dan sampai di ruangan hangat ini.",
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
  },

  // Koleksi Foto Kenangan Berbingkai di Dinding Rumah Dalam (Nugua & Keyzha)
  wallPhotos: [
    {
      id: "photo_wall_1",
      image: "assets/photos/IMG_5994.JPG",
      title: "Pelukan & Cubitan Manis",
      subtitle: "Bingkai Kenangan 01 · Dinding Utara",
      caption: "Setiap tawa kecil dan keusilan manis ini selalu jadi alasan terbesar kenapa aku selalu bersyukur punya kamu di hidupku, Keyzha.",
      x: 96.0,
      y: 2.35,
      z: 95.06,
      rotY: 0,
      width: 2.2,
      height: 1.47,
      interactX: 96.0,
      interactZ: 96.5
    },
    {
      id: "photo_wall_2",
      image: "assets/photos/IMG_5995.JPG",
      title: "Senyuman Paling Teduh",
      subtitle: "Bingkai Kenangan 02 · Dinding Utara",
      caption: "Di antara semua hal di dunia, senyumanmu yang paling bisa bikin hariku tenang. Terima kasih sudah selalu jadi tempat pulang ternyaman buat aku.",
      x: 103.8,
      y: 2.35,
      z: 95.06,
      rotY: 0,
      width: 2.2,
      height: 1.47,
      interactX: 103.8,
      interactZ: 96.5
    },
    {
      id: "photo_wall_3",
      image: "assets/photos/IMG_5996.JPG",
      title: "Tiga Momen Tawa Lepas",
      subtitle: "Photostrip 3 Panel · Dinding Barat",
      caption: "Tiga gaya, tiga tawa, dan jutaan rasa sayang. Kapan pun kita lihat foto ini, semoga kamu selalu ingat betapa bahagianya kita saat bersama.",
      x: 93.06,
      y: 2.35,
      z: 97.2,
      rotY: Math.PI / 2,
      width: 2.3,
      height: 1.53,
      interactX: 94.4,
      interactZ: 97.2
    },
    {
      id: "photo_wall_4",
      image: "assets/photos/IMG_5997.JPG",
      title: "Photobooth Seru Kita",
      subtitle: "Photobooth Kenangan · Dinding Barat",
      caption: "Pose jail berdua di dalam photobooth. Nggak ada momen yang membosankan kalau dihabiskan bareng kamu!",
      x: 93.06,
      y: 2.35,
      z: 101.8,
      rotY: Math.PI / 2,
      width: 2.2,
      height: 1.47,
      interactX: 94.4,
      interactZ: 101.8
    },
    {
      id: "photo_wall_5",
      image: "assets/photos/IMG_5998.JPG",
      title: "Hangatnya Bersamamu",
      subtitle: "Bingkai Kenangan 05 · Dinding Timur",
      caption: "Taman kecil ini dibangun khusus untuk merayakan setiap detik manis yang pernah dan akan kita lewati bersama. I love you, Keyzha!",
      x: 106.94,
      y: 2.35,
      z: 97.5,
      rotY: -Math.PI / 2,
      width: 2.2,
      height: 1.47,
      interactX: 105.6,
      interactZ: 97.5
    }
  ]
};
