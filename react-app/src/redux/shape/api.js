export {
  fetchShapeTypeAPI,
}

const END_POINT = 'http://tenzhiyang.com:8080/api/infer';

function fetchShapeTypeAPI(id, arrayOfArrayOfPoint) {
  return fetch(END_POINT, { // TODO: @James Fine grain this fetch
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      shapes: arrayOfArrayOfPoint,
    }),
  })
}