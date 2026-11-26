"""Shrink the model for the web: preview/kikar.glb -> preview/kikar_web.glb.gz.
make_site.py calls pack(), or run it alone:  python blender/pack_web.py   (needs numpy and Pillow)

1. Positions, normals and UVs are snapped to a fine grid (about 1 mm). Nothing visible changes, and the numbers compress far better.
2. Photographs and painted textures become WebP.
3. The whole file is gzipped. The page unpacks it itself (web/load.js), so it does not depend on the server."""
import gzip, io, json, os, struct

import numpy as np
from PIL import Image

GRID = {"POSITION": 1 / 1024, "NORMAL": 1 / 128, "TEXCOORD_0": 1 / 4096}
MAX_SIDE = {"grass": 1024}                      # big noisy textures that read the same at half size
QUALITY = {"grass": 80, "flowers": 70}          # everything else: 78
KEEP_BELOW = 20000                              # small textures (cut-outs, the people palette) stay exactly as they are
WIDTH = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}


def pack(src, dst):
    data = open(src, "rb").read()
    json_len = struct.unpack_from("<I", data, 12)[0]
    g = json.loads(data[20:20 + json_len])
    start = 20 + json_len + 8
    views = g["bufferViews"]
    chunks = [data[start + v.get("byteOffset", 0):start + v.get("byteOffset", 0) + v["byteLength"]] for v in views]

    # geometry
    done = set()
    for mesh in g["meshes"]:
        for prim in mesh["primitives"]:
            for name, index in prim["attributes"].items():
                a = g["accessors"][index]
                if name not in GRID or index in done or a["componentType"] != 5126:
                    continue
                done.add(index)
                v = a["bufferView"]
                assert "byteStride" not in views[v], "interleaved data is not expected from the Blender exporter"
                off, n = a.get("byteOffset", 0), a["count"] * WIDTH[a["type"]]
                x = np.frombuffer(chunks[v], "<f4", n, off)
                y = (np.round(x / GRID[name]) * GRID[name]).astype("<f4") + np.float32(0)      # + 0 turns -0 into 0
                chunks[v] = chunks[v][:off] + y.tobytes() + chunks[v][off + n * 4:]
                if "min" in a:                  # the viewer builds bounding boxes from these
                    rows = y.reshape(a["count"], -1)
                    a["min"], a["max"] = rows.min(0).tolist(), rows.max(0).tolist()

    # textures
    webp = set()
    for i, image in enumerate(g.get("images", [])):
        v, name = image["bufferView"], image.get("name", "")
        if len(chunks[v]) < KEEP_BELOW:
            continue
        picture = Image.open(io.BytesIO(chunks[v]))
        side = MAX_SIDE.get(name)
        if side and picture.width > side:
            picture = picture.resize((side, round(picture.height * side / picture.width)), Image.LANCZOS)
        out = io.BytesIO()
        picture.save(out, "WEBP", quality=QUALITY.get(name, 78), method=6)
        if out.tell() < len(chunks[v]):
            chunks[v], image["mimeType"] = out.getvalue(), "image/webp"
            webp.add(i)
    for texture in g.get("textures", []):
        if texture.get("source") in webp:
            texture["extensions"] = {"EXT_texture_webp": {"source": texture["source"]}}
    if webp:
        g["extensionsUsed"] = sorted(set(g.get("extensionsUsed", [])) | {"EXT_texture_webp"})

    # put the file together again
    binary = bytearray()
    for v, chunk in zip(views, chunks):
        binary += b"\0" * (-len(binary) % 4)
        v["byteOffset"], v["byteLength"] = len(binary), len(chunk)
        binary += chunk
    binary += b"\0" * (-len(binary) % 4)
    g["buffers"][0]["byteLength"] = len(binary)
    head = json.dumps(g, separators=(",", ":")).encode()
    head += b" " * (-len(head) % 4)
    glb = (struct.pack("<III", 0x46546C67, 2, 28 + len(head) + len(binary))
           + struct.pack("<II", len(head), 0x4E4F534A) + head
           + struct.pack("<II", len(binary), 0x004E4942) + bytes(binary))
    packed = gzip.compress(glb, 9, mtime=0)     # mtime 0: the same model always gives the same file
    with open(dst, "wb") as f:
        f.write(packed)
    return {"plain": len(data), "packed": len(packed)}


if __name__ == "__main__":
    here = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview")
    sizes = pack(os.path.join(here, "kikar.glb"), os.path.join(here, "kikar_web.glb.gz"))
    print("model %.2f MB -> %.2f MB" % (sizes["plain"] / 1e6, sizes["packed"] / 1e6))
