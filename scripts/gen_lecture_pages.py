#!/usr/bin/env python3
"""Generate per-lecture viewer pages from the shared lecture metadata.

Keeps the metadata single-sourced (assets/site/lectures.js is the SOURCE OF
TRUTH on the frontend; here we re-encode it in Python to produce static HTML).
If you update one, update the other.
"""
from pathlib import Path
import html as _html

ROOT = Path(__file__).resolve().parent.parent
LECTURES_DIR = ROOT / "lectures"

LECTURES = [
    # n,  title,                                                                   date,            section, kind,     guest
    (1,   "Introduction",                                                          "Sep 2, 2025",   "i",     "own",    None),
    (2,   "Foundations, Monge, Brenier",                                           "Sep 4, 2025",   "i",     "own",    None),
    (3,   "Kantorovich, Couplings",                                                "Sep 9, 2025",   "i",     "own",    None),
    (4,   "Wasserstein, Duality",                                                  "Sep 11, 2025",  "i",     "own",    None),
    (5,   "c-transforms, Duality, Entropy Regularization",                         "Sep 16, 2025",  "ii",    "own",    None),
    (6,   "Entropic OT, continued",                                                "Sep 18, 2025",  "ii",    "own",    None),
    (7,   "Sinkhorn Divergences",                                                  "Sep 23, 2025",  "ii",    "own",    None),
    (8,   "Dynamic OT, Part I",                                                    "Sep 25, 2025",  "ii",    "own",    None),
    (9,   "Dynamic OT, Part II",                                                   "Sep 30, 2025",  "ii",    "own",    None),
    (10,  "OT vs. Divergences",                                                    "Oct 2, 2025",   "ii",    "own",    None),
    (11,  "OT as a Loss Function",                                                 "Oct 7, 2025",   "ii",    "own",    None),
    (12,  "Sliced Optimal Transport",                                              "Oct 9, 2025",   "iii",   "guest",  "Kimia Nadjahi"),
    (13,  "Extensions",                                                            "Oct 14, 2025",  "iii",   "own",    None),
    (14,  "Riemannian Structure of W₂: Gradient Flows & Linearization",       "Oct 16, 2025",  "iii",   "guest",  "Katy Craig"),
    (15,  "OT for Graph Representation: Unsupervised Learning, Prediction & Neural Solvers", "Oct 21, 2025", "iii", "guest", "Rémi Flamary"),
    (16,  "Domain Adaptation: Old and New with Optimal Transport",                 "Oct 23, 2025",  "iv",    "guest",  "Nicolas Courty"),
    (17,  "Distributional Preference Alignment of LLMs via OT",                    "Nov 3, 2025",   "iv",    "guest",  "Youssef Mroueh"),
    (18,  "Optimal Transport and Flow Matching",                                   "Nov 6, 2025",   "iv",    "missing","Marco Cuturi"),
    (19,  "Gromov-Wasserstein Alignment: Statistics, Computation & Geometry",      "Nov 20, 2025",  "iv",    "guest",  "Ziv Goldfeld"),
    (20,  "Optimal Transport in Single Cell Biology",                              "Nov 25, 2025",  "iv",    "missing","Pınar Demetçi"),
]

SECTION_LABELS = {"i":"§I Fundamentals", "ii":"§II Computation",
                  "iii":"§III Generalizations", "iv":"§IV ML Applications"}

TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lecture {num:02d} — {title_plain} · CS 2840</title>
<link rel="stylesheet" href="../../assets/site/style.css">
</head>
<body>
<div class="viewer">
  <div class="viewer__topbar">
    <a href="../../">← CS 2840</a>
    <span>{section_label}</span>
  </div>

  <header class="viewer__header">
    <div>
      <div class="viewer__num">Lecture {num:02d}</div>
      <h1 class="viewer__title">{title}</h1>
    </div>
    <div class="viewer__meta">
      {date_html}
      {guest_html}
    </div>
  </header>

  <div class="viewer__frame">
{frame_body}
{end_overlay}
  </div>

  <div class="viewer__actions">
    {actions_row}
  </div>

  <nav class="viewer__prevnext" aria-label="Lecture navigation">
    <div>{prev_html}</div>
    <div>{next_html}</div>
  </nav>
