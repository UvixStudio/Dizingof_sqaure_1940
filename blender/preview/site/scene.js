(() => {
  const $ = (id) => document.getElementById(id);
  // ---------- Hebrew or English (?lang=en, the button, remembered on the device) ----------
  // The site is written in Hebrew. In English every text on the page is swapped as it appears, by the exact Hebrew
  // string; what is painted in the scene goes through tr(). The street-name signs carry both languages anyway.
  const LANG_EN = (() => {
    let l = (location.search.match(/[?&]lang=(en|he)\b/) || [])[1];
    try { if (l) localStorage.setItem("kikarLang", l); else l = localStorage.getItem("kikarLang"); } catch (e) { /* private window */ }
    return l === "en";
  })();
  const EN_TEXT = {
    // title and loading
    "כיכר צינה (דיזנגוף)": "Zina Square (Dizengoff)", "שחזור תלת־ממד 1940": "3D reconstruction, 1940",
    "טוענים את הכיכר": "Loading the square", "מרכיבים את הכיכר": "Putting the square together", "מדליקים את האור": "Switching on the lights",
    "לנסות שוב": "Try again", "כניסה לכיכר": "Enter the square", "הטעינה נכשלה. בדקו את החיבור.": "Loading failed. Check your connection.",
    // the bar and its menus
    "מהגג": "Rooftop", "בתוך הכיכר": "In the square", "מהמדרכה": "Sidewalk", "מבט על": "Bird's eye", "מאחורי מכונית": "Behind a car", "מבט חופשי": "Free view",
    "סיבוב עם הטלפון": "Turn with phone", "יישור לצפון": "Align north", "נקודות מידע": "Stories",
    "חנוכת הכיכר 1938": "The 1938 opening", "צינה דיזנגוף": "Zina Dizengoff", "הכיכר עולה ויורדת": "Up and down again", "ג'ניה אוורבוך": "Genia Averbuch", "קולנוע כיכר דיזנגוף": "Dizengoff Square Cinema",
    "שליטה": "Controls", "בחירת מצלמה": "Choose a camera", "מצלמות": "Cameras", "גרירה מסובבת את הסצנה": "Drag to look around",
    "סקיצה תלת־ממדית של כיכר צינה (דיזנגוף) ב־1940": "A 3D sketch of Zina Square (Dizengoff) in 1940", "חזרה למבט הפתיחה": "Back to the opening view",
    "סגירה": "Close", "סגירת החלון": "Close", "נגן את הסרטון": "Play the video",
    // the round button
    "אודות": "About", "שיתוף": "Share", "מוד לילה": "Night", "אור יום": "Daylight", "סיור היכרות": "Quick tour", "תפריט": "Menu", "תפריט: אודות, שיתוף, יום ולילה": "Menu: about, share, day and night",
    // passing hints
    "גרור כדי להסתובב. צביטה לזום.": "Drag to look around. Pinch to zoom.", "גרור כדי להקיף את הכיכר. צביטה לקרב ולהרחיק.": "Drag to circle the square. Pinch to zoom.",
    "נוסעים סביב הכיכר. גרור כדי להסתכל מסביב לרכב, צביטה לקרב ולהרחיק.": "Riding round the square. Drag to look around the car, pinch to zoom.",
    "החיישנים לא זמינים כאן. בטלפון, פתח את הקובץ מכתובת https.": "Motion sensors are not available here. On a phone, open an https address.",
    "אין הרשאה לחיישנים. גרור כדי להסתובב.": "No permission for motion sensors. Drag to look around.",
    "הסצנה מכוונת לצפון לפי המצפן. גרירה מסובבת אותה אם צריך.": "The scene follows your compass. Drag if it needs turning.",
    "כוון את הטלפון לצפון ובחר ׳יישור לצפון׳ בתפריט המצלמות.": "Point the phone north and choose Align north in the cameras menu.",
    "הקישור הועתק": "Link copied", "העתיקו את הקישור משורת הכתובת": "Copy the link from the address bar",
    // the opening and the tour
    "דלג": "Skip", "הבא": "Next", "סיום": "Done", "בואו נתחיל": "Let's start",
    "ברוכים הבאים לכיכר צינה (דיזנגוף)": "Welcome to Zina Square (Dizengoff)",
    "שחזור מקורי לפי התוכניות של האדריכלית ג'ניה אוורבוך, שלפיהן נחנכה כיכר צינה ב־1938: מבנה הבניינים, הרחובות, ונקודות עניין היסטוריות מהשנים הראשונות ועד היום.":
      "An original reconstruction after the plans of architect Genia Averbuch, by which the square opened in 1938: the buildings, the streets, and points of history from its first years to today.",
    "בוחרים מאיפה להסתכל: מהגג, ממבט על, מתוך הכיכר או מאחורי מכונית.": "Choose where to look from: a rooftop, bird's eye, inside the square or behind a car.",
    "בוחרים מאיפה להסתכל. ולמטה, ״סיבוב עם הטלפון״: מזיזים את הטלפון ימינה ושמאלה, כאילו עומדים בתוך הכיכר. נקודה ירוקה: פועל. נגיעה נוספת מכבה.":
      "Pick a view. At the bottom, Turn with phone: swing your phone to look around as if you were there. Green dot: on. Tap again for off.",
    "סיפורים, תצלומים וסרטים. בוחרים נושא, והמצלמה לוקחת אתכם אליו.": "Stories, photographs and films. Pick one and the camera takes you there.",
    "הסיכות בכיכר": "Pins in the square", "נוגעים על סיכה, והסיפור שלה נפתח.": "Tap a pin to open its story.", "לוחצים על סיכה, והסיפור שלה נפתח.": "Click a pin to open its story.",
    "לסייר בסצנה, כמו בגוגל מפות": "Explore it like Google Maps",
    "נוגעים על הקרקע, מופיע עיגול, והולכים לשם. גוררים כדי להסתכל סביב, וצובטים לזום.": "Tap the ground, a circle appears, and you walk there. Drag to look around, pinch to zoom.",
    "לוחצים על הקרקע, מופיע עיגול, והולכים לשם. גוררים כדי להסתכל סביב, וגלגלת לזום.": "Click the ground, a circle appears, and you walk there. Drag to look around, scroll to zoom.",
    "ועוד": "And more", "אודות, שיתוף, יום ולילה, והסיור הזה שוב.": "About, share, day and night, and this tour again.",
    // what is exact and what is estimated (the list in the page, shown again inside "about")
    "גרסת עבודה: המודל נבנה בבלנדר לפי תצלומים מ־1938-1940 ועדיין בתהליך.":
      "Work in progress: the model is built in Blender from photographs of 1938 to 1940 and is still being worked on.",
    "צורות הבניינים וכיווני הרחובות מ־OpenStreetMap, © תורמי OpenStreetMap. הדגם כולל גם מבנים שהושלמו אחרי 1940, כמו מלון גזית (1948).":
      "Building shapes and street directions come from OpenStreetMap, © OpenStreetMap contributors. The model also includes buildings finished after 1940, such as the Gazit Hotel (1948).",
    "קולנוע אסתר הותאם לתצלומים. החזיתות של שאר הבניינים, הצבעים והרכבים הם פרשנות.":
      "The Esther Cinema was matched to photographs. The fronts of the other buildings, the colours and the cars are interpretation.",
    "טבעות הגן, הכביש והמזרקה נמדדו מתצלומים, בדיוק משוער.":
      "The garden rings, the road and the fountain were measured from photographs, with approximate accuracy.",
    "שמות הבתים, שנותיהם והאדריכלים לפי ויקיפדיה. השיוך של בתי פלדמן, גרינמן ומירנברג לגוש מסוים בטבעת הוא השערה.":
      "House names, dates and architects follow Wikipedia. Placing the Feldman, Greenman and Mirenberg houses on particular blocks of the ring is a guess.",
    "שמות אקמן, קפה אמנות, בית מרקחת וגל-אור לקוחים מתצלומים ומוויקיפדיה. שלמן, ויטמן, פיינשטוק והספר הטוב היו עסקים בתל אביב, לא בהכרח בכיכר. שאר שמות החנויות הומצאו ברוח התקופה. חזיתות החנויות, מיקומן, צבעי הסככות והכרזה הגדולה הם שחזור.":
      "The names Ackerman, Café Omanut, the pharmacy and Gal-Or are taken from photographs and Wikipedia. Shalman, Witman, Feinstock and Ha-Sefer Ha-Tov were businesses in Tel Aviv, not necessarily in the square. The other shop names were invented in the spirit of the time. The shopfronts, their positions, the awning colours and the large poster are reconstruction.",
    "נקודות המידע (העיגולים החומים) מבוססות על ויקיפדיה ועל המקורות שמצוינים בכל כרטיס.":
      "The points of information (the brown circles) are based on Wikipedia and on the sources named in each card.",
    // painted in the scene: building names and the street names on the road
    "לימים קולנוע אסתר": "later the Esther Cinema", "בתי פלדמן וגרינמן": "Feldman and Greenman Houses", "לילנפלד וביז'ונסקי · 1935-36": "Lilienfeld and Bizhonsky · 1935-36",
    "בית מירנברג": "Mirenberg House", "תכנון: ג'ניה אוורבוך · 1936": "Design: Genia Averbuch · 1936",
    "דיזנגוף": "DIZENGOFF", "ריינס": "REINES", "זמנהוף": "ZAMENHOF", "בן עמי": "BEN AMI", "פינסקר": "PINSKER",
  };
  const tr = (s) => LANG_EN && EN_TEXT[s] !== undefined ? EN_TEXT[s] : s;
  const say = (he, en) => LANG_EN ? en : he;                  // for the long texts, written side by side where they are used
  function switchLang() {                                    // the page loads again in the other language, without the opening
    const url = new URL(location.href);
    url.searchParams.set("lang", LANG_EN ? "he" : "en");
    try { sessionStorage.setItem("kikarQuiet", "1"); } catch (e) { /* the opening will simply play again */ }
    location.replace(url);
  }
  if (LANG_EN) {
    const html = document.documentElement;
    html.lang = "en"; html.dir = "ltr"; document.title = "Zina Square (Dizengoff) 1940";
    document.querySelectorAll("body > div[dir]").forEach((d) => { d.dir = "ltr"; });     // the page's right-to-left wrapper
    const swap = (s) => {
      const key = s.trim(), count = key.match(/^(\d+) מתוך (\d+)$/);
      if (count) return count[1] + " of " + count[2];
      return EN_TEXT[key] !== undefined ? s.replace(key, EN_TEXT[key]) : s;
    };
    const attrs = ["aria-label", "title", "alt"];
    const words = (node) => {
      if (node.nodeType === 3) { const s = swap(node.nodeValue); if (s !== node.nodeValue) node.nodeValue = s; return; }
      if (node.nodeType !== 1 || node.id === "lang-btn" || /^(SCRIPT|STYLE)$/.test(node.nodeName)) return;
      attrs.forEach((a) => { const v = node.getAttribute(a); if (v) { const s = swap(v); if (s !== v) node.setAttribute(a, s); } });
      node.childNodes.forEach(words);
    };
    const button = $("lang-btn");                           // the button offers the way back, in Hebrew
    button.innerHTML = '<span class="long">עברית</span><span class="short">עב</span>'; button.lang = "he"; button.setAttribute("aria-label", "עברית"); button.dir = "rtl";
    words(document.body);
    new MutationObserver((list) => list.forEach((m) => { if (m.type === "childList") m.addedNodes.forEach(words); else words(m.target); }))
      .observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: attrs });
    const card = $("card");                                  // a card not yet translated keeps reading right to left
    new MutationObserver(() => { const h = card.querySelector("h2"); if (h) card.dir = /[א-ת]/.test(h.textContent) ? "rtl" : "ltr"; }).observe(card, { childList: true });
  }

  const D = THREE.MathUtils.degToRad;

  // ---------- palette (watercolour washes) ----------
  const C = {
    paper: 0xefe6d2, ink: 0x2b2925, sand: 0xd8c7a0, bed: 0xb9a285,
    asphalt: 0x8e8a80, walk: 0xd9cfbb, stone: 0xddd3bd,
    lawn: 0x7ea552, lawnDark: 0x5f8c3f, hedge: 0x4b7236,          // facelift: real grass greens, not watercolour washes
    water: 0x9fc4b8, plaster: [0xf3eee3, 0xece4d3, 0xf0e8dc, 0xe8e2d6], shade: 0xd8cdb8,
    awning: [0xc9a98b, 0xb9c2b0, 0xd1b48e], cinema: 0xe9dfc9,
    city: [0xece6d9, 0xe6dfd0, 0xefe9de, 0xe2dccd]
  };

  // ---------- picture quality for the device ----------
  // Smooth edges (antialiasing) are on, except on phones with a Mali GPU: there the whole picture flickered with them
  // (a screen recording from a Mali-G57, 27.11: thin layers turned half see-through for single frames; ?noaa was steady).
  // On laptop integrated graphics they are dear, so those start with a little fewer pixels. Chosen once, with the context.
  const coarse = matchMedia("(pointer: coarse)").matches;
  const metered = /[?&]fps\b/.test(location.search);                  // add ?fps to the address
  const gpuName = (() => {
    const g = document.createElement("canvas").getContext("webgl"); if (!g) return "";
    const e = g.getExtension("WEBGL_debug_renderer_info"), n = e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : "";
    const lose = g.getExtension("WEBGL_lose_context"); if (lose) lose.loseContext();
    return String(n);
  })();
  const weak = !coarse && /intel|uhd|iris|swiftshader|llvmpipe|basic render/i.test(gpuName);
  const mali = coarse && /mali/i.test(gpuName);
  const smoothing = /[?&]noaa\b/.test(location.search) ? false : /[?&]aa\b/.test(location.search) || !mali;   // ?aa / ?noaa to compare
  const forced = Number((location.search.match(/[?&]px=([0-9.]+)/) || [])[1]) || 0;   // ?px=2 : this many pixels, never lowered
  let ratio = Math.min(window.devicePixelRatio || 1, forced || (weak ? (smoothing ? 1 : 1.25) : 2));
  // if frames stay slow, draw fewer pixels (only ever downwards, so the picture does not keep changing)
  const pace = { sum: 0, n: 0, slow: 0, first: null, done: forced > 0, from: performance.now() + 4000, floor: Math.min(ratio, coarse ? 1.2 : .8) };
  const meter = metered ? document.body.appendChild(document.createElement("div")) : null;
  if (meter) meter.className = "fps";
  function adapt(ms, now) {
    if (introOn || now < pace.from || ms > 250) return;                          // loading, or a tab in the background
    pace.sum += ms; if (++pace.n < 40) return;
    const avg = pace.sum / pace.n; pace.sum = pace.n = 0;
    pace.slow = avg > 24 ? pace.slow + 1 : 0;
    if (pace.slow >= 2 && !pace.done) {
      pace.slow = 0;
      if (ratio > pace.floor) { pace.first = pace.first || { avg, ratio }; ratio = Math.max(pace.floor, ratio * .85); renderer.setPixelRatio(ratio); }
      // all the way down and no faster (a phone saving battery caps at 30 fps): the pixels were not the problem, put them back
      else if (pace.first && avg > pace.first.avg * .92) { ratio = pace.first.ratio; renderer.setPixelRatio(ratio); pace.done = true; }
    }
    if (meter) meter.textContent = `${(1000 / avg).toFixed(0)} fps | x${ratio.toFixed(2)} | ${smoothing ? "AA" : "no AA"} | near ${camera.near} | depth ${renderer.getContext().getParameter(0x0d56)} | ${gpuName}`;
  }

