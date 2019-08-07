import React from "react";
import PropTypes from "prop-types";

const TargetMessagesPane = ({ messages }) => (
  <div>
    <ol>
      {messages.map(message => (
        <li>
          <pre>{message.body.join("\n").trim()}</pre>
        </li>
      ))}
    </ol>
    <style jsx>
      {`
        ol {
          list-style: none;
          padding: 0;
        }
        div {
          position: absolute;
          bottom: 0;
          left: 0;
          background: transparent;
          color: #888;
          z-index: 1000;
          font-family: monospace;
          font-size: 0.8em;
          height: 50%;
          width: 100%;
          overflow: hidden;
        }
      `}
    </style>
  </div>
);

export default TargetMessagesPane;
