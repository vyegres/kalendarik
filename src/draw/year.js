import { SEASONS, MONTHS } from '../data.js';
import { birthdaysIn, photos } from '../family.js';
import { carInner } from './car.js';
import './wheel.css';

// The year wheel: 12 months around (January on top, so each season's three months sit around its sector),
// the four seasons inside, and the car driving on the road outside. A month is at mi * 30 degrees.
let uid = 0;
// ask = a month hidden behind "?" (the one to guess in «Поехали по году»)
export function yearSVG({ sel = -1, ask = -1, car = false, carDeg = 0, tappable = false } = {}) {
  const R1 = 50, R2 = 86, pt = (deg, r) => { const a = deg * Math.PI / 180; return [(r * Math.sin(a)).toFixed(2), (-r * Math.cos(a)).toFixed(2)]; };
  const id = 'y' + (++uid);
  let s = `<svg viewBox="-104 -104 208 208" class="wheel year"><circle r="101" fill="#4A5468"/><circle r="94" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="7 7" opacity=".8"/><circle r="47" fill="#fff"/>`;
  SEASONS.forEach((se, i) => {
    const [x1, y1] = pt(i * 90 - 45, 46), [x2, y2] = pt(i * 90 + 45, 46), [ex, ey] = pt(i * 90, 28);
    s += `<path d="M0 0 L${x1} ${y1} A46 46 0 0 1 ${x2} ${y2} Z" fill="${se.color}" opacity=".45" stroke="#fff" stroke-width="2"/>`
      + `<text x="${ex}" y="${ey}" text-anchor="middle" dominant-baseline="central" font-size="19">${se.emoji}</text>`;
  });
  MONTHS.forEach((m, i) => {
    const [ax, ay] = pt(i * 30 - 15, R2), [bx, by] = pt(i * 30 + 15, R2), [cx, cy] = pt(i * 30 + 15, R1), [dx, dy] = pt(i * 30 - 15, R1);
    const [nx, ny] = pt(i * 30, 75), [fx, fy] = pt(i * 30, 59.5);
    const hid = i === ask;
    s += `<path class="sector msec${i === sel ? ' sel' : ''}${hid ? ' next' : ''}" ${tappable ? `data-act="msec" data-quiet data-i="${i}"` : ''} d="M${ax} ${ay} A${R2} ${R2} 0 0 1 ${bx} ${by} L${cx} ${cy} A${R1} ${R1} 0 0 0 ${dx} ${dy} Z" fill="${hid ? '#E9EEF5' : m.color}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/>`;
    const [qx, qy] = pt(i * 30, 68);
    if (hid) { s += `<text x="${qx}" y="${qy}" text-anchor="middle" dominant-baseline="central" font-size="24" font-weight="900" fill="#9AA9BF">?</text>`; return; }
    s += `<text x="${nx}" y="${ny}" text-anchor="middle" dominant-baseline="central" font-size="15" font-weight="900" fill="${m.ink}">${m.n}</text>`;
    // whose birthday it is: photo, or emoji until a photo is set
    birthdaysIn(i).forEach(f => {
      s += `<circle cx="${fx}" cy="${fy}" r="9.5" fill="#FFF1C2" stroke="#fff" stroke-width="2"/>`;
      s += photos.has(f.id)
        ? `<clipPath id="${id}-${f.id}"><circle cx="${fx}" cy="${fy}" r="8.5"/></clipPath><image href="${photos.get(f.id)}" x="${fx - 8.5}" y="${fy - 8.5}" width="17" height="17" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}-${f.id})"/>`
        : `<text x="${fx}" y="${fy}" text-anchor="middle" dominant-baseline="central" font-size="12">${f.emoji}</text>`;
    });
  });
  s += `<circle r="9" fill="#fff"/>`;
  if (car) s += `<g class="ringcar" style="transform:rotate(${carDeg}deg)"><g transform="translate(-16 -103) scale(.27)">${carInner('#FF5A36', '★')}</g></g>`;
  return s + '</svg>';
}
