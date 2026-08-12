/* Language provider. Split from i18n.ts so that file exports no component and
 * this one exports nothing else — a module mixing the two breaks React Fast
 * Refresh, which oxlint's only-export-components rule flags.
 */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
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
  }, [])

  /* Keyed on `lang`, NOT done inside setLang. The attribute has to track the
     language however it was arrived at, and most of the ways are not clicks:
     a persisted app_lang, a lang inherited from root's saved pack, or the
     browser-language sniff all resolve at mount with no toggle involved. An
     earlier version assigned it only in setLang, so a Spanish-resolving visit
     rendered the entire page in Spanish inside <html lang="en"> until the user
     happened to press the toggle — a screen reader reads all of it with English
     phonetics. Same bug the banner's lang="es" fixes, at document scope. */
  useEffect(() => {
    try { document.documentElement.lang = lang } catch { /* non-DOM env */ }
  }, [lang])

  const value = useMemo<Ctx>(() => ({ lang, t: BANKS[lang], setLang }), [lang, setLang])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}
