#!/usr/bin/env python3
"""
mdslides.py — Compose a slide deck from a manifest + per-slide markdown files,
and render it to PDF (Beamer/LaTeX) or a native, editable PowerPoint (.pptx).

Model
-----
A DECK is a manifest markdown file:

    ---
    theme: usf-bulls
    title: Building Better Slides
    author: Amit
    ---

    - slides/00-title.md
    - slides/01-intro.md
    - slides/02-stats.md

Each SLIDE is its own markdown file with optional YAML frontmatter selecting a
layout. Most layouts are driven entirely by frontmatter keys; two-column still
uses `### Left` / `### Right` regions:

    ---
    layout: image-side
    title: Architecture
    image: diagram.png        # relative to the slide file; .pdf/.svg ok
    image_side: left          # left | right
    scale: .9                 # optional
    caption: Figure 1         # optional
    credit: J. Doe            # optional
    ---
    - the body is the side text

Layouts
-------
- default      frontmatter `title:` + body; optional `image:`/`scale:`/
               `caption:`/`credit:` render full-width above the body
- title        dark opening slide; `title:`/`subtitle:`/`subsubtitle:`, rule
- section      dark divider; `kicker:` eyebrow + `title:`, rule
- closing      dark closing slide; `title:`/`subtitle:`, rule
- two-column   `### Left` | `### Right`
- big-stat     `stat:` (huge) over `caption:`
- image-side   `image:` beside body text (`image_side:`, `scale:`,
               `caption:`/`credit:`)

Any slide may set `footer_logo: true` to stamp the USF logo in the corner.
Inline markdown supports bold/italic/strike/`<u>underline</u>`, code, links,
images, blockquotes, tables, `####`+ subheadings, smart quotes, and emoji
(via twemojis). Design follows Anthropic's pptx guidelines: no title
underlines, no accent stripes, white content with a dark "sandwich", left-
aligned body, strong size contrast. Composition (theme = palette + typography)
is data-driven via themes.json.

Usage
-----
    python3 mdslides.py deck.md                     # -> deck.pdf
    python3 mdslides.py deck.md -o out.pdf
    python3 mdslides.py deck.md --theme teal-trust  # override manifest theme
    python3 mdslides.py deck.md --theme-file mine.json
    python3 mdslides.py deck.md --list-themes
    python3 mdslides.py deck.md --keep-tex          # keep the generated .tex
    python3 mdslides.py deck.md --format pptx       # editable PowerPoint

Dependencies: PyYAML (pip install pyyaml). PDF output needs a LaTeX toolchain
(pdflatex) with beamer, booktabs, listings, tcolorbox, adjustbox, ulem, tikz,
csquotes, twemojis, hyperref. PPTX output needs python-pptx (see mdpptx.py);
.pdf/.svg images are rasterized via pdftocairo / inkscape.
"""

import argparse
import os
import re
import subprocess
import sys


# ============================================================================
# Frontmatter + manifest parsing
# ============================================================================

def _load_yaml(text):
    """Parse a small YAML subset. Uses PyYAML if available, else a fallback
    that handles flat key: value pairs and simple '- item' lists."""
    try:
        import yaml
        return yaml.safe_load(text) or {}
    except ImportError:
        return _yaml_fallback(text)


def _yaml_fallback(text):
    data = {}
    list_key = None
    for raw in text.splitlines():
        line = raw.rstrip()
        if not line.strip() or line.strip().startswith("#"):
            continue
        m = re.match(r"^(\w[\w-]*):\s*(.*)$", line)
        if m:
            key, val = m.group(1), m.group(2).strip()
            if val == "":
                data[key] = []
                list_key = key
            else:
                data[key] = _unquote(val)
                list_key = None
            continue
        m = re.match(r"^\s*-\s+(.*)$", line)
        if m and list_key is not None:
            data[list_key].append(_unquote(m.group(1).strip()))
    return data


def _unquote(s):
    if len(s) >= 2 and s[0] == s[-1] and s[0] in "\"'":
        return s[1:-1]
    return s


def split_frontmatter(text):
    """Return (frontmatter_dict, body_text). Frontmatter is a leading
    '---\\n...\\n---' block; absent -> ({}, text)."""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.DOTALL)
    if m:
        return _load_yaml(m.group(1)) or {}, m.group(2)
    return {}, text


def parse_manifest(path):
    """Parse a deck manifest. Returns (deck_config, [slide_file_paths])."""
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    fm, body = split_frontmatter(text)

    # Slide list can come from frontmatter `slides:` or the markdown body list.
    slide_refs = []
    if isinstance(fm.get("slides"), list):
        slide_refs = list(fm["slides"])
    else:
        for line in body.splitlines():
            m = re.match(r"^\s*[-*+]\s+(.*)$", line)
            if not m:
                continue
            item = m.group(1).strip()
            # Support "- [label](path.md)" and bare "- path.md".
            lm = re.match(r"^\[[^\]]*\]\(([^)]+)\)$", item)
            slide_refs.append(lm.group(1) if lm else item)

    base = os.path.dirname(os.path.abspath(path))
    slide_paths = [
        ref if os.path.isabs(ref) else os.path.normpath(os.path.join(base, ref))
        for ref in slide_refs
    ]
    return fm, slide_paths


