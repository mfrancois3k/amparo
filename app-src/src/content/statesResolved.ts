/* The full 51-state table, synthesized exactly as root does it at runtime
 * (index.html:2710-2715):
 *
 *   Object.keys(US_STATE_NAMES).forEach(k => {
 *     if (STATES[k]) return;
 *     const extra = STATE_LEGAL_AID[k];
 *     STATES[k] = { name: US_STATE_NAMES[k], pending: true,
 *                    rules_en: BASE_RULES_EN, rules_es: BASE_RULES_ES,
 *                    lifelines: extra ? [{...extra, tags:["free","safe"]}, ...BASE_LIFELINES] : BASE_LIFELINES };
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
 *
 * STATE_LEGAL_AID added 2026-08-16: 24 of the 48 non-cited states have their
 * own verified county/ZIP-searchable legal-aid directory (researched and
 * WebFetch-confirmed one at a time — see
 * notebook/amparo-directory-feasibility-2026-08-16.md). When present, it's
 * prepended ahead of the generic BASE_LIFELINES entries as the more specific
 * option; the other 24 states get BASE_LIFELINES only, same as before.
 */
import { STATES, US_STATE_NAMES, BASE_RULES_EN, BASE_RULES_ES, BASE_LIFELINES, STATE_LEGAL_AID } from './states.json'

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
const LEGAL_AID = STATE_LEGAL_AID as Record<string, { n: string; p: string; d_en: string; d_es: string }>

export const ALL_STATES: Readonly<Record<string, StateEntry>> = Object.fromEntries(
  Object.keys(NAMES).map((k) => {
    const cited = CITED_STATES[k]
    if (cited) return [k, { ...cited, pending: false }]
    const extra = LEGAL_AID[k]
    const lifelines = extra ? [{ ...extra, tags: ['free', 'safe'] }, ...BASE_LIFELINES] : BASE_LIFELINES
    return [k, { name: NAMES[k], pending: true, rules_en: BASE_RULES_EN, rules_es: BASE_RULES_ES, lifelines }]
  }),
)

/** Same fallback root effectively has (`STATES[data.state||'NY']`, index.html:4035)
    for the one case — no state picked yet — where a concrete entry is required. */
export function resolveState(code: string | null): StateEntry {
  return (code && ALL_STATES[code]) || ALL_STATES.NY
}
