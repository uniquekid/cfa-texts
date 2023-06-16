const fs = require('fs').promises;
const iconvLite = require('iconv-lite');
const { dirname } = require('path');
const {
  UNIVERSAL_LOWERCASE_WORD_LIST,
  CLAN_AND_NATION_LIST,
  KEYWORD_ABILITY_LIST,
} = require('./dict.js');

function requireCFAscript(scriptName) {
  return fs
    .mkdir(dirname(`./test/script/${scriptName}.js`), {
      recursive: true,
    })
    .then(() => {
      return fs.readFile(`./Text/${scriptName}.txt`);
    })
    .then((content) => {
      const text = iconvLite
        .decode(content, 'win1251')
        .replaceAll("'", '`')
        .replaceAll('{', '')
        .replaceAll('}', '')
        .replaceAll(/, (\d)\]/gm, '][$1]');

      return fs.writeFile(`./test/script/${scriptName}.js`, text);
    })
    .then(() => {
      require(`../script/${scriptName}`);
    });
}

function requireAllCFAscripts() {
  return Promise.all([
    requireCFAscript('Anger Feather'),
    requireCFAscript('Aqua Force'),
    requireCFAscript('Bang Dream'),
    requireCFAscript('Bermuda'),
    requireCFAscript('Brandt Gate'),
    requireCFAscript('Cray Elemental'),
    requireCFAscript('Dark Irregulars'),
    requireCFAscript('Dark States'),
    requireCFAscript('Dimension Police'),
    requireCFAscript('Dragon Empire'),
    requireCFAscript('Etrangers'),
    requireCFAscript('Gear Chronicle'),
    requireCFAscript('Genesis'),
    requireCFAscript('Gold Paladin'),
    requireCFAscript('Granblue'),
    requireCFAscript('Great Nature'),
    requireCFAscript('Kagero'),
    requireCFAscript('Keter Sanctuary'),
    requireCFAscript('Link Joker'),
    requireCFAscript('Lyrical Monasterio'),
    requireCFAscript('Megacolony'),
    requireCFAscript('Monster Strike'),
    requireCFAscript('Murakumo'),
    requireCFAscript('Narukami'),
    requireCFAscript('Neo Nectar'),
    requireCFAscript('NoUse'),
    requireCFAscript('Nova Grappler'),
    requireCFAscript('Nubatama'),
    requireCFAscript('Oracle'),
    requireCFAscript('Order Cards'),
    requireCFAscript('Pale Moon'),
    requireCFAscript('Record of Ragnarok'),
    requireCFAscript('Royal Paladin'),
    requireCFAscript('Shadow Paladin'),
    requireCFAscript('Shaman King'),
    requireCFAscript('Spike Brothers'),
    requireCFAscript('Stoicheia'),
    requireCFAscript('Tachikaze'),
    requireCFAscript('The Mask Collection'),
    requireCFAscript('Touken Ranbu'),
    requireCFAscript('Triggers'),
    requireCFAscript('UnitPower'),
  ]);
}

