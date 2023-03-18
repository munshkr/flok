import { yCollab, yUndoManagerKeymap } from "y-codemirror.next";
import { keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import evalKeymap from "./evalKeymap";
import Session from "./Session";

export { Session, evalKeymap };

export const flokCollabSetup = (
  session: Session,
  editorId: string,
  target: string
) => {
  return [
    keymap.of([...yUndoManagerKeymap]),
    Prec.high(evalKeymap(session, editorId, target)),
    yCollab(session.getText(editorId), session.awareness),
  ];
};
