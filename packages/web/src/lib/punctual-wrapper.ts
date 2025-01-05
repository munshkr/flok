import { DisplaySettings } from "./display-settings.js";
import { ErrorHandler } from "./mercury-wrapper.js";
import { isWebglSupported } from "./webgl-detector.js";

// Based on https://github.com/dktr0/Punctual/blob/main/index.html
export class PunctualWrapper {
  initialized: boolean = false;

  protected _canvas: HTMLCanvasElement;
  protected _punctual: any;
  protected _animation: any;
  protected _onError: ErrorHandler;
  protected _onWarning: ErrorHandler;
  protected _displaySettings: DisplaySettings;

  constructor({
    canvas,
    onError,
    onWarning,
    displaySettings,
  }: {
    canvas: HTMLCanvasElement;
    onError?: ErrorHandler;
    onWarning?: ErrorHandler;
    displaySettings: DisplaySettings;
  }) {
    this._canvas = canvas;
    this._animation = null;
    this._onError = onError || (() => {});
    this._onWarning = onWarning || (() => {});
    this._displaySettings = displaySettings;
  }

  setDisplaySettings(displaySettings: DisplaySettings) {
    this._displaySettings = displaySettings;
  }

  async initialize() {
    if (this.initialized) return;

    if (!isWebglSupported()) {
      this._onError("WebGL is not supported on this browser.");
      return;
    }

    // @ts-ignore
    const P = await import("./punctual.js");
    const { Punctual } = P;

    try {
      this._punctual = new Punctual();
    } catch (error) {
      console.error(error);
      this._onError(`${error}`);
      return;
    }

    this._animation = requestAnimationFrame(this.animate);

    this.initialized = true;
    console.log("Punctual initialized");
  }

  animate = () => {
    if (!this.initialized) return;

    const nowTime = Date.now() / 1000.0;
    this._punctual.preRender({ canDraw: true, nowTime });
    this._punctual.render({ canDraw: true, zone: 0, nowTime });
    this._punctual.postRender({ canDraw: true, nowTime });

    this._animation = requestAnimationFrame(this.animate);
  };

  async tryEval(code: string) {
    if (!this.initialized) await this.initialize();

    try {
      const res = await this._punctual.define({
        zone: 0,
        text: code,
        time: Date.now() / 1000.0,
      });
      console.log(res);
    } catch (error) {
      console.error(error);
      this._onError(`${error}`);
    }
  }

  dispose() {
    cancelAnimationFrame(this._animation);
    this.initialized = false;
    console.log("Punctual disposed");
  }
}
