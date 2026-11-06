import { $, $$, wait, rnd, shuffle } from '../util.js';
import { SEASONS, MONTHS } from '../data.js';
import { S } from '../state.js';
import { sfx } from '../audio/sfx.js';
import { say } from '../audio/speech.js';
import { monthOpt } from '../draw/month.js';
import { app, go, bind, bar, btn, anim } from '../ui/core.js';
import { celebrate } from '../ui/celebrate.js';
import { MonthsMenu } from './menus.js';
import './months.css';

let last = -1;
// the three months of one season, shuffled; tap them in order into the slots (winter: December, January, February)
export function MonthsSeason() {
  let alive = true, pos = 0, misses = 0, busy = false;
  const si = last = last < 0 ? rnd(4) : (last + 1 + rnd(3)) % 4, se = SEASONS[si]; // a different season every round
  const run = [0, 1, 2].map(k => MONTHS[(si * 3 + 11 + k) % 12]);
  app.innerHTML = `<div class="screen">${bar({ title: 'Собери время года', back: 'back', right: btn('repeat', '🔊') })}
    <div class="mseas">
      <div class="mseas-head"><span class="dpill" style="--c:${se.color};--t:${se.ink}">${se.emoji} ${se.name}</span></div>
      <div class="mslots">${run.map((_, k) => `${k ? '<span class="marrow">➡</span>' : ''}<div class="mslot${k ? '' : ' next'}">?</div>`).join('')}</div>
      <div class="mspool">${shuffle(run).map(m => `<button class="toy opt" data-act="pick" data-quiet data-id="${m.id}">${monthOpt(m)}</button>`).join('')}</div>
    </div></div>`;
  const slots = $$('.mslot', app), head = $('.mseas-head', app);
  bind({
    back: () => go(MonthsMenu),
    repeat: () => say(['w_' + se.id, 'p_order_season']),
    pick: async el => {
      if (busy) return;
      const m = MONTHS.find(x => x.id === el.dataset.id);
      if (m !== run[pos]) {
        misses++;
        sfx.bad();
        anim(el, 'wiggle');
        say(['w_' + m.id, 'r_try']);
        if (misses >= 2) $(`.mspool [data-id="${run[pos].id}"]`, app).classList.add('hint');
        return;
      }
      sfx.vroom();
      el.classList.add('gone');
      slots[pos].className = 'mslot full';
      slots[pos].innerHTML = monthOpt(m);
      pos++; misses = 0;
      if (pos < 3) { slots[pos].classList.add('next'); say('w_' + m.id); return; }
      busy = true;
      await say('w_' + m.id);
      if (!alive) return;
      await wait(300);
      // all three once more, then the season: "Декабрь, январь, февраль — зима!"
      await say([...run.map(x => 'w_' + x.id), 'w_' + se.id], { merge: false, gap: 180, onItem: k => anim(slots[k] || head, 'bounce') });
      if (!alive) return;
      await wait(300);
      S.stars += 3;
      celebrate(() => go(MonthsSeason));
    },
  });
  say(['w_' + se.id, 'p_order_season']);
  return () => { alive = false; };
}