def parse_slide_file(path):
    """Parse one slide file -> a slide dict with frontmatter, layout, regions."""
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    fm, body = split_frontmatter(text)
    layout = (fm.get("layout") or "default").strip().lower()

    regions, free = split_regions(body)
    return {
        "path": path,
        "dir": os.path.dirname(os.path.abspath(path)),
        "frontmatter": fm,
        "layout": layout,
        "title": fm.get("title"),
        "regions": regions,   # {region_name_lower: [lines]}
        "body_lines": free,   # lines not under any ### region
    }


def split_regions(body):
    """Split a slide body into `### Name` regions. Returns (regions, free_lines)
    where free_lines are lines before the first ### (used by simple layouts)."""
    regions = {}
    free = []
    current = None
    in_fence = False
    for raw in body.split("\n"):
        s = raw.strip()
        if s.startswith("```"):
            in_fence = not in_fence
            (regions[current] if current else free).append(raw)
            continue
        m = re.match(r"^###\s+(.*)$", s) if not in_fence else None
        if m:
            current = m.group(1).strip().lower()
            regions[current] = []
            continue
        (regions[current] if current else free).append(raw)
    return regions, free


# ============================================================================
# Inline Markdown -> LaTeX
# ============================================================================

_TEX_SPECIALS = {
    "\\": r"\textbackslash{}", "&": r"\&", "%": r"\%", "$": r"\$",
    "#": r"\#", "_": r"\_", "{": r"\{", "}": r"\}",
    "~": r"\textasciitilde{}", "^": r"\textasciicircum{}",
}


def tex_escape(text):
    return "".join(_TEX_SPECIALS.get(ch, ch) for ch in text)


# Emoji characters (common Unicode emoji ranges). An optional trailing U+FE0F
# (emoji variation selector) is consumed and dropped so we key on the base char.
_EMOJI_RE = re.compile(
    "[\U0001F000-\U0001FAFF\U00002600-\U000027BF\U00002300-\U000023FF"
    "\U00002B00-\U00002BFF\U0001F1E6-\U0001F1FF]️?"
)


def _emojify(text):
    """Replace emoji chars with \\emojicp{<hex>} (twemojis codepoint form).
    Runs on already tex-escaped text, so it emits raw LaTeX safely."""
    return _EMOJI_RE.sub(lambda m: "\\emojicp{%x}" % ord(m.group(0)[0]), text)


def render_inline(text, ctx):
    """Inline markdown -> LaTeX. ctx carries the slide dir for image paths."""
    store = []

    def grab_code(m):
        store.append(m.group(1))
        return f"\x00C{len(store)-1}\x00"
    text = re.sub(r"`([^`]+)`", grab_code, text)

    imgs = []

    def grab_img(m):
        imgs.append((m.group(1), m.group(2)))
        return f"\x00I{len(imgs)-1}\x00"
    text = re.sub(r"!\[([^\]]*)\]\(([^)\s]+)\)", grab_img, text)

    links = []

    def grab_link(m):
        links.append((m.group(2), m.group(1)))
        return f"\x00L{len(links)-1}\x00"
    text = re.sub(r"\[([^\]]+)\]\(([^)\s]+)\)", grab_link, text)

    # Smart single quotes: csquotes fixes straight double quotes, but can't
    # disambiguate a single "'" (opening quote vs. apostrophe). Turn an *opening*
    # single quote (at a word boundary, before non-space) into a backtick so
    # LaTeX curls it correctly; closing quotes and apostrophes stay "'" (already
    # rendered as a right single quote). Inline code/links are already extracted.
    text = re.sub(r"(^|(?<=[\s(\[{]))'(?=\S)", "`", text)

    B0, B1 = "\x01B\x01", "\x01b\x01"
    E0, E1 = "\x01E\x01", "\x01e\x01"
    S0, S1 = "\x01S\x01", "\x01s\x01"
    U0, U1 = "\x01U\x01", "\x01u\x01"
    NL = "\x01N\x01"  # <br> -> forced line break
    text = re.sub(r"<br\s*/?>", NL, text)
    text = re.sub(r"<u>(.+?)</u>", lambda m: U0 + m.group(1) + U1, text, flags=re.S)
    text = re.sub(r"\*\*([^*]+)\*\*", lambda m: B0 + m.group(1) + B1, text)
    text = re.sub(r"__([^_]+)__", lambda m: B0 + m.group(1) + B1, text)
    text = re.sub(r"~~([^~]+)~~", lambda m: S0 + m.group(1) + S1, text)
    text = re.sub(r"(?<!\*)\*([^*\n]+)\*(?!\*)", lambda m: E0 + m.group(1) + E1, text)
    text = re.sub(r"(?<!_)_([^_\n]+)_(?!_)", lambda m: E0 + m.group(1) + E1, text)

    text = _emojify(tex_escape(text))
    text = text.replace(B0, r"\textbf{").replace(B1, "}")
    text = text.replace(E0, r"\emph{").replace(E1, "}")
    text = text.replace(S0, r"\sout{").replace(S1, "}")
    text = text.replace(U0, r"\uline{").replace(U1, "}")
    text = text.replace(NL, r"\\")

    def put_link(m):
        href, label = links[int(m.group(1))]
        return r"\href{" + href.replace("%", r"\%").replace("#", r"\#") + "}{" + _emojify(tex_escape(label)) + "}"
    text = re.sub(r"\x00L(\d+)\x00", put_link, text)

    def put_img(m):
        _, src = imgs[int(m.group(1))]
        return image_tex(src, ctx)
    text = re.sub(r"\x00I(\d+)\x00", put_img, text)

    def put_code(m):
        return r"\texttt{" + _emojify(tex_escape(store[int(m.group(1))])) + "}"
    text = re.sub(r"\x00C(\d+)\x00", put_code, text)
    return text


