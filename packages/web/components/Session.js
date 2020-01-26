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
    messages: [],
    users: [],
    target: "default"
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
          clientId,
          webSocketsUrl: wsDbUrl,
          onConnectionOpen: this.handleConnectionOpen,
          onConnectionClose: this.handleConnectionClose,
          onConnectionError: this.handleConnectionError,
          onUsersChange: this.handleUsersChange
        });

        this.sessionClient.join(sessionName);
        this.sessionClient.setUsername(userName);

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
    console.log("users:", users);
    this.setState({ users });
  };

  handleEvaluateCode = ({ body, fromLine, toLine, user }) => {
    const { pubsubClient, sessionClient } = this;
    const { userName } = this.props;
    const { target } = this.state;

    pubsubClient.publish(`target:${target}:in`, { userName, code: body });
    sessionClient.evaluateCode({ body, fromLine, toLine, user });
  };

  handleCursorActivity = ({ line, column }) => {
    this.sessionClient.updateCursorActivity({ line, column });
  };

  // handleEvaluateRemoteCode = (body, userName) => {
  //   const { userName } = this.props;
  //   const { target } = this.state
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

  render() {
    const {
      status,
      users,
      messages,
      target,
      showUserList,
      showTargetMessagesPane
    } = this.state;

    const { sessionClient } = this;
    const showTextEditor = Boolean(sessionClient);

    return (
      <React.Fragment>
        <Status>{status}</Status>
        {showTextEditor && (
          <TextEditor
            editorId="main"
            sessionClient={sessionClient}
            onEvaluateCode={this.handleEvaluateCode}
            onCursorActivity={this.handleCursorActivity}
          />
        )}
        {showUserList && <UserList users={users} />}
        <TargetSelect
          value={target}
          options={TARGETS}
          onChange={this.handleTargetSelectChange}
        />
        {showTargetMessagesPane && messages && (
          <TargetMessagesPane messages={messages} />
        )}
      </React.Fragment>
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
