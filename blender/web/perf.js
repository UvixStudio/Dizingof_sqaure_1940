// ---------- picture quality for the device ----------
  // Antialiasing is almost free on phone GPUs and very expensive on laptop integrated graphics
  // (measured on Iris Xe at 1080p: 69 ms a frame with it, 32 ms without). It can only be chosen when the context is made.
  const coarse = matchMedia("(pointer: coarse)").matches;
  const metered = /[?&]fps\b/.test(location.search);                  // add ?fps to the address
  const gpuName = coarse && !metered ? "" : (() => {                    // phones always keep antialiasing: no need to ask
    const g = document.createElement("canvas").getContext("webgl"); if (!g) return "";
    const e = g.getExtension("WEBGL_debug_renderer_info"), n = e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : "";
    const lose = g.getExtension("WEBGL_lose_context"); if (lose) lose.loseContext();
    return String(n);
  })();
  const weak = !coarse && /intel|uhd|iris|swiftshader|llvmpipe|basic render/i.test(gpuName);
  let ratio = Math.min(window.devicePixelRatio || 1, weak ? 1.25 : 2);
  // if frames stay slow, draw fewer pixels (only ever downwards, so the picture does not keep changing)
  const pace = { sum: 0, n: 0, slow: 0, first: null, done: false, from: performance.now() + 4000, floor: Math.min(ratio, coarse ? 1.2 : .8) };
  const meter = metered ? document.body.appendChild(document.createElement("div")) : null;
  if (meter) meter.className = "fps";
  function adapt(ms, now) {
    if (now < pace.from || ms > 250) return;                          // loading, or a tab in the background
    pace.sum += ms; if (++pace.n < 40) return;
    const avg = pace.sum / pace.n; pace.sum = pace.n = 0;
    pace.slow = avg > 24 ? pace.slow + 1 : 0;
    if (pace.slow >= 2 && !pace.done) {
      pace.slow = 0;
      if (ratio > pace.floor) { pace.first = pace.first || { avg, ratio }; ratio = Math.max(pace.floor, ratio * .85); renderer.setPixelRatio(ratio); }
      // all the way down and no faster (a phone saving battery caps at 30 fps): the pixels were not the problem, put them back
      else if (pace.first && avg > pace.first.avg * .92) { ratio = pace.first.ratio; renderer.setPixelRatio(ratio); pace.done = true; }
    }
    if (meter) meter.textContent = `${(1000 / avg).toFixed(0)} fps | x${ratio.toFixed(2)} | ${weak ? "no AA" : "AA"} | ${gpuName}`;
  }

