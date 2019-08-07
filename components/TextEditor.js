import React from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
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

const WEBSOCKETS_URL = `ws://localhost:3000/`;
const EVAL_WEBSOCKETS_URL = `ws://localhost:3001/`;

// FIXME Should be a prop
const documentId = `foo`;
// FIXME Should be a state var
const target = `tidal`;

class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: "anonymous",
      status: "Not connected",
      showUserList: true,
      showTargetMessagesPane: true,
      messages: [],
      users: []
    };
  }

  componentDidMount() {
    // FIXME Should be a state var
    const userName = window.location.hash
      ? window.location.hash.substring(1)
      : "anonymous";
    this.state.userName = userName;

    // const userId = Math.floor(Math.random() * Math.floor(99999));
    this.liveCodeMirror = new LiveCodeMirror(
      this.editor.editor,
      WEBSOCKETS_URL,
      {
        userId: userName,
        extraKeys: {
          "Ctrl-Alt-U": this.toggleUserList
        },
        onConnectionOpen: this.handleConnectionOpen,
        onConnectionClose: this.handleConnectionClose,
        onConnectionError: this.handleConnectionError,
        onUsersChange: this.handleUsersChange,
        onEvaluateCode: this.handleEvaluateCode,
        onEvaluateRemoteCode: this.handleEvaluateRemoteCode,
        verbose: true
      }
    );

    this.liveCodeMirror.setUsername(userName);

    this.liveCodeMirror.attachDocument("flok", documentId);

    this.pubsubClient = new PubSubClient(EVAL_WEBSOCKETS_URL, {
      connect: true,
      reconnect: true
    });

    // Subscribes to messages from targets (e.g. stdout and stderr REPLs)
    this.pubsubClient.subscribe(`${target}:out`, this.handleMessageTarget);

    // Subscribes to messages directed to ourselves
    this.pubsubClient.subscribe(userName, this.handleMessageUser);
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
    this.pubsubClient.publish(`${target}:in`, { userName, body });
  };

  handleEvaluateRemoteCode = (body, userName) => {
    // this.pubsubClient.publish(`${target}:in`, { userName, body });
  };

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
          ref={c => {
            this.editor = c;
          }}
          {...this.props}
        />
        {showUserList && <UserList users={users} />}
        {showTargetMessagesPane && messages && (
          <TargetMessagesPane messages={messages} />
        )}
        <style jsx global>
          {`
            .CodeMirror {
              position: absolute;
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
              height: 100%;
            }
            .flash-selection {
              background-color: #ff7;
              color: #000;
            }
          `}
        </style>
      </React.Fragment>
    );
  }
}

export default TextEditor;
