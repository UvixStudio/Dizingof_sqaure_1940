(() => {
  const $ = (id) => document.getElementById(id);
  const D = THREE.MathUtils.degToRad;

  // ---------- palette (watercolour washes) ----------
  const C = {
    paper: 0xefe6d2, ink: 0x2b2925, sand: 0xd8c7a0, bed: 0xb9a285,
    asphalt: 0xa7a296, walk: 0xd9cfbb, stone: 0xddd3bd,
    lawn: 0xa9bd8a, lawnDark: 0x81a06a, hedge: 0x6f8a59,
    water: 0x9fc4b8, plaster: [0xf3eee3, 0xece4d3, 0xf0e8dc, 0xe8e2d6], shade: 0xd8cdb8,
    awning: [0xc9a98b, 0xb9c2b0, 0xd1b48e], cinema: 0xe9dfc9,
    city: [0xece6d9, 0xe6dfd0, 0xefe9de, 0xe2dccd]
  };

  // ---------- renderer ----------
  const canvas = $("gl");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const HAZE = 0xe6e2d3;
  renderer.setClearColor(HAZE, 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(HAZE, 110, 300);
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 600);
  camera.rotation.order = "YXZ";
  const rig = new THREE.Group(); rig.rotation.order = "YXZ"; rig.add(camera); scene.add(rig);
  scene.add(new THREE.HemisphereLight(0xfffaf0, 0xb8b2a2, 0.85));
  const sun = new THREE.DirectionalLight(0xffffff, 0.45); sun.position.set(-60, 90, 40); scene.add(sun);

  // ---------- helpers ----------
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const P = (r, t, y) => new THREE.Vector3(r * Math.sin(t), y, -r * Math.cos(t));   // t: clockwise from north, -z = north
  const inkA = new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: .8, fog: true });
  const inkB = new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: .35, fog: true });
  const inkC = new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: .45, fog: true });
  const matCache = {};
  const fill = (c) => matCache[c] || (matCache[c] = new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide }));

  // pen strokes: exact edges plus a second, slightly wandering pass that overshoots the corners
  function strokes(geo, parent, { thresh = 25, sketchy = true, mat = inkA } = {}) {
    const eg = new THREE.EdgesGeometry(geo, thresh);
    parent.add(new THREE.LineSegments(eg, mat));
    if (!sketchy) return;
    const a = eg.attributes.position.array, out = new Float32Array(a.length);
    for (let i = 0; i < a.length; i += 6) {
      const ax = a[i], ay = a[i + 1], az = a[i + 2], bx = a[i + 3], by = a[i + 4], bz = a[i + 5];
      const dx = bx - ax, dy = by - ay, dz = bz - az, len = Math.hypot(dx, dy, dz) || 1, ext = Math.min(.6, len * .04) / len;
      const j = () => (rnd() - .5) * Math.min(.12, len * .02);
      out[i] = ax - dx * ext + j(); out[i + 1] = ay - dy * ext + j(); out[i + 2] = az - dz * ext + j();
      out[i + 3] = bx + dx * ext + j(); out[i + 4] = by + dy * ext + j(); out[i + 5] = bz + dz * ext + j();
    }
    const g2 = new THREE.BufferGeometry(); g2.setAttribute("position", new THREE.BufferAttribute(out, 3));
    parent.add(new THREE.LineSegments(g2, inkB));
  }
  function mesh(geo, color, parent = scene, opts) {
    const m = new THREE.Mesh(geo, fill(color)); parent.add(m); strokes(geo, m, opts); return m;
  }
  // curved block between two angles: r1 = facade facing the square
  function sectorGeo(r1, r2, t0, t1, y0, y1, N = 40) {
    const v = [];
    const quad = (a, b, c, d) => v.push(...a.toArray(), ...b.toArray(), ...c.toArray(), ...a.toArray(), ...c.toArray(), ...d.toArray());
    for (let i = 0; i < N; i++) {
      const ta = t0 + (t1 - t0) * i / N, tb = t0 + (t1 - t0) * (i + 1) / N;
      quad(P(r1, ta, y0), P(r1, ta, y1), P(r1, tb, y1), P(r1, tb, y0));     // facade
      quad(P(r2, tb, y0), P(r2, tb, y1), P(r2, ta, y1), P(r2, ta, y0));     // back
      quad(P(r1, ta, y1), P(r2, ta, y1), P(r2, tb, y1), P(r1, tb, y1));     // roof
      quad(P(r1, tb, y0), P(r2, tb, y0), P(r2, ta, y0), P(r1, ta, y0));     // base
    }
    quad(P(r2, t0, y0), P(r2, t0, y1), P(r1, t0, y1), P(r1, t0, y0));
    quad(P(r1, t1, y0), P(r1, t1, y1), P(r2, t1, y1), P(r2, t1, y0));
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
  }
  function arcLine(r, t0, t1, y, mat = inkC, N = 40) {
    const pts = []; for (let i = 0; i <= N; i++) pts.push(P(r, t0 + (t1 - t0) * i / N, y));
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
  }
  const ringGeo = (r1, r2, y, h) => {           // a raised ring (curb, hedge, basin wall)
    const g = new THREE.LatheGeometry([new THREE.Vector2(r1, 0), new THREE.Vector2(r2, 0), new THREE.Vector2(r2, h), new THREE.Vector2(r1, h), new THREE.Vector2(r1, 0)], 120);
    g.translate(0, y, 0); return g;
  };
  const flatRing = (r1, r2, y, color) => {
    const g = new THREE.RingGeometry(r1, r2, 120, 1); g.rotateX(-Math.PI / 2); g.translate(0, y, 0); return mesh(g, color, scene, { sketchy: false, mat: inkC });
  };
  function label(text, pos, size = 3.2) {
    const c = document.createElement("canvas"); c.width = 512; c.height = 128;
    const x = c.getContext("2d"); x.font = "600 64px Assistant, Arial, sans-serif"; x.fillStyle = "#2b2925";
    x.textAlign = "center"; x.textBaseline = "middle"; x.direction = "rtl"; x.fillText(text, 256, 64);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, fog: true }));
    s.position.copy(pos); s.scale.set(size * 4, size, 1); scene.add(s);
  }

  // ---------- sky: watercolour dome and a few soft clouds ----------
  const sky = new THREE.Group(); scene.add(sky);
  {
    const R = 480, sg = new THREE.SphereGeometry(R, 32, 20), pa = sg.attributes.position, col = [];
    const cH = new THREE.Color(HAZE), cM = new THREE.Color(0xb4cfdc), cZ = new THREE.Color(0x7fa9c9), tmp = new THREE.Color();
    for (let i = 0; i < pa.count; i++) {
      const y = pa.getY(i) / R;
      if (y <= 0) tmp.copy(cH);
      else { const u = Math.pow(y, .55); tmp.copy(u < .35 ? cH.clone().lerp(cM, u / .35) : cM.clone().lerp(cZ, (u - .35) / .65)); }
      col.push(tmp.r, tmp.g, tmp.b);
    }
    sg.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    const dome = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
    dome.renderOrder = -10; sky.add(dome);
    const cc = document.createElement("canvas"); cc.width = 512; cc.height = 200; const cx = cc.getContext("2d");
    [[110,120,70],[200,100,85],[300,105,90],[390,125,65],[250,135,80],[160,140,55]].forEach(([x, y, r]) => {
      const g = cx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, "rgba(255,252,244,.95)"); g.addColorStop(.6, "rgba(250,248,240,.55)"); g.addColorStop(1, "rgba(250,248,240,0)");
      cx.fillStyle = g; cx.fillRect(0, 0, 512, 200);
    });
    const ctex = new THREE.CanvasTexture(cc);
    for (let k = 0; k < 9; k++) {
      const az = rnd() * Math.PI * 2, el = D(10 + rnd() * 30);
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ctex, transparent: true, opacity: .85, fog: false, depthWrite: false }));
      sp.position.set(Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az)).multiplyScalar(330);
      sp.scale.set(140 + rnd() * 90, 55 + rnd() * 30, 1); sky.add(sp);
    }
  }

  // ---------- canvas textures: street signs, ground lettering, posters ----------
  const SERIF = '"Frank Ruhl Libre", "David Libre", "Times New Roman", serif';
  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; const tex = new THREE.CanvasTexture(c);
    const go = () => { const x = c.getContext("2d"); x.clearRect(0, 0, w, h); x.textAlign = "center"; x.textBaseline = "middle"; x.direction = "rtl"; draw(x); tex.needsUpdate = true; };
    go(); if (document.fonts && document.fonts.load) document.fonts.load('700 100px "Frank Ruhl Libre"').then(go).catch(() => {});
    return tex;
  }
  const signTex = (name) => canvasTex(1024, 340, (x) => {
    // text only, no plate: dark ink with a light halo so it reads over sky and facades
    x.lineJoin = "round"; x.strokeStyle = "#f1ead6"; x.fillStyle = "#1d2a46";
    x.font = "500 58px " + SERIF; x.lineWidth = 12; x.strokeText("רחוב", 512, 92); x.fillText("רחוב", 512, 92);
    x.font = "700 160px " + SERIF; x.lineWidth = 18; x.strokeText(name, 512, 210); x.fillText(name, 512, 210);
  });
  const groundTex = (name) => canvasTex(1024, 320, (x) => { x.fillStyle = "rgba(43,41,37,.7)"; x.font = "700 210px " + SERIF; x.fillText(name, 512, 165); });
  const marqueeTex = () => canvasTex(1024, 220, (x) => {
    rr(x, 4, 4, 1016, 212, 28); x.fillStyle = "#3a2b25"; x.fill(); x.strokeStyle = "#d8c79e"; x.lineWidth = 5; rr(x, 20, 20, 984, 180, 18); x.stroke();
    x.fillStyle = "#e6d6ac"; x.font = "700 130px " + SERIF; x.fillText("קולנוע אסתר", 512, 112);
  });
  const posterTex = (bg, fg, lines, sub, dots) => canvasTex(256, 372, (x) => {
    x.fillStyle = bg; x.fillRect(0, 0, 256, 372);
    x.strokeStyle = fg; x.lineWidth = 6; x.strokeRect(12, 12, 232, 348); x.lineWidth = 2; x.strokeRect(22, 22, 212, 328);
    x.globalAlpha = .22; x.fillStyle = fg;
    for (let k = 0; k < 9; k++) { const a0 = Math.PI + k * Math.PI / 9, a1 = a0 + Math.PI / 18; x.beginPath(); x.moveTo(128, 140); x.lineTo(128 + 200 * Math.cos(a0), 140 + 200 * Math.sin(a0)); x.lineTo(128 + 200 * Math.cos(a1), 140 + 200 * Math.sin(a1)); x.fill(); }
    x.globalAlpha = 1; x.fillStyle = fg;
    if (dots) for (let k = 0; k < 7; k++) { x.beginPath(); x.arc(58 + k * 23, 82, 7, 0, 7); x.fill(); }
    x.font = "700 46px " + SERIF; lines.forEach((t, i) => x.fillText(t, 128, 180 + i * 54));
    x.font = "500 24px " + SERIF; x.fillText(sub, 128, 330);
  });

  // ---------- layout (metres; centre of the fountain = 0,0) ----------
  const ISLAND = 33, ROAD_OUT = 43, FACADE = 47, DEPTH = 14;
  // building blocks as read off Averbuch's plan (north up): degrees clockwise from north, about +-3 deg
  const BLOCKS = [[9, 49], [59, 83], [114, 141], [154, 183], [194, 276], [299, 347]];
  const NAMES = ["דיזנגוף", "ריינס", "זמנהוף", "בן עמי", "דיזנגוף", "פינסקר"];   // side-street names are provisional
  const ARMS = BLOCKS.map((b, k) => {            // arm k = the street gap just before block k
    const pv = BLOCKS[(k + BLOCKS.length - 1) % BLOCKS.length];
    let a0 = pv[1], a1 = b[0]; if (a1 < a0) a1 += 360;
    const half = Math.max(8, Math.min(FACADE * Math.sin(D((a1 - a0) / 2)), 14));
    return { t: D(((a0 + a1) / 2) % 360), name: NAMES[k], gap: half, road: Math.max(5, half - 3) };
  });
  const signs = [];
  function addSign(a) {
    const s = new THREE.Group(); s.position.copy(P(44, a.t, 12)); scene.add(s);
    const sm = new THREE.MeshBasicMaterial({ map: signTex(a.name), transparent: true, opacity: 1, depthWrite: false, side: THREE.DoubleSide }); s.userData.m = sm;
    s.add(new THREE.Mesh(new THREE.PlaneGeometry(8, 2.7), sm));
    signs.push(s);
    const base = P(44, a.t, 0);
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(base.x, .1, base.z), P(44, a.t, 10.5)]), inkB));
    const ring = new THREE.Mesh(new THREE.RingGeometry(.9, 1.3, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: C.ink, transparent: true, opacity: .5, depthWrite: false }));
    ring.position.set(base.x, .12, base.z); scene.add(ring);
  }

  // ground, ring road, sidewalks
  mesh(new THREE.CircleGeometry(320, 64).rotateX(-Math.PI / 2), 0xd3c9b4, scene, { sketchy: false, mat: inkC });
  flatRing(ISLAND, ROAD_OUT, .10, C.asphalt);
  flatRing(ROAD_OUT, FACADE, .14, C.walk);
  ARMS.forEach((a) => {
    const g = new THREE.Group(); g.rotation.y = -a.t; scene.add(g);
    const len = 260, start = ROAD_OUT - 6, mid = -(start + len / 2);
    const sw = new THREE.PlaneGeometry(a.gap * 2, len).rotateX(-Math.PI / 2); sw.translate(0, .06, mid);
    mesh(sw, C.walk, g, { sketchy: false, mat: inkC });
    const road = new THREE.PlaneGeometry(a.road * 2, len).rotateX(-Math.PI / 2); road.translate(0, .08, mid);
    mesh(road, C.asphalt, g, { sketchy: false, mat: inkC });
    for (let d = FACADE + 8; d < 200; d += 14) for (const sd of [-1, 1]) youngTree(g, sd * (a.gap - 1.2), -d, .6);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(26, 8).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: groundTex(a.name), transparent: true, opacity: .5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    gl.position.set(0, .16, -(ROAD_OUT + 24)); g.add(gl);
    addSign(a);
  });

  // ---------- the island (Genia Averbuch's circle): pool, lawn, sand path, lawn with palms ----------
  flatRing(30.5, ISLAND, .20, C.stone);                     // outer path
  flatRing(22.5, 30.5, .22, C.lawn);                        // outer lawn, palms and young trees
  flatRing(18.5, 22.5, .24, C.sand);                        // coarse sand path
  flatRing(11.1, 18.5, .26, C.lawnDark);                    // inner lawn
  flatRing(14.2, 15.4, .28, C.bed);                         // flower bed
  mesh(ringGeo(32.9, 33.15, 0, .30), C.stone);              // curb
  mesh(ringGeo(30.3, 30.9, .18, .8), C.hedge, scene, { thresh: 30 });   // low hedge
  { // low fence around the inner lawn, white pillars where the four paths meet the hedge
    const pts = [], R = 18.65, N = 90;
    for (let i = 0; i < N; i++) { const a = i / N * Math.PI * 2, b = (i + 1) / N * Math.PI * 2; pts.push(P(R, a, .55), P(R, b, .55), P(R, a, .28), P(R, b, .28), P(R, a, 0), P(R, a, .55)); }
    scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), inkA));
    [0, 2, 4, 5].forEach((k) => { const pg = new THREE.Group(); pg.rotation.y = -ARMS[k].t; scene.add(pg); for (const sx of [-2.1, 2.1]) mesh(new THREE.BoxGeometry(.55, 1.5, .55).translate(sx, .75, -30.6), 0xf2eee3, pg, { thresh: 20 }); });
  }
  [0, 2, 4, 5].forEach((k) => {                             // four sand paths across the outer lawn
    const g = new THREE.Group(); g.rotation.y = -ARMS[k].t; scene.add(g);
    const pth = new THREE.PlaneGeometry(3, 8.2).rotateX(-Math.PI / 2); pth.translate(0, .30, -26.5);
    mesh(pth, C.sand, g, { sketchy: false, mat: inkC });
  });
  const dotTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 32; const x = c.getContext("2d"); x.fillStyle = "#fff"; x.beginPath(); x.arc(16, 16, 14, 0, 7); x.fill(); return new THREE.CanvasTexture(c); })();
  { // flower bed dots
    const n = 150, pos = new Float32Array(n * 3), colr = new Float32Array(n * 3), pal = [0xd9a1a0, 0xe5c78f, 0xf0e8d8, 0xc98a8a].map((h) => new THREE.Color(h));
    for (let i = 0; i < n; i++) {
      const t = i / n * Math.PI * 2, r = 14.8 + (rnd() - .5) * 1.0, c = pal[i % 4];
      pos[i * 3] = r * Math.sin(t); pos[i * 3 + 1] = .5; pos[i * 3 + 2] = -r * Math.cos(t); colr.set([c.r, c.g, c.b], i * 3);
    }
    const bg = new THREE.BufferGeometry(); bg.setAttribute("position", new THREE.BufferAttribute(pos, 3)); bg.setAttribute("color", new THREE.BufferAttribute(colr, 3));
    scene.add(new THREE.Points(bg, new THREE.PointsMaterial({ size: .3, vertexColors: true, map: dotTex, alphaTest: .4 })));
  }
  // pool, rim, inner basin, fountain
  mesh(ringGeo(10.5, 11.1, .2, .32), C.stone, scene, { thresh: 30 });
  const waterMat = new THREE.ShaderMaterial({
    uniforms: { uT: { value: 0 } },
    vertexShader: "varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader: "precision mediump float; uniform float uT; varying vec2 vP; void main(){ float r = length(vP); float w = sin(r*2.4 - uT*2.2)*.5+.5; w *= smoothstep(10.5,6.0,r)*.6+.4; vec3 a = vec3(.52,.68,.66), b = vec3(.76,.86,.83); gl_FragColor = vec4(mix(a,b,w*.55),1.0); }"
  });
  const water = new THREE.Mesh(new THREE.CircleGeometry(10.5, 80).rotateX(-Math.PI / 2), waterMat); water.position.y = .42; scene.add(water);
  mesh(ringGeo(3.0, 3.5, .2, .5), 0xf0e9d8, scene, { thresh: 30 });
  mesh(new THREE.CylinderGeometry(.55, .75, .9, 16).translate(0, .45, 0), C.stone, scene, { thresh: 30 });
  const JET = 700, jetPos = new Float32Array(JET * 3), jet = [];
  for (let i = 0; i < JET; i++) jet.push({ t: rnd() * 1.6, a: rnd() * Math.PI * 2, s: rnd() < .45 ? rnd() * .12 : rnd() * 1.2, v: 9.5 + rnd() * 2.4 });
  const jetGeo = new THREE.BufferGeometry(); jetGeo.setAttribute("position", new THREE.BufferAttribute(jetPos, 3));
  const dot = document.createElement("canvas"); dot.width = dot.height = 32;
  { const x = dot.getContext("2d"), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); }
  scene.add(new THREE.Points(jetGeo, new THREE.PointsMaterial({ color: 0xe6f1ee, size: .34, map: new THREE.CanvasTexture(dot), transparent: true, opacity: .9, depthWrite: false })));

  // planting: young palms, young trees on stakes, lamps, benches
  function youngTree(parent, x, z, s = 1) {
    const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
    mesh(new THREE.CylinderGeometry(.07 * s, .1 * s, 2.6 * s, 6).translate(0, 1.3 * s, 0), 0x9b8b72, g, { sketchy: false });
    mesh(new THREE.IcosahedronGeometry(1.1 * s, 0).translate(0, 3.1 * s, 0), 0x72905c, g, { thresh: 10 });
    const st = []; for (let k = 0; k < 3; k++) { const a = k * 2.1; st.push(new THREE.Vector3(Math.cos(a) * .7 * s, 0, Math.sin(a) * .7 * s), new THREE.Vector3(0, 2.6 * s, 0)); }
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(st), inkC));
  }
  function palm(x, z, h = 2.8) {   // young date palm: short trunk, heavy drooping crown
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    mesh(new THREE.CylinderGeometry(.24, .34, h, 7).translate(0, h / 2, 0), 0xb7a688, g, { thresh: 40 });
    const pts = [];
    for (let k = 0; k < 16; k++) {
      const a = k / 16 * Math.PI * 2 + rnd() * .3, L = 2.2 + rnd() * .7;
      let prev = new THREE.Vector3(0, h, 0);
      for (let sg = 1; sg <= 6; sg++) {
        const u = sg / 6, p = new THREE.Vector3(Math.cos(a) * L * u, h + .7 * u - 1.5 * u * u, Math.sin(a) * L * u);
        pts.push(prev, p); prev = p;
      }
    }
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x66804f, transparent: true, opacity: .95, fog: true })));
  }
  const nearPath = (deg) => [0, 2, 4, 5].some((k) => Math.abs(((deg - ARMS[k].t * 180 / Math.PI + 540) % 360) - 180) < 7);
  for (let k = 0; k < 12; k++) { const d = k * 30 + 15; if (nearPath(d)) continue; const p = P(26.5, D(d), 0); palm(p.x, p.z, 2.4 + rnd()); }
  for (let k = 0; k < 24; k++) { const d = k * 15 + 7; if (nearPath(d)) continue; const p = P(28.8, D(d), 0); youngTree(scene, p.x, p.z, .55); }
  for (let k = 0; k < 8; k++) {   // lamps
    const p = P(22.9, D(k * 45 + 22), 0), g = new THREE.Group(); g.position.copy(p); scene.add(g);
    mesh(new THREE.CylinderGeometry(.06, .08, 3.8, 6).translate(0, 1.9, 0), 0xf2eee4, g, { sketchy: false });
    mesh(new THREE.SphereGeometry(.5, 14, 8).scale(1, .38, 1).translate(0, 4, 0), 0xf7f2e6, g, { thresh: 60 });   // mushroom lamp
  }
  const benches = [];
  for (let k = 0; k < 14; k++) {
    const t = D(k * (360 / 14) + 6), g = new THREE.Group(); g.position.copy(P(21.3, t, 0)); g.rotation.y = -t; scene.add(g);
    mesh(new THREE.BoxGeometry(1.8, .08, .5).translate(0, .45, 0), 0x7a6650, g, { sketchy: false });
    mesh(new THREE.BoxGeometry(1.8, .45, .06).translate(0, .75, -.25), 0x7a6650, g, { sketchy: false });
    for (const sx of [.86, -.86]) mesh(new THREE.BoxGeometry(.14, .78, .56).translate(sx, .39, -.02), 0xf2eee3, g, { thresh: 20 });   // white concrete ends
    benches.push(t);
  }

  // ---------- facade detail: window ribbons, shopfronts, stair windows ----------
  function facadeStrip(r, t0, t1, y0, y1, modW) {
    const len = (t1 - t0) * r, N = Math.max(2, Math.round(len / 1.6)), v = [], uv = [];
    for (let i = 0; i < N; i++) {
      const ta = t0 + (t1 - t0) * i / N, tb = t0 + (t1 - t0) * (i + 1) / N, u0 = len * i / N / modW, u1 = len * (i + 1) / N / modW;
      const a = P(r, ta, y0), b = P(r, ta, y1), c = P(r, tb, y1), d = P(r, tb, y0);
      v.push(...a.toArray(), ...b.toArray(), ...c.toArray(), ...a.toArray(), ...c.toArray(), ...d.toArray());
      uv.push(u0, 0, u0, 1, u1, 1, u0, 0, u1, 1, u1, 0);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals(); return g;
  }
  const tiled = (w, h, draw) => { const t = canvasTex(w, h, draw); t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4; return t; };
  const winMat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, map: tiled(256, 128, (x) => {
    x.fillStyle = "#e7e0cf"; x.fillRect(0, 0, 256, 128);                                  // plaster pier between windows
    const W = 150, X = 53, Y = 14, Hh = 100;
    const g = x.createLinearGradient(0, Y, 0, Y + Hh); g.addColorStop(0, "#56636b"); g.addColorStop(1, "#39444b");
    x.fillStyle = g; x.fillRect(X, Y, W, Hh);                                             // the window opening
    x.fillStyle = "#2f3940"; x.fillRect(X, Y, W, 26);                                     // raised shutter in its box
    for (let k = 1; k < 5; k++) { x.fillStyle = "rgba(255,255,255,.10)"; x.fillRect(X, Y + k * 5, W, 2); }
    x.fillStyle = "rgba(255,255,255,.16)"; x.beginPath(); x.moveTo(X + 16, Y + Hh); x.lineTo(X + 56, Y + 26); x.lineTo(X + 78, Y + 26); x.lineTo(X + 38, Y + Hh); x.fill();
    x.fillStyle = "#cfc6b0"; x.fillRect(X + W / 2 - 3, Y + 26, 6, Hh - 26);               // mullion
    x.fillStyle = "#f1ebdc"; x.fillRect(X - 5, Y + Hh - 2, W + 10, 7);                    // sill
    x.strokeStyle = "#b8ae97"; x.lineWidth = 2; x.strokeRect(X - 1, Y - 1, W + 2, Hh + 2);
  }) });
  const shopMat = new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, map: tiled(256, 252, (x) => {
    x.fillStyle = "#d9d0bb"; x.fillRect(0, 0, 256, 252);
    const g = x.createLinearGradient(0, 0, 0, 252); g.addColorStop(0, "#3d454a"); g.addColorStop(1, "#6b5b43"); x.fillStyle = g; x.fillRect(10, 10, 140, 232);
    x.fillStyle = "#4a3b2c"; x.fillRect(166, 10, 80, 232);
    x.fillStyle = "#d9d0bb"; x.fillRect(10, 62, 140, 5); x.fillRect(78, 10, 5, 232); x.fillRect(206, 10, 5, 232); x.fillRect(166, 62, 80, 5);
    x.fillStyle = "rgba(255,225,160,.22)"; x.fillRect(10, 150, 140, 92);
  }) });
  const glassMat = new THREE.MeshLambertMaterial({ color: 0x6c7c85, side: THREE.DoubleSide });

  // ---------- block footprint: one closed loop with all four corners rounded ----------
  // In the archive photos a block is a free-standing slab whose balcony bands run right around it:
  // front, both street elevations and the back. So the plan is a closed loop, every corner is a
  // fillet, and each band is the same loop offset outward. Nothing is a separate pasted-on cylinder.
  function roundLoop(pts, L) {
    const n = pts.length, keep = new Array(n).fill(true), ins = new Map();
    const turn = (i) => {
      const a = pts[(i - 1 + n) % n], b = pts[i], c = pts[(i + 1) % n];
      const u = b.clone().sub(a).normalize(), v = c.clone().sub(b).normalize();
      return Math.acos(Math.max(-1, Math.min(1, u.dot(v))));
    };
    const walk = (i, dir) => {                       // point at arc length L from vertex i, and the last vertex passed
      let rem = L, j = i, p = pts[i].clone();
      for (let guard = 0; guard < n; guard++) {
        const k = (j + dir + n) % n, q = pts[k], d = p.distanceTo(q);
        if (d >= rem) return { p: p.clone().lerp(q, rem / d), idx: j };
        rem -= d; p = q.clone(); j = k;
      }
      return { p, idx: j };
    };
    for (let i = 0; i < n; i++) {
      if (turn(i) < .3) continue;
      const a = walk(i, -1), c = walk(i, 1), b = pts[i], S = 12, bez = [];
      for (let s2 = 0; s2 <= S; s2++) {
        const u = s2 / S;
        bez.push(a.p.clone().multiplyScalar((1 - u) * (1 - u)).add(b.clone().multiplyScalar(2 * u * (1 - u))).add(c.p.clone().multiplyScalar(u * u)));
      }
      ins.set(i, bez);
      for (let k = (a.idx + 1) % n; k !== i; k = (k + 1) % n) keep[k] = false;
      for (let k = (i + 1) % n; k !== c.idx; k = (k + 1) % n) keep[k] = false;
      keep[i] = false;
    }
    const out = [];
    for (let i = 0; i < n; i++) { if (ins.has(i)) out.push(...ins.get(i)); else if (keep[i]) out.push(pts[i]); }
    return out;
  }
  function blockLoop(t0, t1) {
    const pts = [], nf = Math.max(8, Math.round((t1 - t0) * FACADE / 1.6)), nb = Math.max(6, Math.round((t1 - t0) * (FACADE + DEPTH) / 2.6));
    for (let i = 0; i <= nf; i++) pts.push(P(FACADE, t0 + (t1 - t0) * i / nf, 0));
    for (let i = 0; i <= nb; i++) pts.push(P(FACADE + DEPTH, t1 + (t0 - t1) * i / nb, 0));
    return roundLoop(pts, 3.6);
  }
  function offsetLoop(pts, d) {       // the same loop pushed outward from every face
    const n = pts.length, c = new THREE.Vector3();
    pts.forEach((q) => c.add(q)); c.multiplyScalar(1 / n);
    return pts.map((q, i) => {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n], t = b.clone().sub(a).normalize();
      const nr = new THREE.Vector3(t.z, 0, -t.x);
      if (nr.dot(q.clone().sub(c)) < 0) nr.negate();
      return q.clone().add(nr.multiplyScalar(d));
    });
  }
  const closed = (pts) => pts.concat([pts[0]]);
  function ribbon(pts, y0, y1, modW) {
    const v = [], uv = []; let u = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], u0 = u; u += a.distanceTo(b) / (modW || 1);
      v.push(a.x, y0, a.z, a.x, y1, a.z, b.x, y1, b.z, a.x, y0, a.z, b.x, y1, b.z, b.x, y0, b.z);
      uv.push(u0, 0, u0, 1, u, 1, u0, 0, u, 1, u, 0);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
    if (modW) g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.computeVertexNormals(); return g;
  }
  function deck(A, B, y) {            // horizontal strip between a loop and its offset
    const v = [];
    for (let i = 0; i < A.length - 1; i++) {
      const a = A[i], b = A[i + 1], c = B[i + 1], d2 = B[i];
      v.push(a.x, y, a.z, b.x, y, b.z, c.x, y, c.z, a.x, y, a.z, c.x, y, c.z, d2.x, y, d2.z);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
  }
  function cap(pts, y) {
    const c = new THREE.Vector3(); pts.forEach((q) => c.add(q)); c.multiplyScalar(1 / pts.length);
    const v = [];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; v.push(c.x, y, c.z, a.x, y, a.z, b.x, y, b.z); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3)); g.computeVertexNormals(); return g;
  }
  // A balcony front is not one flat wall: a thin slab edge, the parapet body, a shadow groove,
  // then a coping that is thicker and projects a little further. That is the band you see in the photos.
  function parapet(loop, out, y, h, col) {
    const body = closed(offsetLoop(loop, out)), back = closed(offsetLoop(loop, out - .18));
    const grv = closed(offsetLoop(loop, out - .09)), cap2 = closed(offsetLoop(loop, out + .09));
    const yg = y + h - .34, yc = y + h - .24;
    mesh(ribbon(body, y, yg), col, scene, { thresh: 50 });                      // thinner lower part
    mesh(deck(grv, body, yg), col, scene, { sketchy: false, mat: inkC });
    mesh(ribbon(grv, yg, yc), col, scene, { thresh: 50, sketchy: false });      // the reveal, in shadow
    mesh(deck(grv, cap2, yc), col, scene, { sketchy: false, mat: inkC });
    mesh(ribbon(cap2, yc, y + h), col, scene, { thresh: 50 });                  // thicker coping on top
    mesh(deck(back, cap2, y + h), col, scene, { sketchy: false, mat: inkC });
    mesh(ribbon(back, y, y + h), col, scene, { thresh: 50, sketchy: false });
  }
  function band(loop, out, y, th, col) {   // a slab that projects from every face
    const A = closed(loop), B = closed(offsetLoop(loop, out));
    mesh(ribbon(B, y, y + th), col, scene, { thresh: 50 });
    mesh(deck(A, B, y + th), col, scene, { sketchy: false, mat: inkC });
    mesh(deck(A, B, y), col, scene, { sketchy: false, mat: inkC });
  }

  // ---------- buildings around the circle ----------
  const FLOOR = 3, GROUND = 4.2;
  const gapAt = (a) => Math.asin(a.gap / FACADE);
  let bi = 0, cinemaAt = null;
  ARMS.forEach((a, i) => {
    const b = ARMS[(i + 1) % ARMS.length];
    const t0 = a.t + gapAt(a), t1 = (b.t < a.t ? b.t + Math.PI * 2 : b.t) - gapAt(b);
    const cinemaBlock = i === 3;                              // position of the cinema is a placeholder
    const n = cinemaBlock ? 1 : Math.max(1, Math.round((t1 - t0) / D(30)));
    for (let k = 0; k < n; k++) {
      const s0 = t0 + (t1 - t0) * k / n + (k ? D(.8) : 0), s1 = t0 + (t1 - t0) * (k + 1) / n - (k < n - 1 ? D(.8) : 0);
      const cinema = cinemaBlock;
      // the cinema, as in the archive photo: a white banded front block like its neighbours, the hall with its hipped roof behind
      const floors = cinema ? 4 : [3, 4, 3, 3, 4, 3, 3][bi % 7];
      const H = GROUND + floors * FLOOR;
      const col = cinema ? C.cinema : C.plaster[bi % C.plaster.length];
      const BAL = 1.5, PAR = 1.0, SLAB = .22;
      {
        const loop = blockLoop(s0, s1), lc = closed(loop), skin = closed(offsetLoop(loop, .05));
        mesh(ribbon(lc, 0, H), col, scene, { thresh: 50 });                            // the block itself
        mesh(cap(loop, H), col, scene, { sketchy: false, mat: inkC });
        scene.add(new THREE.Mesh(ribbon(skin, .35, 3.5, 4), shopMat));                 // shopfronts, right around
        band(loop, 2.2, 3.62, .18, C.awning[bi % 3]);                                   // awning
        for (let f = 0; f < floors; f++) {
          const y = GROUND + f * FLOOR;
          scene.add(new THREE.Mesh(ribbon(skin, y + .95, y + 2.75, 3.4), winMat));      // window band, in the shade of the slab
          band(loop, BAL, y - .04, SLAB, col);                                          // thin slab edge at the bottom
          parapet(loop, BAL, y - .04 + SLAB, PAR, col);                                  // body, reveal groove, thicker coping
        }
        band(loop, BAL, H, .22, col);                                                   // roof slab
        parapet(loop, BAL, H + .22, .8, col);
        if (!cinema) for (let q = 0; q < 2; q++) {   // roof clutter
          const ang = s0 + (s1 - s0) * (.25 + rnd() * .5), rad = FACADE + 6 + rnd() * 5, rg = new THREE.Group(); rg.position.copy(P(rad, ang, H)); rg.rotation.y = -ang; scene.add(rg);
          if (q === 0) mesh(new THREE.BoxGeometry(3.2, 2.4, 2.6).translate(0, 1.2, 0), col, rg, { thresh: 20 });
          else { mesh(new THREE.BoxGeometry(1.6, .8, 1.6).translate(0, .4, 0), 0xaaa597, rg, { sketchy: false }); mesh(new THREE.CylinderGeometry(.9, .9, 1.3, 10).translate(0, 1.45, 0), 0xb9b3a6, rg, { thresh: 30 }); }
        }
      }
      if (cinema) {
        const mid = (s0 + s1) / 2, front = FACADE - BAL - .35;     // square side, in front of the balcony bands, never behind them
        cinemaAt = mid;
        const hall = new THREE.Group(); hall.position.copy(P(FACADE + DEPTH + 9, mid, 0)); hall.rotation.y = -mid; scene.add(hall);
        mesh(new THREE.BoxGeometry(22, 13, 18).translate(0, 6.5, 0), col, hall, { thresh: 20 });
        mesh(new THREE.ConeGeometry(1, 1, 4, 1).rotateY(Math.PI / 4).scale(15.6, 4.5, 12.7).translate(0, 15.25, 0), 0xb3ad9f, hall, { thresh: 20 });
        // the name stands on the roof parapet, the posters hang on the lower right corner as in the photo
        const mq = new THREE.Mesh(new THREE.PlaneGeometry(11, 2.4), new THREE.MeshBasicMaterial({ map: marqueeTex(), transparent: true, side: THREE.DoubleSide }));
        mq.position.copy(P(front, mid, H + 1.02 + 1.3)); mq.rotation.y = -mid; scene.add(mq);
        const posters = [
          posterTex("#35575a", "#ecdfbd", ["שלגייה", "ושבעת", "הגמדים"], "הצגות 4 · 7 · 9.30", true),
          posterTex("#7a3d35", "#ecdfbd", ["יומן", "קולנוע"], "חדשות העולם", false),
          posterTex("#3c4a66", "#ecdfbd", ["הערב", "הצגה", "חגיגית"], "פרמיירה", false)
        ];
        [.7, .79, .88].forEach((f, j) => {
          const ang = s0 + (s1 - s0) * f;
          const pl = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 3.3), new THREE.MeshBasicMaterial({ map: posters[j], side: THREE.DoubleSide }));
          pl.position.copy(P(front, ang, 6.9)); pl.rotation.y = -ang; scene.add(pl);
        });
      }
      bi++;
    }
  });
  // the rest of the city: low blocks behind, fading into the haze
  for (let r = FACADE + 24; r < 190; r += 21) {
    const n = Math.floor(2 * Math.PI * r / 24);
    for (let k = 0; k < n; k++) {
      const t = k / n * Math.PI * 2 + rnd() * .05;
      if (ARMS.some((a) => Math.abs(Math.atan2(Math.sin(t - a.t), Math.cos(t - a.t))) < Math.atan((a.gap + 9) / r))) continue;
      if (cinemaAt !== null && r < 92 && Math.abs(Math.atan2(Math.sin(t - cinemaAt), Math.cos(t - cinemaAt))) < Math.atan(19 / r)) continue;   // room for the cinema hall
      const g = new THREE.Group(); g.position.copy(P(r, t, 0)); g.rotation.y = -t; scene.add(g);
      const fl = 1 + Math.floor(rnd() * 3), h = GROUND + FLOOR * fl, w = 11 + rnd() * 5, cc = C.city[k % 4];
      mesh(new THREE.BoxGeometry(w, h, 12).translate(0, h / 2, 0), cc, g, { thresh: 20, mat: inkC });
      if (r < 115) {                       // near enough to read: slab, parapet and a window band per floor
        for (let f = 0; f < fl; f++) {
          const y = GROUND + f * FLOOR;
          mesh(new THREE.BoxGeometry(w + 2.6, .18, 14.6).translate(0, y, 0), cc, g, { thresh: 30, sketchy: false });
          mesh(new THREE.BoxGeometry(w + 2.3, .85, 14.3).translate(0, y + .62, 0), cc, g, { thresh: 30, sketchy: false });
          mesh(new THREE.BoxGeometry(w + 2.6, .2, 14.6).translate(0, y + 1.14, 0), cc, g, { thresh: 30, sketchy: false });
          mesh(new THREE.BoxGeometry(w + .06, 1.4, 12.06).translate(0, y + 1.95, 0), 0x4e5a61, g, { thresh: 40, sketchy: false });
        }
        mesh(new THREE.BoxGeometry(w + 2.6, .2, 14.6).translate(0, h, 0), cc, g, { thresh: 30, sketchy: false });
        mesh(new THREE.BoxGeometry(w + 2.3, .7, 14.3).translate(0, h + .55, 0), cc, g, { thresh: 30, sketchy: false });
      }
    }
  }

  // ---------- people (1.7 m) and cars (4.3 m) for scale ----------
  function person(coat, sitting = false, woman = false) {   // standing figure: 1.7 m to the top of the hat
    const g = new THREE.Group(), lift = sitting ? -.27 : 0;
    if (!sitting) for (const x of [.1, -.1]) mesh(new THREE.CylinderGeometry(.11, .11, .8, 6).translate(x, .4, 0), 0x4b463e, g, { sketchy: false });
    mesh(new THREE.CylinderGeometry(.2, .26, .72, 8).translate(0, 1.12 + lift, 0), coat, g, { sketchy: false });
    mesh(new THREE.SphereGeometry(.12, 10, 8).translate(0, 1.58 + lift, 0), 0xd9b99b, g, { thresh: 60, sketchy: false });
    if (woman) { mesh(new THREE.SphereGeometry(.14, 10, 8).translate(0, 1.6 + lift, -.02), 0x4a3524, g, { thresh: 60, sketchy: false }); mesh(new THREE.ConeGeometry(.34, .6, 10).translate(0, .78 + lift, 0), coat, g, { sketchy: false }); }
    else mesh(new THREE.CylinderGeometry(.14, .16, .06, 10).translate(0, 1.68 + lift, 0), 0x3d3a34, g, { sketchy: false });   // hat brim
    scene.add(g); return g;
  }
  const walkers = [
    { g: person(0x8b7d6b), r: 20.5, t: D(170), w: .055 },
    { g: person(0x6f7f8a), r: 21.4, t: D(40), w: -.05 },
    { g: person(0xa5876f), r: 31.7, t: D(250), w: .035 }
  ];
  [[0, 0x7c6f62], [1, 0x9a8f7c]].forEach(([k, c]) => {
    const t = benches[k * 5 + 2], g = person(k === 1 ? 0x7d8f7a : c, true, k === 1); g.position.copy(P(20.95, t, 0)); g.rotation.y = -t;
  });
  // 1930s sedan: tall narrow cabin, separate fenders and running boards, upright grille, round lamps
  function car(body, cabin, len = 4.5, wid = 1.75) {
    const g = new THREE.Group(), dark = 0x25221e;
    mesh(new THREE.BoxGeometry(len * .9, .4, wid * .9).translate(0, .62, 0), body, g, { thresh: 20 });
    mesh(new THREE.BoxGeometry(len * .36, .55, wid * .78).translate(len * .3, .98, 0), body, g, { thresh: 20 });        // hood
    mesh(new THREE.BoxGeometry(len * .4, .78, wid * .82).translate(-len * .06, 1.28, 0), cabin, g, { thresh: 20 });     // cabin
    mesh(new THREE.BoxGeometry(len * .2, .5, wid * .8).translate(-len * .4, .95, 0), body, g, { thresh: 20 });          // trunk
    mesh(new THREE.BoxGeometry(.08, .62, wid * .5).translate(len * .49, .8, 0), 0xcfc8b6, g, { thresh: 20, sketchy: false });   // grille
    for (const z of [.34, -.34]) mesh(new THREE.SphereGeometry(.14, 10, 8).translate(len * .46, 1.1, wid * z), 0xf3eed7, g, { thresh: 60, sketchy: false });
    for (const sd of [1, -1]) mesh(new THREE.BoxGeometry(len * .5, .07, .3).translate(0, .36, sd * (wid / 2 + .02)), dark, g, { sketchy: false });
    for (const [x, z] of [[len * .3, wid / 2], [len * .3, -wid / 2], [-len * .3, wid / 2], [-len * .3, -wid / 2]]) {
      mesh(new THREE.CylinderGeometry(.34, .34, .2, 14).rotateX(Math.PI / 2).translate(x, .34, z), dark, g, { thresh: 40, sketchy: false });
      mesh(new THREE.BoxGeometry(.95, .12, .36).translate(x, .74, z * 1.02), dark, g, { sketchy: false });              // fender
    }
    scene.add(g); return g;
  }
  function bus() {   // 1930s city bus with a short bonnet
    const g = new THREE.Group();
    mesh(new THREE.BoxGeometry(8, 2.3, 2.4).translate(-.6, 1.55, 0), 0xe8dcc0, g, { thresh: 20 });
    mesh(new THREE.BoxGeometry(8.02, .7, 2.42).translate(-.6, 2.1, 0), 0x8fa6b4, g, { thresh: 20, sketchy: false });
    mesh(new THREE.BoxGeometry(8.1, .25, 2.5).translate(-.6, 2.78, 0), 0x7d8a72, g, { thresh: 20, sketchy: false });
    mesh(new THREE.BoxGeometry(1.7, 1.4, 2.1).translate(4.25, 1.0, 0), 0xdccfae, g, { thresh: 20 });
    for (const x of [3, -3.2]) for (const z of [1.2, -1.2]) mesh(new THREE.CylinderGeometry(.45, .45, .25, 12).rotateX(Math.PI / 2).translate(x, .45, z), 0x2e2b27, g, { sketchy: false });
    scene.add(g); return g;
  }
  function cart() {   // horse and cart
    const g = new THREE.Group(), dark = 0x4a3f33;
    mesh(new THREE.BoxGeometry(1.7, .8, .5).translate(1.6, 1.3, 0), 0x7a5a3e, g, { thresh: 20 });          // horse body
    mesh(new THREE.BoxGeometry(.4, .9, .3).translate(2.6, 1.75, 0), 0x7a5a3e, g, { thresh: 20 });          // neck
    mesh(new THREE.BoxGeometry(.6, .3, .25).translate(2.95, 2.1, 0), 0x6a4c33, g, { thresh: 20 });         // head
    for (const [x, z] of [[2.2, .15], [2.2, -.15], [1.0, .15], [1.0, -.15]]) mesh(new THREE.CylinderGeometry(.06, .06, 1, 6).translate(x, .5, z), dark, g, { sketchy: false });
    mesh(new THREE.BoxGeometry(2.4, .45, 1.4).translate(-.9, 1.0, 0), 0x9a8566, g, { thresh: 20 });        // cart body
    mesh(new THREE.BoxGeometry(2.4, .5, .08).translate(-.9, 1.45, .66), 0x9a8566, g, { thresh: 20, sketchy: false });
    mesh(new THREE.BoxGeometry(2.4, .5, .08).translate(-.9, 1.45, -.66), 0x9a8566, g, { thresh: 20, sketchy: false });
    mesh(new THREE.BoxGeometry(1.4, .06, .06).translate(.7, 1.1, 0), dark, g, { sketchy: false });          // shaft
    for (const z of [.75, -.75]) mesh(new THREE.CylinderGeometry(.5, .5, .1, 14).rotateX(Math.PI / 2).translate(-1.1, .5, z), dark, g, { thresh: 40, sketchy: false });
    scene.add(g); return g;
  }
  // right-hand traffic: counter-clockwise around the circle
  const traffic = [
    { g: car(0x24211d, 0x2d2a26), r: 39.5, t: D(10),  v: 7 },
    { g: car(0xe2d6b8, 0xd8cba9), r: 36.5, t: D(140), v: 6 },
    { g: car(0x5b2f2a, 0x6b3a33), r: 39.5, t: D(250), v: 7.5 },
    { g: bus(),                    r: 40,   t: D(300), v: 5.5 },
    { g: cart(),                   r: 36.8, t: D(70),  v: 2.2 }
  ];

  // ---------- viewpoints and camera ----------
  const VIEWS = {
    in:   { pos: P(20.5, D(205), 1.6),  yaw: D(-6), pitch: D(-2) },      // promenade ring, looking north
    walk: { pos: P(45, D(165), 1.6),  yaw: D(15), pitch: D(-1) },        // sidewalk outside the circle
    roof: { pos: P(FACADE + .6, D(120), 19.5), yaw: D(60), pitch: D(-22) }   // on a roof edge, like the archive photos
  };
  const HINT = "גרור כדי להסתובב. צביטה לזום.", HINT_TOP = "גרור כדי להקיף את הכיכר. צביטה לקרב ולהרחיק.";
  const look = { yaw: 0, pitch: 0 }, cam = { mode: "fp", az: D(20), el: D(46), dist: 135 };
  const KEYS = ["in", "walk", "roof", "top"];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const setPressed = (k) => KEYS.forEach((x) => $("v-" + x).setAttribute("aria-pressed", String(x === k)));
  let flight = null;
  function setView(k) {
    flight = null;
    if (k === "top") { if (gyro.on || gyro.listening) gyroOff(); cam.mode = "orbit"; camera.fov = 55; camera.updateProjectionMatrix(); setPressed(k); $("hint").textContent = HINT_TOP; return; }
    cam.mode = "fp"; const v = VIEWS[k];
    if (!gyro.on) rig.rotation.set(0, 0, 0);
    rig.position.copy(v.pos); look.yaw = v.yaw; look.pitch = v.pitch;
    camera.fov = 70; camera.updateProjectionMatrix(); setPressed(k);
    if (!gyro.on) $("hint").textContent = HINT;
  }
  KEYS.forEach((k) => $("v-" + k).addEventListener("click", () => setView(k)));
  function applyOrbit() {
    const tgt = new THREE.Vector3(0, 3, 0), c = Math.cos(cam.el);
    const pos = new THREE.Vector3(Math.sin(cam.az) * c, Math.sin(cam.el), Math.cos(cam.az) * c).multiplyScalar(cam.dist).add(tgt);
    rig.rotation.set(0, 0, 0); rig.position.copy(pos);
    const f = tgt.clone().sub(pos).normalize(); camera.rotation.set(Math.asin(f.y), Math.atan2(-f.x, -f.z), 0);
  }

  // ---------- pointer: drag, pinch, tap ----------
  const ptrs = new Map(); let tap = null, pinch = null;
  const pdist = () => { const [a, b] = [...ptrs.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); flight = null;
    if (ptrs.size === 1) tap = { t: performance.now(), moved: 0 };
    else { tap = null; pinch = { d: pdist(), fov: camera.fov, dist: cam.dist }; }
  });
  canvas.addEventListener("pointermove", (e) => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (ptrs.size === 2 && pinch) {
      const k = pinch.d / pdist();            // fingers apart: k < 1, zoom in
      if (cam.mode === "orbit") cam.dist = clamp(pinch.dist * k, 18, 300); else { camera.fov = clamp(pinch.fov * k, 28, 85); camera.updateProjectionMatrix(); }
      return;
    }
    if (tap) tap.moved += Math.hypot(dx, dy);
    if (cam.mode === "orbit") { cam.az -= dx * .006; cam.el = clamp(cam.el + dy * .006, D(8), D(88)); return; }
    const k = D(camera.fov) / innerHeight;
    if (gyro.on) { rig.rotation.y += dx * k; return; }       // with sensors, dragging turns the whole scene
    look.yaw += dx * k; look.pitch = clamp(look.pitch + dy * k, -1.4, 1.4);
  });
  const endPtr = (e, cancel) => {
    if (ptrs.size === 1 && tap && !cancel && tap.moved < 8 && performance.now() - tap.t < 450) handleTap(e.clientX, e.clientY);
    ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; tap = null;
  };
  canvas.addEventListener("pointerup", (e) => endPtr(e, false)); canvas.addEventListener("pointercancel", (e) => endPtr(e, true));
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    if (cam.mode === "orbit") cam.dist = clamp(cam.dist * (1 + e.deltaY * .001), 18, 300); else { camera.fov = clamp(camera.fov * (1 + e.deltaY * .001), 28, 85); camera.updateProjectionMatrix(); }
  }, { passive: false });

  // ---------- phone orientation (can be switched off again) ----------
  const gyro = { on: false, abs: false, e: null, listening: false };
  const q = new THREE.Quaternion(), q1 = new THREE.Quaternion(-Math.sqrt(.5), 0, 0, Math.sqrt(.5)), q0 = new THREE.Quaternion(), zee = new THREE.Vector3(0, 0, 1), eu = new THREE.Euler();
  const oriAbs = (e) => onOri(e, true), oriRel = (e) => onOri(e, false);
  function onOri(e, absolute) {
    if (e.alpha == null) return;
    gyro.e = e;
    if (!gyro.on) { gyro.on = true; gyro.abs = absolute; rig.rotation.y = 0; onGyroState(); }
  }
  function applyGyro() {
    const e = gyro.e, o = D((screen.orientation && screen.orientation.angle) || window.orientation || 0);
    eu.set(D(e.beta), D(e.alpha), -D(e.gamma), "YXZ");
    camera.quaternion.copy(q.setFromEuler(eu).multiply(q1).multiply(q0.setFromAxisAngle(zee, -o)));
  }
  function gyroOff() {
    removeEventListener("deviceorientationabsolute", oriAbs); removeEventListener("deviceorientation", oriRel);
    if (gyro.on) { const f = new THREE.Vector3(); camera.getWorldDirection(f); look.yaw = Math.atan2(-f.x, -f.z); look.pitch = Math.asin(clamp(f.y, -1, 1)); }
    gyro.on = false; gyro.listening = false; gyro.e = null; rig.rotation.set(0, 0, 0);
    $("gyro").classList.remove("on"); $("gyro").textContent = "סיבוב עם הטלפון"; $("north").hidden = true; $("hint").textContent = HINT;
  }
  function alignNorth() {   // the phone is pointing north right now
    const f = new THREE.Vector3(); camera.getWorldDirection(f);
    rig.rotation.y += Math.atan2(f.x, -f.z);
  }
  $("north").addEventListener("click", alignNorth);
  $("gyro").addEventListener("click", async () => {
    if (gyro.on || gyro.listening) { gyroOff(); return; }
    try {
      const DOE = window.DeviceOrientationEvent;
      if (DOE && typeof DOE.requestPermission === "function" && (await DOE.requestPermission()) !== "granted") throw 0;
      if (cam.mode === "orbit") setView("in");
      flight = null; gyro.listening = true;
      if ("ondeviceorientationabsolute" in window) addEventListener("deviceorientationabsolute", oriAbs); else addEventListener("deviceorientation", oriRel);
      setTimeout(() => { if (!gyro.on) $("hint").textContent = "החיישנים לא זמינים כאן. בטלפון, פתח את הקובץ מכתובת https."; }, 1500);
    } catch (_) { $("hint").textContent = "אין הרשאה לחיישנים. גרור כדי להסתובב."; }
  });
  function onGyroState() {
    $("gyro").classList.add("on"); $("gyro").textContent = "כבה סיבוב טלפון";
    $("north").hidden = gyro.abs;
    $("hint").textContent = gyro.abs ? "הסצנה מכוונת לצפון לפי המצפן. גרירה מסובבת אותה אם צריך."
                                     : "כוון את הטלפון לצפון ולחץ ׳יישור לצפון׳. גרירה מסובבת את הסצנה.";
  }

  $("info-btn").addEventListener("click", () => { const n = $("notes"); n.hidden = !n.hidden; $("info-btn").setAttribute("aria-expanded", String(!n.hidden)); });
  $("notes").addEventListener("click", () => { $("notes").hidden = true; $("info-btn").setAttribute("aria-expanded", "false"); });

  // ---------- hotspots: markers, fly-to, pop-up cards ----------
  const IMG_GENIA = "../assets/genia.jpg", IMG_PLAN = "../assets/plan.jpg";
  const WIKI_SQ = "https://he.wikipedia.org/wiki/%D7%9B%D7%99%D7%9B%D7%A8_%D7%A6%D7%99%D7%A0%D7%94_%D7%93%D7%99%D7%96%D7%A0%D7%92%D7%95%D7%A3";
  const CARDS = {
    genia: {
      title: "ג'ניה אוורבוך", by: "מלכת הבאוהאוס של תל אביב", sub: "האדריכלית של הכיכר · 1909 עד 1977",
      figs: [
        { src: IMG_GENIA, alt: "ג'ניה אוורבוך יושבת על כיסא", cap: "ג'ניה אוורבוך. מקור התצלום לא מזוהה.", port: true },
        { src: IMG_PLAN, alt: "תוכנית אוורבוך לסידור הכיכר: מבט מלמעלה ומודל", cap: "תוכנית לסידור כיכר צינה דיזנגוף, ג'ניה אוורבוך. ידיעות עיריית תל אביב, חוברת 2, עמ' 51." }
      ],
      body: [
        "בת 25 כשניגשה לתחרות העיצוב של הכיכר ב־1934, והתוכנית שלה היא שקבעה איך תיראה הכיכר עד היום. הכיכר נחנכה ב־26 בינואר 1938.",
        "היא לא תכננה רק את הגן שבמרכז. היא קבעה קוד מחייב לכל מי שבנה סביב: חזיתות מעוקלות שממשיכות את קו המעגל, פסי מרפסות אופקיים ארוכים, וגובה אחיד. כך נוצר רחוב עגול אחד ולא שישה בניינים שונים. חלק מהבניינים תכננה בעצמה.",
        "בתוכנית שלמעלה רואים בלוקים מעוקלים סביב עיגול מרכזי, ובין הבלוקים רווחים שהם הרחובות. מהתוכנית הזו נמדדו בסקיצה הזו זוויות הרחובות וצורת הבלוקים.",
        "בין עבודותיה גם קפה גלינה ביריד המזרח, 1934, יחד עם אלזה גידוני־מנדלשטם ושלמה גינזבורג.",
        "הערה על התחרות: ויקיפדיה העברית כותבת שזכתה בתחרות. מקור אחר מתאר שלא הוענק פרס ראשון, ושהיא וי' גרינץ זכו במקום השני."
      ],
      credit: "מקורות: ויקיפדיה העברית (כיכר צינה דיזנגוף), artlog, ומאמרו של דוידי על יריד המזרח.",
      links: [
        { t: "ויקיפדיה: ג'ניה אוורבוך", u: "https://he.wikipedia.org/wiki/%D7%92%27%D7%A0%D7%99%D7%94_%D7%90%D7%95%D7%95%D7%A8%D7%91%D7%95%D7%9A" },
        { t: "Wikipedia: Genia Averbuch", u: "https://en.wikipedia.org/wiki/Genia_Averbuch" },
        { t: "ויקיפדיה: כיכר צינה דיזנגוף", u: WIKI_SQ }
      ]
    },
    video: {
      title: "Here We Are: הפתיח", sub: "הכיכר בטלוויזיה",
      video: "h8ZhGRf0grU", by: "הכיכר כסט צילום",
      body: [
        "הפתיח של סדרת הטלוויזיה Here We Are צולם כאן, בכיכר. מילות שיר הפתיחה שונו כדי שילדים מכל הארץ יוכלו להזדהות איתו.",
        "זו בחירה הגיונית: הכיכר הייתה הסלון של תל אביב. בפריימים של הפתיח רואים דוכן בשוק, בית קפה עם שולחנות עגולים וכיסאות מתכת לבנים, וחנויות בקומת הקרקע של הבניינים המעוגלים. זה בדיוק המרקם שהכיכר נבנתה בשבילו.",
        "שימו לב להבדל: הפתיח צולם בכיכר של שנות ה־70, אחרי שהוגבהה מעל הכביש, ולא בכיכר השטוחה שרואים כאן מ־1940."
      ],
      credit: "מקור: ויקיפדיה העברית, כיכר צינה דיזנגוף. התיאור של הפריימים מבוסס על צפייה בפתיח עצמו.",
      links: [
        { t: "הפתיח ביוטיוב", u: "https://youtu.be/h8ZhGRf0grU" },
        { t: "ויקיפדיה: כיכר צינה דיזנגוף", u: WIKI_SQ }
      ]
    }
  };
  const canvasIcon = (draw) => canvasTex(128, 128, (x) => { draw(x); });
  const markerTex = (icon) => canvasIcon((x) => {
    x.fillStyle = "rgba(236,223,192,.96)"; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill();
    x.fillStyle = "#4a3425"; x.beginPath(); x.arc(64, 64, 51, 0, 7); x.fill();
    x.fillStyle = "#f0e3c2";
    if (icon === "person") { x.beginPath(); x.arc(64, 46, 14, 0, 7); x.fill(); x.beginPath(); x.moveTo(36, 94); x.quadraticCurveTo(64, 48, 92, 94); x.closePath(); x.fill(); }
    else { x.beginPath(); x.moveTo(52, 40); x.lineTo(52, 88); x.lineTo(92, 64); x.closePath(); x.fill(); }
  });
  const ringTex = () => canvasIcon((x) => { x.strokeStyle = "#f0e3c2"; x.lineWidth = 5; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.stroke(); });
  const hotspots = [];
  function addHotspot(key, icon, pos, camPos, lookAt) {
    const mk = (map, ro) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, fog: false })); sp.position.copy(pos); sp.renderOrder = ro; scene.add(sp); return sp; };
    const f = lookAt.clone().sub(camPos).normalize();
    hotspots.push({ key, pos, sp: mk(markerTex(icon), 6), ring: mk(ringTex(), 5), cam: { pos: camPos, yaw: Math.atan2(-f.x, -f.z), pitch: Math.asin(f.y) } });
  }
  { // Genia on the south bench (the seated woman)
    const t = benches[7];
    addHotspot("genia", "person", P(20.95, t, 3.5), P(16.6, t - D(9), 1.6), P(20.95, t, 2.6));
  }
  { // a film camera on a tripod on the inner lawn, between the pool and the fence
    const tg = new THREE.Group(); tg.position.copy(P(13.2, D(250), 0)); scene.add(tg);
    for (let k = 0; k < 3; k++) { const a = k * 2.09; tg.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a) * .7, 0, Math.sin(a) * .7), new THREE.Vector3(0, 1.5, 0)]), inkA)); }
    mesh(new THREE.BoxGeometry(.9, .55, .6).translate(0, 1.8, 0), 0x3a332b, tg, { thresh: 20 });
    mesh(new THREE.CylinderGeometry(.18, .22, .5, 10).rotateZ(Math.PI / 2).translate(.7, 1.82, 0), 0x2a2520, tg, { thresh: 40, sketchy: false });
    addHotspot("video", "play", P(13.2, D(250), 3.9), P(18.2, D(250) + D(13), 1.7), P(13.2, D(250), 4.2));
  }
  const card = $("card");
  let cardOpener = null;
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  function openCard(h) {
    const c = CARDS[h.key];
    let html = `<div class="head"><div><h2 id="card-title">${esc(c.title)}</h2>${c.by ? `<p class="by">${esc(c.by)}</p>` : ""}<p class="sub">${esc(c.sub)}</p></div><button class="x" id="card-x" aria-label="סגירה">✕</button></div>`;
    (c.figs || []).forEach((f) => { html += `<figure class="${f.port ? "port" : ""}"><img src="${f.src}" alt="${esc(f.alt)}"><figcaption>${esc(f.cap)}</figcaption></figure>`; });
    if (c.video) html += `<button class="vid" id="vid" aria-label="נגן את הפתיח" style="background-image:url(https://img.youtube.com/vi/${c.video}/hqdefault.jpg)"><span>▶</span></button>`;
    c.body.forEach((t) => { html += `<p>${esc(t)}</p>`; });
    html += `<ul class="links">${c.links.map((l) => `<li><a href="${l.u}" target="_blank" rel="noopener">${esc(l.t)} ↗</a></li>`).join("")}</ul>`;
    if (c.credit) html += `<p class="credit">${esc(c.credit)}</p>`;
    card.innerHTML = html; card.scrollTop = 0; card.hidden = false; $("veil").hidden = false; $("notes").hidden = true;
    $("card-x").addEventListener("click", closeCard); $("card-x").focus({ preventScroll: true });
    const v = $("vid");
    if (v) v.addEventListener("click", () => { v.outerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${c.video}?autoplay=1&rel=0" title="Here We Are, הפתיח" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; });
  }
  function closeCard() { card.hidden = true; $("veil").hidden = true; card.innerHTML = ""; }
  $("veil").addEventListener("click", closeCard);
  const goHome = () => { closeCard(); if (gyro.on || gyro.listening) gyroOff(); setView("in"); };
  $("home").addEventListener("click", goHome);
  $("home").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goHome(); } });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !card.hidden) closeCard(); });
  const ease = (u) => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  function flyTo(h) {
    closeCard(); if (gyro.on || gyro.listening) gyroOff();
    const f = new THREE.Vector3(); camera.getWorldDirection(f);
    const from = { pos: rig.position.clone(), yaw: Math.atan2(-f.x, -f.z), pitch: Math.asin(clamp(f.y, -1, 1)), fov: camera.fov };
    cam.mode = "fp"; rig.rotation.set(0, 0, 0); look.yaw = from.yaw; look.pitch = from.pitch; setPressed(null); $("hint").textContent = HINT;
    let dy = h.cam.yaw - from.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    flight = { t0: performance.now(), dur: reduce ? 1 : 1300, from, to: { pos: h.cam.pos, yaw: from.yaw + dy, pitch: h.cam.pitch, fov: 58 }, h };
  }
  function handleTap(x, y) {
    camera.updateMatrixWorld(); let best = null, bd = 44;
    hotspots.forEach((h) => {
      const v = h.pos.clone().project(camera); if (v.z > 1) return;
      const d = Math.hypot((v.x + 1) / 2 * innerWidth - x, (1 - v.y) / 2 * innerHeight - y);
      if (d < bd) { bd = d; best = h; }
    });
    if (best) flyTo(best);
  }
  document.querySelectorAll("[data-spot]").forEach((b) => b.addEventListener("click", () => flyTo(hotspots.find((h) => h.key === b.dataset.spot))));

  // paper grain
  function grain() {
    const g = $("grain"), w = g.width = 256, h = g.height = 256, x = g.getContext("2d"), im = x.createImageData(w, h);
    for (let i = 0; i < im.data.length; i += 4) { const v = 215 + Math.random() * 40; im.data[i] = v; im.data[i + 1] = v - 4; im.data[i + 2] = v - 12; im.data[i + 3] = 255; }
    x.putImageData(im, 0, 0); g.style.width = "100%"; g.style.height = "100%"; g.style.imageRendering = "auto";
  }

  // ---------- loop ----------
  function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); }
  addEventListener("resize", resize);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (flight) {
      const u = clamp((now - flight.t0) / flight.dur, 0, 1), e = ease(u), a = flight.from, b = flight.to;
      rig.position.lerpVectors(a.pos, b.pos, e); look.yaw = a.yaw + (b.yaw - a.yaw) * e; look.pitch = a.pitch + (b.pitch - a.pitch) * e;
      camera.fov = a.fov + (b.fov - a.fov) * e; camera.updateProjectionMatrix();
      if (u >= 1) { const h = flight.h; flight = null; openCard(h); }
    }
    if (cam.mode === "orbit") applyOrbit(); else if (gyro.on && gyro.e) applyGyro(); else camera.rotation.set(look.pitch, look.yaw, 0);
    if (!reduce) {
      waterMat.uniforms.uT.value += dt;
      for (let i = 0; i < JET; i++) {
        const p = jet[i]; p.t += dt; let y = p.v * p.t - 4.9 * p.t * p.t;
        if (y < .3 && p.t > .2) { p.t = 0; y = .9; }
        const sp = p.s * p.t * 1.3;
        jetPos[i * 3] = Math.cos(p.a) * sp; jetPos[i * 3 + 1] = Math.max(.35, y + .9); jetPos[i * 3 + 2] = Math.sin(p.a) * sp;
      }
      jetGeo.attributes.position.needsUpdate = true;
      traffic.forEach((c) => { c.t -= c.v / c.r * dt; c.g.position.copy(P(c.r, c.t, 0)); c.g.rotation.y = Math.PI - c.t; });
      walkers.forEach((w) => { w.t += w.w * dt / (w.r / 19); w.g.position.copy(P(w.r, w.t, 0)); w.g.rotation.y = w.w > 0 ? -w.t : Math.PI - w.t; });
    }
    sky.position.copy(rig.position);
    signs.forEach((sg) => {   // street signs always face the camera, stay dark and readable, and keep a sensible size
      sg.rotation.y = Math.atan2(rig.position.x - sg.position.x, rig.position.z - sg.position.z);
      const d = Math.hypot(rig.position.x - sg.position.x, rig.position.y - sg.position.y, rig.position.z - sg.position.z);
      sg.scale.setScalar(clamp(d / 45, .5, 2.6)); sg.userData.m.opacity = 1;
    });
    hotspots.forEach((h, i) => {
      const d = rig.position.distanceTo(h.pos), s = clamp(d * .05, 1.8, 9), ph = reduce ? 0 : ((now / 1000 + i * .6) % 1.8) / 1.8;
      h.sp.scale.set(s, s, 1); h.ring.scale.set(s * (1 + ph * .9), s * (1 + ph * .9), 1); h.ring.material.opacity = reduce ? .5 : .75 * (1 - ph);
    });
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  grain(); resize(); setView("in");
  traffic.forEach((c) => { c.g.position.copy(P(c.r, c.t, 0)); c.g.rotation.y = Math.PI - c.t; });
  walkers.forEach((w) => { w.g.position.copy(P(w.r, w.t, 0)); });
  requestAnimationFrame(frame);
})();
