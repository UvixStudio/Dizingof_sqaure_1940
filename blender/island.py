"""The garden island, dressed from the 1938-40 photos only (MAT-22292, kikar_norz, 608ddd14,
fc338997, film frames 02:43 / 02:52 / 03:08). Run by build_square.py with its globals
(helpers, radii, collections), via runpy init_globals."""
import bmesh, math, random
from mathutils import Vector, Matrix, noise

R = random.Random(1938)
SEGMENTS = [(PATHS[k], PATHS[k] + (PATHS[(k + 1) % 4] - PATHS[k]) % 360) for k in range(4)]   # lawn between paths


def deg(metres, r):
    return math.degrees(metres / r)


def at(frac, k):
    a, b = SEGMENTS[k]
    return a + (b - a) * frac


def mesh_from(name, bm, mats):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    box_uv(me)
    return me


def blob(bm, centre, radius, squash=1.0, mat=0, jitter=0.2, sub=1):
    g = bmesh.ops.create_icosphere(bm, subdivisions=sub, radius=radius)
    for v in g["verts"]:
        v.co *= 1 + R.uniform(-jitter, jitter)
        v.co.z *= squash
        v.co += Vector(centre)
    for f in {f for v in g["verts"] for f in v.link_faces}:
        f.material_index = mat


def pole(bm, a, b, r, mat, seg=5):
    a, b = Vector(a), Vector(b)
    d = (b - a).normalized()
    u = d.orthogonal().normalized()
    w = d.cross(u)
    ring = lambda p: [bm.verts.new(p + (u * math.cos(6.283 * i / seg) + w * math.sin(6.283 * i / seg)) * r) for i in range(seg)]
    lo, hi = ring(a), ring(b)
    for i in range(seg):
        bm.faces.new((lo[i], lo[(i + 1) % seg], hi[(i + 1) % seg], hi[i])).material_index = mat


def alpha_strip(name, r, z0, z1, t0, t1, tile, mat, c, seg=48):
    """Vertical curved strip carrying a cut-out texture (lattice fence)."""
    bm = bmesh.new()
    lo = [bm.verts.new(polar(r, t0 + (t1 - t0) * i / seg, z0)) for i in range(seg + 1)]
    hi = [bm.verts.new(polar(r, t0 + (t1 - t0) * i / seg, z1)) for i in range(seg + 1)]
    for i in range(seg):
        bm.faces.new((lo[i], lo[i + 1], hi[i + 1], hi[i]))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    uv = me.uv_layers.new(name="UVMap")
    step = math.radians((t1 - t0) / seg) * r / tile
    for i, p in enumerate(me.polygons):
        for li, co in zip(p.loop_indices, ((i * step, 0), ((i + 1) * step, 0), ((i + 1) * step, 1), (i * step, 1))):
            uv.data[li].uv = co
    o = bpy.data.objects.new(name, me)
    c.objects.link(o)
    return o


def cage_mesh(mat, r=0.3, h=1.5, seg=10):
    bm = bmesh.new()
    lo = [bm.verts.new((r * math.cos(6.283 * i / seg), r * math.sin(6.283 * i / seg), 0)) for i in range(seg)]
    hi = [bm.verts.new((v.co.x, v.co.y, h)) for v in lo]
    for i in range(seg):
        bm.faces.new((lo[i], lo[(i + 1) % seg], hi[(i + 1) % seg], hi[i]))
    me = bpy.data.meshes.new("tree_cage")
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    uv = me.uv_layers.new(name="UVMap")
    for i, p in enumerate(me.polygons):
        for li, co in zip(p.loop_indices, ((i * 0.6, 0), ((i + 1) * 0.6, 0), ((i + 1) * 0.6, 1), (i * 0.6, 1))):
            uv.data[li].uv = co
    return me


