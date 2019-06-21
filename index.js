
// var clickX = new Array();
// var clickY = new Array();
// var clickDrag = new Array();
var drawingData = new Array();
drawingData.push([]);
var numLines = 0;
var paint;

function addClick(x, y, dragging) {
    if (numLines === drawingData.length -1) {
        drawingData[numLines].push({ x, y });
    } else {
        drawingData.push([]);
    }
    // clickDrag.push(dragging);
}

function redraw() {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

    context.strokeStyle = "#111";
    context.lineJoin = "round";
    context.lineWidth = 5;

    for (var j=0; j< drawingData.length; j++) {
        const line = drawingData[j];
        for (var i = 0; i < line.length; i++) {
            if (line[i - 1]) {
                context.beginPath();
                context.moveTo(line[i - 1].x, line[i - 1].y);
                context.lineTo(line[i].x, line[i].y);
                context.closePath();
                context.stroke();
            }
        }
    }
    
}

function clear() {
    drawingData = new Array();
    numLines = 0;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height); 
}

function sendToBE() {
    fetch('http://localhost:8080/api/debug', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: 'somestring',shapes: drawingData})
    }).then(response => response.json()).then(result => console.log(result));
}

async function app() {
    const canvas = document.getElementById('canvasInAPerfectWorld');
   
    context = canvas.getContext("2d");

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
        numLines += 1;
    })

    canvas.addEventListener("mouseleave", function (e) {
        paint = false;
        numLines += 1;
    });
   
    // When clicking a button, add an example for that class.
    document.getElementById('clear').addEventListener('click', () => clear());
    document.getElementById('sendtobackend').addEventListener('click', () => sendToBE());
}

app();