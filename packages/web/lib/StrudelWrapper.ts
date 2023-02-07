import { repl, controls, evalScope } from "@strudel.cycles/core";
import { transpiler } from "@strudel.cycles/transpiler";
import {
  getAudioContext,
  initAudioOnFirstClick,
  webaudioOutput,
  samples,
} from "@strudel.cycles/webaudio";

export type ErrorHandler = (error: string) => void;

class StrudelWrapper {
  initialized: boolean;
  onError: ErrorHandler;
  _repl: any;

  constructor(onError: ErrorHandler) {
    this.initialized = false;
    this.onError = onError || (() => {});
  }

  async importModules() {
    initAudioOnFirstClick();
    // import desired modules and add them to the eval scope
    await evalScope(
      import("@strudel.cycles/core"),
      import("@strudel.cycles/midi"),
      import("@strudel.cycles/mini"),
      import("@strudel.cycles/osc"),
      import("@strudel.cycles/serial"),
      import("@strudel.cycles/tonal"),
      import("@strudel.cycles/webaudio"),
      import("@strudel.cycles/xen"),
      controls
    );
    await samples(
      "https://strudel.tidalcycles.org/EmuSP12.json",
      "https://strudel.tidalcycles.org/EmuSP12/"
    );
  }

  async initialize() {
    this._repl = repl({
      defaultOutput: webaudioOutput,
      afterEval: () => {},
      beforeEval: () => {},
      onSchedulerError: (e) => this.onError(e.toString()),
      onEvalError: (e) => this.onError(e.toString()),
      getTime: () => getAudioContext().currentTime,
      transpiler,
    });

    this.initialized = true;
    console.log("Strudel initialized");
  }

  tryEval = async (code: string) => {
    if (!this.initialized) await this.initialize();

    try {
      await this._repl.evaluate(code);
      this.onError(null);
    } catch (e) {
      console.error(e);
      this.onError(e.message);
    }
  };
}

export default StrudelWrapper;
