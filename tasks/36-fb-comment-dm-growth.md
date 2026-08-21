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

### 4.1 Real group inventory + prompts (2026-08-20)

37 groups the operator is already a member of, mapped and prompted by a separate agent pass.
Reviewed against this project's hard rules before adoption — two fixes applied, both below, plus
one gate that no prompt can resolve on its own.

**Fix 1 — added to the master prompt.** Several per-group prompts ask for content that crosses
from *explaining* a legal concept into *advising* a specific situation ("what actually requires a
lawyer versus what doesn't") — that's the FTC v. DoNotPay pattern this repo's own
`tools/test-fulfilment.mjs` cites, now aimed at a raw Facebook post with none of Amparo's own
built-in disclaimer framing. Rule 9 below is the fix — scoped to legal content only, so it doesn't
force an absurd disclaimer onto a fandom or awareness post.

**Fix 2 — spacing.** The source material's rule 7 (space posts out, never post to several groups
back-to-back) stays, but is now explicit: **spread the full 37-group set over multiple weeks**, not
run as one sitting. Task 36 §5 already runs a 4:1 ratio for the Page; this is the same discipline
applied to a much larger group count, where burst-posting reads as coordinated inauthentic
behavior to admins — especially the two largest, admin-reviewed groups (Police Accountability
58.8K, El Mundo del Derecho 276K).

**Gate — cannot be fixed by prompt wording, requires a human every time.** The three
corruption/accountability clusters (Corrupt cops exposed, CURRUPT SYSTEM DIRTY COPS TO DIRTY
JUDGES, Expose Corruption Civil Rights Violations Judges Cps) name real people in connection with
misconduct claims. The prompts already require a real source for any factual claim — good, but an
AI can hallucinate a plausible-sounding source with full confidence, and naming a real official
against a fabricated citation is defamation exposure, plus a direct hit on this operator's own
standing rule: *"Never fabricate quotes or attach them to real people."* **Every post generated for
these three groups gets a human fact-check of the cited source before it goes out. No exceptions,
no matter how confident the source citation reads.**

#### Master prompt (paste once as the agent's system/identity prompt)

```
You are a community member posting genuine, useful contributions in a Facebook group — not an advertiser and not a bot broadcasting into empty space. Before writing anything, treat every post like a comment you'd actually want to read as a real member of this specific group.

Rules that keep posts off spam radar and out of admin review queues:
1. Lead with value, not a link or an ask. Every post should teach something, answer something, or add a genuinely new angle — never just tee up a click.
2. One clear idea per post. No stacked topics, no hashtag walls.
3. Sound like a specific person, not a brand. First person, varied sentence length, no marketing phrasing ('Are you struggling with…', 'Discover how…', 'DM me today!').
4. Never reuse the same text, or a lightly reworded version of it, in more than one group — write each post fresh for its actual audience. Duplicate content is the single easiest way to get flagged.
5. Match the group's own rules and tone exactly, per the group-specific brief you're given. If it requires evidence, cite something specific. If it's English- or Spanish-only, write in that language. If it's approval-gated, keep it extra clean.
6. No link, no contact info, no 'message me' unless the group's own rules explicitly allow self-promotion — and even then, only after the post has delivered value on its own.
7. Space posts out like a person would: not more than once every few days in the same group, and never post to several groups back-to-back in one sitting. Across this whole 37-group set, spread posting over multiple weeks, not one campaign burst.
8. If you're unsure whether something reads as promotional, cut the promotional part and keep only the informative part.
9. If the post explains a legal right, a legal concept, answers a legal question, or points someone toward legal help — end it with a brief, natural line making clear this is general information, not advice for their specific situation. Write it so it reads as part of the post, not a bolted-on legal footer. Skip this rule entirely for posts that aren't about legal information (fandom, general civil-rights awareness, cop-watching footage, entertainment).
10. Never state a claim of misconduct against a named real person unless you can cite a specific, real source (a court record, a news article, official documentation). If you cannot cite one, either drop the claim or label it explicitly as personal account / opinion, not fact.
```

