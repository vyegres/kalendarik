import { $, $$ } from '../util.js';
import { STICKERS } from '../data.js';
import { PHRASE_GROUPS, PHRASES } from '../phrases.js';
import { S, save } from '../state.js';
import { DB } from '../audio/db.js';
import { setAudioSession } from '../audio/context.js';
import { clipCache, recordedKeys, decode } from '../audio/clips.js';
import { hush, say } from '../audio/speech.js';
import { Rec } from '../audio/recorder.js';
import { VOICE_FILE, voiceFile, readVoiceFile } from '../audio/voice-file.js';
import { hintOf } from '../learning.js';
import { app, go, bind, bar, toast } from '../ui/core.js';
import { Home } from './home.js';
import './parent.css';

const HINT_GAMES = [['days-find', '🔍 Найди'], ['days-order', '🏁 По порядку'], ['days-missing', '❓ Кто пропал?'], ['days-tomorrow', '📅 Вчера и завтра']];
export function Parent() {
  let recKey = null, autoStop = null, resetArmed = false;
  const keys = Object.keys(PHRASES);
  app.innerHTML = `<div class="screen">${bar({ title: 'Для родителей' })}
    <div class="pscroll">
      <section class="pcard"><h3>🎙️ Ваш голос</h3>
        <p>Нажмите 🔴, скажите фразу, нажмите ⏹ — запись сразу проиграется. Ребёнок будет слышать вас вместо синтезатора. Говорите чётко и радостно.</p>
        <p><b>Записано: <span class="pcount"></span> из ${keys.length}</b></p>
        <label class="switch"><input type="checkbox" class="ptts"${S.tts ? ' checked' : ''}> Синтезатор для фраз без записи</label>
      </section>
      <section class="pcard"><h3>🚗 Подсказки в днях недели</h3>
        <p>🔢 цифры → 🏷️ подписи с названием дня → 🎨 только цвета → ⚪ серые машинки: день узнаётся только по названию. Раунд почти без ошибок убирает следующую подсказку, трудный раунд возвращает её. Можно переключить и вручную.</p>
        ${HINT_GAMES.map(([m, t]) => `<div class="prow"><div class="ptext">${t}</div>${['🔢', '🏷️', '🎨', '⚪'].map((ic, k) => `<button class="hchip${hintOf(m) === k ? ' on' : ''}" data-act="hint" data-quiet data-m="${m}" data-h="${k}">${ic}</button>`).join('')}</div>`).join('')}
      </section>
      <section class="pcard"><h3>💾 Перенос записей</h3>
        <p>Сохраните записи в файл, чтобы не потерять их или перенести на другое устройство (например, AirDrop с компьютера на iPad). На iPad: «Календарик» с экрана Домой → ⚙️ → «Загрузить из файла».</p>
        <p>Если iPad открывает приложение с ноутбука, положите файл <b>${VOICE_FILE}</b> в папку приложения — iPad подхватит голос сам.</p>
        <div class="pacts"><button class="pact" data-act="export" data-quiet>💾 Сохранить в файл</button><button class="pact" data-act="import" data-quiet>📂 Загрузить из файла</button></div>
        <input type="file" class="pfile" accept=".json,application/json">
      </section>
      ${PHRASE_GROUPS.map(([g, list]) => `<section class="pcard"><h3>${g}</h3>${list.map(([k, t]) => `<div class="prow${recordedKeys.has(k) ? ' has' : ''}" data-key="${k}">
        <div class="ptext">${t}</div><button class="pbtn" data-act="play" data-quiet>▶️</button><button class="pbtn rec" data-act="rec" data-quiet>🔴</button><button class="pbtn" data-act="del" data-quiet>🗑️</button></div>`).join('')}</section>`).join('')}
      <section class="pcard"><h3>📲 Установка на iPad</h3>
        <p>Откройте страницу в Safari → «Поделиться» → «На экран Домой». Дальше приложение работает без интернета.</p>
        <p><b>Важно:</b> записи хранятся внутри установленного приложения. Записывайте голос, открыв «Календарик» с экрана Домой, а не во вкладке Safari.</p>
        <p>Прогресс: ⭐ ${S.stars}, наклеек ${S.stickers} из ${STICKERS.length}.</p>
        <button class="danger" data-act="reset">Сбросить звёзды и наклейки</button>
      </section>
    </div></div>`;
  const count = () => { $('.pcount', app).textContent = keys.filter(k => recordedKeys.has(k)).length; };
  const rowOf = key => $(`.prow[data-key="${key}"]`, app);
  async function stopRec() {
    clearTimeout(autoStop);
    const key = recKey, row = rowOf(key);
    recKey = null;
    row.classList.remove('recording');
    $('.rec', row).textContent = '🔴';
    const blob = await Rec.stop();
    if (!blob || blob.size < 800) { toast('Не получилось записать, попробуйте ещё раз'); return; }
    const data = await blob.arrayBuffer();
    try { await decode(data.slice(0)); } catch (e) { toast('Запись не читается, попробуйте ещё раз'); return; }
    await DB.put(key, { data, type: blob.type, t: Date.now() });
    clipCache.delete(key);
    recordedKeys.add(key);
    row.classList.add('has');
    count();
    say(key);
  }
  bind({
    back: () => go(Home),
    play: el => say(el.closest('.prow').dataset.key),
    rec: async el => {
      const key = el.closest('.prow').dataset.key;
      if (recKey) { const same = recKey === key; await stopRec(); if (same) return; }
      hush();
      try { setAudioSession('play-and-record'); await Rec.start(); }
      catch (e) { toast('Нет доступа к микрофону'); return; }
      recKey = key;
      el.closest('.prow').classList.add('recording');
      el.textContent = '⏹';
      autoStop = setTimeout(stopRec, 12000);
    },
    del: async el => {
      const row = el.closest('.prow'), key = row.dataset.key;
      await DB.del(key);
      clipCache.delete(key);
      recordedKeys.delete(key);
      row.classList.remove('has');
      count();
    },
    export: async () => {
      if (!recordedKeys.size) { toast('Пока нет записей'); return; }
      const j = await voiceFile(), n = Object.keys(j.clips).length;
      const file = new File([JSON.stringify(j)], VOICE_FILE, { type: 'application/json' });
      // iPad: share sheet (AirDrop, Files); computer: regular download
      if (matchMedia('(pointer:coarse)').matches && navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file] }); } catch (e) { return; }
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(file);
        a.download = VOICE_FILE;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 10000);
      }
      toast(`Сохранено записей: ${n}`);
    },
    import: () => $('.pfile', app).click(),
    hint: el => {
      S.hints[el.dataset.m] = +el.dataset.h;
      save();
      $$(`.hchip[data-m="${el.dataset.m}"]`, app).forEach(b => b.classList.toggle('on', b === el));
    },
    reset: el => {
      if (!resetArmed) { resetArmed = true; el.textContent = 'Точно? Нажмите ещё раз'; return; }
      Object.assign(S, { stars: 0, stickers: 0, stats: {}, levels: {}, streaks: {}, hints: {} });
      save();
      el.textContent = 'Готово ✓';
    },
  });
  $('.ptts', app).addEventListener('change', e => { S.tts = e.target.checked; save(); });
  $('.pfile', app).addEventListener('change', async e => {
    const f = e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try {
      const clips = await readVoiceFile(f);
      for (const [k, v] of clips) {
        await DB.put(k, v);
        clipCache.delete(k);
        recordedKeys.add(k);
        rowOf(k).classList.add('has');
      }
      count();
      toast(`Загружено записей: ${clips.length}`);
    } catch (err) { toast('Это не файл с записями «Календарика»'); }
  });
  count();
  return () => { clearTimeout(autoStop); Rec.release(); setAudioSession('playback'); };
}
