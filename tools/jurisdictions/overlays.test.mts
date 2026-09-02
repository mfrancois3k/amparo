import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ALL_CODES,
  REMEDY_TIERS,
  consentRemedyTier,
  cannabisOdor,
  signPosture,
  speech,
  firearm,
  passengerException,
  unmarked,
  safeStop,
  reasonForStop,
  intervene,
} from './overlays.mjs'

test('ALL_CODES: 50 states plus DC', () => {
  assert.equal(ALL_CODES.length, 51)
  assert.ok(ALL_CODES.includes('DC'))
})

test('every overlay only names real jurisdiction codes', () => {
  const tables = {
    consentRemedyTier, cannabisOdor, signPosture, unmarked, safeStop,
    lyingIsCrime: speech.lyingIsCrime, refusalIsOffense: speech.refusalIsOffense,
    hands: firearm.hands, secure: firearm.secure,
  }
  for (const [name, table] of Object.entries(tables)) {
    for (const code of Object.keys(table)) assert.ok(ALL_CODES.includes(code), `${name}: ${code}`)
  }
  const lists = [
    ...reasonForStop, ...intervene.direct, ...intervene.agencyPolicy, ...speech.declineExpresslyPreserved,
    ...firearm.proactive, ...firearm.onRequest, ...firearm.accuracyOnly, ...firearm.inverse, ...firearm.none, ...firearm.unassessed,
  ]
  for (const code of lists) assert.ok(ALL_CODES.includes(code), code)
  for (const code of Object.keys(passengerException)) assert.ok(ALL_CODES.includes(code), code)
})

test('five remedy tiers, WV disclaimed (4), VA and MD exclusion surviving consent (0)', () => {
  assert.deepEqual(Object.keys(REMEDY_TIERS), ['0', '1', '2', '3', '4'])
  assert.equal(consentRemedyTier.WV, 4)
  assert.equal(consentRemedyTier.VA, 0)
  assert.equal(consentRemedyTier.MD, 0)
  assert.equal(consentRemedyTier.CO, 2)
})

test('cannabis odor: statutory bars and case-law states, Illinois burnt/raw split', () => {
  for (const code of ['NY', 'MD', 'VA', 'MN']) assert.equal(cannabisOdor[code].kind, 'statute', code)
  for (const code of ['CO', 'WA', 'MI', 'PA', 'VT', 'IL', 'MA', 'FL']) assert.equal(cannabisOdor[code].kind, 'caselaw', code)
  assert.equal(cannabisOdor.NJ.kind, 'both')
  assert.match(cannabisOdor.IL.en, /burnt/i)
  assert.match(cannabisOdor.IL.en, /raw/i)
  assert.match(cannabisOdor.IL.es, /quemado/i)
  assert.match(cannabisOdor.FL.caveat, /2nd DCA|Second District/)
  assert.equal(cannabisOdor.MO, undefined) // no protective ruling; stays null on purpose
  assert.equal(Object.keys(cannabisOdor).length, 13)
})

test('citation signing: Florida is a crime, Virginia releases, accept-axis states flagged', () => {
  assert.equal(signPosture.FL.posture, 'crime')
  assert.match(signPosture.FL.cite, /318\.14\(3\)/)
  assert.equal(signPosture.VA.posture, 'harmless')
  assert.match(signPosture.VA.cite, /46\.2-936/)
  assert.equal(signPosture.MD.posture, 'arrest_trigger')
  for (const code of ['WY', 'WV', 'NC', 'NV', 'DE']) assert.equal(signPosture[code].operativeAct, 'accept', code)
  for (const code of ['CA', 'TX', 'OH', 'GA', 'NE', 'ID', 'AL', 'LA', 'KY']) assert.equal(signPosture[code].posture, 'release_or_bond', code)
  for (const code of ['TN', 'NM']) assert.equal(signPosture[code].posture, 'unestablished', code)
})

