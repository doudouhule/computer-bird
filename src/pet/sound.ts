/**
 * 它的嗓子。全部用 Web Audio 现场合成，不需要任何音频文件。
 * 黄桃牡丹鹦鹉的叫声特点：又高又尖、短、成串，急起来像在骂人。
 */

export type Call = 'chirp' | 'soft' | 'squawk' | 'grind' | 'beg' | 'bite';

let ctx: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;
let muted = false;

const KEY = 'grouchy-bird-muted';

try {
  muted = localStorage.getItem(KEY) === '1';
} catch {
  /* 隐私模式 */
}

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  try {
    localStorage.setItem(KEY, value ? '1' : '0');
  } catch {
    /* ignore */
  }
}

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function noise(c: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const len = Math.floor(c.sampleRate * 0.2);
  const buffer = c.createBuffer(1, len, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
  noiseBuffer = buffer;
  return buffer;
}

interface ToneOptions {
  from: number;
  to: number;
  dur: number;
  gain?: number;
  type?: OscillatorType;
  delay?: number;
  vibrato?: number;
}

function tone(c: AudioContext, o: ToneOptions): void {
  const t0 = c.currentTime + (o.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.from, t0);
  osc.frequency.exponentialRampToValueAtTime(Math.max(40, o.to), t0 + o.dur);

  if (o.vibrato) {
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = o.vibrato;
    lfoGain.gain.value = o.from * 0.03;
    lfo.connect(lfoGain).connect(osc.frequency);
    lfo.start(t0);
    lfo.stop(t0 + o.dur + 0.02);
  }

  g.gain.setValueAtTime(0.0001, t0);
  g.gain.linearRampToValueAtTime(o.gain ?? 0.1, t0 + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);

  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + o.dur + 0.02);
}

function hiss(c: AudioContext, dur: number, gain: number, delay = 0): void {
  const t0 = c.currentTime + delay;
  const src = c.createBufferSource();
  src.buffer = noise(c);
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2600;
  filter.Q.value = 1.2;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

export function play(call: Call): void {
  if (muted) return;
  const c = audio();
  if (!c) return;

  try {
    switch (call) {
      case 'chirp':
        tone(c, { from: 2600, to: 3900, dur: 0.07, gain: 0.075 });
        tone(c, { from: 3000, to: 2100, dur: 0.06, gain: 0.05, delay: 0.08 });
        break;
      case 'soft':
        tone(c, { from: 1800, to: 2300, dur: 0.09, gain: 0.035, vibrato: 22 });
        break;
      case 'beg':
        for (let i = 0; i < 3; i += 1) {
          tone(c, { from: 2400, to: 3400, dur: 0.055, gain: 0.06, delay: i * 0.13 });
        }
        break;
      case 'squawk':
        tone(c, { from: 1500, to: 900, dur: 0.22, gain: 0.09, type: 'sawtooth' });
        hiss(c, 0.18, 0.05);
        break;
      case 'grind':
        for (let i = 0; i < 4; i += 1) {
          hiss(c, 0.02, 0.03, i * 0.045);
        }
        tone(c, { from: 420, to: 300, dur: 0.16, gain: 0.03, type: 'triangle' });
        break;
      case 'bite':
        hiss(c, 0.035, 0.09);
        tone(c, { from: 900, to: 400, dur: 0.05, gain: 0.05, type: 'square' });
        break;
    }
  } catch {
    /* 音频不是必需的，出错就算了 */
  }
}

/** 教它口哨用的五个音（C D E G A） */
const NOTES = [523.25, 587.33, 659.25, 783.99, 880];

export const NOTE_LABELS = ['哆', '唻', '咪', '唆', '啦'];

export function noteLabel(index: number): string {
  return NOTE_LABELS[index] ?? '哆';
}

export function playNote(index: number, delay = 0): void {
  if (muted) return;
  const c = audio();
  if (!c) return;
  const freq = NOTES[index] ?? NOTES[0];
  try {
    tone(c, { from: freq, to: freq * 1.01, dur: 0.2, gain: 0.055, delay, vibrato: 16 });
  } catch {
    /* ignore */
  }
}

export function playSequence(notes: number[]): void {
  notes.forEach((n, i) => playNote(n, i * 0.24));
}

/** 不同反应配不同嗓子。睡觉时一点声音都没有。 */
export function callForEffect(effect: string): Call | null {
  switch (effect) {
    case 'feed_ok':
    case 'feed_bored':
    case 'toy_ok':
    case 'neutral':
      return 'chirp';
    case 'feed_refused':
    case 'bath_refused':
    case 'free_off':
    case 'scold':
    case 'sorry_refused':
      return 'squawk';
    case 'drink_ok':
    case 'drink_refused':
    case 'clean_ok':
    case 'toy_bored':
    case 'touch_ok':
    case 'play_tired':
    case 'play_sick':
    case 'free_refused':
    case 'sorry_ok':
    case 'sorry_soft':
      return 'soft';
    case 'bath_ok':
    case 'free_on':
    case 'play_ok':
      return 'beg';
    case 'touch_refused':
      return 'bite';
    case 'sleep_on':
    case 'sleep_off':
    case 'sleeping':
    case 'away':
      return null;
    default:
      return null;
  }
}
