import React from 'react';

/*
Point : {x : number, y: number}
 */
export default class Draw extends React.Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.obj = []; // an Array of Array of Points, which is the object to draw
    this.currentLine = []; // Stores an array of Points, which is the current line being drawn
    setInterval(this.formObject, 2000);
  }

  formObject = () => {
    // TODO: send to api and refresh the this.obj
    console.log('obj ', this.obj);
    const timestamp = new Date().getTime();
    // getImage(timestamp, this.obj)
    this.obj = [];
  }

  componentDidMount() {
    var clickX = [];
    var clickY = [];
    var clickDrag = [];
    var paint, context;
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
      paint = true;
      addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
      redraw();
    })

    canvas.addEventListener("mousemove", function (e) {
      if (paint) {
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
        redraw();
      }
    });

    canvas.addEventListener("mouseup", function(e){
      paint = false;
      if(!!self.currentLine && self.currentLine.length > 0)self.obj.push(self.currentLine);
      self.currentLine = [];
    });

    canvas.addEventListener("mouseleave", function (e) {
      paint = false;
    });
  }

  render() {
    return  <div><canvas id="canvasInAPerfectWorld" width="600" height="600" style={{border: "black 1px solid"}} ref={this.canvas}></canvas></div>
  }
}
