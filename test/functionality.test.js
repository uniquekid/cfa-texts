const fs = require('fs');
const { initGlobalCFAScope, requireAllCFAscripts } = require('./util/utils');
const sizeOf = require('image-size');
const { readIniFileSync } = require('read-ini-file');

beforeAll(async () => {
  initGlobalCFAScope();
  await requireAllCFAscripts();
});

describe('Power Value', () => {
  it('is not equal to 0 for most units', () => {
    global.PowerStat.forEach((powerStat, cardStat) => {
      switch (cardStat) {
        case 0:
        case 1:
        case 2: // first three values are unused so we skip
        // cards that actually have 0 power:
        case 5655: // Popping Melody, Layla
        case 7581: // Ditto Deletor, Baon
        case 7704: // Starry Pop Dragon
        case 8502: // Gold Egg
        case 9444: // Original Saver, Zero
          return;
        default:
          if (
            (global.ExtraDeck[cardStat] !== 1 ||
              !global.CardText[cardStat].includes('G guardian')) &&
            global.CardInClan[cardStat] !== 29 &&
            global.CardInClan[cardStat] !== 30 &&
            global.CardInClan2[cardStat] !== 30 &&
            !global.CardReassignedId[cardStat]
          ) {
            // only check non G guardian non Order cards that are visible in deck editor
            expect(powerStat).not.toBeFalsy();
          }
      }
    });
  });
});

describe('Trigger ID', () => {
  it('has a corresponding text entry if present and does not have it if it has no trigger', () => {
    global.TriggerUnit.forEach((triggerUnit, cardStat) => {
      switch (triggerUnit) {
        case 1:
          expect(global.CardText[cardStat]).toMatch(/(^|\/)Draw Trigger/);
          break;
        case 2:
          expect(global.CardText[cardStat]).toMatch(/(^|\/)Critical Trigger/);
          break;
        case 3:
          expect(global.CardText[cardStat]).toMatch(/(^|\/)Stand Trigger/);
          break;
        case 4:
          expect(global.CardText[cardStat]).toMatch(/(^|\/)Heal Trigger/);
          break;
        case 5:
          expect(global.CardText[cardStat]).toMatch(/(^|\/)Front Trigger/);
          break;
        case 6:
          expect(global.CardText[cardStat]).toMatch(/(^|\/)Over Trigger/);
          break;
        default:
          expect(global.CardText[cardStat]).not.toMatch(
            /(^|\/)(Draw|Critical|Stand|Heal|Front|Over) Trigger/
          );
          break;
      }
    });
  });
});

describe('Persona Ride', () => {
  it('is present for all non-Order G3 cards from overDress and is not present for the rest', () => {
    global.PersonaRide.forEach((personaRide, cardStat) => {
      if (
        (global.DCards[cardStat] &&
          global.UnitGrade[cardStat] === 3 &&
          !(
            global.CardInClan[cardStat] === 30 ||
            global.CardInClan2[cardStat] === 30
          )) ||
        cardStat === 10733 // or if Griphogila
      ) {
        expect(personaRide).toBeTruthy();
      } else {
        expect(personaRide).toBeFalsy();
      }
    });
  });
});

describe('Card Restrictions', () => {
  it('has a corresponding text entry if present and does not have it if it has no restriction', () => {
    const cardBanRegex =
      /^\((((V ){0,1}PREMIUM|STANDARD|RETRO) ((JP|EN|TH)( & |:))+ Banned)|This card cannot be used in a deck\.\)$/m;
    const cardRestrictRegex =
      /^\(((V ){0,1}PREMIUM|STANDARD|RETRO) ((JP|EN|TH)( & |:))+ (Restricted (to \d|as FV)|[Yy]ou can only run (\\d of )*this card if you do not have .* in your (deck|G zone))\.\)$/m;

    global.CardBanned.forEach((cardBanned, cardStat) => {
      if (cardBanned) {
        expect(global.CardText[cardStat]).toMatch(cardBanRegex);
      } else {
        expect(global.CardText[cardStat]).not.toMatch(cardBanRegex);
      }
    });

    global.CardLimidet.forEach((cardLimited, cardStat) => {
      if (cardLimited) {
        expect(global.CardText[cardStat]).toMatch(cardRestrictRegex);
      } else {
        expect(global.CardText[cardStat]).not.toMatch(cardRestrictRegex);
      }
    });
  });
});

