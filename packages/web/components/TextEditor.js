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
    const { editorId, sessionClient, onEvaluateCode } = this.props;
    const { editor } = this.cm;

    this.sharedCodeMirror = new SharedCodeMirror({
      editor,
      onEvaluateCode,
      // onEvaluateRemoteCode,
      verbose: true
    });

    sessionClient.attachEditor(editorId, this.sharedCodeMirror);
  }

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
          lineNumbers: true,
          scrollbarStyle: "simple"
        }}
      />
    );
  }
}

TextEditor.propTypes = {
  sessionClient: PropTypes.instanceOf(SessionClient).isRequired,
  editorId: PropTypes.string.isRequired,
  onEvaluateCode: PropTypes.func
  // onEvaluateRemoteCode: PropTypes.func
};

TextEditor.defaultProps = {
  onEvaluateCode: () => {}
  // onEvaluateRemoteCode: () => {}
};

export default TextEditor;
