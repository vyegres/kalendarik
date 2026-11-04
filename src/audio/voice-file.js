import { PHRASES } from '../phrases.js';
import { DB } from './db.js';
import { clipCache, recordedKeys, decode, loadClip } from './clips.js';

// voice backup file: every clip as mono 16-bit WAV (plays everywhere, unlike Chrome's webm)
export const VOICE_FILE = 'kalendarik-golos.json';
function wavBytes(buf) {
  const k = Math.max(1, Math.floor(buf.sampleRate / 22050)), src = buf.getChannelData(0);
  const n = Math.floor(src.length / k), sr = Math.round(buf.sampleRate / k);
  const v = new DataView(new ArrayBuffer(44 + n * 2));
  const str = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  str(36, 'data'); v.setUint32(40, n * 2, true);
  for (let i = 0; i < n; i++) {
    let s = 0;
    for (let j = 0; j < k; j++) s += src[i * k + j];
    v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, s / k)) * 32767, true);
  }
  return new Uint8Array(v.buffer);
}
const toB64 = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); };
const fromB64 = b64 => Uint8Array.from(atob(b64), c => c.charCodeAt(0));
export async function voiceFile() {
  const clips = {}, times = {};
  for (const k of Object.keys(PHRASES)) {
    if (!recordedKeys.has(k)) continue;
    const buf = await loadClip(k);
    if (!buf) continue;
    clips[k] = toB64(wavBytes(buf));
    times[k] = ((await DB.get(k)) || {}).t || Date.now();
  }
  return { app: 'kalendarik', v: 1, type: 'audio/wav', clips, times };
}
export async function readVoiceFile(file) {
  const j = JSON.parse(await file.text());
  if (!j || j.app !== 'kalendarik' || !j.clips) throw new Error('not a voice file');
  const out = [];
  for (const [k, b] of Object.entries(j.clips)) {
    if (!(k in PHRASES)) continue;
    const data = fromB64(b).buffer;
    await decode(data.slice(0));
    out.push([k, { data, type: j.type || 'audio/wav', t: (j.times && j.times[k]) || Date.now(), src: 'file' }]);
  }
  return out;
}
// voice file served next to the app (laptop on home Wi-Fi): fills phrases this device has no
// mic recording for, and newer versions of the file replace clips taken from an older one
export async function loadBundledVoice() {
  try {
    const res = await fetch(VOICE_FILE, { cache: 'no-cache' });
    if (!res.ok) return;
    for (const [k, v] of await readVoiceFile(await res.blob())) {
      const cur = await DB.get(k);
      if (cur && (cur.src !== 'file' || cur.t >= v.t)) continue;
      await DB.put(k, v);
      recordedKeys.add(k);
      clipCache.delete(k);
    }
  } catch (e) {}
}
