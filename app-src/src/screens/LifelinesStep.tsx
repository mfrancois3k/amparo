/* Lifelines (step 3). wargames/15 Move 4.2.
 * Ported from index.html:3304-3320 (markup), llTab/llSync/llGo (3871-3919),
 * lifeContact (3852-3859), lnName (2539).
 */
import { useEffect, useRef, useState } from 'react'
import type { Bank } from '../i18n'
import { TAGNAMES, SCEN } from '../content/states.json'
import { resolveState } from '../content/statesResolved'
import { useLang } from '../i18n'
import '../styles/lifelines.css'

const TAGS = TAGNAMES as Record<'en' | 'es', Record<string, string>>
type ScenItem = { ic: string; t: string; d: string; dTX?: string }
const SCENARIOS = SCEN as { en: readonly ScenItem[]; es: readonly ScenItem[] }

/** Ported verbatim from lifeContact (index.html:3852-3859) — decides whether a
    lifeline's contact string is a phone number, a URL, or plain text. */
function lifeContact(raw: string | undefined): { type: 'tel' | 'web' | 'none'; href: string | null } {
  const s = String(raw ?? '').trim()
  if (/^[a-z0-9][a-z0-9./-]*\.[a-z]{2,}/i.test(s)) return { type: 'web', href: 'https://' + s }
  const bare = s.replace(/^(dial|marca el)\s+/i, '')
  const digits = bare.replace(/\D/g, '')
  if (digits.length >= 3 && !/[a-z]{2,}/i.test(bare)) return { type: 'tel', href: 'tel:' + digits }
  return { type: 'none', href: null }
}

type Props = { t: Bank; state: string | null; onBack: () => void; onNext: () => void }

export function LifelinesStep({ t, state, onBack, onNext }: Props) {
  const { lang } = useLang()
  const [tab, setTab] = useState<0 | 1>(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  /* resolveState synthesizes all 51 states the way root does at runtime — a
     raw STATES lookup only has three real entries (TX/GA/NY) and silently
     fell back to New York's lifelines for every other state. See
     content/statesResolved.ts for how that shipped and was caught. */
  const st = resolveState(state)
  const lifelines = st.lifelines
  const scenarios = SCENARIOS[lang]
  const count = tab === 0 ? lifelines.length : scenarios.length

  /* Dots follow the swipe; tapping a dot scrolls to that card. Scroll position
     is the single source of truth, same as root's llSync — no separate
     "current index" state to drift from what is actually on screen. */
  useEffect(() => {
    const tr = trackRef.current
    if (!tr) return
    const sync = () => {
      const cards = [...tr.querySelectorAll<HTMLElement>('.ll-card')]
      if (!cards.length) return
      const mid = tr.scrollLeft + tr.clientWidth / 2
      let best = 0, bd = Infinity
      cards.forEach((c, i) => {
        const d = Math.abs((c.offsetLeft + c.offsetWidth / 2) - mid)
        if (d < bd) { bd = d; best = i }
      })
      setActive(best)
    }
    tr.addEventListener('scroll', sync, { passive: true })
    return () => tr.removeEventListener('scroll', sync)
  }, [tab])

  useEffect(() => { trackRef.current?.scrollTo({ left: 0 }); setActive(0) }, [tab])

  const goTo = (i: number) => {
    const tr = trackRef.current
    const card = tr?.querySelectorAll<HTMLElement>('.ll-card')[i]
    if (!tr || !card) return
    tr.scrollTo({ left: card.offsetLeft - (tr.clientWidth - card.offsetWidth) / 2, behavior: 'smooth' })
  }

  return (
    <div className="card">
      <button className="back" aria-label={t.a11y_back} onClick={onBack}>← {t.a11y_back}</button>

      <h1>{t.l_title}</h1>
      <p className="sub">{t.l_sub}</p>

      <div className="ll-seg" role="tablist">
        <button type="button" role="tab" className={tab === 0 ? 'on' : ''} aria-selected={tab === 0}
          aria-controls="llTrack" onClick={() => setTab(0)}>{t.seg_lines}</button>
        <button type="button" role="tab" className={tab === 1 ? 'on' : ''} aria-selected={tab === 1}
          aria-controls="llTrack" onClick={() => setTab(1)}>{t.seg_covers}</button>
      </div>

      <div className="ll-track" id="llTrack" ref={trackRef} tabIndex={0} role="group" aria-label={t.ll_aria}>
        {tab === 0 ? lifelines.map((L, i) => {
          const name = lang === 'es' && L.n_es ? L.n_es : L.n
          const raw = L.p === 'Coming soon' ? (lang === 'es' ? 'Próximamente' : 'Coming soon')
            : (L.p === 'Dial 211' && lang === 'es' ? 'Marca el 211' : L.p)
          const c = lifeContact(L.p)
          return (
            <article className="ll-card" key={i}>
              <div className="ln">{name}</div>
              {c.href ? (
                <a className="ll-contact" href={c.href} {...(c.type === 'web' ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{raw}</a>
              ) : (
                <div className="ll-contact pending">{raw}</div>
              )}
              <div className="ld">{lang === 'es' ? L.d_es : L.d_en}</div>
              <div className="lltags">{L.tags.map((tag) => (
                <span className={`tag ${tag}`} key={tag}>{TAGS[lang][tag]}</span>
              ))}</div>
            </article>
          )
        }) : scenarios.map((s, i) => (
          <article className="ll-card" key={i}>
            <div className="si">{s.ic}</div>
            <div className="sn">{s.t}</div>
            <div className="ld">{s.d}{state === 'TX' && s.dTX ? ' ' + s.dTX : ''}</div>
          </article>
        ))}
      </div>

      <div className="ll-nav">
        {Array.from({ length: count }, (_, n) => (
          <button type="button" key={n} className={`ll-dot${n === active ? ' on' : ''}`}
            aria-label={t.ll_dot.replace('{n}', String(n + 1))} onClick={() => goTo(n)} />
        ))}
        <span className="ll-count" aria-live="polite">{t.ll_count.replace('{n}', String(active + 1)).replace('{t}', String(count))}</span>
      </div>

      <p className="soon" style={{ marginTop: 8 }}>{tab === 0 ? `${t.ll_tap} · ${t.l_more}` : ''}</p>

      {/* Not gated, matching root's reasoning verbatim: the one real completed-
          funnel user in this product's history said "I skip all of that" —
          forcing a swipe through every card before Continue would have blocked
          the one person who ever finished. */}
      <button className="btn gold" style={{ marginTop: 18 }} onClick={onNext}>{t.l_btn}</button>
    </div>
  )
}
