(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Vector = require('../World/Vector');

function Coin(pos) {
  this.basePos = this.pos = pos.plus(new Vector(0.2, 0.1));
  this.size = new Vector(0.6, 0.6);
  this.wobble = Math.random() * Math.PI * 2;
}
Coin.prototype.type = 'coin';

var wobbleSpeed = 8, wobbleDist = 0.07;

Coin.prototype.act = function(step) {
  this.wobble += step * wobbleSpeed;
  var wobblePos = Math.sin(this.wobble) * wobbleDist;
  this.pos = this.basePos.plus(new Vector(0, wobblePos));
};

module.exports = Coin;
},{"../World/Vector":14}],2:[function(require,module,exports){
var Vector = require('../World/Vector');
var Level = require('../World/Level');

function Lava(pos, ch) {
  this.pos = pos;
  this.size = new Vector(1, 1);
  if (ch == '=') {
    this.speed = new Vector(2, 0);
  } else if (ch == '|') {
    this.speed = new Vector(0, 2);
  } else if (ch == 'v') {
    this.speed = new Vector(0, 3);
    this.repeatPos = pos;
  }
}
Lava.prototype.type = 'lava';

Lava.prototype.act = function(step, level) {
  var newPos = this.pos.plus(this.speed.times(step));
  if (!level.obstacleAt(newPos, this.size))
    this.pos = newPos;
  else if (this.repeatPos)
    this.pos = this.repeatPos;
  else
    this.speed = this.speed.times(-1);
};

module.exports = Lava;
},{"../World/Level":13,"../World/Vector":14}],3:[function(require,module,exports){
var Vector = require('../World/Vector');
var Level = require('../World/Level');

function Player(pos) {
  this.pos = pos.plus(new Vector(0, -0.5));
  this.size = new Vector(0.8, 1.5);
  this.speed = new Vector(0, 0);
}
Player.prototype.type = 'player';

var playerXSpeed = 7;

Player.prototype.moveX = function(step, level, keys) {
  this.speed.x = 0;
  if (keys.left) this.speed.x -= playerXSpeed;
  if (keys.right) this.speed.x += playerXSpeed;

  var motion = new Vector(this.speed.x * step, 0);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle)
    level.playerTouched(obstacle);
  else
    this.pos = newPos;
};

var gravity = 30;
var jumpSpeed = 17;

Player.prototype.moveY = function(step, level, keys) {
  this.speed.y += step * gravity;
  var motion = new Vector(0, this.speed.y * step);
  var newPos = this.pos.plus(motion);
  var obstacle = level.obstacleAt(newPos, this.size);
  if (obstacle) {
    level.playerTouched(obstacle);
    if (keys.up && this.speed.y > 0)
      this.speed.y = -jumpSpeed;
    else
      this.speed.y = 0;
  } else {
    this.pos = newPos;
  }
};

Player.prototype.act = function(step, level, keys) {
  this.moveX(step, level, keys);
  this.moveY(step, level, keys);

  var otherActor = level.actorAt(this);
  if (otherActor)
    level.playerTouched(otherActor.type, otherActor);

  // Losing animation
  if (level.status == 'lost') {
    this.pos.y += step;
    this.size.y -= step;
  }
};

module.exports = Player;
},{"../World/Level":13,"../World/Vector":14}],4:[function(require,module,exports){
var Player = require('../Entity/Player');
var Coin = require('../Entity/Coin');
var Lava = require('../Entity/Lava');

var actorChars = {
  '@': Player,
  'o': Coin,
  '=': Lava, '|': Lava, 'v': Lava
};

module.exports = actorChars;
},{"../Entity/Coin":1,"../Entity/Lava":2,"../Entity/Player":3}],5:[function(require,module,exports){
var arrowCodes = {37: 'left', 38: 'up', 39: 'right'};

module.exports = arrowCodes;
},{}],6:[function(require,module,exports){
function elt(name, className) {
  var elt = document.createElement(name);
  if (className) elt.className = className;
  return elt;
}

module.exports = elt;
},{}],7:[function(require,module,exports){
function trackKeys(codes) {
  var pressed = Object.create(null);
  function handler(event) {
    if (codes.hasOwnProperty(event.keyCode)) {
      var down = event.type == 'keydown';
      pressed[codes[event.keyCode]] = down;
      event.preventDefault();
    }
  }
  addEventListener('keydown', handler);
  addEventListener('keyup', handler);
  return pressed;
}

module.exports = trackKeys;
},{}],8:[function(require,module,exports){
var GAME_LEVELS = [[
  '                      ',
  '                      ',
  '  x              = x  ',
  '  x         o o    x  ',
  '  x @      xxxxx   x  ',
  '  xxxxx            x  ',
  '      x!!!!!!!!!!!!x  ',
  '      xxxxxxxxxxxxxx  ',
  '                      '
],  [
  '                                   ',
  '                                   ',
  '  x =            =  x              ',
  '  x          o o    x!             ',
  '  x @   xx   xxxxx!!!xv            ',
  '  xxxxx            x     o o x!!x  ',
  '      x!!!!!!!!!!!!x!!xxxxxxxxxxx  ',
  '      xxxxxxxxxxxxxxxx             ',
  '                                   '
]];

module.exports = GAME_LEVELS;
},{}],9:[function(require,module,exports){
function runAnimation(frameFunc) {
  var lastTime = null;
  function frame(time) {
    var stop = false;
    if (lastTime != null) {
      var timeStep = Math.min(time - lastTime, 100) / 1000;
      stop = frameFunc(timeStep) === false;
    }
    lastTime = time;
    if (!stop)
      requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

module.exports = runAnimation;
},{}],10:[function(require,module,exports){
var Level = require('../World/Level');
var runLevel = require('./runLevel');
var elt = require('../Helpers/elt');

function runGame(plans, Display) {
  var lives  = 3;
  function startLevel(n) {
    if (lives > 0) {
      runLevel(new Level(plans[n]), Display, function (status) {
        if (status == 'lost')
          startLevel(n);
        else if (n < plans.length - 1)
          startLevel(n + 1);
        else {
          var youWin = document.body.appendChild(elt('div', 'game-over')).appendChild(elt('div', 'tableBlock'));
          var text = document.createTextNode('YOU WIN');
          youWin.appendChild(text);
        }
      });
      lives--;
    } else {
      var youLost = document.body.appendChild(elt('div', 'game-over')).appendChild(elt('div', 'tableBlock'));
      var text = document.createTextNode('GAME OVER');
      youLost.appendChild(text);
    }
  }
  startLevel(0);
}

module.exports = runGame;
},{"../Helpers/elt":6,"../World/Level":13,"./runLevel":11}],11:[function(require,module,exports){
var runAnimation = require('./runAnimation');
var trackKeys = require('../Helpers/trackKeys');
var arrowCodes = require('../Helpers/arrowCodes');
var Level = require('../World/Level');

function runLevel(level, Display, andThen) {
  var display = new Display(document.body, level);
  var running = "yes";
  function handleKey(event) {
    if (event.keyCode == 27) {
      if (running == "no") {
        running = "yes";
        runAnimation(animation);
      } else if (running == "pausing") {
        running = "yes";
      } else if (running == "yes") {
        running = "pausing";
      }
    }
  }
  addEventListener("keydown", handleKey);
  var arrows = trackKeys(arrowCodes);
  function animation(step) {
    if (running == "pausing") {
      running = "no";
      return false;
    }
    level.animate(step, arrows);
    display.drawFrame(step);
    if (level.isFinished()) {
      display.clear();
      removeEventListener("keydown", handleKey);

      if (andThen)
        andThen(level.status);
      return false;
    }
  }
  runAnimation(animation);
}

module.exports = runLevel;
},{"../Helpers/arrowCodes":5,"../Helpers/trackKeys":7,"../World/Level":13,"./runAnimation":9}],12:[function(require,module,exports){
var elt = require('../Helpers/elt');

function DOMDisplay(parent, level) {
  this.wrap = parent.appendChild(elt('div', 'game'));
  this.level = level;

  this.wrap.appendChild(this.drawBackground());
  this.actorLayer = null;
  this.drawFrame();
}

var scale = 20;

DOMDisplay.prototype.drawBackground = function() {
  var table = elt('table', 'background');
  table.style.width = this.level.width * scale + 'px';
  this.level.grid.forEach(function(row) {
    var rowElt = table.appendChild(elt('tr'));
    rowElt.style.height = scale + 'px';
    row.forEach(function(type) {
      rowElt.appendChild(elt('td', type));
    });
  });
  return table;
};

DOMDisplay.prototype.drawActors = function() {
  var wrap = elt('div');
  this.level.actors.forEach(function(actor) {
    var rect = wrap.appendChild(elt('div',
      'actor ' + actor.type));
    rect.style.width = actor.size.x * scale + 'px';
    rect.style.height = actor.size.y * scale + 'px';
    rect.style.left = actor.pos.x * scale + 'px';
    rect.style.top = actor.pos.y * scale + 'px';
  });
  return wrap;
};

DOMDisplay.prototype.drawFrame = function() {
  if (this.actorLayer)
    this.wrap.removeChild(this.actorLayer);
  this.actorLayer = this.wrap.appendChild(this.drawActors());
  this.wrap.className = 'game ' + (this.level.status || '');
  this.scrollPlayerIntoView();
};

DOMDisplay.prototype.scrollPlayerIntoView = function() {
  var width = this.wrap.clientWidth;
  var height = this.wrap.clientHeight;
  var margin = width / 3;

  // The viewport
  var left = this.wrap.scrollLeft, right = left + width;
  var top = this.wrap.scrollTop, bottom = top + height;

  var player = this.level.player;
  var center = player.pos.plus(player.size.times(0.5))
    .times(scale);

  if (center.x < left + margin)
    this.wrap.scrollLeft = center.x - margin;
  else if (center.x > right - margin)
    this.wrap.scrollLeft = center.x + margin - width;
  if (center.y < top + margin)
    this.wrap.scrollTop = center.y - margin;
  else if (center.y > bottom - margin)
    this.wrap.scrollTop = center.y + margin - height;
};

DOMDisplay.prototype.clear = function() {
  this.wrap.parentNode.removeChild(this.wrap);
};

module.exports = DOMDisplay;
},{"../Helpers/elt":6}],13:[function(require,module,exports){
var actorChars = require('../Helpers/actorChars.js');
var Vector = require('./Vector');

function Level(plan) {
  this.width = plan[0].length;
  this.height = plan.length;
  this.grid = [];
  this.actors = [];

  for (var y = 0; y < this.height; y++) {
    var line = plan[y], gridLine = [];
    for (var x = 0; x < this.width; x++) {
      var ch = line[x], fieldType = null;
      var Actor = actorChars[ch];
      if (Actor) {
        this.actors.push(new Actor(new Vector(x, y), ch));
      } else if (ch == 'x') {
        fieldType = 'wall';
      } else if (ch == '!') {
        fieldType = 'lava';
      }
      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }

  this.player = this.actors.filter(function(actor) {
    return actor.type == 'player';
  })[0];
  this.status = this.finishDelay = null;
}

Level.prototype.isFinished = function() {
  return this.status != null && this.finishDelay < 0;
};


Level.prototype.obstacleAt = function(pos, size) {
  var xStart = Math.floor(pos.x);
  var xEnd = Math.ceil(pos.x + size.x);
  var yStart = Math.floor(pos.y);
  var yEnd = Math.ceil(pos.y + size.y);

  if (xStart < 0 || xEnd > this.width || yStart < 0)
    return 'wall';
  if (yEnd > this.height)
    return 'lava';
  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var fieldType = this.grid[y][x];
      if (fieldType) return fieldType;
    }
  }
};

Level.prototype.actorAt = function(actor) {
  for (var i = 0; i < this.actors.length; i++) {
    var other = this.actors[i];
    if (other != actor &&
      actor.pos.x + actor.size.x > other.pos.x &&
      actor.pos.x < other.pos.x + other.size.x &&
      actor.pos.y + actor.size.y > other.pos.y &&
      actor.pos.y < other.pos.y + other.size.y)
      return other;
  }
};

var maxStep = 0.05;

Level.prototype.animate = function(step, keys) {
  if (this.status != null)
    this.finishDelay -= step;

  while (step > 0) {
    var thisStep = Math.min(step, maxStep);
    this.actors.forEach(function(actor) {
      actor.act(thisStep, this, keys);
    }, this);
    step -= thisStep;
  }
};

Level.prototype.playerTouched = function(type, actor) {
  if (type == 'lava' && this.status == null) {
    this.status = 'lost';
    this.finishDelay = 1;
  } else if (type == 'coin') {
    this.actors = this.actors.filter(function(other) {
      return other != actor;
    });
    if (!this.actors.some(function(actor) {
        return actor.type == 'coin';
      })) {
      this.status = 'won';
      this.finishDelay = 1;
    }
  }
};

module.exports = Level;
},{"../Helpers/actorChars.js":4,"./Vector":14}],14:[function(require,module,exports){
function Vector(x, y) {
  this.x = x; this.y = y;
}
Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
};

module.exports = Vector;
},{}],15:[function(require,module,exports){

var runGame = require('./Runners/runGame');
var GAME_LEVELS = require('./Levels/level');
var DOMDisplay = require('./World/DOMDisplay');

runGame(GAME_LEVELS, DOMDisplay);
},{"./Levels/level":8,"./Runners/runGame":10,"./World/DOMDisplay":12}]},{},[15])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9FbnRpdHkvQ29pbi5qcyIsImpzL0VudGl0eS9MYXZhLmpzIiwianMvRW50aXR5L1BsYXllci5qcyIsImpzL0hlbHBlcnMvYWN0b3JDaGFycy5qcyIsImpzL0hlbHBlcnMvYXJyb3dDb2Rlcy5qcyIsImpzL0hlbHBlcnMvZWx0LmpzIiwianMvSGVscGVycy90cmFja0tleXMuanMiLCJqcy9MZXZlbHMvbGV2ZWwuanMiLCJqcy9SdW5uZXJzL3J1bkFuaW1hdGlvbi5qcyIsImpzL1J1bm5lcnMvcnVuR2FtZS5qcyIsImpzL1J1bm5lcnMvcnVuTGV2ZWwuanMiLCJqcy9Xb3JsZC9ET01EaXNwbGF5LmpzIiwianMvV29ybGQvTGV2ZWwuanMiLCJqcy9Xb3JsZC9WZWN0b3IuanMiLCJqcy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFZlY3RvciA9IHJlcXVpcmUoJy4uL1dvcmxkL1ZlY3RvcicpO1xyXG5cclxuZnVuY3Rpb24gQ29pbihwb3MpIHtcclxuICB0aGlzLmJhc2VQb3MgPSB0aGlzLnBvcyA9IHBvcy5wbHVzKG5ldyBWZWN0b3IoMC4yLCAwLjEpKTtcclxuICB0aGlzLnNpemUgPSBuZXcgVmVjdG9yKDAuNiwgMC42KTtcclxuICB0aGlzLndvYmJsZSA9IE1hdGgucmFuZG9tKCkgKiBNYXRoLlBJICogMjtcclxufVxyXG5Db2luLnByb3RvdHlwZS50eXBlID0gJ2NvaW4nO1xyXG5cclxudmFyIHdvYmJsZVNwZWVkID0gOCwgd29iYmxlRGlzdCA9IDAuMDc7XHJcblxyXG5Db2luLnByb3RvdHlwZS5hY3QgPSBmdW5jdGlvbihzdGVwKSB7XHJcbiAgdGhpcy53b2JibGUgKz0gc3RlcCAqIHdvYmJsZVNwZWVkO1xyXG4gIHZhciB3b2JibGVQb3MgPSBNYXRoLnNpbih0aGlzLndvYmJsZSkgKiB3b2JibGVEaXN0O1xyXG4gIHRoaXMucG9zID0gdGhpcy5iYXNlUG9zLnBsdXMobmV3IFZlY3RvcigwLCB3b2JibGVQb3MpKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29pbjsiLCJ2YXIgVmVjdG9yID0gcmVxdWlyZSgnLi4vV29ybGQvVmVjdG9yJyk7XHJcbnZhciBMZXZlbCA9IHJlcXVpcmUoJy4uL1dvcmxkL0xldmVsJyk7XHJcblxyXG5mdW5jdGlvbiBMYXZhKHBvcywgY2gpIHtcclxuICB0aGlzLnBvcyA9IHBvcztcclxuICB0aGlzLnNpemUgPSBuZXcgVmVjdG9yKDEsIDEpO1xyXG4gIGlmIChjaCA9PSAnPScpIHtcclxuICAgIHRoaXMuc3BlZWQgPSBuZXcgVmVjdG9yKDIsIDApO1xyXG4gIH0gZWxzZSBpZiAoY2ggPT0gJ3wnKSB7XHJcbiAgICB0aGlzLnNwZWVkID0gbmV3IFZlY3RvcigwLCAyKTtcclxuICB9IGVsc2UgaWYgKGNoID09ICd2Jykge1xyXG4gICAgdGhpcy5zcGVlZCA9IG5ldyBWZWN0b3IoMCwgMyk7XHJcbiAgICB0aGlzLnJlcGVhdFBvcyA9IHBvcztcclxuICB9XHJcbn1cclxuTGF2YS5wcm90b3R5cGUudHlwZSA9ICdsYXZhJztcclxuXHJcbkxhdmEucHJvdG90eXBlLmFjdCA9IGZ1bmN0aW9uKHN0ZXAsIGxldmVsKSB7XHJcbiAgdmFyIG5ld1BvcyA9IHRoaXMucG9zLnBsdXModGhpcy5zcGVlZC50aW1lcyhzdGVwKSk7XHJcbiAgaWYgKCFsZXZlbC5vYnN0YWNsZUF0KG5ld1BvcywgdGhpcy5zaXplKSlcclxuICAgIHRoaXMucG9zID0gbmV3UG9zO1xyXG4gIGVsc2UgaWYgKHRoaXMucmVwZWF0UG9zKVxyXG4gICAgdGhpcy5wb3MgPSB0aGlzLnJlcGVhdFBvcztcclxuICBlbHNlXHJcbiAgICB0aGlzLnNwZWVkID0gdGhpcy5zcGVlZC50aW1lcygtMSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExhdmE7IiwidmFyIFZlY3RvciA9IHJlcXVpcmUoJy4uL1dvcmxkL1ZlY3RvcicpO1xyXG52YXIgTGV2ZWwgPSByZXF1aXJlKCcuLi9Xb3JsZC9MZXZlbCcpO1xyXG5cclxuZnVuY3Rpb24gUGxheWVyKHBvcykge1xyXG4gIHRoaXMucG9zID0gcG9zLnBsdXMobmV3IFZlY3RvcigwLCAtMC41KSk7XHJcbiAgdGhpcy5zaXplID0gbmV3IFZlY3RvcigwLjgsIDEuNSk7XHJcbiAgdGhpcy5zcGVlZCA9IG5ldyBWZWN0b3IoMCwgMCk7XHJcbn1cclxuUGxheWVyLnByb3RvdHlwZS50eXBlID0gJ3BsYXllcic7XHJcblxyXG52YXIgcGxheWVyWFNwZWVkID0gNztcclxuXHJcblBsYXllci5wcm90b3R5cGUubW92ZVggPSBmdW5jdGlvbihzdGVwLCBsZXZlbCwga2V5cykge1xyXG4gIHRoaXMuc3BlZWQueCA9IDA7XHJcbiAgaWYgKGtleXMubGVmdCkgdGhpcy5zcGVlZC54IC09IHBsYXllclhTcGVlZDtcclxuICBpZiAoa2V5cy5yaWdodCkgdGhpcy5zcGVlZC54ICs9IHBsYXllclhTcGVlZDtcclxuXHJcbiAgdmFyIG1vdGlvbiA9IG5ldyBWZWN0b3IodGhpcy5zcGVlZC54ICogc3RlcCwgMCk7XHJcbiAgdmFyIG5ld1BvcyA9IHRoaXMucG9zLnBsdXMobW90aW9uKTtcclxuICB2YXIgb2JzdGFjbGUgPSBsZXZlbC5vYnN0YWNsZUF0KG5ld1BvcywgdGhpcy5zaXplKTtcclxuICBpZiAob2JzdGFjbGUpXHJcbiAgICBsZXZlbC5wbGF5ZXJUb3VjaGVkKG9ic3RhY2xlKTtcclxuICBlbHNlXHJcbiAgICB0aGlzLnBvcyA9IG5ld1BvcztcclxufTtcclxuXHJcbnZhciBncmF2aXR5ID0gMzA7XHJcbnZhciBqdW1wU3BlZWQgPSAxNztcclxuXHJcblBsYXllci5wcm90b3R5cGUubW92ZVkgPSBmdW5jdGlvbihzdGVwLCBsZXZlbCwga2V5cykge1xyXG4gIHRoaXMuc3BlZWQueSArPSBzdGVwICogZ3Jhdml0eTtcclxuICB2YXIgbW90aW9uID0gbmV3IFZlY3RvcigwLCB0aGlzLnNwZWVkLnkgKiBzdGVwKTtcclxuICB2YXIgbmV3UG9zID0gdGhpcy5wb3MucGx1cyhtb3Rpb24pO1xyXG4gIHZhciBvYnN0YWNsZSA9IGxldmVsLm9ic3RhY2xlQXQobmV3UG9zLCB0aGlzLnNpemUpO1xyXG4gIGlmIChvYnN0YWNsZSkge1xyXG4gICAgbGV2ZWwucGxheWVyVG91Y2hlZChvYnN0YWNsZSk7XHJcbiAgICBpZiAoa2V5cy51cCAmJiB0aGlzLnNwZWVkLnkgPiAwKVxyXG4gICAgICB0aGlzLnNwZWVkLnkgPSAtanVtcFNwZWVkO1xyXG4gICAgZWxzZVxyXG4gICAgICB0aGlzLnNwZWVkLnkgPSAwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnBvcyA9IG5ld1BvcztcclxuICB9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmFjdCA9IGZ1bmN0aW9uKHN0ZXAsIGxldmVsLCBrZXlzKSB7XHJcbiAgdGhpcy5tb3ZlWChzdGVwLCBsZXZlbCwga2V5cyk7XHJcbiAgdGhpcy5tb3ZlWShzdGVwLCBsZXZlbCwga2V5cyk7XHJcblxyXG4gIHZhciBvdGhlckFjdG9yID0gbGV2ZWwuYWN0b3JBdCh0aGlzKTtcclxuICBpZiAob3RoZXJBY3RvcilcclxuICAgIGxldmVsLnBsYXllclRvdWNoZWQob3RoZXJBY3Rvci50eXBlLCBvdGhlckFjdG9yKTtcclxuXHJcbiAgLy8gTG9zaW5nIGFuaW1hdGlvblxyXG4gIGlmIChsZXZlbC5zdGF0dXMgPT0gJ2xvc3QnKSB7XHJcbiAgICB0aGlzLnBvcy55ICs9IHN0ZXA7XHJcbiAgICB0aGlzLnNpemUueSAtPSBzdGVwO1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyOyIsInZhciBQbGF5ZXIgPSByZXF1aXJlKCcuLi9FbnRpdHkvUGxheWVyJyk7XHJcbnZhciBDb2luID0gcmVxdWlyZSgnLi4vRW50aXR5L0NvaW4nKTtcclxudmFyIExhdmEgPSByZXF1aXJlKCcuLi9FbnRpdHkvTGF2YScpO1xyXG5cclxudmFyIGFjdG9yQ2hhcnMgPSB7XHJcbiAgJ0AnOiBQbGF5ZXIsXHJcbiAgJ28nOiBDb2luLFxyXG4gICc9JzogTGF2YSwgJ3wnOiBMYXZhLCAndic6IExhdmFcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYWN0b3JDaGFyczsiLCJ2YXIgYXJyb3dDb2RlcyA9IHszNzogJ2xlZnQnLCAzODogJ3VwJywgMzk6ICdyaWdodCd9O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBhcnJvd0NvZGVzOyIsImZ1bmN0aW9uIGVsdChuYW1lLCBjbGFzc05hbWUpIHtcclxuICB2YXIgZWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKTtcclxuICBpZiAoY2xhc3NOYW1lKSBlbHQuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xyXG4gIHJldHVybiBlbHQ7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZWx0OyIsImZ1bmN0aW9uIHRyYWNrS2V5cyhjb2Rlcykge1xyXG4gIHZhciBwcmVzc2VkID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICBmdW5jdGlvbiBoYW5kbGVyKGV2ZW50KSB7XHJcbiAgICBpZiAoY29kZXMuaGFzT3duUHJvcGVydHkoZXZlbnQua2V5Q29kZSkpIHtcclxuICAgICAgdmFyIGRvd24gPSBldmVudC50eXBlID09ICdrZXlkb3duJztcclxuICAgICAgcHJlc3NlZFtjb2Rlc1tldmVudC5rZXlDb2RlXV0gPSBkb3duO1xyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuICBhZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlcik7XHJcbiAgYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBoYW5kbGVyKTtcclxuICByZXR1cm4gcHJlc3NlZDtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0cmFja0tleXM7IiwidmFyIEdBTUVfTEVWRUxTID0gW1tcclxuICAnICAgICAgICAgICAgICAgICAgICAgICcsXHJcbiAgJyAgICAgICAgICAgICAgICAgICAgICAnLFxyXG4gICcgIHggICAgICAgICAgICAgID0geCAgJyxcclxuICAnICB4ICAgICAgICAgbyBvICAgIHggICcsXHJcbiAgJyAgeCBAICAgICAgeHh4eHggICB4ICAnLFxyXG4gICcgIHh4eHh4ICAgICAgICAgICAgeCAgJyxcclxuICAnICAgICAgeCEhISEhISEhISEhIXggICcsXHJcbiAgJyAgICAgIHh4eHh4eHh4eHh4eHh4ICAnLFxyXG4gICcgICAgICAgICAgICAgICAgICAgICAgJ1xyXG5dLCAgW1xyXG4gICcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICcsXHJcbiAgJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJyxcclxuICAnICB4ID0gICAgICAgICAgICA9ICB4ICAgICAgICAgICAgICAnLFxyXG4gICcgIHggICAgICAgICAgbyBvICAgIHghICAgICAgICAgICAgICcsXHJcbiAgJyAgeCBAICAgeHggICB4eHh4eCEhIXh2ICAgICAgICAgICAgJyxcclxuICAnICB4eHh4eCAgICAgICAgICAgIHggICAgIG8gbyB4ISF4ICAnLFxyXG4gICcgICAgICB4ISEhISEhISEhISEheCEheHh4eHh4eHh4eHggICcsXHJcbiAgJyAgICAgIHh4eHh4eHh4eHh4eHh4eHggICAgICAgICAgICAgJyxcclxuICAnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnXHJcbl1dO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBHQU1FX0xFVkVMUzsiLCJmdW5jdGlvbiBydW5BbmltYXRpb24oZnJhbWVGdW5jKSB7XHJcbiAgdmFyIGxhc3RUaW1lID0gbnVsbDtcclxuICBmdW5jdGlvbiBmcmFtZSh0aW1lKSB7XHJcbiAgICB2YXIgc3RvcCA9IGZhbHNlO1xyXG4gICAgaWYgKGxhc3RUaW1lICE9IG51bGwpIHtcclxuICAgICAgdmFyIHRpbWVTdGVwID0gTWF0aC5taW4odGltZSAtIGxhc3RUaW1lLCAxMDApIC8gMTAwMDtcclxuICAgICAgc3RvcCA9IGZyYW1lRnVuYyh0aW1lU3RlcCkgPT09IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgbGFzdFRpbWUgPSB0aW1lO1xyXG4gICAgaWYgKCFzdG9wKVxyXG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xyXG4gIH1cclxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJ1bkFuaW1hdGlvbjsiLCJ2YXIgTGV2ZWwgPSByZXF1aXJlKCcuLi9Xb3JsZC9MZXZlbCcpO1xyXG52YXIgcnVuTGV2ZWwgPSByZXF1aXJlKCcuL3J1bkxldmVsJyk7XHJcbnZhciBlbHQgPSByZXF1aXJlKCcuLi9IZWxwZXJzL2VsdCcpO1xyXG5cclxuZnVuY3Rpb24gcnVuR2FtZShwbGFucywgRGlzcGxheSkge1xyXG4gIHZhciBsaXZlcyAgPSAzO1xyXG4gIGZ1bmN0aW9uIHN0YXJ0TGV2ZWwobikge1xyXG4gICAgaWYgKGxpdmVzID4gMCkge1xyXG4gICAgICBydW5MZXZlbChuZXcgTGV2ZWwocGxhbnNbbl0pLCBEaXNwbGF5LCBmdW5jdGlvbiAoc3RhdHVzKSB7XHJcbiAgICAgICAgaWYgKHN0YXR1cyA9PSAnbG9zdCcpXHJcbiAgICAgICAgICBzdGFydExldmVsKG4pO1xyXG4gICAgICAgIGVsc2UgaWYgKG4gPCBwbGFucy5sZW5ndGggLSAxKVxyXG4gICAgICAgICAgc3RhcnRMZXZlbChuICsgMSk7XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICB2YXIgeW91V2luID0gZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChlbHQoJ2RpdicsICdnYW1lLW92ZXInKSkuYXBwZW5kQ2hpbGQoZWx0KCdkaXYnLCAndGFibGVCbG9jaycpKTtcclxuICAgICAgICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ1lPVSBXSU4nKTtcclxuICAgICAgICAgIHlvdVdpbi5hcHBlbmRDaGlsZCh0ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgICBsaXZlcy0tO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFyIHlvdUxvc3QgPSBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsdCgnZGl2JywgJ2dhbWUtb3ZlcicpKS5hcHBlbmRDaGlsZChlbHQoJ2RpdicsICd0YWJsZUJsb2NrJykpO1xyXG4gICAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdHQU1FIE9WRVInKTtcclxuICAgICAgeW91TG9zdC5hcHBlbmRDaGlsZCh0ZXh0KTtcclxuICAgIH1cclxuICB9XHJcbiAgc3RhcnRMZXZlbCgwKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBydW5HYW1lOyIsInZhciBydW5BbmltYXRpb24gPSByZXF1aXJlKCcuL3J1bkFuaW1hdGlvbicpO1xyXG52YXIgdHJhY2tLZXlzID0gcmVxdWlyZSgnLi4vSGVscGVycy90cmFja0tleXMnKTtcclxudmFyIGFycm93Q29kZXMgPSByZXF1aXJlKCcuLi9IZWxwZXJzL2Fycm93Q29kZXMnKTtcclxudmFyIExldmVsID0gcmVxdWlyZSgnLi4vV29ybGQvTGV2ZWwnKTtcclxuXHJcbmZ1bmN0aW9uIHJ1bkxldmVsKGxldmVsLCBEaXNwbGF5LCBhbmRUaGVuKSB7XHJcbiAgdmFyIGRpc3BsYXkgPSBuZXcgRGlzcGxheShkb2N1bWVudC5ib2R5LCBsZXZlbCk7XHJcbiAgdmFyIHJ1bm5pbmcgPSBcInllc1wiO1xyXG4gIGZ1bmN0aW9uIGhhbmRsZUtleShldmVudCkge1xyXG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT0gMjcpIHtcclxuICAgICAgaWYgKHJ1bm5pbmcgPT0gXCJub1wiKSB7XHJcbiAgICAgICAgcnVubmluZyA9IFwieWVzXCI7XHJcbiAgICAgICAgcnVuQW5pbWF0aW9uKGFuaW1hdGlvbik7XHJcbiAgICAgIH0gZWxzZSBpZiAocnVubmluZyA9PSBcInBhdXNpbmdcIikge1xyXG4gICAgICAgIHJ1bm5pbmcgPSBcInllc1wiO1xyXG4gICAgICB9IGVsc2UgaWYgKHJ1bm5pbmcgPT0gXCJ5ZXNcIikge1xyXG4gICAgICAgIHJ1bm5pbmcgPSBcInBhdXNpbmdcIjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICBhZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVLZXkpO1xyXG4gIHZhciBhcnJvd3MgPSB0cmFja0tleXMoYXJyb3dDb2Rlcyk7XHJcbiAgZnVuY3Rpb24gYW5pbWF0aW9uKHN0ZXApIHtcclxuICAgIGlmIChydW5uaW5nID09IFwicGF1c2luZ1wiKSB7XHJcbiAgICAgIHJ1bm5pbmcgPSBcIm5vXCI7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIGxldmVsLmFuaW1hdGUoc3RlcCwgYXJyb3dzKTtcclxuICAgIGRpc3BsYXkuZHJhd0ZyYW1lKHN0ZXApO1xyXG4gICAgaWYgKGxldmVsLmlzRmluaXNoZWQoKSkge1xyXG4gICAgICBkaXNwbGF5LmNsZWFyKCk7XHJcbiAgICAgIHJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIGhhbmRsZUtleSk7XHJcblxyXG4gICAgICBpZiAoYW5kVGhlbilcclxuICAgICAgICBhbmRUaGVuKGxldmVsLnN0YXR1cyk7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcbiAgcnVuQW5pbWF0aW9uKGFuaW1hdGlvbik7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcnVuTGV2ZWw7IiwidmFyIGVsdCA9IHJlcXVpcmUoJy4uL0hlbHBlcnMvZWx0Jyk7XHJcblxyXG5mdW5jdGlvbiBET01EaXNwbGF5KHBhcmVudCwgbGV2ZWwpIHtcclxuICB0aGlzLndyYXAgPSBwYXJlbnQuYXBwZW5kQ2hpbGQoZWx0KCdkaXYnLCAnZ2FtZScpKTtcclxuICB0aGlzLmxldmVsID0gbGV2ZWw7XHJcblxyXG4gIHRoaXMud3JhcC5hcHBlbmRDaGlsZCh0aGlzLmRyYXdCYWNrZ3JvdW5kKCkpO1xyXG4gIHRoaXMuYWN0b3JMYXllciA9IG51bGw7XHJcbiAgdGhpcy5kcmF3RnJhbWUoKTtcclxufVxyXG5cclxudmFyIHNjYWxlID0gMjA7XHJcblxyXG5ET01EaXNwbGF5LnByb3RvdHlwZS5kcmF3QmFja2dyb3VuZCA9IGZ1bmN0aW9uKCkge1xyXG4gIHZhciB0YWJsZSA9IGVsdCgndGFibGUnLCAnYmFja2dyb3VuZCcpO1xyXG4gIHRhYmxlLnN0eWxlLndpZHRoID0gdGhpcy5sZXZlbC53aWR0aCAqIHNjYWxlICsgJ3B4JztcclxuICB0aGlzLmxldmVsLmdyaWQuZm9yRWFjaChmdW5jdGlvbihyb3cpIHtcclxuICAgIHZhciByb3dFbHQgPSB0YWJsZS5hcHBlbmRDaGlsZChlbHQoJ3RyJykpO1xyXG4gICAgcm93RWx0LnN0eWxlLmhlaWdodCA9IHNjYWxlICsgJ3B4JztcclxuICAgIHJvdy5mb3JFYWNoKGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgcm93RWx0LmFwcGVuZENoaWxkKGVsdCgndGQnLCB0eXBlKSk7XHJcbiAgICB9KTtcclxuICB9KTtcclxuICByZXR1cm4gdGFibGU7XHJcbn07XHJcblxyXG5ET01EaXNwbGF5LnByb3RvdHlwZS5kcmF3QWN0b3JzID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIHdyYXAgPSBlbHQoJ2RpdicpO1xyXG4gIHRoaXMubGV2ZWwuYWN0b3JzLmZvckVhY2goZnVuY3Rpb24oYWN0b3IpIHtcclxuICAgIHZhciByZWN0ID0gd3JhcC5hcHBlbmRDaGlsZChlbHQoJ2RpdicsXHJcbiAgICAgICdhY3RvciAnICsgYWN0b3IudHlwZSkpO1xyXG4gICAgcmVjdC5zdHlsZS53aWR0aCA9IGFjdG9yLnNpemUueCAqIHNjYWxlICsgJ3B4JztcclxuICAgIHJlY3Quc3R5bGUuaGVpZ2h0ID0gYWN0b3Iuc2l6ZS55ICogc2NhbGUgKyAncHgnO1xyXG4gICAgcmVjdC5zdHlsZS5sZWZ0ID0gYWN0b3IucG9zLnggKiBzY2FsZSArICdweCc7XHJcbiAgICByZWN0LnN0eWxlLnRvcCA9IGFjdG9yLnBvcy55ICogc2NhbGUgKyAncHgnO1xyXG4gIH0pO1xyXG4gIHJldHVybiB3cmFwO1xyXG59O1xyXG5cclxuRE9NRGlzcGxheS5wcm90b3R5cGUuZHJhd0ZyYW1lID0gZnVuY3Rpb24oKSB7XHJcbiAgaWYgKHRoaXMuYWN0b3JMYXllcilcclxuICAgIHRoaXMud3JhcC5yZW1vdmVDaGlsZCh0aGlzLmFjdG9yTGF5ZXIpO1xyXG4gIHRoaXMuYWN0b3JMYXllciA9IHRoaXMud3JhcC5hcHBlbmRDaGlsZCh0aGlzLmRyYXdBY3RvcnMoKSk7XHJcbiAgdGhpcy53cmFwLmNsYXNzTmFtZSA9ICdnYW1lICcgKyAodGhpcy5sZXZlbC5zdGF0dXMgfHwgJycpO1xyXG4gIHRoaXMuc2Nyb2xsUGxheWVySW50b1ZpZXcoKTtcclxufTtcclxuXHJcbkRPTURpc3BsYXkucHJvdG90eXBlLnNjcm9sbFBsYXllckludG9WaWV3ID0gZnVuY3Rpb24oKSB7XHJcbiAgdmFyIHdpZHRoID0gdGhpcy53cmFwLmNsaWVudFdpZHRoO1xyXG4gIHZhciBoZWlnaHQgPSB0aGlzLndyYXAuY2xpZW50SGVpZ2h0O1xyXG4gIHZhciBtYXJnaW4gPSB3aWR0aCAvIDM7XHJcblxyXG4gIC8vIFRoZSB2aWV3cG9ydFxyXG4gIHZhciBsZWZ0ID0gdGhpcy53cmFwLnNjcm9sbExlZnQsIHJpZ2h0ID0gbGVmdCArIHdpZHRoO1xyXG4gIHZhciB0b3AgPSB0aGlzLndyYXAuc2Nyb2xsVG9wLCBib3R0b20gPSB0b3AgKyBoZWlnaHQ7XHJcblxyXG4gIHZhciBwbGF5ZXIgPSB0aGlzLmxldmVsLnBsYXllcjtcclxuICB2YXIgY2VudGVyID0gcGxheWVyLnBvcy5wbHVzKHBsYXllci5zaXplLnRpbWVzKDAuNSkpXHJcbiAgICAudGltZXMoc2NhbGUpO1xyXG5cclxuICBpZiAoY2VudGVyLnggPCBsZWZ0ICsgbWFyZ2luKVxyXG4gICAgdGhpcy53cmFwLnNjcm9sbExlZnQgPSBjZW50ZXIueCAtIG1hcmdpbjtcclxuICBlbHNlIGlmIChjZW50ZXIueCA+IHJpZ2h0IC0gbWFyZ2luKVxyXG4gICAgdGhpcy53cmFwLnNjcm9sbExlZnQgPSBjZW50ZXIueCArIG1hcmdpbiAtIHdpZHRoO1xyXG4gIGlmIChjZW50ZXIueSA8IHRvcCArIG1hcmdpbilcclxuICAgIHRoaXMud3JhcC5zY3JvbGxUb3AgPSBjZW50ZXIueSAtIG1hcmdpbjtcclxuICBlbHNlIGlmIChjZW50ZXIueSA+IGJvdHRvbSAtIG1hcmdpbilcclxuICAgIHRoaXMud3JhcC5zY3JvbGxUb3AgPSBjZW50ZXIueSArIG1hcmdpbiAtIGhlaWdodDtcclxufTtcclxuXHJcbkRPTURpc3BsYXkucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy53cmFwLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy53cmFwKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gRE9NRGlzcGxheTsiLCJ2YXIgYWN0b3JDaGFycyA9IHJlcXVpcmUoJy4uL0hlbHBlcnMvYWN0b3JDaGFycy5qcycpO1xyXG52YXIgVmVjdG9yID0gcmVxdWlyZSgnLi9WZWN0b3InKTtcclxuXHJcbmZ1bmN0aW9uIExldmVsKHBsYW4pIHtcclxuICB0aGlzLndpZHRoID0gcGxhblswXS5sZW5ndGg7XHJcbiAgdGhpcy5oZWlnaHQgPSBwbGFuLmxlbmd0aDtcclxuICB0aGlzLmdyaWQgPSBbXTtcclxuICB0aGlzLmFjdG9ycyA9IFtdO1xyXG5cclxuICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcclxuICAgIHZhciBsaW5lID0gcGxhblt5XSwgZ3JpZExpbmUgPSBbXTtcclxuICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XHJcbiAgICAgIHZhciBjaCA9IGxpbmVbeF0sIGZpZWxkVHlwZSA9IG51bGw7XHJcbiAgICAgIHZhciBBY3RvciA9IGFjdG9yQ2hhcnNbY2hdO1xyXG4gICAgICBpZiAoQWN0b3IpIHtcclxuICAgICAgICB0aGlzLmFjdG9ycy5wdXNoKG5ldyBBY3RvcihuZXcgVmVjdG9yKHgsIHkpLCBjaCkpO1xyXG4gICAgICB9IGVsc2UgaWYgKGNoID09ICd4Jykge1xyXG4gICAgICAgIGZpZWxkVHlwZSA9ICd3YWxsJztcclxuICAgICAgfSBlbHNlIGlmIChjaCA9PSAnIScpIHtcclxuICAgICAgICBmaWVsZFR5cGUgPSAnbGF2YSc7XHJcbiAgICAgIH1cclxuICAgICAgZ3JpZExpbmUucHVzaChmaWVsZFR5cGUpO1xyXG4gICAgfVxyXG4gICAgdGhpcy5ncmlkLnB1c2goZ3JpZExpbmUpO1xyXG4gIH1cclxuXHJcbiAgdGhpcy5wbGF5ZXIgPSB0aGlzLmFjdG9ycy5maWx0ZXIoZnVuY3Rpb24oYWN0b3IpIHtcclxuICAgIHJldHVybiBhY3Rvci50eXBlID09ICdwbGF5ZXInO1xyXG4gIH0pWzBdO1xyXG4gIHRoaXMuc3RhdHVzID0gdGhpcy5maW5pc2hEZWxheSA9IG51bGw7XHJcbn1cclxuXHJcbkxldmVsLnByb3RvdHlwZS5pc0ZpbmlzaGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHRoaXMuc3RhdHVzICE9IG51bGwgJiYgdGhpcy5maW5pc2hEZWxheSA8IDA7XHJcbn07XHJcblxyXG5cclxuTGV2ZWwucHJvdG90eXBlLm9ic3RhY2xlQXQgPSBmdW5jdGlvbihwb3MsIHNpemUpIHtcclxuICB2YXIgeFN0YXJ0ID0gTWF0aC5mbG9vcihwb3MueCk7XHJcbiAgdmFyIHhFbmQgPSBNYXRoLmNlaWwocG9zLnggKyBzaXplLngpO1xyXG4gIHZhciB5U3RhcnQgPSBNYXRoLmZsb29yKHBvcy55KTtcclxuICB2YXIgeUVuZCA9IE1hdGguY2VpbChwb3MueSArIHNpemUueSk7XHJcblxyXG4gIGlmICh4U3RhcnQgPCAwIHx8IHhFbmQgPiB0aGlzLndpZHRoIHx8IHlTdGFydCA8IDApXHJcbiAgICByZXR1cm4gJ3dhbGwnO1xyXG4gIGlmICh5RW5kID4gdGhpcy5oZWlnaHQpXHJcbiAgICByZXR1cm4gJ2xhdmEnO1xyXG4gIGZvciAodmFyIHkgPSB5U3RhcnQ7IHkgPCB5RW5kOyB5KyspIHtcclxuICAgIGZvciAodmFyIHggPSB4U3RhcnQ7IHggPCB4RW5kOyB4KyspIHtcclxuICAgICAgdmFyIGZpZWxkVHlwZSA9IHRoaXMuZ3JpZFt5XVt4XTtcclxuICAgICAgaWYgKGZpZWxkVHlwZSkgcmV0dXJuIGZpZWxkVHlwZTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG5MZXZlbC5wcm90b3R5cGUuYWN0b3JBdCA9IGZ1bmN0aW9uKGFjdG9yKSB7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFjdG9ycy5sZW5ndGg7IGkrKykge1xyXG4gICAgdmFyIG90aGVyID0gdGhpcy5hY3RvcnNbaV07XHJcbiAgICBpZiAob3RoZXIgIT0gYWN0b3IgJiZcclxuICAgICAgYWN0b3IucG9zLnggKyBhY3Rvci5zaXplLnggPiBvdGhlci5wb3MueCAmJlxyXG4gICAgICBhY3Rvci5wb3MueCA8IG90aGVyLnBvcy54ICsgb3RoZXIuc2l6ZS54ICYmXHJcbiAgICAgIGFjdG9yLnBvcy55ICsgYWN0b3Iuc2l6ZS55ID4gb3RoZXIucG9zLnkgJiZcclxuICAgICAgYWN0b3IucG9zLnkgPCBvdGhlci5wb3MueSArIG90aGVyLnNpemUueSlcclxuICAgICAgcmV0dXJuIG90aGVyO1xyXG4gIH1cclxufTtcclxuXHJcbnZhciBtYXhTdGVwID0gMC4wNTtcclxuXHJcbkxldmVsLnByb3RvdHlwZS5hbmltYXRlID0gZnVuY3Rpb24oc3RlcCwga2V5cykge1xyXG4gIGlmICh0aGlzLnN0YXR1cyAhPSBudWxsKVxyXG4gICAgdGhpcy5maW5pc2hEZWxheSAtPSBzdGVwO1xyXG5cclxuICB3aGlsZSAoc3RlcCA+IDApIHtcclxuICAgIHZhciB0aGlzU3RlcCA9IE1hdGgubWluKHN0ZXAsIG1heFN0ZXApO1xyXG4gICAgdGhpcy5hY3RvcnMuZm9yRWFjaChmdW5jdGlvbihhY3Rvcikge1xyXG4gICAgICBhY3Rvci5hY3QodGhpc1N0ZXAsIHRoaXMsIGtleXMpO1xyXG4gICAgfSwgdGhpcyk7XHJcbiAgICBzdGVwIC09IHRoaXNTdGVwO1xyXG4gIH1cclxufTtcclxuXHJcbkxldmVsLnByb3RvdHlwZS5wbGF5ZXJUb3VjaGVkID0gZnVuY3Rpb24odHlwZSwgYWN0b3IpIHtcclxuICBpZiAodHlwZSA9PSAnbGF2YScgJiYgdGhpcy5zdGF0dXMgPT0gbnVsbCkge1xyXG4gICAgdGhpcy5zdGF0dXMgPSAnbG9zdCc7XHJcbiAgICB0aGlzLmZpbmlzaERlbGF5ID0gMTtcclxuICB9IGVsc2UgaWYgKHR5cGUgPT0gJ2NvaW4nKSB7XHJcbiAgICB0aGlzLmFjdG9ycyA9IHRoaXMuYWN0b3JzLmZpbHRlcihmdW5jdGlvbihvdGhlcikge1xyXG4gICAgICByZXR1cm4gb3RoZXIgIT0gYWN0b3I7XHJcbiAgICB9KTtcclxuICAgIGlmICghdGhpcy5hY3RvcnMuc29tZShmdW5jdGlvbihhY3Rvcikge1xyXG4gICAgICAgIHJldHVybiBhY3Rvci50eXBlID09ICdjb2luJztcclxuICAgICAgfSkpIHtcclxuICAgICAgdGhpcy5zdGF0dXMgPSAnd29uJztcclxuICAgICAgdGhpcy5maW5pc2hEZWxheSA9IDE7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBMZXZlbDsiLCJmdW5jdGlvbiBWZWN0b3IoeCwgeSkge1xyXG4gIHRoaXMueCA9IHg7IHRoaXMueSA9IHk7XHJcbn1cclxuVmVjdG9yLnByb3RvdHlwZS5wbHVzID0gZnVuY3Rpb24ob3RoZXIpIHtcclxuICByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKyBvdGhlci54LCB0aGlzLnkgKyBvdGhlci55KTtcclxufTtcclxuVmVjdG9yLnByb3RvdHlwZS50aW1lcyA9IGZ1bmN0aW9uKGZhY3Rvcikge1xyXG4gIHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCAqIGZhY3RvciwgdGhpcy55ICogZmFjdG9yKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gVmVjdG9yOyIsIlxyXG52YXIgcnVuR2FtZSA9IHJlcXVpcmUoJy4vUnVubmVycy9ydW5HYW1lJyk7XHJcbnZhciBHQU1FX0xFVkVMUyA9IHJlcXVpcmUoJy4vTGV2ZWxzL2xldmVsJyk7XHJcbnZhciBET01EaXNwbGF5ID0gcmVxdWlyZSgnLi9Xb3JsZC9ET01EaXNwbGF5Jyk7XHJcblxyXG5ydW5HYW1lKEdBTUVfTEVWRUxTLCBET01EaXNwbGF5KTsiXX0=
