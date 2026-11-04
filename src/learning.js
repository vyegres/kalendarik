import { shuffle } from './util.js';
import { S } from './state.js';

export function pick(mode, items, avoid) {
  const pool = items.filter(i => i !== avoid);
  const w = pool.map(i => { const s = S.stats[mode + ':' + i.id] || [0, 0]; return (s[1] + 1) / (s[0] + 1) + .3; });
  let r = Math.random() * w.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) return pool[i]; }
  return pool[pool.length - 1];
}
export const withDistractors = (t, items, n) => shuffle([t, ...shuffle(items.filter(i => i !== t)).slice(0, n - 1)]);
export const record = (mode, item, ok) => { const s = S.stats[mode + ':' + item.id] || (S.stats[mode + ':' + item.id] = [0, 0]); s[ok ? 0 : 1]++; };

// day games: a round with at most one mistake takes the next hint away, a hard round gives one back
export const hintOf = mode => S.hints[mode] || 0;
export function adjustHints(mode, wrong) {
  const h = hintOf(mode), nh = wrong <= 1 ? Math.min(3, h + 1) : wrong >= 5 ? Math.max(0, h - 1) : h;
  S.hints[mode] = nh;
  return nh > h ? nh : 0;
}
