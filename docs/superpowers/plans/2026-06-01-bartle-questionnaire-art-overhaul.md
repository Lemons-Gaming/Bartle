# Bartle Questionnaire Art + Content Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Hebrew Bartle player-type questionnaire with high-quality true pixel-art portraits (hybrid AI-reference → Aseprite pipeline), 12 rewritten youth-friendly questions, and a rich result summary — delivered as both a `.tsx` component and a standalone runnable `index.html`.

**Architecture:** Pixel art is produced offline (Gemini reference → Aseprite rebuild → 64×64/32×32 PNGs), embedded as base64 in a single art-constants module so the app has zero runtime network dependency. The React component keeps its existing state machine (intro → playing → loading → result) but swaps SVG matrices + live Gemini calls for embedded `<img>` art, gains 12 rewritten questions, and a redesigned result screen (primary+secondary type, percentage bars, strengths, tip).

**Tech Stack:** Aseprite 1.3.17.2 CLI (`C:\Program Files (x86)\Steam\steamapps\common\Aseprite\Aseprite.exe`) + Lua, Gemini CLI (nano-banana), React + Tailwind (CDN for the HTML build), node v24, Playwright for browser verification.

**Verification model (no test runner / no git here):** Each art task is verified by rendering the PNG and viewing it (Read tool on the image). The component is verified by opening `index.html` in Playwright, walking a full questionnaire, and screenshotting intro/question/result. Commit steps are omitted.

---

## File Structure

- `assets/ref/` — AI reference PNGs (intermediate, not shipped): `ref-achiever.png`, `ref-explorer.png`, `ref-socializer.png`, `ref-killer.png`.
- `assets/portraits/` — final true-pixel-art PNGs: `achiever.png`, `explorer.png`, `socializer.png`, `killer.png` (64×64) and `icon-achiever.png` … (32×32).
- `aseprite/` — Lua scripts used to build/clean/export sprites: `build_portrait.lua`, `export.lua`.
- `art-data.js` — generated module exporting base64 data-URIs: `portraits` (A/E/S/K) and `icons` (A/E/S/K). Source of truth for embedding.
- `מודל ברטל - שאלון שחקן.tsx` — upgraded React component (modified).
- `index.html` — standalone build (React + Tailwind via CDN, art base64 inlined).
- `questions-data.js` — the 12 rewritten questions + result content (single source; copied into both tsx and html).

---

### Task 1: Generate AI reference images for the 4 portraits

**Files:**
- Create: `assets/ref/ref-achiever.png`, `assets/ref/ref-explorer.png`, `assets/ref/ref-socializer.png`, `assets/ref/ref-killer.png`

- [ ] **Step 1: Use the nano-banana skill to generate 4 references**

Invoke the `nano-banana` skill. Generate one image per archetype into `assets/ref/`. Use these prompts (English; pixel-art bust portraits, neutral dark background, consistent framing so the four match as a set):

- achiever: `16-bit pixel art character bust portrait of a noble fantasy RPG king, golden crown, ornate royal armor, warm gold and royal purple palette, confident proud expression, head and shoulders centered, plain dark parchment background, clean limited palette, SNES JRPG portrait style`
- explorer: `16-bit pixel art character bust portrait of a fantasy RPG ranger explorer, dark green hood and cloak, holding a glowing parchment map, curious adventurous expression, head and shoulders centered, plain dark parchment background, clean limited palette, SNES JRPG portrait style`
- socializer: `16-bit pixel art character bust portrait of a cheerful fantasy RPG bard, holding a wooden lute, warm friendly smile, colorful festive clothes, head and shoulders centered, plain dark parchment background, clean limited palette, SNES JRPG portrait style`
- killer: `16-bit pixel art character bust portrait of a dangerous fantasy RPG assassin, dark hood shadowing the face, glowing red eyes, twin daggers crossed, menacing expression, dark crimson and charcoal palette, head and shoulders centered, plain dark background, clean limited palette, SNES JRPG portrait style`

- [ ] **Step 2: View each reference and confirm composition**

