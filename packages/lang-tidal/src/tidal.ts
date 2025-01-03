import { haskell } from "@codemirror/legacy-modes/mode/haskell";

export const tidalLanguage = {
  ...haskell,
  name: "tidal",
  languageData: {
    ...haskell.languageData,
    closeBrackets: { brackets: ["(", "[", "{", "<", '"'], before: ')]}>"' },
  },
};
