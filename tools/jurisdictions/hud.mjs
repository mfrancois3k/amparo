/**
 * Compiles the parsed matrix + overlays into the Panic HUD lines: the eight to
 * ten sentences a driver needs on the shoulder, per state, in both languages.
 *
 * Rules of the compiler:
 *  - A state-specific claim needs a citation: the verified cell's, or one the
 *    findings themselves state. No cite, no state-specific sentence: the line
 *    falls back to the universal wording (or says "not yet verified"). This is
 *    what makes /how-we-verify's "only verified text is published as a state
 *    rule" true for this surface too (content audit, 2026-09-03).
 *  - Where the research has nothing for a state, the line says the universal
 *    thing and says nothing state-specific. Absence is silence, not a guess.
 *  - Every state renders under the provisional-education notice until
 *    ATTORNEY_REVIEW names a reviewer for it.
 *  - Spanish is formal (usted) throughout: the Arena, the aid page and the
 *    printed cards already are, and these lines are read under stress.
 *  - Output is deterministic: same inputs, byte-identical JSON.
 */
import { createHash } from 'node:crypto'
import { COLUMNS } from './parse.mjs'
import {
  ALL_CODES, ATTORNEY_REVIEW, consentRemedyTier, cannabisOdor, signPosture, speech, firearm,
  passengerException, unmarked, safeStop, reasonForStop,
} from './overlays.mjs'

export const LINE_IDS = Object.freeze(['silence', 'documents', 'passenger', 'sign', 'search', 'firearm', 'recording', 'unmarked', 'reason', 'footage'])

/** Postures that are allowed to print without a cite, and why:
 *  universal / unverified / unstated say nothing state-specific;
 *  no_statute and myth are verified absences (the research read the index or
 *  traced the myth); none is a verified absence of a firearm duty. */
export const UNCITED_OK = Object.freeze(['universal', 'unverified', 'unstated', 'no_statute', 'myth', 'none'])

/** Spanish names where they differ from the English (RAE forms). */
const NAME_ES = Object.freeze({
  DC: 'Distrito de Columbia', HI: 'Hawái', LA: 'Luisiana', MI: 'Míchigan', MS: 'Misisipi', MO: 'Misuri',
  NH: 'Nuevo Hampshire', NJ: 'Nueva Jersey', NM: 'Nuevo México', NY: 'Nueva York', NC: 'Carolina del Norte',
  ND: 'Dakota del Norte', OR: 'Oregón', PA: 'Pensilvania', SC: 'Carolina del Sur', SD: 'Dakota del Sur',
  WV: 'Virginia Occidental',
})
export const nameEs = (code, name) => NAME_ES[code] ?? name

/** A cell's citation, for the HUD line. Long provenance parentheticals
 * ("(current; recodified from ...)") stay in jurisdictions.json; the line
 * carries the section only. */
const cited = (cell) => {
  const ok = cell && (cell.verdict === 'VERIFIED' || cell.verdict === 'CONFIRMED' || cell.verdict === 'LIKELY') && cell.cite
  if (!ok) return null
  const c = cell.cite.trim()
  return c.length > 48 && c.includes(' (') ? c.slice(0, c.indexOf(' (')).trim() : c
}
const withCite = (text, cite) => (cite ? `${text} (${cite}).` : `${text}.`)
const group = (code) => Object.keys(firearm).find((g) => Array.isArray(firearm[g]) && firearm[g].includes(code))

function notice(code, name) {
  const es = nameEs(code, name)
  return {
    en: `${name}: checked against the statute text, not yet reviewed by a ${name}-licensed attorney. Education, not legal advice.`,
    es: `${es}: cotejado con el texto de la ley, aún no ha sido revisado por un abogado con licencia en ${es}. Educación, no asesoría legal.`,
  }
}

