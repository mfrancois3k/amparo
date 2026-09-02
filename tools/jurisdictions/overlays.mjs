/**
 * Curated overlays on top of the parsed matrix.
 *
 * The matrix cells say what each statute says. These tables say what the
 * research CONCLUDED across states: the citation-signing postures, which
 * states criminalise lying rather than silence, the cannabis-odor case law
 * the statutes cannot show, the five remedy tiers, and the two findings that
 * are defences in court rather than rights at the roadside.
 *
 * Every entry traces to research/findings-summary.md (§ numbers below),
 * research/RESEARCH-STATUS.md §4, or research/case-law/*.md. Nothing here is
 * authored from memory; if a state is not in a table, the research did not
 * put it there, and the compiler falls back to the universal line.
 *
 * Bar (a), verification against primary text, is met for every cell behind
 * these tables. Bar (b), review by an attorney licensed in the state, is met
 * nowhere. `review.attorney` stays false on all 51 until a named attorney
 * signs a state off; flipping it is a data change in ATTORNEY_REVIEW below.
 */

export const ALL_CODES = Object.freeze([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
])

/** Per-state attorney sign-off. Empty on purpose: see header. Shape when it
 * happens: { TX: { name: '...', bar: 'Texas Bar #...', date: '2026-..' } } */
export const ATTORNEY_REVIEW = Object.freeze({})

/* ---------- RESEARCH-STATUS §4: five remedy tiers ---------- */
export const REMEDY_TIERS = Object.freeze({
  0: 'exclusion surviving consent',
  1: 'exclusion',
  2: 'a factor in voluntariness',
  3: 'none named',
  4: 'remedy expressly disclaimed',
})

/** Tier of the consent-search / pretext protection where the research tiered it. */
export const consentRemedyTier = Object.freeze({
  VA: 0, // eight sections, incl. §4.1-1302 cannabis odor: evidence inadmissible even with consent
  MD: 0, // Crim. Proc. §1-211(c)
  NH: 1,
  RI: 1,
  CT: 1,
  CO: 2, // Colorado Supreme Court: breach "is not determinative"
  WV: 4, // §62-1A-10(d),(f): noncompliance proves nothing, no private cause of action
})

/* ---------- case-law companion Part 2 + Part 4: cannabis odor ---------- */
/** kind: 'statute' (bar written into the code), 'caselaw' (high-court
 * holding), 'both'. `en`/`es` are the one-line HUD versions; `caveat` is the
 * nuance the line cannot carry and the full JSON must. */
