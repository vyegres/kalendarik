import { $ } from '../util.js';
import { sfx } from '../audio/sfx.js';
import { hush } from '../audio/speech.js';

export const app = $('#app');
let cleanup = null;
export function go(screen, ...args) {
  hush();
  if (cleanup) { try { cleanup(); } catch (e) {} cleanup = null; }
  app.onclick = null;
  app.innerHTML = '';
  cleanup = screen(...args) || null;
}
export function bind(map) {
  app.onclick = e => {
    const el = e.target.closest('[data-act]');
    if (!el || !app.contains(el)) return;
    const f = map[el.dataset.act];
    if (!f) return;
    if (!el.hasAttribute('data-quiet')) sfx.tap();
    f(el, e);
  };
}
export function bar({ title = '', back = 'home', right = '' } = {}) {
  return `<div class="bar"><button class="toy round" data-act="back">${back === 'home' ? '🏠' : '⬅️'}</button><div class="title">${title}</div>${right || '<div class="round ghost"></div>'}</div>`;
}
export const btn = (act, ic) => `<button class="toy round" data-act="${act}">${ic}</button>`;
export function anim(el, cls) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  el.addEventListener('animationend', () => el.classList.remove(cls), { once: true });
}
export function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2400);
}
export function holdToOpen(el, fn, ms = 1500) {
  let t = null;
  const end = () => { clearTimeout(t); el.classList.remove('holding'); };
  el.addEventListener('pointerdown', e => { e.preventDefault(); el.classList.add('holding'); t = setTimeout(() => { end(); fn(); }, ms); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => el.addEventListener(ev, end));
}