// ---------- renderer ----------
  const canvas = $("gl");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: smoothing });
  renderer.setPixelRatio(ratio);
  THREE.ShaderChunk.fog_fragment += "\ngl_FragColor.rgb = clamp(mat3(0.87496,0.07231,0.06063,0.17522,0.95862,0.13959,0.03588,0.03269,0.82307) * gl_FragColor.rgb + (-0.01500), 0.0, 1.0);";   // colour grade, once per pixel inside the shaders
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  // no filmic tone mapping: it washed the colours out; contrast comes from the sun and shadows instead
  const HAZE = 0xc2c6cd;
  renderer.setClearColor(HAZE, 1);
  const scene = new THREE.Scene();
  window.__kikar = { scene };   // used by export.js (GLB export button)
  scene.fog = new THREE.Fog(HAZE, 110, 300);
  const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 600);
  camera.rotation.order = "YXZ";
  const rig = new THREE.Group(); rig.rotation.order = "YXZ"; rig.add(camera); scene.add(rig);
  scene.add(new THREE.HemisphereLight(0xdce8f4, 0x9a8f76, 0.72));   // sky fill: shade sides stay readable
  // low afternoon sun from the south-west: long shadows of palms, trees and the balconies
  const sun = new THREE.DirectionalLight(0xfff0d8, 0.95); sun.position.set(-70, 60, 50); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.35;
  Object.assign(sun.shadow.camera, { left: -62, right: 62, top: 62, bottom: -62, near: 10, far: 220 }); sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun); scene.add(sun.target);

  // ---------- helpers ----------
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const P = (r, t, y) => new THREE.Vector3(r * Math.sin(t), y, -r * Math.cos(t));   // t: clockwise from north, -z = north
  const inkA = new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: .8, fog: true });
  const inkB = new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: .35, fog: true });
  const inkC = new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: .45, fog: true });
  const matCache = {};
  // REAL: physical materials with surface textures and no pen lines (the illustrated look is the original src/)
  const REAL = true;
  const texCache = {};
  function surfTex(kind) {                                 // near-white detail map; the material colour tints it
    if (texCache[kind]) return texCache[kind];
    const S = 256, cv = document.createElement("canvas"); cv.width = cv.height = S; const x = cv.getContext("2d");
    x.fillStyle = "#fff"; x.fillRect(0, 0, S, S);
    const spk = (n, a, b, w, h) => { for (let i = 0; i < n; i++) { x.fillStyle = rnd() > .5 ? `rgba(255,255,255,${a})` : `rgba(60,50,40,${b})`; x.fillRect(rnd() * S, rnd() * S, 1 + rnd() * w, 1 + rnd() * h); } };
    const blot = (n, a) => { for (let i = 0; i < n; i++) { const cx = rnd() * S, cy = rnd() * S, r = 20 + rnd() * 60, g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, `rgba(90,75,55,${a})`); g.addColorStop(1, "rgba(90,75,55,0)"); x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r); } };
    let rep = 2;
    if (kind === "plaster") { blot(16, .07); spk(6000, 0, .11, 1.5, 1.5); rep = 3; }                       // hand-trowelled render, weathered
    else if (kind === "asphalt") { x.fillStyle = "#d6d6d4"; x.fillRect(0, 0, S, S); blot(20, .12); spk(9000, .25, .24, 1.5, 1.5); rep = 26; }
    else if (kind === "paving") {                                                                         // cast concrete slabs
      blot(10, .06); spk(3000, .1, .1, 1.5, 1.5); x.strokeStyle = "rgba(70,60,50,.38)"; x.lineWidth = 1.5;
      for (let i = 0; i <= S; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, S); x.moveTo(0, i); x.lineTo(S, i); x.stroke(); } rep = 40;
    }
    else if (kind === "sand") { blot(12, .09); spk(9000, .22, .2, 2, 2); rep = 22; }                      // packed sand and kurkar gravel
    else { blot(6, .04); spk(1500, .05, .06, 1.2, 1.2); }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 4;
    return (texCache[kind] = t);
  }
  const kindOf = (c) => (C.plaster.includes(c) || C.city.includes(c) || c === C.cinema || c === C.shade) ? "plaster"
    : c === C.asphalt ? "asphalt" : (c === C.walk || c === C.stone) ? "paving" : (c === C.sand || c === C.bed) ? "sand" : "plain";
  const fill = (c) => matCache[c] || (matCache[c] = REAL
    ? new THREE.MeshStandardMaterial({ color: c, map: surfTex(kindOf(c)), roughness: .92, metalness: 0, side: THREE.DoubleSide })
    : new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide }));

  // pen strokes: exact edges plus a second, slightly wandering pass that overshoots the corners
  function strokes(geo, parent, { thresh = 25, sketchy = true, mat = inkA } = {}) {
    if (REAL) return;
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
    const m = new THREE.Mesh(geo, fill(color)); m.castShadow = true; m.receiveShadow = true; parent.add(m); strokes(geo, m, opts); return m;
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
  const grassCache = {};
  function grassMat(c) {                                   // lawn: base wash with fine light and dark specks, tiled
    if (grassCache[c]) return grassCache[c];
    const cv = document.createElement("canvas"); cv.width = cv.height = 256; const x = cv.getContext("2d");
    x.fillStyle = "#" + new THREE.Color(c).getHexString(); x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 14; i++) {                         // worn and lush patches
      const cx = rnd() * 256, cy = rnd() * 256, r = 25 + rnd() * 55, g = x.createRadialGradient(cx, cy, 0, cx, cy, r), warm = rnd() > .5;
      g.addColorStop(0, warm ? "rgba(170,150,90,.22)" : "rgba(30,55,20,.22)"); g.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    }
    for (let i = 0; i < 9000; i++) {                       // short blades: light tips and dark roots
      const px = rnd() * 256, py = rnd() * 256; x.strokeStyle = rnd() > .45 ? "rgba(225,235,170,.22)" : "rgba(25,45,15,.28)";
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + (rnd() - .5) * 2, py - 2 - rnd() * 3); x.stroke();
    }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 14); t.anisotropy = 4;
    return (grassCache[c] = new THREE.MeshStandardMaterial({ map: t, roughness: 1, metalness: 0, side: THREE.DoubleSide }));
  }
  const flatRing = (r1, r2, y, color) => {
    const g = new THREE.RingGeometry(r1, r2, 120, 1); g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
    const m = mesh(g, color, scene, { sketchy: false, mat: inkC });
    if (color === C.lawn || color === C.lawnDark) m.material = grassMat(color);   // speckled grass instead of flat paint
    return m;
  };
  function label(text, pos, size = 3.2) {
    const c = document.createElement("canvas"); c.width = 512; c.height = 128;
    const x = c.getContext("2d"); x.font = "600 64px Assistant, Arial, sans-serif"; x.fillStyle = "#2b2925";
    x.textAlign = "center"; x.textBaseline = "middle"; x.direction = LANG_EN ? "ltr" : "rtl"; x.fillText(text, 256, 64);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, fog: true }));
    s.position.copy(pos); s.scale.set(size * 4, size, 1); scene.add(s);
  }

  // ---------- sky: HDRI panorama, texture column = compass bearing / 360 ----------
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

  // ---------- canvas textures: street signs, ground lettering, posters ----------
  const SERIF = '"Frank Ruhl Libre", "David Libre", "Times New Roman", serif';
  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function canvasTex(w, h, draw) {
    const c = document.createElement("canvas"); c.width = w; c.height = h; const tex = new THREE.CanvasTexture(c);
    const go = () => { const x = c.getContext("2d"); x.clearRect(0, 0, w, h); x.textAlign = "center"; x.textBaseline = "middle"; x.direction = "rtl"; draw(x); tex.needsUpdate = true; };
    go(); if (document.fonts && document.fonts.load) Promise.all([700, 900].map((w) => document.fonts.load(w + ' 100px "Frank Ruhl Libre"', 'אבA'))).then(go).catch(() => {});
    return tex;
  }
  const signTex = (name, en) => canvasTex(768, 384, (x) => {   // enamel street plate: Hebrew over Latin, nothing else
    rr(x, 6, 6, 756, 372, 40); x.fillStyle = "rgba(29,42,90,.78)"; x.fill();
    x.strokeStyle = "#ffffff"; x.lineWidth = 6; rr(x, 24, 24, 720, 336, 28); x.stroke();
    x.fillStyle = "#ffffff"; x.font = "900 152px " + SERIF; x.fillText(name, 384, 140);
    x.font = "900 74px " + SERIF; x.fillText(en, 384, 292);
  });
  const groundTex = (name) => canvasTex(1024, 320, (x) => { x.fillStyle = "rgba(43,41,37,.7)"; x.font = "700 210px " + SERIF; x.fillText(name, 512, 165); });
  const marqueeTex = () => canvasTex(1024, 220, (x) => {
    rr(x, 4, 4, 1016, 212, 28); x.fillStyle = "#3a2b25"; x.fill(); x.strokeStyle = "#d8c79e"; x.lineWidth = 5; rr(x, 20, 20, 984, 180, 18); x.stroke();
    x.fillStyle = "#e6d6ac"; x.font = "700 130px " + SERIF; x.fillText("קולנוע אסתר", 512, 112);
  });
  const vertNameTex = () => canvasTex(256, 672, (x) => {   // the name reading top to bottom on the flat end
    x.fillStyle = "#2b2b2e"; x.fillRect(42, 10, 172, 652);
    x.strokeStyle = "#e4d7a8"; x.lineWidth = 5; x.strokeRect(54, 24, 148, 624);
    x.fillStyle = "#f0e3bb"; x.font = "700 104px " + SERIF;
    "קולנוע אסתר".split("").filter((ch) => ch !== " ").forEach((ch, i) => x.fillText(ch, 128, 92 + i * 59));
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
  const EN = ["DIZENGOFF", "REINES", "ZAMENHOF", "BEN AMI", "DIZENGOFF", "PINSKER"];
  const ARMS = BLOCKS.map((b, k) => {            // arm k = the street gap just before block k
    const pv = BLOCKS[(k + BLOCKS.length - 1) % BLOCKS.length];
    let a0 = pv[1], a1 = b[0]; if (a1 < a0) a1 += 360;
    const half = Math.max(8, Math.min(FACADE * Math.sin(D((a1 - a0) / 2)), 14));
    return { t: D(((a0 + a1) / 2) % 360), name: NAMES[k], en: EN[k], gap: half, road: Math.max(5, half - 3) };
  });
  [["דיזנגוף", "DIZENGOFF", 348], ["ריינס", "REINES", 43], ["זמנהוף", "ZAMENHOF", 98],
   ["דיזנגוף", "DIZENGOFF", 168], ["פינסקר", "PINSKER", 225], ["בן עמי", "BEN AMI", 299]]
    .forEach(([name, en, deg], k) => Object.assign(ARMS[k], { name, en, t: D(deg) }));
  const signs = [];
  const SIGN_Y = 16, SIGN_W = 4.8, SIGN_H = 2.4;
  const fadeTex = (() => { const c = document.createElement("canvas"); c.width = 4; c.height = 128; const x = c.getContext("2d"), g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, "rgba(250,240,216,.95)"); g.addColorStop(.55, "rgba(250,240,216,.6)"); g.addColorStop(1, "rgba(250,240,216,.3)"); x.fillStyle = g; x.fillRect(0, 0, 4, 128); return new THREE.CanvasTexture(c); })();
  const padTex = (() => { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d");
    x.fillStyle = "#ffffff"; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); return new THREE.CanvasTexture(c); })();
  function addSign(a) {
    const s = new THREE.Group(); s.position.copy(P(44, a.t, SIGN_Y)); scene.add(s);
    const sm = new THREE.MeshBasicMaterial({ map: signTex(a.name, a.en), transparent: true, opacity: 1, depthWrite: false, side: THREE.DoubleSide }); s.userData.m = sm;
    s.add(new THREE.Mesh(new THREE.PlaneGeometry(SIGN_W, SIGN_H), sm));
    // a hairline that fades into the ground, ending in a soft blue dot: it reads as a marker, not a pole
    const base = P(44, a.t, 0), stem = new THREE.Mesh(new THREE.PlaneGeometry(.045, SIGN_Y - SIGN_H / 2), new THREE.MeshBasicMaterial({ map: fadeTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
    stem.position.set(base.x, (SIGN_Y - SIGN_H / 2) / 2, base.z); scene.add(stem); s.userData.stem = stem;
    const dotM = new THREE.Mesh(new THREE.PlaneGeometry(.62, .62).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: padTex, color: 0xfff1d6, opacity: .95, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    dotM.position.set(base.x, .13, base.z); scene.add(dotM);
    dotM.userData.keep = true; dotM.userData.pad = true;
    signs.push(s);
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
      new THREE.MeshBasicMaterial({ map: groundTex(tr(a.name)), transparent: true, opacity: .5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    gl.position.set(0, .16, -(ROAD_OUT + 24)); g.add(gl); scene.attach(gl); gl.userData.keep = true;
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
    fragmentShader: "precision mediump float; uniform float uT; varying vec2 vP; void main(){ float r = length(vP); vec2 p = vP; float wv = sin(p.x*1.7 + uT*1.3)*.5 + sin(p.y*2.3 - uT*1.1)*.5 + sin((p.x+p.y)*3.1 + uT*2.0)*.35; float glint = 0.0; float rip = (sin(r*4.0 - uT*3.0)*.5+.5) * smoothstep(6.0,1.5,r); float edge = smoothstep(6.5,10.5,r); vec3 deep = vec3(.10,.33,.38), shallow = vec3(.27,.55,.58), skyc = vec3(.70,.85,.92); vec3 c = mix(deep, shallow, edge*.6 + wv*.08); c = mix(c, skyc, .2 + wv*.06); c += glint*.5 + rip*.09; gl_FragColor = vec4(c,1.0); }"
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
    const greens = [0x4f7a32, 0x5f8d3c, 0x416a2b, 0x6e9a46];   // a dense crown of overlapping clusters, not one polyhedron
    [[0, 3.1, 0, 1.0], [.55, 2.75, .3, .72], [-.5, 2.9, -.25, .78], [.1, 3.7, -.4, .7], [-.3, 3.6, .4, .6]].forEach(([dx, dy, dz, k], i) =>
      mesh(new THREE.SphereGeometry(1.05 * s * k, 9, 7).translate(dx * s, dy * s, dz * s), greens[i % 4], g, { thresh: 70, sketchy: false }));
    const st = []; for (let k = 0; k < 3; k++) { const a = k * 2.1; st.push(new THREE.Vector3(Math.cos(a) * .7 * s, 0, Math.sin(a) * .7 * s), new THREE.Vector3(0, 2.6 * s, 0)); }
    g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(st), inkC));
  }
  const frondMat = new THREE.MeshStandardMaterial({ color: 0x4f7f33, roughness: .75, metalness: 0, side: THREE.DoubleSide });
  function palm(x, z, h = 2.8) {   // date palm: ringed trunk, crown of arching fronds, each with a double row of drooping leaflets
    const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
    mesh(new THREE.CylinderGeometry(.2, .32, h, 8).translate(0, h / 2, 0), 0xb7a688, g, { thresh: 40 });
    const v = [], nF = 16;
    for (let k = 0; k < nF; k++) {
      const a = k / nF * Math.PI * 2 + rnd() * .25, L = 2.3 + rnd() * .8, lift = (k % 3 === 0 ? 1.3 : .6) + rnd() * .3;
      const ca = Math.cos(a), sa = Math.sin(a), sx = -sa, sz = ca;                 // sideways direction for the leaflets
      let prev = null;
      for (let sg = 0; sg <= 9; sg++) {
        const u = sg / 9, px = ca * L * u, pz = sa * L * u, py = h + lift * Math.sin(u * 2.2) - 1.7 * u * u;
        if (prev && sg > 1) {
          const ll = (.75 * Math.sin(Math.min(1, u * 1.15) * Math.PI * .9) + .12) * (L / 2.6);
          for (const sd of [-1, 1]) {
            const tx = px + sx * sd * ll, tz = pz + sz * sd * ll, ty = py - ll * .75;
            v.push(prev[0], prev[1], prev[2], px, py, pz, tx, ty, tz);
          }
        }
        prev = [px, py, pz];
      }
    }
    const fg = new THREE.BufferGeometry(); fg.setAttribute("position", new THREE.Float32BufferAttribute(v, 3)); fg.computeVertexNormals();
    g.add(new THREE.Mesh(fg, frondMat));
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

  const shade = (c) => new THREE.Color(c).multiplyScalar(.72).getHex();
  const quiet = { thresh: 80, sketchy: false, mat: inkC };
  function balcony(loop, out, y, col, h = 1.0) {
    const f = closed(offsetLoop(loop, out)), r = closed(offsetLoop(loop, out - .14));
    mesh(ribbon(f, y, y + .2), col, scene, quiet);                       // thin slab edge
    mesh(ribbon(r, y + .2, y + .36), shade(col), scene, { thresh: 80, sketchy: false, mat: inkB });   // shadow reveal
    mesh(ribbon(f, y + .36, y + .2 + h), col, scene, quiet);             // thick parapet strip
    mesh(deck(closed(loop), f, y + .2 + h), col, scene, { sketchy: false, mat: inkB });
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
    const wts = Array.from({ length: n }, (_, k) => .75 + ((bi + k * 3) % 4) * .22), wsum = wts.reduce((p, q) => p + q, 0), cuts = [0];
    wts.forEach((w) => cuts.push(cuts[cuts.length - 1] + w / wsum));
    const GAPA = (3.9 / FACADE) / 2;                           // ~3.9 m between neighbouring facades
    for (let k = 0; k < n; k++) {
      const s0 = t0 + (t1 - t0) * cuts[k] + (k ? GAPA : 0), s1 = t0 + (t1 - t0) * cuts[k + 1] - (k < n - 1 ? GAPA : 0);
      const cinema = cinemaBlock;
      const floors = cinema ? 0 : [3, 5, 4, 2, 4, 6, 3, 5, 4, 3, 5][bi % 11];
      const H = cinema ? 15 : GROUND + floors * FLOOR;
      const col = cinema ? C.cinema : C.plaster[bi % C.plaster.length];
      const BAL = 1.5, PAR = 1.0, SLAB = .22;
      if (cinema) {
        const loop = blockLoop(s0, s1), lc = closed(loop), skin = closed(offsetLoop(loop, .05));
        mesh(ribbon(lc, 0, H), col, scene, { thresh: 50 });
        mesh(cap(loop, H), col, scene, { sketchy: false, mat: inkC });
        scene.add(new THREE.Mesh(ribbon(skin, .4, 4.6, 4), shopMat));                   // foyer glazing
        band(loop, 2.6, 4.9, .22, 0xc08a78);                                             // deep canopy over the entrance
        [8.4, 11.6].forEach((y) => balcony(loop, 1.5, y, col, 1.15));                    // two heavy bands
        balcony(loop, 1.5, H, col, .8);
        // the flat end: a plain slab that steps forward of the balcony bands and carries the name, as in the photo
        const ta = s1 - D(4.2), TD = 9, TW = 5.6, TH = H + 5.5, tw = new THREE.Group();
        tw.position.copy(P(FACADE - 1.5 + TD / 2, ta, 0)); tw.rotation.y = -ta; scene.add(tw);
        mesh(new THREE.BoxGeometry(TW, TH, TD).translate(0, TH / 2, 0), col, tw, { thresh: 40, sketchy: false });
        const nameM = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 9.5), new THREE.MeshBasicMaterial({ map: vertNameTex(), transparent: true }));
        nameM.position.set(0, TH - 7, -TD / 2 - .06); nameM.rotation.y = Math.PI; tw.add(nameM);      // name down the flat face
      } else {
        const loop = blockLoop(s0, s1), lc = closed(loop), skin = closed(offsetLoop(loop, .05));
        mesh(ribbon(lc, 0, H), col, scene, { thresh: 50 });                            // the block itself
        mesh(cap(loop, H), col, scene, { sketchy: false, mat: inkC });
        scene.add(new THREE.Mesh(ribbon(skin, .35, 3.5, 4), shopMat));                 // shopfronts, right around
        band(loop, 2.2, 3.62, .18, C.awning[bi % 3]);                                   // awning
        for (let f = 0; f < floors; f++) {
          const y = GROUND + f * FLOOR;
          scene.add(new THREE.Mesh(ribbon(skin, y + .95, y + 2.75, 3.4), winMat));      // window band, in the shade of the slab
          balcony(loop, BAL, y - .04, col);
        }
        balcony(loop, BAL, H, col, .8);                                                 // roof edge
        if (bi % 3 === 1) {                                                              // straight stair tower at one end, flat and unbanded
          const am = bi % 2 ? s0 + D(2.2) : s1 - D(2.2), tg = new THREE.Group(); tg.position.copy(P(FACADE + 5.5, am, 0)); tg.rotation.y = -am; scene.add(tg);
          mesh(new THREE.BoxGeometry(3.4, H + 3.2, 7).translate(0, (H + 3.2) / 2, 0), col, tg, { thresh: 30 });
          for (let f = 0; f < floors; f++) mesh(new THREE.BoxGeometry(.7, 1.5, .2).translate(0, GROUND + f * FLOOR + 1.6, -3.55), 0x4e5a61, tg, { sketchy: false });
        }
        for (let q = 0; q < 2; q++) {   // roof clutter
          const ang = s0 + (s1 - s0) * (.25 + rnd() * .5), rad = FACADE + 6 + rnd() * 5, rg = new THREE.Group(); rg.position.copy(P(rad, ang, H)); rg.rotation.y = -ang; scene.add(rg);
          if (q === 0) mesh(new THREE.BoxGeometry(3.2, 2.4, 2.6).translate(0, 1.2, 0), col, rg, { thresh: 20 });
          else { mesh(new THREE.BoxGeometry(1.6, .8, 1.6).translate(0, .4, 0), 0xaaa597, rg, { sketchy: false }); mesh(new THREE.CylinderGeometry(.9, .9, 1.3, 10).translate(0, 1.45, 0), 0xb9b3a6, rg, { thresh: 30 }); }
        }
      }
      if (cinema) {
        const mid = (s0 + s1) / 2;
        cinemaAt = mid;
        // kept from the local line: the hall with its hipped roof stands behind the front block, as in the archive photo
        const hall = new THREE.Group(); hall.position.copy(P(FACADE + DEPTH + 9, mid, 0)); hall.rotation.y = -mid; scene.add(hall);
        mesh(new THREE.BoxGeometry(22, 13, 18).translate(0, 6.5, 0), col, hall, { thresh: 20 });
        mesh(new THREE.ConeGeometry(1, 1, 4, 1).rotateY(Math.PI / 4).scale(15.6, 4.5, 12.7).translate(0, 15.25, 0), 0xb3ad9f, hall, { thresh: 20 });
        arcLine(FACADE - .02, s0 + D(1), s1 - D(1), 9.8); arcLine(FACADE - .02, s0 + D(1), s1 - D(1), 12);
        const BOARD = FACADE - 2.0;                                  // in front of the balcony bands, so nothing covers it
        const mq = new THREE.Mesh(new THREE.PlaneGeometry(11, 2.4), new THREE.MeshBasicMaterial({ map: marqueeTex(), transparent: true, side: THREE.DoubleSide }));
        mq.position.copy(P(BOARD, mid, 6.4)); mq.rotation.y = -mid; scene.add(mq);
        const posters = [
          posterTex("#35575a", "#ecdfbd", ["שלגייה", "ושבעת", "הגמדים"], "הצגות 4 · 7 · 9.30", true),
          posterTex("#7a3d35", "#ecdfbd", ["יומן", "קולנוע"], "חדשות העולם", false),
          posterTex("#3c4a66", "#ecdfbd", ["הערב", "הצגה", "חגיגית"], "פרמיירה", false)
        ];
        [.22, .5, .78].forEach((f, j) => {
          const ang = s0 + (s1 - s0) * f;
          const pl = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 3.3), new THREE.MeshBasicMaterial({ map: posters[j], side: THREE.DoubleSide }));
          pl.position.copy(P(BOARD, ang, 3.0)); pl.rotation.y = -ang; scene.add(pl);
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
  // 1930s street figures: varied build and posture, wool and cotton clothes in muted tones; hats by sex; children are smaller, not mini adults
  const SKIN = [0xe2b991, 0xc9936b, 0xf0cba8, 0xa8714f], HAIR = [0x2c2118, 0x5a4330, 0x8a6a48, 0x1f1a16], PANTS = [0x5b5447, 0x6d6457, 0x3f4650, 0x7a6e5f, 0x8d8a80];
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  function person(coat, sitting = false, woman = false, child = false) {   // standing figure: about 1.7 m to the top of the hat
    const g = new THREE.Group(), sit = sitting ? -.27 : 0, S = child ? .66 : .92 + rnd() * .14, wide = .9 + rnd() * .2;
    g.scale.setScalar(S);
    const pants = pick(PANTS), skin = pick(SKIN), hair = pick(HAIR);
    if (child) {                                                     // short trousers, bare legs
      for (const x of [.09, -.09]) mesh(new THREE.CylinderGeometry(.07, .06, .6, 6).translate(x, .3, 0), skin, g, { sketchy: false });
      mesh(new THREE.CylinderGeometry(.19, .21, .4, 8).translate(0, .88 + sit, 0), pants, g, { sketchy: false });
    } else if (!sitting) {
      for (const x of [.1, -.1]) mesh(new THREE.CylinderGeometry(.1, .12, .8, 6).translate(x, .4, 0), pants, g, { sketchy: false });
    } else {
      for (const x of [.1, -.1]) mesh(new THREE.CylinderGeometry(.1, .12, .62, 6).rotateX(Math.PI / 2).translate(x, .34, .3), pants, g, { sketchy: false });
    }
    if (woman) {
      mesh(new THREE.ConeGeometry(.3 * wide, .95, 12, 1, true).translate(0, .45 + sit + .06, 0), coat, g, { sketchy: false });   // dress to below the knee
      mesh(new THREE.CylinderGeometry(.16, .19, .42, 10).translate(0, 1.0 + sit, 0), coat, g, { sketchy: false });                   // bodice
    } else if (!child) {
      mesh(new THREE.CylinderGeometry(.2 * wide, .27 * wide, .74, 10).translate(0, 1.13 + sit, 0), coat, g, { sketchy: false });    // jacket
    } else {
      mesh(new THREE.CylinderGeometry(.18, .2, .45, 8).translate(0, 1.0, 0), coat, g, { sketchy: false });                             // shirt
    }
    for (const sd of [1, -1]) {                                      // arms hang at slightly different angles
      const sw = sd * (.08 + rnd() * .14);
      mesh(new THREE.CylinderGeometry(.055, .05, .62, 6).translate(0, -.31, 0).rotateZ(sw).translate(sd * .24 * wide, 1.45 + sit, 0), coat, g, { sketchy: false });
      mesh(new THREE.SphereGeometry(.06, 8, 6).translate(sd * (.24 * wide + .02), 1.08 + sit, 0), skin, g, { sketchy: false });
    }
    mesh(new THREE.SphereGeometry(.12, 10, 8).translate(0, 1.6 + sit, 0), skin, g, { thresh: 60, sketchy: false });
    if (woman) {
      mesh(new THREE.SphereGeometry(.135, 10, 8).translate(0, 1.62 + sit, -.02), hair, g, { thresh: 60, sketchy: false });
      mesh(new THREE.CylinderGeometry(.3, .3, .03, 14).translate(0, 1.74 + sit, 0), 0x6b5a48, g, { sketchy: false });               // wide-brim hat
      mesh(new THREE.CylinderGeometry(.14, .15, .14, 12).translate(0, 1.8 + sit, 0), 0x6b5a48, g, { sketchy: false });
    } else if (child) {
      mesh(new THREE.SphereGeometry(.125, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 1.66 + sit, 0), hair, g, { sketchy: false });
    } else {
      mesh(new THREE.SphereGeometry(.125, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2).translate(0, 1.66 + sit, 0), hair, g, { sketchy: false });
      mesh(new THREE.CylinderGeometry(.2, .2, .025, 14).translate(0, 1.72 + sit, 0), 0x3b3129, g, { sketchy: false });              // fedora brim
      mesh(new THREE.CylinderGeometry(.12, .13, .14, 12).translate(0, 1.79 + sit, 0), 0x3b3129, g, { sketchy: false });             // fedora crown
    }
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
  const COATS = [0x8b7d6b, 0x6f7f8a, 0xa5876f, 0x5e6b5f, 0x9c9384, 0x7a5c4a, 0xb8b0a0, 0x4f5a6b, 0xc4b7a0, 0x8f5f55];
  for (let k = 0; k < 22; k++) {                                      // people across the lawn paths, several children
    const r = 18.4 + rnd() * 11, t = rnd() * Math.PI * 2, kid = rnd() < .18, wm = !kid && rnd() < .42;
    if (P(r, t, 0).distanceTo(P(20.5, D(205), 0)) < 6) continue;   // keep the "in the square" camera spot clear
    const g = person(pick(COATS), false, wm, kid); g.position.copy(P(r, t, 0)); g.rotation.y = t + (rnd() - .5) * .9;
  }
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

$("info-btn").addEventListener("click", () => openAbout());

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
  const markerTex = () => canvasIcon((x) => {
    x.fillStyle = "#4a3425"; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill();
    x.fillStyle = "#f4ead0"; x.beginPath(); x.moveTo(64, 108); x.bezierCurveTo(46, 89, 35, 71, 35, 52); x.arc(64, 52, 29, Math.PI, 0); x.bezierCurveTo(93, 71, 82, 89, 64, 108); x.fill();
    x.fillStyle = "#4a3425"; x.beginPath(); x.arc(64, 52, 11, 0, 7); x.fill();
  });
  const ringTex = () => canvasIcon((x) => { x.strokeStyle = "#f0e3c2"; x.lineWidth = 5; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.stroke(); });
  const hotspots = [];
  function addHotspot(key, icon, pos, camPos, lookAt) {
    const mk = (map, ro) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, fog: false })); sp.position.copy(pos); sp.renderOrder = ro; scene.add(sp); return sp; };
    const f = lookAt.clone().sub(camPos).normalize();
    hotspots.push({ key, pos, sp: mk(markerTex(icon), 6), ring: mk(ringTex(), 5), cam: { pos: camPos, yaw: Math.atan2(-f.x, -f.z), pitch: Math.asin(f.y) } });
  }
  const GENIA_AT = P(25.25, D(34), 0);
  addHotspot("genia", "person", P(25.1, D(34), 2.12), P(23.45, D(29.1), 1.62), P(25.05, D(34), 0.94));   // from her side, a little above
  hotspots[hotspots.length - 1].aside = true;
  function clearView() {                                  // nobody strolls between her and whoever is reading about her
    const close = rig.position.distanceTo(GENIA_AT) < 4.6;
    movers.forEach((m) => { m.o.visible = m.o.name === "idle_genia" || !close || m.o.position.distanceTo(GENIA_AT) > 4.4; });
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
    let html = `<div class="head"><div><h2 id="card-title">${esc(c.title)}</h2>${c.by ? `<p class="by">${esc(c.by)}</p>` : ""}<p class="sub">${esc(c.sub)}</p></div><button class="x" id="card-x" aria-label="סגירה"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="scroll">`;
    (c.figs || []).forEach((f) => { html += `<figure class="${f.port ? "port" : ""}"><img src="${f.src}" alt="${esc(f.alt)}"><figcaption>${esc(f.cap)}</figcaption></figure>`; });
    if (c.video) html += `<button class="vid" id="vid" aria-label="נגן את הסרטון" style="aspect-ratio:${c.ratio || '16 / 9'};background-image:url(https://img.youtube.com/vi/${c.video}/hqdefault.jpg)"><span>▶</span></button>`;
    c.body.forEach((t) => { html += `<p>${esc(t)}</p>`; });
    html += c.extra || "";
    html += `<ul class="links">${c.links.map((l) => `<li><a href="${l.u}" target="_blank" rel="noopener">${esc(l.t)} ↗</a></li>`).join("")}</ul>`;
    if (c.credit) html += `<p class="credit">${esc(c.credit)}</p>`;
    card.innerHTML = html + "</div>"; card.hidden = false; $("veil").hidden = false; $("notes").hidden = true;
    $("card-x").addEventListener("click", closeCard); $("card-x").focus({ preventScroll: true });
    const v = $("vid");
    if (v) v.addEventListener("click", () => { if (c.captions) { playWithCaptions(v, c); return; } v.outerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${c.video}?autoplay=1&rel=0" title="${esc(c.title)}" style="aspect-ratio:${c.ratio || '16 / 9'}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; });
    setBar(true);
  }
  const barEl = document.querySelector(".bar");
  const setBar = (min) => { barEl.classList.toggle("min", min); closeMenus(); };
  function closeCard() { setBar(false); card.hidden = true; $("veil").hidden = true; card.innerHTML = ""; }
  $("veil").addEventListener("click", closeCard);
  const goHome = () => { closeCard(); if (gyro.on || gyro.listening) gyroOff(); setView("roof"); };
  $("home").addEventListener("click", goHome);
  $("home").addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); goHome(); } });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !card.hidden) closeCard(); });
  const ease = (u) => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
  function asideYaw(h) {                                 // on a wide screen the card covers the right side
    if (!h.aside || innerWidth < 800 || innerHeight < 560) return 0;
    const covered = (Math.min(576, innerWidth * .46) + 22) / innerWidth;
    return Math.atan(covered * Math.tan(29 * Math.PI / 180) * innerWidth / innerHeight);
  }
  function flyTo(h) {
    closeCard(); if (gyro.on || gyro.listening) gyroOff();
    const f = new THREE.Vector3(); camera.getWorldDirection(f);
    const from = { pos: rig.position.clone(), yaw: Math.atan2(-f.x, -f.z), pitch: Math.asin(clamp(f.y, -1, 1)), fov: camera.fov };
    stopMotion(); cam.mode = "fp"; rig.rotation.set(0, 0, 0); look.yaw = from.yaw; look.pitch = from.pitch; setPressed(null); $("hint").textContent = HINT;
    let dy = h.cam.yaw - from.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    flight = { t0: performance.now(), dur: reduce ? 1 : 1300, from, to: { pos: h.cam.pos, yaw: from.yaw + dy - asideYaw(h), pitch: h.cam.pitch, fov: 58 }, h };
  }
  function handleTap(x, y) {
    camera.updateMatrixWorld(); let best = null, bd = 44;
    hotspots.forEach((h) => {
      const v = h.pos.clone().project(camera); if (v.z > 1) return;
      const d = Math.hypot((v.x + 1) / 2 * innerWidth - x, (1 - v.y) / 2 * innerHeight - y);
      if (d < bd) { bd = d; best = h; }
    });
    if (best) flyTo(best); else walkTo(x, y);
  }
  document.querySelectorAll("[data-spot]").forEach((b) => b.addEventListener("click", () => { const h = hotspots.find((x) => x.key === b.dataset.spot); if (h) flyTo(h); }));

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
    const ms = now - last, dt = clamp(ms / 1000, 0, .1); last = now; adapt(ms, now); moveTraffic(now, dt); clearView();
    if (flight) {
      const u = clamp((now - flight.t0) / flight.dur, 0, 1), e = ease(u), a = flight.from, b = flight.to;
      rig.position.lerpVectors(a.pos, b.pos, e); look.yaw = a.yaw + (b.yaw - a.yaw) * e; look.pitch = a.pitch + (b.pitch - a.pitch) * e;
      camera.fov = a.fov + (b.fov - a.fov) * e; camera.updateProjectionMatrix();
      if (flight.arc) rig.position.y += flight.arc * Math.sin(Math.PI * e);
      if (u >= 1) { const h = flight.h; flight = null; if (h) openCard(h); }
    }
    introFrame(now);
    updateCamera(dt);
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
      if (sg.userData.stem) sg.userData.stem.rotation.y = sg.rotation.y;
    });
    hotspots.forEach((h, i) => {
      const d = rig.position.distanceTo(h.pos), s = clamp(d * .036, .45, 6), ph = reduce ? 0 : ((now / 1000 + i * .6) % 1.8) / 1.8;
      h.sp.scale.set(s, s, 1); h.ring.visible = false; h.sp.visible = !(h.aside && d < 5); h.ring.scale.set(s * (1 + ph * .9), s * (1 + ph * .9), 1); h.ring.material.opacity = reduce ? .5 : .75 * (1 - ph);
    });
    introShow();
    carLights();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  grain(); resize(); setView("roof");
  traffic.forEach((c) => { c.g.position.copy(P(c.r, c.t, 0)); c.g.rotation.y = Math.PI - c.t; });
  walkers.forEach((w) => { w.g.position.copy(P(w.r, w.t, 0)); });
  // ---------- loading: one veil until the whole square is ready ----------
  // The model comes gzipped (blender/pack_web.py) and is unpacked here. Old browsers get the plain file.
  const veilLoad = $("loading");
  let shown = false;                                                    // true once the first model is on screen
  function progress(part, text) {
    if (shown) return;
    $("load-bar").style.transform = `scaleX(${part})`; $("load-pct").textContent = Math.round(part * 100) + "%";
    if (text) $("load-text").textContent = text;
  }
  const painted = () => new Promise((ok) => { requestAnimationFrame(() => setTimeout(ok, 0)); setTimeout(ok, 300); });   // let the screen catch up
  async function download(url, size) {
    const res = await fetch(url, { cache: "no-cache" });   // ask the server, a rebuild may have reused the address
    if (!res.ok) throw new Error(url + " " + res.status);
    if (!res.body || !res.body.getReader) return res.arrayBuffer();
    const total = +res.headers.get("content-length") || size, reader = res.body.getReader(), parts = [];
    for (let got = 0; ;) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(value); got += value.length; progress(.9 * Math.min(1, got / total));
    }
    return new Blob(parts).arrayBuffer();
  }
  async function modelBytes(stamp) {
    if (window.DecompressionStream) {
      try {
        let buf = await download("../kikar_web.glb.gz?t=" + stamp, 5692567);
        const sig = new Uint8Array(buf, 0, 2);                          // a server may already have unpacked it on the way
        if (sig[0] === 0x1f && sig[1] === 0x8b) buf = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
        return buf;
      } catch (e) { console.warn("packed model failed, using the plain one", e); }
    }
    return download("../kikar.glb?t=" + stamp, 21449824);
  }
  async function reveal() {                                             // shaders compiled and one frame drawn: lift the veil
    if (shown) return;
    progress(.98, "מדליקים את האור"); await painted();
    renderer.compile(scene, camera); await painted(); await painted();
    progress(1); shown = true;
    await atTheDoor();
    veilLoad.classList.add("done"); introStart();
    setTimeout(() => { veilLoad.hidden = true; if (!introOn && !tourMaybe()) showHint(); }, 700);
  }
  function loadFailed(e) {
    console.error(e);
    if (shown) return;                                                  // a later reload failed: keep what is on screen
    $("load-text").textContent = "הטעינה נכשלה. בדקו את החיבור."; $("load-pct").textContent = "";
    $("load-again").hidden = false; $("load-again").onclick = () => location.reload();
  }

