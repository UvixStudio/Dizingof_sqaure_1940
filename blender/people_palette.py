"""One small colour map for every figure (one material = one draw call per figure on the phone).
Shared by make_textures.py and people.py. Plain Python. Colours are interpretation (the photos are B&W)."""
COLORS = [
    ("skin_a", (226, 180, 148)), ("skin_b", (198, 146, 112)), ("hair_dark", (40, 28, 22)), ("hair_brown", (96, 62, 38)),
    ("hair_grey", (150, 144, 136)), ("white", (238, 235, 226)), ("cream", (222, 206, 170)), ("beige", (180, 158, 122)),
    ("khaki", (138, 124, 86)), ("grey", (128, 126, 122)), ("charcoal", (62, 60, 60)), ("navy", (36, 46, 74)),
    ("black", (24, 22, 22)), ("brown", (88, 58, 40)), ("maroon", (108, 34, 36)), ("green", (62, 96, 70)),
    ("blue", (80, 116, 150)), ("mustard", (188, 142, 56)), ("rose", (190, 118, 110)), ("sky", (160, 190, 206)),
    ("red", (160, 42, 34)), ("wood", (120, 82, 48)), ("metal", (92, 92, 96)),
]
INDEX = {name: i for i, (name, _) in enumerate(COLORS)}
