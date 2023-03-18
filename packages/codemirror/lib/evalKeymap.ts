import { keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import type Session from "./Session";

type EvalBlock = {
  text: string;
  from: number | null;
  to: number | null;
};

export function getSelection(state: EditorState): EvalBlock {
  if (state.selection.main.empty) return { text: "", from: null, to: null };

  let { from, to } = state.selection.main;

  let text = state.doc.sliceString(from, to);
  return { text, from, to };
}

export function getLine(state: EditorState): EvalBlock {
  const line = state.doc.lineAt(state.selection.main.from);

  let { from, to } = line;

  let text = state.doc.sliceString(from, to);
  return { text, from, to };
}

export function getBlock(state: EditorState): EvalBlock {
  let { doc, selection } = state;
  let { text, number } = state.doc.lineAt(selection.main.from);

  if (text.trim().length === 0) return { text: "", from: null, to: null };

  let fromL, toL;
  fromL = toL = number;

  while (fromL > 1 && doc.line(fromL - 1).text.trim().length > 0) {
    fromL -= 1;
  }
  while (toL < doc.lines && doc.line(toL + 1).text.trim().length > 0) {
    toL += 1;
  }

  let { from } = doc.line(fromL);
  let { to } = doc.line(toL);

  text = state.doc.sliceString(from, to);
  return { text, from, to };
}

export default function evalKeymap(
  session: Session,
  editorId: string,
  target: string
) {
  const evaluateBlockOrSelection = (state: EditorState) => {
    const selection = getSelection(state);
    if (selection.text) {
      const { text, from, to } = selection;
      session.evaluate(target, text, { editorId, from, to });
    } else {
      const { text, from, to } = getBlock(state);
      session.evaluate(target, text, { editorId, from, to });
    }
  };

  const evaluateLine = (state: EditorState) => {
    const { text, from, to } = getLine(state);
    session.evaluate(target, text, { editorId, from, to });
  };

  return keymap.of([
    {
      key: "Ctrl-Enter",
      run({ state }) {
        evaluateBlockOrSelection(state);
        return true;
      },
    },
    {
      key: "Cmd-Enter",
      run({ state }) {
        evaluateBlockOrSelection(state);
        return true;
      },
    },
    {
      key: "Shift-Enter",
      run({ state }) {
        evaluateLine(state);
        return true;
      },
    },
  ]);
}
