import { getBoundingRect } from './utils';
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
    const boundingRect = getBoundingRect(arrayOfArrayOfPoint);
    dispatch({
      type: FETCH_SHAPE_TYPE.REQUESTED,
      payload: {
        key: timeStamp,
        boundingRect,
      }
    });

    try {
      let result = await fetchShapeTypeAPI(timeStamp, arrayOfArrayOfPoint);
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