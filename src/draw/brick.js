import { shade } from './car.js';

export function brickSVG(color) {
  const f = color || 'rgba(255,255,255,.5)', st = color ? shade(color, -.28) : 'rgba(255,255,255,.95)';
  const r = (x, y, w, h, rx) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" stroke="${st}" stroke-width="2"/>`;
  return `<svg viewBox="0 0 48 34" class="brick${color ? ' on' : ''}">${r(8, 2, 11, 8, 2)}${r(29, 2, 11, 8, 2)}${r(2, 8, 44, 24, 4)}</svg>`;
}
