/**
 * Parses research/state-matrix.md into records.
 *
 * The matrix is the research team's audit surface: one row per jurisdiction,
 * nineteen columns, every cell a verdict + citation + finding + bracket tags.
 * This parser is deliberately strict: a row with the wrong cell count throws
 * naming the state, because a silently mis-aligned row would file Florida's
 * signing rule under "Footage access" and nothing downstream could notice.
 *
 * Nothing here interprets the law. It only reads what the cell says.
 */

/** Table order. `key` is the machine name every consumer uses. */
export const COLUMNS = Object.freeze([
  { key: 'stopAndId', label: 'Stop-and-ID' },
  { key: 'driverId', label: 'License (driver ID)' },
  { key: 'consentSearch', label: 'Consent to search' },
  { key: 'passengerId', label: 'Passenger ID' },
  { key: 'signCitation', label: 'Sign citation' },
  { key: 'recording', label: 'Recording own stop' },
  { key: 'firearmInform', label: 'Duty to inform (firearm)' },
  { key: 'officerCondition', label: 'Officer condition (marked/uniform)' },
  { key: 'safeStop', label: 'Lit-place / safe stop' },
  { key: 'detentionCap', label: 'Detention cap' },
  { key: 'checkpoint', label: 'Checkpoint authority' },
  { key: 'impersonation', label: 'Impersonation' },
  { key: 'pretext', label: 'Pretext / secondary-offense' },
  { key: 'k9', label: 'K-9 sniff' },
  { key: 'policePractices', label: 'Police-practices chapter' },
  { key: 'reasonForStop', label: 'Reason-for-stop duty' },
  { key: 'ticketVsArrest', label: 'Ticket vs arrest' },
  { key: 'footageAccess', label: 'Footage access' },
  { key: 'dutyToIntervene', label: 'Duty to intervene' },
])

export const VERDICTS = Object.freeze([
  'VERIFIED', // cell carries quoted primary text
  'CONFIRMED', // older synonym for VERIFIED, kept distinct so provenance is not rewritten
  'LIKELY', // reported, not body-verified
  'REFUTED', // the cited section does not say what secondary sources claim
  'CASE_LAW_ONLY', // protection exists in case law, no statute
  'NULL', // verified absence: the index was read and nothing exists
  'HOST_BLOCKED', // the official host refused the fetch; nothing verified
  'UNASSESSED', // dash: not yet looked at
])

const SEP = /\s+(?:--|—)\s+/
const TAG = /\s*\[([^\]]+?):\s*([^\]]*)\]/g

/** One cell -> { verdict, cite, value, tags, raw }. */
export function parseCell(raw) {
  const text = String(raw ?? '').trim()
  const tags = {}
  const untagged = text
    .replace(TAG, (_, k, v) => {
      tags[k.trim()] = v.trim()
      return ''
    })
    .trim()
  const cell = (verdict, cite, value) => ({ verdict, cite, value, tags, raw: text })

  if (untagged === '' || untagged === '—' || untagged === '--') return cell('UNASSESSED', null, '')
  let m
  if ((m = /^null\s*\((.*)\)$/s.exec(untagged))) return cell('NULL', null, m[1].trim())
  if (/^null\b/.test(untagged)) return cell('NULL', null, untagged.slice(4).trim())
  if ((m = /^host-blocked\s*\((.*)\)$/s.exec(untagged))) return cell('HOST_BLOCKED', null, m[1].trim())
  if ((m = /^CASE LAW ONLY(?:\s*(?:--|—)\s*|\s+)(.*)$/s.exec(untagged))) return cell('CASE_LAW_ONLY', null, m[1].trim())

  const head = /^(VERIFIED|CONFIRMED|LIKELY|REFUTED)\b\s*(.*)$/s.exec(untagged)
  if (!head) return cell('UNASSESSED', null, untagged)
  const [, verdict, rest] = head
  const parts = rest.split(SEP)
  if (parts.length === 1) return cell(verdict, null, rest.trim())
  const [cite, ...valueParts] = parts
  return cell(verdict, cite.trim() || null, valueParts.join(' -- ').trim())
}

const ROW = /^\|\s*\*\*([A-Z]{2})\*\*\s*([^|]+?)\s*\|(.*)$/

/** Whole markdown file -> { columns, states: [{ code, name, cells }] }. */
export function parseMatrix(md) {
  const states = []
  for (const line of String(md).split(/\r?\n/)) {
    const m = ROW.exec(line)
    if (!m) continue
    const [, code, name, rest] = m
    // The row ends with "|"; splitting the remainder on "|" leaves a trailing
    // empty string which is dropped. Cells never contain a pipe (the research
    // format uses "--" and brackets), so a count mismatch is a real defect.
    const cellsRaw = rest.split('|')
    if (cellsRaw[cellsRaw.length - 1].trim() === '') cellsRaw.pop()
    if (cellsRaw.length !== COLUMNS.length) {
      throw new Error(`state-matrix row ${code}: expected ${COLUMNS.length} cells, found ${cellsRaw.length}`)
    }
    const cells = {}
    COLUMNS.forEach((c, i) => {
      cells[c.key] = parseCell(cellsRaw[i])
    })
    states.push({ code, name: name.trim(), cells })
  }
  if (states.length === 0) throw new Error('state-matrix: no jurisdiction rows found')
  return { columns: COLUMNS, states }
}
