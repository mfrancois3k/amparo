/* The Physical Armor card: a 3.5 x 2 in glovebox/wallet card, two faces.
 *
 * Pure TypeScript. No imports, no JSON: the hud data and the lifelines are
 * passed in, so the same function renders in the Convex Node runtime (Lob
 * takes inline HTML faces), in tools/render-armor-card.mjs (Chrome to PDF
 * and PNG) and in tests.
 *
 * THE GATE. The state side prints state-law lines only when
 * `hud.states[code].review.attorney` is true. Every other state prints the
 * federal baseline, the state's verified lifelines and the provisional notice
 * verbatim. Same rule as `held` in lib/products.ts, applied per state: what
 * has not passed attorney review is not sold as that state's law. Flipping a
 * state is a data change in tools/jurisdictions/overlays.mjs ATTORNEY_REVIEW,
 * not a code change here.
 *
 * Front strings are the five federal phrases from tools/render-kyr-card.mjs
 * (themselves verbatim from the arena drills), copied here so this module has
 * no runtime imports; armorCard.test.mts asserts they still match. */

export type HudLine = { id: string; posture: string; cite: string | null; verdict: string; en: string; es: string }
export type HudState = {
  code: string
  name: string
  nameEs?: string
  review: { primaryText: boolean; attorney: boolean; attorneyReviewedBy?: unknown }
  notice: { en: string; es: string }
  remedyTier: number | null
  lines: HudLine[]
}
export type HudFile = { version: number; sourceHash: string; states: Record<string, HudState>; federal?: HudLine[]; ui?: Record<string, { en: string; es: string }> }
export type Lifeline = { n: string; p: string }
export type Lang = 'en' | 'es'
export type Side = 'front' | 'back'

export const ARMOR_CARD_SIZE = { w: '3.5in', h: '2in', px300dpi: [1050, 600] as const }

export const FEDERAL_LINES = [
  { id: 'docs', label: { en: 'HANDING OVER DOCUMENTS', es: 'AL ENTREGAR DOCUMENTOS' }, en: '“My documents are in the glovebox — reaching for them now.”', es: '«Mis documentos están en la guantera — voy a alcanzarlos.»' },
  { id: 'guess', label: { en: 'IF ASKED “DO YOU KNOW WHY…”', es: 'SI PREGUNTAN «SABE POR QUÉ…»' }, en: '“I’d rather not guess, officer.”', es: '«Prefiero no adivinar, oficial.»' },
  { id: 'silence', label: { en: 'TO STAY SILENT — SAY IT', es: 'PARA GUARDAR SILENCIO — DÍGALO' }, en: '“I choose to remain silent.”', es: '«Elijo guardar silencio.»' },
  { id: 'search', label: { en: 'IF ASKED TO SEARCH', es: 'SI PIDEN REGISTRAR' }, en: '“I do not consent to a search.”', es: '«No doy consentimiento a un registro.»' },
  { id: 'free', label: { en: 'WHEN IT SEEMS OVER', es: 'CUANDO PAREZCA TERMINAR' }, en: '“Am I free to go?”', es: '«¿Soy libre de irme?»' },
] as const

const TITLE = { en: 'What to say at a traffic stop', es: 'Qué decir en una parada de tráfico' }
const FOOT = { en: 'amparohq.com · Not legal advice', es: 'amparohq.com · No es asesoría legal' }
const CARRIED = { en: 'Carried by', es: 'Portada por' }
const YOUR_STATE = { en: 'Your state', es: 'Tu estado' }
const FEDERAL_ONLY = { en: 'Federal baseline, any state', es: 'Base federal, cualquier estado' }
const HELP = { en: 'Real help', es: 'Ayuda real' }
const PRACTICE = { en: 'Practice it', es: 'Practica' }
const REVIEWED = { en: 'Reviewed for this state', es: 'Revisado para este estado' }
const STATE_LINE_IDS = ['silence', 'sign', 'search', 'passenger', 'firearm']

export const esc = (s: unknown): string =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

