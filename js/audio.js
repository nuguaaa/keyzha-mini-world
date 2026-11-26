/**
 * ============================================================================
 * PROCEDURAL AUDIO SYNTHESIZER (Web Audio API)
 * ============================================================================
 * 100% tanpa file audio eksternal (.mp3/.wav).
 * Menghasilkan efek suara langkah, klik, dialog, item pickup, kuis/quest,
 * suara hewan, suara pintu kayu (buka & terkunci), dan musik latar santai (BGM).
 */

class SoundSystem {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.isMuted = localStorage.getItem("diorama_muted") === "true";
    this.bgmPlaying = false;
    this.bgmInterval = null;
    this.bgmStep = 0;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX Gain
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // BGM Gain
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio API tidak didukung pada browser ini", e);
    }
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    localStorage.setItem("diorama_muted", this.isMuted);

    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.8;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(targetGain, this.ctx.currentTime + 0.1);
    }
    return this.isMuted;
  }

  // --- EFEK SUARA (SFX) ---

  // Langkah Kaki Halus (Soft Step / Rustle)
  playFootstep(surface = "grass") {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(surface === "stone" ? 480 : 280, t);

    osc.type = "triangle";
    const baseFreq = surface === "stone" ? 110 + Math.random() * 30 : 70 + Math.random() * 20;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Klik UI Halus
  playClick() {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.04);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Suara Pintu Terkunci (Goyang Handle Kayu & Kunci Macet)
  playDoorLocked() {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    // Ketukan kayu berderak
    [0, 0.09].forEach(delay => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, t + delay);
      osc.frequency.exponentialRampToValueAtTime(50, t + delay + 0.07);
      gain.gain.setValueAtTime(0.18, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + delay);
      osc.stop(t + delay + 0.07);
    });
  }

  // Suara Pintu Terbuka (Kunci Membuka & Ayunan Kayu Hangat)
  playDoorOpen() {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    // Dentang kunci kuningan terbuka
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, t);
    osc1.frequency.exponentialRampToValueAtTime(1320, t + 0.06);
    gain1.gain.setValueAtTime(0.15, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.08);

    // Ayunan pintu kayu berat
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(90, t + 0.06);
    osc2.frequency.linearRampToValueAtTime(160, t + 0.35);
    gain2.gain.setValueAtTime(0.14, t + 0.06);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(t + 0.06);
    osc2.stop(t + 0.45);
  }

  // Huruf Dialog / Blip
  playDialogueBlip(pitch = 1.0) {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    const baseFreq = 420 * pitch * (0.95 + Math.random() * 0.1);
    osc.frequency.setValueAtTime(baseFreq, t);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // Mengambil Item Kenangan / Kunci (Arpeggio Berkilau)
  playItemCollect() {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.4);
    });
  }

  // Notifikasi Misi Selesai / Fanfare Hangat
  playQuestComplete() {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    const chords = [
      { notes: [440, 554.37, 659.25], delay: 0.0, dur: 0.25 },
      { notes: [493.88, 622.25, 739.99], delay: 0.22, dur: 0.25 },
      { notes: [523.25, 659.25, 783.99, 1046.5], delay: 0.45, dur: 0.8 }
    ];

    const t = this.ctx.currentTime;
    chords.forEach(c => {
      c.notes.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t + c.delay);

        gain.gain.setValueAtTime(0.14, t + c.delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + c.delay + c.dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t + c.delay);
        osc.stop(t + c.delay + c.dur);
      });
    });
  }

  playMeow() {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(680, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(380, t + 0.45);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.48);
  }

  playChicken() {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    [0, 0.12].forEach((delay, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      const startF = idx === 0 ? 580 : 720;
      osc.frequency.setValueAtTime(startF, t + delay);
      osc.frequency.exponentialRampToValueAtTime(320, t + delay + 0.08);

      gain.gain.setValueAtTime(0.12, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + delay);
      osc.stop(t + delay + 0.08);
    });
  }

  playCameraFlash() {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(1200, t);
    gain1.gain.setValueAtTime(0.15, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.04);

    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(240, t + 0.08);
    osc2.frequency.exponentialRampToValueAtTime(600, t + 0.25);
    gain2.gain.setValueAtTime(0.1, t + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(t + 0.08);
    osc2.stop(t + 0.35);
  }

  playArcadeScore() {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(660, t);
    osc.frequency.setValueAtTime(990, t + 0.07);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  playArcadeMiss() {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.18);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  playArcadeWin() {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    const notes = [440, 554, 659, 880, 1108];
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, t + idx * 0.1);

      gain.gain.setValueAtTime(0.12, t + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + idx * 0.1);
      osc.stop(t + idx * 0.1 + 0.25);
    });
  }

  playChestOpen() {
    if (this.isMuted || !this.initialized) return;
    this.ensureContext();
    const t = this.ctx.currentTime;

    const chord = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t + i * 0.05);

      gain.gain.setValueAtTime(0.15, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 1.2);
    });
  }

  // --- BGM PROCEDURAL (Musik Lofi / Santai yang Damai) ---
  startBGM() {
    this.ensureContext();
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;

    const chordProgression = [
      { root: 174.61, notes: [261.63, 329.63, 392.00, 523.25] },
      { root: 164.81, notes: [246.94, 329.63, 392.00, 493.88] },
      { root: 146.83, notes: [220.00, 261.63, 349.23, 440.00] },
      { root: 130.81, notes: [196.00, 261.63, 329.63, 392.00] }
    ];

    let chordIndex = 0;
    const playChordStep = () => {
      if (!this.bgmPlaying || !this.ctx || this.isMuted) return;

      const chord = chordProgression[chordIndex];
      const now = this.ctx.currentTime;
      const duration = 3.6;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(800, now);
      filter.connect(this.bgmGain);

      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = "sine";
      bassOsc.frequency.setValueAtTime(chord.root / 2, now);
      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(0.18, now + 0.4);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + duration - 0.1);
      bassOsc.connect(bassGain);
      bassGain.connect(filter);
      bassOsc.start(now);
      bassOsc.stop(now + duration);

      chord.notes.forEach((freq, idx) => {
        const noteDelay = idx * 0.14;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + noteDelay);

        gain.gain.setValueAtTime(0.001, now + noteDelay);
        gain.gain.linearRampToValueAtTime(0.09, now + noteDelay + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + noteDelay + 2.8);

        osc.connect(gain);
        gain.connect(filter);

        osc.start(now + noteDelay);
        osc.stop(now + noteDelay + 2.9);
      });

      if (Math.random() > 0.3) {
        const melodyNotes = [523.25, 587.33, 659.25, 783.99, 880.00];
        const randomNote = melodyNotes[Math.floor(Math.random() * melodyNotes.length)];
        const melDelay = 1.6 + Math.random() * 0.8;

        const melOsc = this.ctx.createOscillator();
        const melGain = this.ctx.createGain();
        melOsc.type = "sine";
        melOsc.frequency.setValueAtTime(randomNote, now + melDelay);

        melGain.gain.setValueAtTime(0.001, now + melDelay);
        melGain.gain.linearRampToValueAtTime(0.08, now + melDelay + 0.15);
        melGain.gain.exponentialRampToValueAtTime(0.001, now + melDelay + 1.2);

        melOsc.connect(melGain);
        melGain.connect(filter);
        melOsc.start(now + melDelay);
        melOsc.stop(now + melDelay + 1.3);
      }

      chordIndex = (chordIndex + 1) % chordProgression.length;
    };

    playChordStep();
    this.bgmInterval = setInterval(playChordStep, 3600);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  toggleBGM() {
    if (this.bgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }
}

window.soundSystem = new SoundSystem();