def image_tex(src, ctx, opts=r"max width=\linewidth,max height=0.7\textheight"):
    """Resolve an image path relative to the slide file and emit includegraphics."""
    if not (src.startswith("http://") or src.startswith("https://") or os.path.isabs(src)):
        src = os.path.normpath(os.path.join(ctx.get("dir", "."), src))
    return r"\includegraphics[" + opts + "]{" + src + "}"


# ============================================================================
# Block Markdown -> LaTeX
# ============================================================================

def render_blocks(lines, ctx):
    parts = []
    i, n = 0, len(lines)
    while i < n:
        line = lines[i]
        s = line.strip()
        if not s:
            i += 1
            continue

        m = re.match(r"^```(\w*)\s*$", s)
        if m:
            code = []
            i += 1
            while i < n and not lines[i].strip().startswith("```"):
                code.append(lines[i])
                i += 1
            i += 1
            # Emoji would crash inputenc inside verbatim listings; route each
            # through the lstlisting escape delimiters so it renders as a twemoji
            # while the surrounding code stays verbatim.
            body = _EMOJI_RE.sub(
                lambda mm: "(*@\\emojicp{%x}@*)" % ord(mm.group(0)[0]), "\n".join(code))
            parts.append("\\begin{lstlisting}\n" + body + "\n\\end{lstlisting}")
            continue

        if s.startswith("|") and i + 1 < n and re.match(r"^\s*\|?[\s:|-]+\|?\s*$", lines[i + 1]):
            tbl = [lines[i], lines[i + 1]]
            i += 2
            while i < n and lines[i].strip().startswith("|"):
                tbl.append(lines[i])
                i += 1
            parts.append(render_table(tbl, ctx))
            continue

        if s.startswith(">"):
            q = []
            while i < n and lines[i].strip().startswith(">"):
                q.append(re.sub(r"^\s*>\s?", "", lines[i]))
                i += 1
            parts.append("\\begin{claudequote}\n" + render_blocks(q, ctx) + "\n\\end{claudequote}")
            continue

        m = re.match(r"^#{4,6}\s+(.*)$", s)  # #### and deeper (### are regions)
        if m:
            parts.append(r"\medskip{\color{accent}\large\bfseries " + render_inline(m.group(1), ctx) + r"}\par\medskip")
            i += 1
            continue

        if re.match(r"^[-*+]\s+", s):
            block, i = _consume_list(lines, i, False, ctx)
            parts.append(block)
            continue
        if re.match(r"^\d+\.\s+", s):
            block, i = _consume_list(lines, i, True, ctx)
            parts.append(block)
            continue

        para = []
        while i < n and lines[i].strip() and not _is_block_start(lines[i]):
            para.append(lines[i].strip())
            i += 1
        parts.append(render_inline(" ".join(para), ctx) + r"\par")
    return "\n".join(parts)


def _is_block_start(line):
    s = line.strip()
    return bool(
        re.match(r"^```", s) or re.match(r"^[-*+]\s+", s) or re.match(r"^\d+\.\s+", s)
        or s.startswith(">") or re.match(r"^#{4,6}\s+", s) or s.startswith("|")
    )


def _consume_list(lines, i, ordered, ctx):
    n = len(lines)
    pat = r"^(\s*)\d+\.\s+(.*)$" if ordered else r"^(\s*)[-*+]\s+(.*)$"
    items = []
    base = None
    while i < n:
        m = re.match(pat, lines[i])
        if not m:
            break
        indent = len(m.group(1))
        if base is None:
            base = indent
        if indent < base:
            break
        items.append(render_inline(m.group(2), ctx))
        i += 1
    env = "enumerate" if ordered else "itemize"
    body = "\n".join(r"\item " + it for it in items)
    return f"\\begin{{{env}}}\n{body}\n\\end{{{env}}}", i


