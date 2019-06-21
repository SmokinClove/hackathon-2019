import React from 'react';
import { connect } from 'react-redux';
import { fetchShapeType } from './redux/shape/action';

const debounded = (fn, timeout) => {
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
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.downloadBtn= React.createRef();
    this.obj = []; // an Array of Array of Points, which is the object to draw
    this.currentLine = []; // Stores an array of Points, which is the current line being drawn
  }

  formObject = debounded(() => {
    // TODO: send to api and refresh the this.obj
    const timestamp = new Date().getTime();
    if (!this.paint || this.obj.length !== 0) {
      this.props.fetchShapeType(timestamp, this.obj)
    }
    // getImage(timestamp, this.obj)
    this.obj = [];
  }, 1000);

  componentDidMount() {
    var clickX = [];
    var clickY = [];
    var clickDrag = [];
    var context;
    var self = this;

    const addClick = (x, y, dragging) => {
      clickX.push(x);
      clickY.push(y);
      this.currentLine.push({x, y});
      clickDrag.push(dragging);
    }

    const redraw = () => {
      context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

      context.strokeStyle = "#111";
      context.lineJoin = "round";
      context.lineWidth = 5;

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


    if(!this.canvas) return;
    const canvas = this.canvas.current;
    context = canvas.getContext("2d");
    canvas.addEventListener("mousedown", function (e) {
      self.paint = true;
      addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
      redraw();
    })

    canvas.addEventListener("mousemove", function (e) {
      if (self.paint) {
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
        redraw();
      }
    });

    canvas.addEventListener("mouseup", function(e){
      self.paint = false;
      if(!!self.currentLine && self.currentLine.length > 0)self.obj.push(self.currentLine);
      self.currentLine = [];
      self.formObject();
    });

    canvas.addEventListener("mouseleave", function (e) {
      if (self.paint) {
        self.formObject()
      }
    });

    
    var link = document.createElement('a');
    link.classList.add("exportImg");
    link.innerHTML = 'download image';
    link.addEventListener('click', function(ev) {
      const canvas=self.canvas.current;
      link.href = canvas.toDataURL();
      link.download = "mypainting.png";
    }, false);
    document.getElementById("playground").appendChild(link);
  }


  render() {
    return <div id="playground" className="playground">
      <canvas id="canvasInAPerfectWorld" width="600" height="600" style={{border: "black 1px solid"}} ref={this.canvas}></canvas>
    </div>
  }
}

const mapStateToProps = state => {
  return {
    shape: state.shape,
  };
}
export default connect(
  mapStateToProps,
  {
    fetchShapeType
  }
)(Draw);
