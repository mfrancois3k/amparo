/* The Panic HUD: the eight to ten lines for this state, full screen, black on
 * white contrast, no network, no animation. Everything it shows comes from
 * content/hud.json (generated); the view model is model.ts.
 *
 * Lazy chunk: this is where the whole state bank lives. */
import { useEffect, useRef } from 'react'
import { ui, federal, states } from '../../content/hud.json'
import { hudFor, stateFromSearch, type HudBank, type Lang } from './model'
import './panicHud.css'

const bank = { version: 1, sourceHash: '', ui, federal, states } as unknown as HudBank
const FOCUSABLE = 'button, [href], select, input, textarea, [tabindex]:not([tabindex="-1"])'

interface PanicHudProps {
  lang: Lang
  stateCode: string | null
  onClose: () => void
}

export function PanicHud({ lang, stateCode, onClose }: PanicHudProps) {
  const view = hudFor(stateFromSearch(window.location.search, bank) ?? stateCode, lang, bank)
  const rootRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const pushedRef = useRef(false)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  /* Mount-only: remember who had focus, take it, push one history entry so
     the phone's Back gesture closes the HUD instead of leaving the app, and
     give it all back on unmount. Deliberately not keyed on `onClose`: the
     parent passes a fresh function each render, and re-running this would
     re-capture "previous focus" as our own Close button. */
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    if (!window.history.state?.panic) {
      window.history.pushState({ panic: 1 }, '')
      pushedRef.current = true
    }
    return () => { previous?.focus?.() }
  }, [])

  /* Escape closes; Tab cycles inside the dialog (aria-modal alone does not
     trap focus everywhere); Back closes. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); return }
      if (e.key !== 'Tab' || !rootRef.current) return
      const items = Array.from(rootRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute('disabled'))
      if (items.length === 0) return
      const first = items[0], last = items[items.length - 1]
      const active = document.activeElement
      if (e.shiftKey && (active === first || !rootRef.current.contains(active))) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && (active === last || !rootRef.current.contains(active))) { e.preventDefault(); first.focus() }
    }
    const onPop = () => { pushedRef.current = false; onCloseRef.current() }
    window.addEventListener('keydown', onKey)
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPop)
    }
  }, [])

  /* Close first, then consume the history entry we pushed. Closing through
     popstate alone left the HUD open when the back navigation was swallowed
     (embedded viewers, some in-app browsers); this order works everywhere and
     the trailing popstate finds no listener. */
  const close = () => {
    onCloseRef.current()
    if (pushedRef.current) {
      pushedRef.current = false
      window.history.back()
    }
  }

  const t = ui as Record<string, { en: string; es: string }>
  return (
    <div ref={rootRef} className="panic-hud" role="dialog" aria-modal="true" aria-labelledby="panic-title">
      <div className="panic-hud__inner">
        <header className="panic-hud__head">
          <div>
            <p className="panic-hud__kicker">{t.title[lang]}</p>
            <h2 id="panic-title">{view.stateName ?? t.federalOnly[lang]}</h2>
          </div>
          <button ref={closeRef} type="button" className="panic-hud__close" onClick={close}>{t.close[lang]}</button>
        </header>

        <ol className="panic-hud__lines">
          {view.lines.map((l) => (
            <li key={l.id} className={l.emphasis ? 'is-emph' : undefined}>
              <p>{l.text}</p>
              {l.cite || l.flag ? (
                <p className="panic-hud__meta">
                  {l.cite ? <span className="panic-hud__cite">{l.cite}</span> : null}
                  {l.flag === 'likely' ? <span className="panic-hud__flag">{t.likely[lang]}</span> : null}
                </p>
              ) : null}
            </li>
          ))}
        </ol>

        <footer className={`panic-hud__notice${view.reviewed ? ' is-reviewed' : ''}`}>
          <strong>{view.reviewed ? t.reviewed[lang] : t.provisional[lang]}</strong>
          <span>{view.notice}</span>
        </footer>
      </div>
    </div>
  )
}
