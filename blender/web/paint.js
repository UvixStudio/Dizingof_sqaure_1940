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

