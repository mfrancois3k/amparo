/**
 * Compiles the parsed matrix + overlays into the Panic HUD lines: the eight to
 * ten sentences a driver needs on the shoulder, per state, in both languages.
 *
 * Rules of the compiler:
 *  - A line's citation is the verified cell's citation unless the overlay
 *    states one from the findings. The compiler never invents a section.
 *  - Where the research has nothing for a state, the line says the universal
 *    thing and says nothing state-specific. Absence is silence, not a guess.
 *  - Every state renders under the provisional-education notice until
 *    ATTORNEY_REVIEW names a reviewer for it.
 *  - Output is deterministic: same inputs, byte-identical JSON.
 */
import { createHash } from 'node:crypto'
import { COLUMNS } from './parse.mjs'
import {
  ALL_CODES, ATTORNEY_REVIEW, consentRemedyTier, cannabisOdor, signPosture, speech, firearm,
  passengerException, unmarked, safeStop, reasonForStop,
} from './overlays.mjs'

export const LINE_IDS = Object.freeze(['silence', 'documents', 'passenger', 'sign', 'search', 'firearm', 'recording', 'unmarked', 'reason', 'footage'])

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

function notice(name) {
  return {
    en: `${name}: checked against the statute text, not yet reviewed by a ${name}-licensed attorney. Education, not legal advice.`,
    es: `${name}: cotejado con el texto de la ley, aún no ha sido revisado por un abogado con licencia en ${name}. Educación, no asesoría legal.`,
  }
}

function silenceLine(code, cells) {
  const lying = speech.lyingIsCrime[code]
  const refusal = speech.refusalIsOffense[code]
  if (refusal) {
    const t = {
      OH: ['If the officer suspects you of an offense, you must give your name, address and date of birth', 'Nothing more; refusing anything beyond that is not arrestable', 'Si el oficial sospecha que cometiste un delito, debes dar tu nombre, dirección y fecha de nacimiento', 'Nada más; negarte a más no es motivo de arresto'],
      AZ: ['If the officer tells you refusing is unlawful, give your true full name', 'Nothing more is required; you can stay silent on everything else', 'Si el oficial te dice que negarte es ilegal, da tu nombre completo verdadero', 'No se exige nada más; puedes guardar silencio sobre todo lo demás'],
      UT: ['You must give your name if the officer suspects you of an offense, unless answering could incriminate you', 'Beyond that, stay silent', 'Debes dar tu nombre si el oficial sospecha que cometiste un delito, salvo que responder pueda incriminarte', 'Más allá de eso, guarda silencio'],
    }[code]
    return { id: 'silence', posture: 'refusal_offense_limited', cite: refusal.cite, verdict: cells.stopAndId.verdict,
      en: `${withCite(t[0], refusal.cite)} ${t[1]}.`, es: `${withCite(t[2], refusal.cite)} ${t[3]}.` }
  }
  if (speech.declineExpresslyPreserved.includes(code)) {
    return { id: 'silence', posture: 'decline_preserved', cite: lying, verdict: cells.stopAndId.verdict,
      en: `${withCite('You can decline to speak; the law says so', lying)} If you do answer, it must be true.`,
      es: `${withCite('Puedes negarte a hablar; la ley lo dice', lying)} Si respondes, tiene que ser verdad.` }
  }
  if (lying) {
    return { id: 'silence', posture: 'lying_is_crime', cite: lying, verdict: cells.stopAndId.verdict,
      en: `You can stay silent. ${withCite('Giving a false name or answer is a crime here', lying)}`,
      es: `Puedes guardar silencio. ${withCite('Dar un nombre o una respuesta falsa es un delito aquí', lying)}` }
  }
  return { id: 'silence', posture: 'universal', cite: null, verdict: cells.stopAndId.verdict,
    en: 'You can stay silent. If you do answer, it must be true.',
    es: 'Puedes guardar silencio. Si respondes, tiene que ser verdad.' }
}

