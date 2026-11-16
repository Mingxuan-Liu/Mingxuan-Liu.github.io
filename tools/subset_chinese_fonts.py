"""Build the self-hosted Chinese webfonts from the two original OFL font files."""

import argparse
from html.parser import HTMLParser
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = ROOT / "assets/fonts"


def build(source, family, text, output):
    font = TTFont(source, recalcTimestamp=False)
    options = subset.Options()
    options.name_IDs = ["*"]
    sub = subset.Subsetter(options=options)
    sub.populate(text=text)
    sub.subset(font)

    # Adobe reserves "Source". Give the modified fonts distinct family and
    # PostScript names, retaining the original copyright and license notices.
    ps_name = family.replace(" ", "") + "-Regular"
    names = font["name"]
    replacement = {1: family, 2: "Regular", 3: ps_name, 4: family, 6: ps_name,
                   16: family, 17: "Regular", 18: family, 21: family, 22: "Regular"}
    for record in names.names:
        if record.nameID in replacement:
            record.string = replacement[record.nameID].encode(record.getEncoding())
    if "CFF " in font:
        cff = font["CFF "].cff
        cff.fontNames[0] = ps_name
        top = cff.topDictIndex[0]
        top.FamilyName = top.FullName = family
        for i, fd in enumerate(getattr(top, "FDArray", [])):
            if hasattr(fd, "FontName"):
                fd.FontName = f"{ps_name}-{i}"

    font.flavor = "woff2"
    font.save(FONT_DIR / output)


class EditorialHeadings(HTMLParser):
    def __init__(self):
        super().__init__()
        self.element = None
        self.text = ""

    def handle_starttag(self, tag, attrs):
        classes = (dict(attrs).get("class") or "").split()
        if tag in {"h1", "h2"} or "hero-question" in classes:
            self.element = tag

    def handle_endtag(self, tag):
        if tag == self.element:
            self.element = None

    def handle_data(self, data):
        if self.element:
            self.text += data


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sans", type=Path, help="Source Han Sans SC Regular OTF")
    parser.add_argument("serif", type=Path, help="Source Han Serif SC or CN Medium")
    args = parser.parse_args()
    pages = sorted((ROOT / "zh").rglob("*.html"))
    scripts = [ROOT / "js/site.js", ROOT / "js/research.js"] + sorted(
        (ROOT / "assets/multiphase/2048/interactive").glob("*.js")
    )
    # UI messages also contain characters that are absent from the static HTML.
    subtitles = sorted((ROOT / "assets").rglob("*.zh.vtt"))
    content = "".join(p.read_text() for p in pages + scripts + subtitles)
    content += "，。！？：；、“”‘’（）《》〈〉【】…—＋−×αβρΔη"
    build(args.sans, "Mingxuan Site Sans", content, "site-sans-sc.woff2")
    headings = EditorialHeadings()
    for page in pages:
        headings.feed(page.read_text())
    build(args.serif, "Mingxuan Site Serif", headings.text, "site-serif-sc.woff2")
