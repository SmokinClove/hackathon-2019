import { fabric } from "fabric";

let canvas = null;
const inlineProperties = {
  fill: "transparent",
  stroke: "black",
  strokeWidth: 5
};

function rotatePoint(subject, pivot, delta) {
  const convertedSubject = {
		x: subject.x - pivot.x,
    y: subject.y - pivot.y
	}
  const cosTheta = Math.cos(delta);
  const sinTheta = Math.sin(delta);
  const newConvertedSubject = {
		x: convertedSubject.x * cosTheta - convertedSubject.y * sinTheta,
		y: convertedSubject.x * sinTheta + convertedSubject.y * cosTheta,
	}

  return {
    x: newConvertedSubject.x + pivot.x,
		y: newConvertedSubject.y + pivot.y,
	}
}


function createDiagonalTopRightArrow(x1, y1, x2, y2) {
	const path = new fabric.Path(`M ${x2} ${y1} L ${x1} ${y2} z`)
		.set(inlineProperties);

	const displacement = Math.atan((x2 - x1) / (y2 - y1)) - Math.PI / 4;
	const centralPoint = { x: x2 + 2,  y: y1 + 2 }; // NOTE: Don't know why there is a displace....
	const caret = new fabric.Polyline(
		[
			rotatePoint({ x: x2 - 23, y: y1 + 2 }, centralPoint, displacement),
			centralPoint,
			rotatePoint({ x: x2 + 2, y: y1 + 27 }, centralPoint, displacement),
		],
		{
			...inlineProperties
		}
	);
	const group = new fabric.Group([ path, caret ]);
	return group;
}

function createRightArrow(x1, y1, x2, y2) {
	const midY = y1 + (y2 - y1) / 2;
	const path = new fabric.Path(`M ${x1} ${midY} L ${x2} ${midY} z`)
		.set(inlineProperties);
	const caret = new fabric.Polyline(
		[
			{ x: x2 - 25, y: midY - 25 },
			{ x: x2, y: midY },
			{ x: x2 - 25, y: midY + 25 }
		],
		{
			left: x2 - 25,
			top: midY - 25,
			...inlineProperties
		}
	);
	const group = new fabric.Group([ path, caret ]);
	return group;
}

function createUpArrow(x1, y1, x2, y2) {
	const midX = x1 + (x2 - x1) / 2,
	arrowLength = y1 + 25;
	const caret = new fabric.Polyline(
		[
			{ x: midX - 25, y: arrowLength },
			{ x: midX, y: y1 },
			{ x: midX + 25, y: arrowLength }
		],
		{
			left: midX - 25,
			top: y1,
			...inlineProperties
		}
	);
	const path1 = new fabric.Path(`M ${midX} ${y1} L ${midX} ${y2} z`)
	.set(inlineProperties);
	const group = new fabric.Group([ path1, caret ]);
	return group;
}

export const functionMapping = {
	square: 'addRect',
	circle: 'addCircle',
	diamond: 'addDiamond',
	triangle: 'addTriangle',
	hLine: 'addHLine',
	vLine: 'addVLine',
	rArrow: 'addRightArrow',
	lArrow: 'addLeftArrow',
	uArrow: 'addUpArrow',
	dArrow: 'addDownArrow',
	ruArrow: 'addDiagonalTopRightArrow',
	ldArrow: 'addDiagonalBottomLeftArrow',
	rdArrow: 'addDiagonalBottomRightArrow',
	luArrow: 'addDiagonalTopLeftArrow',
}

export default class Component {
  constructor() {
    if (!canvas) {
      canvas = new fabric.Canvas("thisStringIsTheCanvasId", {
        height: window.innerHeight,
        width: window.innerWidth
			});
    }
    // display/hide controls on double click
    fabric.util.addListener(canvas.upperCanvasEl, 'dblclick', function(e) {
      console.log(e);
      canvas.add(new fabric.IText('Text', {
        fontFamily: 'arial black',
        fontWeight: 'normal',
        left: e.pageX - this.offsetLeft,
        top: e.pageY - this.offsetTop,
      }));
      //this.addInput(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
      if (canvas.findTarget(e)) {
        let objType = canvas.findTarget(e).type;
        console.log(objType);
        //canvas.addInput(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
      }
    });
  }

