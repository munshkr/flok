import dynamic from "next/dynamic";
import React from "react";

const TextEditor = dynamic(() => import("../components/TextEditor"), {
  ssr: false
});

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
      mode: "haskell",
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