// ---------- replace the procedural geometry with the Blender model ----------
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
      gl_FragColor.rgb = clamp(mat3(0.87496,0.07231,0.06063,0.17522,0.95862,0.13959,0.03588,0.03269,0.82307) * gl_FragColor.rgb + (-0.01500), 0.0, 1.0);
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
      const m = new THREE.MeshBasicMaterial({ map: labelTex(...LABELS[b.key].map(tr)), transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false });
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
  const BUILD = 1795865355;
  setInterval(async () => {
    try {
      const v = await (await fetch("build.json?t=" + Date.now(), { cache: "no-store" })).json();
      if (v.build > BUILD) location.replace("index.html?v=" + v.build);
    } catch (e) { /* hosted copy or offline: keep what is loaded */ }
  }, 5000);
  let stamp = 1795781363;
  loadModel(stamp);                                   // at once, the check below is only for rebuilds
  (async function poll() {
    try {
      const s = await (await fetch("../stamp.json?t=" + Date.now(), { cache: "no-store" })).json();
      if (s.time !== stamp) { stamp = s.time; loadModel(stamp); }
    } catch (e) { /* nothing published yet */ }
    setTimeout(poll, 4000);
  })();
  // ---------- shadows ----------
  // The town never moves, so its shadow map is drawn once. Vehicles and people get their own flat shadow,
  // their shape pressed onto the ground along the same sun: no second pass over the whole model every frame.
  let casts = [];
  const press = new THREE.Matrix4(), local = new THREE.Matrix4(), pt = new THREE.Vector3();
  function shadows(root) {
    const mat = new THREE.MeshBasicMaterial({ color: 0x1b2130, transparent: true, opacity: .38, depthWrite: false, side: THREE.DoubleSide,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
      stencilWrite: true, stencilRef: 1, stencilFunc: THREE.NotEqualStencilFunc, stencilZPass: THREE.ReplaceStencilOp });   // overlaps darken once
    root.updateMatrixWorld(true);
    casts = movers.map((m) => {
      const pos = [], index = [], inv = new THREE.Matrix4().copy(m.o.matrixWorld).invert();
      m.o.traverse((c) => {
        if (!c.isMesh) return;
        c.castShadow = false;
        const p = c.geometry.attributes.position, ix = c.geometry.index, base = pos.length / 3;
        local.multiplyMatrices(inv, c.matrixWorld);
        for (let i = 0; i < p.count; i++) { pt.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(local); pos.push(pt.x, pt.y, pt.z); }
        for (let i = 0, n = ix ? ix.count : p.count; i < n; i++) index.push(base + (ix ? ix.getX(i) : i));
      });
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(index);
      const s = new THREE.Mesh(geo, mat); s.matrixAutoUpdate = false; s.frustumCulled = false; s.renderOrder = -1; root.add(s);
      return { s, o: m.o, g: m.y + .012 };
    });
    renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
    placeShadows();
  }
  function placeShadows() {
    const L = sun.position, x = L.x / L.y, z = L.z / L.y;
    casts.forEach((c) => {
      c.o.updateMatrixWorld();
      press.set(1, -x, 0, c.g * x,  0, 0, 0, c.g,  0, -z, 1, c.g * z,  0, 0, 0, 1);
      c.s.matrix.multiplyMatrices(press, c.o.matrixWorld); c.s.matrixWorldNeedsUpdate = true;
    });
  }
  canvas.addEventListener("webglcontextrestored", () => { renderer.shadowMap.needsUpdate = true; });

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

