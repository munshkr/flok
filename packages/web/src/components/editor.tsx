import "../fonts/IBM Plex Mono/stylesheet.css";
import "../fonts/BigBlue/stylesheet.css";
import "../fonts/Monocraft/stylesheet.css";
import "../fonts/JetBrains/stylesheet.css";
import "../fonts/JGS/stylesheet.css";
import "../fonts/StepsMono/stylesheet.css";
import "../fonts/FiraCode/stylesheet.css";
import "../fonts/SyneMono/stylesheet.css";
import "../fonts/VT323/stylesheet.css";
import "../fonts/RobotoMono/stylesheet.css";
import "../fonts/UbuntuMono/stylesheet.css";

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
import {
  EditorView,
  keymap,
  lineNumbers as lineNumbersExtension,
} from "@codemirror/view";
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
import themes from "@/lib/themes";

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
  fontFamily: string;
}

export const Editor = React.forwardRef(
  (
    {
      document,
      lineNumbers,
      vimMode,
      wrapText,
      customTheme,
      fontFamily,
      ...props
    }: EditorProps,
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
      EditorView.theme({
        "&": {
          fontFamily: fontFamily,
        },
        ".cm-content": {
          fontFamily: fontFamily,
          "font-size-adjust" : "ex-height 0.2"
        },
        ".cm-gutters": {
          fontFamily: fontFamily,
          "margin-right" : "10px"
        },
        ".cm-line" : {
          "font-size" : "105%",
          "font-weight" : "600",
          "background": "rgba(0, 0, 0, 0.7)",
          "max-width" : "fit-content",
          "padding" : "0px"
        },
        ".cm-activeLine" : {
          "background-color" : "rgba(0, 0, 0, 1) !important",
        },
        "& .cm-scroller" : {
          "minHeight" : "100vh"
        },
        ".cm-ySelectionInfo" : {
          opacity: "1",
          fontFamily: fontFamily,
          color: "black",
          padding: "3px 4px",
          fontSize: "0.8rem",
          "font-weight": "bold",
          top: "1.25em",
          "z-index": "1000"
        },
      }),
      flokSetup(document, { readOnly }),
      languageExtension(),
      highlightExtension,
      readOnly ? EditorState.readOnly.of(true) : [],
      lineNumbers ? lineNumbersExtension() : [],
      vimMode ? vim() : [],
      wrapText ? EditorView.lineWrapping : [],
    ];

    // If it's read-only, put a div in front of the editor so that the user
    // can't interact with it.
    return (
      <>
        {readOnly && <div className="absolute inset-0 z-10" />}
        <CodeMirror
          ref={ref}
          value={document.content}
          theme={themes[customTheme]?.ext || themes["dracula"]?.ext}
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
