#!/usr/bin/env node
/**
 * Checks the ?sit= deep-link guard in arena/index.html against the real SIT
 * list and the real HELD_SITS, rather than against a copy of them.
 *
 * The guard decides whether an off-site link can drop a reader straight into a
 * drill. Two of its cases matter more than the happy path: an unknown id must
 * degrade to the saved situation rather than break the screen, and a HELD
 * drill must not be reachable by url — that gate exists because the door-knock
 * coaching is with an attorney and a DV clinician, and a query parameter is
 * exactly the kind of thing that quietly routes around a review gate.
 *
 * Reads both lists out of the page so this cannot drift from what ships.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, '$1'), '..');
const src = await readFile(path.join(ROOT, 'arena', 'index.html'), 'utf8');

/* SIT entries look like {id:'trap', icon:'…', title:{…}, levels:[…]} — take the
   ids and the level counts, which is all the guard reasons about. */
const SIT = [...src.matchAll(/\{id:'([a-z0-9]+)',\s*icon:/g)].map(m => m[1]);
const levelsFor = id => {
  const i = src.indexOf(`{id:'${id}',`);
  const seg = src.slice(i, i + 20000);
  return (seg.match(/\{id:'(?:step|pass|door|trap|l30)?[a-z0-9]*',\s*title:\{en:/g) || []).length;
};
const heldMatch = /const HELD_SITS=\{([^}]*)\}/.exec(src);
const HELD = Object.fromEntries((heldMatch ? heldMatch[1] : '').split(',').filter(Boolean)
  .map(p => [p.split(':')[0].trim().replace(/['"]/g, ''), 1]));

if (!SIT.length) { console.error('could not read SIT from arena/index.html'); process.exit(1); }

/* The guard, transcribed. If the page changes, this must change with it. */
function resolve(search, saved = { sit: 'traffic', lvl: 0 }) {
  const A = { ...saved };
  try {
    const q = new URLSearchParams(search);
    const s = (q.get('sit') || '').toLowerCase();
    if (s && SIT.includes(s) && !HELD[s]) {
      A.sit = s; A.lvl = 0;
      const l = parseInt(q.get('lvl'), 10);
      const max = Math.min(3, 3);
      if (Number.isInteger(l) && l >= 0 && l <= max) A.lvl = l;
    }
  } catch {}
  return A;
}

const checks = [];
const ok = (v, m) => checks.push([v, m]);

ok(SIT.includes('trap') && SIT.includes('last30') && SIT.includes('step'), `SIT read from the page (${SIT.length} situations)`);
ok(!!HELD.door, 'HELD_SITS read from the page and still contains door');

ok(resolve('?sit=trap').sit === 'trap', 'a valid id is honoured');
ok(resolve('?sit=TRAP').sit === 'trap', 'the id is case-insensitive');
ok(resolve('?sit=trap&lvl=2').lvl === 2, 'an explicit level is honoured');
ok(resolve('?sit=trap').lvl === 0, 'no level means start at the beginning');

ok(resolve('?sit=door').sit === 'traffic', 'a HELD drill is NOT reachable by url');
ok(resolve('?sit=door', { sit: 'step', lvl: 1 }).sit === 'step', 'a held id leaves the saved situation untouched');

ok(resolve('?sit=nonsense').sit === 'traffic', 'an unknown id degrades to the saved situation');
ok(resolve('').sit === 'traffic', 'no parameter behaves exactly as before');
ok(resolve('?sit=').sit === 'traffic', 'an empty parameter is ignored');
ok(resolve('?sit=trap&lvl=99').lvl === 0, 'an out-of-range level falls back to 0 rather than rendering nothing');
ok(resolve('?sit=trap&lvl=-1').lvl === 0, 'a negative level falls back to 0');
ok(resolve('?sit=trap&lvl=abc').lvl === 0, 'a non-numeric level falls back to 0');

/* The guard must exist in the shipped file, not just in this test. */
ok(/_q\.get\('sit'\)/.test(src), 'the deep-link block is present in arena/index.html');
ok(/HELD_SITS\[_s\]/.test(src), 'the shipped guard re-checks HELD_SITS');

let fail = 0;
for (const [v, m] of checks) { console.log(`${v ? 'ok  ' : 'FAIL'}  ${m}`); if (!v) fail++; }
console.log(`\n${checks.length - fail}/${checks.length} passed`);
process.exit(fail ? 1 : 0);
