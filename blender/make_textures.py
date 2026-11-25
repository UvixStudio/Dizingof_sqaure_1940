"""Seamless ground/wall textures for the Blender scene and the web (1024 px JPG).
Run once:  python blender/make_textures.py  -> blender/tex/*.jpg
Noise is built in the frequency domain, so every map tiles without seams."""
import os
import numpy as np
from PIL import Image

N = 1024
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "tex")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(1940)
fy = np.fft.fftfreq(N)[:, None]
fx = np.fft.fftfreq(N)[None, :]
F = np.sqrt(fx * fx + fy * fy)


def noise(lo, hi=0.5, power=1.0):
    """Band-limited periodic noise in 0..1: lo/hi are cutoffs in cycles per pixel."""
    spec = np.fft.fft2(rng.standard_normal((N, N)))
    mask = ((F >= lo) & (F <= hi)) / np.maximum(F, 1e-6) ** power
    n = np.real(np.fft.ifft2(spec * mask))
    n -= n.min()
    return n / n.max()


def speckle(density, size_px):
    """Periodic random dots (gravel stones, grass tips)."""
    img = np.zeros((N, N))
    k = int(N * N * density)
    ys, xs = rng.integers(0, N, k), rng.integers(0, N, k)
    vals = rng.uniform(-1, 1, k)
    r = max(1, size_px)
    for dy in range(-r + 1, r):
        for dx in range(-r + 1, r):
            if dx * dx + dy * dy < r * r:
                np.add.at(img, ((ys + dy) % N, (xs + dx) % N), vals)
    return np.clip(img, -1, 1)


def save(name, rgb):
    rgb = np.clip(rgb, 0, 1)
    Image.fromarray((rgb * 255).astype(np.uint8)).save(os.path.join(OUT, name + ".jpg"), quality=88)
    print(name)


def tint(base, lum):
    return np.stack([lum * c for c in base], -1)


# grass: patchy greens, dry spots, fine blade speckle (tile = 4 m)
patch = noise(1 / 300, 1 / 40, 0.6)
fine = noise(1 / 12, 1 / 2, 0.2)
dry = np.clip((noise(1 / 400, 1 / 60, 0.8) - 0.62) * 3, 0, 1)
g = np.stack([0.30 + 0.10 * patch, 0.47 + 0.12 * patch, 0.17 + 0.05 * patch], -1)
g = g * (0.80 + 0.35 * fine[..., None])
g = g * (1 - dry[..., None]) + np.array([0.46, 0.44, 0.24]) * dry[..., None] * (0.85 + 0.3 * fine[..., None])
g += speckle(0.006, 1)[..., None] * 0.07
save("grass", g)

# gravel / crushed kurkar path (tile = 3 m)
base = noise(1 / 250, 1 / 30, 0.7)
grain = speckle(0.02, 2) * 0.5 + speckle(0.05, 1) * 0.5
lum = 0.80 + 0.10 * base + 0.13 * grain
save("gravel", tint((0.80, 0.73, 0.60), lum))

# asphalt of the 1930s: grey, aggregate, worn tracks (tile = 6 m)
lum = 0.55 + 0.12 * noise(1 / 300, 1 / 25, 0.7) + 0.10 * speckle(0.04, 1) + 0.05 * noise(1 / 6, 1 / 2, 0.1)
save("asphalt", tint((0.66, 0.64, 0.60), lum))

