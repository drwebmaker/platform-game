var Level = require('../World/Level');
var runLevel = require('./runLevel');
var elt = require('../Helpers/elt');

function runGame(plans, Display) {
  var lives  = 3;
  var livesSpan = document.querySelector('#lives');
  var levelSpan = document.querySelector('#level');

  function startLevel(n) {
    livesSpan.textContent = lives;
    levelSpan.textContent = n+1;

    if (lives > 0) {
      runLevel(new Level(plans[n]), Display, function (status) {
        if (status == 'lost')
          startLevel(n);
        else if (n < plans.length - 1) {
          startLevel(n + 1);
        }
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
      addEventListener('keydown',function(event){
        console.log(event.which);
      });
    }
  }
  startLevel(0);
}

module.exports = runGame;

addEventListener('keydown',function(event){
  console.log(event.which);
});