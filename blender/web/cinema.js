// ---------- the cinema card: its two names and the films of 1939-40 ----------
  // Screening dates and Hebrew titles: "Jerusalem Segal project", Tel Aviv Cinematheque library and archive
  // (cinema.co.il, table of screenings). Robin Hood: Davar, 28.4.1939, as quoted by golden-lotus.co.il.
  // Posters: Wikimedia Commons files marked public domain (the American posters, not the local ones).
  {
    const commons = "https://commons.wikimedia.org/wiki/";
    const poster = (file, name) => `<a href="${commons}File:${encodeURIComponent(file)}" target="_blank" rel="noopener"><img src="${commons}Special:FilePath/${encodeURIComponent(file)}?width=330" alt="${say("כרזת הסרט " + name, "Poster for " + name)}" loading="lazy" onerror="this.parentNode.remove()"><span>${name}</span></a>`;
    const english = (day) => { const [d, m] = day.split("."); return m ? d + " " + "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")[m - 1] : "April"; };   // "1.4" reads as 1 Apr
    const PROGRAMME = "כרטיס לסרט שלגייה ושבעת הגמדים.jpg";
    const films = (year, list) => `<h4>${year}</h4><ul class="films">${list.map(([day, he, en]) => `<li><time>${say(day, english(day))}</time><span>${say(`${he}<bdi>${en}</bdi>`, en)}</span></li>`).join("")}</ul>`;
    if (LANG_EN) Object.assign(CARDS.esther, { title: "Dizengoff Square Cinema", by: "later the Esther Cinema" });
    Object.assign(CARDS.esther, {
      sub: say("נפתח ב־30 במרץ 1939", "Opened on 30 March 1939"),
      body: [
        say("הבניין נבנה ב־1938 עד 1939 עבור אסתר ומשה נתנאל, בתכנון האדריכל יהודה מגידוביץ' ובנו, המהנדס רפאל מגידו. הוא עומד על עמודים, עם חזית קעורה ומרפסות סרט.", "The building went up in 1938 and 1939 for Esther and Moshe Netanel, to a design by the architect Yehuda Magidovitch and his son, the engineer Raphael Megido. It stands on columns, with a concave front and ribbon balconies."),
        say("הקולנוע נפתח בשם קולנוע כיכר דיזנגוף. אחרי שנתו הראשונה שונה שמו לקולנוע אסתר, על שם אסתר נתנאל. המקורות לא נותנים תאריך מדויק לשינוי.", "The cinema opened as the Dizengoff Square Cinema. After its first year it was renamed the Esther Cinema, after Esther Netanel. The sources give no exact date for the change."),
        say("באולם היו כ־1,000 מקומות, והוא תואר כראשון בארץ עם מיזוג אוויר מרכזי. בבניין פעלו קפה אמנות עם רחבת ריקודים וחנות הכלבו אקמן. ב־1998 הוסב הבניין למלון.", "The hall had about 1,000 seats and was described as the first in the country with central air conditioning. The building also held Café Omanut, with a dance floor, and the Ackerman department store. In 1998 it was turned into a hotel.")
      ],
      extra: `<h3>${say("תוכניית ערב הפתיחה", "The programme of the opening night")}</h3>
        <figure class="programme"><a href="${commons}File:${encodeURIComponent(PROGRAMME)}" target="_blank" rel="noopener"><img src="${commons}Special:FilePath/${encodeURIComponent(PROGRAMME)}" alt="${say("תוכניית הפתיחה של קולנוע כיכר דיזנגוף, מרץ 1939, בעברית ובאנגלית", "The opening programme of the Dizengoff Square Cinema, March 1939, in Hebrew and English")}" loading="lazy" onerror="this.closest('figure').remove()"></a><figcaption>${say("צילום: דני גולדשמיד, ויקישיתוף, CC BY-SA 3.0. לחיצה פותחת בגדול.", "Photo: Danny Goldschmidt, Wikimedia Commons, CC BY-SA 3.0. Tap to see it full size.")}</figcaption></figure>
        <p>${say("בערב הפתיחה, 30 במרץ 1939, בחסות ראש העירייה ישראל רוקח: יומן פרמאונט, קטעי הווי מהארץ, סרט קצר, הפסקה, ואז שלגיה ושבעת הגמדים. בהצגות היומיות בחג הפסח הוקרן שירת המיסיסיפי עם בובי ברין.", "On the opening night, 30 March 1939, under the patronage of Mayor Israel Rokach: Paramount News, scenes of life in the country, a short film, an interval, and then Snow White and the Seven Dwarfs. The daily Passover shows screened Rainbow on the River with Bobby Breen.")}</p>
        <h3>${say("על המסך", "On screen")}</h3>
        <div class="posters">${poster("Snow White and the Seven Dwarfs (Style B) poster.jpg", say("שלגיה ושבעת הגמדים", "Snow White"))}${poster("The Adventures of Robin Hood (1938 poster).jpg", say("רובין הוד", "Robin Hood"))}${poster("Fourdaughters1938.JPG", say("חלומות נעורים", "Four Daughters"))}</div>
        ${films("1939", [
          ["1.4", "שלגיה ושבעת הגמדים", "Snow White and the Seven Dwarfs"],
          ["2.4", "שירת המיסיסיפי", "Rainbow on the River"],
          ["אפריל", "הרפתקאותיו של רובין הוד", "The Adventures of Robin Hood"],
          ["6.5", "חלומות נעורים", "Four Daughters"],
          ["29.7", "ארבעה בגן", "Four's a Crowd"],
          ["26.8", "עמק הנפילים", "Valley of the Giants"],
          ["9.9", "דגלים לבנים", "White Banners"],
          ["21.10", "הפונדק העליז", "Room Service"],
          ["9.12", "הפלוגה האובדת", "The Lost Patrol"]])}
        ${films("1940", [
          ["17.2", "עוד נחיה יחד", "Next Time We Love"],
          ["25.5", "מסעות טופר", "Topper Takes a Trip"],
          ["13.7", "הנערה ממקסיקו", "The Girl from Mexico"],
          ["7.9", "מאה השנים הראשונות", "The First Hundred Years"],
          ["30.11", "קפה סוסייטי", "Café Society"]])}
        <p>${say("שלט המתכת על הקיר בסצנה הוא עיצוב של השחזור. בגלויה מהתקופה נראות שם אותיות אדומות אנכיות. הכרזה שמתחתיו היא הכרזה האמריקאית של חלומות נעורים, לא הכרזה שנתלתה בקולנוע. הכרזה על המרפסת עם שמה של אליזבת ברגנר מופיעה בגלויה.", "The metal sign on the wall in the scene was designed for this reconstruction. A postcard of the time shows red vertical letters there. The poster below it is the American poster for Four Daughters, not the one that hung at the cinema. The poster on the balcony with Elisabeth Bergner's name appears in the postcard.")}</p>`,
      credit: say("מבחר מתוך רשומות ההקרנה בפרויקט ירושלים סגל, הספרייה לקולנוע והארכיון בסינמטק תל אביב. רובין הוד לפי עיתון דבר, ושירת המיסיסיפי לפי תוכניית הפתיחה. הכרזות הן הכרזות האמריקאיות, מוויקישיתוף, בנחלת הכלל.",
        "A selection from the screening records of the Jerusalem Segal Project, the film library and archive of the Tel Aviv Cinematheque. Robin Hood after the newspaper Davar, and Rainbow on the River after the opening programme. The posters are the American ones, from Wikimedia Commons, public domain."),
      links: [
        { t: say("ויקיפדיה: קולנוע אסתר", "Hebrew Wikipedia: Esther Cinema"), u: "https://he.wikipedia.org/wiki/%D7%A7%D7%95%D7%9C%D7%A0%D7%95%D7%A2_%D7%90%D7%A1%D7%AA%D7%A8" },
        { t: say("טבלת ההקרנות של ארכיון סינמטק תל אביב", "Tel Aviv Cinematheque archive: table of screenings (Hebrew)"), u: "https://www.cinema.co.il/wp-content/uploads/2025/01/%D7%A4%D7%A8%D7%95%D7%99%D7%A7%D7%98-%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D-%D7%A1%D7%92%D7%9C-.pdf" },
        { t: say("לוטוס הזהב: קולנוע אסתר", "Golden Lotus: Esther Cinema (Hebrew)"), u: "https://golden-lotus.co.il/esther/" }
      ]
    });
  }

