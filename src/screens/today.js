import { $ } from '../util.js';
import { SEASONS, DAYS, MONTHS, todayIdx, seasonIdx, monthIdx } from '../data.js';
import { sfx } from '../audio/sfx.js';
import { say } from '../audio/speech.js';
import { carSVG } from '../draw/car.js';
import { picHTML, picSay, randomPic } from '../draw/scene.js';
import { marksHTML } from '../draw/month.js';
import { factsOf } from '../family.js';
import { app, go, bind, bar, btn, anim } from '../ui/core.js';
import { Home } from './home.js';
import './today.css';

export function Today() {
  const di = todayIdx(), d = DAYS[di], se = SEASONS[seasonIdx()], pic = randomPic(se.id), mi = monthIdx(), m = MONTHS[mi];
  const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  const tag = i => i === di ? 'сегодня' : i === (di + 6) % 7 ? 'вчера' : i === (di + 1) % 7 ? 'завтра' : '';
  app.innerHTML = `<div class="screen">${bar({ title: 'Сегодня', right: btn('repeat', '🔊') })}
    <div class="today">
      <button class="toy tmain" data-act="day" data-quiet style="--c:${d.color}">
        <div class="tlabel">Сегодня</div><div class="tcarbig">${carSVG(d.color, d.n)}</div>
        <div class="dpill big" style="--c:${d.color};--t:${d.ink}">${d.name}</div>
        <div class="tacts">${d.home ? '🏠 выходной' : '🎒 садик'}${d.ball ? ' · ⚽ футбол' : ''}</div>
      </button>
      <div class="tside">
        <button class="toy tseason" data-act="season" data-quiet><div class="scene">${picHTML(se.id, pic)}</div>
          <div class="tsname">Сейчас <span class="dpill" style="--c:${se.color};--t:${se.ink}">${se.name.toLowerCase()}</span></div></button>
        <button class="toy tdate" data-act="month" data-quiet style="--c:${m.color}"><span>📅 ${date}</span>${marksHTML(mi)}</button>
      </div>
    </div>
    <div class="strip">${DAYS.map((x, i) => `<button class="sd${i === di ? ' cur' : ''}" data-act="sd" data-quiet data-i="${i}"><span class="w">${tag(i)}</span>${carSVG(x.color, x.n)}</button>`).join('')}</div>
  </div>`;
  const intro = () => say(['p_today', 'w_' + d.id, d.home ? 'p_weekend' : 'p_kindergarten', ...(d.ball ? ['p_football'] : []), 'p_now', 'w_' + se.id, 'p_month', 'w_' + m.id, ...factsOf(mi)]);
  bind({
    back: () => go(Home),
    repeat: intro,
    day: el => { anim($('.tcarbig', el), 'bounce'); sfx.vroom(); intro(); },
    season: el => { anim(el, 'bump'); say(picSay(se.id, pic)); },
    month: el => { anim(el, 'bump'); say(['p_month', 'w_' + m.id, ...factsOf(mi)]); },
    sd: el => { anim(el, 'bounce'); say('w_' + DAYS[+el.dataset.i].id); },
  });
  intro();
}