// ---------- vehicle paint: metal needs something to reflect, so the sky is its environment ----------
  let carSky = null;
  function paint(root) {
    const metal = new Set();
    root.traverse((o) => { if (o.isMesh && /^(car_|bus_blue)/.test(o.material.name)) metal.add(o.material); });
    const apply = () => metal.forEach((m) => { m.envMap = carSky; m.envMapIntensity = .75; m.needsUpdate = true; });
    if (carSky) { apply(); return; }
    new THREE.TextureLoader().load("sky.jpg", (t) => {
      const maker = new THREE.PMREMGenerator(renderer);
      carSky = maker.fromEquirectangular(t).texture; maker.dispose(); t.dispose(); apply();
    });
  }

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

// ---------- on the ground: street names painted on the asphalt, and small blinking dots under the street signs ----------
  const roadName = (name) => canvasTex(1024, 560, (x) => {
    x.fillStyle = "rgba(240,229,200,.95)"; x.font = '400 290px "Secular One", "Heebo", sans-serif';
    x.fillText(name, 512, 292, 980);
  });
  const roadNames = [["דיזנגוף", 348], ["ריינס", 43], ["זמנהוף", 98], ["דיזנגוף", 168], ["פינסקר", 225], ["בן עמי", 299]].map(([name, deg]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 4.6).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: roadName(tr(name)), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    m.position.copy(P(54, D(deg), .06)); m.rotation.y = -D(deg);       // upright for someone looking out from the square
    scene.add(m); return [m, name];
  });
  // a canvas may be drawn before the title font arrives: draw again when it has
  if (document.fonts) document.fonts.load('400 100px "Secular One"', "אבג").then(() => roadNames.forEach(([m, name]) => { m.material.map = roadName(tr(name)); m.material.needsUpdate = true; })).catch(() => {});
  const blipGeo = new THREE.RingGeometry(.32, .355, 40).rotateX(-Math.PI / 2);
  function radar(now) {
    scene.children.forEach((o, i) => {
      if (!o.userData.pad) return;
      let r = o.userData.ring;
      if (!r) {
        r = o.userData.ring = new THREE.Mesh(blipGeo, new THREE.MeshBasicMaterial({ color: o.material.color, transparent: true, depthWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -5, polygonOffsetUnits: -5 }));
        r.position.y = .01; o.add(r);
      }
      const t = reduce ? .3 : ((now / 1000 + i * .37) % 1.8) / 1.8;
      r.scale.setScalar(1 + t * 1.3); r.material.opacity = .75 * (1 - t);
      o.material.opacity = .62 + .33 * Math.cos(t * 6.283);   // the dot itself blinks softly
    });
    if (!reduce) requestAnimationFrame(radar);
  }
  requestAnimationFrame(radar);
  if (reduce) setTimeout(() => radar(0), 1500);                          // still rings, once the building labels exist

// ---------- corner posts with street names: one iron post, one blue enamel blade along each street ----------
  // A period-style reading: no photo of such a post at this square was found. A post on both corners of all six mouths.
  const MOUTHS = [[348, "דיזנגוף", "DIZENGOFF ST."], [43, "ריינס", "REINES ST."], [98, "זמנהוף", "ZAMENHOF ST."],
                  [168, "דיזנגוף", "DIZENGOFF ST."], [225, "פינסקר", "PINSKER ST."], [299, "בן עמי", "BEN AMI ST."]];
  const RING = { he: "דיזנגוף", en: "DIZENGOFF ST." };      // the road round the square carries Dizengoff's name
  // [radius, degrees from the street's axis]; the usual place is [45.3, 6.8], the others dodge a lamp or an ad column
  const MOVED = { "348:-1": [45.3, 8.8], "348:1": [45.3, 8.8], "168:-1": [44.6, 6.8] };
  const SIGN_H3 = 3.0;                                      // both blades of a post sit level
  const POSTS = [];
  MOUTHS.forEach(([street, he, en]) => [-1, 1].forEach((side) => {
    const [r, off] = MOVED[street + ":" + side] || [45.3, 6.8];
    POSTS.push({ r, deg: street + side * off, blades: [
      { he, en, y: SIGN_H3, along: street },                   // runs out into the side street
      { ...RING, y: SIGN_H3, round: side },                    // runs along the ring, away from the mouth
    ] });
  }));
  const BLADE_L = 1.15, BLADE_H = .43, BLADE_TIP = .15, TEX_H = 284, TEX_W = Math.round(TEX_H * BLADE_L / BLADE_H);
  // the blade seen from one side: tip = 1 points to the viewer's right, -1 to the left
  function bladeTex(he, en, tip) {
    return canvasTex(TEX_W, TEX_H, (x) => {
      const t = TEX_W * BLADE_TIP / BLADE_L, X = (v) => tip > 0 ? v : TEX_W - v;
      const outline = (m) => {
        x.beginPath(); x.moveTo(X(m), m); x.lineTo(X(TEX_W - t - m * .4), m); x.lineTo(X(TEX_W - m * 1.7), TEX_H / 2);
        x.lineTo(X(TEX_W - t - m * .4), TEX_H - m); x.lineTo(X(m), TEX_H - m); x.closePath();
      };
      x.fillStyle = "#1c2c63"; x.fillRect(0, 0, TEX_W, TEX_H);
      x.strokeStyle = "#f4efe0"; x.lineWidth = 9; outline(17); x.stroke();
      const mid = X((TEX_W - t * .55) / 2), wide = TEX_W - t - 80;
      x.fillStyle = "#f7f3e6";
      const small = "700 74px " + SERIF, big = "900 142px " + SERIF, gap = 20, pre = "רח", tick = 22;     // "street" small, the name large
      x.font = small; const wr = x.measureText(pre).width, wp = wr + tick; x.font = big; const wn = x.measureText(he).width;
      const k = Math.min(1, wide / (wp + gap + wn));
      x.save(); x.translate(mid, 152); x.scale(k, k); x.textAlign = "right"; x.textBaseline = "alphabetic";
      const right = (wp + gap + wn) / 2;                                                      // reading starts here
      x.font = small; x.fillText(pre, right, 0);
      x.strokeStyle = x.fillStyle; x.lineWidth = 8; x.lineCap = "round"; x.beginPath();       // the geresh drawn by hand: the font's looks like a yod
      x.moveTo(right - wr - 8, -52); x.lineTo(right - wr - 18, -31); x.stroke(); x.font = big; x.fillText(he, right - wp - gap, 0); x.restore();
      x.font = "700 62px " + SERIF; x.direction = "ltr"; x.fillText(en, mid, 214, wide);
    });
  }
  const bladeShape = (tip) => {                             // in the blade's own plane: the post at x = 0
    const s = new THREE.Shape(), L = BLADE_L * tip, T = BLADE_TIP * tip, h = BLADE_H / 2;
    s.moveTo(0, -h); s.lineTo(L - T, -h); s.lineTo(L, 0); s.lineTo(L - T, h); s.lineTo(0, h); s.closePath();
    return s;
  };
  const bladeMaps = {};                                     // each name is drawn once for each side it is seen from
  function bladeFace(he, en, tip, mats) {
    const geo = new THREE.ShapeGeometry(bladeShape(tip)), p = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / BLADE_L + (tip > 0 ? 0 : 1), p.getY(i) / BLADE_H + .5);
    const key = he + tip;
    if (!bladeMaps[key]) { bladeMaps[key] = bladeTex(he, en, tip); bladeMaps[key].anisotropy = 8; }
    const map = bladeMaps[key];
    if (!mats[key]) mats[key] = new THREE.MeshLambertMaterial({ map, emissive: 0xffffff, emissiveMap: map, emissiveIntensity: .3 });   // readable on the shade side too
    return new THREE.Mesh(geo, mats[key]);
  }
  // added to the loaded model before merge(), so all posts cost a handful of draw calls and cast into the one shadow map
  function signposts(root) {
    const mats = {}, iron = new THREE.MeshLambertMaterial({ color: 0x25332d }), rim = new THREE.MeshLambertMaterial({ color: 0xe9e3d2 });
    POSTS.forEach((post) => {
      const at = P(post.r, D(post.deg), .1);
      solids.push([at.x, at.z, .55]);                       // a walker steps round it
      const g = new THREE.Group(); g.name = "signpost"; g.position.copy(at); root.add(g);
      const part = (geo, mat, y, into) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; m.castShadow = m.receiveShadow = true; (into || g).add(m); return m; };
      const top = Math.max(...post.blades.map((b) => b.y)) + BLADE_H / 2;
      part(new THREE.CylinderGeometry(.14, .17, .12, 16), iron, .06);                      // foot
      part(new THREE.CylinderGeometry(.085, .12, .42, 16), iron, .33);
      part(new THREE.CylinderGeometry(.105, .105, .05, 16), iron, .56);
      part(new THREE.CylinderGeometry(.048, .062, top, 14), iron, top / 2 + .02);          // shaft
      part(new THREE.CylinderGeometry(.085, .085, .05, 14), iron, top + .05);              // cap and ball
      part(new THREE.SphereGeometry(.085, 16, 12), iron, top + .15);
      part(new THREE.ConeGeometry(.032, .13, 10), iron, top + .28);
      post.blades.forEach((b) => {
        const t = D(post.deg), dir = b.along !== undefined ? P(1, D(b.along), 0) : new THREE.Vector3(Math.cos(t), 0, Math.sin(t)).multiplyScalar(b.round);
        const arm = new THREE.Group(); arm.position.y = b.y; arm.rotation.y = Math.atan2(-dir.z, dir.x); g.add(arm);   // the arm's +x runs along the street
        const plate = new THREE.ExtrudeGeometry(bladeShape(1), { depth: .026, bevelEnabled: false }); plate.translate(.06, 0, -.013);
        part(plate, rim, 0, arm);
        const front = bladeFace(b.he, b.en, 1, mats); front.position.set(.06, 0, .0145); arm.add(front);
        const back = bladeFace(b.he, b.en, -1, mats); back.position.set(.06, 0, -.0145); back.rotation.y = Math.PI; arm.add(back);
      });
      new Set(post.blades.map((b) => b.y)).forEach((y) => [-1, 1].forEach((s) => part(new THREE.CylinderGeometry(.072, .072, .045, 14), iron, y + s * (BLADE_H / 2 - .035))));   // clamps
    });
  }
