/* Practice engine core — explicit FSM. wargames/15 Move 5.1.
 * Ports G2 (decks/levels, prxBuildDeck), G5 (PRX_OPT g/b/coach/react semantics),
 * G6 (run FSM: prWarnOk per-level consent, prRunIdx crisis-skip alignment),
 * G7 (divergence v2.14, selection-only) — index.html:4373-4762, 5119-5255,
 * 5428-5491.
 *
 * Pure state + transition functions, no DOM/React/audio. The digest's FSM
 * shape is IDLE -> PRE_FLIGHT -> OFFICER_SPEAKING -> AWAITING -> EVALUATING
 * -> BEAT_COMPLETE -> DEBRIEF; root has no named states (it infers the same
 * shape from prRevealed/prIdx/prWarnOk booleans), so this is a faithful
 * relabeling, not new behavior. EVALUATING is folded into the pick()/
 * markCrisis() transition — root scores synchronously with no async step, so
 * there is nothing for a caller to observe between EVALUATING and
 * BEAT_COMPLETE. OFFICER_SPEAKING/AWAITING are kept as two distinct phases
 * (rather than collapsed the same way) because Move 5.2's audio layer needs a
 * real hook to gate input on: beginBeat() enters OFFICER_SPEAKING,
 * officerFinished() moves to AWAITING once the clip/TTS ends. Root itself
 * never blocks input on audio (prxPick has no such guard) — pick()/
 * markCrisis() accept calls from either phase, matching that.
 */
import {
  PRACTICE as PRACTICE_RAW, PRX_LEVELS as PRX_LEVELS_RAW, PRX_UNSCORED as PRX_UNSCORED_RAW,
  PRX_VAR as PRX_VAR_RAW, PRX_CURVE as PRX_CURVE_RAW, PRX_OPT as PRX_OPT_RAW,
  PRX_DIVERGE as PRX_DIVERGE_RAW, PRX_HARD as PRX_HARD_RAW, PRX_CHK as PRX_CHK_RAW,
  PRX_WAIT as PRX_WAIT_RAW, PRX_NOSTOP as PRX_NOSTOP_RAW, PRX_DOOR as PRX_DOOR_RAW,
} from '../content/practice.json'

export type Lang = 'en' | 'es'
type Tone = 'calm' | 'curt' | 'hostile'
export type Tier = 'g' | 'y' | 'x'
export type Phase = 'IDLE' | 'PRE_FLIGHT' | 'OFFICER_SPEAKING' | 'AWAITING' | 'BEAT_COMPLETE' | 'DEBRIEF'

interface Variant { en: string; es: string; tone: Tone; id: string }
interface Curveball extends Variant { answerBeat: number; coach_en: string; coach_es: string }
interface FixedBeat { ci: number; id: string; tone: Tone; setter?: { en: string; es: string }; officer: { en: string; es: string } }

export interface DeckBeat {
  ci: number
  officer: { en: string; es: string }
  tone: Tone
  id: string
  curve?: Curveball
  setter?: { en: string; es: string }
}

interface OptionSide { en: string; es: string }
export interface PrxOption {
  g: OptionSide; b: OptionSide; gc?: OptionSide; bc?: OptionSide; react?: OptionSide
  /** Hard mode's second reaction line, used when the "alt" side was picked
      (index.html:4525 etc) — bothGood options react differently per side. */
  react2?: OptionSide
  bothGood?: boolean
}

const PRACTICE = PRACTICE_RAW as Record<Lang, Record<number, { o: string; y: string }>>
const PRX_LEVELS = PRX_LEVELS_RAW as { ids: number[]; rate: number }[]
const PRX_UNSCORED = new Set(PRX_UNSCORED_RAW as number[])
const PRX_VAR = PRX_VAR_RAW as unknown as Record<number, Variant[]>
const PRX_CURVE = PRX_CURVE_RAW as unknown as Curveball[]
const PRX_OPT = PRX_OPT_RAW as unknown as Record<number, PrxOption>
const PRX_DIVERGE = PRX_DIVERGE_RAW as unknown as Record<number, { g: Tone; b: Tone }>
const PRX_HARD = PRX_HARD_RAW as unknown as FixedBeat[]
const PRX_CHK = PRX_CHK_RAW as unknown as FixedBeat[]
const PRX_WAIT = PRX_WAIT_RAW as unknown as FixedBeat[]
const PRX_NOSTOP = PRX_NOSTOP_RAW as unknown as FixedBeat[]
const PRX_DOOR = PRX_DOOR_RAW as unknown as FixedBeat[]