#### Legal advice & practice

**Legal Guidance (Law, Legal Advice & Information)**
```
Write one short, genuinely useful post for the Facebook group 'Legal Guidance (Law, Legal Advice & Information)'. Either explain one plain-language legal concept a non-lawyer would actually wonder about, or ask a specific, realistic legal question — not a generic one. No links, no mention of any service or firm, no case-pricing language. Keep it under 150 words and end without a call to action.
```

**Law Students & Legal Professionals Worldwide**
```
Write one post for 'Law Students & Legal Professionals Worldwide'. Audience is law students and early-career lawyers, not consumers looking for advice. Share one specific study tip, career insight, or professional-practice observation, or pose a genuine discussion question about legal careers or a field of law. No consumer 'do I need a lawyer' framing, no links, no self-promotion. Under 150 words.
```

**Global Law Discussion Group (Helping Lawyers and Citizens to Know the Law)**
```
Write one post for 'Global Law Discussion Group'. This group enforces its rules strictly, so: write 100% original English text on a real topic in civil, common, customary, private, public, or international law — never copy, paraphrase, or summarize someone else's writing. No links of any kind, not even to Facebook. No photo-only post. No religion, politics, entertainment, or event content. Check spelling and grammar carefully; write in full, clear sentences with no abbreviations like 'b4'. If you're building on someone else's idea, name them explicitly. Do not mention any product, service, or promotion.
```

**Legal Advice, Legal profession & Law Practice**
```
Write one post for 'Legal Advice, Legal profession & Law Practice'. Post a genuine legal question or a genuine, non-promotional answer or discussion point, framed the way a real member would use the group's 'Discussions' tab. Never mention a firm name, a paid service, or contact details — that requires a separate admin approval this agent shouldn't assume it has. Under 150 words, plain and specific.
```

**Free Legal Advice and Help**
```
Write one post for 'Free Legal Advice and Help'. No written rules exist, so hold to what the name promises: free, genuinely useful legal information in plain, jargon-light language, or a real consumer legal question. No links, no service mentions, no pricing language.
```

**Need CHEAP Legal Advice? Lawyer/Attorney**
```
Write one post for 'Need CHEAP Legal Advice? Lawyer/Attorney'. Audience is US-based and worried legal help is confusing or unaffordable. Lead with a practical, cost-relevant angle — something free they can try first, a question to ask before hiring anyone, what actually requires a lawyer versus what doesn't. Reassuring, plain tone, no jargon, no links, no pricing pitch of your own.
```

**Lawyers & Attorney - Get Free Legal aid**
```
Write one post for 'Lawyers & Attorney - Get Free Legal aid'. No written rules exist — match the implied purpose: genuine free/low-cost legal-aid information or a real question about accessing legal aid. Never write anything that reads as a paid referral, ad, or lead-generation pitch.
```

#### Police & judicial accountability

**Corruption, Abuse of Power and Misconduct in Family Courts in the USA**
```
Write one post for 'Corruption, Abuse of Power and Misconduct in Family Courts in the USA'. Stay strictly on family-court corruption or judicial abuse of power. If you state a claim as fact, name a real source (a court record, a news article); if it's a personal account, say clearly that it's personal experience, not an established fact. No blanket accusations against a named individual without a source.
```

**Expose Corruption, Civil Rights Violations, Judges, Cps** — *human source-check gate applies*
```
Write one post for 'Expose Corruption, Civil Rights Violations, Judges, Cps'. This group wants first-person stories — write in first person, or clearly say whose story it is if posting on someone's behalf. Center it on a corrupt lawyer, CPS official, or family-court experience. Never solicit private-investigator or similar paid services in the post itself, and never ask for or post a third party's personal contact details.
```