# sidewalk: 50 cm cast concrete slabs, 8 x 8 per tile (tile = 4 m)
lum = 0.86 + 0.08 * noise(1 / 200, 1 / 20, 0.6) + 0.05 * speckle(0.03, 1)
cell = N // 8
yy, xx = np.mgrid[0:N, 0:N]
joint = ((xx % cell) < 3) | ((yy % cell) < 3)
slab = (rng.uniform(-0.05, 0.05, (8, 8)))[(yy // cell) % 8, (xx // cell) % 8]
lum = lum + slab
lum[joint] *= 0.72
save("paving", tint((0.84, 0.80, 0.72), lum))

# concrete (curbs, pool rim, lamp bases) (tile = 2 m)
lum = 0.82 + 0.10 * noise(1 / 200, 1 / 15, 0.6) + 0.05 * speckle(0.02, 1)
save("concrete", tint((0.86, 0.84, 0.79), lum))

# lime plaster for walls: faint stains and streaks (tile = 6 m)
streak = noise(1 / 400, 1 / 50, 0.9)
lum = 0.90 + 0.06 * noise(1 / 300, 1 / 20, 0.6) - 0.06 * np.clip(streak - 0.6, 0, 1) * 3 + 0.02 * speckle(0.02, 1)
save("plaster", tint((0.91, 0.91, 0.89), lum))

# warm cream stucco of the ring blocks (colour from the colourised photos)
lum = 0.92 + 0.03 * noise(1 / 300, 1 / 20, 0.6) - 0.035 * np.clip(noise(1 / 400, 1 / 60, 0.9) - 0.6, 0, 1) * 3
lum += 0.008 * speckle(0.02, 1)
for nm, col in (("wall_esther", (0.93, 0.915, 0.87)), ("wall_white", (0.92, 0.915, 0.895)),
                ("wall_warm", (0.925, 0.90, 0.835)), ("wall_cream", (0.92, 0.875, 0.775))):
    save(nm, tint(col, lum))

# promenade: smooth light grey (reads almost white-grey in the 1938 photos)
lum = 0.90 + 0.05 * noise(1 / 300, 1 / 30, 0.7) + 0.03 * speckle(0.04, 1)
save("promenade", tint((0.78, 0.765, 0.73), lum))

# pool coping stone: mottled light stone
lum = 0.82 + 0.16 * noise(1 / 120, 1 / 8, 0.5) + 0.07 * speckle(0.03, 2)
save("stone", tint((0.82, 0.79, 0.72), lum))

# carpet flower bed: small blooms over dark leaves
leaves = 0.6 + 0.4 * noise(1 / 40, 1 / 6, 0.3)
bed = np.stack([0.16 * leaves, 0.27 * leaves, 0.10 * leaves], -1)
bloom = speckle(0.004, 7)
bed[bloom > 0.15] = (0.72, 0.22, 0.24)
bed[bloom < -0.35] = (0.86, 0.74, 0.62)
save("flowers", bed)


def cutout(name, draw):
    """RGBA texture with hard alpha for iron lattice work."""
    from PIL import ImageDraw
    im = Image.new("RGBA", (512, 512), (22, 22, 22, 0))
    draw(ImageDraw.Draw(im))
    im.save(os.path.join(OUT, name + ".png"))
    print(name)


def lattice(d):   # kikar_norz: interlaced arches between two rails
    ink = (24, 24, 24, 255)
    for y in (6, 90, 486):
        d.rectangle((0, y, 512, y + 16), fill=ink)
    for x in range(-256, 640, 128):
        d.arc((x, 90, x + 256, 880), 180, 360, fill=ink, width=14)
    for x in range(0, 512, 64):
        d.rectangle((x, 6, x + 11, 502), fill=ink)


def cage(d):      # tree guard: uprights and three hoops
    ink = (30, 30, 30, 255)
    for x in range(0, 512, 128):
        d.rectangle((x, 0, x + 16, 511), fill=ink)
    for y in (4, 180, 360):
        d.rectangle((0, y, 511, y + 8), fill=ink)


cutout("lattice", lattice)
cutout("cage", cage)

# hedge: dense small leaves (tile = 2 m)
leaf = speckle(0.08, 2)
lum = 0.55 + 0.25 * noise(1 / 60, 1 / 6, 0.3) + 0.2 * leaf
save("hedge", np.stack([0.17 * lum, 0.30 * lum, 0.11 * lum], -1))

# bark of date palm: diamond leaf-base scars (tile = 1 x 1 m, wrapped on trunks)
lum = 0.55 + 0.15 * noise(1 / 80, 1 / 8, 0.4)
d = (np.abs(((xx + yy) % 64) - 32) + np.abs(((xx - yy) % 64) - 32)) / 64
lum *= 0.75 + 0.35 * d
save("bark", tint((0.55, 0.46, 0.35), lum))