def render_table(rows, ctx):
    def cells(line):
        return [c.strip() for c in line.strip().strip("|").split("|")]

    def cell_tex(c):
        # A <br> renders as \\ which would end the tabular row; wrap such
        # cells in \makecell so the break stays inside the cell.
        tex = render_inline(c, ctx)
        if r"\\" in tex:
            tex = r"\makecell[l]{" + tex + "}"
        return tex

    header = cells(rows[0])
    body = [cells(r) for r in rows[2:]]
    ncol = len(header)
    colspec = " ".join(["l"] * ncol)
    out = ["\\begin{center}", f"\\begin{{tabular}}{{{colspec}}}", "\\toprule"]
    out.append(" & ".join(r"\textbf{\color{headingcol}" + cell_tex(c) + "}" for c in header) + r" \\")
    out.append("\\midrule")
    for r in body:
        r = r + [""] * (ncol - len(r))
        out.append(" & ".join(cell_tex(c) for c in r[:ncol]) + r" \\")
    out += ["\\bottomrule", "\\end{tabular}", "\\end{center}"]
    return "\n".join(out)


def region(slide, *names):
    """Return the lines of the first matching region (case-insensitive), or []."""
    for nm in names:
        if nm.lower() in slide["regions"]:
            return slide["regions"][nm.lower()]
    return []


# ============================================================================
# Layouts -> Beamer frames
# ============================================================================

def frame_default(slide, ctx):
    fm = slide["frontmatter"]
    title = _slide_title_tex(slide, ctx)
    body = render_blocks(slide["body_lines"] + _all_region_lines(slide), ctx)

    # Optional full-width image from the `image:` frontmatter key, rendered
    # above the body. `scale:`, `caption:` and `credit:` behave as in the
    # image-side layout.
    img_block = ""
    if fm.get("image"):
        img_tex = image_tex(fm["image"], ctx)
        if fm.get("scale") is not None:
            try:
                img_tex = "\\scalebox{" + repr(float(fm["scale"])) + "}{" + img_tex + "}"
            except (TypeError, ValueError):
                pass
        img_block = img_tex
        if fm.get("caption"):
            img_block += ("\n\\par\\smallskip\n{\\color{muted}\\small\\itshape "
                          + render_inline(str(fm["caption"]), ctx) + "\\par}")
        if fm.get("credit"):
            img_block += ("\n\\par\\smallskip\n{\\color{muted}\\footnotesize "
                          + render_inline(str(fm["credit"]), ctx) + "\\par}")
        img_block += "\n\\par\\medskip\n"

    head = "{" + title + "}" if title else "{}"
    return "\\begin{frame}[fragile]" + head + "\n" + img_block + body + "\n\\end{frame}"


def frame_two_column(slide, ctx):
    title = _slide_title_tex(slide, ctx)
    left = render_blocks(region(slide, "left"), ctx)
    right = render_blocks(region(slide, "right"), ctx)
    head = "{" + title + "}" if title else "{}"
    return (
        "\\begin{frame}[fragile]" + head + "\n"
        "\\begin{columns}[T,onlytextwidth]\n"
        "\\begin{column}{0.48\\textwidth}\n" + left + "\n\\end{column}\n"
        "\\begin{column}{0.48\\textwidth}\n" + right + "\n\\end{column}\n"
        "\\end{columns}\n\\end{frame}"
    )


def frame_big_stat(slide, ctx):
    fm = slide["frontmatter"]
    title = _slide_title_tex(slide, ctx)
    # Stat + caption come from frontmatter; fall back to `### Stat`/`### Caption`
    # regions (legacy region form).
    stat_src = fm.get("stat") or " ".join(
        l.strip() for l in region(slide, "stat", "number") if l.strip())
    cap_src = fm.get("caption") or " ".join(
        l.strip() for l in region(slide, "caption", "label") if l.strip())
    stat = render_inline(str(stat_src), ctx)
    caption = render_inline(str(cap_src), ctx)
    head = "{" + title + "}" if title else "{}"
    return (
        "\\begin{frame}[fragile]" + head + "\n"
        "\\vfill\\begin{center}\n"
        "{\\color{headingcol}\\fontsize{72}{78}\\selectfont\\bfseries " + stat + "\\par}\n"
        "\\medskip\n"
        "{\\color{muted}\\Large " + caption + "\\par}\n"
        "\\end{center}\\vfill\n\\end{frame}"
    )