Read each PNG. Confirm: single centered bust, recognizable archetype, no text artifacts, background is plain/dark. If a reference is off (wrong composition, watermark, multiple figures), regenerate that one with a tweaked prompt before proceeding.

---

### Task 2: Rebuild references into true pixel-art portraits (64×64) in Aseprite

**Files:**
- Create: `aseprite/build_portrait.lua`, `aseprite/export.lua`
- Create: `assets/portraits/achiever.png`, `explorer.png`, `socializer.png`, `killer.png`

- [ ] **Step 1: Invoke pixel-art skills**

Invoke `aseprite-art` and `pixel-art-professional` skills for the exact CLI/Lua patterns (palette quantization, grid snapping, color ramps, hue-shifting, selective AA).

- [ ] **Step 2: Write a Lua script that imports a reference, downscales to 64×64, and quantizes the palette**

Create `aseprite/build_portrait.lua` that takes `--script-param src=... dst=...`, opens the reference sprite, resizes to 64×64 (nearest-neighbor), reduces to an indexed palette of ≤24 colors, and saves the result. Reference pattern (adjust to skill guidance):

```lua
local src = app.params["src"]
local dst = app.params["dst"]
local spr = app.open(src)
spr:resize(64, 64)                       -- nearest-neighbor downscale to pixel grid
app.command.ChangePixelFormat{ format="indexed", dithering="none", colors=24 }
spr:saveCopyAs(dst)
spr:close()
```

- [ ] **Step 3: Run the script for all 4 portraits**

Run (PowerShell), once per type:
```powershell
$ase = "C:\Program Files (x86)\Steam\steamapps\common\Aseprite\Aseprite.exe"
& $ase -b --script-param src="assets/ref/ref-achiever.png" --script-param dst="assets/portraits/achiever.png" --script "aseprite/build_portrait.lua"
```
Expected: `assets/portraits/achiever.png` created, 64×64, indexed.

- [ ] **Step 4: View each portrait at scale and assess quality**

Read each `assets/portraits/*.png`. Assess: clean pixel grid, no muddy AA blobs, readable silhouette at small size, archetype recognizable. Note specific defects per portrait (e.g. "eyes lost in downscale", "crown reads as a blob").

- [ ] **Step 5: Hand-clean defects with a touch-up Lua script (or per-pixel edits)**

For each portrait with defects, write targeted pixel edits (set/replace specific pixels via `image:drawPixel` / `app.command`) to: sharpen eyes, define the crown/hood/lute/daggers, add a 2-3 tone shading ramp on the face and clothing, hue-shift shadows (cooler) and highlights (warmer). Re-export and re-view. Iterate until each reads as professional 16-bit portrait art.

- [ ] **Step 6: Checkpoint — present all 4 portraits to the user for approval**

Show the 4 final PNGs. Get explicit approval that the quality bar ("רמה גבוהה") is met before integration. If rejected, return to Step 5.

---

### Task 3: Generate the 4 opening icons (32×32)

**Files:**
- Create: `assets/portraits/icon-achiever.png`, `icon-explorer.png`, `icon-socializer.png`, `icon-killer.png`

- [ ] **Step 1: Write a Lua downscale-from-approved-portrait script**

Create logic (reuse `build_portrait.lua` with a 32×32 target, or a dedicated `icon` param) that downsamples each approved 64×64 portrait to a crisp 32×32 emblem/face. Cropping to the head may read better than a full downscale — crop to the upper portrait region first, then resize.

- [ ] **Step 2: Run for all 4 and view**

Run the script per type; Read each icon. Confirm each is recognizable at 32×32 and visually consistent with its portrait. Touch up if a feature is lost.

---

### Task 4: Generate the embedded art-data module

**Files:**
- Create: `art-data.js`

- [ ] **Step 1: Write a node script to base64-encode all 8 PNGs into a JS module**

Run a node one-liner that reads the 8 PNGs and writes `art-data.js` exporting two objects keyed by `A`/`E`/`S`/`K`:
```js
// art-data.js (generated)
export const portraits = { A: "data:image/png;base64,...", E: "...", S: "...", K: "..." };
export const icons     = { A: "data:image/png;base64,...", E: "...", S: "...", K: "..." };
```
Map: A=achiever, E=explorer, S=socializer, K=killer.

