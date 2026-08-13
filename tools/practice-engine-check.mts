/* Practice-engine FSM check. `npx tsx tools/practice-engine-check.mts`
   (exit 0 = pass, 1 = fail).

   Unlike this repo's other .mts checks, plain `node` cannot run this one:
   practiceEngine.ts imports NAMED exports from practice.json (required for
   Vite's per-key tree-shaking, enforced by this project's oxlint rule — see
   the import in practiceEngine.ts), but Node's native ESM JSON loader only
   ever produces a default export, never named ones, even with the `type:
   "json"` import attribute. tsx's loader synthesizes named JSON exports the
   same way Vite's does, so it's required here, not optional.

   Covers wargames/15 Move 5.1's stated verification runs: deck ci sequences
   are deterministic given a fixed date+level (the curveball-placement part —
   tone/variant TEXT is intentionally random every deal, same as root), the
   lock gate, the crisis-skip alignment between `run` and `runIdx`, and the
   debrief bookkeeping (runs/done/best/streak) that used to live inline in
   root's practiceRender(). */
import assert from 'node:assert/strict';
import {
  buildDeck, isLocked, selectLevel, confirmWarn, officerFinished, pick, markCrisis,
  advance, back, again, toLevels, initialState, emptyProgress, PRX_UNSCORED,
} from '../app-src/src/engine/practiceEngine.ts';

let failures = 0, total = 0;
const check = (label: string, fn: () => void) => {
  total++;
  try { fn(); } catch (err) { failures++; console.error(`FAIL ${label}\n      ${(err as Error).message.split('\n')[0]}`); }
};

const FIXED_DATE = new Date('2026-08-12T00:00:00Z');
const seededRng = (seed: number) => () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

/* ---- buildDeck: ci sequence determinism ---- */

check('level 0 first run: ci sequence matches PRX_LEVELS[0].ids exactly (no curveball on run 0)', () => {
  const deck = buildDeck(0, emptyProgress(), FIXED_DATE, seededRng(1));
  assert.deepEqual(deck.map((b) => b.ci), [0, 8, 1, 2, 6]);
});

check('level 0 second run: curveball splice position is date-seeded, deterministic for a fixed date', () => {
  const progress = { ...emptyProgress(), runs: { 0: 1 } };
  const a = buildDeck(0, progress, FIXED_DATE, seededRng(1));
  const b = buildDeck(0, progress, FIXED_DATE, seededRng(2));
  // Same date -> same splice position and same curveball ci, regardless of the
  // rng seed (rng only picks tone-pool TEXT variants, never the curveball).
  assert.deepEqual(a.map((x) => x.ci), b.map((x) => x.ci));
  assert.equal(a.length, 6); // 5 base beats + 1 curveball
});

check('level 2 (index 2): tone pool allows curt AND hostile, never calm', () => {
  const deck = buildDeck(2, emptyProgress(), FIXED_DATE, seededRng(3));
  for (const beat of deck) assert.ok(beat.tone === 'curt' || beat.tone === 'hostile', `beat ci=${beat.ci} tone=${beat.tone}`);
});

check('level 2: three beats [3,2,7], not the old two-beat [3,7] spike (wargames/16 2.1)', () => {
  const deck = buildDeck(2, emptyProgress(), FIXED_DATE, seededRng(3));
  assert.deepEqual(deck.map((b) => b.ci), [3, 2, 7]);
});

check('level 3 (hard mode): fixed track, ids 20/21/22, never variant-randomized', () => {
  const deck = buildDeck(3, emptyProgress(), FIXED_DATE, seededRng(1));
  assert.deepEqual(deck.map((b) => b.ci), [20, 21, 22]);
});

check('level 4 (checkpoint): fixed track, ids 30-33', () => {
  const deck = buildDeck(4, emptyProgress(), FIXED_DATE, seededRng(1));
  assert.deepEqual(deck.map((b) => b.ci), [30, 31, 32, 33]);
});

check('levels 5/6/7 (dark, ported anyway): fixed tracks build without throwing', () => {
  assert.equal(buildDeck(5, emptyProgress()).length, 6);
  assert.equal(buildDeck(6, emptyProgress()).length, 6);
  assert.equal(buildDeck(7, emptyProgress()).length, 6);
});

/* ---- lock gate ---- */

check('level 3/5/7 locked until 0,1,2 all done; level 6 additionally needs 5 done', () => {
  const none = emptyProgress();
  assert.equal(isLocked(3, none), true);
  const p012 = { ...none, done: { 0: true, 1: true, 2: true } };
  assert.equal(isLocked(3, p012), false);
  assert.equal(isLocked(5, p012), false);
  assert.equal(isLocked(6, p012), true); // still needs done[5]
  assert.equal(isLocked(6, { ...p012, done: { ...p012.done, 5: true } }), false);
});

