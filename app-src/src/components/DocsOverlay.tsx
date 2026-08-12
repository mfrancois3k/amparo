/* Document capture overlay. wargames/15 Move 4.1.
 * Ported from renderPapers/docPick/docRemove/docsClear/docsShrink
 * (index.html:3557-3637).
 *
 * Native file input only — no getUserMedia. Root's design history
 * (index.html:3554-3556, and the guided-capture engine deleted in v2.1.0) is a
 * decision, not a gap: `<input type="file" accept="image/*" capture="environment">`
 * is the whole capture mechanism.
 *
 * Storage: own `app_docs` key, separate from `app_you` — mirrors root's
 * sr_docs/sr_save split (index.html:3519-3521) so "delete my photos" can never
 * take the rest of the pack with it.
 */
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Bank } from '../i18n'
import { writeAppReporting } from '../services/storage'
import { DOC_SLOTS, type Docs } from '../screens/youTypes'
import { useOverlayA11y } from '../hooks/useOverlayA11y'

/* Downscale before storing — ported verbatim from docsShrink (index.html:3557-3573).
   1100px on the long edge stays legible at print size and lands each shot near
   100-150 KB; a modern phone photo is 3-8 MB, and localStorage gives the WHOLE
   origin ~5 MB, shared with /app's own state. */
function shrink(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const fr = new FileReader()
    fr.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 1100
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const c = document.createElement('canvas')
        c.width = Math.round(img.width * scale)
        c.height = Math.round(img.height * scale)
        const ctx = c.getContext('2d')
        if (!ctx) { resolve(null); return }
        ctx.drawImage(img, 0, 0, c.width, c.height)
        resolve(c.toDataURL('image/jpeg', 0.72))
      }
      img.onerror = () => resolve(null)
      img.src = String(fr.result)
    }
    fr.onerror = () => resolve(null)
    fr.readAsDataURL(file)
  })
}

type Props = { t: Bank; docs: Docs; onChange: (d: Docs) => void; onClose: () => void }

export function DocsOverlay({ t, docs, onChange, onClose }: Props) {
  const [quotaError, setQuotaError] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const count = Object.values(docs).filter(Boolean).length

  /* Full overlay a11y (focus trap, inert background, focus restore) —
     wargames/15 Move 5.3. Rendered via portal below so `#app-root` can be
     marked inert without deafening the overlay itself, which is a
     descendant of `#app-root` in the component tree even though it visually
     covers the whole screen. */
  useOverlayA11y(cardRef, true, onClose)

  const pick = async (key: string, file: File | undefined) => {
    if (!file || !/^image\//.test(file.type)) return
    const url = await shrink(file)
    if (!url) return
    const next = { ...docs, [key]: url }
    if (!writeAppReporting('docs', next)) { setQuotaError(true); return }
    setQuotaError(false)
    onChange(next)
  }

  const remove = (key: string) => {
    const next = { ...docs }
    delete next[key]
    writeAppReporting('docs', next)
    onChange(next)
  }

  /* window.confirm, matching root's own gate (index.html:3635) rather than
     inventing a two-step in-card confirmation UI for one destructive action. */
  const clearAll = () => {
    if (!window.confirm(t.d_del)) return
    writeAppReporting('docs', {})
    onChange({})
    setDeleted(true)
  }

  return createPortal(
    <div className="ov-backdrop" onClick={onClose}>
      <div className="ov-card" role="dialog" aria-modal="true" aria-label={t.d_title}
        ref={cardRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
        <div className="ov-top">
          <span className="ov-title">{t.d_title}</span>
          <button className="ov-x" onClick={onClose} aria-label={t.d_close}>✕</button>
        </div>

        <p className="sub" style={{ marginTop: 0 }}>{t.d_sub}</p>
        <div className="doc-case">🔒 {t.d_priv}</div>

        {quotaError ? <p className="soon" role="alert">{t.d_quota}</p> : null}

        {DOC_SLOTS.map((d) => {
          const on = !!docs[d.k]
          return (
            <div key={d.k}>
              <div className="docrow">
                <div className="di">{on ? <img src={docs[d.k]} alt="" /> : '📄'}</div>
                <div className="dt"><div className="n">{t[d.t as keyof Bank] as string}</div><div className="s">{(t[d.s as keyof Bank] as string) || ''}</div></div>
                <span className={`st ${on ? 'ok' : 'pend'}`}>{on ? t.d_done_st : t.d_pend_st}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, margin: '6px 0 2px' }}>
                {/* A bare <label> wrapping a display:none input is root's own
                    pattern too (index.html:3627) — and root has the same gap:
                    the label itself is never in the tab order, so the file
                    picker is mouse/touch-only. Found during Move 5.3's
                    keyboard-only pass; fixed here (not backported to root —
                    root stays untouched by policy) with an explicit tabIndex
                    and a keydown handler that forwards Enter/Space to the
                    input, matching what a native <button> gets for free. */}
                <label className="btn ghost" tabIndex={0}
                  style={{ flex: '1 1 0', minWidth: 0, width: 'auto', margin: 0, cursor: 'pointer', fontSize: 13, padding: '9px 10px', textAlign: 'center' }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.querySelector('input')?.click() } }}>
                  {on ? t.d_replace : t.d_tap}
                  <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                    onChange={(e) => { void pick(d.k, e.target.files?.[0]); e.target.value = '' }} />
                </label>
                {on ? (
                  <button className="btn ghost" style={{ flex: '0 0 auto', width: 'auto', margin: 0, fontSize: 13, padding: '9px 12px' }}
                    onClick={() => remove(d.k)}>{t.d_remove}</button>
                ) : null}
              </div>
            </div>
          )
        })}

        <p className="soon" style={{ marginTop: 10 }}>⚖ {t.d_visual}</p>
        <button className="btn gold" onClick={onClose}>{t.d_close}</button>

        {count ? (
          <button className="linkbtn" style={{ marginTop: 10, color: '#a3311f' }} onClick={clearAll}>{t.d_del}</button>
        ) : null}
        {deleted ? <p className="soon" role="status" style={{ color: '#1d4a2c', fontWeight: 700 }}>{t.d_del_ok}</p> : null}
      </div>
    </div>,
    document.body,
  )
}
