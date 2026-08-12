/* State selection (step 1). wargames/15 Move 3.2, build order step 10.
 * Ported from index.html:3216-3269, filterStates (3793-3804), pickState (3828-3844).
 */
import { useMemo, useState } from 'react'
import { StateMap, StateSilhouette } from '../components/StateMap'
import { CODES } from '../content/map'
import { CITED } from '../content/meta.json'
import { US_STATE_NAMES } from '../content/states.json'
import type { Bank } from '../i18n'

const NAMES = US_STATE_NAMES as Record<string, string>

/* Which states have real cited statute content. Extracted as a derived list
   rather than read from STATES: root asks `!STATES[k].pending`, but importing
   STATES for that costs ~6 kB gzipped in this chunk to learn three key names. */
const CITED_SET: ReadonlySet<string> = new Set(CITED as readonly string[])
const isCited = (code: string) => CITED_SET.has(code)

type Props = {
  t: Bank
  picked: string | null
  onPick: (code: string) => void
  onBack: () => void
  onNext: () => void
}

export function StateStep({ t, picked, onPick, onBack, onNext }: Props) {
  const [query, setQuery] = useState('')
  /* "Not your state?" re-opens the map without clearing the pick — root's
     uncollapseStateGrid (index.html:3952) keeps the original selection. */
  const [showAll, setShowAll] = useState(false)

  const collapsed = picked !== null && !showAll

  /* Search matches name or abbreviation, same as root's filterStates. Returns
     null when there is no query so the map can skip dimming entirely. */
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return new Set(
      CODES.filter((c) => c.toLowerCase().includes(q) || (NAMES[c] ?? '').toLowerCase().includes(q)),
    )
  }, [query])

  const noMatch = matches !== null && matches.size === 0

  const handlePick = (code: string) => {
    /* Order matters: closing "show all" first means re-picking the SAME state
       after uncollapsing still re-collapses the card. Root leaves that case
       inert because pickState bails when the code is unchanged. */
    setShowAll(false)
    if (code !== picked) onPick(code)
  }

  return (
    <div className="card">
      <button className="back" aria-label={t.a11y_back} onClick={onBack}>← {t.a11y_back}</button>

      <h1>{t.s_title}</h1>
      <p className="sub">{t.s_sub}</p>

      {/* `hidden` is native: it drops the subtree from layout AND the
          accessibility tree, so a keyboard user never tabs through 51 targets
          that are not on screen. .sm-wrap deliberately sets no `display`, which
          would beat [hidden]{display:none}. */}
      <div hidden={collapsed}>
        <StateMap
          picked={picked}
          matches={matches}
          names={NAMES}
          isCited={isCited}
          t={t}
          onPick={handlePick}
        />
        {/* aria-label AND placeholder: a placeholder stops being the accessible
            name once text is typed, leaving the field unnamed mid-search.
            Flagged in two consecutive focus groups (index.html:3237-3239). */}
        <input
          type="text"
          className="state-search"
          aria-label={t.s_search}
          placeholder={t.s_search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
          inputMode="text"
        />
      </div>

      {collapsed && picked ? (
        <>
          <div className="state-confirmed">
            <StateSilhouette code={picked} />
            <span className="badge">✓</span>
            <span className="nm">{NAMES[picked] ?? picked}</span>
            <span className="ab">{picked}</span>
          </div>
          <button type="button" className="linkbtn state-change" onClick={() => setShowAll(true)}>
            {t.s_change}
          </button>
        </>
      ) : null}

      {noMatch ? <p className="soon" role="status">{t.s_nomatch}</p> : null}
      {!collapsed ? <p className="soon">{t.s_soon}</p> : null}

      <button className="btn gold" onClick={onNext} disabled={!picked}>{t.next} →</button>

      {/* DEFERRED, logged not omitted: skipToPack (index.html:3266) needs the pack
          screen from Move 4.3, and finishLater (3267) writes an .ics reminder that
          belongs with the rest of the pack flow. Neither is dropped from parity —
          both are recorded in the migration log. */}
    </div>
  )
}
