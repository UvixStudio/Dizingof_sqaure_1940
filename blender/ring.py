"""The six ring blocks: one parametric Bauhaus generator, one parameter set per block.
Helpers (Chain, sweep, ...) come from facade.py. See ring_blocks.json for evidence per block."""
import bmesh, math, os, runpy
from mathutils import Vector

F = runpy.run_path(os.path.join(r"C:\Ai\01_kikar_dizingof", "blender", "facade.py"))
Chain, sweep, slab, post, column, awning, solid, drop_loops = (
    F[n] for n in ("Chain", "sweep", "slab", "post", "column", "awning", "solid", "drop_loops"))
PLASTER, GLASS, FRAME, AWNING, ROOF, SHUTTER = range(6)

BASE = {"ground": 4.0, "floor": 3.4, "floors": 2, "style": "bands", "recess": 0.9, "tint": "wall_white",
        "columns": (0.0, 1.0), "penthouse": False, "roofboxes": 2, "tower": None,
        "attic": 0.0, "hip": False, "ends": None}
BLOCKS = {
    149270708: ("A", {"tint": "wall_white", "penthouse": True}),
    495367849: ("B", {"style": "balcony", "floors": 3, "ground": 3.7, "floor": 3.2, "recess": 1.9, "tint": "wall_white",
                      "hip": True, "attic": 3.15, "ends": ((46.9, 40.4), (65.3, -2.0)),
                      "columns": (0.45, 1.0), "roofboxes": 0,
                      "tower": {"corner": (50.6, 1.6), "before": 7.5, "after": 3.0}}),
    495912832: ("C", {"recess": 1.3, "tint": "wall_white", "roofboxes": 3}),
    495912626: ("D", {"penthouse": True, "tint": "wall_white"}),
    495912569: ("E", {"recess": 1.1, "tint": "wall_white", "penthouse": True}),
    296103022: ("F", {"tint": "wall_white", "recess": 0.8, "roofboxes": 3}),
}


_sweep = sweep


def sweep(bm, ch, s0, s1, profile, mat):
    """Glass, frames and shutters stop 3 cm short, so their ends never share a plane with the wall ends."""
    if mat in (GLASS, FRAME, SHUTTER) and s1 - s0 > 0.2:
        s0, s1 = s0 + 0.03, s1 - 0.03
    _sweep(bm, ch, s0, s1, profile, mat)


def auto_ends(outline):
    P = [Vector(p) for p in outline]
    rmin = min(p.length for p in P)
    near = [p for p in P if p.length < rmin + 14]
    mid = sum(near, Vector((0, 0))) / len(near)
    def rel(p):
        return (math.atan2(p.x, p.y) - math.atan2(mid.x, mid.y) + math.pi) % (2 * math.pi) - math.pi
    return tuple(min(near, key=rel)), tuple(max(near, key=rel))


def box(bm, p, n, w, d, z0, z1, mat):
    t = Vector((-n.y, n.x))
    ring = [p + t * w / 2, p - t * w / 2, p - t * w / 2 + n * d, p + t * w / 2 + n * d]
    solid(bm, ring, z0, z1, mat)


