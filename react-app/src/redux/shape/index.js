import { FETCH_SHAPE_TYPE } from './actionType';
import { getIn } from './utils';

/**
 * @typedef {'FETCHING'| 'FAILED' | 'SUGGESTING' | 'FINAL'} FetchingState
 * @typedef {
 *   {
 *     top: number,
 *     left: number,
 *     bottom: number,
 *     right: number,
 *   }
 * } BoundingRect
 *
 * @typedef {
 *  {
 *    [id: number]: {
 *      boundingRect: BoundingRect,
 *      name: string,
 *      suggestions: Array<string>
 *      state: FetchingState,
 *    }
 *  }
 * } State
 */

 /**
  * @type {FetchingState}
  */
export const FETCHING_STATES = {
  FETCHING: 'FETCHING',
  FAILED: 'FAILED',
  SUGGESTING: 'SUGGESTING',
  FINAL: 'FINAL'
}

 /**
  * @type {State}
  */
const initialState = {}

export default (state = initialState, action) => {
  switch (action.type) {
   case FETCH_SHAPE_TYPE.REQUESTED:
    return {
      ...state,
      [action.payload.key]: {
        boundingRect: action.payload.boundingRect,
        state: FETCHING_STATES.FETCHING,
      }
    }
  case FETCH_SHAPE_TYPE.SUCCESS:
    const results = getIn(action, ['payload', 'result', 'results']) || [];
    return {
      ...state,
      [action.payload.key]: {
        ...state[action.payload.key],
        name: results.length ? results[0].name ? results[0].name : results[0] : '',
        suggestions: results,
        state: FETCHING_STATES.FINAL, // NOTE: @James If we consider suggesting, then change this state to SUGGESTING, write more action and selectors.
      }
    }
  case FETCH_SHAPE_TYPE.FAILED:
    return {
      ...state,
      [action.payload.key]: {
        ...state[action.payload.key],
        state: FETCHING_STATES.FAILED,
      }
    }
  default:
    return initialState
  }
 }