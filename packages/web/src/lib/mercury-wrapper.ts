
import { Mercury } from "mercury-engine";

// global variable m for the main output sound from Mercury
declare global {
  interface Window {
    m : any;
  }
}

export type ErrorHandler = (error: string) => void;

export class MercuryWrapper {
  initialized: boolean = false;

  protected _onError: ErrorHandler;
  protected _onWarning: ErrorHandler;
  protected _repl: any;
  protected _code: any;
  protected _meter: any;
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
        this._onWarning(`Ready!`);
        // console.log('Mercury loaded');
        this.initialized = true;
        // retry the evaluation
        this.tryEval(this._code);

        // initialize the meter
        this._repl.addMeter();
        // update the value every 16ms for 60fps
        this._meter = setInterval(() => window.m = this._repl.getMeter(), 16);
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
  
        let prints = parse.parseTree.print;
        if (prints.length > 0){
          // print prints from the code if there are any
          this._onWarning(`${prints}`);
        }
        if (parse.errors.length > 0){
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
