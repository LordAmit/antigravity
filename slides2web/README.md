# slides2web — annotated slides for the web

Converts a `.pptx` into a single-page site of annotated slides: real
selectable HTML text (not screenshots), arrow-key / click navigation,
deep-linkable states (`#s12`), and a transcript panel where the current
annotation is highlighted and earlier ones fade to semi-transparent.
Theme matches amitsealami.com (HTML5 UP
"Editorial": white, slate, coral accent, Open Sans).

## Requirements

    pip install python-pptx

## Usage

    python pptx2web.py talk.pptx -o site \
        --title "My talk title" \
        --byline "Your Name, Your University" \
        --venue "CONF 2026 - City - Date - slides + notes" \
        --toc "6:Part 1 - framing" --toc "26:Part 2 - results"

Open `site/index.html`. Deploy by copying `site/` (index.html + media/)
anywhere static.

## Annotations: the `---` convention

Annotations come from **speaker notes**. Within one slide's notes, a line
containing only `---` starts a new click-state:

    This shows when the slide first appears.
    ---
    This appears on the next click; the previous paragraph dims.
    ---
    Third click.

Notes support a small markdown subset: **bold**, *italic*, `code`, and
[links](https://example.com).

If your annotations come from a talk recording instead: transcribe the
audio (e.g., Whisper), paste segments into each slide's speaker notes
with `---` separators at the points where you clicked, and re-run.

## Per-element build steps (optional, manual)

Clicks advance the narration automatically. If you also want slide
*elements* to appear per click (PowerPoint-style builds), add
`data-step="N"` to any element in the generated slide fragments — the
viewer already toggles visibility for `[data-step]` elements. Animation
timing metadata in .pptx is not exposed by python-pptx, so this part is
by hand (or by asking your AI assistant to do a pass over index.html).

## What converts

- Text boxes: position, size, per-run font size/bold/italic/underline/
  color, alignment, hyperlinks, vertical anchoring, solid fills/outlines
- Pictures (exported to `media/slideNN-<shapeid>.<ext>`)
- Tables (basic), groups (flattened), filled autoshapes

Not converted: charts, SmartArt, gradients, animations, connectors/arrows,
cropped-picture offsets. For a chart-heavy slide, the pragmatic fix is to
paste the chart as a picture in PowerPoint before converting.

## Files

- `pptx2web.py` — the converter
- `viewer_template.html` — theme + navigation + fading-annotation logic;
  edit the `:root` CSS variables to retheme
- `demo.pptx`, `site/` — a worked example
