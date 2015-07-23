var main = require('./js/main.js'),

  // Entity
  Coin = require('./js/Entity/Coin'),
  Lava = require('./js/Entity/Lava'),
  Player = require('./js/Entity/Player'),

  // Helpers
  actorChars = require('./js/Helpers/actorChars'),
  arrowCodes = require('./js/Helpers/arrowCodes'),
  elt = require('./js/Helpers/elt'),
  trackKeys = require('./js/Helpers/trackKeys'),

  // Levels
  level = require('./js/Levels/level'),

  // Runners
  runAnimation = require('./js/Runners/runAnimation'),
  runGame = require('./js/Runners/runGame'),
  runLevel = require('./js/Runners/runLevel'),

  // World
  Vector = require('./js/World/Vector'),
  Level = require('./js/World/Level'),
  DOMDisplay = require('./js/World/DOMDisplay'),

  // others
  expect =  require('expect.js'),
  chai =  require('chai'),
  sinon = require('sinon');


describe('Project: A Platform Game', function() {
  describe('#Coin', function() {
    it('method "type" should return string "coin"', function() {
      expect(Coin.prototype.type).to.equal('coin');
    });

  });

  describe('#Vector', function() {
    var pos = new Vector(3, 4);
    var testObj = {x: 3, y: 4};
    var testObj2 = {x: 5, y: 9};
    var testObj3 = {x: 6, y: 8};
    var maxStep = 2;
    it('should return object', function() {
      expect(pos).to.be.a('object');
    });

    it('should return object with values', function() {
      expect(pos).to.eql(testObj)
    });

    it('should plus values with new Vector', function() {
      expect(pos.plus(new Vector(2, 5))).to.eql(testObj2);
    });

    it('should contains all of the passed-in keys', function() {
      expect(pos).to.have.keys('x', 'y');
    });

    it('function times() should return new Vector with multiplying values to maxStep', function() {
      expect(pos.times(maxStep)).to.eql(testObj3)
    });

    it('Should return null if constructor parameters is null', function () {
      expect(function () {
        var testVector = new Vector(null);
      }).to.be.null;
    });

    it('Should throw an Error if constructor parameters is undefined', function () {
      expect(function () {
        var testVector = new Vector(undefined);
      }).to.throwError();
    });

    it('Should throw an Error if constructor parameters has wrong argument length', function () {
      expect(function () {
        var testVector = new Vector(2);
      }).to.throwError();
    });

  });

  describe('arrowCodes', function () {
    it('Should be an Object', function () {
      expect(arrowCodes).to.be.a('object');
    });

    it('Should contains left key code', function () {
      expect(arrowCodes[37]).to.equal('left');
    });

    it('Should contains up key code', function () {
      expect(arrowCodes[38]).to.equal('up');
    });

    it('Should contains right key code', function () {
      expect(arrowCodes[39]).to.equal('right');
    });
  });

  describe('Level', function () {
    it('Should has method "obstacleAt"', function () {
      var test = new Level(level);
      chai.expect(test).to.respondTo('obstacleAt');
    });

    it('Should has method "actorAt"', function () {
      var test = new Level(level);
      chai.expect(test).to.respondTo('actorAt');
    });

    it('Should has method "animate"', function () {
      var test = new Level(level);
      chai.expect(test).to.respondTo('animate');
    });

    it('Should has method "playerTouched"', function () {
      var test = new Level(level);
      chai.expect(test).to.respondTo('playerTouched');
    });

    it('Should throw an Error if input parameters is not array', function () {
      var test = '  x';
      expect(function(){Level(test)}).to.throwError();
    });

    it('Each level should contain corresponding symbols for Coins', function () {
      var coinChar = 'o';
      var correct = [];

      for (var count = 0; count < level.length; count++) {
        var lev = level[count];
        var currentLevel = [];

        for (var i = 0; i < lev.length; i++) {
          if (lev[i].indexOf(coinChar) >= 0) {
            currentLevel.push(true);
          } else {
            currentLevel.push(false);
          }
        }

        if (currentLevel.indexOf(true) >= 0) {
          correct.push(true);
        } else {
          correct.push(false);
        }
      }

      expect(correct.indexOf(false)).to.equal(-1);
    });
  });
});