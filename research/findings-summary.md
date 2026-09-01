# Cross-State Findings — Amparo state-law research

**STATUS: RESEARCH ONLY. NOTHING HERE IS SHIPPED TO USERS.**

This file is a *reader's entry point* to `state-law-matrix.md`, which is an
append-only audit trail 6,000+ lines long. That structure is deliberate — every
correction in it is traceable — but it has a known failure mode: **the newest
statement about a cell is at the bottom, the first statement is at the top, and
nothing links them.** A reader going top-down gets stale answers.

This file carries only findings that survived to the end. Where a finding
corrected an earlier one, the correction is what appears.

**Every cell behind these findings clears bar (a) of this repo's two-part
standard — verified against primary statute text. None clears bar (b) — review by
an attorney licensed in that state. `Upsolve, Inc. v. James`, No. 22-1345 (2d Cir.,
9 Sep 2025) gates the content layer regardless.**

---

## Column status

| Column | Coverage |
|---|---|
| Driver ID | **51/51 complete** |
| Sign citation | **51/51 complete** |
| Recording consent | **51/51 complete** |
| Duty to inform (firearm) | **51/51 complete** |
| Stop-and-identify | **51/51 complete** |
| Officer condition | **51/51 complete** |
| Passenger ID | **51/51 complete** |
| Impersonation | 51/51 located, gating assessed for all 51 |
| Detention-length cap | in progress |
| Checkpoint authority | in progress |
| "Lit place" defence | in progress |

---

## The findings that change what the product should say

### 1. Recording your own stop is outside the wiretap statute everywhere

Verified in all 51 jurisdictions. The mechanisms differ — express participant
exception, one-party consent, a requirement that the recorder be *absent* or
*concealed*, a limitation to genuinely private communications, or an express
carve-out for recording public officials — but **no jurisdiction's wiretap
statute reaches a driver openly recording their own traffic stop.**

The twelve states published lists call "all-party consent" were the hard case and
none of them reached it either. Vermont and New Mexico have no applicable general
prohibition at all.

**Bounded:** this is a statement about wiretap statutes only. The obstruction
overlay — how recording gets charged as interference or failure to comply — is
**entirely unresearched**. The defensible sentence is *"the wiretap statute is not
the thing to worry about"*, **not** *"recording is legal"*.

### 2. Passengers are not covered by driver-ID statutes anywhere

Verified across all 51. Any duty a passenger carries arises only where the officer
has individualised suspicion **about them**.

Four exceptions, and only one is a true outlier:
- **AZ** §28-1595(C), **WA** RCW §46.61.021(3), **IN** §34-28-5-3.5 — reach a
  non-driver, but all three are hooked to *that person's own* infraction.
- **HI** §134-9.2(b) — the outlier: firearm disclosure owed by "a driver **or
  passenger** in a vehicle stopped", triggered by **the vehicle's stop alone**.

This is the only finding in the project that **simplifies** rather than fragments
the guidance, and it answers what passengers actually ask — not "what is the
statute" but "does this reach me at all".

**Term of art:** "**in charge of a vehicle**" is driver-limiting, not "anyone
inside". MA c.90 §25, NH RSA §265:4 I and WA §46.61.020 all use it to exclude
passengers. Washington is decisive — §46.61.020 uses the limiting formula while
its neighbour §46.61.021(3) says "any person", in the same chapter.

### 3. Refusing to sign a citation inverts across state lines

The same act is a **second-degree misdemeanor in Florida** (§318.14(3)) and
**expressly protected in Virginia**, whose §46.2-936 directs the officer to note
the refusal and "**forthwith release him from custody**".

Four postures: refusal is a crime (FL) · refusal costs release or bond (CA, TX,
OH, GA, NE, ID, AL, LA, KY) · refusal is expressly harmless, or nothing is asked
of the driver at all (NC, VA, WA, NV, MA, RI, OR, MO) · signing required,
consequence unestablished (TN, NM).

**And the column splits on a second axis.** For WY, WV, NC, NV and DE the
operative act is **accepting** the citation, not signing it. A question phrased
"do I have to sign?" does not reach those states at all.

**Consequence:** a national "you can refuse to sign, it isn't an admission of
guilt" script is advice to commit a misdemeanor in Florida. This is the strongest
argument in the project for state-gating over a single national script.

### 4. Duty to inform splits five ways, and staleness runs both directions

1. **Proactive** — MI, NC, NE, LA, **NJ** (silence is a fourth-degree crime),
   **HI** (reaches passengers), **AK** (plus a duty to allow the weapon to be
   secured).
