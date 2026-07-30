# State traffic-stop law matrix — research ledger

**STATUS: RESEARCH ONLY. NOTHING HERE IS SHIPPED TO USERS.**

This file is the staging ground for expanding Amparo beyond TX / GA / NY. No row
enters `STATES` in `index.html` until it is (a) VERIFIED against primary statute
text, and (b) reviewed by an attorney licensed in that state — the same standard
the three live states already meet.

Confidence levels used below:

| Level | Meaning |
|---|---|
| **VERIFIED** | Quoted text pulled from an official legislature site or Justia/FindLaw primary text |
| **LIKELY** | Correct section number from multiple independent secondary sources, raw statute text not fetched |
| **UNVERIFIED** | Not established. **Must not be published in any form.** |

---

## Why this file exists: the common-knowledge list is wrong in places

Careful sourcing contradicted the widely-copied Wikipedia "stop and identify
states" list on **four of the ten states researched**. This is the single best
argument against generating state content from model knowledge:

1. **Missouri** — Mo. Rev. Stat. §84.710(2) is routinely cited as Missouri's
   stop-and-identify law. It is **not statewide**: Chapter 84 governs *police
   departments in St. Louis and Kansas City only*. A driver stopped by a county
   sheriff or state trooper outside those municipal jurisdictions has no
   statutory duty under this section. Confirmed against revisor.mo.gov.
2. **New Hampshire** — RSA 594:2 is the opposite of a stop-and-identify statute.
   It expressly bars arrest for refusal: an officer "may request the person's
   name and address, but ... shall **not** arrest the person based solely on the
   person's refusal to provide such information." Separately, RSA 644:6 is
   *Loitering or Prowling*, not false reports (that is RSA 641:4) — the citation
   commonly attached to NH appears to be wrong.
3. **Massachusetts** — nominally all-party consent (M.G.L. ch. 272 §99), but
   *Glik v. Cunniffe*, 655 F.3d 78 (1st Cir. 2011) and *Project Veritas Action
   Fund v. Rollins*, 982 F.3d 813 (1st Cir. 2020) hold it cannot be applied to
   recording police performing public duties. Telling a Massachusetts driver
   they may not record their own stop would be **wrong and harmful**.
4. **Nevada** — one-party consent in person (NRS 200.650); all-party for phone
   calls (NRS 200.620 as read in *Lane v. Allstate*, 114 Nev. 1176 (1998)).
   Amparo's use case is in-person, so the operative rule for drivers is
   **one-party**. A flat "Nevada = all-party" label overstates the restriction
   on the exact scenario this app exists for.

---

## Matrix

Columns: stop-and-identify · licence display · recording consent · refusing to
sign a citation.

### Nebraska
- **Stop-and-identify: Y** — Neb. Rev. Stat. §29-829. Officer "may demand of him
  his name, address and an explanation of his actions" (broader than name-only). **VERIFIED**
- **Licence display** — Neb. Rev. Stat. §60-489. Carried at all times, presented on demand. **VERIFIED**
- **Recording: ONE-PARTY** — Neb. Rev. Stat. §86-290. **VERIFIED**
- **Sign citation** — Neb. Rev. Stat. §60-684: refusal "shall be guilty of a misdemeanor". **VERIFIED**

### Nevada
- **Stop-and-identify: Y** — NRS 171.123(3), the *Hiibel* statute. Name only;
  "may not be compelled to answer any other inquiry". Detention capped at 60 min. **VERIFIED**
- **Licence display** — NRS 483.350. **VERIFIED**
- **Recording: ONE-PARTY in person** (NRS 200.650) / all-party for calls (NRS
  200.620, *Lane v. Allstate*). See correction #4 above. **VERIFIED**
- **Sign citation** — NRS 484A.630. Expect custodial delivery to a magistrate
  rather than a clean "arrest". **LIKELY — re-verify full text before shipping.**

### Mississippi
- **Stop-and-identify: N** — no statewide statute. **VERIFIED**
- **Licence display** — Miss. Code Ann. §63-1-41. Note **HB 308 (2026)** pending,
  would add surrender-for-inspection plus digital licence option. **VERIFIED**
- **Recording: ONE-PARTY** — Miss. Code Ann. §41-29-531(e). **LIKELY**
- **Sign citation** — **UNVERIFIED**

