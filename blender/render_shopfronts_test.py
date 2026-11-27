"""Render a local review page from the saved square, using a separate Blender copy.

blender -b blender/kikar_1940.blend -P blender/render_shopfronts_test.py
Pass bay names after -- to rerender selected views, or --all to render every bay.
Pass --save-copy to refresh the existing test .blend from the current source.
Pass --catalog-only to show new artwork without changing the model or renders.
"""

import filecmp
import json
import math
import runpy
import shutil
import sys
from pathlib import Path

import bpy
from mathutils import Vector


BLENDER = Path(__file__).resolve().parent
ROOT = BLENDER.parent
ASSETS = ROOT / "data" / "research_images" / "3d stores"
HANDOFF = ASSETS / "stores catalog" / "Dizengoff_1939_Codex_Handoff" / "Dizengoff_1939_Codex_Handoff"
SHOP_CATALOG = ROOT / "assets" / "shopfronts" / "shop_catalog.json"
PREVIEW = BLENDER / "preview" / "shops"
COPY = BLENDER / "shopfronts_test.blend"

FRAME_LABELS = {
    "iron": "ברזל כהה",
    "dark_wood": "עץ כהה",
    "medium_wood": "עץ בגוון בינוני",
    "green_wood": "עץ צבוע ירוק",
}
DELI = "S01"
PRIORITY = ("F5", "D1", "A6", "A1", "E3", "E9")


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8-sig"))


def artwork_path(filename):
    path = ASSETS / filename
    if filename == "S01_deli.png" and not path.is_file():
        return HANDOFF / "references" / filename
    return path