	/**
	 *
	 * @param {number} x1 Top-left x1
	 * @param {number} y1 Top-left y1
	 * @param {number} x2 Bottom-right x2
	 * @param {number} y2 Bottom-right y2
	 */
  addRect(x1, y1, x2, y2) {
    const width = x2 - x1,
      height = y2 - y1;
    const rect = new fabric.Rect({
      left: x1,
      top: y1,
      width,
      height,
      ...inlineProperties
		});
    canvas.add(rect);
    return this;
  }

  addCircle(x1, y1, x2, y2) {
		const radius = Math.min(x2 - x1, y2 - y1) / 2;
		const circle = new fabric.Circle({
			left: x1,
			top: y1,
			radius,
			...inlineProperties
		});
		canvas.add(circle);
		return this;
	}

  addTriangle(x1, y1, x2, y2) {
		const triangle = new fabric.Triangle({
			width: x2 - x1,
			height: y2 - y1,
			left: x1,
			top: y1,
			...inlineProperties
		})
		.set('flipY', true);
		canvas.add(triangle);
    return this;
  }

  addDiamond(x1, y1, x2, y2) {
    const midX = x1 + (x2 - x1) / 2,
      midY = y2 + (y1 - y2) / 2;

    const poly = new fabric.Polygon(
      [
        { x: midX, y: y1 },
        { x: x2, y: midY },
        { x: midX, y: y2 },
        { x: x1, y: midY }
      ],
      {
        left: x1,
        top: y1,
        ...inlineProperties
      }
    );
    canvas.add(poly);
    return this;
  }

  /**
   * Add horizontal line
   * @param {number} x1 Top-left x1
   * @param {number} y1 Top-left y1
   * @param {number} x2 Bottom-right x2
   * @param {number} y2 Bottom-right y2
   */
  addHLine(x1, y1, x2, y2) {
    const path = new fabric.Path(`M ${x1} ${y1} L ${x2} ${y1} z`);
    path.set(inlineProperties);
		canvas.add(path);
		return this;
  }

  /**
   * Add vertical line
   * @param {number} x1 Top-left x1
   * @param {number} y1 Top-left y1
   * @param {number} x2 Bottom-right x2
   * @param {number} y2 Bottom-right y2
   */
  addVLine(x1, y1, x2, y2) {
    const path = new fabric.Path(`M ${x1} ${y1} L ${x1} ${y2} z`);
    path.set(inlineProperties);
		canvas.add(path);
		return this;
	}

  addUpArrow(x1, y1, x2, y2) {
		const group = createUpArrow(x1, y1, x2, y2);
		canvas.add(group);
		return this;
	}

	addDownArrow(x1, y1, x2, y2) {
		const group = createUpArrow(x1, y1, x2, y2).set("flipY", true);
		canvas.add(group);
		return this;
  }

  addInput(x1, y1) {
    canvas.add(new fabric.IText('Tap and Type', {
      fontFamily: 'arial black',
      fontWeight: 'normal',
      left: x1,
      top: y1,
    }));
  }

	addRightArrow(x1, y1, x2, y2) {
		const group = createRightArrow(x1, y1, x2, y2);
		canvas.add(group);
		return this;
	}

	addLeftArrow(x1, y1, x2, y2) {
		const group = createRightArrow(x1, y1, x2, y2).set("flipX", true);
		canvas.add(group);
		return this;
	}

	addDiagonalTopRightArrow(x1, y1, x2, y2) {
		const group = createDiagonalTopRightArrow(x1, y1, x2, y2);
		canvas.add(group);
		return this;
	}

	addDiagonalBottomRightArrow(x1, y1, x2, y2) {
		const group = createDiagonalTopRightArrow(x1, y1, x2, y2).set("flipY", true);
		canvas.add(group);
	}

	addDiagonalTopLeftArrow(x1, y1, x2, y2) {
		const group = createDiagonalTopRightArrow(x1, y1, x2, y2).set("flipX", true);
		canvas.add(group);
	}

	addDiagonalBottomLeftArrow(x1, y1, x2, y2) {
		const group = createDiagonalTopRightArrow(x1, y1, x2, y2).set("flipX", true).set("flipY", true);
		canvas.add(group);
	}

  remove() {
		console.log(123);
    canvas.getActiveObjects().forEach(obj => {
			console.log(obj);
      canvas.remove(obj);
    });
    canvas.discardActiveObject().renderAll();
  }
}
