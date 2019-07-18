import React from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import WebSocket from "reconnecting-websocket";
import ShareDB from "sharedb/lib/client";
import ShareDBCodeMirror from "../lib/sharedb-codemirror";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/haskell/haskell";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/material.css";

class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "Not connected"
    };
  }

  componentDidMount() {
    // const userId = Math.floor(Math.random() * Math.floor(99999));
    const userName = window.location.hash
      ? window.location.hash.substring(1)
      : "anonymous";

    this.socket = new WebSocket(`ws://localhost:8080`);
    this.connection = new ShareDB.Connection(this.socket);
    this.shareDBCodeMirror = new ShareDBCodeMirror(this.editor.editor, {
      verbose: true,
      key: "content",
      user: { id: userName, name: userName }
    });

    this.socket.onopen = () => {
      this.setState({ status: "Connected" });
    };

    this.socket.onclose = () => {
      this.setState({ status: "Closed" });
    };

    this.socket.onerror = () => {
      this.setState({ status: "Error" });
    };

    this.doc = this.connection.get("flok", "foo");
    this.shareDBCodeMirror.attachDoc(this.doc, err => {
      if (err) throw err;
    });
  }

  componentWillUnmount() {
    console.log("detach doc");
    this.shareDBCodeMirrordetachDoc();
  }

  render() {
    const { status } = this.state;
    return (
      <React.Fragment>
        <span className="status">{status}</span>
        <CodeMirror
          ref={c => {
            this.editor = c;
          }}
          {...this.props}
        />
        <style jsx global>
          {`
            .status {
              z-index: 1;
            }
            .CodeMirror {
              position: absolute;
              top: 10;
              bottom: 0;
              left: 0;
              right: 0;
              height: 90%;
            }
          `}
        </style>
      </React.Fragment>
    );
  }
}

export default TextEditor;
