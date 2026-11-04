export const S = (() => {
  let s = {};
  try { s = JSON.parse(localStorage.getItem('kal') || '{}'); } catch (e) {}
  return Object.assign({ stars: 0, stickers: 0, stats: {}, levels: {}, streaks: {}, hints: {}, tts: true }, s);
})();
export const save = () => { try { localStorage.setItem('kal', JSON.stringify(S)); } catch (e) {} };
