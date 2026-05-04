/**
 * Aliasist Sound Engine
 * Subtle Web Audio API tones — no external dependencies, no audio files.
 * All sounds are synthesized procedurally at < 5% volume.
 */

let ctx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext {
  if (!ctx) {
    const WA = typeof window.AudioContext !== "undefined" ? window.AudioContext : undefined;
    const WK = typeof window !== "undefined"
      ? (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined;
    const Ctor = WA ?? WK;
    if (!Ctor) throw new Error("Web Audio API is not supported in this browser");
    ctx = new Ctor();
  }
  return ctx;
}

function tone(
  freq: number,
  type: OscillatorType,
  gain: number,
  duration: number,
  fadeIn = 0.005,
  fadeOut = 0.08
) {
  if (!enabled) return;
  try {
    const ac = getCtx();
    // Many browsers start AudioContext suspended until a user gesture.
    if (ac.state === "suspended") {
      void ac.resume();
    }
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.connect(gainNode);
    gainNode.connect(ac.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gainNode.gain.setValueAtTime(0, ac.currentTime);
    gainNode.gain.linearRampToValueAtTime(gain, ac.currentTime + fadeIn);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration - fadeOut);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch {
    // Audio blocked — silently ignore
  }
}

export function playHover() {
  tone(698.46, "sine", 0.010, 0.09, 0.008, 0.07);
  setTimeout(() => tone(783.99, "sine", 0.005, 0.07, 0.01, 0.05), 24);
}

export function playClick() {
  tone(523.25, "triangle", 0.012, 0.11, 0.006, 0.08);
  setTimeout(() => tone(659.25, "sine", 0.008, 0.10, 0.01, 0.07), 34);
}

export function playSuccess() {
  tone(523, 'sine', 0.022, 0.15);
  setTimeout(() => tone(659, 'sine', 0.020, 0.15), 100);
  setTimeout(() => tone(784, 'sine', 0.018, 0.22), 200);
}

export function playScan() {
  // Rising sweep for skill/section reveals
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.connect(gainNode);
    gainNode.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, ac.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ac.currentTime + 0.3);
    gainNode.gain.setValueAtTime(0, ac.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.016, ac.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.35);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + 0.4);
  } catch {
    /* Audio blocked — silently ignore */
  }
}

export function playTransmit() {
  // Short static burst — UI section entry
  tone(1200, 'sawtooth', 0.008, 0.06, 0.002, 0.05);
}

export function setEnabled(val: boolean) {
  enabled = val;
}

export function isEnabled() {
  return enabled;
}
