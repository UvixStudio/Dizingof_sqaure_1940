"""Textures for the colonnades (run once; needs Pillow):
tex/column.png         plaster with painted light: u turns round the column (0.5 = lit side), v from floor to ceiling
tex/column_shadow.png  the soft round shadow on the paving under each column
In the shade the site lights every upright surface alike, so the roundness has to be in the picture."""
import math, os
from PIL import Image

TEX = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tex")
PLASTER = (227, 224, 216)
HIGH = 3.45                                               # a column's height in metres, for the dark ends

W, H = 128, 256
im = Image.new("RGB", (W, H))
for y in range(H):
    z = (1 - (y + .5) / H) * HIGH
    ends = 1 - .30 * math.exp(-z / .16) - .26 * math.exp(-(HIGH - z) / .34)
    for x in range(W):
        facing = math.cos(((x + .5) / W - .5) * math.tau)
        light = (.70 + .40 * max(0.0, .5 + .5 * facing) ** 1.4) * ends
        im.putpixel((x, y), tuple(min(255, round(c * light)) for c in PLASTER))
im.save(os.path.join(TEX, "column.png"))

S = 128
dot = Image.new("RGBA", (S, S))
for y in range(S):
    for x in range(S):
        r = math.hypot(x + .5 - S / 2, y + .5 - S / 2) / (S / 2)
        if r <= 24 / 64:
            a = .55
        elif r <= 24 / 64 + (1 - 24 / 64) * .45:
            a = .55 + (.28 - .55) * (r - 24 / 64) / ((1 - 24 / 64) * .45)
        else:
            a = max(0.0, .28 * (1 - r) / ((1 - 24 / 64) * .55))
        dot.putpixel((x, y), (20, 16, 12, round(255 * a)))
dot.save(os.path.join(TEX, "column_shadow.png"))
print("column.png column_shadow.png")
