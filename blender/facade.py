"""Bauhaus ring-block generator: sweeps profiles along the OSM facade line.

The OSM outline is treated as the outermost line (balcony fronts). Everything else is an
inward offset of the "chain": the part of the outline that faces the square, plus the
returns along the two side streets, ordered from one side street to the other.
`s` = distance in metres along that chain.
"""
import bmesh, math
from mathutils import Vector


def densify(pts, step=1.2):
    out = []
    for a, b in zip(pts, pts[1:]):
        n = max(1, int(math.ceil((b - a).length / step)))
        out += [a.lerp(b, i / n) for i in range(n)]
    return out + [pts[-1]]


class Chain:
    def __init__(self, outline, end_a, end_b):
        """outline: list of (x, y); end_a / end_b: points near the two ends of the facade."""
        P = [Vector((x, y)) for x, y in outline]
        n = len(P)
        area = sum(P[i].x * P[(i + 1) % n].y - P[(i + 1) % n].x * P[i].y for i in range(n))
        ia = min(range(n), key=lambda i: (P[i] - Vector(end_a)).length)
        ib = min(range(n), key=lambda i: (P[i] - Vector(end_b)).length)
        paths = []
        for step in (1, -1):
            path, i = [ia], ia
            while i != ib:
                i = (i + step) % n
                path.append(i)
            paths.append((step, path))
        # the facade is the path that stays closer to the centre of the square
        step, path = min(paths, key=lambda sp: sum(P[i].length for i in sp[1]) / len(sp[1]))
        self.rest = []
        i = (ib + step) % n
        while i != ia:
            self.rest.append(P[i])
            i = (i + step) % n
        self.left_normal = (area > 0) == (step > 0)   # which side of travel is inside
        self.pts = densify([P[i] for i in path])
        self.s = [0.0]
        for a, b in zip(self.pts, self.pts[1:]):
            self.s.append(self.s[-1] + (b - a).length)
        self.length = self.s[-1]
        self.normals = []                              # inward miter vectors
        for k in range(len(self.pts)):
            ns = []
            for a, b in ((k - 1, k), (k, k + 1)):
                if 0 <= a and b < len(self.pts):
                    d = (self.pts[b] - self.pts[a]).normalized()
                    ns.append(Vector((-d.y, d.x)) if self.left_normal else Vector((d.y, -d.x)))
            m = sum(ns, Vector((0, 0))).normalized()
            self.normals.append(m / max(0.5, m.dot(ns[0])))
        self._bends = None

    def at(self, s, inset=0.0):
        """Point and inward normal at distance s."""
        s = min(max(s, 0.0), self.length)
        k = next((i for i in range(1, len(self.s)) if self.s[i] >= s), len(self.s) - 1)
        t = (s - self.s[k - 1]) / max(1e-6, self.s[k] - self.s[k - 1])
        nrm = self.normals[k - 1].lerp(self.normals[k], t)
        return self.pts[k - 1].lerp(self.pts[k], t) + nrm * inset, nrm.normalized()

    def samples(self, s0, s1):
        inner = [s for s in self.s if s0 + 0.05 < s < s1 - 0.05]
        return [s0] + inner + [s1]

    def cuts(self, s0, s1):
        """Like samples(), without the cuts that do not change the shape (straight runs)."""
        if self._bends is None:
            self._bends = self._find_bends()
        return [s0] + [s for s in self._bends if s0 + 0.05 < s < s1 - 0.05] + [s1]

    def _find_bends(self, tol=0.001, insets=(-1.2, 0.0, 1.5, 3.0, 5.0, 7.0)):
        """The distances needed so that every offset of the chain stays within `tol` metres of itself."""
        lines = [[self.at(s, d)[0] for s in self.s] for d in insets]

        def straight(i, j):
            for p in lines:
                a, ab = p[i], p[j] - p[i]
                for k in range(i + 1, j):
                    t = max(0.0, min(1.0, (p[k] - a).dot(ab) / max(1e-9, ab.length_squared)))
                    if (a + ab * t - p[k]).length > tol:
                        return False
            return True

        keep, i, n = [self.s[0]], 0, len(self.s)
        while i < n - 1:
            j = i + 1
            while j + 1 < n and straight(i, j + 1):
                j += 1
            keep.append(self.s[j])
            i = j
        return keep

    def s_near(self, xy):
        k = min(range(len(self.pts)), key=lambda i: (self.pts[i] - Vector(xy)).length)
        return self.s[k]


