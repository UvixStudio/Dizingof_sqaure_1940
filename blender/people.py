"""Low-poly 1940 figures: men in hats, women in below-knee dresses, children, prams, bicycles and an
accordion player (MAT-22292 and B9-48 for who is there; clothes colours are interpretation).
Local +X = forward, z = 0 ground. Run by build_square.py with its globals.

Names matter to the site (make_site.py): walk_, pram_, kidbike_ and cycle_ objects move round the square."""
import bmesh, math, os, random, runpy
from mathutils import Vector, Matrix

P = runpy.run_path(os.path.join(ROOT, "blender", "people_palette.py"))
C = P["INDEX"]


def _paint(faces, col):
    for f in faces:
        f.material_index = C[col]          # colour travels as a material index until make() turns it into UVs


def limb(bm, a, b, r0, r1, col, seg=6):
    a, b = Vector(a), Vector(b)
    d = (b - a).normalized()
    u = d.orthogonal().normalized()
    w = d.cross(u)
    ring = lambda p, r: [bm.verts.new(p + (u * math.cos(6.283 * i / seg) + w * math.sin(6.283 * i / seg)) * r)
                         for i in range(seg)]
    lo, hi = ring(a, r0), ring(b, r1)
    faces = [bm.faces.new((lo[i], lo[(i + 1) % seg], hi[(i + 1) % seg], hi[i])) for i in range(seg)]
    faces += [bm.faces.new(lo[::-1]), bm.faces.new(hi)]
    _paint(faces, col)


def ball(bm, c, r, col, scale=(1, 1, 1)):
    g = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=r)
    for v in g["verts"]:
        v.co = Vector((v.co.x * scale[0], v.co.y * scale[1], v.co.z * scale[2])) + Vector(c)
    _paint({f for v in g["verts"] for f in v.link_faces}, col)


def block(bm, c, size, col):
    g = bmesh.ops.create_cube(bm, size=1.0)
    for v in g["verts"]:
        v.co = Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2])) + Vector(c)
    _paint({f for v in g["verts"] for f in v.link_faces}, col)


def torso(bm, x, y, z0, z1, r0, r1, col, lean=0.0):
    """Flattened (front to back) trunk."""
    n = len(bm.verts)
    limb(bm, (x, y, z0), (x + lean, y, z1), r0, r1, col, 8)
    bm.verts.ensure_lookup_table()
    for i in range(n, len(bm.verts)):
        v = bm.verts[i]
        cx = x + lean * (v.co.z - z0) / max(z1 - z0, 1e-6)
        v.co.x = cx + (v.co.x - cx) * 0.68


def head(bm, c, look, s=1.0):
    x, y, z = c
    ball(bm, c, 0.115 * s, look["skin"], (0.95, 0.92, 1.08))
    long_hair = look["kind"] in ("woman", "girl")
    ball(bm, (x - 0.035 * s, y, z + 0.025 * s), 0.115 * s, look["hair"], (1.0, 1.08, 1.0 if long_hair else 0.85))
    if long_hair:
        ball(bm, (x - 0.095 * s, y, z - 0.05 * s), 0.075 * s, look["hair"])
    hat = look.get("hat")
    if hat == "fedora":
        limb(bm, (x, y, z + 0.075 * s), (x, y, z + 0.095 * s), 0.19 * s, 0.19 * s, look["hatcol"], 10)
        limb(bm, (x, y, z + 0.09 * s), (x - 0.01, y, z + 0.19 * s), 0.108 * s, 0.09 * s, look["hatcol"], 8)
    elif hat == "cap":
        ball(bm, (x, y, z + 0.1 * s), 0.12 * s, look["hatcol"], (1.05, 1.05, 0.45))
        block(bm, (x + 0.12 * s, y, z + 0.085 * s), (0.08 * s, 0.14 * s, 0.015 * s), look["hatcol"])
    elif hat == "sunhat":
        limb(bm, (x - 0.02, y, z + 0.08 * s), (x - 0.02, y, z + 0.095 * s), 0.2 * s, 0.2 * s, look["hatcol"], 10)
        ball(bm, (x - 0.02, y, z + 0.1 * s), 0.1 * s, look["hatcol"], (1, 1, 0.65))


