import { $, $$, wait, shuffle } from '../util.js';
import { DAYS } from '../data.js';
import { S } from '../state.js';
import { sfx } from '../audio/sfx.js';
import { say } from '../audio/speech.js';
import { carSVG, ghostCar, carOpt } from '../draw/car.js';
import { hintOf, adjustHints } from '../learning.js';
import { app, go, bind, bar, btn, anim } from '../ui/core.js';
import { celebrate } from '../ui/celebrate.js';
import { bubble } from './quiz-modes.js';
import { DaysMenu } from './menus.js';
import './days-order.css';

export function DaysOrder() {
  const h = hintOf('days-order');
  if (h > 2) return DaysPlace();
  let alive = true, pos = 0, misses = 0, wrong = 0, busy = false;
  app.innerHTML = `<div class="screen">${bar({ title: 'По порядку', back: 'back', right: btn('repeat', '🔊') })}
    <div class="ord">
      <div class="ord-road"><div class="fin">🏁</div><div class="slots">${DAYS.map((_, i) => `<div class="slot${i ? '' : ' next'}"></div>`).join('')}</div></div>
      <div class="snames">${DAYS.map(() => '<div class="sname"></div>').join('')}</div>
      <div class="pool">${shuffle(DAYS).map(d => `<button class="toy opt" data-act="car" data-quiet data-id="${d.id}">${carOpt(d, h)}</button>`).join('')}</div>
    </div></div>`;
  const slots = $$('.slot', app), names = $$('.sname', app);
  bind({
    back: () => go(DaysMenu),
    repeat: () => say(pos ? ['p_next'] : ['p_order_days']),
    car: async el => {
      if (busy) return;
      const d = DAYS.find(x => x.id === el.dataset.id);
      if (d.n - 1 !== pos) {
        misses++; wrong++;
        sfx.bad();
        anim(el, 'wiggle');
        say(['w_' + d.id, 'r_try']);
        if (misses >= 2) $(`.pool [data-id="${DAYS[pos].id}"]`, app).classList.add('hint');
        return;
      }
      sfx.vroom();
      el.classList.add('gone');
      slots[pos].className = 'slot full';
      slots[pos].innerHTML = carSVG(d.color, d.n);
      names[pos].textContent = d.name;
      pos++; misses = 0;
      if (pos < 7) { slots[pos].classList.add('next'); say('w_' + d.id); return; }
      busy = true;
      await say('w_' + d.id);
      if (!alive) return;
      await wait(300);
      await say(DAYS.map(x => 'w_' + x.id), { merge: false, gap: 200, onItem: i => anim(slots[i], 'bounce') });
      if (!alive) return;
      S.stars += 3;
      celebrate(() => go(DaysOrder), adjustHints('days-order', wrong));
    },
  });
  say('p_order_days');
  return () => { alive = false; };
}

// grey stage of «По порядку»: the days come in random order, the child finds each one's place on the road
function DaysPlace() {
  let alive = true, misses = 0, wrong = 0, busy = false;
  const queue = shuffle(DAYS);
  app.innerHTML = `<div class="screen">${bar({ title: 'По порядку', back: 'back', right: btn('repeat', '🔊') })}
    <div class="ord">
      <div class="ord-road"><div class="fin">🏁</div><div class="slots">${DAYS.map((_, i) => `<div class="slot" data-act="slot" data-quiet data-i="${i}">${ghostCar()}</div>`).join('')}</div></div>
      <div class="snames">${DAYS.map(() => '<div class="sname"></div>').join('')}</div>
      <div class="ordq"></div>
    </div></div>`;
  const slots = $$('.slot', app), names = $$('.sname', app), qbox = $('.ordq', app);
  const ask = () => say(['p_where', `w_${queue[0].id}?`]);
  function next() {
    misses = 0; busy = false;
    qbox.innerHTML = bubble(queue[0].name);
    anim(qbox, 'pop');
    ask();
  }
  bind({
    back: () => go(DaysMenu),
    repeat: () => { if (queue.length) ask(); },
    slot: async el => {
      if (busy || el.classList.contains('full')) return;
      const i = +el.dataset.i, d = queue[0];
      if (DAYS[i] !== d) {
        misses++; wrong++;
        sfx.bad();
        anim(el, 'wiggle');
        say(['w_' + DAYS[i].id, 'r_try']);
        if (misses >= 2) slots[d.n - 1].classList.add('hint');
        return;
      }
      busy = true;
      sfx.vroom();
      el.className = 'slot full';
      el.innerHTML = carSVG(d.color, d.n);
      names[i].textContent = d.name;
      queue.shift();
      await say('w_' + d.id);
      if (!alive) return;
      if (queue.length) { next(); return; }
      qbox.innerHTML = '';
      await wait(300);
      await say(DAYS.map(x => 'w_' + x.id), { merge: false, gap: 200, onItem: k => anim(slots[k], 'bounce') });
      if (!alive) return;
      S.stars += 3;
      celebrate(() => go(DaysOrder), adjustHints('days-order', wrong));
    },
  });
  next();
  return () => { alive = false; };
}
