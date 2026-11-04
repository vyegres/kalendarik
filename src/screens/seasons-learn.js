import { $, $$ } from '../util.js';
import { SEASONS, seasonIdx } from '../data.js';
import { sfx } from '../audio/sfx.js';
import { say } from '../audio/speech.js';
import { wheelSVG } from '../draw/wheel.js';
import { sceneSVG } from '../draw/scene.js';
import { app, go, bind, bar, btn, anim } from '../ui/core.js';
import { SeasonsMenu } from './menus.js';
import './seasons.css';

export function SeasonsLearn() {
  const now = seasonIdx();
  let sel = now, deg = now * 90;
  app.innerHTML = `<div class="screen">${bar({ title: 'Времена года', back: 'back', right: btn('next', '▶️') })}
    <div class="slearn"><div class="wheelbox">${wheelSVG({ sel, car: true, carDeg: deg, tappable: true })}</div><button class="toy scard" data-act="scene" data-quiet></button></div></div>`;
  const card = $('.scard', app);
  function show() {
    const se = SEASONS[sel];
    card.innerHTML = `${sel === now ? '<div class="badge">📍 сейчас</div>' : ''}<div class="scene">${sceneSVG(se.id)}</div><div class="dpill big" style="--c:${se.color};--t:${se.ink}">${se.name}</div>`;
    anim(card, 'pop');
    $$('.sector', app).forEach(p => p.classList.toggle('sel', +p.dataset.i === sel));
    $('.ringcar', app).style.transform = `rotate(${deg}deg)`;
    say('d_' + se.id);
  }
  function choose(i) {
    const steps = (i - sel + 4) % 4; // always drive clockwise
    if (steps) { deg += steps * 90; sfx.vroom(); }
    sel = i;
    show();
  }
  bind({
    back: () => go(SeasonsMenu),
    sector: el => choose(+el.dataset.i),
    next: () => choose((sel + 1) % 4),
    scene: () => { anim(card, 'bump'); say('d_' + SEASONS[sel].id); },
  });
  show();
}
