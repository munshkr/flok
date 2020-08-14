import React, { Component, MouseEvent } from "react";
import {
  faCaretSquareDown,
  faCaretSquareUp,
  faWindowRestore,
  faWindowMaximize,
  faWindowClose,
} from "@fortawesome/free-solid-svg-icons";
import Button from "./Button";

export type Message = {
  target: string;
  content: string;
};

type Props = {
  messagesByClientId: { [clientId: string]: any[] };
  isTop: boolean;
  isMaximized: boolean;
  onTogglePosition: (e: MouseEvent) => any;
  onToggleMaximize: (e: MouseEvent) => any;
  onClose: (e: MouseEvent) => any;
};

type State = {
  currentClientId: string;
};

class TargetMessagesPane extends Component<Props, State> {
  static defaultProps = {
    messages: [],
    isTop: false,
    isMaximized: false,
    onTogglePosition: () => {},
    onToggleMaximize: () => {},
    onClose: () => {},
  };
  container: HTMLElement;

  constructor(props) {
    super(props);

    const clientIds = Object.keys(this.props.messagesByClientId);
    this.state = {
      currentClientId: clientIds.length > 0 ? clientIds[0] : null,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { messagesByClientId } = this.props;
    if (this.container && prevProps.messagesByClientId !== messagesByClientId) {
      this.container.scrollTop = this.container.scrollHeight;
    }
  }

  handleTabClick = (e) => {
    const clientId = e.target.attributes["data-id"].value;
    this.setState({ currentClientId: clientId });
  };

  render() {
    const {
      messagesByClientId,
      isTop,
      isMaximized,
      onTogglePosition,
      onToggleMaximize,
      onClose,
    } = this.props;
    const { currentClientId } = this.state;

    return (
      <div
        className={`target-messages-pane ${
          isTop ? "top" : "bottom"
        } ${isMaximized && "maximized"}`}
      >
        <div className="button-group">
          <Button
            icon={isTop ? faCaretSquareDown : faCaretSquareUp}
            onClick={onTogglePosition}
          />
          <Button
            icon={isMaximized ? faWindowRestore : faWindowMaximize}
            onClick={onToggleMaximize}
          />
          <Button icon={faWindowClose} onClick={onClose} />
        </div>
        <div className="tabs">
          <ul>
            {Object.keys(messagesByClientId).map((clientId, i) => (
              <li className={clientId === currentClientId ? "is-active" : ""}>
                <a data-id={clientId} onClick={this.handleTabClick}>
                  {clientId.slice(0, 7)}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div
          ref={(e) => {
            this.container = e;
          }}
          className="scrollable-content"
        >
          <ol>
            {messagesByClientId[currentClientId].map(
              ({ _target, content }, i) => (
                <li key={i}>
                  <pre className={content.type === "stderr" ? "error" : ""}>
                    {content.body.join("\n")}
                  </pre>
                </li>
              )
            )}
          </ol>
        </div>
      </div>
    );
  }
}

export default TargetMessagesPane;
