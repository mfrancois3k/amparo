# Three distinct cinematic scenes

Higgsfield media prepared 2026-09-14 for the homepage's three-chapter scroll narrative. Existing approved traffic imagery and ten-second traffic video were retained unchanged. New scenes are actual generated footage, not the same clip reused with different captions.

## Sources and generation

- Traffic: existing Seedance job `cf984768-b162-4e5c-8e1d-3d46b951aa71`, 10.042 seconds. Existing desktop prefix preserved at `/new/assets/cinema-scroll/desktop/frame-`.
- Door: new Seedance 2.5 job `a5f7eafe-0375-42ea-874d-5881becd5ba6`, 5.042 seconds, from approved doorstep still `e53cc4f7-0b00-4f6f-b0f8-9c4d8d62e46e`. Continuous dolly toward the closed door, officer outside and resident inside.
- Readiness still: GPT Image 2.5 job `8b2f06c8-9526-4853-b846-f1d45b5f99b7`, using approved traffic/door images for visual consistency. Quiet walnut table with completely blank ivory folded card/envelope, brass keys, navy key fob and face-down phone. No legal copy is generated on the card.
- Readiness motion: new Seedance 2.5 job `769b9762-b65d-420a-ad4d-7d546b0eb829`, 5.042 seconds, from the readiness still. Deliberate low camera sweep/push with dimensional foreground/background motion. No people or hand animation.

Exact requests: `cinema-three-generation.json`. No subscription or credit purchase was performed.

## Asset contract

`new/assets/cinema-three/manifest.json` supplies `scenes` with IDs, counts, durations, desktop/mobile prefixes, dimensions, and poster paths. Counts: traffic **121**, door **61**, ready **61**, sampled at 12fps. Desktop dimensions are 1024 × 580. New portrait mobile frames are **480 × 854** and come from original video crops before resizing; older traffic mobile assets are unchanged.

| Scene | New desktop bytes | Portrait mobile bytes | New MP4 bytes |
| --- | ---: | ---: | ---: |
| Traffic | Existing desktop sequence | 1,541,690 | Existing video unchanged |
| Door | 1,273,438 | 618,670 | 680,837 |
| Ready | 864,826 | 527,962 | 687,942 |

All portrait mobile frames together total **2,688,322 bytes**. MP4s are H.264, 24fps, faststart, no audio, keyframe interval 6 frames. New files are `cinema-three/door.mp4`, `cinema-three/ready.mp4`, and `cinema-three/ready-poster.webp`, with corresponding scene frame folders. Desktop WebP quality 65; mobile quality 55, compression level 6. Readiness poster is 1600 × 905 WebP quality 86.

Portrait crop formula: `crop=trunc(ih*240/427/2)*2:ih:(iw-ow)*FOCAL:0,scale=480:854`, following `fps=12`. FOCAL is .72 traffic, .24 door, .65 ready. Portrait framing prioritizes the encounter/window, closed door boundary, and blank card/keys respectively. A narrow portrait crop cannot include the doorway's widely separated officer and resident simultaneously; the officer and closed door are prioritized, while desktop retains both people. Traffic's late portrait frames shift emphasis to officer/hands, with the driver's head moving outside the left crop as the camera advances.

## Visual verification

Inspected the generated readiness still, one-second frame contact sheets for both new clips, and first/last portrait frames for all three scenes. The door remains shut throughout sampled footage; neither person crosses the threshold. Ready has a clearly different environment and camera move, with blank surfaces and no invented legal writing. No new text, scene cuts, weapons, or new people appear. The portrait proof is `cinema-three/mobile-proof.jpg`; copies and full-width scene proofs are beside this document.

The filmic scene movement is generated footage; the scroll mapping, masked text, transitions, and web accessibility controls are separate frontend implementation responsibilities.
