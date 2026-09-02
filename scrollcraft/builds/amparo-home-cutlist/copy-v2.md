# copy-v2.md: homepage rewrite for all police encounters, not just traffic stops

Source of truth read for this pass: `new/index.html` (EN/ES copy objects), `arena/index.html`
(scenario data), `pack.html` (printed pack copy), `new/states-data.js` (state lifelines data).
Everything below is either quoted verbatim from those files (marked "verbatim", with a
`file:line` pointer) or new copy written to fit the owner's brief. No em dashes appear in any
line I authored; where a verbatim quote from the source contains one, it is left untouched and
called out.

Read the **Data notes** section at the end before implementing section 2 and 5: two of the
brief's own assumptions don't hold up against the actual data.

---

## 1. hero

Keep `heroTitle` unchanged. Replace `heroSub`.

EN
```
heroTitle:"Know your rights is not enough. Practice them.",
heroSub:"A free bilingual tool for police encounters: traffic stops, checkpoints, a knock at your door. Practice the words out loud, then print six cards built from your state's laws, plus a verified lifeline to a lawyer who takes your call.",
```
(40 words)

ES
```
heroTitle:"Conocer tus derechos no basta. Practícalos.",
heroSub:"Un recurso bilingüe gratuito para encuentros con la policía: paradas de tráfico, retenes, un toque en tu puerta. Practica en voz alta, luego imprime seis tarjetas con las leyes de tu estado y una línea directa a un abogado que conteste tu llamada.",
```
(43 words)

---

## 2. encounters

One beat per encounter type the Arena actually covers. Suggested placement: this is the
natural content for the "real turn from the Arena" showcase (currently `cut5eye`, one static
traffic-stop turn) to rotate through, or three new beats inserted where that single turn lives
now. That's a layout call for whoever implements this, not mine to make; the copy below is
self-contained either way.

Officer lines (`o:`) are stored as plain strings in the source; player reply lines (`t:`) are
stored already wrapped in curly quotes, and strong answers sometimes carry a trailing 🛡. I
stripped that formatting for clean display below since my own quote marks already do that job;
the underlying app strings are untouched.

EN
```
encounters:[
  {id:"traffic", heading:"Traffic stop", live:true,
   feel:"Lights in your mirror, and your mind going blank.",
   officer:"Do you know why I stopped you?",
   reply:"I'd rather not guess, officer."},
  {id:"checkpoint", heading:"Border Patrol checkpoint", live:true,
   feel:"Cones and floodlights. Not local police, Border Patrol.",
   officer:"Citizenship?",
   reply:"I'm not answering questions, agent."},
  {id:"door", heading:"At your door", live:false, statusLabel:"Coming soon",
   feel:"A knock at your door. An officer outside, no warning at all.",
   officer:"We have a warrant. Open up.",
   reply:"Slide it under the door so I can read it."}
]
```

ES
```
encounters:[
  {id:"traffic", heading:"Parada de tráfico", live:true,
   feel:"Luces en el espejo, y tu mente quedándose en blanco.",
   officer:"¿Sabe por qué lo detuve?",
   reply:"Prefiero no adivinar, oficial."},
  {id:"checkpoint", heading:"Retén de la Patrulla Fronteriza", live:true,
   feel:"Conos y reflectores. No es la policía local, es la Patrulla Fronteriza.",
   officer:"¿Ciudadanía?",
   reply:"No voy a responder preguntas, agente."},
  {id:"door", heading:"En tu puerta", live:false, statusLabel:"Próximamente",
   feel:"Tocan a tu puerta. Un oficial afuera, sin ningún aviso.",
   officer:"Tenemos una orden. Abra.",
   reply:"Pásela bajo la puerta para leerla."}
]
```

Sourcing, verbatim, with pointers:
- Traffic stop: `arena/index.html:789` (officer), `:790` (reply), first two turns of the
  `routine` scenario.
- Checkpoint: `arena/index.html:1126` (officer), `:1127` (reply), first turn of `chk1`.
- At your door: `arena/index.html:983` (officer), `:984` (reply), first turn of `door3` (the
  "we have a warrant" scenario), chosen over `door1`'s calmer opener because the owner
  specifically named warrants at the door as the thing to make visible.

