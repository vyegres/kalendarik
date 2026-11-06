import { FAMILY, HOLIDAYS } from './data.js';
import { S, save } from './state.js';
import { DB } from './audio/db.js';

// Family names and photos are set in parent mode and kept on the device only (S.family, IndexedDB «photos»).
const own = f => (S.family && S.family[f.id]) || {};
export const famNom = f => own(f).nom || f.nom;
export const famGen = f => own(f).gen || (own(f).nom ? genOf(own(f).nom) : f.gen);
// "у кого?" for a name: Маша → Маши, Ольга → Ольги, Катя → Кати, Иван → Ивана (the parent can correct it)
export function genOf(name) {
  const n = name.trim(), last = n.slice(-1).toLowerCase(), stem = n.slice(0, -1);
  if (last === 'а') return stem + (/[гкхжшщч]$/i.test(stem) ? 'и' : 'ы');
  if (last === 'я' || last === 'ь') return stem + (last === 'я' ? 'и' : 'я');
  if (last === 'й') return stem + 'я';
  if (/[бвгдзклмнпрстфхжшщч]/.test(last)) return n + 'а';
  return n;
}
export function setNames(id, nom, gen) {
  const clean = v => (v || '').replace(/[<>&"]/g, '').trim();
  nom = clean(nom); gen = clean(gen);
  S.family = S.family || {};
  if (!nom && !gen) delete S.family[id]; else S.family[id] = { nom, gen };
  save();
}

export const birthdaysIn = mi => FAMILY.filter(f => f.m === mi);
export const holidaysIn = mi => HOLIDAYS.filter(h => h.m === mi);
// what the voice adds about a month: "В январе день рождения у мамы!", "В декабре ... Новый год!"
export const factsOf = mi => [...birthdaysIn(mi).map(f => 'b_' + f.id), ...holidaysIn(mi).map(h => 'h_' + h.id)];

// photos: stored as { data: ArrayBuffer, type } (Blobs in IndexedDB are unreliable on older iPads)
export const photos = new Map();
const show = (id, rec) => {
  if (photos.has(id)) URL.revokeObjectURL(photos.get(id));
  if (rec) photos.set(id, URL.createObjectURL(new Blob([rec.data], { type: rec.type }))); else photos.delete(id);
};
export async function loadPhotos() {
  for (const f of FAMILY) { try { show(f.id, await DB.get(f.id, 'photos')); } catch (e) {} }
}
export async function setPhoto(id, rec) {
  if (rec) await DB.put(id, rec, 'photos'); else await DB.del(id, 'photos');
  show(id, rec);
}
// a picked or camera photo → a 360×360 JPEG cut from the middle (the biggest face on screen is ~280 points)
export async function squarePhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
    const side = Math.min(img.naturalWidth, img.naturalHeight), out = 360, c = document.createElement('canvas');
    c.width = c.height = out;
    c.getContext('2d').drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, out, out);
    const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', .85));
    return { data: await blob.arrayBuffer(), type: 'image/jpeg' };
  } finally { URL.revokeObjectURL(url); }
}
export const faceHTML = (f, cls = '') => photos.has(f.id)
  ? `<span class="face ${cls}"><img src="${photos.get(f.id)}" alt="" draggable="false"></span>`
  : `<span class="face emo ${cls}">${f.emoji}</span>`;
