/* eslint-disable import/no-extraneous-dependencies */
import React from "react";

class REPLWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      log: ""
    };
  }

  render() {
    const { log } = this.state;

    return (
      <div>
        <h1>REPL</h1>
        <pre>{log}</pre>
      </div>
    );
  }
}

export default REPLWindow;
