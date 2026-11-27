"""All the figures of the square, made from six Polyfork characters (polyfork.dev, CC BY 4.0, changed).

Each source is a rigged character built from separate parts coloured per vertex. Here the parts are
repainted from our palette, modern props are dropped, period hats are added, the triangles are thinned,
and the skeleton is posed: standing and sitting figures are baked once, walkers and cyclists are baked
as a ring of WALK_FRAMES poses that the site steps through (web/people_walk.js).
All figures share one small colour map, so one material. Local +X = forward, z = 0 ground.
Run by build_square.py with its globals. Sources: assets/people_polyfork/ (not in git).
A published site must credit every model by name (CC BY 4.0) and say it was changed."""
import base64, bmesh, bpy, gzip, json, math, os, runpy
from array import array
from mathutils import Vector, Matrix

SRC = os.path.join(ROOT, "assets", "people_polyfork", "clean")
PAL = runpy.run_path(os.path.join(ROOT, "blender", "people_palette.py"))
OURS = dict(PAL["COLORS"])
BY_INDEX = [rgb for _, rgb in PAL["COLORS"]]
KINDS = ("objects", "meshes", "materials", "armatures", "actions", "images")
WALK_FRAMES = 14
TURN = Matrix.Rotation(math.pi / 2, 3, "Z")              # the sources look down -Y, our figures down +X
# part -> our colour, None = left out. Parts not listed keep their own colours (the body).
BASE = {
    "gentleman": ("audience-gentleman-base", {"garment-jacket": "brown", "garment-trousers": "brown", "garment-shirt": "white",
                  "garment-bow-tie": "maroon", "garment-hair": "hair_dark", "garment-shoes": "black", "garment-beard": "skin_a"}),
    "pioneer": ("human-vest-shorts-base", {"garment-shorts": "khaki", "garment-t-shirt": "white", "garment-vest": "grey",
                "garment-hair": "hair_brown", "garment-shoes": "brown"}),
    "man": ("taverna-waiter-base", {"garment-shirt": "sky", "garment-trousers": "charcoal", "garment-apron": "charcoal",
            "garment-hair": "hair_dark", "garment-shoes": "black", "attach-righthand-mesh": None}),
    "elder": ("older-woman-with-a-basket-base", {"garment-dress": "navy", "garment-apron": "cream", "garment-headscarf": "white",
              "garment-hair": "hair_grey", "garment-stockings": "grey", "garment-shoes": "black"}),
    "young": ("teen-audience-member-base", {"garment-dress": "rose", "garment-jacket": "cream", "garment-hair": "hair_brown",
              "garment-hair-tie": "maroon", "garment-shoes": "brown"}),
    "child": ("child-at-the-fun-fair-base", {"garment-overalls": "navy", "garment-shirt": "white", "garment-socks": "white",
              "garment-sneakers": "brown", "garment-hair": "hair_brown", "garment-bobbles": "hair_brown", "attach-righthand-mesh": None}),
}


def who(base, hat=None, **paint):
    """One person: a base, an optional (hat, colour) and repaints (keys without 'garment-')."""
    spec = dict(BASE[base][1])
    for key, value in paint.items():
        spec[("attach-righthand-mesh" if key == "basket" else "garment-" + key.replace("_", "-"))] = value
    return {"base": base, "paint": spec, "hat": hat}


def gent(suit, hat="charcoal"):
    return who("gentleman", ("fedora", hat), jacket=suit, trousers=suit)


def clerk(shirt, trousers, hat=None):
    return who("man", hat, shirt=shirt, trousers=trousers, apron=trousers)


def worker(shorts, vest, cap="khaki"):
    return who("pioneer", ("cap", cap), shorts=shorts, vest=vest)


def lady(dress, jacket, hair="hair_brown", hat=None):
    return who("young", hat, dress=dress, jacket=jacket, hair=hair)


def granny(dress, apron="cream", basket=True):
    return who("elder", None, dress=dress, apron=apron, **({} if basket else {"basket": None}))


def girl(dress, shirt="white"):
    return who("child", None, overalls=dress, shirt=shirt)


def boy(shorts, shirt="white", cap="khaki"):
    return dict(who("child", ("cap", cap), overalls=shorts, shirt=shirt, bobbles=None), short_hair=True)


# the mesh each old figure turns into. Walkers: a list of (person, sideways, forward) offsets, as in people.py
WALKERS = {
    "couple": [(gent("navy"), 0.30, 0.0), (lady("green", "white", "hair_dark", ("sunhat", "cream")), -0.30, 0.05)],
    "man_walk": [(clerk("white", "khaki", ("fedora", "brown")), 0.0, 0.0)],
    "family": [(lady("mustard", "cream"), 0.31, 0.0), (girl("red"), -0.31, 0.05)],
    "friends": [(lady("blue", "white", "hair_dark"), 0.30, 0.0), (lady("maroon", "beige", "hair_brown", ("sunhat", "white")), -0.30, 0.05)],
    "boy_walk": [(boy("khaki"), 0.0, 0.0)],
}
STAND = {
    "stand_0": lady("white", "sky", "hair_dark"), "stand_1": gent("charcoal"), "stand_2": boy("charcoal", "sky", "navy"),
    "stand_3": girl("blue"), "stand_4": granny("charcoal"), "stand_5": worker("beige", "brown", "grey"),
    "listen_elder": granny("navy"), "listen_gent": gent("brown"), "listen_girl": girl("navy"), "listen_young": lady("rose", "cream"),
    "fence_pioneer": worker("khaki", "grey"), "fence_man": clerk("sky", "charcoal", ("fedora", "beige")),
}
SIT = {
    "sit_0": lady("sky", "white", "hair_dark"), "sit_1": gent("grey"), "sit_2": granny("maroon", "white", False),
    "sit_3": girl("rose"), "sit_4": lady("green", "cream"), "sit_5": clerk("cream", "brown", ("fedora", "charcoal")),
    "sit_6": lady("navy", "white", "hair_brown", ("sunhat", "cream")), "sit_7": boy("navy", "cream", "grey"),
}
GENIA = dict(who("young", ("curls", "blonde"), dress="charcoal", jacket="beige", hair="blonde", hair_tie="blonde", shoes="black"), together=True)


