/* API tests – no dependencies:  node --test tests/api.test.js */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');

const PORT = 3900 + Math.floor(Math.random() * 90), BASE = `http://127.0.0.1:${PORT}`;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tri-'));
let proc;
before(async () => {
  proc = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT, HOST: '127.0.0.1', DATA_DIR: dir }, stdio: 'pipe' });
  for (let i = 0; i < 50; i++) { try { await fetch(BASE + '/'); return; } catch (e) { await new Promise(r => setTimeout(r, 100)); } }
  throw new Error('server did not start');
});
after(() => { proc && proc.kill(); });

/* tiny client with its own cookie jar = one "device" */
function device() {
  let cookie = '';
  return async (method, url, body, headers = {}) => {
    const r = await fetch(BASE + url, { method, headers: { ...(method !== 'GET' ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
    const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0].endsWith('=') ? '' : sc.split(';')[0];
    let j = {}; try { j = await r.json(); } catch (e) {}
    return { s: r.status, j, h: r.headers };
  };
}

test('static: app files served, everything else (server.js, data) is not', async () => {
  for (const p of ['/', '/index.html', '/js/app.js', '/js/auth.js', '/style.css', '/sw.js']) assert.equal((await fetch(BASE + p)).status, 200, p);
  for (const p of ['/server.js', '/package.json', '/data/db.json', '/tests/api.test.js', '/js/../server.js', '/%2e%2e/server.js', '/js/%2e%2e/server.js', '/.git/config'])
    assert.equal((await fetch(BASE + p)).status, 404, p);
});

test('register, session cookie, /me, logout', async () => {
  const d = device();
  assert.equal((await d('GET', '/api/me')).s, 401);
  const r = await d('POST', '/api/register', { username: 'Ali_1', password: 'secret1', state: { av: '🐼', lang: 'en', xp: 5, prog: { u1: 2 } } });
  assert.equal(r.s, 200);
  assert.match(r.h.get('set-cookie'), /HttpOnly/); assert.match(r.h.get('set-cookie'), /SameSite=Lax/);
  assert.equal(r.j.state.xp, 5); assert.equal(r.j.state.av, '🐼'); assert.equal(r.j.state.name, 'Ali_1');
  const me = await d('GET', '/api/me'); assert.equal(me.s, 200); assert.equal(me.j.username, 'Ali_1');
  await d('POST', '/api/logout', {}); assert.equal((await d('GET', '/api/me')).s, 401);
});

test('validation: usernames, passwords, duplicates (case-insensitive), junk bodies', async () => {
  const d = device();
  assert.equal((await d('POST', '/api/register', { username: 'a', password: 'secret1' })).j.error, 'bad_username');
  assert.equal((await d('POST', '/api/register', { username: 'bad name', password: 'secret1' })).j.error, 'bad_username');
  assert.equal((await d('POST', '/api/register', { username: 'okname', password: '123' })).j.error, 'bad_password');
  assert.equal((await d('POST', '/api/register', { username: 'dupe', password: 'secret1' })).s, 200);
  assert.equal((await device()('POST', '/api/register', { username: 'DUPE', password: 'secret1' })).j.error, 'taken');
  assert.equal((await device()('POST', '/api/register', { username: '__proto__', password: 'secret1' })).j.error, 'bad_username');
  assert.equal((await device()('POST', '/api/register', { username: 'constructor', password: 'secret1' })).j.error, 'bad_username');
  const x = device();
  assert.equal((await x('POST', '/api/login', { username: 'constructor', password: 'x' })).s, 401);
  const raw = await fetch(BASE + '/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{nope' }); assert.equal(raw.status, 400);
  const txt = await fetch(BASE + '/api/login', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' }); assert.equal(txt.status, 415);
});

test('login: wrong password rejected, right one accepted (case-insensitive name); hash stored, not password', async () => {
  const d = device();
  await d('POST', '/api/register', { username: 'Zed', password: 'hunter22' });
  const e = device();
  assert.equal((await e('POST', '/api/login', { username: 'zed', password: 'wrong!!' })).j.error, 'bad_credentials');
  assert.equal((await e('POST', '/api/login', { username: 'ZED', password: 'hunter22' })).s, 200);
  await new Promise(r => setTimeout(r, 400));
  const raw = fs.readFileSync(path.join(dir, 'db.json'), 'utf8');
  assert.ok(!raw.includes('hunter22')); assert.match(raw, /scrypt\$/);
});

test('brute force: locked out after repeated failures, even with the right password', async () => {
  const d = device(); await d('POST', '/api/register', { username: 'victim', password: 'rightpass' });
  const e = device(); let last;
  for (let i = 0; i < 9; i++) last = await e('POST', '/api/login', { username: 'victim', password: 'bad' + i });
  assert.equal(last.s, 429);
  assert.equal((await e('POST', '/api/login', { username: 'victim', password: 'rightpass' })).s, 429);
});

test('cross-origin writes are refused', async () => {
  const d = device();
  const r = await d('POST', '/api/register', { username: 'evil1', password: 'secret1' }, { origin: 'http://evil.example' });
  assert.equal(r.s, 403);
});

test('sync between two devices: plain save, merge, no lost progress', async () => {
  const a = device(), b = device();
  const reg = await a('POST', '/api/register', { username: 'sync1', password: 'secret1' });
  const login = await b('POST', '/api/login', { username: 'sync1', password: 'secret1' });
  assert.equal(login.j.rev, reg.j.rev);
  // device A saves
  const s1 = await a('PUT', '/api/progress', { baseRev: reg.j.rev, baseEpoch: reg.j.epoch, state: { ...reg.j.state, xp: 30, prog: { u1: 3 }, w: { merhaba: 6 } } });
  assert.equal(s1.s, 200); assert.equal(s1.j.merged, false);
  // device B (still on the old revision) saves different progress → merged
  const s2 = await b('PUT', '/api/progress', { baseRev: login.j.rev, baseEpoch: login.j.epoch, state: { ...login.j.state, xp: 20, prog: { u1: 1, u2: 2 }, w: { selam: 6 } } });
  assert.equal(s2.j.merged, true);
  assert.equal(s2.j.state.xp, 30); assert.deepEqual(s2.j.state.prog, { u1: 3, u2: 2 }); assert.deepEqual(s2.j.state.w, { merhaba: 6, selam: 6 });
  // A pulls and sees everything
  const me = await a('GET', '/api/me'); assert.equal(me.j.state.prog.u2, 2); assert.equal(me.j.rev, s2.j.rev);
});

test('reset on one device is not undone by a stale device', async () => {
  const a = device(), b = device();
  const reg = await a('POST', '/api/register', { username: 'reset1', password: 'secret1', state: { xp: 100, prog: { u1: 5 } } });
  const lb = await b('POST', '/api/login', { username: 'reset1', password: 'secret1' });
  const r = await a('PUT', '/api/progress', { baseRev: reg.j.rev, baseEpoch: reg.j.epoch, reset: true, state: { xp: 0 } });
  assert.equal(r.j.state.xp, 0); assert.equal(r.j.epoch, reg.j.epoch + 1);
  const stale = await b('PUT', '/api/progress', { baseRev: lb.j.rev, baseEpoch: lb.j.epoch, state: { ...lb.j.state, xp: 120 } });
  assert.equal(stale.j.adopted, true); assert.equal(stale.j.state.xp, 0);
});

test('state is sanitised (types, ranges, prototype keys, size)', async () => {
  const a = device(); const reg = await a('POST', '/api/register', { username: 'clean1', password: 'secret1' });
  const evil = JSON.parse('{"xp":"lots","streak":-5,"lang":"<script>","av":"xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx","tab":"hack","prog":{"__proto__":{"x":1},"u1":99,"u2":"a"},"w":{"a":1e99},"extra":"nope"}');
  const r = await a('PUT', '/api/progress', { baseRev: reg.j.rev, baseEpoch: reg.j.epoch, state: evil });
  const st = r.j.state;
  assert.equal(st.xp, 0); assert.equal(st.streak, 0); assert.equal(st.lang, 'ar'); assert.equal(st.tab, 'learn'); assert.equal(st.prog.u1, 5); assert.equal(st.prog.u2, undefined); assert.equal(st.w.a, 40); assert.equal(st.extra, undefined);
  assert.equal(({}).x, undefined);
  const big = await fetch(BASE + '/api/progress', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ pad: 'x'.repeat(300000) }) });
  assert.ok([401, 413].includes(big.status));
});