def person(bm, look, at=(0.0, 0.0), pose="stand", s=1.0, stride=0.0, hands=None):
    """look: kind man/woman/boy/girl, skin, hair, top, bottom, hat, hatcol. pose: stand or sit."""
    x, y = at
    woman = look["kind"] in ("woman", "girl")
    child = look["kind"] in ("boy", "girl")
    if child:
        s *= 0.66
    p = lambda dx, dy, dz: (x + dx * s, y + dy * s, dz * s)
    if pose == "sit":
        hip = 0.58 / s
        for side in (-0.1, 0.1):
            knee = p(0.4, side, hip - 0.02)
            limb(bm, p(0, side, hip), knee, 0.09 * s, 0.07 * s, look["bottom"])
            limb(bm, knee, p(0.46, side, 0.07), 0.06 * s, 0.045 * s, look["skin"] if (woman or child) else look["bottom"])
            block(bm, p(0.51, side, 0.04), (0.2 * s, 0.09 * s, 0.07 * s), "black" if not child else "brown")
        torso(bm, x, y, (hip - 0.05) * s, (hip + 0.55) * s, 0.16 * s, 0.2 * s, look["top"])
        sh, hz = hip + 0.5, hip + 0.76
        for side in (-1, 1):
            elbow = p(0.07, side * 0.25, hip + 0.24)
            limb(bm, p(0, side * 0.2, sh), elbow, 0.062 * s, 0.052 * s, look["top"])
            limb(bm, elbow, p(0.3, side * 0.13, hip + 0.14), 0.048 * s, 0.035 * s, look["top"])
            ball(bm, p(0.32, side * 0.13, hip + 0.14), 0.042 * s, look["skin"])
    else:
        for side, d in ((-0.095, stride), (0.095, -stride)):
            foot = p(d, side, 0.07)
            if woman:
                limb(bm, p(0, side, 0.62), foot, 0.055 * s, 0.038 * s, look["skin"])
            elif child:
                limb(bm, p(0, side, 0.9), p(d * 0.5, side, 0.55), 0.09 * s, 0.08 * s, look["bottom"])
                limb(bm, p(d * 0.5, side, 0.56), foot, 0.055 * s, 0.04 * s, look["skin"])
            else:
                limb(bm, p(0, side, 0.94), foot, 0.095 * s, 0.062 * s, look["bottom"])
            block(bm, p(d + 0.05, side, 0.04), (0.22 * s, 0.095 * s, 0.075 * s), "black" if not child else "brown")
        if woman:
            torso(bm, x, y, 0.5 * s, 1.02 * s, 0.27 * s, 0.14 * s, look["bottom"])
            torso(bm, x, y, 1.0 * s, 1.45 * s, 0.14 * s, 0.185 * s, look["top"])
        else:
            torso(bm, x, y, 0.88 * s, 1.0 * s, 0.17 * s, 0.17 * s, look["bottom"])
            torso(bm, x, y, 0.97 * s, 1.47 * s, 0.17 * s, 0.215 * s, look["top"])
        sh, hz = 1.4, 1.66
        for i, side in enumerate((-1, 1)):
            swing = -stride * 0.7 * side * -1
            hand = p(*hands[i]) if hands else p(swing, side * 0.27, 0.82)
            shoulder = p(0, side * 0.2, sh)
            elbow = tuple((a + b) / 2 for a, b in zip(shoulder, hand))
            elbow = (elbow[0] - 0.04 * s, elbow[1] + side * 0.05 * s, elbow[2])
            limb(bm, shoulder, elbow, 0.062 * s, 0.05 * s, look["top"])
            limb(bm, elbow, hand, 0.048 * s, 0.035 * s, look["skin"] if (woman or child) else look["top"])
            ball(bm, hand, 0.042 * s, look["skin"])
    limb(bm, p(0, 0, sh + 0.02), p(0, 0, sh + 0.16), 0.045 * s, 0.045 * s, look["skin"])
    head(bm, p(0.01, 0, hz + (0.02 if pose == "sit" else 0)), look, s * (1.12 if child else 1.0))


