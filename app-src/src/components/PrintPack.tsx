/* The six-page printed pack. wargames/15 Move 4.3.
 * Ported from buildPrint() (index.html:4033-4237).
 *
 * Root builds this as one big innerHTML string, escaping user fields with its
 * own esc() helper. This is real JSX instead — text children are escaped by
 * React automatically, which is a STRICTER guarantee than esc() for the six
 * user-entered fields (name/ec/ecp/ec2/ecp2/att). Two content strings embed
 * real markup from the extracted banks (statute `<i class="stq">` quotes
 * inside STATES rules, and a `<b>` inside PACK_EXTRA.claims) — those two, and
 * only those two, use dangerouslySetInnerHTML on STATIC extracted content,
 * never on a user-entered field.
 */
import { LOGO, ICONS, PLACE_ICONS } from '../content/icons.json'
import { PACK_EXTRA, PLACE } from '../content/pack-extra.json'
import { QR, QR_URL } from '../content/states.json'
import { EDITION, ED_REPLACE, REVIEW } from '../content/meta.json'
import { resolveState, type StateEntry } from '../content/statesResolved'
import type { Bank } from '../i18n'
import type { Lang } from '../services/storage'
import type { YouInfo, Docs } from '../screens/youTypes'
import { DOC_SLOTS } from '../screens/youTypes'
import '../styles/print.css'

const ICON_ORDER = ['road', 'cam', 'card', 'wheel', 'quiet', 'slow', 'badge'] as const
const PLACE_MAP = PLACE as Record<string, { ic: keyof typeof PLACE_ICONS; lb_en: string; lb_es: string; en: string; es: string }>
const QR_MAP = QR as Record<string, string>
const QR_URL_MAP = QR_URL as Record<string, string>

/** Ported from isReviewed/reviewLine (index.html:2590-2596). No attorney has
    signed any edition today — every REVIEW.attorneys[*].name is "" — so this
    always reads PILOT EDITION in practice; ported for when that changes. */
function reviewInfo(code: string): { reviewed: boolean; line: string } {
  const a = (REVIEW.attorneys as Record<string, { name: string; bar: string; date: string; edition: string }>)[code]
  if (!a || !a.name || a.edition !== EDITION) return { reviewed: false, line: '' }
  const num = a.bar ? (code === 'NY' ? `, NY Registration No. ${a.bar}` : `, ${code} Bar #${a.bar}`) : ''
  return {
    reviewed: true,
    line: `${code} content of Edition ${a.edition} reviewed by ${a.name}${num}${a.date ? ' · ' + a.date : ''} · Not legal advice; no attorney-client relationship`,
  }
}

function PlaceStrip({ n, lang }: { n: number; lang: Lang }) {
  const p = PLACE_MAP[String(n)]
  const main = lang === 'es' ? p.es : p.en
  const sub = lang === 'es' ? p.en : p.es
  const lb = lang === 'es' ? p.lb_es : p.lb_en
  return (
    <div className="place">
      <div dangerouslySetInnerHTML={{ __html: PLACE_ICONS[p.ic] }} />
      <div className="pt"><b>{lb}:</b>{main}<span>{sub}</span></div>
    </div>
  )
}

function Foot({ t, lang, page, extra }: { t: Bank; lang: Lang; page: number; extra?: string }) {
  const edLine = ` · ${lang === 'es' ? 'Edición' : 'Edition'} ${EDITION} — ${lang === 'es' ? 'reemplace después de' : 'replace after'} ${ED_REPLACE}`
  const shareLine = REVIEW.siteUrl
    ? ` · ${lang === 'es' ? 'Gratis — imprima más en' : 'Free — print more at'} ${REVIEW.siteUrl} · ${lang === 'es' ? 'Regale una a alguien que quiere' : 'Give one to someone you love'}`
    : ''
  return (
    <div className="pp-foot">
      {t.footer}{shareLine}{edLine}{extra ?? ''}
      <span style={{ float: 'right' }}>{page} / 6</span>
    </div>
  )
}

type Props = { t: Bank; lang: Lang; code: string | null; you: YouInfo; docs: Docs }

