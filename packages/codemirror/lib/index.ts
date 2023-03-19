import { yCollab, yUndoManagerKeymap } from "y-codemirror.next";
import { keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import evalKeymap from "./evalKeymap";
import { flashField, flash } from "./flashField";
import Session from "./Session";

export { Session, evalKeymap, flashField, flash };

export const flokBasicSetup = (
  session: Session,
  editorId: string,
  target: string
) => {
  return [
    keymap.of([...yUndoManagerKeymap]),
    flashField(),
    Prec.high(evalKeymap(session, editorId, target)),
    yCollab(session.getText(editorId), session.awareness),
  ];
};
