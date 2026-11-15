/* Browser end-to-end check (needs Playwright):  node tests/e2e.js */
const { chromium } = require('playwright');
const { spawn } = require('child_process'); const fs = require('fs'), os = require('os'), path = require('path');
const PORT = 3800 + Math.floor(Math.random() * 90), URL_ = `http://localhost:${PORT}/`;
let pass = 0, fail = 0; const ok = (c, n, x) => { c ? pass++ : fail++; console.log(c ? '  PASS' : '  FAIL', n, c ? '' : JSON.stringify(x ?? '')); };
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tri-e2e-'));
  const srv = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT, DATA_DIR: dir }, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { await fetch(URL_); break; } catch (e) { await new Promise(r => setTimeout(r, 100)); } }
  const b = await chromium.launch();
  const mk = async (init) => { const ctx = await b.newContext({ viewport: { width: 390, height: 800 } }); await ctx.route(/fonts\.g/, r => r.abort()); await ctx.addInitScript(() => { addEventListener('DOMContentLoaded', () => { new MutationObserver(() => document.querySelectorAll('.leave.place').forEach(x => x.remove())).observe(document.body, { childList: true }); }); }); if (init) await ctx.addInitScript(init); const pg = await ctx.newPage(); pg.errs = []; pg.on('pageerror', e => pg.errs.push(e.message)); pg.on('console', m => { if (m.type() == 'error' && !/fonts|ERR_FAILED|401|ERR_INTERNET_DISCONNECTED/.test(m.text())) pg.errs.push(m.text()); }); pg.on('dialog', d => d.accept()); return { ctx, pg }; };
  const wait = ms => new Promise(r => setTimeout(r, ms));

  console.log('\n== 1. first visit shows login, old on-device progress can be imported ==');
  const seed = `if(!localStorage.getItem('__s')){localStorage.setItem('tri_accounts',JSON.stringify({u1:{id:'u1',name:'Old',av:'🐼',lang:'en',xp:123,streak:2,last:'',prog:{'${'x'}':1},miss:{},exams:{},w:{},tab:'learn'}}));localStorage.setItem('tri_active_user','u1');localStorage.setItem('__s','1')}`;
  let A = await mk(seed); await A.pg.goto(URL_); await A.pg.waitForSelector('.modal.auth');
  ok(await A.pg.locator('#pw').count() == 1, 'login form shown, cannot be closed');
  await A.pg.click('[data-lg="en"]'); await A.pg.click('[data-md="register"]');
  ok(await A.pg.locator('#imp option').count() == 2, 'import option offered', await A.pg.locator('#imp').count());
  await A.pg.fill('#un', 'ab'); await A.pg.fill('#pw', 'secret1'); await A.pg.click('#af .btn');
  ok(/3–20/.test(await A.pg.locator('.err').innerText()), 'short username rejected client-side');
  await A.pg.fill('#un', 'Maria'); await A.pg.selectOption('#imp', '0'); await A.pg.click('#af .btn');
  await A.pg.waitForSelector('.trail');
  ok(await A.pg.locator('#xp').innerText() == '123', 'imported XP shown', await A.pg.locator('#xp').innerText());
  ok(await A.pg.locator('#acc').innerText().then(t => t.includes('Maria')), 'top bar shows username');

  console.log('\n== 2. progress made on device A shows up on device B ==');
  await A.pg.evaluate(() => { S.xp += 40; S.prog.u1 = 2; save(); });
  await wait(2200);
  ok(await A.pg.evaluate(() => !DIRTY && !SYNCING), 'A synced');
  let B = await mk(); await B.pg.goto(URL_); await B.pg.waitForSelector('.modal.auth');
  await B.pg.click('[data-lg="en"]'); await B.pg.fill('#un', 'maria'); await B.pg.fill('#pw', 'wrongpw'); await B.pg.click('#af .btn');
  await B.pg.waitForFunction(() => /Wrong/.test(document.querySelector('.err').textContent));
  ok(true, 'wrong password shows error');
  await B.pg.fill('#pw', 'secret1'); await B.pg.click('#af .btn'); await B.pg.waitForSelector('.trail');
  ok(await B.pg.locator('#xp').innerText() == '163', 'B sees 163 XP', await B.pg.locator('#xp').innerText());
  ok(await B.pg.evaluate(() => S.prog.u1) == 2, 'B sees unit progress');

  console.log('\n== 3. device B earns XP, device A picks it up without reload ==');
  await B.pg.evaluate(() => { S.xp += 7; save(); }); await wait(2000);
  await A.pg.evaluate(() => pull()); await wait(600);
  ok(await A.pg.locator('#xp').innerText() == '170', 'A now 170 XP', await A.pg.locator('#xp').innerText());

  console.log('\n== 4. reload keeps session; app works offline; unsynced progress uploads later ==');
  await A.pg.reload(); await A.pg.waitForSelector('.trail');
  ok(await A.pg.locator('.modal').count() == 0, 'still logged in after reload');
  await A.ctx.setOffline(true);
  await A.pg.evaluate(() => { S.xp += 5; save(); }); await wait(1800);
  ok(await A.pg.evaluate(() => DIRTY), 'offline change kept as pending');
  ok(/⚠/.test(await A.pg.evaluate(() => syncText())), 'status says offline');
  await A.ctx.setOffline(false); await A.pg.evaluate(() => sync()); await wait(800);
  ok(await A.pg.evaluate(() => !DIRTY), 'uploaded after reconnect');
  const me = await (await fetch(URL_ + 'api/me', { headers: { cookie: (await A.ctx.cookies()).map(c => c.name + '=' + c.value).join('; ') } })).json();
  ok(me.state.xp == 175, 'server has 175', me.state.xp);

  console.log('\n== 5. a lesson can be started and profile tab works ==');
  await A.pg.click('.bub.now'); await A.pg.waitForSelector('.lvr'); await A.pg.click('.lvr.cur'); await A.pg.waitForSelector('.q');
  ok(true, 'lesson question screen renders');
  await A.pg.click('#back'); await A.pg.click('#lv-q').catch(() => {}); await A.pg.click('#back').catch(() => {});
  await A.pg.evaluate(() => { S.tab = 'me'; home(); });
  ok(await A.pg.locator('#lo').count() == 1 && await A.pg.locator('#sync').count() == 1, 'profile shows log out + sync status');

  console.log('\n== 6. reset on A is not undone by B ==');
  await A.pg.click('#rs'); await wait(2000);
  await B.pg.evaluate(() => { S.xp += 1; save(); }); await wait(2000);
  ok(await B.pg.evaluate(() => S.xp) == 0, 'B adopted the reset instead of restoring old XP', await B.pg.evaluate(() => S.xp));

  console.log('\n== 7. log out clears the browser copy and returns to login ==');
  await A.pg.evaluate(() => { S.tab = 'me'; home(); }); await A.pg.click('#lo'); await A.pg.waitForSelector('.modal.auth');
  ok(await A.pg.evaluate(() => localStorage.getItem('tri_session')) === null, 'cached progress removed');
  ok(await A.pg.locator('#app').innerText() == '', 'app content hidden');
  await A.pg.reload(); await A.pg.waitForSelector('.modal.auth'); ok(true, 'reload after logout shows login');

  console.log('\n== 9. leaving a lesson asks first ==');
  let C = await mk(); await C.pg.goto(URL_); await C.pg.waitForSelector('.modal.auth'); await C.pg.click('[data-lg="en"]'); await C.pg.click('[data-md="register"]');
  await C.pg.fill('#un', 'Leaver'); await C.pg.fill('#pw', 'secret1'); await C.pg.click('#af .btn'); await C.pg.waitForSelector('.trail');
  await C.pg.click('.bub.now'); await C.pg.waitForSelector('.lvr'); await C.pg.click('.lvr.cur'); await C.pg.waitForSelector('.q');
  await C.pg.click('#back'); await C.pg.waitForSelector('.leave');
  const lv = await C.pg.evaluate(() => { const r = document.querySelector('.lc').getBoundingClientRect(), c = document.querySelector('#lv-c'), q = document.querySelector('#lv-q'), col = e => getComputedStyle(e).backgroundColor;
    return { centered: Math.abs((r.top + r.bottom) / 2 - innerHeight / 2) < 120 && Math.abs((r.left + r.right) / 2 - innerWidth / 2) < 5, cont: c.textContent, quit: q.textContent, cc: col(c), qc: col(q), text: document.querySelector('.lc p').textContent } });
  ok(lv.centered, 'popup is in the middle of the screen', lv);
  ok(/Continue/i.test(lv.cont) && /Quit/i.test(lv.quit) && /progress/i.test(lv.text), 'message + Continue / Quit buttons', lv);
  ok(lv.cc == 'rgb(88, 204, 2)' && lv.qc == 'rgb(255, 75, 75)', 'Continue is green, Quit is red', lv);
  await C.pg.screenshot({ path: '/tmp/claude-0/shots/leave.png' });
  await C.pg.click('#lv-c'); ok(await C.pg.locator('.leave').count() == 0 && await C.pg.locator('.q').count() == 1, 'Continue stays in the lesson');
  await C.pg.click('#back'); await C.pg.click('#lv-q'); await C.pg.waitForSelector('.lvr'); ok(await C.pg.locator('.leave').count() == 0 && await C.pg.locator('.q').count() == 0, 'Quit leaves the lesson');

  console.log('\n== 10. streak: a day is midnight to midnight ==');
  const st = await C.pg.evaluate(() => { const r = {}, set = (last, streak) => { S.last = last; S.streak = streak; head() };
    set(dstr(0), 5); r.today = [curStreak(), $('#streak').textContent, $('.fl').classList.contains('off')];
    set(dstr(-1), 5); r.yest = [curStreak(), $('#streak').textContent, $('.fl').classList.contains('off')];
    set(dstr(-2), 5); r.old = [curStreak(), $('#streak').textContent, $('.fl').classList.contains('off')];
    S.last = dstr(-1); S.streak = 5; bump(); r.cont = [S.streak, S.last == dstr(0)]; S.last = dstr(-2); S.streak = 5; bump(); r.restart = [S.streak, S.last == dstr(0)]; return r });
  ok(st.today[0] == 5 && st.today[1] == '5' && !st.today[2], 'lesson done today: streak shown, flame lit', st.today);
  ok(st.yest[0] == 5 && st.yest[2], 'no lesson yet today: streak still alive but flame greyed', st.yest);
  ok(st.old[0] == 0 && st.old[1] == '0', 'a whole day missed: streak is 0', st.old);
  ok(st.cont[0] == 6 && st.cont[1] && st.restart[0] == 1, 'next lesson continues (+1) or restarts at 1', st);

  console.log('\n== 11. midnight rollover while the app is open (fake clock) ==');
  const D = await b.newContext({ viewport: { width: 390, height: 800 } }); await D.route(/fonts\.g/, r => r.abort()); const dp = await D.newPage(); dp.on('dialog', d => d.accept());
  await dp.clock.install({ time: new Date(2026, 10, 15, 23, 59, 40) });
  await dp.goto(URL_); await dp.waitForSelector('.modal.auth'); await dp.click('[data-lg="en"]'); await dp.click('[data-md="register"]'); await dp.fill('#un', 'Midnight'); await dp.fill('#pw', 'secret1'); await dp.click('#af .btn'); await dp.waitForSelector('.trail');
  await dp.evaluate(() => { S.streak = 7; S.last = dstr(0); head() });
  ok(await dp.locator('#streak').innerText() == '7' && !(await dp.evaluate(() => $('.fl').classList.contains('off'))), '23:59:40 — lesson done today, streak 7, flame lit');
  await dp.clock.fastForward(30000);
  ok(await dp.locator('#streak').innerText() == '7' && await dp.evaluate(() => $('.fl').classList.contains('off') && dstr(0) != S.last), '00:00:10 — new day: streak still 7 but flame greyed (not done today)');
  await dp.clock.fastForward(24 * 3600 * 1000);
  ok(await dp.locator('#streak').innerText() == '0', '00:00:10 next day — missed a whole day: streak is 0', await dp.locator('#streak').innerText());

  console.log('\n== 12. reminders section in the profile ==');
  await C.pg.evaluate(() => { Object.defineProperty(Notification, 'permission', { get: () => 'default', configurable: true }) });
  await C.pg.evaluate(() => { S.tab = 'me'; home() }); await C.pg.waitForSelector('#ntf h3');
  const nt = await C.pg.evaluate(() => ({ h: document.querySelector('#ntf h3').textContent, btn: !!document.querySelector('#nt-o'), txt: document.querySelector('#ntf p').textContent }));
  ok(/Streak reminders/.test(nt.h) && nt.btn, 'profile shows "Turn on reminders" (https/localhost, push supported)', nt);
  ok(await C.pg.evaluate(async () => (await api('GET', '/api/push/key')).j.key.length > 80), 'server publishes its push key');
  await C.pg.screenshot({ path: '/tmp/claude-0/shots/profile-notify.png', fullPage: false });

  console.log('\n== 8. no JS or CSP errors ==');
  ok(!A.pg.errs.length && !B.pg.errs.length && !C.pg.errs.length, 'clean console', [...A.pg.errs, ...B.pg.errs, ...C.pg.errs]);

  await b.close(); srv.kill();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
