"""Fit the shopfront artwork to the bays: data/research_images/3d stores/Sxx_*.png -> tex/shops/Sxx.jpg
Run after new artwork arrives:  python blender/make_shopfronts.py   (the PNG files stay the sources)

A panel is one bay, 4.2 x 3.4 m, but the columns leave about 3.62 m of it in view. So the whole drawing is
scaled into that width in its own proportions (about 2.4 m high), and the rest is plain wall."""
import glob, os
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "data", "research_images", "3d stores")
OUT = os.path.join(HERE, "tex", "shops")
GLOW = os.path.join(HERE, "tex", "shops_glow")                     # the same panel, black wherever it is plaster
W, H = 1024, 829                                   # 4.2 x 3.4 m
ART = (round(W * 3.62 / 4.2), round(W * 3.62 / 4.2 / 1.5))        # the drawing's own 3:2, never stretched
WALL = (227, 224, 217)                             # the plaster of the ring blocks


def plaster_gain(art):
    """How far the drawing's own wall (the pale strip along the bottom) is from the building's."""
    strip = art.crop((0, art.height - 45, art.width, art.height - 4))
    pale = [p for p in strip.getdata() if min(p) > 150 and max(p) - min(p) < 50]
    if len(pale) < 500:
        return (1.0, 1.0, 1.0)
    mid = [sorted(p[i] for p in pale)[len(pale) // 2] for i in range(3)]
    return tuple(min(1.1, max(0.92, w / m)) for w, m in zip(WALL, mid))


def recess(panel):
    """A sunken rectangle in the blank plaster above the shop, painted: shade under its upper lip, light on the sill."""
    x, y, w, h = 104, 52, 816, 152
    layer = Image.new("RGBA", panel.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)

    def band(box, colour):
        d.rectangle([box[0], box[1], box[2] - 1, box[3] - 1], fill=colour)

    band((x, y, x + w, y + h), (212, 208, 199, 255))
    panel.paste(layer, (0, 0), layer)
    shade = Image.new("RGBA", panel.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(shade)
    for i in range(40):                                       # shade falling from the upper edge
        t = i / 39
        c = (150, 145, 136, 255) if t == 0 else (150 + int(32 * min(1, t / .35)), 145 + int(32 * min(1, t / .35)),
                                                  136 + int(32 * min(1, t / .35)), 255 if t <= .35 else int(255 * (1 - (t - .35) / .65)))
        band((x, y + i, x + w, y + i + 1), c)
    panel.paste(shade, (0, 0), shade)
    side = Image.new("RGBA", panel.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(side)
    for i in range(22):                                       # and a thinner one along the left side
        band((x + i, y, x + i + 1, y + h), (120, 114, 104, int(140 * (1 - i / 21))))
    panel.paste(side, (0, 0), side)
    edge = ImageDraw.Draw(panel)
    for box, colour in (((x + w - 7, y + 4, x + w, y + h), (238, 236, 230)), ((x - 3, y - 4, x + w + 3, y), (150, 145, 136)),
                        ((x - 3, y + h, x + w + 3, y + h + 6), (246, 244, 238)), ((x - 3, y + h + 6, x + w + 3, y + h + 11), (188, 184, 175))):
        edge.rectangle([box[0], box[1], box[2] - 1, box[3] - 1], fill=colour)


def plaster(panel, art_box):
    """The pale plaster the artwork has round its own shop front: what connects to the top and side edges.
    (Not seeded from the bottom, where an open door shows a pale floor.) -> mask over the art box."""
    art = panel.crop(art_box).convert("RGB")
    w, h = art.size
    px = art.load()
    sides = [px[u, v] for u in (3, 6, w - 4, w - 7) for v in range(h // 8, h * 7 // 8, 6)]
    own = [sorted(p[i] for p in sides)[len(sides) // 2] for i in range(3)]       # this drawing's plaster colour

    def pale(u, v):
        p = px[u, v]
        return min(p) > 150 and max(p) - min(p) < 52 and sum((p[i] - own[i]) ** 2 for i in range(3)) < 46 ** 2

    seen = bytearray(w * h)
    todo = [(u, 0) for u in range(w)] + [(u, v) for v in range(h) for u in (0, w - 1)]
    todo = [(u, v) for u, v in todo if pale(u, v)]
    for u, v in todo:
        seen[v * w + u] = 255
    while todo:
        u, v = todo.pop()
        for a, b in ((u - 1, v), (u + 1, v), (u, v - 1), (u, v + 1)):
            if 0 <= a < w and 0 <= b < h and not seen[b * w + a] and pale(a, b):
                seen[b * w + a] = 255
                todo.append((a, b))
    # the low pale plinth under the windows: from the bottom edge up, column by column, kept only where it runs
    # level for a good width (a floor seen through a door breaks into short pieces, a counter stands taller)
    def light(u, v):
        p = px[u, v]
        return min(p) > 160 and max(p) - min(p) < 56

    runs = []
    for u in range(w):
        v = h - 1
        while v > h - 9 and not light(u, v):                  # a thin dark line along the very bottom
            v -= 1
        top = v
        while top >= 0 and light(u, top):
            top -= 1
        high = h - 1 - top
        runs.append((top + 1, v) if 12 <= high <= h * .23 else None)
    start = 0
    for u in range(1, w + 1):
        if u < w and runs[u] and runs[u - 1] and abs(runs[u][0] - runs[u - 1][0]) <= 8:
            continue
        if runs[start] and u - start >= 42:
            for c in range(start, u):
                for v in range(runs[c][0], h):
                    seen[v * w + c] = 255
        start = u
    tops = sorted(runs[u][0] for u in range(w) if runs[u] and seen[(h - 4) * w + u])
    if tops:                                                  # short broken bits at the same level are plinth too
        usual = tops[len(tops) // 2]
        piece = []
        for u in range(w + 1):
            if u < w and runs[u] and abs(runs[u][0] - usual) <= 14:
                piece.append(u)
                continue
            if len(piece) >= 8:                               # never single columns: they show as stripes
                for c in piece:
                    for v in range(runs[c][0], h):
                        seen[v * w + c] = 255
            piece = []
    return Image.frombytes("L", (w, h), bytes(seen)), own


def finish(panel, art_box):
    """Repaint the drawing's plaster in the building's own colour, and make the picture of what glows:
    only the shop gives light in the shade, the plaster round it stays an ordinary wall. -> glow image."""
    mask, own = plaster(panel, art_box)
    art = panel.crop(art_box).convert("RGB")
    level = Image.merge("RGB", [c.point(lambda v, i=i: WALL[i] + max(-14, min(7, round((v - own[i]) * .35))))
                                for i, c in enumerate(art.split())])        # the building's colour, a trace of the drawing's grain
    panel.paste(level, art_box[:2], mask)
    lit = panel.crop(art_box).convert("RGB")
    lit.paste((0, 0, 0), (0, 0), mask.filter(ImageFilter.MaxFilter(5)))         # no bright fringe
    out = Image.new("RGB", panel.size, (0, 0, 0))
    out.paste(lit, art_box[:2])
    return out


os.makedirs(GLOW, exist_ok=True)
os.makedirs(OUT, exist_ok=True)
for path in sorted(glob.glob(os.path.join(SRC, "S[0-9][0-9]_*.png"))):
    number = os.path.basename(path)[:3]
    art = Image.open(path).convert("RGB")
    gain = plaster_gain(art)
    art = Image.merge("RGB", [c.point(lambda v, g=g: min(255, round(v * g))) for c, g in zip(art.split(), gain)])
    panel = Image.new("RGB", (W, H), WALL)
    left, top = (W - ART[0]) // 2, H - ART[1]
    panel.paste(art.resize(ART, Image.LANCZOS), (left, top))
    recess(panel)
    finish(panel, (left, top, left + ART[0], H)).save(os.path.join(GLOW, number + ".jpg"), quality=90)
    panel.save(os.path.join(OUT, number + ".jpg"), quality=92)
    print(number, [round(g, 3) for g in gain])
