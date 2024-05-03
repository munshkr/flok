import { useQuery } from "@/hooks/use-query";
import {
  langByTarget as langByTargetUntyped,
  panicCodes as panicCodesUntyped,
  targetsWithDocumentEvalMode,
  webTargets,
} from "@/settings.json";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { Compartment, EditorState, Extension, Prec } from "@codemirror/state";
import { EditorView, keymap, lineNumbers } from "@codemirror/view";
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
import { baseTheme } from "@/lib/theme";

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

// Code example from:
// https://codemirror.net/examples/config/#dynamic-configuration
// Allows toggling of extensions based on string shortkey
//
const toggleWith = (key: string, extension: Extension) => {
  let comp = new Compartment();

  function toggle(view: EditorView) {
    let on = comp.get(view.state) == extension;
    view.dispatch({
      effects: comp.reconfigure(on ? [] : extension),
    });
    return true;
  }
  return [comp.of([]), keymap.of([{ key, run: toggle }])];
};

export interface EditorProps extends ReactCodeMirrorProps {
  document?: Document;
  extensionSettings?: any;
  vimMode: boolean;
  lineNumbers: boolean;
  wrapText: boolean;
}

export const Editor = React.forwardRef(
  (
    { document, ...props }: EditorProps,
    ref: React.ForwardedRef<ReactCodeMirrorRef>
  ) => {
    console.log("Debug : " + props.vimMode);
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
      baseTheme,
      flokSetup(document, { readOnly }),
      languageExtension(),
      highlightExtension,
      readOnly ? EditorState.readOnly.of(true) : [],
      // TODO: Read from extensionSettings to know if we should add line numbers
      props.lineNumbers ? lineNumbers() : [],
      props.vimMode ? vim() : [],
      props.wrapText ? EditorView.lineWrapping: [],
      // toggleWith("shift-ctrl-w", EditorView.lineWrapping), // toggle linewrapping on/off
      // toggleWith("shift-ctrl-v", vim()), // toggle vim mode
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
