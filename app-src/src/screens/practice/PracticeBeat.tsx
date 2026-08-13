/* Live beat: chat thread, rail, demeanor meter, audio controls, options/typed
 * answer, coach + model. wargames/15 Move 5.2 (G8/G9/G11). Ported from
 * index.html:5576-5643.
 */
import { useRef } from 'react'
import type { Bank } from '../../i18n'
import type { Lang } from '../../services/storage'
import type { EngineState } from '../../engine/practiceEngine'
import { PRX_OPT, prxCard, splitKeyPhrases } from '../../engine/practiceEngine'
import { PRX_CITES } from '../../content/practice.json'
import type { PracticeAudio } from '../../engine/usePracticeAudio'

const CITES = PRX_CITES as unknown as Record<Lang, Record<number, string>>

type ResponseMeta = {
  chosenText: string
  matched?: { hits: number; total: number; good: boolean }
}

type Props = {
  t: Bank
  lang: Lang
  state: EngineState
  meta: ResponseMeta
  audio: PracticeAudio
  onPick: (good: boolean) => void
  onTypeAnswer: (text: string) => void
  onAdvance: () => void
  onBack: () => void
}

export function PracticeBeat({ t, lang, state, meta, audio, onPick, onTypeAnswer, onAdvance, onBack }: Props) {
  const typeRef = useRef<HTMLInputElement>(null)
  const beat = state.deck[state.idx]
  if (!beat) return null
  const ci = beat.ci
  const card = prxCard(ci, lang)
  const opt = PRX_OPT[ci]
  const answered = state.phase === 'BEAT_COMPLETE'

  const deckOutcome: Record<number, 'g' | 'y' | 'x'> = {}
  state.run.forEach((v, ri) => { deckOutcome[state.runIdx[ri]] = v })

  const today = new Date().toISOString().slice(0, 10)
  const hasCurve = state.deck.some((x) => x.curve)
  const streakN = state.progress.streak.n
  const showDaily = hasCurve || state.progress.cbDay === today
  const dailyDone = state.progress.cbDay === today

  const demWord = beat.tone === 'hostile' ? t.prx_dem_tense : beat.tone === 'curt' ? t.prx_dem_firm : t.prx_dem_calm
  const demPct = beat.tone === 'hostile' ? 88 : beat.tone === 'curt' ? 52 : 12
  const demCol = beat.tone === 'hostile' ? '#D32F2F' : beat.tone === 'curt' ? '#ED6C02' : '#2f8f5b'
  const moodClass = beat.tone === 'hostile' ? 'hot' : beat.tone === 'curt' ? 'firm' : ''

  const reactLine = answered && meta.chosenText
    ? (opt?.bothGood ? (state.pickedAlt ? opt.react2 : opt.react) : (!state.chosenGood ? opt?.react : null))
    : null

  const submitTyped = () => {
    const v = typeRef.current?.value.trim()
    if (!v) return
    onTypeAnswer(v)
    if (typeRef.current) typeRef.current.value = ''
  }

  return (
    <>
      {showDaily ? <div className="prx-daily">{t.prx_daily}: {dailyDone ? t.prx_daily_done : t.prx_daily_live}</div> : null}
      {streakN > 1 ? <div className="prx-daily">🔁 {t.prx_streak.replace('{n}', String(streakN))}</div> : null}

      <div className="prx-dem">
        <div className="prx-dem-lbl">
          <span>{t.prx_dem_label}</span>
          <span role="status" aria-live="polite" style={{ color: demCol }}>{demWord}</span>
        </div>
        <div className="prx-dem-track" aria-hidden="true">
          <div className="prx-dem-dot" style={{ left: `${demPct}%`, borderColor: demCol }} />
        </div>
      </div>

      <div className="prx-rail" aria-hidden="true">
        {state.deck.map((_, i) => (
          <span key={i} style={{ display: 'contents' }}>
            <span className={`rd${i < state.idx ? (deckOutcome[i] === 'g' ? ' g' : ' y') : (i === state.idx ? ' cur' : '')}`} />
            {i < state.deck.length - 1 ? <span className="rl" /> : null}
          </span>
        ))}
        <span className="rl" /><span className="rg">⚖️</span>
      </div>

      <div className="prx-ctrls">
        <button type="button" className="prx-hear" aria-pressed={audio.muted} onClick={audio.toggleMute}>
          {audio.muted ? t.prx_unmute : t.prx_mute}
        </button>
        {audio.muted ? null : <button type="button" className="prx-hear" onClick={() => audio.speak(beat, lang, !answered)}>{t.prx_hear}</button>}
        <span className="prx-vlang">
          {t.prx_gender}
          <button type="button" className={`prx-vbtn${audio.gender === 'm' ? ' on' : ''}`} onClick={() => audio.setGender('m')}>{t.prx_g_m}</button>
          <button type="button" className={`prx-vbtn${audio.gender === 'f' ? ' on' : ''}`} onClick={() => audio.setGender('f')}>{t.prx_g_f}</button>
        </span>
        {lang === 'es' ? (
          <span className="prx-vlang">
            {t.prx_voice}
            <button type="button" className={`prx-vbtn${audio.voiceLang === 'en' ? ' on' : ''}`} onClick={() => audio.setVoiceLang('en')}>EN</button>
            <button type="button" className={`prx-vbtn${audio.voiceLang === 'es' ? ' on' : ''}`} onClick={() => audio.setVoiceLang('es')}>ES</button>
          </span>
        ) : null}
      </div>

      <div className="prx-thread">
        {beat.setter ? <div className="prx-setter">{beat.setter[lang]}</div> : (state.idx === 0 ? <div className="prx-setter">{t.prx_setter}</div> : null)}
        <div className="prx-row">
          <div className="prx-cav"><img src={`/img/officer-${audio.gender}.jpg`} alt="" onError={(e) => e.currentTarget.remove()} /></div>
          <button type="button" className={`prx-ob ${moodClass}`} title="🔊" onClick={() => audio.speak(beat, lang, !answered)}>“{beat.officer[lang]}”</button>
        </div>
        {answered && meta.chosenText ? (
          <div className="prx-row me">
            <div className="prx-cav me">🙂</div>
            <div className="prx-mb">{meta.chosenText}</div>
          </div>
        ) : null}
        {reactLine ? (
          <div className="prx-row">
            <div className="prx-cav"><img src={`/img/officer-${audio.gender}.jpg`} alt="" onError={(e) => e.currentTarget.remove()} /></div>
            <div className={`prx-ob ${moodClass}`}>{reactLine[lang]}</div>
          </div>
        ) : null}
      </div>

      {!answered ? (
        <>
          <div className="prc-count">
            {t.prx_count.replace('{n}', String(state.idx + 1)).replace('{total}', String(state.deck.length))}
            {beat.curve ? ` · ${t.prx_curve}` : ''}
          </div>
          <p className="prc-intro" style={{ margin: '0 0 2px' }}>{t.prx_pick}</p>
          {!beat.swap ? (
            <>
              <button type="button" className="prx-opt" onClick={() => onPick(true)}>{opt ? opt.g[lang] : card.y}</button>
              {opt ? <button type="button" className="prx-opt" onClick={() => onPick(false)}>{opt.b[lang]}</button> : null}
            </>
          ) : (
            <>
              {opt ? <button type="button" className="prx-opt" onClick={() => onPick(false)}>{opt.b[lang]}</button> : null}
              <button type="button" className="prx-opt" onClick={() => onPick(true)}>{opt ? opt.g[lang] : card.y}</button>
            </>
          )}
          <details className="prx-own" style={{ marginTop: 10 }}>
            <summary>{t.prx_own_sum}</summary>
            {audio.idleOffer ? (
              <div className="prx-heard" style={{ marginTop: 8 }}>
                <div style={{ marginBottom: 8 }}>{t.prx_idle_h}</div>
                <div className="prx-idle-btns">
                  <button type="button" className="btn ghost" style={{ padding: '8px 12px', marginTop: 0 }} onClick={() => { audio.replayIdle(); audio.speak(beat, lang, false) }}>{t.prx_idle_replay}</button>
                  <button type="button" className="btn ghost" style={{ padding: '8px 12px', marginTop: 0 }} onClick={audio.dismissIdle}>{t.prx_idle_leave}</button>
                </div>
              </div>
            ) : null}
            <div className="prx-typerow" style={{ marginTop: 8 }}>
              <input ref={typeRef} type="text" aria-label={t.prx_type_a11y} placeholder={t.prx_type_ph}
                autoCapitalize="off" autoComplete="off" autoCorrect="off" spellCheck={false} enterKeyHint="done"
                onKeyDown={(e) => { if (e.key === 'Enter') submitTyped() }} />
              <button type="button" onClick={submitTyped}>{t.prx_type_btn}</button>
            </div>
          </details>
          {state.idx > 0 ? (
            <div className="prc-nav" style={{ marginTop: 10 }}>
              <button type="button" className="btn ghost prc-back" onClick={onBack}>← {t.a11y_back}</button>
            </div>
          ) : null}
        </>
      ) : (
        <>
          {/* Crisis-tier reveal (index.html:5099-5106) replaces the normal
              coach/model entirely with the 988 line — no scoring language,
              no key-phrase grading, nothing that reads as a right/wrong
              answer to someone in crisis. */}
          {state.curTier === 'x' ? (
            // The single highest-stakes line in the app — a screen-reader
            // user must hear it announced, not just the sighted styling.
            // Found by this loop's blind-spot audit: the demeanor meter
            // three lines above already had aria-live, this didn't.
            <div className="prx-coach good" role="alert" aria-live="assertive">{t.prx_crisis}</div>
          ) : (
            <>
              {meta.matched ? (
                <>
                  <div className="prx-match" aria-hidden="true">
                    {Array.from({ length: meta.matched.total }, (_, i) => <i key={i} className={i < meta.matched!.hits ? 'on' : ''} />)}
                  </div>
                  <div className={`prx-passline${meta.matched.good ? ' ok' : ''}`}>
                    {(meta.matched.good ? t.prx_passed : t.prx_close_line).replace('{n}', String(meta.matched.hits)).replace('{t}', String(meta.matched.total))}
                  </div>
                </>
              ) : null}
              <div className={`prx-coach ${state.chosenGood ? 'good' : 'bad'}`}>
                {opt ? (opt.bothGood ? (state.pickedAlt ? opt.bc : opt.gc) : (!state.chosenGood ? opt.bc : opt.gc))?.[lang] : ''}
                <span className="mdl">
                  💬 <b>{t.prx_model}:</b>{' '}
                  {splitKeyPhrases(card.y).map((seg, i) => seg.key ? <span key={i} className="prx-key">{seg.text}</span> : <span key={i}>{seg.text}</span>)}
                </span>
              </div>
              {beat.curve ? <div className="prc-cite">🎯 {beat.curve[('coach_' + lang) as 'coach_en' | 'coach_es']}</div> : null}
              {CITES[lang]?.[ci] ? <div className="prc-cite">⚖️ {CITES[lang][ci]}</div> : null}
            </>
          )}
          <div className="prc-nav">
            {state.idx > 0 ? <button type="button" className="btn ghost prc-back" onClick={onBack}>← {t.a11y_back}</button> : null}
            <button type="button" className="btn" style={{ flex: 1 }} onClick={onAdvance}>{t.prx_next}</button>
          </div>
        </>
      )}
    </>
  )
}
