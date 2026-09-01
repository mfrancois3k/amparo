import os
B = 'research/briefs'
os.makedirs(B, exist_ok=True)
os.makedirs('research/inbox', exist_ok=True)

COLS = ("Stop-and-ID | License (driver ID) | Consent to search | Passenger ID | Sign citation | "
        "Recording own stop | Duty to inform (firearm) | Officer condition (marked/uniform) | "
        "Lit-place / safe stop | Detention cap | Checkpoint authority | Impersonation | "
        "Pretext / secondary-offense | K-9 sniff | Police-practices chapter | Reason-for-stop duty | "
        "Ticket vs arrest | Footage access")

EX = """EXTRACTION task. No web research. No sub-agents.

SOURCE: C:\\Users\\mfran\\Ai-Foundations\\Amparo\\research\\archive\\state-law-matrix-ledger.md
~7,200 lines, append-only. The NEWEST statement about a cell is nearest the BOTTOM and wins.
Anything marked RETRACTED or SUPERSEDED is dead.

18 COLUMNS IN ORDER:
{COLS}

METHOD: Grep -n for each state bold code (e.g. `**AL**`) and its full name. Read hits with
offset/limit -- never read the whole file. For each column take the LATEST surviving finding.

CELL FORMAT -- one line, NO pipe characters, no newlines inside a cell:
  `VERIFIED §cite -- value <=15 words`   (only where the ledger marks **VERIFIED**)
  `LIKELY §cite -- value`
  `UNVERIFIED §cite -- value`
  `null (index read)`                    verified absence
  `host-blocked`
  `--`                                   never assessed
Include the remedy where the ledger states one (exclusion / a factor / none).

WRITE YOUR OUTPUT TO THIS FILE using the Write tool:
  {OUT}
File contents = exactly one table row per state, this shape, no preamble:
| **AL** Alabama | c1 | c2 | ... | c18 |

Then reply with ONE line only: wrote N rows to the path.

YOUR STATES: {STATES}
{HINTS}
"""