def ring_wheel(bm, x, y, r, tyre="black", seg=14):
    pts = [(x + r * math.cos(6.283 * i / seg), y, r + r * math.sin(6.283 * i / seg)) for i in range(seg)]
    for i in range(seg):
        limb(bm, pts[i], pts[(i + 1) % seg], 0.022, 0.022, tyre, 4)
    for i in range(0, seg, 2):
        limb(bm, (x, y, r), pts[i], 0.004, 0.004, "metal", 3)


def pram(bm, x, y=0.0, col="white"):
    block(bm, (x, y, 0.68), (0.66, 0.4, 0.24), col)
    block(bm, (x, y, 0.53), (0.5, 0.32, 0.1), col)
    ball(bm, (x - 0.24, y, 0.82), 0.25, col, (0.8, 0.9, 0.95))               # hood
    for dx in (-0.27, 0.3):
        for dy in (-0.23, 0.23):
            ring_wheel(bm, x + dx, y + dy, 0.17, seg=10)
        limb(bm, (x + dx, y - 0.2, 0.17), (x + dx, y + 0.2, 0.17), 0.012, 0.012, "metal", 4)
        limb(bm, (x + dx, y, 0.17), (x + dx * 0.6, y, 0.55), 0.016, 0.016, "metal", 4)
    for dy in (-0.17, 0.17):
        limb(bm, (x - 0.3, y + dy, 0.7), (x - 0.55, y + dy, 0.98), 0.012, 0.012, "metal", 4)
    limb(bm, (x - 0.55, y - 0.19, 0.98), (x - 0.55, y + 0.19, 0.98), 0.016, 0.016, "black", 5)


def bicycle(bm, look, s=1.0, col="black"):
    child = look["kind"] in ("boy", "girl")
    k = 0.68 if child else 1.0
    r, wb = 0.33 * k, 0.55 * k
    ring_wheel(bm, -wb, 0, r)
    ring_wheel(bm, wb, 0, r)
    seat, crank, bar = (-0.2 * k, 0, 0.82 * k), (-0.05 * k, 0, 0.32 * k), (0.4 * k, 0, 0.92 * k)
    for a, b in (((-wb, 0, r), crank), ((-wb, 0, r), seat), (crank, seat), (crank, bar), (seat, bar), ((wb, 0, r), bar)):
        limb(bm, a, b, 0.018 * k, 0.018 * k, col, 5)
    limb(bm, (bar[0], -0.24 * k, bar[2] + 0.08 * k), (bar[0], 0.24 * k, bar[2] + 0.08 * k), 0.014, 0.014, "metal", 5)
    limb(bm, bar, (bar[0], 0, bar[2] + 0.08 * k), 0.014, 0.014, "metal", 4)
    block(bm, (seat[0], 0, seat[2] + 0.03), (0.22 * k, 0.1 * k, 0.05 * k), "brown")
    hip = Vector((seat[0], 0, seat[2] + 0.12 * k))
    for side, ph in ((-0.1, 0.0), (0.1, math.pi)):
        pedal = Vector((crank[0] + 0.13 * k * math.cos(ph + 0.6), side * k * 1.5, crank[2] + 0.13 * k * math.sin(ph + 0.6)))
        knee = (hip + pedal) / 2 + Vector((0.2 * k, 0, 0.04 * k))
        knee.y = side * k
        limb(bm, (hip.x, side * k, hip.z), knee, 0.085 * k, 0.065 * k, look["bottom"])
        limb(bm, knee, pedal, 0.055 * k, 0.04 * k, look["skin"] if child else look["bottom"])
        block(bm, (pedal.x + 0.04 * k, pedal.y, pedal.z), (0.17 * k, 0.08 * k, 0.06 * k), "black")
    top = Vector((hip.x + 0.24 * k, 0, hip.z + 0.48 * k))
    torso(bm, hip.x, 0, hip.z - 0.04, top.z, 0.15 * k, 0.19 * k, look["top"], top.x - hip.x)
    for side in (-1, 1):
        hand = (bar[0], side * 0.22 * k, bar[2] + 0.1 * k)
        limb(bm, (top.x - 0.02, side * 0.19 * k, top.z - 0.06 * k), hand, 0.055 * k, 0.035 * k, look["top"])
        ball(bm, hand, 0.04 * k, look["skin"])
    head(bm, (top.x + 0.07 * k, 0, top.z + 0.2 * k), look, k * 1.08 if child else 1.0)


