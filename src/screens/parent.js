import { $, $$ } from '../util.js';
import { STICKERS, MONTHS, FAMILY } from '../data.js';
import { PHRASE_GROUPS, PHRASES, refreshFamily } from '../phrases.js';
import { S, save } from '../state.js';
import { DB } from '../audio/db.js';
import { setAudioSession } from '../audio/context.js';
import { clipCache, recordedKeys, decode } from '../audio/clips.js';
import { hush, say } from '../audio/speech.js';
import { Rec } from '../audio/recorder.js';
import { VOICE_FILE, voiceFile, readVoiceFile, applyFamily } from '../audio/voice-file.js';
import { hintOf } from '../learning.js';
import { famNom, famGen, genOf, setNames, faceHTML, photos, setPhoto, squarePhoto } from '../family.js';
import { legoAt } from '../draw/lego.js';
import { app, go, bind, bar, toast } from '../ui/core.js';
import { Home } from './home.js';
import './parent.css';

const HINT_GAMES = [['days-find', '🔍 Найди'], ['days-order', '🏁 По порядку'], ['days-missing', '❓ Кто пропал?'], ['days-tomorrow', '📅 Вчера и завтра']];
const own = f => (S.family && S.family[f.id]) || {};
const famRow = f => `<div class="pfam${photos.has(f.id) ? ' has' : ''}" data-id="${f.id}">
  <button class="pface" data-act="photo" data-quiet>${faceHTML(f)}</button>
  <div class="pfam-f"><div class="pfam-m">🎂 ${MONTHS[f.m].name.toLowerCase()}</div>
    <label>Имя <input class="pin" data-f="nom" value="${own(f).nom || ''}" placeholder="${f.nom}" autocomplete="off"></label>
    <label>У кого? <input class="pin" data-f="gen" value="${own(f).gen || ''}" placeholder="${famGen(f)}" autocomplete="off"></label></div>
  <button class="pbtn" data-act="unphoto" data-quiet>🗑️</button></div>`;
