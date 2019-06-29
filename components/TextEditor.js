import React from 'react';
import PropTypes from 'prop-types';
import AceEditor from 'react-ace';

import 'brace/mode/python';
import 'brace/theme/dracula';

class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({
      width: `${window.innerWidth}px`,
      height: `${window.innerHeight}px`,
    });
  };

  render() {
    const { value, onChange } = this.props;
    const { width, height } = this.state;

    return (
      <AceEditor
        className="Editor"
        ref={(c) => { this.editor = c; }}
        mode="python"
        theme="dracula"
        value={value}
        onChange={onChange}
        width={width}
        height={height}
        fontSize="20px"
        name="editor"
        showPrintMargin={false}
        editorProps={{ $blockScrolling: true }}
      />
    );
  }
}

TextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
};

TextEditor.defaultProps = {
  value: '',
  onChange: () => {},
};

export default TextEditor;
