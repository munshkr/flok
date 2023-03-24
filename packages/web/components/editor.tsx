import React from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { gruvboxDark } from "@uiw/codemirror-theme-gruvbox-dark";

interface IEditorProps {
  value: string;
  onChange?: (value: string, viewUpdate: any) => void;
}

function Editor({ value, onChange }: IEditorProps) {
  return (
    <CodeMirror
      value={value}
      height="200px"
      extensions={[gruvboxDark, javascript()]}
      onChange={onChange}
    />
  );
}

export default Editor;
