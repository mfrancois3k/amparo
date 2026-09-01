# -*- coding: utf-8 -*-
import re, subprocess, sys

P = 'research/state-matrix.md'

# 1) add 19th column "Duty to intervene" to header + separator + every row (skip once)
s = open(P, encoding='utf-8').read()
hdr_line = re.search(r'^\| State \|.*\|$', s, re.M).group(0)
if 'Duty to intervene' not in hdr_line:
    new_hdr = hdr_line[:-1].rstrip() + ' Duty to intervene |'
    s = s.replace(hdr_line, new_hdr, 1)
    sep_line = re.search(r'^\|---(\|---)*\|$', s, re.M).group(0)
    s = s.replace(sep_line, sep_line + '---|', 1)
    # every data row: "| **XX** Name | c1 | ... | c18 |" -> append " c19 |"
    def add_col(m):
        line = m.group(0)
        if line.count('|') == 20:  # 19 cols + leading = 20 pipes for a filled row... just append dash
            return line[:-1].rstrip() + ' — |'
        return line
    s = re.sub(r'^\| \*\*[A-Z]{2}\*\*.*\|$', add_col, s, flags=re.M)
    open(P, 'w', encoding='utf-8').write(s)
    print('added Duty to intervene column')
else:
    print('Duty to intervene column already present')

def sc(st, col, sec, desc, remedy, verified=False, note=''):
    tag = 'VERIFIED' if verified else 'UNVERIFIED'
    c = '%s %s -- %s [%s]' % (tag, sec, desc, remedy)
    if note:
        c += ' NOTE: ' + note
    c = c.replace('|', '/')
    subprocess.run([sys.executable, 'research/tools/set_cell.py', st, col, c], check=True)

# ---- JOB 1 REDO: pretext / secondary-offense -- real finds, was wrongly blanket-nulled before ----
PX = 'Pretext / secondary-offense'
# already personally verified by main process in earlier passes -- mark VERIFIED
sc('RI', PX, 'RI Gen. Laws 31-21.2-5(a)', 'no detention beyond traffic violation without RS/PC; canine wait only on RS/PC', 'exclusion', verified=True)
sc('VA', PX, 'Va. Code 4.1-1302', 'no stop/search/seizure/warrant solely on odor of marijuana', 'exclusion (survives consent)', verified=True)
sc('MT', PX, 'MCA 44-2-117', 'agency policy must bar using vehicle-law violations as pretext for other investigation', 'none stated', verified=True)
# new to me via Base44 -- UNVERIFIED
sc('NM', PX, 'NMSA 26-2C-25(C)', 'cannabis odor/possession/containers alone not RAS or basis to stop/detain/search; DUI excepted', 'none stated (bars stop/search directly)')
sc('NJ', PX, 'N.J.S.A. 2C:33-15(2)(b)', 'cannabis odor not RAS/PC for stop or search -- NARROW, underage possession only', 'none stated')
sc('NY', PX, 'VTL 375(1)(a)(i) + Penal Law 222.05(2)-(4)', 'windshield-sticker stop narrow secondary; broader: cannabis odor/possession/cash alone not basis for approach/search/seizure/arrest/detention', 'none stated (bars RAS/PC finding)')
sc('OH', PX, 'ORC 4511.204(G) + 3780.33(D)-(E)', 'texting-while-driving secondary offense only; lawful cannabis conduct not sole basis for FST/suspension/any action', 'exclusion (4511.204); none stated (3780.33)')
sc('MD', PX, 'Md. Crim. Proc. 1-211', 'cannabis odor/possession/cash near cannabis alone not basis for stop or search of person/vehicle/vessel', 'exclusion (explicit, survives consent)')
sc('AZ', PX, 'A.R.S. 36-2852(C)', 'odor of marijuana alone not RAS of a crime; DUI investigation excepted', 'none stated (judicial exclusion)')