/* Root recomputes these three ids from array position/ci at load
 * (index.html:4791,4817,4818) rather than trusting whatever literal was
 * typed in the source array — so a mistyped id there is cosmetic, self-healed
 * every load. The extractor pulls the literal text, not the runtime result of
 * that recompute, so without this /app was trusting the raw literal directly.
 * Two real consequences, found by loop QA 2026-08-13:
 *   - Latent: a future manual PRX_VAR restore with a position/id mismatch
 *     would silently ship wrong audio in /app while root kept playing
 *     correctly. Proven exploitable (an id swap passed extraction, --verify,
 *     and all 21 practice-engine-check assertions clean) but not live today —
 *     every id from the v2_4/v0_4-family restores matches its position.
 *   - Live: PRX_CURVE entries have NO id typed in source at all — it exists
 *     ONLY as this recompute's output. Extraction can't invent it, so every
 *     curveball beat had id===undefined in /app, which usePracticeAudio.ts's
 *     `if (beat.id)` guard (correctly) treats as "no clip" and falls back to
 *     TTS — meaning every curveball played robotic speech in /app while root
 *     played the correct recorded clip for the identical line.
 * PRX_HARD's literal ids already match 'h'+ci for every entry (verified), so
 * this recompute is a no-op there today — kept anyway for the same reason
 * root keeps it: parity if that ever drifts, at zero cost. PRX_CHK/PRX_WAIT/
 * PRX_NOSTOP/PRX_DOOR get no such treatment in ROOT EITHER (checked — no
 * matching forEach exists for any of them), so leaving /app trusting their
 * literal ids is correct parity, not an oversight. */
Object.keys(PRX_VAR).forEach((b) => {
  PRX_VAR[Number(b)].forEach((v, i) => { v.id = `v${b}_${i}` })
})
PRX_CURVE.forEach((c, i) => { c.id = `c${i}` })
PRX_HARD.forEach((h) => { h.id = `h${h.ci}` })

export { PRX_UNSCORED, PRX_OPT, PRX_LEVELS }

export function prxCard(ci: number, lang: Lang): { o: string; y: string } {
  return PRACTICE[lang][ci]
}

/** Ported from prxTypeAnswer's scoring (index.html:5108-5116) — generous,
    accent/apostrophe-insensitive, never a fail state. `card.y` is the
    reviewed model line; quoted phrases inside it are the key words scored
    against. G9. */
export interface TypedMatch { hits: number; total: number; good: boolean }
export function matchTypedAnswer(raw: string, modelY: string): TypedMatch {
  const norm = (s: string) => ' ' + s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/'/g, '').replace(/[^a-z0-9ñ ]/gi, ' ') + ' '
  const h = norm(raw), hw = h.trim().split(/\s+/)
  const phrases = (modelY.match(/“([^”]+)”/g) || []).map((s) => s.replace(/[“”]/g, ''))
  const words = [...new Set(norm(phrases.join(' ')).split(/\s+/).filter((w) => w.length > 3))]
  const hit = (w: string) => h.includes(' ' + w + ' ') || hw.some((x) => x.length > 3 && x.slice(0, 4) === w.slice(0, 4) && Math.abs(x.length - w.length) <= 3)
  const hits = words.filter(hit).length, total = words.length
  return { hits, total, good: total > 0 && hits >= Math.ceil(total / 2) }
}

/** Highlight quoted key phrases in a model line — ported from prxKeys
    (index.html:5082). Returns segments for the caller to render, rather than
    an HTML string: /app has no innerHTML surface for this content. */