check('selectLevel on a locked level is a no-op', () => {
  const s0 = initialState();
  const s1 = selectLevel(s0, 3, FIXED_DATE, seededRng(1));
  assert.equal(s1, s0);
});

/* ---- consent gate (PRE_FLIGHT) ---- */

check('level >= 2 enters PRE_FLIGHT until confirmWarn; level 0/1 skip straight to OFFICER_SPEAKING', () => {
  const s0 = initialState();
  const s1 = selectLevel(s0, 2, FIXED_DATE, seededRng(1));
  assert.equal(s1.phase, 'PRE_FLIGHT');
  const s2 = confirmWarn(s1);
  assert.equal(s2.phase, 'OFFICER_SPEAKING');
  assert.equal(s2.warnOk[2], true);

  const s3 = selectLevel(initialState(), 0, FIXED_DATE, seededRng(1));
  assert.equal(s3.phase, 'OFFICER_SPEAKING');
});

check('warnOk persists across a second selectLevel call at the same level (per-level, per-visit consent)', () => {
  let s = selectLevel(initialState(), 2, FIXED_DATE, seededRng(1));
  s = confirmWarn(s);
  s = selectLevel(s, 2, FIXED_DATE, seededRng(1)); // re-enter the same level
  assert.equal(s.phase, 'OFFICER_SPEAKING'); // not PRE_FLIGHT again
});

/* ---- run walk-through: crisis-skip alignment (prRunIdx) ---- */

check('a crisis-tier beat is excluded from run[]/runIdx[] but idx still advances', () => {
  let s = selectLevel(initialState(), 0, FIXED_DATE, seededRng(1));
  s = officerFinished(s);
  s = pick(s, true); // beat 0: good
  assert.equal(s.phase, 'BEAT_COMPLETE');
  s = advance(s, FIXED_DATE, seededRng(1));
  assert.equal(s.idx, 1);
  assert.deepEqual(s.run, ['g']);
  assert.deepEqual(s.runIdx, [0]);

  s = officerFinished(s);
  s = markCrisis(s); // beat 1: crisis disclosure, not scored
  assert.equal(s.curTier, 'x');
  s = advance(s, FIXED_DATE, seededRng(1));
  assert.equal(s.idx, 2); // idx still moved
  assert.deepEqual(s.run, ['g']); // but nothing appended
  assert.deepEqual(s.runIdx, [0]); // runIdx stays aligned with run, not idx
});

/* ---- debrief bookkeeping ---- */

check('completing a scored level writes runs/done/best/streak; unscored levels never write best', () => {
  let s = selectLevel(initialState(), 0, FIXED_DATE, seededRng(1)); // ids [0,8,1,2,6], 5 beats
  s = officerFinished(s);
  for (let i = 0; i < 5; i++) {
    s = pick(s, true);
    s = advance(s, FIXED_DATE, seededRng(1));
  }
  assert.equal(s.phase, 'DEBRIEF');
  assert.equal(s.progress.done[0], true);
  assert.equal(s.progress.runs[0], 1);
  assert.equal(s.progress.best[0], '5/5');
  assert.equal(s.progress.streak.n, 1);

  // Re-entering DEBRIEF via a second advance() call must not double-count.
  const s2 = advance(s, FIXED_DATE, seededRng(1));
  assert.equal(s2.progress.runs[0], 1);
});

check('a stored best from a DIFFERENT deck length is replaced, not compared (stale-best)', () => {
  // "2/2" is a perfect run under the OLD 2-beat level 2. Under the current
  // 3-beat deck it is incomparable, not unbeaten — root's numerator-only
  // compare would keep it forever and display a score the level cannot produce.
  const stale = { ...emptyProgress(), done: { 0: true, 1: true, 2: true }, best: { 2: '2/2' } };
  let s = selectLevel(initialState(stale), 2, FIXED_DATE, seededRng(1));
  s = confirmWarn(s);
  s = officerFinished(s);
  assert.equal(s.deck.length, 3);
  for (let i = 0; i < 3; i++) { s = pick(s, i === 0); s = advance(s, FIXED_DATE, seededRng(1)); }
  assert.equal(s.phase, 'DEBRIEF');
  assert.equal(s.progress.best[2], '1/3', 'stale 2/2 must be replaced by the current-shape result');

  // Same-shape runs still use root's compare: a worse score must NOT overwrite.
  const fresh = { ...emptyProgress(), done: { 0: true, 1: true, 2: true }, best: { 2: '3/3' } };
  let s2 = selectLevel(initialState(fresh), 2, FIXED_DATE, seededRng(1));
  s2 = confirmWarn(s2);
  s2 = officerFinished(s2);
  for (let i = 0; i < 3; i++) { s2 = pick(s2, false); s2 = advance(s2, FIXED_DATE, seededRng(1)); }
  assert.equal(s2.progress.best[2], '3/3', 'a worse same-shape run must not displace the best');
});

