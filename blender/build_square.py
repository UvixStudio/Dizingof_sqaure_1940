"""Dizengoff Square c.1940 - Blender build script (run inside Blender).

Target: the web (GLB for Three.js on phones). Blender renders are only a reference.
  - every material = Principled BSDF with an image texture (blender/tex) or a flat colour
  - UVs written into the mesh (box projection, metres / tile size)
  - repeated props share one mesh (linked duplicates)
  - objects named RO_* are render-only and are skipped by publish.py
    (water and jet are drawn by the site's own shader)
Axes: +X east, +Y north, Z up, metres. Origin = centre of the fountain (OSM ring-road fit).
Sources: OSM (ODbL, (c) OpenStreetMap contributors); calibration in data/research_notes.md s.6.
Re-running rebuilds the BUILD collection only; REF_threejs is untouched.
"""
import bpy, bmesh, json, math, os, random, runpy
from mathutils import Vector, Matrix

ROOT = r"C:\Ai\01_kikar_dizingof"
TEX = os.path.join(ROOT, "blender", "tex")
LAT0, LON0 = 32.077982, 34.774206      # ring-road circle fit (was 1.5 m W / 8 m S of this)

# --- island (calibrated on 8b6bf3ac, absolute size from OSM) ------------------
POOL_R, RIM_W, RIM_H = 8.4, 0.95, 0.24
WATER_Z = 0.17   # radii solved from 219fab55
INNER_LAWN = 16.1          # fenced lawn around the pool
GRAVEL = 24.3              # kurkar promenade ring
BEDS = 30.0                # outer lawn with palms
ISLAND_R = 36.0
PATHS = [355, 73, 175, 253]   # 4 cross paths, bearing approx. (+-15 deg, unverified)
PATH_W = 7.0
ROAD = (ISLAND_R, 44.0)       # two lanes
STREET_W = 9.0
STREETS = {"Dizengoff N": 348, "Reines": 43, "Zamenhof": 98,
           "Dizengoff S": 168, "Pinsker": 225, "Ben Ami": 299}
FLOOR_H, GROUND_H = 3.2, 4.0
MAX_LEVELS_1940, DEFAULT_LEVELS = 4, 4
CITY_R = 130.0

rnd = random.Random(1940)


# --- collections ------------------------------------------------------------
def coll(name, parent=None):
    c = bpy.data.collections.get(name)
    if c is None:
        c = bpy.data.collections.new(name)
        (parent or bpy.context.scene.collection).children.link(c)
    return c