### Missouri
- **Stop-and-identify: N statewide** — see correction #1. Y only under KC/StL
  municipal police, §84.710(2). **VERIFIED**
- **Licence display** — RSMo §302.181. **LIKELY**
- **Recording: ONE-PARTY** — RSMo §542.402. **LIKELY**
- **Sign citation** — lead only, possibly RSMo §544.046. **UNVERIFIED — do not cite.**

### Montana
- **Stop-and-identify: Y, but soft** — Mont. Code Ann. §46-5-401(2)(a): officer
  "may **request**" name/address. No penalty stated in that section. Do not
  present as a hard duty without pairing it with a separate obstruction statute. **VERIFIED**
- **Licence display** — Mont. Code Ann. §61-5-116. Digital licence accepted since 1 Sep 2025. **VERIFIED**
- **Recording: ALL-PARTY** — Mont. Code Ann. §45-8-213. Exceptions include public
  officials performing official duties. **VERIFIED**
- **Sign citation** — lead only, possibly §46-6-310. **UNVERIFIED**

### Massachusetts
- **Stop-and-identify: N** — no statute. **VERIFIED**
- **Licence display** — M.G.L. ch. 90 §25. **VERIFIED**
- **Recording: ALL-PARTY on paper** (ch. 272 §99) **but recording police in
  public is constitutionally protected** — see correction #3. **VERIFIED**
- **Sign citation** — ch. 90 §25 also criminalises refusal "to sign his name in
  the presence of such officer", $100 fine. Not described as a custodial-arrest
  trigger. **VERIFIED**

### Michigan
- **Stop-and-identify: N** — MCL 750.479c covers false information, not a duty to identify. **VERIFIED**
- **Licence display** — MCL 257.311. **VERIFIED**
- **Recording: functionally ONE-PARTY** — MCL 750.539c reads all-party on its
  face; courts read a participant exception into MCL 750.539a. Footnote the
  court-created exception rather than labelling MI identically to true
  one-party states. **LIKELY**
- **Sign citation** — MCL 257.727/257.728 cover citation-in-lieu-of-arrest
  mechanics only. No refusal penalty located. **UNVERIFIED — do not assert either way.**

### Minnesota
- **Stop-and-identify: N** — Minn. Stat. §609.506 bars giving a *false* name; it
  is not a duty-to-identify statute. **VERIFIED**
- **Licence display** — Minn. Stat. §171.08. Also requires writing your name in
  the officer's presence on request. **VERIFIED**
- **Recording: ONE-PARTY** — Minn. Stat. ch. 626A (§626A.02). **LIKELY**
- **Sign citation** — Minn. Stat. §169.92 reportedly says a person is **not
  required** to sign. Driver-favourable and high-value if true. **LIKELY — get
  one direct primary fetch before shipping.**

### New Hampshire
- **Stop-and-identify: N functionally** — RSA 594:2 bars arrest for refusal. See
  correction #2. **VERIFIED**
- **Licence display** — RSA 263:2. 48-hour safe harbour if a valid licence is
  later produced. **VERIFIED**
- **Recording: ALL-PARTY** — RSA 570-A:2. **LIKELY**
- **Sign citation** — **UNVERIFIED.** RSA 265:3 and 265:4 are not matches.

### New Jersey
- **Stop-and-identify: N** — no statewide statute. **LIKELY**
- **Licence display** — N.J.S.A. 39:3-29. **LIKELY**
- **Recording: ONE-PARTY** — N.J.S.A. 2A:156A-4(d). **VERIFIED**
- **Sign citation** — possibly N.J.S.A. 39:5-3. **LIKELY — subsection unconfirmed.**

---

## Coverage

Researched: NE, NV, MS, MO, MT, MA, MI, MN, NH, NJ (10 of 47 outstanding).
Not started: the remaining 37 states plus DC.

Every one of the ten has at least one UNVERIFIED or LIKELY cell. **None is ready
to ship.** The refusing-to-sign column is the weakest across the board — it was
verified for only 3 of 10 states.

## Blocking dependency before any of this ships

See `Upsolve, Inc. v. James`, No. 22-1345 (2d Cir., 9 Sep 2025): a state may bar
even free, nonprofit "what to say" guidance as unauthorized practice of law. The
practice-mode scoring engine — which evaluates a specific user's specific chosen
words — is more exposed than these static statute pages. A UPL/compliance
attorney should review the architecture before per-state content is widened.
