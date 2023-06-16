const { initGlobalCFAScope, requireAllCFAscripts } = require('./utils');

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