# ---- JOB 3 correction: better/on-point citations replace weaker batch-1 guesses ----
RFS = 'Reason-for-stop duty'
sc('MN', RFS, 'Minn. Stat. 169.905', 'officer must inform operator of the reason for the stop unless unreasonable', 'none (explicit -- failure is not grounds for exclusion or dismissal)')
sc('CA', RFS, 'Veh. Code 2806.5 (AB 2773)', 'officer must state reason for stop before questioning, absent imminent threat', 'none stated')
sc('MD', RFS, 'Md. Crim. Proc. 2-109(a)(2)(iv)', 'officer must state name, ID number, agency, and reason for stop at commencement', 'exclusion barred (b)(2) -- may NOT be basis to exclude evidence')
sc('RI', RFS, 'RI Gen. Laws 31-21.2-5(h)', 'officer shall advise motorist stopped of the reason for the stop', 'exclusion (per (f), same section)')
sc('CT', RFS, 'Conn. P.A. 23-95 (SB 1022)', 'officer shall verbally inform operator of purpose for stop prior to completion of stop', 'none stated', note='codified CGS cite not yet confirmed')

# ---- JOB 4 corrections ----
TVA = 'Ticket vs arrest'
sc('KY', TVA, 'KRS 431.015', 'officer shall issue citation instead of arrest for a misdemeanor committed in presence', 'none stated', note='corrects earlier wrong cite 431.018')
sc('MT', TVA, 'MCA 46-6-310', 'officer may issue notice to appear instead of arrest whenever warrantless arrest is authorized', 'none stated', note='corrects earlier null')
sc('OK', TVA, '22 O.S. 209', 'officer shall prepare written citation to appear for misdemeanors instead of custodial arrest', 'none stated', note='corrects earlier null')
sc('WA', TVA, 'RCW 46.63.020', 'listed violations are noncriminal traffic infractions -- cite and release, not custodial arrest', 'none stated', note='corrects earlier wrong cite RCW 46.64.035 (bail statute)')
sc('NH', TVA, 'null', 'citation-in-lieu-of-arrest lives in NH Rules of Criminal Procedure, not a specific RSA section', 'n.a.', note='corrects earlier guess RSA 603:1')

# ---- JOB 5 correction ----
FA = 'Footage access'
sc('AZ', FA, 'A.R.S. 38-1172 (SB1640)', 'local law enforcement agencies required to provide body-worn cameras; access rules enacted', 'none stated', note='corrects earlier null')

# ---- JOB 7: consent to search -- new cannabis-based finds, corroborates 2 already-verified ----
CS = 'Consent to search'
sc('MD', CS, 'Md. Crim. Proc. 1-211(C)', 'evidence from a cannabis-odor-based search, INCLUDING evidence obtained WITH CONSENT, is inadmissible', 'exclusion (explicit, survives consent)')
sc('MN', CS, 'Minn. Stat. 626.223', 'odor of cannabis alone shall not be the sole basis to search a vehicle, driver, passengers, or contents', 'none stated (judicial exclusion)')
sc('NY', CS, 'Penal Law 222.05(2)-(4)', 'lawful cannabis conduct / odor alone shall not be basis for approach, search, seizure, arrest, or detention', 'none stated (bars RAS/PC finding)')
sc('OR', CS, 'ORS 810.410(3)(e)', 'officer must inform person of right to refuse before requesting consent to search; consent must be recorded', 'none stated')
# RI and VA consent already recorded from primary-source reads in earlier passes -- Base44 corroborated, not overwritten