test('speech: lying is the crime in 15 states, refusal only in OH AZ UT with internal limits', () => {
  assert.equal(Object.keys(speech.lyingIsCrime).length, 15)
  assert.match(speech.lyingIsCrime.PA, /4914/)
  assert.match(speech.lyingIsCrime.VA, /19\.2-82\.1/)
  assert.match(speech.lyingIsCrime.CA, /148\.9/)
  assert.deepEqual(Object.keys(speech.refusalIsOffense).sort(), ['AZ', 'OH', 'UT'])
  assert.match(speech.refusalIsOffense.OH.limit, /name.*address.*(DOB|date of birth)/i)
  assert.match(speech.refusalIsOffense.AZ.limit, /name/i)
  assert.match(speech.refusalIsOffense.UT.limit, /self-incrimination/i)
  assert.equal(speech.declineExpresslyPreserved[0], 'MI')
})

test('firearm: six duty groups cover every jurisdiction exactly once; Hawaii reaches passengers', () => {
  const groups = ['proactive', 'onRequest', 'accuracyOnly', 'inverse', 'none', 'unassessed']
  const seen = new Map()
  for (const g of groups) for (const code of firearm[g]) {
    assert.ok(!seen.has(code), `${code} in ${g} and ${seen.get(code)}`)
    seen.set(code, g)
  }
  assert.equal(seen.size, 51)
  assert.equal(seen.get('HI'), 'proactive')
  assert.equal(seen.get('NJ'), 'proactive')
  assert.equal(seen.get('AZ'), 'accuracyOnly')
  assert.equal(seen.get('GA'), 'inverse')
  assert.equal(seen.get('UT'), 'none')
  assert.equal(seen.get('TX'), 'none')
  assert.equal(seen.get('IA'), 'unassessed')
  assert.match(firearm.hands.OH, /2923\.12/)
  assert.match(firearm.hands.AL, /13A-11-96/)
})

test('passenger exceptions: three own-infraction hooks and the Hawaii firearm outlier', () => {
  assert.equal(passengerException.HI.kind, 'firearm_any_occupant')
  assert.match(passengerException.HI.cite, /134-9\.2\(b\)/)
  for (const code of ['AZ', 'WA', 'IN']) assert.equal(passengerException[code].kind, 'own_infraction', code)
  assert.equal(Object.keys(passengerException).length, 4)
})

test('unmarked cars: flat-bar states, Ohio evidentiary, eluding-element states, no roadside right anywhere', () => {
  for (const code of ['OK', 'IN', 'OR', 'VA', 'ME', 'DE', 'PA']) assert.equal(unmarked[code].kind, 'flat_bar', code)
  assert.equal(unmarked.OH.kind, 'evidentiary')
  assert.equal(unmarked.GA.kind, 'agency_only')
  for (const code of ['ND', 'TX', 'NV', 'KS', 'MD', 'AK', 'LA', 'MS', 'WY', 'SD', 'VT', 'NM', 'AZ', 'CO']) {
    assert.equal(unmarked[code].kind, 'eluding_element', code)
  }
  for (const code of ['NY', 'NJ']) assert.equal(unmarked[code].kind, 'myth', code)
  for (const v of Object.values(unmarked)) assert.equal(v.roadsideRight, false)
})

test('safe stop: a defence or an element, never a right', () => {
  assert.equal(safeStop.MS.kind, 'defence')
  assert.equal(safeStop.DC.kind, 'factor_in_defence')
  assert.equal(safeStop.WV.kind, 'element_carveout')
  assert.equal(safeStop.AR.kind, 'manual_only')
  for (const v of Object.values(safeStop)) assert.equal(v.roadsideRight, false)
})

test('reason-for-stop duty: the five statutory states', () => {
  assert.deepEqual([...reasonForStop].sort(), ['CA', 'CT', 'MD', 'MN', 'RI'])
})
