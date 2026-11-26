"""Draw tex/signs.jpg (shop signs atlas) and tex/poster_snow.jpg.
Run once:  python blender/make_signs.py
The poster is our own design in a period style (not the film's artwork). The title and date are documented:
Hebrew Wikipedia, "קולנוע אסתר": opening week from 30.3.1939 with Snow White and the Seven Dwarfs."""
import math, os, random
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE, "signs_data.py"), encoding="utf-8").read())
OUT = os.path.join(HERE, "tex")
BOLD = r"C:\Windows\Fonts\FRANKB.TTF"          # Hebrew (no Latin glyphs)
LATIN = r"C:/Windows/Fonts/timesbd.ttf"


def rtl(s):
    """PIL here has no bidi support: reverse Hebrew strings, keeping runs of digits and dots readable."""
    import re
    return "".join(reversed(re.findall(r"[0-9.]+|.", s)))


def text(d, xy, s, size, fill, maxw=None, font=None):
    font = font or (BOLD if any("֐" <= ch <= "׿" for ch in s) else LATIN)
    f = ImageFont.truetype(font, size)
    if maxw:
        while d.textlength(s, font=f) > maxw and size > 12:
            size -= 4
            f = ImageFont.truetype(font, size)
    d.text(xy, s, font=f, fill=fill, anchor="mm")


atlas = Image.new("RGB", (ATLAS, ATLAS), WALL)
d = ImageDraw.Draw(atlas)
for key, (he, la, bg, fg, _src) in BOARDS.items():
    x, y, w, h = CELLS[key]
    d.rectangle((x, y, x + w, y + h), fill=bg)
    d.rectangle((x + 10, y + 10, x + w - 11, y + h - 11), outline=fg, width=4)
    if la:                                               # Hebrew on the right, Latin on the left
        text(d, (x + w * 0.73, y + h / 2 + 2), rtl(he), 92, fg, w * 0.44)
        text(d, (x + w * 0.26, y + h / 2 + 2), la, 84, fg, w * 0.42)
        d.ellipse((x + w * 0.495 - 7, y + h / 2 - 7, x + w * 0.495 + 7, y + h / 2 + 7), fill=fg)
    else:
        text(d, (x + w / 2, y + h / 2 + 2), rtl(he), 98, fg, w * 0.86)
for key, s in (("aw_eck_en", "ECKMANN"), ("aw_eck_he", rtl("אקמן"))):
    x, y, w, h = CELLS[key]
    d.rectangle((x, y, x + w, y + h), fill=(238, 234, 222))
    text(d, (x + w / 2, y + h * 0.68), s, 110, (30, 28, 26), w * 0.9)
x, y, w, h = CELLS["roof_pharmacy"]
text(d, (x + w * 0.73, y + h / 2), rtl("בית מרקחת"), 96, (34, 32, 30), w * 0.46)
text(d, (x + w * 0.26, y + h / 2), "PHARMACY", 90, (34, 32, 30), w * 0.46)
x, y, w, h = CELLS["banner_bergner"]
text(d, (x + w * 0.76, y + h / 2), rtl("אליזבת ברגנר"), 108, (38, 34, 34), w * 0.42)
text(d, (x + w * 0.27, y + h / 2), "ELIZABETH BERGNER", 100, (38, 34, 34), w * 0.50)
atlas.save(os.path.join(OUT, "signs.jpg"), quality=86)

# ---------- the poster ----------
W, H = 768, 1152
R = random.Random(1939)
p = Image.new("RGB", (W, H))
d = ImageDraw.Draw(p)
for j in range(H):                                       # night sky
    t = j / H
    d.line((0, j, W, j), fill=(int(14 + 40 * t), int(26 + 74 * t), int(66 + 78 * t)))
for _ in range(110):
    x, y, r = R.randrange(W), R.randrange(560), R.choice((1, 1, 2, 3))
    d.ellipse((x - r, y - r, x + r, y + r), fill=(250, 236, 180))
d.ellipse((W - 215, 330, W - 105, 440), fill=(252, 234, 160))
d.ellipse((W - 250, 312, W - 145, 418), fill=(31, 61, 107))
for layer, (base, col, n, hi) in enumerate(((820, (22, 62, 66), 16, 210), (900, (10, 40, 38), 12, 260))):
    for i in range(n):                                   # forest
        cx = int((i + R.random() * 0.8) * W / n)
        th = R.randint(hi // 2, hi)
        for k in range(4):
            yy = base - th + k * th // 4
            hw = 24 + k * 20
            d.polygon(((cx, yy), (cx - hw, yy + th // 3), (cx + hw, yy + th // 3)), fill=col)
        d.rectangle((0, base, W, H), fill=col)
ax, ay = W // 2, 650                                      # the apple
d.ellipse((ax - 150, ay - 125, ax + 30, ay + 130), fill=(176, 26, 28))
d.ellipse((ax - 30, ay - 125, ax + 150, ay + 130), fill=(190, 32, 30))
d.ellipse((ax - 105, ay - 85, ax - 55, ay - 15), fill=(240, 120, 100))
d.ellipse((ax - 105, ay - 108, ax + 105, ay + 140), fill=(184, 29, 28))
d.ellipse((ax - 105, ay - 85, ax - 55, ay - 15), fill=(240, 120, 100))
d.line((ax, ay - 108, ax + 14, ay - 175), fill=(70, 44, 22), width=14)
d.polygon(((ax + 14, ay - 150), (ax + 80, ay - 205), (ax + 118, ay - 160), (ax + 62, ay - 135)), fill=(72, 130, 56))
for i, col in enumerate(((214, 60, 40), (232, 156, 36), (236, 204, 60), (86, 150, 70), (52, 120, 160), (120, 80, 150), (190, 90, 60))):
    x = 84 + i * 100                                      # seven little hats
    d.polygon(((x - 40, 920), (x + 8, 822), (x + 22, 858), (x + 40, 920)), fill=col)
    d.ellipse((x - 48, 908, x + 48, 936), fill=col)
    d.ellipse((x - 3, 806, x + 25, 834), fill=(248, 240, 220))
gold = (250, 206, 72)
for dx, dy, col in ((6, 7, (90, 20, 14)), (0, 0, gold)):
    text(d, (W // 2 + dx, 195 + dy), rtl("שלגיה"), 250, col, W - 70)
    text(d, (W // 2 + dx, 345 + dy), rtl("ושבעת הגמדים"), 110, col, W - 90)
text(d, (W // 2, 50), rtl("סרט צבעוני של וולט דיסני"), 44, (240, 232, 210), W - 80)
d.rectangle((0, 960, W, H), fill=(238, 228, 200))
d.rectangle((0, 960, W, 972), fill=(176, 26, 28))
text(d, (W // 2, 1032), rtl("קולנוע כיכר דיזנגוף"), 84, (40, 24, 20), W - 60)
text(d, (W // 2, 1105), rtl("החל מ-30.3.1939"), 54, (150, 28, 26), W - 80)
d.rectangle((6, 6, W - 7, H - 7), outline=(238, 228, 200), width=10)
p.save(os.path.join(OUT, "poster_snow.jpg"), quality=88)
print("signs.jpg poster_snow.jpg")