const MARK = `<svg class="mk" viewBox="0 0 120 120" aria-hidden="true"><g transform="rotate(-90 60 72)"><circle cx="60" cy="72" r="27" fill="none" stroke="#E8B84B" stroke-width="10"/></g><path d="M46 49 h17 l10 10 v26 a3 3 0 0 1 -3 3 h-24 a3 3 0 0 1 -3 -3 v-33 a3 3 0 0 1 3 -3 z" fill="#1B2A4A"/><path d="M14 61 L60 19 L106 61" fill="none" stroke="#1B2A4A" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/></svg>`

/* Sizes are the ones tools/render-kyr-card.mjs proved on paper: 7.4pt say
 * lines, 4.6pt labels, five rows on a 2in face. The back runs smaller because
 * it carries a paragraph. */
export const ARMOR_CSS = `
.armor{position:relative;box-sizing:border-box;width:${ARMOR_CARD_SIZE.w};height:${ARMOR_CARD_SIZE.h};padding:.11in .13in .08in;background:#FAF6EE;color:#1B2A4A;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;overflow:hidden;display:flex;flex-direction:column;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.armor .bar{position:absolute;left:0;right:0;top:0;height:.05in;background:#1B2A4A}
.armor .head{display:flex;align-items:center;gap:.05in;margin-bottom:.02in}
.armor .mk{width:.13in;height:.13in;flex:none}
.armor .t{font-family:Georgia,"Times New Roman",serif;font-weight:700;font-size:7.6pt;line-height:1.1}
.armor .tag{margin-left:auto;font-size:4.4pt;font-weight:700;letter-spacing:.5px;color:#a87f1f;text-transform:uppercase}
.armor .row{display:flex;flex-direction:column;margin-top:1.3pt}
.armor .lb{font-size:4.5pt;font-weight:600;letter-spacing:.4px;color:#8a7a52}
.armor .say{font-family:Georgia,serif;font-size:7.2pt;font-weight:700;line-height:1.14}
.armor .foot{margin-top:auto;font-size:4.6pt;color:#6b7a94;display:flex;justify-content:space-between;gap:.06in}
.armor--back .ln{margin-top:1.4pt;font-size:5.3pt;line-height:1.2}
.armor--back .ln .c{color:#a87f1f;font-size:4.4pt;white-space:nowrap}
.armor--back .notice{font-size:4.9pt;line-height:1.22;border-left:2px solid #E8B84B;padding-left:.05in;margin:.02in 0 .03in;color:#4a4032}
.armor--back .ll{font-size:5.1pt;line-height:1.22;margin-top:1pt}
.armor--back .ll b{color:#1B2A4A}
.armor--back .ll span{color:#3d4a63}
`

function stateOf(hud: HudFile, code: string): HudState | null {
  if (code === 'US') return null
  const st = hud.states[code]
  if (!st) throw new Error(`armorCard: unknown jurisdiction ${code}`)
  return st
}

function front(lang: Lang, name?: string): string {
  const rows = FEDERAL_LINES.map((l) => `<div class="row"><span class="lb">${esc(l.label[lang])}</span><span class="say">${esc(l[lang])}</span></div>`).join('')
  const carried = name ? `<span>${esc(CARRIED[lang])} ${esc(name)}</span>` : '<span></span>'
  return `<div class="armor armor--front"><div class="bar"></div><div class="head">${MARK}<span class="t">${esc(TITLE[lang])}</span></div>${rows}<div class="foot">${carried}<span>${esc(FOOT[lang])}</span></div></div>`
}