def frame_image_side(slide, ctx):
    fm = slide["frontmatter"]
    title = _slide_title_tex(slide, ctx)
    opts = r"max width=\linewidth,max height=0.75\textheight"

    # Image source comes from the `image:` frontmatter key. Fall back to the
    # first markdown image in a `### Image` region (legacy region form).
    src = fm.get("image")
    if not src:
        for l in region(slide, "image"):
            m = re.search(r"!\[[^\]]*\]\(([^)\s]+)\)", l)
            if m:
                src = m.group(1)
                break
    img_tex = image_tex(src, ctx, opts=opts) if src else ""

    # Optional `scale:` shrinks/grows the fitted image (e.g. scale: .9 -> 90%).
    if img_tex and fm.get("scale") is not None:
        try:
            img_tex = "\\scalebox{" + repr(float(fm["scale"])) + "}{" + img_tex + "}"
        except (TypeError, ValueError):
            pass

    # Side text is the plain body; fall back to a `### Text` region (legacy).
    text_lines = slide["body_lines"] or region(slide, "text")
    text = render_blocks(text_lines, ctx)
    side = (fm.get("image_side") or "left").lower()

    # Optional caption (small, italic) and credit (smaller) centered below the
    # image, both muted. Caption sits above the credit.
    below = ""
    if fm.get("caption"):
        below += ("\n\\par\\smallskip\n{\\color{muted}\\small\\itshape "
                  + render_inline(str(fm["caption"]), ctx) + "\\par}")
    if fm.get("credit"):
        below += ("\n\\par\\smallskip\n{\\color{muted}\\footnotesize "
                  + render_inline(str(fm["credit"]), ctx) + "\\par}")
    img_col = ("\\begin{column}{0.46\\textwidth}\\centering\n" + img_tex + below + "\n\\end{column}\n")
    txt_col = ("\\begin{column}{0.5\\textwidth}\n" + text + "\n\\end{column}\n")
    cols = (img_col + txt_col) if side == "left" else (txt_col + img_col)
    head = "{" + title + "}" if title else "{}"
    return (
        "\\begin{frame}[fragile]" + head + "\n"
        "\\begin{columns}[c,onlytextwidth]\n" + cols + "\\end{columns}\n\\end{frame}"
    )


def dark_fields(slide, kind="title"):
    """Classify a dark slide (title/section/closing) into
    (title, subtitle, subsubtitle, kicker, leftover_lines). Shared by the Beamer
    and pptx emitters so both agree on how the content is bucketed.

    Title = frontmatter `title` OR first #/## heading in the free body.
    Subtitle = `### Subtitle` region OR frontmatter `subtitle` OR first plain
               body paragraph that isn't the title/byline.
    Subsubtitle = frontmatter `subsubtitle` (alias `author`) OR an italic-only
               body line. Kicker = frontmatter `kicker` (section only).
    """
    fm = slide["frontmatter"]
    title = fm.get("title") or _first_heading_text(slide)

    # Flatten all text (free body + every region's content) into one pool, then
    # classify: skip the title heading, pull an italic-only line as the byline,
    # treat a `### Subtitle` region (or frontmatter) as subtitle, rest below.
    pool = list(slide["body_lines"])
    sub_region = region(slide, "subtitle")
    for name, lines in slide["regions"].items():
        if name == "subtitle":
            continue
        pool.extend(lines)

    subsubtitle = fm.get("subsubtitle") or fm.get("author")
    subtitle = str(fm["subtitle"]) if fm.get("subtitle") else None
    if sub_region:
        # a byline may live inside the region; separate it out
        sub_parts = []
        for l in sub_region:
            s = l.strip()
            if not s:
                continue
            m = re.match(r"^\*([^*]+)\*$|^_([^_]+)_$", s)
            if m and subsubtitle is None:
                subsubtitle = (m.group(1) or m.group(2)).strip()
            else:
                sub_parts.append(s)
        if sub_parts and subtitle is None:
            subtitle = " ".join(sub_parts)

    leftover = []
    for raw in pool:
        s = raw.strip()
        if not s:
            continue
        if re.match(r"^#{1,4}\s+", s):
            continue  # title heading or region-label injected elsewhere
        m = re.match(r"^\*([^*]+)\*$|^_([^_]+)_$", s)
        if m and subsubtitle is None:
            subsubtitle = (m.group(1) or m.group(2)).strip()
            continue
        leftover.append(raw)

    if subtitle is None and leftover:
        subtitle = leftover.pop(0).strip()

    kicker = fm.get("kicker") if kind == "section" else None
    return title, subtitle, subsubtitle, kicker, leftover


def frame_dark(slide, ctx, kind="title"):
    """title / section / closing: dark full-bleed centered frame.

    All three are centered on the dark background and share the same content
    model, but differ by title size (title > section > closing) and a couple of
    accents: every one draws a short horizontal rule under its title (with a gap
    after), and `section` may carry an optional `kicker:` eyebrow above the title.
    """
    title, subtitle, subsubtitle, kicker, leftover = dark_fields(slide, kind)
    title_tex = render_inline(str(title), ctx) if title else ""
    subtitle_tex = render_inline(subtitle, ctx) if subtitle else ""
    subsubtitle_tex = render_inline(str(subsubtitle), ctx) if subsubtitle else ""
    kicker_tex = render_inline(str(kicker), ctx) if kicker else ""

    # Size hierarchy: title (biggest) > section > closing.
    sizes = {
        "title": r"\fontsize{40}{46}\selectfont",
        "section": r"\fontsize{34}{40}\selectfont",
        "closing": r"\fontsize{28}{34}\selectfont",
    }
    size = sizes.get(kind, sizes["title"])

    inner = "\\centering\\vfill\n"
    if kicker_tex:
        inner += "{\\color{muted}\\footnotesize\\MakeUppercase{" + kicker_tex + "}\\par}\n\\smallskip\n"
    if title_tex:
        inner += "{\\color{darkfg}" + size + "\\bfseries " + title_tex + "\\par}\n\\medskip\n"
        # Short rule under the title, then a gap (all three layouts).
        inner += "{\\color{darkfg}\\rule{0.22\\textwidth}{0.4pt}}\\par\n\\bigskip\n"
    if subtitle_tex:
        inner += "{\\color{secondary}\\Large " + subtitle_tex + "\\par}\n\\medskip\n"
    if subsubtitle_tex:
        inner += "{\\color{darkfg}\\normalsize\\itshape " + subsubtitle_tex + "\\par}\n"
    if leftover:
        inner += "{\\color{darkfg}\\large " + render_blocks(leftover, ctx) + "}\n"
    inner += "\\vfill\n"
    return (
        "\\begingroup\n"
        "\\setbeamercolor{background canvas}{bg=primary}\n"
        "\\setbeamercolor{normal text}{fg=darkfg}\n"
        "\\usebeamercolor[fg]{normal text}\n"
        "\\begin{frame}[fragile,plain]\n" + inner + "\\end{frame}\n"
        "\\endgroup"
    )


