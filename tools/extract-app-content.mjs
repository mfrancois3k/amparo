/* Mechanical content extraction: index.html -> app-src/src/content/*.json
   Node stdlib only.  `node tools/extract-app-content.mjs [--verify]`
   (exit 0 = pass, 1 = fail).

   WHY THIS EXISTS, and why it is not a convenience.
   ------------------------------------------------
   Every officer line, statute quote, legal phrase and UI string in this product
   is attorney-reviewable content. wargames/15 §0.2 requires that /app receive
   them *verbatim by mechanical extraction* — never retyped, never "improved,"
   never model-authored. Hard rule 1 is that no model writes legal text; the
   safest way to honour that in a port is to make hand-transcription impossible.

   So this tool does not read the banks and rewrite them. It slices the original
   `const` STATEMENTS out of index.html and evaluates them, so the JSON it emits
   is the source literal itself. If a string is wrong here, it is wrong in
   index.html, and index.html is where it must be fixed (possibly with an
   EDITION bump) — never here.

   METHOD
   ------
   Statement-level slicing, not literal-level: the banks are not uniformly
   `{...}` / `[...]`. Some are `new Set([...])`, one is a flag-dependent ternary
   (`PRX_LEVEL_IDS`), and one line declares two constants at once
   (`EDITION="2026-C", ED_REPLACE="07/2027"`). Taking whole statements up to the
   depth-0 semicolon handles all of those the same way. Statements are then
   evaluated in SOURCE ORDER, which is also dependency order, because they are
   `const` declarations in a single script.

   The scanner understands strings, template literals (including `${}` nesting),
   and comments. It does NOT understand regex literals — no targeted bank
   contains one, and `--verify` would fail loudly if that ever changed. */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'index.html');
const OUT = join(ROOT, 'app-src', 'src', 'content');
const VERIFY = process.argv.includes('--verify');

/* Which constants land in which file. Order inside a group is irrelevant; the
   extractor always evaluates in source order regardless. */
const GROUPS = {
  'meta.json':       ['EDITION', 'ED_REPLACE', 'REVIEW', 'FINAL_SCENARIOS_ENABLED', 'DOOR_MODULE_ENABLED'],
  'states.json':     ['STATES', 'US_STATE_NAMES', 'BASE_RULES_EN', 'BASE_RULES_ES', 'BASE_LIFELINES', 'TAGNAMES', 'SCEN', 'QR', 'QR_URL'],
  'pack-extra.json': ['PACK_EXTRA'],
  'map.json':        ['US_PATHS', 'SM_LBL', 'SM_BOX'],
  'prep.json':       ['PREP_STEPS'],
  'practice.json':   [
    'PRACTICE', 'PRX_LEVELS', 'PRX_LEVEL_IDS', 'PRX_DOOR_IDS', 'PRX_UNSCORED', 'PRX_DO',
    'PRX_TONE', 'PRX_VAR', 'PRX_CURVE', 'PRX_OPT', 'PRX_CITES', 'PRX_SIGN', 'PRX_DIVERGE',
    'PRX_HARD', 'PRX_CHK', 'PRX_WAIT', 'PRX_NOSTOP', 'PRX_DOOR', 'PRX_CRISIS'
  ],
};
// T is split into two files, one per language — the largest single bank.
const I18N = 'T';

const html = readFileSync(SRC, 'utf8');

/** Scan from `i` to the semicolon that ends this statement at bracket depth 0.
    Understands '…' "…" `…${…}…` // … and /* … *\/ — returns the index AFTER it. */
