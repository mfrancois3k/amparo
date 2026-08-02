# Amparo — the four questions, real answers (2026-08-02)

Follow-up to the transcript source in this notebook. The transcript document
listed the four open questions with confidence-graded *inferred* answers from
the recording alone. These are his direct, explicit answers, asked afterward.

## 1. Did the print actually work?
> "Yes, download worked but I wanted to see if I could just air-print the doc,
> I just never had the opportunity."

**Resolved.** Download path works. He wanted AirPrint specifically (wireless
print straight to a physical printer) and never got the chance to try it —
this is not a bug, it's an unexercised feature. Confirms the download/PDF path
is solid; the print pathway remains unverified but not because it's broken.

## 2. Why the 2-day return?
> "Ya I just remembered so I went back, cuz ADHD sucks, plus I promised you I
> would give honest feedback."

**Resolved, matches the earlier inference.** Pure self-initiated recall, no
app prompt. Two forces pulled him back: memory (imperfect, ADHD-affected) and
a social commitment to the founder. Neither is a mechanic the app can
replicate for other users — this specific return is not evidence of organic
retention, it's evidence of a personal favor. Tempers how much weight the
"spaced repetition" roadmap item should put on this one data point; the *need*
for a return mechanic still stands, but this instance isn't proof it works
without one.

## 3. Did he notice the practice button, why skip it?
> "I saw a lot of buttons, while being busy and distracted, I just might not
> have clicked."

**New information — changes the earlier read.** The transcript-only analysis
concluded he "didn't skip it, he found scenarios his own way first." This
direct answer adds a second, compatible layer: even where the post-print gold
CTA *was* visible to him, distraction and button-density meant it may not have
registered. This reframes the fix from "reorder the funnel" (still valid) to
**also** "reduce visual competition around the primary CTA" — too many buttons
of similar visual weight is its own failure mode, independent of ordering.

## 4. Were the licence photos useful or annoying?
> "It's useful but it is something I wasn't willing to do in public so I had
> to wait for an opportunity to do so in a private space. I'm lazy so I do
> like taking the photo."

**Resolved — and this reverses a decision made earlier in the project.** The
document-capture step was removed in v2.1.0 partly on the reasoning that
"drivers already carry their documents, a photo is unnecessary friction." His
answer says the opposite: he finds it *useful* and even prefers it ("I'm
lazy"), but it has a **privacy precondition** — it needs a moment alone, not
removal. The actual friction was never the feature; it was that the flow
offered no way to defer the step to a private moment and come back.

**Action implied, not yet built:** if the document-capture step is
reconsidered, the fix is not "remove it" (already done) or "keep it exactly as
it was" — it's **make it skippable-and-resumable**, so a user in public can
skip past it now and return to it later from a private moment, rather than
forcing an in-the-moment choice between "do this in public" and "never do it."

---

## Net effect on the roadmap (cross-reference: panel/roadmap doc, this notebook)

- Move 3 ("make the pack survive a phone with no printer") gains a concrete
  detail: users may specifically want **AirPrint**, not just a generic
  download — worth checking before assuming "save to phone" alone closes the
  gap.
- The score/CTA-visibility problem is now two separate issues, not one:
  funnel *order* (already flagged) and CTA *visual prominence* (newly
  surfaced here) — both need addressing, neither substitutes for the other.
- The document-capture removal decision should be revisited with a different
  design goal than either extreme: skippable, resumable, never forced during
  a public moment.
