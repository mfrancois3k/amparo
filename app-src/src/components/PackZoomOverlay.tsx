/* Print-page zoom preview. Found by the 2026-08-16 loop's UI/UX audit: the
 * thumbnail grid's .mini clones are pointer-events:none by design (a passive
 * preview, not the real interactive page) — no way to check a page's actual
 * content before spending paper/ink. This overlay reuses the exact same
 * #appPrintRoot .pp source PrintStep.tsx already clones for the thumbnails,
 * just sized to be readable instead of an 80%-width carousel card. Mirrors
 * root's packZoomOpen/packZoomClose (index.html, same date).
 */
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { Bank } from '../i18n'
import { useOverlayA11y } from '../hooks/useOverlayA11y'

type Props = { t: Bank; page: number; caption: string; onClose: () => void }

export function PackZoomOverlay({ t, page, caption, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useOverlayA11y(cardRef, true, onClose)

  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    const pages = document.querySelectorAll('#appPrintRoot .pp')
    const pg = pages[page - 1]
    if (!pg) return
    const clone = pg.cloneNode(true) as HTMLElement
    clone.classList.add('mini')
    clone.style.display = 'block'
    body.appendChild(clone)
    const w = body.clientWidth || 320
    const scale = w / (8.27 * 96)
    clone.style.transform = `scale(${scale})`
    body.style.height = `${10.6 * 96 * scale}px`
    return () => { clone.remove() }
  }, [page])

  return createPortal(
    <div className="ov-backdrop" onClick={onClose}>
      <div className="ov-card" role="dialog" aria-modal="true" aria-label={caption}
        ref={cardRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="ov-top">
          <span className="ov-title">{caption}</span>
          <button className="ov-x" onClick={onClose} aria-label={t.pack_zoom_close}>✕</button>
        </div>
        <div className="mini-wrap" ref={bodyRef} />
      </div>
    </div>,
    document.body,
  )
}
