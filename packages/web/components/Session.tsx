import React, { Component } from "react";
import hasWebgl from "../lib/webgl-detector";

import { PubSubClient } from "flok-core";
import TargetMessagesPane, { Message } from "./TargetMessagesPane";
import SessionClient, { IceServerType } from "../lib/SessionClient";
import HydraCanvas from "./HydraCanvas";
import Mosaic from "./Mosaic";
import Audio from "./Audio";

const MAX_LINES: number = 100;

const LOCAL_TARGETS = ["hydra"];

type Props = {
  websocketsHost: string;
  sessionName: string;
  userName?: string;
  hydraEnabled: boolean;
  extraIceServers?: IceServerType[];
  layout: {
    editors: {
      id: string;
      target: string;
    }[];
  };
};

type State = {
  showTargetMessagesPane: boolean;
  showTextEditors: boolean;
  messagesByClientId: { [clientId: string]: Message[] };
  messagesPaneIsTop: boolean;
  messagesPaneIsMaximized: boolean;
  hydraCode: string;
};

class Session extends Component<Props, State> {
  state: State = {
    showTargetMessagesPane: false,
    showTextEditors: false,
    messagesByClientId: {},
    messagesPaneIsTop: false,
    messagesPaneIsMaximized: false,
    hydraCode: "",
  };
  pubsubClient: PubSubClient;
  sessionClient: SessionClient;

  static defaultProps = {
    userName: "anonymous",
  };

  componentDidMount() {
    const { sessionName, userName, layout, extraIceServers } = this.props;

    const targets = [...new Set(layout.editors.map(({ target }) => target))];
    console.log("Targets:", targets);

    const wsUrl: string = this.getWebsocketsUrl();

    const signalingServerUrl: string = `${wsUrl}/signal`;
    console.log(`Signaling server URL: ${signalingServerUrl}`);

    const pubsubUrl: string = `${wsUrl}/pubsub`;
    console.log(`Pub/Sub server URL: ${pubsubUrl}`);

    this.sessionClient = new SessionClient({
      signalingServerUrl,
      extraIceServers,
      sessionName,
      userName,
      onJoin: () => {
        this.sessionClient.setUsername(userName);
        this.setState({ showTextEditors: true });
      },
    });
    this.sessionClient.join();

    this.pubsubClient = new PubSubClient(pubsubUrl, {
      connect: true,
      reconnect: true,
    });

    // Subscribes to messages directed to ourselves
    this.pubsubClient.subscribe(
      `session:${sessionName}:user:${userName}`,
      this.handleMessageUser
    );

    // Subscribe to messages directed to a specific target
    targets.forEach((target) => {
      this.pubsubClient.subscribe(
        `session:${sessionName}:target:${target}:eval`,
        (content) => this.handleEvaluateRemoteCode({ target, content })
      );

      this.pubsubClient.subscribe(
        `session:${sessionName}:target:${target}:out`,
        (content) => this.handleMessageTarget({ target, content })
      );
    });

    if (this.hydraEnabled() && !hasWebgl()) {
      alert(
        "This session uses Hydra, but WebGL is not supported in this browser."
      );
    }
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
    if (this.pubsubClient) {
      this.pubsubClient.disconnect();
      this.pubsubClient = null;
    }
  }

  getWebsocketsUrl(): string {
    const { websocketsHost } = this.props;

    const protocol = location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${websocketsHost}`;
  }

  evaluateLocalCode({ target, body }) {
    switch (target) {
      case "hydra":
        this.setState({ hydraCode: body });
        break;
      default:
        console.error("Unhandle local target:", target);
    }
  }

  handleEvaluateCode = ({ editorId, target, body, fromLine, toLine, user }) => {
    const { sessionName } = this.props;
    const { pubsubClient } = this;
    const content = {
      editorId,
      fromLine,
      toLine,
      user,
    };

    this.setState({ messagesByClientId: {}, showTargetMessagesPane: false });

    if (LOCAL_TARGETS.includes(target)) {
      this.evaluateLocalCode({ target, body });
      pubsubClient.publish(`session:${sessionName}:target:${target}:eval`, {
        body,
        ...content,
      });
    } else {
      pubsubClient.publish(
        `session:${sessionName}:target:${target}:eval`,
        content
      );
    }
    pubsubClient.publish(`session:${sessionName}:target:${target}:in`, {
      user,
      body,
    });
  };

  handleEvaluateRemoteCode = ({ target, content }) => {
    const { editorId, user, fromLine, toLine } = content;

    this.setState({ showTargetMessagesPane: false });

    // If target is "local", evaluate code locally
    if (LOCAL_TARGETS.includes(target)) {
      const { body } = content;
      this.evaluateLocalCode({ target, body });
    }

    // Flash selection on editor when another user evaluates code
    if (this.props.userName !== user) {
      this.sessionClient.flash(editorId, fromLine, toLine);
    }
  };

  handleMessageTarget = ({ target, content }) => {
    console.debug(`[message] [target=${target}] ${JSON.stringify(content)}`);

    this.setState((prevState) => {
      const clientId = content.clientId || "default";
      const prevMessages = prevState.messagesByClientId[clientId] || [];
      const allMessages = [...prevMessages, { target, content }];

      return {
        messagesByClientId: {
          ...prevState.messagesByClientId,
          [clientId]: allMessages.slice(-MAX_LINES, allMessages.length),
        },
        showTargetMessagesPane: true,
      };
    });
  };

  handleMessageUser = (message: string) => {
    console.debug(`[message] user: ${JSON.stringify(message)}`);
  };

  handleTargetMessagesPaneTogglePosition = () => {
    this.setState((prevState: State) => ({
      messagesPaneIsTop: !prevState.messagesPaneIsTop,
    }));
  };

  handleTargetMessagesPaneToggleMaximize = () => {
    this.setState((prevState: State) => ({
      messagesPaneIsMaximized: !prevState.messagesPaneIsMaximized,
    }));
  };

  handleTargetMessagesPaneClose = () => {
    this.setState({ showTargetMessagesPane: false });
  };

  hydraEnabled() {
    const { layout, hydraEnabled } = this.props;
    // Hydra is enabled if one of the editors in layout is "hydra"
    return hydraEnabled && layout.editors.some((editor) => editor.target === "hydra");
  }

  render() {
    const {
      messagesByClientId,
      showTextEditors,
      showTargetMessagesPane,
      messagesPaneIsTop,
      messagesPaneIsMaximized,
      hydraCode,
    } = this.state;
    const { layout } = this.props;

    const { sessionClient } = this;

    const hydraEnabled = this.hydraEnabled();
    console.log("this.hydraEnabled:", hydraEnabled);

    return (
      // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
      <div>
        {hasWebgl() && hydraEnabled && (
          <HydraCanvas code={hydraCode} fullscreen />
        )}
        {showTextEditors && (
          <Mosaic
            layout={layout}
            sessionClient={sessionClient}
            onEvaluateCode={this.handleEvaluateCode}
          />
        )}
        {showTargetMessagesPane && messagesByClientId && (
          <TargetMessagesPane
            messagesByClientId={messagesByClientId}
            isTop={messagesPaneIsTop}
            isMaximized={messagesPaneIsMaximized}
            onTogglePosition={this.handleTargetMessagesPaneTogglePosition}
            onToggleMaximize={this.handleTargetMessagesPaneToggleMaximize}
            onClose={this.handleTargetMessagesPaneClose}
          />
        )}
        <Audio sessionClient={this.sessionClient} />
      </div>
    );
  }
}

export default Session;
