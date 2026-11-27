// ---------- night: the sky darkens, a full moon climbs over the roofs, warm lamps, coloured lights in the pool ----------
  // No real lights are added (phones): the day's two lights are turned down, lamp light is a painted map of the
  // ground that every material reads, and everything that glows is a sprite. Haaretz of 27.1.1938 saw the fountain
  // in coloured lights; which colours is not known, the four here are a choice.
  // One clock runs from day (0) to night (END): the sky turns first, then the lights come on one after another,
  // the moon jumps up from under the roofs and the clouds form around it. Going back, the same clock runs fast.
  const NIGHT = { on: false, T: 0, last: 0, raf: 0, root: null, el: .2, az: 0, made: false };
  const END = 3.2, BACK = .8;                               // seconds to full night, and back to day
  const stage = (at, dur) => { const x = clamp((NIGHT.T - at) / dur, 0, 1); return x * x * (3 - 2 * x); };
  const hop = (x) => { if (x <= 0) return 0; if (x >= 1) return 1; const u = x - 1; return 1 + 2.3 * u * u * u + 1.3 * u * u; };     // arrives a touch too high, settles
  const uNight = { value: 0 }, uNightT = { value: 0 }, uPool = { value: 0 }, uLampMap = { value: null }, uLampOn = { value: new THREE.Vector3() };
  const MOON_R = 430, MOON_D = 2 * MOON_R * Math.tan(D(1.9));            // about 3.8 degrees across: large, not a cartoon
  const GLSL_PAL = `vec3 pal(float t){ float s = fract(t)*4.0, f = smoothstep(0.0, 1.0, fract(s));
    vec3 c0 = vec3(1.0,.24,.2), c1 = vec3(1.0,.66,.2), c2 = vec3(.2,.9,.55), c3 = vec3(.28,.52,1.0);
    return s < 1.0 ? mix(c0,c1,f) : s < 2.0 ? mix(c1,c2,f) : s < 3.0 ? mix(c2,c3,f) : mix(c3,c0,f); }`;
  const PAL = [0xff3d33, 0xffa833, 0x33e68c, 0x4785ff].map((c) => new THREE.Color(c));
  const pal = (t, out) => { const s = (((t % 1) + 1) % 1) * 4, i = Math.floor(s), f = s - i; return out.copy(PAL[i % 4]).lerp(PAL[(i + 1) % 4], f * f * (3 - 2 * f)); };
  const nEase = (x) => x * x * (3 - 2 * x);
  const paintedTex = (w, h, draw) => { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d")); return new THREE.CanvasTexture(c); };
  const glowTex = (stops) => paintedTex(128, 128, (x) => { const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); stops.forEach(([at, c]) => g.addColorStop(at, c)); x.fillStyle = g; x.fillRect(0, 0, 128, 128); });
  const glowSprite = (map, color, w, h, order) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, color, transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending })); s.scale.set(w, h, 1); s.renderOrder = order; return s; };
  function seeded(n) { let s = n; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

  function moonThings() {                                   // moon, halo, thin clouds and stars ride with the sky dome
    const rnd = seeded(1938);
    const face = paintedTex(256, 256, (x) => {
      x.save(); x.beginPath(); x.arc(128, 128, 124, 0, 7); x.clip();
      const g = x.createRadialGradient(112, 108, 10, 128, 128, 126); g.addColorStop(0, "#fffbee"); g.addColorStop(.75, "#f3ead2"); g.addColorStop(1, "#d9cfb6");
      x.fillStyle = g; x.fillRect(0, 0, 256, 256);
      const blot = (cx, cy, rx, ry, a) => { x.save(); x.translate(cx, cy); x.scale(rx, ry); const b = x.createRadialGradient(0, 0, 0, 0, 0, 1); b.addColorStop(0, "rgba(128,126,122," + a + ")"); b.addColorStop(.6, "rgba(128,126,122," + a * .75 + ")"); b.addColorStop(1, "rgba(128,126,122,0)"); x.fillStyle = b; x.beginPath(); x.arc(0, 0, 1, 0, 7); x.fill(); x.restore(); };
      [[92, 76, 40, 32, .5], [138, 70, 26, 22, .46], [162, 100, 30, 26, .5], [178, 132, 18, 24, .42], [66, 118, 30, 46, .38], [104, 148, 26, 20, .3], [152, 158, 14, 14, .26], [196, 88, 11, 15, .4]].forEach((b) => blot(...b));
      for (let i = 0; i < 240; i++) blot(rnd() * 256, rnd() * 256, 1.5 + rnd() * 6, 1.5 + rnd() * 6, .06 + rnd() * .14);
      x.fillStyle = "rgba(255,253,244,.8)"; x.beginPath(); x.arc(112, 204, 4, 0, 7); x.fill();
      x.restore();
    });
    const wisps = paintedTex(512, 192, (x) => {
      for (let i = 0; i < 110; i++) {
        const cx = 70 + rnd() * 372, cy = 96 + (rnd() - .5) * 70 + Math.sin(cx / 60) * 14, rx = 24 + rnd() * 62, ry = 3 + rnd() * 9;
        x.save(); x.translate(cx, cy); x.scale(rx, ry);
        const g = x.createRadialGradient(0, 0, 0, 0, 0, 1); g.addColorStop(0, "rgba(176,190,226," + (.05 + rnd() * .1) + ")"); g.addColorStop(1, "rgba(176,190,226,0)");
        x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, 7); x.fill(); x.restore();
      }
    });
    const halo = glowSprite(glowTex([[0, "rgba(190,208,255,.55)"], [.22, "rgba(170,192,250,.26)"], [1, "rgba(150,175,240,0)"]]), 0xffffff, MOON_D * 4.6, MOON_D * 4.6, -9);
    const disc = new THREE.Sprite(new THREE.SpriteMaterial({ map: face, transparent: true, opacity: 0, depthWrite: false, fog: false })); disc.scale.set(MOON_D, MOON_D, 1); disc.renderOrder = -8;
    const cloud = new THREE.Sprite(new THREE.SpriteMaterial({ map: wisps, transparent: true, opacity: 0, depthWrite: false, fog: false })); cloud.scale.set(MOON_D * 6.4, MOON_D * 2.4, 1); cloud.renderOrder = -7;
    const pos = new Float32Array(420 * 3);
    for (let i = 0; i < 420; i++) { const a = rnd() * 6.283, y = .07 + rnd() * .9, r = Math.sqrt(1 - y * y); pos.set([Math.cos(a) * r * 460, y * 460, Math.sin(a) * r * 460], i * 3); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xdde5ff, map: glowTex([[0, "rgba(255,255,255,1)"], [.35, "rgba(255,255,255,.85)"], [1, "rgba(255,255,255,0)"]]), size: 3 * Math.min(2, devicePixelRatio || 1), sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false }));
    stars.renderOrder = -9.5; stars.frustumCulled = false;
    [stars, halo, disc, cloud].forEach((o) => sky.add(o));
    Object.assign(NIGHT, { disc, halo, cloud, stars });
    // coloured projectors lying in the pool
    const spot = glowTex([[0, "rgba(255,255,255,1)"], [.2, "rgba(255,255,255,.55)"], [1, "rgba(255,255,255,0)"]]);
    NIGHT.spots = Array.from({ length: 8 }, (_, i) => { const s = glowSprite(spot, 0xffffff, 2.3, 1.15, 2); const a = i * Math.PI / 4; s.position.set(Math.cos(a) * 3.1, WATER_Z + .22, Math.sin(a) * 3.1); scene.add(s); return s; });
    // the fountain's drops take the colour of the light under them; the water does the same
    fountain.material.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, { uPool, uNightT });
      sh.vertexShader = "uniform float uNightT; varying vec3 vTint;\n" + GLSL_PAL + "\n" + sh.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>
        float rr = length(position.xz), turn = atan(position.z, position.x + .0001) / 6.2832;
        vec3 tint = rr < 1.1 ? pal(uNightT*.045 + .5 + position.y*.035) : pal(turn + uNightT*.045);
        vTint = tint * mix(1.25, .55, smoothstep(0.0, 8.5, position.y));`);
      sh.fragmentShader = "uniform float uPool; varying vec3 vTint;\n" + sh.fragmentShader.replace("vec4 diffuseColor = vec4( diffuse, opacity );", "vec4 diffuseColor = vec4( mix(diffuse, vTint, uPool), opacity );");
    };
    fountain.material.needsUpdate = true;
    Object.assign(waterMat.uniforms, { uNight, uNightT, uPool });
    waterMat.fragmentShader = waterMat.fragmentShader.replace("uniform float uT;", "uniform float uT; uniform float uNight; uniform float uNightT; uniform float uPool;\n" + GLSL_PAL + "\n")
      .replace("gl_FragColor = vec4(col, 1.0);", `if (uNight > 0.0) {
        vec3 dark = col * vec3(.09,.14,.27);
        for (int k = 0; k < 8; k++) { float a = float(k)*.7854; vec2 d = p - vec2(cos(a), sin(a))*3.1; float d2 = dot(d, d);
          dark += pal(float(k)/8.0 + uNightT*.045) * (exp(-d2*.85)*.62 + exp(-d2*7.0)*.55) * (.9 + .1*c) * uPool; }
        dark += pal(uNightT*.045 + .5) * exp(-r*r*.55) * .6 * uPool;
        col = mix(col, dark, uNight);
      }
      gl_FragColor = vec4(col, 1.0);`);
    waterMat.needsUpdate = true;
    NIGHT.made = true;
  }

  // ---------- a town that is not blacked out: lit shop fronts, the cinema, windows here and there ----------
  const ROOM_TONES = [[1, .72, .4], [1, .8, .52], [1, .64, .32], [.96, .86, .66]];
  function triangles(o, keep) {                             // world triangles of one mesh, with their normals
    const g = o.geometry, p = g.attributes.position, ix = g.index, n = (ix ? ix.count : p.count) / 3, out = [];
    for (let t = 0; t < n; t++) {
      const v = [0, 1, 2].map((q) => new THREE.Vector3().fromBufferAttribute(p, ix ? ix.getX(t * 3 + q) : t * 3 + q).applyMatrix4(o.matrixWorld));
      const nm = new THREE.Vector3().subVectors(v[2], v[1]).cross(v[0].clone().sub(v[1])), area = nm.length() / 2;
      if (area > 1e-4 && (!keep || keep(v))) out.push({ v, n: nm.normalize(), area });
    }
    return out;
  }
  function joined(tris) {                                   // triangles that share a corner are one pane
    const parent = tris.map((_, i) => i), find = (i) => parent[i] === i ? i : (parent[i] = find(parent[i])), seen = new Map();
    tris.forEach((t, i) => t.v.forEach((v) => { const k = Math.round(v.x * 50) + "," + Math.round(v.y * 50) + "," + Math.round(v.z * 50); if (seen.has(k)) parent[find(i)] = find(seen.get(k)); else seen.set(k, i); }));
    const groups = new Map();
    tris.forEach((t, i) => { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(t); });
    return [...groups.values()];
  }
  const roomTex = () => paintedTex(256, 64, (x) => {        // four rooms side by side: bare, curtains, blinds, someone inside
    for (let k = 0; k < 4; k++) {
      const a = k * 64, g = x.createRadialGradient(a + 32, 24, 4, a + 32, 30, 48); g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#9a9a9a"); x.fillStyle = g; x.fillRect(a, 0, 64, 64);
      x.fillStyle = "rgba(0,0,0,.45)";
      if (k === 1) { x.beginPath(); x.moveTo(a, 0); x.lineTo(a + 24, 0); x.quadraticCurveTo(a + 8, 30, a + 14, 64); x.lineTo(a, 64); x.fill(); x.beginPath(); x.moveTo(a + 64, 0); x.lineTo(a + 40, 0); x.quadraticCurveTo(a + 56, 30, a + 50, 64); x.lineTo(a + 64, 64); x.fill(); }
      if (k === 2) for (let y = 2; y < 40; y += 6) x.fillRect(a, y, 64, 2.5);
      if (k === 3) { x.beginPath(); x.arc(a + 42, 34, 8, 0, 7); x.fill(); x.beginPath(); x.ellipse(a + 42, 62, 14, 20, 0, 0, 7); x.fill(); }
      x.fillStyle = "rgba(0,0,0,.62)"; x.fillRect(a + 30.5, 0, 3, 64); x.fillRect(a, 17, 64, 2.5); x.fillRect(a, 0, 2, 64); x.fillRect(a + 62, 0, 2, 64);
    }
  });
  function cityLights(root, spill) {
    const rnd = seeded(2611), glass = [], walls = [], moving = new Set();
    movers.forEach((m) => m.o.traverse((c) => moving.add(c)));
    const shops = new Map(), signs = new Map();
    root.traverse((o) => {
      if (!o.isMesh || moving.has(o)) return;
      const name = o.material.name;
      if (name === "glass") glass.push(...triangles(o, (v) => Math.hypot(v[0].x, v[0].z) > 45.5));
      else if (name === "plaster" || name === "wall_white") walls.push(...triangles(o, (v) => Math.hypot(v[0].x, v[0].z) > 62));
      else if (name.indexOf("shop_") === 0) {
        const m = o.material;
        shops.set(m, m.userData.day || (m.userData.day = m.emissive.clone()));
        triangles(o).forEach((t) => {
          if (Math.abs(t.n.y) > .3) return;
          const x = (t.v[0].x + t.v[1].x + t.v[2].x) / 3, z = (t.v[0].z + t.v[1].z + t.v[2].z) / 3;
          spill.push([x + t.n.x * 1.5, z + t.n.z * 1.5]);
        });
      } else if (/^(poster|poster_four|signs)$/.test(name) && o.material.map) signs.set(o.material, name === "signs" ? .24 : name === "poster_four" ? .62 : .5);
      else if (name === "cine_sign") NIGHT.letters = o.material;
    });
    signs.forEach((_, m) => { if (!m.emissiveMap) { m.emissiveMap = m.map; m.needsUpdate = true; } });       // black by day, so nothing shows
    const pos = [], uv = [], col = [], rooms = [];
    const quad = (c, t, n, w, h, offs, tone, level, variant, upper) => {          // one room: a quad on each face given
      const room = { at: pos.length / 3, count: offs.length * 6, tone, level, now: level, upper, on: 1.5 + rnd() * 1.3 }, u0 = variant / 4 + .002, u1 = u0 + .246;
      offs.forEach((off) => [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]].forEach(([i, j]) => {
        pos.push(c.x + t.x * i * w / 2 + n.x * off, c.y + j * h / 2, c.z + t.z * i * w / 2 + n.z * off);
        uv.push(i < 0 ? u0 : u1, j < 0 ? 0 : 1); col.push(0, 0, 0);
      }));
      rooms.push(room);
    };
    const tone = () => ROOM_TONES[rnd() < .1 ? 3 : Math.floor(rnd() * 3)];
    const glassBand = (ts, y0, y1) => {
      const room = { at: pos.length / 3, count: 0, tone: ROOM_TONES[0], level: .72, now: .72, upper: false, on: 1.9 };
      ts.forEach((tr) => {
        if (Math.abs(tr.n.y) > .3) return;
        const mx = (tr.v[0].x + tr.v[1].x + tr.v[2].x) / 3, mz = (tr.v[0].z + tr.v[1].z + tr.v[2].z) / 3, out = tr.n.x * mx + tr.n.z * mz < 0 ? 2 : -2;
        spill.push([mx + tr.n.x * out, mz + tr.n.z * out]);               // toward the square
        [.03, -.03].forEach((off) => tr.v.forEach((v) => {
          pos.push(v.x + tr.n.x * off, v.y, v.z + tr.n.z * off); uv.push(.07, .2 + .65 * (v.y - y0) / (y1 - y0 || 1)); col.push(0, 0, 0); room.count++;
        }));
      });
      if (room.count) rooms.push(room);
    };
    joined(glass).forEach((ts) => {
      const pts = ts.flatMap((t) => t.v), ys = pts.map((p) => p.y), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const main = ts.reduce((a, b) => Math.abs(b.n.y) < .3 && (Math.abs(a.n.y) >= .3 || b.area > a.area) ? b : a, ts[0]);
      const n = main.n.clone().setY(0).normalize(), t = new THREE.Vector3(-n.z, 0, n.x);
      const along = pts.map((p) => p.dot(t)), deep = pts.map((p) => p.dot(n)), w = Math.max(...along) - Math.min(...along), d = Math.max(...deep) - Math.min(...deep);
      if (w > 3.2 && y0 < 3) { glassBand(ts, y0, y1); return; }            // the cinema lobby and other long glass at street level
      if (w > 3.2 || d > .7 || y1 - y0 > 2.4 || w < .35 || y1 - y0 < .6) return;      // otherwise single windows only
      const c = t.clone().multiplyScalar((Math.max(...along) + Math.min(...along)) / 2).addScaledVector(n, (Math.max(...deep) + Math.min(...deep)) / 2).setY((y0 + y1) / 2);
      const level = rnd() < (y0 > 4 ? .34 : .6) ? .55 + rnd() * .35 : 0;
      quad(c, t, n, w * .9, (y1 - y0) * .9, [d / 2 + .035, -d / 2 - .035], tone(), level, Math.floor(rnd() * 4), y0 > 4);
    });
    // the houses further out have blank walls: a few windows are painted on them with light alone
    const taken = new Set();
    walls.forEach((tr) => {
      if (Math.abs(tr.n.y) > .2) return;
      const n = tr.n.clone().setY(0).normalize(), t = new THREE.Vector3(-n.z, 0, n.x);
      const u = tr.v.map((v) => v.dot(t)), y = tr.v.map((v) => v.y), lo = Math.min(...u), hi = Math.max(...u), top = Math.max(...y), plane = tr.v[0].dot(n);
      if (hi - lo < 3) return;
      const side = (a, b, px, py) => (u[b] - u[a]) * (py - y[a]) - (y[b] - y[a]) * (px - u[a]);
      for (let px = Math.ceil(lo / 3.4) * 3.4; px < hi - .9; px += 3.4) {
        if (px < lo + .9) continue;
        for (let py = 2; py < top - 1; py += 3.2) {
          const a = side(0, 1, px, py), b = side(1, 2, px, py), c = side(2, 0, px, py);
          if (!((a >= 0 && b >= 0 && c >= 0) || (a <= 0 && b <= 0 && c <= 0))) continue;
          const key = Math.round(px) + "," + Math.round(py) + "," + Math.round(plane);
          if (taken.has(key)) continue;
          taken.add(key);
          const ground = py < 3, lit = rnd() < (ground ? .22 : .17);
          if (!lit && rnd() > .04) continue;                // a few dark ones are kept too: they may come on later
          const at = t.clone().multiplyScalar(px).addScaledVector(n, plane).setY(py);
          quad(at, t, n, ground ? 2.2 : 1.05, ground ? 1.7 : 1.35, [.06], tone(), lit ? .4 + rnd() * .3 : 0, Math.floor(rnd() * 3), !ground);
        }
      }
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: roomTex(), vertexColors: true, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    mesh.frustumCulled = false; mesh.visible = false;
    if (NIGHT.rooms) scene.remove(NIGHT.rooms.mesh);
    scene.add(mesh);
    NIGHT.rooms = { mesh, list: rooms, next: 0, turning: [] };
    cinemaLights(root);
    rooms.forEach(paintRoom);
    Object.assign(NIGHT, { shops, signs });
  }
  // three thin arms reach out from the cinema's roof with a small projector each: a gentle warm wash on the sign and the poster
  function cinemaLights(root) {
    const middle = (name) => { const box = new THREE.Box3(); let first = null; root.traverse((o) => { if (o.isMesh && o.material.name === name) triangles(o).forEach((t) => { t.v.forEach((v) => box.expandByPoint(v)); first = first || t; }); }); return first && { box, at: box.getCenter(new THREE.Vector3()), n: first.n }; };
    if (NIGHT.cinema) scene.remove(NIGHT.cinema.all);
    NIGHT.cinema = null;
    const sign = middle("cine_sign"), onWall = middle("cine_shadow");
    if (!sign || !onWall) return;
    const n = sign.n.clone().setY(0).normalize();
    if (n.dot(sign.at) > 0) n.negate();                    // toward the square
    const t = new THREE.Vector3(-n.z, 0, n.x), wall = onWall.at.dot(n), mid = sign.at.dot(t), roof = sign.box.max.y - 1;
    const point = (along, y, out) => t.clone().multiplyScalar(mid + along).addScaledVector(n, wall + out).setY(y);
    const all = new THREE.Group(); scene.add(all);
    const iron = new THREE.MeshLambertMaterial({ color: 0x25332d });
    const lens = new THREE.MeshBasicMaterial({ color: 0x4a4438 });
    const rod = (a, b, r) => {
      const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, d.length(), 8), iron);
      m.position.copy(a).addScaledVector(d, .5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); m.castShadow = true; all.add(m); return m;
    };
    const glow = glowTex([[0, "rgba(255,214,160,.95)"], [.25, "rgba(255,178,100,.35)"], [1, "rgba(255,160,80,0)"]]), heads = [];
    [-1.75, 0, 1.75].forEach((o) => {
      const foot = point(o, roof - .2, -.45), knee = point(o, roof + 1.55, -.45), tip = point(o, roof + 1.8, 2.2), aim = point(o * .7, 11.5, 0);
      rod(foot, knee, .045); rod(knee, tip, .035);
      const dir = aim.clone().sub(tip).normalize();
      const can = new THREE.Mesh(new THREE.CylinderGeometry(.2, .09, .36, 14, 1, true), iron); can.material.side = THREE.DoubleSide;
      can.position.copy(tip).addScaledVector(dir, .1); can.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); all.add(can);
      const face = new THREE.Mesh(new THREE.CircleGeometry(.17, 14), lens);
      face.position.copy(tip).addScaledVector(dir, .27); face.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir); all.add(face);
      const h = glowSprite(glow, 0xffffff, 1.15, 1.15, 3); h.position.copy(tip).addScaledVector(dir, .36); all.add(h); heads.push(h);
    });
    const washTex = paintedTex(256, 512, (x) => {
      x.fillStyle = "#000"; x.fillRect(0, 0, 256, 512); x.globalCompositeOperation = "lighter";
      [58, 128, 198].forEach((cx) => { x.save(); x.translate(cx, 150); x.scale(1, 3.1); const g = x.createRadialGradient(0, 0, 0, 0, 0, 74); g.addColorStop(0, "rgba(255,255,255,.5)"); g.addColorStop(.5, "rgba(255,255,255,.24)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(-90, -90, 180, 180); x.restore(); });
    });
    const low = 4.6, high = roof - .05, wash = new THREE.Mesh(new THREE.PlaneGeometry(6.2, high - low),
      new THREE.MeshBasicMaterial({ map: washTex, color: 0xffb168, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    wash.position.copy(point(0, (low + high) / 2, .035)); wash.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); all.add(wash);
    renderer.shadowMap.needsUpdate = true;
    NIGHT.cinema = { all, heads, wash, lens };
  }

  function paintRoom(r) {
    const c = NIGHT.rooms.mesh.geometry.attributes.color, v = r.now * stage(r.on, .16);
    for (let i = 0; i < r.count; i++) c.setXYZ(r.at + i, r.tone[0] * v, r.tone[1] * v, r.tone[2] * v);
    c.needsUpdate = true;
  }
  // every few seconds, somewhere, one window quietly comes on or goes out
  function someoneAtHome(t, dt) {
    const R = NIGHT.rooms;
    if (t > R.next) {
      if (R.next) {
        const round = Math.random() < .75;                   // mostly in the houses on the square, where it can be seen
        const ups = R.list.filter((r) => r.upper && (!round || r.count === 12)), r = ups[Math.floor(Math.random() * ups.length)];
        if (r) { r.level = r.level ? 0 : .6 + Math.random() * .25; R.turning.push(r); }
      }
      R.next = t + 5 + Math.random() * 7;
    }
    R.turning = R.turning.filter((r) => { r.now += Math.sign(r.level - r.now) * Math.min(Math.abs(r.level - r.now), dt * .7); paintRoom(r); return r.now !== r.level; });
  }

  function lampThings(root) {                               // find the lamp globes in the model, paint their light, hang a halo on each
    root.updateMatrixWorld(true);
    const heads = [], v = new THREE.Vector3(), mats = new Set(), globes = new Set();
    root.traverse((o) => {
      if (!o.isMesh) return;
      mats.add(o.material);
      if (o.material.name !== "globe") return;
      globes.add(o.material);
      const p = o.geometry.attributes.position;
      for (let i = 0; i < p.count; i++) {
        v.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(o.matrixWorld);
        let h = heads.find((h) => Math.hypot(h.x / h.n - v.x, h.z / h.n - v.z) < 1.2);
        if (!h) heads.push(h = { x: 0, y: 0, z: 0, n: 0 });
        h.x += v.x; h.y += v.y; h.z += v.z; h.n++;
      }
    });
    const spill = [];
    cityLights(root, spill);
    const place = (h) => ({ x: h.x / h.n, y: h.y / h.n, z: h.z / h.n });
    const around = heads.map(place).filter((h) => Math.hypot(h.x, h.z) < 40).sort((a, b) => Math.atan2(a.x, -a.z) - Math.atan2(b.x, -b.z));
    const away = heads.map(place).filter((h) => Math.hypot(h.x, h.z) >= 40).sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z));
    const half = Math.ceil(around.length / 2), waves = [around.slice(0, half), around.slice(half), away], WAVE = [.75, 1.05, 1.35];
    const ink = (wave, a) => "rgba(" + (wave === 0 ? 255 : 0) + "," + (wave === 1 ? 255 : 0) + "," + (wave === 2 ? 255 : 0) + "," + a + ")";
    uLampMap.value = paintedTex(1024, 1024, (x) => {        // 256 m across, centred on the fountain
      x.fillStyle = "#000"; x.fillRect(0, 0, 1024, 1024); x.globalCompositeOperation = "lighter";
      const pool = (wx, wz, R, wave, stops) => {
        const cx = (wx + 128) * 4, cy = (wz + 128) * 4, g = x.createRadialGradient(cx, cy, 0, cx, cy, R);
        stops.forEach(([at, a]) => g.addColorStop(at, ink(wave, a))); x.fillStyle = g; x.fillRect(cx - R, cy - R, R * 2, R * 2);
      };
      waves.forEach((list, w) => list.forEach((h) => pool(h.x, h.z, h.y * 15, w, [[0, .46], [.25, .36], [.5, .21], [.76, .08], [1, 0]])));
      [0, 1].forEach((w) => pool(0, 0, 220, w, [[0, .075], [.7, .075], [1, 0]]));       // the square itself is never quite dark
      spill.forEach(([sx, sz]) => pool(sx, sz, 17, 2, [[0, .13], [.55, .055], [1, 0]]));   // light falling out of the shop windows
    });
    if (NIGHT.lamps) scene.remove(NIGHT.lamps);
    NIGHT.lamps = new THREE.Group(); scene.add(NIGHT.lamps);
    const soft = glowTex([[0, "rgba(255,184,104,.66)"], [.16, "rgba(255,164,80,.34)"], [.5, "rgba(255,148,62,.09)"], [1, "rgba(255,140,56,0)"]]);      // amber, never a white glare
    waves.forEach((list, w) => list.forEach((h, j) => {
      const s = glowSprite(soft, 0xffffff, 2.9, 2.9, 3); s.position.set(h.x, h.y, h.z); s.userData.at = WAVE[w] - .08 + .3 * j / list.length; NIGHT.lamps.add(s);
    }));
    mats.forEach((m) => {
      if (!m.isMeshStandardMaterial && !m.isMeshLambertMaterial) return;
      const before = m.onBeforeCompile, key = m.name.indexOf("leafcard") === 0 ? "lamp-leaf" : "lamp";
      m.onBeforeCompile = (sh, r) => {
        if (before) before.call(m, sh, r);
        Object.assign(sh.uniforms, { uNight, uLampMap, uLampOn });
        sh.vertexShader = "varying vec3 vLampW;\n" + sh.vertexShader.replace("#include <project_vertex>", "#include <project_vertex>\n vLampW = (modelMatrix * vec4(transformed, 1.0)).xyz;");
        sh.fragmentShader = "uniform float uNight; uniform sampler2D uLampMap; uniform vec3 uLampOn; varying vec3 vLampW;\n" + sh.fragmentShader.replace("#include <tonemapping_fragment>",
          `if (uNight > 0.0) {
             float lampLit = min(.72, dot(texture2D(uLampMap, vec2(vLampW.x/256.0 + .5, .5 - vLampW.z/256.0)).rgb, uLampOn)) * (1.0 - smoothstep(3.8, 8.5, vLampW.y));
             gl_FragColor.rgb += (diffuseColor.rgb*.82 + .025) * vec3(1.0,.64,.34) * lampLit;
           }
           #include <tonemapping_fragment>`);
      };
      m.customProgramCacheKey = () => key;
      m.needsUpdate = true;
    });
    Object.assign(NIGHT, { root, globes: [...globes], glowing: [...mats].filter((m) => m.isMeshLambertMaterial && m.emissiveMap) });
  }

  const DAY = { haze: new THREE.Color(HAZE), tint: new THREE.Color(.12, .165, .31), sky: new THREE.Color(0xeaf2fb), ground: new THREE.Color(0xb4b0a6), sun: new THREE.Color(0xffedd2) };
  const DARK = { sky: new THREE.Color(0x8497d0), ground: new THREE.Color(0x4c475a), moon: new THREE.Color(0x9fb2ea), globe: new THREE.Color(.74, .46, .2), shop: new THREE.Color(1.08, .9, .66) };
  const mixed = new THREE.Color(), white = new THREE.Color(1, 1, 1);
  function nightPaint() {
    const k = stage(0, .8), pool = stage(2.1, .7), lit = k > 0;
    uNight.value = k; uPool.value = pool; uLampOn.value.set(stage(.75, .3), stage(1.05, .3), stage(1.35, .35));
    const dome = sky.children[0].material;
    if (dome.map) dome.color.copy(white).lerp(DAY.tint, k);
    mixed.copy(DAY.haze).multiply(white.clone().lerp(DAY.tint, k));
    scene.fog.color.copy(mixed); renderer.setClearColor(mixed, 1);
    scene.children.forEach((o) => { if (o.isHemisphereLight) { o.color.copy(DAY.sky).lerp(DARK.sky, k); o.groundColor.copy(DAY.ground).lerp(DARK.ground, k); o.intensity = .56 + .08 * k; } });
    sun.color.copy(DAY.sun).lerp(DARK.moon, k); sun.intensity = .88 - .48 * k;
    if (casts[0]) casts[0].s.material.opacity = .38 - .26 * k;
    roadNames.forEach(([r]) => r.material.color.setScalar(1 - .58 * k));
    NIGHT.glowing.forEach((g) => { if (g.emissive.r > .9) g.emissiveIntensity = .3 - .08 * k; });          // the street-name blades
    NIGHT.globes.forEach((g) => g.emissive.copy(DARK.globe).multiplyScalar(uLampOn.value.x));
    NIGHT.lamps.children.forEach((s) => { const v = stage(s.userData.at, .14); s.material.opacity = .8 * v; s.visible = v > 0; });
    let i = 0;
    NIGHT.shops.forEach((day, g) => g.emissive.copy(day).lerp(DARK.shop, stage(1.35 + .045 * i++, .22)));
    NIGHT.signs.forEach((glow, g) => g.emissive.setScalar(glow * stage(1.9, .35)));
    const beam = stage(1.75, .45);
    if (NIGHT.letters) NIGHT.letters.emissive.setRGB(.2 * beam, .13 * beam, .06 * beam);    // the bronze letters catch a little of it
    if (NIGHT.cinema) {
      NIGHT.cinema.wash.material.opacity = .46 * beam; NIGHT.cinema.wash.visible = beam > 0;
      NIGHT.cinema.heads.forEach((h) => { h.material.opacity = .75 * beam; h.visible = beam > 0; });
      NIGHT.cinema.lens.color.setRGB(.29 + .71 * beam, .27 + .55 * beam, .22 + .33 * beam);
    }
    NIGHT.rooms.mesh.material.opacity = k; NIGHT.rooms.mesh.visible = lit;
    if (NIGHT.T !== NIGHT.painted) { NIGHT.rooms.list.forEach(paintRoom); NIGHT.painted = NIGHT.T; }
    const t = uNightT.value, blend = k > .6 ? THREE.AdditiveBlending : THREE.NormalBlending;
    if (fountain.material.blending !== blend) fountain.material.blending = blend;
    NIGHT.spots.forEach((s, j) => { pal(j / 8 + t * .045, s.material.color); s.material.opacity = .85 * pool; s.visible = pool > 0; });
    // the moon goes straight up and settles with a small bounce; the clouds do not travel, they gather where it stops
    const place = (o, az, el, r) => o.position.set(Math.cos(el) * Math.sin(az), Math.sin(el), -Math.cos(el) * Math.cos(az)).multiplyScalar(r);
    const low = D(-9), e = low + (NIGHT.el - low) * hop((NIGHT.T - .4) / .95);
    place(NIGHT.disc, NIGHT.az, e, MOON_R); NIGHT.halo.position.copy(NIGHT.disc.position);
    place(NIGHT.cloud, NIGHT.az + D(2.6) * Math.sin(t * .09), NIGHT.el - D(.9), MOON_R * .985);
    NIGHT.disc.material.opacity = stage(.4, .25); NIGHT.halo.material.opacity = stage(.7, .8); NIGHT.cloud.material.opacity = .85 * stage(1.5, 1.4); NIGHT.stars.material.opacity = .8 * stage(.3, 1.2);
    [NIGHT.disc, NIGHT.halo, NIGHT.cloud, NIGHT.stars].forEach((o) => { o.visible = lit; });
  }
  function nightStep(now) {
    const dt = Math.min(.25, (now - NIGHT.last) / 1000 || 0); NIGHT.last = now; NIGHT.raf = 0;
    const root = scene.getObjectByName("blender");
    if (root && root !== NIGHT.root) lampThings(root);                  // the model was loaded again
    NIGHT.T = reduce ? (NIGHT.on ? END : 0) : NIGHT.on ? Math.min(END, NIGHT.T + dt) : Math.max(0, NIGHT.T - dt * END / BACK);
    if (!reduce) { uNightT.value += dt; if (NIGHT.on && NIGHT.T === END) someoneAtHome(uNightT.value, dt); }
    if (NIGHT.place) {                                      // the moon will stop where the visitor is looking: high on the left of the view
      NIGHT.place = false; camera.updateMatrixWorld();
      const dir = new THREE.Vector3(-.58, .68, .5).unproject(camera).sub(camera.getWorldPosition(new THREE.Vector3())).normalize();
      NIGHT.el = clamp(Math.asin(dir.y), D(5.8), D(30)); NIGHT.az = Math.atan2(dir.x, -dir.z);
    }
    nightPaint();
    if (NIGHT.on ? !reduce : NIGHT.T > 0) NIGHT.raf = requestAnimationFrame(nightStep);
  }
  // called while the loading veil is still up: every shader is patched there, so the first press of the moon does not stall
  function nightReady(root) {
    if (!NIGHT.made) moonThings();
    lampThings(root); nightPaint();
    [NIGHT.disc, NIGHT.halo, NIGHT.cloud, NIGHT.stars, ...NIGHT.spots, ...NIGHT.lamps.children, ...(NIGHT.cinema ? [NIGHT.cinema.wash, ...NIGHT.cinema.heads] : [])].forEach((o) => renderer.initTexture(o.material.map));
    renderer.initTexture(uLampMap.value); renderer.initTexture(NIGHT.rooms.mesh.material.map);
  }
  function setNight(on) {
    const root = scene.getObjectByName("blender");
    if (!root) return;
    if (!NIGHT.made) moonThings();
    if (root !== NIGHT.root) lampThings(root);
    NIGHT.on = on; document.body.classList.toggle("night", on);
    if (on && NIGHT.T < .2) NIGHT.place = true;           // chosen on the next frame, when the camera is surely up to date
    NIGHT.last = performance.now();
    if (!NIGHT.raf) NIGHT.raf = requestAnimationFrame(nightStep);
  }
