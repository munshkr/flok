import dynamic from 'next/dynamic';
import React from 'react';


const TextEditor = dynamic(
  () => import('../components/TextEditor'),
  {
    ssr: false,
  },
);


class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: '',
    };
  }

  handleEditorChange = (newContent) => {
    this.setState({ content: newContent });
    console.log(`Update state content: ${newContent}`);
  };

  render() {
    const { content } = this.state;
    return (
      <div>
        <TextEditor
          value={content}
          onChange={this.handleEditorChange}
        />
      </div>
    );
  }
}

export default Home;
