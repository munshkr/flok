/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import css from "styled-jsx/css";

import SessionClient from "../lib/SessionClient";
import IconButton from "./IconButton";

import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/haskell/haskell";
import "codemirror/mode/smalltalk/smalltalk";
import "codemirror/addon/scroll/simplescrollbars";
import "codemirror/addon/selection/mark-selection";

type EvaluateCodeArgs = {
  editorId: string;
  target: string;
  body: string;
  fromLine: number;
  toLine: number;
  user?: string;
  locally?: boolean;
};

type EvaluateRemoteCodeArgs = {
  editorId: string;
  target: string;
  body: string;
};

type CursorActivityArgs = {
  editorId: string;
  line: number;
  column: number;
};

interface Props {
  sessionClient: SessionClient;
  editorId: string;
  target?: string;
  isHalfHeight?: boolean;
  readonly?: boolean;
  onEvaluateCode?: (args: EvaluateCodeArgs) => void;
  onEvaluateRemoteCode?: (args: EvaluateRemoteCodeArgs) => void;
  onCursorActivity?: (args: CursorActivityArgs) => void;
}

const modesByTarget = {
  tidal: "haskell",
  foxdot: "python",
  sclang: "smalltalk",
  hydra: "javascript",
};

const EvaluateButton = ({ onClick }) => {
  const { className, styles } = css.resolve`
    @media only screen and (max-width: 800px) {
      a {
        position: absolute;
        top: 10px;
        right: 15px;
        font-size: 2em;
        margin: 0 0.125em;
        color: #888;
        z-index: 999;
      }
      a:hover {
        color: #fefefe;
      }
    }
  `;

  return (
    <div>
      <IconButton className={className} icon={faPlayCircle} onClick={onClick} />
      <style jsx>{`
        div {
          display: none;
        }

        @media only screen and (max-width: 800px) {
          div {
            position: relative;
            display: block;
          }
        }
      `}</style>
      {styles}
    </div>
  );
};

const Description = ({ editorId, target }) => (
  <span>
    {`${editorId} ${target}`}
    <style jsx>{`
      span {
        color: #888;
        background-color: rgba(0, 0, 0, 0.6);
        border-radius: 4px;
        font-family: Monaco, monospace;
        font-size: 13px;
        margin-left: 4px;
        padding: 3px 5px;
      }
    `}</style>
  </span>
);

class TextEditor extends Component<Props, {}> {
  static defaultProps = {
    target: "default",
    onEvaluateCode: () => {},
    onEvaluateRemoteCode: () => {},
    onCursorActivity: () => {},
  };

  cm: any;

  componentDidMount() {
    const { editorId, sessionClient } = this.props;
    const { editor } = this.cm;

    sessionClient.attachEditor(editorId, editor);
  }

  evaluateLine = (locally: boolean = false) => {
    const { editor } = this.cm;

    const currentLine = editor.getCursor().line;
    const lines = editor.getValue().split("\n");
    const code = lines[currentLine].trim();

    if (code !== "") {
      this.evaluate(code, currentLine, currentLine, locally);
    }
  };

  getCurrentBlock = () => {
    const { target } = this.props;
    if (["sclang", "remote_sclang"].indexOf(target) >= 0) {
      return this.getCurrentBlockSclang();
    }
    return this.getCurrentBlockNewlines();
  };

