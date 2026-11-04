export let ctx = null, master = null;
export function audioCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  return ctx;
}
export function setAudioSession(type) { try { if (navigator.audioSession) navigator.audioSession.type = type; } catch (e) {} }
export function unlockAudio() {
  const c = audioCtx();
  if (c.state !== 'running') c.resume();
  const s = c.createBufferSource();
  s.buffer = c.createBuffer(1, 1, 22050);
  s.connect(c.destination);
  s.start(0);
  setAudioSession('playback'); // play even when the iPad is muted
  if ('speechSynthesis' in window && !unlockAudio.done) {
    unlockAudio.done = true;
    const u = new SpeechSynthesisUtterance(' ');
    u.volume = 0;
    speechSynthesis.speak(u);
  }
}
