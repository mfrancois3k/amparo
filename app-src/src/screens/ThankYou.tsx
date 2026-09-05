/* Step 5. Root replaced its in-page drill engine with this screen in v2.27.0
 * ("one practice surface, and a road that actually leads to it"): the Arena is
 * the only place anyone rehearses, and step 5's job is to confirm the pack and
 * point at it. /app kept a second copy of the deleted engine for three weeks,
 * which is how its content bank came to depend on 194 strings the page no
 * longer declares (found by the 2026-09-03 audit, when `verify:content` was
 * repaired). This screen is that consolidation, finished.
 *
 * Chips mirror root's own three (pack.html:3009-3015) and every string comes
 * from the extracted bank, like the rest of /app. */
import type { Bank } from '../i18n'
import { readRootDocs, readApp } from '../services/storage'
import { CITED } from '../content/meta.json'
/* Named import: US_STATE_NAMES alone is 0.51 kB gzip, the whole default is
   28 kB (see .oxlintrc.json). Root's chip names the state, so this one does. */
import { US_STATE_NAMES } from '../content/states.json'

interface ThankYouProps {
  t: Bank
  state: string | null
  onBack: () => void
}

export function ThankYou({ t, state, onBack }: ThankYouProps) {
  const cited = !!state && (CITED as readonly string[]).includes(state)
  const printed = readApp<boolean>('printed', false)
  const docs = Object.keys(readRootDocs()).length > 0
  const chips: { ok: boolean; text: string }[] = [
    { ok: !!state, text: state ? `${(US_STATE_NAMES as Record<string, string>)[state] ?? state} — ${cited ? t.ty_chip_state : t.ty_chip_state_fed}` : t.ty_chip_state_fed },
    { ok: printed, text: printed ? t.ty_chip_print : t.ty_chip_print_no },
    { ok: docs, text: docs ? t.ty_chip_docs : t.ty_chip_docs_no },
  ]

  return (
    <div className="card">
      <h1>{t.ty_title}</h1>
      <p className="sub">{t.ty_sub}</p>

      <ul className="ty-chips">
        {chips.map((c) => (
          <li key={c.text} className={c.ok ? 'ty-chip ok' : 'ty-chip'}>{c.ok ? '✓' : '○'} {c.text}</li>
        ))}
      </ul>

      {/* Relative link, deliberately: it keeps sr_save on the same origin, so
          the Arena opens already tuned to this state with no handoff code. */}
      <a className="btn gold" href="/arena/" style={{ textAlign: 'center', textDecoration: 'none' }}>{t.ty_cta}</a>
      <p className="soon">{t.ty_cta_sub}</p>
      <p className="lawnote small">{t.ty_note}</p>

      <button className="back" aria-label={t.a11y_back} onClick={onBack}>&larr; {t.a11y_back}</button>
    </div>
  )
}
