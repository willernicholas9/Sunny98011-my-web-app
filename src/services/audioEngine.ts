// Web Audio API & Web Speech API Sound Engine for Spiral Frenzy

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicInterval: number | null = null;
  private isMuted: boolean = false;
  private musicVolume: number = 0.4;
  private sfxVolume: number = 0.7;
  private voicesEnabled: boolean = true;
  private isPlayingMusic: boolean = false;
  private currentTempoMs: number = 180; // Starts at ~133 BPM, speeds up with level!
  private currentTrack: "jump_around" | "ice_ice_baby" | "cyber_overdrive" | "rotation" = "jump_around";
  private lastSpeechTime: number = 0;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public setMusicTrack(track: "jump_around" | "ice_ice_baby" | "cyber_overdrive" | "rotation") {
    this.currentTrack = track;
    if (this.isPlayingMusic) {
      this.stopMusic();
      this.startMusic();
    }
  }

  public getMusicTrack(): "jump_around" | "ice_ice_baby" | "cyber_overdrive" | "rotation" {
    return this.currentTrack;
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolumes(musicVol: number, sfxVol: number, voices: boolean) {
    this.musicVolume = musicVol;
    this.sfxVolume = sfxVol;
    this.voicesEnabled = voices;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- Web Audio Synthesizer Sound Effects ---
  public playJumpSound(slotIndex: number = 0) {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const duration = 0.16; // 160ms snappy jump duration
      const baseFreq = 180 + slotIndex * 40;

      // Master gain for this jump sound event
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(this.sfxVolume * 0.75, now);
      masterGain.connect(this.ctx.destination);

      // Layer 1: Fast Punchy Spring Sweep (Primary Sine Wave)
      const primaryOsc = this.ctx.createOscillator();
      const primaryGain = this.ctx.createGain();
      primaryOsc.type = "sine";
      primaryOsc.frequency.setValueAtTime(baseFreq, now);
      // Punchy upward exponential swoop
      primaryOsc.frequency.exponentialRampToValueAtTime(baseFreq * 3.6, now + duration);

      primaryGain.gain.setValueAtTime(0.001, now);
      primaryGain.gain.linearRampToValueAtTime(0.9, now + 0.008); // Instant snappy attack
      primaryGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      primaryOsc.connect(primaryGain);
      primaryGain.connect(masterGain);

      // Layer 2: Takeoff Pop / Punch Transient (Triangle body for warm arcade feel)
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      popOsc.type = "triangle";
      popOsc.frequency.setValueAtTime(baseFreq * 1.5, now);
      popOsc.frequency.exponentialRampToValueAtTime(baseFreq * 4.2, now + duration * 0.8);

      popGain.gain.setValueAtTime(0.001, now);
      popGain.gain.linearRampToValueAtTime(0.4, now + 0.005);
      popGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.7);

      popOsc.connect(popGain);
      popGain.connect(masterGain);

      // Layer 3: Sub-thump for tactile liftoff impact (40ms low thump)
      const thumpOsc = this.ctx.createOscillator();
      const thumpGain = this.ctx.createGain();
      thumpOsc.type = "sine";
      thumpOsc.frequency.setValueAtTime(140, now);
      thumpOsc.frequency.exponentialRampToValueAtTime(50, now + 0.045);

      thumpGain.gain.setValueAtTime(0.5, now);
      thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      thumpOsc.connect(thumpGain);
      thumpGain.connect(masterGain);

      // Trigger all nodes
      primaryOsc.start(now);
      primaryOsc.stop(now + duration);
      popOsc.start(now);
      popOsc.stop(now + duration);
      thumpOsc.start(now);
      thumpOsc.stop(now + 0.05);
    } catch (e) {
      console.warn("Audio error on jump sound", e);
    }
  }

  public playDuckSound(slotIndex: number = 0) {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 400 - slotIndex * 50;
      osc.type = "triangle";
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, this.ctx.currentTime + 0.18);

      gain.gain.setValueAtTime(this.sfxVolume * 0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  public playExhaustedSound(slotIndex: number = 0) {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Double low click/buzz to convey stamina depletion
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(120, now);
      osc1.frequency.exponentialRampToValueAtTime(60, now + 0.08);

      gain1.gain.setValueAtTime(this.sfxVolume * 0.45, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.08);

      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "sawtooth";
      osc2.frequency.setValueAtTime(95, now + 0.09);
      osc2.frequency.exponentialRampToValueAtTime(50, now + 0.18);

      gain2.gain.setValueAtTime(this.sfxVolume * 0.45, now + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.09);
      osc2.stop(now + 0.18);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  public playHitSound() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      // Create noise explosion + pitch dive
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(this.sfxVolume * 0.8, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  public playLevelUpChime() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(this.sfxVolume * 0.4, this.ctx!.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + idx * 0.08 + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(this.ctx!.currentTime + idx * 0.08);
        osc.stop(this.ctx!.currentTime + idx * 0.08 + 0.2);
      });
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  public playGemSound() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(this.sfxVolume * 0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  public playSlowMoSound() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Pitch dive and pulse for time warp / slow-mo effect
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(this.sfxVolume * 0.6, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio error", e);
    }
  }

  public playComboSound(comboCount: number = 1) {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const baseFreq = Math.min(1200, 440 + comboCount * 60);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.12);

      gain.gain.setValueAtTime(this.sfxVolume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn("Audio combo error", e);
    }
  }

  public playMilestoneFanfare() {
    if (this.isMuted || this.sfxVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(this.sfxVolume * 0.6, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.25);
      });
    } catch (e) {
      console.warn("Audio fanfare error", e);
    }
  }

  // --- Web Speech API Player Character Voices (Safely Throttled & Non-Blocking) ---
  public speakCharacterLine(text: string, characterId: string) {
    if (this.isMuted || !this.voicesEnabled) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const now = Date.now();
    // Throttle character banter so rapid triggers never block the thread or glitch
    if (now - this.lastSpeechTime < 450) return;
    this.lastSpeechTime = now;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = Math.min(1, this.sfxVolume * 0.9);

      // Customize speech pitch and rate for each character
      if (characterId === "zack") {
        utterance.pitch = 1.35;
        utterance.rate = 1.3;
      } else if (characterId === "jet") {
        utterance.pitch = 1.1;
        utterance.rate = 1.35;
      } else if (characterId === "naomi") {
        utterance.pitch = 1.55;
        utterance.rate = 1.2;
      } else if (characterId === "dub") {
        utterance.pitch = 0.75;
        utterance.rate = 1.1;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Graceful silence on speech synthesis restrictions
    }
  }

  public speakAnnouncer(text: string) {
    if (this.isMuted || !this.voicesEnabled) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = this.sfxVolume;
      utterance.pitch = 0.95;
      utterance.rate = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      // Graceful silence
    }
  }

  // --- Chiptune Synth Music Engine (Homemade Remixes) ---
  public startMusic() {
    if (this.isMuted || this.musicVolume <= 0) return;
    this.initCtx();
    if (!this.ctx) return;
    if (this.isPlayingMusic) return;

    this.isPlayingMusic = true;
    let step = 0;

    // --- SONG 1: "JUMP AROUND" (Frenzy Arcade Remix) ---
    // Key: A Minor / Bouncy Hip-Hop Horn & Bassline
    const jumpAroundLead = [
      880, 880, 0, 1046.5, 1174.66, 1244.5, 1174.66, 1046.5,
      880, 880, 1318.51, 0, 880, 1046.5, 880, 0,
      880, 880, 0, 1046.5, 1174.66, 1244.5, 1174.66, 1046.5,
      1318.51, 1318.51, 1174.66, 1046.5, 880, 1046.5, 880, 0
    ];
    const jumpAroundBass = [
      220, 220, 0, 261.63, 293.66, 311.13, 293.66, 261.63,
      220, 220, 329.63, 0, 220, 261.63, 220, 196.0,
      220, 220, 0, 261.63, 293.66, 311.13, 293.66, 261.63,
      329.63, 329.63, 293.66, 261.63, 220, 261.63, 220, 0
    ];

    // --- SONG 2: "ICE ICE BABY" (Frenzy Arcade Remix) ---
    // Key: D Minor / Iconic 7-Note Bassline: "Ding Ding Ding Di-Di-Ding-Ding"
    const iceIceBass = [
      146.83, 146.83, 146.83, 146.83, 0, 146.83, 174.61, 196.0,
      146.83, 146.83, 146.83, 146.83, 0, 146.83, 220.0, 196.0,
      146.83, 146.83, 146.83, 146.83, 0, 146.83, 174.61, 196.0,
      146.83, 146.83, 146.83, 146.83, 0, 146.83, 220.0, 196.0
    ];
    const iceIceLead = [
      587.33, 587.33, 698.46, 783.99, 880.0, 783.99, 698.46, 587.33,
      0, 587.33, 698.46, 783.99, 880.0, 1046.5, 880.0, 783.99,
      587.33, 587.33, 698.46, 783.99, 880.0, 783.99, 698.46, 587.33,
      0, 587.33, 698.46, 783.99, 880.0, 1046.5, 880.0, 587.33
    ];

    // --- SONG 3: "CYBER OVERDRIVE" (High-Energy Electronic Ascender) ---
    // Fast arpeggiated cyberpunk electro synth
    const cyberBass = [
      110, 110, 130.81, 110, 146.83, 110, 164.81, 110,
      110, 110, 130.81, 110, 146.83, 164.81, 174.61, 196.0,
      98, 98, 123.47, 98, 146.83, 98, 164.81, 98,
      110, 110, 130.81, 110, 146.83, 164.81, 220.0, 246.94
    ];
    const cyberLead = [
      440, 523.25, 659.25, 880, 783.99, 659.25, 523.25, 440,
      587.33, 698.46, 880, 1046.5, 987.77, 880, 698.46, 587.33,
      392, 493.88, 587.33, 783.99, 698.46, 587.33, 493.88, 392,
      440, 523.25, 659.25, 880, 1046.5, 1174.66, 1318.51, 1567.98
    ];

    this.musicInterval = window.setInterval(() => {
      if (!this.isPlayingMusic || !this.ctx || this.isMuted) return;

      try {
        const time = this.ctx.currentTime;

        // Determine active track pattern
        let effectiveSong = this.currentTrack;
        if (effectiveSong === "rotation") {
          const rotChoice = Math.floor(step / 32) % 3;
          effectiveSong = rotChoice === 0 ? "jump_around" : rotChoice === 1 ? "ice_ice_baby" : "cyber_overdrive";
        }

        const seqIdx = step % 32;

        if (effectiveSong === "jump_around") {
          // --- JUMP AROUND SYNTH SYNTHESIS ---
          const melFreq = jumpAroundLead[seqIdx];
          const bassFreq = jumpAroundBass[seqIdx];

          // Iconic Whistle Siren Horn Bend on beat 0 or 16
          if (seqIdx === 0 || seqIdx === 16) {
            const hornOsc = this.ctx.createOscillator();
            const hornGain = this.ctx.createGain();
            hornOsc.type = "sawtooth";
            hornOsc.frequency.setValueAtTime(880, time);
            hornOsc.frequency.exponentialRampToValueAtTime(1400, time + 0.25);
            hornGain.gain.setValueAtTime(this.musicVolume * 0.2, time);
            hornGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
            hornOsc.connect(hornGain);
            hornGain.connect(this.ctx.destination);
            hornOsc.start(time);
            hornOsc.stop(time + 0.25);
          }

          // Lead synth note
          if (melFreq > 0) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(melFreq, time);
            gain.gain.setValueAtTime(this.musicVolume * 0.16, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + 0.14);
          }

          // Bouncy Bass synth
          if (bassFreq > 0) {
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = "triangle";
            bassOsc.frequency.setValueAtTime(bassFreq, time);
            bassGain.gain.setValueAtTime(this.musicVolume * 0.24, time);
            bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.20);
            bassOsc.connect(bassGain);
            bassGain.connect(this.ctx.destination);
            bassOsc.start(time);
            bassOsc.stop(time + 0.20);
          }

          // Percussion Click (Snare / Kick)
          if (seqIdx % 4 === 2) {
            const snareOsc = this.ctx.createOscillator();
            const snareGain = this.ctx.createGain();
            snareOsc.type = "square";
            snareOsc.frequency.setValueAtTime(180, time);
            snareOsc.frequency.exponentialRampToValueAtTime(40, time + 0.08);
            snareGain.gain.setValueAtTime(this.musicVolume * 0.1, time);
            snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
            snareOsc.connect(snareGain);
            snareGain.connect(this.ctx.destination);
            snareOsc.start(time);
            snareOsc.stop(time + 0.08);
          }
        } else if (effectiveSong === "ice_ice_baby") {
          // --- ICE ICE BABY SYNTH SYNTHESIS ---
          const bassFreq = iceIceBass[seqIdx];
          const melFreq = iceIceLead[seqIdx];

          // Iconic "Ding Ding Ding Di-Di-Ding-Ding" Bassline
          if (bassFreq > 0) {
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = "square"; // Punchy retro 8-bit bass synth
            bassOsc.frequency.setValueAtTime(bassFreq, time);
            bassGain.gain.setValueAtTime(this.musicVolume * 0.22, time);
            bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
            bassOsc.connect(bassGain);
            bassGain.connect(this.ctx.destination);
            bassOsc.start(time);
            bassOsc.stop(time + 0.16);
          }

          // High lead hook melody
          if (melFreq > 0) {
            const leadOsc = this.ctx.createOscillator();
            const leadGain = this.ctx.createGain();
            leadOsc.type = "sine";
            leadOsc.frequency.setValueAtTime(melFreq, time);
            leadGain.gain.setValueAtTime(this.musicVolume * 0.15, time);
            leadGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            leadOsc.connect(leadGain);
            leadGain.connect(this.ctx.destination);
            leadOsc.start(time);
            leadOsc.stop(time + 0.15);
          }

          // Crisp Hi-Hat click
          if (seqIdx % 2 === 1) {
            const hatOsc = this.ctx.createOscillator();
            const hatGain = this.ctx.createGain();
            hatOsc.type = "sawtooth";
            hatOsc.frequency.setValueAtTime(2000, time);
            hatGain.gain.setValueAtTime(this.musicVolume * 0.05, time);
            hatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
            hatOsc.connect(hatGain);
            hatGain.connect(this.ctx.destination);
            hatOsc.start(time);
            hatOsc.stop(time + 0.04);
          }
        } else {
          // --- CYBER OVERDRIVE ELECTRO SYNTH ---
          const bassFreq = cyberBass[seqIdx];
          const melFreq = cyberLead[seqIdx];

          // Heavy Sawtooth Electro Bass
          if (bassFreq > 0) {
            const bassOsc = this.ctx.createOscillator();
            const bassGain = this.ctx.createGain();
            bassOsc.type = "sawtooth";
            bassOsc.frequency.setValueAtTime(bassFreq, time);
            bassGain.gain.setValueAtTime(this.musicVolume * 0.22, time);
            bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
            bassOsc.connect(bassGain);
            bassGain.connect(this.ctx.destination);
            bassOsc.start(time);
            bassOsc.stop(time + 0.14);
          }

          // Cyber Arpeggio Lead
          if (melFreq > 0) {
            const leadOsc = this.ctx.createOscillator();
            const leadGain = this.ctx.createGain();
            leadOsc.type = "triangle";
            leadOsc.frequency.setValueAtTime(melFreq, time);
            leadGain.gain.setValueAtTime(this.musicVolume * 0.18, time);
            leadGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);
            leadOsc.connect(leadGain);
            leadGain.connect(this.ctx.destination);
            leadOsc.start(time);
            leadOsc.stop(time + 0.12);
          }

          // Cyber Kick / Snare rhythm
          if (seqIdx % 4 === 0) {
            const kickOsc = this.ctx.createOscillator();
            const kickGain = this.ctx.createGain();
            kickOsc.type = "sine";
            kickOsc.frequency.setValueAtTime(140, time);
            kickOsc.frequency.exponentialRampToValueAtTime(30, time + 0.09);
            kickGain.gain.setValueAtTime(this.musicVolume * 0.25, time);
            kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);
            kickOsc.connect(kickGain);
            kickGain.connect(this.ctx.destination);
            kickOsc.start(time);
            kickOsc.stop(time + 0.09);
          } else if (seqIdx % 4 === 2) {
            const snareOsc = this.ctx.createOscillator();
            const snareGain = this.ctx.createGain();
            snareOsc.type = "square";
            snareOsc.frequency.setValueAtTime(220, time);
            snareOsc.frequency.exponentialRampToValueAtTime(60, time + 0.08);
            snareGain.gain.setValueAtTime(this.musicVolume * 0.12, time);
            snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
            snareOsc.connect(snareGain);
            snareGain.connect(this.ctx.destination);
            snareOsc.start(time);
            snareOsc.stop(time + 0.08);
          }
        }

        step++;
      } catch (e) {
        // ignore timing glitch
      }
    }, this.currentTempoMs);
  }

  public updateTempoForLevel(currentLevel: number) {
    // As level goes from 1 to 200, tempo speeds up from 180ms down to 80ms!
    const targetTempo = Math.max(80, 180 - Math.floor((currentLevel / 200) * 100));
    if (Math.abs(this.currentTempoMs - targetTempo) > 10) {
      this.currentTempoMs = targetTempo;
      if (this.isPlayingMusic) {
        this.stopMusic();
        this.startMusic();
      }
    }
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isPlayingMusic = false;
  }
}

export const audioEngine = new AudioEngine();