LAYOUTS = {
    "default": frame_default,
    "two-column": frame_two_column,
    "big-stat": frame_big_stat,
    "image-side": frame_image_side,
    "title": lambda s, c: frame_dark(s, c, kind="title"),
    "section": lambda s, c: frame_dark(s, c, kind="section"),
    "closing": lambda s, c: frame_dark(s, c, kind="closing"),
}


def _wants_logo(slide):
    """Per-slide toggle: frontmatter `footer_logo` (alias `logo`), truthy."""
    fm = slide["frontmatter"]
    val = fm.get("footer_logo", fm.get("logo"))
    if isinstance(val, str):
        return val.strip().lower() in ("true", "yes", "on", "1")
    return bool(val)


def render_slide(slide, ctx):
    fn = LAYOUTS.get(slide["layout"], frame_default)
    tex = fn(slide, ctx)
    if _wants_logo(slide):
        # Inject the logo overlay just before the LAST \end{frame} so it lands
        # inside the frame (dark layouts wrap the frame in a begingroup).
        idx = tex.rfind("\\end{frame}")
        if idx != -1:
            tex = tex[:idx] + "\\usflogo\n" + tex[idx:]
    return tex


# --- helpers ---------------------------------------------------------------

def _slide_title_tex(slide, ctx):
    if slide["title"]:
        return render_inline(str(slide["title"]), ctx)
    # fall back to a leading `## Title` in free body lines
    for l in slide["body_lines"]:
        m = re.match(r"^##\s+(.*)$", l.strip())
        if m:
            return render_inline(m.group(1).strip(), ctx)
    return ""


def _first_heading_text(slide):
    for l in slide["body_lines"]:
        m = re.match(r"^#{1,3}\s+(.*)$", l.strip())
        if m:
            return m.group(1).strip()
    # or a lone non-empty line
    for l in slide["body_lines"]:
        if l.strip():
            return l.strip()
    return ""


def _all_region_lines(slide):
    out = []
    for name, lines in slide["regions"].items():
        out.append("#### " + name.capitalize())
        out.extend(lines)
    return out if slide["regions"] else []


# ============================================================================
# Themes
# ============================================================================

import json

_FALLBACK_THEME = {
    "label": "Midnight Executive",
    "palette": {
        "primary": "1E2761", "secondary": "CADCFC", "accent": "3D5AF1",
        "content_bg": "FFFFFF", "content_fg": "1A1A2E", "muted": "5A5A72",
        "code_bg": "F0F3FB",
    },
    "dark": False,
    "typography": {"heading_tex": "serif"},
}


def _themes_path():
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "themes.json")


def load_theme(name, theme_file=None):
    path = theme_file or _themes_path()
    data = None
    if os.path.isfile(path):
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    if data and "themes" not in data and "palette" in data:
        return data
    if data and "themes" in data:
        themes = data["themes"]
        if name in themes:
            return themes[name]
        if name is None and themes:
            return next(iter(themes.values()))
        if themes:
            print(f"warning: theme '{name}' not found; using fallback. "
                  f"Available: {', '.join(themes)}", file=sys.stderr)
    return _FALLBACK_THEME


def _hex_rgb(c):
    c = c.lstrip("#")
    return f"{int(c[0:2],16)},{int(c[2:4],16)},{int(c[4:6],16)}"


# ============================================================================
# Document assembly
# ============================================================================

