"""Fit the camera of 219fab55 from ground features, one hypothesis per cinema end.
World: x east, y north, z up, origin = fountain centre. Pixels of the 1938 x 1125 original."""
import json, math
import numpy as np
from scipy.optimize import least_squares

W, H = 1938, 1125
FENCE = [(843, 955), (850, 935), (870, 885), (920, 845), (1000, 800), (1100, 765), (1200, 745), (1300, 732),
         (1420, 727), (1500, 727), (1600, 736), (1700, 752), (1800, 775), (1900, 810), (850, 978),
         (880, 1035), (940, 1080)]
POOL = [(1150, 893), (1180, 868), (1220, 848), (1280, 825), (1350, 811), (1420, 807), (1500, 809),
        (1580, 822), (1650, 845), (1700, 872), (1230, 990), (1300, 1014), (1400, 1028), (1500, 1025),
        (1580, 1012), (1640, 992)]
VP = (1359, 80)                 # vanishing point of the street right of the tower
COLUMN = (1017, 515)            # foot of the corner column under the tower
HYP = {   # name: (street bearing, foot of the corner column on the OSM outline, 0.65 m inside)
    "tower at Zamenhof": (98, (51.2, 1.9)),
    "tower at Reines": (43, (40.8, 29.4)),
}


def basis(yaw, pitch):
    f = np.array([math.sin(yaw) * math.cos(pitch), math.cos(yaw) * math.cos(pitch), math.sin(pitch)])
    r = np.array([math.cos(yaw), -math.sin(yaw), 0.0])
    return f, r, np.cross(r, f)


def project(c, p):
    f, r, u = basis(c[3], c[4])
    d = np.asarray(p, float) - c[:3]
    z = d @ f
    return np.array([W / 2 + c[5] * (d @ r) / z, H / 2 - c[5] * (d @ u) / z])


def ground(c, px, z):
    f, r, u = basis(c[3], c[4])
    d = f + r * (px[0] - W / 2) / c[5] - u * (px[1] - H / 2) / c[5]
    t = (z - c[2]) / min(d[2], -1e-4)
    return c[:3] + d * t


_osm = json.load(open("data/osm/square_raw.json", encoding="utf-8"))
B_POLY = [np.array([(g["lon"] - 34.774206) * 111320 * math.cos(math.radians(32.077982)), (g["lat"] - 32.077982) * 110574])
          for e in _osm["elements"] if e["id"] == 495367849 for g in e["geometry"]]


def to_outline(p):
    best = 1e9
    for a, b in zip(B_POLY, B_POLY[1:]):
        t = max(0.0, min(1.0, float((p - a) @ (b - a) / max(1e-9, (b - a) @ (b - a)))))
        best = min(best, float(np.linalg.norm(p - a - t * (b - a))))
    return best


# left rounded corner of the cinema (x = 520 px): centres of the three window ribbons.
# Heights assume 3.2 m floors with the ground floor at 3.7 m (typical, not documented).
FLOORS = [((520, 277), 12.2), ((520, 360), 9.0), ((520, 440), 5.8)]


def facade_z(c, px):
    f, r, u = basis(c[3], c[4])
    ray = f + r * (px[0] - W / 2) / c[5] - u * (px[1] - H / 2) / c[5]
    hits = []
    for a, b in zip(B_POLY, B_POLY[1:]):
        M = np.array([ray[:2], a - b]).T
        if abs(np.linalg.det(M)) < 1e-9:
            continue
        t, v = np.linalg.solve(M, a - c[:2])
        if t > 0 and 0 <= v <= 1:
            hits.append(t)
    return c[2] + min(hits) * ray[2] if hits else -20.0


def residuals(c, bearing, col):
    rf, rp = c[6], c[7]
    out = [(np.linalg.norm(ground(c, p, 0.25)[:2]) - rf) / 0.35 for p in FENCE]
    out += [(np.linalg.norm(ground(c, p, 0.4)[:2]) - rp) / 0.35 for p in POOL if p[1] < 900]   # near edge is below ground
    b = math.radians(bearing)
    far = c[:3] + 1e5 * np.array([math.sin(b), math.cos(b), 0])
    out += list((project(c, far) - VP) / 18.0)
    out += [(rp - rf * 0.575) / 0.6, (rf - 12.9) / 3.0, (c[2] - 20) / 10]     # loose priors
    out.append((to_outline(ground(c, COLUMN, 0.0)[:2]) - 0.65) / 0.5)   # foot of the visible corner column
    out += [(facade_z(c, px) - z) / 0.4 for px, z in FLOORS]
    return np.array(out)


results = {}
for name, (bearing, col) in HYP.items():
    best = None
    for dist in (45, 70, 100):
        for dyaw in (-25, 0, 25):
            yaw = math.radians(bearing + dyaw)
            x0 = np.array([-dist * math.sin(yaw), -dist * math.cos(yaw), 22, yaw, math.radians(-14), 2200, 13, 7.6])
            lo = [-140, -140, 10, yaw - .9, math.radians(-35), 1100, 10, 6.4]
            hi = [140, 140, 40, yaw + .9, math.radians(-4), 5000, 19, 11]
            x0 = np.clip(x0, lo, hi)
            s = least_squares(residuals, x0, args=(bearing, col), loss="soft_l1", bounds=(lo, hi),
                              x_scale=[10, 10, 5, .2, .1, 300, 1, .5])
            if best is None or s.cost < best.cost:
                best = s
    c = best.x
    results[name] = {"cost": round(float(best.cost), 1), "pos": [round(float(v), 1) for v in c[:3]],
                     "yaw": round(math.degrees(c[3]) % 360, 2), "pitch": round(math.degrees(c[4]), 2),
                     "focal_px": round(float(c[5])), "r_fence": round(float(c[6]), 2), "r_pool": round(float(c[7]), 2),
                     "column_px": [round(float(v)) for v in project(c, (col[0], col[1], 0))],
                     "dist_to_column": round(float(np.linalg.norm(c[:2] - np.array(col))), 1)}
    print(name, json.dumps(results[name]))
best = min(results, key=lambda k: results[k]["cost"])
json.dump({"best": best, **results}, open(__file__.replace("solve_camera.py", "camera_219.json"), "w"), indent=1)
print("BEST:", best)
