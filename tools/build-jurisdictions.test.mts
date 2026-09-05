import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { buildAll, renderArtifacts, run, ARTIFACTS, patchArenaInline } from './build-jurisdictions.mjs'

const md = await readFile(new URL('../research/state-matrix.md', import.meta.url), 'utf8')
const built = buildAll(md)
const files = renderArtifacts(built)

/** Enough of JSON Schema to catch the drift we care about: required keys,
 * additionalProperties:false, enums, const, minProperties. Not a validator;
 * the schema file is the contract for consumers who have one. */
function check(schema, value, at = '$') {
  if (schema.const !== undefined) assert.deepEqual(value, schema.const, at)
  if (schema.enum) assert.ok(schema.enum.includes(value), `${at}: ${JSON.stringify(value)} not in enum`)
  const types = [].concat(schema.type ?? [])
  if (types.length) {
    const t = value === null ? 'null' : Array.isArray(value) ? 'array' : Number.isInteger(value) && types.includes('integer') ? 'integer' : typeof value
    assert.ok(types.includes(t), `${at}: type ${t} not in ${types}`)
  }
  if (schema.type === 'object' || types.includes('object')) {
    if (value === null) return
    for (const k of schema.required ?? []) assert.ok(k in value, `${at}: missing ${k}`)
    for (const [k, v] of Object.entries(value)) {
      const sub = schema.properties?.[k] ?? schema.additionalProperties
      if (sub === false) assert.fail(`${at}: unexpected key ${k}`)
      if (typeof sub === 'object') check(sub, v, `${at}.${k}`)
      if (schema.propertyNames?.pattern) assert.match(k, new RegExp(schema.propertyNames.pattern), `${at}: key ${k}`)
    }
    if (schema.minProperties) assert.ok(Object.keys(value).length >= schema.minProperties, `${at}: too few keys`)
    if (schema.maxProperties) assert.ok(Object.keys(value).length <= schema.maxProperties, `${at}: too many keys`)
  }
  if (schema.type === 'array' && schema.items) value.forEach((v, i) => check(schema.items, v, `${at}[${i}]`))
}

test('jurisdictions.json validates against its own schema', () => {
  check(built.schema, built.jurisdictions)
})

test('hud.json lines validate against the hudLine definition', () => {
  for (const s of Object.values(built.hud.states)) for (const l of s.lines) check(built.schema.$defs.hudLine, l, `hud.${s.code}.${l.id}`)
})

test('overlays land on the right states in the full file', () => {
  const S = built.jurisdictions.states
  assert.equal(S.FL.overlays.signPosture.posture, 'crime')
  assert.equal(S.IL.overlays.cannabisOdor.kind, 'caselaw')
  assert.equal(S.WV.remedyTier, 4)
  assert.equal(S.HI.overlays.passengerException.kind, 'firearm_any_occupant')
  assert.equal(S.OK.overlays.unmarked.kind, 'flat_bar')
  assert.equal(S.CO.overlays.dutyToIntervene, 'direct')
  assert.equal(S.FL.overlays.dutyToIntervene, 'agency_policy')
  assert.equal(S.TX.overlays.firearmDuty, 'none')
  assert.equal(S.TX.overlays.cannabisOdor, null)
  assert.equal(S.AL.cells.dutyToIntervene.verdict, 'UNASSESSED')
  assert.match(S.AL.cells.driverId.value, /carry\+display license/)
})

test('artifacts are deterministic and the app copy is byte-identical', () => {
  assert.equal(files.hud, files.hudApp)
  assert.deepEqual(renderArtifacts(buildAll(md)), files)
  assert.ok(files.jurisdictions.length < 500_000, `jurisdictions.json ${files.jurisdictions.length} bytes`)
  assert.ok(files.hud.length < 260_000, `hud.json ${files.hud.length} bytes`) // lazy chunk in the app; the entry never carries it
})