2. **On request / demand** — OH, OK, AR, IL, VA, TN, MN, MO, KY, FL, PA, ND, MS,
   NV, NY, ME, CT, AL, WY, CO, WI, MD, WA.
3. **Accuracy-only** — **AZ** §13-3102(A)(1)(b): no duty to volunteer, no duty to
   answer, only a duty not to answer **falsely**.
4. **Inverse legislated** — **GA** §16-11-137 and **SC** §23-31-245 replaced their
   duties with a bar on detaining to investigate carry status. **UT**
   §53-5a-310(1)(e) looks like a third, but **(iii) expressly disapplies it to law
   enforcement** — so it is not a protection at a stop.
5. **No duty located** — DE, ID, IN, KS (repealed), MT, NH, RI, SD, VT, WV, MA.

**Staleness runs both ways.** Pre-2023 tables omit New Jersey's duty entirely
(created 2022) while still showing Georgia's and Ohio's, which have been repealed
or inverted. A published table can be wrong by omission *or* inclusion.

### 5. Fourteen states criminalise LYING, not SILENCE

PA §4914, VA §19.2-82.1, OR §162.385, WV §61-5-17(c), IA §719.1A, NM §30-22-3, NH
§265:4 I(b), MA c.90 §25, CA §148.9, KY §523.110, MI §750.479c, MO §575.120, NJ
§2C:29-3(b)(4), SD §22-40-1, TN §39-16-611.

Every one appears on published "stop and identify" lists. **None criminalises
declining to answer.** The rule is: *if* you answer, the answer must be true.

**MI §750.479c** is the clearest — it does not merely omit a refusal offence, it
**expressly preserves the right to decline to speak**.

Only **three** states criminalise refusal itself: **OH** §2921.29, **AZ** §13-2412
(name only, and only after the officer advises refusal is unlawful), **UT**
§76-8-301.5. And two of those three limit themselves internally:
- **OH** §2921.29(C) caps the compellable answer at name/address/DOB and **bars
  arrest for refusing anything beyond**.
- **UT** §76-8-301.5(2)(c) writes the **self-incrimination limit into the statute
  itself** — no offence where disclosure "presents a reasonable danger of
  self-incrimination".

### 6. Two states codify what to do with your hands

**OH** §2923.12(B)(2)-(3) and **AL** §13A-11-96. Alabama's is broader — it binds
**any driver or occupant** of a stopped vehicle with a loaded handgun in it, not
just a licensee.

**In both, the safe act and the intuitive act are opposites**: a driver who
reaches for the weapon to hand it over commits an offence. The Arena currently
scripts hand position as *advice*; in these states it is a criminal prohibition.

Related duties: **AK** §11.61.220(a)(1)(A)(ii) (allow the officer to secure the
weapon) and **LA** §40:1379.3(I)(2) (submit to a pat down and allow temporary
disarming).

### 7. The unmarked-car question has a real answer in some states and none in others

- **Flat bar** — **OK** 11 O.S. §34-106 and 19 O.S. §180.43 make it **unlawful for
  a police department to use an unmarked vehicle for routine traffic
  enforcement**, opening with a legislative finding that impersonation by unmarked
  car "is a threat to the public health and safety". Also **IN** §9-30-2-2(a),
  **OR** §810.400, **VA** §46.2-103, **ME** 29-A §105, **DE** 21 §701(a), **PA**
  §6304(a).
- **Evidentiary only** — **OH** §§4549.13/4549.14 make an unmarked-car traffic
  officer an **incompetent witness**. That is a courtroom remedy, not a roadside
  one, and only where the officer was on traffic duty for a misdemeanor.
- **Neither** — **GA** §40-8-91 mandates markings and then **(f) provides that an
  otherwise lawful arrest is unaffected by non-compliance.** The mandate binds the
  agency and gives the driver nothing.

**The trap:** fifteen states condition the **eluding offence** on the officer
being identifiable (ND, TX, NV, KS, MD, AK, LA, MS, WY, SD, GA, VT, NM, AZ, CO).
That is an element of a fleeing charge — a defence after the fact — **not
permission to keep driving.** Reading it as a roadside right converts a
prosecution element into an entitlement, and the gap between those is a felony
stop.

**Two myths killed:** New York's widely-cited unmarked-car restriction traces to a
**revoked 1996 executive order** and unenacted bills; New Jersey's traces to
**introduced bills** (A2310/1996 and others) that never became law.

### 8. Some impersonation statutes may not reach a fake traffic stop

Impersonation offences split on whether they require a purpose to injure, defraud,
or obtain a benefit. Where they do, someone who runs a fake stop **purely to stop
and frighten a driver** may fall outside the statute.

