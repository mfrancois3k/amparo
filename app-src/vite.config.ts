import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Amparo /app strangler build — wargames/15 Move 1.1.
//
// base '/app/'      the build is served from a subpath on the SAME origin as the
//                   live single-file app at '/'. Root stays the default entry
//                   until documented parity; this build must never assume '/'.
// outDir '../app'   the compiled output is COMMITTED to the repo at /app, because
//                   the Vercel project is zero-config static with no build step
//                   (DEPLOYMENT.md). Adding a package.json at the repo root would
//                   trip framework auto-detection and could break root deploys —
//                   so the source lives here, outside the served tree.
// emptyOutDir       required: Vite refuses to clear an outDir outside the project
//                   root without it. /app holds build output only, never anything
//                   hand-written.
export default defineConfig({
  plugins: [react()],
  base: '/app/',
  build: {
    outDir: '../app',
    emptyOutDir: true,
  },
})