def _rgb(c):
    return tuple(min(255, int(round(v * 255 / 6.0)) * 6) for v in c[:3])


def _clear(before):
    for o in [o for o in bpy.data.objects if o not in before["objects"]]:
        bpy.data.objects.remove(o)
    for k in KINDS[1:]:
        data = getattr(bpy.data, k)
        for d in [d for d in data if d not in before[k]]:
            data.remove(d)


def _solid(bm, colour_of):
    """bmesh prop -> (verts, faces, colours) with faces coloured by `colour_of(face)`."""
    bm.verts.index_update()
    out = ([v.co.copy() for v in bm.verts], [tuple(v.index for v in f.verts) for f in bm.faces], [colour_of(f) for f in bm.faces])
    bm.free()
    return out


def _weld(o):
    """Join the split corners, so the surface shades as one piece. No triangle is removed."""
    bm = bmesh.new()
    bm.from_mesh(o.data)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bm.to_mesh(o.data)
    bm.free()


def _largest_piece(o):
    """Keep only the biggest connected piece (a boy: the child's hair without the pigtails)."""
    bm = bmesh.new()
    bm.from_mesh(o.data)
    left, pieces = set(bm.verts), []
    while left:
        stack, piece = [left.pop()], []
        while stack:
            v = stack.pop()
            piece.append(v)
            for e in v.link_edges:
                w = e.other_vert(v)
                if w in left:
                    left.remove(w)
                    stack.append(w)
        pieces.append(piece)
    pieces.sort(key=len, reverse=True)
    bmesh.ops.delete(bm, geom=[v for piece in pieces[1:] for v in piece], context="VERTS")
    bm.to_mesh(o.data)
    bm.free()


