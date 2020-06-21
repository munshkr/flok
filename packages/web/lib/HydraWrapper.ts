export type ErrorHandler = (error: string) => void;

class HydraWrapper {
  hydra: any;
  onError: ErrorHandler;

  constructor(canvas: HTMLCanvasElement, onError: ErrorHandler) {
    // eslint-disable-next-line global-require
    const Hydra = require("hydra-synth");
    // eslint-disable-next-line global-require
    const P5 = require("./p5-wrapper");

    window.P5 = P5;

    // For some reason on Android mobile, Chrome has this object undefined:
    if (!window.navigator.mediaDevices) return;

    this.hydra = new Hydra({ canvas });
    this.onError = onError || (() => { });
  }

  tryEval = (code: string) => {
    let evalCode: string = code;

    console.debug(evalCode);
    // FIXME Should remove this after this function ends
    window.H = this.hydra;
    try {
      // eslint-disable-next-line no-eval
      eval.call(window, evalCode);
      this.onError(null);
    } catch (error) {
      this.onError(String(error));
    }
  }
}

export default HydraWrapper;
