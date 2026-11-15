/* Streak reminders (Web Push):  node --test tests/push.test.js */
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto'), http = require('node:http'), fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { spawn, execFileSync } = require('node:child_process');
process.env.PUSH_ALLOW_LOCAL = '1';
const push = require('../push.js');
const b64u = b => Buffer.from(b).toString('base64url'), unb64u = s => Buffer.from(s, 'base64url');

/* ---- a fake browser push service + receiver that decrypts like a real browser would ---- */
function newDevice() { const e = crypto.createECDH('prime256v1'); e.generateKeys(); return { ecdh: e, p256dh: b64u(e.getPublicKey()), auth: b64u(crypto.randomBytes(16)) }; }
function decrypt(dev, body) {
  const salt = body.subarray(0, 16), idlen = body[20], asPub = body.subarray(21, 21 + idlen), ct = body.subarray(21 + idlen);
  const hk = (s, ikm, info, len) => Buffer.from(crypto.hkdfSync('sha256', ikm, s, info, len));
  const ikm = hk(unb64u(dev.auth), dev.ecdh.computeSecret(asPub), Buffer.concat([Buffer.from('WebPush: info\0'), dev.ecdh.getPublicKey(), asPub]), 32);
  const d = crypto.createDecipheriv('aes-128-gcm', hk(salt, ikm, Buffer.from('Content-Encoding: aes128gcm\0'), 16), hk(salt, ikm, Buffer.from('Content-Encoding: nonce\0'), 12));
  d.setAuthTag(ct.subarray(ct.length - 16));
  const pt = Buffer.concat([d.update(ct.subarray(0, ct.length - 16)), d.final()]);
  let i = pt.length - 1; while (pt[i] === 0) i--; assert.equal(pt[i], 2, 'padding delimiter');
  return JSON.parse(pt.subarray(0, i).toString());
}
let svc, got = [], reply = 201, svcPort;
before(async () => { svc = http.createServer((q, r) => { const c = []; q.on('data', x => c.push(x)); q.on('end', () => { got.push({ headers: q.headers, body: Buffer.concat(c), url: q.url }); r.writeHead(reply); r.end(); }); }); await new Promise(r => svc.listen(0, '127.0.0.1', r)); svcPort = svc.address().port; });
after(() => svc.close());

const db0 = { users: {} }; push.init(db0);
test('encryption reproduces the RFC 8291 test vector byte for byte', () => {
  const body = push.encrypt('When I grow up, I want to be a watermelon', 'BCVxsr7N_eNgVRqvHtD0zTZsEc6-VV-JvLexhqUzORcxaOzi6-AYWXvTBHm4bjyPjs7Vd8pZGH6SRpkNtoIAiw4', 'BTBZMqHH6r4Tts7J_aSIgg', { asPrivate: 'yfWPiYE-n46HLnH0KqZOF1fJJU3MYrct3AELtAQ-oRw', salt: 'DGv6ra1nlYgDCS1FRnbzlw' });
  assert.equal(body.toString('base64url'), 'DGv6ra1nlYgDCS1FRnbzlwAAEABBBP4z9KsN6nGRTbVYI_c7VJSPQTBtkgcy27mlmlMoZIIgDll6e3vCYLocInmYWAmS6TlzAC8wEqKK6PBru3jl7A_yl95bQpu6cVPTpK4Mqgkf1CXztLVBSt2Ks3oZwbuwXPXLWyouBWLVWGNWQexSgSxsj_Qulcy4a-fN');
});
test('random-key encryption round-trips (what a browser would decrypt)', () => {
  const dev = newDevice(), msg = { title: 'Hi ✓', body: 'سلسلتك' };
  assert.deepEqual(decrypt(dev, push.encrypt(JSON.stringify(msg), dev.p256dh, dev.auth)), msg);
});
test('VAPID header: valid ES256 signature, correct audience, short expiry', () => {
  const h = push.vapidHeader('https://fcm.googleapis.com/fcm/send/abc', 'mailto:a@b.co'), [, t, k] = h.match(/^vapid t=([^,]+), k=(.+)$/);
  const [hd, pl, sig] = t.split('.'), claims = JSON.parse(unb64u(pl)), pub = unb64u(k);
  assert.equal(k, push.publicKey()); assert.equal(pub.length, 65);
  assert.deepEqual(JSON.parse(unb64u(hd)), { typ: 'JWT', alg: 'ES256' }); assert.equal(claims.aud, 'https://fcm.googleapis.com'); assert.ok(claims.exp - Date.now() / 1000 < 86400);
  const key = crypto.createPublicKey({ key: { kty: 'EC', crv: 'P-256', x: b64u(pub.subarray(1, 33)), y: b64u(pub.subarray(33)) }, format: 'jwk' });
  assert.ok(crypto.verify('sha256', Buffer.from(hd + '.' + pl), { key, dsaEncoding: 'ieee-p1363' }, unb64u(sig)));
});
test('"today"/"yesterday" match JavaScript Date.toDateString() in the device time zone', () => {
  for (const tz of ['Europe/Istanbul', 'America/Los_Angeles', 'Pacific/Auckland', 'Asia/Kolkata', 'Europe/London'])
    for (const t of [Date.UTC(2026, 10, 15, 21, 30), Date.UTC(2026, 2, 8, 9, 59), Date.UTC(2026, 9, 25, 23, 59), Date.UTC(2026, 11, 31, 22, 0), Date.UTC(2027, 0, 1, 0, 1)]) {
      const want = JSON.parse(execFileSync(process.execPath, ['-e', `const t=${t},d=new Date(t),y=new Date(t);y.setDate(y.getDate()-1);console.log(JSON.stringify([d.toDateString(),y.toDateString()]))`], { env: { ...process.env, TZ: tz } }).toString());
      const g = push.days(tz, t); assert.deepEqual([g.today, g.yesterday], want, tz + ' ' + new Date(t).toISOString());
    }
});

