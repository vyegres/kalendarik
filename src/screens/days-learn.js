import { $$ } from '../util.js';
import { DAYS, todayIdx } from '../data.js';
import { sfx } from '../audio/sfx.js';
import { say } from '../audio/speech.js';
import { carSVG, rootName } from '../draw/car.js';
import { app, go, bind, bar, btn, anim } from '../ui/core.js';
import { DaysMenu } from './menus.js';
import './days-learn.css';

export function DaysLearn() {
  const now = todayIdx();
  app.innerHTML = `<div class="screen">${bar({ title: 'Дни недели', back: 'back', right: btn('parade', '▶️') })}
    <div class="week"><div class="zone school"></div><div class="zone home"></div><div class="road"></div>
    ${DAYS.map((d, i) => `<div class="daycol" data-act="day" data-quiet data-i="${i}" style="--c:${d.color};--col:${i + 1}">
      <span class="dflag">${i === now ? '📍' : ''}</span><span class="dacts">${d.home ? '🏠' : '🎒'}${d.ball ? '⚽' : ''}</span>
      <span class="dcar">${carSVG(d.color, d.n)}</span><span class="dname">${rootName(d)}</span><span class="ddots">${'<i></i>'.repeat(d.n)}</span></div>`).join('')}
    <div class="zlabel school">🎒 садик</div><div class="zlabel home">🏠 выходные</div></div></div>`;
  const cars = $$('.dcar', app);
  bind({
    back: () => go(DaysMenu),
    day: el => { const i = +el.dataset.i; anim(cars[i], 'bounce'); sfx.vroom(); say('d_' + DAYS[i].id); },
    parade: () => say(DAYS.map(d => 'w_' + d.id), { merge: false, gap: 180, onItem: i => anim(cars[i], 'bounce') }),
  });
  say(['p_today', 'w_' + DAYS[now].id]);
}
