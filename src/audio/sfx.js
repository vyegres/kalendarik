import { audioCtx, master } from './context.js';

function tone(f, t0, dur, type = 'sine', vol = .16, f2) {
  const c = audioCtx(), o = c.createOscillator(), g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + .015);
  g.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  o.connect(g); g.connect(master);
  o.start(t0); o.stop(t0 + dur + .02);
}
export const sfx = {
  tap() { tone(520, audioCtx().currentTime, .09, 'sine', .12, 820); },
  good() { const t = audioCtx().currentTime; [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * .08, .18, 'triangle', .16)); },
  bad() { const t = audioCtx().currentTime; tone(330, t, .16, 'sine', .14, 260); tone(260, t + .15, .22, 'sine', .14, 200); },
  star() { const t = audioCtx().currentTime; [1319, 1568, 2093].forEach((f, i) => tone(f, t + i * .06, .25, 'sine', .08)); },
  fanfare() { const t = audioCtx().currentTime; [[523, 0], [659, .12], [784, .24], [1047, .36], [784, .52], [1047, .64]].forEach(([f, d]) => tone(f, t + d, .28, 'square', .06)); },
  vroom() {
    const c = audioCtx(), t = c.currentTime, o = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(70, t);
    o.frequency.exponentialRampToValueAtTime(220, t + .45);
    o.frequency.exponentialRampToValueAtTime(140, t + .8);
    fl.type = 'lowpass'; fl.frequency.value = 900;
    g.gain.setValueAtTime(.0001, t);
    g.gain.exponentialRampToValueAtTime(.1, t + .05);
    g.gain.exponentialRampToValueAtTime(.0001, t + .85);
    o.connect(fl); fl.connect(g); g.connect(master);
    o.start(t); o.stop(t + .9);
  },
};
