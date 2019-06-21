import { fabric } from "fabric";

let canvas = null;

export default class Component {
  constructor() {
    if (!canvas) {
		canvas = new fabric.Canvas("thisStringIsTheCanvasId", {
			height: window.innerHeight,
			width: window.innerWidth,
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
			fill: 'transparent',
			stroke: 'black',
    	strokeWidth: 5
		});
		canvas.add(rect);
		return this;
	}
	
	remove() {
		canvas.getActiveObjects().forEach((obj) => {
			canvas.remove(obj)
		});
		canvas.discardActiveObject().renderAll();
	}
}
