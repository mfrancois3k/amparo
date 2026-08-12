/* Derived map tables. wargames/15 Phase 3, build order step 8.
 *
 * The one module that imports map.json (45.6 kB — the largest content bank), so
 * it lands in the state-screen chunk and never in the entry chunk. Named imports
 * only; a default import would defeat Vite's per-key tree-shaking.
 *
 * Root computes label positions at runtime with getBBox() (index.html:3746-3782).
 * We do not, because SM_BOX already IS that measurement: index.html:3731-3734
 * records that it was "measured once from the rendered paths and baked in". Using
 * it deletes the whole bug class the wargame warns about — no attached/visible-SVG
 * precondition, no measurement that can run too early, no labels stacking at 0,0.
 * Labels render in the same JSX pass as the paths.
 *
 * The extractor now fails if SM_BOX and US_PATHS ever disagree on their key set,
 * which is the only way this can silently drift.
 */
import { US_PATHS, SM_LBL, SM_BOX } from './map.json'

type Box = [number, number, number, number]        // x, y, width, height
type Lbl = [number, number, string]                // dx, dy, mode ('m' | 'r')

const PATHS = US_PATHS as Record<string, string>
const BOXES = SM_BOX as unknown as Record<string, Box>
const LBLS = SM_LBL as unknown as Record<string, Lbl>

export const VIEWBOX = '0 0 959 593'               // index.html:3231
export const CODES: readonly string[] = Object.keys(PATHS)
export const PATH_D = PATHS

export type MapLabel = {
  code: string
  x: number
  y: number
  anchor: 'start' | 'middle'
  delayMs: number
}

/* Ported arithmetic from smPlaceLabels (index.html:3760-3771), with SM_BOX
   substituted for getBBox(). The `+4` on y is root's baseline nudge; the delay is
   root's west-to-east wave, timed off each state's real centroid across the
   959-unit viewBox. */
export const LABELS: readonly MapLabel[] = CODES.map((code) => {
  const [bx, by, bw, bh] = BOXES[code]
  const [dx, dy, mode] = LBLS[code] ?? [0, 0, 'm']
  const right = mode === 'r'
  return {
    code,
    x: right ? bx + bw + dx : bx + bw / 2 + dx,
    y: by + bh / 2 + dy + 4,
    anchor: right ? 'start' : 'middle',
    delayMs: Math.round(((bx + bw / 2) / 959) * 420),
  }
})

export const DELAY_MS: Record<string, number> =
  Object.fromEntries(LABELS.map((l) => [l.code, l.delayMs]))

/** Crop viewBox for a single state's silhouette — ported from smShape (index.html:3740-3745). */
export function shapeViewBox(code: string): string | null {
  const b = BOXES[code]
  if (!b || !PATHS[code]) return null
  const pad = Math.max(b[2], b[3]) * 0.08
  return `${b[0] - pad} ${b[1] - pad} ${b[2] + pad * 2} ${b[3] + pad * 2}`
}
