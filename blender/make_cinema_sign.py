"""Textures for the cinema's front (run once, or after the source art changes; needs numpy and Pillow):
tex/cinema_sign.png     the sign art straightened to a front view and darkened, from the user's PNG
tex/cinema_shadow.png   its soft shadow, hung a little aside on the wall
tex/poster_four.jpg     "Four Daughters" (1938), Wikimedia Commons, public domain"""
import os, shutil
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "research_images", "update", "Vintage Dizingoff Square Cinema Sign.png")
TEX = os.path.join(ROOT, "blender", "tex")

im = Image.open(SRC).convert("RGBA")
src = [(127, 543), (777, 430), (777, 1333), (127, 1362)]          # two rails meeting the two posts, as drawn
w, h, ox, oy = 690, 862, 200, 560                                  # the same four points, straightened
dst = [(ox, oy), (ox + w, oy), (ox + w, oy + h), (ox, oy + h)]
A, b = [], []
for (x, y), (u, v) in zip(dst, src):                               # PIL wants output -> input
    A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
    A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
co = np.linalg.solve(np.array(A, float), np.array(b, float))
flat = im.transform((1150, 1900), Image.PERSPECTIVE, tuple(co), Image.BICUBIC)
flat = flat.crop(flat.getchannel("A").point(lambda v: 255 if v >= 128 else 0).getbbox())
alpha = flat.getchannel("A")
dark = ImageEnhance.Brightness(flat.convert("RGB")).enhance(0.55)
dark.putalpha(alpha)
dark.save(os.path.join(TEX, "cinema_sign.png"))

PAD = 80                                                           # shops.cinema_front hangs the sheet with the same margin
solid = alpha.point(lambda v: 255 if v >= 128 else 0)
soft = Image.new("L", (flat.width + 2 * PAD, flat.height + 2 * PAD), 0)
soft.paste(solid, (PAD, PAD))
soft = soft.filter(ImageFilter.GaussianBlur(17)).point(lambda v: int(v * .30))      # wide and faint: depth, not a second sign
shadow = Image.new("RGBA", soft.size, (40, 24, 12, 0))
shadow.putalpha(soft)
shadow.save(os.path.join(TEX, "cinema_shadow.png"))

shutil.copy(os.path.join(ROOT, "assets", "cinema_poster", "Fourdaughters1938.JPG"), os.path.join(TEX, "poster_four.jpg"))
print("sign", dark.size, "shadow", shadow.size)