def sweep(bm, ch, s0, s1, profile, mat=0):
    """Extrude a closed (inset, z) profile along the chain between s0 and s1, with end caps."""
    rings = []
    for s in ch.cuts(s0, s1):
        ring = []
        for inset, z in profile:
            p, _ = ch.at(s, inset)
            ring.append(bm.verts.new((p.x, p.y, z)))
        rings.append(ring)
    n = len(profile)
    faces = []
    for a, b in zip(rings, rings[1:]):
        for k in range(n):
            faces.append(bm.faces.new((a[k], b[k], b[(k + 1) % n], a[(k + 1) % n])))
    faces.append(bm.faces.new(rings[0][::-1]))
    faces.append(bm.faces.new(rings[-1]))
    for f in faces:
        f.material_index = mat


def slab(z0, z1, a, b):
    return [(a, z0), (b, z0), (b, z1), (a, z1)]


def post(bm, ch, s, inset, width, depth, z0, z1, mat):
    """Vertical bar standing across the facade at distance s (mullions, jambs)."""
    p, n = ch.at(s, inset)
    t = Vector((-n.y, n.x))
    corners = [p + t * (width / 2) + n * 0, p - t * (width / 2), p - t * (width / 2) + n * depth,
               p + t * (width / 2) + n * depth]
    lo = [bm.verts.new((c.x, c.y, z0)) for c in corners]
    hi = [bm.verts.new((c.x, c.y, z1)) for c in corners]
    for f in [bm.faces.new(lo[::-1]), bm.faces.new(hi)] + [
            bm.faces.new((lo[i], lo[(i + 1) % 4], hi[(i + 1) % 4], hi[i])) for i in range(4)]:
        f.material_index = mat


def column(bm, ch, s, inset, r, z1, mat, seg=10):
    p, _ = ch.at(s, inset)
    lo = [bm.verts.new((p.x + r * math.cos(6.283 * i / seg), p.y + r * math.sin(6.283 * i / seg), 0))
          for i in range(seg)]
    hi = [bm.verts.new((v.co.x, v.co.y, z1)) for v in lo]
    for i in range(seg):
        bm.faces.new((lo[i], lo[(i + 1) % seg], hi[(i + 1) % seg], hi[i])).material_index = mat


def awning(bm, ch, s0, s1, mat):
    """Sloping cloth awning with a short valance."""
    rows = []
    for s in ch.samples(s0, s1):
        top, n = ch.at(s, 0.3)
        low = top - n * 1.7
        rows.append([bm.verts.new((top.x, top.y, 3.55)), bm.verts.new((low.x, low.y, 2.85)),
                     bm.verts.new((low.x, low.y, 2.6))])
    for a, b in zip(rows, rows[1:]):
        for k in (0, 1):
            bm.faces.new((a[k], b[k], b[k + 1], a[k + 1])).material_index = mat


def panel(bm, ch, s0, s1, z0, z1, inset, mat):
    """Thin flat slab standing just in front of the facade (posters, signs)."""
    sweep(bm, ch, s0, s1, slab(z0, z1, inset, inset + 0.12), mat)


def solid(bm, ring_xy, z0, z1, mat=0):
    """Closed prism from a 2D polygon."""
    lo = [bm.verts.new((p.x, p.y, z0)) for p in ring_xy]
    hi = [bm.verts.new((p.x, p.y, z1)) for p in ring_xy]
    n = len(lo)
    for f in [bm.faces.new(lo[::-1]), bm.faces.new(hi)] + [
            bm.faces.new((lo[i], lo[(i + 1) % n], hi[(i + 1) % n], hi[i])) for i in range(n)]:
        f.material_index = mat


def drop_loops(pts):
    """Remove the small self-intersections an inward offset makes at tight corners."""
    from mathutils.geometry import intersect_line_line_2d
    pts = list(pts)
    i = 0
    while i < len(pts) - 3:
        for j in range(min(len(pts) - 2, i + 14), i + 1, -1):
            x = intersect_line_line_2d(pts[i], pts[i + 1], pts[j], pts[j + 1])
            if x:
                pts[i + 1:j + 1] = [x]
                break
        i += 1
    return pts
