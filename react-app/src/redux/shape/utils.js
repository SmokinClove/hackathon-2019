export {
  getBoundingBox
}

/**
 * @typedef {{x, y}} Point
 */

 /**
 * @param {Array<Array<Point>>} arrayOfArrayOfPoint
 */
function getBoundingBox(arrayOfArrayOfPoint) {
  const boundingBox = {
    top: Number.POSITIVE_INFINITY,
    left: Number.POSITIVE_INFINITY,
    bottom: Number.NEGATIVE_INFINITY,
    right: Number.NEGATIVE_INFINITY,
  }
  arrayOfArrayOfPoint.forEach(
    arrayOfPoint => arrayOfPoint.forEach(point => {
      if (point.x < boundingBox.left) {
        boundingBox.left = point.x;
      }
      if (point.x > boundingBox.right) {
        boundingBox.right = point.x;
      }
      if (point.y < boundingBox.top) {
        boundingBox.top = point.y;
      }
      if (point.y > boundingBox.bottom) {
        boundingBox.bottom = point.y;
      }
  }));

  return boundingBox;
}
