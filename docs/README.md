# docs — images used by the README

No documentation lives here, only image assets. The written docs are
[`../README.md`](../README.md), [`../README.zh-CN.md`](../README.zh-CN.md) and
[`../agent-workshop/README.md`](../agent-workshop/README.md).

| Path | Used by |
|---|---|
| `screenshots/en/` | the English README — screenshots of the app in English |
| `screenshots/` | the Chinese README — the same views in Chinese |
| `social-preview.png` | GitHub → Settings → Social preview (English) |
| `social-preview.zh-CN.png` | the Chinese alternative, kept in case the repo is ever repositioned |

The two screenshot sets exist because an English README illustrated with a
Chinese interface quietly contradicts the claim that the app is bilingual.

## Regenerating them

They are captured from the built single-file app with headless Chrome, so they
always match what is actually deployed:

```bash
cd ../agentic-patterns-lab && python3 build.py
```

Two things make this fussier than it looks, both worked around rather than
fought:

- **Language and theme must be set through `localStorage`**, not by putting
  attributes on `<html>`. The app clears `data-theme` on boot when the visitor
  has expressed no preference — that is correct "follow the OS" behaviour, and
  it will undo anything you hard-code into the markup.
- **Mobile shots are taken inside a 390px `<iframe>`.** Headless Chrome enforces
  a minimum window width, so `--window-size=390` lays the page out wider and then
  crops — which looks exactly like a CSS overflow bug and is not one.
