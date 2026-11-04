import { $, wait, rnd, shuffle } from '../util.js';
import { SEASONS } from '../data.js';
import { S } from '../state.js';
import { sfx } from '../audio/sfx.js';
import { say } from '../audio/speech.js';
import { wheelSVG } from '../draw/wheel.js';
import { sceneSVG } from '../draw/scene.js';
import { app, go, bind, bar, btn, anim } from '../ui/core.js';
import { celebrate } from '../ui/celebrate.js';
import { SeasonsMenu } from './menus.js';
import './seasons.css';

export function SeasonsOrder() {
  let alive = true, misses = 0, busy = false;
  const start = rnd(4), filled = [start];
  let pos = (start + 1) % 4, deg = start * 90;
  app.innerHTML = `<div class="screen">${bar({ title: 'Собери круг', back: 'back', right: btn('repeat', '🔊') })}
    <div class="sord"><div class="wheelbox"></div><div class="spool">${shuffle(SEASONS.filter((_, i) => i !== start)).map(s => `<button class="toy opt" data-act="pick" data-quiet data-i="${SEASONS.indexOf(s)}"><div class="scene">${sceneSVG(s.id)}</div></button>`).join('')}</div></div></div>`;
  const box = $('.wheelbox', app);
  function draw(to, sel = -1) {
    const from = deg;
    deg = to;
    box.innerHTML = wheelSVG({ filled, next: filled.length < 4 ? pos : -1, sel, car: true, carDeg: from });
    if (to !== from) requestAnimationFrame(() => requestAnimationFrame(() => { $('.ringcar', box).style.transform = `rotate(${to}deg)`; }));
  }
  draw(deg);
  bind({
    back: () => go(SeasonsMenu),
    repeat: () => say(['w_' + SEASONS[(pos + 3) % 4].id, 'p_next']),
    pick: async el => {
      if (busy) return;
      const i = +el.dataset.i;
      if (i !== pos) {
        misses++;
        sfx.bad();
        anim(el, 'wiggle');
        say(['w_' + SEASONS[i].id, 'r_try']);
        if (misses >= 2) $(`.spool [data-i="${pos}"]`, app).classList.add('hint');
        return;
      }
      sfx.vroom();
      el.classList.add('gone');
      filled.push(i);
      misses = 0;
      pos = (pos + 1) % 4;
      draw(deg + 90);
      if (filled.length < 4) { say('w_' + SEASONS[i].id); return; }
      busy = true;
      await say('w_' + SEASONS[i].id);
      // victory lap: the car drives the whole year once more
      for (let k = 0; k < 4 && alive; k++) {
        await wait(250);
        const idx = (deg / 90 + 1) % 4;
        draw(deg + 90, idx);
        await say('w_' + SEASONS[idx].id);
      }
      if (!alive) return;
      await wait(400);
      S.stars += 3;
      celebrate(() => go(SeasonsOrder));
    },
  });
  say(['p_order_seasons', 'w_' + SEASONS[start].id, 'p_next']);
  return () => { alive = false; };
}