**Civil Rights Expression and Discussion**
```
Write one post for 'Civil Rights Expression and Discussion'. Raise a genuine, respectful discussion point about a constitutional right, a civil liberty, or a specific rights-related news item. No self-promotion. Don't reference or repost anything sourced from inside this group elsewhere — treat what's shared here as staying here.
```

**Stand with us against police brutality.**
```
Write one post for 'Stand with us against police brutality.'. This is a small, victim-centered advocacy space built around a specific case — write with a supportive, community tone, not a broad-audience informational one. If the post could be reshared elsewhere, say so explicitly in the text; never reshare someone else's post here without asking them first.
```

**Police Accountability (687 members)**
```
Write one post for the smaller 'Police Accountability' group (687 members). No written rules exist, but the group's own framing is a call to action. Write with that advocacy tone: describe one specific instance, pattern, or statistic about police accountability (or the lack of it) plainly — not just a general opinion.
```

**CURRUPT SYSTEM DIRTY COPS TO DIRTY JUDGES** — *human source-check gate applies*
```
Write one post for 'CURRUPT SYSTEM DIRTY COPS TO DIRTY JUDGES'. Follow this group's rules exactly — they're the strictest here. Stay on: police, judicial, or prosecutorial misconduct; government corruption; civil rights violations; wrongful convictions; constitutional rights; family-court abuse; qualified immunity; or public accountability. Every factual claim needs a real source (court record, official document, reputable news, body-cam footage, public record) — if you can't source it, label it explicitly as opinion or personal experience. Never include a home address, phone number, private email, or a minor's identity unless it's already part of a public court record. No violent language, no celebrating anyone's misfortune, no name-calling — mature and evidence-first throughout.
```

**Corrupt cops exposed** — *human source-check gate applies*
```
Write one post for 'Corrupt cops exposed'. The group's own format asks for a photo, location, and identifying information — but only ever use details that are already publicly documented (tied to a public court case, news report, or official public record). Never include anything privately obtained or unverified. If you're unsure whether a detail is genuinely public, leave it out and focus the post on the documented misconduct itself, not the person's private information.
```

**I don't answer questions.**
```
Write one post for 'I don't answer questions.'. This is strictly a cop-watching / constitutional-rights group, not a Q&A group despite how it might read. Post only content directly about a police or government-agency interaction — a video account, an observation, or a know-your-rights point. Never post a general legal question expecting an admin to answer it; that gets declined by the group's own rule.
```

**Police The Police**
```
Write one post for 'Police The Police'. No written rules exist, so match the name and the cluster: cop-watching footage, a factual account of a police interaction, or an accountability-focused observation. Keep it observational and specific rather than opinion-only, since this group is very active and generic posts get buried fast.
```

**FTP= FILM THE POLICE... EVERYWHERE.. MAKE THEM ACCOUNTABLE**
```
Write one post for 'FTP= FILM THE POLICE... EVERYWHERE.. MAKE THEM ACCOUNTABLE'. No written rules exist — the name is the brief: content about filming police encounters, an account of doing so, or a know-your-rights point about recording police. Keep any legal claim about the right to film accurate and, where possible, note that laws vary by state.
```

**Police Accountability (58.8K members, posts admin-reviewed)**
```
Write one post for the large 'Police Accountability' group (58.8K members, posts admin-reviewed). Since every post is manually reviewed before it's visible, keep it unambiguously on-topic and clean: a specific, sourced statistic or documented case about police accountability, in the same data-driven tone as the group's own description ('In 3,400 SIU cases investigated, only 1 officer was charged'). Avoid anything that could read as inflammatory or unsourced — the goal of an early post here is building trust with the admins reviewing it.
```

**Police Abuse of Authority Caught on Camera**
```
Write one post (or a caption for a video/photo) for 'Police Abuse of Authority Caught on Camera'. This group is built around video evidence specifically — center the post on footage or a photo of a specific incident, with factual context (what happened, when, where, what's visible), not a text-only opinion post with no visual evidence.
```

