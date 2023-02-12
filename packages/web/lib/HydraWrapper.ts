export type ErrorHandler = (error: string) => void;

class HydraWrapper {
  initialized: boolean;
  hydra: any;
  onError: ErrorHandler;

  constructor(onError: ErrorHandler) {
    this.onError = onError || (() => {});
    this.initialized = false;
  }

  async initialize(canvas: HTMLCanvasElement) {
    if (this.initialized) return;

    // For some reason on Android mobile, Chrome has this object undefined:
    if (!window.navigator.mediaDevices) return;

    const { default: Hydra } = await import("hydra-synth");
    const { default: P5 } = await import("./p5-wrapper");

    window.global = window;
    window.P5 = P5;

    this.hydra = new Hydra({ canvas });
    this.initialized = true;
  }

  tryEval = (code: string) => {
    if (!this.initialized) {
      console.warn(
        "HydraWrapper is not initialized. Run initialize() to import modules"
      );
      return;
    }

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
  };
}

export default HydraWrapper;
