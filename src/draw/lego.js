import { MODELS } from '../data.js';
import { shade } from './car.js';
import './lego.css';

// Lego models are text pictures (data.js): one letter = one stud of a colour, a run of "o" = a wheel.
const COLORS = { R: '#E53935', O: '#FB8C00', Y: '#FDD835', G: '#43A047', B: '#1E88E5', D: '#3949AB', W: '#F4F7FB', K: '#3A3F4B', S: '#A7B0BF', T: '#A8DBFF' };
const U = 10, H = 12; // stud width and brick height, svg units

// long runs become 4-stud bricks; every other row starts with a 2 so the joints are staggered like real Lego
function split(n, odd) {
  const out = [];
  if (odd && n > 4) { out.push(2); n -= 2; }
  while (n > 4) { const k = n === 5 ? 3 : 4; out.push(k); n -= k; }
  out.push(n);
  return out;
}
// the bricks of a model in build order: bottom row first, left to right
const cache = {};
export function pieces(m) {
  if (cache[m.id]) return cache[m.id];
  const list = [], rows = m.art.length;
  for (let r = rows - 1; r >= 0; r--) {
    const line = m.art[r];
    for (let x = 0; x < line.length;) {
      const ch = line[x];
      let n = 1;
      while (line[x + n] === ch) n++;
      if (ch === 'o') list.push({ wheel: true, x, n, r });
      else if (ch !== ' ') split(n, (rows - 1 - r) % 2 === 1).reduce((cx, w) => { list.push({ x: cx, w, r, c: COLORS[ch] }); return cx + w; }, x);
      x += n;
    }
  }
  return (cache[m.id] = list);
}

// n bricks earned in total → which model is being built now and how many of its bricks are in place
export function legoAt(n) {
  let i = 0;
  while (n >= pieces(MODELS[i % MODELS.length]).length) { n -= pieces(MODELS[i % MODELS.length]).length; i++; }
  return { built: i, model: MODELS[i % MODELS.length], placed: n };
}
// how many times each model has been finished: [[model, times], ...] in build order
export function shelf(n) {
  const { built } = legoAt(n);
  return MODELS.map((m, i) => [m, Math.floor(built / MODELS.length) + (i < built % MODELS.length ? 1 : 0)]).filter(([, k]) => k);
}

function piece(p, rows, ghost) {
  const y = p.r * H;
  if (p.wheel) {
    const rad = p.n * U * .48, cx = (p.x + p.n / 2) * U, cy = rows * H + 3 - rad;
    return ghost ? `<circle cx="${cx}" cy="${cy}" r="${rad}" class="gh"/>`
      : `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="#2B2F3A"/><circle cx="${cx}" cy="${cy}" r="${rad * .45}" fill="#D9DEE7"/>`;
  }
  const x = p.x * U, w = p.w * U;
  if (ghost) return `<rect x="${x + .5}" y="${y + .5}" width="${w - 1}" height="${H - 1}" rx="1.5" class="gh"/>`;
  const st = p.c === COLORS.W ? '#B9C3D1' : shade(p.c, -.3), a = `fill="${p.c}" stroke="${st}" stroke-width="1"`;
  const studs = Array.from({ length: p.w }, (_, k) => `<rect x="${x + k * U + 2.5}" y="${y - 2.6}" width="5" height="3.2" rx=".8" ${a}/>`).join('');
  return `${studs}<rect x="${x + .5}" y="${y + .5}" width="${w - 1}" height="${H - 1}" rx="1.5" ${a}/><rect x="${x + 1.8}" y="${y + 1.8}" width="${w - 3.6}" height="1.8" rx=".9" fill="#fff" opacity=".3"/>`;
}
// placed bricks in colour, the rest as a dashed outline; bricks from `fresh` on drop in one by one
export function legoSVG(m, placed = Infinity, fresh = placed) {
  const ps = pieces(m), rows = m.art.length, cols = Math.max(...m.art.map(l => l.length));
  const ghosts = ps.slice(placed).map(p => piece(p, rows, true)).join('');
  const built = ps.slice(0, placed).map((p, i) => i < fresh ? piece(p, rows) : `<g class="fresh" style="animation-delay:${(.4 + (i - fresh) * DROP).toFixed(2)}s">${piece(p, rows)}</g>`).join('');
  return `<svg class="lego" viewBox="-3 -5 ${cols * U + 6} ${rows * H + 10}">${ghosts}${built}</svg>`;
}
export const DROP = .28; // seconds between two dropping bricks
// when each of n dropping bricks lands, ms from now (for the click sound)
export const landTimes = n => Array.from({ length: n }, (_, k) => (.4 + k * DROP) * 1000 + 320);
