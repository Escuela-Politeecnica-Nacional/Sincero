/**
 * Efectos de sonido de Sincero, sintetizados con la Web Audio API.
 * No se descargan archivos: cada sonido se construye con osciladores
 * suaves (seno / triángulo) y envolventes lentas para que sean agradables
 * y nunca estridentes. El sonido de «intentar otra vez» es amable, no un
 * zumbido de error.
 */
export type SoundName = 'correct' | 'incorrect' | 'levelUp' | 'calm';

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!AC) return null;

  if (!ctx) {
    // Los navegadores solo permiten audio después de una interacción.
    const activation = (navigator as Navigator & { userActivation?: { hasBeenActive: boolean } }).userActivation;
    if (activation && !activation.hasBeenActive) return null;

    ctx = new AC();
    // Cadena maestra: volumen moderado + filtro para suavizar agudos.
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 5200;
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(filter);
    filter.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
  return ctx;
}

interface ToneOptions {
  freq: number;
  start: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  attack?: number;
  /** Añade un armónico suave tipo campanita. */
  bell?: boolean;
  /** Desliza la frecuencia hasta este valor. */
  glideTo?: number;
}

function tone(c: AudioContext, out: AudioNode, o: ToneOptions) {
  const t0 = c.currentTime + o.start;
  const attack = o.attack ?? 0.012;
  const volume = o.volume ?? 0.22;

  const voices: [number, number][] = [[o.freq, volume]];
  if (o.bell) voices.push([o.freq * 2, volume * 0.22], [o.freq * 3, volume * 0.06]);

  for (const [freq, vol] of voices) {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = o.type ?? 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (o.glideTo) osc.frequency.exponentialRampToValueAtTime(o.glideTo * (freq / o.freq), t0 + o.duration * 0.8);

    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(vol, t0 + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + o.duration);

    osc.connect(gain);
    gain.connect(out);
    osc.start(t0);
    osc.stop(t0 + o.duration + 0.05);
  }
}

/* Notas (Hz) */
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const A5 = 880;
const C6 = 1046.5;
const E6 = 1318.51;
const G4 = 392;
const E4 = 329.63;

const SOUNDS: Record<SoundName, (c: AudioContext, out: AudioNode) => void> = {
  /** Campanitas ascendentes (Mi–Sol–Do) con un destello final. */
  correct: (c, out) => {
    tone(c, out, { freq: E5, start: 0, duration: 0.32, bell: true });
    tone(c, out, { freq: G5, start: 0.09, duration: 0.32, bell: true });
    tone(c, out, { freq: C6, start: 0.18, duration: 0.7, bell: true, volume: 0.24 });
    tone(c, out, { freq: E6, start: 0.3, duration: 0.5, volume: 0.05 });
  },
  /** «Mmm… otra vez»: dos notas suaves y graves, sin zumbido de error. */
  incorrect: (c, out) => {
    tone(c, out, { freq: G4, start: 0, duration: 0.28, type: 'triangle', volume: 0.16, attack: 0.03 });
    tone(c, out, { freq: E4, start: 0.2, duration: 0.45, type: 'triangle', volume: 0.14, attack: 0.04, glideTo: E4 * 1.02 });
  },
  /** Pequeña fanfarria de celebración. */
  levelUp: (c, out) => {
    [C5, E5, G5, C6].forEach((f, i) => tone(c, out, { freq: f, start: i * 0.1, duration: 0.3, bell: true, volume: 0.18 }));
    [C5, E5, G5, C6].forEach((f) => tone(c, out, { freq: f, start: 0.46, duration: 1.3, bell: true, volume: 0.09, attack: 0.03 }));
    tone(c, out, { freq: E6, start: 0.62, duration: 0.6, volume: 0.05 });
    tone(c, out, { freq: A5 * 2, start: 0.74, duration: 0.5, volume: 0.035 });
  },
  /** Campanita lenta y tranquila (fin de la respiración). */
  calm: (c, out) => {
    tone(c, out, { freq: C5, start: 0, duration: 1.6, bell: true, volume: 0.14, attack: 0.08 });
    tone(c, out, { freq: G5, start: 0.25, duration: 1.6, bell: true, volume: 0.1, attack: 0.08 });
  },
};

export function playSound(name: SoundName) {
  try {
    const c = getContext();
    if (!c || !master) return;
    SOUNDS[name](c, master);
  } catch {
    /* Si el audio falla, la actividad continúa sin sonido. */
  }
}