def bench_mesh():
    """2.4 m bench: three white cast-concrete end frames, dark wooden slats. Front faces +Y."""
    bm = bmesh.new()
    side = [(-0.40, 0), (-0.22, 0), (-0.12, 0.30), (0.22, 0.30), (0.28, 0), (0.44, 0), (0.42, 0.46),
            (-0.14, 0.47), (-0.27, 0.92), (-0.39, 0.90), (-0.30, 0.45)]
    for x in (-1.16, 0.0, 1.16):
        a = [bm.verts.new((x - 0.055, y, z)) for y, z in side]
        b = [bm.verts.new((x + 0.055, y, z)) for y, z in side]
        n = len(side)
        bm.faces.new(a)
        bm.faces.new(b[::-1])
        for i in range(n):
            bm.faces.new((a[i], b[i], b[(i + 1) % n], a[(i + 1) % n]))
    for k in range(4):
        cube(bm, (2.42, 0.10, 0.035), (0, -0.07 + k * 0.135, 0.49), 0, 1)
    for k in range(3):
        cube(bm, (2.42, 0.035, 0.10), (0, -0.20 - k * 0.055, 0.60 + k * 0.145), 0.36, 1)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return mesh_from("bench", bm, [M["white_iron"], M["bench_wood"]])


def lamp_mesh():
    bm = bmesh.new()
    cylinder(bm, 0.065, 0.045, 3.1, 8, (0, 0, 0), 1)
    cylinder(bm, 0.14, 0.32, 0.17, 12, (0, 0, 3.08), 0)
    cylinder(bm, 0.37, 0.07, 0.15, 12, (0, 0, 3.25), 1)
    return mesh_from("lamp", bm, [M["globe"], M["white_iron"]])


def palm_mesh(seed):
    """Young date palm (frame 02:43): short scarred trunk, long feather fronds reaching low.
    Placeholder until a downloaded model replaces it."""
    r = random.Random(seed)
    bm = bmesh.new()
    th = r.uniform(0.9, 1.5)
    cylinder(bm, 0.30, 0.22, th, 9, (0, 0, 0), 1, cap=False)
    blob(bm, (0, 0, th), 0.30, 1.3, 1, 0.25)
    n = 22
    for k in range(n):
        az = 2.39996 * k + r.uniform(-0.15, 0.15)
        age = k / n                                     # 0 = young upright, 1 = old drooping
        up = 1.35 - 1.0 * age
        L = r.uniform(2.1, 2.8)
        d = Vector((math.cos(az), math.sin(az), 0))
        side = Vector((-d.y, d.x, 0))
        def point(s):
            return Vector((0, 0, th + 0.15)) + d * (L * s * (0.55 + 0.45 * age)) + Vector((0, 0, L * (up * s - 0.8 * s * s)))
        for i in range(7):                              # rachis
            pole(bm, point(i / 7), point((i + 1) / 7), 0.022 * (1 - i / 9), 2, 3)
        for i in range(2, 17):
            s = i / 17
            p, q = point(s), point(s + 0.045)
            fwd = (q - p).normalized()
            ll = 0.62 * math.sin(math.pi * (0.12 + 0.83 * s))
            for sg in (-1, 1):
                tip = p + side * sg * ll * 0.75 + fwd * ll * 0.65 + Vector((0, 0, -0.12 * ll))
                f = bm.faces.new((bm.verts.new(p), bm.verts.new(q), bm.verts.new(tip)))
                f.material_index = 0
    return mesh_from("palm_%d" % seed, bm, [M["frond"], M["bark"], M["frond_stem"]])


def sapling_mesh(seed):
    r = random.Random(seed)
    bm = bmesh.new()
    pole(bm, (0, 0, 0), (r.uniform(-.06, .06), r.uniform(-.06, .06), 2.5), 0.045, 1, 6)
    for k in range(6):
        z = r.uniform(1.7, 2.9)
        a = r.uniform(0, 6.28)
        d = r.uniform(0.1, 0.55)
        c = (d * math.cos(a), d * math.sin(a), z)
        pole(bm, (0, 0, z - 0.45), c, 0.018, 1, 3)
        blob(bm, c, r.uniform(0.16, 0.3), 0.85, 0, 0.45)
    return mesh_from("sapling_%d" % seed, bm, [M["leaves"], M["bark"]])


