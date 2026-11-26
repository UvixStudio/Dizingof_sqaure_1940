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

