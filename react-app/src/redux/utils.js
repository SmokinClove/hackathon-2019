export {
  createRequestType
}

/**
 * @param {string} actionType
 */
function createRequestType(actionType) {
  return {
    REQUESTED: `${actionType}_REQUESTED`,
    SUCCESS: `${actionType}_SUCCESS`,
    FAILED: `${actionType}_FAILED`,
  }
}