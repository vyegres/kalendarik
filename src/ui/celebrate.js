import { STICKERS } from '../data.js';
import { S, save } from '../state.js';
import { sfx } from '../audio/sfx.js';
import { say } from '../audio/speech.js';
import { app, go } from './core.js';
import { confetti } from './confetti.js';
import { Home } from '../screens/home.js';
import './celebrate.css';

export function celebrate(onAgain, up) {
  const isNew = S.stickers < STICKERS.length, idx = Math.min(S.stickers, STICKERS.length - 1);
  if (isNew) S.stickers++;
  save();
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="toy cel"><div class="cel-t">Ура!</div><div class="cel-st">${STICKERS[idx]}</div><div class="cel-sub">${isNew ? 'Новая наклейка!' : 'Молодец!'}</div>
    ${up ? `<div class="cel-up">${['', '🏷️ Теперь подписи вместо цифр!', '🎨 Теперь без подписей!', '⚪ Теперь машинки серые!'][up]}</div>` : ''}
    <div class="cel-btns"><button class="toy round xl" data-a="again">🔁</button><button class="toy round xl" data-a="home">🏠</button></div></div>`;
  app.appendChild(ov);
  sfx.fanfare();
  confetti.burst(160);
  say(['r_round', ...(isNew ? ['r_sticker'] : [])]);
  ov.addEventListener('click', e => {
    e.stopPropagation();
    const a = e.target.closest('[data-a]');
    if (!a) return;
    sfx.tap();
    if (a.dataset.a === 'again') onAgain(); else go(Home);
  });
}