class Person:
    """One source character in the open file: repainted, thinned, hatted and ready to be posed."""

    def __init__(self, spec, colours):
        self.before = {k: set(getattr(bpy.data, k)) for k in KINDS}
        bpy.ops.import_scene.gltf(filepath=os.path.join(SRC, BASE[spec["base"]][0] + ".glb"))
        new = [o for o in bpy.data.objects if o not in self.before["objects"]]
        self.arm = next(o for o in new if o.type == "ARMATURE")
        self.walk_clip = next(a for a in bpy.data.actions if a not in self.before["actions"] and a.name.startswith("Walk"))
        ad = self.arm.animation_data or self.arm.animation_data_create()
        for t in ad.nla_tracks:
            t.mute = True
        ad.action = None
        for pb in self.arm.pose.bones:
            pb.matrix_basis.identity()
        self.number = lambda c: colours.setdefault(c, len(colours))
        self.parts = []
        paint = spec["paint"]
        for o in new:
            if o.type != "MESH" or o.name.startswith("Icosphere"):
                continue
            part = o.name.split(".")[0]
            if part in paint and paint[part] is None:
                continue
            me = o.data
            ca = me.color_attributes[0] if me.color_attributes else None
            own = [_rgb(d.color_srgb) for d in ca.data] if ca and part not in paint and not part.startswith(("attach", "garment")) else []
            skin = max(set(own), key=own.count) if own else None          # most of the body is skin
            local, numbers = [], []
            for p in me.polygons:
                if part in paint:
                    c = OURS[paint[part]]
                else:
                    li = p.loop_indices[0]
                    c = _rgb(ca.data[li if ca.domain == "CORNER" else me.loops[li].vertex_index].color_srgb) if ca else (200, 170, 140)
                    if skin and sum((a - b) ** 2 for a, b in zip(c, skin)) < 55 ** 2:
                        c = _rgb([min(1.0, w / 255 * a / max(b, 1)) for w, a, b in zip(OURS["skin_a"], c, skin)])
                if c not in local:
                    local.append(c)
                numbers.append(local.index(c))
            me.materials.clear()
            for _ in local:
                me.materials.append(None)
            me.polygons.foreach_set("material_index", numbers)
            _weld(o)
            if part == "garment-hair" and spec.get("short_hair"):
                _largest_piece(o)
            self.parts.append((o, [self.number(c) for c in local]))
        bpy.context.view_layer.update()
        if spec["hat"]:
            self._wear(*spec["hat"])

    def done(self):
        _clear(self.before)

    # ---- hats and curls: small meshes that follow the head bone ----
    def _wear(self, kind, colour):
        pts = []
        for o, _ in self.parts:
            groups = {g.index for g in o.vertex_groups if g.name == "Head"}
            pts += [o.matrix_world @ v.co for v in o.data.vertices if any(g.group in groups and g.weight > 0.5 for g in v.groups)]
        top = max(v.z for v in pts)
        crown = [v for v in pts if v.z > top - 0.10]
        cx = (min(v.x for v in crown) + max(v.x for v in crown)) / 2
        cy = (min(v.y for v in crown) + max(v.y for v in crown)) / 2
        r = max(max(v.x for v in crown) - min(v.x for v in crown), max(v.y for v in crown) - min(v.y for v in crown)) / 2 + 0.008
        bm = bmesh.new()

        def tube(z0, z1, r0, r1, back=0.0, seg=9):
            lo = [bm.verts.new((cx + r0 * math.cos(6.283 * i / seg), cy + r0 * math.sin(6.283 * i / seg), z0)) for i in range(seg)]
            hi = [bm.verts.new((cx + r1 * math.cos(6.283 * i / seg), cy + back + r1 * math.sin(6.283 * i / seg), z1)) for i in range(seg)]
            for i in range(seg):
                bm.faces.new((lo[i], lo[(i + 1) % seg], hi[(i + 1) % seg], hi[i]))
            bm.faces.new(lo[::-1])
            bm.faces.new(hi)

        pieces = []
        if kind == "fedora":
            tube(top - 0.075, top - 0.062, r * 1.5, r * 1.45)
            tube(top - 0.066, top + 0.032, r * 1.02, r * 0.84)
        elif kind in ("cap", "boycap"):                       # flat cap with a short peak; the model looks down -Y
            z = top - 0.022
            if kind == "boycap":                              # a boy: short hair under the cap
                crop = bmesh.new()
                g = bmesh.ops.create_icosphere(crop, subdivisions=2, radius=r * 1.04)
                for v in g["verts"]:
                    v.co = Vector((v.co.x, v.co.y * 1.02, v.co.z * 0.8))
                bmesh.ops.delete(crop, context="VERTS", geom=[v for v in crop.verts
                                 if v.co.z < -r * 0.15 or (v.co.y < -r * 0.45 and v.co.z < r * 0.45)])
                bmesh.ops.translate(crop, vec=(cx, cy + 0.006, top - r * 0.72), verts=crop.verts)
                hair = self.number(OURS["hair_brown"])
                pieces.append(_solid(crop, lambda f: hair))
                z = top + 0.004
            tube(z - 0.045, z + 0.005, r * 1.05, r * 1.0, -0.012)
            tube(z + 0.005, z + 0.025, r * 1.0, r * 0.55, -0.012)
            peak = [bm.verts.new(p) for p in ((cx - r * .7, cy - r * .75, z - .04), (cx - r * .35, cy - r * 1.65, z - .052),
                                              (cx + r * .35, cy - r * 1.65, z - .052), (cx + r * .7, cy - r * .75, z - .04))]
            bm.faces.new(peak)
        elif kind == "sunhat":
            tube(top - 0.06, top - 0.05, r * 1.75, r * 1.65)
            tube(top - 0.052, top + 0.018, r * 1.0, r * 0.72)
        elif kind == "curls":                                  # Genia's waves, after her portrait: low on top, full at the sides
            for x, y, z, s in ((0.045, -0.062, -0.040, .034), (-0.045, -0.062, -0.040, .034), (0.0, -0.068, -0.030, .032),
                               (0.088, -0.015, -0.080, .040), (-0.088, -0.015, -0.080, .040), (0.092, 0.025, -0.140, .042),
                               (-0.092, 0.025, -0.140, .042), (0.070, 0.055, -0.180, .042), (-0.070, 0.055, -0.180, .042),
                               (0.025, 0.080, -0.185, .045), (-0.025, 0.080, -0.185, .045)):
                g = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=s)
                bmesh.ops.translate(bm, vec=(cx + x, cy + y, top - 0.012 + z), verts=g["verts"])
        main = self.number(OURS[colour])
        pieces.append(_solid(bm, lambda f: main))
        self.attach(pieces, "Head")

    def attach(self, pieces, bone):
        """Small meshes [(verts, faces, colour numbers)] that follow one bone."""
        for verts, faces, cols in pieces:
            me = bpy.data.meshes.new("pf_hat")
            me.from_pydata([tuple(v) for v in verts], [], faces)
            local = sorted(set(cols))
            for _ in local:
                me.materials.append(None)
            me.polygons.foreach_set("material_index", [local.index(c) for c in cols])
            o = bpy.data.objects.new("pf_hat", me)
            bpy.context.scene.collection.objects.link(o)
            o.vertex_groups.new(name=bone).add(list(range(len(verts))), 1.0, "REPLACE")
            o.modifiers.new("arm", "ARMATURE").object = self.arm
            self.parts.append((o, local))

    # ---- hands ----
    def curl(self, side, degrees, knuckle=0.072, length=0.064):
        """Bend the straight fingers of one hand towards the palm (the sources have no finger bones)."""
        sign = 1 if side == "Left" else -1                # which way the hand points in the rest pose
        wrist = self.arm.matrix_world @ self.arm.data.bones[side + "Hand"].head_local
        k = math.radians(degrees) / length
        for o, _ in self.parts:
            groups = {g.index for g in o.vertex_groups if g.name == side + "Hand"}
            for v in o.data.vertices:
                if sum(g.weight for g in v.groups if g.group in groups) <= 0.5:
                    continue
                at = o.matrix_world @ v.co - wrist
                u, up = sign * at.x - knuckle, at.z + 0.012
                if u <= 0:
                    continue
                a = k * u
                at.x = sign * (knuckle + math.sin(a) / k + up * math.sin(a))
                at.z = -0.012 - (1 - math.cos(a)) / k + up * math.cos(a)
                v.co = o.matrix_world.inverted() @ (wrist + at)
        bpy.context.view_layer.update()

    def turn_hand(self, side, fingers, palm):
        """The hand's rotation that points the fingers along `fingers` with the palm facing `palm`."""
        def frame(f, n):
            f = Vector(f).normalized()
            n = (Vector(n) - f * Vector(n).dot(f)).normalized()
            return Matrix((f, n, f.cross(n))).transposed()
        return frame(fingers, palm) @ frame((1 if side == "Left" else -1, 0, 0), (0, 0, -1)).transposed()

    def set_hand(self, side, turn):
        pb = self.arm.pose.bones[side + "Hand"]
        rest = self.arm.data.bones[side + "Hand"].matrix_local.to_3x3()
        at = pb.matrix.translation.copy()
        pb.matrix = Matrix.Translation(at) @ (turn @ rest).to_4x4()
        bpy.context.view_layer.update()

    # ---- posing, in the source's own space (forward -Y, left +X) ----
    def head_of(self, bone):
        return (self.arm.matrix_world @ self.arm.pose.bones[bone].matrix).translation

    def aim(self, bone, child, direction):
        pb = self.arm.pose.bones[bone]
        at = pb.matrix.translation.copy()
        now = (self.arm.pose.bones[child].matrix.translation - at).normalized()
        turn = now.rotation_difference(Vector(direction).normalized()).to_matrix().to_4x4()
        pb.matrix = Matrix.Translation(at) @ turn @ Matrix.Translation(-at) @ pb.matrix
        bpy.context.view_layer.update()

    def reach(self, upper, lower, end, target, bend):
        """Two bone reach: the end of the limb goes to `target`, the joint bends towards `bend`."""
        a_at, b_at, c_at = self.head_of(upper), self.head_of(lower), self.head_of(end)
        a, b = (b_at - a_at).length, (c_at - b_at).length
        to = Vector(target) - a_at
        d = min(max(to.length, abs(a - b) + 1e-4), a + b - 1e-4)
        to.normalize()
        side = Vector(bend) - to * Vector(bend).dot(to)
        side.normalize()
        along = (a * a - b * b + d * d) / (2 * d)
        joint = a_at + to * along + side * math.sqrt(max(a * a - along * along, 0.0))
        self.aim(upper, lower, joint - a_at)
        self.aim(lower, end, a_at + to * d - self.head_of(lower))

    def arms_down(self, out=0.16, forward=0.02):
        for side, x in (("Left", 1), ("Right", -1)):
            self.aim(side + "Arm", side + "ForeArm", (x * out, -forward, -1))
            self.aim(side + "ForeArm", side + "Hand", (x * out * 0.4, -0.12 - forward, -1))

    def sit(self):
        for side, x in (("Left", 1), ("Right", -1)):
            self.aim(side + "UpLeg", side + "Leg", (x * 0.06, -1, -0.03))
            self.aim(side + "Leg", side + "Foot", (0, -0.06, -1))
            self.aim(side + "Foot", side + "ToeBase", (0, -1, -0.45))
            self.aim(side + "Arm", side + "ForeArm", (x * 0.22, -0.28, -1))
            self.aim(side + "ForeArm", side + "Hand", (-x * 0.42, -1, -0.30))

    def carried_by(self, bones):
        """Numbers (in the order of verts()) of the corners that mostly follow one of these bones."""
        out, base = [], 0
        for o, _ in self.parts:
            groups = {g.index for g in o.vertex_groups if g.name in bones}
            out += [base + v.index for v in o.data.vertices if sum(g.weight for g in v.groups if g.group in groups) > 0.5]
            base += len(o.data.vertices)
        return out

    def verts(self):
        """Posed corner positions of every part, in one fixed order."""
        bpy.context.view_layer.update()
        deps = bpy.context.evaluated_depsgraph_get()
        out = []
        for o, _ in self.parts:
            ev = o.evaluated_get(deps)
            me = ev.to_mesh()
            out += [o.matrix_world @ v.co for v in me.vertices]
            ev.to_mesh_clear()
        return out

    def faces(self):
        faces, cols, base = [], [], 0
        for o, local in self.parts:
            for p in o.data.polygons:
                faces.append(tuple(base + i for i in p.vertices))
                cols.append(local[p.material_index])
            base += len(o.data.vertices)
        return faces, cols


