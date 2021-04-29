import React, { Component } from "react";

import { PubSubClient } from "flok-core";
import TargetMessagesPane, { Message } from "./TargetMessagesPane";
import SessionClient, { IceServerType } from "../lib/SessionClient";
import Mosaic from "./Mosaic";
import Audio from "./Audio";

const MAX_LINES: number = 100;
const LOCAL_TARGETS = ["hydra"];

type Props = {
  websocketsHost: string;
  sessionName: string;
  userName?: string;
  onHydraEvaluation: (code: string) => void;
  audioStreamingEnabled: boolean;
  readonly: boolean;
  noLocalEval: boolean;
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
};

class Session extends Component<Props, State> {
  state: State = {
    showTargetMessagesPane: false,
    showTextEditors: false,
    messagesByClientId: {},
    messagesPaneIsTop: false,
    messagesPaneIsMaximized: false,
  };
  pubsubClient: PubSubClient;
  sessionClient: SessionClient;

  static defaultProps = {
    userName: "anonymous",
    onHydraEvaluation: () => { },
    readonly: false
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
      onInitialSync: (method: string, editors: { [editorId: string]: string }) => {
        this.postInitialSessionContentToParentWindow(method, editors);
      }
    });
    this.sessionClient.join();

    this.pubsubClient = new PubSubClient(pubsubUrl, {
      connect: true,
      reconnect: true,
    });

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

      // Subscribes to messages directed to ourselves
      this.pubsubClient.subscribe(
        `session:${sessionName}:target:${target}:user:${userName}:out`,
        (content) => this.handleMessageTarget({ target, content })
      );
    });
  }

  postInitialSessionContentToParentWindow(method: string, editors: { [editorId: string]: string }) {
    console.log("Initial sync from", method);
    this.postMessageToParentWindow({
      cmd: "initialSync",
      args: { method, editors }
    });
  }

  componentDidUpdate(prevProps: Props, _prevState: State) {
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
    const { noLocalEval } = this.props;

    if (noLocalEval) return;

    switch (target) {
      case "hydra":
        const { onHydraEvaluation } = this.props
        onHydraEvaluation && onHydraEvaluation(body);
        break;
      default:
        console.error("Unhandle local target:", target);
    }
  }

  handleEvaluateCode = ({ editorId, target, body, fromLine, toLine, user, locally = false }) => {
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
      if (locally == false) {
        pubsubClient.publish(`session:${sessionName}:target:${target}:eval`, {
          body,
          ...content,
        });
      }
    } else {
      if (locally === false) {
        pubsubClient.publish(
          `session:${sessionName}:target:${target}:eval`,
          content
        );
      }
    }

    pubsubClient.publish(`session:${sessionName}:target:${target}:in`, {
      user,
      body,
    });

    this.postMessageToParentWindow({
      cmd: "evaluateCode",
      args: { editorId, target, body, user, local: locally }
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

    const { body } = content;
    this.postMessageToParentWindow({
      cmd: "evaluateCode",
      args: { editorId, target, body, user, local: false }
    });
  };

  postMessageToParentWindow(payload: any) {
    console.debug("Post message to parent window:", payload);
    window.parent.postMessage(payload, "*");
  }

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

  render() {
    const {
      messagesByClientId,
      showTextEditors,
      showTargetMessagesPane,
      messagesPaneIsTop,
      messagesPaneIsMaximized,
    } = this.state;
    const { layout, audioStreamingEnabled, readonly } = this.props;

    const { sessionClient } = this;

    return (
      // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
      <div className="container">
        {showTextEditors && (
          <Mosaic
            layout={layout}
            sessionClient={sessionClient}
            onEvaluateCode={this.handleEvaluateCode}
            readonly={readonly}
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
        {audioStreamingEnabled && <Audio sessionClient={this.sessionClient} />}
        <style jsx>{`
          .container {
            height: 100vh;
          }
        `}</style>
      </div>
    );
  }
}

export default Session;
