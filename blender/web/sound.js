// ---------- background music: a loop under the scene, with one button to switch it off ----------
  // The track is a local file (blender/preview/audio/, not in the repository until its rights are settled).
  // Where the file is missing the button never appears. Browsers allow sound only after a touch or a key, so the
  // music begins with the first one. It stops while a film plays in a window, and while the page is out of sight.
  {
    const TRACK = "../audio/ambient.m4a", btn = $("sound-btn"), card = $("card");
    let audio = null, started = false, fade = 0, want = true;
    try { want = localStorage.getItem("kikarSound") !== "0"; } catch (e) { /* private window: on */ }
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
      audio.play().then(() => { fade = setInterval(() => { audio.volume = Math.min(1, audio.volume + .08); if (audio.volume >= 1) clearInterval(fade); }, 80); })
        .catch(() => { started = false; draw(); });          // not allowed yet: the next touch tries again
    }
    const first = (e) => {
      if (!audio || started || !want || (e.target.closest && e.target.closest("#sound-btn"))) return;
      started = true; draw(); apply();
    };
    ["click", "touchend", "keydown"].forEach((n) => addEventListener(n, first, true));
    btn.addEventListener("click", () => {
      want = !(started && want); started = true;
      try { localStorage.setItem("kikarSound", want ? "1" : "0"); } catch (e) { /* private window: for this visit only */ }
      draw(); apply();
    });
    // a film opened in the window silences the music; closing the window brings it back
    new MutationObserver(apply).observe(card, { childList: true, subtree: true });
    document.addEventListener("visibilitychange", apply);
    fetch(TRACK, { method: "HEAD" }).then((r) => {
      if (!r.ok) return;
      audio = new Audio(); audio.preload = "none"; audio.loop = true; audio.src = TRACK;
      btn.hidden = false; draw();
    }).catch(() => { /* offline: no music */ });
  }