function documentsLine(cells) {
  const cite = cited(cells.driverId)
  return { id: 'documents', posture: 'universal', cite, verdict: cells.driverId.verdict,
    en: `${withCite('When asked, hand over license, registration and insurance', cite)} Say what you're reaching for before you move.`,
    es: `${withCite('Cuando te los pidan, entrega licencia, registro y seguro', cite)} Di qué vas a tomar antes de moverte.` }
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
  const act = p?.operativeAct === 'accept' ? ['Accept', 'Acepta', 'accepting', 'aceptar'] : ['Sign', 'Firma', 'signing', 'firmar']
  switch (p?.posture) {
    case 'crime':
      return { id: 'sign', posture: 'crime', cite, verdict,
        en: `Sign the ticket. ${withCite('Refusing is a misdemeanor here', cite)} Signing is a promise to appear, not an admission.`,
        es: `Firma la multa. ${withCite('Negarte es un delito menor aquí', cite)} Firmar es una promesa de comparecer, no una admisión.` }
    case 'arrest_trigger':
      return { id: 'sign', posture: 'arrest_trigger', cite, verdict,
        en: `${act[0]} the ticket. ${withCite('Refusing can get you arrested here', cite)} It is not an admission of guilt.`,
        es: `${act[1]} la multa. ${withCite('Negarte puede llevarte al arresto aquí', cite)} No es admisión de culpa.` }
    case 'release_or_bond':
      return { id: 'sign', posture: 'release_or_bond', cite, verdict,
        en: `${withCite('Sign the ticket; it is your promise to appear and it gets you released', cite)} Refusing can cost you that release.`,
        es: `${withCite('Firma la multa; es tu promesa de comparecer y te permite irte', cite)} Negarte puede costarte esa liberación.` }
    case 'harmless':
      if (code === 'VA') {
        return { id: 'sign', posture: 'harmless', cite, verdict,
          en: `${withCite('Signing is only a promise to appear', cite)} If you refuse, the officer notes it and you are released anyway.`,
          es: `${withCite('Firmar es solo una promesa de comparecer', cite)} Si te niegas, el oficial lo anota y te dejan ir de todos modos.` }
      }
      return { id: 'sign', posture: 'harmless', cite, verdict,
        en: `${withCite(`${act[0]} the ticket; ${act[2]} it is not an admission and refusing carries no stated penalty here`, cite)} Take it and go.`,
        es: `${withCite(`${act[1]} la multa; ${act[3]} no es una admisión y negarte no tiene sanción establecida aquí`, cite)} Tómala y sigue.` }
    default:
      return { id: 'sign', posture: p?.posture || 'unstated', cite, verdict,
        en: `${withCite(`${act[0]} the ticket if asked. It is a promise to appear, not an admission of guilt`, cite)}`,
        es: `${withCite(`${act[1]} la multa si te lo piden. Es una promesa de comparecer, no una admisión de culpa`, cite)}` }
  }
}

function searchLine(code, cells) {
  const c = cannabisOdor[code]
  const base = ['Say: I do not consent to any search. Don\'t resist; say it and let the record show it', 'Di: No doy consentimiento para ningún registro. No te resistas; dilo y que conste']
  if (c) {
    const extraEn = c.kind === 'statute' || c.kind === 'both' ? c.en : c.en
    return { id: 'search', posture: `cannabis_${c.kind}`, cite: c.cite, verdict: cells.consentSearch.verdict,
      en: `${base[0]}. ${extraEn.replace(/\.$/, '')} (${c.cite}).`,
      es: `${base[1]}. ${c.es.replace(/\.$/, '')} (${c.cite}).` }
  }
  if (code === 'WV') {
    const cite = cited(cells.consentSearch)
    return { id: 'search', posture: 'consent_form_no_remedy', cite, verdict: cells.consentSearch.verdict,
      en: `${base[0]}. ${withCite('Here the officer needs probable cause or your written or recorded consent', cite)} A breach of that rule is not by itself a remedy.`,
      es: `${base[1]}. ${withCite('Aquí el oficial necesita causa probable o tu consentimiento escrito o grabado', cite)} Que incumplan esa regla no es por sí solo un remedio.` }
  }
  return { id: 'search', posture: 'universal', cite: null, verdict: cells.consentSearch.verdict, en: `${base[0]}.`, es: `${base[1]}.` }
}