PREAMBLE = r"""\documentclass[aspectratio=169]{beamer}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{lmodern}
\usepackage{xcolor}
\usepackage{booktabs}
\usepackage{makecell}
\usepackage{listings}
\usepackage{tcolorbox}
\usepackage[export]{adjustbox}
\usepackage[normalem]{ulem}
\usepackage{tikz}
\usepackage[autostyle=true]{csquotes}
\MakeOuterQuote{"}
\usepackage{twemojis}
\usepackage{hyperref}

% Emoji: markdown emoji chars are rewritten to \emojicp{<hex codepoint>}, drawn
% as a Twitter-style vector by twemojis (keeps the pdflatex pipeline). Guarded so
% an unmapped codepoint (e.g. a flag/ZWJ sequence) renders nothing, not an error.
\newcommand{\emojicp}[1]{\ifcsname twemoji #1\endcsname\texttwemoji{#1}\fi}

\definecolor{primary}{RGB}{@@PRIMARY@@}
\definecolor{secondary}{RGB}{@@SECONDARY@@}
\definecolor{accent}{RGB}{@@ACCENT@@}
\definecolor{contentbg}{RGB}{@@CONTENTBG@@}
\definecolor{bodyfg}{RGB}{@@FG@@}
\definecolor{muted}{RGB}{@@MUTED@@}
\definecolor{codebg}{RGB}{@@CODEBG@@}
\definecolor{darkfg}{RGB}{@@DARKFG@@}
\definecolor{headingcol}{RGB}{@@HEADINGCOL@@}

\setbeamercolor{background canvas}{bg=contentbg}
\setbeamercolor{normal text}{fg=bodyfg}
% Beamer derives body text and list markers from 'structure' (default blue).
% Pin it to the content foreground so ALL text — paragraphs and bullet/number
% markers alike — uses normal text color. Only the frame title is recolored.
\setbeamercolor{structure}{fg=bodyfg}
\setbeamercolor{frametitle}{fg=headingcol,bg=}
\setbeamercolor{itemize item}{fg=bodyfg}
\setbeamercolor{itemize subitem}{fg=bodyfg}
\setbeamercolor{itemize subsubitem}{fg=bodyfg}
\setbeamercolor{enumerate item}{fg=bodyfg}
\setbeamercolor{enumerate subitem}{fg=bodyfg}
\setbeamerfont{frametitle}{series=\bfseries,size=\LARGE}
\setbeamertemplate{navigation symbols}{}
\usefonttheme{@@FONTTHEME@@}

% Frame title: NO underline rule (an AI-generated-slide tell). Whitespace only.
\setbeamertemplate{frametitle}{%
  \vskip0.8em\hspace{0.1em}\insertframetitle\par\vskip0.5em}

% Blockquote: subtle tinted box, NOT a left accent stripe.
\newtcolorbox{claudequote}{
  colback=codebg, colframe=codebg, boxrule=0pt, arc=2mm,
  left=3mm,right=3mm,top=2mm,bottom=2mm,
  fontupper=\itshape\color{muted}}

\lstset{
  basicstyle=\ttfamily\small, backgroundcolor=\color{codebg},
  frame=none, breaklines=true, columns=fullflexible, keepspaces=true,
  xleftmargin=0.6em, aboveskip=0.8em, belowskip=0.8em,
  escapeinside={(*@}{@*)}}

\hypersetup{colorlinks=true,urlcolor=accent,linkcolor=accent}

% Per-slide USF logo footer. Anchored to the bottom-right corner via an absolute
% tikz overlay. Uses the official USF logo as a PDF vector (@@LOGOPATH@@,
% extracted from the source deck) so its transparent background composites
% cleanly on any slide.
\newcommand{\usflogo}{%
  \begin{tikzpicture}[remember picture,overlay]
    \node[anchor=south east,inner sep=0pt]
      at ([shift={(-1.4em,1.0em)}]current page.south east)
      {\includegraphics[height=2.4em]{@@LOGOPATH@@}};
  \end{tikzpicture}%
}
"""


def build_document(deck_cfg, slides, theme, manifest_dir="."):
    pal = theme["palette"]
    dark = theme.get("dark", False)
    typ = theme.get("typography", {})

    dark_fg = "FFFFFF" if not dark else pal["content_fg"]
    heading_hex = pal["accent"] if dark else pal["primary"]
    fonttheme = "serif" if typ.get("heading_tex", "serif") == "serif" else "professionalfonts"

    # Footer logo image. Manifest `logo:` overrides; default is usf-logo.png
    # bundled next to this script. Resolved to an absolute path for LaTeX.
    logo_ref = deck_cfg.get("logo") or os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "deck", "usf-logo.pdf")
    if not os.path.isabs(logo_ref):
        logo_ref = os.path.normpath(os.path.join(manifest_dir, logo_ref))

    preamble = PREAMBLE
    for k, v in (
        ("@@PRIMARY@@", _hex_rgb(pal["primary"])),
        ("@@SECONDARY@@", _hex_rgb(pal["secondary"])),
        ("@@ACCENT@@", _hex_rgb(pal["accent"])),
        ("@@CONTENTBG@@", _hex_rgb(pal["content_bg"])),
        ("@@FG@@", _hex_rgb(pal["content_fg"])),
        ("@@MUTED@@", _hex_rgb(pal["muted"])),
        ("@@CODEBG@@", _hex_rgb(pal["code_bg"])),
        ("@@DARKFG@@", _hex_rgb(dark_fg)),
        ("@@HEADINGCOL@@", _hex_rgb(heading_hex)),
        ("@@FONTTHEME@@", fonttheme),
        ("@@LOGOPATH@@", logo_ref),
    ):
        preamble = preamble.replace(k, v)

    frames = "\n\n".join(render_slide(s, {"dir": s["dir"]}) for s in slides)
    return preamble + "\n\\begin{document}\n" + frames + "\n\\end{document}\n"


# ============================================================================
# Compile
# ============================================================================

