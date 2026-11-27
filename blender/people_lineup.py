"""Every figure of the scene once, in one file, for looking them over:
preview/people/lineup.glb + lineup.json, shown by preview/people/index.html.
publish.py runs it, so the page always shows the figures the scene holds (and matches people_walk.json.gz)."""
import bpy, json, os


def export(preview):
    uses = {}
    for o in bpy.data.collections["BUILD"].all_objects:
        if o.type == "MESH" and o.data.name.startswith("ped_pf_") and not o.name.startswith("RO_"):
            uses[o.data.name] = uses.get(o.data.name, 0) + 1
    if not uses:
        return {}
    out = os.path.join(preview, "people")
    os.makedirs(out, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    made, info = [], {}
    for name in sorted(uses):
        me = bpy.data.meshes[name]
        o = bpy.data.objects.new("fig_" + name[len("ped_pf_"):], me)
        bpy.context.scene.collection.objects.link(o)
        o.select_set(True)
        made.append(o)
        me.calc_loop_triangles()
        info[name[len("ped_pf_"):]] = {"tris": len(me.loop_triangles), "uses": uses[name]}
    try:
        bpy.ops.export_scene.gltf(filepath=os.path.join(out, "lineup.glb"), export_format="GLB", use_selection=True)
    finally:
        for o in made:
            bpy.data.objects.remove(o)
    with open(os.path.join(out, "lineup.json"), "w", encoding="utf-8") as f:
        json.dump(info, f)
    return info
