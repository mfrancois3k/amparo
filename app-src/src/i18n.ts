/* Language state + string access. wargames/15 Phase 3, build order step 5.
 *
 * Both banks are imported statically and eagerly. They are ~29 kB gzipped
 * together, and the app must work offline from the first visit — a lazily
 * fetched language file is one more thing that can be missing at the roadside,
 * which is the exact moment this product has to work. Measured, not assumed.
 *
 * `Bank = typeof en` gives compile-time-checked keys with no dependency: a
 * misspelled key is a type error, and deleting a key from t.es.json fails the
 * build because BANKS is typed Record<Lang, Bank>.
 */
import { createContext, useContext } from 'react'
import en from './content/t.en.json'
import es from './content/t.es.json'
import { readApp, readRootSave } from './services/storage'

export type Lang = 'en' | 'es'
export type Bank = typeof en

const BANKS: Record<Lang, Bank> = { en, es }

/* readRootSave() whitelists `state` against the set it is given. We want only the
   language hint here, and deliberately do not import states.json to get a real
   whitelist — that would pull ~6 kB gzipped into the entry chunk to validate a
   field this call ignores. The empty set is named so the call site reads as a
   decision rather than an oversight: `state` comes back null ALWAYS from this
   call, and nothing here may treat that as "the user has no state". */
const NO_STATE_WHITELIST: ReadonlySet<string> = new Set()

/**
 * Resolve the language for this visit.
 *
 * Precedence, and why each step is where it is:
 *   1. `app_lang` — an explicit toggle in /app. The user's own choice wins.
 *   2. root's `sr_save.lang` — read-only. A returning root user keeps the
 *      language they already chose over there.
 *   3. `navigator.language` — ONLY when root has no saved pack at all. This
 *      mirrors root exactly: its Spanish sniff lives inside `if(!s){…return}`
 *      (index.html:3649-3663), so a returning user never reaches it. A root
 *      save with an unreadable lang therefore resolves to 'en', NOT to the
 *      browser language — that asymmetry is deliberate and is what the
 *      i18n check pins.
 *   4. 'en'.
 */
export function resolveInitialLang(): Lang {
  const stored = readApp<Lang | null>('lang', null)
  if (stored === 'en' || stored === 'es') return stored

  const rootSave = readRootSave(NO_STATE_WHITELIST)
  if (rootSave) return rootSave.lang === 'es' ? 'es' : 'en'

  const nav = (typeof navigator !== 'undefined' && navigator.language) || ''
  return nav.toLowerCase().startsWith('es') ? 'es' : 'en'
}

export type Ctx = { lang: Lang; t: Bank; setLang: (l: Lang) => void }

/* Context and hooks live here, deliberately apart from the provider component in
   LangProvider.tsx: a module that exports both a component and other bindings
   breaks React Fast Refresh, which oxlint's only-export-components flags. This
   file holds no component, that one holds nothing else. */
export const LangContext = createContext<Ctx | null>(null)
export { BANKS }

function useLangCtx(): Ctx {
  const c = useContext(LangContext)
  if (!c) throw new Error('useT/useLang used outside <LangProvider>')
  return c
}

export const useT = (): Bank => useLangCtx().t
export const useLang = (): { lang: Lang; setLang: (l: Lang) => void } => {
  const { lang, setLang } = useLangCtx()
  return { lang, setLang }
}
