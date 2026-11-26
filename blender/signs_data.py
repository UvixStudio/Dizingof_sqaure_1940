"""Shop signs, awning lettering and banners: one 2048 px atlas.
Shared by make_textures.py (draws it) and shops.py (maps it on the facades). Plain Python, no imports.

src: "photo" = the name is visible in a 1938-40 photo or postcard, "wiki" = Hebrew Wikipedia (Esther cinema),
"generic" = a period trade, invented as set dressing. Where each one stood is interpretation unless noted."""
ATLAS = 2048

# key: (hebrew, latin, background, letters, src)
BOARDS = {
    "eckmann":  ("כלבו אקמן", "ECKMANN", (236, 231, 215), (28, 26, 24), "wiki"),
    "amanut":   ("קפה אמנות", "", (104, 30, 28), (244, 226, 180), "wiki"),
    "flowers":  ("פרחים", "FLOWERS", (240, 236, 224), (34, 62, 46), "photo"),
    "galor":    ("גל-אור", "GAL-OR", (26, 25, 24), (236, 230, 212), "photo"),
    "pharmacy": ("בית מרקחת", "PHARMACY", (22, 74, 58), (240, 234, 214), "photo"),
    "grocery":  ("מכולת", "", (188, 134, 46), (38, 28, 18), "generic"),
    "bakery":   ("מאפייה", "", (226, 208, 168), (110, 52, 24), "generic"),
    "books":    ("ספרים וכלי כתיבה", "", (32, 48, 82), (238, 224, 186), "generic"),
    "shoes":    ("נעליים", "", (86, 54, 34), (240, 222, 184), "generic"),
    "hats":     ("כובעים", "", (230, 222, 204), (92, 26, 30), "generic"),
    "barber":   ("מספרה", "", (238, 234, 222), (28, 58, 98), "generic"),
    "icecream": ("גלידה", "", (118, 164, 150), (250, 244, 226), "generic"),
    "watch":    ("שען וצורף", "", (30, 28, 30), (212, 176, 92), "generic"),
    "textile":  ("אריגים", "", (150, 62, 42), (246, 230, 200), "generic"),
    "photo":    ("צלם", "PHOTO", (58, 62, 60), (236, 232, 216), "generic"),
    "candy":    ("ממתקים", "", (212, 150, 140), (70, 22, 26), "generic"),
    "kiosk":    ("קיוסק גזוז", "", (40, 96, 78), (246, 236, 196), "generic"),
    "deli":     ("מעדנייה", "", (232, 214, 150), (60, 40, 20), "generic"),
}
WALL = (240, 237, 228)


def _cells():
    c = {}
    for i, k in enumerate(BOARDS):                       # 1024 x 128, two per row
        c[k] = ((i % 2) * 1024, (i // 2) * 128, 1024, 128)
    y = (len(BOARDS) + 1) // 2 * 128
    c["aw_eck_en"] = (0, y, 512, 256)                    # lettering on awning cloth (postcard)
    c["aw_eck_he"] = (512, y, 512, 256)
    c["roof_pharmacy"] = (1024, y + 64, 1024, 128)       # letters on a parapet (kikar_norz)
    c["banner_bergner"] = (0, y + 256, 2048, 128)        # banner on Esther's balcony (postcard)
    return c


CELLS = _cells()


def uv(key):
    """(u0, v0, u1, v1) with v measured from the bottom, 1 px inside the cell."""
    x, y, w, h = CELLS[key]
    return ((x + 1) / ATLAS, 1 - (y + h - 1) / ATLAS, (x + w - 1) / ATLAS, 1 - (y + 1) / ATLAS)
