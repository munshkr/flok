import Veda from "vedajs";

class VedaWrapper {
  veda: Veda;

  constructor(canvas: HTMLCanvasElement) {
    this.veda = new Veda();
    this.veda.setCanvas(canvas);
  }

  evalFragment(code: string) {
    this.veda.loadFragmentShader(code);
    this.veda.play();
  }

  evalVertex(code: string) {
    this.veda.loadVertexShader(code);
    this.veda.play();
  }
}

export default VedaWrapper;
