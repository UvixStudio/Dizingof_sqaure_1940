"""Photograph every shop bay in the open square, with its sign, for preview/shops/. Run inside Blender
after a build:  runpy.run_path(r"...\\render_shops_page.py")["render"]()      (render(["A1"]) for some bays)
Cars and people are hidden for the shots; nothing in the file is saved."""
import json, math, os, runpy, time
import bpy
from mathutils import Vector

ROOT = r"C:\Ai\01_kikar_dizingof"
BLENDER = os.path.join(ROOT, "blender")
OUT = os.path.join(BLENDER, "preview", "shops")
FRAMES = {"iron": "ברזל כהה", "dark_wood": "עץ כהה", "medium_wood": "עץ בגוון בינוני", "green_wood": "עץ צבוע ירוק"}


def chains():
    old = runpy.run_path(os.path.join(BLENDER, "render_shopfronts_test.py"), run_name="paths")
    return old["building_paths"](), old["write_catalog"]


def render(only=None):
    paths, write_catalog = chains()
    catalog = json.load(open(os.path.join(ROOT, "assets", "shopfronts", "shop_catalog.json"), encoding="utf-8-sig"))
    names = {c["id"]: c["name"] for c in json.loads(
        open(os.path.join(OUT, "catalog.js"), encoding="utf-8-sig").read().removeprefix("const shops = ").strip().rstrip(";"))}
    scene, r = bpy.context.scene, bpy.context.scene.render
    keep = (scene.camera, r.resolution_x, r.resolution_y, r.filepath, r.image_settings.file_format)
    exposure = scene.view_settings.exposure
    hidden = [o for o in scene.objects if o.type == "MESH" and not o.hide_render and
              o.name.lower().startswith(("car_", "walk", "pram", "kidbike", "cycle", "stand", "ro_", "sign_bus", "pf_", "ped", "ad_column"))]
    for o in hidden:
        o.hide_render = True
    lens = bpy.data.cameras.new("TMP_shopcam")
    lens.type, lens.ortho_scale, lens.clip_start, lens.clip_end = "ORTHO", 6.15, 1.4, 90
    cam = bpy.data.objects.new("TMP_shopcam", lens)
    scene.collection.objects.link(cam)
    os.makedirs(os.path.join(OUT, "renders"), exist_ok=True)
    stamp, cards = int(time.time()), []
    try:
        scene.camera = cam
        scene.view_settings.exposure = exposure + 0.55      # most fronts stand in the shade of the arcade
        r.resolution_x, r.resolution_y, r.image_settings.file_format = 960, 720, "JPEG"
        for shop in catalog:
            views = []
            for bay in shop["model_bays"]:
                chain, _ = paths[bay[0]]
                point, n = chain.at(2.7 + int(bay[1:]) * 4.2)
                target = Vector((point.x, point.y, 2.22))
                cam.location = target - Vector((n.x, n.y, 0)) * 8
                cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
                if only is None or bay in only:
                    r.filepath = os.path.join(OUT, "renders", bay + ".jpg")
                    bpy.ops.render.render(write_still=True)
                views.append({"bay": bay, "image": "renders/%s.jpg?v=%d" % (bay, stamp)})
            drawn = os.path.isfile(os.path.join(BLENDER, "tex", "shops", shop["number"] + ".jpg"))
            cards.append({"id": shop["number"], "name": shop.get("name_he") or names.get(shop["number"], shop["name"]),
                          "file": shop["filename"], "frame": FRAMES[shop["frame"]], "views": views,
                          "state": "scene" if drawn else "missing"})
    finally:
        scene.view_settings.exposure = exposure
        scene.camera, r.resolution_x, r.resolution_y, r.filepath, r.image_settings.file_format = keep
        bpy.data.objects.remove(cam)
        bpy.data.cameras.remove(lens)
        for o in hidden:
            o.hide_render = False
    write_catalog(cards)
    return len(cards)