test('change password: old one stops working, other devices signed out, this one stays in', async () => {
  const a = device(), b = device();
  await a('POST', '/api/register', { username: 'pw1', password: 'oldpass1' });
  await b('POST', '/api/login', { username: 'pw1', password: 'oldpass1' });
  assert.equal((await a('POST', '/api/password', { oldPassword: 'nope!!', newPassword: 'newpass1' })).s, 401);
  assert.equal((await a('POST', '/api/password', { oldPassword: 'oldpass1', newPassword: 'newpass1' })).s, 200);
  assert.equal((await a('GET', '/api/me')).s, 200); assert.equal((await b('GET', '/api/me')).s, 401);
  assert.equal((await device()('POST', '/api/login', { username: 'pw1', password: 'oldpass1' })).s, 401);
  assert.equal((await device()('POST', '/api/login', { username: 'pw1', password: 'newpass1' })).s, 200);
});

test('data survives a server restart (sessions too)', async () => {
  const d = device(); await d('POST', '/api/register', { username: 'persist1', password: 'secret1', state: { xp: 77 } });
  proc.kill(); await new Promise(r => proc.once('exit', r));
  proc = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT, HOST: '127.0.0.1', DATA_DIR: dir }, stdio: 'pipe' });
  for (let i = 0; i < 50; i++) { try { await fetch(BASE + '/'); break; } catch (e) { await new Promise(r => setTimeout(r, 100)); } }
  const me = await d('GET', '/api/me'); assert.equal(me.s, 200); assert.equal(me.j.state.xp, 77);
});

test('behind a proxy (TRUST_PROXY=1): forwarded host is accepted as same-origin, https cookie gets Secure', async () => {
  const p2 = PORT + 100;
  const pr = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT: p2, HOST: '127.0.0.1', DATA_DIR: fs.mkdtempSync(path.join(os.tmpdir(), 'tri-')), TRUST_PROXY: '1' }, stdio: 'pipe' });
  try {
    for (let i = 0; i < 50; i++) { try { await fetch(`http://127.0.0.1:${p2}/`); break; } catch (e) { await new Promise(r => setTimeout(r, 100)); } }
    const post = (h) => fetch(`http://127.0.0.1:${p2}/api/register`, { method: 'POST', headers: { 'content-type': 'application/json', ...h }, body: JSON.stringify({ username: 'proxy1', password: 'secret1' }) });
    assert.equal((await post({ origin: 'https://pc.tail1234.ts.net' })).status, 403);
    const ok = await post({ origin: 'https://pc.tail1234.ts.net', 'x-forwarded-host': 'pc.tail1234.ts.net', 'x-forwarded-proto': 'https' });
    assert.equal(ok.status, 200); assert.match(ok.headers.get('set-cookie'), /Secure/);
  } finally { pr.kill(); }
});
