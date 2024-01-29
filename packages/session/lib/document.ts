import type { Session, EvalContext, EvalMode } from "./index.js";
import type * as Y from "yjs";

export class Document {
  id: string;
  session: Session;

  constructor(session: Session, id: string) {
    this.id = id;
    this.session = session;
  }

  get content(): string {
    return this.session.getTextString(this.id);
  }

  set content(newValue: string) {
    this.session.setTextString(this.id, newValue);
  }

  get target(): string {
    return this.session.getTarget(this.id);
  }

  set target(newValue: string) {
    this.session.setTarget(this.id, newValue);
  }

  getText(): Y.Text {
    return this.session.getText(this.id);
  }

  setTarget(newValue: string) {
    this.target = newValue;
    return this;
  }

  evaluate(body: string, context: EvalContext, mode: EvalMode = "default") {
    return this.session.evaluate(this.id, this.target, body, context, mode);
  }
}

export default Document;
