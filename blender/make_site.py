"""Generate blender/preview/site/ from facelift/: same UI, geometry replaced by the Blender GLB.
Run from anywhere:  python blender/make_site.py   (safe to re-run, facelift/ is only read)."""
import json, os, re, runpy, shutil, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "facelift")
PREVIEW = os.path.join(ROOT, "blender", "preview")
OUT = os.path.join(PREVIEW, "site")
os.makedirs(OUT, exist_ok=True)
os.makedirs(os.path.join(PREVIEW, "assets"), exist_ok=True)
for a in ("genia.jpg", "plan.jpg"):
    shutil.copy(os.path.join(ROOT, "assets", a), os.path.join(PREVIEW, "assets", a))
WEB = os.path.join(ROOT, "blender", "web")          # code that only this site has: cameras, smooth dragging, speed


def captions():
    """The subtitle file as [[from, to, text], ...] for web/captions.js."""
    srt = open(os.path.join(ROOT, "data", "dizengoff_opening_he_fixed.srt"), encoding="utf-8-sig").read()
    sec = lambda t: sum(float(x) * k for x, k in zip(t.replace(",", ".").split(":"), (3600, 60, 1)))
    out = []
    for block in srt.replace("\r", "").strip().split("\n\n"):
        lines = block.split("\n")
        start, end = (x.strip() for x in lines[1].split("-->"))
        out.append([sec(start), sec(end), " ".join(lines[2:]).strip()])
    return json.dumps(out, ensure_ascii=False)


def web(n):
    return open(os.path.join(WEB, n), encoding="utf-8").read()




def read(n):
    return open(os.path.join(SRC, n), encoding="utf-8").read()


def rep(s, old, new):
    assert old in s, "missing anchor: " + old
    return s.replace(old, new, 1)


def between(s, start, end, new):
    """Replace everything from the start anchor up to (not including) the end anchor."""
    a = s.index(start)
    b = s.index(end, a)
    return s[:a] + new + s[b:]


def css_grade(sepia=.16, sat=.92, contrast=1.03):
    """The CSS filter the canvas used to have, as one line of shader code."""
    a, v = 1 - sepia, sat
    S = [[.393 + .607 * a, .769 - .769 * a, .189 - .189 * a],
         [.349 - .349 * a, .686 + .314 * a, .168 - .168 * a],
         [.272 - .272 * a, .534 - .534 * a, .131 + .869 * a]]
    T = [[.213 + .787 * v, .715 - .715 * v, .072 - .072 * v],
         [.213 - .213 * v, .715 + .285 * v, .072 - .072 * v],
         [.213 - .213 * v, .715 - .715 * v, .072 + .928 * v]]
    m = [[contrast * sum(T[r][k] * S[k][c] for k in range(3)) for c in range(3)] for r in range(3)]
    cols = ",".join("%.5f" % m[r][c] for c in range(3) for r in range(3))          # GLSL matrices are column by column
    return "gl_FragColor.rgb = clamp(mat3(%s) * gl_FragColor.rgb + (%.5f), 0.0, 1.0);" % (cols, .5 - .5 * contrast)


GRADE = css_grade()
# the model as the site downloads it: smaller textures, tidier numbers, gzipped
SIZE = runpy.run_path(os.path.join(ROOT, "blender", "pack_web.py"))["pack"](
    os.path.join(PREVIEW, "kikar.glb"), os.path.join(PREVIEW, "kikar_web.glb.gz"))
STAMP = json.load(open(os.path.join(PREVIEW, "stamp.json")))["time"]
shutil.copy(os.path.join(SRC, "style.css"), os.path.join(OUT, "style.css"))
with open(os.path.join(OUT, "style.css"), "a", encoding="utf-8") as f:
    f.write(web("ui.css"))


html = read("index.html")
html = re.sub(r'\s*<button class="btn" id="export-glb">.*?</button>', "", html)
html = rep(html, '<script src="lib/three.min.js"></script>\n<script src="lib/GLTFExporter.js"></script>',
           '<script src="../lib/three.min.js"></script>\n<script src="../lib/GLTFLoader.js"></script>')
