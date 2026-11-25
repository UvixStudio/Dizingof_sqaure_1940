"""Draw OSM footprints and ground rings on 219fab55 with the solved camera (check of the fit)."""
import json, math, sys
import numpy as np
from PIL import Image, ImageDraw
exec(open("blender/solve_camera.py", encoding="utf-8").read().split("_osm =")[0].replace("from scipy.optimize import least_squares", ""))
r = json.load(open("blender/camera_219.json"))
v = r[sys.argv[1] if len(sys.argv) > 1 else r["best"]]
c = np.array([*v["pos"], math.radians(v["yaw"]), math.radians(v["pitch"]), v["focal_px"]])
d = json.load(open("data/osm/square_raw.json", encoding="utf-8"))
LAT0, LON0 = 32.077982, 34.774206
ids = {149270708: "A", 495367849: "B", 495912832: "C", 495912626: "D", 495912569: "E", 296103022: "F"}
im = Image.open("data/research_images/219fab55-image.jpg").convert("RGB"); dr = ImageDraw.Draw(im)
f = basis(c[3], c[4])[0]
def line(a, b, col, w=3):
    pts = [np.array(a) + (np.array(b) - np.array(a)) * t / 20 for t in range(21)]
    for p, q in zip(pts, pts[1:]):
        if (p - c[:3]) @ f > 3 and (q - c[:3]) @ f > 3:
            dr.line([tuple(project(c, p)), tuple(project(c, q))], fill=col, width=w)
for R, col in ((v["r_pool"], (0, 200, 255)), (v["r_fence"], (0, 255, 120)), (32, (0, 180, 0)), (39.5, (160, 160, 160))):
    ring = [(R * math.sin(t), R * math.cos(t), 0.2) for t in np.linspace(0, 2 * math.pi, 200)]
    for a, b in zip(ring, ring[1:]):
        line(a, b, col, 2)
for e in d["elements"]:
    if e["id"] not in ids: continue
    p = [((g["lon"] - LON0) * 111320 * math.cos(math.radians(LAT0)), (g["lat"] - LAT0) * 110574) for g in e["geometry"]]
    col = {"B": (255, 40, 40), "C": (255, 220, 0)}.get(ids[e["id"]], (255, 0, 255))
    for z in (0, 15):
        for a, b in zip(p, p[1:]):
            line((*a, z), (*b, z), col, 4 if z == 0 else 2)
    m = np.mean(p, axis=0)
    if (np.array([*m, 8]) - c[:3]) @ f > 3:
        dr.text(tuple(project(c, (*m, 8))), ids[e["id"]], fill=col)
im.save("data/comparisons/overlay_219.jpg", quality=90); print("ok")


def height_at(px, osm_id=495367849):
    """Height of the facade seen at pixel px: ray against the vertical walls of the footprint."""
    fw, rt, up = basis(c[3], c[4])
    ray = fw + rt * (px[0] - W / 2) / c[5] - up * (px[1] - H / 2) / c[5]
    e = next(e for e in d["elements"] if e["id"] == osm_id)
    p = [np.array([(g["lon"] - LON0) * 111320 * math.cos(math.radians(LAT0)), (g["lat"] - LAT0) * 110574]) for g in e["geometry"]]
    hits = []
    for a, b in zip(p, p[1:]):
        M = np.array([ray[:2], a - b]).T
        if abs(np.linalg.det(M)) < 1e-9: continue
        t, u = np.linalg.solve(M, a - c[:2])
        if t > 0 and 0 <= u <= 1: hits.append(t)
    return round(float(c[2] + min(hits) * ray[2]), 2) if hits else None


if __name__ == "__main__":
    for x, ys in ((520, (162, 206, 246, 267, 292, 328, 345, 367, 397, 413, 441, 462, 488)),
                  (900, (140, 172, 207, 228, 252, 290, 322, 343, 375, 400, 432, 455)),
                  (1080, (112, 340, 402, 425))):
        print("x", x, [(y, height_at((x, y))) for y in ys])
