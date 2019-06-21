import { getBoundingBox } from './utils';
import { fetchShapeTypeAPI } from './api';
import { FETCH_SHAPE_TYPE } from './actionType';

export {
  fetchShapeType
}

/**
 * @typedef {{x, y}} Point
 */

/**
 * @param {number} timeStamp
 * @param {Array<Array<Point>>} arrayOfArrayOfPoint
 */
function fetchShapeType(timeStamp, arrayOfArrayOfPoint) {
  return async (dispatch, getState) => {
    const shapeState = getState().shape;
    const shouldQuit = shapeState[timeStamp] && shapeState[timeStamp].state !== FETCH_SHAPE_TYPE.FAILED;
    if (shouldQuit) {
      return;
    }
    const boundingBox = getBoundingBox(arrayOfArrayOfPoint);
    dispatch({
      type: FETCH_SHAPE_TYPE.REQUESTED,
      payload: {
        key: timeStamp,
        boundingBox,
      }
    });

    try {
      let result = await fetchShapeTypeAPI(timeStamp, arrayOfArrayOfPoint);
      dispatch({
        type: FETCH_SHAPE_TYPE.SUCCESS,
        payload: {
          key: timeStamp,
          result, // TODO: @James No idea what result look like
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