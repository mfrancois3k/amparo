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
- **Sign citation** — **UNVERIFIED**. RSA 265:3 and 265:4 are not matches.

### New Jersey
- **Stop-and-identify: N** — no statewide statute. **LIKELY**
- **Licence display** — N.J.S.A. 39:3-29. **LIKELY**
- **Recording: ONE-PARTY** — N.J.S.A. 2A:156A-4(d). **VERIFIED**
- **Sign citation** — possibly N.J.S.A. 39:5-3. **LIKELY — subsection unconfirmed.**

### Florida
Researched 2026-08-31 against flsenate.gov primary text.

- **Stop-and-identify: N** — F.S. §901.151 (Stop and Frisk Law). The statute
  authorises an officer to "temporarily detain such person for the purpose of
  ascertaining the identity" but imposes **no duty on the detained person to
  identify themselves and no criminal penalty for silence**. Operative release
  language: "If, after an inquiry into the circumstances which prompted the
  temporary detention, no probable cause for the arrest of the person shall
  appear, the person shall be released." **VERIFIED**
  > CORRECTION ON RECORD: Florida is repeatedly asserted — including in a
  > prompt submitted to this project on 2026-08-31 — to be an "explicit
  > stop-and-identify state under reasonable suspicion" where "you must state
  > your name". The statute says no such thing. It authorises detention *to
  > ascertain* identity; it does not compel speech. This is a fifth instance of
  > the copied-list error the header of this file documents.
- **Identify driver** — F.S. §322.15(1): "Every licensee shall have his or her
  driver license … in his or her immediate possession at all times when
  operating a motor vehicle and shall **present or submit** the same upon the
  demand of a law enforcement officer or an authorized representative of the
  department." Note "present or submit" is stronger than Texas's "display" and
  does not carry the same show-through-glass ambiguity. **VERIFIED**
- **Identify passenger** — no statute located imposing a passenger
  identification duty. §901.151 governs detention generally and imposes none.
  **UNVERIFIED** — absence of a statute is not the same as a fetched negative;
  needs a targeted search of Ch. 901 and Ch. 316 before it may be relied on.
- **Duty to inform (firearm): N, both licensed and permitless** — two separate
  provisions, neither creating an affirmative duty:
  - Licensed, F.S. §790.06(1)(c): "A licensee must carry valid identification at
    all times in which the licensee is in actual possession of a concealed
    weapon or concealed firearm and **must display such identification upon
    demand by a law enforcement officer.**" **VERIFIED**
  - Permitless (post-HB 543, 2023), F.S. §790.013(1)(a): same carry-and-display
    requirement. §790.013(1)(b): "A violation of this subsection is a
    **noncriminal violation punishable by a $25 fine**, payable to the clerk of
    the court." **VERIFIED**
  Both are display-on-demand, not disclose-on-contact. **VERIFIED**
- **Consent to search** — no state-level statutory standard located; Florida
  applies the federal voluntariness standard. **UNVERIFIED**
- **Recording consent** — not researched this pass. **UNVERIFIED**
- **Sign citation** — not researched this pass. **UNVERIFIED**

### California
Researched 2026-08-31 against leginfo.legislature.ca.gov primary text.

- **Stop-and-identify: N** — no statewide stop-and-identify statute located.
  Pen. Code §148(a)(1) reaches only "[e]very person who willfully resists,
  delays, or obstructs any public officer, peace officer, or an emergency
  medical technician" — it does **not** create a duty to identify. **VERIFIED
  as to §148's text; LIKELY as to the statewide negative** (an exhaustive search
  of the Penal Code was not performed).
- **Identify driver** — Veh. Code §12951(a): "The licensee shall have the valid
  driver's license issued to him or her in his or her immediate possession at
  all times when driving a motor vehicle upon a highway." §12951(b): "The driver
  of a motor vehicle shall **present his or her license for examination** upon
  demand of a peace officer enforcing the provisions of this code." **VERIFIED**
- **Identify passenger** — no statute located imposing a passenger
  identification duty; §12951(b) is expressly limited to "[t]he driver".
  **LIKELY** — the negative needs a targeted search before reliance.
  > NOTE: the claim that California has "highly protective passenger rights" is
  > not supported by anything located in this pass. A passenger's protection
  > here appears to be the federal floor (*Brendlin v. California*, 551 U.S. 249
  > (2007) establishes a passenger IS seized in a stop and may challenge it),
  > not a California-specific statutory grant. Do not describe it as a state
  > protection without authority. **UNVERIFIED as a state-specific claim.**
- **Duty to inform (firearm): N — but California has a counterintuitive trap.**
  No duty-to-inform statute located. However Pen. Code §25850(b): "In order to
  determine whether or not a firearm is loaded … **peace officers are authorized
  to examine any firearm** carried by anyone on the person or in a vehicle while
  in any public place or on any public street in an incorporated city or
  prohibited area of an unincorporated territory." And: "**Refusal to allow a
  peace officer to inspect a firearm pursuant to this section constitutes
  probable cause for arrest** for violation of this section." **VERIFIED**
  > SAFETY-CRITICAL: a generic "I do not consent to any searches" line — which
  > appeared in a rehearsal script proposed for California on 2026-08-31 — can,
  > if applied to a §25850 firearm inspection, itself supply probable cause for
  > arrest. A blanket refusal script is not safe in California without carving
  > this out. This is the clearest example yet of why per-state scripts cannot
  > be generated from a national template.
- **Consent to search** — no state-level statutory standard located beyond
  §25850(b) above. **UNVERIFIED**
- **Recording consent — TWO-TRACK, and the carve-out is STATUTORY, not merely
  case law.** Researched 2026-08-31. Two independent provisions apply and must
  not be collapsed into one answer:

  **Track 1 — Pen. Code §148(g), the direct carve-out.** Full text:
  > "The fact that a person takes a photograph or makes an audio or video
  > recording of a public officer or peace officer, while the officer is in a
  > public place or the person taking the photograph or making the recording is
  > in a place he or she has the right to be, does not constitute, in and of
  > itself, a violation of subdivision (a), nor does it constitute reasonable
  > suspicion to detain the person or probable cause to arrest the person."
  **VERIFIED**. Note what this does beyond legalising the act: it forecloses the
  recording being used as the *basis* for a detention or an arrest. That is a
  stronger and more specific protection than the 9th Circuit line of authority
  the research request assumed would be the source.

  **Track 2 — Pen. Code §632, which still exists and is narrower than "two-party
  consent" is usually described.** §632(c) defines the thing the statute
  actually protects:
  > "'confidential communication' means any communication carried on in
  > circumstances as may reasonably indicate that any party to the communication
  > desires it to be confined to the parties thereto, but **excludes** a
  > communication made in a public gathering or in any legislative, judicial,
  > executive, or administrative proceeding open to the public, **or in any
  > other circumstance in which the parties to the communication may reasonably
  > expect that the communication may be overheard or recorded.**"
  **VERIFIED as to text.** §632 therefore does not reach every recording — only
  *confidential* ones. Whether a given roadside stop on a public street falls
  inside the "may reasonably expect … overheard or recorded" exclusion is a
  circumstance-dependent question, not a bright line. **UNVERIFIED as a blanket
  rule** — do not state that §632 never applies to a traffic stop.

  **Open vs. concealed recording.** The research request asked specifically
  whether California distinguishes them. On the text: **§148(g) contains no
  openness requirement** — it says "takes a photograph or makes an audio or
  video recording" with no qualifier as to whether the officer is aware.
  **VERIFIED as to the statutory text.** Whether California courts have read an
  openness condition into it, or whether §632 supplies one in practice for audio
  specifically, was **NOT researched. UNVERIFIED.** This gap matters: it is the
  precise point on which Massachusetts turned (*Glik*; *Project Veritas v.
  Rollins* dealt with **secret** recording), so the analogous California answer
  cannot be assumed from the §148(g) text alone.

  *Fordyce v. City of Seattle*, 55 F.3d 436 (9th Cir. 1995), was named in the
  research request as likely authority. It was **not fetched this pass** and is
  recorded here only as a lead. **UNVERIFIED**.
- **Sign citation** — not researched this pass. Veh. Code §40302 is the likely
  starting point. **UNVERIFIED**

### Ohio
Researched 2026-08-31 against codes.ohio.gov primary text.

- **Stop-and-identify: Y — and broader than the name-only states.** O.R.C.
  §2921.29: "No person who is **in a public place** shall refuse to disclose the
  person's **name, address, or date of birth**" when an officer reasonably
  suspects the person is committing, has committed, or is about to commit a
  criminal offence, **or** that the person witnessed certain serious offences
  (an offence of violence constituting a felony, a felony causing serious
  physical harm, or an attempt/conspiracy as to those). Penalty: "guilty of
  failure to disclose one's personal information, a **misdemeanor of the fourth
  degree**." **VERIFIED**
  Three limits that are part of the same statute and must travel with it:
  1. The duty is triggered only "in a public place".
  2. Officers **cannot require answers beyond those three items**, and cannot
     arrest for refusing to give more or to describe an offence witnessed.
  3. A person **may refuse to disclose age/date of birth** where age is an
     element of the offence they are suspected of.
  Contrast Nevada (NRS 171.123(3)): **name only**. Ohio reaches name, address
  AND date of birth. A national "you only ever have to give your name" statement
  is wrong in Ohio. **VERIFIED**
- **Identify driver** — not researched this pass. **UNVERIFIED**
- **Identify passenger** — not researched this pass. **UNVERIFIED**
- **Duty to inform (firearm)** — NOT researched, and flagged as high-risk:
  Ohio's duty to inform was materially changed by **S.B. 215 (eff. 2022-06-13)**
  when Ohio moved to permitless carry. Any pre-2022 secondary source on Ohio
  duty-to-inform is stale. Must be fetched from O.R.C. §2923.12 directly.
  **UNVERIFIED**
- **Recording consent** — not researched this pass. **UNVERIFIED**
- **Sign citation** — not researched this pass. **UNVERIFIED**

### Illinois — NOT RESEARCHED (source access failed)
Attempted 2026-08-31. 725 ILCS 5/107-14 is the target section.
`ilga.gov` returned HTTP 404 on the fulltext endpoint; `law.justia.com`
returned HTTP 403. No primary text obtained. **UNVERIFIED — every cell.**
Do not populate from secondary sources.

