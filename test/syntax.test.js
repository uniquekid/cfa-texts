const {
  requireAllCFAscripts,
  initGlobalCFAScope,
  WIN_1251_REGEX,
  UNIVERSAL_LOWERCASE_WORDS_REGEX,
  CLAN_AND_NATION_LIST_REGEX,
  KEYWORD_ABILITY_LIST_REGEX,
} = require('./util/utils');

beforeAll(async () => {
  initGlobalCFAScope();
  await requireAllCFAscripts();
});

describe('Card Name', () => {
  it('only contains valid Windows-1251 characters', () => {
    global.CardName.forEach((cardName) => {
      expect(cardName).toMatch(WIN_1251_REGEX);
    });
  });

  it('is no longer than 80 characters', () => {
    global.CardName.forEach((cardName) => {
      expect(cardName.length).toBeLessThan(80);
    });
  });

  /**
   * Checks if the word starts with capital letter or is a lowercase word.
   * The list of exceptions is maintained inside switch statement.
   * Do not amend the regex without justified cause!
   */
  it('has correct capitalization and spacing', () => {
    const wordRegex = new RegExp(
      '^[^A-Za-z\u042F]*([A-Z\u042F\\d].*|(' +
        UNIVERSAL_LOWERCASE_WORDS_REGEX.source +
        ')[^A-Za-z\u042F\\d]*)*$'
    );

    global.CardName.forEach((cardName) => {
      switch (cardName) {
        case 'False Dark Wings, Agrat bat Mahlat':
        case 'EXPOSE \u2018Burn out!!!\u2019':
        case 'Crawl, you "Insects"!':
        case 'Power of Reunited Emotions, Two for all':
        case 'One Who Spins the Song, Ono no Komachi':
        case 'Winds of Laughter that will Save the World, Joco':
        case 'Yamata no Orochi Gou, "Wooden Sword" Ryu':
        case 'Kyushu Cup 2022 x Tengen no Yusha, El Brave':
        case 'Mikazuki Munechika Ubu no Sugata':
          return;
        default:
          cardName
            .trim()
            .split(' ')
            .forEach((cardNameWord) => {
              expect(cardNameWord).toMatch(wordRegex);
            });
      }
    });
  });

  it('does not have duplicate names', () => {
    const nameArray = [];

    global.CardName.forEach((cardName, cardStat) => {
      if (
        global.CardReassignedId[cardStat] ||
        global.CardInClan[cardStat] === 29
      ) {
        return; // skip reassigned cards
      }
      expect(nameArray).not.toContain(cardName);
      nameArray.push(cardName);
    });
  });
});

describe('Card Text', () => {
  it('only contains vaild Windows-1251 characters', () => {
    global.CardText.forEach((cardText) => {
      expect(cardText).toMatch(WIN_1251_REGEX);
    });
  });

  it('is no longer than 1200 characters', () => {
    global.CardText.forEach((cardText) => {
      expect(cardText.length).toBeLessThan(1200);
    });
  });

  it('has only type, helper and skill text lines', () => {
    const textLineRegex = new RegExp(
      '^((' +
        CLAN_AND_NATION_LIST_REGEX.source +
        '|(.*/)*(Over|Critical) Trigger|Hydragrym|Messiah|ACT|AUTO|CONT|When acquired|(Additional|Play) Effect|(Normal|Set|Blitz) Order(.*\n*)*||\\u2022 |' +
        KEYWORD_ABILITY_LIST_REGEX.source +
        ' ((\\d)* - |\\(|\\[)|\\().*\n*)*$'
    );

    global.CardText.forEach((cardText, cardStat) => {
      if (global.CardInClan[cardStat] === 29) {
        return; // if clan is in NoUse.txt or is an Order it most likely has a non-standard text, so we skip it
      }
      expect(cardText).toMatch(textLineRegex);
    });
  });

  it('contains only validly formatted skill conditions', () => {
    const skillConditionRegex = new RegExp(
      '(AUTO|CONT|ACT)( \\[((((Front Row |Back Row )*(Center )*|Additional )RC( in the (left|right) column( of the (front|back) row)*)*|VC|GC|Drop|Deck|Hand|Soul|(Damage|Bind|G|Drop|Trigger|Order) [Zz]one|Ride Deck|Monster BOX)+(\\/|\\])+)+)*( 1\\/(Turn|Fight))*( (Generation|Limit) Break \\d)*( ((' +
        KEYWORD_ABILITY_LIST_REGEX.source +
        ')( [\\dX]+)*|Wave\\-\\d.*))*( \\(.*\\))*: '
    );

    global.CardText.forEach((cardText) => {
      const skillCount = (cardText.match(/(AUTO|CONT|ACT).*:/g) || []).length;
      let cardTextCopy = cardText.slice();
      for (let i = 0; i < skillCount; i++) {
        expect(cardTextCopy).toMatch(skillConditionRegex);
        cardTextCopy = cardTextCopy.replace(skillConditionRegex, '<checked>');
      }
    });
  });

  it('does not contain wrongly capitalized terms', () => {
    global.CardText.forEach((cardText) => {
      expect(cardText).not.toMatch(/Counter blast/);
      expect(cardText).not.toMatch(/Soul blast/);
      expect(cardText).not.toMatch(/Counter charge/);
      expect(cardText).not.toMatch(/Soul charge/);
      expect(cardText).not.toMatch(/[^\]][^ \(]Stand [^A-Zt]/);
      expect(cardText).not.toMatch(/[^\]][^ \[]+Rest[^\w]/);
      expect(cardText).not.toMatch(/Power [^A-Z]/);
      expect(cardText).not.toMatch(/Critical [^A-Zt]/);
      expect(cardText).not.toMatch(/Shield [^A-Zt]/);
      expect(cardText).not.toMatch(/[^\u2022] Grade/);
      expect(cardText).not.toMatch(/OverDress/);
      expect(cardText).not.toMatch(/Rear-guard/);
      expect(cardText).not.toMatch(/Vanguard/);
    });
  });

  it('does not contain excess brackets', () => {
    global.CardText.forEach((cardText) => {
      expect(cardText).not.toMatch(/\[power\]/i);
      expect(cardText).not.toMatch(/\[critical\]/i);
      expect(cardText).not.toMatch(/\[shield\]/i);
      expect(cardText).not.toMatch(/\[stand\]/i);
      expect(cardText).not.toMatch(/\[rest\]/i);
      expect(cardText).not.toMatch(/\(\\d\)/);
      expect(cardText).not.toMatch(/\(VC\)/);
      expect(cardText).not.toMatch(/\(RC\)/);
      expect(cardText).not.toMatch(/\(GC\)/);
      expect(cardText).not.toMatch(/:VC:/);
      expect(cardText).not.toMatch(/:RC:/);
      expect(cardText).not.toMatch(/:GC:/);
      expect(cardText).not.toMatch(/\[(Generation|Limit) Break \d\]/i);
      expect(cardText).not.toMatch(/\[1\/Turn]/i);
    });
  });

  it('contains proper spacing', () => {
    global.CardText.forEach((cardText) => {
      expect(cardText).not.toMatch(/(power|critical|drive|shield|grade)\+/);
      expect(cardText).not.toMatch(/\d\/(power|critical|drive|shield|grade)/);
      expect(cardText).not.toMatch(/  /);
    });
  });
});
