export function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16), f = v => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
  return '#' + [n >> 16, (n >> 8) & 255, n & 255].map(v => f(v).toString(16).padStart(2, '0')).join('');
}
const CAR_BODY = 'M8 50 L8 36 Q8 30 16 30 L36 30 Q44 14 58 13 L74 13 Q84 13 90 26 L108 30 Q116 32 116 40 L116 48 Q116 52 112 52 L12 52 Q8 52 8 50 Z';
const wheel = x => `<circle cx="${x}" cy="52" r="10" fill="#2B2F3A"/><circle cx="${x}" cy="52" r="4.5" fill="#D9DEE7"/>`;
export function carInner(color, n) {
  const dk = shade(color, -.28);
  return `<rect x="3" y="21" width="18" height="5" rx="2.5" fill="${dk}"/><rect x="10" y="24" width="4" height="8" fill="${dk}"/>`
    + `<path d="${CAR_BODY}" fill="${color}" stroke="${dk}" stroke-width="2" stroke-linejoin="round"/>`
    + `<path d="M46 28 Q52 18 60 17 L72 17 Q80 17 85 28 Z" fill="#D4F1FF" stroke="${dk}" stroke-width="1.5" stroke-linejoin="round"/>`
    + `<path d="M65 17 L65 28" stroke="${dk}" stroke-width="2"/>`
    + `<path d="M16 35 L34 35" stroke="#fff" stroke-opacity=".45" stroke-width="3" stroke-linecap="round"/>`
    + `<circle cx="62" cy="40" r="9.5" fill="#fff" stroke="${dk}" stroke-width="1.5"/>`
    + `<text x="62" y="40.5" text-anchor="middle" dominant-baseline="central" font-size="13" font-weight="900" fill="#1F2D44" font-family="ui-rounded,Nunito,system-ui,sans-serif">${n}</text>`
    + `<ellipse cx="112" cy="37" rx="3" ry="2.6" fill="#FFE45C"/>` + wheel(30) + wheel(94);
}
export const carSVG = (color, n) => `<svg class="carsvg" viewBox="0 -2 120 66">${carInner(color, n)}</svg>`;
export const ghostCar = () => `<svg class="carsvg" viewBox="0 -2 120 66"><path d="${CAR_BODY}" fill="rgba(255,255,255,.55)" stroke="#C3CDDC" stroke-width="2.5" stroke-dasharray="6 5"/>`
  + [30, 94].map(x => `<circle cx="${x}" cy="52" r="10" fill="rgba(255,255,255,.35)" stroke="#C3CDDC" stroke-width="2.5" stroke-dasharray="5 4"/>`).join('')
  + `<text x="62" y="38" text-anchor="middle" dominant-baseline="central" font-size="26" font-weight="900" fill="#fff" font-family="ui-rounded,Nunito,system-ui,sans-serif">?</text></svg>`;
// hint stages: 0 colour + number, 1 colour + name caption below, 2 colour only, 3 grey (only the spoken name tells which day it is)
export const dayCar = (d, h = 0) => h > 2 ? carSVG('#B4BFCF', '?') : carSVG(d.color, h ? '' : d.n);
export const dayCap = (d, h, hid) => h === 1 ? `<div class="cap${hid ? ' hid' : ''}" style="--c:${d.color}">${rootName(d)}</div>` : '';

export const rootName = d => d.root ? `<b>${d.name.slice(0, d.root)}</b>${d.name.slice(d.root)}` : d.name;
export const carOpt = (d, h) => `<div class="carbox">${dayCar(d, h)}</div><div class="lbl${h === 1 ? ' on' : ''}" style="--c:${d.color}">${rootName(d)}</div>`;
