# Cinematic scroll sequence

Created 2026-09-14 with Higgsfield Seedance 2.5 from the approved cinematic traffic still (image job `72a9cf9c-6778-47d9-ab8a-21e258ec6550`). New video job: `cf984768-b162-4e5c-8e1d-3d46b951aa71`. Exact request is recorded in `cinema-scroll-generation.json`.

This is a newly generated ten-second shot, not an extension or reuse of the previous five-second video. The brief requests a visible continuous cinematic push, subtle officer lean, stable driver hands, downward flashlight, dim steady background lights, rain, and preserved dark left copy space. Existing-credit preflight was 65 credits. No purchase was made.

## Delivered assets

- `new/assets/cinema-scroll.mp4`: 1,274,038 bytes; 10.042 seconds; H.264 1280 × 724; 24fps; yuv420p; no audio; faststart; keyframes every 6 frames (0.25 seconds).
- `new/assets/cinema-scroll/manifest.json`: actual count **121** at 12fps, desktop 1024 × 580, mobile 640 × 362, actual duration 10.042 seconds. File prefixes are `/new/assets/cinema-scroll/desktop/frame-` and `/new/assets/cinema-scroll/mobile/frame-`.
- Desktop `frame-000.webp` through `frame-120.webp`: quality 65; 2,173,690 bytes total.
- Mobile same numbering: quality 60; 1,090,852 bytes total.
- `notebook/cinema-scroll-proof.jpg`: ten frames at one-second intervals for visual review.

The source duration yields 121 frames at 12fps rather than exactly 120; consumers must use manifest.count. Desktop and mobile have the same count and timestamps. The whole desktop sequence is about 2.17 MB, but its individual frames average 18 KB. Mobile frames average 9 KB.

## Processing

All transcoding and extraction ran in Higgsfield's sandbox. MP4 flags: `-an -vf 'scale=1280:-2,fps=24' -c:v libx264 -preset medium -crf 27 -maxrate 950k -bufsize 1900k -g 6 -keyint_min 6 -sc_threshold 0 -bf 0 -pix_fmt yuv420p -movflags +faststart`.

Frame extraction uses `-vf 'fps=12,scale=1024:-2' -c:v libwebp -quality 65 -compression_level 6 -start_number 0` for desktop, and scale 640 with quality 60 for mobile. A ZIP package was downloaded and expanded only into the isolated repository assets directory.

## Verification

Inspected the approved source still and a ten-frame contact sheet spanning the generated shot. The revised shot has a noticeable gradual camera push and officer lean, while the driver's two hands remain on the wheel. The flashlight stays downward, dark left composition remains available, and no new objects, baked text, weapons, or scene cuts appear in the sampled sequence. There are no audio streams. The file and manifest dimensions/counts were checked. Exact generated movement is model-produced; the requested 10% push is a creative brief, not a measured camera transform. Browser scroll rendering and text choreography are verified by the homepage implementation task.
