"""Street life on the ring blocks without 3D interiors: fascia boards, awnings, cafe tables,
Esther's banner and big poster, advertising columns. Run by build_square.py with its globals.

Evidence: awnings were NOT everywhere (postcard, MAT-22292, B9-48, kikar_norz show a few, pale cloth);
ECKMANN awnings, the Bergner banner and DREAMLAND are on the Esther postcard. Which shop stood where,
the colours and the generic trades are interpretation."""
import bmesh, json, math, os, random, runpy
from mathutils import Vector

S = runpy.run_path(os.path.join(ROOT, "blender", "signs_data.py"))
# block -> {bay number: (board, awning)}; awning = a cloth name, "stripe_*", "eck_en"/"eck_he" or None
FIXED = {
    "B": {0: (None, "eck_en"), 1: ("eckmann", None), 2: (None, "eck_he"), -1: ("amanut", "aw_cream"), -2: (None, "aw_cream")},
    "A": {2: ("galor", None), 4: ("bakery", "aw_white")},
    "C": {1: ("kiosk", "stripe_green"), 3: ("textile", None)},
    "D": {1: ("grocery", None), 3: ("pharmacy", "aw_white"), 5: ("books", None)},
    "E": {1: ("icecream", "stripe_terra"), 3: ("deli", "aw_white")},
    "F": {1: ("hats", None), -1: ("flowers", "aw_white"), -3: ("watch", None)},
}
FILLER = ["grocery", "bakery", "books", "shoes", "hats", "barber", "watch", "textile", "photo", "candy", "deli"]
CAFES = {"B": (-1, -2), "E": (1,)}
NAMES = ["signs", "poster", "aw_white", "aw_cream", "aw_green", "aw_terra", "aw_blue", "iron", "table", "wood",
         "cine_sign", "cine_shadow", "bronze", "poster_four"]
# trades without a bay of their own in the first plan get one that had no board
# bays whose picture is drawn mirrored (none: neighbours never share a picture)
MIRROR = set()
# drawn shopfronts (make_shopfronts.py): which bay shows which picture, from the catalogue
with open(os.path.join(ROOT, "assets", "shopfronts", "shop_catalog.json"), encoding="utf-8-sig") as f:
    FRONTS = {(bay[0], int(bay[1:])): "shop_" + shop["number"] for shop in json.load(f) for bay in shop["model_bays"]
              if os.path.isfile(os.path.join(ROOT, "blender", "tex", "shops", shop["number"] + ".jpg"))}
NAMES += sorted(set(FRONTS.values()))
IDX = {n: i for i, n in enumerate(NAMES)}


def quad(bm, rec, pts, mat, uvs=None):
    f = bm.faces.new([bm.verts.new(p) for p in pts])
    f.material_index = mat
    if uvs:
        rec.append((f, uvs))


def reads_backwards(ch, s0, s1, inset):
    """True if growing arc length runs to the LEFT for a viewer outside (viewer's right = look x up)."""
    (pa, n), (pb, _) = ch.at(s0, inset), ch.at(s1, inset)
    return (pb - pa).dot(Vector((n.y, -n.x))) < 0


def facade_sheet(bm, rec, ch, s0, s1, z0, z1, inset, mat, cell):
    """A curved sheet standing on the facade between arc lengths s0..s1, facing the street."""
    ss = list(ch.samples(s0, s1))
    flip = reads_backwards(ch, s0, s1, inset)
    u0, v0, u1, v1 = cell
    for a, b in zip(ss, ss[1:]):
        (p, n), q = ch.at(a, inset), ch.at(b, inset)[0]
        fa, fb = (a - ss[0]) / (ss[-1] - ss[0]), (b - ss[0]) / (ss[-1] - ss[0])
        if flip:
            fa, fb = 1 - fa, 1 - fb
        ua, ub = u0 + (u1 - u0) * fa, u0 + (u1 - u0) * fb
        pts = [(p.x, p.y, z0), (q.x, q.y, z0), (q.x, q.y, z1), (p.x, p.y, z1)]
        uvs = [(ua, v0), (ub, v0), (ub, v1), (ua, v1)]
        e = q - p
        if Vector((e.y, -e.x)).dot(-n) < 0:                    # keep the front face towards the street
            pts.reverse()
            uvs.reverse()
        quad(bm, rec, pts, mat, uvs)


