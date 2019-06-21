import { getBoundingRect } from './utils';
import { fetchShapeTypeAPI } from './api';
import { FETCH_SHAPE_TYPE } from './actionType';

export {
  fetchShapeType
}

/**
 * @typedef {{x, y}} Point
 */

const IMAGE_SIZE = 220;
async function scaledDownDataUrl(canvas, boundingRect) {
  const context = canvas.getContext('2d');
  const { left, top, right, bottom} = boundingRect;
  const width = right - left;
  const height = bottom - top;
  const imageData = context.getImageData(left, top, width, height);

  const maxSize = Math.max(width, height);

  const newCanvas = document.createElement('canvas');
  newCanvas.setAttribute('width', maxSize);
  newCanvas.setAttribute('height', maxSize);
  const newContext = newCanvas.getContext('2d');
  const beginTop = (maxSize - height) / 2;
  const beginLeft = (maxSize - width) / 2;

  newContext.fillStyle='white';
  newContext.fillRect(0, 0, maxSize, maxSize);
  newContext.putImageData(imageData, beginLeft, beginTop);

  const imageDataURL = newCanvas.toDataURL()
  const scaledFactor = IMAGE_SIZE / maxSize;

  newCanvas.setAttribute('width', IMAGE_SIZE);
  newCanvas.setAttribute('height', IMAGE_SIZE);

  return new Promise((resolve, reject) => {
    const imageObject = new Image();
    imageObject.onload = function () {
      newContext.scale(scaledFactor, scaledFactor);
      newContext.drawImage(imageObject, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      resolve(newCanvas.toDataURL('image/jpeg'));
    }
    imageObject.src = imageDataURL;
  })
}

/**
 * @param {number} timeStamp
 * @param {Array<Array<Point>>} arrayOfArrayOfPoint
 */
function fetchShapeType(timeStamp, arrayOfArrayOfPoint, canvas) {
  return async (dispatch, getState) => {
    const shapeState = getState().shape;
    const shouldQuit = shapeState[timeStamp] && shapeState[timeStamp].state !== FETCH_SHAPE_TYPE.FAILED;
    if (shouldQuit) {
      return;
    }
    const boundingRect = getBoundingRect(arrayOfArrayOfPoint);
    dispatch({
      type: FETCH_SHAPE_TYPE.REQUESTED,
      payload: {
        key: timeStamp,
        boundingRect,
      }
    });

    try {
      let result = await fetchShapeTypeAPI(timeStamp, arrayOfArrayOfPoint, await scaledDownDataUrl(canvas, boundingRect));
      dispatch({
        type: FETCH_SHAPE_TYPE.SUCCESS,
        payload: {
          key: timeStamp,
          result,
        }
      });
    } catch {
      dispatch({
        type: FETCH_SHAPE_TYPE.FAILED,
        payload: {
          key: timeStamp,
        }
      })
    }
  }
}