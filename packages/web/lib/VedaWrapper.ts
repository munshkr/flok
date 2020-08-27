export type ErrorHandler = (error: string) => void;

class VedaWrapper {
  veda: any;
  onError: ErrorHandler;

  constructor(canvas: HTMLCanvasElement, onError: ErrorHandler) {
    const Veda = require("vedajs");

    this.veda = new Veda();
    this.veda.setCanvas(canvas);

    this.onError = onError || (() => {});
  }

  evalFragment(code: string) {
    try {
      this.veda.loadFragmentShader(code);
    } catch (err) {
      this.onError(err);
    }
    this.veda.play();
  }

  evalVertex(code: string) {
    try {
      this.veda.loadVertexShader(code);
    } catch (err) {
      this.onError(err);
    }
    this.veda.play();
  }
}

export default VedaWrapper;
