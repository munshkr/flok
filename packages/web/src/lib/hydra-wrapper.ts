import Hydra from "hydra-synth";
import { isWebglSupported } from "@/lib/webgl-detector.js";

declare global {
  interface Window {
    global: Window;
    src: Function;
    H: Function;
    P5: Function;
  }
}

type ErrorHandler = (err: string) => void;

export class HydraWrapper {
  initialized: boolean = false;

  protected _canvas: HTMLCanvasElement;
  protected _hydra: any;
  protected _onError: ErrorHandler;
  protected _onWarning: ErrorHandler;

  constructor({
    canvas,
    onError,
    onWarning,
  }: {
    canvas: HTMLCanvasElement;
    onError?: ErrorHandler;
    onWarning?: ErrorHandler;
  }) {
    this._canvas = canvas;
    this._onError = onError || (() => {});
    this._onWarning = onWarning || (() => {});
  }

  async initialize() {
    if (this.initialized) return;

    if (!isWebglSupported()) {
      this._onError("WebGL is not supported on this browser.");
      return;
    }

    // For some reason on Android mobile, Chrome has this object undefined:
    if (!window.navigator.mediaDevices) {
      this._onWarning(
        "navigator.mediaDevices is not defined. You won't be able to use the Webcam or screen capturing."
      );
    }

    const { P5Wrapper } = await import("./p5-wrapper.js");

    window.P5 = P5Wrapper;
    window.global = window;

    try {
      this._hydra = new Hydra({ canvas: this._canvas });
    } catch (error) {
      console.error(error);
      this._onError(`${error}`);
      return;
    }

    window.H = this._hydra;

    this.initialized = true;
    console.log("Hydra initialized");
  }

  async tryEval(code: string) {
    if (!this.initialized) await this.initialize();

    try {
      await eval?.(`(async () => {\n${code}\n})()`);
    } catch (error) {
      console.error(error);
      this._onError(`${error}`);
    }
  }
}