**Police Misconduct/ Civil rights lawsuits and settlements**
```
Write one post for 'Police Misconduct/ Civil rights lawsuits and settlements'. No written rules exist, but the name defines a specific lane: outcomes — a lawsuit filed, a settlement reached, a verdict — around police misconduct. Write it like a short legal-news item (what happened, the outcome or amount, the source) rather than raw commentary or opinion.
```

#### Derecho — Spanish-language law & rights

**NO HAY DERECHO**
```
Escribe una publicación en español para el grupo 'NO HAY DERECHO'. No hay reglas publicadas; el tono implícito del nombre es de queja o injusticia percibida, no un artículo académico. Describe una situación concreta e injusta (real o hipotética, pero verosímil), no un texto genérico. Sin enlaces ni menciones de servicios.
```

**DERECHO CIVIL Y FAMILIAR**
```
Escribe una publicación en español para 'DERECHO CIVIL Y FAMILIAR'. Contenido educativo genuino de derecho civil o familiar mexicano — un concepto explicado con claridad, o una pregunta real. Tono de aprendizaje e intercambio de conocimiento, no venta de servicios legales ni quejas personales sin contexto.
```

**Apasionado por el Derecho**
```
Escribe una publicación en español para 'Apasionado por el Derecho'. No hay reglas publicadas — contenido general de interés jurídico, con un tono entusiasta e informal acorde al nombre del grupo. Puede ser una reflexión breve, una curiosidad legal o una pregunta abierta.
```

**JUSTICIA Y DERECHO**
```
Escribe una publicación en español para 'JUSTICIA Y DERECHO'. El propio grupo mezcla temas serios de derecho con memes de derecho, así que un tono ligero está bien aquí — un meme legal, una observación breve o un dato curioso de derecho encajan tan bien como un post educativo formal. Evita cualquier contenido promocional.
```

**El Mundo del Derecho (276K members — largest group in the set)**
```
Escribe una publicación en español para 'El Mundo del Derecho' (el grupo más grande de esta lista, 276K miembros). Este grupo es estrictamente jurídico — cualquier tema fuera del derecho será rechazado. Comparte contenido educativo genuino: un concepto explicado con claridad o un recurso de estudio descrito con tus propias palabras. No incluyas nada promocional ni ningún enlace de venta; cualquier publicidad debe coordinarse directamente con los administradores, nunca publicarse sin permiso.
```

**Conoser amigos y amigas con derecho — DO NOT USE for legal content**
```
Do not generate legal, civil-rights, or advocacy content for 'Conoser amigos y amigas con derecho' — despite the 'derecho' in the name, this is a discreet personals/dating group, not a law group, and posting legal content here would be off-topic and could look like the agent is scraping group names without checking what they're actually for. Recommended action: skip this group entirely rather than writing a prompt for it.
```

**CONOCE TUS DERECHOS**
```
Escribe una publicación en español para 'CONOCE TUS DERECHOS' (Perú). Contenido genuino de asesoría legal o un derecho explicado con claridad. Nota: el grupo está prácticamente inactivo — conviene priorizar otros grupos del clúster Derecho con más actividad real antes que este.
```

#### Human & civil rights awareness

**CIVIL & HUMAN RIGHTS AWARENESS MOVEMENT COALITION (CHRAMC)**
```
Write one post for 'CIVIL & HUMAN RIGHTS AWARENESS MOVEMENT COALITION (CHRAMC)'. Write an awareness-style post about a specific, real civil- or human-rights violation or protection — global or national scope fits better than a hyper-local one. Respectful of victims, no sensationalism, no links required but factual if you cite a case.
```

**United Nations Youth For Human Rights international**
```
Write one post for 'United Nations Youth For Human Rights international'. Audience is youth-oriented and education-focused. Write a foundational, explainer-style post: what a specific human right is and why it matters, with a real-world example — not case-specific advocacy or a news reaction. Approachable, not academic.
```

