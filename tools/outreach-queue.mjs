#!/usr/bin/env node
/**
 * Daily outreach queue — decides WHAT is due today (one Flipboard flip, one
 * Digg submission, and a Reel script every 7 days), pulled in order from the
 * outreach pack. Flipboard and Digg both require a logged-in human/browser
 * session, so this script only ever picks the day's item; it posts nothing.
 *
 * State: growth/outreach-queue-state.json (rotating pointers, persisted).
 * Record: content/outreach/<date>.json (what was assigned that day — a
 * second run on the same date returns the existing record unchanged, so
 * re-running never skips an item or double-assigns one).
 *
 * Usage: node tools/outreach-queue.mjs [--date YYYY-MM-DD] [--selftest]
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { FLIPBOARD_MAGS, DIGG_SUBMISSIONS, REELS } from './build-outreach-pack.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const STATE_PATH = path.join(ROOT, 'growth', 'outreach-queue-state.json');
const REEL_INTERVAL_DAYS = 7;

function flattenFlipboard() {
  const out = [];
  for (const m of FLIPBOARD_MAGS) for (const [title, url] of m.seed) out.push({ magazine: m.name, title, url });
  return out;
}

async function loadState() {
  try {
    return JSON.parse(await readFile(STATE_PATH, 'utf8'));
  } catch {
    return { flipboardIndex: 0, diggIndex: 0, reelIndex: 0, reelLastDate: null };
  }
}

function daysBetween(a, b) {
  return Math.floor((Date.parse(b) - Date.parse(a)) / 86400000);
}

function buildQueue(state, dateISO, flipboardFlat) {
  const flipboard = state.flipboardIndex < flipboardFlat.length
    ? { ...flipboardFlat[state.flipboardIndex], index: state.flipboardIndex, total: flipboardFlat.length }
    : { done: true, reason: `all ${flipboardFlat.length} Flipboard seeds flipped — add more to FLIPBOARD_MAGS` };

  const digg = state.diggIndex < DIGG_SUBMISSIONS.length
    ? { title: DIGG_SUBMISSIONS[state.diggIndex][0], url: DIGG_SUBMISSIONS[state.diggIndex][1], index: state.diggIndex, total: DIGG_SUBMISSIONS.length }
    : { done: true, reason: `all ${DIGG_SUBMISSIONS.length} Digg submissions posted — add more to DIGG_SUBMISSIONS` };

  const reelDue = state.reelLastDate === null || daysBetween(state.reelLastDate, dateISO) >= REEL_INTERVAL_DAYS;
  const reel = !reelDue
    ? { due: false, nextInDays: REEL_INTERVAL_DAYS - daysBetween(state.reelLastDate, dateISO) }
    : state.reelIndex < REELS.length
      ? { due: true, ...REELS[state.reelIndex], index: state.reelIndex, total: REELS.length }
      : { due: false, done: true, reason: `all ${REELS.length} Reels scripts assigned — add more to REELS` };

  return { flipboard, digg, reel };
}

function advance(state, queue, dateISO) {
  const next = { ...state };
  if (!queue.flipboard.done) next.flipboardIndex += 1;
  if (!queue.digg.done) next.diggIndex += 1;
  if (queue.reel.due && !queue.reel.done) { next.reelIndex += 1; next.reelLastDate = dateISO; }
  return next;
}

async function run(dateISO) {
  const flat = flattenFlipboard();
  const recordPath = path.join(ROOT, 'content', 'outreach', `${dateISO}.json`);
  try {
    const existing = JSON.parse(await readFile(recordPath, 'utf8'));
    console.log(JSON.stringify(existing, null, 2));
    return existing;
  } catch { /* not yet generated for this date */ }

  const state = await loadState();
  const queue = buildQueue(state, dateISO, flat);
  const nextState = advance(state, queue, dateISO);

  await mkdir(path.dirname(recordPath), { recursive: true });
  const record = { date: dateISO, ...queue };
  await writeFile(recordPath, JSON.stringify(record, null, 2) + '\n', 'utf8');
  await mkdir(path.dirname(STATE_PATH), { recursive: true });
  await writeFile(STATE_PATH, JSON.stringify(nextState, null, 2) + '\n', 'utf8');

  console.log(JSON.stringify(record, null, 2));
  return record;
}

function selftest() {
  const flat = flattenFlipboard();
  const ok = (cond, msg) => { if (!cond) throw new Error('selftest failed: ' + msg); console.log('ok - ' + msg); };
  ok(flat.length === 27, `27 flattened Flipboard seeds (got ${flat.length})`);
  ok(DIGG_SUBMISSIONS.length === 9, `9 Digg submissions (got ${DIGG_SUBMISSIONS.length})`);
  ok(REELS.length === 3, `3 Reels scripts (got ${REELS.length})`);

  let state = { flipboardIndex: 0, diggIndex: 0, reelIndex: 0, reelLastDate: null };
  let q = buildQueue(state, '2026-08-27', flat);
  ok(q.flipboard.url === flat[0].url, 'day 1 flipboard picks first seed');
  ok(q.digg.url === DIGG_SUBMISSIONS[0][1], 'day 1 digg picks first submission');
  ok(q.reel.due === true && q.reel.id === REELS[0].id, 'day 1 reel is due (first run ever)');
  state = advance(state, q, '2026-08-27');
  ok(state.flipboardIndex === 1 && state.diggIndex === 1 && state.reelIndex === 1, 'day 1 advances all three pointers');

  q = buildQueue(state, '2026-08-28', flat);
  ok(q.reel.due === false, 'day 2 reel not due yet (7-day interval not elapsed)');
  state = advance(state, q, '2026-08-28');
  ok(state.reelIndex === 1, 'reel pointer does not advance on a not-due day');

  q = buildQueue(state, '2026-09-03', flat);
  ok(q.reel.due === true && q.reel.id === REELS[1].id, '7 days after last reel, the next reel is due');

  const exhausted = { flipboardIndex: 27, diggIndex: 9, reelIndex: 3, reelLastDate: '2026-08-27' };
  const qEnd = buildQueue(exhausted, '2026-09-10', flat);
  ok(qEnd.flipboard.done === true, 'flipboard reports exhausted explicitly, never silently wraps around');
  ok(qEnd.digg.done === true, 'digg reports exhausted explicitly, never silently wraps around');

  console.log('all outreach-queue selftests passed');
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  if (process.argv.includes('--selftest')) {
    selftest();
  } else {
    const arg = f => { const i = process.argv.indexOf(f); return i === -1 ? null : process.argv[i + 1]; };
    const dateISO = arg('--date') || new Date().toISOString().slice(0, 10);
    await run(dateISO);
  }
}
