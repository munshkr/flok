import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";

const monokaiColors = {
  background: "transparent",
  foreground: "#c5c8c6",
  selection: "#4747a1",
  selectionMatch: "#4747a1",
  cursor: "#c07020",
  dropdownBackground: "#525252",
  activeLine: "#30303078",
  matchingBracket: "#303030",
  keyword: "#676867",
  storage: "#676867",
  variable: "#c7444a",
  parameter: "#6089B4",
  function: "#9872A2",
  string: "#D08442",
  constant: "#8080FF",
  type: "#9B0000",
  class: "#CE6700",
  number: "#6089B4",
  comment: "#9A9B99",
  heading: "#D0B344",
  invalid: "#FF0B00",
  regexp: "#D08442",
  tag: "#6089B4",
};

export const monokai = createTheme({
  theme: "dark",
  settings: {
    background: monokaiColors.background,
    foreground: monokaiColors.foreground,
    caret: monokaiColors.cursor,
    selection: monokaiColors.selection,
    selectionMatch: monokaiColors.selection,
    gutterBackground: monokaiColors.background,
    gutterForeground: monokaiColors.foreground,
    lineHighlight: monokaiColors.activeLine,
  },
  styles: [
    { tag: t.keyword, color: monokaiColors.keyword },
    {
      tag: [t.name, t.deleted, t.character, t.macroName],
      color: monokaiColors.variable,
    },
    { tag: [t.propertyName], color: monokaiColors.function },
    {
      tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)],
      color: monokaiColors.string,
    },
    {
      tag: [t.function(t.variableName), t.labelName],
      color: monokaiColors.function,
    },
    {
      tag: [t.color, t.constant(t.name), t.standard(t.name)],
      color: monokaiColors.constant,
    },
    { tag: [t.definition(t.name), t.separator], color: monokaiColors.variable },
    { tag: [t.className], color: monokaiColors.class },
    {
      tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
      color: monokaiColors.number,
    },
    {
      tag: [t.typeName],
      color: monokaiColors.type,
      fontStyle: monokaiColors.type,
    },
    { tag: [t.operator, t.operatorKeyword], color: monokaiColors.keyword },
    { tag: [t.url, t.escape, t.regexp, t.link], color: monokaiColors.regexp },
    { tag: [t.meta, t.comment], color: monokaiColors.comment },
    { tag: t.tagName, color: monokaiColors.tag },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.link, textDecoration: "underline" },
    { tag: t.heading, fontWeight: "bold", color: monokaiColors.heading },
    {
      tag: [t.atom, t.bool, t.special(t.variableName)],
      color: monokaiColors.variable,
    },
    { tag: t.invalid, color: monokaiColors.invalid },
    { tag: t.strikethrough, textDecoration: "line-through" },
  ],
});
