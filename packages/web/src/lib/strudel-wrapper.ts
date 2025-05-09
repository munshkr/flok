import type { EvalMessage } from "@flok-editor/session";
import {
  Pattern,
  controls,
  evalScope,
  noteToMidi,
  repl,
  stack,
  valueToMidi,
} from "@strudel/core";
import { Framer } from "@strudel/draw";
import { registerSoundfonts } from "@strudel/soundfonts";
import { transpiler } from "@strudel/transpiler";
import {
  getAudioContext,
  initAudio,
  registerSynthSounds,
  samples,
  webaudioOutput,
} from "@strudel/webaudio";
import { updateDocumentsContext } from "./utils";

export type ErrorHandler = (error: string) => void;

controls.createParam("docId");

export class StrudelWrapper {
  initialized: boolean = false;

  protected _onError: ErrorHandler;
  protected _onWarning: ErrorHandler;
  protected _repl: any;
  protected _docPatterns: any;
  protected _audioInitialized: boolean;
  protected framer?: any;
  protected mini?: any;
  protected core?: any;
  protected draw?: any;
  protected webaudio?: any;

  enableAutoAnalyze = false;
  hapAnalyzeSnippet = `
    all(x => 
      x.fmap(hap => {
        if(hap.analyze == undefined) {
          hap.analyze = 'flok-master';
        }
        return hap
      })
    )
    `;

  constructor({
    onError,
    onWarning,
  }: {
    onError: ErrorHandler;
    onWarning: ErrorHandler;
  }) {
    this._docPatterns = {};
    this._onError = onError || (() => {});
    this._onWarning = onWarning || (() => {});
    this._audioInitialized = false;
  }

  async importModules() {
    // import desired modules and add them to the eval scope

    this.mini = await import("@strudel/mini");
    this.core = await import("@strudel/core");
    this.draw = await import("@strudel/draw");

    this.webaudio = await import("@strudel/webaudio");

    await evalScope(
      this.core,
      import("@strudel/midi"),
      this.mini,
      this.draw,
      import("@strudel/tonal"),
      import("@strudel/osc"),
      import("@strudel/serial"),
      import("@strudel/soundfonts"),
      this.webaudio,
      controls,
    );
    try {
      await Promise.all([
        loadSamples(),
        registerSynthSounds(),
        registerSoundfonts(),
      ]);
    } catch (err) {
      this._onWarning(`Failed to load default samples EmuSP12: ${err}`);
    }
  }

  async initAudio() {
    if (this._audioInitialized) return;
    await initAudio();
    this._audioInitialized = true;
  }

  async initialize() {
    if (this.initialized) return;

    let lastFrame: number | null = null;
    this.framer = new Framer(
      () => {
        const phase = this._repl.scheduler.now();
        if (lastFrame === null) {
          lastFrame = phase;
          return;
        }
        if (!this._repl.scheduler.pattern) {
          return;
        }
        // queries the stack of strudel patterns for the current time
        const allHaps = this._repl.scheduler.pattern.queryArc(
          Math.max(lastFrame!, phase - 1 / 10), // make sure query is not larger than 1/10 s
          phase,
        );
        // filter out haps that are not active right now
        const currentFrame = allHaps.filter(
          (hap: any) => phase >= hap.whole.begin && phase <= hap.endClipped,
        );
        // iterate over each strudel doc
        Object.keys(this._docPatterns).forEach((docId: any) => {
          // filter out haps belonging to this document (docId is set in tryEval)
          const haps = currentFrame.filter((h: any) => h.value.docId === docId);
          // update codemirror view to highlight this frame's haps
          updateDocumentsContext(docId, { haps, phase });
        });
      },
      (err: any) => {
        console.error("[strudel] draw error", err);
      },
    );

    this._repl = repl({
      defaultOutput: webaudioOutput,
      afterEval: (options: any) => {
        // assumes docId is injected at end end as a comment
        const docId = options.code.split("//").slice(-1)[0];
        if (!docId) return;
        const miniLocations = options.meta?.miniLocations;
        updateDocumentsContext(docId, { miniLocations });
      },
      beforeEval: () => {},
      onSchedulerError: (e: unknown) => this._onError(`${e}`),
      onEvalError: (e: unknown) => this._onError(`${e}`),
      getTime: () => getAudioContext().currentTime,
      transpiler,
    });

    this.framer.start();

    // For some reason, we need to make a no-op evaluation ("silence") to make
    // sure everything is loaded correctly.
    const pattern = await this._repl.evaluate(`silence//`);
    await this._repl.scheduler.setPattern(pattern, true);

    this.initialized = true;
  }

  async dispose() {
    if (this.framer) {
      this.framer.stop();
    }
  }

  async tryEval(msg: EvalMessage) {
    if (!this.initialized) await this.initialize();
    try {
      const { body: code, docId } = msg;
      // little hack that injects the docId at the end of the code to make it available in afterEval
      // also add ann analyser node to all patterns, for fft data in hydra
      const pattern = await this._repl.evaluate(
        `${code}\n${this.enableAutoAnalyze ? this.hapAnalyzeSnippet : ""}\n//${docId}`,
      );
      if (pattern) {
        this._docPatterns[docId] = pattern.docId(docId); // docId is needed for highlighting
        const allPatterns = stack(...Object.values(this._docPatterns));
        await this._repl.scheduler.setPattern(allPatterns, true);
      }
    } catch (err) {
      console.error(err);
      this._onError(`${err}`);
    }
  }
}

async function loadSamples() {
  const ds = "https://raw.githubusercontent.com/felixroos/dough-samples/main/";
  return Promise.all([
    samples(`${ds}/tidal-drum-machines.json`),
    samples(`${ds}/piano.json`),
    samples(`${ds}/Dirt-Samples.json`),
    samples(`${ds}/EmuSP12.json`),
    samples(`${ds}/vcsl.json`),
  ]);
}

// this is a little bit awkward but the piano function has to be duplicated here..
const maxPan = noteToMidi("C8");
const panwidth = (pan: any, width: any) => pan * width + (1 - width) / 2;

Pattern.prototype.piano = function () {
  return this.fmap((v: any) => ({ ...v, clip: v.clip ?? 1 })) // set clip if not already set..
    .s("piano")
    .release(0.1)
    .fmap((value: any) => {
      const midi = valueToMidi(value);
      // pan by pitch
      const pan = panwidth(Math.min(Math.round(midi) / maxPan, 1), 0.5);
      return { ...value, pan: (value.pan || 1) * pan };
    });
};
