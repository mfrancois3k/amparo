/* Reach-a-human path for /app. Mirrors the inline shim root and /arena carry:
 * the self-hosted /sentry.js bundle (~47 kB gzip) is injected on demand only,
 * so a session that never errors and never writes to us downloads nothing and
 * transmits nothing — which is what the privacy note promises.
 *
 * Deliberately NOT the npm @sentry/react package: importing it here would put
 * those 47 kB into a chunk the router can pull in eagerly. One self-hosted
 * bundle shared by all three surfaces also means one place to audit.
 */
type FeedbackApi = {
  open: (lang: string) => Promise<void>
  flush: (lang: string, queue: unknown[]) => void
}

declare global {
  interface Window {
    AmparoFeedback?: FeedbackApi
    __sqErr?: unknown[]
    __sLoad?: Promise<FeedbackApi | undefined>
  }
}

function load(): Promise<FeedbackApi | undefined> {
  if (window.__sLoad) return window.__sLoad
  window.__sLoad = new Promise<FeedbackApi | undefined>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = '/sentry.js'
    s.async = true
    s.onload = () => resolve(window.AmparoFeedback)
    s.onerror = reject
    document.head.appendChild(s)
  })
  return window.__sLoad
}

export function openFeedback(lang: string): void {
  load()
    .then((a) => a?.open(lang))
    .catch(() => {
      /* blocked or offline — don't leave the tap dead */
      location.href = 'mailto:feedback@amparohq.com'
    })
}

/** Buffer errors and only fetch the bundle if something actually breaks. */
export function armErrorReporting(getLang: () => string): void {
  window.__sqErr = window.__sqErr || []
  let t: ReturnType<typeof setTimeout> | undefined
  const flushSoon = () => {
    clearTimeout(t)
    // debounce: one broken render can fire a burst; ship them together
    t = setTimeout(() => {
      load()
        .then((a) => a?.flush(getLang(), window.__sqErr!.splice(0)))
        .catch(() => {})
    }, 2000)
  }
  addEventListener('error', (e) => {
    window.__sqErr!.push({ msg: e.message, err: e.error })
    flushSoon()
  })
  addEventListener('unhandledrejection', (e) => {
    window.__sqErr!.push({ reason: e.reason })
    flushSoon()
  })
}
