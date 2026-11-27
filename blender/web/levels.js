// ---------- point of interest: how the square changed, from the 1934 plan to today ----------
  // Facts: Hebrew Wikipedia (כיכר צינה דיזנגוף). First evening: Haaretz, 27.1.1938, as quoted by golden-lotus.co.il.
  // The 1940s parade: the typed caption on the print itself. Photographs are loaded from Wikimedia Commons,
  // each under the licence written beneath it, so nothing is copied into the (public) repository.
  {
    const commons = "https://commons.wikimedia.org/wiki/";
    const photo = (name, alt, cap) => `<figure class="shot"><a href="${commons}File:${encodeURIComponent(name)}" target="_blank" rel="noopener"><img src="${commons}Special:FilePath/${encodeURIComponent(name)}?width=500" alt="${alt}" loading="lazy" onerror="this.closest('figure').remove()"></a><figcaption>${cap}</figcaption></figure>`;
    // today against 1940 in one frame. The 1940 side is our own scene, photographed from where the 2024 camera stood
    // (position solved from the pool and the kerb of the photograph: the cinema roof, 19.4 m up, 53 m east of the fountain)
    const compare = (name) => `<figure class="compare"><div class="cmp" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-label="${say("השוואה בין הכיכר היום לשחזור של 1940", "The square today against the 1940 reconstruction")}">
        <img src="${commons}Special:FilePath/${encodeURIComponent(name)}?width=960" alt="${say("הכיכר בלילה במבט מלמעלה", "The square at night, seen from above")}" loading="lazy" draggable="false" onerror="this.closest('figure').remove()">
        <img class="then" src="../about/then_1940_night.webp" alt="${say("אותה זווית בשחזור של 1940", "The same angle in the 1940 reconstruction")}" loading="lazy" draggable="false" onerror="this.closest('figure').remove()">
        <span class="tag now">${say("היום · 2024", "Today · 2024")}</span><span class="tag past">${say("השחזור · 1940", "Reconstruction · 1940")}</span><i aria-hidden="true"></i></div>
      <figcaption>${say("2024. צילום: שלמה רודד, ויקישיתוף (פיקיוויקי), <bdi>CC BY 2.5</bdi>.", "2024. Photo: Shlomo Roded, Wikimedia Commons (PikiWiki), CC BY 2.5.")} <a href="${commons}File:${encodeURIComponent(name)}" target="_blank" rel="noopener">${say("לתצלום המלא", "Full photograph")} ↗</a></figcaption></figure>`;
    const era = (year, title, text, pictures) => `<h3>${year} · ${title}</h3><p>${text}</p>${pictures || ""}`;
    CARDS.levels = {
      title: say("הכיכר שעולה ויורדת", "The square that rose and fell"), by: say("הגלגולים שלה לאורך השנים", "Its changes through the years"), sub: say("מ־1934 עד היום", "From 1934 to today"),
      body: [say("אותו מעגל, כמה כיכרות שונות. בסצנה רואים את הראשונה: שטוחה, בגובה הרחוב. לחיצה על תצלום פותחת אותו בגדול.", "One circle, several different squares. The scene shows the first: flat, at street level. Tap a photograph to see it full size.")],
      extra:
        era("1934", say("ההגבהה שנדחתה", "The raised plan, put off"), say("ג'ניה אוורבוך זכתה בתחרות לעיצוב הכיכר. בתוכנית המקורית הכיכר הייתה אמורה לעמוד כמטר מעל סביבתה, ומתחתיה תחנת מוניות וחניה. בגלל העלות הגבוהה ומיעוט כלי הרכב הוחלט לדחות את זה לעתיד.", "Genia Averbuch won the competition to design the square. In the original plan the square was to stand about a metre above its surroundings, with a taxi stand and parking beneath. Because of the high cost and the small number of vehicles, this was left for the future."),
          `<figure class="shot"><img src="${IMG_PLAN}" alt="${say("תוכנית אוורבוך לסידור הכיכר", "Averbuch's plan for the layout of the square")}" loading="lazy" onerror="this.parentNode.remove()"><figcaption>${say("תוכנית אוורבוך לסידור הכיכר. ידיעות עיריית תל אביב.", "Averbuch's plan for the layout of the square. Tel Aviv Municipality News.")}</figcaption></figure>`)
        + era("1938", say("החנוכה", "The opening"), say("ב־26 בינואר 1938 נחנכה הכיכר: מעגל תנועה בקוטר של כ־66 מטר, ובמרכזו בריכה ומזרקה, דשא, שבילים וערוגות. לפי עיתון הארץ מהבוקר שאחרי, הגן הואר אז לראשונה בלילה והמזרקה זהרה באורות צבעוניים.", "The square opened on 26 January 1938: a roundabout about 66 metres across, with a pool and fountain in the middle, lawns, paths and flower beds. According to the newspaper Haaretz the next morning, the garden was then lit at night for the first time and the fountain glowed in coloured light."),
          photo("110274 tel aviv - dizengoff square PikiWiki Israel.png", say("הכיכר והמזרקה בשנות השלושים", "The square and the fountain in the 1930s"), say("שנות ה־30. צלם לא ידוע, ויקישיתוף, נחלת הכלל.", "1930s. Photographer unknown, Wikimedia Commons, public domain.")))
        + era(say("שנות ה־40", "1940s"), say("מקום של טקסים", "A place for ceremonies"), say("על התצלום מוקלד Soldiers' Day, יום החייל: טורי חיילים צועדים בכיכר וקהל גדול מסביב. התאריך המדויק לא ידוע.", "The words Soldiers' Day are typed on the print: columns of soldiers march through the square, with a large crowd around them. The exact date is unknown."),
          photo("109688 tel aviv - dizengoff square PikiWiki Israel.png", say("חיילים צועדים בכיכר דיזנגוף", "Soldiers marching in Dizengoff Square"), say("1941 עד 1943. צלם לא ידוע, ויקישיתוף, נחלת הכלל.", "1941 to 1943. Photographer unknown, Wikimedia Commons, public domain.")))
        + era("1948", say("הגן גדל", "The garden grows"), say("העצים והדקלים צמחו והכיכר נעשתה גן מוצל. הבניינים האחרונים סביבה הושלמו רק בשנות ה־50, ובמרץ 1959 נפתח בה כלבו המשביר לצרכן.", "The trees and palms grew and the square became a shady garden. The last buildings around it were finished only in the 1950s, and in March 1959 the Hamashbir LaTzarchan department store opened there."),
          photo("PikiWiki Israel 46886 Dizengoff Square in Tel Aviv.jpg", say("צמחייה גבוהה והמזרקה", "Tall planting and the fountain"), say("1948 עד 1951. צלם לא ידוע, ויקישיתוף, נחלת הכלל.", "1948 to 1951. Photographer unknown, Wikimedia Commons, public domain.")))
        + era("1976", say("הכיכר עולה", "The square goes up"), say("ביולי 1976 התחילו העבודות, בתכנון האדריכל צבי לישר. רחוב דיזנגוף עבר ישר מתחת, והכיכר נבנתה מעליו. היא נחנכה ב־25 ביולי 1978.", "Work began in July 1976, to a design by the architect Tsvi Lissar. Dizengoff Street ran straight underneath and the square was built above it. It opened on 25 July 1978."),
          photo("Building the new circle on Dizengoff street in Tel Aviv (FL46002932).jpg", say("הכיכר המוגבהת בבנייה מעל הכביש", "The raised square being built over the road"), say("14 ביוני 1978. צילום: דני גוטפריד, אוסף דן הדני, הספרייה הלאומית, ויקישיתוף, CC BY 4.0.", "14 June 1978. Photo: Danny Gotfried, Dan Hadani Collection, National Library of Israel, Wikimedia Commons, CC BY 4.0.")))
        + era("1978", say("קשתות זכוכית", "Glass arches"), say("במרכז הבריכה החדשה, שנבנתה בממדי המקורית, הוצב פסל של אלן דוד: שלוש קשתות זכוכית ובתוכן מזרקה.", "In the middle of the new pool, built to the size of the first one, stood a sculpture by Alain David: three glass arches with a fountain inside them."),
          photo("Building the new circle on Dizengoff street in Tel Aviv (FL62628168).jpg", say("פסל הקשתות במרכז הבריכה", "The arches sculpture in the middle of the pool"), say("1978. צלם IPPA, אוסף דן הדני, הספרייה הלאומית, ויקישיתוף, CC BY 4.0.", "1978. Photo: IPPA, Dan Hadani Collection, National Library of Israel, Wikimedia Commons, CC BY 4.0.")))
        + era("1986", say("אש ומים", "Fire and water"), say("ביולי 1986 הוחלף הפסל ב״אש ומים״, פסל קינטי של יעקב אגם.", "In July 1986 the sculpture was replaced by Fire and Water, a kinetic sculpture by Yaacov Agam."),
          photo("כיכר דיזנגוף - אתרי מורשת בתל אביב 2016 (9).jpg", say("מזרקת אגם מוארת בלילה", "Agam's fountain lit at night"), say("צולם ב־2016. צילום: Chenspec, ויקישיתוף, CC BY-SA 4.0.", "Taken in 2016. Photo: Chenspec, Wikimedia Commons, CC BY-SA 4.0.")))
        + era("2017", say("הכיכר יורדת", "The square comes down"), say("ב־2016 החליטה העירייה להחזיר את הכיכר למתכונתה המקורית. ההריסה התחילה בינואר 2017, ובנובמבר 2018 הסתיימו העבודות והפסל של אגם חזר.", "In 2016 the city decided to return the square to its original form. Demolition began in January 2017, and in November 2018 the work was finished and Agam's sculpture came back."),
          photo("PikiWiki Israel 51775 dizengoff square - period of excavations.jpg", say("הכיכר בזמן העבודות", "The square during the works"), say("2018. צילום: שאולה הייטנר, ויקישיתוף (פיקיוויקי), CC BY 2.5.", "2018. Photo: Shaula Haitner, Wikimedia Commons (PikiWiki), CC BY 2.5.")))
        + era(say("היום", "Today"), say("שוב בגובה הרחוב", "At street level again"), say("הכיכר שוב שטוחה. התצלום נעשה מבניין קולנוע אסתר, היום מלון. גררו את הקו כדי לראות את אותה זווית בשחזור של 1940.", "The square is flat again. The photograph was taken from the Esther Cinema building, now a hotel. Drag the line to see the same angle in the 1940 reconstruction."),
          compare("115057 zina dizengoff square day and night PikiWiki Israel.jpg")),
      credit: say("מקורות: ויקיפדיה העברית, כיכר צינה דיזנגוף. הציטוט מעיתון הארץ לפי אתר לוטוס הזהב.", "Sources: Hebrew Wikipedia, Zina Dizengoff Square. The report from Haaretz is quoted from the Golden Lotus website."),
      links: [
        { t: say("ויקיפדיה: כיכר צינה דיזנגוף", "Hebrew Wikipedia: Zina Dizengoff Square"), u: WIKI_SQ },
        { t: say("לוטוס הזהב: כיכר צינה דיזנגוף", "Golden Lotus: Zina Dizengoff Square (Hebrew)"), u: "https://golden-lotus.co.il/zina/" }
      ]
    };
  }
  // over the lawn on the north-west side of the pool
  addHotspot("levels", "person", P(12.5, D(318), 3.0), P(21.5, D(317), 1.7), P(4, D(320), 2.6));
  hotspots[hotspots.length - 1].aside = true;

