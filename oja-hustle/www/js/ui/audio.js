// ============================================================
//  SOUND — all sounds are generated in code (no audio files).
//  sfx("sale") etc. plays an effect; music.start()/stop() for the loop.
// ============================================================

let ctx = null, master = null, musicGain = null;
let soundOn = true, musicOn = true, musicTimer = null, step = 0;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq, start, dur, type = "sine", vol = 0.3, dest) {
  const c = ac(); if (!c) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, c.currentTime + start);
  g.gain.setValueAtTime(0.0001, c.currentTime + start);
  g.gain.exponentialRampToValueAtTime(vol, c.currentTime + start + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
  o.connect(g); g.connect(dest || master);
  o.start(c.currentTime + start); o.stop(c.currentTime + start + dur + 0.05);
}
function noise(start, dur, vol = 0.08, dest) {
  const c = ac(); if (!c) return;
  const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
  f.type = "highpass"; f.frequency.value = 6000;
  src.buffer = buf; g.gain.value = vol;
  src.connect(f); f.connect(g); g.connect(dest || master);
  src.start(c.currentTime + start);
}

const SFX = {
  tap: () => tone(660, 0, 0.06, "triangle", 0.15),
  sale: () => { tone(1318, 0, 0.09, "square", 0.12); tone(1760, 0.07, 0.25, "square", 0.1); noise(0, 0.12, 0.05); },
  coin: () => { tone(988, 0, 0.07, "square", 0.1); tone(1319, 0.06, 0.15, "square", 0.1); },
  bad: () => { tone(220, 0, 0.18, "sawtooth", 0.12); tone(165, 0.12, 0.25, "sawtooth", 0.1); },
  haggle: () => { tone(523, 0, 0.1, "triangle", 0.2); tone(659, 0.1, 0.1, "triangle", 0.2); tone(523, 0.2, 0.15, "triangle", 0.2); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, "triangle", 0.22)),
  page: () => tone(880, 0, 0.05, "sine", 0.1),
  alarm: () => { tone(880, 0, 0.12, "square", 0.08); tone(660, 0.14, 0.12, "square", 0.08); },
};

export function sfx(name) {
  if (!soundOn) return;
  try { (SFX[name] || SFX.tap)(); } catch (e) { /* audio is optional */ }
}

// A small highlife-style loop: bass, bell melody and shaker.
const BASS = [98, 0, 98, 0, 131, 0, 147, 0, 98, 0, 98, 0, 131, 0, 110, 0];
const BELL = [784, 0, 659, 0, 784, 880, 0, 659, 587, 0, 659, 0, 523, 0, 587, 0];
function musicStep() {
  const c = ac(); if (!c) return;
  const i = step % 16, bar = Math.floor(step / 16) % 4;
  if (BASS[i]) tone(BASS[i] * (bar === 3 ? 1.122 : 1), 0, 0.22, "triangle", 0.5, musicGain);
  if (BELL[i] && (bar % 2 === 0 || i < 8)) tone(BELL[i], 0, 0.18, "sine", 0.22, musicGain);
  noise(0, 0.05, i % 2 ? 0.05 : 0.09, musicGain);
  step++;
}
export const music = {
  start() {
    if (!musicOn || musicTimer) return;
    if (!ac()) return;
    musicTimer = setInterval(musicStep, 150);
  },
  stop() { clearInterval(musicTimer); musicTimer = null; },
};

export function setAudio(settings) {
  soundOn = !!settings.sound; musicOn = !!settings.music;
  if (!musicOn) music.stop();
}
document.addEventListener("visibilitychange", () => { if (document.hidden) music.stop(); });
