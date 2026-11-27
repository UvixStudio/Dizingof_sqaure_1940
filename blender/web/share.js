  // ---------- sharing the square: from the round button and from the end of "about" ----------
  const SHARE = { title: "כיכר צינה דיזנגוף 1940", text: "מכירים את כיכר דיזנגוף? לא ככה. שחזור תלת־ממדי של הכיכר כמו שנראתה סביב 1940. מסתובבים בה ישר מהטלפון." };
  function copyText(text) {                                  // the clipboard API needs https or localhost
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const t = document.createElement("textarea"); t.value = text; t.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(t); t.select();
    const ok = document.execCommand("copy"); t.remove();
    return ok ? Promise.resolve() : Promise.reject(new Error("copy"));
  }
  function share(button) {
    const url = location.origin + location.pathname.replace(/index\.html$/, "");
    // the bar, with its hint, is out of sight while a card is open: then the pressed button says it
    const say = (text) => { if (button) button.textContent = text; else { hintEl.textContent = text; showHint(); } };
    const copy = () => copyText(SHARE.text + "\n" + url).then(() => say("הקישור הועתק"), () => say("העתיקו את הקישור משורת הכתובת"));
    if (!navigator.share) return copy();
    navigator.share({ title: SHARE.title, text: SHARE.text, url }).catch((e) => { if (e.name !== "AbortError") copy(); });
  }
  $("quick-share").addEventListener("click", () => share());
