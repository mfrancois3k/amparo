/* Geographic state map. wargames/15 Move 3.2, build order step 9.
 *
 * Ported from index.html:3230-3236 (markup), 3746-3782 (labels + wave),
 * 3786-3791 (caption), 3740-3745 (silhouette).
 *
 * Fork F3 ("wrap the existing vanilla map verbatim") was struck from the plan
 * before this was written, for a reason that only became visible after /app got
 * its own CSP: root ships every map handler as an inline attribute injected via
 * innerHTML (`onclick="pickState('AL')"`, index.html:3232). Inline event handlers
 * are blocked by `script-src 'self'`, so a verbatim wrap would render a
 * correct-looking map that is completely dead to input, with 51 CSP violations.
 * The choreography F3 existed to protect is also absent here — root's collapse
 * timeline needs GSAP, which cannot load under the same policy, so root's own
 * no-GSAP path (an instant swap) is what /app ships.
 *
 * Three bugs the source documents, and how each is avoided here:
 *  - Labels stacking at 0,0 from an early getBBox: no measurement at all. See
 *    content/map.ts — SM_BOX is the baked measurement.
 *  - The entrance wave re-firing on every render: armed once per reveal via a ref
 *    latch, never from render.
 *  - Search re-mounting 51 paths: paths are rendered unconditionally with stable
 *    keys; filtering only toggles a className.
 */
import { useEffect, useRef, useState } from 'react'
import { CODES, LABELS, PATH_D, VIEWBOX, shapeViewBox } from '../content/map'
import type { Bank } from '../i18n'
import '../styles/map.css'

type Props = {
  picked: string | null
  /** null = no active search; otherwise the codes that match. */
  matches: ReadonlySet<string> | null
  names: Record<string, string>
  isCited: (code: string) => boolean
  t: Bank
  onPick: (code: string) => void
}

export function StateMap({ picked, matches, names, isCited, t, onPick }: Props) {
  const [hover, setHover] = useState<string | null>(null)

  /* The wave plays once per reveal of the map — root's behaviour, not "once per
     session". Root rebuilds the SVG on every render() and re-runs smPlaceLabels,
     so re-entering the step replays it there too. What must NOT replay is a
     search keystroke or the uncollapse from "Not your state?" within one mount,
     and a ref latch is what prevents that: `armed` is never read during render,
     so it cannot cause one. */
  const armed = useRef(false)
  const [waving, setWaving] = useState(false)

  useEffect(() => {
    if (armed.current) return
    armed.current = true
    setWaving(true)
    /* .smgo is removed once the wave has visibly landed (longest stagger ~420ms
       + 500ms keyframe). With `backwards` this no longer has to fight the
       animations cascade layer for search dimming — see styles/map.css — but the
       class still decides whether the animation runs, so it is still swapped. */
    const id = window.setTimeout(() => setWaving(false), 950)
    return () => window.clearTimeout(id)
  }, [])

  const cap = hover ?? picked
  const capCited = cap ? isCited(cap) : false

  return (
    <div className="sm-wrap">
      <svg
        className={`sm-map${waving ? ' smgo' : ''}`}
        viewBox={VIEWBOX}
        role="group"
        aria-label={t.sm_aria}
      >
        {CODES.map((code) => {
          const dim = matches !== null && !matches.has(code)
          return (
            <path
              key={code}
              className={
                'sm-st' +
                (isCited(code) ? ' cited' : '') +
                (picked === code ? ' sel' : '') +
                (dim ? ' nomatch' : '')
              }
              d={PATH_D[code]}
              data-st={code}
              tabIndex={dim ? -1 : 0}
              role="button"
              aria-label={names[code] ?? code}
              aria-pressed={picked === code}
              style={{ animationDelay: `${LABELS.find((l) => l.code === code)!.delayMs}ms` }}
              onClick={() => onPick(code)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(code) }
              }}
              onPointerEnter={() => setHover(code)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(code)}
              onBlur={() => setHover(null)}
            />
          )
        })}

        {/* Labels are full peer targets, not decoration — for the sliver states
            (RI/DE/DC/NJ/CT/MA/NH/VT/MD) the label IS the only realistic target
            on a phone. Same handlers as the paths. */}
        <g className="sm-lbs">
          {LABELS.map((l) => {
            const dim = matches !== null && !matches.has(l.code)
            return (
              <text
                key={l.code}
                className={'sm-lb' + (isCited(l.code) ? ' cited' : '') + (dim ? ' nomatch' : '')}
                x={l.x}
                y={l.y}
                textAnchor={l.anchor}
                data-st={l.code}
                tabIndex={dim ? -1 : 0}
                role="button"
                aria-label={names[l.code] ?? l.code}
                style={{ animationDelay: `${l.delayMs}ms` }}
                onClick={() => onPick(l.code)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(l.code) }
                }}
                onPointerEnter={() => setHover(l.code)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(l.code)}
                onBlur={() => setHover(null)}
              >
                {l.code}
              </text>
            )
          })}
        </g>
      </svg>

      {/* Caption: the tile keeps its two letters, the full name and coverage tier
          land here. aria-hidden matches root — each target already carries its
          full name as an accessible name, so announcing this too would double up. */}
      <div className="sm-cap" aria-hidden="true">
        {cap ? (
          <>
            <span className="nm">{names[cap] ?? cap}</span>
            <span className={`tag ${capCited ? 'cited' : 'fed'}`}>
              {capCited ? t.s_pri_label : t.s_rest_label}
            </span>
          </>
        ) : (
          <span className="nm" style={{ color: 'var(--muted)', fontWeight: 700 }}>{t.sm_hint}</span>
        )}
      </div>

      <div className="sm-legend">
        <span className="lg-c"><i />{t.s_pri_label}</span>
        <span className="lg-f"><i />{t.s_rest_label}</span>
      </div>
    </div>
  )
}

/** Cropped silhouette of one state, for the confirmed chip. Ported from smShape. */
export function StateSilhouette({ code }: { code: string }) {
  const vb = shapeViewBox(code)
  if (!vb) return null
  return (
    <svg className="cf-shape" viewBox={vb} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <path d={PATH_D[code]} />
    </svg>
  )
}
