import { $ } from '../util.js';
import { STICKERS, MODELS } from '../data.js';
import { S, save } from '../state.js';
import { sfx } from '../audio/sfx.js';
import { say } from '../audio/speech.js';
import { legoAt, legoSVG, pieces, landTimes } from '../draw/lego.js';
import { app, go, anim } from './core.js';
import { confetti } from './confetti.js';
import { Home } from '../screens/home.js';
import './celebrate.css';

export function celebrate(onAgain, up) {
  const isNew = S.stickers < STICKERS.length, idx = Math.min(S.stickers, STICKERS.length - 1);
  if (isNew) S.stickers++;
  // the bricks earned since the model was last seen drop onto it; a model finished in this round is shown whole
  const was = legoAt(S.bricksSeen), now = legoAt(S.stars);
  const fin = now.built > was.built ? MODELS[(now.built - 1) % MODELS.length] : null;
  const model = fin || now.model, placed = fin ? pieces(fin).length : now.placed;
  const fresh = Math.max(fin && now.built - was.built > 1 ? 0 : was.placed, placed - 10);
  S.bricksSeen = S.stars;
  save();
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="toy cel"><div class="cel-t">Ура!</div>
    <div class="cel-row">
      <div class="cel-col"><div class="cel-st">${STICKERS[idx]}</div><div class="cel-sub">${isNew ? 'Новая наклейка!' : 'Молодец!'}</div></div>
      <div class="cel-col"><div class="cel-lego">${legoSVG(model, placed, fresh)}</div><div class="cel-sub">${fin ? fin.name + '!' : '&nbsp;'}</div></div>
    </div>
    ${up ? `<div class="cel-up">${['', '🏷️ Теперь подписи вместо цифр!', '🎨 Теперь без подписей!', '⚪ Теперь машинки серые!'][up]}</div>` : ''}
    <div class="cel-btns"><button class="toy round xl" data-a="again">🔁</button><button class="toy round xl" data-a="home">🏠</button></div></div>`;
  app.appendChild(ov);
  sfx.fanfare();
  confetti.burst(160);
  const lands = landTimes(placed - fresh), box = $('.cel-lego', ov);
  lands.forEach(t => setTimeout(() => { if (ov.isConnected) sfx.snap(); }, t));
  // a finished model drives off with a roar once its last brick is in
  if (fin) setTimeout(() => {
    if (!ov.isConnected) return;
    anim(box, 'bounce');
    sfx.vroom();
    const r = box.getBoundingClientRect();
    confetti.burst(70, r.left + r.width / 2, r.top + r.height / 2);
  }, (lands[lands.length - 1] || 0) + 250);
  say(['r_round', ...(fin ? ['r_built', 'm_' + fin.id] : []), ...(isNew ? ['r_sticker'] : [])]);
  ov.addEventListener('click', e => {
    e.stopPropagation();
    const a = e.target.closest('[data-a]');
    if (!a) return;
    sfx.tap();
    if (a.dataset.a === 'again') onAgain(); else go(Home);
  });
}
