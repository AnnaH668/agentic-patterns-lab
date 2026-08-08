# agentic-patterns-lab — the learning platform

The interactive web app. **This is the half you can just open and read** — no
install, no build step, no API key.

👉 **Live: [agentic-patterns-lab.vercel.app](https://agentic-patterns-lab.vercel.app/?lang=en)**
· [Project overview](../README.md) · [中文](../README.zh-CN.md)

---

## Open it

```bash
open index.html
```

That is the whole setup. It runs straight off the filesystem — no server, no
dependencies, no network requests of any kind.

## What is in here

| Path | What it is |
|---|---|
| `index.html` | The app shell and **all** of the CSS, inlined |
| `js/diagram.js` | The declarative SVG diagram engine — nodes, edges and steps in, an animated diagram out |
| `js/app.js` | Routing, bilingual rendering, progress tracking, quizzes |
| `js/data-part0.js` | Foundations — what an agent is, how to pick a framework |
| `js/data-part1.js` … `part4.js` | The book's 21 patterns |
| `js/data-part5.js` | Appendix A — prompting techniques |
| `js/data-build.js` | The build-path page, which maps onto `../agent-workshop/` |
| `js/glossary.js` | Term definitions for the hover tooltips |
| `build.py` | Inlines everything into a single portable file in `dist/` |
| `vercel.json` | Cache and security headers for the deployed site |

## Editing content

All the content lives in the `js/data-*.js` files as plain objects. Every
user-facing string is a `{zh, en}` pair, so nothing can be half-translated.

After editing, regenerate the single-file bundle:

```bash
python3 build.py
```

That writes `dist/index.html` (a self-contained copy you can email or open
offline) and `dist/artifact.html`.

## Two constraints worth knowing before you change anything

1. **No ES modules.** Scripts load through plain `<script src>` tags, because
   `import` is blocked by CORS under `file://` — and opening the file directly
   has to keep working.
2. **System fonts only.** No webfont requests, so the page renders identically
   offline and never phones home.

The site makes **zero external requests**. That is a property worth preserving:
it is why the page can be deployed publicly without a key, a backend, or a
privacy policy.