html = rep(html, '\n<script src="export.js"></script>', "")
a = html.index("      <li>הבלוקים, הרווחים")
b = html.index("      <li>נקודות המידע")
html = html[:a] + """      <li>גרסת עבודה: המודל נבנה בבלנדר לפי תצלומים מ־1938-1940 ועדיין בתהליך.</li>
      <li>צורות הבניינים וכיווני הרחובות מ־OpenStreetMap, © תורמי OpenStreetMap. הדגם כולל גם מבנים שהושלמו אחרי 1940, כמו מלון גזית (1948).</li>
      <li>קולנוע אסתר הותאם לתצלומים. החזיתות של שאר הבניינים, הצבעים והרכבים הם פרשנות.</li>
      <li>טבעות הגן, הכביש והמזרקה נמדדו מתצלומים, בדיוק משוער.</li>
      <li>שמות הבתים, שנותיהם והאדריכלים לפי ויקיפדיה. השיוך של בתי פלדמן, גרינמן ומירנברג לגוש מסוים בטבעת הוא השערה.</li>
      <li>שמות אקמן, קפה אמנות, בית מרקחת וגל-אור לקוחים מתצלומים ומוויקיפדיה. שלמן, ויטמן, פיינשטוק והספר הטוב היו עסקים בתל אביב, לא בהכרח בכיכר. שאר שמות החנויות הומצאו ברוח התקופה. חזיתות החנויות, מיקומן, צבעי הסככות והכרזה הגדולה הם שחזור.</li>
""" + html[b:]
html, n = re.subn(r'<section class="bar".*?</section>', lambda m: web("bar.html").strip(), html, flags=re.S)
assert n == 1, "control bar not found"
html = rep(html, 'href="style.css"', 'href="style.css?v=%d"' % int(time.time()))
# "about" moved into the round button of web/bar.html
html, n = re.subn(r'\s*<button class="pill" id="info-btn".*?</button>', "", html, count=1)
assert n == 1, "info button not found"
html = rep(html, "family=Assistant:wght@400;600;700", "family=Assistant:wght@400;600;700&family=Heebo:wght@400;500;700&family=Secular+One")
html = rep(html, "family=Frank+Ruhl+Libre:wght@500;700", "family=Frank+Ruhl+Libre:wght@500;700;900")
FA = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/"      # solid LinkedIn / WhatsApp marks in "about"
html = rep(html, "</head>", '<link rel="stylesheet" href="%sfontawesome.min.css">\n<link rel="stylesheet" href="%sbrands.min.css">\n</head>' % (FA, FA))
# the project's name: Zina Square, which is Dizengoff Square today
NAME = "כיכר צינה (דיזנגוף)"
html = rep(html, "<title>כיכר דיזנגוף 1940</title>", "<title>%s 1940</title>" % NAME)
html = rep(html, 'property="og:title" content="כיכר דיזנגוף 1940"', 'property="og:title" content="%s 1940"' % NAME)
html, n = re.subn("(שחזור תלת־ממדי מסוגנן של |סקיצה תלת־ממדית של )כיכר דיזנגוף", lambda m: m.group(1) + NAME, html)
assert n == 3, ("descriptions with the old name", n)
html = rep(html, ">כיכר צינה דיזנגוף<small>", ">%s<small>" % NAME)
html = rep(html, '<div dir="rtl">', '''<div dir="rtl">
  <div class="loading" id="loading" role="status">
    <div class="plate">כיכר צינה (דיזנגוף)<small>שחזור תלת־ממד 1940</small></div>
    <div class="load-track"><i id="load-bar"></i></div>
    <p><span id="load-text">טוענים את הכיכר</span> <span id="load-pct" dir="ltr">0%</span></p>
    <button class="pill" id="load-again" hidden>לנסות שוב</button>
  </div>''')
html = rep(html, "</head>", '<link rel="preload" as="fetch" crossorigin href="../kikar_web.glb.gz?t=%d">\n</head>' % STAMP)
# a new address on every build, so a browser never keeps running yesterday's scene.js
BUILD = int(time.time())
html = rep(html, 'src="scene.js"', 'src="scene.js?v=%d"' % BUILD)
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(html)

js = read("scene.js")
# cameras and input (replaces the four view buttons, the pointer code and the phone sensor code)
js = between(js, "// ---------- viewpoints and camera ----------", '$("info-btn")', web("controls.js"))
# street names: the serif, heavier. The plates are drawn on a canvas, so the weight (Hebrew and Latin) is asked for first
js = rep(js, 'x.font = "700 150px " + SERIF; x.fillText(name, 384, 140);', 'x.font = "900 152px " + SERIF; x.fillText(name, 384, 140);')
js = rep(js, 'x.font = "600 76px " + SERIF; x.fillText(en, 384, 292);', 'x.font = "900 74px " + SERIF; x.fillText(en, 384, 292);')
js = rep(js, "document.fonts.load('700 100px \"Frank Ruhl Libre\"').then(go)",
         "Promise.all([700, 900].map((w) => document.fonts.load(w + ' 100px \"Frank Ruhl Libre\"', 'אבA'))).then(go)")