describe('Gift and Token Generators', () => {
  it('has a corresponding tip if generator is present', () => {
    const tipRegex =
      /^\((Opponent has to )*\Shift\s*\+\s*(click|left mouse button)( from the field)* (to ((call|create|generate|get|activate)( a| the)* ((.* )*token(s)*|((protect|accel|force|dragontree|Treasures)(,| and)* )*(marker|gift)(s)*|persona ride|ticket|monster box|astral plane|crest|this skill)( or | and\/or astral plane)*)+|your vg)\.*\)$/im;

    global.CardText.forEach((cardText, cardStat) => {
      if (cardStat >= 11102 && cardStat <= 11146) {
        return; // skip History Collection cards because most of them don't fit the tip
      }
      if (
        global.ForceAdd[cardStat] === 1 || // for Force
        global.ProtectAdd[cardStat] === 1 || // for Protect
        global.CocoAdd[cardStat] === 1 || // for Protect (legacy)
        global.AccelAdd[cardStat] === 1 || // for Accel
        global.GiftAdd[cardStat] === 1 || // one of each
        global.GiftAddSelect[cardStat] === 1 || // one of any kind
        global.Uranus[cardStat] === 1 || // for Astarl plane
        global.MimicNotEvil[cardStat] === 1 || // for Treasures marker
        global.PersonaRideAct[cardStat] === 1 || // for Activated Persona Ride
        global.Reveal[cardStat] === 1 || // Starhulk, Gicurs and Starhulk, Letaluk
        cardStat === 5791 || // Victorious Deer (hard-coded skill)
        (global.TokenSummoner[cardStat] &&
          global.TokenSummonerPosition[cardStat] === 'SHIFT')
      ) {
        expect(cardText).toMatch(tipRegex);
      } else {
        expect(cardText).not.toMatch(tipRegex);
      }
    });
  });
});

describe('Regalis Piece', () => {
  it('has a corresponding text present if it is marked as regalis piece and has no such text if it is not', () => {
    const regalisPieceRegex =
      /Regalis Piece \(You may only have one Regalis Piece in your deck, and use it a total of one time in a fight\)/gm;

    global.RegalisPiece.forEach((regalisPiece, cardStat) => {
      if (regalisPiece === 1) {
        expect(global.CardText[cardStat]).toMatch(regalisPieceRegex);
      } else {
        expect(global.CardText[cardStat]).not.toMatch(regalisPieceRegex);
      }
    });
  });
});

describe('Card Sprites', () => {
  it('has a corresponding Large Card Sprite for every database entry', () => {
    for (let cardStat = 1; cardStat <= global.AllCard; cardStat++) {
      // skip card images that are missing
      if (
        (cardStat >= 6547 && cardStat <= 6566) ||
        cardStat === 6806 ||
        cardStat === 9167 ||
        cardStat === 9192 ||
        cardStat === 9193
      ) {
        continue;
      }
      // check that image exists
      const filePath = `./CardSprite/n${cardStat}.jpg`;
      expect(fs.existsSync(filePath)).toBeTruthy();
      // get dimensions of a card image
      const dimensions = sizeOf(filePath);
      // skip weird card images
      if (
        cardStat === 435 || // Oracle Guardian, Hermes
        cardStat === 1194 || // Blaster Mameshiba
        cardStat === 10177 // Knight of Calm Harp, Curaaf (Korean WO)
      ) {
        continue;
      }
      // for newer images the width should always be between 298 and 300,
      if (cardStat > 407) {
        expect(dimensions.width).toBeGreaterThanOrEqual(298);
        expect(dimensions.width).toBeLessThanOrEqual(300);
      } else {
        // otherwise check a broader range
        expect(dimensions.width).toBeGreaterThan(294);
        expect(dimensions.width).toBeLessThan(302);
      }
      // height should be in range of 437+/-12px
      expect(dimensions.height).toBeGreaterThanOrEqual(425);
      expect(dimensions.height).toBeLessThanOrEqual(449);
    }
  });

  it('has a corresponding Small Card Sprite for every database entry', () => {
    for (let cardStat = 1; cardStat <= global.AllCard; cardStat++) {
      // skip card images that are missing
      if (
        (cardStat >= 6547 && cardStat <= 6566) ||
        cardStat === 6806 ||
        cardStat === 9167 ||
        cardStat === 9192 ||
        cardStat === 9193
      ) {
        continue;
      }
      // check that image exists
      const filePath = `./CardSpriteMini2/n${cardStat}.jpg`;
      expect(fs.existsSync(filePath)).toBeTruthy();
      // get dimensions of a card image
      const dimensions = sizeOf(filePath);
      // skip weird card images
      if (
        cardStat === 435 || // Oracle Guardian, Hermes
        cardStat === 1194 || // Blaster Mameshiba
        cardStat === 10177 // Knight of Calm Harp, Curaaf (Korean WO)
      ) {
        continue;
      }
      // width should be in range of 75+/-3px
      expect(dimensions.width).toBeGreaterThanOrEqual(72);
      expect(dimensions.width).toBeLessThanOrEqual(78);
      // height should be in range of 109+/-4px
      expect(dimensions.height).toBeGreaterThanOrEqual(105);
      expect(dimensions.height).toBeLessThanOrEqual(113);
    }
  });
});

