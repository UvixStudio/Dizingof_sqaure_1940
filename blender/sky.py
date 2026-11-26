"""Daylight sky shared by Blender and the web site (runs inside Blender).
HDRI: "Kloofendal 48d Partly Cloudy (Pure Sky)", polyhaven.com, CC0. Not in git, download to blender/hdri/."""
import bpy, json, math, os

ROOT = r"C:\Ai\01_kikar_dizingof"
NAME = "kloofendal_48d_partly_cloudy_puresky_2k.hdr"
HDR = os.path.join(ROOT, "blender", "hdri", NAME)
HDR_URL = "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/" + NAME

# measured on the HDRI pixels (sun disc), see research_notes
HDR_SUN_BEARING = 124.25      # before rotation
SUN_ELEV = 32.0               # lamp: mid afternoon, long shadows (HDRI disc itself sits at 47.9)
SUN_BEARING = 250.0           # where the scene wants it (WSW, early afternoon)
ROT = SUN_BEARING - HDR_SUN_BEARING
SUN_ENERGY = 4.2
SKY_STRENGTH = 0.8            # less fill, so shadows read
SUN_COLOR = (1.0, 0.91, 0.78)
CLAMP = 8.0                   # removes the sun disc from the environment: the sun lamp replaces it


def _image():
    if not os.path.exists(HDR):
        raise FileNotFoundError("חסר קובץ שמיים, להוריד מ-%s אל blender/hdri/" % HDR_URL)
    return bpy.data.images.load(HDR, check_existing=True)


def apply_world(world):
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    new = nt.nodes.new
    tc, mp, env = new("ShaderNodeTexCoord"), new("ShaderNodeMapping"), new("ShaderNodeTexEnvironment")
    cl, bg, out = new("ShaderNodeVectorMath"), new("ShaderNodeBackground"), new("ShaderNodeOutputWorld")
    env.image = _image()
    mp.inputs["Rotation"].default_value = (0.0, 0.0, math.radians(ROT))
    cl.operation = "MINIMUM"
    cl.inputs[1].default_value = (CLAMP, CLAMP, CLAMP)
    bg.inputs["Strength"].default_value = SKY_STRENGTH
    link = nt.links.new
    link(tc.outputs["Generated"], mp.inputs["Vector"])
    link(mp.outputs["Vector"], env.inputs["Vector"])
    link(env.outputs["Color"], cl.inputs[0])
    link(cl.outputs[0], bg.inputs["Color"])
    link(bg.outputs[0], out.inputs["Surface"])


def export_web(width=2048):
    """LDR panorama for the site: column = compass bearing / 360, top row = zenith. Writes sky.jpg + sky.json."""
    import numpy as np
    site = os.path.join(ROOT, "blender", "preview", "site")
    os.makedirs(site, exist_ok=True)
    im = _image()
    w, h = im.size
    a = np.empty(w * h * 4, np.float32)
    im.pixels.foreach_get(a)
    a = a.reshape(h, w, 4)[:, :, :3]                                    # row 0 = bottom
    a = np.roll(a, -int(round((0.25 - ROT / 360.0) * w)), axis=1)
    knee = 0.62                                                         # soft shoulder keeps cloud detail
    x = np.where(a < knee, a, knee + (1 - knee) * (1 - np.exp(-(a - knee) / 0.55)))
    s = np.where(x <= 0.0031308, x * 12.92, 1.055 * np.power(np.maximum(x, 1e-6), 1 / 2.4) - 0.055)
    grey = (s @ np.array([0.2126, 0.7152, 0.0722], np.float32))[..., None]
    s = np.clip(grey + (s - grey) * 1.18, 0, 1)                         # a little more blue
    mid = h // 2
    haze = s[mid:mid + h // 45].mean((0, 1))
    haze = np.clip(haze * 0.5 + np.array([0.86, 0.87, 0.86]) * 0.5, 0, 1)
    fade = h // 12                                                      # 15 degrees of horizon haze
    k = (np.linspace(1, 0, fade, dtype=np.float32) ** 1.6)[:, None, None]
    s[mid:mid + fade] = s[mid:mid + fade] * (1 - k) + haze * k
    s[:mid] = haze
    rgba = np.ones((h, w, 4), np.float32)
    rgba[:, :, :3] = s
    out = bpy.data.images.new("sky_web", w, h, alpha=True)
    out.pixels.foreach_set(rgba.ravel())
    if width != w:
        out.scale(width, width // 2)
    out.filepath_raw = os.path.join(site, "sky.jpg")
    out.file_format = "JPEG"
    out.save(quality=88)
    bpy.data.images.remove(out)
    hx = "0x%02x%02x%02x" % tuple(int(round(float(c) * 255)) for c in haze)
    with open(os.path.join(site, "sky.json"), "w") as f:
        json.dump({"haze": hx, "sun_bearing": SUN_BEARING, "sun_elevation": SUN_ELEV}, f)
    return {"haze": hx, "kb": os.path.getsize(os.path.join(site, "sky.jpg")) // 1024}
