/* Results / debrief. wargames/15 Move 5.2 (G11). Ported from
 * index.html:5468-5574 (the `prIdx>=prDeck.length` branch of practiceRender).
 */
import type { Bank } from '../../i18n'
import type { Lang } from '../../services/storage'
import type { EngineState } from '../../engine/practiceEngine'
import { PRX_UNSCORED } from '../../engine/practiceEngine'

type Props = {
  t: Bank
  lang: Lang
  state: EngineState
  onAgain: () => void
  onClose: () => void
  onNextLevel: (level: number) => void
}

export function PracticeDebrief({ t, lang, state, onAgain, onClose, onNextLevel }: Props) {
  const level = state.level
  const unscored = PRX_UNSCORED.has(level)
  const totalRuns = Object.values(state.progress.runs).reduce((a, b) => a + (b || 0), 0) || 1

  const foot = (
    <div className="prx-foot">
      {level === 4 ? (
        <>
          <div className="prx-chknote">{t.prx_chk_limit}</div>
          <div className="prx-chknote muted">{t.prx_chk_note}</div>
        </>
      ) : null}
      <div className="prx-rehearse">{totalRuns <= 1 ? t.prx_rehearse1 : t.prx_rehearseN.replace('{n}', String(totalRuns))}</div>
      {/* Carry card (G12, canvas PNG export) is out of Move 5.2's scope — not
          listed in wargames/15's action bullet for this move. Omitted rather
          than shipped as a button with no handler; deferred to a later move. */}
      {/* prx_resource embeds real <b> markup and an HTML entity from the
          extracted t.en/es bank (same justification as PrintPack's
          statute-quote/claims fields: static app content, never user input) —
          dangerouslySetInnerHTML rather than hand-parsing the tags out. */}
      <div className="prx-res" dangerouslySetInnerHTML={{ __html: t.prx_resource as string }} />
      <div className="prx-fn">
        <div className="prx-fn-h">{t.prx_fn_head}</div>
        {/* ab_founder_note carries paragraph breaks as literal "<br><br>" in
            the extracted string (root builds this via innerHTML, where that
            renders as real breaks). Split rather than dangerouslySetInnerHTML
            — this is plain paragraph structure, not markup worth taking on
            an XSS review surface for. */}
        {(t.ab_founder_note as string).split('<br><br>').map((para, i) => <p key={i} style={{ marginTop: i ? 10 : 0 }}>{para}</p>)}
        <div className="prx-fn-s">{t.ab_founder_sign}</div>
      </div>
    </div>
  )

  if (unscored) {
    // Hard mode (level 3) is the only unscored level reachable today
    // (5/6/7 are dark, PRX_LEVEL_IDS=[0..4]) — ported for when they light up.
    const key = level === 3 ? 'hard' : level === 5 ? 'wait' : level === 6 ? 'nostop' : 'door'
    const icon = level === 3 ? '🌒' : level === 5 ? '🌙' : level === 6 ? '🌑' : '🚪'
    return (
      <>
        <div style={{ textAlign: 'center', fontSize: 38, lineHeight: 1, margin: '6px 0 10px' }} aria-hidden="true">{icon}</div>
        <h1 style={{ fontSize: 19, textAlign: 'center', margin: '0 0 12px' }}>{t[('prx_' + key + '_t') as keyof Bank] as string}</h1>
        <p className="prc-intro">{t[('prx_' + key + '_b') as keyof Bank] as string}</p>
        <div className="prx-coach good" style={{ fontWeight: 800, textAlign: 'center' }}>{t[('prx_' + key + '_blame') as keyof Bank] as string}</div>
        {level === 3 ? <p className="prc-intro" style={{ marginTop: 12 }}>{t.prx_hard_b2}</p> : null}
        {level === 3 ? <p className="soon" style={{ marginTop: 10 }}>{t.prx_hard_note}</p> : null}
        <p style={{ fontStyle: 'italic', borderLeft: '3px solid var(--gold)', paddingLeft: 12, margin: '14px 0', fontSize: 13, lineHeight: 1.6, color: 'var(--ink)', textAlign: 'left' }}>{t.prx_final_note}</p>
        {foot}
        {level === 3 ? <button type="button" className="btn ghost" onClick={onAgain}>{t.prx_again}</button> : null}
        <button type="button" className="btn ghost" onClick={onClose}>{t.prx_close}</button>
      </>
    )
  }

  const sober = level >= 2
  const score = state.run.filter((x) => x === 'g').length
  const yCount = state.run.length - score
  const grid = state.run.map((x) => x === 'g' ? '🟩' : '🟨').join('')
  const master = !!(state.progress.done[0] && state.progress.done[1] && state.progress.done[2])
  const bdRows = state.run.map((tier, ri) => {
    const d = state.deck[state.runIdx[ri]] // NOT deck[ri] — ri skips crisis beats
    const ln = d ? d.officer[lang] : ''
    /* All-time miss count on a chronically-missed beat, only when this run
       missed it too — mirrors index.html's bdRows exactly (see there for the
       full rationale). Numeric only, no new copy: a repeat offender reads
       the same in every language. */
    const miss = (d && tier !== 'g') ? (state.progress.miss?.[d.ci] ?? 0) : 0
    return { tier, ln: ln.length > 56 ? ln.slice(0, 56) + '…' : ln, miss }
  })

  return (
    <>
      <div className="prx-score">{score}<span>/{state.run.length}</span></div>
      <div className="prx-result">{grid}</div>
      <div className="prc-count">{sober ? t.prx_done3_t : t.prx_done_t} · {t.prx_verified}</div>
      <p style={{ fontStyle: 'italic', borderLeft: '3px solid var(--gold)', paddingLeft: 12, margin: '14px 0', fontSize: 13, lineHeight: 1.6, color: 'var(--ink)', textAlign: 'left' }}>{t.prx_final_note}</p>
      {sober && score === state.run.length && state.run.length ? <p className="prc-intro"><b>{t.prx_l3_perfect}</b></p> : null}
      <div className="prx-stats">
        <div><b>🔁 {state.progress.streak.n || 1}</b><small>{t.prx_st_days}</small></div>
        <div><b>{state.progress.best[level] || `${score}/${state.run.length}`}</b><small>{t.prx_st_best}</small></div>
        <div><b>{[0, 1, 2].filter((i) => state.progress.done[i]).length}/3</b><small>{t.prx_st_lvls}</small></div>
      </div>
      <p className="prc-intro">{yCount ? t.prx_tip_y : t.prx_tip_all}</p>
      {sober ? <p className="prc-intro">{t.prx_done3}</p> : null}
      <div className="prx-bd">
        {bdRows.map((r, i) => (
          <div className="prx-bd-row" key={i}>
            <span>{r.tier === 'g' ? '🟩' : '🟨'}{r.miss >= 2 ? <b className="prx-bd-miss">×{r.miss}</b> : null}</span>
            <span>{r.ln}</span>
          </div>
        ))}
      </div>
      {/* Share cert / run share (G13) is out of Move 5.2's scope, same as the
          carry card above — omitted rather than a dead button. The trophy
          banner (content, no interaction) and the level-2 progression CTA
          (a plain navigation, in scope) still ship. */}
      {master ? <div className="prx-master">🏆 {t.prx_master}</div> : null}
      {!master && level < 2 ? (
        <button type="button" className="btn gold" onClick={() => onNextLevel(level + 1)}>
          {t[('prx_lvl' + (level + 2)) as keyof Bank] as string} →
        </button>
      ) : null}
      {foot}
      <button type="button" className="btn ghost" onClick={onAgain}>{t.prx_again}</button>
      <button type="button" className="btn ghost" onClick={onClose}>{t.prx_close}</button>
    </>
  )
}
