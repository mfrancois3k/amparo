Legal-research SCOUT. LOCATORS ONLY. No sub-agents.

HARD RULES
- Never quote or summarise statutory text beyond a <=15-word cell value. Longer text is DISCARDED UNREAD.
- Report only pages YOU fetched this session. "not found" and "did not attempt" are DIFFERENT; a
  not-found cell MUST name the index or chapter you actually read, or it is discarded.
- EXCLUDE unenacted bills. Eight fake laws in this project traced to bills (TN HB0055, NJ A2310,
  TX SB1700, AZ SB1071, AL SB84, MS HB1203, GA HB115, NY S9840/S3662A).
- EXCLUDE DUI implied-consent statutes (breath/blood/urine). Every state has one; all irrelevant here.
- ALWAYS report the remedy: [remedy: exclusion] / [remedy: a factor] / [remedy: none].
  A duty without a remedy is a different product answer. This matters more than the rule itself.

HOSTS: law.justia.com 403s the FETCH tool but works through the BROWSER tool. The shared browser tab
DRIFTS -- other states pages have been served under the requested URL -- so confirm the section number
appears in the page BODY immediately before you record it.
ksrevisor.gov refuses -- kslegislature.gov. apps.legislature.ky.gov PDFs. mgaleg.maryland.gov JS shell. revisor.mn.gov DROPS subdivisions. revisor.mo.gov/main/OneChapter.aspx?chapter=NNN. mca.legmt.gov. PRIORITIES, all legalised cannabis: MD 2023 odour provision; MN 2023 ch.169 + ch.152; MO 2022 ch.307 + Art.XIV statutes; NJ 2021 odour provision -- find the N.J.S.A. cite, it would be the FIRST codified NJ stop protection in this project.

TASK
PRETEXTUAL-STOP LIMITS. Which minor violations may NOT be the sole reason for a stop? Find any
statute that (a) makes an equipment or minor violation SECONDARY-ONLY -- no stop solely for it (tail
light, object hung from mirror, expired tags, tint, exhaust, plate frame, no front plate); (b) bars the
ODOUR OF CANNABIS alone as grounds for a stop or search; (c) bars race-based stops; (d) gives an
EXCLUSIONARY remedy.
Models: the 8 Virginia sections (No law-enforcement officer shall stop, plus evidence inadmissible
INCLUDING evidence obtained with the operator consent, plus a 4th-month grace for expired stickers);
CT 54-33p (odour, under-5oz, under-500-dollar cash barred in part or in whole, exclusion); MT 44-2-117.

JURISDICTIONS: KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ

WRITE YOUR OUTPUT TO THIS FILE using the Write tool:
  research/inbox/px2.txt
Format, one line per jurisdiction, NO pipe characters inside a cell:
  CODE | cell | cell
Cell = `VERIFIED §cite -- value <=15 words [remedy: x]` or `null (index read: ...)` or
`host-blocked (hosts tried: ...)` or `did not attempt`.
Follow those lines with URL: lines, one per verified cite.

Then reply with ONE line only: wrote N lines to the path.