def swatch(board):
    """A patch of plain colour in the sign atlas, for cloth that matches a sign: the board's own background, beside
    the lettering. A nearly white board would not show against the white stripes, so it takes the brown one."""
    bg = S["BOARDS"][board][2] if board in S["BOARDS"] else S["NAMED"][board][2][0]
    if min(bg) >= 214:
        board = "A3"
    x, y, w, h = S["CELLS"][board]
    u0, u1 = (x + 22) / S["ATLAS"], (x + 40) / S["ATLAS"]
    v0, v1 = 1 - (y + h / 2 + 8) / S["ATLAS_H"], 1 - (y + h / 2 - 8) / S["ATLAS_H"]
    return [(u0, v0), (u1, v0), (u1, v1), (u0, v1)]


def awning(bm, rec, ch, s0, s1, top_z, style):
    """Sloping cloth with a short valance; striped cloth is cut into 30 cm gores."""
    cloth_uv = swatch(style[5:]) if style.startswith("sign:") else None
    if style.startswith("stripe_") or cloth_uv:
        n = max(2, int((s1 - s0) / 0.3))
        if cloth_uv:
            colour, first = IDX["signs"], 0                   # coloured at both edges
            n += 1 - n % 2
        else:
            colour, first = IDX["aw_" + style[7:]], 1
        parts = [(s0 + (s1 - s0) * i / n, s0 + (s1 - s0) * (i + 1) / n,
                  colour if i % 2 == first else IDX["aw_white"]) for i in range(n)]
    else:
        parts = [(s0, s1, IDX.get(style, IDX["aw_white"]))]
    lettered = style.startswith("eck_")
    if lettered:
        flip = reads_backwards(ch, s0, s1, 0.3)
        u0, v0, u1, v1 = S["uv"]("aw_" + style)
    for a, b, mat in parts:
        ss = list(ch.samples(a, b))
        for c, d in zip(ss, ss[1:]):
            rows = []
            for s in (c, d):
                top, n = ch.at(s, 0.3)
                low = top - n * 1.5
                rows.append(((top.x, top.y, top_z), (low.x, low.y, top_z - 0.72), (low.x, low.y, top_z - 0.95)))
            (ta, la, va), (tb, lb, vb) = rows
            if lettered:
                fc, fd = (c - s0) / (s1 - s0), (d - s0) / (s1 - s0)
                if flip:
                    fc, fd = 1 - fc, 1 - fd
                uc, ud = u0 + (u1 - u0) * fc, u0 + (u1 - u0) * fd
                quad(bm, rec, [la, lb, tb, ta], IDX["signs"], [(uc, v0), (ud, v0), (ud, v1), (uc, v1)])
                quad(bm, rec, [va, vb, lb, la], IDX["aw_white"])
            else:
                uvs = cloth_uv if mat == IDX["signs"] else None
                quad(bm, rec, [la, lb, tb, ta], mat, uvs)
                quad(bm, rec, [va, vb, lb, la], mat, uvs)


def prism(bm, centre, r, z0, z1, mat, seg=10, r1=None):
    r1 = r if r1 is None else r1
    ring = lambda rr, z: [bm.verts.new((centre.x + rr * math.cos(6.283 * i / seg),
                                        centre.y + rr * math.sin(6.283 * i / seg), z)) for i in range(seg)]
    lo, hi = ring(r, z0), ring(r1, z1)
    for i in range(seg):
        bm.faces.new((lo[i], lo[(i + 1) % seg], hi[(i + 1) % seg], hi[i])).material_index = mat
    bm.faces.new(hi).material_index = mat


def cafe(bm, rec, ch, s0, s1, R, board=None):
    """Pavement tables: round white top, two or three wooden chairs, now and then a parasol."""
    s, k = s0 + 0.9, 0
    while s < s1 - 0.5:
        p, n = ch.at(s, -1.35 - 0.5 * (k % 2))
        prism(bm, p, 0.04, 0.0, 0.72, IDX["iron"], 6)
        prism(bm, p, 0.36, 0.72, 0.76, IDX["table"], 12)
        for j in range(R.randint(2, 3)):
            a = R.uniform(0, 1.2) + j * 2.2
            away = Vector((math.cos(a), math.sin(a)))
            q = p + away * 0.66
            prism(bm, q, 0.2, 0.43, 0.47, IDX["wood"], 8)
            for dx, dy in ((-.13, -.13), (.13, -.13), (-.13, .13), (.13, .13)):
                prism(bm, q + Vector((dx, dy)), 0.018, 0.0, 0.43, IDX["wood"], 4)
            back = q + away * 0.19
            prism(bm, back, 0.025, 0.43, 0.95, IDX["wood"], 4)
            prism(bm, back, 0.14, 0.82, 0.92, IDX["wood"], 6)
        if k % 2 == 0:
            prism(bm, p, 0.025, 0.76, 2.35, IDX["iron"], 5)
            tip = (p.x, p.y, 2.6)
            for i in range(12):
                a, b = 6.283 * i / 12, 6.283 * (i + 1) / 12
                cloth = IDX["aw_white"] if i % 2 == 0 else IDX["aw_terra" if k % 4 == 0 else "aw_green"]
                uvs = None
                if board and i % 2:                           # the cafe's own colour, as on its sign
                    cloth, uvs = IDX["signs"], swatch(board)[:3]
                quad(bm, rec, [(p.x + 1.05 * math.cos(a), p.y + 1.05 * math.sin(a), 2.18),
                               (p.x + 1.05 * math.cos(b), p.y + 1.05 * math.sin(b), 2.18), tip], cloth, uvs)
        s += 2.3
        k += 1


