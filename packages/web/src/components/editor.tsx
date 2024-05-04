import { useQuery } from "@/hooks/use-query";
import {
  langByTarget as langByTargetUntyped,
  panicCodes as panicCodesUntyped,
  targetsWithDocumentEvalMode,
  webTargets,
} from "@/settings.json";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { EditorState, Prec } from "@codemirror/state";
import { EditorView, keymap, lineNumbers as lineNumbersExtension } from "@codemirror/view";
import { evalKeymap, flashField, remoteEvalFlash } from "@flok-editor/cm-eval";
import { tidal } from "@flok-editor/lang-tidal";
import type { Document } from "@flok-editor/session";
import { highlightExtension } from "@strudel/codemirror";
import CodeMirror, {
  ReactCodeMirrorProps,
  ReactCodeMirrorRef,
} from "@uiw/react-codemirror";
import { vim } from "@replit/codemirror-vim";

import React, { useEffect, useState } from "react";
import { yCollab } from "y-codemirror.next";
import { UndoManager } from "yjs";
import * as themes from "@/lib/theme";

const defaultLanguage = "javascript";
const langByTarget = langByTargetUntyped as { [lang: string]: string };
const langExtensionsByLanguage: { [lang: string]: any } = {
  javascript: javascript,
  python: python,
  tidal: tidal,
};
const panicCodes = panicCodesUntyped as { [target: string]: string };

const panicKeymap = (
  doc: Document,
  keys: string[] = ["Cmd-.", "Ctrl-.", "Alt-."]
) => {
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

interface FlokSetupOptions {
  readOnly?: boolean;
}

const flokSetup = (
  doc: Document,
  { readOnly = false }: FlokSetupOptions = {}
) => {
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
    yCollab(text, doc.session.awareness, {
      undoManager,
      hideCaret: readOnly,
      showLocalCaret: true,
    }),
  ];
};

export interface EditorProps extends ReactCodeMirrorProps {
  document?: Document;
  extensionSettings?: any;
  vimMode: boolean;
  lineNumbers: boolean;
  wrapText: boolean;
  customTheme: string;
}

export const Editor = React.forwardRef(
  (
    { document, lineNumbers, vimMode, wrapText, customTheme, ...props }: EditorProps,
    ref: React.ForwardedRef<ReactCodeMirrorRef>
  ) => {
    const [mounted, setMounted] = useState(false);
    const query = useQuery();

    // useEffect only runs on the client, so now we can safely show the UI
    useEffect(() => {
      // Make sure query parameters are set before loading the editor
      if (!query) return;
      setMounted(true);
    }, [query]);

    if (!mounted || !document) {
      return null;
    }

    const readOnly = !!query.get("readOnly");

    const language: string = langByTarget[document.target] || defaultLanguage;
    const languageExtension = langExtensionsByLanguage[language] || javascript;
    const extensions = [
      themes[customTheme] || themes.baseTheme,
      flokSetup(document, { readOnly }),
      languageExtension(),
      highlightExtension,
      readOnly ? EditorState.readOnly.of(true) : [],
      lineNumbers ? lineNumbersExtension() : [],
      vimMode ? vim() : [],
      wrapText ? EditorView.lineWrapping: [],
    ];

    // If it's read-only, put a div in front of the editor so that the user
    // can't interact with it.
    return (
      <>
        {readOnly && <div className="absolute inset-0 z-10" />}
        <CodeMirror
          ref={ref}
          value={document.content}
          theme="dark"
          extensions={extensions}
          basicSetup={{
            foldGutter: false,
            lineNumbers: false,
          }}
          {...props}
        />
      </>
    );
  }
);
