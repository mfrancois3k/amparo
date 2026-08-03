# Amparo — donation ask: placement, mechanism, copy

Date: 2026-08-03. Written against `index.html` at the state described in
`amparo-focus-group-04-v270.md` (commit `fd245a5`, tag `v2.7.0`) and the
version-history record of the `$19 after launch` banner (`amparo-version-history.md`,
v2.1.0). Design recommendation only — no code changed.

**The constraint, stated precisely.** v2.1.0's post-mortem: a 6-persona focus
group found a price banner sitting on the state picker — "precisely where the
drop happens" — and it was pulled. The lesson wasn't "don't charge money," it
was "don't let a money signal appear on the screen a scared user is standing on
when they're deciding whether to trust you." Two personas in `.focus-group/members.md`
sharpen that into something specific: Luis ("won't leave a payment record for
THIS product") and Marisol ("the payment-trail objection is not confined to
undocumented users") both refuse a payment trail on this *category* of app,
independent of their own legal exposure. That's not "don't ask for money." It's
"don't put money in the same frame as the rights content, ever, for anyone."
Everything below is designed around that specific, narrower rule.

---

## 1. Placement

### Primary: the post-practice-level footer, after the founder's note

Every completed practice level — not gated behind finishing all four, just one
finished scenario — already renders a shared footer
(`index.html:4443–4458`, the `foot` template literal):

```
rehearsal count → crisis/rights resources → founder's note (signed, real name) → doc/honesty link
```

The founder's note (`prx_fn_head` / `ab_founder_note`, `index.html:1580`) is a
first-person, signed letter: *"I built Amparo for anyone, of any minority,
anywhere, who has ever feared that a routine stop could cost them their
life... — Michael Francois, founder of Amparo."* A support line belongs
**directly under that signature**, as its own small block — the same place a
newsletter or a nonprofit appeal closes, after the personal statement, not
before it.

Why this beats "after printing" or "after all 4 levels" (the two options the
brief suggested):

- **It fires more often, for more personas, sooner.** Gating on *all four*
  levels means gating behind a milestone FG04 already flagged as broken for
  most of the panel (`mUnlocked` requires 3 of 4 core levels — finding #1,
  "step 5 is unreachable for 6 of 10 personas"). A single completed level is a
  much lower, already-common bar — Dana, Wes, Marcus, Keisha, and Luis all
  clear it in the transcript record.
- **It never appears on the core rights-delivery path.** State, You, Lifelines,
  and Print render none of this. A user has to *finish a rehearsal* — an
  optional, self-selected action — to see it. Nia, the one persona who "exits
  the practice engine within seconds," structurally never sees it. That's not
  a lucky accident; it's the correct filter — she should never be in the
  audience for this ask.
- **It's the one place in the product already speaking in first person, with a
  real name attached.** An ask that shows up as generic app chrome reads as
  a business. An ask that shows up under "I built this because I was afraid
  for you" reads as a person. The copy in section 3 leans on that.

### Secondary: chained onto the existing "🙌 It helped" tap

`index.html:2692–2719` (`usageBanner`) is the closest thing this product has
to a proven template for a non-pushy ask, and it's worth copying exactly, not
just citing as inspiration:

- Only shows to a **returning** user, **days after** printing (`threeDays`
  gate) — never at the moment of the original decision.
- Fires **once**, ever (`usageFeedbackGiven`, persisted) — tap, dismiss, or
  email all mark it answered; it never comes back.
- Styled as a soft `.pilot` banner with **ghost buttons**, not a gold CTA.
- Copy: *"No pressure — only if you'd like to share."*

`usageFeedback('helped')` (`index.html:4660–4665`) currently just swaps in a
thank-you line. That's the single highest-consent moment in the entire
product: a user, days later, unprompted, telling Amparo it worked. Chain a
one-line support link onto that specific branch only — not onto `not_yet` or
`havent`. This is a smaller-volume surface than the practice-footer (most
users never see the usage banner at all — it requires printing *and* 3
elapsed days *and* not already having answered), but it's the single
best-consented moment available, so it's worth the second surface.

### Tertiary: the About overlay

`showAbout()` (`index.html:2466–2485`) already has the right shape for this —
mission, who made it, legal-review status, then **"Your privacy"**
(`ab_privacy`, `index.html:1586`), which already states "we never sell or
share anything with any agency, including immigration authorities." Add a
**"Support Amparo"** section immediately after that privacy paragraph, before
contact. This is the one placement a skeptical, non-rushed reader
(Tony-shaped, Wes-shaped) reaches deliberately — it's currently the 4th of 4
`linkbtn`s in the step-0 footer (`index.html:2733–2736`), below Sample,
Share, and About itself. Nobody arrives here by accident or under time
pressure; arriving here *is* the signal of intent to read more.

### Explicitly considered and rejected

- **The doc/honesty overlay (`showDoc()`, Castile/Wright cases,
  `index.html:2622–2628`).** Rejected outright. That screen's entire job is
  "some people did everything right and were still killed." Attaching a
  funding ask to content about people dying is exploitative regardless of
  copy quality — it's the fear-based-fundraising anti-pattern in its most
  literal form (see section 4). Keep money and this specific content in
  different rooms, permanently.
- **`postPrintActions` as the primary slot (`index.html:2853–2865`).** The
  brief's own example ("after printing") is real but weaker than it looks:
  `hasPrinted` is set by `afterprint`, which FG04 documents fires even when
  the user *cancels* the print dialog (BS-3: "`hasPrinted` does not mean
  printed"). Building a new, purpose-built surface on a boolean the product's
  own research already flagged as unreliable is building on the wrong beam.
  It's also frequently a rushed moment, not a reflective one — Rosa prints at
  a church office mid-errand, Keisha between fares. A quiet `linkbtn` can live
  in the already-collapsed `railMore` section (same tier as "Print for
  family," "Start over") for the user who scrolls that far, but it should not
  be the headline placement.
- **Step 5 hub, `mUnlocked` milestone (`index.html:2907`).** Reasonable
  later addition (a "you finished the core three" moment is real), but lower
  priority than the per-level footer because it requires the same
  three-level completion that's currently broken for most of the panel.
  Revisit once FG04's #1 finding (open a second door into step 5) ships.

---

## 2. Mechanism: link out, not embedded

**Recommendation: an external link — Stripe Payment Link as the default choice
— never an in-app payment element.** Three separate arguments, not just one:

**A. The product's own shipped CSP already says no.** `vercel.json`'s
`Permissions-Policy` header currently reads:

```
payment=(), 
```

Payment Request API access is explicitly disabled, for every origin,
including `self`. This wasn't written for this task — it's the existing
security posture. Embedding a Stripe Payment Element means deliberately
reopening a capability the product has already, independently, closed. The
CSP's `script-src` and `connect-src` also don't list any `stripe.com` /
`js.stripe.com` / `api.stripe.com` host today — embedding requires editing
both directives on the one document (`index.html`) that currently ships with
no third-party script origins at all beyond the PostHog proxy. Linking out
requires editing nothing in `vercel.json`.

**B. Stripe.js executes and phones home the moment it mounts — before any
card number is typed.** Stripe's client library performs fraud-signal /
fingerprinting calls to Stripe's servers as soon as an Elements form renders,
independent of whether the user completes or even starts filling in a card.
For most products that's a non-issue. For this one, it's a literal, checkable
deviation from "nothing you enter leaves your phone" — not because data was
entered, but because *third-party code executed and made a network call* on
a device belonging to someone using an immigration-adjacent tool. Luis and
Marisol are exactly the users positioned to notice or distrust that, and
they're right to. A link-out has none of this: zero Amparo-hosted third-party
script ever loads unless the user has already navigated away.

**C. Linking out is true to the privacy claim in the strongest possible
reading, not just the weakest.** "Nothing you enter leaves your phone"
currently means "your data stays local." Under a link-out donation flow, the
stronger claim also holds: nothing is even entered *into Amparo* — the
payment happens after the browser has left Amparo's own origin, service
worker, and CSP entirely, on a page the user consciously chose to open. A new
tab (`target="_blank" rel="noopener noreferrer"`, or `window.open` with the
same flags), not an in-place navigation, makes that departure visible rather
than implied — the installed-PWA shell stays exactly where the user left it.

**Practical follow-ons from picking link-out:**

- **No backend needed.** The project currently has none in production —
  `REVIEW.emailEnabled` is hard-coded `false` specifically because the
  Netlify function it depends on isn't deployed yet (`index.html:2166`). A
  Stripe Payment Link needs zero server code on Amparo's side; an embedded
  PaymentIntent flow needs a backend this project doesn't have.
- **Recurring is free.** Payment Links support both one-time and subscription
  mode natively — directly answers the "replicate models that generate
  recurring support" ask without Amparo writing any subscription-management
  code. This is also where Dana actually converts (see section 5).
- **Instrument the click, not the payment.** Fire one anonymous event on tap,
  before navigation — `sr_support_link_clicked` in the existing `ph()`
  convention, no amount, no identity, matching every other event in the file
  (`sr_about_opened`, `sr_practice_level_done`). Conversion itself is read
  from Stripe's own dashboard, which never sends anything back into Amparo's
  analytics. This keeps the ask measurable without adding a single byte of
  donor data to a product whose entire pitch is that it holds none.
- **Don't preconnect.** No `<link rel="preconnect">` to any payment host in
  `<head>`, no CSP allowance added at all. If a session never taps the link,
  zero bytes related to payments should ever leave the device — keep that
  literally true, not just true in the common case.

**Which service, specifically:** Stripe Payment Link as the default — supports
recurring, custom/adjustable amount, Apple Pay/Google Pay, no code, and the
project's own toolchain already has Stripe skills on hand, suggesting
low setup cost. Worth flagging one alternative for later, not now: **Open
Collective** publishes a public ledger (who gave, what was spent, running
balance), which is a structurally different trust mechanic than a private
Stripe account and pairs unusually well with a product whose whole pitch is
"check the citation yourself" — it would also partially answer Tony's
unresolved "no institution backs this" objection (FG04). That's a bigger
decision (public disclosure, fiscal-host approval) and shouldn't block
shipping the smaller thing first. Ko-fi and GitHub Sponsors were also in
scope per the brief: Ko-fi is a reasonable peer to Stripe Payment Links but
adds a third-party brand with less name recognition for no added capability;
GitHub Sponsors is culturally coded for open-source developers, which is a
mismatch for Amparo's actual audience. Neither is wrong, neither beats the
default.

---

## 3. Copy

Voice grounding, pulled directly from the shipped product: `pilotBanner` —
*"Free. Nothing you enter leaves your phone — no account, no upload."* —
short declarative clauses, states facts rather than persuades, no
exclamation points anywhere in the corpus. `usage_fb_sub` — *"No pressure —
only if you'd like to share."* — is the closest existing analogue to a
donation ask's register and is worth echoing on purpose.

**Variant 1 — promise-first.** For the post-practice-level footer, directly
under the founder's signature.

> **Amparo is free. It always will be.**
> If this rehearsal helped and you're able, you can support the people who keep it free — nothing here unlocks, and nothing here ever will.

**Variant 2 — transparency-first.** For the About overlay, directly under
"Your privacy."

> **No ads, no data sales, no investors — just what you choose to give.**
> Amparo runs on hosting costs and one person's time; the link below goes to a page outside this app, and nothing you enter here ever touches it.

**Variant 3 — terse/utilitarian.** For the link-out button itself and any
compact `linkbtn` context (echoes `pilotBanner`'s clipped register).

> **Support Amparo — optional, and it changes nothing.**
> Every feature here stays free either way; this just helps cover hosting, on a page outside the app.

**Button microcopy:** "Give what you can" or "Support Amparo." Avoid "Donate
now" (transactional/urgent-sounding) and avoid "Upgrade," "Go Pro," "Unlock"
categorically — those words imply a gate that doesn't exist here, which is
the exact wrong association to plant.

**What each variant deliberately does not do:** no countdown, no suggested
amount displayed as a tiered card grid (a `$5 / $19 / $50` layout is a
pricing table by shape, independent of what the copy says next to it — see
section 4), no "help us reach our goal," no comparison to what the product
"would" cost, no future tense implying removal ("before we have to start
charging").

**Spanish requirement, stated plainly:** every existing ES string in this
file is independently authored, not machine-translated — compare
`ab_mission` EN/ES, which are different sentences making the same point, not
mirrors of each other. Marisol's own bar in the roster is explicit: "Says yes
when: the Spanish reads as written, not translated." Whoever writes the
Spanish for these three variants needs to write them as their own sentences
in Spanish, then have someone fluent read them cold — not run English through
a translator and ship the output. This document intentionally doesn't draft
that copy, since a non-native pass risks producing exactly the stiff,
translated-sounding text Marisol is calibrated to catch.

---

## 4. What NOT to do

Grouped by failure mode, each tied to either a specific persona/finding in
this project's own research or the general pattern that damaged conversion
before.

**Placement anti-patterns**
- No modal interrupt, ever — on load, on step transition, or on overlay open.
  This is the single most common free-tool pattern and the one most likely
  to recreate the state-picker banner's effect.
- No progress-blocking nag — nothing that requires a dismiss tap before the
  user can continue to the next step, including step 4 → 5.
- Nothing before a practice level completes or before the About overlay is
  opened deliberately — no exceptions for State, You, Lifelines, or the
  print screen's primary actions.
- No exit-intent popup ("before you go..."). Common on free tools, reads as
  manipulative, and is the mechanical opposite of this product's calm,
  no-ambush UX elsewhere (see the 404 page's design intent in
  `amparo-version-history.md`, v2.1.0).
- Never added to the persistent stepper or header chrome — that's seen by
  100% of sessions, including a first-time scared user's very first render.

**Copy anti-patterns**
- No urgency or scarcity language — no countdowns, no "today only," no
  fundraising-goal progress bars.
- No guilt or obligation framing — "we rely on people like you," "please,"
  or citing hours worked as leverage rather than fact.
- No social-proof pressure — "342 people gave this month" turns a private
  decision into a comparison, which cuts against a product whose entire
  design is "nobody else sees what you do here."
- No language implying a feature will be removed or gated if unfunded — this
  is the exact mechanism that made the original banner damaging, and it's
  worth banning explicitly rather than assuming it won't recur.
- Never exploit the enforcement climate to fundraise — no "with immigration
  activity rising..." framing. That's weaponizing the fear the product
  exists to relieve, to raise money from the same person feeling it. Rule
  this out unconditionally, independent of how well it might convert.

**Technical / trust anti-patterns**
- No pricing-table visual shape — tiered amount cards read as a plan
  comparison by layout alone, regardless of copy.
- No preconnect, no CSP allowance, no third-party script load unless the
  user has already tapped through and left the app. Keep "nothing loads
  unless you choose it" literally true for the ~100% of sessions that never
  touch this feature.
- No re-ask after a dismissal, ever, in the same install — mirror
  `usageFeedbackGiven`'s persist-once pattern exactly. An ask that reappears
  every session is the fastest path back to "eventually this costs money."

---

## 5. Test against the personas

Recommended design under test: **post-level footer (Variant 1)** as primary
surface, **link-out via Stripe Payment Link, new tab**, dismiss-once-forever
if declined or clicked.

### Luis — DACA, privacy-first, refuses any payment trail on this app category

He reaches this footer often — per FG04 he's the deepest engaged reader of
the practice engine, especially the Checkpoint level. He reads "no ads, no
data sales... nothing you enter here ever touches it" and the honest
prediction is: **he still does not click it** — his objection in the roster
is categorical, not risk-calibrated, so no copy changes that. What matters is
whether *seeing* it costs anything, and here the mechanism does the work the
copy can't: no script loaded, no in-app form, nothing on his device changes
whether he taps or scrolls past. He's technical enough (older Android,
manages prepaid data deliberately) to notice that nothing fired. Verdict:
**unaffected, not damaged** — a real but narrow win, since "doesn't lose
trust" is the actual bar here, not "converts."

### Marisol — green-card holder, legally secure, objection generalizes to the category

Same mechanism logic as Luis applies and gets the same "doesn't click, isn't
spooked" result — her objection is about the category of app, not her own
exposure, and a link-out with no in-app form doesn't touch that. Her real
test is different and sharper: **whether the Spanish reads as written, not
translated.** If whoever localizes Variant 1/2/3 does a literal pass instead
of authoring native sentences, she generalizes that sloppiness to the whole
product's care level — the same mechanism that made her flag translation
quality in the first place. This is the one honest risk in her reaction: the
placement and mechanism are fine for her, but the deliverable is only half
done until the Spanish is independently authored and read by a fluent
speaker, not translated from section 3's English.

### Dana — mom, runs drills with her son, cleanest yes on the panel

She's the actual conversion case. She repeats levels, tracks progress, has
already decided (per FG04: "Redo/refer? Yes/yes, the cleanest yes on the
panel") that this is worth more than free — "$19 is trivial vs $400 driving
school" per her own roster entry. She sees Variant 1 after a level she ran
with her son, reads "you can support the people who keep it free," and this
is very plausibly a real, maybe-recurring gift. The honest risk to flag for
her specifically: she replays levels often (`prx.streak` exists precisely
because return visits are expected). **A naive version of this feature that
re-shows the ask on every single completion would fatigue even her best-case
reaction into annoyance within a week.** The dismiss-once-forever
persistence isn't a nice-to-have for Dana — it's the difference between her
actually giving and her learning to ignore the footer entirely, the same way
users learn to blind-click through cookie banners.

### Wes — doesn't drive, ADHD, the one real completed funnel, skips the pack entirely

He reaches a completed practice level fastest of anyone on the panel, via the
step-0 ghost button straight into the overlay — no state picker, no
lifelines, no print, all inside his first couple of minutes. That means he
could see this ask before touching any of the core rights-delivery screens.
Is that a problem? Judged honestly against the actual constraint — never on
the screen a *scared, rushed* user is standing on — no: Wes isn't scared or
rushed, he's curious and fast, and the ask still only fires after he
finished a full rehearsal, not on arrival. His likely reaction is neutral to
positive — he reads menus and copy closely (it's *why* he's the one
completed funnel), and he could plausibly be the second real convert. **The
real risk for him is sequencing, not the ask itself.** FG04 also documents
that his specific path is the one most likely to hit a dead end — once he's
completed one scenario, the hub's gold CTA disappears and the resume guard
caps at step 4, so on a return visit he may not be able to get back into
practice at all (FG04 finding #1). If the donation footer ships before that
reachability bug is fixed, Wes's session risks stacking two bad experiences
— a new ask, then a broken way back in — where either alone would have been
fine. This isn't a reason to hold the donation feature hostage to an
unrelated bug fix, but it is a reason to not treat them as unrelated:
ship the reachability fix first, or in the same cycle, not after.

### Bonus honesty check — Tony, unprompted

Not one of the four requested, but worth a straight line because he's the
panel's sharpest critic and the instruction was to be honest, not
comfortable. Tony's objection in FG04 is that the product's *claim* grew
("practice the stop before it happens" — an authority claim) while its
*backing* didn't (no attorney sign-off, no institution, one founder's name).
A donation ask sitting under that same unsigned founder's note, before any
of that backing exists, risks reading to him as "asking for money before
earning trust" — structurally adjacent to the original sin of the $19
banner (asking before value was established), even though this ask is
correctly placed and correctly mechanized. This isn't a reason to not ship
it — Tony's "no" in FG04 is about positioning and institutional backing, a
different and larger question than this task. It's a reason to log, for the
operator, that this ask will look strongest once the About overlay's "Legal
review" section has something other than three empty attorney slots to show
— the credibility gap Tony names is the same gap that would make a future
"who backs this" reader hesitate over a support link too. Open Collective's
public-ledger model (section 2) is one path that narrows both gaps at once,
later.

---

## 6. Summary of what to ship first

1. Post-practice-level footer, Variant 1, under the founder's signature —
   primary surface, dismiss-once-forever.
2. `usageFeedback('helped')` branch — one added line, same event gate.
3. About overlay, Variant 2, under "Your privacy" — tertiary, self-selected
   audience only.
4. Stripe Payment Link, opened in a new tab, `noopener noreferrer`, no CSP
   or Permissions-Policy change, one anonymous click event fired before
   navigation.
5. Sequence with, not after, the step-5 reachability fix FG04 already
   ranked #1 — they land on overlapping personas (Wes, Marcus, Keisha).