// ---------- dragging the line of the comparison ----------
  {
    const box = $("card"); let grab = null;
    const place = (el, v) => { v = clamp(v, 0, 100); el.style.setProperty("--at", v + "%"); el.setAttribute("aria-valuenow", String(Math.round(v))); };
    const to = (el, x) => { const r = el.getBoundingClientRect(); place(el, (x - r.left) / r.width * 100); };
    box.addEventListener("pointerdown", (e) => {
      const el = e.target.closest(".cmp"); if (!el) return;
      grab = { el, x: e.clientX, y: e.clientY, on: e.pointerType === "mouse" };
      if (grab.on) { e.preventDefault(); el.setPointerCapture(e.pointerId); to(el, e.clientX); }
    });
    box.addEventListener("pointermove", (e) => {
      if (!grab) return;
      if (!grab.on) {
        const dx = Math.abs(e.clientX - grab.x);
        if (dx < 6 || dx < Math.abs(e.clientY - grab.y)) return;
        grab.on = true; grab.el.setPointerCapture(e.pointerId);
      }
      to(grab.el, e.clientX);
    });
    box.addEventListener("pointerup", (e) => { if (grab && (grab.on || Math.hypot(e.clientX - grab.x, e.clientY - grab.y) < 6)) to(grab.el, e.clientX); grab = null; });
    box.addEventListener("pointercancel", () => { grab = null; });
    box.addEventListener("keydown", (e) => {
      const el = e.target.closest(".cmp"), step = { ArrowLeft: -5, ArrowRight: 5 }[e.key]; if (!el || !step) return;
      e.preventDefault(); place(el, Number(el.getAttribute("aria-valuenow")) + step);
    });
  }