def accordionist(bm, look):
    person(bm, look, stride=0.05, hands=((0.27, -0.27, 1.12), (0.27, 0.27, 1.16)))
    for i in range(9):                                                         # bellows
        y = -0.18 + i * 0.045
        block(bm, (0.24, y, 1.13), (0.15 + 0.03 * (i % 2), 0.045, 0.3 + 0.025 * (i % 2)), "cream" if i % 2 else "black")
    for side in (-1, 1):
        block(bm, (0.24, side * 0.25, 1.13), (0.19, 0.09, 0.36), "maroon")
        for k in range(5):
            ball(bm, (0.345, side * 0.25, 1.0 + k * 0.065), 0.014, "white")
    limb(bm, (0.75, 0.15, 0.02), (0.75, 0.15, 0.035), 0.2, 0.2, "charcoal", 10)      # hat for coins
    limb(bm, (0.75, 0.15, 0.03), (0.75, 0.15, 0.11), 0.11, 0.13, "charcoal", 8)


def make_mesh(name, draw, M):
    bm = bmesh.new()
    draw(bm)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new("ped_" + name)
    bm.to_mesh(me)
    bm.free()
    uv = me.uv_layers.new(name="UVMap")
    for poly in me.polygons:
        i = poly.material_index
        co = ((i % 8 + 0.5) / 8, 1 - (i // 8 + 0.5) / 8)
        for li in poly.loop_indices:
            uv.data[li].uv = co
        poly.material_index = 0
        poly.use_smooth = False
    me.materials.append(M["people"])
    return me


def look(R, kind):
    d = {"kind": kind, "skin": R.choice(("skin_a", "skin_a", "skin_b")), "hair": R.choice(("hair_dark", "hair_dark", "hair_brown"))}
    if kind == "man":
        suit = R.choice(("charcoal", "navy", "brown", "grey", "beige", None, None))
        d.update(top=suit or "white", bottom=suit or R.choice(("khaki", "charcoal", "beige", "grey")),
                 hat=R.choice(("fedora", "fedora", "cap", None)), hatcol=R.choice(("charcoal", "brown", "beige", "grey")))
    elif kind == "woman":
        dress = R.choice(("navy", "maroon", "green", "charcoal", "white", "cream", "rose", "sky", "mustard", "blue"))
        d.update(top=R.choice((dress, dress, "white", "cream")), bottom=dress,
                 hat=R.choice(("sunhat", None, None)), hatcol=R.choice(("cream", "beige", "charcoal", "white")))
    elif kind == "boy":
        d.update(top=R.choice(("white", "white", "sky", "cream")), bottom=R.choice(("khaki", "navy", "charcoal")),
                 hat=R.choice(("cap", None)), hatcol=R.choice(("khaki", "white", "navy")))
    else:
        dress = R.choice(("white", "rose", "sky", "red", "cream"))
        d.update(top=dress, bottom=dress, hat=None, hatcol="white")
    return d


def sitters(M, count=8, seed=5):
    """Seated figures, placed by island.py on the benches."""
    R = random.Random(seed)
    return [make_mesh("sit_%d" % i, lambda bm, i=i: person(bm, look(R, ("woman", "man", "woman", "girl")[i % 4]), pose="sit"), M)
            for i in range(count)]


def populate(M, c):
    R = random.Random(1940)
    L = lambda kind: look(R, kind)

    def two(a, b, stride=0.2, gap=0.55):
        def draw(bm):
            person(bm, L(a), (0.0, gap / 2), stride=stride)
            person(bm, L(b), (0.05, -gap / 2), stride=-stride)
        return draw

    def mother(bm):
        person(bm, L("woman"), (-0.47, 0.0), stride=0.16, hands=((0.38, -0.17, 0.98), (0.38, 0.17, 0.98)))
        pram(bm, 0.47, 0.0, R.choice(("white", "white", "cream")))

    def place(name, mesh, r, bearing, direction):
        """direction 1 = counter-clockwise (as the traffic), -1 = clockwise, 0 = facing the fountain."""
        a = math.radians(bearing)
        if direction == 0:
            rot = math.atan2(-math.cos(a), -math.sin(a))
        else:
            rot = math.atan2(math.sin(a), -math.cos(a)) + (0 if direction > 0 else math.pi)
        z = 0.02 if r > 36 else 0.085
        instance(name, mesh, polar(r, bearing, z), rot, c)

    # ---- movers: one radius per kind of walker, so nobody walks through anybody ----
    couple = make_mesh("couple", two("man", "woman"), M)
    family = make_mesh("family", two("woman", "girl", 0.18, 0.62), M)
    friends = make_mesh("friends", two("woman", "woman"), M)
    man = make_mesh("man_walk", lambda bm: person(bm, L("man"), stride=0.26), M)
    boy = make_mesh("boy_walk", lambda bm: person(bm, L("boy"), stride=0.3), M)
    prams = [make_mesh("mother_%d" % i, mother, M) for i in range(2)]
    kid_bikes = [make_mesh("kidbike_%d" % i, lambda bm: bicycle(bm, L("boy"), col=("black", "red")[i]), M) for i in range(2)]
    cyclist = make_mesh("cyclist", lambda bm: bicycle(bm, L("man")), M)

    for mesh, bearing in ((couple, 20), (man, 150), (family, 262)):
        place("walk_a", mesh, 17.5, bearing, 1)
    for mesh, bearing in ((prams[0], 75), (prams[1], 235)):
        place("pram_a", mesh, 18.9, bearing, -1)
    for mesh, bearing in ((kid_bikes[0], 0), (kid_bikes[1], 190)):
        place("kidbike_a", mesh, 20.3, bearing, 1)
    for mesh, bearing in ((friends, 45), (boy, 175), (couple, 300)):
        place("walk_b", mesh, 21.7, bearing, -1)
    for mesh, bearing in ((man, 100), (family, 215), (friends, 340)):
        place("walk_c", mesh, 23.4, bearing, 1)
    for bearing in (35, 215):
        place("cycle_a", cyclist, 36.7, bearing, 1)

    # ---- the accordion player on the southern path, with listeners ----
    player = make_mesh("accordion", lambda bm: accordionist(bm, {"kind": "man", "skin": "skin_a", "hair": "hair_dark",
                        "top": "white", "bottom": "charcoal", "hat": "cap", "hatcol": "brown"}), M)
    place("stand_accordion", player, 27.6, 175, 0)
    still = [make_mesh("stand_%d" % i, lambda bm, k=k: person(bm, L(k), stride=0.07), M)
             for i, k in enumerate(("woman", "man", "boy", "girl", "woman", "man"))]
    for i, (r, b) in enumerate(((25.3, 171.6), (25.0, 174.0), (25.4, 177.2), (25.1, 179.4))):
        a = math.radians(b)                                                    # face the player, who stands further out
        to = polar(27.6, 175) - polar(r, b)
        instance("stand_listener", still[(i + 2) % 6], polar(r, b, 0.085), math.atan2(to.y, to.x), c)

    # ---- people stopping by the fence to watch the fountain ----
    for k, bearing in enumerate((24, 31, 128, 222, 228, 312)):
        place("stand_fence", still[k % 6], 16.72, bearing, 0)

    # ---- extra crowd for the Cycles stills only (RO_ objects are not exported to the web) ----
    for i in range(46):
        r, b = R.uniform(17.0, 23.8), R.uniform(0, 360)
        place("RO_ped", still[i % 6] if i % 3 else (couple if i % 2 else friends), r, b, R.choice((-1, 0, 1)))
    for i in range(22):
        place("RO_ped_walk", still[i % 6], R.uniform(44.6, 45.0), R.uniform(0, 360), R.choice((-1, 1)))
