"""Low-poly 1930s vehicles (placeholders with period silhouettes). Local +X = forward, z = 0 ground.
Material slots: 0 body, 1 glass, 2 black (tyres, fenders), 3 light (bus roof, headlamps), 4 wood."""
import bmesh, math

BODY, GLASS, BLACK, LIGHT, WOOD = range(5)


def extrude(bm, profile, y0, y1, mat):
    """Side profile [(x, z)] extruded across the width."""
    a = [bm.verts.new((x, y0, z)) for x, z in profile]
    b = [bm.verts.new((x, y1, z)) for x, z in profile]
    n = len(profile)
    faces = [bm.faces.new(a), bm.faces.new(b[::-1])]
    faces += [bm.faces.new((a[i], b[i], b[(i + 1) % n], a[(i + 1) % n])) for i in range(n)]
    for f in faces:
        f.material_index = mat


def box(bm, x0, x1, y0, y1, z0, z1, mat):
    extrude(bm, [(x0, z0), (x1, z0), (x1, z1), (x0, z1)], y0, y1, mat)


def wheel(bm, x, y, r, w=0.18, mat=BLACK, seg=12):
    ring = [(x + r * math.cos(6.283 * i / seg), r + r * math.sin(6.283 * i / seg)) for i in range(seg)]
    extrude(bm, ring, y - w / 2, y + w / 2, mat)
    hub = [(x + r * 0.35 * math.cos(6.283 * i / 8), r + r * 0.35 * math.sin(6.283 * i / 8)) for i in range(8)]
    extrude(bm, hub, y - w / 2 - 0.02, y + w / 2 + 0.02, LIGHT)


def fender(bm, x, y0, y1, r):
    arc = [(x + r * math.cos(a), 0.38 + r * math.sin(a)) for a in (math.radians(t) for t in range(0, 181, 30))]
    inner = [(x + (r - 0.09) * math.cos(a), 0.38 + (r - 0.09) * math.sin(a)) for a in (math.radians(t) for t in range(180, -1, -30))]
    extrude(bm, arc + inner, y0, y1, BLACK)


def sedan(bm):
    extrude(bm, [(-2.0, 0.45), (-2.05, 0.9), (-1.7, 1.02), (0.55, 1.02), (1.75, 0.95), (1.95, 0.8), (1.95, 0.45)], -0.66, 0.66, BODY)
    extrude(bm, [(-1.75, 1.0), (-1.55, 1.45), (-1.15, 1.7), (0.1, 1.72), (0.4, 1.6), (0.62, 1.0)], -0.62, 0.62, BODY)
    for x0, x1 in ((-1.35, -0.6), (-0.5, 0.28)):
        box(bm, x0, x1, -0.635, 0.635, 1.12, 1.52, GLASS)
    extrude(bm, [(0.36, 1.12), (0.45, 1.12), (0.28, 1.55), (0.2, 1.55)], -0.55, 0.55, GLASS)
    box(bm, 1.93, 2.0, -0.28, 0.28, 0.5, 0.95, LIGHT)                       # radiator grille
    for sy in (-1, 1):
        box(bm, 1.7, 1.9, sy * 0.5 - 0.1, sy * 0.5 + 0.1, 0.78, 0.98, LIGHT)  # headlamps
        box(bm, -0.85, 0.95, sy * 0.78 - 0.14, sy * 0.78 + 0.14, 0.36, 0.42, BLACK)   # running board
        for x in (1.35, -1.35):
            fender(bm, x, sy * 0.80 - 0.15, sy * 0.80 + 0.15, 0.52)
            wheel(bm, x, sy * 0.76, 0.38)
    wheel(bm, -2.12, 0, 0.36, 0.12)


