#!/usr/bin/env bash
# Generates the 6 frames (3 cards x start/end) for the cinematic intro.
#
# COST: 6 stills. Measured debit on this account is ~14 credits each (~84 total).
# Published rate is 28 each (~168), so top up to at least ~170 to be safe.
# Check first:  node <skill>/scripts/kie.mjs probe
#
# Run from this directory. Encodes to webp into new/assets/ at the end.
set -euo pipefail

SKILL="C:/Users/mfran/.claude/plugins/cache/nateherk/nateherk-design/0.2.0/skills/scrollcraft"
ROOT="C:/Users/mfran/Ai-Foundations/Amparo"
export $(grep -v '^#' "$ROOT/scrollcraft/.env" | grep KIE_AI_API_KEY | xargs)
mkdir -p out

# ONE preamble, reused verbatim in all six prompts. This is the single thing
# that makes six separately generated images look like one shoot — do not
# paraphrase it per frame.
P="Smooth matte 3D stickman characters with rounded joints and clean geometric limbs, no facial features beyond simple angled eyebrows, minimalist clinical high-contrast 3D render, soft realistic dimensional shadows on clean matte forms, pure black void background, cinematic lighting, no text, no logos, no watermarks."

gen () { # gen <outfile> <scene>
  echo "=== $1"
  node "$SKILL/scripts/kie.mjs" still "$P

$2" "out/$1.png" --ar 16:9
}

# ---- Card 1: The Initial Encounter --------------------------------------
gen c1-start "An extreme close-up of a smooth, matte white 3D stickman officer wearing a detailed dark blue police uniform, a brown leather utility belt, and a classic brown campaign hat with a gold emblem. He has a stern, intense expression with sharp black angled eyebrows, leaning forward and aiming a realistic handgun asset with his right hand directly at the camera. The background is a dark void lit with intense blue and red police strobe flares, casting sharp dimensional shadows across his matte form to establish immediate high-stakes tension."

gen c1-end "A medium shot from inside a car looking out. The same matte white 3D stickman officer in dark blue uniform and brown campaign hat is now standing aggressively outside the driver's side window, shining a bright, volumetric white flashlight beam directly into the dark vehicle interior."

# ---- Card 2: The Forced Entry -------------------------------------------
gen c2-start "A wide, cinematic cross-section shot showing a single door and wall dividing the outside from the inside in a dark void. On the left (outside), the smooth matte white 3D stickman officer stands quietly on the porch, holding the outer door handle with his right hand. On the right (inside), the matte tan 3D stickman homeowner is leaning in close, peering anxiously through the door's peephole, with a subtle sheen of sweat beads visible on his forehead. Dim, cold blue porch lighting on the left contrasts with the warm, moody hall light on the right to heighten the psychological tension."

gen c2-end "A wide, cinematic cross-section shot of the same house wall and single door layout in a dark void, but now the door is violently buckling and shattering inward. On the left (outside), the smooth matte white 3D stickman officer in his dark blue uniform and campaign hat has his heavy tactical boot fully extended, slamming directly through the splintered center of the door. On the right (inside), the matte tan 3D stickman homeowner stumbles backward in pure shock, losing his balance under harsh, flashing red and blue police strobe lights that burst through the broken doorway and cast dramatic, fast-moving shadows across the warm hallway."

# ---- Card 3: The Consent Trap -------------------------------------------
gen c3-start "A low-angle cinematic shot from inside a dark, minimalist car looking out through the driver's side window. A smooth matte white 3D stickman officer leans down, bracing his left hand on the door frame, while his right hand shines a high-intensity, volumetric flashlight beam directly into the camera to completely wash out the interior with sharp, dusty light rays."

gen c3-end "A profile view inside the car. The matte tan 3D stickman driver sits perfectly still with his hands flat on the steering wheel, mouth firmly closed, while the matte white officer's flashlight beam is angled down toward the center console, casting long, dramatic shadows."

# ---- Encode ---------------------------------------------------------------
FF=$(ls -d "$HOME"/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_*/ffmpeg-*-full_build/bin/ffmpeg.exe 2>/dev/null | head -1 | sed 's/\*$//')
for f in c1-start c1-end c2-start c2-end c3-start c3-end; do
  "$FF" -y -i "out/$f.png" -vf "scale=1400:-2" -c:v libwebp -quality 82 "$ROOT/new/assets/$f.webp"
done

echo
echo "Done. 6 frames in $ROOT/new/assets/"
echo "Now set USE_STICKMAN_FRAMES = true in new/index.html (search for it)."
