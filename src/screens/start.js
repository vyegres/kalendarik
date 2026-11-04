import { DAYS } from '../data.js';
import { unlockAudio } from '../audio/context.js';
import { sfx } from '../audio/sfx.js';
import { carSVG } from '../draw/car.js';
import { app, go, bind } from '../ui/core.js';
import { Home } from './home.js';
import './start.css';

export function Start() {
  app.innerHTML = `<div class="screen start">
    <div class="logo big">Календарик</div>
    <div class="start-cars">${DAYS.map((d, i) => `<div style="--d:${i * .12}s">${carSVG(d.color, d.n)}</div>`).join('')}</div>
    <button class="toy gobtn" data-act="go" data-quiet>▶ Поехали!</button></div>`;
  bind({ go() { unlockAudio(); sfx.vroom(); go(Home); } });
}
