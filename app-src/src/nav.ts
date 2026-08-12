/* Navigation seam. wargames/15 Phase 3, consolidated build order step 4.
 *
 * This is the CONTRACT without the implementation. Screens navigate through
 * `navigate()` / `stepIndex()` and never touch `location`, `history`, or
 * `hashchange` — so swapping the body below for a real hash router is one file,
 * not a rewrite of every screen.
 *
 * ponytail: useState, not location.hash. A router now would be building for a
 * need that does not exist yet — with two screens there is nothing to deep-link
 * to. The real deep-link targets users have asked for (the practice hub and
 * specific scenarios, per focus groups 04 and 05) arrive in Phase 5. The
 * wargame's Move 3.1/3.2 carry no routing work; taking the seam now is the down
 * payment that keeps the later swap cheap.
 */
import { STEP_SLUG } from './content/ui.json'

export type RouteName = 'welcome' | 'state' | 'you' | 'lifelines' | 'print' | 'practice'
export type Route = { name: RouteName }

/** Index into root's canonical step list, so the stepper stays in sync with root's numbering. */
export function stepIndex(r: Route): number {
  const i = (STEP_SLUG as readonly string[]).indexOf(r.name)
  return i < 0 ? 0 : i
}
