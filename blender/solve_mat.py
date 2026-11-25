"""Fit the camera of MAT-22292 (1938): island circles of known radius, the far street, and the
foot of the corner building to its right. Tries all six streets and keeps the best."""
import json, math
import numpy as np
from scipy.optimize import least_squares

W, H = 1500, 1011
FENCE = [(108,725),(150,762),(200,787),(300,815),(450,839),(600,850),(760,853),(900,848),(1100,837),(1250,814),
         (1350,781),(1405,738),(1385,690),(1300,651),(1150,616),(1000,600),(860,593),(640,597),(500,607),(350,621),(200,647),(130,686)]
RIM = [(396,690),(430,716),(490,731),(600,745),(750,753),(900,747),(1000,736),(1062,718),(1090,694),(1062,668),
       (950,640),(860,630),(640,630),(505,642),(432,665)]
STREET = [(690, 440), (672, 415), (705, 465)]            # middle of the far street, on the ground
FOOT = [(960, 486), (1080, 488), (1200, 490), (1300, 492)]
STREETS = {"Dizengoff N": (348, 149270708), "Reines": (43, 495367849), "Zamenhof": (98, 495912832),
           "Dizengoff S": (168, 495912626), "Pinsker": (225, 495912569), "Ben Ami": (299, 296103022)}
LAT0, LON0 = 32.077982, 34.774206
osm = json.load(open("data/osm/square_raw.json", encoding="utf-8"))
POLY = {e["id"]: [np.array([(g["lon"]-LON0)*111320*math.cos(math.radians(LAT0)), (g["lat"]-LAT0)*110574]) for g in e["geometry"]]
        for e in osm["elements"] if e.get("id") in {v[1] for v in STREETS.values()}}

def ground(c, px, z):
    x, y, h, yaw, pitch, f = c
    fw = np.array([math.sin(yaw)*math.cos(pitch), math.cos(yaw)*math.cos(pitch), math.sin(pitch)])
    rt = np.array([math.cos(yaw), -math.sin(yaw), 0.0]); up = np.cross(rt, fw)
    ray = fw + rt*(px[0]-W/2)/f - up*(px[1]-H/2)/f
    return np.array([x, y, h]) + ray * (z - h) / min(ray[2], -1e-4)

def to_poly(p, poly):
    best = 1e9
    for a, b in zip(poly, poly[1:]):
        t = max(0.0, min(1.0, float((p-a) @ (b-a) / max(1e-9, (b-a) @ (b-a)))))
        best = min(best, float(np.linalg.norm(p - a - t*(b-a))))
    return best

def res(c, bearing, poly):
    out = [(np.linalg.norm(ground(c, p, 0.2)[:2]) - 16.0) / 0.35 for p in FENCE]
    out += [(np.linalg.norm(ground(c, p, 0.22)[:2]) - 9.1) / 0.45 for p in RIM]
    for p in STREET:
        g = ground(c, p, 0.0)[:2]
        d = (math.degrees(math.atan2(g[0], g[1])) - bearing + 180) % 360 - 180
        out.append(math.radians(d) * np.linalg.norm(g) / 2.5)
    out += [to_poly(ground(c, p, 0.0)[:2], poly) / 1.5 for p in FOOT]
    return np.array(out)

scores = {}
for name, (bearing, oid) in STREETS.items():
    best = None
    for dist in (50, 68, 85):
        for off in (-22, -8, 8):
            yaw = math.radians(bearing + off)
            x0 = [-dist*math.sin(yaw), -dist*math.cos(yaw), 15, yaw, -0.18, 2400]
            lo = [-110, -110, 6, yaw-0.8, -0.7, 1000]; hi = [110, 110, 35, yaw+0.8, -0.03, 4500]
            s = least_squares(res, np.clip(x0, lo, hi), args=(bearing, POLY[oid]), loss="soft_l1", bounds=(lo, hi))
            if best is None or s.cost < best.cost: best = s
    c = best.x
    scores[name] = (best.cost, c, oid)
    print(f"{name:12s} cost {best.cost:6.1f}  pos {np.round(c[:3],1)} yaw {math.degrees(c[3])%360:.0f} f {c[5]:.0f}")
name = min(scores, key=lambda k: scores[k][0]); cost, c, oid = scores[name]
json.dump({"street": name, "building_osm": oid, "cost": round(float(cost), 1), "pos": [round(float(v), 2) for v in c[:3]],
           "yaw": round(math.degrees(c[3]) % 360, 2), "pitch": round(math.degrees(c[4]), 2), "focal_px": round(float(c[5]))},
          open("blender/camera_mat.json", "w"), indent=1)
print("BEST", name)