/* ---- scheduler ---- */
const subFor = (dev, tz) => ({ endpoint: `http://127.0.0.1:${svcPort}/p/${crypto.randomBytes(3).toString('hex')}`, keys: { p256dh: dev.p256dh, auth: dev.auth }, tz, sent: null });
const wall = (tz, t) => { const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(t).map(x => [x.type, +x.value])); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute); };
const at = (tz, y, m, d, hh, mm) => { const want = Date.UTC(y, m - 1, d, hh, mm); let t = want; for (let i = 0; i < 3; i++) t -= wall(tz, t) - want; return t; };   // the instant when the wall clock in tz reads this time
const mkDb = (tz, lang, streak, lastOffset, nowRef) => { const dev = newDevice(), sub = subFor(dev, tz), d = push.days(tz, nowRef);
  const last = lastOffset === 'today' ? d.today : lastOffset === 'yesterday' ? d.yesterday : 'Mon Jan 05 2026';
  return { dev, sub, db: { users: { u: { state: { streak, last, lang }, push: [sub] } } } }; };
const flush = () => new Promise(r => setTimeout(r, 80));

test('reminders: 3 per evening, only when the streak is at risk, never twice', async () => {
  const tz = 'Europe/Istanbul', T = (h, m) => at(tz, 2026, 11, 15, h, m); let saves = 0; const persist = () => saves++;
  const { dev, db } = mkDb(tz, 'en', 5, 'yesterday', T(12, 0)); got = [];
  for (const [h, m, n] of [[12, 0, 0], [19, 59, 0], [20, 5, 1], [20, 20, 1], [21, 30, 1], [22, 2, 2], [23, 40, 3], [23, 59, 3]]) { await push.tick(db, persist, T(h, m)); await flush(); assert.equal(got.length, n, `${h}:${m}`); }
  const msgs = got.map(g => decrypt(dev, g.body)); assert.ok(msgs[0].title.includes('streak') && msgs[0].body.includes('5-day')); assert.ok(msgs[2].title.includes('30 minutes'));
  assert.equal(got[0].headers['content-encoding'], 'aes128gcm'); assert.match(got[0].headers.authorization, /^vapid t=.+, k=.+$/); assert.ok(+got[0].headers.ttl > 0);
});
test('reminders: Arabic text, other time zones, and the next day starts fresh', async () => {
  const tz = 'America/New_York', T = (d, h, m) => at(tz, 2026, 11, d, h, m);
  const { dev, db } = mkDb(tz, 'ar', 12, 'yesterday', T(15, 12, 0)); got = [];
  await push.tick(db, () => {}, T(15, 20, 3)); await flush(); assert.equal(got.length, 1); assert.match(decrypt(dev, got[0].body).title, /سلسلتك|حافظ/);
  await push.tick(db, () => {}, at('Europe/Istanbul', 2026, 11, 15, 20, 3)); await flush(); assert.equal(got.length, 1, 'wrong zone clock does not fire');
  db.users.u.state.last = push.days(tz, T(16, 12, 0)).yesterday;                   // she studied on the 15th; next evening at risk again
  await push.tick(db, () => {}, T(16, 20, 1)); await flush(); assert.equal(got.length, 2);
});
test('no reminder when: lesson already done today, no streak, or the streak already ended', async () => {
  const tz = 'Europe/Istanbul', now = at(tz, 2026, 11, 15, 22, 5); got = [];
  for (const [streak, last] of [[5, 'today'], [0, 'yesterday'], [5, 'older']]) { const { db } = mkDb(tz, 'en', streak, last, now); await push.tick(db, () => {}, now); }
  await flush(); assert.equal(got.length, 0);
});
test('a dead subscription (410) is removed', async () => {
  const tz = 'Europe/Istanbul', now = at(tz, 2026, 11, 15, 20, 5), { db, sub } = mkDb(tz, 'en', 3, 'yesterday', now); reply = 410;
  await push.tick(db, () => {}, now); reply = 201; assert.equal(db.users.u.push.length, 0); assert.ok(sub);
});

