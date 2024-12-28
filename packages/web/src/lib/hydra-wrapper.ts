import Hydra from "hydra-synth";
import { isWebglSupported } from "@/lib/webgl-detector.js";

declare global {
  interface Window {
    global: Window;
    src: Function;
    H: Function;
    P5: Function;
    fft: (index: number, buckets: number) => number;
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

    const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);


    // Enables Hydra to use Strudel frequency data
    // with `.scrollX(() => fft(1,0)` it will influence the x-axis, according to the fft data
    // first number is the index of the bucket, second is the number of buckets to aggregate the number too
    window.fft = (index: number, buckets: number = 8, options?: { min?: number; max?: number, scale?: number, analyzerId?: string }) => {
      const analyzerId = options?.analyzerId ?? "flok-master"
      const min = options?.min ?? -150;
      const scale = options?.scale ?? 1
      const max = options?.max ?? 0

      if(window.strudel.webaudio.analysers[analyzerId] == undefined) {
        return .5
      }
      const freq = window.strudel.webaudio.getAnalyzerData("frequency", analyzerId) as Array<number>;
      const bucketSize = (freq.length) / buckets

      // inspired from https://github.com/tidalcycles/strudel/blob/a7728e3d81fb7a0a2dff9f2f4bd9e313ddf138cd/packages/webaudio/scope.mjs#L53
      const normalized = freq.map((it: number) => {
        const norm = clamp((it - min) / (max - min), 0, 1);
        return norm * scale;
      })

      return normalized.slice(bucketSize * index, bucketSize * (index + 1))
        .reduce((a, b) => a + b, 0) / bucketSize
    }

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
