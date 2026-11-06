import { FAMILY } from '../data.js';
import { PHRASES, refreshFamily } from '../phrases.js';
import { S, save } from '../state.js';
import { photos, setPhoto } from '../family.js';
import { DB } from './db.js';
import { clipCache, recordedKeys, decode, loadClip } from './clips.js';

// voice backup file: every clip as mono 16-bit WAV (plays everywhere, unlike Chrome's webm),
// plus the family names and photos from parent mode
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
// MP3 and AAC (iPad recordings) play everywhere and stay small, so they are saved as they are;
// anything else (Chrome's webm) becomes WAV
const KEEP = /^audio\/(mpeg|mp4|aac|x-m4a)/;
export async function voiceFile() {
  const clips = {}, times = {}, types = {};
  for (const k of Object.keys(PHRASES)) {
    if (!recordedKeys.has(k)) continue;
    const rec = (await DB.get(k)) || {};
    if (rec.data && KEEP.test(rec.type || '')) { clips[k] = toB64(new Uint8Array(rec.data)); types[k] = rec.type; }
    else {
      const buf = await loadClip(k);
      if (!buf) continue;
      clips[k] = toB64(wavBytes(buf));
    }
    times[k] = rec.t || Date.now();
  }
  const pics = {};
  for (const f of FAMILY) { const r = await DB.get(f.id, 'photos'); if (r) pics[f.id] = toB64(new Uint8Array(r.data)); }
  return { app: 'kalendarik', v: 1, type: 'audio/wav', types, clips, times, family: S.family || {}, photos: pics };
}
export async function readVoiceFile(file) {
  const j = JSON.parse(await file.text());
  if (!j || j.app !== 'kalendarik' || !j.clips) throw new Error('not a voice file');
  const out = [];
  for (const [k, b] of Object.entries(j.clips)) {
    if (!(k in PHRASES)) continue;
    const data = fromB64(b).buffer;
    await decode(data.slice(0));
    out.push([k, { data, type: (j.types && j.types[k]) || j.type || 'audio/wav', t: (j.times && j.times[k]) || Date.now(), src: 'file' }]);
  }
  const pics = Object.entries(j.photos || {}).filter(([k]) => FAMILY.some(f => f.id === k)).map(([k, b]) => [k, { data: fromB64(b).buffer, type: 'image/jpeg' }]);
  return { clips: out, family: j.family && typeof j.family === 'object' ? j.family : null, photos: pics };
}
// names and photos from a file; `fill` only fills what this device doesn't have yet
export async function applyFamily({ family, photos: pics }, fill) {
  // a file without names (or an old voice-only one) never wipes the names typed on this device
  if (family && Object.keys(family).length && (!fill || !S.family || !Object.keys(S.family).length)) {
    S.family = Object.fromEntries(Object.entries(family).filter(([k]) => FAMILY.some(f => f.id === k)));
    save();
    refreshFamily();
  }
  for (const [k, rec] of pics) if (!fill || !photos.has(k)) await setPhoto(k, rec);
}
// voice file served next to the app (laptop on home Wi-Fi): fills phrases this device has no
// mic recording for, and newer versions of the file replace clips taken from an older one
export async function loadBundledVoice() {
  try {
    const res = await fetch(VOICE_FILE, { cache: 'no-cache' });
    if (!res.ok) return;
    const file = await readVoiceFile(await res.blob());
    for (const [k, v] of file.clips) {
      const cur = await DB.get(k);
      if (cur && (cur.src !== 'file' || cur.t >= v.t)) continue;
      await DB.put(k, v);
      recordedKeys.add(k);
      clipCache.delete(k);
    }
    await applyFamily(file, true);
  } catch (e) {}
}
