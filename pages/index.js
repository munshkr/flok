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

  handleTextEditorBeforeChange = (_editor, _data, content) => {
    this.setState({ content });
  };

  handleFetch = content => {
    this.setState({ content });
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
          onFetch={this.handleFetch}
          onBeforeChange={this.handleTextEditorBeforeChange}
        />
      </div>
    );
  }
}

export default Home;
