# Spec Kit SDD Tasks Template

This file outlines the pattern for managing subsequent features, changes, and bug fixes using Spec-Driven Development.

## Task Creation Workflow

When a new feature or bug fix is requested:
1.  **Specify:** Describe the change in `.specify/specify.md` using the strict EARS patterns.
2.  **Plan:** Update `.specify/plan.md` to map the code changes needed.
3.  **Task list:** Create an entry in this `tasks.md` file using the template format below.
4.  **Implement:** Edit the codebase files to match the updated specifications.
5.  **Verify:** Run tests and check execution against the specification before closing the task.

---

## SDD Task Template Example

### [Task ID] - [Brief Feature Name]

*   **Requirements Changed:** (Link to specific lines in `.specify/specify.md`)
*   **Architecture Changed:** (Link to specific lines in `.specify/plan.md`)
*   **Action Items:**
    *   `[ ]` Action 1
    *   `[ ]` Action 2
*   **Verification Checklist:**
    *   `[ ]` Test cases updated
    *   `[ ]` Render pipeline verified on device viewport

---

### Task-05 - Shortcuts, Scrollbars, and Resets

*   **Requirements Changed:** [specify.md:17-19](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/specify.md#L17-L19)
*   **Architecture Changed:** [plan.md:31-36](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/plan.md#L31-L36)
*   **Action Items:**
    *   `[x]` Add a reset button (`#btn-reset-design`) inside customization settings in `index.html`.
    *   `[x]` Implement scrollbars styling and `.btn-secondary` in `style.css`.
    *   `[x]` Implement resetDesignSettings() handler in `app.js`.
    *   `[x]` Implement editor keyboard shortcut listeners (Ctrl/Cmd + B, I, U) in `app.js`.
*   **Verification Checklist:**
    *   `[x]` Verify shortcuts wrap selections correctly.
    *   `[x]` Verify scrollbars are visible when settings are expanded.
    *   `[x]` Verify reset button restores colors, fonts, and sizes to original defaults.

---

### Task-06 - Export Texture Fix

*   **Requirements Changed:** [specify.md:22-23](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/specify.md#L22-L23)
*   **Architecture Changed:** [plan.md:33](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/plan.md#L33)
*   **Action Items:**
    *   `[x]` Remove the unused SVG paper filter in `index.html`.
    *   `[x]` Replace `filter: url(#cotton-paper-filter)` with `var(--paper-noise-url)` in `style.css`.
    *   `[x]` Implement `generateNoiseTexture()` and inject `--paper-noise-url` in `app.js`.
*   **Verification Checklist:**
    *   `[x]` Verify noise texture appears in browser preview.
    *   `[x]` Verify noise texture and gradients render on exported image.

---

### Task-07 - Premium Paper Fibers and Clouds

*   **Requirements Changed:** [specify.md:23](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/specify.md#L23)
*   **Architecture Changed:** [plan.md:33](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/plan.md#L33)
*   **Action Items:**
    *   `[x]` Upgrade `generateNoiseTexture()` in `app.js` to draw radial thickness blotches, organic vector curved fibers, and fine grain.
*   **Verification Checklist:**
    *   `[x]` Verify fiber details and thickness blotches appear in browser preview.
    *   `[x]` Verify fiber details and gradients render on exported image.

---

### Task-08 - Seamless Full Resolution Texture

*   **Requirements Changed:** [specify.md:23](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/specify.md#L23)
*   **Architecture Changed:** [plan.md:33](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/plan.md#L33)
*   **Action Items:**
    *   `[x]` Set background-repeat: no-repeat and background-size: cover for paper background classes in `style.css`.
    *   `[x]` Adjust generateNoiseTexture() in `app.js` to render at full 1536x2048px canvas resolution.
*   **Verification Checklist:**
    *   `[x]` Verify preview has zero repeating tile seams.
    *   `[x]` Verify exported download maintains texture at full resolution without seams.

---

### Task-09 - Texture Density and Scale Calibration

*   **Requirements Changed:** [specify.md:23](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/specify.md#L23)
*   **Architecture Changed:** [plan.md:33](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/plan.md#L33)
*   **Action Items:**
    *   `[x]` Change `generateNoiseTexture()` default resolution to `768x1024px` in `app.js`.
    *   `[x]` Modify fiber density, stroke widths, and grain contrast in `generateNoiseTexture()` to make them highly visible.
*   **Verification Checklist:**
    *   `[x]` Verify paper pulp fibers and grain noise are clearly visible in the browser preview.
    *   `[x]` Verify exported PNG exhibits sharp, high-contrast, high-fidelity paper textures.

---

### Task-10 - Full-Resolution Texture & Subtle Gradients

*   **Requirements Changed:** [specify.md:23](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/specify.md#L23)
*   **Architecture Changed:** [plan.md:33](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/plan.md#L33)
*   **Action Items:**
    *   `[x]` Change background-image variables in `style.css` to use theme-specific variables (`--paper-noise-light` and `--paper-noise-dark`).
    *   `[x]` Generate `--paper-noise-light` and `--paper-noise-dark` at `1536x2048px` resolution in `app.js`.
    *   `[x]` Adjust `generateNoiseTexture()` to draw large-radius (`300` - `600` px) low-opacity clouds, and disable white clouds in dark mode.
*   **Verification Checklist:**
    *   `[x]` Verify preview and downloads contain no prominent white/bright globs.
    *   `[x]` Verify dark clean slate is free of white globs and looks premium.
    *   `[x]` Verify exported PNG is sharp, with natural texture details.

---

### Task-11 - Native Canvas Background Texture

*   **Requirements Changed:** [specify.md:23](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/specify.md#L23)
*   **Architecture Changed:** [plan.md:33](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/plan.md#L33)
*   **Action Items:**
    *   `[x]` Add `<canvas id="bg-texture-canvas"></canvas>` inside `#export-canvas` in `index.html`.
    *   `[x]` Style `#bg-texture-canvas` with absolute positioning, `z-index: -1`, and `pointer-events: none` in `style.css`.
    *   `[x]` Refactor texture generation logic in `app.js` to draw colors, gradients, fibers, and grain directly on the background canvas.
*   **Verification Checklist:**
    *   `[x]` Verify texture elements are highly visible in all themes in browser preview.
    *   `[x]` Verify switching themes redraws background canvas with corresponding colors.
    *   `[x]` Verify exported PNG is generated successfully and preserves texture details.

---

### Task-12 - Static Image Background Textures

*   Requirements Changed: [specify.md:23](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/specify.md#L23)
*   Architecture Changed: [plan.md:32](file:///Users/amitsealami/git/antigravity/quotemaker/.specify/plan.md#L32)
*   Action Items:
    *   `[ ]` Delete `generator.html`.
    *   `[ ]` Remove `<canvas id="bg-texture-canvas"></canvas>` in `index.html`.
    *   `[ ]` Style background images, size, repeat, and position attributes in `style.css` using the images under `images/`.
    *   `[ ]` Remove `drawBackgroundTexture()` function and simplify `updateBackgroundTexture()` in `app.js`.
*   Verification Checklist:
    *   `[ ]` Verify background images load and scale properly in browser preview.
    *   `[ ]` Verify exported PNG contains high-fidelity textures.