def compile_pdf(tex_path, keep_tex=False):
    workdir = os.path.dirname(os.path.abspath(tex_path)) or "."
    base = os.path.splitext(os.path.basename(tex_path))[0]
    if not _has_pdflatex():
        print("error: pdflatex not found. Install a LaTeX toolchain (e.g. TeX Live / MacTeX)\n"
              "with beamer, booktabs, listings, tcolorbox, adjustbox, ulem.", file=sys.stderr)
        return None
    # Two passes: tikz 'remember picture' overlays (per-slide logo) need the
    # second pass to resolve absolute page coordinates.
    for _ in range(2):
        proc = subprocess.run(
            ["pdflatex", "-interaction=nonstopmode", "-halt-on-error",
             os.path.basename(tex_path)],
            cwd=workdir, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        )
        if proc.returncode != 0:
            break
    pdf_path = os.path.join(workdir, base + ".pdf")
    if proc.returncode != 0 or not os.path.isfile(pdf_path):
        log = proc.stdout.decode("utf-8", "replace")
        tail = "\n".join(log.splitlines()[-25:])
        print("error: pdflatex failed. Last lines:\n" + tail, file=sys.stderr)
        return None
    # clean aux files
    for ext in (".aux", ".log", ".nav", ".snm", ".toc", ".out"):
        f = os.path.join(workdir, base + ext)
        if os.path.isfile(f):
            os.remove(f)
    if not keep_tex and os.path.isfile(tex_path):
        os.remove(tex_path)
    return pdf_path


def _has_pdflatex():
    from shutil import which
    return which("pdflatex") is not None


# ============================================================================
# CLI
# ============================================================================

def main(argv=None):
    ap = argparse.ArgumentParser(
        description="Compose a slide deck from a manifest + per-slide markdown files -> PDF.")
    ap.add_argument("manifest", nargs="?", help="Deck manifest markdown file")
    ap.add_argument("-o", "--output", help="Output path (default: alongside manifest, extension from --format)")
    ap.add_argument("--format", choices=("pdf", "pptx"), default="pdf",
                    help="Output format: pdf (Beamer, default) or pptx (native, editable)")
    ap.add_argument("--theme", help="Theme preset (overrides manifest); default from manifest or midnight-executive")
    ap.add_argument("--theme-file", help="Custom theme JSON (overrides bundled presets)")
    ap.add_argument("--list-themes", action="store_true", help="List theme presets and exit")
    ap.add_argument("--title", help="Override deck title")
    ap.add_argument("--keep-tex", action="store_true", help="Keep the generated .tex file")
    args = ap.parse_args(argv)

    if args.list_themes:
        path = args.theme_file or _themes_path()
        if os.path.isfile(path):
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            print("Available themes:")
            for name, th in data.get("themes", {}).items():
                dk = " (dark)" if th.get("dark") else ""
                print(f"  {name:20s} {th.get('label','')}{dk}")
        return 0

    if not args.manifest:
        ap.error("a manifest file is required")
    if not os.path.isfile(args.manifest):
        print(f"error: no such file: {args.manifest}", file=sys.stderr)
        return 1

    deck_cfg, slide_paths = parse_manifest(args.manifest)
    if args.title:
        deck_cfg["title"] = args.title

    if not slide_paths:
        print("error: manifest lists no slide files.", file=sys.stderr)
        return 1

    missing = [p for p in slide_paths if not os.path.isfile(p)]
    if missing:
        print("error: slide file(s) not found:\n  " + "\n  ".join(missing), file=sys.stderr)
        return 1

    slides = [parse_slide_file(p) for p in slide_paths]

    theme_name = args.theme or deck_cfg.get("theme") or "midnight-executive"
    theme = load_theme(theme_name, args.theme_file)

    manifest_dir = os.path.dirname(os.path.abspath(args.manifest))

    if args.format == "pptx":
        try:
            import mdpptx
        except ImportError:
            print("error: pptx output needs python-pptx. Install it (e.g. in a venv):\n"
                  "  python3 -m venv .venv && .venv/bin/pip install python-pptx\n"
                  "then run with .venv/bin/python mdslides.py ... --format pptx",
                  file=sys.stderr)
            return 1
        out_pptx = args.output or (os.path.splitext(args.manifest)[0] + ".pptx")
        mdpptx.build_pptx(deck_cfg, slides, theme, manifest_dir, out_pptx, dark_fields)
        print(f"Wrote {len(slides)} slide(s) [{theme.get('label','')}] -> {out_pptx}")
        return 0

    doc = build_document(deck_cfg, slides, theme, manifest_dir)

    out_pdf = args.output or (os.path.splitext(args.manifest)[0] + ".pdf")
    tex_path = os.path.splitext(out_pdf)[0] + ".tex"
    with open(tex_path, "w", encoding="utf-8") as f:
        f.write(doc)

    pdf = compile_pdf(tex_path, keep_tex=args.keep_tex)
    if not pdf:
        print(f"(kept {tex_path} for inspection)", file=sys.stderr)
        return 1
    print(f"Wrote {len(slides)} slide(s) [{theme.get('label','')}] -> {pdf}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
