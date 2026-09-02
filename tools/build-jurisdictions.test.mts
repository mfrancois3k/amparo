import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { buildAll, renderArtifacts, run, ARTIFACTS } from './build-jurisdictions.mjs'

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
  assert.ok(files.hud.length < 200_000, `hud.json ${files.hud.length} bytes`)
})

test('run(): writes stale files, then reports nothing stale, and --check is honest', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'amparo-jur-'))
  try {
    await mkdir(path.join(dir, 'research'), { recursive: true })
    await writeFile(path.join(dir, 'research', 'state-matrix.md'), md)
    const first = await run({ root: dir })
    assert.deepEqual(first.sort(), Object.values(ARTIFACTS).sort())
    assert.deepEqual(await run({ root: dir }), [])
    assert.deepEqual(await run({ root: dir, check: true }), [])
    await writeFile(path.join(dir, ARTIFACTS.hud), '{}\n')
    assert.deepEqual(await run({ root: dir, check: true }), [ARTIFACTS.hud])
    assert.equal(await readFile(path.join(dir, ARTIFACTS.hud), 'utf8'), '{}\n', '--check must not write')
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
})

test('committed artifacts are current', async () => {
  assert.deepEqual(await run({ check: true }), [])
})
