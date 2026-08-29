/* Tiny WebAudio synth — all sounds procedural, no assets. */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

function ensure(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.5;
      master.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function setMuted(m: boolean) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.5;
}

export function unlockAudio() {
  ensure();
}

interface ToneOpts {
  f: number;
  f2?: number;
  at?: number;
  dur?: number;
  type?: OscillatorType;
  vol?: number;
}

function tone({ f, f2, at = 0, dur = 0.12, type = "sine", vol = 0.2 }: ToneOpts) {
  const c = ensure();
  if (!c || !master || muted) return;
  const t0 = c.currentTime + at;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(Math.max(1, f2), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

function noise(at = 0, dur = 0.3, vol = 0.15, freq = 900) {
  const c = ensure();
  if (!c || !master || muted) return;
  const t0 = c.currentTime + at;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const flt = c.createBiquadFilter();
  flt.type = "lowpass";
  flt.frequency.setValueAtTime(freq, t0);
  flt.frequency.exponentialRampToValueAtTime(Math.max(80, freq * 0.4), t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(flt).connect(g).connect(master);
  src.start(t0);
}

export const sfx = {
  click() { tone({ f: 720, dur: 0.06, type: "triangle", vol: 0.12 }); },
  check() {
    tone({ f: 660, dur: 0.09, type: "triangle", vol: 0.16 });
    tone({ f: 990, at: 0.07, dur: 0.12, type: "triangle", vol: 0.16 });
  },
  water() {
    noise(0, 0.5, 0.16, 1100);
    tone({ f: 520, f2: 240, dur: 0.4, type: "sine", vol: 0.06 });
  },
  drop() {
    tone({ f: 988, dur: 0.07, type: "square", vol: 0.09 });
    tone({ f: 1319, at: 0.06, dur: 0.14, type: "square", vol: 0.09 });
  },
  crit() {
    [523, 659, 784, 1047].forEach((f, i) => tone({ f, at: i * 0.06, dur: 0.12, type: "square", vol: 0.1 }));
    noise(0.05, 0.25, 0.1, 2400);
  },
  levelup() {
    [392, 523, 659, 784, 1047].forEach((f, i) => tone({ f, at: i * 0.09, dur: 0.16, type: "triangle", vol: 0.16 }));
  },
  ripe() {
    [523, 659, 784].forEach((f, i) => tone({ f, at: i * 0.1, dur: 0.2, type: "sine", vol: 0.14 }));
    tone({ f: 1568, at: 0.34, dur: 0.3, type: "sine", vol: 0.1 });
  },
  pop() {
    tone({ f: 1180, f2: 480, dur: 0.1, type: "sine", vol: 0.18 });
    noise(0, 0.06, 0.08, 3000);
  },
  harvest() {
    [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone({ f, at: i * 0.11, dur: 0.22, type: "triangle", vol: 0.16 }));
    noise(0.1, 0.5, 0.08, 1800);
  },
  buy() {
    tone({ f: 880, dur: 0.08, type: "square", vol: 0.1 });
    tone({ f: 1175, at: 0.08, dur: 0.12, type: "square", vol: 0.1 });
  },
  deny() { tone({ f: 196, f2: 150, dur: 0.2, type: "sawtooth", vol: 0.08 }); },
  sleep() {
    tone({ f: 440, f2: 220, dur: 0.5, type: "sine", vol: 0.12 });
    tone({ f: 330, f2: 165, at: 0.3, dur: 0.6, type: "sine", vol: 0.1 });
  },
  plant() {
    tone({ f: 300, f2: 620, dur: 0.18, type: "triangle", vol: 0.14 });
    tone({ f: 620, f2: 900, at: 0.16, dur: 0.16, type: "triangle", vol: 0.12 });
  },
  equip() { tone({ f: 740, dur: 0.06, type: "triangle", vol: 0.12 }); tone({ f: 988, at: 0.06, dur: 0.09, type: "triangle", vol: 0.12 }); },
};
