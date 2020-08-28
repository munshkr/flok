import Veda from "vedajs";

export type ErrorHandler = (error: string) => void;

class VedaWrapper {
  veda: any;
  playing: boolean;
  onError: ErrorHandler;

  constructor(canvas: HTMLCanvasElement, onError: ErrorHandler) {
    this.onError = onError || (() => {});
    this.playing = false;

    this.veda = new Veda();
    this.veda.setCanvas(canvas);

    // Wrap around Veda.render() function with a try/catch
    // to gracefully handle shader program exceptions.
    const vedaRender = this.veda.render;
    this.veda.render = () => {
      try {
        vedaRender.apply(this.veda);
      } catch (err) {
        console.warn("VEDA ERROR", err);
        // this.onError(err);
      }
    };
  }

  evalFragment(code: string) {
    this.veda.loadFragmentShader(code);
    this.play();
  }

  evalVertex(code: string) {
    this.veda.loadVertexShader(code);
    this.play();
  }

  play() {
    if (this.playing) return;
    this.veda.play();
    this.playing = true;
  }
}

export default VedaWrapper;
