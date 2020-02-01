import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretSquareDown,
  faCaretSquareUp,
  faWindowRestore,
  faWindowMaximize,
  faWindowClose
} from "@fortawesome/free-solid-svg-icons";

const Button = ({ icon, ...props }) => (
  <a {...props}>
    <FontAwesomeIcon icon={icon} />
  </a>
);

class TargetMessagesPane extends React.Component {
  componentDidUpdate(prevProps) {
    const { messages } = this.props;
    if (this.container && prevProps.messages !== messages) {
      console.log("container scroll");
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
            {messages.map(({ target, content }, i) => (
              <li key={i}>
                <pre className={content.type === "stderr" ? "error" : ""}>
                  {`[${target}] ${content.body.join("\n").trim()}`}
                </pre>
              </li>
            ))}
          </ol>
        </div>
      </div>
    );
  }
}

TargetMessagesPane.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object),
  isTop: PropTypes.bool,
  isMaximized: PropTypes.bool,
  onTogglePosition: PropTypes.func,
  onToggleMaximize: PropTypes.func,
  onClose: PropTypes.func
};

TargetMessagesPane.defaultProps = {
  messages: [],
  isTop: false,
  isMaximized: false,
  onTogglePosition: () => {},
  onToggleMaximize: () => {},
  onClose: () => {}
};

export default TargetMessagesPane;
