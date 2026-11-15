/* Pure logic: suffixes, pronunciation, spaced repetition, weekly summary, placement.   node --test tests/more.test.js */
const { test } = require('node:test'), assert = require('node:assert/strict');
const L = require('../js/logic.js');
const N = w => L.NOUNS.find(n => n.w === w);
test('suffixes follow vowel harmony, consonant hardening, buffers and softening', () => {
  const c = (w, s) => L.build(N(w), s);
  assert.equal(c('ev', 'loc'), 'evde'); assert.equal(c('okul', 'loc'), 'okulda'); assert.equal(c('kitap', 'loc'), 'kitapta'); assert.equal(c('çay', 'loc'), 'çayda');
  assert.equal(c('süt', 'abl'), 'sütten'); assert.equal(c('okul', 'abl'), 'okuldan');
  assert.equal(c('ev', 'pl'), 'evler'); assert.equal(c('köpek', 'pl'), 'köpekler'); assert.equal(c('kitap', 'pl'), 'kitaplar');
  assert.equal(c('araba', 'dat'), 'arabaya'); assert.equal(c('kapı', 'dat'), 'kapıya'); assert.equal(c('ekmek', 'dat'), 'ekmeğe'); assert.equal(c('ev', 'dat'), 'eve');
  assert.equal(c('kedi', 'acc'), 'kediyi'); assert.equal(c('kitap', 'acc'), 'kitabı'); assert.equal(c('okul', 'acc'), 'okulu'); assert.equal(c('göz', 'acc'), 'gözü');
  assert.equal(c('masa', 'gen'), 'masanın'); assert.equal(c('göz', 'gen'), 'gözün'); assert.equal(c('ev', 'gen'), 'evin');
  assert.equal(c('çocuk', 'poss'), 'çocuğum'); assert.equal(c('masa', 'poss'), 'masam'); assert.equal(c('okul', 'poss'), 'okulum'); assert.equal(c('kalem', 'poss'), 'kalemim');
});
test('every generated question has one correct and three different wrong options', () => {
  for (let i = 0; i < 3000; i++) { const q = L.suffixQ(); assert.equal(q.opts.length, 4); assert.equal(new Set(q.opts).size, 4); assert.ok(q.opts.includes(q.ans)); assert.equal(q.ans, L.build(q.n, q.suf)); }
});
test('pronunciation score marks recognised words', () => {
  const r = L.pronScore('bir simit lutfen', 'Bir simit, lütfen'); assert.equal(r.pct, 100);
  const p = L.pronScore('bir cay', 'Bir simit, lütfen'); assert.deepEqual(p.words.map(x => x.ok), [true, false, false]); assert.equal(p.pct, 33);
  assert.equal(L.pronScore('', 'merhaba').pct, 0);
});
test('spaced repetition: 1, 3, 7, 14 days, a miss restarts', () => {
  let c = L.srMiss(100); assert.equal(Math.floor(c / 10), 101);
  assert.equal(L.srOk(c, 100), c, 'not due yet: unchanged');
  c = L.srOk(c, 101); assert.equal(Math.floor(c / 10), 104);
  c = L.srOk(c, 104); assert.equal(Math.floor(c / 10), 111);
  c = L.srOk(c, 111); assert.equal(Math.floor(c / 10), 125);
  assert.equal(L.srOk(c, 125), null, 'after the 14-day review the word is learned');
});
test('weekly summary adds up the last 7 days', () => {
  const now = new Date(2026, 10, 15), k = d => L.keyOf(new Date(2026, 10, d));
  const s = L.weekSummary({ [k(15)]: [30, 600, 8, 10, 3], [k(14)]: [20, 300, 5, 10, 1], [k(1)]: [99, 99, 9, 9, 9] }, now);
  assert.equal(s.xp, 50); assert.equal(s.min, 15); assert.equal(s.acc, 65); assert.equal(s.words, 4); assert.equal(s.active, 2); assert.equal(s.days.length, 7);
});
test('placement stops at the first failed probe', () => {
  assert.equal(L.placedUpTo([{ idx: 0, pass: true }, { idx: 4, pass: true }, { idx: 8, pass: false }, { idx: 12, pass: true }]), 4);
  assert.equal(L.placedUpTo([{ idx: 0, pass: false }]), -1);
  assert.deepEqual(L.probeIdx(14), [0, 4, 8, 12]);
});
