/* /app's own service worker registration. wargames/15 Move 6.1.
 * Ported from index.html:5756-5774 — same https-only gate, same "this is a
 * verifiable claim, not marketing copy" spirit. The reload-on-new-controller
 * dance root hand-rolls is handled internally by `registerType: 'autoUpdate'`
 * here (vite-plugin-pwa's generated SW), so this file is just the gate +
 * the offline-ready signal, dispatched as a DOM event so App.tsx (a plain
 * React tree with no access to this module-scope code otherwise) can show
 * the same honest "saved on this device" banner root shows.
 */
import { registerSW } from 'virtual:pwa-register'

export const OFFLINE_READY_EVENT = 'app-offline-ready'

export function registerAppServiceWorker(): void {
  if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return
  registerSW({
    immediate: true,
    onOfflineReady() {
      window.dispatchEvent(new Event(OFFLINE_READY_EVENT))
    },
    /* Root's registration is fully try/catch-silent too (index.html:5773's
       .catch(()=>{})) — this matches that, not a gap. Named explicitly
       rather than omitted so the silence is a decision on record: if a
       Workbox precache entry 404s (partial deploy, CDN edge inconsistency —
       found by this loop's blind-spot audit), the whole install fails with
       no signal today. Root's own bet throughout this migration is that an
       infra hiccup should degrade to plain network passthrough, never alarm
       the user — same bet here, not a new one. */
    onRegisterError() { /* silent, matching root's own registration catch */ },
  })
}
