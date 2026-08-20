# Task 36 — Facebook comment→DM growth engine

Operator-directed, 2026-08-20. Organic only, zero ad spend. The mechanic is the
"comment a keyword → auto-DM the link" loop. Nothing here contradicts the honest
positioning: every claim below is one Amparo can actually back.

Internal doc — excluded from deploy via `.vercelignore` (`tasks/`).

---

## 0. The real value proposition (what the copy is allowed to say)

Verified against source this session. Copy may assert these and nothing beyond them.

| TRUE — say it freely | Evidence |
| --- | --- |
| Free, no account, no email required | root `index.html`, no auth wall |
| Bilingual EN/ES throughout | 545 i18n deep paths, EN/ES structure identical |
| Nothing you enter leaves your phone | *"never leave this device"* — verbatim in source |
| Practice a stop out loud before it happens, with an officer's real lines | arena drills, 6 scenarios |
| Printable glovebox pack: window card, your documents, your state's rules, what to say | root pack pages |
| Covers all 50 states + DC | 111 pages, 51 jurisdictions |
| Every rule cites the exact state statute so you can check it yourself | `BASE_RULES` / `STATES` |

**NEVER claim** (these are lies, and two are FTC exposure):
- ❌ "Attorney-reviewed" / "lawyer-approved" — `REVIEW.attorneys` is **empty**. FTC v. DoNotPay, $193k, was exactly this.
- ❌ "Legal advice" — it is legal *information*. The product says so on every page; the copy must too.
- ❌ "Protects you" / "keeps you out of jail" / any outcome guarantee.
- ❌ "Eliminates" anything. Nobody's stop is eliminated by an app.
- ❌ Fake scarcity, fake counts, fake testimonials.

**The honest pitch is the stronger pitch here.** Fear + free + private + 2 minutes. You
do not need to inflate anything.

---

## 1. The comment→DM loop

### Why zero-link posts win
Facebook suppresses posts that send people off-platform. A post with no external link in
the body gets full distribution; the link moves to a DM (or a pinned first comment), which
Facebook does not penalise. Comments and DMs are both strong engagement signals, so the
loop compounds: more comments → more reach → more comments.

### Automation — use ManyChat, not manual DMs
Manual copy-paste to hundreds of people is what gets accounts restricted. ManyChat is a
**Meta Business Partner** using the official Messenger API, so its sends are sanctioned
traffic, not spam-flagged behaviour.

Setup, once:
1. ManyChat → connect the Amparo Facebook Page (free tier covers the start).
2. **Automation → New → Facebook Comments Growth Tool.**
3. Trigger: comment contains `AMPARO` (also add `INFO`, `LINK`, `AMAPRO`, `AMPRO` — people typo, and every typo is a lost person).
4. Scope: specific post, or all posts.
5. Action A — **public reply** to the comment (required for reach; also proves the loop is real to lurkers). Rotate replies, see §6.
6. Action B — **send DM.** Rotate the text, see §6.
7. Enable "reply to all comments" but set a per-user cap of 1 so one person commenting twice does not get two DMs.

### The 24-hour rule
Meta only permits free-form messaging inside **24 hours** of the user's last interaction.
Outside it you need a paid message tag, and the marketing tags do not apply to this
content. **Consequence: the DM must carry the whole value immediately.** No "reply YES for
part 2" drip — that is a policy violation waiting to happen and a bad experience besides.

### What the DM must never do
- Never ask their immigration status, state, or any personal detail. Not for
  personalisation, not ever. You are not building a profile.
- Never store commenter identities anywhere outside Meta. No Supabase, no CRM, no export.
  The orgs-only schema stays orgs-only.
- Never send anything but `amparohq.com` links. No shorteners — with this audience an
  obscured link reads as a scam, and it is also a link-preview killer.
- Name Amparo in the first line. An unnamed stranger DMing a link about your legal rights
  is indistinguishable from the fraud this audience already gets targeted by.

---

## 2. Algorithm blind spots

### The Edit-Post trap
**Never edit a live post to add a link.** Editing pushes the post back through
classification; a post that was ranking gets re-scored and distribution collapses. If you
must add something, put it in a **comment** — comments never re-trigger classification.
Write the post right the first time.

