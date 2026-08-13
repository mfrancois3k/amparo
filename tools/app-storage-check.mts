/* Storage-boundary check for /app.  `node tools/app-storage-check.ts`
   (exit 0 = pass, 1 = fail). Node 22 strips the types natively — no dependency.

   The load-bearing assertion is the last one: after exercising every write path
   the module exposes, the six root-owned keys must be byte-identical. A live
   user's saved pack is the product; a beta must not be able to touch it.

   The migration cases are the other half. `amparo_prx` is keyed by NUMERIC level
   index, so getting the shift wrong does not throw — it silently displays a
   returning user's Hard-mode result as their Checkpoint result. Only a test
   catches that class of bug. */
import assert from 'node:assert/strict';
import {
  readRootSave, readRootPractice, readRootDocs, readRootPrefs,
  readApp, writeApp, removeApp, clearApp,
} from '../app-src/src/services/storage.ts';

class FakeStorage {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  snapshot() { return JSON.stringify([...this.m.entries()].sort()); }
}

const store = new FakeStorage();
(globalThis as unknown as { localStorage: FakeStorage }).localStorage = store;

const STATES = new Set(['TX', 'GA', 'NY']);
let failures = 0, total = 0;
const check = (label: string, fn: () => void) => {
  total++;
  try { fn(); } catch (err) { failures++; console.error(`FAIL ${label}\n      ${(err as Error).message.split('\n')[0]}`); }
};

/* ---- root reads: whitelisting ---- */

check('sr_save: a state not in the content banks is rejected', () => {
  store.setItem('sr_save', JSON.stringify({ state: 'ZZ', name: 'Ada', lang: 'en' }));
  const s = readRootSave(STATES)!;
  assert.equal(s.state, null, 'unknown state must not survive — it would print the wrong state\'s rules');
  assert.equal(s.name, 'Ada', 'the rest of the record still loads');
});

check('sr_save: a bogus lang is rejected', () => {
  store.setItem('sr_save', JSON.stringify({ state: 'TX', lang: 'fr' }));
  const s = readRootSave(STATES)!;
  assert.equal(s.lang, null, 'an unrecognised lang bricks every render in root — reject it here too');
  assert.equal(s.state, 'TX');
});

check('sr_save: absent key reads as null, not a throw', () => {
  store.removeItem('sr_save');
  assert.equal(readRootSave(STATES), null);
});

check('sr_save: malformed JSON reads as null, not a throw', () => {
  store.setItem('sr_save', '{not json');
  assert.equal(readRootSave(STATES), null);
  store.removeItem('sr_save');
});

/* ---- root reads: the two amparo_prx migrations ---- */

check('amparo_prx v1 flat shape migrates to {done}', () => {
  store.setItem('amparo_prx', JSON.stringify({ 0: true, 1: true }));
  const p = readRootPractice();
  assert.deepEqual(p.done, { 0: true, 1: true });
});

check('amparo_prx index shift: hard mode 4->3, checkpoint 5->4, old 3 dropped', () => {
  store.setItem('amparo_prx', JSON.stringify({
    done: { 0: true, 2: true, 3: true, 4: true, 5: true },
    best: { 4: '3/3', 5: '2/4' },
    runs: { 5: 7 },
    streak: { last: '2026-08-01', n: 3 },
  }));
  const p = readRootPractice();
  assert.deepEqual(p.done, { 0: true, 2: true, 3: true, 4: true },
    'old index 3 must be dropped and 4/5 shifted down');
  assert.equal(p.best[3], '3/3', "hard mode's best must land on the new index 3");
  assert.equal(p.best[4], '2/4', "checkpoint's best must land on the new index 4");
  assert.equal(p.runs[4], 7);
  /* v1 data runs the whole chain in one read — the shift, then v3's level-2
     best drop — so it lands stamped v3, not v2. The stamp is what stops either
     step running twice. */
  assert.equal(p.v, 3, 'the result is stamped with the LATEST version so no step repeats');
  assert.deepEqual(p.streak, { last: '2026-08-01', n: 3 }, 'streak is untouched by the shift');
});

