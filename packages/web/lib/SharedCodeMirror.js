import ReconnectingWebSocket from "reconnecting-websocket";
import ShareDB from "sharedb/lib/client";

// FIXME more colors?
const COLORS = ["#ff0000", "#00ff00", "#0000ff"];

class SharedCodeMirror {
  /**
   * @constructor
   * @param {String} WebSocket url - a URL string of the WebSocket server
   * @param {Object} options - configuration options:
   *    - editor: CodeMirror editor instance
   *    - onEvaluateCode: optional. A handler called whenever someone evaluates code
   *    - onEvaluateRemoteCode: optional. A handler called whenever someone other
   *      than current user evaluates code.
   *    - debug: optional. If true, log messages will be printed to the console.
   * @return {SharedCodeMirror} the created SharedCodeMirror object
   */
  constructor(ctx) {
    const { editor, onEvaluateCode, onCursorActivity, debug, extraKeys } = ctx;

    this.editor = editor;
    this.onEvaluateCode = onEvaluateCode || (() => {});
    this.onCursorActivity = onCursorActivity || (() => {});
    this.extraKeys = extraKeys || {};

    this.bookmarks = {};
    this.suppressChange = false;

    this.setExtraKeys();

    const isDebug = Boolean(debug);
    this.log = (...args) => {
      if (isDebug) {
        // eslint-disable-next-line no-console
        console.debug(...args);
      }
    };
  }

  attach(sessionClient) {
    const { editor } = this;

    editor.setValue(sessionClient.doc.data.content);
    editor.on("beforeChange", (_codeMirror, change) => {
      this._handleBeforeLocalChange(sessionClient, change);
    });
    editor.on("changes", (_codeMirror, changes) => {
      this._handleAfterLocalChanges(sessionClient, changes);
    });
    editor.on("cursorActivity", () => {
      this.triggerCursorActivity();
    });
  }

  dettach() {
    const { editor } = this;

    editor.off("beforeChange");
    editor.off("changes");
    editor.off("cursorActivity");
  }

  updateBookmarkForUser(userId, userNum, cursorPos) {
    const { editor } = this;

    const marker = this.bookmarks[userId];
    if (marker) {
      marker.clear();
    }

    // Generate DOM node (marker / design you want to display)
    const cursorCoords = editor.cursorCoords(cursorPos);
    const el = document.createElement("span");
    el.style.borderLeftStyle = "solid";
    el.style.borderLeftWidth = "2px";
    const color = COLORS[userNum % COLORS.length];
    el.style.borderLeftColor = color;
    el.style.height = `${cursorCoords.bottom - cursorCoords.top}px`;
    el.style.padding = 0;
    el.style.zIndex = 0;

    // Set the generated DOM node at the position of the cursor sent from another client
    // setBookmark first argument: The position of the cursor sent from another client
    // Second argument widget: Generated DOM node
    this.bookmarks[userId] = editor.setBookmark(cursorPos, {
      widget: el
    });
  }

  /**
   * Asserts that the CodeMirror instance's value matches the document's content
   * in order to ensure that the two copies haven't diverged.
   */
  _assertValue(sessionClient) {
    const expectedValue = sessionClient.doc.data.content;
    const editorValue = this.editor.getValue();

    if (expectedValue !== editorValue) {
      this.onError(
        "SharedCodeMirror: value in CodeMirror does not match expected value:",
        "\n\nExpected value:\n",
        expectedValue,
        "\n\nEditor value:\n",
        editorValue
      );

      this.suppressChange = true;
      this.editor.setValue(expectedValue);
      this.suppressChange = false;
    }
  }

  /**
   * Callback for the CodeMirror `beforeChange` event. It may be ignored if it
   * is an echo of the most recently applied remote operations, otherwise it
   * collects all the operations which are later sent to the server.
   */
  _handleBeforeLocalChange(_sessionClient, change) {
    if (this.suppressChange) {
      return;
    }

    if (!this.ops) {
      this.ops = [];
    }
    const index = this.editor.indexFromPos(change.from);
    if (change.from !== change.to) {
      // delete operation
      const deleted = this.editor.getRange(change.from, change.to);
      this.ops.push({ p: index, d: deleted });
    }
    if (change.text[0] !== "" || change.text.length > 0) {
      // insert operation
      const inserted = change.text.join("\n");
      this.ops.push({ p: index, i: inserted });
    }
  }

  /**
   * Callback for the CodeMirror `changes` event. It may be ignored if it is
   * an echo of the most recently applied remote operations, otherwise it
   * sends the previously collected operations to the server.
   */
  _handleAfterLocalChanges(sessionClient, _changes) {
    if (this.suppressChange) {
      return;
    }

    const { ops } = this;
    sessionClient.updateEditorContent(ops);
    delete this.ops;

    // Force update cursor activity
    this.triggerCursorActivity();

    this._assertValue(sessionClient);
  }

  triggerCursorActivity() {
    const { line, ch } = this.editor.getDoc().getCursor();
    this.log("Trigger cursor activity:", line, ch);
    this.onCursorActivity({ line, column: ch });
  }

  evaluateLine = () => {
    const { editor } = this;

    const currentLine = editor.getCursor().line;
    const lines = editor.getValue().split("\n");
    const code = lines[currentLine].trim();

    if (code !== "") {
      this.evaluate(code, currentLine, currentLine);
    }
  };

  evaluateParagraph = () => {
    const { editor } = this;
    const currentLine = editor.getCursor().line;
    const lines = editor.getValue().split("\n");

    let code = "";
    let start = false;
    let stop = false;
    let begin = null;
    let end = null;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i].trim();
      const lineLength = line.length;
      if (!start) {
        if (!lineLength) {
          code = "";
          begin = i + 1;
          end = begin;
        }
        if (i === currentLine) start = true;
      }
      if (!stop) {
        if (start && !lineLength) {
          stop = true;
          end = i - 1;
        } else if (lineLength) {
          code += `${line}\n`;
        }
      }
    }

    if (code !== "") {
      this.evaluate(code, begin, end);
    }
  };

  evaluate(body, fromLine, toLine) {
    this.log([fromLine, toLine]);
    this.log(`Evaluate (${fromLine}-${toLine}): ${JSON.stringify(body)}`);
    this.onEvaluateCode({ body, fromLine, toLine, user: this.userName });
    this.flash(fromLine, toLine);
  }

  flash(fromLine, toLine) {
    const { editor } = this;

    // Mark text with .flash-selection class
    const marker = editor.markText(
      { line: fromLine, ch: 0 },
      { line: toLine + 1, ch: 0 },
      { className: "flash-selection" }
    );

    // Clear marker after timeout
    setTimeout(() => {
      marker.clear();
    }, 150);
  }

  setExtraKeys() {
    // Set extra keys for code evaluation
    this.editor.setOption("extraKeys", {
      ...this.extraKeys,
      "Shift-Enter": this.evaluateLine,
      "Ctrl-Enter": this.evaluateParagraph,
      "Cmd-Enter": this.evaluateParagraph
    });
  }
}

export default SharedCodeMirror;
