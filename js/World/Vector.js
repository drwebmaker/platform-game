function Vector(x, y) {
  if(arguments.length == 2) {
    if(x != null || y != null || x != undefined || y != undefined) {
      this.x = x;
      this.y = y;
    } else {
      throw new Error('Unexpected Vector constructor parameters');
    }
  } else {
    throw new Error('Wrong numbers of arguments');
  }


}
Vector.prototype.plus = function(other) {
  return new Vector(this.x + other.x, this.y + other.y);
};
Vector.prototype.times = function(factor) {
  return new Vector(this.x * factor, this.y * factor);
};

module.exports = Vector;