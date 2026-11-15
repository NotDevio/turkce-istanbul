'use strict';
/* Web Push (RFC 8030 + VAPID RFC 8292 + message encryption RFC 8291), no dependencies.
   Used for "your streak is about to end" reminders. The scheduler runs inside server.js. */
const crypto = require('crypto');
const b64u = b => Buffer.from(b).toString('base64url'), unb64u = s => Buffer.from(String(s), 'base64url');

/* ---------- VAPID keys (generated once, kept in the database file) ---------- */
let vapid = null, privKey = null, pubRaw = null;
function init(db) {
  if (!db.vapid) {
    const { privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
    const j = privateKey.export({ format: 'jwk' }); db.vapid = { x: j.x, y: j.y, d: j.d }; db.vapidNew = true;
  }
  vapid = db.vapid;
  privKey = crypto.createPrivateKey({ key: { kty: 'EC', crv: 'P-256', ...vapid }, format: 'jwk' });
  pubRaw = Buffer.concat([Buffer.from([4]), unb64u(vapid.x), unb64u(vapid.y)]);
}
const publicKey = () => b64u(pubRaw);

function vapidHeader(endpoint, subject, now = Date.now()) {
  const enc = o => b64u(JSON.stringify(o));
  const unsigned = enc({ typ: 'JWT', alg: 'ES256' }) + '.' + enc({ aud: new URL(endpoint).origin, exp: Math.floor(now / 1000) + 12 * 3600, sub: subject });
  const sig = crypto.sign('sha256', Buffer.from(unsigned), { key: privKey, dsaEncoding: 'ieee-p1363' });
  return `vapid t=${unsigned}.${b64u(sig)}, k=${publicKey()}`;
}

/* ---------- message encryption: aes128gcm (RFC 8291) ---------- */
function encrypt(payload, p256dh, auth, opt = {}) {
  const uaPub = unb64u(p256dh), authSecret = unb64u(auth);
  const ecdh = crypto.createECDH('prime256v1');
  opt.asPrivate ? ecdh.setPrivateKey(unb64u(opt.asPrivate)) : ecdh.generateKeys();
  const asPub = ecdh.getPublicKey(), secret = ecdh.computeSecret(uaPub), salt = opt.salt ? unb64u(opt.salt) : crypto.randomBytes(16);
  const hk = (s, ikm, info, len) => Buffer.from(crypto.hkdfSync('sha256', ikm, s, info, len));
  const ikm = hk(authSecret, secret, Buffer.concat([Buffer.from('WebPush: info\0'), uaPub, asPub]), 32);
  const cek = hk(salt, ikm, Buffer.from('Content-Encoding: aes128gcm\0'), 16), nonce = hk(salt, ikm, Buffer.from('Content-Encoding: nonce\0'), 12);
  const c = crypto.createCipheriv('aes-128-gcm', cek, nonce);
  const ct = Buffer.concat([c.update(Buffer.concat([Buffer.from(payload), Buffer.from([2])])), c.final(), c.getAuthTag()]);
  const head = Buffer.alloc(21); salt.copy(head, 0); head.writeUInt32BE(4096, 16); head[20] = asPub.length;
  return Buffer.concat([head, asPub, ct]);
}

/* ---------- subscriptions ---------- */
const HOST_OK = /(^|\.)(googleapis\.com|push\.services\.mozilla\.com|push\.apple\.com|notify\.windows\.com)$/;
function endpointOk(ep) {   // the server will POST to this URL, so only known push services are allowed (no SSRF)
  let u; try { u = new URL(ep); } catch (e) { return false; }
  if (process.env.PUSH_ALLOW_LOCAL === '1' && u.protocol === 'http:' && (u.hostname === '127.0.0.1' || u.hostname === 'localhost')) return true;
  return u.protocol === 'https:' && !u.port && HOST_OK.test(u.hostname) && ep.length < 1000;
}
const tzOk = tz => { try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return typeof tz === 'string' && tz.length < 64; } catch (e) { return false; } };
function cleanSub(s, tz) {
  if (!s || typeof s !== 'object' || typeof s.endpoint !== 'string' || !endpointOk(s.endpoint) || !s.keys) return null;
  if (unb64u(s.keys.p256dh).length !== 65 || unb64u(s.keys.auth).length !== 16 || !tzOk(tz)) return null;
  return { endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth }, tz, created: Date.now(), sent: null };
}

