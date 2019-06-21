import React from 'react';
import { getFinalizedShapes } from './redux/shape/selector';
import { connect } from 'react-redux';
import Draw from './Draw';
import Components, { functionMapping } from './Components';

class Controller extends React.Component {
  drawn = new Set();
  constructor(props) {
    super(props);
    this.canvas = new Components();
  }
  componentDidUpdate() {
    const { finalizedShapes } = this.props;
    for(let shapeId in finalizedShapes) {
      if (this.drawn.has(shapeId)) {
        continue;
      }
      const component = finalizedShapes[shapeId];
      const componentName = component.name;
      const { top, left, bottom, right } = component.boundingRect;
      const actualFunction = functionMapping[componentName];
      if (actualFunction) {
        this.canvas[actualFunction](left, top, right, bottom);
        this.drawn.add(shapeId);
      }
    }
  }
  render() {
    return (<>
      <Draw />
    </>);
  }
}

const mapStateToProps = state => {
  return {
    finalizedShapes: getFinalizedShapes(state.shape),
  }
}

export default connect(mapStateToProps)(Controller)