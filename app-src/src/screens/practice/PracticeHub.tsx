/* Practice hub — the module-tab entry screen. Ported from root's step 5
 * (index.html:3420-3483), which is the screen /app SHOULD have built as its
 * practice entry point from the start.
 *
 * wargames/18's parity audit found /app had ported the wrong screen: the
 * practice overlay's INTERNAL fallback list (index.html:5445-5454, the flat
 * `.prx-list` reachable from inside a run via "← All scenarios"), not this
 * hub. The difference is not cosmetic. Root deliberately split the Border
 * Patrol checkpoint out of the traffic ladder into its own tab because it
 * "was reading as just another traffic level buried at the end of the
 * ladder" (index.html:3435-3439) — and the flat list is exactly the shape
 * it was split OUT of. wargames/19 and focus group 12 both re-confirmed the
 * regression independently before this rebuild.
 *
 * ONE screen, not two. Root needs both because its practice overlay is a
 * modal that covers the hub, so a running drill needs its own way back to a
 * level list. /app's practice is a route, not a modal — there is only one
 * place to return to. Keeping the flat list as a second in-run screen would
 * reintroduce the mixed-in checkpoint one click deeper, which is the bug.
 * "← All scenarios" therefore returns HERE, and PracticeLevelSelect.tsx is
 * deleted rather than left as dead-but-reachable UI.
 */
import { useState } from 'react'
import type { Bank } from '../../i18n'
import { PRX_LEVEL_IDS, PRX_UNSCORED } from '../../content/practice.json'
import { isLocked, type PracticeProgress } from '../../engine/practiceEngine'

/** Checkpoint's level index. Root names it `CK` and filters it out of the
    traffic ladder the same way (index.html:3453-3455). */
const CK = 4
/** The four numbered rungs the progress bar counts — checkpoint is not one
    of them, which is the whole point of the split (index.html:3448-3452). */
const RUNGS = [0, 1, 2, 3]

type Props = { t: Bank; progress: PracticeProgress; onPick: (level: number) => void; onBack: () => void }

export function PracticeHub({ t, progress, onPick, onBack }: Props) {
  /* Root keeps this in a module-scope `_hubTab` because its render is a
     full innerHTML rebuild; component state is the direct equivalent. Tab
     ORDER is root's: traffic, checkpoint, door — note root's string keys
     run m1 / m3 / m2 in that order, which is not a typo. */
  const [tab, setTab] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)

  const unscored = new Set(PRX_UNSCORED as number[])
  const onCheckpoint = tab === 1
  const ids = onCheckpoint ? [CK] : (PRX_LEVEL_IDS as number[]).filter((i) => i !== CK)
  const rungsDone = RUNGS.filter((i) => progress.done[i]).length

  /* Root's prPick (index.html:5141-5160): let the green pulse land before the
     next screen replaces the card, but skip the wait entirely under reduced
     motion — where there is no pulse to see, the delay is just latency. The
     `picked` guard also eats the double-tap root had to fix twice. */
  const pick = (level: number) => {
    if (picked !== null) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) { onPick(level); return }
    setPicked(level)
    setTimeout(() => onPick(level), 260)
  }

  return (
    <>
      <h1>{t.hub_title}</h1>
      <p className="sub">{t.hub_sub}</p>

      {/* The door module is listed, not hidden: root's own note is that
          hiding work-in-progress made the federal-only states read as
          "broken" once already, so it says plainly that it is unbuilt and
          why, rather than a "coming soon" implying a date nobody committed
          to (index.html:3430-3434). */}
      <div className="ll-seg" role="tablist">
        <button type="button" role="tab" className={tab === 0 ? 'on' : ''} aria-selected={tab === 0} onClick={() => setTab(0)}>{t.hub_m1}</button>
        <button type="button" role="tab" className={tab === 1 ? 'on' : ''} aria-selected={tab === 1} onClick={() => setTab(1)}>{t.hub_m3}</button>
        <button type="button" role="tab" className={tab === 2 ? 'on' : ''} aria-selected={tab === 2} onClick={() => setTab(2)}>{t.hub_m2}</button>
      </div>

      {tab === 2 ? (
        <div className="pilot info" style={{ marginTop: 12 }}>
          <b>{t.hub_m2_h}</b><br /><span style={{ fontSize: 13 }}>{t.hub_m2_body}</span>
        </div>
      ) : (
        <>
          {onCheckpoint ? (
            <div className="pilot info" style={{ margin: '12px 0 0' }}>
              <span style={{ fontSize: 13 }}>{t.hub_ck_note}</span>
            </div>
          ) : (
            <div className="hub-progress" role="status" aria-live="polite">
              <span>{t.hub_progress.replace('{n}', String(rungsDone)).replace('{t}', '4')}</span>
              <span className="bar"><i style={{ width: `${rungsDone / RUNGS.length * 100}%` }} /></span>
            </div>
          )}

          <div className="pr-grid">
            {ids.map((i) => {
              const locked = isLocked(i, progress)
              const done = !!progress.done[i]
              const best = progress.best[i]
              /* Hard mode's score stays suppressed here too. Root's hub card
                 was written after the results screen and never got the
                 unscored guard the results screen has, so it leaked a score
                 the run itself refuses to show (index.html:3470-3477);
                 PRX_UNSCORED is the single source for that, same as
                 everywhere else. */
              const status = locked ? t.hub_locked
                : unscored.has(i) ? (done ? t.hub_done : t.hub_start)
                  : (best ? `🟩 ${best}` : (done ? t.hub_done : t.hub_start))
              return (
                <button
                  key={i}
                  type="button"
                  className={`pr-card${locked ? ' lock' : ''}${done ? ' done' : ''}${picked === i ? ' picked' : ''}`}
                  disabled={locked}
                  aria-disabled={locked}
                  title={locked ? t.hub_locked : undefined}
                  onClick={() => pick(i)}
                >
                  <span className="pr-ic" aria-hidden="true">{locked ? '🔒' : done ? '✓' : '▶'}</span>
                  <span className="pr-nm">{t[('prx_lvl' + (i + 1)) as keyof Bank] as string}</span>
                  {done ? <span className="pr-donebadge">{t.hub_done_badge}</span> : null}
                  <span className="pr-st">{status}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      <button type="button" className="btn ghost" style={{ marginTop: 16 }} onClick={onBack}>{t.hub_back_pack}</button>
    </>
  )
}
