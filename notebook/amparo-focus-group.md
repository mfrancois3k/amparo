# Amparo — internal focus group results

Run against the site as it stood after v2.1.0's changes (docs step removed, all
50 states live, custom 404 not yet built). Six personas — five from the
project's saved roster, plus one added because none of the saved five lived in
an uncovered state and the review needed to react to "federal only" states.

Persona files: `.focus-group/members.md` in the repo.

---

## 🧑 Rosa, 44 — GA, Spanish-first house cleaner, mixed-status family, son (17) drives
- **First reaction:** "¿Está en español?" — can't tell in the first second. The
  toggle is small, top-right; the page loads in English by default.
- **Would she use it?** Maybe — not alone, not today. Waits for someone at
  church to vouch for it first.
- **What's missing:** anyone vouching. The "Who's behind Amparo?" link is a
  link, not a name she trusts — she looks for a logo she recognises (parish,
  legal-aid group, consulate).
- **What flips her:** loading in Spanish when the phone is in Spanish, plus one
  line saying who reviewed it. Currently nobody has.

## 🧑 Marcus, 19 — NY, Black college student, new driver
- **First reaction:** Practice mode is the only part he cares about. Hard
  Mode's framing ("you did everything right and he escalated anyway") is the
  first thing on a rights site that felt honest instead of preachy.
- **Would he use it?** Yes to practice. **No** to the pack — no printer, would
  never print.
- **What's missing:** the whole flow pushes toward printing, the one thing
  he'll never do.
- **What flips him:** let him start practice with no wizard; give him something
  that lives on the phone instead of paper.

## 🧑 Dana, 52 — TX suburb, mom of a 16-year-old about to solo drive
- **First reaction:** exactly what she wanted. Will do the whole thing, print
  two copies.
- **Would she use it?** Yes — the one clear conversion.
- **What's missing:** no attorney name anywhere. She's the type to check.
- **What flips her from user to evangelist:** one licensed Texas attorney's
  name on the Texas pack. She'd post it in the school parents' group.

## 🧑 Luis, 27 — TX, DACA, warehouse shift lead, older Android, prepaid data
- **First reaction:** relief that the camera step is gone — under the old flow
  he'd have hit "let Amparo use your camera" and closed the tab instantly.
- **Would he use it?** Now, yes — quietly, at home, on wifi.
- **What's missing:** he hits "will be $19 after launch" on the state picker
  and reads it as: eventually this asks for a card. He will not leave a payment
  trail on a police-and-immigration app.
- **What flips him:** kill or rewrite that banner; say plainly that nothing is
  uploaded.

## 🧑 Tony, 61 — GA, retired Black postal worker
- **First reaction:** skeptical on principle — "a card won't stop a bad cop."
- **Would he use it?** Maybe — because of the doc overlay naming Philando
  Castile and Daunte Wright and framing the blame as the system's, not the
  person's. First thing that reads as written by someone who knows.
- **What's missing:** that honesty is buried behind a small link at the bottom.
- **What flips him:** lead with the honesty. Would hand it to grandsons if the
  NAACP chapter or his church put their name on it.

## 🧑 Ana, 31 — Phoenix AZ, US citizen, mixed-status household, drives I-10 weekly *(added for this run)*
- **First reaction:** finds Arizona, sees "FEDERAL ONLY," reads it as "doesn't
  work for me yet" — not "admirably careful."
- **Would she use it?** No — leaves assuming Arizona isn't done, even though
  the checkpoint level was built for exactly her drive.
- **What's missing:** the tag explains what's absent, never what's present.
- **What flips her:** reframe as "federal ✓" — same honesty, opposite emotional
  read. *(This fix shipped in v2.1.0.)*

---

## Group read

**Consensus:** 1 clear yes (Dana), 3 maybe (Rosa, Tony, Luis), 2 no (Marcus for
the pack specifically, Ana). Maps almost exactly onto the real funnel — one
printer out of the room.

**Biggest objection, and it was testable:** the "$19 after launch" banner sat
on the state picker — exactly the step where 97% of real visitors leave. Three
of six personas flinched at it; for Luis it was disqualifying. **Fixed in
v2.1.0** — removed entirely, replaced with the on-device privacy line.

**Second fix:** "FEDERAL ONLY" was honest but read as broken. **Fixed in
v2.1.0** — reworded to "federal ✓."

**Still open:** Marcus and Ana both want a non-print path; the funnel still
terminates in a printer. This matches the roadmap item "make the pack survive a
phone with no printer" (unreleased, see the panel/roadmap document).

**Who this is not for:** anyone who wants a record-the-stop app. Not one
persona asked for that.

---

## The follow-up question this raised (later resolved by real user data)

At the time of this focus group, "should the document-capture step be
removed?" was still open — `sr_doc_added` events in production logs suggested
people were using it. **The later interview with the real completed-funnel user
overrode that inference**: he was skipping *toward* the paperwork, and the doc
step was in his way. See the transcript source in this notebook. Event logs
showed the action; only the interview showed the intent.