ex = [
 ("ex01", "Alabama (AL), Alaska (AK), Arizona (AZ), Arkansas (AR), California (CA)", ""),
 ("ex02", "Colorado (CO), Connecticut (CT), Delaware (DE), Florida (FL), Georgia (GA)",
  "HINTS: CO consent 16-3-310 tier2 a-factor; CO 16-3-103 has NO 90-min cap. CT 54-33o no-ask + 54-33p cannabis, exclusion. DE 11-1902(c) 2-hour cap. GA 40-8-91(f) savings clause."),
 ("ex03", "Hawaii (HI), Idaho (ID), Illinois (IL), Indiana (IN), Iowa (IA)",
  "HINTS: HI 134-9.2(b) passenger firearm; 291E-19/-20 checkpoints. IL 625 ILCS 5/11-212 consent datum incl K-9; 720 ILCS 5/31-4.5 is Category D. IN 34-28-5-3(a) three enumerated acts. IA ch.321K roadblocks; Iowa-blocked entries were RETRACTED."),
 ("ex04", "Kansas (KS), Kentucky (KY), Louisiana (LA), Maine (ME), Maryland (MD)",
  "HINTS: KS 8-1568 is officer-identifiability NOT lit-place; 8-1759; 22-4609. LA art.215.1(D); 32:295.4; Orleans Parish sub-state variation. MD 25-113(d)(5) consent datum. KY 189.126; 15A.195."),
 ("ex05", "Massachusetts (MA), Michigan (MI), Minnesota (MN), Mississippi (MS), Missouri (MO)",
  "HINTS: MA c.90 s.63 datum. MI 750.539c deliberately LIKELY; 257.715(2) check LANES not sobriety; 257.223(2) device-consent. MN 169.905 reason-for-stop; MN consent is case law. MS 97-9-72(5)(b) lit-place. MO 590.650(2)(4) datum incl duration; 304.152 motorcycle checkpoint ban."),
 ("ex06", "Montana (MT), Nebraska (NE), Nevada (NV), New Hampshire (NH), New Jersey (NJ)",
  "HINTS: MT 46-5-401 reason-for-stop, 46-5-403 duration, 46-5-502/-510 checkpoints, 44-2-117 pretext. NE Category B; 28-1202.04 hand/weapon; 20-504 datum. NV 171.123(3)/(4); 484B.007; 199.430 currency unverified; 289.830. NH 595-A:10 consent exclusion; 265:1-a; 105-D bodycam. NJ consent is case law; unmarked-car rule = bills only; 40A:14-118.5 bodycam 180d."),
 ("ex07", "New Mexico (NM), New York (NY), North Carolina (NC), North Dakota (ND), Ohio (OH)",
  "HINTS: NM 29-21-1..-4 no consent provision. NY unmarked-car = REVOKED 1996 executive order; consent advisement = unenacted bills; CVR 79-p recording. NC 15A-1113(b); 14-415.11 has NO no-reaching duty; 143B-903; 15A-221/222 analog only. ND 29-29-21 silent on duration; ch.24-15; 39-07-07. OH 2921.29(C) Category A with cap."),
 ("ex08", "Oklahoma (OK), Oregon (OR), Pennsylvania (PA), Rhode Island (RI), South Carolina (SC)",
  "HINTS: OK 21-1290.8(C) no-disarm; 21-540B; currency flagged. OR 811.540(2) UNMARKED-only lit-place; 131.615. PA 6308(b) purpose not length; 75-3733(c)(2)(iv). RI 31-21.2-5 = detention(a), no-ask consent(b), doc cap(d), pretext doc(e), exclusion(f), dashcam(g); 12-7-1 2h; 31-21.2-3. SC 17-13-170(C)(2); 56-5-1280 accident duty NOT passenger ID."),
 ("ex09", "South Dakota (SD), Tennessee (TN), Texas (TX), Utah (UT), Vermont (VT)",
  "HINTS: SD 32-33-10..-14; injured-or-defrauded impersonation. TN 55-10-413(f) cite is WRONG; HB0055 = bill. TX SB1700 = bill analysis; CCP arts 2.131-2.138. UT Category A 76-8-301.5 corrected from B; 77-7-15 silent; 77-23-103/104; carry law renumbered Title 53 ch.5a. VT 1220 REPEALED 2021; 1012 in-charge-of NOT passenger."),
 ("ex10", "Virginia (VA), Washington (WA), West Virginia (WV), Wisconsin (WI), Wyoming (WY), District of Columbia (DC)",
  "HINTS: VA 19.2-83 REPEALED 1994; pretext = 8 sections tier0 (46.2-1052(P), -1003(C), -1013(B), -1054(B), -1094(F), -646, -1157, 4.1-1302); 46.2-103. WA RCW 46.64.015; 46.61.021(3); 9.73.030. WV 61-5-17(l) definitional carve-out; 17C-19-2; checkpoint HOST-BLOCKED. WI 349.02(2); 968.24. WY 7-17-102. DC 50-2201.05b(c)(4). SIX rows."),
]
for name, states, hints in ex:
    out = 'research/inbox/%s-rows.txt' % name
    open('%s/%s.md' % (B, name), 'w', encoding='utf-8').write(
        EX.replace('{COLS}', COLS).replace('{OUT}', out)
          .replace('{STATES}', states).replace('{HINTS}', hints))

SC = """Legal-research SCOUT. LOCATORS ONLY. No sub-agents.

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
{HOSTS}

TASK
{TASK}

JURISDICTIONS: {STATES}

WRITE YOUR OUTPUT TO THIS FILE using the Write tool:
  {OUT}
Format, one line per jurisdiction, NO pipe characters inside a cell:
  CODE | cell | cell
Cell = `VERIFIED §cite -- value <=15 words [remedy: x]` or `null (index read: ...)` or
`host-blocked (hosts tried: ...)` or `did not attempt`.
Follow those lines with URL: lines, one per verified cite.

Then reply with ONE line only: wrote N lines to the path.
"""