def tripod_mesh():
    bm = bmesh.new()
    for k in range(3):
        a = 2.094 * k + 0.4
        pole(bm, (0.75 * math.cos(a), 0.75 * math.sin(a), 0), (-0.05 * math.cos(a), -0.05 * math.sin(a), 2.35), 0.035, 0)
    for k in range(3):
        a, b = 2.094 * k + 0.4, 2.094 * (k + 1) + 0.4
        pole(bm, (0.42 * math.cos(a), 0.42 * math.sin(a), 1.0), (0.42 * math.cos(b), 0.42 * math.sin(b), 1.0), 0.025, 0, 4)
    return mesh_from("tripod", bm, [M["stake"]])


def ficus_mesh(seed, age):
    """Ficus: smooth grey trunk, a few leaders, irregular dome of leaf clusters. Each cluster = opaque
    core (casts the shade, also on the web) wrapped in leaf cards with their own 0..1 UVs."""
    r = random.Random(seed)
    big = age == "mature"
    fork, crown_z, spread, tall, trunk = (2.3, 4.4, 2.1, 0.9, 0.2) if big else (1.9, 2.75, 0.5, 0.35, 0.055)
    mats = [M["leafcard_a"], M["leafcard_b"], M["leafcard_c"], M["leaf_core"], M["ficus_bark"]]
    main = seed % 3
    bm = bmesh.new()
    pole(bm, (0, 0, 0), (r.uniform(-.08, .08), r.uniform(-.08, .08), fork), trunk, 4, 8)
    clusters = [(Vector((r.uniform(-.3, .3), r.uniform(-.3, .3), crown_z + tall * 0.7)), 1.7 if big else 0.55)]
    n = r.randint(5, 7) if big else 3
    for k in range(n):
        a = 6.283 * k / n + r.uniform(-.4, .4)
        d = spread * r.uniform(0.7, 1.15)
        c = Vector((d * math.cos(a), d * math.sin(a), crown_z + r.uniform(-.6, .7) * tall))
        clusters.append((c, r.uniform(1.1, 1.6) if big else r.uniform(0.32, 0.5)))
    for c, rad in clusters:                                       # limbs
        mid = Vector((c.x * 0.45, c.y * 0.45, fork + (c.z - fork) * 0.55))
        pole(bm, (0, 0, fork - 0.15), mid, trunk * 0.55, 4, 5)
        pole(bm, mid, c, trunk * 0.28, 4, 4)
    cards = []
    for c, rad in clusters:
        g = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=rad * 0.74)
        for v in g["verts"]:
            v.co *= 1 + r.uniform(-.18, .18)
            v.co.z *= 0.72
            v.co += c
        for f in {f for v in g["verts"] for f in v.link_faces}:
            f.material_index = 3
        tone = main if r.random() < 0.65 else r.randrange(3)
        for _ in range(46 if big else 26):
            u = Vector((0, 0, -1))
            while u.z < -0.55:
                u = Vector((r.gauss(0, 1), r.gauss(0, 1), r.gauss(0, 1))).normalized()
            p = c + Vector((u.x, u.y, u.z * 0.75)) * rad * r.uniform(0.78, 1.12)
            axis = (u + Vector((r.gauss(0, .7), r.gauss(0, .7), r.gauss(0, .7)))).normalized()
            s = axis.orthogonal().normalized()
            s.rotate(Matrix.Rotation(r.uniform(0, 6.283), 3, axis))
            t = axis.cross(s)
            half = r.uniform(0.34, 0.5) if big else r.uniform(0.17, 0.26)
            f = bm.faces.new([bm.verts.new(p + (s * x + t * y) * half) for x, y in ((-1, -1), (1, -1), (1, 1), (-1, 1))])
            f.material_index = tone if r.random() < 0.85 else (tone + 1) % 3
            bm.faces.index_update()
            cards.append((len(bm.faces) - 1, c))
    bm.normal_update()
    me = bpy.data.meshes.new("ficus_%s_%d" % (age, seed))
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    box_uv(me)
    uv = me.uv_layers[0].data
    normals = [v.normal.copy() for v in me.vertices]
    for index, c in cards:
        p = me.polygons[index]
        assert p.material_index < 3
        for li, co in zip(p.loop_indices, ((0, 0), (1, 0), (1, 1), (0, 1))):
            uv[li].uv = co
        for vi in p.vertices:                                     # light the card like part of a round crown
            normals[vi] = ((me.vertices[vi].co - c).normalized() + Vector((0, 0, 0.55))).normalized()
    for p in me.polygons:
        p.use_smooth = True
    me.normals_split_custom_set_from_vertices(normals)
    return me


