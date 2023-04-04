import { useEffect, useState } from "react";
import { EditorView } from "@codemirror/view";
import CodeMirror, { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { flashField, evalKeymap } from "@flok/cm-eval";
import { yCollab } from "y-codemirror.next";
import { UndoManager } from "yjs";
import { Prec } from "@codemirror/state";
import type { Document } from "@flok/session";

const baseTheme = EditorView.baseTheme({
  ".cm-scroller": { fontFamily: "Inconsolata", fontWeight: 600 },
});

interface IEditorProps extends ReactCodeMirrorProps {
  document?: Document;
}

function Editor({ document, ...props }: IEditorProps) {
  const [mounted, setMounted] = useState(false);

  const themeName = "dark";

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !document) {
    return null;
  }

  const text = document.getText();
  const undoManager = new UndoManager(text);

  return (
    <CodeMirror
      value={document.content}
      theme={themeName}
      extensions={[
        baseTheme,
        flashField(),
        Prec.high(evalKeymap(document)),
        yCollab(text, document.session.awareness, { undoManager }),
        javascript(),
      ]}
      basicSetup={{
        foldGutter: false,
        lineNumbers: false,
      }}
      {...props}
    />
  );
}

export default Editor;
