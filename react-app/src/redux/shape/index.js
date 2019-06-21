import { FETCH_SHAPE_TYPE } from './actionType';

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
const FETCHING_STATES = {
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
    return {
      ...state,
      [action.payload.key]: {
        ...state[action.payload.key],
        name: action.payload.result,
        suggestions: [action.payload.result], // TODO: @James what is the final result,
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