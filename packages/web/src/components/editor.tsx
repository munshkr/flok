import { useEffect, useState } from "react";
import { EditorView } from "@codemirror/view";
import CodeMirror, { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { haskell } from "@flok/lang-haskell";
import { flashField, remoteEvalFlash, evalKeymap } from "@flok/cm-eval";
import { yCollab } from "y-codemirror.next";
import { UndoManager } from "yjs";
import { Prec } from "@codemirror/state";
import type { Document } from "@flok/session";
import { langByTarget as languagesByTarget } from "@/settings.json";

const defaultLanguage = "javascript";
const langByTarget = languagesByTarget as { [lang: string]: string };
const langExtensionsByLanguage: { [lang: string]: any } = {
  javascript: javascript,
  python: python,
  haskell: haskell,
};

const baseTheme = EditorView.baseTheme({
  "&.cm-editor": {
    background: "transparent",
    fontSize: "16px",
    color: "white",
    fontFamily: `Inconsolata`,
    fontWeight: 600,
  },
  "& .cm-scroller": {
    fontFamily: `Inconsolata`,
  },
  "& .cm-line": {
    maxWidth: "fit-content",
    background: "rgba(0, 0, 0, 0.7)",
  },
  "& .cm-activeLine": {
    backgroundColor: "rgba(0, 0, 0, 0.7) !important",
  },
  "& .ͼo": {
    color: "white",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-selectionBackground": {
    backgroundColor: "rgba(255, 0, 255, 0.5) !important",
    opacity: 0.5,
  },
});

interface IEditorProps extends ReactCodeMirrorProps {
  document?: Document;
}

const flokSetup = (doc: Document) => {
  const text = doc.getText();
  const undoManager = new UndoManager(text);

  return [
    flashField(),
    remoteEvalFlash(doc),
    Prec.high(evalKeymap(doc)),
    yCollab(text, doc.session.awareness, { undoManager }),
  ];
};

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

  const language: string = langByTarget[document.target] || defaultLanguage;
  const languageExtension = langExtensionsByLanguage[language] || javascript;

  return (
    <CodeMirror
      value={document.content}
      theme={themeName}
      extensions={[baseTheme, flokSetup(document), languageExtension()]}
      basicSetup={{
        foldGutter: false,
        lineNumbers: false,
      }}
      {...props}
    />
  );
}

export default Editor;
