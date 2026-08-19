/* Builds tools/sentry-entry.js into the self-hosted /sentry.js bundle that
 * root, /arena and /app all load. Run from app-src (where the deps live):
 *   cd app-src && node ../tools/build-sentry.mjs
 * esbuild and @sentry/browser both come from app-src/node_modules — nothing
 * new is installed at the repo root, which has no package.json.
 */
import { build } from 'esbuild'
import { statSync } from 'fs'
import { gzipSync } from 'zlib'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const here = dirname(fileURLToPath(import.meta.url))
const repo = resolve(here, '..')
const OUT = resolve(repo, 'sentry.js')

await build({
  entryPoints: [resolve(here, 'sentry-entry.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  outfile: OUT,
  legalComments: 'none',
  define: { 'process.env.NODE_ENV': '"production"' },
  // the entry lives in tools/, which has no node_modules of its own
  nodePaths: [resolve(repo, 'app-src', 'node_modules')],
})

const raw = readFileSync(OUT)
console.log(
  `${OUT}: ${(statSync(OUT).size / 1024).toFixed(1)} kB raw, ` +
    `${(gzipSync(raw).length / 1024).toFixed(1)} kB gzip`,
)
