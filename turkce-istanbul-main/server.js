#!/usr/bin/env node
/* Türkçe İstanbul – local server
   Run:  node server.js        (then open http://localhost:3000)
   No dependencies. Serves the app and stores accounts + progress in data/db.json.

   Environment variables
     PORT=3000            port to listen on
     HOST=0.0.0.0         interface (0.0.0.0 = reachable from other devices on your network, 127.0.0.1 = this computer only)
     DATA_DIR=./data      where db.json is kept
     ALLOW_REGISTER=1     set to 0 to stop new sign-ups (existing users can still log in)
     TRUST_PROXY=0        set to 1 when behind a reverse proxy (HTTPS), so client IP / https are read from X-Forwarded-* headers
     ADMIN_USERS=         comma-separated usernames allowed to open /admin.html (default: the oldest account)
     BACKUP_KEEP=14       how many daily backups of db.json to keep in data/backups
*/
'use strict';
const push = require('./push');
const http = require('http'), fs = require('fs'), os = require('os'), path = require('path'), crypto = require('crypto');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(__dirname, 'data'));
const DB_FILE = path.join(DATA_DIR, 'db.json');
const ALLOW_REGISTER = process.env.ALLOW_REGISTER !== '0';
const TRUST_PROXY = process.env.TRUST_PROXY === '1';
const SESSION_MS = 30 * 24 * 3600e3;
const MAX_BODY = 256 * 1024;
const COOKIE = 'tri_sid';

/* ---------- storage: one JSON file, atomic writes ---------- */
fs.mkdirSync(DATA_DIR, { recursive: true });
let db = { users: {}, sessions: {} };
if (fs.existsSync(DB_FILE)) {
  try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); db.users = db.users || {}; db.sessions = db.sessions || {}; }
  catch (e) { console.error(`Cannot read ${DB_FILE}: ${e.message}\nFix or move the file, then start again (it was NOT overwritten).`); process.exit(1); }
}
let writeTimer = null;
function flush() {
  clearTimeout(writeTimer); writeTimer = null;
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 1)); // pretty-printed so you can read it
  fs.renameSync(tmp, DB_FILE);
}
const persist = () => { if (!writeTimer) writeTimer = setTimeout(flush, 200); };
const hadVapid = !!db.vapid; push.init(db); if (!hadVapid) flush();
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { try { flush(); } catch (e) {} process.exit(0); });
process.on('exit', () => { if (writeTimer) try { flush(); } catch (e) {} });

/* ---------- passwords & sessions ---------- */
const scrypt = (pw, salt) => new Promise((res, rej) => crypto.scrypt(pw, salt, 64, (e, k) => e ? rej(e) : res(k)));
async function hashPw(pw) { const salt = crypto.randomBytes(16); return 'scrypt$' + salt.toString('hex') + '$' + (await scrypt(pw, salt)).toString('hex'); }
async function checkPw(pw, stored) {
  const [alg, s, h] = String(stored).split('$');
  if (alg !== 'scrypt' || !s || !h) return false;
  const got = await scrypt(pw, Buffer.from(s, 'hex')), want = Buffer.from(h, 'hex');
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}
const DUMMY = hashPw('dummy-password'); // so unknown usernames cost the same time as wrong passwords
const sha = t => crypto.createHash('sha256').update(t).digest('hex');
function newSession(userKey) {
  const token = crypto.randomBytes(32).toString('base64url');
  db.sessions[sha(token)] = { user: userKey, exp: Date.now() + SESSION_MS };
  return token;
}
function cleanSessions() { const n = Date.now(); for (const k in db.sessions) if (db.sessions[k].exp < n) delete db.sessions[k]; }
setInterval(() => { cleanSessions(); persist(); }, 3600e3).unref();

