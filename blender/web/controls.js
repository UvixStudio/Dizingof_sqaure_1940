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
    { k: "roof", label: "מהגג" },
    { k: "top", label: "מבט על" },
    { k: "car", label: "מאחורי מכונית", ride: true, el: .36, fov: 62, road: [36.6, 45.2] }
  ];
  const HINT = "גרור כדי להסתובב. צביטה לזום.", HINT_TOP = "גרור כדי להקיף את הכיכר. צביטה לקרב ולהרחיק.";
  const HINT_RIDE = "נוסעים סביב הכיכר. גרור כדי להסתכל מסביב לרכב, צביטה לקרב ולהרחיק.";
  const look = { yaw: 0, pitch: 0 }, cam = { mode: "fp", az: D(20), el: D(46), dist: 135 };
  const ride = { def: null, yaw: 0, el: 0, dist: 0, t: 0, from: { pos: new THREE.Vector3(), quat: new THREE.Quaternion(), fov: 70 } };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const camList = $("cam-list");
  camList.innerHTML = CAMS.map((c) => `<button role="menuitemradio" aria-checked="false" data-cam="${c.k}"><svg><use href="#i-camera"/></svg><span>${c.label}</span></button>`).join("");
  function setPressed(k) {                                            // null: a point of interest moved the camera
    const c = CAMS.find((x) => x.k === k);
    $("cam-name").textContent = c ? c.label : "מבט חופשי";
    camList.querySelectorAll("[data-cam]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.cam === k)));
  }
  let flight = null;
  function setView(k) {
    const c = CAMS.find((x) => x.k === k);
    flight = null; stopMotion(); setPressed(k);
    if (k === "top") { if (gyro.on || gyro.listening) gyroOff(); cam.mode = "orbit"; camera.fov = 55; camera.updateProjectionMatrix(); $("hint").textContent = HINT_TOP; return; }
    if (c.ride) {
      if (gyro.on || gyro.listening) gyroOff();
      camera.getWorldQuaternion(ride.from.quat); ride.from.pos.copy(rig.position); ride.from.fov = camera.fov;
      rig.rotation.set(0, 0, 0); camera.quaternion.copy(ride.from.quat);
      const def = Object.assign({}, c, pickRide());
      Object.assign(ride, { def, yaw: 0, el: c.el, dist: def.dist || 9, t: 0 });
      cam.mode = "ride"; $("hint").textContent = HINT_RIDE; return;
    }
    cam.mode = "fp"; const v = VIEWS[k];
    if (!gyro.on) rig.rotation.set(0, 0, 0);
    rig.position.copy(v.pos); look.yaw = v.yaw; look.pitch = v.pitch;
    camera.fov = 70; camera.updateProjectionMatrix();
    if (!gyro.on) $("hint").textContent = HINT;
  }
  camList.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cam]");
    if (b) { closeCard(); setView(b.dataset.cam); }
  });

  // ---------- the two menus of the bar, and the passing hint above it ----------
  const menus = Array.from(document.querySelectorAll(".drop, .quick"), (d) => ({ box: d, btn: d.querySelector(".drop-btn, .quick-btn"), list: d.querySelector(".menu, .quick-list") }));
  const choices = (m) => Array.from(m.list.querySelectorAll("button")).filter((b) => !b.hidden);
  function closeMenus(refocus) {
    menus.forEach((m) => {
      if (m.list.hidden) return;
      m.list.hidden = true; m.btn.setAttribute("aria-expanded", "false");
      if (refocus) m.btn.focus({ preventScroll: true });
    });
  }
  menus.forEach((m) => {
    m.btn.addEventListener("click", () => {
      const open = m.list.hidden; closeMenus();
      if (!open) return;
      m.list.hidden = false; m.btn.setAttribute("aria-expanded", "true");
      (m.list.querySelector('[aria-checked="true"]') || choices(m)[0]).focus({ preventScroll: true });
    });
    m.list.addEventListener("click", (e) => { if (e.target.closest("button:not([data-keep])")) closeMenus(true); });
    m.box.addEventListener("keydown", (e) => {
      if (m.list.hidden) return;
      if (e.key === "Escape") { e.stopPropagation(); closeMenus(true); return; }
      if (e.key === "Tab") { closeMenus(); return; }
      const all = choices(m), i = all.indexOf(document.activeElement);
      const to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: all.length - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault(); all[(to + all.length) % all.length].focus({ preventScroll: true });
    });
  });
  addEventListener("pointerdown", (e) => { if (!e.target.closest(".drop, .quick, .tour")) closeMenus(); }, true);
  const hintEl = $("hint"); let hintTimer = 0, hintSaid = "";
  // "how to look around" is a small moving hand (or mouse), shown until the first drag or zoom. Other messages are text
  const LOOKING = new Set([HINT, HINT_TOP, HINT_RIDE]);
  let gestureDone = false;
  try { gestureDone = sessionStorage.getItem("moved") === "1"; } catch (e) { /* private window: show it once per load */ }
  function endGesture() { gestureDone = true; $("gesture").classList.remove("on"); try { sessionStorage.setItem("moved", "1"); } catch (e) { /* see above */ } }
  function showHint() {
    clearTimeout(hintTimer); hintEl.classList.remove("on");
    const text = hintEl.textContent;
    if (!text || LOOKING.has(text)) { $("gesture").classList.toggle("on", !gestureDone); return; }
    $("gesture").classList.remove("on"); hintEl.classList.add("on");
    hintTimer = setTimeout(() => hintEl.classList.remove("on"), 2500 + text.length * 60);
  }
  canvas.addEventListener("pointermove", () => { if (!gestureDone && (ptrs.size > 1 || (ptrs.size && tap && tap.moved > 8))) endGesture(); });
  canvas.addEventListener("wheel", endGesture, { passive: true });
  $("lang-btn").addEventListener("click", switchLang);        // web/lang.js
  // day / night (web/night.js): the icon shows where a press will lead
  $("quick-night").addEventListener("click", (e) => {
    const b = e.currentTarget, night = b.getAttribute("aria-checked") !== "true";
    b.setAttribute("aria-checked", String(night)); b.title = night ? "אור יום" : "מוד לילה";
    setNight(night);
  });
  // pop-ups start under the title plate, whatever its size on this screen
  const placeCards = () => document.documentElement.style.setProperty("--below", Math.round($("home").getBoundingClientRect().bottom + 24) + "px");
  new ResizeObserver(placeCards).observe($("home")); addEventListener("resize", placeCards);
  new MutationObserver(() => { if (hintEl.textContent !== hintSaid) { hintSaid = hintEl.textContent; showHint(); } }).observe(hintEl, { childList: true });
  // every time this camera is chosen it follows a different kind of vehicle: [distance behind, extra height]
  const RIDES = { truck: [10, .6], bus: [12, 1.3], bus_city: [11.5, 1], van: [9.5, .5], sedan: [8.5, 0], coupe: [8.2, 0], cart: [8, .2] };
  let lastRide = "";
  function pickRide() {
    const kindOf = (m) => m.o.name.slice(4).replace(/[_.]?\d+$/, "");
    const cars = movers.filter((m) => m.o.name.startsWith("car_") && RIDES[kindOf(m)]);
    const kinds = [...new Set(cars.map(kindOf))].filter((k) => k !== lastRide);
    if (!kinds.length) return {};
    lastRide = kinds[Math.floor(Math.random() * kinds.length)];
    const same = cars.filter((m) => kindOf(m) === lastRide);
    return { target: same[Math.floor(Math.random() * same.length)].o.name, dist: RIDES[lastRide][0], lift: RIDES[lastRide][1] };
  }
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
    eye.set(p.x + back.x * flat, p.y + 1.1 + (ride.def.lift || 0) + ride.dist * Math.sin(ride.el), p.z + back.z * flat);
    // never leave the road (trees inside it, buildings outside): when swung to the side, rise over the car instead
    const r = Math.hypot(eye.x, eye.z), onRoad = clamp(r, ride.def.road[0], ride.def.road[1]);
    if (onRoad !== r) {
      eye.x *= onRoad / r; eye.z *= onRoad / r;
      const over = Math.hypot(eye.x - p.x, eye.z - p.z);
      eye.y = Math.max(eye.y, p.y + 1.1 + (ride.def.lift || 0) + Math.sqrt(Math.max(0, ride.dist * ride.dist - over * over)));
    }
    const past = 4.5 * Math.max(0, Math.cos(ride.yaw));               // from behind: aim past the car. From the side: at it
    const dx = p.x - back.x * past - eye.x, dy = p.y + 1.3 + (ride.def.lift || 0) * .6 - eye.y, dz = p.z - back.z * past - eye.z;
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
    $("gyro").setAttribute("aria-checked", "false"); $("north").hidden = true; $("hint").textContent = HINT;
  }
  function alignNorth() {   // the phone is pointing north right now
    const f = new THREE.Vector3(); camera.getWorldDirection(f);
    rig.rotation.y += Math.atan2(f.x, -f.z);
  }
  $("north").addEventListener("click", alignNorth);
  $("gyro").hidden = !(coarse && window.DeviceOrientationEvent);        // only where there is a phone to turn
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
    $("gyro").setAttribute("aria-checked", "true"); endGesture();
    $("north").hidden = gyro.abs;
    $("hint").textContent = gyro.abs ? "הסצנה מכוונת לצפון לפי המצפן. גרירה מסובבת אותה אם צריך."
                                     : "כוון את הטלפון לצפון ובחר ׳יישור לצפון׳ בתפריט המצלמות.";
  }

