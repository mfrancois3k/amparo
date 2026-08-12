/* Overlay accessibility: Escape, focus trap, focus restore, inert background.
 * wargames/15 Move 5.3 (H1/H2). Ported from index.html:5814-5877.
 *
 * Root centralizes this across seven overlays with a MutationObserver keyed
 * on each overlay's `.open` class, because all seven exist as DOM siblings
 * of `#appRoot` at all times (just hidden). /app has no such always-mounted
 * DOM to observe — overlays are conditionally rendered React components — so
 * this is a hook driven by the `active` boolean React already tracks,
 * applied per-overlay at mount/unmount instead of via a shared observer.
 * The semantics are the same: on open, remember the trigger and mark
 * `#app-root` inert; on close, remove inert and restore focus to the
 * trigger; while open, Tab wraps inside the container and Escape closes.
 *
 * Root's z-order "topmost wins" logic (`ovTop()`) doesn't apply here either:
 * /app has exactly one overlay type live today (DocsOverlay), never nested,
 * so there is nothing to be topmost OVER. If a second overlay is ever
 * opened from inside DocsOverlay (root's doc/carry-over-practice case), this
 * hook's per-instance `inert` calls compose correctly on their own — the
 * outer overlay's container just needs to sit outside `#app-root` too (see
 * the portal note in DocsOverlay.tsx) — but re-deriving root's shared
 * topmost-picker is deferred until a second overlay actually exists.
 */
import { useEffect } from 'react'

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

function focusableItems(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null)
}

/** `containerRef` is the trap boundary (Tab wraps within it). `active` is
    whatever boolean already gates the overlay's render. `onClose` fires on
    Escape. `appRootId` defaults to the shell's root element. */
export function useOverlayA11y(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean,
  onClose: () => void,
  appRootId = 'app-root',
): void {
  useEffect(() => {
    if (!active) return
    const container = containerRef.current
    if (!container) return

    const trigger = document.activeElement as HTMLElement | null
    const root = document.getElementById(appRootId)
    root?.setAttribute('inert', '')

    // The container is filled in the same tick this effect runs, so the
    // focus-target query below already sees real content — no setTimeout
    // needed (root's version needs one only because it reacts to a class
    // mutation on an element whose children are populated a moment later).
    const items = focusableItems(container)
    if (items.length) items[0].focus({ preventScroll: true })
    else { container.setAttribute('tabindex', '-1'); container.focus({ preventScroll: true }) }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
      if (e.key !== 'Tab') return
      const focusable = focusableItems(container)
      if (!focusable.length) return
      const first = focusable[0], last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)

    return () => {
      document.removeEventListener('keydown', onKey)
      root?.removeAttribute('inert')
      try { trigger?.focus({ preventScroll: true }) } catch { /* trigger no longer focusable */ }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onClose/containerRef are stable per overlay instance; re-running per render would drop the trigger-restore, same reasoning as the effect this replaces
  }, [active])
}