The sharpest illustration is three states using the same drafting *form* — a
result element — to opposite effect:

| | Result required | Reaches a fright-only fake stop? |
|---|---|---|
| **OK** §1533 | injured, defrauded, **harassed, vexed or annoyed** | **yes** |
| **NV** §199.430 | injured or defrauded | doubtful |
| **SD** §22-40-16 | injured or defrauded | doubtful |

Oklahoma's five words instead of two are the whole difference. Also gated: AR, LA,
MD, MN, OR, CA §538d, WY, TN(a) only.

**Counterweight:** **NC** G.S. §14-277(a)(4) grades operating a vehicle with a
blue light a **Class I felony** under (d1)(3), with no gate at all. NC and OK are
the two clearest legislative acknowledgements that the fake traffic stop is a
**distinct harm**.

**Bounded:** this is about the *impersonation* statute, not whether the conduct is
punishable — kidnapping, false imprisonment and coercion carry no such gate.

### 9. Sub-state variation exists and a state-level model cannot represent it

- **LA** R.S. §32:391 — statewide the officer **may** release on a written
  promise; **in Orleans Parish the officer shall.**
- **CA** Penal §26200(b) authorises the issuing authority to impose conditions,
  which is where county-level "must notify" requirements would ride.

### 10. Widely-taught roadside advice is often not law anywhere

The "drive to a well-lit place before stopping" guidance appears in **Arkansas's
DMV driver manual, not its code**. Where it *is* codified, it is a **defence**, not
a right: **MS** §97-9-72(5)(b) is a defence to prosecution; **DC**
§50-2201.05b(c)(4) is a *factor* in an affirmative defence. In both, a driver who
does this can still be stopped, removed, arrested and charged — and then argues it
in court.

---

## Method findings — the traps

Recorded because each one produced, or nearly produced, a wrong cell.

| Trap | What it looks like |
|---|---|
| Page chrome | Justia over `curl`: HTTP 200, 4–5 KB of navigation, no statute |
| Binary as text | A PDF decoded as UTF-8 gives plausible garbage of plausible length |
| SPA shells | 73–421 bytes, HTTP 200 |
| Host asserts absence | `flsenate.gov/.../ChapterNNN/All` reports "no sections" for a chapter whose sections fetch fine |
| Truncated index | Wisconsin ch. 346 cut after §346.38; Justia's Iowa index at §321.364 |
| **Catchline outlives provision** | MA c.140 §129C still reads "…exhibiting license on demand"; the body no longer contains it. **Produces a false POSITIVE.** |
| Catchline dies with provision | KS §75-7c03 — correct now, but every pre-2025 citation is stale |
| **Host index mislabels a section** | FindLaw's AL Title 32 index pointed an "arrest" lead at §32-5A-171, whose body is MAXIMUM LIMITS |
| Repealed but still served | MS §97-7-43, repealed 7/1/2025, still returned by search and by Justia's older pages |
| Renumbering | UT moved concealed-carry law to Title 53 ch. 5a (5/7/2025); the old §76-10-523.5 now covers a **different subject** |
| **Bill text ≠ enacted text** | TN HB0055 contained a refusal offence; Senate Amendment SA0344 **struck it before enactment**. Secondary sources quote introduced text. |
| Strike-through lost | PDF extraction does not carry strike formatting, so a struck sentence reads as live |
| Savings clause | GA §40-8-91(f) — read to the END of every section; the last subsection is where teeth are removed |

**Three rules that came out of these:**
1. **A catchline may be used to FIND a section, never to ESTABLISH what it says.**
   Not because catchlines are usually wrong — because they are reliably
   *incomplete*.
2. **A cross-state finding may not assert a per-state classification unless that
   cell carries quoted body text.** Findings summarise cells; they must not create
   them.
3. **A stop-and-identify cell may not be categorised from the stop-authority
   section alone** — the demand and the penalty are frequently in different
   titles.

---

## Known re-check list

- **Category B stop-and-identify entries** (WI, RI, FL, IL, DE, AL, CO, KS, NY,
  MT, NE) — each needs its state's criminal code checked for a separate offence
  section, after Utah was found miscategorised for exactly that reason.
- Cells whose negatives rested on **Justia being unavailable** — that was a *tool*
  limitation recorded as a *host* limitation.
- **MI** §750.539c recording — deliberately LIKELY. The participant exception is
  **court-created**, not statutory, and this project has not read the case law.
- Currency unverified: **OK** §11-34-106 mirror (2014 footer, since re-pulled from
  a 2025 source), **GA** via `ga.elaws.us` (2013 snapshot), **CT** §29-35,
  **MD** §5-308, **NV** §199.430 (accessed May 2025).
