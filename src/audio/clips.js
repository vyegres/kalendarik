import { audioCtx } from './context.js';
import { DB } from './db.js';

export const clipCache = new Map();
export let recordedKeys = new Set();
export function decode(buf) {
  const c = audioCtx();
  return new Promise((res, rej) => {
    const p = c.decodeAudioData(buf, res, rej);
    if (p && p.then) p.then(res, rej);
  });
}
// trim silence around a recording, normalise volume, soften the edges
function polish(buf) {
  const c = audioCtx(), ch = buf.getChannelData(0), n = ch.length;
  let peak = 0;
  for (let i = 0; i < n; i++) { const v = Math.abs(ch[i]); if (v > peak) peak = v; }
  if (peak < .01) return buf;
  const th = Math.max(.015, peak * .07);
  let s = 0, e = n - 1;
  while (s < n && Math.abs(ch[s]) < th) s++;
  while (e > s && Math.abs(ch[e]) < th) e--;
  const pad = Math.floor(buf.sampleRate * .05);
  s = Math.max(0, s - pad);
  e = Math.min(n, e + pad * 3);
  const len = e - s, gain = Math.min(5, .9 / peak), fade = Math.min(Math.floor(buf.sampleRate * .01), len >> 2);
  const out = c.createBuffer(buf.numberOfChannels, len, buf.sampleRate);
  for (let k = 0; k < buf.numberOfChannels; k++) {
    const src = buf.getChannelData(k), dst = out.getChannelData(k);
    for (let i = 0; i < len; i++) {
      const env = i < fade ? i / fade : (len - i < fade ? (len - i) / fade : 1);
      dst[i] = src[s + i] * gain * env;
    }
  }
  return out;
}
export async function loadClip(key) {
  if (clipCache.has(key)) return clipCache.get(key);
  let out = null;
  try {
    const rec = await DB.get(key);
    if (rec && rec.data) out = polish(await decode(rec.data.slice(0)));
  } catch (e) { console.warn('clip', key, e); }
  clipCache.set(key, out);
  return out;
}
export async function preloadClips() {
  try {
    recordedKeys = new Set(await DB.keys());
    await Promise.all([...recordedKeys].map(loadClip));
  } catch (e) {}
}
