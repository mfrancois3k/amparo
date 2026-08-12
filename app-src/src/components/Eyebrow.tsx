/* Step counter + travelling state pill. wargames/15 Move 4.2.
 * Ported from eyebrow() (index.html:2912-2921).
 */
import { US_STATE_NAMES } from '../content/states.json'
import { StateSilhouette } from './StateMap'
import type { Bank } from '../i18n'

const NAMES = US_STATE_NAMES as Record<string, string>

type Props = { t: Bank; step: number; state: string | null; onPillClick: () => void }

export function Eyebrow({ t, step, state, onPillClick }: Props) {
  if (step < 1) return null
  const hasPill = !!(state && step > 1 && NAMES[state])
  return (
    <div className={`eyebrow${hasPill ? ' has-pill' : ''}`}>
      <span>{t.stepWord} <b>{step}</b> / {t.stepLabels.length} · {t.stepLabels[step - 1]}</span>
      {hasPill && state ? (
        <button type="button" className="st-pill" onClick={onPillClick}
          title={t.s_change} aria-label={`${NAMES[state]} — ${t.s_change}`}>
          <StateSilhouette code={state} /><b>{state}</b><span className="sp-nm">{NAMES[state]}</span>
        </button>
      ) : null}
    </div>
  )
}
