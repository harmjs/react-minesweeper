const IVect2D = function(x, y) {
  this.x = x;
  this.y = y;
};

IVect2D._splitChar = "_";
IVect2D.deserialize = function(string) {
  const [x , y] = string.split(IVect2D);
  return new IVect2D(x, y);
};

IVect2D.DIRECTION = { 
  NORTH: new IVect2D(1, 0),
  NORTH_EAST: new IVect2D(1, 1),
  EAST: new IVect2D(0, 1),
  SOUTH_EAST: new IVect2D(-1, 1),
  SOUTH: new IVect2D(0, -1),
  SOUTH_WEST: new IVect2D(-1, -1),
  WEST: new IVect2D(-1, 0),
  NORTH_WEST: new IVect2D(1, -1)
};

IVect2D.directions = Object.keys(IVect2D.DIRECTION)
  .map((key) => IVect2D.DIRECTION[key]);

IVect2D.prototype.neighbours = function() {
  return IVect2D.directions.map((direction) => direction.add(this));
};

IVect2D.prototype.serialize = function() {
  return this.x + IVect2D._splitChar + this.y;;
};

IVect2D.prototype.add = function(vect2d) {
  return new IVect2D(this.x + vect2d.x, this.y + vect2d.y);
};

IVect2D.prototype.subtract = function(vect2d) {
  return new IVect2D(this.x + vect2d.x, this.y + vect2d.y);
};

export default IVect2D;