# ---- JOB 8: NEW column, duty to intervene ----
DI = 'Duty to intervene'
sc('CO', DI, 'C.R.S. 18-8-802(1.5)', 'on-duty officer shall intervene to stop another officer\'s excessive force', 'criminal -- class 1 misdemeanor for failure')
sc('WA', DI, 'RCW 10.93.190', 'on-duty officer who witnesses excessive force shall intervene when able', 'none stated (certification referral)')
sc('MN', DI, 'Minn. Stat. 626.8475', 'officer must intercede on observing unreasonable force, regardless of rank; report within 24h', 'none stated (board discipline)')
sc('VA', DI, 'Va. Code 19.2-83.6', 'officer shall intervene to end excessive force when feasible and render aid', 'none stated')
sc('NC', DI, 'G.S. 15A-401(d1)', 'officer shall attempt to intervene to prevent excessive force if safe to do so', 'none stated (report within 72h)')
sc('IL', DI, '50 ILCS 705/6.3 + 720 ILCS 5/7-16(a)', 'affirmative duty to intervene to stop unauthorized force; failure grounds for decertification', 'none stated (decertification)')
sc('CT', DI, 'Conn. Gen. Stat. 7-282e(a)(1)', 'officer shall intervene and attempt to stop unreasonable/excessive/illegal force', 'criminal -- may be prosecuted same as officer who used the force')
sc('TN', DI, 'Tenn. Code 38-8-129', 'officer shall intervene to prevent excessive force when there is opportunity and means', 'none stated')
sc('WI', DI, 'Wis. Stat. 175.44(4)', 'officer shall intervene without regard to chain of command to stop noncompliant force', 'criminal -- fine to $1,000 and/or 6 months')
sc('OR', DI, 'ORS 181A.681(2)', 'officer shall intervene without regard to rank to stop known misconduct by another officer', 'none stated (decertification)')
sc('FL', DI, 'Fla. Stat. 943.1735(2)(d)', 'agencies must adopt policy requiring on-duty officer to intervene in excessive force', 'none stated (policy mandate)')
sc('NV', DI, 'NRS 193.308', 'officer shall intervene without regard to chain of command to stop unjustified force', 'none stated')
sc('MD', DI, 'Md. Pub. Safety 3-524(e)(2)', 'officer shall intervene to prevent or terminate force beyond what is authorized', 'criminal -- misdemeanor up to 10 yrs if intentional violation causes serious injury/death')
sc('KY', DI, 'KRS 15.391(1)(f)(1)', 'failure to intervene when safe and practical is professional nonfeasance', 'none stated (decertification)')
sc('CA', DI, 'Gov. Code 7286(b)(9)', 'agencies must adopt policy requiring officer to intercede when force exceeds necessary', 'none stated (policy mandate)')
sc('NE', DI, 'Neb. Rev. Stat. 81-1414.17', 'agencies shall adopt policy requiring officer to intervene against excessive force', 'none stated (policy mandate)')
sc('SC', DI, 'S.C. Code 23-23-85(A)(3)', 'council shall set minimum standards including duty to intervene in other officers\' actions', 'none stated (standards mandate)')
sc('MA', DI, 'Mass. Gen. Laws c.6E 15(a)', 'officer present and observing unreasonable force shall intervene unless intervening risks imminent harm', 'none stated')
sc('VT', DI, '20 V.S.A. 2368(b)(7)', 'officer has duty to intervene on observing another officer use a CHOKEHOLD -- narrow', 'none stated')
sc('UT', DI, 'Utah Code 53-6-210.5', 'officer shall intervene to prevent misconduct including excessive force, if safe to do so', 'none stated (discipline for failure to report)')
sc('NM', DI, 'NMSA 29-7D-5', 'officer shall intervene to prevent excessive force unless intervening risks imminent harm', 'discipline/decertification/termination')
sc('DC', DI, 'D.C. Code 5-125.03(a)(2)', 'narrow -- officer must render aid after witnessing a PROHIBITED TECHNIQUE (neck restraint) by another officer', 'criminal (unlawful) -- narrow, aid-after not intervene-during')
sc('NH', DI, 'null', 'NH RSA 106-L:20 imposes a duty to REPORT only, not a duty to intervene', 'n.a.')

print('done')
