const {
  requireAllCFAscripts,
  initGlobalCFAScope,
  WIN_1251_REGEX,
} = require('./utils');

initGlobalCFAScope();
requireAllCFAscripts();

test('card titles only contain valid Windows-1251 characters', () => {
  global.CardName.forEach((cardName) => {
    expect(cardName).toMatch(WIN_1251_REGEX);
  });
});

test('card texts only contain vaild Windows-1251 characters', () => {
  global.CardText.forEach((cardText) => {
    expect(cardText).toMatch(WIN_1251_REGEX);
  });
});
