// ---------- "about the project" pop-up: how it was made, what is exact, who made it ----------
  const LINKEDIN = "https://www.linkedin.com/in/meet-yuval-cohen/";
  const WHATSAPP = "972512868309";        // international form, digits only. The number is never shown, the button opens a chat
  function openAbout() {
    // pictures with archive photographs live in about/archive (not published yet): a missing one removes its own frame
    const shot = (src, cap) => `<figure class="shot"><img src="../about/${src}.webp" alt="${cap}" loading="lazy" onerror="const li = this.closest('li'); this.parentNode.remove(); if (li && li.dataset.needs && !li.querySelector('figure')) li.remove();"><figcaption>${cap}</figcaption></figure>`;
    const step = (title, text, pictures, needs) => `<li${needs ? ' data-needs="1"' : ""}><h4>${title}</h4><p>${text}</p>${pictures || ""}</li>`;
    const social = (url, label, icon) => `<a href="${url}" target="_blank" rel="noopener" aria-label="${label}" title="${label}"><i class="fa-brands ${icon}" aria-hidden="true"></i></a>`;
    card.innerHTML = `<div class="head"><div><h2 id="card-title">אודות הפרויקט</h2><p class="by">כיכר צינה דיזנגוף, מהחנוכה ב־1938</p></div><button class="x" id="card-x" aria-label="סגירה"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="scroll">
      <p class="lead">שחזור תלת־ממדי של הכיכר בשנים הראשונות שלה. בתוכה מחכות נקודות מידע על הרגעים והאנשים המרכזיים: לחצו על אחת מהן וגלו את הסיפור.</p>
      <section class="creator">
        <div class="who"><img src="../about/yuval.webp" alt="" width="34" height="34"><h4>אודות היוצר: יובל כהן</h4></div>
        <p>חוקר עולמות תלת־ממד וטכנולוגיה וחובב היסטוריה מושבע. ניסיתי להחזיר את הכיכר לחיים, כדי שאפשר יהיה לעמוד בתוכה ולגלות אותה מחדש.</p>
        <div class="socials">${social(LINKEDIN, "לינקדאין", "fa-linkedin-in")}${WHATSAPP ? social("https://wa.me/" + WHATSAPP, "וואטסאפ", "fa-whatsapp") : ""}</div>
      </section>
      <h3>איך זה נבנה</h3>
      <ol class="steps">
        ${step("מחקר", "מתי נבנתה הכיכר, מי תכנן אותה ואיך נראתה. היא נחנכה ב־26 בינואר 1938 לפי תוכנית של ג'ניה אוורבוך. נאספו עשרות תצלומים בשחור לבן מזוויות שונות, פריימים מיומן קולנוע ומודעה עירונית, ומוינו לפי תקופה: מה מתאים ל־1940 ומה מאוחר יותר.")}
        ${step("אז מול היום", "מפת OpenStreetMap של היום הושוותה לתצלומי התקופה: צורות הבניינים, כיווני הרחובות ושמות הבתים. ששת בנייני הטבעת סומנו A עד F, וכל אחד קיבל חזית משלו. הקולנוע הותאם לתצלומים, ושאר החזיתות הן פרשנות.",
          shot("map", "ששת בנייני הטבעת והרחובות. © תורמי OpenStreetMap") + shot("archive/corners", "סימון פינות ופרטי חזית על גבי תצלומים") + shot("archive/facades", "חזיתות: תצלום מול הניסיון הראשון"))}
        ${step("צבע לתחושה", "תצלומים בשחור לבן נצבעו בבינה מלאכותית. הצבעים מומצאים ולא מדויקים, אבל הם נתנו תחושה של איך זה היה נראה ועזרו מאוד לשפר את הסצנה.",
          shot("archive/colour_square", "למעלה התצלום, למטה הגרסה הצבועה") + shot("archive/colour_street", "אותה פינה, בשחור לבן ובצבע"))}
        ${step("גרסה ראשונה בדפדפן", "בהתחלה הכול נבנה ישירות ב־Three.js, בקוד, בלי Blender. כך נבדקו הפריסה, המידות והתנועה בכיכר.",
          shot("facelift", "גלגולי הגרסה הראשונה, לפני ואחרי"))}
        ${step("המעבר ל־Blender", "כשהבסיס ב־Three.js היה טוב מספיק, חובר Blender דרך MCP, ומשם כל השלבים נעשו בו: קודם גושים לפי המפה, אחר כך טבעות הגן, ולבסוף חזיתות באוהאוס, צמחייה, מזרקה, רכבים ואנשים.",
          shot("massing", "הגושים הראשונים ב־Blender") + shot("early", "הגן מתחיל לקבל צורה") + shot("render", "רינדור מתוך הכיכר"))}
        ${step("מדידה מתוך תצלומים", "מצלמה וירטואלית הותאמה לזווית של תצלום, ורשת וקווים הונחו עליו עד שהתיישבו. כך יצאו בריכה ברדיוס של כ־8.4 מטר ומדשאה פנימית עד כ־16 מטר.",
          shot("archive/measure", "קווי המדידה, על תצלום מאוחר מ־1940") + shot("archive/grid_square", "רשת מדידה על תצלום המזרקה") + shot("archive/grid_cinema", "רשת מדידה על תצלום הקולנוע"))}
        ${step("תצלום מול שחזור", "אותה זווית מצלמה: למעלה התצלום, למטה השחזור. כך רואים מה כבר דומה ומה עוד לא.",
          shot("archive/compare_square", "הבריכה, הגדר והטבעות. זיהוי הרחוב בתצלום הזה לא ודאי") + shot("archive/compare_cinema", "קולנוע כיכר דיזנגוף. התצלום מאוחר מ־1940"), true)}
        ${step("אל הדפדפן", "הדגם יוצא בחזרה לאתר שרץ ב־Three.js, ונדחס לכ־6 מגה כדי להיטען מהר גם בטלפון. הכלים: Blender, Three.js, OpenStreetMap ו־Claude Code.")}
      </ol>
      <h3>מה מדויק ומה משוער</h3>
      ${$("notes").querySelector("ul").outerHTML}
      <section class="share-end"><h3>נהניתם לטייל בהיסטוריה בתלת־ממד?</h3><p>שתפו את הכיכר עם מי שיאהב אותה.</p><button class="share-btn" id="card-share">שיתוף</button></section>
      <section class="rights"><h3>זכויות יוצרים וקרדיטים</h3>
      <ul>
        <li>תצלומים בחלונות המידע: ויקישיתוף, ובהם פיקיוויקי, אוסף דן הדני בספרייה הלאומית והארכיון הציוני. שם הצלם והרישיון מופיעים ליד התצלומים. מקור דיוקנה של ג'ניה אוורבוך לא זוהה.</li>
        <li>תוכנית אוורבוך לכיכר: ידיעות עיריית תל אביב.</li>
        <li>סרט חנוכת הכיכר: אוסף יומני כרמל (נתן אקסלרוד), ארכיון הסרטים הישראלי. הסרטונים מוצגים בנגן המוטמע של YouTube.</li>
        <li>רשומות ההקרנה: פרויקט ירושלים סגל, סינמטק תל אביב. כרזות הסרטים: ויקישיתוף, נחלת הכלל.</li>
        <li>מפת הבניינים והרחובות: © תורמי <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener"><bdi>OpenStreetMap</bdi></a>, רישיון ODbL.</li>
        <li>שמיים: <a href="https://polyhaven.com" target="_blank" rel="noopener"><bdi>Poly Haven</bdi></a>, רישיון CC0. תלת־ממד: <a href="https://threejs.org" target="_blank" rel="noopener"><bdi>Three.js</bdi></a>, רישיון MIT. אייקונים: <a href="https://fontawesome.com/license/free" target="_blank" rel="noopener"><bdi>Font Awesome Free</bdi></a>. גופנים: Google Fonts, רישיון OFL.</li>
        <li>איורי חזיתות החנויות והגרסאות הצבועות של התצלומים נוצרו בבינה מלאכותית.</li>
      </ul>
      <p class="credit">הדמויות מבוססות על הדגמים <a href="https://polyfork.dev/asset/audience-gentleman-base" target="_blank" rel="noopener"><bdi>Audience gentleman</bdi></a>, <a href="https://polyfork.dev/asset/human-vest-shorts-base" target="_blank" rel="noopener"><bdi>Human vest shorts</bdi></a>, <a href="https://polyfork.dev/asset/taverna-waiter-base" target="_blank" rel="noopener"><bdi>Taverna waiter</bdi></a>, <a href="https://polyfork.dev/asset/older-woman-with-a-basket-base" target="_blank" rel="noopener"><bdi>Older woman with a basket</bdi></a>, <a href="https://polyfork.dev/asset/teen-audience-member-base" target="_blank" rel="noopener"><bdi>Teen audience member</bdi></a>, <a href="https://polyfork.dev/asset/child-at-the-fun-fair-base" target="_blank" rel="noopener"><bdi>Child at the fun fair</bdi></a> מאת <a href="https://polyfork.dev" target="_blank" rel="noopener"><bdi>Polyfork</bdi></a>, ברישיון <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener"><bdi>CC BY 4.0</bdi></a>. הדגמים שונו: צבעים, לבוש, כובעים, תנוחות והפחתת פרטים.</p>
      <p class="credit">זכויות היוצרים בתצלומים, בסרטים ובחומרי הארכיון שמורות לבעליהן. לתיקון קרדיט או להסרה אפשר לפנות בוואטסאפ שבראש החלון.</p></section>
    </div>`;
    card.hidden = false; $("veil").hidden = false; $("notes").hidden = true;
    $("card-x").addEventListener("click", closeCard); $("card-share").addEventListener("click", (e) => share(e.currentTarget)); $("card-x").focus({ preventScroll: true });
    setBar(true);
  }