def topiary_mesh():
    bm = bmesh.new()
    cylinder(bm, 0.36, 0.31, 1.95, 10, (0, 0, 0), 0)
    blob(bm, (0, 0, 1.93), 0.32, 0.75, 0, 0.08, 2)
    return mesh_from("topiary", bm, [M["hedge"]])


def shrub_mesh(seed):
    r = random.Random(seed)
    bm = bmesh.new()
    for k in range(9):
        blob(bm, (r.uniform(-.6, .6), r.uniform(-.3, .3), r.uniform(.06, .22)), r.uniform(.14, .28), 0.8, 0, 0.45)
    return mesh_from("rim_shrub_%d" % seed, bm, [M["leaves"]])


def tube(bm, pts, r0, r1, seg=5):
    rings = []
    for i, p in enumerate(pts):
        d = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        u = d.orthogonal().normalized()
        w = d.cross(u)
        rr = r0 + (r1 - r0) * i / (len(pts) - 1)
        rings.append([bm.verts.new(p + (u * math.cos(6.283 * k / seg) + w * math.sin(6.283 * k / seg)) * rr) for k in range(seg)])
    for a, b in zip(rings, rings[1:]):
        for k in range(seg):
            bm.faces.new((a[k], a[(k + 1) % seg], b[(k + 1) % seg], b[k]))


def fountain_render_jets(c, mat):
    """Blender-only stand-in (the site animates its own particles)."""
    bm = bmesh.new()
    z = WATER_Z
    for k in range(9):                                 # central column
        a = 6.283 * k / 9
        top = Vector((0.28 * math.cos(a), 0.28 * math.sin(a), z + R.uniform(6.2, 8.0)))
        tube(bm, [Vector((0.12 * math.cos(a), 0.12 * math.sin(a), z)).lerp(top, t) for t in (0, .35, .7, 1)], 0.09, 0.02)
    def arcs(n, r0, r1, h, w, phase):
        for k in range(n):
            t = 360 * k / n + phase
            pts = [polar(r0 + (r1 - r0) * s, t, z + h * 4 * s * (1 - s)) for s in [i / 12 for i in range(13)]]
            tube(bm, pts, w, w * 0.5, 4)
    arcs(18, 0.35, 4.3, 3.4, 0.028, 0)                 # umbrella from the centre
    arcs(22, POOL_R - 0.15, POOL_R - 3.3, 1.15, 0.018, 8)   # thin jets from the rim inward
    me = bpy.data.meshes.new("RO_jet")
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    c.objects.link(bpy.data.objects.new("RO_jet", me))


