import React from "react";
import TextEditor from "../components/TextEditor";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: ""
    };
  }

  handleTextEditorBeforeChange = (editor, data, value) => {
    this.setState({ content: value });
  };

  render() {
    const { content } = this.state;
    const options = {
      mode: "xml",
      theme: "material",
      lineNumbers: true
    };

    return (
      <div>
        <TextEditor
          options={options}
          value={content}
          onBeforeChange={this.handleTextEditorBeforeChange}
        />
      </div>
    );
  }
}

export default Home;