async function send(sub, message, { ttl = 1800, subject = process.env.VAPID_SUBJECT || 'mailto:turkce-istanbul@example.com' } = {}) {
  const body = encrypt(JSON.stringify(message), sub.keys.p256dh, sub.keys.auth);
  try {
    const r = await fetch(sub.endpoint, { method: 'POST', body, signal: AbortSignal.timeout(10000),
      headers: { 'content-encoding': 'aes128gcm', 'content-type': 'application/octet-stream', ttl: String(ttl), urgency: 'high', authorization: vapidHeader(sub.endpoint, subject) } });
    if (r.status === 404 || r.status === 410) return 'gone';
    return r.ok ? 'ok' : 'error';
  } catch (e) { return 'error'; }
}

/* ---------- "streak at risk" logic (day = calendar day in the device's own time zone) ---------- */
const SLOTS = [20 * 60, 22 * 60, 23 * 60 + 30], WINDOW = 25;   // default reminders at 20:00, 22:00, 23:30 local time
/* the learner can move the first reminder (state.rem, minutes after midnight); follow-ups come 2 h later and at 23:30 when there is room */
function slotsFor(rem) {
  if (!Number.isInteger(rem) || rem < 0 || rem > 1439 || rem === SLOTS[0]) return SLOTS;
  const out = [rem];
  if (rem + 120 <= 23 * 60) out.push(rem + 120);
  if (SLOTS[2] >= out[out.length - 1] + 60) out.push(SLOTS[2]);
  return out;
}
function parts(tz, t) { return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(t).reduce((o, x) => (o[x.type] = x.value, o), {}); }
const fmt = p => `${p.weekday} ${p.month} ${p.day} ${p.year}`;      // same text as JavaScript's Date.toDateString()
function days(tz, t) {                                              // { today, yesterday, minutes }
  const p = parts(tz, t), mon = new Date(`${p.month} 1 2000`).getMonth();
  const y = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }).formatToParts(Date.UTC(+p.year, mon, +p.day - 1)).reduce((o, x) => (o[x.type] = x.value, o), {});
  return { today: fmt(p), yesterday: fmt(y), minutes: +p.hour * 60 + +p.minute };
}
const atRisk = (st, d) => !!st && st.streak > 0 && st.last === d.yesterday;   // did a lesson yesterday, none yet today

const TXT = {
  en: [['🔥 Keep your streak going!', n => `Your ${n}-day streak is waiting. Do a quick lesson today.`],
       ['⏰ Your streak is at risk', n => `Only a few hours left to save your ${n}-day streak.`],
       ['🚨 30 minutes left!', n => `Your ${n}-day streak ends at midnight. One short lesson saves it.`]],
  ar: [['🔥 حافظ على سلسلتك!', n => `سلسلتك ${n} يوم بانتظارك. أنجز درساً قصيراً اليوم.`],
       ['⏰ سلسلتك في خطر', n => `بقيت ساعات قليلة لإنقاذ سلسلتك ${n} يوم.`],
       ['🚨 بقي ٣٠ دقيقة!', n => `ستنتهي سلسلتك ${n} يوم عند منتصف الليل. درس قصير ينقذها.`]],
};
const message = (lang, slot, n) => { const [t, b] = (TXT[lang] || TXT.en)[slot]; return { title: t, body: b(n), tag: 'streak' }; };
const WELCOME = { en: ['🔔 Reminders are on', "We'll remind you in the evening if your streak is at risk."], ar: ['🔔 تم تفعيل التذكيرات', 'سنذكّرك مساءً إذا كانت سلسلتك في خطر.'] };
const welcome = lang => { const [t, b] = WELCOME[lang] || WELCOME.en; return { title: t, body: b, tag: 'welcome' }; };

/* one pass over all users; call every minute. `now` is injectable for tests. */
async function tick(db, persist, now = Date.now()) {
  for (const u of Object.values(db.users)) {
    if (!u.push || !u.push.length) continue;
    for (const sub of [...u.push]) {
      const d = days(sub.tz, now);
      if (!atRisk(u.state, d)) continue;
      const slots = slotsFor(u.state && u.state.rem), slot = slots.findIndex(s => d.minutes >= s && d.minutes < s + WINDOW);
      if (slot < 0) continue;
      const msg = slot === 0 ? 0 : slots[slot] === SLOTS[2] ? 2 : 1;   // first = nudge, 23:30 = "30 minutes left", otherwise the middle text
      if (!sub.sent || sub.sent.day !== d.today) sub.sent = { day: d.today, slots: [] };
      if (sub.sent.slots.includes(slot)) continue;
      sub.sent.slots.push(slot); persist();
      if (await send(sub, message(u.state.lang, msg, u.state.streak)) === 'gone') { u.push = u.push.filter(s => s !== sub); persist(); }
    }
  }
}

module.exports = { slotsFor, init, publicKey, vapidHeader, encrypt, cleanSub, endpointOk, send, tick, days, atRisk, message, welcome, SLOTS };
