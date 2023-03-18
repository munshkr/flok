import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

import { flokCollabSetup, FlokSession } from "../lib/main.js";

import "./style.css";

const createEditor = (
  id: string,
  {
    session,
    target,
    el,
  }: {
    session: FlokSession;
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

const session = new FlokSession("default");
session.addTargets("tidal", "hydra");

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
