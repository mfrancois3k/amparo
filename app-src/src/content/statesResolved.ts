/* The full 51-state table, synthesized exactly as root does it at runtime
 * (index.html:2547-2553):
 *
 *   Object.keys(US_STATE_NAMES).forEach(k => {
 *     if (STATES[k]) return;
 *     STATES[k] = { name: US_STATE_NAMES[k], pending: true,
 *                    rules_en: BASE_RULES_EN, rules_es: BASE_RULES_ES,
 *                    lifelines: BASE_LIFELINES };
 *   });
 *
 * The extracted `STATES` literal in states.json holds only the three states
 * with real cited content (TX, GA, NY) — root builds the other 48 by mutating
 * the same object at load time, so nothing upstream of this file ever saw a
 * "raw" STATES with only three keys. A caller that reads the sliced literal
 * directly gets exactly that unsynthesized, wrong table.
 *
 * THIS WAS A REAL SHIPPED BUG: Move 4.2's LifelinesStep read raw `STATES` and
 * fell back to `ALL_STATES.NY` for any code not in the three-key table — so
 * every non-cited state (48 of 51) showed New York's lifelines instead of the
 * federal floor. Caught by driving the app in a browser (picking California
 * and reading the rendered lifeline name), not by re-reading the code.
 */
import { STATES, US_STATE_NAMES, BASE_RULES_EN, BASE_RULES_ES, BASE_LIFELINES } from './states.json'

export type Lifeline = { n: string; n_es?: string; p: string; d_en: string; d_es: string; tags: readonly string[] }
export type StateEntry = {
  name: string
  pending: boolean
  rules_en: readonly string[]
  rules_es: readonly string[]
  lifelines: readonly Lifeline[]
}

const NAMES = US_STATE_NAMES as Record<string, string>
const CITED_STATES = STATES as Record<string, Omit<StateEntry, 'pending'>>

export const ALL_STATES: Readonly<Record<string, StateEntry>> = Object.fromEntries(
  Object.keys(NAMES).map((k) => {
    const cited = CITED_STATES[k]
    return [k, cited
      ? { ...cited, pending: false }
      : { name: NAMES[k], pending: true, rules_en: BASE_RULES_EN, rules_es: BASE_RULES_ES, lifelines: BASE_LIFELINES }]
  }),
)

/** Same fallback root effectively has (`STATES[data.state||'NY']`, index.html:4035)
    for the one case — no state picked yet — where a concrete entry is required. */
export function resolveState(code: string | null): StateEntry {
  return (code && ALL_STATES[code]) || ALL_STATES.NY
}
