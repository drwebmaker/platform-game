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