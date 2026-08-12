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
  })
}
