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
    const res = await fetch(url);
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
        let buf = await download("../kikar_web.glb.gz?t=" + stamp, __PACKED__);
        const sig = new Uint8Array(buf, 0, 2);                          // a server may already have unpacked it on the way
        if (sig[0] === 0x1f && sig[1] === 0x8b) buf = await new Response(new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
        return buf;
      } catch (e) { console.warn("packed model failed, using the plain one", e); }
    }
    return download("../kikar.glb?t=" + stamp, __PLAIN__);
  }
  async function reveal() {                                             // shaders compiled and one frame drawn: lift the veil
    if (shown) return;
    progress(.98, "מדליקים את האור"); await painted();
    renderer.compile(scene, camera); await painted(); await painted();
    progress(1); shown = true;
    veilLoad.classList.add("done"); setTimeout(() => { veilLoad.hidden = true; }, 700);
  }
  function loadFailed(e) {
    console.error(e);
    if (shown) return;                                                  // a later reload failed: keep what is on screen
    $("load-text").textContent = "הטעינה נכשלה. בדקו את החיבור."; $("load-pct").textContent = "";
    $("load-again").hidden = false; $("load-again").onclick = () => location.reload();
  }

