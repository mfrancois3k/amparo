import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parseMatrix } from './parse.mjs'
import { compileAll, compileState, LINE_IDS, UNCITED_OK } from './hud.mjs'

const md = await readFile(new URL('../../research/state-matrix.md', import.meta.url), 'utf8')
const parsed = parseMatrix(md)
const hud = compileAll(parsed)
const S = hud.states
const line = (code, id) => S[code].lines.find((l) => l.id === id)
const every = (fn) => Object.values(S).forEach((s) => fn(s))

test('51 states, deterministic output, source hash present', () => {
  assert.equal(Object.keys(S).length, 51)
  assert.deepEqual(compileAll(parsed), hud)
  assert.match(hud.sourceHash, /^[0-9a-f]{64}$/)
  assert.equal(hud.version, 1)
})

test('provisional education: no state is attorney-reviewed and every state carries the notice', () => {
  every((s) => {
    assert.equal(s.review.primaryText, true, s.code)
    assert.equal(s.review.attorney, false, s.code)
    assert.match(s.notice.en, new RegExp(s.name), s.code)
    assert.match(s.notice.en, /not (yet )?reviewed/i, s.code)
    assert.match(s.notice.es, /no (ha sido )?revisad/i, s.code)
    assert.match(s.notice.en, /not legal advice/i, s.code)
  })
})

test('every state has the eight core lines, bilingual, no em dashes, no template holes', () => {
  const core = ['silence', 'documents', 'passenger', 'sign', 'search', 'firearm', 'recording', 'unmarked']
  every((s) => {
    const ids = s.lines.map((l) => l.id)
    for (const id of core) assert.ok(ids.includes(id), `${s.code} missing ${id}`)
    for (const id of ids) assert.ok(LINE_IDS.includes(id), `${s.code} unknown line ${id}`)
    assert.equal(new Set(ids).size, ids.length, `${s.code} duplicate line ids`)
    for (const l of s.lines) {
      assert.ok(l.en.length > 20 && l.es.length > 20, `${s.code}/${l.id} too short`)
      assert.doesNotMatch(l.en + l.es, /—|\{[a-z]+\}|\(\)|undefined|null/i, `${s.code}/${l.id}: ${l.en} | ${l.es}`)
      assert.ok(typeof l.posture === 'string' && l.posture, `${s.code}/${l.id} posture`)
      assert.ok(l.cite === null || (typeof l.cite === 'string' && l.cite.length > 2 && l.cite.length <= 110), `${s.code}/${l.id} cite: ${l.cite}`)
    }
  })
})

test('citation-signing trap: Florida never advises refusing; Virginia releases; Maryland arrests', () => {
  const fl = line('FL', 'sign')
  assert.match(fl.en, /misdemeanor/i)
  assert.match(fl.cite, /318\.14\(3\)/)
  assert.doesNotMatch(fl.en, /you (may|can) (refuse|decline)/i)
  assert.equal(fl.posture, 'crime')
  const va = line('VA', 'sign')
  assert.match(va.en, /released/i)
  assert.match(va.cite, /46\.2-936/)
  const md = line('MD', 'sign')
  assert.match(md.en, /arrest/i)
  const wv = line('WV', 'sign')
  assert.match(wv.en, /accept/i)
  // The default line, for states whose statute says nothing about refusal, still tells you to sign.
  const hi = line('HI', 'sign')
  assert.equal(hi.posture, 'unstated')
  assert.match(hi.en, /sign the ticket/i)
  every((s) => assert.doesNotMatch(line(s.code, 'sign').en, /you (may|can) refuse to sign/i, s.code))
})

test('lying vs silence: silence is protected everywhere; false answers are the crime in the 15 states', () => {
  for (const code of ['PA', 'VA', 'CA']) {
    const l = line(code, 'silence')
    assert.match(l.en, /crime here/i, code)
    assert.match(l.en, /stay silent/i, code)
    assert.ok(l.cite, code)
  }
  assert.match(line('PA', 'silence').cite, /4914/)
  assert.match(line('VA', 'silence').cite, /19\.2-82\.1/)
  assert.match(line('CA', 'silence').cite, /148\.9/)
  assert.match(line('OH', 'silence').en, /name, address and date of birth/i)
  assert.match(line('AZ', 'silence').en, /true full name/i)
  assert.match(line('UT', 'silence').en, /incriminate/i)
  assert.match(line('MI', 'silence').en, /decline to speak/i)
  every((s) => assert.doesNotMatch(line(s.code, 'silence').en, /must answer/i, s.code))
})

test('cannabis odor: Illinois burnt/raw, MD and VA survive consent, Missouri untouched', () => {
  const il = line('IL', 'search')
  assert.match(il.en, /burnt/i)
  assert.match(il.en, /raw/i)
  assert.match(il.es, /quemado/i)
  for (const code of ['MD', 'VA']) assert.match(line(code, 'search').en, /even (if|with) (you )?consent/i, code)
  assert.equal(S.MD.remedyTier, 0)
  assert.equal(S.WV.remedyTier, 4)
  assert.doesNotMatch(line('MO', 'search').en, /cannabis/i)
  every((s) => assert.match(line(s.code, 'search').en, /I do not consent/, s.code))
})

test('passengers never inherit the driver duty; Hawaii firearm outlier', () => {
  every((s) => {
    const p = line(s.code, 'passenger')
    assert.doesNotMatch(p.en, /passengers? (must|have to) (show|hand over|produce)/i, s.code)
    assert.match(p.en, /specific (reason|suspicion)/i, s.code)
  })
  assert.match(line('HI', 'passenger').en, /firearm/i)
  assert.match(line('HI', 'passenger').cite, /134-9\.2\(b\)/)
  for (const code of ['AZ', 'WA', 'IN']) assert.match(line(code, 'passenger').en, /own violation/i, code)
})

