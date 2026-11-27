// ---------- point of interest: Zina Dizengoff, whose name the square carries ----------
  // Facts: Hebrew Wikipedia (צינה דיזנגוף) and municipal announcement no. 4 (the date of the ceremony and the
  // eighth memorial day). Portrait: Zvi Oron, 1920s, Central Zionist Archives, Wikimedia Commons, public domain.
  {
    const file = "https://commons.wikimedia.org/wiki/", name = "ZinaDizenghof22.jpg";
    const p = (t) => `<p>${esc(t)}</p>`;
    CARDS.zina = {
      title: "צינה דיזנגוף", by: "האישה שעל שמה הכיכר", sub: "1872 עד 1930",
      body: [],
      extra: `<figure class="beside" style="width:9.5rem"><a href="${file}File:${name}" target="_blank" rel="noopener"><img src="${file}Special:FilePath/${name}?width=330" alt="דיוקן של צינה דיזנגוף" onerror="this.closest('figure').remove()"></a><figcaption>צילום: צבי אורון, שנות ה־20, עותק מעובד. הארכיון הציוני, ויקישיתוף, נחלת הכלל.</figcaption></figure>`
        + p("צינה דיזנגוף הייתה אשתו של מאיר דיזנגוף, ראש העירייה הראשון של תל אביב. היא מתה בפברואר 1930. אחרי מותה תרם בעלה את ביתם להקמת מוזיאון לאמנות בעיר.")
        + p("הכיכר נחנכה ב־26 בינואר 1938, ביום הזיכרון השמיני למותה. מאיר דיזנגוף לא ראה את הטקס: הוא נפטר ב־1936."),
      credit: "מקורות: ויקיפדיה העברית, ומודעה עירונית מס׳ 4 של עיריית תל אביב.",
      links: [
        { t: "ויקיפדיה: צינה דיזנגוף", u: "https://he.wikipedia.org/wiki/%D7%A6%D7%99%D7%A0%D7%94_%D7%93%D7%99%D7%96%D7%A0%D7%92%D7%95%D7%A3" },
        { t: "ויקיפדיה: כיכר צינה דיזנגוף", u: WIKI_SQ }
      ]
    };
  }
  // over the lawn on the near side of the pool, seen from the walk with the fountain behind it
  addHotspot("zina", "person", P(12.5, D(138), 3.0), P(21.5, D(137), 1.7), P(4, D(140), 2.6));
  hotspots[hotspots.length - 1].aside = true;

