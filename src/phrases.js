import { rnd } from './util.js';
import { SEASONS, DAYS, MONTHS, FAMILY, HOLIDAYS, PICS, MODELS } from './data.js';
import { famNom, famGen } from './family.js';

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
// family phrases are built from the names set in parent mode, so they are rebuilt when a name changes
const family = () => [
  ...FAMILY.map(f => ['w_' + f.id, famNom(f)]),
  ...FAMILY.map(f => ['b_' + f.id, `${cap(MONTHS[f.m].at)} день рождения у ${famGen(f)}!`]),
  ...FAMILY.map(f => ['q_whose_' + f.id, `Чей день рождения ${MONTHS[f.m].at}?`]),
  ...FAMILY.map(f => ['q_when_' + f.id, `Когда день рождения у ${famGen(f)}?`]),
  ...HOLIDAYS.map(h => ['h_' + h.id, h.fact]),
];
export const PHRASE_GROUPS = [
  ['Слова', [...SEASONS.map(s => ['w_' + s.id, s.name]), ...DAYS.map(d => ['w_' + d.id, d.name])]],
  ['Месяцы', MONTHS.map(m => ['w_' + m.id, m.name])],
  ['Рассказы', [...SEASONS.map(s => ['d_' + s.id, s.desc]), ...DAYS.map(d => ['d_' + d.id, d.desc]), ...MONTHS.map(m => ['d_' + m.id, m.desc])]],
  ['Семья и праздники', family()],
  ['Картинки', SEASONS.flatMap(s => PICS[s.id].map(([id, t]) => [`i_${s.id}_${id}`, t]))],
  ['Вопросы и подсказки', [
    ['p_where', 'Где'], ['p_next', 'Что дальше?'], ['p_missing', 'Какой день потерялся?'],
    ['p_today', 'Сегодня'], ['p_now', 'Сейчас'], ['p_month', 'Месяц —'],
    ['p_tomorrow', 'А какой день будет завтра?'], ['p_yesterday', 'А какой день был вчера?'],
    ['p_kindergarten', 'Сегодня идём в садик.'], ['p_weekend', 'Сегодня выходной!'], ['p_football', 'Сегодня футбол!'],
    ['p_order_days', 'Поставь машинки по порядку!'], ['p_order_seasons', 'Собери круг года!'],
    ['p_odd', 'Какая картинка лишняя?'], ['p_rest', 'А остальные —'],
    ['p_mnext', 'А какой месяц потом?'], ['p_order_season', 'Поставь месяцы по порядку!'],
  ]],
  ['Меню', [['t_seasons', 'Времена года'], ['t_months', 'Месяцы'], ['t_days', 'Дни недели'], ['t_garage', 'Мой гараж']]],
  ['Похвала', [
    ['r_good1', 'Молодец!'], ['r_good2', 'Правильно!'], ['r_good3', 'Ура!'], ['r_good4', 'Супер!'],
    ['r_try', 'Попробуй ещё!'], ['r_round', 'Ура! Все кирпичики собраны!'], ['r_sticker', 'Вот тебе новая наклейка!'],
    ['r_built', 'Смотри, что получилось!'],
  ]],
  ['Лего', MODELS.map(m => ['m_' + m.id, m.name])],
];
export const PHRASES = {};
PHRASE_GROUPS.forEach(([, list]) => list.forEach(([k, t]) => { PHRASES[k] = t; }));
export function refreshFamily() {
  const list = family();
  PHRASE_GROUPS.find(([g]) => g === 'Семья и праздники')[1] = list;
  list.forEach(([k, t]) => { PHRASES[k] = t; });
}
export const CONNECT = new Set(['p_where', 'p_today', 'p_now', 'p_rest', 'p_month']); // TTS: glue to next word ("Где пятница?")
export const praise = () => 'r_good' + (1 + rnd(4));
