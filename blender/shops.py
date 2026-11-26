"""Street life on the ring blocks without 3D interiors: fascia boards, awnings, cafe tables,
Esther's banner and big poster, advertising columns. Run by build_square.py with its globals.

Evidence: awnings were NOT everywhere (postcard, MAT-22292, B9-48, kikar_norz show a few, pale cloth);
ECKMANN awnings, the Bergner banner and DREAMLAND are on the Esther postcard. Which shop stood where,
the colours and the generic trades are interpretation."""
import bmesh, math, os, random, runpy
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
NAMES = ["signs", "poster", "aw_white", "aw_cream", "aw_green", "aw_terra", "aw_blue", "iron", "table", "wood"]
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


def awning(bm, rec, ch, s0, s1, top_z, style):
    """Sloping cloth with a short valance; striped cloth is cut into 30 cm gores."""
    if style.startswith("stripe_"):
        n = max(2, int((s1 - s0) / 0.3))
        parts = [(s0 + (s1 - s0) * i / n, s0 + (s1 - s0) * (i + 1) / n,
                  IDX["aw_" + style[7:]] if i % 2 else IDX["aw_white"]) for i in range(n)]
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
                quad(bm, rec, [la, lb, tb, ta], mat)
                quad(bm, rec, [va, vb, lb, la], mat)


def prism(bm, centre, r, z0, z1, mat, seg=10, r1=None):
    r1 = r if r1 is None else r1
    ring = lambda rr, z: [bm.verts.new((centre.x + rr * math.cos(6.283 * i / seg),
                                        centre.y + rr * math.sin(6.283 * i / seg), z)) for i in range(seg)]
    lo, hi = ring(r, z0), ring(r1, z1)
    for i in range(seg):
        bm.faces.new((lo[i], lo[(i + 1) % seg], hi[(i + 1) % seg], hi[i])).material_index = mat
    bm.faces.new(hi).material_index = mat


def cafe(bm, rec, ch, s0, s1, R):
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
                quad(bm, rec, [(p.x + 1.05 * math.cos(a), p.y + 1.05 * math.sin(a), 2.18),
                               (p.x + 1.05 * math.cos(b), p.y + 1.05 * math.sin(b), 2.18), tip], cloth)
        s += 2.3
        k += 1


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
        if board:
            facade_sheet(bm, rec, ch, a + 0.12, b - 0.12, G - 0.56, G - 0.05, 0.31, IDX["signs"], S["uv"](board))
        if cloth:
            awning(bm, rec, ch, a, b, G - 0.6, cloth)
    for i in CAFES.get(key, ()):
        cafe(bm, rec, ch, *bays[i], R)
    if key == "D":                                       # letters on the parapet (kikar_norz)
        mid = ch.length * 0.5
        facade_sheet(bm, rec, ch, mid - 3.6, mid + 3.6, info["top"] + 0.3, info["top"] + 0.95, -0.05,
                     IDX["signs"], S["uv"]("roof_pharmacy"))
    if key == "B":
        z = G + info["H"] * 2 + 0.42                     # banner across an upper balcony (postcard)
        facade_sheet(bm, rec, ch, t0 - 13.0, t0 - 1.0, z, z + 0.75, -0.04, IDX["signs"], S["uv"]("banner_bergner"))
        s_mid = (t0 + T) / 2                             # the big poster under the red name
        z0, z1 = G + 1.45, info["top"] + info["attic"] - 3.0
        half = (z1 - z0) / 3
        facade_sheet(bm, rec, ch, s_mid - half - 0.18, s_mid + half + 0.18, z0 - 0.18, z1 + 0.18, 0.0,
                     IDX["iron"], (0, 0, 0.001, 0.001))
        facade_sheet(bm, rec, ch, s_mid - half, s_mid + half, z0, z1, -0.05, IDX["poster"], (0, 0, 1, 1))
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

    sets = (("amanut", "flowers", "books"), ("icecream", "hats", "photo"), ("eckmann", "shoes", "bakery"))
    for i in range(seg):
        group = i // 3
        if group % 2 == 0:
            panel(i, 0.6, 0.35, 2.95, IDX["poster"], (0, 0, 1, 1))
        else:
            panel(i, 0.6, 0.35, 2.95, IDX["aw_cream"], (0, 0, 1, 1))
            for j, board in enumerate(sets[group // 2]):
                panel(i, 0.615, 0.65 + j * 0.8, 1.05 + j * 0.8, IDX["signs"], S["uv"](board))
    finish_atlas(name, bm, rec, M, c)
