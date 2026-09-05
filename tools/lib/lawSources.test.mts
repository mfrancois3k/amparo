import test from 'node:test'
import assert from 'node:assert/strict'
import { hudCites, matchedSources, gaps, renderGapsMarkdown } from './lawSources.mjs'

const hud = {
  states: {
    FL: { lines: [{ id: 'sign', cite: 'Fla. Stat. §318.14(3)' }, { id: 'search', cite: null }] },
    GA: { lines: [{ id: 'unmarked', cite: 'O.C.G.A. §40-8-91(f)' }] },
    TX: { lines: [{ id: 'documents', cite: 'Transp. Code §521.025' }, { id: 'sign', cite: 'Fla. Stat. §318.14(3)' }] },
  },
}

test('hudCites: dedupes by exact cite string, keeps every (state, line) that uses it, ignores null cites', () => {
  const c = hudCites(hud)
  assert.equal(c.size, 3)
  assert.deepEqual(c.get('Fla. Stat. §318.14(3)'), [{ state: 'FL', lineId: 'sign' }, { state: 'TX', lineId: 'sign' }])
  assert.deepEqual(c.get('Transp. Code §521.025'), [{ state: 'TX', lineId: 'documents' }])
})

test('matchedSources: only cites with a sidecar URL+anchor become entries; already-present ids are never re-emitted', () => {
  const sidecar = {
    'Fla. Stat. §318.14(3)': { url: 'https://example.gov/fl/318.14', anchor: '318.14' },
    'O.C.G.A. §40-8-91(f)': { url: '', anchor: 'x' }, // missing url: not a real source
  }
  const out = matchedSources(hud, sidecar, new Set())
  assert.equal(out.length, 1)
  assert.equal(out[0].cite, 'Fla. Stat. §318.14(3)')
  assert.equal(out[0].state, 'FL') // first use wins for the id/state
  assert.equal(out[0].url, 'https://example.gov/fl/318.14')
  assert.match(out[0].id, /^hud-fl-/)

  const again = matchedSources(hud, sidecar, new Set([out[0].id]))
  assert.equal(again.length, 0, 'an id already in law-watch.json must never be re-emitted (would clobber a hand-set hash)')
})

test('matchedSources: ids are collision-resistant across different cites in the same state, even ones that share a long common prefix', () => {
  const longPrefix = 'Some State Code Title Chapter Section Subsection Detail '
  const hud2 = { states: { AA: { lines: [
    { id: 'a', cite: `${longPrefix}Part One` },
    { id: 'b', cite: `${longPrefix}Part Two` },
  ] } } }
  const sidecar = {
    [`${longPrefix}Part One`]: { url: 'https://example.gov/one', anchor: 'one' },
    [`${longPrefix}Part Two`]: { url: 'https://example.gov/two', anchor: 'two' },
  }
  const out = matchedSources(hud2, sidecar, new Set())
  assert.equal(out.length, 2, 'both cites must be emitted')
  assert.notEqual(out[0].id, out[1].id, 'a 40-char slug truncation must not collapse two distinct cites into one id')
})

test('gaps: every uncovered cite, grouped by state, with every line that shows it', () => {
  const g = gaps(hud, { 'Fla. Stat. §318.14(3)': { url: 'u', anchor: 'a' } })
  assert.deepEqual([...g.keys()].sort(), ['GA', 'TX'])
  assert.deepEqual(g.get('GA'), [{ cite: 'O.C.G.A. §40-8-91(f)', lines: ['unmarked'] }])
  assert.deepEqual(g.get('TX'), [{ cite: 'Transp. Code §521.025', lines: ['documents'] }])
})

test('gaps: a fully-covered bank reports no gaps', () => {
  const sidecar = {
    'Fla. Stat. §318.14(3)': { url: 'u', anchor: 'a' },
    'O.C.G.A. §40-8-91(f)': { url: 'u', anchor: 'a' },
    'Transp. Code §521.025': { url: 'u', anchor: 'a' },
  }
  assert.equal(gaps(hud, sidecar).size, 0)
})

test('renderGapsMarkdown: counts covered vs total correctly and never invents a URL', () => {
  const md = renderGapsMarkdown(hud, { 'Fla. Stat. §318.14(3)': { url: 'u', anchor: 'a' } })
  assert.match(md, /1 of 3 distinct HUD/)
  assert.match(md, /## GA/)
  assert.match(md, /## TX/)
  assert.doesNotMatch(md, /## FL/, 'a fully-covered state must not get its own empty section')
  assert.doesNotMatch(md, /https?:\/\//, 'the gap report must never contain a URL — nothing here is verified')
})
