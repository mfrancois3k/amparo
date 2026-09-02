import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { COLUMNS, parseMatrix, parseCell } from './parse.mjs'

const MATRIX = new URL('../../research/state-matrix.md', import.meta.url)

test('COLUMNS lists the 19 matrix columns in table order', () => {
  assert.equal(COLUMNS.length, 19)
  assert.equal(COLUMNS[0].key, 'stopAndId')
  assert.equal(COLUMNS[4].key, 'signCitation')
  assert.equal(COLUMNS[18].key, 'dutyToIntervene')
  assert.equal(new Set(COLUMNS.map((c) => c.key)).size, 19)
})

test('parseCell: VERIFIED with cite, value and bracket tags', () => {
  const c = parseCell(
    'VERIFIED Fla. Stat. 318.14(2)-(4) -- cited person must sign citation as promise to appear [signing=admission: no, unless payment made] [refusing to sign arrestable: yes -- 318.14(3), 2nd-degree misdemeanor]',
  )
  assert.equal(c.verdict, 'VERIFIED')
  assert.equal(c.cite, 'Fla. Stat. 318.14(2)-(4)')
  assert.equal(c.value, 'cited person must sign citation as promise to appear')
  assert.equal(c.tags['signing=admission'], 'no, unless payment made')
  assert.equal(c.tags['refusing to sign arrestable'], 'yes -- 318.14(3), 2nd-degree misdemeanor')
})

test('parseCell: null (verified absence) keeps the reason', () => {
  const c = parseCell('null (VA §19.2-83 REPEALED 1994; the widely-cited 30-minute cap no longer exists, do not cite)')
  assert.equal(c.verdict, 'NULL')
  assert.equal(c.cite, null)
  assert.match(c.value, /REPEALED 1994/)
})

test('parseCell: unassessed dashes, REFUTED, LIKELY, CASE LAW ONLY, host-blocked', () => {
  assert.equal(parseCell('—').verdict, 'UNASSESSED')
  assert.equal(parseCell('--').verdict, 'UNASSESSED')
  assert.equal(parseCell('').verdict, 'UNASSESSED')
  const r = parseCell('REFUTED Md. Crim. Law 3-502 -- this section is Kidnapping')
  assert.equal(r.verdict, 'REFUTED')
  assert.equal(r.cite, 'Md. Crim. Law 3-502')
  const l = parseCell('LIKELY Minn. Stat. §169.92 -- reportedly says a person is not required to sign')
  assert.equal(l.verdict, 'LIKELY')
  assert.equal(l.cite, 'Minn. Stat. §169.92')
  const k = parseCell('CASE LAW ONLY -- State v. Fort / State v. Sargent under Minn. Const. art. I s.10 bar consent searches')
  assert.equal(k.verdict, 'CASE_LAW_ONLY')
  assert.equal(k.cite, null)
  assert.match(k.value, /State v\. Fort/)
  const h = parseCell('host-blocked (code.wvlegislature.gov 403s fetch tool and browser)')
  assert.equal(h.verdict, 'HOST_BLOCKED')
  // VERIFIED with no cite separator: cite null, value is the whole remainder
  const v = parseCell('VERIFIED some text without a separator')
  assert.equal(v.verdict, 'VERIFIED')
  assert.equal(v.cite, null)
  assert.equal(v.value, 'some text without a separator')
})

test('parseMatrix: 51 jurisdictions, 19 cells each, DC included, no duplicates', async () => {
  const md = await readFile(MATRIX, 'utf8')
  const { states } = parseMatrix(md)
  assert.equal(states.length, 51)
  assert.equal(new Set(states.map((s) => s.code)).size, 51)
  assert.ok(states.some((s) => s.code === 'DC'))
  for (const s of states) {
    assert.match(s.code, /^[A-Z]{2}$/, s.code)
    assert.ok(s.name.length > 1, s.code)
    assert.deepEqual(Object.keys(s.cells), COLUMNS.map((c) => c.key), s.code)
  }
})

test('parseMatrix: known cells parse to the values the research states', async () => {
  const md = await readFile(MATRIX, 'utf8')
  const { states } = parseMatrix(md)
  const by = Object.fromEntries(states.map((s) => [s.code, s]))
  // Florida: refusing to sign is a second-degree misdemeanor (§318.14(3))
  const fl = by.FL.cells.ticketVsArrest
  assert.equal(fl.verdict, 'VERIFIED')
  assert.match(fl.tags['refusing to sign arrestable'], /yes/)
  assert.match(fl.tags['refusing to sign arrestable'], /318\.14\(3\)/)
  // Virginia: refusal noted, driver released forthwith (§46.2-936)
  const va = by.VA.cells.ticketVsArrest
  assert.match(va.cite, /46\.2-936/)
  assert.match(va.tags['refusing to sign arrestable'], /^NO/)
  // West Virginia: consent-search remedy expressly disclaimed (§62-1A-10)
  const wv = by.WV.cells.consentSearch
  assert.match(wv.cite, /62-1A-10/)
  assert.match(wv.tags.remedy, /NONE/)
  // Hawaii: passenger firearm outlier
  assert.match(by.HI.cells.passengerId.cite, /134-9\.2\(b\)/)
  // Virginia: the 30-minute detention cap is a verified absence, never cite it
  assert.equal(by.VA.cells.detentionCap.verdict, 'NULL')
  // Maryland: cannabis odor, exclusion survives consent
  assert.match(by.MD.cells.consentSearch.tags.remedy, /survives consent/)
})

test('parseMatrix: refuses a row with the wrong number of cells', () => {
  const bad = ['| State | A |', '|---|---|', '| **ZZ** Nowhere | only one cell |'].join('\n')
  assert.throws(() => parseMatrix(bad), /ZZ/)
})