export function splitKeyPhrases(s: string): Array<{ text: string; key: boolean }> {
  const parts: Array<{ text: string; key: boolean }> = []
  let last = 0
  const re = /“([^”]+)”/g
  let m: RegExpExecArray | null
  while ((m = re.exec(s))) {
    if (m.index > last) parts.push({ text: s.slice(last, m.index), key: false })
    parts.push({ text: `“${m[1]}”`, key: true })
    last = m.index + m[0].length
  }
  if (last < s.length) parts.push({ text: s.slice(last), key: false })
  return parts
}

export interface PracticeProgress {
  done: Record<number, boolean>
  runs: Record<number, number>
  best: Record<number, string>
  streak: { last: string; n: number }
  /** Date (YYYY-MM-DD) a curveball was last dealt — index.html:5485. */
  cbDay?: string
}

export function emptyProgress(): PracticeProgress {
  return { done: {}, runs: {}, best: {}, streak: { last: '', n: 0 } }
}

/** Ported verbatim from the `isLocked` helpers (index.html:5190, 5436) — one
    guard, checked both to style the tab and to refuse entry. */
export function isLocked(level: number, progress: PracticeProgress): boolean {
  const unlocked = !!(progress.done[0] && progress.done[1] && progress.done[2])
  if (level === 3 || level === 5 || level === 7) return !unlocked
  if (level === 6) return !(unlocked && progress.done[5])
  return false
}

/** Ported from prxBuildDeck (index.html:4716-4747). `now`/`rng` are injectable
    only so the deterministic parts (curveball placement) can be tested without
    depending on the real clock — production callers omit both. */
export function buildDeck(
  level: number,
  progress: PracticeProgress,
  now: Date = new Date(),
  rng: () => number = Math.random,
): DeckBeat[] {
  if (level === 3) return PRX_HARD.map((h) => ({ ...h }))
  if (level === 4) return PRX_CHK.map((h) => ({ ...h }))
  if (level === 5) return PRX_WAIT.map((h) => ({ ...h }))
  if (level === 6) return PRX_NOSTOP.map((h) => ({ ...h }))
  if (level === 7) return PRX_DOOR.map((h) => ({ ...h }))

  const L = PRX_LEVELS[level]
  const tones: Tone[] = ([['calm'], ['curt'], ['curt', 'hostile'], ['hostile']] as Tone[][])[level]
  const pick = <T,>(a: T[]): T => a[Math.floor(rng() * a.length)]

  const deck: DeckBeat[] = L.ids.map((ci) => {
    const pool = (PRX_VAR[ci] || []).filter((v) => tones.includes(v.tone))
    const v = pool.length ? pick(pool) : null
    return v
      ? { ci, officer: { en: v.en, es: v.es }, tone: v.tone, id: v.id }
      : { ci, officer: { en: PRACTICE.en[ci].o, es: PRACTICE.es[ci].o }, tone: tones[0], id: 'c' + ci }
  })

  /* One curveball from the 2nd run of a level onward, date-seeded so every
     player gets the same daily curveball. Never in L2 (index level 2, "stays
     canonical" per source comment — ported condition is `level < 2`). */
  const runs = progress.runs[level] || 0
  if (runs >= 1 && level < 2) {
    const seed = now.getFullYear() * 372 + (now.getMonth() + 1) * 31 + now.getDate()
    const cb = PRX_CURVE[seed % PRX_CURVE.length]
    deck.splice(1 + (seed % (deck.length - 1)), 0, {
      ci: cb.answerBeat, officer: { en: cb.en, es: cb.es }, tone: cb.tone, curve: cb, id: cb.id,
    })
  }
  return deck
}

/** Ported from prxDiverge (index.html:5227-5238). Returns a NEW deck with the
    next beat's officer line swapped for a same-bank variant of the wanted
    tone, if one exists — selection only, never new content. */
function divergeDeck(deck: DeckBeat[], idx: number, level: number, curTier: Tier | null, rng: () => number): DeckBeat[] {
  const dir = PRX_DIVERGE[level]
  if (!dir || curTier === 'x' || curTier === null) return deck
  const next = deck[idx + 1]
  if (!next || next.curve) return deck
  const want = curTier === 'g' ? dir.g : dir.b
  if (next.tone === want) return deck
  const pool = (PRX_VAR[next.ci] || []).filter((v) => v.tone === want)
  if (!pool.length) return deck
  const v = pool[Math.floor(rng() * pool.length)]
  const nextDeck = deck.slice()
  nextDeck[idx + 1] = { ...next, officer: { en: v.en, es: v.es }, tone: v.tone, id: v.id }
  return nextDeck
}