/* ---------- learner state: validation + merge ---------- */
const isObj = o => o && typeof o === 'object' && !Array.isArray(o);
const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const clampN = (v, lo, hi, d = 0) => (typeof v === 'number' && Number.isFinite(v)) ? Math.min(hi, Math.max(lo, v)) : d;
function numMap(o, lo, hi) {
  const out = {}; if (!isObj(o)) return out;
  let n = 0;
  for (const k of Object.keys(o)) {
    if (BAD_KEYS.has(k) || k.length > 80 || ++n > 3000) continue;
    if (typeof o[k] === 'number' && Number.isFinite(o[k])) out[k] = clampN(o[k], lo, hi);
  }
  return out;
}
function sanitize(s, username) {
  s = isObj(s) ? s : {};
  return {
    id: username, name: username,
    av: typeof s.av === 'string' && s.av.length <= 8 && s.av ? s.av : '🦊',
    lang: typeof s.lang === 'string' && /^[a-z]{2,3}$/.test(s.lang) ? s.lang : 'ar',
    xp: Math.floor(clampN(s.xp, 0, 1e9)), streak: Math.floor(clampN(s.streak, 0, 1e5)),
    last: typeof s.last === 'string' ? s.last.slice(0, 40) : '',
    prog: numMap(s.prog, 0, 5), miss: numMap(s.miss, 0, 1), exams: numMap(s.exams, 0, 100), w: numMap(s.w, 0, 40),
    tab: ['learn', 'prac', 'exam', 'me'].includes(s.tab) ? s.tab : 'learn',
    /* extras: reminders, goals, shop, badges, spaced repetition, weekly log */
    rem: Math.floor(clampN(s.rem, 0, 1439, 1200)),
    goal: [10, 20, 30].includes(s.goal) ? s.goal : 20,
    th: ['auto', 'light', 'dark'].includes(s.th) ? s.th : 'auto',
    fz: Math.floor(clampN(s.fz, 0, 9)), sp: Math.floor(clampN(s.sp, 0, 1e9)), pl: s.pl ? 1 : 0,
    own: numMap(s.own, 0, 1), bd: numMap(s.bd, 0, 1), sto: numMap(s.sto, 0, 1),
    mc: numMap(s.mc, 0, 999), sr: numMap(s.sr, 0, 1e7),
    dxp: cleanDxp(s.dxp), log: cleanLog(s.log),
  };
}
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
function cleanDxp(o) { return isObj(o) && typeof o.d === 'string' && DAY_RE.test(o.d) ? { d: o.d, xp: Math.floor(clampN(o.xp, 0, 1e6)) } : { d: '', xp: 0 }; }
/* log: { 'YYYY-MM-DD': [xp, seconds, correct answers, answers, new words] } (last 21 days) */
function cleanLog(o) {
  const out = {}; if (!isObj(o)) return out;
  for (const k of Object.keys(o).filter(k => DAY_RE.test(k)).sort().slice(-21)) {
    const a = Array.isArray(o[k]) ? o[k] : [];
    out[k] = [0, 1, 2, 3, 4].map(i => Math.floor(clampN(a[i], 0, i === 1 ? 86400 : 1e6)));
  }
  return out;
}
function mergeLog(a, b) {
  const o = {}; for (const k of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) o[k] = [0, 1, 2, 3, 4].map(i => Math.max((a && a[k] && a[k][i]) || 0, (b && b[k] && b[k][i]) || 0));
  return cleanLog(o);
}
const maxMap = (a, b) => { const o = { ...a }; for (const k of Object.keys(b)) o[k] = Math.max(o[k] || 0, b[k]); return o; };
/* Used when two devices changed progress from the same base: nothing earned is lost.
   (Scores/xp/levels only go up; "mistakes to review" and profile settings come from the device that saved last.) */
function merge(server, inc) {
  const ts = d => Date.parse(d) || 0;
  const newer = ts(inc.last) > ts(server.last) ? inc : ts(inc.last) < ts(server.last) ? server : (inc.streak >= server.streak ? inc : server);
  return {
    ...inc,
    xp: Math.max(server.xp, inc.xp), streak: newer.streak, last: newer.last,
    prog: maxMap(server.prog, inc.prog), w: maxMap(server.w, inc.w), exams: maxMap(server.exams, inc.exams),
    sp: Math.max(server.sp, inc.sp), fz: newer.fz, own: maxMap(server.own, inc.own), bd: maxMap(server.bd, inc.bd), sto: maxMap(server.sto, inc.sto),
    mc: maxMap(server.mc, inc.mc), sr: inc.sr, pl: Math.max(server.pl, inc.pl),
    dxp: server.dxp.d === inc.dxp.d ? (server.dxp.xp > inc.dxp.xp ? server.dxp : inc.dxp) : (server.dxp.d > inc.dxp.d ? server.dxp : inc.dxp),
    log: mergeLog(server.log, inc.log),
  };
}