export const cannabisOdor = Object.freeze({
  NY: {
    kind: 'statute', cite: 'Penal Law §222.05(3)',
    en: 'Cannabis smell alone cannot justify a search here.',
    es: 'El olor a cannabis por sí solo no justifica un registro aquí.',
    caveat: 'Bars the finding itself; no separate remedy stated. DUI investigations excepted.',
  },
  MD: {
    kind: 'statute', cite: 'Crim. Proc. §1-211', remedyTier: 0,
    en: 'Cannabis smell alone cannot justify a stop or search here, and evidence from one is thrown out even if you consented.',
    es: 'El olor a cannabis por sí solo no justifica una parada ni un registro aquí, y esa evidencia se excluye aunque hayas consentido.',
    caveat: 'Exclusion explicit and survives consent (§1-211(c)).',
  },
  VA: {
    kind: 'statute', cite: '§4.1-1302', remedyTier: 0,
    en: 'Cannabis smell alone cannot justify a stop or search here; evidence from one is inadmissible even with consent.',
    es: 'El olor a cannabis por sí solo no justifica una parada ni un registro aquí; esa evidencia es inadmisible aunque consientas.',
    caveat: 'Tier 0, exclusion survives consent.',
  },
  MN: {
    kind: 'statute', cite: 'Minn. Stat. §626.223',
    en: 'Cannabis smell alone cannot justify a search here.',
    es: 'El olor a cannabis por sí solo no justifica un registro aquí.',
    caveat: 'Consent searches separately barred absent independent suspicion under Minn. Const. art. I §10 (State v. Fort), case law not statute.',
  },
  NJ: {
    kind: 'both', cite: 'State v. Witt, 250 N.J. 289 (2022); N.J.S.A. 2C:33-15',
    en: 'For adults, cannabis smell alone cannot justify a search here.',
    es: 'Para adultos, el olor a cannabis por sí solo no justifica un registro aquí.',
    caveat: 'Statutory bar covers underage possession only; adults are protected by Witt. Underage possession remains a crime.',
  },
  CO: {
    kind: 'caselaw', cite: 'People v. Zuniga, 372 P.3d 1052 (Colo. 2016)',
    en: 'Cannabis smell alone is not enough for a search here, but it still counts as one factor.',
    es: 'El olor a cannabis por sí solo no basta para un registro aquí, pero sigue contando como un factor.',
    caveat: 'Partial protection: odor plus other factors can still add up to probable cause.',
  },
  WA: {
    kind: 'caselaw', cite: 'State v. Grande, 164 Wn.2d 135 (2008)',
    en: 'A moderate cannabis smell alone is not enough for a search here; a strong smell may be.',
    es: 'Un olor moderado a cannabis por sí solo no basta para un registro aquí; un olor fuerte puede bastar.',
    caveat: 'Narrowed by State v. Tibbles (2010): strong odor from the sole occupant supported arrest. Fact-specific.',
  },
  MI: {
    kind: 'caselaw', cite: 'People v. Armstrong, 904 N.W.2d 410 (Mich. 2017), reaffirmed 2025',
    en: 'Cannabis smell alone cannot justify a search here.',
    es: 'El olor a cannabis por sí solo no justifica un registro aquí.',
    caveat: '2025 reaffirmation: no warrantless vehicle search based only on a marijuana civil infraction.',
  },
  PA: {
    kind: 'caselaw', cite: 'Commonwealth v. Barr, 266 A.3d 604 (Pa. 2021)',
    en: 'Cannabis smell alone cannot justify a search here; it can only be one factor.',
    es: 'El olor a cannabis por sí solo no justifica un registro aquí; solo puede ser un factor.',
    caveat: 'Odor may be a factor, never the sole basis.',
  },
  VT: {
    kind: 'caselaw', cite: 'State v. Berard, 2019 VT 5',
    en: 'A faint smell of burnt cannabis alone is not enough for a search here.',
    es: 'Un olor leve a cannabis quemado por sí solo no basta para un registro aquí.',
    caveat: 'Court left open whether a strong odor would suffice.',
  },
  IL: {
    kind: 'caselaw', cite: 'People v. Redmond (Ill. 2023); People v. Molina (Ill. 2024)',
    en: 'Burnt cannabis smell alone is not enough for a search here. Raw cannabis smell IS.',
    es: 'El olor a cannabis quemado por sí solo no basta para un registro aquí. El olor a cannabis crudo SÍ basta.',
    caveat: 'Unique split: Redmond (burnt, no PC) vs Molina (raw, PC, because raw suggests possession beyond limits or trafficking).',
  },
  MA: {
    kind: 'caselaw', cite: 'Commonwealth v. Cruz, 459 Mass. 459 (2011); Commonwealth v. Overmyer, 469 Mass. 16 (2014)',
    en: 'Cannabis smell alone, burnt or unburnt, is not enough for a search here.',
    es: 'El olor a cannabis por sí solo, quemado o no, no basta para un registro aquí.',
    caveat: 'Burnt odor may still contribute to suspicion (Cruz); unburnt odor alone does not give probable cause (Overmyer).',
  },
  FL: {
    kind: 'caselaw', cite: 'Hixon v. State (Fla. 2d DCA 2025)',
    en: 'In part of Florida, cannabis smell alone is no longer enough for a search. Not yet statewide.',
    es: 'En parte de Florida, el olor a cannabis por sí solo ya no basta para un registro. Aún no en todo el estado.',
    caveat: 'Binding in the 2nd DCA only; may be adopted statewide. Overruled prior "plain smell" doctrine post-hemp.',
  },
})

/* ---------- findings-summary §3: refusing to sign a citation ---------- */
/** posture: crime | arrest_trigger | release_or_bond | harmless | unestablished.
 * operativeAct: 'sign' (default) or 'accept' where the statute turns on
 * accepting the citation rather than signing it. */
const sign = (posture, extra = {}) => ({ posture, cite: null, operativeAct: 'sign', ...extra })
/** `cite` is set only where findings-summary §3 states it; otherwise the
 * compiler cites the state's verified Ticket-vs-arrest / Sign-citation cell. */