function silenceLine(code, cells) {
  const lying = speech.lyingIsCrime[code]
  const refusal = speech.refusalIsOffense[code]
  if (refusal) {
    const t = {
      OH: ['If the officer suspects you of an offense, you must give your name, address and date of birth', 'Nothing more; refusing anything beyond that is not arrestable', 'Si el oficial sospecha que usted cometió un delito, debe dar su nombre, dirección y fecha de nacimiento', 'Nada más; negarse a más no es motivo de arresto'],
      AZ: ['If the officer tells you refusing is unlawful, give your true full name', 'Nothing more is required; you can stay silent on everything else', 'Si el oficial le dice que negarse es ilegal, dé su nombre completo verdadero', 'No se exige nada más; puede guardar silencio sobre todo lo demás'],
      UT: ['You must give your name if the officer suspects you of an offense, unless answering could incriminate you', 'Beyond that, stay silent', 'Debe dar su nombre si el oficial sospecha que usted cometió un delito, salvo que responder pueda incriminarlo', 'Más allá de eso, guarde silencio'],
    }[code]
    return { id: 'silence', posture: 'refusal_offense_limited', cite: refusal.cite, verdict: cells.stopAndId.verdict,
      en: `${withCite(t[0], refusal.cite)} ${t[1]}.`, es: `${withCite(t[2], refusal.cite)} ${t[3]}.` }
  }
  if (speech.declineExpresslyPreserved.includes(code)) {
    return { id: 'silence', posture: 'decline_preserved', cite: lying, verdict: cells.stopAndId.verdict,
      en: `${withCite('You can decline to speak; the law says so', lying)} If you do answer, it must be true.`,
      es: `${withCite('Puede negarse a hablar; la ley lo dice', lying)} Si responde, tiene que ser verdad.` }
  }
  if (lying) {
    return { id: 'silence', posture: 'lying_is_crime', cite: lying, verdict: cells.stopAndId.verdict,
      en: `You can stay silent. ${withCite('Giving a false name or answer is a crime here', lying)}`,
      es: `Puede guardar silencio. ${withCite('Dar un nombre o una respuesta falsa es un delito aquí', lying)}` }
  }
  return { id: 'silence', posture: 'universal', cite: null, verdict: cells.stopAndId.verdict,
    en: 'You can stay silent. If you do answer, it must be true.',
    es: 'Puede guardar silencio. Si responde, tiene que ser verdad.' }
}

function documentsLine(cells) {
  const cite = cited(cells.driverId)
  return { id: 'documents', posture: 'universal', cite, verdict: cells.driverId.verdict,
    en: `${withCite('When asked, hand over license, registration and insurance', cite)} Say what you're reaching for before you move.`,
    es: `${withCite('Cuando se los pidan, entregue licencia, registro y seguro', cite)} Diga qué va a alcanzar antes de moverse.` }
}

function passengerLine(code, cells) {
  const ex = passengerException[code]
  const base = ['Passengers don\'t have to show ID unless the officer has a specific reason to suspect them', 'Los pasajeros no tienen que mostrar identificación salvo que el oficial tenga una razón concreta para sospechar de ellos']
  if (ex?.kind === 'firearm_any_occupant') {
    return { id: 'passenger', posture: 'firearm_any_occupant', cite: ex.cite, verdict: cells.passengerId.verdict,
      en: `${base[0]}. ${withCite('But ANY occupant must immediately tell the officer about a firearm in the car', ex.cite)}`,
      es: `${base[1]}. ${withCite('Pero CUALQUIER ocupante debe avisar de inmediato si hay un arma de fuego en el auto', ex.cite)}` }
  }
  if (ex?.kind === 'own_infraction') {
    return { id: 'passenger', posture: 'own_infraction', cite: ex.cite, verdict: cells.passengerId.verdict,
      en: `${base[0]}. ${withCite('Exception: a passenger cited for their own violation', ex.cite)}`,
      es: `${base[1]}. ${withCite('Excepción: un pasajero multado por su propia infracción', ex.cite)}` }
  }
  return { id: 'passenger', posture: 'universal', cite: null, verdict: cells.passengerId.verdict, en: `${base[0]}.`, es: `${base[1]}.` }
}

