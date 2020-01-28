const random = {
  floor: function(max) {
    return Math.floor(Math.random() * max);
  },
  shuffle: function(array) {
    let currentIndex = array.length;
    let temporaryValue = null;
    let randomIndex = null;

    while (0 !== currentIndex) {
      randomIndex = this.floor(currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  }
}

export default random;