  getCurrentBlockNewlines = () => {
    const { editor } = this.cm;
    const currentLine = editor.getCursor().line;
    const content = `${editor.getValue()}\n`;
    const lines = content.split("\n");

    let code = "";
    let start = false;
    let stop = false;
    let begin = null;
    let end = null;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].replace(/\t/g, "    ").trimEnd();
      const lineLength = line.length;
      if (!start) {
        if (!lineLength) {
          code = "";
          begin = i + 1;
          end = begin;
        }
        if (i === currentLine) start = true;
      }
      if (!stop) {
        if (start && !lineLength) {
          stop = true;
          end = i - 1;
        } else if (lineLength) {
          code += `${line}\n`;
        }
      }
    }

    return [code, begin, end];
  };

  getCurrentBlockSclang = () => {
    const { editor } = this.cm;
    const blocks = this.getBlocksSclang();
    // console.debug("Blocks:", blocks);
    const curLine = editor.getCursor().line;

    // Get blocks that contain current line
    const curBlocks = blocks.filter(([s, e]) => curLine >= s && curLine <= e);
    // console.debug("Current blocks:", curBlocks);

    // Keep only the largest enclosing block (i.e. start pos is smallest)
    const curBlock =
      curBlocks.length > 0 &&
      curBlocks.reduce((prev, curr) => {
        return prev[0] < curr[0] ? prev : curr;
      });
    // console.log("Current block:", curBlock);

    if (curBlock) {
      const [start, end] = curBlock;
      const content = editor
        .getValue()
        .split("\n")
        .slice(start, end + 1)
        .join("\n");
      return [content, start, end];
    }

    // If there is no current block, just evaluate current line
    const lines = editor.getValue().split("\n");
    return [lines[curLine], curLine, curLine];
  };

  getBlocksSclang = () => {
    const { editor } = this.cm;
    const content = editor.getValue();

    const blocks = [];
    const parensStack = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].trim();
      if (line !== "") {
        const firstChar = line[0];
        if (firstChar === "(") {
          parensStack.push(i);
        } else if (firstChar === ")") {
          const start = parensStack.pop();
          if (start !== undefined) {
            const end = i;
            blocks.push([start, end]);
          }
        }
      }
    }

    return blocks;
  };

  evaluateBlock = (locally: boolean = false) => {
    const [code, begin, end] = this.getCurrentBlock();
    if (code !== "") {
      this.evaluate(code, begin, end, locally);
    }
  };

  // evaluate the full page of code
  evaluateAll = (locally: boolean = false) => {
    const { editor } = this.cm;
    const content = `${editor.getValue()}\n`;

    this.evaluate(content, 0, content.length, locally);
  };

  evaluate(
    body: string,
    fromLine: number = -1,
    toLine: number = -1,
    locally: boolean = false
  ) {
    const { editorId, target, onEvaluateCode, sessionClient } = this.props;

    // console.debug("texteitor.evalute: locally = ", locally)
    onEvaluateCode({ editorId, target, body, fromLine, toLine, locally });
    sessionClient.flash(editorId, fromLine, toLine);
  }

  handleEvaluateButtonClick = (e: MouseEvent) => {
    const { editorId, target, onEvaluateCode } = this.props;
    const { editor } = this.cm;

    return onEvaluateCode({
      editorId,
      target,
      body: editor.getValue(),
      fromLine: 0,
      toLine: editor.lineCount(),
    });
  };

  freeAllSoundCode() {
    const { target } = this.props;
    if (target === "tidal") {
      return "hush";
    } else if (target === "sclang" || target === "remote_sclang") {
      return "CmdPeriod.run";
    } else if (target === "foxdot") {
      return "Clock.clear()";
    } else if (target === "mercury") {
      return "silence";
    }
  }

  freeAllSound = () => {
    this.evaluate(this.freeAllSoundCode());
  };

  render() {
    const { editorId, isHalfHeight, target, readonly } = this.props;

    let defaultExtraKeys = {
      "Shift-Enter": () => this.evaluateLine(false),
      "Ctrl-Enter": () => this.evaluateBlock(false),
      "Cmd-Enter": () => this.evaluateBlock(false),
      "Shift-Alt-Enter": () => this.evaluateLine(true),
      "Ctrl-Alt-Enter": () => this.evaluateBlock(true),
      "Cmd-Alt-Enter": () => this.evaluateBlock(true),
    };

    // Replace shortkeys when using Mercury
    // Because Mercury always replaces the entire code with the newly
    // executed page. No per-line evaluation
    if (target === "mercury") {
      defaultExtraKeys = {
        ...{
          "Shift-Enter": () => this.evaluateAll(false),
          "Ctrl-Enter": () => this.evaluateAll(false),
          "Cmd-Enter": () => this.evaluateAll(false),
          "Alt-Enter": () => this.evaluateAll(false),
          "Shift-Alt-Enter": () => this.evaluateAll(true),
          "Ctrl-Alt-Enter": () => this.evaluateAll(true),
          "Cmd-Alt-Enter": () => this.evaluateAll(true),
        },
      };
    }

    const extraKeys = {
      "Ctrl-.": this.freeAllSound,
      "Cmd-.": this.freeAllSound,
      "Alt-.": this.freeAllSound,
      ...defaultExtraKeys,
    };

    const mode = modesByTarget[target] || "javascript";

    let options = {
      mode,
      theme: "material",
      lineNumbers: false,
      lineWrapping: true,
      extraKeys,
    };

    if (readonly) {
      options["readOnly"] = "nocursor";
    }

    // const { className: heightClassName, styles: heightStyles } = css.resolve`
    //   .CodeMirror {
    //     height: ${isHalfHeight ? '50vh' : '100vh'};
    //   }
    // `;

    return (
      <div className="editor-container">
        <EvaluateButton onClick={this.handleEvaluateButtonClick} />
        <Description editorId={editorId} target={target} />
        <CodeMirror
          className="editor"
          ref={(el) => {
            this.cm = el;
          }}
          options={options}
        />
        <style jsx global>{`
          .editor > .CodeMirror {
            background-color: rgba(0, 0, 0, 0) !important;
            font-family: "Roboto Mono", monospace;
            font-size: 16px;
            overflow: y-scroll;
            height: ${isHalfHeight ? "46vh" : "97vh"};
          }
          .editor > .CodeMirror .CodeMirror-line > span {
            text-shadow: 2px 2px 4px #000000;
            background-color: #000000;
          }
          .editor > .CodeMirror .CodeMirror-selected {
            background-color: #f0717850 !important;
          }

          @keyframes flash {
            0% {
              color: #000;
              background-color: #ffff77cc;
            }
            100% {
              color: auto;
              background-color: #00000000;
            }
          }

          .editor > .CodeMirror .CodeMirror-line .flash-selection {
            animation: flash 0.4s linear;
            background-color: #00000000;
          }

          @media only screen and (max-width: 800px) {
            .editor > .CodeMirror {
              height: 97vh;
            }
          }
        `}</style>
      </div>
    );
  }
}

export default TextEditor;