function signLine(code, cells) {
  const p = signPosture[code]
  const cellCite = cited(cells.ticketVsArrest) || cited(cells.signCitation)
  const cite = p?.cite || cellCite
  const verdict = cells.ticketVsArrest.verdict
  const act = p?.operativeAct === 'accept' ? ['Accept', 'Acepte', 'accepting', 'aceptar'] : ['Sign', 'Firme', 'signing', 'firmar']
  // A posture is a state-specific claim; without a cite it is not printed as one.
  const posture = p && cite ? p.posture : 'unstated'
  switch (posture) {
    case 'crime':
      return { id: 'sign', posture, cite, verdict,
        en: `Sign the ticket. ${withCite('Refusing is a misdemeanor here', cite)} Signing is a promise to appear, not an admission.`,
        es: `Firme la multa. ${withCite('Negarse es un delito menor aquí', cite)} Firmar es una promesa de comparecer, no una admisión.` }
    case 'arrest_trigger':
      return { id: 'sign', posture, cite, verdict,
        en: `${act[0]} the ticket. ${withCite('Refusing can get you arrested here', cite)} It is not an admission of guilt.`,
        es: `${act[1]} la multa. ${withCite('Negarse puede llevarlo al arresto aquí', cite)} No es admisión de culpa.` }
    case 'release_or_bond':
      return { id: 'sign', posture, cite, verdict,
        en: `${withCite('Sign the ticket; it is your promise to appear and it gets you released', cite)} Refusing can cost you that release.`,
        es: `${withCite('Firme la multa; es su promesa de comparecer y le permite irse', cite)} Negarse puede costarle esa liberación.` }
    case 'harmless':
      if (code === 'VA') {
        return { id: 'sign', posture, cite, verdict,
          en: `${withCite('Signing is only a promise to appear', cite)} If you refuse, the officer notes it and you are released anyway.`,
          es: `${withCite('Firmar es solo una promesa de comparecer', cite)} Si se niega, el oficial lo anota y lo dejan ir de todos modos.` }
      }
      return { id: 'sign', posture, cite, verdict,
        en: `${withCite(`${act[0]} the ticket; ${act[2]} it is not an admission and refusing carries no stated penalty here`, cite)} Take it and go.`,
        es: `${withCite(`${act[1]} la multa; ${act[3]} no es una admisión y negarse no tiene sanción establecida aquí`, cite)} Tómela y siga.` }
    default:
      return { id: 'sign', posture: 'unstated', cite: null, verdict,
        en: `${act[0]} the ticket if asked. It is a promise to appear, not an admission of guilt.`,
        es: `${act[1]} la multa si se lo piden. Es una promesa de comparecer, no una admisión de culpa.` }
  }
}

function searchLine(code, cells) {
  const c = cannabisOdor[code]
  const base = ['Say: I do not consent to any search. Don\'t resist; say it and let the record show it', 'Diga: No doy consentimiento para ningún registro. No se resista; dígalo y que conste']
  if (c) {
    return { id: 'search', posture: `cannabis_${c.kind}`, cite: c.cite, verdict: cells.consentSearch.verdict,
      en: `${base[0]}. ${c.en.replace(/\.$/, '')} (${c.cite}).`,
      es: `${base[1]}. ${c.es.replace(/\.$/, '')} (${c.cite}).` }
  }
  const wv = code === 'WV' ? cited(cells.consentSearch) : null
  if (wv) {
    return { id: 'search', posture: 'consent_form_no_remedy', cite: wv, verdict: cells.consentSearch.verdict,
      en: `${base[0]}. ${withCite('Here the officer needs probable cause or your written or recorded consent', wv)} A breach of that rule is not by itself a remedy.`,
      es: `${base[1]}. ${withCite('Aquí el oficial necesita causa probable o su consentimiento escrito o grabado', wv)} Que incumplan esa regla no es por sí solo un remedio.` }
  }
  return { id: 'search', posture: 'universal', cite: null, verdict: cells.consentSearch.verdict, en: `${base[0]}.`, es: `${base[1]}.` }
}

