import { $, $$ } from '../util.js';
import { SEASONS, seasonIdx } from '../data.js';
import { sfx } from '../audio/sfx.js';
import { say } from '../audio/speech.js';
import { wheelSVG } from '../draw/wheel.js';
import { picCount, picHTML, picSay } from '../draw/scene.js';
import { app, go, bind, bar, btn, anim } from '../ui/core.js';
import { SeasonsMenu } from './menus.js';
import './seasons.css';

export function SeasonsLearn() {
  const now = seasonIdx();
  let sel = now, deg = now * 90, pic = 0;
  app.innerHTML = `<div class="screen">${bar({ title: 'Времена года', back: 'back', right: btn('next', '▶️') })}
    <div class="slearn"><div class="wheelbox">${wheelSVG({ sel, car: true, carDeg: deg, tappable: true })}</div><button class="toy scard" data-act="scene" data-quiet></button></div></div>`;
  const card = $('.scard', app);
  // the drawn scene first, then every tap on the card shows the next photo of the same season
  function show() {
    const se = SEASONS[sel], dots = [...Array(picCount(se.id))].map((_, k) => `<i${k === pic ? ' class="on"' : ''}></i>`).join('');
    card.innerHTML = `${sel === now ? '<div class="badge">📍 сейчас</div>' : ''}<div class="scene">${picHTML(se.id, pic)}</div><div class="dots" style="--c:${se.color}">${dots}</div><div class="dpill big" style="--c:${se.color};--t:${se.ink}">${se.name}</div>`;
    anim(card, 'pop');
    say(picSay(se.id, pic));
  }
  function choose(i) {
    const steps = (i - sel + 4) % 4; // always drive clockwise
    if (steps) { deg += steps * 90; sfx.vroom(); }
    sel = i; pic = 0;
    $$('.sector', app).forEach(p => p.classList.toggle('sel', +p.dataset.i === sel));
    $('.ringcar', app).style.transform = `rotate(${deg}deg)`;
    show();
  }
  bind({
    back: () => go(SeasonsMenu),
    sector: el => choose(+el.dataset.i),
    next: () => choose((sel + 1) % 4),
    scene: () => { pic = (pic + 1) % picCount(SEASONS[sel].id); show(); },
  });
  choose(sel);
}
