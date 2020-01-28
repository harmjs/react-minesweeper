import IVect2D from './IVect2D';

const Array2D = function(size, array2D) {
  this._size = size;
  this.array2D = array2D;
};

Array2D.prototype.toArray = function() {
  return this.array2D
    .reduce((prev, current) => prev.concat(current));
};

Array2D.prototype.toMap = function(serializeItem) {
  return this.toArray()
    .reduce((map, item) => {
      map.set(serializeItem(item), item);
      return map;
    }, new Map());
};

Array2D.prototype.map = function(callback) {
  return this.array2D.map(callback);
};

Array2D.fromIVect2D = function(iVect2D, callback = (x, y) => new IVect2D(x, y)) {
  const array2D = [...Array(iVect2D.x)]
    .map((_, xIndex) => [...Array(iVect2D.y)]
      .map((_, yIndex) => callback(xIndex, yIndex)));
  return new Array2D(iVect2D, array2D);
};

export default Array2D;