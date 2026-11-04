import { $ } from '../util.js';
import { DAYS, todayIdx, seasonIdx } from '../data.js';
import { S } from '../state.js';
import { carSVG } from '../draw/car.js';
import { wheelSVG } from '../draw/wheel.js';
import { app, go, bind, holdToOpen } from '../ui/core.js';
import { SeasonsMenu, DaysMenu } from './menus.js';
import { Today } from './today.js';
import { Stickers } from './stickers.js';
import { Parent } from './parent.js';
import './home.css';

export function Home() {
  const d = DAYS[todayIdx()];
  app.innerHTML = `<div class="screen">
    <div class="home-head"><div class="pill">⭐ ${S.stars}</div><div class="logo">Календарик</div><button class="gear" aria-label="Для родителей">⚙️</button></div>
    <div class="home-grid">
      <button class="toy tile" data-act="seasons"><div class="art">${wheelSVG({ car: true, carDeg: seasonIdx() * 90 })}</div><div class="label">Времена года</div></button>
      <button class="toy tile t-days" data-act="days"><div class="art">${DAYS.map(x => `<div>${carSVG(x.color, x.n)}</div>`).join('')}</div><div class="label">Дни недели</div></button>
      <button class="toy tile t-today" data-act="today" style="--c:${d.color}"><div class="art"><div class="tcar">${carSVG(d.color, d.n)}</div><div class="dpill" style="--c:${d.color};--t:${d.ink}">${d.name}</div></div><div class="label">Сегодня</div></button>
      <button class="toy tile t-stickers" data-act="stickers"><div class="art"><span class="trophy">🏆</span><span class="cnt">${S.stickers}</span></div><div class="label">Наклейки</div></button>
    </div></div>`;
  bind({ seasons: () => go(SeasonsMenu), days: () => go(DaysMenu), today: () => go(Today), stickers: () => go(Stickers) });
  holdToOpen($('.gear'), () => go(Parent));
}