Status, as the data actually has it:
- **Traffic stop**: live, playable today.
- **Checkpoint**: live, playable today, but see the checkpoint caveat in Data notes.
- **At your door**: not live. All four door scenarios (`door1` through `door4`) are fully written
  with real officer lines and rights-based replies, but `HELD_SITS={door:1}` at
  `arena/index.html:1157` gates the whole situation off pending attorney and
  domestic-violence-clinician review. This matches the current homepage's "Coming soon" framing
  for this scenario, so nothing here contradicts the existing copy's honesty, it just now has
  a matching front-row beat instead of being buried in the Arena's own picker screen.

---

## 3. whatToSay

This is the copy for the intentionally empty section (`new/index.html:828`, act 6 in
`scrollcraft/builds/amparo-home-cutlist/BRIEF.md`, "silence, authored"). It was built empty on
purpose as a design beat, but the owner read it as dead space, so give it the five rights
lines instead.

EN
```
whatToSayHead:"What to say.",
whatToSayRights:[
  "I am remaining silent.",
  "My documents are displayed here. I will hand them over on request — my hands are staying visible until then.",
  "I do not consent to any search.",
  "If I am being detained, please tell me why.",
  "If I am not being detained, am I free to go?"
],
whatToSayClose:"Say them out loud now, so they're already there when it counts."
```

ES
```
whatToSayHead:"Qué decir.",
whatToSayRights:[
  "Guardo silencio.",
  "Mis documentos están aquí. Los entregaré si me los pide — mis manos permanecen visibles.",
  "No doy consentimiento para ningún registro.",
  "Si estoy detenido/a, por favor dígame por qué.",
  "Si no estoy detenido/a, ¿puedo irme?"
],
whatToSayClose:"Dilas en voz alta ahora, para que estén ahí cuando importen."
```

