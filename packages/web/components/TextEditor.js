import React from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import PropTypes from "prop-types";
import { PubSubClient } from "flok-core";
import LiveCodeMirror from "../lib/livecodemirror";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/haskell/haskell";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/material.css";
import "codemirror/addon/scroll/simplescrollbars";
import "codemirror/addon/scroll/simplescrollbars.css";
import "codemirror/addon/selection/mark-selection";

class TextEditor extends React.Component {
  componentDidMount() {
    const {
      websocketsHost,
      sessionName,
      userName,
      target,
      onConnectionOpen,
      onConnectionClose,
      onConnectionError,
      onUsersChange
    } = this.props;

    const wsProtocol = location.protocol === "https:" ? "wss:" : "ws:";
    const wsDbUrl = `${wsProtocol}//${websocketsHost}/db`;
    console.log(`Database WebSocket URL: ${wsDbUrl}`);

    const pubsubWsUrl = `${wsProtocol}//${websocketsHost}/pubsub`;
    console.log(`Pub/Sub WebSocket URL: ${pubsubWsUrl}`);

    this.pubsubClient = new PubSubClient(pubsubWsUrl, {
      connect: true,
      reconnect: true,
      onMeMessage: clientId => {
        this.liveCodeMirror = new LiveCodeMirror(this.editor.editor, wsDbUrl, {
          userId: clientId,
          // extraKeys: {
          //   "Ctrl-Alt-U": this.toggleUserList,
          //   "Ctrl-Alt-M": this.toggleTargetMessagesPane
          // },
          onConnectionOpen,
          onConnectionClose,
          onConnectionError,
          onUsersChange,
          onEvaluateCode: this.handleEvaluateCode,
          // onEvaluateRemoteCode: this.handleEvaluateRemoteCode,
          verbose: true
        });

        this.liveCodeMirror.attachDocument("flok", sessionName);
        this.liveCodeMirror.setUsername(userName);

        // Subscribes to messages directed to ourselves
        const { onMessageUser } = this.props;
        this.pubsubClient.subscribe(`user:${clientId}`, onMessageUser);
      },
      onClose: () => {
        this.liveCodeMirror.detachDocument();
        this.liveCodeMirror = null;
      }
    });

    // Subscribes to messages from targets (e.g. stdout and stderr REPLs)
    this.subscribeToTargetOutput(target);
  }

  componentDidUpdate(prevProps) {
    if (this.liveCodeMirror) {
      const { userName, target } = this.props;
      if (prevProps.userName !== userName) {
        console.log(`Change username to '${userName}'`);
        this.liveCodeMirror.setUsername(userName);
      }

      if (prevProps.target !== target) {
        // TODO Unsubscribe from old target and subscribe to new target
        // ...
      }
    }
  }

  componentWillUnmount() {
    // console.log("detach doc");
    this.liveCodeMirror.detachDocument();
  }

  handleEvaluateCode = body => {
    const { userName, target, onEvaluateCode } = this.props;
    this.pubsubClient.publish(`target:${target}:in`, { userName, body });
    onEvaluateCode(body);
  };

  // handleEvaluateRemoteCode = (body, userName) => {
  //   this.pubsubClient.publish(`target:${target}:in`, { userName, body });
  // };

  subscribeToTargetOutput(target) {
    const { onMessageTarget } = this.props;
    this.pubsubClient.subscribe(`target:${target}:out`, onMessageTarget);
  }

  render() {
    return (
      <CodeMirror
        className="editor"
        ref={c => {
          this.editor = c;
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
  websocketsHost: PropTypes.string.isRequired,
  sessionName: PropTypes.string.isRequired,
  userName: PropTypes.string,
  target: PropTypes.string,
  onConnectionOpen: PropTypes.func,
  onConnectionClose: PropTypes.func,
  onConnectionError: PropTypes.func,
  onUsersChange: PropTypes.func,
  onEvaluateCode: PropTypes.func,
  onMessageTarget: PropTypes.func,
  onMessageUser: PropTypes.func
};

TextEditor.defaultProps = {
  userName: "anonymous",
  target: "default",
  onConnectionOpen: () => {},
  onConnectionClose: () => {},
  onConnectionError: () => {},
  onUsersChange: () => {},
  onEvaluateCode: () => {},
  onMessageTarget: () => {},
  onMessageUser: () => {}
};

export default TextEditor;
