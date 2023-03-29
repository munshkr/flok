import { useEffect, useState } from "react";
import { EditorView } from "@codemirror/view";
import CodeMirror, { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { flashField, evalKeymap } from "@flok/codemirror-eval";
import { yCollab } from "y-codemirror.next";
import { UndoManager } from "yjs";
import { Prec } from "@codemirror/state";
import type { Session } from "@flok/session";

const baseTheme = EditorView.baseTheme({
  ".cm-scroller": { fontFamily: "Inconsolata", fontWeight: 600 },
});

interface IEditorProps extends ReactCodeMirrorProps {
  session: Session | null;
  target: string;
  id: string;
}

function Editor({ session, target, id, ...props }: IEditorProps) {
  const [mounted, setMounted] = useState(false);

  const themeName = "dark";

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !session) {
    return null;
  }

  const text = session.getText(id);
  const undoManager = new UndoManager(text);

  return (
    <CodeMirror
      theme={themeName}
      extensions={[
        baseTheme,
        flashField(),
        Prec.high(evalKeymap(session, id, target)),
        yCollab(text, session.awareness, { undoManager }),
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
