// ---------- Genia Averbuch's card: the portrait beside the text, the plan where the text talks about it ----------
  {
    const [age, code, plan, cafe, contest] = CARDS.genia.body, [portrait, drawing] = CARDS.genia.figs;
    const p = (t) => `<p>${esc(t)}</p>`;
    const fig = (f, cls) => `<figure class="${cls}"><img src="${f.src}" alt="${esc(f.alt)}"><figcaption>${esc(f.cap)}</figcaption></figure>`;
    Object.assign(CARDS.genia, {
      body: [], figs: [],
      extra: fig(portrait, "beside") + p(age) + p(code) + p(plan.replace("בתוכנית שלמעלה", "בתוכנית שלה")) + fig(drawing, "after") + p(cafe) + p(contest)
    });
  }