- [ ] **Step 2: Verify the data-URIs are valid**

Confirm each string starts with `data:image/png;base64,` and is non-empty. Sanity-check total file size is reasonable (< ~150KB for 8 small sprites).

---

### Task 5: Rewrite the 12 questions + result content (youth/educational tone)

**Files:**
- Create: `questions-data.js`

- [ ] **Step 1: Write 12 scenario questions, each with 4 balanced A/E/S/K options**

Create `questions-data.js` exporting `questions` (array of 12) and `resultData` (A/E/S/K). Requirements:
- Hebrew, RTL, accessible youth tone; gaming terms explained, not assumed.
- Each question is a concrete scenario; the 4 options map to A (achiever/הישגיות), E (explorer/חקרנות), S (socializer/חברתיות), K (killer/תחרותיות) and are NOT transparently labeled — phrasing should feel natural for a teen.
- Keep an `icon` emoji per question (decorative).
- Balance: each type appears as exactly one option in every question.

Example shape (write all 12 fully — no placeholders):
```js
export const questions = [
  {
    icon: "🎮",
    text: "בקבוצה חדשה במשחק, מה הכי בא לך לעשות?",
    options: [
      { text: "לארגן את כולם ולוודא שנשיג את המטרה הכי מהר שאפשר.", type: "A" },
      { text: "לבדוק כל פינה במפה — אולי מסתתר שם משהו מעניין.", type: "E" },
      { text: "להכיר את כולם, לצחוק ולהרגיש חלק מהחבורה.", type: "S" },
      { text: "לראות מי הכי חזק, וכמובן לנצח אותו.", type: "K" },
    ],
  },
  // ... 11 more, each fully written
];
```

- [ ] **Step 2: Write rich resultData for each type**

For each of A/E/S/K provide: `title`, `subtitle` (one-line flavor), `art` key, `textColor`, `description` (2-3 sentences, youth tone), `strengths` (array of 3 short bullet strings), `tip` (one practical sentence). Example:
```js
export const resultData = {
  A: {
    title: "הכובש",
    subtitle: "מי שתמיד מכוון לפסגה",
    art: "A",
    textColor: "text-[#8b2500]",
    description: "אתה אוהב לראות התקדמות ברורה...",
    strengths: ["מתמיד ולא מוותר", "ממוקד מטרה", "אוהב אתגרים"],
    tip: "נסה לפעמים ליהנות מהדרך ולא רק מהיעד.",
  },
  // E, S, K ...
};
```

- [ ] **Step 3: Verify balance**

Confirm every question has exactly one option per type (count types across all 12 → each type = 12). Confirm no two options in the same question share a type.

---

### Task 6: Add result-scoring helpers (primary + secondary + percentages)

**Files:**
- Create: `result-logic.js`

- [ ] **Step 1: Write pure helper functions**

Create `result-logic.js` exporting:
```js
// scores: {A,E,S,K}
export function getRanked(scores) {
  // returns array of {type, score, pct} sorted desc; pct = round(score/total*100)
}
export function getPrimarySecondary(scores) {
  // returns {primary, secondary} types from top-2 of getRanked
}
export function comboLabel(primary, secondary, resultData) {
  // e.g. "כובש עם נטיית חוקר"; if pct gap small enough show secondary, else just primary
}
```
Write the full implementations (no placeholders). Total may be 0-guarded (if all zero, default order A,E,S,K).

- [ ] **Step 2: Verify with sample inputs**

Run a node check: `getRanked({A:5,E:4,S:2,K:1})` → A 42%, E 33%, S 17%, K 8% (rounding ok); `getPrimarySecondary` → `{primary:'A', secondary:'E'}`. Print and eyeball.

---

### Task 7: Upgrade the React component (`.tsx`)

**Files:**
- Modify: `מודל ברטל - שאלון שחקן.tsx`

- [ ] **Step 1: Replace data + art imports/inline**

