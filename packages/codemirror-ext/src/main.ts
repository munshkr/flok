import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";

import { flokCollabSetup, FlokSession } from "../lib/main.js";

import "./style.css";

const session = new FlokSession({
  onWsStatus: (event) => {
    console.log(event.status);
  },
});
const id = "main";

const state = EditorState.create({
  doc: session.getTextString(id),
  extensions: [
    basicSetup,
    flokCollabSetup(session, id),
    javascript(),
    EditorView.lineWrapping,
    oneDark,
  ],
});

const view = new EditorView({
  state,
  parent: document.querySelector<HTMLDivElement>("#editor")!,
});