/* ---- HTTP API ---- */
let proc, BASE, dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tri-push-'));
before(async () => { const port = 4100 + Math.floor(Math.random() * 90); BASE = `http://127.0.0.1:${port}`;
  proc = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT: port, HOST: '127.0.0.1', DATA_DIR: dir, PUSH_ALLOW_LOCAL: '1' }, stdio: 'pipe' });
  for (let i = 0; i < 50; i++) { try { await fetch(BASE + '/'); return; } catch (e) { await new Promise(r => setTimeout(r, 100)); } } });
after(() => proc && proc.kill());
const dev = () => { let cookie = ''; return async (m, u, b) => { const r = await fetch(BASE + u, { method: m, headers: { ...(m != 'GET' ? { 'content-type': 'application/json' } : {}), ...(cookie ? { cookie } : {}) }, body: b === undefined ? undefined : JSON.stringify(b) }); const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0]; let j = {}; try { j = await r.json() } catch (e) {} return { s: r.status, j }; }; };

test('API: public key, subscribe (welcome push is delivered), test push, unsubscribe', async () => {
  const k = await dev()('GET', '/api/push/key'); assert.equal(k.s, 200); assert.equal(unb64u(k.j.key).length, 65);
  const d = dev(), udev = newDevice(); await d('POST', '/api/register', { username: 'pusher', password: 'secret1', state: { lang: 'en' } });
  got = []; const ep = `http://127.0.0.1:${svcPort}/api-test`;
  const r = await d('POST', '/api/push/subscribe', { subscription: { endpoint: ep, keys: { p256dh: udev.p256dh, auth: udev.auth } }, tz: 'Europe/Istanbul' }); assert.equal(r.s, 200);
  await new Promise(r => setTimeout(r, 400)); assert.equal(got.length, 1); assert.match(decrypt(udev, got[0].body).title, /Reminders are on/);
  got = []; const t = await d('POST', '/api/push/test', {}); assert.deepEqual([t.j.sent, t.j.devices], [1, 1]); assert.equal(got.length, 1);
  await d('POST', '/api/push/unsubscribe', { endpoint: ep }); got = []; assert.deepEqual((await d('POST', '/api/push/test', {})).j, { sent: 0, devices: 0 }); assert.equal(got.length, 0);
});
test('API: needs login; rejects arbitrary URLs (no server-side request forgery), bad keys and bad time zones', async () => {
  const anon = dev(), udev = newDevice(), keys = { p256dh: udev.p256dh, auth: udev.auth };
  assert.equal((await anon('POST', '/api/push/subscribe', { subscription: { endpoint: 'https://fcm.googleapis.com/x', keys }, tz: 'UTC' })).s, 401);
  const d = dev(); await d('POST', '/api/register', { username: 'pusher2', password: 'secret1' });
  const bad = async (endpoint, k = keys, tz = 'UTC') => (await d('POST', '/api/push/subscribe', { subscription: { endpoint, keys: k }, tz })).s;
  assert.equal(await bad('https://169.254.169.254/latest/meta-data'), 400); assert.equal(await bad('https://evil.example.com/push'), 400);
  assert.equal(await bad('https://fcm.googleapis.com.evil.com/x'), 400); assert.equal(await bad('http://fcm.googleapis.com/x'), 400); assert.equal(await bad('file:///etc/passwd'), 400);
  assert.equal(await bad('https://fcm.googleapis.com/fcm/send/x', { p256dh: 'AAAA', auth: keys.auth }), 400); assert.equal(await bad('https://fcm.googleapis.com/fcm/send/x', keys, 'Not/AZone'), 400);
  assert.equal(await bad('https://fcm.googleapis.com/fcm/send/x'), 200); assert.equal(await bad('https://updates.push.services.mozilla.com/wpush/v2/x'), 200); assert.equal(await bad('https://web.push.apple.com/x'), 200);
});
test('API: static icons for notifications are served', async () => { for (const f of ['icon-192.png', 'icon-512.png']) { const r = await fetch(`${BASE}/${f}`); assert.equal(r.status, 200); assert.equal(r.headers.get('content-type'), 'image/png'); } });
