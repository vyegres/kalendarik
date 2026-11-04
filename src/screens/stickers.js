import { STICKERS } from '../data.js';
import { S } from '../state.js';
import { sfx } from '../audio/sfx.js';
import { say } from '../audio/speech.js';
import { app, go, bind, bar, anim } from '../ui/core.js';
import { Home } from './home.js';
import './stickers.css';

export function Stickers() {
  app.innerHTML = `<div class="screen">${bar({ title: 'Мои наклейки', right: `<div class="pill">⭐ ${S.stars}</div>` })}
    <div class="stk-scroll"><div class="stk-grid">${STICKERS.map((e, i) => i < S.stickers ? `<button class="toy stk" data-act="stk" data-quiet>${e}</button>` : '<div class="stk locked">?</div>').join('')}</div></div></div>`;
  bind({ back: () => go(Home), stk: el => { sfx.star(); anim(el, 'bounce'); } });
  say('t_stickers');
}
