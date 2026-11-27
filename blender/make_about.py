"""Small web copies for the "about" pop-up:  python blender/make_about.py   (needs Pillow)
Our own pictures go to preview/about (published). Anything that contains an archive photograph goes to
preview/about/archive, which git ignores: the rights are not settled."""
import os

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "blender", "preview", "about")
ARCH = os.path.join(OUT, "archive")


def at(*parts):
    return os.path.join(ROOT, *parts)


def save(im, path, width=900, q=78):
    im = im.convert("RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(path, "WEBP", quality=q, method=6)


def stack(photo, render, path):
    """Photograph above, our render below, same camera."""
    a, b = Image.open(photo).convert("RGB"), Image.open(render).convert("RGB")
    b = b.resize((a.width, round(b.height * a.width / b.width)), Image.LANCZOS)
    s = Image.new("RGB", (a.width, a.height + b.height + 10), (244, 234, 208))
    s.paste(a, (0, 0))
    s.paste(b, (0, a.height + 10))
    save(s, path)


if __name__ == "__main__":
    os.makedirs(ARCH, exist_ok=True)
    save(Image.open(at("data", "comparisons", "ring_buildings_map.png")), os.path.join(OUT, "map.webp"), 800)
    massing = next(f for f in os.listdir(at("BTS")) if "205021" in f)
    save(Image.open(at("BTS", massing)), os.path.join(OUT, "massing.webp"))
    save(Image.open(at("data", "comparisons", "sketches", "grid2.jpg")), os.path.join(OUT, "early.webp"))
    save(Image.open(at("blender", "preview", "hero_in.jpg")), os.path.join(OUT, "render.webp"))
    stack(at("data", "research_images", "update", "MAT-22292-DIZ.jpg"), at("blender", "preview", "mat.png"),
          os.path.join(ARCH, "compare_square.webp"))
    stack(at("data", "research_images", "219fab55-image.jpg"), at("blender", "preview", "esther.png"),
          os.path.join(ARCH, "compare_cinema.webp"))
    save(Image.open(at("data", "comparisons", "overlay_219.jpg")), os.path.join(ARCH, "measure.webp"))
    for name, photo, colour in (("colour_square", "608ddd14-1000063135.jpg", "608ddd14_wide.webp"),
                                ("colour_street", "fc338997-1000063134.jpg", "fc338997.webp")):
        stack(at("data", "research_images", photo), at("data", "research_images", "colorized_ai", colour), os.path.join(ARCH, name + ".webp"))
    for name, source in (("corners", ("corners-compare.jpg",)), ("facades", ("facades-compare.jpg",)),
                         ("grid_square", ("sketches", "mat_grid.png")), ("grid_cinema", ("sketches", "grid219.png"))):
        save(Image.open(at("data", "comparisons", *source)), os.path.join(ARCH, name + ".webp"))
    save(Image.open(at("data", "comparisons", "facelift_v3_all_views.jpg")), os.path.join(OUT, "facelift.webp"), 900, 72)
    # yuval.webp (the creator's picture) was taken from their own site and is kept as is
    print("about pictures written to", OUT)
