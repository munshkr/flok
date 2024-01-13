import p5, { type RENDERER } from "p5";

interface P5libConstructorArgs {
  width?: number;
  height?: number;
  mode?: RENDERER;
}

export class P5Wrapper extends p5 {
  mode: RENDERER;
  canvas: HTMLCanvasElement;

  constructor({ width, height, mode }: P5libConstructorArgs = {}) {
    const canvas = document.createElement("canvas");

    const w = width || window.innerWidth;
    const h = height || window.innerHeight;
    const m = mode || "p2d";

    super((p: p5) => {
      p.setup = () => {
        // Create default renderer with canvas
        p.createCanvas(w, h, m, canvas);
      };
      p.draw = () => {};
    });

    this.width = w;
    this.height = h;
    this.mode = m;

    this.canvas = canvas;
    this.canvas.style.position = "absolute";
    this.canvas.style.top = "0px";
    this.canvas.style.left = "0px";
    this.canvas.style.zIndex = "-1";
  }

  show() {
    this.canvas.style.visibility = "visible";
  }

  hide() {
    this.canvas.style.visibility = "hidden";
  }
}
