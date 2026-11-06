import { SEASONS, PICS } from '../data.js';
import { birthdaysIn, holidaysIn, faceHTML, famNom } from '../family.js';
import { picHTML } from './scene.js';
import './month.css';

// the month's own photo, always the same one
export const monthPicHTML = m => picHTML(SEASONS[m.s].id, 1 + PICS[SEASONS[m.s].id].findIndex(([id]) => id === m.pic));
export const monthPicSay = m => `i_${SEASONS[m.s].id}_${m.pic}`;
// faces of whoever has a birthday in that month, and its holiday
export const marksHTML = (mi, cls = '') => birthdaysIn(mi).map(f => faceHTML(f, cls)).join('') + holidaysIn(mi).map(h => `<span class="face hol ${cls}">${h.icon}</span>`).join('');
// a month as an answer card: its photo, number and name (and the birthday faces unless they would give the answer away)
export const monthOpt = (m, marks = true) => `<div class="mcard" style="--c:${m.color};--t:${m.ink}"><div class="scene">${monthPicHTML(m)}</div><span class="mnum">${m.n}</span>`
  + `${marks ? `<span class="mmarks">${marksHTML(m.n - 1)}</span>` : ''}</div><div class="lbl on">${m.name}</div>`;
export const famOpt = f => `<div class="fcard">${faceHTML(f, 'big')}</div><div class="lbl on">${famNom(f)}</div>`;
