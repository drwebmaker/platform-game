
var runGame = require('./Runners/runGame');
var GAME_LEVELS = require('./Levels/level');
var DOMDisplay = require('./World/DOMDisplay');

runGame(GAME_LEVELS, DOMDisplay);