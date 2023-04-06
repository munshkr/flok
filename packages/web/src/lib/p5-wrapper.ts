import p5lib from "p5";

export class P5 extends p5lib {
  mode: string;
  canvas!: HTMLCanvasElement;

  constructor({
    width = window.innerWidth,
    height = window.innerHeight,
    mode = "P2D",
  } = {}) {
    super((p) => {
      p.setup = () => {
        p.createCanvas(width, height, p[mode]);
      };
      p.draw = () => {};
    });

    this.width = width;
    this.height = height;
    this.mode = mode;

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
