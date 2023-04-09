import { useEffect, useState } from "react";
import { EditorView, keymap } from "@codemirror/view";
import CodeMirror, { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { tidal } from "@flok-editor/lang-tidal";
import { flashField, remoteEvalFlash, evalKeymap } from "@flok-editor/cm-eval";
import { yCollab } from "y-codemirror.next";
import { UndoManager } from "yjs";
import { Prec } from "@codemirror/state";
import type { Document } from "@flok-editor/session";
import {
  langByTarget as langByTargetUntyped,
  targetsWithDocumentEvalMode,
  panicCodes as panicCodesUntyped,
  webTargets,
} from "@/settings.json";

const defaultLanguage = "javascript";
const langByTarget = langByTargetUntyped as { [lang: string]: string };
const langExtensionsByLanguage: { [lang: string]: any } = {
  javascript: javascript,
  python: python,
  tidal: tidal,
};
const panicCodes = panicCodesUntyped as { [target: string]: string };

const baseTheme = EditorView.baseTheme({
  "&.cm-editor": {
    background: "transparent",
    fontFamily: `Inconsolata`,
    fontSize: "16px",
    color: "white",
    fontWeight: 600,
  },
  "& .cm-scroller": {
    fontFamily: `Inconsolata`,
    paddingLeft: "2px !important",
    minHeight: "100vh",
  },
  "& .cm-line": {
    background: "rgba(0, 0, 0, 0.7)",
    maxWidth: "fit-content",
    padding: 0,
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
  ".cm-ySelectionInfo": {
    opacity: "1",
    fontFamily: "sans-serif",
    color: "black",
    padding: "3px 4px",
    fontSize: "0.8rem",
    top: "1.15em",
  },
  "& :focus .cm-ySelectionInfo": {
    zIndex: "-1",
  },
});

const panicKeymap = (doc: Document, keys: string[] = ["Cmd-.", "Ctrl-."]) => {
  const panicCode = panicCodes[doc.target];

  return panicCode
    ? keymap.of([
        ...keys.map((key) => ({
          key,
          run() {
            doc.evaluate(panicCode, { from: null, to: null });
            return true;
          },
        })),
      ])
    : [];
};

export interface EditorProps extends ReactCodeMirrorProps {
  document?: Document;
}

const flokSetup = (doc: Document) => {
  const text = doc.getText();
  const undoManager = new UndoManager(text);
  const defaultMode = targetsWithDocumentEvalMode.includes(doc.target)
    ? "document"
    : "block";
  const web = webTargets.includes(doc.target);

  return [
    flashField(),
    remoteEvalFlash(doc),
    Prec.high(evalKeymap(doc, { defaultMode, web })),
    panicKeymap(doc),
    yCollab(text, doc.session.awareness, { undoManager, showLocalCaret: true }),
  ];
};

function Editor({ document, ...props }: EditorProps) {
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
      extensions={[
        baseTheme,
        EditorView.lineWrapping,
        flokSetup(document),
        languageExtension(),
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
