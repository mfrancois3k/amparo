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
revisor.mn.gov summariser DROPS subdivisions -- open pages. revisor.mo.gov/main/OneChapter.aspx?chapter=NNN. scstatehouse.gov .php TRUNCATES. sdlegislature.gov/api/Statutes/CHAPTER.html = full index. PA: legis.state.pa.us/WU01/LI/LI/CT/HTM/. ok.elaws.us may be 2014 -- flag currency. PRIORITIES: MA St.2020 c.253 POST Commission codified home; MN 169.905 + 169.90-169.91 + ch.626; OR ORS 810.410 read in BODY and report what it forbids, plus ORS 131.915; PA Title 71/53.

TASK
POLICE-PRACTICES CHAPTER SWEEP. This method found RI ch. 31-21.2, which answered SIX product
questions in one section that 35 earlier passes missed. Find each state police-practices /
community-relations / racial-profiling / police-accountability chapter WHEREVER it lives (motor-vehicle
title, criminal procedure, public safety, civil rights). Read EVERY section catchline in it. Report
every section regulating officer conduct AT A TRAFFIC STOP: detention length, consent to search, limits
on documents demanded, stating the reason for the stop, dog sniffs, pretextual stops, inadmissibility,
recording the stop.
Per state output TWO cells: the police-practices chapter cell, then any OTHER matrix column it fills
(name the column: Detention cap / Consent / Reason-for-stop / K-9 / Pretext / Footage access / License).

JURISDICTIONS: MA MI MN MS MO OK OR PA SC SD

WRITE YOUR OUTPUT TO THIS FILE using the Write tool:
  research/inbox/pp3.txt
Format, one line per jurisdiction, NO pipe characters inside a cell:
  CODE | cell | cell
Cell = `VERIFIED §cite -- value <=15 words [remedy: x]` or `null (index read: ...)` or
`host-blocked (hosts tried: ...)` or `did not attempt`.
Follow those lines with URL: lines, one per verified cite.

Then reply with ONE line only: wrote N lines to the path.
