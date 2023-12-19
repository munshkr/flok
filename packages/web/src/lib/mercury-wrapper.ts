// import { EvalMessage } from "@flok-editor/session";
const { Mercury } = require('mercury-engine');
// import Mercury from "mercury-engine?worker&inline";

export type ErrorHandler = (error: string) => void;

export class MercuryWrapper {
  initialized: boolean = false;

  protected _onError: ErrorHandler;
  protected _onWarning: ErrorHandler;
  protected _repl: any;
  // protected _docPatterns: any;

  constructor({
    onError,
    onWarning,
  }: {
    onError?: ErrorHandler;
    onWarning?: ErrorHandler;
  }) {
    // this._docPatterns = {};
    this._onError = onError || (() => {});
    this._onWarning = onWarning || (() => {});
  }

  async initialize() {
    if (this.initialized) { return; }

    this._repl = new Mercury({
      onload: () => { console.log('Mercury loaded') },
      onmidi: () => { console.log('MIDI Devices ready') }
    });

    this.initialized = true;
  }

  async tryEval(code: string) {
    if (!this.initialized) await this.initialize();

    try {
      this._repl.code(code);
      this._onError('');
    } catch (error) {
      console.error(error);
      this._onError(`${error}`);
    }
  }
}
