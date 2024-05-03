import { EditorView } from "@codemirror/view";

export const baseTheme = EditorView.baseTheme({
  "&.cm-editor": {
    background: "transparent",
    fontFamily: `Inconsolata`,
    fontSize: "16px",
    color: "white",
    fontWeight: 600,
  },
  "& .cm-scroller": {
    fontFamily: `Inconsolata`,
    paddingLeft: "2px !important",
    minHeight: "100vh",
  },
  "& .cm-line": {
    background: "rgba(0, 0, 0, 0.7)",
    maxWidth: "fit-content",
    padding: 0,
  },
  "& .cm-activeLine": {
    backgroundColor: "rgba(0, 0, 0, 0.7) !important",
  },
  "& .ͼo": {
    color: "white",
  },
  "&.cm-focused": {
    outline: "none",
  },
  ".cm-selectionBackground": {
    backgroundColor: "rgba(255, 0, 255, 0.5) !important",
    opacity: 0.5,
  },
  ".cm-ySelectionInfo": {
    opacity: "1",
    fontFamily: "sans-serif",
    color: "black",
    padding: "3px 4px",
    fontSize: "0.8rem",
    top: "1.15em",
  },
  "& :focus .cm-ySelectionInfo": {
    zIndex: "-1",
  },
});

