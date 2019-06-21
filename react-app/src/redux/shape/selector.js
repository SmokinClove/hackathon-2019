import memoizeOne from 'memoize-one';
import { FETCHING_STATES } from './index';

function _getFinalizedShapes(shapeState) {
  return Object.entries(shapeState).filter(([_, shape]) => shape.state === FETCHING_STATES.FINAL).reduce((accumulator, [key, value]) => {
    accumulator[key] = value;
    return accumulator;
  }, {});
}

function _isEqualState(oldParams, newParams) {
  const oldState = oldParams[0];
  const newState = newParams[0];
  const oldKeys = Object.keys(oldState);
  const newKeys = Object.keys(newState);
  if (oldKeys.length === newKeys.length) {
    for(let key of oldKeys) {
      if (oldState.hasOwnProperty(key)) {
        if (!newState.hasOwnProperty(key)) {
          return false;
        }
        if (oldState[key].state !== newState[key].state) {
          return false;
        }
      }
    }
    return true;
  }
  return false;
}

const getFinalizedShapes = memoizeOne(_getFinalizedShapes, _isEqualState);

export {
  getFinalizedShapes
}