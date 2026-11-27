"""Street lamps beyond the square: on both corners of a street mouth and along the street, half a metre behind the
asphalt edge, staggered from side to side. The places are an urban reading, not taken from photos, and the lamp is
the garden's own, a little taller. Run by build_square.py with its globals."""
import math
from mathutils import Vector

EDGE = STREET_W / 2 + 0.5          # from the street axis
CORNER_R = ROAD[1] + 0.9           # on the ring pavement, behind its curb
SIDE_A = (58.0, 82.0, 106.0)       # metres out from the centre; 24 m apart on one side ...
SIDE_B = (70.0, 94.0, 118.0)       # ... and the other side half a step further
SCALE = 1.25
CLEAR = 0.6                        # least distance from a wall
DRESSED = ("Dizengoff N",)         # one street first, the rest after approval


def wall_distance(p, footprints):
    """Distance to the nearest building outline, negative inside a building."""
    best = 1e9
    for poly in footprints:
        inside = False
        for a, b in zip(poly, poly[1:] + poly[:1]):
            ax, ay, dx, dy = a[0], a[1], b[0] - a[0], b[1] - a[1]
            t = max(0.0, min(1.0, ((p[0] - ax) * dx + (p[1] - ay) * dy) / (dx * dx + dy * dy or 1.0)))
            best = min(best, math.hypot(p[0] - ax - t * dx, p[1] - ay - t * dy))
            if (a[1] > p[1]) != (b[1] > p[1]) and p[0] < dx * (p[1] - ay) / dy + ax:
                inside = not inside
        if inside:
            return -1.0
    return best


def places(bearing):
    """(x, y) of every lamp that belongs to one street."""
    a = math.radians(bearing)
    out = Vector((math.sin(a), math.cos(a)))
    across = Vector((out.y, -out.x))
    for side, run in ((-1, SIDE_A), (1, SIDE_B)):
        corner = bearing + side * math.degrees(math.asin(EDGE / CORNER_R))
        yield polar(CORNER_R, corner).to_2d()
        for r in run:
            yield out * r + across * side * EDGE


def street_lamps(mesh, footprints, c):
    placed, skipped = 0, []
    for street in DRESSED:
        for p in places(STREETS[street]):
            if wall_distance(p, footprints) < CLEAR:
                skipped.append((street, round(p.x, 1), round(p.y, 1)))
                continue
            instance("lamp_street", mesh, Vector((p.x, p.y, 0.0)), 0, c, SCALE)
            placed += 1
    print("street lamps", placed, "skipped", skipped)
    return placed, skipped
