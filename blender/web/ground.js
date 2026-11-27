// ---------- on the ground: street names painted on the asphalt, and small blinking dots under the street signs ----------
  const roadName = (name) => canvasTex(1024, 560, (x) => {
    x.fillStyle = "rgba(240,229,200,.95)"; x.font = '400 290px "Secular One", "Heebo", sans-serif';
    x.fillText(name, 512, 292, 980);
  });
  const roadNames = [["דיזנגוף", 348], ["ריינס", 43], ["זמנהוף", 98], ["דיזנגוף", 168], ["פינסקר", 225], ["בן עמי", 299]].map(([name, deg]) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(8.4, 4.6).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ map: roadName(name), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    m.position.copy(P(54, D(deg), .06)); m.rotation.y = -D(deg);       // upright for someone looking out from the square
    scene.add(m); return [m, name];
  });
  // a canvas may be drawn before the title font arrives: draw again when it has
  if (document.fonts) document.fonts.load('400 100px "Secular One"', "אבג").then(() => roadNames.forEach(([m, name]) => { m.material.map = roadName(name); m.material.needsUpdate = true; })).catch(() => {});
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

