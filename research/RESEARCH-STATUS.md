# Amparo — State-Law Research Status

**As of 2026-09-01, after the verification backlog was cleared.**
Canonical data: `research/state-matrix.md` — 51 jurisdictions × 19 columns.
Provenance archive (read-only): `research/archive/state-law-matrix-ledger.md`, 7,226 lines.

| | count |
|---|---|
| **VERIFIED** — read against primary statute text | **394** |
| **REFUTED** — cite was wrong, recorded with what the section actually is | **25** |
| **null** — verified absence, index read named | **90** |
| **case-law only** — real protection, not statutory (NJ, MN) | **2** |
| **UNVERIFIED** — outstanding | **0** |

---

## THE ONE THING THAT HAS NOT CHANGED

**Zero states are shippable.**

Every cell clears bar (a) — verification against primary statute text.
**No cell clears bar (b) — review by an attorney licensed in that state.**
*Upsolve, Inc. v. James*, No. 22-1345 (2d Cir., 9 Sep 2025) gates the content layer.

No further research moves this number. It needs a lawyer, not another pass. The
research is now in a state where handing one state to one attorney is a small,
concrete ask rather than an open-ended one.

---

## COLUMNS

| Column | State |
|---|---|
| Stop-and-ID | complete |
| License (driver ID) | complete |
| Consent to search | complete |
| Passenger ID | complete |
| Sign citation | complete |
| Recording own stop | complete |
| Duty to inform (firearm) | complete |
| Officer condition (marked/uniform) | complete |
| Lit-place / safe stop | complete |
| Detention cap | complete |
| Checkpoint authority | complete (WV cleared via Justia) |
| Impersonation | complete |
| Pretext / secondary-offense | complete |
| K-9 sniff | closed — no state statute exists anywhere; *Rodriguez* governs |
| Police-practices chapter | complete |
| Reason-for-stop duty | complete — only MN CA MD RI CT have the duty |
| Ticket vs arrest | complete |
| Footage access | complete |
| Duty to intervene | complete — split into direct duty vs agency-policy mandate |

---

## THE FINDINGS THAT SHAPE THE PRODUCT

### 1. Rhode Island §31-21.2-5 — six answers in one section
Detention cap, K-9 timing, consent, document-demand cap, pretext documentation, a
statutory exclusionary remedy, and mandatory dashcam from the moment the officer
signals. Thirty-five passes missed it because it lives in a police-relations
chapter of the motor-vehicle title, not where any column looked.

### 2. New Hampshire RSA 595-A:10 — the most product-relevant text found
Before a consent search is lawful the officer must say: you may refuse; refusal
is not suspicion; you cannot be charged for refusing; you cannot be detained
longer for refusing. Then must stop asking. Breach ⇒ evidence inadmissible.
Everything else in nineteen columns says what an officer may do. This answers
*"if I say no, does it get worse?"*

### 3. Virginia forecloses the consent cure
Eight sections: no stop for tint, defective equipment, tail/plate lights, mirror
danglers, seat belt, expired registration, expired inspection, or marijuana odour
— and evidence is inadmissible **"including evidence obtained with the operator's
consent."** Maryland CP §1-211(c) has the identical construction. Registration and
inspection carry a computable grace period: no stop before the first day of the
**fourth month** after expiry — the only calendar-date protections in the project.

### 4. Five remedy tiers — the duty never tells you the protection
| Tier | Remedy | Example |
|---|---|---|
| 0 | exclusion surviving consent | VA (8 sections), MD |
| 1 | exclusion | NH, RI, CT |
| 2 | "a factor" in voluntariness | CO — its own Supreme Court held breach *is not determinative* |
| 3 | none named | the data/policy statutes |
| 4 | **remedy expressly disclaimed** | WV §62-1A-10(d),(f) |

West Virginia requires probable cause, written consent, or recorded oral consent
— then says noncompliance alone doesn't prove involuntary consent and creates no
private cause of action. A form requirement with the teeth removed by the same
section that created it.

### 5. Duty to intervene splits in two
**Direct duty on the officer:** CO (class 1 misdemeanor), CT (prosecuted as an
accomplice), WI (fine + 6 months), plus WA MN VA NC IL TN OR NV MD KY MA VT UT NM.
**Agency-policy mandate only:** FL, CA, NE, SC, TN — the statute binds the
department to write a rule; it does not bind the officer or penalize one who
watches. These cannot be shown to a user as the same answer.

---

## WHAT VERIFICATION CAUGHT

**25 refutations — roughly a third of the locator data was wrong.**
- AZ §38-1172, filed as a body-camera statute, is **"State death benefit."**
- DC §5-125.03, filed as a duty to intervene, is a **chokehold ban.**
- NM §30-12-1, filed as recording-consent, governs **cutting telegraph wires.**
- VT 3 V.S.A. §168 and WI §165.85, filed as profiling bans, are neither.
- KY §523.110, filed as a reason-for-stop duty, is a false-identification offence.
- MD Gen. Prov. §3-511 **does not exist** — it's the Public Safety article.

**Corrections that went the other way:**
- NH RSA 594:14 **is** an enacted summons-instead-of-arrest statute.
- IL 625 ILCS 5/12-503(c-5) **is** a secondary-offense provision — Virginia is not alone.
- DE's phantom profiling subchapter traced to **unenacted SB213 (2001)** — the
  ninth bill-text contamination caught.

**Myth-kills:** Colorado's famous 90-minute cap does not exist in §16-3-103.
Virginia's 30-minute cap was repealed in 1994. Nine instances of unenacted bill
text circulating as code. Florida §943.1714 is a phantom section number.

---

## THE ONE OPEN DECISION — needs a human

**Eleven states protect drivers by case law, not statute.** NY (*People v. De Bour*),
NJ (*State v. Carty*), MN (*State v. Fort*), plus CO, WA, MI, PA, VT, IL, MA, FL on
cannabis-odour grounds (documented in `research/case-law/`).

This matrix is built from statutes. Ship only the statutory answer and a driver in
those states is told they have no protection when a court has given them one.

That is a product-scope call, not a research one.
