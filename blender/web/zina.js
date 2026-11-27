// ---------- point of interest: Zina Dizengoff, whose name the square carries ----------
  // Facts: Hebrew Wikipedia (צינה דיזנגוף) and municipal announcement no. 4 (the date of the ceremony and the
  // eighth memorial day). Portrait: Zvi Oron, 1920s, Central Zionist Archives, Wikimedia Commons, public domain.
  {
    const file = "https://commons.wikimedia.org/wiki/", name = "ZinaDizenghof22.jpg";
    const p = (t) => `<p>${esc(t)}</p>`;
    CARDS.zina = {
      title: say("צינה דיזנגוף", "Zina Dizengoff"), by: say("האישה שעל שמה הכיכר", "The woman the square is named after"), sub: say("1872 עד 1930", "1872 to 1930"),
      body: [],
      extra: `<figure class="beside" style="width:9.5rem"><a href="${file}File:${name}" target="_blank" rel="noopener"><img src="${file}Special:FilePath/${name}?width=330" alt="${say("דיוקן של צינה דיזנגוף", "Portrait of Zina Dizengoff")}" onerror="this.closest('figure').remove()"></a><figcaption>${say("צילום: צבי אורון, שנות ה־20, עותק מעובד. הארכיון הציוני, ויקישיתוף, נחלת הכלל.", "Photo: Zvi Oron, 1920s, retouched copy. Central Zionist Archives, Wikimedia Commons, public domain.")}</figcaption></figure>`
        + p(say("צינה דיזנגוף הייתה אשתו של מאיר דיזנגוף, ראש העירייה הראשון של תל אביב. היא מתה בפברואר 1930. אחרי מותה תרם בעלה את ביתם להקמת מוזיאון לאמנות בעיר.", "Zina Dizengoff was the wife of Meir Dizengoff, the first mayor of Tel Aviv. She died in February 1930. After her death her husband gave their home to the city for an art museum."))
        + p(say("הכיכר נחנכה ב־26 בינואר 1938, ביום הזיכרון השמיני למותה. מאיר דיזנגוף לא ראה את הטקס: הוא נפטר ב־1936.", "The square opened on 26 January 1938, the eighth memorial day of her death. Meir Dizengoff did not see the ceremony: he died in 1936.")),
      credit: say("מקורות: ויקיפדיה העברית, ומודעה עירונית מס׳ 4 של עיריית תל אביב.", "Sources: Hebrew Wikipedia and Tel Aviv Municipality notice no. 4."),
      links: [
        { t: say("ויקיפדיה: צינה דיזנגוף", "Hebrew Wikipedia: Zina Dizengoff"), u: "https://he.wikipedia.org/wiki/%D7%A6%D7%99%D7%A0%D7%94_%D7%93%D7%99%D7%96%D7%A0%D7%92%D7%95%D7%A3" },
        { t: say("ויקיפדיה: כיכר צינה דיזנגוף", "Hebrew Wikipedia: Zina Dizengoff Square"), u: WIKI_SQ }
      ]
    };
  }
  // over the lawn on the near side of the pool, seen from the walk with the fountain behind it
  addHotspot("zina", "person", P(12.5, D(138), 3.0), P(21.5, D(137), 1.7), P(4, D(140), 2.6));
  hotspots[hotspots.length - 1].aside = true;

