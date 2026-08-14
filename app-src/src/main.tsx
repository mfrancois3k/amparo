import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerAppServiceWorker } from './registerSW.ts'

/* Clerk + Convex are installed and configured (app-src/.env.local, plus
   src/clerkAndConvex.ts for the wiring pattern) but deliberately NOT wrapped
   around the whole app here. Tried that first — it pushed the entry chunk
   from ~91 kB gzip to 135 kB gzip (+48%), paid by every /app load, for
   capabilities nothing currently uses. Root's own bundle-size case for /app
   this session was built on that ~91 kB number; eagerly wrapping the app
   would have quietly invalidated it before any auth/payment feature existed
   to justify the cost.
   When a real feature needs either: import ClerkProvider/ConvexProvider
   INSIDE that feature's own lazy-loaded route/component (see App.tsx's
   existing lazy() screens for the pattern), not here at the root. That keeps
   the cost scoped to users who actually reach the feature. */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

registerAppServiceWorker()
