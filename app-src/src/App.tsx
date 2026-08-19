/* App shell. wargames/15 Phase 3-4, build order step 6.
 *
 * The beta banner below is the ONLY hand-written user-facing copy in /app.
 * Everything else — every label, every officer line, every legal phrase —
 * arrives from index.html via tools/extract-app-content.mjs, hash-matched
 * (wargames/15 §0.2). Do not add a string here; add it to the extractor.
 */
import { lazy, Suspense, useEffect, useState } from 'react'
import { openFeedback } from './services/feedback'
import { useLang, useT } from './i18n'
import { LangProvider } from './LangProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Welcome } from './screens/Welcome'
import { REVIEW } from './content/meta.json'
import { readApp, writeApp } from './services/storage'
import { stepIndex, type Route } from './nav'
import { OFFLINE_READY_EVENT } from './registerSW'
import './styles/shell.css'

/* Lazy per screen so the largest content banks (map.json 45.6 kB, states.json's
   STATES 37.8 kB) land in their own chunks instead of the entry bundle. Welcome
   is eager — it is the first paint.

   Eyebrow is lazy too, and that is load-bearing, not incidental: it renders the
   confirmed-state PILL via StateSilhouette, which imports content/map.ts — the
   same module StateMap.tsx uses, holding all of US_PATHS. An eager Eyebrow
   pulled that whole module into the entry chunk (measured: entry jumped from
   91.76 kB to 116.13 kB gz, and the map path data that MUST live only in the
   state-screen chunk showed up in the entry bundle instead). Eyebrow never
   renders on Welcome — the only eager screen — so lazy-loading it costs nothing
   on first paint and everything on the number that matters. */
const StateStep = lazy(() => import('./screens/StateStep').then((m) => ({ default: m.StateStep })))
const YouStep = lazy(() => import('./screens/YouStep').then((m) => ({ default: m.YouStep })))
const LifelinesStep = lazy(() => import('./screens/LifelinesStep').then((m) => ({ default: m.LifelinesStep })))
const PrintStep = lazy(() => import('./screens/PrintStep').then((m) => ({ default: m.PrintStep })))
const PracticeStep = lazy(() => import('./screens/PracticeStep').then((m) => ({ default: m.PracticeStep })))
const Eyebrow = lazy(() => import('./components/Eyebrow').then((m) => ({ default: m.Eyebrow })))

type Pack = { state: string | null }

