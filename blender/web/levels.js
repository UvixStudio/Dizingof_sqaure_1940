// ---------- point of interest: how the square changed, from the 1934 plan to today ----------
  // Facts: Hebrew Wikipedia (כיכר צינה דיזנגוף). First evening: Haaretz, 27.1.1938, as quoted by golden-lotus.co.il.
  // The 1940s parade: the typed caption on the print itself. Photographs are loaded from Wikimedia Commons,
  // each under the licence written beneath it, so nothing is copied into the (public) repository.
  {
    const commons = "https://commons.wikimedia.org/wiki/";
    const photo = (name, alt, cap) => `<figure class="shot"><a href="${commons}File:${encodeURIComponent(name)}" target="_blank" rel="noopener"><img src="${commons}Special:FilePath/${encodeURIComponent(name)}?width=500" alt="${alt}" loading="lazy" onerror="this.closest('figure').remove()"></a><figcaption>${cap}</figcaption></figure>`;
    const era = (year, title, text, pictures) => `<h3>${year} · ${title}</h3><p>${text}</p>${pictures || ""}`;
    CARDS.levels = {
      title: "הכיכר שעולה ויורדת", by: "הגלגולים שלה לאורך השנים", sub: "מ־1934 עד היום",
      body: ["אותו מעגל, כמה כיכרות שונות. בסצנה רואים את הראשונה: שטוחה, בגובה הרחוב. לחיצה על תצלום פותחת אותו בגדול."],
      extra:
        era("1934", "ההגבהה שנדחתה", "ג'ניה אוורבוך זכתה בתחרות לעיצוב הכיכר. בתוכנית המקורית הכיכר הייתה אמורה לעמוד כמטר מעל סביבתה, ומתחתיה תחנת מוניות וחניה. בגלל העלות הגבוהה ומיעוט כלי הרכב הוחלט לדחות את זה לעתיד.",
          `<figure class="shot"><img src="${IMG_PLAN}" alt="תוכנית אוורבוך לסידור הכיכר" loading="lazy" onerror="this.parentNode.remove()"><figcaption>תוכנית אוורבוך לסידור הכיכר. ידיעות עיריית תל אביב.</figcaption></figure>`)
        + era("1938", "החנוכה", "ב־26 בינואר 1938 נחנכה הכיכר: מעגל תנועה בקוטר של כ־66 מטר, ובמרכזו בריכה ומזרקה, דשא, שבילים וערוגות. לפי עיתון הארץ מהבוקר שאחרי, הגן הואר אז לראשונה בלילה והמזרקה זהרה באורות צבעוניים.",
          photo("110274 tel aviv - dizengoff square PikiWiki Israel.png", "הכיכר והמזרקה בשנות השלושים", "שנות ה־30. צלם לא ידוע, ויקישיתוף, נחלת הכלל."))
        + era("שנות ה־40", "מקום של טקסים", "על התצלום מוקלד Soldiers' Day, יום החייל: טורי חיילים צועדים בכיכר וקהל גדול מסביב. התאריך המדויק לא ידוע.",
          photo("109688 tel aviv - dizengoff square PikiWiki Israel.png", "חיילים צועדים בכיכר דיזנגוף", "1941 עד 1943. צלם לא ידוע, ויקישיתוף, נחלת הכלל."))
        + era("1948", "הגן גדל", "העצים והדקלים צמחו והכיכר נעשתה גן מוצל. הבניינים האחרונים סביבה הושלמו רק בשנות ה־50, ובמרץ 1959 נפתח בה כלבו המשביר לצרכן.",
          photo("PikiWiki Israel 46886 Dizengoff Square in Tel Aviv.jpg", "צמחייה גבוהה והמזרקה", "1948 עד 1951. צלם לא ידוע, ויקישיתוף, נחלת הכלל."))
        + era("1976", "הכיכר עולה", "ביולי 1976 התחילו העבודות, בתכנון האדריכל צבי לישר. רחוב דיזנגוף עבר ישר מתחת, והכיכר נבנתה מעליו. היא נחנכה ב־25 ביולי 1978.",
          photo("Building the new circle on Dizengoff street in Tel Aviv (FL46002932).jpg", "הכיכר המוגבהת בבנייה מעל הכביש", "14 ביוני 1978. צילום: דני גוטפריד, אוסף דן הדני, הספרייה הלאומית, ויקישיתוף, CC BY 4.0."))
        + era("1978", "קשתות זכוכית", "במרכז הבריכה החדשה, שנבנתה בממדי המקורית, הוצב פסל של אלן דוד: שלוש קשתות זכוכית ובתוכן מזרקה.",
          photo("Building the new circle on Dizengoff street in Tel Aviv (FL62628168).jpg", "פסל הקשתות במרכז הבריכה", "1978. צלם IPPA, אוסף דן הדני, הספרייה הלאומית, ויקישיתוף, CC BY 4.0."))
        + era("1986", "אש ומים", "ביולי 1986 הוחלף הפסל ב״אש ומים״, פסל קינטי של יעקב אגם.",
          photo("כיכר דיזנגוף - אתרי מורשת בתל אביב 2016 (9).jpg", "מזרקת אגם מוארת בלילה", "צולם ב־2016. צילום: Chenspec, ויקישיתוף, CC BY-SA 4.0."))
        + era("2017", "הכיכר יורדת", "ב־2016 החליטה העירייה להחזיר את הכיכר למתכונתה המקורית. ההריסה התחילה בינואר 2017, ובנובמבר 2018 הסתיימו העבודות והפסל של אגם חזר.",
          photo("PikiWiki Israel 51775 dizengoff square - period of excavations.jpg", "הכיכר בזמן העבודות", "2018. צילום: שאולה הייטנר, ויקישיתוף (פיקיוויקי), CC BY 2.5."))
        + era("היום", "שוב בגובה הרחוב", "הכיכר שוב שטוחה. התצלום נעשה מבניין קולנוע אסתר, היום מלון.",
          photo("115057 zina dizengoff square day and night PikiWiki Israel.jpg", "הכיכר בלילה במבט מלמעלה", "2024. צילום: שלמה רודד, ויקישיתוף (פיקיוויקי), CC BY 2.5.")),
      credit: "מקורות: ויקיפדיה העברית, כיכר צינה דיזנגוף. הציטוט מעיתון הארץ לפי אתר לוטוס הזהב.",
      links: [
        { t: "ויקיפדיה: כיכר צינה דיזנגוף", u: WIKI_SQ },
        { t: "לוטוס הזהב: כיכר צינה דיזנגוף", u: "https://golden-lotus.co.il/zina/" }
      ]
    };
  }
  // over the lawn on the north-west side of the pool
  addHotspot("levels", "person", P(12.5, D(318), 3.0), P(21.5, D(317), 1.7), P(4, D(320), 2.6));
  hotspots[hotspots.length - 1].aside = true;