def write_catalog(cards):
    texture_dir = PREVIEW / "textures"
    texture_dir.mkdir(parents=True, exist_ok=True)
    for card in cards:
        source = artwork_path(card["file"])
        dest = texture_dir / source.name
        card.pop("texture", None)
        if source.is_file():
            if not dest.is_file() or not filecmp.cmp(source, dest, shallow=False):
                shutil.copyfile(source, dest)
            card["texture"] = f"textures/{source.name}"
    catalog_path = PREVIEW / "catalog.js"
    pending = catalog_path.with_suffix(".js.tmp")
    pending.write_text("const shops = " + json.dumps(cards, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    pending.replace(catalog_path)


def building_paths():
    ring = runpy.run_path(str(BLENDER / "ring.py"))
    source = read_json(ROOT / "data" / "osm" / "square_raw.json")
    ways = {
        way["id"]: way["geometry"]
        for way in source["elements"]
        if way["type"] == "way" and way["id"] in ring["BLOCKS"]
    }
    result = {}
    for osm_id, (key, overrides) in ring["BLOCKS"].items():
        params = dict(ring["BASE"], **overrides)
        outline = [
            ((point["lon"] - 34.774206) * 111320 * math.cos(math.radians(32.077982)),
             (point["lat"] - 32.077982) * 110574)
            for point in ways[osm_id]
        ]
        if outline[0] == outline[-1]:
            outline.pop()
        ends = params["ends"] or ring["auto_ends"](outline)
        result[key] = ring["Chain"](outline, *ends), params
    return result


def bay_center(bay):
    # The panel begins at a column center, on the 4.2 m module used by the
    # existing deli meshes. The sign center sits 5 cm earlier along the chain.
    return 2.7 + int(bay[1:]) * 4.2


def install_panel(shop, bay, chain, params, material, collection):
    center = bay_center(bay)
    start, end = center - 2.1, center + 2.1
    # In front of the original glazing and mullions, behind the outer columns.
    inset = max(1.45, params["recess"] + 0.1) - 0.13
    height = params["ground"] - 0.6
    samples = chain.samples(start, end)
    points = [chain.at(s, inset)[0] for s in samples]
    normal = chain.at(center, inset)[1]
    view_right = Vector((normal.y, -normal.x))
    runs_leftward = (points[-1] - points[0]).dot(view_right) < 0
    vertices = [(p.x, p.y, z) for p in points for z in (0.02, height)]
    faces = [(2 * i, 2 * i + 2, 2 * i + 3, 2 * i + 1) for i in range(len(points) - 1)]
    if runs_leftward:
        faces = [face[::-1] for face in faces]

    name = f"test_{shop['number']}_{shop['id']}_{bay}"
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    mesh.materials.append(material)
    mesh.update()
    uv = mesh.uv_layers.new(name="UVMap")
    for loop in mesh.loops:
        sample, top = divmod(loop.vertex_index, 2)
        u = (samples[sample] - start) / (end - start)
        # Fit the full source for review. The actual scene columns still occlude it.
        uv.data[loop.index].uv = (1 - u if runs_leftward else u, top)

    obj = bpy.data.objects.new(name, mesh)
    obj["bay"] = bay
    obj["source_texture"] = shop["filename"]
    obj["mapping"] = "Full canvas fit for review, behind existing columns and awnings"
    collection.objects.link(obj)


def review_camera(bay, chain, collection):
    point, normal = chain.at(bay_center(bay))
    target = Vector((point.x, point.y, 2.12))
    name = f"shops_cam_{bay}"
    lens = bpy.data.cameras.new(name)
    lens.type = "ORTHO"
    lens.ortho_scale = 6.15
    if bay in ("F5", "A6"):
        # The shot's near edge intersects a curb and a pedestrian in these bays.
        lens.clip_start = 1.4
    lens.clip_end = 90
    camera = bpy.data.objects.new(name, lens)
    collection.objects.link(camera)
    camera.location = target - Vector((normal.x, normal.y, 0)) * 8
    camera.location.z = 2.02
    camera.rotation_euler = (target - camera.location).to_track_quat("-Z", "Y").to_euler()
    return camera


def configure_render(scene):
    render = scene.render
    render.resolution_x, render.resolution_y, render.resolution_percentage = 960, 720, 100
    render.image_settings.file_format = "JPEG"
    render.image_settings.quality = 89
    render.film_transparent = False
    render.use_compositing = False
    # Keep the original materials, lighting and color transform. Cycles works in
    # background mode without Eevee's windowing requirement.
    render.engine = "CYCLES"
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.cycles.adaptive_threshold = 0.07
    prefs = bpy.context.preferences.addons["cycles"].preferences
    for kind in ("OPTIX", "CUDA"):
        try:
            prefs.compute_device_type = kind
            prefs.get_devices()
        except (RuntimeError, TypeError):
            continue
        if any(device.type == kind for device in prefs.devices):
            for device in prefs.devices:
                device.use = device.type == kind
            scene.cycles.device = "GPU"
            print(f"RENDER DEVICE {kind}", flush=True)
            return
    scene.cycles.device = "CPU"
    print("RENDER DEVICE CPU", flush=True)


def main():
    options = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if bpy.data.filepath != str(BLENDER / "kikar_1940.blend"):
        raise ValueError("Open blender/kikar_1940.blend as the input scene")
    catalog = read_json(SHOP_CATALOG)
    if "--catalog-only" in options:
        document = (PREVIEW / "catalog.js").read_text(encoding="utf-8-sig")
        cards = json.loads(document.removeprefix("const shops = ").strip().removesuffix(";"))
        by_number = {shop["number"]: shop for shop in catalog}
        for card in cards:
            shop = by_number[card["id"]]
            card["name"] = shop.get("name_he", card["name"])
            card["file"] = shop["filename"]
            card["frame"] = FRAME_LABELS[shop["frame"]]
        write_catalog(cards)
        return
    scene = bpy.context.scene
    render_dir = PREVIEW / "renders"
    render_dir.mkdir(parents=True, exist_ok=True)
    paths = building_paths()
    review = bpy.data.collections.new("SHOPFRONTS_TEST")
    scene.collection.children.link(review)
    deli_material = bpy.data.materials["preview_deli"]
    cameras = {}
    cards = []
    for shop in catalog:
        name = shop.get("name_he")
        if not name:
            spec_dir = ROOT / "assets" / "shopfronts" / "json"
            source_json = next(spec_dir / candidate for candidate in shop["json_candidates"]
                               if (spec_dir / candidate).is_file())
            name = read_json(source_json)["shop"]["name"]
        if shop["number"] == "S09":
            name = "מכולת וירקנייה"
        texture = ASSETS / shop["filename"]
        is_deli = shop["number"] == DELI
        has_image = texture.is_file()
        material = None
        if has_image and not is_deli:
            material = deli_material.copy()
            material.name = f"Shopfront test | {shop['filename']}"
            image = bpy.data.images.load(str(texture), check_existing=True)
            image.colorspace_settings.name = "sRGB"
            image.pack()
            material.node_tree.nodes.get("Image Texture").image = image

        views = []
        for bay in shop["model_bays"]:
            chain, params = paths[bay[0]]
            if material:
                install_panel(shop, bay, chain, params, material, review)
            cameras[bay] = review_camera(bay, chain, review)
            views.append({"bay": bay, "image": f"renders/{bay}.jpg"})
        cards.append({
            "id": shop["number"], "name": name, "file": shop["filename"],
            "frame": FRAME_LABELS[shop["frame"]], "views": views,
            "state": "existing" if is_deli else "pilot" if has_image else "missing",
        })

    scene.camera = cameras["F5"]
    if not COPY.exists() or "--save-copy" in options:
        scene.camera.data.passepartout_alpha = 1
        scene.render.resolution_x, scene.render.resolution_y = 960, 720
        for screen in bpy.data.screens:
            for area in screen.areas:
                if area.type == "VIEW_3D":
                    view = area.spaces.active
                    view.region_3d.view_perspective = "CAMERA"
                    view.shading.type = "MATERIAL"
                    view.shading.use_scene_lights = True
                    view.shading.use_scene_world = True
        bpy.context.preferences.filepaths.save_version = 0
        bpy.ops.wm.save_as_mainfile(filepath=str(COPY), copy=True, relative_remap=False)

    write_catalog(cards)
    ordered_bays = dict.fromkeys((*PRIORITY, *cameras))
    requested = [option for option in options if not option.startswith("--")]
    if not requested:
        requested = list(ordered_bays)
        if "--all" not in options:
            requested = [bay for bay in requested if not (render_dir / f"{bay}.jpg").is_file()]
    configure_render(scene)
    for bay in requested:
        print(f"RENDER BAY {bay}", flush=True)
        scene.camera = cameras[bay]
        scene.render.filepath = str(render_dir / f"{bay}.jpg")
        bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    main()
