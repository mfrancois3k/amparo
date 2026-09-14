# Three-scene motion release

## Direction
One continuous story: traffic encounter → closed-door moment → cards and keys. Keep the approved traffic imagery, but give each chapter its own generated film, copy, and camera movement. Free practice remains the persistent primary action. Door practice and physical products remain explicitly unavailable/prelaunch.

## References applied
- User's Notion `three js and gsap tutorial`: inspected pinning structure and component links in-browser.
- Notion `Gsap Componets`: inspected masking, staggered text, image-mask and background expansion entries.
- Notion `GSAP Text Stroke Animation`: read SVG stroke-dashoffset and ScrollTrigger example; adapted to readable outlined emphasis with a synchronized fill reveal.
- Pasted masked headline: overflow-hidden line wrappers with reversible vertical line reveals.
- Pasted width expansion: 80%→100% visual aperture using clip-path, avoiding width/layout animation and keeping the CTA stationary.
- GSAP 3.15.0 and ScrollTrigger are self-hosted under new/vendor. Original license headers retained. Source: versioned official npm package via jsDelivr; runtime usage checked against https://gsap.com/docs/v3/Plugins/ScrollTrigger/.

## Production details
Actual footage: traffic 10.042s, door 5.042s, ready 5.042s. Scroll duration belongs to the visitor. 121/61/61 frames; distinct desktop and portrait-mobile renditions. All portrait frames total 2.69MB. Film provenance and crop verification: AMPARO-CINEMA-THREE.md.

GSAP owns scroll progress; CSS sticky owns the stage. Native document scroll, explicit chapter controls and skip remain available. Scene transitions wipe between actual clips. Headline line masks overlap through boundaries; emphasis reveals from outline to fill. A 30-frame decoded-bitmap cap, 4-request queue, per-generation cancellation, and teardown contain resources. Media failures/reduced motion/Save-Data/short or overfull viewports retain a three-scene static reading path. Pinning begins only after media readiness. No forced animation duration or looping headline replacement.

## Verification
126 full-suite tests pass;18 focus on mapping, reverse boundaries, 3-scene bilingual markup, readiness gates, media failure, reduced motion, Save-Data, cancellation, cache bounds and teardown. Inline scripts parse and static prerender matches. Browser inspected all3actual scenes and chapter transitions at1280×720 and1440×900, Spanish portrait390×844 and320×844, and motion-off fallback. At320px, CTA bottom697px and chapter controls top752.5px, no horizontal overflow. Returning from chapter3 to1 yields progress0.100 and scene0. No runtime errors captured. This is a browser and code review, not physical-device or screen-reader certification.

## Motion correction — September 13
User clarified that scenes move but their movement is too subtle. Read both supplied desktop skill bundles; animated-website copies are identical. The additional bundle contains motion-spec guidance, not a reference film. Retained the existing authorized Higgsfield clips and frame assets.

Three camera paths now move the footage inside fixed masks: traffic scale 1.00 to 1.34 with a leftward track; doorway 1.34 to 1.04 pulling back; preparedness 1.06 to 1.40 with a diagonal move toward the cards. Mobile uses 65% of this extra travel to protect portrait framing. These are composited camera moves over existing footage, not newly generated 3D geometry.

A monotonic sine remap slows footage around each chapter midpoint while advancing faster through entry/exit. Time-based 110ms exponential follow-through settles exactly and stops requesting animation frames. Motion-off, reduced motion, hidden tabs, loading cancellation and reverse navigation remain covered. No new payload or extraction needed.

Validation: 133 tests pass, including 25 motion tests. Chapter navigation calculates current page geometry to avoid stale destinations after resize. Static prerender check passes. Desktop camera composition and mobile framing inspected in browser.
