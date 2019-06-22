import React from 'react';
import { connect } from 'react-redux';
import { fetchShapeType } from './redux/shape/action';
import Components, { functionMapping } from './Components';
import { getFinalizedShapes } from './redux/shape/selector';
import './App.css';

function debounced (fn, timeout) {
  let timeoutHandler = null;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeoutHandler);
    timeoutHandler = setTimeout(function() {
      fn.apply(context, args);
    }, timeout);
  };
};
/*
Point : {x : number, y: number}
 */
class Draw extends React.Component {
  paint = false;
  drawn = new Set();
  canvas2;
  clickX = [];
  clickY = [];
  clickDrag = [];
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.downloadBtn = React.createRef();
    this.hiddenCanvas = React.createRef();
    this.canvasContainer = React.createRef();
    this.obj = []; // an Array of Array of Points, which is the object to draw
    this.currentLine = []; // Stores an array of Points, which is the current line being drawn
    this.state = {
      isDrawingMode: true
    };
  }

  formObject = debounced(() => {
    const timestamp = new Date().getTime();
    if (!this.paint && this.obj.length !== 0) {
      this.props.fetchShapeType(timestamp, this.obj, this.hiddenCanvas.current);
    }
    this.obj = [];
  }, 1000);

  keyboardListener = e => {
    if (e.key === 'w' /* to draw */) this.setState({ isDrawingMode: true });
    if (e.key === 'q' /* to view */) this.setState({ isDrawingMode: false });
    if (['Backspace', 'Delete'].includes(e.key)) this.canvas2.remove();
  }

  componentDidMount() {
    var context;
    var hiddenContext;
    var self = this;
    this.canvas2 = new Components();
    document.addEventListener('keydown', this.keyboardListener);

    const addClick = (x, y, dragging) => {
      this.clickX.push(x);
      this.clickY.push(y);
      this.currentLine.push({ x, y });
      this.clickDrag.push(dragging);
    };

    const drawOnContext = context => {
      context.strokeStyle = '#111';
      context.lineJoin = 'round';
      context.lineWidth = 5;
      for (var i = 0; i < this.clickX.length; i++) {
        context.beginPath();
        if (this.clickDrag[i] && i) {
          context.moveTo(this.clickX[i - 1], this.clickY[i - 1]);
        } else {
          context.moveTo(this.clickX[i] - 1, this.clickY[i]);
        }
        context.lineTo(this.clickX[i], this.clickY[i]);
        context.closePath();
        context.stroke();
      }
    };

    const redraw = () => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

      drawOnContext(context);

      hiddenContext.fillStyle = 'white';
      hiddenContext.fillRect(
        0,
        0,
        hiddenContext.canvas.width,
        hiddenContext.canvas.height
      );
      drawOnContext(hiddenContext);
    };

    const canvas = this.canvas.current;
    const canvasContainer = this.canvasContainer.current;
    context = canvas.getContext('2d');

    const hiddenCanvas = this.hiddenCanvas.current;
    hiddenContext = hiddenCanvas.getContext('2d');
    canvas.addEventListener('mousedown', function(e) {
      if (!self.state.isDrawingMode) return;
      self.paint = true;
      addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
      redraw();
    });

    canvas.addEventListener('mousemove', function(e) {
      if (!self.state.isDrawingMode) return;
      if (self.paint) {
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
        redraw();
      }
    });

    canvas.addEventListener('mouseup', function(e) {
      if (!self.state.isDrawingMode) return;
      self.paint = false;
      if (!!self.currentLine && self.currentLine.length > 0)
        self.obj.push(self.currentLine);
      self.currentLine = [];
      self.formObject();
    });

    canvas.addEventListener('mouseleave', function(e) {
      if (!self.state.isDrawingMode) return;
      if (self.paint) {
        self.paint = false;
        self.formObject();
      }
    });
  }

  onDownloadClick = (event) => {
    const canvas = document.getElementById('thisStringIsTheCanvasId');
    event.target.href = canvas.toDataURL();
    event.target.download = 'mydiagram.png';
  }

  componentDidUpdate() {
    const { finalizedShapes } = this.props;
    for (let shapeId in finalizedShapes) {
      if (this.drawn.has(shapeId)) {
        continue;
      }
      const component = finalizedShapes[shapeId];
      const componentName = component.name;
      const { top, left, bottom, right } = component.boundingRect;
      const actualFunction = functionMapping[componentName];
      if (actualFunction) {
        this.canvas2 && this.canvas2[actualFunction](left, top, right, bottom);
        // then we need to clear the current canvas
        const canvas = document.getElementById('canvasInAPerfectWorld');
        const context = canvas ? canvas.getContext('2d') : null;
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          this.clickX = [];
          this.clickY = [];
          this.clickDrag = [];
        }
        this.drawn.add(shapeId);
      }
    }
  }

  render() {
    return (
      <div
        id="playground"
        className="playground"
        style={{ position: 'relative' }}
      >
        <div style={{ height: '50px' }}>
          {this.state.isDrawingMode ? 'Draw mode' : 'View Mode'}
        </div>
        <div id="canvasContainer" ref={this.canvasContainer}>
          <canvas
            id="canvasInAPerfectWorld"
            width={window.innerWidth}
            height={window.innerHeight}
            style={{
              display: this.state.isDrawingMode ? 'block' : 'none',
              border: 'black 1px solid',
              position: 'absolute',
              top: '50px',
              zIndex: this.state.isDrawingMode ? 1 : 'unset'
            }}
            ref={this.canvas}
          />
          <canvas
            id="thisStringIsTheCanvasId"
            width={window.innerWidth}
            height={window.innerHeight}
            style={{
              border: '1px solid black',
            }}
          />
          <canvas
            id="backdropInvisibleCanvas"
            width={window.innerWidth}
            height={window.innerHeight}
            ref={this.hiddenCanvas}
          />
        </div>
        <a className="exportImg" onClick={this.onDownloadClick} href="/" style={{height:'80px'}}>
          Download Image
        </a>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    shape: state.shape,
    finalizedShapes: getFinalizedShapes(state.shape)
  };
};
export default connect(
  mapStateToProps,
  {
    fetchShapeType
  }
)(Draw);
