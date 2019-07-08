export {
  fetchShapeTypeAPI,
}

const END_POINT = 'https://tenzhiyang.com:8080/api/infer';

async function fetchShapeTypeAPI(id, arrayOfArrayOfPoint, data) {
  const response = await fetch(END_POINT, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      shapes: arrayOfArrayOfPoint,
      data,
    }),
  })
  return response.json();
}