import { evaluate, evalScope } from "@strudel.cycles/eval";
import { Scheduler } from "@strudel.cycles/webaudio/scheduler.mjs";
import controls from "@strudel.cycles/core/controls.mjs";

export type ErrorHandler = (error: string) => void;

class StrudelWrapper {
  initialized: boolean;
  onError: ErrorHandler;
  _scheduler: any;
  _getAudioContext: () => AudioContext;
  _loadWebDirt: (opts: any) => Promise<void>;

  constructor(onError: ErrorHandler) {
    this.initialized = false;
    this.onError = onError || (() => {});
  }

  async importModules() {
    const { getAudioContext } = await import(
      "@strudel.cycles/webaudio/webaudio.mjs"
    );
    const { loadWebDirt } = await import("@strudel.cycles/webdirt");

    this._getAudioContext = getAudioContext;
    this._loadWebDirt = loadWebDirt;

    // import desired modules and add them to the eval scope
    await evalScope(
      import("@strudel.cycles/core"),
      import("@strudel.cycles/midi"),
      import("@strudel.cycles/mini"),
      import("@strudel.cycles/osc"),
      import("@strudel.cycles/serial"),
      import("@strudel.cycles/tonal"),
      import("@strudel.cycles/tone"),
      import("@strudel.cycles/webaudio"),
      import("@strudel.cycles/webdirt"),
      import("@strudel.cycles/xen"),
      controls
      // import other strudel packages here
    ); // add strudel to eval scope
  }

  async initialize() {
    if (!this._getAudioContext) {
      throw new Error(
        "AudioContext not available. Call importModules() first."
      );
    }

    const audioContext = this._getAudioContext();
    const latency = 0.2;

    // load default samples + init webdirt
    this._loadWebDirt({
      audioContext,
      latency,
      sampleMapUrl: "https://strudel.tidalcycles.org/EmuSP12.json",
      sampleFolder: "https://strudel.tidalcycles.org/EmuSP12/",
    });

    // the scheduler will query the pattern within the given interval
    this._scheduler = new Scheduler({
      audioContext,
      interval: 0.1,
      latency,
      onEvent: (hap) => {
        if (!hap.context.onTrigger) {
          this.onError(
            "No output chosen. Use one of: .out(), .webdirt(), .osc()"
          );
        }
      },
    });

    this.initialized = true;
    console.log("Strudel initialized");
  }

  tryEval = async (code: string) => {
    if (!this.initialized) await this.initialize();

    try {
      const { pattern } = await evaluate(code);
      this._scheduler.setPattern(pattern);
      this._scheduler.start();
      this.onError(null);
    } catch (e) {
      console.error(e);
      this.onError(e.message);
    }
  };
}

export default StrudelWrapper;
