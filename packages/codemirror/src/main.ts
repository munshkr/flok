import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

import { flokCollabSetup, Session } from "../lib/index.js";

import "./style.css";

const createEditor = (
  id: string,
  {
    session,
    target,
    el,
  }: {
    session: Session;
    target: string;
    el: HTMLDivElement;
  }
) => {
  const state = EditorState.create({
    doc: session.getTextString(id),
    extensions: [
      basicSetup,
      flokCollabSetup(session, id, target),
      keymap.of([indentWithTab]),
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

const handleMessage = (msg: any) => {
  console.log("message", msg);
};

const handleEvalHydra = (msg: any) => {
  console.log("eval:hydra", msg);
};

const session = new Session("default");
session.addTargets("tidal", "hydra");

session.on("message", handleMessage);
session.on("message-user", handleMessage);
session.on("eval:hydra", handleEvalHydra);

// Create two editors, one for each of the targets
createEditor("tidal-editor", {
  session,
  target: "tidal",
  el: document.querySelector<HTMLDivElement>("#slot1 .editor")!,
});
createEditor("hydra-editor", {
  session,
  target: "hydra",
  el: document.querySelector<HTMLDivElement>("#slot2 .editor")!,
});
