# Amparo — "Police at your door" module: multi-perspective source research

Date: 2026-08-03
Status: **research notes only.** No `index.html` or app source file was edited.

**What this document is.** Perspectives and real-world accounts gathered from
residents, law enforcement, and eight adjacent professions, to stop the door
module from being built entirely out of one law firm's lead-generation videos.

**What this document is NOT.** It contains **no statutes, no case holdings, and
no statements of what the law is**. Where a source states a legal rule, it is
reported as *"organisation X's material advises Y"* — never as fact. Project
rule 1 stands: an attorney supplies all legal text. Nothing below is
user-facing content.

**Reading the attribution labels.** Every claim carries a URL. Then:

| Label | Meaning |
|---|---|
| CORROBORATED | Found in 2+ genuinely independent sources |
| SINGLE-SOURCE | Found in exactly one place. Do not build on it alone. |
| SNIPPET-LEVEL | Recovered from a search-result snippet, not a full read of the page |
| NOT FOUND | I looked and could not establish it. Listed in §8. |

And throughout: *"a Reddit user reports X"* ≠ *"X is how it works."* The
distinction is preserved in the wording of every line.

---

## 1. Method — what was searched, and what blocked

### 1.1 Tools and their failures

- **WebSearch** — exhausted the session's 200-call budget partway through.
  Everything after that ran through the Firecrawl CLI (`npx firecrawl-cli
  search`), which returns real URLs plus substantive snippets.
- **Reddit is hard-blocked at the tool layer.** `WebFetch` refuses
  `reddit.com` and `old.reddit.com`; domain-scoped `WebSearch` errors outright;
  an `r.jina.ai` proxy returned Reddit's 403 wall. Firecrawl scraped exactly
  **one** thread successfully before Reddit scraping was blocked mid-session
  too.
  **Consequence: nearly all Reddit evidence in §2 is SNIPPET-LEVEL** — real
  thread URLs with the quoted line the search engine surfaced, not a full read
  of the thread or its comments. This is the single biggest weakness of this
  research pass and it is flagged inline everywhere it applies.
- **PDF extraction failed repeatedly.** `pdftoppm` is not installed locally, so
  image-based PDFs could not be read. Casualties: the MNADV law-enforcement DV
  handbook, the NY State model policy on domestic incidents, the EVAWI DV
  prosecution best-practices guide, and the NAA "ICE Decision Tree." All are
  listed in §8 as unread but promising.

### 1.2 Angles searched

Residents (r/legaladvice, r/Advice, r/Apartmentliving, r/AskLE civilian-side,
r/EstrangedAdultKids, r/domesticviolence, r/NarcissisticAbuse, r/legal,
r/trees, r/neighborsfromhell); law enforcement (r/ProtectAndServe, r/AskLE,
Police1, Lexipol, masscops, published academy and model-policy material); 911
dispatch (r/911dispatchers, NENA and APCO standards, dispatcher blogs, IOPC
oversight investigations); EMS (EMTLife, EMS1, JEMS, FireRescue1, medic blogs);
child welfare (state CPS handbooks, ProPublica/NBC investigation, an academic
ethnography, parent accounts); immigration advocacy (ILRC, IDP, NILC, United We
Dream, rapid-response networks, Spanish-language explainers); disability
advocacy (NAD, ASAN, The Arc, Center for Disability Rights, state visor-card
programmes, news coverage of specific incidents); public defenders (PD office
publications, consent psychology research); property management (NAA, apartment
industry consultancies, landlord-side law firms, local news).

Three parallel research agents ran the LE, dispatch/EMS/child-welfare, and
immigration/disability/PD/property-manager slices. I ran residents and the DV
section directly.

---

## 2. Residents' real accounts — recurring mistakes, ranked

**Ranking caveat, stated up front:** this is ranked by **how often the theme
recurred across the sources I could reach**, not by measured incidence in the
population. Nobody has that number. Treat the ordering as a writing priority,
not a statistic.

Also note the sampling bias baked into every source here: people post to
r/legaladvice *after* something went wrong. The corpus is structurally made of
bad outcomes. It tells you what the failure modes look like; it does not tell
you how often the door encounter ends in nothing.

### #1 — Opening the door at all, reflexively, to be helpful

The most common single act across every source set. A resident on
r/Apartmentliving writes that they hate themselves for not stopping officers at
the door and will never open again without a warrant
(https://www.reddit.com/r/Apartmentliving/comments/1rvu7ol/police_act_like_apartments_are_exempt_from/,
SNIPPET-LEVEL). A commenter on r/Advice says they opened the door while
pregnant and regrets it
(https://www.reddit.com/r/Advice/comments/1slawn3/police_knocking_on_door/,
SNIPPET-LEVEL).

**The important finding is not the anecdotes — it's the mechanism behind
them.** Research by Sommers and Bohns finds that more than 90% of U.S. police
searches rest on individual consent rather than a warrant, and that people
systematically overestimate their own ability to refuse a polite, face-to-face
request; the pressure needed to obtain compliance is far lower than people
predict, and people consent against their own stated preferences
(https://law.uchicago.edu/node/75391, https://news.cornell.edu/node/328178 —
CORROBORATED, two institutions reporting the same research programme).

**Design consequence:** the module's beat-1 thesis is empirically correct, and
the `bc` coach line has an unusually strong non-blaming framing available to
it. The person who opened the door did not fail a knowledge test. Knowing the
answer and executing it under a face-to-face request are measurably different
capabilities. Wargame §6.6 already reaches for Hard Mode's register; this
research supplies the evidentiary basis for it.

### #2 — Stepping outside, and being arrested or searched on the doorstep

A r/bestoflegaladvice summary describes a poster who, as soon as he stepped
outside his door and confirmed his name, was arrested
(https://www.reddit.com/r/bestoflegaladvice/comments/1cwgj2t/op_learns_that_being_traumatized_by_the_police_is/,
SNIPPET-LEVEL). Recurs across r/AITAH and r/AskALawyer threads in the same
shape: a small social courtesy that resolves the encounter's central question.

**This corroborates the wargame's signature beat (ci:43) as the right choice of
signature beat.** See §5 for the one context where it inverts, badly.

### #3 — Confirming who you are before knowing who they are

