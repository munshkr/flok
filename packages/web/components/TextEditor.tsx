/* eslint-disable import/no-extraneous-dependencies */
import React, { Component } from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import { faPlayCircle } from "@fortawesome/free-solid-svg-icons";

import SessionClient from "../lib/SessionClient";
import Button from "./Button";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/haskell/haskell";
import "codemirror/mode/javascript/javascript";
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

type Props = {
  sessionClient: SessionClient;
  editorId: string;
  target?: string;
  isHalfHeight?: boolean;
  onEvaluateCode?: (args: EvaluateCodeArgs) => void;
  onEvaluateRemoteCode?: (args: EvaluateRemoteCodeArgs) => void;
  onCursorActivity?: (args: CursorActivityArgs) => void;
};

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
      const line = lines[i].replace(/\t/g, '    ').trimEnd();
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

  handleEvaluateButtonClick = () => {
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

  scLangFreeAll = () => {
    this.evaluate("s.freeAll", -1, -1);
  };

  render() {
    const { editorId, isHalfHeight, target } = this.props;

    const defaultExtraKeys = {
      "Shift-Enter": this.evaluateLine,
      "Ctrl-Enter": this.evaluateParagraph,
      "Cmd-Enter": this.evaluateParagraph
    };

    const extraKeys =
      target === "sclang"
        ? {
            "Ctrl-.": this.scLangFreeAll,
            "Cmd-.": this.scLangFreeAll,
            ...defaultExtraKeys
          }
        : defaultExtraKeys;

    return (
      <div>
        <div className="evaluate">
          <Button
            icon={faPlayCircle}
            onClick={this.handleEvaluateButtonClick}
          />
        </div>
        <span className="desc">{`${editorId} ${target}`}</span>
        <CodeMirror
          className={`editor ${isHalfHeight && "is-half-height"}`}
          ref={el => {
            this.cm = el;
          }}
          options={{
            mode: "haskell",
            theme: "material",
            lineNumbers: false,
            lineWrapping: true,
            extraKeys
          }}
        />
      </div>
    );
  }
}

export default TextEditor;