# every point of interest: one small solid pin badge, no outline and no pulsing ring
js = between(js, "const markerTex = (icon)", "const ringTex", """const markerTex = () => canvasIcon((x) => {
    x.fillStyle = "#4a3425"; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill();
    x.fillStyle = "#f4ead0"; x.beginPath(); x.moveTo(64, 108); x.bezierCurveTo(46, 89, 35, 71, 35, 52); x.arc(64, 52, 29, Math.PI, 0); x.bezierCurveTo(93, 71, 82, 89, 64, 108); x.fill();
    x.fillStyle = "#4a3425"; x.beginPath(); x.arc(64, 52, 11, 0, 7); x.fill();
  });
  """)
js = rep(js, "s = clamp(d * .05, 1.8, 9)", "s = clamp(d * .036, .45, 6)")          # the same small size near or far
js = rep(js, "h.sp.scale.set(s, s, 1);", "h.sp.scale.set(s, s, 1); h.ring.visible = false; h.sp.visible = !(h.aside && d < 5);")
# the close button carries a drawn cross, not a text character
js = rep(js, 'aria-label="סגירה">✕</button>', 'aria-label="סגירה"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>')
js = between(js, '$("info-btn").addEventListener', "  // ---------- hotspots", '$("info-btn").addEventListener("click", () => openAbout());\n\n')
# the bar has no handle any more: it only steps aside for a card
js = between(js, 'const barEl = document.querySelector(".bar")', "function closeCard()",
             'const barEl = document.querySelector(".bar");\n  const setBar = (min) => { barEl.classList.toggle("min", min); closeMenus(); };\n  ')
js = rep(js, "() => flyTo(hotspots.find((h) => h.key === b.dataset.spot))",
         "() => { const h = hotspots.find((x) => x.key === b.dataset.spot); if (h) flyTo(h); }")
X = 'aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>`;'
js = rep(js, X, X[:-2] + '<div class="scroll">`;')
js = rep(js, "card.innerHTML = html; card.scrollTop = 0;", 'card.innerHTML = html + "</div>";')
# a card may carry its own extra block (the cinema: posters and a film list)
js = rep(js, "c.body.forEach((t) => { html += `<p>${esc(t)}</p>`; });", "c.body.forEach((t) => { html += `<p>${esc(t)}</p>`; });\n    html += c.extra || \"\";")
# the dots under the signs: solid, half see-through blue discs (web/ground.js makes them blink like radar points)
js = between(js, "const padTex = (() => {", "function addSign", """const padTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d");
    x.fillStyle = "#ffffff"; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); return new THREE.CanvasTexture(c); })();
  """)
js = rep(js, "new THREE.MeshBasicMaterial({ map: padTex, transparent: true,", "new THREE.MeshBasicMaterial({ map: padTex, color: 0xfff1d6, opacity: .95, transparent: true,")
for a, b in (("rgba(29,42,90,.85)", "rgba(250,240,216,.95)"), ("rgba(29,42,90,.4)", "rgba(250,240,216,.6)"), ("rgba(29,42,90,0)", "rgba(250,240,216,.3)")):
    js = rep(js, a, b)
js = rep(js, "new THREE.PlaneGeometry(.1, SIGN_Y - SIGN_H / 2)", "new THREE.PlaneGeometry(.045, SIGN_Y - SIGN_H / 2)")
js = rep(js, "new THREE.PlaneGeometry(2.6, 2.6)", "new THREE.PlaneGeometry(.62, .62)")
# building names float over their building: no line, no dot
js = rep(js, "sg.userData.stem.rotation.y = sg.rotation.y;", "if (sg.userData.stem) sg.userData.stem.rotation.y = sg.rotation.y;")
# a tap that hits no point of interest walks there (web/walk.js); a walk ends without opening a card
js = rep(js, "if (best) flyTo(best);", "if (best) flyTo(best); else walkTo(x, y);")
js = rep(js, "if (u >= 1) { const h = flight.h; flight = null; openCard(h); }",
         "if (flight.arc) rig.position.y += flight.arc * Math.sin(Math.PI * e);\n      if (u >= 1) { const h = flight.h; flight = null; if (h) openCard(h); }")
# the site opens (and the title returns) on the roof, like the archive photographs
js = rep(js, 'gyroOff(); setView("in"); };', 'gyroOff(); setView("roof"); };')
js = rep(js, 'grain(); resize(); setView("in");', 'grain(); resize(); setView("roof");')
js = rep(js, 'cam.mode = "fp"; rig.rotation.set(0, 0, 0); look.yaw = from.yaw;', 'stopMotion(); cam.mode = "fp"; rig.rotation.set(0, 0, 0); look.yaw = from.yaw;')
js = rep(js, 'if (cam.mode === "orbit") applyOrbit(); else if (gyro.on && gyro.e) applyGyro(); else camera.rotation.set(look.pitch, look.yaw, 0);',
         'updateCamera(dt);')
