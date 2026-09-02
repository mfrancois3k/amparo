#!/usr/bin/env node
/**
 * Builds the jurisdiction data layer from research/state-matrix.md.
 *
 *   node tools/build-jurisdictions.mjs            # writes the four artifacts
 *   node tools/build-jurisdictions.mjs --check    # exit 1 if any artifact is stale
 *
 * Outputs (all generated, all committed, never hand-edited):
 *   data/jurisdictions.json          51 x 19 cells + overlays, for anything that needs the whole finding
 *   data/jurisdictions.schema.json   JSON Schema 2020-12 for the file above
 *   data/hud.json                    the compact Panic HUD lines, served static for the Arena
 *   app-src/src/content/hud.json     byte-identical copy the React app imports
 *
 * Deterministic: same inputs, same bytes. There is no timestamp in the
 * output on purpose; `sourceHash` changes when the research does.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseMatrix, COLUMNS, VERDICTS } from './jurisdictions/parse.mjs'
import { compileAll, LINE_IDS } from './jurisdictions/hud.mjs'
import * as ov from './jurisdictions/overlays.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export function buildAll(md) {
  const parsed = parseMatrix(md)
  const hud = compileAll(parsed)
  const states = {}
  for (const s of [...parsed.states].sort((a, b) => a.code.localeCompare(b.code))) {
    states[s.code] = {
      code: s.code,
      name: s.name,
      review: hud.states[s.code].review,
      remedyTier: hud.states[s.code].remedyTier,
      cells: s.cells,
      overlays: {
        cannabisOdor: ov.cannabisOdor[s.code] ?? null,
        signPosture: ov.signPosture[s.code] ?? null,
        lyingIsCrime: ov.speech.lyingIsCrime[s.code] ?? null,
        refusalIsOffense: ov.speech.refusalIsOffense[s.code] ?? null,
        firearmDuty: Object.keys(ov.firearm).find((g) => Array.isArray(ov.firearm[g]) && ov.firearm[g].includes(s.code)),
        firearmHands: ov.firearm.hands[s.code] ?? null,
        firearmSecure: ov.firearm.secure[s.code] ?? null,
        passengerException: ov.passengerException[s.code] ?? null,
        unmarked: ov.unmarked[s.code] ?? null,
        safeStop: ov.safeStop[s.code] ?? null,
        reasonForStopDuty: ov.reasonForStop.includes(s.code),
        dutyToIntervene: ov.intervene.direct.includes(s.code) ? 'direct' : ov.intervene.agencyPolicy.includes(s.code) ? 'agency_policy' : null,
      },
    }
  }
  const jurisdictions = {
    version: 1,
    sourceHash: hud.sourceHash,
    standard: {
      primaryText: 'every cell verified against primary statute text (bar a)',
      attorney: 'no cell reviewed by an attorney licensed in the state (bar b); Upsolve, Inc. v. James, No. 22-1345 (2d Cir. 2025) gates the content layer',
    },
    columns: COLUMNS,
    verdicts: VERDICTS,
    remedyTiers: ov.REMEDY_TIERS,
    states,
  }
  return { jurisdictions, hud, schema: schemaFor() }
}

function schemaFor() {
  const cell = {
    type: 'object',
    required: ['verdict', 'cite', 'value', 'tags', 'raw'],
    additionalProperties: false,
    properties: {
      verdict: { enum: [...VERDICTS] },
      cite: { type: ['string', 'null'] },
      value: { type: 'string' },
      tags: { type: 'object', additionalProperties: { type: 'string' } },
      raw: { type: 'string' },
    },
  }
  const nullable = (t) => ({ type: [t, 'null'] })
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: 'https://www.amparohq.com/data/jurisdictions.schema.json',
    title: 'Amparo jurisdictions',
    type: 'object',
    required: ['version', 'sourceHash', 'standard', 'columns', 'verdicts', 'remedyTiers', 'states'],
    additionalProperties: false,
    properties: {
      version: { const: 1 },
      sourceHash: { type: 'string', pattern: '^[0-9a-f]{64}$' },
      standard: { type: 'object', required: ['primaryText', 'attorney'], properties: { primaryText: { type: 'string' }, attorney: { type: 'string' } } },
      columns: { type: 'array', minItems: 19, maxItems: 19, items: { type: 'object', required: ['key', 'label'], properties: { key: { type: 'string' }, label: { type: 'string' } } } },
      verdicts: { type: 'array', items: { type: 'string' } },
      remedyTiers: { type: 'object', propertyNames: { pattern: '^[0-4]$' }, additionalProperties: { type: 'string' } },
      states: {
        type: 'object',
        minProperties: 51,
        maxProperties: 51,
        propertyNames: { pattern: '^[A-Z]{2}$' },
        additionalProperties: {
          type: 'object',
          required: ['code', 'name', 'review', 'remedyTier', 'cells', 'overlays'],
          additionalProperties: false,
          properties: {
            code: { type: 'string', pattern: '^[A-Z]{2}$' },
            name: { type: 'string' },
            review: {
              type: 'object',
              required: ['primaryText', 'attorney', 'attorneyReviewedBy'],
              properties: {
                primaryText: { const: true },
                attorney: { type: 'boolean' },
                attorneyReviewedBy: { type: ['object', 'null'] },
              },
            },
            remedyTier: { type: ['integer', 'null'], minimum: 0, maximum: 4 },
            cells: {
              type: 'object',
              required: COLUMNS.map((c) => c.key),
              additionalProperties: false,
              properties: Object.fromEntries(COLUMNS.map((c) => [c.key, cell])),
            },
            overlays: {
              type: 'object',
              required: ['cannabisOdor', 'signPosture', 'lyingIsCrime', 'refusalIsOffense', 'firearmDuty', 'firearmHands', 'firearmSecure', 'passengerException', 'unmarked', 'safeStop', 'reasonForStopDuty', 'dutyToIntervene'],
              additionalProperties: false,
              properties: {
                cannabisOdor: nullable('object'),
                signPosture: nullable('object'),
                lyingIsCrime: nullable('string'),
                refusalIsOffense: nullable('object'),
                firearmDuty: { enum: ['proactive', 'onRequest', 'accuracyOnly', 'inverse', 'none', 'unassessed'] },
                firearmHands: nullable('string'),
                firearmSecure: nullable('string'),
                passengerException: nullable('object'),
                unmarked: nullable('object'),
                safeStop: nullable('object'),
                reasonForStopDuty: { type: 'boolean' },
                dutyToIntervene: { enum: ['direct', 'agency_policy', null] },
              },
            },
          },
        },
      },
    },
    $defs: {
      hudLine: {
        type: 'object',
        required: ['id', 'posture', 'cite', 'verdict', 'en', 'es'],
        properties: { id: { enum: [...LINE_IDS] }, posture: { type: 'string' }, cite: { type: ['string', 'null'] }, verdict: { enum: [...VERDICTS] }, en: { type: 'string' }, es: { type: 'string' } },
      },
    },
  }
}

export const ARTIFACTS = Object.freeze({
  jurisdictions: 'data/jurisdictions.json',
  schema: 'data/jurisdictions.schema.json',
  hud: 'data/hud.json',
  hudApp: 'app-src/src/content/hud.json',
  /* Only the UI strings, for the eager Panic button. A module shared by an
   * eager and a lazy importer lands in the entry chunk whole; keeping the
   * button on its own 1 kB file keeps the 190 kB bank in the lazy chunk. */
  hudUiApp: 'app-src/src/content/hud-ui.json',
})

