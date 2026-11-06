import { $, $$, wait, rnd, shuffle } from '../util.js';
import { SEASONS, DAYS, MONTHS, FAMILY } from '../data.js';
import { S, save } from '../state.js';
import { sfx } from '../audio/sfx.js';
import { say, sayToken } from '../audio/speech.js';
import { pick, withDistractors } from '../learning.js';
import { faceHTML, factsOf } from '../family.js';
import { yearSVG } from '../draw/year.js';
import { carSVG, ghostCar, dayCar, dayCap, carOpt } from '../draw/car.js';
import { sceneOpt, picOpt, clearPics } from '../draw/scene.js';
import { monthOpt, famOpt, monthPicHTML } from '../draw/month.js';
import { go, anim } from '../ui/core.js';
import { SeasonsMenu, DaysMenu, MonthsMenu } from './menus.js';
import './months.css';

export const bubble = word => `<button class="bubble" data-act="repeat">🔊<span>Где <b>${word.toLowerCase()}</b>?</span></button>`;
const row7 = (days, gi, h) => `<div class="row7" style="--k:${days.length}">${days.map((d, i) => `<div class="r7${i === gi ? ' gh' : ''}" data-d="${DAYS.indexOf(d)}">${i === gi ? ghostCar() + dayCap(d, h, true) : dayCar(d, h) + dayCap(d, h)}</div>`).join('')}</div>`;
// once the answer is found every car on the stage shows its colour and number
const reveal = stage => $$('[data-d]', stage).forEach(c => {
  const d = DAYS[+c.dataset.d], cap = $('.cap', c);
  $('.carsvg', c).outerHTML = carSVG(d.color, d.n);
  if (cap) cap.classList.remove('hid');
});
function tmrStage(base, dir, h) {
  const cell = k => {
    const i = (base + k + 7) % 7;
    if (k === 0) return `<div class="tm"><span class="pin">📍</span><div data-d="${i}">${dayCar(DAYS[i], h)}${dayCap(DAYS[i], h)}</div></div>`;
    return k === dir ? `<div class="tm ask" data-d="${i}">${ghostCar()}</div>` : `<div class="tm faded">${ghostCar()}</div>`;
  };
  return `<div class="tmr"><div class="tmcells">${cell(-1)}${cell(0)}${cell(1)}</div><div class="tmlabels"><span>⬅ вчера</span><span>сегодня</span><span>завтра ➡</span></div></div>`;
}

// n months, each from a different season than t and than each other, so the cards look clearly different
const otherSeasons = (t, n) => shuffle([0, 1, 2, 3].filter(s => s !== t.s)).slice(0, n).map(s => { const ms = MONTHS.filter(m => m.s === s); return ms[rnd(ms.length)]; });
const ask = (ic, t) => `<button class="bubble" data-act="repeat">🔊<span>${ic} <b>${t}</b></span></button>`;
const monthBig = m => `<div class="mbig" style="--c:${m.color}"><div class="scene">${monthPicHTML(m)}</div><div class="dpill" style="--c:${m.color};--t:${m.ink}">${m.name}</div></div>`;

