import { fabric } from "fabric";

let canvas = null;
const inlineProperties = {
	fill: 'transparent',
	stroke: 'black',
	strokeWidth: 5
}

export default class Component {
  constructor() {
    if (!canvas) {
      canvas = new fabric.Canvas("thisStringIsTheCanvasId", {
        height: window.innerHeight/2,
        width: window.innerWidth/2,
      });
    }
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

  addInput(x1, y1) {
    canvas.add(new fabric.IText('Tap and Type', { 
      fontFamily: 'arial black',
      fontWeight: 'normal',
      left: x1, 
      top: y1,
    }));
  }

	addCircle(x1, y1, x2, y2) {
		const radius = Math.min(x2 - x1, y1 - y2) / 2;
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
			height: y1 - y2, 
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

		const poly = new fabric.Polygon([
				{ x: midX, y: y1 },
				{ x: x2, y: midY },
				{ x: midX, y: y2 },
				{ x: x1, y: midY },
			], {
			left: x1,
			top: y1,
			...inlineProperties
		});
		canvas.add(poly);
		return this;
	}
	
	remove() {
		canvas.getActiveObjects().forEach((obj) => {
			canvas.remove(obj)
		});
		canvas.discardActiveObject().renderAll();
	}
}