def block(outline, over):
    """Returns (bmesh, info) for one block."""
    P = dict(BASE, **over)
    a, b = P["ends"] or auto_ends(outline)
    ch = Chain(outline, a, b)
    L = ch.length
    G, H, N, D = P["ground"], P["floor"], P["floors"], P["recess"]
    B = D + 0.6                                   # back of all facade layers
    top = G + H * N
    T = P["tower"]
    t0 = t1 = L
    corner = None
    if T:
        corner = ch.s_near(T["corner"])
        t0, t1 = corner - T["before"], min(L, corner + T["after"])
    bm = bmesh.new()
    inner = max(B - 0.05, max(1.45, B - 0.5) + 0.08)                # always behind the shop glass
    core = drop_loops([ch.at(s, inner)[0] for s in ch.s]) + ch.rest
    solid(bm, core, 0.0, top + 0.2, PLASTER)

    # ground floor: shopfronts behind columns, fascia, awnings
    c0, c1 = P["columns"][0] * t0, P["columns"][1] * t1
    back = max(1.45, B - 0.5)
    sweep(bm, ch, 0, L, slab(0.0, 0.45, back - 0.1, B), PLASTER)
    sweep(bm, ch, 0, L, slab(0.45, G - 0.6, back, B), GLASS)
    sweep(bm, ch, 0, L, slab(G - 0.6, G, 0.35, B), PLASTER)
    if c0 > 1:                                    # solid shop walls where there is no colonnade
        s = 0.2
        while s < c0:
            post(bm, ch, s, 0.7, 0.5, back - 0.65, 0.0, G - 0.6, PLASTER)
            for k in (1, 2, 3):
                post(bm, ch, s + k * 1.05, back - 0.07, 0.07, 0.12, 0.45, G - 0.6, FRAME)
            s += 4.2
    s = c0 + 0.6
    while s < c1:
        column(bm, ch, s, 0.65, 0.27, G - 0.55, PLASTER)
        for k in (1, 3):
            post(bm, ch, s + k * 1.05, back - 0.07, 0.07, 0.12, 0.45, G - 0.6, FRAME)
        s += 4.2
    # upper floors
    for i in range(N):
        z = G + H * i
        if P["style"] == "balcony":
            sweep(bm, ch, 0, t0, [(0, z), (B, z), (B, z + 0.2), (0.18, z + 0.2),
                                  (0.18, z + 1.38), (0, z + 1.38)], PLASTER)
            sweep(bm, ch, 0, t0, slab(z + 1.58, z + 1.63, 0.1, 0.16), FRAME)
            win0, win1, top_gap = z + 0.2, z + 2.85, 0.14
            sweep(bm, ch, 0, t0, slab(win1, z + H - top_gap, 0.04, B), PLASTER)
        else:                                     # deep parapet band, separate windows (MAT-22292, B9-48)
            sweep(bm, ch, 0, t0, [(0, z), (B, z), (B, z + 0.2), (0.18, z + 0.2),
                                  (0.18, z + 1.3), (0, z + 1.3)], PLASTER)
            sweep(bm, ch, 0, t0, slab(z + 1.0, z + 1.07, -0.025, 0.02), FRAME)        # shadow groove
            sweep(bm, ch, 0, t0, slab(z + 0.2, z + H, D, B), PLASTER)                 # white wall behind
            s, k = 0.5, 0
            while s + 1.6 < t0:
                if k % 4 != 3:                                                        # a solid pier every 4th bay
                    sweep(bm, ch, s, s + 1.35, slab(z + 1.15, z + 2.75, D - 0.05, D + 0.02), GLASS)
                    post(bm, ch, s + 0.67, D - 0.08, 0.07, 0.06, z + 1.15, z + 2.75, FRAME)
                    if (k + i) % 3 == 0:
                        sweep(bm, ch, s, s + 0.62, slab(z + 1.9, z + 2.8, D - 0.1, D - 0.06), SHUTTER)
                s += 1.9
                k += 1
            continue
        sweep(bm, ch, 0, t0, slab(win0, win1, D, B), GLASS)
        sweep(bm, ch, 0, t0, slab(z + 1.08, z + 1.14, -0.025, 0.02), FRAME)           # shadow groove
        s, k = 0.4, 0
        while s < t0:
            post(bm, ch, s, D - 0.07, 0.22 if k % 4 == 0 else 0.07, 0.09, win0, win1, FRAME)
            if k % 3 == 0:
                post(bm, ch, s, 0.1, 0.05, 0.05, z + 1.38, z + 1.6, FRAME)
            s += 0.95
            k += 1

    # crown: parapet + cornice, optional plain attic
    if not P["attic"]:
        sweep(bm, ch, 0, t0, slab(top + 0.8, top + 0.87, -0.025, 0.02), FRAME)
    sweep(bm, ch, 0, t0, [(0, top), (B, top), (B, top + 0.2), (0.2, top + 0.2),
                          (0.2, top + 1.15), (0, top + 1.15)], PLASTER)
    if P["attic"]:
        sweep(bm, ch, 0, t0, slab(top + 0.18, top + P["attic"] - 0.15, 0.75, B), PLASTER)
        sweep(bm, ch, 0, t0, slab(top + P["attic"] - 0.15, top + P["attic"], 0.65, B + 0.05), PLASTER)
    else:
        sweep(bm, ch, 0, t0, slab(top + 1.15, top + 1.27, -0.12, 0.32), PLASTER)

    info = {"chain": ch, "G": G, "H": H, "t0": t0, "tower": corner if T else L, "top": top, "attic": P["attic"]}
    if T:                                         # blank corner wall, flush with the attic
        th = top + P["attic"]
        sweep(bm, ch, t0, t1, slab(G, th, 0.05, B), PLASTER)
        sweep(bm, ch, t0, t1, slab(G - 0.05, G + 0.3, -1.1, 0.1), PLASTER)
        if L - t1 > 0.5:
            sweep(bm, ch, t1, L, slab(G, top + 1.4, 0.4, B), PLASTER)
        for key, s, z in (("name", (t0 + corner) / 2, th - 0.5), ("shop", (t0 + corner) / 2, G + 0.38)):
            p, n = ch.at(s, -0.14 if key == "name" else -1.18)
            info[key] = (p.x, p.y, z, -n.x, -n.y)

    mid = sum(core, Vector((0, 0))) / len(core)
    if P["penthouse"]:
        s0, s1 = L * 0.22, L * 0.72
        sweep(bm, ch, s0, s1, slab(top + 0.2, top + 3.0, 2.6, 5.0), PLASTER)
        sweep(bm, ch, s0 + 0.6, s1 - 0.6, slab(top + 1.0, top + 2.3, 2.54, 2.62), GLASS)
        sweep(bm, ch, s0 - 0.3, s1 + 0.3, slab(top + 3.0, top + 3.16, 2.0, 5.3), PLASTER)
    for k in range(P["roofboxes"]):
        p, n = ch.at(L * (k + 0.7) / (P["roofboxes"] + 0.4), 5.5)
        box(bm, p, n, 3.2 - 0.5 * k % 2, 2.8, top + 0.2, top + 2.3 + 0.5 * (k % 2), PLASTER)
    if P["hip"]:
        def ring(k, z):
            return [bm.verts.new((mid.x + (p.x - mid.x) * k, mid.y + (p.y - mid.y) * k, z)) for p in core]
        lo, hi = ring(0.88, top + 1.6), ring(0.22, top + 5.0)
        m = len(core)
        for i in range(m):
            bm.faces.new((lo[i], lo[(i + 1) % m], hi[(i + 1) % m], hi[i])).material_index = ROOF
        bm.faces.new(hi).material_index = ROOF
        bm.faces.new(lo[::-1]).material_index = ROOF

    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm, info
