// ---------- background music: a loop under the scene, with one button to switch it off ----------
  // For now it runs only on this computer and its home network (MUSIC_ON): the rights in the recording are not cleared, so it
  // stays out of the repository (blender/preview/audio/ is in .gitignore). The public site shows no button.
  // Where the file is missing the button never appears. The music starts with the page; most browsers refuse sound
  // before a touch or a key, and then it begins with the first one. Every new visit starts with it on, and a stop is
  // kept for that tab only. It stops while a film plays in a window, and while the page is out of sight.
  const MUSIC_ON = /^(localhost|127\.0\.0\.1|192\.168\.|10\.)/.test(location.hostname);
  const MUSIC = { artist: "Marek Weber", title: "In Old Vienna" };           // whose track it is: shown while it plays and in "about"
  let musicReady = Promise.resolve(false);      // true once there is a track to play and nobody stopped it
  {
    const TRACK = "../audio/ambient.m4a?v=4",   /* v: raise when the file changes */ btn = $("sound-btn"), card = $("card"), credit = $("now-playing");
    credit.querySelector("b").textContent = MUSIC.artist; credit.querySelectorAll("em").forEach((e) => { e.textContent = "\u266A " + MUSIC.title; });
    let audio = null, started = false, fade = 0, want = true;
    try { want = sessionStorage.getItem("kikarSound") !== "0"; } catch (e) { /* storage blocked: on */ }
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
      audio.play().then(() => { draw(); fade = setInterval(() => { audio.volume = Math.min(1, audio.volume + .08); if (audio.volume >= 1) clearInterval(fade); }, 80); })
        .catch(() => { started = false; draw(); });          // not allowed yet: the next touch tries again
    }
    const first = (e) => {
      if (!audio || started || !want || (e.target.closest && e.target.closest("#sound-btn"))) return;
      started = true; draw(); apply();
    };
    ["click", "touchend", "keydown"].forEach((n) => addEventListener(n, first, true));
    btn.addEventListener("click", () => {
      want = !(started && want); started = true;
      try { sessionStorage.setItem("kikarSound", want ? "1" : "0"); } catch (e) { /* storage blocked: until a reload */ }
      draw(); apply();
    });
    // a film opened in the window silences the music; closing the window brings it back
    new MutationObserver(apply).observe(card, { childList: true, subtree: true });
    document.addEventListener("visibilitychange", apply);
    if (MUSIC_ON) musicReady = fetch(TRACK, { method: "HEAD" }).then((r) => {
      if (!r.ok) return false;
      audio = new Audio(); audio.preload = "none"; audio.loop = true; audio.src = TRACK;
      btn.hidden = false; draw();
      if (want) { started = true; apply(); }                 // at once, where the browser allows it
      return want;
    }).catch(() => false);                                   // offline: no music
  }
  // The door: browsers allow sound only after a press, so with music the loading veil waits for one (load.js).
  // The press itself starts the music, like any first touch. Not after a change of language, and not with ?nointro.
  async function atTheDoor() {
    if (INTRO.quiet || /[?&]nointro\b/.test(location.search) || !(await musicReady)) return;
    const go = $("load-go");
    $("load-bar").parentNode.hidden = true; $("load-text").parentNode.hidden = true; go.hidden = false;
    await new Promise((ok) => go.addEventListener("click", ok, { once: true }));
  }
