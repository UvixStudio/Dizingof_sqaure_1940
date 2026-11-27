  // ---------- the cards in English (Zina, the levels, the cinema and "about" carry both languages in their own files) ----------
  if (LANG_EN) {
    const wiki = { t: "Hebrew Wikipedia: Zina Dizengoff Square", u: WIKI_SQ };
    Object.assign(CARDS.opening, {
      title: "The opening of Zina Dizengoff Square", by: "26 January 1938", sub: "The film: Carmel newsreel, Nathan Axelrod, January 1938",
      body: [
        "The square was opened at a public ceremony on Wednesday, 24 Shevat 5698, the eighth memorial day of Zina Dizengoff, wife of the late mayor Meir Dizengoff.",
        "According to the municipal notice of the ceremony, the city planted and laid out the square in her memory, helped by contributions from city employees and from the owners of the houses and plots around it. The ceremony was set for 4:30 pm, and guests entered from Dizengoff Street, on the King George Street side.",
        "The film runs a little over a minute. It shows the square by day and by night: a young palm, white benches, a view from above over the pool, and the fountain lit in the dark.",
        "The captions say that the square was \u201Copened this week before a large crowd\u201D, that date palms brought from Gan Rachel in Kinneret were planted in it, and that 28 white benches, a fountain and lamps were set up there."
      ],
      credit: "Sources: Tel Aviv Municipality notice no. 4, the Israel Film Archive, and the film's captions (Carmel newsreel collection, Nathan Axelrod).",
      links: [
        { t: "The film on YouTube", u: CARDS.opening.links[0].u },
        { t: "Israel Film Archive: the record of the film (Hebrew)", u: CARDS.opening.links[1].u },
        wiki
      ]
    });
    Object.assign(CARDS.video, {
      title: "Here We Are: the opening titles", sub: "The square on television", by: "The square as a film set",
      body: [
        "The opening titles of the television series Here We Are were filmed here, in the square. The words of the theme song were changed so that children from all over the country could feel it was about them.",
        "It is a natural choice: the square was the living room of Tel Aviv. Frames from the titles show a market stall, a caf\u00E9 with round tables and white metal chairs, and shops on the ground floor of the curved buildings. This is exactly the life the square was built for.",
        "Note the difference: the titles were filmed in the square of the 1970s, after it had been raised above the road, not in the flat square of 1940 that you see here."
      ],
      credit: "Source: Hebrew Wikipedia, Zina Dizengoff Square. The description of the frames comes from watching the titles.",
      links: [{ t: "The titles on YouTube", u: CARDS.video.links[0].u }, wiki]
    });
    const [portrait, drawing] = CARDS.genia.figs;
    Object.assign(CARDS.genia, {
      title: "Genia Averbuch", by: "Queen of Tel Aviv's Bauhaus", sub: "The square's architect · 1909 to 1977",
      figs: [
        Object.assign({}, portrait, { alt: "Genia Averbuch seated on a chair", cap: "Genia Averbuch. The source of the photograph is unidentified." }),
        Object.assign({}, drawing, { alt: "Averbuch's plan for the square: a view from above and a model", cap: "Plan for the layout of Zina Dizengoff Square, Genia Averbuch. Tel Aviv Municipality News, issue 2, p. 51." })
      ],
      body: [
        "She was 25 when she entered the 1934 competition to design the square, and her plan set the way the square looks to this day. The square opened on 26 January 1938.",
        "She did not design only the garden in the middle. She set a binding code for everyone who built around it: curved fronts that carry on the line of the circle, long horizontal balcony bands and one height. The result is a single round street, not six separate buildings. Some of the buildings she designed herself.",
        "In her plan you can see curved blocks around a central circle, with the gaps between them as the streets. In this reconstruction the angles of the streets and the shape of the blocks were measured from that plan.",
        "Among her other works is Café Galina at the 1934 Levant Fair, together with Elsa Gidoni-Mandelstamm and Shlomo Ginsburg.",
        "A note on the competition: the Hebrew Wikipedia says she won it. Another source says no first prize was awarded, and that she and Y. Grinetz shared second place."
      ],
      credit: "Sources: Hebrew Wikipedia (Zina Dizengoff Square), artlog, and Davidi's article on the Levant Fair.",
      links: [
        { t: "Wikipedia: Genia Averbuch", u: CARDS.genia.links[1].u },
        { t: "Hebrew Wikipedia: Genia Averbuch", u: CARDS.genia.links[0].u },
        { t: "Hebrew Wikipedia: Zina Dizengoff Square", u: WIKI_SQ }
      ]
    });
  }

