import React from "react";

// eslint-disable-next-line react/prop-types
const Status = ({ children }) => (
  <div>
    {children}
    <style jsx>
      {`
        div {
          position: absolute;
          bottom: 0;
          right: 0;
          background: transparent;
          text-align: right;
          color: #fefefe;
          z-index: 1000;
          font-family: monospace;
          font-weight: bold;
        }
      `}
    </style>
  </div>
);

export default Status;
