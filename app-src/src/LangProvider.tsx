/* Language provider. Split from i18n.ts so that file exports no component and
 * this one exports nothing else — a module mixing the two breaks React Fast
 * Refresh, which oxlint's only-export-components rule flags.
 */
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { BANKS, LangContext, resolveInitialLang, type Ctx, type Lang } from './i18n'
import { writeApp } from './services/storage'

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(resolveInitialLang)

  /* Only an explicit toggle is persisted. The RESOLVED initial language is never
     written, so root's preference keeps flowing through until the user actually
     chooses here — and /app never writes to storage on mere page load. */
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    // writeApp applies the app_ prefix itself; a root key is not addressable.
    writeApp('lang', l)
    try { document.documentElement.lang = l } catch { /* non-DOM env */ }
  }, [])

  const value = useMemo<Ctx>(() => ({ lang, t: BANKS[lang], setLang }), [lang, setLang])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}
