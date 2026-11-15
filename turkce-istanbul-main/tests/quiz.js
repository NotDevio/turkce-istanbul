/* New question types: generate for every unit/level, then render + answer each kind in a real browser.  node tests/quiz.js */
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'), os = require('os'), path = require('path');
const PORT = 3700 + Math.floor(Math.random() * 90), URL_ = `http://localhost:${PORT}/`;
let pass = 0, fail = 0; const ok = (c, n, x) => { c ? pass++ : fail++; console.log(c ? '  PASS' : '  FAIL', n, c ? '' : JSON.stringify(x ?? '')); };
(async () => {
  const srv = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT, DATA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'tri-q-')) }, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { await fetch(URL_); break; } catch (e) { await new Promise(r => setTimeout(r, 100)); } }
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: 390, height: 800 } });
  await ctx.route(/fonts\.g/, r => r.abort()); await ctx.addInitScript(`window.SpeechRecognition=class{start(){const m=window.__sr||{heard:['']};setTimeout(()=>{if(m.err)this.onerror&&this.onerror({error:m.err});else this.onresult&&this.onresult({results:[m.heard.map(t=>({transcript:t}))]})},20)}abort(){}stop(){}};window.speechSynthesis&&(speechSynthesis.speak=()=>{});const _s=window.setTimeout;window.setTimeout=(f,t,...a)=>_s(f,Math.min(t||0,30),...a)`);
  await ctx.addInitScript(`window.__mic={state:'granted',asks:0};try{Object.defineProperty(navigator,'permissions',{value:{query:async()=>({state:window.__mic.state})},configurable:true})}catch(e){}
    navigator.mediaDevices.getUserMedia=async()=>{window.__mic.asks++;if(window.__mic.state=='denied'){const e=new Error('x');e.name='NotAllowedError';throw e}window.__mic.state='granted';return{getTracks:()=>[{stop(){}}]}}`);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('dialog', d => d.accept());
  for (const lang of ['en', 'ar']) {
    console.log(`\n== base language: ${lang} ==`);
    await pg.goto(URL_); await pg.waitForSelector('.modal.auth'); await pg.click(`[data-lg="${lang}"]`); await pg.click('[data-md="register"]');
    await pg.fill('#un', 'quiz_' + lang); pg.on('response', r => { if (r.url().includes('/api/register')) r.text().then(t => console.log('REG', r.status(), t.slice(0,120))) }); await pg.fill('#pw', 'secret1'); await pg.click('#af .btn'); await pg.waitForSelector('.trail');
    const gen = await pg.evaluate(() => { const kinds = {}, bad = []; let n = 0;
      UNITS.forEach(u => [1, 2, 3, 4, 5].forEach(L => { let qs; try { qs = levelQs(u, L) } catch (e) { bad.push(u.id + L + ':' + e.message); return }
        qs.forEach(q => { n++; kinds[q.kind] = (kinds[q.kind] || 0) + 1;
          if (q.kind == 'pic' && !(q.popts.length == 4 && q.popts.filter(o => o.ok).length == 1 && new Set(q.popts.map(o => o.e)).size == 4 && new Set(q.popts.map(o => o.l)).size == 4)) bad.push('pic ' + q.tr);
          if (q.kind == 'cc' && !(q.optsList.length == 4 && new Set(q.optsList.map(norm)).size == 4)) bad.push('cc ' + q.tr);
          if ((q.kind == 'cc' || q.kind == 'cz') && !(q.sen.includes('gap') && q.ans && q.full.includes(q.ans))) bad.push('cloze ' + q.tr);
          if (q.kind == 'bb' && !(q.opt.extra.length >= 2 && q.ans.split(' ').length >= 2)) bad.push('bb ' + q.tr);
          if (q.kind == 'match' && q.pairs.length != 4) bad.push('match') }) }));
      examQs(pick(ALL, 12)); return { kinds, bad, n } });
    ok(!gen.bad.length, 'every unit/level builds, and all questions are well-formed', gen.bad.slice(0, 5));
    ok(['pic', 'bb', 'cc', 'cz', 'match'].every(k => gen.kinds[k] > 0), 'all new kinds are generated', gen.kinds);
    console.log('    kinds:', JSON.stringify(gen.kinds));
    const mkRun = kind => pg.evaluate(k => { const p = ALL.find(x => k == 'pic' ? x.tr == 'elma' : k == 'bb' ? x.tr == 'Hesap, lütfen' : x.tr == 'Benim adım Ali');
      const q = k == 'am' ? mQ(uniqPairs(ALL.filter(x => ['Merhaba', 'su', 'ekmek', 'kedi'].includes(x.tr)), 4), true) : mkQ(k, p, ITEMS(p.id));
      window.__q = q; document.body.classList.add('focus'); run({ qs: [q], hearts: 0, strict: 0, pass: 0, after: () => {}, exit: () => {} }); return { k: q.k, kind: q.kind, ans: q.ans } }, kind);
    const sheet = () => pg.waitForSelector('.sheet.ok,.sheet.no,.fin', { timeout: 3000 }).then(() => pg.evaluate(() => { const r = document.querySelector('.sheet.ok') ? 'ok' : document.querySelector('.sheet.no') ? 'no' : 'fin'; document.querySelector('#back').click(); const q=document.querySelector('#lv-q'); q&&q.click(); return r }));
    // picture
    await mkRun('pic'); ok(await pg.locator('.pic').count() == 4, 'picture question shows 4 cards');
    await pg.waitForTimeout(600); await pg.screenshot({ path: `/tmp/claude-0/shots/pic-${lang}.png` });
    await pg.locator('.pic').nth(await pg.evaluate(() => __q.popts.findIndex(o => o.ok))).click(); ok(await sheet() == 'ok', 'correct picture accepted');
    await mkRun('pic'); await pg.locator('.pic').nth(await pg.evaluate(() => __q.popts.findIndex(o => !o.ok))).click(); ok(await sheet() == 'no', 'wrong picture rejected');
    // word bank translation
    await mkRun('bb'); ok(await pg.locator('.chips .chip').count() >= 5, 'word bank has answer words + decoys', await pg.locator('.chips .chip').count());
    await pg.waitForTimeout(600); await pg.screenshot({ path: `/tmp/claude-0/shots/bb-${lang}.png` });
    for (const w of await pg.evaluate(() => __q.ans.split(' '))) await pg.locator('.chips .chip', { hasText: new RegExp('^' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$') }).first().click();
    await pg.click('#ck'); ok(await sheet() == 'ok', 'correct word order accepted');
    await mkRun('bb'); await pg.locator('.chips .chip').first().click(); await pg.click('#ck'); ok(await sheet() == 'no', 'single wrong word rejected');
    // cloze: choice + typed
    await mkRun('cc'); ok(await pg.locator('.sbox .gap').count() == 1 && await pg.locator('.opt').count() == 4, 'fill-in-the-blank (choice) shows sentence with gap + 4 words');
    await pg.waitForTimeout(600); await pg.screenshot({ path: `/tmp/claude-0/shots/cc-${lang}.png` });
    await pg.locator('.opt', { hasText: await pg.evaluate(() => __q.ans) }).first().click(); ok(await sheet() == 'ok', 'correct missing word accepted');
    await mkRun('cz'); await pg.fill('#in', await pg.evaluate(() => __q.ans.replace(/ı/g, 'i').replace(/ş/g, 's'))); await pg.click('#ck'); ok(await sheet() == 'ok', 'typed missing word accepted (diacritics optional)');
    await mkRun('cz'); await pg.fill('#in', 'zzz'); await pg.click('#ck'); ok(await sheet() == 'no', 'wrong typed word rejected');
    // audio matching pairs
    await mkRun('am'); ok(await pg.locator('.wave').count() == 4, 'audio pairs show waveform buttons');
    await pg.waitForTimeout(600); await pg.screenshot({ path: `/tmp/claude-0/shots/am-${lang}.png` });
    await pg.click('#nl'); await pg.click('#sk-yes'); ok(await pg.locator('.wave').count() == 0 && await pg.locator('.tr').count() == 4, "\"Can't listen now\" + Skip switches to text pairs");
    for (let i = 0; i < 4; i++) { const idx = await pg.evaluate(i => { const ls = [...document.querySelectorAll('[data-s=l]:not([disabled])')], l = ls[0], rs = [...document.querySelectorAll('[data-s=r]:not([disabled])')];
        const tr = l.innerText.trim(), p = ALL.find(x => x.tr == tr); return rs.findIndex(r => r.innerText.trim() == bt(p)) }, i);
      await pg.locator('[data-s=l]:not([disabled])').first().click(); await pg.locator('[data-s=r]:not([disabled])').nth(idx).click(); }
    ok(await sheet() == 'ok', 'all pairs matched');

    /* ---- grading: accents / typos / names / lesson length / skip popup / speaking / grid ---- */
    console.log('  -- new behaviour --');
    const g = await pg.evaluate(() => { const G = (a, b) => { const r = grade(a, b); return r.ok ? (r.note || 'ok') : 'no' };
      return { exact: G('Günaydın', 'Günaydın'), lower: G('günaydın', 'Günaydın'), capI: G('I', 'ı'), accent: G('Gunaydin', 'Günaydın'), accent2: G('Teşekkur ederim', 'Teşekkür ederim'), lowI: G('i', 'ı'),
        typo: G('Günaydn', 'Günaydın'), typo2: G('elmma', 'elma'), swap: G('Gunaydni', 'Günaydın'), shortWrong: G('sa', 'su'), threeWrong: G('kay', 'çay'), other: G('Elma', 'Merhaba'), synonym: G('Selam', 'Merhaba'), longWrong: G('Hosgeldiniz', 'Günaydın'), punct: G('hesap lütfen', 'Hesap, lütfen'),
        mark: markDiff('gunaydin', 'Günaydın'), mark2: markDiff('Gunaydn', 'Günaydın') } });
    ok(g.synonym == 'ok', 'synonyms (Selam = Merhaba) still accepted', g);
    ok(g.exact == 'ok' && g.lower == 'ok' && g.capI == 'ok' && g.punct == 'ok', 'exact answers (case/punctuation ignored) have no note', g);
    ok(g.accent == 'accent' && g.accent2 == 'accent' && g.lowI == 'accent', 'i for ı / missing accents: correct, with accent note', g);
    ok(g.typo == 'typo' && g.typo2 == 'typo' && g.swap == 'typo', 'small typos: correct, with typo note', g);
    ok(g.shortWrong == 'no' && g.threeWrong == 'no' && g.other == 'no' && g.longWrong == 'no', 'different words are still wrong', g);
    ok(g.mark.includes('<u>ü</u>') && g.mark.includes('<u>ı</u>') && !g.mark.includes('<u>G'), 'differing letters are underlined', g.mark);
    ok(g.mark2.includes('<u>ı</u>'), 'typo shows the missing letter', g.mark2);

    await mkRun('ty'); await pg.evaluate(() => { run({ qs: [mkQ('ty', ALL.find(x => x.tr == 'Günaydın'), ALL)], hearts: 0, strict: 0, pass: 0, after() {}, exit() {} }) });
    await pg.fill('#in', 'Gunaydin'); await pg.click('#ck'); await pg.waitForSelector('.sheet.ok.note');
    const nt = await pg.evaluate(() => ({ t: document.querySelector('.sheet.note b').textContent, u: [...document.querySelectorAll('.sheet.note u')].map(x => x.textContent), btn: !!document.querySelector('#nx') }));
    ok(/Turkish letters|للأحرف التركية/.test(nt.t) && nt.u.join('') == 'üı' && nt.btn, 'accent note shown with underlined letters + Continue button', nt);
    await pg.click('#nx'); await pg.waitForSelector('.fin'); ok(true, 'Continue moves on');
    await pg.evaluate(() => { run({ qs: [mkQ('ty', ALL.find(x => x.tr == 'Günaydın'), ALL)], hearts: 0, strict: 0, pass: 0, after() {}, exit() {} }) });
    await pg.fill('#in', 'Günaydn'); await pg.press('#in', 'Enter'); await pg.waitForSelector('.sheet.ok.note');
    ok(/typo|إملائي/.test(await pg.locator('.sheet.note b').innerText()), 'typo note shown (counted correct)');
    await pg.click('#nx'); await pg.waitForSelector('.fin');

    const nm = await pg.evaluate(() => { const p = ALL.find(x => x.tr == 'Benim adım Ali'), q = mkQ('c1', p, ITEMS('intro')), q2 = mkQ('ty', p, ITEMS('intro')); return { show: q.showH, ans: q.ans, tr: q.tr, trs: q.trs, ty: q2.ans, opts: opts(q), mp: mQ(uniqPairs(ITEMS('intro'), 4)).pairs.map(x => x.tr) } });
    ok(nm.show.includes('Benim adım quiz_' + lang) && nm.ans.includes('quiz_' + lang) && !nm.ans.includes('Ali') && !nm.ans.includes('علي'), 'name sentence uses the username', nm);
    ok(nm.tr == 'Benim adım Ali' && nm.trs[0] == 'Benim adım Ali', 'progress key unchanged');
    ok(!nm.opts.some(o => /Ali|علي/.test(o)) && !nm.mp.some(t => t.includes('Ali')), 'no leftover "Ali" in options / pairs', nm.opts);

    const len = await pg.evaluate(() => { const sizes = [], rep = []; UNITS.forEach(u => [1, 2, 3, 4].forEach(L => { const qs = levelQs(u, L); sizes.push(qs.length); const c = {}; qs.filter(q => q.k != 'match').forEach(q => { c[q.tr] = (c[q.tr] || 0) + 1 }); rep.push(Math.max(...Object.values(c))) })); return { max: Math.max(...sizes), min: Math.min(...sizes), avg: sizes.reduce((a, b) => a + b) / sizes.length, rep: Math.max(...rep) } });
    ok(len.max <= 20 && len.min >= 4 && len.avg <= 15, 'levels are short (was ~30-60)', len);
    ok(len.rep <= 5, 'no word is asked more than 5 times', len);
    const variety = await pg.evaluate(() => { const u = UNITS.find(x => x.id == 'animal'), qs = levelQs(u, 1).filter(q => q.tr == ITEMS('animal')[0].tr); return new Set(qs.map(q => q.kind)).size / qs.length });
    ok(variety == 1, 'a word is never asked the same way twice in a level');

    // "Can't listen now" popup
    await mkRun('am'); await pg.click('#nl'); await pg.waitForSelector('.skipq');
    const sk = await pg.evaluate(() => ({ txt: document.querySelector('.skipq p').textContent, btns: [...document.querySelectorAll('.skipq button')].map(b => b.textContent) }));
    ok(sk.btns.length == 2 && sk.txt.length > 20, 'popup with message + Continue / Skip', sk);
    await pg.screenshot({ path: `/tmp/claude-0/shots/skip-${lang}.png` });
    await pg.click('#sk-no'); ok(await pg.locator('.skipq').count() == 0 && await pg.locator('.wave').count() == 4, 'Continue keeps the listening exercise');
    await pg.click('#nl'); await pg.click('#sk-yes'); ok(await pg.locator('.skipq').count() == 0 && await pg.locator('.wave').count() == 0 && await pg.locator('.tr').count() == 4, 'Skip turns the pairs into text');
    await pg.evaluate(() => { document.querySelector('#back').click(); const q = document.querySelector('#lv-q'); q && q.click() });
    await pg.evaluate(() => { const its = ITEMS('greet'); run({ unit: 'greet', qs: [mkQ('ls', its[0], its), mkQ('c1', its[1], its), mQ(uniqPairs(its, 4), true), mkQ('ls', its[2], its)], hearts: 0, strict: 0, pass: 0, after() {}, exit() {} }) });
    await pg.waitForSelector('#nl'); await pg.click('#nl'); await pg.click('#sk-yes');
    const af = await pg.evaluate(() => ({ q: document.querySelector('.q').textContent, hasIn: !!document.querySelector('#in'), nol: NOLISTEN.has('greet'), lv: UNITS.filter(u => u.id == 'greet').flatMap(u => [1, 2, 3, 4, 5].flatMap(L => levelQs(u, L))).filter(q => q.kind == 'ls' || q.audio).length }));
    ok(!af.hasIn && af.nol && af.lv == 0, 'skipping removes listening questions for the unit (now and in later levels)', af);
    await pg.evaluate(() => { NOLISTEN.clear(); document.querySelector('#back').click(); const q = document.querySelector('#lv-q'); q && q.click() });

    // match grid: left/right cells same size and aligned
    await mkRun('am'); await pg.click('#nl'); await pg.click('#sk-yes');
    const grid = await pg.evaluate(() => { const l = [...document.querySelectorAll('[data-s=l]')], r = [...document.querySelectorAll('[data-s=r]')]; return l.map((x, i) => { const a = x.getBoundingClientRect(), b = r[i].getBoundingClientRect(); return [Math.abs(a.height - b.height), Math.abs(a.top - b.top), a.height] }) });
    ok(grid.every(([dh, dt, h]) => dh < 1 && dt < 1 && h >= 80), 'pair cells are equal height and aligned (>=80px)', grid);
    await pg.evaluate(() => { NOLISTEN.clear(); document.querySelector('#back').click(); const q = document.querySelector('#lv-q'); q && q.click() });

    // speaking
    ok(await pg.evaluate(() => canSay() && ITEMS('greet').some(p => newKinds(p).includes('sy'))), 'speaking questions are offered when the browser supports speech recognition');
    const sayRun = (heard, err) => pg.evaluate(([h, e]) => { window.__sr = { heard: h, err: e }; const p = ALL.find(x => x.tr == 'Teşekkür ederim'); document.body.classList.add('focus'); run({ qs: [mkQ('sy', p, ALL)], hearts: 0, strict: 0, pass: 0, after() {}, exit() {} }) }, [heard, err]);
    await sayRun(['teşekkür ederim']); ok(await pg.locator('#mic').count() == 1 && await pg.locator('#ns').count() == 1, 'speaking screen: mic + Can\'t speak button');
    await pg.screenshot({ path: `/tmp/claude-0/shots/say-${lang}.png` });
    await pg.click('#mic'); ok(await sheet() == 'ok', 'correct speech accepted'); 
    await sayRun(['tesekkur ederim']); await pg.click('#mic'); ok(await sheet() == 'ok', 'speech recogniser spelling differences accepted');
    await sayRun(['merhaba']); await pg.click('#mic'); await pg.waitForFunction(() => /ا|Not quite|حاول/.test(document.querySelector('#heard').textContent)); ok(true, 'first wrong attempt: try again');
    await pg.click('#mic'); ok(await sheet() == 'no', 'second wrong attempt counted wrong');
    /* microphone permission: re-checked before every speaking question */
    await pg.evaluate(() => { __mic.state = 'denied'; __mic.asks = 0 });
    await sayRun(['teşekkür ederim']); await pg.waitForFunction(() => /microphone|الميكروفون/i.test(document.querySelector('#heard').textContent));
    ok(await pg.evaluate(() => __mic.asks >= 1 && !NOSPEAK), 'denied microphone: permission requested again + instructions shown (speaking stays on)');
    await pg.click('#mic'); const asks2 = await pg.evaluate(() => __mic.asks); ok(asks2 >= 2 && await pg.locator('.mic.on').count() == 0, 'tapping the mic asks again while it is blocked', asks2);
    await pg.evaluate(() => { __mic.state = 'prompt' }); await pg.evaluate(() => { document.querySelector('#back').click(); const q = document.querySelector('#lv-q'); q && q.click() });
    await sayRun(['teşekkür ederim']); await pg.waitForTimeout(300); await pg.click('#mic'); ok(await sheet() == 'ok', 'after the user allows it, speaking works again');
    await pg.evaluate(() => { __mic.state = 'granted' });
    await sayRun(['x'], 'not-allowed'); await pg.click('#mic'); await pg.waitForFunction(() => /microphone|الميكروفون/i.test(document.querySelector('#heard').textContent)); ok(await pg.evaluate(() => !NOSPEAK), 'recognizer not-allowed: shows how to enable the mic, speaking not switched off');
    await pg.evaluate(() => { NOSPEAK = false; const b = document.querySelector('#back'); b && b.click(); const q = document.querySelector('#lv-q'); q && q.click() });
    await sayRun(['x'], 'network'); await pg.click('#mic'); await pg.waitForFunction(() => NOSPEAK === true); ok(true, 'unavailable speech service turns speaking exercises off');
    await pg.evaluate(() => { NOSPEAK = false; document.querySelector('#back') && document.querySelector('#back').click(); const q = document.querySelector('#lv-q'); q && q.click() });
    await sayRun(['teşekkür ederim']); await pg.click('#ns'); await pg.click('#sk-yes'); ok(await pg.evaluate(() => NOSPEAK), "Can't speak now → Skip turns speaking off");
    await pg.evaluate(() => { NOSPEAK = false });
    /* ---- unit scoping, unit exam, locking, Turkish voice, first-launch mic ---- */
    console.log('  -- unit exam / scoping / voice --');
    const sc = await pg.evaluate(() => { const bad = []; UNITS.forEach(u => { const own = new Set(ITEMS(u.id).map(p => p.tr)), ownT = new Set(ITEMS(u.id).map(p => p.tr));
      [1, 2, 3, 4, 5].forEach(L => levelQs(u, L).forEach(q => { (q.trs || []).forEach(t => { if (!own.has(t)) bad.push(u.id + L + ' word ' + t) });
        if (q.k == 'match') q.pairs.forEach(p => { if (!own.has(p.tr)) bad.push(u.id + ' pair ' + p.tr) });
        if (q.popts) q.popts.forEach(o => { if (!ITEMS(u.id).some(p => p.tr == o.l || bt(p) == o.l || PIC[p.tr] == o.e)) bad.push(u.id + ' pic ' + o.l) });
        if (q.optsList) q.optsList.forEach(o => { if (![...own].some(t => norm(t).split(' ').includes(norm(o)) || norm(t) == norm(o))) bad.push(u.id + ' ccopt ' + o) }) })) }); return bad.filter(x => !/quiz_/.test(x)) });
    ok(sc.length == 0, 'every question stays inside its own unit vocabulary', sc.slice(0, 6));
    const ex = await pg.evaluate(() => UNITS.map(u => { const qs = unitExamQs(u), cnt = {}; qs.forEach(q => (q.trs || []).forEach(t => { cnt[t] = (cnt[t] || 0) + 1 })); const its = ITEMS(u.id);
      return { id: u.id, miss: its.filter(p => !(cnt[p.tr] >= 2)).map(p => p.tr), over: its.filter(p => cnt[p.tr] > 3).map(p => p.tr) } }).filter(x => x.miss.length || x.over.length));
    ok(ex.length == 0, 'unit exam covers every word with 2-3 questions each', ex.slice(0, 3));
    await pg.evaluate(() => { S.prog = {}; save(); home() });
    const lk = await pg.evaluate(() => { const bs = [...document.querySelectorAll('.bub[data-i]')]; bs[1].click(); return { unit: !!document.querySelectorAll('.lvr').length > 0, toast: !!document.querySelector('.toast') } });
    ok(!lk.unit && lk.toast, 'next unit is locked until the unit exam is passed', lk);
    await pg.evaluate(() => { S.prog[UNITS[0].id] = 5; save(); home() });
    ok(await pg.evaluate(() => { document.querySelectorAll('.toast').forEach(t => t.remove()); document.querySelectorAll('.bub[data-i]')[1].click(); return document.querySelectorAll('.lvr').length > 0 }), 'passing the exam (stage 5) unlocks the next unit');
    ok(await pg.evaluate(() => { const o = []; run({ unit: UNITS[0].id, exam: true, qs: levelQs(UNITS[0], 5), hearts: 1, strict: 1, pass: 90, after() {}, exit() {} }); return true }), 'exam runs');
    await pg.evaluate(() => { document.querySelector('#back').click(); const q = document.querySelector('#lv-q'); q && q.click() });
    /* Turkish voice only */
    const tts = await pg.evaluate(async () => { const said = []; const V = [{ name: 'English', lang: 'en-US', localService: true }, { name: 'Turkish', lang: 'tr-TR', localService: true }];
      window.SpeechSynthesisUtterance = function (t) { this.text = t }; Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => V.slice(), cancel() {}, speak(u) { said.push({ t: u.text, v: u.voice && u.voice.lang }) }, addEventListener() {} }, configurable: true });
      _noteShown = false; speak('iyi akşamlar'); await new Promise(r => setTimeout(r, 200)); const a = said.filter(x => x.t == 'iyi akşamlar'); V.splice(1, 1); said.length = 0; speak('iyi akşamlar'); await new Promise(r => setTimeout(r, 1800)); return { a, b: said.filter(x => x.t == 'iyi akşamlar'), none: noTrVoice(), toast: !!document.querySelector('.toast'), ns: _noteShown, tc: document.querySelectorAll('.toast').length } });
    ok(tts.a.length == 1 && tts.a[0].v == 'tr-TR', 'speech uses the Turkish voice when available', tts.a);
    ok(tts.b.length == 0 && tts.none && tts.ns, 'with no Turkish voice nothing is spoken (no English fallback) and a notice is shown', tts);
    /* first launch mic prompt */
    const fr = await pg.evaluate(async () => { localStorage.removeItem('tri_mic_asked'); __mic.state = 'prompt'; __mic.asks = 0; await micFirstRun(); const first = __mic.asks; __mic.state = 'prompt'; await micFirstRun(); return { first, second: __mic.asks } });
    ok(fr.first == 1 && fr.second == 1, 'microphone permission asked once on first launch of a device', fr);
    await pg.evaluate(() => logout().catch(()=>{})).catch(() => {}); await pg.evaluate(() => fetch('/api/logout', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })); await pg.evaluate(() => localStorage.clear());
  }
  ok(!errs.length, 'no JS errors', errs.slice(0, 3));
  await b.close(); srv.kill(); console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
