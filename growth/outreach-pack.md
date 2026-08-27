# Outreach pack — Flipboard + compliant Reels

_Content to execute by hand. Flipboard and Instagram both require a logged-in human — that is correct, not a gap.

**Two things intentionally excluded, and why:**
- No coordinated upvoting on Digg. Manufacturing votes to game a ranking algorithm is inauthentic engagement, the same category as Reddit vote brigading, regardless of platform.
- No reaction to a specific trending clip. `tools/news-post.mjs` already enforces this rule for the daily posts: the news chooses WHICH scenario, never WHAT is said, and no individual case ever enters a post. A 24-48h-old clip is a real person, often mid legal process — scripting a "correction" against a stranger to route traffic here is a risk this product does not take. The Reels below react to a misconception PATTERN instead.

---

## Flipboard magazines

### Know Your Rights — Texas & New York
What the statute actually says at a traffic stop in TX and NY, quoted with the citation.

Seed list (flip these, in order — mix of Amparo pages and named primary sources, never scraped or unattributed):

1. [Amparo — Your rights at a traffic stop in Texas](https://www.amparohq.com/rights/tx/?utm_source=flipboard&utm_medium=organic&utm_content=mag_tx)
2. [Amparo — Sus derechos en una parada de tráfico en Texas](https://www.amparohq.com/derechos/tx/?utm_source=flipboard&utm_medium=organic&utm_content=mag_tx_es)
3. [Amparo — Your rights at a traffic stop in New York](https://www.amparohq.com/rights/ny/?utm_source=flipboard&utm_medium=organic&utm_content=mag_ny)
4. [Amparo — Sus derechos en una parada de tráfico en Nueva York](https://www.amparohq.com/derechos/ny/?utm_source=flipboard&utm_medium=organic&utm_content=mag_ny_es)
5. [ACLU — Know Your Rights: Stopped by Police](https://www.aclu.org/know-your-rights/stopped-by-police)
6. [NYCLU — Know Your Rights](https://www.nyclu.org/know-your-rights)
7. [TexasLawHelp.org — Find Legal Help](https://texaslawhelp.org/find-legal-help)
8. [ACLU of Texas — Know Your Rights](https://www.aclutx.org/en/know-your-rights)
9. [Amparo — How we verify every rule we publish](https://www.amparohq.com/how-we-verify/?utm_source=flipboard&utm_medium=organic&utm_content=mag_verify)

### Beat Traffic-Stop Anxiety
What actually happens during a stop, and how to walk in prepared instead of guessing.

Seed list (flip these, in order — mix of Amparo pages and named primary sources, never scraped or unattributed):

1. [Amparo — About](https://www.amparohq.com/about/?utm_source=flipboard&utm_medium=organic&utm_content=mag_anx)
2. [ACLU — What to Do If You Are Stopped by Police](https://www.aclu.org/know-your-rights/stopped-by-police)
3. [NHTSA — Traffic Stops: What to Expect](https://www.nhtsa.gov/road-safety/driver-safety)
4. [ILRC — Red Cards (Know Your Rights)](https://www.ilrc.org/red-cards-tarjetas-rojas)
5. [CLINIC — Know Your Rights Resources](https://cliniclegal.org/resources/know-your-rights)
6. [Amparo — Your rights at a traffic stop (federal floor, any state)](https://www.amparohq.com/rights/any-state/?utm_source=flipboard&utm_medium=organic&utm_content=mag_anx_us)
7. [CHIRLA — Know Your Rights](https://www.chirla.org/know-your-rights/)
8. [211.org — Find Local Legal Aid](https://www.211.org/)
9. [Amparo — Your rights at a traffic stop in Georgia](https://www.amparohq.com/rights/ga/?utm_source=flipboard&utm_medium=organic&utm_content=mag_anx_ga)

### Bilingual Justice & Civil Rights
Rights information that exists in Spanish and English with equal rigor — not a translation afterthought.

Seed list (flip these, in order — mix of Amparo pages and named primary sources, never scraped or unattributed):

1. [Amparo — Sus derechos en cualquier estado (piso federal)](https://www.amparohq.com/derechos/cualquier-estado/?utm_source=flipboard&utm_medium=organic&utm_content=mag_bj)
2. [ACLU — Derechos si es detenido por la policía](https://www.aclu.org/know-your-rights/stopped-by-police)
3. [USAHello — Know Your Rights (multilingual)](https://usahello.org/rights/)
4. [United We Dream — Know Your Rights](https://unitedwedream.org/resources/know-your-rights/)
5. [Amparo — Acerca de Amparo](https://www.amparohq.com/acerca/?utm_source=flipboard&utm_medium=organic&utm_content=mag_bj_about)
6. [LawHelpCA — Find Legal Help](https://www.lawhelpca.org/find-legal-help)
7. [NILC — Know Your Rights Materials](https://www.nilc.org/resources/)
8. [Amparo — Cómo verificamos cada regla](https://www.amparohq.com/como-verificamos/?utm_source=flipboard&utm_medium=organic&utm_content=mag_bj_verify)
9. [CLINIC — Conozca Sus Derechos](https://cliniclegal.org/resources/know-your-rights)

---

## Reels scripts — pattern-reactive, not clip-reactive

Find or film your OWN 20-30s talking-head clip for each. Do not attach these to someone else's trending video.

### admission-trap
```
HOOK (0-2s) — on screen, no clip, no name:
  “People think “do you know why I pulled you over” is small talk.”

VALUE (2-15s) — say this, verbatim from the drill:
  “I’d rather not guess, officer.”
  (IF ASKED “DO YOU KNOW WHY…”)

CTA (15-30s):
  "Amparo has a free 3-minute drill for exactly this — the Admission Trap. Link in bio."
  On-screen URL: https://www.amparohq.com/arena/?sit=trap&utm_source=flipboard&utm_medium=organic&utm_content=reel_admission-trap_en
```

```
GANCHO (0-2s) — en pantalla, sin clip, sin nombre:
  «La gente cree que «¿sabe por qué lo detuve?» es una charla casual.»

VALOR (2-15s) — diga esto, textual del ejercicio:
  «Prefiero no adivinar, oficial.»
  (SI PREGUNTAN «SABE POR QUÉ…»)

LLAMADO A LA ACCIÓN (15-30s):
  "Amparo tiene un ejercicio gratis de 3 minutos para justo esto — la Trampa de Admisión. Enlace en la bio."
  URL en pantalla: https://www.amparohq.com/arena/?sit=trap&utm_source=flipboard&utm_medium=organic&utm_content=reel_admission-trap_es
```

### silence-aloud
```
HOOK (0-2s) — on screen, no clip, no name:
  “People think going quiet is the same as using their right to remain silent.”

VALUE (2-15s) — say this, verbatim from the drill:
  “I choose to remain silent.”
  (TO STAY SILENT — SAY IT)

CTA (15-30s):
  "Amparo has a free 3-minute drill for exactly this — the Traffic Stop drill. Link in bio."
  On-screen URL: https://www.amparohq.com/arena/?sit=traffic&utm_source=flipboard&utm_medium=organic&utm_content=reel_silence-aloud_en
```

```
GANCHO (0-2s) — en pantalla, sin clip, sin nombre:
  «La gente cree que quedarse callado es lo mismo que usar el derecho a guardar silencio.»

VALOR (2-15s) — diga esto, textual del ejercicio:
  «Elijo guardar silencio.»
  (PARA GUARDAR SILENCIO — DÍGALO)

LLAMADO A LA ACCIÓN (15-30s):
  "Amparo tiene un ejercicio gratis de 3 minutos para justo esto — el ejercicio de Parada de Tráfico. Enlace en la bio."
  URL en pantalla: https://www.amparohq.com/arena/?sit=traffic&utm_source=flipboard&utm_medium=organic&utm_content=reel_silence-aloud_es
```

### refuse-search
```
HOOK (0-2s) — on screen, no clip, no name:
  “People think refusing a search is itself suspicious.”

VALUE (2-15s) — say this, verbatim from the drill:
  “I do not consent to a search.”
  (IF ASKED TO SEARCH)

CTA (15-30s):
  "Amparo has a free 3-minute drill for exactly this — the Traffic Stop drill. Link in bio."
  On-screen URL: https://www.amparohq.com/arena/?sit=traffic&utm_source=flipboard&utm_medium=organic&utm_content=reel_refuse-search_en
```

```
GANCHO (0-2s) — en pantalla, sin clip, sin nombre:
  «La gente cree que negarse a un registro ya es sospechoso.»

VALOR (2-15s) — diga esto, textual del ejercicio:
  «No doy consentimiento a un registro.»
  (SI PIDEN REGISTRAR)

LLAMADO A LA ACCIÓN (15-30s):
  "Amparo tiene un ejercicio gratis de 3 minutos para justo esto — el ejercicio de Parada de Tráfico. Enlace en la bio."
  URL en pantalla: https://www.amparohq.com/arena/?sit=traffic&utm_source=flipboard&utm_medium=organic&utm_content=reel_refuse-search_es
```

