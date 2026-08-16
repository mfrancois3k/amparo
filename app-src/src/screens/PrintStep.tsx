/* Print pack screen (step 4). wargames/15 Move 4.3.
 * Ported from index.html:3323-3414 (step===4 render block).
 *
 * Scope cuts vs root, matching the deferred-and-logged pattern (not silent
 * omission): no demo banner (no demo mode in /app), no full post-print rail
 * (email button, restart/printForFamily/reprint-reminder, print-feedback
 * prompt — each needs its own decision, still deferred). Kept: compare box,
 * thumbnails, docs row, print button, the pdf-help disclosure toggle, and —
 * now that Move 5.2 built the destination — a single practice CTA using
 * root's own `prx_open_cta` string, same as root's rail's first link.
 */
import { useEffect, useRef, useState } from 'react'
import type { Bank } from '../i18n'
import { useLang } from '../i18n'
import { readApp } from '../services/storage'
import { PrintPack } from '../components/PrintPack'
import { DocsOverlay } from '../components/DocsOverlay'
import { PackZoomOverlay } from '../components/PackZoomOverlay'
import { DOC_SLOTS, EMPTY_INFO, type Docs, type YouInfo } from './youTypes'
import '../styles/print.css'

type CmpRow = { label: string; yes: string }

type Props = { t: Bank; state: string | null; onBack: () => void; onNext: () => void }

export function PrintStep({ t, state, onBack, onNext }: Props) {
  const { lang } = useLang()
  const [info] = useState<YouInfo>(() => readApp<YouInfo>('you', EMPTY_INFO))
  const [docs, setDocs] = useState<Docs>(() => readApp<Docs>('docs', {}))
  const [papersOpen, setPapersOpen] = useState(false)
  const [printed, setPrinted] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [zoomPage, setZoomPage] = useState<number | null>(null)
  const thumbsRef = useRef<HTMLDivElement>(null)

  const docsCount = Object.values(docs).filter(Boolean).length
  const status =
    docsCount === 0 ? t.d_st_none
      : docsCount === DOC_SLOTS.length ? t.d_st_all
        : t.d_st_some.replace('{n}', String(docsCount))

  useEffect(() => {
    const onAfterPrint = () => setPrinted(true)
    window.addEventListener('afterprint', onAfterPrint)
    return () => window.removeEventListener('afterprint', onAfterPrint)
  }, [])

  /* Same clone-and-scale mechanism as root (index.html:3391-3406): the six
     hidden #appPrintRoot pages are the single source of truth for both print
     output and on-screen thumbnails, so a thumbnail can never drift from
     what actually prints. */
  useEffect(() => {
    const wrap = thumbsRef.current
    if (!wrap) return
    const pages = document.querySelectorAll('#appPrintRoot .pp')
    const mounts = wrap.querySelectorAll<HTMLElement>('.mini-wrap')
    mounts.forEach((mw) => { mw.innerHTML = '' })
    pages.forEach((pg, i) => {
      const mw = mounts[i]
      if (!mw) return
      mw.setAttribute('aria-hidden', 'true')
      const clone = pg.cloneNode(true) as HTMLElement
      clone.classList.add('mini')
      const w = mw.clientWidth || 480
      const scale = w / (8.27 * 96)
      clone.style.transform = `scale(${scale})`
      clone.style.display = 'block'
      mw.style.height = `${10.6 * 96 * scale}px`
      mw.appendChild(clone)
    })
  }, [state, lang, info, docs])

  const cmpRows = t.cmp_rows as unknown as CmpRow[]
  const captions = [t.v_pg1, t.v_pg2, t.v_pg3, t.v_pg4, t.v_pg5, t.v_pg6] as string[]

  return (
    <div className="card">
      <button className="back" aria-label={t.a11y_back} onClick={onBack}>← {t.a11y_back}</button>

      <h1>{t.v_title}</h1>
      <p className="sub">{t.v_sub}</p>

      <div className="split">
        <div className="split-left">
          <div className="thumbs stagger" ref={thumbsRef}>
            {captions.map((cap, i) => (
              <div className="thumb" key={i} role="button" tabIndex={0}
                onClick={() => setZoomPage(i + 1)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setZoomPage(i + 1) } }}>
                <div className="mini-wrap" />
                <div className="cap">{cap}</div>
              </div>
            ))}
          </div>
          <p className="soon thumbs-hint">{t.v_swipe}</p>
        </div>

        <div className="split-right">
          <div className="compare">
            <h3>{t.cmp_title}</h3>
            <p className="cmp-note">{t.cmp_note}</p>
            {cmpRows.map((r, i) => (
              <div className="cmp-row" key={i}>
                <div className="cmp-label">{r.label}</div>
                <span className="cmp-yes">{r.yes}</span>
              </div>
            ))}
            <p className="cmp-foot">{t.cmp_price}</p>
          </div>

          <div className="docrow" role="button" tabIndex={0}
            onClick={() => setPapersOpen(true)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPapersOpen(true) } }}>
            <div className="di">{docs.lic_f ? <img src={docs.lic_f} alt="" /> : '📷'}</div>
            <div className="dt"><div className="n">{t.d_open}</div><div className="s">{t.d_open_sub}</div></div>
            <span className={`st ${docsCount ? 'ok' : 'pend'}`}>{status}</span>
          </div>

          <button className={`btn ${printed ? 'ghost' : 'gold'}`} onClick={() => window.print()}>
            🖨 {t.v_print_pdf}
          </button>

          <button className={`btn ${printed ? 'gold' : 'ghost'}`} onClick={onNext}>{t.prx_open_cta}</button>

          <button className="linkbtn" style={{ marginTop: 10 }} onClick={() => setHelpOpen((v) => !v)}>{t.pdf_q}</button>
          {helpOpen ? (
            <div>
              <p className="soon" style={{ marginTop: 4 }}>🖨 {t.pdf_hint}</p>
              <p className="soon" style={{ marginTop: 4 }}>💾 {t.pdf_backup}</p>
              <p className="soon" style={{ marginTop: 4 }}>📚 {t.pdf_where}</p>
            </div>
          ) : null}
        </div>
      </div>

      {papersOpen ? (
        <DocsOverlay t={t} docs={docs} onChange={setDocs} onClose={() => setPapersOpen(false)} />
      ) : null}

      {zoomPage ? (
        <PackZoomOverlay t={t} page={zoomPage} caption={captions[zoomPage - 1]} onClose={() => setZoomPage(null)} />
      ) : null}

      <PrintPack t={t} lang={lang} code={state} you={info} docs={docs} />
    </div>
  )
}
