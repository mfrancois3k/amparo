/* The one control that is on every screen: opens the Panic HUD.
 *
 * Eager (in the entry chunk) and tiny on purpose. It reads hud-ui.json, a
 * generated file holding only the UI strings: a JSON module shared by this
 * eager import and the lazy HUD would be hoisted into the entry chunk whole,
 * bank and all (measured: 447 kB entry). See App.tsx for the idle prefetch
 * that makes the first tap instant anyway. */
import { ui } from '../../content/hud-ui.json'
import type { Lang } from './model'
import './panicHud.css'

interface PanicButtonProps {
  lang: Lang
  onOpen: () => void
}

export function PanicButton({ lang, onOpen }: PanicButtonProps) {
  const label = (ui as Record<string, { en: string; es: string }>).panicButton[lang]
  return (
    <button type="button" className="panic-btn" onClick={onOpen} aria-haspopup="dialog">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M12 3a7 7 0 0 0-7 7v4l-2 3h18l-2-3v-4a7 7 0 0 0-7-7Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M9 20a3 3 0 0 0 6 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 6v4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
      <span>{label}</span>
    </button>
  )
}
