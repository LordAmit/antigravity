# Lightroom Preset Generator

A premium, dark-mode web application built with React and TypeScript that visually models, renders, and natively compiles `.xmp` Adobe Lightroom Presets directly in the browser across 100+ metadata parameters.

## Architectural Context & Maintenance

This application functions fundamentally as a bi-directional XMP parsing and compiling engine. Rather than relying on simple UI-to-Code mapping, it strictly complies with Adobe's historical data schema limits. If you are maintaining or expanding this project, please adhere to the following contextual discoveries formulated during development:

### 1. The Color Grading / Split Toning Quirk
Lightroom Classic 10.0 deprecated "Split Toning" and replaced it with modern "Color Grading" wheels in the UI. However, Adobe **did not update the storage schema** for Shadows or Highlights. 
* To manipulate Color Grading Shadows and Highlights, you MUST natively write to `crs:SplitToningShadowHue` and `crs:SplitToningHighlightSaturation`. 
* Injecting `crs:ColorGradeShadowHue` will instantly crash the parser in Lightroom Desktop/Mobile and default back to `0`.
* Conversely, Midtones and Global adjustments are structurally new, so they use the `crs:ColorGrade...` prefix.

### 2. Relative vs Absolute White Balance
The Temperature and Tint sliders operate from `-100` to `+100`. In modern Lightroom, relative offsets to non-RAW files like JPEGs/HEICs must be strictly routed through `crs:IncrementalTemperature` and `crs:IncrementalTint`. If you submit small integer offsets through the rigid `crs:Temperature` tag, Adobe will interpret them as absolute Kelvin values (e.g., forcing a photograph to 15K degrees), crashing the White Balance engine out of bounds and defaulting the slider to `null / As Shot`.

### 3. XML Node Serialization Consistency
Lightroom generates XMP files unpredictably across different mobile devices and desktop clients. It may serialize attributes directly inline (`<rdf:Description crs:GrainAmount="50" />`) or it may heavily drop them as explicit child nodes (`<crs:GrainAmount>50</crs:GrainAmount>`). The XMP extraction protocol in `src/utils/xmpParser.ts` has been engineered with a cascading `DOMParser` fallback to dynamically scan both inline attributes AND nested XML node trees. Always use the internal wrapper when extracting new tag architectures.

### 4. Interactive SVG Point Curves
The Parametric and standard Tone Curves (RGB, Red, Green, Blue) are bound securely to a `0-255` mathematical integer domain. 
* Adding or removing curve points actively re-indexes the array on DOM `.blur()` to prevent mid-editing array-index shifts skipping underneath the UI text inputs.
* The SVG graphics rely natively on a custom Catmull-Rom cubic bezier algorithm wrapped inside `src/components/CurveInput.tsx` to handle fluid cinematic interpolation mapping for drag-and-drop spline coordinates.

### 5. Lightroom Security Failsafes (GrainSeed)
When passing effect modifications through the script generator (like Grain generation or noise masks), explicitly inject randomized mathematical seed arrays natively (like `crs:GrainSeed`) into the final XML compiler layer in `xmpGenerator.ts`. Without a valid mathematical anchor array, modern Lightroom rendering pipelines aggressively bypass generated inputs to `0` to prevent runtime crashes during procedural Perlin noise compilation.

---

## Technical Stack & Scripts
* **TypeScript**
* **React** (Vite Bundler)
* **Custom SVG Interactive Engines**
* **Native DOM XML Parsers**

### Development
\`\`\`bash
# Start local dev server
npm install
npm run dev

# Compile for production
npm run build
\`\`\`