function firearmLine(code, cells) {
  const cell = cells.firearmInform
  const cite = cited(cell)
  let g = group(code)
  // The findings put a state in a duty group; the HUD prints that duty only
  // when the state's own cell is verified and cited. Otherwise: not yet verified.
  if (['proactive', 'onRequest', 'accuracyOnly', 'inverse'].includes(g) && !cite) g = 'unverified'
  if (g === 'none' && (cell.verdict === 'UNASSESSED' || cell.verdict === 'HOST_BLOCKED')) g = 'unverified'
  if (g === 'unassessed') g = 'unverified'
  const t = {
    proactive: ['Tell the officer right away if there is a gun in the car', 'Avise de inmediato al oficial si hay un arma en el auto'],
    onRequest: ['If asked, say whether you are carrying a firearm', 'Si le preguntan, diga si lleva un arma de fuego'],
    accuracyOnly: ['You do not have to volunteer a firearm, but if you answer it must be true', 'No tiene que mencionar un arma por su cuenta, pero si responde tiene que ser verdad'],
    inverse: ['No duty to disclose a firearm here, and the officer can\'t detain you just to check your carry status', 'Aquí no hay obligación de declarar un arma, y el oficial no puede detenerlo solo para revisar su permiso'],
    none: ['No statute here requires you to announce a firearm. If asked, answer truthfully', 'Ninguna ley aquí lo obliga a anunciar un arma. Si le preguntan, responda con verdad'],
    unverified: ['Not yet verified for this state. If asked, answer truthfully', 'Aún no verificado para este estado. Si le preguntan, responda con verdad'],
  }[g]
  const useCite = g === 'none' || g === 'unverified' ? null : cite
  let en = `${withCite(t[0], useCite)} Keep your hands still and visible.`
  let es = `${withCite(t[1], useCite)} Mantenga las manos quietas y a la vista.`
  if (firearm.hands[code]) {
    en += ` ${withCite('Never reach for or touch the weapon, even to hand it over; that alone is an offense', firearm.hands[code])}`
    es += ` ${withCite('Nunca toque ni intente entregar el arma; eso por sí solo es un delito', firearm.hands[code])}`
  }
  if (firearm.secure[code]) {
    en += ` ${withCite('Let the officer secure it', firearm.secure[code])}`
    es += ` ${withCite('Deje que el oficial la asegure', firearm.secure[code])}`
  }
  return { id: 'firearm', posture: g, cite: useCite, verdict: cell.verdict, en, es }
}

function recordingLine(cells) {
  const cell = cells.recording
  const cite = cited(cell)
  const tail = ['Say you are recording, keep your hands visible, and do not interfere', 'Diga que está grabando, mantenga las manos a la vista y no interfiera']
  if (cell.verdict === 'LIKELY') {
    return { id: 'recording', posture: 'likely', cite, verdict: cell.verdict,
      en: `${withCite('You may record your own stop; the wiretap law here is reported not to reach it, a court-made exception not yet body-verified', cite)} ${tail[0]}.`,
      es: `${withCite('Puede grabar su propia parada; se reporta que la ley de escuchas aquí no lo alcanza, una excepción judicial aún no verificada en el texto', cite)} ${tail[1]}.` }
  }
  if (cell.verdict === 'NULL') {
    return { id: 'recording', posture: 'no_statute', cite: null, verdict: cell.verdict,
      en: `No wiretap law here applies to recording your own stop. ${tail[0]}.`,
      es: `Ninguna ley de escuchas aquí aplica a grabar su propia parada. ${tail[1]}.` }
  }
  if (cite) {
    return { id: 'recording', posture: 'wiretap_excludes', cite, verdict: cell.verdict,
      en: `${withCite('You may record your own stop; the wiretap law here does not reach it', cite)} ${tail[0]}.`,
      es: `${withCite('Puede grabar su propia parada; la ley de escuchas aquí no lo alcanza', cite)} ${tail[1]}.` }
  }
  return { id: 'recording', posture: 'universal', cite: null, verdict: cell.verdict,
    en: `You may record your own stop. ${tail[0]}.`,
    es: `Puede grabar su propia parada. ${tail[1]}.` }
}

