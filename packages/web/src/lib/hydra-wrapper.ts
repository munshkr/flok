declare global {
  interface Window {
    global: Window;
    src: Function;
    H: Function;
    P5: Function;
  }
}

type ErrorHandler = (err: string) => void;

class HydraWrapper {
  initialized: boolean;
  hydra: any;
  onError: ErrorHandler;

  constructor({ onError }: { onError: ErrorHandler }) {
    this.onError = onError || (() => {});
    this.initialized = false;
  }

  async initialize(canvas: HTMLCanvasElement) {
    if (this.initialized) return;

    // For some reason on Android mobile, Chrome has this object undefined:
    if (!window.navigator.mediaDevices) return;

    // Needed by Hydra?
    window.global = window;

    const { default: Hydra } = await import("hydra-synth");
    const { P5 } = await import("./p5-wrapper.js");

    this.hydra = new Hydra({ canvas });

    // Some globals...
    window.P5 = P5;
    window.H = this.hydra;

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
      this.onError("");
    } catch (error) {
      this.onError(String(error));
    }
  };
}

export default HydraWrapper;