/* ---------- helpers ---------- */
const ip = req => (TRUST_PROXY && String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()) || req.socket.remoteAddress || '?';
const isHttps = req => !!req.socket.encrypted || (TRUST_PROXY && req.headers['x-forwarded-proto'] === 'https');
function send(res, status, obj, extra = {}) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra });
  res.end(body);
}
const fail = (res, status, error) => send(res, status, { error });
function readJson(req) {
  return new Promise((resolve, reject) => {
    if (!/^application\/json/i.test(req.headers['content-type'] || '')) return reject({ status: 415, error: 'bad_request' });
    let n = 0; const chunks = [];
    req.on('data', c => { n += c.length; if (n > MAX_BODY) { reject({ status: 413, error: 'too_large' }); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { const j = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); isObj(j) ? resolve(j) : reject({ status: 400, error: 'bad_request' }); } catch (e) { reject({ status: 400, error: 'bad_request' }); } });
    req.on('error', () => reject({ status: 400, error: 'bad_request' }));
  });
}
function cookies(req) { const o = {}; String(req.headers.cookie || '').split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = p.slice(i + 1).trim(); }); return o; }
const cookieHdr = (req, token, maxAge) => `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${isHttps(req) ? '; Secure' : ''}`;
function auth(req) {
  const t = cookies(req)[COOKIE]; if (!t) return null;
  const s = db.sessions[sha(t)]; if (!s || s.exp < Date.now()) return null;
  const user = hasUser(s.user) ? db.users[s.user] : null; if (!user) return null;
  if (s.exp - Date.now() < SESSION_MS / 2) { s.exp = Date.now() + SESSION_MS; persist(); } // sliding expiry
  return { user, token: t, hash: sha(t) };
}
/* crude brute-force guard: failed attempts per key within a window */
const hits = new Map();
function limited(key, max, win) { const h = hits.get(key); return !!h && h.reset > Date.now() && h.n >= max; }
function hit(key, win) { const now = Date.now(); let h = hits.get(key); if (!h || h.reset < now) h = { n: 0, reset: now + win }; h.n++; hits.set(key, h); }
setInterval(() => { const n = Date.now(); for (const [k, v] of hits) if (v.reset < n) hits.delete(k); }, 600e3).unref();

const view = u => ({ username: u.username, state: u.state, rev: u.rev, epoch: u.epoch });

