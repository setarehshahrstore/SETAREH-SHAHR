// src/utils/audio.ts

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

// Add a global click listener to initialize audio on first interaction
if (typeof window !== 'undefined') {
  const resumeAudio = () => {
    initAudio();
    window.removeEventListener('click', resumeAudio);
    window.removeEventListener('keydown', resumeAudio);
  };
  window.addEventListener('click', resumeAudio);
  window.addEventListener('keydown', resumeAudio);
}

// Cha-ching sound (cash register)
export const playChaChing = () => {
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    
    // Coin drop part (high pitched ping)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2000, t);
    osc1.frequency.exponentialRampToValueAtTime(4000, t + 0.1);
    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.3, t + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.5);

    // Register drawer slide (noise/low freq)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'square';
    osc2.frequency.setValueAtTime(100, t);
    osc2.frequency.exponentialRampToValueAtTime(40, t + 0.3);
    gain2.gain.setValueAtTime(0, t);
    gain2.gain.linearRampToValueAtTime(0.1, t + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t);
    osc2.stop(t + 0.3);

  } catch (e) {
    console.error("Audio play failed", e);
  }
};

// Pop sound (message)
export const playPop = () => {
  try {
    const ctx = initAudio();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};

// Telephone Ring
export const playRing = () => {
  try {
    const ctx = initAudio();
    if (!ctx) return;
    let t = ctx.currentTime;
    
    // Ring sequence: trill for 1.2s
    for (let i = 0; i < 30; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(i % 2 === 0 ? 600 : 750, t);
      
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.setValueAtTime(0.05, t + 0.03);
      gain.gain.linearRampToValueAtTime(0, t + 0.04);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.04);
      t += 0.04;
    }
  } catch (e) {
    console.error("Audio play failed", e);
  }
};
