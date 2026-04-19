# Architecture & Design Decisions: Photo Border & EXIF App

This document outlines the core technical decisions, trade-offs, and design philosophies applied during the development of this application. It aims to mitigate comprehension debt for future maintainers.

## 1. Canvas-First Rendering Pipeline (`render.ts`)

**Decision:** The application relies entirely on HTML5 `<canvas>` rendering (`CanvasRenderingContext2D`) instead of DOM-based overlay styling (like CSS absolute positioning) to generate the final borders and EXIF data.
**Trade-offs:** 
- *Pros:* Guarantees pixel-perfect exports. What you see is exactly what get exported. It inherently supports high-resolution outputs (since canvas dimensions mirror the physical image resolution before padding). Eliminates browser-specific CSS rendering quirks.
- *Cons:* Requires complex manual math for all positional logic (`ctx.fillText`, `ctx.roundRect`). Makes text/logo wrapping and alignment rigid, meaning we had to build custom bounding box algorithms (`measureText` passes) to position EXIF pills and brand templates dynamically.

## 2. Inward Canvas Padding Algorithm

**Decision:** Instead of calculating the final canvas size by *adding* a dynamic padding scale to the original image dimensions, the engine allocates the frame based purely on the target aspect ratio, scale bounds, and then works strictly *inward*. The frame edge is absolute, and the target image shrinks internally.
**Trade-offs:** 
- *Why:* Earlier versions attempted to add global border padding outward from the original canvas. This distorted the integrity of fixed output aspect ratios (e.g., trying to force a 4:5 frame but adding uneven 10% padding resulted in an unpredictable canvas shape). 
- *Benefit:* By dictating the canvas size strictly off the chosen ratio (e.g., `4:3`) bound to the longest image side, the padding scales independently subtract from that boundary to shape the core image area. This inherently solves Aspect Ratio skewing entirely.

## 3. UI Component Standardization (`SliderRow`)

**Decision:** Form inputs and slider settings were refactored from massive repetitive JSX blocks into standard abstracted React Components (`SliderRow` in `SidebarControls.tsx`).
**Trade-offs:** 
- *Pros:* Allowed easy mass-injection of features. For instance, the cross-browser "Reset" icon was appended to 20+ sliders by modifying a single file. Reduces footprint dramatically.
- *Cons:* Slightly localizes control typing in `store.tsx` updates. Requires passing `onChange` and `onReset` closures inline for every parameter instead of grouping them locally.

## 4. Sub-Clipping Layers (Inner Borders & Curves)

**Decision:** Inner Image padding, rounded frame corners, and inner picture corners are built using multi-pass `ctx.clip()` and `ctx.shadowColor` paths rather than generic image manipulations. 
**Trade-offs:**
- *Pros:* By defining a mathematical Path, filling it with white to cast a raw HTML5 shadow, and *then* applying a clip mask before drawing the image, we were able to implement custom settings like "Inner Image Shadow" and "Image Radius" independent of the outer background rendering.
- *Cons:* HTML5 Canvas clipping can be slightly anti-aliased unexpectedly in sub-pixel edge cases, but for high-resolution photo exports (10+ megapixels), the clipping edge is seamlessly sharp.

## 5. UI Batch Processing Workflow vs Preview

**Decision:** The primary view is a *Live Render Pipeline*, executing on `state.activeImageId`. We render the current target on every single keystroke/slider change for real-time `CanvasPreview`. Batch export repeats this exact rendering pipeline iteratively via hidden offscreen canvases.
**Trade-offs:**
- *Pros:* Massive speed boost and stability. Users can process 50 photos, set the aesthetics on one photo preview, and initiate an asynchronous `Batch Export Zip`. 
- *Cons:* A fast live-render pipeline on an 80MB RAW-to-JPEG payload might drop some internal DOM framing rates if slider interaction is rapid, but offscreen memory is aggressively cleaned. 

## 6. Overridable EXIF Parsing (`exifr`)

**Decision:** EXIF headers are inherently unchangeable to a visual parser. To offer users flexibility, the store supports `customCameraText` and `customLensText` intercept variables. 
**Trade-offs:** 
- If a user uses the batch processor and overrides the "Lens", ALL 50 photos in that batch zip will inherit that literal override string. This is accepted behavior to allow unified brand aesthetics across mismatched lens shoots.
