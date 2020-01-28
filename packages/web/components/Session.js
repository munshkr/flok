import React from "react";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";

import { PubSubClient } from "flok-core";
import Status from "./Status";
import UserList from "./UserList";
import TargetMessagesPane from "./TargetMessagesPane";
import TargetSelect from "./TargetSelect";
import SessionClient from "../lib/SessionClient";

const TARGETS = ["default", "tidal", "sclang", "foxdot"];

const TextEditor = dynamic(() => import("./TextEditor"), {
  ssr: false
});

class Session extends React.Component {
  state = {
    status: "Not connected",
    showUserList: true,
    showTargetMessagesPane: true,
    showTextEditors: false,
    messages: [],
    users: [],
    target: "default",
    cursorIsAtTop: true
  };

  componentDidMount() {
    const { sessionName, userName } = this.props;
    const { target } = this.state;

    const wsUrl = this.getWebsocketsUrl();

    const wsDbUrl = `${wsUrl}/db`;
    console.log(`Database WebSocket URL: ${wsDbUrl}`);

    const pubsubWsUrl = `${wsUrl}/pubsub`;
    console.log(`Pub/Sub WebSocket URL: ${pubsubWsUrl}`);

    this.pubsubClient = new PubSubClient(pubsubWsUrl, {
      connect: true,
      reconnect: true,
      onMeMessage: clientId => {
        this.sessionClient = new SessionClient({
          userId: userName,
          webSocketsUrl: wsDbUrl,
          onConnectionOpen: this.handleConnectionOpen,
          onConnectionClose: this.handleConnectionClose,
          onConnectionError: this.handleConnectionError,
          onUsersChange: this.handleUsersChange,
          onJoin: () => {
            this.sessionClient.setUsername(userName);
            this.setState({ showTextEditors: true });
          }
        });

        this.sessionClient.join(sessionName);

        // Subscribes to messages directed to ourselves
        this.pubsubClient.subscribe(`user:${clientId}`, this.handleMessageUser);

        // Subscribe to messages directed to a specific target
        this.pubsubClient.subscribe(
          `target:${target}:out`,
          this.handleMessageTarget
        );
      },
      onClose: () => {
        this.sessionClient.quit();
        this.sessionClient = null;
      }
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.sessionClient) {
      const { userName } = this.props;
      const { target } = this.state;

      // If username changed, set new username
      if (prevProps.userName !== userName) {
        console.log(`Change username to '${userName}'`);
        this.sessionClient.setUsername(userName);
      }

      // If target changed, unsubscribe from previous target, and subscribe to
      // new target.
      if (prevState.target !== target) {
        // TODO: ...
      }
    }
  }

  componentWillUnmount() {
    if (this.sessionClient) {
      this.sessionClient.release();
      this.sessionClient = null;
    }
  }

  getWebsocketsUrl() {
    const { websocketsHost } = this.props;

    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${websocketsHost}`;
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
    console.debug("Users:", users);
    this.setState({ users });
  };

  handleEvaluateCode = ({ editorId, body, fromLine, toLine, user }) => {
    const { pubsubClient, sessionClient } = this;
    const { userName } = this.props;
    const { target } = this.state;

    pubsubClient.publish(`target:${target}:in`, { userName, code: body });
    sessionClient.evaluateCode({ editorId, body, fromLine, toLine, user });
  };

  handleCursorActivity = ({ editorId, line, column }) => {
    this.sessionClient.updateCursorActivity({ editorId, line, column });
  };

  // handleEvaluateRemoteCode = (body, userName) => {
  //   const { userName } = this.props;
  //   const { target } = this.state
  //   this.pubsubClient.publish(`target:${target}:in`, { userName, body });
  // };

  handleMessageTarget = message => {
    console.debug(`[message] target: ${JSON.stringify(message)}`);
    this.setState(prevState => ({
      messages: [message, ...prevState.messages]
    }));
  };

  handleMessageUser = message => {
    console.debug(`[message] user: ${JSON.stringify(message)}`);
  };

  handleTargetSelectChange = e => {
    this.setState({ target: e.target.value });
  };

  toggleUserList = () => {
    this.setState((prevState, _) => ({
      showUserList: !prevState.showUserList
    }));
  };

  toggleTargetMessagesPane = () => {
    this.setState((prevState, _) => ({
      showTargetMessagesPane: !prevState.showTargetMessagesPane
    }));
  };

  handleMouseOver = e => {
    const height = e.currentTarget.clientHeight;
    if (e.screenY < height / 2) {
      this.setState({ cursorIsAtTop: true });
    } else {
      this.setState({ cursorIsAtTop: false });
    }
  };

  render() {
    const {
      status,
      users,
      messages,
      target,
      showTextEditors,
      showUserList,
      showTargetMessagesPane,
      cursorIsAtTop
    } = this.state;

    const { sessionClient } = this;

    return (
      // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
      <div onMouseMove={this.handleMouseOver}>
        <Status>{status}</Status>
        {showTextEditors && (
          <div className="columns is-gapless is-multiline">
            {Array.from({ length: 6 }, (_x, i) => (
              <div className="column is-4">
                <TextEditor
                  key={i}
                  editorId={String(i)}
                  sessionClient={sessionClient}
                  onEvaluateCode={this.handleEvaluateCode}
                  onCursorActivity={this.handleCursorActivity}
                />
              </div>
            ))}
          </div>
        )}
        {showUserList && <UserList users={users} />}
        <TargetSelect
          value={target}
          options={TARGETS}
          onChange={this.handleTargetSelectChange}
        />
        {showTargetMessagesPane && messages && (
          <TargetMessagesPane
            messages={messages}
            className={cursorIsAtTop ? "bottom" : "top"}
          />
        )}
        <style jsx>
          {`
            .columns {
              margin: 0;
              padding: 0;
            }
            .column {
              border-right: 1px solid #546e7a;
              border-bottom: 1px solid #546e7a;
              margin: 0;
              padding: 0;
            }
          `}
        </style>
      </div>
    );
  }
}

Session.propTypes = {
  websocketsHost: PropTypes.string.isRequired,
  sessionName: PropTypes.string.isRequired,
  userName: PropTypes.string
};

Session.defaultProps = {
  userName: "anonymous"
};

export default Session;
