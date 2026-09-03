import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { hudFor, stateFromSearch, isKnownState, type HudBank } from './model.ts'

const bank = JSON.parse(await readFile(new URL('../../content/hud.json', import.meta.url), 'utf8')) as HudBank

test('Texas: nine lines in panic order, provisional, notice names the state', () => {
  const v = hudFor('TX', 'en', bank)
  assert.equal(v.stateCode, 'TX')
  assert.equal(v.stateName, 'Texas')
  assert.deepEqual(v.lines.map((l) => l.id), ['silence', 'documents', 'search', 'sign', 'passenger', 'firearm', 'recording', 'unmarked', 'footage'])
  assert.equal(v.provisional, true)
  assert.equal(v.reviewed, false)
  assert.match(v.notice, /Texas/)
})

test('the cite is lifted out of the sentence and kept as its own field', () => {
  const docs = hudFor('TX', 'en', bank).lines.find((l) => l.id === 'documents')!
  assert.equal(docs.cite, 'Transp. Code §521.025')
  assert.doesNotMatch(docs.text, /521\.025/)
  assert.match(docs.text, /hand over license, registration and insurance\. Say what/)
  const fl = hudFor('FL', 'en', bank).lines.find((l) => l.id === 'sign')!
  assert.doesNotMatch(fl.text, /318\.14/)
  assert.match(fl.cite!, /318\.14\(3\)/)
})

test('emphasis follows the postures that change what you do; LIKELY becomes a flag', () => {
  assert.equal(hudFor('FL', 'en', bank).lines.find((l) => l.id === 'sign')?.emphasis, true)
  assert.equal(hudFor('HI', 'en', bank).lines.find((l) => l.id === 'passenger')?.emphasis, true)
  assert.equal(hudFor('IL', 'en', bank).lines.find((l) => l.id === 'search')?.emphasis, true)
  assert.equal(hudFor('TX', 'en', bank).lines.find((l) => l.id === 'sign')?.emphasis, false)
  assert.equal(hudFor('MI', 'en', bank).lines.find((l) => l.id === 'recording')?.flag, 'likely')
  assert.equal(hudFor('TX', 'en', bank).lines.find((l) => l.id === 'recording')?.flag, null)
})

test('Spanish view is Spanish', () => {
  const v = hudFor('FL', 'es', bank)
  assert.match(v.lines.find((l) => l.id === 'sign')!.text, /Firme la multa/)
  assert.match(v.notice, /Florida/)
  assert.doesNotMatch(v.lines.map((l) => l.text).join(' '), /Sign the ticket/)
})

test('no state, an unknown state, or a lowercase code gives the federal baseline', () => {
  for (const code of [null, undefined, 'ZZ', 'tx', '', 'Texas']) {
    const v = hudFor(code, 'en', bank)
    assert.equal(v.stateCode, null, String(code))
    assert.equal(v.lines.length, 5, String(code))
    assert.deepEqual(v.lines.map((l) => l.id), ['silence', 'documents', 'search', 'passenger', 'unmarked'])
    assert.ok(v.lines.every((l) => l.cite === null && !l.emphasis))
    assert.equal(v.provisional, true)
    assert.equal(v.notice, bank.ui.federalNotice.en)
  }
  assert.equal(hudFor(null, 'es', bank).notice, bank.ui.federalNotice.es)
})

test('every state renders in both languages with no holes', () => {
  for (const code of Object.keys(bank.states)) {
    for (const lang of ['en', 'es'] as const) {
      const v = hudFor(code, lang, bank)
      assert.ok(v.lines.length >= 8, `${code} ${lang}`)
      assert.match(v.notice, new RegExp(lang === 'es' ? (bank.states[code].nameEs ?? bank.states[code].name) : bank.states[code].name), code)
      for (const l of v.lines) assert.doesNotMatch(l.text, /undefined|\{|—/, `${code}/${l.id}`)
    }
  }
})

test('stateFromSearch: uppercases, validates, ignores junk', () => {
  assert.equal(stateFromSearch('?state=tx', bank), 'TX')
  assert.equal(stateFromSearch('?panic=1&state=FL', bank), 'FL')
  assert.equal(stateFromSearch('?state=ZZ', bank), null)
  assert.equal(stateFromSearch('', bank), null)
  assert.equal(isKnownState('DC', bank), true)
})
