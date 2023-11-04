import { EvalMessage, Session } from "@flok-editor/session";
import { repl, controls, evalScope, stack } from "@strudel.cycles/core";
import { evaluate } from "@strudel.cycles/transpiler";
import { transpiler } from "@strudel.cycles/transpiler";
import {
  getAudioContext,
  initAudioOnFirstClick,
  webaudioOutput,
  samples,
} from "@strudel.cycles/webaudio";

export type ErrorHandler = (error: string) => void;

export class StrudelWrapper {
  initialized: boolean = false;

  protected _onError: ErrorHandler;
  protected _onWarning: ErrorHandler;
  protected _repl: any;
  protected _session: Session | null;
  protected _docPatterns: any;

  constructor({
    onError,
    onWarning,
    session,
  }: {
    onError?: ErrorHandler;
    onWarning?: ErrorHandler;
    session: Session | null;
  }) {
    this._session = session;
    this._docPatterns = {};
    this._onError = onError || (() => {});
    this._onWarning = onWarning || (() => {});
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
    try {
      await samples(
        "https://strudel.cc/EmuSP12.json",
        "https://strudel.cc/EmuSP12/"
      );
    } catch (err) {
      this._onWarning(`Failed to load default samples EmuSP12: ${err}`);
    }
  }

  async initialize() {
    this._repl = repl({
      defaultOutput: webaudioOutput,
      afterEval: () => {},
      beforeEval: () => {},
      onSchedulerError: (e: unknown) => this._onError(`${e}`),
      onEvalError: (e: unknown) => this._onError(`${e}`),
      getTime: () => getAudioContext().currentTime,
      transpiler,
    });

    this.initialized = true;
  }

  async tryEval(msg: EvalMessage) {
    if (!this.initialized) await this.initialize();
    try {
      const { body: code, docId } = msg;
      const { pattern } = await evaluate(code);
      this._docPatterns[docId] = pattern;
      const allPatterns = stack(...Object.values(this._docPatterns));
      await this._repl.scheduler.setPattern(allPatterns, true);
      this._onError("");
    } catch (err) {
      console.error(err);
      this._onError(`${err}`);
    }
  }
}