def bar(bm, rec, ch, s0, s1, z0, z1, near, far, mat):
    """A solid strip standing off the wall (the metal frame)."""
    facade_sheet(bm, rec, ch, s0, s1, z0, z1, -far, mat, (0, 0, 0.001, 0.001))
    ends = [(ch.at(s, -near)[0], ch.at(s, -far)[0]) for s in (s0, s1)]
    for z in (z0, z1):
        quad(bm, rec, [(ends[0][0].x, ends[0][0].y, z), (ends[1][0].x, ends[1][0].y, z),
                       (ends[1][1].x, ends[1][1].y, z), (ends[0][1].x, ends[0][1].y, z)], mat)
    for a, b in ends:
        quad(bm, rec, [(a.x, a.y, z0), (b.x, b.y, z0), (b.x, b.y, z1), (a.x, a.y, z1)], mat)


def cinema_front(bm, rec, ch, mid, parapet):
    """The tower of the cinema: the metal name sign with its painted shadow, and under it a framed poster.
    A design of this reconstruction; the 1940 postcard shows upright red letters here."""
    high = 7.4
    wide = high * 898 / 1426
    left = mid - wide * 377 / 898                            # the sign's two posts sit in the middle of the wall
    top = parapet + 0.9                                      # the scroll rises above the roof line
    pad = 80 * high / 1426                                   # room for the soft edge (make_cinema_sign.PAD)
    whole = (0, 0, 1, 1)
    facade_sheet(bm, rec, ch, left - pad + 0.09, left + wide + pad + 0.09, top - high - pad - 0.12, top + pad - 0.12, -0.03,
                 IDX["cine_shadow"], whole)
    facade_sheet(bm, rec, ch, left, left + wide, top - high, top, -0.17, IDX["cine_sign"], whole)
    tall = 4.3
    half = tall * 747 / 1075 / 2
    z1 = top - high - 0.55
    z0, a, b, w = z1 - tall, mid - half, mid + half, 0.14
    facade_sheet(bm, rec, ch, a, b, z0, z1, -0.07, IDX["poster_four"], whole)
    for s0, s1, lo, hi, out in ((a - w, a, z0 - w, z1 + w, 0.17), (b, b + w, z0 - w, z1 + w, 0.17),
                                (a - w - 0.18, b + w + 0.18, z1, z1 + w, 0.19), (a - w - 0.18, b + w + 0.18, z0 - w, z0, 0.19)):
        bar(bm, rec, ch, s0, s1, lo, hi, 0.02, out, IDX["bronze"])


def finish_atlas(name, bm, rec, M, c):
    """box_uv() maps every face by position; put the atlas UVs back afterwards."""
    bm.faces.index_update()
    wanted = [(f.index, uvs) for f, uvs in rec]
    bm.normal_update()
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for n in NAMES:
        me.materials.append(M[n])
    box_uv(me)
    uv = me.uv_layers[0].data
    for index, uvs in wanted:
        for li, co in zip(me.polygons[index].loop_indices, uvs):
            uv[li].uv = co
    c.objects.link(bpy.data.objects.new(name, me))


def signed(key, i):
    """The sign a bay lives under; the cafe's second window shares its neighbour's."""
    return S["SIGNS"].get("B7" if (key, i) == ("B", 6) else "%s%d" % (key, i))