export interface EngineState {
  phase: Phase
  level: number
  idx: number
  deck: DeckBeat[]
  run: Tier[]
  runIdx: number[]
  curTier: Tier | null
  runLogged: boolean
  warnOk: Record<number, boolean>
  chosenGood: boolean
  pickedAlt: boolean
  progress: PracticeProgress
}

export function initialState(progress: PracticeProgress = emptyProgress()): EngineState {
  return {
    phase: 'IDLE', level: 0, idx: 0, deck: [], run: [], runIdx: [],
    curTier: null, runLogged: false, warnOk: {}, chosenGood: false, pickedAlt: false, progress,
  }
}

/** Enter a level from the select screen. Ported from prxTab (index.html:5183-
    5201): locked levels refuse silently (caller decides how to surface that —
    root pulses a hint). The deck is built unconditionally, same as root — the
    consent gate (PRE_FLIGHT) is a render branch in root, not a block on deck
    construction, so this mirrors that rather than deferring buildDeck(). */
export function selectLevel(state: EngineState, level: number, now?: Date, rng?: () => number): EngineState {
  if (isLocked(level, state.progress)) return state
  const deck = buildDeck(level, state.progress, now, rng)
  const needsWarn = level >= 2 && !state.warnOk[level]
  return {
    ...state, level, idx: 0, deck, run: [], runIdx: [], curTier: null, runLogged: false,
    chosenGood: false, pickedAlt: false,
    phase: needsWarn ? 'PRE_FLIGHT' : 'OFFICER_SPEAKING',
  }
}

/** Ported from `onclick="prWarnOk[prLevel]=true;..."` (index.html:5465). */
export function confirmWarn(state: EngineState): EngineState {
  if (state.phase !== 'PRE_FLIGHT') return state
  return { ...state, warnOk: { ...state.warnOk, [state.level]: true }, phase: 'OFFICER_SPEAKING' }
}

/** Audio for the current beat has finished (or there is none) — input opens. */
export function officerFinished(state: EngineState): EngineState {
  if (state.phase !== 'OFFICER_SPEAKING') return state
  return { ...state, phase: 'AWAITING' }
}

/** Ported from prxPick (index.html:4428-4435). `bothGood` (hard mode) always
    scores tier 'g' regardless of which side was tapped — the officer still
    reacts, but neither choice is a miss. */
export function pick(state: EngineState, good: boolean): EngineState {
  if (state.phase !== 'AWAITING' && state.phase !== 'OFFICER_SPEAKING') return state
  const beat = state.deck[state.idx]
  const opt = beat ? PRX_OPT[beat.ci] : undefined
  if (!opt) return state
  const chosenGood = opt.bothGood ? true : good
  const curTier: Tier = (opt.bothGood || good) ? 'g' : 'y'
  return { ...state, chosenGood, pickedAlt: !good, curTier, phase: 'BEAT_COMPLETE' }
}

/** Crisis-tier reveal (index.html:5099-5106). Detection itself (12-phrase
    NFD/apostrophe-insensitive match, G10) is Move 5.2's typed-answer path —
    this only records the resulting tier so prRunIdx alignment (advance())
    works the same regardless of which caller reached it. */
export function markCrisis(state: EngineState): EngineState {
  if (state.phase !== 'AWAITING' && state.phase !== 'OFFICER_SPEAKING') return state
  return { ...state, chosenGood: true, pickedAlt: false, curTier: 'x', phase: 'BEAT_COMPLETE' }
}

/** Ported from prxAdvance (index.html:5239-5247) plus the debrief-entry
    bookkeeping folded from practiceRender's `prIdx>=prDeck.length` branch
    (index.html:5468-5491) — streak/best/done/runs. Root writes those to
    localStorage `amparo_prx` directly from render; here the caller persists
    the returned `progress` (this project's storage boundary requires /app to
    own its writes explicitly, see services/storage.ts). */
