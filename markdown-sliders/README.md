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
  `listings`, `tcolorbox`, `adjustbox`, `ulem`, `hyperref`.
  (TeX Live: `texlive-latex-recommended texlive-latex-extra texlive-fonts-recommended`.)

## Run

```bash
python3 mdslides.py deck/deck.md               # -> deck/deck.pdf
python3 mdslides.py deck/deck.md -o out.pdf
python3 mdslides.py deck/deck.md --theme teal-trust
python3 mdslides.py deck/deck.md --theme-file mytheme.json
python3 mdslides.py deck/deck.md --list-themes
python3 mdslides.py deck/deck.md --keep-tex     # keep the generated .tex
```

`--theme` overrides the manifest's theme. The `.tex` is generated, compiled, and
(unless `--keep-tex`) removed along with LaTeX aux files.

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
file**.

## Layouts

| `layout:`     | Regions used            | Look |
|---------------|-------------------------|------|
| `default`     | (none; plain body)      | Frame title + markdown body |
| `title`       | `### Subtitle` + `*byline*` | Dark full-bleed opening slide |
| `section`     | (heading only)          | Dark full-bleed divider |
| `closing`     | (heading + body)        | Dark full-bleed closing slide |
| `two-column`  | `### Left` / `### Right`| Two independent columns |
| `big-stat`    | `### Stat` / `### Caption` | Huge number over a caption |
| `image-side`  | `### Image` / `### Text`| Image beside text (`image_side: left|right`) |

`default`, `title`, `section`, `closing` don't require regions. The dark
layouts (`title`/`section`/`closing`) form the guideline "sandwich".

## Themes

Presets live in `themes.json`; list them with `--list-themes`. Each theme is a
palette (`primary`, `secondary`, `accent`, `content_bg`, `content_fg`, `muted`,
`code_bg`, `table_head_bg`) plus typography. Add your own by editing
`themes.json` or passing `--theme-file yours.json` (either a `{"themes": {...}}`
bundle or a single theme object).

Bundled: `midnight-executive` (default), `warm-terracotta`, `teal-trust`,
`charcoal-minimal`, `premium-dark`.

## Markdown supported inside slides

Paragraphs, bullet/numbered lists, **bold**/*italic*/~~strike~~, `inline code`,
fenced code blocks, links, images, blockquotes (rendered as a tinted box, not a
stripe), pipe tables, and `####`+ sub-headings (note: `###` is reserved for
region markers).

## Example

The `deck/` folder is a complete example exercising every layout. Build it:

```bash
python3 mdslides.py deck/deck.md
```
