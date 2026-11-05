export const SEASONS = [
  { id: 'winter', name: 'Зима',  color: '#3D8FE0', ink: '#fff',    emoji: '❄️', desc: 'Зима. Идут дожди, а в горах лежит снег. Созрели мандарины.' },
  { id: 'spring', name: 'Весна', color: '#43B649', ink: '#fff',    emoji: '🌸', desc: 'Весна. Всё цветёт! Зелёная трава, цветы и бабочки.' },
  { id: 'summer', name: 'Лето',  color: '#FFB300', ink: '#1F2D44', emoji: '☀️', desc: 'Лето. Жарко! Купаемся в море и едим арбуз.' },
  { id: 'autumn', name: 'Осень', color: '#EE6A24', ink: '#fff',    emoji: '🍂', desc: 'Осень. Падают листья, идут первые дожди. Созрел виноград.' },
];
// photos per season: [file id, what the voice says]; files are src/assets/seasons/<season>-<id>.webp (credits next to them)
export const PICS = {
  winter: [['snowman', 'Снеговик'], ['forest', 'Снежный лес'], ['sled', 'Санки'], ['skating', 'Коньки'], ['mountains', 'Снег в горах'], ['tree', 'Ёлка'], ['mandarins', 'Мандарины'], ['bullfinch', 'Снегирь'],
    ['snowflake', 'Снежинка'], ['snowplow', 'Снегоуборочная машина'], ['skiing', 'Лыжи'], ['presents', 'Подарки']],
  spring: [['snowdrops', 'Подснежники'], ['willow', 'Верба'], ['almond', 'Цветёт миндаль'], ['tulips', 'Тюльпаны'], ['butterfly', 'Бабочка'], ['nest', 'Гнездо'], ['easter', 'Пасха'],
    ['birdhouse', 'Скворечник'], ['ducklings', 'Утята'], ['dandelions', 'Одуванчики'], ['ladybird', 'Божья коровка']],
  summer: [['sea', 'Море'], ['watermelon', 'Арбуз'], ['icecream', 'Мороженое'], ['sandcastle', 'Замок из песка'], ['pool', 'Бассейн'], ['sunflowers', 'Подсолнухи'], ['daisies', 'Ромашки'], ['strawberries', 'Клубника'],
    ['cherries', 'Черешня'], ['icecreamvan', 'Фургон с мороженым'], ['raspberries', 'Малина'], ['kite', 'Воздушный змей'], ['shells', 'Ракушки']],
  autumn: [['leaf', 'Кленовый лист'], ['forest', 'Золотой лес'], ['puddles', 'Лужи'], ['apples', 'Яблоки'], ['pomegranates', 'Гранаты'], ['pumpkins', 'Тыквы'], ['mushrooms', 'Грибы'], ['squirrel', 'Белка'], ['birds', 'Птицы улетают на юг'],
    ['rowan', 'Рябина'], ['hedgehog', 'Ёжик'], ['chestnuts', 'Каштаны'], ['park', 'Осенний парк'], ['persimmon', 'Хурма']],
};
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
export const STICKERS = ['🚗','🏎️','⚽','🚓','🚒','🥅','🚑','🚜','🏆','🚌','🚕','🥇','🚙','🛻','🚚','🏍️','🚀','🚁','✈️','🚂','⛵','🛵','🚲','🎖️',
  '🏁','🚐','🧱','🚛','🥈','🚤','🤖','🚔','🧤','🚄','🏗️','🚖','🏟️','🛸','🧩','🚍','🥉','🚢','🛞','🚎','🎽','🚦','🐬','🏅'];
export const BRICKS = ['#E53935', '#FB8C00', '#FDD835', '#43A047', '#29B6F6'];
export const todayIdx = () => (new Date().getDay() + 6) % 7;
export const seasonIdx = () => Math.floor(((new Date().getMonth() + 1) % 12) / 3);
// pictures that could pass for another season (fruit, animals, flowers); "Что лишнее?" leaves them out so the odd one is always clear
export const MIXED = new Set(['winter-mandarins', 'winter-presents', 'spring-butterfly', 'spring-ladybird', 'spring-dandelions', 'spring-snowdrops',
  'summer-kite', 'summer-daisies', 'autumn-apples', 'autumn-birds', 'autumn-hedgehog', 'autumn-squirrel', 'autumn-rowan', 'autumn-persimmon', 'autumn-pomegranates']);
// Lego models built from the bricks the child earns, one brick per right answer, in this order, then round again.
// One letter = one stud of that colour (see draw/lego.js), "oo" = a wheel, "oooo" = a big wheel; built from the bottom row up.
export const MODELS = [
  { id: 'race', name: 'Гоночная машина', art: [
    'KKKK           ',
    ' KK    WT      ',
    ' RRRRRRRRRRR   ',
    'RRRRRRRRRRRRRRR',
    ' oo        oo  '] },
  { id: 'police', name: 'Полицейская машина', art: [
    '      RB      ',
    '    WTTWTTW   ',
    ' WWWWWWWWWWWWW',
    'DDDDDDDDDDDDDD',
    '  oo      oo  '] },
  { id: 'tractor', name: 'Трактор', art: [
    ' GGGGGG        ',
    ' GTTTTG    K   ',
    ' GGGGGGGGGGGGGG',
    '     GGGGGGGGGG',
    '     YYYYYYYY  ',
    'oooo      oo   '] },
  { id: 'dump', name: 'Самосвал', art: [
    'SSSSSSSS        ',
    ' SSSSSSS  OOOO  ',
    '  SSSSSS  OTTO  ',
    '  SSSSSS  OOOOO ',
    'KKKKKKKKKKKKKKK ',
    ' oo   oo    oo  '] },
  { id: 'bus', name: 'Автобус', art: [
    'YYYYYYYYYYYYYYYY',
    'YTTTYTTTYTTTYTTY',
    'YYYYYYYYYYYYYYYY',
    'KKKKKKKKKKKKKKKK',
    '  oo        oo  '] },
  { id: 'fire', name: 'Пожарная машина', art: [
    '  SSSSSSSS      ',
    ' RRRRRRRRR   B  ',
    ' RRRRRRRRR RTTR ',
    ' RYYRRRYYR RRRRR',
    'KKKKKKKKKKKKKKKK',
    '  oo       oo   '] },
];