/* ---------- admin: who may open /admin.html ---------- */
function adminSet() {
  const env = String(process.env.ADMIN_USERS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  if (env.length) return new Set(env);
  const first = Object.entries(db.users).sort((a, b) => (a[1].created || 0) - (b[1].created || 0))[0];   // default: the oldest account
  return new Set(first ? [first[0]] : []);
}
const isAdmin = u => adminSet().has(u.username.toLowerCase());

/* ---------- daily backup of db.json (data/backups/db-YYYY-MM-DD.json, newest BACKUP_KEEP kept) ---------- */
const BACKUP_DIR = path.join(DATA_DIR, 'backups'), BACKUP_KEEP = Math.max(1, Number(process.env.BACKUP_KEEP) || 14);
const localDay = (t = Date.now()) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function backupNow(force) {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true, mode: 0o700 });
    const file = path.join(BACKUP_DIR, `db-${localDay()}.json`);
    if (!force && fs.existsSync(file)) return null;
    flush();                                                    // make sure db.json on disk is current, then copy it
    const tmp = file + '.tmp'; fs.copyFileSync(DB_FILE, tmp); fs.chmodSync(tmp, 0o600); fs.renameSync(tmp, file);
    const all = fs.readdirSync(BACKUP_DIR).filter(f => /^db-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
    for (const f of all.slice(0, Math.max(0, all.length - BACKUP_KEEP))) fs.unlinkSync(path.join(BACKUP_DIR, f));
    return path.basename(file);
  } catch (e) { console.error('backup failed:', e.message); return null; }
}
const listBackups = () => { try { return fs.readdirSync(BACKUP_DIR).filter(f => /^db-\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort().reverse().map(f => ({ name: f, bytes: fs.statSync(path.join(BACKUP_DIR, f)).size })); } catch (e) { return []; } };

/* ---------- weekly league: XP since Monday, from each learner's daily log ---------- */
function weekStartKey() { const d = new Date(); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return localDay(d.getTime()); }
function leagueRows(me) {
  const from = weekStartKey();
  return Object.values(db.users).map(u => {
    const st = u.state || {}, log = st.log || {};
    const xp = Object.keys(log).filter(k => k >= from).reduce((n, k) => n + (log[k][0] || 0), 0);
    return { u: u.username, av: st.av || '🦊', xp, streak: st.last ? st.streak || 0 : 0, me: u.username === me.username };
  }).filter(r => r.xp > 0 || r.me).sort((a, b) => b.xp - a.xp || a.u.localeCompare(b.u)).slice(0, 20);
}
const USER_RE = /^[A-Za-z0-9_]{3,20}$/;
const hasUser = k => Object.prototype.hasOwnProperty.call(db.users, k);

/* ---------- API ---------- */
async function api(req, res, url) {
  const route = req.method + ' ' + url;
  // CSRF defence in depth (cookie is SameSite=Lax too): cross-site browser requests carry a foreign Origin
  if (req.method !== 'GET') {
    const o = req.headers.origin;
    if (o) {
      let h; try { h = new URL(o).host; } catch (e) {}
      const ok = new Set([req.headers.host]);
      if (TRUST_PROXY && req.headers['x-forwarded-host']) String(req.headers['x-forwarded-host']).split(',').forEach(x => ok.add(x.trim()));
      if (!ok.has(h)) return fail(res, 403, 'forbidden');
    }
  }
  try {
    if (route === 'GET /api/me') {
      const a = auth(req); if (!a) return fail(res, 401, 'unauthorized');
      return send(res, 200, view(a.user));
    }
    if (route === 'POST /api/register') {
      if (!ALLOW_REGISTER) return fail(res, 403, 'register_closed');
      const b = await readJson(req), key = 'reg|' + ip(req);
      if (limited(key, 10, 3600e3)) return fail(res, 429, 'rate_limited');
      const username = String(b.username || '').trim(), password = typeof b.password === 'string' ? b.password : '';
      if (!USER_RE.test(username) || BAD_KEYS.has(username.toLowerCase())) return fail(res, 400, 'bad_username');
      if (password.length < 6 || password.length > 200) return fail(res, 400, 'bad_password');
      const k = username.toLowerCase();
      if (hasUser(k)) return fail(res, 409, 'taken');
      hit(key, 3600e3);
      const u = db.users[k] = { username, pw: await hashPw(password), created: Date.now(), rev: 1, epoch: 1, state: sanitize(b.state, username) };
      const token = newSession(k); flush();
      return send(res, 200, view(u), { 'set-cookie': cookieHdr(req, token, SESSION_MS / 1000) });
    }
    if (route === 'POST /api/login') {
      const b = await readJson(req), username = String(b.username || '').trim().toLowerCase(), password = typeof b.password === 'string' ? b.password.slice(0, 200) : '';
      const k1 = 'login|' + ip(req) + '|' + username, k2 = 'login|' + ip(req);
      if (limited(k1, 8, 900e3) || limited(k2, 60, 900e3)) return fail(res, 429, 'rate_limited');
      const u = hasUser(username) ? db.users[username] : null;
      const good = u ? await checkPw(password, u.pw) : (await checkPw(password, await DUMMY), false);
      if (!good) { hit(k1, 900e3); hit(k2, 900e3); return fail(res, 401, 'bad_credentials'); }
      hits.delete(k1);
      const token = newSession(username); persist();
      return send(res, 200, view(u), { 'set-cookie': cookieHdr(req, token, SESSION_MS / 1000) });
    }
    if (route === 'POST /api/logout') {
      const a = auth(req); if (a) { delete db.sessions[a.hash]; persist(); }
      return send(res, 200, { ok: true }, { 'set-cookie': cookieHdr(req, '', 0) });
    }
    if (route === 'PUT /api/progress') {
      const a = auth(req); if (!a) return fail(res, 401, 'unauthorized');
      const b = await readJson(req), u = a.user, inc = sanitize(b.state, u.username);
      let merged = false, adopted = false;
      if (b.reset === true) { u.epoch++; u.state = inc; }                       // explicit "reset progress"
      else if (b.baseEpoch !== u.epoch) adopted = true;                        // progress was reset on another device: take that
      else if (b.baseRev === u.rev) u.state = inc;                              // nobody else wrote since: plain save
      else { u.state = merge(u.state, inc); merged = true; }                    // another device saved in between: combine
      if (!adopted) { u.rev++; persist(); }
      return send(res, 200, { rev: u.rev, epoch: u.epoch, state: u.state, merged, adopted });
    }
    if (route === 'POST /api/password') {
      const a = auth(req); if (!a) return fail(res, 401, 'unauthorized');
      const b = await readJson(req), key = 'pw|' + a.user.username.toLowerCase();
      if (limited(key, 8, 900e3)) return fail(res, 429, 'rate_limited');
      if (typeof b.newPassword !== 'string' || b.newPassword.length < 6 || b.newPassword.length > 200) return fail(res, 400, 'bad_password');
      if (!(await checkPw(typeof b.oldPassword === 'string' ? b.oldPassword.slice(0, 200) : '', a.user.pw))) { hit(key, 900e3); return fail(res, 401, 'bad_credentials'); }
      a.user.pw = await hashPw(b.newPassword);
      for (const k in db.sessions) if (db.sessions[k].user === a.user.username.toLowerCase() && k !== a.hash) delete db.sessions[k]; // sign out other devices
      flush();
      return send(res, 200, { ok: true });
    }
    if (route === 'GET /api/league') {
      const a = auth(req); if (!a) return fail(res, 401, 'unauthorized');
      return send(res, 200, { rows: leagueRows(a.user), admin: isAdmin(a.user) });
    }
    if (url.startsWith('/api/admin/')) {
      const a = auth(req); if (!a) return fail(res, 401, 'unauthorized');
      if (!isAdmin(a.user)) return fail(res, 403, 'forbidden');
      if (route === 'GET /api/admin/users') {
        const now = Date.now();
        const users = Object.values(db.users).map(u => {
          const st = u.state || {}, key = u.username.toLowerCase();
          return { username: u.username, created: u.created || 0, last: st.last || '', streak: st.streak || 0, xp: st.xp || 0,
            units: Object.values(st.prog || {}).filter(v => v >= 5).length, words: Object.keys(st.w || {}).length,
            devices: (u.push || []).length, sessions: Object.values(db.sessions).filter(x => x.user === key && x.exp > now).length,
            rev: u.rev, admin: isAdmin(u) };
        }).sort((x, y) => y.created - x.created);
        return send(res, 200, { users, backups: listBackups(), keep: BACKUP_KEEP });
      }
      if (route === 'POST /api/admin/reset-password') {
        const b = await readJson(req), k = String(b.username || '').toLowerCase();
        if (!hasUser(k)) return fail(res, 404, 'not_found');
        const temp = crypto.randomBytes(9).toString('base64url');
        db.users[k].pw = await hashPw(temp);
        for (const sk in db.sessions) if (db.sessions[sk].user === k) delete db.sessions[sk];
        flush();
        return send(res, 200, { username: db.users[k].username, password: temp });
      }
      if (route === 'POST /api/admin/delete') {
        const b = await readJson(req), k = String(b.username || '').toLowerCase();
        if (!hasUser(k)) return fail(res, 404, 'not_found');
        if (k === a.user.username.toLowerCase()) return fail(res, 400, 'bad_request');
        delete db.users[k];
        for (const sk in db.sessions) if (db.sessions[sk].user === k) delete db.sessions[sk];
        flush();
        return send(res, 200, { ok: true });
      }
      if (route === 'POST /api/admin/backup') { const f = backupNow(true); return f ? send(res, 200, { name: f, backups: listBackups() }) : fail(res, 500, 'server_error'); }
      return fail(res, 404, 'not_found');
    }
    if (route === 'GET /api/push/key') return send(res, 200, { key: push.publicKey() });
    if (route === 'POST /api/push/subscribe') {
      const a = auth(req); if (!a) return fail(res, 401, 'unauthorized');
      const b = await readJson(req), sub = push.cleanSub(b.subscription, b.tz);
      if (!sub) return fail(res, 400, 'bad_request');
      const u = a.user; u.push = (u.push || []).filter(x => x.endpoint !== sub.endpoint); u.push.push(sub);
      if (u.push.length > 8) u.push = u.push.slice(-8);
      persist();
      push.send(sub, push.welcome(u.state.lang)).then(r => { if (r === 'gone') { u.push = u.push.filter(x => x !== sub); persist(); } });
      return send(res, 200, { ok: true });
    }
    if (route === 'POST /api/push/unsubscribe') {
      const a = auth(req); if (!a) return fail(res, 401, 'unauthorized');
      const b = await readJson(req); a.user.push = (a.user.push || []).filter(x => x.endpoint !== b.endpoint); persist();
      return send(res, 200, { ok: true });
    }
    if (route === 'POST /api/push/test') {
      const a = auth(req); if (!a) return fail(res, 401, 'unauthorized');
      const subs = a.user.push || [], r = await Promise.all(subs.map(x => push.send(x, push.welcome(a.user.state.lang))));
      return send(res, 200, { sent: r.filter(x => x === 'ok').length, devices: subs.length });
    }
    return fail(res, 404, 'not_found');
  } catch (e) {
    if (e && e.status) return fail(res, e.status, e.error);
    console.error(e); return fail(res, 500, 'server_error');
  }
}

/* ---------- static files (whitelist: nothing else on disk is ever served) ---------- */
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const STATIC_RE = /^\/(index\.html|admin\.html|download\.html|style\.css|sw\.js|manifest\.webmanifest|icon\.svg|icon-(192|512)\.png|js\/[A-Za-z0-9._-]+\.js)$/;
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
/* Android app updates: put latest.apk and version.json in data/app/ (see android/README.md) */
function serveApp(req, res, url) {
  const name = url === '/app/latest.apk' ? 'latest.apk' : 'version.json';
  fs.readFile(path.join(DATA_DIR, 'app', name), (e, data) => {
    if (e) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'content-type': name.endsWith('.apk') ? 'application/vnd.android.package-archive' : 'application/json; charset=utf-8', 'cache-control': 'no-store', 'content-length': data.length });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}
function serveStatic(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { allow: 'GET, HEAD' }); return res.end(); }
  const rel = url === '/' ? '/index.html' : url;
  if (!STATIC_RE.test(rel)) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('Not found'); }
  fs.readFile(path.join(__dirname, rel), (e, data) => {
    if (e) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(rel)] || 'application/octet-stream', 'cache-control': 'no-cache', 'content-security-policy': CSP });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
}

