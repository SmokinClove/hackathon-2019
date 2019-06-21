import React from 'react';

export default class Draw extends React.Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
  }

  componentDidMount() {
    var clickX = [];
    var clickY = [];
    var clickDrag = [];
    var paint, context;

    const addClick = (x, y, dragging) => {
        clickX.push(x);
        clickY.push(y);
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

    const app = () => {
      if(!this.canvas) return;
        const canvas = this.canvas.current;
        context = canvas.getContext("2d");
        console.log('createdContext');
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
        })

        canvas.addEventListener("mouseleave", function (e) {
            paint = false;
        });

    }

    app();
  }
  render() {
    return  <div><canvas id="canvasInAPerfectWorld" width="600" height="600" style={{border: "black 1px solid"}} ref={this.canvas}></canvas></div>
  }

}
