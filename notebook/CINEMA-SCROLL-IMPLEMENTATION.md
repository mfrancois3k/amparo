# Scroll-controlled cinematic hero

The approved clay image remains the poster. A new Higgsfield Seedance film (10.042 seconds) supplies 121 frames. Native document scroll drives a sticky canvas and three bilingual text beats; reversing scroll reverses the scene. The practice CTA is always available. Skip moves keyboard focus to the next section. Motion-off, reduced-motion, Save-Data and short viewports retain the still and normal flow.

References applied:
- https://www.builder.io/blog/3d-gsap — generated-film frame extraction, sticky canvas, native scroll, cover rendering, optimized renditions. Same architecture with a small native controller rather than adding GSAP to this static site.
- https://github.com/dickwu/apple-design-skill — read SKILL and eight HIG reference pages; optional/cancelable motion, gesture consistency, typography, contrast and primary-action hierarchy.
- Local Apple Design + Animate skills — direct and interruptible progress, transform/opacity text, restraint.

Film details/provenance: AMPARO-CINEMA-SCROLL.md. Desktop frames total 2.17 MB; mobile 1.09 MB. Four fetches at a time, a 24-bitmap nearby-frame cache with explicit disposal. Approved poster remains if frames fail.

Validation: 122 tests pass, including 14 scroll-specific mapping, reversal, renderer, reduced-motion, Save-Data, passive listener, skip and disposal checks. Static prerender matches. Inline scripts parse. Browser: frame 53 / beat 2 at progress .438, frame 91 / beat 3 at .759, back to frame 4 / beat 1 at .036. Actual measured widths 1280, 390 and 320; Spanish mobile final CTA and footer do not overlap. Skip focuses #how; motion-off unpins and hides canvas. This is not a physical-device or screen-reader certification.