PP = """POLICE-PRACTICES CHAPTER SWEEP. This method found RI ch. 31-21.2, which answered SIX product
questions in one section that 35 earlier passes missed. Find each state police-practices /
community-relations / racial-profiling / police-accountability chapter WHEREVER it lives (motor-vehicle
title, criminal procedure, public safety, civil rights). Read EVERY section catchline in it. Report
every section regulating officer conduct AT A TRAFFIC STOP: detention length, consent to search, limits
on documents demanded, stating the reason for the stop, dog sniffs, pretextual stops, inadmissibility,
recording the stop.
Per state output TWO cells: the police-practices chapter cell, then any OTHER matrix column it fills
(name the column: Detention cap / Consent / Reason-for-stop / K-9 / Pretext / Footage access / License)."""

CO = """CONSENT TO SEARCH A VEHICLE AT A TRAFFIC STOP. Find any statute that (a) requires telling the
driver they may REFUSE; (b) requires consent recorded/written/on video; (c) makes consent presumed
involuntary; (d) limits scope or duration; (e) bars the officer from even ASKING absent reasonable
suspicion.
Known shapes to match against: NH RSA 595-A:10 (four-part advisement + cease questioning + recorded
consent + inadmissibility); RI 31-21.2-5(b) and CT 54-33o (may not even ASK); CO 16-3-310
(advisement, but breach is only a factor); VA (exclusion that expressly survives consent)."""

PX = """PRETEXTUAL-STOP LIMITS. Which minor violations may NOT be the sole reason for a stop? Find any
statute that (a) makes an equipment or minor violation SECONDARY-ONLY -- no stop solely for it (tail
light, object hung from mirror, expired tags, tint, exhaust, plate frame, no front plate); (b) bars the
ODOUR OF CANNABIS alone as grounds for a stop or search; (c) bars race-based stops; (d) gives an
EXCLUSIONARY remedy.
Models: the 8 Virginia sections (No law-enforcement officer shall stop, plus evidence inadmissible
INCLUDING evidence obtained with the operator consent, plus a 4th-month grace for expired stickers);
CT 54-33p (odour, under-5oz, under-500-dollar cash barred in part or in whole, exclusion); MT 44-2-117."""

