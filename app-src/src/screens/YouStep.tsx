/* You (step 2) + document capture overlay. wargames/15 Move 4.1.
 * Ported from index.html:3271-3302 (form), 3527-3637 (docs system).
 */
import { useState } from 'react'
import type { Bank } from '../i18n'
import { readApp, writeApp } from '../services/storage'
import { DocsOverlay } from '../components/DocsOverlay'
import { DOC_SLOTS, EMPTY_INFO, type Docs, type YouInfo } from './youTypes'
import '../styles/you.css'

type Props = { t: Bank; onBack: () => void; onNext: () => void }

export function YouStep({ t, onBack, onNext }: Props) {
  const [info, setInfo] = useState<YouInfo>(() => readApp<YouInfo>('you', EMPTY_INFO))
  const [docs, setDocs] = useState<Docs>(() => readApp<Docs>('docs', {}))
  const [papersOpen, setPapersOpen] = useState(false)

  const field = (key: keyof YouInfo, value: string) => {
    const next = { ...info, [key]: value }
    setInfo(next)
    writeApp('you', next)
  }

  const docsCount = Object.values(docs).filter(Boolean).length
  const status =
    docsCount === 0 ? t.d_st_none
      : docsCount === DOC_SLOTS.length ? t.d_st_all
        : t.d_st_some.replace('{n}', String(docsCount))

  return (
    <div className="card">
      <button className="back" aria-label={t.a11y_back} onClick={onBack}>← {t.a11y_back}</button>

      <h1>{t.i_title}</h1>
      <p className="sub">{t.i_sub}</p>
      <p className="soon" style={{ textAlign: 'left', margin: '-4px 0 10px' }}>✳️ {t.i_opt}</p>

      <div>
        <label htmlFor="f_name">{t.i_name}</label>
        <input id="f_name" type="text" autoComplete="name" enterKeyHint="next"
          placeholder={t.i_name_ph} value={info.name} onChange={(e) => field('name', e.target.value)} />

        <label htmlFor="f_ec">{t.i_ec}</label>
        <input id="f_ec" type="text" autoComplete="off" enterKeyHint="next"
          placeholder={t.i_ec_ph} value={info.ec} onChange={(e) => field('ec', e.target.value)} />

        <label htmlFor="f_ecp">{t.i_ecp}</label>
        <input id="f_ecp" type="tel" autoComplete="tel" inputMode="tel" enterKeyHint="next"
          placeholder={t.i_ecp_ph} value={info.ecp} onChange={(e) => field('ecp', e.target.value)} />

        <div style={{ marginTop: 2 }}>
          <div className="lblhead">{t.i_ec2_h}</div>
          <p className="soon" style={{ textAlign: 'left', margin: '2px 0 6px', fontSize: 12 }}>{t.i_ec2_note}</p>
          <input type="text" aria-label={t.i_ec2_a11y} autoComplete="off" enterKeyHint="next"
            placeholder={t.i_ec2_ph} value={info.ec2} onChange={(e) => field('ec2', e.target.value)}
            style={{ marginBottom: 8 }} />
          <input type="tel" aria-label={t.i_ecp2_a11y} autoComplete="tel" inputMode="tel" enterKeyHint="next"
            placeholder={t.i_ecp2_ph} value={info.ecp2} onChange={(e) => field('ecp2', e.target.value)} />
        </div>

        <label htmlFor="f_att">{t.i_att}</label>
        <input id="f_att" type="tel" autoComplete="off" inputMode="tel" enterKeyHint="done"
          placeholder={t.i_att_ph} value={info.att} onChange={(e) => field('att', e.target.value)} />

        {/* i_email / REVIEW.emailEnabled: root gates this field behind a flag that
            is false today (index.html:2578) and routes submissions through a
            Netlify function that does not exist in /app. Omitted rather than
            wired to nothing — the field returns when Move 4.3's email path does. */}
      </div>

      {/* Root's next step from You is Lifelines (saveInfo() -> goM(3),
          index.html:3995-4012), not Print — an earlier version of this screen
          disabled Continue on the wrong assumption that Print was the
          destination and blocked it. skipInfo() (index.html:3983-3986) reaches
          the same screen: "data initializes every info field to empty, so
          jumping straight from the state pick to Lifelines is exactly what a
          full skip-through already produces — no new state to construct." */}
      <button className="btn gold" onClick={onNext}>{t.next} →</button>
      <button className="btn ghost" onClick={onNext}>{t.i_skip_all}</button>

      <div className="docrow" role="button" tabIndex={0}
        onClick={() => setPapersOpen(true)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPapersOpen(true) } }}>
        <div className="di">{docs.lic_f ? <img src={docs.lic_f} alt="" /> : '📷'}</div>
        <div className="dt"><div className="n">{t.d_open}</div><div className="s">{t.d_open_sub}</div></div>
        <span className={`st ${docsCount ? 'ok' : 'pend'}`}>{status}</span>
      </div>

      {papersOpen ? (
        <DocsOverlay t={t} docs={docs} onChange={setDocs} onClose={() => setPapersOpen(false)} />
      ) : null}
    </div>
  )
}
