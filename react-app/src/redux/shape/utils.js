export {
  getBoundingRect,
  getIn,
}

/**
 * @typedef {{x, y}} Point
 */

 /**
 * @param {Array<Array<Point>>} arrayOfArrayOfPoint
 */
function getBoundingRect(arrayOfArrayOfPoint) {
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

function getIn(obj, keyPath, defaultValue) {
  if (Array.isArray(keyPath) && keyPath.length) {
    const key = keyPath[0];
    if (!obj || !obj.hasOwnProperty(key)) {
      return defaultValue;
    }
    return getIn(obj[key], keyPath.slice(1), defaultValue);
  }
  return obj;
}
