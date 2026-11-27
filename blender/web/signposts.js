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
