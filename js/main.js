
var runGame = require('./Runners/runGame');
var GAME_LEVELS = require('./Levels/level');
//var DOMDisplay = require('./World/DOMDisplay');
var CanvasDisplay = require('./World/CanvasDisplay');

runGame(GAME_LEVELS, CanvasDisplay);