test('run(): writes stale files, then reports nothing stale, and --check is honest', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'amparo-jur-'))
  try {
    await mkdir(path.join(dir, 'research'), { recursive: true })
    await mkdir(path.join(dir, 'arena'), { recursive: true })
    await writeFile(path.join(dir, 'research', 'state-matrix.md'), md)
    // A minimal arena/index.html carrying only the marker pair run() splices.
    await writeFile(path.join(dir, 'arena', 'index.html'),
      '<script>/* AMPARO_HUD_INLINE:START */\nwindow.__AMPARO_HUD__=null;\n/* AMPARO_HUD_INLINE:END */</script>')
    const first = await run({ root: dir })
    assert.deepEqual(first.sort(), [...Object.values(ARTIFACTS), 'arena/index.html'].sort())
    assert.deepEqual(await run({ root: dir }), [])
    assert.deepEqual(await run({ root: dir, check: true }), [])
    await writeFile(path.join(dir, ARTIFACTS.hud), '{}\n')
    assert.deepEqual(await run({ root: dir, check: true }), [ARTIFACTS.hud])
    assert.equal(await readFile(path.join(dir, ARTIFACTS.hud), 'utf8'), '{}\n', '--check must not write')
    // arena/index.html staleness is caught the same way.
    await writeFile(path.join(dir, 'arena', 'index.html'),
      '<script>/* AMPARO_HUD_INLINE:START */\nwindow.__AMPARO_HUD__=null;\n/* AMPARO_HUD_INLINE:END */</script>')
    assert.deepEqual(await run({ root: dir, check: true }), [ARTIFACTS.hud, 'arena/index.html'])
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('committed artifacts are current', async () => {
  assert.deepEqual(await run({ check: true }), [])
})

test('patchArenaInline: splices valid, parseable, matching JSON between the markers, touches nothing else', () => {
  const html = 'before<script>/* AMPARO_HUD_INLINE:START old */\nwindow.__AMPARO_HUD__=null;\n/* AMPARO_HUD_INLINE:END */</script>after'
  const out = patchArenaInline(html, built.hud)
  assert.ok(out.startsWith('before<script>/* AMPARO_HUD_INLINE:START'))
  assert.ok(out.endsWith('AMPARO_HUD_INLINE:END */</script>after'))
  const m = /window\.__AMPARO_HUD__=(.*);\r?\n\/\* AMPARO_HUD_INLINE:END/s.exec(out)
  assert.ok(m, 'inline assignment not found')
  assert.deepEqual(JSON.parse(m[1]), built.hud)
})

test('patchArenaInline: idempotent, and re-splicing over its own prior output is a no-op', () => {
  const html = 'x<script>/* AMPARO_HUD_INLINE:START */\nwindow.__AMPARO_HUD__=null;\n/* AMPARO_HUD_INLINE:END */</script>y'
  const once = patchArenaInline(html, built.hud)
  const twice = patchArenaInline(once, built.hud)
  assert.equal(once, twice)
})

test('patchArenaInline: a missing marker fails loud, not silently', () => {
  assert.throws(() => patchArenaInline('<script>no markers here</script>', built.hud), /markers not found/)
})

test('run(): a CRLF-normalised arena/index.html (a Windows tool routinely does this) is not falsely reported stale', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'amparo-jur-crlf-'))
  try {
    await mkdir(path.join(dir, 'research'), { recursive: true })
    await mkdir(path.join(dir, 'arena'), { recursive: true })
    await writeFile(path.join(dir, 'research', 'state-matrix.md'), md)
    const crlf = '<script>/* AMPARO_HUD_INLINE:START */\r\nwindow.__AMPARO_HUD__=null;\r\n/* AMPARO_HUD_INLINE:END */</script>\r\n<p>rest of the page\r\n</p>\r\n'
    await writeFile(path.join(dir, 'arena', 'index.html'), crlf)
    const first = await run({ root: dir })
    assert.ok(first.includes('arena/index.html'), 'first run must still populate the marker')
    const second = await run({ root: dir })
    assert.ok(!second.includes('arena/index.html'), 'a second run over the same file must reach a fixed point, not report stale forever')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('committed arena/index.html carries the current inline hud, byte-identical to data/hud.json', () => {
  const html = readFileSync(new URL('../arena/index.html', import.meta.url), 'utf8')
  const m = /window\.__AMPARO_HUD__=(.*);\r?\n\/\* AMPARO_HUD_INLINE:END/s.exec(html)
  assert.ok(m, 'arena/index.html has no inline hud block')
  assert.deepEqual(JSON.parse(m[1]), built.hud)
})