sc = [
 ("pp1", PP, "AL AK AZ AR CA CO CT DE FL GA",
  "Known: CT 54-33o/p; CO 16-3-310; CA Gov 12525.5; AR 12-12-1403; AZ 13-3925. DE: the ch.23 Subch.III 2331-2332 profiling subchapter is ABSENT from the current index -- find where it went."),
 ("pp2", PP, "HI ID IL IN IA KS KY LA ME MD",
  "legis.iowa.gov and apps.legislature.ky.gov serve real PDFs. capitol.hawaii.gov 403s. ksrevisor.gov refuses -- use kslegislature.gov. mgaleg.maryland.gov is a JS shell. TRAPS: HI ch.803 has NO informed-consent provision; IA 80.40 is Bureau of cyber-crime; IA ch.80H is Blue Alert; IN Byron Ratcliffe Act uncodified. Known: IL 625 ILCS 5/11-212 -- read 11-210..11-215 around it; KS 22-4609/-4610; KY 15A.195; LA 32:398.10; ME 25-2803-B; MD 25-113 -- read ALL of Public Safety Title 3 Subtitle 1."),
 ("pp3", PP, "MA MI MN MS MO OK OR PA SC SD",
  "revisor.mn.gov summariser DROPS subdivisions -- open pages. revisor.mo.gov/main/OneChapter.aspx?chapter=NNN. scstatehouse.gov .php TRUNCATES. sdlegislature.gov/api/Statutes/CHAPTER.html = full index. PA: legis.state.pa.us/WU01/LI/LI/CT/HTM/. ok.elaws.us may be 2014 -- flag currency. PRIORITIES: MA St.2020 c.253 POST Commission codified home; MN 169.905 + 169.90-169.91 + ch.626; OR ORS 810.410 read in BODY and report what it forbids, plus ORS 131.915; PA Title 71/53."),
 ("pp4", PP, "TN TX UT VT VA WA WV WI WY DC",
  "statutes.capitol.texas.gov is a JS shell -- use Justia via browser. le.utah.gov PDFs work. code.wvlegislature.gov 403s BOTH fetch and browser -- for WV try Justia-via-browser, codes.findlaw.com, archive.org Wayback; REPORT WHICH HOST WORKED as your first line. PRIORITIES: TX CCP arts 2.131-2.139 -- read every article and CONFIRM OR REFUTE the widely-repeated claim that Texas requires recorded consent; VA 19.2-59 + Community Policing Act 52-30.1; WA RCW ch.10.120 full list; DC NEAR Act and CPJRA codified home."),
 ("co1", CO, "OK OR PA SC SD TN TX UT",
  "scstatehouse.gov TRUNCATES. sdlegislature.gov/api/Statutes/CHAPTER.html. PA legis.state.pa.us/WU01/. statutes.capitol.texas.gov is a JS shell. le.utah.gov PDFs work. PRIORITIES: OR ORS 810.410 read in BODY; TX CCP 2.131-2.139 -- confirm or REFUTE the recorded-consent claim from body text."),
 ("co2", CO, "VT VA WA WV WI WY DC",
  "code.wvlegislature.gov 403s BOTH -- for WV try Justia-via-browser, codes.findlaw.com, archive.org; report which worked. The 8 Virginia pretext sections are already recorded -- for VA check ONLY 19.2-59 and 52-30.1 for a general consent rule. PRIORITIES: WA RCW ch.10.79 / 10.93 / 10.120; DC NEAR Act and CPJRA sections."),
 ("px1", PX, "AL AK AZ AR CA CO DE FL GA HI ID IL IN IA",
  "legis.iowa.gov serves real PDFs; capitol.hawaii.gov 403s. PRIORITY: IL 625 ILCS 5 ch.11 and ch.12 equipment secondary-offence language, plus 11-502.1 cannabis-in-vehicle."),
 ("px2", PX, "KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ",
  "ksrevisor.gov refuses -- kslegislature.gov. apps.legislature.ky.gov PDFs. mgaleg.maryland.gov JS shell. revisor.mn.gov DROPS subdivisions. revisor.mo.gov/main/OneChapter.aspx?chapter=NNN. mca.legmt.gov. PRIORITIES, all legalised cannabis: MD 2023 odour provision; MN 2023 ch.169 + ch.152; MO 2022 ch.307 + Art.XIV statutes; NJ 2021 odour provision -- find the N.J.S.A. cite, it would be the FIRST codified NJ stop protection in this project."),
 ("px3", PX, "NM NY NC ND OH OK OR PA RI SC SD",
  "Justia ND chapter pages are PDF-only with NO section list -- a ND negative from Justia is meaningless; use ndlegis.gov/cencode/tNNcNN.html. scstatehouse.gov TRUNCATES. sdlegislature.gov/api/Statutes/CHAPTER.html. PRIORITIES: NY 2021 MRTA odour provision (Penal Law or VTL cite); OR ORS 810.410 in BODY; NM 2021 cannabis law plus Motor Vehicle Code equipment article."),
 ("px4", PX, "TN TX UT VT VA WA WV WI WY DC",
  "statutes.capitol.texas.gov JS shell. le.utah.gov PDFs. code.wvlegislature.gov 403s both -- try Justia-via-browser, findlaw, archive.org, say which worked. VIRGINIA SCOPE: its 8 sections are already recorded -- for VA check ONLY whether 46.2-1049 exhaust, 46.2-1030 headlights, 46.2-1300 area plate frames, and 46.2-711/-716 plate display ALSO carry the No-law-enforcement-officer-shall-stop formula; report each yes/no. PRIORITIES: WA RCW 46.37 + ch.10.120; VT 23 V.S.A. ch.13."),
]
for name, task, states, hosts in sc:
    out = 'research/inbox/%s.txt' % name
    open('%s/%s.md' % (B, name), 'w', encoding='utf-8').write(
        SC.replace('{TASK}', task).replace('{STATES}', states)
          .replace('{HOSTS}', hosts).replace('{OUT}', out))

print('wrote %d briefs to %s' % (len(os.listdir(B)), B))