def wipe(c):
    for ch in list(c.children):
        wipe(ch)
        bpy.data.collections.remove(ch)
    for o in list(c.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    bpy.data.orphans_purge(do_recursive=True)


# --- materials --------------------------------------------------------------
TILE = {}   # material name -> tile size in metres (used by box_uv)


def _bsdf(name):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    b = nt.nodes.new("ShaderNodeBsdfPrincipled")
    nt.links.new(b.outputs[0], out.inputs[0])
    return m, b


def tex_mat(name, file, tile, rough=0.9):
    m, b = _bsdf(name)
    img = bpy.data.images.load(os.path.join(TEX, file), check_existing=True)
    t = m.node_tree.nodes.new("ShaderNodeTexImage")
    t.image = img
    m.node_tree.links.new(t.outputs["Color"], b.inputs["Base Color"])
    b.inputs["Roughness"].default_value = rough
    TILE[name] = tile
    return m


def flat_mat(name, color, rough=0.8, emit=0.0, two_sided=False):
    m, b = _bsdf(name)
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Roughness"].default_value = rough
    if emit:
        b.inputs["Emission Color"].default_value = (*color, 1)
        b.inputs["Emission Strength"].default_value = emit
    m.use_backface_culling = not two_sided
    TILE[name] = 1.0
    return m


# --- mesh helpers -----------------------------------------------------------
def box_uv(me):
    """Planar UVs in metres / tile: top faces use XY, walls use (along-wall, Z)."""
    uv = me.uv_layers.new(name="UVMap")
    for p in me.polygons:
        tile = TILE.get(me.materials[p.material_index].name, 1.0) if me.materials else 1.0
        n = p.normal
        if abs(n.z) > 0.7:
            f = lambda v: (v.x / tile, v.y / tile)
        else:
            t = Vector((-n.y, n.x, 0))
            t = t.normalized() if t.length > 1e-6 else Vector((1, 0, 0))
            f = lambda v, t=t: (v.dot(t) / tile, v.z / tile)
        for li in p.loop_indices:
            uv.data[li].uv = f(me.vertices[me.loops[li].vertex_index].co)


def finish(name, bm, mats, c, smooth=False):
    zs = [v.co.z for v in bm.verts]
    if zs and max(zs) - min(zs) < 1e-5:            # flat ground sheet: face the sky
        bm.normal_update()
        for f in bm.faces:
            if f.normal.z < 0:
                f.normal_flip()
    else:
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    for m in mats:
        me.materials.append(m)
    box_uv(me)
    if smooth:
        for p in me.polygons:
            p.use_smooth = True
    o = bpy.data.objects.new(name, me)
    c.objects.link(o)
    return o


def instance(name, me, loc, rot_z, c, scale=1.0):
    o = bpy.data.objects.new(name, me)
    o.location = loc
    o.rotation_euler = (0, 0, rot_z)
    o.scale = (scale,) * 3
    c.objects.link(o)
    return o


def polar(r, bearing, z=0.0):
    a = math.radians(bearing)
    return Vector((r * math.sin(a), r * math.cos(a), z))


def annulus(name, r0, r1, z, m, c, seg=144):
    bm = bmesh.new()
    if r0 <= 0:
        bm.faces.new([bm.verts.new(polar(r1, 360 * i / seg, z)) for i in range(seg)])
    else:
        a = [bm.verts.new(polar(r0, 360 * i / seg, z)) for i in range(seg)]
        b = [bm.verts.new(polar(r1, 360 * i / seg, z)) for i in range(seg)]
        for i in range(seg):
            j = (i + 1) % seg
            bm.faces.new((a[i], b[i], b[j], a[j]))
    return finish(name, bm, [m], c)


def arc_box(bm, r0, r1, z0, z1, t0, t1, seg):
    """Closed curved box between bearings t0..t1 (degrees)."""
    rings = []
    for i in range(seg + 1):
        t = t0 + (t1 - t0) * i / seg
        rings.append([bm.verts.new(polar(r, t, z)) for (r, z) in ((r0, z0), (r1, z0), (r1, z1), (r0, z1))])
    for i in range(seg):
        a, b = rings[i], rings[i + 1]
        for k in range(4):
            bm.faces.new((a[k], b[k], b[(k + 1) % 4], a[(k + 1) % 4]))
    bm.faces.new(rings[0][::-1])
    bm.faces.new(rings[-1])


def ring_wall(name, r0, r1, z0, z1, m, c, seg=144):
    bm = bmesh.new()
    arc_box(bm, r0, r1, z0, z1, 0, 360, seg)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    return finish(name, bm, [m], c)


def strip(name, bearing, r0, r1, width, z, m, c):
    a = math.radians(bearing)
    d = Vector((math.sin(a), math.cos(a), 0))
    n = Vector((d.y, -d.x, 0)) * (width / 2)
    bm = bmesh.new()
    bm.faces.new([bm.verts.new(v + Vector((0, 0, z))) for v in (d * r0 - n, d * r0 + n, d * r1 + n, d * r1 - n)])
    return finish(name, bm, [m], c)


def cube(bm, size, loc, rot=0.0, mat_index=0):
    r = bmesh.ops.create_cube(bm, size=1.0)
    vs = r["verts"]
    bmesh.ops.scale(bm, vec=size, verts=vs)
    bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(rot, 3, "X"), verts=vs)
    bmesh.ops.translate(bm, vec=loc, verts=vs)
    for f in {f for v in vs for f in v.link_faces}:
        f.material_index = mat_index


