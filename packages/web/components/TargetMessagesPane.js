import React from "react";
import PropTypes from "prop-types";

const TargetMessagesPane = ({ messages, className }) => (
  <div className={`target-messages-pane ${className}`}>
    <div className="scrollable-content">
      <ol>
        {messages.map((message, i) => (
          <li key={i}>
            <pre className={message.type === "stderr" ? "error" : ""}>
              {message.body.join("\n").trim()}
            </pre>
          </li>
        ))}
      </ol>
    </div>
  </div>
);

TargetMessagesPane.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object),
  className: PropTypes.string
};

TargetMessagesPane.defaultProps = {
  messages: [],
  className: ""
};

export default TargetMessagesPane;