The identity confirmation is what completed the arrest in #2. Immigration
advocates document that the officer often already knows the name — from a
pre-knock phone ruse asking someone to "confirm his address," or from weeks of
surveillance (https://www.ilrc.org/community-resources/closer-look-dhs-interior-enforcement-practices,
https://www.immigrantdefenseproject.org/ice-ruses/ — CORROBORATED).
**Name-use at a door is not a bluff to be called; it is frequently the output
of a prior verification step.**

### #4 — Talking to explain yourself, especially about an odour or a noise

The single most common civilian door scenario in the Reddit corpus is not a
warrant — it's a neighbour complaint. Threads: a neighbour called police over
smoking on a back porch
(https://www.reddit.com/r/legaladvice/comments/1fzr1c9/neighbor_called_the_cops_for_me_smoking_on_my/);
police knocking half an hour after smoking
(https://www.reddit.com/r/trees/comments/8mln0x/police_knocked_on_my_door_30_mins_after_sparking/).
Both SNIPPET-LEVEL. One r/shrooms commenter narrates the full chain as they
experienced it: a false 911 hang-up brought officers to the house, and odour
did the rest
(https://www.reddit.com/r/shrooms/comments/14gawup/if_someone_tips_off_the_police_that_you_are/,
SNIPPET-LEVEL).

**Design consequence:** the module's beat-2 failure mode (filling the silence)
is right, but the *scenario* most residents actually face is a neighbour
complaint, not an investigation. Worth reflecting in the `setter`.

### #5 — Assuming a knock creates an obligation

The Defender Association of Philadelphia's material names this directly: people
commonly assume any demand at the door requires compliance
(https://phillydefenders.org/immigrant-rights/). Corroborated by the volume of
r/NoStupidQuestions-style threads asking whether not answering is itself
trouble
(https://www.reddit.com/r/NoStupidQuestions/comments/1hjuid6/can_i_get_in_trouble_for_not_answering_the_door/,
SNIPPET-LEVEL).

### #6 — Answering for someone who does not live there

Heavily recurring and almost entirely absent from the lawyer videos. Residents
report police returning repeatedly for a previous tenant — one commenter says
officers came looking for a resident from ten years earlier
(https://www.reddit.com/r/Virginia/comments/1p4wbdc/no_person_at_address_previous_tenant_moved_out_3/);
an r/AskLE responder explains officers are working from a warrant list carrying
the wanted person's last-listed address, which is now yours
(https://www.reddit.com/r/AskLE/comments/1cuhpm4/police_keep_showing_up_at_my_house_looking_for/);
also
https://www.reddit.com/r/legaladvice/comments/6hneum/oh_police_keep_looking_for_previous_tenant_of_my/.
All SNIPPET-LEVEL but **CORROBORATED across four independent threads and one
Facebook group post** — the pattern itself is solid.

### #7 — Not knowing a welfare check can be a weapon

An entire subreddit built a playbook for this. r/EstrangedAdultKids maintains a
community wiki titled *Malicious Police Welfare Checks*
(https://www.reddit.com/r/EstrangedAdultKids/wiki/malicious-wellness-checks/ —
SNIPPET-LEVEL; the wiki exists and is titled as stated, full text not
retrievable). Parallel threads:
https://www.reddit.com/r/legal/comments/18jmnpz/my_harasser_called_a_welfare_check_on_me/,
https://www.reddit.com/r/NarcissisticAbuse/comments/1nf9e8e/called_the_police_on_me_to_do_a_welfare_check/,
https://www.reddit.com/r/legaladvice/comments/12qv82p/a_neighbor_is_swatting_my_mom_with_fake_wellness_checks/.
CORROBORATED as a pattern across four communities. See §5.

### #8 — Assuming the person at the door is who they say

FTC published a consumer alert on scammers impersonating local law enforcement
(https://consumer.ftc.gov/consumer-alerts/2025/06/scammers-are-impersonating-local-law-enforcement).
Local news documents criminals impersonating officers to try to enter a South
Carolina home
(https://www.wcnc.com/article/news/criminals-impersonating-officers-try-to-enter-sc-home/275-6fad2a09-a187-4211-b73c-b6934cdb094f).
An r/AskLE responder's suggested move is to shout that you are calling 911 to
verify, and otherwise say nothing
(https://www.reddit.com/r/AskLE/comments/1d73jdk/how_should_i_handle_a_situation_where_someone_is/,
SNIPPET-LEVEL). CORROBORATED.

### #9 — Calling the police yourself and losing control of the outcome

A poster on r/Marriage says they phoned police on their husband and regret it,
noting charges proceed without their consent
(https://www.reddit.com/r/Marriage/comments/1sf419w/i_phoned_police_on_my_husband_and_regret_it_it/,
SNIPPET-LEVEL). A poster on r/domesticviolence titles their thread *I talked to
police and now I regret it*
(https://www.reddit.com/r/domesticviolence/comments/1ok8ckf/i_talked_to_police_and_now_i_regret_it/,
SNIPPET-LEVEL). This is the resident-side entry point into §5.

### #10 — Apologising

Flagged by the Broward County Public Defender's office as a specific error: an
apology after being stopped can be treated as an admission
(https://www.browarddefender.org/know-your-rights/). SINGLE-SOURCE, but
notable because **no other profession in this entire research set mentions
it**, and an apology is close to the most natural first utterance a startled
person produces at their own door. Worth an attorney's view on whether it
belongs in a `bc` line.

---

## 3. Law enforcement perspective, steelmanned

Reported as the strongest, most reasonable version of the officer view. Where
officers concede something against interest, that is noted — those concessions
are the most useful material in this section.

**Access caveat:** `forum.officer.com`, `bluetogold.com`, `quora.com`,
`theiacp.org` and `leb.fbi.gov` all return 403 to automated fetch, so material
from those is SNIPPET-LEVEL. Reddit is blocked entirely (§1.1). Everything
else below was fetched directly, including five PDFs of published academy and
prosecutor-to-officer training material.

### 3.1 What a knock-and-talk is from their side

**The reasons for knocking are mostly mundane and unrelated to the resident.**
An officer on r/AskLE lists their own: surveillance-footage requests, death
notifications, welfare checks, 911 hang-ups, witness statements, victim contact
(https://www.reddit.com/r/AskLE/comments/1vcpy77/if_cops_knock_on_your_door_for_questioning/,
SNIPPET-LEVEL, SINGLE-SOURCE). Directly on point for the resident's actual
problem: **they cannot tell which of these it is.**

**Named officers describe it as their most honest tool, reached for when
everything else has failed.** Lt. Victor Uvalle (Orlando PD) calls the
knock-and-talk "the most honest" investigative method and describes turning to
it when other techniques produce nothing; Deputy Kevin Marcum (Orange County
SO) says the trigger is usually neighbour tips about short-stay traffic
(https://www.orlandoweekly.com/news/knock-and-talk-2260977/ — journalism
quoting multiple named officers; SINGLE-SOURCE publication).

**Officers know their knock reads as threatening and treat the resident's
alarm as predictable rather than incriminating.** Lt. Brian N. O'Donnell (ret.,
25 yrs Charlottesville PD, SWAT/narcotics/FBI task force) writes that the
"cop-knock" carries an insistence signalling a non-casual encounter — a product
of how officers are *trained* to knock, not evidence about the occupant
(https://www.police1.com/patrol-issues/coming-to-the-door-with-a-weapon-an-approach-to-an-armed-homeowner-for-le,
SINGLE-SOURCE).

**They withhold the reason deliberately, and say so.** An officer on r/AskLE
explains they don't announce the reason because they don't know the resident or
their risk, and leading with bad news "might escalate things immediately"
(https://www.reddit.com/r/AskLE/comments/1s781b1/why_do_cops_never_say_why_theyre_there_when/,
SNIPPET-LEVEL, SINGLE-SOURCE). **The information asymmetry at the door is
intentional, and has a safety rationale rather than a deceptive one.**

**Prosecutor-authored officer training sets numeric limits on the technique.**
The Alameda County DA's *Point of View* training bulletin tells officers two at
the door is the rule of thumb, that three or more reads as a show of force,
that late-night knock-and-talks draw the greatest scrutiny, that knocking for
several minutes converts the encounter, and that encircling the resident is
coercive (https://le.alcoda.org/publications/files/KNOCKandTALKS.pdf,
https://le.alcoda.org/publications/point_of_view/files/SS20_Knock_and_Talk.pdf).
**Officers are trained that their own numbers and persistence are the thing
that spoils the encounter.**

### 3.2 The welfare check on their end: they often know almost nothing

**IACP concedes it in its own policy.** The IACP Law Enforcement Policy
Center's *Welfare Checks* guidance states the information initially provided
may be vague — which is why officer discretion is required — and immediately
flags that this discretion raises concerns about discriminatory application
(https://www.theiacp.org/sites/default/files/2023-09/WelfareChecks-2023.09_0.pdf,
Sept 2023). **This is the strongest available citation for "they know nothing,"
because it comes from the profession's own policy body and volunteers the
downside.** CORROBORATED by an officer on r/AskLE: the info dispatch gives
depends entirely on what the caller gave
(https://www.reddit.com/r/AskLE/comments/ptdjkl/questions_about_how_wellness_checks_work/,
SNIPPET-LEVEL).

**A first-person account of how thin the brief is.** Mike Peterson (ret., 23
yrs) describes a welfare check where all he had was a friend's letter saying
the person would be dead, plus an unlocked front door — and rehearsing
dead-body scenarios on the drive. He estimates ~99.9% end fine and says it is
the remainder that drives the dread
(https://www.police1.com/bizarre/articles/p1-humor-corner-welfare-checks-M8vVz1vdIQBYc1lI/,
SINGLE-SOURCE).

**IACP's on-arrival sequence is mostly non-confrontational and happens before
anyone knocks:** assess risk, note piled mail and overgrown foliage, canvass
neighbours for information or a key, pull prior calls, call the original
complainant. On contact: give the reason for presence and, per agency policy,
inform the person they may refuse services, then leave an incident number.
**IACP explicitly authorises departing** — if the individual refuses aid and
poses no threat, police may leave (same URL).

**And a widely-republished trainer argues restraint is the correct default.**
Ellis Amdur — a crisis and tactical-communication trainer, **not a police
officer**; label carefully — argues officers should assume their presence will
be regarded as intrusive and possibly dangerous, should frame themselves as
guests in another's territory, and that when presence is unwanted and
unwarranted it is often best for everyone's safety that officers leave
(https://www.police1.com/patrol-issues/articles/welfare-checks-can-kill-tactics-for-better-outcomes-RuqgJQw6h0EypcSZ/,
SINGLE-AUTHOR across two publishers — do not count twice).

### 3.3 Why the doorway is dangerous from their side

This is the best-corroborated cluster in the whole research pass, and it comes
from published state academy curriculum, not folklore.

**California POST Learning Domain 21** (*Patrol Techniques*, v7.0) lists under
anti-silhouetting: do not stand in doorways, hallways, or in front of windows
(https://post.ca.gov/portals/0/post_docs/basic_course_resources/workbooks/LD_21-V7.0.pdf).
**Michigan MCOLES** makes it a required recruit objective for residential
domestic response — stand clear of door or windows, park a short distance away,
use cover, and each officer takes a separate approach
(https://www.michigan.gov/-/media/Project/Websites/mcoles/TD-Webpage/2021_basic_training_manual_rev_feb_2021.pdf).
CORROBORATED across two independent state commissions.

**The officers' own plain-language version:** the top comment on
r/ProtectAndServe's "Why do cops stand to the side of the door when they
knock?" is that some people will shoot through the door, or shove it to knock
the officer over
(https://www.reddit.com/r/ProtectAndServe/comments/3aew6s/why_do_cops_stand_to_the_side_of_the_door_when/,
SNIPPET-LEVEL). Lt. Dan Marcou (ret., 33 yrs) instructs officers to treat every
door as the fatal funnel it is, and names the approach and the arrest as the
two most dangerous moments of a domestic call
(https://www.police1.com/police-training/articles/the-2-most-dangerous-moments-of-domestic-violence-calls-FEMuojj31SR8HwoC/).

**The knock is engineered so the resident has no warning.** Marcou's
stealth-approach doctrine: park around the corner or three to four doors away,
ease the car door shut, arrive "like a whisper not like a brass band," look and
listen before contact
(https://www.police1.com/officer-safety/articles/street-survival-develop-your-stealth-approach-C7xZfiMqitSIJwa7/).
**Design consequence for Amparo:** the resident who opens the door has, by
design, had no run-up — and the officer is standing where the peephole does not
show them. That is a `setter` fact, and it is a sympathetic one.

**Contested inside the profession.** Brian Willis (officer ret., then Deputy
Executive Director, ILEETA) accepts the geometry but argues "fatal funnel"
teaches defeat and prefers "thresholds and transitional areas"
(https://www.policemag.com/blogs/training/blog/15318101/the-scale-of-desirability-and-fatal-funnel,
SINGLE-SOURCE). Included so the section is not monolithic.

### 3.4 "Step outside" — and a negative finding that matters

**In officer-side sources, stepping outside is explained tactically, almost
never legally.** Doug Wyllie's domestic-call guidance frames it as separation:
get the parties as far apart as possible, ideally so neither can see the other
while officers keep eyes on both
(https://www.policemag.com/blogs/patrol/blog/15316175/11-tips-for-responding-to-domestic-violence-calls).
Cpl. William Wolfe (metro Atlanta PD, SWAT) gives the underlying logic: a
person inside understands the layout and can take up a tactical position
(https://www.police1.com/barricade/barricaded-suspect-response-whats-the-rush,
SINGLE-SOURCE).

**⚠️ NEGATIVE FINDING, and it constrains the module.** The only POST-level
instruction located on asking someone to step outside is narrow — MCOLES tells
officers to *consider* having the assailant step outside **if working alone**,
with an attached note that solo domestic response is strongly discouraged. **No
published training source found teaches "get them outside" as general door
practice with a stated rationale.** The "you lose protections outside the
threshold" framing appears almost exclusively in **civilian-facing legal
writing, not in officer voice.**

**Consequence for the wargame's signature beat (`ci:43`):** the beat is still
worth building, but its `bc` coach line must not assert that officers are
trained to lure people outside. That claim is not supported by published
curriculum. What *is* supported is separation on domestic calls (§5.2(b)) and
the tactical preference for not fighting on the resident's home ground.

### 3.5 What officers say civilians get wrong

**The most dangerous instinct is hiding a weapon, not holding one.** O'Donnell
describes residents who answer armed and then reflexively conceal the gun
behind a leg under shouted commands — the exact movement that reads as threat.
He is candid that officers don't know why the resident is armed (they may have
come from the kitchen) and that weapon fixation measurably degrades an
officer's ability to process other visual information. His prescribed command
sequence puts "Don't move" *first*, before any disarm instruction
(https://www.police1.com/patrol-issues/coming-to-the-door-with-a-weapon-an-approach-to-an-armed-homeowner-for-le,
SINGLE-SOURCE, and the most specific officer-voice source in the corpus).

**Officers concede that non-compliance is scored as threat escalation — and
aim the fix at themselves.** Same source: officers treat refusal to comply as
increasing the threat evaluation, and the remedy O'Donnell directs at
*officers* is to issue calm, unambiguous stop-action commands so a compliant
resident has time to respond without generating misinterpretable movement.
**This is the honest core of the officer position: the escalation is a stress
and timing problem, not a judgment about guilt.**

**Officers say their trained demeanour is misread as hostility.** Deputy Chief
William Mazur (ret., 25 yrs Atlantic City PD) argues the public reads "command
presence" as arrogance, and that officers cannot switch off threat assessment
(https://www.police1.com/public-perception/articles/a-letter-to-the-american-public-debunking-4-myths-about-police-officers-vNm9MFe5WPQhIm0B/,
SINGLE-SOURCE).

**And police departments themselves tell residents not to open the door.**
Tampa PD's neighbourhood affairs liaison advises answering loudly *through* the
door and escalating to announcing you are calling police
(https://patch.com/florida/newtampa/police-explain-how-to-answer-the-door-caf3f55a,
SINGLE-SOURCE, framed around burglars). **Worth noting for tone: the module's
core behaviour is also police community-education advice.**

### 3.6 How they read a closed door — the central tension

**Academy instruction says refusal alone buys officers nothing.** California
POST LD 16 (*Search and Seizure*, v5.1) instructs that refusal of consent to
enter, by itself, does not provide justification to secure premises pending a
warrant; that officers must make clear they are *requesting* permission, not
demanding it; and that silence or failure to object is **not** consent. It
lists behaviours that void consent: hands on or drawing weapons while asking,
implying an immediate right to search, falsely claiming a warrant, appearing in
large numbers, overly authoritative tone
(https://post.ca.gov/portals/0/post_docs/basic_course_resources/workbooks/LD_16-V5.1.pdf).
CORROBORATED by the Alameda DA bulletin.

**A chief documents the suspicion reflex and calls it an error.** Chief Ken
Wallentine (West Jordan UT PD, 40+ yrs) reviews a case where officers warned
"Don't do that" as a resident closed his door, then kicked it in; the officers
characterised the refusal as hostile behaviour, the court called it passive
resistance. He presents it to officers as a mistake to avoid
(https://www.police1.com/legal/articles/knock-knock-dont-come-in-vp9KJm44udDBZ9rq/,
SINGLE-SOURCE, valuable precisely because it is officer-voice self-criticism).

**Officers are genuinely split, and the module should not pretend otherwise.**
Officer.com threads show one camp treating refusal as operationally routine —
on a noise complaint with no other cause there is nothing to do, and one
contributor states plainly that answering an anonymous-call check with "nobody
here called, go away" is *not* corroboration of wrongdoing — and another camp
holding that refusal *combined with other circumstances* can feed an
investigative detention
(https://forum.officer.com/forum/public-forums/ask-a-cop/53706-not-answering-the-door-for-cops,
https://forum.officer.com/forum/public-forums/ask-a-cop/29475-noise-complaint-but-what-if-i-never-answer-the-door,
SNIPPET-LEVEL, multi-thread). **Report the split; do not resolve it.**

### 3.7 ⚠️ The exception that changes everything — DV response

**In domestic-violence response, POST training explicitly tells officers NOT to
accept "everything's fine."** MCOLES: when the suspected assailant answers, the
officer does not accept statements that the call was a mistake, expects denial
and minimisation, asks to speak to each person at the residence, and **refuses
to leave without speaking to the victim** even when told all is well
(https://www.michigan.gov/-/media/Project/Websites/mcoles/TD-Webpage/2021_basic_training_manual_rev_feb_2021.pdf,
SINGLE-SOURCE at POST level, though it is the mainstream DV-response standard).

**This is the single most important finding in the LE stream, and it is the
hinge of §5.** Two state commissions teach officers to stand where the resident
cannot see them through a peephole; one body of training says refusal is
legally inert; and in DV calls training says a reassurance at the door must not
be accepted at face value. **That combination — not any one document — is what
a resident actually meets.**

### 3.8 Scripted refusals: what officers say happens

**⚠️ Scope caveat, load-bearing: every officer source found on scripted
refusals is framed around traffic stops or public-place encounters. Not one
officer account of a sovereign-citizen or auditor script at a residential door
was found.** Do not let the module imply this literature covers doors.

**Officers say the script does not change the outcome but does lengthen the
encounter, and they say it explicitly.** Police1 guidance: the underlying
violation stands regardless of what is claimed, and duration is on the citizen
(https://www.police1.com/patrol-issues/articles/5-responses-to-a-sovereign-citizen-at-a-traffic-stop-FZ4ruThuMxTHVgEO/).
Det. Morris Greenberg (Baltimore County PD): many speak as if reading from a
script, intended to throw officers off, and the failure mode is officers' own
egos
(https://www.police1.com/police-products/investigation/articles/what-cops-need-to-know-about-sovereign-citizen-encounters-JH4gyxhtZM2NrN16/).
Dr Christine Sarteschi, writing for a police audience, says officers arguing
back is what prolongs and escalates it
(https://www.police1.com/sovereign-citizens/american-state-nationals-the-newest-group-of-sovereign-citizens).
CORROBORATED across three.

**Forum officers report non-engagement works.** An officer on r/police: be
polite, answer questions, be nice — they want a confrontation and when they
don't get it, they leave
(https://www.reddit.com/r/police/comments/tw4b4o/cops_of_reddit_have_you_ever_had_to_deal_with/,
SNIPPET-LEVEL).

**What this means for Amparo, honestly stated:** the officer-side evidence does
**not** say a calm scripted refusal makes things worse. It says an *argumentative*
one lengthens the encounter without changing the outcome. The module's
broken-record mechanic (wargame §3 beat 6) sits on the right side of that line
— **provided the copy keeps it flat and non-confrontational rather than
combative.** That is a real design constraint this research supplies.

### 3.9 What the LE stream could not reach

No officer-voice source anywhere says knock-and-talks work because people don't
know their rights — that claim appears only in defence-attorney and
encyclopedia sources, and **must not be attributed to officers.** No IACP
knock-and-talk model policy exists publicly (only *Welfare Checks*). Ohio
OPOTA, FLETC and Calibre Press door-approach curricula are not publicly posted;
TCOLE, Florida CJSTC, Washington CJTC, Oregon DPSST and Minnesota POST were not
reached. Colorado and Nevada POST curricula surfaced and are live follow-up
leads
(https://post.colorado.gov/sites/post/files/documents/Basic%20Academic%20Training%20Program%20March%202022_1.pdf,
https://post.nv.gov/Training/Basic_Training_Performance_Objectives/).

---

## 4. The adjacent professions

One section each. The last bullet block in every section is the thing **only
that profession knows** — the reason to have asked them at all.

### 4.1 — 911 dispatchers: what a "welfare check" actually is on their end

**The phrase is a priority tier, not a description of purpose.** NENA's
national standard names "welfare check" as the fallback classification when a
call-taker doubts a caller's "misdial" claim — i.e. a whole category of these
originates from *dispatcher suspicion*, with no outside caller at all
(NENA-STA-020.1-2020 §2.2.7,
https://cdn.ymaws.com/www.nena.org/resource/resmgr/standards/nena-sta-020.1-2020_911_call.pdf,
CORROBORATED with
https://colfaxcountyne.gov/911-communications/911-frequently-asked-questions/).

**Information degrades structurally, not accidentally.** APCO's minimum
training standards define Call Taker and Law Enforcement Dispatcher as separate
roles with separate relay duties
(https://www.apcointl.org/~documents/standard/implementation-guide-for-apco-ans-recommended-minimum-training-standards-for-psts?layout=file,
CORROBORATED). A former dispatcher describes, in a first-person LA Times
op-ed, watching her own high-priority classification get read by a colleague
who never spoke to the caller, downgraded to "suspicious circumstance," and
re-narrated on the radio in his words
(https://www.latimes.com/opinion/story/2022-01-07/911-dispatchers-police-response-burlington-shooting,
SINGLE-SOURCE as first-person, mechanism CORROBORATED).

**Documented consequence at a door.** A UK IOPC investigation records officers
sent to a welfare check who were "only told they were doing a welfare check on
an elderly person," could not access the call's nature, rang all the buzzers,
judged they lacked enough information, and left
(https://www.policeconduct.gov.uk/node/3519). A second IOPC case records a
dispatcher who never relayed a vulnerable-adult status; the man was found dead
six days later, and the recommendation was that the force *define what a
dispatcher must relay* — an admission that no such definition existed
(https://www.policeconduct.gov.uk/sites/default/files/documents/Issue_41_Case7.pdf).
CORROBORATED. US parallel: Denver, where a call-taker documented that the
husband was retrieving a gun from a safe and police stated units were not
updated for 13 minutes
(https://www.cbsnews.com/news/denver-dispatcher-quits-after-911-caller-is-killed/).

**The label itself de-prioritises.** Milwaukee, July 2026: a Life Alert
employee reported an ongoing attack on a 99-year-old woman; it was classified a
level-three welfare check where a battery-in-progress would have been level
two. She waited roughly three hours and called 911 herself. The city's
emergency communications director said publicly it should have been higher
priority
(https://www.jsonline.com/story/news/investigations/2026/07/29/milwaukee-releases-horrific-911-calls-of-attack-on-elderly-woman/91097967007/,
CORROBORATED with https://lawandcrime.com/crime/99-year-old-woman-beaten-during-home-invasion-had-to-wait-3-hours-for-help-to-arrive-after-calling-911-with-life-alert-police/).

**Dispatchers do confirm the harassment use.** A r/911dispatchers thread on
out-of-state checks contains a dispatcher noting some exes request welfare
checks to harass an ex-partner
(https://www.reddit.com/r/911dispatchers/comments/1ib7iwc/welfare_checks_in_another_state/);
a second thread has dispatchers questioning whether a repeat caller giving
false information is "the appropriate use of a welfare check"
(https://www.reddit.com/r/911dispatchers/comments/1qmcvpa/welfare_check/).
Both SNIPPET-LEVEL, CORROBORATED as a pair.

**Can a resident call back and verify?** Yes, and the mechanics are on record.
A supervisor at Guilford Metro 911 (Greensboro NC) described checking whether
officers are in the area by GPS plus radioing to ask directly — under a minute,
and it works **without the officer's name**
(https://www.wfmynews2.com/article/news/verify/verify-911-police-badge-officer-deputy-traffic-stop-wfmy/83-dd9be5ed-2a87-4daf-b75f-527efac319ed).
Four named current and former police officials endorse it across two
independent outlets, including former Bergen County NJ Chief Brian Higgins
advising standing to the side and speaking through the door while calling
(https://www.foxnews.com/us/deadly-lawmaker-ambush-minnesota-raises-fears-about-fake-police-officers-knocking-on-doors,
https://www.huffpost.com/entry/how-to-spot-fake-police-officer_l_685046ffe4b0433336889b1c).
A North Dakota sheriff describes being verified himself by a driver who did not
believe him, and being fine with it
(https://www.inforum.com/news/fargo/officers-explain-how-to-check-if-an-officer-is-real-after-impersonator-shootings).

**But the caveat is the finding:** every documented instance of verification
*actually happening* is a traffic stop or a phone scam. No dispatcher describes
it as routine at a residential door, and most of the residential advice was
published in the fortnight after the June 2025 Minnesota lawmaker shootings.
**Cheap, fast, endorsed, apparently almost never used.**

> **What dispatchers add that nobody else does**
> - Whoever is at your door is acting on a **third-generation summary**. The
>   person who took the call and the person who told the officer are usually
>   two different people, and the second rewrites the first's work.
> - "Welfare check" is a **queue position**, not a purpose. Which means a
>   caller who wants a fast response learns to avoid the phrase — and a caller
>   who wants a slow, low-scrutiny police visit to someone's door learns the
>   opposite.
> - The information the officer most needs may be sitting in CAD and never
>   spoken aloud. Kenosha County moved low-priority details to in-car terminals
>   in April 2025; the neighbouring city PD refused. **Two agencies, one
>   county, opposite regimes, and the resident cannot know which is on their
>   porch** (https://kenoshacountyeye.com/2025/04/17/kenosha-law-enforcement-agencies-diverge-on-radio-dispatch-policy-changes/).
> - NENA has publicly warned against covert-signal folklore. On the Ohio "pizza
>   order" DV call, a NENA official told AP that ordering pizza is not standard
>   practice and expecting secret phrases to work anywhere is dangerous
>   (https://www.bbc.co.uk/news/world-us-canada-50513706). **Amparo must never
>   teach a code phrase.**

### 4.2 — Paramedics and EMS: the medical welfare check

**The broken door is an expected outcome class, not a failure state.** EMS1's
paramedic-chief analysis lists welfare-check results as including "no patient
present, a non-billable transport refusal, or a civilian distressed by their
broken door or window," and notes **under 20% generate actual patient care
needs**
(https://www.ems1.com/paramedic-chief/articles/lessons-to-apply-welfare-check-incident-became-a-lodd-p5M1tHBszoIzArRS/).
SINGLE-SOURCE for the framing, but it is the most load-bearing sentence located
in this entire research pass.

**EMS models the resident's fear as rational and builds procedure around it.**
EMS1 guidance tells crews to call out "fire department" or "EMS," to avoid
standing directly in front of the door or windows, and to place one partner
back from the porch
(https://www.ems1.com/paramedic-survival/dont-let-your-guard-down-welfare-checks-can-turn-deadly).
Mike Taigman's guidance to crews frames hostility and self-defence-inspired
violence as "normal, rational and reasonable responses to someone forcing their
way into a home"
(https://www.ems1.com/ems-products/personal-protective-equipment-ppe/articles/reality-training-shots-fired-during-forced-entry-for-patient-welfare-check-aJC0LQ6PldP6q8Hs/,
CORROBORATED — quote verified directly on the page).

**The two uniforms have opposite powers, and the public cannot tell them
apart.** JEMS material states it is not EMS's job to enforce laws
(https://www.jems.com/ems-management/go-to-the-hospital-or-go-to-jail/).
Minneapolis-area medics said they risked being mistaken for and attacked as
police, and changed uniform colours over it
(https://www.ems1.com/ems-management/articles/minneapolis-area-ems-plans-uniform-change-to-distinguish-medics-from-law-enforcement-PeTPsbAnMQOCW33m/).
BC paramedic Amelia Bridge states refusal "always has to come from the
patient," while a union VP notes officers can compel assessment under
mental-health authority
(https://thetyee.ca/News/2025/06/18/Someone-Calls-911-Can-You-Refuse-Care/,
Canadian and operationally distinct — treat as directional).

**Honest counterweight the sources force.** No EMS first-person account was
found of a *minutes-scale* time-critical loss caused by a resident refusing the
door. The catastrophic delay cases located run in **weeks and months** —
hoarding, uncollected mail
(https://medicscribe.com/2025/06/hoarders/, SINGLE-SOURCE narratives).

> **What EMS adds that nobody else does**
> - The forced entry frequently produces **nothing**, wrecks a door, and the
>   profession treats that as cost of doing business. Legal and police sources
>   frame entry as justified-or-not; EMS literature quietly concedes the base
>   rate.
> - It is the only profession that **engineered its door approach around the
>   resident's rational fear** — announce, stand off-centre, keep a partner
>   back — rather than treating fear as an obstacle.
> - The resident is making a consent decision against a uniform whose authority
>   they cannot read, **and the person wearing it knows that.**
> - The people most likely to refuse have a concrete, correct reason. A medic
>   writing on hoarding cases notes these residents fear someone will take all
>   their things — and they are right about what intervention brings.

### 4.3 — Child-welfare social workers (CPS/DCF/DSS)

**The knock is often the END of information gathering, not the beginning.** A
practitioner explains interviewing children first with "We don't know who you
are until after we start talking"
(https://www.socialwork.career/2014/08/a-day-in-life-of-cps-social-worker.html);
two state agencies confirm child interviews may begin at school or daycare
before parents are contacted
(https://cfsa.dc.gov/page/when-child-welfare-investigates-your-family,
https://dfps.texas.gov/Investigations/parents_guide_to_investigation.asp).
STRONGLY CORROBORATED. **Residents negotiate at the door believing they control
the first impression; the worker may be there to close a file.**

**Refusal is a scored variable, and the scorer is the person you are arguing
with.** Research on caseworker risk assessment reports "Cooperation with
agency" as a significant predictor of recurrence risk with the highest
parameter estimate in the model, scored subjectively on the caseworker's
impression
(https://pmc.ncbi.nlm.nih.gov/articles/PMC3094152/ — ⚠️ SNIPPET-LEVEL, verify
before relying). An ACLU affiliate describes a worker testifying that a parent
"appeared hostile because your arms were crossed"
(https://www.aclusocal.org/know-your-rights/california-child-welfare-investigations-101/,
SINGLE-SOURCE).

**The counter-trap: UK safeguarding guidance names "disguised compliance"** —
appearing to co-operate to avoid raising suspicion — and lists **cleaning the
house before visits** among its examples
(https://greatermanchesterscp.trixonline.co.uk/chapter/dealing-with-persistent-non-engagement-with-services-by-uncooperative-families,
SINGLE-SOURCE, UK). **There is no door performance that reliably scores well.**

**Documented doorstep pressure scripts.** A ProPublica/NBC investigation built
on interviews with 36+ former NYC caseworkers records lines including not
wanting to discuss your business "out here in the hallway," "Why not, if you
don't have anything to hide?", and "Well, I'm not going to stop coming"
(https://www.propublica.org/article/child-welfare-search-seizure-without-warrants).
The same investigation reports agencies obtain fewer than 94 entry orders a
year on average — a warrant under 0.2% of the time. ⚠️ **SINGLE reporting
project** (two outlets, one investigation) — flag before using.

**Police presence.** Stated triggers are worker-safety variables including
"The caseworker is new or uncomfortable"
(https://medium.com/the-protective-code-texas-cps-family-law/police-involvement-in-cps-cases-explained-what-it-means-and-why-it-happens-c07f74e608b1).
Family-side material notes parents read police presence as an arrest signal,
and that the misread is itself the leverage
(https://www.psbnylaw.com/blog/2024/march/can-cps-or-acs-enter-my-home-/,
CORROBORATED).

**Impersonation happens here too.** Texas requires the investigator to show a
departmental badge
(https://dfps.texas.gov/Investigations/parents_guide_to_investigation.asp);
news from two regions documents people impersonating CPS workers at residential
doors, one caught by a missing state badge and a misspelled child's name
(https://www.aol.com/mom-warning-parents-stranger-claiming-171707069.html,
https://cbsnews.com/amp/pittsburgh/news/fake-caseworker-tries-taking-child-home).
CORROBORATED.

> **What child-welfare workers add that nobody else does**
> - **The urgency at the door is a deadline artifact, not a verdict about you.**
>   The worker is running a 24- or 72-hour clock to lay eyes on a child
>   (https://dcyf.wa.gov/policies-and-procedures/2310-child-protective-services-cps-initial-face-face-iff-response).
>   The resident hears accusation; the worker is experiencing a scheduling
>   cascade.
> - **Nothing marks the moment cooperation becomes evidence.** There is no
>   notification ritual before a CPS conversation the way there is before
>   police questioning
>   (https://theappeal.org/child-welfare-family-policing-miranda-rights/).
> - Over 90% of children remain home after an investigation
>   (https://invisiblechildren.org/2026/06/11/cps-misconceptions/) — meaning
>   the resident's catastrophic prediction at the door is usually wrong, which
>   is itself worth knowing before deciding how to behave.
> - Escalation at the threshold is the **most-described first reaction from
>   both sides of the door** — workers record openings like "WHO CALLED
>   YOU!!!", parent-side accounts list panicking or arguing as mistake #1.

### 4.4 — Immigration advocates: ICE at the door vs local police

**This is the section the module cannot skip, and the operator's design
document does not currently contain.**

**Advocates document agents identifying as "police."** The Immigrant Defense
Project catalogues plain clothes or vests reading "POLICE," concealed ICE
identification, and introductions as "Detective [Name]" from a named precinct,
as probation officers, or as identity-theft investigators
(https://www.immigrantdefenseproject.org/ice-ruses/). ILRC independently
describes officers in plain clothes with vests reading "police," agents who did
not identify themselves, and door-pounding
(https://www.ilrc.org/community-resources/closer-look-dhs-interior-enforcement-practices).
CORROBORATED across two orgs.

**Advocates therefore teach agency identification FIRST.** IDP's sequence: ask
for ID and where they work; if they say "police," ask whether they are from DHS
or ICE. **Every other profession's advice starts at "police are at the door."
Immigration advocates are the only ones who insist step zero is determining
which police.**

**The tool they built is a document, not a script.** ILRC red cards are
double-sided by design — the person's language on one side, English on the
other for presentation to the officer — in **59 languages**, with ILRC stating
10 million distributed since November 2024
(https://www.ilrc.org/redcards, https://ilapmaine.org/red-cards). ILRC's flyer
advises not opening the door even a little to view a warrant, and asking for it
to be slipped under the door or shown through a window
(https://www.ilrc.org/community-resources/know-your-rights/know-your-rights-when-confronted-ice-flyer);
rapid-response networks describe the reciprocal move, sliding the card out
(https://www.northbayop.org/nbrrn-faqs,
https://www.paimmigrant.org/rapid-response-information). CORROBORATED.

**The card solves two problems a spoken script cannot: the resident never has
to produce English, and never has to produce speech. The door stays closed
throughout.**

**⚠️ And advocates have partially reversed on it.** Reporting describes rapid
responders seeing people detained immediately upon producing a red card, on the
inference that anyone holding one is undocumented — characterised as "little
red targets" — with ILRC's reported current guidance being to *memorise* the
content rather than use the card as a shield
(https://lataco.com/know-your-rights-card-holders-detained). **SINGLE-SOURCE
for the reversal.** Any recommendation built on the card must carry this
caveat. It is a *communication* solution, not a *protection* solution, and its
own authors now say so.

**The consequence distinction, stated by a public defender office.** The
Defender Association of Philadelphia's material notes that after a police
arrest a judge should appoint a public defender, whereas after an ICE arrest
there is a right to an attorney but not to a free or appointed one
(https://phillydefenders.org/immigrant-rights/, CORROBORATED with
https://acaciajustice.org/know-your-rights-ice/). **Same door, same knock,
categorically different downstream.**

> **What immigration advocates add that nobody else does**
> - Agency identification is a **prerequisite, not a detail**, and they supply
>   the specific probe because a vest reading POLICE does not answer it.
> - They engineered a **non-verbal, non-English, door-closed artifact** and
>   iterated it into 59 languages. Nobody else treats "the resident may be
>   unable or too afraid to speak" as the *baseline* design constraint.
> - They supply the **pre-knock timeline** — phone ruses, address-confirmation
>   calls, weeks of surveillance. The knock is the end of an operation, not the
>   start of one.
> - They have **publicly walked back their own signature tool** under field
>   reports. That intellectual honesty is the model Amparo should copy.

### 4.5 — Disability advocates: the resident who cannot perform a verbal script

**The core documented failure: non-response is read as defiance.** The Center
for Disability Rights states of two named Deaf men killed by police that "they
were shot and killed because they couldn't hear the officers' orders"
(https://www.cdrnys.org/blog/advocacy/police-interaction-with-the-deaf/,
CORROBORATED with https://www.aclu.org/news/national-security/police-brutality-and-deaf-people).

**The closest documented analogue to a door encounter: Magdiel Sanchez.**
Officers responding to an address encountered Sanchez, 35, on his own porch
holding a metal pipe. Neighbours shouted that he was deaf and could not hear;
officers gave verbal commands, then Tasered and shot him, and stated they did
not hear the neighbours
(https://www.npr.org/sections/thetwo-way/2017/09/21/552527929/oklahoma-city-police-fatally-shoot-deaf-man-despite-yells-of-he-cant-hear-you,
https://www.cnn.com/2017/09/21/us/police-shoot-deaf-man-oklahoma-city-trnd).
HEAVILY CORROBORATED. **The person was at his own home, the commands were
shouted, and the third parties supplying the missing context were themselves
not heard.**

**The recommended instrument is, again, a card.** Rochester PD developed visor
cards for Deaf people to hand to officers
(https://cdrnys.org/blog/advocacy/announcing-new-police-communication-visor-cards/);
NAD points people to a written memo to hand over
(https://www.nad.org/resources/justice/police-and-law-enforcement/); several
states distribute communication or visor cards
(https://dmv.vermont.gov/deafvisorcard,
https://idhhc.illinois.gov/programs-and-services/communication-cards-and-brochures.html).
HEAVILY CORROBORATED.

**Autistic-advocate framing on why compliance scripts fail.** The behaviours
officers read as evasion or intoxication — avoiding eye contact, echolalia,
pacing, going still, not answering — are common in autism, and shouted commands
and physical contact intensify overwhelm, making compliance *less* likely
(https://www.criminallegalnews.org/news/2023/dec/15/dangerous-encounters-interactions-between-autistic-individuals-and-law-enforcement/,
https://www.psychologytoday.com/us/blog/psychology-meets-neurodiversity/202405/how-to-improve-autistic-encounters-with-law-enforcement,
CORROBORATED across three).

**ASAN's position challenges the premise of training itself:** "training alone
is insufficient to protect our community," and the answer is fewer unnecessary
police encounters rather than better-trained officers
(https://autisticadvocacy.org/2026/03/dhs-violence-endangers-the-autistic-community/).

**And the refusal mechanism is itself speech-gated.** Peer-reviewed guidance on
accessible consent notes that processes not allowing alternative communication
exclude people who are non-speaking, even when they fully comprehend written
material (https://pmc.ncbi.nlm.nih.gov/articles/PMC12448064/, SINGLE-SOURCE but
a research synthesis). **"Say 'I do not consent'" is a consent mechanism gated
on speech. For a real population, the refusal is inaccessible.**

**The uncomfortable wrinkle:** reaching for the card is a hand movement toward
a pocket, and reporting notes officers may read a Deaf person reaching for a
notepad as reaching for a weapon
(https://www.legalexaminer.com/cstern/home-family/black-deaf-americans-face-extra-obstacles-when-dealing-with-police/,
SINGLE-SOURCE). **The remedy carries its own risk.**

> **What disability advocates add that nobody else does**
> - **"Didn't answer" and "refused to answer" are indistinguishable from
>   outside, and the system defaults to the second reading.** Every other
>   profession treats non-response as a tactic the resident chose.
> - The script must survive **being shouted at** — and escalation reduces
>   compliance capacity, meaning advice that works only in calm conditions
>   fails exactly when it is needed.
> - They independently invented **the same wallet card as the immigration
>   advocates**, decades apart, for unrelated populations. That convergence is
>   the strongest design signal in this entire research set: **the artifact,
>   not the phrase, is the right primitive.**
> - They alone say the fix is not a better script.

### 4.6 — Public defenders

**The consent base rate is the whole game.** Over 90% of U.S. police searches
rest on individual consent (§2, #1) — meaning the door conversation, not the
warrant, is the dominant mechanism. **Everyone else's advice is about the
exception; PDs work the rule.**

**Two PD offices name specific door errors.** Broward County flags apologising
(treatable as an admission) and consenting to a search, with the observation
that an officer asks permission precisely because he lacks the basis to proceed
without it (https://www.browarddefender.org/know-your-rights/). Philadelphia
advises speaking through the door and names the compliance assumption
(https://phillydefenders.org/immigrant-rights/). CORROBORATED on the
consent-request logic across several defender offices
(https://www.ripd.org/knowyourrights.html,
https://dpa.ky.gov/kentucky-department-of-public-advocacy/findhelp/rights/).

**Structural observation.** Most PD public education skews post-arrest — the
Missouri State Public Defender's Know Your Rights page covers voting, benefits,
and treatment in custody, with no door guidance at all
(https://publicdefender.mo.gov/know-your-rights/, SINGLE-SOURCE as an
observation). **PD offices meet people after the door; their public education
is oriented to the phase they own.** Which is a large part of why the void is
filled by private-firm marketing.

> **What public defenders add that nobody else does**
> - They see the door only in **retrospect, as a fact pattern**. By the time it
>   reaches them, "he opened the door" has already become the hinge everything
>   after it swings on.
> - **The apology.** Nobody else in this research set names it.
> - They invert the resident's instinct: **the request for permission is the
>   tell that permission is needed.**

### 4.7 — Apartment property managers: the renter's door is a different door

**There is a third party standing behind a renter's door.** An apartment
industry consultancy's staff protocol routes all law enforcement to the
property manager with a scripted deflection line, and instructs staff never to
provide access codes, master keys, or unit numbers; it recommends a logbook of
all law enforcement interactions recording names, badge numbers, times, and
areas accessed
(https://www.ajjcs.net/paper/main/2025/02/02/dealing-with-federal-immigration-agents-at-apartment-communities/,
CORROBORATED with
https://naahq.org/news/member-resource-update-immigration-enforcement-and-rental-housing).

**Cooperation is discretionary and varies building to building.** NAA's member
resource states managers may *choose* whether to cooperate with requests for
resident logs or information
(https://naahq.org/news/member-resource-update-immigration-enforcement-and-rental-housing,
CORROBORATED with
https://aptnewsinc.com/news/when-housing-providers-and-residents-get-a-knock-on-the-door-from-ice-agents/).
**The protection a renter gets at their door is a policy choice made by their
management company, which they never saw and did not agree to.**

**The redirect tactic.** A landlord-side law firm advises managers who decline
to disclose tenant information to "suggest that the officer speak to others who
can provide the information," giving **neighbouring residents** as the example
(https://www.kts-law.com/government-agencies-and-private-individuals-rights-to-tenant-information-and-rights-to-entry/,
SINGLE-SOURCE). **A resident who believes their building is protecting them may
be protected only from the manager disclosing — the same inquiry gets routed to
the person across the hall, who has no policy, no training and no warning.**

**The landlord could not identify the agency either.** Chicago property owner
Arminda Castelin described a raid at her building; her tenant phoned saying
"Police are trying to break into our house." She arrived to find broken doors
and six residents detained. On the agents: "They say police, but they don't
even know what kind of people it is"
(https://www.cbsnews.com/chicago/news/landlord-says-residents-taken-west-side-chicago-building-ice,
SINGLE-SOURCE for this building). **§4.4 asks residents to identify the agency
in a situation where the person holding the lease file and the master key could
not.**

**The "it's just maintenance" knock.** Documented across three incidents in two
metros plus a police advisory: armed men in reflective vests calling
"Maintenance!" in Oklahoma City
(https://kfor.com/news/local/fake-maintenance-workers-rob-oklahoma-city-couple-at-gunpoint/);
fake maintenance workers attempting to kick a Dallas door in
(https://www.nbcdfw.com/news/local/resident-opens-fire-after-pretend-maintenance-worker-tries-to-kick-down-his-door-police-say/3323400/);
an Ithaca NY police warning
(https://www.yahoo.com/news/ithaca-police-warn-man-impersonating-144911259.html).
CORROBORATED.

**The operative detail is the management statement that followed:** the OKC
complex told tenants maintenance will never arrive unannounced and will wear
uniforms, not construction clothes. **That is the only building-specific,
checkable-through-a-closed-door authentication rule found anywhere in this
research — and it requires no legal knowledge, no English, and no speech.**

> **What property managers add that nobody else does**
> - **The corridor problem.** By the time an officer knocks on an apartment
>   door, they may have crossed no yard, no walk, no porch. Advice premised on
>   a homeowner's threshold silently assumes a buffer renters do not have.
> - The **third actor** with a master key and a discretionary cooperation
>   policy.
> - The **redirect-to-neighbours tactic**, which nobody in the tenant-advocacy
>   literature appears to know is advised practice.
> - **The only workable authentication rule in the entire research set.**

---

## 5. The DV problem

> This section exists because §6.5 of the wargame design document already
> spotted the edge of it. The research says it is not an edge case. It is
> plausibly the **modal** case for the exact sentence the module is built
> around.

### 5.1 The premise: "we got a call about this address" is very often a DV call

Domestic-violence-related calls have been described as the single largest
category of calls received by police, accounting for **15 to more than 50
percent of all calls**. The original statement is in NIJ's *Practical
Implications of Current Domestic Violence Research*
(https://www.ojp.gov/pdffiles1/nij/225722.pdf) and is repeated in a
peer-reviewed 2022 BMC Public Health study
(https://link.springer.com/article/10.1186/s12889-022-14901-3), a William & Mary
law-review article
(https://scholarship.law.wm.edu/cgi/viewcontent.cgi?article=2711&context=facpubs),
and an ACLU coalition letter to DOJ
(https://www.aclu.org/documents/aclu-coalition-letter-doj-re-gender-biased-policing).

**Honest qualification:** these are four independent *citations* of what traces
back to one NIJ statement, not four independent measurements. Treat as
"widely-cited and directionally solid," not as a replicated finding.

### 5.2 Why "never open, say nothing" is not automatically the protective move here

**(a) The officer at the door may be running a screening tool designed to reach
the person inside.** Under the Lethality Assessment Program, officers
responding to a DV incident ask a series of screening questions and, when
someone screens high-risk, may put them in touch with a local DV programme on
the spot. It was developed with Dr Jacquelyn Campbell after research found only
4% of DV homicide victims had contacted a hotline, shelter, or programme before
being killed. Pennsylvania alone reports 436 law enforcement agencies and 48 DV
programmes participating
(https://www.pcadv.org/initiatives/lethality-assessment-program/); jurisdictions
in at least 31 states have implemented it
(https://www.oag.state.va.us/programs-outreach/lethality-assessment-program,
https://www.peerta.acf.hhs.gov/content/lethality-assessment-program-maryland-model-lap).
CORROBORATED.

**A module that trains "say nothing, never open" without qualification trains a
survivor out of the single moment engineered to reach them.**

**(b) The module's signature beat inverts.** Wargame §3 beat 4 — *"Just step
out for a second"* at `ci:43` — is designed to teach that conceding position is
irreversible. But **separating the parties and interviewing them out of sight
and sound of each other is standard DV response practice**: sight-and-sound
separation, one person in the living room and another in a bedroom with a
different officer
(https://www.domesticshelters.org/articles/legal/how-police-are-trained-to-respond-to-domestic-violence,
CORROBORATED with
https://www.ojp.gov/ncjrs/virtual-library/abstracts/victim-interviewing-cases-domestic-violence-techniques-police,
and with the officer-side framing at §3.4).

**In a DV context, moving one person away from the other is frequently the
officer's attempt to let them speak freely. The module's signature lesson —
never concede position — is, in that scenario, teaching a survivor to refuse
the one move that would let them disclose safely.**

**⚠️ Precision required here, from §3.4.** *Separation on domestic calls* is
well corroborated. *"Step outside" as a general door tactic* is **not** —
no published academy curriculum found teaches it that way, and the only
POST-level mention is a narrow solo-officer variant. So the honest statement of
the collision is narrower than it first looks, and the coach copy must respect
the difference:

- Supported: on a domestic call, an officer may try to get one person away from
  the other, and that separation exists to help the person who cannot speak
  freely.
- **Not** supported: that officers are trained to lure people across the
  threshold to strip protections. That framing comes from civilian legal
  marketing, not from officer training.

This is still the sharpest collision between the design and the research, and
it still needs an explicit answer before ship.

**(b2) And officers are trained not to take "everything's fine" at the door.**
Michigan's POST curriculum instructs that when the suspected assailant answers,
the officer does not accept statements that the call was a mistake, expects
denial and minimisation, asks to speak to each person at the residence, and
**refuses to leave without speaking to the victim**
(https://www.michigan.gov/-/media/Project/Websites/mcoles/TD-Webpage/2021_basic_training_manual_rev_feb_2021.pdf,
SINGLE-SOURCE at POST level; mainstream DV-response standard).

**Read that against the module's thesis.** Amparo's door module teaches a calm,
flat, repeated refusal at the threshold. On a DV call, published training tells
the officer that exact behaviour from the person who answers is the *expected
presentation of the assailant*, and instructs them not to leave on it. **The
module's winning move and the officer's trained trigger are the same
behaviour.** Nobody in the source videos knows this.

**(c) The person who answers the door may not be the person the call is
about.** The module models one resident and one door. The DV case has at least
two people inside, and the one who can reach the door is frequently not the one
in danger. Officers are trained to observe and listen before announcing
themselves partly for this reason
(https://www.domesticshelters.org/articles/legal/how-police-are-trained-to-respond-to-domestic-violence).
**Amparo's engine has no concept of "someone else is standing behind you."**

**(d) Minimising at the door is expected, not exceptional.** Police trainer
Michael P. LaRiviere: "It's normal for a victim to be fearful about telling us
what's really going on" (same source). A module that scores a confident,
composed refusal as the green square is scoring the exact behaviour a
frightened person under observation produces — **and calling it a win.**

### 5.3 Why "always open and cooperate" is equally wrong

The research does not support flipping the advice. It supports refusing to give
a single answer.

- **Dual arrest.** Multiple studies find mandatory arrest laws raise the odds
  that the survivor is arrested: Hirschel et al. found dual-arrest odds
  significantly higher in mandatory versus discretionary jurisdictions; Durfee
  (2012) found mandatory arrest positively associated with female and dual
  arrest; Frye et al. (2007) recorded 5% unwanted arrests, 9% dual arrests, 24%
  retaliatory arrests (all reviewed in
  https://pmc.ncbi.nlm.nih.gov/articles/PMC11238628/, Kajeepeta et al. 2024).
  Advocacy organisations campaign on this directly — the Connecticut Coalition
  Against Domestic Violence has proposed a dominant-aggressor clause explicitly
  to reduce the state's dual-arrest rate
  (https://www.ctcadv.org/download_file/force/127/210). CORROBORATED.
- **Reduced help-seeking.** Dugan (2003) found mandatory arrest laws associated
  with lower odds of informing police (same review). Qualitative studies in the
  review record survivor concerns about loss of autonomy and fear that arrest
  triggers retaliation or child protective services involvement.
- **Retaliation after officers leave.** Advocacy material states that if police
  check on a survivor and there is no cause for arrest, the abuser may
  retaliate once they leave — which is why calling police without a survivor's
  knowledge or consent is described as dangerous
  (https://www.domesticshelters.org/articles/escaping-violence/calling-the-police-shouldn-t-be-another-barrier).
- **DARVO and disbelief.** The same body of advocacy material describes abusers
  reversing victim and offender, sometimes resulting in the survivor being
  arrested (same source).
- **Unequal risk.** Advocates describe layered barriers in Black and brown
  communities — mistrust, fear of criminalisation, cultural stigma
  (https://www.kqed.org/news/12053754/shame-keeps-women-silent-bay-area-advocates-rethink-help-for-domestic-violence-survivors,
  https://www.calhealthreport.org/2021/12/21/domestic-violence-survivors-often-dont-want-to-call-the-police-california-tries-a-new-approach/).

### 5.4 The knock may itself be the abuse

Legal Services of New Jersey's coercive-control material lists, under false
reports to authorities, "calling 911 to make false claims about the victim, or
calling the police to do welfare checks on the victim for no reason," and
separately filing false child-protection reports
(https://www.lsnjlaw.org/legal-topics/family-relationships/domestic-violence/get-restraining-order/pages/invisible-chains).

Corroborated by pattern documentation: a legal-practice publication records a
father requesting welfare checks on 23, 25, 28 and 30 December in one holiday
period
(https://www.dailyjournal.com/articles/384362-calling-the-police-for-welfare-checks-privileged-communication-or-harassment,
https://www.jamsadr.com/insight/2025/calling-the-police-for-welfare-checks); a
California record describes a mother in confidential DV housing repeatedly
telephoned by police asking her address so a father-requested welfare check
could be performed, with seven requests logged across three weeks, often
minutes after a missed video call
(https://fvaplaw.org/wp-content/uploads/2023/10/B322439_Opinion-1.pdf —
reporting the described operational practice only, not any holding). And
dispatchers themselves confirm the harassment use (§4.1). CORROBORATED.

**So the same sentence — "we got a call about this address" — can mean: a
neighbour heard something real; the person inside called and cannot now say so;
or the abuser called, from elsewhere, to make police arrive at the survivor's
door tonight. The module cannot distinguish these and neither can the user.**

### 5.5 What a DV advocate would say is dangerous about the module's script

Stated as questions for the DV clinician review the wargame already schedules
(§6.5, blocks ship) — **not as answers.** I am not qualified to answer these
and neither is a model.

1. **The green square problem.** If a survivor plays this module, holds the
   door, says nothing, and gets a perfect score — has Amparo just rehearsed
   them into the behaviour that ends with officers leaving and the abuser still
   inside?
2. **The step-outside inversion.** Beat `ci:43` teaches never to concede
   position. Sight-and-sound separation is standard DV practice. Does the
   coach copy need to name this exception out loud, and if so, how — without
   turning a rehearsal app into DV advice?
3. **The second person in the house.** Every setter is written in the second
   person singular. Does the DV case need a beat, a setter, or a whole exit
   that acknowledges someone else is listening?
4. **The intercept list.** §6.5 already specifies a DV intercept reusing
   `prCurTier='x'`. This research says its trigger surface is wider than
   suicidality-style phrases: it must also catch *"my partner called this in"*,
   *"they're here right now"*, *"I can't talk"*. Who authors that list, and does
   NENA's warning against covert-signal folklore (§4.1) mean the app must
   **never** teach a phrase to say in front of someone?
5. **Practising in a shared home.** Wargame §6.7 notes the door module is the
   scenario most likely to be played with the person it concerns in the next
   room. In the DV case that is not a hypothetical. Does that change the
   quick-exit decision that was previously settled?

### 5.6 The one thing I would put in front of a DV advocate first

Not a design question — a framing one. **Every other Amparo scenario has a
correct answer. This one may not.** The research is consistent that both
"never open" and "always cooperate" produce documented harm in DV contexts, and
that which one is right depends on facts the app cannot see. The engine already
has the honest shape for that: `bothGood:true` (wargame §3 beat 7), where
neither option is scored as a miss.

**If the DV reality cannot be scored, do not score it.**

---

## 6. Where the lawyer videos are incomplete

The source videos are lead-generation content from one firm's channel; the
digest says so itself. The gaps below are not accusations of inaccuracy — they
are things the other perspectives supply and the marketing format structurally
cannot.

1. **They model one resident behind one door.** No second occupant, no children
   who are already the subject of the call, no roommate, no abuser. §5 and §4.3
   both break on this.
2. **They assume the resident can speak, in English, calmly, on cue.** §4.5
   documents an entire population for whom that is not available — and §4.4
   documents advocates who abandoned the spoken script as a primitive and built
   a card instead.
3. **They assume the knock is the first event.** §4.4 (phone ruses,
   surveillance) and §4.3 (child interviewed at school first) both show the
   knock is often the last step of something already underway.
4. **They do not distinguish agencies.** ICE, local police, CPS, EMS, a
   maintenance worker and an impersonator produce very different encounters and
   very different consequences (§4.4, §4.3, §4.2, §4.7). A vest reading POLICE
   does not resolve it — and a property owner could not resolve it either
   (§4.7).
5. **They assume a homeowner's threshold.** The apartment corridor (§4.7) is
   not a porch, and there is a manager with a master key and an undisclosed
   cooperation policy standing behind it.
6. **They frame the caller as neutral.** §4.1 and §5.4 both document the call
   itself being the hostile act.
7. **They omit the verification move that police chiefs themselves endorse.**
   Calling dispatch to confirm a unit is at your address is cheap, fast, works
   without the officer's name, and is on the record from a named dispatch
   supervisor and four named police officials (§4.1). It is also the move that
   protects against the one door threat that is unambiguously dangerous —
   impersonation (§2 #8).
8. **They treat the script as the hard part.** The consent research says the
   hard part is *executing* it — refusal under a polite face-to-face request is
   far harder than people predict (§2 #1). A rehearsal app is actually the
   right response to that finding, which is a genuine point in Amparo's favour;
   a video is not.
9. **They flatten risk across users.** The ACLU of Ohio runs a Know Your Rights
   series explicitly framed as *Rights Versus Reality*, addressing what
   Ohioans, "particularly People of Color," experience when exercising
   constitutionally protected rights — and it includes a scenario titled *Law
   Enforcement at Your Home*
   (https://www.acluohio.org/know-your-rights/know-your-rights-rights-versus-reality/).
   **A non-marketing civil-liberties organisation building the same scenario
   Amparo is building thinks the rights-vs-reality gap is important enough to
   name in the series title. The marketing videos do not have that gap in
   them at all.**
10. **They end when the officer leaves.** Nothing in the videos covers the
    repeat visit (§4.3, §4.1), the retaliation after officers go (§5.3), or the
    scored-cooperation consequence (§4.3).

11. **Two of their framings are unsupported by anything officers actually
    publish.** No officer-voice source found says knock-and-talks work because
    people don't know their rights — that claim lives only in defence-attorney
    and encyclopedia writing (§3.9). And no published academy curriculum found
    teaches "get them to step outside" as general door practice (§3.4).
    **Both are marketing-side framings presented as inside knowledge.** The
    attorney review should be told this explicitly, because two `SOURCE_HINT`
    placeholders in the wargame (§3 beats 4 and 2) point at exactly these
    claims.
12. **They never mention that the resident's alarm is engineered.** Officers are
    trained to approach quietly, park down the street, and stand where the
    peephole does not show them (§3.3). The resident's startle is a designed
    output of the approach — which is a far kinder explanation for the
    politeness reflex than "you were naive," and it is the register wargame
    §6.6 is asking for.

**Two things the videos are right about that the research confirms.**

The **broken-record repetition** mechanic: the digest flags it as the only
*behavioural* rather than legal claim in the batch, and the officer-side
literature independently agrees that a calm, non-argumentative repeated
position does not change the outcome and does not escalate — while an
*argumentative* one lengthens the encounter (§3.8). Wargame §3 beat 6 is safe
ground, **with the constraint that the copy must stay flat rather than
combative.**

And the **closed door as default**: police departments' own community education
says the same thing (§3.5, Tampa PD).

---

## 7. Scenario seeds

Concrete situations the module should be able to represent, each tagged with
the perspective that produced it. **None of these are authored beats** — they
are the situations an attorney and a DV clinician should be asked to rule on.

| # | Situation | Suggested by |
|---|---|---|
| S1 | Neighbour complained about smoke/noise; officer opens with the complaint, not an accusation | Residents §2 #4 |
| S2 | Officer is looking for the previous tenant on a stale warrant address | Residents §2 #6 |
| S3 | "We got a call about this address" and the caller is an estranged relative or ex, from another state | Dispatch §4.1, Residents §2 #7 |
| S4 | Someone at the door says police but the resident cannot verify it; the phone is in reach | Residents §2 #8, Dispatch §4.1 |
| S5 | The knock is at an apartment door in an interior corridor, and a manager is standing next to the officer | Property managers §4.7 |
| S6 | A voice says "maintenance" and the resident has no appointment | Property managers §4.7 |
| S7 | Two people at the door, one in a uniform the resident cannot classify, one carrying a medical bag | EMS §4.2 |
| S8 | The resident is Deaf or non-speaking and cannot answer a shouted question at all | Disability §4.5 |
| S9 | The person at the door will not say which agency they are from | Immigration §4.4 |
| S10 | The resident is asked to confirm their name before anything else happens | Immigration §4.4, Residents §2 #3 |
| S11 | A caseworker, not an officer, with a child already interviewed elsewhere | Child welfare §4.3 |
| S12 | "Can you step outside for a second" — and someone else is in the house | **DV §5.2(b) — the inversion beat** |
| S13 | Another adult in the household reaches the door first | DV §5.2(c) |
| S14 | The resident is the person the call was about, and cannot say so | DV §5.2(a) |
| S15 | The same officers return three days later | Child welfare §4.3, Dispatch §4.1 |
| S16 | Officers leave without entering, and nothing is resolved | EMS §4.2 base rate, DV §5.3 |
| S17 | The resident answers holding something — a phone, a kitchen knife, a firearm — and does not think of it as relevant | LE §3.5 (O'Donnell) |
| S18 | The peephole shows an empty porch because the officer is standing off to the side | LE §3.3 (POST anti-silhouetting + stealth approach) |
| S19 | Three or more officers are visible at the door rather than one or two | LE §3.1 (Alameda DA bulletin) |

**S12–S14 are the three that break the current engine design.** They are also
the three the wargame's §6.5 DV intercept was reaching toward.

---

## 8. What I could NOT establish

Listed plainly, because the value of this document depends on the boundary
being honest.

1. **Full Reddit thread reads.** Reddit is blocked at the tool layer via every
   route tried (WebFetch, old.reddit, jina proxy, Firecrawl scrape after the
   first success). **Almost all of §2 is snippet-level.** A pass with Reddit
   access would materially strengthen the resident section and is the single
   highest-value follow-up.
2. **Any measured ranking of resident mistakes.** §2's ordering is by
   recurrence in reachable sources. Nobody publishes incidence data.
3. **Whether public defenders think lawyer-marketing scripts backfire.** Four
   query variations produced only endorsement (mostly other firms' marketing)
   and one non-PD rebuttal
   (https://lawofselfdefense.com/transcript-debunking-the-dont-talk-to-the-police-youtube-video/).
   **I could not substantiate the claim and did not manufacture it.** The
   nearest real evidence is the consent research in §2 #1, which is a mechanism
   finding, not a professional opinion.
4. **Four PDFs that would probably be the best sources in the set**, all
   unreadable locally (`pdftoppm` missing): the MNADV DV handbook for Maryland
   law enforcement
   (https://www.mnadv.org/wp-content/uploads/2025/01/2024-MNADV-Domestic-Violence-Handbook.pdf),
   the NY MPTC model policy on law-enforcement domestic incidents
   (https://www.criminaljustice.ny.gov/crimnet/ojsa/standards/MPTC%20Model%20Policy-Law%20Enforcement%20Domestic%20Incident.pdf),
   the EVAWI national DV prosecution best-practices guide
   (https://evawintl.org/resource_library/national-domestic-violence-prosecution-best-practices-guide/),
   and the NAA ICE Decision Tree. **These four would answer most of §5's open
   questions about door-arrival practice.** Install poppler-utils and re-run.
5. **A DV advocate speaking directly to the "don't open the door" script.** I
   found the components — lethality screening, separation practice, dual arrest,
   weaponised checks — but **no advocate anywhere addressing generic
   police-at-the-door rights advice in a DV frame.** §5 is my synthesis of
   sourced components, not a position any named advocate has stated. **It must
   be put to a real DV clinician rather than treated as a finding.**
6. **An EMS account of a minutes-scale loss caused by refusing the door.** Not
   found. The evidence points the other way (§4.2).
7. **A caseworker saying in their own words that refusal reads as guilt.** Not
   found; only workers *deploying* the guilt framing as a door tactic.
8. **Three sources needing re-verification before anything is built on them:**
   the CPS cooperation odds-ratio study (snippet only), the ProPublica <0.2%
   warrant figure (one reporting project), and the red-card reversal reporting
   (single outlet).
9. **Two sources flagged DO NOT CITE:** `owlbadges.com` and `ngbia.com` —
   unattributed commercial content presenting as reporting.
10. **Any officer account of a scripted refusal at a residential door.** All
    officer-side material on sovereign-citizen and auditor scripts is framed
    around traffic stops and public places (§3.8). The module's core mechanic
    is therefore being validated against an adjacent context, not its own.
11. **Most state academy door-approach curricula.** Ohio OPOTA, FLETC and
    Calibre Press are not publicly posted; TCOLE, Florida CJSTC, Washington
    CJTC, Oregon DPSST and Minnesota POST were not reached before the search
    budget ran out. Colorado and Nevada POST curricula are live leads (§3.9).
    Only California POST, Michigan MCOLES, IACP and the Alameda County DA
    bulletin were actually read.
12. **Housekeeping:** the LE research stream downloaded six source PDFs to
    `C:\Users\mfran\Downloads\` — `WelfareChecks-2023.09_0.pdf`,
    `LD_21-V7.0.pdf`, `LD_16-V5.1.pdf`, `KNOCKandTALKS.pdf`,
    `SS20_Knock_and_Talk.pdf`, `mcoles-basic-training-2021.pdf`. These are the
    primary training documents behind §3. Keep them for the attorney review or
    delete them; nothing else depends on their location.

---

## Standing constraints, restated

- Nothing above is user-facing content. Every scenario seed is a question for
  an attorney, not a beat.
- The DV section blocks ship until a domestic-violence clinician reviews it.
  The wargame already said so; this research says the surface is larger than
  the wargame assumed.
- No `index.html` or app source file was read for edit or modified by this
  research pass.
