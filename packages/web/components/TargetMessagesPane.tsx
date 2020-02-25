import React, { Component, MouseEvent } from "react";
import {
  faCaretSquareDown,
  faCaretSquareUp,
  faWindowRestore,
  faWindowMaximize,
  faWindowClose
} from "@fortawesome/free-solid-svg-icons";
import Button from "./Button";

type Props = {
  messages: any[]; // FIXME replace any with MessageType
  isTop: boolean;
  isMaximized: boolean;
  onTogglePosition: (e: MouseEvent) => any;
  onToggleMaximize: (e: MouseEvent) => any;
  onClose: (e: MouseEvent) => any;
};

class TargetMessagesPane extends Component<Props, {}> {
  static defaultProps = {
    messages: [],
    isTop: false,
    isMaximized: false,
    onTogglePosition: () => {},
    onToggleMaximize: () => {},
    onClose: () => {}
  };
  container: HTMLElement;

  componentDidUpdate(prevProps: Props) {
    const { messages } = this.props;
    if (this.container && prevProps.messages !== messages) {
      this.container.scrollTop = this.container.scrollHeight;
    }
  }

  render() {
    const {
      messages,
      isTop,
      isMaximized,
      onTogglePosition,
      onToggleMaximize,
      onClose
    } = this.props;

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
        <div
          ref={e => {
            this.container = e;
          }}
          className="scrollable-content"
        >
          <ol>
            {messages.map(({ _target, content }, i) => (
              <li key={i}>
                <pre className={content.type === "stderr" ? "error" : ""}>
                  {content.body.join("\n")}
                </pre>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }
}

export default TargetMessagesPane;
