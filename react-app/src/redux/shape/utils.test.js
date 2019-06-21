import { getBoundingBox } from './utils';

describe('getBoundingBox', () => {
  it('shoulds give right output', () => {
    expect(getBoundingBox([])).toMatchSnapshot();
    expect(getBoundingBox([[]])).toMatchSnapshot();
    expect(getBoundingBox([[{x: 1, y: 1}, {x: 2, y: 2}]])).toMatchSnapshot();
    expect(getBoundingBox([[{x: 1, y: 1}, {x: 2, y: 2}], [{x: 0, y: -1}, {x: 100, y: 100}]])).toMatchSnapshot();
    expect(getBoundingBox([[{x: 1, y: 1}, {x: 2, y: 2}], [{x: 0, y: -1}, {x: 100, y: 100}], [{x: -10, y: -1}, {x: 101, y: 102}]])).toMatchSnapshot();
  })
})