function endOfStatement(s, i) {
  let depth = 0;
  const tstack = []; // template-literal nesting: depth at which each `${` opened
  while (i < s.length) {
    const c = s[i], c2 = s[i + 1];
    if (c === '/' && c2 === '/') { i = s.indexOf('\n', i); if (i < 0) return -1; continue; }
    if (c === '/' && c2 === '*') { i = s.indexOf('*/', i + 2); if (i < 0) return -1; i += 2; continue; }
    if (c === "'" || c === '"') {
      const q = c; i++;
      while (i < s.length && s[i] !== q) { if (s[i] === '\\') i++; i++; }
      i++; continue;
    }
    if (c === '`') {
      i++;
      while (i < s.length) {
        if (s[i] === '\\') { i += 2; continue; }
        if (s[i] === '`') { i++; break; }
        if (s[i] === '$' && s[i + 1] === '{') { tstack.push(depth); depth++; i += 2; break; }
        i++;
      }
      continue;
    }
    if (c === '{' || c === '[' || c === '(') { depth++; i++; continue; }
    if (c === '}' || c === ']' || c === ')') {
      depth--;
      // Closing the `${` of a template literal: resume scanning that template.
      if (c === '}' && tstack.length && depth === tstack[tstack.length - 1]) {
        tstack.pop(); i++;
        while (i < s.length) {
          if (s[i] === '\\') { i += 2; continue; }
          if (s[i] === '`') { i++; break; }
          if (s[i] === '$' && s[i + 1] === '{') { tstack.push(depth); depth++; i += 2; break; }
          i++;
        }
        continue;
      }
      i++; continue;
    }
    if (c === ';' && depth === 0) return i + 1;
    i++;
  }
  return -1;
}

/** Slice the whole `const NAME …;` statement that declares NAME. */
function sliceStatement(name) {
  const re = new RegExp(`(^|\\n)([ \\t]*)const\\s+${name}\\b`);
  const m = re.exec(html);
  if (!m) return null;
  const start = m.index + m[1].length;
  const end = endOfStatement(html, start);
  if (end < 0) return null;
  return { start, text: html.slice(start, end) };
}

const wanted = [...new Set([I18N, ...Object.values(GROUPS).flat()])];
const slices = [];
let missing = [];
for (const name of wanted) {
  const s = sliceStatement(name);
  if (s) slices.push({ name, ...s }); else missing.push(name);
}
/* A name with no `const NAME` of its own may still be a later declarator on a
   shared statement — `const EDITION="2026-C", ED_REPLACE="07/2027";`. Those are
   already covered: the whole statement was sliced for the first declarator, and
   evaluating it binds every name it declares. */
missing = missing.filter(name => {
  const re = new RegExp(`[,(]\\s*${name}\\s*=`);
  return !slices.some(s => re.test(s.text));
});
if (missing.length) {
  console.error(`extract: could not locate in index.html: ${missing.join(', ')}`);
  process.exit(1);
}

/* Multi-declarator statements (EDITION/ED_REPLACE) produce the SAME slice twice.
   Dedupe by source position so the script evaluates each statement once. */
const byStart = new Map();
for (const s of slices) if (!byStart.has(s.start)) byStart.set(s.start, s);
const program = [...byStart.values()].sort((a, b) => a.start - b.start).map(s => s.text).join('\n');

let evaluated;
try {
  evaluated = vm.runInNewContext(
    `${program}\n;({ ${wanted.join(', ')} })`,
    Object.create(null),
    { filename: 'index.html:extracted', timeout: 10000 }
  );
} catch (err) {
  console.error(`extract: evaluating the sliced statements failed — ${err.message}`);
  console.error('This usually means the scanner mis-sliced (an unhandled regex literal?).');
  process.exit(1);
}

/** Sets are not JSON — `JSON.stringify(new Set([3,5]))` is `{}`, silently.
    The check is `Object.prototype.toString`, NOT `instanceof`: these values are
    constructed inside the vm sandbox, so they belong to a different realm and
    `v instanceof Set` is false for a genuine Set. That exact bug shipped `{}`
    for PRX_UNSCORED and PRX_DO on the first run — which would have made every
    scored level render a score, including hard mode. Recursive because a Set
    nested inside a bank would fail just as quietly. */
const isSet = v => Object.prototype.toString.call(v) === '[object Set]';
const isMap = v => Object.prototype.toString.call(v) === '[object Map]';
function plain(v) {
  if (isSet(v)) return [...v].map(plain);
  if (isMap(v)) return Object.fromEntries([...v].map(([k, x]) => [k, plain(x)]));
  if (Array.isArray(v)) return v.map(plain);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, plain(x)]));
  return v;
}

const files = {};
for (const [file, names] of Object.entries(GROUPS)) {
  files[file] = Object.fromEntries(names.map(n => [n, plain(evaluated[n])]));
}
files['t.en.json'] = plain(evaluated[I18N].en);
files['t.es.json'] = plain(evaluated[I18N].es);

/* Nothing that JSON cannot represent may reach disk. A surviving Set/Map would
   serialize as `{}` and lose its contents without any error — see the note on
   plain() above. Cheap, and it closes the failure mode permanently. */
