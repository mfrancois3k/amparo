# Amparo — real user transcript & analysis

Source: an audio transcript of the founder debriefing with a friend who
actually used amparohq.com — the first person in production data to complete
the full funnel (state → contacts → lifelines → print). Brooklyn, Android,
Chrome mobile, per PostHog. This is real usage, not a simulated persona.

Distinct from the focus-group document in this notebook: that was six
simulated personas reacting to the site; this is one real person who actually
used it, in his own words.

---

## Direct quotes, organised by theme

### He does not drive
> "I don't drive, I just want to see what the paperwork says."

He skipped the wizard entirely, went looking for the printed pack, and only
discovered the practice scenarios by accident at the end.

### The funnel is backwards for him
> "I skip all of that... then at the end it was like, here's some scenarios,
> and that's when I was like, I'm interested now."

### He gamified the practice engine, unprompted
> "I was gamifying that, I was like yo I got that wrong... I was pissed. I
> better see a 6 out of 6 score."

Scored 4/6. Frustration was clearly engagement, not complaint.

### Hard Mode was the most memorable part
> "You did everything right... that made it real... this is why you have the
> package — no bullshit, because shit is going to go wrong anyway."

His framing: it's not a test you're supposed to ace, because real life isn't
one either. The value is specifically that it refuses to be winnable.

### He wants reworded questions so answers can't be memorised
> "Do you want to try a random scenario... he asked you this, but it's kind of
> worded differently, so it makes you think — how do I answer that?"

*(Already partially built: `PRX_VAR` holds ~45 officer-line variants and
`PRX_CURVE` ~10 curveballs. The gap is that this isn't surfaced to users as
replayability — they don't know the questions change.)*

### On the document/ID-photo step (second-hand, not his own experience)
His friend's view, relayed by him:
> "Realistically, everyone... the people that give them the license... they're
> not going to need a placeholder... you already printed the shit, so when you
> print it, like when you park, you're like okay let me set up the paper."

His fiancée's view, also relayed:
> "In the heat of the moment they're not gonna have paper, right? You don't
> need no bullshit — the biggest lesson of the app is the rehearsal."

### His proposed monetisation
> "The scenarios first... then here's a script, 99 cents... your information is
> yours, we don't own it, we'll just give you the PDF... the paywall is the
> paperwork."

Free scenarios as the hook; a small one-time charge for a personalised printed
script. Explicitly not a subscription — he was clear he'd rather not gate the
core app behind recurring payment.

### The competitor analogy (came from a *different* AI he'd consulted)
> "Their pamphlet is like a smoke alarm. Yours is like a fire drill... does it
> actually prevent the fire, because you're telling them exactly, phrase by
> phrase, what to do."

### On finding a user to test with
> "I was talking to a lot of AI [tools], and they said find out if people use
> it... you're the first one that actually told me okay bro, this is..."

He'd been given the standard "go find a user" advice repeatedly; this
conversation was him actually doing it and reporting back live.

### On his own PostHog data
> "It showed in the data that you skip [a] concept... what you skip..."

He had already noticed via PostHog that the same test user skipped the
document/photo section, before this conversation surfaced *why*.

---

## The four open questions and what the transcript actually answers

Asked to settle: did print work; why the 2-day return; did he see the practice
CTA; were the licence photos useful. Confidence marked per answer.

1. **Did print actually work?** — **Unanswered.** He mentions downloading a PDF
   and not looking at it again, but the transcript never confirms paper came
   out or a file reliably opened. Genuinely open; needs a direct question.

2. **Why the 2-day return?** — **Answered, strong.** "I had been on the file a
   couple times throughout the week... I just kept forgetting... came back in
   the morning." Pure self-initiated recall — no notification, no reminder,
   nothing in the app pulled him back.

3. **Did he see the practice button, why skip it?** — **Answered, strong, but
   not the question we thought.** He didn't skip it. The funnel is inverted for
   him: he found scenarios at the end of the wizard on his own route, before
   the post-print gold CTA was ever relevant to his session.

4. **Were the licence photos useful or annoying?** — **Answered only by
   proxy.** His friend and fiancée's opinions, not his own direct experience
   with the step. Still worth asking him personally.

---

## What this transcript changed about earlier decisions

**The document-capture step.** Production logs (`sr_doc_added` events) had
suggested keeping it — someone was clearly using it. The transcript overrides
that inference: he was skipping *toward* the paperwork, and the step was
between him and what he wanted. Removing it (shipped v2.1.0) was the right
call. **Event logs showed the action; only the interview showed the intent.**
That distinction is the single most reusable lesson from this transcript —
worth remembering for every future analytics-driven product decision.

**Monetisation.** His 99¢-script idea is a good instinct about *where* value
concentrates in the product, but collides with three things already built: the
on-device privacy promise (payment creates an identity/payment trail), the
Luis persona from the focus group (won't leave a payment record for this exact
product), and the positioning itself (charging for the fire alarm while giving
away the fire drill). See the panel/roadmap document in this notebook for the
full fork analysis — recommendation is to stay free until a UPL attorney rules
on the scored practice engine.

**Funnel order.** His experience is direct evidence that "wizard → pack →
practice-as-afterthought" is backwards for at least one real user, and the
roadmap now proposes inverting it, gated behind a measured rise in state
selection for cold mobile arrivals rather than shipped on belief alone (a
non-driver's engagement is not proof of demand from the actual target
audience — see the red-team pass in the panel/roadmap document).