# frame pacing: cars move inside the same frame that draws them, and slow devices draw fewer pixels
js = rep(js, "const dt = Math.min(.05, (now - last) / 1000); last = now;",
         "const ms = now - last, dt = clamp(ms / 1000, 0, .1); last = now; adapt(ms, now); moveTraffic(now, dt); clearView();")
js = rep(js, "// ---------- renderer ----------", web("perf.js") + "// ---------- renderer ----------")
js = rep(js, "new THREE.WebGLRenderer({ canvas, antialias: true });", "new THREE.WebGLRenderer({ canvas, antialias: smoothing });")
js = rep(js, "renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));",
         'renderer.setPixelRatio(ratio);\n  THREE.ShaderChunk.fog_fragment += "\\n' + GRADE + '";   // colour grade, once per pixel inside the shaders')
# Genia sits on her own bench in the model (island.py, bearing 34): the camera comes close and leaves her left of the card
js = between(js, "  { // Genia on the south bench", "  { // a film camera", """  const GENIA_AT = P(25.25, D(34), 0);
  addHotspot("genia", "person", P(25.1, D(34), 2.12), P(23.45, D(29.1), 1.62), P(25.05, D(34), 0.94));   // from her side, a little above
  hotspots[hotspots.length - 1].aside = true;
  function clearView() {                                  // nobody strolls between her and whoever is reading about her
    const close = rig.position.distanceTo(GENIA_AT) < 4.6;
    movers.forEach((m) => { m.o.visible = m.o.name === "idle_genia" || !close || m.o.position.distanceTo(GENIA_AT) > 4.4; });
  }
""")
js = rep(js, "to: { pos: h.cam.pos, yaw: from.yaw + dy, pitch: h.cam.pitch, fov: 58 }",
         "to: { pos: h.cam.pos, yaw: from.yaw + dy - asideYaw(h), pitch: h.cam.pitch, fov: 58 }")
js = rep(js, "  function flyTo(h) {", """  function asideYaw(h) {                                 // on a wide screen the card covers the right side
    if (!h.aside || innerWidth < 800 || innerHeight < 560) return 0;
    const covered = (Math.min(576, innerWidth * .46) + 22) / innerWidth;
    return Math.atan(covered * Math.tan(29 * Math.PI / 180) * innerWidth / innerHeight);
  }
  function flyTo(h) {""")
# the dedication film plays with our Hebrew captions (web/captions.js)
js = rep(js, 'if (v) v.addEventListener("click", () => { ', 'if (v) v.addEventListener("click", () => { if (c.captions) { playWithCaptions(v, c); return; } ')
# video cards: each names its own film, and an old 4:3 film gets a 4:3 frame
js = rep(js, 'aria-label="נגן את הפתיח" style="background-image:url(https://img.youtube.com/vi/${c.video}/hqdefault.jpg)',
         'aria-label="נגן את הסרטון" style="aspect-ratio:${c.ratio || \'16 / 9\'};background-image:url(https://img.youtube.com/vi/${c.video}/hqdefault.jpg)')