### Link suppression
- No external link in the post body. Ever.
- Link goes in the DM (primary) or your own **pinned first comment** (backup for people who will not DM).
- Do not put a URL in the image either — OCR reads it.
- No link shorteners: they suppress reach *and* look like fraud to this audience.

### Dwell-time formatting
Dwell time is the ranking input you control most directly.
- **One idea per line.** Blank line between each. Thumb-stopping on mobile.
- **First 3 lines carry everything** — that is all that shows before "See more."
- Line 1 is a pattern break, never a greeting.
- 8–15 lines total. Long enough to hold, short enough to finish.
- Emoji as **visual anchors** at line starts, not decoration. One per line, max.
- Cliffhanger immediately before the "See more" fold — that click is a ranking signal.
- Ask **one** question at the end. Two questions get zero answers.

### Comment-section discipline
- Reply to every comment inside the first 60 minutes — early velocity decides the post's ceiling.
- Reply with a **question**, not "thanks!" You want a second comment from the same person.
- Never say "link in bio" — it is a known suppression trigger phrase.

---

## 3. Hook matrix — 5 frameworks

Each tailored to Amparo, each truthful.

### H1 — The Enemy of the Status Quo
*Enemy: freezing up. Not police.* Keeps it about preparation, which is defensible, rather
than about a fight, which is not.
> "The problem isn't that you don't know your rights. It's that at 11pm with a flashlight in your face, you can't remember them."

### H2 — The Secret Tool
> "There's a free site that will rehearse a traffic stop with you — out loud, with a real officer's lines — until the words come without thinking."

### H3 — Before vs After
> "Before: you go quiet, then say the one thing that hurts you later. After: you've already said it 20 times in practice, so your mouth knows it."

### H4 — The Cost of Not Knowing
Concrete and specific. Never invent a statistic.
> "Most people find out what they were supposed to say about four seconds after they needed to say it."

### H5 — The Insider Move
> "The people who stay calmest in a stop aren't braver. They rehearsed. That's the whole difference, and you can do it tonight for free."

**Platform shaping:** Facebook — long, story-led, the formatting above. X — one hard line +
a thread. Short-form video — the hook must land in 1.5 seconds; open on the officer's line,
not on your face.

---

## 4. Community infiltration

Ban-avoidance is real but the real risk here is reputational: get called a spammer in a
legal-aid group and that door is shut permanently.

**The 5:1 rule.** Five genuinely useful comments in a group before you post anything of
your own. No exceptions.

Target groups:
- New-driver and teen-driver parent groups
- State-specific "know your rights" and community-defence groups
- Rideshare/delivery driver groups (they get stopped constantly — highest intent audience there is)
- Spanish-language community groups (`Latinos en [ciudad]`) — **your least-served, highest-need audience**
- Local mutual-aid and immigrant-support groups

**Value-first template:**
> Someone asked what to do when you get pulled over in [STATE].
>
> Three things that actually matter:
> 1. Hands visible, on the wheel, before they reach the window.
> 2. Say out loud what you're about to do before you do it — "my documents are in the glovebox, reaching for them now."
> 3. You can ask "am I free to go?" That question is doing work.
>
> [STATE] has its own rule about what you must hand over — worth checking your own state's statute, they differ more than people think.

Post that with **no link**. If three people ask, then: *"I'll DM it — it's a free site, no account."* Answering a request is not spam.

**Reddit:** far stricter. 90% comment / 10% post, minimum. r/legaladvice bans self-promo
outright — participate, never link. Better subs: r/driving, r/Ask[State], immigration and
rideshare subs. Never post the same text in two subs; the sitewide spam filter catches it.

---

## 5. 30-day calendar — 4:1 ratio

Four value posts to one pitch. The pitch only converts because the four earned it.

**Daily rhythm:** post 7–9am or 7–9pm local. First 60 minutes = reply to everything.

| Day pattern | Type | Purpose |
| --- | --- | --- |
| 1 | **Comment-loop post** (the pitch) | The AMPARO trigger |
| 2 | Education — one state's actual rule | Proof you know the material |
| 3 | Story / scenario | Emotional resonance |
| 4 | Engagement question — no link, no ask | Pure reach reset |
| 5 | Education — a phrase and why it works | Practical value |
| repeat | | |

