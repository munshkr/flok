import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { flash } from "./flashField.js";
import type { Document } from "@flok/session";

interface EvalBlock {
  text: string;
  from: number | null;
  to: number | null;
}

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

export const evaluateBlockOrSelection = (view: EditorView, doc: Document) => {
  const { state } = view;
  const selection = getSelection(state);
  if (selection.text) {
    const { text, from, to } = selection;
    flash(view, from, to);
    doc.evaluate(text, { from, to });
  } else {
    const { text, from, to } = getBlock(state);
    flash(view, from, to);
    doc.evaluate(text, { from, to });
  }
};

export const evaluateLine = (view: EditorView, doc: Document) => {
  const { state } = view;
  const { text, from, to } = getLine(state);
  flash(view, from, to);
  doc.evaluate(text, { from, to });
};

export const evaluateDocument = (view: EditorView, doc: Document) => {
  const { state } = view;
  const { from } = state.doc.line(1);
  const { to } = state.doc.line(state.doc.lines);
  const text = state.doc.sliceString(from, to);
  flash(view, from, to);
  doc.evaluate(text, { from, to });
};

export function evalKeymap(
  document: Document,
  {
    defaultKeys = ["Ctrl-Enter", "Cmd-Enter"],
    lineEvalKeys = ["Shift-Enter"],
    documentEvalKeys = ["Alt-Enter", "Ctrl-Shift-Enter", "Cmd-Shift-Enter"],
  } = {}
) {
  return keymap.of([
    ...defaultKeys.map((key) => ({
      key,
      run(view: EditorView) {
        evaluateBlockOrSelection(view, document);
        return true;
      },
    })),
    ...lineEvalKeys.map((key) => ({
      key,
      run(view: EditorView) {
        evaluateLine(view, document);
        return true;
      },
    })),
    ...documentEvalKeys.map((key) => ({
      key,
      run(view: EditorView) {
        evaluateDocument(view, document);
        return true;
      },
    })),
  ]);
}
