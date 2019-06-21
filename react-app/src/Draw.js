import React from 'react';

export default class Draw extends React.Component {
  var clickX = new Array();
  var clickY = new Array();
  var clickDrag = new Array();
  var paint;
  componentDidMount() {
    app();
  }

  function addClick(x, y, dragging) {
      clickX.push(x);
      clickY.push(y);
      clickDrag.push(dragging);
  }

  function redraw() {
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

  function clear() {
      clickX = new Array();
      clickY = new Array();
      clickDrag = new Array();
      context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  }

  async function app() {
      const canvas = document.getElementById('canvasInAPerfectWorld');
      context = canvas.getContext("2d");
      console.log('createdContext');
      canvas.addEventListener("mousedown", function (e) {
          var mouseX = e.pageX - this.offsetLeft;
          var mouseY = e.pageY - this.offsetTop;

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
  return <canvas id="canvasInAPerfectWorld" width="220" height="220" style="border: black 1px solid;"></canvas>;
}