check('cbDay is stamped only when the completed run actually dealt a curveball', () => {
  const withCurve = { ...emptyProgress(), runs: { 0: 1 } }; // 2nd run of level 0 -> curveball deal
  let s = selectLevel(initialState(withCurve), 0, FIXED_DATE, seededRng(1));
  s = officerFinished(s);
  assert.ok(s.deck.some((b) => b.curve), 'fixture deck should contain a curveball');
  for (let i = 0; i < s.deck.length; i++) { s = pick(s, true); s = advance(s, FIXED_DATE, seededRng(1)); }
  assert.equal(s.progress.cbDay, '2026-08-12');

  let s0 = selectLevel(initialState(), 0, FIXED_DATE, seededRng(1)); // 1st run -> no curveball
  s0 = officerFinished(s0);
  assert.ok(!s0.deck.some((b) => b.curve));
  for (let i = 0; i < s0.deck.length; i++) { s0 = pick(s0, true); s0 = advance(s0, FIXED_DATE, seededRng(1)); }
  assert.equal(s0.progress.cbDay, undefined);
});

check('hard mode (level 3, unscored) completes without writing a best score', () => {
  let s = selectLevel(initialState({ ...emptyProgress(), done: { 0: true, 1: true, 2: true } }), 3, FIXED_DATE, seededRng(1));
  assert.equal(s.phase, 'PRE_FLIGHT'); // level >= 2 always gates on consent, hard mode included
  s = confirmWarn(s);
  s = officerFinished(s);
  for (let i = 0; i < 3; i++) {
    s = pick(s, true);
    s = advance(s, FIXED_DATE, seededRng(1));
  }
  assert.equal(s.phase, 'DEBRIEF');
  assert.equal(s.progress.done[3], true);
  assert.equal(s.progress.best[3], undefined);
  assert.ok(PRX_UNSCORED.has(3));
});

/* ---- back() ---- */

check('back() at idx 0 exits to IDLE; back() mid-run rewinds run/runIdx and re-enters OFFICER_SPEAKING', () => {
  let s = selectLevel(initialState(), 0, FIXED_DATE, seededRng(1));
  s = officerFinished(s);
  const atStart = back(s);
  assert.equal(atStart.phase, 'IDLE');

  s = pick(s, true);
  s = advance(s, FIXED_DATE, seededRng(1));
  assert.equal(s.idx, 1);
  s = back(s);
  assert.equal(s.idx, 0);
  assert.deepEqual(s.run, []);
  assert.deepEqual(s.runIdx, []);
  assert.equal(s.phase, 'OFFICER_SPEAKING');
});

/* ---- again() / toLevels() ---- */

check('again() rebuilds the deck and resets run state, keeping the same level', () => {
  let s = selectLevel(initialState(), 0, FIXED_DATE, seededRng(1));
  s = officerFinished(s);
  s = pick(s, true);
  s = advance(s, FIXED_DATE, seededRng(1));
  s = again(s, FIXED_DATE, seededRng(1));
  assert.equal(s.idx, 0);
  assert.deepEqual(s.run, []);
  assert.equal(s.phase, 'OFFICER_SPEAKING');
  assert.equal(s.level, 0);
});

check('toLevels() returns to IDLE without touching progress', () => {
  const s = selectLevel(initialState(), 0, FIXED_DATE, seededRng(1));
  const s2 = toLevels(s);
  assert.equal(s2.phase, 'IDLE');
  assert.equal(s2.progress, s.progress);
});

/* ---- bothGood (hard mode) never scores a miss ---- */

check('bothGood options always tier "g" regardless of which side is picked', () => {
  let s = selectLevel(initialState({ ...emptyProgress(), done: { 0: true, 1: true, 2: true } }), 3, FIXED_DATE, seededRng(1));
  s = confirmWarn(s);
  s = officerFinished(s);
  s = pick(s, false); // pick the "bad" side
  assert.equal(s.curTier, 'g');
  assert.equal(s.chosenGood, true);
});

if (failures) { console.error(`\n${failures}/${total} check(s) failed.`); process.exit(1); }
console.log(`practice-engine-check: PASS (${total} checks)`);
