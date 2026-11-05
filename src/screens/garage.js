import { $ } from '../util.js';
import { STICKERS } from '../data.js';
import { S, save } from '../state.js';
import { sfx } from '../audio/sfx.js';
import { say } from '../audio/speech.js';
import { legoAt, legoSVG, shelf, landTimes } from '../draw/lego.js';
import { app, go, bind, bar, anim } from '../ui/core.js';
import { Home } from './home.js';
import './garage.css';

// the Lego model being built, the finished ones, and the stickers
export function Garage() {
  const now = legoAt(S.stars), seen = legoAt(S.bricksSeen);
  // bricks earned in a round that was left early haven't been seen yet: they drop in here
  const fresh = seen.built === now.built ? Math.max(seen.placed, now.placed - 10) : now.placed;
  S.bricksSeen = S.stars;
  save();
  const done = shelf(S.stars);
  app.innerHTML = `<div class="screen">${bar({ title: 'Мой гараж' })}
    <div class="stk-scroll">
      <div class="gar">
        <button class="toy gar-now" data-act="model" data-quiet data-id="${now.model.id}">${legoSVG(now.model, now.placed, fresh)}</button>
        ${done.length ? `<div class="gar-shelf">${done.map(([m, k]) => `<button class="toy gar-m" data-act="model" data-quiet data-id="${m.id}">${legoSVG(m)}${k > 1 ? `<span class="gar-k">×${k}</span>` : ''}</button>`).join('')}</div>` : ''}
      </div>
      <div class="stk-grid">${STICKERS.map((e, i) => i < S.stickers ? `<button class="toy stk" data-act="stk" data-quiet>${e}</button>` : '<div class="stk locked">?</div>').join('')}</div>
    </div></div>`;
  const gar = $('.gar', app);
  landTimes(now.placed - fresh).forEach(t => setTimeout(() => { if (gar.isConnected) sfx.snap(); }, t));
  bind({
    back: () => go(Home),
    stk: el => { sfx.star(); anim(el, 'bounce'); },
    model: el => { anim(el, 'bounce'); sfx.vroom(); say('m_' + el.dataset.id); },
  });
  say('t_garage');
}