function unmarkedLine(code, cells) {
  const u = unmarked[code]
  const s = safeStop[code]
  const verdict = cells.officerCondition.verdict
  const cellCite = cited(cells.officerCondition)
  let kind = u?.kind
  let cite = u?.cite ?? null
  if (kind === 'eluding_element') { cite = cellCite; if (!cite) kind = undefined }
  if (kind === 'myth') cite = null
  let en, es, posture
  switch (kind) {
    case 'flat_bar':
      posture = 'flat_bar'
      en = `${withCite('Unmarked cars can\'t run routine traffic stops here', cite)} Still pull over; that rule is a defense in court, not a reason to keep driving.`
      es = `${withCite('Aquí los autos sin distintivos no pueden hacer paradas de tráfico de rutina', cite)} Aun así deténgase; esa regla es una defensa en el tribunal, no una razón para seguir manejando.`
      break
    case 'evidentiary':
      posture = 'evidentiary'
      en = `${withCite('An officer in an unmarked car on traffic duty can\'t testify against you here', cite)} Still pull over; that is for court.`
      es = `${withCite('Un oficial en auto sin distintivos en labores de tráfico no puede testificar en su contra aquí', cite)} Aun así deténgase; eso es para el tribunal.`
      break
    case 'eluding_element':
      posture = 'eluding_element'
      en = `${withCite('Whether the officer was identifiable is a defense to a fleeing charge here, argued after the fact', cite)} Pull over now.`
      es = `${withCite('Que el oficial fuera identificable es una defensa ante un cargo de huida aquí, que se argumenta después', cite)} Deténgase ahora.`
      break
    case 'agency_only':
      posture = 'agency_only'
      en = `${withCite('Markings are required here, but an arrest still stands without them', cite)} Pull over.`
      es = `${withCite('Aquí se exigen distintivos, pero un arresto sigue siendo válido sin ellos', cite)} Deténgase.`
      break
    case 'myth':
      posture = 'myth'
      en = 'No law here restricts unmarked cars, whatever you have read. Pull over; if unsure it is real, slow down and call 911 to confirm.'
      es = 'Ninguna ley aquí limita los autos sin distintivos, digan lo que digan. Deténgase; si duda que sea real, baje la velocidad y llame al 911 para confirmar.'
      break
    default:
      posture = 'universal'
      cite = null
      en = 'Pull over. If you doubt it is a real officer, slow down, hazards on, and call 911 to confirm while you stop.'
      es = 'Deténgase. Si duda que sea un oficial real, baje la velocidad, ponga las luces de emergencia y llame al 911 para confirmar mientras se detiene.'
  }
  if (s?.kind === 'manual_only') {
    en += ' The "well-lit place" advice is in the driver manual, not the law.'
    es += ' El consejo de "un lugar iluminado" está en el manual del conductor, no en la ley.'
  } else if (s) {
    en += ` ${withCite('Driving slowly to a lit place is a defense here if charged with fleeing, not a right to delay', s.cite)}`
    es += ` ${withCite('Ir despacio hasta un lugar iluminado es una defensa aquí si lo acusan de huir, no un derecho a demorarse', s.cite)}`
  }
  return { id: 'unmarked', posture, cite, verdict, en, es }
}

function reasonLine(code, cells) {
  if (!reasonForStop.includes(code)) return null
  const cell = cells.reasonForStop
  const cite = cited(cell)
  if (!cite) return null
  if (code === 'MN') {
    return { id: 'reason', posture: 'statutory_no_suppression', cite, verdict: cell.verdict,
      en: `${withCite('The officer must tell you why you were stopped and can\'t ask you to guess', cite)} Not telling you is no ground to throw out evidence.`,
      es: `${withCite('El oficial debe decirle por qué lo detuvo y no puede pedirle que adivine', cite)} Que no se lo diga no anula la evidencia.` }
  }
  return { id: 'reason', posture: 'statutory', cite, verdict: cell.verdict,
    en: withCite('The officer must tell you the reason for the stop', cite),
    es: withCite('El oficial debe decirle el motivo de la parada', cite) }
}

/** "90 days minimum" -> "90 días como mínimo". Anything the simple grammar
 * cannot carry (a quoted clause, a legal phrase) drops the number in Spanish
 * rather than shipping half a sentence in English. */
