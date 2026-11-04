import { wait } from '../util.js';
import { PHRASES, CONNECT } from '../phrases.js';
import { S } from '../state.js';
import { audioCtx, master } from './context.js';
import { recordedKeys, loadClip } from './clips.js';

let ruVoice = null;
function pickVoice() {
  const vs = speechSynthesis.getVoices().filter(v => /^ru/i.test(v.lang));
  ruVoice = vs.find(v => /milena/i.test(v.name) && /enhanced|premium|улучш/i.test(v.name))
    || vs.find(v => /milena/i.test(v.name)) || vs.find(v => v.localService) || vs[0] || null;
}
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

export let sayToken = 0, curSrc = null, pending = null, ttsBusy = false;
export function hush() {
  sayToken++;
  if (curSrc) { try { curSrc.onended = null; curSrc.stop(); } catch (e) {} curSrc = null; }
  if ('speechSynthesis' in window && (speechSynthesis.speaking || speechSynthesis.pending)) { speechSynthesis.cancel(); ttsBusy = true; }
  const p = pending; pending = null;
  if (p) p();
}
function playBuffer(buf) {
  return new Promise(res => {
    const s = audioCtx().createBufferSource();
    s.buffer = buf;
    s.connect(master);
    curSrc = s; pending = res;
    s.onended = () => { if (curSrc === s) curSrc = null; res(); };
    s.start();
  });
}
function speakTTS(text) {
  return new Promise(res => {
    if (!('speechSynthesis' in window) || !S.tts) return setTimeout(res, 300);
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ru-RU';
    if (ruVoice) u.voice = ruVoice;
    u.rate = .9; u.pitch = 1.05;
    let done = false;
    const fin = () => { if (!done) { done = true; clearTimeout(to); res(); } };
    const to = setTimeout(fin, 1500 + text.length * 110);
    u.onend = fin; u.onerror = fin;
    pending = fin;
    speechSynthesis.speak(u);
  });
}
// recorded keys play as clips; runs of unrecorded keys are merged into one TTS sentence
function segments(items, merge) {
  const segs = [];
  items.forEach((raw, idx) => {
    const q = raw.endsWith('?'), key = q ? raw.slice(0, -1) : raw;
    const text = (PHRASES[key] || key) + (q ? '?' : '');
    if (recordedKeys.has(key)) { segs.push({ key, idx }); return; }
    const last = segs[segs.length - 1];
    if (merge && last && last.text != null) {
      if (CONNECT.has(last.lastKey)) last.text += ' ' + text.charAt(0).toLowerCase() + text.slice(1);
      else last.text += (/[.!?…]$/.test(last.text) ? ' ' : '. ') + text;
      last.lastKey = key;
    } else segs.push({ text, idx, lastKey: key });
  });
  return segs;
}
export async function say(items, opts = {}) {
  hush();
  const token = sayToken;
  if (!Array.isArray(items)) items = [items];
  const segs = segments(items, opts.merge !== false);
  if (ttsBusy) { ttsBusy = false; await wait(90); } // iOS needs a beat after cancel()
  for (const seg of segs) {
    if (token !== sayToken) return false;
    if (opts.onItem) opts.onItem(seg.idx);
    if (seg.key) {
      const buf = await loadClip(seg.key);
      if (token !== sayToken) return false;
      if (buf) await playBuffer(buf); else await speakTTS(PHRASES[seg.key]);
    } else await speakTTS(seg.text);
    if (token !== sayToken) return false;
    await wait(opts.gap || 120);
  }
  return token === sayToken;
}
