import Hydra from "hydra-synth";

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
  initialized: boolean = false;

  protected _canvas: HTMLCanvasElement;
  protected _hydra: any;
  protected _onError: ErrorHandler;

  constructor({
    canvas,
    onError,
  }: {
    canvas: HTMLCanvasElement;
    onError?: ErrorHandler;
  }) {
    this._canvas = canvas;
    this._onError = onError || (() => {});
  }

  async initialize() {
    if (this.initialized) return;

    // For some reason on Android mobile, Chrome has this object undefined:
    if (!window.navigator.mediaDevices) return;

    const { P5 } = await import("./p5-wrapper.js");

    window.P5 = P5;
    window.global = window;

    this._hydra = new Hydra({ canvas: this._canvas });
    this.initialized = true;
    console.log("Hydra initialized");
  }

  async tryEval(code: string) {
    if (!this.initialized) await this.initialize();

    try {
      this._hydra.eval(code);
      this._onError("");
    } catch (error) {
      console.error(error);
      this._onError(`${error}`);
    }
  }
}

export default HydraWrapper;