def _place(points, delta, side=0.0, ahead=0.0):
    return [TURN @ (v + delta) + Vector((ahead, side, 0)) for v in points]


def standing(spec, colours):
    p = Person(spec, colours)
    p.arms_down()
    pts = p.verts()
    faces, cols = p.faces()
    p.done()
    return [_place(pts, Vector((0, 0, -min(v.z for v in pts))))], faces, cols


SEAT = 0.512                                             # top of the bench slats above the figure's origin (island.bench_mesh)
FRONT = 0.43                                             # front edge of the seat, ahead of the bench's origin


def take_seat(p, spec):
    """Pose the legs for the bench. -> (hip, lift, slide): where the posed figure has to move to."""
    hip = (p.head_of("LeftUpLeg") + p.head_of("RightUpLeg")) / 2
    p.sit()
    if spec.get("together"):                              # knees and shoes side by side
        for side, x in (("Left", 1), ("Right", -1)):
            p.aim(side + "UpLeg", side + "Leg", (-x * 0.13, -1, -0.03))
            p.aim(side + "Leg", side + "Foot", (-x * 0.045, -0.06, -1))
            p.aim(side + "Foot", side + "ToeBase", (0, -1, -0.45))
    shins = p.carried_by({side + bone for side in ("Left", "Right") for bone in ("Leg", "Foot", "ToeBase")})
    rump = p.carried_by({"Hips", "LeftUpLeg", "RightUpLeg"})
    pts = p.verts()
    lift = SEAT - min(pts[i].z for i in rump if -0.15 < hip.y - pts[i].y < 0.2)
    gap = min(v.z for v in pts) + lift
    if spec["base"] != "child" and gap > 0.015:           # a little longer in the shin, so the shoes reach the paving
        for side in ("Left", "Right"):
            p.arm.data.bones[side + "Foot"].inherit_scale = "NONE"
            shin = (p.head_of(side + "Foot") - p.head_of(side + "Leg")).length
            p.arm.pose.bones[side + "Leg"].scale.y *= 1 + gap / shin
        pts = p.verts()
    # slide forward until nothing of the lower legs is behind the seat's front edge
    below = [hip.y - pts[i].y for i in shins if pts[i].z + lift < SEAT + 0.01]
    return hip, lift, max(0.0, FRONT + 0.012 - min(below))


