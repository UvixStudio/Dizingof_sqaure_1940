// ---------- point of interest: the opening of the square, January 1938 ----------
  // Facts: municipal announcement no. 4 (data/research_images/3623f3ae), the film's own captions, and the Israel Film Archive record.
  CARDS.opening = {
    title: "חנוכת כיכר צינה דיזנגוף", by: "26 בינואר 1938", sub: "הסרט: יומן כרמל, נתן אקסלרוד, ינואר 1938",
    video: "SdrtVZkEUTg", ratio: "4 / 3",
    body: [
      "הכיכר נחנכה בטקס פומבי ביום רביעי, כ״ד בשבט תרצ״ח, ביום הזיכרון השמיני לצינה דיזנגוף, אשתו של ראש העירייה המנוח מאיר דיזנגוף.",
      "לפי המודעה העירונית על הטקס, העירייה נטעה וסידרה את הכיכר לזכרה, בעזרת תרומות של עובדי העירייה ושל בעלי הבתים והמגרשים שמסביב. הטקס נקבע לשעה 16:30, והכניסה למוזמנים הייתה מרחוב דיזנגוף, מצד רחוב המלך ג׳ורג׳.",
      "הסרט נמשך קצת יותר מדקה. רואים בו את הכיכר ביום ובלילה: דקל צעיר, ספסלים לבנים, מבט מלמעלה אל הבריכה, והמזרקה מוארת בחושך.",
      "בכתוביות נאמר שהכיכר ״נחנכה השבוע ברוב עם״, שניטעו בה תמרים שהובאו מגן רחל בכנרת, ושהוצבו בה 28 ספסלים לבנים, מזרקה ופנסים."
    ],
    credit: "מקורות: מודעה עירונית מס׳ 4 של עיריית תל אביב, ארכיון הסרטים הישראלי, וכתוביות הסרט (אוסף יומני כרמל, נתן אקסלרוד).",
    links: [
      { t: "הסרט ביוטיוב", u: "https://youtu.be/SdrtVZkEUTg" },
      { t: "ארכיון הסרטים הישראלי: רשומת הסרט", u: "https://jfc.org.il/news_journal/27482-2/93669-2/" },
      { t: "ויקיפדיה: כיכר צינה דיזנגוף", u: WIKI_SQ }
    ]
  };
  // over the near side of the pool: in the middle of the square, and already in sight in the opening view
  addHotspot("opening", "play", P(7.5, D(230), 3.6), P(18.5, D(222), 1.7), P(2, D(230), 3.4));
  hotspots[hotspots.length - 1].sp.material.map = canvasTex(128, 128, (c) => {
    c.fillStyle = "rgba(236,223,192,.96)"; c.beginPath(); c.arc(64, 64, 60, 0, 7); c.fill();
    c.fillStyle = "#4a3425"; c.beginPath(); c.arc(64, 64, 51, 0, 7); c.fill();
    c.fillStyle = "#f0e3c2"; c.beginPath(); c.moveTo(52, 26); c.lineTo(52, 62); c.lineTo(82, 44); c.closePath(); c.fill();
    c.direction = "ltr"; c.font = "700 36px " + SERIF; c.fillText("1938", 64, 86);
  });

