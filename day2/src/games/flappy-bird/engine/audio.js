class SoundEngine {
  constructor() {
    this.ctx = null;
    this.volume = 0.6;
    this.muted = false;
  }

  ensureContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  configure(volume, muted) {
    this.volume = volume;
    this.muted = muted;
  }

  playTone({ freq, endFreq, duration, type = 'sine', gainScale = 0.25 }) {
    if (this.muted || this.volume <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    }

    const peakGain = Math.max(0.001, this.volume * gainScale);
    gain.gain.setValueAtTime(peakGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  flap() {
    this.playTone({ freq: 280, endFreq: 520, duration: 0.09, type: 'triangle', gainScale: 0.22 });
  }

  score() {
    this.playTone({ freq: 660, endFreq: 880, duration: 0.11, type: 'sine', gainScale: 0.25 });
    setTimeout(() => {
      this.playTone({ freq: 990, endFreq: 1174, duration: 0.14, type: 'sine', gainScale: 0.2 });
    }, 60);
  }

  hit() {
    this.playTone({ freq: 180, endFreq: 55, duration: 0.22, type: 'sawtooth', gainScale: 0.35 });
  }

  click() {
    this.playTone({ freq: 520, endFreq: 420, duration: 0.05, type: 'sine', gainScale: 0.12 });
  }
}

export const soundEngine = new SoundEngine();