test('firearm: five postures plus unassessed; hands rule in OH and AL', () => {
  assert.match(line('NJ', 'firearm').en, /right away/i)
  assert.match(line('OH', 'firearm').en, /if asked/i)
  assert.match(line('OH', 'firearm').en, /never reach/i)
  assert.match(line('AL', 'firearm').en, /never reach/i)
  assert.match(line('AZ', 'firearm').en, /must be true/i)
  assert.match(line('GA', 'firearm').en, /can't detain/i)
  assert.match(line('TX', 'firearm').en, /no statute here/i)
  assert.match(line('CA', 'firearm').en, /not yet verified/i)
  assert.match(line('AK', 'firearm').en, /secure/i)
})

test('unmarked cars and safe stopping are court defences, never roadside rights', () => {
  every((s) => {
    const u = line(s.code, 'unmarked')
    assert.doesNotMatch(u.en, /you (may|can) keep driving/i, s.code)
    assert.match(u.en, /pull over/i, s.code)
  })
  assert.match(line('OK', 'unmarked').en, /defen[cs]e in court/i)
  assert.match(line('TX', 'unmarked').en, /fleeing charge/i)
  assert.match(line('OH', 'unmarked').en, /testify/i)
  assert.match(line('NY', 'unmarked').en, /no law here/i)
  assert.match(line('MS', 'unmarked').en, /lit place/i)
  assert.match(line('MS', 'unmarked').en, /not a right/i)
  assert.match(line('AR', 'unmarked').en, /driver manual/i)
})

test('recording: universal, bounded to the wiretap statute; Michigan flagged LIKELY', () => {
  every((s) => {
    const r = line(s.code, 'recording')
    assert.match(r.en, /record/i, s.code)
    assert.match(r.en, /interfere/i, s.code)
    assert.doesNotMatch(r.en, /recording is legal/i, s.code)
  })
  assert.equal(line('MI', 'recording').verdict, 'LIKELY')
  assert.match(line('MI', 'recording').en, /court-made/i)
})

test('optional lines appear only with a verified cell: Minnesota reason-for-stop, footage retention', () => {
  const mn = line('MN', 'reason')
  assert.ok(mn)
  assert.match(mn.en, /guess/i)
  assert.match(mn.cite, /169\.905/)
  assert.equal(line('TX', 'reason'), undefined)
  const fl = line('FL', 'footage')
  assert.ok(fl)
  assert.match(fl.en, /90 days/)
  assert.equal(line('WV', 'footage'), undefined)
})

test('ui strings and the federal baseline ship inside hud.json, bilingual, universal, uncited', () => {
  for (const [k, v] of Object.entries(hud.ui)) {
    assert.ok(v.en.length > 3 && v.es.length > 3, k)
    assert.doesNotMatch(v.en + v.es, /—/, k)
  }
  assert.match(hud.ui.panicButton.en, /pulled over/i)
  assert.deepEqual(hud.federal.map((l) => l.id), ['silence', 'documents', 'search', 'passenger', 'unmarked'])
  for (const l of hud.federal) {
    assert.equal(l.posture, 'universal', l.id)
    assert.equal(l.cite, null, l.id)
    assert.ok(l.en.length > 20 && l.es.length > 20, l.id)
  }
  // the federal silence line is byte-identical to a state with no speech overlay
  assert.equal(hud.federal[0].en, line('TX', 'silence').en)
})

test('a state-specific claim always carries a cite; uncited postures are only the universal or verified-absence kinds', () => {
  every((s) => {
    for (const l of s.lines) {
      if (l.cite) continue
      assert.ok(UNCITED_OK.includes(l.posture), `${s.code}/${l.id} posture ${l.posture} printed without a cite`)
      if (l.posture === 'none') assert.ok(l.verdict !== 'UNASSESSED' && l.verdict !== 'HOST_BLOCKED', `${s.code} firearm none on an unassessed cell`)
    }
  })
  // findings groups without a verified cell fall back to "not yet verified"
  for (const code of ['AR', 'MN', 'NV', 'CA', 'DC', 'IA']) assert.equal(line(code, 'firearm').posture, 'unverified', code)
  assert.equal(line('CO', 'unmarked').posture, 'universal')
  assert.equal(line('NY', 'unmarked').cite, null)
  assert.equal(line('RI', 'sign').posture, 'unstated')
})

test('Spanish is formal (usted) and state names are Spanish where they differ', () => {
  every((s) => {
    for (const l of s.lines) assert.doesNotMatch(l.es, /(puedes|debes|tienes|mantén|detente|firma la|acepta la|di:|elige|tu estado|tus )/i, `${s.code}/${l.id}: ${l.es}`)
    assert.doesNotMatch(l_es(s), /\d+ (days?|years?|months?)/i, `${s.code} footage ES carries English units`)
  })
  assert.match(line('FL', 'sign').es, /Firme la multa/)
  assert.match(S.NY.notice.es, /Nueva York/)
  assert.match(S.NC.notice.es, /Carolina del Norte/)
  assert.equal(S.NY.nameEs, 'Nueva York')
  assert.equal(S.TX.nameEs, 'Texas')
  assert.match(hud.ui.panicButton.es, /parando/)
  assert.doesNotMatch(hud.ui.panicButton.es, /detuvieron/)
  function l_es(s) { return s.lines.map((l) => l.es).join(' ') }
})

test('compileState refuses an unknown code', () => {
  assert.throws(() => compileState({ code: 'ZZ', name: 'Nowhere', cells: {} }), /ZZ/)
})