export const signPosture = Object.freeze({
  FL: sign('crime', { cite: 'Fla. Stat. §318.14(3)', note: 'refusal is a second-degree misdemeanor' }),
  MD: sign('arrest_trigger', { cite: 'Md. Transp. §26-202(a)(5)', note: 'refusal to acknowledge by signature is an express warrantless-arrest trigger; §26-201 says acknowledgment is not an admission' }),
  WV: sign('arrest_trigger', { cite: 'W. Va. Code §17C-19-3', operativeAct: 'accept', note: 'refusing to accept the written notice is itself a listed ground for custody' }),
  CA: sign('release_or_bond'),
  TX: sign('release_or_bond'),
  OH: sign('release_or_bond'),
  GA: sign('release_or_bond'),
  NE: sign('release_or_bond'),
  ID: sign('release_or_bond'),
  AL: sign('release_or_bond'),
  LA: sign('release_or_bond', { cite: 'La. R.S. §32:391', note: 'statewide the officer may release on a written promise; in Orleans Parish the officer shall' }),
  KY: sign('release_or_bond'),
  NC: sign('harmless', { operativeAct: 'accept' }),
  VA: sign('harmless', { cite: 'Va. Code §46.2-936', note: 'officer notes the refusal and "forthwith" releases' }),
  WA: sign('harmless'),
  NV: sign('harmless', { operativeAct: 'accept' }),
  MA: sign('harmless'),
  RI: sign('harmless'),
  OR: sign('harmless'),
  MO: sign('harmless'),
  WY: sign('unestablished', { operativeAct: 'accept' }),
  DE: sign('unestablished', { operativeAct: 'accept' }),
  TN: sign('unestablished'),
  NM: sign('unestablished'),
})

/* ---------- findings-summary §5: lying vs silence ---------- */
export const speech = Object.freeze({
  /** Statute criminalises a FALSE answer only; silence is not an offence. */
  lyingIsCrime: Object.freeze({
    PA: '18 Pa.C.S. §4914',
    VA: 'Va. Code §19.2-82.1',
    OR: 'ORS §162.385',
    WV: 'W. Va. Code §61-5-17(c)',
    IA: 'Iowa Code §719.1A',
    NM: 'NMSA §30-22-3',
    NH: 'RSA §265:4 I(b)',
    MA: 'M.G.L. c.90 §25',
    CA: 'Penal Code §148.9',
    KY: 'KRS §523.110',
    MI: 'MCL §750.479c',
    MO: 'RSMo §575.120',
    NJ: 'N.J.S.A. §2C:29-3(b)(4)',
    SD: 'SDCL §22-40-1',
    TN: 'T.C.A. §39-16-611',
  }),
  /** The only three states where refusing itself is an offence, each limited by its own text. */
  refusalIsOffense: Object.freeze({
    OH: { cite: 'R.C. §2921.29', limit: 'compellable answer capped at name, address, DOB; arrest for refusing anything beyond is barred (§2921.29(C))' },
    AZ: { cite: 'A.R.S. §13-2412', limit: 'true full name only, and only after the officer advises that refusal is unlawful' },
    UT: { cite: 'Utah Code §76-8-301.5', limit: 'no offence where disclosure presents a reasonable danger of self-incrimination (§76-8-301.5(2)(c))' },
  }),
  /** MCL §750.479c expressly preserves the right to decline to speak. */
  declineExpresslyPreserved: Object.freeze(['MI']),
})

/* ---------- findings-summary §4 and §6: firearm disclosure and hands ---------- */
export const firearm = Object.freeze({
  proactive: Object.freeze(['MI', 'NC', 'NE', 'LA', 'NJ', 'HI', 'AK']),
  onRequest: Object.freeze(['OH', 'OK', 'AR', 'IL', 'VA', 'TN', 'MN', 'MO', 'KY', 'FL', 'PA', 'ND', 'MS', 'NV', 'NY', 'ME', 'CT', 'AL', 'WY', 'CO', 'WI', 'MD', 'WA']),
  accuracyOnly: Object.freeze(['AZ']), // A.R.S. §13-3102(A)(1)(b): only a duty not to answer falsely
  inverse: Object.freeze(['GA', 'SC']), // §16-11-137, §23-31-245: bar on detaining to investigate carry status
  none: Object.freeze(['DE', 'ID', 'IN', 'KS', 'MT', 'NH', 'RI', 'SD', 'VT', 'WV', 'MA', 'UT', 'NM', 'OR', 'TX']),
  /** Cell unassessed (CA, DC) or verified by catchline only (IA §724.4D):
   * findings-summary method rule 1, a catchline never establishes content. */
  unassessed: Object.freeze(['CA', 'DC', 'IA']),
  /** Codified hand rules: reaching for the weapon to hand it over is itself the offence. */
  hands: Object.freeze({
    OH: 'R.C. §2923.12(B)(2)-(3)',
    AL: 'Ala. Code §13A-11-96',
  }),
  /** Related duties: allow the officer to secure or disarm. */
  secure: Object.freeze({
    AK: 'AS §11.61.220(a)(1)(A)(ii)',
    LA: 'La. R.S. §40:1379.3(I)(2)',
  }),
})

