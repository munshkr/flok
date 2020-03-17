/**
 * @module bindings/textarea
 */

import { createMutex } from "lib0/mutex";
import * as math from "lib0/math";
import * as Y from "yjs";

const typeObserver = (binding, event) => {
  binding._mux(() => {
    const cm = binding.target;
    cm.operation(() => {
      const { delta } = event;
      let index = 0;
      for (let i = 0; i < event.delta.length; i += 1) {
        const d = delta[i];
        if (d.retain) {
          index += d.retain;
        } else if (d.insert) {
          const pos = cm.posFromIndex(index);
          cm.replaceRange(d.insert, pos, pos, "prosemirror-binding");
          index += d.insert.length;
        } else if (d.delete) {
          const start = cm.posFromIndex(index);
          const end = cm.posFromIndex(index + d.delete);
          cm.replaceRange("", start, end, "prosemirror-binding");
        }
      }
    });
  });
};

const targetObserver = (binding, change) => {
  binding._mux(() => {
    const start = binding.target.indexFromPos(change.from);
    const delLen =
      change.removed.map(s => s.length).reduce(math.add) +
      change.removed.length -
      1;
    if (delLen > 0) {
      binding.type.delete(start, delLen);
    }
    if (change.text.length > 0) {
      binding.type.insert(start, change.text.join("\n"));
    }
  });
};

const createRemoteCaret = (username, color) => {
  const caret = document.createElement("span");
  caret.classList.add("remote-caret");
  caret.setAttribute("style", `border-color: ${color}`);
  const userDiv = document.createElement("div");
  userDiv.setAttribute("style", `background-color: ${color}`);
  userDiv.insertBefore(document.createTextNode(username), null);
  caret.insertBefore(userDiv, null);
  return caret;
};

const updateRemoteSelection = (y, cm, type, cursors, clientId, awareness) => {
  // destroy current text mark
  const m = cursors.get(clientId);
  if (m !== undefined) {
    m.caret.clear();
    if (m.sel !== null) {
      m.sel.clear();
    }
    cursors.delete(clientId);
  }
  // redraw caret and selection for clientId
  const aw = awareness.getStates().get(clientId);
  if (aw === undefined) {
    return;
  }
  const user = aw.user || {};
  if (user.color == null) {
    user.color = "#ffa500";
  }
  if (user.name == null) {
    user.name = `User: ${clientId}`;
  }
  const { cursor } = aw;
  if (cursor == null || cursor.anchor == null || cursor.head == null) {
    return;
  }
  const anchor = Y.createAbsolutePositionFromRelativePosition(
    JSON.parse(cursor.anchor),
    y
  );
  const head = Y.createAbsolutePositionFromRelativePosition(
    JSON.parse(cursor.head),
    y
  );
  if (
    anchor !== null &&
    head !== null &&
    anchor.type === type &&
    head.type === type
  ) {
    const headpos = cm.posFromIndex(head.index);
    const anchorpos = cm.posFromIndex(anchor.index);
    let from;
    let to;
    if (head.index < anchor.index) {
      from = headpos;
      to = anchorpos;
    } else {
      from = anchorpos;
      to = headpos;
    }
    const caretEl = createRemoteCaret(user.name, user.color);
    const caret = cm.setBookmark(headpos, {
      widget: caretEl,
      insertLeft: true
    });
    let sel = null;
    if (head.index !== anchor.index) {
      sel = cm.markText(from, to, {
        css: `background-color: ${user.color}70`,
        inclusiveRight: true,
        inclusiveLeft: false
      });
    }
    cursors.set(clientId, { caret, sel });
  }
};

const codemirrorCursorActivity = (y, cm, type, awareness) => {
  if (!cm.hasFocus()) {
    return;
  }
  const newAnchor = Y.createRelativePositionFromTypeIndex(
    type,
    cm.indexFromPos(cm.getCursor("anchor"))
  );
  const newHead = Y.createRelativePositionFromTypeIndex(
    type,
    cm.indexFromPos(cm.getCursor("head"))
  );
  const aw = awareness.getLocalState();
  let currentAnchor = null;
  let currentHead = null;
  if (aw.cursor != null) {
    currentAnchor = Y.createAbsolutePositionFromRelativePosition(
      JSON.parse(aw.cursor.anchor),
      y
    );
    currentHead = Y.createAbsolutePositionFromRelativePosition(
      JSON.parse(aw.cursor.head),
      y
    );
  }
  if (
    aw.cursor == null ||
    !Y.compareRelativePositions(currentAnchor, newAnchor) ||
    !Y.compareRelativePositions(currentHead, newHead)
  ) {
    awareness.setLocalStateField("cursor", {
      anchor: JSON.stringify(newAnchor),
      head: JSON.stringify(newHead)
    });
  }
};

/**
 * @typedef {any} CodeMirror A codemirror instance
 */

/**
 * A binding that binds a YText to a CodeMirror editor.
 *
 * @example
 *   const ytext = ydocument.define('codemirror', Y.Text)
 *   const editor = new CodeMirror(document.querySelector('#container'), {
 *     mode: 'javascript',
 *     lineNumbers: true
 *   })
 *   const binding = new CodeMirrorBinding(ytext, editor)
 *
 */
export default class CodeMirrorBinding {
  /**
   * @param {Y.Text} textType
   * @param {CodeMirror} codeMirror
   * @param {any} [awareness]
   */
  constructor(textType, codeMirror, awareness) {
    const { doc } = textType;
    this.type = textType;
    this.target = codeMirror;
    this.awareness = awareness;

    /**
     * @private
     */
    this._mux = createMutex();
    // set initial value
    codeMirror.setValue(textType.toString());
    // observe type and target
    this._typeObserver = event => typeObserver(this, event);
    this._targetObserver = (_, change) => targetObserver(this, change);
    this._cursors = new Map();
    this._awarenessListener = event => {
      const f = clientId => {
        if (clientId !== doc.clientID) {
          updateRemoteSelection(
            doc,
            codeMirror,
            textType,
            this._cursors,
            clientId,
            awareness
          );
        }
      };

      event.added.forEach(f);
      event.removed.forEach(f);
      event.updated.forEach(f);
    };
    this._cursorListener = () =>
      codemirrorCursorActivity(doc, codeMirror, textType, awareness);
    this._blurListeer = () => awareness.setLocalStateField("cursor", null);

    textType.observe(this._typeObserver);
    codeMirror.on("change", this._targetObserver);
    if (awareness) {
      awareness.on("change", this._awarenessListener);
      codeMirror.on("cursorActivity", this._cursorListener);
      codeMirror.on("blur", this._blurListeer);
      codeMirror.on("focus", this._cursorListener);
    }
  }

  destroy() {
    this.type.unobserve(this._typeObserver);
    this.target.off("change", this._targetObserver);
    this.target.off("cursorActivity", this._cursorListener);
    this.target.off("focus", this._cursorListener);
    this.target.off("blur", this._blurListeer);
    this.awareness.off("change", this._awarenessListener);
    this.type = null;
    this.target = null;
  }
}
