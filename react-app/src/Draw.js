import React from 'react';
import { connect } from 'react-redux';
import { fetchShapeType } from './redux/shape/action';
import Components, { functionMapping } from './Components';
import { getFinalizedShapes } from './redux/shape/selector';
import './App.css';

function debounced(fn, timeout) {
  let timeoutHandler = null;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeoutHandler);
    timeoutHandler = setTimeout(function() {
      fn.apply(context, args);
    }, timeout);
  };
}

const DRAWING_CANVAS_NAME = 'thisStringIsTheCanvasId';
const TIMEOUT = 500;
/*
Point : {x : number, y: number}
 */
class Draw extends React.Component {
  paint = false;
  drawn = new Set();
  refinedCanvas;
  clickX = [];
  clickY = [];
  clickDrag = [];
  marked = new Map(); // Store marked lines with ID, so can remove them when API returns
  obj = []; // an Array of Array of Points, which is the object to draw
  currentLine = []; // Stores an array of Points, which is the current line being drawn

  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.downloadBtn = React.createRef();
    this.hiddenCanvas = React.createRef();
    this.canvasContainer = React.createRef();
    this.state = {
      isDrawingMode: true
    };
  }

  callAPI = debounced(() => {
    const timestamp = new Date().getTime();
    if (!this.paint && this.obj.length !== 0) {
      this.props.fetchShapeType(timestamp, this.obj, this.hiddenCanvas.current);
      this.marked.set(timestamp.toString(10), {
        clickX: this.clickX,
        clickY: this.clickY,
        clickDrag: this.clickDrag,
      })
      this.clickX = [];
      this.clickY = [];
      this.clickDrag = [];
      this.obj = [];
    }
  }, TIMEOUT);

  addClick = (x, y, dragging) => {
    this.clickX.push(x);
    this.clickY.push(y);
    this.currentLine.push({ x, y });
    this.clickDrag.push(dragging);
  };

  drawShape = (context, clickX, clickY, clickDrag) => {
    for (var i = 0; i < clickX.length; i++) {
      context.beginPath();
      if (clickDrag[i] && i) {
        context.moveTo(clickX[i - 1], clickY[i - 1]);
      } else {
        context.moveTo(clickX[i] - 1, clickY[i]);
      }
      context.lineTo(clickX[i], clickY[i]);
      context.closePath();
      context.stroke();
    }
  }

  drawOnContext = (context, withUnfetchedObjects = false) => {
    context.strokeStyle = '#111';
    context.lineJoin = 'round';
    context.lineWidth = 5;
    this.drawShape(context, this.clickX, this.clickY, this.clickDrag);

    if (withUnfetchedObjects) {
      const entries = Array.from(this.marked.entries());
      entries.forEach(([key, value]) => {
        if (this.drawn.has(key)) {
          return;
        }
        const { clickX, clickY, clickDrag } = value;
        this.drawShape(context, clickX, clickY, clickDrag);
      })
    }
  };

  redraw = () => {
    const context = this.canvas.current
      ? this.canvas.current.getContext('2d')
      : null;
    const hiddenContext = this.hiddenCanvas.current
      ? this.hiddenCanvas.current.getContext('2d')
      : null;
    if (!context || !hiddenContext) {
      return;
    }

    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    this.drawOnContext(context, true);

    hiddenContext.fillStyle = 'white';
    hiddenContext.fillRect(
      0,
      0,
      hiddenContext.canvas.width,
      hiddenContext.canvas.height
    );
    this.drawOnContext(hiddenContext);
  };

  keyboardListener = e => {
    if (e.which === 17 /* control key, to toggle draw mode */) {
      // deselect the objects in the second canvas first
      this.refinedCanvas && this.refinedCanvas.deSelectAll();
      this.setState({ isDrawingMode: !this.state.isDrawingMode });
    }
    if (['Backspace', 'Delete'].includes(e.key)) this.refinedCanvas.remove();
  };

  isLeftClick = (e) => e.button === 0;

  startDrawing = e => {
    if (!this.state.isDrawingMode || !this.isLeftClick(e)) return;
    this.paint = true;
    this.addClick(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop);
    this.redraw();
  };

  drawing = e => {
    if (!this.state.isDrawingMode || !this.paint || !this.isLeftClick(e)) return;
    this.addClick(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, true);
    this.redraw();
  };

  endDrawing = e => {
    if (!this.state.isDrawingMode || !this.isLeftClick(e)) return;
    this.paint = false;
    if (!!this.currentLine && this.currentLine.length > 0)
      this.obj.push(this.currentLine);
    this.currentLine = [];
    this.callAPI();
  };

  downloadCanvas = (event) => {
      const currentButton = this.downloadBtn.current;
      if (!currentButton) {
        return;
      }
      this.refinedCanvas && this.refinedCanvas.deSelectAll();
      const canvas = document.getElementById(DRAWING_CANVAS_NAME);

      currentButton.href = canvas.toDataURL();
      currentButton.download = 'mydiagram.png';
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.keyboardListener);
  }

  componentDidMount() {
    this.refinedCanvas = new Components(DRAWING_CANVAS_NAME);
    document.addEventListener('keydown', this.keyboardListener);

    const canvas = this.canvas.current;

    canvas.addEventListener('mousedown', this.startDrawing);
    canvas.addEventListener('mousemove', this.drawing);
    canvas.addEventListener('mouseup', this.endDrawing);
    canvas.addEventListener('mouseleave', this.endDrawing);
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
      if (actualFunction || componentName === '') {
        this.drawn.add(shapeId);

        this.redraw();

        if (actualFunction) {
          this.refinedCanvas &&
            this.refinedCanvas[actualFunction](left, top, right, bottom);
        } else {
          this.refinedCanvas &&
            this.refinedCanvas.addRawLines(component.rawInput);
        }
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
        <div id="canvasContainer" ref={this.canvasContainer}>
          <canvas
            id="canvasInAPerfectWorld"
            width={window.innerWidth}
            height={window.innerHeight}
            style={{
              display: this.state.isDrawingMode ? 'block' : 'none',
              position: 'absolute',
              top: '0',
              zIndex: this.state.isDrawingMode ? 1 : 'unset'
            }}
            ref={this.canvas}
          />
          <canvas
            id="thisStringIsTheCanvasId"
            width={window.innerWidth}
            height={window.innerHeight}
          />
          <canvas
            id="backdropInvisibleCanvas"
            width={window.innerWidth}
            height={window.innerHeight}
            ref={this.hiddenCanvas}
          />
        </div>
        <a
          className="exportImg"
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '100px',
            height: '80px',
            width: '80px',
            zIndex: 100
          }}
          ref={this.downloadBtn}
          onClick={this.downloadCanvas}
          href="/"
        >
          <svg id="Layer_1" viewBox="0 0 64 64">
            <path
              fill="#2ECC71"
              d="M32 0c17.7 0 32 14.3 32 32S49.7 64 32 64 0 49.7 0 32 14.3 0 32 0z"
              id="XMLID_16_"
            />
            <path
              fill="#FFF"
              d="M16 43h32v6H16zM43 27L32 40 21 27h7V12h8v15z"
            />
          </svg>
        </a>
        <div
          style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            width: '80px',
            height: '80px',
            zIndex: 100
          }}
        >
          {this.state.isDrawingMode ? (
            <svg id="icons" viewBox="0 0 48 48">
              <polygon
                points="10.01 43.01 2 46 4.98 37.99 5 38 10 43 10.01 43.01"
                fill="#2d346a"
              />
              <polygon
                points="14.37 33.63 20.02 39.28 10.01 43.01 10 43 5 38 4.98 37.99 8.72 27.97 14.37 33.63"
                fill="#fff"
              />
              <path
                d="M41.11,18.19,20,39.28l-5.65-5.65L39,9l5.6,5.6a5.32,5.32,0,0,1-.59.68L41.12,18.2Z"
                fill="#ffc12e"
              />
              <path
                d="M29.81,6.89,32.74,4a5.4,5.4,0,0,1,.69-.59L39,9,14.37,33.63,8.72,28Z"
                fill="#ffc12e"
              />
              <path
                d="M46,10.41a6.84,6.84,0,0,1-1.36,4.16L39,9,33.43,3.36c2.85-2.16,7.17-1.72,10,1.16A8.39,8.39,0,0,1,46,10.41Z"
                fill="#c3cce9"
              />
              <polyline
                points="41.43 17.86 20.02 39.28 8.72 27.97 30.14 6.57"
                fill="none"
                stroke="#2d346a"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M29.81,6.89,32.74,4c2.81-2.81,7.62-2.55,10.74.57h0c3.12,3.12,3.38,7.93.57,10.73L41.12,18.2"
                fill="none"
                stroke="#2d346a"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <polyline
                points="20.02 39.28 2 46 8.72 27.97"
                fill="none"
                stroke="#2d346a"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <line
                x1="5"
                y1="38"
                x2="10"
                y2="43"
                fill="none"
                stroke="#2d346a"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <line
                x1="33.43"
                y1="3.36"
                x2="44.68"
                y2="14.61"
                fill="none"
                stroke="#2d346a"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <line
                x1="14.37"
                y1="33.63"
                x2="39.04"
                y2="8.97"
                fill="none"
                stroke="#2d346a"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          ) : (
            <svg id="Capa_1" viewBox="0 0 32 32">
              <g fill="#aaaaaa" id="eye">
                <path d="M16 4C7.164 4 0 15.844 0 15.844S7.164 28 16 28s16-12.156 16-12.156S24.836 4 16 4zm0 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
                <circle cx="16" cy="16.016" r="4" />
              </g>
            </svg>
          )}
        </div>
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