export function PrintPack({ t, lang, code, you, docs }: Props) {
  const st: StateEntry = resolveState(code)
  const rules = lang === 'es' ? st.rules_es : st.rules_en
  const PX = (PACK_EXTRA as Record<Lang, Record<string, unknown>>)[lang] as Record<string, string | string[]>
  const claims = (PACK_EXTRA as unknown as { claims: Record<string, Record<Lang, string>> }).claims
  const resolvedCode = code ?? 'NY'
  const { reviewed, line: reviewLine } = reviewInfo(resolvedCode)
  const docsPresent = DOC_SLOTS.filter((d) => docs[d.k])

  return (
    <div id="appPrintRoot">
      {/* PAGE 1 */}
      <div className="pp">
        <div className="pp-head">
          <div className="pp-brand">
            <svg viewBox="0 0 120 120" fill="none" dangerouslySetInnerHTML={{ __html: LOGO }} />
            <div><div className="n">AMPARO</div><div className="t">{t.tagline}</div></div>
          </div>
          <div className="pp-tag">{st.name}{you.name ? ' · ' + you.name : ''}</div>
        </div>
        <PlaceStrip n={1} lang={lang} />
        <div style={{ border: '2px solid #1B2A4A', borderRadius: 12, padding: '10px 14px', marginBottom: 9, background: '#f4f1e7' }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: '#1B2A4A', letterSpacing: '.8px', marginBottom: 6 }}>
            ☑ {t.prep_title}{t.prep_es ? <span style={{ fontWeight: 700, color: 'var(--gold-ink)', fontSize: 10 }}> · {t.prep_es}</span> : null}
          </div>
          {t.prep.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, fontSize: 11.5, marginBottom: 2, lineHeight: 1.32 }}>
              <span style={{ color: '#E8B84B', fontWeight: 900 }}>▸</span>
              <span><b>{p.en}</b> <span style={{ color: 'var(--gold-ink)' }}>{p.es}</span></span>
            </div>
          ))}
        </div>
        {/* pr_title, not hub_title: root's v2.27.0 sweep found page 1 printing
            "Now rehearse it." instead of the intended headline. Same fix here. */}
        <h1>{t.pr_title}</h1>
        {t.pr_es ? <div className="es-sub">{t.pr_es}</div> : null}
        {t.steps.map((s, i) => (
          <div className="step-row" key={i}>
            <div className="step-num">{i + 1}</div>
            <div className="step-ico" dangerouslySetInnerHTML={{ __html: ICONS[ICON_ORDER[i]] }} />
            <div className="step-tx"><div className="en">{s.en}</div><div className="es">{s.es}</div></div>
          </div>
        ))}
        <p style={{ marginTop: 9, fontSize: 12.5, fontWeight: 800, color: '#1B2A4A', background: '#fdf6e3', border: '1.5px solid #E8B84B', borderRadius: 10, padding: '11px 14px' }}>
          ★ {t.pr_practice}
        </p>
        <Foot t={t} lang={lang} page={1} />
      </div>

      {/* PAGE 2 */}
      <div className="pp">
        <div className="pp-head">
          <Brand2 t={t} />
          <div className="pp-tag">{lang === 'es' ? 'Tarjeta de ventana — hacia el oficial' : 'Window card — faces the officer'}</div>
        </div>
        <PlaceStrip n={2} lang={lang} />
        <div className="wcard">
          <div className="wcard-band">
            <div className="b1">AMPARO · {st.name}</div>
            <div className="b2">{lang === 'es' ? 'Tarjeta de ventana' : 'Window card'}</div>
          </div>
          <div className="wcard-body">
            <div style={{ width: '2.5in', flex: 'none', display: 'flex', flexDirection: 'column', gap: 6, alignSelf: 'flex-start' }}>
              {docsPresent.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {docsPresent.map((d) => (
                    <div key={d.k} style={{ width: 'calc(50% - 2px)', border: '1px solid #d8d2c2', borderRadius: 5, overflow: 'hidden', background: '#fff' }}>
                      <img src={docs[d.k]} alt="" style={{ width: '100%', height: 46, objectFit: 'cover', display: 'block' }} />
                      <div style={{ fontSize: 7, textAlign: 'center', padding: '1.5px 2px', color: '#6b7280', fontWeight: 700, lineHeight: 1.25 }}>{t[d.t as keyof Bank] as string}</div>
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="docline" style={{ width: '100%' }}>
                {lang === 'es' ? 'LICENCIA · SEGURO · REGISTRO — a la vista en este sobre' : 'LICENSE · INSURANCE · REGISTRATION — displayed in this sleeve'}
              </div>
            </div>
            <div className="rights">
              <div className="coop">{lang === 'es' ? 'ESTOY COOPERANDO · MIS DOCUMENTOS ESTÁN A LA VISTA · NO ME RESISTO' : 'I AM COOPERATING · MY DOCUMENTS ARE DISPLAYED · I AM NOT RESISTING'}</div>
              <h2 style={{ fontSize: 15 }}>{lang === 'es' ? 'MIS DERECHOS' : 'MY RIGHTS'}</h2>
              <div className="amend">{lang === 'es' ? 'Enmiendas 4.ª y 5.ª · Constitución de EE. UU.' : '4th & 5th Amendments · U.S. Constitution'}</div>
              {t.rights.map((r, i) => {
                const amendEs = r.amend?.replace('5th Amendment', '5.ª Enmienda').replace('4th Amendment', '4.ª Enmienda')
                return (
                  <div className="r-item" key={i}>
                    <div className="n">{i + 1}</div>
                    <div>
                      <div className="en">
                        {lang === 'es' ? r.es : r.en}
                        {r.amend ? <span style={{ fontWeight: 700, fontSize: 10, color: 'var(--gold-ink)' }}> ({lang === 'es' ? amendEs : r.amend})</span> : null}
                      </div>
                      <div className="es">{lang === 'es' ? r.en : r.es}</div>
                    </div>
                  </div>
                )
              })}
              {QR_MAP[resolvedCode] ? (
                <div className="qrbox">
                  <img src={QR_MAP[resolvedCode]} width={52} height={52} style={{ borderRadius: 6, display: 'block' }} alt="" />
                  <div style={{ fontSize: 9.5, color: '#6b7280', lineHeight: 1.4 }}>
                    {lang === 'es'
                      ? `Escanee para el directorio gratuito de ayuda legal de su estado: ${QR_URL_MAP[resolvedCode]}`
                      : `Scan for your state's free legal-aid directory: ${QR_URL_MAP[resolvedCode]}`}
                  </div>
                </div>
              ) : (
                <div className="qrbox">
                  <div style={{ fontSize: 9.5, color: '#6b7280', lineHeight: 1.4 }}>
                    {lang === 'es'
                      ? <>Busque ayuda legal gratuita en su estado: <b>lawhelp.org</b> · Su filial de ACLU: <b>aclu.org/affiliates</b></>
                      : <>Find free legal aid in your state: <b>lawhelp.org</b> · Your ACLU affiliate: <b>aclu.org/affiliates</b></>}
                  </div>
                </div>
              )}
              <div style={{ fontSize: 9.5, color: 'var(--gold-ink)', marginTop: 7, lineHeight: 1.35 }}>
                ⚖ {lang === 'es'
                  ? 'Las fotos impresas son solo ayuda visual — lleve y entregue sus documentos reales cuando se los pidan.'
                  : 'Printed document photos are a visual aid only — carry and hand over your real documents when asked.'}
              </div>
            </div>
          </div>
        </div>
        <div className="staterow">
          <div className="statebox">
            <h3>{st.name} — {lang === 'es' ? 'reglas de su estado' : "your state's rules"}</h3>
            {/* rules[] embeds real markup (<br><i class="stq">…</i>) from the
                extracted STATES bank for the statute-quote citation — static
                app content, not a user field. */}
            <ul>{rules.map((r, i) => <li key={i} dangerouslySetInnerHTML={{ __html: r }} />)}</ul>
          </div>
          <div className="vetting">
            {reviewed ? (
              <><b style={{ color: '#2f8f5b' }}>✓ {lang === 'es' ? 'REVISADO POR ABOGADO' : 'ATTORNEY-REVIEWED'}</b><br />{reviewLine}</>
            ) : (
              <><b>{lang === 'es' ? 'EDICIÓN PILOTO' : 'PILOT EDITION'}</b><br />
                {lang === 'es'
                  ? 'Cada regla cita la ley estatal exacta — verifíquela cuando quiera. Revisión final por abogados en curso. Información general, no asesoría legal.'
                  : 'Every rule is cited to the exact state statute — verify it anytime. Formal attorney sign-off is in progress. General information, not legal advice.'}
              </>
            )}
          </div>
        </div>
        <Foot t={t} lang={lang} page={2} />
      </div>

      {/* PAGE 3 */}
      <div className="pp">
        <div className="pp-head">
          <Brand2 t={t} />
          <div className="pp-tag">{lang === 'es' ? 'Tarjeta de cartera + líneas de ayuda' : 'Wallet card + your lifelines'}</div>
        </div>
        <PlaceStrip n={3} lang={lang} />
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>{t.wl_cut}</p>
        {[0, 1].map((copy) => (
          <div className="wallet" key={copy}>
            <div className="wb">{t.wl_head}{copy ? ` — ${lang === 'es' ? 'COPIA' : 'SPARE'}` : ''}</div>
            <div className="wc">
              {t.rights.slice(0, 3).map((r, i) => (
                <div key={i} style={{ marginBottom: 4 }}><b>{i + 1}.</b> {lang === 'es' ? r.es : r.en}</div>
              ))}
              <div className="wfold"><span>✂ {lang === 'es' ? 'DOBLE AQUÍ' : 'FOLD HERE'}</span></div>
              <div style={{ paddingTop: 2 }}>
                <b>{lang === 'es' ? 'Nombre' : 'Name'}:</b> {you.name || '____________________'}<br />
                <b>{lang === 'es' ? 'Contacto de emergencia' : 'Emergency contact'}:</b> {you.ec || '____________________'} · {you.ecp || '____________'}<br />
                {you.ec2 || you.ecp2 ? (
                  <><b>{lang === 'es' ? 'Contacto de respaldo' : 'Backup contact'}:</b> {you.ec2 || '____________________'} · {you.ecp2 || '____________'}<br /></>
                ) : null}
                {you.att ? <><b>{lang === 'es' ? 'Abogado / ayuda legal' : 'Attorney / legal aid'}:</b> {you.att}<br /></> : null}
                {you.zip ? <><b>{lang === 'es' ? 'Código postal / condado' : 'ZIP / county'}:</b> {you.zip}<br /></> : null}
                <b>{lang === 'es' ? 'No. de póliza / aseguradora' : 'Insurance policy # / company'}:</b> __________<br />
                <b>{lang === 'es' ? 'Tel. del agente de seguros' : 'Insurance agent phone'}:</b> __________
              </div>
            </div>
          </div>
        ))}
        <h3 style={{ fontSize: 13, color: '#1B2A4A', margin: '8px 0 2px', letterSpacing: '.5px' }}>{t.lifelines_print} — {st.name}</h3>
        <div className="lifegrid">
          {st.lifelines.filter((L) => !L.tags.includes('soon')).map((L, i) => (
            <div className="lifebox" key={i}>
              <div className="n">{lang === 'es' && L.n_es ? L.n_es : L.n}</div>
              <div className="p">{L.p === 'Coming soon' ? (lang === 'es' ? 'Próximamente' : 'Coming soon') : (L.p === 'Dial 211' && lang === 'es' ? 'Marque el 211' : L.p)}</div>
              <div className="d">{lang === 'es' ? L.d_es : L.d_en}</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#fdf6e3', border: '1.5px solid #E8B84B', borderRadius: 10, padding: 13, fontSize: 12.5, lineHeight: 1.5, marginTop: 9 }}>
          <b>{lang === 'es' ? 'Después de la parada' : 'After the stop'}:</b>{' '}
          {lang === 'es'
            ? 'Anote la agencia, el número de placa y la hora. Si sus derechos fueron violados, presente una queja por escrito y contacte las líneas de arriba. No discuta en la carretera — gane en papel.'
            : "Write down the agency, badge number, and time. If your rights were violated, file a written complaint and contact the lifelines above. Don't argue on the roadside — win on paper."}
        </div>
        <Foot t={t} lang={lang} page={3} extra={lang === 'es' ? ' · Amparo no está afiliado ni respaldado por las organizaciones listadas.' : ' · Amparo is not affiliated with or endorsed by the organizations listed.'} />
      </div>

      {/* PAGE 4 */}
      <div className="pp">
        <div className="pp-head"><Brand2 t={t} /><div className="pp-tag">{PX.p4_tag as string}</div></div>
        <PlaceStrip n={4} lang={lang} />
        <h1 style={{ fontSize: 18, marginBottom: 2 }}>{PX.p4_h as string}</h1>
        <div className="p4grid">
          <div className="p4col">
            <Box warn h={PX.say_h as string} icon="💬" items={PX.say as string[]} />
            <Box warn h={PX.ask_h as string} icon="🪪" items={PX.ask as string[]} />
          </div>
          <div className="p4col">
            <Box h={PX.cap_h as string} icon="👁" items={PX.cap as string[]} />
            <Box h={PX.arr_h as string} icon="🚔" items={PX.arr as string[]} />
            <LogBox h={PX.log_h as string} icon="📝" items={PX.log as string[]} />
          </div>
        </div>
        <Foot t={t} lang={lang} page={4} />
      </div>

      {/* PAGE 5 */}
      <div className="pp">
        <div className="pp-head"><Brand2 t={t} /><div className="pp-tag">{PX.p5_tag as string}</div></div>
        <PlaceStrip n={5} lang={lang} />
        <h1 style={{ fontSize: 20 }}>{PX.fp_h as string}</h1>
        <div className="p4grid">
          <div className="p4col">
            <div className="pbox">{(PX.fp as string[]).map((x, i) => <div className="logline" key={i}><b>{x}</b><span /></div>)}</div>
            <Box h={PX.fpg_h as string} icon="✅" items={PX.fp_g as string[]} />
          </div>
          <div className="p4col">
            <Box warn h={PX.ns_h as string} icon="🚫" items={PX.ns as string[]} />
            <Box h={PX.chk_h as string} icon="🚧" items={PX.chk as string[]} />
            {/* Root defect (index.html:4207): PX.con_h is undefined — PACK_EXTRA
                has no con_h key in en or es, so root's buildPrint() literally
                prints the word "undefined" as this box's header. Not something
                to hand-author a replacement string for — degrade to icon-only
                instead of reproducing the glitch. */}
            <Box h="" icon="📞" items={PX.con as string[]} />
            <Box h={PX.pp_h as string} icon="👪" items={PX.pp as string[]} />
          </div>
        </div>
        <div className="cuth">✂ {PX.cut_h as string}</div>
        <div className="cutrow">
          <div className="cut">{PX.cut1 as string}</div>
          <div className="cut">{PX.cut2 as string}</div>
          <div className="cut">{PX.cut3 as string}</div>
        </div>
        <Foot t={t} lang={lang} page={5} />
      </div>

      {/* PAGE 6 */}
      <div className="pp">
        <div className="pp-head"><Brand2 t={t} /><div className="pp-tag">{PX.p6_tag as string}</div></div>
        <PlaceStrip n={6} lang={lang} />
        <h1 style={{ fontSize: 20 }}>{PX.p6_h as string}</h1>
        <div className="p4grid">
          <div className="p4col">
            <Box warn h={PX.tk_h as string} icon="🎫" items={PX.tk as string[]} />
            <Box h={PX.ph_h as string} icon="🗣" items={PX.ph as string[]} />
            <Box h={PX.phn_h as string} icon="📱" items={PX.phn as string[]} />
          </div>
          <div className="p4col">
            <div className="pbox warn">
              <h3>⏰ {PX.claim_h as string}</h3>
              {/* claims text embeds a <b> tag from the extracted bank — same
                  static-content exception as the statute quotes above. */}
              <div style={{ fontSize: 10.3, lineHeight: 1.45 }} dangerouslySetInnerHTML={{ __html: (claims[resolvedCode] ?? claims.DEFAULT)[lang] }} />
            </div>
            <Box h={PX.tow_h as string} icon="🚛" items={PX.tow as string[]} />
            <Box h={PX.trap_h as string} icon="👂" items={PX.trap as string[]} />
            <Box warn h={PX.ev_h as string} icon="⏳" items={PX.ev as string[]} />
            <Box h={PX.cr_h as string} icon="💥" items={PX.cr as string[]} />
          </div>
        </div>
        <Foot t={t} lang={lang} page={6} />
      </div>
    </div>
  )
}

/* Small helpers, private to this file. */
function Brand2({ t }: { t: Bank }) {
  return (
    <div className="pp-brand">
      <svg viewBox="0 0 120 120" fill="none" dangerouslySetInnerHTML={{ __html: LOGO }} />
      <div><div className="n">AMPARO</div><div className="t">{t.tagline}</div></div>
    </div>
  )
}
function Box({ h, icon, items, warn }: { h: string; icon: string; items: string[]; warn?: boolean }) {
  return (
    <div className={`pbox${warn ? ' warn' : ''}`}>
      <h3>{icon} {h}</h3>
      <ul>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
    </div>
  )
}
function LogBox({ h, icon, items }: { h: string; icon: string; items: string[] }) {
  return (
    <div className="pbox">
      <h3>{icon} {h}</h3>
      {items.map((x, i) => <div className="logline" key={i}><b>{x}</b><span /></div>)}
    </div>
  )
}
