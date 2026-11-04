import { $, rnd } from '../util.js';
import { DAYS } from '../data.js';

export const confetti = (() => {
  const cv = $('#fx'), cx = cv.getContext('2d');
  let parts = [], raf = null;
  const resize = () => { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; };
  addEventListener('resize', resize); resize();
  const colors = DAYS.map(d => d.color);
  function tick() {
    cx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    cx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.a);
      cx.fillStyle = p.c; cx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
      cx.restore();
    }
    parts = parts.filter(p => p.y < innerHeight + 40);
    raf = parts.length ? requestAnimationFrame(tick) : (cx.clearRect(0, 0, innerWidth, innerHeight), null);
  }
  return {
    burst(n = 140, x = innerWidth / 2, y = innerHeight * .35) {
      const spread = n > 60 ? innerWidth * .6 : 40;
      for (let i = 0; i < n; i++) parts.push({
        x: x + (Math.random() - .5) * spread, y, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4,
        r: 6 + Math.random() * 8, c: colors[rnd(colors.length)], a: Math.random() * 6, va: (Math.random() - .5) * .3,
      });
      if (!raf) raf = requestAnimationFrame(tick);
    },
  };
})();
