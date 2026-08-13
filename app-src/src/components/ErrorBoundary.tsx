/* Error boundary around the routed screens.
 *
 * /app had none: a throw in any screen unmounted the whole root and left a
 * white page — including the header, language toggle and disclaimer, which
 * were all still fine. This keeps the shell and degrades only the screen.
 *
 * A class because React 19 still ships no function-component equivalent of
 * getDerivedStateFromError, and react-error-boundary would be a dependency
 * for twenty lines.
 *
 * The one string is `t.c_retry`, extracted like every other (wargames/15
 * §0.2). There is no "something went wrong" line in the banks, so the
 * fallback says only what an extracted string can honestly say rather than
 * authoring copy here. An explanatory sentence would have to go into
 * index.html and come back through tools/extract-app-content.mjs.
 *
 * Reload rather than a local setState reset: React.lazy caches a rejected
 * import, so re-rendering the same children re-throws without refetching —
 * and a chunk that failed to load is the likeliest way this ever fires. The
 * reload is offline-safe; the SW precaches the built shell (vite.config.ts:68).
 *
 * console.error is the entire report. /app ships zero analytics and its CSP is
 * connect-src 'self', so there is nowhere off-device to send this and
 * deliberately no attempt to.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react'
import type { Bank } from '../i18n'

type Props = { t: Bank; children: ReactNode }
type State = { failed: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    /* Same `.card` shell the Suspense fallback uses, so a failure reads as a
       screen that did not arrive rather than as a broken page. */
    /* role="alert" so a screen reader announces the failure at all. Without it
       the screen simply becomes a button with no explanation of what happened.
       This does NOT close the gap: `c_retry` is the *camera* retry string
       (index.html:2000) and there is no generic error sentence anywhere in the
       463-key bank. Adding one is a one-line EN+ES addition to index.html plus
       a re-extract, and it is NOT blocked by hard rule 1 — it is UI chrome, not
       legal content — but the Spanish wording is the operator's call, not a
       model's. Tracked in HANDOFF. */
    return (
      <div className="card" role="alert">
        <button className="btn ghost" onClick={() => location.reload()}>{this.props.t.c_retry}</button>
      </div>
    )
  }
}
