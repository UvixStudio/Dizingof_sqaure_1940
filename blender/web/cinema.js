// ---------- the cinema card: its two names and the films of 1939-40 ----------
  // Screening dates and Hebrew titles: "Jerusalem Segal project", Tel Aviv Cinematheque library and archive
  // (cinema.co.il, table of screenings). Robin Hood: Davar, 28.4.1939, as quoted by golden-lotus.co.il.
  // Posters: Wikimedia Commons files marked public domain (the American posters, not the local ones).
  {
    const commons = "https://commons.wikimedia.org/wiki/";
    const poster = (file, name) => `<a href="${commons}File:${encodeURIComponent(file)}" target="_blank" rel="noopener"><img src="${commons}Special:FilePath/${encodeURIComponent(file)}?width=330" alt="כרזת הסרט ${name}" loading="lazy" onerror="this.parentNode.remove()"><span>${name}</span></a>`;
    const PROGRAMME = "כרטיס לסרט שלגייה ושבעת הגמדים.jpg";
    const films = (year, list) => `<h4>${year}</h4><ul class="films">${list.map(([day, he, en]) => `<li><time>${day}</time><span>${he}<bdi>${en}</bdi></span></li>`).join("")}</ul>`;
    Object.assign(CARDS.esther, {
      sub: "נפתח ב־30 במרץ 1939",
      body: [
        "הבניין נבנה ב־1938 עד 1939 עבור אסתר ומשה נתנאל, בתכנון האדריכל יהודה מגידוביץ' ובנו, המהנדס רפאל מגידו. הוא עומד על עמודים, עם חזית קעורה ומרפסות סרט.",
        "הקולנוע נפתח בשם קולנוע כיכר דיזנגוף. אחרי שנתו הראשונה שונה שמו לקולנוע אסתר, על שם אסתר נתנאל. המקורות לא נותנים תאריך מדויק לשינוי.",
        "באולם היו כ־1,000 מקומות, והוא תואר כראשון בארץ עם מיזוג אוויר מרכזי. בבניין פעלו קפה אמנות עם רחבת ריקודים וחנות הכלבו אקמן. ב־1998 הוסב הבניין למלון."
      ],
      extra: `<h3>תוכניית ערב הפתיחה</h3>
        <figure class="programme"><a href="${commons}File:${encodeURIComponent(PROGRAMME)}" target="_blank" rel="noopener"><img src="${commons}Special:FilePath/${encodeURIComponent(PROGRAMME)}" alt="תוכניית הפתיחה של קולנוע כיכר דיזנגוף, מרץ 1939, בעברית ובאנגלית" loading="lazy" onerror="this.closest('figure').remove()"></a><figcaption>צילום: דני גולדשמיד, ויקישיתוף, CC BY-SA 3.0. לחיצה פותחת בגדול.</figcaption></figure>
        <p>בערב הפתיחה, 30 במרץ 1939, בחסות ראש העירייה ישראל רוקח: יומן פרמאונט, קטעי הווי מהארץ, סרט קצר, הפסקה, ואז שלגיה ושבעת הגמדים. בהצגות היומיות בחג הפסח הוקרן שירת המיסיסיפי עם בובי ברין.</p>
        <h3>על המסך</h3>
        <div class="posters">${poster("Snow White and the Seven Dwarfs (Style B) poster.jpg", "שלגיה ושבעת הגמדים")}${poster("The Adventures of Robin Hood (1938 poster).jpg", "רובין הוד")}${poster("Fourdaughters1938.JPG", "חלומות נעורים")}</div>
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
        <p>שלט המתכת על הקיר בסצנה הוא עיצוב של השחזור. בגלויה מהתקופה נראות שם אותיות אדומות אנכיות. הכרזה שמתחתיו היא הכרזה האמריקאית של חלומות נעורים, לא הכרזה שנתלתה בקולנוע. הכרזה על המרפסת עם שמה של אליזבת ברגנר מופיעה בגלויה.</p>`,
      credit: "מבחר מתוך רשומות ההקרנה בפרויקט ירושלים סגל, הספרייה לקולנוע והארכיון בסינמטק תל אביב. רובין הוד לפי עיתון דבר, ושירת המיסיסיפי לפי תוכניית הפתיחה. הכרזות הן הכרזות האמריקאיות, מוויקישיתוף, בנחלת הכלל.",
      links: [
        { t: "ויקיפדיה: קולנוע אסתר", u: "https://he.wikipedia.org/wiki/%D7%A7%D7%95%D7%9C%D7%A0%D7%95%D7%A2_%D7%90%D7%A1%D7%AA%D7%A8" },
        { t: "טבלת ההקרנות של ארכיון סינמטק תל אביב", u: "https://www.cinema.co.il/wp-content/uploads/2025/01/%D7%A4%D7%A8%D7%95%D7%99%D7%A7%D7%98-%D7%99%D7%A8%D7%95%D7%A9%D7%9C%D7%99%D7%9D-%D7%A1%D7%92%D7%9C-.pdf" },
        { t: "לוטוס הזהב: קולנוע אסתר", u: "https://golden-lotus.co.il/esther/" }
      ]
    });
  }

