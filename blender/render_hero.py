"""Photographic Cycles renders of the square. Runs headless, does not save the .blend:
  blender -b blender/kikar_1940.blend -P blender/render_hero.py -- in ring in_young cinema street shops"""
import bpy, math, os, runpy, sys, time

ROOT = r"C:\Ai\01_kikar_dizingof"
keys = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else ["in", "ring"]

# extra stills: name -> ((radius, bearing, height) of the eye, same for the target, vertical fov)
EXTRA = {"cinema": ((15.0, 60, 4.0), (48.0, 68, 7.6), 44),
         "street": ((43.6, 96, 1.7), (48.5, 70, 2.9), 48),
         "shops": ((38.0, 58, 2.3), (48.5, 33, 3.0), 46)}


def extra_camera(name):
    from mathutils import Vector
    def polar(p):
        r, b, z = p
        return Vector((r * math.sin(math.radians(b)), r * math.cos(math.radians(b)), z))
    eye, target, vfov = EXTRA[name]
    data = bpy.data.cameras.new("hero_" + name)
    data.sensor_fit, data.angle_y, data.clip_end = "VERTICAL", math.radians(vfov), 1000
    cam = bpy.data.objects.new("hero_" + name, data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = polar(eye)
    cam.rotation_euler = (polar(target) - polar(eye)).to_track_quat("-Z", "Y").to_euler()
    return cam


scene = bpy.context.scene
scene.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
device = "CPU"
for kind in ("OPTIX", "CUDA", "HIP", "ONEAPI"):
    try:
        prefs.compute_device_type = kind
    except TypeError:
        continue
    prefs.get_devices()
    gpus = [d for d in prefs.devices if d.type == kind]
    if gpus:
        for d in prefs.devices:
            d.use = d.type == kind
        scene.cycles.device = "GPU"
        device = kind + " " + gpus[0].name
        break
scene.cycles.samples = 160
scene.cycles.use_adaptive_sampling = True
scene.cycles.adaptive_threshold = 0.02
scene.cycles.use_denoising = True
scene.cycles.transparent_max_bounces = 24          # layered alpha fences and tree cages
r = scene.render
r.resolution_x, r.resolution_y, r.resolution_percentage = 1920, 1080, 100
r.image_settings.file_format = "JPEG"
r.image_settings.quality = 92
for name in keys:                                  # "in_young" = rebuilt with the caged 1938-40 saplings
    t = time.time()
    key, _, age = name.partition("_")
    if age:
        runpy.run_path(os.path.join(ROOT, "blender", "build_square.py"), run_name="kikar")["build"](age)
    cam = extra_camera(key) if key in EXTRA else bpy.data.objects["cam_" + key]
    if key == "in":                                # tighter, level framing for the still
        cam.data.angle_y = math.radians(52)
        cam.rotation_euler = (math.radians(91.5), 0, math.radians(-8))
    scene.camera = cam
    r.resolution_x, r.resolution_y = 1920, 1080       # build() resets it
    r.filepath = os.path.join(ROOT, "blender", "preview", "hero_%s.jpg" % name)
    bpy.ops.render.render(write_still=True)
    print("HERO", name, device, round(time.time() - t), "s", flush=True)
