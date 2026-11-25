"""Generate blender/preview/site/ from facelift/: same UI, geometry replaced by the Blender GLB.
Run from anywhere:  python blender/make_site.py   (safe to re-run, facelift/ is only read)."""
import os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "facelift")
PREVIEW = os.path.join(ROOT, "blender", "preview")
OUT = os.path.join(PREVIEW, "site")
os.makedirs(OUT, exist_ok=True)
os.makedirs(os.path.join(PREVIEW, "assets"), exist_ok=True)
for a in ("genia.jpg", "plan.jpg"):
    shutil.copy(os.path.join(ROOT, "assets", a), os.path.join(PREVIEW, "assets", a))
shutil.copy(os.path.join(SRC, "style.css"), os.path.join(OUT, "style.css"))


def read(n):
    return open(os.path.join(SRC, n), encoding="utf-8").read()


def rep(s, old, new):
    assert old in s, "missing anchor: " + old
    return s.replace(old, new, 1)


html = read("index.html")
html = re.sub(r'\s*<button class="btn" id="export-glb">.*?</button>', "", html)
html = rep(html, '<script src="lib/three.min.js"></script>\n<script src="lib/GLTFExporter.js"></script>',
           '<script src="../lib/three.min.js"></script>\n<script src="../lib/GLTFLoader.js"></script>')
html = rep(html, '\n<script src="export.js"></script>', "")
a = html.index("      <li>הבלוקים, הרווחים")
b = html.index("      <li>נקודות המידע")
html = html[:a] + """      <li>גרסת עבודה: המודל נבנה בבלנדר לפי תצלומים מ־1938-1940 ועדיין בתהליך.</li>
      <li>צורות הבניינים וכיווני הרחובות מ־OpenStreetMap, © תורמי OpenStreetMap. טרם אומת אילו מהבניינים עמדו ב־1940.</li>
      <li>קולנוע אסתר הותאם לתצלומים. החזיתות של שאר הבניינים, הצבעים והרכבים הם פרשנות.</li>
      <li>טבעות הגן, הכביש והמזרקה נמדדו מתצלומים, בדיוק משוער.</li>
""" + html[b:]
open(os.path.join(OUT, "index.html"), "w", encoding="utf-8").write(html)

js = read("scene.js")
# street signs: real bearings from OSM (clockwise from north)
js = rep(js, "  const signs = [];\n", """  [["דיזנגוף", "DIZENGOFF", 348], ["ריינס", "REINES", 43], ["זמנהוף", "ZAMENHOF", 98],
   ["דיזנגוף", "DIZENGOFF", 168], ["פינסקר", "PINSKER", 225], ["בן עמי", "BEN AMI", 299]]
    .forEach(([name, en, deg], k) => Object.assign(ARMS[k], { name, en, t: D(deg) }));
  const signs = [];
""")
js = rep(js, "    signs.push(s);\n", "    dotM.userData.keep = true;\n    signs.push(s);\n")
js = rep(js, "g.add(gl);\n", "g.add(gl); scene.attach(gl); gl.userData.keep = true;\n")
i = js.rindex("requestAnimationFrame(frame);")
js = js[:i] + """// ---------- replace the procedural geometry with the Blender model ----------
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
  sun.color.set(0xfffaf2);
  scene.children.filter((o) => o.isHemisphereLight).forEach((h) => { h.color.set(0xdfeaf6); h.groundColor.set(0x8f8e88); });
  sun.position.set(-81, 50, 30);                      // bearing 250, 30 degrees, as in Blender
  sun.intensity = .72; sun.shadow.bias = -.0004; sun.shadow.normalBias = .6;
  function loadModel(t) {
    new THREE.GLTFLoader().load("../kikar.glb?t=" + t, (g) => {
      const old = scene.getObjectByName("blender");
      if (old) { scene.remove(old); old.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } }); }
      g.scene.name = "blender";
      const done = new Set();
      g.scene.traverse((o) => {
        if (!o.isMesh) return;
        o.castShadow = o.receiveShadow = true;
        const m = o.material;
        if (done.has(m)) return;
        done.add(m);
        if (m.alphaTest > 0) { m.side = THREE.DoubleSide; o.castShadow = false; }
        if (m.map) { m.map.encoding = THREE.LinearEncoding; m.map.anisotropy = 8; m.map.needsUpdate = true; }   // renderer writes values directly
        else m.color.convertLinearToSRGB();
      });
      scene.add(g.scene);
    });
  }
  let stamp = null;
  (async function poll() {
    try {
      const s = await (await fetch("../stamp.json?t=" + Date.now(), { cache: "no-store" })).json();
      if (s.time !== stamp) { stamp = s.time; loadModel(stamp); }
    } catch (e) { /* nothing published yet */ }
    setTimeout(poll, 4000);
  })();
  """ + js[i:]
open(os.path.join(OUT, "scene.js"), "w", encoding="utf-8").write(js)
print("site written to", OUT)