const nonJson = [];
(function scan(v, path) {
  if (isSet(v) || isMap(v)) { nonJson.push(path); return; }
  if (Array.isArray(v)) v.forEach((x, i) => scan(x, `${path}[${i}]`));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) scan(x, `${path}.${k}`);
})(files, '');
if (nonJson.length) {
  console.error(`extract: value(s) not representable in JSON reached output: ${nonJson.join(', ')}`);
  process.exit(1);
}

const sha = s => createHash('sha256').update(s).digest('hex').slice(0, 16);
const render = obj => JSON.stringify(obj, null, 2) + '\n';

/* Integrity spot-check: a sample of extracted officer lines must appear as exact
   substrings of index.html. Evaluation makes transformation unlikely, but this
   is the check that would actually catch it, so it runs every time. */
const sample = [];
for (const deck of Object.values(evaluated.PRACTICE ?? {})) {
  if (Array.isArray(deck)) for (const beat of deck) {
    if (beat?.officer?.en) sample.push(beat.officer.en);
    if (beat?.officer?.es) sample.push(beat.officer.es);
  }
}
for (const vs of Object.values(evaluated.PRX_VAR ?? {})) {
  for (const v of vs) { if (v.en) sample.push(v.en); if (v.es) sample.push(v.es); }
}
const escaped = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const notFound = sample.filter(line => !html.includes(line) && !html.includes(escaped(line)));
if (notFound.length) {
  console.error(`extract: ${notFound.length} extracted line(s) are NOT verbatim in index.html — refusing to write.`);
  notFound.slice(0, 3).forEach(l => console.error(`  ${JSON.stringify(l.slice(0, 70))}`));
  process.exit(1);
}

/* EN/ES structural parity. FG-09 golden #3: a key present in EN and absent in ES
   renders as an empty string via the `||''` fallbacks — a silently blank screen
   for Spanish users, with no error anywhere. Structure is compared by full path
   (arrays included) so a missing entry deep inside `rights` or `cmp_rows` fails
   here rather than in front of a user.
   Note: an EMPTY string is not a failure. Several `amend` tags are `""` in the
   source for both languages by design — those rights carry no amendment tag. */
const pathsOf = (o, p = '', acc = []) => {
  if (Array.isArray(o)) o.forEach((v, i) => pathsOf(v, `${p}[${i}]`, acc));
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) {
    const q = p ? `${p}.${k}` : k; acc.push(q); pathsOf(v, q, acc);
  }
  return acc;
};
const enPaths = pathsOf(files['t.en.json']);
const esPaths = new Set(pathsOf(files['t.es.json']));
const enOnly = enPaths.filter(p => !esPaths.has(p));
const esOnly = [...esPaths].filter(p => !enPaths.includes(p));
if (enOnly.length || esOnly.length) {
  console.error('extract: EN/ES structure differs — refusing to write.');
  if (enOnly.length) console.error(`  missing from ES: ${enOnly.slice(0, 8).join(', ')}`);
  if (esOnly.length) console.error(`  missing from EN: ${esOnly.slice(0, 8).join(', ')}`);
  process.exit(1);
}

let failures = 0;
const report = [];
for (const [file, obj] of Object.entries(files)) {
  const text = render(obj);
  const path = join(OUT, file);
  if (VERIFY) {
    if (!existsSync(path)) { failures++; console.error(`FAIL ${file} — missing; run without --verify`); continue; }
    const onDisk = readFileSync(path, 'utf8');
    if (onDisk !== text) { failures++; console.error(`FAIL ${file} — differs from a fresh extraction (drift)`); continue; }
  } else {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(path, text);
  }
  report.push(`  ${file.padEnd(18)} sha256:${sha(text)}  ${(text.length / 1024).toFixed(1)} kB`);
}

console.log(VERIFY ? 'extract --verify:' : 'extract: wrote app-src/src/content/');
report.forEach(r => console.log(r));
console.log(`  i18n: ${Object.keys(files['t.en.json']).length} top-level keys, ${enPaths.length} deep paths, EN/ES structure identical`);
console.log(`  officer lines checked verbatim against index.html: ${sample.length}`);
if (VERIFY) console.log(failures === 0 ? 'PASS — content matches index.html' : `${failures} FILE(S) DRIFTED`);
process.exit(failures === 0 ? 0 : 1);
