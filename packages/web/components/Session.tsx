import React, { Component } from "react";
import dynamic from "next/dynamic";

import { PubSubClient } from "flok-core";
import Status from "./Status";
import UserList from "./UserList";
import TargetMessagesPane from "./TargetMessagesPane";
import SessionClient from "../lib/SessionClient";
// import HydraCanvas from "./HydraCanvas";

const MAX_LINES: number = 100;

const LAYOUT = {
  editors: [
    { id: "1", target: "default" },
    { id: "2", target: "default" },
    { id: "3", target: "default" },
    { id: "4", target: "default" },
    { id: "5", target: "default" },
    { id: "6", target: "default" }
  ]
};

const TextEditor = dynamic(() => import("./TextEditor"), {
  ssr: false
});

interface Message {
  target: string;
  content: string;
}

type Props = {
  websocketsHost: string;
  sessionName: string;
  userName?: string;
};

type State = {
  status: string;
  showUserList: boolean;
  showTargetMessagesPane: boolean;
  showTextEditors: boolean;
  messages: Message[];
  users: string[];
  messagesPaneIsTop: boolean;
  messagesPaneIsMaximized: boolean;
  hydraCode: string;
};

class Session extends Component<Props, State> {
  state: State = {
    status: "Not connected",
    showUserList: true,
    showTargetMessagesPane: false,
    showTextEditors: false,
    messages: [],
    users: [],
    messagesPaneIsTop: false,
    messagesPaneIsMaximized: false,
    hydraCode: ""
  };
  pubsubClient: PubSubClient;
  sessionClient: SessionClient;

  static defaultProps = {
    userName: "anonymous"
  };

  componentDidMount() {
    const { sessionName, userName } = this.props;

    const targets = [...new Set(LAYOUT.editors.map(({ target }) => target))];
    console.log("Targets:", targets);

    const wsUrl: string = this.getWebsocketsUrl();

    const wsDbUrl: string = `${wsUrl}/db`;
    console.log(`Database WebSocket URL: ${wsDbUrl}`);

    const pubsubWsUrl: string = `${wsUrl}/pubsub`;
    console.log(`Pub/Sub WebSocket URL: ${pubsubWsUrl}`);

    this.pubsubClient = new PubSubClient(pubsubWsUrl, {
      connect: true,
      reconnect: true,
      onMeMessage: (clientId: string) => {
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
        targets.forEach(target => {
          this.pubsubClient.subscribe(`target:${target}:out`, content =>
            this.handleMessageTarget({ target, content })
          );
        });
      },
      onClose: () => {
        this.sessionClient.release();
        this.sessionClient = null;
      }
    });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (this.sessionClient) {
      const { userName } = this.props;
      // const { target } = this.state;

      // If username changed, set new username
      if (prevProps.userName !== userName) {
        console.log(`Change username to '${userName}'`);
        this.sessionClient.setUsername(userName);
      }

      // If target changed, unsubscribe from previous target, and subscribe to
      // new target.
      // if (prevState.target !== target) {
      //   // TODO: ...
      // }
    }
  }

  componentWillUnmount() {
    if (this.sessionClient) {
      this.sessionClient.release();
      this.sessionClient = null;
    }
  }

  getWebsocketsUrl(): string {
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

  handleUsersChange = (users: string[]) => {
    console.debug("Users:", users);
    this.setState({ users });
  };

  handleEvaluateCode = ({ editorId, target, body, fromLine, toLine, user }) => {
    const { pubsubClient, sessionClient } = this;
    const { userName } = this.props;

    // this.setState({ showTargetMessagesPane: false });

    if (target === "hydra") {
      this.setState({ hydraCode: body });
    } else {
      pubsubClient.publish(`target:${target}:in`, { userName, body });
    }

    sessionClient.evaluateCode({ editorId, body, fromLine, toLine, user });
  };

  handleEvaluateRemoteCode = ({ _editorId, target, body }) => {
    if (target === "hydra") {
      this.setState({ hydraCode: body });
    }
  };

  handleCursorActivity = ({ editorId, line, column }) => {
    this.sessionClient.updateCursorActivity({ editorId, line, column });
  };

  handleMessageTarget = ({ target, content }) => {
    console.debug(`[message] [target=${target}] ${JSON.stringify(content)}`);
    this.setState(prevState => {
      const allMessages = [...prevState.messages, { target, content }];
      return {
        messages: allMessages.slice(-MAX_LINES, allMessages.length),
        showTargetMessagesPane: true
      };
    });
  };

  handleMessageUser = (message: string) => {
    console.debug(`[message] user: ${JSON.stringify(message)}`);
  };

  toggleUserList = () => {
    this.setState((prevState: State, _) => ({
      showUserList: !prevState.showUserList
    }));
  };

  handleTargetMessagesPaneTogglePosition = () => {
    this.setState((prevState: State) => ({
      messagesPaneIsTop: !prevState.messagesPaneIsTop
    }));
  };

  handleTargetMessagesPaneToggleMaximize = () => {
    this.setState((prevState: State) => ({
      messagesPaneIsMaximized: !prevState.messagesPaneIsMaximized
    }));
  };

  handleTargetMessagesPaneClose = () => {
    this.setState({ showTargetMessagesPane: false });
  };

  render() {
    const {
      status,
      users,
      messages,
      showTextEditors,
      showUserList,
      showTargetMessagesPane,
      messagesPaneIsTop,
      messagesPaneIsMaximized
      // hydraCode
    } = this.state;

    const { sessionClient } = this;

    return (
      // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
      <div>
        {/*<HydraCanvas code={hydraCode} fullscreen />*/}
        <Status>{status}</Status>
        {showTextEditors && (
          <div className="columns is-gapless is-multiline">
            {LAYOUT.editors.map(({ id, target }) => (
              <div key={id} className="column is-4">
                <TextEditor
                  editorId={id}
                  target={target}
                  sessionClient={sessionClient}
                  onEvaluateCode={this.handleEvaluateCode}
                  onEvaluateRemoteCode={this.handleEvaluateRemoteCode}
                  onCursorActivity={this.handleCursorActivity}
                />
              </div>
            ))}
          </div>
        )}
        {showUserList && <UserList users={users} />}
        {showTargetMessagesPane && messages && (
          <TargetMessagesPane
            messages={messages}
            isTop={messagesPaneIsTop}
            isMaximized={messagesPaneIsMaximized}
            onTogglePosition={this.handleTargetMessagesPaneTogglePosition}
            onToggleMaximize={this.handleTargetMessagesPaneToggleMaximize}
            onClose={this.handleTargetMessagesPaneClose}
          />
        )}
        <style jsx>
          {`
            .columns {
              margin: 0;
              padding: 0;
            }
            .column {
              margin: 0;
              padding: 0;
              box-shadow: 2px 2px 2px 2px rgba(0, 0, 0, 0.2);
            }
          `}
        </style>
      </div>
    );
  }
}

export default Session;
