import { ViewPlugin } from "@codemirror/view";
import type { EditorView } from "@codemirror/view";
import type { Document, EvalMessage } from "@flok/session";
import { flash } from "./flashField.js";

export const remoteEvalFlash = (document: Document) =>
  ViewPlugin.fromClass(
    class {
      _handleEval: any;

      constructor(view: EditorView) {
        this._handleEval = (msg: EvalMessage) => {
          const { editorId, from, to } = msg;
          if (editorId !== document.id) return;
          flash(view, from, to);
        };

        document.session.on("eval", this._handleEval);
      }

      destroy() {
        document.session.off("eval", this._handleEval);
      }
    }
  );
