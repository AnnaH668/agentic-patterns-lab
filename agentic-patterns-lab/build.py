#!/usr/bin/env python3
"""Bundle the app into self-contained single files.

    dist/index.html     full HTML document — double-click to open offline
    dist/artifact.html  same page without the <html>/<head>/<body> scaffolding,
                        which the Artifact publisher supplies itself

Standard library only:

    python3 build.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "index.html"
OUT_DIR = ROOT / "dist"
OUT = OUT_DIR / "index.html"
OUT_ARTIFACT = OUT_DIR / "artifact.html"

SCRIPT_SRC = re.compile(r'[ \t]*<script src="([^"]+)"></script>\n?')


def inline(match):
    path = ROOT / match.group(1)
    code = path.read_text(encoding="utf-8")
    # A literal </script> inside a string would close the tag early.
    code = code.replace("</script>", "<\\/script>")
    return f"<script>\n{code}\n</script>\n"


def strip_document_scaffolding(html):
    """Keep <title>, <style> and everything in <body>; drop the outer document.

    The Artifact publisher wraps the file in its own doctype/head/body, so those
    tags must not appear here. <meta charset> and <meta viewport> come from the
    wrapper too.
    """
    head = re.search(r"<head>(.*?)</head>", html, re.S).group(1)
    body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)
    head = re.sub(r"[ \t]*<meta[^>]*>\n?", "", head)
    return f"{head.strip()}\n\n{body.strip()}\n"


def main():
    html = SRC.read_text(encoding="utf-8")
    html, n = SCRIPT_SRC.subn(inline, html)

    OUT_DIR.mkdir(exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    OUT_ARTIFACT.write_text(strip_document_scaffolding(html), encoding="utf-8")

    for f in (OUT, OUT_ARTIFACT):
        print(f"{f.relative_to(ROOT)}  {f.stat().st_size / 1024:>6.0f} KB")
    print(f"({n} scripts inlined)")


if __name__ == "__main__":
    main()