function Shell() {
  const t = useT()
  const { lang, setLang } = useLang()
  const [route, setRoute] = useState<Route>({ name: 'welcome' })
  const [pack, setPack] = useState<Pack>(() => readApp<Pack>('save', { state: null }))
  const [offlineReady, setOfflineReady] = useState(false)
  /* Set by Welcome's "Just need a lawyer or hotline number?" link, consumed
     once by State's onNext to land on Lifelines instead of You — mirrors
     root's _wantLifelinesShortcut. Reset on any return to Welcome so
     backing out of the flow can't silently skip You on a later, unrelated
     Continue press. Found by this loop's own focus group: the link
     previously called the exact same handler as the primary CTA, so it
     wasn't a shortcut at all. */
  const [wantLifelinesShortcut, setWantLifelinesShortcut] = useState(false)

  useEffect(() => {
    const onReady = () => setOfflineReady(true)
    window.addEventListener(OFFLINE_READY_EVENT, onReady)
    return () => window.removeEventListener(OFFLINE_READY_EVENT, onReady)
  }, [])

  const navigate = (to: Route) => {
    if (to.name === 'welcome') setWantLifelinesShortcut(false)
    setRoute(to)
  }

  const pickState = (code: string) => {
    const next = { ...pack, state: code }
    setPack(next)
    writeApp('save', next)
    /* Root fires sr_state_selected here (index.html:3843). /app ships zero
       analytics (wargames/15 §2), so the call is deleted rather than stubbed. */
  }

  const showEyebrow = route.name === 'state' || route.name === 'you' || route.name === 'lifelines' || route.name === 'print'

  return (
    <div className="app-wrap" id="app-root">
      <header className="app-head">
        <span className="brand"><span className="bn">Amparo</span></span>
        <span className="tagline">{t.tagline}</span>
        {/* aria-labels are root's own, verbatim from index.html:1628 — NOT
            authored here. An earlier version invented a group label
            ("Language / Idioma") and in doing so dropped these, leaving the
            buttons announcing as "EN"/"ES". An accessible name is user-facing
            text; the no-authored-strings rule covers it. */}
        <span className="lang">
          <button
            className={lang === 'en' ? 'on' : ''}
            aria-pressed={lang === 'en'}
            aria-label="English"
            onClick={() => setLang('en')}
          >EN</button>
          <button
            className={lang === 'es' ? 'on' : ''}
            aria-pressed={lang === 'es'}
            aria-label="Español"
            onClick={() => setLang('es')}
          >ES</button>
        </span>
      </header>

      {/* Found by the 2026-08-16 loop: real funnel data showed the biggest
          drop in the product is Welcome -> State (67% never pick a state),
          and Mobbin research on trust-heavy apps showed the pattern that
          works is a concrete privacy line visible BEFORE the ask. This used
          to be hidden on the one screen that needed it most — now shown on
          every step, matching root. */}
      <div className="pilot">{t.pilotBanner}</div>

      <p className="beta-note">
        <strong>Preview build.</strong> The live app is at <a href="/">amparohq.com</a>.
        {/* lang="es" matters: this shows both languages inside an English
            document, so without it a screen reader applies English phonetics to
            the Spanish. Half this product's audience reads that side. */}
        <br />
        <span lang="es">
          <strong>Versión de prueba.</strong> La aplicación real está en <a href="/">amparohq.com</a>.
        </span>
      </p>

      <main>
        {/* Above the Suspense, not inside it: a lazy chunk that fails to load
            rejects into the nearest boundary ABOVE the boundary that suspended,
            and an offline chunk miss is the likeliest failure here. Wrapping
            <main>'s whole body also covers eager Welcome. Everything outside —
            header, language toggle, beta note, disclaimer — survives a throw. */}
        <ErrorBoundary t={t}>
          {route.name === 'welcome' ? (
            <Welcome
              t={t}
              founder={REVIEW.founder}
              onStart={() => navigate({ name: 'state' })}
              onSkipToLifelines={() => { setWantLifelinesShortcut(true); navigate({ name: 'state' }) }}
            />
          ) : null}

          <Suspense fallback={<div className="card" />}>
            {showEyebrow ? (
              <Eyebrow t={t} step={stepIndex(route)} state={pack.state} onPillClick={() => navigate({ name: 'state' })} />
            ) : null}
            {route.name === 'state' ? (
              <StateStep
                t={t}
                picked={pack.state}
                onPick={pickState}
                onBack={() => navigate({ name: 'welcome' })}
                onNext={() => {
                  if (wantLifelinesShortcut) {
                    setWantLifelinesShortcut(false)
                    navigate({ name: 'lifelines' })
                    return
                  }
                  navigate({ name: 'you' })
                }}
              />
            ) : null}
            {route.name === 'you' ? (
              <YouStep
                t={t}
                onBack={() => navigate({ name: 'state' })}
                onNext={() => navigate({ name: 'lifelines' })}
              />
            ) : null}
            {route.name === 'lifelines' ? (
              <LifelinesStep t={t} state={pack.state} onBack={() => navigate({ name: 'you' })} onNext={() => navigate({ name: 'print' })} />
            ) : null}
            {route.name === 'print' ? (
              <PrintStep t={t} state={pack.state} onBack={() => navigate({ name: 'lifelines' })} onNext={() => navigate({ name: 'practice' })} />
            ) : null}
            {route.name === 'practice' ? (
              <PracticeStep t={t} onBack={() => navigate({ name: 'print' })} />
            ) : null}
          </Suspense>
        </ErrorBoundary>
      </main>

      {offlineReady ? <p className="soon" style={{ marginTop: 6 }} role="status">{t.offline_ready}</p> : null}
      {/* Reach-a-human path, same as root's. /sentry.js (~47 kB gz) is injected
          on tap only — nothing is downloaded or sent by a session that never
          uses it. Falls back to mail if the bundle can't load. */}
      <p className="reachus">
        <button type="button" className="linklike" onClick={() => openFeedback(lang)}>{t.fb_reach}</button>
      </p>
      <footer className="disclaimer">{t.disclaimer}</footer>
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <Shell />
    </LangProvider>
  )
}