export const QUIZ = {
  'seasons-find': {
    max: 4, maxw: '300px', menu: () => go(SeasonsMenu), opt: sceneOpt,
    make(L, prev) { const t = pick('seasons-find', SEASONS, prev); return { answer: t, options: withDistractors(t, SEASONS, L), prompt: ['p_where', `w_${t.id}?`], stage: bubble(t.name) }; },
  },
  'seasons-odd': {
    max: 3, maxw: '340px', cls: 'grid4', menu: () => go(SeasonsMenu), opt: picOpt,
    // three pictures of one season and one of another; at level 2 the other one is the opposite season (winter and summer)
    make(L, prev) {
      const t = pick('seasons-odd', SEASONS, SEASONS.find(s => s.id === (prev && prev.id))), ti = SEASONS.indexOf(t);
      const main = SEASONS[L < 3 ? (ti + 2) % 4 : (ti + 1 + rnd(3)) % 4], tp = clearPics(t.id);
      const odd = { ...t, k: tp[rnd(tp.length)] }, rest = shuffle(clearPics(main.id)).slice(0, 3).map(k => ({ ...main, k }));
      return {
        answer: odd, options: shuffle([odd, ...rest]), prompt: ['p_odd'], after: ['p_rest', 'w_' + main.id],
        stage: '<button class="bubble" data-act="repeat">🔊<span>Что <b>лишнее</b>?</span></button>',
      };
    },
    // the other three stay bright and show their season's name: "Лето! А остальные — зима."
    onRight(q, stage, opts) { $$('.opt:not(.right)', opts).forEach(b => b.classList.add('rest')); $$('.lbl', opts).forEach(l => l.classList.add('on')); },
  },
  'days-find': {
    max: 4, maxw: '260px', hints: true, menu: () => go(DaysMenu), opt: carOpt,
    make(L, prev, h) {
      const t = pick('days-find', DAYS, prev);
      // grey cars: the whole week stands on the road, the day is found by its place
      return { answer: t, options: h > 2 ? DAYS : withDistractors(t, DAYS, L), look: h, prompt: ['p_where', `w_${t.id}?`], stage: bubble(t.name) };
    },
  },
  'days-missing': {
    fixed: 3, maxw: '240px', hints: true, menu: () => go(DaysMenu), opt: carOpt,
    make(L, prev, h) {
      const t = pick('days-missing', DAYS, prev), q = { answer: t, options: withDistractors(t, DAYS, 3), look: Math.min(h, 2) };
      if (h < 3) return { ...q, prompt: ['p_missing'], stage: row7(DAYS, DAYS.indexOf(t), h) };
      // grey cars starting from any day: the gap is found only by listening to the names
      const g = 1 + rnd(3), win = [0, 1, 2, 3, 4].map(i => DAYS[(DAYS.indexOf(t) - g + i + 7) % 7]);
      return { ...q, stage: row7(win, g, h), speak: stage => listenWeek(win, g, stage) };
    },
    onRight(q, stage) { $('.r7.gh', stage).className = 'r7 filled'; reveal(stage); },
  },
  'days-tomorrow': {
    fixed: 3, maxw: '240px', hints: true, menu: () => go(DaysMenu), opt: carOpt,
    make(L, prev, h) {
      // alternate: завтра, вчера, завтра, ...
      const dir = this.dir = this.dir === 1 ? -1 : 1;
      const t = pick('days-tomorrow', DAYS, prev), base = (DAYS.indexOf(t) - dir + 7) % 7;
      return {
        answer: t, options: shuffle([t, DAYS[base], DAYS[(base - dir + 7) % 7]]), look: Math.min(h, 2),
        prompt: ['p_today', 'w_' + DAYS[base].id, dir > 0 ? 'p_tomorrow' : 'p_yesterday'], stage: tmrStage(base, dir, h),
      };
    },
    onRight(q, stage) { $('.tm.ask', stage).className = 'tm filled'; reveal(stage); },
  },
  // «Поехали по году»: the car stands on a month, the next one hides behind "?"; a right card drives it on.
  // The car's place is kept (S.mpos), so round after round it goes all around the year.
  'months-drive': {
    fixed: 3, maxw: '250px', menu: () => go(MonthsMenu), opt: o => monthOpt(o),
    make() {
      const i = S.mpos || 0, base = MONTHS[i], t = MONTHS[(i + 1) % 12];
      return {
        answer: t, options: shuffle([t, ...otherSeasons(t, 2)]), prompt: ['w_' + base.id, 'p_mnext'], after: factsOf(t.n - 1),
        stage: `<div class="mstage"><div class="mring">${yearSVG({ sel: i, ask: t.n - 1, car: true, carDeg: i * 30 })}</div>${ask('🚗', 'А потом?')}</div>`,
      };
    },
    onRight(q, stage) {
      const i = S.mpos || 0, box = $('.mring', stage);
      S.mpos = (i + 1) % 12;
      save();
      sfx.vroom();
      box.innerHTML = yearSVG({ sel: S.mpos, car: true, carDeg: i * 30 });
      requestAnimationFrame(() => requestAnimationFrame(() => { $('.ringcar', box).style.transform = `rotate(${i * 30 + 30}deg)`; }));
    },
  },
  'months-bday': {
    fixed: 3, maxw: '250px', menu: () => go(MonthsMenu), opt: o => o.emoji ? famOpt(o) : monthOpt(o, false),
    // alternates «Чей день рождения в январе?» (pick the person) and «Когда день рождения у мамы?» (pick the month);
    // the four people come in shuffled turns, so every round has each of them
    make(L, prev) {
      if (!this.queue || !this.queue.length) {
        this.queue = shuffle(FAMILY);
        if (this.queue[0] === prev) this.queue.push(this.queue.shift()); // never the same person twice in a row
      }
      const f = this.queue.shift(), m = MONTHS[f.m];
      if ((this.who = !this.who)) return { answer: f, options: shuffle(FAMILY), prompt: ['q_whose_' + f.id], after: ['b_' + f.id], stage: '<div class="mstage">' + monthBig(m) + ask('🎂', 'Чей?') + '</div>' };
      return {
        answer: m, rec: f, options: shuffle([m, ...otherSeasons(m, 2)]), prompt: ['q_when_' + f.id], after: ['b_' + f.id],
        stage: '<div class="mstage"><div class="bigface">' + faceHTML(f, 'big') + '</div>' + ask('📅', 'Когда?') + '</div>',
      };
    },
  },
};
// reads the cars one by one, keeps silent on the empty one, then asks who is missing
async function listenWeek(win, g, stage) {
  const cells = $$('.r7', stage), keys = [...win.map(d => 'w_' + d.id), 'p_missing'];
  const read = from => say(keys.slice(from, from === 0 ? g : keys.length), { merge: false, gap: 250, onItem: i => anim(cells[from + i], 'bounce') });
  if (!await read(0)) return;
  const tok = sayToken;
  anim(cells[g], 'bounce');
  await wait(1000);
  if (tok === sayToken) read(g + 1);
}
export const level = mode => QUIZ[mode].fixed || S.levels[mode] || 2;
export function adjustLevel(mode, misses) {
  const M = QUIZ[mode];
  if (M.fixed) return;
  let L = level(mode), st = S.streaks[mode] || 0;
  if (misses === 0 && ++st >= 3 && L < M.max) { L++; st = 0; }
  if (misses >= 2) { L = Math.max(2, L - 1); st = 0; }
  S.levels[mode] = L; S.streaks[mode] = st;
}