function back(hud: HudFile, code: string, lang: Lang, lifelines: Lifeline[]): string {
  const st = stateOf(hud, code)
  const title = st ? (lang === 'es' ? (st.nameEs ?? st.name) : st.name) : FEDERAL_ONLY[lang]
  const practice = `amparohq.com/rehearse${st ? `?state=${st.code}` : ''}`
  const ll = lifelines.slice(0, 3).map((l) => `<div class="ll"><b>${esc(l.n)}</b> <span>${esc(l.p)}</span></div>`).join('')
  const help = ll ? `<div class="row"><span class="lb">${esc(HELP[lang])}</span></div>${ll}` : ''
  const foot = `<div class="foot"><span>${esc(PRACTICE[lang])}: ${esc(practice)}</span><span>${esc(FOOT[lang])}</span></div>`

  if (st && st.review.attorney) {
    const lines = STATE_LINE_IDS.map((id) => st.lines.find((l) => l.id === id)).filter((l): l is HudLine => !!l)
    // the cite prints as its own small gold run, so it comes out of the sentence
    const body = lines.map((l) => `<div class="ln">${esc(l.cite ? l[lang].split(` (${l.cite})`).join('') : l[lang])}${l.cite ? ` <span class="c">${esc(l.cite)}</span>` : ''}</div>`).join('')
    return `<div class="armor armor--back"><div class="bar"></div><div class="head">${MARK}<span class="t">${esc(YOUR_STATE[lang])}: ${esc(title)}</span><span class="tag">${esc(REVIEWED[lang])}</span></div>${body}${foot}</div>`
  }
  const notice = st ? st.notice[lang] : ''
  return `<div class="armor armor--back"><div class="bar"></div><div class="head">${MARK}<span class="t">${esc(st ? `${YOUR_STATE[lang]}: ${title}` : title)}</span></div>${notice ? `<div class="notice">${esc(notice)}</div>` : ''}${help}${foot}</div>`
}

/** One face of the card as a self-contained HTML fragment (styles included). */
export function armorCardHtml(input: { code: string; lang: Lang; side: Side; hud: HudFile; lifelines?: Lifeline[]; name?: string }): string {
  const face = input.side === 'front' ? front(input.lang, input.name) : back(input.hud, input.code, input.lang, input.lifelines ?? [])
  return `<style>${ARMOR_CSS}</style>${face}`
}

/** A 4x6 postcard face for Lob (6.25 x 4.25 in artwork incl. bleed). The
 * front centres the card at true size; the back keeps the state side on the
 * left and leaves the right 2.5 in blank, where Lob prints the address. */
export function armorPostcardHtml(input: { code: string; lang: Lang; side: Side; hud: HudFile; lifelines?: Lifeline[]; name?: string }): string {
  const card = armorCardHtml(input)
  const place = input.side === 'front'
    ? `<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)">${card}</div>`
    : `<div style="position:absolute;left:.25in;top:50%;transform:translateY(-50%)">${card}</div><div data-address-zone style="position:absolute;right:0;top:0;width:2.5in;height:100%"></div>`
  return `<!doctype html><html><head><meta charset="utf-8"><title>Amparo Armor card</title><style>@page{size:6.25in 4.25in;margin:0}html,body{margin:0}body{width:6.25in;height:4.25in;position:relative;background:#FAF6EE;overflow:hidden}</style></head><body>${place}</body></html>`
}

/** US Letter, Avery 5371 ten-up: page 1 fronts, page 2 backs mirrored so a
 * long-edge duplex print lines every back up with its front. Same grid as
 * tools/render-kyr-card.mjs. */
export function armorPrintSheetHtml(input: { code: string; lang?: Lang; hud: HudFile; lifelines?: Lifeline[]; name?: string }): string {
  const lang = input.lang ?? 'en'
  const cell = (side: Side, mirror: boolean) => {
    const cells: string[] = []
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 2; c++) {
        const col = mirror ? 1 - c : c
        const left = 0.75 + col * 3.5
        const top = 0.5 + r * 2
        const face = side === 'front' ? front(lang, input.name) : back(input.hud, input.code, lang, input.lifelines ?? [])
        cells.push(`<div class="cell" style="left:${left}in;top:${top}in">${face}</div>`)
      }
    }
    return cells.join('')
  }
  return `<!doctype html><html><head><meta charset="utf-8"><title>Amparo Armor card ${esc(input.code)} — Avery 5371</title><style>@page{size:letter;margin:0}html,body{margin:0}.page{position:relative;width:8.5in;height:11in;page-break-after:always;overflow:hidden;background:#fff}.cell{position:absolute;width:3.5in;height:2in}.cell .armor{outline:.5px dashed #b9ae94}${ARMOR_CSS}</style></head><body><div class="page">${cell('front', false)}</div><div class="page">${cell('back', true)}</div></body></html>`
}
