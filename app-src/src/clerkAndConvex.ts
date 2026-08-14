/* Wiring pattern for whichever feature is the FIRST to need Clerk or Convex —
 * not imported anywhere yet. Both are installed and configured
 * (app-src/.env.local has the publishable/client keys; the repo-root
 * .env.local has the secret keys, used only by /api serverless functions).
 *
 * Wrap ONLY the feature that needs this, lazy-loaded, not the app root — see
 * main.tsx for why. Example, once such a feature exists:
 *
 *   const AccountArea = lazy(() => import('./screens/AccountArea'))
 *   // inside AccountArea.tsx:
 *   import { ClerkProvider } from '@clerk/clerk-react'
 *   import { ConvexProviderWithClerk } from 'convex/react-clerk'
 *   import { getConvexClient } from '../clerkAndConvex'
 *
 *   export default function AccountArea() {
 *     const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
 *     return (
 *       <ClerkProvider publishableKey={clerkKey}>
 *         <ConvexProviderWithClerk client={getConvexClient()} useAuth={useAuth}>
 *           ...
 *         </ConvexProviderWithClerk>
 *       </ClerkProvider>
 *     )
 *   }
 *
 * `ConvexProviderWithClerk` (not the plain `ConvexProvider` tried earlier) is
 * the right pairing once both exist together — it forwards Clerk's session
 * token to Convex automatically, which is the whole point of running them
 * side by side rather than as two unrelated providers.
 */
import { ConvexReactClient } from 'convex/react'

let client: ConvexReactClient | null = null

/** Singleton so a feature re-rendering (or two features on the same page)
    doesn't open a second WebSocket connection to the same deployment. */
export function getConvexClient(): ConvexReactClient {
  if (client) return client
  const url = import.meta.env.VITE_CONVEX_URL
  if (!url) throw new Error('VITE_CONVEX_URL missing — check app-src/.env.local')
  client = new ConvexReactClient(url)
  return client
}