/* ---------- findings-summary §2: passengers ---------- */
export const passengerException = Object.freeze({
  AZ: { kind: 'own_infraction', cite: 'A.R.S. §28-1595(C)' },
  WA: { kind: 'own_infraction', cite: 'RCW §46.61.021(3)' },
  IN: { kind: 'own_infraction', cite: 'IC §34-28-5-3.5' },
  HI: { kind: 'firearm_any_occupant', cite: 'HRS §134-9.2(b)', note: 'firearm disclosure owed by "a driver or passenger", triggered by the stop alone' },
})

/* ---------- findings-summary §7: unmarked cars ---------- */
const um = (kind, cite, note) => ({ kind, cite, note, roadsideRight: false })
/** Flat-bar, evidentiary and agency-only cites are stated in findings-summary
 * §7. Eluding-element states are listed there without cites; the compiler
 * cites the state's verified Officer-condition cell. */
export const unmarked = Object.freeze({
  OK: um('flat_bar', '11 O.S. §34-106; 19 O.S. §180.43', 'unlawful for a department to use an unmarked vehicle for routine traffic enforcement'),
  IN: um('flat_bar', 'IC §9-30-2-2(a)'),
  OR: um('flat_bar', 'ORS §810.400'),
  VA: um('flat_bar', 'Va. Code §46.2-103', 'stop authority itself requires uniform or displayed badge'),
  ME: um('flat_bar', '29-A M.R.S. §105'),
  DE: um('flat_bar', '21 Del. C. §701(a)'),
  PA: um('flat_bar', '75 Pa.C.S. §6304(a)'),
  OH: um('evidentiary', 'R.C. §§4549.13, 4549.14', 'officer in an unmarked car on traffic duty is an incompetent witness; courtroom remedy only'),
  GA: um('agency_only', 'O.C.G.A. §40-8-91(f)', 'markings mandated, but an otherwise lawful arrest is unaffected by non-compliance'),
  ...Object.fromEntries(['ND', 'TX', 'NV', 'KS', 'MD', 'AK', 'LA', 'MS', 'WY', 'SD', 'VT', 'NM', 'AZ', 'CO'].map((c) => [c, um('eluding_element', null, 'officer identifiability is an element of the fleeing offence: a defence after the fact')])),
  NY: um('myth', null, 'the widely-cited restriction traces to a revoked 1996 executive order and unenacted bills'),
  NJ: um('myth', null, 'traces to introduced bills (A2310/1996 and others) that never became law'),
})

/* ---------- findings-summary §10: "drive to a lit place" ---------- */
export const safeStop = Object.freeze({
  MS: { kind: 'defence', cite: 'Miss. Code §97-9-72(5)(b)', roadsideRight: false },
  DC: { kind: 'factor_in_defence', cite: 'D.C. Code §50-2201.05b(c)(4)', roadsideRight: false },
  WV: { kind: 'element_carveout', cite: 'W. Va. Code §61-5-17(l)', roadsideRight: false, note: 'a reasonable attempt to reach a safe, surveillable place is excluded from the definition of fleeing' },
  AR: { kind: 'manual_only', cite: null, roadsideRight: false, note: 'appears in the DMV driver manual, not the code' },
})

/* ---------- matrix column 16: statutory duty to state the reason for the stop ---------- */
export const reasonForStop = Object.freeze(['MN', 'CA', 'MD', 'RI', 'CT'])

/* ---------- RESEARCH-STATUS §5: duty to intervene ---------- */
export const intervene = Object.freeze({
  direct: Object.freeze(['CO', 'CT', 'WI', 'WA', 'MN', 'VA', 'NC', 'IL', 'TN', 'OR', 'NV', 'MD', 'KY', 'MA', 'VT', 'UT', 'NM']),
  agencyPolicy: Object.freeze(['FL', 'CA', 'NE', 'SC']),
})
