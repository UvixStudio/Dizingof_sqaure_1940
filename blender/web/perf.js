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

