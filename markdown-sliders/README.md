# mdslides

Compose a slide deck from a **manifest + per-slide markdown files** and render
it to **PDF** via Beamer/LaTeX. Styling follows Anthropic's pptx design
guidelines (no title underlines, no accent stripes, white content with a dark
"sandwich", left-aligned body, strong size contrast). Composition (palette +
typography) is data-driven via `themes.json`.

## Install

- Python 3 with **PyYAML** (`pip install pyyaml`) — a stdlib fallback parser is
  used if PyYAML is absent, but PyYAML is recommended.
- A **LaTeX toolchain** with `pdflatex` and the packages: `beamer`, `booktabs`,
  `listings`, `tcolorbox`, `adjustbox`, `ulem`, `tikz`, `csquotes`, `twemojis`,
  `hyperref`.
  (TeX Live: `texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended`.)

## Run

```bash
python3 mdslides.py deck/deck.md               # -> deck/deck.pdf
python3 mdslides.py deck/deck.md -o out.pdf
python3 mdslides.py deck/deck.md --theme teal-trust
python3 mdslides.py deck/deck.md --theme-file mytheme.json
python3 mdslides.py deck/deck.md --list-themes
python3 mdslides.py deck/deck.md --keep-tex     # keep the generated .tex
python3 mdslides.py deck/deck.md --format pptx  # editable PowerPoint (see below)
```

`--theme` overrides the manifest's theme. The `.tex` is generated, compiled, and
(unless `--keep-tex`) removed along with LaTeX aux files.

## PowerPoint (.pptx) output

The same deck can render to a **native, editable** PowerPoint file with
`--format pptx` — real text boxes, bullet lists, tables, and embedded images
(not a picture-per-slide export). It needs [`python-pptx`](https://python-pptx.readthedocs.io);
the simplest setup is a project venv:

```bash
python3 -m venv .venv && .venv/bin/pip install python-pptx pyyaml
.venv/bin/python mdslides.py deck/deck.md --theme usf-bulls --format pptx   # -> deck/deck.pptx
```

Fidelity is "editable, close" rather than pixel-identical to the PDF. Known
degradations: code blocks lose LaTeX syntax highlighting (plain monospace),
block/paragraph spacing is estimated, and vector rules become thin rectangles.
Emoji render via PowerPoint's own font. Inline body images (`![alt](path)` on
their own line) are placed in the flow, and the `image:` key and logo are
embedded too — every image resolves **relative to the slide file** (relative
paths like `../figs/plot.pdf` are fine). PowerPoint can't embed `.pdf`/`.svg`
graphics, so any referenced one is **auto-rasterized to PNG** at build time —
`.pdf` via `pdftocairo`, `.svg` via `inkscape` — into a throwaway temp dir (the
deck folder is left untouched); if neither tool is available it falls back to a
`.png` sibling, else skips the image. Note pptx uses strict
YAML, so quote frontmatter values containing a colon (e.g.
`credit: "(photo: J. Doe)"`).

## The manifest

A markdown file with YAML frontmatter and a list of slide files:

```markdown
---
theme: midnight-executive
title: Building Better Slides
author: Amit
---

- 00-title.md
- 01-intro.md
- 02-twocol.md
```

Slide paths resolve relative to the manifest. You may also use
`- [label](path.md)` links, or a frontmatter `slides:` list.

## A slide file

Each slide is its own markdown file. Optional YAML frontmatter picks a `layout`;
the body is organized into `### Named` regions for layouts that need them.

```markdown
---
layout: two-column
title: Two column layout
---
### Left
- point one
- point two

### Right
![diagram](diagram.png)
```

Images use standard markdown `![alt](path)` and resolve **relative to the slide
file**. A `default` slide can also declare its image in frontmatter instead of
the body: `image:` renders full-width above the body, with optional `scale:`,
and `caption:`/`credit:` shown muted below the image (same keys as
`image-side`).

```markdown
---
layout: default
title: The Agent Loop
image: graphics/agent-loop.pdf
---
- plan, act, observe, repeat
```

## Per-slide USF logo footer

Add `footer_logo: true` (alias `logo: true`) to a slide's frontmatter to stamp
the official USF logo in the bottom-right corner of *that* slide. The image is
`deck/usf-logo.pdf` (the bull + "UNIVERSITY of SOUTH FLORIDA" wordmark extracted
from the source USF deck as a PDF vector, so its transparency composites cleanly
on any background). On dark layouts (`title`/`section`/`closing`) it sits on a
rounded white chip so the green wordmark stays legible.

```markdown
---
layout: default
title: Program overview
footer_logo: true
---
```

The toggle is per-slide, so only the slides that opt in show the footer. Point
it at a different image with a manifest-level `logo:` path (resolved relative to
the manifest); otherwise the bundled `usf-logo.png` is used. Pairs naturally
with the `usf-bulls` theme.

## Layouts

| `layout:`     | Regions used            | Look |
|---------------|-------------------------|------|
| `default`     | (none; plain body)      | Frame title + markdown body |
| `title`       | frontmatter `title:`/`subtitle:`/`subsubtitle:` | Dark opening slide; biggest title + rule |
| `section`     | frontmatter `kicker:`/`title:` | Dark divider; medium title + kicker eyebrow |
| `closing`     | frontmatter `title:`/`subtitle:` | Dark closing slide; smallest title + rule |
| `two-column`  | `### Left` / `### Right`| Two independent columns |
| `big-stat`    | frontmatter `stat:` / `caption:` | Huge number over a caption |
| `image-side`  | body = side text        | Image (frontmatter `image:`) beside text (`image_side: left|right`; optional `scale:`, `caption:`/`credit:` below the image) |

`default`, `title`, `section`, `closing` don't require regions. The dark
layouts (`title`/`section`/`closing`) form the guideline "sandwich".

## Themes

Presets live in `themes.json`; list them with `--list-themes`. Each theme is a
palette (`primary`, `secondary`, `accent`, `content_bg`, `content_fg`, `muted`,
`code_bg`) plus typography (`heading_tex`: `serif` or `sans`) and an optional
`dark: true` flag for dark-background themes. Add your own by editing
`themes.json` or passing `--theme-file yours.json` (either a `{"themes": {...}}`
bundle or a single theme object).

Bundled: `midnight-executive` (default), `warm-terracotta`, `teal-trust`,
`charcoal-minimal`, `usf-bulls` (USF green + gold; pairs with the logo footer),
`premium-dark` (dark).

## Markdown supported inside slides

Paragraphs, bullet/numbered lists, **bold**/*italic*/~~strike~~/`<u>underline</u>`,
`inline code`, fenced code blocks, links, images (`![alt](path)` — PNG/JPG and,
for PDF output, PDF/SVG too), blockquotes (rendered as a tinted box, not a
stripe), pipe tables, `####`+ sub-headings (note: `###` is reserved for
region markers), and `<br>` forced line breaks — including inside table
cells, where the PDF path wraps the cell in `\makecell`.

Straight quotes are curled automatically — `"double"` and `'single'` become
proper typographic quotes, apostrophes are preserved, and quotes inside code
(inline or fenced) stay straight.

Emoji typed straight into the markdown (e.g. `✨`, `🚀`) render as Twitter-style
vectors via `twemojis` — no engine switch, still pdflatex. Single-codepoint
emoji are covered; unmapped sequences (some flags/ZWJ) are dropped silently
rather than erroring.

## Example

The `deck/` folder is a complete example exercising every layout. Build it:

```bash
python3 mdslides.py deck/deck.md
```
