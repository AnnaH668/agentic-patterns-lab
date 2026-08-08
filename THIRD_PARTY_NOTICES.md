# Third-Party Notices

This project's own licenses ([MIT](LICENSE) for code, [CC BY 4.0](LICENSE-CONTENT.md)
for the written content) cover **only material originating in this repository**.
Everything listed below belongs to someone else and is not covered by them.

---

## Agentic Design Patterns (the book)

This project references concepts and terminology discussed in:

**Antonio Gulli, _Agentic Design Patterns: A Hands-On Guide to Building Intelligent
Systems_.**

The book — its text, figures, cover artwork and other original materials — is **not**
licensed under this repository's licenses, and nothing here should be read as granting
any rights to it.

This repository is an independent educational project. It is **not affiliated with,
endorsed by, or sponsored by Antonio Gulli, Google, Springer Nature, or their
affiliates.**

### What this repository does and does not contain

**Does not contain:**

- The book, in any format (PDF, EPUB, scans).
- Full chapter text, large extracted passages, raw OCR, or transcriptions.
- Photographs or screenshots of interior book pages.
- The book's cover artwork.
- Reproductions of the book's figures.

`agent-workshop/step0_prepare_book.py` can turn a PDF into local search chunks, but it
reads a file **you** supply from **your own** machine. Its output directory (`data/`) is
listed in `.gitignore` and has never been committed — see
[Copyright / content policy](README.md#copyright--content-policy).

**Does contain, as factual references:**

- Pattern names, chapter names and the book's canonical terminology.
- Page numbers pointing back to the original, so readers can verify claims.
- The reference lists cited by each chapter (pointers to third-party papers and docs).

Explanations, analogies, diagrams, exercises, quiz questions and code in this repository
are independently written. The section structure is this project's own and does not
follow the book's chapter skeleton.

---

## Third-party papers, documentation and links

Pattern pages link out to primary sources — arXiv papers, framework documentation,
vendor guides. Those works belong to their respective authors and publishers. This
project links to them and names them; it does not reproduce or redistribute them.

---

## Third-party code

The Python workshop depends on the following packages, each under its own license:

| Package | Purpose |
|---|---|
| `anthropic` | Official Anthropic API SDK |
| `python-dotenv` | Loads the local `.env` |
| `pypdf` | PDF text extraction |
| `numpy` | Vector math for the hand-written retrieval |

They are declared in `agent-workshop/requirements.txt` and installed from PyPI; no
third-party source is vendored into this repository.

The code examples shown in the learning platform and the scripts in `agent-workshop/`
were written for this project. They are **not** copied from the book. Where a snippet
shows a library's documented API (for example the shape of an Anthropic SDK call), that
API shape is factual usage, not authored content.

If code adapted from a third-party source is ever added, it must:

1. keep its original copyright notice;
2. keep its original license notice;
3. be identified here, with its source file or URL;
4. not be relicensed unless its own license permits it.

---

## Images

Every image in `docs/` is a screenshot of **this project's own interface**, produced by
this repository. No third-party artwork, book cover, or book figure is bundled here.

---

*If you believe something in this repository infringes your rights, please open an issue
and it will be addressed.*