export function advance(state: EngineState, now: Date = new Date(), rng: () => number = Math.random): EngineState {
  if (state.phase !== 'BEAT_COMPLETE') return state
  const deck = divergeDeck(state.deck, state.idx, state.level, state.curTier, rng)
  const run = state.curTier !== 'x' ? [...state.run, state.curTier === 'g' ? 'g' as Tier : 'y' as Tier] : state.run
  const runIdx = state.curTier !== 'x' ? [...state.runIdx, state.idx] : state.runIdx
  const nextIdx = state.idx + 1
  const base: EngineState = {
    ...state, deck, run, runIdx, curTier: null, chosenGood: false, pickedAlt: false, idx: nextIdx,
  }
  if (nextIdx >= deck.length) return completeRun(base, now)
  return { ...base, phase: 'OFFICER_SPEAKING' }
}

function completeRun(state: EngineState, now: Date): EngineState {
  if (state.runLogged) return { ...state, phase: 'DEBRIEF' }
  const level = state.level
  const progress = state.progress
  const today = now.toISOString().slice(0, 10)
  const yesterday = new Date(now.getTime() - 864e5).toISOString().slice(0, 10)
  const streak = progress.streak.last === today
    ? progress.streak
    : { last: today, n: progress.streak.last === yesterday ? progress.streak.n + 1 : 1 }
  const score = state.run.filter((x) => x === 'g').length
  /* Numerator-only, matching root (index.html, `sc>parseInt(prx.best[...])`).
     A previous version of this file compared DENOMINATORS too and replaced the
     best whenever they differed — reasoning that a "2/2" banked on the old
     2-beat Level 2 could never be beaten by a "2/3". That was wrong, and the
     QA fan-out caught it in three independent places: `run.length` is not a
     per-level constant. Crisis-tier ('x') beats are excluded from `run` (see
     advance() below), so disclosing distress SHRINKS it; the daily curveball
     GROWS it on levels 0-1 (see buildDeck). The rule therefore deleted real
     bests on the ordinary replay path (a 5/5 overwritten by a 1/6) and demoted
     players specifically for using the crisis path.
     The genuine problem — one level's definition changing — is handled by a
     one-time migration instead; see readRootPractice's v3 block and root's. */
  const stored = progress.best[level]
  const best = !PRX_UNSCORED.has(level) && (!stored || score > parseInt(stored, 10))
    ? { ...progress.best, [level]: `${score}/${state.run.length}` }
    : progress.best
  const nextProgress: PracticeProgress = {
    ...progress,
    runs: { ...progress.runs, [level]: (progress.runs[level] || 0) + 1 },
    done: { ...progress.done, [level]: true },
    best,
    streak,
    cbDay: state.deck.some((x) => x.curve) ? today : progress.cbDay,
  }
  return { ...state, phase: 'DEBRIEF', runLogged: true, progress: nextProgress }
}

/** Ported from prxBack (index.html:5251-5254). At the first beat, back exits
    to the level-select screen (root's prxLevels()). */
export function back(state: EngineState): EngineState {
  if (state.phase !== 'BEAT_COMPLETE' && state.phase !== 'AWAITING' && state.phase !== 'OFFICER_SPEAKING') return state
  if (state.idx <= 0) return { ...state, phase: 'IDLE' }
  return {
    ...state,
    idx: state.idx - 1,
    run: state.run.slice(0, -1),
    runIdx: state.runIdx.slice(0, -1),
    curTier: null, chosenGood: false, pickedAlt: false,
    phase: 'OFFICER_SPEAKING',
  }
}

/** Ported from prxAgain (index.html:5202-5206) — replay the same level from
    the top with a freshly dealt deck. */
export function again(state: EngineState, now?: Date, rng?: () => number): EngineState {
  const deck = buildDeck(state.level, state.progress, now, rng)
  return {
    ...state, deck, idx: 0, run: [], runIdx: [], curTier: null, runLogged: false,
    chosenGood: false, pickedAlt: false, phase: 'OFFICER_SPEAKING',
  }
}

/** Ported from prxLevels (index.html:5177-5182) — return to the level tiles. */
export function toLevels(state: EngineState): EngineState {
  return { ...state, phase: 'IDLE' }
}
