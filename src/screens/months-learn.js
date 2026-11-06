import { $, $$ } from '../util.js';
import { MONTHS, monthIdx } from '../data.js';
import { sfx } from '../audio/sfx.js';
import { say } from '../audio/speech.js';
import { birthdaysIn, holidaysIn, factsOf, faceHTML, famNom } from '../family.js';
import { yearSVG } from '../draw/year.js';
import { monthPicHTML } from '../draw/month.js';
import { app, go, bind, bar, btn, anim } from '../ui/core.js';
import { MonthsMenu } from './menus.js';
import './seasons.css';
import './months.css';

export function MonthsLearn() {
  const now = monthIdx();
  let sel = now, deg = now * 30;
  app.innerHTML = `<div class="screen">${bar({ title: 'Месяцы', back: 'back', right: btn('parade', '▶️') })}
    <div class="slearn"><div class="wheelbox">${yearSVG({ sel, car: true, carDeg: deg, tappable: true })}</div><button class="toy scard mlcard" data-act="story" data-quiet></button></div></div>`;
  const card = $('.scard', app), secs = $$('.msec', app), car = $('.ringcar', app);
  const story = () => say(['d_' + MONTHS[sel].id, ...factsOf(sel)]);
  // the car always drives clockwise to the month, which pops out, and the card shows the month's photo
  function moveTo(i) {
    const steps = (i - sel + 12) % 12;
    deg += steps * 30;
    sel = i;
    secs.forEach((p, k) => p.classList.toggle('sel', k === sel));
    car.style.transform = `rotate(${deg}deg)`;
    const m = MONTHS[sel], st = `--c:${m.color};--t:${m.ink}`;
    const facts = [
      ...birthdaysIn(sel).map(f => `<span class="mfact" data-act="fact" data-quiet data-k="b_${f.id}">${faceHTML(f)}<span>🎂 ${famNom(f)}</span></span>`),
      ...holidaysIn(sel).map(h => `<span class="mfact" data-act="fact" data-quiet data-k="h_${h.id}"><span class="face hol">${h.icon}</span></span>`),
    ].join('');
    card.innerHTML = `${sel === now ? '<div class="badge">📍 сейчас</div>' : ''}<div class="scene">${monthPicHTML(m)}</div>
      <div class="mlrow"><span class="mlnum" style="${st}">${m.n}</span><span class="dpill" style="${st}">${m.name}</span></div>
      ${facts ? `<div class="mfacts">${facts}</div>` : ''}`;
    anim(card, 'pop');
    return steps;
  }
  bind({
    back: () => go(MonthsMenu),
    msec: el => { if (moveTo(+el.dataset.i)) sfx.vroom(); story(); },
    story: () => { anim(card, 'bump'); story(); },
    fact: el => { anim(el, 'bounce'); say(el.dataset.k); },
    // the whole year from January, like a counting rhyme: each name with its photo
    parade: () => { sfx.vroom(); say(MONTHS.map(m => 'w_' + m.id), { merge: false, gap: 150, onItem: moveTo }); },
  });
  moveTo(sel);
  story();
}
