import React from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import PropTypes from "prop-types";
import getConfig from "next/config";

import LiveCodeMirror from "../lib/livecodemirror";
import PubSubClient from "../lib/pubsub-client";

import Status from "./Status";
import UserList from "./UserList";
import TargetMessagesPane from "./TargetMessagesPane";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/haskell/haskell";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/material.css";
import "codemirror/addon/scroll/simplescrollbars";
import "codemirror/addon/scroll/simplescrollbars.css";
import "codemirror/addon/selection/mark-selection";

const { publicRuntimeConfig } = getConfig();
const { NODE_ENV } = publicRuntimeConfig;

const WS_PROTOCOL = NODE_ENV === "production" ? "wss" : "ws";

// FIXME Should be a state var
const target = `default`;

class TextEditor extends React.Component {
  state = {
    userName: "anonymous",
    status: "Not connected",
    showUserList: true,
    showTargetMessagesPane: true,
    messages: [],
    users: []
  };

  componentDidMount() {
    const { websocketsHost, sessionName } = this.props;
    const { userName } = this.state;

    const wsDbUrl = `${WS_PROTOCOL}://${websocketsHost}/db`;
    console.log(`Database WebSocket URL: ${wsDbUrl}`);

    const pubsubWsUrl = `${WS_PROTOCOL}://${websocketsHost}/pubsub`;
    console.log(`Pub/Sub WebSocket URL: ${pubsubWsUrl}`);

    this.pubsubClient = new PubSubClient(pubsubWsUrl, {
      connect: true,
      reconnect: true,
      onMeMessage: clientId => {
        this.liveCodeMirror = new LiveCodeMirror(this.editor.editor, wsDbUrl, {
          userId: clientId,
          extraKeys: {
            "Ctrl-Alt-U": this.toggleUserList,
            "Ctrl-Alt-M": this.toggleTargetMessagesPane
          },
          onConnectionOpen: this.handleConnectionOpen,
          onConnectionClose: this.handleConnectionClose,
          onConnectionError: this.handleConnectionError,
          onUsersChange: this.handleUsersChange,
          onEvaluateCode: this.handleEvaluateCode,
          // onEvaluateRemoteCode: this.handleEvaluateRemoteCode,
          verbose: true
        });

        this.liveCodeMirror.attachDocument("flok", sessionName);
        this.liveCodeMirror.setUsername(userName);

        // Subscribes to messages directed to ourselves
        this.pubsubClient.subscribe(`user:${clientId}`, this.handleMessageUser);
      },
      onClose: () => {
        this.liveCodeMirror.detachDocument();
        this.liveCodeMirror = null;
      }
    });

    // Subscribes to messages from targets (e.g. stdout and stderr REPLs)
    this.pubsubClient.subscribe(
      `target:${target}:out`,
      this.handleMessageTarget
    );
  }

  componentDidUpdate(_prevProps, prevState, _snapshot) {
    if (this.liveCodeMirror) {
      const { userName } = this.state;
      if (prevState.userName !== userName) {
        console.log(`Change username to '${userName}'`);
        this.liveCodeMirror.setUsername(userName);
      }
    }
  }

  componentWillUnmount() {
    // console.log("detach doc");
    this.liveCodeMirror.detachDocument();
  }

  handleConnectionOpen = () => {
    this.setState({ status: "Connected" });
  };

  handleConnectionClose = () => {
    this.setState({ status: "Disconnected" });
  };

  handleConnectionError = () => {
    this.setState({ status: "Error" });
  };

  handleUsersChange = users => {
    console.log(users);
    this.setState({ users });
  };

  handleEvaluateCode = body => {
    const { userName } = this.state;
    this.pubsubClient.publish(`target:${target}:in`, { userName, body });
  };

  // handleEvaluateRemoteCode = (body, userName) => {
  //   this.pubsubClient.publish(`target:${target}:in`, { userName, body });
  // };

  handleMessageTarget = message => {
    console.log(`[message] target: ${JSON.stringify(message)}`);
    this.setState(prevState => ({
      messages: [message, ...prevState.messages]
    }));
  };

  handleMessageUser = message => {
    console.log(`[message] user: ${JSON.stringify(message)}`);
  };

  toggleUserList = e => {
    this.setState((prevState, _) => ({
      showUserList: !prevState.showUserList
    }));
  };

  toggleTargetMessagesPane = e => {
    this.setState((prevState, _) => ({
      showTargetMessagesPane: !prevState.showTargetMessagesPane
    }));
  };

  render() {
    const {
      status,
      users,
      messages,
      showUserList,
      showTargetMessagesPane
    } = this.state;

    return (
      <React.Fragment>
        <Status>{status}</Status>
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
        {showUserList && <UserList users={users} />}
        {showTargetMessagesPane && messages && (
          <TargetMessagesPane messages={messages} />
        )}
      </React.Fragment>
    );
  }
}

TextEditor.propTypes = {
  websocketsHost: PropTypes.string.isRequired,
  sessionName: PropTypes.string.isRequired
};

export default TextEditor;
