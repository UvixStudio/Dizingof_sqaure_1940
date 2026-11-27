"""Typeset the shop signs as standalone PNGs for review, separate from the scene atlas.

Run with Python and Pillow. Pass bay IDs to redraw only those signs.
Source illustrations live in the sign folder's sources subdirectory.
"""

import json
import os
import re
import runpy
import sys
from functools import lru_cache
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


HERE = Path(__file__).resolve().parent
SIGN_DIR = HERE.parent / "data" / "research_images" / "3d stores" / "signs"
PREVIEW = HERE / "preview" / "shops"
FONT_DIR = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts"
WIDTH, HEIGHT = 1536, 240
HALF = HEIGHT // 2

FONTS = {
    "frank": "FRANKB.TTF", "david": "davidbd.ttf", "block": "NARKBMB.TTF",
    "narrow": "Narkblcb.ttf", "hand": "GYADBR.TTF", "pen": "GYADL.TTF",
    "brush": "CaligraphMedium.TTF", "sans": "arialbd.ttf",
    "roman": "timesbd.ttf", "decoLatin": "CASTELAR.TTF",
    "plainLatin": "GILB____.TTF",
}

# Lettering, panel treatment, and illustration, chosen per shop rather than per bay order.
ART = {
    "eckmann": ("david", "deco", "bag"), "amanut": ("hand", "seal", "cup"),
    "flowers": ("hand", "painter", "flowers"), "galor": ("narrow", "steps", "lamp"),
    "pharmacy": ("frank", "enamel", "mortar"),
    "A1": ("frank", "seal", "deli"), "A3": ("narrow", "plaque", "shoe"),
    "A4": ("hand", "painter", "bread"), "A5": ("brush", "notch", "candy"),
    "A6": ("block", "enamel", "produce"), "F0": ("pen", "rules", "bread"),
    "F1": ("narrow", "steps", "hat"), "F2": ("david", "plaque", "book"),
    "F3": ("frank", "deco", "watch"), "F4": ("hand", "seal", "dog"),
    "B3": ("narrow", "notch", "cloth"), "B4": ("frank", "rules", "hat"),
    "B5": ("narrow", "seal", "watch"), "E0": ("pen", "painter", "flowers"),
    "E1": ("sans", "notch", "icecream"), "E2": ("block", "steps", "watch"),
    "E3": ("brush", "enamel", "deli"), "E4": ("hand", "rules", "plate"),
    "E5": ("frank", "deco", "shoe"), "E6": ("block", "notch", "camera"),
    "E7": ("frank", "plaque", "cloth"), "E8": ("brush", "painter", "siphon"),
    "E9": ("david", "enamel", "deli"), "D0": ("sans", "steps", "cloth"),
    "D1": ("brush", "notch", "produce"), "D4": ("block", "plaque", "dog"),
    "D5": ("frank", "enamel", "book"), "D6": ("pen", "seal", "plate"),
    "D7": ("hand", "painter", "candy"), "D8": ("narrow", "plaque", "plane"),
    "D10": ("brush", "seal", "icecream"), "C1": ("block", "deco", "citrus"),
    "C2": ("david", "rules", "bread"), "C3": ("pen", "notch", "cloth"),
    "C4": ("sans", "steps", "shoe"), "C5": ("narrow", "deco", "camera"),
    "C6": ("block", "enamel", "plane"), "C7": ("hand", "rules", "hat"),
    "C8": ("narrow", "plaque", "book"),
}

BILINGUAL = {
    "eckmann": "decoLatin", "galor": "plainLatin", "pharmacy": "roman",
}

SHEETS = {
    "food_emblems.png": (3, (
        "cup", "deli", "bread", "produce", "candy", "siphon", "icecream", "plate", "citrus",
    )),
    "retail_emblems.png": (4, (
        "lamp", "mortar", "shoe", "watch", "book", "hat", "camera", "plane", "flowers", "dog", "cloth", "bag",
    )),
}


def mix(a, b, amount):
    return tuple(round(x + (y - x) * amount) for x, y in zip(a, b))


def visual_hebrew(value):
    # These project names use unpointed Hebrew. Keep numbers and their punctuation together.
    return "".join(reversed(re.findall(r"[0-9.]+|.", value)))


@lru_cache(maxsize=None)
def font(style, size):
    return ImageFont.truetype(str(FONT_DIR / FONTS[style]), size)


def text(image, value, style, at, box, color, *, hebrew=True, depth=None):
    value = visual_hebrew(value) if hebrew else value
    f = font(style, 224)
    left, top, right, bottom = f.getbbox(value)
    ink = Image.new("L", (right - left, bottom - top))
    ImageDraw.Draw(ink).text((-left, -top), value, font=f, fill=255)
    ink.thumbnail(box, Image.Resampling.LANCZOS)
    x = round(at[0] - ink.width / 2)
    y = round(at[1] - ink.height / 2)
    if depth:
        image.paste(depth, (x + 3, y + 3), ink)
    image.paste(color, (x, y), ink)
    return ink.width


