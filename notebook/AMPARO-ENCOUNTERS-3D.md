# Amparo clay encounters — Higgsfield provenance

Created 2026-09-13 with Higgsfield 3D Jutsu (Blender 5.2), from visual inspection of the six historical clay references `new/assets/c1-start.webp`, `c1-end.webp`, `c2-start.webp`, `c2-end.webp`, `c3-start.webp`, and `c3-end.webp`. This is original editable geometry, not image planes or an AI-generated video.

Project: https://higgsfield.ai/3d-jutsu/db59c382-6868-4e36-a056-a59b96b0b366

Final committed revision: **3**, scene sequence **0**. Final mutation operation: `amparo-civilian-car-correction-005`. The final correction removes the traffic car's police lightbar so it reads as the civilian driver's vehicle.

## Deliverables

- `new/assets/amparo-encounters.glb`: portable PBR GLB, 1,706,204 bytes, 195 meshes, no textures or external asset dependencies.
- `new/assets/amparo-encounters-poster.webp`: transparent traffic-scene fallback, 900 × 680, rendered in Eevee and converted with Pillow in the Higgsfield sandbox (quality 90).
- `new/assets/amparo-encounters-poster.png`: corresponding original render.

## Frontend contract

The GLB uses glTF Y-up. Open faces look toward +Z; a slight +X camera angle reveals scene depth. Each group is self-contained and can be independently centered, hidden, or transformed.

| Group | Original X center | Approximate local dimensions (X, Y, Z) |
| --- | ---: | --- |
| `scene_traffic` | -8 | 5.9, 2.53, 4.25 |
| `scene_door` | 0 | 5.9, 3.15, 4.25 |
| `scene_search` | 8 | 5.9, 2.53, 4.25 |

All bases span local X ±2.95, Z ±2.125, with Y minimum -0.10. Compute exact Box3 bounds at runtime. The exported animation clip is named `flashlight_pivot` (Blender action name `Quiet flashlight movement`), with frames 1–144 at 24fps. The flashlight rotates slightly about its pivot; frames 1 and 144 are identical, with peaks at frames 49 and 97. No flashing lights. Named `closed_door_leaf` remains available for deliberate future interaction but has no baked opening animation.

The scene includes optional punctual light nodes outside these groups using standard `KHR_lights_punctual`; the homepage may supply its own lighting after extracting groups. Studio area lights affect the Blender render but do not export to GLB.

## Rebuild

The following Python sources live beside this document and execute in sequence through Higgsfield `scene_builder_3d_run_python` with `bpy` and the `artifacts` registry supplied by its worker:

1. `amparo-encounters-build.py`: geometry, materials, triptych camera, lighting.
2. `amparo-encounters-polish.py`: flashlight pivot animation, portable lights, close-up poster.
3. `amparo-encounters-civilian-car.py`: final semantic correction and isolated poster.

Create a fresh project for a rebuild, then call `get_project` and `query_python` to obtain exact revision/scene guards before each mutation; do not reuse the historical revision numbers on a new project. Poll active operations until terminal. Download the final committed export through `get_glb`. For final poster PNG use the artifact returned by the third mutation. Convert its RGBA image to WebP with Pillow `save(..., quality=90, method=6)` in the Higgsfield sandbox. No credentials or signed URLs are embedded in these sources.

## Verification

Inspected all six source references; inspected an Eevee render of all three complete miniatures; inspected the final isolated traffic WebP with the incorrect roof lights removed. GLB binary JSON was checked for named scene roots, animation, and absence of image dependencies. Flashlight rest/peak/final poses were read from Blender, and the loop seam was exactly equal. Browser/WebGL integration is verified separately by the homepage implementation task.

The interpretation intentionally uses faceless matte clay figures, a civilian car, visible driver hands, a house threshold with paper prop, and a downward flashlight. It contains no written legal claims or threatening weapon pose.
