import { rnd } from './util.js';
import { SEASONS, DAYS, PICS, MODELS } from './data.js';

export const PHRASE_GROUPS = [
  ['Слова', [...SEASONS.map(s => ['w_' + s.id, s.name]), ...DAYS.map(d => ['w_' + d.id, d.name])]],
  ['Рассказы', [...SEASONS.map(s => ['d_' + s.id, s.desc]), ...DAYS.map(d => ['d_' + d.id, d.desc])]],
  ['Картинки', SEASONS.flatMap(s => PICS[s.id].map(([id, t]) => [`i_${s.id}_${id}`, t]))],
  ['Вопросы и подсказки', [
    ['p_where', 'Где'], ['p_next', 'Что дальше?'], ['p_missing', 'Какой день потерялся?'],
    ['p_today', 'Сегодня'], ['p_now', 'Сейчас'],
    ['p_tomorrow', 'А какой день будет завтра?'], ['p_yesterday', 'А какой день был вчера?'],
    ['p_kindergarten', 'Сегодня идём в садик.'], ['p_weekend', 'Сегодня выходной!'], ['p_football', 'Сегодня футбол!'],
    ['p_order_days', 'Поставь машинки по порядку!'], ['p_order_seasons', 'Собери круг года!'],
    ['p_odd', 'Какая картинка лишняя?'], ['p_rest', 'А остальные —'],
  ]],
  ['Меню', [['t_seasons', 'Времена года'], ['t_days', 'Дни недели'], ['t_garage', 'Мой гараж']]],
  ['Похвала', [
    ['r_good1', 'Молодец!'], ['r_good2', 'Правильно!'], ['r_good3', 'Ура!'], ['r_good4', 'Супер!'],
    ['r_try', 'Попробуй ещё!'], ['r_round', 'Ура! Все кирпичики собраны!'], ['r_sticker', 'Вот тебе новая наклейка!'],
    ['r_built', 'Смотри, что получилось!'],
  ]],
  ['Лего', MODELS.map(m => ['m_' + m.id, m.name])],
];
export const PHRASES = {};
PHRASE_GROUPS.forEach(([, list]) => list.forEach(([k, t]) => { PHRASES[k] = t; }));
export const CONNECT = new Set(['p_where', 'p_today', 'p_now', 'p_rest']); // TTS: glue to next word ("Где пятница?")
export const praise = () => 'r_good' + (1 + rnd(4));
