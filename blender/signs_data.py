"""Shop signs, awning lettering and banners: one 2048 x 4096 atlas.
Shared by make_textures.py / make_signs.py (draw it) and shops.py (maps it on the facades). Plain Python, no imports.

src: "photo" = the name is visible in a 1938-40 photo or postcard, "wiki" = Hebrew Wikipedia,
"directory" / "search" = a real Tel Aviv business that stood elsewhere in the city (not checked at the source),
"invented" = a name made up in the manner of the time. Where each one stood on the square is interpretation."""
ATLAS, ATLAS_H = 2048, 4224      # layout height; make_signs.py saves it 4096 high (the UVs are fractions)

# colours of the period: deep enamels and pale paint (background, letters)
CREAM, GOLD = (244, 232, 204), (222, 188, 104)
WINE, NAVY, GREEN, BLACK, BROWN, TEAL, BRICK = (((112, 34, 36), CREAM), ((30, 48, 84), CREAM), ((34, 82, 62), CREAM),
    ((28, 26, 26), GOLD), ((90, 56, 34), CREAM), ((30, 104, 108), CREAM), ((164, 70, 44), CREAM))
TURQ, ROSE, PIST, BUTTER, SKY, PEACH, IVORY = (((184, 232, 224), (20, 66, 72)), ((240, 190, 184), (92, 28, 40)),
    ((212, 232, 190), (36, 60, 34)), ((244, 218, 138), (78, 44, 18)), ((188, 212, 232), (26, 48, 88)),
    ((244, 202, 164), (100, 42, 22)), ((240, 234, 216), (52, 34, 26)))

# bay: (name, trade, colours, src). Two neighbours never share a colour.
NAMED = {
    "A1": ("מעדני רוזנבלום", "מעדנייה", BUTTER, "invented"),
    "A3": ("נעלי ברקוביץ", "נעליים", BROWN, "invented"),
    "A4": ("מאפיית השחר", "לחם ועוגות", IVORY, "invented"),
    "A5": ("מגדנות הדבש", "ממתקים ושוקולד", ROSE, "invented"),
    "A6": ("צרכניית שפירא", "מכולת", NAVY, "invented"),
    "F0": ("מאפיית אביב", "לחם טרי יום יום", PEACH, "invented"),
    "F1": ("כובעי אביבה", "כובעים לגברים ולנשים", TURQ, "invented"),
    "F2": ("הספר הטוב", "ספרייה להשאלה", WINE, "search"),
    "F3": ("שלמן", "שעונים", ((22, 43, 54), (234, 196, 115)), "directory"),
    "F4": ("ידיד האדם", "צרכים לכלבים", PIST, "invented"),
    "B3": ("בית האריג לוינזון", "אריגים", BRICK, "invented"),
    "B4": ("מגבעות הדר", "כובעים", SKY, "invented"),
    "B5": ("ז. הלפרין", "שען וצורף", GREEN, "invented"),
    "E0": ("פרחי הגליל", "זרים ועציצים", PIST, "invented"),
    "E1": ("גלידה ויטמן", "גלידה", TURQ, "wiki"),
    "E2": ("מ. קליין", "תיקון שעונים", NAVY, "invented"),
    "E3": ("מעדניית הצפון", "גבינות ונקניקים", IVORY, "invented"),
    "E4": ("מסעדת בלה", "ארוחות ביתיות", ROSE, "invented"),
    "E5": ("נעלי הפאר", "נעליים", BLACK, "invented"),
    "E6": ("פוטו אורה", "צילום", SKY, "invented"),
    "E7": ("פיינשטוק", "סדקית ואריגים", WINE, "search"),
    "E8": ("הגזוז של מנשה", "קיוסק", BUTTER, "invented"),
    "E9": ("מעדני וינר", "מעדנייה", GREEN, "invented"),
    "D0": ("אריגי כרמל", "אריגים", TEAL, "invented"),
    "D1": ("מכולת ברוך", "מזון ומצרכים", PEACH, "invented"),
    "D4": ("הכלב הנאמן", "צרכים לכלבים", BROWN, "invented"),
    "D5": ("ספריית דעת", "ספרים", PIST, "invented"),
    "D6": ("המטבח של חנה", "מסעדה עממית", BRICK, "invented"),
    "D7": ("סוכריות יפה", "ממתקים", ROSE, "invented"),
    "D8": ("נגריית האומן", "בית מלאכה", NAVY, "invented"),
    "D10": ("גלידת שלג", "גלידה וגזוז", SKY, "invented"),
    "C1": ("קיוסק התפוז", "גזוז ועיתונים", PEACH, "invented"),
    "C2": ("מאפיית צינה", "לחם וחלות", GREEN, "invented"),
    "C3": ("אריגי המשי", "אריגים", ROSE, "invented"),
    "C4": ("נעלי גולדברג", "נעליים", TEAL, "invented"),
    "C5": ("פוטו קרן", "צלם", BLACK, "invented"),
    "C6": ("מלאכת מחשבת", "בית מלאכה", PIST, "invented"),
    "C7": ("כובעי שרון", "כובעים", WINE, "invented"),
    "C8": ("ספרי תרבות", "ספרים וכלי כתיבה", BUTTER, "invented"),
    "D2": ("קיוסק האחים לוי", "גזוז וסיגריות", BUTTER, "invented"),
    "D9": ("מאפיית יהודה", "לחם ולחמניות", ROSE, "invented"),
    "C9": ("פרחי שושנה", "פרחים וצמחים", IVORY, "invented"),
}

# key: (hebrew, latin, background, letters, src), including names chosen for the reconstruction
BOARDS = {
    "eckmann":  ("כלבו אקמן", "ECKMANN", (236, 231, 215), (28, 26, 24), "wiki"),
    "amanut":   ("קפה אמנות", "", (104, 30, 28), (244, 226, 180), "wiki"),
    "flowers":  ("פרחי גילה", "", (23, 90, 83), (246, 226, 181), "invented"),
    "galor":    ("גל-אור", "GAL-OR", (26, 25, 24), (236, 230, 212), "photo"),
    "pharmacy": ("בית מרקחת", "PHARMACY", (22, 74, 58), (240, 234, 214), "photo"),
}
# which board hangs over which bay; a bay that is not here has none
SIGNS = {"B1": "eckmann", "B7": "amanut", "F5": "flowers", "A2": "galor", "D3": "pharmacy", **{bay: bay for bay in NAMED}}
WALL = (240, 237, 228)
CELL_H = 160                                              # 1024 x 160 = the board's own 6.4 : 1


def _cells():
    c = {}
    for i, k in enumerate(list(BOARDS) + list(NAMED)):    # two per row
        c[k] = ((i % 2) * 1024, (i // 2) * CELL_H, 1024, CELL_H)
    y = (len(BOARDS) + len(NAMED) + 1) // 2 * CELL_H
    c["aw_eck_en"] = (0, y, 512, 256)                    # lettering on awning cloth (postcard)
    c["aw_eck_he"] = (512, y, 512, 256)
    c["roof_pharmacy"] = (1024, y + 64, 1024, 128)       # letters on a parapet (kikar_norz)
    c["banner_bergner"] = (0, y + 256, 2048, 128)        # banner on Esther's balcony (postcard)
    return c


CELLS = _cells()


def uv(key):
    """(u0, v0, u1, v1) with v measured from the bottom, 1 px inside the cell."""
    x, y, w, h = CELLS[key]
    return ((x + 1) / ATLAS, 1 - (y + h - 1) / ATLAS_H, (x + w - 1) / ATLAS, 1 - (y + 1) / ATLAS_H)
