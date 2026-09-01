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
scstatehouse.gov TRUNCATES. sdlegislature.gov/api/Statutes/CHAPTER.html. PA legis.state.pa.us/WU01/. statutes.capitol.texas.gov is a JS shell. le.utah.gov PDFs work. PRIORITIES: OR ORS 810.410 read in BODY; TX CCP 2.131-2.139 -- confirm or REFUTE the recorded-consent claim from body text.

TASK
CONSENT TO SEARCH A VEHICLE AT A TRAFFIC STOP. Find any statute that (a) requires telling the
driver they may REFUSE; (b) requires consent recorded/written/on video; (c) makes consent presumed
involuntary; (d) limits scope or duration; (e) bars the officer from even ASKING absent reasonable
suspicion.
Known shapes to match against: NH RSA 595-A:10 (four-part advisement + cease questioning + recorded
consent + inadmissibility); RI 31-21.2-5(b) and CT 54-33o (may not even ASK); CO 16-3-310
(advisement, but breach is only a factor); VA (exclusion that expressly survives consent).

JURISDICTIONS: OK OR PA SC SD TN TX UT

WRITE YOUR OUTPUT TO THIS FILE using the Write tool:
  research/inbox/co1.txt
Format, one line per jurisdiction, NO pipe characters inside a cell:
  CODE | cell | cell
Cell = `VERIFIED §cite -- value <=15 words [remedy: x]` or `null (index read: ...)` or
`host-blocked (hosts tried: ...)` or `did not attempt`.
Follow those lines with URL: lines, one per verified cite.

Then reply with ONE line only: wrote N lines to the path.
