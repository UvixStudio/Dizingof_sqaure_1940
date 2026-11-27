// ---------- opening: the plan is drawn, then the square grows out of it and the camera lands on the roof view ----------
  // About six seconds, once per visit; a tap skips it. ?intro shows it again, ?nointro never. Nothing is downloaded
  // for it: the plan is painted from the square's own measures and from the walls of the loaded model.
  // Growth is one patch on the vertex shaders: the ground spreads from the fountain, what stands on the island rises,
  // then the houses, clockwise. What has not appeared yet waits under the paper.
  var introOn = false;                                      // perf.js leaves the pixel ratio alone while this is true
  const INTRO = { t: 0, last: 0, done: false, parts: null };
  const INTRO_HOLD = (location.search.match(/[?&]introat=([0-9.]+)/) || [])[1];     // ?introat=2.8 holds one moment, to look at it
  const INTRO_END = 6,INTRO_PAPER = new THREE.Color(0xece3cc), INTRO_INK = "#4a3425";
  const uIntro = { value: 1 }, uIntroT = { value: 0 }, uIntroG = { value: 0 };
  const introStep = (a, b) => { const x = clamp((INTRO.t - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
  function introWanted() {
    if (INTRO.done || /[?&]nointro\b/.test(location.search)) return false;
    if (INTRO_HOLD || /[?&]intro\b/.test(location.search)) return true;
    if (reduce) return false;
    try { return !sessionStorage.getItem("kikarIntro"); } catch (e) { return true; }
  }

  // the same rise for the solid model and for its ink outline
  const INTRO_GLSL = `uniform float uIntroT;
    float introRise(vec3 w) {
      float r = length(w.xz);
      if (r < 46.8) { float x = clamp((uIntroT - (2.75 + r/47.0*0.7)) / 1.0, 0.0, 1.0); return x*x*(3.0 - 2.0*x); }
      float turn = fract(atan(w.x, -w.z) / 6.2831853);
      float x = clamp((uIntroT - (3.5 + turn*0.8 + clamp((r - 47.0)/300.0, 0.0, 0.25))) / 0.7, 0.0, 1.0);
      return x*x*(3.0 - 2.0*x);
    }`;
  function introPatch(m) {
    if (m.userData.intro || (!m.isMeshStandardMaterial && !m.isMeshLambertMaterial)) return;
    m.userData.intro = true;
    const before = m.onBeforeCompile, key = m.customProgramCacheKey();
    m.onBeforeCompile = (sh, r) => {
      if (before) before.call(m, sh, r);
      Object.assign(sh.uniforms, { uIntro, uIntroT, uIntroG });
      sh.vertexShader = "uniform float uIntro; uniform float uIntroG;\n" + INTRO_GLSL + "\n" + sh.vertexShader.replace("#include <project_vertex>", `#include <project_vertex>
        if (uIntro < 1.0) {
          vec4 iw = modelMatrix * vec4(transformed, 1.0);
          float rr = length(iw.xz);
          if (iw.y <= 0.3 && objectNormal.y > 0.7) {          // the ground (low and facing up): a disc spreading from the fountain
            if (rr > uIntroG) iw.xz *= uIntroG / max(rr, 0.001);
            if (uIntroG < 0.5) iw.y -= 4.0;
          } else {                                            // everything that stands, down to its foot
            float g = introRise(iw.xyz);
            if (iw.y > 0.3) iw.y = 0.3 + (iw.y - 0.3) * g;
            iw.y -= 4.0 * (1.0 - smoothstep(0.0, 0.04, g));
          }
          mvPosition = viewMatrix * iw; gl_Position = projectionMatrix * mvPosition;
        }`);
    };
    m.customProgramCacheKey = () => key + "-intro";
    m.needsUpdate = true;
  }

  // the plan: 256 metres square, 8 pixels to the metre
  function introPlan(root) {
    const c = document.createElement("canvas"); c.width = c.height = 2048;
    const x = c.getContext("2d"), X = (v) => (v + 128) * 8;
    x.fillStyle = "#" + INTRO_PAPER.getHexString(); x.fillRect(0, 0, 2048, 2048);
    x.strokeStyle = "rgba(74,52,37,.1)"; x.lineWidth = 1;
    for (let v = 0; v <= 2048; v += 64) { x.beginPath(); x.moveTo(v, 0); x.lineTo(v, 2048); x.moveTo(0, v); x.lineTo(2048, v); x.stroke(); }
    x.strokeStyle = INTRO_INK; x.lineCap = "round";
    const line = (ax, az, bx, bz) => { x.moveTo(X(ax), X(az)); x.lineTo(X(bx), X(bz)); };
    const ring = (cx, cz, r, w) => { x.lineWidth = w; x.beginPath(); x.arc(X(cx), X(cz), r * 8, 0, 7); x.stroke(); };
    [[8.4, 4], [9.3, 2], [16, 3], [16.5, 1.5], [26, 1.5], [33, 2.5], [36, 4], [44, 4], [44.5, 1.5]].forEach(([r, w]) => ring(0, 0, r, w));
    ring(0, 0, .8, 3);
    x.lineWidth = 1.5; x.beginPath();
    for (let k = 0; k < 32; k++) { const a = k * Math.PI / 16; line(Math.sin(a) * 8.4, Math.cos(a) * 8.4, Math.sin(a) * 9.3, Math.cos(a) * 9.3); }
    x.stroke();
    [348, 43, 98, 168, 225, 299].forEach((deg) => {          // the six streets: two kerbs and a broken middle line
      const s = Math.sin(D(deg)), k = -Math.cos(D(deg)), from = 44, to = 128;
      x.lineWidth = 3; x.beginPath();
      [-4.5, 4.5].forEach((o) => line(s * from - k * o, k * from + s * o, s * to - k * o, k * to + s * o));
      x.stroke();
      x.lineWidth = 1.5; x.setLineDash([18, 14]); x.beginPath(); line(s * 45, k * 45, s * to, k * to); x.stroke(); x.setLineDash([]);
    });
    root.updateMatrixWorld(true);
    x.lineWidth = 1.6; x.globalAlpha = .8; x.beginPath();    // every wall, seen from above
    root.traverse((o) => {
      if (!o.isMesh) return;
      const n = o.material.name;
      if (n === "wall_white" || n === "plaster") triangles(o).forEach((t) => {
        if (Math.abs(t.n.y) > .3) return;
        let a = t.v[0], b = t.v[1];
        [[t.v[1], t.v[2]], [t.v[2], t.v[0]]].forEach(([p, q]) => { if (Math.hypot(p.x - q.x, p.z - q.z) > Math.hypot(a.x - b.x, a.z - b.z)) { a = p; b = q; } });
        line(a.x, a.z, b.x, b.z);
      });
      else if (n === "hedge" || n === "grass") {             // beds and hedges of the garden
        const e = new THREE.EdgesGeometry(o.geometry, 35).attributes.position, a = new THREE.Vector3(), b = new THREE.Vector3();
        for (let i = 0; i < e.count; i += 2) {
          a.fromBufferAttribute(e, i).applyMatrix4(o.matrixWorld); b.fromBufferAttribute(e, i + 1).applyMatrix4(o.matrixWorld);
          if (Math.hypot(a.x, a.z) < 36 && Math.hypot(a.x - b.x, a.z - b.z) > .5) line(a.x, a.z, b.x, b.z);
        }
      }
    });
    x.stroke(); x.globalAlpha = 1;
    solids.forEach(([sx, sz, r]) => {                        // trees and lamps, as a draughtsman marks them
      if (r < .9) { ring(sx, sz, .45, 2); return; }
      const R = Math.min(2.6, r * .62); ring(sx, sz, R, 1.6); ring(sx, sz, .22, 2);
      x.lineWidth = 1; x.beginPath();
      for (let k = 0; k < 7; k++) { const a = k * .9 + sx; line(sx, sz, sx + Math.cos(a) * R, sz + Math.sin(a) * R); }
      x.stroke();
    });
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 8;
    return tex;
  }
  function introThings(root) {
    const uSweep = { value: 0 }, uWire = { value: 0 }, uPlan = { value: introPlan(root) };
    // the paper, with the blue radar hand that uncovers the drawing
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({
      uniforms: { uSweep, uPlan, uPaper: { value: INTRO_PAPER } }, fog: false,
      vertexShader: "varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: `precision highp float; uniform float uSweep; uniform sampler2D uPlan; uniform vec3 uPaper; varying vec2 vP;
        void main(){
          float r = length(vP), turn = fract(atan(vP.x, -vP.y) / 6.2831853), head = uSweep * 1.16, behind = head - turn;
          vec2 uv = vec2(vP.x/256.0 + 0.5, 0.5 - vP.y/256.0);
          vec3 col = uPaper;
          float inMap = step(abs(vP.x), 127.5) * step(abs(vP.y), 127.5);
          if (r < 9.6 || behind > 0.0) col = mix(uPaper, texture2D(uPlan, uv).rgb, inMap);
          float live = step(0.001, uSweep) * (1.0 - smoothstep(0.86, 1.0, uSweep)), fade = 1.0 - smoothstep(60.0, 105.0, r);
          vec3 blue = vec3(0.114, 0.165, 0.353);
          if (behind > 0.0 && behind < 0.16 && turn <= head) col = mix(col, blue, 0.34 * (1.0 - behind/0.16) * live * fade);
          float arc = abs(behind) * 6.2831853 * r;
          col = mix(col, blue, (1.0 - smoothstep(0.12, 0.34, arc)) * live * fade);
          if (r < 8.4) col = mix(col, blue, 0.5);                              // the pool is already water
          gl_FragColor = vec4(col, 1.0);
        }`
    }));
    paper.position.y = -.12; scene.add(paper);
    // the houses stand for a moment as ink, and give way as the solid ones rise
    const lines = [];
    root.traverse((o) => {
      if (!o.isMesh || o.material.name !== "wall_white") return;
      const e = new THREE.EdgesGeometry(o.geometry, 35).attributes.position, p = new THREE.Vector3();
      for (let i = 0; i < e.count; i++) { p.fromBufferAttribute(e, i).applyMatrix4(o.matrixWorld); lines.push(p.x, p.y, p.z); }
    });
    const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(lines, 3));
    const wire = new THREE.LineSegments(lg, new THREE.ShaderMaterial({
      uniforms: { uIntroT, uWire }, transparent: true, depthWrite: false,
      vertexShader: INTRO_GLSL + " varying float vA; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vA = 1.0 - introRise(w.xyz); gl_Position = projectionMatrix*viewMatrix*w; }",
      fragmentShader: "precision mediump float; uniform float uWire; varying float vA; void main(){ gl_FragColor = vec4(0.29, 0.2, 0.145, 0.55 * uWire * vA); }"
    }));
    wire.frustumCulled = false; scene.add(wire);
    const casting = [];
    scene.traverse((o) => { if (o.isMesh && o.castShadow) casting.push(o); });
    return { paper, wire, uSweep, uWire, casting, root, scales: movers.map((m) => m.o.scale.clone()) };
  }
  function introReady(root) {                               // behind the loading veil
    if (introOn || !introWanted()) return;
    renderer.shadowMap.needsUpdate = true; renderer.render(scene, camera);   // the shadow pass compiles now, not mid-air
    root.traverse((o) => { if (o.isMesh) introPatch(o.material); });
    INTRO.parts = introThings(root); introOn = true; INTRO.t = 0; uIntro.value = 0;
    renderer.initTexture(INTRO.parts.paper.material.uniforms.uPlan.value);
    INTRO.parts.casting.forEach((o) => { o.castShadow = false; });
    renderer.shadowMap.needsUpdate = true;
    document.body.classList.add("intro");
    const skip = document.createElement("p"); skip.className = "skip"; skip.textContent = "נגיעה לדילוג"; document.body.appendChild(skip); INTRO.parts.skip = skip;
    setView("roof"); introFrame(performance.now());
  }

  // the camera: close above the plan, a tilt, and one continuous way down into the roof view
  function introCamera() {
    const v = VIEWS.roof, dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(v.pitch, v.yaw, 0, "YXZ"));
    const reach = Math.max(10, v.pos.y / Math.max(.05, -dir.y)), home = v.pos.clone().addScaledVector(dir, reach), back = dir.clone().negate();
    const az = Math.atan2(back.x, back.z), el = Math.asin(clamp(back.y, -1, 1));
    const fit = (R) => R / (Math.tan(D(27.5)) * Math.min(1, camera.aspect * 1.5)), o = new THREE.Vector3();
    //        time  target  azimuth        elevation  distance          fov
    const K = [[0, o, az, D(88), Math.log(fit(27)), 55], [1.8, o, az, D(85), Math.log(fit(46)), 55],
               [2.8, o, az - D(9), D(53), Math.log(fit(49)), 55], [4.6, o, az - D(5), D(39), Math.log(fit(43)), 58],
               [INTRO_END, home, az, el, Math.log(reach), 70]];
    const t = clamp(INTRO.t, 0, INTRO_END);
    let i = 0; while (i < K.length - 2 && t > K[i + 1][0]) i++;
    const a = K[i], b = K[i + 1], h = b[0] - a[0], u = (t - a[0]) / h;
    const at = (get) => {                                    // smooth through the key moments, at rest at both ends
      const slope = (j) => j <= 0 || j >= K.length - 1 ? 0 : (get(K[j + 1]) - get(K[j - 1])) / (K[j + 1][0] - K[j - 1][0]);
      const p0 = get(a), p1 = get(b), m0 = slope(i) * h, m1 = slope(i + 1) * h, u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * p0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * p1 + (u3 - u2) * m1;
    };
    const target = new THREE.Vector3(at((k) => k[1].x), at((k) => k[1].y), at((k) => k[1].z));
    const A = at((k) => k[2]), E = Math.min(D(88), at((k) => k[3])), R = Math.exp(at((k) => k[4]));
    rig.rotation.set(0, 0, 0);
    rig.position.set(target.x + Math.sin(A) * Math.cos(E) * R, target.y + Math.sin(E) * R, target.z + Math.cos(A) * Math.cos(E) * R);
    const f = target.sub(rig.position).normalize();
    look.yaw = Math.atan2(-f.x, -f.z); look.pitch = Math.asin(clamp(f.y, -1, 1));
    camera.fov = at((k) => k[5]); camera.updateProjectionMatrix();
  }
  function introFrame(now) {                                 // before the camera is applied
    if (!introOn) return;
    if (INTRO.running) INTRO.t = Math.min(INTRO_END, INTRO.t + Math.min(.1, Math.max(0, now - INTRO.last) / 1000));
    INTRO.last = now;
    if (INTRO_HOLD) INTRO.t = Math.min(INTRO_END - .001, +INTRO_HOLD);
    const P3 = INTRO.parts;
    uIntroT.value = INTRO.t;
    const spread = introStep(2.45, 3.4), wide = clamp((INTRO.t - 3.4) / 1.1, 0, 1);
    uIntroG.value = INTRO.t < 3.4 ? 62 * spread : 62 * Math.pow(1700 / 62, wide);
    P3.uSweep.value = introStep(.12, 1.35); P3.uWire.value = introStep(2.2, 2.8);
    const sk = introStep(4.5, 5.7), dome = sky.children[0].material;
    dome.transparent = true; dome.opacity = sk;
    const col = INTRO_PAPER.clone().lerp(new THREE.Color(HAZE), introStep(4.3, 5.5));
    renderer.setClearColor(col, 1); scene.fog.color.copy(col);
    scene.fog.near = 600 - 490 * sk; scene.fog.far = 1600 - 1300 * sk;
    P3.paper.visible = INTRO.t < 4.9; P3.wire.visible = INTRO.t > 2.15 && INTRO.t < 5.4;
    if (INTRO.t > 5.15 && !P3.lit) { P3.lit = true; P3.casting.forEach((o) => { o.castShadow = true; }); renderer.shadowMap.needsUpdate = true; }
    introCamera(); sky.position.copy(rig.position);
    if (INTRO.t >= INTRO_END) introEnd();
  }
  function introShow() {                                     // last thing before drawing: what is not there yet
    if (!introOn) return;
    const late = INTRO.t > 5.45, come = introStep(5.05, 5.6), g = uIntroG.value;
    movers.forEach((m, i) => { const s = INTRO.parts.scales[i]; if (s) m.o.scale.copy(s).multiplyScalar(Math.max(.001, come)); if (come <= 0) m.o.visible = false; });
    casts.forEach((c) => { c.s.visible = late; });
    signs.forEach((s) => { s.visible = late; if (s.userData.stem) s.userData.stem.visible = late; });
    scene.children.forEach((o) => { if (o.userData.pad) o.visible = late; });
    hotspots.forEach((h) => { if (!late) h.sp.visible = h.ring.visible = false; });
    roadNames.forEach(([r]) => { r.visible = late; });
    if (NIGHT.cinema) NIGHT.cinema.all.visible = INTRO.t > 5.1;
    water.visible = g > .1; water.scale.set(Math.min(1, g / 8.4), 1, Math.min(1, g / 8.4));
    const up = introStep(4.5, 5.5); fountain.visible = up > 0; fountain.scale.set(1, Math.max(.001, up), 1);
  }
  function introStart() { if (introOn) { INTRO.running = true; INTRO.last = performance.now(); } }
  function introEnd() {
    if (!introOn) return;
    INTRO.t = INTRO_END; INTRO.done = true;
    uIntro.value = 1; uIntroG.value = 1700; uIntroT.value = INTRO_END;
    const P3 = INTRO.parts;
    [P3.paper, P3.wire].forEach((o) => { scene.remove(o); o.geometry.dispose(); o.material.dispose(); });
    P3.uWire.value = 0; P3.paper.material.uniforms.uPlan.value.dispose(); P3.skip.remove();
    P3.casting.forEach((o) => { o.castShadow = true; }); renderer.shadowMap.needsUpdate = true;
    const dome = sky.children[0].material; dome.opacity = 1; dome.transparent = false;
    renderer.setClearColor(HAZE, 1); scene.fog.color.set(HAZE); scene.fog.near = 110; scene.fog.far = 300;
    movers.forEach((m, i) => { if (P3.scales[i]) m.o.scale.copy(P3.scales[i]); m.o.visible = true; });
    casts.forEach((c) => { c.s.visible = true; });
    signs.forEach((s) => { s.visible = true; if (s.userData.stem) s.userData.stem.visible = true; });
    scene.children.forEach((o) => { if (o.userData.pad) o.visible = true; });
    roadNames.forEach(([r]) => { r.visible = true; });
    if (NIGHT.cinema) NIGHT.cinema.all.visible = true;
    water.visible = true; water.scale.set(1, 1, 1); fountain.visible = true; fountain.scale.set(1, 1, 1);
    introOn = false; INTRO.parts = null;
    document.body.classList.remove("intro");
    setView("roof"); showHint();
    try { sessionStorage.setItem("kikarIntro", "1"); } catch (e) { /* private window: it will play again */ }
  }
  // a tap or a key anywhere skips; the tap itself must not also walk or open something
  let introSwallow = 0;
  addEventListener("pointerdown", (e) => { if (!introOn || !INTRO.running) return; e.stopPropagation(); e.preventDefault(); introSwallow = performance.now(); introEnd(); }, true);
  ["pointerup", "click"].forEach((type) => addEventListener(type, (e) => { if (performance.now() - introSwallow < 450) { e.stopPropagation(); e.preventDefault(); } }, true));
  addEventListener("keydown", (e) => { if (introOn && INTRO.running) { e.stopPropagation(); introEnd(); } }, true);
