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
},{"../World/Vector":15}],2:[function(require,module,exports){
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
},{"../World/Level":14,"../World/Vector":15}],3:[function(require,module,exports){
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
},{"../World/Level":14,"../World/Vector":15}],4:[function(require,module,exports){
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
function flipHorizontally(context, around) {
  context.translate(around, 0);
  context.scale(-1, 1);
  context.translate(-around, 0);
}

module.exports = flipHorizontally;
},{}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
var GAME_LEVELS = [[
  "                                                                                                  xxx x       ",
  "                                                                                                      x       ",
  "                                                                                                  xxxxx       ",
  "                                                                                                  x           ",
  "                                                                                                  x xxx       ",
  "                          o                                                                       x x x       ",
  "                                                                                             o o oxxx x       ",
  "                   xxx                                                                                x       ",
  "       !  o  !                                                xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxx       ",
  "       x     x                                                x   x x   x x   x x   x x   x x   x x           ",
  "       x= o  x            x                                   xxx x xxx x xxx x xxx x xxx x xxx x xxxxx       ",
  "       x     x                                                  x x   x x   x x   x x   x x   x x     x       ",
  "       !  o  !            o                                  xxxx xxxxx xxxxx xxxxx xxxxx xxxxx xxxxxxx       ",
  "                                                                                                              ",
  "          o              xxx                              xx                                                  ",
  "                                                                                                              ",
  "                                                                                                              ",
  "                                                      xx                                                      ",
  "                   xxx         xxx                                                                            ",
  "                                                                                                              ",
  "                          o                                                     x      x                      ",
  "                                                          xx     xx                                           ",
  "             xxx         xxx         xxx                                 x                  x                 ",
  "                                                                                                              ",
  "                                                                 ||                                           ",
  "  xxxxxxxxxxx                                                                                                 ",
  "  x         x o xxxxxxxxx o xxxxxxxxx o xx                                                x                   ",
  "  x         x   x       x   x       x   x                 ||                  x     x                         ",
  "  x  @      xxxxx   o   xxxxx   o   xxxxx                                                                     ",
  "  xxxxxxx                                     xxxxx       xx     xx     xxx                                   ",
  "        x=                  =                =x   x                     xxx                                   ",
  "        xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx   x!!!!!!!!!!!!!!!!!!!!!xxx!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!",
  "                                                  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "                                                                                                              "
],
  ["                                      x!!x                        xxxxxxx                                    x!x  ",
    "                                      x!!x                     xxxx     xxxx                                 x!x  ",
    "                                      x!!xxxxxxxxxx           xx           xx                                x!x  ",
    "                                      xx!!!!!!!!!!xx         xx             xx                               x!x  ",
    "                                       xxxxxxxxxx!!x         x                                    o   o   o  x!x  ",
    "                                                xx!x         x     o   o                                    xx!x  ",
    "                                                 x!x         x                                xxxxxxxxxxxxxxx!!x  ",
    "                                                 xvx         x     x   x                        !!!!!!!!!!!!!!xx  ",
    "                                                             xx  |   |   |  xx            xxxxxxxxxxxxxxxxxxxxx   ",
    "                                                              xx!!!!!!!!!!!xx            v                        ",
    "                                                               xxxx!!!!!xxxx                                      ",
    "                                               x     x            xxxxxxx        xxx         xxx                  ",
    "                                               x     x                           x x         x x                  ",
    "                                               x     x                             x         x                    ",
    "                                               x     x                             xx        x                    ",
    "                                               xx    x                             x         x                    ",
    "                                               x     x      o  o     x   x         x         x                    ",
    "               xxxxxxx        xxx   xxx        x     x               x   x         x         x                    ",
    "              xx     xx         x   x          x     x     xxxxxx    x   x   xxxxxxxxx       x                    ",
    "             xx       xx        x o x          x    xx               x   x   x               x                    ",
    "     @       x         x        x   x          x     x               x   x   x               x                    ",
    "    xxx      x         x        x   x          x     x               x   xxxxx   xxxxxx      x                    ",
    "    x x      x         x       xx o xx         x     x               x     o     x x         x                    ",
    "!!!!x x!!!!!!x         x!!!!!!xx     xx!!!!!!!!xx    x!!!!!!!!!!     x     =     x x         x                    ",
    "!!!!x x!!!!!!x         x!!!!!xx       xxxxxxxxxx     x!!!!!!!xx!     xxxxxxxxxxxxx xx  o o  xx                    ",
    "!!!!x x!!!!!!x         x!!!!!x    o                 xx!!!!!!xx !                    xx     xx                     ",
    "!!!!x x!!!!!!x         x!!!!!x                     xx!!!!!!xx  !                     xxxxxxx                      ",
    "!!!!x x!!!!!!x         x!!!!!xx       xxxxxxxxxxxxxx!!!!!!xx   !                                                  ",
    "!!!!x x!!!!!!x         x!!!!!!xxxxxxxxx!!!!!!!!!!!!!!!!!!xx    !                                                  ",
    "!!!!x x!!!!!!x         x!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!xx     !                                                  "
  ],
  [
    "                                                                                                              ",
    "                                                                                                              ",
    "                                                                                                              ",
    "                                                                                                              ",
    "                                                                                                              ",
    "                                        o                                                                     ",
    "                                                                                                              ",
    "                                        x                                                                     ",
    "                                        x                                                                     ",
    "                                        x                                                                     ",
    "                                        x                                                                     ",
    "                                       xxx                                                                    ",
    "                                       x x                 !!!        !!!  xxx                                ",
    "                                       x x                 !x!        !x!                                     ",
    "                                     xxx xxx                x          x                                      ",
    "                                      x   x                 x   oooo   x       xxx                            ",
    "                                      x   x                 x          x      x!!!x                           ",
    "                                      x   x                 xxxxxxxxxxxx       xxx                            ",
    "                                     xx   xx      x   x      x                                                ",
    "                                      x   xxxxxxxxx   xxxxxxxx              x x                               ",
    "                                      x   x           x                    x!!!x                              ",
    "                                      x   x           x                     xxx                               ",
    "                                     xx   xx          x                                                       ",
    "                                      x   x= = = =    x            xxx                                        ",
    "                                      x   x           x           x!!!x                                       ",
    "                                      x   x    = = = =x     o      xxx       xxx                              ",
    "                                     xx   xx          x                     x!!!x                             ",
    "                              o   o   x   x           x     x                xxv        xxx                   ",
    "                                      x   x           x              x                 x!!!x                  ",
    "                             xxx xxx xxx xxx     o o  x!!!!!!!!!!!!!!x                   vx                   ",
    "                             x xxx x x xxx x          x!!!!!!!!!!!!!!x                                        ",
    "                             x             x   xxxxxxxxxxxxxxxxxxxxxxx                                        ",
    "                             xx           xx                                         xxx                      ",
    "  xxx                         x     x     x                                         x!!!x                xxx  ",
    "  x x                         x    xxx    x                                          xxx                 x x  ",
    "  x                           x    xxx    xxxxxxx                        xxxxx                             x  ",
    "  x                           x           x                              x   x                             x  ",
    "  x                           xx          x                              x x x                             x  ",
    "  x                                       x       |xxxx|    |xxxx|     xxx xxx                             x  ",
    "  x                xxx             o o    x                              x         xxx                     x  ",
    "  x               xxxxx       xx          x                             xxx       x!!!x          x         x  ",
    "  x               oxxxo       x    xxx    x                             x x        xxx          xxx        x  ",
    "  x                xxx        xxxxxxxxxxxxx  x oo x    x oo x    x oo  xx xx                    xxx        x  ",
    "  x      @          x         x           x!!x    x!!!!x    x!!!!x    xx   xx                    x         x  ",
    "  xxxxxxxxxxxxxxxxxxxxxxxxxxxxx           xxxxxxxxxxxxxxxxxxxxxxxxxxxxx     xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  ",
    "                                                                                                              ",
    "                                                                                                              "
  ]];

module.exports = GAME_LEVELS;
},{}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
var Level = require('../World/Level');
var runLevel = require('./runLevel');
var elt = require('../Helpers/elt');

function runGame(plans, Display) {
  var count = 3;
  var lives  = count;
  var livesSpan = document.querySelector('#lives');
  var levelSpan = document.querySelector('#level');

  function startLevel(n) {
    livesSpan.textContent = lives;
    levelSpan.textContent = n+1;

    if (lives >= 1) {
      runLevel(new Level(plans[n]), Display, function (status) {

        if (status == 'lost') {
          lives--;
          if (lives <= 0 ) {
            var div = document.body.querySelector('.game-over');
            div.style.display = 'block';
            //var youLost = document.body.appendChild(elt('div', 'game-over')).appendChild(elt('div', 'tableBlock'));
            //var text = document.createTextNode('GAME OVER\nGAME OVER');
            //var text2 = document.createTextNode('GAME OVER');
            //youLost.appendChild(text);
            //youLost.appendChild(text2);

            addEventListener('keydown', function (event) {
              if (event.keyCode == 32) {
                var gameOver = document.querySelector('.game-over');
                document.body.removeChild(gameOver);
                lives  = count;
                startLevel(0);
              }
            });
          }

          startLevel(n);

        } else if (n < plans.length - 1) {
          startLevel(n + 1);
        }
        else {
          var youWin = document.body.querySelector('.game-win');
          youWin.style.display = 'block';

          addEventListener('keydown', function (event) {
            if (event.keyCode == 32) {
              var gameWin = document.querySelector('.game-win');
              document.body.removeChild(gameWin );
              lives  = count;
              startLevel(0);
            }
          });
        }
      });

    }
  }
  startLevel(0);
}

