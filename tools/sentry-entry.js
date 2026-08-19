/* Source for the SELF-HOSTED Sentry bundle (built to /sentry.js by
 * tools/build-sentry.mjs). Self-hosted on purpose: this repo already
 * self-hosts its fonts rather than hit a CDN, and `script-src 'self'` in
 * vercel.json stays clean if nothing external loads.
 *
 * Scope is deliberately narrow for a product whose whole promise is that
 * nothing you type leaves the device:
 *   - errors only. NO session replay (it would record the screen of someone
 *     filling in their emergency contacts), NO tracing/performance.
 *   - sendDefaultPii:false, and beforeSend/beforeBreadcrumb strip anything
 *     that could carry typed text or a state/ZIP-bearing URL.
 *   - the feedback widget is the point: a way to reach a human that works
 *     without a mail client, with name and email OPTIONAL so a scared user
 *     can write anonymously.
 */
import * as Sentry from '@sentry/browser'

const DSN = 'https://bdcd823d482226f8fa802393c58994e4@o4509837098221568.ingest.us.sentry.io/4509837484621824'

/** Strip query + hash from any URL we report — root encodes nothing sensitive
    there today, but a future `?state=NY&zip=10001` must never become telemetry. */
function bareUrl(u) {
  if (typeof u !== 'string') return u
  const cut = u.search(/[?#]/)
  return cut === -1 ? u : u.slice(0, cut)
}

const COPY = {
  en: {
    triggerLabel: 'Send feedback',
    formTitle: 'Tell Michael what happened',
    messagePlaceholder:
      "What went wrong, what you needed and couldn't find, or what would have helped. Writing anonymously is fine — leave the name and email blank.",
    submitButtonLabel: 'Send',
    cancelButtonLabel: 'Cancel',
    nameLabel: 'Name (optional)',
    emailLabel: 'Email (optional — only if you want a reply)',
    messageLabel: 'Message',
    successMessageText: 'Thank you — this goes straight to Michael.',
  },
  es: {
    triggerLabel: 'Enviar comentarios',
    formTitle: 'Cuéntele a Michael qué pasó',
    messagePlaceholder:
      'Qué salió mal, qué necesitaba y no encontró, o qué le habría ayudado. Puede escribir de forma anónima — deje el nombre y el correo en blanco.',
    submitButtonLabel: 'Enviar',
    cancelButtonLabel: 'Cancelar',
    nameLabel: 'Nombre (opcional)',
    emailLabel: 'Correo (opcional — solo si quiere respuesta)',
    messageLabel: 'Mensaje',
    successMessageText: 'Gracias — esto le llega directamente a Michael.',
  },
}

let feedback = null
let started = false

function start(lang) {
  if (started) return
  started = true
  const c = COPY[lang === 'es' ? 'es' : 'en']
  feedback = Sentry.feedbackIntegration({
    autoInject: false, // we place our own trigger; no floating Sentry button
    showBranding: false,
    colorScheme: 'light',
    isNameRequired: false,
    isEmailRequired: false,
    enableScreenshot: false, // a screenshot here could contain a licence photo
    ...c,
  })

  Sentry.init({
    dsn: DSN,
    integrations: [feedback],
    sendDefaultPii: false,
    tracesSampleRate: 0, // no performance data collected
    /* Errors only, and only ours: an extension throwing inside the page is
       noise we can't fix and shouldn't collect. */
    allowUrls: [/amparohq\.com/, /localhost/, /127\.0\.0\.1/],
    beforeBreadcrumb(b) {
      /* ui.input breadcrumbs can carry what the user typed. Dropped outright.
         Navigation/fetch/xhr crumbs get their URLs stripped of query+hash. */
      if (b.category === 'ui.input') return null
      if (b.data) {
        if (b.data.from) b.data.from = bareUrl(b.data.from)
        if (b.data.to) b.data.to = bareUrl(b.data.to)
        if (b.data.url) b.data.url = bareUrl(b.data.url)
      }
      return b
    },
    /* Verified in @sentry/core: sendEvent gates beforeSend on
       `isErrorEvent(event)`, and the feedback integration sets
       type:"feedback". So beforeSend NEVER ran on a feedback submission —
       the widget promised "anonymously is fine" while event.user, the full
       URL and the user agent all went out unscrubbed. This hook is the one
       Sentry actually calls for feedback. */
    beforeSendFeedback(event) {
      delete event.user
      if (event.request) {
        if (event.request.url) event.request.url = bareUrl(event.request.url)
        delete event.request.cookies
        delete event.request.query_string
        if (event.request.headers) {
          delete event.request.headers.Referer
          delete event.request.headers['User-Agent']
        }
      }
      if (event.contexts) delete event.contexts.browser
      return event
    },
    beforeSend(event) {
      if (event.request) {
        if (event.request.url) event.request.url = bareUrl(event.request.url)
        delete event.request.cookies
        delete event.request.data
        delete event.request.query_string
        if (event.request.headers) {
          delete event.request.headers.Referer
          delete event.request.headers['User-Agent'] // HttpContext adds this to every event
        }
      }
      delete event.user // never identify anyone
      return event
    },
  })
}

/* Public API. This whole bundle is ~47 kB gzip, so the host pages NEVER load
   it eagerly — a ~15-line inline shim buffers errors and only injects this
   script when something actually breaks or the user taps feedback. A visitor
   whose session is healthy and who never writes to us downloads nothing and
   sends nothing. */
window.AmparoFeedback = {
  /** Open the feedback form. `lang` is 'en' | 'es'. */
  async open(lang) {
    start(lang)
    const form = await feedback.createForm()
    form.appendToDom()
    form.open()
  },
  /** Flush errors the inline shim buffered before this bundle arrived. Each
      entry is {msg, src, line, col, err} straight off window.onerror, or
      {reason} from unhandledrejection. */
  flush(lang, queue) {
    start(lang)
    ;(queue || []).forEach((e) => {
      const real = e && (e.err || e.reason)
      if (real instanceof Error) Sentry.captureException(real)
      else Sentry.captureMessage(String((e && (e.msg || e.reason)) || 'unknown error'))
    })
  },
}
