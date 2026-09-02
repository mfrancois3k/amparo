import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { armorCardHtml, armorPostcardHtml, armorPrintSheetHtml, FEDERAL_LINES, ARMOR_CARD_SIZE, type HudFile } from './armorCard.ts'
import { LINES } from '../../../tools/render-kyr-card.mjs'

const hud = JSON.parse(await readFile(new URL('../../src/content/hud.json', import.meta.url), 'utf8')) as HudFile
const lifelines = [{ n: 'State Bar of Texas Referral', p: '800-252-9690' }, { n: 'LawHelp.org', p: 'lawhelp.org/find-help' }, { n: 'ACLU', p: 'aclu.org' }, { n: 'fourth', p: 'x' }]
const reviewed = (): HudFile => {
  const copy = JSON.parse(JSON.stringify(hud)) as HudFile
  copy.states.TX.review.attorney = true
  return copy
}

test('front strings are the wallet card\'s own federal phrases, verbatim', () => {
  assert.equal(FEDERAL_LINES.length, LINES.length)
  FEDERAL_LINES.forEach((l, i) => {
    assert.equal(l.en, LINES[i].en, l.id)
    assert.equal(l.es, LINES[i].es, l.id)
  })
})

test('front carries all five phrases in the requested language and escapes the name', () => {
  const en = armorCardHtml({ code: 'TX', lang: 'en', side: 'front', hud, name: '<img onerror=x>' })
  for (const l of FEDERAL_LINES) assert.ok(en.includes(l.en.replace(/'/g, '&#39;').replace(/"/g, '&quot;')) || en.includes(l.en), l.id)
  assert.ok(!en.includes('<img'), 'name must be escaped')
  assert.ok(en.includes('&lt;img'))
  const es = armorCardHtml({ code: 'TX', lang: 'es', side: 'front', hud })
  assert.ok(es.includes('Prefiero no adivinar'))
  assert.ok(!es.includes('rather not guess'))
})

test('unreviewed state back: notice verbatim, lifelines capped at three, no state-law line, no cite', () => {
  const b = armorCardHtml({ code: 'TX', lang: 'en', side: 'back', hud, lifelines })
  assert.ok(b.includes(hud.states.TX.notice.en.replace(/'/g, '&#39;')) || b.includes(hud.states.TX.notice.en))
  assert.ok(b.includes('State Bar of Texas Referral'))
  assert.ok(!b.includes('fourth'), 'more than three lifelines must not print')
  const sign = hud.states.TX.lines.find((l) => l.id === 'sign')!
  assert.ok(!b.includes(sign.cite!), 'unreviewed: no state cite')
  assert.ok(!b.includes('Sign the ticket'))
  assert.ok(b.includes('amparohq.com/rehearse?state=TX'))
  assert.ok(!b.includes('Reviewed for this state'))
})

test('attorney-reviewed state back prints the five state lines with cites', () => {
  const b = armorCardHtml({ code: 'TX', lang: 'en', side: 'back', hud: reviewed(), lifelines })
  const sign = hud.states.TX.lines.find((l) => l.id === 'sign')!
  assert.ok(b.includes(sign.cite!))
  assert.ok(b.includes('Reviewed for this state'))
  for (const id of ['silence', 'sign', 'search', 'passenger', 'firearm']) {
    const l = hud.states.TX.lines.find((x) => x.id === id)!
    assert.ok(b.includes(l.en.slice(0, 30).replace(/'/g, '&#39;')) || b.includes(l.en.slice(0, 30)), id)
  }
  assert.ok(!b.includes(hud.states.TX.notice.en.slice(0, 40)), 'reviewed: provisional notice is gone')
})

test('federal-only card (code US) has no state and never throws; unknown code throws with the code', () => {
  const b = armorCardHtml({ code: 'US', lang: 'es', side: 'back', hud, lifelines })
  assert.ok(b.includes('Base federal'))
  assert.ok(b.includes('amparohq.com/rehearse'))
  assert.throws(() => armorCardHtml({ code: 'ZZ', lang: 'en', side: 'back', hud }), /ZZ/)
})

test('print sheet: two pages, ten cards each, page 2 mirrored', () => {
  const s = armorPrintSheetHtml({ code: 'TX', hud, lifelines })
  assert.equal((s.match(/class="page"/g) ?? []).length, 2)
  assert.equal((s.match(/class="armor armor--front"/g) ?? []).length, 10)
  assert.equal((s.match(/class="armor armor--back"/g) ?? []).length, 10)
  const [p1, p2] = s.split('<div class="page">').slice(1)
  assert.ok(p1.indexOf('left:0.75in;top:0.5in') < p1.indexOf('left:4.25in;top:0.5in'))
  assert.ok(p2.indexOf('left:4.25in;top:0.5in') < p2.indexOf('left:0.75in;top:0.5in'), 'backs must be mirrored for long-edge duplex')
})

test('postcard faces: front centres the card, back reserves the address zone', () => {
  const f = armorPostcardHtml({ code: 'TX', lang: 'en', side: 'front', hud })
  assert.ok(f.startsWith('<!doctype html>'))
  assert.ok(f.includes('size:6.25in 4.25in'))
  assert.ok(!f.includes('data-address-zone'))
  const b = armorPostcardHtml({ code: 'TX', lang: 'en', side: 'back', hud, lifelines })
  assert.ok(b.includes('data-address-zone'))
  assert.ok(b.includes('width:2.5in'))
  assert.deepEqual(ARMOR_CARD_SIZE.px300dpi, [1050, 600])
})
