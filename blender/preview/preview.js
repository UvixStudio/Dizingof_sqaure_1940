// Preview page: reloads renders and the GLB whenever Blender publishes a new stamp.json.
(function () {
  const $ = (id) => document.getElementById(id);
  const VIEWS = [["mat", "הכיכר מול תצלום 1938"], ["ring", "בנייני הטבעת"], ["esther", "קולנוע אסתר"], ["in", "בתוך הכיכר"], ["walk", "מהמדרכה"], ["roof", "מגג"], ["top", "מבט על"]];
  $("pairs").innerHTML = VIEWS.map(([k, n]) =>
    (k === "mat" ? `<div class="pair"><figure><img id="r-matblend" alt="שכבה"><figcaption>המודל מעל התצלום, 50%</figcaption></figure></div>` : "") +
    `<div class="pair"><figure><img id="r-${k}" alt="רינדור ${n}"><figcaption>בלנדר: ${n}</figcaption></figure>` +
    `<figure><img src="ref/${k}.jpg" alt="תמונת ארכיון ${n}"><figcaption>${k === "esther" ? "תמונה מ־1949, לצורת הבניין בלבד" : "ארכיון"}</figcaption></figure></div>` +
    (k === "esther" ? `<div class="pair"><figure><img id="r-blend" alt="שכבה"><figcaption>המודל מעל התמונה, 50%</figcaption></figure>` +
      `<figure><img src="ref/esther_1940.jpg" alt="צביעה"><figcaption>גלויה מהתקופה, צבועה ביד</figcaption></figure></div>` : "")).join("");

  const box = $("live");
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  box.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xa9c8e4);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.5, 1000);
  camera.position.set(30, 55, 90);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 3, 0);
  controls.maxPolarAngle = Math.PI / 2 - 0.02;
  scene.add(new THREE.HemisphereLight(0xdfeaf6, 0x8f8e88, 0.45));
  const sun = new THREE.DirectionalLight(0xfff0d6, 0.85);
  sun.position.set(-63, 74, 23);                       // WSW, 30 degrees, same as Blender
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.normalBias = 0.35;
  Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, near: 1, far: 260 });
  scene.add(sun);

  function resize() {
    renderer.setSize(box.clientWidth, box.clientHeight);
    camera.aspect = box.clientWidth / box.clientHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();
  renderer.setAnimationLoop(() => { controls.update(); renderer.render(scene, camera); });

  let model = null, last = 0;
  function loadModel(t) {
    new THREE.GLTFLoader().load("kikar.glb?t=" + t, (g) => {
      if (model) {
        scene.remove(model);
        model.traverse((o) => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
      }
      model = g.scene;
      model.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
      scene.add(model);
    });
  }
  async function poll() {
    try {
      const s = await (await fetch("stamp.json?t=" + Date.now(), { cache: "no-store" })).json();
      if (s.time !== last) {
        last = s.time;
        VIEWS.forEach(([k]) => { $("r-" + k).src = k + ".png?t=" + last; });
        $("r-blend").src = "esther_blend.jpg?t=" + last;
        $("r-matblend").src = "mat_blend.jpg?t=" + last;
        loadModel(last);
        $("info").textContent = "עודכן " + new Date(last * 1000).toLocaleTimeString("he-IL") +
          " | " + s.tris.toLocaleString() + " משולשים | " + s.glb_mb + "MB";
      }
    } catch (e) { $("info").textContent = "ממתין לפרסום מבלנדר..."; }
    setTimeout(poll, 4000);
  }
  poll();
})();