check('amparo_prx v3: a level-2 best from the old 2-beat deck is dropped, completion kept', () => {
  /* Level 2 went from 2 beats to 3, so a "/2" best cannot be expressed on the
     current deck and the numerator compare could never replace it. Dropped
     rather than rescaled — a 2/2 is not evidence of a 2/3. */
  store.setItem('amparo_prx', JSON.stringify({
    done: { 2: true }, best: { 0: '5/5', 2: '2/2' }, runs: { 2: 4 },
    streak: { last: '', n: 0 }, v: 2,
  }));
  const p = readRootPractice();
  assert.equal(p.best[2], undefined, 'a /2 best is not expressible on the 3-beat deck');
  assert.equal(p.best[0], '5/5', 'other levels are untouched');
  assert.equal(p.done[2], true, 'the level WAS completed — only its score is dropped');
  assert.equal(p.runs[2], 4, 'run count is history, not a score');
  assert.equal(p.v, 3);
});

check('amparo_prx v3 is idempotent and leaves a current /3 best alone', () => {
  store.setItem('amparo_prx', JSON.stringify({
    done: { 2: true }, best: { 2: '2/3' }, runs: { 2: 1 }, streak: { last: '', n: 0 }, v: 3,
  }));
  const p = readRootPractice();
  assert.equal(p.best[2], '2/3', 'a best already on the current deck shape survives');
  assert.equal(p.v, 3);
});

check('amparo_prx already at v2 is not shifted again', () => {
  store.setItem('amparo_prx', JSON.stringify({ done: { 3: true }, best: { 3: '5/5' }, runs: {}, streak: { last: '', n: 0 }, v: 2 }));
  const p = readRootPractice();
  assert.deepEqual(p.done, { 3: true }, 'a second shift would move hard mode off index 3 and lose it');
  assert.equal(p.best[3], '5/5');
});

check('amparo_prx absent reads as an empty record', () => {
  store.removeItem('amparo_prx');
  const p = readRootPractice();
  assert.deepEqual(p.done, {});
  assert.deepEqual(p.streak, { last: '', n: 0 });
});

/* ---- root reads: docs + prefs ---- */

check('sr_docs: only data:image/ values survive', () => {
  store.setItem('sr_docs', JSON.stringify({
    lic_f: 'data:image/jpeg;base64,AAAA',
    evil: 'javascript:alert(1)',
    also_evil: 'data:text/html,<script>',
  }));
  const d = readRootDocs();
  assert.deepEqual(Object.keys(d), ['lic_f'], 'anything not an image data-URL must be dropped');
});

check('prefs: defaults are the safe ones', () => {
  const p = readRootPrefs();
  assert.equal(p.voice, 'm', 'root defaults the officer voice to male');
  assert.equal(p.stt, false, 'browser STT transits vendor servers — it must default off');
});

/* ---- the boundary itself ---- */

check('writes are namespaced, and root keys survive every write path', () => {
  // Seed all six root keys, then snapshot.
  store.setItem('sr_save', JSON.stringify({ state: 'TX', name: 'Real User', lang: 'es' }));
  store.setItem('sr_docs', JSON.stringify({ lic_f: 'data:image/jpeg;base64,ZZZZ' }));
  store.setItem('amparo_prx', JSON.stringify({ done: { 0: true }, best: { 0: '5/5' }, runs: {}, streak: { last: 'x', n: 1 }, v: 2 }));
  store.setItem('amparo_muted', '1');
  store.setItem('amparo_voice', 'f');
  store.setItem('amparo_stt', '0');
  const before = store.snapshot();

  // Exercise every write path this module exposes.
  writeApp('save', { state: 'GA', name: 'beta' });
  writeApp('lang', 'es');
  writeApp('practice', { done: { 4: true } });
  removeApp('lang');
  clearApp();

  assert.equal(store.snapshot(), before,
    'a /app write reached a root-owned key — this is the failure the boundary exists to prevent');
});

check('app keys round-trip under the app_ prefix', () => {
  writeApp('demo', { a: 1 });
  assert.equal(store.getItem('app_demo'), '{"a":1}', 'the app_ prefix must be applied by the module');
  assert.deepEqual(readApp('demo', null), { a: 1 });
  assert.equal(readApp('never_written', 'fallback'), 'fallback');
  clearApp();
  assert.equal(store.getItem('app_demo'), null, 'clearApp must remove app keys');
});

/* Counted, not hardcoded — the literal that used to live here said 13 while
   14 checks were running, so it silently under-reported every check added
   after it was written. */
console.log(failures === 0 ? `app-storage-check: PASS (${total} checks)` : `app-storage-check: ${failures}/${total} FAILED`);
process.exit(failures === 0 ? 0 : 1);
