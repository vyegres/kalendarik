import { SEASONS } from '../data.js';
import { carInner } from './car.js';
import './wheel.css';

export function wheelSVG({ filled = [0, 1, 2, 3], next = -1, sel = -1, car = false, carDeg = 0, tappable = false } = {}) {
  const R = 82, pt = (a, r) => [(r * Math.sin(a)).toFixed(2), (-r * Math.cos(a)).toFixed(2)];
  let s = `<svg viewBox="-104 -104 208 208" class="wheel"><circle r="101" fill="#4A5468"/><circle r="92" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="7 7" opacity=".8"/>`;
  SEASONS.forEach((se, i) => {
    const a1 = (i * 90 - 45) * Math.PI / 180, a2 = (i * 90 + 45) * Math.PI / 180, on = filled.includes(i);
    const cls = 'sector' + (i === next ? ' next' : '') + (i === sel ? ' sel' : '');
    s += `<path class="${cls}" ${tappable ? `data-act="sector" data-quiet data-i="${i}"` : ''} d="M0 0 L${pt(a1, R).join(' ')} A${R} ${R} 0 0 1 ${pt(a2, R).join(' ')} Z" fill="${on ? se.color : '#E9EEF5'}" stroke="#fff" stroke-width="4" stroke-linejoin="round"/>`;
    const [x, y] = pt(i * Math.PI / 2, 47);
    if (on) s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="38">${se.emoji}</text>`;
    else if (i === next) s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="40" font-weight="900" fill="#9AA9BF">?</text>`;
  });
  s += `<circle r="15" fill="#fff"/>`;
  if (car) s += `<g class="ringcar" style="transform:rotate(${carDeg}deg)"><g transform="translate(-16 -103) scale(.27)">${carInner('#FF5A36', '★')}</g></g>`;
  return s + '</svg>';
}
