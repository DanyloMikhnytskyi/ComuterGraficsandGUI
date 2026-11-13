You are a Computer Graphics teaching assistant and technical writer. Create an academic presentation **in Polish** for Stages 2–5 of our university project "Symulator Drona 3D" (course: "Grafika komputerowa i komunikacja człowiek-komputer"). The project is an Expo (TypeScript) + pure Three.js + Zustand drone simulator.

**RULES**
- The presentation text is in **Polish**. Source code, identifiers and code snippets stay in English.
- **Everything you claim must come from the actual code.** Do not describe features, formulas or constants from memory or from this prompt. If something named below does not exist in the diff, leave it out and tell me in the final summary instead of inventing it.
- Do not modify any source code. You only create presentation files.

---

## Step 1 — Gather facts from git (do this before writing anything)

1. Run `git status` and `git log --oneline`. Stage 1 is the commit `ec26f09` ("small coderefactor"). Stages 2–5 are everything after it. If the Stage 2–5 work is not committed yet, diff the working tree against `ec26f09` instead and say so.
2. Run `git diff --stat ec26f09` and `git diff ec26f09` (or `git diff ec26f09 -- <file>` for large files). Read the **final versions** of the new files in full, in particular: `src/core/*` (constants, physics, droneModel, environment, cameraRig), `src/store/useDroneStore.ts`, `src/components/VirtualJoystick.tsx`, `src/components/HUD.tsx`, `src/components/Scene.tsx`, `src/components/Scene.web.tsx`, `App.tsx`, `app.json`, `package.json`.
3. Use `git log --format='%an %s' ec26f09..HEAD` and the author names in the file header comments to attribute files to students. Stage 1 split, for reference: **Danylo Mikhnytskyi (284125)** — Three.js engine, physics, model, environment; **Maksym Mahaz (284115)** — store, HUD, camera. If the headers/commits disagree with this, trust the files and report the discrepancy.
4. Write down for yourself (and list at the end): every physics constant with its real value (gravity, max thrust, max tilt, yaw rate, drag, speed cap, climb cap, ceiling, ground level), the real scene-graph hierarchy as built in `droneModel.ts`, the real number and positions of gates and obstacles, the joystick mapping, and the camera offsets/lerp factors.

## Step 2 — Output

Create `presentation_etap2_5.html`: a single self-contained HTML file in the **same visual style and mechanism as the existing `presentation.html`** (read it first and reuse its CSS variables, slide navigation, and KaTeX loading — do not switch to Reveal.js). Dark theme, 16:9, keyboard/click navigation, printable to PDF. Math is typeset with KaTeX.

Also generate a PDF (`presentation_etap2_5.pdf`) if a headless-browser route is available without installing new project dependencies; otherwise skip and say so.

## Step 3 — Slide content (about 14–16 slides)

1. **Slajd tytułowy:** "Symulator Drona 3D — Etap 2–5: Sterowanie 6-DOF, Model 3D, Kamery TPS/FPV oraz Środowisko". Authors: Danylo Mikhnytskyi (284125) & Maksym Mahaz (284115). Stack line from the real `package.json`.
2. **Co się zmieniło względem Etapu 1:** a before/after summary taken from the diff (e.g. single-axis cube → 6-DOF drone; two duplicated scene files → shared `src/core/`; removal of unused R3F files; button panel → dual joysticks; orientation change if applicable). Include real diff stats (files changed, lines added/removed).
3. **Architektura:** diagram of the final structure: store → core (physics, model, environment, cameraRig) → thin `Scene.tsx` (expo-gl) / `Scene.web.tsx`, and HUD/joysticks → store. Draw it as inline SVG or CSS boxes, based on the real imports.
4. **Podział pracy (50/50):** a table of responsibilities per student, built from the actual files each one wrote (see attribution rule above). Be honest about any file that was shared.
5. **Część 1 — Danylo Mikhnytskyi (284125): Fizyka 6-DOF** (2–3 slides). Typeset the model that `physics.ts` actually implements: vertical acceleration, tilt interpolation of pitch/roll toward the stick input, yaw integration, projection of horizontal thrust onto forward/right vectors derived from yaw, air drag and speed cap, ground constraint. Use the real constants. Add a small table "stała → wartość → znaczenie".
6. **Część 1 — Model 3D** (1–2 slides): the scene-graph tree exactly as built (Body → Arms → Motors → Rotors, LEDs, camera lens), with a short note on spinning rotors (formula from the code) and why procedural geometry was chosen.
7. **Część 1 — Środowisko** (1 slide): sky/fog/lighting, ground texture, landing pad, gates and obstacles with their real count; state which features are web-only (e.g. shadows) versus native.
8. **Część 2 — Maksym Mahaz (284115): Wirtualne joysticki 2D i HUD** (2 slides): the pointer/touch vector computation from the code (offset from the stick base center, clamping to the radius, normalization to Δx, Δy ∈ [−1, 1], deadzone, spring back), the Mode 2 mapping of both sticks, the Hover Lock behavior, multi-touch handling, and how state reaches the physics loop through Zustand (`getState()` in the loop, throttled telemetry to the HUD). Show the HUD layout and the utility buttons.
9. **Część 2 — System kamer** (2 slides): TPS (offset rotated by yaw, frame-rate-independent lerp, lookAt) versus FPV (camera attached to the drone nose with the Euler order the code uses, and why that order). Typeset the formulas using the real offsets and smoothing factors. Add a compact TPS vs FPV comparison table.
10. **Zrzuty ekranu** (3 placeholder slides, each a framed empty box with the label "Miejsce na zrzut ekranu" and a Polish caption):
    - Zrzut 1: Widok TPS — dron na lądowisku z nowym interfejsem dwóch joysticków.
    - Zrzut 2: Lot z przechyleniem (Pitch/Roll) przez bramki kontrolne i animacja śmigieł.
    - Zrzut 3: Tryb FPV (widok z kamery drona) podczas przelotu przez tor przeszkód.
    The `<img>` tags must point to `screenshots/zrzut4_tps.png`, `screenshots/zrzut5_lot.png`, `screenshots/zrzut6_fpv.png` and fall back to the placeholder box if the file is missing (so dropping the PNGs into `screenshots/` later fills them in without editing the HTML). Do not overwrite the Stage 1 screenshots.
11. **Wyzwania i rozwiązania:** 3–5 real problems visible in the diff/history (e.g. keeping native and web renderers in sync, the expo-gl limitations, per-frame store updates versus HUD re-renders, Euler order for FPV).
12. **Ograniczenia i dalszy rozwój:** known limitations present in the code (e.g. no obstacle collision, if true) and ideas for the next stages.
13. **Podsumowanie** and a closing slide.

Keep slides readable: at most ~6 bullets or one formula block plus one table per slide; no walls of text. Polish technical terms: przechylenie (roll), pochylenie (pitch), odchylenie (yaw), ciąg (thrust), opór powietrza (drag), graf sceny (scene graph).

## Step 4 — Verify and report

- Open `presentation_etap2_5.html` in the browser and check that navigation works, KaTeX renders every formula, and no slide overflows at 1920×1080 and in print preview.
- Cross-check every number on the slides against the code once more.
- Final message (in English): list the files created, the constants/features you took from the code, anything from this prompt that was **not** found in the code and therefore omitted, any author-attribution discrepancy, and whether the PDF was generated.