// ---------- point of interest: the opening of the square, January 1938 ----------
  // Facts: municipal announcement no. 4 (data/research_images/3623f3ae), the film's own captions, and the Israel Film Archive record.
  CARDS.opening = {
    title: "חנוכת כיכר צינה דיזנגוף", by: "26 בינואר 1938", sub: "הסרט: יומן כרמל, נתן אקסלרוד, ינואר 1938",
    video: "SdrtVZkEUTg", ratio: "4 / 3", captions: true,
    body: [
      "הכיכר נחנכה בטקס פומבי ביום רביעי, כ״ד בשבט תרצ״ח, ביום הזיכרון השמיני לצינה דיזנגוף, אשתו של ראש העירייה המנוח מאיר דיזנגוף.",
      "לפי המודעה העירונית על הטקס, העירייה נטעה וסידרה את הכיכר לזכרה, בעזרת תרומות של עובדי העירייה ושל בעלי הבתים והמגרשים שמסביב. הטקס נקבע לשעה 16:30, והכניסה למוזמנים הייתה מרחוב דיזנגוף, מצד רחוב המלך ג׳ורג׳.",
      "הסרט נמשך קצת יותר מדקה. רואים בו את הכיכר ביום ובלילה: דקל צעיר, ספסלים לבנים, מבט מלמעלה אל הבריכה, והמזרקה מוארת בחושך.",
      "בכתוביות נאמר שהכיכר ״נחנכה השבוע ברוב עם״, שניטעו בה תמרים שהובאו מגן רחל בכנרת, ושהוצבו בה 28 ספסלים לבנים, מזרקה ופנסים."
    ],
    credit: "מקורות: מודעה עירונית מס׳ 4 של עיריית תל אביב, ארכיון הסרטים הישראלי, וכתוביות הסרט (אוסף יומני כרמל, נתן אקסלרוד).",
    links: [
      { t: "הסרט ביוטיוב", u: "https://youtu.be/SdrtVZkEUTg" },
      { t: "ארכיון הסרטים הישראלי: רשומת הסרט", u: "https://jfc.org.il/news_journal/27482-2/93669-2/" },
      { t: "ויקיפדיה: כיכר צינה דיזנגוף", u: WIKI_SQ }
    ]
  };
  // over the near side of the pool: in the middle of the square, and already in sight in the opening view
  addHotspot("opening", "play", P(7.5, D(230), 3.6), P(18.5, D(222), 1.7), P(2, D(230), 3.4));

// ---------- point of interest: Zina Dizengoff, whose name the square carries ----------
  // Facts: Hebrew Wikipedia (צינה דיזנגוף) and municipal announcement no. 4 (the date of the ceremony and the
  // eighth memorial day). Portrait: Zvi Oron, 1920s, Central Zionist Archives, Wikimedia Commons, public domain.
  {
    const file = "https://commons.wikimedia.org/wiki/", name = "ZinaDizenghof22.jpg";
    const p = (t) => `<p>${esc(t)}</p>`;
    CARDS.zina = {
      title: say("צינה דיזנגוף", "Zina Dizengoff"), by: say("האישה שעל שמה הכיכר", "The woman the square is named after"), sub: say("1872 עד 1930", "1872 to 1930"),
      body: [],
      extra: `<figure class="beside" style="width:9.5rem"><a href="${file}File:${name}" target="_blank" rel="noopener"><img src="${file}Special:FilePath/${name}?width=330" alt="${say("דיוקן של צינה דיזנגוף", "Portrait of Zina Dizengoff")}" onerror="this.closest('figure').remove()"></a><figcaption>${say("צילום: צבי אורון, שנות ה־20, עותק מעובד. הארכיון הציוני, ויקישיתוף, נחלת הכלל.", "Photo: Zvi Oron, 1920s, retouched copy. Central Zionist Archives, Wikimedia Commons, public domain.")}</figcaption></figure>`
        + p(say("צינה דיזנגוף הייתה אשתו של מאיר דיזנגוף, ראש העירייה הראשון של תל אביב. היא מתה בפברואר 1930. אחרי מותה תרם בעלה את ביתם להקמת מוזיאון לאמנות בעיר.", "Zina Dizengoff was the wife of Meir Dizengoff, the first mayor of Tel Aviv. She died in February 1930. After her death her husband gave their home to the city for an art museum."))
        + p(say("הכיכר נחנכה ב־26 בינואר 1938, ביום הזיכרון השמיני למותה. מאיר דיזנגוף לא ראה את הטקס: הוא נפטר ב־1936.", "The square opened on 26 January 1938, the eighth memorial day of her death. Meir Dizengoff did not see the ceremony: he died in 1936.")),
      credit: say("מקורות: ויקיפדיה העברית, ומודעה עירונית מס׳ 4 של עיריית תל אביב.", "Sources: Hebrew Wikipedia and Tel Aviv Municipality notice no. 4."),
      links: [
        { t: say("ויקיפדיה: צינה דיזנגוף", "Hebrew Wikipedia: Zina Dizengoff"), u: "https://he.wikipedia.org/wiki/%D7%A6%D7%99%D7%A0%D7%94_%D7%93%D7%99%D7%96%D7%A0%D7%92%D7%95%D7%A3" },
        { t: say("ויקיפדיה: כיכר צינה דיזנגוף", "Hebrew Wikipedia: Zina Dizengoff Square"), u: WIKI_SQ }
      ]
    };
  }
  // over the lawn on the near side of the pool, seen from the walk with the fountain behind it
  addHotspot("zina", "person", P(12.5, D(138), 3.0), P(21.5, D(137), 1.7), P(4, D(140), 2.6));
  hotspots[hotspots.length - 1].aside = true;

// ---------- point of interest: how the square changed, from the 1934 plan to today ----------
  // Facts: Hebrew Wikipedia (כיכר צינה דיזנגוף). First evening: Haaretz, 27.1.1938, as quoted by golden-lotus.co.il.
  // The 1940s parade: the typed caption on the print itself. Photographs are loaded from Wikimedia Commons,
  // each under the licence written beneath it, so nothing is copied into the (public) repository.
  {
    const commons = "https://commons.wikimedia.org/wiki/";
    const photo = (name, alt, cap) => `<figure class="shot"><a href="${commons}File:${encodeURIComponent(name)}" target="_blank" rel="noopener"><img src="${commons}Special:FilePath/${encodeURIComponent(name)}?width=500" alt="${alt}" loading="lazy" onerror="this.closest('figure').remove()"></a><figcaption>${cap}</figcaption></figure>`;
    // today against 1940 in one frame. The 1940 side is our own scene, photographed from where the 2024 camera stood
    // (position solved from the pool and the kerb of the photograph: the cinema roof, 19.4 m up, 53 m east of the fountain)
    const compare = (name) => `<figure class="compare"><div class="cmp" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-label="${say("השוואה בין הכיכר היום לשחזור של 1940", "The square today against the 1940 reconstruction")}">
        <img src="${commons}Special:FilePath/${encodeURIComponent(name)}?width=960" alt="${say("הכיכר בלילה במבט מלמעלה", "The square at night, seen from above")}" loading="lazy" draggable="false" onerror="this.closest('figure').remove()">
        <img class="then" src="../about/then_1940_night.webp" alt="${say("אותה זווית בשחזור של 1940", "The same angle in the 1940 reconstruction")}" loading="lazy" draggable="false" onerror="this.closest('figure').remove()">
        <span class="tag now">${say("היום · 2024", "Today · 2024")}</span><span class="tag past">${say("השחזור · 1940", "Reconstruction · 1940")}</span><i aria-hidden="true"></i></div>
      <figcaption>${say("2024. צילום: שלמה רודד, ויקישיתוף (פיקיוויקי), <bdi>CC BY 2.5</bdi>.", "2024. Photo: Shlomo Roded, Wikimedia Commons (PikiWiki), CC BY 2.5.")} <a href="${commons}File:${encodeURIComponent(name)}" target="_blank" rel="noopener">${say("לתצלום המלא", "Full photograph")} ↗</a></figcaption></figure>`;
    const era = (year, title, text, pictures) => `<h3>${year} · ${title}</h3><p>${text}</p>${pictures || ""}`;
    CARDS.levels = {
      title: say("הכיכר שעולה ויורדת", "The square that rose and fell"), by: say("הגלגולים שלה לאורך השנים", "Its changes through the years"), sub: say("מ־1934 עד היום", "From 1934 to today"),
      body: [say("אותו מעגל, כמה כיכרות שונות. בסצנה רואים את הראשונה: שטוחה, בגובה הרחוב. לחיצה על תצלום פותחת אותו בגדול.", "One circle, several different squares. The scene shows the first: flat, at street level. Tap a photograph to see it full size.")],
      extra:
        era("1934", say("ההגבהה שנדחתה", "The raised plan, put off"), say("ג'ניה אוורבוך זכתה בתחרות לעיצוב הכיכר. בתוכנית המקורית הכיכר הייתה אמורה לעמוד כמטר מעל סביבתה, ומתחתיה תחנת מוניות וחניה. בגלל העלות הגבוהה ומיעוט כלי הרכב הוחלט לדחות את זה לעתיד.", "Genia Averbuch won the competition to design the square. In the original plan the square was to stand about a metre above its surroundings, with a taxi stand and parking beneath. Because of the high cost and the small number of vehicles, this was left for the future."),
          `<figure class="shot"><img src="${IMG_PLAN}" alt="${say("תוכנית אוורבוך לסידור הכיכר", "Averbuch's plan for the layout of the square")}" loading="lazy" onerror="this.parentNode.remove()"><figcaption>${say("תוכנית אוורבוך לסידור הכיכר. ידיעות עיריית תל אביב.", "Averbuch's plan for the layout of the square. Tel Aviv Municipality News.")}</figcaption></figure>`)
        + era("1938", say("החנוכה", "The opening"), say("ב־26 בינואר 1938 נחנכה הכיכר: מעגל תנועה בקוטר של כ־66 מטר, ובמרכזו בריכה ומזרקה, דשא, שבילים וערוגות. לפי עיתון הארץ מהבוקר שאחרי, הגן הואר אז לראשונה בלילה והמזרקה זהרה באורות צבעוניים.", "The square opened on 26 January 1938: a roundabout about 66 metres across, with a pool and fountain in the middle, lawns, paths and flower beds. According to the newspaper Haaretz the next morning, the garden was then lit at night for the first time and the fountain glowed in coloured light."),
          photo("110274 tel aviv - dizengoff square PikiWiki Israel.png", say("הכיכר והמזרקה בשנות השלושים", "The square and the fountain in the 1930s"), say("שנות ה־30. צלם לא ידוע, ויקישיתוף, נחלת הכלל.", "1930s. Photographer unknown, Wikimedia Commons, public domain.")))
        + era(say("שנות ה־40", "1940s"), say("מקום של טקסים", "A place for ceremonies"), say("על התצלום מוקלד Soldiers' Day, יום החייל: טורי חיילים צועדים בכיכר וקהל גדול מסביב. התאריך המדויק לא ידוע.", "The words Soldiers' Day are typed on the print: columns of soldiers march through the square, with a large crowd around them. The exact date is unknown."),
          photo("109688 tel aviv - dizengoff square PikiWiki Israel.png", say("חיילים צועדים בכיכר דיזנגוף", "Soldiers marching in Dizengoff Square"), say("1941 עד 1943. צלם לא ידוע, ויקישיתוף, נחלת הכלל.", "1941 to 1943. Photographer unknown, Wikimedia Commons, public domain.")))
        + era("1948", say("הגן גדל", "The garden grows"), say("העצים והדקלים צמחו והכיכר נעשתה גן מוצל. הבניינים האחרונים סביבה הושלמו רק בשנות ה־50, ובמרץ 1959 נפתח בה כלבו המשביר לצרכן.", "The trees and palms grew and the square became a shady garden. The last buildings around it were finished only in the 1950s, and in March 1959 the Hamashbir LaTzarchan department store opened there."),
          photo("PikiWiki Israel 46886 Dizengoff Square in Tel Aviv.jpg", say("צמחייה גבוהה והמזרקה", "Tall planting and the fountain"), say("1948 עד 1951. צלם לא ידוע, ויקישיתוף, נחלת הכלל.", "1948 to 1951. Photographer unknown, Wikimedia Commons, public domain.")))
        + era("1976", say("הכיכר עולה", "The square goes up"), say("ביולי 1976 התחילו העבודות, בתכנון האדריכל צבי לישר. רחוב דיזנגוף עבר ישר מתחת, והכיכר נבנתה מעליו. היא נחנכה ב־25 ביולי 1978.", "Work began in July 1976, to a design by the architect Tsvi Lissar. Dizengoff Street ran straight underneath and the square was built above it. It opened on 25 July 1978."),
          photo("Building the new circle on Dizengoff street in Tel Aviv (FL46002932).jpg", say("הכיכר המוגבהת בבנייה מעל הכביש", "The raised square being built over the road"), say("14 ביוני 1978. צילום: דני גוטפריד, אוסף דן הדני, הספרייה הלאומית, ויקישיתוף, CC BY 4.0.", "14 June 1978. Photo: Danny Gotfried, Dan Hadani Collection, National Library of Israel, Wikimedia Commons, CC BY 4.0.")))
        + era("1978", say("קשתות זכוכית", "Glass arches"), say("במרכז הבריכה החדשה, שנבנתה בממדי המקורית, הוצב פסל של אלן דוד: שלוש קשתות זכוכית ובתוכן מזרקה.", "In the middle of the new pool, built to the size of the first one, stood a sculpture by Alain David: three glass arches with a fountain inside them."),
          photo("Building the new circle on Dizengoff street in Tel Aviv (FL62628168).jpg", say("פסל הקשתות במרכז הבריכה", "The arches sculpture in the middle of the pool"), say("1978. צלם IPPA, אוסף דן הדני, הספרייה הלאומית, ויקישיתוף, CC BY 4.0.", "1978. Photo: IPPA, Dan Hadani Collection, National Library of Israel, Wikimedia Commons, CC BY 4.0.")))
        + era("1986", say("אש ומים", "Fire and water"), say("ביולי 1986 הוחלף הפסל ב״אש ומים״, פסל קינטי של יעקב אגם.", "In July 1986 the sculpture was replaced by Fire and Water, a kinetic sculpture by Yaacov Agam."),
          photo("כיכר דיזנגוף - אתרי מורשת בתל אביב 2016 (9).jpg", say("מזרקת אגם מוארת בלילה", "Agam's fountain lit at night"), say("צולם ב־2016. צילום: Chenspec, ויקישיתוף, CC BY-SA 4.0.", "Taken in 2016. Photo: Chenspec, Wikimedia Commons, CC BY-SA 4.0.")))
        + era("2017", say("הכיכר יורדת", "The square comes down"), say("ב־2016 החליטה העירייה להחזיר את הכיכר למתכונתה המקורית. ההריסה התחילה בינואר 2017, ובנובמבר 2018 הסתיימו העבודות והפסל של אגם חזר.", "In 2016 the city decided to return the square to its original form. Demolition began in January 2017, and in November 2018 the work was finished and Agam's sculpture came back."),
          photo("PikiWiki Israel 51775 dizengoff square - period of excavations.jpg", say("הכיכר בזמן העבודות", "The square during the works"), say("2018. צילום: שאולה הייטנר, ויקישיתוף (פיקיוויקי), CC BY 2.5.", "2018. Photo: Shaula Haitner, Wikimedia Commons (PikiWiki), CC BY 2.5.")))
        + era(say("היום", "Today"), say("שוב בגובה הרחוב", "At street level again"), say("הכיכר שוב שטוחה. התצלום נעשה מבניין קולנוע אסתר, היום מלון. גררו את הקו כדי לראות את אותה זווית בשחזור של 1940.", "The square is flat again. The photograph was taken from the Esther Cinema building, now a hotel. Drag the line to see the same angle in the 1940 reconstruction."),
          compare("115057 zina dizengoff square day and night PikiWiki Israel.jpg")),
      credit: say("מקורות: ויקיפדיה העברית, כיכר צינה דיזנגוף. הציטוט מעיתון הארץ לפי אתר לוטוס הזהב.", "Sources: Hebrew Wikipedia, Zina Dizengoff Square. The report from Haaretz is quoted from the Golden Lotus website."),
      links: [
        { t: say("ויקיפדיה: כיכר צינה דיזנגוף", "Hebrew Wikipedia: Zina Dizengoff Square"), u: WIKI_SQ },
        { t: say("לוטוס הזהב: כיכר צינה דיזנגוף", "Golden Lotus: Zina Dizengoff Square (Hebrew)"), u: "https://golden-lotus.co.il/zina/" }
      ]
    };
  }
  // over the lawn on the north-west side of the pool
  addHotspot("levels", "person", P(12.5, D(318), 3.0), P(21.5, D(317), 1.7), P(4, D(320), 2.6));
  hotspots[hotspots.length - 1].aside = true;