Remove `pixelArts` SVG matrices, the `generateCharacterImage` function, the `delay` helper, and the inline `questions`/`resultData`. Inline (or import) the new `questions`, `resultData` (from questions-data), `portraits`/`icons` base64 (from art-data), and the `result-logic` helpers. Since this `.tsx` is used as a single artifact, paste the data objects directly into the file rather than relying on bundler imports.

- [ ] **Step 2: Replace `PixelGraphic` with a `PixelImg` component**

```jsx
const PixelImg = ({ src, className }) => (
  <img src={src} alt="" className={className}
       style={{ imageRendering: 'pixelated' }} draggable={false} />
);
```

- [ ] **Step 3: Update intro to show the 4 icons**

Render `icons.A/E/S/K` via `PixelImg` in the intro row (replacing the 4 `PixelGraphic` calls).

- [ ] **Step 4: Update `calculateResult` to drop the API call**

Keep the short cosmetic loading state (~1500ms via `setTimeout`), then set result. Compute primary/secondary via `result-logic`. No `fetch`.

- [ ] **Step 5: Rebuild the result screen**

Show: `portraits[primary]` in the framed box; title + subtitle; combo label (primary+secondary); 4 horizontal percentage bars (one per type, width = pct%, labeled with type name + pct); strengths list; tip box; restart button. Use existing parchment/RPG CSS classes; add a `.rpg-bar` style for the percentage bars.

- [ ] **Step 6: Verify it parses**

Run: `node --check` is not valid for JSX; instead rely on Task 8's browser render. Visually scan the file for unbalanced JSX/braces.

---

### Task 8: Produce the standalone `index.html` and verify in browser

**Files:**
- Create: `index.html`

- [ ] **Step 1: Build a self-contained HTML**

Create `index.html` with: `<script src>` React 18 + ReactDOM + Babel standalone (CDN), Tailwind CDN, the Google Fonts import, the parchment/RPG CSS, and a `<script type="text/babel">` containing the same component logic + inlined data + base64 art. `dir="rtl"` on `<html>`.

- [ ] **Step 2: Open in Playwright and screenshot the intro**

Use the playwright MCP: `browser_navigate` to `file:///C:/Users/shlom/projects/מודל ברטל - שאלון שחקן/index.html`, then `browser_take_screenshot`. Expected: intro screen with 4 pixel icons, title, start button — no console errors (`browser_console_messages`).

- [ ] **Step 3: Walk a full questionnaire**

Click "התחל", answer all 12 questions (`browser_click` an option each time), and screenshot the result screen. Expected: portrait renders crisply, percentage bars sum visually to ~100%, primary/secondary label correct, strengths + tip show.

- [ ] **Step 4: Check RTL + mobile**

`browser_resize` to 390×844; screenshot intro + a question + result. Confirm layout holds, text is RTL, portrait/bars not clipped.

- [ ] **Step 5: Fix any defects and re-verify**

For each console error or layout/visual defect, fix in both `index.html` and the `.tsx` (keep them in sync), then re-run Steps 2-4.

- [ ] **Step 6: Final checkpoint — present screenshots to the user**

Show intro + result screenshots. Confirm the overall result meets the bar before declaring done.

---

## Self-Review

- **Spec coverage:** hybrid art pipeline (Tasks 1-2), icons (Task 3), embedding/offline (Task 4), 12 questions + youth tone (Task 5), rich summary with primary+secondary/percent/strengths/tip (Tasks 6-7), tsx + index.html deliverables (Tasks 7-8), assets folder (Tasks 2-3), browser/RTL/mobile verification (Task 8). All spec sections mapped.
- **Placeholder scan:** Task 5 explicitly requires all 12 questions written in full; example blocks are marked as shape, with instruction "no placeholders". No TBDs remain.
- **Type consistency:** art keyed A/E/S/K throughout (`portraits`/`icons`); `resultData` keyed A/E/S/K with `art` field referencing the same keys; helpers (`getRanked`/`getPrimarySecondary`/`comboLabel`) used consistently in Task 7.
