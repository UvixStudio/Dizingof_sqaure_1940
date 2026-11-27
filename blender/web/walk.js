// ---------- walking like in a street map: a white ring runs on the ground, a click glides there ----------
  const EYE = 1.75, POOL_EDGE = 9.6, STREET_DEG = [348, 43, 98, 168, 225, 299];
  const ray = new THREE.Raycaster(), floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), -.25), ndc = new THREE.Vector2();
  const flat = (geo, opacity) => new THREE.Mesh(geo.rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity, depthWrite: false, fog: false,
    polygonOffset: true, polygonOffsetFactor: -6, polygonOffsetUnits: -6 }));
  const marker = new THREE.Group(); marker.visible = false; scene.add(marker);
  marker.add(flat(new THREE.RingGeometry(.62, .8, 48), .95), flat(new THREE.CircleGeometry(.62, 48), .22));
  let mouse = null, goal = null;                                        // mouse: where it hovers. goal: where we are gliding to
  // may a person stand there? inside the ring of facades, or a little way into one of the six streets
  function walkable(x, z) {
    const r = Math.hypot(x, z);
    if (r <= 45.8) return true;
    if (r > 75) return false;
    return STREET_DEG.some((deg) => { const sx = Math.sin(D(deg)), sz = -Math.cos(D(deg)); return x * sx + z * sz > 0 && Math.abs(x * sz - z * sx) <= 3.8; });
  }
  // things a visitor must not end up inside: [x, z, how far to stay away] (filled from the model's names)
  let solids = [];
  function obstacles(root) {
    solids = [];
    root.children.forEach((o) => {
      const n = o.name, r = n.startsWith("palm") ? 4.4 : n.startsWith("ficus") ? 1.2 : n.startsWith("topiary") ? 1 : n.startsWith("lamp") ? .7 : 0;
      if (r) solids.push([o.position.x, o.position.z, r]);
    });
  }
  function stepAside(p) {
    for (let again = 0; again < 4; again++) solids.forEach(([x, z, r]) => {
      let dx = p.x - x, dz = p.z - z, d = Math.hypot(dx, dz);
      if (d >= r) return;
      if (d < .05) { dx = rig.position.x - x; dz = rig.position.z - z; d = Math.hypot(dx, dz) || 1; }
      p.x = x + dx / d * r; p.z = z + dz / d * r;
    });
    return p;
  }
  function groundAt(px, py) {
    camera.updateMatrixWorld(); ndc.set(px / innerWidth * 2 - 1, 1 - py / innerHeight * 2); ray.setFromCamera(ndc, camera);
    const p = new THREE.Vector3();
    if (!ray.ray.intersectPlane(floor, p) || !walkable(p.x, p.z)) return null;
    const r = Math.hypot(p.x, p.z);
    if (r < POOL_EDGE) {                                                // not into the water: stop at its edge
      const from = r > .5 ? p : rig.position, k = POOL_EDGE / (Math.hypot(from.x, from.z) || 1);
      p.set(from.x * k, p.y, from.z * k);
    }
    return stepAside(p);
  }
  const overSpot = (px, py) => hotspots.some((h) => {
    const v = h.pos.clone().project(camera);
    return v.z < 1 && Math.hypot((v.x + 1) / 2 * innerWidth - px, (1 - v.y) / 2 * innerHeight - py) < 30;
  });
  const sizeMarker = (p) => { marker.position.copy(p); marker.position.y = .31; marker.scale.setScalar(clamp(rig.position.distanceTo(p) * .032, .75, 2.6)); marker.visible = true; };
  function walkTo(px, py) {
    const p = groundAt(px, py); if (!p) return;
    const f = new THREE.Vector3(); camera.getWorldDirection(f);
    const from = { pos: rig.position.clone(), yaw: Math.atan2(-f.x, -f.z), pitch: Math.asin(clamp(f.y, -1, 1)), fov: camera.fov };
    const far = Math.hypot(p.x - from.pos.x, p.z - from.pos.z), high = from.pos.y > 6;
    const fov = cam.mode === "fp" ? camera.fov : 70;
    stopMotion(); endGesture(); setPressed(null);
    if (!gyro.on) { rig.rotation.set(0, 0, 0); look.yaw = from.yaw; look.pitch = from.pitch; }   // with sensors the phone keeps the heading
    cam.mode = "fp";
    // the heading stays as it was; coming down from a height the eyes level out
    const pitch = high || from.pitch < -.5 ? -.05 : from.pitch;
    goal = p;
    flight = { t0: performance.now(), dur: reduce ? 1 : clamp(650 + far * 20, 700, 2300), from, h: null,
      arc: high ? 0 : Math.min(2.4, far * .05),                          // a small hop over hedges and benches
      to: { pos: new THREE.Vector3(p.x, EYE, p.z), yaw: from.yaw, pitch, fov } };
  }
  canvas.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") mouse = { x: e.clientX, y: e.clientY }; });
  canvas.addEventListener("pointerleave", () => { mouse = null; });
  (function follow(now) {
    if (goal && !flight) goal = null;                                    // arrived, or a finger stopped the glide
    if (goal) {
      sizeMarker(goal); marker.scale.multiplyScalar(reduce ? 1 : 1 + .12 * Math.sin(now / 90));
    } else if (mouse && !ptrs.size) {
      const spot = overSpot(mouse.x, mouse.y), p = spot ? null : groundAt(mouse.x, mouse.y);
      if (p) sizeMarker(p); else marker.visible = false;
      canvas.style.cursor = spot || p ? "pointer" : "grab";
    } else {
      marker.visible = false;
      if (ptrs.size) canvas.style.cursor = "grabbing";
    }
    requestAnimationFrame(follow);
  })(0);