def build_island():
    # ---- pool: wide low stone coping, dark water, shrubs on the rim ----
    bm = bmesh.new()
    n = 52
    for i in range(n):
        arc_box(bm, POOL_R, POOL_R + RIM_W + R.uniform(-.04, .04), 0.0, RIM_H + R.uniform(-.012, .012),
                360 * i / n, 360 * (i + 0.975) / n, 3)
    finish("pool_coping", bm, [M["stone"]], ci)
    annulus("pool_floor", 0, POOL_R, 0.03, M["pool_floor"], ci, 96)
    annulus("RO_water_surface", 0, POOL_R, WATER_Z, water, ci, 96)
    fountain_render_jets(ci, jet_m)
    shrubs = [shrub_mesh(s) for s in (1, 2, 3)]
    for k in range(8):
        t = 360 * k / 8 + 14 + R.uniform(-5, 5)
        instance("rim_shrub", shrubs[k % 3], polar(POOL_R + RIM_W * 0.75, t, RIM_H - 0.03),
                 -math.radians(t), cp, R.uniform(0.85, 1.15))

    # ---- inner lawn, stone border, post-and-rail fence ----
    annulus("lawn_inner", POOL_R + RIM_W - 0.02, INNER_LAWN, 0.10, M["grass"], ci)
    ring_wall("inner_border", INNER_LAWN, INNER_LAWN + 0.22, 0.0, 0.15, M["stone"], ci)
    rf = INNER_LAWN - 0.18
    bm = bmesh.new()
    count = int(2 * math.pi * rf / 1.35)
    for i in range(count):
        p = polar(rf, 360 * i / count)
        pole(bm, (p.x, p.y, 0.05), (p.x, p.y, 0.62), 0.032, 0)
    arc_box(bm, rf - 0.018, rf + 0.018, 0.52, 0.555, 0, 360, 144)
    finish("inner_fence", bm, [M["iron"]], ci)

    # ---- promenade, cross paths, outer lawns ----
    annulus("promenade", INNER_LAWN + 0.2, ISLAND_R, 0.08, M["promenade"], ci)
    for k, (t0, t1) in enumerate(SEGMENTS):          # lawn between the paths; the paths are the promenade itself
        bm = bmesh.new()
        rows = []
        for j in range(5):
            r = GRAVEL + (BEDS - GRAVEL) * j / 4
            cut = math.degrees(math.asin(PATH_W / 2 / r))
            rows.append([bm.verts.new(polar(r, t0 + cut + (t1 - t0 - 2 * cut) * i / 48, 0.10)) for i in range(49)])
        for j in range(4):
            for i in range(48):
                bm.faces.new((rows[j][i], rows[j + 1][i], rows[j + 1][i + 1], rows[j][i + 1]))
        finish("lawn_beds_%d" % k, bm, [M["grass"]], ci)
    ring_wall("island_curb", ISLAND_R - 0.3, ISLAND_R, 0.0, 0.2, M["concrete"], ci)

    # ---- bench alcoves notched into the lawn, two benches each, with stakes ----
    bench = bench_mesh()
    SIT = random.Random(26)
    for k in range(4):
        for frac in (0.27, 0.73):
            t = at(frac, k)
            half = deg(3.1, GRAVEL + 0.9)
            bm = bmesh.new()
            arc_box(bm, GRAVEL - 0.05, GRAVEL + 1.75, 0.09, 0.115, t - half, t + half, 12)
            finish("alcove", bm, [M["promenade"]], ci)
            for s in (-1, 1):
                tb = t + s * deg(1.35, GRAVEL + 0.95)
                instance("bench", bench, polar(GRAVEL + 0.95, tb, 0.115), math.pi - math.radians(tb), cp)
                if SIT.random() < 0.6:                       # people resting on about half of the benches
                    a = math.radians(tb)
                    along = Vector((math.cos(a), -math.sin(a), 0))
                    for off in SIT.choice(((-0.6,), (0.55,), (-0.55, 0.15))):
                        instance("sitter", SIT.choice(SITTERS), polar(GRAVEL + 0.95, tb, 0.115) + along * off,
                                 math.atan2(-math.cos(a), -math.sin(a)), cp)
            bm = bmesh.new()
            for s in (-1, 1):
                p = polar(GRAVEL + 2.1, t + s * half * 0.55)
                pole(bm, (p.x, p.y, 0.1), (p.x, p.y, 3.2), 0.035, 0)
            finish("bench_stakes", bm, [M["stake"]], cp)
    MID = random.Random(27)                          # own sequence, so the people already seated stay where they were
    for k in range(4):
        t = at(0.5, k)
        half = deg(4.45, GRAVEL + 0.9)
        bm = bmesh.new()
        arc_box(bm, GRAVEL - 0.05, GRAVEL + 1.75, 0.09, 0.115, t - half, t + half, 16)
        finish("alcove", bm, [M["promenade"]], ci)
        for s in (-1, 0, 1):
            tb = t + s * deg(2.7, GRAVEL + 0.95)
            instance("bench", bench, polar(GRAVEL + 0.95, tb, 0.115), math.pi - math.radians(tb), cp)
            seated = None
            if MID.random() < 0.45:
                a = math.radians(tb)
                along = Vector((math.cos(a), -math.sin(a), 0))
                seated = (MID.choice(SITTERS), polar(GRAVEL + 0.95, tb, 0.115) + along * MID.choice((-0.55, 0.15, 0.6)),
                          math.atan2(-math.cos(a), -math.sin(a)))
            if k == 0 and s == 0:                    # Genia's bench (bearing 34)
                a = math.radians(tb)
                instance("genia", GENIA, polar(GRAVEL + 0.95, tb, 0.115), math.atan2(-math.cos(a), -math.sin(a)), cp)
                print("genia bearing", round(tb, 2), "radius", GRAVEL + 0.95)
            elif seated:
                instance("sitter", *seated, cp)

    # ---- flower beds, saplings in tripods, young palms ----
    for k in range(4):
        for frac in (0.36, 0.64):
            t = at(frac, k)
            half = deg(1.9, 28.0)
            bm = bmesh.new()
            arc_box(bm, 27.35, 28.55, 0.1, 0.2, t - half, t + half, 8)
            finish("flower_bed", bm, [M["flowers"]], ci)
    # ---- grass blades: uneven tufts so the lawn does not read as a painted floor ----
    def lawn_point(R):
        while True:
            inner = R.random() < 0.4
            r0, r1 = (POOL_R + RIM_W + 0.05, INNER_LAWN - 0.05) if inner else (GRAVEL + 0.1, BEDS - 0.95)
            r, t = math.sqrt(R.uniform(r0 * r0, r1 * r1)), R.uniform(0, 360)
            if not inner:
                if near_path(t, r, 0.05):
                    continue
                busy = False
                for k in range(4):
                    for frac, lo, hi, half in ((0.27, 0, 26.15, 3.2), (0.73, 0, 26.15, 3.2),
                                               (0.36, 27.25, 28.65, 2.0), (0.64, 27.25, 28.65, 2.0),
                                               (0.5, 0, 26.15, 4.55)):
                        d = (t - at(frac, k) + 180) % 360 - 180
                        busy = busy or (lo < r < hi and abs(math.radians(d) * r) < half)
                if busy:
                    continue
            return r, t

    def tufts(name, count, seed):
        R = random.Random(seed)
        bm = bmesh.new()
        for _ in range(count):
            r, t = lawn_point(R)
            p = polar(r, t, 0.098)
            patch = noise.noise(p * 0.35) + 0.5 * noise.noise(p * 1.3)
            mat = 2 if patch > 0.32 else (1 if patch < -0.2 else 0)
            tall = max(0.03, 0.065 + 0.05 * noise.noise(p * 0.8) + R.uniform(-0.015, 0.025))
            for _b in range(3):
                a = R.uniform(0, 2 * math.pi)
                lean = Vector((math.cos(a), math.sin(a), 0))
                side = Vector((-lean.y, lean.x, 0)) * R.uniform(0.008, 0.016)
                q = p + Vector((R.uniform(-.06, .06), R.uniform(-.06, .06), 0))
                tip = q + lean * tall * R.uniform(0.4, 1.0) + Vector((0, 0, tall * R.uniform(0.7, 1.2)))
                vs = [q - side, q + side, tip]
                if (vs[1] - vs[0]).cross(vs[2] - vs[0]).z < 0:
                    vs.reverse()
                bm.faces.new([bm.verts.new(v) for v in vs]).material_index = mat
        me = bpy.data.meshes.new(name)
        bm.to_mesh(me)
        bm.free()
        for m in ("blade_green", "blade_dark", "blade_dry"):
            me.materials.append(M[m])
        cp.objects.link(bpy.data.objects.new(name, me))

    tufts("grass_tufts", 4500, 41)                    # shipped to the web: kept light
    tufts("RO_grass_dense", 30000, 42)               # Blender renders only

    if FICUS == "young":
        saplings = [sapling_mesh(s) for s in (11, 12, 13)]
        tripod = tripod_mesh()
        i = 0
        for k in range(4):
            for frac, rr in ((0.12, 26.0), (0.44, 25.9), (0.56, 26.2), (0.88, 26.1)):
                p = polar(rr, at(frac, k), 0.1)
                instance("sapling", saplings[i % 3], p, R.uniform(0, 6.28), cp, R.uniform(0.9, 1.1))
                if frac in (0.44, 0.56):
                    instance("tripod", tripod, p, R.uniform(0, 6.28), cp)
                i += 1
    else:                                            # shade trees over the benches and the outer lawn
        inner = [ficus_mesh(s, "mature") for s in (31, 32, 33)]
        for k in range(4):
            for j, frac in enumerate((0.31, 0.69)):
                instance("ficus", inner[(k + j) % 3], polar(28.3, at(frac, k) + R.uniform(-1.5, 1.5), 0.08),
                         R.uniform(0, 6.28), cp, R.uniform(0.72, 0.88))
    palms = [palm_mesh(s) for s in (1, 2, 3)]
    for k in range(4):
        for j, frac in enumerate((0.19, 0.50, 0.81)):
            rr = 27.2 if frac == 0.5 else 26.7
            instance("palm", palms[(k + j) % 3], polar(rr, at(frac, k) + R.uniform(-2, 2), 0.1),
                     R.uniform(0, 6.28), cp, R.uniform(0.85, 1.08))

    # ---- outer edge: clipped hedge, lattice fence between white posts, topiary, lamps ----
    topiary, lamp = topiary_mesh(), lamp_mesh()
    gap = deg(PATH_W / 2 + 0.3, BEDS)
    for k, (a, b) in enumerate(SEGMENTS):
        t0, t1 = a + gap, b - gap
        pieces = max(1, int(math.radians(t1 - t0) * BEDS / 0.7))
        bm = bmesh.new()
        for i in range(pieces):
            s0 = t0 + (t1 - t0) * i / pieces
            arc_box(bm, BEDS - 0.85 + R.uniform(-.06, .06), BEDS - 0.1 + R.uniform(-.04, .04), 0.1,
                    0.68 + R.uniform(-.09, .09), s0, s0 + (t1 - t0) / pieces * 1.04, 2)
        finish("hedge_%d" % k, bm, [M["hedge"]], ci)
        ring_wall_seg = bmesh.new()
        arc_box(ring_wall_seg, BEDS + 0.1, BEDS + 0.42, 0.05, 0.24, t0, t1, 48)
        finish("fence_curb_%d" % k, ring_wall_seg, [M["concrete"]], ci)
        alpha_strip("lattice_%d" % k, BEDS + 0.26, 0.22, 1.02, t0, t1, 0.8, M["lattice"], ci, 64)
        n_post = max(2, int(round(math.radians(t1 - t0) * BEDS / 5.6)))
        bm = bmesh.new()
        for i in range(n_post + 1):
            t = t0 + (t1 - t0) * i / n_post
            p = polar(BEDS + 0.26, t)
            cylinder(bm, 0.22, 0.20, 1.12, 4, (p.x, p.y, 0.05), 0)
            cylinder(bm, 0.24, 0.02, 0.10, 4, (p.x, p.y, 1.17), 0)
        finish("fence_posts_%d" % k, bm, [M["white_iron"]], cp)
        for t in (t0 + deg(0.45, BEDS), (t0 + t1) / 2, t1 - deg(0.45, BEDS)):
            instance("topiary", topiary, polar(BEDS - 0.5, t, 0.1), 0, cp, R.uniform(0.92, 1.06))
        for t in (t0, t1):                                           # lamps on the end posts
            instance("lamp", lamp, polar(BEDS + 0.26, t, 1.1), 0, cp)
        instance("lamp", lamp, polar(GRAVEL + 0.9, at(0.5, k) + deg(4.65, GRAVEL + 0.9), 0.11), 0, cp)   # beside the middle benches, clear of the palm

    # ---- ficus on the outer pavement ----
    if FICUS == "young":
        trees, count, pad = [ficus_mesh(s, "young") for s in (21, 22, 23, 24)], 34, 1.2
        cage = cage_mesh(M["cage"])
    else:
        trees, count, pad = [ficus_mesh(s, "mature") for s in (41, 42, 43, 44, 45, 46)], 26, 1.9
    i = 0
    for k in range(count):
        t = 360 * k / count + 5 + R.uniform(-2.0, 2.0)
        if near_path(t, ISLAND_R - 2.3, pad):
            continue
        p = polar(ISLAND_R - 2.3 + R.uniform(-.25, .25), t, 0.08)
        instance("ficus", trees[i % len(trees)], p, R.uniform(0, 6.28), cp, R.uniform(0.82, 1.14))
        if FICUS == "young":
            instance("tree_cage", cage, p, 0, cp)
        i += 1


build_island()
