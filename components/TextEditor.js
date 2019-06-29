import PropTypes from "prop-types";
import React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import WebSocket from "reconnecting-websocket";
import ShareDB from "sharedb/lib/client";

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
    const socket = new WebSocket(`ws://localhost:8080`);
    this.socket = socket;
    const connection = new ShareDB.Connection(socket);
    this.connection = connection;

    socket.onopen = () => {
      this.setState({ status: "Connected" });

      const doc = connection.get("flok", "foo");
      this.doc = doc;

      doc.fetch(err => {
        if (err) throw err;

        const { onFetch } = this.props;
        onFetch(doc.data.content);
      });

      doc.subscribe(err => {
        if (err) throw err;

        doc.on("op", (op, source) => {
          console.log(`[op] op=${op}, source=${source}`);
        });

        doc.on("del", (data, source) => {
          console.log(`[del] data=${data}, source=${source}`);
        });

        doc.on("error", error => {
          console.error(error);
        });
      });
    };

    socket.onclose = () => {
      this.setState({ status: "Closed" });
    };

    socket.onerror = () => {
      this.setState({ status: "Error" });
    };
  }

  render() {
    const { status } = this.state;
    return (
      <React.Fragment>
        <span className="status">{status}</span>
        <CodeMirror {...this.props} />
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

TextEditor.propTypes = {
  onFetch: PropTypes.func.isRequired
};

export default TextEditor;
