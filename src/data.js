export const SEASONS = [
  { id: 'winter', name: 'Зима',  color: '#3D8FE0', ink: '#fff',    emoji: '❄️', desc: 'Зима. Идут дожди, а в горах лежит снег. Созрели мандарины.' },
  { id: 'spring', name: 'Весна', color: '#43B649', ink: '#fff',    emoji: '🌸', desc: 'Весна. Всё цветёт! Зелёная трава, цветы и бабочки.' },
  { id: 'summer', name: 'Лето',  color: '#FFB300', ink: '#1F2D44', emoji: '☀️', desc: 'Лето. Жарко! Купаемся в море и едим арбуз.' },
  { id: 'autumn', name: 'Осень', color: '#EE6A24', ink: '#fff',    emoji: '🍂', desc: 'Осень. Падают листья, идут первые дожди. Созрел виноград.' },
];
// 7 days = 7 rainbow colours; root = letters to underline (вТОРник = второй, ЧЕТВЕРг = четвёртый, ПЯТница = пятый, СРЕДа = середина)
export const DAYS = [
  { id: 'mon', name: 'Понедельник', root: 0, color: '#E53935', ink: '#fff', desc: 'Понедельник — первый день недели. Идём в садик.' },
  { id: 'tue', name: 'Вторник',     root: 4, color: '#FB8C00', ink: '#fff', desc: 'Вторник — второй день. Идём в садик.' },
  { id: 'wed', name: 'Среда',       root: 4, color: '#FDD835', ink: '#1F2D44', ball: true, desc: 'Среда — третий день, середина недели. Садик и футбол!' },
  { id: 'thu', name: 'Четверг',     root: 6, color: '#43A047', ink: '#fff', desc: 'Четверг — четвёртый день. Идём в садик.' },
  { id: 'fri', name: 'Пятница',     root: 3, color: '#29B6F6', ink: '#fff', desc: 'Пятница — пятый день. Идём в садик. Скоро выходные!' },
  { id: 'sat', name: 'Суббота',     root: 0, color: '#3949AB', ink: '#fff', home: true, ball: true, desc: 'Суббота — шестой день. Выходной и футбол!' },
  { id: 'sun', name: 'Воскресенье', root: 0, color: '#8E24AA', ink: '#fff', home: true, desc: 'Воскресенье — седьмой день. Выходной, отдыхаем дома.' },
].map((d, i) => ({ ...d, n: i + 1 }));
export const STICKERS = ['🚗','🏎️','⚽','🚓','🚒','🥅','🚑','🚜','🏆','🚌','🚕','🥇','🚙','🛻','🚚','🏍️','🚀','🚁','✈️','🚂','⛵','🛵','🚲','🎖️'];
export const BRICKS = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#29B6F6'];
export const todayIdx = () => (new Date().getDay() + 6) % 7;
export const seasonIdx = () => Math.floor(((new Date().getMonth() + 1) % 12) / 3);