function firearmLine(code, cells) {
  const g = group(code)
  const cite = cited(cells.firearmInform)
  const t = {
    proactive: ['Tell the officer right away if there is a gun in the car', 'Avisa de inmediato al oficial si hay un arma en el auto'],
    onRequest: ['If asked, say whether you are carrying a firearm', 'Si te preguntan, di si llevas un arma de fuego'],
    accuracyOnly: ['You do not have to volunteer a firearm, but if you answer it must be true', 'No tienes que mencionar un arma por tu cuenta, pero si respondes tiene que ser verdad'],
    inverse: ['No duty to disclose a firearm here, and the officer can\'t detain you just to check your carry status', 'Aquí no hay obligación de declarar un arma, y el oficial no puede detenerte solo para revisar tu permiso'],
    none: ['No statute here requires you to announce a firearm. If asked, answer truthfully', 'Ninguna ley aquí te obliga a anunciar un arma. Si te preguntan, responde con verdad'],
    unassessed: ['Not yet researched for this state. If asked, answer truthfully', 'Aún no investigado para este estado. Si te preguntan, responde con verdad'],
  }[g]
  const useCite = g === 'none' || g === 'unassessed' ? null : cite
  let en = `${withCite(t[0], useCite)} Keep your hands still and visible.`
  let es = `${withCite(t[1], useCite)} Mantén las manos quietas y a la vista.`
  if (firearm.hands[code]) {
    en += ` ${withCite('Never reach for or touch the weapon, even to hand it over; that alone is an offense', firearm.hands[code])}`
    es += ` ${withCite('Nunca toques ni intentes entregar el arma; eso por sí solo es un delito', firearm.hands[code])}`
  }
  if (firearm.secure[code]) {
    en += ` ${withCite('Let the officer secure it', firearm.secure[code])}`
    es += ` ${withCite('Deja que el oficial la asegure', firearm.secure[code])}`
  }
  return { id: 'firearm', posture: g, cite: useCite, verdict: cells.firearmInform.verdict, en, es }
}

function recordingLine(cells) {
  const cell = cells.recording
  const cite = cited(cell)
  const tail = ['Say you are recording, keep your hands visible, and do not interfere', 'Di que estás grabando, mantén las manos a la vista y no interfieras']
  if (cell.verdict === 'LIKELY') {
    return { id: 'recording', posture: 'likely', cite, verdict: cell.verdict,
      en: `${withCite('You may record your own stop; the wiretap law here is reported not to reach it, a court-made exception not yet body-verified', cite)} ${tail[0]}.`,
      es: `${withCite('Puedes grabar tu propia parada; se reporta que la ley de escuchas aquí no lo alcanza, una excepción judicial aún no verificada en el texto', cite)} ${tail[1]}.` }
  }
  if (cell.verdict === 'NULL') {
    return { id: 'recording', posture: 'no_statute', cite: null, verdict: cell.verdict,
      en: `No wiretap law here applies to recording your own stop. ${tail[0]}.`,
      es: `Ninguna ley de escuchas aquí aplica a grabar tu propia parada. ${tail[1]}.` }
  }
  return { id: 'recording', posture: 'universal', cite, verdict: cell.verdict,
    en: `${withCite('You may record your own stop; the wiretap law here does not reach it', cite)} ${tail[0]}.`,
    es: `${withCite('Puedes grabar tu propia parada; la ley de escuchas aquí no lo alcanza', cite)} ${tail[1]}.` }
}

