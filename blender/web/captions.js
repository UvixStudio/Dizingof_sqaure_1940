// ---------- Hebrew captions over the dedication film ----------
  // The film is silent about its own words on YouTube, so the site lays one line at a time over the player
  // (text: data/dizengoff_opening_he_fixed.srt, put in by make_site.py). YouTube's own captions stay off.
  const CAPTIONS = __CAPTIONS__;
  const CAPTIONS_EN = [                                                // the same lines and times, translated
    "Zina Dizengoff Square,", "opened this week before a large crowd,", "was handed to the public of Tel Aviv,", "laid out",
    "in beauty and splendour.", "Among carpets of grass and beds", "of flowers, date palms were planted too,", "brought from Gan Rachel",
    "in Kinneret. 28 white benches,", "a handsome water fountain", "and handsome lamps, lit every evening,", "will serve the public", "for its rest."
  ];
  if (LANG_EN && CAPTIONS_EN.length === CAPTIONS.length) CAPTIONS.forEach((c, i) => { c[2] = CAPTIONS_EN[i]; });
  let youtube = null;
  const youtubeApi = () => youtube || (youtube = new Promise((ok, no) => {
    if (window.YT && window.YT.Player) return ok();
    window.onYouTubeIframeAPIReady = ok;
    const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api";
    s.onerror = () => { youtube = null; no(); };
    document.head.appendChild(s);
  }));
  function playWithCaptions(button, c) {
    const film = document.createElement("div"); film.className = "film";
    film.innerHTML = '<div></div><p class="cap" aria-live="polite"></p>';
    button.replaceWith(film);
    const plain = () => { film.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${c.video}?autoplay=1&rel=0" title="${esc(c.title)}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; };
    youtubeApi().then(() => {
      if (!film.isConnected) return;                                   // the card was closed meanwhile
      const line = film.querySelector(".cap");
      const player = new YT.Player(film.firstChild, {
        host: "https://www.youtube-nocookie.com", videoId: c.video,
        playerVars: { autoplay: 1, rel: 0, playsinline: 1, fs: 0, cc_load_policy: 0, iv_load_policy: 3 },   // no full screen: it would leave the captions behind
        events: { onStateChange: () => { player.unloadModule("captions"); player.unloadModule("cc"); } }
      });
      const tick = setInterval(() => {
        if (!film.isConnected) { clearInterval(tick); return; }
        if (!player.getCurrentTime) return;
        const t = player.getCurrentTime(), now = CAPTIONS.find((x) => t >= x[0] && t < x[1]);
        const text = now ? now[2] : "";
        if (line.textContent !== text) line.textContent = text;
      }, 150);
    }).catch(plain);
  }

