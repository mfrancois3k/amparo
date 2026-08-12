/* Types and constants shared by YouStep and DocsOverlay, split out so
 * YouStep.tsx exports only a component — a file mixing the two breaks React
 * Fast Refresh, same reasoning as the i18n.ts / LangProvider.tsx split.
 */
export type YouInfo = {
  name: string; ec: string; ecp: string; ec2: string; ecp2: string; att: string
}
export const EMPTY_INFO: YouInfo = { name: '', ec: '', ecp: '', ec2: '', ecp2: '', att: '' }

export type Docs = Record<string, string>

/** Slot metadata — ported verbatim from DOCS (index.html:3527-3533). */
export const DOC_SLOTS = [
  { k: 'lic_f', t: 'd_lic_f', s: 'd_lic_f_s' },
  { k: 'lic_b', t: 'd_lic_b', s: 'd_lic_b_s' },
  { k: 'ins_f', t: 'd_ins_f', s: 'd_ins_f_s' },
  { k: 'ins_b', t: 'd_ins_b', s: 'd_ins_b_s' },
  { k: 'reg', t: 'd_reg', s: 'd_reg_s' },
] as const