module.exports = runGame;

//addEventListener('keydown',function(event){
//  console.log(event.which);
//});
},{"../Helpers/elt":6,"../World/Level":14,"./runLevel":12}],12:[function(require,module,exports){
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
},{"../Helpers/arrowCodes":5,"../Helpers/trackKeys":8,"../World/Level":14,"./runAnimation":10}],13:[function(require,module,exports){
var flipHorizontally = require('../Helpers/flipHorizontally');

function CanvasDisplay(parent, level) {
  this.canvas = document.createElement("canvas");
  this.canvas.width = Math.min(600, level.width * scale);
  this.canvas.height = Math.min(450, level.height * scale);
  parent.appendChild(this.canvas);
  this.cx = this.canvas.getContext("2d");

  this.level = level;
  this.animationTime = 0;
  this.flipPlayer = false;

  this.viewport = {
    left: 0,
    top: 0,
    width: this.canvas.width / scale,
    height: this.canvas.height / scale
  };

  this.drawFrame(0);
}

var scale = 20;

CanvasDisplay.prototype.clear = function() {
  this.canvas.parentNode.removeChild(this.canvas);
};

CanvasDisplay.prototype.drawFrame = function(step) {
  this.animationTime += step;

  this.updateViewport();
  this.clearDisplay();
  this.drawBackground();
  this.drawActors();
};

CanvasDisplay.prototype.updateViewport = function() {
  var view = this.viewport, margin = view.width / 3;
  var player = this.level.player;
  var center = player.pos.plus(player.size.times(0.5));

  if (center.x < view.left + margin)
    view.left = Math.max(center.x - margin, 0);
  else if (center.x > view.left + view.width - margin)
    view.left = Math.min(center.x + margin - view.width,
      this.level.width - view.width);
  if (center.y < view.top + margin)
    view.top = Math.max(center.y - margin, 0);
  else if (center.y > view.top + view.height - margin)
    view.top = Math.min(center.y + margin - view.height,
      this.level.height - view.height);
};

CanvasDisplay.prototype.clearDisplay = function() {
  if (this.level.status == "won")
    this.cx.fillStyle = "rgb(68, 191, 255)";
  else if (this.level.status == "lost")
    this.cx.fillStyle = "rgb(44, 136, 214)";
  else
    this.cx.fillStyle = "rgb(52, 166, 251)";
  this.cx.fillRect(0, 0,
    this.canvas.width, this.canvas.height);
};

var otherSprites = document.createElement("img");
otherSprites.src = "img/sprites.png";

CanvasDisplay.prototype.drawBackground = function() {
  var view = this.viewport;
  var xStart = Math.floor(view.left);
  var xEnd = Math.ceil(view.left + view.width);
  var yStart = Math.floor(view.top);
  var yEnd = Math.ceil(view.top + view.height);

  for (var y = yStart; y < yEnd; y++) {
    for (var x = xStart; x < xEnd; x++) {
      var tile = this.level.grid[y][x];
      if (tile == null) continue;
      var screenX = (x - view.left) * scale;
      var screenY = (y - view.top) * scale;
      var tileX = tile == "lava" ? scale : 0;
      this.cx.drawImage(otherSprites,
        tileX,         0, scale, scale,
        screenX, screenY, scale, scale);
    }
  }
};

var playerSprites = document.createElement("img");
playerSprites.src = "img/player.png";
var playerXOverlap = 4;

CanvasDisplay.prototype.drawPlayer = function(x, y, width,
                                              height) {
  var sprite = 8, player = this.level.player;
  width += playerXOverlap * 2;
  x -= playerXOverlap;
  if (player.speed.x != 0)
    this.flipPlayer = player.speed.x < 0;

  if (player.speed.y != 0)
    sprite = 9;
  else if (player.speed.x != 0)
    sprite = Math.floor(this.animationTime * 12) % 8;

  this.cx.save();
  if (this.flipPlayer)
    flipHorizontally(this.cx, x + width / 2);

  this.cx.drawImage(playerSprites,
    sprite * width, 0, width, height,
    x,              y, width, height);

  this.cx.restore();
};

CanvasDisplay.prototype.drawActors = function() {
  this.level.actors.forEach(function(actor) {
    var width = actor.size.x * scale;
    var height = actor.size.y * scale;
    var x = (actor.pos.x - this.viewport.left) * scale;
    var y = (actor.pos.y - this.viewport.top) * scale;
    if (actor.type == "player") {
      this.drawPlayer(x, y, width, height);
    } else {
      var tileX = (actor.type == "coin" ? 2 : 1) * scale;
      this.cx.drawImage(otherSprites,
        tileX, 0, width, height,
        x,     y, width, height);
    }
  }, this);
};

module.exports = CanvasDisplay;
},{"../Helpers/flipHorizontally":7}],14:[function(require,module,exports){
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
},{"../Helpers/actorChars.js":4,"./Vector":15}],15:[function(require,module,exports){
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
},{}],16:[function(require,module,exports){

var runGame = require('./Runners/runGame');
var GAME_LEVELS = require('./Levels/level');
//var DOMDisplay = require('./World/DOMDisplay');
var CanvasDisplay = require('./World/CanvasDisplay');

runGame(GAME_LEVELS, CanvasDisplay);
},{"./Levels/level":9,"./Runners/runGame":11,"./World/CanvasDisplay":13}]},{},[16])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9FbnRpdHkvQ29pbi5qcyIsImpzL0VudGl0eS9MYXZhLmpzIiwianMvRW50aXR5L1BsYXllci5qcyIsImpzL0hlbHBlcnMvYWN0b3JDaGFycy5qcyIsImpzL0hlbHBlcnMvYXJyb3dDb2Rlcy5qcyIsImpzL0hlbHBlcnMvZWx0LmpzIiwianMvSGVscGVycy9mbGlwSG9yaXpvbnRhbGx5LmpzIiwianMvSGVscGVycy90cmFja0tleXMuanMiLCJqcy9MZXZlbHMvbGV2ZWwuanMiLCJqcy9SdW5uZXJzL3J1bkFuaW1hdGlvbi5qcyIsImpzL1J1bm5lcnMvcnVuR2FtZS5qcyIsImpzL1J1bm5lcnMvcnVuTGV2ZWwuanMiLCJqcy9Xb3JsZC9DYW52YXNEaXNwbGF5LmpzIiwianMvV29ybGQvTGV2ZWwuanMiLCJqcy9Xb3JsZC9WZWN0b3IuanMiLCJqcy9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFZlY3RvciA9IHJlcXVpcmUoJy4uL1dvcmxkL1ZlY3RvcicpO1xyXG5cclxuZnVuY3Rpb24gQ29pbihwb3MpIHtcclxuICB0aGlzLmJhc2VQb3MgPSB0aGlzLnBvcyA9IHBvcy5wbHVzKG5ldyBWZWN0b3IoMC4yLCAwLjEpKTtcclxuICB0aGlzLnNpemUgPSBuZXcgVmVjdG9yKDAuNiwgMC42KTtcclxuICB0aGlzLndvYmJsZSA9IE1hdGgucmFuZG9tKCkgKiBNYXRoLlBJICogMjtcclxufVxyXG5Db2luLnByb3RvdHlwZS50eXBlID0gJ2NvaW4nO1xyXG5cclxudmFyIHdvYmJsZVNwZWVkID0gOCwgd29iYmxlRGlzdCA9IDAuMDc7XHJcblxyXG5Db2luLnByb3RvdHlwZS5hY3QgPSBmdW5jdGlvbihzdGVwKSB7XHJcbiAgdGhpcy53b2JibGUgKz0gc3RlcCAqIHdvYmJsZVNwZWVkO1xyXG4gIHZhciB3b2JibGVQb3MgPSBNYXRoLnNpbih0aGlzLndvYmJsZSkgKiB3b2JibGVEaXN0O1xyXG4gIHRoaXMucG9zID0gdGhpcy5iYXNlUG9zLnBsdXMobmV3IFZlY3RvcigwLCB3b2JibGVQb3MpKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29pbjsiLCJ2YXIgVmVjdG9yID0gcmVxdWlyZSgnLi4vV29ybGQvVmVjdG9yJyk7XHJcbnZhciBMZXZlbCA9IHJlcXVpcmUoJy4uL1dvcmxkL0xldmVsJyk7XHJcblxyXG5mdW5jdGlvbiBMYXZhKHBvcywgY2gpIHtcclxuICB0aGlzLnBvcyA9IHBvcztcclxuICB0aGlzLnNpemUgPSBuZXcgVmVjdG9yKDEsIDEpO1xyXG4gIGlmIChjaCA9PSAnPScpIHtcclxuICAgIHRoaXMuc3BlZWQgPSBuZXcgVmVjdG9yKDIsIDApO1xyXG4gIH0gZWxzZSBpZiAoY2ggPT0gJ3wnKSB7XHJcbiAgICB0aGlzLnNwZWVkID0gbmV3IFZlY3RvcigwLCAyKTtcclxuICB9IGVsc2UgaWYgKGNoID09ICd2Jykge1xyXG4gICAgdGhpcy5zcGVlZCA9IG5ldyBWZWN0b3IoMCwgMyk7XHJcbiAgICB0aGlzLnJlcGVhdFBvcyA9IHBvcztcclxuICB9XHJcbn1cclxuTGF2YS5wcm90b3R5cGUudHlwZSA9ICdsYXZhJztcclxuXHJcbkxhdmEucHJvdG90eXBlLmFjdCA9IGZ1bmN0aW9uKHN0ZXAsIGxldmVsKSB7XHJcbiAgdmFyIG5ld1BvcyA9IHRoaXMucG9zLnBsdXModGhpcy5zcGVlZC50aW1lcyhzdGVwKSk7XHJcbiAgaWYgKCFsZXZlbC5vYnN0YWNsZUF0KG5ld1BvcywgdGhpcy5zaXplKSlcclxuICAgIHRoaXMucG9zID0gbmV3UG9zO1xyXG4gIGVsc2UgaWYgKHRoaXMucmVwZWF0UG9zKVxyXG4gICAgdGhpcy5wb3MgPSB0aGlzLnJlcGVhdFBvcztcclxuICBlbHNlXHJcbiAgICB0aGlzLnNwZWVkID0gdGhpcy5zcGVlZC50aW1lcygtMSk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IExhdmE7IiwidmFyIFZlY3RvciA9IHJlcXVpcmUoJy4uL1dvcmxkL1ZlY3RvcicpO1xyXG52YXIgTGV2ZWwgPSByZXF1aXJlKCcuLi9Xb3JsZC9MZXZlbCcpO1xyXG5cclxuZnVuY3Rpb24gUGxheWVyKHBvcykge1xyXG4gIHRoaXMucG9zID0gcG9zLnBsdXMobmV3IFZlY3RvcigwLCAtMC41KSk7XHJcbiAgdGhpcy5zaXplID0gbmV3IFZlY3RvcigwLjgsIDEuNSk7XHJcbiAgdGhpcy5zcGVlZCA9IG5ldyBWZWN0b3IoMCwgMCk7XHJcbn1cclxuUGxheWVyLnByb3RvdHlwZS50eXBlID0gJ3BsYXllcic7XHJcblxyXG52YXIgcGxheWVyWFNwZWVkID0gNztcclxuXHJcblBsYXllci5wcm90b3R5cGUubW92ZVggPSBmdW5jdGlvbihzdGVwLCBsZXZlbCwga2V5cykge1xyXG4gIHRoaXMuc3BlZWQueCA9IDA7XHJcbiAgaWYgKGtleXMubGVmdCkgdGhpcy5zcGVlZC54IC09IHBsYXllclhTcGVlZDtcclxuICBpZiAoa2V5cy5yaWdodCkgdGhpcy5zcGVlZC54ICs9IHBsYXllclhTcGVlZDtcclxuXHJcbiAgdmFyIG1vdGlvbiA9IG5ldyBWZWN0b3IodGhpcy5zcGVlZC54ICogc3RlcCwgMCk7XHJcbiAgdmFyIG5ld1BvcyA9IHRoaXMucG9zLnBsdXMobW90aW9uKTtcclxuICB2YXIgb2JzdGFjbGUgPSBsZXZlbC5vYnN0YWNsZUF0KG5ld1BvcywgdGhpcy5zaXplKTtcclxuICBpZiAob2JzdGFjbGUpXHJcbiAgICBsZXZlbC5wbGF5ZXJUb3VjaGVkKG9ic3RhY2xlKTtcclxuICBlbHNlXHJcbiAgICB0aGlzLnBvcyA9IG5ld1BvcztcclxufTtcclxuXHJcbnZhciBncmF2aXR5ID0gMzA7XHJcbnZhciBqdW1wU3BlZWQgPSAxNztcclxuXHJcblBsYXllci5wcm90b3R5cGUubW92ZVkgPSBmdW5jdGlvbihzdGVwLCBsZXZlbCwga2V5cykge1xyXG4gIHRoaXMuc3BlZWQueSArPSBzdGVwICogZ3Jhdml0eTtcclxuICB2YXIgbW90aW9uID0gbmV3IFZlY3RvcigwLCB0aGlzLnNwZWVkLnkgKiBzdGVwKTtcclxuICB2YXIgbmV3UG9zID0gdGhpcy5wb3MucGx1cyhtb3Rpb24pO1xyXG4gIHZhciBvYnN0YWNsZSA9IGxldmVsLm9ic3RhY2xlQXQobmV3UG9zLCB0aGlzLnNpemUpO1xyXG4gIGlmIChvYnN0YWNsZSkge1xyXG4gICAgbGV2ZWwucGxheWVyVG91Y2hlZChvYnN0YWNsZSk7XHJcbiAgICBpZiAoa2V5cy51cCAmJiB0aGlzLnNwZWVkLnkgPiAwKVxyXG4gICAgICB0aGlzLnNwZWVkLnkgPSAtanVtcFNwZWVkO1xyXG4gICAgZWxzZVxyXG4gICAgICB0aGlzLnNwZWVkLnkgPSAwO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aGlzLnBvcyA9IG5ld1BvcztcclxuICB9XHJcbn07XHJcblxyXG5QbGF5ZXIucHJvdG90eXBlLmFjdCA9IGZ1bmN0aW9uKHN0ZXAsIGxldmVsLCBrZXlzKSB7XHJcbiAgdGhpcy5tb3ZlWChzdGVwLCBsZXZlbCwga2V5cyk7XHJcbiAgdGhpcy5tb3ZlWShzdGVwLCBsZXZlbCwga2V5cyk7XHJcblxyXG4gIHZhciBvdGhlckFjdG9yID0gbGV2ZWwuYWN0b3JBdCh0aGlzKTtcclxuICBpZiAob3RoZXJBY3RvcilcclxuICAgIGxldmVsLnBsYXllclRvdWNoZWQob3RoZXJBY3Rvci50eXBlLCBvdGhlckFjdG9yKTtcclxuXHJcbiAgLy8gTG9zaW5nIGFuaW1hdGlvblxyXG4gIGlmIChsZXZlbC5zdGF0dXMgPT0gJ2xvc3QnKSB7XHJcbiAgICB0aGlzLnBvcy55ICs9IHN0ZXA7XHJcbiAgICB0aGlzLnNpemUueSAtPSBzdGVwO1xyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gUGxheWVyOyIsInZhciBQbGF5ZXIgPSByZXF1aXJlKCcuLi9FbnRpdHkvUGxheWVyJyk7XHJcbnZhciBDb2luID0gcmVxdWlyZSgnLi4vRW50aXR5L0NvaW4nKTtcclxudmFyIExhdmEgPSByZXF1aXJlKCcuLi9FbnRpdHkvTGF2YScpO1xyXG5cclxudmFyIGFjdG9yQ2hhcnMgPSB7XHJcbiAgJ0AnOiBQbGF5ZXIsXHJcbiAgJ28nOiBDb2luLFxyXG4gICc9JzogTGF2YSwgJ3wnOiBMYXZhLCAndic6IExhdmFcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gYWN0b3JDaGFyczsiLCJ2YXIgYXJyb3dDb2RlcyA9IHszNzogJ2xlZnQnLCAzODogJ3VwJywgMzk6ICdyaWdodCd9O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBhcnJvd0NvZGVzOyIsImZ1bmN0aW9uIGVsdChuYW1lLCBjbGFzc05hbWUpIHtcclxuICB2YXIgZWx0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKTtcclxuICBpZiAoY2xhc3NOYW1lKSBlbHQuY2xhc3NOYW1lID0gY2xhc3NOYW1lO1xyXG4gIHJldHVybiBlbHQ7XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZWx0OyIsImZ1bmN0aW9uIGZsaXBIb3Jpem9udGFsbHkoY29udGV4dCwgYXJvdW5kKSB7XHJcbiAgY29udGV4dC50cmFuc2xhdGUoYXJvdW5kLCAwKTtcclxuICBjb250ZXh0LnNjYWxlKC0xLCAxKTtcclxuICBjb250ZXh0LnRyYW5zbGF0ZSgtYXJvdW5kLCAwKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmbGlwSG9yaXpvbnRhbGx5OyIsImZ1bmN0aW9uIHRyYWNrS2V5cyhjb2Rlcykge1xyXG4gIHZhciBwcmVzc2VkID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcclxuICBmdW5jdGlvbiBoYW5kbGVyKGV2ZW50KSB7XHJcbiAgICBpZiAoY29kZXMuaGFzT3duUHJvcGVydHkoZXZlbnQua2V5Q29kZSkpIHtcclxuICAgICAgdmFyIGRvd24gPSBldmVudC50eXBlID09ICdrZXlkb3duJztcclxuICAgICAgcHJlc3NlZFtjb2Rlc1tldmVudC5rZXlDb2RlXV0gPSBkb3duO1xyXG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgfVxyXG4gIH1cclxuICBhZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlcik7XHJcbiAgYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBoYW5kbGVyKTtcclxuICByZXR1cm4gcHJlc3NlZDtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSB0cmFja0tleXM7IiwidmFyIEdBTUVfTEVWRUxTID0gW1tcclxuICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHh4IHggICAgICAgXCIsXHJcbiAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ICAgICAgIFwiLFxyXG4gIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4eHh4eCAgICAgICBcIixcclxuICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgICAgICAgICAgXCIsXHJcbiAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggeHh4ICAgICAgIFwiLFxyXG4gIFwiICAgICAgICAgICAgICAgICAgICAgICAgICBvICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4IHggeCAgICAgICBcIixcclxuICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8gbyBveHh4IHggICAgICAgXCIsXHJcbiAgXCIgICAgICAgICAgICAgICAgICAgeHh4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ICAgICAgIFwiLFxyXG4gIFwiICAgICAgICEgIG8gICEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4eHh4eCB4eHh4eCB4eHh4eCB4eHh4eCB4eHh4eCB4eHh4eCB4eHh4eCAgICAgICBcIixcclxuICBcIiAgICAgICB4ICAgICB4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgIHggeCAgIHggeCAgIHggeCAgIHggeCAgIHggeCAgIHggeCAgICAgICAgICAgXCIsXHJcbiAgXCIgICAgICAgeD0gbyAgeCAgICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh4eCB4IHh4eCB4IHh4eCB4IHh4eCB4IHh4eCB4IHh4eCB4IHh4eHh4ICAgICAgIFwiLFxyXG4gIFwiICAgICAgIHggICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggeCAgIHggeCAgIHggeCAgIHggeCAgIHggeCAgIHggeCAgICAgeCAgICAgICBcIixcclxuICBcIiAgICAgICAhICBvICAhICAgICAgICAgICAgbyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4eHh4IHh4eHh4IHh4eHh4IHh4eHh4IHh4eHh4IHh4eHh4IHh4eHh4eHggICAgICAgXCIsXHJcbiAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLFxyXG4gIFwiICAgICAgICAgIG8gICAgICAgICAgICAgIHh4eCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIixcclxuICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLFxyXG4gIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIixcclxuICBcIiAgICAgICAgICAgICAgICAgICB4eHggICAgICAgICB4eHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLFxyXG4gIFwiICAgICAgICAgICAgICAgICAgICAgICAgICBvICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ICAgICAgeCAgICAgICAgICAgICAgICAgICAgICBcIixcclxuICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4eCAgICAgeHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgXCIgICAgICAgICAgICAgeHh4ICAgICAgICAgeHh4ICAgICAgICAgeHh4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgICAgICAgICAgICAgICAgIHggICAgICAgICAgICAgICAgIFwiLFxyXG4gIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIixcclxuICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgXCIgIHh4eHh4eHh4eHh4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLFxyXG4gIFwiICB4ICAgICAgICAgeCBvIHh4eHh4eHh4eCBvIHh4eHh4eHh4eCBvIHh4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgICAgICAgICAgICAgICAgICBcIixcclxuICBcIiAgeCAgICAgICAgIHggICB4ICAgICAgIHggICB4ICAgICAgIHggICB4ICAgICAgICAgICAgICAgICB8fCAgICAgICAgICAgICAgICAgIHggICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgXCIgIHggIEAgICAgICB4eHh4eCAgIG8gICB4eHh4eCAgIG8gICB4eHh4eCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiLFxyXG4gIFwiICB4eHh4eHh4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh4eHh4ICAgICAgIHh4ICAgICB4eCAgICAgeHh4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIixcclxuICBcIiAgICAgICAgeD0gICAgICAgICAgICAgICAgICA9ICAgICAgICAgICAgICAgID14ICAgeCAgICAgICAgICAgICAgICAgICAgIHh4eCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgXCIgICAgICAgIHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eCAgIHghISEhISEhISEhISEhISEhISEhISF4eHghISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhIVwiLFxyXG4gIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHhcIixcclxuICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcclxuXSxcclxuICBbXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHghIXggICAgICAgICAgICAgICAgICAgICAgICB4eHh4eHh4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCF4ICBcIixcclxuICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ISF4ICAgICAgICAgICAgICAgICAgICAgeHh4eCAgICAgeHh4eCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHgheCAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCEheHh4eHh4eHh4eCAgICAgICAgICAgeHggICAgICAgICAgIHh4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4IXggIFwiLFxyXG4gICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh4ISEhISEhISEhIXh4ICAgICAgICAgeHggICAgICAgICAgICAgeHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCF4ICBcIixcclxuICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHh4eHh4eHh4eCEheCAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvICAgbyAgIG8gIHgheCAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh4IXggICAgICAgICB4ICAgICBvICAgbyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh4IXggIFwiLFxyXG4gICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCF4ICAgICAgICAgeCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHh4eHh4eHh4eHh4eHh4ISF4ICBcIixcclxuICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh2eCAgICAgICAgIHggICAgIHggICB4ICAgICAgICAgICAgICAgICAgICAgICAgISEhISEhISEhISEhISF4eCAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4eCAgfCAgIHwgICB8ICB4eCAgICAgICAgICAgIHh4eHh4eHh4eHh4eHh4eHh4eHh4eCAgIFwiLFxyXG4gICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh4ISEhISEhISEhISF4eCAgICAgICAgICAgIHYgICAgICAgICAgICAgICAgICAgICAgICBcIixcclxuICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHh4eCEhISEheHh4eCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgICAgeCAgICAgICAgICAgIHh4eHh4eHggICAgICAgIHh4eCAgICAgICAgIHh4eCAgICAgICAgICAgICAgICAgIFwiLFxyXG4gICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgICB4IHggICAgICAgICB4IHggICAgICAgICAgICAgICAgICBcIixcclxuICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ICAgICB4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ICAgICAgICAgeCAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgICAgeCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHggICAgICAgIHggICAgICAgICAgICAgICAgICAgIFwiLFxyXG4gICAgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh4ICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggICAgICAgICB4ICAgICAgICAgICAgICAgICAgICBcIixcclxuICAgIFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ICAgICB4ICAgICAgbyAgbyAgICAgeCAgIHggICAgICAgICB4ICAgICAgICAgeCAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgIHh4eHh4eHggICAgICAgIHh4eCAgIHh4eCAgICAgICAgeCAgICAgeCAgICAgICAgICAgICAgIHggICB4ICAgICAgICAgeCAgICAgICAgIHggICAgICAgICAgICAgICAgICAgIFwiLFxyXG4gICAgXCIgICAgICAgICAgICAgIHh4ICAgICB4eCAgICAgICAgIHggICB4ICAgICAgICAgIHggICAgIHggICAgIHh4eHh4eCAgICB4ICAgeCAgIHh4eHh4eHh4eCAgICAgICB4ICAgICAgICAgICAgICAgICAgICBcIixcclxuICAgIFwiICAgICAgICAgICAgIHh4ICAgICAgIHh4ICAgICAgICB4IG8geCAgICAgICAgICB4ICAgIHh4ICAgICAgICAgICAgICAgeCAgIHggICB4ICAgICAgICAgICAgICAgeCAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgQCAgICAgICB4ICAgICAgICAgeCAgICAgICAgeCAgIHggICAgICAgICAgeCAgICAgeCAgICAgICAgICAgICAgIHggICB4ICAgeCAgICAgICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgIFwiLFxyXG4gICAgXCIgICAgeHh4ICAgICAgeCAgICAgICAgIHggICAgICAgIHggICB4ICAgICAgICAgIHggICAgIHggICAgICAgICAgICAgICB4ICAgeHh4eHggICB4eHh4eHggICAgICB4ICAgICAgICAgICAgICAgICAgICBcIixcclxuICAgIFwiICAgIHggeCAgICAgIHggICAgICAgICB4ICAgICAgIHh4IG8geHggICAgICAgICB4ICAgICB4ICAgICAgICAgICAgICAgeCAgICAgbyAgICAgeCB4ICAgICAgICAgeCAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiEhISF4IHghISEhISF4ICAgICAgICAgeCEhISEhIXh4ICAgICB4eCEhISEhISEheHggICAgeCEhISEhISEhISEgICAgIHggICAgID0gICAgIHggeCAgICAgICAgIHggICAgICAgICAgICAgICAgICAgIFwiLFxyXG4gICAgXCIhISEheCB4ISEhISEheCAgICAgICAgIHghISEhIXh4ICAgICAgIHh4eHh4eHh4eHggICAgIHghISEhISEheHghICAgICB4eHh4eHh4eHh4eHh4IHh4ICBvIG8gIHh4ICAgICAgICAgICAgICAgICAgICBcIixcclxuICAgIFwiISEhIXggeCEhISEhIXggICAgICAgICB4ISEhISF4ICAgIG8gICAgICAgICAgICAgICAgIHh4ISEhISEheHggISAgICAgICAgICAgICAgICAgICAgeHggICAgIHh4ICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiEhISF4IHghISEhISF4ICAgICAgICAgeCEhISEheCAgICAgICAgICAgICAgICAgICAgIHh4ISEhISEheHggICEgICAgICAgICAgICAgICAgICAgICB4eHh4eHh4ICAgICAgICAgICAgICAgICAgICAgIFwiLFxyXG4gICAgXCIhISEheCB4ISEhISEheCAgICAgICAgIHghISEhIXh4ICAgICAgIHh4eHh4eHh4eHh4eHh4ISEhISEheHggICAhICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIixcclxuICAgIFwiISEhIXggeCEhISEhIXggICAgICAgICB4ISEhISEheHh4eHh4eHh4ISEhISEhISEhISEhISEhISEheHggICAgISAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiEhISF4IHghISEhISF4ICAgICAgICAgeCEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEheHggICAgICEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiXHJcbiAgXSxcclxuICBbXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh4eCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggeCAgICAgICAgICAgICAgICAgISEhICAgICAgICAhISEgIHh4eCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggeCAgICAgICAgICAgICAgICAgIXghICAgICAgICAheCEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4eHggeHh4ICAgICAgICAgICAgICAgIHggICAgICAgICAgeCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgIHggICAgICAgICAgICAgICAgIHggICBvb29vICAgeCAgICAgICB4eHggICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgIHggICAgICAgICAgICAgICAgIHggICAgICAgICAgeCAgICAgIHghISF4ICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgIHggICAgICAgICAgICAgICAgIHh4eHh4eHh4eHh4eCAgICAgICB4eHggICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4eCAgIHh4ICAgICAgeCAgIHggICAgICB4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgIHh4eHh4eHh4eCAgIHh4eHh4eHh4ICAgICAgICAgICAgICB4IHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgIHggICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgIHghISF4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgIHggICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICB4eHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4eCAgIHh4ICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgIHg9ID0gPSA9ICAgIHggICAgICAgICAgICB4eHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgIHggICAgICAgICAgIHggICAgICAgICAgIHghISF4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgIHggICAgPSA9ID0gPXggICAgIG8gICAgICB4eHggICAgICAgeHh4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4eCAgIHh4ICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICB4ISEheCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8gICBvICAgeCAgIHggICAgICAgICAgIHggICAgIHggICAgICAgICAgICAgICAgeHh2ICAgICAgICB4eHggICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgIHggICAgICAgICAgIHggICAgICAgICAgICAgIHggICAgICAgICAgICAgICAgIHghISF4ICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHh4IHh4eCB4eHggeHh4ICAgICBvIG8gIHghISEhISEhISEhISEhIXggICAgICAgICAgICAgICAgICAgdnggICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCB4eHggeCB4IHh4eCB4ICAgICAgICAgIHghISEhISEhISEhISEhIXggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgICAgICAgICAgICB4ICAgeHh4eHh4eHh4eHh4eHh4eHh4eHh4eHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeHggICAgICAgICAgIHh4ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4eHggICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgeHh4ICAgICAgICAgICAgICAgICAgICAgICAgIHggICAgIHggICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHghISF4ICAgICAgICAgICAgICAgIHh4eCAgXCIsXHJcbiAgICBcIiAgeCB4ICAgICAgICAgICAgICAgICAgICAgICAgIHggICAgeHh4ICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4eHggICAgICAgICAgICAgICAgIHggeCAgXCIsXHJcbiAgICBcIiAgeCAgICAgICAgICAgICAgICAgICAgICAgICAgIHggICAgeHh4ICAgIHh4eHh4eHggICAgICAgICAgICAgICAgICAgICAgICB4eHh4eCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgXCIsXHJcbiAgICBcIiAgeCAgICAgICAgICAgICAgICAgICAgICAgICAgIHggICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ICAgeCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgXCIsXHJcbiAgICBcIiAgeCAgICAgICAgICAgICAgICAgICAgICAgICAgIHh4ICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4IHggeCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgXCIsXHJcbiAgICBcIiAgeCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggICAgICAgfHh4eHh8ICAgIHx4eHh4fCAgICAgeHh4IHh4eCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeCAgXCIsXHJcbiAgICBcIiAgeCAgICAgICAgICAgICAgICB4eHggICAgICAgICAgICAgbyBvICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ICAgICAgICAgeHh4ICAgICAgICAgICAgICAgICAgICAgeCAgXCIsXHJcbiAgICBcIiAgeCAgICAgICAgICAgICAgIHh4eHh4ICAgICAgIHh4ICAgICAgICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgICAgIHh4eCAgICAgICB4ISEheCAgICAgICAgICB4ICAgICAgICAgeCAgXCIsXHJcbiAgICBcIiAgeCAgICAgICAgICAgICAgIG94eHhvICAgICAgIHggICAgeHh4ICAgIHggICAgICAgICAgICAgICAgICAgICAgICAgICAgIHggeCAgICAgICAgeHh4ICAgICAgICAgIHh4eCAgICAgICAgeCAgXCIsXHJcbiAgICBcIiAgeCAgICAgICAgICAgICAgICB4eHggICAgICAgIHh4eHh4eHh4eHh4eHggIHggb28geCAgICB4IG9vIHggICAgeCBvbyAgeHggeHggICAgICAgICAgICAgICAgICAgIHh4eCAgICAgICAgeCAgXCIsXHJcbiAgICBcIiAgeCAgICAgIEAgICAgICAgICAgeCAgICAgICAgIHggICAgICAgICAgIHghIXggICAgeCEhISF4ICAgIHghISEheCAgICB4eCAgIHh4ICAgICAgICAgICAgICAgICAgICB4ICAgICAgICAgeCAgXCIsXHJcbiAgICBcIiAgeHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHggICAgICAgICAgIHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4ICAgICB4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eCAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsXHJcbiAgICBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJcclxuICBdXTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gR0FNRV9MRVZFTFM7IiwiZnVuY3Rpb24gcnVuQW5pbWF0aW9uKGZyYW1lRnVuYykge1xyXG4gIHZhciBsYXN0VGltZSA9IG51bGw7XHJcbiAgZnVuY3Rpb24gZnJhbWUodGltZSkge1xyXG4gICAgdmFyIHN0b3AgPSBmYWxzZTtcclxuICAgIGlmIChsYXN0VGltZSAhPSBudWxsKSB7XHJcbiAgICAgIHZhciB0aW1lU3RlcCA9IE1hdGgubWluKHRpbWUgLSBsYXN0VGltZSwgMTAwKSAvIDEwMDA7XHJcbiAgICAgIHN0b3AgPSBmcmFtZUZ1bmModGltZVN0ZXApID09PSBmYWxzZTtcclxuICAgIH1cclxuICAgIGxhc3RUaW1lID0gdGltZTtcclxuICAgIGlmICghc3RvcClcclxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcclxuICB9XHJcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZyYW1lKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBydW5BbmltYXRpb247IiwidmFyIExldmVsID0gcmVxdWlyZSgnLi4vV29ybGQvTGV2ZWwnKTtcclxudmFyIHJ1bkxldmVsID0gcmVxdWlyZSgnLi9ydW5MZXZlbCcpO1xyXG52YXIgZWx0ID0gcmVxdWlyZSgnLi4vSGVscGVycy9lbHQnKTtcclxuXHJcbmZ1bmN0aW9uIHJ1bkdhbWUocGxhbnMsIERpc3BsYXkpIHtcclxuICB2YXIgY291bnQgPSAzO1xyXG4gIHZhciBsaXZlcyAgPSBjb3VudDtcclxuICB2YXIgbGl2ZXNTcGFuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xpdmVzJyk7XHJcbiAgdmFyIGxldmVsU3BhbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZXZlbCcpO1xyXG5cclxuICBmdW5jdGlvbiBzdGFydExldmVsKG4pIHtcclxuICAgIGxpdmVzU3Bhbi50ZXh0Q29udGVudCA9IGxpdmVzO1xyXG4gICAgbGV2ZWxTcGFuLnRleHRDb250ZW50ID0gbisxO1xyXG5cclxuICAgIGlmIChsaXZlcyA+PSAxKSB7XHJcbiAgICAgIHJ1bkxldmVsKG5ldyBMZXZlbChwbGFuc1tuXSksIERpc3BsYXksIGZ1bmN0aW9uIChzdGF0dXMpIHtcclxuXHJcbiAgICAgICAgaWYgKHN0YXR1cyA9PSAnbG9zdCcpIHtcclxuICAgICAgICAgIGxpdmVzLS07XHJcbiAgICAgICAgICBpZiAobGl2ZXMgPD0gMCApIHtcclxuICAgICAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmJvZHkucXVlcnlTZWxlY3RvcignLmdhbWUtb3ZlcicpO1xyXG4gICAgICAgICAgICBkaXYuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XHJcbiAgICAgICAgICAgIC8vdmFyIHlvdUxvc3QgPSBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGVsdCgnZGl2JywgJ2dhbWUtb3ZlcicpKS5hcHBlbmRDaGlsZChlbHQoJ2RpdicsICd0YWJsZUJsb2NrJykpO1xyXG4gICAgICAgICAgICAvL3ZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0dBTUUgT1ZFUlxcbkdBTUUgT1ZFUicpO1xyXG4gICAgICAgICAgICAvL3ZhciB0ZXh0MiA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdHQU1FIE9WRVInKTtcclxuICAgICAgICAgICAgLy95b3VMb3N0LmFwcGVuZENoaWxkKHRleHQpO1xyXG4gICAgICAgICAgICAvL3lvdUxvc3QuYXBwZW5kQ2hpbGQodGV4dDIpO1xyXG5cclxuICAgICAgICAgICAgYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09IDMyKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZ2FtZU92ZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZ2FtZS1vdmVyJyk7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGdhbWVPdmVyKTtcclxuICAgICAgICAgICAgICAgIGxpdmVzICA9IGNvdW50O1xyXG4gICAgICAgICAgICAgICAgc3RhcnRMZXZlbCgwKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHN0YXJ0TGV2ZWwobik7XHJcblxyXG4gICAgICAgIH0gZWxzZSBpZiAobiA8IHBsYW5zLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgIHN0YXJ0TGV2ZWwobiArIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgIHZhciB5b3VXaW4gPSBkb2N1bWVudC5ib2R5LnF1ZXJ5U2VsZWN0b3IoJy5nYW1lLXdpbicpO1xyXG4gICAgICAgICAgeW91V2luLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xyXG5cclxuICAgICAgICAgIGFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT0gMzIpIHtcclxuICAgICAgICAgICAgICB2YXIgZ2FtZVdpbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5nYW1lLXdpbicpO1xyXG4gICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZ2FtZVdpbiApO1xyXG4gICAgICAgICAgICAgIGxpdmVzICA9IGNvdW50O1xyXG4gICAgICAgICAgICAgIHN0YXJ0TGV2ZWwoMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG4gIH1cclxuICBzdGFydExldmVsKDApO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJ1bkdhbWU7XHJcblxyXG4vL2FkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLGZ1bmN0aW9uKGV2ZW50KXtcclxuLy8gIGNvbnNvbGUubG9nKGV2ZW50LndoaWNoKTtcclxuLy99KTsiLCJ2YXIgcnVuQW5pbWF0aW9uID0gcmVxdWlyZSgnLi9ydW5BbmltYXRpb24nKTtcclxudmFyIHRyYWNrS2V5cyA9IHJlcXVpcmUoJy4uL0hlbHBlcnMvdHJhY2tLZXlzJyk7XHJcbnZhciBhcnJvd0NvZGVzID0gcmVxdWlyZSgnLi4vSGVscGVycy9hcnJvd0NvZGVzJyk7XHJcbnZhciBMZXZlbCA9IHJlcXVpcmUoJy4uL1dvcmxkL0xldmVsJyk7XHJcblxyXG5mdW5jdGlvbiBydW5MZXZlbChsZXZlbCwgRGlzcGxheSwgYW5kVGhlbikge1xyXG4gIHZhciBkaXNwbGF5ID0gbmV3IERpc3BsYXkoZG9jdW1lbnQuYm9keSwgbGV2ZWwpO1xyXG4gIHZhciBydW5uaW5nID0gXCJ5ZXNcIjtcclxuICBmdW5jdGlvbiBoYW5kbGVLZXkoZXZlbnQpIHtcclxuICAgIGlmIChldmVudC5rZXlDb2RlID09IDI3KSB7XHJcbiAgICAgIGlmIChydW5uaW5nID09IFwibm9cIikge1xyXG4gICAgICAgIHJ1bm5pbmcgPSBcInllc1wiO1xyXG4gICAgICAgIHJ1bkFuaW1hdGlvbihhbmltYXRpb24pO1xyXG4gICAgICB9IGVsc2UgaWYgKHJ1bm5pbmcgPT0gXCJwYXVzaW5nXCIpIHtcclxuICAgICAgICBydW5uaW5nID0gXCJ5ZXNcIjtcclxuICAgICAgfSBlbHNlIGlmIChydW5uaW5nID09IFwieWVzXCIpIHtcclxuICAgICAgICBydW5uaW5nID0gXCJwYXVzaW5nXCI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbiAgYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIiwgaGFuZGxlS2V5KTtcclxuICB2YXIgYXJyb3dzID0gdHJhY2tLZXlzKGFycm93Q29kZXMpO1xyXG4gIGZ1bmN0aW9uIGFuaW1hdGlvbihzdGVwKSB7XHJcbiAgICBpZiAocnVubmluZyA9PSBcInBhdXNpbmdcIikge1xyXG4gICAgICBydW5uaW5nID0gXCJub1wiO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICBsZXZlbC5hbmltYXRlKHN0ZXAsIGFycm93cyk7XHJcbiAgICBkaXNwbGF5LmRyYXdGcmFtZShzdGVwKTtcclxuICAgIGlmIChsZXZlbC5pc0ZpbmlzaGVkKCkpIHtcclxuICAgICAgZGlzcGxheS5jbGVhcigpO1xyXG4gICAgICByZW1vdmVFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBoYW5kbGVLZXkpO1xyXG5cclxuICAgICAgaWYgKGFuZFRoZW4pXHJcbiAgICAgICAgYW5kVGhlbihsZXZlbC5zdGF0dXMpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJ1bkFuaW1hdGlvbihhbmltYXRpb24pO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJ1bkxldmVsOyIsInZhciBmbGlwSG9yaXpvbnRhbGx5ID0gcmVxdWlyZSgnLi4vSGVscGVycy9mbGlwSG9yaXpvbnRhbGx5Jyk7XHJcblxyXG5mdW5jdGlvbiBDYW52YXNEaXNwbGF5KHBhcmVudCwgbGV2ZWwpIHtcclxuICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XHJcbiAgdGhpcy5jYW52YXMud2lkdGggPSBNYXRoLm1pbig2MDAsIGxldmVsLndpZHRoICogc2NhbGUpO1xyXG4gIHRoaXMuY2FudmFzLmhlaWdodCA9IE1hdGgubWluKDQ1MCwgbGV2ZWwuaGVpZ2h0ICogc2NhbGUpO1xyXG4gIHBhcmVudC5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XHJcbiAgdGhpcy5jeCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcclxuXHJcbiAgdGhpcy5sZXZlbCA9IGxldmVsO1xyXG4gIHRoaXMuYW5pbWF0aW9uVGltZSA9IDA7XHJcbiAgdGhpcy5mbGlwUGxheWVyID0gZmFsc2U7XHJcblxyXG4gIHRoaXMudmlld3BvcnQgPSB7XHJcbiAgICBsZWZ0OiAwLFxyXG4gICAgdG9wOiAwLFxyXG4gICAgd2lkdGg6IHRoaXMuY2FudmFzLndpZHRoIC8gc2NhbGUsXHJcbiAgICBoZWlnaHQ6IHRoaXMuY2FudmFzLmhlaWdodCAvIHNjYWxlXHJcbiAgfTtcclxuXHJcbiAgdGhpcy5kcmF3RnJhbWUoMCk7XHJcbn1cclxuXHJcbnZhciBzY2FsZSA9IDIwO1xyXG5cclxuQ2FudmFzRGlzcGxheS5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcclxuICB0aGlzLmNhbnZhcy5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuY2FudmFzKTtcclxufTtcclxuXHJcbkNhbnZhc0Rpc3BsYXkucHJvdG90eXBlLmRyYXdGcmFtZSA9IGZ1bmN0aW9uKHN0ZXApIHtcclxuICB0aGlzLmFuaW1hdGlvblRpbWUgKz0gc3RlcDtcclxuXHJcbiAgdGhpcy51cGRhdGVWaWV3cG9ydCgpO1xyXG4gIHRoaXMuY2xlYXJEaXNwbGF5KCk7XHJcbiAgdGhpcy5kcmF3QmFja2dyb3VuZCgpO1xyXG4gIHRoaXMuZHJhd0FjdG9ycygpO1xyXG59O1xyXG5cclxuQ2FudmFzRGlzcGxheS5wcm90b3R5cGUudXBkYXRlVmlld3BvcnQgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgdmlldyA9IHRoaXMudmlld3BvcnQsIG1hcmdpbiA9IHZpZXcud2lkdGggLyAzO1xyXG4gIHZhciBwbGF5ZXIgPSB0aGlzLmxldmVsLnBsYXllcjtcclxuICB2YXIgY2VudGVyID0gcGxheWVyLnBvcy5wbHVzKHBsYXllci5zaXplLnRpbWVzKDAuNSkpO1xyXG5cclxuICBpZiAoY2VudGVyLnggPCB2aWV3LmxlZnQgKyBtYXJnaW4pXHJcbiAgICB2aWV3LmxlZnQgPSBNYXRoLm1heChjZW50ZXIueCAtIG1hcmdpbiwgMCk7XHJcbiAgZWxzZSBpZiAoY2VudGVyLnggPiB2aWV3LmxlZnQgKyB2aWV3LndpZHRoIC0gbWFyZ2luKVxyXG4gICAgdmlldy5sZWZ0ID0gTWF0aC5taW4oY2VudGVyLnggKyBtYXJnaW4gLSB2aWV3LndpZHRoLFxyXG4gICAgICB0aGlzLmxldmVsLndpZHRoIC0gdmlldy53aWR0aCk7XHJcbiAgaWYgKGNlbnRlci55IDwgdmlldy50b3AgKyBtYXJnaW4pXHJcbiAgICB2aWV3LnRvcCA9IE1hdGgubWF4KGNlbnRlci55IC0gbWFyZ2luLCAwKTtcclxuICBlbHNlIGlmIChjZW50ZXIueSA+IHZpZXcudG9wICsgdmlldy5oZWlnaHQgLSBtYXJnaW4pXHJcbiAgICB2aWV3LnRvcCA9IE1hdGgubWluKGNlbnRlci55ICsgbWFyZ2luIC0gdmlldy5oZWlnaHQsXHJcbiAgICAgIHRoaXMubGV2ZWwuaGVpZ2h0IC0gdmlldy5oZWlnaHQpO1xyXG59O1xyXG5cclxuQ2FudmFzRGlzcGxheS5wcm90b3R5cGUuY2xlYXJEaXNwbGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgaWYgKHRoaXMubGV2ZWwuc3RhdHVzID09IFwid29uXCIpXHJcbiAgICB0aGlzLmN4LmZpbGxTdHlsZSA9IFwicmdiKDY4LCAxOTEsIDI1NSlcIjtcclxuICBlbHNlIGlmICh0aGlzLmxldmVsLnN0YXR1cyA9PSBcImxvc3RcIilcclxuICAgIHRoaXMuY3guZmlsbFN0eWxlID0gXCJyZ2IoNDQsIDEzNiwgMjE0KVwiO1xyXG4gIGVsc2VcclxuICAgIHRoaXMuY3guZmlsbFN0eWxlID0gXCJyZ2IoNTIsIDE2NiwgMjUxKVwiO1xyXG4gIHRoaXMuY3guZmlsbFJlY3QoMCwgMCxcclxuICAgIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xyXG59O1xyXG5cclxudmFyIG90aGVyU3ByaXRlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XHJcbm90aGVyU3ByaXRlcy5zcmMgPSBcImltZy9zcHJpdGVzLnBuZ1wiO1xyXG5cclxuQ2FudmFzRGlzcGxheS5wcm90b3R5cGUuZHJhd0JhY2tncm91bmQgPSBmdW5jdGlvbigpIHtcclxuICB2YXIgdmlldyA9IHRoaXMudmlld3BvcnQ7XHJcbiAgdmFyIHhTdGFydCA9IE1hdGguZmxvb3Iodmlldy5sZWZ0KTtcclxuICB2YXIgeEVuZCA9IE1hdGguY2VpbCh2aWV3LmxlZnQgKyB2aWV3LndpZHRoKTtcclxuICB2YXIgeVN0YXJ0ID0gTWF0aC5mbG9vcih2aWV3LnRvcCk7XHJcbiAgdmFyIHlFbmQgPSBNYXRoLmNlaWwodmlldy50b3AgKyB2aWV3LmhlaWdodCk7XHJcblxyXG4gIGZvciAodmFyIHkgPSB5U3RhcnQ7IHkgPCB5RW5kOyB5KyspIHtcclxuICAgIGZvciAodmFyIHggPSB4U3RhcnQ7IHggPCB4RW5kOyB4KyspIHtcclxuICAgICAgdmFyIHRpbGUgPSB0aGlzLmxldmVsLmdyaWRbeV1beF07XHJcbiAgICAgIGlmICh0aWxlID09IG51bGwpIGNvbnRpbnVlO1xyXG4gICAgICB2YXIgc2NyZWVuWCA9ICh4IC0gdmlldy5sZWZ0KSAqIHNjYWxlO1xyXG4gICAgICB2YXIgc2NyZWVuWSA9ICh5IC0gdmlldy50b3ApICogc2NhbGU7XHJcbiAgICAgIHZhciB0aWxlWCA9IHRpbGUgPT0gXCJsYXZhXCIgPyBzY2FsZSA6IDA7XHJcbiAgICAgIHRoaXMuY3guZHJhd0ltYWdlKG90aGVyU3ByaXRlcyxcclxuICAgICAgICB0aWxlWCwgICAgICAgICAwLCBzY2FsZSwgc2NhbGUsXHJcbiAgICAgICAgc2NyZWVuWCwgc2NyZWVuWSwgc2NhbGUsIHNjYWxlKTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG52YXIgcGxheWVyU3ByaXRlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XHJcbnBsYXllclNwcml0ZXMuc3JjID0gXCJpbWcvcGxheWVyLnBuZ1wiO1xyXG52YXIgcGxheWVyWE92ZXJsYXAgPSA0O1xyXG5cclxuQ2FudmFzRGlzcGxheS5wcm90b3R5cGUuZHJhd1BsYXllciA9IGZ1bmN0aW9uKHgsIHksIHdpZHRoLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0KSB7XHJcbiAgdmFyIHNwcml0ZSA9IDgsIHBsYXllciA9IHRoaXMubGV2ZWwucGxheWVyO1xyXG4gIHdpZHRoICs9IHBsYXllclhPdmVybGFwICogMjtcclxuICB4IC09IHBsYXllclhPdmVybGFwO1xyXG4gIGlmIChwbGF5ZXIuc3BlZWQueCAhPSAwKVxyXG4gICAgdGhpcy5mbGlwUGxheWVyID0gcGxheWVyLnNwZWVkLnggPCAwO1xyXG5cclxuICBpZiAocGxheWVyLnNwZWVkLnkgIT0gMClcclxuICAgIHNwcml0ZSA9IDk7XHJcbiAgZWxzZSBpZiAocGxheWVyLnNwZWVkLnggIT0gMClcclxuICAgIHNwcml0ZSA9IE1hdGguZmxvb3IodGhpcy5hbmltYXRpb25UaW1lICogMTIpICUgODtcclxuXHJcbiAgdGhpcy5jeC5zYXZlKCk7XHJcbiAgaWYgKHRoaXMuZmxpcFBsYXllcilcclxuICAgIGZsaXBIb3Jpem9udGFsbHkodGhpcy5jeCwgeCArIHdpZHRoIC8gMik7XHJcblxyXG4gIHRoaXMuY3guZHJhd0ltYWdlKHBsYXllclNwcml0ZXMsXHJcbiAgICBzcHJpdGUgKiB3aWR0aCwgMCwgd2lkdGgsIGhlaWdodCxcclxuICAgIHgsICAgICAgICAgICAgICB5LCB3aWR0aCwgaGVpZ2h0KTtcclxuXHJcbiAgdGhpcy5jeC5yZXN0b3JlKCk7XHJcbn07XHJcblxyXG5DYW52YXNEaXNwbGF5LnByb3RvdHlwZS5kcmF3QWN0b3JzID0gZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5sZXZlbC5hY3RvcnMuZm9yRWFjaChmdW5jdGlvbihhY3Rvcikge1xyXG4gICAgdmFyIHdpZHRoID0gYWN0b3Iuc2l6ZS54ICogc2NhbGU7XHJcbiAgICB2YXIgaGVpZ2h0ID0gYWN0b3Iuc2l6ZS55ICogc2NhbGU7XHJcbiAgICB2YXIgeCA9IChhY3Rvci5wb3MueCAtIHRoaXMudmlld3BvcnQubGVmdCkgKiBzY2FsZTtcclxuICAgIHZhciB5ID0gKGFjdG9yLnBvcy55IC0gdGhpcy52aWV3cG9ydC50b3ApICogc2NhbGU7XHJcbiAgICBpZiAoYWN0b3IudHlwZSA9PSBcInBsYXllclwiKSB7XHJcbiAgICAgIHRoaXMuZHJhd1BsYXllcih4LCB5LCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHZhciB0aWxlWCA9IChhY3Rvci50eXBlID09IFwiY29pblwiID8gMiA6IDEpICogc2NhbGU7XHJcbiAgICAgIHRoaXMuY3guZHJhd0ltYWdlKG90aGVyU3ByaXRlcyxcclxuICAgICAgICB0aWxlWCwgMCwgd2lkdGgsIGhlaWdodCxcclxuICAgICAgICB4LCAgICAgeSwgd2lkdGgsIGhlaWdodCk7XHJcbiAgICB9XHJcbiAgfSwgdGhpcyk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhc0Rpc3BsYXk7IiwidmFyIGFjdG9yQ2hhcnMgPSByZXF1aXJlKCcuLi9IZWxwZXJzL2FjdG9yQ2hhcnMuanMnKTtcclxudmFyIFZlY3RvciA9IHJlcXVpcmUoJy4vVmVjdG9yJyk7XHJcblxyXG5mdW5jdGlvbiBMZXZlbChwbGFuKSB7XHJcbiAgdGhpcy53aWR0aCA9IHBsYW5bMF0ubGVuZ3RoO1xyXG4gIHRoaXMuaGVpZ2h0ID0gcGxhbi5sZW5ndGg7XHJcbiAgdGhpcy5ncmlkID0gW107XHJcbiAgdGhpcy5hY3RvcnMgPSBbXTtcclxuXHJcbiAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XHJcbiAgICB2YXIgbGluZSA9IHBsYW5beV0sIGdyaWRMaW5lID0gW107XHJcbiAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xyXG4gICAgICB2YXIgY2ggPSBsaW5lW3hdLCBmaWVsZFR5cGUgPSBudWxsO1xyXG4gICAgICB2YXIgQWN0b3IgPSBhY3RvckNoYXJzW2NoXTtcclxuICAgICAgaWYgKEFjdG9yKSB7XHJcbiAgICAgICAgdGhpcy5hY3RvcnMucHVzaChuZXcgQWN0b3IobmV3IFZlY3Rvcih4LCB5KSwgY2gpKTtcclxuICAgICAgfSBlbHNlIGlmIChjaCA9PSAneCcpIHtcclxuICAgICAgICBmaWVsZFR5cGUgPSAnd2FsbCc7XHJcbiAgICAgIH0gZWxzZSBpZiAoY2ggPT0gJyEnKSB7XHJcbiAgICAgICAgZmllbGRUeXBlID0gJ2xhdmEnO1xyXG4gICAgICB9XHJcbiAgICAgIGdyaWRMaW5lLnB1c2goZmllbGRUeXBlKTtcclxuICAgIH1cclxuICAgIHRoaXMuZ3JpZC5wdXNoKGdyaWRMaW5lKTtcclxuICB9XHJcblxyXG4gIHRoaXMucGxheWVyID0gdGhpcy5hY3RvcnMuZmlsdGVyKGZ1bmN0aW9uKGFjdG9yKSB7XHJcbiAgICByZXR1cm4gYWN0b3IudHlwZSA9PSAncGxheWVyJztcclxuICB9KVswXTtcclxuICB0aGlzLnN0YXR1cyA9IHRoaXMuZmluaXNoRGVsYXkgPSBudWxsO1xyXG59XHJcblxyXG5MZXZlbC5wcm90b3R5cGUuaXNGaW5pc2hlZCA9IGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiB0aGlzLnN0YXR1cyAhPSBudWxsICYmIHRoaXMuZmluaXNoRGVsYXkgPCAwO1xyXG59O1xyXG5cclxuXHJcbkxldmVsLnByb3RvdHlwZS5vYnN0YWNsZUF0ID0gZnVuY3Rpb24ocG9zLCBzaXplKSB7XHJcbiAgdmFyIHhTdGFydCA9IE1hdGguZmxvb3IocG9zLngpO1xyXG4gIHZhciB4RW5kID0gTWF0aC5jZWlsKHBvcy54ICsgc2l6ZS54KTtcclxuICB2YXIgeVN0YXJ0ID0gTWF0aC5mbG9vcihwb3MueSk7XHJcbiAgdmFyIHlFbmQgPSBNYXRoLmNlaWwocG9zLnkgKyBzaXplLnkpO1xyXG5cclxuICBpZiAoeFN0YXJ0IDwgMCB8fCB4RW5kID4gdGhpcy53aWR0aCB8fCB5U3RhcnQgPCAwKVxyXG4gICAgcmV0dXJuICd3YWxsJztcclxuICBpZiAoeUVuZCA+IHRoaXMuaGVpZ2h0KVxyXG4gICAgcmV0dXJuICdsYXZhJztcclxuICBmb3IgKHZhciB5ID0geVN0YXJ0OyB5IDwgeUVuZDsgeSsrKSB7XHJcbiAgICBmb3IgKHZhciB4ID0geFN0YXJ0OyB4IDwgeEVuZDsgeCsrKSB7XHJcbiAgICAgIHZhciBmaWVsZFR5cGUgPSB0aGlzLmdyaWRbeV1beF07XHJcbiAgICAgIGlmIChmaWVsZFR5cGUpIHJldHVybiBmaWVsZFR5cGU7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuTGV2ZWwucHJvdG90eXBlLmFjdG9yQXQgPSBmdW5jdGlvbihhY3Rvcikge1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hY3RvcnMubGVuZ3RoOyBpKyspIHtcclxuICAgIHZhciBvdGhlciA9IHRoaXMuYWN0b3JzW2ldO1xyXG4gICAgaWYgKG90aGVyICE9IGFjdG9yICYmXHJcbiAgICAgIGFjdG9yLnBvcy54ICsgYWN0b3Iuc2l6ZS54ID4gb3RoZXIucG9zLnggJiZcclxuICAgICAgYWN0b3IucG9zLnggPCBvdGhlci5wb3MueCArIG90aGVyLnNpemUueCAmJlxyXG4gICAgICBhY3Rvci5wb3MueSArIGFjdG9yLnNpemUueSA+IG90aGVyLnBvcy55ICYmXHJcbiAgICAgIGFjdG9yLnBvcy55IDwgb3RoZXIucG9zLnkgKyBvdGhlci5zaXplLnkpXHJcbiAgICAgIHJldHVybiBvdGhlcjtcclxuICB9XHJcbn07XHJcblxyXG52YXIgbWF4U3RlcCA9IDAuMDU7XHJcblxyXG5MZXZlbC5wcm90b3R5cGUuYW5pbWF0ZSA9IGZ1bmN0aW9uKHN0ZXAsIGtleXMpIHtcclxuICBpZiAodGhpcy5zdGF0dXMgIT0gbnVsbClcclxuICAgIHRoaXMuZmluaXNoRGVsYXkgLT0gc3RlcDtcclxuXHJcbiAgd2hpbGUgKHN0ZXAgPiAwKSB7XHJcbiAgICB2YXIgdGhpc1N0ZXAgPSBNYXRoLm1pbihzdGVwLCBtYXhTdGVwKTtcclxuICAgIHRoaXMuYWN0b3JzLmZvckVhY2goZnVuY3Rpb24oYWN0b3IpIHtcclxuICAgICAgYWN0b3IuYWN0KHRoaXNTdGVwLCB0aGlzLCBrZXlzKTtcclxuICAgIH0sIHRoaXMpO1xyXG4gICAgc3RlcCAtPSB0aGlzU3RlcDtcclxuICB9XHJcbn07XHJcblxyXG5MZXZlbC5wcm90b3R5cGUucGxheWVyVG91Y2hlZCA9IGZ1bmN0aW9uKHR5cGUsIGFjdG9yKSB7XHJcbiAgaWYgKHR5cGUgPT0gJ2xhdmEnICYmIHRoaXMuc3RhdHVzID09IG51bGwpIHtcclxuICAgIHRoaXMuc3RhdHVzID0gJ2xvc3QnO1xyXG4gICAgdGhpcy5maW5pc2hEZWxheSA9IDE7XHJcbiAgfSBlbHNlIGlmICh0eXBlID09ICdjb2luJykge1xyXG4gICAgdGhpcy5hY3RvcnMgPSB0aGlzLmFjdG9ycy5maWx0ZXIoZnVuY3Rpb24ob3RoZXIpIHtcclxuICAgICAgcmV0dXJuIG90aGVyICE9IGFjdG9yO1xyXG4gICAgfSk7XHJcbiAgICBpZiAoIXRoaXMuYWN0b3JzLnNvbWUoZnVuY3Rpb24oYWN0b3IpIHtcclxuICAgICAgICByZXR1cm4gYWN0b3IudHlwZSA9PSAnY29pbic7XHJcbiAgICAgIH0pKSB7XHJcbiAgICAgIHRoaXMuc3RhdHVzID0gJ3dvbic7XHJcbiAgICAgIHRoaXMuZmluaXNoRGVsYXkgPSAxO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTGV2ZWw7IiwiZnVuY3Rpb24gVmVjdG9yKHgsIHkpIHtcclxuICB0aGlzLnggPSB4OyB0aGlzLnkgPSB5O1xyXG59XHJcblZlY3Rvci5wcm90b3R5cGUucGx1cyA9IGZ1bmN0aW9uKG90aGVyKSB7XHJcbiAgcmV0dXJuIG5ldyBWZWN0b3IodGhpcy54ICsgb3RoZXIueCwgdGhpcy55ICsgb3RoZXIueSk7XHJcbn07XHJcblZlY3Rvci5wcm90b3R5cGUudGltZXMgPSBmdW5jdGlvbihmYWN0b3IpIHtcclxuICByZXR1cm4gbmV3IFZlY3Rvcih0aGlzLnggKiBmYWN0b3IsIHRoaXMueSAqIGZhY3Rvcik7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFZlY3RvcjsiLCJcclxudmFyIHJ1bkdhbWUgPSByZXF1aXJlKCcuL1J1bm5lcnMvcnVuR2FtZScpO1xyXG52YXIgR0FNRV9MRVZFTFMgPSByZXF1aXJlKCcuL0xldmVscy9sZXZlbCcpO1xyXG4vL3ZhciBET01EaXNwbGF5ID0gcmVxdWlyZSgnLi9Xb3JsZC9ET01EaXNwbGF5Jyk7XHJcbnZhciBDYW52YXNEaXNwbGF5ID0gcmVxdWlyZSgnLi9Xb3JsZC9DYW52YXNEaXNwbGF5Jyk7XHJcblxyXG5ydW5HYW1lKEdBTUVfTEVWRUxTLCBDYW52YXNEaXNwbGF5KTsiXX0=