Week shape:
- **Week 1** — establish. 1 comment-loop post only. Learn what your audience responds to.
- **Week 2** — 2 comment-loop posts. Double down on whichever hook won week 1.
- **Week 3** — 2 comment-loop posts + first Spanish-language post. Test ES separately; it is a different audience, not a translation of the same one.
- **Week 4** — 2 comment-loop posts + one long-form story post + first video.

**Measure only:** comments per post, DM open rate, click-through to site, and **state-picker
completions** — that last one is the only number that means anything, because the funnel
drops 94.5% right there. Traffic that does not survive the state picker is not growth.

---

## 6. Rotation banks (this is what keeps you out of spam jail)

Meta flags **identical repeated text**. ManyChat can rotate automatically; give it real
variety.

### Public comment replies (rotate ≥8)
1. `Sent! Check your messages 📩`
2. `Just DM'd you 👍`
3. `On its way to your inbox ✅`
4. `Sent it over — check your requests folder if you don't see it`
5. `Done! Message sent 📬`
6. `Sent 🙌 let me know if it doesn't come through`
7. `Just sent it your way`
8. `In your DMs now ✅`

### DM variations (rotate ≥10 — never send the same text twice in a row)

**V1**
> Hey! This is Amparo — here's the free traffic-stop pack you asked for: amparohq.com
> No account, nothing to sign up for. Everything you type stays on your phone.

**V2**
> Hi — Amparo here. Link as promised: amparohq.com
> It's free and works in English and Spanish. You can practise a stop out loud before you ever need it.

**V3**
> Thanks for commenting! Here's the site: amparohq.com
> Free, no login. Pick your state and it builds a pack you can print for the glovebox.

**V4**
> Here you go — amparohq.com
> This is Amparo. Free, bilingual, and nothing you enter leaves your device.

**V5**
> Hi! Sending the link like I said: amparohq.com
> Takes about 2 minutes. Every rule cites your state's actual statute so you can check it yourself.

**V6**
> Amparo here 👋 the free pack: amparohq.com
> No email needed. Works offline once it loads, which matters if your data runs out.

**V7**
> That was quick! Here it is: amparohq.com
> Free to use. Practise the stop first, then print the card for your glovebox.

**V8**
> Hey — link's here: amparohq.com
> Amparo is free and doesn't ask for an account. Spanish version at the top-right toggle.

**V9**
> As promised: amparohq.com
> It'll walk you through what to say. Free, and your info never leaves your phone.

**V10**
> Hi! This is the one: amparohq.com
> No signup, no cost. It covers all 50 states — pick yours and it does the rest.

**Rotation hygiene:** shuffle order, never sequential. Vary emoji use (some with, some
without). Vary greeting (Hi / Hey / no greeting). Keep every one under ~40 words — long
DMs from strangers read as scams.

### The follow-up (optional, ONE only, inside 24h)
> Did the link work for you? If anything looked confusing I'd genuinely like to know — it helps me fix it.

Only send to people who opened. Never a second follow-up. This is also your best free
research channel — treat replies as feedback, not objections.

---

## 7. Guardrails that stay on

1. **No attorney claim.** `REVIEW.attorneys` is empty. Saying otherwise is the DoNotPay fact pattern.
2. **"Information, not advice"** appears in the DM funnel at least once and on every page.
3. **No personal data requested in DM.** Ever. Not state, not status, not name.
4. **Nothing exported.** Commenter identities stay inside Meta. No CRM row is created for any individual.
5. **Real link only** — `amparohq.com`, never a shortener.
6. **Amparo is named in the first line of every DM.** The anti-fraud posture is the brand.
7. **`PAYMENTS_LIVE` stays false** until an attorney signs. Growth does not change that gate; it raises the cost of getting it wrong.

## 8. Before any of this runs — one blocker

The site currently returns **HTTP 403 to automated traffic** (verified from an external
network; `robots.txt` is 403 too). If that also blocks Facebook's and WhatsApp's
link-preview scrapers, **every link you send unfurls blank** — and a blank preview on a
DM'd link is exactly what a scam looks like. Check this before spending a day on posts:
paste `amparohq.com` into a Facebook post composer and see whether a preview card renders.
Fix the Vercel firewall rule first if it does not.
