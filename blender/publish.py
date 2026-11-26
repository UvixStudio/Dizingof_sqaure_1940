"""Render the four views and export a GLB for blender/preview/index.html (run inside Blender)."""
import bpy, json, os, runpy, time

ROOT = r"C:\Ai\01_kikar_dizingof"


def blend_with_photo(out, key, photo):
    """50 % mix of a render over its photo (numpy, no extra libraries)."""
    import numpy as np
    def px(path):
        im = bpy.data.images.load(path, check_existing=False)
        w, h = im.size
        a = np.empty(w * h * 4, np.float32)
        im.pixels.foreach_get(a)
        bpy.data.images.remove(im)
        return a, w, h
    a, w, h = px(os.path.join(out, key + ".png"))
    b, w2, h2 = px(os.path.join(ROOT, "data", "research_images", photo))
    if (w, h) != (w2, h2):
        return
    mix = bpy.data.images.new("blend_tmp", w, h, alpha=True)
    mix.pixels.foreach_set((a + b) / 2)
    mix.filepath_raw = os.path.join(out, key + "_blend.jpg")
    mix.file_format = "JPEG"
    mix.save()
    bpy.data.images.remove(mix)


def publish():
    scene = bpy.context.scene
    out = os.path.join(ROOT, "blender", "preview")
    os.makedirs(out, exist_ok=True)
    main = scene.camera
    for key in ("in", "walk", "roof", "top", "esther", "ring", "mat"):
        scene.camera = bpy.data.objects["cam_" + key]
        scene.render.filepath = os.path.join(out, key + ".png")
        r = scene.render
        r.resolution_x, r.resolution_y = {"esther": (1938, 1125), "mat": (1500, 1011)}.get(key, (1280, 720))
        bpy.ops.render.render(write_still=True)
    scene.render.resolution_x, scene.render.resolution_y = 1280, 720
    blend_with_photo(out, "esther", "219fab55-image.jpg")
    blend_with_photo(out, "mat", os.path.join("update", "MAT-22292-DIZ.jpg"))
    scene.camera = main
    runpy.run_path(os.path.join(ROOT, "blender", "sky.py"))["export_web"]()

    bpy.ops.object.select_all(action="DESELECT")
    meshes = [o for o in bpy.data.collections["BUILD"].all_objects
              if o.type == "MESH" and not o.name.startswith("RO_")]   # RO_* = render-only
    for o in meshes:
        o.select_set(True)
    glb = os.path.join(out, "kikar.glb")
    # procedural nodes do not export: unlink base colour so the flat socket colour is used
    unlinked = []
    for m in {s.material for o in meshes for s in o.material_slots if s.material}:
        bsdf = next((n for n in m.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if bsdf is None:
            continue
        for link in [l for l in bsdf.inputs["Base Color"].links if l.from_node.type != "TEX_IMAGE"]:
            unlinked.append((m.node_tree, link.from_socket, link.to_socket))
            m.node_tree.links.remove(link)
    try:
        bpy.ops.export_scene.gltf(filepath=glb, export_format="GLB",
                                  use_selection=True, export_apply=True)
    finally:
        for tree, src, dst in unlinked:
            tree.links.new(src, dst)
    bpy.ops.object.select_all(action="DESELECT")

    tris = 0
    deps = bpy.context.evaluated_depsgraph_get()
    for o in meshes:
        ev = o.evaluated_get(deps)
        me = ev.to_mesh()
        me.calc_loop_triangles()
        tris += len(me.loop_triangles)
        ev.to_mesh_clear()
    info = {"time": int(time.time()), "tris": tris,
            "glb_mb": round(os.path.getsize(glb) / 1e6, 2)}
    with open(os.path.join(out, "stamp.json"), "w") as f:
        json.dump(info, f)
    return info