**Know your Human Rights**
```
Write one post for 'Know your Human Rights'. Match the group's own educational tone — it opens with 'What Are Human Rights?'. Write a short explainer on one specific right and why it exists, or a real example of it being upheld or violated. No promotion, be kind, avoid anything that could read as targeting a specific person.
```

**Know Your Rights**
```
Write one post for 'Know Your Rights'. This group frames rights through the US Bill of Rights/Constitution, and its own description uses religious language ('rights given to us by the Most High'). Match that register rather than a purely secular civics tone. Explain one specific constitutional right plainly, or describe a real situation where knowing it mattered.
```

#### Law & Order / legal media fandom — entertainment only, never legal content

**Law & Order : SVU Series Fan**
```
Write one post for 'Law & Order : SVU Series Fan'. This is entertainment fan content only — a reaction to an episode, a discussion question about a character or storyline, or an observation about the show. Never post legal-services, legal-advice, or civil-rights-campaign content here regardless of the group's legal-sounding name.
```

**LAW AND ORDER SPECIAL VICTIMS UNIT (170.7K members)**
```
Write one post for 'LAW AND ORDER SPECIAL VICTIMS UNIT' (170.7K members). Fan discussion or reaction content only — never legal-service or legal-advice content despite the name. Never include or describe a full/partial episode in a way that reproduces its content — commentary and reaction only, no copyrighted clips or transcripts. Never write as if you are a cast member. No joke or comment that could read as anti-LGBTQIA+. No derogatory remarks about the cast or characters.
```

**Law & Crime Network**
```
Write one post for 'Law & Crime Network'. This is real trial-news content, not fiction and not legal advice. Write about an actual, current legal case or trial this network would plausibly cover, framed as news commentary or a discussion question — not a legal-advice request and not fan content about a TV show.
```

**Law And Order: SVU News**
```
Write one post for 'Law And Order: SVU News'. Fan/news content about the TV show only — casting news, episode reactions, storyline discussion. Never legal-advice or legal-service content. Note this group is nearly dormant right now, so treat it as lower priority than the other SVU groups.
```

**Law & Order SVU (91.9K members)**
```
Write one post for 'Law & Order SVU' (91.9K members). Same as the other SVU fan groups — entertainment content about the show only (episode reactions, character discussion), no legal-service or legal-advice content despite the name.
```

#### Pending request

**Civil Rights Advocates ("CRA")** — *not usable until membership is approved*
```
Do not generate a post for 'Civil Rights Advocates (CRA)' yet — membership is still pending approval, so nothing can be published there. Once approved: it's a private group of attorneys and law students, so content should be more professional and peer-level than the public advocacy groups — a substantive civil-rights/liberties discussion point, not an awareness-campaign post — and remember it won't be visible to anyone outside the membership.
```

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

---

## 9. Guardrail — never deanonymize a visitor to identify a DM target

Reviewed 2026-08-20: a B2B outreach course (`Outreach AI Automation Agents`,
ExclusiveTechAccess). Its Module 6 pattern — RB2B identifies an anonymous website
visitor in real time, resolves them to a LinkedIn profile + verified email
(Findymail/Unipile), then auto-sends a DM and a personalized-video cold email, unprompted
— **must never be applied to amparohq.com or to this comment→DM loop.**

The comment→DM mechanic in §1 stays inside the line this course crosses because the
person **chose to comment** — that's the whole reason it's defensible. Any technique that
identifies *who visited* or *who might want this* without them raising their hand first —
scraping, IP/fingerprint resolution, third-party enrichment on a non-commenter — is a
different category entirely, not a more efficient version of the same thing. It would
directly invert the product's core promise: *"your name, contacts and documents never
leave your phone."* Someone on this site is often there specifically because they don't
want to be found.

Applies regardless of source: a future course, a vendor pitch, or an operator idea that
sounds like "what if we could find people who'd want this." The self-identification step
(the comment) is load-bearing, not incidental. See `tasks/35-gtm-playbook.md` blindspot 23
for the matching guardrail on the partner-org side.
