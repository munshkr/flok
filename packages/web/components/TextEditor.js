/* eslint-disable import/no-extraneous-dependencies */
import React from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import PropTypes from "prop-types";

import SharedCodeMirror from "../lib/SharedCodeMirror";
import SessionClient from "../lib/SessionClient";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/haskell/haskell";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/material.css";
import "codemirror/addon/scroll/simplescrollbars";
import "codemirror/addon/scroll/simplescrollbars.css";
import "codemirror/addon/selection/mark-selection";

class TextEditor extends React.Component {
  componentDidMount() {
    const { editorId, sessionClient } = this.props;
    const { editor } = this.cm;

    this.sharedCodeMirror = new SharedCodeMirror({
      editor,
      onEvaluateCode: this.handleEvaluateCode,
      onEvaluateRemoteCode: this.handleEvaluateRemoteCode,
      onCursorActivity: this.handleCursorActivity
    });

    sessionClient.attachEditor(editorId, this.sharedCodeMirror);
  }

  handleEvaluateCode = ({ body, fromLine, toLine, user }) => {
    const { editorId, target, onEvaluateCode } = this.props;
    return onEvaluateCode({ editorId, target, body, fromLine, toLine, user });
  };

  handleEvaluateRemoteCode = ({ body }) => {
    const { editorId, target, onEvaluateRemoteCode } = this.props;
    return onEvaluateRemoteCode({ editorId, target, body });
  };

  handleCursorActivity = ({ line, column }) => {
    const { editorId, onCursorActivity } = this.props;
    return onCursorActivity({ editorId, line, column });
  };

  render() {
    return (
      <CodeMirror
        className="editor"
        ref={el => {
          this.cm = el;
        }}
        options={{
          mode: "haskell",
          theme: "material",
          lineNumbers: false,
          scrollbarStyle: "simple"
        }}
      />
    );
  }
}

TextEditor.propTypes = {
  sessionClient: PropTypes.instanceOf(SessionClient).isRequired,
  editorId: PropTypes.string.isRequired,
  target: PropTypes.string,
  onEvaluateCode: PropTypes.func,
  onEvaluateRemoteCode: PropTypes.func,
  onCursorActivity: PropTypes.func
};

TextEditor.defaultProps = {
  target: "default",
  onEvaluateCode: () => {},
  onEvaluateRemoteCode: () => {},
  onCursorActivity: () => {}
};

export default TextEditor;
