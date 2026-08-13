/* Practice engine screen (step 5). wargames/15 Move 5.2. Orchestrates
 * practiceEngine.ts + usePracticeAudio against PracticeHub / PracticeBeat /
 * PracticeDebrief. Ported from index.html:5418-5643 (practiceRender),
 * 4866-4890 (prxSpeak call sites), 3420-3483 (the hub).
 *
 * The IDLE phase renders the HUB (root's step-5 module tabs), not the flat
 * level list this originally shipped with — see PracticeHub.tsx for why that
 * was wrong and why there is now only one level-enumeration screen.
 */
import { useEffect, useRef, useState } from 'react'
import type { Bank } from '../i18n'
import { useLang } from '../i18n'
import { readApp, writeApp } from '../services/storage'
import {
  initialState, emptyProgress, selectLevel, confirmWarn, officerFinished, pick, markCrisis,
  advance, back, again, toLevels, matchTypedAnswer, prxCard, PRX_OPT, PRX_UNSCORED,
  type EngineState, type PracticeProgress,
} from '../engine/practiceEngine'
import { usePracticeAudio, isCrisisText } from '../engine/usePracticeAudio'
import { PRX_CRISIS } from '../content/practice.json'
import { PracticeHub } from './practice/PracticeHub'
import { PracticeBeat } from './practice/PracticeBeat'
import { PracticeDebrief } from './practice/PracticeDebrief'
import '../styles/practice.css'

const CRISIS = PRX_CRISIS as unknown as string[]

/** Ported from the nested ternary at index.html:5464 — the consent-gate copy
    per level. Only reachable for level >= 2 (PRE_FLIGHT's entry guard). */
function warnKey(level: number): 'prx_warn3' | 'prx_warn4' | 'prx_warn6' | 'prx_warn7' | 'prx_warn8' | 'prx_warn9' {
  if (level === 7) return 'prx_warn9'
  if (level === 6) return 'prx_warn8'
  if (level === 5) return 'prx_warn7'
  if (level === 4) return 'prx_warn6'
  if (level === 3) return 'prx_warn4'
  return 'prx_warn3'
}

type ResponseMeta = { chosenText: string; matched?: { hits: number; total: number; good: boolean } }
const EMPTY_META: ResponseMeta = { chosenText: '' }

type Props = { t: Bank; onBack: () => void }

