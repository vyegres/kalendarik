import './styles/base.css';
import { ctx } from './audio/context.js';
import { DB } from './audio/db.js';
import { preloadClips } from './audio/clips.js';
import { hush } from './audio/speech.js';
import { loadBundledVoice } from './audio/voice-file.js';
import { loadPhotos } from './family.js';
import { go } from './ui/core.js';
import { Start } from './screens/start.js';
// last, so its one-shot animation classes win over screen styles
import './styles/animations.css';

document.addEventListener('pointerdown', () => { if (ctx && ctx.state !== 'running') ctx.resume(); }, true);
document.addEventListener('visibilitychange', () => { if (document.hidden) hush(); });
document.addEventListener('gesturestart', e => e.preventDefault());
document.addEventListener('dblclick', e => e.preventDefault());
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
DB.open().then(preloadClips).then(loadPhotos).then(loadBundledVoice).catch(() => {});
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
go(Start);