def dress(key, info, M, c):
    """Adds the shop fronts of one block as its own mesh."""
    ch, G, t0, T = info["chain"], info["G"], info["t0"], info["tower"]
    R = random.Random(ord(key) * 77)
    bm, rec = bmesh.new(), []
    bays = []
    s = 0.9
    while s + 3.5 < min(t0, ch.length - 0.3):
        bays.append((s, s + 3.5))
        s += 4.2
    plan = {(i % len(bays)): v for i, v in FIXED.get(key, {}).items() if -len(bays) <= i < len(bays)}
    filler = FILLER[:]
    R.shuffle(filler)
    for i, (a, b) in enumerate(bays):
        if i in plan:
            board, cloth = plan[i]
        else:
            board = filler.pop() if filler and R.random() < 0.6 else None
            cloth = R.choice(("aw_white", "aw_white", "aw_cream", "aw_green", "aw_terra")) if R.random() < 0.3 else None
        board = S["SIGNS"].get("%s%d" % (key, i))           # after the draw above, so the awnings stay put
        shown = signed(key, i)
        if cloth and shown and not cloth.startswith("eck_"):
            cloth = "sign:" + shown
        if (key, i) in FRONTS:                              # the picture stands in front of the plain glazing
            inset = max(1.45, info["recess"] + 0.1) - 0.13
            facade_sheet(bm, rec, ch, a - 0.3, a + 3.9, 0.02, G - 0.6, inset, IDX[FRONTS[(key, i)]],
                         (1, 0, 0, (G - 0.6) / 3.4) if (key, i) in MIRROR else (0, 0, 1, (G - 0.6) / 3.4))
        if board:
            facade_sheet(bm, rec, ch, a + 0.12, b - 0.12, G - 0.56, G - 0.05, 0.31, IDX["signs"], S["uv"](board))
        if cloth:
            awning(bm, rec, ch, a, b, G - 0.6, cloth)
    for i in CAFES.get(key, ()):
        cafe(bm, rec, ch, *bays[i], R, signed(key, i % len(bays)))
    if key == "D":                                       # letters on the parapet (kikar_norz)
        mid = ch.length * 0.5
        facade_sheet(bm, rec, ch, mid - 3.6, mid + 3.6, info["top"] + 0.3, info["top"] + 0.95, -0.05,
                     IDX["signs"], S["uv"]("roof_pharmacy"))
    if key == "B":
        z = G + info["H"] * 2 + 0.42                     # banner across an upper balcony (postcard)
        facade_sheet(bm, rec, ch, t0 - 13.0, t0 - 1.0, z, z + 0.75, -0.04, IDX["signs"], S["uv"]("banner_bergner"))
        cinema_front(bm, rec, ch, (t0 + T) / 2, info["top"] + info["attic"])
    finish_atlas(key + "_shops", bm, rec, M, c)


def ad_column(name, pos, M, c):
    """Street advertising column: three posters and three panels of shop boards."""
    bm, rec = bmesh.new(), []
    seg = 18
    prism(bm, pos, 0.66, 0.0, 0.35, IDX["aw_green"], seg)
    prism(bm, pos, 0.72, 2.95, 3.1, IDX["aw_green"], seg)
    prism(bm, pos, 0.66, 3.1, 3.55, IDX["aw_green"], seg, 0.08)

    def panel(i, radius, z0, z1, mat, cell):
        a, b = 6.283 * i / seg, 6.283 * (i + 1) / seg
        pa = (pos.x + radius * math.cos(a), pos.y + radius * math.sin(a))
        pb = (pos.x + radius * math.cos(b), pos.y + radius * math.sin(b))
        u0, v0, u1, v1 = cell
        part = i % 3
        ua, ub = u0 + (u1 - u0) * part / 3, u0 + (u1 - u0) * (part + 1) / 3
        quad(bm, rec, [(pa[0], pa[1], z0), (pb[0], pb[1], z0), (pb[0], pb[1], z1), (pa[0], pa[1], z1)], mat,
             [(ua, v0), (ub, v0), (ub, v1), (ua, v1)])

    sets = (("amanut", "flowers", "F2"), ("E1", "F1", "E6"), ("eckmann", "A3", "A4"))
    for i in range(seg):
        group = i // 3
        if group % 2 == 0:
            panel(i, 0.6, 0.35, 2.95, IDX["poster"], (0, 0, 1, 1))
        else:
            panel(i, 0.6, 0.35, 2.95, IDX["aw_cream"], (0, 0, 1, 1))
            for j, board in enumerate(sets[group // 2]):
                panel(i, 0.615, 0.65 + j * 0.8, 1.05 + j * 0.8, IDX["signs"], S["uv"](board))
    finish_atlas(name, bm, rec, M, c)