def cylinder(bm, r0, r1, h, seg, loc, mat_index=0, cap=True):
    r = bmesh.ops.create_cone(bm, cap_ends=cap, segments=seg, radius1=r0, radius2=r1, depth=h)
    bmesh.ops.translate(bm, vec=Vector(loc) + Vector((0, 0, h / 2)), verts=r["verts"])
    for f in {f for v in r["verts"] for f in v.link_faces}:
        f.material_index = mat_index


def near_path(bearing, r, pad=0.6):
    """True if a point at (r, bearing) sits on one of the cross paths."""
    for p in PATHS:
        d = (bearing - p + 180) % 360 - 180
        if abs(r * math.sin(math.radians(d))) < PATH_W / 2 + pad and abs(d) < 90:
            return True
    return False


def alpha_mat(name, file):
    """Cut-out material (glTF alphaMode MASK)."""
    m, b = _bsdf(name)
    nt = m.node_tree
    t = nt.nodes.new("ShaderNodeTexImage")
    t.image = bpy.data.images.load(os.path.join(TEX, file), check_existing=True)
    cut = nt.nodes.new("ShaderNodeMath")
    cut.operation = "GREATER_THAN"
    cut.inputs[1].default_value = 0.5
    nt.links.new(t.outputs["Color"], b.inputs["Base Color"])
    nt.links.new(t.outputs["Alpha"], cut.inputs[0])
    nt.links.new(cut.outputs[0], b.inputs["Alpha"])
    b.inputs["Roughness"].default_value = 0.6
    m.use_backface_culling = False
    TILE[name] = 1.0
    return m


def lettering(name, text, loc, outward, size, mat, c):
    """Flat sign letters standing on a facade, facing `outward` (x, y)."""
    cu = bpy.data.curves.new(name, "FONT")
    cu.body, cu.size, cu.align_x, cu.align_y = text, size, "CENTER", "CENTER"
    cu.resolution_u = 2
    tmp = bpy.data.objects.new(name + "_curve", cu)
    me = bpy.data.meshes.new_from_object(tmp)
    bpy.data.objects.remove(tmp)
    me.materials.append(mat)
    o = bpy.data.objects.new(name, me)
    o.location = loc
    o.rotation_euler = (math.pi / 2, 0, math.atan2(outward[0], -outward[1]))
    c.objects.link(o)
    return o


def osm_xy(lat, lon):
    return ((lon - LON0) * 111320 * math.cos(math.radians(LAT0)), (lat - LAT0) * 110574)


def building(name, pts, levels, M, c):
    h = GROUND_H + (levels - 1) * FLOOR_H
    bm = bmesh.new()
    try:
        f = bm.faces.new([bm.verts.new((x, y, 0)) for x, y in pts])
    except ValueError:
        bm.free()
        return None
    if f.normal.z < 0:
        f.normal_flip()
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    for v in ext["geom"]:
        if isinstance(v, bmesh.types.BMVert):
            v.co.z = h
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return finish(name, bm, [M["plaster"]], c)