export function renderArtifacts(built) {
  const j = (o) => JSON.stringify(o, null, 1) + '\n'
  const hud = j(built.hud)
  return { jurisdictions: j(built.jurisdictions), schema: j(built.schema), hud, hudApp: hud, hudUiApp: j({ version: built.hud.version, ui: built.hud.ui }) }
}

export async function run({ root = ROOT, check = false } = {}) {
  const md = await readFile(path.join(root, 'research', 'state-matrix.md'), 'utf8')
  const files = renderArtifacts(buildAll(md))
  const stale = []
  for (const [key, rel] of Object.entries(ARTIFACTS)) {
    const abs = path.join(root, rel)
    const current = await readFile(abs, 'utf8').catch(() => null)
    if (current === files[key]) continue
    stale.push(rel)
    if (!check) {
      await mkdir(path.dirname(abs), { recursive: true })
      await writeFile(abs, files[key], 'utf8')
    }
  }
  return stale
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const check = process.argv.includes('--check')
  const stale = await run({ check })
  if (check) {
    if (stale.length) {
      console.error('stale jurisdiction artifacts (run node tools/build-jurisdictions.mjs):\n  ' + stale.join('\n  '))
      process.exit(1)
    }
    console.log('jurisdiction artifacts up to date')
  } else {
    console.log(stale.length ? 'wrote:\n  ' + stale.join('\n  ') : 'nothing to write, artifacts already current')
  }
}
