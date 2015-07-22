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