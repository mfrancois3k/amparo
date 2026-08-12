/* Officer audio: pre-recorded clip first, browser TTS as fallback. wargames/15
 * Move 5.2 (G8). Ported from prxSpeak/prxSpeakTTS/prxMuteTgl/prxIdleArm
 * (index.html:4796-4912).
 *
 * /app's own app_mute/app_voice/app_voiceLang preferences, independent from
 * root's amparo_muted/amparo_voice — same storage-boundary rule as every
 * other /app write (services/storage.ts). SpeechRecognition (root's PRX_SR)
 * is gated OFF as of v2.16.1 and is NOT ported here — see wargames/14.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { readApp, writeApp } from '../services/storage'
import type { Lang } from '../services/storage'
import type { DeckBeat } from './practiceEngine'

export type Gender = 'm' | 'f'

const PRX_TONE: Record<string, { rate: number; pitch: number }> = {
  calm: { rate: 0.95, pitch: 1 }, curt: { rate: 1.12, pitch: 1 }, hostile: { rate: 1.22, pitch: 0.9 },
}

const hasTTS = typeof window !== 'undefined' && 'speechSynthesis' in window

export interface PracticeAudio {
  muted: boolean
  toggleMute: () => void
  gender: Gender
  setGender: (g: Gender) => void
  voiceLang: Lang
  setVoiceLang: (l: Lang) => void
  speaking: boolean
  idleOffer: boolean
  replayIdle: () => void
  dismissIdle: () => void
  /** Speak the given beat now. `armIdle` controls whether the 12s freeze offer
      is scheduled after — false while an answer is already revealed. */
  speak: (beat: DeckBeat, lang: Lang, armIdle: boolean) => void
  stop: () => void
}

/** Ported from prxIsCrisis (index.html:4939-4944) — one normalizer, both the
    typed path (here) and, historically, a voice transcript path root no
    longer ships (PRX_SR stays gated off, see wargames/14). */
export function isCrisisText(s: string, crisisPhrases: readonly string[]): boolean {
  const n = ' ' + String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '') + ' '
  return crisisPhrases.some((p) => n.includes(p))
}

export function usePracticeAudio(): PracticeAudio {
  const [muted, setMuted] = useState(() => readApp('mute', false))
  const [gender, setGenderState] = useState<Gender>(() => readApp<Gender>('voice', 'm'))
  const [voiceLang, setVoiceLangState] = useState<Lang>(() => readApp<Lang>('voiceLang', 'en'))
  const [speaking, setSpeaking] = useState(false)
  const [idleOffer, setIdleOffer] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null)
  const voiceEsRef = useRef<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
    if (!hasTTS) return
    const pick = () => {
      try {
        const vs = speechSynthesis.getVoices()
        const rank = (v: SpeechSynthesisVoice) =>
          (/(Google|Natural|Neural|Siri|Premium|Enhanced|Online)/i.test(v.name) ? 4 : 0) +
          (/en[-_]US|es[-_](US|MX|419)/i.test(v.lang) ? 1 : 0)
        voiceRef.current = vs.filter((v) => /^en/i.test(v.lang)).sort((a, b) => rank(b) - rank(a))[0] || null
        voiceEsRef.current = vs.filter((v) => /^es/i.test(v.lang)).sort((a, b) => rank(b) - rank(a))[0] || null
      } catch { /* voices unavailable */ }
    }
    pick()
    speechSynthesis.onvoiceschanged = pick
    return () => { speechSynthesis.onvoiceschanged = null }
  }, [])

  const stopAll = useCallback(() => {
    try {
      if (audioRef.current) {
        /* Detach handlers BEFORE pausing — pause() rejects any pending
           play() promise, and that rejection still reaches onerror on this
           same Audio object even after we've dropped our own reference to
           it, so the double-fallback latch in speak() would fire the TTS
           fallback for a beat that's no longer current. Found by this
           loop's blind-spot audit: reachable via rapid re-tap of "hear it
           again," back(), or navigating off the screen mid-clip. */
        const a = audioRef.current
        a.onplay = null; a.onerror = null; a.onended = null
        a.pause()
        audioRef.current = null
      }
      if (hasTTS) speechSynthesis.cancel()
    } catch { /* ignore */ }
    setSpeaking(false)
  }, [])

  const clearIdleTimer = useCallback(() => {
    if (idleTimerRef.current) { clearTimeout(idleTimerRef.current); idleTimerRef.current = null }
  }, [])

  const armIdleTimer = useCallback((onFire: () => void) => {
    clearIdleTimer()
    idleTimerRef.current = setTimeout(onFire, 12000)
  }, [clearIdleTimer])

  const speakTTS = useCallback((beat: DeckBeat, useEs: boolean) => {
    if (muted || !hasTTS) return
    try {
      speechSynthesis.cancel()
      const tone = PRX_TONE[beat.tone] || PRX_TONE.calm
      const es = useEs && voiceEsRef.current
      const text = (es ? beat.officer.es : beat.officer.en).replace(/[“”"]/g, '')
      const u = new SpeechSynthesisUtterance(text)
      if (es) u.voice = voiceEsRef.current
      else if (voiceRef.current) u.voice = voiceRef.current
      u.lang = es ? 'es-US' : 'en-US'
      u.rate = tone.rate; u.pitch = tone.pitch
      u.onstart = () => setSpeaking(true)
      u.onend = () => setSpeaking(false)
      u.onerror = () => setSpeaking(false)
      speechSynthesis.speak(u)
    } catch { /* ignore */ }
  }, [muted])

  const speak = useCallback((beat: DeckBeat, lang: Lang, armIdle: boolean) => {
    clearIdleTimer()
    setIdleOffer(false)
    if (muted) { if (armIdle) armIdleTimer(() => setIdleOffer(true)); return }
    const useEs = lang === 'es' && voiceLang === 'es'
    stopAll()
    if (beat.id) {
      const a = new Audio(`/audio/${useEs ? 'es' : 'en'}/${gender}/${beat.id}.mp3`)
      audioRef.current = a
      /* A missing/unplayable clip fires BOTH onerror and rejects play() —
         latch so only one fallback ever fires (index.html:4879-4888). */
      let fell = false
      const fallback = () => { if (fell) return; fell = true; setSpeaking(false); speakTTS(beat, useEs) }
      a.onplay = () => { fell = true; setSpeaking(true) }
      a.onended = () => setSpeaking(false)
      a.onerror = fallback
      a.play().catch(fallback)
    } else {
      speakTTS(beat, useEs)
    }
    if (armIdle) armIdleTimer(() => setIdleOffer(true))
  }, [muted, gender, voiceLang, stopAll, speakTTS, armIdleTimer, clearIdleTimer])

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m
      writeApp('mute', next)
      if (next) { stopAll(); clearIdleTimer(); setIdleOffer(false) }
      return next
    })
  }, [stopAll, clearIdleTimer])

  const setGender = useCallback((g: Gender) => { setGenderState(g); writeApp('voice', g) }, [])
  const setVoiceLang = useCallback((l: Lang) => { setVoiceLangState(l); writeApp('voiceLang', l) }, [])

  const replayIdle = useCallback(() => { setIdleOffer(false) }, [])
  const dismissIdle = useCallback(() => { setIdleOffer(false) }, [])

  useEffect(() => () => { stopAll(); clearIdleTimer() }, [stopAll, clearIdleTimer])

  return { muted, toggleMute, gender, setGender, voiceLang, setVoiceLang, speaking, idleOffer, replayIdle, dismissIdle, speak, stop: stopAll }
}
