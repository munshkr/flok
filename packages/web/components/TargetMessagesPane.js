import React from "react";
import PropTypes from "prop-types";

const TargetMessagesPane = ({ messages }) => (
  <div className="target-messages-pane">
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
);

TargetMessagesPane.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.object)
};

TargetMessagesPane.defaultProps = {
  messages: []
};

export default TargetMessagesPane;