def sitting(spec, colours):
    """On the bench: thighs resting on the slats, knees and shins clear in front of the seat,
    grown-ups' feet on the ground, children's feet in the air."""
    p = Person(spec, colours)
    hip, lift, slide = take_seat(p, spec)
    pts = p.verts()
    faces, cols = p.faces()
    p.done()
    return [_place(pts, Vector((0, -hip.y - slide, lift)))], faces, cols


# ---- Genia, writing in her notebook ----
WRITE_FRAMES, WRITE_SECONDS = 24, 6.4


def _tube(bm, sections, seg=14):
    """A closed sleeve through (centre, half width, half height) sections; width runs left to right."""
    rings = []
    for i, (at, w, h) in enumerate(sections):
        along = (sections[min(i + 1, len(sections) - 1)][0] - sections[max(i - 1, 0)][0]).normalized()
        up = along.cross(Vector((1, 0, 0))).normalized()
        if up.z < 0 and abs(along.z) < 0.7:
            up.negate()
        rings.append([bm.verts.new(at + Vector((w * math.cos(6.283 * k / seg), 0, 0)) + up * h * math.sin(6.283 * k / seg))
                      for k in range(seg)])
    for a, b in zip(rings, rings[1:]):
        for k in range(seg):
            bm.faces.new((a[k], a[(k + 1) % seg], b[(k + 1) % seg], b[k]))
    bm.faces.new(rings[0][::-1])
    bm.faces.new(rings[-1])


def _box(bm, centre, size, turn):
    g = bmesh.ops.create_cube(bm, size=1.0)
    for v in g["verts"]:
        v.co = turn @ Vector((v.co.x * size[0], v.co.y * size[1], v.co.z * size[2])) + centre
    return {f for v in g["verts"] for f in v.link_faces}


def writing(spec, colours):
    """-> (frames, faces, colours). A longer skirt over the knees, a notebook on her lap, a pencil that moves;
    now and then she looks up."""
    def number(c):
        return colours.setdefault(c, len(colours))

    p = Person(spec, colours)
    hip, lift, slide = take_seat(p, spec)
    knee = (p.head_of("LeftLeg") + p.head_of("RightLeg")) / 2
    ankle = (p.head_of("LeftFoot") + p.head_of("RightFoot")) / 2
    delta = Vector((0, -hip.y - slide, lift))
    # the skirt: from the waist, over the thighs and knees, to a third of the way down the shins
    bm = bmesh.new()
    _tube(bm, [(hip + Vector((0, 0.055, 0.01)), 0.165, 0.085), (hip.lerp(knee, 0.45) + Vector((0, 0, 0.004)), 0.168, 0.092),
               (knee + Vector((0, 0.045, 0.008)), 0.14, 0.102), (knee + Vector((0, -0.036, -0.03)), 0.132, 0.1),
               (knee.lerp(ankle, 0.36), 0.108, 0.075)])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    skirt_colour = number(OURS["charcoal"])
    skirt = _solid(bm, lambda f: skirt_colour)
    # the notebook, propped on her thighs
    tilt = Matrix.Rotation(math.radians(-24), 3, "X")
    book = hip.lerp(knee, 0.66) + Vector((0, 0, 0.125))
    bm = bmesh.new()
    cover = _box(bm, book, (0.215, 0.165, 0.012), tilt)
    paper = _box(bm, book + tilt @ Vector((0, 0, 0.009)), (0.19, 0.145, 0.008), tilt)
    for k in range(4):                                    # lines of writing
        _box(bm, book + tilt @ Vector((0.012, 0.045 - k * 0.026, 0.0145)), (0.12 - 0.012 * k, 0.005, 0.001), tilt)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    brown, white, ink = number(OURS["maroon"]), number(OURS["white"]), number(OURS["charcoal"])
    notebook = _solid(bm, lambda f: brown if f in cover else white if f in paper else ink)
    p.curl("Right", 78)
    p.curl("Left", 48)
    # the pencil, in the rest pose: under the fingertips, beside the thumb, up over the web of the hand
    wrist = p.arm.matrix_world @ p.arm.data.bones["RightHand"].head_local
    grip = wrist + Vector((-0.093, -0.028, -0.040))
    back = Vector((0.056, -0.008, 0.046)).normalized()
    nib_rest, end = grip - back * 0.048, grip + back * 0.098
    bm = bmesh.new()
    _tube(bm, [(nib_rest, 0.0012, 0.0012), (nib_rest + back * 0.016, 0.0048, 0.0048), (end, 0.0048, 0.0048)], seg=6)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    yellow, tip = number(OURS["mustard"]), number(OURS["charcoal"])
    p.attach([_solid(bm, lambda f: tip if (f.calc_center_median() - nib_rest).length < 0.013 else yellow)], "RightHand")
    write_turn = p.turn_hand("Right", (0.42, -0.84, -0.34), (0.30, 0.12, -0.94))
    hold_turn = p.turn_hand("Left", (-0.80, -0.58, 0.10), (0.05, -0.12, 0.99))
    frames = []
    for k in range(WRITE_FRAMES):
        look_up = max(0.0, math.sin(math.pi * (k - 15) / 9)) if k > 15 else 0.0      # the last third: a glance up
        zig = 0.0 if look_up > 0.2 else (0.012 if k % 2 else -0.012)
        run = min(k, 15) / 15
        nib = book + tilt @ Vector((-0.045 + 0.05 * run + zig, 0.03 - 0.045 * run + zig * 0.35, 0.017 + 0.035 * look_up))
        for name in ("Neck", "LeftArm", "LeftForeArm", "LeftHand", "RightArm", "RightForeArm", "RightHand"):
            p.arm.pose.bones[name].matrix_basis.identity()
        bpy.context.view_layer.update()
        p.reach("LeftArm", "LeftForeArm", "LeftHand", book + Vector((0.150, 0.075, -0.048)), (0.7, 0.5, -0.5))
        p.set_hand("Left", hold_turn)
        # the wrist goes where the pencil's point ends up on the paper
        p.reach("RightArm", "RightForeArm", "RightHand", nib - write_turn @ (nib_rest - wrist), (-0.7, 0.5, -0.5))
        p.set_hand("Right", write_turn)
        neck = p.arm.pose.bones["Neck"]
        at = neck.matrix.translation.copy()
        pitch = Matrix.Rotation(math.radians(17 - 17 * look_up), 4, "X")
        yaw = Matrix.Rotation(math.radians(-6 - 24 * look_up), 4, "Z")
        neck.matrix = Matrix.Translation(at) @ yaw @ pitch @ Matrix.Translation(-at) @ neck.matrix
        frames.append(p.verts())
    faces, cols = p.faces()
    p.done()

    def seated(points):
        out = _place(points, delta)
        for v in out:                                     # cloth rests on the slats, it does not sink into them
            if v.x < FRONT - 0.02 and v.z < SEAT:
                v.z = SEAT
        return out

    still_skirt = _place(skirt[0], delta)
    for v in still_skirt:
        if v.x < FRONT + 0.004 and v.z < SEAT + 0.002:
            v.z = SEAT + 0.002
    body = [_place(f, delta) for f in frames]
    return _join([(body, faces, cols), ([still_skirt], skirt[1], skirt[2]), ([_place(notebook[0], delta)], notebook[1], notebook[2])])


