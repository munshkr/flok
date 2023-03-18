import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";

import { flokCollabSetup, FlokSession } from "../lib/main.js";

import "./style.css";

const session = new FlokSession("default");
const id = "slot1";
session.addTargets("tidal", "hydra");

const state = EditorState.create({
  doc: session.getTextString(id),
  extensions: [
    basicSetup,
    flokCollabSetup(session, id),
    keymap.of([indentWithTab]),
    javascript(),
    EditorView.lineWrapping,
    oneDark,
  ],
});

const view = new EditorView({
  state,
  parent: document.querySelector<HTMLDivElement>("#editor")!,
});
