import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState, Prec } from "@codemirror/state";
import { yCollab } from "y-codemirror.next";
import { Session } from "@flok/session";
import { flashField, evalKeymap } from "@flok/cm-eval";
import { Doc, UndoManager } from "yjs";

import "./style.css";

const flokBasicSetup = (
  session,
  editorId,
  target
) => {
  const text = session.getText(editorId);
  const undoManager = new UndoManager(text);

  return [
    flashField(),
    Prec.high(evalKeymap(session, editorId, target)),
    yCollab(text, session.awareness, { undoManager }),
  ];
};

const createEditor = (id, { session, target, el }) => {
  const state = EditorState.create({
    doc: session.getTextString(id),
    extensions: [
      basicSetup,
      flokBasicSetup(session, id, target),
      javascript(),
      EditorView.lineWrapping,
      oneDark,
    ],
  });

  const view = new EditorView({
    state,
    parent: el,
  });

  return [state, view];
};

const handleMessage = (msg) => {
  console.log("message", msg);
};

const handleEvalHydra = (msg) => {
  console.log("eval:hydra", msg);
};

const session = new Session("default", { port: 3000 });
session.addTargets("tidal", "hydra");

session.on("message", handleMessage);
session.on("message-user", handleMessage);
session.on("eval:hydra", handleEvalHydra);

// Create two editors, one for each of the targets
createEditor("tidal-editor", {
  session,
  target: "tidal",
  el: document.querySelector("#slot1 .editor"),
});
createEditor("hydra-editor", {
  session,
  target: "hydra",
  el: document.querySelector("#slot2 .editor"),
});