def walking(spec, colours, side, ahead, shift, pose=None):
    """-> ((frames of positions, faces, colours), stride in metres)."""
    p = Person(spec, colours)
    clip = p.walk_clip
    if pose:                                                  # arms are held: take them out of the clip
        clip = clip.copy()
        for layer in clip.layers:
            for strip in layer.strips:
                for bag in strip.channelbags:
                    for fc in [f for f in bag.fcurves if "Arm" in f.data_path or "Hand" in f.data_path]:
                        bag.fcurves.remove(fc)
    p.arm.animation_data.action = clip
    if clip.slots:
        p.arm.animation_data.action_slot = clip.slots[0]
    first, last = clip.frame_range
    frames, hips, spread = [], [], 0.0
    for k in range(WALK_FRAMES):
        t = first + (last - first) * ((k / WALK_FRAMES + shift) % 1.0)
        bpy.context.scene.frame_set(int(t), subframe=t - int(t))
        if pose:
            pose(p)
        hips.append(p.head_of("Hips"))
        spread = max(spread, abs(p.head_of("LeftFoot").y - p.head_of("RightFoot").y))
        frames.append(p.verts())
    faces, cols = p.faces()
    p.done()
    mid = sum((Vector((h.x, h.y, 0)) for h in hips), Vector()) / len(hips)
    drift = max((Vector((h.x, h.y, 0)) - mid).length for h in hips) > 0.25          # a clip that travels is kept in place
    low = min(v.z for f in frames for v in f)
    out = []
    for h, f in zip(hips, frames):
        centre = Vector((h.x, h.y, 0)) if drift else mid
        out.append(_place(f, Vector((-centre.x, -centre.y, -low)), side, ahead))
    return (out, faces, cols), max(0.5, spread * 2)


# ---- standing people breathe and shift: the sources' own Idle clip ----
IDLE = [name for name in STAND if name not in ("stand_0", "stand_1")]      # those two are not placed in the square
IDLE_FRAMES = 16                                          # the site blends from one to the next


def idle_clip():
    """The gentleman's calm Idle, for everybody: head, back and arms only. Hips and legs stay straight
    (several of the other clips stand astride)."""
    before = {k: set(getattr(bpy.data, k)) for k in KINDS}
    bpy.ops.import_scene.gltf(filepath=os.path.join(SRC, BASE["gentleman"][0] + ".glb"))
    clip = next(a for a in bpy.data.actions if a not in before["actions"] and a.name.startswith("Idle")).copy()
    for layer in clip.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for fc in [f for f in bag.fcurves if "rotation" not in f.data_path
                           or any(n in f.data_path for n in ("Hips", "Leg", "Foot", "Toe"))]:
                    bag.fcurves.remove(fc)
    for o in [o for o in bpy.data.objects if o not in before["objects"]]:
        bpy.data.objects.remove(o)
    for k in KINDS[1:]:
        data = getattr(bpy.data, k)
        for d in [d for d in data if d not in before[k] and d != clip]:
            data.remove(d)
    return clip