js = rep(js, 'title="Here We Are, הפתיח"', 'title="${esc(c.title)}" style="aspect-ratio:${c.ratio || \'16 / 9\'}"')
# street signs: real bearings from OSM (clockwise from north)
js = rep(js, "  const signs = [];\n", """  [["דיזנגוף", "DIZENGOFF", 348], ["ריינס", "REINES", 43], ["זמנהוף", "ZAMENHOF", 98],
   ["דיזנגוף", "DIZENGOFF", 168], ["פינסקר", "PINSKER", 225], ["בן עמי", "BEN AMI", 299]]
    .forEach(([name, en, deg], k) => Object.assign(ARMS[k], { name, en, t: D(deg) }));
  const signs = [];
""")
js = rep(js, "    signs.push(s);\n", "    dotM.userData.keep = true; dotM.userData.pad = true;\n    signs.push(s);\n")
js = rep(js, "g.add(gl);\n", "g.add(gl); scene.attach(gl); gl.userData.keep = true;\n")
i = js.rindex("requestAnimationFrame(frame);")
js = js[:i] + web("load.js") + """// ---------- replace the procedural geometry with the Blender model ----------
  const POOL_R = 8.4, WATER_Z = 0.17;                   // calibrated, see data/research_notes.md
  water.geometry.dispose(); water.geometry = new THREE.CircleGeometry(POOL_R - .05, 80).rotateX(-Math.PI / 2); water.position.y = WATER_Z;
  waterMat.vertexShader = "varying vec3 vP; varying vec3 vW; void main(){ vP = position; vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }";
  waterMat.fragmentShader = `precision mediump float; uniform float uT; varying vec3 vP; varying vec3 vW;
    void main(){
      vec2 p = vP.xz; float r = length(p);
      float a = sin(dot(p, vec2(2.1,1.3)) + uT*1.7), b = sin(dot(p, vec2(-1.4,2.6)) - uT*2.2), c = sin(dot(p, vec2(3.7,-2.9)) + uT*3.1);
      float ring = sin(r*5.0 - uT*5.0) * exp(-abs(r-4.3)*.7) + sin(r*7.0 - uT*6.0) * exp(-r*.55);
      vec3 n = normalize(vec3((a + .6*c)*.06 + p.x/max(r,.1)*ring*.12, 1.0, (b + .6*c)*.06 + p.y/max(r,.1)*ring*.12));
      vec3 v = normalize(cameraPosition - vW);
      float f = .06 + .94*pow(1.0 - max(dot(n, v), 0.0), 4.0);
      vec3 col = mix(vec3(.13,.23,.23), vec3(.66,.76,.84), clamp(f + .12, 0.0, 1.0));
      vec3 h = normalize(v + normalize(vec3(-.82,.5,.3)));
      col += pow(max(dot(n, h), 0.0), 140.0) * .9;
      float foam = smoothstep(1.7, .2, r) + .45*exp(-pow((r-4.3)*2.2, 2.0)) + .25*exp(-pow((r-5.1)*3.0, 2.0));
      col = mix(col, vec3(.90,.93,.94), clamp(foam*(.75 + .25*c), 0.0, 1.0));
      col *= mix(.78, 1.0, smoothstep(8.4, 7.2, r));
      gl_FragColor = vec4(col, 1.0);
      __GRADE__
    }`;
  waterMat.needsUpdate = true;
  // fountain as in MAT-22292: tall central column, an umbrella of streams, thin jets from the rim inward
  const drops = [];
  const addDrops = (count, make) => { for (let i = 0; i < count; i++) drops.push(make(i)); };
  addDrops(2600, () => { const v = 10.0 + Math.random() * 2.6; return { a: Math.random() * 6.283, r0: Math.random() * .32, vr: Math.random() * .30, vy: v, T: 2 * v / 9.8, o: Math.random() }; });
  addDrops(900, (i) => ({ a: (i % 18) / 18 * 6.283 + Math.random() * .025, r0: .35, vr: 2.35 + Math.random() * .15, vy: 8.15, T: 1.66, o: Math.random() }));
  addDrops(880, (i) => ({ a: (i % 22) / 22 * 6.283 + .14 + Math.random() * .008, r0: POOL_R - .15, vr: -3.3 + Math.random() * .06, vy: 4.75, T: .97, o: Math.random() }));
  const dPos = new Float32Array(drops.length * 3), dGeo = new THREE.BufferGeometry();
  dGeo.setAttribute("position", new THREE.BufferAttribute(dPos, 3));
  const fountain = new THREE.Points(dGeo, new THREE.PointsMaterial({ color: 0xffffff, size: .27, map: new THREE.CanvasTexture(dot), transparent: true, opacity: .78, depthWrite: false }));
  fountain.frustumCulled = false; scene.add(fountain);
  const spray = (now) => {
    const t = reduce ? 0 : now / 1000;
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i], u = ((t / d.T + d.o) % 1) * d.T, r = d.r0 + d.vr * u;
      dPos[i * 3] = Math.cos(d.a) * r; dPos[i * 3 + 1] = WATER_Z + Math.max(0, d.vy * u - 4.9 * u * u); dPos[i * 3 + 2] = Math.sin(d.a) * r;
    }
    dGeo.attributes.position.needsUpdate = true;
    if (!reduce) requestAnimationFrame(spray);
  };
  spray(0);
  const keep = new Set([rig, sky, sun.target, water, fountain]);
  signs.forEach((s) => { keep.add(s); keep.add(s.userData.stem); });
  hotspots.forEach((h) => { keep.add(h.sp); keep.add(h.ring); });
  scene.children.slice().forEach((o) => { if (!keep.has(o) && !o.isLight && !o.userData.keep) scene.remove(o); });
  sun.color.set(0xffedd2);
  scene.children.filter((o) => o.isHemisphereLight).forEach((h) => { h.color.set(0xeaf2fb); h.groundColor.set(0xb4b0a6); h.intensity = .56; });
  sun.position.set(-80, 53, 29);                      // bearing 250, 32 degrees, as in Blender
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70 }); sun.shadow.camera.updateProjectionMatrix();
  sun.intensity = .88; sun.shadow.bias = -.0004; sun.shadow.normalBias = .35; sun.shadow.radius = 3;
  async function loadModel(t) {
    let buf;
    try { buf = await modelBytes(t); } catch (e) { loadFailed(e); return; }
    progress(.93, "מרכיבים את הכיכר"); await painted();
    new THREE.GLTFLoader().parse(buf, "../", (g) => {
      const old = scene.getObjectByName("blender");
      if (old) { scene.remove(old); old.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } }); }
      g.scene.name = "blender";
      const done = new Set();
      g.scene.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = o.receiveShadow = true;
        const m = o.material;
        if (m.alphaTest > 0 || m.transparent) o.castShadow = false;            // every mesh that uses a cut-out, not only the first
        if (done.has(m)) return;
        done.add(m);
        if (m.alphaTest > 0) m.side = THREE.DoubleSide;
        if (m.name.indexOf("leafcard") === 0) m.onBeforeCompile = (sh) => {      // both faces lit like the round crown
          sh.fragmentShader = sh.fragmentShader.replace("#include <normal_fragment_begin>", "vec3 normal = normalize(vNormal); vec3 geometryNormal = normal;");
        };
        if (m.map) { m.map.encoding = THREE.LinearEncoding; m.map.anisotropy = 8; m.map.needsUpdate = true; }   // renderer writes values directly
        else m.color.convertLinearToSRGB();
      });
      scene.add(g.scene);
      collect(g.scene);
      obstacles(g.scene);
      signposts(g.scene);
      merge(g.scene);
      shadows(g.scene);
      paint(g.scene);
      nightReady(g.scene);
      introReady(g.scene);
      walkingFigures(t);
      reveal();
    }, loadFailed);
  }
  // ---------- building labels (cream plates, so they are not mistaken for street names) + Esther card ----------
  const LABELS = { B: ["קולנוע כיכר דיזנגוף", "לימים קולנוע אסתר"], D: ["בתי פלדמן וגרינמן", "לילנפלד וביז'ונסקי · 1935-36"],
                   F: ["בית מירנברג", "תכנון: ג'ניה אוורבוך · 1936"] };
  const labelTex = (name, sub) => canvasTex(896, 320, (x) => {
    rr(x, 6, 6, 884, 308, 34); x.fillStyle = "rgba(244,234,208,.93)"; x.fill();
    x.strokeStyle = "#9a7b3f"; x.lineWidth = 7; rr(x, 22, 22, 852, 276, 24); x.stroke();
    x.fillStyle = "#3d2a1c"; x.font = "700 118px " + SERIF; x.fillText(name, 448, 128, 810);
    x.font = "500 58px " + SERIF; x.fillText(sub, 448, 238, 810);
  });
  CARDS.esther = {
    title: "קולנוע כיכר דיזנגוף", by: "לימים קולנוע אסתר", sub: "נבנה ב־1938 עד 1939",
    body: [
      "את הבניין תכננו האדריכל יהודה מגידוביץ' ובנו, המהנדס רפאל מגידו, עבור אסתר ומשה נתנאל. הוא עומד על עמודים ובחזית קעורה עם מרפסות סרט.",
      "שבוע הפתיחה התחיל ב־30 במרץ 1939, והסרט הראשון היה שלגיה ושבעת הגמדים. באולם היו כ־1,000 מקומות, והוא תואר כראשון בארץ עם מיזוג אוויר מרכזי.",
      "בבניין פעלו קפה אמנות עם רחבת ריקודים, וחנות הכלבו אקמן. ב־1998 הוסב הבניין למלון.",
      "הכרזה הגדולה על הקיר היא עיצוב של הסקיצה הזו, לא הכרזה המקורית. הכרזה על המרפסת עם שמה של אליזבת ברגנר מופיעה בגלויה מהתקופה."
    ],
    credit: "מקור: ויקיפדיה העברית, קולנוע אסתר.",
    links: [{ t: "ויקיפדיה: קולנוע אסתר", u: "https://he.wikipedia.org/wiki/%D7%A7%D7%95%D7%9C%D7%A0%D7%95%D7%A2_%D7%90%D7%A1%D7%AA%D7%A8" }]
  };
  (async function labels() {
    let list = [];
    try { list = await (await fetch("labels.json?t=" + Date.now(), { cache: "no-store" })).json(); } catch (e) { return; }
    list.forEach((b) => {
      const y = b.top + 3.6, W = 6.4, H = 2.29, x = b.x, z = -b.y;
      const s = new THREE.Group(); s.position.set(x - b.nx * 6, y, z + b.ny * 6); scene.add(s); s.userData.keep = true;   // over the middle of the block
      const m = new THREE.MeshBasicMaterial({ map: labelTex(...LABELS[b.key]), transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false });
      s.userData.m = m; s.add(new THREE.Mesh(new THREE.PlaneGeometry(W, H), m));
      signs.push(s);
      if (b.key === "B") {
        const out = new THREE.Vector3(b.nx, 0, -b.ny), at = new THREE.Vector3(x, 5.6, z).addScaledVector(out, 1.4);
        const tower = new THREE.Vector3(49.5, 0, -4.9);                  // the wall with the name sign and the poster
        addHotspot("esther", "person", at, tower.clone().addScaledVector(out, 25).setY(9), tower.clone().setY(10.2));
        hotspots[hotspots.length - 1].aside = true;
      }
    });
  })();
  // ---------- traffic and people circle the square (object names come from Blender) ----------
  let movers = [];
  const UP = new THREE.Vector3(0, 1, 0), turn = new THREE.Quaternion();
  function collect(root) {
    movers = [];
    root.children.forEach((o) => {
      const p = o.position, r = Math.hypot(p.x, p.z), n = o.name;
      let w = 0, bob = 0;                                   // w = angular speed; one value per lane, so gaps never close
      if (n.startsWith("car_") && r > 37 && r < 44) w = r < 40 ? 6.5 / 38.4 : r < 42.8 ? 7.5 / 41.2 : 1.5 / 43.35;
      else if (n.startsWith("walk_a")) { w = 1.0 / 17.5; bob = 1; }
      else if (n.startsWith("walk_b")) { w = 1.1 / 21.7; bob = 1; }
      else if (n.startsWith("walk_c")) { w = 0.95 / 23.4; bob = 1; }
      else if (n.startsWith("pram_")) w = 0.75 / 18.9;
      else if (n.startsWith("kidbike_")) w = 2.3 / 20.3;
      else if (n.startsWith("cycle_")) w = 3.6 / 36.7;
      if (!w && !n.startsWith("idle_")) return;
      const nose = new THREE.Vector3(1, 0, 0).applyQuaternion(o.quaternion);          // Blender forward is +X
      const sign = Math.sign(nose.x * p.z - nose.z * p.x) || 1;                        // drive nose first
      movers.push({ o, w: w * sign, y: p.y, bob, ph: Math.random() * 6 });
    });
  }
  // one draw call per material for everything that stands still (phones choke on hundreds of calls)
  function merge(root) {
    root.updateMatrixWorld(true);
    const moving = new Set();
    movers.forEach((m) => m.o.traverse((c) => moving.add(c)));
    const groups = new Map();
    root.traverse((o) => {
      if (!o.isMesh || moving.has(o) || o.children.length) return;
      const g = o.geometry;
      if (!g.attributes.normal) return;
      const key = o.material.uuid + (o.castShadow ? "s" : "") + (g.attributes.uv ? "u" : "");
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(o);
    });
    const v = new THREE.Vector3(), nm = new THREE.Matrix3();
    groups.forEach((list) => {
      if (list.length < 2) return;
      let nv = 0, ni = 0;
      list.forEach((o) => { const g = o.geometry; nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; });
      const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), index = new Uint32Array(ni);
      const uv = list[0].geometry.attributes.uv ? new Float32Array(nv * 2) : null;
      let av = 0, ai = 0;
      list.forEach((o) => {
        const g = o.geometry, p = g.attributes.position, n = g.attributes.normal, t = g.attributes.uv;
        nm.getNormalMatrix(o.matrixWorld);
        for (let i = 0; i < p.count; i++) {
          v.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(o.matrixWorld); v.toArray(pos, (av + i) * 3);
          v.set(n.getX(i), n.getY(i), n.getZ(i)).applyMatrix3(nm).normalize(); v.toArray(nor, (av + i) * 3);
          if (uv) { uv[(av + i) * 2] = t.getX(i); uv[(av + i) * 2 + 1] = t.getY(i); }
        }
        const c = g.index ? g.index.count : p.count;
        for (let i = 0; i < c; i++) index[ai + i] = av + (g.index ? g.index.getX(i) : i);
        av += p.count; ai += c;
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
      if (uv) geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      geo.setIndex(new THREE.BufferAttribute(index, 1));
      const one = new THREE.Mesh(geo, list[0].material);
      one.castShadow = list[0].castShadow; one.receiveShadow = true;
      list.forEach((o) => o.parent.remove(o));
      root.add(one);
    });
  }
  camera.near = Number((location.search.match(/[?&]near=([0-9.]+)/) || [])[1]) || .4; camera.updateProjectionMatrix();   // ?near=3 : more depth precision, to compare
  window.__kikar.renderer = renderer; window.__kikar.camera = camera;      // for checking the load from the console
  function moveTraffic(now, dt) {
    if (reduce && cam.mode !== "ride") return;            // a ride was asked for, so it drives even with reduced motion
    movers.forEach((m) => {
      m.o.position.applyAxisAngle(UP, m.w * dt);
      m.o.quaternion.premultiply(turn.setFromAxisAngle(UP, m.w * dt));
      if (m.bob) m.o.position.y = m.y + Math.abs(Math.sin(now / 160 + m.ph)) * .035;
      if (m.poses) stepWalker(m, dt);
      if (m.idle) stepIdle(m, dt);
    });
    placeShadows();
  }
  const BUILD = __BUILD__;
  setInterval(async () => {
    try {
      const v = await (await fetch("build.json?t=" + Date.now(), { cache: "no-store" })).json();
      if (v.build > BUILD) location.replace("index.html?v=" + v.build);
    } catch (e) { /* hosted copy or offline: keep what is loaded */ }
  }, 5000);
  let stamp = __STAMP__;
  loadModel(stamp);                                   // at once, the check below is only for rebuilds
  (async function poll() {
    try {
      const s = await (await fetch("../stamp.json?t=" + Date.now(), { cache: "no-store" })).json();
      if (s.time !== stamp) { stamp = s.time; loadModel(stamp); }
    } catch (e) { /* nothing published yet */ }
    setTimeout(poll, 4000);
  })();
  """.replace("__GRADE__", GRADE) + web("shadows.js") + web("people_walk.js") + web("paint.js") + web("walk.js") + web("ground.js") + web("signposts.js") + web("opening.js") + web("zina.js") + web("levels.js") + web("cards_en.js") + web("genia.js") + web("captions.js").replace("__CAPTIONS__", captions()) + web("cinema.js") + web("about.js") + web("share.js") + web("night.js") + web("intro.js") + web("tour.js") + web("sound.js") + js[i:]
