// Export the live scene to a .glb file (reference for Blender). Facelift copy only.
(function () {
  const btn = document.getElementById("export-glb");
  if (!btn || !window.THREE || !THREE.GLTFExporter) return;
  btn.addEventListener("click", function () {
    const scene = window.__kikar && window.__kikar.scene;
    if (!scene) return;
    btn.disabled = true;
    const label = btn.textContent;
    btn.textContent = "מייצא...";
    new THREE.GLTFExporter().parse(scene, function (glb) {
      const url = URL.createObjectURL(new Blob([glb], { type: "model/gltf-binary" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "kikar_1940_threejs.glb";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      btn.textContent = label;
      btn.disabled = false;
    }, { binary: true, onlyVisible: true, maxTextureSize: 2048 });
  });
})();
