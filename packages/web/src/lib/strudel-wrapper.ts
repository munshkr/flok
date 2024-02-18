import { EvalMessage } from "@flok-editor/session";
import {
  repl,
  controls,
  evalScope,
  stack,
  noteToMidi,
  Pattern,
  valueToMidi,
  Framer,
} from "@strudel/core";
import { transpiler } from "@strudel/transpiler";
import {
  getAudioContext,
  initAudioOnFirstClick,
  webaudioOutput,
  samples,
  registerSynthSounds,
} from "@strudel/webaudio";
import { registerSoundfonts } from "@strudel/soundfonts";
import {
  updateMiniLocations,
  highlightMiniLocations,
} from "@strudel/codemirror";
import { ReactCodeMirrorRef } from "@uiw/react-codemirror";

export type ErrorHandler = (error: string) => void;

export class StrudelWrapper {
  initialized: boolean = false;

  protected _onError: ErrorHandler;
  protected _onWarning: ErrorHandler;
  protected _repl: any;
  protected _docPatterns: any;
  protected _editorRefs?: React.RefObject<ReactCodeMirrorRef>[];
  protected framer?: any;

  constructor({
    onError,
    onWarning,
    editorRefs,
  }: {
    onError?: ErrorHandler;
    onWarning?: ErrorHandler;
    editorRefs?: React.RefObject<ReactCodeMirrorRef>[];
  }) {
    this._docPatterns = {};
    this._onError = onError || (() => {});
    this._onWarning = onWarning || (() => {});
    this._editorRefs = editorRefs;

    let lastFrame: number | null = null;

    this.framer = new Framer(
      () => {
        const phase = this._repl.scheduler.now();
        if (lastFrame === null) {
          lastFrame = phase;
          return;
        }
        if (this._editorRefs) {
          Object.entries(this._docPatterns).forEach(([docId, pat]: any) => {
            const editorRef = this._editorRefs?.[Number(docId) - 1];
            if (editorRef?.current) {
              const haps = pat.queryArc(
                Math.max(lastFrame!, phase - 1 / 10), // make sure query is not larger than 1/10 s
                phase
              );
              const currentFrame = haps.filter(
                (hap: any) =>
                  phase >= hap.whole.begin && phase <= hap.endClipped
              );
              highlightMiniLocations(
                editorRef.current.view,
                phase,
                currentFrame
              );
            }
          });
        }
      },
      () => {
        console.log("draw error");
      }
    );
  }

  async importModules() {
    initAudioOnFirstClick();
    // import desired modules and add them to the eval scope
    await evalScope(
      import("@strudel/core"),
      import("@strudel/midi"),
      import("@strudel/mini"),
      import("@strudel/tonal"),
      import("@strudel/osc"),
      import("@strudel/serial"),
      import("@strudel/soundfonts"),
      import("@strudel/webaudio"),
      controls
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

  async initialize() {
    this._repl = repl({
      defaultOutput: webaudioOutput,
      afterEval: (options: any) => {
        // assumes docId is injected at end end as a comment
        const docId = Number(options.code.split("//").slice(-1)[0]);
        // assumes docId is the editorIndex + 1
        const editorRef = this._editorRefs?.[docId - 1];
        if (editorRef?.current) {
          const miniLocations = options.meta?.miniLocations;
          updateMiniLocations(editorRef.current.view, miniLocations);
        }
        // TODO: find a good place to run an animation loop to call highlightMiniLocations(editor, time, haps);
      },
      beforeEval: () => {},
      onSchedulerError: (e: unknown) => this._onError(`${e}`),
      onEvalError: (e: unknown) => this._onError(`${e}`),
      getTime: () => getAudioContext().currentTime,
      transpiler,
    });
    this.framer.start(); // TODO: when to start stop?

    this.initialized = true;
  }

  async tryEval(msg: EvalMessage) {
    if (!this.initialized) await this.initialize();
    try {
      const { body: code, docId } = msg;
      // little hack that injects the docId at the end of the code to make it available in afterEval
      const pattern = await this._repl.evaluate(code + `//${docId}`);
      if (pattern) {
        this._docPatterns[docId] = pattern;
        const allPatterns = stack(...Object.values(this._docPatterns));
        await this._repl.scheduler.setPattern(allPatterns, true);
        this._onError("");
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
