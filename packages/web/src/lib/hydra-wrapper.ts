import Hydra from "@flok/hydra-synth";

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

    const { P5 } = await import("./p5-wrapper.js");

    window.P5 = P5;
    window.global = window;

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

    console.debug(code);
    try {
      this.hydra.eval(code);
      this.onError("");
    } catch (error) {
      this.onError(String(error));
    }
  };
}

export default HydraWrapper;