# --- build ------------------------------------------------------------------
def build(ficus="mature"):      # "young" = caged saplings of 1938-40, "mature" = shade trees
    scene = bpy.context.scene
    root = coll("BUILD")
    wipe(root)
    cg, ci, cp, cb, cl = (coll(n, root) for n in ("ground", "island", "props", "buildings", "light_cam"))

    M = {
        "paving": tex_mat("paving", "paving.jpg", 4.0, 0.92),
        "asphalt": tex_mat("asphalt", "asphalt.jpg", 6.0, 0.95),
        "gravel": tex_mat("gravel", "gravel.jpg", 3.0, 1.0),
        "grass": tex_mat("grass", "grass.jpg", 64.0, 1.0),
        "blade_green": flat_mat("blade_green", (0.115, 0.205, 0.032), 1.0),
        "blade_dark": flat_mat("blade_dark", (0.065, 0.125, 0.022), 1.0),
        "blade_dry": flat_mat("blade_dry", (0.30, 0.235, 0.075), 1.0),
        "concrete": tex_mat("concrete", "concrete.jpg", 2.0, 0.85),
        "plaster": tex_mat("plaster", "plaster.jpg", 6.0, 0.9),
        "hedge": tex_mat("hedge", "hedge.jpg", 2.0, 1.0),
        "bark": tex_mat("bark", "bark.jpg", 1.0, 0.95),
        "frond": flat_mat("frond", (0.16, 0.27, 0.09), 0.75, two_sided=True),
        "leaves": flat_mat("leaves", (0.13, 0.25, 0.07), 0.9),
        "paint": flat_mat("bench_paint", (0.82, 0.80, 0.74), 0.6),
        "iron": flat_mat("iron", (0.05, 0.05, 0.05), 0.5),
        "wire": flat_mat("wire", (0.08, 0.08, 0.08), 0.5, two_sided=True),
        "globe": flat_mat("globe", (0.93, 0.92, 0.86), 0.3),
        "car_black": flat_mat("car_black", (0.012, 0.012, 0.014), 0.25),
        "car_green": flat_mat("car_green", (0.035, 0.07, 0.05), 0.35),
        "car_grey": flat_mat("car_grey", (0.42, 0.40, 0.33), 0.4),
        "car_maroon": flat_mat("car_maroon", (0.12, 0.018, 0.016), 0.3),
        "car_navy": flat_mat("car_navy", (0.016, 0.035, 0.09), 0.3),
        "car_cream": flat_mat("car_cream", (0.66, 0.57, 0.38), 0.35),
        "bus_blue": flat_mat("bus_blue", (0.16, 0.25, 0.30), 0.4),
        "sign_dark": flat_mat("sign_dark", (0.03, 0.03, 0.035), 0.6, two_sided=True),
        "car_light": flat_mat("car_light", (0.65, 0.63, 0.56), 0.35),
        "horse": flat_mat("horse", (0.09, 0.045, 0.02), 0.9),
        "tyre": flat_mat("tyre", (0.01, 0.01, 0.01), 0.8),
        "wood": flat_mat("wood", (0.16, 0.10, 0.05), 0.85),
        "promenade": tex_mat("promenade", "promenade.jpg", 4.0, 0.95),
        "stone": tex_mat("stone", "stone.jpg", 1.6, 0.85),
        "flowers": tex_mat("flowers", "flowers.jpg", 1.4, 0.9),
        "leafcard_a": alpha_mat("leafcard_a", "leaf_a.png"),
        "leafcard_b": alpha_mat("leafcard_b", "leaf_b.png"),
        "leafcard_c": alpha_mat("leafcard_c", "leaf_c.png"),
        "leaf_core": flat_mat("leaf_core", (0.030, 0.062, 0.016), 1.0),
        "ficus_bark": flat_mat("ficus_bark", (0.19, 0.17, 0.14), 0.95),
        "people": tex_mat("people", "people.png", 1.0, 0.85),
        "signs": tex_mat("signs", "signs.jpg", 1.0, 0.7),
        "poster": tex_mat("poster", "poster_snow.jpg", 1.0, 0.6),
        "aw_white": flat_mat("aw_white", (0.74, 0.71, 0.62), 0.9, two_sided=True),
        "aw_cream": flat_mat("aw_cream", (0.72, 0.55, 0.28), 0.9, two_sided=True),
        "aw_green": flat_mat("aw_green", (0.10, 0.25, 0.17), 0.9, two_sided=True),
        "aw_terra": flat_mat("aw_terra", (0.38, 0.09, 0.05), 0.9, two_sided=True),
        "aw_blue": flat_mat("aw_blue", (0.07, 0.14, 0.27), 0.9, two_sided=True),
        "table": flat_mat("table", (0.80, 0.78, 0.72), 0.4),
        "lattice": alpha_mat("lattice", "lattice.png"),
        "cage": alpha_mat("cage", "cage.png"),
        "bench_wood": flat_mat("bench_wood", (0.07, 0.04, 0.022), 0.6),
        "stake": flat_mat("stake", (0.19, 0.14, 0.08), 0.9),
        "frond_stem": flat_mat("frond_stem", (0.20, 0.22, 0.07), 0.8),
        "shutter": flat_mat("shutter", (0.55, 0.57, 0.52), 0.8),
        "pool_floor": flat_mat("pool_floor", (0.10, 0.17, 0.17), 0.9),
        **{k: tex_mat(k, k + ".jpg", 6.0, 0.9) for k in ("wall_esther", "wall_white", "wall_warm", "wall_cream")},
        "red": flat_mat("sign_red", (0.45, 0.02, 0.03), 0.5, two_sided=True),
        "white_iron": flat_mat("white_iron", (0.80, 0.80, 0.76), 0.5),
        "glass": flat_mat("glass", (0.11, 0.14, 0.16), 0.12),
        "frame": flat_mat("frame_dark", (0.03, 0.028, 0.025), 0.6),
        "awning": flat_mat("awning", (0.74, 0.72, 0.65), 0.9, two_sided=True),
        "tin": flat_mat("roof_tin", (0.22, 0.24, 0.25), 0.55),
    }
    water = flat_mat("RO_water", (0.11, 0.20, 0.21), 0.06)
    jet_m = flat_mat("RO_jet", (0.92, 0.95, 0.98), 0.25, emit=0.25)
    jet_m.node_tree.nodes["Principled BSDF"].inputs["Alpha"].default_value = 0.42
    jet_m.surface_render_method = "BLENDED"
    nt = water.node_tree                                     # ripples for the render
    nz = nt.nodes.new("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 1.6
    nz.inputs["Detail"].default_value = 3
    tc = nt.nodes.new("ShaderNodeTexCoord")
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.12
    nt.links.new(tc.outputs["Object"], nz.inputs["Vector"])
    nt.links.new(nz.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], nt.nodes["Principled BSDF"].inputs["Normal"])

    # ground: each layer its own height (no z-fighting)
    annulus("sidewalk", ROAD[1], 1500, 0.0, M["paving"], cg, 96)
    annulus("ring_road", ROAD[0], ROAD[1], 0.02, M["asphalt"], cg)
    ring_wall("road_curb", ROAD[1], ROAD[1] + 0.3, 0.0, 0.15, M["concrete"], cg)
    for nm, brg in STREETS.items():
        strip("street_" + nm, brg, ROAD[1], CITY_R + 40, STREET_W, 0.021, M["asphalt"], cg)

    # island (blender/island.py shares this script's helpers)
    people = runpy.run_path(os.path.join(ROOT, "blender", "people.py"), init_globals=dict(globals()))
    scope = dict(globals(), FICUS=ficus, SITTERS=people["sitters"](M), M=M, ci=ci, cp=cp, water=water, jet_m=jet_m)
    runpy.run_path(os.path.join(ROOT, "blender", "island.py"), init_globals=scope)

    # vehicles on the ring road, counter-clockwise (placeholders, 1930s silhouettes)
    veh = runpy.run_path(os.path.join(ROOT, "blender", "vehicles.py"))
    colours = {"black": M["car_black"], "green": M["car_green"], "grey": M["car_grey"], "horse": M["horse"],
               "maroon": M["car_maroon"], "navy": M["car_navy"], "cream": M["car_cream"], "blue": M["bus_blue"]}
    cache = {}

    def vehicle(kind, colour, loc, rot):
        if (kind, colour) not in cache:
            me = bpy.data.meshes.new("veh_" + kind)
            bm = veh["make"](kind)
            bm.to_mesh(me)
            bm.free()
            for m in (colours[colour], M["glass"], M["tyre"], M["car_light"], M["wood"]):
                me.materials.append(m)
            box_uv(me)
            cache[(kind, colour)] = me
        o = instance("car_" + kind, cache[(kind, colour)], loc, rot, cp)
        if kind in ("bus", "bus_city"):          # cooperative name on both sides (reversed for RTL); placement is interpretation
            x, y, z = (-0.4, 1.17, 1.12) if kind == "bus" else (-0.4, 1.12, 0.92)
            for side in (-1, 1):
                t = lettering("sign_bus", "ריבעמה", (x, side * y, z), (0, side), 0.36,
                              M["sign_dark"] if kind == "bus_city" and colour == "cream" else M["car_light"], cp)
                t.parent = o

    # ring road, two lanes, counter-clockwise
    for kind, colour, r, brg in (("sedan", "black", 38.2, 22), ("coupe", "maroon", 38.4, 50), ("bus_city", "cream", 38.5, 88),
                                 ("truck", "green", 38.4, 128), ("sedan", "navy", 38.2, 160), ("bus", "grey", 38.5, 197),
                                 ("cart", "horse", 43.35, 256), ("sedan", "grey", 38.4, 256), ("van", "cream", 38.4, 288), ("sedan", "black", 38.2, 318),
                                 ("sedan", "green", 41.2, 66), ("sedan", "black", 41.2, 142), ("bus_city", "blue", 41.2, 220),
                                 ("coupe", "black", 41.2, 252), ("sedan", "grey", 41.2, 300), ("bus", "grey", 41.2, 4),
                                 ("van", "maroon", 41.2, 340)):
        a = math.radians(brg)
        vehicle(kind, colour, polar(r, brg, 0.02), math.atan2(math.sin(a), -math.cos(a)))
    # parked or driving along the side streets (r = distance out, side = -1 / 1 of the street axis)
    for street, r, side, kind, colour in (("Dizengoff N", 58, 1, "sedan", "black"), ("Dizengoff N", 74, -1, "bus_city", "cream"),
                                          ("Reines", 63, -1, "coupe", "navy"), ("Zamenhof", 56, 1, "van", "cream"),
                                          ("Zamenhof", 79, -1, "sedan", "maroon"), ("Dizengoff S", 61, -1, "sedan", "green"),
                                          ("Dizengoff S", 83, 1, "truck", "green"), ("Pinsker", 58, 1, "sedan", "grey"),
                                          ("Pinsker", 66, 1, "coupe", "black"), ("Ben Ami", 60, -1, "cart", "horse")):
        brg = math.radians(STREETS[street])
        out = Vector((math.sin(brg), math.cos(brg), 0))
        across = Vector((out.y, -out.x, 0)) * side
        ahead = out * -side                      # keeps to the right-hand side of its direction
        vehicle(kind, colour, out * r + across * 2.9 + Vector((0, 0, 0.022)), math.atan2(ahead.y, ahead.x))

    # OSM buildings (today's footprints, 1940 filter pending), heights capped
    data = json.load(open(os.path.join(ROOT, "data", "osm", "square_raw.json"), encoding="utf-8"))
    ring = runpy.run_path(os.path.join(ROOT, "blender", "ring.py"))
    shops = runpy.run_path(os.path.join(ROOT, "blender", "shops.py"), init_globals=dict(globals()))
    M["signs"].use_backface_culling = False
    labels = []
    n = 0
    for e in data["elements"]:
        t = e.get("tags", {})
        if e["type"] != "way" or "building" not in t or "geometry" not in e:
            continue
        pts = [osm_xy(g["lat"], g["lon"]) for g in e["geometry"]]
        if len(pts) > 3 and pts[0] == pts[-1]:
            pts = pts[:-1]
        dmin = min(math.hypot(x, y) for x, y in pts)
        if dmin < 38 or dmin > CITY_R:
            continue
        try:
            lv = int(float(t.get("building:levels", DEFAULT_LEVELS)))
        except ValueError:
            lv = DEFAULT_LEVELS
        if e["id"] in ring["BLOCKS"]:
            key, params = ring["BLOCKS"][e["id"]]
            bm, info = ring["block"](pts, params)
            wall = M[params.get("tint", "wall_white")]
            finish(key + "_block", bm, [wall, M["glass"], M["frame"], M["awning"], M["tin"], M["shutter"]], cb)
            shops["dress"](key, info, M, cb)
            if key in ("B", "D", "F"):                 # where the site hangs a building label
                p, normal = info["chain"].at(info["chain"].length * 0.5, -0.8)
                labels.append({"key": key, "x": round(p.x, 2), "y": round(p.y, 2),
                               "top": round(info["top"] + info["attic"], 2),
                               "nx": round(-normal.x, 3), "ny": round(-normal.y, 3)})
            if "name" in info:                         # Esther cinema lettering (1940 postcard)
                x, y, z, nx, ny = info["name"]
                for k, word in enumerate(("קולנוע", "כיכר", "דיזנגוף")):
                    lettering("sign_name_%d" % k, word[::-1], (x, y, z - 0.85 * k), (nx, ny), 0.85, M["red"], cb)
                x, y, z, nx, ny = info["shop"]
                lettering("sign_dreamland", "DREAMLAND", (x, y, z - 0.25), (nx, ny), 0.7, M["iron"], cb)
            n += 1
        elif building("osm_%d" % e["id"], pts, max(2, min(MAX_LEVELS_1940, lv)), M, cb):
            n += 1

    for k, bearing in enumerate((57, 240)):
        shops["ad_column"]("ad_column_%d" % k, polar(45.7, bearing).to_2d(), M, cp)
    site = os.path.join(ROOT, "blender", "preview", "site")
    os.makedirs(site, exist_ok=True)
    with open(os.path.join(site, "labels.json"), "w", encoding="utf-8") as f:
        json.dump(labels, f)

    people["populate"](M, cp)

    # sun + sky: HDRI daylight (sky.py), sun lamp placed where the HDRI sun is
    sk = runpy.run_path(os.path.join(ROOT, "blender", "sky.py"))
    sun_d = bpy.data.lights.new("sun", "SUN")
    sun_d.energy = sk["SUN_ENERGY"]
    sun_d.angle = math.radians(0.6)
    sun_d.color = sk["SUN_COLOR"]
    sun = bpy.data.objects.new("sun", sun_d)
    cl.objects.link(sun)
    sun.rotation_euler = (math.radians(90 - sk["SUN_ELEV"]), 0, math.radians(180 - sk["SUN_BEARING"]))
    world = scene.world or bpy.data.worlds.new("World")
    scene.world = world
    sk["apply_world"](world)

    # cameras (same names as the site views)
    def camera(name, loc, direction, vfov):
        d = bpy.data.cameras.new(name)
        d.sensor_fit = "VERTICAL"
        d.angle_y = math.radians(vfov)
        d.clip_end = 1000
        o = bpy.data.objects.new(name, d)
        cl.objects.link(o)
        o.location = loc
        o.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
        return o

    def heading(bearing, pitch):
        b, p = math.radians(bearing), math.radians(pitch)
        return Vector((math.sin(b) * math.cos(p), math.cos(b) * math.cos(p), math.sin(p)))

    scene.camera = camera("cam_in", polar(24.0, 205, 1.7), heading(6, -2), 70)
    camera("cam_walk", polar(45, 165, 1.6), heading(345, -1), 70)
    camera("cam_roof", polar(47.6, 120, 19.5), heading(300, -22), 70)
    cal = json.load(open(os.path.join(ROOT, "blender", "camera_219.json")))
    cal = cal[cal["best"]]                       # solved from the photo, see solve_camera.py
    camera("cam_esther", Vector(cal["pos"]), heading(cal["yaw"], cal["pitch"]),
           math.degrees(2 * math.atan(1125 / 2 / cal["focal_px"])))
    az, el, dist = math.radians(20), math.radians(46), 135
    top = Vector((math.sin(az) * math.cos(el) * dist, -math.cos(az) * math.cos(el) * dist,
                  math.sin(el) * dist + 3))
    camera("cam_top", top, Vector((0, 0, 3)) - top, 55)
    ring_eye = polar(88, 235, 62)                      # like the aerial 8b6bf3ac
    camera("cam_ring", ring_eye, Vector((6, 8, 3)) - ring_eye, 52)
    path = os.path.join(ROOT, "blender", "camera_mat.json")
    if os.path.exists(path):                      # solved from MAT-22292, see solve_mat.py
        cal = json.load(open(path))
        camera("cam_mat", Vector(cal["pos"]), heading(cal["yaw"], cal["pitch"]),
               math.degrees(2 * math.atan(1011 / 2 / cal["focal_px"])))

    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x, scene.render.resolution_y = 1280, 720
    scene.render.resolution_percentage = 100
    scene.eevee.use_shadows = True
    scene.eevee.use_raytracing = True
    scene.eevee.taa_render_samples = 64
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    scene.view_settings.exposure = -0.3
    return {"buildings": n}


if __name__ == "__main__":
    print(build())