// ---------- dragging the line of the comparison ----------
  {
    const box = $("card"); let grab = null;
    const place = (el, v) => { v = clamp(v, 0, 100); el.style.setProperty("--at", v + "%"); el.setAttribute("aria-valuenow", String(Math.round(v))); };
    const to = (el, x) => { const r = el.getBoundingClientRect(); place(el, (x - r.left) / r.width * 100); };
    box.addEventListener("pointerdown", (e) => {
      const el = e.target.closest(".cmp"); if (!el) return;
      grab = { el, x: e.clientX, y: e.clientY, on: e.pointerType === "mouse" };
      if (grab.on) { e.preventDefault(); el.setPointerCapture(e.pointerId); to(el, e.clientX); }
    });
    box.addEventListener("pointermove", (e) => {
      if (!grab) return;
      if (!grab.on) {
        const dx = Math.abs(e.clientX - grab.x);
        if (dx < 6 || dx < Math.abs(e.clientY - grab.y)) return;
        grab.on = true; grab.el.setPointerCapture(e.pointerId);
      }
      to(grab.el, e.clientX);
    });
    box.addEventListener("pointerup", (e) => { if (grab && (grab.on || Math.hypot(e.clientX - grab.x, e.clientY - grab.y) < 6)) to(grab.el, e.clientX); grab = null; });
    box.addEventListener("pointercancel", () => { grab = null; });
    box.addEventListener("keydown", (e) => {
      const el = e.target.closest(".cmp"), step = { ArrowLeft: -5, ArrowRight: 5 }[e.key]; if (!el || !step) return;
      e.preventDefault(); place(el, Number(el.getAttribute("aria-valuenow")) + step);
    });
  }
  // ---------- the cards in English (Zina, the levels, the cinema and "about" carry both languages in their own files) ----------
  if (LANG_EN) {
    const wiki = { t: "Hebrew Wikipedia: Zina Dizengoff Square", u: WIKI_SQ };
    Object.assign(CARDS.opening, {
      title: "The opening of Zina Dizengoff Square", by: "26 January 1938", sub: "The film: Carmel newsreel, Nathan Axelrod, January 1938",
      body: [
        "The square was opened at a public ceremony on Wednesday, 24 Shevat 5698, the eighth memorial day of Zina Dizengoff, wife of the late mayor Meir Dizengoff.",
        "According to the municipal notice of the ceremony, the city planted and laid out the square in her memory, helped by contributions from city employees and from the owners of the houses and plots around it. The ceremony was set for 4:30 pm, and guests entered from Dizengoff Street, on the King George Street side.",
        "The film runs a little over a minute. It shows the square by day and by night: a young palm, white benches, a view from above over the pool, and the fountain lit in the dark.",
        "The captions say that the square was \u201Copened this week before a large crowd\u201D, that date palms brought from Gan Rachel in Kinneret were planted in it, and that 28 white benches, a fountain and lamps were set up there."
      ],
      credit: "Sources: Tel Aviv Municipality notice no. 4, the Israel Film Archive, and the film's captions (Carmel newsreel collection, Nathan Axelrod).",
      links: [
        { t: "The film on YouTube", u: CARDS.opening.links[0].u },
        { t: "Israel Film Archive: the record of the film (Hebrew)", u: CARDS.opening.links[1].u },
        wiki
      ]
    });
    Object.assign(CARDS.video, {
      title: "Here We Are: the opening titles", sub: "The square on television", by: "The square as a film set",
      body: [
        "The opening titles of the television series Here We Are were filmed here, in the square. The words of the theme song were changed so that children from all over the country could feel it was about them.",
        "It is a natural choice: the square was the living room of Tel Aviv. Frames from the titles show a market stall, a caf\u00E9 with round tables and white metal chairs, and shops on the ground floor of the curved buildings. This is exactly the life the square was built for.",
        "Note the difference: the titles were filmed in the square of the 1970s, after it had been raised above the road, not in the flat square of 1940 that you see here."
      ],
      credit: "Source: Hebrew Wikipedia, Zina Dizengoff Square. The description of the frames comes from watching the titles.",
      links: [{ t: "The titles on YouTube", u: CARDS.video.links[0].u }, wiki]
    });
    const [portrait, drawing] = CARDS.genia.figs;
    Object.assign(CARDS.genia, {
      title: "Genia Averbuch", by: "Queen of Tel Aviv's Bauhaus", sub: "The square's architect · 1909 to 1977",
      figs: [
        Object.assign({}, portrait, { alt: "Genia Averbuch seated on a chair", cap: "Genia Averbuch. The source of the photograph is unidentified." }),
        Object.assign({}, drawing, { alt: "Averbuch's plan for the square: a view from above and a model", cap: "Plan for the layout of Zina Dizengoff Square, Genia Averbuch. Tel Aviv Municipality News, issue 2, p. 51." })
      ],
      body: [
        "She was 25 when she entered the 1934 competition to design the square, and her plan set the way the square looks to this day. The square opened on 26 January 1938.",
        "She did not design only the garden in the middle. She set a binding code for everyone who built around it: curved fronts that carry on the line of the circle, long horizontal balcony bands and one height. The result is a single round street, not six separate buildings. Some of the buildings she designed herself.",
        "In her plan you can see curved blocks around a central circle, with the gaps between them as the streets. In this reconstruction the angles of the streets and the shape of the blocks were measured from that plan.",
        "Among her other works is Café Galina at the 1934 Levant Fair, together with Elsa Gidoni-Mandelstamm and Shlomo Ginsburg.",
        "A note on the competition: the Hebrew Wikipedia says she won it. Another source says no first prize was awarded, and that she and Y. Grinetz shared second place."
      ],
      credit: "Sources: Hebrew Wikipedia (Zina Dizengoff Square), artlog, and Davidi's article on the Levant Fair.",
      links: [
        { t: "Wikipedia: Genia Averbuch", u: CARDS.genia.links[1].u },
        { t: "Hebrew Wikipedia: Genia Averbuch", u: CARDS.genia.links[0].u },
        { t: "Hebrew Wikipedia: Zina Dizengoff Square", u: WIKI_SQ }
      ]
    });
  }

// ---------- Genia Averbuch's card: the portrait beside the text, the plan where the text talks about it ----------
  {
    const [age, code, plan, cafe, contest] = CARDS.genia.body, [portrait, drawing] = CARDS.genia.figs;
    const p = (t) => `<p>${esc(t)}</p>`;
    const fig = (f, cls) => `<figure class="${cls}"><img src="${f.src}" alt="${esc(f.alt)}"><figcaption>${esc(f.cap)}</figcaption></figure>`;
    Object.assign(CARDS.genia, {
      body: [], figs: [],
      extra: fig(portrait, "beside") + p(age) + p(code) + p(plan.replace("בתוכנית שלמעלה", "בתוכנית שלה")) + fig(drawing, "after") + p(cafe) + p(contest)
    });
  }

