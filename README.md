# CS 2840 — Optimal Transport for Machine Learning

Public course site for **CS 2840: Computational Optimal Transport for Machine Learning** — Harvard SEAS, Fall 2025, taught by David Alvarez-Melis.

The visual identity (dark canvas, point-cloud wordmark, muted amber/salmon accents) mirrors the Keynote decks. The landing page re-draws the title-slide "CS 2840" point cloud as a Wasserstein interpolation between source and target distributions. The lecture navigator renders the course as a geodesic between those same distributions.

## Status

**Private draft.** Every page carries `<meta name="robots" content="noindex,nofollow">`. Remove those tags site-wide before the public announce.

## Structure

```
├── index.html             Landing + geodesic lecture navigator
├── lectures/01..19/       Per-lecture viewer pages (generated)
├── syllabus/              Course description + embedded Fall '25 PDF
├── readings/              Textbooks and per-section references
├── scribes/               Student-scribed lecture notes index
├── extras/                Bonus material (planned)
├── assets/
│   ├── lectures/NN/       Keynote HTML exports (iframed in viewers)
│   ├── guest-pdfs/        Guest-lecture PDFs
│   ├── scribes/           Scribe-note PDFs
│   ├── syllabus/          Syllabus PDF
│   └── site/              style.css, lectures.js, hero.js, geodesic.js
└── scripts/
    └── gen_lecture_pages.py   Regenerates lectures/NN/index.html from metadata
```

## Content pipeline

**Keynote → HTML**

1. Open the `.key` file in Keynote.
2. `File → Export To → HTML…`
3. Keep *Include navigation controls* off (the viewer provides its own).
4. Output into `assets/lectures/NN/`.
5. Inject the course watermark (one `<style>` and one `<div>`; see the pattern already present in `assets/lectures/01/index.html`).

**Regenerate per-lecture viewer pages**

```sh
python3 scripts/gen_lecture_pages.py
```

Edit the `LECTURES` list at the top of that script to change titles, dates, or add new lectures.

## Local preview

```sh
python3 -m http.server 8000
# → http://localhost:8000/
```

## Hosting

GitHub Pages from `main`. If/when the repo starts bumping GitHub's 1 GB soft limit, migrate to Cloudflare Pages (static deploy, same source).

## Open items before public flip

- Decide whether to include the L1 recording (`Lecture1.mov`, ~120 MB) as an embedded video.
- Confirm guest-lecture speakers are OK with public sharing (6 PDFs).
- Chase L18 slides (Marco Cuturi — currently rendered as "slides unavailable").
- Pick a custom domain, if any.
- Remove `noindex` meta tags; submit sitemap.
