import React from 'react';
import { connect } from 'react-redux';
import { fetchShapeType } from './redux/shape/action';
import Components, { functionMapping } from './Components';
import { getFinalizedShapes } from './redux/shape/selector';
import './App.css';

const debounced = (fn, timeout) => {
  let timeoutHandler = null;
  return function() {
    clearTimeout(timeoutHandler);
    timeoutHandler = setTimeout(fn, timeout);
  }
}
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
    this.downloadBtn= React.createRef();
    this.obj = []; // an Array of Array of Points, which is the object to draw
    this.currentLine = []; // Stores an array of Points, which is the current line being drawn
    this.state = {
      isDrawingMode: true
    }
  }

  formObject = debounced(() => {
    const timestamp = new Date().getTime();
    if (!this.paint && this.obj.length !== 0) {
      this.props.fetchShapeType(timestamp, this.obj)
    }
    this.obj = [];
  }, 2000);

  componentDidMount() {
    var context;
    var self = this;
    this.canvas2 = new Components();
    document.addEventListener("keypress", (e) => {
      if(e.key === "w" /* to draw */)self.setState({isDrawingMode: true});
      if(e.key === "q" /* to view */) self.setState({isDrawingMode:false})
    })

    const addClick = (x, y, dragging) => {
      this.clickX.push(x);
      this.clickY.push(y);
      this.currentLine.push({x, y});
      this.clickDrag.push(dragging);
    }

    const redraw = () => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
      context.strokeStyle = "#111";
      context.lineJoin = "round";
      context.lineWidth = 5;
      context.fillStyle = 'rgba(255,0,0,.4)';

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
    }

    if(!this.canvas) return;
    const canvas = this.canvas.current;
    context = canvas.getContext("2d");
    canvas.addEventListener("mousedown", function (e) {
      if(!self.state.isDrawingMode) return;
      self.paint = true;
      addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
      redraw();
    })

    canvas.addEventListener("mousemove", function (e) {
      if(!self.state.isDrawingMode) return;
      if (self.paint) {
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
        redraw();
      }
    });

    canvas.addEventListener("mouseup", function(e){
      if(!self.state.isDrawingMode) return;
      self.paint = false;
      if(!!self.currentLine && self.currentLine.length > 0)self.obj.push(self.currentLine);
      self.currentLine = [];
      self.formObject();
    });

    canvas.addEventListener("mouseleave", function (e) {
      if(!self.state.isDrawingMode) return;
      if (self.paint) {
        self.formObject()
      }
    });

    
    document.getElementById("thisStringIsTheCanvasId").addEventListener("dblclick", function (e) {
      console.log("dblclick ", e);
      self.canvas2.addInput(20, 20);
    });

    var link = document.createElement('a');
    link.classList.add("exportImg");
    link.innerHTML = 'download image';
    link.addEventListener('click', function(ev) {
      const canvas=document.getElementById("thisStringIsTheCanvasId");
      link.href = canvas.toDataURL();
      link.download = "mydiagram.png";
    }, false);
   document.getElementById("playground").appendChild(link);
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
        this.canvas2 && this.canvas2[actualFunction](left, top, right, bottom);
        // then we need to clear the current canvas
        const canvas = document.getElementById("canvasInAPerfectWorld");
        const context = canvas ? canvas.getContext('2d') : null;
        if(context){
          context.clearRect(0, 0, canvas.width, canvas.height);
          this.clickX = []; this.clickY = []; this.clickDrag = [];
        }
        this.drawn.add(shapeId);
      }
    }
  }


  render() {
    return <div id="playground" className="playground" style={{position: 'relative'}}>
      <div style={{height:"50px"}}>{this.state.isDrawingMode ? 'Draw mode' : 'View Mode'}</div>
      <canvas id="canvasInAPerfectWorld" width={window.innerWidth/2} height={window.innerHeight/2} style={{display: this.state.isDrawingMode ? 'block' : 'none', border: "black 1px solid", position: 'absolute', top: '50px', zIndex: !this.state.isDrawingMode ? 0 : 2}} ref={this.canvas}></canvas>
      <canvas id="thisStringIsTheCanvasId" width={window.innerWidth/2} height={window.innerHeight/2} style={{border: "1px solid green", zIndex: !this.state.isDrawingMode ? 2 : 0}}></canvas>
    </div>
  }
}

const mapStateToProps = state => {
  return {
    shape: state.shape,
    finalizedShapes: getFinalizedShapes(state.shape)
  };
}
export default connect(
  mapStateToProps,
  {
    fetchShapeType,
  }
)(Draw);
