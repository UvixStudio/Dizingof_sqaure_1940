// ---------- walking figures ----------
  // Blender bakes one ring of poses for every walker and cyclist (people_polyfork.py). The model's second UV set
  // says (vertex number, which ring). Each pose becomes a geometry that shares the triangles and colours, and a
  // walker steps through them by the distance it has covered, its flat shadow with it. No skeleton in the browser.
  async function walkingFigures(stamp) {
    if (!window.DecompressionStream) return;                          // very old browser: they glide in one pose
    let rings;
    for (const cache of ["no-cache", "reload"]) {                     // a copy caught half written during a rebuild is fetched anew
      try {
        let buf = await (await fetch("../people_walk.json.gz?t=" + stamp, { cache })).arrayBuffer();
        const sig = new Uint8Array(buf, 0, Math.min(2, buf.byteLength));   // a server may already have unpacked it
        if (sig[0] === 0x1f && sig[1] === 0x8b) buf = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
        rings = JSON.parse(new TextDecoder().decode(buf));
        break;
      } catch (e) { console.warn("walking poses failed to load", e); }
    }
    if (!rings) return;
    const made = new Map();
    movers.forEach((m) => {
      const base = m.o.isMesh && m.o.geometry;
      if (!base || !base.attributes.uv2) return;
      const own = rings[Math.round(base.attributes.uv2.getY(0))];
      if (own && own.seconds) {                                       // standing: the graphics card blends the poses
        if (!ringFits(base, own)) { console.warn("idle poses do not match this model"); return; }
        breathe(m.o, ringPoses(base, own));
        m.idle = own.seconds; m.step = Math.random() * own.seconds;
        return;
      }
      let poses = made.get(base);
      if (!poses) {
        const ring = rings[Math.round(base.attributes.uv2.getY(0))];
        if (!ring || !ringFits(base, ring)) { console.warn("walking poses do not match this model"); return; }
        poses = { stride: ring.stride, list: ringPoses(base, ring) };
        made.set(base, poses);
      }
      m.poses = poses; m.step = Math.random(); m.bob = 0; m.o.position.y = m.y;
    });
  }
  // the first pose is the model itself: a few corners must land where the model has them
  function ringFits(base, ring) {
    const raw = atob(ring.data), uv2 = base.attributes.uv2, p = base.attributes.position;
    const at = (i) => { const n = raw.charCodeAt(2 * i) | (raw.charCodeAt(2 * i + 1) << 8); return (n > 32767 ? n - 65536 : n) / 1024; };
    for (let j = 0; j < p.count; j += 97) {
      const v = Math.round(uv2.getX(j));
      if (v >= ring.verts || Math.abs(at(v * 3) - p.getX(j)) + Math.abs(at(v * 3 + 1) - p.getY(j)) + Math.abs(at(v * 3 + 2) - p.getZ(j)) > .02) return false;
    }
    return true;
  }
  function ringPoses(base, ring) {
    const raw = atob(ring.data), size = ring.verts * 3, at = new Int16Array(ring.frames * size);
    for (let i = 0; i < at.length; i++) at[i] = raw.charCodeAt(2 * i) | (raw.charCodeAt(2 * i + 1) << 8);
    for (let i = size; i < at.length; i++) at[i] += at[i - size];     // stored as steps from the pose before
    const uv2 = base.attributes.uv2, count = base.attributes.position.count;
    return Array.from({ length: ring.frames }, (_, k) => {
      const pos = new Float32Array(count * 3);
      for (let j = 0; j < count; j++) {
        const v = k * size + Math.round(uv2.getX(j)) * 3;
        pos[j * 3] = at[v] / 1024; pos[j * 3 + 1] = at[v + 1] / 1024; pos[j * 3 + 2] = at[v + 2] / 1024;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      g.setAttribute("uv", base.attributes.uv);
      g.setIndex(base.index);
      g.computeVertexNormals(); g.computeBoundingSphere();
      return g;
    });
  }
  function breathe(mesh, list) {
    const g = mesh.geometry.clone();
    g.morphAttributes.position = list.map((p) => p.attributes.position);
    mesh.geometry = g;
    const was = mesh.material;
    mesh.material = was.clone(); mesh.material.morphTargets = true;
    mesh.material.onBeforeCompile = was.onBeforeCompile; mesh.material.customProgramCacheKey = was.customProgramCacheKey;   // lamp light (night.js)
    mesh.updateMorphTargets();
  }
  function stepIdle(m, dt) {
    const w = m.o.morphTargetInfluences, n = w.length;
    m.step = (m.step + dt) % m.idle;
    const at = m.step / m.idle * n, a = Math.floor(at) % n;
    w.fill(0); w[(a + 1) % n] = at - Math.floor(at); w[a] = 1 - (at - Math.floor(at));
  }
  function stepWalker(m, dt) {
    const p = m.poses, r = Math.hypot(m.o.position.x, m.o.position.z);
    m.step = (m.step + Math.abs(m.w) * r * dt / p.stride) % 1;
    const g = p.list[Math.floor(m.step * p.list.length)];
    if (m.o.geometry === g) return;
    m.o.geometry = g;
    if (!m.cast) m.cast = casts.find((c) => c.o === m.o);
    if (m.cast) m.cast.s.geometry = g;
  }

