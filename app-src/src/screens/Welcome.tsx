/* Welcome (step 0). wargames/15 Move 3.1, build order step 6.
 * Ported from index.html:3187-3203 and trustChips (2924-2930).
 *
 * Every string comes from the extracted banks. Destinations that do not exist in
 * /app yet point at the live app with an explicit `href="/"` rather than being
 * stubbed — a dead button that looks alive is the "convincing stub" this project
 * keeps warning about. The gold CTA is the exception: the state screen ships in
 * this same phase, so it navigates in-app.
 */
import type { Bank } from '../i18n'

type Props = {
  t: Bank
  founder: string
  onStart: () => void
}

export function Welcome({ t, founder, onStart }: Props) {
  const feats: Array<[string, string]> = [
    [t.w_b1, '🗣'], [t.w_b2, '📍'], [t.w_b3, '🖨'], [t.w_b4, '🔒'],
  ]

  return (
    <div className="card">
      <h1>{t.w_title}</h1>
      <p className="sub">{t.w_sub}</p>

      {feats.map(([label, icon]) => (
        <div className="feat" key={label}><span className="fi">{icon}</span>{label}</div>
      ))}

      {/* Root also renders a `tc_reviewed` chip, gated on isReviewed(state)
          (index.html:2926). No attorney has signed any edition — every
          REVIEW.attorneys entry is an empty string — so the chip is structurally
          false today and is omitted rather than rendered optimistically. It
          returns for free once an attorney signs, because CITED is extracted. */}
      <div className="trust-strip">
        <span className="trust-chip">🔒 {t.tc_private}</span>
        {founder ? <span className="trust-chip">👤 {t.tc_by} {founder}</span> : null}
      </div>

      <button className="btn gold" onClick={onStart}>{t.w_btn}</button>

      {/* Same destination as the primary CTA, not a shortcut past State —
          resolveState(null) falls back to NY (see statesResolved.ts), so
          skipping state selection would silently show the wrong state's
          lifelines. This is a lower-commitment doorway into the same first
          step, not a new route. Found by the 2026-08-16 loop's Mobbin
          research: apps that surface a locator well put it near the top,
          not buried with the other links below. */}
      <button className="linkbtn" style={{ marginTop: 6 }} onClick={onStart}>{t.w_lifelines_shortcut}</button>

      {/* Practice hub is Phase 5. Until then this is an honest link to the app
          that has it, not a button that does nothing. */}
      <a className="btn ghost" href="/">{t.w_try}</a>

      <div className="lawnote small">{t.law_marker}</div>

      <a className="linkbtn" href="/">👀 {t.w_sample}</a>
      <a className="linkbtn" href="/">{t.w_share}</a>
      <a className="linkbtn" href="/">{t.about_link}</a>
      <a className="linkbtn" href="/">{t.doc_link}</a>
    </div>
  )
}