// ---------- Hebrew captions over the dedication film ----------
  // The film is silent about its own words on YouTube, so the site lays one line at a time over the player
  // (text: data/dizengoff_opening_he_fixed.srt, put in by make_site.py). YouTube's own captions stay off.
  const CAPTIONS = [[16.6, 18.76, "כיכר צינה דיזנגוף,"], [18.76, 21.279, "שנחנכה השבוע ברוב עם,"], [21.279, 24.263, "נמסרה לרשות הקהל התל אביבי"], [24.263, 25.64, "כשהיא מסודרה"], [25.64, 27.051, "לנוי ולתפארת."], [27.051, 29.439, "בין שטיחי הדשא וערוגות"], [29.439, 32.85, "הפרחים ניטעו גם עצי תמרים"], [32.85, 34.76, "שהובאו מגן רחל"], [34.76, 38.184, "בכנרת. 28 ספסלים לבנים,"], [38.184, 40.12, "מזרקת מים יפה"], [40.12, 43.293, "ופנסים יפים שיאירו בכל ערב"], [43.293, 44.879, "ישמשו את הקהל"], [44.879, 47.719, "למנוחתו."]];
  const CAPTIONS_EN = [                                                // the same lines and times, translated
    "Zina Dizengoff Square,", "opened this week before a large crowd,", "was handed to the public of Tel Aviv,", "laid out",
    "in beauty and splendour.", "Among carpets of grass and beds", "of flowers, date palms were planted too,", "brought from Gan Rachel",
    "in Kinneret. 28 white benches,", "a handsome water fountain", "and handsome lamps, lit every evening,", "will serve the public", "for its rest."
  ];
  if (LANG_EN && CAPTIONS_EN.length === CAPTIONS.length) CAPTIONS.forEach((c, i) => { c[2] = CAPTIONS_EN[i]; });
  let youtube = null;
  const youtubeApi = () => youtube || (youtube = new Promise((ok, no) => {
    if (window.YT && window.YT.Player) return ok();
    window.onYouTubeIframeAPIReady = ok;
    const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api";
    s.onerror = () => { youtube = null; no(); };
    document.head.appendChild(s);
  }));
  function playWithCaptions(button, c) {
    const film = document.createElement("div"); film.className = "film";
    film.innerHTML = '<div></div><p class="cap" aria-live="polite"></p>';
    button.replaceWith(film);
    const plain = () => { film.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${c.video}?autoplay=1&rel=0" title="${esc(c.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; };
    youtubeApi().then(() => {
      if (!film.isConnected) return;                                   // the card was closed meanwhile
      const line = film.querySelector(".cap");
      const player = new YT.Player(film.firstChild, {
        host: "https://www.youtube-nocookie.com", videoId: c.video,
        playerVars: { autoplay: 1, rel: 0, playsinline: 1, fs: 0, cc_load_policy: 0, iv_load_policy: 3 },   // no full screen: it would leave the captions behind
        events: { onStateChange: () => { player.unloadModule("captions"); player.unloadModule("cc"); } }
      });
      const tick = setInterval(() => {
        if (!film.isConnected) { clearInterval(tick); return; }
        if (!player.getCurrentTime) return;
        const t = player.getCurrentTime(), now = CAPTIONS.find((x) => t >= x[0] && t < x[1]);
        const text = now ? now[2] : "";
        if (line.textContent !== text) line.textContent = text;
      }, 150);
    }).catch(plain);
  }

// ---------- the cinema card: its two names and the films of 1939-40 ----------
  // Screening dates and Hebrew titles: "Jerusalem Segal project", Tel Aviv Cinematheque library and archive
  // (cinema.co.il, table of screenings). Robin Hood: Davar, 28.4.1939, as quoted by golden-lotus.co.il.
  // Posters: Wikimedia Commons files marked public domain (the American posters, not the local ones).
  {
    const commons = "https://commons.wikimedia.org/wiki/";
    const poster = (file, name) => `<a href="${commons}File:${encodeURIComponent(file)}" target="_blank" rel="noopener"><img src="${commons}Special:FilePath/${encodeURIComponent(file)}?width=330" alt="${say("כרזת הסרט " + name, "Poster for " + name)}" loading="lazy" onerror="this.parentNode.remove()"><span>${name}</span></a>`;
    const english = (day) => { const [d, m] = day.split("."); return m ? d + " " + "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")[m - 1] : "April"; };   // "1.4" reads as 1 Apr
    const PROGRAMME = "כרטיס לסרט שלגייה ושבעת הגמדים.jpg";
    const films = (year, list) => `<h4>${year}</h4><ul class="films">${list.map(([day, he, en]) => `<li><time>${say(day, english(day))}</time><span>${say(`${he}<bdi>${en}</bdi>`, en)}</span></li>`).join("")}</ul>`;
    if (LANG_EN) Object.assign(CARDS.esther, { title: "Dizengoff Square Cinema", by: "later the Esther Cinema" });
    Object.assign(CARDS.esther, {
      sub: say("נפתח ב־30 במרץ 1939", "Opened on 30 March 1939"),
      body: [
        say("הבניין נבנה ב־1938 עד 1939 עבור אסתר ומשה נתנאל, בתכנון האדריכל יהודה מגידוביץ' ובנו, המהנדס רפאל מגידו. הוא עומד על עמודים, עם חזית קעורה ומרפסות סרט.", "The building went up in 1938 and 1939 for Esther and Moshe Netanel, to a design by the architect Yehuda Magidovitch and his son, the engineer Raphael Megido. It stands on columns, with a concave front and ribbon balconies."),
        say("הקולנוע נפתח בשם קולנוע כיכר דיזנגוף. אחרי שנתו הראשונה שונה שמו לקולנוע אסתר, על שם אסתר נתנאל. המקורות לא נותנים תאריך מדויק לשינוי.", "The cinema opened as the Dizengoff Square Cinema. After its first year it was renamed the Esther Cinema, after Esther Netanel. The sources give no exact date for the change."),
        say("באולם היו כ־1,000 מקומות, והוא תואר כראשון בארץ עם מיזוג אוויר מרכזי. בבניין פעלו קפה אמנות עם רחבת ריקודים וחנות הכלבו אקמן. ב־1998 הוסב הבניין למלון.", "The hall had about 1,000 seats and was described as the first in the country with central air conditioning. The building also held Café Omanut, with a dance floor, and the Ackerman department store. In 1998 it was turned into a hotel.")
      ],
      extra: `<h3>${say("תוכניית ערב הפתיחה", "The programme of the opening night")}</h3>
        <figure class="programme"><a href="${commons}File:${encodeURIComponent(PROGRAMME)}" target="_blank" rel="noopener"><img src="${commons}Special:FilePath/${encodeURIComponent(PROGRAMME)}" alt="${say("תוכניית הפתיחה של קולנוע כיכר דיזנגוף, מרץ 1939, בעברית ובאנגלית", "The opening programme of the Dizengoff Square Cinema, March 1939, in Hebrew and English")}" loading="lazy" onerror="this.closest('figure').remove()"></a><figcaption>${say("צילום: דני גולדשמיד, ויקישיתוף, CC BY-SA 3.0. לחיצה פותחת בגדול.", "Photo: Danny Goldschmidt, Wikimedia Commons, CC BY-SA 3.0. Tap to see it full size.")}</figcaption></figure>
        <p>${say("בערב הפתיחה, 30 במרץ 1939, בחסות ראש העירייה ישראל רוקח: יומן פרמאונט, קטעי הווי מהארץ, סרט קצר, הפסקה, ואז שלגיה ושבעת הגמדים. בהצגות היומיות בחג הפסח הוקרן שירת המיסיסיפי עם בובי ברין.", "On the opening night, 30 March 1939, under the patronage of Mayor Israel Rokach: Paramount News, scenes of life in the country, a short film, an interval, and then Snow White and the Seven Dwarfs. The daily Passover shows screened Rainbow on the River with Bobby Breen.")}</p>
        <h3>${say("על המסך", "On screen")}</h3>
        <div class="posters">${poster("Snow White and the Seven Dwarfs (Style B) poster.jpg", say("שלגיה ושבעת הגמדים", "Snow White"))}${poster("The Adventures of Robin Hood (1938 poster).jpg", say("רובין הוד", "Robin Hood"))}${poster("Fourdaughters1938.JPG", say("חלומות נעורים", "Four Daughters"))}</div>
        ${films("1939", [
          ["1.4", "שלגיה ושבעת הגמדים", "Snow White and the Seven Dwarfs"],
          ["2.4", "שירת המיסיסיפי", "Rainbow on the River"],
          ["אפריל", "הרפתקאותיו של רובין הוד", "The Adventures of Robin Hood"],
          ["6.5", "חלומות נעורים", "Four Daughters"],
          ["29.7", "ארבעה בגן", "Four's a Crowd"],
          ["26.8", "עמק הנפילים", "Valley of the Giants"],
          ["9.9", "דגלים לבנים", "White Banners"],
          ["21.10", "הפונדק העליז", "Room Service"],
          ["9.12", "הפלוגה האובדת", "The Lost Patrol"]])}
        ${films("1940", [
          ["17.2", "עוד נחיה יחד", "Next Time We Love"],
          ["25.5", "מסעות טופר", "Topper Takes a Trip"],
          ["13.7", "הנערה ממקסיקו", "The Girl from Mexico"],
          ["7.9", "מאה השנים הראשונות", "The First Hundred Years"],
          ["30.11", "קפה סוסייטי", "Café Society"]])}
        <p>${say("שלט המתכת על הקיר בסצנה הוא עיצוב של השחזור. בגלויה מהתקופה נראות שם אותיות אדומות אנכיות. הכרזה שמתחתיו היא הכרזה האמריקאית של חלומות נעורים, לא הכרזה שנתלתה בקולנוע. הכרזה על המרפסת עם שמה של אליזבת ברגנר מופיעה בגלויה.", "The metal sign on the wall in the scene was designed for this reconstruction. A postcard of the time shows red vertical letters there. The poster below it is the American poster for Four Daughters, not the one that hung at the cinema. The poster on the balcony with Elisabeth Bergner's name appears in the postcard.")}</p>`,
      credit: say("מבחר מתוך רשומות ההקרנה בפרויקט ירושלים סגל, הספרייה לקולנוע והארכיון בסינמטק תל אביב. רובין הוד לפי עיתון דבר, ושירת המיסיסיפי לפי תוכניית הפתיחה. הכרזות הן הכרזות האמריקאיות, מוויקישיתוף, בנחלת הכלל.",
        "A selection from the screening records of the Jerusalem Segal Project, the film library and archive of the Tel Aviv Cinematheque. Robin Hood after the newspaper Davar, and Rainbow on the River after the opening programme. The posters are the American ones, from Wikimedia Commons, public domain."),
      links: [
        { t: say("ויקיפדיה: קולנוע אסתר", "Hebrew Wikipedia: Esther Cinema"), u: "https://he.wikipedia.org/wiki/%D7%A7%D7%95%D7%9C%D7%A0%D7%95%D7%A2_%D7%90%D7%A1%D7%AA%D7%A8" },
        { t: say("טבלת ההקרנות של ארכיון סינמטק תל אביב", "Tel Aviv Cinematheque archive: table of screenings (Hebrew)"), u: "https://www.cinema.co.il/wp-content/uploads/2025/01/%D7%A4%D7%A8%D7%95%D7%99%D7%A7%D7%98-%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D-%D7%A1%D7%92%D7%9C-.pdf" },
        { t: say("לוטוס הזהב: קולנוע אסתר", "Golden Lotus: Esther Cinema (Hebrew)"), u: "https://golden-lotus.co.il/esther/" }
      ]
    });
  }

// ---------- "about the project" pop-up: how it was made, what is exact, who made it ----------
  const LINKEDIN = "https://www.linkedin.com/in/meet-yuval-cohen/";
  const WHATSAPP = "972512868309";        // international form, digits only. The number is never shown, the button opens a chat
  function openAbout() {
    // pictures with archive photographs live in about/archive (not published yet): a missing one removes its own frame
    const shot = (src, cap) => `<figure class="shot"><img src="../about/${src}.webp" alt="${cap}" loading="lazy" onerror="const li = this.closest('li'); this.parentNode.remove(); if (li && li.dataset.needs && !li.querySelector('figure')) li.remove();"><figcaption>${cap}</figcaption></figure>`;
    const step = (title, text, pictures, needs) => `<li${needs ? ' data-needs="1"' : ""}><h4>${title}</h4><p>${text}</p>${pictures || ""}</li>`;
    const social = (url, label, icon) => `<a href="${url}" target="_blank" rel="noopener" aria-label="${label}" title="${label}"><i class="fa-brands ${icon}" aria-hidden="true"></i></a>`;
    card.innerHTML = `<div class="head"><div><h2 id="card-title">${say("אודות הפרויקט", "About the project")}</h2><p class="by">${say("כיכר צינה (דיזנגוף), מהחנוכה ב־1938", "Zina Square (Dizengoff), from its opening in 1938")}</p></div><button class="x" id="card-x" aria-label="סגירה"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="scroll">
      <p class="lead">${say("שחזור תלת־ממדי של הכיכר בשנים הראשונות שלה. בתוכה מחכות נקודות מידע על הרגעים והאנשים המרכזיים: לחצו על אחת מהן וגלו את הסיפור.", "A 3D reconstruction of the square in its first years. Inside it, points of information wait with the main moments and people: tap one and discover the story.")}</p>
      <section class="creator">
        <div class="who"><img src="../about/yuval.webp" alt="" width="34" height="34"><h4>${say("אודות היוצר: יובל כהן", "About the creator: Yuval Cohen")}</h4></div>
        <p>${say("חוקר עולמות תלת־ממד וטכנולוגיה וחובב היסטוריה מושבע. ניסיתי להחזיר את הכיכר לחיים, כדי שאפשר יהיה לעמוד בתוכה ולגלות אותה מחדש.", "An explorer of 3D worlds and technology, and a devoted lover of history. I tried to bring the square back to life, so that you can stand inside it and discover it again.")}</p>
        <div class="socials">${social(LINKEDIN, say("לינקדאין", "LinkedIn"), "fa-linkedin-in")}${WHATSAPP ? social("https://wa.me/" + WHATSAPP, say("וואטסאפ", "WhatsApp"), "fa-whatsapp") : ""}</div>
      </section>
      <h3>${say("איך זה נבנה", "How it was built")}</h3>
      <ol class="steps">
        ${step(say("מחקר", "Research"), say("מתי נבנתה הכיכר, מי תכנן אותה ואיך נראתה. היא נחנכה ב־26 בינואר 1938 לפי תוכנית של ג'ניה אוורבוך. נאספו עשרות תצלומים בשחור לבן מזוויות שונות, פריימים מיומן קולנוע ומודעה עירונית, ומוינו לפי תקופה: מה מתאים ל־1940 ומה מאוחר יותר.", "When the square was built, who designed it and how it looked. It opened on 26 January 1938 to a plan by Genia Averbuch. Dozens of black and white photographs from different angles were collected, with frames from a newsreel and a municipal notice, and sorted by period: what fits 1940 and what is later."))}
        ${step(say("אז מול היום", "Then and now"), say("מפת OpenStreetMap של היום הושוותה לתצלומי התקופה: צורות הבניינים, כיווני הרחובות ושמות הבתים. ששת בנייני הטבעת סומנו A עד F, וכל אחד קיבל חזית משלו. הקולנוע הותאם לתצלומים, ושאר החזיתות הן פרשנות.", "Today's OpenStreetMap map was compared with photographs of the time: the shapes of the buildings, the directions of the streets and the names of the houses. The six buildings of the ring were marked A to F, and each got its own front. The cinema was matched to photographs; the other fronts are interpretation."),
          shot("map", say("ששת בנייני הטבעת והרחובות. © תורמי OpenStreetMap", "The six buildings of the ring and the streets. © OpenStreetMap contributors")) + shot("archive/corners", say("סימון פינות ופרטי חזית על גבי תצלומים", "Corners and facade details marked on photographs")) + shot("archive/facades", say("חזיתות: תצלום מול הניסיון הראשון", "Facades: photograph beside the first attempt")))}
        ${step(say("צבע לתחושה", "Colour, for the feel"), say("תצלומים בשחור לבן נצבעו בבינה מלאכותית. הצבעים מומצאים ולא מדויקים, אבל הם נתנו תחושה של איך זה היה נראה ועזרו מאוד לשפר את הסצנה.", "Black and white photographs were coloured with AI. The colours are invented and not accurate, but they gave a feeling of how it may have looked and helped a great deal to improve the scene."),
          shot("archive/colour_square", say("למעלה התצלום, למטה הגרסה הצבועה", "Above the photograph, below the coloured version")) + shot("archive/colour_street", say("אותה פינה, בשחור לבן ובצבע", "The same corner, in black and white and in colour")))}
        ${step(say("גרסה ראשונה בדפדפן", "A first version in the browser"), say("בהתחלה הכול נבנה ישירות ב־Three.js, בקוד, בלי Blender. כך נבדקו הפריסה, המידות והתנועה בכיכר.", "At first everything was built straight in Three.js, in code, without Blender. This is how the layout, the sizes and the traffic of the square were tested."),
          shot("facelift", say("גלגולי הגרסה הראשונה, לפני ואחרי", "Stages of the first version, before and after")))}
        ${step(say("המעבר ל־Blender", "Moving to Blender"), say("כשהבסיס ב־Three.js היה טוב מספיק, חובר Blender דרך MCP, ומשם כל השלבים נעשו בו: קודם גושים לפי המפה, אחר כך טבעות הגן, ולבסוף חזיתות באוהאוס, צמחייה, מזרקה, רכבים ואנשים.", "Once the Three.js base was good enough, Blender was connected through MCP, and every stage from then on was done in it: first blocks after the map, then the rings of the garden, and finally Bauhaus facades, planting, the fountain, cars and people."),
          shot("massing", say("הגושים הראשונים ב־Blender", "The first blocks in Blender")) + shot("early", say("הגן מתחיל לקבל צורה", "The garden takes shape")) + shot("render", say("רינדור מתוך הכיכר", "A render from inside the square")))}
        ${step(say("מדידה מתוך תצלומים", "Measuring from photographs"), say("מצלמה וירטואלית הותאמה לזווית של תצלום, ורשת וקווים הונחו עליו עד שהתיישבו. כך יצאו בריכה ברדיוס של כ־8.4 מטר ומדשאה פנימית עד כ־16 מטר.", "A virtual camera was matched to the angle of a photograph, and a grid and lines were laid over it until they sat right. This gave a pool with a radius of about 8.4 metres and an inner lawn reaching about 16 metres."),
          shot("archive/measure", say("קווי המדידה, על תצלום מאוחר מ־1940", "Measuring lines, on a photograph later than 1940")) + shot("archive/grid_square", say("רשת מדידה על תצלום המזרקה", "Measuring grid on the photograph of the fountain")) + shot("archive/grid_cinema", say("רשת מדידה על תצלום הקולנוע", "Measuring grid on the photograph of the cinema")))}
        ${step(say("תצלום מול שחזור", "Photograph and reconstruction"), say("אותה זווית מצלמה: למעלה התצלום, למטה השחזור. כך רואים מה כבר דומה ומה עוד לא.", "The same camera angle: the photograph above, the reconstruction below. It shows what is already alike and what is not yet."),
          shot("archive/compare_square", say("הבריכה, הגדר והטבעות. זיהוי הרחוב בתצלום הזה לא ודאי", "The pool, the fence and the rings. The street in this photograph is not identified for certain")) + shot("archive/compare_cinema", say("קולנוע כיכר דיזנגוף. התצלום מאוחר מ־1940", "Dizengoff Square Cinema. The photograph is later than 1940")), true)}
        ${step(say("אל הדפדפן", "Back to the browser"), say("הדגם יוצא בחזרה לאתר שרץ ב־Three.js, ונדחס לכ־6 מגה כדי להיטען מהר גם בטלפון. הכלים: Blender, Three.js, OpenStreetMap ו־Claude Code.", "The model is exported back to the website, which runs on Three.js, and compressed to about 6 MB so that it loads quickly on phones too. Tools: Blender, Three.js, OpenStreetMap and Claude Code."))}
      </ol>
      <h3>${say("מה מדויק ומה משוער", "What is accurate and what is estimated")}</h3>
      ${$("notes").querySelector("ul").outerHTML}
      <section class="share-end"><h3>${say("נהניתם לטייל בהיסטוריה בתלת־ממד?", "Enjoyed a walk through history in 3D?")}</h3><p>${say("שתפו את הכיכר עם מי שיאהב אותה.", "Share the square with someone who will love it.")}</p><button class="share-btn" id="card-share">${say("שיתוף", "Share")}</button></section>
      <section class="rights"><h3>${say("זכויות יוצרים וקרדיטים", "Copyright and credits")}</h3>
      <ul>
        <li>${say("תצלומים בחלונות המידע: ויקישיתוף, ובהם פיקיוויקי, אוסף דן הדני בספרייה הלאומית והארכיון הציוני. שם הצלם והרישיון מופיעים ליד התצלומים. מקור דיוקנה של ג'ניה אוורבוך לא זוהה.", "Photographs in the information windows: Wikimedia Commons, including PikiWiki, the Dan Hadani Collection at the National Library of Israel and the Central Zionist Archives. The photographer and the licence are named beside the photographs. The source of the portrait of Genia Averbuch has not been identified.")}</li>
        <li>${say("תוכנית אוורבוך לכיכר: ידיעות עיריית תל אביב.", "Averbuch's plan for the square: Tel Aviv Municipality News.")}</li>
        <li>${say("סרט חנוכת הכיכר: אוסף יומני כרמל (נתן אקסלרוד), ארכיון הסרטים הישראלי. הסרטונים מוצגים בנגן המוטמע של YouTube.", "The film of the opening: Carmel newsreel collection (Nathan Axelrod), Israel Film Archive. Videos play in the embedded YouTube player.")}</li>
        <li>${say("רשומות ההקרנה: פרויקט ירושלים סגל, סינמטק תל אביב. כרזות הסרטים: ויקישיתוף, נחלת הכלל.", "Screening records: Jerusalem Segal Project, Tel Aviv Cinematheque. Film posters: Wikimedia Commons, public domain.")}</li>
        <li>${say("מפת הבניינים והרחובות: © תורמי", "Map of buildings and streets: © contributors of")} <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener"><bdi>OpenStreetMap</bdi></a>, ${say("רישיון ODbL", "ODbL licence")}.</li>
        <li>${say("שמיים", "Sky")}: <a href="https://polyhaven.com" target="_blank" rel="noopener"><bdi>Poly Haven</bdi></a>, ${say("רישיון CC0. תלת־ממד", "CC0 licence. 3D")}: <a href="https://threejs.org" target="_blank" rel="noopener"><bdi>Three.js</bdi></a>, ${say("רישיון MIT. אייקונים", "MIT licence. Icons")}: <a href="https://fontawesome.com/license/free" target="_blank" rel="noopener"><bdi>Font Awesome Free</bdi></a>. ${say("גופנים: Google Fonts, רישיון OFL", "Fonts: Google Fonts, OFL licence")}.</li>
        <li>${say("איורי חזיתות החנויות והגרסאות הצבועות של התצלומים נוצרו בבינה מלאכותית.", "The shopfront illustrations and the coloured versions of the photographs were made with AI.")}</li>
      </ul>
      <p class="credit">${say("הדמויות מבוססות על הדגמים", "The figures are based on the models")} <a href="https://polyfork.dev/asset/audience-gentleman-base" target="_blank" rel="noopener"><bdi>Audience gentleman</bdi></a>, <a href="https://polyfork.dev/asset/human-vest-shorts-base" target="_blank" rel="noopener"><bdi>Human vest shorts</bdi></a>, <a href="https://polyfork.dev/asset/taverna-waiter-base" target="_blank" rel="noopener"><bdi>Taverna waiter</bdi></a>, <a href="https://polyfork.dev/asset/older-woman-with-a-basket-base" target="_blank" rel="noopener"><bdi>Older woman with a basket</bdi></a>, <a href="https://polyfork.dev/asset/teen-audience-member-base" target="_blank" rel="noopener"><bdi>Teen audience member</bdi></a>, <a href="https://polyfork.dev/asset/child-at-the-fun-fair-base" target="_blank" rel="noopener"><bdi>Child at the fun fair</bdi></a> ${say("מאת", "by")} <a href="https://polyfork.dev" target="_blank" rel="noopener"><bdi>Polyfork</bdi></a>, ${say("ברישיון", "licensed")} <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener"><bdi>CC BY 4.0</bdi></a>. ${say("הדגמים שונו: צבעים, לבוש, כובעים, תנוחות והפחתת פרטים", "The models were changed: colours, clothes, hats, poses and less detail")}.</p>
      ${$("sound-btn").hidden ? "" : `<p class="credit">${say("מוזיקת רקע", "Background music")}: <bdi>${MUSIC.title}, ${MUSIC.artist}</bdi></p>`}
      <p class="credit disclaimer">${say("פרויקט לימודי והיסטורי בלבד, ללא מטרות רווח, כמחווה לתל אביב של 1940. כל החומרים של אחרים שמשולבים באתר ובסצנה, ובהם תצלומים, סרטים, תוכניות, כרזות, מוזיקה, מפות, דגמים, איורים וגופנים, שייכים לבעליהם המקוריים, והזכויות בהם שמורות להם. חומרים ברישיון פתוח מוצגים לפי תנאי הרישיון. השימוש בחומרים אינו טענה לבעלות עליהם. בעלי זכויות שמבקשים לתקן קרדיט או להסיר חומר מוזמנים לפנות בוואטסאפ שבראש החלון, והבקשה תטופל.", "A project for study and history only, not for profit, made as a homage to the Tel Aviv of 1940. All third-party material in this website and its scene, including photographs, films, plans, posters, music, maps, models, illustrations and fonts, belongs to its original owners, who keep the rights in it. Openly licensed material is shown under the terms of its licence. Using material is not a claim to own it. Rights holders who want a credit corrected or material removed are welcome to write on WhatsApp using the button near the top of this window, and the request will be handled.")}</p></section>
    </div>`;
    card.hidden = false; $("veil").hidden = false; $("notes").hidden = true;
    $("card-x").addEventListener("click", closeCard); $("card-share").addEventListener("click", (e) => share(e.currentTarget)); $("card-x").focus({ preventScroll: true });
    setBar(true);
  }

  // ---------- sharing the square: from the round button and from the end of "about" ----------
  const SHARE = LANG_EN ? { title: "Zina Square (Dizengoff) 1940", text: "Think you know Dizengoff Square? Not like this. A 3D reconstruction of the square as it looked around 1940. Walk around it right from your phone." }
    : { title: "כיכר צינה (דיזנגוף) 1940", text: "מכירים את כיכר דיזנגוף? לא ככה. שחזור תלת־ממדי של הכיכר כמו שנראתה סביב 1940. מסתובבים בה ישר מהטלפון." };
  function copyText(text) {                                  // the clipboard API needs https or localhost
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const t = document.createElement("textarea"); t.value = text; t.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(t); t.select();
    const ok = document.execCommand("copy"); t.remove();
    return ok ? Promise.resolve() : Promise.reject(new Error("copy"));
  }
  function share(button) {
    const url = location.origin + location.pathname.replace(/index\.html$/, "") + (LANG_EN ? "?lang=en" : "");
    // the bar, with its hint, is out of sight while a card is open: then the pressed button says it
    const say = (text) => { if (button) button.textContent = text; else { hintEl.textContent = text; showHint(); } };
    const copy = () => copyText(SHARE.text + "\n" + url).then(() => say("הקישור הועתק"), () => say("העתיקו את הקישור משורת הכתובת"));
    if (!navigator.share) return copy();
    navigator.share({ title: SHARE.title, text: SHARE.text, url }).catch((e) => { if (e.name !== "AbortError") copy(); });
  }
  $("quick-share").addEventListener("click", () => share());
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

  // ---------- the moving cars: two warm headlamps with their light on the road, and two red lamps behind ----------
  // All of them together are three draw calls, moved each frame with their cars. The cart and parked cars stay dark.
  function carThings() {
    if (NIGHT.cars) NIGHT.cars.all.forEach((o) => scene.remove(o));
    const list = [], m4 = new THREE.Matrix4(), v = new THREE.Vector3();
    movers.forEach((m) => {
      if (m.o.name.indexOf("car_") !== 0) return;
      m.o.updateMatrixWorld(true);
      const inv = new THREE.Matrix4().copy(m.o.matrixWorld).invert(), box = new THREE.Box3(), lit = [];
      m.o.traverse((c) => {
        if (!c.isMesh || c.material.isMeshBasicMaterial) return;                 // the flat shadow is not the car
        m4.multiplyMatrices(inv, c.matrixWorld);
        const at = c.geometry.attributes.position;
        for (let i = 0; i < at.count; i++) { v.fromBufferAttribute(at, i).applyMatrix4(m4); box.expandByPoint(v); if (c.material.name === "car_light" && v.x > 0 && v.y > .65 && v.y < 1.35) lit.push(v.clone()); }
      });
      if (!lit.length) return;
      const nose = Math.max(...lit.map((q) => q.x)), front = lit.filter((q) => q.x > nose - .3);
      const heads = [-1, 1].map((side) => {                  // the model's own headlamps, one on each side
        const mine = front.filter((q) => q.z * side > 0), c = new THREE.Vector3();
        mine.forEach((q) => c.add(q));
        return mine.length ? c.divideScalar(mine.length).setX(nose + .1) : new THREE.Vector3(nose + .1, .85, side * .4);
      });
      const half = box.max.z * .68, tails = [-1, 1].map((side) => new THREE.Vector3(box.min.x - .04, .72, side * half));
      const y = .04 - m.o.position.y, a = box.max.x + .15, b = box.max.x + 8.5;
      list.push({ m, heads, tails, road: [[a, y, -.9], [b, y, -2.3], [b, y, 2.3], [a, y, -.9], [b, y, 2.3], [a, y, .9]].map((q) => new THREE.Vector3(...q)) });
    });
    const points = (n, color, size, stops) => {
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      const o = new THREE.Points(g, new THREE.PointsMaterial({ color, size, map: glowTex(stops), transparent: true, opacity: 0, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
      o.frustumCulled = false; o.visible = false; scene.add(o); return o;
    };
    const head = points(list.length * 2, 0xffdfa8, 1.05, [[0, "rgba(255,255,255,1)"], [.22, "rgba(255,255,255,.55)"], [1, "rgba(255,255,255,0)"]]);
    const tail = points(list.length * 2, 0xff3a22, .6, [[0, "rgba(255,255,255,1)"], [.3, "rgba(255,255,255,.4)"], [1, "rgba(255,255,255,0)"]]);
    const beam = paintedTex(256, 128, (x) => {              // along the road to the right, wider and weaker
      for (let i = 0; i < 256; i++) {
        const u = i / 255, strength = Math.min(1, u * 6) * Math.pow(1 - u, 1.4), g = x.createLinearGradient(0, 0, 0, 128);
        g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.5, "rgba(255,255,255," + strength.toFixed(3) + ")"); g.addColorStop(1, "rgba(255,255,255,0)");
        x.fillStyle = g; x.fillRect(i, 0, 1, 128);
      }
    });
    const rg = new THREE.BufferGeometry(), uv = new Float32Array(list.length * 12);
    for (let i = 0; i < list.length; i++) uv.set([0, .22, 1, 0, 1, 1, 0, .22, 1, 1, 0, .78], i * 12);
    rg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(list.length * 18), 3)); rg.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    const road = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ map: beam, color: 0xffd394, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, fog: false,
      blending: THREE.AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    road.frustumCulled = false; road.visible = false; scene.add(road);
    NIGHT.cars = { list, head, tail, road, all: [head, tail, road] };
  }
  function carLights() {                                     // every frame, just before drawing (make_site.py)
    const C = NIGHT.cars;
    if (!C) return;
    const on = stage(1.2, .35);
    C.all.forEach((o) => { o.visible = on > 0; });
    if (!on) return;
    C.head.material.opacity = .95 * on; C.tail.material.opacity = .85 * on; C.road.material.opacity = .5 * on;
    const h = C.head.geometry.attributes.position, t = C.tail.geometry.attributes.position, r = C.road.geometry.attributes.position, v = new THREE.Vector3();
    C.list.forEach((car, i) => {
      const o = car.m.o, hidden = !o.visible;
      o.updateMatrixWorld();
      const put = (attr, at, q) => { v.copy(q).applyMatrix4(o.matrixWorld); attr.setXYZ(at, v.x, hidden ? -50 : v.y, v.z); };
      car.heads.forEach((q, k) => put(h, i * 2 + k, q)); car.tails.forEach((q, k) => put(t, i * 2 + k, q)); car.road.forEach((q, k) => put(r, i * 6 + k, q));
    });
    h.needsUpdate = t.needsUpdate = r.needsUpdate = true;
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
    if (root && root !== NIGHT.root) { lampThings(root); carThings(); }          // the model was loaded again
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
    lampThings(root); carThings(); nightPaint();
    [NIGHT.disc, NIGHT.halo, NIGHT.cloud, NIGHT.stars, ...NIGHT.spots, ...NIGHT.lamps.children, ...(NIGHT.cinema ? [NIGHT.cinema.wash, ...NIGHT.cinema.heads] : [])].forEach((o) => renderer.initTexture(o.material.map));
    NIGHT.cars.all.forEach((o) => renderer.initTexture(o.material.map));
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
// ---------- opening: the plan is drawn, then the square grows out of it and the camera lands on the roof view ----------
  // About six seconds, on every load, with a small skip button. ?nointro leaves it out. Nothing is downloaded
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
    let quiet = false;                                       // just changed language: no second flight
    try { quiet = sessionStorage.getItem("kikarQuiet") === "1"; sessionStorage.removeItem("kikarQuiet"); } catch (e) { /* private window */ }
    if (quiet) { INTRO.quiet = true; return false; }
    if (INTRO.done || /[?&]nointro\b/.test(location.search)) return false;
    return !!INTRO_HOLD || /[?&]intro\b/.test(location.search) || !reduce;     // asked for less motion: no flight
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
    const skip = document.createElement("button"); skip.className = "skip"; skip.type = "button";
    skip.innerHTML = 'דלג<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6l-6 6 6 6"/></svg>';     // forward points left in Hebrew
    skip.addEventListener("click", introEnd); document.body.appendChild(skip); INTRO.parts.skip = skip;
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
    setView("roof"); if (!tourMaybe()) showHint();
  }
  // until it ends only the entry, skip and music buttons answer: a stray touch must not turn the camera or open something
  ["pointerdown", "pointerup", "click", "wheel"].forEach((type) => addEventListener(type, (e) => {
    if (introOn && !(e.target.closest && e.target.closest(".skip, #sound-btn, #load-go"))) { e.stopPropagation(); if (e.cancelable) e.preventDefault(); }
  }, { capture: true, passive: false }));
  addEventListener("keydown", (e) => { if (introOn && INTRO.running && e.key === "Escape") { e.stopPropagation(); introEnd(); } }, true);
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
// ---------- background music: a loop under the scene, with one button to switch it off ----------
  // The track is blender/preview/audio/ambient.m4a: the first piece of Marek Weber's "In Old Vienna", cut and turned
  // down. Published by the owner's decision; rights holders can ask for removal (see "about"). Where the file is
  // missing the button never appears. The music starts with the page; most browsers refuse sound before a touch or
  // a key, and then it begins with the first one. Every new visit starts with it on, and a stop is kept for that
  // tab only. It stops while a film plays in a window, and while the page is out of sight.
  const MUSIC = { artist: "Marek Weber", title: "In Old Vienna" };           // whose track it is: shown while it plays and in "about"
  let musicReady = Promise.resolve(false);      // true once there is a track to play and nobody stopped it
  {
    const TRACK = "../audio/ambient.m4a?v=4",   /* v: raise when the file changes */ btn = $("sound-btn"), card = $("card"), credit = $("now-playing");
    credit.querySelector("b").textContent = MUSIC.artist; credit.querySelectorAll("em").forEach((e) => { e.textContent = "\u266A " + MUSIC.title; });
    let audio = null, started = false, fade = 0, want = true;
    try { want = sessionStorage.getItem("kikarSound") !== "0"; } catch (e) { /* storage blocked: on */ }
    const filming = () => !!card.querySelector("iframe, .film");
    function draw() {
      const on = started && want, label = say(on ? "השתקת המוזיקה" : "הפעלת המוזיקה", on ? "Mute the music" : "Play the music");
      btn.setAttribute("aria-pressed", String(on)); btn.setAttribute("aria-label", label); btn.title = label;
    }
    function apply() {                                       // what should be heard right now
      if (!audio) return;
      clearInterval(fade);
      if (!(started && want) || filming() || document.hidden) { audio.pause(); return; }
      if (!audio.paused) { audio.volume = 1; return; }
      audio.volume = 0;                                      // comes in softly (iPhones ignore volume: the file itself is quiet)
      audio.play().then(() => { draw(); fade = setInterval(() => { audio.volume = Math.min(1, audio.volume + .08); if (audio.volume >= 1) clearInterval(fade); }, 80); })
        .catch(() => { started = false; draw(); });          // not allowed yet: the next touch tries again
    }
    const first = (e) => {
      if (!audio || started || !want || (e.target.closest && e.target.closest("#sound-btn"))) return;
      started = true; draw(); apply();
    };
    ["click", "touchend", "keydown"].forEach((n) => addEventListener(n, first, true));
    btn.addEventListener("click", () => {
      want = !(started && want); started = true;
      try { sessionStorage.setItem("kikarSound", want ? "1" : "0"); } catch (e) { /* storage blocked: until a reload */ }
      draw(); apply();
    });
    // a film opened in the window silences the music; closing the window brings it back
    new MutationObserver(apply).observe(card, { childList: true, subtree: true });
    document.addEventListener("visibilitychange", apply);
    musicReady = fetch(TRACK, { method: "HEAD" }).then((r) => {
      if (!r.ok) return false;
      audio = new Audio(); audio.preload = "none"; audio.loop = true; audio.src = TRACK;
      btn.hidden = false; draw();
      if (want) { started = true; apply(); }                 // at once, where the browser allows it
      return want;
    }).catch(() => false);                                   // offline: no music
  }
  // The door: browsers allow sound only after a press, so with music the loading veil waits for one (load.js).
  // The press itself starts the music, like any first touch. Not after a change of language, and not with ?nointro.
  async function atTheDoor() {
    if (INTRO.quiet || /[?&]nointro\b/.test(location.search) || !(await musicReady)) return;
    const go = $("load-go");
    $("load-bar").parentNode.hidden = true; $("load-text").parentNode.hidden = true; go.hidden = false;
    await new Promise((ok) => go.addEventListener("click", ok, { once: true }));
  }
requestAnimationFrame(frame);
})();
