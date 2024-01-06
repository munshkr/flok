
import { Mercury } from "mercury-engine";

export type ErrorHandler = (error: string) => void;

export class MercuryWrapper {
  initialized: boolean = false;

  protected _onError: ErrorHandler;
  protected _onWarning: ErrorHandler;
  protected _repl: any;
  protected _code: any;
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

    // set initialized to true only when samples are loaded
    this._repl = new Mercury({
      onload: () => { 
        this._onWarning(`Mercury ready!`);
        // console.log('Mercury loaded');
        this.initialized = true;
        // retry the evaluation
        this.tryEval(this._code);
      },
      onmidi: () => { console.log('MIDI devices ready') }
    });
  }

  async tryEval(code: string) {
    // store the code for retrying evaluation
    this._code = code;
    
    // if (!this.initialized) await this.initialize();
    if (!this.initialized){
      this._onWarning(`Engine still loading`);
      this.initialize();
    } else {
      try {
        let parse = this._repl.code(code);
        this._onError('');
  
        if (parse.errors){
          console.log(parse.errors);
          // print the first error that needs fixing
          this._onError(`${parse.errors}`);
        }
      } catch (error) {
        console.error(error);
        this._onError(`${error}`);
      }
    }
  }
}