export function PracticeStep({ t, onBack }: Props) {
  const { lang } = useLang()
  const audio = usePracticeAudio()
  const [state, setState] = useState<EngineState>(() => initialState(readApp<PracticeProgress>('prx', emptyProgress())))
  const [meta, setMeta] = useState<ResponseMeta>(EMPTY_META)
  const spokenKeyRef = useRef('')

  useEffect(() => { writeApp('prx', state.progress) }, [state.progress])

  /* Root speaks the officer's line the instant a beat is ready and never
     blocks input on it (prxSpeak has no phase guard on prxPick). Mirrored
     here: entering OFFICER_SPEAKING triggers audio, then immediately opens
     AWAITING — the phase split exists for the UI's benefit (rail/atmosphere),
     not as an input gate. */
  useEffect(() => {
    if (state.phase !== 'OFFICER_SPEAKING') return
    const beat = state.deck[state.idx]
    if (!beat) return
    const key = `${state.level}:${state.idx}:${state.run.length}`
    if (spokenKeyRef.current === key) { setState((s) => officerFinished(s)); return }
    spokenKeyRef.current = key
    audio.speak(beat, lang, state.level >= 2)
    setState((s) => officerFinished(s))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- audio/lang intentionally excluded: re-firing on every audio-pref change would replay the line
  }, [state.phase, state.level, state.idx, state.run.length])

  const selectLevelHandler = (level: number) => {
    setMeta(EMPTY_META)
    setState((s) => selectLevel(s, level))
  }

  const handlePick = (good: boolean) => {
    const beat = state.deck[state.idx]
    if (!beat) return
    const opt = PRX_OPT[beat.ci]
    const text = good ? (opt ? opt.g[lang] : prxCard(beat.ci, lang).y) : (opt?.b[lang] ?? '')
    setMeta({ chosenText: text })
    setState((s) => pick(s, good))
  }

  const handleTypeAnswer = (raw: string) => {
    const beat = state.deck[state.idx]
    if (!beat) return
    if (isCrisisText(raw, CRISIS)) {
      setMeta({ chosenText: raw })
      setState((s) => markCrisis(s))
      return
    }
    const card = prxCard(beat.ci, lang)
    const m = matchTypedAnswer(raw, card.y)
    setMeta({ chosenText: raw, matched: m })
    setState((s) => pick(s, m.good))
  }

  const handleAdvance = () => { setMeta(EMPTY_META); setState((s) => advance(s)) }
  const handleBack = () => { setMeta(EMPTY_META); setState((s) => back(s)) }
  const handleAgain = () => { setMeta(EMPTY_META); setState((s) => again(s)) }
  const handleToLevels = () => { setMeta(EMPTY_META); audio.stop(); setState((s) => toLevels(s)) }

  const showHeaderBack = state.phase !== 'IDLE' && state.phase !== 'PRE_FLIGHT'
  const scored = !PRX_UNSCORED.has(state.level)
  const showRing = state.phase !== 'IDLE' && state.phase !== 'PRE_FLIGHT' && state.phase !== 'DEBRIEF' && scored && state.run.length > 0
  const ringGood = state.run.filter((x) => x === 'g').length
  const ringTotal = state.run.length
  const ringFrac = state.deck.length ? state.idx / state.deck.length : 0
  const CIRC = 100.53

  return (
    <div className="card">
      <button className="back" aria-label={t.a11y_back} onClick={onBack}>← {t.a11y_back}</button>

      <div className="prx-hdr" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        {showHeaderBack ? (
          <button type="button" className="linkbtn" onClick={handleToLevels}>← {t.prx_all}</button>
        ) : <span />}
        {state.phase !== 'IDLE' ? <span style={{ fontWeight: 800, color: 'var(--navy)' }}>{t[('prx_lvl' + (state.level + 1)) as keyof Bank] as string}</span> : null}
        {showRing ? (
          <span className="prx-ring" aria-label={t.prx_ring_a11y.replace('{g}', String(ringGood)).replace('{a}', String(ringTotal))}>
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <circle cx="20" cy="20" r="16" className="rg-tr" />
              <circle cx="20" cy="20" r="16" className="rg-fl" style={{ strokeDasharray: `${(CIRC * ringFrac).toFixed(1)} ${CIRC}`, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }} />
            </svg>
            <b>{ringGood}/{ringTotal}</b>
          </span>
        ) : null}
      </div>

      {/* The hub renders root's own `hub_title`/`hub_sub` heading pair, so the
          generic `prx_title` heading this screen used with the flat list is
          gone — root's step 5 never showed it. */}
      {state.phase === 'IDLE' ? (
        <PracticeHub t={t} progress={state.progress} onPick={selectLevelHandler} onBack={onBack} />
      ) : null}

      {state.phase === 'PRE_FLIGHT' ? (
        <>
          <h1>{t[('prx_lvl' + (state.level + 1)) as keyof Bank] as string}</h1>
          <div className="prx-coach">{t[warnKey(state.level)] as string}</div>
          <button type="button" className="btn gold" onClick={() => setState(confirmWarn)}>
            {t.prx_warn_go}
          </button>
        </>
      ) : null}

      {state.phase === 'OFFICER_SPEAKING' || state.phase === 'AWAITING' || state.phase === 'BEAT_COMPLETE' ? (
        <PracticeBeat t={t} lang={lang} state={state} meta={meta} audio={audio}
          onPick={handlePick} onTypeAnswer={handleTypeAnswer} onAdvance={handleAdvance} onBack={handleBack} />
      ) : null}

      {state.phase === 'DEBRIEF' ? (
        <PracticeDebrief t={t} lang={lang} state={state} onAgain={handleAgain} onClose={handleToLevels}
          onNextLevel={(lvl) => selectLevelHandler(lvl)} />
      ) : null}
    </div>
  )
}
