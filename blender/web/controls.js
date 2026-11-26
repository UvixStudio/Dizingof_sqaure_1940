// ---------- viewpoints and camera ----------
  const VIEWS = {
    in:   { pos: P(20.5, D(205), 1.6),  yaw: D(-6), pitch: D(-2) },      // promenade ring, looking north
    walk: { pos: P(45, D(165), 1.6),  yaw: D(15), pitch: D(-1) },        // sidewalk outside the circle
    roof: { pos: P(FACADE + .6, D(120), 19.5), yaw: D(60), pitch: D(-22) }   // on a roof edge, like the archive photos
  };
  // one list drives the camera menu: a new camera is one more line (target = object name of a moving thing in the model)
  const CAMS = [
    { k: "in", label: "בתוך הכיכר" },
    { k: "walk", label: "מהמדרכה" },
    { k: "roof", label: "מגג" },
    { k: "top", label: "מבט על" },
    { k: "car", label: "מאחורי מכונית", target: "car_coupe", dist: 8.5, el: .36, fov: 62, road: [36.6, 45.2] }
  ];
  const HINT = "גרור כדי להסתובב. צביטה לזום.", HINT_TOP = "גרור כדי להקיף את הכיכר. צביטה לקרב ולהרחיק.";
  const HINT_RIDE = "נוסעים סביב הכיכר. גרור כדי להסתכל מסביב לרכב, צביטה לקרב ולהרחיק.";
  const look = { yaw: 0, pitch: 0 }, cam = { mode: "fp", az: D(20), el: D(46), dist: 135 };
  const ride = { def: null, yaw: 0, el: 0, dist: 0, t: 0, from: { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), fov: 70 } };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const camSelect = $("cam-select");
  camSelect.innerHTML = CAMS.map((c) => `<option value="${c.k}">${c.label}</option>`).join("") + '<option value="free" hidden disabled>מבט חופשי</option>';
  const setPressed = (k) => { camSelect.value = k || "free"; };
  let flight = null;
  function setView(k) {
    const c = CAMS.find((x) => x.k === k);
    flight = null; stopMotion(); setPressed(k);
    if (k === "top") { if (gyro.on || gyro.listening) gyroOff(); cam.mode = "orbit"; camera.fov = 55; camera.updateProjectionMatrix(); $("hint").textContent = HINT_TOP; return; }
    if (c.target) {
      if (gyro.on || gyro.listening) gyroOff();
      camera.getWorldQuaternion(ride.from.quat); ride.from.pos.copy(rig.position); ride.from.fov = camera.fov;
      rig.rotation.set(0, 0, 0); camera.quaternion.copy(ride.from.quat);
      Object.assign(ride, { def: c, yaw: 0, el: c.el, dist: c.dist, t: 0 });
      cam.mode = "ride"; $("hint").textContent = HINT_RIDE; return;
    }
    cam.mode = "fp"; const v = VIEWS[k];
    if (!gyro.on) rig.rotation.set(0, 0, 0);
    rig.position.copy(v.pos); look.yaw = v.yaw; look.pitch = v.pitch;
    camera.fov = 70; camera.updateProjectionMatrix();
    if (!gyro.on) $("hint").textContent = HINT;
  }
  camSelect.addEventListener("change", () => { closeCard(); setView(camSelect.value); camSelect.blur(); });
  function applyOrbit() {
    const tgt = new THREE.Vector3(0, 3, 0), c = Math.cos(cam.el);
    const pos = new THREE.Vector3(Math.sin(cam.az) * c, Math.sin(cam.el), Math.cos(cam.az) * c).multiplyScalar(cam.dist).add(tgt);
    rig.rotation.set(0, 0, 0); rig.position.copy(pos);
    const f = tgt.clone().sub(pos).normalize(); camera.rotation.set(Math.asin(f.y), Math.atan2(-f.x, -f.z), 0);
  }
  // behind and above a vehicle that circles the square; looked up by name because the model can reload
  const Y_AXIS = new THREE.Vector3(0, 1, 0), back = new THREE.Vector3(), eye = new THREE.Vector3(), aim = new THREE.Quaternion();
  function updateRide(dt) {
    const m = movers.find((x) => x.o.name === ride.def.target);
    if (!m) return;                                                   // model still loading: stay where we are
    const p = m.o.position, s = Math.sign(m.w);
    back.set(-p.z * s, 0, p.x * s).normalize().applyAxisAngle(Y_AXIS, ride.yaw);     // against the driving direction
    const flat = ride.dist * Math.cos(ride.el);
    eye.set(p.x + back.x * flat, p.y + 1.1 + ride.dist * Math.sin(ride.el), p.z + back.z * flat);
    // never leave the road (trees inside it, buildings outside): when swung to the side, rise over the car instead
    const r = Math.hypot(eye.x, eye.z), onRoad = clamp(r, ride.def.road[0], ride.def.road[1]);
    if (onRoad !== r) {
      eye.x *= onRoad / r; eye.z *= onRoad / r;
      const over = Math.hypot(eye.x - p.x, eye.z - p.z);
      eye.y = Math.max(eye.y, p.y + 1.1 + Math.sqrt(Math.max(0, ride.dist * ride.dist - over * over)));
    }
    const past = 4.5 * Math.max(0, Math.cos(ride.yaw));               // from behind: aim past the car. From the side: at it
    const dx = p.x - back.x * past - eye.x, dy = p.y + 1.3 - eye.y, dz = p.z - back.z * past - eye.z;
    camera.rotation.set(Math.atan2(dy, Math.hypot(dx, dz)), Math.atan2(-dx, -dz), 0);
    ride.t += dt;
    const u = reduce ? 1 : Math.min(1, ride.t / 1.1);
    if (u < 1) {                                                      // glide in from the previous camera
      const e = ease(u);
      aim.copy(camera.quaternion); camera.quaternion.copy(ride.from.quat).slerp(aim, e);
      rig.position.lerpVectors(ride.from.pos, eye, e);
    } else rig.position.copy(eye);
    const fov = ride.from.fov + (ride.def.fov - ride.from.fov) * ease(u);
    if (Math.abs(camera.fov - fov) > .01) { camera.fov = fov; camera.updateProjectionMatrix(); }
  }

  // ---------- pointer: drag with a short glide, pinch, tap ----------
  // The handlers only collect movement. Each frame eases it into the camera, so uneven events never show as steps.
  const motion = { x: 0, y: 0, z: 0, vx: 0, vy: 0 };   // x, y: radians still to apply. z: zoom (log) still to apply. v: glide speed
  const stopMotion = () => { motion.x = motion.y = motion.z = motion.vx = motion.vy = 0; };
  const ptrs = new Map(); let tap = null, pinch = null, trail = [];
  const pdist = () => { const [a, b] = [...ptrs.values()]; return Math.hypot(a.x - b.x, a.y - b.y) || 1; };
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); flight = null;
    stopMotion(); trail = [];                                         // a finger on the screen catches the glide
    if (ptrs.size === 1) tap = { t: performance.now(), moved: 0 };
    else { tap = null; pinch = { d: pdist() }; }
  });
  canvas.addEventListener("pointermove", (e) => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (ptrs.size === 2 && pinch) { const d = pdist(); motion.z += Math.log(pinch.d / d); pinch.d = d; return; }   // fingers apart: zoom in
    if (ptrs.size !== 1) return;
    if (tap) tap.moved += Math.hypot(dx, dy);
    // around-an-object cameras turn by a fixed rate, the standing view follows the field of view (faster for a thumb)
    const k = cam.mode === "fp" ? D(camera.fov) / innerHeight * (e.pointerType === "touch" ? 1.4 : 1.2) : .006;
    const x = dx * k, y = dy * k * (cam.mode === "fp" ? .8 : 1);
    motion.x += x; motion.y += y;
    trail.push({ t: e.timeStamp, x, y }); while (trail.length > 1 && e.timeStamp - trail[0].t > 100) trail.shift();
  });
  const endPtr = (e, cancel) => {
    const single = ptrs.size === 1;
    if (single && tap && !cancel && tap.moved < 8 && performance.now() - tap.t < 450) handleTap(e.clientX, e.clientY);
    else if (single && !cancel && !pinch && !reduce && trail.length > 1 && e.timeStamp - trail[trail.length - 1].t < 80) {
      const span = Math.max(16, e.timeStamp - trail[0].t) / 1000, rest = trail.slice(1);
      motion.vx = clamp(rest.reduce((a, q) => a + q.x, 0) / span, -2, 2);
      motion.vy = clamp(rest.reduce((a, q) => a + q.y, 0) / span, -1.2, 1.2);
    }
    ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null; tap = null; trail = [];
  };
  canvas.addEventListener("pointerup", (e) => endPtr(e, false)); canvas.addEventListener("pointercancel", (e) => endPtr(e, true));
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault(); flight = null;
    motion.z += clamp(e.deltaY * (e.deltaMode === 1 ? 33 : 1), -240, 240) * .001;
  }, { passive: false });
  function applyMotion(dt) {
    if (!ptrs.size && (motion.vx || motion.vy)) {
      motion.x += motion.vx * dt; motion.y += motion.vy * dt;
      const f = Math.exp(-dt / .25); motion.vx *= f; motion.vy *= f;
      if (Math.hypot(motion.vx, motion.vy) < .02) motion.vx = motion.vy = 0;
    }
    const a = reduce ? 1 : 1 - Math.exp(-dt / .045);
    const x = motion.x * a, y = motion.y * a, z = Math.abs(motion.z) < 1e-4 ? motion.z : motion.z * a;
    motion.x -= x; motion.y -= y; motion.z -= z;
    if (cam.mode === "orbit") { cam.az -= x; cam.el = clamp(cam.el + y, D(8), D(88)); cam.dist = clamp(cam.dist * Math.exp(z), 18, 300); return; }
    if (cam.mode === "ride") { ride.yaw -= x; ride.el = clamp(ride.el + y, .06, 1.25); ride.dist = clamp(ride.dist * Math.exp(z), 5, 24); return; }
    if (gyro.on) rig.rotation.y += x;                                 // with sensors, dragging turns the whole scene
    else { look.yaw += x; look.pitch = clamp(look.pitch + y, -1.4, 1.4); }
    if (z) { camera.fov = clamp(camera.fov * Math.exp(z), 28, 85); camera.updateProjectionMatrix(); }
  }
  function updateCamera(dt) {
    applyMotion(dt);
    if (cam.mode === "orbit") applyOrbit(); else if (cam.mode === "ride") updateRide(dt);
    else if (gyro.on && gyro.e) applyGyro(dt); else camera.rotation.set(look.pitch, look.yaw, 0);
  }

  // ---------- phone orientation (can be switched off again) ----------
  const gyro = { on: false, abs: false, e: null, listening: false };
  const q = new THREE.Quaternion(), q1 = new THREE.Quaternion(-Math.sqrt(.5), 0, 0, Math.sqrt(.5)), q0 = new THREE.Quaternion(), zee = new THREE.Vector3(0, 0, 1), eu = new THREE.Euler();
  const oriAbs = (e) => onOri(e, true), oriRel = (e) => onOri(e, false);
  function onOri(e, absolute) {
    if (e.alpha == null) return;
    gyro.e = e;
    if (!gyro.on) { gyro.on = true; gyro.abs = absolute; rig.rotation.y = 0; onGyroState(); }
  }
  function applyGyro(dt) {
    const e = gyro.e, o = D((screen.orientation && screen.orientation.angle) || window.orientation || 0);
    eu.set(D(e.beta), D(e.alpha), -D(e.gamma), "YXZ");
    q.setFromEuler(eu).multiply(q1).multiply(q0.setFromAxisAngle(zee, -o));
    camera.quaternion.slerp(q, 1 - Math.exp(-dt / .06));              // takes the tremor out of the raw sensor
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
      if (cam.mode !== "fp") setView("in");
      flight = null; stopMotion(); gyro.listening = true;
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

