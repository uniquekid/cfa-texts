const fs = require('fs');
const iconvLite = require('iconv-lite');
const { dirname } = require('path');
const requireFromString = require('require-from-string');

x = 0;
CardStat = 0;
global.PowerStat = [];
global.DefensePowerStat = [];
global.CardName = [];
global.CardText = [];

const content = fs.readFileSync(require.resolve('../Text/Anger Feather.txt'));
const text = iconvLite
  .decode(content, 'win1252')
  .replaceAll("'", '`')
  .replaceAll('{', '')
  .replaceAll('}', '');

function writeFileSync(path, contents, cb) {
  fs.mkdirSync(dirname(path), { recursive: true }, function (err) {
    if (err) return cb(err);

    fs.writeFileSync(path, contents, cb);
  });
}

writeFileSync('./scripts/Anger Feather.js', text);

require('./scripts/Anger Feather');

// requireFromString(text);