export function Parent() {
  let recKey = null, autoStop = null, resetArmed = false, photoFor = null;
  const keys = Object.keys(PHRASES);
  app.innerHTML = `<div class="screen">${bar({ title: 'Для родителей' })}
    <div class="pscroll">
      <section class="pcard"><h3>🎙️ Ваш голос</h3>
        <p>Нажмите 🔴, скажите фразу, нажмите ⏹ — запись сразу проиграется. Ребёнок будет слышать вас вместо синтезатора. Говорите чётко и радостно.</p>
        <p><b>Записано: <span class="pcount"></span> из ${keys.length}</b></p>
        <label class="switch"><input type="checkbox" class="ptts"${S.tts ? ' checked' : ''}> Синтезатор для фраз без записи</label>
      </section>
      <section class="pcard"><h3>👪 Семья</h3>
        <p>В «Месяцах» ребёнок запоминает месяцы по дням рождения. Нажмите на кружок, чтобы поставить фото (камера или галерея), и впишите имя так, как его называет ребёнок. «У кого?» нужно для фраз вроде «Когда день рождения у Маши?» — обычно подставляется само.</p>
        <p>Фото и имена хранятся только на этом iPad и сохраняются в файл вместе с голосом. После смены имени перезапишите фразы из раздела «Семья и праздники».</p>
        ${FAMILY.map(famRow).join('')}
        <input type="file" class="pphoto" accept="image/*">
      </section>
      <section class="pcard"><h3>🚗 Подсказки в днях недели</h3>
        <p>🔢 цифры → 🏷️ подписи с названием дня → 🎨 только цвета → ⚪ серые машинки: день узнаётся только по названию. Раунд почти без ошибок убирает следующую подсказку, трудный раунд возвращает её. Можно переключить и вручную.</p>
        ${HINT_GAMES.map(([m, t]) => `<div class="prow"><div class="ptext">${t}</div>${['🔢', '🏷️', '🎨', '⚪'].map((ic, k) => `<button class="hchip${hintOf(m) === k ? ' on' : ''}" data-act="hint" data-quiet data-m="${m}" data-h="${k}">${ic}</button>`).join('')}</div>`).join('')}
      </section>
      <section class="pcard"><h3>💾 Перенос голоса и фото</h3>
        <p>Сохраните в файл записи голоса, фото и имена семьи, чтобы не потерять их или перенести на другое устройство (например, AirDrop с компьютера на iPad). На iPad: «Календарик» с экрана Домой → ⚙️ → «Загрузить из файла».</p>
        <p>Если iPad открывает приложение с ноутбука, положите файл <b>${VOICE_FILE}</b> в папку приложения — iPad подхватит голос и фото сам.</p>
        <div class="pacts"><button class="pact" data-act="export" data-quiet>💾 Сохранить в файл</button><button class="pact" data-act="import" data-quiet>📂 Загрузить из файла</button></div>
        <input type="file" class="pfile" accept=".json,application/json">
      </section>
      ${PHRASE_GROUPS.map(([g, list]) => `<section class="pcard"><h3>${g}</h3>${list.map(([k, t]) => `<div class="prow${recordedKeys.has(k) ? ' has' : ''}" data-key="${k}">
        <div class="ptext">${t}</div><button class="pbtn" data-act="play" data-quiet>▶️</button><button class="pbtn rec" data-act="rec" data-quiet>🔴</button><button class="pbtn" data-act="del" data-quiet>🗑️</button></div>`).join('')}</section>`).join('')}
      <section class="pcard"><h3>📲 Установка на iPad</h3>
        <p>Откройте страницу в Safari → «Поделиться» → «На экран Домой». Дальше приложение работает без интернета.</p>
        <p><b>Важно:</b> записи хранятся внутри установленного приложения. Записывайте голос, открыв «Календарик» с экрана Домой, а не во вкладке Safari.</p>
        <p>Прогресс: ⭐ ${S.stars} кирпичиков, собрано моделей Лего: ${legoAt(S.stars).built}, наклеек ${S.stickers} из ${STICKERS.length}.</p>
        <button class="danger" data-act="reset">Сбросить кирпичики, Лего и наклейки</button>
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
    // one file for everything made on this device: the voice clips, family photos and names
    export: async () => {
      const j = await voiceFile(), n = Object.keys(j.clips).length, p = Object.keys(j.photos).length;
      if (!n && !p && !Object.keys(j.family).length) { toast('Пока нечего сохранять'); return; }
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
      toast(`Сохранено: записей ${n}, фото ${p}`);
    },
    import: () => $('.pfile', app).click(),
    photo: el => { photoFor = el.closest('.pfam').dataset.id; $('.pphoto', app).click(); },
    unphoto: async el => { const row = el.closest('.pfam'); await setPhoto(row.dataset.id, null); famFace(row.dataset.id); },
    hint: el => {
      S.hints[el.dataset.m] = +el.dataset.h;
      save();
      $$(`.hchip[data-m="${el.dataset.m}"]`, app).forEach(b => b.classList.toggle('on', b === el));
    },
    reset: el => {
      if (!resetArmed) { resetArmed = true; el.textContent = 'Точно? Нажмите ещё раз'; return; }
      Object.assign(S, { stars: 0, bricksSeen: 0, stickers: 0, stats: {}, levels: {}, streaks: {}, hints: {}, mpos: 0 });
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
      const file = await readVoiceFile(f), { clips } = file;
      for (const [k, v] of clips) {
        await DB.put(k, v);
        clipCache.delete(k);
        recordedKeys.add(k);
        rowOf(k).classList.add('has');
      }
      await applyFamily(file, false);
      FAMILY.forEach(x => { famFace(x.id); const row = $(`.pfam[data-id="${x.id}"]`, app); $$('.pin', row).forEach(i => { i.value = own(x)[i.dataset.f] || ''; }); });
      famTexts();
      count();
      toast(`Загружено: записей ${clips.length}, фото ${file.photos.length}`);
    } catch (err) { toast('Это не файл «Календарика»'); }
  });
  // family: a photo for each person, and the name as the child says it
  function famFace(id) {
    const row = $(`.pfam[data-id="${id}"]`, app);
    $('.pface', row).innerHTML = faceHTML(FAMILY.find(x => x.id === id));
    row.classList.toggle('has', photos.has(id));
  }
  // the family phrases are built from the names: show the new texts and the "у кого?" guess
  function famTexts() {
    refreshFamily();
    PHRASE_GROUPS.find(([g]) => g === 'Семья и праздники')[1].forEach(([k, t]) => { const r = rowOf(k); if (r) $('.ptext', r).textContent = t; });
    FAMILY.forEach(x => { $(`.pfam[data-id="${x.id}"] [data-f="gen"]`, app).placeholder = famGen(x); });
  }
  $$('.pin', app).forEach(inp => {
    const row = inp.closest('.pfam'), id = row.dataset.id;
    inp.addEventListener('input', () => {
      if (inp.dataset.f === 'nom') $('[data-f="gen"]', row).placeholder = inp.value.trim() ? genOf(inp.value) : famGen(FAMILY.find(x => x.id === id));
    });
    inp.addEventListener('change', () => {
      setNames(id, $('[data-f="nom"]', row).value, $('[data-f="gen"]', row).value);
      famTexts();
      toast(`Сохранено: ${famNom(FAMILY.find(x => x.id === id))}`);
    });
  });
  $('.pphoto', app).addEventListener('change', async e => {
    const f = e.target.files[0], id = photoFor;
    e.target.value = '';
    if (!f || !id) return;
    try { await setPhoto(id, await squarePhoto(f)); famFace(id); toast('Фото сохранено'); }
    catch (err) { toast('Не получилось открыть фото'); }
  });
  count();
  return () => { clearTimeout(autoStop); Rec.release(); setAudioSession('playback'); };
}
