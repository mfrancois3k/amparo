/* Scenario select — the only place levels are enumerated. wargames/15 Move
 * 5.2 (G11 select-list). Ported from index.html:5445-5454.
 */
import type { Bank } from '../../i18n'
import { PRX_LEVEL_IDS, PRX_UNSCORED } from '../../content/practice.json'
import { isLocked, type PracticeProgress } from '../../engine/practiceEngine'

const TBG_CLASS: Record<number, string> = { 3: 'hardbg', 4: 'chkbg', 5: 'waitbg', 6: 'nostopbg' }

type Props = { t: Bank; progress: PracticeProgress; onPick: (level: number) => void }

export function PracticeLevelSelect({ t, progress, onPick }: Props) {
  const levelIds = PRX_LEVEL_IDS as number[]
  const unscored = new Set(PRX_UNSCORED as number[])
  const mUnlocked = !!(progress.done[0] && progress.done[1] && progress.done[2])

  return (
    <>
      <p className="prc-intro" style={{ margin: '0 0 12px' }}>{t.prx_sel_sub}</p>
      <div className="prx-list">
        {levelIds.map((i) => {
          const locked = isLocked(i, progress)
          const tbg = TBG_CLASS[i]
          const status = locked ? '🔒' : unscored.has(i) ? (progress.done[i] ? '✓' : '') : (progress.best[i] ? `🟩${progress.best[i]}` : (progress.done[i] ? '✓' : ''))
          return (
            <button
              key={i}
              type="button"
              className={`prx-lcard${locked ? ' lock' : ''}`}
              disabled={locked}
              aria-disabled={locked}
              title={locked ? t.prx_locked : undefined}
              onClick={() => onPick(i)}
            >
              <span
                className={`tbg${tbg ? ' ' + tbg : ''}`}
                aria-hidden="true"
                style={i < 3 ? { backgroundImage: `url('/img/scene-${i + 1}.jpg')` } : undefined}
              />
              <span className="lc-m">
                <span className="lc-t">{t['prx_lvl' + (i + 1) as keyof Bank] as string}</span>
                <span className="lc-d">{(t['prx_ld' + (i + 1) as keyof Bank] as string) || ''}</span>
              </span>
              <span className="lc-s">{status}</span>
            </button>
          )
        })}
      </div>
      {mUnlocked ? null : <div className="prx-lockhint">🔒 {t.prx_locked}</div>}
      {progress.streak.n > 1 ? <div className="prx-daily">🔁 {t.prx_streak.replace('{n}', String(progress.streak.n))}</div> : null}
    </>
  )
}