# the opening (web/intro.js) moves the camera before it is applied, and hides what has not appeared just before drawing
js = rep(js, "    updateCamera(dt);\n", "    introFrame(now);\n    updateCamera(dt);\n")
js = rep(js, "    renderer.render(scene, camera);\n    requestAnimationFrame(frame);", "    introShow();\n    carLights();\n    renderer.render(scene, camera);\n    requestAnimationFrame(frame);")
# two languages (web/lang.js): it has to exist before anything is painted
js = rep(js, "  const $ = (id) => document.getElementById(id);\n", "  const $ = (id) => document.getElementById(id);\n" + web("lang.js"))
js = rep(js, 'x.direction = "rtl";', 'x.direction = LANG_EN ? "ltr" : "rtl";')
js = rep(js, "map: groundTex(a.name),", "map: groundTex(tr(a.name)),")
js = rep(js, "labelTex(...LABELS[b.key])", "labelTex(...LABELS[b.key].map(tr))")
# sky: panorama made from the same HDRI as in Blender (sky.py writes sky.jpg and sky.json)
haze = json.load(open(os.path.join(OUT, "sky.json")))["haze"]
js = rep(js, "const HAZE = 0xe6e2d3;", "const HAZE = %s;" % haze)
a = js.index("  // ---------- sky: watercolour dome")
b = js.index("  // ---------- canvas textures")
js = js[:a] + """  // ---------- sky: HDRI panorama, texture column = compass bearing / 360 ----------
  const sky = new THREE.Group(); scene.add(sky);
  {
    const sg = new THREE.SphereGeometry(480, 64, 40), uv = sg.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setX(i, .75 - uv.getX(i));
    const mat = new THREE.MeshBasicMaterial({ color: HAZE, side: THREE.BackSide, fog: false, depthWrite: false, toneMapped: false });
    new THREE.TextureLoader().load("sky.jpg", (t) => {
      t.wrapS = THREE.RepeatWrapping; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false;
      mat.map = t; mat.color.set(0xffffff); mat.needsUpdate = true;
    });
    const dome = new THREE.Mesh(sg, mat);
    dome.renderOrder = -10; sky.add(dome);
  }

""" + js[b:]
for key, value in (("__PACKED__", SIZE["packed"]), ("__PLAIN__", SIZE["plain"]), ("__STAMP__", STAMP)):
    js = js.replace(key, str(value))
open(os.path.join(OUT, "scene.js"), "w", encoding="utf-8").write(rep(js, "__BUILD__", str(BUILD)))
with open(os.path.join(OUT, "build.json"), "w") as f:        # written last: scene.js is already complete
    json.dump({"build": BUILD}, f)
print("site written to", OUT)
