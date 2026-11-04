import { rnd } from '../util.js';
import { PICS } from '../data.js';

export function sceneSVG(id) {
  const sky = (a, b) => `<defs><linearGradient id="sky-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="200" height="130" fill="url(#sky-${id})"/>`;
  const em = (e, x, y, sz) => `<text x="${x}" y="${y}" font-size="${sz}" text-anchor="middle" dominant-baseline="central">${e}</text>`;
  const cloud = (x, y, c, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})" fill="${c}"><circle cx="0" cy="0" r="10"/><circle cx="12" cy="-5" r="12"/><circle cx="25" cy="0" r="9"/><rect x="0" y="0" width="25" height="9" rx="4"/></g>`;
  const rain = (x, y) => [0, 8, 16, 24].map((dx, i) => `<path d="M${x + dx} ${y + (i % 2) * 5} l-3 8" stroke="#4E9BE0" stroke-width="2.4" stroke-linecap="round"/>`).join('');
  const sun = (x, y, r) => `<g stroke="#FFC21A" stroke-width="3" stroke-linecap="round">${[...Array(8)].map((_, i) => { const a = i * Math.PI / 4; return `<line x1="${x + Math.cos(a) * (r + 4)}" y1="${y + Math.sin(a) * (r + 4)}" x2="${x + Math.cos(a) * (r + 10)}" y2="${y + Math.sin(a) * (r + 10)}"/>`; }).join('')}</g><circle cx="${x}" cy="${y}" r="${r}" fill="#FFD43B"/>`;
  const mountains = (c, snow) => `<path d="M-10 96 L42 44 L78 80 L118 34 L168 88 L212 62 L212 130 L-10 130 Z" fill="${c}"/>`
    + (snow ? `<path d="M118 34 L104 50 L111 47 L118 53 L124 46 L131 49 Z M42 44 L32 54 L38 52 L44 57 L48 51 L52 54 Z" fill="#fff"/>` : '');
  const hill = c => `<path d="M-5 102 Q55 84 115 98 T205 94 L205 135 L-5 135 Z" fill="${c}"/>`;
  const trunk = `<path d="M44 102 L45 70 L49 70 L50 102 Z" fill="#8B5A2B"/>`;
  const crown = (c, dots, dc) => trunk + `<g fill="${c}"><circle cx="47" cy="56" r="19"/><circle cx="33" cy="64" r="12"/><circle cx="61" cy="64" r="12"/><circle cx="47" cy="41" r="12"/></g>`
    + dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${dc}"/>`).join('');
  const DOTS = [[40, 50], [54, 46], [47, 60], [36, 66], [60, 62], [47, 38], [30, 60], [64, 56], [52, 70]];
  switch (id) {
    case 'winter': return `<svg viewBox="0 0 200 130">${sky('#93AAC4', '#E2EAF2')}${mountains('#7D90A8', true)}${cloud(140, 18, '#C9D3DF', 1.1)}${cloud(166, 28, '#B5C1CF')}${rain(144, 34)}${rain(170, 42)}${hill('#86BC7E')}${trunk}<path d="M47 74 L47 44 M47 60 L34 48 M47 54 L60 42 M34 48 L29 40 M60 42 L66 35 M47 64 L58 56 M47 48 L42 40" stroke="#8B5A2B" stroke-width="4" stroke-linecap="round" fill="none"/>${em('⛄', 108, 58, 20)}${em('🍊', 158, 110, 24)}${em('☂️', 90, 108, 24)}</svg>`;
    case 'spring': return `<svg viewBox="0 0 200 130">${sky('#79CCFF', '#E0F6FF')}${sun(166, 24, 11)}${mountains('#89B89A')}${hill('#6CC95A')}${crown('#8BDB6A', DOTS, '#FF8FC0')}${em('🌷', 90, 110, 22)}${em('🌼', 124, 114, 18)}${em('🌷', 160, 106, 22)}${em('🦋', 140, 58, 22)}${em('🐝', 98, 70, 16)}</svg>`;
    case 'summer': return `<svg viewBox="0 0 200 130">${sky('#36B4F4', '#BFEBFF')}${sun(162, 26, 15)}<rect x="0" y="76" width="200" height="40" fill="#1E96DC"/><path d="M10 88 q6 -4 12 0 t12 0 M70 96 q6 -4 12 0 t12 0 M120 86 q6 -4 12 0 t12 0" stroke="#8ED6FF" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-5 106 Q60 94 120 104 T205 100 L205 135 L-5 135 Z" fill="#F5D48A"/>${em('🌴', 38, 74, 52)}${em('⛱️', 112, 102, 28)}${em('🍉', 160, 116, 18)}${em('⛵', 166, 84, 16)}</svg>`;
    default: return `<svg viewBox="0 0 200 130">${sky('#FFB46E', '#FFEBD3')}${cloud(128, 20, '#fff')}${rain(132, 36)}${mountains('#B98962')}${hill('#D7A65A')}${crown('#F28C28', DOTS, '#E2502C')}${em('🍂', 84, 44, 18)}${em('🍁', 100, 76, 16)}${em('🍂', 18, 84, 16)}${em('🍇', 152, 110, 26)}${em('🍄', 120, 114, 18)}</svg>`;
  }
}

// Season pictures: k = 0 is the drawn scene above, 1.. are the photos from PICS.
const PHOTOS = import.meta.glob('../assets/seasons/*.webp', { eager: true, query: '?url', import: 'default' });
export const picCount = id => PICS[id].length + 1;
export const randomPic = id => rnd(picCount(id));
export const picHTML = (id, k) => k ? `<img src="${PHOTOS[`../assets/seasons/${id}-${PICS[id][k - 1][0]}.webp`]}" alt="" draggable="false">` : sceneSVG(id);
export const picSay = (id, k) => k ? ['w_' + id, `i_${id}_${PICS[id][k - 1][0]}`] : 'd_' + id;
export const sceneOpt = s => `<div class="scene">${picHTML(s.id, randomPic(s.id))}</div><div class="lbl">${s.name}</div>`;