function unmarkedLine(code, cells) {
  const u = unmarked[code]
  const s = safeStop[code]
  const verdict = cells.officerCondition.verdict
  const cite = u?.cite || cited(cells.officerCondition)
  let en, es, posture
  switch (u?.kind) {
    case 'flat_bar':
      posture = 'flat_bar'
      en = `${withCite('Unmarked cars can\'t run routine traffic stops here', cite)} Still pull over; that rule is a defense in court, not a reason to keep driving.`
      es = `${withCite('Aquí los autos sin distintivos no pueden hacer paradas de tráfico de rutina', cite)} Aun así detente; esa regla es una defensa en el tribunal, no una razón para seguir manejando.`
      break
    case 'evidentiary':
      posture = 'evidentiary'
      en = `${withCite('An officer in an unmarked car on traffic duty can\'t testify against you here', cite)} Still pull over; that is for court.`
      es = `${withCite('Un oficial en auto sin distintivos en labores de tráfico no puede testificar en tu contra aquí', cite)} Aun así detente; eso es para el tribunal.`
      break
    case 'eluding_element':
      posture = 'eluding_element'
      en = `${withCite('Whether the officer was identifiable is a defense to a fleeing charge here, argued after the fact', cite)} Pull over now.`
      es = `${withCite('Que el oficial fuera identificable es una defensa ante un cargo de huida aquí, que se argumenta después', cite)} Detente ahora.`
      break
    case 'agency_only':
      posture = 'agency_only'
      en = `${withCite('Markings are required here, but an arrest still stands without them', cite)} Pull over.`
      es = `${withCite('Aquí se exigen distintivos, pero un arresto sigue siendo válido sin ellos', cite)} Detente.`
      break
    case 'myth':
      posture = 'myth'
      en = 'No law here restricts unmarked cars, whatever you have read. Pull over; if unsure it is real, slow down and call 911 to confirm.'
      es = 'Ninguna ley aquí limita los autos sin distintivos, digan lo que digan. Detente; si dudas que sea real, baja la velocidad y llama al 911 para confirmar.'
      break
    default:
      posture = 'universal'
      en = 'Pull over. If you doubt it is a real officer, slow down, hazards on, and call 911 to confirm while you stop.'
      es = 'Detente. Si dudas que sea un oficial real, baja la velocidad, luces de emergencia, y llama al 911 para confirmar mientras te detienes.'
  }
  if (s?.kind === 'manual_only') {
    en += ' The "well-lit place" advice is in the driver manual, not the law.'
    es += ' El consejo de "un lugar iluminado" está en el manual del conductor, no en la ley.'
  } else if (s) {
    en += ` ${withCite('Driving slowly to a lit place is a defense here if charged with fleeing, not a right to delay', s.cite)}`
    es += ` ${withCite('Ir despacio hasta un lugar iluminado es una defensa aquí si te acusan de huir, no un derecho a demorarte', s.cite)}`
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
      es: `${withCite('El oficial debe decirte por qué te detuvo y no puede pedirte que adivines', cite)} Que no te lo diga no anula la evidencia.` }
  }
  return { id: 'reason', posture: 'statutory', cite, verdict: cell.verdict,
    en: withCite('The officer must tell you the reason for the stop', cite),
    es: withCite('El oficial debe decirte el motivo de la parada', cite) }
}

function footageLine(cells) {
  const cell = cells.footageAccess
  const cite = cited(cell)
  const retention = cell.tags?.retention
  if (!cite || !retention || /not stated/i.test(retention)) return null
  return { id: 'footage', posture: 'retention', cite, verdict: cell.verdict,
    en: `${withCite(`Ask for the body-cam footage soon; retention here is ${retention}`, cite)}`,
    es: `${withCite(`Pide pronto el video de la cámara corporal; aquí se conserva ${retention.replace('days minimum', 'días mínimo').replace('days', 'días')}`, cite)}` }
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
    code, name,
    review: { primaryText: true, attorney: !!review, attorneyReviewedBy: review ? { ...review } : null },
    notice: notice(name),
    remedyTier: consentRemedyTier[code] ?? null,
    lines,
  }
}

/* The words the Panic HUD needs around the lines. They live here, not in the
 * React app, because /app's rule is that no user-facing string is authored
 * in app-src (see App.tsx): content banks are generated, and this is one. */
export const UI = Object.freeze({
  panicButton: { en: 'Pulled over now', es: 'Me detuvieron ahora' },
  title: { en: 'Right now', es: 'Ahora mismo' },
  close: { en: 'Close', es: 'Cerrar' },
  yourState: { en: 'Your state', es: 'Tu estado' },
  pickState: { en: 'Pick a state', es: 'Elige un estado' },
  federalOnly: { en: 'Federal baseline, any state', es: 'Base federal, cualquier estado' },
  federalNotice: { en: 'Pick your state for state-specific lines. Education, not legal advice.', es: 'Elige tu estado para ver las líneas de tu estado. Educación, no asesoría legal.' },
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
