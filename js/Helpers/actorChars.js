var Player = require('../Entity/Player');
var Coin = require('../Entity/Coin');
var Lava = require('../Entity/Lava');
console.log(Lava);

var actorChars = {
  '@': Player,
  'o': Coin,
  '=': Lava, '|': Lava, 'v': Lava
};
module.exports = actorChars;