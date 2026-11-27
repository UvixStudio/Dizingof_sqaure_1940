  // ---------- Hebrew or English (?lang=en, the button, remembered on the device) ----------
  // The site is written in Hebrew. In English every text on the page is swapped as it appears, by the exact Hebrew
  // string; what is painted in the scene goes through tr(). The street-name signs carry both languages anyway.
  const LANG_EN = (() => {
    let l = (location.search.match(/[?&]lang=(en|he)\b/) || [])[1];
    try { if (l) localStorage.setItem("kikarLang", l); else l = localStorage.getItem("kikarLang"); } catch (e) { /* private window */ }
    return l === "en";
  })();
  const EN_TEXT = {
    // title and loading
    "כיכר צינה (דיזנגוף)": "Zina Square (Dizengoff)", "שחזור תלת־ממד 1940": "3D reconstruction, 1940",
    "טוענים את הכיכר": "Loading the square", "מרכיבים את הכיכר": "Putting the square together", "מדליקים את האור": "Switching on the lights",
    "לנסות שוב": "Try again", "הטעינה נכשלה. בדקו את החיבור.": "Loading failed. Check your connection.",
    // the bar and its menus
    "מהגג": "Rooftop", "בתוך הכיכר": "In the square", "מהמדרכה": "Sidewalk", "מבט על": "Bird's eye", "מאחורי מכונית": "Behind a car", "מבט חופשי": "Free view",
    "סיבוב עם הטלפון": "Turn with phone", "יישור לצפון": "Align north", "נקודות מידע": "Stories",
    "חנוכת הכיכר 1938": "The 1938 opening", "צינה דיזנגוף": "Zina Dizengoff", "הכיכר עולה ויורדת": "Up and down again", "ג'ניה אוורבוך": "Genia Averbuch", "קולנוע כיכר דיזנגוף": "Dizengoff Square Cinema",
    "שליטה": "Controls", "בחירת מצלמה": "Choose a camera", "מצלמות": "Cameras", "גרירה מסובבת את הסצנה": "Drag to look around",
    "סקיצה תלת־ממדית של כיכר צינה (דיזנגוף) ב־1940": "A 3D sketch of Zina Square (Dizengoff) in 1940", "חזרה למבט הפתיחה": "Back to the opening view",
    "סגירה": "Close", "סגירת החלון": "Close", "נגן את הסרטון": "Play the video",
    // the round button
    "אודות": "About", "שיתוף": "Share", "מוד לילה": "Night", "אור יום": "Daylight", "סיור היכרות": "Quick tour", "תפריט": "Menu", "תפריט: אודות, שיתוף, יום ולילה": "Menu: about, share, day and night",
    // passing hints
    "גרור כדי להסתובב. צביטה לזום.": "Drag to look around. Pinch to zoom.", "גרור כדי להקיף את הכיכר. צביטה לקרב ולהרחיק.": "Drag to circle the square. Pinch to zoom.",
    "נוסעים סביב הכיכר. גרור כדי להסתכל מסביב לרכב, צביטה לקרב ולהרחיק.": "Riding round the square. Drag to look around the car, pinch to zoom.",
    "החיישנים לא זמינים כאן. בטלפון, פתח את הקובץ מכתובת https.": "Motion sensors are not available here. On a phone, open an https address.",
    "אין הרשאה לחיישנים. גרור כדי להסתובב.": "No permission for motion sensors. Drag to look around.",
    "הסצנה מכוונת לצפון לפי המצפן. גרירה מסובבת אותה אם צריך.": "The scene follows your compass. Drag if it needs turning.",
    "כוון את הטלפון לצפון ובחר ׳יישור לצפון׳ בתפריט המצלמות.": "Point the phone north and choose Align north in the cameras menu.",
    "הקישור הועתק": "Link copied", "העתיקו את הקישור משורת הכתובת": "Copy the link from the address bar",
    // the opening and the tour
    "דלג": "Skip", "הבא": "Next", "סיום": "Done", "בואו נתחיל": "Let's start",
    "ברוכים הבאים לכיכר צינה (דיזנגוף)": "Welcome to Zina Square (Dizengoff)",
    "שחזור מקורי לפי התוכניות של האדריכלית ג'ניה אוורבוך, שלפיהן נחנכה כיכר צינה ב־1938: מבנה הבניינים, הרחובות, ונקודות עניין היסטוריות מהשנים הראשונות ועד היום.":
      "An original reconstruction after the plans of architect Genia Averbuch, by which the square opened in 1938: the buildings, the streets, and points of history from its first years to today.",
    "בוחרים מאיפה להסתכל: מהגג, ממבט על, מתוך הכיכר או מאחורי מכונית.": "Choose where to look from: a rooftop, bird's eye, inside the square or behind a car.",
    "בוחרים מאיפה להסתכל. ולמטה, ״סיבוב עם הטלפון״: מזיזים את הטלפון ימינה ושמאלה, כאילו עומדים בתוך הכיכר. נקודה ירוקה: פועל. נגיעה נוספת מכבה.":
      "Pick a view. At the bottom, Turn with phone: swing your phone to look around as if you were there. Green dot: on. Tap again for off.",
    "סיפורים, תצלומים וסרטים. בוחרים נושא, והמצלמה לוקחת אתכם אליו.": "Stories, photographs and films. Pick one and the camera takes you there.",
    "הסיכות בכיכר": "Pins in the square", "נוגעים על סיכה, והסיפור שלה נפתח.": "Tap a pin to open its story.", "לוחצים על סיכה, והסיפור שלה נפתח.": "Click a pin to open its story.",
    "לסייר בסצנה, כמו בגוגל מפות": "Explore it like Google Maps",
    "נוגעים על הקרקע, מופיע עיגול, והולכים לשם. גוררים כדי להסתכל סביב, וצובטים לזום.": "Tap the ground, a circle appears, and you walk there. Drag to look around, pinch to zoom.",
    "לוחצים על הקרקע, מופיע עיגול, והולכים לשם. גוררים כדי להסתכל סביב, וגלגלת לזום.": "Click the ground, a circle appears, and you walk there. Drag to look around, scroll to zoom.",
    "ועוד": "And more", "אודות, שיתוף, יום ולילה, והסיור הזה שוב.": "About, share, day and night, and this tour again.",
    // what is exact and what is estimated (the list in the page, shown again inside "about")
    "גרסת עבודה: המודל נבנה בבלנדר לפי תצלומים מ־1938-1940 ועדיין בתהליך.":
      "Work in progress: the model is built in Blender from photographs of 1938 to 1940 and is still being worked on.",
    "צורות הבניינים וכיווני הרחובות מ־OpenStreetMap, © תורמי OpenStreetMap. הדגם כולל גם מבנים שהושלמו אחרי 1940, כמו מלון גזית (1948).":
      "Building shapes and street directions come from OpenStreetMap, © OpenStreetMap contributors. The model also includes buildings finished after 1940, such as the Gazit Hotel (1948).",
    "קולנוע אסתר הותאם לתצלומים. החזיתות של שאר הבניינים, הצבעים והרכבים הם פרשנות.":
      "The Esther Cinema was matched to photographs. The fronts of the other buildings, the colours and the cars are interpretation.",
    "טבעות הגן, הכביש והמזרקה נמדדו מתצלומים, בדיוק משוער.":
      "The garden rings, the road and the fountain were measured from photographs, with approximate accuracy.",
    "שמות הבתים, שנותיהם והאדריכלים לפי ויקיפדיה. השיוך של בתי פלדמן, גרינמן ומירנברג לגוש מסוים בטבעת הוא השערה.":
      "House names, dates and architects follow Wikipedia. Placing the Feldman, Greenman and Mirenberg houses on particular blocks of the ring is a guess.",
    "שמות אקמן, קפה אמנות, בית מרקחת וגל-אור לקוחים מתצלומים ומוויקיפדיה. שלמן, ויטמן, פיינשטוק והספר הטוב היו עסקים בתל אביב, לא בהכרח בכיכר. שאר שמות החנויות הומצאו ברוח התקופה. חזיתות החנויות, מיקומן, צבעי הסככות והכרזה הגדולה הם שחזור.":
      "The names Ackerman, Café Omanut, the pharmacy and Gal-Or are taken from photographs and Wikipedia. Shalman, Witman, Feinstock and Ha-Sefer Ha-Tov were businesses in Tel Aviv, not necessarily in the square. The other shop names were invented in the spirit of the time. The shopfronts, their positions, the awning colours and the large poster are reconstruction.",
    "נקודות המידע (העיגולים החומים) מבוססות על ויקיפדיה ועל המקורות שמצוינים בכל כרטיס.":
      "The points of information (the brown circles) are based on Wikipedia and on the sources named in each card.",
    // painted in the scene: building names and the street names on the road
    "לימים קולנוע אסתר": "later the Esther Cinema", "בתי פלדמן וגרינמן": "Feldman and Greenman Houses", "לילנפלד וביז'ונסקי · 1935-36": "Lilienfeld and Bizhonsky · 1935-36",
    "בית מירנברג": "Mirenberg House", "תכנון: ג'ניה אוורבוך · 1936": "Design: Genia Averbuch · 1936",
    "דיזנגוף": "DIZENGOFF", "ריינס": "REINES", "זמנהוף": "ZAMENHOF", "בן עמי": "BEN AMI", "פינסקר": "PINSKER",
  };
  const tr = (s) => LANG_EN && EN_TEXT[s] !== undefined ? EN_TEXT[s] : s;
  const say = (he, en) => LANG_EN ? en : he;                  // for the long texts, written side by side where they are used
  function switchLang() {                                    // the page loads again in the other language, without the opening
    const url = new URL(location.href);
    url.searchParams.set("lang", LANG_EN ? "he" : "en");
    try { sessionStorage.setItem("kikarQuiet", "1"); } catch (e) { /* the opening will simply play again */ }
    location.replace(url);
  }
  if (LANG_EN) {
    const html = document.documentElement;
    html.lang = "en"; html.dir = "ltr"; document.title = "Zina Square (Dizengoff) 1940";
    document.querySelectorAll("body > div[dir]").forEach((d) => { d.dir = "ltr"; });     // the page's right-to-left wrapper
    const swap = (s) => {
      const key = s.trim(), count = key.match(/^(\d+) מתוך (\d+)$/);
      if (count) return count[1] + " of " + count[2];
      return EN_TEXT[key] !== undefined ? s.replace(key, EN_TEXT[key]) : s;
    };
    const attrs = ["aria-label", "title", "alt"];
    const words = (node) => {
      if (node.nodeType === 3) { const s = swap(node.nodeValue); if (s !== node.nodeValue) node.nodeValue = s; return; }
      if (node.nodeType !== 1 || node.id === "lang-btn" || /^(SCRIPT|STYLE)$/.test(node.nodeName)) return;
      attrs.forEach((a) => { const v = node.getAttribute(a); if (v) { const s = swap(v); if (s !== v) node.setAttribute(a, s); } });
      node.childNodes.forEach(words);
    };
    const button = $("lang-btn");                           // the button offers the way back, in Hebrew
    button.innerHTML = '<span class="long">עברית</span><span class="short">עב</span>'; button.lang = "he"; button.setAttribute("aria-label", "עברית"); button.dir = "rtl";
    words(document.body);
    new MutationObserver((list) => list.forEach((m) => { if (m.type === "childList") m.addedNodes.forEach(words); else words(m.target); }))
      .observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: attrs });
    const card = $("card");                                  // a card not yet translated keeps reading right to left
    new MutationObserver(() => { const h = card.querySelector("h2"); if (h) card.dir = /[א-ת]/.test(h.textContent) ? "rtl" : "ltr"; }).observe(card, { childList: true });
  }

