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
    if (e.which === 17 /* control key, to toggle draw mode */) this.setState({ isDrawingMode: !this.state.isDrawingMode });
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
    var link = document.createElement('a');
    link.classList.add("exportImg");
    link.style.position = 'fixed';
    link.style.bottom = '10px';
    link.style.right = '100px';
    link.style.height = '80px';
    link.style.width = '80px';
    link.style.zIndex = '100';
    link.innerHTML = '<svg id="Layer_1" viewBox="0 0 64 64"><path fill="#2ECC71" d="M32 0c17.7 0 32 14.3 32 32S49.7 64 32 64 0 49.7 0 32 14.3 0 32 0z" id="XMLID_16_"/><path fill="#FFF" d="M16 43h32v6H16zM43 27L32 40 21 27h7V12h8v15z"/></svg>';
    link.addEventListener('click', function(ev) {
      const canvas=document.getElementById("thisStringIsTheCanvasId");
      link.href = canvas.toDataURL();
      link.download = "mydiagram.png";
    }, false);
   document.getElementById("playground").appendChild(link);
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
      } else if (componentName === '') {
        this.canvas2 && this.canvas2.addRawLines(component.rawInput);
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
        <div id="canvasContainer" ref={this.canvasContainer}>
          <canvas
            id="canvasInAPerfectWorld"
            width={window.innerWidth}
            height={window.innerHeight}
            style={{
              display: this.state.isDrawingMode ? 'block' : 'none',
              border: 'black 1px solid',
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
        <div style={{position: 'fixed', bottom: '10px', right: '10px', width: '80px', height: '80px', zIndex: 100}}>
        {this.state.isDrawingMode ?
        <svg id="icons" viewBox="0 0 48 48">
          <polygon points="10.01 43.01 2 46 4.98 37.99 5 38 10 43 10.01 43.01" fill="#2d346a"/>
          <polygon points="14.37 33.63 20.02 39.28 10.01 43.01 10 43 5 38 4.98 37.99 8.72 27.97 14.37 33.63" fill="#fff"/>
            <path d="M41.11,18.19,20,39.28l-5.65-5.65L39,9l5.6,5.6a5.32,5.32,0,0,1-.59.68L41.12,18.2Z" fill="#ffc12e"/>
            <path d="M29.81,6.89,32.74,4a5.4,5.4,0,0,1,.69-.59L39,9,14.37,33.63,8.72,28Z" fill="#ffc12e"/>
            <path d="M46,10.41a6.84,6.84,0,0,1-1.36,4.16L39,9,33.43,3.36c2.85-2.16,7.17-1.72,10,1.16A8.39,8.39,0,0,1,46,10.41Z" fill="#c3cce9"/>
            <polyline points="41.43 17.86 20.02 39.28 8.72 27.97 30.14 6.57" fill="none" stroke="#2d346a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
            <path d="M29.81,6.89,32.74,4c2.81-2.81,7.62-2.55,10.74.57h0c3.12,3.12,3.38,7.93.57,10.73L41.12,18.2" fill="none" stroke="#2d346a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
            <polyline points="20.02 39.28 2 46 8.72 27.97" fill="none" stroke="#2d346a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
            <line x1="5" y1="38" x2="10" y2="43" fill="none" stroke="#2d346a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/><line x1="33.43" y1="3.36" x2="44.68" y2="14.61" fill="none" stroke="#2d346a" strokeLinejoin="round" strokeWidth="2"/>
            <line x1="14.37" y1="33.63" x2="39.04" y2="8.97" fill="none" stroke="#2d346a" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/>
        </svg> :
        <svg id="Capa_1" viewBox="0 0 32 32"><g fill="#aaaaaa" id="eye"><path d="M16 4C7.164 4 0 15.844 0 15.844S7.164 28 16 28s16-12.156 16-12.156S24.836 4 16 4zm0 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/><circle cx="16" cy="16.016" r="4"/></g></svg>}
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
