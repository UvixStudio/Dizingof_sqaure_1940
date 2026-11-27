// ---------- a short first visit tour: what there is to do here, one blue tip at a time ----------
  // It runs once, after the opening, and again from the round button. ?tour shows it again, ?notour never.
  const TOUR_TOUCH = matchMedia("(pointer: coarse)").matches, TOUR_TAP = TOUR_TOUCH ? "נוגעים" : "לוחצים";
  const tourMenu = (id) => ({ btn: document.querySelector('[aria-controls="' + id + '"]'), list: $(id) });
  const TOUR_STEPS = [
    { title: "ברוכים הבאים לכיכר צינה (דיזנגוף)", text: "שחזור מקורי לפי התוכניות של האדריכלית ג'ניה אוורבוך, שלפיהן נחנכה כיכר צינה ב־1938: מבנה הבניינים, הרחובות, ונקודות עניין היסטוריות מהשנים הראשונות ועד היום.", next: "בואו נתחיל", at: "welcome" },
    { title: "מצלמות", menu: "cam-menu", text: $("gyro").hidden ? "בוחרים מאיפה להסתכל: מהגג, ממבט על, מתוך הכיכר או מאחורי מכונית."
        : "בוחרים מאיפה להסתכל. ולמטה, ״סיבוב עם הטלפון״: מזיזים את הטלפון ימינה ושמאלה, כאילו עומדים בתוך הכיכר. נקודה ירוקה: פועל. נגיעה נוספת מכבה." },
    { title: "נקודות מידע", text: "סיפורים, תצלומים וסרטים. בוחרים נושא, והמצלמה לוקחת אתכם אליו.", menu: "spot-menu" },
    { title: "הסיכות בכיכר", text: TOUR_TAP + " על סיכה, והסיפור שלה נפתח.", at: "pin" },
    { title: "לסייר בסצנה, כמו בגוגל מפות", text: TOUR_TAP + " על הקרקע, מופיע עיגול, והולכים לשם. "
        + (TOUR_TOUCH ? "גוררים כדי להסתכל סביב, וצובטים לזום." : "גוררים כדי להסתכל סביב, וגלגלת לזום."), at: "walk" },
    { title: "ועוד", text: "אודות, שיתוף, יום ולילה, והסיור הזה שוב.", next: "סיום", menu: "quick-list" },
  ];
  const TOUR = { on: false, i: 0, el: null, timer: 0, tapTimer: 0, pulse: 0 };
  // the walking step shows it in the scene itself: a finger taps the ground and the white ring appears there
  const TOUR_POINTER = TOUR_TOUCH ? '<path d="M22 14a8 8 0 0 1-8 8M18 11v-1a2 2 0 0 0-4 0M14 10V9a2 2 0 0 0-4 0v1M10 9.500V4a2 2 0 0 0-4 0v10M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.800 0-4.500-.860-5.990-2.340l-3.600-3.600a2 2 0 0 1 2.830-2.820L7 15"/>'
    : '<path d="M5 3l14 8.500-6.200 1.300L10 19z"/>';
  const TOUR_SPOTS = [[.5, .66], [.28, .6], [.66, .72]];     // parts of the screen under the tip, clear of the buttons
  let tourRing = null;
  function tourDemo(show) {
    clearTimeout(TOUR.tapTimer); cancelAnimationFrame(TOUR.pulse);
    if (tourRing) tourRing.visible = false;
    const finger = TOUR.el && TOUR.el.querySelector(".tour-finger");
    if (!finger) return;
    finger.hidden = !show;
    if (!show) return;
    if (!tourRing) {
      tourRing = new THREE.Group(); tourRing.userData.keep = true; scene.add(tourRing);
      tourRing.add(flat(new THREE.RingGeometry(.6, .84, 48), .98), flat(new THREE.CircleGeometry(.6, 48), .3));
    }
    let n = 0, size = 1, born = 0;
    const tap = () => {
      const [fx, fy] = TOUR_SPOTS[n++ % TOUR_SPOTS.length], x = innerWidth * fx, y = innerHeight * fy, at = groundAt(x, y);
      finger.classList.remove("down"); finger.style.left = x + "px"; finger.style.top = y + "px";
      TOUR.tapTimer = setTimeout(() => {
        finger.classList.add("down");
        if (at) { tourRing.position.copy(at); tourRing.position.y = .31; size = clamp(rig.position.distanceTo(at) * .05, 1.1, 2.6); born = performance.now(); tourRing.visible = true; }
        TOUR.tapTimer = setTimeout(tap, reduce ? 4000 : 1700);
      }, reduce ? 0 : 650);
    };
    const pulse = (now) => {
      const grow = reduce ? 1 : Math.min(1, (now - born) / 220);
      tourRing.scale.setScalar(size * (.4 + .6 * grow) * (reduce ? 1 : 1 + .12 * Math.sin(now / 110)));
      TOUR.pulse = requestAnimationFrame(pulse);
    };
    tap(); TOUR.pulse = requestAnimationFrame(pulse);
  }
  function tourMaybe() {                                      // true when it took over (so the drag hint waits)
    if (TOUR.on) return true;
    if (/[?&]notour\b/.test(location.search)) return false;
    let seen = false;
    try { seen = localStorage.getItem("kikarTour") === "1"; } catch (e) { /* private window: show it */ }
    if (seen && !/[?&]tour\b/.test(location.search)) return false;
    TOUR.on = true; TOUR.timer = setTimeout(tourStart, 500);
    return true;
  }
  function tourStart() {
    clearTimeout(TOUR.timer);
    if (TOUR.el) return;
    closeCard(); if (gyro.on || gyro.listening) gyroOff(); setView("roof");
    const el = document.createElement("div"); el.className = "tour";
    el.innerHTML = '<div class="tour-veil"></div><i class="tour-ring" hidden></i><i class="tour-finger" hidden><svg viewBox="0 0 24 24" aria-hidden="true">' + TOUR_POINTER + '</svg></i>'
      + '<section class="tour-tip" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-text">'
      + '<h3 id="tour-title"></h3><p id="tour-text"></p><footer><span class="tour-count"></span><button type="button" class="tour-skip">דלג</button><button type="button" class="tour-next"></button></footer></section>';
    document.body.appendChild(el); document.body.classList.add("touring");
    TOUR.on = true; TOUR.el = el;
    el.querySelector(".tour-next").addEventListener("click", () => TOUR.i < TOUR_STEPS.length - 1 ? tourShow(TOUR.i + 1) : tourEnd());
    el.querySelector(".tour-skip").addEventListener("click", tourEnd);
    tourShow(0);
  }
  function tourShow(i) {
    const step = TOUR_STEPS[i], el = TOUR.el, q = (s) => el.querySelector(s), tip = q(".tour-tip");
    TOUR.i = i; closeMenus();
    document.querySelectorAll(".tour-glow").forEach((o) => o.classList.remove("tour-glow"));
    q("h3").textContent = step.title; q("p").textContent = step.text;
    q(".tour-count").textContent = (i + 1) + " מתוך " + TOUR_STEPS.length;
    q(".tour-next").textContent = step.next || "הבא";
    if (i < TOUR_STEPS.length - 1) q(".tour-next").insertAdjacentHTML("beforeend", ' <span aria-hidden="true">←</span>');   // onwards points left in Hebrew
    q(".tour-skip").hidden = i === TOUR_STEPS.length - 1;
    tourDemo(step.at === "walk");
    if (step.menu) { const m = tourMenu(step.menu); m.btn.click(); m.btn.classList.add("tour-glow"); }
    if (step.menu === "cam-menu" && !$("gyro").hidden) $("gyro").classList.add("tour-glow");     // the line the text is about
    tip.classList.remove("in"); q(".tour-ring").hidden = true;
    clearTimeout(TOUR.timer);
    TOUR.timer = setTimeout(() => { tourPlace(); tip.classList.add("in"); tip.focus({ preventScroll: true }); }, step.menu ? 300 : 60);     // after the menu has opened
  }
  function tourPlace() {
    if (!TOUR.el) return;
    const step = TOUR_STEPS[TOUR.i], tip = TOUR.el.querySelector(".tour-tip"), ring = TOUR.el.querySelector(".tour-ring");
    const w = tip.offsetWidth, h = tip.offsetHeight, W = innerWidth, H = innerHeight;
    const put = (left, top, arrow, at) => {
      left = clamp(left, 12, W - w - 12); top = clamp(top, 10, H - h - 10);
      tip.style.left = left + "px"; tip.style.top = top + "px"; tip.dataset.arrow = arrow;
      if (at) tip.style.setProperty("--at", clamp(at(left, top), 22, (arrow === "right" ? h : w) - 22) + "px");
    };
    const bar = document.querySelector(".bar").getBoundingClientRect();
    if (step.at === "welcome") return put((W - w) / 2, Math.min(bar.top, $("quick-btn").getBoundingClientRect().top) - h - 16, "none");   // a little above the buttons
    if (step.at === "walk") return put((W - w) / 2, Math.min(H * .3 - h / 2, H * .5 - h), "none");        // high enough to leave the ground in sight
    if (step.at === "pin") {                                 // the pin nearest the middle of the view
      camera.updateMatrixWorld();
      const seen = hotspots.map((s) => { const v = s.pos.clone().project(camera); return { z: v.z, x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H }; })
        .filter((p) => p.z < 1 && p.x > 30 && p.x < W - 30 && p.y > h + 40 && p.y < H - 120)
        .sort((a, b) => Math.hypot(a.x - W / 2, a.y - H * .55) - Math.hypot(b.x - W / 2, b.y - H * .55));
      const p = seen[0];
      if (!p) return put((W - w) / 2, bar.top - h - 18, "none");
      ring.hidden = false; ring.style.left = p.x + "px"; ring.style.top = p.y + "px";
      return put(p.x - w / 2, p.y - h - 40, "down", (left) => p.x - left);
    }
    const m = tourMenu(step.menu), list = m.list.getBoundingClientRect(), btn = m.btn.getBoundingClientRect();
    if (step.menu === "quick-list") {                        // beside the round buttons
      const circle = m.list.querySelector("i").getBoundingClientRect(), mid = list.top + list.height / 2;
      return put(circle.left - w - 16, mid - h / 2, "right", (left, top) => mid - top);
    }
    put(btn.left + btn.width / 2 - w / 2, list.top - h - 16, "down", (left) => btn.left + btn.width / 2 - left);
  }
  function tourEnd() {
    clearTimeout(TOUR.timer); closeMenus(); tourDemo(false);
    document.querySelectorAll(".tour-glow").forEach((o) => o.classList.remove("tour-glow"));
    if (TOUR.el) TOUR.el.remove();
    TOUR.el = null; TOUR.on = false; document.body.classList.remove("touring");
    try { localStorage.setItem("kikarTour", "1"); } catch (e) { /* private window: it will show again */ }
    showHint();
  }
  addEventListener("resize", () => setTimeout(tourPlace, 120));
  addEventListener("keydown", (e) => { if (TOUR.el && e.key === "Escape") { e.stopPropagation(); tourEnd(); } }, true);
  $("quick-tour").addEventListener("click", () => setTimeout(tourStart, 0));   // after the menu has closed