const server = http.createServer((req, res) => {
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('referrer-policy', 'no-referrer');
  res.setHeader('x-frame-options', 'DENY');
  let url; try { url = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch (e) { res.writeHead(400); return res.end(); }
  if (url.startsWith('/api/')) return api(req, res, url);
  if ((url === '/app/latest.apk' || url === '/app/version.json') && (req.method === 'GET' || req.method === 'HEAD')) return serveApp(req, res, url);
  serveStatic(req, res, url);
});
server.requestTimeout = 30e3;
backupNow(false); setInterval(() => backupNow(false), 3600e3).unref();      // daily backup (checked hourly, one file per day)
setInterval(() => push.tick(db, persist).catch(e => console.error('push tick:', e.message)), 60e3).unref();   // streak reminders

server.listen(PORT, HOST, () => {
  console.log(`\n  Türkçe İstanbul is running\n`);
  console.log(`  This computer:  http://localhost:${PORT}`);
  if (HOST === '0.0.0.0' || HOST === '::') {
    for (const list of Object.values(os.networkInterfaces())) for (const i of list || []) if (i.family === 'IPv4' && !i.internal) console.log(`  Other devices:  http://${i.address}:${PORT}   (same Wi-Fi / network)`);
  }
  console.log(`\n  Accounts & progress are saved in ${DB_FILE}`);
  console.log(`  Daily backups (last ${BACKUP_KEEP}) in ${BACKUP_DIR}`);
  console.log(`  Admin page: /admin.html  (admins: ${[...adminSet()].join(', ') || 'first account to sign up'})`);
  console.log(`  Note: traffic is plain HTTP. For use over the internet, put it behind HTTPS (and set TRUST_PROXY=1).\n`);
});
server.on('error', e => { console.error(e.code === 'EADDRINUSE' ? `Port ${PORT} is already in use. Try: PORT=3001 node server.js` : e.message); process.exit(1); });
