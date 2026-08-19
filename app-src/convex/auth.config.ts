/* Clerk is the identity provider. The issuer domain is per-environment and
 * set once by the operator (never hardcoded):
 *   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://<your-clerk-frontend-api>
 * plus a JWT template named "convex" in the Clerk dashboard. */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: 'convex',
    },
  ],
}