def load_emblems():
    marks = {}
    for file, (cols, names) in SHEETS.items():
        with Image.open(SIGN_DIR / "sources" / file) as source:
            sheet = source.convert("L")
        rows = len(names) // cols
        for i, name in enumerate(names):
            row, col = divmod(i, cols)
            tile = sheet.crop((col * sheet.width // cols, row * sheet.height // rows,
                               (col + 1) * sheet.width // cols, (row + 1) * sheet.height // rows))
            ink = tile.point(lambda level: max(0, min(255, (240 - level) * 2)))
            bounds = ink.getbbox()
            if not bounds:
                raise ValueError(f"Empty emblem for {name} in {file}")
            marks[name] = ink.crop(bounds)
    for name in ("gila", "shalman"):
        with Image.open(SIGN_DIR / "sources" / f"{name}_emblem.png") as source:
            icon = source.convert("RGBA")
        alpha = icon.getchannel("A")
        if alpha.getextrema()[0] >= 250 or not alpha.getbbox():
            raise ValueError(f"Expected a transparent, nonempty emblem for {name}")
        marks[name] = icon.crop(alpha.getbbox())
    return marks


def frame(draw, style, fg, accent):
    w, h = WIDTH, HEIGHT
    if style == "enamel":
        draw.rectangle((8, 8, w - 9, h - 9), outline=fg, width=6)
        draw.rectangle((20, 20, w - 21, h - 21), outline=accent, width=2)
    elif style == "deco":
        for pad, color in ((8, fg), (20, accent)):
            cut = 32 + pad
            outline = [(cut, pad), (w-cut, pad), (w-pad, cut), (w-pad, h-cut),
                       (w-cut, h-pad), (cut, h-pad), (pad, h-cut), (pad, cut)]
            draw.line([*outline, outline[0]], fill=color, width=4, joint="curve")
    elif style == "seal":
        draw.rectangle((0, 0, w, 8), fill=fg)
        draw.rectangle((0, h - 9, w, h), fill=fg)
        draw.line((17, 22, w - 17, 22), fill=accent, width=3)
        draw.line((17, h-23, w - 17, h-23), fill=accent, width=3)
    elif style == "steps":
        for inset, offset in ((18, 42), (46, 57), (74, 72)):
            draw.line((inset, 15, w - inset, 15), fill=accent, width=2)
            for y in (offset, h - offset):
                draw.line((16, y, inset + 26, y), fill=fg, width=5)
                draw.line((w - inset - 26, y, w - 16, y), fill=fg, width=5)
        draw.line((18, h-16, w-18, h-16), fill=accent, width=2)
    elif style == "painter":
        draw.line((14, 13, w-16, 13), fill=accent, width=4)
        draw.line((14, h-14, w-16, h-14), fill=fg, width=6)
        draw.line((14, h-14, 14, h-61), fill=fg, width=6)
        draw.line((w-16, h-14, w-16, h-61), fill=fg, width=6)
    elif style == "notch":
        draw.rectangle((5, 5, w-6, h-6), outline=accent, width=3)
        for x in (15, w-21):
            draw.rectangle((x, 17, x+6, h-17), fill=fg)
            for y in (24, h-25):
                draw.ellipse((x-6, y-6, x+12, y+6), fill=fg)
    elif style == "plaque":
        draw.rounded_rectangle((9, 8, w-10, h-9), radius=22, outline=fg, width=5)
        for x in (27, w-27):
            draw.ellipse((x-5, HALF-5, x+5, HALF+5), fill=accent)
    else:  # rules
        for y in (13, h-14):
            draw.line((74, y, w-74, y), fill=fg, width=5)
            draw.rectangle((26, y-3, 60, y+3), fill=accent)
            draw.rectangle((w-60, y-3, w-26, y+3), fill=accent)


def emblem(image, ink, x, y, max_size, fg=None):
    icon = ink.copy()
    icon.thumbnail(max_size, Image.Resampling.LANCZOS)
    position = (round(x-icon.width/2), round(y-icon.height/2))
    if fg is None:
        image.paste(icon, position, icon.getchannel("A"))
    else:
        image.paste(fg, position, icon)


def design(key, title, subtitle, latin, bg, fg, marks):
    lettering, treatment, icon = ART[key]
    accent = mix(fg, bg, .58)
    image = Image.new("RGB", (WIDTH, HEIGHT), bg)
    draw = ImageDraw.Draw(image)
    if key == "flowers":
        coral, ochre = (228, 149, 133), (228, 180, 93)
        draw.rounded_rectangle((8, 8, WIDTH-9, HEIGHT-9), radius=32, outline=coral, width=5)
        draw.line((49, 22, WIDTH-50, 22), fill=accent, width=2)
        draw.line((48, HEIGHT-23, WIDTH-49, HEIGHT-23), fill=ochre, width=3)
        emblem(image, marks["gila"], 273, HALF, (370, 188))
        text(image, title, lettering, (955, HALF-5), (875, 107), fg, depth=(13, 62, 57))
        draw.arc((620, 168, 1290, 197), 5, 175, fill=ochre, width=4)
        return image
    if key == "F3":
        bezel = (132, 167, 166)
        frame(draw, treatment, fg, bezel)
        emblem(image, marks["shalman"], 271, HALF, (252, 185))
        draw.line((505, 48, 505, 191), fill=bezel, width=3)
        text(image, title, lettering, (950, 89), (780, 99), fg)
        sub_width = text(image, subtitle, "sans", (950, 175), (500, 44), (224, 221, 191))
        for side in (-1, 1):
            start = 950 + side * (sub_width / 2 + 27)
            draw.line((start, 175, start + 112*side, 175), fill=bezel, width=3)
        return image
    frame(draw, treatment, fg, accent)
    if latin:
        latin_box = (490, 88) if key == "galor" else (515, 100)
        hebrew_box = (480, 102) if key == "galor" else (505, 116)
        text(image, latin, BILINGUAL[key], (360, HALF), latin_box, fg, hebrew=False)
        text(image, title, lettering, (1177, HALF), hebrew_box, fg)
        emblem(image, marks[icon], 768, HALF, (144, 122), fg)
        return image

    icon_left = treatment in ("seal", "plaque", "painter", "notch")
    icon_x = 187 if icon_left else WIDTH - 187
    center = WIDTH / 2 + (104 if icon_left else -104)
    if treatment == "seal":
        draw.ellipse((icon_x-83, HALF-83, icon_x+83, HALF+83), outline=fg, width=4)
        emblem(image, marks[icon], icon_x, HALF, (113, 113), fg)
    elif treatment == "notch":
        draw.polygon([(icon_x-88, HALF), (icon_x, 32), (icon_x+88, HALF), (icon_x, 208)], fill=mix(bg, fg, .16))
        emblem(image, marks[icon], icon_x, HALF, (117, 105), fg)
    else:
        emblem(image, marks[icon], icon_x, HALF, (180, 149), fg)

    if not subtitle:
        text(image, title, lettering, (center, HALF), (1080, 133), fg)
        return image

    title_y = 92 if treatment in ("painter", "notch", "seal") else 88
    title_box = (1010, 86) if lettering in ("block", "narrow", "sans") else (1070, 97)
    text(image, title, lettering, (center, title_y), title_box, fg,
         depth=accent if treatment in ("steps", "painter") else None)
    sub_width = text(image, subtitle, "sans" if lettering in ("hand", "pen", "brush") else "david",
                     (center, 175), (700, 49), fg)
    if treatment in ("plaque", "rules", "painter"):
        offset = sub_width / 2 + 20
        for side in (-1, 1):
            draw.line((center + side*offset, 175, center + side*(offset+87), 175), fill=accent, width=4)
    return image


def main():
    source = runpy.run_path(str(HERE / "signs_data.py"))
    selected = set(sys.argv[1:]) or source["SIGNS"].keys()
    unknown = selected - source["SIGNS"].keys()
    if unknown:
        raise ValueError(f"Unknown sign bays: {sorted(unknown)}")
    marks = load_emblems()
    preview_dir = PREVIEW / "signs"
    preview_dir.mkdir(parents=True, exist_ok=True)
    records = {}
    for bay, key in source["SIGNS"].items():
        if key in source["BOARDS"]:
            title, latin, bg, fg, _ = source["BOARDS"][key]
            subtitle = ""
        else:
            title, subtitle, (bg, fg), _ = source["NAMED"][key]
            latin = ""
        filename = f"{bay}.png"
        if bay in selected:
            image = design(key, title, subtitle, latin, bg, fg, marks)
            for folder in (SIGN_DIR, preview_dir):
                image.save(folder / filename, optimize=True)
        records[bay] = {"title": title, "subtitle": subtitle, "latin": latin, "image": f"signs/{filename}"}
    (PREVIEW / "signs.js").write_text(
        "const shopSigns = " + json.dumps(records, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8"
    )
    print(f"Wrote {len(selected)} shop signs at {WIDTH} × {HEIGHT}.")


if __name__ == "__main__":
    main()