</div>
<script src="../../assets/site/viewer.js"></script>
</body>
</html>
"""

END_OVERLAY_TEMPLATE = """    <div class="viewer__end" role="dialog" aria-label="End of slideshow">
      <button class="end-dismiss" type="button" aria-label="Dismiss">Dismiss &times;</button>
      <div class="end-eyebrow">End of Lecture {num:02d}</div>
      <h3 class="end-title">{title}</h3>
      <p class="end-sub">{end_sub}</p>
      <div class="end-actions">
{end_actions}
      </div>
    </div>"""

def esc(s): return _html.escape(s, quote=True) if s else ""

def frame_block(num, kind, title):
    num02 = f"{num:02d}"
    if kind == "own":
        src = f"../../assets/lectures/{num02}/index.html"
        return f'    <iframe src="{src}" title="Lecture {num}: {esc(title)} slides" allowfullscreen></iframe>'
    if kind == "guest":
        src = f"../../assets/guest-pdfs/lecture-{num02}.pdf"
        # Browsers render PDFs natively in iframes; the fallback link is in the actions row.
        return (f'    <iframe class="fallback-pdf" src="{src}#view=FitH" '
                f'title="Lecture {num}: {esc(title)} (guest PDF)"></iframe>')
    # missing
    return ('    <div class="unavailable">'
            '<h3>Slides unavailable</h3>'
            '<p>The guest speaker\'s slides were not shared for public release. '
            'See the student-scribed notes below for a lecture summary.</p>'
            '</div>')

def open_new_tab(num, kind):
    num02 = f"{num:02d}"
    if kind == "own":
        return f'<a href="../../assets/lectures/{num02}/index.html" target="_blank" rel="noopener">Open slides in new tab ↗</a>'
    if kind == "guest":
        return f'<a href="../../assets/guest-pdfs/lecture-{num02}.pdf" target="_blank" rel="noopener">Open PDF in new tab ↗</a>'
    return ""

def scribe_link(num):
    # Scribe notes exist for lectures 3-20.
    if num < 3: return ""
    return f'<a href="../../assets/scribes/Lecture_{num}.pdf" target="_blank" rel="noopener">Scribe notes (PDF) ↗</a>'

def actions_row(num, kind):
    links = []
    o = open_new_tab(num, kind)
    s = scribe_link(num)
    if o: links.append(o)
    if s: links.append(s)
    return '\n    <span class="sep" aria-hidden="true">·</span>\n    '.join(links)

def end_overlay(idx):
    """Build the post-slideshow panel (only for lectures with slide files)."""
    cur = LECTURES[idx]
    num, title, _date, _section, kind, _guest = cur
    if kind == "missing":
        return ""   # no slides → no end-of-show overlay
    actions = []
    if idx < len(LECTURES)-1:
        nxt = LECTURES[idx+1]
        actions.append(
            f'        <a class="end-btn end-btn--primary" href="../{nxt[0]:02d}/">'
            f'<span>Next lecture →</span>'
            f'<span class="meta">L{nxt[0]:02d} · {esc(nxt[1])}</span></a>'
        )
    actions.append(
        '        <a class="end-btn" href="../../">'
        '<span>← Course overview</span>'
        '<span class="meta">All 19 lectures</span></a>'
    )
    sub = ("You've reached the last slide." if idx < len(LECTURES)-1
           else "You've reached the final slide of the course.")
    return END_OVERLAY_TEMPLATE.format(
        num=num, title=esc(title), end_sub=sub, end_actions="\n".join(actions)
    )

def prev_next_block(idx):
    cur = LECTURES[idx]
    html = []
    if idx > 0:
        p = LECTURES[idx-1]
        html.append(f'<a href="../{p[0]:02d}/"><span class="label">Previous</span>Lecture {p[0]:02d} — {esc(p[1])}</a>')
    else:
        html.append("")
    if idx < len(LECTURES)-1:
        n = LECTURES[idx+1]
        html.append(f'<a href="../{n[0]:02d}/" style="text-align:right"><span class="label">Next</span>Lecture {n[0]:02d} — {esc(n[1])}</a>')
    else:
        html.append("")
    return html

def main():
    for i, (num, title, date, section, kind, guest) in enumerate(LECTURES):
        num02 = f"{num:02d}"
        d = LECTURES_DIR / num02
        d.mkdir(parents=True, exist_ok=True)
        guest_html = (f'<div class="guest">Guest: {esc(guest)}</div>' if guest else "")
        date_html  = f'<div>{esc(date)}</div>'
        prev_html, next_html = prev_next_block(i)
        content = TEMPLATE.format(
            num=num,
            title=esc(title),
            title_plain=esc(title),
            section_label=esc(SECTION_LABELS[section]),
            date_html=date_html,
            guest_html=guest_html,
            frame_body=frame_block(num, kind, title),
            end_overlay=end_overlay(i),
            actions_row=actions_row(num, kind),
            prev_html=prev_html,
            next_html=next_html,
        )
        (d / "index.html").write_text(content, encoding="utf-8")
        print(f"  wrote lectures/{num02}/index.html")
    print(f"Done ({len(LECTURES)} lectures).")

if __name__ == "__main__":
    main()
