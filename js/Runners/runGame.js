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