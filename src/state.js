export const S = (() => {
  let s = {};
  try { s = JSON.parse(localStorage.getItem('kal') || '{}'); } catch (e) {}
  s = Object.assign({ stars: 0, stickers: 0, stats: {}, levels: {}, streaks: {}, hints: {}, tts: true }, s);
  // stars = Lego bricks earned; bricksSeen = how many of them the child has already watched land on the model
  if (s.bricksSeen == null) s.bricksSeen = s.stars;
  return s;
})();
export const save = () => { try { localStorage.setItem('kal', JSON.stringify(S)); } catch (e) {} };
