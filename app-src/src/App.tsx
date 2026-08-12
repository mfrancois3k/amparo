/* App shell. wargames/15 Phase 3, build order step 6.
 *
 * The beta banner below is the ONLY hand-written user-facing copy in /app.
 * Everything else — every label, every officer line, every legal phrase —
 * arrives from index.html via tools/extract-app-content.mjs, hash-matched
 * (wargames/15 §0.2). Do not add a string here; add it to the extractor.
 */
import { lazy, Suspense, useState } from 'react'
import { useLang, useT } from './i18n'
import { LangProvider } from './LangProvider'
import { Welcome } from './screens/Welcome'
import { REVIEW } from './content/meta.json'
import { readApp, writeApp } from './services/storage'
import type { Route } from './nav'
import './styles/shell.css'

/* Lazy so map.json (45.6 kB, the largest bank) lands in its own chunk instead of
   the entry bundle. Welcome is eager — it is the first paint. */
const StateStep = lazy(() =>
  import('./screens/StateStep').then((m) => ({ default: m.StateStep })),
)

type Pack = { state: string | null }

function Shell() {
  const t = useT()
  const { lang, setLang } = useLang()
  const [route, setRoute] = useState<Route>({ name: 'welcome' })
  const [pack, setPack] = useState<Pack>(() => readApp<Pack>('save', { state: null }))

  const navigate = (to: Route) => setRoute(to)

  const pickState = (code: string) => {
    const next = { ...pack, state: code }
    setPack(next)
    writeApp('save', next)
    /* Root fires sr_state_selected here (index.html:3843). /app ships zero
       analytics (wargames/15 §2), so the call is deleted rather than stubbed. */
  }

  return (
    <div className="app-wrap">
      <header className="app-head">
        <span className="brand">Amparo</span>
        <span className="tagline">{t.tagline}</span>
        <span className="lang" role="group" aria-label="Language / Idioma">
          <button
            className={lang === 'en' ? 'on' : ''}
            aria-pressed={lang === 'en'}
            onClick={() => setLang('en')}
          >EN</button>
          <button
            className={lang === 'es' ? 'on' : ''}
            aria-pressed={lang === 'es'}
            onClick={() => setLang('es')}
          >ES</button>
        </span>
      </header>

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
        {route.name === 'welcome' ? (
          <Welcome t={t} founder={REVIEW.founder} onStart={() => navigate({ name: 'state' })} />
        ) : (
          <Suspense fallback={<div className="card" />}>
            <StateStep
              t={t}
              picked={pack.state}
              onPick={pickState}
              onBack={() => navigate({ name: 'welcome' })}
              /* Step 2 (You) is Move 4.1. Until it exists Continue stays on this
                 screen rather than pretending to advance. */
              onNext={() => {}}
            />
          </Suspense>
        )}
      </main>

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
