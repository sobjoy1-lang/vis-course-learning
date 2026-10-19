"""Build the course search index and attach the additive learning tools."""
import json
import re
from html.parser import HTMLParser
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"


class Sections(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sections = []
        self.current = None
        self.stack = []
        self.hidden = 0
        self.title_depth = 0

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        excluded = attrs.get("data-lang") == "en-US" or tag in ("script", "style")
        if tag not in ("meta", "link", "input", "img", "br", "hr", "source", "wbr"):
            self.stack.append((tag, excluded))
            if excluded:
                self.hidden += 1
        if tag == "article" and "chapter" in attrs.get("class", "").split():
            self.current = {"anchor": attrs["id"], "text": [], "title": []}
        if self.current and tag == "h2":
            self.title_depth += 1
            self.current["titleKey"] = attrs.get("data-i18n", "")

    def handle_endtag(self, tag):
        if tag == "h2" and self.title_depth:
            self.title_depth -= 1
        if tag == "article" and self.current:
            self.current["text"] = re.sub(r"\s+", " ", " ".join(self.current["text"])).strip()
            self.current["title"] = re.sub(r"\s+", " ", " ".join(self.current["title"])).strip()
            self.sections.append(self.current)
            self.current = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                removed = self.stack[i:]
                self.hidden -= sum(item[1] for item in removed)
                self.stack = self.stack[:i]
                break

    def handle_data(self, data):
        if self.current and not self.hidden:
            self.current["text"].append(data)
            if self.title_depth:
                self.current["title"].append(data)


chapters = []
sections = []
titles = ["数据", "数据可视化流程", "色彩专题", "低维数据可视化", "时序数据可视化"]
titles_en = ["Data", "Data Visualization Pipeline", "Color", "Low-Dimensional Visualization", "Time-Series Visualization"]
title_translations = dict(re.findall(r"'(sec-\d{2}-\d+\.title)':\s*'([^']*)'", (DIST / "i18n.js").read_text(encoding="utf-8")))
for chapter, title in enumerate(titles, 1):
    relative = f"lesson-{chapter:02d}/"
    page = DIST / relative / "index.html"
    parser = Sections()
    parser.feed(page.read_text(encoding="utf-8"))
    chapters.append({"id": chapter, "title": f"第 {chapter} 章 · {title}", "titleEn": f"Chapter {chapter} · {titles_en[chapter-1]}", "url": relative})
    english = json.loads((DIST / relative / "en_blocks.json").read_text(encoding="utf-8"))
    for section in parser.sections:
        url = f"{relative}#{section['anchor']}"
        english_text = " ".join(block.get("en", "") for block in english if block.get("chapter") == section["anchor"])
        english_text = re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", english_text))).strip()
        sections.append({"id": url, "chapter": chapter, "chapterTitle": chapters[-1]["title"],
                         "title": section["title"], "titleEn": title_translations.get(section.get("titleKey", ""), ""),
                         "url": url, "text": section["text"], "textEn": english_text})

learning = DIST / "learning"
learning.mkdir(exist_ok=True)
(learning / "search-index.json").write_text(json.dumps({"version": 1, "chapters": chapters, "sections": sections}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

for page in [DIST / "index.html"] + [DIST / f"lesson-{i:02d}" / "index.html" for i in range(1, 6)]:
    text = page.read_text(encoding="utf-8")
    prefix = "./" if page.parent == DIST else "../"
    stylesheet = f'<link rel="stylesheet" href="{prefix}learning/tools.css" data-learning-extension />'
    script = f'<script type="module" src="{prefix}learning/tools.js" data-learning-extension></script>'
    if "data-learning-extension" not in text:
        text = text.replace("</head>", stylesheet + "\n</head>", 1)
        text = text.replace("</body>", script + "\n</body>", 1)
        page.write_text(text, encoding="utf-8", newline="")
print(f"Prepared {len(chapters)} chapters, {len(sections)} sections; extension attached to 6 pages.")
