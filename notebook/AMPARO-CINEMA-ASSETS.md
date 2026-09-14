# Amparo cinematic homepage media

Generated with Higgsfield on 2026-09-13 after the initial geometric miniatures were rejected as too toy-like. These assets reconstruct the original clay encounter scenes as immersive film frames with mature proportions, tactile materials, restrained lighting, and no embedded legal text. They are generated raster image/video assets, not real-time geometry.

## Delivered files

| File | Dimensions | Size | Purpose |
| --- | --- | --- | --- |
| `new/assets/cinema-traffic-hero.webp` | 1910 × 1080 | 113,796 bytes | Main hero/reduced-motion still; dark left 42% supports ivory copy |
| `new/assets/cinema-doorstep.webp` | 1600 × 905 | 131,182 bytes | Lower narrative chapter; officer outside, closed door, resident inside |
| `new/assets/cinema-traffic-hero.mp4` | 1280 × 724 | 422,297 bytes | Actual generated cinematic motion; 5.042s, H.264, 24fps, yuv420p, no audio |

## Generation provenance

- Traffic still: Higgsfield GPT Image 2.5, high quality, 2K, requested 16:9. Job `72a9cf9c-6778-47d9-ab8a-21e258ec6550`. Reference: original `new/assets/c3-end.webp`, imported from the project's own live URL. Existing-credit estimate: 3 credits.
- Doorstep still: same model/settings. Job `e53cc4f7-0b00-4f6f-b0f8-9c4d8d62e46e`. References: original `new/assets/c2-start.webp` plus approved generated traffic still for material/lighting consistency. Existing-credit estimate: 3 credits.
- Motion: Higgsfield Seedance 2.5, omni-reference mode, 720p, requested 5s, `generate_audio: false`, traffic still as start reference. Job `3de18941-3ed2-419f-b602-dcaea9da65c0`. Existing-credit estimate: 32.5 credits. No subscription or credit purchase was performed.

Exact generation requests: `cinema-image-generation.json`, `cinema-doorstep-generation.json`, `cinema-video-generation.json` beside this document. Initial failed traffic reference URL without `/new` returned 404 before any job; the recorded request uses the corrected URL.

## Optimization

Processed in Higgsfield's sandbox, then downloaded as same-origin website assets. Pillow converted RGB stills to WebP (traffic quality 88, doorstep quality 87, method 6) without adding text or changing the composition. The source image's near-16:9 dimensions were preserved.

Video encode: `ffmpeg -i source.mp4 -an -vf 'scale=1280:-2,fps=24' -c:v libx264 -preset medium -crf 24 -pix_fmt yuv420p -movflags +faststart cinema-traffic-hero.mp4`.

## Verification and limits

Both final optimized stills were visually inspected. Traffic: clearly visible driver hands on wheel, officer beyond window, downward flashlight, accurate cabin frame, amber/blue atmosphere, clean dark copy area, no weapon or baked text. Doorstep: one officer outside on the left, resident inside on the right, visibly closed front door, warm interior and cool rainy exterior.

Video was probed for codec/dimensions/duration/streams and inspected as a contact sheet at one-second intervals. Hands and composition remain stable; there are no hard cuts, added text, or new objects. The motion includes subtle camera and flashlight movement. It is not a mathematically seamless loop: use a gentle fade or play-once treatment if the reset is distracting. Reduced-motion users should receive the still. Full browser playback and responsive typography are verified separately during homepage integration.
