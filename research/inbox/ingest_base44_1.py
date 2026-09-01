# -*- coding: utf-8 -*-
import subprocess, sys

# States the archive ledger already has a real, verified/likely answer for.
# Base44's output for these columns/states is DISCARDED even if non-null,
# because a primary-source read outranks a locator pass every time.
ALREADY_KNOWN = {
    'Police-practices chapter': {
        'RI','CT','CO','CA','AR','AZ','NM','NE','NV','NH','MD','NC','KS','KY','LA',
        'ME','MA','MO','MN','MT','IL',
    },
    'Reason-for-stop duty': {'MT','MN','RI'},
    'Ticket vs arrest': set(),
    'Footage access': {'RI','NH','NJ','NV'},
}

# raw Base44 lines, columns 3-6 only (1 and 2 rejected wholesale -- see base44-dump-1.txt)
ROWS = {
'Reason-for-stop duty': """
CA | VEH s.40600 | officer shall record probable cause / reason for stop on citation | remedy: none stated |
CO | s.42-4-1709(5) | officer shall tender summons/complaint stating violation | remedy: none stated | NOTE: verify subsection
CT | s.14-140 | release on citation for traffic violations; exceptions DUI | remedy: none stated | NOTE: verify section
DE | 21 Del.C. s.703 | release on citation for traffic; signing not admission | remedy: none stated | NOTE: verify section
FL | s.316.650 | traffic violations; noncriminal infraction; sign=promise to appear | remedy: none stated |
GA | s.40-13-2.1 | must sign; signing not admission; refusal leads to bond/arrest | remedy: none stated |
IA | s.805.1 | citation in lieu of arrest; shall issue for scheduled violations | remedy: none stated |
KS | s.8-2104 | arrest at officer discretion; traffic citation in certain cases | remedy: none stated |
LA | RS 32:391 | appearance upon arrest; release on summons | remedy: none stated |
MD | TR s.26-201 | acknowledgment of citation not admission of guilt | remedy: none stated |
ME | 29-A s.105 | issue citation for civil/criminal violation; arrest for criminal | remedy: none stated |
MI | MCL 257.742 | civil infraction; stop and issue citation, no custodial arrest | remedy: none stated |
IN | s.9-30-2-2 | may not arrest for civil traffic violation; release on citation | remedy: none stated |
KY | KRS 431.018 | citation in lieu of arrest for misdemeanors/traffic | remedy: none stated | NOTE: verify section
MA | MGL c.90C s.2 | citations; arrest without warrant for motor vehicle offenses | remedy: none stated |
MS | s.63-10-3 | highway patrol may issue citation in lieu of arrest | remedy: none stated |
MO | s.544.157 | citation in lieu of arrest; traffic violation uses uniform ticket | remedy: none stated |
NE | s.60-687 | arrest/apprehension; traffic infraction procedures | remedy: none stated |
NV | NRS 484A.774 | presumption for release of person arrested for traffic | remedy: none stated |
NJ | s.39:5-3 | appearance/arrest process; judge may issue process within 30 days | remedy: none stated |
NM | s.66-8-123 | arresting officer issues uniform traffic citation | remedy: none stated |
NY | VTL s.155 | traffic infraction is not a crime; cite and release | remedy: none stated |
NC | s.15A-302 | officer may issue citation for misdemeanor or infraction | remedy: none stated |
ND | ch.39-06.1 | disposition of traffic offenses; cite and post bond | remedy: none stated |
OH | s.2935.26 | minor misdemeanor citation; issue and release | remedy: none stated |
OR | s.810.410 | officer may arrest or issue citation for traffic crime | remedy: none stated |
PA | 75 PaCS s.6308 | investigation by police; stop on signal; citation procedure | remedy: none stated |
RI | s.31-41.1-1 | adjudication of traffic offenses; form of summons | remedy: none stated |
SC | s.56-7-10 | uniform traffic ticket; may be used in arrest for misdemeanor | remedy: none stated |
SD | s.23A-2-1 | complaint/summons; traffic ticket by law enforcement officer | remedy: none stated |
TN | s.55-10-207 | traffic citation in lieu of arrest | remedy: none stated |
TX | Transp. s.543.003 | notice to appear; release on citation for misdemeanor | remedy: none stated |
UT | s.77-7-18 | citation on misdemeanor/infraction; release to appear | remedy: none stated |
VT | 23 V.S.A. s.2302 | traffic violation is not a crime; treated as civil action | remedy: none stated |
VA | s.46.2-936 | arrest for misdemeanor; release on summons; right to hearing | remedy: none stated |
WA | RCW 46.64.035 | nonresident may post bail; citation for traffic offense | remedy: none stated | NOTE: verify RCW 46.63 instead
WV | s.17C-19-6 | form and records of traffic citations | remedy: none stated |
WI | s.345.26 | authority to arrest without warrant for traffic regulation | remedy: none stated |
WY | s.31-5-1205 | traffic citations; release on written promise to appear | remedy: none stated |
IL | 625 ILCS 5/11-205 | uncertain -- emergency vehicles section, not confirmed on point | remedy: none stated | NOTE: verify
""",
'Ticket vs arrest': """
AL | s.32-1-4 | traffic misdemeanors; presumption of citation; refusal to bond leads to arrest | remedy: none stated |
AK | AS 12.25.180 | citation in lieu of arrest; misdemeanors/infractions; may arrest | remedy: none stated |
AZ | ARS 13-3903 | release on notice to appear for misdemeanors; not domestic violence | remedy: none stated |
AR | s.27-50-603 | release on written promise to appear; exceptions DUI/injury accident | remedy: none stated |
CA | VEH s.40302 | no ID/refusal to sign/DUI leads to arrest; signing not admission | remedy: none stated | NOTE: verify on official CA code
CO | s.42-4-1709 | traffic infraction; refusal to sign not arrestable | remedy: none stated | NOTE: verify subsection
CT | s.14-140 | release on citation for traffic violations; exceptions DUI | remedy: none stated | NOTE: verify section
DE | 21 Del.C. s.703 | release on citation for traffic; signing not admission | remedy: none stated | NOTE: verify section
FL | s.316.650 | traffic violations; noncriminal infraction; sign=promise to appear | remedy: none stated |
GA | s.40-13-2.1 | must sign; signing not admission; refusal leads to bond/arrest | remedy: none stated |
HI | HRS 286-10 | officer may arrest or issue citation for traffic | remedy: none stated |
ID | s.49-1409 | issue traffic citation in lieu of arrest for misdemeanor traffic | remedy: none stated |
IL | 725 ILCS 5/107-6 | officer may release arrested person without requiring court appearance | remedy: none stated |
IN | s.9-30-2-2 | may not arrest for civil traffic violation; release on citation | remedy: none stated |
IA | s.805.1 | citation in lieu of arrest; shall issue for scheduled violations | remedy: none stated |
KS | s.8-2104 | arrest at officer discretion; traffic citation in certain cases | remedy: none stated |
KY | KRS 431.018 | citation in lieu of arrest for misdemeanors/traffic | remedy: none stated | NOTE: verify section
LA | RS 32:391 | appearance upon arrest; release on summons | remedy: none stated |
ME | 29-A s.105 | issue citation for civil/criminal violation; arrest for criminal | remedy: none stated |
MD | TR s.26-201 | acknowledgment of citation not admission of guilt | remedy: none stated |
MA | MGL c.90C s.2 | citations; arrest without warrant for motor vehicle offenses | remedy: none stated |
MI | MCL 257.742 | civil infraction; stop and issue citation, no custodial arrest | remedy: none stated |
MN | s.169.91 | petty misdemeanor traffic -- cite and release | remedy: none stated |
MS | s.63-10-3 | highway patrol may issue citation in lieu of arrest | remedy: none stated |
MO | s.544.157 | citation in lieu of arrest; traffic violation uses uniform ticket | remedy: none stated |
NE | s.60-687 | arrest/apprehension; traffic infraction procedures | remedy: none stated |
NV | NRS 484A.774 | presumption for release of person arrested for traffic | remedy: none stated |
NJ | s.39:5-3 | appearance/arrest process; judge may issue process within 30 days | remedy: none stated |
NM | s.66-8-123 | arresting officer issues uniform traffic citation | remedy: none stated |
NY | VTL s.155 | traffic infraction is not a crime; cite and release | remedy: none stated |
NC | s.15A-302 | officer may issue citation for misdemeanor or infraction | remedy: none stated |
ND | ch.39-06.1 | disposition of traffic offenses; cite and post bond | remedy: none stated |
OH | s.2935.26 | minor misdemeanor citation; issue and release | remedy: none stated |
OR | s.810.410 | officer may arrest or issue citation for traffic crime | remedy: none stated |
PA | 75 PaCS s.6308 | investigation by police; stop on signal; citation procedure | remedy: none stated |
RI | s.31-41.1-1 | adjudication of traffic offenses; form of summons | remedy: none stated |
SC | s.56-7-10 | uniform traffic ticket; may be used in arrest for misdemeanor | remedy: none stated |
SD | s.23A-2-1 | complaint/summons; traffic ticket by law enforcement officer | remedy: none stated |
TN | s.55-10-207 | traffic citation in lieu of arrest | remedy: none stated |
TX | Transp. s.543.003 | notice to appear; release on citation for misdemeanor | remedy: none stated |
UT | s.77-7-18 | citation on misdemeanor/infraction; release to appear | remedy: none stated |
VT | 23 V.S.A. s.2302 | traffic violation is not a crime; treated as civil action | remedy: none stated |
VA | s.46.2-936 | arrest for misdemeanor; release on summons; right to hearing | remedy: none stated |
WA | RCW 46.64.035 | nonresident may post bail; citation for traffic offense | remedy: none stated | NOTE: verify RCW 46.63 instead
WV | s.17C-19-6 | form and records of traffic citations | remedy: none stated |
WI | s.345.26 | authority to arrest without warrant for traffic regulation | remedy: none stated |
WY | s.31-5-1205 | traffic citations; release on written promise to appear | remedy: none stated |
""",
'Footage access': """
CA | PEN s.832.18 | BWC retention min 2 years; records subject to PRA release | remedy: none stated | retention: 730 days
CO | s.24-31-902 | must release unedited BWC footage; retention schedule required | remedy: none stated |
CT | s.29-6d | BWC use; public disclosure of recordings on request | remedy: none stated |
FL | s.119.071(2)(l) | BWC exempt; retain 90 days; subject may authorize release | remedy: none stated | retention: 90 days
GA | s.50-18-96 | retain body/dash cam video 180 days | remedy: none stated | retention: 180 days
IL | 50 ILCS 706/10-20 | BWC Act; retain 90 days; must record traffic stops | remedy: none stated | retention: 90 days
IN | s.5-14-3-5.3 | LE recordings retained 2 yrs on request; access rules | remedy: none stated | retention: 730 days
KS | s.45-254 | BWC/vehicle cam = criminal investigation record, exempt | remedy: none stated |
KY | KRS 61.168 | BWC disclosure governed; retention per KRS 171 | remedy: none stated |
MD | GP s.3-511 | BWC auto-record 60 sec; retention requirements | remedy: none stated |
MI | MCL 780.316 | BWC retention 3 yrs for complaints; Body-Worn Camera Privacy Act | remedy: none stated | retention: 1095 days
MN | s.13.825 | BWC data classification; subject access; court-authorized disclosure | remedy: none stated |
NC | G.S. 132-1.4A | BWC recordings not public records; no public right of access | remedy: none stated | negative for driver access
ND | s.44-04-18.7 | BWC images in private place exempt | remedy: none stated |
OH | RC 149.43 | BWC restricted portions exempt; release by subject consent | remedy: none stated |
OK | 51 O.S. s.24A.8 | LE records; BWC withheld pending investigation then public | remedy: none stated |
OR | ORS 192.345 | public records; BWC conditionally exempt | remedy: none stated |
PA | 42 PaCS ch.67A | request police audio/video within 60 days; agency may deny | remedy: none stated |
SD | SDCL 1-27-1.5 | LE records; BWC/dashcam withheld from public | remedy: none stated |
UT | s.77-7a-107 | BWC records released per GRAMA; retention per archives | remedy: none stated |
VT | 1 V.S.A. s.317 | public records; BWC released unless exempt | remedy: none stated |
WA | RCW 42.56.240(14) | BWC exempt to extent privacy essential; access per PRA | remedy: none stated |
WV | s.29B-1-3 | FOIA right to inspect public records incl BWC | remedy: none stated |
WI | s.165.87(3)(c) | BWC data retained 120 days; subject to public records | remedy: none stated | retention: 120 days
AZ | SB1640 area | BWC access rules enacted -- codified ARS section unconfirmed | remedy: none stated | NOTE: verify codified cite
""",
'Police-practices chapter': """
DE | 11 Del.C. s.1902 | stop and frisk; reasonable suspicion (not a profiling ban) | remedy: none stated |
GA | null | HB 87 token provision only, no general racial-profiling ban statute | n.a. |
HI | null | no specific racial-profiling ban statute located | n.a. |
ID | null | no specific police profiling ban statute located | n.a. |
IN | null | no specific racial-profiling ban statute located | n.a. |
MI | null | no specific racial-profiling ban statute located | n.a. |
MS | null | HB1203 (2022) enactment status unverified | n.a. | NOTE: verify enactment
NY | null | no state statute, only NYC Admin Code 14-151 (municipal) | n.a. |
ND | null | no specific police profiling ban statute located | n.a. |
OH | null | no specific racial-profiling ban statute, AG policy governs | n.a. |
OK | 22 O.S. s.34.3 | racial profiling prohibited; agency policy required | remedy: none stated |
OR | ORS 181A.410 | training to reduce bias profiling; minimum standards | remedy: none stated |
PA | null | no specific racial-profiling ban statute located | n.a. |
SC | null | no specific racial-profiling ban statute located | n.a. |
SD | null | no specific racial-profiling ban statute located | n.a. |
TN | s.38-1-503 | agency must adopt written policy prohibiting racial profiling | remedy: none stated |
TX | CCP Art.2.132 | racial profiling prohibited; agency policy and complaint process | remedy: none stated | NOTE: verify on official Tex CCP
UT | null | HB101 (2002) profiling-policy requirement -- codified cite unconfirmed | n.a. | NOTE: verify near 53-1-2
VT | 3 V.S.A. s.168 | Racial Disparities Advisory Panel; fair and impartial policing | remedy: none stated |
VA | s.52-30.2 | State Police may not engage in bias-based profiling; data collection | remedy: none stated |
WA | RCW 43.101.410 | agencies comply with racial profiling recommendations; training | remedy: none stated |
WV | s.30-29-10 | racial profiling contrary to public policy; prohibited tactic | remedy: none stated |
WI | s.165.85 | training to prevent racial profiling/race-based selection | remedy: none stated |
WY | null | no specific racial-profiling ban statute located | n.a. |
AL | null | SB84 (2018) not enacted, no general racial-profiling ban statute | n.a. |
AK | null | no specific police-practices/profiling ban statute located | n.a. |
""",
}

def cell(sec, desc, remedy, note=''):
    sec = sec.strip()
    if sec.lower() == 'null':
        base = 'null (base44; %s)' % (note or desc or 'no index given')
    else:
        base = 'UNVERIFIED %s -- %s [%s]' % (sec, desc.strip(), remedy.strip())
        if note:
            base += ' NOTE: ' + note
    return base.replace('|', '/')

total = 0
for col, block in ROWS.items():
    skip = ALREADY_KNOWN.get(col, set())
    for line in block.strip().splitlines():
        parts = [p.strip() for p in line.split('|')]
        if len(parts) < 3:
            continue
        st = parts[0]
        if st in skip:
            continue
        sec = parts[1]
        desc = parts[2] if len(parts) > 2 else ''
        remedy = parts[3] if len(parts) > 3 else ''
        note = parts[4] if len(parts) > 4 else ''
        c = cell(sec, desc, remedy, note)
        subprocess.run([sys.executable, 'research/tools/set_cell.py', st, col, c], check=True)
        total += 1

print('ingested %d cells (columns 1 and 2 rejected wholesale; %d skipped as already-known)' % (
    total, sum(len(v) for v in ALREADY_KNOWN.values())))
