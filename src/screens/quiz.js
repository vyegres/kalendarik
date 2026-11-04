import { $, $$, wait } from '../util.js';
import { BRICKS } from '../data.js';
import { praise } from '../phrases.js';
import { S, save } from '../state.js';
import { sfx } from '../audio/sfx.js';
import { say } from '../audio/speech.js';
import { carSVG } from '../draw/car.js';
import { brickSVG } from '../draw/brick.js';
import { record, hintOf, adjustHints } from '../learning.js';
import { app, go, bind, btn, anim } from '../ui/core.js';
import { confetti } from '../ui/confetti.js';
import { celebrate } from '../ui/celebrate.js';
import { QUIZ, level, adjustLevel } from './quiz-modes.js';
import './quiz.css';

export function Quiz(mode) {
  const M = QUIZ[mode], h = M.hints ? hintOf(mode) : 0;
  let alive = true, done = 0, q = null, misses = 0, wrong = 0, busy = false, prev = null;
  app.innerHTML = `<div class="screen"><div class="bar">${btn('back', '⬅️')}<div class="bricks">${BRICKS.map(() => brickSVG()).join('')}</div>${btn('repeat', '🔊')}</div>
    <div class="stage"></div><div class="options"></div></div>`;
  const stage = $('.stage', app), opts = $('.options', app);
  const ask = () => q.speak ? q.speak(stage) : say(q.prompt);
  function next() {
    misses = 0; busy = false;
    q = M.make(level(mode), prev, h);
    prev = q.answer;
    stage.innerHTML = q.stage;
    opts.style.setProperty('--n', q.options.length);
    opts.style.setProperty('--maxw', M.maxw);
    opts.classList.toggle('week', q.options.length === 7);
    opts.innerHTML = q.options.map((o, i) => `<button class="toy opt" data-act="opt" data-quiet data-i="${i}" style="animation:pop .4s ${i * .08}s both">${M.opt(o, q.look)}</button>`).join('');
    setTimeout(() => $$('.opt', opts).forEach(b => { b.style.animation = ''; }), 800);
    ask();
  }
  async function answer(el) {
    if (busy) return;
    const o = q.options[+el.dataset.i], box = $('.carbox', el);
    if (q.look && box) box.innerHTML = carSVG(o.color, o.n); // a tapped car shows who it is
    if (o !== q.answer) {
      misses++; wrong++;
      sfx.bad();
      anim(el, 'wiggle');
      setTimeout(() => el.classList.add('off'), 500);
      say(['w_' + o.id, 'r_try']);
      if (misses >= 2) $$('.opt', opts)[q.options.indexOf(q.answer)].classList.add('hint');
      return;
    }
    busy = true;
    el.classList.remove('hint');
    el.classList.add('right');
    $$('.opt', opts).forEach(b => b !== el && b.classList.add('off'));
    sfx.good();
    const r = el.getBoundingClientRect();
    confetti.burst(40, r.left + r.width / 2, r.top + r.height / 2);
    record(mode, q.answer, misses === 0);
    adjustLevel(mode, misses);
    S.stars++;
    save();
    $$('.brick', app)[done].outerHTML = brickSVG(BRICKS[done]);
    done++;
    if (M.onRight) M.onRight(q, stage);
    await say([praise(), 'w_' + o.id]);
    if (!alive) return;
    await wait(300);
    if (!alive) return;
    if (done >= BRICKS.length) celebrate(() => go(Quiz, mode), M.hints && adjustHints(mode, wrong)); else next();
  }
  bind({ back: () => M.menu(), repeat: ask, opt: answer });
  next();
  return () => { alive = false; };
}