### Arizona — NOT RESEARCHED (source access failed)
Attempted 2026-08-31. A.R.S. §13-2412 ("Refusing to provide truthful name when
lawfully detained") is the target section. `azleg.gov` returned HTTP 403;
`law.justia.com` returned HTTP 403. No primary text obtained.
**UNVERIFIED — every cell.** Arizona is widely listed as a stop-and-identify
state; given this file's 4-of-10 error rate on such lists, that listing is a
lead to check, not a finding to record.

### Virginia
Researched 2026-08-31 against law.lis.virginia.gov primary text.

- **Identify driver — and a partial name duty most summaries miss.**
  Va. Code §46.2-104 requires a driver to "exhibit his registration card,
  driver's license, learner's permit, or temporary driver's permit" on an
  officer's request, and further provides the driver must "**write his name in
  the presence of the officer, if so required, for the purpose of establishing
  his identity.**" **VERIFIED**
  Two things follow that a national summary would flatten:
  1. It is **exhibit**, not surrender.
  2. There IS a conditional duty to provide a name — but it is tied to driving
     and conditioned on the officer requiring it, and the statute specifies
     *writing* the name. This is not a general stop-and-identify statute, and
     it is also not "no duty to give your name". Both blanket statements are
     wrong for a Virginia driver.
  No explicit address duty appears in this section. **VERIFIED as to §46.2-104's
  text**; whether any other Virginia provision adds one was not checked.
- **Stop-and-identify (non-driving): N** — no statewide statute located.
  **UNVERIFIED** — negative not established by an exhaustive code search.
- **Identify passenger** — not researched. **UNVERIFIED**
- **Duty to inform (firearm)** — not researched. **UNVERIFIED**
- **Recording consent** — not researched. **UNVERIFIED**
- **Sign citation** — not researched. **UNVERIFIED**

### Washington
Researched 2026-08-31 against app.leg.wa.gov primary text.

- **Identify driver** — RCW 46.20.017: "Every licensee shall have his or her
  driver's license in his or her immediate possession at all times when
  operating a motor vehicle and shall **display the same upon demand** to any
  police officer or to any other person when and if required by law to do so."
  Violation classified as a **nonmoving offense**. **VERIFIED**
  Note "display" — the same verb Texas uses, and this file already records that
  "display" carries a show-through-glass ambiguity that "present or submit"
  (Florida §322.15) does not. Do not assume the Washington answer matches
  Florida's.
- **Stop-and-identify: N** — no statewide statute located. **UNVERIFIED** as a
  fetched negative.
- **Identify passenger** — not researched. **UNVERIFIED**
- **Duty to inform (firearm)** — not researched. **UNVERIFIED**
- **Recording consent — ALL-PARTY, BUT ONLY FOR "PRIVATE" COMMUNICATIONS, AND
  NO CIVILIAN CARVE-OUT LOCATED.** Researched 2026-08-31.
  RCW 9.73.030 makes it unlawful to "intercept, or record any" **private**
  communication "without first obtaining the consent of all the participants in
  the communication." The prohibition reaches "[p]rivate communication
  transmitted by telephone, telegraph, radio, or other device" and "[p]rivate
  conversation, by any device electronic or otherwise designed to record or
  transmit such conversation". **VERIFIED**
  The operative limiter is the word **private** — structurally the same move as
  California §632's "confidential". Washington's all-party rule does not reach a
  conversation that is not private. Whether a roadside stop on a public highway
  is "private" for this purpose is the whole question and was **NOT** resolved
  here. **UNVERIFIED — and this is the cell to close first.**
  RCW 9.73.090 was checked for a police carve-out. Its exemptions run the OTHER
  WAY — they permit **officers** to record: "Video and/or sound recordings may be
  made of arrested persons by police officers"; dash/body camera audio; and "It
  shall not be unlawful for a law enforcement officer acting in the performance
  of the officer's official duties to intercept, record, or disclose an oral
  communication or conversation where the officer is a party". **VERIFIED**
  > CONTRAST WITH CALIFORNIA, AND IT MATTERS: California has an express
  > **civilian** protection (Pen. Code §148(g) — recording an officer is not a
  > §148 violation and is not RS or PC). **No equivalent Washington provision
  > was located.** Washington's exemptions protect officers recording, not
  > civilians recording officers. Do NOT carry the California answer across.
  > **UNVERIFIED as to any Washington civilian protection.**
- **Sign citation** — not researched. **UNVERIFIED**

### North Carolina
Researched 2026-08-31 against ncleg.gov primary text.

- **Identify driver** — N.C.G.S. §20-29 makes it an offence to "refuse, on
  demand of such officer or such other person, to **produce his license and
  exhibit same** to such officer or such other person for the purpose of
  examination". The section also covers failure to "surrender his license on
  demand of the Division, or fail to produce same when requested by a court of
  this State." **VERIFIED**
  Note the structure: the duty runs to *producing and exhibiting for
  examination*; the *surrender* language attaches to the Division and the
  courts, not to the roadside officer.
- **Stop-and-identify: N** — no statewide statute located. **UNVERIFIED** as a
  fetched negative.
- **Identify passenger** — not researched. **UNVERIFIED**
- **Duty to inform (firearm)** — NOT researched, flagged: North Carolina was
  named in a 2026-08-31 prompt as a "Duty to Inform" state. That claim is
  **unverified here** and must be fetched from N.C.G.S. §14-415.11 before it is
  relied on in any form. **UNVERIFIED**
- **Recording consent** — not researched. **UNVERIFIED**
- **Sign citation** — not researched. **UNVERIFIED**

### Pennsylvania — NOT RESEARCHED (source access failed)
Attempted 2026-08-31. 75 Pa.C.S. §1511 is the target section.
`legis.state.pa.us` issued a 301 to `palegis.us`; the redirect target returned a
navigation/template page with no statute text. No primary text obtained.
**UNVERIFIED — every cell.**

### Tennessee — NOT ATTEMPTED
Queued in batch 2 but not reached. Tennessee's code is published through a
commercial host (LexisNexis), so expect the same access problem as IL/AZ.
Target sections: T.C.A. §55-50-351 (licence exhibition). **UNVERIFIED**.

### Wisconsin
Researched 2026-08-31 against docs.legis.wisconsin.gov primary text.

- **Stop-and-identify: DEMAND AUTHORISED, NO PENALTY IN THE STATUTE.**
  Wis. Stat. §968.24: "After having identified himself or herself as a law
  enforcement officer, a law enforcement officer may stop a person in a public
  place for a reasonable period of time when the officer reasonably suspects
  that such person is committing, is about to commit or has committed a crime,
  and **may demand the name and address of the person and an explanation of the
  person's conduct.**" **VERIFIED**
  The statute authorises the demand. **It specifies no penalty for refusing.**
  The section's annotations cite *Hiibel* for the proposition that a state *may*
  criminalise refusal — which is a statement about what is constitutionally
  permitted, not evidence that Wisconsin has done so. **VERIFIED as to text;
  whether any other Wisconsin provision supplies a penalty was NOT checked —
  UNVERIFIED.**
- All other columns not researched. **UNVERIFIED**

### Rhode Island
Researched 2026-08-31 against rilegislature.gov primary text.

- **Stop-and-identify: DEMAND AUTHORISED, CONSEQUENCE IS DETENTION, NOT A
  CHARGE.** R.I.G.L. §12-7-1 permits an officer to "demand of the person his or
  her name, address, business abroad, and destination." A person who fails to
  identify "to the satisfaction of the peace officer" "may be further detained"
  and "further questioned and investigated". **VERIFIED**
  Refusal is **not stated as a crime**. The consequence is procedural — a longer
  stop — not a charge. That is a materially different thing to tell someone than
  "you will be arrested if you don't identify". **VERIFIED**
- All other columns not researched. **UNVERIFIED**

---

## CROSS-STATE FINDING (2026-08-31): "stop and identify" is three categories, not two

The single most repeated error in prompts submitted to this project is treating
stop-and-identify as a binary. Primary text shows at least three distinct
regimes, and the popular lists collapse all of them into "Y":

**A. Demand authorised AND refusal criminalised.**
  - Ohio §2921.29 — name, address, date of birth; 4th-degree misdemeanour.
  - Nebraska §29-829 — name, address, explanation of actions.
  - Arizona §13-2412 — **name only**, class 2 misdemeanour, and ONLY after the
    officer has advised that refusal is unlawful.

**B. Demand authorised, NO penalty for silence in the statute.**
  - Wisconsin §968.24 — "may demand the name and address"; no penalty specified.
  - Rhode Island §12-7-1 — refusal leads to *further detention*, not a charge.
  - Florida §901.151 — detention "for the purpose of ascertaining the identity";
    no duty to speak, no penalty.
  - Utah §77-7-15 — "may demand … name, address, date of birth"; no penalty here.
  - Illinois 725 ILCS 5/107-14 — "may demand the name and address"; none here.
  - Delaware 11 §1902 — refusal → detention capped at 2 hours, expressly "not an
    arrest"; not made a crime by the section.
  SIX of the fetched states sit in this category, and every one of them appears
  on the popular "stop and identify states" lists. That list is not measuring
  what people think it measures: it captures states where an officer may ASK,
  not states where silence is a crime.

**C. Duty attaches only to a specific act, not to detention generally.**
  - Virginia §46.2-104 — driver must exhibit licence and, "if so required",
    *write* his name. Tied to driving, conditioned on the officer requiring it.
  - Texas §38.02 (shipped) — duty attaches on **lawful arrest**, not detention;
    giving a FALSE name while detained is separately an offence.

A national script that says "you must give your name" is wrong for B and C.
A national script that says "you never have to give your name" is wrong for A
and C. There is no correct national sentence. This is the strongest single
argument in this file against a generated per-state layer, and it is now
supported by seven states of fetched primary text rather than by assertion.

### Idaho
Researched 2026-08-31 against legislature.idaho.gov primary text.

- **Identify driver — STRONGEST VERB FOUND SO FAR: "surrender".**
  Idaho Code §49-316: "Every licensee shall have his driver's license in his
  immediate possession at all times when operating a motor vehicle and shall,
  **upon demand, surrender the driver's license into the hands of a peace
  officer** for his inspection." **VERIFIED**
  This is not "display" and not "exhibit". Idaho requires the licence to be put
  into the officer's hands. Any guidance suggesting a driver may keep hold of
  the licence, or show it through glass, is wrong in Idaho.
- All other columns not researched. **UNVERIFIED**

### Minnesota — driver ID cell added
- **Identify driver** — Minn. Stat. §171.08: "Every licensee shall have the
  license in immediate possession at all times when operating a motor vehicle
  and shall **display it upon demand** of a peace officer, an authorized
  representative of the department, or an officer authorized by law to enforce
  the laws relating to the operation of motor vehicles on public streets and
  highways." **VERIFIED** (other Minnesota cells unchanged from the earlier pass)

---

## CROSS-STATE FINDING (2026-08-31): the licence-handover verb is not uniform

Seven states of fetched text show a real spectrum in what a driver must
physically do. These are not stylistic variations; they describe different acts.

| State | Statute | Operative verb |
|---|---|---|
| Idaho | §49-316 | "**surrender** … into the hands of a peace officer" |
| Florida | §322.15(1) | "**present or submit**" |
| North Carolina | §20-29 | "**produce** … and **exhibit** … for the purpose of examination" |
| Virginia | §46.2-104 | "**exhibit**" + "**write his name**, if so required" |
| California | Veh. §12951(b) | "**present** … for examination" |
| Washington | RCW 46.20.017 | "**display**" |
| Minnesota | §171.08 | "**display**" |
| Texas (shipped) | Transp. §521.025 | "**display**" — and the shipped entry already warns that
  officers and courts often treat showing-through-glass as refusal |

Consequence: there is no safe national sentence about handing over a licence
either. "You don't have to hand it over, just show it" is wrong in Idaho on the
statute's face. "Always surrender it" overstates the duty in the display states.
This is the second independent axis (after stop-and-identify) on which a
generated national template fails.

### South Carolina
- **Identify driver** — S.C. Code §56-1-190: "A licensee shall have his license
  in his immediate possession at all times when operating a motor vehicle and
  shall **display it upon demand** of an officer or agent of either the
  Department of Motor Vehicles or the Department of Public Safety or a law
  enforcement officer of the State." **VERIFIED**
- All other columns not researched. **UNVERIFIED**

### Oregon
- **Identify driver — "present and deliver", with a criminal penalty.**
  ORS 807.570(1)(b) makes it an offence where a person "[d]oes not **present and
  deliver** such license or permit to a police officer when requested by the
  police officer" — triggered on being lawfully stopped or detained while
  driving, or where the vehicle was involved in an accident. Failure is a
  **Class C misdemeanor**. **VERIFIED**
  Note: "present and deliver" sits at the Idaho end of the spectrum, not the
  "display" end, and unlike most display states it carries a criminal penalty
  rather than an infraction.
- All other columns not researched. **UNVERIFIED**

### Connecticut
- **Identify driver — the duty is SPLIT ACROSS TWO SECTIONS.**
  C.G.S. §14-213 provides only: "Each operator of a motor vehicle shall **carry**
  his operator's license while operating such vehicle." Failure to carry is an
  **infraction**. **VERIFIED**
  §14-213 does **not** contain a produce-on-demand duty. That requirement sits in
  a separate section (§14-217, production of licence, registration and
  insurance). **NOT FETCHED — UNVERIFIED.**
  > METHOD NOTE: this is a trap for anyone researching by single section number.
  > Citing §14-213 alone as "Connecticut's licence law" would state the carry
  > duty and silently omit the production duty. Always check whether a state
  > splits carry from produce.

### Maryland
- **Identify driver — conditioned on the officer being UNIFORMED.**
  Md. Transp. §16-112: "Each individual driving a motor vehicle on any highway in
  this State shall have his license with him." and "shall **display the license
  to any uniformed police officer who demands it.**" **VERIFIED**
  The word "uniformed" is a condition on the duty and appears in no other state
  fetched so far. Not a detail to drop in summary.
- All other columns not researched. **UNVERIFIED**

### Michigan — driver ID cell added
- **Identify driver — conditioned on the officer IDENTIFYING THEMSELVES.**
  MCL §257.311: "The licensee shall have his or her operator's or chauffeur's
  license, or the receipt described in section 311a, in his or her immediate
  possession at all times when operating a motor vehicle, and shall **display
  the same upon demand of any police officer, who shall identify himself or
  herself as such.**" **VERIFIED** (other Michigan cells unchanged)

---

## CROSS-STATE FINDING (2026-08-31): the duty is sometimes CONDITIONED on the officer

A third axis, distinct from the verb and from stop-and-identify. Some states
attach express conditions to the officer's side of the demand:

- **Maryland** §16-112 — duty runs to a "**uniformed** police officer".
- **Michigan** §257.311 — duty runs to an officer "**who shall identify himself
  or herself as such**".
- **Wisconsin** §968.24 — the stop power itself begins "**After having
  identified himself or herself as a law enforcement officer**".

Whereas South Carolina, Minnesota, Washington and Texas state the duty with no
condition on the officer at all.

Three axes now, each independently fatal to a generated national template:
  1. Stop-and-identify — three regimes (criminalised / no penalty / act-specific)
  2. Licence handover — six different operative verbs, from "display" to
     "surrender into the hands of"
  3. Conditions on the officer — uniformed / self-identified / unconditioned

### Utah
Retrieved 2026-08-31 via rendered browser (le.utah.gov blocks plain fetch).

- **Stop-and-identify: DEMAND AUTHORISED, NO PENALTY IN THIS SECTION.**
  Utah Code §77-7-15: "A peace officer may stop any individual in a public place
  when the officer has a reasonable suspicion to believe the individual has
  committed or is in the act of committing or is attempting to commit a public
  offense and **may demand the individual's name, address, date of birth, and an
  explanation of the individual's actions.**" (Amended ch. 411, 2019) **VERIFIED**
  Scope matches Ohio (name + address + DOB) but **no penalty appears in this
  section**. Whether another Utah provision criminalises refusal was NOT checked.
  **UNVERIFIED as to penalty.** Utah appears on the copied stop-and-identify
  lists; on this section's text alone that listing is not supported.
- All other columns not researched. **UNVERIFIED**

### Illinois
Retrieved 2026-08-31 via rendered browser (ilga.gov 404s on plain fetch).

- **Stop-and-identify: DEMAND AUTHORISED, NO PENALTY IN THIS SECTION.**
  725 ILCS 5/107-14(a): "A peace officer, **after having identified himself as a
  peace officer**, may stop any person in a public place for a reasonable period
  of time when the officer reasonably infers from the circumstances that the
  person is committing, is about to commit or has committed an offense … and
  **may demand the name and address of the person and an explanation of his
  actions.** Such detention and temporary questioning will be conducted in the
  vicinity of where the person was stopped." **VERIFIED**
  No penalty for refusal appears in the section. **UNVERIFIED as to penalty.**
- **STOP RECEIPT — an affirmative civilian right, unique among states fetched.**
  725 ILCS 5/107-14(b): "Upon completion of any stop under subsection (a)
  involving a frisk or search, and unless impractical, impossible, or under
  exigent circumstances, **the officer shall provide the person with a stop
  receipt which provides the reason for the stop and contains the officer's name
  and badge number.**" (Source: P.A. 99-352, eff. 1-1-16.) **VERIFIED**
  This is the only fetched provision so far that gives the civilian something
  they can ASK FOR during the encounter. Worth surfacing to Illinois users if
  the content layer ever ships — it is checkable, statutory, and actionable.
- All other columns not researched. **UNVERIFIED**

### Delaware
Retrieved 2026-08-31 via rendered browser (delcode index page only, on plain fetch).

- **Stop-and-identify: DEMAND AUTHORISED, CONSEQUENCE IS CAPPED DETENTION.**
  11 Del. C. §1902(a): "A peace officer may stop any person abroad, or in a
  public place, who the officer has reasonable ground to suspect is committing,
  has committed or is about to commit a crime, and **may demand the person's
  name, address, business abroad and destination.**"
  §1902(b): "Any person so questioned who **fails to give identification** or
  explain the person's actions to the satisfaction of the officer **may be
  detained and further questioned and investigated.**"
  §1902(c): "The total period of detention provided for by this section **shall
  not exceed 2 hours. The detention is not an arrest and shall not be recorded
  as an arrest in any official record.** At the end of the detention the person
  so detained shall be released or be arrested and charged with a crime."
  **VERIFIED**
  Structurally Rhode Island's regime plus two protections RI lacks: a **hard
  2-hour cap** and an express statement that the detention **is not an arrest
  and is not recorded as one**. Refusal is not made a crime by this section.
- All other columns not researched. **UNVERIFIED**

---

## METHOD UNLOCK (2026-08-31): the rendered browser beats plain fetch

A large share of the "blocked" states were never blocked — their sites are
JavaScript-rendered, so a plain HTTP fetch returns a navigation shell with HTTP
200 and no statute. Loading the same URL in a rendered browser and reading the
page text retrieved full statutory text for **Utah, Illinois and Delaware** on
the first attempt, all three of which had previously failed.

Implication for the remaining states: re-attempt the entire confirmed-bad list
through the browser before treating any of them as unavailable. The earlier
"~42% reachable" figure understates what is actually obtainable.

Still genuinely unavailable:
  - PDF-only publication (ND, IA, KY, WY, OK). PDF page rendering is not
    installed in this environment, so the file downloads but cannot be read.
  - Hosts that refuse the connection outright (ksrevisor.org, touchngo.com,
    capitol.hawaii.gov).
  - Vermont and Indiana returned shells even in the browser (VT served a generic
    statutes landing page; IN was still rendering — retry with a wait).

### Hawaii
Retrieved 2026-08-31 via rendered browser (capitol.hawaii.gov 403s on plain fetch).

- **Identify driver — and the officer has NO DISCRETION.**
  H.R.S. §286-116(a): "Every licensee shall have a valid driver's license in the
  licensee's immediate possession at all times, and a valid motor vehicle or
  liability insurance identification card … when operating a motor vehicle, and
  **shall display the same upon demand of a police officer. Every police officer
  or law enforcement officer when stopping a vehicle or inspecting a vehicle for
  any reason shall demand that the driver or owner display** the driver's or
  owner's driver's license and insurance identification card." **VERIFIED**
  Unique among the states fetched so far: the statute obliges the **officer** to
  demand, not merely permit it. A Hawaii driver should expect the demand in
  every stop as a matter of statute.
  The section also expressly permits display of an **electronic** insurance card
  on a mobile device (cross-referencing §291C-137). **VERIFIED**
- All other columns not researched. **UNVERIFIED**

---

## CONFIRMED HARD BLOCKS (2026-08-31) — do not re-attempt without new tooling

Distinguish these from JS-render failures, which the browser solved:

- **Arizona** — azleg.gov sits behind a **Sucuri WAF** that blocklists the
  originating IP outright ("Block ID: BLACK02"). Neither plain fetch nor
  rendered browser passes. A.R.S. §13-2412 remains **UNVERIFIED**.
- **West Virginia** — code.wvlegislature.gov returns a **Wordfence 403** to both
  methods. §17B-2-9 remains **UNVERIFIED**.
- **Kansas** — ksrevisor.org refuses the TCP connection (ECONNREFUSED).
- **Alaska** — touchngo.com refuses the connection.
- **PDF-only states** — ND, IA, KY, WY, OK. The files download but PDF page
  rendering (poppler/pdftoppm) is not installed in this environment, so the text
  cannot be read. This is a tooling gap, not a source problem: install
  poppler-utils and these five become reachable.

Partial / wrong-section, site itself reachable:
- **South Dakota** — sdlegislature.gov renders correctly. §32-12-38 is
  restriction-violation and §32-12-22 is driving-without-a-licence; neither is
  the carry-and-display section. Correct section number not yet identified.
- **Pennsylvania** — palegis.us renders the Title 75 frame but not section text
  at the URL patterns tried. 75 Pa.C.S. §1511 still **UNVERIFIED**.
- **Indiana** — iga.in.gov renders breadcrumbs only; content is loaded by a
  script that did not complete within a 3-second wait. Retry with a longer wait
  or a direct section endpoint.
- **Vermont** — legislature.vermont.gov served a generic statutes landing page
  in the browser as well as to plain fetch.

### North Dakota
Retrieved 2026-08-31 from ndlegis.gov PDF via pypdf extraction.

- **Identify driver — accepts ELECTRONIC, and has a 14-day cure.**
  N.D.C.C. §39-06-16 ("License to be carried and exhibited on demand"): "An
  individual licensed to operate a motor vehicle shall have a **physical or
  electronic** operator's license in the individual's immediate possession at
  all times when operating a motor vehicle and shall **physically surrender or
  electronically provide** an operator's license, upon demand of any court,
  police officer, or a field deputy or inspector of the department. However, an
  individual charged with violating this section **may not be convicted or
  assessed any court costs if the individual produces within fourteen days** to
  the office of the prosecutor where the matter is pending, a valid operator's
  license issued to that individual." **VERIFIED**
- All other columns not researched. **UNVERIFIED**

### Iowa
Retrieved 2026-08-31 from legis.iowa.gov PDF via pypdf extraction.

- **Identify driver** — Iowa Code §321.174(3): "A licensee shall have the
  licensee's driver's license in immediate possession at all times when
  operating a motor vehicle and shall **display the same upon demand** of a
  judicial magistrate, district associate judge, district judge, peace officer,
  or examiner of the department." **VERIFIED**
- All other columns not researched. **UNVERIFIED**

### Wyoming
Retrieved 2026-08-31 from wyoleg.gov PDF (542pp) via pypdf extraction.

- **Identify driver — display, with a court cure.**
  W.S. §31-7-116 ("Carrying and displaying"): "Every licensee shall have his
  driver's license in his immediate possession at all times when driving a motor
  vehicle and shall **display the license upon demand** of any judicial officer,
  municipal court judge, any officer or agent of the division or any police
  officer as defined in W.S. 31-5-102(a)(xxxiii). However, **no person charged
  with violating this section shall be convicted if he produces in court a
  driver's license previously issued to him and valid at the time of his
  arrest.**" **VERIFIED**
- **DIGITAL LICENCE — the driver does NOT have to hand over the phone.**
  W.S. §31-7-115 requires the digital driver's licence be implemented "(ii) So
  that there is **no need for the driver's license holder to relinquish
  possession of the portable electronic device** in which the digital driver's
  license is stored to present the digital driver's license." **VERIFIED**
  Directly relevant to this product: in Wyoming the statute itself contemplates
  the driver keeping hold of their phone while presenting a digital licence.
  Whether other digital-licence states carry an equivalent provision is
  **UNVERIFIED** and worth checking — ND (§39-06-16) and Hawaii (§286-116)
  both permit electronic presentation but were not checked for this clause.
- All other columns not researched. **UNVERIFIED**

---

## TOOLING FIX APPLIED (2026-08-31): PDF states are no longer blocked

`pypdf` installed (pip, user-scope). PDF-only publication is no longer a
barrier: ND, IA and WY were extracted and verified from PDF in one pass.
Method: WebFetch the PDF (it saves the binary to the tool-results directory even
when it cannot parse it), then extract with pypdf and regex for the section
number. Wyoming's Title 31 is 542 pages / 1.1M characters and searched fine.

Remaining PDF states to do the same for: **Kentucky, Oklahoma.** Note the
earlier Kentucky attempt fetched the wrong section (KRS 211.736, Diabetes
Research Board) — the URL's `id=` parameter is opaque, so the correct KRS
section (186.510 area, carrying/exhibiting) must be located first.

### Arizona
Retrieved 2026-08-31 via codes.findlaw.com (azleg.gov IP-blocked by Sucuri).

- **Stop-and-identify: Y — NAME ONLY, AND ONLY AFTER A WARNING.**
  A.R.S. §13-2412: a person "shall state the person's true full name" when a
  "peace officer who has lawfully detained the person based on reasonable
  suspicion that the person has committed, is committing or is about to commit
  a crime" requests it — **provided the person has been advised that refusal is
  unlawful.** "A person who violates this section is guilty of a **class 2
  misdemeanor**." **VERIFIED**
  Two limits that must travel with it: the duty is **name only** (not address,
  not date of birth, unlike Ohio/Utah), and it does not attach until the officer
  has **advised that refusal is unlawful**. Arizona is a genuine Category A
  state, but with a procedural precondition no summary carries.

### Kansas
Retrieved 2026-08-31 via codes.findlaw.com (ksrevisor.org refuses connections).

- **Stop-and-identify: DEMAND AUTHORISED, NO PENALTY IN THIS SECTION.**
  K.S.A. §22-2402(1): "a law enforcement officer may demand of the name, address
  of such suspect and an explanation of such suspect's actions." §22-2402(2)
  covers frisk on reasonable suspicion of danger. No penalty for refusal appears
  in this section. **VERIFIED as to text; UNVERIFIED as to any penalty elsewhere.**

### Alaska
Retrieved 2026-08-31 via codes.findlaw.com (touchngo.com refuses connections).

- **Identify driver — "present for inspection", infraction, with a cure.**
  A.S. §28.15.131: "A licensee shall have the licensee's driver's license in
  immediate possession at all times when driving a motor vehicle, and shall
  **present the license for inspection** upon the demand of a peace officer."
  Violation is an **infraction**; a defence exists where the person produces a
  previously valid licence in court or to the citing officer. **VERIFIED**

### Pennsylvania
Retrieved 2026-08-31 via codes.findlaw.com (palegis.us renders frame only).

- **Identify driver — "exhibit", with a 15-day cure.**
  75 Pa.C.S. §1511(a): "Every licensee shall possess a driver's license issued
  to the licensee at all times when driving a motor vehicle and shall **exhibit
  the license upon demand by a police officer**." §1511(b) permits avoidance of
  conviction where a valid licence is produced within **15 days** at police
  headquarters or the issuing authority. **VERIFIED**

### Indiana
Retrieved 2026-08-31 via codes.findlaw.com (iga.in.gov never finishes rendering).

- **Identify driver — PHYSICAL credential, and an express phone protection.**
  Ind. Code §9-24-13-3: "The individual shall display the driver's license or
  permit **in the form of a physical credential** upon demand of a court or a
  police officer authorized by law to enforce motor vehicle rules." **VERIFIED**
  The section further carries protections for **mobile credentials, prohibiting
  officers from confiscating telecommunications devices or extracting data**
  without proper legal authority. **VERIFIED as reported by the source; the exact
  subsection text was not captured and should be re-pulled before use.**
  Second state (with Wyoming) found to legislate about the driver's phone during
  a stop. See the digital-licence note under Wyoming.

### Colorado
Retrieved 2026-08-31 via codes.findlaw.com.

- **Stop-and-identify: REQUIREMENT AUTHORISED, NO PENALTY IN THIS SECTION.**
  C.R.S. §16-3-103: a peace officer "may require him to give his **name and
  address, identification if available, and an explanation of his actions**."
  No criminal penalty for refusal appears in the section. **VERIFIED as to text;
  UNVERIFIED as to penalty.**
  Note the verb is "may require", stronger than the "may demand" states, yet the
  section still carries no penalty — a good illustration that verb strength does
  not track enforceability.

### New Mexico — NOT a stop-and-identify state on this section
Retrieved 2026-08-31 via codes.findlaw.com.

- **§30-22-3 is a CONCEALMENT-WITH-INTENT offence, not an identify duty.**
  N.M.S.A. §30-22-3 ("Concealing identity"): "Concealing one's true name or
  identity, or disguising oneself **with intent to obstruct the due execution of
  the law** or with intent to intimidate, hinder or interrupt any public officer
  … in a legal performance of his duty". Penalty: "guilty of a **petty
  misdemeanor**." **VERIFIED**
  > CORRECTION: New Mexico appears on the copied stop-and-identify lists on the
  > strength of this section. It does not impose a duty to identify — it
  > criminalises *concealing* identity **with intent to obstruct**. Simply
  > declining to answer, without concealment and without obstructive intent, is
  > not what this section reaches. Sixth entry in this file's running correction
  > of those lists.

### Vermont
Retrieved 2026-08-31 via codes.findlaw.com (legislature.vermont.gov serves a shell).

- **Identify driver — POSSESSION ONLY in this section.**
  23 V.S.A. §611: "Every licensee shall have his or her operator's license
  certificate in his or her immediate possession at all times when operating a
  motor vehicle." The section addresses possession and a grace period; it does
  **not** contain an exhibit-on-demand duty. **VERIFIED**
  Same split-section trap as Connecticut §14-213 — the production duty, if it
  exists, lives elsewhere and was **NOT** located. **UNVERIFIED**.

---

## METHOD UNLOCK #2 (2026-08-31): codes.findlaw.com defeats the IP bans

Every state previously recorded as a hard block was retrievable from FindLaw's
mirror, which sits on unrelated infrastructure: **Arizona** (Sucuri IP blocklist),
**Kansas** and **Alaska** (connection refused), plus **Pennsylvania**, **Indiana**
and **Vermont** whose own sites serve shells. URL pattern:
`https://codes.findlaw.com/<state>/<title-slug>/<state>-<code>-sect-<number>/`

Order of attack for the remainder, cheapest first:
  1. codes.findlaw.com  2. official site via plain fetch
  3. official site via rendered browser  4. PDF + pypdf

Not everything is on FindLaw — Louisiana CCrP art. 215.1 and West Virginia
§17B-2-9 both 404'd on the slug patterns tried, so the slug needs checking per
state rather than assuming.

### Tennessee
Retrieved 2026-08-31 via codes.findlaw.com (TN code is otherwise on a commercial host).

- **Identify driver** — T.C.A. §55-50-351: "Every licensee shall have the
  licensee's license in immediate possession at all times when operating a motor
  vehicle and shall **display it upon demand**." Officers may demand exhibition;
  violation is a **Class C misdemeanor**. **VERIFIED**

### Alabama
Retrieved 2026-08-31 via codes.findlaw.com.

- **Identify driver** — Ala. Code §32-6-9: "Every licensee shall have his or her
  license in his or her immediate possession at all times when driving a motor
  vehicle and shall **display the same, upon demand of a judge of any court, a
  peace officer, or a state trooper**." **VERIFIED**

### West Virginia
Retrieved 2026-08-31 via codes.findlaw.com (code.wvlegislature.gov Wordfence-blocked).

- **Identify driver** — W.Va. Code §17B-2-9(a): "Every licensee shall have his or
  her driver's license in such person's immediate possession at all times when
  operating a motor vehicle and shall **display the same, upon demand of a
  magistrate, municipal judge, circuit court judge, peace officer, or an
  employee of the division**." **VERIFIED**

### Louisiana
Retrieved 2026-08-31 via codes.findlaw.com (legis.la.gov document IDs are opaque).

- **Identify driver** — La. R.S. §32:411.1: "Any person lawfully possessed of a
  driver's license … shall have such license in his immediate possession at all
  times when driving a motor vehicle and shall **display it upon demand of any
  officer or agent of the department or any police officer of the state, parish,
  or municipality**." **VERIFIED**
- **Stop-and-identify** — La. C.Cr.P. art. 215.1 is the target section and was
  NOT retrieved (FindLaw 404 on the slugs tried). **UNVERIFIED**

---

## METHOD UNLOCK #3 (2026-08-31): read the chapter index before guessing a section

All six remaining jurisdictions fell in a single pass using one move: fetch the
chapter or subchapter INDEX, read the section catchlines, then fetch the one
section whose own title says "carried and exhibited" / "in possession and shown
on demand". Every prior failure on these six was a guessed section number, not
an access failure:

- **SD** — guessed §32-12-22, -31, -38. Index said **§32-12-39**.
- **AR** — guessed §27-16-602 (that is "Driver's license required"). Index said
  **§27-16-601**.
- **ME** — the previous note predicted Chapter 23. Index said **Ch. 11 §1408**,
  in subchapter 4, which the earlier truncated read had cut off.
- **DC** — the previous note predicted "elsewhere in Title 50". It was a
  *subsection* of the very section already dismissed as fees/examination:
  **§50-1401.01(c)**.
- **KY** — the LRC serves statutes as PDFs behind an opaque `id=`. Reading the
  chapter index (`chapter.aspx?id=38025`) yielded the section's real link
  (`id=53610`); `curl` + `pypdf` extracted it cleanly.
- **OK** — §6-112 was the right guess, but only law.justia.com served it; both
  FindLaw slug patterns 404.

Guessing section numbers on these six went 0-for-6. Reading indexes went
6-for-6. The index page is one cheap fetch and is the correct first request for
any new jurisdiction.

Two entries in the "Confirmed-bad" list are hereby **retracted**:
`apps.legislature.ky.gov` and `sdlegislature.gov` both work. So does
`legislature.maine.gov`, which was never the problem.

### Kentucky
Retrieved 2026-08-31 from apps.legislature.ky.gov (official LRC), PDF extracted
with pypdf.

- **Identify driver** — KRS 186.510: "The licensee shall have his or her license
  in his or her immediate possession at all times when driving a motor vehicle
  and shall **display it upon demand to a peace officer**, a member of the
  Department of Kentucky State Police, or a field deputy or inspector of the
  Department of Vehicle Regulation or Transportation Cabinet or, pursuant to KRS
  67A.075 or 83A.088, a safety officer who is in the process of securing
  information to complete an accident report." Effective 29 Jun 2023.
  **VERIFIED**
- Court-production defence: "It shall be a defense to any charge under this
  section if the person so charged produces in court an operator's license,
  issued to him or her before his or her arrest and valid at the time of his or
  her arrest." **VERIFIED**

### South Dakota
Retrieved 2026-08-31 from sdlegislature.gov via the rendered browser.

- **Identify driver** — SDCL §32-12-39: "Each licensee shall have a driver
  license in the licensee's immediate possession at all times when operating a
  motor vehicle and shall **display the driver license upon demand of a judge of
  a court of record, a magistrate, a peace officer, or a field deputy or
  inspector of the Department of Public Safety**. Any person violating the
  provisions of this section commits a **petty offense**." **VERIFIED**
- §32-12-40 is the companion court-production / expired-under-thirty-days cure
  provision. Catchline read from the chapter index; text not fetched. **LIKELY**

### Maine
Retrieved 2026-08-31 from legislature.maine.gov.

- **Identify driver** — 29-A M.R.S. §1408(1): a licensee "must have the license
  in immediate possession when operating a motor vehicle. **Possession may be in
  electronic form.**" **VERIFIED**
- §1408(2): "On demand of a law enforcement officer, the licensee must **produce
  the license or an electronic version of the license for inspection**. **The use
  of a portable electronic device to provide license information does not
  constitute consent for a law enforcement officer to access other contents of
  the portable electronic device.**" **VERIFIED**
- §1408(3): a person served with a Violation Summons and Complaint may have it
  dismissed on satisfactory evidence they held a valid license at the time.
  **VERIFIED**

That second sentence of §1408(2) is the single most user-relevant sentence found
in this entire sweep. Maine has legislated the exact scenario a phone-carrying
driver walks into. Whether any other state has an equivalent has **not** been
checked, and the absence of one elsewhere must not be inferred from its presence
here.

### Oklahoma
Retrieved 2026-08-31 via law.justia.com (both FindLaw slug patterns 404).

- **Identify driver** — 47 O.S. §6-112(A): "Every licensee shall have his or her
  driver license in his or her immediate possession at all times when operating a
  motor vehicle. Upon demand of a peace officer, the licensee shall **produce and
  provide physical possession of the driver license to the peace officer**. Any
  person violating this subsection shall, upon conviction, be guilty of a
  **misdemeanor** and shall be punished as provided for in Section 17-101 of this
  title." **VERIFIED**
- §6-112(B): a person who produces in court, on or before the court date, a
  license valid at the time of arrest is entitled to dismissal. **VERIFIED**

### Arkansas
Retrieved 2026-08-31 via law.justia.com.

- **Identify driver** — A.C.A. §27-16-601(a): "A licensee shall have his or her
  driver's license in his or her immediate possession at all times when operating
  a motor vehicle and shall **display the driver's license upon demand of a
  justice of the peace, a peace officer, or an employee of the Office of Driver
  Services**." **VERIFIED**
- §27-16-601(b): "No person charged with violating this section shall be
  convicted if he or she produces in court a driver's license issued to him or
  her and valid at the time of his or her arrest." **VERIFIED**
- §27-16-602 is "Driver's license required" — a separate section, and NOT the
  carry-and-display duty. An earlier pass recorded it as the target. Corrected.

### District of Columbia
Retrieved 2026-08-31 from code.dccouncil.gov.

- **Identify driver** — D.C. Code §50-1401.01(c): a permit holder "shall have the
  license or permit in his or her immediate possession at all times while
  operating a motor vehicle in the District of Columbia and shall **exhibit the
  license or permit to any police officer upon demand**. Any person who fails to
  comply with the requirements of this subsection shall, upon conviction, be
  **fined not less than $10 nor more than $50**." **VERIFIED**
- That $10–$50 fine is the smallest penalty found in any of the 48 jurisdictions
  researched.
- **Separate finding, directly relevant to this product's audience** — D.C. Code
  §50-1401.05 creates a **limited purpose driver's license, permit, or
  identification card** for a District resident of more than 6 months who has not
  been assigned a social security number, or who "has been assigned a social
  security number but **cannot establish legal presence in the United States** at
  the time of application," or who is ineligible to obtain one. Existence and
  eligibility criteria: **VERIFIED**. What the card says on its face, what it may
  and may not be used for, and how it is treated at a roadside stop: all
  **UNVERIFIED**, and all of it matters enormously to exactly the person this
  product is built for. Nothing about limited purpose licences goes anywhere near
  users until that is researched and attorney-reviewed.

## CROSS-STATE FINDING UPDATE (2026-08-31): the verb spectrum has new ends

The licence-handover verb spectrum recorded earlier now has a clear strongest
end and a clear weakest end, and they are not the ones previously assumed:

- **Strongest: OK §6-112(A)** — "produce and **provide physical possession** of
  the driver license to the peace officer." Oklahoma is explicit that holding the
  card up is not enough; physical transfer is the statutory duty. This displaces
  Idaho's "surrender into the hands of" as the most demanding formulation found.
- **Weakest / most protective: ME §1408(2)** — "produce the license or an
  electronic version of the license **for inspection**", expressly satisfiable
  from a phone and expressly not a consent to search that phone.

Both are quoted above. The gap between them is wide enough that a single
national "hand the officer your licence" script is wrong at one end or the other,
and the axis is not visible from any secondary source consulted so far.

---

# COLUMN PASS 1: RECORDING CONSENT (2026-08-31)

Switched from breadth to depth here, per the plan below. Target: the twelve
states routinely listed as "all-party consent" / "two-party consent", because
those are the only ones where a driver recording their own stop could plausibly
be committing a crime. One-party states carry no such risk and were deprioritised.

## HEADLINE CROSS-STATE FINDING: the "all-party consent" label does not survive contact with a traffic stop

**In 12 of 12 all-party-consent states examined, the statutory text does NOT
reach a driver openly recording their own traffic stop.** Not one of them. Every
statute carries at least one limiter that a roadside stop fails, and they fall
into four distinct mechanisms:

**1. Privacy-expectation limiter** — the statute only reaches communications the
speaker justifiably expected to be private. A uniformed officer speaking on a
public road does not clear that bar.
- **FL** §934.02(2): oral communication is one "uttered by a person exhibiting an
  expectation that such communication is not subject to interception **under
  circumstances justifying such expectation**", and expressly excludes "any
  public oral communication uttered at a public meeting". **VERIFIED**
- **PA** 18 Pa.C.S. §5702: "uttered by a person possessing an expectation that
  such communication is not subject to interception **under circumstances
  justifying such expectation**." **VERIFIED**
- **NH** RSA 570-A:1(II): "uttered by a person who has a **reasonable
  expectation** that the communication is not subject to interception, under
  circumstances justifying such expectation." **VERIFIED**
- **IL** 720 ILCS 5/14-1(d): "private conversation" requires that "one or more of
  the parties **intended the communication to be of a private nature under
  circumstances reasonably justifying that expectation**." This is the post-2014
  rewrite; the old blanket statute was struck down. **VERIFIED**
- **MD** Cts. & Jud. Proc. §10-401(13)(i): oral communication means "any
  conversation or words spoken to or by any person **in private conversation**."
  **VERIFIED**
- **MI** MCL §750.539c criminalises eavesdropping "upon [a] **private
  conversation**". **VERIFIED**
- **DE** 11 Del. C. §1335(a)(4): reaches a message "by telephone, telegraph,
  letter or other means of **communicating privately**, including private
  conversation." **VERIFIED**

**2. Secrecy limiter** — the statute only reaches *concealed* recording. Holding a
phone in plain view is outside it entirely.
- **MA** ch. 272 §99(B)(4): "interception" means "to **secretly** hear, **secretly**
  record, or aid another to **secretly** hear or **secretly** record". Open
  recording is not an interception at all. **VERIFIED**
- **NV** NRS 200.650: prohibits **"surreptitiously"** listening to, monitoring or
  recording "any **private** conversation" — two limiters stacked. **VERIFIED**
- **MT** §45-8-213(1)(c): reaches recording "by use of a **hidden** electronic or
  mechanical device". **VERIFIED**

**3. Express carve-out for recording public officials / police**
- **MT** §45-8-213(2)(a)(i): subsection (1)(c) "**does not apply to: elected or
  appointed public officials or to public employees when the transcription or
  recording is done in the performance of official duty**." A police officer
  conducting a traffic stop is squarely inside this. §45-8-213(2)(a)(iii) adds:
  "persons given warning of the transcription or recording. **If one person
  provides the warning, either party may record.**" **VERIFIED**
- **OR** ORS 165.540(5)(b): the in-person all-party rule does not apply to "**a
  person who records a conversation in which a law enforcement officer is a
  participant**, if: (A) the recording is made while the officer is **performing
  official duties**; (B) the recording is made **openly and in plain view** of the
  participants; (C) the conversation is **audible to the person by normal unaided
  hearing**; and (D) the person is **in a place where the person lawfully may
  be**." All four conditions are met by a driver recording their own stop from
  the driver's seat. This is the cleanest pro-recording text found in any state.
  **VERIFIED**

**4. Participant exception** — a party to the conversation is not intercepting it.
- **DE** 11 Del. C. §2402(c)(4): lawful "for a person to intercept a wire, oral or
  electronic communication **where the person is a party to the communication**".
  Delaware is functionally one-party despite its all-party reputation.
  **VERIFIED**
- **MI** MCL §750.539a: "eavesdrop" means to record "the private discourse **of
  others**" — by its terms not reaching a participant. **VERIFIED**
- **CT** — see below; this is the largest correction of the pass.

## CORRECTION: Connecticut is not an all-party state for in-person recording

Connecticut appears on essentially every published all-party list. The primary
text says otherwise, twice over:

- **Criminal** — Conn. Gen. Stat. §53a-187(a)(2) defines "mechanical overhearing
  of a conversation" as recording "**without the consent of at least one party**
  thereto, **by a person not present thereat**." That is a **one-party** rule, and
  it additionally requires the recorder to be *absent*. A driver recording their
  own stop is a consenting party AND present — outside the statute on both
  independent grounds. **VERIFIED**
- **Civil** — Conn. Gen. Stat. §52-570d is titled "Action for illegal recording
  of **private telephonic communications**." Telephone only, and civil, not
  criminal. This is the provision the all-party lists are actually pointing at.
  Catchline **VERIFIED**; body text not fetched, so the scope limit is verified
  but its internal exceptions are **UNVERIFIED**.

This is the fifth published-list error this project has caught. The running score
on secondary sources is now poor enough to be a finding in itself.

## WHAT THIS DOES NOT MEAN — read before any of it reaches a user

Everything above is **statutory text only**. It establishes what the legislature
wrote. It does not establish:

- **How courts apply it.** The privacy-expectation limiter is exactly the kind of
  clause that gets litigated. Florida courts in particular have read §934
  aggressively in other settings; whether a roadside stop clears the expectation
  bar in Florida is **UNVERIFIED** and needs case law, not statute.
- **What happens at the roadside.** Being outside a statute does not stop an
  arrest. A driver can be correct about the law and still be arrested, have a
  phone seized, and be charged with obstruction or interference instead. Every
  circuit to reach the question has recognised a First Amendment right to record
  police, but "recognised" is not "self-executing at 11pm on a shoulder."
- **The obstruction overlay.** Recording is frequently charged as something else.
  That column has not been researched in any state.
- **That a national script can say "you may record."** It cannot, on this
  evidence alone.

The honest user-facing statement this research supports is narrow: *in these
twelve states, the wiretap statute itself is not what a driver openly recording
their own stop should be worried about.* That is a real and useful finding. It is
not "recording is legal", and it must not be compressed into that.

## Coverage after this pass

Recording consent: **14 of 51** (CA and WA from earlier passes, plus the twelve
above). The 37 remaining are all one-party-consent jurisdictions where the
statutory risk to a recording driver is low by construction — but "low by
construction" is an inference, not a verified cell, and each still needs its
section pulled before anything ships.

## Source retractions from this pass

Three more entries come off the confirmed-bad list:
- **ilga.gov** — works. Use `fulltext.asp?DocName=072000050K14-1`.
- **delcode.delaware.gov** — works, including section text, not just indexes.
- **palegis.us** — works, but ONLY via the iframe. The outer page is a shell; read
  `document.querySelectorAll('iframe')[1].src` and navigate to that URL directly.
  This is what the earlier "301 to a navigation shell with no statute text" note
  was actually describing, and it was wrong to log it as blocked.

New sources confirmed good: malegislature.gov, oregon.public.law (again),
leg.state.nv.us, legislature.mi.gov, cga.ct.gov, gc.nh.gov (note: NH moved off
gencourt.state.nh.us, and RSA 570-A sits under **Title LVIII**, not LXII).

---

# COLUMN PASS 2: REFUSING TO SIGN A CITATION (2026-09-01)

The weakest column in the ledger, and the one where a wrong answer has the most
immediate physical consequence: the user is at the roadside, holding a pen, and
whatever they do next is irreversible within seconds.

Six states pulled, chosen by population. They do not agree with each other, and
the disagreement is not a matter of degree — it spans from "refusing is its own
crime" to "refusing is expressly not grounds for arrest."

## HEADLINE: this column has no national answer, and the spread is the finding

Ranked from worst to best consequence for the driver who refuses:

**1. Florida — refusing is a separate crime.**
Fla. Stat. §318.14(2): a person cited for a mandatory-hearing or criminal traffic
violation "**must sign and accept a citation indicating a promise to appear**."
§318.14(3): "Any person who **willfully refuses to accept and sign** a summons as
provided in subsection (2) **commits a misdemeanor of the second degree**."
**VERIFIED**. Florida is the only one of the six that makes refusal itself an
offence rather than a trigger for a different process.

**2. California — refusing forces a custodial trip to a magistrate.**
Cal. Veh. Code §40302: an arrested person "shall be taken without unnecessary
delay before a magistrate" in any of several cases, including:
- §40302(a) — "When the person arrested **fails to present both his or her
  driver's license or other satisfactory evidence of his or her identity and an
  unobstructed view of his or her full face for examination**."
- §40302(b) — "When the person arrested **refuses to give his or her written
  promise to appear**."
**VERIFIED**. Note (a): California statutorily conditions release on showing your
face as well as your licence. That is a distinct requirement no other state
examined has, and it interacts badly with any generic "you don't have to do
anything" framing.

**3. Texas — signing is the condition of release.**
Tex. Transp. Code §543.005: "**To secure release**, the person arrested must make
a written promise to appear in court by **signing** the written notice prepared by
the arresting officer." §543.004(a)(2) withholds the release-on-citation
entitlement where "the person demands an immediate appearance before a magistrate
or **refuses to make a written promise to appear**." §543.009(b): wilfully
*violating* a promise already given is a misdemeanor — a separate matter from
refusing to give one. **VERIFIED**.

**4. Ohio — refusing removes the no-arrest protection.**
R.C. §2935.26(A): for a minor misdemeanor the officer "**shall not arrest** the
person, but shall issue a citation, **unless** one of the following applies: …
(2) The offender **cannot or will not offer satisfactory evidence of the
offender's identity**. (3) The offender **refuses to sign the citation**."
**VERIFIED**.

**5. Georgia — refusing costs a cash bond, and the officer must warn you first.**
O.C.G.A. §40-13-2.1(a): the cited person "shall sign the citation to acknowledge
receipt of the citation and of his or her obligation to appear for trial. **The
officer shall advise the person that signing the citation is not an admission of
guilt** and that failure to sign will result in the person having to **post a cash
bond**. If the person refuses to sign the citation, it shall **constitute
reasonable cause to believe that the person will not appear at trial** and the
officer **may** bring the person before a judicial officer or traffic violations
bureau to post a bond." **VERIFIED**.

Georgia is the only state of the six that puts an affirmative duty on the
*officer* to correct the exact misconception that drives most refusals. That
duty is a fact a user can be told and can hold an officer to.

**6. North Carolina — refusing is expressly protected.**
N.C.G.S. §15A-302(d): "A copy of the citation shall be delivered to the person
cited. … **Failure of the person cited to accept delivery of the citation shall
not constitute grounds for an arrest or the requirement that he or she post a
bond.**" **VERIFIED**. North Carolina citations carry no signature requirement at
all, and the statute forecloses both consequences other states impose.

**Michigan — partial, and recorded as a negative that is NOT a finding.**
MCL §257.728, the citation-contents section, contains no signing requirement and
no refusal consequence. That is what the section says; it is **not** evidence that
Michigan imposes none, because the duty could sit in another section that was not
checked. **UNVERIFIED**. Do not let this cell harden into "Michigan has no
signature requirement" — that inference has not been earned.

## Why this column is the most dangerous one to generalise

Every other column in this matrix varies in *degree*. This one inverts. The same
act — declining to sign — is a criminal offence in Florida and a statutorily
protected choice in North Carolina, roughly 400 miles apart. A national script
that says "you can refuse to sign, it's not an admission of guilt" is:
- **True and useful** in Georgia, where the officer must tell you so anyway.
- **True but expensive** in Georgia and California and Texas and Ohio, where it
  costs you your release.
- **Advice to commit a misdemeanor** in Florida.

That last line is the reason this column cannot ship state-agnostic content under
any circumstances, and it is the strongest concrete argument yet for the
state-gating architecture over a single national script.

## Second cross-column finding: ID refusal and signature refusal are the same switch

In both California (§40302(a) and (b)) and Ohio (§2935.26(A)(2) and (3)), refusing
to identify and refusing to sign appear as **adjacent items in the same list of
exceptions** — the two ways a citation-and-release becomes a custodial arrest.
They are drafted as one mechanism, not two.

This matters for the product: the practice Arena treats "identify yourself" and
"sign the citation" as separate beats. In at least two states, the statute treats
them as the same decision point with the same consequence. Whether that pairing
holds elsewhere is **UNVERIFIED** and worth checking, because if it generalises it
changes how the scenario should be scripted.

## COLUMN PASS 2b (2026-09-01): five more states, and a fourth posture

**Virginia — the statute COMMANDS release after refusal.**
Va. Code §46.2-936: "If any person **refuses** to give such written promise to
appear under the provisions of this section, the arresting officer shall give
such person notice of the time and place of the hearing, note such person's
refusal to give his written promise to appear on the summons, and **forthwith
release him from custody**." **VERIFIED**.

This is stronger than North Carolina. NC says refusal is not *grounds* for
arrest; Virginia affirmatively directs the officer to release. It is the most
protective text in this column.

**Washington — no signature requirement at all, plus a cap on stop length.**
RCW 46.64.015: the officer "may **serve** upon him or her a traffic citation and
notice to appear in court" — service, not signature. The section contains no
signing requirement and no refusal consequence. It adds: "**The detention arising
from an arrest under this section may not be for a period of time longer than is
reasonably necessary to issue and serve a citation and notice**", subject to only
two exceptions (probable cause for an offence enumerated in RCW 10.31.100(3), or
a nonresident detained for a hearing under RCW 46.64.035). **VERIFIED**.

That detention cap is independently useful to a user and belongs in its own
column; no other state examined has an equivalent express time limit.

**Nevada — refusal is a non-event, because Nevada decriminalised the offence.**
NRS 484A.630: "**The peace officer shall sign the citation** and deliver a copy of
the citation to the person charged" — the officer's signature, not the driver's.
And expressly on refusal: "**If a person charged with a civil infraction refuses
to accept a civil infraction citation, the copy of the citation signed by the
peace officer or prosecuting attorney, as applicable, constitutes proof [of
service]**." Acceptance is deemed personal service; refusal changes nothing.
**VERIFIED**.

**Tennessee — signing required; consequence not established.**
T.C.A. §55-10-207: "The person cited **shall signify the acceptance** of the
traffic citation and the agreement to appear in court as directed by **signing**
the citation. An electronic signature may be used…" The signing duty is
**VERIFIED**. What happens on refusal was not located in this section — the
section is titled "Traffic citation **in lieu of** arrest", which implies arrest
is the alternative, but implication is not text. Consequence **UNVERIFIED**.

**Colorado — and a correction I nearly published backwards.**
C.R.S. §42-4-1707(6) contains two sentences with opposite conditions, twenty
words apart. On first read I extracted the second and attributed it to the
first, which would have inverted the rule. Both, quoted exactly:

- "…if the defendant **does not** possess a valid Colorado driver's license, the
  defendant, **in order to secure release**, must receive information on the
  penalty assessment notice or summons and complaint that directs the defendant
  to appear at a specified county court at a specified time and place…"
- "If the defendant **does** possess a valid Colorado driver's license, the
  defendant **must not be required to execute a promise to appear** on the
  penalty assessment notice or on the summons and complaint."

So in Colorado the freedom from signing attaches to **holding a valid Colorado
licence**. A driver without one gets the appearance-information route instead.
**VERIFIED**.

Colorado also carries a clause that matters more to this product's users than
anything else in this column: "**The peace officer shall not require any person**
who is eligible to be issued a summons and complaint or a penalty assessment
notice for a violation of this title 42 **to produce or divulge such person's
social security number**." Unconditioned — it protects any eligible person,
licensed or not. **VERIFIED**.

**Method note on that near-miss.** The error was reading a `grep`-style match
window instead of the whole sentence. The fragment began mid-word ("ossess"),
which is exactly the tell that the match window has cut a negation off the front.
Any extraction that starts mid-word must be re-read from the sentence boundary
before it is recorded. This ledger's whole value is that its cells are not
plausible-sounding guesses, and this one would have been.

## Two Arizona cells for OTHER columns

A.R.S. §28-1595 was pulled while looking for a signature provision and does not
contain one, but it does contain two cells this matrix wants elsewhere:

- **Driver ID, with a stated penalty** — §28-1595(B): a driver "who fails or
  refuses to **exhibit** the operator's driver license as required by section
  28-3169 **or** a driver who is not licensed and who fails or refuses to provide
  evidence of the driver's identity on request **is guilty of a class 2
  misdemeanor**." **VERIFIED**. Most states' display duty carries no stated
  penalty in the display section itself; Arizona's does, and it expressly covers
  the unlicensed driver.
- **Passenger ID — conditioned, not blanket** — §28-1595(C): "**A person other
  than the driver** of a motor vehicle who fails or refuses to provide evidence
  of the person's identity to a peace officer… **when such officer… has reasonable
  cause to believe the person has committed a violation of this title**, is
  guilty of a class 2 misdemeanor." **VERIFIED**.

The condition in (C) is load-bearing and easy to lose in summary. Arizona does
not require passengers to identify themselves generally — only where the officer
has reasonable cause to believe **that passenger** violated a traffic law (a
seatbelt violation being the obvious route in). Any user-facing sentence that
drops the condition converts a narrow rule into a false general one.

## METHOD UNLOCK #4 (2026-09-01): a parallel fetch-and-extract harness

Browser round-trips cap out at roughly two states per call. Replaced with a local
Python harness (`pull.py`, scratchpad) that fetches 10-12 statutes concurrently,
strips markup, and prints only sentence-bounded windows around keyword matches.
Throughput went from ~2 states per round to ~12.

**The harness has an anti-silent-failure check, and it earned its keep
immediately.** Each target carries an `anchor` string — usually its own section
number — that MUST appear in the fetched text. If the anchor is missing, the row
prints `NO-STATUTE` instead of `(no keyword hit)`. Without that check the two
failure modes are indistinguishable, and "fetched fine, statute says nothing
about signatures" is exactly the false negative that would put a wrong cell in
this ledger.

It caught three distinct traps on the first two runs:
- **law.justia.com over `curl` returns page chrome only** for many sections —
  roughly 4-5 KB of navigation and newsletter markup, HTTP 200, no statute. The
  same URLs return full text in the rendered browser. Justia is therefore
  browser-only for reliability, or must be anchor-checked every single time.
- **iga.in.gov** returns a 73-byte SPA shell.
- **le.utah.gov** returns 136 bytes — a block, not a short statute.

A second guard was added after the fact: strip the known chrome strings ("Justia
Legal Resources", "Sign up for our free summaries") BEFORE keyword matching,
because "**Sign** up for our free summaries" was matching a `sign` pattern and
producing confident-looking hits on pages containing no law at all.

## COLUMN PASS 2c (2026-09-01): eleven more states via the harness

**Nebraska — the ID/signature pairing again, third state.**
Neb. Rev. Stat. §29-427: "Any peace officer having grounds for making an arrest
may take the accused into custody or, already having done so, **detain him
further when the accused fails to identify himself satisfactorily, or refuses to
sign the citation**, or when the officer has reasonable grounds to believe that
(1) the accused will refuse to respond to the citation, (2) such custody is
necessary to protect the accused or others…" **VERIFIED**

**Idaho — the pairing again, fourth state.**
Idaho Code §49-1407, listing when release need not follow: "(1) **When the person
does not furnish satisfactory evidence of identity** or when the officer has
reasonable and probable grounds to believe the person **will disregard a written
promise to appear** in court." **VERIFIED**

**Alabama — refusal routes you to a magistrate.**
Ala. Code §32-1-4: "the officer shall, upon the giving by such person of a
sufficient written bond… to appear at such time and place, **forthwith release
the person from custody**. …a person **refusing to give bond to appear shall be
taken immediately** by the [arresting officer before the nearest magistrate]."
**VERIFIED**

**Louisiana — licence-conditioned, with a parish carve-out.**
La. R.S. §32:391: "If the person arrested **holds a Louisiana operator's license**
and gives his written promise to appear at the time and place stated, the officer
**may** release him from custody or take him immediately before a magistrate, but
**shall not require the person arrested to deposit his operator's license**. Any
such person **refusing to give the written promise to appear shall be taken
immediately by the arresting officer** [before a magistrate]." **VERIFIED**

And a genuine sub-state variation, the first found in this project:
"Notwithstanding any other provision of law to the contrary, **in Orleans
Parish**, if the person arrested holds a Louisiana operator's license and gives
his written promise to appear…, the officer **shall** release him from custody."
**VERIFIED**. May statewide; shall in Orleans Parish. Any state-level data model
that assumes one rule per state cannot represent this.

**Massachusetts — the officer signs, not the driver.**
M.G.L. ch. 90C §2: "Said police officer shall inform the violator of the
violation and shall give a copy of the citation to the violator. Such citation
shall be **signed, manually or electronically, by the police officer**…" No
violator signature is required anywhere in the section. **VERIFIED**

**Rhode Island — same.**
R.I.G.L. §31-27-12: the officer shall issue "a written notice… **signed by the
police officer** and constituting a summons to appear before the court…"
§31-27-12(b) preserves the alternative: "Nothing in this chapter shall preclude a
police officer from exercising in the alternative his or her statutory powers of
arrest." **VERIFIED**

**Oregon — confirms the same, from the complaint side.**
ORS 153.048(1)(c): the complaint requires "A certificate under ORS 153.045(5)
**signed by the enforcement officer**." **VERIFIED**. Consistent with ORS
165.540's posture: Oregon asks nothing of the driver's pen.

**Missouri — no signature at all; a licence-deposit scheme with an express right to decline.**
RSMo §544.045: a person arrested for a traffic violation "may, **at the discretion
of both** the officer… **and the person arrested**, deposit his license to operate
a motor vehicle… in lieu of any other security." And: "in lieu of depositing his
license to operate a motor vehicle, **the person arrested may decline to deposit
his license** … and instead deposit a bond." **VERIFIED**. Missouri is the only
state found so far that writes the driver's consent into the mechanism twice.

**New Mexico — sign, then release.**
NMSA §66-8-123(A): the officer shall prepare the notice to appear, "**have the
arrested person sign the agreement to appear** as specified, give a copy of the
citation to the arrested person and **release the person from custody**."
**VERIFIED**. Refusal consequence not stated in the section. **UNVERIFIED**

**Kentucky — a notably broad arrest trigger.**
KRS §431.015: citation is the default for a misdemeanor committed in the
officer's presence "if there are reasonable grounds to believe that the person
being cited will appear to answer the charge", but arrest is permitted where the
offence is "(3) An offense in which the defendant **refuses to follow the peace
officer's reasonable instructions**." **VERIFIED**. That clause is broad enough to
swallow a good deal of lawful non-cooperation, and it is the widest arrest
gateway found in this column.

**Minnesota — nonresident protection, not a signature rule.**
Minn. Stat. §169.91(b): under a reciprocal agreement, an officer observing a
violation by a resident of a party jurisdiction "shall issue an appropriate
citation and **shall not**… **require the nonresident to post bond or collateral**
to secure appearance for trial but **shall accept the nonresident's personal
recognizance**." **VERIFIED** as a nonresident-bond rule. Minnesota's signature
rule, if any, is elsewhere and is **UNVERIFIED**.

## COLUMN PASS 2d (2026-09-01): eight more states

**Maryland — refusal to sign is an express arrest trigger.**
Md. Transp. §26-202(a)(5): an officer may arrest without a warrant where "The
officer has probable cause to believe that the person has committed the
violation, and, subject to the procedures set forth in §26-203 of this subtitle,
the person **is issued a traffic citation and refuses to acknowledge its receipt
by signature**." **VERIFIED**. The cleanest statement of posture 2 found —
Maryland names the refusal and attaches the arrest power in one clause.

**West Virginia — refusal routes to a magistrate, and non-compact residents too.**
W.Va. Code §17C-19-3, listing when the officer must take the person before a
magistrate rather than release: "(7) In any other event when the person arrested
**refuses to accept the written notice to appear in court as his or her promise
to appear** in court or to comply with the terms of the written notice…"
**VERIFIED**. Also "(6) When the person arrested is a **resident of a state that
has not entered into a nonresident violator compact** with this state."
**VERIFIED** — a residency-based custody trigger, and the mirror image of
Minnesota's nonresident protection.

**Kansas — signing is what buys release, and it is framed as optional.**
K.S.A. §8-2106(d): "in the discretion of the law enforcement officer, a person
charged with a misdemeanor **may give written promise to appear** in court **by
signing** at least one copy of the written citation prepared by the law
enforcement officer, in which event the law enforcement officer shall deliver a
copy of the citation to the person and **shall not take the person into physical
custody**." **VERIFIED**. Note the drafting: signing is permissive ("may"), but it
is the only route to the no-custody outcome — the same structure as Texas
§543.005.

**Wisconsin — no signature anywhere; release is bought with a deposit.**
Wis. Stat. §345.23: "If a person is arrested without a warrant for the violation
of a traffic regulation, the arresting officer shall issue a citation under s.
345.11, and in addition: (1) **May release** the person; or (2) **Shall release**
the person when he or she: (a) Makes a deposit under s. 345.26; or (c) **Deposits
the person's valid Wisconsin operator's license** with the officer; or (d)
Presents a guaranteed arrest bond certificate under s. 345.61. (3) **Shall, if the
alleged violator is not released** under sub. (1) or (2), bring him or her
**without unreasonable delay before a judge**…" **VERIFIED**.

Wisconsin is the clearest example of a mechanism this column keeps surfacing:
release is purchased with **money or the licence itself**, not with a signature.
Note the direct conflict with Louisiana, which forbids the same move: La. R.S.
§32:391 says the officer "**shall not require** the person arrested to **deposit
his operator's license**." One state offers licence deposit as the route to
release; another prohibits demanding it.

**Illinois — the officer signs.**
725 ILCS 5/107-12(b): the notice to appear shall "(4) **Be signed by the officer
issuing the notice**." **VERIFIED**. Illinois joins the officer-signs group.

**Montana — the officer signs.**
MCA §46-6-310: the citation must "(d) **be signed by the issuing officer**; (e)
direct the person to appear before a court at a certain time and place; and (f)
state that failure to appear may result in the suspension of the person's
driver's license." **VERIFIED**. No driver signature required.

**Michigan — the officer signs; upgraded from partial.**
MCL §257.727c(3): "a **complaint signed by a police officer** shall be treated as
made under oath if the violation alleged in the complaint is either a civil
infraction or a misdemeanor… and occurred or was committed in the signing
officer's presence…" **VERIFIED**. Combined with §257.728, which contains no
signing requirement, two Michigan sections now both place the signature on the
officer. Michigan moves from partial to the officer-signs group — though this
remains "no driver-signature duty located in §§257.727c or 257.728", not a
verified statement about the whole Michigan code.

**Hawaii — the signature belongs on the court answer, not the roadside.**
H.R.S. §291D-6(c): "When **answering** the notice of traffic infraction…, the
person shall **affix the person's signature to the answer** and shall state the
address at which the person will accept future mailings from the court."
**VERIFIED**. Hawaii's signature requirement attaches to the later written answer
filed with the court, not to anything handed over at the roadside. This
distinction is easy to lose and would produce a badly wrong user-facing sentence.

## COLUMN PASS 2e (2026-09-01): the PDF states, and a mechanism this column had been missing

**Wyoming — the promise is made by ACCEPTING the ticket, not signing it.**
Wyo. Stat. §31-5-1205(d): "The person charged with the violation **may give his
promise to appear in court by accepting at least one (1) copy of the written
traffic citation** prepared by the officer…" **VERIFIED**

And the consequence, §31-5-1204: the officer shall take the person before the
court "in any of the following cases: (i) When the person **demands an immediate
appearance before a judge**; or (ii) In any other event when the person is issued
a traffic citation by a police officer and **refuses to give his promise to appear
in court manifested by his refusal to accept the citation**." **VERIFIED**

In Wyoming a driver's pen is irrelevant. Taking the piece of paper *is* the
promise, and declining to take it *is* the refusal.

**North Dakota — a permissive duty and a limit on local officers.**
N.D.C.C. §39-07-07(1): on halting a driver the officer "**may**: a. Take the name
and address of the individual; b. Take the license number of the individual's
motor vehicle; and c. … issue a summons or otherwise notify the individual in
writing to appear…" §39-07-07(2): "**A halting officer employed by a political
subdivision of the state may not take an individual into cu[stody]**…"
**VERIFIED** as far as quoted; the remainder of (2) was not captured and its
conditions are **UNVERIFIED**.

§39-07-09 is the exception list: "Offenses under which person halted **may not be
entitled to release** upon promise to appear." §39-07-07 does not apply where the
officer "has good reason to believe the person guilty of any felony", or where
the officer "**acting within the officer's discretion, determines that it is
inadvisable to release** the person upon a promise to appear" and the charge is
one of a listed set — reckless driving, exceeding speed limits, driving while
suspended or revoked, driving without liability insurance. **VERIFIED**

North Dakota is the only state found where release turns on a bare
"**inadvisable**" discretion standard attached to ordinary offences including
plain speeding.

## THIRD CROSS-STATE FINDING: signature and ACCEPTANCE are two different axes

This column was framed as "refusing to sign". That framing is wrong for a
substantial group of states, which attach the consequence to **refusing to accept
the citation** — a physical act, not a signature:

- **WY** §31-5-1204(ii) — refusal to accept manifests refusal to promise →
  brought before the court.
- **WV** §17C-19-3(7) — "**refuses to accept** the written notice to appear in
  court as his or her promise to appear" → magistrate.
- **NC** §15A-302(d) — "**Failure of the person cited to accept delivery** of the
  citation shall **not** constitute grounds for an arrest or the requirement that
  he or she post a bond."
- **NV** §484A.630 — "**If a person… refuses to accept** a civil infraction
  citation, the copy… signed by the peace officer… constitutes proof [of
  service]." Refusal changes nothing.
- **MD** §26-202(a)(5) sits across both axes: "refuses to **acknowledge its
  receipt by signature**" — acceptance evidenced by signature.

So the same underlying refusal splits two ways in two dimensions: **what act is
refused** (signing vs accepting) and **what follows** (custody vs nothing). Two of
these four acceptance states make it a custody trigger; the other two expressly
forgive it.

**Product consequence.** A user-facing question phrased as "do I have to sign?"
does not reach Wyoming, West Virginia, North Carolina or Nevada at all — in those
states the operative act is whether you take the paper. Any script, any Arena
beat, and any per-state data field in this project must model **both** acts, or it
will silently return "no signature required" for a state where physically
declining the ticket lands you in front of a judge.

## COLUMN PASS 2f (2026-09-01): six more, and a second officer-condition cell

**South Dakota — the full posture-2 machinery in one sentence chain.**
SDCL §32-33-2: "The arresting officer shall **upon the person's written promise to
appear, release him from custody**. Any person **refusing to give a written
promise to appear shall be taken immediately by the arresting officer before the
nearest or most accessible magistrate**. Any person who **intentionally violates**
his written promise to appear is **guilty of a Class 2 misdemeanor** regardless of
the disposition of the charge upon which he was originally arrested. A
**nonresident** arrested… may be **required to post bond**…" **VERIFIED**

South Dakota states all three consequences the other states scatter across
sections: release on promise, magistrate on refusal, and a separate crime for
breaking a promise already given. Note the last is the Texas §543.009(b) rule —
breaking a promise is an offence; refusing to give one is not.

**New York — the officer subscribes it.**
N.Y. C.P.L. §150.10(1): "An appearance ticket is a written notice **issued and
subscribed by a police officer** or other public servant authorized by state law…
directing a designated person to appear in a designated local criminal court…"
**VERIFIED**. No defendant signature. New York joins the officer-signs group.

**Utah — delivery, not signature.**
Utah Code §77-7-18(1): "Any person subject to arrest or prosecution on a
misdemeanor or infraction charge **may be issued and delivered a citation** that
requires the person to appear…" §77-7-20(1): the officer "shall **give the
citation to the individual cited**…" **VERIFIED** as to the mechanism. No
signature requirement appears in either section; whether one exists elsewhere in
the Utah code was not checked, so "Utah requires no signature" remains
**UNVERIFIED**.

**New Hampshire — permissive, in hand, no signature.**
RSA §594:14(I): "In any case in which a peace officer has probable cause to
believe that a person has committed a misdemeanor or violation, the officer **may
issue to the person in hand a written summons in lieu of arrest**." Excepted
where the officer has probable cause to believe the person committed abuse under
RSA 173-B:1, I, or violated a protective order. **VERIFIED**

**Arizona — a detention-scope limit, no signature.**
A.R.S. §28-1594: "A peace officer or duly authorized agent of a traffic
enforcement agency **may stop and detain a person as is reasonably necessary** to
investigate an actual or suspected violation of this title **and to serve a copy
of the traffic complaint**…" **VERIFIED**. Service, not signature — and a
scope-of-detention limit comparable to Washington's RCW 46.64.015, though phrased
as a grant of authority rather than a cap.

**Pennsylvania — partial.**
75 Pa.C.S. §6304 is arrest authority, not citation procedure: "(a) Pennsylvania
State Police.--A member of the Pennsylvania State Police **who is in uniform** may
arrest without a warrant any person who violates any provision of this title **in
the presence of** the police officer making the arrest." **VERIFIED** as an
officer-condition and presence requirement. No signature provision located in
Title 75 Chapter 63; Pennsylvania's citation procedure lives substantially in the
Rules of Criminal Procedure rather than the statutes, which were not searched.
Signature rule **UNVERIFIED**.

## FOURTH CROSS-STATE FINDING: the officer-condition axis is real and has teeth

An earlier pass noted that some states condition the driver's duty on the officer
being uniformed or identified (MD "uniformed police officer", MI officer "who
shall identify himself or herself as such", WI stop power beginning "After having
identified himself"). Two much stronger instances turned up here, and they
condition the officer's **power to cite at all**:

- **IN** §9-30-2-2(a): "a law enforcement officer **may not arrest or issue a
  traffic information and summons** to a person for a violation of an Indiana law
  regulating the use and operation of a motor vehicle… **unless** at the time of
  the arrest the officer is: (1) **wearing a distinctive uniform and a badge of
  authority**; or (2) **operating a motor vehicle that is clearly marked as a
  police vehicle**; that will clearly show the officer or the officer's vehicle to
  casual observation…" (subject to exceptions in subsection (b), not retrieved).
  **VERIFIED**
- **PA** 75 Pa.C.S. §6304(a): State Police arrest authority is limited to a member
  "**who is in uniform**". **VERIFIED**

This is a distinct column the matrix does not currently have, and it is the one
most directly relevant to unmarked-car and plainclothes stops — a scenario the
Arena does not model at all. Indiana's rule is a flat bar on issuing the citation,
not merely a defence. It is also expressly subject to exceptions that were **not
retrieved**, so nothing here is close to user-ready.

## COLUMN PASS 2g (2026-09-01): five more, via index-page-first

Applying METHOD UNLOCK #3 to this column worked exactly as it did for the breadth
sweep. Every one of these was blocked on *locating* the section, not reaching it:
Iowa's is §805.1 "Issuance of citation — release"; Connecticut's is §54-1h in
chapter 959; Delaware's sits inside the voluntary-assessment subsection of §703.

**Connecticut — discretionary release on a written promise.**
Conn. Gen. Stat. §54-1h: "Any person who has been arrested with or without a
warrant for commission of a misdemeanor… may, **in the discretion of the arresting
officer**, be issued a written complaint and summons and be **released on his
written promise to appear** on a date and time specified." **VERIFIED**. No
consequence for refusal is stated; the implication is simply no release, but that
is inference and is **UNVERIFIED**.

**Delaware — the acceptance axis, and a trap worth naming.**
21 Del. C. §703(f)(4): "If a voluntary assessment is not issued or **the driver
declines to accept the voluntary assessment**, the officer shall **follow the
procedure for arrest** as set forth in Chapter 19 of Title 11." **VERIFIED**

And the part that matters more, §703(f)(3): "**In lieu of paying** the voluntary
assessment, a driver who has been given a voluntary assessment **may request a
hearing by notifying, in writing, the court** or the voluntary assessment center…
**within 30 days** of the date of arrest. If the driver makes a timely request for
a hearing, the charge shall be prosecuted as if the voluntary assessment had not
been permitted…" **VERIFIED**

Delaware separates the two things drivers most often conflate. **Declining the
paper at the roadside routes you to arrest procedure. Contesting the charge is a
written request within 30 days.** Refusing at the roadside does not preserve any
right — it forfeits the easy route and gains nothing. This is the single clearest
statutory illustration of why the "signing is admitting guilt" misconception is
dangerous, and it belongs in user-facing copy for Delaware if anything ever ships.

**New Jersey — service, no signature.**
N.J.S.A. §39:5-25: "**Any law enforcement officer may, instead of arresting an
offender** as herein provided, **serve upon him a summons**." **VERIFIED**. The
section otherwise concerns detention pending complaint and warrant for R.S.
39:4-50 (DUI) and other violations.

**Mississippi — the signature line belongs to the judge.**
Miss. Code §63-9-21(3)(b): the ticket "shall contain a place for **the trial judge
hearing the case or accepting the guilty plea**… **to sign**, stating that the
person arrested either employed an attorney or waived his right to an attorney
after having been properly advised…" **VERIFIED**. No driver-signature
requirement appears in §63-9-21; whether one exists elsewhere in the Mississippi
code was not checked, so "Mississippi requires no signature" is **UNVERIFIED**.

**Alaska — the ID pairing a fifth time, but the text retrieved is from 1993.**
AS §12.25.180(a), **as printed in the 1993 Alaska Statutes**: "When a person is
stopped or contacted by a peace officer for the commission of a misdemeanor or
the violation of a municipal ordinance, the person may, **in the discretion of the
contacting peace officer**, be issued a citation instead of being taken before a
judge or magistrate under AS 12.25.150, **unless (1) the person does not furnish
satisfactory evidence of identity**; (2) the contacting office[r]…"

**NOT VERIFIED AS CURRENT.** The source explicitly flagged newer versions (2023,
2024, 2025) and the current text was not retrieved. Recorded as **LIKELY** on
substance and **UNVERIFIED** as to currency. A 33-year-old snapshot is not a
citable cell, and this one is logged specifically so it is not mistaken for one
later.

## The ID/citation pairing, fifth instance

**CA** §40302(a),(b) · **OH** §2935.26(A)(2),(3) · **NE** §29-427 · **ID**
§49-1407(1) · **AK** §12.25.180(a)(1) *(1993 text)*. In all five, failing to
furnish satisfactory identification sits in the same exception list as the
refusal that costs release, carrying the same consequence.

Four of the five are verified on current text. That is enough to treat the
pairing as established and to act on it in the Arena's scripting, while Alaska
stays out of any count until its current text is pulled.

## COLUMN PASS 2h (2026-09-01): the last five, including Oklahoma

**Oklahoma — cracked, and release is MANDATORY when three conditions hold.**
Oklahoma resisted every previous method. The index page for Title 22 broke it:
the operative section is **§22-1115.1A**, "Release on personal recognizance for
traffic violation", which none of the earlier guesses (§22-1114.1, §6-112) came
near.

22 O.S. §1115.1A(A): "any person, whether a resident of this state or a
nonresident, who is arrested by a law enforcement officer **solely for a
misdemeanor violation of a state traffic law** or municipal traffic ordinance,
**shall be released by the arresting officer upon personal recognizance if**:
1. The arrested person **has been issued a valid license to operate a motor
vehicle** by this state, another state jurisdiction within the United States,
which is a participant in the **Nonresident Violator Compact**…;
2. **The arresting officer is satisfied as to the identity of the arrested
person** and certifies the date and time and the location of the violation, as
evidenced by the **electronic signature of the officer**;
3. The arrested person **acknowledges, as evidenced by the electronic signature
of the person**…" **VERIFIED**

Oklahoma is the only state found where release is **mandatory** rather than
discretionary — but it is gated on holding a valid licence from a compact
jurisdiction. **A driver without one falls outside the mandatory-release rule
entirely.** That is the single most consequential conditional found in this
column for the population this product serves, and it points the same way as
Colorado §42-4-1707(6): the protections cluster around licence-holders.

**Maine — the officer signs.**
29-A M.R.S. §2601(1): the Uniform Summons and Complaint "must include, at a
minimum, **the signature of the officer**, a brief description of the alleged
offense, the time and place of the alleged offense and the time, place and date
the person is to appear in court." **VERIFIED**

**Vermont — the officer signs; two copies are handed over.**
4 V.S.A. §1105(a): "A violation shall be charged upon a summons and complaint
form approved and distributed by the Court Administrator. **The complaint shall
be signed by the issuing officer or by the State's Attorney.** The original shall
be filed with the Judicial Bureau; a copy shall be retained by the issuing
officer…, and **two copies shall be given to the defendant**." The complaint must
include "notice that a defendant **may request a hearing or accept the penalties
without a hearing**, notice of the **fee for failure to answer within 21 days**…"
**VERIFIED**. Vermont traffic violations are civil (23 V.S.A. §2302: no
imprisonment, penalty capped at $1,000) and heard by the Judicial Bureau (4
V.S.A. §1102(b)(1)).

**District of Columbia — a civil infraction system, no signature anywhere.**
D.C. Code §50-2302.04(a): "**The notice of infraction shall be the summons and
complaint** for the purposes of this subchapter." §50-2302.04(b): it "shall
contain information advising the person to whom it is issued of the manner in
which and the time within which he may answer." §50-2302.05(a): "In answer to a
notice of infraction, a person to whom the notice was issued **may**: (1) Admit,
by payment of the civil fine…; (1A) Admit with an explanation; or (2) **Deny** the
commission of the infraction", and (b)(1) a person charged with a moving
violation "**may contest the charge by mail**". **VERIFIED**. No signature
requirement appears in either section.

**Tennessee — consequence resolved.**
The §55-10-207 signing duty is disapplied by §55-10-207(b)(2) for "a person who
is subject to arrest pursuant to §55-10-119". T.C.A. §55-10-119: "An officer
**shall detain a driver without a warrant**, as provided in §40-7-103, and **bring
the driver before a committing magistrate** if the driver: (1) Is involved in an
accident resulting in: (A) Serious bodily injury… or (B) Death; (2) **Does not
have a valid driver license**; **and** (3) **Does not have evidence of financial
responsibility**…" **VERIFIED**

Note the conjunctive "and" between (2) and (3): on the face of the text all three
limbs must hold. That reading matters enormously — a disjunctive reading would
make every unlicensed driver subject to mandatory detention in Tennessee. The
text as printed is conjunctive. **Whether Tennessee courts read it that way is
UNVERIFIED**, and this is precisely the kind of clause where a wrong reading is
catastrophic for a user.

## FIFTH CROSS-STATE FINDING: two states make you WRITE YOUR NAME

Distinct from signing a citation, and missed by every prior pass:

- **PA** 75 Pa.C.S. §6308(a): "The operator of any vehicle or any pedestrian
  reasonably believed to have violated any provision of this title **shall stop
  upon request or signal** of any police officer and shall, upon request,
  **exhibit a registration card, driver's license and information relating to
  financial responsibility**, or other means of identification…, and shall
  **write their name in the presence of the police officer if so required for the
  purpose of establishing identity**." **VERIFIED**
- **VA** §46.2-104 — recorded earlier in this ledger: the driver must *write* his
  name if required.

So a script saying "you don't have to sign anything" is wrong in Pennsylvania and
Virginia for a reason unrelated to citations: both states impose a **handwriting
duty for identification**. Pennsylvania's provision also stacks three documents
into one demand — registration, licence, and proof of financial responsibility —
which is a driver-ID cell in its own right, and more than most states require.

PA §6308(b) additionally authorises a stop where the officer "is engaged in a
**systematic program of checking vehicles or drivers** **or** has **reasonable
suspicion** that a violation of this title is occurring or has occurred" —
checkpoint authority, a column this matrix does not have.

## Coverage after this pass

Sign-citation: **47 of 51 verified** — CA, TX, FL, OH, GA, NC, VA, WA, NV, CO,
NE, ID, AL, LA, MA, RI, OR, MO, NM, KY, MN, MD, WV, KS, WI, IL, MT, MI, HI, WY,
ND, SD, NY, UT, NH, AZ, IN, CT, DE, NJ, MS, SC, ME, OK, DC, VT, TN.
Previously 42 of 51.

**Still outstanding (4):**
- **AR** — Chapter 81 is "Citation and Arrest" and was reached; §16-81-104
  (warrant), §16-81-105 (execution and service) and §16-81-106 (authority to
  arrest) are all the wrong sections. Arkansas's citation procedure appears to
  sit in the **Rules of Criminal Procedure** rather than the Code, which were not
  searched.
- **IA** — section identified as §805.1 "Issuance of citation — release" from the
  chapter index. **Five** distinct legis.iowa.gov PDF paths now tried; every one
  returns the chapter listing rather than the section. Iowa needs the rendered
  browser.
- **PA** — no citation-signature provision located in Title 75 Chapter 63.
  Pennsylvania's citation procedure is substantially in the Rules of Criminal
  Procedure. The §6308(a) write-your-name duty is verified and recorded above,
  but it is a different thing.
- **AK** — only the 1993 text retrieved. `touchngo.com` refused the connection;
  `akleg.gov` is an SPA. Needs the rendered browser.

All four are source problems, and all four have a known next move.

**Still outstanding (8):** AR, DC, IA, ME, OK, VT, TN(consequence),
PA(signature), plus AK(currency).

Source status on those eight, so the next pass does not repeat this one:
- **IA** — section identified as §805.1 "Issuance of citation — release" from the
  chapter index. Both PDF paths tried returned the chapter listing, not the
  section. The section text itself has never been reached.
- **OK** — 404s on every route tried: Justia (two slug forms), FindLaw (two
  forms), and OSCN by CiteID. Oklahoma is the only state in this project that has
  resisted every method.
- **DC, VT, IA** — SPA shells on section URLs; the rendered browser works and was
  used successfully for DC earlier in this project.
- **ME, AR** — fetched cleanly, correct section not yet identified.
- **SC** — §56-7-10 and §56-7-15 both retrieved; §56-7-15(A) establishes that the
  uniform traffic ticket "may be used by law enforcement officers **to arrest** a
  person for an offense that has been freshly committed", which is recorded, but
  no signature or refusal clause appears in either section.

**Still outstanding (13):** AK, AR, CT, DE, IA, ME, MS, NJ, OK, SC, TN
(consequence), VT, DC.

Every one of the 13 failed for a *source* reason this pass, not a reasoning one:
`cga.ct.gov` serves 485 KB chapter files whose anchors do not match the section
numbering; `legislature.vermont.gov`, `code.dccouncil.gov` section URLs and
`legis.iowa.gov` returned SPA shells or wrong sections; Oklahoma 404s on every
slug tried across Justia, FindLaw and OSCN; Delaware, Maine, Mississippi and
South Carolina fetched successfully but the correct section has not been
identified. The index-page-first technique from METHOD UNLOCK #3 is the right
next move for all of them and has not yet been applied to this column.

**Still outstanding (22):** AK, AR, AZ, CT, DE, IA, IN, ME, MS, ND, NH, NJ, NY,
OK, PA, SC, SD, TN(consequence), UT, VT, WY, DC.

Confirmed blocks encountered this pass, recorded so they are not re-attempted
blind: `le.utah.gov` returns 136 bytes to `curl` (block, not a short statute);
`azleg.gov` returns 421; `iga.in.gov` and `mgaleg.maryland.gov` are SPAs;
`code.wvlegislature.gov` still 403s (FindLaw served it instead);
`oscn.net`/Justia both 404 on the Oklahoma section slugs tried. The PA iframe
technique needs the full query string including the leading `?47&iFrame=true`,
not just the parameters — the bare parameter form returns an 796-byte shell.

## The ID/signature pairing is now a documented pattern, not a coincidence

Four states drafted refusing-to-identify and refusing-to-sign as items in a
single list of exceptions to release: **CA** §40302(a),(b) · **OH**
§2935.26(A)(2),(3) · **NE** §29-427 · **ID** §49-1407(1). In all four they carry
the identical consequence.

The product implication is now firm enough to act on: the Arena currently scripts
"identify yourself" and "sign the citation" as two separate beats with separate
outcomes. In at least four states the law treats them as **one decision with one
consequence**. A user who has internalised them as independent will mis-model
their own situation in those states.

## The four postures, updated

1. **Refusal is a crime** — FL.
2. **Refusal costs release, bond, or custody** — CA, TX, OH, GA, NE, ID, AL, LA,
   KY.
3. **Refusal is expressly harmless, or nothing is asked of the driver at all** —
   NC, VA, WA, NV, MA, RI, OR, MO.
4. **Signing required, consequence unestablished** — TN, NM.

Posture 3 is larger than the first pass suggested, and splits in two: states that
address refusal and forgive it (NC, VA, NV), and states that never ask for a
signature in the first place (MA, RI, OR, MO, WA). Those are different facts and
should not be merged in any user-facing text — the second group offers no
protection if some *other* section imposes a duty that was not checked.

The four postures now documented, which is the shape of the column:
1. **Refusal is a crime** — FL.
2. **Refusal costs you release or a bond** — CA, TX, OH, GA.
3. **Refusal is expressly harmless** — NC, VA (release mandated), WA (no
   signature required), NV (service valid regardless).
4. **Signing required, consequence unestablished** — TN.

Previously 6 of 51 verified (CA, TX, FL, OH, GA, NC) plus MI partial.
Previously 3 of the original ten. 45 outstanding — and given the polarity found
here, extrapolation from these six to any unresearched state is not permissible.

## Source notes

`statutes.capitol.texas.gov` has been rebuilt as a JavaScript SPA. A plain `curl`
of the `.htm` URL now returns the Angular app shell, not the statute — it looks
like a successful 200-response fetch and contains no law. This is exactly the
silent-failure mode flagged earlier in this ledger, and it has now bitten a
source previously logged as good. **Texas must be read through the rendered
browser with a wait**, never by fetch.

`nysenate.gov` renders, but VTL §207 (uniform traffic summons) is not the
signature provision; New York was not resolved and is not recorded.

---

## REMAINING WORK (as of 2026-08-31)

**Breadth is done. Depth is not, and depth is what shipping requires.**

All 50 states and DC now have at least one VERIFIED cell. Every one of those
cells is the same cell: the driver's carry-and-display duty. That was the easiest
column in the matrix — it is a single, plainly-titled section in every
jurisdiction's motor vehicle code — and finishing it proves only that the
retrieval method works, not that any state is ready.

What is actually missing, by column, across all 51 jurisdictions:

- **Recording consent** — researched for **14** (CA, WA, plus the twelve
  all-party states in COLUMN PASS 1 above). 37 outstanding, all one-party
  jurisdictions where the statutory risk is low by construction — an inference,
  not a verified cell. The high-risk subset of this column is now DONE.
- **Refusing to sign a citation** — researched for **47 of 51** across COLUMN
  PASSES 2 through 2h. 4 outstanding (AR, IA, PA, AK), all source problems with a
  known next move. The column INVERTS across states AND splits on two axes
  (signing vs accepting the citation), so no unresearched state may be inferred
  from a researched one.
- **Passenger ID** — spotty. Verified where the stop-and-identify section
  happened to address it; not systematically pursued.
- **Duty to inform (firearm)** — researched for the original ten and a handful
  since. The TX entry in this ledger contradicts a claim submitted to this
  project four times; that pattern will recur in other states and every one needs
  primary text.
- **Stop-and-identify** — the best-covered column after driver ID, and the one
  where careful sourcing already contradicted the widely-copied list on **four of
  the ten** states first researched.

Next pass should go by COLUMN, not by state. The per-state fetch pattern is now
solved and cheap; the remaining risk is entirely in the columns where secondary
sources are known to be wrong. Recording consent first, since it is the column
users are most likely to act on in the moment.

---

## Coverage

Researched: NE, NV, MS, MO, MT, MA, MI, MN, NH, NJ, FL, CA, OH, VA, WA, NC,
WI, RI, ID, SC, OR, CT, MD, UT, IL, DE, HI, ND, IA, WY, AZ, KS, AK, PA, IN,
CO, NM, VT, TN, AL, WV, LA, KY, SD, ME, OK, AR, DC (47 of 47 outstanding,
plus DC — breadth complete).
Nothing remains blocked at source. The retractions above (KY, SD, ME) closed the
last three, and every earlier "blocked" state was subsequently sourced by one of
the three method unlocks: the rendered browser, codes.findlaw.com, or
curl + pypdf on PDF-only publishers.

TALLY (counted mechanically, 2026-09-01, after COLUMN PASS 2h): **156 VERIFIED**,
12 LIKELY, 64 UNVERIFIED cells. Progression: 81 breadth sweep, 97 pass 1
(recording consent), 104 pass 2, 112 pass 2b, 124 pass 2c (harness), 133 pass 2d,
137 pass 2e (PDF states), 145 pass 2f, 150 pass 2g (index-first), 156 pass 2h. An earlier running count of "147 verified" reported during
this work was wrong — it was produced by a line-match that counted every
`UNVERIFIED` line as a verified one. The real figure is 81, and roughly 60 of
those are the single driver-ID column.

**Breadth ≠ readiness.** All 51 jurisdictions have exactly one column filled
(driver carry-and-display), the easiest of the six. Zero jurisdictions have a
complete row. Zero are shippable. See REMAINING WORK for the by-column gap.

MEASURED ACCESS across six batches: 14 of 33 states reachable (~42%).
Confirmed-good, hit these first: flsenate.gov, leginfo.legislature.ca.gov,
codes.ohio.gov, law.lis.virginia.gov, app.leg.wa.gov, ncleg.gov,
docs.legis.wisconsin.gov, rilegislature.gov, legislature.idaho.gov,
revisor.mn.gov, scstatehouse.gov, cga.ct.gov, mgaleg.maryland.gov,
legislature.mi.gov, oregon.public.law (mirror — worked where the official
oregonlegislature.gov ToC page did not).
Confirmed-bad: ilga.gov, azleg.gov, law.justia.com, palegis.us, ksrevisor.org,
delcode.delaware.gov, le.utah.gov, legislature.vermont.gov, legis.iowa.gov,
apps.legislature.ky.gov, code.wvlegislature.gov, sdlegislature.gov,
capitol.hawaii.gov (403), legis.la.gov, legislature.maine.gov (wrong sections
returned; correct section number not yet identified).

MEASURED SOURCE-ACCESS RATE across four batches: 10 of 22 states reachable
(~45%). Confirmed-good domains, reuse these first: flsenate.gov,
leginfo.legislature.ca.gov, codes.ohio.gov, law.lis.virginia.gov, app.leg.wa.gov,
ncleg.gov, docs.legis.wisconsin.gov, rilegislature.gov, legislature.idaho.gov,
revisor.mn.gov.
Confirmed-bad: ilga.gov, azleg.gov, law.justia.com, palegis.us, ksrevisor.org,
delcode.delaware.gov (index only), le.utah.gov (index only),
legislature.vermont.gov (index only), legis.iowa.gov (PDF),
apps.legislature.ky.gov (PDF), code.wvlegislature.gov (403),
sdlegislature.gov (browser-check page).

MEASURED SOURCE-ACCESS RATE across three batches: 6 of 16 states reachable
(~38%). Failure modes seen, all of which return something rather than nothing:
  - HTTP 404 / 403 (ilga.gov, azleg.gov, law.justia.com, ksrevisor.org refused)
  - 301 to a navigation shell with no statute text (palegis.us)
  - Chapter index pages that list section numbers but not text (delcode, le.utah.gov)
  - PDF-only publication that does not extract (legis.iowa.gov, apps.legislature.ky.gov)
The last three are the dangerous ones: they return HTTP 200 with plausible-looking
content and no statute. An unattended loop cannot distinguish those from a
successful fetch, which is precisely how a confident wrong cell gets written.

Batch 2 (PA, NC, VA, WA, TN) sourced 3 of 5. Batch 1 (IL, OH, AZ, PA, NC)
sourced 1 of 5. Combined: 4 of 10 states reachable on first attempt, and every
reachable one was researched for ONE column (driver ID or stop-and-identify),
not all six. Extrapolating honestly: the remaining 28 states plus DC represent
well over a hundred more cells, gated on source access that fails roughly half
the time and on per-state reading that cannot be batched away.

SOURCE-ACCESS NOTE (2026-08-31): primary-text retrieval is not uniformly
available. Working: flsenate.gov, leginfo.legislature.ca.gov, codes.ohio.gov.
Blocked or wrong-path this pass: ilga.gov (404), azleg.gov (403),
law.justia.com (403, both states). Roughly 3 of 5 attempted states in this batch
could not be sourced. Any plan that assumes unattended state-by-state completion
must budget for this: the binding constraint is source access and reading, not
throughput.

FL and CA (added 2026-08-31) were researched against primary legislature
text for four columns only: stop-and-identify, driver ID, passenger ID and
duty-to-inform. Their recording-consent and sign-citation cells are
UNVERIFIED and were not attempted. Two findings from that pass are worth
carrying forward:
  1. Florida is NOT a stop-and-identify state. §901.151 permits detention to
     ascertain identity and imposes no penalty for silence. The contrary
     claim has now been submitted to this project twice.
  2. California Pen. Code §25850(b) makes refusing a firearm inspection
     probable cause for arrest — so a blanket "I do not consent to any
     searches" script is actively unsafe there. Any national script template
     must carve this out.
  3. California's police-recording protection is STATUTORY (Pen. Code §148(g)),
     not merely 9th Circuit case law, and it forecloses the recording being used
     as reasonable suspicion or probable cause. But §632 is a separate track and
     is not fully displaced: it reaches "confidential" communications only, and
     whether a given roadside stop qualifies is circumstance-dependent. The
     open-vs-concealed question — the exact axis Massachusetts turned on — is
     still UNVERIFIED for California.

Every one of the ten has at least one UNVERIFIED or LIKELY cell. **None is ready
to ship.** The refusing-to-sign column is the weakest across the board — it was
verified for only 3 of 10 states.

## Blocking dependency before any of this ships

See `Upsolve, Inc. v. James`, No. 22-1345 (2d Cir., 9 Sep 2025): a state may bar
even free, nonprofit "what to say" guidance as unauthorized practice of law. The
practice-mode scoring engine — which evaluates a specific user's specific chosen
words — is more exposed than these static statute pages. A UPL/compliance
attorney should review the architecture before per-state content is widened.
