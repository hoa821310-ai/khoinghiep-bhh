// Gentle Web Audio API synthesizer for instant realtime notifications

class NotificationSoundService {
  private audioCtx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  playNewOrderChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // Dual-tone chime (E5 -> G#5 -> B5)
      const frequencies = [659.25, 830.61, 987.77];
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.1);

        gain.gain.setValueAtTime(0, now + index * 0.1);
        gain.gain.linearRampToValueAtTime(0.18, now + index * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.1 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.55);
      });
    } catch (e) {
      // Audio playback fails silently if browser policy restricts
    }
  }

  playStatusUpdateChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // Ascending chord (A4 -> C#5)
      const frequencies = [440, 554.37];
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.45);
      });
    } catch (e) {
      // Audio playback fails silently
    }
  }
}

export const soundService = new NotificationSoundService();