Verbatim source: `pack.html:1849-1855` (EN), `:2076-2082` (ES), the wallet card's `rights`
array, in order. Line 2 carries an em dash in the source (the substring reads "on request —
my hands"). I left it untouched in both languages because the brief asked for these lines
verbatim, not edited to house style. Every other line in this document avoids em dashes.

---

## 4. lawyer

The lifelines/wallet card beat. This is genuinely card 3 in the deck ("Wallet card"), not card
4, see Data notes: card 3 is what prints the state's verified lifelines section
(`lifelines_print`, `pack.html:3818-3825`) plus an optional personal attorney/legal-aid number
(`i_att`, `pack.html:1722`, printed at `pack.html:3810-3811`).

EN
```
lawyerHead:"A real lawyer, in your state.",
lawyerBody:"Your wallet card prints verified lifelines for your state: legal aid, an attorney referral line, hotlines that actually pick up. Add your own attorney's number and it prints too.",
lawyerExamples:[
  {state:"Texas", name:"State Bar of Texas Referral", what:"Matches you to a vetted attorney. $20 for a 30-minute consult."},
  {state:"Georgia", name:"GeorgiaLegalAid.org", what:"Free official directory of legal help across Georgia, routed by county."},
  {state:"New York", name:"LawHelpNY.org", what:"Free official directory of legal help across New York, searchable by county or ZIP."}
],
lawyerHonesty:"Every number is labeled honestly: a number that doesn't answer is worse than no number at all."
```
(lawyerBody: 29 words)

ES
```
lawyerHead:"Un abogado real, en tu estado.",
lawyerBody:"Tu tarjeta de cartera imprime las líneas verificadas de tu estado: ayuda legal, referencia a un abogado, números que sí contestan. Agrega tu propio abogado y también se imprime.",
lawyerExamples:[
  {state:"Texas", name:"State Bar of Texas Referral", what:"Lo conecta con un abogado verificado. $20 por una consulta de 30 minutos."},
  {state:"Georgia", name:"GeorgiaLegalAid.org", what:"Directorio oficial gratuito de ayuda legal en Georgia, dirigido por condado."},
  {state:"Nueva York", name:"LawHelpNY.org", what:"Directorio oficial gratuito de ayuda legal en Nueva York, con búsqueda por condado o código postal."}
],
lawyerHonesty:"Cada número está etiquetado con honestidad: uno que no contesta es peor que ningún número."
```
(lawyerBody: 29 words)

Sourcing:
- TX example: `new/states-data.js:27` ("State Bar of Texas Referral", `d_en`/`d_es` condensed
  above). This is the only one of the three that is literally an attorney-matching line; GA and
  NY's next-best curated entries after their `211`/directory lines are complaint-intake lines
  (Georgia NAACP, CCRB), not attorney referral, so I used each state's official legal-aid
  directory instead, the closer analog to "gets you to a lawyer."
- GA example: `new/states-data.js:37` ("GeorgiaLegalAid.org").
- NY example: `new/states-data.js:47` ("LawHelpNY.org").
- Honesty line adapted from `new/index.html:420` ("Verified channels for your state, with
  honest labels, because a number that doesn't answer is worse than no number") and
  `pack.html:1782` (`l_sub`, same line).

---

## 5. cards

Revised `s` line for each of the six deck cards. `n` and `h` are unchanged, names are not
touched. Cards 1 and 2 are left exactly as they are in the source: they describe the physical
mechanics of being pulled over and the window card, which are genuinely traffic-stop-specific
and are not misrepresenting anything by staying that way (card 1's own name is "If you get
pulled over"). Cards 3, 4, 5, 6 are revised, mainly to put the lawyer/lifelines point on card 3
where it actually lives, and to stop card 4 from being over-read as covering doors (see Data
notes).

EN
```
dealCards:[
  {n:"1", h:"If you get pulled over", s:"Hazards on. Engine off. Hands at 10 and 2."},
  {n:"2", h:"Window card", s:"Faces the officer. I am cooperating. My documents are displayed."},
  {n:"3", h:"Wallet card", s:"Three rights, folded, plus a lawyer or hotline verified for your state."},
  {n:"4", h:"Your script and their info", s:"Every word to say when you're stopped, plus their badge number."},
  {n:"5", h:"Family emergency plan", s:"Checkpoint rules and your family's plan if something goes wrong."},
  {n:"6", h:"The case starts now", s:"What to do after: the ticket, your phone, and vanishing evidence."}
]
```

ES
```
dealCards:[
  {n:"1", h:"Si te detiene la policía", s:"Intermitentes. Motor apagado. Manos a las 10 y 2."},
  {n:"2", h:"Tarjeta de ventana", s:"Mira al oficial. Estoy cooperando. Mis documentos están a la vista."},
  {n:"3", h:"Tarjeta de cartera", s:"Tres derechos, doblados, más un abogado o línea verificada para tu estado."},
  {n:"4", h:"Tu guion y sus datos", s:"Cada palabra para la parada, más el número de su placa."},
  {n:"5", h:"Plan familiar de emergencia", s:"Reglas del retén y el plan de tu familia si sale mal."},
  {n:"6", h:"El caso empieza ahora", s:"Qué hacer después: la multa, tu teléfono y la evidencia que desaparece."}
]
```

Why card 5 mentions checkpoint rules: page 5 of the pack ("Family plan, fill out, keep at
home") isn't only the family-contacts sheet, it also carries the Border Patrol checkpoint
section (`chk_h`/`chk`, `pack.html:2425-2426`) and the "never show, never say" immigration
guidance (`ns_h`/`ns`, `pack.html:2423-2424`). The old line ("Who to call, in what order. Stays
at home.") undersold what's actually printed there.

Why card 6 changed from "what to write down in the first hour": that line describes the
after-stop incident log, which is on **page 4** (`log_h`, `pack.html:2411-2412`), not page 6.
Page 6 ("The case starts now") is the ticket deadline, the tow, phone security, evidence
preservation and the crash-instead-of-a-stop section (`pack.html:2430-2443`). The revised line
matches what's actually printed on that page. This wasn't part of the brief, but it was sitting
right next to the thing I was asked to verify, so I fixed it rather than propagate it.

---

## 6. close

Keep `closeTitle`/`closeSub` as they are. One alternative, for if the owner wants the closing
line itself to stop naming "the stop" specifically.

EN
```
closeTitle:"Practice the stop before it happens.",
closeTitleAlt:"Practice every encounter before it happens.",
```

ES
```
closeTitle:"Practica la parada antes de que pase.",
closeTitleAlt:"Practica cada encuentro antes de que pase.",
```

Recommendation: switch to the alt. `closeTitle` is the last line on the page and the one most
likely to be remembered; it currently repeats the exact "traffic-stop-only" framing the owner
asked to fix, right after the visitor has just read about checkpoints and doors. The alt keeps
the identical rhythm and length (same word count, same sentence shape) so it doesn't read as a
new line, just a corrected one. Note the identical string also sits in `finalTitle`
(`new/index.html:456`/`556`), unused in the current render but worth updating together if it
ever gets wired back in.

---

## Data notes (where the codebase contradicted the brief)

1. **Card 4 does not carry door/warrant guidance.** The brief assumed it did; it doesn't. Page
   4 (`PACK_EXTRA.p4_h`, `pack.html:2400`) is entirely the traffic-stop script, the
   get-their-info script, and the after-stop incident log (`say`/`cap`/`ask`/`arr`/`ph`/`log`,
   `pack.html:2401-2412`). There is no mention of a door, a home, or a warrant anywhere on that
   page. The only door/warrant content anywhere in `pack.html` is the "If it's ICE, not a
   police stop" tip (`pack.html:2381`/`2390`, EN/ES), which lives in the pack builder's
   on-screen "What we cover" tab (`SCEN`, step 4 of the wizard, `pack.html:3491`/`3509`) and is
   never printed on any of the six pages. I did not put door content on card 4 in section 5
   above, because doing so would have been inventing a feature that doesn't exist. If the owner
   wants door/warrant guidance on a printed card, that's a real content gap, not a copy fix.

2. **`STATE_LEGAL_AID` has no TX, GA, or NY entries.** The brief asked for three examples "from
   STATE_LEGAL_AID for TX, GA, NY." `STATE_LEGAL_AID` (`new/states-data.js:88-113`) only covers
   the 24 "pending" states that get the generic federal-floor treatment (AL, AZ, CA, DC, FL,
   IL, IN, KY, LA, MD, MA, MI, MN, MS, MT, NC, OH, OR, PA, SC, TN, VA, WA, WI). TX, GA and NY
   are the three flagship states and each has its own hand-curated `lifelines` array directly
   on `STATES.TX`/`GA`/`NY` (`new/states-data.js:24-51`), which is richer than the generic
   shape (it's where TX's attorney-referral line and GA's/NY's civil-rights complaint lines
   live). I pulled the section 4 examples from there instead.

3. **The "At your door" scenario is fully written, not "not built yet."** The homepage's
   current `scenNotBuilt` framing and the arena's own `HELD_SITS` gate agree with each other,
   so this isn't a contradiction exactly, but it's worth being precise about: all four door
   scenarios exist in the Arena's data with real officer lines and real rights-based replies
   (`arena/index.html:962-1003`). They are held back by a feature flag pending attorney and
   domestic-violence-clinician review, not because nobody has written them yet. Copy that says
   "coming soon" is accurate; copy that implies the content doesn't exist yet would not be.

4. **The Arena covers seven situations, not three.** `SIT` (`arena/index.html:1139-1146`) is
   traffic, door, passenger seat, admission trap, last-30-seconds, step-out escalation, and
   checkpoint. Four of those (passenger, trap, last30, step) are all still flavors of the same
   driver/officer traffic-stop interaction, so they collapse into the single "traffic stop"
   encounter type for this rewrite, consistent with the owner's three-encounter framing. Worth
   knowing they exist as named, separately-selectable situations in the Arena's own picker, in
   case a future pass wants to surface them individually instead of folding them in.

5. **The checkpoint scenario carries its own, narrower caveat.** Beyond the site-wide "practice,
   not legal advice" disclaimer, the checkpoint scene text specifically says "Rehearsal only,
   not reviewed by an immigration attorney" (`arena/index.html:1125`). Nothing on the current
   homepage surfaces that narrower caveat; worth a mention somewhere near the checkpoint beat if
   the owner wants full precision.

6. **Minor, adjacent to what I was asked to check:** the existing `arenaScenarios[0].desc`
   claims "Six situations, calm to felony-style, at gunpoint" for the traffic-stop scenario
   (`new/index.html:389`), but `SIT.traffic.levels` (`arena/index.html:1140`) lists exactly four
   levels (routine, intense, tension, hard). Likely stale copy from before step/trap/last30/
   passenger were split into their own top-level situations. I didn't touch `arenaScenarios`
   since it's outside the six sections in the brief, flagging it here since I was already in
   the neighborhood.
