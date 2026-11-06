import { say } from '../audio/speech.js';
import { app, go, bind, bar } from '../ui/core.js';
import { Home } from './home.js';
import { SeasonsLearn } from './seasons-learn.js';
import { SeasonsOrder } from './seasons-order.js';
import { DaysLearn } from './days-learn.js';
import { DaysOrder } from './days-order.js';
import { MonthsLearn } from './months-learn.js';
import { MonthsSeason } from './months-season.js';
import { Quiz } from './quiz.js';
import './menus.css';

const modeTile = (act, ic, t, bg) => `<button class="toy mode" data-act="${act}" style="--bg:${bg}"><div class="ic">${ic}</div><div class="t">${t}</div></button>`;
export function SeasonsMenu() {
  app.innerHTML = `<div class="screen">${bar({ title: 'Времена года' })}<div class="modes">
    ${modeTile('learn', '👀', 'Смотреть', '#E6F6FF')}${modeTile('find', '🔍', 'Найди', '#FFF4D6')}${modeTile('order', '🔄', 'Собери круг', '#E5F8E1')}${modeTile('odd', '🧐', 'Что лишнее?', '#F6E8FF')}</div></div>`;
  bind({ back: () => go(Home), learn: () => go(SeasonsLearn), find: () => go(Quiz, 'seasons-find'), order: () => go(SeasonsOrder), odd: () => go(Quiz, 'seasons-odd') });
  say('t_seasons');
}
export function DaysMenu() {
  app.innerHTML = `<div class="screen">${bar({ title: 'Дни недели' })}<div class="modes">
    ${modeTile('learn', '👀', 'Смотреть', '#E6F6FF')}${modeTile('find', '🔍', 'Найди', '#FFF4D6')}${modeTile('order', '🏁', 'По порядку', '#E5F8E1')}
    ${modeTile('missing', '❓', 'Кто пропал?', '#F6E8FF')}${modeTile('tomorrow', '📅', 'Вчера и завтра', '#FFE6DF')}</div></div>`;
  bind({ back: () => go(Home), learn: () => go(DaysLearn), find: () => go(Quiz, 'days-find'), order: () => go(DaysOrder), missing: () => go(Quiz, 'days-missing'), tomorrow: () => go(Quiz, 'days-tomorrow') });
  say('t_days');
}
export function MonthsMenu() {
  app.innerHTML = `<div class="screen">${bar({ title: 'Месяцы' })}<div class="modes">
    ${modeTile('learn', '👀', 'Смотреть', '#E6F6FF')}${modeTile('drive', '🚗', 'Поехали по году', '#E5F8E1')}
    ${modeTile('season', '🧩', 'Собери время года', '#F6E8FF')}${modeTile('bday', '🎂', 'Чей день рождения?', '#FFE6DF')}</div></div>`;
  bind({
    back: () => go(Home), learn: () => go(MonthsLearn), drive: () => go(Quiz, 'months-drive'),
    season: () => go(MonthsSeason), bday: () => go(Quiz, 'months-bday'),
  });
  say('t_months');
}