function retentionEs(r) {
  const simple = /^(at least |minimum |min\.? )?\d+ ?(days?|years?|months?)( minimum| min\.?)?(\s*\(local\)\s*\/\s*\d+ ?(days?|years?) \(state\))?$/i.test(r.trim())
  if (!simple) return null
  return r
    .replace(/at least /i, 'al menos ').replace(/\bminimum\b/i, 'como mínimo').replace(/\bmin\.?\b/i, 'como mínimo')
    .replace(/\bdays\b/gi, 'días').replace(/\bday\b/gi, 'día').replace(/\byears\b/gi, 'años').replace(/\byear\b/gi, 'año').replace(/\bmonths\b/gi, 'meses')
    .replace(/\(state\)/i, '(estatal)')
}

function footageLine(cells) {
  const cell = cells.footageAccess
  const cite = cited(cell)
  const retention = cell.tags?.retention
  if (!cite || !retention || /not stated/i.test(retention)) return null
  const es = retentionEs(retention)
  return { id: 'footage', posture: 'retention', cite, verdict: cell.verdict,
    en: withCite(`Ask for the body-cam footage soon; retention here is ${retention}`, cite),
    es: es ? withCite(`Pida pronto el video de la cámara corporal; aquí se conserva ${es}`, cite) : withCite('Pida pronto el video de la cámara corporal; la ley fija un plazo mínimo de conservación', cite) }
}

export function compileState(state) {
  const { code, name, cells } = state
  if (!ALL_CODES.includes(code)) throw new Error(`compileState: unknown jurisdiction ${code}`)
  const review = ATTORNEY_REVIEW[code]
  const lines = [
    silenceLine(code, cells), documentsLine(cells), passengerLine(code, cells), signLine(code, cells),
    searchLine(code, cells), firearmLine(code, cells), recordingLine(cells), unmarkedLine(code, cells),
    reasonLine(code, cells), footageLine(cells),
  ].filter(Boolean)
  return {
    code, name, nameEs: nameEs(code, name),
    review: { primaryText: true, attorney: !!review, attorneyReviewedBy: review ? { ...review } : null },
    notice: notice(code, name),
    remedyTier: consentRemedyTier[code] ?? null,
    lines,
  }
}

/* The words the Panic HUD needs around the lines. They live here, not in the
 * React app, because /app's rule is that no user-facing string is authored
 * in app-src (see App.tsx): content banks are generated, and this is one. */
export const UI = Object.freeze({
  panicButton: { en: 'Pulled over now', es: 'Me está parando la policía' },
  title: { en: 'Right now', es: 'Ahora mismo' },
  close: { en: 'Close', es: 'Cerrar' },
  yourState: { en: 'Your state', es: 'Su estado' },
  pickState: { en: 'Pick a state', es: 'Elija un estado' },
  federalOnly: { en: 'Federal baseline, any state', es: 'Base federal, cualquier estado' },
  federalNotice: { en: 'Pick your state for state-specific lines. Education, not legal advice.', es: 'Elija su estado para ver las líneas de su estado. Educación, no asesoría legal.' },
  likely: { en: 'reported, not verified', es: 'reportado, no verificado' },
  provisional: { en: 'Provisional: checked against the statute, not yet attorney-reviewed', es: 'Provisional: cotejado con la ley, aún sin revisión de abogado' },
  reviewed: { en: 'Reviewed by a licensed attorney', es: 'Revisado por un abogado con licencia' },
})

/* A row with nothing assessed: every compiler branch falls through to its
 * universal line, which is exactly the federal baseline shown before a state
 * is picked (and printed on the Armor card's back for unreviewed states). */
const BLANK = Object.fromEntries(COLUMNS.map((c) => [c.key, { verdict: 'UNASSESSED', cite: null, value: '', tags: {}, raw: '' }]))
export function federalLines() {
  return [silenceLine('US', BLANK), documentsLine(BLANK), searchLine('US', BLANK), passengerLine('US', BLANK), unmarkedLine('US', BLANK)]
}

export function compileAll(parsed) {
  const states = {}
  for (const s of [...parsed.states].sort((a, b) => a.code.localeCompare(b.code))) states[s.code] = compileState(s)
  const sourceHash = createHash('sha256').update(JSON.stringify(parsed.states)).digest('hex')
  return { version: 1, sourceHash, ui: UI, federal: federalLines(), states }
}
