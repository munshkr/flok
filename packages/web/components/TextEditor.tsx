/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";

import SessionClient from "../lib/SessionClient";
import Button from "./Button";

import "codemirror/lib/codemirror.css";

import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/haskell/haskell";
import "codemirror/mode/smalltalk/smalltalk";

import "codemirror/theme/material.css";
import "codemirror/addon/scroll/simplescrollbars";
import "codemirror/addon/scroll/simplescrollbars.css";
import "codemirror/addon/selection/mark-selection";

type EvaluateCodeArgs = {
  editorId: string;
  target: string;
  body: string;
  fromLine: number;
  toLine: number;
  user?: string;
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
  onEvaluateCode?: (args: EvaluateCodeArgs) => void;
  onEvaluateRemoteCode?: (args: EvaluateRemoteCodeArgs) => void;
  onCursorActivity?: (args: CursorActivityArgs) => void;
}

const modesByTarget = {
  tidal: "haskell",
  foxdot: "python",
  sclang: "smalltalk",
  hydra: "javascript"
};

const EvaluateButton = ({ onClick }) => (
  <div className="evaluate">
    <Button icon={faPlayCircle} onClick={onClick} />
  </div>
);

const Description = ({ editorId, target }) => (
  <span className="desc">{`${editorId} ${target}`}</span>
);

class TextEditor extends Component<Props, {}> {
  static defaultProps = {
    target: "default",
    onEvaluateCode: () => {},
    onEvaluateRemoteCode: () => {},
    onCursorActivity: () => {}
  };

  cm: any;

  componentDidMount() {
    const { editorId, sessionClient } = this.props;
    const { editor } = this.cm;

    sessionClient.attachEditor(editorId, editor);
  }

  evaluateLine = () => {
    const { editor } = this.cm;

    const currentLine = editor.getCursor().line;
    const lines = editor.getValue().split("\n");
    const code = lines[currentLine].trim();

    if (code !== "") {
      this.evaluate(code, currentLine, currentLine);
    }
  };

  evaluateParagraph = () => {
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

    if (code !== "") {
      this.evaluate(code, begin, end);
    }
  };

  evaluate(body: string, fromLine: number, toLine: number) {
    const { editorId, target, onEvaluateCode, sessionClient } = this.props;

    onEvaluateCode({ editorId, target, body, fromLine, toLine });
    sessionClient.flash(editorId, fromLine, toLine);
  }

  handleEvaluateCode = ({ body, fromLine, toLine, user }) => {
    const { editorId, target, onEvaluateCode } = this.props;
    return onEvaluateCode({ editorId, target, body, fromLine, toLine, user });
  };

  handleEvaluateRemoteCode = ({ body }) => {
    const { editorId, target, onEvaluateRemoteCode } = this.props;
    return onEvaluateRemoteCode({ editorId, target, body });
  };

  handleEvaluateButtonClick = (e: MouseEvent) => {
    const { editorId, target, onEvaluateCode } = this.props;
    const { editor } = this.cm;

    return onEvaluateCode({
      editorId,
      target,
      body: editor.getValue(),
      fromLine: 0,
      toLine: editor.lineCount()
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
    }
  }

  freeAllSound = () => {
    this.evaluate(this.freeAllSoundCode(), -1, -1);
  };

  render() {
    const { editorId, isHalfHeight, target } = this.props;

    const defaultExtraKeys = {
      "Shift-Enter": this.evaluateLine,
      "Ctrl-Enter": this.evaluateParagraph,
      "Cmd-Enter": this.evaluateParagraph
    };

    const extraKeys = {
      "Ctrl-.": this.freeAllSound,
      "Cmd-.": this.freeAllSound,
      ...defaultExtraKeys
    };

    const mode = modesByTarget[target] || "javascript";

    const options = {
      mode,
      theme: "material",
      lineNumbers: false,
      lineWrapping: true,
      extraKeys
    };

    return (
      <div>
        <EvaluateButton onClick={this.handleEvaluateButtonClick} />
        <Description editorId={editorId} target={target} />
        <CodeMirror
          className={`editor ${isHalfHeight && "is-half-height"}`}
          ref={el => {
            this.cm = el;
          }}
          options={options}
        />
      </div>
    );
  }
}

export default TextEditor;