def bus(bm):
    extrude(bm, [(-3.7, 0.65), (-3.75, 2.35), (-3.45, 2.75), (2.0, 2.75), (2.35, 2.45), (2.45, 0.65)], -1.15, 1.15, BODY)
    extrude(bm, [(-3.4, 2.74), (-3.2, 2.92), (1.85, 2.92), (2.0, 2.74)], -0.95, 0.95, LIGHT)
    for k in range(6):
        x = -3.35 + k * 0.92
        box(bm, x, x + 0.72, -1.165, 1.165, 1.6, 2.25, GLASS)
    box(bm, 2.33, 2.44, -0.95, 0.95, 1.55, 2.3, GLASS)
    extrude(bm, [(2.4, 0.65), (2.4, 1.55), (3.55, 1.4), (3.7, 1.2), (3.7, 0.65)], -0.55, 0.55, BLACK)
    box(bm, 3.68, 3.76, -0.34, 0.34, 0.7, 1.3, LIGHT)
    for sy in (-1, 1):
        for x in (2.95, -2.4):
            fender(bm, x, sy * 0.98 - 0.2, sy * 0.98 + 0.2, 0.66)
            wheel(bm, x, sy * 1.0, 0.5, 0.26)


def truck(bm):
    extrude(bm, [(0.4, 0.7), (0.4, 2.3), (0.7, 2.45), (1.55, 2.4), (1.75, 1.55), (1.75, 0.7)], -0.95, 0.95, BODY)
    box(bm, 0.7, 1.45, -0.965, 0.965, 1.65, 2.15, GLASS)
    extrude(bm, [(1.72, 0.7), (1.72, 1.55), (2.8, 1.38), (2.9, 0.7)], -0.5, 0.5, BODY)
    box(bm, 2.88, 2.96, -0.3, 0.3, 0.72, 1.3, LIGHT)
    box(bm, -2.9, 0.3, -1.05, 1.05, 0.85, 1.0, WOOD)
    for sy in (-1, 1):
        for z in (1.35, 1.75):
            box(bm, -2.9, 0.3, sy * 1.02 - 0.03, sy * 1.02 + 0.03, z, z + 0.14, WOOD)
        for x in (-2.85, -1.8, -0.75, 0.2):
            box(bm, x, x + 0.07, sy * 1.02 - 0.04, sy * 1.02 + 0.04, 1.0, 1.9, WOOD)
        for x in (2.2, -1.9):
            fender(bm, x, sy * 0.88 - 0.18, sy * 0.88 + 0.18, 0.62)
            wheel(bm, x, sy * 0.9, 0.46, 0.24)


def cart(bm):
    box(bm, -2.0, 0.2, -0.75, 0.75, 0.85, 0.98, WOOD)
    for sy in (-1, 1):
        box(bm, -2.0, 0.2, sy * 0.73 - 0.03, sy * 0.73 + 0.03, 0.98, 1.35, WOOD)
        wheel(bm, -0.9, sy * 0.9, 0.62, 0.09, WOOD, 14)
        box(bm, 0.2, 2.1, sy * 0.4 - 0.03, sy * 0.4 + 0.03, 0.95, 1.02, WOOD)      # shafts
    extrude(bm, [(0.9, 0.95), (0.85, 1.5), (1.9, 1.58), (2.05, 1.0)], -0.28, 0.28, BODY)      # horse barrel
    extrude(bm, [(1.8, 1.45), (2.25, 2.1), (2.65, 1.85), (2.55, 1.65), (2.3, 1.78), (2.05, 1.2)], -0.12, 0.12, BODY)
    for x in (0.98, 1.88):
        for sy in (-0.18, 0.18):
            box(bm, x - 0.07, x + 0.07, sy - 0.06, sy + 0.06, 0.0, 1.05, BODY)
    box(bm, -0.55, -0.25, -0.2, 0.2, 0.98, 1.9, BLACK)                                         # driver


KINDS = {"sedan": sedan, "bus": bus, "truck": truck, "cart": cart}


def make(kind):
    bm = bmesh.new()
    KINDS[kind](bm)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm
