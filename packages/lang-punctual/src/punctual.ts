import { haskell } from "@codemirror/legacy-modes/mode/haskell";

export const punctualLanguage = {
  ...haskell,
  name: "punctual",
  languageData: {
    ...haskell.languageData,
    closeBrackets: { brackets: ["(", "[", "{", "<", '"'], before: ')]}>"' },
  },
};