describe('Sleeve Sprites', () => {
  beforeAll(() => {
    const { Version } = readIniFileSync('./Version.ini');
    global.Version = Version;
  });

  it('has a corresponding Large Sleeve Sprite for every number until max sleeve number', () => {
    for (let i = 0; i <= global.Version.Sleeve; i++) {
      // skip sleeve images that are missing
      if (i === 674) {
        continue;
      }
      // check that image exists
      const filePath = `./Sprite/Sleeves/s${i}.png`;
      expect(fs.existsSync(filePath)).toBeTruthy();
      // get dimensions of a card image
      const dimensions = sizeOf(filePath);
      // width should be in range of 295+/-5px
      expect(dimensions.width).toBeGreaterThanOrEqual(290);
      expect(dimensions.width).toBeLessThanOrEqual(300);
      // height should be in range of 420+/-30px
      expect(dimensions.height).toBeGreaterThanOrEqual(390);
      expect(dimensions.height).toBeLessThanOrEqual(450);
    }
  });

  it('has a corresponding Mini Sleeve Sprite for every number until max sleeve number', () => {
    for (let i = 0; i <= global.Version.Sleeve; i++) {
      // skip sleeve images that are missing
      if (i === 674) {
        continue;
      }
      // check that image exists
      const filePath = `./Sprite/SleevesMini/s${i}.png`;
      expect(fs.existsSync(filePath)).toBeTruthy();
      // get dimensions of a card image
      const dimensions = sizeOf(filePath);
      // width should be in range of 60+/-4px
      expect(dimensions.width).toBeGreaterThanOrEqual(56);
      expect(dimensions.width).toBeLessThanOrEqual(64);
      // height should be in range of 84+/-6px
      expect(dimensions.height).toBeGreaterThanOrEqual(78);
      expect(dimensions.height).toBeLessThanOrEqual(90);
    }
  });

  it('has a corresponding Mini2 Sleeve Sprite for every number until max sleeve number', () => {
    for (let i = 0; i <= global.Version.Sleeve; i++) {
      // skip sleeve images that are missing
      if (i === 674) {
        continue;
      }
      // check that image exists
      const filePath = `./Sprite/SleevesMini2/s${i}.png`;
      expect(fs.existsSync(filePath)).toBeTruthy();
      // get dimensions of a card image
      const dimensions = sizeOf(filePath);
      // width should be in range of 75+/-3px
      expect(dimensions.width).toBeGreaterThanOrEqual(72);
      expect(dimensions.width).toBeLessThanOrEqual(78);
      // height should be in range of 105+/-7px
      expect(dimensions.height).toBeGreaterThanOrEqual(98);
      expect(dimensions.height).toBeLessThanOrEqual(112);
    }
  });
});