def idling(spec, colours, clip):
    p = Person(spec, colours)
    p.arm.animation_data.action = clip
    if clip.slots:
        p.arm.animation_data.action_slot = clip.slots[0]
    first, last = clip.frame_range
    frames, low = [], None
    for k in range(IDLE_FRAMES):
        t = first + (last - first) * k / IDLE_FRAMES
        bpy.context.scene.frame_set(int(t), subframe=t - int(t))
        pts = p.verts()
        low = min(v.z for v in pts) if low is None else low
        frames.append(_place(pts, Vector((0, 0, -low))))
    faces, cols = p.faces()
    p.done()
    return frames, faces, cols


def _join(pieces):
    """[(frames, faces, colours)] -> one (frames, faces, colours); still pieces are repeated."""
    count = max(len(f) for f, _, _ in pieces)
    frames, faces, cols, base = [[] for _ in range(count)], [], [], 0
    for f, fa, c in pieces:
        for k in range(count):
            frames[k] += f[k % len(f)]
        faces += [tuple(base + i for i in face) for face in fa]
        cols += c
        base += len(f[0])
    return frames, faces, cols


def figures(M, P):
    """-> {old figure name: new mesh}. P is people.py's namespace (pram, bicycle, accordion)."""
    colours = {}
    frame_before = bpy.context.scene.frame_current

    def number(c):
        return colours.setdefault(c, len(colours))

    def prop(draw):
        bm = bmesh.new()
        draw(bm)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        verts, faces, cols = _solid(bm, lambda f: number(BY_INDEX[f.material_index]))
        return [verts], faces, cols

    made, stride = {}, {}

    clip = idle_clip()
    seconds = (clip.frame_range[1] - clip.frame_range[0]) / bpy.context.scene.render.fps
    for name, spec in STAND.items():
        made[name] = idling(spec, colours, clip) if name in IDLE else standing(spec, colours)
    bpy.data.actions.remove(clip)
    for name, spec in SIT.items():
        made[name] = sitting(spec, colours)
    made["genia"] = writing(GENIA, colours)

    for name, group in WALKERS.items():
        pieces = []
        for i, (spec, side, ahead) in enumerate(group):
            piece, step = walking(spec, colours, side, ahead, 0.27 * i)
            pieces.append(piece)
            stride.setdefault(name, step)
        made[name] = _join(pieces)

    # mothers push the pram: the arms reach for the handle all the way round the step
    def push(p):
        shoulder = p.head_of("LeftArm")
        hip_y = p.head_of("Hips").y
        for side, x in (("Left", 1), ("Right", -1)):
            p.reach(side + "Arm", side + "ForeArm", side + "Hand",
                    (x * 0.17, hip_y - 0.36, min(0.98, shoulder.z - 0.24)), (x * 0.4, 0.5, -1))

    for name, spec, pram_colour in (("mother_0", lady("blue", "white", "hair_dark", ("sunhat", "cream")), "white"),
                                    ("mother_1", lady("maroon", "beige"), "cream")):
        piece, step = walking(spec, colours, 0.0, -0.47, 0.0, push)
        made[name] = _join([piece, prop(lambda bm: P["pram"](bm, 0.47, 0.0, pram_colour))])
        stride[name] = step

    # cyclists: seated on our bicycle, feet following the pedals round
    def cyclist(spec, k, frame_colour):
        p = Person(spec, colours)
        hip = (p.head_of("LeftUpLeg") + p.head_of("RightUpLeg")) / 2
        saddle = Vector((-0.2 * k, 0, 0.82 * k + 0.10))                       # in our space: +X forward
        delta = Vector((0, -saddle.x - hip.y, saddle.z - hip.z))              # our +X is the source's -Y

        def source(x, y, z):
            return Vector((y, -x, z)) - delta

        for bone, child, d in (("Spine", "Spine1", (0, -0.34, 1)), ("Spine2", "Neck", (0, -0.46, 1)), ("Neck", "Head", (0, 0.05, 1))):
            p.aim(bone, child, d)
        for side, x in (("Left", 1), ("Right", -1)):
            p.reach(side + "Arm", side + "ForeArm", side + "Hand", source(0.40 * k, x * 0.22 * k, 1.0 * k), (x * 0.5, 0.4, -1))
        frames, pedals = [], []
        for n in range(WALK_FRAMES):
            turn = -6.2832 * n / WALK_FRAMES
            feet = []
            for side, x, phase in (("Left", 1, 0.0), ("Right", -1, math.pi)):
                at = Vector((-0.05 * k + 0.13 * k * math.cos(turn + phase), x * 0.15 * k, 0.32 * k + 0.13 * k * math.sin(turn + phase)))
                feet.append(at)
                p.reach(side + "UpLeg", side + "Leg", side + "Foot", source(at.x - 0.03, at.y, at.z + 0.09), (0, -1, 0.35))
                p.aim(side + "Foot", side + "ToeBase", (0, -1, -0.35))
            frames.append([TURN @ (v + delta) for v in p.verts()])
            pedals.append(feet)
        faces, cols = p.faces()
        p.done()

        def pedal_mesh(feet):
            def draw(bm):
                for at in feet:
                    P["block"](bm, tuple(at), (0.15 * k, 0.09 * k, 0.045 * k), "black")
                    P["limb"](bm, (-0.05 * k, at.y * 0.45, 0.32 * k), (at.x, at.y * 0.8, at.z), 0.014, 0.014, "metal", 4)
            return prop(draw)

        moving = [pedal_mesh(f) for f in pedals]
        look = {"kind": "man" if k == 1 else "boy"}
        return _join([(frames, faces, cols),
                      ([m[0][0] for m in moving], moving[0][1], moving[0][2]),
                      prop(lambda bm: P["bicycle"](bm, look, col=frame_colour, rider=False))])

    for name, spec, k, frame_colour in (("cyclist", clerk("white", "khaki", ("cap", "brown")), 1.0, "black"),
                                        ("kidbike_0", boy("khaki", "white", "khaki"), 0.68, "black"),
                                        ("kidbike_1", boy("navy", "sky", "white"), 0.68, "red")):
        made[name] = cyclist(spec, k, frame_colour)
        stride[name] = 4.2 * k

    # the accordion player: our bellows in the man's hands
    p = Person(clerk("white", "charcoal", ("cap", "brown")), colours)
    chest = p.head_of("Spine2")
    for side, x in (("Left", 1), ("Right", -1)):
        p.reach(side + "Arm", side + "ForeArm", side + "Hand", (x * 0.27, chest.y - 0.27, 1.13), (x, 0.3, -0.6))
    pts = p.verts()
    faces, cols = p.faces()
    p.done()
    made["accordion"] = _join([([_place(pts, Vector((0, 0, -min(v.z for v in pts))))], faces, cols),
                               prop(lambda bm: P["accordionist"](bm, None, body=False))])

    # ---- one colour map for everybody ----
    side, px = 16, 8
    assert len(colours) <= side * side, len(colours)
    img = bpy.data.images.new("pf_palette", side * px, side * px, alpha=False)
    buf = [0.0] * (side * px * side * px * 4)
    for c, i in colours.items():
        cx, cy = i % side, i // side
        for y in range(cy * px, (cy + 1) * px):
            for x in range(cx * px, (cx + 1) * px):
                at = ((side * px - 1 - y) * side * px + x) * 4          # rows are stored bottom up
                buf[at:at + 4] = [c[0] / 255, c[1] / 255, c[2] / 255, 1.0]
    img.pixels = buf
    img.filepath_raw = os.path.join(ROOT, "blender", "tex", "people_pf.png")
    img.file_format = "PNG"
    img.save()
    bpy.data.images.remove(img)
    for old in [i for i in bpy.data.images if i.name.startswith("people_pf")]:
        old.reload()
    M["people_pf"] = tex_mat("people_pf", "people_pf.png", 1.0, 0.85)

    # ---- meshes, and the ring of poses for everything that moves ----
    out, walk = {}, []
    for name, (frames, faces, cols) in made.items():
        me = bpy.data.meshes.new("ped_pf_" + name)
        me.from_pydata([tuple(v) for v in frames[0]], [], faces)
        uv = me.uv_layers.new(name="UVMap")
        for poly, c in zip(me.polygons, cols):
            at = ((c % side + 0.5) / side, 1 - (c // side + 0.5) / side)
            for li in poly.loop_indices:
                uv.data[li].uv = at
            poly.use_smooth = True
        me.set_sharp_from_angle(angle=math.radians(62))      # soft like the sources; hats, wheels and prams stay crisp
        if name in stride or name in IDLE or name == "genia":   # second UV set = (vertex number, which ring), read by the site
            ring = me.uv_layers.new(name="walk")
            for poly in me.polygons:
                for li in poly.loop_indices:
                    ring.data[li].uv = (float(me.loops[li].vertex_index), 1.0 - len(walk))
            me.uv_layers.active_index = 0
            data, last = array("h"), None
            for f in frames:                     # millimetre grid, web axes (y up), stored as steps from the pose before
                now = [int(round(c * 1024)) for v in f for c in (v.x, v.z, -v.y)]
                data.extend(now if last is None else [a - b for a, b in zip(now, last)])
                last = now
            entry = {"name": name, "frames": len(frames), "verts": len(frames[0]), "data": base64.b64encode(data.tobytes()).decode()}
            if name in stride:
                entry["stride"] = round(stride[name], 3)          # stepped by distance
            else:
                entry["seconds"] = WRITE_SECONDS if name == "genia" else round(seconds, 2)   # one loop by the clock
            walk.append(entry)
        me.materials.append(M["people_pf"])
        me.update()
        out[name] = me
    with open(os.path.join(ROOT, "blender", "preview", "people_walk.json.gz"), "wb") as f:
        f.write(gzip.compress(json.dumps(walk, separators=(",", ":")).encode(), 9, mtime=0))
    bpy.context.scene.frame_set(frame_before)
    return out


def dress(meshes, collection):
    """Swap every old figure standing in the scene for its new mesh (names and places stay)."""
    listeners = ["listen_elder", "listen_gent", "listen_girl", "listen_young"]
    changed = 0
    for o in sorted(collection.all_objects, key=lambda o: o.name):
        if o.type != "MESH" or not o.data.name.startswith("ped_") or o.data.name.startswith("ped_pf_"):
            continue
        key = o.data.name[4:].split(".")[0]
        if o.name.startswith("stand_listener") and listeners:
            key = listeners.pop(0)
        elif o.name.split(".")[0] == "stand_fence":
            bearing = round(math.degrees(math.atan2(o.location.x, o.location.y))) % 360
            key = {24: "fence_pioneer", 31: "fence_man"}.get(bearing, key)
        if key in meshes:
            if (key in IDLE or key == "genia") and not o.name.startswith("RO_"):        # render-only extras keep their name, so they stay out
                o.name = "idle_" + key                           # the site animates these where they stand
            o.data = meshes[key]
            changed += 1
    return changed