function initGlobalCFAScope() {
  x = 0;
  CardStat = 0;
  global.PowerStat = [];
  global.DefensePowerStat = [];
  global.CardName = [];
  global.CardText = [];
  global.UnitGrade = [];
  global.CardInClan = [];
  global.CardInClan2 = [];
  global.CardInClan3 = [];
  global.CardInClan4 = [];
  global.CardInClan5 = [];
  global.CardInClan6 = [];
  global.DCards = [];
  global.DCards2 = [];
  global.ExtraDeck = [];
  global.CardLimidet = [];
  global.CanAttackFromBackRow = [];
  global.TriggerUnit = [];
  global.GreenTokenAdd = [];
  global.OrangeTokenAdd = [];
  global.BlueTokenAdd = [];
  global.BlueTokenBoth = [];
  global.QuickShieldAdd = [];
  global.NewTriggerStat = [];
  global.CardBanned = [];
  global.OldCardStat = [];
  global.ProtectAdd = [];
  global.ForceAdd = [];
  global.AccelAdd = [];
  global.GiftAdd = [];
  global.GiftAddSelect = [];
  global.PersonaRide = [];
  global.PersonaRideCardName = [];
  global.ForbidCrossPersonaRideUpon = [];
  global.PersonaRideAct = [];
  global.EnableAttackFromBackRow = [];
  global.DeleteAllExtraInEndPhase = [];
  global.AnotherSide = [];
  global.DontShowInDeckEditor = [];
  global.CardReassignedId = [];
  global.RegalisPiece = [];
  global.AttackFromVBuff = [];
  global.AttackFromRBuff = [];
  global.AttackFromVRBuff = [];
  global.TokenSummoner = [];
  global.TokenSummoner2 = [];
  global.TokenSummoner3 = [];
  global.TokenSummonerPosition = [];
  global.TokenSummonerRodeUponNumber = [];
  global.TokenSummonerQuantity = [];
  global.TokenSummoner2Text = [];
  global.TokenSummoner2Button1 = [];
  global.TokenSummoner2Button2 = [];
  global.TokenSummoner2Button3 = [];
  global.TokenSummonerQuantity = [];
  global.SearchEffect = [];
  global.SearchEffectPosition = [];
  global.SearchEffectLookAtQuantity = [];
  global.SearchEffectMode = [];
  global.SearchEffectArgument1 = [];
  global.SearchEffectArgument2 = [];
  global.SearchEffectArgument3 = [];
  global.ActivateSearchFoundAction = [];
  global.ActivateSearchRestAction = [];
  global.SearchEffectFindQuantity = [];
  global.RemoveFromDrop = [];
  global.Arms = [];
  global.LeftArms = [];
  global.RightArms = [];
  global.ArmAsUnit = [];
  global.Uranus = [];
  global.MimicNotEvil = [];
  global.Reveal = [];
  global.CocoAdd = [];
  global.UnitGradeIncrementInDeck = [];
  global.ToukenCrest = [];
  global.SceneEffect = [];
  global.TriggerPowerUpEffect = [];
  global.TriggerPowerUpEffect[7046] = [];
  global.TriggerPowerUpEffect[7049] = [];
  global.TriggerPowerUpEffect[7085] = [];
  global.TriggerPowerUpEffect[7963] = [];
  global.ExtendedTextBox = [];
}

const WIN_1251_REGEX =
  /^[\n !"#$%&()*+,\-\./0-9:;<=>?@A-Z\[\\\]\^_`a-z\{|\}~\u0402\u0403\u201A\u0453\u201E\u2026\u2020\u2021\u20AC\u2030\u0409\u2039\u040A\u040C\u040B\u040F\u0452\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u2122\u0459\u203A\u045A\u045C\u045B\u045F\u040E\u045E\u0408\u00A4\u0490\u00A6\u00A7\u0401\u00A9\u0404\u00AB\u00AC\u00AD\u00AE\u0407\u00B0\u00B1\u0406\u0456\u0491\u00B5\u00B6\u00B7\u0451\u2116\u0454\u00BB\u0458\u0405\u0455\u0457\u0410-\u042F\u0430-\u044F]*$/gm;

const UNIVERSAL_LOWERCASE_WORDS_REGEX = new RegExp(
  UNIVERSAL_LOWERCASE_WORD_LIST.join('|').replace(/[.*+?^${}()[\]\\]/g, '\\$&')
);

const CLAN_AND_NATION_LIST_REGEX = new RegExp(CLAN_AND_NATION_LIST.join('|'));

const KEYWORD_ABILITY_LIST_REGEX = new RegExp(KEYWORD_ABILITY_LIST.join('|'));

module.exports = {
  requireCFAscript,
  requireAllCFAscripts,
  initGlobalCFAScope,
  WIN_1251_REGEX,
  UNIVERSAL_LOWERCASE_WORDS_REGEX,
  CLAN_AND_NATION_LIST_REGEX,
  KEYWORD_ABILITY_LIST_REGEX,
};
