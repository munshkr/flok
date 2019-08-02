import React from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import LiveCodeMirror from "../lib/livecodemirror";

import Status from "./Status";
import UserList from "./UserList";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/haskell/haskell";
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/material.css";
import "codemirror/addon/scroll/simplescrollbars";
import "codemirror/addon/scroll/simplescrollbars.css";
import "codemirror/addon/selection/mark-selection";

const WEBSOCKETS_URL = `ws://localhost:3000/`;

class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: "Not connected",
      showUserList: true,
      users: []
    };
  }

  componentDidMount() {
    const userName = window.location.hash
      ? window.location.hash.substring(1)
      : "anonymous";

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
        verbose: true
      }
    );

    this.liveCodeMirror.setUsername(userName);

    // FIXME Use path for different documents
    this.liveCodeMirror.attachDocument("flok", "foo");
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

  toggleUserList = e => {
    this.setState((prevState, _) => ({
      showUserList: !prevState.showUserList
    }));
  };

  render() {
    const { status, users, showUserList } = this.state;

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
